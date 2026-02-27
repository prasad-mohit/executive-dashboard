import { NavLink } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const navItems = [
  {
    name: 'Dashboard',
    path: '/dashboard',
    permission: null,
    icon: (
      <svg viewBox="0 0 24 24" fill="none" className="w-5 h-5" stroke="currentColor" strokeWidth="1.8">
        <rect x="3" y="3" width="7" height="7" rx="1.5"/>
        <rect x="14" y="3" width="7" height="7" rx="1.5"/>
        <rect x="14" y="14" width="7" height="7" rx="1.5"/>
        <rect x="3" y="14" width="7" height="7" rx="1.5"/>
      </svg>
    ),
    badge: null,
  },
  {
    name: 'Decisions',
    path: '/decisions',
    permission: null,
    icon: (
      <svg viewBox="0 0 24 24" fill="none" className="w-5 h-5" stroke="currentColor" strokeWidth="1.8">
        <circle cx="12" cy="12" r="9"/>
        <path d="M12 7v5l3 3"/>
      </svg>
    ),
    badge: '3',
  },
  {
    name: 'History',
    path: '/history',
    permission: 'view_team',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" className="w-5 h-5" stroke="currentColor" strokeWidth="1.8">
        <path d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
      </svg>
    ),
    badge: null,
  },
  {
    name: 'Analytics',
    path: '/analytics',
    permission: 'view_team',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" className="w-5 h-5" stroke="currentColor" strokeWidth="1.8">
        <path d="M3 20h18M8 20V10M12 20V4M16 20v-6"/>
      </svg>
    ),
    badge: null,
  },
  {
    name: 'Prompts',
    path: '/prompts',
    permission: null,
    icon: (
      <svg viewBox="0 0 24 24" fill="none" className="w-5 h-5" stroke="currentColor" strokeWidth="1.8">
        <circle cx="12" cy="12" r="9"/>
        <path d="M12 7v5l3 3"/>
        <path d="M5.6 5.6A9 9 0 0 0 3 12"/>
        <path d="M3 12l2-2-2-2"/>
      </svg>
    ),
    badge: 'NEW',
  },
  {
    name: 'Docs',
    path: '/docs',
    permission: null,
    icon: (
      <svg viewBox="0 0 24 24" fill="none" className="w-5 h-5" stroke="currentColor" strokeWidth="1.8">
        <path d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"/>
      </svg>
    ),
    badge: null,
  },
  {
    name: 'Settings',
    path: '/settings',
    permission: 'view_all',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" className="w-5 h-5" stroke="currentColor" strokeWidth="1.8">
        <path d="M12 15a3 3 0 100-6 3 3 0 000 6z"/>
        <path d="M19.622 10.395l-1.097-2.65L20 6l-2-2-1.735 1.483-2.707-1.113L12.935 2h-1.954l-.632 2.401-2.645 1.115L6 4 4 6l1.453 1.789-1.08 2.657L2 11v2l2.401.655 1.106 2.694L4 18l2 2 1.793-1.487 2.645 1.106.666 2.381h1.954l.64-2.382 2.704-1.113L18 20l2-2-1.484-1.75 1.098-2.688L22 13v-2l-2.378-.605z"/>
      </svg>
    ),
    badge: null,
  },
];

const agents = [
  { name: 'Data Aggregator', color: '#3b82f6', pulse: true },
  { name: 'Risk Analyzer',   color: '#f59e0b', pulse: true },
  { name: 'Recommender',     color: '#10b981', pulse: true },
  { name: 'Priority Scorer', color: '#8b5cf6', pulse: false },
];

