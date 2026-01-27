export default function DecisionPanel({ decisions }) {
  return (
    <div className="bg-white rounded-xl shadow p-4">
      <h2 className="font-semibold mb-3">Decision Pointers</h2>
      {decisions.map((d, i) => (
        <div key={i} className="mb-3">
          <div className="font-medium">{d.title}</div>
          <div className="text-sm text-gray-500">
            Impact: {d.impact} | Confidence: {d.confidence}%
          </div>
        </div>
      ))}
    </div>
  );
}
