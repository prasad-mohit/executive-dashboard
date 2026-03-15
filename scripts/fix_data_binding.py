import os

# ── InsightsHub ──
insights = r"""import { kpiArray, signals, decisions, externalIndicators } from '../data/gisData';

const CATEGORY_COLOR = {
  'Market & Business': { bg: '#eff6ff', color: '#2563eb', border: '#bfdbfe' },
  'Risk & Reputation':  { bg: '#fef2f2', color: '#dc2626', border: '#fecaca' },
  'Operations':         { bg: '#ecfeff', color: '#0891b2', border: '#a5f3fc' },
  'Finance':            { bg: '#f0fdf4', color: '#16a34a', border: '#bbf7d0' },
  'Commercial':         { bg: '#f5f3ff', color: '#7c3aed', border: '#ddd6fe' },
  'Growth':             { bg: '#fff7ed', color: '#ea580c', border: '#fed7aa' },
  'Supply Chain':       { bg: '#eff6ff', color: '#2563eb', border: '#bfdbfe' },
  'Quality':            { bg: '#fef9c3', color: '#ca8a04', border: '#fde68a' },
};

const SEV = {
  critical: { bg: '#fef2f2', color: '#dc2626', dot: '#dc2626', label: 'Critical' },
  high:     { bg: '#fff7ed', color: '#ea580c', dot: '#ea580c', label: 'High' },
  medium:   { bg: '#fef9c3', color: '#ca8a04', dot: '#ca8a04', label: 'Medium' },
  low:      { bg: '#f0fdf4', color: '#16a34a', dot: '#16a34a', label: 'Low' },
};

const Cat = ({ cat }) => {
  const c = CATEGORY_COLOR[cat] || { bg: '#f8fafc', color: '#64748b', border: '#e2e8f0' };
  return (
    <span className="text-xs font-semibold px-2 py-0.5 rounded-full"
      style={{ background: c.bg, color: c.color, border: `1px solid ${c.border}` }}>{cat}</span>
  );
};

const Sparkline = ({ color }) => {
  const pts = [20,35,15,45,28,38,25,42,18,48].map((v,i) => `${i*9},${50-v}`).join(' ');
  return (
    <svg width="80" height="30" viewBox="0 0 81 50" fill="none">
      <polyline points={pts} stroke={color} strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
};

const KpiCard = ({ k }) => (
  <div className="rounded-xl p-4" style={{ background:'#ffffff', border:'1px solid #e2e8f0', boxShadow:'0 1px 3px rgba(0,0,0,0.05)' }}>
    <div className="flex items-start justify-between mb-2">
      <span className="text-xs font-semibold leading-tight" style={{ color:'#64748b', maxWidth:'60%' }}>{k.label}</span>
      <span className="text-xs font-bold px-1.5 py-0.5 rounded-full flex-shrink-0"
        style={{ background: k.trend==='up'?'#f0fdf4':'#fef2f2', color: k.trend==='up'?'#16a34a':'#dc2626' }}>{k.delta}</span>
    </div>
    <div className="text-2xl font-black mb-1" style={{ color:'#0f172a' }}>{k.value}</div>
    <Sparkline color={k.trend==='up'?'#16a34a':'#dc2626'}/>
  </div>
);

const SignalCard = ({ s }) => {
  const sev = SEV[s.severity] || SEV['medium'];
  return (
    <div className="rounded-xl p-4" style={{ background:'#ffffff', border:'1px solid #e2e8f0', borderLeft:`3px solid ${sev.dot}`, boxShadow:'0 1px 3px rgba(0,0,0,0.05)' }}>
      <div className="flex items-center gap-2 mb-1.5 flex-wrap">
        <div className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background:sev.dot }}/>
        <Cat cat={s.category}/>
        <span className="ml-auto text-xs font-semibold px-1.5 py-0.5 rounded-full"
          style={{ background:sev.bg, color:sev.color }}>{sev.label}</span>
      </div>
      <div className="font-bold text-xs leading-snug mb-1" style={{ color:'#0f172a' }}>{s.title}</div>
      <div className="text-xs leading-relaxed" style={{ color:'#64748b' }}>{s.summary}</div>
    </div>
  );
};

const criticalCount = signals.filter(s => s.severity === 'critical' || s.severity === 'high').length;

export default function InsightsHub() {
  return (
    <div className="p-6 space-y-6" style={{ background:'#f4f6f9', minHeight:'100%' }}>

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black" style={{ color:'#0f172a' }}>Insights Hub</h1>
          <p className="text-sm mt-0.5" style={{ color:'#64748b' }}>Signal synthesis from 12 live sources. Refreshed today at 06:00.</p>
        </div>
        <div className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full"
          style={{ background:'#f0fdf4', color:'#16a34a', border:'1px solid #bbf7d0' }}>
          <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse inline-block"/>
          Live
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        {kpiArray.map(k => <KpiCard key={k.id} k={k}/>)}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

        {/* Col 1: Decision Recommendations */}
        <div className="space-y-3">
          <div className="flex items-center justify-between pb-2" style={{ borderBottom:'1px solid #e2e8f0' }}>
            <span className="text-sm font-bold" style={{ color:'#0f172a' }}>Decision Recommendations</span>
            <span className="text-xs font-bold px-2 py-0.5 rounded-full"
              style={{ background:'#fef9c3', color:'#ca8a04', border:'1px solid #fde68a' }}>{decisions.length} open</span>
          </div>
          {decisions.map(d => (
            <div key={d.id} className="rounded-xl p-4"
              style={{ background:'#ffffff', border:'1px solid #e2e8f0', boxShadow:'0 1px 3px rgba(0,0,0,0.05)' }}>
              <div className="flex items-center gap-2 mb-2 flex-wrap">
                <Cat cat={d.category}/>
                <span className="text-xs font-semibold ml-auto"
                  style={{ color: d.confidence==='High'?'#16a34a':d.confidence==='Medium-High'?'#2563eb':'#d97706' }}>
                  {d.confidence} conf.
                </span>
              </div>
              <div className="font-bold text-xs leading-snug mb-1" style={{ color:'#0f172a' }}>{d.title}</div>
              <div className="text-xs" style={{ color:'#64748b' }}>{d.context}</div>
              <div className="flex gap-1 mt-1.5 items-center">
                <span className="text-xs" style={{ color:'#94a3b8' }}>Value: </span>
                <span className="text-xs font-semibold" style={{ color:'#0f172a' }}>{d.value_at_stake}</span>
              </div>
            </div>
          ))}
        </div>

        {/* Col 2: Signals */}
        <div className="space-y-3">
          <div className="flex items-center justify-between pb-2" style={{ borderBottom:'1px solid #e2e8f0' }}>
            <span className="text-sm font-bold" style={{ color:'#0f172a' }}>Signals</span>
            <span className="text-xs font-bold px-2 py-0.5 rounded-full"
              style={{ background:'#fef2f2', color:'#dc2626', border:'1px solid #fecaca' }}>{criticalCount} critical/high</span>
          </div>
          {signals.map(s => <SignalCard key={s.id} s={s}/>)}
        </div>

        {/* Col 3: Impact Indicators + Risks */}
        <div className="space-y-4">
          <div>
            <div className="text-sm font-bold pb-2 mb-3" style={{ color:'#0f172a', borderBottom:'1px solid #e2e8f0' }}>
              Impact Indicators
            </div>
            <div className="space-y-3">
              {externalIndicators.slice(0,4).map(ind => (
                <div key={ind.id} className="rounded-xl p-3 flex items-center gap-3"
                  style={{ background:'#ffffff', border:'1px solid #e2e8f0', boxShadow:'0 1px 3px rgba(0,0,0,0.04)' }}>
                  <div className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                    style={{ background: ind.direction==='down'?'#dc2626':'#16a34a' }}/>
                  <div className="flex-1 min-w-0">
                    <div className="text-xs font-semibold truncate" style={{ color:'#0f172a' }}>{ind.label}</div>
                    <div className="text-xs" style={{ color:'#94a3b8' }}>{ind.value}</div>
                  </div>
                  <div className="text-xs font-bold"
                    style={{ color: ind.direction==='down'?'#dc2626':'#16a34a' }}>{ind.change}</div>
                </div>
              ))}
            </div>
          </div>
          <div>
            <div className="text-sm font-bold pb-2 mb-3" style={{ color:'#0f172a', borderBottom:'1px solid #e2e8f0' }}>
              Downside Risks
            </div>
            <div className="space-y-2">
              {[
                { text:'Steel tariff escalation could add $28M cost by Q3', sev:'Critical' },
                { text:'Detroit line OTD at 74% — customer penalty clause triggers at 70%', sev:'High' },
                { text:'Competitor pricing 8% below on Braking for Ford renewal', sev:'High' },
                { text:'USDEUR appreciation eroding $4.2M margin on EU exports', sev:'Medium' },
              ].map((r,i) => {
                const c = { Critical:'#dc2626', High:'#ea580c', Medium:'#ca8a04', Low:'#16a34a' };
                const b = { Critical:'#fef2f2', High:'#fff7ed', Medium:'#fef9c3', Low:'#f0fdf4' };
                return (
                  <div key={i} className="rounded-lg p-3 flex items-start gap-2"
                    style={{ background: b[r.sev]||'#f8fafc' }}>
                    <div className="w-1.5 h-1.5 rounded-full mt-1 flex-shrink-0" style={{ background: c[r.sev] }}/>
                    <span className="text-xs leading-relaxed" style={{ color:'#334155' }}>{r.text}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
"""

