import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';

// Mock historical decisions data
const generateHistoricalDecisions = () => [
  {
    id: 'DEC-2025-Q4-001',
    date: '2025-12-15',
    title: 'Delay European Expansion',
    description: 'Postpone European market entry by 6 months due to economic uncertainty',
    category: 'Strategic',
    urgency: 'high',
    confidence: 89,
    decidedBy: 'Sarah Chen (CEO)',
    status: 'implemented',
    predictedImpact: { cost_savings: 2500000, revenue_impact: -800000, timeline: '6 months' },
    actualImpact:    { cost_savings: 2800000, revenue_impact: -650000, timeline: '6 months', accuracy: 92 },
    dataWindow: '2025-10-01 to 2025-12-01',
    sources: ['ERP', 'Market Intelligence', 'CRM'],
    aiRecommendation: true,
  },
  {
    id: 'DEC-2025-Q4-002',
    date: '2025-11-20',
    title: 'Accelerate Hiring Freeze',
    description: 'Implement hiring freeze across non-critical roles',
    category: 'Operational',
    urgency: 'urgent',
    confidence: 81,
    decidedBy: 'Sarah Chen (CEO)',
    status: 'implemented',
    predictedImpact: { cost_savings: 1200000, headcount_reduction: -15, timeline: '3 months' },
    actualImpact:    { cost_savings: 1150000, headcount_reduction: -12, timeline: '3 months', accuracy: 88 },
    dataWindow: '2025-09-01 to 2025-11-15',
    sources: ['HR', 'ERP', 'Email'],
    aiRecommendation: true,
  },
  {
    id: 'DEC-2025-Q3-001',
    date: '2025-09-10',
    title: 'Renegotiate Major Client Contract',
    description: 'Proactive outreach to Acme Corp to prevent churn',
    category: 'Sales',
    urgency: 'urgent',
    confidence: 78,
    decidedBy: 'John Smith (VP Sales)',
    status: 'successful',
    predictedImpact: { revenue_saved: 850000, churn_prevention: 1, timeline: '2 months' },
    actualImpact:    { revenue_saved: 950000, churn_prevention: 1, additional_upsell: 200000, timeline: '1.5 months', accuracy: 95 },
    dataWindow: '2025-07-01 to 2025-09-01',
    sources: ['CRM', 'Email', 'Market Intelligence'],
    aiRecommendation: true,
  },
  {
    id: 'DEC-2025-Q3-002',
    date: '2025-08-25',
    title: 'Launch Competitive Response Campaign',
    description: 'Marketing initiative to counter Competitor A funding announcement',
    category: 'Marketing',
    urgency: 'high',
    confidence: 72,
    decidedBy: 'Sarah Chen (CEO)',
    status: 'in-progress',
    predictedImpact: { brand_lift: 15, lead_generation: 500, timeline: '4 months' },
    actualImpact:    { brand_lift: 18, lead_generation: 620, timeline: '3 months', accuracy: 89 },
    dataWindow: '2025-06-01 to 2025-08-20',
    sources: ['Market Intelligence', 'News', 'CRM'],
    aiRecommendation: true,
  },
  {
    id: 'DEC-2025-Q2-001',
    date: '2025-06-30',
    title: 'Optimize Cloud Infrastructure',
    description: 'Migrate to cost-optimized cloud tier',
    category: 'Technology',
    urgency: 'medium',
    confidence: 85,
    decidedBy: 'Maria Garcia (CTO)',
    status: 'successful',
    predictedImpact: { cost_savings: 480000, performance_impact: 'neutral', timeline: '2 months' },
    actualImpact:    { cost_savings: 520000, performance_improvement: 12, timeline: '2.5 months', accuracy: 94 },
    dataWindow: '2025-04-01 to 2025-06-25',
    sources: ['ERP'],
    aiRecommendation: false,
  },
];

const STATUS_STYLE = {
  successful:   { color: '#10b981', bg: 'rgba(16,185,129,0.12)',  label: '✓ Successful' },
  implemented:  { color: '#3b82f6', bg: 'rgba(59,130,246,0.12)',  label: '● Implemented' },
  'in-progress':{ color: '#f59e0b', bg: 'rgba(245,158,11,0.12)',  label: '◐ In Progress' },
  failed:       { color: '#ef4444', bg: 'rgba(239,68,68,0.12)',   label: '✗ Failed' },
};

