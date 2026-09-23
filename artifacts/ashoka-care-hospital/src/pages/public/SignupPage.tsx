import { useState } from 'react';
import { Link, useLocation } from 'wouter';
import { useSignUp } from '@clerk/clerk-react';

// Safe wrapper in case Clerk isn't properly configured
function useSignUpSafe() {
  try {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    return useSignUp();
  } catch {
    return { signUp: null, isLoaded: false };
  }
}

const inputStyle: React.CSSProperties = {
  width: '100%', padding: '12px 14px', borderRadius: '10px',
  border: '1.5px solid rgba(47,93,170,0.15)', outline: 'none',
  fontSize: '0.875rem', color: '#0A1F44', boxSizing: 'border-box',
};
const labelStyle: React.CSSProperties = {
  display: 'block', fontSize: '0.62rem', fontWeight: 700,
  letterSpacing: '0.12em', textTransform: 'uppercase', color: '#6B7FA3', marginBottom: '7px',
};

export default function SignupPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [code, setCode] = useState('');
  const [step, setStep] = useState<'form' | 'verify'>('form');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [, navigate] = useLocation();
  const { signUp, isLoaded } = useSignUpSafe();

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isLoaded || !signUp) { setError('Auth not configured.'); return; }
    if (password !== confirm) { setError('Passwords do not match'); return; }
    if (password.length < 8) { setError('Password must be at least 8 characters'); return; }
    setError(''); setLoading(true);
    try {
      await signUp.create({
        emailAddress: email,
        password,
        firstName: name.split(' ')[0],
        lastName: name.split(' ').slice(1).join(' ') || undefined,
      });
      await signUp.prepareEmailAddressVerification({ strategy: 'email_code' });
      setStep('verify');
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to create account');
    } finally { setLoading(false); }
  };

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isLoaded || !signUp) return;
    setError(''); setLoading(true);
    try {
      const result = await signUp.attemptEmailAddressVerification({ code });
      if (result.status === 'complete') navigate('/portal/dashboard');
      else setError('Verification failed. Check the code and try again.');
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Verification failed');
    } finally { setLoading(false); }
  };

  const handleGoogle = async () => {
    if (!isLoaded || !signUp) return;
    try {
      await signUp.authenticateWithRedirect({
        strategy: 'oauth_google',
        redirectUrl: '/sso-callback',
        redirectUrlComplete: '/portal/dashboard',
      });
    } catch { /* silently ignore */ }
  };

  return (
    <main style={{ minHeight: '100vh', background: '#F4F7FC', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px 20px' }}>
      <div style={{ width: '100%', maxWidth: '460px' }}>
        <Link href="/">
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '36px', cursor: 'pointer' }}>
            <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: '#0A1F44', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <svg style={{ width: '20px', height: '20px', color: '#fff' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"/>
              </svg>
            </div>
            <div>
              <div style={{ fontSize: '0.95rem', fontWeight: 800, color: '#0A1F44' }}>ASHOKA Care</div>
              <div style={{ fontSize: '0.6rem', color: '#6B7FA3', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.1em' }}>Hospital</div>
            </div>
          </div>
        </Link>

        <div style={{ background: '#fff', borderRadius: '24px', border: '1px solid rgba(47,93,170,0.1)', boxShadow: '0 4px 40px rgba(10,31,68,0.08)', padding: '36px' }}>
          {step === 'form' ? (
            <>
              <div style={{ marginBottom: '28px' }}>
                <div style={{ fontSize: '0.58rem', fontWeight: 800, letterSpacing: '0.3em', textTransform: 'uppercase', color: '#2F5DAA', marginBottom: '8px' }}>New Patient</div>
                <h1 style={{ fontSize: '1.75rem', fontWeight: 900, color: '#0A1F44', letterSpacing: '-0.03em', marginBottom: '6px' }}>Create your account</h1>
                <p style={{ fontSize: '0.8rem', color: '#6B7FA3' }}>Join ASHOKA Care for seamless healthcare management</p>
              </div>

              {error && (
                <div style={{ marginBottom: '20px', padding: '12px 16px', background: 'rgba(239,68,68,0.05)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: '10px', color: '#dc2626', fontSize: '0.8rem' }}>
                  {error}
                </div>
              )}

              {/* Google */}
              <button onClick={handleGoogle} style={{ width: '100%', padding: '12px', borderRadius: '10px', border: '1.5px solid rgba(10,31,68,0.15)', background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', cursor: 'pointer', marginBottom: '20px', fontSize: '0.875rem', fontWeight: 600, color: '#0A1F44', transition: 'border-color 0.2s' }}>
                <svg style={{ width: '18px', height: '18px' }} viewBox="0 0 24 24">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                </svg>
                Sign up with Google
              </button>

              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
                <div style={{ flex: 1, height: '1px', background: 'rgba(10,31,68,0.1)' }}/>
                <span style={{ fontSize: '0.7rem', color: '#A0AEC0', fontWeight: 600 }}>OR</span>
                <div style={{ flex: 1, height: '1px', background: 'rgba(10,31,68,0.1)' }}/>
              </div>

              <form onSubmit={handleSignup} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div><label style={labelStyle}>Full Name</label><input required type="text" value={name} onChange={e => setName(e.target.value)} placeholder="Kavya Sharma" style={inputStyle}/></div>
                <div><label style={labelStyle}>Email Address</label><input required type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@example.com" style={inputStyle}/></div>
                <div><label style={labelStyle}>Password</label><input required type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Min 8 characters" style={inputStyle}/></div>
                <div><label style={labelStyle}>Confirm Password</label><input required type="password" value={confirm} onChange={e => setConfirm(e.target.value)} placeholder="Repeat password" style={inputStyle}/></div>
                <button type="submit" disabled={loading} style={{ padding: '14px', borderRadius: '10px', border: 'none', background: loading ? '#6B7FA3' : '#0A1F44', color: '#fff', fontSize: '0.75rem', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', cursor: loading ? 'not-allowed' : 'pointer', marginTop: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                  {loading
                    ? <><div style={{ width: '14px', height: '14px', border: '2px solid rgba(255,255,255,0.3)', borderTopColor: '#fff', borderRadius: '50%', animation: 'spin 0.7s linear infinite' }}/>Creating Account…</>
                    : 'Create Account →'}
                </button>
              </form>
            </>
          ) : (
            <>
              <div style={{ textAlign: 'center', marginBottom: '28px' }}>
                <div style={{ width: '56px', height: '56px', borderRadius: '50%', background: 'rgba(47,93,170,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
                  <svg style={{ width: '28px', height: '28px', color: '#2F5DAA' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/>
                  </svg>
                </div>
                <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#0A1F44', marginBottom: '8px' }}>Verify your email</h2>
                <p style={{ color: '#6B7FA3', fontSize: '0.875rem' }}>We sent a 6-digit code to <strong>{email}</strong></p>
              </div>

              {error && (
                <div style={{ marginBottom: '20px', padding: '12px 16px', background: 'rgba(239,68,68,0.05)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: '10px', color: '#dc2626', fontSize: '0.8rem' }}>
                  {error}
                </div>
              )}

              <form onSubmit={handleVerify} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div>
                  <label style={labelStyle}>Verification Code</label>
                  <input required value={code} onChange={e => setCode(e.target.value)} placeholder="123456" maxLength={6}
                    style={{ ...inputStyle, textAlign: 'center', fontSize: '1.5rem', letterSpacing: '0.4em', fontWeight: 700 }}/>
                </div>
                <button type="submit" disabled={loading} style={{ padding: '14px', borderRadius: '10px', border: 'none', background: loading ? '#6B7FA3' : '#0A1F44', color: '#fff', fontSize: '0.75rem', fontWeight: 700, cursor: loading ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                  {loading
                    ? <><div style={{ width: '14px', height: '14px', border: '2px solid rgba(255,255,255,0.3)', borderTopColor: '#fff', borderRadius: '50%', animation: 'spin 0.7s linear infinite' }}/>Verifying…</>
                    : 'Verify Email →'}
                </button>
              </form>
            </>
          )}

          <div style={{ marginTop: '20px', textAlign: 'center' }}>
            <Link href="/login" style={{ fontSize: '0.8rem', color: '#2F5DAA', fontWeight: 600, textDecoration: 'none' }}>
              Already have an account? Sign in
            </Link>
          </div>
        </div>
      </div>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </main>
  );
}
