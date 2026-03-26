// AdminPanel — System administrator view
// Tabs: Data Connections | System Prompts | Audit Log
import { useState } from 'react';
import { usePrompts } from '../contexts/PromptContext';
import { useAuth } from '../contexts/AuthContext';

const TYPE_COLOR = {
  ERP:      { bg:'#eff6ff', color:'#2563eb', border:'#bfdbfe' },
  CRM:      { bg:'#f0fdf4', color:'#16a34a', border:'#bbf7d0' },
  HR:       { bg:'#fdf4ff', color:'#9333ea', border:'#e9d5ff' },
  News:     { bg:'#fff7ed', color:'#c2410c', border:'#fed7aa' },
  Market:   { bg:'#fef9c3', color:'#ca8a04', border:'#fde68a' },
  Email:    { bg:'#f0f9ff', color:'#0284c7', border:'#bae6fd' },
  Meetings: { bg:'#ecfdf5', color:'#059669', border:'#a7f3d0' },
  IoT:      { bg:'#fef2f2', color:'#dc2626', border:'#fecaca' },
  Intel:    { bg:'#f5f3ff', color:'#7c3aed', border:'#ddd6fe' },
};

const STATUS_STYLE = {
  connected:    { dot:'#16a34a', label:'Connected',    bg:'#f0fdf4', color:'#15803d', border:'#bbf7d0' },
  syncing:      { dot:'#d97706', label:'Syncing…',     bg:'#fef9c3', color:'#92400e', border:'#fde68a' },
  disconnected: { dot:'#dc2626', label:'Disconnected', bg:'#fef2f2', color:'#991b1b', border:'#fecaca' },
};

function StatusDot({ status }) {
  const s = STATUS_STYLE[status] || STATUS_STYLE.disconnected;
  return (
    <span style={{ display:'inline-flex', alignItems:'center', gap:5,
      background:s.bg, color:s.color, border:`1px solid ${s.border}`,
      fontSize:11, fontWeight:700, padding:'2px 9px', borderRadius:99 }}>
      <span style={{ width:6, height:6, borderRadius:'50%', background:s.dot,
        display:'inline-block',
        animation: status === 'syncing' ? 'pulse 1s infinite' : 'none' }}/>
      {s.label}
    </span>
  );
}

