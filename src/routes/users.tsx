import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ShieldCheck } from "lucide-react";
import { toast } from "sonner";
import type { AppRole } from "@/lib/auth-context";

export const Route = createFileRoute("/users")({
  component: () => (
    <ProtectedRoute roles={["admin"]}>
      <UsersPage />
    </ProtectedRoute>
  ),
});

interface Profile {
  id: string;
  full_name: string;
  role: AppRole;
}

function UsersPage() {
  const [users, setUsers] = useState<Profile[]>([]);

  const load = async () => {
    const [{ data: profiles }, { data: roles }] = await Promise.all([
      supabase.from("profiles").select("id,full_name").order("full_name"),
      supabase.from("user_roles").select("user_id,role"),
    ]);
    const order: AppRole[] = ["admin", "coach", "student"];
    const merged: Profile[] = (profiles ?? []).map((p) => {
      const userRoles = (roles ?? []).filter((r) => r.user_id === p.id).map((r) => r.role);
      const best = order.find((r) => userRoles.includes(r)) ?? "student";
      return { id: p.id, full_name: p.full_name || "(no name)", role: best };
    });
    setUsers(merged);
  };

  useEffect(() => {
    load();
  }, []);

  const setRole = async (userId: string, newRole: AppRole) => {
    // Remove all existing roles for this user, then insert the new one
    const { error: delErr } = await supabase.from("user_roles").delete().eq("user_id", userId);
    if (delErr) return toast.error(delErr.message);
    const { error: insErr } = await supabase
      .from("user_roles")
      .insert({ user_id: userId, role: newRole });
    if (insErr) return toast.error(insErr.message);
    toast.success(`Role set to ${newRole}`);
    load();
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Users</h1>
        <p className="text-muted-foreground">Manage member roles</p>
      </div>

      <div
        className="rounded-xl bg-card border border-border overflow-hidden"
        style={{ boxShadow: "var(--shadow-card)" }}
      >
        {users.length === 0 ? (
          <div className="p-12 text-center">
            <ShieldCheck className="h-10 w-10 mx-auto text-muted-foreground mb-3" />
            <p className="text-muted-foreground">No users yet.</p>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-secondary/50">
              <tr className="text-left">
                <th className="px-4 py-3 font-medium">Name</th>
                <th className="px-4 py-3 font-medium">Role</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.id} className="border-t border-border">
                  <td className="px-4 py-3 font-medium">{u.full_name}</td>
                  <td className="px-4 py-3">
                    <span
                      className={`px-2 py-0.5 rounded-md text-xs font-medium capitalize ${
                        u.role === "admin"
                          ? "bg-primary/10 text-primary"
                          : u.role === "coach"
                          ? "bg-accent/15 text-accent"
                          : "bg-secondary text-secondary-foreground"
                      }`}
                    >
                      {u.role}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="inline-flex items-center gap-2">
                      <Select
                        value={u.role}
                        onValueChange={(v) => setRole(u.id, v as AppRole)}
                      >
                        <SelectTrigger className="w-[140px] h-9">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="student">Student</SelectItem>
                          <SelectItem value="coach">Coach</SelectItem>
                          <SelectItem value="admin">Admin</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <div className="text-xs text-muted-foreground">
        <Button variant="link" className="px-0 h-auto" onClick={load}>
          Refresh
        </Button>
      </div>
    </div>
  );
}
