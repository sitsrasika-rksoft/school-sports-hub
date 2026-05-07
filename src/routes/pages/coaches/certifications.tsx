import { createFileRoute } from "@tanstack/react-router";
import Certifications from "@/components/coaches/Certifications";

export const Route = createFileRoute("/pages/coaches/certifications")({
  component: () => (
    <>
      <h1 className="text-3xl font-bold mb-4">Certifications</h1>
      <Certifications />
    </>
  ),
});