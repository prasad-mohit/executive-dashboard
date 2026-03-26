// InsightsHub — KPI-driven intelligence hub with full drill-down
// Select any KPI → all panels update · click any card to drill-down
// Snap, Share, COMMIT, HOLD fully wired
import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useFilters } from '../contexts/FilterContext';
import { useDecisionState } from '../contexts/DecisionStateContext';
import { useAuth } from '../contexts/AuthContext';
import { getDashboardSlice, getKpiInsights } from '../data/siboniSelectors';

const KPI_COLORS = ['#2563eb','#7c3aed','#0891b2','#059669','#d97706','#dc2626'];

const CONF = {
  High:          { bg:'#f0fdf4', color:'#16a34a', border:'#bbf7d0' },
  'Medium-High': { bg:'#eff6ff', color:'#2563eb', border:'#bfdbfe' },
  Medium:        { bg:'#fef9c3', color:'#ca8a04', border:'#fde68a' },
  Low:           { bg:'#fef2f2', color:'#dc2626', border:'#fecaca' },
};

const SEV = {
  high:   { bg:'#fef2f2', color:'#991b1b', border:'#fecaca', dot:'#dc2626', label:'High',   emoji:'🔴' },
  medium: { bg:'#fef9c3', color:'#92400e', border:'#fde68a', dot:'#d97706', label:'Medium', emoji:'🟡' },
  low:    { bg:'#f0fdf4', color:'#166534', border:'#bbf7d0', dot:'#16a34a', label:'Low',    emoji:'🟢' },
};

const CATS = {
  Commercial:                 { bg:'#eff6ff', color:'#2563eb',  emoji:'💼', desc:'Revenue, deals, pricing & contracts' },
  'Supply Chain':             { bg:'#fff7ed', color:'#c2410c',  emoji:'🔗', desc:'Supplier risk, logistics & sourcing' },
  Quality:                    { bg:'#fef9c3', color:'#92400e',  emoji:'🔬', desc:'Scrap rates, defects & audit readiness' },
  Growth:                     { bg:'#f5f3ff', color:'#6d28d9',  emoji:'📈', desc:'New markets, services & retrofit pipeline' },
  'Market & Business':        { bg:'#ecfdf5', color:'#065f46',  emoji:'📊', desc:'Demand shifts, pricing & competitor moves' },
  'Risk & Reputation':        { bg:'#fef2f2', color:'#991b1b',  emoji:'⚠️', desc:'Ops risk, safety & legal exposure' },
  'Regulatory & Policy':      { bg:'#f0f9ff', color:'#0369a1',  emoji:'🏛️', desc:'Tariffs, compliance & standards changes' },
  'Benchmarking & Perception':{ bg:'#fdf4ff', color:'#7e22ce',  emoji:'🔍', desc:'Competitor intel & analyst views' },
};

// ── Category chip — clickable, tooltip shows category description ──
function CatChip({ cat, onClick, active }) {
  const c = CATS[cat] || { bg:'#f8fafc', color:'#475569', emoji:'•', desc:cat };
  return (
    <button onClick={onClick} title={c.desc} style={{
      display:'inline-flex', alignItems:'center', gap:4,
      background: active ? c.color : c.bg,
      color: active ? '#ffffff' : c.color,
      border:`1px solid ${active ? c.color : c.color + '40'}`,
      fontSize:10, fontWeight:700, padding:'3px 9px', borderRadius:99,
      cursor: onClick ? 'pointer' : 'default', transition:'all .1s',
    }}>
      <span>{c.emoji}</span><span>{cat}</span>
    </button>
  );
}

// ── Confidence badge ──────────────────────────────────────────────
function ConfChip({ confidence, pct }) {
  const c = CONF[confidence] || CONF.Medium;
  return (
    <span style={{ display:'inline-flex', alignItems:'center', gap:4,
      background:c.bg, color:c.color, border:`1px solid ${c.border}`,
      fontSize:11, fontWeight:700, padding:'2px 9px', borderRadius:99 }}>
      {confidence}{pct != null && ` · ${pct}%`}
    </span>
  );
}

// ── Sparkline SVG ─────────────────────────────────────────────────
function Spark({ pts, color, active }) {
  const H = 36, W = 76;
  const max = Math.max(...pts), min = Math.min(...pts);
  const range = max - min || 1;
  const ys = pts.map(v => H - 3 - ((v - min) / range) * (H - 6));
  const xs = pts.map((_, i) => (i / (pts.length - 1)) * W);
  const d  = xs.map((x, i) => `${i === 0 ? 'M' : 'L'}${x.toFixed(1)},${ys[i].toFixed(1)}`).join(' ');
  const a  = `${d} L${W},${H} L0,${H} Z`;
  return (
    <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} fill="none">
      <path d={a} fill={`${color}18`}/>
      <path d={d} stroke={color} strokeWidth={active ? 2.5 : 1.75} strokeLinecap="round" strokeLinejoin="round"/>
      <circle cx={xs[xs.length-1].toFixed(1)} cy={ys[ys.length-1].toFixed(1)} r="3" fill={color}/>
    </svg>
  );
}

// ── KPI selector card ─────────────────────────────────────────────
function KpiCard({ k, color, isActive, onClick }) {
  return (
    <button onClick={onClick} style={{
      flexShrink:0, display:'flex', flexDirection:'column', gap:3,
      padding:'11px 14px', borderRadius:12,
      background: isActive ? `${color}0e` : '#ffffff',
      border:`${isActive ? 2 : 1}px solid ${isActive ? color : '#e2e8f0'}`,
      cursor:'pointer', transition:'all .12s',
      boxShadow: isActive ? `0 0 0 3px ${color}18` : '0 1px 3px rgba(0,0,0,0.04)',
      minWidth:144, textAlign:'left',
    }}>
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', gap:6 }}>
        <span style={{ fontSize:10, fontWeight:700, color: isActive ? color : '#94a3b8', whiteSpace:'nowrap' }}>
          {k.shortLabel || k.label}
        </span>
        {isActive && (
          <span style={{ fontSize:9, fontWeight:800, color:color, background:`${color}15`,
            padding:'1px 6px', borderRadius:99 }}>ACTIVE</span>
        )}
      </div>
      <div style={{ fontSize:22, fontWeight:900, color: isActive ? color : '#0f172a', lineHeight:1.1 }}>
        {k.value}
      </div>
      <div style={{ display:'flex', alignItems:'center', gap:5, flexWrap:'wrap' }}>
        <span style={{ fontSize:10, fontWeight:700,
          background: k.trend === 'up' ? '#f0fdf4' : '#fef2f2',
          color: k.trend === 'up' ? '#16a34a' : '#dc2626',
          border:`1px solid ${k.trend === 'up' ? '#bbf7d0' : '#fecaca'}`,
          padding:'1px 6px', borderRadius:99 }}>
          {k.trend === 'up' ? '▲' : '▼'} {k.delta}
        </span>
        {k.sublabel && <span style={{ fontSize:9, color:'#94a3b8' }}>{k.sublabel}</span>}
      </div>
    </button>
  );
}

