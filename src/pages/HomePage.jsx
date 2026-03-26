import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useFilters } from '../contexts/FilterContext';
import { useDecisionState } from '../contexts/DecisionStateContext';
import { getDashboardSlice, getFilteredKpis, getFilteredDecisions } from '../data/siboniSelectors';
import { company } from '../data/gisData';

// ── Value-at-Stake row definitions ───────────────────────────────
const VAS_ENTRIES = (vas) => [
  { label: 'Revenue at risk',     value: vas.revenue_at_risk },
  { label: 'Margin at risk',      value: vas.margin_at_risk  },
  { label: 'OTIF / penalty',      value: vas.otif_penalty    },
  { label: 'Cash (if buffering)', value: '-$10M to -$25M'    },
];

// ── Hub Card (A/B/C lettered, matches wireframe) ──────────────────
const HubCard = ({ letter, to, title, desc, color, borderColor, navigate }) => (
  <div
    onClick={() => navigate(to)}
    style={{
      background: '#ffffff', border: `1.5px solid ${borderColor}`,
      borderRadius: 14, padding: '20px 22px', cursor: 'pointer',
      boxShadow: '0 1px 4px rgba(0,0,0,0.06)', transition: 'box-shadow .14s, transform .12s',
      display: 'flex', flexDirection: 'column', gap: 8,
    }}
    onMouseOver={e => {
      e.currentTarget.style.boxShadow = '0 6px 18px rgba(0,0,0,0.10)';
      e.currentTarget.style.transform = 'translateY(-2px)';
    }}
    onMouseOut={e => {
      e.currentTarget.style.boxShadow = '0 1px 4px rgba(0,0,0,0.06)';
      e.currentTarget.style.transform = 'translateY(0)';
    }}
  >
    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
      <div style={{
        width: 28, height: 28, borderRadius: 8, background: color + '18',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: 13, fontWeight: 900, color: color, flexShrink: 0,
      }}>
        {letter}
      </div>
      <div style={{ fontSize: 14, fontWeight: 800, color: '#0f172a' }}>{title}</div>
    </div>
    <div style={{ fontSize: 11, color: '#64748b', lineHeight: 1.55 }}>{desc}</div>
    <div style={{ fontSize: 11, fontWeight: 700, color: color, display: 'flex', alignItems: 'center', gap: 4, marginTop: 2 }}>
      Open →
    </div>
  </div>
);

