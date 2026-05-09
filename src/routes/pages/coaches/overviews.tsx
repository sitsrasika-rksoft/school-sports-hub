import { ProtectedRoute } from '@/components/ProtectedRoute';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { useLanguage } from '@/lib/language-context';
import { createFileRoute } from '@tanstack/react-router'
import { UserCheck, Award, Users, ClipboardList } from 'lucide-react';

export const Route = createFileRoute('/pages/coaches/overviews')({
  component: () => (
    <>
      <ProtectedRoute>
        <OverviewsPage />
      </ProtectedRoute>
   
    </>
  ),
});


function OverviewsPage() {
  const { lang } = useLanguage();

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold">
          {lang === "si"
            ? "පුහුණුකරුවන් සහ කාර්ය මණ්ඩලය"
            : "Coaches & Staff"}
        </h1>
        <p className="text-muted-foreground mt-1 max-w-2xl">
          {lang === "si"
            ? "පාසල් පුහුණුකරුවන් කළමනාකරණය කරන්න, සහතික නිරීක්ෂණය කරන්න, සහ ක්‍රීඩකයින් වෙන් කර ආරක්ෂිත හා ක්‍රමවත් ක්‍රීඩා සංවර්ධනයක් සහතික කරන්න."
            : "Manage school coaches, track certifications, and assign athletes to ensure safe, structured, and effective sports development."}
        </p>
      </div>

      {/* Feature Overview */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <UserCheck className="h-5 w-5 text-primary" />
              {lang === "si"
                ? "පුහුණුකරණ කළමනාකරණය"
                : "Coaching Management"}
            </CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            {lang === "si"
              ? "නිශ්චිත භූමිකා සහ වගකීම් සමඟ පුහුණුකරුවන් සහ කාර්ය මණ්ඩලය එක් කරන්න සහ කළමනාකරණය කරන්න."
              : "Add and manage coaches and staff members with defined roles and responsibilities."}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Award className="h-5 w-5 text-primary" />
              {lang === "si" ? "සහතික" : "Certifications"}
            </CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            {lang === "si"
              ? "පුහුණුකරණ සුදුසුකම්, ආරක්ෂණ පුහුණු සහ සහතික වල කල් ඉකුත් වන දිනයන් නිරීක්ෂණය කරන්න."
              : "Track coaching qualifications, safety training, and certification expiry dates."}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5 text-primary" />
              {lang === "si"
                ? "ක්‍රීඩක වෙන්කිරීම්"
                : "Athlete Assignments"}
            </CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            {lang === "si"
              ? "පුහුණුකරුවන්ට ක්‍රීඩකයින් වෙන් කර පැහැදිලි අධීක්ෂණය, වගකීම සහ සංවර්ධන මාර්ගයන් සහතික කරන්න."
              : "Assign athletes to coaches and ensure clear supervision, accountability, and development pathways."}
          </CardContent>
        </Card>
      </div>

      {/* Coach Directory */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ClipboardList className="h-5 w-5 text-primary" />
            {lang === "si"
              ? "පුහුණුකරුවන්ගේ නාමාවලිය"
              : "Coach Directory"}
          </CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground">
          {lang === "si"
            ? "පුහුණුකරුවන්ගේ ලැයිස්තු, වෙන්කිරීම් සහ කළමනාකරණ ක්‍රියා මෙහි දැක්වේ."
            : "Coach listings, assignments, and management actions will appear here."}
        </CardContent>
      </Card>
    </div>
  );
}