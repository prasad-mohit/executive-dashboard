/**
 * Data Feed Service
 * Captures real-time inter-system data exchange events, demonstrating
 * cross-system interoperability. Acts as an event bus that all agents
 * and scheduled prompts publish to.
 */

export const SYSTEM_COLORS = {
  ERP:                '#f59e0b',
  CRM:                '#3b82f6',
  HR:                 '#8b5cf6',
  Email:              '#06b6d4',
  Market:             '#10b981',
  News:               '#f97316',
  'AI Orchestrator':  '#a78bfa',
  'Executive OS':     '#60a5fa',
  'Risk Analyzer':    '#ef4444',
  'Decision Agent':   '#10b981',
};

export const EVENT_META = {
  prompt_query:   { icon: '🔍', color: '#3b82f6',  label: 'Query'    },
  prompt_result:  { icon: '✨', color: '#10b981',  label: 'Result'   },
  data_sync:      { icon: '🔄', color: '#475569',  label: 'Sync'     },
  alert:          { icon: '⚠️', color: '#ef4444',  label: 'Alert'    },
  analysis:       { icon: '🧠', color: '#8b5cf6',  label: 'Analysis' },
  recommendation: { icon: '💡', color: '#f97316',  label: 'Action'   },
};

const SEED_EVENTS = [
  { from: 'ERP',              to: 'AI Orchestrator', eventType: 'data_sync',      message: 'ERP: 4,821 transactions synced — fiscal period data loaded',              severity: 'low'    },
  { from: 'CRM',              to: 'AI Orchestrator', eventType: 'data_sync',      message: 'CRM: 127 open deals refreshed, pipeline velocity calculated',             severity: 'low'    },
  { from: 'HR',               to: 'AI Orchestrator', eventType: 'data_sync',      message: 'HR: 847 employees indexed, attrition model recalibrated',                 severity: 'low'    },
  { from: 'Email',            to: 'AI Orchestrator', eventType: 'data_sync',      message: 'Email: 2,341 messages analysed — avg sentiment +0.62',                    severity: 'low'    },
  { from: 'Market',           to: 'AI Orchestrator', eventType: 'analysis',       message: 'Market: sector index −1.2%, 4 competitor signals detected',               severity: 'medium' },
  { from: 'News',             to: 'AI Orchestrator', eventType: 'data_sync',      message: 'News: 84 articles scanned, 6 business-relevant',                         severity: 'low'    },
  { from: 'AI Orchestrator',  to: 'Risk Analyzer',   eventType: 'analysis',       message: 'Risk scan initiated across 6 data sources',                              severity: 'low'    },
  { from: 'Risk Analyzer',    to: 'Decision Agent',  eventType: 'recommendation', message: '4 risks identified — escalating to Decision Agent',                      severity: 'medium' },
  { from: 'Decision Agent',   to: 'Executive OS',    eventType: 'recommendation', message: '3 priority actions ready for executive review',                          severity: 'low'    },
];

class DataFeedService {
  constructor() {
    this._events  = [];
    this._subs    = new Set();
    this._bgTimer = null;
  }

  get systemColors() { return SYSTEM_COLORS; }
  get eventMeta()    { return EVENT_META; }

  /** Subscribe to event stream. Returns unsubscribe function. */
  subscribe(cb) {
    this._subs.add(cb);
    cb([...this._events.slice(0, 80)]);
    return () => this._subs.delete(cb);
  }

  /** Push a new event and notify all subscribers. */
  push({ from, to, eventType = 'data_sync', message, severity = 'low', ...rest }) {
    const ev = {
      id:        `${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      ts:        new Date().toISOString(),
      from,
      to,
      eventType,
      message,
      severity,
      fromColor: SYSTEM_COLORS[from] || '#64748b',
      toColor:   SYSTEM_COLORS[to]   || '#64748b',
      meta:      EVENT_META[eventType] || EVENT_META.data_sync,
      ...rest,
    };
    this._events.unshift(ev);
    if (this._events.length > 200) this._events.length = 200;
    const snapshot = this._events.slice(0, 80);
    this._subs.forEach(cb => cb(snapshot));
    return ev;
  }

  /** Idempotent — seeds initial events and starts background polling. */
  init() {
    if (this._bgTimer) return;

    // Seed events with staggered delays so feed populates smoothly
    [...SEED_EVENTS].reverse().forEach((ev, i) =>
      setTimeout(() => this.push(ev), i * 650)
    );

    // Continuous background data-sync simulation
    this._bgTimer = setInterval(() => {
      const systems = ['ERP', 'CRM', 'HR', 'Email', 'Market', 'News'];
      const sys = systems[Math.floor(Math.random() * systems.length)];
      const msgs = [
        `${sys}: incremental sync — ${Math.floor(Math.random() * 200 + 20)} records updated`,
        `${sys}: health check passed ✓`,
        `${sys}: data freshness validated`,
        `${sys}: delta sync — ${Math.floor(Math.random() * 40 + 1)} changes applied`,
      ];
      this.push({
        from:      sys,
        to:        'AI Orchestrator',
        eventType: 'data_sync',
        message:   msgs[Math.floor(Math.random() * msgs.length)],
        severity:  'low',
      });
    }, 9500);
  }
}

export default new DataFeedService();
