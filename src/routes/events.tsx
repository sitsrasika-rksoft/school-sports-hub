import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth-context";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { Plus, Pencil, Trash2, MapPin, CalendarDays, Upload, Check, X, HelpCircle } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/events")({
  component: () => (
    <ProtectedRoute>
      <EventsPage />
    </ProtectedRoute>
  ),
});

interface EventRow {
  id: string;
  title: string;
  description: string | null;
  location: string | null;
  cover_url: string | null;
  starts_at: string;
  ends_at: string | null;
  team_id: string | null;
}

interface RsvpRow {
  event_id: string;
  user_id: string;
  status: "going" | "maybe" | "declined";
}

function toLocalInput(iso: string) {
  const d = new Date(iso);
  const tz = d.getTimezoneOffset() * 60000;
  return new Date(d.getTime() - tz).toISOString().slice(0, 16);
}

function EventsPage() {
  const { role, user } = useAuth();
  const canEdit = role === "admin" || role === "coach";
  const canDelete = role === "admin";

  const [items, setItems] = useState<EventRow[]>([]);
  const [rsvps, setRsvps] = useState<RsvpRow[]>([]);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<EventRow | null>(null);
  const [form, setForm] = useState({
    title: "",
    description: "",
    location: "",
    starts_at: "",
    ends_at: "",
    cover_url: "",
  });
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const load = async () => {
    const [{ data: ev }, { data: rs }] = await Promise.all([
      supabase.from("events").select("*").order("starts_at"),
      supabase.from("event_rsvps").select("event_id,user_id,status"),
    ]);
    setItems(ev ?? []);
    setRsvps((rs ?? []) as RsvpRow[]);
  };

  useEffect(() => {
    load();
  }, []);

  const openNew = () => {
    setEditing(null);
    setForm({
      title: "",
      description: "",
      location: "",
      starts_at: toLocalInput(new Date().toISOString()),
      ends_at: "",
      cover_url: "",
    });
    setOpen(true);
  };
  const openEdit = (e: EventRow) => {
    setEditing(e);
    setForm({
      title: e.title,
      description: e.description ?? "",
      location: e.location ?? "",
      starts_at: toLocalInput(e.starts_at),
      ends_at: e.ends_at ? toLocalInput(e.ends_at) : "",
      cover_url: e.cover_url ?? "",
    });
    setOpen(true);
  };

  const handleUpload = async (file: File) => {
    setUploading(true);
    const ext = file.name.split(".").pop();
    const path = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
    const { error } = await supabase.storage.from("event-covers").upload(path, file);
    if (error) {
      toast.error(error.message);
      setUploading(false);
      return;
    }
    const { data } = supabase.storage.from("event-covers").getPublicUrl(path);
    setForm((f) => ({ ...f, cover_url: data.publicUrl }));
    setUploading(false);
  };

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      title: form.title.trim(),
      description: form.description.trim() || null,
      location: form.location.trim() || null,
      starts_at: new Date(form.starts_at).toISOString(),
      ends_at: form.ends_at ? new Date(form.ends_at).toISOString() : null,
      cover_url: form.cover_url || null,
    };
    if (editing) {
      const { error } = await supabase.from("events").update(payload).eq("id", editing.id);
      if (error) return toast.error(error.message);
      toast.success("Event updated");
    } else {
      const { error } = await supabase.from("events").insert(payload);
      if (error) return toast.error(error.message);
      toast.success("Event created");
    }
    setOpen(false);
    load();
  };

  const remove = async (e: EventRow) => {
    if (!confirm(`Delete event "${e.title}"?`)) return;
    const { error } = await supabase.from("events").delete().eq("id", e.id);
    if (error) return toast.error(error.message);
    toast.success("Event deleted");
    load();
  };

  const setRsvp = async (eventId: string, status: "going" | "maybe" | "declined") => {
    if (!user) return;
    const { error } = await supabase
      .from("event_rsvps")
      .upsert({ event_id: eventId, user_id: user.id, status }, { onConflict: "event_id,user_id" });
    if (error) return toast.error(error.message);
    load();
  };

  const myRsvp = (eventId: string) =>
    rsvps.find((r) => r.event_id === eventId && r.user_id === user?.id)?.status;
  const goingCount = (eventId: string) =>
    rsvps.filter((r) => r.event_id === eventId && r.status === "going").length;

  const upcoming = items.filter((e) => new Date(e.starts_at) >= new Date());
  const past = items.filter((e) => new Date(e.starts_at) < new Date()).reverse();

  return (
    <div className="space-y-6 max-w-7xl">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Events</h1>
          <p className="text-muted-foreground">Fixtures, practices and competitions</p>
        </div>
        {canEdit && (
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button onClick={openNew} className="gap-2">
                <Plus className="h-4 w-4" /> New event
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{editing ? "Edit event" : "New event"}</DialogTitle>
              </DialogHeader>
              <form onSubmit={save} className="space-y-4">
                <div className="space-y-2">
                  <Label>Title *</Label>
                  <Input
                    required
                    value={form.title}
                    onChange={(e) => setForm({ ...form, title: e.target.value })}
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <Label>Starts *</Label>
                    <Input
                      type="datetime-local"
                      required
                      value={form.starts_at}
                      onChange={(e) => setForm({ ...form, starts_at: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Ends</Label>
                    <Input
                      type="datetime-local"
                      value={form.ends_at}
                      onChange={(e) => setForm({ ...form, ends_at: e.target.value })}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Location</Label>
                  <Input
                    value={form.location}
                    onChange={(e) => setForm({ ...form, location: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Description</Label>
                  <Textarea
                    value={form.description}
                    onChange={(e) => setForm({ ...form, description: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Cover image</Label>
                  <div className="flex items-center gap-3">
                    {form.cover_url && (
                      <img
                        src={form.cover_url}
                        alt=""
                        className="h-14 w-20 rounded-md object-cover bg-secondary"
                      />
                    )}
                    <input
                      ref={fileRef}
                      type="file"
                      accept="image/*"
                      hidden
                      onChange={(e) => {
                        const f = e.target.files?.[0];
                        if (f) handleUpload(f);
                      }}
                    />
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => fileRef.current?.click()}
                      disabled={uploading}
                      className="gap-2"
                    >
                      <Upload className="h-4 w-4" />
                      {uploading ? "Uploading..." : "Upload"}
                    </Button>
                  </div>
                </div>
                <DialogFooter>
                  <Button type="submit">{editing ? "Save changes" : "Create"}</Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        )}
      </div>

      <Section
        title="Upcoming"
        items={upcoming}
        emptyText="No upcoming events."
        myRsvp={myRsvp}
        goingCount={goingCount}
        onRsvp={setRsvp}
        onEdit={openEdit}
        onDelete={remove}
        canEdit={canEdit}
        canDelete={canDelete}
      />

      {past.length > 0 && (
        <Section
          title="Past"
          items={past}
          emptyText=""
          myRsvp={myRsvp}
          goingCount={goingCount}
          onRsvp={setRsvp}
          onEdit={openEdit}
          onDelete={remove}
          canEdit={canEdit}
          canDelete={canDelete}
          dim
        />
      )}
    </div>
  );
}

function Section({
  title,
  items,
  emptyText,
  myRsvp,
  goingCount,
  onRsvp,
  onEdit,
  onDelete,
  canEdit,
  canDelete,
  dim,
}: {
  title: string;
  items: EventRow[];
  emptyText: string;
  myRsvp: (id: string) => "going" | "maybe" | "declined" | undefined;
  goingCount: (id: string) => number;
  onRsvp: (id: string, s: "going" | "maybe" | "declined") => void;
  onEdit: (e: EventRow) => void;
  onDelete: (e: EventRow) => void;
  canEdit: boolean;
  canDelete: boolean;
  dim?: boolean;
}) {
  return (
    <div>
      <h2 className="text-lg font-semibold mb-3">{title}</h2>
      {items.length === 0 ? (
        emptyText && (
          <div
            className="p-12 rounded-xl bg-card border border-border text-center"
            style={{ boxShadow: "var(--shadow-card)" }}
          >
            <CalendarDays className="h-10 w-10 mx-auto text-muted-foreground mb-3" />
            <p className="text-muted-foreground">{emptyText}</p>
          </div>
        )
      ) : (
        <div className={`grid md:grid-cols-2 gap-4 ${dim ? "opacity-70" : ""}`}>
          {items.map((e) => {
            const status = myRsvp(e.id);
            return (
              <div
                key={e.id}
                className="rounded-xl bg-card border border-border overflow-hidden hover:border-primary/40 transition-all"
                style={{ boxShadow: "var(--shadow-card)" }}
              >
                {e.cover_url && (
                  <img src={e.cover_url} alt="" className="h-32 w-full object-cover" />
                )}
                <div className="p-5">
                  <div className="flex items-start gap-4">
                    <div className="h-12 w-12 rounded-lg bg-primary/10 text-primary flex flex-col items-center justify-center text-[10px] font-semibold shrink-0">
                      <span>
                        {new Date(e.starts_at)
                          .toLocaleString("en", { month: "short" })
                          .toUpperCase()}
                      </span>
                      <span className="text-base leading-none font-bold text-foreground">
                        {new Date(e.starts_at).getDate()}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold">{e.title}</h3>
                      <div className="text-xs text-muted-foreground mt-1">
                        {new Date(e.starts_at).toLocaleString("en", {
                          weekday: "short",
                          hour: "numeric",
                          minute: "2-digit",
                        })}
                      </div>
                      {e.location && (
                        <div className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                          <MapPin className="h-3 w-3" /> {e.location}
                        </div>
                      )}
                    </div>
                  </div>
                  {e.description && (
                    <p className="text-sm text-muted-foreground mt-3 line-clamp-2">
                      {e.description}
                    </p>
                  )}
                  <div className="flex items-center justify-between mt-4 pt-4 border-t border-border">
                    <div className="flex items-center gap-1">
                      <Button
                        size="sm"
                        variant={status === "going" ? "default" : "outline"}
                        onClick={() => onRsvp(e.id, "going")}
                        className="gap-1.5 h-8"
                      >
                        <Check className="h-3.5 w-3.5" /> Going
                      </Button>
                      <Button
                        size="sm"
                        variant={status === "maybe" ? "default" : "outline"}
                        onClick={() => onRsvp(e.id, "maybe")}
                        className="gap-1.5 h-8"
                      >
                        <HelpCircle className="h-3.5 w-3.5" /> Maybe
                      </Button>
                      <Button
                        size="sm"
                        variant={status === "declined" ? "default" : "outline"}
                        onClick={() => onRsvp(e.id, "declined")}
                        className="gap-1.5 h-8"
                      >
                        <X className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                    <span className="text-xs text-muted-foreground">
                      {goingCount(e.id)} going
                    </span>
                  </div>
                  {(canEdit || canDelete) && (
                    <div className="flex gap-1 mt-2">
                      {canEdit && (
                        <Button variant="ghost" size="sm" onClick={() => onEdit(e)} className="gap-1.5">
                          <Pencil className="h-3.5 w-3.5" /> Edit
                        </Button>
                      )}
                      {canDelete && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => onDelete(e)}
                          className="gap-1.5 text-destructive hover:text-destructive"
                        >
                          <Trash2 className="h-3.5 w-3.5" /> Delete
                        </Button>
                      )}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
