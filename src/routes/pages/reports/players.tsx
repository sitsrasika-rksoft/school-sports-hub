
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useLanguage } from "@/lib/language-context";
import { createFileRoute } from "@tanstack/react-router";
import { Calendar, Construction } from "lucide-react";

export const Route = createFileRoute("/pages/reports/players")({
  component: () => (
    <ProtectedRoute>
      <PlayesPage />
    </ProtectedRoute>
  ),
});


function PlayesPage() {
  const { lang } = useLanguage();

  
return (
    <div className="space-y-6">
      {/* PAGE TITLE */}
      <h1 className="text-3xl font-bold">
        {lang === "si" ? "ක්‍රීඩක වාර්තා" : "Players Reports"}
      </h1>

      {/* UNDER CONSTRUCTION CARD */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Construction className="h-5 w-5 text-orange-500" />
            {lang === "si" ? "ඉදිකිරීමේ අදියරේ" : "Under Construction"}
          </CardTitle>
        </CardHeader>

        <CardContent className="text-muted-foreground">
          {lang === "si"
            ? "මෙම පිටුව දැනට සංවර්ධන අදියරේ පවතී. ඉදිරියේදී ක්‍රීඩකයන්ගේ වාර්තා, සංඛ්‍යාලේඛන සහ විශ්ලේෂණ මෙහි ලබා ගත හැක."
            : "This page is currently under development. Player reports, statistics, and analytics will be available here soon."}
        </CardContent>
      </Card>
    </div>
  );
}
