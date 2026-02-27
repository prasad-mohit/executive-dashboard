import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useWorkspace } from '../contexts/WorkspaceContext';
import agentOrchestrator from '../services/agentOrchestrator';
import mcpConnector from '../services/mcpConnector';
import scheduledPromptsService from '../services/scheduledPromptsService';
import dataFeedService from '../services/dataFeedService';
import ConnectorStatus from './ConnectorStatus';
import RiskPanel from './RiskPanel';
import RecommendationsPanel from './RecommendationsPanel';
import AgentOrchestrationPanel from './AgentOrchestrationPanel';

/* ── Mini sparkline bar chart ── */
function SparkBar({ values = [], color = '#3b82f6', height = 32 }) {
  const max = Math.max(...values, 1);
  return (
    <div className="flex items-end gap-0.5" style={{ height }}>
      {values.map((v, i) => (
        <div
          key={i}
          className="flex-1 rounded-t-sm transition-all duration-300"
          style={{
            height: `${(v / max) * height}px`,
            background: i === values.length - 1 ? color : `${color}55`,
            minWidth: 3,
          }}
        />
      ))}
    </div>
  );
}

/* ── Arc gauge SVG ── */
function ArcGauge({ value = 0, max = 100, color = '#3b82f6', size = 72, label }) {
  const r = (size - 12) / 2;
  const circ = 2 * Math.PI * r;
  const arc = circ * 0.75;
  const filled = arc * Math.min(value / max, 1);
  const cx = size / 2, cy = size / 2;
  return (
    <div className="flex flex-col items-center gap-1">
      <svg width={size} height={size} style={{ transform: 'rotate(135deg)' }}>
        <circle cx={cx} cy={cy} r={r} fill="none" stroke="rgba(30,58,95,0.4)" strokeWidth="6"
          strokeDasharray={`${arc} ${circ - arc}`} strokeLinecap="round" />
        <circle cx={cx} cy={cy} r={r} fill="none" stroke={color} strokeWidth="6"
          strokeDasharray={`${filled} ${circ - filled}`}
          strokeLinecap="round"
          style={{ filter: `drop-shadow(0 0 5px ${color}88)`, transition: 'stroke-dasharray 1.2s ease' }}
        />
        <text x={cx} y={cy - 2} textAnchor="middle" fill="white" fontSize="13" fontWeight="700"
          style={{ transform: 'rotate(-135deg)', transformOrigin: `${cx}px ${cy}px` }}>
          {value}
        </text>
        <text x={cx} y={cy + 11} textAnchor="middle" fill="rgba(148,163,184,0.7)" fontSize="8"
          style={{ transform: 'rotate(-135deg)', transformOrigin: `${cx}px ${cy}px` }}>
          {label}
        </text>
      </svg>
    </div>
  );
}

/* ── KPI Card ── */
function KPICard({ icon, label, value, sub, color, sparkData, trend }) {
  return (
    <div
      className="rounded-2xl p-5 flex flex-col gap-3 transition-all duration-300 hover:-translate-y-0.5"
      style={{
        background: 'rgba(8,15,31,0.9)',
        border: `1px solid ${color}25`,
        boxShadow: `0 4px 24px ${color}08`,
      }}
    >
      <div className="flex items-start justify-between">
        <div
          className="w-10 h-10 rounded-xl flex items-center justify-center text-lg flex-shrink-0"
          style={{ background: `${color}18`, border: `1px solid ${color}30` }}
        >
          {icon}
        </div>
        {trend !== undefined && (
          <span
            className="text-xs font-semibold px-2 py-1 rounded-full"
            style={{
              background: trend >= 0 ? 'rgba(16,185,129,0.12)' : 'rgba(239,68,68,0.12)',
              color: trend >= 0 ? '#10b981' : '#ef4444',
            }}
          >
            {trend >= 0 ? '↑' : '↓'} {Math.abs(trend)}%
          </span>
        )}
      </div>
      <div>
        <div className="text-2xl font-extrabold text-white leading-none mb-1"
          style={{ textShadow: `0 0 20px ${color}44` }}>
          {value}
        </div>
        <div className="text-xs text-slate-500">{label}</div>
        {sub && <div className="text-xs mt-0.5" style={{ color: color + 'aa' }}>{sub}</div>}
      </div>
      {sparkData && <SparkBar values={sparkData} color={color} />}
    </div>
  );
}

/* ── Severity colour map ── */
const SEV_COLOR = { high: '#ef4444', medium: '#f59e0b', low: '#10b981' };

