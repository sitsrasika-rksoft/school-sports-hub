import { createFileRoute } from "@tanstack/react-router";
import CoachDirectory from "../../../components/coaches/CoachDirectory";


export const Route = createFileRoute("/pages/coaches/directory")({
  component: () => (
    <>
      <h1 className="text-3xl font-bold mb-4">Coach Directory</h1>
      <CoachDirectory />
    </>
  ),
});