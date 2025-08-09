import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { Loader2 } from "lucide-react";

const ResetPassword = () => {
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [canReset, setCanReset] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    document.title = "Reset Password | RunWise";

    // Check if we have a valid session from the recovery link
    supabase.auth.getSession().then(({ data: { session } }) => {
      setCanReset(!!session);
    });

    // Also listen for recovery event just in case it arrives after mount
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === "PASSWORD_RECOVERY") {
        setCanReset(true);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!password || !confirm) {
      toast({ title: "Missing fields", description: "Enter and confirm your new password." });
      return;
    }
    if (password !== confirm) {
      toast({ title: "Passwords don't match", description: "Please re-enter matching passwords.", variant: "destructive" });
      return;
    }

    setSubmitting(true);
    const { error } = await supabase.auth.updateUser({ password });
    setSubmitting(false);

    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
      return;
    }

    toast({ title: "Password updated", description: "You are now signed in." });
    navigate("/", { replace: true });
  };

  return (
    <main className="container mx-auto max-w-md p-6">
      <section>
        <Card>
          <CardHeader>
            <CardTitle>Reset your password</CardTitle>
            <CardDescription>Enter a new password for your account.</CardDescription>
          </CardHeader>
          <CardContent>
            {canReset ? (
              <form onSubmit={handleUpdate} className="space-y-4">
                <div>
                  <Label htmlFor="password">New password</Label>
                  <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={6} />
                </div>
                <div>
                  <Label htmlFor="confirm">Confirm new password</Label>
                  <Input id="confirm" type="password" value={confirm} onChange={(e) => setConfirm(e.target.value)} required minLength={6} />
                </div>
                <Button type="submit" className="w-full" disabled={submitting}>
                  {submitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                  Update password
                </Button>
              </form>
            ) : (
              <div className="text-sm">
                <p className="mb-4">This link is invalid or expired. Please request a new password reset from the sign in page.</p>
                <Button onClick={() => navigate("/", { replace: true })}>Back to sign in</Button>
              </div>
            )}
          </CardContent>
          <CardFooter />
        </Card>
      </section>
    </main>
  );
};

export default ResetPassword;
