import { useState, useMemo } from 'react';
import { useFilters } from '../contexts/FilterContext';
import { useDecisionState } from '../contexts/DecisionStateContext';
import { getDashboardSlice } from '../data/siboniSelectors';

const ST = {
  'On Track':    { bg:'#f0fdf4', color:'#16a34a', dot:'#16a34a' },
  'In Progress': { bg:'#eff6ff', color:'#2563eb', dot:'#2563eb' },
  'At Risk':     { bg:'#fffbeb', color:'#d97706', dot:'#d97706' },
  'Blocked':     { bg:'#fef2f2', color:'#dc2626', dot:'#dc2626' },
  'Stalled':     { bg:'#fef2f2', color:'#dc2626', dot:'#dc2626' },
  'Completed':   { bg:'#f0fdf4', color:'#16a34a', dot:'#16a34a' },
  'Not Started': { bg:'#f8fafc', color:'#64748b', dot:'#94a3b8' },
};

const pctFromStatus = (s) => ({
  'Completed':100,'In Progress':45,'At Risk':30,'Blocked':15,'Stalled':10,'Not Started':0,'On Track':65,
})[s]||0;

const StatusBadge = ({ status }) => {
  const c = ST[status] || ST['Not Started'];
  return (
    <span className="inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full"
      style={{ background:c.bg, color:c.color }}>
      <span className="w-1.5 h-1.5 rounded-full inline-block" style={{ background:c.dot }}/>
      {status}
    </span>
  );
};

const PctBar = ({ pct }) => (
  <div className="flex items-center gap-2">
    <div className="flex-1 h-1.5 rounded-full" style={{ background:'#e2e8f0' }}>
      <div className="h-full rounded-full"
        style={{ width:`${pct}%`, background: pct>=80?'#16a34a':pct>=50?'#2563eb':pct>0?'#d97706':'#e2e8f0' }}/>
    </div>
    <span className="text-xs font-bold w-9 text-right" style={{ color:'#334155' }}>{pct}%</span>
  </div>
);

const SUMMARY_CARDS = [
  { key:'totalValueAtStake', label:'Total Value at Stake', icon:'$', color:'#dc2626', bg:'#fef2f2' },
  { key:'activeDecisions',   label:'Active Decisions',     icon:'D', color:'#2563eb', bg:'#eff6ff' },
  { key:'actionsInProgress', label:'Actions In Progress',  icon:'A', color:'#d97706', bg:'#fffbeb' },
  { key:'actionsAtRisk',     label:'Actions At Risk',      icon:'!', color:'#ea580c', bg:'#fff7ed' },
  { key:'actionsCompleted',  label:'Actions Completed',    icon:'✓', color:'#16a34a', bg:'#f0fdf4' },
  { key:'actionsOverdue',    label:'Actions Overdue',      icon:'⚠', color:'#7c3aed', bg:'#f5f3ff' },
];

