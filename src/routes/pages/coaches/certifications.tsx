import { ProtectedRoute } from '@/components/ProtectedRoute';
import { useLanguage } from '@/lib/language-context';
import { createFileRoute } from '@tanstack/react-router'


export const Route = createFileRoute("/pages/coaches/certifications")({
  component: () => (
    <>
      <ProtectedRoute>
        <CertificationsPage />
      </ProtectedRoute>
   
    </>
  ),
});


function CertificationsPage() {
  const { lang } = useLanguage();

  return (
  <div className="border rounded-lg p-4">
      <h2 className="text-lg font-semibold mb-2">Certifications</h2>
      <p className="text-muted-foreground">
        Manage coach certifications (CPR, licenses, expiry dates).
      </p>
    </div>
  );
}
