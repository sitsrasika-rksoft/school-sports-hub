import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useAuth } from "@/lib/auth-context";
import { Button } from "@/components/ui/button";
import { Trophy, Users, CalendarDays, ListChecks, ArrowRight } from "lucide-react";

import football from "@/assets/hero/01.jpg";
import cricket from "@/assets/hero/02.jpg";
import volleyball from "@/assets/hero/03.jpg";
import athletics from "@/assets/hero/04.jpg";

import { useLanguage } from "@/lib/language-context";
import { translations } from "@/lib/translations";

export const Route = createFileRoute("/")({
  component: Landing,
});

function Landing() {
  // Hooks must be INSIDE component
  const { lang, setLang } = useLanguage();
  const t = translations[lang];

  const { user, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && user) navigate({ to: "/dashboard" });
  }, [user, loading, navigate]);

  const heroImages = [football, cricket, volleyball, athletics];
  const [currentImage, setCurrentImage] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImage((prev) => (prev + 1) % heroImages.length);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div
      className={`min-h-screen bg-background ${
        lang === "si" ? "font-sinhala" : ""
      }`}
    >
      {/* HEADER */}
      <header className="px-6 py-5 flex items-center justify-between max-w-7xl mx-auto">
        <div className="flex items-center gap-2">
          <div
            className="h-9 w-9 rounded-lg flex items-center justify-center text-primary-foreground font-bold"
            style={{ background: "var(--gradient-primary)" }}
          >
            SC
          </div>
          <span className="font-bold text-lg">{t.brand}</span>
        </div>

        <div className="flex items-center gap-2">
          <p className="text-sm">Language : </p>
          <Button
            size="sm"
            className="font-bold"
            variant="outline"
            onClick={() => setLang(lang === "en" ? "si" : "en")}
          >
            {t.toggle}
          </Button>

          {/* <Link to="/signup">
            <Button size="lg" className="gap-2">
              {t.signup} <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>

          <Link to="/login">
            <Button size="lg" variant="outline" className="bg-white/10">
              {t.signin}
            </Button>
          </Link> */}
        </div>
      </header>

      {/* HERO */}
      <section className="relative overflow-hidden min-h-[60vh] sm:min-h-[75vh] lg:min-h-[65vh]">
        <div className="absolute inset-0">
          {heroImages.map((img, index) => (
            <div
              key={img}
              className={`absolute inset-0 bg-cover bg-center transition-opacity duration-1000 ${
                index === currentImage ? "opacity-100" : "opacity-0"
              }`}
              style={{ backgroundImage: `url(${img})` }}
            />
          ))}
          <div className="absolute inset-0 bg-black/50" />
        </div>

        <div className="relative max-w-7xl mx-auto px-6 py-20 sm:py-28 text-center text-white">
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight">
            {t.title}
            <span className="block text-primary">{t.subtitle}</span>
          </h1>

          <p className="mt-6 text-lg text-white/80 max-w-2xl mx-auto">
            {t.heroDesc}
          </p>

          <div className="mt-15 flex flex-wrap items-center justify-center gap-3">
            <Link to="/signup">
              <Button size="lg" className="gap-2">
                 {t.signup} <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
            <Link to="/login">
              <Button size="lg" variant="outline" className="bg-white/10 text-white">
               {t.signin}
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section className="max-w-7xl mx-auto px-6 pb-24">
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {t.features.map((f, i) => (
            <div
              key={i}
              className="p-6 rounded-xl bg-card border border-border"
              style={{ boxShadow: "var(--shadow-card)" }}
            >
              <h3 className="font-semibold mb-1">{f.title}</h3>
              <p className="text-sm text-muted-foreground">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
