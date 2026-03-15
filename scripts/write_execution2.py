import os

content = r"""import { useState } from 'react';
import { kpiArray, executionRows, executionSummary, statusColors } from '../data/gisData';

const ST = {
  'On Track':    { bg: '#f0fdf4', color: '#16a34a', dot: '#16a34a' },
  'At Risk':     { bg: '#fffbeb', color: '#d97706', dot: '#d97706' },
  'Stalled':     { bg: '#fef2f2', color: '#dc2626', dot: '#dc2626' },
  'Completed':   { bg: '#eff6ff', color: '#2563eb', dot: '#2563eb' },
  'Not Started': { bg: '#f8fafc', color: '#64748b', dot: '#94a3b8' },
};

const StatusBadge = ({ status }) => {
  const c = ST[status] || ST['Not Started'];
  return (
    <span
      className="inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full"
      style={{ background: c.bg, color: c.color }}
    >
      <span className="w-1.5 h-1.5 rounded-full inline-block" style={{ background: c.dot }}/>
      {status}
    </span>
  );
};

const PctBar = ({ pct }) => (
  <div className="flex items-center gap-2">
    <div className="flex-1 h-1.5 rounded-full" style={{ background: '#e2e8f0' }}>
      <div
        className="h-full rounded-full transition-all"
        style={{
          width: `${pct}%`,
          background: pct >= 80 ? '#16a34a' : pct >= 50 ? '#2563eb' : pct > 0 ? '#d97706' : '#e2e8f0',
        }}
      />
    </div>
    <span className="text-xs font-bold w-9 text-right" style={{ color: '#334155' }}>{pct}%</span>
  </div>
);

const SummaryCard = ({ s }) => {
  const c = ST[s.status] || ST['Not Started'];
  return (
    <div
      className="rounded-xl p-4"
      style={{ background: '#ffffff', border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}
    >
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs font-semibold" style={{ color: '#64748b' }}>{s.label}</span>
        <StatusBadge status={s.status}/>
      </div>
      <div className="text-2xl font-black mb-1" style={{ color: '#0f172a' }}>{s.value}</div>
      <div className="text-xs" style={{ color: '#94a3b8' }}>{s.sub}</div>
      {s.pct !== undefined && <div className="mt-2"><PctBar pct={s.pct}/></div>}
    </div>
  );
};

export default function ExecutionHub() {
  const [expanded, setExpanded] = useState({});
  const toggle = (id) => setExpanded(p => ({ ...p, [id]: !p[id] }));

  return (
    <div className="p-6 space-y-6" style={{ background: '#f4f6f9', minHeight: '100%' }}>

      {/* ── HEADING ── */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-black" style={{ color: '#0f172a' }}>Execution Hub</h1>
          <p className="text-sm mt-0.5" style={{ color: '#64748b' }}>
            Track committed decisions through milestones, owners, and completion.
          </p>
        </div>
        <button
          className="text-xs font-bold px-5 py-2.5 rounded-xl text-white transition-opacity hover:opacity-90"
          style={{ background: 'linear-gradient(135deg,#2563eb,#4f46e5)' }}
        >
          + New Action
        </button>
      </div>

      {/* ── KPIs ── */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        {kpiArray.map(k => (
          <div
            key={k.id}
            className="rounded-xl p-3"
            style={{ background: '#ffffff', border: '1px solid #e2e8f0', boxShadow: '0 1px 2px rgba(0,0,0,0.04)' }}
          >
            <div className="text-xs mb-1 font-semibold truncate" style={{ color: '#64748b' }}>{k.label}</div>
            <div className="text-lg font-black" style={{ color: '#0f172a' }}>{k.value}</div>
            <div
              className="text-xs font-semibold"
              style={{ color: k.trend === 'up' ? '#16a34a' : '#dc2626' }}
            >{k.delta}</div>
          </div>
        ))}
      </div>

      {/* ── SUMMARY CARDS ── */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        {executionSummary.map((s, i) => <SummaryCard key={i} s={s}/>)}
      </div>

      {/* ── EXECUTION TABLE ── */}
      <div
        className="rounded-2xl overflow-hidden"
        style={{ background: '#ffffff', border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}
      >
        <div className="px-5 py-4" style={{ borderBottom: '1px solid #e2e8f0' }}>
          <span className="text-sm font-bold" style={{ color: '#0f172a' }}>Execution Actions</span>
        </div>

        {/* Table header */}
        <div
          className="grid px-5 py-2.5 text-xs font-semibold uppercase tracking-wider"
          style={{
            gridTemplateColumns: '2.5fr 1fr 1fr 1fr 100px',
            background: '#f8fafc',
            borderBottom: '1px solid #e2e8f0',
            color: '#94a3b8',
          }}
        >
          <span>Action</span>
          <span>Owner</span>
          <span>Due Date</span>
          <span>Status</span>
          <span>Progress</span>
        </div>

        {executionRows.map(row => (
          <div key={row.id}>
            {/* Row */}
            <div
              className="grid px-5 py-3.5 cursor-pointer transition-colors hover:bg-slate-50"
              style={{
                gridTemplateColumns: '2.5fr 1fr 1fr 1fr 100px',
                borderBottom: '1px solid #f1f5f9',
              }}
              onClick={() => toggle(row.id)}
            >
              <div className="flex items-center gap-2 min-w-0">
                <svg
                  className="w-3.5 h-3.5 flex-shrink-0 transition-transform"
                  style={{
                    color: '#94a3b8',
                    transform: expanded[row.id] ? 'rotate(90deg)' : 'rotate(0deg)',
                  }}
                  fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7"/>
                </svg>
                <span className="text-sm font-semibold truncate" style={{ color: '#0f172a' }}>{row.title}</span>
              </div>
              <span className="text-xs self-center" style={{ color: '#334155' }}>{row.owner}</span>
              <span className="text-xs self-center" style={{ color: '#64748b' }}>{row.dueDate}</span>
              <div className="self-center"><StatusBadge status={row.status}/></div>
              <div className="self-center"><PctBar pct={row.pct}/></div>
            </div>

            {/* Sub-actions */}
            {expanded[row.id] && row.subActions && (
              <div style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
                {row.subActions.map((sub, i) => (
                  <div
                    key={i}
                    className="grid px-5 py-2.5"
                    style={{ gridTemplateColumns: '2.5fr 1fr 1fr 1fr 100px', borderTop: i > 0 ? '1px solid #f1f5f9' : 'none' }}
                  >
                    <div className="flex items-center gap-4 min-w-0">
                      <span style={{ display: 'inline-block', width: 28 }}/>
                      <div
                        className="w-1 h-1 rounded-full flex-shrink-0"
                        style={{ background: '#cbd5e1' }}
                      />
                      <span className="text-xs truncate" style={{ color: '#334155' }}>{sub.title}</span>
                    </div>
                    <span className="text-xs self-center" style={{ color: '#94a3b8' }}>{sub.owner}</span>
                    <span className="text-xs self-center" style={{ color: '#94a3b8' }}>{sub.dueDate}</span>
                    <div className="self-center"><StatusBadge status={sub.status}/></div>
                    <div className="self-center"><PctBar pct={sub.pct}/></div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>

    </div>
  );
}
"""

out_path = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), 'src', 'pages', 'ExecutionHub.jsx')
with open(out_path, 'w', encoding='utf-8') as f:
    f.write(content)
print('Written:', out_path)
