import { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useFilters } from '../contexts/FilterContext';
import { useAuth } from '../contexts/AuthContext';

const NAV = [
  { path:'/app/home',      label:'Home',         icon:'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6' },
  { path:'/app/board',     label:'Board Brief',  icon:'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z' },
  { path:'/app/insights',  label:'Insights Hub', icon:'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z' },
  { path:'/app/decisions', label:'Decision Hub', icon:'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01' },
  { path:'/app/execution', label:'Execution Hub',icon:'M13 10V3L4 14h7v7l9-11h-7z' },
];

const FILTER_DEFS = [
  { key:'timeRange',   label:'Time range',  opts:['Last 30','Last 60','Last 90','Last 180','YTD'] },
  { key:'site',        label:'Plant',       opts:['Plano, Texas','Detroit','Pune','Michigan','All'] },
  { key:'country',     label:'Region',      opts:['USA','UK','India','Global'] },
  { key:'segment',     label:'Cust. Segment',opts:['OEM','Tier-1','Tier-2','All'] },
  { key:'productLine', label:'Prod. Line',  opts:['Car Axle','Braking Systems','Steering','EV Drivetrain','All'] },
];

export default function SiBoNiLayout({ children }) {
  const { filters, updateFilter, reset, snap } = useFilters();
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(false);

  const handleLogout = () => { logout(); navigate('/login'); };

  return (
    <div style={{ display:'flex', height:'100vh', overflow:'hidden', background:'#f4f6f9' }}>

      {/* ── Sidebar ───────────────────────────────────────────────── */}
      <aside style={{
        width: collapsed ? 56 : 224,
        flexShrink:0,
        background:'#ffffff',
        borderRight:'1px solid #e2e8f0',
        display:'flex',
        flexDirection:'column',
        transition:'width .2s ease',
        overflow:'hidden',
        boxShadow:'1px 0 4px rgba(0,0,0,0.04)',
        zIndex:20,
      }}>

        {/* Logo row */}
        <div style={{ display:'flex', alignItems:'center', justifyContent: collapsed ? 'center' : 'space-between',
          padding: collapsed ? '14px 0' : '14px 16px',
          borderBottom:'1px solid #f1f5f9', flexShrink:0 }}>
          {!collapsed && (
            <div style={{ display:'flex', flexDirection:'column', lineHeight:1 }}>
              <span style={{ fontSize:18, fontWeight:900, color:'#0f172a', letterSpacing:2 }}>SiBoNi</span>
              <span style={{ fontSize:9, fontWeight:600, color:'#64748b', letterSpacing:1, marginTop:1 }}>CXO COCKPIT</span>
            </div>
          )}
          <button onClick={() => setCollapsed(v => !v)}
            style={{ background:'none', border:'1px solid #e2e8f0', borderRadius:6,
              cursor:'pointer', padding:'4px 6px', color:'#64748b', flexShrink:0 }}>
            <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
              {collapsed
                ? <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7"/>
                : <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7"/>}
            </svg>
          </button>
        </div>

        {/* Reset + Snap buttons */}
        {!collapsed && (
          <div style={{ display:'flex', gap:8, padding:'10px 14px', borderBottom:'1px solid #f1f5f9', flexShrink:0 }}>
            <button onClick={reset}
              style={{ flex:1, fontSize:11, fontWeight:700, padding:'6px 0',
                background:'#f8fafc', color:'#475569', border:'1px solid #e2e8f0',
                borderRadius:7, cursor:'pointer' }}>
              Reset
            </button>
            <button onClick={snap}
              style={{ flex:1, fontSize:11, fontWeight:700, padding:'6px 0',
                background:'#eff6ff', color:'#2563eb', border:'1px solid #bfdbfe',
                borderRadius:7, cursor:'pointer' }}>
              Snap
            </button>
          </div>
        )}

        {/* Navigation */}
        <nav style={{ padding: collapsed ? '8px 0' : '8px 0', flexShrink:0 }}>
          {NAV.map(item => (
            <NavLink key={item.path} to={item.path}
              style={({ isActive }) => ({
                display:'flex', alignItems:'center', gap:10,
                padding: collapsed ? '10px 0' : '9px 14px',
                justifyContent: collapsed ? 'center' : 'flex-start',
                textDecoration:'none',
                color: isActive ? '#2563eb' : '#475569',
                background: isActive ? '#eff6ff' : 'transparent',
                borderLeft: isActive ? '3px solid #2563eb' : '3px solid transparent',
                fontWeight: isActive ? 700 : 500,
                fontSize: 13,
                transition:'all .12s',
              })}>
              <svg width={16} height={16} viewBox="0 0 24 24" fill="none"
                stroke="currentColor" strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round">
                <path d={item.icon}/>
              </svg>
              {!collapsed && <span style={{ whiteSpace:'nowrap' }}>{item.label}</span>}
            </NavLink>
          ))}
        </nav>

        {/* Filters section */}
        {!collapsed && (
          <div style={{ flex:1, overflowY:'auto', padding:'0 14px 14px',
            borderTop:'1px solid #f1f5f9', marginTop:4 }}>
            <div style={{ fontSize:10, fontWeight:700, color:'#94a3b8', letterSpacing:1,
              textTransform:'uppercase', padding:'10px 0 6px' }}>
              Filters
            </div>
            {FILTER_DEFS.map(fd => (
              <div key={fd.key} style={{ marginBottom:10 }}>
                <label style={{ display:'block', fontSize:10, fontWeight:600,
                  color:'#64748b', marginBottom:3 }}>{fd.label}</label>
                <select
                  value={filters[fd.key] || ''}
                  onChange={e => updateFilter(fd.key, e.target.value)}
                  style={{ width:'100%', fontSize:12, fontWeight:500, color:'#0f172a',
                    background:'#f8fafc', border:'1px solid #e2e8f0', borderRadius:7,
                    padding:'5px 8px', cursor:'pointer', appearance:'auto' }}>
                  {fd.opts.map(o => (
                    <option key={o} value={o}>{o}</option>
                  ))}
                </select>
              </div>
            ))}
          </div>
        )}

        {/* User row */}
        <div style={{ borderTop:'1px solid #f1f5f9', padding: collapsed ? '10px 0' : '10px 14px',
          display:'flex', alignItems:'center', gap:8, flexShrink:0,
          justifyContent: collapsed ? 'center' : 'flex-start' }}>
          <div style={{ width:28, height:28, borderRadius:'50%', background:'#eff6ff',
            display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
            <span style={{ fontSize:11, fontWeight:700, color:'#2563eb' }}>
              {user?.name?.charAt(0) || 'U'}
            </span>
          </div>
          {!collapsed && (
            <>
              <div style={{ flex:1, minWidth:0 }}>
                <div style={{ fontSize:12, fontWeight:700, color:'#0f172a',
                  whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis' }}>
                  {user?.name || 'User'}
                </div>
                <div style={{ fontSize:10, color:'#94a3b8' }}>{user?.role || ''}</div>
              </div>
              <button onClick={handleLogout}
                style={{ background:'none', border:'none', cursor:'pointer',
                  color:'#94a3b8', padding:4, borderRadius:4 }}
                title="Sign out">
                <svg width={14} height={14} viewBox="0 0 24 24" fill="none"
                  stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                  <path d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"/>
                </svg>
              </button>
            </>
          )}
        </div>
      </aside>

      {/* ── Main content ──────────────────────────────────────────── */}
      <main style={{ flex:1, overflow:'auto', display:'flex', flexDirection:'column' }}>

        {/* Top bar */}
        <div style={{ background:'#ffffff', borderBottom:'1px solid #e2e8f0',
          padding:'0 24px', height:52, display:'flex', alignItems:'center',
          justifyContent:'space-between', flexShrink:0,
          boxShadow:'0 1px 3px rgba(0,0,0,0.04)' }}>
          <div>
            <span style={{ fontSize:14, fontWeight:700, color:'#0f172a' }}>
              Gaksh Industrial Systems
            </span>
            <span style={{ fontSize:12, color:'#94a3b8', marginLeft:8 }}>
              {filters.timeRange} &bull; {filters.site} &bull; {filters.country}
            </span>
          </div>
          <div style={{ display:'flex', alignItems:'center', gap:12 }}>
            <span style={{ fontSize:11, fontWeight:600, background:'#f0fdf4', color:'#16a34a',
              border:'1px solid #bbf7d0', padding:'3px 10px', borderRadius:99,
              display:'flex', alignItems:'center', gap:5 }}>
              <span style={{ width:6, height:6, borderRadius:'50%', background:'#16a34a',
                display:'inline-block' }} />
              Live
            </span>
          </div>
        </div>

        {/* Page content */}
        <div style={{ flex:1, overflow:'auto' }}>
          {children}
        </div>
      </main>
    </div>
  );
}