// ── Data Connections tab ──────────────────────────────────────────
function ConnectionsTab() {
  const { connections, syncConnection, updateConnection, addConnection, removeConnection } = usePrompts();
  const { user } = useAuth();
  const [showAdd, setShowAdd] = useState(false);
  const [expanded, setExpanded] = useState(null);
  const [newConn, setNewConn] = useState({ name:'', type:'ERP', icon:'🔗', endpoint:'', refreshInterval:'15min', description:'' });
  const [syncing, setSyncing] = useState({});

  function handleSync(id) {
    setSyncing(s => ({ ...s, [id]:true }));
    syncConnection(id, user?.name);
    setTimeout(() => setSyncing(s => ({ ...s, [id]:false })), 2200);
  }

  const totalRecords = connections.reduce((s, c) => s + (c.records || 0), 0);
  const connected    = connections.filter(c => c.status === 'connected').length;

  return (
    <div style={{ display:'flex', flexDirection:'column', gap:16 }}>
      {/* Summary bar */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:12 }}>
        {[
          { label:'Total Connections', value: connections.length, icon:'🔌', color:'#2563eb' },
          { label:'Active',            value: connected,          icon:'✓',  color:'#16a34a' },
          { label:'Total Records',     value: totalRecords.toLocaleString(), icon:'📦', color:'#7c3aed' },
          { label:'Data Sources',      value: [...new Set(connections.map(c=>c.type))].length, icon:'🗂', color:'#d97706' },
        ].map(m => (
          <div key={m.label} style={{ background:'#ffffff', border:'1px solid #e2e8f0',
            borderRadius:10, padding:'14px 16px' }}>
            <div style={{ fontSize:10, fontWeight:700, color:'#94a3b8', marginBottom:6 }}>{m.label}</div>
            <div style={{ fontSize:24, fontWeight:900, color:m.color }}>{m.value}</div>
          </div>
        ))}
      </div>

      {/* Connections list */}
      <div style={{ background:'#ffffff', border:'1px solid #e2e8f0', borderRadius:12 }}>
        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between',
          padding:'14px 18px', borderBottom:'1px solid #f1f5f9' }}>
          <span style={{ fontSize:14, fontWeight:700, color:'#0f172a' }}>Data Feed Connections</span>
          <button onClick={() => setShowAdd(v => !v)}
            style={{ fontSize:11, fontWeight:700, padding:'7px 14px', borderRadius:8,
              background:'#2563eb', color:'#ffffff', border:'none', cursor:'pointer' }}>
            + Add Connection
          </button>
        </div>

        {/* Add new form */}
        {showAdd && (
          <div style={{ margin:16, background:'#f8fafc', border:'1px solid #e2e8f0',
            borderRadius:10, padding:'16px 18px' }}>
            <div style={{ fontSize:13, fontWeight:700, color:'#0f172a', marginBottom:14 }}>New Data Connection</div>
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10, marginBottom:10 }}>
              {[
                { label:'Connection Name', key:'name', placeholder:'e.g. Oracle Financials' },
                { label:'Endpoint URL',    key:'endpoint', placeholder:'https://api.example.com/v1' },
                { label:'Description',     key:'description', placeholder:'What data does this provide?' },
                { label:'Refresh Interval',key:'refreshInterval', placeholder:'15min / 1h / Daily' },
              ].map(f => (
                <div key={f.key}>
                  <div style={{ fontSize:10, fontWeight:700, color:'#64748b', marginBottom:5 }}>{f.label}</div>
                  <input value={newConn[f.key]} onChange={e => setNewConn(p => ({ ...p, [f.key]:e.target.value }))}
                    placeholder={f.placeholder}
                    style={{ width:'100%', fontSize:12, padding:'8px 10px', borderRadius:7,
                      border:'1px solid #e2e8f0', outline:'none', boxSizing:'border-box' }}/>
                </div>
              ))}
            </div>
            <div style={{ display:'flex', gap:8 }}>
              <select value={newConn.type} onChange={e => setNewConn(p => ({...p, type:e.target.value}))}
                style={{ fontSize:12, padding:'8px 10px', borderRadius:7, border:'1px solid #e2e8f0',
                  background:'#ffffff', cursor:'pointer' }}>
                {Object.keys(TYPE_COLOR).map(t => <option key={t}>{t}</option>)}
              </select>
              <button onClick={() => {
                if (newConn.name && newConn.endpoint) {
                  addConnection(newConn);
                  setNewConn({ name:'', type:'ERP', icon:'🔗', endpoint:'', refreshInterval:'15min', description:'' });
                  setShowAdd(false);
                }
              }} style={{ flex:1, fontSize:12, fontWeight:700, padding:'8px 0', borderRadius:8,
                background:'#16a34a', color:'#ffffff', border:'none', cursor:'pointer' }}>
                Save Connection
              </button>
              <button onClick={() => setShowAdd(false)}
                style={{ fontSize:12, fontWeight:600, padding:'8px 14px', borderRadius:8,
                  background:'#f8fafc', color:'#475569', border:'1px solid #e2e8f0', cursor:'pointer' }}>
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* Connection cards */}
        {connections.map(c => {
          const tc  = TYPE_COLOR[c.type] || TYPE_COLOR.ERP;
          const isX = expanded === c.id;
          return (
            <div key={c.id} style={{ borderBottom:'1px solid #f8fafc' }}>
              <div style={{ display:'flex', alignItems:'center', gap:12, padding:'14px 18px' }}>
                <span style={{ fontSize:22, flexShrink:0 }}>{c.icon}</span>
                <div style={{ flex:1, minWidth:0 }}>
                  <div style={{ display:'flex', alignItems:'center', gap:8, flexWrap:'wrap' }}>
                    <span style={{ fontSize:13, fontWeight:700, color:'#0f172a' }}>{c.name}</span>
                    <span style={{ fontSize:10, fontWeight:700, background:tc.bg, color:tc.color,
                      border:`1px solid ${tc.border}`, padding:'1px 7px', borderRadius:99 }}>
                      {c.type}
                    </span>
                    <StatusDot status={c.status}/>
                  </div>
                  <div style={{ fontSize:11, color:'#64748b', marginTop:2 }}>{c.description}</div>
                </div>
                <div style={{ display:'flex', flexDirection:'column', alignItems:'flex-end', gap:4, flexShrink:0 }}>
                  <div style={{ fontSize:11, fontWeight:700, color:'#0f172a' }}>{c.records.toLocaleString()} records</div>
                  <div style={{ fontSize:10, color:'#94a3b8' }}>Last sync: {c.lastSync}</div>
                </div>
                <div style={{ display:'flex', gap:6, flexShrink:0 }}>
                  <button onClick={() => handleSync(c.id)} disabled={syncing[c.id]}
                    style={{ fontSize:11, fontWeight:700, padding:'6px 12px', borderRadius:7,
                      background: syncing[c.id] ? '#f8fafc' : '#eff6ff',
                      color: syncing[c.id] ? '#94a3b8' : '#2563eb',
                      border:'1px solid #bfdbfe', cursor: syncing[c.id] ? 'default' : 'pointer' }}>
                    {syncing[c.id] ? '⟳ Syncing…' : '⟳ Sync Now'}
                  </button>
                  <button onClick={() => setExpanded(isX ? null : c.id)}
                    style={{ fontSize:11, fontWeight:700, padding:'6px 12px', borderRadius:7,
                      background:'#f8fafc', color:'#475569', border:'1px solid #e2e8f0', cursor:'pointer' }}>
                    {isX ? '▲' : '⚙ Config'}
                  </button>
                </div>
              </div>

              {/* Expanded config */}
              {isX && (
                <div style={{ margin:'0 18px 14px', background:'#f8fafc', border:'1px solid #e2e8f0',
                  borderRadius:10, padding:'14px 16px' }}>
                  <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10 }}>
                    {[
                      { label:'Endpoint URL',     val: c.endpoint },
                      { label:'Refresh Interval', val: c.refreshInterval },
                    ].map(f => (
                      <div key={f.label}>
                        <div style={{ fontSize:10, fontWeight:700, color:'#64748b', marginBottom:5 }}>{f.label}</div>
                        <input defaultValue={f.val}
                          onChange={e => updateConnection(c.id, { [f.label === 'Endpoint URL' ? 'endpoint' : 'refreshInterval']: e.target.value })}
                          style={{ width:'100%', fontSize:12, padding:'8px 10px', borderRadius:7,
                            border:'1px solid #e2e8f0', outline:'none', boxSizing:'border-box', background:'#ffffff' }}/>
                      </div>
                    ))}
                  </div>
                  <div style={{ marginTop:10, display:'flex', gap:8 }}>
                    <button onClick={() => { setExpanded(null); }}
                      style={{ fontSize:11, fontWeight:700, padding:'7px 14px', borderRadius:8,
                        background:'#16a34a', color:'#ffffff', border:'none', cursor:'pointer' }}>
                      Save Config
                    </button>
                    <button onClick={() => removeConnection(c.id)}
                      style={{ fontSize:11, fontWeight:700, padding:'7px 14px', borderRadius:8,
                        background:'#fef2f2', color:'#dc2626', border:'1px solid #fecaca', cursor:'pointer' }}>
                      Remove
                    </button>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ── System Prompts tab ────────────────────────────────────────────
function SystemPromptsTab() {
  const { systemPrompts, connections, addSystemPrompt, toggleSystemPrompt, deleteSystemPrompt, runSystemPrompt } = usePrompts();
  const { user } = useAuth();
  const [showAdd, setShowAdd] = useState(false);
  const [expanded, setExpanded] = useState(null);
  const [running, setRunning] = useState({});
  const [newPrompt, setNewPrompt] = useState({ name:'', prompt:'', sources:[], schedule:'Daily 06:00', enabled:true });

  function handleRun(id) {
    setRunning(s => ({ ...s, [id]:true }));
    runSystemPrompt(id, user?.name);
    setTimeout(() => setRunning(s => ({ ...s, [id]:false })), 2500);
  }

  const schedOpts = ['Every 15min','Every 30min','Every 1h','Every 2h','Every 4h','Daily 06:00','Daily 07:00','Daily 08:00','Weekly Mon 08:00'];

  return (
    <div style={{ display:'flex', flexDirection:'column', gap:16 }}>
      {/* Stats */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:12 }}>
        {[
          { label:'Total Prompts', value: systemPrompts.length,                           color:'#2563eb' },
          { label:'Active',        value: systemPrompts.filter(p=>p.enabled).length,      color:'#16a34a' },
          { label:'Total Runs',    value: systemPrompts.reduce((s,p)=>s+(p.runCount||0),0), color:'#7c3aed' },
          { label:'Insights Generated', value: systemPrompts.reduce((s,p)=>s+(p.insightCount||0),0), color:'#d97706' },
        ].map(m => (
          <div key={m.label} style={{ background:'#ffffff', border:'1px solid #e2e8f0',
            borderRadius:10, padding:'14px 16px' }}>
            <div style={{ fontSize:10, fontWeight:700, color:'#94a3b8', marginBottom:6 }}>{m.label}</div>
            <div style={{ fontSize:24, fontWeight:900, color:m.color }}>{m.value}</div>
          </div>
        ))}
      </div>

      <div style={{ background:'#ffffff', border:'1px solid #e2e8f0', borderRadius:12 }}>
        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between',
          padding:'14px 18px', borderBottom:'1px solid #f1f5f9' }}>
          <div>
            <span style={{ fontSize:14, fontWeight:700, color:'#0f172a' }}>System Prompts</span>
            <div style={{ fontSize:11, color:'#94a3b8', marginTop:2 }}>
              Always-on AI prompts that run against your connected data feeds on a schedule
            </div>
          </div>
          <button onClick={() => setShowAdd(v => !v)}
            style={{ fontSize:11, fontWeight:700, padding:'7px 14px', borderRadius:8,
              background:'#7c3aed', color:'#ffffff', border:'none', cursor:'pointer' }}>
            + New Prompt
          </button>
        </div>

        {/* Add new form */}
        {showAdd && (
          <div style={{ margin:16, background:'#faf5ff', border:'1px solid #e9d5ff',
            borderRadius:10, padding:'16px 18px' }}>
            <div style={{ fontSize:13, fontWeight:700, color:'#6d28d9', marginBottom:14 }}>New System Prompt</div>
            <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
              <div>
                <div style={{ fontSize:10, fontWeight:700, color:'#64748b', marginBottom:5 }}>Prompt Name</div>
                <input value={newPrompt.name} onChange={e => setNewPrompt(p=>({...p,name:e.target.value}))}
                  placeholder="e.g. Weekly Quality Digest"
                  style={{ width:'100%', fontSize:12, padding:'8px 10px', borderRadius:7,
                    border:'1px solid #e2e8f0', outline:'none', boxSizing:'border-box' }}/>
              </div>
              <div>
                <div style={{ fontSize:10, fontWeight:700, color:'#64748b', marginBottom:5 }}>Prompt Instructions</div>
                <textarea value={newPrompt.prompt} onChange={e => setNewPrompt(p=>({...p,prompt:e.target.value}))}
                  rows={4} placeholder="Describe what this prompt should analyse and report on..."
                  style={{ width:'100%', fontSize:12, padding:'8px 10px', borderRadius:7,
                    border:'1px solid #e2e8f0', outline:'none', resize:'vertical', boxSizing:'border-box', fontFamily:'inherit' }}/>
              </div>
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10 }}>
                <div>
                  <div style={{ fontSize:10, fontWeight:700, color:'#64748b', marginBottom:5 }}>Schedule</div>
                  <select value={newPrompt.schedule} onChange={e => setNewPrompt(p=>({...p,schedule:e.target.value}))}
                    style={{ width:'100%', fontSize:12, padding:'8px 10px', borderRadius:7,
                      border:'1px solid #e2e8f0', background:'#ffffff', cursor:'pointer' }}>
                    {schedOpts.map(s => <option key={s}>{s}</option>)}
                  </select>
                </div>
                <div>
                  <div style={{ fontSize:10, fontWeight:700, color:'#64748b', marginBottom:5 }}>Data Sources</div>
                  <div style={{ display:'flex', gap:5, flexWrap:'wrap' }}>
                    {connections.slice(0,6).map(c => (
                      <button key={c.id} onClick={() => setNewPrompt(p => ({
                          ...p,
                          sources: p.sources.includes(c.id) ? p.sources.filter(s=>s!==c.id) : [...p.sources, c.id]
                        }))}
                        style={{ fontSize:10, fontWeight:700, padding:'3px 9px', borderRadius:99,
                          background: newPrompt.sources.includes(c.id) ? '#7c3aed' : '#f8fafc',
                          color: newPrompt.sources.includes(c.id) ? '#ffffff' : '#475569',
                          border:'1px solid #e2e8f0', cursor:'pointer' }}>
                        {c.icon} {c.type}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
              <div style={{ display:'flex', gap:8 }}>
                <button onClick={() => {
                  if (newPrompt.name && newPrompt.prompt) {
                    addSystemPrompt(newPrompt, user?.name);
                    setNewPrompt({ name:'', prompt:'', sources:[], schedule:'Daily 06:00', enabled:true });
                    setShowAdd(false);
                  }
                }} style={{ flex:1, fontSize:12, fontWeight:700, padding:'8px 0', borderRadius:8,
                  background:'#7c3aed', color:'#ffffff', border:'none', cursor:'pointer' }}>
                  Save & Activate
                </button>
                <button onClick={() => setShowAdd(false)}
                  style={{ fontSize:12, fontWeight:600, padding:'8px 14px', borderRadius:8,
                    background:'#f8fafc', color:'#475569', border:'1px solid #e2e8f0', cursor:'pointer' }}>
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Prompt list */}
        {systemPrompts.map(p => {
          const isX = expanded === p.id;
          const isRunning = running[p.id] || p.status === 'running';
          return (
            <div key={p.id} style={{ borderBottom:'1px solid #f8fafc' }}>
              <div style={{ display:'flex', alignItems:'flex-start', gap:12, padding:'14px 18px' }}>
                {/* Toggle */}
                <button onClick={() => toggleSystemPrompt(p.id, user?.name)}
                  style={{ flexShrink:0, width:40, height:22, borderRadius:99, border:'none', cursor:'pointer',
                    background: p.enabled ? '#16a34a' : '#e2e8f0', padding:'2px', transition:'background .2s',
                    display:'flex', alignItems:'center', justifyContent: p.enabled ? 'flex-end' : 'flex-start' }}>
                  <span style={{ width:18, height:18, borderRadius:'50%', background:'#ffffff',
                    boxShadow:'0 1px 3px rgba(0,0,0,0.2)', display:'block' }}/>
                </button>

                <div style={{ flex:1, minWidth:0 }}>
                  <div style={{ display:'flex', alignItems:'center', gap:8, flexWrap:'wrap', marginBottom:4 }}>
                    <span style={{ fontSize:13, fontWeight:700, color:'#0f172a' }}>{p.name}</span>
                    <span style={{ fontSize:10, fontWeight:700,
                      background: p.enabled ? '#f0fdf4' : '#f8fafc',
                      color: p.enabled ? '#16a34a' : '#94a3b8',
                      border:`1px solid ${p.enabled ? '#bbf7d0' : '#e2e8f0'}`,
                      padding:'1px 7px', borderRadius:99 }}>
                      {p.enabled ? '● Active' : '○ Paused'}
                    </span>
                    <span style={{ fontSize:10, color:'#94a3b8' }}>⏱ {p.schedule}</span>
                    {p.sources?.map(s => {
                      const conn = connections.find(c=>c.id===s);
                      return conn ? (
                        <span key={s} style={{ fontSize:10, background:'#f8fafc', color:'#475569',
                          border:'1px solid #e2e8f0', padding:'1px 6px', borderRadius:99 }}>
                          {conn.icon} {conn.type}
                        </span>
                      ) : null;
                    })}
                  </div>
                  <div style={{ fontSize:11, color:'#64748b', lineHeight:1.55, marginBottom:4 }}>
                    {p.prompt.substring(0,120)}{p.prompt.length > 120 ? '…' : ''}
                  </div>
                  <div style={{ fontSize:10, color:'#94a3b8' }}>
                    Last run: {p.lastRun} &nbsp;·&nbsp; {p.insightCount} insights &nbsp;·&nbsp; {p.runCount} total runs
                  </div>
                </div>

                <div style={{ display:'flex', gap:6, flexShrink:0 }}>
                  <button onClick={() => handleRun(p.id)} disabled={isRunning || !p.enabled}
                    style={{ fontSize:11, fontWeight:700, padding:'6px 12px', borderRadius:7,
                      background: isRunning ? '#f8fafc' : '#eff6ff',
                      color: isRunning ? '#94a3b8' : '#2563eb',
                      border:'1px solid #bfdbfe', cursor: (isRunning || !p.enabled) ? 'default' : 'pointer' }}>
                    {isRunning ? '⟳ Running…' : '▶ Run Now'}
                  </button>
                  <button onClick={() => setExpanded(isX ? null : p.id)}
                    style={{ fontSize:11, fontWeight:700, padding:'6px 12px', borderRadius:7,
                      background:'#f8fafc', color:'#475569', border:'1px solid #e2e8f0', cursor:'pointer' }}>
                    {isX ? '▲' : '▼ Output'}
                  </button>
                  <button onClick={() => deleteSystemPrompt(p.id, user?.name)}
                    style={{ fontSize:11, fontWeight:700, padding:'6px 12px', borderRadius:7,
                      background:'#fef2f2', color:'#dc2626', border:'1px solid #fecaca', cursor:'pointer' }}>
                    🗑
                  </button>
                </div>
              </div>

              {isX && p.lastOutput && (
                <div style={{ margin:'0 18px 14px', background:'#f8fafc', border:'1px solid #e2e8f0',
                  borderRadius:10, padding:'14px 16px' }}>
                  <div style={{ fontSize:10, fontWeight:700, color:'#64748b', marginBottom:8,
                    textTransform:'uppercase', letterSpacing:0.8 }}>Last Output — {p.lastRun}</div>
                  <div style={{ fontSize:12, color:'#334155', lineHeight:1.7 }}>{p.lastOutput}</div>
                  {isRunning && (
                    <div style={{ marginTop:10, fontSize:11, color:'#2563eb', fontWeight:600,
                      display:'flex', alignItems:'center', gap:6 }}>
                      <span style={{ display:'inline-block', width:8, height:8, borderRadius:'50%',
                        background:'#2563eb', animation:'pulse 1s infinite' }}/>
                      Running against live data feeds…
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ── Audit Log tab ─────────────────────────────────────────────────
function AuditLogTab() {
  const { auditLog } = usePrompts();
  const mock = [
    { id:'L1', action:'User Login',         detail:'Marcus Gaksh (CEO) logged in',                    user:'system',          timestamp:'2026-03-26 10:42' },
    { id:'L2', action:'Manual Sync',        detail:'CRM Salesforce synced successfully — 18,400 rec',  user:'Dev Admin',       timestamp:'2026-03-26 10:38' },
    { id:'L3', action:'Prompt Executed',    detail:'"Daily Revenue Anomaly Scan" completed — 3 alerts',user:'system',          timestamp:'2026-03-26 06:00' },
    { id:'L4', action:'Insight Shared',     detail:'"Q1 Revenue Gap Analysis" shared to CEO view',     user:'Arjun Mehta',     timestamp:'2026-03-25 17:22' },
    { id:'L5', action:'Decision Committed', detail:'DEC-001 committed by Marcus Gaksh',                user:'Marcus Gaksh',    timestamp:'2026-03-25 14:10' },
    { id:'L6', action:'Prompt Disabled',    detail:'"Competitor Pricing Watch" paused by admin',       user:'Dev Admin',       timestamp:'2026-03-25 09:00' },
    { id:'L7', action:'Connection Added',   detail:'Bloomberg Market Data connection configured',      user:'Dev Admin',       timestamp:'2026-03-24 11:30' },
    ...auditLog,
  ];

  const ACTION_COLOR = {
    'User Login':          '#2563eb',
    'Manual Sync':         '#0891b2',
    'Prompt Executed':     '#7c3aed',
    'Insight Shared':      '#d97706',
    'Decision Committed':  '#16a34a',
    'Prompt Disabled':     '#dc2626',
    'Connection Added':    '#059669',
    'System Prompt Added': '#7c3aed',
    'Prompt Enabled':      '#16a34a',
    'Prompt Deleted':      '#dc2626',
  };

  return (
    <div style={{ background:'#ffffff', border:'1px solid #e2e8f0', borderRadius:12, overflow:'hidden' }}>
      <div style={{ padding:'14px 18px', borderBottom:'1px solid #f1f5f9' }}>
        <span style={{ fontSize:14, fontWeight:700, color:'#0f172a' }}>System Audit Log</span>
        <div style={{ fontSize:11, color:'#94a3b8', marginTop:2 }}>
          All platform actions, data syncs, and user activities
        </div>
      </div>
      <div style={{ maxHeight:480, overflowY:'auto' }}>
        {mock.slice(0,50).map((entry, i) => {
          const col = ACTION_COLOR[entry.action] || '#64748b';
          return (
            <div key={entry.id || i} style={{ display:'flex', alignItems:'flex-start', gap:12,
              padding:'11px 18px', borderBottom:'1px solid #f8fafc' }}>
              <span style={{ width:8, height:8, borderRadius:'50%', background:col,
                flexShrink:0, marginTop:4 }}/>
              <div style={{ flex:1, minWidth:0 }}>
                <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:2, flexWrap:'wrap' }}>
                  <span style={{ fontSize:11, fontWeight:700, color:col }}>{entry.action}</span>
                  <span style={{ fontSize:10, color:'#94a3b8' }}>by {entry.user}</span>
                </div>
                <div style={{ fontSize:11, color:'#334155', lineHeight:1.5 }}>{entry.detail}</div>
              </div>
              <span style={{ fontSize:10, color:'#94a3b8', flexShrink:0 }}>{entry.timestamp}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ── Main AdminPanel ───────────────────────────────────────────────
export default function AdminPanel() {
  const { user } = useAuth();
  const [tab, setTab] = useState('connections');

  const TABS = [
    { id:'connections', label:'Data Connections', icon:'🔌' },
    { id:'prompts',     label:'System Prompts',   icon:'🤖' },
    { id:'audit',       label:'Audit Log',         icon:'📋' },
  ];

  return (
    <div style={{ background:'#f4f6f9', minHeight:'100%', padding:'20px 24px',
      display:'flex', flexDirection:'column', gap:16 }}>

      {/* Header */}
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', flexWrap:'wrap', gap:10 }}>
        <div>
          <div style={{ fontSize:18, fontWeight:900, color:'#0f172a' }}>Admin Panel</div>
          <div style={{ fontSize:11, color:'#94a3b8', marginTop:2 }}>
            {user?.name} · {user?.title} · Configure data connections, system prompts, and platform settings
          </div>
        </div>
        <span style={{ fontSize:11, fontWeight:700, background:'#fef2f2', color:'#dc2626',
          border:'1px solid #fecaca', padding:'5px 12px', borderRadius:99 }}>
          🔒 Admin Only
        </span>
      </div>

      {/* Tabs */}
      <div style={{ display:'flex', gap:0, background:'#ffffff', border:'1px solid #e2e8f0',
        borderRadius:10, padding:4, width:'fit-content' }}>
        {TABS.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)}
            style={{ fontSize:12, fontWeight:700, padding:'8px 20px', borderRadius:7, border:'none',
              cursor:'pointer', transition:'all .12s',
              background: tab === t.id ? '#0f172a' : 'transparent',
              color:       tab === t.id ? '#ffffff'  : '#475569' }}>
            {t.icon} {t.label}
          </button>
        ))}
      </div>

      {/* Tab content */}
      {tab === 'connections' && <ConnectionsTab/>}
      {tab === 'prompts'     && <SystemPromptsTab/>}
      {tab === 'audit'       && <AuditLogTab/>}
    </div>
  );
}
