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

  try {
    const authHeader = req.headers.get("Authorization") ?? "";
    const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      global: { headers: { Authorization: authHeader } },
    });

    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user || !user.email) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // 1) Find Paystack customer by email
    const custRes = await fetch(`https://api.paystack.co/customer?email=${encodeURIComponent(user.email)}`, {
      headers: { Authorization: `Bearer ${PAYSTACK_SECRET_KEY}` },
    });
    const custJson = await custRes.json();
    console.log("[paystack-sync] customers list:", custJson);

    const customer = Array.isArray(custJson?.data) && custJson.data.length > 0 ? custJson.data[0] : null;
    if (!customer) {
      return new Response(JSON.stringify({ active: false, reason: "no_customer" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // 2) List subscriptions and find active one for this customer
    const subsRes = await fetch(`https://api.paystack.co/subscription?perPage=50`, {
      headers: { Authorization: `Bearer ${PAYSTACK_SECRET_KEY}` },
    });
    const subsJson = await subsRes.json();
    console.log("[paystack-sync] subscriptions list:", subsJson);

    const activeSub = (Array.isArray(subsJson?.data) ? subsJson.data : []).find((s: any) => {
      const c = s?.customer;
      const matches = c && (
        c?.customer_code === customer.customer_code ||
        c?.id === customer.id ||
        c === customer.id // sometimes API returns numeric id
      );
      return matches && s?.status === "active";
    });

    if (!activeSub) {
      return new Response(JSON.stringify({ active: false, reason: "no_active_subscription" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const interval = activeSub?.plan?.interval || "monthly"; // monthly or annually
    const planInterval = interval === "annually" ? "yearly" : interval;
    const start = new Date(activeSub?.start_date || new Date());
    const next = activeSub?.next_payment_date ? new Date(activeSub.next_payment_date) : null;

    // Update our subscriptions table
    const toISODate = (d: Date) => d.toISOString().split("T")[0];

    // Deactivate existing
    await supabase
      .from("subscriptions")
      .update({ is_active: false })
      .eq("runner_id", user.id)
      .eq("is_active", true);

    // Insert new Premium subscription
    const { error: insertErr } = await supabase
      .from("subscriptions")
      .insert({
        runner_id: user.id,
        tier: "Premium",
        start_date: toISODate(start),
        end_date: next ? toISODate(next) : null,
        is_active: true,
      });

    if (insertErr) {
      console.error("[paystack-sync] failed to insert subscription:", insertErr);
      return new Response(JSON.stringify({ error: "Failed to update subscription" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ success: true, tier: "Premium", planInterval }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e: any) {
    console.error("[paystack-sync] error:", e);
    return new Response(JSON.stringify({ error: e?.message || "Unexpected error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
