import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

/**
 * Rate-limited lead creation endpoint
 * Prevents spam and abuse of lead capture form
 * 
 * Security Features:
 * - Rate limiting: 3 submissions per email per 24 hours
 * - Input validation: email format, name length, etc.
 * - Sanitization: removes HTML tags and dangerous characters
 */

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return new Response(
      JSON.stringify({ error: "Method not allowed" }),
      { status: 405, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }

  try {
    // Use service role key to bypass RLS for rate limit checking
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    // Parse and validate request body
    const body = await req.json();
    const { name, email, goal_plan } = body;

    // Validate required fields
    if (!name || !email || !goal_plan) {
      return new Response(
        JSON.stringify({ error: "Missing required fields: name, email, goal_plan" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Sanitize inputs
    const sanitizeName = (text: string): string => {
      return text
        .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
        .replace(/<[^>]+>/g, '')
        .replace(/javascript:/gi, '')
        .trim();
    };

    const sanitizedName = sanitizeName(name);
    const sanitizedEmail = email.toLowerCase().trim();
    const sanitizedGoalPlan = sanitizeName(goal_plan);

    // Validate name length
    if (sanitizedName.length < 1 || sanitizedName.length > 100) {
      return new Response(
        JSON.stringify({ error: "Name must be between 1 and 100 characters" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(sanitizedEmail)) {
      return new Response(
        JSON.stringify({ error: "Invalid email format" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (sanitizedEmail.length > 255) {
      return new Response(
        JSON.stringify({ error: "Email must be less than 255 characters" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Check rate limit: 3 submissions per email in last 24 hours
    const twentyFourHoursAgo = new Date();
    twentyFourHoursAgo.setHours(twentyFourHoursAgo.getHours() - 24);

    const { data: recentLeads, error: checkError } = await supabase
      .from("leads")
      .select("id, created_at")
      .eq("email", sanitizedEmail)
      .gte("created_at", twentyFourHoursAgo.toISOString());

    if (checkError) {
      console.error("Error checking rate limit:", checkError);
      return new Response(
        JSON.stringify({ error: "Failed to process request" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Rate limit: maximum 3 submissions per day
    if (recentLeads && recentLeads.length >= 3) {
      const oldestLead = recentLeads.sort((a, b) => 
        new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
      )[0];
      
      const resetTime = new Date(oldestLead.created_at);
      resetTime.setHours(resetTime.getHours() + 24);
      
      const hoursUntilReset = Math.ceil(
        (resetTime.getTime() - Date.now()) / (1000 * 60 * 60)
      );

      return new Response(
        JSON.stringify({ 
          error: "Rate limit exceeded. You can submit again in " + hoursUntilReset + " hours.",
          retryAfter: resetTime.toISOString()
        }),
        { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Insert the lead
    const { data: newLead, error: insertError } = await supabase
      .from("leads")
      .insert({
        name: sanitizedName,
        email: sanitizedEmail,
        goal_plan: sanitizedGoalPlan,
        source: body.source || 'free-plan'
      })
      .select()
      .single();

    if (insertError) {
      console.error("Error inserting lead:", insertError);
      return new Response(
        JSON.stringify({ error: "Failed to save lead" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log("Lead created successfully:", { id: newLead.id, email: sanitizedEmail });

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: "Thank you! Your free plan will be sent to your email.",
        leadId: newLead.id
      }),
      { status: 201, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error: any) {
    console.error("Unexpected error in create-lead:", error);
    return new Response(
      JSON.stringify({ error: "An unexpected error occurred" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
