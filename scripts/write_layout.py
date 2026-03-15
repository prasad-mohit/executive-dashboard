import os

content = r"""import { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useFilters } from '../contexts/FilterContext';
import { company, filterOptions } from '../data/gisData';

/* ── SiBoNi Logo ── */
function SiBoNiLogo() {
  return (
    <div className="flex items-center gap-2.5">
      <div
        className="w-8 h-8 rounded-lg flex items-center justify-center font-black text-sm text-white select-none"
        style={{ background: 'linear-gradient(135deg, #2563eb, #4f46e5)' }}
      >
        Si
      </div>
      <span className="font-bold text-base tracking-tight" style={{ color: '#0f172a' }}>
        SiBoNi
      </span>
    </div>
  );
}

/* ── Nav items ── */
const NAV_ITEMS = [
  {
    label: 'Home',
    path: '/app/home',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" className="w-[18px] h-[18px]" stroke="currentColor" strokeWidth="1.8">
        <path d="M3 9.5L12 3l9 6.5V20a1 1 0 01-1 1H4a1 1 0 01-1-1V9.5z"/>
        <path d="M9 21V12h6v9"/>
      </svg>
    ),
  },
  {
    label: 'Insights Hub',
    path: '/app/insights',
    badge: 'A',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" className="w-[18px] h-[18px]" stroke="currentColor" strokeWidth="1.8">
        <path d="M3 20h18M8 20V10M12 20V4M16 20v-6"/>
      </svg>
    ),
  },
  {
    label: 'Decision Hub',
    path: '/app/decisions',
    badge: 'B',
    alert: 4,
    icon: (
      <svg viewBox="0 0 24 24" fill="none" className="w-[18px] h-[18px]" stroke="currentColor" strokeWidth="1.8">
        <circle cx="12" cy="12" r="9"/>
        <path d="M9 12l2 2 4-4"/>
      </svg>
    ),
  },
  {
    label: 'Execution Hub',
    path: '/app/execution',
    badge: 'C',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" className="w-[18px] h-[18px]" stroke="currentColor" strokeWidth="1.8">
        <path d="M9 11l3 3L22 4"/>
        <path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11"/>
      </svg>
    ),
  },
];

/* ── Sidebar ── */
function SiBoNiSidebar({ onBoardBrief }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const handleLogout = () => { logout(); navigate('/login'); };

  return (
    <aside
      className="flex flex-col flex-shrink-0"
      style={{
        width: 220,
        background: '#ffffff',
        borderRight: '1px solid #e2e8f0',
        height: '100vh',
      }}
    >
      {/* Logo */}
      <div className="px-5 py-5" style={{ borderBottom: '1px solid #f1f5f9' }}>
        <SiBoNiLogo />
        <div className="mt-1.5 text-xs font-medium truncate" style={{ color: '#94a3b8' }}>
          {company.name}
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
        {NAV_ITEMS.map(item => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150
              ${isActive ? '' : 'hover:bg-slate-50'}`
            }
            style={({ isActive }) => isActive
              ? { background: '#eff6ff', color: '#2563eb' }
              : { color: '#64748b' }
            }
          >
            <span className="flex-shrink-0">{item.icon}</span>
            <span className="flex-1 truncate">{item.label}</span>
            {item.badge && (
              <span
                className="text-xs font-bold px-1.5 py-0.5 rounded flex-shrink-0"
                style={{ background: '#eff6ff', color: '#2563eb', fontSize: '10px' }}
              >
                {item.badge}
              </span>
            )}
            {item.alert && (
              <span
                className="text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0"
                style={{ background: '#fef2f2', color: '#dc2626', fontSize: '10px' }}
              >
                {item.alert}
              </span>
            )}
          </NavLink>
        ))}

        <div className="my-3" style={{ borderTop: '1px solid #f1f5f9' }} />

        {/* Board Brief */}
        <button
          onClick={onBoardBrief}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all hover:bg-slate-50"
          style={{ color: '#64748b' }}
        >
          <svg viewBox="0 0 24 24" fill="none" className="w-[18px] h-[18px] flex-shrink-0" stroke="currentColor" strokeWidth="1.8">
            <path d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
          </svg>
          <span className="flex-1 text-left truncate">Board Brief</span>
          <span
            className="text-xs px-1.5 py-0.5 rounded font-medium"
            style={{ background: '#fffbeb', color: '#d97706', fontSize: '10px' }}
          >
            PDF
          </span>
        </button>
      </nav>

      {/* User */}
      <div className="px-3 pb-4 pt-3" style={{ borderTop: '1px solid #f1f5f9' }}>
        <div className="flex items-center gap-3 px-2 py-2 rounded-xl hover:bg-slate-50 transition-all cursor-pointer">
          <div
            className="w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold flex-shrink-0"
            style={{ background: '#eff6ff', color: '#2563eb' }}
          >
            {user?.avatar || user?.name?.substring(0, 2).toUpperCase() || 'MG'}
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-xs font-semibold truncate" style={{ color: '#0f172a' }}>
              {user?.name || 'Marcus Gaksh'}
            </div>
            <div className="text-xs truncate" style={{ color: '#94a3b8' }}>
              {user?.title || 'CEO'}
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="transition-colors flex-shrink-0"
            style={{ color: '#94a3b8' }}
            title="Logout"
          >
            <svg viewBox="0 0 24 24" fill="none" className="w-4 h-4" stroke="currentColor" strokeWidth="1.8">
              <path d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"/>
            </svg>
          </button>
        </div>
      </div>
    </aside>
  );
}

/* ── Filter Bar ── */
function FilterBar() {
  const { filters, updateFilter } = useFilters();

  const filterDefs = [
    { key: 'country',     label: 'Region',      options: filterOptions.country     },
    { key: 'site',        label: 'Plant',        options: filterOptions.site        },
    { key: 'segment',     label: 'Segment',      options: filterOptions.segment     },
    { key: 'productLine', label: 'Product Line', options: filterOptions.productLine },
    { key: 'timeRange',   label: 'Time Range',   options: filterOptions.timeRange   },
  ];

  return (
    <div
      className="flex items-center gap-3 flex-wrap"
      style={{
        padding: '10px 20px',
        borderBottom: '1px solid #e2e8f0',
        background: '#f8fafc',
      }}
    >
      {filterDefs.map(({ key, label, options }) => (
        <div key={key} className="flex items-center gap-1.5">
          <span className="text-xs font-medium flex-shrink-0" style={{ color: '#94a3b8' }}>
            {label}:
          </span>
          <select
            value={filters[key]}
            onChange={e => updateFilter(key, e.target.value)}
            className="text-xs font-semibold rounded-lg px-2.5 py-1.5 outline-none cursor-pointer transition-all"
            style={{
              background: '#ffffff',
              color: '#0f172a',
              border: '1px solid #e2e8f0',
              fontSize: '11px',
            }}
          >
            {options.map(opt => (
              <option key={opt} value={opt}>{opt}</option>
            ))}
          </select>
        </div>
      ))}
    </div>
  );
}

/* ── Meta bar ── */
function MetaBar({ onSnap, onReset }) {
  const { filters } = useFilters();
  return (
    <div
      className="flex items-center justify-between px-5 py-2.5"
      style={{
        background: '#ffffff',
        borderBottom: '1px solid #e2e8f0',
      }}
    >
      <div className="flex items-center gap-4">
        {/* Company */}
        <div className="flex items-center gap-2">
          <div
            className="w-6 h-6 rounded font-black text-xs flex items-center justify-center text-white"
            style={{ background: 'linear-gradient(135deg, #2563eb, #4f46e5)' }}
          >
            G
          </div>
          <span className="text-sm font-semibold" style={{ color: '#0f172a' }}>{company.name}</span>
          <span className="text-xs" style={{ color: '#e2e8f0' }}>|</span>
          <span className="text-xs" style={{ color: '#94a3b8' }}>{company.ticker}</span>
        </div>

        <div className="h-4 w-px" style={{ background: '#e2e8f0' }} />

        <div className="text-xs flex items-center gap-3" style={{ color: '#94a3b8' }}>
          <span className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse inline-block" />
            Last updated: 2h ago
          </span>
          <span style={{ color: '#e2e8f0' }}>·</span>
          <span>Sources: Internal + External signals</span>
          <span style={{ color: '#e2e8f0' }}>·</span>
          <span className="flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-500 inline-block" />
            Confidence model: enabled
          </span>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <button
          onClick={onReset}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all hover:bg-slate-100"
          style={{ background: '#f8fafc', border: '1px solid #e2e8f0', color: '#64748b' }}
        >
          ↺ Reset
        </button>
        <button
          onClick={onSnap}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all hover:bg-blue-50"
          style={{ background: '#eff6ff', border: '1px solid #bfdbfe', color: '#2563eb' }}
        >
          ⧉ Snap
        </button>
      </div>
    </div>
  );
}

/* ── Board Brief Modal ── */
function BoardBriefModal({ onClose }) {
  const { filters } = useFilters();
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      style={{ background: 'rgba(15,23,42,0.35)', backdropFilter: 'blur(4px)' }}
      onClick={onClose}
    >
      <div
        className="rounded-2xl p-8 max-w-lg w-full mx-4 relative bg-white"
        style={{ border: '1px solid #e2e8f0', boxShadow: '0 20px 60px rgba(0,0,0,0.15)' }}
        onClick={e => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 transition-colors"
          style={{ color: '#94a3b8' }}
        >
          ✕
        </button>

        <div className="flex items-center gap-3 mb-6">
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center text-xl"
            style={{ background: '#eff6ff' }}
          >
            📋
          </div>
          <div>
            <h2 className="text-lg font-bold" style={{ color: '#0f172a' }}>Board Brief</h2>
            <p className="text-xs" style={{ color: '#94a3b8' }}>Export executive snapshot</p>
          </div>
        </div>

        <div className="space-y-3 mb-6">
          <div className="rounded-xl p-4" style={{ background: '#f8fafc', border: '1px solid #e2e8f0' }}>
            <div className="text-xs font-semibold mb-2 uppercase tracking-wider" style={{ color: '#94a3b8' }}>Context</div>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div><span style={{ color: '#94a3b8' }}>Company:</span> <span className="font-medium" style={{ color: '#0f172a' }}>{company.name}</span></div>
              <div><span style={{ color: '#94a3b8' }}>As of:</span> <span className="font-medium" style={{ color: '#0f172a' }}>Mar 14, 2026</span></div>
              <div><span style={{ color: '#94a3b8' }}>Region:</span> <span className="font-medium" style={{ color: '#0f172a' }}>{filters.country}</span></div>
              <div><span style={{ color: '#94a3b8' }}>Plant:</span> <span className="font-medium" style={{ color: '#0f172a' }}>{filters.site}</span></div>
            </div>
          </div>

          <div className="rounded-xl p-4" style={{ background: '#f8fafc', border: '1px solid #e2e8f0' }}>
            <div className="text-xs font-semibold mb-2 uppercase tracking-wider" style={{ color: '#94a3b8' }}>Include in brief</div>
            {['Top Decision + Why Now', 'Value at Stake Summary', 'KPI Snapshot', 'Top 3 Signals', 'Execution Status'].map(item => (
              <label key={item} className="flex items-center gap-2.5 py-1.5 cursor-pointer">
                <input type="checkbox" defaultChecked style={{ accentColor: '#2563eb' }} />
                <span className="text-sm" style={{ color: '#334155' }}>{item}</span>
              </label>
            ))}
          </div>
        </div>

        <div className="flex gap-3">
          <button
            className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-white"
            style={{ background: 'linear-gradient(135deg, #2563eb, #4f46e5)' }}
          >
            📧 Send to Email
          </button>
          <button
            className="flex-1 py-2.5 rounded-xl text-sm font-semibold"
            style={{ background: '#f8fafc', border: '1px solid #e2e8f0', color: '#2563eb' }}
          >
            📥 Download PDF
          </button>
        </div>
      </div>
    </div>
  );
}

/* ── Snap Toast ── */
function SnapToast({ onClose }) {
  return (
    <div
      className="fixed bottom-6 right-6 z-50 rounded-xl px-5 py-4 flex items-center gap-4 bg-white"
      style={{ border: '1px solid #e2e8f0', boxShadow: '0 8px 24px rgba(0,0,0,0.1)', minWidth: 300 }}
    >
      <div className="text-xl">⧉</div>
      <div className="flex-1">
        <div className="text-sm font-semibold" style={{ color: '#0f172a' }}>Snapshot captured</div>
        <div className="text-xs mt-0.5" style={{ color: '#94a3b8' }}>Ready to include in Board Brief</div>
      </div>
      <button onClick={onClose} style={{ color: '#94a3b8' }}>✕</button>
    </div>
  );
}

/* ── Main Layout ── */
export default function SiBoNiLayout({ children }) {
  const { reset, snap, snapVisible, dismissSnap } = useFilters();
  const [boardBriefOpen, setBoardBriefOpen] = useState(false);

  const handleSnap = () => {
    snap();
    setTimeout(dismissSnap, 3000);
  };

  return (
    <div className="flex h-screen overflow-hidden" style={{ background: '#f4f6f9' }}>
      <SiBoNiSidebar onBoardBrief={() => setBoardBriefOpen(true)} />

      <div className="flex-1 flex flex-col overflow-hidden">
        <MetaBar onSnap={handleSnap} onReset={reset} />
        <FilterBar />
        <main className="flex-1 overflow-y-auto" style={{ background: '#f4f6f9' }}>
          {children}
        </main>
      </div>

      {boardBriefOpen && <BoardBriefModal onClose={() => setBoardBriefOpen(false)} />}
      {snapVisible && <SnapToast onClose={dismissSnap} />}
    </div>
  );
}
"""

out_path = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), 'src', 'components', 'SiBoNiLayout.jsx')
with open(out_path, 'w', encoding='utf-8') as f:
    f.write(content)
print('Written:', out_path)
