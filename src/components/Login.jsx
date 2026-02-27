import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

/* ── Animated radial gauge SVG ── */
function GaugeRing({ value, max = 100, color, size = 80, label, sublabel }) {
  const r = (size - 14) / 2;
  const circ = 2 * Math.PI * r;
  const arc = circ * 0.75; // 270° arc
  const filled = arc * (value / max);
  const dashOffset = arc - filled;
  const cx = size / 2, cy = size / 2;
  return (
    <div className="flex flex-col items-center gap-1">
      <svg width={size} height={size} style={{ transform: 'rotate(135deg)' }}>
        <circle cx={cx} cy={cy} r={r} fill="none" stroke="rgba(30,58,95,0.5)" strokeWidth="7"
          strokeDasharray={`${arc} ${circ - arc}`} strokeLinecap="round" />
        <circle cx={cx} cy={cy} r={r} fill="none" stroke={color} strokeWidth="7"
          strokeDasharray={`${filled} ${circ - filled}`}
          strokeDashoffset={0}
          strokeLinecap="round"
          style={{ filter: `drop-shadow(0 0 6px ${color})`, transition: 'stroke-dasharray 1.5s cubic-bezier(0.4,0,0.2,1)' }}
        />
        <text x={cx} y={cy - 4} textAnchor="middle" fill="white" fontSize="14" fontWeight="700"
          style={{ transform: 'rotate(-135deg)', transformOrigin: `${cx}px ${cy}px` }}>
          {value}
        </text>
        <text x={cx} y={cy + 12} textAnchor="middle" fill="rgba(148,163,184,0.8)" fontSize="8"
          style={{ transform: 'rotate(-135deg)', transformOrigin: `${cx}px ${cy}px` }}>
          {sublabel}
        </text>
      </svg>
      <span className="text-xs text-slate-400 text-center leading-tight">{label}</span>
    </div>
  );
}

/* ── Floating particle ── */
function Particle({ style }) {
  return (
    <div className="absolute rounded-full pointer-events-none"
      style={{ ...style, animation: `particle-float ${style.duration || '8s'} ease-in-out infinite` }} />
  );
}

/* ── Live counter animation ── */
function Counter({ target, suffix = '' }) {
  const [val, setVal] = useState(0);
  useEffect(() => {
    const step = target / 60;
    let cur = 0;
    const t = setInterval(() => {
      cur += step;
      if (cur >= target) { setVal(target); clearInterval(t); }
      else setVal(Math.floor(cur));
    }, 20);
    return () => clearInterval(t);
  }, [target]);
  return <span>{val.toLocaleString()}{suffix}</span>;
}

/* ── Persona card ── */
function PersonaCard({ persona, selected, onSelect }) {
  const icons = { executive: '👑', manager: '🎯', analyst: '🔬' };
  const colors = {
    executive: { border: 'rgba(245,158,11,0.5)', glow: 'rgba(245,158,11,0.3)', accent: '#f59e0b', tag: 'bg-amber-500/20 text-amber-400 border-amber-500/30' },
    manager:   { border: 'rgba(59,130,246,0.5)',  glow: 'rgba(59,130,246,0.3)',  accent: '#3b82f6', tag: 'bg-blue-500/20 text-blue-400 border-blue-500/30' },
    analyst:   { border: 'rgba(139,92,246,0.5)',  glow: 'rgba(139,92,246,0.3)',  accent: '#8b5cf6', tag: 'bg-purple-500/20 text-purple-400 border-purple-500/30' },
  };
  const c = colors[persona.id] || colors.analyst;
  return (
    <button
      type="button"
      onClick={() => onSelect(persona.id)}
      className="text-left w-full rounded-xl p-3 transition-all duration-300 group"
      style={{
        background: selected ? `rgba(${persona.id === 'executive' ? '245,158,11' : persona.id === 'manager' ? '59,130,246' : '139,92,246'},0.08)` : 'rgba(8,15,31,0.6)',
        border: `1px solid ${selected ? c.border : 'rgba(30,58,95,0.4)'}`,
        boxShadow: selected ? `0 0 20px ${c.glow}` : 'none',
      }}
    >
      <div className="flex items-start gap-3">
        <div className="text-xl mt-0.5">{icons[persona.id]}</div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-sm font-semibold text-white">{persona.title}</span>
            {selected && <span className="w-1.5 h-1.5 rounded-full" style={{ background: c.accent }} />}
          </div>
          <p className="text-xs text-slate-400 mb-2 leading-relaxed">{persona.description}</p>
          <div className="flex flex-wrap gap-1">
            {persona.tags.map(t => (
              <span key={t} className={`text-xs px-2 py-0.5 rounded-full border ${c.tag}`}>{t}</span>
            ))}
          </div>
        </div>
      </div>
    </button>
  );
}

