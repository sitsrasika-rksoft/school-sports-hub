import { createFileRoute } from "@tanstack/react-router";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dumbbell } from "lucide-react";
import { useLanguage } from "@/lib/language-context";

export const Route = createFileRoute("/pages/training")({
  component: () => (
    <ProtectedRoute>
      <TrainingPage />
    </ProtectedRoute>
  ),
});

function TrainingPage() {
  const { lang } = useLanguage();

  return (
    <div className="space-y-6">
      {/* Page title */}
      <h1 className="text-3xl font-bold">
        {lang === "si" ? "පුහුණු වැඩසටහන්" : "Training Programs"}
      </h1>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Dumbbell className="h-5 w-5" />
            {lang === "si"
              ? "පුහුණු සහ කුසලතා සංවර්ධනය"
              : "Training & Skill Development"}
          </CardTitle>
        </CardHeader>

        <CardContent className="text-muted-foreground">
          {lang === "si"
            ? "පුහුණු කාලසටහන්, වෙනස්කම්, පැමිණීම සහ කුසලතා ඇගයීම් සැලසුම් කර කළමනාකරණය කරන්න."
            : "Plan training schedules, drills, attendance, and skill evaluations."}
        </CardContent>
      </Card>
    </div>
  );
}