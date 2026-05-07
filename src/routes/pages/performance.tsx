import { createFileRoute } from "@tanstack/react-router";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart3 } from "lucide-react";
import { useLanguage } from "@/lib/language-context";

export const Route = createFileRoute("/pages/performance")({
  component: () => (
    <ProtectedRoute>
      <PerformancePage />
    </ProtectedRoute>
  ),
});

function PerformancePage() {
  const { lang } = useLanguage();

  return (
    <div className="space-y-6">
      {/* Page Title */}
      <h1 className="text-3xl font-bold">
        {lang === "si" ? "කාර්යසාධන දර්ශක" : "Performance & KPIs"}
      </h1>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            {lang === "si"
              ? "ක්‍රීඩා කාර්යසාධන දර්ශක"
              : "Sports KPIs"}
          </CardTitle>
        </CardHeader>

        <CardContent className="text-muted-foreground">
          {lang === "si"
            ? "සහභාගීත්ව වර්ධනය, කාර්යසාධන ප්‍රවණතා සහ ජයග්‍රහණ නිරීක්ෂණය කරන්න."
            : "Monitor participation growth, performance trends, and achievements."}
        </CardContent>
      </Card>
    </div>
  );
}