export default function ExecutionHub() {
  const [expanded, setExpanded] = useState({});
  const { filters } = useFilters();
  const { decisionState } = useDecisionState();
  const slice = useMemo(() => getDashboardSlice(filters, decisionState), [filters, decisionState]);
  const executionSummary = slice.execution.summary;
  const rows = slice.execution.rows;
  const kpiArray = slice.kpis.slice(0, 6);

  return (
    <div className="p-6 space-y-6" style={{ background:'#f4f6f9', minHeight:'100%' }}>

      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-black" style={{ color:'#0f172a' }}>Execution Hub</h1>
          <p className="text-sm mt-0.5" style={{ color:'#64748b' }}>
            Track committed decisions through milestones, owners, and completion.
          </p>
        </div>
        <button className="text-xs font-bold px-5 py-2.5 rounded-xl text-white transition-opacity hover:opacity-90"
          style={{ background:'linear-gradient(135deg,#2563eb,#4f46e5)' }}>
          + New Action
        </button>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        {kpiArray.map(k => (
          <div key={k.id} className="rounded-xl p-3"
            style={{ background:'#ffffff', border:'1px solid #e2e8f0', boxShadow:'0 1px 2px rgba(0,0,0,0.04)' }}>
            <div className="text-xs mb-1 font-semibold truncate" style={{ color:'#64748b' }}>{k.label}</div>
            <div className="text-lg font-black" style={{ color:'#0f172a' }}>{k.value}</div>
            <div className="text-xs font-semibold" style={{ color: k.trend==='up'?'#16a34a':'#dc2626' }}>{k.delta}</div>
          </div>
        ))}
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        {SUMMARY_CARDS.map(sc => (
          <div key={sc.key} className="rounded-xl p-4"
            style={{ background:'#ffffff', border:'1px solid #e2e8f0', boxShadow:'0 1px 3px rgba(0,0,0,0.05)' }}>
            <div className="flex items-center gap-2 mb-2">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold"
                style={{ background: sc.bg, color: sc.color }}>{sc.icon}</div>
              <span className="text-xs font-semibold" style={{ color:'#64748b' }}>{sc.label}</span>
            </div>
            <div className="text-2xl font-black" style={{ color: sc.color }}>
              {executionSummary[sc.key] ?? 0}
            </div>
          </div>
        ))}
      </div>

      {/* Execution Table */}
      <div className="rounded-2xl overflow-hidden"
        style={{ background:'#ffffff', border:'1px solid #e2e8f0', boxShadow:'0 1px 3px rgba(0,0,0,0.05)' }}>
        <div className="px-5 py-4" style={{ borderBottom:'1px solid #e2e8f0' }}>
          <span className="text-sm font-bold" style={{ color:'#0f172a' }}>Execution Actions</span>
        </div>
        <div className="grid px-5 py-2.5 text-xs font-semibold uppercase tracking-wider"
          style={{ gridTemplateColumns:'2.5fr 1fr 1fr 1fr 100px', background:'#f8fafc', borderBottom:'1px solid #e2e8f0', color:'#94a3b8' }}>
          <span>Action</span><span>Owner</span><span>Due Date</span><span>Status</span><span>Progress</span>
        </div>
        {rows.map(row => (
          <div key={row.decision_id}>
            <div className="grid px-5 py-3.5 cursor-pointer transition-colors hover:bg-slate-50"
              style={{ gridTemplateColumns:'2.5fr 1fr 1fr 1fr 100px', borderBottom:'1px solid #f1f5f9' }}
              onClick={() => setExpanded(p=>({...p,[row.decision_id]:!p[row.decision_id]}))}>
              <div className="flex items-center gap-2 min-w-0">
                <svg className="w-3.5 h-3.5 flex-shrink-0 transition-transform"
                  style={{ color:'#94a3b8', transform: expanded[row.decision_id]?'rotate(90deg)':'rotate(0deg)' }}
                  fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7"/>
                </svg>
                <div className="min-w-0">
                  <div className="text-sm font-semibold truncate" style={{ color:'#0f172a' }}>{row.title}</div>
                  <div className="text-xs" style={{ color:'#94a3b8' }}>{row.value_at_stake}</div>
                </div>
              </div>
              <span className="text-xs self-center" style={{ color:'#334155' }}>{row.owner}</span>
              <span className="text-xs self-center" style={{ color:'#64748b' }}>{row.due}</span>
              <div className="self-center"><StatusBadge status={row.status}/></div>
              <div className="self-center"><PctBar pct={pctFromStatus(row.status)}/></div>
            </div>
            {expanded[row.decision_id] && (
              <div style={{ background:'#f8fafc', borderBottom:'1px solid #e2e8f0' }}>
                {row.actions.map((a,i) => (
                  <div key={a.id} className="grid px-5 py-2.5"
                    style={{ gridTemplateColumns:'2.5fr 1fr 1fr 1fr 100px', borderTop: i>0?'1px solid #f1f5f9':'none' }}>
                    <div className="flex items-center gap-3 min-w-0">
                      <span style={{ display:'inline-block', width:28 }}/>
                      <div className="w-1 h-1 rounded-full flex-shrink-0" style={{ background:'#cbd5e1' }}/>
                      <span className="text-xs truncate" style={{ color:'#334155' }}>{a.title}</span>
                    </div>
                    <span className="text-xs self-center" style={{ color:'#94a3b8' }}>{a.owner}</span>
                    <span className="text-xs self-center" style={{ color:'#94a3b8' }}>{a.due_date}</span>
                    <div className="self-center"><StatusBadge status={a.status}/></div>
                    <div className="self-center"><PctBar pct={pctFromStatus(a.status)}/></div>
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
