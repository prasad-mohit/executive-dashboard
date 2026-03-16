import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useFilters } from '../contexts/FilterContext';
import { useDecisionState } from '../contexts/DecisionStateContext';
import { useAuth } from '../contexts/AuthContext';
import { getDashboardSlice } from '../data/siboniSelectors';

// KPI color palette (index-matched)
const KPI_COLORS = ['#2563eb', '#7c3aed', '#0891b2', '#059669', '#d97706', '#dc2626'];

const CONF_STYLE = {
  'High':        { bg:'#f0fdf4', color:'#16a34a', border:'#bbf7d0' },
  'Medium-High': { bg:'#eff6ff', color:'#2563eb', border:'#bfdbfe' },
  'Medium':      { bg:'#fef9c3', color:'#ca8a04', border:'#fde68a' },
  'Low':         { bg:'#fef2f2', color:'#dc2626', border:'#fecaca' },
};

const SEV = {
  high:   { bg:'#fef2f2', color:'#991b1b', border:'#fecaca', dot:'#dc2626', label:'High'   },
  medium: { bg:'#fef9c3', color:'#92400e', border:'#fde68a', dot:'#d97706', label:'Medium' },
  low:    { bg:'#f0fdf4', color:'#166534', border:'#bbf7d0', dot:'#16a34a', label:'Low'    },
};

const CAT_C = {
  'Commercial':              { bg:'#eff6ff', color:'#2563eb' },
  'Supply Chain':            { bg:'#fff7ed', color:'#c2410c' },
  'Quality':                 { bg:'#fef9c3', color:'#92400e' },
  'Growth':                  { bg:'#f5f3ff', color:'#6d28d9' },
  'Market & Business':       { bg:'#ecfdf5', color:'#065f46' },
  'Risk & Reputation':       { bg:'#fef2f2', color:'#991b1b' },
  'Regulatory & Policy':     { bg:'#f0f9ff', color:'#0369a1' },
  'Benchmarking & Perception':{ bg:'#fdf4ff', color:'#7e22ce' },
};

function CatChip({ cat }) {
  const c = CAT_C[cat] || { bg:'#f8fafc', color:'#475569' };
  return (
    <span style={{ background:c.bg, color:c.color, border:`1px solid ${c.color}33`,
      fontSize:10, fontWeight:700, padding:'2px 8px', borderRadius:99 }}>
      {cat}
    </span>
  );
}

function Spark({ pts, color, active }) {
  const H = 40, W = 80;
  const max = Math.max(...pts), min = Math.min(...pts);
  const range = max - min || 1;
  const ys = pts.map(v => H - 4 - ((v - min) / range) * (H - 8));
  const xs = pts.map((_, i) => (i / (pts.length - 1)) * W);
  const path = xs.map((x, i) => `${i === 0 ? 'M' : 'L'}${x.toFixed(1)},${ys[i].toFixed(1)}`).join(' ');
  const area = `${path} L${W},${H} L0,${H} Z`;
  return (
    <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} fill="none">
      <path d={area} fill={`${color}18`} />
      <path d={path} stroke={color} strokeWidth={active ? 2.5 : 2} strokeLinecap="round" strokeLinejoin="round" />
      <circle cx={xs[xs.length-1].toFixed(1)} cy={ys[ys.length-1].toFixed(1)} r={3} fill={color} />
    </svg>
  );
}

