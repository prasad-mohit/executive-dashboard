import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useFilters } from '../contexts/FilterContext';
import { useDecisionState } from '../contexts/DecisionStateContext';
import { getDashboardSlice } from '../data/siboniSelectors';

const VAS_ENTRIES = (vas) => [
  { label:'Revenue at Risk',  value: vas.revenue_at_risk, positive: false },
  { label:'Margin at Risk',   value: vas.margin_at_risk,  positive: false },
  { label:'OTIF Penalty',     value: vas.otif_penalty,    positive: false },
  { label:'Total Headline',   value: vas.total_headline,  positive: false },
];

const Kpi = ({ k }) => (
  <div className="rounded-xl p-4 flex flex-col gap-1"
    style={{ background:'#ffffff', border:'1px solid #e2e8f0', boxShadow:'0 1px 3px rgba(0,0,0,0.05)' }}>
    <div className="flex items-center justify-between gap-2 mb-1">
      <span className="text-xs font-semibold truncate" style={{ color:'#64748b' }}>{k.label}</span>
      <span className="text-xs font-bold px-1.5 py-0.5 rounded-full"
        style={{ background: k.trend==='up'?'#f0fdf4':'#fef2f2', color: k.trend==='up'?'#16a34a':'#dc2626' }}>
        {k.delta}
      </span>
    </div>
    <div className="text-xl font-black" style={{ color:'#0f172a' }}>{k.value}</div>
    <div className="text-xs" style={{ color:'#94a3b8' }}>{k.sublabel}</div>
  </div>
);

const HubCard = ({ to, title, subtitle, icon, color, bg }) => {
  const navigate = useNavigate();
  return (
    <div className="rounded-2xl p-6 cursor-pointer transition-all hover:-translate-y-0.5 hover:shadow-md"
      style={{ background:'#ffffff', border:'1px solid #e2e8f0', boxShadow:'0 1px 3px rgba(0,0,0,0.05)' }}
      onClick={() => navigate(to)}>
      <div className="flex items-start gap-3 mb-3">
        <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: bg }}>
          <svg className="w-5 h-5" fill="none" stroke={color} strokeWidth={1.75} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d={icon}/>
          </svg>
        </div>
        <div>
          <div className="font-bold text-sm" style={{ color:'#0f172a' }}>{title}</div>
          <div className="text-xs mt-0.5" style={{ color:'#94a3b8' }}>{subtitle}</div>
        </div>
      </div>
      <div className="text-xs font-semibold flex items-center gap-1" style={{ color: color }}>
        Open
        <svg className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7"/>
        </svg>
      </div>
    </div>
  );
};

