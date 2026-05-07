import AthleteAssignments from "@/components/coaches/AthleteAssignments";
import { createFileRoute } from "@tanstack/react-router";


export const Route = createFileRoute("/pages/coaches/assignments")({
  component: () => (
    <>
      <h1 className="text-3xl font-bold mb-4">Athlete Assignment</h1>
      <AthleteAssignments />
    </>
  ),
});