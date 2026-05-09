import { ProtectedRoute } from "@/components/ProtectedRoute";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useLanguage } from "@/lib/language-context";
import { createFileRoute } from "@tanstack/react-router";
import { Calendar } from "lucide-react";

export const Route = createFileRoute("/pages/reports/coaches")({
  component: () => (
    <ProtectedRoute>
      <CoachesPage />
    </ProtectedRoute>
  ),
});


function CoachesPage() {
  const { lang } = useLanguage();

  return (
    <div className="space-y-6">
      {/* Page Title */}
      <h1 className="text-3xl font-bold">
        {lang === "si" ? "තරඟ සහ උත්සව" : "Events & Tournaments"}
      </h1>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            {lang === "si" ? "තරඟ" : "Competitions"}
          </CardTitle>
        </CardHeader>

        <CardContent className="text-muted-foreground">
          {lang === "si"
            ? "තරඟ, තරඟ ප්‍රතිඵල, සහ සහභාගීත්වය නිරීක්ෂණය කරන්න."
            : "Track tournaments, matches, results, and participation."}
        </CardContent>
      </Card>
    </div>
  );
}