// ── Snap Modal ────────────────────────────────────────────────────
function SnapModal({ snapData, snapKpis, snapDecisions, dismissSnap, snapEmail, setSnapEmail, snapSent, setSnapSent }) {
  if (!snapData) return null;
  return (
    <div style={{
      position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.72)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      zIndex: 9999, padding: 24,
    }}>
      <div style={{
        background: '#ffffff', borderRadius: 16, width: '100%', maxWidth: 660,
        maxHeight: '90vh', overflow: 'auto',
        boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
      }}>
        <div style={{ background: 'linear-gradient(135deg,#0f172a,#1e3a5f)', padding: '20px 24px', borderRadius: '16px 16px 0 0' }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
            <div>
              <div style={{ fontSize: 10, fontWeight: 700, color: '#64748b', letterSpacing: 1.5, textTransform: 'uppercase', marginBottom: 4 }}>Executive Snapshot</div>
              <div style={{ fontSize: 20, fontWeight: 900, color: '#ffffff' }}>{company.name}</div>
              <div style={{ fontSize: 11, color: '#94a3b8', marginTop: 4 }}>
                {snapData.label} · {new Date(snapData.timestamp).toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short' })}
              </div>
            </div>
            <button onClick={() => { dismissSnap(); setSnapSent(false); setSnapEmail(''); }}
              style={{ background: 'rgba(255,255,255,0.1)', border: 'none', borderRadius: 8, cursor: 'pointer', padding: 8, color: '#94a3b8' }}>
              <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
        <div style={{ padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            {Object.entries(snapData.filters || {}).map(([k, v]) => (
              <span key={k} style={{ fontSize: 11, fontWeight: 600, background: '#f1f5f9', color: '#475569', border: '1px solid #e2e8f0', padding: '3px 10px', borderRadius: 99 }}>
                {k}: <b>{v}</b>
              </span>
            ))}
          </div>
          <div>
            <div style={{ fontSize: 11, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 10 }}>Key Metrics</div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 10 }}>
              {snapKpis.map(k => (
                <div key={k.id} style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 10, padding: '10px 14px' }}>
                  <div style={{ fontSize: 10, fontWeight: 600, color: '#94a3b8', marginBottom: 4 }}>{k.label}</div>
                  <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
                    <span style={{ fontSize: 22, fontWeight: 900, color: '#0f172a' }}>{k.value}</span>
                    <span style={{ fontSize: 11, fontWeight: 700, color: k.trend === 'up' ? '#16a34a' : '#dc2626' }}>{k.delta}</span>
                  </div>
                  <div style={{ fontSize: 10, color: '#94a3b8', marginTop: 2 }}>{k.sublabel}</div>
                </div>
              ))}
            </div>
          </div>
          <div>
            <div style={{ fontSize: 11, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 10 }}>Open Decisions</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {snapDecisions.map(d => (
                <div key={d.id} style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 10, padding: '10px 14px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                    <span style={{ fontSize: 10, fontWeight: 700, color: '#94a3b8' }}>{d.ref}</span>
                    <span style={{ marginLeft: 'auto', fontSize: 11, fontWeight: 700, color: '#dc2626' }}>{d.value_at_stake}</span>
                  </div>
                  <div style={{ fontSize: 12, fontWeight: 700, color: '#0f172a', marginBottom: 3 }}>{d.title}</div>
                  <div style={{ fontSize: 11, color: '#64748b', lineHeight: 1.5 }}>{d.why_now?.substring(0, 120)}…</div>
                </div>
              ))}
            </div>
          </div>
          {!snapSent ? (
            <div style={{ background: '#f0f9ff', border: '1px solid #bae6fd', borderRadius: 10, padding: '14px 16px' }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: '#0369a1', marginBottom: 10 }}>📧 Send as Board Report</div>
              <div style={{ display: 'flex', gap: 8 }}>
                <input value={snapEmail} onChange={e => setSnapEmail(e.target.value)} placeholder="recipient@gis.com"
                  style={{ flex: 1, fontSize: 12, padding: '8px 12px', borderRadius: 8, border: '1px solid #bae6fd', outline: 'none', background: '#ffffff' }} />
                <button onClick={() => { if (snapEmail.includes('@')) setSnapSent(true); }}
                  style={{ fontSize: 12, fontWeight: 700, padding: '8px 18px', borderRadius: 8, background: snapEmail.includes('@') ? '#2563eb' : '#94a3b8', color: '#ffffff', border: 'none', cursor: snapEmail.includes('@') ? 'pointer' : 'default' }}>
                  Send
                </button>
              </div>
            </div>
          ) : (
            <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: 10, padding: '14px 16px', display: 'flex', alignItems: 'center', gap: 10 }}>
              <svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
              <div>
                <div style={{ fontSize: 12, fontWeight: 700, color: '#15803d' }}>Report sent!</div>
                <div style={{ fontSize: 11, color: '#64748b' }}>Executive snapshot delivered to {snapEmail}</div>
              </div>
            </div>
          )}
          <div style={{ display: 'flex', gap: 8 }}>
            <button onClick={dismissSnap} style={{ flex: 1, fontSize: 12, fontWeight: 700, padding: '10px 0', borderRadius: 10, background: '#f8fafc', border: '1px solid #e2e8f0', color: '#475569', cursor: 'pointer' }}>Close</button>
            <button onClick={() => alert('PDF export coming soon.')} style={{ flex: 1, fontSize: 12, fontWeight: 700, padding: '10px 0', borderRadius: 10, background: 'linear-gradient(135deg,#2563eb,#4f46e5)', color: '#ffffff', border: 'none', cursor: 'pointer' }}>⬇ Download PDF</button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Home Page (Screen 3 — standalone, no sidebar) ─────────────────