// ── Impact indicator card — health bar + expand ───────────────────
function ImpactIndicatorCard({ ind, accentColor }) {
  const [open, setOpen] = useState(false);
  const isOk = ind.direction === 'up';
  return (
    <div onClick={() => setOpen(v => !v)} style={{
      padding:'12px 14px', borderRadius:10,
      border:`1px solid ${open ? accentColor + '50' : '#e2e8f0'}`,
      background:'#fafbfc', cursor:'pointer', transition:'border .1s',
    }}>
      <div style={{ display:'flex', alignItems:'flex-start', justifyContent:'space-between', gap:8 }}>
        <div style={{ flex:1 }}>
          <div style={{ display:'flex', alignItems:'center', gap:6, marginBottom:4 }}>
            <span style={{ fontSize:11, fontWeight:700, color:'#334155' }}>{ind.label}</span>
            <span style={{ fontSize:14, color: isOk ? '#16a34a' : '#dc2626' }}>{isOk ? '▲' : '▼'}</span>
          </div>
          <div style={{ display:'flex', alignItems:'baseline', gap:8, flexWrap:'wrap' }}>
            <span style={{ fontSize:22, fontWeight:900, color: ind.color || accentColor }}>{ind.value}</span>
            {ind.target && (
              <span style={{ fontSize:11, color:'#94a3b8' }}>
                Target: <b style={{ color:'#475569' }}>{ind.target}</b>
              </span>
            )}
          </div>
          <div style={{ marginTop:6, height:5, borderRadius:99, background:'#e2e8f0', overflow:'hidden' }}>
            <div style={{
              height:'100%', borderRadius:99,
              background: isOk ? 'linear-gradient(90deg,#86efac,#16a34a)' : 'linear-gradient(90deg,#fca5a5,#dc2626)',
              width: isOk ? '72%' : '32%', transition:'width .3s',
            }}/>
          </div>
        </div>
        <span style={{ fontSize:11, color:'#94a3b8', flexShrink:0, marginTop:2 }}>{open ? '▲' : '▼'}</span>
      </div>
      {open && ind.note && (
        <div style={{ marginTop:10, paddingTop:10, borderTop:'1px solid #f1f5f9',
          fontSize:11, color:'#475569', lineHeight:1.65, display:'flex', gap:8 }}>
          <span>📌</span><span>{ind.note}</span>
        </div>
      )}
      {open && !ind.note && (
        <div style={{ marginTop:10, paddingTop:10, borderTop:'1px solid #f1f5f9', fontSize:11, color:'#94a3b8' }}>
          Direction: {isOk ? 'Positive — on track or improving' : 'Negative — below target or declining'}
        </div>
      )}
    </div>
  );
}

