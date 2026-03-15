import { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { company } from '../data/gisData';
import { useFilters } from '../contexts/FilterContext';

const NAV = [
  { to: '/app/home',      label: 'Home',          icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6' },
  { to: '/app/insights',  label: 'Insights Hub',  icon: 'M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z' },
  { to: '/app/decisions', label: 'Decision Hub',  icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4' },
  { to: '/app/execution', label: 'Execution Hub', icon: 'M13 10V3L4 14h7v7l9-11h-7z' },
];

const FILTERS = {
  region:      ['Global', 'North America', 'APAC', 'Europe'],
  site:        ['All Sites', 'Detroit', 'Pune', 'Michigan'],
  segment:     ['All Segments', 'OEM', 'Aftermarket', 'Direct'],
  productLine: ['All Lines', 'Car Axle', 'Braking System', 'Steering Column'],
  timeRange:   ['Last 7 Days', 'Last 30 Days', 'Last Quarter', 'YTD', 'Custom'],
};

export default function SiBoNiLayout({ children }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { filters, updateFilter } = useFilters();
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const handleLogout = () => { logout(); navigate('/login'); };

  return (
    <div className="flex h-screen overflow-hidden" style={{ background: '#f4f6f9' }}>

      {/* ── SIDEBAR ── */}
      <aside
        className="flex flex-col flex-shrink-0 transition-all duration-200"
        style={{
          width: sidebarOpen ? 224 : 64,
          background: '#ffffff',
          borderRight: '1px solid #e2e8f0',
          minHeight: '100vh',
        }}
      >
        {/* Logo */}
        <div
          className="flex items-center gap-3 px-4 py-4"
          style={{ borderBottom: '1px solid #e2e8f0', minHeight: 56 }}
        >
          <div
            className="w-8 h-8 rounded-xl flex items-center justify-center font-black text-sm text-white flex-shrink-0"
            style={{ background: 'linear-gradient(135deg,#2563eb,#4f46e5)' }}
          >Si</div>
          {sidebarOpen && (
            <div>
              <div className="font-bold text-sm leading-tight" style={{ color: '#0f172a' }}>SiBoNi</div>
              <div className="text-xs" style={{ color: '#94a3b8' }}>CXO Cockpit</div>
            </div>
          )}
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="ml-auto rounded-lg p-1 transition-colors hover:bg-slate-100"
            style={{ color: '#94a3b8' }}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              {sidebarOpen
                ? <path strokeLinecap="round" strokeLinejoin="round" d="M11 19l-7-7 7-7m8 14l-7-7 7-7"/>
                : <path strokeLinecap="round" strokeLinejoin="round" d="M13 5l7 7-7 7M5 5l7 7-7 7"/>}
            </svg>
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 py-3 space-y-0.5 px-2">
          {NAV.map(item => (
            <NavLink
              key={item.to}
              to={item.to}
              className="flex items-center gap-3 rounded-xl transition-all px-3 py-2.5"
              style={({ isActive }) => ({
                background: isActive ? '#eff6ff' : 'transparent',
                color: isActive ? '#2563eb' : '#64748b',
                fontWeight: isActive ? '700' : '500',
                fontSize: '0.8125rem',
                textDecoration: 'none',
              })}
            >
              <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" strokeWidth={1.75} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d={item.icon}/>
              </svg>
              {sidebarOpen && <span>{item.label}</span>}
            </NavLink>
          ))}
        </nav>

        {/* User */}
        <div style={{ borderTop: '1px solid #e2e8f0' }} className="p-3">
          {sidebarOpen ? (
            <div className="flex items-center gap-2">
              <div
                className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white flex-shrink-0"
                style={{ background: 'linear-gradient(135deg,#2563eb,#4f46e5)' }}
              >
                {user?.name?.[0] || 'U'}
              </div>
              <div className="min-w-0 flex-1">
                <div className="text-xs font-bold truncate" style={{ color: '#0f172a' }}>{user?.name || 'User'}</div>
                <div className="text-xs truncate" style={{ color: '#94a3b8' }}>{user?.role || ''}</div>
              </div>
              <button
                onClick={handleLogout}
                className="ml-auto p-1.5 rounded-lg hover:bg-red-50 transition-colors"
                style={{ color: '#94a3b8' }}
                title="Sign out"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"/>
                </svg>
              </button>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-2">
              <div
                className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white"
                style={{ background: 'linear-gradient(135deg,#2563eb,#4f46e5)' }}
              >
                {user?.name?.[0] || 'U'}
              </div>
              <button
                onClick={handleLogout}
                className="p-1.5 rounded-lg hover:bg-red-50 transition-colors"
                style={{ color: '#94a3b8' }}
                title="Sign out"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"/>
                </svg>
              </button>
            </div>
          )}
        </div>
      </aside>

      {/* ── MAIN ── */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">

        {/* Filter bar */}
        <div
          className="flex items-center gap-3 px-6 py-2.5 flex-shrink-0 flex-wrap"
          style={{ background: '#ffffff', borderBottom: '1px solid #e2e8f0', minHeight: 52 }}
        >
          {Object.entries(FILTERS).map(([key, opts]) => (
            <select
              key={key}
              value={filters[key] || opts[0]}
              onChange={e => updateFilter(key, e.target.value)}
              className="text-xs rounded-lg px-3 py-1.5 outline-none transition-all"
              style={{
                background: '#f8fafc',
                border: '1px solid #e2e8f0',
                color: '#334155',
                fontWeight: '500',
              }}
            >
              {opts.map(o => <option key={o} value={o}>{o}</option>)}
            </select>
          ))}
          <div className="flex-1"/>
          <span
            className="text-xs font-semibold px-3 py-1.5 rounded-full"
            style={{ background: '#eff6ff', color: '#2563eb', border: '1px solid #bfdbfe' }}
          >
            {company.name}
          </span>
          <span
            className="text-xs font-semibold px-3 py-1.5 rounded-full"
            style={{ background: '#f0fdf4', color: '#16a34a', border: '1px solid #bbf7d0' }}
          >
            Live
          </span>
        </div>

        {/* Meta bar */}
        <div
          className="flex items-center gap-6 px-6 py-1.5 flex-shrink-0"
          style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}
        >
          {[
            { label: 'Revenue Run-Rate', value: '$2.34B', delta: '+4.2%', up: true },
            { label: 'On-Time Delivery', value: '89.1%', delta: '-2.4pp', up: false },
            { label: 'Quality (PPM)',    value: '47',     delta: '+3 MoM', up: false },
            { label: 'EBITDA Margin',   value: '18.3%',  delta: '+0.8pp', up: true },
            { label: 'Open Decisions',  value: '4',      delta: '2 urgent', up: false },
          ].map(m => (
            <div key={m.label} className="flex items-center gap-1.5">
              <span className="text-xs" style={{ color: '#94a3b8' }}>{m.label}</span>
              <span className="text-xs font-bold" style={{ color: '#0f172a' }}>{m.value}</span>
              <span className="text-xs font-semibold" style={{ color: m.up ? '#16a34a' : '#dc2626' }}>{m.delta}</span>
            </div>
          ))}
        </div>

        {/* Page content */}
        <div className="flex-1 overflow-auto">
          {children}
        </div>
      </div>
    </div>
  );
}