# ── DecisionHub ──
decisions_pg = r"""import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { decisions, statusColors } from '../data/gisData';

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
  const [committed, setCommitted] = useState({});
  const [held, setHeld] = useState({});

  const activeId = id || decisions[0]?.id;
  const active = decisions.find(d => d.id === activeId) || decisions[0];
  if (!active) return <div className="p-12 text-center" style={{ color:'#94a3b8' }}>No decisions found</div>;

  const isCommitted = committed[active.id] || active.committed;
  const isHeld = held[active.id];

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
          const isDone = committed[d.id] || d.committed;
          const isOn = held[d.id];
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
            <button onClick={() => setHeld(p=>({...p,[active.id]:true}))}
              className="px-8 py-3 rounded-xl text-sm font-bold transition-all"
              style={{ background:'#ffffff', border:'1.5px solid #d1d5db', color:'#374151' }}>
              Hold
            </button>
            <button onClick={() => setCommitted(p=>({...p,[active.id]:true}))}
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
          </div>
        ) : (
          <div className="rounded-xl p-4 flex items-center gap-3" style={{ background:'#fffbeb', border:'1px solid #fde68a' }}>
            <span className="text-sm font-bold" style={{ color:'#92400e' }}>Decision on hold. Review by tomorrow.</span>
            <button onClick={() => { setCommitted(p=>({...p,[active.id]:true})); setHeld(p=>{const n={...p};delete n[active.id];return n;}); }}
              className="ml-auto text-xs font-bold px-4 py-2 rounded-lg text-white" style={{ background:'#2563eb' }}>
              Commit Now
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
"""

