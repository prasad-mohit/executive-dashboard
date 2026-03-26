// PromptContext — manages system connections, system prompts, and analyst-shared insights
// Admin: manages connections + system prompts
// Analyst: creates custom prompts, shares insights to executive view
// Executive: sees analyst-shared insights in InsightsHub
import { createContext, useContext, useState, useEffect, useCallback } from 'react';

const PromptContext = createContext(null);
export const usePrompts = () => useContext(PromptContext);

// ── Default data ──────────────────────────────────────────────────
const INIT_CONNECTIONS = [
  { id:'erp',      name:'SAP ERP',              type:'ERP',      icon:'🏭', status:'connected',    lastSync:'2 min ago',  records:42800, endpoint:'https://sap.gis.internal/api/v2',       refreshInterval:'15min', description:'Core ERP: orders, inventory, production, finance' },
  { id:'crm',      name:'Salesforce CRM',        type:'CRM',      icon:'☁️', status:'connected',    lastSync:'5 min ago',  records:18400, endpoint:'https://gis.my.salesforce.com/api/v55',  refreshInterval:'30min', description:'Accounts, opportunities, cases, NPS' },
  { id:'hr',       name:'Workday HR',            type:'HR',       icon:'👥', status:'connected',    lastSync:'1h ago',     records:3200,  endpoint:'https://wd3.myworkday.com/gis/api/v1',   refreshInterval:'1h',    description:'Headcount, org structure, performance, skills' },
  { id:'news',     name:'Reuters Newsfeed',      type:'News',     icon:'📰', status:'connected',    lastSync:'8 min ago',  records:1240,  endpoint:'https://api.reuters.com/v2/news',         refreshInterval:'5min',  description:'Market news, supply chain events, regulatory updates' },
  { id:'market',   name:'Bloomberg Market Data', type:'Market',   icon:'📊', status:'connected',    lastSync:'1 min ago',  records:580,   endpoint:'https://api.bloomberg.com/v3/market',    refreshInterval:'1min',  description:'USD/EUR, steel index, oil, commodity pricing' },
  { id:'email',    name:'Microsoft Exchange',    type:'Email',    icon:'📧', status:'syncing',      lastSync:'12 min ago', records:89000, endpoint:'https://graph.microsoft.com/v1.0/mail',  refreshInterval:'10min', description:'Executive email intelligence, sentiment, key threads' },
  { id:'meetings', name:'Microsoft Teams',       type:'Meetings', icon:'💬', status:'connected',    lastSync:'3 min ago',  records:480,   endpoint:'https://graph.microsoft.com/v1.0/teams', refreshInterval:'5min',  description:'Meeting summaries, action items, sentiment' },
  { id:'iot',      name:'Plant IoT Sensors',     type:'IoT',      icon:'🔧', status:'disconnected', lastSync:'Never',      records:0,     endpoint:'https://iot.gis.internal/api/v1',        refreshInterval:'1min',  description:'Machine uptime, OEE, temperature, cycle time (not yet connected)' },
  { id:'comp',     name:'Competitor Monitor',    type:'Intel',    icon:'🔍', status:'connected',    lastSync:'28 min ago', records:284,   endpoint:'https://api.competitormind.io/v1/gis',   refreshInterval:'1h',    description:'Competitor pricing, product launches, job postings' },
];

const INIT_SYSTEM_PROMPTS = [
  {
    id:'SP-001', name:'Daily Revenue Anomaly Scan',
    prompt:'Scan all revenue transactions across ERP and CRM for anomalies > 5% deviation from the 30-day moving average. Flag by customer segment and geography. Highlight top 3 risk accounts.',
    sources:['erp','crm'], schedule:'Daily 06:00', enabled:true,
    lastRun:'2026-03-26 06:00', insightCount:3, status:'completed', runCount:94,
    lastOutput:'Revenue anomaly in Tier-1 segment: $2.4M shortfall vs 30-day avg at Michigan plant. Root cause: 2 delayed shipments (SAP SO-9821, SO-9847). Recommend expedite review and customer communication.',
  },
  {
    id:'SP-002', name:'Supply Chain Risk Monitor',
    prompt:'Monitor all open POs for lead time slippage > 10 days, inventory below 2-week safety stock, and geopolitical disruption signals from news feeds. Rank by financial exposure.',
    sources:['erp','news'], schedule:'Every 4h', enabled:true,
    lastRun:'2026-03-26 10:00', insightCount:7, status:'completed', runCount:280,
    lastOutput:'7 supply risks identified: Titanium grade 5 — 18-day lead slip (impact $1.1M); Bearing supplier SKFY requesting 12% price hike (impact $680K); Chennai port congestion +4 days. Recommend pre-buying on Titanium.',
  },
  {
    id:'SP-003', name:'Workforce Capacity Planner',
    prompt:'Cross-reference production orders vs available certified headcount by skill code. Flag plants with < 85% capacity coverage for the next 14 days. Include overtime cost estimate.',
    sources:['hr','erp'], schedule:'Daily 07:00', enabled:true,
    lastRun:'2026-03-26 07:00', insightCount:2, status:'completed', runCount:94,
    lastOutput:'Detroit: 78% capacity — 14 certified machinists below threshold for Q2 surge. Overtime cost estimate: $84K. Plano Texas: 91% (OK). Recommend contract staffing engagement for Detroit.',
  },
  {
    id:'SP-004', name:'Competitor Pricing Watch',
    prompt:'Monitor competitor product announcements and pricing signals from news and LinkedIn. Alert on any EV drivetrain or braking system price moves > 8% or new product launches.',
    sources:['news','comp'], schedule:'Every 2h', enabled:false,
    lastRun:'2026-03-25 18:00', insightCount:0, status:'disabled', runCount:48,
    lastOutput:'No significant competitor pricing moves detected in the last 24h. Parker Hannifin filed 2 new braking system patents — monitoring.',
  },
  {
    id:'SP-005', name:'Customer NPS Pulse',
    prompt:'Aggregate CRM case notes, email sentiment, and recent survey responses to compute real-time NPS trend by account segment. Flag accounts with NPS drop > 10 pts in 30 days.',
    sources:['crm','email'], schedule:'Weekly Mon 08:00', enabled:true,
    lastRun:'2026-03-23 08:00', insightCount:4, status:'completed', runCount:12,
    lastOutput:'NPS: 62 overall (+4 vs prior month). OEM segment: 71 (strong). Tier-2: 48 (declining). 3 accounts flagged: Denso, Continental, BorgWarner — recommend proactive outreach.',
  },
];

