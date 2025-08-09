
import { useState } from "react";
import Navigation from "@/components/Navigation";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";

const Upgrade = () => {
  const { toast } = useToast();
  const [loadingPlan, setLoadingPlan] = useState<"monthly" | "yearly" | null>(null);
  const SLUGS: Record<"monthly" | "yearly", string> = {
    monthly: "og72wqvcc3",
    yearly: "j29r94atfo",
  };

  const startCheckout = async (plan: "monthly" | "yearly") => {
    setLoadingPlan(plan);
    try {
      const url = `https://paystack.shop/pay/${SLUGS[plan]}`;
      window.open(url, "_blank");
      toast({ title: "Redirected to Paystack", description: "Complete payment, then click Sync." });
    } finally {
      setLoadingPlan(null);
    }
  };

  const syncSubscription = async () => {
    const { data, error } = await supabase.functions.invoke("paystack-sync");
    if (error || !data?.success) {
      console.error("paystack-sync error:", error, data);
      toast({ title: "Sync failed", description: "We couldn't confirm your subscription yet.", variant: "destructive" });
      return;
    }
    toast({ title: "Subscription active", description: "Premium unlocked!" });
    window.location.href = "/plans";
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <div className="container mx-auto px-4 py-10 max-w-2xl">
        <Card>
          <CardHeader>
            <CardTitle>Go Premium</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <p className="text-muted-foreground">
              Unlock Premium for smarter plans and more features. Launch offer pricing:
            </p>
            <div className="flex flex-col sm:flex-row gap-3">
              <Button
                className="flex-1"
                onClick={() => startCheckout("monthly")}
                disabled={loadingPlan !== null}
              >
                {loadingPlan === "monthly" && (
                  <span className="h-4 w-4 mr-2 animate-spin rounded-full border-2 border-white border-t-transparent" />
                )}
                Go Premium – R9/month
              </Button>
              <Button
                className="flex-1"
                variant="outline"
                onClick={() => startCheckout("yearly")}
                disabled={loadingPlan !== null}
              >
                {loadingPlan === "yearly" && (
                  <span className="h-4 w-4 mr-2 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                )}
                Go Premium – R90/year
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">
              You’ll be redirected to Paystack to complete your payment securely.
            </p>
            <div className="pt-2">
              <Button variant="outline" onClick={syncSubscription}>Already paid? Sync subscription</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Upgrade;
