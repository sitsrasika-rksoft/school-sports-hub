import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth-context";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { Plus, Trophy } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/sports")({
  component: () => (
    <ProtectedRoute>
      <SportsPage />
    </ProtectedRoute>
  ),
});

interface Sport {
  id: string;
  name: string;
  description: string | null;
  cover_url: string | null;
}

function SportsPage() {
  const { isAdmin, user } = useAuth();
  const [sports, setSports] = useState<Sport[]>([]);
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");

  const load = async () => {
    const { data, error } = await supabase
      .from("sports")
      .select("id,name,description,cover_url")
      .order("name");
    if (error) toast.error(error.message);
    else setSports(data ?? []);
  };

  useEffect(() => {
    load();
  }, []);

  const create = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    const { error } = await supabase
      .from("sports")
      .insert({ name, description: description || null, created_by: user.id });
    if (error) return toast.error(error.message);
    toast.success("Sport created");
    setName("");
    setDescription("");
    setOpen(false);
    load();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-3xl font-bold">Sports</h1>
          <p className="text-muted-foreground mt-1">
            {isAdmin ? "Manage all sports in the society." : "Sports you're assigned to."}
          </p>
        </div>
        {isAdmin && (
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" /> New sport
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create sport</DialogTitle>
              </DialogHeader>
              <form onSubmit={create} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Name</Label>
                  <Input id="name" required value={name} onChange={(e) => setName(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                  />
                </div>
                <DialogFooter>
                  <Button type="submit">Create</Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        )}
      </div>

      {sports.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            <Trophy className="h-10 w-10 mx-auto mb-3 opacity-40" />
            <p>No sports yet{isAdmin ? ". Create one to get started." : ". Ask an admin to assign you."}</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {sports.map((s) => (
            <Link key={s.id} to="/sports/$sportId" params={{ sportId: s.id }}>
              <Card className="hover:shadow-md transition-shadow h-full">
                {s.cover_url && (
                  <div
                    className="h-32 rounded-t-xl bg-cover bg-center"
                    style={{ backgroundImage: `url(${s.cover_url})` }}
                  />
                )}
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Trophy className="h-4 w-4 text-primary" />
                    {s.name}
                  </CardTitle>
                </CardHeader>
                {s.description && (
                  <CardContent className="text-sm text-muted-foreground line-clamp-3">
                    {s.description}
                  </CardContent>
                )}
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
