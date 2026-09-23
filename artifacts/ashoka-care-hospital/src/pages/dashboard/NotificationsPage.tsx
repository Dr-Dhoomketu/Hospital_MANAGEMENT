import { useState, useEffect } from 'react';
import { Bell, Ambulance, AlertTriangle, FlaskConical, Calendar, Settings } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { PageIntro } from '@/components/DashboardShared';

interface Notif {
  id: string;
  title: string;
  message: string;
  type: 'appointment' | 'billing' | 'clinical' | 'system' | 'emergency';
  read: boolean;
  created_at: string;
}

interface EmergencyAlert {
  id: string;
  patient_name: string;
  phone: string;
  category: string;
  status: string;
  created_at: string;
}

const TYPE_META: Record<string, { icon: typeof Bell; color: string; bg: string }> = {
  emergency: { icon: AlertTriangle, color: '#dc2626', bg: 'rgba(220,38,38,0.1)' },
  appointment: { icon: Calendar,    color: '#2F5DAA', bg: 'rgba(47,93,170,0.1)' },
  clinical:    { icon: FlaskConical, color: '#7c3aed', bg: 'rgba(124,58,237,0.1)' },
  billing:     { icon: Bell,         color: '#16a34a', bg: 'rgba(22,163,74,0.1)' },
  system:      { icon: Settings,     color: '#6B7FA3', bg: 'rgba(107,127,163,0.1)' },
};

function ago(iso: string) {
  const d = Math.floor((Date.now() - new Date(iso).getTime()) / 60000);
  if (d < 1) return 'Just now';
  if (d < 60) return `${d}m ago`;
  if (d < 1440) return `${Math.floor(d / 60)}h ago`;
  return `${Math.floor(d / 1440)}d ago`;
}

