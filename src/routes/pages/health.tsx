import { createFileRoute } from "@tanstack/react-router";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { HeartPulse } from "lucide-react";
import { useLanguage } from "@/lib/language-context";

export const Route = createFileRoute("/pages/health")({
  component: () => (
    <ProtectedRoute>
      <HealthPage />
    </ProtectedRoute>
  ),
});

function HealthPage() {
  const { lang } = useLanguage();

  return (
    <div className="space-y-6">
      {/* Page Title */}
      <h1 className="text-3xl font-bold">
        {lang === "si" ? "සෞඛ්‍ය සහ ශාරීරික හැසිරීම" : "Health & Fitness"}
      </h1>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <HeartPulse className="h-5 w-5" />
            {lang === "si"
              ? "ක්‍රීඩක සුවතාව"
              : "Athlete Wellness"}
          </CardTitle>
        </CardHeader>

        <CardContent className="text-muted-foreground">
          {lang === "si"
            ? "බෙහෙත් පරීක්ෂා, තුවාල, ශාරීරික පරීක්ෂණ සහ ප්‍රතිසාධනය අධීක්ෂණය කරන්න."
            : "Track injuries, medical checks, fitness tests, and recovery."}
        </CardContent>
      </Card>
    </div>
  );
}