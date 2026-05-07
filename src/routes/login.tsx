import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth-context";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { toast } from "sonner";

import { useLanguage } from "@/lib/language-context";
import { translations } from "@/lib/translations";

export const Route = createFileRoute("/login")({
  component: LoginPage,
});

function LoginPage() {
  const navigate = useNavigate();
  const { user } = useAuth();

  /* ✅ Language */
  const { lang } = useLanguage();
  const t = translations[lang].login;

  /* ✅ Auth State */
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  /* ✅ Reset Password */
  const [resetOpen, setResetOpen] = useState(false);
  const [resetEmail, setResetEmail] = useState("");
  const [resetLoading, setResetLoading] = useState(false);

  useEffect(() => {
    if (user) navigate({ to: "/dashboard" });
  }, [user, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    setLoading(false);

    if (error) {
      toast.error(error.message);
      return;
    }

    toast.success(t.welcome);
    navigate({ to: "/dashboard" });
  };

  const handleResetPassword = async () => {
    if (!resetEmail) {
      toast.error(t.resetEmailError);
      return;
    }

    setResetLoading(true);

    const { error } = await supabase.auth.resetPasswordForEmail(resetEmail, {
      redirectTo: `${window.location.origin}/reset-password`,
    });

    setResetLoading(false);

    if (error) {
      toast.error(error.message);
      return;
    }

    toast.success(t.resetSuccess);
    setResetOpen(false);
    setResetEmail("");
  };

  return (
    <div
      className={`min-h-screen flex items-center justify-center bg-background p-4 ${
        lang === "si" ? "font-sinhala" : ""
      }`}
    >
      <div className="w-full max-w-md p-8 rounded-2xl bg-card border border-border">
        {/* Header */}
        <div className="flex items-center gap-2 mb-6">
          <div
            className="h-10 w-10 rounded-lg flex items-center justify-center text-primary-foreground font-bold"
            style={{ background: "var(--gradient-primary)" }}
          >
            SC
          </div>
          <div>
            <h1 className="text-xl font-bold">{t.title}</h1>
            <p className="text-sm text-muted-foreground">{t.subtitle}</p>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label>{t.email}</Label>
            <Input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label>{t.password}</Label>
            <Input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          {/* Forgot Password */}
          <Dialog open={resetOpen} onOpenChange={setResetOpen}>
            <DialogTrigger asChild>
              <button
                type="button"
                className="text-primary text-sm hover:underline"
              >
                {t.forgot}
              </button>
            </DialogTrigger>

            <DialogContent>
              <DialogHeader>
                <DialogTitle>{t.resetTitle}</DialogTitle>
              </DialogHeader>

              <div className="space-y-4">
                <Label>{t.email}</Label>
                <Input
                  value={resetEmail}
                  onChange={(e) => setResetEmail(e.target.value)}
                />

                <Button
                  className="w-full"
                  onClick={handleResetPassword}
                  disabled={resetLoading}
                >
                  {resetLoading ? t.sending : t.sendLink}
                </Button>
              </div>
            </DialogContent>
          </Dialog>

          {/* Submit */}
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? t.signingIn : t.signin}
          </Button>
        </form>

        {/* Signup */}
        <p className="mt-6 text-sm text-center text-muted-foreground">
          {t.noAccount}{" "}
          <Link to="/signup" className="text-primary hover:underline">
            {t.signup}
          </Link>
        </p>
      </div>
    </div>
  );
}















// import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
// import { useEffect, useState } from "react";
// import { supabase } from "@/integrations/supabase/client";
// import { useAuth } from "@/lib/auth-context";
// import { Button } from "@/components/ui/button";
// import { Input } from "@/components/ui/input";
// import { Label } from "@/components/ui/label";
// import {
//   Dialog,
//   DialogContent,
//   DialogHeader,
//   DialogTitle,
//   DialogTrigger,
// } from "@/components/ui/dialog";
// import { toast } from "sonner";

// export const Route = createFileRoute("/login")({
//   component: LoginPage,
// });

// function LoginPage() {
//   const navigate = useNavigate();
//   const { user } = useAuth();

//   const [email, setEmail] = useState("");
//   const [password, setPassword] = useState("");
//   const [loading, setLoading] = useState(false);

