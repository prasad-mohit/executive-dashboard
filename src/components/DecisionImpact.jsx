export default function DecisionImpact() {
  return (
    <div className="bg-white rounded-xl shadow p-6 space-y-4">
      <h3 className="font-semibold text-gray-800">
        📊 Decision Impact Analysis
      </h3>

      <div className="grid grid-cols-3 gap-4 text-sm">
        <div className="p-4 bg-green-50 rounded border">
          <div className="font-semibold text-green-700">If Action Taken</div>
          <ul className="mt-2 space-y-1 text-gray-700">
            <li>• Revenue risk reduced</li>
            <li>• Sales escalation resolved</li>
            <li>• Competitive pressure mitigated</li>
          </ul>
        </div>

        <div className="p-4 bg-red-50 rounded border">
          <div className="font-semibold text-red-700">If Delayed</div>
          <ul className="mt-2 space-y-1 text-gray-700">
            <li>• Deal slippage worsens</li>
            <li>• Pipeline confidence drops</li>
            <li>• Board-level risk escalates</li>
          </ul>
        </div>

        <div className="p-4 bg-gray-50 rounded border">
          <div className="font-semibold">Estimated Impact</div>
          <ul className="mt-2 space-y-1">
            <li>📉 Revenue: -6% to -9%</li>
            <li>⏱ Timeline: 30–45 days</li>
            <li>🎯 Confidence: 76%</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