/* ── Live Feed Ticker strip ── */
function FeedTicker({ events }) {
  const ref = useRef(null);
  const latest = events.slice(0, 12);
  const meta = dataFeedService.eventMeta;
  return (
    <div
      className="rounded-xl px-4 py-2.5 flex items-center gap-3 overflow-hidden relative"
      style={{ background: 'rgba(5,12,26,0.8)', border: '1px solid rgba(30,58,95,0.4)' }}
    >
      <span className="text-xs font-bold px-2 py-0.5 rounded flex-shrink-0"
        style={{ background: 'rgba(16,185,129,0.15)', color: '#10b981', border: '1px solid rgba(16,185,129,0.3)' }}>
        ● LIVE
      </span>
      <div className="flex-1 overflow-hidden">
        <div
          ref={ref}
          className="flex items-center gap-6 animate-marquee"
          style={{ whiteSpace: 'nowrap' }}
        >
          {[...latest, ...latest].map((ev, i) => {
            const m = meta[ev.eventType] || meta.data_sync;
            const fromColor = dataFeedService.systemColors[ev.from] || '#64748b';
            const toColor   = dataFeedService.systemColors[ev.to]   || '#64748b';
            return (
              <span key={i} className="flex items-center gap-1.5 text-xs flex-shrink-0">
                <span>{m.icon}</span>
                <span style={{ color: fromColor }}>{ev.from}</span>
                <span className="text-slate-700">→</span>
                <span style={{ color: toColor }}>{ev.to}</span>
                <span className="text-slate-600 truncate" style={{ maxWidth: 200 }}>
                  {ev.message.slice(0, 55)}{ev.message.length > 55 ? '…' : ''}
                </span>
                <span className="text-slate-800 mx-2">·</span>
              </span>
            );
          })}
        </div>
      </div>
    </div>
  );
}

