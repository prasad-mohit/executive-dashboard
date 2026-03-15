content = r"""import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { company } from '../data/gisData';

const ROLES = [
  { id: 'executive', label: 'CXO / Executive',   email: 'ceo@gis.com',    password: 'ceo123',    color: '#f59e0b' },
  { id: 'manager',   label: 'Leader / Analyst',   email: 'leader@gis.com', password: 'leader123', color: '#3b82f6' },
  { id: 'analyst',   label: 'Admin / Super User', email: 'admin@gis.com',  password: 'admin123',  color: '#8b5cf6' },
];

export default function Login() {
  const [email, setEmail]       = useState('ceo@gis.com');
  const [password, setPassword] = useState('ceo123');
  const [error, setError]       = useState('');
  const [loading, setLoading]   = useState(false);
  const [selectedRole, setSelectedRole] = useState('executive');
  const { login, setPersona }   = useAuth();
  const navigate                = useNavigate();

  const handleRoleSelect = (roleId) => {
    setSelectedRole(roleId);
    const r = ROLES.find(r => r.id === roleId);
    if (r) { setEmail(r.email); setPassword(r.password); }
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(''); setLoading(true);
    try {
      const role = ROLES.find(r => r.email === email) || ROLES[0];
      const result = await login(email, password, role.id);
      if (result && result.success) {
        if (setPersona) setPersona(role.id);
        navigate('/app/home');
      } else {
        const matched = ROLES.find(r => r.email === email && r.password === password);
        if (matched) { navigate('/app/home'); }
        else { setError('Invalid credentials. Use a demo account below.'); }
      }
    } catch { setError('Something went wrong.'); }
    finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen flex" style={{ background: '#07090f', color: '#e2e8f0' }}>
      {/* LEFT: Login form */}
      <div className="flex flex-col justify-center w-full lg:w-[480px] flex-shrink-0 px-10 py-12">
        {/* Logo */}
        <div className="flex items-center gap-3 mb-10">
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center font-black text-base text-white"
            style={{ background: 'linear-gradient(135deg, #2563eb, #4f46e5)', boxShadow: '0 0 20px rgba(37,99,235,0.4)' }}
          >Si</div>
          <div>
            <div className="font-bold text-lg text-white leading-none">SiBoNi</div>
            <div className="text-xs text-slate-600">CXO Cockpit</div>
          </div>
        </div>

        <h1 className="text-2xl font-black text-white mb-1">Welcome back</h1>
        <p className="text-sm text-slate-500 mb-8">Sign in to your {company.name} cockpit</p>

        {/* Role selector */}
        <div className="mb-6">
          <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2.5">Select your role</div>
          <div className="grid grid-cols-3 gap-2">
            {ROLES.map(role => (
              <button
                key={role.id}
                type="button"
                onClick={() => handleRoleSelect(role.id)}
                className="flex flex-col items-center gap-1.5 p-3 rounded-xl transition-all"
                style={{
                  background: selectedRole === role.id ? role.color + '18' : 'rgba(255,255,255,0.03)',
                  border: selectedRole === role.id ? '1px solid ' + role.color + '40' : '1px solid rgba(255,255,255,0.07)',
                }}
              >
                <div
                  className="w-8 h-8 rounded-lg flex items-center justify-center font-bold text-xs"
                  style={{ background: role.color + '18', color: role.color }}
                >
                  {role.id === 'executive' ? 'CEO' : role.id === 'manager' ? 'VP' : 'ADM'}
                </div>
                <span
                  className="text-xs font-semibold text-center leading-tight"
                  style={{ color: selectedRole === role.id ? role.color : '#94a3b8' }}
                >
                  {role.label}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-500 mb-1.5">Email</label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              placeholder="you@company.com"
              className="w-full rounded-xl px-4 py-3 text-sm text-white outline-none"
              style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.12)' }}
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-500 mb-1.5">Password</label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
              placeholder="Password"
              className="w-full rounded-xl px-4 py-3 text-sm text-white outline-none"
              style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.12)' }}
            />
          </div>
          {error && (
            <div
              className="rounded-xl px-4 py-3 text-xs"
              style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', color: '#fca5a5' }}
            >
              {error}
            </div>
          )}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 rounded-xl text-sm font-bold text-white disabled:opacity-60"
            style={{ background: 'linear-gradient(135deg, #2563eb, #4f46e5)', boxShadow: '0 4px 20px rgba(37,99,235,0.3)' }}
          >
            {loading ? 'Signing in...' : 'Sign in to CXO Cockpit'}
          </button>
        </form>

        {/* Demo accounts */}
        <div className="mt-6 rounded-xl p-3.5" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)' }}>
          <div className="text-xs font-semibold text-slate-600 mb-2 uppercase tracking-wider">Demo accounts</div>
          {ROLES.map(r => (
            <button
              key={r.id}
              type="button"
              onClick={() => handleRoleSelect(r.id)}
              className="w-full flex items-center gap-2 text-xs py-1.5 text-slate-500 hover:text-slate-300 transition-colors"
            >
              <span className="font-semibold flex-shrink-0 w-32" style={{ color: r.color }}>{r.label}</span>
              <span className="flex-1 text-slate-700">{r.email}</span>
              <span className="text-slate-700 flex-shrink-0">{r.password}</span>
            </button>
          ))}
        </div>
        <div className="mt-6 text-xs text-slate-700 text-center">2026 SiBoNi Confidential</div>
      </div>

      {/* RIGHT: Brand panel */}
      <div
        className="hidden lg:flex flex-1 flex-col justify-between p-12 relative overflow-hidden"
        style={{ background: 'linear-gradient(135deg, #0a0f1e 0%, #0f1a35 50%, #0a0f1e 100%)', borderLeft: '1px solid rgba(37,99,235,0.15)' }}
      >
        <div
          className="absolute inset-0 pointer-events-none"
          style={{ background: 'radial-gradient(ellipse at 50% 40%, rgba(37,99,235,0.1) 0%, transparent 60%)' }}
        />
        <div className="relative z-10">
          <div
            className="inline-flex items-center gap-2 text-xs font-medium px-3 py-1.5 rounded-full mb-8"
            style={{ background: 'rgba(37,99,235,0.1)', border: '1px solid rgba(37,99,235,0.2)', color: '#60a5fa' }}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse" />
            Decision Intelligence Platform
          </div>
          <h2
            className="text-5xl font-black mb-6 leading-tight"
            style={{ background: 'linear-gradient(135deg, #fff 0%, #93c5fd 60%, #818cf8 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}
          >
            SiBoNi CXO Cockpit<br />for executive<br />decision-making
          </h2>
          <p className="text-base text-slate-400 max-w-md leading-relaxed mb-10">
            Synthesises your internal data and external signals into a daily brief so executives spend time deciding, not searching.
          </p>
          <div className="space-y-4">
            {[
              { title: 'Decisions, not data', desc: 'Every insight is framed as a decision with why now, impact range, and confidence score.', color: '#3b82f6' },
              { title: 'Internal + external signals', desc: 'CRM, ERP, quality systems + steel prices, tariffs, competitor moves, all synthesized.', color: '#10b981' },
              { title: 'Commit and track', desc: 'COMMIT a decision, assign an owner, track execution in one cockpit.', color: '#f59e0b' },
            ].map(item => (
              <div key={item.title} className="flex items-start gap-3">
                <div className="w-2 h-2 rounded-full mt-1.5 flex-shrink-0" style={{ background: item.color }} />
                <div>
                  <div className="text-sm font-bold text-white">{item.title}</div>
                  <div className="text-xs text-slate-500 mt-0.5">{item.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="relative z-10">
          <div
            className="rounded-2xl p-5"
            style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}
          >
            <div className="text-sm font-bold text-white mb-1">{company.name}</div>
            <div className="text-xs text-slate-600">{company.industry} | Prototype | Detroit, Pune, Michigan</div>
          </div>
          <div className="mt-4 text-xs text-center text-slate-700">
            <a href="/" className="hover:text-slate-400 transition-colors">Back to landing page</a>
            <span className="mx-2">|</span>
            <a href="#" className="hover:text-slate-400 transition-colors">Read more about SiBoNi</a>
          </div>
        </div>
      </div>
    </div>
  );
}
"""

import os
out_path = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), 'src', 'components', 'Login.jsx')
with open(out_path, 'w', encoding='utf-8') as f:
    f.write(content)
print('Written:', out_path)
