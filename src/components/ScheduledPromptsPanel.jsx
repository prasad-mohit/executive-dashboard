import { useState, useEffect } from 'react';
import scheduledPromptsService, { FREQ_OPTIONS } from '../services/scheduledPromptsService';
import { useAuth } from '../contexts/AuthContext';

/* ── Constants ── */
const SYS_COLORS = {
  ERP: '#f59e0b', CRM: '#3b82f6', HR: '#8b5cf6',
  Email: '#06b6d4', Market: '#10b981', News: '#f97316',
};

const SEV = {
  high:   { color: '#ef4444', bg: 'rgba(239,68,68,0.12)',  label: 'HIGH' },
  medium: { color: '#f59e0b', bg: 'rgba(245,158,11,0.12)', label: 'MED'  },
  low:    { color: '#10b981', bg: 'rgba(16,185,129,0.12)', label: 'OK'   },
};

/* ── Countdown Ring (SVG) ── */
function CountdownRing({ remaining, total, running, color, size = 56 }) {
  const r    = (size - 8) / 2;
  const circ = 2 * Math.PI * r;
  const pct  = running ? 0 : Math.max(0, 1 - (remaining ?? total) / total);
  const dash = circ * pct;
  const cx   = size / 2, cy = size / 2;

  return (
    <div className="relative flex-shrink-0" style={{ width: size, height: size }}>
      <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
        <circle cx={cx} cy={cy} r={r} fill="none"
          stroke="rgba(30,58,95,0.4)" strokeWidth="3.5" />
        <circle cx={cx} cy={cy} r={r} fill="none"
          stroke={color} strokeWidth="3.5"
          strokeDasharray={`${dash} ${circ - dash}`}
          strokeLinecap="round"
          style={{
            transition:  running ? 'none' : 'stroke-dasharray 0.8s ease',
            animation:   running ? 'spin 1.4s linear infinite' : 'none',
            filter:      `drop-shadow(0 0 4px ${color}55)`,
          }}
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        {running
          ? <div className="w-3 h-3 rounded-full animate-ping" style={{ background: color }} />
          : <span className="text-xs font-bold tabular-nums" style={{ color }}>
              {remaining == null ? '—'
                : remaining >= 60 ? `${Math.floor(remaining / 60)}m`
                : `${remaining}s`}
            </span>
        }
      </div>
    </div>
  );
}

