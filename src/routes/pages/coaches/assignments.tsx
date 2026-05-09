import { ProtectedRoute } from "@/components/ProtectedRoute";
import { useLanguage } from "@/lib/language-context";
import { createFileRoute } from "@tanstack/react-router";


export const Route = createFileRoute("/pages/coaches/assignments")({
  component: () => (
    <>
      <ProtectedRoute>
        <AthleteAssignmentsPage />
      </ProtectedRoute>
   
    </>
  ),
});


function AthleteAssignmentsPage() {
  const { lang } = useLanguage();

  return (
     <div className="border rounded-lg p-4">
      <h2 className="text-lg font-semibold mb-2">Athlete Assignment</h2>
      <p className="text-muted-foreground">
        Assign athletes to coaches and manage responsibilities.
      </p>
    </div>
  );
}


// certifications.tsx
// directory.tsx
// performance.tsx

