// InsightsHub — KPI-selection drives ALL recommendations, signals and insights
import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useFilters } from '../contexts/FilterContext';
import { useDecisionState } from '../contexts/DecisionStateContext';
import { useAuth } from '../contexts/AuthContext';
import { getDashboardSlice, getKpiInsights } from '../data/siboniSelectors';

const KPI_COLORS = ['#2563eb', '#7c3aed', '#0891b2', '#059669', '#d97706', '#dc2626'];

const CONF_STYLE = {
  High:        { bg:'#f0fdf4', color:'#16a34a', border:'#bbf7d0' },
  'Medium-High':{ bg:'#eff6ff', color:'#2563eb', border:'#bfdbfe' },
  Medium:      { bg:'#fef9c3', color:'#ca8a04', border:'#fde68a' },
  Low:         { bg:'#fef2f2', color:'#dc2626', border:'#fecaca' },
};

const SEV = {
  high:   { bg:'#fef2f2', color:'#991b1b', border:'#fecaca', dot:'#dc2626', label:'High'   },
  medium: { bg:'#fef9c3', color:'#92400e', border:'#fde68a', dot:'#d97706', label:'Medium' },
  low:    { bg:'#f0fdf4', color:'#166534', border:'#bbf7d0', dot:'#16a34a', label:'Low'    },
};

