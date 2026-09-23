import { useEffect } from 'react';
import { Link, useLocation } from 'wouter';
import { useAuth, getUserDisplayName, getUserEmail } from '@/lib/auth';

export default function PortalDashboardPage() {
  const { user, signOut, loading } = useAuth();
  const [, navigate] = useLocation();

  useEffect(() => {
    if (!loading && !user) navigate('/login');
  }, [user, loading, navigate]);

  if (loading) return <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#6B7FA3' }}>Loading…</div>;
  if (!user) return null;

  const displayName = getUserDisplayName(user);
  const email = getUserEmail(user);

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  return (
    <div style={{ minHeight: '100vh', background: '#F4F7FC' }}>
      <header style={{ background: '#0A1F44', padding: '0 32px', height: '64px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Link href="/">
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer' }}>
            <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <svg style={{ width: '18px', height: '18px', color: '#fff' }} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"/></svg>
            </div>
            <div>
              <div style={{ fontSize: '0.85rem', fontWeight: 800, color: '#fff' }}>ASHOKA Care</div>
              <div style={{ fontSize: '0.55rem', color: 'rgba(255,255,255,0.5)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.1em' }}>Patient Portal</div>
            </div>
          </div>
        </Link>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.85)', fontWeight: 600 }}>{displayName}</div>
            <div style={{ fontSize: '0.65rem', color: 'rgba(255,255,255,0.45)' }}>{email}</div>
          </div>
          <button onClick={handleSignOut} style={{ padding: '8px 16px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.2)', background: 'transparent', color: 'rgba(255,255,255,0.7)', fontSize: '0.75rem', fontWeight: 600, cursor: 'pointer' }}>Sign Out</button>
        </div>
      </header>

      <main style={{ maxWidth: '1100px', margin: '0 auto', padding: '40px 24px' }}>
        <div style={{ marginBottom: '32px' }}>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#0A1F44' }}>Welcome back, {displayName} 👋</h1>
          <p style={{ color: '#6B7FA3', marginTop: '6px' }}>Here's your health summary</p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '20px', marginBottom: '32px' }}>
          {[
            { title: 'Next Appointment', value: 'Book one →', sub: 'No upcoming appointments', color: '#2F5DAA' },
            { title: 'Active Prescriptions', value: '—', sub: 'View in pharmacy', color: '#16a34a' },
            { title: 'Lab Results', value: '—', sub: 'No new results', color: '#d97706' },
            { title: 'Unpaid Bills', value: '₹0', sub: 'All clear', color: '#16a34a' },
          ].map(card => (
            <div key={card.title} style={{ background: '#fff', borderRadius: '20px', padding: '24px', border: '1px solid rgba(10,31,68,0.08)', boxShadow: '0 2px 12px rgba(10,31,68,0.04)' }}>
              <p style={{ fontSize: '0.68rem', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#A0AEC0', marginBottom: '8px' }}>{card.title}</p>
              <p style={{ fontSize: '1.5rem', fontWeight: 800, color: card.color }}>{card.value}</p>
              <p style={{ fontSize: '0.75rem', color: '#6B7FA3', marginTop: '4px' }}>{card.sub}</p>
            </div>
          ))}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
          <Link href="/book">
            <div style={{ background: '#0A1F44', borderRadius: '20px', padding: '28px', cursor: 'pointer', transition: 'transform 0.2s' }}>
              <p style={{ fontSize: '0.7rem', fontWeight: 700, letterSpacing: '0.15em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.5)', marginBottom: '8px' }}>Quick Action</p>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#fff', marginBottom: '6px' }}>Book Appointment</h3>
              <p style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.5)' }}>Schedule your next visit →</p>
            </div>
          </Link>
          <div style={{ background: '#fff', borderRadius: '20px', padding: '28px', border: '1px solid rgba(10,31,68,0.08)' }}>
            <p style={{ fontSize: '0.7rem', fontWeight: 700, letterSpacing: '0.15em', textTransform: 'uppercase', color: '#A0AEC0', marginBottom: '8px' }}>Emergency</p>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#dc2626', marginBottom: '6px' }}>Need Urgent Care?</h3>
            <p style={{ fontSize: '0.8rem', color: '#6B7FA3' }}>Call: <strong>+91 98016 85127</strong></p>
          </div>
        </div>
      </main>
    </div>
  );
}
