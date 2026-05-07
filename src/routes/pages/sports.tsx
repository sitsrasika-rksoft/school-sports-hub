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
import { useLanguage } from "@/lib/language-context";

export const Route = createFileRoute("/pages/sports")({
  component: () => (
    <ProtectedRoute>
      <SportsPage />
    </ProtectedRoute>
  ),
});

interface Sport {
  id: string;
  name: string;
  sport_code: string| null;
  description: string | null;
  vision: string | null;
  mission: string | null;
  cover_url: string | null;
}

function SportsPage() {
  const { isAdmin, user } = useAuth();
  const [sports, setSports] = useState<Sport[]>([]);
  const [open, setOpen] = useState(false);
  const { lang } = useLanguage();

  // form state
  const [sportCode, setSportCode] = useState("");
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [vision, setVision] = useState("");
  const [mission, setMission] = useState("");
  const [coverUrl, setCoverUrl] = useState("");

  const load = async () => {
    const { data, error } = await supabase
      .from("sports")
      .select("id,name,sport_code,description,vision,mission,cover_url")
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

    const { error } = await supabase.from("sports").insert({
      sport_code: sportCode,
      name,
      description: description || null,
      vision: vision || null,
      mission: mission || null,
      cover_url: coverUrl || null,
      created_by: user.id,
    });

    if (error) {
      toast.error(error.message);
      return;
    }

    toast.success("Sport created");
    setSportCode("");
    setName("");
    setDescription("");
    setVision("");
    setMission("");
    setCoverUrl("");
    setOpen(false);
    load();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        {/* <div>
          <h1 className="text-3xl font-bold">Sports</h1>
          <p className="text-muted-foreground mt-1">
            {isAdmin
              ? "Manage all sports in the society."
              : "Sports you're assigned to."}
          </p>
        </div> */}
        <div>
          <h1 className="text-3xl font-bold">
            {lang === "si" ? "ක්‍රීඩා" : "Sports"}
          </h1>

          <p className="text-muted-foreground mt-1">
            {isAdmin
              ? lang === "si"
                ? "පාසැලේ සියලුම ක්‍රීඩා කළමනාකරණය කරන්න."
                : "Manage all sports in the society."
              : lang === "si"
                ? "පාසැලේ ඔබට වෙන් කර ඇති ක්‍රීඩා."
                : "Sports you're assigned to."}
          </p>
        </div>

        {isAdmin && (
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                {lang === "si" ? "නව ක්‍රීඩාව" : "New sport"}
              </Button>
            </DialogTrigger>

            <DialogContent className="max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>
                  {lang === "si" ? "ක්‍රීඩාව සාදන්න" : "Create sport"}
                </DialogTitle>
              </DialogHeader>

              <form onSubmit={create} className="space-y-4">
                <div className="space-y-2">
                  <Label>
                    {lang === "si" ? "ක්‍රීඩා කේතය" : "Sport Code"}
                  </Label>
                  <Input
                    required
                    placeholder={
                      lang === "si"
                        ? "CRI, VOL, RUG"
                        : "CRI, VOL, RUG"
                    }
                    value={sportCode}
                    onChange={(e) => setSportCode(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label>{lang === "si" ? "නාමය" : "Name"}</Label>
                  <Input
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label>{lang === "si" ? "විස්තරය" : "Description"}</Label>
                  <Textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label>{lang === "si" ? "දර්ශනය" : "Vision"}</Label>
                  <Textarea
                    value={vision}
                    onChange={(e) => setVision(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label>{lang === "si" ? "මෙහෙවර" : "Mission"}</Label>
                  <Textarea
                    value={mission}
                    onChange={(e) => setMission(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label>
                    {lang === "si"
                      ? "අවරණ රූප URL"
                      : "Cover Image URL"}
                  </Label>
                  <Input
                    placeholder={
                      lang === "si"
                        ? "https://example.com/image.jpg"
                        : "https://example.com/image.jpg"
                    }
                    value={coverUrl}
                    onChange={(e) => setCoverUrl(e.target.value)}
                  />
                </div>

                <DialogFooter>
                  <Button type="submit">
                    {lang === "si" ? "සාදන්න" : "Create"}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        )}
        {/* {isAdmin && (
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" /> New sport
              </Button>
            </DialogTrigger>

            <DialogContent className="max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Create sport</DialogTitle>
              </DialogHeader>

              <form onSubmit={create} className="space-y-4">
                <div className="space-y-2">
                  <Label>Sport Code</Label>
                  <Input
                    required
                    placeholder="CRI, VOL, RUG"
                    value={sportCode}
                    onChange={(e) => setSportCode(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Name</Label>
                  <Input
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Description</Label>
                  <Textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Vision</Label>
                  <Textarea
                    value={vision}
                    onChange={(e) => setVision(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Mission</Label>
                  <Textarea
                    value={mission}
                    onChange={(e) => setMission(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Cover Image URL</Label>
                  <Input
                    placeholder="https://example.com/image.jpg"
                    value={coverUrl}
                    onChange={(e) => setCoverUrl(e.target.value)}
                  />
                </div>

                <DialogFooter>
                  <Button type="submit">Create</Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        )} */}
      </div>

      {/* Sports grid */}
      {sports.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            <Trophy className="h-10 w-10 mx-auto mb-3 opacity-40" />
            <p>
              No sports yet
              {isAdmin
                ? ". Create one to get started."
                : ". Ask an admin to assign you."}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {sports.map((s) => (
            <Link
              key={s.id}
              to="/sports/$sportId"
              params={{ sportId: s.id }}
            >
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