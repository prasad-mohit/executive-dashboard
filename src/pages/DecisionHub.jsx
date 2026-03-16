import { useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { statusColors } from '../data/gisData';
import { useFilters } from '../contexts/FilterContext';
import { useDecisionState } from '../contexts/DecisionStateContext';
import { getDashboardSlice } from '../data/siboniSelectors';

const CONF_COLOR = {
  'High':        { ring:'#16a34a', color:'#16a34a', pct:90 },
  'Medium-High': { ring:'#2563eb', color:'#2563eb', pct:75 },
  'Medium':      { ring:'#d97706', color:'#d97706', pct:55 },
  'Low':         { ring:'#dc2626', color:'#dc2626', pct:35 },
};

const ConfRing = ({ confidence }) => {
  const c = CONF_COLOR[confidence] || CONF_COLOR['Medium'];
  const r=28, circ=2*Math.PI*r;
  return (
    <div className="flex flex-col items-center gap-1">
      <svg width="72" height="72" viewBox="0 0 72 72">
        <circle cx="36" cy="36" r={r} fill="none" stroke="#e2e8f0" strokeWidth="6"/>
        <circle cx="36" cy="36" r={r} fill="none" stroke={c.ring} strokeWidth="6"
          strokeDasharray={`${(c.pct/100)*circ} ${circ}`} strokeLinecap="round"
          transform="rotate(-90 36 36)"/>
        <text x="36" y="40" textAnchor="middle" fontSize="13" fontWeight="700" fill={c.ring}>{c.pct}%</text>
      </svg>
      <span className="text-xs font-semibold" style={{ color:c.color }}>{confidence}</span>
    </div>
  );
};

export default function DecisionHub() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { filters } = useFilters();
  const { decisionState, commitDecision, holdDecision } = useDecisionState();
  const [actionsVisible, setActionsVisible] = useState(false);

  const slice = useMemo(() => getDashboardSlice(filters, decisionState), [filters, decisionState]);
  const decisions = slice.decisions;

  const activeId = id || decisions[0]?.id;
  const active = decisions.find(d => d.id === activeId) || decisions[0];
  if (!active) return <div className="p-12 text-center" style={{ color:'#94a3b8' }}>No decisions found</div>;

  const decisionStatus = decisionState[active.id]?.status;
  const isCommitted = decisionStatus === 'Committed' || active.committed;
  const isHeld = decisionStatus === 'Hold';

  const ir = active.impact_range || {};
  const unit = ir.unit || '$M';

  const SMAP = { High:'#dc2626', Medium:'#d97706', Low:'#16a34a', Critical:'#7c3aed' };
  const BMAP = { High:'#fef2f2', Medium:'#fffbeb', Low:'#f0fdf4', Critical:'#f5f3ff' };

  return (
    <div className="flex h-full" style={{ background:'#f4f6f9' }}>

      {/* LEFT */}
      <div className="w-64 flex-shrink-0 overflow-y-auto py-4 px-3 space-y-2"
        style={{ background:'#ffffff', borderRight:'1px solid #e2e8f0' }}>
        <div className="px-2 pb-2 text-xs font-semibold uppercase tracking-wider" style={{ color:'#94a3b8' }}>
          Open Decisions
        </div>
          {decisions.map(d => {
          const isA = d.id === active.id;
            const rowStatus = decisionState[d.id]?.status;
            const isDone = rowStatus === 'Committed' || d.committed;
            const isOn = rowStatus === 'Hold';
          const scol = { Stalled:'#dc2626', 'In Progress':'#2563eb', Completed:'#16a34a', 'Not Started':'#94a3b8' };
          return (
            <button key={d.id} onClick={() => navigate(`/app/decisions/${d.id}`)}
              className="w-full text-left rounded-xl p-3 transition-all"
              style={{ background: isA?'#eff6ff':'#ffffff', border: isA?'1.5px solid #bfdbfe':'1px solid #e2e8f0' }}>
              <div className="flex items-center gap-2 mb-1 flex-wrap">
                <span className="text-xs font-bold" style={{ color: isA?'#2563eb':'#94a3b8' }}>{d.ref}</span>
                <span className="text-xs px-1.5 py-0.5 rounded-full font-semibold ml-auto"
                  style={{ background: isDone?'#f0fdf4':'#f8fafc', color: isDone?'#16a34a':'#64748b' }}>
                  {isDone?'Done':isOn?'Hold':d.status}
                </span>
              </div>
              <div className="text-xs font-semibold leading-snug" style={{ color:'#0f172a' }}>{d.shortTitle||d.title}</div>
              <div className="text-xs mt-1" style={{ color:'#94a3b8' }}>{d.time_window_days}d window</div>
            </button>
          );
        })}
      </div>

      {/* RIGHT */}
      <div className="flex-1 overflow-y-auto p-6 space-y-5">

        <div className="flex items-start gap-4">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-1 flex-wrap">
              <span className="text-xs font-bold px-2 py-0.5 rounded-full"
                style={{ background:'#fef9c3', color:'#ca8a04', border:'1px solid #fde68a' }}>
                {active.recommended_action === 'HOLD' ? 'HOLD' : 'DECISION NEEDED'}
              </span>
              <span className="text-xs font-semibold" style={{ color:'#94a3b8' }}>{active.id}</span>
              <span className="text-xs px-2 py-0.5 rounded-full font-semibold"
                style={statusColors[active.status] || { background:'#f8fafc', color:'#64748b' }}>
                {active.status}
              </span>
            </div>
            <h2 className="text-xl font-black" style={{ color:'#0f172a' }}>{active.title}</h2>
            <p className="text-sm mt-1" style={{ color:'#64748b' }}>{active.why_now}</p>
          </div>
          <ConfRing confidence={active.confidence}/>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

          {/* Impact */}
          <div className="rounded-2xl p-5" style={{ background:'#ffffff', border:'1px solid #e2e8f0', boxShadow:'0 1px 3px rgba(0,0,0,0.05)' }}>
            <div className="text-xs font-semibold uppercase tracking-wider mb-3" style={{ color:'#94a3b8' }}>Impact Range</div>
            <div className="h-2.5 rounded-full relative mb-4" style={{ background:'#e2e8f0' }}>
              <div className="absolute inset-y-0 rounded-full" style={{ left:'5%', right:'5%', background:'linear-gradient(90deg,#dc2626 0%,#d97706 40%,#16a34a 100%)' }}/>
              <div className="absolute top-1/2 -translate-y-1/2 w-3 h-3 rounded-full border-2 border-white"
                style={{ left:'62%', background:'#2563eb', boxShadow:'0 1px 3px rgba(0,0,0,0.3)' }}/>
            </div>
            <div className="grid grid-cols-3 gap-2 text-center text-xs">
              {[
                { label:'Bear', val: ir.low   != null ? `-${unit}${ir.low}`   : 'N/A', col:'#dc2626', bg:'#fef2f2' },
                { label:'Base', val: ir.likely != null ? `+${unit}${ir.likely}` : active.value_at_stake, col:'#d97706', bg:'#fffbeb' },
                { label:'Bull', val: ir.high  != null ? `+${unit}${ir.high}`  : 'N/A', col:'#16a34a', bg:'#f0fdf4' },
              ].map(x => (
                <div key={x.label} style={{ background:x.bg, borderRadius:8, padding:'6px' }}>
                  <div className="font-bold" style={{ color:x.col }}>{x.val}</div>
                  <div style={{ color:'#94a3b8' }}>{x.label}</div>
                </div>
              ))}
            </div>
            <div className="mt-3 text-xs" style={{ color:'#94a3b8' }}>{ir.label}</div>
          </div>

          {/* Evidence */}
          <div className="rounded-2xl p-5" style={{ background:'#ffffff', border:'1px solid #e2e8f0', boxShadow:'0 1px 3px rgba(0,0,0,0.05)' }}>
            <div className="text-xs font-semibold uppercase tracking-wider mb-3" style={{ color:'#94a3b8' }}>Evidence</div>
            <div className="space-y-2">
              {(active.evidence_details || []).map((e,i) => (
                <div key={i} className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 rounded-full mt-1.5 flex-shrink-0" style={{ background:'#2563eb' }}/>
                  <div>
                    <span className="text-xs font-semibold" style={{ color:'#2563eb' }}>[{e.source}]</span>
                    <span className="text-xs ml-1" style={{ color:'#64748b' }}>{e.date}</span>
                    <div className="text-xs leading-relaxed" style={{ color:'#334155' }}>{e.note}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Decision rigor blocks */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="rounded-2xl p-5" style={{ background:'#ffffff', border:'1px solid #e2e8f0', boxShadow:'0 1px 3px rgba(0,0,0,0.05)' }}>
            <div className="text-xs font-semibold uppercase tracking-wider mb-3" style={{ color:'#94a3b8' }}>Options</div>
            <div className="space-y-2 text-xs">
              <div style={{ background:'#eff6ff', border:'1px solid #bfdbfe', borderRadius:10, padding:'8px 10px' }}>
                <b style={{ color:'#2563eb' }}>Recommended:</b> {active.recommended_action === 'HOLD' ? 'Hold until additional evidence' : 'Commit with 2-week action plan'}
              </div>
              <div style={{ background:'#f8fafc', border:'1px solid #e2e8f0', borderRadius:10, padding:'8px 10px', color:'#334155' }}>
                <b>Conservative:</b> Hold and review in 7 days after legal/procurement checkpoint.
              </div>
            </div>
          </div>

          <div className="rounded-2xl p-5" style={{ background:'#ffffff', border:'1px solid #e2e8f0', boxShadow:'0 1px 3px rgba(0,0,0,0.05)' }}>
            <div className="text-xs font-semibold uppercase tracking-wider mb-3" style={{ color:'#94a3b8' }}>Assumptions / Leading indicators</div>
            <ul className="text-xs space-y-2" style={{ color:'#334155' }}>
              <li>• Legal cycle closes within {active.time_window_days} days.</li>
              <li>• Supplier recovery remains above minimum OTIF threshold.</li>
              <li>• Watch: quote-to-order conversion, OTIF, and margin spread weekly.</li>
            </ul>
          </div>
        </div>

        {/* Risks */}
        <div className="rounded-2xl p-5" style={{ background:'#ffffff', border:'1px solid #e2e8f0', boxShadow:'0 1px 3px rgba(0,0,0,0.05)' }}>
          <div className="text-xs font-semibold uppercase tracking-wider mb-3" style={{ color:'#94a3b8' }}>Risks if No Action</div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {(active.risks_of_not_acting || []).map((r,i) => (
              <div key={i} className="flex items-center gap-2 rounded-xl p-3" style={{ background:'#fef2f2' }}>
                <div className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background:'#dc2626' }}/>
                <span className="text-xs" style={{ color:'#334155' }}>{r}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Actions */}
        {!isCommitted && !isHeld ? (
          <div className="flex gap-3">
            <button onClick={() => { holdDecision(active.id); setActionsVisible(false); }}
              className="px-8 py-3 rounded-xl text-sm font-bold transition-all"
              style={{ background:'#ffffff', border:'1.5px solid #d1d5db', color:'#374151' }}>
              Hold
            </button>
            <button onClick={() => { commitDecision(active.id); setActionsVisible(true); }}
              className="flex-1 py-3 rounded-xl text-sm font-bold text-white transition-opacity hover:opacity-90"
              style={{ background:'linear-gradient(135deg,#2563eb,#4f46e5)' }}>
              Commit Decision
            </button>
          </div>
        ) : isCommitted ? (
          <div className="space-y-3">
            <div className="rounded-xl p-4 flex items-center gap-3" style={{ background:'#f0fdf4', border:'1px solid #bbf7d0' }}>
              <svg className="w-5 h-5" fill="none" stroke="#16a34a" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"/>
              </svg>
              <span className="text-sm font-bold" style={{ color:'#15803d' }}>Decision committed. Next steps below.</span>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              {['Close Decision','Set Owner','Trigger Workflow','Approve Now'].map(a => (
                <button key={a} className="py-2.5 rounded-xl text-xs font-semibold transition-all"
                  style={{ background:'#ffffff', border:'1px solid #e2e8f0', color:'#334155' }}>{a}</button>
              ))}
            </div>
            {(actionsVisible || isCommitted) && (
              <div className="rounded-xl p-4" style={{ background:'#ffffff', border:'1px solid #e2e8f0' }}>
                <div className="text-xs font-semibold uppercase tracking-wider mb-2" style={{ color:'#94a3b8' }}>Suggested actions</div>
                <div className="space-y-2">
                  {(active.suggested_actions || []).map((a) => (
                    <div key={a.id} className="rounded-lg p-2.5 text-xs" style={{ background:'#f8fafc', border:'1px solid #e2e8f0' }}>
                      <div style={{ color:'#0f172a', fontWeight:600 }}>{a.title}</div>
                      <div style={{ color:'#64748b', marginTop:2 }}>{a.owner} • Due {a.due}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="rounded-xl p-4 flex items-center gap-3" style={{ background:'#fffbeb', border:'1px solid #fde68a' }}>
            <span className="text-sm font-bold" style={{ color:'#92400e' }}>Decision on hold. Review by tomorrow.</span>
            <button onClick={() => { commitDecision(active.id); setActionsVisible(true); }}
              className="ml-auto text-xs font-bold px-4 py-2 rounded-lg text-white" style={{ background:'#2563eb' }}>
              Commit Now
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
