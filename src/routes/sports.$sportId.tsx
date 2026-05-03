import { createFileRoute, useParams } from "@tanstack/react-router";
import { useEffect, useState, type FormEvent } from "react";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth-context";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/sports/$sportId")({
  component: () => (
    <ProtectedRoute>
      <SportDetail />
    </ProtectedRoute>
  ),
});

interface Sport {
  id: string;
  name: string;
  description: string | null;
  vision: string | null;
  mission: string | null;
}
interface Task {
  id: string;
  title: string;
  description: string | null;
  status: "todo" | "in_progress" | "done";
  due_date: string | null;
}
interface SportEvent {
  id: string;
  title: string;
  description: string | null;
  location: string | null;
  starts_at: string;
}
interface Report {
  id: string;
  period: string;
  summary: string | null;
  created_at: string;
}
interface Member {
  id: string;
  user_id: string;
  role: "lead" | "member";
}
interface Profile {
  id: string;
  full_name: string;
}

function SportDetail() {
  const { sportId } = useParams({ from: "/sports/$sportId" });
  const { isAdmin, user, mySportIds } = useAuth();
  const [sport, setSport] = useState<Sport | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [events, setEvents] = useState<SportEvent[]>([]);
  const [reports, setReports] = useState<Report[]>([]);
  const [members, setMembers] = useState<Member[]>([]);
  const [profiles, setProfiles] = useState<Record<string, string>>({});

  const canEdit = isAdmin || mySportIds.includes(sportId);

  const loadAll = async () => {
    const [sRes, tRes, eRes, rRes, mRes, pRes] = await Promise.all([
      supabase.from("sports").select("*").eq("id", sportId).maybeSingle(),
      supabase.from("tasks").select("*").eq("sport_id", sportId).order("created_at", { ascending: false }),
      supabase.from("sport_events").select("*").eq("sport_id", sportId).order("starts_at"),
      supabase.from("progress_reports").select("*").eq("sport_id", sportId).order("created_at", { ascending: false }),
      supabase.from("sport_members").select("*").eq("sport_id", sportId),
      supabase.from("profiles").select("id,full_name"),
    ]);
    if (sRes.data) setSport(sRes.data as Sport);
    setTasks((tRes.data ?? []) as Task[]);
    setEvents((eRes.data ?? []) as SportEvent[]);
    setReports((rRes.data ?? []) as Report[]);
    setMembers((mRes.data ?? []) as Member[]);
    const map: Record<string, string> = {};
    (pRes.data ?? []).forEach((p: Profile) => (map[p.id] = p.full_name));
    setProfiles(map);
  };

  useEffect(() => {
    loadAll();
    const ch = supabase
      .channel(`sport-${sportId}`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "tasks", filter: `sport_id=eq.${sportId}` },
        () => loadAll(),
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "sport_events", filter: `sport_id=eq.${sportId}` },
        () => loadAll(),
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "progress_reports", filter: `sport_id=eq.${sportId}` },
        () => loadAll(),
      )
      .subscribe();
    return () => {
      supabase.removeChannel(ch);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sportId]);

  if (!sport) {
    return (
      <div className="text-muted-foreground">Loading sport…</div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">{sport.name}</h1>
        {sport.description && (
          <p className="text-muted-foreground mt-1">{sport.description}</p>
        )}
      </div>

      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="flex-wrap h-auto">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="tasks">Tasks</TabsTrigger>
          <TabsTrigger value="events">Events</TabsTrigger>
          <TabsTrigger value="progress">Progress</TabsTrigger>
          <TabsTrigger value="members">Members</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="mt-4">
          <OverviewTab sport={sport} canEdit={canEdit} onSaved={loadAll} />
        </TabsContent>

        <TabsContent value="tasks" className="mt-4">
          <TasksTab
            sportId={sportId}
            tasks={tasks}
            canEdit={canEdit}
            userId={user?.id ?? null}
            onChanged={loadAll}
          />
        </TabsContent>

        <TabsContent value="events" className="mt-4">
          <EventsTab
            sportId={sportId}
            events={events}
            canEdit={canEdit}
            userId={user?.id ?? null}
            onChanged={loadAll}
          />
        </TabsContent>

        <TabsContent value="progress" className="mt-4">
          <ReportsTab
            sportId={sportId}
            reports={reports}
            canEdit={canEdit}
            userId={user?.id ?? null}
            onChanged={loadAll}
          />
        </TabsContent>

        <TabsContent value="members" className="mt-4">
          <MembersTab members={members} profiles={profiles} />
        </TabsContent>
      </Tabs>
    </div>
  );
}