export default function HomePage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { filters } = useFilters();
  const { decisionState } = useDecisionState();
  const slice = useMemo(() => getDashboardSlice(filters, decisionState), [filters, decisionState]);

  const now = new Date();
  const dateStr = now.toLocaleDateString('en-US',{ weekday:'long', year:'numeric', month:'long', day:'numeric' });
  const td = slice.topDecision;
  const vasEntries = VAS_ENTRIES(slice.valueAtStake);
  const whatChanged = slice.whatChanged;
  const headlineKpis = slice.kpis.slice(0, 6);

  return (
    <div className="p-6 space-y-6" style={{ background:'#f4f6f9', minHeight:'100%' }}>

      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-black" style={{ color:'#0f172a' }}>
            Good morning, {user?.name?.split(' ')[0] || 'Marcus'}
          </h1>
          <p className="text-sm mt-1" style={{ color:'#64748b' }}>{dateStr}</p>
        </div>
        <button onClick={() => navigate('/app/board')} className="text-xs font-semibold px-5 py-2.5 rounded-xl text-white transition-opacity hover:opacity-90 flex items-center gap-1.5"
          style={{ background:'linear-gradient(135deg,#2563eb,#4f46e5)' }}>
          <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
          </svg>
          Board Brief
        </button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        {headlineKpis.map(k => <Kpi key={k.id} k={k}/>)}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

        {/* Top Decision */}
        <div className="rounded-2xl p-5" style={{ background:'#ffffff', border:'1px solid #e2e8f0', boxShadow:'0 1px 3px rgba(0,0,0,0.05)' }}>
          <div className="flex items-center gap-2 mb-3">
            <span className="text-xs font-bold px-2 py-0.5 rounded-full"
              style={{ background:'#fef9c3', color:'#ca8a04', border:'1px solid #fde68a' }}>DECISION NEEDED</span>
          </div>
          <div className="font-bold text-sm mb-1.5" style={{ color:'#0f172a' }}>{td.title}</div>
          <div className="text-xs mb-3" style={{ color:'#64748b' }}>{td.context}</div>
          <div className="flex gap-2 text-xs mb-3 flex-wrap">
            <span className="px-2 py-0.5 rounded-full"
              style={{ background:'#f8fafc', color:'#64748b', border:'1px solid #e2e8f0' }}>
              Confidence: {td.confidence}
            </span>
            <span className="px-2 py-0.5 rounded-full"
              style={{ background:'#fef2f2', color:'#dc2626', border:'1px solid #fecaca' }}>
              Window: {td.time_window_days} days
            </span>
          </div>
          <div className="flex gap-2">
            <button onClick={() => navigate(`/app/decisions/${td?.decision_id || ''}`)}
              className="flex-1 text-xs font-bold py-2 rounded-xl text-white transition-opacity hover:opacity-90"
              style={{ background:'#2563eb' }}>Decide Now</button>
            <button onClick={() => navigate('/app/decisions')}
              className="flex-1 text-xs font-semibold py-2 rounded-xl transition-all"
              style={{ background:'#f8fafc', border:'1px solid #e2e8f0', color:'#334155' }}>
              All ({slice.decisions.length})
            </button>
          </div>
        </div>

        {/* Value at Stake */}
        <div className="rounded-2xl p-5" style={{ background:'#ffffff', border:'1px solid #e2e8f0', boxShadow:'0 1px 3px rgba(0,0,0,0.05)' }}>
          <div className="text-xs font-semibold uppercase tracking-wider mb-3" style={{ color:'#94a3b8' }}>Value at Stake</div>
          {vasEntries.map(v => (
            <div key={v.label} className="flex items-center justify-between py-2"
              style={{ borderBottom:'1px solid #f1f5f9' }}>
              <span className="text-xs" style={{ color:'#334155' }}>{v.label}</span>
              <span className="text-xs font-bold" style={{ color:'#dc2626' }}>{v.value}</span>
            </div>
          ))}
          <div className="mt-3 pt-2 flex items-center justify-between" style={{ borderTop:'1px solid #e2e8f0' }}>
            <span className="text-xs font-bold" style={{ color:'#0f172a' }}>Total</span>
            <span className="text-sm font-black" style={{ color:'#dc2626' }}>{slice.valueAtStake.total_headline}</span>
          </div>
        </div>

        {/* What Changed */}
        <div className="rounded-2xl p-5" style={{ background:'#ffffff', border:'1px solid #e2e8f0', boxShadow:'0 1px 3px rgba(0,0,0,0.05)' }}>
          <div className="text-xs font-semibold uppercase tracking-wider mb-3" style={{ color:'#94a3b8' }}>What Changed</div>
          <div className="space-y-2">
            {whatChanged.map((item,i) => (
              <div key={i} className="flex items-start gap-2">
                <div className="w-1.5 h-1.5 rounded-full mt-1.5 flex-shrink-0"
                  style={{ background: item.critical?'#dc2626':'#d97706' }}/>
                <div className="text-xs leading-relaxed" style={{ color:'#334155' }}>{item.text}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div>
        <div className="text-xs font-semibold uppercase tracking-wider mb-3" style={{ color:'#94a3b8' }}>Navigate to</div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <HubCard to="/app/insights" title="Insights Hub" subtitle="Signals, KPIs & recommendations"
            color="#2563eb" bg="#eff6ff"
            icon="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
          <HubCard to="/app/decisions" title="Decision Hub" subtitle="Review and commit decisions"
            color="#7c3aed" bg="#f5f3ff"
            icon="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"/>
          <HubCard to="/app/execution" title="Execution Hub" subtitle="Track actions and milestones"
            color="#0891b2" bg="#ecfeff"
            icon="M13 10V3L4 14h7v7l9-11h-7z"/>
        </div>
      </div>
    </div>
  );
}
