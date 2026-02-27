import { useState, useEffect, useRef } from 'react';
import dataFeedService from '../services/dataFeedService';

/* ── SVG topology layout ──
   AI Orchestrator hub at centre; 6 data-source nodes arranged hexagonally around it. */
const PERIPHERALS = {
  ERP:    { x: 62,  y: 58,  icon: '🏭', label: 'ERP',    color: '#f59e0b' },
  CRM:    { x: 318, y: 58,  icon: '🤝', label: 'CRM',    color: '#3b82f6' },
  HR:     { x: 18,  y: 162, icon: '💼', label: 'HR',     color: '#8b5cf6' },
  Email:  { x: 362, y: 162, icon: '✉️', label: 'Email',  color: '#06b6d4' },
  Market: { x: 62,  y: 268, icon: '📈', label: 'Market', color: '#10b981' },
  News:   { x: 318, y: 268, icon: '📰', label: 'News',   color: '#f97316' },
};
const HUB = { x: 190, y: 163, icon: '🤖', color: '#a78bfa' };

const SYS_COLORS = {
  ERP: '#f59e0b', CRM: '#3b82f6', HR: '#8b5cf6', Email: '#06b6d4',
  Market: '#10b981', News: '#f97316',
  'AI Orchestrator': '#a78bfa', 'Executive OS': '#60a5fa',
  'Risk Analyzer': '#ef4444', 'Decision Agent': '#10b981',
};

const EV_META = {
  prompt_query:   { icon: '🔍', color: '#3b82f6' },
  prompt_result:  { icon: '✨', color: '#10b981' },
  data_sync:      { icon: '🔄', color: '#475569' },
  alert:          { icon: '⚠️', color: '#ef4444' },
  analysis:       { icon: '🧠', color: '#8b5cf6' },
  recommendation: { icon: '💡', color: '#f97316' },
};

const FILTER_LIST = ['All', 'ERP', 'CRM', 'HR', 'Email', 'Market', 'News', 'AI Orchestrator'];

/* ── SVG Topology Map ── */
function TopologyMap({ activeIn, activeOut }) {
  return (
    <svg viewBox="0 0 380 328" className="w-full" style={{ maxHeight: 260 }}>
      {/* Connection lines + animated pulses */}
      {Object.entries(PERIPHERALS).map(([key, n]) => {
        const isIn  = activeIn.has(key);
        const isOut = activeOut.has(key);
        const isActive = isIn || isOut;
        return (
          <g key={key}>
            {/* Static line */}
            <line
              x1={n.x} y1={n.y} x2={HUB.x} y2={HUB.y}
              stroke={isActive ? n.color : 'rgba(30,58,95,0.28)'}
              strokeWidth={isActive ? 1.5 : 0.8}
              strokeDasharray={isActive ? '5 3' : '3 6'}
              style={{ transition: 'stroke 0.4s, stroke-width 0.4s' }}
            />
            {/* Inbound: peripheral → hub */}
            {isIn && (
              <circle r="4.5" fill={n.color} opacity="0.95"
                style={{ filter: `drop-shadow(0 0 5px ${n.color})` }}>
                <animateMotion
                  dur="1.2s" repeatCount="indefinite"
                  path={`M${n.x},${n.y} L${HUB.x},${HUB.y}`}
                />
              </circle>
            )}
            {/* Outbound: hub → peripheral */}
            {isOut && (
              <circle r="3.5" fill={HUB.color} opacity="0.9"
                style={{ filter: `drop-shadow(0 0 4px ${HUB.color})` }}>
                <animateMotion
                  dur="1.2s" repeatCount="indefinite"
                  path={`M${HUB.x},${HUB.y} L${n.x},${n.y}`}
                />
              </circle>
            )}
          </g>
        );
      })}

      {/* Peripheral nodes */}
      {Object.entries(PERIPHERALS).map(([key, n]) => {
        const active = activeIn.has(key) || activeOut.has(key);
        return (
          <g key={key}>
            {/* Outer glow ring */}
            {active && (
              <circle cx={n.x} cy={n.y} r={30} fill="none"
                stroke={n.color} strokeWidth="0.8" opacity="0.22"
                style={{ animation: 'pulse 1.8s ease-in-out infinite' }}
              />
            )}
            {/* Node circle */}
            <circle cx={n.x} cy={n.y} r={24}
              fill={active ? `${n.color}1c` : 'rgba(5,12,26,0.95)'}
              stroke={active ? n.color : 'rgba(30,58,95,0.45)'}
              strokeWidth={active ? 2 : 1}
              style={{
                transition: 'all 0.35s',
                filter: active ? `drop-shadow(0 0 10px ${n.color}55)` : 'none',
              }}
            />
            {/* Icon */}
            <text x={n.x} y={n.y - 2} textAnchor="middle" fontSize="13">{n.icon}</text>
            {/* Label */}
            <text x={n.x} y={n.y + 13} textAnchor="middle" fontSize="8.5"
              fontWeight={active ? '700' : '400'}
              fill={active ? n.color : '#475569'}>
              {n.label}
            </text>
          </g>
        );
      })}

      {/* Hub: outer pulse rings */}
      <circle cx={HUB.x} cy={HUB.y} r={50} fill="none"
        stroke={`${HUB.color}08`} strokeWidth="1"
        style={{ animation: 'pulse 2.8s ease-in-out infinite', animationDelay: '0.9s' }}
      />
      <circle cx={HUB.x} cy={HUB.y} r={42} fill="none"
        stroke={`${HUB.color}14`} strokeWidth="1.2"
        style={{ animation: 'pulse 2.4s ease-in-out infinite' }}
      />
      {/* Hub body */}
      <circle cx={HUB.x} cy={HUB.y} r={32}
        fill="rgba(5,12,26,0.98)"
        stroke={HUB.color}
        strokeWidth="2"
        style={{ filter: `drop-shadow(0 0 16px ${HUB.color}55)` }}
      />
      {/* Hub icon + labels */}
      <text x={HUB.x} y={HUB.y - 6} textAnchor="middle" fontSize="15">{HUB.icon}</text>
      <text x={HUB.x} y={HUB.y + 9}  textAnchor="middle" fontSize="8.5" fontWeight="700" fill={HUB.color}>AI</text>
      <text x={HUB.x} y={HUB.y + 21} textAnchor="middle" fontSize="7.5" fill={`${HUB.color}99`}>Orchestrator</text>
    </svg>
  );
}