function OverviewTab({
  sport,
  canEdit,
  onSaved,
}: {
  sport: Sport;
  canEdit: boolean;
  onSaved: () => void;
}) {
  const [vision, setVision] = useState(sport.vision ?? "");
  const [mission, setMission] = useState(sport.mission ?? "");
  const [saving, setSaving] = useState(false);

  const save = async () => {
    setSaving(true);
    const { error } = await supabase
      .from("sports")
      .update({ vision, mission })
      .eq("id", sport.id);
    setSaving(false);
    if (error) return toast.error(error.message);
    toast.success("Saved");
    onSaved();
  };

  return (
    <div className="grid md:grid-cols-2 gap-4">
      <Card>
        <CardHeader>
          <CardTitle>Vision</CardTitle>
        </CardHeader>
        <CardContent>
          <Textarea
            rows={6}
            value={vision}
            onChange={(e) => setVision(e.target.value)}
            disabled={!canEdit}
            placeholder="Our long-term vision…"
          />
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Mission</CardTitle>
        </CardHeader>
        <CardContent>
          <Textarea
            rows={6}
            value={mission}
            onChange={(e) => setMission(e.target.value)}
            disabled={!canEdit}
            placeholder="What we will do…"
          />
        </CardContent>
      </Card>
      {canEdit && (
        <div className="md:col-span-2">
          <Button onClick={save} disabled={saving}>
            {saving ? "Saving…" : "Save changes"}
          </Button>
        </div>
      )}
    </div>
  );
}

