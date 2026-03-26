import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { company } from '../data/gisData';

const DEMO_ACCOUNTS = [
  { label: 'CXO / Executive',   email: 'ceo@gis.com',    password: 'ceo123',    color: '#2563eb' },
  { label: 'Leader / Analyst',  email: 'leader@gis.com', password: 'leader123', color: '#7c3aed' },
  { label: 'Admin / Super User',email: 'admin@gis.com',  password: 'admin123',  color: '#0891b2' },
];

export default function Login() {
  const [email, setEmail]       = useState('ceo@gis.com');
  const [password, setPassword] = useState('ceo123');
  const [error, setError]       = useState('');
  const [loading, setLoading]   = useState(false);
  const { login }               = useAuth();
  const navigate                = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(''); setLoading(true);
    try {
      const matched = DEMO_ACCOUNTS.find(a => a.email === email && a.password === password);
      if (matched) {
        await login(email, password, matched.label.toLowerCase().includes('cxo') ? 'executive' : matched.label.toLowerCase().includes('leader') ? 'manager' : 'analyst');
        navigate('/app/home');
      } else {
        setError('Invalid credentials. Use one of the demo accounts below.');
      }
    } catch { setError('Something went wrong.'); }
    finally { setLoading(false); }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', background: '#f4f6f9' }}>

      {/* ── LEFT: Login form ──────────────────────────────────── */}
      <div style={{
        width: 460, flexShrink: 0,
        background: '#ffffff', borderRight: '1px solid #e2e8f0',
        display: 'flex', flexDirection: 'column', justifyContent: 'center',
        padding: '48px 40px',
      }}>

        {/* Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 36 }}>
          <div style={{
            width: 40, height: 40, borderRadius: 12,
            background: 'linear-gradient(135deg, #2563eb, #4f46e5)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontWeight: 900, fontSize: 13, color: '#ffffff', letterSpacing: 0.5,
          }}>
            Si
          </div>
          <div>
            <div style={{ fontWeight: 800, fontSize: 18, color: '#0f172a', letterSpacing: 1 }}>SiBoNi</div>
            <div style={{ fontSize: 10, color: '#94a3b8', fontWeight: 600, letterSpacing: 0.5 }}>CXO COCKPIT</div>
          </div>
        </div>

        {/* Heading */}
        <h1 style={{ fontSize: 26, fontWeight: 900, color: '#0f172a', marginBottom: 6 }}>Sign in</h1>
        <p style={{ fontSize: 13, color: '#64748b', marginBottom: 28 }}>
          Sign in to your {company.name} cockpit
        </p>

        {/* Form */}
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div>
            <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#374151', marginBottom: 6 }}>
              Email address
            </label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              placeholder="you@company.com"
              style={{
                width: '100%', padding: '11px 14px', borderRadius: 10, fontSize: 13,
                border: '1.5px solid #d1d5db', color: '#0f172a', background: '#ffffff',
                outline: 'none', boxSizing: 'border-box',
              }}
              onFocus={e => e.target.style.borderColor = '#2563eb'}
              onBlur={e => e.target.style.borderColor = '#d1d5db'}
            />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#374151', marginBottom: 6 }}>
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
              placeholder="Password"
              style={{
                width: '100%', padding: '11px 14px', borderRadius: 10, fontSize: 13,
                border: '1.5px solid #d1d5db', color: '#0f172a', background: '#ffffff',
                outline: 'none', boxSizing: 'border-box',
              }}
              onFocus={e => e.target.style.borderColor = '#2563eb'}
              onBlur={e => e.target.style.borderColor = '#d1d5db'}
            />
          </div>

          {error && (
            <div style={{
              background: '#fef2f2', border: '1px solid #fecaca', color: '#dc2626',
              borderRadius: 10, padding: '10px 14px', fontSize: 12,
            }}>
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            style={{
              padding: '12px', borderRadius: 10, fontSize: 13, fontWeight: 700,
              background: 'linear-gradient(135deg, #2563eb, #4f46e5)',
              color: '#ffffff', border: 'none', cursor: loading ? 'not-allowed' : 'pointer',
              opacity: loading ? 0.6 : 1, marginTop: 4,
            }}
          >
            {loading ? 'Signing in…' : 'Sign in'}
          </button>
        </form>

        {/* Demo accounts */}
        <div style={{
          marginTop: 28, background: '#f8fafc', border: '1px solid #e2e8f0',
          borderRadius: 12, padding: '14px 16px',
        }}>
          <div style={{
            fontSize: 10, fontWeight: 700, color: '#94a3b8',
            textTransform: 'uppercase', letterSpacing: 1, marginBottom: 10,
          }}>
            Demo accounts
          </div>
          {DEMO_ACCOUNTS.map(a => (
            <button
              key={a.email}
              type="button"
              onClick={() => { setEmail(a.email); setPassword(a.password); setError(''); }}
              style={{
                display: 'flex', alignItems: 'center', gap: 8, width: '100%',
                background: 'none', border: 'none', cursor: 'pointer',
                padding: '5px 0', textAlign: 'left',
              }}
            >
              <span style={{ fontSize: 11, fontWeight: 700, color: a.color, width: 130, flexShrink: 0 }}>
                {a.label}
              </span>
              <span style={{ fontSize: 11, color: '#94a3b8', flex: 1 }}>{a.email}</span>
              <span style={{ fontSize: 11, color: '#cbd5e1' }}>{a.password}</span>
            </button>
          ))}
        </div>

        <div style={{ marginTop: 24, fontSize: 11, color: '#cbd5e1', textAlign: 'center' }}>
          &copy; 2026 SiBoNi &middot; Confidential
        </div>
      </div>

      {/* ── RIGHT: Brand panel ────────────────────────────────── */}
      <div style={{
        flex: 1,
        background: 'linear-gradient(135deg, #1e3a8a 0%, #312e81 100%)',
        display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
        padding: '48px 52px', position: 'relative', overflow: 'hidden',
      }}>
        {/* Subtle radial overlays */}
        <div style={{
          position: 'absolute', inset: 0, pointerEvents: 'none', opacity: 0.18,
          backgroundImage: 'radial-gradient(circle at 25% 25%, rgba(255,255,255,0.18) 0%, transparent 55%), radial-gradient(circle at 78% 78%, rgba(255,255,255,0.10) 0%, transparent 50%)',
        }} />

        <div style={{ position: 'relative', zIndex: 1 }}>
          {/* Badge */}
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 6,
            fontSize: 11, fontWeight: 600, color: 'rgba(255,255,255,0.9)',
            background: 'rgba(255,255,255,0.14)', padding: '6px 14px', borderRadius: 99,
            marginBottom: 32,
          }}>
            <span style={{
              width: 6, height: 6, borderRadius: '50%', background: '#4ade80',
              animation: 'pulse 2s infinite',
            }} />
            Decision Intelligence Platform
          </div>

          <h2 style={{
            fontSize: 40, fontWeight: 900, color: '#ffffff',
            lineHeight: 1.2, marginBottom: 20,
          }}>
            SiBoNi CXO<br />Cockpit for<br />executive<br />decision-making
          </h2>

          <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.70)', lineHeight: 1.7, marginBottom: 36 }}>
            Synthesises your internal data and external signals into a daily brief
            so executives spend time deciding, not searching.
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
            {[
              { title: 'Decisions, not data',          desc: 'Every insight is framed as a decision — with why now, impact range, and confidence.',        dot: '#60a5fa' },
              { title: 'Internal + external signals',  desc: 'CRM, ERP, quality systems + steel prices, tariffs, competitor moves — synthesized.',         dot: '#34d399' },
              { title: 'Commit and track',             desc: 'COMMIT a decision, assign an owner, track execution — all in one cockpit.',                   dot: '#fbbf24' },
            ].map(item => (
              <div key={item.title} style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
                <div style={{
                  width: 8, height: 8, borderRadius: '50%', background: item.dot,
                  marginTop: 5, flexShrink: 0,
                }} />
                <div>
                  <div style={{ fontSize: 13, fontWeight: 700, color: '#ffffff' }}>{item.title}</div>
                  <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.60)', marginTop: 2, lineHeight: 1.5 }}>
                    {item.desc}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div style={{ position: 'relative', zIndex: 1 }}>
          <div style={{
            background: 'rgba(255,255,255,0.10)', border: '1px solid rgba(255,255,255,0.14)',
            borderRadius: 14, padding: '16px 20px', marginBottom: 16,
          }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: '#ffffff', marginBottom: 4 }}>
              {company.name}
            </div>
            <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.55)' }}>
              {company.industry}&nbsp;·&nbsp;Prototype&nbsp;·&nbsp;Detroit, Pune, Michigan, Plano TX
            </div>
          </div>
          <div style={{ fontSize: 11, textAlign: 'center', color: 'rgba(255,255,255,0.35)' }}>
            <a href="/" style={{ color: 'rgba(255,255,255,0.5)', textDecoration: 'none' }}>
              Back to landing page
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
