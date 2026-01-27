export default function HealthMetrics() {
  const metrics = [
    { label: "Org Health", value: 82 },
    { label: "Revenue Stability", value: 76 },
    { label: "Execution Velocity", value: 69 },
    { label: "Risk Index", value: 34 },
  ];

  return (
    <div className="grid grid-cols-2 gap-4">
      {metrics.map((m, i) => (
        <div key={i} className="bg-white rounded-xl shadow p-4 text-center">
          <div className="text-3xl font-bold">{m.value}%</div>
          <div className="text-sm text-gray-500">{m.label}</div>
        </div>
      ))}
    </div>
  );
}
