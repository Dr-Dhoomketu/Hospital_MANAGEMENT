import { useState } from 'react';
import { Link, useLocation } from 'wouter';

const ADMIN_EMAIL = 'admin@ashoka.com';
const ADMIN_PASS = 'admin123';

const STAFF_ACCOUNTS = [
  { email: 'admin@ashoka.com', password: 'admin123', name: 'Admin User', role: 'Admin' },
  { email: 'doctor@ashoka.com', password: 'doctor123', name: 'Dr. Arjun Mehta', role: 'Doctor' },
  { email: 'nurse@ashoka.com', password: 'nurse123', name: 'Nurse Priya', role: 'Nurse' },
  { email: 'reception@ashoka.com', password: 'reception123', name: 'Receptionist', role: 'Receptionist' },
];

export default function DashboardLoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [, navigate] = useLocation();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(''); setLoading(true);
    await new Promise(r => setTimeout(r, 600));
    const found = STAFF_ACCOUNTS.find(a => a.email === email && a.password === password);
    if (found) {
      localStorage.setItem('ashoka_staff_token', `tok_${Date.now()}`);
      localStorage.setItem('ashoka_staff_user', JSON.stringify({ name: found.name, role: found.role, email: found.email }));
      navigate('/dashboard');
    } else {
      setError('Invalid email or password. Please check your credentials.');
    }
    setLoading(false);
  };

  return (
    <main style={{ minHeight: '100vh', background: '#ffffff', display: 'flex', overflow: 'hidden' }}>
      {/* Left panel */}
      <div className="staff-login-left" style={{
        width: '50%', background: '#0A1F44', position: 'relative',
        display: 'flex', flexDirection: 'column',
        alignItems: 'flex-start', justifyContent: 'center',
        padding: '72px 64px', flexShrink: 0, overflow: 'hidden',
      }}>
        <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none',
          backgroundImage: 'linear-gradient(rgba(255,255,255,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.04) 1px, transparent 1px)',
          backgroundSize: '44px 44px' }}/>
        <div style={{ position: 'absolute', top: '-20%', right: '-10%', width: '60%', height: '60%', borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(74,127,212,0.18) 0%, transparent 70%)', pointerEvents: 'none' }}/>

        <div style={{ position: 'relative', zIndex: 10, maxWidth: '380px' }}>
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: '8px',
            padding: '6px 14px', borderRadius: '999px',
            background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', marginBottom: '32px',
          }}>
            <div style={{ width: '5px', height: '5px', borderRadius: '50%', background: '#22c55e', boxShadow: '0 0 8px rgba(34,197,94,0.8)' }}/>
            <span style={{ fontSize: '0.55rem', fontWeight: 800, letterSpacing: '0.3em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.4)' }}>Staff Access Portal</span>
          </div>

          <h2 style={{ fontSize: '3.2rem', fontWeight: 900, color: '#fff', lineHeight: 0.92, letterSpacing: '-0.04em', marginBottom: '24px' }}>
            ASHOKA<br/>
            <span style={{ background: 'linear-gradient(135deg, #4A7FD4, #7ab0f0)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>STAFF</span>
          </h2>

          <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.9rem', lineHeight: 1.75, marginBottom: '40px' }}>
            Secure access for hospital staff, doctors, nurses, and administrators.
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {[
              { icon: 'M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z', label: 'Role-based Access Control' },
              { icon: 'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z', label: 'Live Patient Management' },
              { icon: 'M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z', label: 'Analytics & Reports' },
              { icon: 'M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z', label: 'Emergency Alerts' },
            ].map(({ icon, label }) => (
              <div key={label} style={{
                display: 'flex', alignItems: 'center', gap: '12px',
                padding: '11px 18px', borderRadius: '10px',
                background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)',
              }}>
                <svg style={{ width: '14px', height: '14px', color: '#4A7FD4', flexShrink: 0 }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={icon}/>
                </svg>
                <span style={{ fontSize: '0.68rem', fontWeight: 600, color: 'rgba(255,255,255,0.5)', letterSpacing: '0.06em' }}>{label}</span>
              </div>
            ))}
          </div>

        </div>
      </div>

      {/* Right panel */}
      <div style={{
        flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '40px 32px', position: 'relative', background: '#ffffff',
      }}>
        <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none',
          backgroundImage: 'linear-gradient(rgba(47,93,170,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(47,93,170,0.04) 1px, transparent 1px)',
          backgroundSize: '44px 44px' }}/>

        <div style={{ width: '100%', maxWidth: '420px', position: 'relative', zIndex: 10 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '44px' }}>
            <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: '#0A1F44', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <svg style={{ width: '20px', height: '20px', color: '#fff' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"/>
              </svg>
            </div>
            <div>
              <div style={{ fontSize: '0.95rem', fontWeight: 800, color: '#0A1F44' }}>ASHOKA Care</div>
              <div style={{ fontSize: '0.6rem', color: '#6B7FA3', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.1em' }}>Hospital Management</div>
            </div>
          </div>

          <div style={{ marginBottom: '36px' }}>
            <div style={{ fontSize: '0.58rem', fontWeight: 800, letterSpacing: '0.3em', textTransform: 'uppercase', color: '#2F5DAA', marginBottom: '10px' }}>Staff Portal</div>
            <h1 style={{ fontSize: '2.2rem', fontWeight: 900, color: '#0A1F44', letterSpacing: '-0.04em', lineHeight: 1.05, marginBottom: '8px' }}>Staff Sign In</h1>
            <p style={{ fontSize: '0.875rem', color: '#6B7FA3', lineHeight: 1.6 }}>Access the hospital management dashboard</p>
          </div>

          {error && (
            <div style={{ marginBottom: '24px', padding: '13px 16px', background: 'rgba(239,68,68,0.05)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: '10px', color: '#dc2626', fontSize: '0.8rem' }}>
              {error}
            </div>
          )}

          <div style={{ background: '#fff', borderRadius: '20px', border: '1px solid rgba(47,93,170,0.1)', boxShadow: '0 4px 32px rgba(10,31,68,0.07)', padding: '32px' }}>
            <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.62rem', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#6B7FA3', marginBottom: '8px' }}>Staff Email</label>
                <input required type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="staff@ashoka.com"
                  style={{ width: '100%', padding: '13px 16px', borderRadius: '10px', border: '1.5px solid rgba(47,93,170,0.15)', outline: 'none', fontSize: '0.875rem', color: '#0A1F44', boxSizing: 'border-box' }}/>
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.62rem', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#6B7FA3', marginBottom: '8px' }}>Password</label>
                <div style={{ position: 'relative' }}>
                  <input required type={showPassword ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••"
                    style={{ width: '100%', padding: '13px 44px 13px 16px', borderRadius: '10px', border: '1.5px solid rgba(47,93,170,0.15)', outline: 'none', fontSize: '0.875rem', color: '#0A1F44', boxSizing: 'border-box' }}/>
                  <button type="button" onClick={() => setShowPassword(!showPassword)} style={{ position: 'absolute', right: '14px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: '#A0AEC0', cursor: 'pointer', padding: 0 }}>
                    <svg style={{ width: '16px', height: '16px' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={showPassword ? "M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" : "M15 12a3 3 0 11-6 0 3 3 0 016 0zM2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"}/>
                    </svg>
                  </button>
                </div>
              </div>
              <button type="submit" disabled={loading} style={{
                width: '100%', padding: '15px', borderRadius: '10px', border: 'none',
                background: loading ? '#6B7FA3' : '#0A1F44', color: '#fff',
                fontSize: '0.72rem', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase',
                cursor: loading ? 'not-allowed' : 'pointer', marginTop: '4px', transition: 'all 0.2s',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                boxShadow: loading ? 'none' : '0 6px 24px rgba(10,31,68,0.2)',
              }}>
                {loading ? (<><div style={{ width: '14px', height: '14px', border: '2px solid rgba(255,255,255,0.3)', borderTopColor: '#fff', borderRadius: '50%', animation: 'spin 0.7s linear infinite' }}/>Signing in…</>) : 'Sign In →'}
              </button>
            </form>
          </div>

          <div style={{ marginTop: '28px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px' }}>
            <Link href="/login" style={{ fontSize: '0.75rem', color: '#6B7FA3', textDecoration: 'none', fontWeight: 600 }}>
              ← Patient login
            </Link>
            <Link href="/" style={{ fontSize: '0.7rem', color: '#A0AEC0', textDecoration: 'none', fontWeight: 600 }}>
              Back to Home
            </Link>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @media (max-width: 767px) { .staff-login-left { display: none !important; } }
      `}</style>
    </main>
  );
}