// ── Context provider ──────────────────────────────────────────────
export function PromptProvider({ children }) {
  const [connections,     setConnections]     = useState(() => {
    try { return JSON.parse(localStorage.getItem('gis_connections'))     || INIT_CONNECTIONS; }
    catch { return INIT_CONNECTIONS; }
  });
  const [systemPrompts,   setSystemPrompts]   = useState(() => {
    try { return JSON.parse(localStorage.getItem('gis_system_prompts')) || INIT_SYSTEM_PROMPTS; }
    catch { return INIT_SYSTEM_PROMPTS; }
  });
  const [analystPrompts,  setAnalystPrompts]  = useState(() => {
    try { return JSON.parse(localStorage.getItem('gis_analyst_prompts')) || []; }
    catch { return []; }
  });
  const [sharedInsights,  setSharedInsights]  = useState(() => {
    try { return JSON.parse(localStorage.getItem('gis_shared_insights')) || []; }
    catch { return []; }
  });
  const [auditLog,        setAuditLog]        = useState(() => {
    try { return JSON.parse(localStorage.getItem('gis_audit_log')) || []; }
    catch { return []; }
  });

  // Persist on change
  useEffect(() => { localStorage.setItem('gis_connections',      JSON.stringify(connections));     }, [connections]);
  useEffect(() => { localStorage.setItem('gis_system_prompts',   JSON.stringify(systemPrompts));   }, [systemPrompts]);
  useEffect(() => { localStorage.setItem('gis_analyst_prompts',  JSON.stringify(analystPrompts));  }, [analystPrompts]);
  useEffect(() => { localStorage.setItem('gis_shared_insights',  JSON.stringify(sharedInsights));  }, [sharedInsights]);
  useEffect(() => { localStorage.setItem('gis_audit_log',        JSON.stringify(auditLog));        }, [auditLog]);

  const addAuditEntry = useCallback((action, detail, user) => {
    setAuditLog(prev => [{
      id: `LOG-${Date.now()}`, action, detail, user: user || 'system',
      timestamp: new Date().toLocaleString(),
    }, ...prev].slice(0, 100));
  }, []);

  // ── Connection actions ─────────────────────────────────────────
  const updateConnection = useCallback((id, changes) => {
    setConnections(prev => prev.map(c => c.id === id ? { ...c, ...changes } : c));
  }, []);

  const syncConnection = useCallback((id, userName) => {
    updateConnection(id, { status:'syncing' });
    setTimeout(() => {
      updateConnection(id, { status:'connected', lastSync:'just now' });
      addAuditEntry('Manual Sync', `Connection "${id}" synced successfully`, userName);
    }, 1800);
  }, [updateConnection, addAuditEntry]);

  const addConnection = useCallback((conn) => {
    const newConn = { ...conn, id: `conn-${Date.now()}`, status:'disconnected', lastSync:'Never', records:0 };
    setConnections(prev => [...prev, newConn]);
  }, []);

  const removeConnection = useCallback((id) => {
    setConnections(prev => prev.filter(c => c.id !== id));
  }, []);

  // ── System prompt actions ──────────────────────────────────────
  const addSystemPrompt = useCallback((prompt, userName) => {
    const newPrompt = {
      ...prompt,
      id: `SP-${String(Date.now()).slice(-4)}`,
      status: 'pending', lastRun: 'Never', insightCount: 0, runCount: 0, lastOutput: '',
    };
    setSystemPrompts(prev => [...prev, newPrompt]);
    addAuditEntry('System Prompt Added', `"${prompt.name}" created`, userName);
  }, [addAuditEntry]);

  const toggleSystemPrompt = useCallback((id, userName) => {
    setSystemPrompts(prev => prev.map(p => {
      if (p.id !== id) return p;
      const enabled = !p.enabled;
      addAuditEntry(enabled ? 'Prompt Enabled' : 'Prompt Disabled', `"${p.name}" ${enabled ? 'activated' : 'paused'}`, userName);
      return { ...p, enabled, status: enabled ? 'pending' : 'disabled' };
    }));
  }, [addAuditEntry]);

  const deleteSystemPrompt = useCallback((id, userName) => {
    setSystemPrompts(prev => {
      const found = prev.find(p => p.id === id);
      if (found) addAuditEntry('Prompt Deleted', `"${found.name}" removed`, userName);
      return prev.filter(p => p.id !== id);
    });
  }, [addAuditEntry]);

  const runSystemPrompt = useCallback((id, userName) => {
    setSystemPrompts(prev => prev.map(p => p.id === id ? { ...p, status:'running' } : p));
    setTimeout(() => {
      setSystemPrompts(prev => prev.map(p => {
        if (p.id !== id) return p;
        addAuditEntry('Prompt Executed', `"${p.name}" ran successfully`, userName);
        return { ...p, status:'completed', lastRun: new Date().toLocaleString(), insightCount: p.insightCount + 1, runCount: p.runCount + 1 };
      }));
    }, 2200);
  }, [addAuditEntry]);

  // ── Analyst prompt actions ─────────────────────────────────────
  const saveAnalystPrompt = useCallback((prompt) => {
    const existing = analystPrompts.find(p => p.id === prompt.id);
    if (existing) {
      setAnalystPrompts(prev => prev.map(p => p.id === prompt.id ? { ...p, ...prompt } : p));
    } else {
      setAnalystPrompts(prev => [{ ...prompt, id: `AP-${Date.now()}`, createdAt: new Date().toLocaleString() }, ...prev]);
    }
  }, [analystPrompts]);

  const deleteAnalystPrompt = useCallback((id) => {
    setAnalystPrompts(prev => prev.filter(p => p.id !== id));
    // Also remove from shared if it was shared
    setSharedInsights(prev => prev.filter(s => s.promptId !== id));
  }, []);

  const shareToExecutive = useCallback((prompt, analystName) => {
    const insight = {
      id: `SI-${Date.now()}`,
      promptId: prompt.id,
      title: prompt.title,
      summary: prompt.output?.summary || '',
      keyPoints: prompt.output?.keyPoints || [],
      recommendation: prompt.output?.recommendation || '',
      headline: prompt.output?.headline || prompt.title,
      confidence: prompt.output?.confidence || 80,
      sharedBy: analystName,
      sharedAt: new Date().toLocaleString(),
      sharedAtTs: Date.now(),
      viewed: false,
      pinnedToBoard: false,
    };
    setSharedInsights(prev => [insight, ...prev]);
    setAnalystPrompts(prev => prev.map(p => p.id === prompt.id ? { ...p, shared:true, sharedAt: insight.sharedAt } : p));
    addAuditEntry('Insight Shared', `"${prompt.title}" shared to executive view by ${analystName}`, analystName);
    return insight;
  }, [addAuditEntry]);

  const dismissSharedInsight = useCallback((id) => {
    setSharedInsights(prev => prev.map(s => s.id === id ? { ...s, dismissed:true } : s));
  }, []);

  const pinToBoard = useCallback((id) => {
    setSharedInsights(prev => prev.map(s => s.id === id ? { ...s, pinnedToBoard:true } : s));
  }, []);

  const markViewed = useCallback((id) => {
    setSharedInsights(prev => prev.map(s => s.id === id ? { ...s, viewed:true } : s));
  }, []);

  const recallSharedInsight = useCallback((promptId) => {
    setSharedInsights(prev => prev.filter(s => s.promptId !== promptId));
    setAnalystPrompts(prev => prev.map(p => p.id === promptId ? { ...p, shared:false, sharedAt:null } : p));
  }, []);

  const visibleSharedInsights = sharedInsights.filter(s => !s.dismissed);
  const unviewedCount = visibleSharedInsights.filter(s => !s.viewed).length;

  return (
    <PromptContext.Provider value={{
      // State
      connections,
      systemPrompts,
      analystPrompts,
      sharedInsights: visibleSharedInsights,
      unviewedCount,
      auditLog,
      // Connection actions
      updateConnection, syncConnection, addConnection, removeConnection,
      // System prompt actions
      addSystemPrompt, toggleSystemPrompt, deleteSystemPrompt, runSystemPrompt,
      // Analyst prompt actions
      saveAnalystPrompt, deleteAnalystPrompt,
      shareToExecutive, recallSharedInsight,
      // Executive actions
      dismissSharedInsight, pinToBoard, markViewed,
    }}>
      {children}
    </PromptContext.Provider>
  );
}
