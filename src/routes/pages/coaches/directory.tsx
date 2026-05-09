import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { useAuth } from "@/lib/auth-context";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

import {
  Card,
  CardContent,
  CardHeader,
} from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";

import {
  Phone,
  Mail,
  Eye,
  User,
  Plus,
  Pencil,
  Trash2,
} from "lucide-react";

/* -------------------- IMAGE MAP (src/assets) -------------------- */
import samanImg from "@/assets/profile/coaches/saman.jpg";
import nimalImg from "@/assets/profile/coaches/nimal.jpg";
import kasunImg from "@/assets/profile/coaches/kasun.jpg";
import amaliImg from "@/assets/profile/coaches/amali.jpg";

const IMAGE_MAP: Record<string, string> = {
  saman: samanImg,
  nimal: nimalImg,
  kasun: kasunImg,
  amali: amaliImg,
};

/* -------------------- ROUTE -------------------- */

export const Route = createFileRoute("/pages/coaches/directory")({
  component: () => (
    <ProtectedRoute>
      <DirectoryPage />
    </ProtectedRoute>
  ),
});

/* -------------------- TYPES -------------------- */

interface Coach {
  id: string;
  full_name: string;
  email: string | null;
  phone: string | null;
  specialization: string | null;
  role: string | null;
  sport: string | null;
  profile_image_key: string | null;
  address: string | null;
  experience: string | null;
  ranking: string | null;
  since_year: number | null;
  achievements: string[] | null;
  date_of_birth: string | null;
  hired_at: string | null;
  created_at: string;
  updated_at: string | null;
}

/* -------------------- PAGE -------------------- */

