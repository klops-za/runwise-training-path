
import { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import Navigation from "@/components/Navigation";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const PaymentsCallback = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [status, setStatus] = useState<"idle" | "verifying" | "success" | "error">("idle");
  const [message, setMessage] = useState<string>("");

  useEffect(() => {
    const reference = searchParams.get("reference");
    if (!reference) {
      setStatus("idle");
      setMessage("No reference found. If you paid via the Paystack page, click Sync to activate.");
      return;
    }

    const verify = async () => {
      setStatus("verifying");
      console.log("Verifying Paystack transaction:", reference);
      const { data, error } = await supabase.functions.invoke("paystack-verify", {
        body: { reference },
      });

      if (error) {
        console.error("Verification error:", error);
        setStatus("error");
        setMessage("Verification failed. Please contact support if you were charged.");
        toast({
          title: "Payment verification failed",
          description: "If you were charged, please contact support.",
          variant: "destructive",
        });
        return;
      }

      console.log("Verification response:", data);
      setStatus("success");
      setMessage("Your subscription is now active. Welcome to Premium!");
      toast({
        title: "Payment successful",
        description: "Premium unlocked. Redirecting...",
      });

      setTimeout(() => navigate("/plans"), 1500);
    };

    verify();
  }, [searchParams, navigate, toast]);

  const syncSubscription = async () => {
    const { data, error } = await supabase.functions.invoke("paystack-sync");
    if (error || !data?.success) {
      console.error("paystack-sync error:", error, data);
      toast({ title: "Sync failed", description: "We couldn't confirm your subscription yet.", variant: "destructive" });
      return;
    }
    toast({ title: "Subscription active", description: "Premium unlocked!" });
    setTimeout(() => navigate("/plans"), 800);
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <div className="container mx-auto px-4 py-10 max-w-2xl">
        <Card>
          <CardHeader>
            <CardTitle>Payment Status</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {status === "verifying" && (
              <div className="flex items-center gap-3">
                <div className="h-5 w-5 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                <p className="text-muted-foreground">Verifying your payment...</p>
              </div>
            )}
            {status === "idle" && (
              <div className="space-y-3">
                <p className="text-muted-foreground">{message}</p>
                <div className="flex gap-2">
                  <Button onClick={syncSubscription}>Sync subscription</Button>
                  <Button variant="outline" onClick={() => navigate("/")}>Back Home</Button>
                </div>
              </div>
            )}
            {status === "success" && (
              <>
                <p className="text-foreground">{message}</p>
                <Button onClick={() => navigate("/plans")}>Go to Plans</Button>
              </>
            )}
            {status === "error" && (
              <>
                <p className="text-destructive">{message}</p>
                <div className="flex gap-2">
                  <Button variant="outline" onClick={() => navigate("/")}>Back Home</Button>
                  <Button onClick={() => navigate("/upgrade")}>Try Again</Button>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default PaymentsCallback;