const CAT_C = {
  Commercial:               { bg:'#eff6ff', color:'#2563eb' },
  'Supply Chain':           { bg:'#fff7ed', color:'#c2410c' },
  Quality:                  { bg:'#fef9c3', color:'#92400e' },
  Growth:                   { bg:'#f5f3ff', color:'#6d28d9' },
  'Market & Business':      { bg:'#ecfdf5', color:'#065f46' },
  'Risk & Reputation':      { bg:'#fef2f2', color:'#991b1b' },
  'Regulatory & Policy':    { bg:'#f0f9ff', color:'#0369a1' },
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

function KpiChip({ k, color, isActive, onClick }) {
  return (
    <button onClick={onClick} style={{
      flexShrink:0, display:'flex', alignItems:'center', gap:10,
      padding:'8px 14px', borderRadius:10,
      background: isActive ? `${color}12` : '#ffffff',
      border:`${isActive ? 2 : 1}px solid ${isActive ? color : '#e2e8f0'}`,
      cursor:'pointer', transition:'all .12s',
      boxShadow: isActive ? `0 0 0 3px ${color}18` : '0 1px 3px rgba(0,0,0,0.04)',
      minWidth:140,
    }}>
      <div style={{ textAlign:'left' }}>
        <div style={{ fontSize:10, fontWeight:700, color: isActive ? color : '#94a3b8', marginBottom:2, whiteSpace:'nowrap' }}>
          {k.shortLabel || k.label}
        </div>
        <div style={{ fontSize:16, fontWeight:900, color: isActive ? color : '#0f172a' }}>{k.value}</div>
      </div>
      <span style={{
        fontSize:10, fontWeight:700, flexShrink:0,
        background: k.trend === 'up' ? '#f0fdf4' : '#fef2f2',
        color: k.trend === 'up' ? '#16a34a' : '#dc2626',
        border:`1px solid ${k.trend === 'up' ? '#bbf7d0' : '#fecaca'}`,
        padding:'2px 7px', borderRadius:99,
      }}>
        {k.trend === 'up' ? '▲' : '▼'} {k.delta}
      </span>
    </button>
  );
}

export default function InsightsHub() {
  const navigate = useNavigate();
  const { filters } = useFilters();
  const { decisionState } = useDecisionState();
  const { user } = useAuth();
  const [activeId, setActiveId] = useState('KPI-001');

  const slice = useMemo(() => getDashboardSlice(filters, decisionState), [filters, decisionState]);
  const kpiInsight = useMemo(() => getKpiInsights(filters, activeId), [filters, activeId]);

  const { decisions, signals, externalIndicators, impactIndicators, downsideRisks } = slice;
  const kpis = slice.kpis.slice(0, 6);
  const isAdmin = user?.role === 'analyst';

  // Filter decisions + signals to those most relevant to the selected KPI
  const focusedDecisions = useMemo(() => {
    if (!kpiInsight) return decisions.slice(0, 3);
    const rel = decisions.filter(d => kpiInsight.relevantDecisionIds.some(rid => d.id === rid || d.id.startsWith(rid + '-')));
    const rest = decisions.filter(d => !kpiInsight.relevantDecisionIds.some(rid => d.id === rid || d.id.startsWith(rid + '-')));
    return [...rel, ...rest].slice(0, 3);
  }, [decisions, kpiInsight]);

  const focusedSignals = useMemo(() => {
    if (!kpiInsight) return signals.slice(0, 4);
    const rel  = signals.filter(s => kpiInsight.relevantSignalCategories.includes(s.category));
    const rest = signals.filter(s => !kpiInsight.relevantSignalCategories.includes(s.category));
    return [...rel, ...rest].slice(0, 4);
  }, [signals, kpiInsight]);

  return (
    <div style={{ background:'#f4f6f9', minHeight:'100%', padding:'20px 24px', display:'flex', flexDirection:'column', gap:16 }}>

      {/* ── LIVE ticker ─────────────────────────────────────────── */}
      <div style={{ display:'flex', alignItems:'center', gap:12, background:'#ffffff',
        border:'1px solid #e2e8f0', borderRadius:10,
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
                  {ind.direction === 'down' ? '▼' : '▲'} {ind.change}
                </span>
                <span style={{ color:'#e2e8f0', margin:'0 4px' }}>|</span>
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* ── KPI Selection Strip ──────────────────────────────────── */}
      <div style={{ background:'#ffffff', border:'1px solid #e2e8f0', borderRadius:12,
        padding:'12px 16px', boxShadow:'0 1px 3px rgba(0,0,0,0.05)' }}>
        <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:10 }}>
          <span style={{ fontSize:11, fontWeight:800, color:'#0f172a', textTransform:'uppercase', letterSpacing:1 }}>
            KPI Focus
          </span>
          <span style={{ fontSize:11, color:'#94a3b8' }}>
            — select a metric to drive recommendations &amp; signals below
          </span>
        </div>
        <div style={{ display:'flex', gap:10, overflowX:'auto', paddingBottom:4 }}>
          {kpis.map((k, idx) => (
            <KpiChip key={k.id} k={k} color={KPI_COLORS[idx] || '#2563eb'}
              isActive={activeId === k.id} onClick={() => setActiveId(k.id)} />
          ))}
        </div>
      </div>

      {/* ── KPI Insight Banner ───────────────────────────────────── */}
      {kpiInsight && (
        <div style={{
          background:`${kpiInsight.color}07`,
          border:`1px solid ${kpiInsight.color}30`,
          borderLeft:`4px solid ${kpiInsight.color}`,
          borderRadius:10, padding:'14px 18px',
        }}>
          <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:10, flexWrap:'wrap' }}>
            <span style={{ fontSize:11, fontWeight:800, background:kpiInsight.color, color:'#fff',
              padding:'3px 12px', borderRadius:99, flexShrink:0 }}>
              {kpiInsight.label}
            </span>
            <span style={{ fontSize:11, fontWeight:600, color:'#64748b' }}>
              AI insight — {filters.site} · {filters.productLine} · {filters.segment} · {filters.timeRange}
            </span>
          </div>
          <div style={{ fontSize:12, color:'#334155', lineHeight:1.65, marginBottom:10 }}>
            <span style={{ fontWeight:700, color:'#475569' }}>Analysis: </span>
            {kpiInsight.insightSummary}
          </div>
          <div style={{ background:'#ffffff', border:`1px solid ${kpiInsight.color}25`,
            borderRadius:8, padding:'10px 14px' }}>
            <span style={{ fontSize:11, fontWeight:800, color:kpiInsight.color }}>⚡ Recommendation: </span>
            <span style={{ fontSize:12, color:'#0f172a', lineHeight:1.65 }}>{kpiInsight.recommendation}</span>
          </div>
        </div>
      )}

      {/* ── Row 1: Decision Recommendations | Signals ───────────── */}
      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:16 }}>

        {/* Decision Recommendations */}
        <div style={{ background:'#ffffff', border:'1px solid #e2e8f0', borderRadius:12,
          padding:'16px 18px', boxShadow:'0 1px 3px rgba(0,0,0,0.05)' }}>
          <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between',
            paddingBottom:10, marginBottom:12, borderBottom:'1px solid #f1f5f9', flexWrap:'wrap', gap:6 }}>
            <div style={{ display:'flex', alignItems:'center', gap:8 }}>
              <span style={{ fontSize:13, fontWeight:700, color:'#0f172a' }}>Decision Recommendations</span>
              {kpiInsight && (
                <span style={{ fontSize:10, fontWeight:700, color:kpiInsight.color,
                  background:`${kpiInsight.color}12`, border:`1px solid ${kpiInsight.color}30`,
                  padding:'2px 8px', borderRadius:99 }}>
                  {kpiInsight.label} focus
                </span>
              )}
            </div>
            <span style={{ fontSize:11, fontWeight:600, background:'#fef9c3', color:'#ca8a04',
              border:'1px solid #fde68a', padding:'2px 8px', borderRadius:99 }}>
              {focusedDecisions.length} open
            </span>
          </div>
          <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
            {focusedDecisions.map(d => {
              const cs = CONF_STYLE[d.confidence] || CONF_STYLE.Medium;
              const isRel = kpiInsight?.relevantDecisionIds.some(rid => d.id === rid || d.id.startsWith(rid + '-'));
              return (
                <div key={d.id} onClick={() => navigate(`/app/decisions/${d.id}`)}
                  style={{ cursor:'pointer', padding:14, borderRadius:10,
                    border: isRel ? `1.5px solid ${kpiInsight?.color || '#e2e8f0'}40` : '1px solid #e2e8f0',
                    background: isRel ? `${kpiInsight?.color || '#ffffff'}05` : '#fafbfc' }}>
                  <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:6, flexWrap:'wrap' }}>
                    <span style={{ fontSize:10, fontWeight:700, color:'#94a3b8' }}>{d.ref}</span>
                    <CatChip cat={d.category} />
                    {isRel && kpiInsight && (
                      <span style={{ fontSize:9, fontWeight:800, color:kpiInsight.color,
                        background:`${kpiInsight.color}12`, padding:'1px 6px', borderRadius:99 }}>
                        {kpiInsight.label}
                      </span>
                    )}
                    <span style={{ marginLeft:'auto', fontSize:11, fontWeight:700,
                      background:cs.bg, color:cs.color, border:`1px solid ${cs.border}`,
                      padding:'2px 8px', borderRadius:99 }}>
                      {d.confidence} · {d.confidence_pct}%
                    </span>
                  </div>
                  <div style={{ fontSize:12, fontWeight:700, color:'#0f172a', lineHeight:1.4, marginBottom:4 }}>
                    {d.title}
                  </div>
                  <div style={{ fontSize:11, color:'#64748b', lineHeight:1.5 }}>{d.why_now}</div>
                  <div style={{ marginTop:6, fontSize:11, color:'#64748b' }}>
                    Value at stake: <span style={{ fontWeight:700, color:'#0f172a' }}>{d.value_at_stake}</span>
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
            paddingBottom:10, marginBottom:12, borderBottom:'1px solid #f1f5f9', flexWrap:'wrap', gap:6 }}>
            <div style={{ display:'flex', alignItems:'center', gap:8 }}>
              <span style={{ fontSize:13, fontWeight:700, color:'#0f172a' }}>Internal &amp; External Signals</span>
              {kpiInsight && (
                <span style={{ fontSize:10, fontWeight:700, color:kpiInsight.color,
                  background:`${kpiInsight.color}12`, border:`1px solid ${kpiInsight.color}30`,
                  padding:'2px 8px', borderRadius:99 }}>
                  {kpiInsight.label} focus
                </span>
              )}
            </div>
            <span style={{ fontSize:10, fontWeight:700, background:'#f1f5f9', color:'#64748b',
              border:'1px solid #e2e8f0', padding:'2px 8px', borderRadius:99 }}>
              {isAdmin ? 'Admin enabled' : 'Admin access only'}
            </span>
          </div>
          <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
            {focusedSignals.map(s => {
              const sv = SEV[s.severity] || SEV.medium;
              const isRel = kpiInsight?.relevantSignalCategories.includes(s.category);
              return (
                <div key={s.id} onClick={() => isAdmin && navigate('/app/signals')}
                  style={{ padding:12, borderRadius:10,
                    borderLeft:`3px solid ${isRel && kpiInsight ? kpiInsight.color : sv.dot}`,
                    border:`1px solid ${sv.border}`, background:sv.bg,
                    cursor: isAdmin ? 'pointer' : 'default' }}>
                  <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:5, flexWrap:'wrap' }}>
                    <div style={{ width:7, height:7, borderRadius:'50%', background:sv.dot, flexShrink:0 }} />
                    <CatChip cat={s.category} />
                    {isRel && kpiInsight && (
                      <span style={{ fontSize:9, fontWeight:800, color:kpiInsight.color,
                        background:`${kpiInsight.color}12`, padding:'1px 6px', borderRadius:99 }}>
                        {kpiInsight.label}
                      </span>
                    )}
                    <span style={{ marginLeft:'auto', fontSize:10, fontWeight:700,
                      background:'#ffffff', color:sv.color, border:`1px solid ${sv.border}`,
                      padding:'2px 7px', borderRadius:99 }}>{sv.label}</span>
                  </div>
                  <div style={{ fontSize:12, fontWeight:700, color:'#0f172a', marginBottom:3 }}>{s.title}</div>
                  <div style={{ fontSize:11, color:'#475569', lineHeight:1.5 }}>{s.summary}</div>
                  <div style={{ marginTop:4, fontSize:10, color:'#94a3b8' }}>{s.source} · {s.date}</div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* ── Row 2: Impact Indicators | Downside Risks ───────────── */}
      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:16 }}>

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
                  {ind.direction === 'up' ? '▲' : '▼'}
                </div>
              </div>
            ))}
          </div>
        </div>

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

      {/* ── Row 3: KPI Detail Grid ───────────────────────────────── */}
      <div>
        <div style={{ fontSize:13, fontWeight:700, color:'#0f172a', marginBottom:3 }}>
          Key Performance Indicators
        </div>
        <div style={{ fontSize:11, color:'#94a3b8', marginBottom:12 }}>
          Click any metric to update the recommendations and signals above
        </div>
        <div style={{ display:'grid', gridTemplateColumns:'repeat(3, 1fr)', gap:12 }}>
          {kpis.map((k, idx) => {
            const color = KPI_COLORS[idx] || '#2563eb';
            const pts   = k.pts || k.sparkline || [18, 22, 20, 24, 26, 27, 28, 30, 31, 32];
            const isActive = k.id === activeId;
            return (
              <div key={k.id} onClick={() => setActiveId(k.id)}
                style={{
                  cursor:'pointer', borderRadius:12, padding:'16px 18px',
                  background: isActive ? `${color}0d` : '#ffffff',
                  border:`${isActive ? 2 : 1}px solid ${isActive ? color : '#e2e8f0'}`,
                  boxShadow: isActive ? `0 0 0 3px ${color}18` : '0 1px 3px rgba(0,0,0,0.05)',
                  transition:'all .15s',
                }}>
                <div style={{ display:'flex', alignItems:'flex-start', justifyContent:'space-between', marginBottom:8 }}>
                  <span style={{ fontSize:11, fontWeight:700,
                    color: isActive ? color : '#64748b', lineHeight:1.3, maxWidth:'70%' }}>
                    {k.label}{isActive && <span style={{ marginLeft:4 }}>★</span>}
                  </span>
                  <span style={{ fontSize:10, fontWeight:700, flexShrink:0,
                    background: k.trend === 'up' ? '#f0fdf4' : '#fef2f2',
                    color: k.trend === 'up' ? '#16a34a' : '#dc2626',
                    border:`1px solid ${k.trend === 'up' ? '#bbf7d0' : '#fecaca'}`,
                    padding:'2px 7px', borderRadius:99 }}>
                    {k.trend === 'up' ? '▲ Up' : '▼ Down'}
                  </span>
                </div>
                <div style={{ fontSize:26, fontWeight:900, color: isActive ? color : '#0f172a', marginBottom:2 }}>
                  {k.value}
                </div>
                <div style={{ fontSize:11, color:'#64748b', marginBottom:8 }}>{k.sublabel}</div>
                <Spark pts={pts} color={color} active={isActive} />
              </div>
            );
          })}
        </div>
      </div>

    </div>
  );
}
