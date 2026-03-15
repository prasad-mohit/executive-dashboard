import os

content = r"""import { kpiArray, signals, decisions, externalIndicators } from '../data/gisData';

const CATEGORY_COLOR = {
  'Supply Chain': { bg: '#eff6ff', color: '#2563eb', border: '#bfdbfe' },
  'Quality':      { bg: '#fef9c3', color: '#ca8a04', border: '#fde68a' },
  'Finance':      { bg: '#f0fdf4', color: '#16a34a', border: '#bbf7d0' },
  'Commercial':   { bg: '#f5f3ff', color: '#7c3aed', border: '#ddd6fe' },
  'Operations':   { bg: '#ecfeff', color: '#0891b2', border: '#a5f3fc' },
  'External':     { bg: '#fff7ed', color: '#ea580c', border: '#fed7aa' },
};

const SEV_COLOR = {
  Critical: { bg: '#fef2f2', color: '#dc2626', dot: '#dc2626' },
  High:     { bg: '#fff7ed', color: '#ea580c', dot: '#ea580c' },
  Medium:   { bg: '#fef9c3', color: '#ca8a04', dot: '#ca8a04' },
  Low:      { bg: '#f0fdf4', color: '#16a34a', dot: '#16a34a' },
};

const Cat = ({ cat }) => {
  const c = CATEGORY_COLOR[cat] || CATEGORY_COLOR['Operations'];
  return (
    <span
      className="text-xs font-semibold px-2 py-0.5 rounded-full"
      style={{ background: c.bg, color: c.color, border: `1px solid ${c.border}` }}
    >{cat}</span>
  );
};

const Sparkline = ({ color }) => {
  const pts = [20, 35, 15, 45, 28, 38, 25, 42, 18, 48].map((v, i) => `${i * 9},${50 - v}`).join(' ');
  return (
    <svg width="80" height="30" viewBox="0 0 81 50" fill="none" className="opacity-70">
      <polyline points={pts} stroke={color} strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
};

const KpiCard = ({ k }) => (
  <div
    className="rounded-xl p-4"
    style={{ background: '#ffffff', border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}
  >
    <div className="flex items-start justify-between mb-2">
      <span className="text-xs font-semibold leading-tight" style={{ color: '#64748b', maxWidth: '60%' }}>{k.label}</span>
      <span
        className="text-xs font-bold px-1.5 py-0.5 rounded-full flex-shrink-0"
        style={{ background: k.trend === 'up' ? '#f0fdf4' : '#fef2f2', color: k.trend === 'up' ? '#16a34a' : '#dc2626' }}
      >{k.delta}</span>
    </div>
    <div className="text-2xl font-black mb-1" style={{ color: '#0f172a' }}>{k.value}</div>
    <Sparkline color={k.trend === 'up' ? '#16a34a' : '#dc2626'}/>
  </div>
);

const SignalCard = ({ s }) => {
  const sev = SEV_COLOR[s.severity] || SEV_COLOR['Medium'];
  return (
    <div
      className="rounded-xl p-4"
      style={{
        background: '#ffffff',
        border: '1px solid #e2e8f0',
        borderLeft: `3px solid ${sev.dot}`,
        boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
      }}
    >
      <div className="flex items-center gap-2 mb-1.5">
        <div className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: sev.dot }}/>
        <Cat cat={s.category}/>
        <span
          className="ml-auto text-xs font-semibold px-1.5 py-0.5 rounded-full"
          style={{ background: sev.bg, color: sev.color }}
        >{s.severity}</span>
      </div>
      <div className="font-bold text-xs leading-snug mb-1" style={{ color: '#0f172a' }}>{s.title}</div>
      <div className="text-xs leading-relaxed" style={{ color: '#64748b' }}>{s.detail}</div>
    </div>
  );
};

export default function InsightsHub() {
  return (
    <div className="p-6 space-y-6" style={{ background: '#f4f6f9', minHeight: '100%' }}>

      {/* ── HEADING ── */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black" style={{ color: '#0f172a' }}>Insights Hub</h1>
          <p className="text-sm mt-0.5" style={{ color: '#64748b' }}>Signal synthesis from 12 live sources. Refreshed today at 06:00.</p>
        </div>
        <div
          className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full"
          style={{ background: '#f0fdf4', color: '#16a34a', border: '1px solid #bbf7d0' }}
        >
          <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse inline-block"/>
          Live
        </div>
      </div>

      {/* ── KPI STRIP ── */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        {kpiArray.map(k => <KpiCard key={k.id} k={k}/>)}
      </div>

      {/* ── 3-COL BODY ── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

        {/* Col 1: Decision Recommendations */}
        <div className="space-y-3">
          <div
            className="flex items-center justify-between pb-2"
            style={{ borderBottom: '1px solid #e2e8f0' }}
          >
            <span className="text-sm font-bold" style={{ color: '#0f172a' }}>Decision Recommendations</span>
            <span
              className="text-xs font-bold px-2 py-0.5 rounded-full"
              style={{ background: '#fef9c3', color: '#ca8a04', border: '1px solid #fde68a' }}
            >{decisions.length} open</span>
          </div>
          {decisions.map(d => (
            <div
              key={d.id}
              className="rounded-xl p-4"
              style={{ background: '#ffffff', border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}
            >
              <div className="flex items-center gap-2 mb-2">
                <Cat cat={d.category}/>
                <span
                  className="text-xs font-semibold ml-auto"
                  style={{ color: d.confidence === 'High' ? '#16a34a' : d.confidence === 'Medium-High' ? '#2563eb' : '#d97706' }}
                >{d.confidence} conf.</span>
              </div>
              <div className="font-bold text-xs leading-snug mb-1" style={{ color: '#0f172a' }}>{d.title}</div>
              <div className="text-xs" style={{ color: '#64748b' }}>{d.subtitle}</div>
              <div className="flex gap-1 mt-2">
                <span className="text-xs" style={{ color: '#94a3b8' }}>Impact: </span>
                <span className="text-xs font-semibold" style={{ color: '#0f172a' }}>{d.impact?.range || d.impact}</span>
              </div>
            </div>
          ))}
        </div>

        {/* Col 2: Signals */}
        <div className="space-y-3">
          <div
            className="flex items-center justify-between pb-2"
            style={{ borderBottom: '1px solid #e2e8f0' }}
          >
            <span className="text-sm font-bold" style={{ color: '#0f172a' }}>Signals</span>
            <span
              className="text-xs font-bold px-2 py-0.5 rounded-full"
              style={{ background: '#fef2f2', color: '#dc2626', border: '1px solid #fecaca' }}
            >2 critical</span>
          </div>
          {signals.map(s => <SignalCard key={s.id} s={s}/>)}
        </div>

        {/* Col 3: Impact Indicators + Risks */}
        <div className="space-y-4">
          <div>
            <div
              className="text-sm font-bold pb-2 mb-3"
              style={{ color: '#0f172a', borderBottom: '1px solid #e2e8f0' }}
            >Impact Indicators</div>
            <div className="space-y-3">
              {externalIndicators.slice(0, 4).map(ind => (
                <div
                  key={ind.label}
                  className="rounded-xl p-3 flex items-center gap-3"
                  style={{ background: '#ffffff', border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}
                >
                  <div
                    className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                    style={{ background: ind.alert ? '#dc2626' : '#16a34a' }}
                  />
                  <div className="flex-1 min-w-0">
                    <div className="text-xs font-semibold truncate" style={{ color: '#0f172a' }}>{ind.label}</div>
                    <div className="text-xs" style={{ color: '#94a3b8' }}>{ind.value}</div>
                  </div>
                  <div
                    className="text-xs font-bold"
                    style={{ color: ind.change?.startsWith('+') && !ind.change.includes('pp') ? '#dc2626' : '#16a34a' }}
                  >{ind.change}</div>
                </div>
              ))}
            </div>
          </div>

          <div>
            <div
              className="text-sm font-bold pb-2 mb-3"
              style={{ color: '#0f172a', borderBottom: '1px solid #e2e8f0' }}
            >Downside Risks</div>
            <div className="space-y-2">
              {[
                { text: 'Steel tariff escalation could add $28M cost by Q3', sev: 'Critical' },
                { text: 'Detroit line OTD at 74% — customer penalty clause triggers at 70%', sev: 'High' },
                { text: 'Competitor pricing 8% below on Braking for Ford renewal', sev: 'High' },
                { text: 'USDEUR appreciation eroding $4.2M margin on EU exports', sev: 'Medium' },
              ].map((r, i) => {
                const c = SEV_COLOR[r.sev];
                return (
                  <div
                    key={i}
                    className="rounded-lg p-3 flex items-start gap-2"
                    style={{ background: c.bg, border: `1px solid ${c.dot}20` }}
                  >
                    <div className="w-1.5 h-1.5 rounded-full mt-1 flex-shrink-0" style={{ background: c.dot }}/>
                    <span className="text-xs leading-relaxed" style={{ color: '#334155' }}>{r.text}</span>
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

out_path = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), 'src', 'pages', 'InsightsHub.jsx')
with open(out_path, 'w', encoding='utf-8') as f:
    f.write(content)
print('Written:', out_path)
