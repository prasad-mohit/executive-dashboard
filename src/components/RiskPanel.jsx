import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';

const SEV = {
  high:   { color: '#ef4444', bg: 'rgba(239,68,68,0.08)',  border: 'rgba(239,68,68,0.28)',  label: 'HIGH',      glow: '0 0 12px rgba(239,68,68,0.3)'  },
  medium: { color: '#f59e0b', bg: 'rgba(245,158,11,0.08)', border: 'rgba(245,158,11,0.28)', label: 'MEDIUM',    glow: '0 0 12px rgba(245,158,11,0.3)' },
  low:    { color: '#10b981', bg: 'rgba(16,185,129,0.08)', border: 'rgba(16,185,129,0.28)', label: 'LOW',       glow: '0 0 12px rgba(16,185,129,0.3)' },
};
const URG = {
  immediate: { color: '#ef4444', label: '🔴 Immediate' },
  urgent:    { color: '#f97316', label: '🟠 Urgent'    },
  high:      { color: '#f59e0b', label: '🟡 High'      },
  monitor:   { color: '#64748b', label: '⚪ Monitor'   },
};
const TYPE_ICON = {
  revenue: '💰', finance: '📊', sales: '🤝', retention: '🔄',
  talent: '👥', competition: '⚔️', compliance: '⚖️', operations: '⚙️',
};
const TREND_ICON = { up: '↑', down: '↓', neutral: '→' };
const TREND_COLOR = { up: '#10b981', down: '#ef4444', neutral: '#64748b' };

/* ── Mini sparkline ── */
function MiniSpark({ values = [], color = '#ef4444' }) {
  if (!values.length) return null;
  const max = Math.max(...values, 1), h = 28, w = 80;
  const pts = values.map((v, i) => `${(i/(values.length-1||1))*w},${h - (v/max)*h}`).join(' ');
  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} preserveAspectRatio="none">
      <polyline fill="none" stroke={color} strokeWidth="1.5" strokeLinejoin="round" points={pts}
        style={{ filter: `drop-shadow(0 0 3px ${color}66)` }} />
      <circle cx={values.length > 1 ? w : 0} cy={h - (values[values.length-1]/max)*h}
        r="2.5" fill={color} />
    </svg>
  );
}