export default function Login() {
  const [email, setEmail]         = useState('');
  const [password, setPassword]   = useState('');
  const [error, setError]         = useState('');
  const [loading, setLoading]     = useState(false);
  const [selectedPersona, setSelectedPersona] = useState('executive');
  const [step, setStep]           = useState('persona'); // 'persona' | 'login'
  const [mounted, setMounted]     = useState(false);
  const { login, setPersona }     = useAuth();
  const navigate                  = useNavigate();

  useEffect(() => { setTimeout(() => setMounted(true), 100); }, []);

  const personas = [
    {
      id: 'executive',
      title: 'C-Suite Executive / CEO',
      description: 'Strategic decisions, company-wide visibility, AI-synthesized briefings at a glance.',
      tags: ['Strategic', 'P&L Owner', 'Board Ready'],
      email: 'ceo@company.com',
      password: 'ceo123',
    },
    {
      id: 'manager',
      title: 'Director / VP / Manager',
      description: 'Team performance, cross-functional coordination, tactical recommendations.',
      tags: ['Operational', 'Team Lead', 'KPI Driven'],
      email: 'manager@company.com',
      password: 'manager123',
    },
    {
      id: 'analyst',
      title: 'Senior Analyst / Specialist',
      description: 'Deep data analysis, report generation, market intelligence research.',
      tags: ['Data-Driven', 'Research', 'Reports'],
      email: 'analyst@company.com',
      password: 'analyst123',
    },
  ];

  const handlePersonaSelect = (id) => {
    setSelectedPersona(id);
    const p = personas.find(p => p.id === id);
    if (p) { setEmail(p.email); setPassword(p.password); }
  };

  const handlePersonaContinue = () => {
    const p = personas.find(p => p.id === selectedPersona);
    if (p) { setEmail(p.email); setPassword(p.password); }
    setStep('login');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const result = await login(email, password, selectedPersona);
      if (result.success) { navigate('/dashboard'); }
      else { setError(result.error || 'Invalid credentials'); }
    } catch { setError('An error occurred during login'); }
    finally { setLoading(false); }
  };

  const kpis = [
    { value: 94, max: 100, color: '#10b981', label: 'Decision Accuracy', sublabel: '%' },
    { value: 12, max: 20,  color: '#3b82f6', label: 'Risks Mitigated',   sublabel: '/mo' },
    { value: 87, max: 100, color: '#f59e0b', label: 'AI Confidence',     sublabel: '%' },
    { value: 6,  max: 10,  color: '#8b5cf6', label: 'Active Agents',     sublabel: '/10' },
  ];

  const particles = [
    { width:3,height:3,background:'rgba(59,130,246,0.6)',top:'15%',left:'8%',duration:'9s' },
    { width:2,height:2,background:'rgba(6,182,212,0.5)',top:'70%',left:'12%',duration:'11s' },
    { width:4,height:4,background:'rgba(139,92,246,0.4)',top:'30%',left:'92%',duration:'7s' },
    { width:2,height:2,background:'rgba(245,158,11,0.5)',top:'80%',left:'85%',duration:'13s' },
    { width:3,height:3,background:'rgba(16,185,129,0.5)',top:'50%',left:'3%',duration:'10s' },
    { width:2,height:2,background:'rgba(59,130,246,0.4)',top:'10%',left:'75%',duration:'8s' },
    { width:5,height:5,background:'rgba(6,182,212,0.2)',top:'90%',left:'50%',duration:'14s' },
  ];

  const features = [
    { icon: '🤖', text: '4 AI Agents running in parallel' },
    { icon: '📊', text: 'Real-time ERP · CRM · HR synthesis' },
    { icon: '⚡', text: 'Decisions in seconds, not hours' },
    { icon: '🔒', text: 'Role-based access & audit trail' },
    { icon: '🌐', text: '6 live data connectors' },
    { icon: '🎯', text: 'Confidence-scored recommendations' },
  ];

  return (
    <div className="min-h-screen bg-mesh overflow-hidden flex relative">
      {/* Particles */}
      {particles.map((p, i) => <Particle key={i} style={p} />)}

      {/* Grid overlay */}
      <div className="absolute inset-0 opacity-20 pointer-events-none"
        style={{ backgroundImage: 'linear-gradient(rgba(30,58,95,0.3) 1px,transparent 1px),linear-gradient(90deg,rgba(30,58,95,0.3) 1px,transparent 1px)', backgroundSize: '60px 60px' }} />

      {/* ── LEFT: Hero Infographic Panel ── */}
      <div className={`hidden lg:flex flex-col justify-between w-[58%] p-10 xl:p-14 transition-all duration-700 ${mounted ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-10'}`}>

        {/* Brand */}
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center"
              style={{ background: 'linear-gradient(135deg,#2563eb,#06b6d4)', boxShadow: '0 0 20px rgba(37,99,235,0.5)' }}>
              <span className="text-xl">⚡</span>
            </div>
            <span className="text-xl font-bold text-white tracking-tight">Executive OS</span>
            <span className="text-xs px-2 py-0.5 rounded-full border border-blue-500/30 bg-blue-500/10 text-blue-400 ml-1">v2.0</span>
          </div>
          <p className="text-slate-500 text-sm ml-13">AI-Powered Decision Intelligence Platform</p>
        </div>

        {/* Hero Headline */}
        <div className="my-6">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-cyan-500/30 bg-cyan-500/10 mb-5">
            <div className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
            <span className="text-xs text-cyan-400 font-medium">Live · 4 Agents Active · 6 Connectors Online</span>
          </div>
          <h1 className="text-4xl xl:text-5xl font-extrabold leading-tight mb-4 tracking-tight">
            <span className="gradient-text-hero">Intelligence that</span><br />
            <span className="text-white">acts before you ask.</span>
          </h1>
          <p className="text-slate-400 text-lg leading-relaxed max-w-xl">
            Your enterprise data, synthesized by AI agents into crystal-clear decisions —
            risks ranked, actions prioritized, outcomes predicted.
          </p>
        </div>

        {/* KPI Gauges */}
        <div className="glass-card rounded-2xl p-6 mb-6 border-gradient">
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm font-semibold text-slate-300">Live Platform Metrics</span>
            <div className="flex items-center gap-1.5">
              <div className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
              <span className="text-xs text-green-400">Updated just now</span>
            </div>
          </div>
          <div className="grid grid-cols-4 gap-4">
            {kpis.map((k, i) => <GaugeRing key={i} {...k} />)}
          </div>
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          {[
            { n: 2847, s: '+', label: 'Decisions Supported',  color: '#3b82f6' },
            { n: 98,   s: '%', label: 'Uptime SLA',           color: '#10b981' },
            { n: 3.2,  s: 'x', label: 'Avg ROI Multiplier',  color: '#f59e0b' },
          ].map((stat, i) => (
            <div key={i} className="glass-card rounded-xl p-4 text-center">
              <div className="text-2xl font-extrabold mb-0.5" style={{ color: stat.color, textShadow: `0 0 15px ${stat.color}88` }}>
                <Counter target={stat.n} suffix={stat.s} />
              </div>
              <div className="text-xs text-slate-500">{stat.label}</div>
            </div>
          ))}
        </div>

        {/* Feature pills */}
        <div className="grid grid-cols-2 gap-2">
          {features.map((f, i) => (
            <div key={i} className="flex items-center gap-2 px-3 py-2 rounded-lg"
              style={{ background: 'rgba(15,31,61,0.5)', border: '1px solid rgba(30,58,95,0.4)' }}>
              <span className="text-base">{f.icon}</span>
              <span className="text-xs text-slate-400">{f.text}</span>
            </div>
          ))}
        </div>
      </div>

      {/* ── RIGHT: Auth Panel ── */}
      <div className={`flex-1 flex flex-col justify-center px-6 py-10 lg:px-10 xl:px-14 transition-all duration-700 delay-200 ${mounted ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-10'}`}
        style={{ borderLeft: '1px solid rgba(30,58,95,0.4)' }}>

        {/* Mobile brand */}
        <div className="flex items-center gap-2 mb-8 lg:hidden">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center"
            style={{ background: 'linear-gradient(135deg,#2563eb,#06b6d4)' }}>
            <span className="text-sm">⚡</span>
          </div>
          <span className="text-lg font-bold text-white">Executive OS</span>
        </div>

        <div className="w-full max-w-md mx-auto">
          {step === 'persona' ? (
            /* ── Step 1: Persona Selection ── */
            <div className="animate-fade-in">
              <div className="mb-6">
                <h2 className="text-2xl font-bold text-white mb-1">Who are you?</h2>
                <p className="text-slate-400 text-sm">Select your role to personalize your AI experience</p>
              </div>

              <div className="space-y-3 mb-6">
                {personas.map(p => (
                  <PersonaCard
                    key={p.id}
                    persona={p}
                    selected={selectedPersona === p.id}
                    onSelect={handlePersonaSelect}
                  />
                ))}
              </div>

              <button
                type="button"
                onClick={handlePersonaContinue}
                className="btn-primary w-full py-3 px-6 rounded-xl text-sm"
              >
                Continue as {personas.find(p => p.id === selectedPersona)?.title?.split(' ')[0]} →
              </button>

              <p className="text-center text-xs text-slate-500 mt-4">
                Your experience will be tailored to your role and responsibilities
              </p>
            </div>
          ) : (
            /* ── Step 2: Login Form ── */
            <div className="animate-slide-up">
              {/* Back button */}
              <button type="button" onClick={() => setStep('persona')}
                className="flex items-center gap-2 text-slate-400 hover:text-white text-sm mb-6 transition-colors">
                ← Back to role selection
              </button>

              {/* Selected persona badge */}
              <div className="flex items-center gap-3 mb-6 p-3 rounded-xl"
                style={{ background: 'rgba(15,31,61,0.6)', border: '1px solid rgba(59,130,246,0.2)' }}>
                <div className="text-xl">
                  {selectedPersona === 'executive' ? '👑' : selectedPersona === 'manager' ? '🎯' : '🔬'}
                </div>
                <div>
                  <div className="text-sm font-semibold text-white">
                    {personas.find(p => p.id === selectedPersona)?.title}
                  </div>
                  <div className="text-xs text-slate-400">Dashboard personalized for this role</div>
                </div>
                <div className="ml-auto w-2 h-2 rounded-full bg-green-400 animate-pulse" />
              </div>

              <div className="mb-5">
                <h2 className="text-2xl font-bold text-white mb-1">Sign In</h2>
                <p className="text-slate-400 text-sm">Access your AI command center</p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1.5 uppercase tracking-wider">
                    Email Address
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    className="input-dark w-full px-4 py-3 rounded-xl text-sm"
                    placeholder="you@company.com"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1.5 uppercase tracking-wider">
                    Password
                  </label>
                  <input
                    type="password"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    className="input-dark w-full px-4 py-3 rounded-xl text-sm"
                    placeholder="••••••••"
                    required
                  />
                </div>

                {error && (
                  <div className="flex items-center gap-2 px-4 py-3 rounded-xl"
                    style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)' }}>
                    <span className="text-red-400 text-sm">⚠ {error}</span>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="btn-primary w-full py-3 px-6 rounded-xl text-sm"
                >
                  {loading ? (
                    <span className="flex items-center justify-center gap-2">
                      <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                      </svg>
                      Authenticating...
                    </span>
                  ) : 'Access Dashboard →'}
                </button>
              </form>

              {/* Quick access chips */}
              <div className="mt-6">
                <p className="text-xs text-slate-500 text-center mb-3">Quick demo access</p>
                <div className="flex gap-2">
                  {personas.map(p => (
                    <button key={p.id} type="button"
                      onClick={() => { setEmail(p.email); setPassword(p.password); setSelectedPersona(p.id); }}
                      className="flex-1 text-xs py-1.5 px-2 rounded-lg transition-all"
                      style={{
                        background: selectedPersona === p.id ? 'rgba(59,130,246,0.2)' : 'rgba(15,31,61,0.5)',
                        border: `1px solid ${selectedPersona === p.id ? 'rgba(59,130,246,0.4)' : 'rgba(30,58,95,0.4)'}`,
                        color: selectedPersona === p.id ? '#60a5fa' : '#64748b',
                      }}>
                      {p.id === 'executive' ? '👑' : p.id === 'manager' ? '🎯' : '🔬'} {p.title.split(' ')[0]}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Footer */}
          <div className="mt-10 pt-6 border-t border-navy-600/40 text-center">
            <p className="text-xs text-slate-600">
              🔒 Enterprise-grade security · SOC 2 Type II · AES-256 encryption
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
