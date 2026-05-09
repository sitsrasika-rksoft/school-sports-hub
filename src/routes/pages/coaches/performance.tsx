import { ProtectedRoute } from '@/components/ProtectedRoute';
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/pages/coaches/performance')({
  component: () => (
    <>
      <ProtectedRoute>
        <PerformancePage />
      </ProtectedRoute>
   
    </>
  ),
});

function PerformancePage() {
  return <div>Hello "/pages/coaches/performance"!</div>
}
