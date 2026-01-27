import { useEffect, useState } from 'react';

export default function AgentOrchestrationPanel({ orchestrationData }) {
  const [expanded, setExpanded] = useState(true);

  if (!orchestrationData) return null;

  const { executionLog, timestamp } = orchestrationData;

  const agentColors = {
    'Data Aggregator': 'bg-blue-100 text-blue-800',
    'Risk Analyzer': 'bg-purple-100 text-purple-800',
    'Decision Recommender': 'bg-green-100 text-green-800',
    'Priority Scorer': 'bg-orange-100 text-orange-800'
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold text-gray-800">
          🤖 AI Agent Orchestration
        </h2>
        <button
          onClick={() => setExpanded(!expanded)}
          className="text-sm text-blue-600 hover:text-blue-800"
        >
          {expanded ? 'Collapse' : 'Expand'}
        </button>
      </div>

      {expanded && (
        <div className="space-y-3">
          <div className="text-xs text-gray-500 mb-3">
            Last execution: {new Date(timestamp).toLocaleString()}
          </div>

          {executionLog.map((log, idx) => (
            <div
              key={idx}
              className="border-l-4 border-blue-500 pl-4 py-2"
            >
              <div className="flex items-center justify-between mb-1">
                <span
                  className={`text-xs font-semibold px-2 py-1 rounded ${
                    agentColors[log.agent] || 'bg-gray-100 text-gray-800'
                  }`}
                >
                  {log.agent}
                </span>
                <span className="text-xs text-gray-500">
                  {new Date(log.timestamp).toLocaleTimeString()}
                </span>
              </div>
              <div className="text-sm text-gray-700">
                <strong>Step:</strong> {log.step}
              </div>
              <div className="text-xs text-gray-500 mt-1">
                Status: {log.status} • Data processed: {(log.dataSize / 1024).toFixed(1)} KB
              </div>
            </div>
          ))}

          {/* Agent Flow Visualization */}
          <div className="mt-6 pt-4 border-t">
            <h3 className="text-sm font-semibold text-gray-700 mb-3">Agent Flow</h3>
            <div className="flex items-center justify-between">
              <div className="text-center flex-1">
                <div className="w-12 h-12 bg-blue-500 rounded-full mx-auto flex items-center justify-center text-white font-bold mb-2">
                  1
                </div>
                <div className="text-xs text-gray-600">Aggregate Data</div>
              </div>
              <div className="text-gray-400">→</div>
              <div className="text-center flex-1">
                <div className="w-12 h-12 bg-purple-500 rounded-full mx-auto flex items-center justify-center text-white font-bold mb-2">
                  2
                </div>
                <div className="text-xs text-gray-600">Analyze Risks</div>
              </div>
              <div className="text-gray-400">→</div>
              <div className="text-center flex-1">
                <div className="w-12 h-12 bg-green-500 rounded-full mx-auto flex items-center justify-center text-white font-bold mb-2">
                  3
                </div>
                <div className="text-xs text-gray-600">Generate Actions</div>
              </div>
              <div className="text-gray-400">→</div>
              <div className="text-center flex-1">
                <div className="w-12 h-12 bg-orange-500 rounded-full mx-auto flex items-center justify-center text-white font-bold mb-2">
                  4
                </div>
                <div className="text-xs text-gray-600">Prioritize</div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
