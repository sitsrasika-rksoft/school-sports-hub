import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth-context";
import { Users, Trophy, CalendarDays, Megaphone } from "lucide-react";

export const Route = createFileRoute("/dashboard")({
  component: () => (
    <ProtectedRoute>
      <Dashboard />
    </ProtectedRoute>
  ),
});

interface Stats {
  students: number;
  teams: number;
  upcomingEvents: number;
  announcements: number;
}

function Dashboard() {
  const { user, role } = useAuth();
  const [stats, setStats] = useState<Stats>({
    students: 0,
    teams: 0,
    upcomingEvents: 0,
    announcements: 0,
  });
  const [recentEvents, setRecentEvents] = useState<
    Array<{ id: string; title: string; starts_at: string; location: string | null }>
  >([]);
  const [recentAnnouncements, setRecentAnnouncements] = useState<
    Array<{ id: string; title: string; body: string; created_at: string }>
  >([]);

  useEffect(() => {
    (async () => {
      const nowIso = new Date().toISOString();
      const [studentsRes, teamsRes, eventsRes, annsRes, evList, annList] = await Promise.all([
        supabase.from("students").select("id", { count: "exact", head: true }),
        supabase.from("teams").select("id", { count: "exact", head: true }),
        supabase
          .from("events")
          .select("id", { count: "exact", head: true })
          .gte("starts_at", nowIso),
        supabase.from("announcements").select("id", { count: "exact", head: true }),
        supabase
          .from("events")
          .select("id,title,starts_at,location")
          .gte("starts_at", nowIso)
          .order("starts_at", { ascending: true })
          .limit(5),
        supabase
          .from("announcements")
          .select("id,title,body,created_at")
          .order("created_at", { ascending: false })
          .limit(3),
      ]);
      setStats({
        students: studentsRes.count ?? 0,
        teams: teamsRes.count ?? 0,
        upcomingEvents: eventsRes.count ?? 0,
        announcements: annsRes.count ?? 0,
      });
      setRecentEvents(evList.data ?? []);
      setRecentAnnouncements(annList.data ?? []);
    })();
  }, []);

  const cards = [
    { label: "Students", value: stats.students, icon: Users, to: "/students", grad: "var(--gradient-primary)" },
    { label: "Teams", value: stats.teams, icon: Trophy, to: "/teams", grad: "var(--gradient-accent)" },
    { label: "Upcoming events", value: stats.upcomingEvents, icon: CalendarDays, to: "/events", grad: "var(--gradient-primary)" },
    { label: "Announcements", value: stats.announcements, icon: Megaphone, to: "/announcements", grad: "var(--gradient-accent)" },
  ];

  return (
    <div className="space-y-8 max-w-7xl">
      <div>
        <p className="text-sm text-muted-foreground">
          Signed in as <span className="capitalize font-medium text-foreground">{role}</span>
        </p>
        <h1 className="text-3xl font-bold tracking-tight">
          Welcome back{user?.email ? `, ${user.email.split("@")[0]}` : ""}
        </h1>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {cards.map((c) => (
          <Link
            key={c.label}
            to={c.to}
            className="group p-5 rounded-xl bg-card border border-border hover:border-primary/40 transition-all"
            style={{ boxShadow: "var(--shadow-card)" }}
          >
            <div className="flex items-start justify-between mb-3">
              <div
                className="h-10 w-10 rounded-lg flex items-center justify-center"
                style={{ background: c.grad }}
              >
                <c.icon className="h-5 w-5 text-primary-foreground" />
              </div>
            </div>
            <div className="text-3xl font-bold">{c.value}</div>
            <div className="text-sm text-muted-foreground mt-1">{c.label}</div>
          </Link>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <div
          className="p-6 rounded-xl bg-card border border-border"
          style={{ boxShadow: "var(--shadow-card)" }}
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold">Upcoming events</h2>
            <Link to="/events" className="text-xs text-primary hover:underline">
              View all
            </Link>
          </div>
          {recentEvents.length === 0 ? (
            <p className="text-sm text-muted-foreground py-8 text-center">
              No upcoming events scheduled.
            </p>
          ) : (
            <ul className="space-y-3">
              {recentEvents.map((e) => (
                <li
                  key={e.id}
                  className="flex items-start gap-3 p-3 rounded-lg bg-secondary/50"
                >
                  <div className="h-10 w-10 rounded-md bg-primary/10 text-primary flex flex-col items-center justify-center text-[10px] font-semibold">
                    <span>
                      {new Date(e.starts_at).toLocaleString("en", { month: "short" }).toUpperCase()}
                    </span>
                    <span className="text-base leading-none font-bold text-foreground">
                      {new Date(e.starts_at).getDate()}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-medium truncate">{e.title}</div>
                    <div className="text-xs text-muted-foreground">
                      {new Date(e.starts_at).toLocaleString("en", {
                        hour: "numeric",
                        minute: "2-digit",
                      })}
                      {e.location ? ` · ${e.location}` : ""}
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div
          className="p-6 rounded-xl bg-card border border-border"
          style={{ boxShadow: "var(--shadow-card)" }}
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold">Latest announcements</h2>
            <Link to="/announcements" className="text-xs text-primary hover:underline">
              View all
            </Link>
          </div>
          {recentAnnouncements.length === 0 ? (
            <p className="text-sm text-muted-foreground py-8 text-center">
              No announcements yet.
            </p>
          ) : (
            <ul className="space-y-3">
              {recentAnnouncements.map((a) => (
                <li key={a.id} className="p-3 rounded-lg bg-secondary/50">
                  <div className="font-medium">{a.title}</div>
                  <p className="text-sm text-muted-foreground line-clamp-2 mt-1">{a.body}</p>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