function fmtTs(ts) {
  return new Date(ts).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
}

/* ── Main Component ── */
export default function InteroperabilityFeed() {
  const [events, setEvents] = useState([]);
  const [filter, setFilter] = useState('All');
  const [paused, setPaused] = useState(false);
  const bufRef = useRef([]);

  useEffect(() => {
    const unsub = dataFeedService.subscribe(evs => {
      bufRef.current = evs;
      if (!paused) setEvents([...evs]);
    });
    return unsub;
  }, [paused]);

  /* Resume: sync buffer to state */
  useEffect(() => {
    if (!paused) setEvents([...bufRef.current]);
  }, [paused]);

  /* Compute which nodes were active in the last 4 seconds */
  const cutoff  = Date.now() - 4000;
  const activeIn  = new Set();
  const activeOut = new Set();
  events.slice(0, 20).forEach(ev => {
    if (new Date(ev.ts).getTime() > cutoff) {
      if (PERIPHERALS[ev.from]) activeIn.add(ev.from);
      if (PERIPHERALS[ev.to])   activeOut.add(ev.to);
    }
  });

  const filtered = filter === 'All'
    ? events
    : events.filter(ev => ev.from === filter || ev.to === filter);

  const totalActive = new Set([...activeIn, ...activeOut]).size;

  return (
    <div
      className="rounded-2xl overflow-hidden flex flex-col"
      style={{ background: 'rgba(8,15,31,0.9)', border: '1px solid rgba(30,58,95,0.4)' }}
    >
      {/* ── Header ── */}
      <div className="px-5 py-4 flex items-center justify-between flex-shrink-0"
        style={{ borderBottom: '1px solid rgba(30,58,95,0.4)' }}>
        <div>
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            🕸️ Interoperability Feed
            <span className="text-xs px-2 py-0.5 rounded-full font-semibold"
              style={{ background: 'rgba(16,185,129,0.12)', color: '#10b981', border: '1px solid rgba(16,185,129,0.3)' }}>
              LIVE
            </span>
            {totalActive > 0 && (
              <span className="text-xs px-2 py-0.5 rounded-full font-semibold"
                style={{ background: 'rgba(167,139,250,0.12)', color: '#a78bfa', border: '1px solid rgba(167,139,250,0.3)' }}>
                {totalActive} active
              </span>
            )}
          </h2>
          <p className="text-xs text-slate-600 mt-0.5">Real-time cross-system data exchange</p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-700">{events.length} events</span>
          <button
            onClick={() => setPaused(p => !p)}
            className="text-xs px-3 py-1.5 rounded-lg transition-all"
            style={{
              background: paused ? 'rgba(245,158,11,0.12)' : 'rgba(30,58,95,0.4)',
              color:      paused ? '#f59e0b' : '#64748b',
              border:     `1px solid ${paused ? 'rgba(245,158,11,0.3)' : 'rgba(30,58,95,0.4)'}`,
            }}
          >
            {paused ? '▶ Resume' : '⏸ Pause'}
          </button>
        </div>
      </div>

      {/* ── Body: topology left + feed right ── */}
      <div className="flex flex-col xl:flex-row flex-1 min-h-0">

        {/* Topology panel */}
        <div className="xl:w-64 flex-shrink-0 p-4"
          style={{ borderRight: '1px solid rgba(30,58,95,0.28)', borderBottom: '1px solid rgba(30,58,95,0.2)' }}>
          <div className="text-xs font-semibold uppercase tracking-wider text-slate-700 mb-3">
            System Topology
          </div>
          <TopologyMap activeIn={activeIn} activeOut={activeOut} />

          {/* System legend */}
          <div className="mt-3 space-y-1.5">
            {Object.entries(PERIPHERALS).map(([key, n]) => {
              const active = activeIn.has(key) || activeOut.has(key);
              const dir    = activeIn.has(key) && activeOut.has(key) ? '↕'
                           : activeIn.has(key)  ? '↑ sending'
                           : activeOut.has(key) ? '↓ receiving'
                           : '';
              return (
                <div key={key} className="flex items-center gap-2 text-xs">
                  <div className="w-2 h-2 rounded-full flex-shrink-0"
                    style={{
                      background:  active ? n.color : 'rgba(30,58,95,0.5)',
                      boxShadow:   active ? `0 0 6px ${n.color}` : 'none',
                      transition:  'all 0.3s',
                    }}
                  />
                  <span style={{ color: active ? n.color : '#475569', transition: 'color 0.3s' }}>
                    {n.label}
                  </span>
                  {active && (
                    <span className="ml-auto text-xs" style={{ color: '#10b981' }}>{dir}</span>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Event feed */}
        <div className="flex-1 flex flex-col min-h-0">
          {/* Filter chips */}
          <div className="px-4 py-3 flex items-center gap-1.5 flex-wrap flex-shrink-0"
            style={{ borderBottom: '1px solid rgba(30,58,95,0.3)' }}>
            {FILTER_LIST.map(s => (
              <button key={s} onClick={() => setFilter(s)}
                className="text-xs px-2.5 py-1 rounded-full transition-all"
                style={{
                  background: filter === s ? `${SYS_COLORS[s] || '#3b82f6'}20` : 'rgba(30,58,95,0.2)',
                  color:      filter === s ? (SYS_COLORS[s] || '#3b82f6') : '#475569',
                  border:     `1px solid ${filter === s ? (SYS_COLORS[s] || '#3b82f6') + '40' : 'rgba(30,58,95,0.3)'}`,
                }}>
                {s}
              </button>
            ))}
            <span className="ml-auto text-xs text-slate-700">{filtered.length}</span>
          </div>

          {/* Scrollable events */}
          <div className="overflow-y-auto" style={{ maxHeight: 460 }}>
            {filtered.length === 0
              ? <div className="py-16 text-center text-slate-700 text-sm">Waiting for events…</div>
              : filtered.map((ev, i) => {
                  const meta  = EV_META[ev.eventType] || EV_META.data_sync;
                  const isNew = i < 2 && !paused;
                  return (
                    <div key={ev.id}
                      className="px-4 py-3 flex items-start gap-3 transition-colors"
                      style={{
                        borderBottom: '1px solid rgba(15,31,61,0.5)',
                        background:   isNew ? `${meta.color}06` : 'transparent',
                      }}
                    >
                      {/* Event type icon */}
                      <div className="flex-shrink-0 w-7 h-7 rounded-lg flex items-center justify-center text-sm mt-0.5"
                        style={{ background: `${meta.color}15` }}>
                        {meta.icon}
                      </div>

                      <div className="flex-1 min-w-0">
                        {/* From → To row */}
                        <div className="flex items-center gap-1.5 mb-0.5 flex-wrap">
                          <span className="text-xs font-semibold"
                            style={{ color: SYS_COLORS[ev.from] || '#94a3b8' }}>
                            {ev.from}
                          </span>
                          <span className="text-xs text-slate-700">→</span>
                          <span className="text-xs font-semibold"
                            style={{ color: SYS_COLORS[ev.to] || '#94a3b8' }}>
                            {ev.to}
                          </span>
                          {ev.severity && ev.severity !== 'low' && (
                            <span className="text-xs px-1.5 py-0.5 rounded font-bold"
                              style={{
                                background: ev.severity === 'high' ? 'rgba(239,68,68,0.12)' : 'rgba(245,158,11,0.12)',
                                color:      ev.severity === 'high' ? '#ef4444' : '#f59e0b',
                              }}>
                              {ev.severity.toUpperCase()}
                            </span>
                          )}
                          <span className="text-xs text-slate-700 ml-auto flex-shrink-0 tabular-nums">
                            {fmtTs(ev.ts)}
                          </span>
                        </div>
                        {/* Message */}
                        <p className="text-xs text-slate-500 leading-relaxed">{ev.message}</p>
                      </div>
                    </div>
                  );
              })
            }
          </div>
        </div>
      </div>
    </div>
  );
}
