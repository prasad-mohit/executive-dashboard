import os

content = r"""import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { company } from '../data/gisData';

const ROLES = [
  { id: 'executive', label: 'CXO / Executive',   email: 'ceo@gis.com',    password: 'ceo123',    color: '#2563eb' },
  { id: 'manager',   label: 'Leader / Analyst',   email: 'leader@gis.com', password: 'leader123', color: '#7c3aed' },
  { id: 'analyst',   label: 'Admin / Super User', email: 'admin@gis.com',  password: 'admin123',  color: '#0891b2' },
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
    <div className="min-h-screen flex" style={{ background: '#f4f6f9' }}>

      {/* ── LEFT: Login form (white card) ── */}
      <div
        className="flex flex-col justify-center w-full lg:w-[480px] flex-shrink-0 px-12 py-12"
        style={{ background: '#ffffff', borderRight: '1px solid #e2e8f0' }}
      >
        {/* Logo */}
        <div className="flex items-center gap-3 mb-10">
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center font-black text-base text-white"
            style={{ background: 'linear-gradient(135deg, #2563eb, #4f46e5)' }}
          >Si</div>
          <div>
            <div className="font-bold text-xl" style={{ color: '#0f172a' }}>SiBoNi</div>
            <div className="text-xs" style={{ color: '#94a3b8' }}>CXO Cockpit</div>
          </div>
        </div>

        <h1 className="text-2xl font-black mb-1" style={{ color: '#0f172a' }}>Sign in</h1>
        <p className="text-sm mb-8" style={{ color: '#64748b' }}>
          Sign in to your {company.name} cockpit
        </p>

        {/* Role selector */}
        <div className="mb-6">
          <div className="text-xs font-semibold uppercase tracking-wider mb-2.5" style={{ color: '#94a3b8' }}>
            Select your role
          </div>
          <div className="grid grid-cols-3 gap-2">
            {ROLES.map(role => (
              <button
                key={role.id}
                type="button"
                onClick={() => handleRoleSelect(role.id)}
                className="flex flex-col items-center gap-2 p-3 rounded-xl transition-all"
                style={{
                  background: selectedRole === role.id ? role.color + '0d' : '#f8fafc',
                  border: selectedRole === role.id ? '1.5px solid ' + role.color + '60' : '1.5px solid #e2e8f0',
                }}
              >
                <div
                  className="w-8 h-8 rounded-lg flex items-center justify-center font-bold text-xs"
                  style={{
                    background: selectedRole === role.id ? role.color + '15' : '#f1f5f9',
                    color: selectedRole === role.id ? role.color : '#64748b',
                  }}
                >
                  {role.id === 'executive' ? 'CEO' : role.id === 'manager' ? 'VP' : 'ADM'}
                </div>
                <span
                  className="text-xs font-semibold text-center leading-tight"
                  style={{ color: selectedRole === role.id ? role.color : '#64748b' }}
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
            <label className="block text-xs font-semibold mb-1.5" style={{ color: '#374151' }}>
              Email address
            </label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              placeholder="you@company.com"
              className="w-full rounded-xl px-4 py-3 text-sm outline-none transition-all"
              style={{
                background: '#ffffff',
                border: '1.5px solid #d1d5db',
                color: '#0f172a',
              }}
              onFocus={e => e.target.style.borderColor = '#2563eb'}
              onBlur={e => e.target.style.borderColor = '#d1d5db'}
            />
          </div>
          <div>
            <label className="block text-xs font-semibold mb-1.5" style={{ color: '#374151' }}>
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
              placeholder="Password"
              className="w-full rounded-xl px-4 py-3 text-sm outline-none transition-all"
              style={{
                background: '#ffffff',
                border: '1.5px solid #d1d5db',
                color: '#0f172a',
              }}
              onFocus={e => e.target.style.borderColor = '#2563eb'}
              onBlur={e => e.target.style.borderColor = '#d1d5db'}
            />
          </div>

          {error && (
            <div
              className="rounded-xl px-4 py-3 text-xs"
              style={{ background: '#fef2f2', border: '1px solid #fecaca', color: '#dc2626' }}
            >
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-xl text-sm font-bold text-white transition-all disabled:opacity-60"
            style={{ background: 'linear-gradient(135deg, #2563eb, #4f46e5)' }}
          >
            {loading ? 'Signing in...' : 'Sign in'}
          </button>
        </form>

        {/* Demo accounts */}
        <div
          className="mt-6 rounded-xl p-4"
          style={{ background: '#f8fafc', border: '1px solid #e2e8f0' }}
        >
          <div
            className="text-xs font-semibold mb-3 uppercase tracking-wider"
            style={{ color: '#94a3b8' }}
          >
            Demo accounts
          </div>
          {ROLES.map(r => (
            <button
              key={r.id}
              type="button"
              onClick={() => handleRoleSelect(r.id)}
              className="w-full flex items-center gap-2 text-xs py-1.5 transition-colors text-left"
              style={{ color: '#64748b' }}
            >
              <span className="font-semibold w-32 flex-shrink-0" style={{ color: r.color }}>
                {r.label}
              </span>
              <span className="flex-1" style={{ color: '#94a3b8' }}>{r.email}</span>
              <span style={{ color: '#cbd5e1' }}>{r.password}</span>
            </button>
          ))}
        </div>

        <div className="mt-6 text-xs text-center" style={{ color: '#cbd5e1' }}>
          &copy; 2026 SiBoNi &middot; Confidential
        </div>
      </div>

      {/* ── RIGHT: Brand panel ── */}
      <div
        className="hidden lg:flex flex-1 flex-col justify-between p-12 relative overflow-hidden"
        style={{ background: 'linear-gradient(135deg, #1e3a8a 0%, #312e81 100%)' }}
      >
        {/* Subtle pattern overlay */}
        <div
          className="absolute inset-0 pointer-events-none opacity-20"
          style={{
            backgroundImage: 'radial-gradient(circle at 25% 25%, rgba(255,255,255,0.15) 0%, transparent 50%), radial-gradient(circle at 75% 75%, rgba(255,255,255,0.08) 0%, transparent 50%)',
          }}
        />

        <div className="relative z-10">
          <div
            className="inline-flex items-center gap-2 text-xs font-semibold px-3 py-1.5 rounded-full mb-10"
            style={{ background: 'rgba(255,255,255,0.15)', color: 'rgba(255,255,255,0.9)' }}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
            Decision Intelligence Platform
          </div>

          <h2 className="text-5xl font-black mb-5 leading-tight text-white">
            SiBoNi CXO<br />Cockpit for<br />executive<br />decision-making
          </h2>

          <p className="text-base leading-relaxed mb-10" style={{ color: 'rgba(255,255,255,0.7)' }}>
            Synthesises your internal data and external signals into a daily brief
            so executives spend time deciding, not searching.
          </p>

          <div className="space-y-5">
            {[
              { title: 'Decisions, not data', desc: 'Every insight is framed as a decision — with why now, impact range, and confidence.', dot: '#60a5fa' },
              { title: 'Internal + external signals', desc: 'CRM, ERP, quality systems + steel prices, tariffs, competitor moves — synthesized.', dot: '#34d399' },
              { title: 'Commit and track', desc: 'COMMIT a decision, assign an owner, track execution — all in one cockpit.', dot: '#fbbf24' },
            ].map(item => (
              <div key={item.title} className="flex items-start gap-3">
                <div className="w-2 h-2 rounded-full mt-1.5 flex-shrink-0" style={{ background: item.dot }} />
                <div>
                  <div className="text-sm font-bold text-white">{item.title}</div>
                  <div className="text-xs mt-0.5" style={{ color: 'rgba(255,255,255,0.6)' }}>{item.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="relative z-10">
          <div
            className="rounded-2xl p-5"
            style={{ background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.15)' }}
          >
            <div className="text-sm font-bold text-white mb-1">{company.name}</div>
            <div className="text-xs" style={{ color: 'rgba(255,255,255,0.6)' }}>
              {company.industry} &middot; Prototype &middot; Detroit, Pune, Michigan
            </div>
          </div>
          <div className="mt-4 text-xs text-center" style={{ color: 'rgba(255,255,255,0.4)' }}>
            <a href="/" className="hover:text-white transition-colors">Back to landing page</a>
            <span className="mx-2 opacity-40">|</span>
            <a href="#" className="hover:text-white transition-colors">Read more about SiBoNi</a>
          </div>
        </div>
      </div>
    </div>
  );
}
"""

out_path = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), 'src', 'components', 'Login.jsx')
with open(out_path, 'w', encoding='utf-8') as f:
    f.write(content)
print('Written:', out_path)
