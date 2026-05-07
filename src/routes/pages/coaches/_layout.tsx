import { Outlet, createFileRoute } from "@tanstack/react-router";
import { ProtectedRoute } from "@/components/ProtectedRoute";

export const Route = createFileRoute("/pages/coaches/_layout")({
  component: () => (
    <ProtectedRoute>
      <Outlet />
    </ProtectedRoute>
  ),
});