export default function HomePage() {
  const navigate              = useNavigate();
  const { user, logout }      = useAuth();
  const { filters, reset, snap, snapVisible, snapData, dismissSnap } = useFilters();
  const { decisionState }     = useDecisionState();
  const [snapEmail, setSnapEmail] = useState('');
  const [snapSent, setSnapSent]   = useState(false);

  const slice = useMemo(
    () => getDashboardSlice(filters, decisionState),
    [filters, decisionState],
  );
  const snapKpis      = snapVisible ? getFilteredKpis(filters).slice(0, 4) : [];
  const snapDecisions = snapVisible ? getFilteredDecisions(filters).slice(0, 2) : [];

  const now     = new Date();
  const dateStr = now.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

  const td         = slice.topDecision;
  const vasEntries = VAS_ENTRIES(slice.valueAtStake);
  const whatChanged = slice.whatChanged;

  return (
    <div style={{ minHeight: '100vh', background: '#f4f6f9', display: 'flex', flexDirection: 'column' }}>

      {/* ── Snap Modal ──────────────────────────────────────────── */}
      {snapVisible && (
        <SnapModal
          snapData={snapData}
          snapKpis={snapKpis}
          snapDecisions={snapDecisions}
          dismissSnap={dismissSnap}
          snapEmail={snapEmail}
          setSnapEmail={setSnapEmail}
          snapSent={snapSent}
          setSnapSent={setSnapSent}
        />
      )}

      {/* ── Top Header Bar ──────────────────────────────────────── */}
      <div style={{
        background: '#ffffff', borderBottom: '1px solid #e2e8f0',
        padding: '0 36px', height: 62,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        flexShrink: 0, boxShadow: '0 1px 4px rgba(0,0,0,0.05)',
      }}>
        {/* Left — branding + company */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <div>
            <div style={{ fontSize: 22, fontWeight: 900, color: '#0f172a', letterSpacing: 2, lineHeight: 1 }}>SiBoNi</div>
            <div style={{ fontSize: 9, fontWeight: 700, color: '#94a3b8', letterSpacing: 1.5, textTransform: 'uppercase' }}>CXO Cockpit</div>
          </div>
          <div style={{ width: 1, height: 32, background: '#e2e8f0' }} />
          <div>
            <div style={{ fontSize: 15, fontWeight: 800, color: '#0f172a', lineHeight: 1.2 }}>{company.name}</div>
            <div style={{ fontSize: 11, color: '#64748b' }}>{user?.name || 'Marcus Gaksh'}</div>
          </div>
        </div>

        {/* Right — last updated + date + logout */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: 11, color: '#94a3b8' }}>
              Last updated: <b style={{ color: '#334155' }}>2h ago</b>
              &nbsp;·&nbsp;Sources: Internal + external&nbsp;·&nbsp;Confidence model:&nbsp;
              <span style={{ color: '#16a34a', fontWeight: 700 }}>enabled</span>
            </div>
            <div style={{ fontSize: 11, color: '#94a3b8', marginTop: 2 }}>{dateStr}</div>
          </div>
          <button
            onClick={() => { logout(); navigate('/login'); }}
            style={{ fontSize: 11, fontWeight: 600, padding: '6px 14px', borderRadius: 8, background: '#f8fafc', border: '1px solid #e2e8f0', color: '#475569', cursor: 'pointer' }}
          >
            Sign out
          </button>
        </div>
      </div>

      {/* ── Active Filter Context Chips ─────────────────────────── */}
      <div style={{
        background: '#ffffff', borderBottom: '1px solid #f1f5f9',
        padding: '8px 36px', display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0,
      }}>
        <span style={{ fontSize: 10, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: 1, marginRight: 4 }}>Context:</span>
        {[
          ['Time Range', filters.timeRange],
          ['Plant', filters.site],
          ['Region', filters.country],
          ['Segment', filters.segment],
          ['Prod. Line', filters.productLine],
        ].map(([label, val]) => (
          <span key={label} style={{
            fontSize: 11, fontWeight: 600, background: '#f1f5f9', color: '#334155',
            border: '1px solid #e2e8f0', padding: '3px 11px', borderRadius: 99,
          }}>
            {label}: <b>{val}</b>
          </span>
        ))}
      </div>

      {/* ── Main Content ────────────────────────────────────────── */}
      <div style={{ flex: 1, padding: '28px 36px 24px', display: 'flex', flexDirection: 'column', gap: 22 }}>

        {/* ── 3-Column Hero ──────────────────────────────────────── */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 18 }}>

          {/* COLUMN 1 — What Changed */}
          <div style={{
            background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: 16,
            padding: '22px 22px', boxShadow: '0 1px 4px rgba(0,0,0,0.05)',
          }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 16 }}>
              What Changed
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {whatChanged.map((item, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
                  <div style={{
                    width: 7, height: 7, borderRadius: '50%', marginTop: 5, flexShrink: 0,
                    background: item.critical ? '#dc2626' : '#f59e0b',
                  }} />
                  <div style={{ fontSize: 12, lineHeight: 1.70, color: '#334155' }}>{item.text}</div>
                </div>
              ))}
            </div>
          </div>

          {/* COLUMN 2 — Top Decision This Week */}
          <div style={{
            background: '#ffffff', border: '1.5px solid #bfdbfe', borderRadius: 16,
            padding: '22px 22px', boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
          }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: '#2563eb', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 12 }}>
              Top Decision This Week
            </div>
            <div style={{ marginBottom: 10 }}>
              <span style={{ fontSize: 10, fontWeight: 700, background: '#fef9c3', color: '#ca8a04', border: '1px solid #fde68a', padding: '3px 10px', borderRadius: 99 }}>
                Decision Needed
              </span>
            </div>
            <div style={{ fontSize: 14, fontWeight: 800, color: '#0f172a', marginBottom: 10, lineHeight: 1.4 }}>
              {td.title}
            </div>
            {td.customer && (
              <div style={{ fontSize: 11, color: '#64748b', marginBottom: 6 }}>
                <b>({td.customer})</b>
              </div>
            )}
            <div style={{ fontSize: 11, color: '#475569', marginBottom: 8, lineHeight: 1.70 }}>
              <b>Why now:</b> {td.why_now || td.context}
            </div>
            <div style={{ fontSize: 11, color: '#475569', marginBottom: 14, lineHeight: 1.65 }}>
              <b>Impact:</b> {td.impact_range}&nbsp;&nbsp;<b>Confidence:</b> {td.confidence}
            </div>
            <div style={{ fontSize: 11, color: '#64748b', marginBottom: 14 }}>
              <b>Next:</b> {td.next_action || 'Set owner; approve guardrails; sponsor call'}
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              <button
                onClick={() => navigate(`/app/decisions/${td?.decision_id || ''}`)}
                style={{ flex: 1, fontSize: 12, fontWeight: 700, padding: '9px 0', borderRadius: 10, background: '#2563eb', color: '#ffffff', border: 'none', cursor: 'pointer' }}
              >
                Decide Now
              </button>
              <button
                onClick={() => navigate('/app/decisions')}
                style={{ flex: 1, fontSize: 12, fontWeight: 600, padding: '9px 0', borderRadius: 10, background: '#f8fafc', border: '1px solid #e2e8f0', color: '#334155', cursor: 'pointer' }}
              >
                All ({slice.decisions.length})
              </button>
            </div>
          </div>

          {/* COLUMN 3 — Value at Stake */}
          <div style={{
            background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: 16,
            padding: '22px 22px', boxShadow: '0 1px 4px rgba(0,0,0,0.05)',
          }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 16 }}>
              Value at Stake
            </div>
            {vasEntries.map((v, i) => (
              <div key={v.label} style={{
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                padding: '9px 0', borderBottom: i < vasEntries.length - 1 ? '1px solid #f1f5f9' : 'none',
              }}>
                <span style={{ fontSize: 11, color: '#334155' }}>{v.label}</span>
                <span style={{ fontSize: 12, fontWeight: 700, color: '#dc2626' }}>{v.value}</span>
              </div>
            ))}
            <div style={{ marginTop: 14, paddingTop: 12, borderTop: '2px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: 12, fontWeight: 700, color: '#0f172a' }}>Net</span>
              <span style={{ fontSize: 16, fontWeight: 900, color: '#dc2626' }}>{slice.valueAtStake.total_headline}</span>
            </div>
            <div style={{ marginTop: 10, fontSize: 11, background: '#fef2f2', border: '1px solid #fecaca', color: '#b91c1c', borderRadius: 8, padding: '7px 10px', lineHeight: 1.6 }}>
              Net: growth available — capacity + quality are the constraints
            </div>
          </div>

        </div>

        {/* ── Hub Navigation Cards (A / B / C — wireframe exact) ── */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
          <HubCard letter="A" to="/app/insights"  title="Insights Hub"   desc="Signals, decisions, impact indicators & downside risks"   color="#2563eb" borderColor="#bfdbfe" navigate={navigate} />
          <HubCard letter="B" to="/app/decisions" title="Decision Hub"   desc="Review, commit or hold pending decisions with evidence"   color="#7c3aed" borderColor="#ddd6fe" navigate={navigate} />
          <HubCard letter="C" to="/app/execution" title="Execution Hub"  desc="Track committed decisions · owner · status · value at stake" color="#0891b2" borderColor="#a5f3fc" navigate={navigate} />
        </div>

        {/* ── Bottom Action Row ───────────────────────────────────── */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: 4 }}>
          <button
            onClick={() => navigate('/app/board')}
            style={{
              fontSize: 13, fontWeight: 700, padding: '9px 22px', borderRadius: 10,
              background: '#ffffff', border: '1.5px solid #e2e8f0', color: '#334155',
              cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 7,
              boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
            }}
          >
            <svg width={14} height={14} fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            Board Brief
          </button>

          <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
            <button
              onClick={reset}
              style={{ fontSize: 12, fontWeight: 700, padding: '9px 18px', borderRadius: 10, background: '#f8fafc', border: '1px solid #e2e8f0', color: '#475569', cursor: 'pointer' }}
            >
              ↺ Reset
            </button>
            <button
              onClick={snap}
              style={{ fontSize: 12, fontWeight: 700, padding: '9px 18px', borderRadius: 10, background: '#eff6ff', border: '1px solid #bfdbfe', color: '#2563eb', cursor: 'pointer' }}
            >
              ⧉ Snap
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}

