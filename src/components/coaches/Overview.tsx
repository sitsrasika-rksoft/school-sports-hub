export default function Overview() {
  return (
    <div className="grid sm:grid-cols-4 gap-4">
      <Card title="Total Coaches" value="8" />
      <Card title="Active Certifications" value="21" />
      <Card title="Athletes Assigned" value="124" />
      <Card title="Performance Score" value="82%" />
    </div>
  );
}

function Card({ title, value }: { title: string; value: string }) {
  return (
    <div className="border rounded-lg p-4 text-center">
      <p className="text-2xl font-bold">{value}</p>
      <p className="text-sm text-muted-foreground">{title}</p>
    </div>
  );
}