
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const PAYSTACK_SECRET_KEY = Deno.env.get("PAYSTACK_SECRET_KEY");
const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY")!;

// Callback URL - update this when you set up your custom domain
const CALLBACK_URL = "https://mybestrunning.lovable.app/payments/callback";

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  if (!PAYSTACK_SECRET_KEY) {
    return new Response(JSON.stringify({ error: "Missing PAYSTACK_SECRET_KEY" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  try {
    const authHeader = req.headers.get("Authorization") ?? "";
    const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      global: { headers: { Authorization: authHeader } },
    });

    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const body = await req.json().catch(() => ({}));
    const plan = body?.plan as "monthly" | "yearly" | undefined;

    // Validate plan parameter
    if (!plan || !["monthly", "yearly"].includes(plan)) {
      return new Response(JSON.stringify({ error: "Invalid or missing plan: must be 'monthly' or 'yearly'" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Validate user email format
    if (!user.email) {
      return new Response(JSON.stringify({ error: "User email not available" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(user.email)) {
      return new Response(JSON.stringify({ error: "Invalid user email format" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Launch offer prices (subunits). Using ZAR (amount in cents)
    const amountCents = plan === "monthly" ? 900 : 9000; // R9 or R90 for testing

    const payload = {
      email: user.email,
      amount: amountCents,
      currency: "ZAR",
      callback_url: CALLBACK_URL,
      metadata: {
        planInterval: plan,
        launch: true,
        runner_id: user.id,
      },
    };

    console.log("Initializing Paystack transaction:", payload);

    const response = await fetch("https://api.paystack.co/transaction/initialize", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    const result = await response.json();
    console.log("Paystack init response:", result);

    if (!response.ok || !result?.data?.authorization_url) {
      return new Response(JSON.stringify({ error: "Failed to initialize transaction", details: result }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({
      authorization_url: result.data.authorization_url,
      reference: result.data.reference,
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e: any) {
    console.error("paystack-init error:", e);
    return new Response(JSON.stringify({ error: e?.message || "Unexpected error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
