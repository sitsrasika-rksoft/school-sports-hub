import { createFileRoute } from "@tanstack/react-router";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users } from "lucide-react";
import { useLanguage } from "@/lib/language-context";

export const Route = createFileRoute("/pages/athletes")({
  component: () => (
    <ProtectedRoute>
      <AthletesPage />
    </ProtectedRoute>
  ),
});

function AthletesPage() {
  const { lang } = useLanguage();

  return (
    <div className="space-y-6">
      {/* Page Title */}
      <h1 className="text-3xl font-bold">
        {lang === "si" ? "ක්‍රීඩකයින්" : "Athletes"}
      </h1>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            {lang === "si"
              ? "ක්‍රීඩක කළමනාකරණය"
              : "Athlete Management"}
          </CardTitle>
        </CardHeader>

        <CardContent className="text-muted-foreground">
          {lang === "si"
            ? "ලියාපදිංචි ක්‍රීඩකයින්, පැතිකඩ සහ ඔවුන්ට වෙන් කර ඇති ක්‍රීඩා කළමනාකරණය කරන්න."
            : "Manage registered players, profiles, and sport assignments."}
        </CardContent>
      </Card>
    </div>
  );
}