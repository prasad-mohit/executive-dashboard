import { useEffect, useState } from 'react';

const AGENTS = [
  { name: 'Data Aggregator', short: 'DA', color: '#3b82f6', step: 'Aggregate Data' },
  { name: 'Risk Analyzer',   short: 'RA', color: '#f59e0b', step: 'Analyze Risks' },
  { name: 'Recommender',     short: 'RR', color: '#10b981', step: 'Generate Actions' },
  { name: 'Priority Scorer', short: 'PS', color: '#8b5cf6', step: 'Prioritize' },
];

export default function AgentOrchestrationPanel({ orchestrationData }) {
  const [expanded, setExpanded] = useState(true);
  const [activeAgent, setActiveAgent] = useState(0);

  useEffect(() => {
    const t = setInterval(() => setActiveAgent(i => (i + 1) % 4), 2000);
    return () => clearInterval(t);
  }, []);

  if (!orchestrationData) return null;
  const { executionLog, timestamp } = orchestrationData;

  const agentColorMap = {
    'Data Aggregator': '#3b82f6',
    'Risk Analyzer':   '#f59e0b',
    'Decision Recommender': '#10b981',
    'Priority Scorer': '#8b5cf6',
  };

  return (
    <div
      className="rounded-2xl overflow-hidden"
      style={{ background: 'rgba(8,15,31,0.9)', border: '1px solid rgba(30,58,95,0.4)' }}
    >
      {/* Header */}
      <div
        className="flex items-center justify-between px-5 py-4"
        style={{ borderBottom: '1px solid rgba(30,58,95,0.4)' }}
      >
        <div>
          <h3 className="text-sm font-semibold text-slate-300">🤖 AI Agent Orchestration</h3>
          <p className="text-xs text-slate-600 mt-0.5">
            {timestamp ? new Date(timestamp).toLocaleTimeString() : 'Running...'}
          </p>
        </div>
        <button
          onClick={() => setExpanded(v => !v)}
          className="text-xs text-blue-400 hover:text-blue-300 transition-colors"
        >
          {expanded ? '▲ Collapse' : '▼ Expand'}
        </button>
      </div>

      {/* Agent pipeline flow */}
      <div className="px-5 py-4" style={{ borderBottom: '1px solid rgba(30,58,95,0.3)' }}>
        <div className="flex items-center justify-between">
          {AGENTS.map((agent, i) => (
            <div key={i} className="flex items-center">
              <div className="flex flex-col items-center gap-1">
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center text-xs font-bold transition-all duration-300"
                  style={{
                    background: activeAgent === i ? `${agent.color}30` : 'rgba(15,31,61,0.8)',
                    border: `1.5px solid ${activeAgent === i ? agent.color : agent.color + '40'}`,
                    color: agent.color,
                    boxShadow: activeAgent === i ? `0 0 14px ${agent.color}55` : 'none',
                  }}
                >
                  {agent.short}
                </div>
                <span className="text-xs text-slate-600 text-center leading-tight w-12">{agent.step}</span>
              </div>
              {i < AGENTS.length - 1 && (
                <div
                  className="w-5 h-px mx-1 mb-4 transition-all duration-300"
                  style={{ background: activeAgent > i ? '#3b82f6' : 'rgba(30,58,95,0.6)' }}
                />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Execution log */}
      {expanded && (
        <div className="px-5 py-4 space-y-3 max-h-64 overflow-y-auto">
          {executionLog?.map((log, idx) => {
            const color = agentColorMap[log.agent] || '#64748b';
            return (
              <div
                key={idx}
                className="flex gap-3 rounded-xl p-3 transition-all"
                style={{
                  background: `${color}08`,
                  border: `1px solid ${color}20`,
                  borderLeft: `3px solid ${color}`,
                }}
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <span
                      className="text-xs font-semibold px-2 py-0.5 rounded"
                      style={{ background: `${color}20`, color }}
                    >
                      {log.agent}
                    </span>
                    <span className="text-xs text-slate-600">
                      {new Date(log.timestamp).toLocaleTimeString()}
                    </span>
                  </div>
                  <div className="text-xs text-slate-400">{log.step}</div>
                  <div className="flex items-center gap-3 mt-1">
                    <span
                      className="text-xs px-1.5 py-0.5 rounded"
                      style={{
                        background: log.status === 'completed' ? 'rgba(16,185,129,0.15)' : 'rgba(245,158,11,0.15)',
                        color: log.status === 'completed' ? '#10b981' : '#f59e0b',
                      }}
                    >
                      {log.status}
                    </span>
                    <span className="text-xs text-slate-600">
                      {(log.dataSize / 1024).toFixed(1)} KB processed
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