export default function InsightsHub() {
  const navigate = useNavigate();
  const { filters } = useFilters();
  const { decisionState } = useDecisionState();
  const { user } = useAuth();
  const [activeId, setActiveId] = useState('revenue');

  const slice = useMemo(() => getDashboardSlice(filters, decisionState), [filters, decisionState]);
  const decisions = slice.decisions;
  const signals = slice.signals;
  const externalIndicators = slice.externalIndicators;
  const impactIndicators = slice.impactIndicators;
  const downsideRisks = slice.downsideRisks;

  const isAdmin = user?.role === 'analyst';

  const topDecisions = decisions.slice(0, 3);
  const topSignals   = signals.slice(0, 4);

  return (
    <div style={{ background:'#f4f6f9', minHeight:'100%', padding:'20px 24px', display:'flex', flexDirection:'column', gap:16 }}>

      {/* LIVE ticker */}
      <div style={{ display:'flex', alignItems:'center', gap:12,
        background:'#ffffff', border:'1px solid #e2e8f0', borderRadius:10,
        padding:'8px 14px', boxShadow:'0 1px 3px rgba(0,0,0,0.05)', overflow:'hidden' }}>
        <span style={{ display:'flex', alignItems:'center', gap:6, flexShrink:0,
          background:'#f0fdf4', color:'#16a34a', border:'1px solid #bbf7d0',
          fontSize:11, fontWeight:700, padding:'3px 10px', borderRadius:99 }}>
          <span style={{ width:7, height:7, borderRadius:'50%', background:'#16a34a', display:'inline-block' }} />
          LIVE
        </span>
        <div style={{ flex:1, overflow:'hidden' }}>
          <div className="ticker-track">
            {[...externalIndicators, ...externalIndicators].map((ind, i) => (
              <span key={i} style={{ display:'inline-flex', alignItems:'center', gap:7, flexShrink:0, fontSize:12 }}>
                <span style={{ fontWeight:600, color:'#94a3b8' }}>{ind.label}</span>
                <span style={{ fontWeight:700, color:'#0f172a' }}>{ind.value}</span>
                <span style={{ fontWeight:700, color: ind.direction === 'down' ? '#dc2626' : '#16a34a' }}>
                  {ind.direction === 'down' ? '\u25bc' : '\u25b2'} {ind.change}
                </span>
                <span style={{ color:'#e2e8f0', margin:'0 4px' }}>|</span>
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Row 1: Decision Recommendations | Internal & External Signals */}
      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:16 }}>

        {/* Decision Recommendations */}
        <div style={{ background:'#ffffff', border:'1px solid #e2e8f0', borderRadius:12,
          padding:'16px 18px', boxShadow:'0 1px 3px rgba(0,0,0,0.05)' }}>
          <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between',
            paddingBottom:10, marginBottom:12, borderBottom:'1px solid #f1f5f9' }}>
            <span style={{ fontSize:13, fontWeight:700, color:'#0f172a' }}>Decision Recommendations</span>
            <span style={{ fontSize:11, fontWeight:600, background:'#fef9c3', color:'#ca8a04',
              border:'1px solid #fde68a', padding:'2px 8px', borderRadius:99 }}>
              {topDecisions.length} open
            </span>
          </div>
          <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
            {topDecisions.map((d) => {
              const cs = CONF_STYLE[d.confidence] || CONF_STYLE['Medium'];
              return (
                <div key={d.id}
                  onClick={() => navigate(`/app/decisions/${d.id}`)}
                  style={{ cursor:'pointer', padding:14, borderRadius:10,
                    border:'1px solid #e2e8f0', background:'#fafbfc' }}>
                  <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:6, flexWrap:'wrap' }}>
                    <span style={{ fontSize:10, fontWeight:700, color:'#94a3b8' }}>{d.ref}</span>
                    <CatChip cat={d.category} />
                    <span style={{ marginLeft:'auto', fontSize:11, fontWeight:700,
                      background:cs.bg, color:cs.color, border:`1px solid ${cs.border}`,
                      padding:'2px 8px', borderRadius:99 }}>
                      {d.confidence} &middot; {d.confidence_pct}%
                    </span>
                  </div>
                  <div style={{ fontSize:12, fontWeight:700, color:'#0f172a', lineHeight:1.4, marginBottom:4 }}>
                    {d.title}
                  </div>
                  <div style={{ fontSize:11, color:'#64748b', lineHeight:1.5 }}>{d.why_now}</div>
                  <div style={{ marginTop:6, fontSize:11, color:'#64748b' }}>
                    Value at stake:&nbsp;
                    <span style={{ fontWeight:700, color:'#0f172a' }}>{d.value_at_stake}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Internal & External Signals */}
        <div style={{ background:'#ffffff', border:'1px solid #e2e8f0', borderRadius:12,
          padding:'16px 18px', boxShadow:'0 1px 3px rgba(0,0,0,0.05)' }}>
          <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between',
            paddingBottom:10, marginBottom:12, borderBottom:'1px solid #f1f5f9' }}>
            <span style={{ fontSize:13, fontWeight:700, color:'#0f172a' }}>Internal &amp; External Signals</span>
            <span style={{ fontSize:10, fontWeight:700, background:'#f1f5f9', color:'#64748b',
              border:'1px solid #e2e8f0', padding:'2px 8px', borderRadius:99 }}>
              {isAdmin ? 'Admin enabled' : 'Admin access only'}
            </span>
          </div>
          <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
            {topSignals.map(s => {
              const sv = SEV[s.severity] || SEV.medium;
              return (
                <div key={s.id}
                  onClick={() => isAdmin && navigate('/app/signals')}
                  style={{ padding:12, borderRadius:10,
                    borderLeft:`3px solid ${sv.dot}`,
                    border:`1px solid ${sv.border}`, background:sv.bg, cursor: isAdmin ? 'pointer' : 'default' }}>
                  <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:5, flexWrap:'wrap' }}>
                    <div style={{ width:7, height:7, borderRadius:'50%', background:sv.dot, flexShrink:0 }} />
                    <CatChip cat={s.category} />
                    <span style={{ marginLeft:'auto', fontSize:10, fontWeight:700,
                      background:'#ffffff', color:sv.color, border:`1px solid ${sv.border}`,
                      padding:'2px 7px', borderRadius:99 }}>{sv.label}</span>
                  </div>
                  <div style={{ fontSize:12, fontWeight:700, color:'#0f172a', marginBottom:3 }}>{s.title}</div>
                  <div style={{ fontSize:11, color:'#475569', lineHeight:1.5 }}>{s.summary}</div>
                  <div style={{ marginTop:4, fontSize:10, color:'#94a3b8' }}>
                    {s.source} &middot; {s.date}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Row 2: Impact Indicators | Downside Risks */}
      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:16 }}>

        {/* Impact Indicators */}
        <div style={{ background:'#ffffff', border:'1px solid #e2e8f0', borderRadius:12,
          padding:'16px 18px', boxShadow:'0 1px 3px rgba(0,0,0,0.05)' }}>
          <div style={{ fontSize:13, fontWeight:700, color:'#0f172a',
            paddingBottom:10, marginBottom:12, borderBottom:'1px solid #f1f5f9' }}>
            Impact Indicators
          </div>
          <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
            {impactIndicators.map(ind => (
              <div key={ind.id} style={{ display:'flex', alignItems:'center', gap:12,
                padding:'10px 14px', borderRadius:10, border:'1px solid #e2e8f0', background:'#fafbfc' }}>
                <div style={{ flex:1 }}>
                  <div style={{ fontSize:12, fontWeight:700, color:'#0f172a', marginBottom:2 }}>{ind.label}</div>
                  <div style={{ display:'flex', gap:8, alignItems:'center' }}>
                    <span style={{ fontSize:22, fontWeight:900, color: ind.color || '#0f172a' }}>{ind.value}</span>
                    {ind.target && <span style={{ fontSize:11, color:'#94a3b8' }}>Target: {ind.target}</span>}
                    {ind.change && !ind.target && (
                      <span style={{ fontSize:11, fontWeight:700,
                        color: ind.direction === 'up' ? '#16a34a' : '#dc2626' }}>{ind.change}</span>
                    )}
                  </div>
                  {ind.note && <div style={{ fontSize:11, color:'#64748b', marginTop:3 }}>{ind.note}</div>}
                </div>
                <div style={{ fontSize:20, color: ind.direction === 'up' ? '#16a34a' : '#dc2626' }}>
                  {ind.direction === 'up' ? '\u25b2' : '\u25bc'}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Downside Risks */}
        <div style={{ background:'#ffffff', border:'1px solid #e2e8f0', borderRadius:12,
          padding:'16px 18px', boxShadow:'0 1px 3px rgba(0,0,0,0.05)' }}>
          <div style={{ fontSize:13, fontWeight:700, color:'#0f172a',
            paddingBottom:10, marginBottom:12, borderBottom:'1px solid #f1f5f9' }}>
            Downside Risks
          </div>
          <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
            {downsideRisks.map(r => {
              const sv = SEV[r.severity] || SEV.medium;
              return (
                <div key={r.id} style={{ padding:'12px 14px', borderRadius:10,
                  background:sv.bg, border:`1px solid ${sv.border}` }}>
                  <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:4 }}>
                    <div style={{ width:8, height:8, borderRadius:'50%', background:sv.dot, flexShrink:0 }} />
                    <span style={{ fontSize:12, fontWeight:700, color:'#0f172a', flex:1 }}>{r.label}</span>
                    <span style={{ fontSize:10, fontWeight:700, color:sv.color,
                      background:'#ffffff', border:`1px solid ${sv.border}`,
                      padding:'1px 7px', borderRadius:99 }}>{sv.label}</span>
                  </div>
                  <div style={{ fontSize:11, color:'#475569', lineHeight:1.5, paddingLeft:16 }}>{r.detail}</div>
                  <div style={{ fontSize:10, color:'#94a3b8', paddingLeft:16, marginTop:3 }}>
                    Related: {r.related_decision}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Row 3: KPI Metrics 3x2 grid */}
      <div>
        <div style={{ fontSize:13, fontWeight:700, color:'#0f172a', marginBottom:12 }}>
          Key Performance Indicators
        </div>
        <div style={{ display:'grid', gridTemplateColumns:'repeat(3, 1fr)', gap:12 }}>
          {slice.kpis.slice(0, 6).map((k, idx) => {
            const m = {
              id: k.id,
              label: k.label,
              value: k.value,
              sub: k.sublabel,
              trend: k.trend,
              color: KPI_COLORS[idx] || '#2563eb',
              pts: k.pts || k.sparkline || [18, 22, 20, 24, 26, 27, 28, 30, 31, 32],
            };
            const isActive = m.id === activeId;
            return (
              <div key={m.id}
                onClick={() => setActiveId(m.id)}
                style={{
                  cursor:'pointer', borderRadius:12, padding:'16px 18px',
                  background: isActive ? '#eff6ff' : '#ffffff',
                  border: `${isActive ? 2 : 1}px solid ${isActive ? '#2563eb' : '#e2e8f0'}`,
                  boxShadow: isActive ? '0 0 0 3px rgba(37,99,235,.12)' : '0 1px 3px rgba(0,0,0,0.05)',
                  transition:'all .15s',
                }}>
                <div style={{ display:'flex', alignItems:'flex-start', justifyContent:'space-between', marginBottom:8 }}>
                  <span style={{ fontSize:11, fontWeight:700,
                    color: isActive ? '#2563eb' : '#64748b',
                    lineHeight:1.3, maxWidth:'70%' }}>
                    {m.label}
                    {isActive && <span style={{ marginLeft:4 }}>\u2605</span>}
                  </span>
                  <span style={{ fontSize:10, fontWeight:700, flexShrink:0,
                    background: m.trend === 'up' ? '#f0fdf4' : '#fef2f2',
                    color: m.trend === 'up' ? '#16a34a' : '#dc2626',
                    border: `1px solid ${m.trend === 'up' ? '#bbf7d0' : '#fecaca'}`,
                    padding:'2px 7px', borderRadius:99 }}>
                    {m.trend === 'up' ? '\u25b2 Up' : '\u25bc Down'}
                  </span>
                </div>
                <div style={{ fontSize:26, fontWeight:900, color: isActive ? m.color : '#0f172a', marginBottom:2 }}>
                  {m.value}
                </div>
                <div style={{ fontSize:11, color:'#64748b', marginBottom:8 }}>{m.sub}</div>
                <Spark pts={m.pts} color={m.color} active={isActive} />
              </div>
            );
          })}
        </div>
      </div>

    </div>
  );
}
