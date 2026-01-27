import reasoning from "../data/reasoning.json";

export default function ReasoningPanel() {
  return (
    <div className="bg-white rounded-xl shadow p-6 space-y-6">
      
      {/* Header */}
      <div>
        <h2 className="text-xl font-semibold text-gray-900">
          🧠 AI Reasoning Panel
        </h2>
        <p className="text-sm text-gray-500">
          Why this decision surfaced on the CEO dashboard
        </p>
      </div>

      {/* Summary */}
      <div className="border-l-4 border-red-500 bg-red-50 p-4 rounded">
        <h3 className="font-medium text-red-700">
          {reasoning.title}
        </h3>
        <p className="text-sm text-gray-700 mt-1">
          {reasoning.summary}
        </p>
        <div className="mt-2 text-sm">
          <span className="font-semibold">Impact:</span> {reasoning.impact} &nbsp;|&nbsp;
          <span className="font-semibold">Confidence:</span>{" "}
          {Math.round(reasoning.overall_confidence * 100)}%
        </div>
      </div>

      {/* Signals */}
      <div>
        <h3 className="font-semibold text-gray-800 mb-2">
          🔍 Contributing Signals
        </h3>

        <div className="space-y-3">
          {reasoning.signals.map((s, idx) => (
            <div
              key={idx}
              className="flex items-center justify-between bg-gray-50 rounded-lg p-3"
            >
              <div>
                <div className="text-sm font-medium text-gray-800">
                  {s.source}
                </div>
                <div className="text-sm text-gray-600">
                  {s.signal}
                </div>
              </div>

              <div className="text-sm font-semibold text-gray-700">
                {Math.round(s.weight * 100)}%
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Agent Consensus */}
      <div>
        <h3 className="font-semibold text-gray-800 mb-2">
          🤖 Agent Consensus
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {reasoning.agents.map((a, idx) => (
            <div
              key={idx}
              className="border rounded-lg p-4"
            >
              <div className="font-medium text-gray-900">
                {a.name}
              </div>
              <div className="text-sm text-gray-600 mt-1">
                {a.verdict}
              </div>
              <div className="mt-2 text-sm">
                Confidence:{" "}
                <span className="font-semibold">
                  {Math.round(a.confidence * 100)}%
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}