function DirectoryPage() {
  const { isAdmin, user } = useAuth();

  const [coaches, setCoaches] = useState<Coach[]>([]);
  const [loading, setLoading] = useState(true);

  /* dialogs */
  const [openAdd, setOpenAdd] = useState(false);
  const [viewCoach, setViewCoach] = useState<Coach | null>(null);
  const [editCoach, setEditCoach] = useState<Coach | null>(null);

  /* -------- add form state -------- */
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [specialization, setSpecialization] = useState("");
  const [role, setRole] = useState("");
  const [sport, setSport] = useState("");
  const [profileImageKey, setProfileImageKey] = useState("");
  const [address, setAddress] = useState("");
  const [experience, setExperience] = useState("");
  const [ranking, setRanking] = useState("");
  const [sinceYear, setSinceYear] = useState("");
  const [dob, setDob] = useState("");
  const [hiredAt, setHiredAt] = useState("");
  const [achievements, setAchievements] = useState("");

  /* -------- load coaches -------- */
  const loadCoaches = async () => {
    const { data, error } = await supabase
      .from("coaches")
      .select("*")
      .order("full_name");

    if (error) toast.error(error.message);
    else setCoaches(data ?? []);

    setLoading(false);
  };

  useEffect(() => {
    loadCoaches();
  }, []);

  /* -------- ADD -------- */
  const create = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    let imagePath: string | null = null;

    
    /* ✅ UPLOAD IMAGE IF PROVIDED */
    if (profileImageFile) {
        const ext = profileImageFile.name.split(".").pop();
        const fileName = `${user.id}-${Date.now()}.${ext}`;

        console.log(
        "SUPABASE URL:",
        import.meta.env.VITE_SUPABASE_URL
        );

        
        const { error: uploadError } = await supabase.storage
        .from("coach-profiles") // ✅ EXACT
        .upload(fileName, profileImageFile, {
            upsert: true,
            contentType: profileImageFile.type,
        });


        if (uploadError) {
        toast.error(uploadError.message);
        return;
        }

        const { data } = supabase.storage
        .from("coach-profiles")
        .getPublicUrl(fileName);

        imagePath = data.publicUrl;
    }
    // const { error } = await supabase.from("coaches").insert({
    //   id: user.id,
    //   full_name: fullName,
    //   email: email || null,
    //   phone: phone || null,
    //   specialization: specialization || null,
    //   role: role || null,
    //   sport: sport || null,
    //   profile_image_key: imagePath,
    //   address: address || null,
    //   experience: experience || null,
    //   ranking: ranking || null,
    //   since_year: sinceYear ? Number(sinceYear) : null,
    //   date_of_birth: dob || null,
    //   hired_at: hiredAt || null,
    //   achievements: achievements
    //     ? achievements.split(",").map((a) => a.trim())
    //     : null,
    // });

    const { error } = await supabase.from("coaches").upsert(
    {
        id: user.id,
        full_name: fullName,
        email: email || null,
        phone: phone || null,
        specialization: specialization || null,
        role: role || null,
        sport: sport || null,
        profile_image_key: imagePath,
        address: address || null,
        experience: experience || null,
        ranking: ranking || null,
        since_year: sinceYear ? Number(sinceYear) : null,
        date_of_birth: dob || null,
        hired_at: hiredAt || null,
        achievements: achievements
        ? achievements.split(",").map(a => a.trim())
        : null,
    },
    { onConflict: "id" }
    );

    if (error) return toast.error(error.message);

    toast.success("Coach added");
    setOpenAdd(false);
    loadCoaches();
  };

  /* -------- UPDATE -------- */
  const update = async () => {
    if (!editCoach) return;

    const { error } = await supabase
      .from("coaches")
      .update({
        full_name: editCoach.full_name,
        role: editCoach.role,
        sport: editCoach.sport,
        phone: editCoach.phone,
        email: editCoach.email,
      })
      .eq("id", editCoach.id);

    if (error) toast.error(error.message);
    else {
      toast.success("Coach updated");
      setEditCoach(null);
      loadCoaches();
    }
  };

  /* -------- DELETE -------- */
  const remove = async (id: string) => {
    if (!confirm("Delete this coach?")) return;

    const { error } = await supabase.from("coaches").delete().eq("id", id);
    if (error) toast.error(error.message);
    else {
      toast.success("Coach deleted");
      loadCoaches();
    }
  };

  const [profileImageFile, setProfileImageFile] = useState<File | null>(null);

  if (loading) {
    return <p className="text-muted-foreground">Loading coaches…</p>;
  }

  return (
    <div className="space-y-6">
      {/* HEADER */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold">Coach Directory</h1>
          <p className="text-muted-foreground mt-1">
            Coaches and support staff across all sports disciplines.
          </p>
        </div>

        {/* ADD (ADMIN) */}
        {isAdmin && (
          <Dialog open={openAdd} onOpenChange={setOpenAdd}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Add Coach
              </Button>
            </DialogTrigger>

            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add Coach</DialogTitle>
              </DialogHeader>

              <form onSubmit={create} className="space-y-3">
                <Field label="Full Name"><Input required value={fullName} onChange={e => setFullName(e.target.value)} /></Field>
                <Field label="Email"><Input value={email} onChange={e => setEmail(e.target.value)} /></Field>
                <Field label="Phone"><Input value={phone} onChange={e => setPhone(e.target.value)} /></Field>
                <Field label="Role"><Input value={role} onChange={e => setRole(e.target.value)} /></Field>
                <Field label="Sport"><Input value={sport} onChange={e => setSport(e.target.value)} /></Field>
                {/* <Field label="Profile Image Key"><Input value={profileImageKey} onChange={e => setProfileImageKey(e.target.value)} /></Field> */}
                <Field label="Profile Image (max 1MB)">
                <Input
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (!file) return;

                    if (file.size > 1024 * 1024) {
                        toast.error("Image must be less than 1 MB");
                        return;
                    }

                    setProfileImageFile(file);
                    }}
                />
                </Field>
                <DialogFooter>
                  <Button type="submit">Save</Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        )}
      </div>

      {/* GRID */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {coaches.map((c) => {
        //   const img = c.profile_image_key
        //     ? IMAGE_MAP[c.profile_image_key]
        //     : undefined;
            
            const img = c.profile_image_key || undefined;

          return (
            <Card key={c.id}>
              <CardHeader className="text-center">
                <Avatar className="h-24 w-24 mx-auto mb-2">
                  {img && <AvatarImage src={img} />}
                  <AvatarFallback><User /></AvatarFallback>
                </Avatar>
                <h3 className="font-semibold">{c.full_name}</h3>
                {c.role && <Badge>{c.role}</Badge>}
                {c.sport && <p className="text-xs">{c.sport}</p>}
              </CardHeader>

              <CardContent className="space-y-2">
                {c.phone && <p><Phone className="inline h-4" /> {c.phone}</p>}
                {c.email && <p><Mail className="inline h-4" /> {c.email}</p>}

                {/* VIEW (ANYONE) */}
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => setViewCoach(c)}
                >
                  <Eye className="h-4 w-4 mr-1" />
                  View
                </Button>

                {/* ADMIN */}
                {isAdmin && (
                  <div className="flex gap-2">
                    <Button size="sm" className="flex-1" onClick={() => setEditCoach(c)}>
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button size="sm" variant="destructive" className="flex-1" onClick={() => remove(c.id)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* VIEW DIALOG (ANY USER)
      <Dialog open={!!viewCoach} onOpenChange={() => setViewCoach(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Coach Profile</DialogTitle>
          </DialogHeader>
          {viewCoach && (
            <div className="space-y-2 text-sm">
              <p><b>Name:</b> {viewCoach.full_name}</p>
              <p><b>Role:</b> {viewCoach.role}</p>
              <p><b>Sport:</b> {viewCoach.sport}</p>
              <p><b>Experience:</b> {viewCoach.experience}</p>
              <p><b>Ranking:</b> {viewCoach.ranking}</p>
            </div>
          )}
        </DialogContent>
      </Dialog> */}

      {/* VIEW DIALOG (ANY USER) */}
        <Dialog open={!!viewCoach} onOpenChange={() => setViewCoach(null)}>
            <DialogContent className="max-w-md">
                <DialogHeader>
                <DialogTitle>Coach Profile</DialogTitle>
                </DialogHeader>

                {viewCoach && (() => {
                // const img =
                //     viewCoach.profile_image_key &&
                //     IMAGE_MAP[viewCoach.profile_image_key];
                const img = viewCoach.profile_image_key || undefined;
                return (
                    <div className="space-y-4">
                    {/* LARGE PROFILE IMAGE */}
                    <div className="flex justify-center">
                        <Avatar className="h-48 w-48 rounded-xl ring-4 ring-primary/20">
                        {img && (
                            <AvatarImage
                            src={img}
                            alt={viewCoach.full_name}
                            className="object-cover"
                            />
                        )}
                        <AvatarFallback>
                            <User className="h-15 w-15" />
                        </AvatarFallback>
                        </Avatar>
                    </div>

                    {/* BASIC INFO */}
                    <div className="text-center space-y-1">
                        <h2 className="text-xl font-semibold">
                        {viewCoach.full_name}
                        </h2>

                        {viewCoach.role && (
                        <Badge>{viewCoach.role}</Badge>
                        )}

                        {viewCoach.sport && (
                        <p className="text-sm text-muted-foreground">
                            {viewCoach.sport}
                        </p>
                        )}
                    </div>

                    {/* DETAILS */}
                    <div className="space-y-2 text-sm">
                        {viewCoach.phone && (
                        <p>
                            <Phone className="inline h-4 w-4 mr-1" />
                            {viewCoach.phone}
                        </p>
                        )}

                        {viewCoach.email && (
                        <p>
                            <Mail className="inline h-4 w-4 mr-1" />
                            {viewCoach.email}
                        </p>
                        )}

                        {viewCoach.experience && (
                        <p>
                            <b>Experience:</b> {viewCoach.experience}
                        </p>
                        )}

                        {viewCoach.ranking && (
                        <p>
                            <b>Ranking:</b> {viewCoach.ranking}
                        </p>
                        )}

                        {viewCoach.since_year && (
                        <p>
                            <b>Since:</b> {viewCoach.since_year}
                        </p>
                        )}

                        {viewCoach.address && (
                        <p>
                            <b>Address:</b> {viewCoach.address}
                        </p>
                        )}

                        {viewCoach.achievements &&
                        viewCoach.achievements.length > 0 && (
                            <div>
                            <b>Achievements:</b>
                            <ul className="list-disc ml-5 mt-1">
                                {viewCoach.achievements.map((a, i) => (
                                <li key={i}>{a}</li>
                                ))}
                            </ul>
                            </div>
                        )}
                    </div>
                    </div>
                );
                })()}
            </DialogContent>
        </Dialog>

      {/* EDIT DIALOG (ADMIN) */}
      {isAdmin && (
        <Dialog open={!!editCoach} onOpenChange={() => setEditCoach(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit Coach</DialogTitle>
            </DialogHeader>

            {editCoach && (
              <div className="space-y-3">
                <Field label="Full Name">
                  <Input value={editCoach.full_name} onChange={e => setEditCoach({ ...editCoach, full_name: e.target.value })} />
                </Field>
                <Field label="Role">
                  <Input value={editCoach.role ?? ""} onChange={e => setEditCoach({ ...editCoach, role: e.target.value })} />
                </Field>
                <Field label="Sport">
                  <Input value={editCoach.sport ?? ""} onChange={e => setEditCoach({ ...editCoach, sport: e.target.value })} />
                </Field>

                <DialogFooter>
                  <Button onClick={update}>Save</Button>
                </DialogFooter>
              </div>
            )}
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}

/* -------------------- HELPER -------------------- */

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1">
      <Label>{label}</Label>
      {children}
    </div>
  );
}