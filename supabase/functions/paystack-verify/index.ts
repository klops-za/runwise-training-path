
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
    const reference = body?.reference as string | undefined;
    if (!reference) {
      return new Response(JSON.stringify({ error: "Missing reference" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    console.log("Verifying Paystack reference:", reference);

    const verifyRes = await fetch(`https://api.paystack.co/transaction/verify/${reference}`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`,
        "Content-Type": "application/json",
      },
    });

    const verifyData = await verifyRes.json();
    console.log("Paystack verify response:", verifyData);

    if (!verifyRes.ok || verifyData?.data?.status !== "success") {
      return new Response(JSON.stringify({ error: "Verification failed", details: verifyData }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const metadata = verifyData?.data?.metadata || {};
    const planInterval = (metadata?.planInterval as "monthly" | "yearly") || "monthly";

    // Compute subscription dates
    const now = new Date();
    const start = new Date(now);
    const end = new Date(now);
    if (planInterval === "yearly") {
      end.setFullYear(end.getFullYear() + 1);
    } else {
      // default monthly
      end.setMonth(end.getMonth() + 1);
    }
    const toISODate = (d: Date) => d.toISOString().split("T")[0];

    // Deactivate existing active subscriptions
    const { error: updateErr } = await supabase
      .from("subscriptions")
      .update({ is_active: false })
      .eq("runner_id", user.id)
      .eq("is_active", true);

    if (updateErr) {
      console.error("Failed to deactivate existing subs:", updateErr);
      // Continue anyway to try inserting the new one
    }

    // Insert new Premium subscription
    const { error: insertErr } = await supabase
      .from("subscriptions")
      .insert({
        runner_id: user.id,
        tier: "Premium",
        start_date: toISODate(start),
        end_date: toISODate(end),
        is_active: true,
      });

    if (insertErr) {
      console.error("Failed to insert subscription:", insertErr);
      return new Response(JSON.stringify({ error: "Failed to activate subscription" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ success: true, tier: "Premium", planInterval }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e: any) {
    console.error("paystack-verify error:", e);
    return new Response(JSON.stringify({ error: e?.message || "Unexpected error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
