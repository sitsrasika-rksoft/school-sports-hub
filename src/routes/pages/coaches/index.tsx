import { createFileRoute } from "@tanstack/react-router";
import Overview from "../../../components/coaches/Overview";


export const Route = createFileRoute("/pages/coaches/")({
  component: () => (
    <>
      <h1 className="text-3xl font-bold mb-4">Coaches & Staff</h1>
      <Overview />
    </>
  ),
});