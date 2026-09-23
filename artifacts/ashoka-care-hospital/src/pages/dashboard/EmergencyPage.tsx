import { useEffect, useState } from 'react';
import { Siren } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import ModulePage from './ModulePage';
import { PageIntro, MetricCard, StatusPill } from '@/components/DashboardShared';

interface Alert { id: string; patient_name: string; email: string; phone: string; category: string; status: string; created_at: string; }

const DEMO: Alert[] = [
  { id: 'e1', patient_name: 'Vikram Singh', email: 'v@x.com', phone: '+91 98001 11111', category: 'Cardiology / Heart', status: 'pending', created_at: new Date(Date.now() - 5 * 60000).toISOString() },
  { id: 'e2', patient_name: 'Sunita Rao', email: 's@x.com', phone: '+91 99002 22222', category: 'Trauma / Accident', status: 'acknowledged', created_at: new Date(Date.now() - 18 * 60000).toISOString() },
];

function ago(iso: string) {
  const d = Math.floor((Date.now() - new Date(iso).getTime()) / 60000);
  return d < 1 ? 'Just now' : d < 60 ? `${d}m ago` : `${Math.floor(d / 60)}h ago`;
}

export default function EmergencyPage() {
  const [alerts, setAlerts] = useState<Alert[]>(DEMO);

  useEffect(() => {
    supabase.from('emergency_alerts').select('*').order('created_at', { ascending: false }).limit(50)
      .then(({ data }) => { if (data && data.length > 0) setAlerts(data as Alert[]); });
    const ch = supabase.channel('em').on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'emergency_alerts' }, p => {
      setAlerts(prev => [p.new as Alert, ...prev]);
    }).subscribe();
    return () => { supabase.removeChannel(ch); };
  }, []);

  const update = async (id: string, status: string) => {
    setAlerts(p => p.map(a => a.id === id ? { ...a, status } : a));
    await supabase.from('emergency_alerts').update({ status }).eq('id', id).then(() => {});
  };

  const pending = alerts.filter(a => a.status === 'pending');

  return (
    <>
      <PageIntro eyebrow="HIGH PRIORITY" title="Emergency response"
        description="Triage first, keep the team aligned, and surface the most urgent cases without noise."
        action="Register arrival" onAction={() => {}} />

      {pending.length > 0 && (
        <div className="mb-6 flex items-center gap-3 rounded-xl border border-destructive/25 bg-destructive/6 px-4 py-3">
          <span className="h-3 w-3 rounded-full bg-destructive animate-pulse shrink-0" />
          <p className="text-sm font-bold text-destructive">{pending.length} pending alert{pending.length > 1 ? 's' : ''} — response required immediately</p>
        </div>
      )}

      <div className="grid gap-4 md:grid-cols-4 mb-6">
        <MetricCard label="Waiting for triage" value={pending.length} hint="Requires response" icon={Siren} tone="red" />
        <MetricCard label="Acknowledged" value={alerts.filter(a=>a.status==='acknowledged').length} hint="Being handled" icon={Siren} tone="amber" />
        <MetricCard label="Resolved" value={alerts.filter(a=>a.status==='resolved').length} hint="Cleared today" icon={Siren} tone="teal" />
        <MetricCard label="Resus bays" value="2 / 4" hint="2 available now" icon={Siren} tone="blue" />
      </div>

      <div className="space-y-3">
        {alerts.map(a => (
          <div key={a.id} className={`rounded-xl border p-4 flex items-center justify-between gap-4 flex-wrap transition ${a.status === 'pending' ? 'border-destructive/25 bg-destructive/4' : 'border-border bg-card'}`}>
            <div className="flex items-center gap-3">
              <div className={`grid h-10 w-10 place-items-center rounded-lg ${a.status === 'pending' ? 'bg-destructive/10 text-destructive' : 'bg-muted text-muted-foreground'}`}>
                <Siren size={18} />
              </div>
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-bold text-sm">{a.patient_name}</span>
                  <span className="rounded-full bg-muted px-2 py-0.5 text-[10px] font-semibold text-muted-foreground">{a.category}</span>
                </div>
                <p className="text-xs text-muted-foreground mt-0.5">📞 {a.phone} · 📧 {a.email} · {ago(a.created_at)}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <StatusPill status={a.status === 'pending' ? 'Critical' : a.status === 'acknowledged' ? 'In Progress' : 'Resolved'} />
              {a.status === 'pending' && <button onClick={() => update(a.id, 'acknowledged')} className="rounded-lg bg-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground">Acknowledge</button>}
              {a.status === 'acknowledged' && <button onClick={() => update(a.id, 'resolved')} className="rounded-lg border border-border px-3 py-1.5 text-xs font-semibold hover:bg-muted">Resolve</button>}
            </div>
          </div>
        ))}
      </div>
    </>
  );
}
