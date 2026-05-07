import { createFileRoute } from "@tanstack/react-router";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Building } from "lucide-react";
import { useLanguage } from "@/lib/language-context";

export const Route = createFileRoute("/pages/facilities")({
  component: () => (
    <ProtectedRoute>
      <FacilitiesPage />
    </ProtectedRoute>
  ),
});

function FacilitiesPage() {
  const { lang } = useLanguage();

  return (
    <div className="space-y-6">
      {/* Page Title */}
      <h1 className="text-3xl font-bold">
        {lang === "si" ? "පහසුකම්" : "Facilities"}
      </h1>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building className="h-5 w-5" />
            {lang === "si"
              ? "ක්‍රීඩා යටිතල පහසුකම්"
              : "Sports Infrastructure"}
          </CardTitle>
        </CardHeader>

        <CardContent className="text-muted-foreground">
          {lang === "si"
            ? "ක්‍රීඩා පිටි, අංගන, උපකරණ සහ පහසුකම් භාවිතය කළමනාකරණය කරන්න."
            : "Manage grounds, courts, equipment, and facility usage."}
        </CardContent>
      </Card>
    </div>
  );
}