# ── HomePage ──
home_pg = r"""import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { kpiArray, decisions, topDecisionHome, valueAtStake } from '../data/gisData';

const VAS_ENTRIES = (vas) => [
  { label:'Revenue at Risk',  value: vas.revenue_at_risk, positive: false },
  { label:'Margin at Risk',   value: vas.margin_at_risk,  positive: false },
  { label:'OTIF Penalty',     value: vas.otif_penalty,    positive: false },
  { label:'Total Headline',   value: vas.total_headline,  positive: false },
];

const WHAT_CHANGED = [
  { text:'Supplier X OTIF dropped to 91% — below single-source risk threshold.', critical: true },
  { text:'Ford EV ramp Q2: 40% axle volume increase required from Detroit plant.', critical: true },
  { text:'Steel HRC benchmark +6% in 30 days — margin pressure building.', critical: false },
  { text:'Axle-B scrap rate up 62% (2.1% → 3.4%). Ford audit in 18 days.', critical: true },
  { text:'Bajaj signaled Tier-1 sourcing interest — services growth opportunity.', critical: false },
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
  const now = new Date();
  const dateStr = now.toLocaleDateString('en-US',{ weekday:'long', year:'numeric', month:'long', day:'numeric' });
  const td = topDecisionHome;
  const vasEntries = VAS_ENTRIES(valueAtStake);

  return (
    <div className="p-6 space-y-6" style={{ background:'#f4f6f9', minHeight:'100%' }}>

      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-black" style={{ color:'#0f172a' }}>
            Good morning, {user?.name?.split(' ')[0] || 'Marcus'}
          </h1>
          <p className="text-sm mt-1" style={{ color:'#64748b' }}>{dateStr}</p>
        </div>
        <button className="text-xs font-semibold px-5 py-2.5 rounded-xl text-white transition-opacity hover:opacity-90 flex items-center gap-1.5"
          style={{ background:'linear-gradient(135deg,#2563eb,#4f46e5)' }}>
          <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
          </svg>
          Board Brief
        </button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        {kpiArray.map(k => <Kpi key={k.id} k={k}/>)}
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
            <button onClick={() => navigate('/app/decisions')}
              className="flex-1 text-xs font-bold py-2 rounded-xl text-white transition-opacity hover:opacity-90"
              style={{ background:'#2563eb' }}>Decide Now</button>
            <button onClick={() => navigate('/app/decisions')}
              className="flex-1 text-xs font-semibold py-2 rounded-xl transition-all"
              style={{ background:'#f8fafc', border:'1px solid #e2e8f0', color:'#334155' }}>
              All ({decisions.length})
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
            <span className="text-sm font-black" style={{ color:'#dc2626' }}>{valueAtStake.total_headline}</span>
          </div>
        </div>

        {/* What Changed */}
        <div className="rounded-2xl p-5" style={{ background:'#ffffff', border:'1px solid #e2e8f0', boxShadow:'0 1px 3px rgba(0,0,0,0.05)' }}>
          <div className="text-xs font-semibold uppercase tracking-wider mb-3" style={{ color:'#94a3b8' }}>What Changed</div>
          <div className="space-y-2">
            {WHAT_CHANGED.map((item,i) => (
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
"""