// ── Decision card — full drill-down with evidence, actions, COMMIT ─
function DecisionCard({ d, isRelevant, accentColor, navigate, commitState, onCommit, onHold }) {
  const [open, setOpen] = useState(false);
  const committed = commitState === 'Committed';
  const held      = commitState === 'Hold';
  return (
    <div style={{
      borderRadius:12,
      border: isRelevant ? `1.5px solid ${accentColor}50` : '1px solid #e2e8f0',
      background: isRelevant ? `${accentColor}04` : '#fafbfc',
      overflow:'hidden', transition:'all .12s',
    }}>
      {/* Always-visible header */}
      <div onClick={() => setOpen(v => !v)} style={{ padding:'13px 15px', cursor:'pointer' }}>
        <div style={{ display:'flex', alignItems:'center', gap:7, marginBottom:7, flexWrap:'wrap' }}>
          <span style={{ fontSize:10, fontWeight:800, color:'#94a3b8', letterSpacing:0.5 }}>{d.ref}</span>
          <CatChip cat={d.category}/>
          {isRelevant && (
            <span style={{ fontSize:9, fontWeight:800, color:accentColor,
              background:`${accentColor}15`, border:`1px solid ${accentColor}30`,
              padding:'1px 6px', borderRadius:99 }}>★ KPI match</span>
          )}
          {committed && (
            <span style={{ fontSize:9, fontWeight:800, color:'#16a34a',
              background:'#f0fdf4', border:'1px solid #bbf7d0', padding:'1px 6px', borderRadius:99 }}>
              ✓ Committed
            </span>
          )}
          {held && (
            <span style={{ fontSize:9, fontWeight:800, color:'#ca8a04',
              background:'#fef9c3', border:'1px solid #fde68a', padding:'1px 6px', borderRadius:99 }}>
              ⏸ On Hold
            </span>
          )}
          <div style={{ marginLeft:'auto', display:'flex', alignItems:'center', gap:5 }}>
            <ConfChip confidence={d.confidence} pct={d.confidence_pct}/>
            <span style={{ fontSize:11, color:'#94a3b8' }}>{open ? '▲' : '▼'}</span>
          </div>
        </div>
        <div style={{ fontSize:13, fontWeight:700, color:'#0f172a', lineHeight:1.4, marginBottom:5 }}>
          {d.title}
        </div>
        <div style={{ fontSize:11, color:'#64748b', lineHeight:1.55 }}>
          <b>Why now:</b> {(d.why_now || '').substring(0, 130)}{(d.why_now || '').length > 130 ? '…' : ''}
        </div>
        <div style={{ marginTop:7, display:'flex', justifyContent:'space-between', alignItems:'center', flexWrap:'wrap', gap:4 }}>
          <span style={{ fontSize:11, color:'#64748b' }}>
            Value at stake: <span style={{ fontWeight:700, color:'#dc2626' }}>{d.value_at_stake}</span>
          </span>
          <span style={{ fontSize:11, fontWeight:700, color:accentColor }}>
            {open ? 'Collapse ▲' : 'Expand for full context ▼'}
          </span>
        </div>
      </div>

      {/* Drill-down panel */}
      {open && (
        <div style={{ borderTop:'1px solid #f1f5f9', background:'#ffffff', padding:'14px 15px',
          display:'flex', flexDirection:'column', gap:12 }}>

          {/* Impact range */}
          {d.impact_range && (
            <div>
              <div style={{ fontSize:10, fontWeight:700, color:'#94a3b8', textTransform:'uppercase',
                letterSpacing:1, marginBottom:8 }}>Impact Range</div>
              <div style={{ display:'flex', gap:0, borderRadius:8, overflow:'hidden', height:30 }}>
                <div style={{ flex:1, background:'#f1f5f9', display:'flex', alignItems:'center',
                  justifyContent:'center', fontSize:10, fontWeight:600, color:'#64748b' }}>
                  Low ${d.impact_range.low}M
                </div>
                <div style={{ flex:1.4, background:'#dbeafe', display:'flex', alignItems:'center',
                  justifyContent:'center', fontSize:12, fontWeight:800, color:'#1d4ed8' }}>
                  Likely ${d.impact_range.likely}M
                </div>
                <div style={{ flex:1, background:'#bfdbfe', display:'flex', alignItems:'center',
                  justifyContent:'center', fontSize:10, fontWeight:700, color:'#1e40af' }}>
                  High ${d.impact_range.high}M
                </div>
              </div>
              {d.impact_range.label && (
                <div style={{ fontSize:10, color:'#94a3b8', marginTop:3 }}>{d.impact_range.label}</div>
              )}
            </div>
          )}

          {/* Evidence sources */}
          {d.evidence_details?.length > 0 && (
            <div>
              <div style={{ fontSize:10, fontWeight:700, color:'#94a3b8', textTransform:'uppercase',
                letterSpacing:1, marginBottom:8 }}>Evidence ({d.evidence_details.length} sources)</div>
              {d.evidence_details.slice(0, 3).map((ev, i) => (
                <div key={i} style={{ display:'flex', alignItems:'flex-start', gap:8, padding:'7px 0',
                  borderBottom: i < Math.min(2, d.evidence_details.length - 1) ? '1px solid #f8fafc' : 'none' }}>
                  <span style={{ fontSize:10, fontWeight:700, color:'#2563eb', background:'#eff6ff',
                    border:'1px solid #bfdbfe', padding:'1px 7px', borderRadius:99, flexShrink:0 }}>
                    {ev.source}
                  </span>
                  <span style={{ fontSize:10, color:'#94a3b8', flexShrink:0 }}>{ev.date}</span>
                  <span style={{ fontSize:11, color:'#334155', lineHeight:1.5 }}>{ev.note}</span>
                </div>
              ))}
            </div>
          )}

          {/* Suggested actions */}
          {d.suggested_actions?.length > 0 && (
            <div>
              <div style={{ fontSize:10, fontWeight:700, color:'#94a3b8', textTransform:'uppercase',
                letterSpacing:1, marginBottom:8 }}>Suggested Actions</div>
              {d.suggested_actions.slice(0, 2).map((act, i) => (
                <div key={act.id || i} style={{ display:'flex', alignItems:'flex-start', gap:8,
                  padding:'7px 0', borderBottom: i < 1 ? '1px solid #f8fafc' : 'none' }}>
                  <span style={{ width:20, height:20, borderRadius:'50%', background:'#f1f5f9',
                    display:'flex', alignItems:'center', justifyContent:'center',
                    fontSize:10, fontWeight:700, color:'#475569', flexShrink:0 }}>
                    {i + 1}
                  </span>
                  <div style={{ flex:1 }}>
                    <div style={{ fontSize:11, fontWeight:600, color:'#0f172a', lineHeight:1.45 }}>{act.title}</div>
                    <div style={{ fontSize:10, color:'#94a3b8', marginTop:2 }}>
                      Owner: {act.owner} · Due: {act.due}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Risks of not acting */}
          {d.risks_of_not_acting?.length > 0 && (
            <div style={{ background:'#fef2f2', border:'1px solid #fecaca', borderRadius:8, padding:'10px 12px' }}>
              <div style={{ fontSize:10, fontWeight:700, color:'#dc2626', marginBottom:6 }}>
                ⚠ Risks of Not Acting
              </div>
              {d.risks_of_not_acting.slice(0, 2).map((r, i) => (
                <div key={i} style={{ fontSize:11, color:'#991b1b', lineHeight:1.55,
                  paddingBottom: i < 1 ? 4 : 0, marginBottom: i < 1 ? 4 : 0,
                  borderBottom: i < 1 ? '1px solid #fecaca' : 'none' }}>
                  {typeof r === 'string' ? `• ${r}` : `• ${r.label || r}`}
                </div>
              ))}
            </div>
          )}

          {/* Action buttons */}
          <div style={{ display:'flex', gap:8, flexWrap:'wrap', paddingTop:4 }}>
            {!committed && !held && (
              <>
                <button onClick={() => onCommit(d.id)}
                  style={{ flex:1, minWidth:90, fontSize:12, fontWeight:700, padding:'9px 0',
                    borderRadius:9, background:'#16a34a', color:'#ffffff', border:'none', cursor:'pointer' }}>
                  ✓ COMMIT
                </button>
                <button onClick={() => onHold(d.id)}
                  style={{ flex:1, minWidth:80, fontSize:12, fontWeight:600, padding:'9px 0',
                    borderRadius:9, background:'#fef9c3', color:'#92400e', border:'1px solid #fde68a', cursor:'pointer' }}>
                  ⏸ HOLD
                </button>
              </>
            )}
            {committed && (
              <div style={{ flex:1, fontSize:12, fontWeight:700, padding:'9px 14px', borderRadius:9,
                background:'#f0fdf4', color:'#15803d', border:'1px solid #bbf7d0', textAlign:'center' }}>
                ✓ Committed — tracking in Execution Hub
              </div>
            )}
            {held && (
              <div style={{ flex:1, fontSize:12, fontWeight:700, padding:'9px 14px', borderRadius:9,
                background:'#fef9c3', color:'#92400e', border:'1px solid #fde68a', textAlign:'center' }}>
                ⏸ On Hold
              </div>
            )}
            <button onClick={() => navigate(`/app/decisions/${d.id}`)}
              style={{ fontSize:12, fontWeight:700, padding:'9px 16px', borderRadius:9,
                background:'#eff6ff', color:'#2563eb', border:'1px solid #bfdbfe', cursor:'pointer' }}>
              Open in Decision Hub →
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Signal card — full drill-down with confidence, tags, evidence ─
function SignalCard({ s, isRelevant, accentColor, isAdmin, navigate }) {
  const [open, setOpen] = useState(false);
  const [verified, setVerified] = useState(false);
  const sv = SEV[s.severity] || SEV.medium;
  return (
    <div style={{
      borderRadius:10, overflow:'hidden',
      border:`1px solid ${sv.border}`,
      borderLeft:`3px solid ${isRelevant ? accentColor : sv.dot}`,
      background: sv.bg,
    }}>
      <div onClick={() => setOpen(v => !v)} style={{ padding:'11px 13px', cursor:'pointer' }}>
        <div style={{ display:'flex', alignItems:'center', gap:7, marginBottom:6, flexWrap:'wrap' }}>
          <span style={{ fontSize:16 }}>{s.icon || sv.emoji}</span>
          <CatChip cat={s.category}/>
          {isRelevant && (
            <span style={{ fontSize:9, fontWeight:800, color:accentColor,
              background:`${accentColor}15`, border:`1px solid ${accentColor}30`,
              padding:'1px 6px', borderRadius:99 }}>★ KPI match</span>
          )}
          {s.needs_verification && !verified && (
            <span style={{ fontSize:9, fontWeight:700, color:'#d97706',
              background:'#fef9c3', border:'1px solid #fde68a', padding:'1px 6px', borderRadius:99 }}>
              ! Needs Verification
            </span>
          )}
          {verified && (
            <span style={{ fontSize:9, fontWeight:700, color:'#16a34a',
              background:'#f0fdf4', border:'1px solid #bbf7d0', padding:'1px 6px', borderRadius:99 }}>
              ✓ Verified
            </span>
          )}
          <div style={{ marginLeft:'auto', display:'flex', alignItems:'center', gap:5 }}>
            <span style={{ fontSize:10, fontWeight:700, color:sv.color, background:'#ffffff',
              border:`1px solid ${sv.border}`, padding:'1px 7px', borderRadius:99 }}>
              {sv.label}
            </span>
            <span style={{ fontSize:11, color:'#94a3b8' }}>{open ? '▲' : '▼'}</span>
          </div>
        </div>
        <div style={{ fontSize:12, fontWeight:700, color:'#0f172a', marginBottom:3, lineHeight:1.4 }}>{s.title}</div>
        <div style={{ fontSize:11, color:'#475569', lineHeight:1.55 }}>
          {(s.summary || '').substring(0, 100)}{(s.summary || '').length > 100 ? '…' : ''}
        </div>
        <div style={{ marginTop:5, fontSize:10, color:'#94a3b8', display:'flex', gap:8, flexWrap:'wrap' }}>
          <span>{s.source}</span>
          <span>·</span>
          <span>{s.date}</span>
          {s.confidence != null && <><span>·</span><span>Confidence: {s.confidence}%</span></>}
          <span style={{ marginLeft:'auto', fontWeight:700, color:accentColor }}>
            {open ? 'Collapse ▲' : 'Drill down ▼'}
          </span>
        </div>
      </div>

      {open && (
        <div style={{ borderTop:`1px solid ${sv.border}`, background:'#ffffff',
          padding:'12px 13px', display:'flex', flexDirection:'column', gap:10 }}>
          {/* Full summary */}
          <div style={{ fontSize:12, color:'#334155', lineHeight:1.7 }}>{s.summary}</div>

          {/* Confidence bar */}
          {s.confidence != null && (
            <div>
              <div style={{ display:'flex', justifyContent:'space-between', marginBottom:4 }}>
                <span style={{ fontSize:10, fontWeight:700, color:'#64748b' }}>Signal Confidence</span>
                <span style={{ fontSize:11, fontWeight:800, color:'#0f172a' }}>{s.confidence}%</span>
              </div>
              <div style={{ height:6, borderRadius:99, background:'#e2e8f0' }}>
                <div style={{ height:'100%', borderRadius:99, width:`${s.confidence}%`,
                  background: s.confidence >= 75 ? '#16a34a' : s.confidence >= 50 ? '#d97706' : '#dc2626',
                  transition:'width .3s' }}/>
              </div>
            </div>
          )}

          {/* Tags */}
          {s.tags?.length > 0 && (
            <div style={{ display:'flex', gap:5, flexWrap:'wrap' }}>
              {s.tags.map(t => (
                <span key={t} style={{ fontSize:10, background:'#f1f5f9', color:'#475569',
                  border:'1px solid #e2e8f0', padding:'2px 8px', borderRadius:99 }}>#{t}</span>
              ))}
            </div>
          )}

          {/* Related decisions */}
          {s.related_decision_ids?.length > 0 && (
            <div>
              <div style={{ fontSize:10, fontWeight:700, color:'#94a3b8', marginBottom:6,
                textTransform:'uppercase', letterSpacing:0.8 }}>Related Decisions</div>
              <div style={{ display:'flex', gap:6, flexWrap:'wrap' }}>
                {s.related_decision_ids.map(did => (
                  <button key={did} onClick={() => navigate(`/app/decisions/${did}`)}
                    style={{ fontSize:11, fontWeight:700, color:'#2563eb', background:'#eff6ff',
                      border:'1px solid #bfdbfe', padding:'3px 10px', borderRadius:99, cursor:'pointer' }}>
                    {did} →
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Source block */}
          <div style={{ background:'#f8fafc', border:'1px solid #e2e8f0', borderRadius:8, padding:'8px 12px' }}>
            <div style={{ fontSize:10, color:'#64748b', lineHeight:1.75 }}>
              <b>Source:</b> {s.source} &nbsp;·&nbsp;
              <b>Method:</b> {s.extraction_method || 'AI extraction'} &nbsp;·&nbsp;
              <b>Ref:</b> {s.source_ref || s.id}
            </div>
          </div>

          {/* Actions */}
          <div style={{ display:'flex', gap:8, flexWrap:'wrap' }}>
            {isAdmin && (
              <button onClick={() => navigate('/app/signals')}
                style={{ flex:1, fontSize:11, fontWeight:700, padding:'8px 0', borderRadius:8,
                  background:'#2563eb', color:'#ffffff', border:'none', cursor:'pointer' }}>
                View in Signals Console →
              </button>
            )}
            {s.needs_verification && !verified && (
              <button onClick={(e) => { e.stopPropagation(); setVerified(true); }}
                style={{ fontSize:11, fontWeight:700, padding:'8px 14px', borderRadius:8,
                  background:'#fef9c3', color:'#92400e', border:'1px solid #fde68a', cursor:'pointer' }}>
                ✓ Mark Verified
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// ── Risk card — drill-down, navigate to decision, escalate ────────
function RiskCard({ r, navigate }) {
  const [open, setOpen] = useState(false);
  const [escalated, setEscalated] = useState(false);
  const sv = SEV[r.severity] || SEV.medium;
  return (
    <div style={{ borderRadius:10, background:sv.bg, border:`1px solid ${sv.border}`, overflow:'hidden' }}>
      <div onClick={() => setOpen(v => !v)} style={{ padding:'11px 13px', cursor:'pointer' }}>
        <div style={{ display:'flex', alignItems:'center', gap:7, marginBottom:5 }}>
          <span style={{ fontSize:14 }}>{sv.emoji}</span>
          <span style={{ fontSize:12, fontWeight:700, color:'#0f172a', flex:1, lineHeight:1.35 }}>{r.label}</span>
          <span style={{ fontSize:10, fontWeight:700, color:sv.color, background:'#ffffff',
            border:`1px solid ${sv.border}`, padding:'1px 7px', borderRadius:99, flexShrink:0 }}>
            {sv.label}
          </span>
          <span style={{ fontSize:11, color:'#94a3b8', marginLeft:4 }}>{open ? '▲' : '▼'}</span>
        </div>
        <div style={{ fontSize:11, color:'#475569', lineHeight:1.5, paddingLeft:22 }}>
          {(r.detail || '').substring(0, 90)}{(r.detail || '').length > 90 ? '…' : ''}
        </div>
        {r.related_decision && (
          <div style={{ fontSize:10, color:'#94a3b8', paddingLeft:22, marginTop:3 }}>
            Decision: {r.related_decision} — click to drill down ▼
          </div>
        )}
      </div>

      {open && (
        <div style={{ borderTop:`1px solid ${sv.border}`, background:'#ffffff',
          padding:'12px 13px', display:'flex', flexDirection:'column', gap:10 }}>
          <div style={{ fontSize:12, color:'#334155', lineHeight:1.65 }}>{r.detail}</div>
          {r.mitigation && (
            <div style={{ background:'#f0f9ff', border:'1px solid #bae6fd', borderRadius:8, padding:'8px 12px' }}>
              <div style={{ fontSize:10, fontWeight:700, color:'#0369a1', marginBottom:4 }}>Mitigation Path</div>
              <div style={{ fontSize:11, color:'#334155', lineHeight:1.6 }}>{r.mitigation}</div>
            </div>
          )}
          {escalated && (
            <div style={{ background:'#f0fdf4', border:'1px solid #bbf7d0', borderRadius:8,
              padding:'8px 12px', fontSize:11, fontWeight:600, color:'#15803d' }}>
              🚨 Escalated — added to executive attention list
            </div>
          )}
          <div style={{ display:'flex', gap:8, flexWrap:'wrap' }}>
            {r.related_decision && (
              <button onClick={() => navigate(`/app/decisions/${r.related_decision}`)}
                style={{ flex:1, minWidth:140, fontSize:11, fontWeight:700, padding:'8px 0', borderRadius:8,
                  background:'#eff6ff', color:'#2563eb', border:'1px solid #bfdbfe', cursor:'pointer' }}>
                View Decision {r.related_decision} →
              </button>
            )}
            {!escalated && (
              <button onClick={() => setEscalated(true)}
                style={{ fontSize:11, fontWeight:700, padding:'8px 14px', borderRadius:8,
                  background:'#fef2f2', color:'#dc2626', border:'1px solid #fecaca', cursor:'pointer' }}>
                🚨 Escalate
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// ── Main InsightsHub component ────────────────────────────────────
export default function InsightsHub() {
  const navigate = useNavigate();
  const { filters, snap } = useFilters();
  const { decisionState, commitDecision, holdDecision } = useDecisionState();
  const { user } = useAuth();

  const [activeId, setActiveId]   = useState('KPI-001');
  const [catFilter, setCatFilter] = useState(null);
  const [snapToast, setSnapToast] = useState(false);

  const slice      = useMemo(() => getDashboardSlice(filters, decisionState), [filters, decisionState]);
  const kpiInsight = useMemo(() => getKpiInsights(filters, activeId), [filters, activeId]);

  const { decisions, signals, externalIndicators,
          impactIndicators: defaultImpact, downsideRisks: defaultRisks } = slice;

  const kpis        = slice.kpis.slice(0, 6);
  const isAdmin     = user?.role === 'analyst';
  const activeColor = kpiInsight?.color || '#2563eb';

  // KPI-focused decisions — relevant decisions first
  const focusedDecisions = useMemo(() => {
    if (!kpiInsight) return decisions.slice(0, 4);
    const rel  = decisions.filter(d => kpiInsight.relevantDecisionIds.some(r => d.id === r || d.id.startsWith(r + '-')));
    const rest = decisions.filter(d => !kpiInsight.relevantDecisionIds.some(r => d.id === r || d.id.startsWith(r + '-')));
    return [...rel, ...rest].slice(0, 4);
  }, [decisions, kpiInsight]);

  // KPI-focused signals with optional category filter
  const allFocused = useMemo(() => {
    if (!kpiInsight) return signals;
    const rel  = signals.filter(s => kpiInsight.relevantSignalCategories.includes(s.category));
    const rest = signals.filter(s => !kpiInsight.relevantSignalCategories.includes(s.category));
    return [...rel, ...rest];
  }, [signals, kpiInsight]);

  const displayedSignals = useMemo(() => {
    const base = catFilter ? allFocused.filter(s => s.category === catFilter) : allFocused;
    return base.slice(0, 5);
  }, [allFocused, catFilter]);

  const catCounts = useMemo(() =>
    allFocused.reduce((acc, s) => { acc[s.category] = (acc[s.category] || 0) + 1; return acc; }, {}),
  [allFocused]);
  const uniqueCats = Object.keys(catCounts);

  const shownImpact = kpiInsight?.impactIndicators?.length > 0 ? kpiInsight.impactIndicators : (defaultImpact || []);
  const shownRisks  = kpiInsight?.downsideRisks?.length  > 0 ? kpiInsight.downsideRisks    : (defaultRisks  || []);

  function handleSnap() {
    snap();
    setSnapToast(true);
    setTimeout(() => setSnapToast(false), 3000);
  }

  return (
    <div style={{ background:'#f4f6f9', minHeight:'100%', padding:'20px 24px',
      display:'flex', flexDirection:'column', gap:16 }}>

      {/* Snap toast */}
      {snapToast && (
        <div style={{ position:'fixed', top:20, right:20, zIndex:9998,
          background:'#0f172a', color:'#ffffff', borderRadius:12,
          padding:'12px 20px', fontSize:13, fontWeight:700,
          boxShadow:'0 8px 30px rgba(0,0,0,0.3)', display:'flex', alignItems:'center', gap:10 }}>
          <span>📸</span> Snapshot queued — click ⧉ Snap in the toolbar to open
        </div>
      )}

      {/* ── Page header ─────────────────────────────────────────── */}
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', flexWrap:'wrap', gap:10 }}>
        <div>
          <div style={{ fontSize:18, fontWeight:900, color:'#0f172a' }}>Insights Hub</div>
          <div style={{ fontSize:11, color:'#94a3b8', marginTop:2 }}>
            Select a KPI → all panels update · click any card to drill-down for full context + actions
          </div>
        </div>
        <div style={{ display:'flex', gap:8, alignItems:'center', flexWrap:'wrap' }}>
          <button onClick={handleSnap}
            style={{ display:'flex', alignItems:'center', gap:6, fontSize:12, fontWeight:700,
              padding:'8px 16px', borderRadius:9, background:'#0f172a', color:'#ffffff',
              border:'none', cursor:'pointer', boxShadow:'0 2px 8px rgba(0,0,0,0.18)' }}>
            📸 Snap View
          </button>
          <button onClick={() => navigate('/app/board')}
            style={{ display:'flex', alignItems:'center', gap:6, fontSize:12, fontWeight:700,
              padding:'8px 16px', borderRadius:9, background:'#ffffff', color:'#334155',
              border:'1px solid #e2e8f0', cursor:'pointer' }}>
            📋 Board Brief
          </button>
          <button onClick={() => navigate('/app/decisions')}
            style={{ display:'flex', alignItems:'center', gap:6, fontSize:12, fontWeight:700,
              padding:'8px 16px', borderRadius:9, background:'#eff6ff', color:'#2563eb',
              border:'1px solid #bfdbfe', cursor:'pointer' }}>
            ⚡ Decision Hub
          </button>
        </div>
      </div>

      {/* ── Live ticker ─────────────────────────────────────────── */}
      <div style={{ display:'flex', alignItems:'center', gap:12, background:'#ffffff',
        border:'1px solid #e2e8f0', borderRadius:10, padding:'8px 14px',
        boxShadow:'0 1px 3px rgba(0,0,0,0.05)', overflow:'hidden' }}>
        <span style={{ display:'flex', alignItems:'center', gap:5, flexShrink:0,
          background:'#f0fdf4', color:'#16a34a', border:'1px solid #bbf7d0',
          fontSize:11, fontWeight:700, padding:'3px 10px', borderRadius:99 }}>
          <span style={{ width:6, height:6, borderRadius:'50%', background:'#16a34a', display:'inline-block' }}/>
          LIVE
        </span>
        <div style={{ flex:1, overflow:'hidden' }}>
          <div className="ticker-track">
            {[...externalIndicators, ...externalIndicators].map((ind, i) => (
              <span key={i} style={{ display:'inline-flex', alignItems:'center', gap:6, flexShrink:0, fontSize:12 }}>
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

      {/* ── KPI selector strip ──────────────────────────────────── */}
      <div style={{ background:'#ffffff', border:'1px solid #e2e8f0', borderRadius:12,
        padding:'14px 16px', boxShadow:'0 1px 3px rgba(0,0,0,0.05)' }}>
        <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:12 }}>
          <span style={{ fontSize:13, fontWeight:800, color:'#0f172a' }}>KPI Focus</span>
          <span style={{ fontSize:11, color:'#94a3b8' }}>
            — click any metric · recommendations, signals, risks &amp; indicators all update
          </span>
        </div>
        <div style={{ display:'flex', gap:10, overflowX:'auto', paddingBottom:4 }}>
          {kpis.map((k, idx) => (
            <KpiCard key={k.id} k={k} color={KPI_COLORS[idx] || '#2563eb'}
              isActive={activeId === k.id} onClick={() => setActiveId(k.id)}/>
          ))}
        </div>
      </div>

      {/* ── KPI insight banner ──────────────────────────────────── */}
      {kpiInsight && (
        <div style={{ background:`${activeColor}07`, border:`1px solid ${activeColor}28`,
          borderLeft:`4px solid ${activeColor}`, borderRadius:10, padding:'16px 20px' }}>
          <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:12, flexWrap:'wrap' }}>
            <span style={{ fontSize:12, fontWeight:800, background:activeColor, color:'#fff',
              padding:'4px 14px', borderRadius:99, flexShrink:0 }}>
              {kpiInsight.label}
            </span>
            {[
              { label:'Plant',  val: filters.site },
              { label:'Line',   val: filters.productLine },
              { label:'Seg',    val: filters.segment },
              { label:'Period', val: filters.timeRange },
            ].map(ctx => (
              <span key={ctx.label} style={{ fontSize:10, fontWeight:600, background:'#ffffff',
                color:'#475569', border:'1px solid #e2e8f0', padding:'2px 8px', borderRadius:99 }}>
                {ctx.label}: <b style={{ color:'#0f172a' }}>{ctx.val}</b>
              </span>
            ))}
            <span style={{ marginLeft:'auto', fontSize:10, color:'#94a3b8', fontStyle:'italic' }}>
              AI-synthesised · confidence model on
            </span>
          </div>

          <div style={{ fontSize:12, color:'#334155', lineHeight:1.7, marginBottom:12 }}>
            <b style={{ color:'#475569' }}>Analysis: </b>{kpiInsight.insightSummary}
          </div>

          <div style={{ background:'#ffffff', border:`1.5px solid ${activeColor}25`,
            borderRadius:8, padding:'12px 16px', display:'flex', alignItems:'flex-start', gap:10, marginBottom:12 }}>
            <span style={{ fontSize:18, flexShrink:0 }}>⚡</span>
            <div>
              <div style={{ fontSize:11, fontWeight:800, color:activeColor, marginBottom:4 }}>Recommendation</div>
              <div style={{ fontSize:12, color:'#0f172a', lineHeight:1.7 }}>{kpiInsight.recommendation}</div>
            </div>
          </div>

          <div style={{ display:'flex', gap:8, flexWrap:'wrap' }}>
            <button onClick={handleSnap}
              style={{ fontSize:11, fontWeight:700, padding:'7px 16px', borderRadius:8,
                background:'#0f172a', color:'#ffffff', border:'none', cursor:'pointer' }}>
              📸 Snap this insight
            </button>
            <button onClick={() => navigate('/app/decisions')}
              style={{ fontSize:11, fontWeight:700, padding:'7px 16px', borderRadius:8,
                background:activeColor, color:'#ffffff', border:'none', cursor:'pointer' }}>
              → {kpiInsight.relevantDecisionIds?.length || 0} related decisions
            </button>
            <button onClick={() => navigate('/app/execution')}
              style={{ fontSize:11, fontWeight:700, padding:'7px 16px', borderRadius:8,
                background:'#ffffff', color:'#475569', border:'1px solid #e2e8f0', cursor:'pointer' }}>
              📊 Track in Execution Hub
            </button>
          </div>
        </div>
      )}

      {/* ── ROW 1: Decisions | Signals ──────────────────────────── */}
      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:16 }}>

        {/* Decision Recommendations panel */}
        <div style={{ background:'#ffffff', border:'1px solid #e2e8f0', borderRadius:12,
          padding:'16px 18px', boxShadow:'0 1px 3px rgba(0,0,0,0.05)' }}>
          <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between',
            paddingBottom:10, marginBottom:12, borderBottom:'1px solid #f1f5f9', flexWrap:'wrap', gap:6 }}>
            <div style={{ display:'flex', alignItems:'center', gap:8 }}>
              <span style={{ fontSize:13, fontWeight:700, color:'#0f172a' }}>Decision Recommendations</span>
              {kpiInsight && (
                <span style={{ fontSize:10, fontWeight:700, color:activeColor,
                  background:`${activeColor}12`, border:`1px solid ${activeColor}30`,
                  padding:'2px 8px', borderRadius:99 }}>
                  {kpiInsight.label} lens
                </span>
              )}
            </div>
            <div style={{ display:'flex', gap:6 }}>
              <span style={{ fontSize:11, fontWeight:600, background:'#fef9c3', color:'#ca8a04',
                border:'1px solid #fde68a', padding:'2px 8px', borderRadius:99 }}>
                {focusedDecisions.length} open
              </span>
              <button onClick={() => navigate('/app/decisions')}
                style={{ fontSize:10, fontWeight:700, color:'#2563eb', background:'#eff6ff',
                  border:'1px solid #bfdbfe', padding:'2px 8px', borderRadius:99, cursor:'pointer' }}>
                View All →
              </button>
            </div>
          </div>
          <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
            {focusedDecisions.map(d => {
              const isRel = kpiInsight?.relevantDecisionIds.some(r => d.id === r || d.id.startsWith(r + '-'));
              return (
                <DecisionCard key={d.id} d={d} isRelevant={isRel} accentColor={activeColor}
                  navigate={navigate} commitState={decisionState[d.id]?.status}
                  onCommit={commitDecision} onHold={holdDecision}/>
              );
            })}
          </div>
        </div>

        {/* Signals panel */}
        <div style={{ background:'#ffffff', border:'1px solid #e2e8f0', borderRadius:12,
          padding:'16px 18px', boxShadow:'0 1px 3px rgba(0,0,0,0.05)' }}>
          <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between',
            paddingBottom:10, marginBottom:10, borderBottom:'1px solid #f1f5f9', flexWrap:'wrap', gap:6 }}>
            <div style={{ display:'flex', alignItems:'center', gap:8 }}>
              <span style={{ fontSize:13, fontWeight:700, color:'#0f172a' }}>Signals</span>
              {kpiInsight && (
                <span style={{ fontSize:10, fontWeight:700, color:activeColor,
                  background:`${activeColor}12`, border:`1px solid ${activeColor}30`,
                  padding:'2px 8px', borderRadius:99 }}>
                  {kpiInsight.label} lens
                </span>
              )}
            </div>
            <span style={{ fontSize:10, fontWeight:700,
              background: isAdmin ? '#f0fdf4' : '#f8fafc',
              color: isAdmin ? '#16a34a' : '#64748b',
              border:`1px solid ${isAdmin ? '#bbf7d0' : '#e2e8f0'}`,
              padding:'2px 8px', borderRadius:99 }}>
              {isAdmin ? '🔓 Admin' : '👁 Read-only'}
            </span>
          </div>

          {/* Category filter chips */}
          <div style={{ display:'flex', gap:5, flexWrap:'wrap', marginBottom:12 }}>
            <button onClick={() => setCatFilter(null)} style={{
              fontSize:10, fontWeight:700, padding:'3px 10px', borderRadius:99,
              background: catFilter === null ? '#0f172a' : '#f8fafc',
              color: catFilter === null ? '#ffffff' : '#475569',
              border:'1px solid #e2e8f0', cursor:'pointer', transition:'all .1s',
            }}>
              All ({allFocused.length})
            </button>
            {uniqueCats.map(cat => {
              const c = CATS[cat] || { emoji:'•', color:'#475569' };
              return (
                <button key={cat} onClick={() => setCatFilter(catFilter === cat ? null : cat)}
                  title={CATS[cat]?.desc || cat}
                  style={{ fontSize:10, fontWeight:700, padding:'3px 9px', borderRadius:99,
                    background: catFilter === cat ? c.color : '#f8fafc',
                    color: catFilter === cat ? '#ffffff' : c.color,
                    border:`1px solid ${c.color}40`, cursor:'pointer', transition:'all .1s' }}>
                  {c.emoji} {cat} ({catCounts[cat]})
                </button>
              );
            })}
          </div>

          <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
            {displayedSignals.length > 0 ? displayedSignals.map(s => {
              const isRel = kpiInsight?.relevantSignalCategories.includes(s.category);
              return (
                <SignalCard key={s.id} s={s} isRelevant={isRel} accentColor={activeColor}
                  isAdmin={isAdmin} navigate={navigate}/>
              );
            }) : (
              <div style={{ padding:'24px', textAlign:'center', color:'#94a3b8', fontSize:12 }}>
                No signals match the selected category filter
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── ROW 2: Impact Indicators | Downside Risks ───────────── */}
      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:16 }}>

        <div style={{ background:'#ffffff', border:`1px solid ${activeColor}25`,
          borderRadius:12, padding:'16px 18px', boxShadow:'0 1px 3px rgba(0,0,0,0.05)' }}>
          <div style={{ display:'flex', alignItems:'center', gap:8,
            paddingBottom:10, marginBottom:12, borderBottom:'1px solid #f1f5f9' }}>
            <span style={{ fontSize:13, fontWeight:700, color:'#0f172a' }}>Impact Indicators</span>
            {kpiInsight && (
              <span style={{ fontSize:10, fontWeight:700, color:activeColor,
                background:`${activeColor}12`, border:`1px solid ${activeColor}30`,
                padding:'2px 8px', borderRadius:99 }}>
                {kpiInsight.label}
              </span>
            )}
            <span style={{ marginLeft:'auto', fontSize:10, color:'#94a3b8' }}>click to expand</span>
          </div>
          <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
            {shownImpact.map((ind, i) => (
              <ImpactIndicatorCard key={ind.id || i} ind={ind} accentColor={activeColor}/>
            ))}
          </div>
        </div>

        <div style={{ background:'#ffffff', border:`1px solid ${activeColor}25`,
          borderRadius:12, padding:'16px 18px', boxShadow:'0 1px 3px rgba(0,0,0,0.05)' }}>
          <div style={{ display:'flex', alignItems:'center', gap:8,
            paddingBottom:10, marginBottom:12, borderBottom:'1px solid #f1f5f9' }}>
            <span style={{ fontSize:13, fontWeight:700, color:'#0f172a' }}>Downside Risks</span>
            {kpiInsight && (
              <span style={{ fontSize:10, fontWeight:700, color:activeColor,
                background:`${activeColor}12`, border:`1px solid ${activeColor}30`,
                padding:'2px 8px', borderRadius:99 }}>
                {kpiInsight.label}
              </span>
            )}
            <span style={{ marginLeft:'auto', fontSize:10, color:'#94a3b8' }}>click to expand + escalate</span>
          </div>
          <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
            {shownRisks.map((r, i) => (
              <RiskCard key={r.id || i} r={r} navigate={navigate}/>
            ))}
          </div>
        </div>
      </div>

      {/* ── ROW 3: All KPIs grid ─────────────────────────────────── */}
      <div>
        <div style={{ display:'flex', alignItems:'baseline', gap:8, marginBottom:12 }}>
          <span style={{ fontSize:13, fontWeight:700, color:'#0f172a' }}>All KPIs</span>
          <span style={{ fontSize:11, color:'#94a3b8' }}>
            — click any card · sparkline = 10-week trend · selected KPI drives all panels above
          </span>
        </div>
        <div style={{ display:'grid', gridTemplateColumns:'repeat(3, 1fr)', gap:12 }}>
          {kpis.map((k, idx) => {
            const color    = KPI_COLORS[idx] || '#2563eb';
            const pts      = k.sparkline || k.pts || [18,22,20,24,26,27,28,30,31,32];
            const isActive = k.id === activeId;
            return (
              <div key={k.id} onClick={() => setActiveId(k.id)} style={{
                cursor:'pointer', borderRadius:12, padding:'16px 18px',
                background: isActive ? `${color}0d` : '#ffffff',
                border:`${isActive ? 2 : 1}px solid ${isActive ? color : '#e2e8f0'}`,
                boxShadow: isActive ? `0 0 0 3px ${color}18` : '0 1px 3px rgba(0,0,0,0.05)',
                transition:'all .15s',
              }}>
                <div style={{ display:'flex', alignItems:'flex-start', justifyContent:'space-between', marginBottom:8 }}>
                  <span style={{ fontSize:11, fontWeight:700, color: isActive ? color : '#64748b',
                    lineHeight:1.3, maxWidth:'65%' }}>
                    {k.label}{isActive ? ' ★' : ''}
                  </span>
                  <span style={{ fontSize:10, fontWeight:700, flexShrink:0,
                    background: k.trend === 'up' ? '#f0fdf4' : '#fef2f2',
                    color: k.trend === 'up' ? '#16a34a' : '#dc2626',
                    border:`1px solid ${k.trend === 'up' ? '#bbf7d0' : '#fecaca'}`,
                    padding:'2px 7px', borderRadius:99 }}>
                    {k.trend === 'up' ? '▲' : '▼'} {k.delta}
                  </span>
                </div>
                <div style={{ fontSize:26, fontWeight:900, color: isActive ? color : '#0f172a', marginBottom:2 }}>
                  {k.value}
                </div>
                <div style={{ fontSize:11, color:'#64748b', marginBottom:8 }}>{k.sublabel}</div>
                <Spark pts={pts} color={color} active={isActive}/>
                {isActive && (
                  <div style={{ marginTop:8, fontSize:11, color:color, fontWeight:700,
                    borderTop:`1px solid ${color}20`, paddingTop:6 }}>
                    Driving all panels above ↑
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

    </div>
  );
}
