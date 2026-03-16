import { useFilters } from '../contexts/FilterContext';
import { useDecisionState } from '../contexts/DecisionStateContext';
import { buildBoardBrief } from '../data/siboniSelectors';

export default function BoardBrief() {
  const { filters } = useFilters();
  const { decisionState } = useDecisionState();
  const brief = buildBoardBrief(filters, decisionState);

  if (!brief) {
    return <div style={{ padding: 24, color: '#64748b' }}>No board brief available for this filter selection.</div>;
  }

  return (
    <div style={{ background:'#f4f6f9', minHeight:'100%', padding:'20px 24px', display:'flex', flexDirection:'column', gap:16 }}>
      <div style={{ background:'#ffffff', border:'1px solid #e2e8f0', borderRadius:12, padding:18 }}>
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start' }}>
          <div>
            <div style={{ fontSize:11, color:'#94a3b8', fontWeight:700, letterSpacing:1 }}>BOARD BRIEF</div>
            <h1 style={{ margin:'6px 0 0', color:'#0f172a', fontSize:24, fontWeight:900 }}>{brief.title}</h1>
            <div style={{ marginTop:6, fontSize:12, color:'#64748b' }}>
              Scope: {brief.scope.country} • {brief.scope.site} • {brief.scope.segment} • {brief.scope.productLine} • {brief.scope.timeRange}
            </div>
          </div>
          <button style={{ border:'1px solid #bfdbfe', background:'#eff6ff', color:'#2563eb', fontWeight:700, fontSize:12, borderRadius:8, padding:'8px 12px' }}>
            Export Snapshot
          </button>
        </div>
      </div>

      <div style={{ display:'grid', gridTemplateColumns:'1.4fr 1fr', gap:14 }}>
        <section style={{ background:'#ffffff', border:'1px solid #e2e8f0', borderRadius:12, padding:16 }}>
          <h3 style={{ margin:0, fontSize:14, color:'#0f172a' }}>Why now</h3>
          <p style={{ marginTop:8, fontSize:13, color:'#334155', lineHeight:1.55 }}>{brief.whyNow}</p>
          <div style={{ marginTop:8, fontSize:12, color:'#64748b' }}>Confidence: <b>{brief.confidence}</b></div>
          <div style={{ marginTop:6, fontSize:12, color:'#64748b' }}>Value at stake: <b>{brief.valueAtStake}</b></div>
          <div style={{ marginTop:8, fontSize:12, color:'#64748b' }}>
            Impact range: <b>{brief.impact?.low}</b> to <b>{brief.impact?.high}</b> {brief.impact?.unit || ''}
          </div>
        </section>

        <section style={{ background:'#ffffff', border:'1px solid #e2e8f0', borderRadius:12, padding:16 }}>
          <h3 style={{ margin:0, fontSize:14, color:'#0f172a' }}>Top 3 evidence</h3>
          <div style={{ marginTop:8, display:'flex', flexDirection:'column', gap:8 }}>
            {brief.evidence.map((e, i) => (
              <div key={i} style={{ border:'1px solid #e2e8f0', borderRadius:8, padding:'8px 10px', background:'#f8fafc' }}>
                <div style={{ fontSize:11, color:'#2563eb', fontWeight:700 }}>{e.source} • {e.date}</div>
                <div style={{ fontSize:12, color:'#334155', marginTop:3 }}>{e.note}</div>
              </div>
            ))}
          </div>
        </section>
      </div>

      <section style={{ background:'#ffffff', border:'1px solid #e2e8f0', borderRadius:12, padding:16 }}>
        <h3 style={{ margin:0, fontSize:14, color:'#0f172a' }}>2-week action plan</h3>
        <div style={{ marginTop:10, display:'grid', gridTemplateColumns:'1fr 190px 120px', gap:8, color:'#94a3b8', fontSize:11, fontWeight:700, textTransform:'uppercase' }}>
          <div>Action</div><div>Owner</div><div>Due</div>
        </div>
        {brief.actions.map((a) => (
          <div key={a.id} style={{ marginTop:6, display:'grid', gridTemplateColumns:'1fr 190px 120px', gap:8, alignItems:'center', border:'1px solid #e2e8f0', borderRadius:8, padding:'8px 10px' }}>
            <div style={{ fontSize:12, color:'#0f172a', fontWeight:600 }}>{a.title}</div>
            <div style={{ fontSize:12, color:'#334155' }}>{a.owner}</div>
            <div style={{ fontSize:12, color:'#334155' }}>{a.due}</div>
          </div>
        ))}
      </section>
    </div>
  );
}
