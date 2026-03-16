import { useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { statusColors } from '../data/gisData';
import { useFilters } from '../contexts/FilterContext';
import { useDecisionState } from '../contexts/DecisionStateContext';
import { getDashboardSlice } from '../data/siboniSelectors';

// ── GIS team for Set Owner ────────────────────────────────────────
const GIS_TEAM = [
  { id:'u10', name:'Marcus Gaksh', title:'CEO',                   avatar:'MG', dept:'Executive Office' },
  { id:'u11', name:'Priya Sharma', title:'COO',                   avatar:'PS', dept:'Operations'      },
  { id:'u12', name:'Jamie Chen',   title:'CFO',                   avatar:'JC', dept:'Finance'         },
  { id:'u13', name:'Raj Kumar',    title:'SVP Sales',             avatar:'RK', dept:'Sales'           },
  { id:'u14', name:'Lisa Park',    title:'Chief Product Officer', avatar:'LP', dept:'Product'         },
  { id:'u15', name:'Dev Admin',    title:'Platform Admin',        avatar:'DA', dept:'IT & Platform'   },
];

// ── Workflow types for Trigger Workflow ───────────────────────────
const WORKFLOW_TYPES = [
  { id:'war_room',    icon:'⚡', title:'War Room',
    desc:'Immediate cross-functional session to unblock critical decisions',
    color:'#dc2626', bg:'#fef2f2', border:'#fecaca',
    times:['Now — 30 min','Today 3 PM','Tomorrow 9 AM'],
    participants:['CEO','COO','CFO','Legal','SVP Sales'] },
  { id:'board_meeting', icon:'🏛️', title:'Board Meeting',
    desc:'Formal board-level review for decisions requiring board approval',
    color:'#4f46e5', bg:'#eef2ff', border:'#c7d2fe',
    times:['This week','Next week','End of month'],
    participants:['Board Members','CEO','CFO'] },
  { id:'approval_chain', icon:'✅', title:'Approval Chain',
    desc:'Sequential approval workflow through defined authority levels',
    color:'#059669', bg:'#ecfdf5', border:'#a7f3d0',
    times:['Standard (48h)','Expedited (24h)','Emergency (4h)'],
    participants:['Decision Owner','CFO','CEO'] },
  { id:'stakeholder_update', icon:'📣', title:'Stakeholder Update',
    desc:'Structured broadcast to all relevant stakeholders',
    color:'#0369a1', bg:'#f0f9ff', border:'#bae6fd',
    times:['Send now','Schedule 9 AM','End of day'],
    participants:['All department heads','Board observer'] },
];

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
  const [showOwnerModal, setShowOwnerModal]   = useState(false);
  const [showWorkflowModal, setShowWorkflowModal] = useState(false);
  const [selectedOwner, setSelectedOwner]     = useState(null);
  const [ownerSaved, setOwnerSaved]           = useState(false);
  const [workflowType, setWorkflowType]       = useState(null);
  const [workflowTime, setWorkflowTime]       = useState('');
  const [workflowLaunched, setWorkflowLaunched] = useState(false);

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
    <>
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
              <button className="py-2.5 rounded-xl text-xs font-semibold transition-all"
                style={{ background:'#f0fdf4', border:'1px solid #bbf7d0', color:'#16a34a', cursor:'pointer' }}>
                Close Decision
              </button>
              <button onClick={() => { setSelectedOwner(null); setOwnerSaved(false); setShowOwnerModal(true); }}
                className="py-2.5 rounded-xl text-xs font-semibold transition-all"
                style={{ background:'#eff6ff', border:'1px solid #bfdbfe', color:'#2563eb', cursor:'pointer' }}>
                Set Owner
              </button>
              <button onClick={() => { setWorkflowType(null); setWorkflowTime(''); setWorkflowLaunched(false); setShowWorkflowModal(true); }}
                className="py-2.5 rounded-xl text-xs font-semibold transition-all"
                style={{ background:'#f5f3ff', border:'1px solid #ddd6fe', color:'#7c3aed', cursor:'pointer' }}>
                Trigger Workflow
              </button>
              <button className="py-2.5 rounded-xl text-xs font-semibold transition-all"
                style={{ background:'#fffbeb', border:'1px solid #fde68a', color:'#ca8a04', cursor:'pointer' }}>
                Approve Now
              </button>
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

      {/* ── Set Owner Modal ────────────────────────────────────── */}
      {showOwnerModal && (
        <div style={{ position:'fixed', inset:0, background:'rgba(15,23,42,0.65)',
          display:'flex', alignItems:'center', justifyContent:'center', zIndex:9999, padding:24 }}>
          <div style={{ background:'#ffffff', borderRadius:16, width:'100%', maxWidth:460,
            boxShadow:'0 20px 60px rgba(0,0,0,0.25)' }}>
            <div style={{ padding:'18px 24px', borderBottom:'1px solid #f1f5f9',
              display:'flex', alignItems:'center', justifyContent:'space-between' }}>
              <div>
                <div style={{ fontSize:15, fontWeight:800, color:'#0f172a' }}>Set Decision Owner</div>
                <div style={{ fontSize:11, color:'#64748b', marginTop:2 }}>{active.shortTitle || active.title}</div>
              </div>
              <button onClick={() => setShowOwnerModal(false)}
                style={{ background:'none', border:'none', cursor:'pointer', color:'#94a3b8' }}>
                <svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12"/>
                </svg>
              </button>
            </div>
            <div style={{ padding:'16px 24px', display:'flex', flexDirection:'column', gap:8 }}>
              {ownerSaved ? (
                <div style={{ background:'#f0fdf4', border:'1px solid #bbf7d0', borderRadius:10,
                  padding:'14px 16px', display:'flex', alignItems:'center', gap:10 }}>
                  <svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"/>
                  </svg>
                  <div>
                    <div style={{ fontSize:13, fontWeight:700, color:'#15803d' }}>Owner assigned!</div>
                    <div style={{ fontSize:11, color:'#64748b' }}>{selectedOwner?.name} ({selectedOwner?.title}) is now the decision owner.</div>
                  </div>
                </div>
              ) : (
                <>
                  <div style={{ fontSize:11, color:'#64748b', marginBottom:2 }}>Select a team member to own this decision:</div>
                  {GIS_TEAM.map(u => (
                    <div key={u.id} onClick={() => setSelectedOwner(u)}
                      style={{ display:'flex', alignItems:'center', gap:12, padding:'10px 14px',
                        borderRadius:10, cursor:'pointer',
                        background: selectedOwner?.id === u.id ? '#eff6ff' : '#f8fafc',
                        border:`${selectedOwner?.id === u.id ? 2 : 1}px solid ${selectedOwner?.id === u.id ? '#2563eb' : '#e2e8f0'}` }}>
                      <div style={{ width:34, height:34, borderRadius:'50%', background:'#eff6ff', flexShrink:0,
                        display:'flex', alignItems:'center', justifyContent:'center' }}>
                        <span style={{ fontSize:11, fontWeight:800, color:'#2563eb' }}>{u.avatar}</span>
                      </div>
                      <div style={{ flex:1 }}>
                        <div style={{ fontSize:13, fontWeight:700, color:'#0f172a' }}>{u.name}</div>
                        <div style={{ fontSize:11, color:'#64748b' }}>{u.title} · {u.dept}</div>
                      </div>
                      {selectedOwner?.id === u.id && (
                        <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="#2563eb" strokeWidth={2.5}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"/>
                        </svg>
                      )}
                    </div>
                  ))}
                </>
              )}
            </div>
            {!ownerSaved && (
              <div style={{ padding:'12px 24px 20px', display:'flex', gap:8 }}>
                <button onClick={() => setShowOwnerModal(false)}
                  style={{ flex:1, fontSize:13, fontWeight:700, padding:'10px 0', borderRadius:10,
                    background:'#f8fafc', border:'1px solid #e2e8f0', color:'#475569', cursor:'pointer' }}>
                  Cancel
                </button>
                <button onClick={() => { if (selectedOwner) setOwnerSaved(true); }}
                  style={{ flex:2, fontSize:13, fontWeight:700, padding:'10px 0', borderRadius:10,
                    background: selectedOwner ? 'linear-gradient(135deg,#2563eb,#4f46e5)' : '#e2e8f0',
                    color: selectedOwner ? '#ffffff' : '#94a3b8', border:'none',
                    cursor: selectedOwner ? 'pointer' : 'default' }}>
                  Assign Owner
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── Trigger Workflow Modal ─────────────────────────────── */}
      {showWorkflowModal && (
        <div style={{ position:'fixed', inset:0, background:'rgba(15,23,42,0.65)',
          display:'flex', alignItems:'center', justifyContent:'center', zIndex:9999, padding:24 }}>
          <div style={{ background:'#ffffff', borderRadius:16, width:'100%', maxWidth:560,
            maxHeight:'90vh', overflow:'auto', boxShadow:'0 20px 60px rgba(0,0,0,0.25)' }}>
            <div style={{ padding:'18px 24px', borderBottom:'1px solid #f1f5f9',
              display:'flex', alignItems:'center', justifyContent:'space-between' }}>
              <div>
                <div style={{ fontSize:15, fontWeight:800, color:'#0f172a' }}>Trigger Workflow</div>
                <div style={{ fontSize:11, color:'#64748b', marginTop:2 }}>{active.shortTitle || active.title}</div>
              </div>
              <button onClick={() => setShowWorkflowModal(false)}
                style={{ background:'none', border:'none', cursor:'pointer', color:'#94a3b8' }}>
                <svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12"/>
                </svg>
              </button>
            </div>
            <div style={{ padding:'16px 24px', display:'flex', flexDirection:'column', gap:12 }}>
              {workflowLaunched ? (
                <div style={{ background:'#f0fdf4', border:'1px solid #bbf7d0', borderRadius:10, padding:'16px' }}>
                  <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:8 }}>
                    <svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"/>
                    </svg>
                    <div style={{ fontSize:14, fontWeight:800, color:'#15803d' }}>Workflow launched!</div>
                  </div>
                  <div style={{ fontSize:12, color:'#334155' }}>
                    <b>{WORKFLOW_TYPES.find(w => w.id === workflowType)?.title}</b> triggered for{' '}
                    <b>{active.shortTitle || active.title}</b>.
                  </div>
                  <div style={{ fontSize:11, color:'#64748b', marginTop:4 }}>
                    Scheduled: {workflowTime} · Invites sent to all participants.
                  </div>
                </div>
              ) : (
                <>
                  <div style={{ fontSize:11, color:'#64748b' }}>Choose the type of executive action to trigger:</div>
                  <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10 }}>
                    {WORKFLOW_TYPES.map(wf => (
                      <div key={wf.id}
                        onClick={() => { setWorkflowType(wf.id); setWorkflowTime(wf.times[0]); }}
                        style={{ padding:'14px', borderRadius:12, cursor:'pointer',
                          background: workflowType === wf.id ? wf.bg : '#f8fafc',
                          border:`${workflowType === wf.id ? 2 : 1}px solid ${workflowType === wf.id ? wf.border : '#e2e8f0'}` }}>
                        <div style={{ fontSize:20, marginBottom:6 }}>{wf.icon}</div>
                        <div style={{ fontSize:13, fontWeight:800,
                          color: workflowType === wf.id ? wf.color : '#0f172a', marginBottom:4 }}>
                          {wf.title}
                        </div>
                        <div style={{ fontSize:11, color:'#64748b', lineHeight:1.5 }}>{wf.desc}</div>
                      </div>
                    ))}
                  </div>
                  {workflowType && (() => {
                    const wf = WORKFLOW_TYPES.find(w => w.id === workflowType);
                    return wf ? (
                      <div style={{ background:'#f8fafc', border:'1px solid #e2e8f0', borderRadius:10, padding:'12px 14px' }}>
                        <div style={{ fontSize:11, fontWeight:700, color:'#64748b', marginBottom:8 }}>Schedule &amp; Participants</div>
                        <div style={{ display:'flex', gap:8, flexWrap:'wrap', marginBottom:8 }}>
                          {wf.times.map(t => (
                            <button key={t} onClick={() => setWorkflowTime(t)}
                              style={{ fontSize:11, fontWeight:700, padding:'5px 12px', borderRadius:8,
                                background: workflowTime === t ? wf.color : '#ffffff',
                                color: workflowTime === t ? '#ffffff' : '#475569',
                                border:`1px solid ${workflowTime === t ? wf.color : '#e2e8f0'}`,
                                cursor:'pointer' }}>{t}</button>
                          ))}
                        </div>
                        <div style={{ fontSize:11, color:'#64748b' }}>Participants: {wf.participants.join(', ')}</div>
                      </div>
                    ) : null;
                  })()}
                </>
              )}
            </div>
            {!workflowLaunched && (
              <div style={{ padding:'12px 24px 20px', display:'flex', gap:8 }}>
                <button onClick={() => setShowWorkflowModal(false)}
                  style={{ flex:1, fontSize:13, fontWeight:700, padding:'10px 0', borderRadius:10,
                    background:'#f8fafc', border:'1px solid #e2e8f0', color:'#475569', cursor:'pointer' }}>
                  Cancel
                </button>
                <button onClick={() => { if (workflowType) setWorkflowLaunched(true); }}
                  style={{ flex:2, fontSize:13, fontWeight:700, padding:'10px 0', borderRadius:10,
                    background: workflowType
                      ? `linear-gradient(135deg,${WORKFLOW_TYPES.find(w=>w.id===workflowType)?.color||'#2563eb'},#4f46e5)`
                      : '#e2e8f0',
                    color: workflowType ? '#ffffff' : '#94a3b8', border:'none',
                    cursor: workflowType ? 'pointer' : 'default' }}>
                  Launch Workflow
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
