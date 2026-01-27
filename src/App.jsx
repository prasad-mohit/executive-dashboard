import "./index.css";

import SourceStatus from "./components/SourceStatus";
import HealthMetrics from "./components/HealthMetrics";
import AttentionList from "./components/AttentionList";
import DecisionPanel from "./components/DecisionPanel";
import ReasoningPanel from "./components/ReasoningPanel";
import RecommendedActions from "./components/RecommendedActions";
import CEOSwitch from "./components/CEOSwitch";

/* ---------------- SAFE DEFAULT DATA ---------------- */

const attentionItems = [
  { id: 1, title: "Revenue Risk Detected", severity: "high" },
  { id: 2, title: "Competitor Funding Announced", severity: "medium" },
  { id: 3, title: "Market Sentiment Turning Negative", severity: "medium" },
];

const decisions = [
  { id: 1, title: "Revenue Risk", impact: "Medium", confidence: 73 },
  { id: 2, title: "Expansion Delay", impact: "High", confidence: 89 },
  { id: 3, title: "Hiring Slowdown", impact: "Medium", confidence: 81 },
];

const reasoning = {
  headline: "Revenue Risk Detected",
  summary:
    "Risk identified due to CRM deal slippage, competitor funding, and negative market sentiment.",
  signals: [
    { source: "CRM", detail: "3 high-value deals delayed >21 days", weight: 35 },
    { source: "News", detail: "Competitor raised Series C funding", weight: 25 },
    { source: "Email", detail: "Repeated escalation emails from Sales Head", weight: 20 },
    { source: "Market", detail: "Negative industry sentiment detected", weight: 20 },
  ],
};

const recommendedActions = [
  "Schedule review with CRO",
  "Re-evaluate pricing strategy",
  "Increase competitive intelligence tracking",
];

/* ---------------- APP ---------------- */

export default function App() {
  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-white shadow px-8 py-4 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">
            Executive OS <span className="text-green-600">LIVE</span>
          </h1>
          <p className="text-sm text-gray-500">
            Cognitive decision intelligence powered by agents
          </p>
        </div>
        <CEOSwitch />
      </header>

      {/* Main Grid */}
      <main className="p-8 grid grid-cols-12 gap-6">
        {/* LEFT */}
        <div className="col-span-3 space-y-6">
          <SourceStatus />
        </div>

        {/* CENTER */}
        <div className="col-span-6 space-y-6">
          <HealthMetrics />
          <AttentionList items={attentionItems} />
          <ReasoningPanel reasoning={reasoning} />
          <RecommendedActions actions={recommendedActions} />
        </div>

        {/* RIGHT */}
        <div className="col-span-3 space-y-6">
          <DecisionPanel decisions={decisions} />
        </div>
      </main>
    </div>
  );
}
