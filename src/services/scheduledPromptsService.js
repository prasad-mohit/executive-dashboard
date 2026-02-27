/**
 * Scheduled Prompts Service
 * Manages AI prompts that execute at fixed intervals, querying multiple
 * data systems and demonstrating cross-system interoperability.
 */

import dataFeedService from './dataFeedService';

export const FREQ_OPTIONS = [
  { label: '15s', value: 15  },
  { label: '30s', value: 30  },
  { label: '45s', value: 45  },
  { label: '1m',  value: 60  },
  { label: '2m',  value: 120 },
  { label: '5m',  value: 300 },
  { label: '15m', value: 900 },
  { label: '30m', value: 1800},
  { label: '1h',  value: 3600},
];

/* ── Mock AI results per prompt ── */
const MOCK_RESULTS = {
  'SP-001': [
    { insight: 'Revenue deviation detected: Q4 pipeline 12% below forecast. ERP shows 3 invoices delayed >30 days. CRM has 5 deals stalled at procurement stage.',                                      severity: 'high',   confidence: 87, signals: 8  },
    { insight: 'Revenue healthy — ERP cash flow +4.2% vs budget. CRM pipeline velocity improving with 7 deals advancing to next stage this week.',                                                     severity: 'low',    confidence: 92, signals: 12 },
    { insight: 'Billing discrepancy flagged: ERP shows $240K unbilled vs CRM closed-won. Finance reconciliation required before period close.',                                                         severity: 'medium', confidence: 79, signals: 6  },
  ],
  'SP-002': [
    { insight: '3 high-performers show exit risk: Email sentiment −2.1σ from baseline, HR logged 2 PTO surges, ERP overtime declining (disengagement signal).',                                        severity: 'high',   confidence: 83, signals: 7  },
    { insight: 'Team morale stable. HR tenure avg 3.2 years. Email engagement up 8% WoW. No attrition signals across ERP or HR datasets.',                                                             severity: 'low',    confidence: 90, signals: 9  },
    { insight: 'Engineering pod showing burnout signals: 14% overtime spike in ERP past 3 weeks, HR flagged 2 sick-leave pattern anomalies.',                                                          severity: 'medium', confidence: 76, signals: 5  },
  ],
  'SP-003': [
    { insight: 'Competitor A closed $45M Series C (News confirmed). Market data: 3 product launches in adjacent space. Recommended action window: 60 days.',                                           severity: 'high',   confidence: 88, signals: 11 },
    { insight: 'Market sentiment stable. No major competitive moves detected. News sector sentiment: neutral (+0.2). Monitor weekly.',                                                                  severity: 'low',    confidence: 85, signals: 4  },
    { insight: '2 startups pivoting to core market vertical per News + Market analyst reports. Early-stage threat — recommend competitive intelligence review.',                                        severity: 'medium', confidence: 71, signals: 6  },
  ],
  'SP-004': [
    { insight: '2 enterprise accounts at churn risk: billing delays >21 days (ERP), email open rate <10% (Email), CRM last meaningful contact >45 days.',                                             severity: 'high',   confidence: 82, signals: 9  },
    { insight: 'All enterprise accounts healthy. CRM NPS avg 8.4. No billing anomalies in ERP. Email engagement within normal range.',                                                                 severity: 'low',    confidence: 94, signals: 14 },
  ],
  'SP-005': [
    { insight: 'Ops capacity at 94% ceiling. ERP identifies 3 process bottlenecks in fulfilment. HR headcount insufficient to meet Q1 volume targets by ~12%.',                                       severity: 'medium', confidence: 78, signals: 7  },
    { insight: 'Operations running efficiently at 87% utilization. No capacity gaps detected. ERP and HR data aligned on resource planning.',                                                          severity: 'low',    confidence: 89, signals: 10 },
  ],
};

