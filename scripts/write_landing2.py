import os

content = r"""import { useNavigate } from 'react-router-dom';
import { company } from '../data/gisData';

const FEATURES = [
  {
    title: 'Daily CXO Brief',
    icon: 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z',
    color: '#2563eb',
    bg: '#eff6ff',
    desc: 'Signal synthesis from 12 live sources. What changed overnight and why it matters.',
  },
  {
    title: 'Decision Hub',
    icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4',
    color: '#7c3aed',
    bg: '#f5f3ff',
    desc: 'Every open decision with HOLD / COMMIT and a path to execution. Never lose a decision again.',
  },
  {
    title: 'Execution Hub',
    icon: 'M13 10V3L4 14h7v7l9-11h-7z',
    color: '#0891b2',
    bg: '#ecfeff',
    desc: 'Track committed decisions through milestones, owners, and completion dates.',
  },
];

export default function LandingPage() {
  const navigate = useNavigate();
  return (
    <div
      className="min-h-screen"
      style={{ background: '#f4f6f9' }}
    >

      {/* ── HEADER ── */}
      <header
        className="flex items-center gap-4 px-12 py-4"
        style={{ background: '#ffffff', borderBottom: '1px solid #e2e8f0' }}
      >
        <div
          className="w-9 h-9 rounded-xl flex items-center justify-center font-black text-sm text-white flex-shrink-0"
          style={{ background: 'linear-gradient(135deg,#2563eb,#4f46e5)' }}
        >Si</div>
        <div>
          <span className="font-bold text-base" style={{ color: '#0f172a' }}>SiBoNi</span>
          <span className="ml-2 text-xs font-semibold text-gray-400 tracking-wide uppercase">CXO Cockpit</span>
        </div>
        <div className="flex-1"/>
        <span className="text-xs font-semibold px-3 py-1 rounded-full" style={{ background: '#eff6ff', color: '#2563eb', border: '1px solid #bfdbfe' }}>
          {company.name}
        </span>
        <button
          onClick={() => navigate('/login')}
          className="text-sm font-bold px-6 py-2 rounded-xl text-white transition-opacity hover:opacity-90"
          style={{ background: 'linear-gradient(135deg,#2563eb,#4f46e5)' }}
        >
          Sign in
        </button>
      </header>

      {/* ── HERO ── */}
      <section className="px-12 pt-20 pb-16 max-w-5xl mx-auto text-center">
        <div
          className="inline-flex items-center gap-2 text-xs font-semibold px-4 py-1.5 rounded-full mb-6"
          style={{ background: '#eff6ff', color: '#2563eb', border: '1px solid #bfdbfe' }}
        >
          <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse inline-block"/>
          Decision Intelligence Platform for Manufacturing
        </div>

        <h1
          className="text-5xl font-black mb-5 leading-tight"
          style={{ color: '#0f172a' }}
        >
          Stop reading dashboards.<br/>
          <span style={{ color: '#2563eb' }}>Start making decisions.</span>
        </h1>

        <p className="text-lg mb-10 max-w-2xl mx-auto" style={{ color: '#475569' }}>
          SiBoNi synthesises your internal data and external signals into a daily brief
          so executives at {company.name} spend time deciding, not searching.
        </p>

        <div className="flex items-center justify-center gap-4">
          <button
            onClick={() => navigate('/login')}
            className="text-sm font-bold px-8 py-3.5 rounded-xl text-white transition-opacity hover:opacity-90"
            style={{ background: 'linear-gradient(135deg,#2563eb,#4f46e5)' }}
          >
            Open Cockpit
          </button>
          <button
            onClick={() => navigate('/login')}
            className="text-sm font-semibold px-8 py-3.5 rounded-xl transition-all"
            style={{ background: '#ffffff', border: '1.5px solid #e2e8f0', color: '#0f172a' }}
          >
            View Demo
          </button>
        </div>
      </section>

      {/* ── FEATURES ── */}
      <section className="px-12 pb-16 max-w-5xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {FEATURES.map(f => (
            <div
              key={f.title}
              className="rounded-2xl p-6 transition-all hover:-translate-y-0.5 hover:shadow-md cursor-pointer"
              style={{ background: '#ffffff', border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}
              onClick={() => navigate('/login')}
            >
              <div
                className="w-11 h-11 rounded-xl flex items-center justify-center mb-4"
                style={{ background: f.bg }}
              >
                <svg className="w-5 h-5" fill="none" stroke={f.color} strokeWidth={1.75} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d={f.icon}/>
                </svg>
              </div>
              <div className="font-bold text-sm mb-1.5" style={{ color: '#0f172a' }}>{f.title}</div>
              <div className="text-xs leading-relaxed" style={{ color: '#64748b' }}>{f.desc}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── STATS ── */}
      <section
        className="px-12 py-10 mx-12 mb-16 rounded-2xl"
        style={{ background: '#ffffff', border: '1px solid #e2e8f0' }}
      >
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center max-w-4xl mx-auto">
          {[
            { value: '12', label: 'Live data sources' },
            { value: '$2.34B', label: 'Revenue managed' },
            { value: '4', label: 'Open decisions today' },
            { value: '89%', label: 'On-time delivery' },
          ].map(s => (
            <div key={s.label}>
              <div className="text-3xl font-black mb-1" style={{ color: '#2563eb' }}>{s.value}</div>
              <div className="text-xs" style={{ color: '#94a3b8' }}>{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer
        className="px-12 py-6"
        style={{ borderTop: '1px solid #e2e8f0', background: '#ffffff' }}
      >
        <div className="flex items-center justify-between max-w-5xl mx-auto">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-lg bg-blue-600 flex items-center justify-center text-white text-xs font-bold">Si</div>
            <span className="text-xs" style={{ color: '#94a3b8' }}>SiBoNi &copy; 2026 Confidential</span>
          </div>
          <div className="text-xs" style={{ color: '#94a3b8' }}>
            {company.name} &middot; {company.industry} &middot; Prototype v1.0
          </div>
        </div>
      </footer>

    </div>
  );
}
"""

out_path = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), 'src', 'pages', 'LandingPage.jsx')
with open(out_path, 'w', encoding='utf-8') as f:
    f.write(content)
print('Written:', out_path)
