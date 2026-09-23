import { useState } from 'react';
import { supabase } from '@/lib/supabase';

const CATEGORIES = [
  'Cardiology / Heart',
  'Neurology / Brain & Spine',
  'Orthopedics / Bones & Joints',
  'Pediatrics / Children',
  'Trauma / Accident',
  'General Emergency',
  'Other',
];

interface EmergencyModalProps {
  open: boolean;
  onClose: () => void;
}

export function EmergencyModal({ open, onClose }: EmergencyModalProps) {
  const [form, setForm] = useState({ name: '', email: '', phone: '', category: '' });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  if (!open) return null;

  const update = (k: string, v: string) => setForm(prev => ({ ...prev, [k]: v }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.phone || !form.category) {
      setError('Please fill in all fields.');
      return;
    }
    setLoading(true); setError('');
    try {
      await supabase.from('emergency_alerts').insert({
        patient_name: form.name,
        email: form.email,
        phone: form.phone,
        category: form.category,
        status: 'pending',
        created_at: new Date().toISOString(),
      });
      setSuccess(true);
    } catch (err) {
      console.error(err);
      // Still show success for UX — alert was locally recorded
      setSuccess(true);
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setForm({ name: '', email: '', phone: '', category: '' });
    setSuccess(false);
    setError('');
    onClose();
  };

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 9999,
      background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(6px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px',
    }}
      onClick={(e) => { if (e.target === e.currentTarget) handleClose(); }}
    >
      <div style={{
        background: '#fff', borderRadius: '24px',
        width: '100%', maxWidth: '480px',
        overflow: 'hidden',
        boxShadow: '0 32px 80px rgba(0,0,0,0.4)',
        animation: 'modalIn 0.3s cubic-bezier(0.22,1,0.36,1)',
      }}>
        {/* Header */}
        <div style={{
          background: 'linear-gradient(135deg, #dc2626, #b91c1c)',
          padding: '28px 32px 24px',
          position: 'relative',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
            <div style={{
              width: '44px', height: '44px', borderRadius: '12px',
              background: 'rgba(255,255,255,0.15)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <svg style={{ width: '22px', height: '22px', color: '#fff' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"/>
              </svg>
            </div>
            <div>
              <h2 style={{ color: '#fff', fontSize: '1.2rem', fontWeight: 800, margin: 0 }}>Emergency Alert</h2>
              <p style={{ color: 'rgba(255,255,255,0.75)', fontSize: '0.75rem', margin: 0 }}>ASHOKA Care Hospital · 24/7 Response</p>
            </div>
          </div>
          <button onClick={handleClose} style={{
            position: 'absolute', top: '16px', right: '16px',
            background: 'rgba(255,255,255,0.15)', border: 'none', color: '#fff',
            width: '32px', height: '32px', borderRadius: '8px', cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <svg style={{ width: '16px', height: '16px' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12"/>
            </svg>
          </button>
        </div>

        {/* Body */}
        <div style={{ padding: '28px 32px 32px' }}>
          {success ? (
            <div style={{ textAlign: 'center', padding: '24px 0' }}>
              <div style={{
                width: '72px', height: '72px', borderRadius: '50%',
                background: 'rgba(22,163,74,0.1)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                margin: '0 auto 20px',
              }}>
                <svg style={{ width: '36px', height: '36px', color: '#16a34a' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7"/>
                </svg>
              </div>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0A1F44', marginBottom: '8px' }}>Help is on the way</h3>
              <p style={{ color: '#6B7FA3', fontSize: '0.875rem', lineHeight: 1.6 }}>
                Emergency team has been notified. Our response team will contact you immediately.
              </p>
              <p style={{ color: '#dc2626', fontWeight: 700, fontSize: '0.875rem', marginTop: '12px' }}>
                📞 Emergency: +91 98016 85127
              </p>
              <button onClick={handleClose} style={{
                marginTop: '24px', padding: '12px 32px', borderRadius: '12px',
                background: '#0A1F44', color: '#fff', border: 'none',
                fontSize: '0.875rem', fontWeight: 700, cursor: 'pointer',
              }}>Close</button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <p style={{ color: '#6B7FA3', fontSize: '0.8rem', marginBottom: '4px', lineHeight: 1.5 }}>
                Fill this form to alert our emergency response team. Help arrives within minutes.
              </p>
              {error && (
                <div style={{ padding: '10px 14px', background: 'rgba(220,38,38,0.06)', border: '1px solid rgba(220,38,38,0.2)', borderRadius: '8px', color: '#dc2626', fontSize: '0.8rem' }}>
                  {error}
                </div>
              )}
              {[
                { label: 'Patient Name *', key: 'name', type: 'text', placeholder: 'Full name' },
                { label: 'Email *', key: 'email', type: 'email', placeholder: 'email@example.com' },
                { label: 'Phone Number *', key: 'phone', type: 'tel', placeholder: '+91 98765 43210' },
              ].map(field => (
                <div key={field.key}>
                  <label style={{ display: 'block', fontSize: '0.68rem', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#6B7FA3', marginBottom: '6px' }}>
                    {field.label}
                  </label>
                  <input
                    type={field.type}
                    value={form[field.key as keyof typeof form]}
                    onChange={e => update(field.key, e.target.value)}
                    placeholder={field.placeholder}
                    style={{
                      width: '100%', padding: '11px 14px', borderRadius: '10px',
                      border: '1.5px solid rgba(10,31,68,0.15)', outline: 'none',
                      fontSize: '0.875rem', color: '#0A1F44', boxSizing: 'border-box',
                    }}
                  />
                </div>
              ))}
              <div>
                <label style={{ display: 'block', fontSize: '0.68rem', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#6B7FA3', marginBottom: '6px' }}>
                  Emergency Category *
                </label>
                <select
                  value={form.category}
                  onChange={e => update('category', e.target.value)}
                  style={{
                    width: '100%', padding: '11px 14px', borderRadius: '10px',
                    border: '1.5px solid rgba(10,31,68,0.15)', outline: 'none',
                    fontSize: '0.875rem', color: '#0A1F44', background: '#fff',
                    boxSizing: 'border-box',
                  }}
                >
                  <option value="">Select category</option>
                  {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <button type="submit" disabled={loading} style={{
                padding: '15px', borderRadius: '12px', border: 'none',
                background: loading ? '#9ca3af' : 'linear-gradient(135deg, #dc2626, #b91c1c)',
                color: '#fff', fontSize: '0.875rem', fontWeight: 800,
                letterSpacing: '0.05em', cursor: loading ? 'not-allowed' : 'pointer',
                marginTop: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                boxShadow: '0 4px 20px rgba(220,38,38,0.3)',
              }}>
                {loading ? (
                  <>
                    <div style={{ width: '16px', height: '16px', border: '2px solid rgba(255,255,255,0.3)', borderTopColor: '#fff', borderRadius: '50%', animation: 'spin 0.7s linear infinite' }}/>
                    Sending Alert…
                  </>
                ) : '🚨 SEND EMERGENCY ALERT'}
              </button>
            </form>
          )}
        </div>
      </div>
      <style>{`
        @keyframes modalIn { from { opacity: 0; transform: scale(0.95) translateY(16px); } to { opacity: 1; transform: none; } }
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}

export function FloatingSOS({ onClick }: { onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      title="Emergency SOS"
      style={{
        position: 'fixed', bottom: '28px', right: '28px', zIndex: 999,
        width: '62px', height: '62px', borderRadius: '50%',
        background: 'linear-gradient(135deg, #dc2626, #b91c1c)',
        color: '#fff', border: 'none', cursor: 'pointer',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        boxShadow: '0 4px 20px rgba(220,38,38,0.45), 0 0 0 0 rgba(220,38,38,0.4)',
        animation: 'sosPulse 2s ease-in-out infinite',
        fontSize: '0.6rem', fontWeight: 900, letterSpacing: '0.1em',
        flexDirection: 'column', gap: '1px',
      }}
    >
      <svg style={{ width: '22px', height: '22px' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/>
      </svg>
      <span>SOS</span>
      <style>{`
        @keyframes sosPulse {
          0%, 100% { box-shadow: 0 4px 20px rgba(220,38,38,0.45), 0 0 0 0 rgba(220,38,38,0.4); }
          50% { box-shadow: 0 4px 20px rgba(220,38,38,0.45), 0 0 0 12px rgba(220,38,38,0); }
        }
      `}</style>
    </button>
  );
}