/* ── Default prompt definitions ── */
const DEFAULTS = [
  {
    id: 'SP-001', name: 'Revenue Health Check',   icon: '💰', cat: 'Financial',
    color: '#f59e0b', systems: ['ERP', 'CRM'],          freq: 30,  enabled: true,
    prompt: 'Analyze ERP billing and CRM pipeline to detect revenue anomalies, forecast deviation, and surface at-risk opportunities.',
  },
  {
    id: 'SP-002', name: 'Talent Risk Pulse',       icon: '👥', cat: 'People',
    color: '#8b5cf6', systems: ['HR', 'ERP', 'Email'],  freq: 45,  enabled: true,
    prompt: 'Cross-reference HR attrition signals with ERP workforce cost data and Email communication sentiment to surface retention risks.',
  },
  {
    id: 'SP-003', name: 'Competitive Intel Feed',  icon: '🌐', cat: 'Market',
    color: '#3b82f6', systems: ['Market', 'News'],       freq: 60,  enabled: true,
    prompt: 'Monitor Market Intelligence and News feeds for competitor activity, funding announcements, and market shifts requiring executive response.',
  },
  {
    id: 'SP-004', name: 'Customer Churn Sentinel', icon: '🎯', cat: 'Sales',
    color: '#ef4444', systems: ['CRM', 'Email', 'ERP'], freq: 90,  enabled: false,
    prompt: 'Correlate CRM engagement scores, Email open rates, and ERP billing patterns to predict and prevent enterprise customer churn.',
  },
  {
    id: 'SP-005', name: 'Ops Efficiency Scan',     icon: '⚙️', cat: 'Operations',
    color: '#10b981', systems: ['ERP', 'HR'],            freq: 120, enabled: true,
    prompt: 'Compare ERP operational throughput metrics with HR capacity planning data to identify efficiency gaps and resource constraints.',
  },
];

function freqLabel(secs) {
  return secs < 60 ? `${secs}s` : `${Math.round(secs / 60)}m`;
}

class ScheduledPromptsService {
  constructor() {
    this._prompts = DEFAULTS.map(d => ({
      ...d,
      status:     'idle',
      lastRun:    null,
      lastResult: null,
      nextRun:    null,
      remaining:  d.freq,
      runCount:   0,
    }));
    this._history = [];
    this._timers  = {};
    this._ticker  = null;
    this._subs    = new Set();
    this._started = false;
  }

  subscribe(cb) {
    this._subs.add(cb);
    cb(this._snap());
    return () => this._subs.delete(cb);
  }

  _emit() { const s = this._snap(); this._subs.forEach(cb => cb(s)); }

  _snap() {
    return {
      prompts: this._prompts.map(p => ({ ...p })),
      history: this._history.slice(0, 30),
    };
  }

  /** Idempotent init — starts timers and countdown ticker once. */
  init() {
    if (this._started) return;
    this._started = true;
    dataFeedService.init();

    // Stagger initial runs by 4.5s per prompt so they don't all fire at once
    this._prompts.forEach((p, i) => {
      if (!p.enabled) return;
      const delay = i * 4500 + 2000;
      p.nextRun  = Date.now() + delay;
      p.remaining = Math.round(delay / 1000);
      setTimeout(() => this._run(p.id), delay);
    });

    // Countdown ticker — updates remaining seconds every second
    this._ticker = setInterval(() => {
      const now = Date.now();
      let dirty = false;
      this._prompts.forEach(p => {
        if (p.enabled && p.status !== 'running' && p.nextRun) {
          const r = Math.max(0, Math.round((p.nextRun - now) / 1000));
          if (r !== p.remaining) { p.remaining = r; dirty = true; }
        }
      });
      if (dirty) this._emit();
    }, 1000);
  }

