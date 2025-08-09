
import { useState } from "react";
import Navigation from "@/components/Navigation";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";

const Upgrade = () => {
  const { toast } = useToast();
  const [loadingPlan, setLoadingPlan] = useState<"monthly" | "yearly" | null>(null);

  const startCheckout = async (plan: "monthly" | "yearly") => {
    setLoadingPlan(plan);
    console.log("Starting checkout:", plan);
    const { data, error } = await supabase.functions.invoke("paystack-init", {
      body: { plan },
    });

    setLoadingPlan(null);

    if (error || !data?.authorization_url) {
      console.error("paystack-init error:", error);
      toast({
        title: "Checkout failed",
        description: "Unable to start payment. Please try again.",
        variant: "destructive",
      });
      return;
    }

    // Redirect to Paystack hosted page
    window.location.href = data.authorization_url;
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
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Upgrade;
