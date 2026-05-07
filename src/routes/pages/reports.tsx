import { createFileRoute } from "@tanstack/react-router";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText } from "lucide-react";
import { useLanguage } from "@/lib/language-context";

export const Route = createFileRoute("/pages/reports")({
  component: () => (
    <ProtectedRoute>
      <ReportsPage />
    </ProtectedRoute>
  ),
});

function ReportsPage() {
  const { lang } = useLanguage();

  return (
    <div className="space-y-6">
      {/* Page Title */}
      <h1 className="text-3xl font-bold">
        {lang === "si" ? "වාර්තා" : "Reports"}
      </h1>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            {lang === "si"
              ? "ක්‍රීඩා වාර්තා"
              : "Sports Reports"}
          </CardTitle>
        </CardHeader>

        <CardContent className="text-muted-foreground">
          {lang === "si"
            ? "කළමනාකරණය, NAAC සහ විගණන සඳහා වාර්තා ජනනය කරන්න."
            : "Generate reports for management, NAAC, and audits."}
        </CardContent>
      </Card>
    </div>
  );
}