/* ── Prompt Signal Card (mini) ── */
function PromptSignalCard({ prompt }) {
  if (!prompt.lastResult) return null;
  const sev   = SEV_COLOR[prompt.lastResult.severity] || '#64748b';
  const pct   = Math.min(1, 1 - (prompt.remaining ?? prompt.freq) / prompt.freq);
  const r     = 12, circ = 2 * Math.PI * r;
  return (
    <div
      className="rounded-xl p-3.5 flex flex-col gap-2.5 transition-all duration-300"
      style={{
        background:  prompt.status === 'running' ? `${prompt.color}08` : 'rgba(8,15,31,0.9)',
        border:      `1px solid ${prompt.enabled ? prompt.color + '28' : 'rgba(30,58,95,0.2)'}`,
        opacity:     prompt.enabled ? 1 : 0.5,
      }}
    >
      {/* Top row: icon + name + severity badge + countdown */}
      <div className="flex items-center gap-2">
        <span className="text-base flex-shrink-0">{prompt.icon}</span>
        <div className="flex-1 min-w-0">
          <div className="text-xs font-semibold text-white truncate">{prompt.name}</div>
          <div className="flex items-center gap-1.5 mt-0.5 flex-wrap">
            {prompt.systems.map(s => (
              <span key={s} className="text-xs" style={{ color: dataFeedService.systemColors[s] || '#64748b' }}>
                {s}
              </span>
            ))}
          </div>
        </div>
        {/* Mini countdown ring */}
        <svg width="30" height="30" style={{ transform: 'rotate(-90deg)', flexShrink: 0 }}>
          <circle cx="15" cy="15" r={r} fill="none" stroke="rgba(30,58,95,0.4)" strokeWidth="2.5" />
          <circle cx="15" cy="15" r={r} fill="none" stroke={prompt.enabled ? prompt.color : '#334155'}
            strokeWidth="2.5"
            strokeDasharray={`${circ * pct} ${circ * (1 - pct)}`}
            strokeLinecap="round"
            style={{ transition: 'stroke-dasharray 0.8s ease', filter: `drop-shadow(0 0 3px ${prompt.color}55)` }}
          />
        </svg>
      </div>

      {/* Result summary */}
      <div className="rounded-lg px-3 py-2"
        style={{ background: `${sev}09`, border: `1px solid ${sev}22` }}>
        <div className="flex items-center justify-between mb-1">
          <span className="text-xs font-bold" style={{ color: sev }}>
            {prompt.lastResult.severity.toUpperCase()}
          </span>
          <span className="text-xs text-slate-700">
            {prompt.lastResult.confidence}% · {prompt.runCount}× ran
          </span>
        </div>
        <p className="text-xs text-slate-500 leading-relaxed"
          style={{ display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
          {prompt.lastResult.insight}
        </p>
      </div>

      {/* Source system data flow bar */}
      <div className="flex items-center gap-1">
        {prompt.systems.map((s, i) => (
          <div key={s} className="flex items-center gap-1 flex-1">
            <div className="h-1 flex-1 rounded-full transition-all duration-1000"
              style={{
                background: prompt.status === 'running' ? `${dataFeedService.systemColors[s] || '#64748b'}` : `${dataFeedService.systemColors[s] || '#64748b'}40`,
                boxShadow:  prompt.status === 'running' ? `0 0 6px ${dataFeedService.systemColors[s] || '#64748b'}` : 'none',
              }}
            />
            {i < prompt.systems.length - 1 && (
              <span className="text-xs text-slate-700">→</span>
            )}
          </div>
        ))}
        <span className="text-xs text-slate-700 flex-shrink-0 ml-1">🤖</span>
      </div>
    </div>
  );
}

export default function Dashboard() {
  const { user } = useAuth();
  const { settings } = useWorkspace();
  const [loading, setLoading]               = useState(true);
  const [orchestrationData, setOrchestrationData] = useState(null);
  const [healthData, setHealthData]         = useState(null);
  const [refreshing, setRefreshing]         = useState(false);
  const [dataTimeSlice, setDataTimeSlice]   = useState({ start: null, end: null, range: 'Last 30 days' });
  const [pulseIndex, setPulseIndex]         = useState(0);

  /* ── Scheduled prompts + data feed subscriptions ── */
  const [promptsState, setPromptsState] = useState({ prompts: [], history: [] });
  const [feedEvents, setFeedEvents]     = useState([]);

  const accentColor = user?.personaConfig?.accentColor || '#3b82f6';

  useEffect(() => {
    const t = setInterval(() => setPulseIndex(i => (i + 1) % 4), 1200);
    return () => clearInterval(t);
  }, []);

  /* Subscribe to services on mount */
  useEffect(() => {
    scheduledPromptsService.init();
    const unsubPrompts = scheduledPromptsService.subscribe(setPromptsState);
    const unsubFeed    = dataFeedService.subscribe(setFeedEvents);
    return () => { unsubPrompts(); unsubFeed(); };
  }, []);

  const loadData = async () => {
    try {
      setRefreshing(true);
      const endDate = new Date(), startDate = new Date();
      startDate.setDate(startDate.getDate() - 30);
      setDataTimeSlice({ start: startDate, end: endDate, range: 'Last 30 days' });
      const health = await mcpConnector.getHealthStatus();
      setHealthData(health);
      const result = await agentOrchestrator.orchestrate();
      setOrchestrationData(result);
      setLoading(false);
    } catch (e) {
      console.error(e);
      setLoading(false);
    } finally {
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadData();
    if (settings?.autoRefresh) {
      const iv = setInterval(loadData, (settings?.globalRefreshInterval || 30) * 1000);
      return () => clearInterval(iv);
    }
  }, [settings?.autoRefresh, settings?.globalRefreshInterval]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: '#020817' }}>
        <div className="text-center">
          <div className="relative w-20 h-20 mx-auto mb-6">
            <div className="absolute inset-0 rounded-full border-2 border-blue-600/20 animate-ping" />
            <div className="absolute inset-2 rounded-full border-2 border-blue-500/40 animate-ping" style={{ animationDelay: '0.2s' }} />
            <div className="absolute inset-0 rounded-full border-t-2 border-blue-500 animate-spin"
              style={{ boxShadow: '0 0 20px rgba(59,130,246,0.4)' }} />
            <div className="absolute inset-0 flex items-center justify-center text-2xl">⚡</div>
          </div>
          <p className="text-white font-semibold text-lg">Initializing Executive OS</p>
          <p className="text-slate-500 text-sm mt-1">AI agents are preparing your briefing…</p>
          <div className="flex items-center justify-center gap-2 mt-4">
            {['Data Aggregation', 'Risk Analysis', 'Recommendations', 'Priority Scoring'].map((step, i) => (
              <div key={i} className="flex items-center gap-1.5">
                <div className="w-1.5 h-1.5 rounded-full transition-all duration-300"
                  style={{ background: i <= pulseIndex ? accentColor : '#1e3a5f' }} />
                <span className="text-xs text-slate-600 hidden sm:inline">{step}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  const risks              = orchestrationData?.prioritizedData?.prioritizedRisks || [];
  const recommendations    = orchestrationData?.prioritizedData?.prioritizedRecommendations || [];
  const onlineConnectors   = Object.values(healthData?.connectors || {}).filter(s => s === 'online').length;

  /* ── Prompt-driven rollup computations ── */
  const activePrompts  = promptsState.prompts.filter(p => p.enabled);
  const runningPrompts = promptsState.prompts.filter(p => p.status === 'running');
  const totalRuns      = promptsState.prompts.reduce((s, p) => s + p.runCount, 0);
  const promptHistory  = promptsState.history;

  /* Aggregate severity counts from most-recent run per prompt */
  const promptAlerts = promptsState.prompts
    .filter(p => p.lastResult?.severity === 'high')
    .length;

  /* Weighted confidence from both AI orchestration and prompt results */
  const promptConfidences = promptsState.prompts
    .filter(p => p.lastResult?.confidence)
    .map(p => p.lastResult.confidence);
  const blendedConfidence = promptConfidences.length
    ? Math.round(
        (promptConfidences.reduce((a, b) => a + b, 0) / promptConfidences.length * 0.4) +
        ((orchestrationData?.averageConfidence || 87) * 0.6)
      )
    : (orchestrationData?.averageConfidence || 87);

  /* Feed event rollups */
  const cutoff5m   = Date.now() - 5 * 60 * 1000;
  const recentFeed = feedEvents.filter(e => new Date(e.ts).getTime() > cutoff5m);
  const highAlerts = feedEvents.filter(e => e.severity === 'high').slice(0, 3);

  const kpiCards = [
    {
      icon: '⚠️', label: 'Active Risks', value: risks.length,
      sub: `${risks.filter(r => r.severity === 'high').length} high · ${promptAlerts} from prompts`,
      color: '#ef4444',
      sparkData: [2, 4, 3, 5, 4, 6, risks.length + promptAlerts],
      trend: -12,
    },
    {
      icon: '💡', label: 'Recommendations', value: recommendations.length,
      sub: `${recommendations.filter(r => r.priority === 'urgent').length} urgent`,
      color: '#10b981',
      sparkData: [3, 5, 4, 6, 5, 7, recommendations.length],
      trend: 8,
    },
    {
      icon: '🧠', label: 'Scheduled Prompts', value: `${activePrompts.length} / ${promptsState.prompts.length}`,
      sub: `${totalRuns} runs · ${runningPrompts.length > 0 ? runningPrompts.length + ' running' : 'idle'}`,
      color: '#a78bfa',
      sparkData: promptsState.prompts.map(p => p.runCount).concat([totalRuns]),
      trend: totalRuns > 0 ? 5 : 0,
    },
    {
      icon: '🔌', label: 'Data Sources', value: `${onlineConnectors} / 6`,
      sub: `${recentFeed.length} events in 5m`,
      color: '#8b5cf6',
      sparkData: [5, 5, 6, 5, 6, 6, onlineConnectors],
      trend: onlineConnectors >= 5 ? 5 : -10,
    },
    {
      icon: '🎯', label: 'Decision Confidence', value: `${blendedConfidence}%`,
      sub: 'Blended AI + prompt score',
      color: '#f59e0b',
      sparkData: [80, 82, 85, 83, 86, 88, blendedConfidence],
      trend: 3,
    },
  ];

  /* Prompts to surface on dashboard — with results, sorted by severity */
  const sevOrder = { high: 0, medium: 1, low: 2 };
  const surfacedPrompts = [...promptsState.prompts]
    .filter(p => p.lastResult)
    .sort((a, b) => (sevOrder[a.lastResult.severity] ?? 3) - (sevOrder[b.lastResult.severity] ?? 3))
    .slice(0, 4);

  return (
    <div className="p-6 space-y-5 animate-fade-in">

      {/* ── Page Header ── */}
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-3 mb-1 flex-wrap">
            <h1 className="text-2xl font-extrabold text-white tracking-tight">
              {user?.personaConfig?.icon} Executive Dashboard
            </h1>
            <span className="text-xs px-2.5 py-1 rounded-full font-semibold"
              style={{ background: `${accentColor}18`, color: accentColor, border: `1px solid ${accentColor}30` }}>
              {user?.personaConfig?.label || user?.role}
            </span>
            {runningPrompts.length > 0 && (
              <span className="text-xs px-2.5 py-1 rounded-full font-semibold animate-pulse"
                style={{ background: 'rgba(167,139,250,0.12)', color: '#a78bfa', border: '1px solid rgba(167,139,250,0.3)' }}>
                {runningPrompts.length} prompt{runningPrompts.length > 1 ? 's' : ''} running
              </span>
            )}
            {promptAlerts > 0 && (
              <span className="text-xs px-2.5 py-1 rounded-full font-semibold"
                style={{ background: 'rgba(239,68,68,0.12)', color: '#ef4444', border: '1px solid rgba(239,68,68,0.3)' }}>
                ⚠ {promptAlerts} prompt alert{promptAlerts > 1 ? 's' : ''}
              </span>
            )}
          </div>
          <p className="text-slate-500 text-sm">
            {dataTimeSlice.start?.toLocaleDateString()} – {dataTimeSlice.end?.toLocaleDateString()}
            <span className="mx-2 text-slate-700">·</span>
            <span style={{ color: accentColor }}>Real-time AI synthesis</span>
          </p>
        </div>

        <div className="flex items-center gap-3 flex-shrink-0">
          <div className="px-4 py-2 rounded-xl text-sm font-medium"
            style={{ background: 'rgba(15,31,61,0.6)', border: '1px solid rgba(30,58,95,0.5)', color: '#94a3b8' }}>
            📅 {dataTimeSlice.range}
          </div>
          <button onClick={loadData} disabled={refreshing}
            className="flex items-center gap-2 px-5 py-2 rounded-xl text-sm font-semibold transition-all disabled:opacity-50"
            style={{
              background: 'linear-gradient(135deg, #2563eb, #0ea5e9)', color: 'white',
              boxShadow: refreshing ? 'none' : '0 0 20px rgba(37,99,235,0.4)',
            }}>
            <svg className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`}
              fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round"
                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/>
            </svg>
            {refreshing ? 'Refreshing…' : 'Refresh'}
          </button>
        </div>
      </div>

      {/* ── Live Feed Ticker ── */}
      {feedEvents.length > 0 && <FeedTicker events={feedEvents} />}

      {/* ── KPI Row ── */}
      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-5 gap-4">
        {kpiCards.map((kpi, i) => <KPICard key={i} {...kpi} />)}
      </div>

      {/* ── Main 3-Column Grid ── */}
      <div className="grid grid-cols-12 gap-5">

        {/* Left: Connectors + Gauges */}
        <div className="col-span-12 xl:col-span-3 space-y-5">
          <ConnectorStatus healthData={healthData} />

          {/* AI Performance Gauges */}
          <div className="rounded-2xl p-5"
            style={{ background: 'rgba(8,15,31,0.9)', border: '1px solid rgba(30,58,95,0.4)' }}>
            <h3 className="text-sm font-semibold text-slate-300 mb-4">⚡ AI Performance</h3>
            <div className="grid grid-cols-2 gap-4">
              <ArcGauge value={94} max={100} color="#10b981" label="Accuracy" />
              <ArcGauge value={blendedConfidence} max={100} color="#f59e0b" label="Confidence" />
              <ArcGauge value={onlineConnectors} max={6} color="#3b82f6" label="Sources" />
              <ArcGauge value={activePrompts.length} max={promptsState.prompts.length || 5} color="#a78bfa" label="Prompts" />
            </div>
          </div>

          {/* High-severity feed alerts */}
          {highAlerts.length > 0 && (
            <div className="rounded-2xl p-4"
              style={{ background: 'rgba(8,15,31,0.9)', border: '1px solid rgba(239,68,68,0.25)' }}>
              <h3 className="text-xs font-semibold text-red-400 mb-3 uppercase tracking-wider">
                🔴 Feed Alerts
              </h3>
              <div className="space-y-2">
                {highAlerts.map(ev => (
                  <div key={ev.id} className="rounded-lg px-3 py-2 text-xs"
                    style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)' }}>
                    <div className="flex items-center gap-1.5 mb-0.5">
                      <span style={{ color: dataFeedService.systemColors[ev.from] || '#ef4444' }}>{ev.from}</span>
                      <span className="text-slate-700">→</span>
                      <span style={{ color: dataFeedService.systemColors[ev.to] || '#94a3b8' }}>{ev.to}</span>
                      <span className="ml-auto text-slate-700 tabular-nums">
                        {new Date(ev.ts).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    <p className="text-slate-500 leading-relaxed">{ev.message.slice(0, 70)}{ev.message.length > 70 ? '…' : ''}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Center: Risk + Recommendations */}
        <div className="col-span-12 xl:col-span-6 space-y-5">
          <RiskPanel risks={risks} dataWindow={dataTimeSlice.range} />
          <RecommendationsPanel recommendations={recommendations} />
        </div>

        {/* Right: Agent Orchestration + Prompt Signals + System Health */}
        <div className="col-span-12 xl:col-span-3 space-y-5">
          <AgentOrchestrationPanel orchestrationData={orchestrationData} />

          {/* ── Prompt Signals Panel ── */}
          {surfacedPrompts.length > 0 && (
            <div className="rounded-2xl overflow-hidden"
              style={{ background: 'rgba(8,15,31,0.9)', border: '1px solid rgba(30,58,95,0.4)' }}>
              <div className="px-5 py-3.5 flex items-center justify-between"
                style={{ borderBottom: '1px solid rgba(30,58,95,0.35)' }}>
                <div>
                  <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                    🧠 Prompt Signals
                    {promptAlerts > 0 && (
                      <span className="text-xs px-1.5 py-0.5 rounded font-bold"
                        style={{ background: 'rgba(239,68,68,0.15)', color: '#ef4444' }}>
                        {promptAlerts} HIGH
                      </span>
                    )}
                  </h3>
                  <p className="text-xs text-slate-600 mt-0.5">
                    {totalRuns} total runs · {activePrompts.length} active prompts
                  </p>
                </div>
                <a href="/prompts"
                  className="text-xs px-2.5 py-1 rounded-lg transition-all"
                  style={{ background: `${accentColor}18`, color: accentColor, border: `1px solid ${accentColor}30` }}>
                  Manage →
                </a>
              </div>
              <div className="p-3.5 space-y-3">
                {surfacedPrompts.map(p => (
                  <PromptSignalCard key={p.id} prompt={p} />
                ))}
              </div>

              {/* Execution flow mini-timeline */}
              {promptHistory.length > 0 && (
                <div className="px-5 pb-4">
                  <div className="text-xs text-slate-700 mb-2 uppercase tracking-wider">Recent executions</div>
                  <div className="space-y-1.5">
                    {promptHistory.slice(0, 5).map(h => {
                      const sev = SEV_COLOR[h.result?.severity] || '#64748b';
                      return (
                        <div key={h.id} className="flex items-center gap-2 text-xs">
                          <span>{h.icon}</span>
                          <span className="text-slate-500 truncate flex-1">{h.promptName}</span>
                          <div className="flex items-center gap-1 flex-shrink-0">
                            <div className="w-1.5 h-1.5 rounded-full" style={{ background: sev }} />
                            <span className="text-slate-700 tabular-nums">
                              {new Date(h.ts).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* System Health */}
          <div className="rounded-2xl p-5"
            style={{ background: 'rgba(8,15,31,0.9)', border: '1px solid rgba(30,58,95,0.4)' }}>
            <h3 className="text-sm font-semibold text-slate-300 mb-4">🛡️ System Health</h3>
            <div className="space-y-3">
              {[
                { label: 'MCP Server',       value: healthData?.status || 'Online', color: '#10b981', bar: 99 },
                { label: 'Uptime SLA',        value: '99.9%', color: '#10b981', bar: 99 },
                { label: 'Data Sources',      value: `${onlineConnectors}/6 online`, color: onlineConnectors >= 5 ? '#10b981' : '#f59e0b', bar: (onlineConnectors / 6) * 100 },
                { label: 'Active Prompts',    value: `${activePrompts.length}/${promptsState.prompts.length}`, color: '#a78bfa', bar: promptsState.prompts.length ? (activePrompts.length / promptsState.prompts.length) * 100 : 0 },
                { label: 'Feed Events (5m)',  value: recentFeed.length, color: '#06b6d4', bar: Math.min(100, recentFeed.length * 5) },
                { label: 'Last Refresh',      value: orchestrationData?.timestamp ? new Date(orchestrationData.timestamp).toLocaleTimeString() : 'N/A', color: '#94a3b8', bar: null },
              ].map(item => (
                <div key={item.label}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs text-slate-500">{item.label}</span>
                    <span className="text-xs font-semibold" style={{ color: item.color }}>{item.value}</span>
                  </div>
                  {item.bar !== null && (
                    <div className="h-1 rounded-full" style={{ background: 'rgba(30,58,95,0.4)' }}>
                      <div className="h-full rounded-full transition-all duration-1000"
                        style={{ width: `${item.bar}%`, background: item.color, boxShadow: `0 0 6px ${item.color}` }} />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
