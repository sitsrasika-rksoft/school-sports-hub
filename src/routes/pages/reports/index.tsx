import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/pages/reports/")({
  component: ReportsIndexPage,
});

function ReportsIndexPage() {
  return <h1>Reports Overview</h1>;
}