function AccuracyRing({ value }) {
  const color = value >= 90 ? '#10b981' : value >= 75 ? '#3b82f6' : value >= 60 ? '#f59e0b' : '#ef4444';
  const r = 22, circ = 2 * Math.PI * r, arc = circ * 0.75, filled = arc * (value / 100);
  return (
    <div className="flex flex-col items-center gap-0.5">
      <svg width="56" height="56" style={{ transform: 'rotate(135deg)' }}>
        <circle cx="28" cy="28" r={r} fill="none" stroke="rgba(30,58,95,0.4)" strokeWidth="5"
          strokeDasharray={`${arc} ${circ - arc}`} strokeLinecap="round"/>
        <circle cx="28" cy="28" r={r} fill="none" stroke={color} strokeWidth="5"
          strokeDasharray={`${filled} ${circ - filled}`} strokeLinecap="round"
          style={{ filter: `drop-shadow(0 0 4px ${color})` }}/>
        <text x="28" y="28" textAnchor="middle" fill="white" fontSize="11" fontWeight="700"
          style={{ transform: 'rotate(-135deg)', transformOrigin: '28px 28px' }}>{value}%</text>
      </svg>
      <span className="text-xs" style={{ color }}>accuracy</span>
    </div>
  );
}

export default function History() {
  const { user, hasPermission } = useAuth();
  const [decisions, setDecisions] = useState([]);
  const [filter, setFilter]       = useState('all');
  const [sortBy, setSortBy]       = useState('date');

  useEffect(() => { setDecisions(generateHistoricalDecisions()); }, []);

  const canViewHistory = hasPermission('view_all') || hasPermission('view_team');
  const accentColor    = user?.personaConfig?.accentColor || '#3b82f6';

  if (!canViewHistory) {
    return (
      <div className="p-8 flex items-center justify-center min-h-96">
        <div className="rounded-2xl p-10 text-center max-w-sm"
          style={{ background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.25)' }}>
          <div className="text-5xl mb-4">🔒</div>
          <h2 className="text-xl font-bold text-white mb-2">Limited Access</h2>
          <p className="text-slate-500 text-sm">Decision history is only available to Executives and Managers.</p>
        </div>
      </div>
    );
  }

  const filteredDecisions = decisions.filter(d => {
    if (filter === 'all') return true;
    if (filter === 'ai') return d.aiRecommendation;
    if (filter === 'manual') return !d.aiRecommendation;
    return d.status === filter;
  });

  const sortedDecisions = [...filteredDecisions].sort((a, b) => {
    if (sortBy === 'date')       return new Date(b.date) - new Date(a.date);
    if (sortBy === 'accuracy')   return (b.actualImpact?.accuracy || 0) - (a.actualImpact?.accuracy || 0);
    if (sortBy === 'confidence') return b.confidence - a.confidence;
    return 0;
  });

  const totalDecisions = decisions.length;
  const aiDecisions    = decisions.filter(d => d.aiRecommendation).length;
  const avgAccuracy    = decisions.reduce((s, d) => s + (d.actualImpact?.accuracy || 0), 0) / decisions.length;

  const kpis = [
    { label: 'Total Decisions', value: totalDecisions, color: '#3b82f6', icon: '🎯' },
    { label: 'AI-Powered',      value: `${aiDecisions} (${((aiDecisions / totalDecisions) * 100).toFixed(0)}%)`, color: '#8b5cf6', icon: '🤖' },
    { label: 'Avg. Accuracy',   value: `${avgAccuracy.toFixed(1)}%`, color: '#10b981', icon: '📊' },
    { label: 'Total Value',     value: '$6.9M',  color: '#f59e0b', icon: '💰' },
  ];

  return (
    <div className="p-6 space-y-6 animate-fade-in">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-extrabold text-white mb-1">📜 Decision History & Impact</h1>
        <p className="text-slate-500 text-sm">Track past decisions and their real-world outcomes</p>
      </div>

      {/* KPI Row */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        {kpis.map((k, i) => (
          <div key={i} className="rounded-2xl p-5 transition-all"
            style={{ background: 'rgba(8,15,31,0.9)', border: `1px solid ${k.color}20` }}>
            <div className="text-2xl mb-2">{k.icon}</div>
            <div className="text-2xl font-extrabold mb-0.5" style={{ color: k.color }}>{k.value}</div>
            <div className="text-xs text-slate-500">{k.label}</div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl p-4"
        style={{ background: 'rgba(8,15,31,0.9)', border: '1px solid rgba(30,58,95,0.4)' }}>
        <div className="flex flex-wrap gap-2">
          {[
            { id: 'all',        label: 'All' },
            { id: 'ai',         label: '🤖 AI-Powered' },
            { id: 'successful', label: '✓ Successful' },
            { id: 'in-progress',label: '◐ In Progress' },
          ].map(f => (
            <button key={f.id} onClick={() => setFilter(f.id)}
              className="px-4 py-1.5 rounded-lg text-xs font-semibold transition-all"
              style={{
                background: filter === f.id ? `${accentColor}20` : 'rgba(15,31,61,0.5)',
                border: `1px solid ${filter === f.id ? accentColor + '40' : 'rgba(30,58,95,0.4)'}`,
                color: filter === f.id ? accentColor : '#64748b',
              }}>
              {f.label}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-500">Sort by:</span>
          <select value={sortBy} onChange={e => setSortBy(e.target.value)}
            className="input-dark px-3 py-1.5 rounded-lg text-xs">
            <option value="date">Date</option>
            <option value="accuracy">Accuracy</option>
            <option value="confidence">Confidence</option>
          </select>
        </div>
      </div>

      {/* Decision Cards */}
      <div className="space-y-4">
        {sortedDecisions.map(decision => {
          const s = STATUS_STYLE[decision.status] || STATUS_STYLE.implemented;
          return (
            <div key={decision.id}
              className="rounded-2xl p-5 transition-all hover:-translate-y-0.5 duration-200"
              style={{ background: 'rgba(8,15,31,0.9)', border: '1px solid rgba(30,58,95,0.4)' }}>

              {/* Top */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center flex-wrap gap-2 mb-2">
                    <h3 className="text-base font-bold text-white">{decision.title}</h3>
                    <span className="text-xs px-2.5 py-1 rounded-full font-semibold"
                      style={{ background: s.bg, color: s.color }}>{s.label}</span>
                    {decision.aiRecommendation && (
                      <span className="text-xs px-2.5 py-1 rounded-full font-semibold"
                        style={{ background: 'rgba(139,92,246,0.15)', color: '#8b5cf6', border: '1px solid rgba(139,92,246,0.3)' }}>
                        🤖 AI-Powered
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-slate-400 mb-2">{decision.description}</p>
                  <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500">
                    <span>📅 {new Date(decision.date).toLocaleDateString()}</span>
                    <span>👤 {decision.decidedBy}</span>
                    <span>🔖 {decision.category}</span>
                  </div>
                </div>
                <AccuracyRing value={decision.actualImpact?.accuracy || decision.confidence} />
              </div>

              {/* Impact grid */}
              <div className="grid grid-cols-2 gap-4 pt-4"
                style={{ borderTop: '1px solid rgba(30,58,95,0.4)' }}>
                <div className="rounded-xl p-4"
                  style={{ background: 'rgba(59,130,246,0.06)', border: '1px solid rgba(59,130,246,0.15)' }}>
                  <h4 className="text-xs font-semibold text-blue-400 mb-2 uppercase tracking-wider">🎯 Predicted Impact</h4>
                  <div className="space-y-1.5">
                    {Object.entries(decision.predictedImpact).map(([key, value]) => (
                      <div key={key} className="flex justify-between text-xs">
                        <span className="text-slate-500 capitalize">{key.replace(/_/g, ' ')}</span>
                        <span className="text-slate-300 font-semibold">
                          {typeof value === 'number' && value > 1000 ? `$${(value / 1000000).toFixed(1)}M` : String(value)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="rounded-xl p-4"
                  style={{ background: 'rgba(16,185,129,0.06)', border: '1px solid rgba(16,185,129,0.15)' }}>
                  <h4 className="text-xs font-semibold text-green-400 mb-2 uppercase tracking-wider">✅ Actual Impact</h4>
                  <div className="space-y-1.5">
                    {Object.entries(decision.actualImpact).filter(([k]) => k !== 'accuracy').map(([key, value]) => (
                      <div key={key} className="flex justify-between text-xs">
                        <span className="text-slate-500 capitalize">{key.replace(/_/g, ' ')}</span>
                        <span className="text-slate-300 font-semibold">
                          {typeof value === 'number' && value > 1000 ? `$${(value / 1000000).toFixed(1)}M` : String(value)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="mt-3 pt-3 flex items-center gap-2 flex-wrap"
                style={{ borderTop: '1px solid rgba(30,58,95,0.3)' }}>
                <span className="text-xs text-slate-600">Sources:</span>
                {decision.sources.map(src => (
                  <span key={src} className="text-xs px-2 py-0.5 rounded"
                    style={{ background: 'rgba(30,58,95,0.5)', color: '#94a3b8' }}>{src}</span>
                ))}
                <span className="ml-auto text-xs text-slate-600">
                  Confidence: <span className="font-semibold" style={{ color: accentColor }}>{decision.confidence}%</span>
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