/* ── Individual Prompt Card ── */
function PromptCard({ prompt: p, onToggle, onRunNow, onFreqChange }) {
  const [showMenu, setShowMenu] = useState(false);
  const sev      = p.lastResult ? (SEV[p.lastResult.severity] || SEV.low) : null;
  const freqLbl  = p.freq < 60 ? `${p.freq}s` : `${Math.round(p.freq / 60)}m`;

  return (
    <div
      className="rounded-2xl p-5 flex flex-col gap-4 transition-all duration-300"
      style={{
        background:  p.enabled ? 'rgba(8,15,31,0.95)' : 'rgba(5,12,26,0.55)',
        border:      `1px solid ${p.enabled ? p.color + '30' : 'rgba(30,58,95,0.2)'}`,
        boxShadow:   p.status === 'running'
          ? `0 0 28px ${p.color}18, inset 0 0 20px ${p.color}06`
          : 'none',
        opacity:     p.enabled ? 1 : 0.6,
      }}
    >
      {/* ── Header ── */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <div
            className="w-9 h-9 rounded-xl flex items-center justify-center text-lg flex-shrink-0"
            style={{ background: `${p.color}18`, border: `1px solid ${p.color}35` }}
          >
            {p.icon}
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-sm font-bold text-white">{p.name}</span>
              <span className="text-xs px-1.5 py-0.5 rounded font-medium flex-shrink-0"
                style={{ background: `${p.color}18`, color: p.color }}>
                {p.cat}
              </span>
            </div>
            <div className="flex items-center gap-2 mt-0.5">
              <span className="text-xs" style={{
                color: p.status === 'running' ? '#fbbf24' : p.enabled ? '#10b981' : '#475569',
              }}>
                {p.status === 'running' ? '⟳ Running…' : p.enabled ? '● Active' : '○ Paused'}
              </span>
              {p.runCount > 0 && (
                <span className="text-xs text-slate-700">· {p.runCount}× ran</span>
              )}
            </div>
          </div>
        </div>

        {/* Toggle switch */}
        <button
          onClick={() => onToggle(p.id)}
          className="flex-shrink-0 w-10 h-5 rounded-full relative transition-all duration-300"
          style={{
            background:  p.enabled ? p.color : 'rgba(30,58,95,0.5)',
            boxShadow:   p.enabled ? `0 0 10px ${p.color}50` : 'none',
          }}
        >
          <span
            className="absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform duration-200"
            style={{ transform: p.enabled ? 'translateX(22px)' : 'translateX(2px)' }}
          />
        </button>
      </div>

      {/* ── Prompt text ── */}
      <p className="text-xs text-slate-500 leading-relaxed italic"
        style={{
          display:          '-webkit-box',
          WebkitLineClamp:  2,
          WebkitBoxOrient:  'vertical',
          overflow:         'hidden',
        }}>
        {p.prompt}
      </p>

      {/* ── System source badges ── */}
      <div className="flex items-center gap-1.5 flex-wrap">
        {p.systems.map(sys => (
          <span key={sys}
            className="text-xs px-2.5 py-0.5 rounded-full font-semibold"
            style={{
              background: `${SYS_COLORS[sys] || '#64748b'}15`,
              color:      SYS_COLORS[sys] || '#94a3b8',
              border:     `1px solid ${SYS_COLORS[sys] || '#64748b'}30`,
            }}>
            {sys}
          </span>
        ))}
        <span className="text-xs text-slate-700 ml-auto">
          {p.systems.length} source{p.systems.length !== 1 ? 's' : ''}
        </span>
      </div>

      {/* ── Controls: ring + frequency + run button ── */}
      <div className="flex items-center gap-4">
        <CountdownRing
          remaining={p.remaining}
          total={p.freq}
          running={p.status === 'running'}
          color={p.enabled ? p.color : '#475569'}
        />

        <div className="flex-1 space-y-1">
          <div className="text-xs text-slate-700">Trigger interval</div>
          <div className="relative">
            <button
              onClick={() => setShowMenu(v => !v)}
              className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg transition-colors"
              style={{ background: 'rgba(30,58,95,0.35)', color: '#94a3b8', border: '1px solid rgba(30,58,95,0.4)' }}
            >
              ⏱ every {freqLbl}
              <span className="text-slate-700 text-xs">▾</span>
            </button>
            {showMenu && (
              <div
                className="absolute top-9 left-0 z-50 rounded-xl shadow-2xl overflow-hidden"
                style={{ background: '#050c1a', border: '1px solid rgba(30,58,95,0.7)', minWidth: 110 }}
                onMouseLeave={() => setShowMenu(false)}
              >
                {FREQ_OPTIONS.map(o => (
                  <button key={o.value}
                    onClick={() => { onFreqChange(p.id, o.value); setShowMenu(false); }}
                    className="block w-full text-left text-xs px-3 py-2 transition-colors hover:text-white"
                    style={{
                      color:      o.value === p.freq ? p.color : '#475569',
                      background: o.value === p.freq ? `${p.color}12` : 'transparent',
                    }}
                  >
                    {o.label}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        <button
          onClick={() => onRunNow(p.id)}
          disabled={!p.enabled || p.status === 'running'}
          className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all disabled:opacity-40"
          style={{
            background: `${p.color}18`,
            color:      p.color,
            border:     `1px solid ${p.color}35`,
            boxShadow:  (!p.enabled || p.status === 'running') ? 'none' : `0 0 12px ${p.color}20`,
          }}
        >
          {p.status === 'running' ? '⟳' : '▶'} Run
        </button>
      </div>

      {/* ── Last result ── */}
      {sev && p.lastResult && (
        <div className="rounded-xl p-3.5 space-y-1.5"
          style={{ background: `${sev.color}08`, border: `1px solid ${sev.color}20` }}>
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold px-2 py-0.5 rounded"
              style={{ background: sev.bg, color: sev.color }}>
              {sev.label}
            </span>
            <span className="text-xs text-slate-700">
              {p.lastResult.confidence}% conf · {p.lastResult.signals} signals · {p.lastResult.duration}ms
            </span>
          </div>
          <p className="text-xs leading-relaxed" style={{ color: '#94a3b8' }}>
            {p.lastResult.insight}
          </p>
        </div>
      )}
    </div>
  );
}

/* ── Add Prompt Modal ── */
function AddPromptModal({ onClose, onAdd }) {
  const [form, setForm] = useState({ name: '', prompt: '', systems: [], freq: 60, cat: 'Custom' });
  const ALL_SYS = ['ERP', 'CRM', 'HR', 'Email', 'Market', 'News'];
  const CATS    = ['Financial', 'People', 'Market', 'Sales', 'Operations', 'Custom'];
  const toggle  = sys => setForm(f => ({
    ...f,
    systems: f.systems.includes(sys) ? f.systems.filter(s => s !== sys) : [...f.systems, sys],
  }));
  const valid = form.name.trim() && form.prompt.trim() && form.systems.length > 0;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(2,8,23,0.88)', backdropFilter: 'blur(4px)' }}
    >
      <div
        className="w-full max-w-lg rounded-2xl p-6 space-y-5 animate-fade-in"
        style={{ background: '#080f1f', border: '1px solid rgba(30,58,95,0.7)', boxShadow: '0 0 40px rgba(37,99,235,0.15)' }}
      >
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-bold text-white">➕ New Scheduled Prompt</h3>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-lg text-xl text-slate-500 hover:text-white transition-colors"
            style={{ background: 'rgba(30,58,95,0.3)' }}
          >×</button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="text-xs uppercase tracking-wider text-slate-600 block mb-1.5">Prompt Name</label>
            <input
              value={form.name}
              onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
              placeholder="e.g. Weekly Revenue Digest"
              className="w-full rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-700 outline-none"
              style={{ background: 'rgba(30,58,95,0.18)', border: '1px solid rgba(30,58,95,0.5)' }}
            />
          </div>

          <div>
            <label className="text-xs uppercase tracking-wider text-slate-600 block mb-1.5">AI Instructions</label>
            <textarea
              value={form.prompt}
              onChange={e => setForm(f => ({ ...f, prompt: e.target.value }))}
              rows={3}
              placeholder="Describe what the AI should analyse across the selected data sources…"
              className="w-full rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-700 outline-none resize-none"
              style={{ background: 'rgba(30,58,95,0.18)', border: '1px solid rgba(30,58,95,0.5)' }}
            />
          </div>

          <div>
            <label className="text-xs uppercase tracking-wider text-slate-600 block mb-2">Data Sources</label>
            <div className="flex flex-wrap gap-2">
              {ALL_SYS.map(sys => {
                const on = form.systems.includes(sys);
                const c  = SYS_COLORS[sys];
                return (
                  <button key={sys} onClick={() => toggle(sys)}
                    className="px-3 py-1.5 rounded-full text-xs font-semibold transition-all"
                    style={{
                      background: on ? `${c}22` : 'rgba(30,58,95,0.25)',
                      color:      on ? c : '#475569',
                      border:     `1px solid ${on ? c + '50' : 'rgba(30,58,95,0.4)'}`,
                    }}>
                    {sys}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs uppercase tracking-wider text-slate-600 block mb-1.5">Frequency</label>
              <select
                value={form.freq}
                onChange={e => setForm(f => ({ ...f, freq: +e.target.value }))}
                className="w-full rounded-xl px-3 py-2.5 text-sm text-white outline-none"
                style={{ background: 'rgba(30,58,95,0.18)', border: '1px solid rgba(30,58,95,0.5)' }}
              >
                {FREQ_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs uppercase tracking-wider text-slate-600 block mb-1.5">Category</label>
              <select
                value={form.cat}
                onChange={e => setForm(f => ({ ...f, cat: e.target.value }))}
                className="w-full rounded-xl px-3 py-2.5 text-sm text-white outline-none"
                style={{ background: 'rgba(30,58,95,0.18)', border: '1px solid rgba(30,58,95,0.5)' }}
              >
                {CATS.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
          </div>
        </div>

        <div className="flex gap-3 pt-1">
          <button
            onClick={onClose}
            className="flex-1 py-2.5 rounded-xl text-sm font-medium transition-colors"
            style={{ background: 'rgba(30,58,95,0.2)', color: '#64748b', border: '1px solid rgba(30,58,95,0.4)' }}
          >
            Cancel
          </button>
          <button
            disabled={!valid}
            onClick={() => { onAdd(form); onClose(); }}
            className="flex-1 py-2.5 rounded-xl text-sm font-bold text-white transition-all disabled:opacity-40"
            style={{
              background: 'linear-gradient(135deg,#2563eb,#0ea5e9)',
              boxShadow:  valid ? '0 0 20px rgba(37,99,235,0.4)' : 'none',
            }}
          >
            Schedule Prompt
          </button>
        </div>
      </div>
    </div>
  );
}

/* ── Main Page Component ── */
export default function ScheduledPromptsPanel() {
  const { user } = useAuth();
  const [state, setState]   = useState({ prompts: [], history: [] });
  const [showAdd, setShowAdd] = useState(false);
  const accent = user?.personaConfig?.accentColor || '#3b82f6';

  useEffect(() => {
    scheduledPromptsService.init();
    return scheduledPromptsService.subscribe(setState);
  }, []);

  const activeCount  = state.prompts.filter(p => p.enabled).length;
  const runningCount = state.prompts.filter(p => p.status === 'running').length;

  return (
    <div className="space-y-6">
      {/* ── Page header ── */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-3 flex-wrap">
            <h2 className="text-2xl font-extrabold text-white tracking-tight">🧠 Scheduled Prompts</h2>
            <span className="text-xs px-2.5 py-1 rounded-full font-semibold"
              style={{ background: `${accent}18`, color: accent, border: `1px solid ${accent}30` }}>
              {activeCount} active
            </span>
            {runningCount > 0 && (
              <span className="text-xs px-2.5 py-1 rounded-full font-semibold animate-pulse"
                style={{ background: 'rgba(245,158,11,0.12)', color: '#f59e0b', border: '1px solid rgba(245,158,11,0.3)' }}>
                {runningCount} running now
              </span>
            )}
          </div>
          <p className="text-slate-500 text-sm mt-1">
            AI prompts that execute at fixed intervals, querying multiple systems to surface cross-functional insights
          </p>
        </div>
        <button
          onClick={() => setShowAdd(true)}
          className="flex-shrink-0 flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-white transition-all"
          style={{
            background: 'linear-gradient(135deg,#2563eb,#0ea5e9)',
            boxShadow:  '0 0 20px rgba(37,99,235,0.35)',
          }}
        >
          ＋ Add Prompt
        </button>
      </div>

      {/* ── Prompt cards grid ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
        {state.prompts.map(p => (
          <PromptCard
            key={p.id}
            prompt={p}
            onToggle={id => scheduledPromptsService.toggle(id)}
            onRunNow={id => scheduledPromptsService.runNow(id)}
            onFreqChange={(id, v) => scheduledPromptsService.setFrequency(id, v)}
          />
        ))}
      </div>

      {/* ── Execution log ── */}
      {state.history.length > 0 && (
        <div className="rounded-2xl overflow-hidden"
          style={{ background: 'rgba(8,15,31,0.9)', border: '1px solid rgba(30,58,95,0.4)' }}>
          <div className="px-5 py-4 flex items-center justify-between"
            style={{ borderBottom: '1px solid rgba(30,58,95,0.35)' }}>
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              📋 Execution Log
              <span className="text-xs px-2 py-0.5 rounded font-medium"
                style={{ background: 'rgba(30,58,95,0.4)', color: '#64748b' }}>
                last {Math.min(state.history.length, 8)} runs
              </span>
            </h3>
            <span className="text-xs text-slate-700">{state.history.length} total</span>
          </div>
          <div>
            {state.history.slice(0, 8).map(h => {
              const s = SEV[h.result?.severity] || SEV.low;
              return (
                <div key={h.id}
                  className="px-5 py-3.5 flex items-center gap-4 transition-colors hover:bg-white/[0.012]"
                  style={{ borderBottom: '1px solid rgba(15,31,61,0.5)' }}
                >
                  <span className="text-xl flex-shrink-0">{h.icon}</span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5 flex-wrap">
                      <span className="text-xs font-semibold text-white">{h.promptName}</span>
                      <span className="text-xs px-1.5 py-0.5 rounded font-bold"
                        style={{ background: s.bg, color: s.color }}>{s.label}</span>
                      <span className="text-xs text-slate-700 ml-auto flex-shrink-0 tabular-nums">
                        {new Date(h.ts).toLocaleTimeString()}
                      </span>
                    </div>
                    <p className="text-xs text-slate-600 truncate">{h.result?.insight}</p>
                  </div>
                  <div className="text-right flex-shrink-0 space-y-0.5">
                    <div className="text-xs font-semibold" style={{ color: h.color }}>
                      {h.systems.join(' + ')}
                    </div>
                    <div className="text-xs text-slate-700">{h.result?.duration}ms</div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {showAdd && (
        <AddPromptModal
          onClose={() => setShowAdd(false)}
          onAdd={f => scheduledPromptsService.addPrompt(f)}
        />
      )}
    </div>
  );
}