  async _run(id) {
    const p = this._prompts.find(x => x.id === id);
    if (!p || !p.enabled) return;

    p.status = 'running';
    this._emit();

    const dur = 700 + Math.random() * 1500;

    // Fire one event per queried system with small stagger
    p.systems.forEach((sys, i) =>
      setTimeout(() => dataFeedService.push({
        from:      sys,
        to:        'AI Orchestrator',
        eventType: 'prompt_query',
        message:   `[${p.name}] querying ${sys}: ${Math.floor(Math.random() * 900 + 100)} records scanned`,
        severity:  'low',
        promptId:  id,
      }), i * 300)
    );

    await new Promise(r => setTimeout(r, dur));

    // Pick a random mock result for this prompt
    const pool = MOCK_RESULTS[id] || [{
      insight:    `Analysis complete across ${p.systems.join(', ')}. No anomalies detected.`,
      severity:   'low',
      confidence: 88,
      signals:    4,
    }];
    const result = { ...pool[Math.floor(Math.random() * pool.length)], duration: Math.round(dur) };

    p.lastResult = result;
    p.status     = 'idle';
    p.runCount++;
    p.lastRun  = new Date().toISOString();
    p.nextRun  = Date.now() + p.freq * 1000;
    p.remaining = p.freq;

    // Add to execution history
    this._history.unshift({
      id:         `${id}-${Date.now()}`,
      promptId:   id,
      promptName: p.name,
      icon:       p.icon,
      color:      p.color,
      systems:    [...p.systems],
      ts:         new Date().toISOString(),
      result:     { ...result },
    });
    if (this._history.length > 100) this._history.length = 100;

    // Push result event to the feed
    dataFeedService.push({
      from:       'AI Orchestrator',
      to:         'Executive OS',
      eventType:  'prompt_result',
      message:    `[${p.name}] ${result.insight.slice(0, 95)}${result.insight.length > 95 ? '…' : ''}`,
      severity:   result.severity,
      promptId:   id,
      confidence: result.confidence,
    });

    this._emit();

    // Schedule next run
    if (p.enabled) {
      clearInterval(this._timers[id]);
      this._timers[id] = setInterval(() => this._run(id), p.freq * 1000);
    }
  }

  /* ── Public API ── */

  runNow(id) {
    const p = this._prompts.find(x => x.id === id);
    if (!p || p.status === 'running') return;
    clearInterval(this._timers[id]);
    p.nextRun  = Date.now() + p.freq * 1000;
    p.remaining = p.freq;
    this._run(id);
  }

  toggle(id) {
    const p = this._prompts.find(x => x.id === id);
    if (!p) return;
    p.enabled = !p.enabled;
    if (p.enabled) {
      p.nextRun  = Date.now() + p.freq * 1000;
      p.remaining = p.freq;
      p.status   = 'idle';
      clearInterval(this._timers[id]);
      this._timers[id] = setInterval(() => this._run(id), p.freq * 1000);
    } else {
      clearInterval(this._timers[id]);
      delete this._timers[id];
      p.nextRun  = null;
      p.remaining = null;
      p.status   = 'idle';
    }
    this._emit();
  }

  setFrequency(id, secs) {
    const p = this._prompts.find(x => x.id === id);
    if (!p) return;
    p.freq = secs;
    if (p.enabled) {
      clearInterval(this._timers[id]);
      p.nextRun  = Date.now() + secs * 1000;
      p.remaining = secs;
      this._timers[id] = setInterval(() => this._run(id), secs * 1000);
    }
    this._emit();
  }

  addPrompt({ name, prompt, systems, freq, cat }) {
    const palette = ['#f59e0b', '#8b5cf6', '#3b82f6', '#ef4444', '#10b981', '#06b6d4'];
    const id = `SP-${String(this._prompts.length + 1).padStart(3, '0')}`;
    const p  = {
      id, name, prompt, systems, freq, cat: cat || 'Custom', icon: '🔍',
      color:     palette[this._prompts.length % palette.length],
      enabled:   true,
      status:    'idle',
      lastRun:   null,
      lastResult: null,
      nextRun:   Date.now() + freq * 1000,
      remaining: freq,
      runCount:  0,
    };
    this._prompts.push(p);
    clearInterval(this._timers[id]);
    this._timers[id] = setInterval(() => this._run(id), freq * 1000);
    this._emit();
  }
}

export default new ScheduledPromptsService();