//   // Forgot password
//   const [resetOpen, setResetOpen] = useState(false);
//   const [resetEmail, setResetEmail] = useState("");
//   const [resetLoading, setResetLoading] = useState(false);

//   useEffect(() => {
//     if (user) navigate({ to: "/dashboard" });
//   }, [user, navigate]);

//   const handleSubmit = async (e: React.FormEvent) => {
//     e.preventDefault();
//     setLoading(true);

//     const { error } = await supabase.auth.signInWithPassword({
//       email,
//       password,
//     });

//     setLoading(false);

//     if (error) {
//       toast.error(error.message);
//       return;
//     }

//     toast.success("Welcome back!");
//     navigate({ to: "/dashboard" });
//   };

//   const handleResetPassword = async () => {
//     if (!resetEmail) {
//       toast.error("Please enter your email");
//       return;
//     }

//     setResetLoading(true);

//     const { error } = await supabase.auth.resetPasswordForEmail(resetEmail, {
//       redirectTo: `${window.location.origin}/reset-password`,
//     });

//     setResetLoading(false);

//     if (error) {
//       toast.error(error.message);
//       return;
//     }

//     toast.success("Password reset link sent to your email");
//     setResetOpen(false);
//     setResetEmail("");
//   };

//   return (
//     <div className="min-h-screen flex items-center justify-center bg-background p-4 relative overflow-hidden">
//       <div
//         className="absolute inset-0 opacity-10"
//         style={{ background: "var(--gradient-hero)" }}
//       />

//       <div className="relative w-full max-w-md p-8 rounded-2xl bg-card border border-border">
//         {/* Header */}
//         <div className="flex items-center gap-2 mb-6">
//           <div
//             className="h-10 w-10 rounded-lg flex items-center justify-center text-primary-foreground font-bold"
//             style={{ background: "var(--gradient-primary)" }}
//           >
//             SC
//           </div>
//           <div>
//             <h1 className="text-xl font-bold">Welcome back</h1>
//             <p className="text-sm text-muted-foreground">
//               Sign in to your committee
//             </p>
//           </div>
//         </div>

//         {/* Login Form */}
//         <form onSubmit={handleSubmit} className="space-y-4">
//           <div className="space-y-2">
//             <Label>Email</Label>
//             <Input
//               type="email"
//               required
//               value={email}
//               onChange={(e) => setEmail(e.target.value)}
//             />
//           </div>

//           <div className="space-y-2">
//             <Label>Password</Label>
//             <Input
//               type="password"
//               required
//               value={password}
//               onChange={(e) => setPassword(e.target.value)}
//             />
//           </div>

//           <div className="flex items-center justify-between text-sm">
//             <Dialog open={resetOpen} onOpenChange={setResetOpen}>
//               <DialogTrigger asChild>
//                 <button
//                   type="button"
//                   className="text-primary hover:underline"
//                 >
//                   Forgot password?
//                 </button>
//               </DialogTrigger>

//               <DialogContent>
//                 <DialogHeader>
//                   <DialogTitle>Reset password</DialogTitle>
//                 </DialogHeader>

//                 <div className="space-y-4">
//                   <div className="space-y-2">
//                     <Label>Email</Label>
//                     <Input
//                       type="email"
//                       placeholder="you@example.com"
//                       value={resetEmail}
//                       onChange={(e) => setResetEmail(e.target.value)}
//                     />
//                   </div>

//                   <Button
//                     className="w-full"
//                     onClick={handleResetPassword}
//                     disabled={resetLoading}
//                   >
//                     {resetLoading
//                       ? "Sending..."
//                       : "Send reset link"}
//                   </Button>
//                 </div>
//               </DialogContent>
//             </Dialog>
//           </div>

//           <Button
//             type="submit"
//             className="w-full"
//             disabled={loading}
//           >
//             {loading ? "Signing in..." : "Sign in"}
//           </Button>
//         </form>

//         {/* Signup */}
//         <p className="mt-6 text-sm text-center text-muted-foreground">
//           No account?{" "}
//           <Link
//             to="/signup"
//             className="text-primary font-medium hover:underline"
//           >
//             Sign up
//           </Link>
//         </p>
//       </div>
//     </div>
//   );
// }