export default function Sidebar() {
  const { user, hasPermission } = useAuth();
  const filteredNav = navItems.filter(item => !item.permission || hasPermission(item.permission));
  const personaCfg = user?.personaConfig;
  const accentColor = personaCfg?.accentColor || '#3b82f6';

  return (
    <aside
      className="w-64 flex-shrink-0 flex flex-col min-h-screen"
      style={{
        background: 'linear-gradient(180deg, #050c1a 0%, #020817 100%)',
        borderRight: '1px solid rgba(30,58,95,0.5)',
      }}
    >
      {/* ── Brand ── */}
      <div className="px-5 pt-6 pb-4" style={{ borderBottom: '1px solid rgba(30,58,95,0.4)' }}>
        <div className="flex items-center gap-2.5">
          <div
            className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0"
            style={{
              background: `linear-gradient(135deg, #2563eb, #06b6d4)`,
              boxShadow: '0 0 16px rgba(37,99,235,0.4)',
            }}
          >
            <span className="text-lg">⚡</span>
          </div>
          <div>
            <div className="text-sm font-bold text-white tracking-tight">Executive OS</div>
            <div className="text-xs" style={{ color: 'rgba(148,163,184,0.6)' }}>Decision Intelligence</div>
          </div>
        </div>
      </div>

      {/* ── User / Persona Card ── */}
      <div className="px-4 py-4" style={{ borderBottom: '1px solid rgba(30,58,95,0.4)' }}>
        <div
          className="rounded-xl p-3"
          style={{
            background: `linear-gradient(135deg, rgba(${accentColor === '#f59e0b' ? '245,158,11' : accentColor === '#3b82f6' ? '59,130,246' : '139,92,246'},0.08), rgba(5,12,26,0.8))`,
            border: `1px solid ${accentColor}25`,
          }}
        >
          <div className="flex items-center gap-3">
            {/* Avatar */}
            <div
              className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0"
              style={{
                background: `linear-gradient(135deg, ${accentColor}40, ${accentColor}20)`,
                border: `1.5px solid ${accentColor}50`,
                color: accentColor,
              }}
            >
              {user?.avatar || user?.name?.charAt(0) || 'U'}
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-semibold text-white truncate">{user?.name}</div>
              <div className="text-xs truncate" style={{ color: accentColor + 'cc' }}>
                {user?.title || user?.role}
              </div>
            </div>
            <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: '#10b981', boxShadow: '0 0 6px #10b981' }} />
          </div>
          {/* Persona badge */}
          <div className="mt-2 flex items-center gap-1.5">
            <span className="text-sm">{personaCfg?.icon}</span>
            <span className="text-xs" style={{ color: accentColor + 'bb' }}>{personaCfg?.label}</span>
          </div>
        </div>
      </div>

      {/* ── Navigation ── */}
      <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
        <div className="text-xs font-semibold uppercase tracking-wider mb-3 px-2" style={{ color: 'rgba(71,85,105,0.8)' }}>
          Navigation
        </div>
        {filteredNav.map(item => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) => `
              flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 group relative
              ${isActive ? 'text-white' : 'text-slate-500 hover:text-slate-300'}
            `}
            style={({ isActive }) => isActive ? {
              background: `linear-gradient(135deg, ${accentColor}18, rgba(15,31,61,0.8))`,
              border: `1px solid ${accentColor}30`,
              boxShadow: `0 0 12px ${accentColor}10`,
            } : {
              border: '1px solid transparent',
            }}
          >
            {({ isActive }) => (
              <>
                {/* Active indicator bar */}
                {isActive && (
                  <div
                    className="absolute left-0 top-2 bottom-2 w-0.5 rounded-full"
                    style={{ background: accentColor, boxShadow: `0 0 8px ${accentColor}` }}
                  />
                )}
                <span
                  className="transition-colors duration-200"
                  style={{ color: isActive ? accentColor : undefined }}
                >
                  {item.icon}
                </span>
                <span className="text-sm font-medium flex-1">{item.name}</span>
                {item.badge && (
                  <span
                    className="text-xs px-1.5 py-0.5 rounded-full font-semibold"
                    style={{ background: `${accentColor}25`, color: accentColor }}
                  >
                    {item.badge}
                  </span>
                )}
              </>
            )}
          </NavLink>
        ))}
      </nav>

      {/* ── AI Agents Status ── */}
      <div className="px-4 py-4" style={{ borderTop: '1px solid rgba(30,58,95,0.4)' }}>
        <div className="text-xs font-semibold uppercase tracking-wider mb-3" style={{ color: 'rgba(71,85,105,0.8)' }}>
          AI Agents
        </div>
        <div className="space-y-2">
          {agents.map(agent => (
            <div key={agent.name} className="flex items-center gap-2.5">
              <div className="relative flex-shrink-0">
                <div className="w-1.5 h-1.5 rounded-full" style={{ background: agent.color }} />
                {agent.pulse && (
                  <div
                    className="absolute inset-0 rounded-full animate-ping"
                    style={{ background: agent.color, opacity: 0.4 }}
                  />
                )}
              </div>
              <span className="text-xs text-slate-500 truncate">{agent.name}</span>
              <span className="ml-auto text-xs" style={{ color: agent.color + 'bb' }}>
                {agent.pulse ? 'active' : 'idle'}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* ── Footer ── */}
      <div className="px-4 pb-5">
        <div
          className="rounded-xl p-3 text-center"
          style={{ background: 'rgba(15,31,61,0.4)', border: '1px solid rgba(30,58,95,0.3)' }}
        >
          <div className="text-xs text-slate-600">Executive OS v2.0.0</div>
          <div className="text-xs text-slate-700 mt-0.5">© 2026 All rights reserved</div>
        </div>
      </div>
    </aside>
  );
}
