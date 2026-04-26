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
import { Plus, Pencil, Trash2, Trophy, Upload } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/teams")({
  component: () => (
    <ProtectedRoute>
      <TeamsPage />
    </ProtectedRoute>
  ),
});

interface Team {
  id: string;
  name: string;
  sport: string;
  description: string | null;
  logo_url: string | null;
  coach_id: string | null;
}

function TeamsPage() {
  const { role } = useAuth();
  const canEdit = role === "admin" || role === "coach";
  const canDelete = role === "admin";
  const [items, setItems] = useState<Team[]>([]);
  const [memberCounts, setMemberCounts] = useState<Record<string, number>>({});
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Team | null>(null);
  const [form, setForm] = useState({ name: "", sport: "", description: "", logo_url: "" });
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const load = async () => {
    const [{ data: teams }, { data: members }] = await Promise.all([
      supabase.from("teams").select("*").order("name"),
      supabase.from("team_members").select("team_id"),
    ]);
    setItems(teams ?? []);
    const counts: Record<string, number> = {};
    (members ?? []).forEach((m) => {
      counts[m.team_id] = (counts[m.team_id] ?? 0) + 1;
    });
    setMemberCounts(counts);
  };

  useEffect(() => {
    load();
  }, []);

  const openNew = () => {
    setEditing(null);
    setForm({ name: "", sport: "", description: "", logo_url: "" });
    setOpen(true);
  };
  const openEdit = (t: Team) => {
    setEditing(t);
    setForm({
      name: t.name,
      sport: t.sport,
      description: t.description ?? "",
      logo_url: t.logo_url ?? "",
    });
    setOpen(true);
  };

  const handleUpload = async (file: File) => {
    setUploading(true);
    const ext = file.name.split(".").pop();
    const path = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
    const { error } = await supabase.storage.from("team-logos").upload(path, file);
    if (error) {
      toast.error(error.message);
      setUploading(false);
      return;
    }
    const { data } = supabase.storage.from("team-logos").getPublicUrl(path);
    setForm((f) => ({ ...f, logo_url: data.publicUrl }));
    setUploading(false);
  };

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      name: form.name.trim(),
      sport: form.sport.trim(),
      description: form.description.trim() || null,
      logo_url: form.logo_url || null,
    };
    if (editing) {
      const { error } = await supabase.from("teams").update(payload).eq("id", editing.id);
      if (error) return toast.error(error.message);
      toast.success("Team updated");
    } else {
      const { error } = await supabase.from("teams").insert(payload);
      if (error) return toast.error(error.message);
      toast.success("Team created");
    }
    setOpen(false);
    load();
  };

  const remove = async (t: Team) => {
    if (!confirm(`Delete team "${t.name}"?`)) return;
    const { error } = await supabase.from("teams").delete().eq("id", t.id);
    if (error) return toast.error(error.message);
    toast.success("Team deleted");
    load();
  };

  return (
    <div className="space-y-6 max-w-7xl">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Teams</h1>
          <p className="text-muted-foreground">Squads competing for the school</p>
        </div>
        {canEdit && (
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button onClick={openNew} className="gap-2">
                <Plus className="h-4 w-4" /> New team
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{editing ? "Edit team" : "New team"}</DialogTitle>
              </DialogHeader>
              <form onSubmit={save} className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <Label>Name *</Label>
                    <Input
                      required
                      value={form.name}
                      onChange={(e) => setForm({ ...form, name: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Sport *</Label>
                    <Input
                      required
                      placeholder="e.g. Basketball"
                      value={form.sport}
                      onChange={(e) => setForm({ ...form, sport: e.target.value })}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Description</Label>
                  <Textarea
                    value={form.description}
                    onChange={(e) => setForm({ ...form, description: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Logo</Label>
                  <div className="flex items-center gap-3">
                    {form.logo_url && (
                      <img
                        src={form.logo_url}
                        alt=""
                        className="h-14 w-14 rounded-lg object-cover bg-secondary"
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
                      {uploading ? "Uploading..." : "Upload image"}
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

      {items.length === 0 ? (
        <div
          className="p-12 rounded-xl bg-card border border-border text-center"
          style={{ boxShadow: "var(--shadow-card)" }}
        >
          <Trophy className="h-10 w-10 mx-auto text-muted-foreground mb-3" />
          <p className="text-muted-foreground">No teams yet.</p>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {items.map((t) => (
            <div
              key={t.id}
              className="p-5 rounded-xl bg-card border border-border hover:border-primary/40 transition-all"
              style={{ boxShadow: "var(--shadow-card)" }}
            >
              <div className="flex items-start gap-4">
                {t.logo_url ? (
                  <img
                    src={t.logo_url}
                    alt={t.name}
                    className="h-14 w-14 rounded-lg object-cover bg-secondary"
                  />
                ) : (
                  <div
                    className="h-14 w-14 rounded-lg flex items-center justify-center"
                    style={{ background: "var(--gradient-primary)" }}
                  >
                    <Trophy className="h-6 w-6 text-primary-foreground" />
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <div className="font-semibold truncate">{t.name}</div>
                  <div className="text-xs text-muted-foreground">{t.sport}</div>
                  <div className="text-xs text-muted-foreground mt-1">
                    {memberCounts[t.id] ?? 0} member{(memberCounts[t.id] ?? 0) === 1 ? "" : "s"}
                  </div>
                </div>
              </div>
              {t.description && (
                <p className="text-sm text-muted-foreground mt-3 line-clamp-2">{t.description}</p>
              )}
              {(canEdit || canDelete) && (
                <div className="flex gap-1 mt-4 pt-4 border-t border-border">
                  {canEdit && (
                    <Button variant="ghost" size="sm" onClick={() => openEdit(t)} className="gap-1.5">
                      <Pencil className="h-3.5 w-3.5" /> Edit
                    </Button>
                  )}
                  {canDelete && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => remove(t)}
                      className="gap-1.5 text-destructive hover:text-destructive"
                    >
                      <Trash2 className="h-3.5 w-3.5" /> Delete
                    </Button>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
