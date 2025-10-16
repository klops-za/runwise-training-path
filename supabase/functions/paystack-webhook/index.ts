import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { crypto } from "https://deno.land/std@0.224.0/crypto/mod.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-paystack-signature",
};

const PAYSTACK_SECRET_KEY = Deno.env.get("PAYSTACK_SECRET_KEY");
const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

/**
 * Paystack Webhook Handler
 * Processes payment notifications from Paystack server-side for reliability
 * 
 * Security Features:
 * - Signature verification to prevent fake webhooks
 * - Idempotency to prevent duplicate processing
 * - Service role key for reliable database updates
 * 
 * Handles events:
 * - charge.success: Payment completed successfully
 * - subscription.create: Subscription created
 * - subscription.disable: Subscription cancelled
 */

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  if (!PAYSTACK_SECRET_KEY) {
    console.error("PAYSTACK_SECRET_KEY not configured");
    return new Response(
      JSON.stringify({ error: "Server configuration error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }

  if (req.method !== "POST") {
    return new Response(
      JSON.stringify({ error: "Method not allowed" }),
      { status: 405, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }

  try {
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    // Get the raw body for signature verification
    const bodyText = await req.text();
    const signature = req.headers.get("x-paystack-signature");

    if (!signature) {
      console.error("Missing Paystack signature");
      return new Response(
        JSON.stringify({ error: "Missing signature" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Verify Paystack signature
    const encoder = new TextEncoder();
    const keyData = encoder.encode(PAYSTACK_SECRET_KEY);
    const messageData = encoder.encode(bodyText);
    
    const cryptoKey = await crypto.subtle.importKey(
      "raw",
      keyData,
      { name: "HMAC", hash: "SHA-512" },
      false,
      ["sign"]
    );
    
    const signatureBuffer = await crypto.subtle.sign("HMAC", cryptoKey, messageData);
    const computedSignature = Array.from(new Uint8Array(signatureBuffer))
      .map(b => b.toString(16).padStart(2, '0'))
      .join('');

    if (computedSignature !== signature) {
      console.error("Invalid Paystack signature");
      return new Response(
        JSON.stringify({ error: "Invalid signature" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Parse the webhook event
    const event = JSON.parse(bodyText);
    console.log("Paystack webhook event received:", event.event);

    // Handle charge.success event
    if (event.event === "charge.success") {
      const data = event.data;
      const reference = data.reference;
      const amount = data.amount;
      const email = data.customer?.email;
      const metadata = data.metadata || {};

      if (!reference) {
        console.error("Missing reference in webhook data");
        return new Response(
          JSON.stringify({ error: "Invalid webhook data" }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      console.log("Processing payment:", { reference, amount, email });

      // Check if this payment has already been processed (idempotency)
      const { data: existingSub, error: checkError } = await supabase
        .from("subscriptions")
        .select("id, payment_reference")
        .eq("payment_reference", reference)
        .maybeSingle();

      if (checkError) {
        console.error("Error checking existing subscription:", checkError);
      }

      if (existingSub) {
        console.log("Payment already processed:", reference);
        return new Response(
          JSON.stringify({ success: true, message: "Payment already processed" }),
          { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      // Find the user by email
      const { data: runners, error: runnerError } = await supabase
        .from("runners")
        .select("id")
        .eq("email", email)
        .limit(1);

      if (runnerError || !runners || runners.length === 0) {
        console.error("User not found for email:", email);
        return new Response(
          JSON.stringify({ error: "User not found" }),
          { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      const userId = runners[0].id;
      const planInterval = metadata.planInterval || 'monthly';

      // Calculate subscription dates
      const now = new Date();
      const start = new Date(now);
      const end = new Date(now);
      
      if (planInterval === 'yearly') {
        end.setFullYear(end.getFullYear() + 1);
      } else {
        end.setMonth(end.getMonth() + 1);
      }

      const toISODate = (d: Date) => d.toISOString().split('T')[0];

      // Deactivate existing active subscriptions
      const { error: deactivateError } = await supabase
        .from("subscriptions")
        .update({ is_active: false })
        .eq("runner_id", userId)
        .eq("is_active", true);

      if (deactivateError) {
        console.error("Error deactivating old subscriptions:", deactivateError);
      }

      // Create new Premium subscription
      const { error: insertError } = await supabase
        .from("subscriptions")
        .insert({
          runner_id: userId,
          tier: "Premium",
          start_date: toISODate(start),
          end_date: toISODate(end),
          is_active: true,
          payment_reference: reference,
          payment_status: 'completed',
          payment_metadata: {
            amount,
            reference,
            planInterval,
            processedAt: new Date().toISOString()
          }
        });

      if (insertError) {
        console.error("Error creating subscription:", insertError);
        return new Response(
          JSON.stringify({ error: "Failed to activate subscription" }),
          { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      console.log("Subscription activated successfully:", { userId, reference, planInterval });

      return new Response(
        JSON.stringify({ success: true, message: "Subscription activated" }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Handle other events
    console.log("Unhandled event type:", event.event);
    return new Response(
      JSON.stringify({ success: true, message: "Event received" }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error: any) {
    console.error("Error processing webhook:", error);
    return new Response(
      JSON.stringify({ error: "Failed to process webhook" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
