import { createFileRoute } from "@tanstack/react-router";
import Performance from "@/components/coaches/Performance";

export const Route = createFileRoute("/pages/coaches/performance")({
  component: () => (
    <>
      <h1 className="text-3xl font-bold mb-4">Performance Tracking</h1>
      <Performance />
    </>
  ),
});