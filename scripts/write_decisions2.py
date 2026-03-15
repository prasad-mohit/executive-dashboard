import os

content = r"""import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { decisions, statusColors } from '../data/gisData';

const CONF_COLOR = {
  'High':        { bg: '#f0fdf4', color: '#16a34a', ring: '#16a34a' },
  'Medium-High': { bg: '#eff6ff', color: '#2563eb', ring: '#2563eb' },
  'Medium':      { bg: '#fffbeb', color: '#d97706', ring: '#d97706' },
  'Low':         { bg: '#fef2f2', color: '#dc2626', ring: '#dc2626' },
};

const ImpactBar = ({ range }) => {
  if (!range) return null;
  const match = range.match(/\$?([\d.]+)M.*\$?([\d.]+)M/);
  if (!match) return <div className="text-sm font-bold" style={{ color: '#0f172a' }}>{range}</div>;
  return (
    <div className="mt-2">
      <div className="flex justify-between text-xs mb-1.5" style={{ color: '#94a3b8' }}>
        <span>Downside</span><span>Upside</span>
      </div>
      <div className="h-2.5 rounded-full relative" style={{ background: '#e2e8f0' }}>
        <div
          className="absolute inset-y-0 rounded-full"
          style={{ left: '5%', right: '5%', background: 'linear-gradient(90deg, #dc2626 0%, #d97706 40%, #16a34a 100%)' }}
        />
        <div
          className="absolute top-1/2 -translate-y-1/2 w-3 h-3 rounded-full border-2 border-white"
          style={{ left: '62%', background: '#2563eb', boxShadow: '0 1px 3px rgba(0,0,0,0.3)' }}
        />
      </div>
      <div className="text-xs font-bold mt-1.5" style={{ color: '#0f172a' }}>Expected: {range}</div>
    </div>
  );
};

const ConfRing = ({ confidence }) => {
  const c = CONF_COLOR[confidence] || CONF_COLOR['Medium'];
  const pct = confidence === 'High' ? 90 : confidence === 'Medium-High' ? 75 : confidence === 'Medium' ? 55 : 35;
  const r = 28, circ = 2 * Math.PI * r;
  return (
    <div className="flex flex-col items-center gap-1">
      <svg width="72" height="72" viewBox="0 0 72 72">
        <circle cx="36" cy="36" r={r} fill="none" stroke="#e2e8f0" strokeWidth="6"/>
        <circle
          cx="36" cy="36" r={r} fill="none"
          stroke={c.ring} strokeWidth="6"
          strokeDasharray={`${(pct / 100) * circ} ${circ}`}
          strokeLinecap="round"
          transform="rotate(-90 36 36)"
        />
        <text x="36" y="40" textAnchor="middle" fontSize="13" fontWeight="700" fill={c.ring}>{pct}%</text>
      </svg>
      <span className="text-xs font-semibold" style={{ color: c.color }}>{confidence}</span>
    </div>
  );
};

export default function DecisionHub() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [committed, setCommitted] = useState({});
  const [held, setHeld] = useState({});
  const [closed, setClosed] = useState({});

  const activeId = id || decisions[0]?.id;
  const active = decisions.find(d => d.id === activeId) || decisions[0];

  const handleCommit = (did) => {
    setCommitted(p => ({ ...p, [did]: true }));
    setHeld(p => { const n = { ...p }; delete n[did]; return n; });
  };
  const handleHold = (did) => {
    setHeld(p => ({ ...p, [did]: true }));
    setCommitted(p => { const n = { ...p }; delete n[did]; return n; });
  };

  if (!active) return (
    <div className="p-12 text-center" style={{ color: '#94a3b8' }}>No decisions found</div>
  );

  const isCommitted = committed[active.id];
  const isHeld = held[active.id];

  return (
    <div className="flex h-full" style={{ background: '#f4f6f9' }}>

      {/* ── LEFT: Decision list ── */}
      <div
        className="w-64 flex-shrink-0 overflow-y-auto py-4 px-3 space-y-2"
        style={{ background: '#ffffff', borderRight: '1px solid #e2e8f0' }}
      >
        <div className="px-2 pb-2 text-xs font-semibold uppercase tracking-wider" style={{ color: '#94a3b8' }}>
          Open Decisions
        </div>
        {decisions.map(d => {
          const isActive = d.id === active.id;
          const isDone = committed[d.id];
          const isOnHold = held[d.id];
          return (
            <button
              key={d.id}
              onClick={() => navigate(`/app/decisions/${d.id}`)}
              className="w-full text-left rounded-xl p-3 transition-all"
              style={{
                background: isActive ? '#eff6ff' : '#ffffff',
                border: isActive ? '1.5px solid #bfdbfe' : '1px solid #e2e8f0',
              }}
            >
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xs font-bold" style={{ color: isActive ? '#2563eb' : '#94a3b8' }}>{d.id}</span>
                {isDone && <span className="text-xs px-1.5 py-0.5 rounded-full font-bold" style={{ background: '#f0fdf4', color: '#16a34a' }}>Done</span>}
                {isOnHold && <span className="text-xs px-1.5 py-0.5 rounded-full font-bold" style={{ background: '#fffbeb', color: '#d97706' }}>Hold</span>}
              </div>
              <div className="text-xs font-semibold leading-snug" style={{ color: '#0f172a' }}>{d.title}</div>
              <div className="text-xs mt-1" style={{ color: '#94a3b8' }}>{d.deadline}</div>
            </button>
          );
        })}
      </div>

      {/* ── RIGHT: Decision detail ── */}
      <div className="flex-1 overflow-y-auto p-6 space-y-5">

        {/* Header */}
        <div className="flex items-start gap-4">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-1">
              <span
                className="text-xs font-bold px-2 py-0.5 rounded-full"
                style={{ background: '#fef9c3', color: '#ca8a04', border: '1px solid #fde68a' }}
              >DECISION NEEDED</span>
              <span className="text-xs font-semibold" style={{ color: '#94a3b8' }}>{active.id}</span>
              <span
                className="text-xs px-2 py-0.5 rounded-full font-semibold"
                style={statusColors[active.status] || { background: '#f8fafc', color: '#64748b' }}
              >{active.status}</span>
            </div>
            <h2 className="text-xl font-black" style={{ color: '#0f172a' }}>{active.title}</h2>
            <p className="text-sm mt-1" style={{ color: '#64748b' }}>{active.subtitle}</p>
          </div>
          <ConfRing confidence={active.confidence}/>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

          {/* Impact Range */}
          <div className="rounded-2xl p-5" style={{ background: '#ffffff', border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
            <div className="text-xs font-semibold uppercase tracking-wider mb-3" style={{ color: '#94a3b8' }}>Impact Range</div>
            <ImpactBar range={active.impact?.range || active.impact}/>
            <div className="mt-3 grid grid-cols-3 gap-2 text-center text-xs">
              <div style={{ background: '#fef2f2', borderRadius: 8, padding: '6px' }}>
                <div className="font-bold" style={{ color: '#dc2626' }}>{active.impact?.low || '−$8M'}</div>
                <div style={{ color: '#94a3b8' }}>Bear</div>
              </div>
              <div style={{ background: '#fffbeb', borderRadius: 8, padding: '6px' }}>
                <div className="font-bold" style={{ color: '#d97706' }}>{active.impact?.expected || '+$4M'}</div>
                <div style={{ color: '#94a3b8' }}>Base</div>
              </div>
              <div style={{ background: '#f0fdf4', borderRadius: 8, padding: '6px' }}>
                <div className="font-bold" style={{ color: '#16a34a' }}>{active.impact?.high || '+$14M'}</div>
                <div style={{ color: '#94a3b8' }}>Bull</div>
              </div>
            </div>
          </div>

          {/* Evidence */}
          <div className="rounded-2xl p-5" style={{ background: '#ffffff', border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
            <div className="text-xs font-semibold uppercase tracking-wider mb-3" style={{ color: '#94a3b8' }}>Evidence</div>
            <div className="space-y-2">
              {(active.evidence || [
                'Competitor Index posted 8.2% price reduction on equivalent Braking SKUs.',
                'Ford procurement RFQ deadline is June 30 — 14 days from today.',
                'Margin at current list price: 22.4% (above 18% floor).',
                'Detroit plant has 2,200 units/month spare capacity.',
              ]).map((e, i) => (
                <div key={i} className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 rounded-full mt-1.5 flex-shrink-0" style={{ background: '#2563eb' }}/>
                  <span className="text-xs leading-relaxed" style={{ color: '#334155' }}>{e}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Risks */}
        <div className="rounded-2xl p-5" style={{ background: '#ffffff', border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
          <div className="text-xs font-semibold uppercase tracking-wider mb-3" style={{ color: '#94a3b8' }}>Risks to Monitor</div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {(active.risks || [
              { text: 'Margin erosion if steel cost spikes further', sev: 'High' },
              { text: 'Precedent effect on other OEM pricing', sev: 'Medium' },
              { text: 'Capacity commitment limits flexibility', sev: 'Low' },
              { text: 'Competitor may counter with further reduction', sev: 'High' },
            ]).map((r, i) => {
              const smap = { High: '#dc2626', Medium: '#d97706', Low: '#16a34a', Critical: '#7c3aed' };
              const bmap = { High: '#fef2f2', Medium: '#fffbeb', Low: '#f0fdf4', Critical: '#f5f3ff' };
              return (
                <div key={i} className="flex items-center gap-2 rounded-xl p-3" style={{ background: bmap[r.sev] || '#f8fafc' }}>
                  <div className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: smap[r.sev] || '#94a3b8' }}/>
                  <span className="text-xs" style={{ color: '#334155' }}>{r.text}</span>
                  <span className="ml-auto text-xs font-semibold" style={{ color: smap[r.sev] }}>{r.sev}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Action buttons */}
        {!isCommitted && !isHeld ? (
          <div className="flex gap-3">
            <button
              onClick={() => handleHold(active.id)}
              className="px-8 py-3 rounded-xl text-sm font-bold transition-all"
              style={{ background: '#ffffff', border: '1.5px solid #d1d5db', color: '#374151' }}
            >Hold</button>
            <button
              onClick={() => handleCommit(active.id)}
              className="flex-1 py-3 rounded-xl text-sm font-bold text-white transition-opacity hover:opacity-90"
              style={{ background: 'linear-gradient(135deg,#2563eb,#4f46e5)' }}
            >Commit Decision</button>
          </div>
        ) : isCommitted ? (
          <div className="space-y-3">
            <div
              className="rounded-xl p-4 flex items-center gap-3"
              style={{ background: '#f0fdf4', border: '1px solid #bbf7d0' }}
            >
              <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"/>
              </svg>
              <span className="text-sm font-bold" style={{ color: '#15803d' }}>Decision committed. Next steps below.</span>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              {['Close Decision','Set Owner','Trigger Workflow','Approve Now'].map(a => (
                <button
                  key={a}
                  className="py-2.5 rounded-xl text-xs font-semibold transition-all"
                  style={{ background: '#ffffff', border: '1px solid #e2e8f0', color: '#334155' }}
                >{a}</button>
              ))}
            </div>
          </div>
        ) : (
          <div className="rounded-xl p-4 flex items-center gap-3" style={{ background: '#fffbeb', border: '1px solid #fde68a' }}>
            <span className="text-sm font-bold" style={{ color: '#92400e' }}>Decision on hold. Review by tomorrow.</span>
            <button
              onClick={() => handleCommit(active.id)}
              className="ml-auto text-xs font-bold px-4 py-2 rounded-lg text-white"
              style={{ background: '#2563eb' }}
            >Commit Now</button>
          </div>
        )}

      </div>
    </div>
  );
}
"""

out_path = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), 'src', 'pages', 'DecisionHub.jsx')
with open(out_path, 'w', encoding='utf-8') as f:
    f.write(content)
print('Written:', out_path)
