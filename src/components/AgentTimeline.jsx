export default function AgentTimeline() {
  return (
    <div className="bg-white rounded-xl shadow p-6">
      <h3 className="font-semibold text-gray-800 mb-4">
        🤖 Agent Reasoning Timeline
      </h3>

      <ul className="space-y-3 text-sm">
        <li>🧠 CRM Agent → Deal delays detected</li>
        <li>🌍 Market Agent → Negative sentiment identified</li>
        <li>📰 News Agent → Competitor funding alert</li>
        <li>📈 Revenue Agent → Risk threshold crossed</li>
        <li>👑 CEO Control Agent → Escalation recommended</li>
      </ul>
    </div>
  );
}
