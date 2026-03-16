import { useMemo } from 'react';
import { useFilters } from '../contexts/FilterContext';
import { useAuth } from '../contexts/AuthContext';
import { getFilteredSignals } from '../data/siboniSelectors';

const badge = {
  high:   { bg:'#fef2f2', color:'#dc2626', border:'#fecaca' },
  medium: { bg:'#fffbeb', color:'#d97706', border:'#fde68a' },
  low:    { bg:'#f0fdf4', color:'#16a34a', border:'#bbf7d0' },
};

export default function SignalsConsole() {
  const { user } = useAuth();
  const { filters } = useFilters();

  const isAdmin = user?.role === 'analyst';

  const signals = useMemo(() => getFilteredSignals(filters), [filters]);

  if (!isAdmin) {
    return (
      <div style={{ minHeight:'100%', display:'grid', placeItems:'center', background:'#f4f6f9' }}>
        <div style={{ background:'#ffffff', border:'1px solid #e2e8f0', borderRadius:12, padding:24, width:480, textAlign:'center' }}>
          <h2 style={{ margin:0, color:'#0f172a' }}>Admin access required</h2>
          <p style={{ marginTop:8, color:'#64748b', fontSize:13 }}>Signals Console is available only to Admin/Super User for verification and provenance review.</p>
        </div>
      </div>
    );
  }

  return (
    <div style={{ background:'#f4f6f9', minHeight:'100%', padding:'20px 24px' }}>
      <div style={{ background:'#ffffff', border:'1px solid #e2e8f0', borderRadius:12, overflow:'hidden' }}>
        <div style={{ padding:'12px 16px', borderBottom:'1px solid #e2e8f0' }}>
          <h1 style={{ margin:0, color:'#0f172a', fontSize:20, fontWeight:900 }}>Signals Console</h1>
          <div style={{ marginTop:4, color:'#64748b', fontSize:12 }}>
            {filters.timeRange} • {filters.site} • {filters.country} • {filters.segment} • {filters.productLine}
          </div>
        </div>

        <div style={{ display:'grid', gridTemplateColumns:'130px 1fr 130px 170px 140px 130px', padding:'10px 16px', background:'#f8fafc', borderBottom:'1px solid #e2e8f0', color:'#94a3b8', fontSize:11, fontWeight:700, textTransform:'uppercase' }}>
          <div>ID</div><div>Signal</div><div>Severity</div><div>Source</div><div>Date</div><div>Verification</div>
        </div>

        {signals.map((s) => {
          const b = badge[s.severity] || badge.medium;
          return (
            <div key={s.id} style={{ display:'grid', gridTemplateColumns:'130px 1fr 130px 170px 140px 130px', padding:'10px 16px', borderBottom:'1px solid #f1f5f9', alignItems:'center' }}>
              <div style={{ fontSize:11, color:'#64748b', fontWeight:700 }}>{s.id}</div>
              <div>
                <div style={{ fontSize:12, fontWeight:700, color:'#0f172a' }}>{s.title}</div>
                <div style={{ fontSize:11, color:'#64748b', marginTop:3 }}>{s.summary}</div>
                <div style={{ fontSize:10, color:'#94a3b8', marginTop:4 }}>Extraction: {s.extraction_method || 'N/A'} • Confidence: {s.confidence}%</div>
              </div>
              <div>
                <span style={{ fontSize:11, fontWeight:700, color:b.color, background:b.bg, border:`1px solid ${b.border}`, borderRadius:999, padding:'3px 8px' }}>{s.severity}</span>
              </div>
              <div style={{ fontSize:11, color:'#334155' }}>{s.source}</div>
              <div style={{ fontSize:11, color:'#334155' }}>{s.date}</div>
              <div style={{ fontSize:11, color: s.needs_verification ? '#d97706' : '#16a34a', fontWeight:700 }}>
                {s.needs_verification ? 'Needs review' : 'Verified'}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