export default function NotificationsPage() {
  const [notifs, setNotifs] = useState<Notif[]>([]);
  const [emergencies, setEmergencies] = useState<EmergencyAlert[]>([]);
  const [typeFilter, setTypeFilter] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAll();
    // Real-time subscription for emergency alerts
    const ch = supabase.channel('notifs')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'emergency_alerts' }, payload => {
        const a = payload.new as EmergencyAlert;
        setEmergencies(prev => [a, ...prev]);
        setNotifs(prev => [{
          id: `em-${a.id}`, title: '🚨 Emergency Alert',
          message: `${a.patient_name} · ${a.category} · ${a.phone}`,
          type: 'emergency', read: false, created_at: a.created_at,
        }, ...prev]);
      })
      .subscribe();
    return () => { supabase.removeChannel(ch); };
  }, []);

  const loadAll = async () => {
    setLoading(true);
    // Load emergency alerts as notifications
    const { data: em } = await supabase.from('emergency_alerts').select('*').order('created_at', { ascending: false }).limit(20);
    if (em) {
      setEmergencies(em as EmergencyAlert[]);
      const emNotifs: Notif[] = (em as EmergencyAlert[]).map(a => ({
        id: `em-${a.id}`, title: '🚨 Emergency Alert',
        message: `${a.patient_name} · ${a.category} · ${a.phone}`,
        type: 'emergency', read: a.status === 'resolved', created_at: a.created_at,
      }));
      // Load app notifications
      const { data: appNotifs } = await supabase.from('notifications').select('*').order('created_at', { ascending: false }).limit(30);
      const all = [...emNotifs, ...((appNotifs as Notif[]) ?? [])].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
      setNotifs(all);
    }
    setLoading(false);
  };

  const markAllRead = async () => {
    setNotifs(prev => prev.map(n => ({ ...n, read: true })));
    await supabase.from('emergency_alerts').update({ status: 'resolved' }).eq('status', 'pending').then(() => {});
    await supabase.from('notifications').update({ read: true }).eq('read', false).then(() => {});
  };

  const markOne = async (id: string) => {
    setNotifs(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
    if (id.startsWith('em-')) {
      const alertId = id.replace('em-', '');
      await supabase.from('emergency_alerts').update({ status: 'acknowledged' }).eq('id', alertId).then(() => {});
    } else {
      await supabase.from('notifications').update({ read: true }).eq('id', id).then(() => {});
    }
  };

  const sendAmbulance = async (alert: EmergencyAlert) => {
    await supabase.from('emergency_alerts').update({ status: 'ambulance_dispatched' }).eq('id', alert.id).then(() => {});
    setNotifs(prev => prev.map(n => n.id === `em-${alert.id}` ? { ...n, title: '🚑 Ambulance Dispatched', read: false } : n));
    alert_(`Ambulance dispatched to ${alert.patient_name} · ${alert.phone}`);
  };

  const filtered = notifs.filter(n => !typeFilter || n.type === typeFilter);
  const unread = notifs.filter(n => !n.read).length;

  return (
    <>
      <PageIntro eyebrow="INBOX" title="Notifications"
        description={`${unread} unread operational alerts. Act on emergency alerts immediately.`}
        action="Mark all read" onAction={markAllRead} />

      {/* Emergency alerts band */}
      {emergencies.filter(e => e.status === 'pending').length > 0 && (
        <div className="mb-6 rounded-xl border border-destructive/25 bg-destructive/5 p-4">
          <div className="flex items-center gap-3 mb-3">
            <span className="h-3 w-3 rounded-full bg-destructive animate-pulse"/>
            <span className="font-bold text-destructive text-sm">{emergencies.filter(e => e.status === 'pending').length} PENDING EMERGENCY ALERT{emergencies.filter(e => e.status === 'pending').length > 1 ? 'S' : ''}</span>
          </div>
          {emergencies.filter(e => e.status === 'pending').map(a => (
            <div key={a.id} className="flex items-center justify-between gap-4 rounded-lg border border-destructive/20 bg-white/50 p-3 mb-2 flex-wrap">
              <div>
                <p className="font-bold text-sm">{a.patient_name}</p>
                <p className="text-xs text-muted-foreground">{a.category} · 📞 {a.phone} · {ago(a.created_at)}</p>
              </div>
              <div className="flex gap-2">
                <button onClick={() => sendAmbulance(a)} className="inline-flex items-center gap-1.5 rounded-lg bg-destructive px-3 py-2 text-xs font-bold text-white">
                  🚑 Send Ambulance
                </button>
                <button onClick={() => markOne(`em-${a.id}`)} className="rounded-lg border border-border px-3 py-2 text-xs font-semibold hover:bg-muted">
                  Acknowledge
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Filters */}
      <div className="mb-4 flex gap-2 flex-wrap">
        {(['', 'emergency', 'appointment', 'clinical', 'billing', 'system'] as const).map(t => (
          <button key={t} onClick={() => setTypeFilter(t)}
            className={`rounded-full px-3 py-1.5 text-xs font-semibold transition ${typeFilter === t ? 'bg-primary text-primary-foreground' : 'bg-card border border-border text-muted-foreground hover:bg-muted'}`}>
            {t === '' ? 'All' : t.charAt(0).toUpperCase() + t.slice(1)}
          </button>
        ))}
      </div>

      <div className="rounded-xl border border-border bg-card p-4 soft-shadow">
        {loading ? (
          <div className="py-12 text-center text-sm text-muted-foreground">Loading notifications…</div>
        ) : filtered.length === 0 ? (
          <div className="py-12 text-center text-sm text-muted-foreground">No notifications{typeFilter ? ` of type "${typeFilter}"` : ''}</div>
        ) : (
          <div className="space-y-2">
            {filtered.map(n => {
              const meta = TYPE_META[n.type] ?? TYPE_META.system;
              const Icon = meta.icon;
              return (
                <div key={n.id} className={`flex gap-4 rounded-xl border p-4 transition ${!n.read ? 'border-primary/20 bg-secondary/35' : 'border-border bg-card'}`}>
                  <div style={{ background: meta.bg, color: meta.color }} className="mt-1 grid h-9 w-9 shrink-0 place-items-center rounded-lg">
                    <Icon size={17} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <h3 className="text-sm font-bold">{n.title}</h3>
                      <span className="text-[11px] text-muted-foreground">{ago(n.created_at)}</span>
                    </div>
                    <p className="mt-1 text-sm text-muted-foreground">{n.message}</p>
                    <div className="mt-3 flex items-center gap-3">
                      <span className="rounded-full bg-muted px-2 py-1 text-[10px] font-semibold text-muted-foreground capitalize">{n.type}</span>
                      {!n.read && (
                        <button onClick={() => markOne(n.id)} className="text-xs font-semibold text-primary hover:underline">
                          Mark read
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </>
  );
}

// helper
function alert_(msg: string) { window.alert(msg); }
