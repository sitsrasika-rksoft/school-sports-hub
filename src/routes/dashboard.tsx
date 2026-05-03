import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth-context";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Trophy, ListChecks, CalendarDays, Users } from "lucide-react";

export const Route = createFileRoute("/dashboard")({
  component: () => (
    <ProtectedRoute>
      <Dashboard />
    </ProtectedRoute>
  ),
});

interface Stats {
  sports: number;
  tasks: number;
  openTasks: number;
  upcomingEvents: number;
  members: number;
}

function Dashboard() {
  const { isAdmin, mySportIds, user } = useAuth();
  const [stats, setStats] = useState<Stats>({
    sports: 0,
    tasks: 0,
    openTasks: 0,
    upcomingEvents: 0,
    members: 0,
  });
  const [upcoming, setUpcoming] = useState<
    { id: string; title: string; starts_at: string; sport_id: string }[]
  >([]);

  useEffect(() => {
    const load = async () => {
      const nowIso = new Date().toISOString();
      const [sportsRes, tasksRes, openTasksRes, eventsRes, membersRes, upRes] =
        await Promise.all([
          supabase.from("sports").select("id", { count: "exact", head: true }),
          supabase.from("tasks").select("id", { count: "exact", head: true }),
          supabase
            .from("tasks")
            .select("id", { count: "exact", head: true })
            .neq("status", "done"),
          supabase
            .from("sport_events")
            .select("id", { count: "exact", head: true })
            .gte("starts_at", nowIso),
          isAdmin
            ? supabase.from("user_roles").select("id", { count: "exact", head: true })
            : Promise.resolve({ count: 0 }),
          supabase
            .from("sport_events")
            .select("id,title,starts_at,sport_id")
            .gte("starts_at", nowIso)
            .order("starts_at", { ascending: true })
            .limit(5),
        ]);
      setStats({
        sports: sportsRes.count ?? 0,
        tasks: tasksRes.count ?? 0,
        openTasks: openTasksRes.count ?? 0,
        upcomingEvents: eventsRes.count ?? 0,
        members: (membersRes as { count: number | null }).count ?? 0,
      });
      setUpcoming(upRes.data ?? []);
    };
    if (user) load();
  }, [user, isAdmin]);

  const cards = [
    { label: isAdmin ? "Sports" : "My Sports", value: isAdmin ? stats.sports : mySportIds.length, icon: Trophy },
    { label: "Open tasks", value: stats.openTasks, icon: ListChecks },
    { label: "Upcoming events", value: stats.upcomingEvents, icon: CalendarDays },
    ...(isAdmin ? [{ label: "Users", value: stats.members, icon: Users }] : []),
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">{isAdmin ? "Admin Dashboard" : "Dashboard"}</h1>
        <p className="text-muted-foreground mt-1">
          {isAdmin
            ? "Overview of all sports, tasks and events."
            : "Your sports, tasks and upcoming events."}
        </p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {cards.map((c) => (
          <Card key={c.label}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {c.label}
              </CardTitle>
              <c.icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{c.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Upcoming events</CardTitle>
        </CardHeader>
        <CardContent>
          {upcoming.length === 0 ? (
            <p className="text-sm text-muted-foreground">No upcoming events.</p>
          ) : (
            <ul className="divide-y divide-border">
              {upcoming.map((e) => (
                <li key={e.id} className="py-3 flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <Link
                      to="/sports/$sportId"
                      params={{ sportId: e.sport_id }}
                      className="font-medium hover:underline truncate block"
                    >
                      {e.title}
                    </Link>
                    <p className="text-xs text-muted-foreground">
                      {new Date(e.starts_at).toLocaleString()}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
