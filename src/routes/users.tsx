import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Trash2 } from "lucide-react";
import { toast } from "sonner";

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
}
interface RoleRow {
  user_id: string;
  role: "admin" | "user";
}
interface Sport {
  id: string;
  name: string;
}
interface Membership {
  id: string;
  sport_id: string;
  user_id: string;
  role: "lead" | "member";
}

function UsersPage() {
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [roles, setRoles] = useState<RoleRow[]>([]);
  const [sports, setSports] = useState<Sport[]>([]);
  const [memberships, setMemberships] = useState<Membership[]>([]);

  const load = async () => {
    const [p, r, s, m] = await Promise.all([
      supabase.from("profiles").select("id,full_name").order("full_name"),
      supabase.from("user_roles").select("user_id,role"),
      supabase.from("sports").select("id,name").order("name"),
      supabase.from("sport_members").select("*"),
    ]);
    setProfiles((p.data ?? []) as Profile[]);
    setRoles((r.data ?? []) as RoleRow[]);
    setSports((s.data ?? []) as Sport[]);
    setMemberships((m.data ?? []) as Membership[]);
  };

  useEffect(() => {
    load();
  }, []);

  const setRole = async (userId: string, role: "admin" | "user") => {
    await supabase.from("user_roles").delete().eq("user_id", userId);
    const { error } = await supabase.from("user_roles").insert({ user_id: userId, role });
    if (error) toast.error(error.message);
    else {
      toast.success("Role updated");
      load();
    }
  };

  const assign = async (userId: string, sportId: string, role: "lead" | "member") => {
    const { error } = await supabase
      .from("sport_members")
      .insert({ user_id: userId, sport_id: sportId, role });
    if (error) toast.error(error.message);
    else load();
  };

  const unassign = async (id: string) => {
    const { error } = await supabase.from("sport_members").delete().eq("id", id);
    if (error) toast.error(error.message);
    else load();
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Users & Assignments</h1>
        <p className="text-muted-foreground mt-1">
          Manage roles and assign users to sports.
        </p>
      </div>

      <div className="space-y-4">
        {profiles.map((p) => {
          const userRole = roles.find((r) => r.user_id === p.id)?.role ?? "user";
          const myMems = memberships.filter((m) => m.user_id === p.id);
          const availSports = sports.filter((s) => !myMems.some((m) => m.sport_id === s.id));
          return (
            <Card key={p.id}>
              <CardHeader className="flex flex-row items-center justify-between gap-3 flex-wrap">
                <CardTitle className="text-base">
                  {p.full_name}{" "}
                  <Badge variant={userRole === "admin" ? "default" : "secondary"} className="ml-2">
                    {userRole}
                  </Badge>
                </CardTitle>
                <Select value={userRole} onValueChange={(v) => setRole(p.id, v as "admin" | "user")}>
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="user">User</SelectItem>
                    <SelectItem value="admin">Admin</SelectItem>
                  </SelectContent>
                </Select>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <div className="text-xs font-medium text-muted-foreground mb-2">
                    Sport assignments
                  </div>
                  {myMems.length === 0 ? (
                    <p className="text-sm text-muted-foreground">No sports assigned.</p>
                  ) : (
                    <div className="flex flex-wrap gap-2">
                      {myMems.map((m) => {
                        const sport = sports.find((s) => s.id === m.sport_id);
                        return (
                          <span
                            key={m.id}
                            className="inline-flex items-center gap-2 bg-secondary text-secondary-foreground rounded-full px-3 py-1 text-xs"
                          >
                            {sport?.name ?? "—"} ({m.role})
                            <button onClick={() => unassign(m.id)} className="hover:text-destructive">
                              <Trash2 className="h-3 w-3" />
                            </button>
                          </span>
                        );
                      })}
                    </div>
                  )}
                </div>
                {availSports.length > 0 && (
                  <AssignForm
                    sports={availSports}
                    onAssign={(sportId, role) => assign(p.id, sportId, role)}
                  />
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}

function AssignForm({
  sports,
  onAssign,
}: {
  sports: Sport[];
  onAssign: (sportId: string, role: "lead" | "member") => void;
}) {
  const [sportId, setSportId] = useState("");
  const [role, setRole] = useState<"lead" | "member">("member");
  return (
    <div className="flex items-center gap-2 flex-wrap">
      <Select value={sportId} onValueChange={setSportId}>
        <SelectTrigger className="w-48">
          <SelectValue placeholder="Select sport" />
        </SelectTrigger>
        <SelectContent>
          {sports.map((s) => (
            <SelectItem key={s.id} value={s.id}>
              {s.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Select value={role} onValueChange={(v) => setRole(v as "lead" | "member")}>
        <SelectTrigger className="w-32">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="member">Member</SelectItem>
          <SelectItem value="lead">Lead</SelectItem>
        </SelectContent>
      </Select>
      <Button
        size="sm"
        disabled={!sportId}
        onClick={() => {
          onAssign(sportId, role);
          setSportId("");
        }}
      >
        Assign
      </Button>
    </div>
  );
}
