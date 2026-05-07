import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

export const Route = createFileRoute("/reset-password")({
  component: ResetPasswordPage,
});

function ResetPasswordPage() {
  const navigate = useNavigate();

  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // ✅ REQUIRED: Supabase reads token from URL hash
  useEffect(() => {
    supabase.auth
      .getSession()
      .then(({ data }) => {
        if (!data.session) {
          toast.error("Invalid or expired reset link");
          navigate({ to: "/login" });
        }
        setLoading(false);
      })
      .catch(() => {
        toast.error("Invalid reset link");
        navigate({ to: "/login" });
      });
  }, [navigate]);

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();

    if (password.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }

    if (password !== confirm) {
      toast.error("Passwords do not match");
      return;
    }

    setSaving(true);

    const { error } = await supabase.auth.updateUser({
      password,
    });

    setSaving(false);

    if (error) {
      toast.error(error.message);
      return;
    }

    toast.success("Password updated successfully");
    navigate({ to: "/login" });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-muted-foreground">
        Verifying reset link…
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="w-full max-w-md space-y-6 rounded-xl border bg-card p-8">
        <h1 className="text-2xl font-bold">Reset Password</h1>

        <form onSubmit={handleReset} className="space-y-4">
          <div className="space-y-2">
            <Label>New password</Label>
            <Input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label>Confirm password</Label>
            <Input
              type="password"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
            />
          </div>

          <Button className="w-full" disabled={saving}>
            {saving ? "Updating…" : "Update password"}
          </Button>
        </form>
      </div>
    </div>
  );
}
