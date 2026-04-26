import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
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
import { Plus, Trash2, Megaphone } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/announcements")({
  component: () => (
    <ProtectedRoute>
      <AnnouncementsPage />
    </ProtectedRoute>
  ),
});

interface Announcement {
  id: string;
  title: string;
  body: string;
  author_id: string | null;
  created_at: string;
}

function AnnouncementsPage() {
  const { role, user } = useAuth();
  const canPost = role === "admin" || role === "coach";
  const canDelete = role === "admin";

  const [items, setItems] = useState<Announcement[]>([]);
  const [authors, setAuthors] = useState<Record<string, string>>({});
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ title: "", body: "" });

  const load = async () => {
    const { data, error } = await supabase
      .from("announcements")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) return toast.error(error.message);
    setItems(data ?? []);
    const ids = Array.from(new Set((data ?? []).map((a) => a.author_id).filter(Boolean) as string[]));
    if (ids.length) {
      const { data: profs } = await supabase.from("profiles").select("id,full_name").in("id", ids);
      const map: Record<string, string> = {};
      (profs ?? []).forEach((p) => (map[p.id] = p.full_name));
      setAuthors(map);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const post = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    const { error } = await supabase.from("announcements").insert({
      title: form.title.trim(),
      body: form.body.trim(),
      author_id: user.id,
    });
    if (error) return toast.error(error.message);
    toast.success("Announcement posted");
    setForm({ title: "", body: "" });
    setOpen(false);
    load();
  };

  const remove = async (a: Announcement) => {
    if (!confirm("Delete this announcement?")) return;
    const { error } = await supabase.from("announcements").delete().eq("id", a.id);
    if (error) return toast.error(error.message);
    toast.success("Deleted");
    load();
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Announcements</h1>
          <p className="text-muted-foreground">News from coaches and admins</p>
        </div>
        {canPost && (
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2">
                <Plus className="h-4 w-4" /> New announcement
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>New announcement</DialogTitle>
              </DialogHeader>
              <form onSubmit={post} className="space-y-4">
                <div className="space-y-2">
                  <Label>Title *</Label>
                  <Input
                    required
                    value={form.title}
                    onChange={(e) => setForm({ ...form, title: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Message *</Label>
                  <Textarea
                    required
                    rows={5}
                    value={form.body}
                    onChange={(e) => setForm({ ...form, body: e.target.value })}
                  />
                </div>
                <DialogFooter>
                  <Button type="submit">Post</Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        )}
      </div>

      {items.length === 0 ? (
        <div
          className="p-12 rounded-xl bg-card border border-border text-center"
          style={{ boxShadow: "var(--shadow-card)" }}
        >
          <Megaphone className="h-10 w-10 mx-auto text-muted-foreground mb-3" />
          <p className="text-muted-foreground">No announcements yet.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {items.map((a) => (
            <div
              key={a.id}
              className="p-5 rounded-xl bg-card border border-border"
              style={{ boxShadow: "var(--shadow-card)" }}
            >
              <div className="flex items-start gap-4">
                <div
                  className="h-10 w-10 rounded-lg flex items-center justify-center shrink-0"
                  style={{ background: "var(--gradient-accent)" }}
                >
                  <Megaphone className="h-5 w-5 text-accent-foreground" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="font-semibold">{a.title}</h3>
                    {canDelete && (
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => remove(a)}
                        className="h-7 w-7 text-destructive hover:text-destructive"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    )}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {a.author_id && authors[a.author_id] ? authors[a.author_id] : "Unknown"} ·{" "}
                    {new Date(a.created_at).toLocaleDateString("en", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </div>
                  <p className="text-sm mt-3 whitespace-pre-wrap">{a.body}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
