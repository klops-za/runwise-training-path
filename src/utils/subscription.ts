import { supabase } from "@/integrations/supabase/client";

export type SubscriptionCheck = {
  active: boolean;
  tier?: string | null;
  end_date?: string | null;
};

export const hasActivePremium = async (userId: string): Promise<SubscriptionCheck> => {
  try {
    const { data, error } = await supabase
      .from("subscriptions")
      .select("tier,is_active,end_date")
      .eq("runner_id", userId)
      .eq("is_active", true)
      .order("end_date", { ascending: false })
      .limit(1);

    if (error) {
      console.error("Error checking subscription:", error);
      return { active: false };
    }

    const sub = data && data.length > 0 ? data[0] : null;
    if (!sub) return { active: false };

    const isPremium = sub.tier === "Premium";
    const notExpired = !sub.end_date || new Date(sub.end_date) >= new Date();

    return { active: Boolean(sub.is_active && isPremium && notExpired), tier: sub.tier as string, end_date: sub.end_date };
  } catch (e) {
    console.error("Unexpected error checking subscription:", e);
    return { active: false };
  }
};
