import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';

const PRI = {
  urgent: { color: '#ef4444', bg: 'rgba(239,68,68,0.08)',  border: 'rgba(239,68,68,0.28)',  label: '🔴 Urgent', glow: '0 0 12px rgba(239,68,68,0.25)'  },
  high:   { color: '#f97316', bg: 'rgba(249,115,22,0.08)', border: 'rgba(249,115,22,0.28)', label: '🟠 High',   glow: '0 0 12px rgba(249,115,22,0.25)' },
  medium: { color: '#f59e0b', bg: 'rgba(245,158,11,0.06)', border: 'rgba(245,158,11,0.2)',  label: '🟡 Medium', glow: 'none' },
  low:    { color: '#10b981', bg: 'rgba(16,185,129,0.06)', border: 'rgba(16,185,129,0.2)',  label: '🟢 Low',    glow: 'none' },
};
const TYPE_ICON = { revenue:'💰', finance:'📊', sales:'🤝', retention:'🔄', talent:'👥', competition:'⚔️', compliance:'⚖️', operations:'⚙️', strategy:'🎯' };
const EFFORT_COLOR = { low:'#10b981', medium:'#f59e0b', high:'#ef4444' };

/* ── Rec Drilldown Modal ── */
function RecDrilldown({ rec, onClose, canApprove }) {
  const [approved, setApproved] = useState(false);
  const [deferred, setDeferred] = useState(false);
  const pri = PRI[rec.priority] || PRI.medium;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(2,8,23,0.85)', backdropFilter: 'blur(6px)' }}
      onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl"
        style={{ background: 'rgba(8,15,31,0.98)', border: `1px solid ${pri.border}`, boxShadow: pri.glow }}>

        {/* Header */}
        <div className="sticky top-0 px-6 py-4 flex items-start justify-between"
          style={{ background: 'rgba(8,15,31,0.98)', borderBottom: `1px solid ${pri.border}` }}>
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xl flex-shrink-0"
              style={{ background: `${pri.color}18`, border: `1px solid ${pri.color}35` }}>
              {TYPE_ICON[rec.type] || '💡'}
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs font-bold px-2 py-0.5 rounded"
                  style={{ background: `${pri.color}20`, color: pri.color }}>{pri.label}</span>
                <span className="text-xs px-2 py-0.5 rounded font-semibold"
                  style={{ background: 'rgba(16,185,129,0.12)', color: '#10b981', border: '1px solid rgba(16,185,129,0.25)' }}>
                  ROI: {rec.roi_range}
                </span>
                <span className="text-xs text-slate-500">Payback: {rec.payback_days}d</span>
              </div>
              <h2 className="text-base font-bold text-white mt-1">{rec.title}</h2>
            </div>
          </div>
          <button onClick={onClose}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-white transition-colors flex-shrink-0"
            style={{ background: 'rgba(30,58,95,0.4)' }}>✕</button>
        </div>

        <div className="px-6 py-5 space-y-5">

          {/* Summary */}
          <div className="rounded-xl px-4 py-3"
            style={{ background: `${pri.color}07`, border: `1px solid ${pri.color}20` }}>
            <p className="text-sm text-slate-300 leading-relaxed">{rec.summary}</p>
          </div>

          {/* Metrics row */}
          <div className="grid grid-cols-4 gap-3">
            {[
              { label: 'Confidence',    value: `${rec.confidence}%`,     color: '#60a5fa' },
              { label: 'ROI Estimate',  value: rec.roi_estimate,          color: '#10b981' },
              { label: 'Effort Level',  value: rec.effort,                color: EFFORT_COLOR[rec.effort] || '#f59e0b' },
              { label: 'Payback',       value: `${rec.payback_days} days`,color: '#a78bfa' },
            ].map(m => (
              <div key={m.label} className="rounded-xl px-3 py-2.5 text-center"
                style={{ background: 'rgba(15,31,61,0.6)', border: '1px solid rgba(30,58,95,0.4)' }}>
                <div className="text-xs text-slate-500 mb-1">{m.label}</div>
                <div className="text-sm font-bold capitalize" style={{ color: m.color }}>{m.value}</div>
              </div>
            ))}
          </div>

          {/* Action plan */}
          <div>
            <div className="text-xs font-semibold text-slate-400 mb-3 uppercase tracking-wider">
              📋 Action Plan ({rec.actions?.length} steps)
            </div>
            <div className="space-y-2">
              {(rec.actions || []).map((a) => (
                <div key={a.step} className="flex items-start gap-3 rounded-xl px-4 py-3"
                  style={{ background: 'rgba(15,31,61,0.5)', border: '1px solid rgba(30,58,95,0.35)' }}>
                  <div className="w-6 h-6 rounded-lg flex items-center justify-center text-xs font-bold flex-shrink-0"
                    style={{ background: `${pri.color}25`, color: pri.color }}>{a.step}</div>
                  <div className="flex-1">
                    <p className="text-xs text-slate-300 leading-relaxed">{a.action}</p>
                    <div className="flex items-center gap-3 mt-1">
                      <span className="text-xs text-slate-600">👤 {a.owner}</span>
                      <span className="text-xs text-slate-600">⏱ Day {a.days}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Expected impact */}
          <div className="rounded-xl px-4 py-3"
            style={{ background: 'rgba(16,185,129,0.07)', border: '1px solid rgba(16,185,129,0.2)' }}>
            <div className="text-xs font-semibold text-green-400 mb-1 uppercase tracking-wider">Expected Impact</div>
            <p className="text-sm text-slate-300">{rec.expectedImpact}</p>
          </div>

          {/* KPIs */}
          {rec.kpis?.length > 0 && (
            <div>
              <div className="text-xs font-semibold text-slate-400 mb-2 uppercase tracking-wider">Success KPIs</div>
              <div className="flex flex-wrap gap-2">
                {rec.kpis.map(k => (
                  <span key={k} className="text-xs px-3 py-1.5 rounded-full"
                    style={{ background: 'rgba(59,130,246,0.1)', color: '#60a5fa', border: '1px solid rgba(59,130,246,0.2)' }}>
                    📈 {k}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Affected systems */}
          {rec.affected_systems?.length > 0 && (
            <div>
              <div className="text-xs font-semibold text-slate-400 mb-2 uppercase tracking-wider">Affected Systems</div>
              <div className="flex flex-wrap gap-2">
                {rec.affected_systems.map(s => (
                  <span key={s} className="text-xs px-3 py-1.5 rounded-full"
                    style={{ background: 'rgba(139,92,246,0.1)', color: '#a78bfa', border: '1px solid rgba(139,92,246,0.2)' }}>
                    {s}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Action footer */}
          <div className="flex items-center gap-3 pt-2 border-t" style={{ borderColor: 'rgba(30,58,95,0.4)' }}>
            <span className="text-xs text-slate-500 flex-1">ID: {rec.id}</span>
            {canApprove && !approved && !deferred && (
              <>
                <button onClick={() => setApproved(true)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold transition-all"
                  style={{ background: 'rgba(16,185,129,0.15)', color: '#10b981', border: '1px solid rgba(16,185,129,0.3)' }}>
                  ✓ Approve & Assign
                </button>
                <button onClick={() => setDeferred(true)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold transition-all"
                  style={{ background: 'rgba(100,116,139,0.15)', color: '#94a3b8', border: '1px solid rgba(100,116,139,0.3)' }}>
                  ⏱ Defer
                </button>
              </>
            )}
            {approved && <span className="text-xs font-bold text-green-400 px-3 py-2 rounded-xl" style={{ background: 'rgba(16,185,129,0.15)' }}>✓ Approved</span>}
            {deferred && <span className="text-xs font-bold text-slate-400 px-3 py-2 rounded-xl" style={{ background: 'rgba(100,116,139,0.15)' }}>Deferred</span>}
            <button onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400"
              style={{ background: 'rgba(30,58,95,0.3)', border: '1px solid rgba(30,58,95,0.4)' }}>
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ════════════════════════════════ MAIN PANEL ═══════════════════════════════ */
export default function RecommendationsPanel({ recommendations }) {
  const { user, hasPermission } = useAuth();
  const [selected, setSelected] = useState(null);
  const [filter, setFilter]     = useState('all');

  const canApprove   = hasPermission('approve_decisions');
  const canRecommend = hasPermission('recommend_decisions');
  const limit        = user?.role === 'analyst' ? 2 : recommendations.length;
  const accentColor  = user?.personaConfig?.accentColor || '#3b82f6';

  const urgentCount = recommendations.filter(r => r.priority === 'urgent').length;
  const highCount   = recommendations.filter(r => r.priority === 'high').length;

  const filtered = recommendations
    .filter(r => filter === 'all' || r.priority === filter)
    .slice(0, limit);

  return (
    <>
      {selected && (
        <RecDrilldown rec={selected} onClose={() => setSelected(null)} canApprove={canApprove} />
      )}

      <div className="rounded-2xl overflow-hidden"
        style={{ background: 'rgba(8,15,31,0.9)', border: '1px solid rgba(30,58,95,0.4)' }}>

        {/* Header */}
        <div className="px-5 py-4" style={{ borderBottom: '1px solid rgba(30,58,95,0.4)' }}>
          <div className="flex items-center justify-between mb-3">
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                💡 AI Recommendations
                {urgentCount > 0 && (
                  <span className="text-xs px-2 py-0.5 rounded-full font-semibold animate-pulse"
                    style={{ background: 'rgba(239,68,68,0.15)', color: '#ef4444', border: '1px solid rgba(239,68,68,0.3)' }}>
                    {urgentCount} urgent
                  </span>
                )}
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                {recommendations.length} executive actions · Click any card to see full plan
              </p>
            </div>
            <span className="text-xs px-2.5 py-1 rounded-full font-semibold"
              style={{ background: `${accentColor}15`, color: accentColor, border: `1px solid ${accentColor}30` }}>
              AI-Generated
            </span>
          </div>

          {/* Filter tabs */}
          <div className="flex items-center gap-1.5 flex-wrap">
            {[['all','All',recommendations.length,'#64748b'],
              ['urgent','Urgent',urgentCount,'#ef4444'],
              ['high','High',highCount,'#f97316'],
            ].map(([v,l,c,col]) => (
              <button key={v} onClick={() => setFilter(v)}
                className="text-xs px-2.5 py-1 rounded-lg font-semibold transition-all"
                style={{
                  background: filter === v ? `${col}20` : 'rgba(15,31,61,0.5)',
                  color: filter === v ? col : '#64748b',
                  border: `1px solid ${filter === v ? col+'40' : 'rgba(30,58,95,0.3)'}`,
                }}>
                {l} {c}
              </button>
            ))}
          </div>
        </div>

        {/* List */}
        <div className="p-4 space-y-2.5">
          {filtered.length === 0 ? (
            <div className="text-center py-10">
              <div className="text-4xl mb-3">🎯</div>
              <p className="text-slate-500 text-sm">No recommendations available</p>
            </div>
          ) : filtered.map(rec => {
            const pri = PRI[rec.priority] || PRI.medium;
            return (
              <button key={rec.id} onClick={() => setSelected(rec)}
                className="w-full text-left rounded-xl p-4 transition-all duration-200 hover:-translate-y-0.5 group"
                style={{ background: pri.bg, border: `1px solid ${pri.border}` }}>
                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-xl flex items-center justify-center text-base flex-shrink-0"
                    style={{ background: `${pri.color}18` }}>
                    {TYPE_ICON[rec.type] || '💡'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between mb-1.5">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-xs font-bold px-1.5 py-0.5 rounded"
                          style={{ background: `${pri.color}20`, color: pri.color }}>{pri.label}</span>
                        <h3 className="text-sm font-semibold text-white">{rec.title}</h3>
                      </div>
                      <span className="text-slate-600 text-xs group-hover:text-slate-400 transition-colors flex-shrink-0 ml-2">→</span>
                    </div>

                    <p className="text-xs text-slate-500 leading-relaxed mb-2 line-clamp-1">
                      {rec.summary}
                    </p>

                    <div className="flex items-center gap-3 flex-wrap">
                      <span className="text-xs px-2 py-0.5 rounded font-semibold"
                        style={{ background: 'rgba(16,185,129,0.1)', color: '#10b981' }}>
                        💰 {rec.roi_range}
                      </span>
                      <span className="text-xs text-slate-600">
                        {rec.actions?.length} actions
                      </span>
                      <span className="text-xs text-slate-600">
                        Payback: {rec.payback_days}d
                      </span>
                      <span className="text-xs font-medium capitalize"
                        style={{ color: EFFORT_COLOR[rec.effort] || '#f59e0b' }}>
                        Effort: {rec.effort}
                      </span>
                      <span className="text-xs text-slate-700 ml-auto">{rec.confidence}% confidence</span>
                    </div>

                    {/* Confidence bar */}
                    <div className="mt-2 h-0.5 rounded-full" style={{ background: 'rgba(30,58,95,0.4)' }}>
                      <div className="h-full rounded-full transition-all duration-1000"
                        style={{ width: `${rec.confidence}%`, background: pri.color }} />
                    </div>
                  </div>
                </div>
              </button>
            );
          })}
        </div>

        {recommendations.length > limit && (
          <div className="px-5 pb-4 text-center">
            <span className="text-xs text-slate-500">
              +{recommendations.length - limit} more · Upgrade role for full access
            </span>
          </div>
        )}
      </div>
    </>
  );
}