/* ── Drilldown Modal ── */
function RiskDrilldown({ risk, onClose }) {
  const sev = SEV[risk.severity] || SEV.low;
  const fmt$ = (n) => n >= 1_000_000 ? `$${(n/1_000_000).toFixed(1)}M` : n > 0 ? `$${Math.round(n/1000)}K` : '—';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(2,8,23,0.85)', backdropFilter: 'blur(6px)' }}
      onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl"
        style={{ background: 'rgba(8,15,31,0.98)', border: `1px solid ${sev.border}`, boxShadow: sev.glow }}>

        {/* Header */}
        <div className="sticky top-0 px-6 py-4 flex items-start justify-between"
          style={{ background: 'rgba(8,15,31,0.98)', borderBottom: `1px solid ${sev.border}` }}>
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xl flex-shrink-0"
              style={{ background: `${sev.color}18`, border: `1px solid ${sev.color}35` }}>
              {TYPE_ICON[risk.type] || '⚠️'}
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs font-bold px-2 py-0.5 rounded"
                  style={{ background: `${sev.color}20`, color: sev.color }}>{sev.label}</span>
                <span className="text-xs text-slate-500">Source: {risk.source}</span>
                <span className="text-xs text-slate-500">Owner: <span className="text-slate-300 font-medium">{risk.owner}</span></span>
                <span className="text-xs font-semibold px-2 py-0.5 rounded"
                  style={{ background: 'rgba(239,68,68,0.1)', color: '#ef4444' }}>
                  ⏱ {risk.timeline}
                </span>
              </div>
              <h2 className="text-base font-bold text-white mt-1">{risk.title}</h2>
            </div>
          </div>
          <button onClick={onClose}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-white transition-colors flex-shrink-0"
            style={{ background: 'rgba(30,58,95,0.4)' }}>✕</button>
        </div>

        <div className="px-6 py-5 space-y-5">

          {/* Description */}
          <div className="rounded-xl px-4 py-3"
            style={{ background: `${sev.color}07`, border: `1px solid ${sev.color}20` }}>
            <p className="text-sm text-slate-300 leading-relaxed">{risk.description}</p>
          </div>

          {/* Financial Impact + Confidence */}
          <div className="grid grid-cols-3 gap-3">
            <div className="rounded-xl px-4 py-3 text-center"
              style={{ background: 'rgba(15,31,61,0.6)', border: '1px solid rgba(30,58,95,0.4)' }}>
              <div className="text-xs text-slate-500 mb-1">Financial Exposure</div>
              <div className="text-lg font-bold" style={{ color: sev.color }}>
                {fmt$(risk.financial_impact)}
              </div>
            </div>
            <div className="rounded-xl px-4 py-3 text-center"
              style={{ background: 'rgba(15,31,61,0.6)', border: '1px solid rgba(30,58,95,0.4)' }}>
              <div className="text-xs text-slate-500 mb-1">AI Confidence</div>
              <div className="text-lg font-bold text-blue-400">{risk.confidence}%</div>
            </div>
            <div className="rounded-xl px-4 py-3 text-center"
              style={{ background: 'rgba(15,31,61,0.6)', border: '1px solid rgba(30,58,95,0.4)' }}>
              <div className="text-xs text-slate-500 mb-1">Urgency</div>
              <div className="text-sm font-bold" style={{ color: (URG[risk.urgency]||URG.monitor).color }}>
                {(URG[risk.urgency]||URG.monitor).label}
              </div>
            </div>
          </div>

          {/* Trend chart */}
          {risk.trend?.length > 1 && (
            <div>
              <div className="text-xs font-semibold text-slate-400 mb-2 uppercase tracking-wider">Trend (recent periods)</div>
              <div className="rounded-xl px-4 py-3"
                style={{ background: 'rgba(15,31,61,0.6)', border: '1px solid rgba(30,58,95,0.4)' }}>
                <div className="flex items-end gap-1" style={{ height: 48 }}>
                  {risk.trend.map((v, i) => {
                    const max = Math.max(...risk.trend, 1);
                    const pct = (v / max) * 100;
                    const isLast = i === risk.trend.length - 1;
                    return (
                      <div key={i} className="flex-1 rounded-t-sm transition-all duration-500"
                        style={{
                          height: `${pct}%`, minHeight: 3, minWidth: 4,
                          background: isLast ? sev.color : `${sev.color}44`,
                          boxShadow: isLast ? `0 0 8px ${sev.color}66` : 'none',
                        }} />
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* Evidence data points */}
          {risk.evidence?.length > 0 && (
            <div>
              <div className="text-xs font-semibold text-slate-400 mb-2 uppercase tracking-wider">Data Evidence</div>
              <div className="space-y-2">
                {risk.evidence.map((ev, i) => (
                  <div key={i} className="flex items-center justify-between rounded-lg px-4 py-2.5"
                    style={{ background: 'rgba(15,31,61,0.5)', border: '1px solid rgba(30,58,95,0.3)' }}>
                    <span className="text-xs text-slate-400">{ev.label}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-semibold text-white">{ev.value}</span>
                      <span className="text-xs font-bold" style={{ color: TREND_COLOR[ev.trend] }}>
                        {TREND_ICON[ev.trend]}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Affected systems */}
          <div>
            <div className="text-xs font-semibold text-slate-400 mb-2 uppercase tracking-wider">Affected Systems</div>
            <div className="flex flex-wrap gap-2">
              {(risk.affected_systems || []).map(s => (
                <span key={s} className="text-xs px-3 py-1.5 rounded-full font-medium"
                  style={{ background: 'rgba(59,130,246,0.12)', color: '#60a5fa', border: '1px solid rgba(59,130,246,0.25)' }}>
                  {s}
                </span>
              ))}
            </div>
          </div>

          {/* Action footer */}
          <div className="flex items-center gap-3 pt-2 border-t" style={{ borderColor: 'rgba(30,58,95,0.4)' }}>
            <span className="text-xs text-slate-500 flex-1">Risk ID: {risk.id}</span>
            <button className="px-4 py-2 rounded-xl text-xs font-semibold transition-all"
              style={{ background: `${sev.color}18`, color: sev.color, border: `1px solid ${sev.color}35` }}>
              🚨 Escalate
            </button>
            <button className="px-4 py-2 rounded-xl text-xs font-semibold transition-all"
              style={{ background: 'rgba(59,130,246,0.12)', color: '#60a5fa', border: '1px solid rgba(59,130,246,0.25)' }}>
              📋 Assign Owner
            </button>
            <button onClick={onClose} className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 transition-all"
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
export default function RiskPanel({ risks, dataWindow }) {
  const { user, hasPermission } = useAuth();
  const [selected, setSelected] = useState(null);
  const [filter, setFilter]     = useState('all');

  const canViewDetails = hasPermission('view_all') || hasPermission('view_team');
  const limit = user?.role === 'analyst' ? 3 : risks.length;

  const highCount = risks.filter(r => r.severity === 'high').length;
  const medCount  = risks.filter(r => r.severity === 'medium').length;
  const lowCount  = risks.filter(r => r.severity === 'low').length;

  const filtered = risks
    .filter(r => filter === 'all' || r.severity === filter)
    .slice(0, limit);

  const totalExposure = risks.reduce((s, r) => s + (r.financial_impact || 0), 0);
  const fmt$ = (n) => n >= 1_000_000 ? `$${(n/1_000_000).toFixed(1)}M` : `$${Math.round(n/1000)}K`;

  return (
    <>
      {selected && <RiskDrilldown risk={selected} onClose={() => setSelected(null)} />}

      <div className="rounded-2xl overflow-hidden"
        style={{ background: 'rgba(8,15,31,0.9)', border: '1px solid rgba(30,58,95,0.4)' }}>

        {/* Header */}
        <div className="px-5 py-4" style={{ borderBottom: '1px solid rgba(30,58,95,0.4)' }}>
          <div className="flex items-start justify-between mb-3">
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                ⚠️ Risk Assessment
                {highCount > 0 && (
                  <span className="text-xs px-2 py-0.5 rounded-full font-semibold animate-pulse"
                    style={{ background: 'rgba(239,68,68,0.15)', color: '#ef4444', border: '1px solid rgba(239,68,68,0.3)' }}>
                    {highCount} critical
                  </span>
                )}
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Based on {dataWindow || 'last 30 days'} · {risks.length} risks identified
                {totalExposure > 0 && <> · <span className="text-red-400 font-medium">{fmt$(totalExposure)} exposure</span></>}
              </p>
            </div>
            <div className="flex items-center gap-1.5 flex-wrap">
              {[['all','All',risks.length,'#64748b'],['high','H',highCount,'#ef4444'],['medium','M',medCount,'#f59e0b'],['low','L',lowCount,'#10b981']].map(([v,l,c,col]) => (
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

          {/* Risk exposure bar */}
          <div className="grid grid-cols-3 gap-1 h-2">
            {[['high','#ef4444',highCount],['medium','#f59e0b',medCount],['low','#10b981',lowCount]].map(([k,col,cnt]) => (
              <div key={k} className="rounded-full overflow-hidden" style={{ background: 'rgba(30,58,95,0.3)' }}>
                <div className="h-full rounded-full transition-all duration-1000"
                  style={{ width: risks.length ? `${(cnt/risks.length)*100}%` : '0%', background: col, boxShadow: `0 0 6px ${col}66` }} />
              </div>
            ))}
          </div>
        </div>

        {/* Risk list */}
        <div className="p-4 space-y-2.5">
          {filtered.length === 0 ? (
            <div className="text-center py-10">
              <div className="text-4xl mb-3">✅</div>
              <p className="text-slate-500 text-sm">No risks identified at this time</p>
            </div>
          ) : filtered.map(risk => {
            const sev = SEV[risk.severity] || SEV.low;
            const urg = URG[risk.urgency]  || URG.monitor;
            return (
              <button key={risk.id} onClick={() => setSelected(risk)}
                className="w-full text-left rounded-xl p-4 transition-all duration-200 hover:-translate-y-0.5 group"
                style={{ background: sev.bg, border: `1px solid ${sev.border}` }}>
                <div className="flex items-start gap-3">
                  {/* Type icon */}
                  <div className="w-9 h-9 rounded-xl flex items-center justify-center text-base flex-shrink-0"
                    style={{ background: `${sev.color}18` }}>
                    {TYPE_ICON[risk.type] || '⚠️'}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-xs font-bold px-1.5 py-0.5 rounded"
                          style={{ background: `${sev.color}20`, color: sev.color }}>{sev.label}</span>
                        <h3 className="text-sm font-semibold text-white leading-tight">{risk.title}</h3>
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0 ml-2">
                        <span className="text-xs" style={{ color: urg.color }}>{urg.label}</span>
                        <span className="text-slate-600 text-xs group-hover:text-slate-400 transition-colors">→</span>
                      </div>
                    </div>

                    {canViewDetails && (
                      <p className="text-xs text-slate-400 leading-relaxed mb-2 line-clamp-2">
                        {risk.description}
                      </p>
                    )}

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <span className="text-xs text-slate-600">
                          📍 {risk.source}
                        </span>
                        <span className="text-xs text-slate-600">
                          👤 {risk.owner}
                        </span>
                        {risk.financial_impact > 0 && (
                          <span className="text-xs font-semibold" style={{ color: sev.color }}>
                            {risk.financial_impact >= 1_000_000
                              ? `$${(risk.financial_impact/1_000_000).toFixed(1)}M`
                              : `$${Math.round(risk.financial_impact/1000)}K`} exposure
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <MiniSpark values={risk.trend || []} color={sev.color} />
                        <span className="text-xs text-slate-600">{risk.confidence}%</span>
                      </div>
                    </div>

                    {/* Confidence bar */}
                    <div className="mt-2 h-1 rounded-full" style={{ background: 'rgba(30,58,95,0.4)' }}>
                      <div className="h-full rounded-full transition-all duration-1000"
                        style={{ width: `${risk.confidence}%`, background: sev.color, boxShadow: `0 0 4px ${sev.color}66` }} />
                    </div>
                  </div>
                </div>
              </button>
            );
          })}
        </div>

        {risks.length > limit && (
          <div className="px-5 pb-4 text-center">
            <span className="text-xs text-slate-500">+{risks.length - limit} more risks • Upgrade access to view all</span>
          </div>
        )}
      </div>
    </>
  );
}
