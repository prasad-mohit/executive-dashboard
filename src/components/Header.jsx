import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useWorkspace } from '../contexts/WorkspaceContext';

export default function Header() {
  const { user, logout } = useAuth();
  const { calculateMonthlyCost } = useWorkspace();
  const navigate = useNavigate();
  const [time, setTime] = useState(new Date());
  const [notifications] = useState(3);
  const [showNotifPanel, setShowNotifPanel] = useState(false);

  useEffect(() => {
    const t = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  const handleLogout = () => { logout(); navigate('/login'); };

  const accentColor = user?.personaConfig?.accentColor || '#3b82f6';

  const notifs = [
    { id: 1, type: 'risk',   icon: '⚠️', text: 'High-severity supply chain risk detected', time: '2m ago', color: '#ef4444' },
    { id: 2, type: 'action', icon: '✅', text: 'Q1 budget review recommendation ready',     time: '8m ago', color: '#10b981' },
    { id: 3, type: 'agent',  icon: '🤖', text: 'Risk Analyzer completed new scan',           time: '15m ago', color: '#3b82f6' },
  ];

  return (
    <header
      className="flex-shrink-0 px-6 py-3 flex items-center justify-between relative z-20"
      style={{
        background: 'rgba(5,12,26,0.95)',
        borderBottom: '1px solid rgba(30,58,95,0.5)',
        backdropFilter: 'blur(20px)',
      }}
    >
      {/* ── Left: Greeting & Time ── */}
      <div className="flex items-center gap-6">
        <div>
          <div className="text-xs text-slate-500 uppercase tracking-wider">
            {user?.personaConfig?.aiGreeting?.split('.')[0] || 'Good morning'}
          </div>
          <div className="text-base font-semibold text-white">
            {time.toLocaleString('en-US', { weekday: 'long', month: 'short', day: 'numeric', year: 'numeric' })}
          </div>
        </div>

        {/* Divider */}
        <div className="h-8 w-px" style={{ background: 'rgba(30,58,95,0.6)' }} />

        {/* Live clock */}
        <div className="flex items-center gap-2">
          <div className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
          <span className="font-mono text-sm font-semibold" style={{ color: '#06b6d4' }}>
            {time.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
          </span>
        </div>

        {/* Divider */}
        <div className="h-8 w-px" style={{ background: 'rgba(30,58,95,0.6)' }} />

        {/* System status */}
        <div className="flex items-center gap-3">
          {[
            { label: 'Agents', value: '4/4', color: '#10b981' },
            { label: 'Connectors', value: '6/6', color: '#3b82f6' },
            { label: 'Latency', value: '42ms', color: '#f59e0b' },
          ].map(s => (
            <div key={s.label} className="flex items-center gap-1.5">
              <div className="w-1.5 h-1.5 rounded-full" style={{ background: s.color, boxShadow: `0 0 5px ${s.color}` }} />
              <span className="text-xs text-slate-500">{s.label}:</span>
              <span className="text-xs font-semibold" style={{ color: s.color }}>{s.value}</span>
            </div>
          ))}
        </div>
      </div>

      {/* ── Right: Actions ── */}
      <div className="flex items-center gap-4">
        {/* Monthly Cost */}
        <div
          className="px-3 py-1.5 rounded-lg"
          style={{ background: 'rgba(15,31,61,0.6)', border: '1px solid rgba(30,58,95,0.5)' }}
        >
          <div className="text-xs text-slate-500">Monthly Cost</div>
          <div className="text-sm font-bold" style={{ color: accentColor }}>
            ${calculateMonthlyCost().toFixed(2)}
          </div>
        </div>

        {/* Divider */}
        <div className="h-8 w-px" style={{ background: 'rgba(30,58,95,0.6)' }} />

        {/* Notifications */}
        <div className="relative">
          <button
            onClick={() => setShowNotifPanel(v => !v)}
            className="relative w-9 h-9 rounded-xl flex items-center justify-center transition-all"
            style={{
              background: showNotifPanel ? 'rgba(59,130,246,0.15)' : 'rgba(15,31,61,0.5)',
              border: `1px solid ${showNotifPanel ? 'rgba(59,130,246,0.4)' : 'rgba(30,58,95,0.4)'}`,
            }}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="w-4 h-4 text-slate-400">
              <path d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"/>
            </svg>
            {notifications > 0 && (
              <span className="absolute -top-0.5 -right-0.5 w-4 h-4 rounded-full text-xs font-bold flex items-center justify-center"
                style={{ background: '#ef4444', fontSize: '10px' }}>
                {notifications}
              </span>
            )}
          </button>

          {/* Notification dropdown */}
          {showNotifPanel && (
            <div
              className="absolute right-0 top-11 w-80 rounded-2xl shadow-2xl z-50 overflow-hidden"
              style={{
                background: 'rgba(8,15,31,0.98)',
                border: '1px solid rgba(30,58,95,0.6)',
                backdropFilter: 'blur(20px)',
              }}
            >
              <div className="px-4 py-3 flex items-center justify-between" style={{ borderBottom: '1px solid rgba(30,58,95,0.4)' }}>
                <span className="text-sm font-semibold text-white">Notifications</span>
                <span className="text-xs text-blue-400 cursor-pointer">Mark all read</span>
              </div>
              {notifs.map(n => (
                <div key={n.id} className="px-4 py-3 flex items-start gap-3 hover:bg-slate-800/30 transition-colors" style={{ borderBottom: '1px solid rgba(30,58,95,0.2)' }}>
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 text-sm"
                    style={{ background: `${n.color}20`, border: `1px solid ${n.color}30` }}>
                    {n.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-slate-300 leading-relaxed">{n.text}</p>
                    <p className="text-xs text-slate-600 mt-0.5">{n.time}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* User avatar + logout */}
        <div className="flex items-center gap-3">
          <div className="text-right">
            <div className="text-sm font-semibold text-white leading-none">{user?.name}</div>
            <div className="text-xs mt-0.5" style={{ color: accentColor + 'aa' }}>
              {user?.personaConfig?.icon} {user?.title || user?.role}
            </div>
          </div>
          <div
            className="w-9 h-9 rounded-xl flex items-center justify-center text-sm font-bold"
            style={{
              background: `linear-gradient(135deg, ${accentColor}40, ${accentColor}20)`,
              border: `1.5px solid ${accentColor}50`,
              color: accentColor,
            }}
          >
            {user?.avatar || user?.name?.charAt(0) || 'U'}
          </div>
          <button
            onClick={handleLogout}
            className="px-3 py-1.5 rounded-lg text-xs font-semibold transition-all"
            style={{
              background: 'rgba(239,68,68,0.1)',
              border: '1px solid rgba(239,68,68,0.25)',
              color: '#ef4444',
            }}
            onMouseEnter={e => { e.target.style.background = 'rgba(239,68,68,0.2)'; }}
            onMouseLeave={e => { e.target.style.background = 'rgba(239,68,68,0.1)'; }}
          >
            Sign Out
          </button>
        </div>
      </div>

      {/* Click outside to close notifications */}
      {showNotifPanel && (
        <div className="fixed inset-0 z-40" onClick={() => setShowNotifPanel(false)} />
      )}
    </header>
  );
}