function TasksTab({
  sportId,
  tasks,
  canEdit,
  userId,
  onChanged,
}: {
  sportId: string;
  tasks: Task[];
  canEdit: boolean;
  userId: string | null;
  onChanged: () => void;
}) {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [dueDate, setDueDate] = useState("");

  const create = async (e: FormEvent) => {
    e.preventDefault();
    const { error } = await supabase.from("tasks").insert({
      sport_id: sportId,
      title,
      description: description || null,
      due_date: dueDate || null,
      created_by: userId,
    });
    if (error) return toast.error(error.message);
    toast.success("Task created");
    setTitle("");
    setDescription("");
    setDueDate("");
    setOpen(false);
    onChanged();
  };

  const updateStatus = async (id: string, status: Task["status"]) => {
    const { error } = await supabase.from("tasks").update({ status }).eq("id", id);
    if (error) toast.error(error.message);
    else onChanged();
  };

  const remove = async (id: string) => {
    const { error } = await supabase.from("tasks").delete().eq("id", id);
    if (error) toast.error(error.message);
    else onChanged();
  };

  const grouped: Record<Task["status"], Task[]> = { todo: [], in_progress: [], done: [] };
  tasks.forEach((t) => grouped[t.status].push(t));

  return (
    <div className="space-y-4">
      {canEdit && (
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" /> New task
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create task</DialogTitle>
            </DialogHeader>
            <form onSubmit={create} className="space-y-4">
              <div className="space-y-2">
                <Label>Title</Label>
                <Input required value={title} onChange={(e) => setTitle(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>Description</Label>
                <Textarea value={description} onChange={(e) => setDescription(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>Due date</Label>
                <Input type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} />
              </div>
              <DialogFooter>
                <Button type="submit">Create</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      )}

      <div className="grid md:grid-cols-3 gap-4">
        {(["todo", "in_progress", "done"] as const).map((col) => (
          <Card key={col}>
            <CardHeader>
              <CardTitle className="capitalize text-sm">
                {col.replace("_", " ")}{" "}
                <Badge variant="secondary" className="ml-2">
                  {grouped[col].length}
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {grouped[col].length === 0 && (
                <p className="text-xs text-muted-foreground">No tasks.</p>
              )}
              {grouped[col].map((t) => (
                <div
                  key={t.id}
                  className="border border-border rounded-md p-3 bg-card space-y-2"
                >
                  <div className="font-medium text-sm">{t.title}</div>
                  {t.description && (
                    <p className="text-xs text-muted-foreground line-clamp-3">
                      {t.description}
                    </p>
                  )}
                  {t.due_date && (
                    <p className="text-xs text-muted-foreground">Due {t.due_date}</p>
                  )}
                  {canEdit && (
                    <div className="flex items-center gap-2 pt-1">
                      <Select
                        value={t.status}
                        onValueChange={(v) => updateStatus(t.id, v as Task["status"])}
                      >
                        <SelectTrigger className="h-8 text-xs">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="todo">Todo</SelectItem>
                          <SelectItem value="in_progress">In progress</SelectItem>
                          <SelectItem value="done">Done</SelectItem>
                        </SelectContent>
                      </Select>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => remove(t.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  )}
                </div>
              ))}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

function EventsTab({
  sportId,
  events,
  canEdit,
  userId,
  onChanged,
}: {
  sportId: string;
  events: SportEvent[];
  canEdit: boolean;
  userId: string | null;
  onChanged: () => void;
}) {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [location, setLocation] = useState("");
  const [startsAt, setStartsAt] = useState("");

  const create = async (e: FormEvent) => {
    e.preventDefault();
    const { error } = await supabase.from("sport_events").insert({
      sport_id: sportId,
      title,
      description: description || null,
      location: location || null,
      starts_at: new Date(startsAt).toISOString(),
      created_by: userId,
    });
    if (error) return toast.error(error.message);
    toast.success("Event scheduled");
    setTitle("");
    setDescription("");
    setLocation("");
    setStartsAt("");
    setOpen(false);
    onChanged();
  };

  const remove = async (id: string) => {
    const { error } = await supabase.from("sport_events").delete().eq("id", id);
    if (error) toast.error(error.message);
    else onChanged();
  };

  return (
    <div className="space-y-4">
      {canEdit && (
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" /> New event
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Schedule event</DialogTitle>
            </DialogHeader>
            <form onSubmit={create} className="space-y-4">
              <div className="space-y-2">
                <Label>Title</Label>
                <Input required value={title} onChange={(e) => setTitle(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>Starts at</Label>
                <Input
                  type="datetime-local"
                  required
                  value={startsAt}
                  onChange={(e) => setStartsAt(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>Location</Label>
                <Input value={location} onChange={(e) => setLocation(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>Description</Label>
                <Textarea value={description} onChange={(e) => setDescription(e.target.value)} />
              </div>
              <DialogFooter>
                <Button type="submit">Create</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      )}

      {events.length === 0 ? (
        <p className="text-sm text-muted-foreground">No events scheduled.</p>
      ) : (
        <div className="space-y-2">
          {events.map((e) => (
            <Card key={e.id}>
              <CardContent className="py-4 flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="font-medium">{e.title}</div>
                  <div className="text-xs text-muted-foreground">
                    {new Date(e.starts_at).toLocaleString()}
                    {e.location ? ` • ${e.location}` : ""}
                  </div>
                  {e.description && (
                    <p className="text-sm text-muted-foreground mt-1">{e.description}</p>
                  )}
                </div>
                {canEdit && (
                  <Button variant="ghost" size="icon" onClick={() => remove(e.id)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

function ReportsTab({
  sportId,
  reports,
  canEdit,
  userId,
  onChanged,
}: {
  sportId: string;
  reports: Report[];
  canEdit: boolean;
  userId: string | null;
  onChanged: () => void;
}) {
  const [open, setOpen] = useState(false);
  const [period, setPeriod] = useState("");
  const [summary, setSummary] = useState("");

  const create = async (e: FormEvent) => {
    e.preventDefault();
    const { error } = await supabase.from("progress_reports").insert({
      sport_id: sportId,
      period,
      summary: summary || null,
      created_by: userId,
    });
    if (error) return toast.error(error.message);
    toast.success("Report added");
    setPeriod("");
    setSummary("");
    setOpen(false);
    onChanged();
  };

  const remove = async (id: string) => {
    const { error } = await supabase.from("progress_reports").delete().eq("id", id);
    if (error) toast.error(error.message);
    else onChanged();
  };

  return (
    <div className="space-y-4">
      {canEdit && (
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" /> New report
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Progress report</DialogTitle>
            </DialogHeader>
            <form onSubmit={create} className="space-y-4">
              <div className="space-y-2">
                <Label>Period</Label>
                <Input
                  placeholder="e.g. Q1 2026 or April"
                  required
                  value={period}
                  onChange={(e) => setPeriod(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>Summary</Label>
                <Textarea
                  rows={5}
                  value={summary}
                  onChange={(e) => setSummary(e.target.value)}
                />
              </div>
              <DialogFooter>
                <Button type="submit">Save</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      )}

      {reports.length === 0 ? (
        <p className="text-sm text-muted-foreground">No reports yet.</p>
      ) : (
        <div className="space-y-2">
          {reports.map((r) => (
            <Card key={r.id}>
              <CardContent className="py-4 flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="font-medium">{r.period}</div>
                  <div className="text-xs text-muted-foreground">
                    {new Date(r.created_at).toLocaleDateString()}
                  </div>
                  {r.summary && (
                    <p className="text-sm text-muted-foreground mt-1 whitespace-pre-line">
                      {r.summary}
                    </p>
                  )}
                </div>
                {canEdit && (
                  <Button variant="ghost" size="icon" onClick={() => remove(r.id)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

function MembersTab({
  members,
  profiles,
}: {
  members: Member[];
  profiles: Record<string, string>;
}) {
  if (members.length === 0)
    return <p className="text-sm text-muted-foreground">No members assigned yet.</p>;
  return (
    <Card>
      <CardContent className="py-4">
        <ul className="divide-y divide-border">
          {members.map((m) => (
            <li key={m.id} className="py-2 flex items-center justify-between">
              <span>{profiles[m.user_id] ?? m.user_id.slice(0, 8)}</span>
              <Badge variant={m.role === "lead" ? "default" : "secondary"}>{m.role}</Badge>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}