# ── ExecutionHub ──
execution_pg = r"""import { useState } from 'react';
import { kpiArray, executionActions, executionSummary, decisions } from '../data/gisData';

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

  // Group actions by decision
  const decisionMap = {};
  decisions.forEach(d => { decisionMap[d.id] = d; });
  const grouped = {};
  executionActions.forEach(a => {
    if (!grouped[a.decision_id]) grouped[a.decision_id] = [];
    grouped[a.decision_id].push(a);
  });
  const rows = Object.entries(grouped).map(([did, actions]) => ({
    decision_id: did,
    title: decisionMap[did]?.shortTitle || decisionMap[did]?.title || did,
    owner: decisionMap[did]?.owner || '',
    status: decisionMap[did]?.status || 'Not Started',
    value: decisionMap[did]?.value_at_stake || '',
    actions,
  }));

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
                  <div className="text-xs" style={{ color:'#94a3b8' }}>{row.value}</div>
                </div>
              </div>
              <span className="text-xs self-center" style={{ color:'#334155' }}>{row.owner}</span>
              <span className="text-xs self-center" style={{ color:'#64748b' }}>—</span>
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
"""

base = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
files = {
  'src/pages/InsightsHub.jsx': insights,
  'src/pages/DecisionHub.jsx': decisions_pg,
  'src/pages/HomePage.jsx': home_pg,
  'src/pages/ExecutionHub.jsx': execution_pg,
}
for rel, content in files.items():
    p = os.path.join(base, rel)
    with open(p, 'w', encoding='utf-8') as f:
        f.write(content)
    print('Written:', p)
print('All done.')
