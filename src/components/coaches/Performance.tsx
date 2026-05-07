export default function Performance() {
  return (
    <div className="grid sm:grid-cols-3 gap-4">
      <Stat title="Attendance" value="96%" />
      <Stat title="Sessions Conducted" value="146" />
      <Stat title="Athlete Improvement" value="82%" />
    </div>
  );
}

function Stat({ title, value }: { title: string; value: string }) {
  return (
    <div className="border rounded-lg p-4 text-center">
      <p className="text-xl font-bold">{value}</p>
      <p className="text-sm text-muted-foreground">{title}</p>
    </div>
  );
}