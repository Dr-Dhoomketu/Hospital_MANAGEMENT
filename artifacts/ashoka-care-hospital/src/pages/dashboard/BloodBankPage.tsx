import { useState } from 'react';
import { TestTube2 } from 'lucide-react';
import { PageIntro, MetricCard, StatusPill, Modal } from '@/components/DashboardShared';

const BLOOD_GROUPS = ['A+','A-','B+','B-','O+','O-','AB+','AB-'];
const WARDS = ['Emergency','OT','Ward 3B','Ward 2A','ICU','Gynaecology'];

export default function BloodBankPage() {
  const [stock, setStock] = useState([
    { group: 'A+',  units: 42, min: 20 }, { group: 'A-',  units: 8,  min: 10 },
    { group: 'B+',  units: 35, min: 20 }, { group: 'B-',  units: 5,  min: 10 },
    { group: 'O+',  units: 60, min: 25 }, { group: 'O-',  units: 12, min: 15 },
    { group: 'AB+', units: 18, min: 10 }, { group: 'AB-', units: 3,  min: 8  },
  ]);
  const [requests, setRequests] = useState([
    { id: 'BR-001', patient: 'Anita Pillai', group: 'O+', units: 2, ward: 'Gynaecology', urgency: 'Urgent',   status: 'Fulfilled' },
    { id: 'BR-002', patient: 'Vikram Singh', group: 'B+', units: 1, ward: 'Emergency',   urgency: 'Critical', status: 'Pending'   },
  ]);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ patient: '', group: 'O+', units: '1', ward: '', urgency: 'Routine' });
  const upd = (k: string, v: string) => setForm(p => ({ ...p, [k]: v }));

  const reserveUnit = (e: React.FormEvent) => {
    e.preventDefault();
    const n = parseInt(form.units);
    setStock(prev => prev.map(s => s.group === form.group ? { ...s, units: Math.max(0, s.units - n) } : s));
    setRequests(prev => [{ id: `BR-${String(prev.length + 3).padStart(3,'0')}`, patient: form.patient, group: form.group, units: n, ward: form.ward, urgency: form.urgency, status: 'Pending' }, ...prev]);
    setShowModal(false); setForm({ patient: '', group: 'O+', units: '1', ward: '', urgency: 'Routine' });
  };

  const low = stock.filter(s => s.units < s.min).length;

  return (
    <>
      <PageIntro eyebrow="TRANSFUSION SERVICES" title="Blood bank"
        description="Track units, reservations, and expiry risk with a precise inventory view."
        action="Reserve unit" onAction={() => setShowModal(true)} />

      <div className="grid gap-4 md:grid-cols-3 mb-6">
        <MetricCard label="Available units" value={stock.reduce((s,b) => s + b.units, 0)} hint="Across 8 groups" icon={TestTube2} />
        <MetricCard label="Pending requests" value={requests.filter(r => r.status === 'Pending').length} hint="Needs fulfillment" icon={TestTube2} tone="amber" />
        <MetricCard label="Low stock alerts" value={low} hint={`${low} groups below minimum`} icon={TestTube2} tone={low > 0 ? 'red' : 'teal'} />
      </div>

      <div className="grid grid-cols-4 gap-3 mb-6 sm:grid-cols-8">
        {stock.map(b => {
          const low = b.units < b.min;
          const pct = Math.min((b.units / (b.min * 4)) * 100, 100);
          return (
            <div key={b.group} className={`rounded-xl border p-3 text-center ${low ? 'border-destructive/25 bg-destructive/4' : 'border-border bg-card'}`}>
              <div className={`text-xl font-black mb-1 ${low ? 'text-destructive' : 'text-foreground'}`}>{b.group}</div>
              <div className="text-2xl font-black">{b.units}</div>
              <div className="text-[10px] text-muted-foreground mb-2">units</div>
              <div className="h-1 rounded-full bg-muted overflow-hidden">
                <div className={`h-full rounded-full ${low ? 'bg-destructive' : 'bg-primary'}`} style={{ width: `${pct}%` }} />
              </div>
              {low && <div className="text-[9px] text-destructive font-bold mt-1">LOW</div>}
            </div>
          );
        })}
      </div>

      <div className="rounded-xl border border-border bg-card soft-shadow overflow-hidden">
        <div className="p-4 border-b border-border"><h3 className="font-bold">Blood Requests</h3></div>
        <div className="overflow-x-auto">
          <table className="data-table">
            <thead><tr><th>ID</th><th>Patient</th><th>Group</th><th>Units</th><th>Ward</th><th>Urgency</th><th>Status</th><th className="text-right">Action</th></tr></thead>
            <tbody>
              {requests.map(r => (
                <tr key={r.id}>
                  <td className="mono-font text-xs font-bold">{r.id}</td>
                  <td className="font-semibold">{r.patient}</td>
                  <td className="font-black text-destructive">{r.group}</td>
                  <td>{r.units}</td>
                  <td className="text-xs text-muted-foreground">{r.ward}</td>
                  <td><span className={`status-pill ${r.urgency === 'Critical' ? 'status-warn' : r.urgency === 'Urgent' ? 'status-warn' : 'status-neutral'}`}><span className="h-1.5 w-1.5 rounded-full bg-current"/>{r.urgency}</span></td>
                  <td><span className={`status-pill ${r.status === 'Fulfilled' ? 'status-good' : 'status-neutral'}`}><span className="h-1.5 w-1.5 rounded-full bg-current"/>{r.status}</span></td>
                  <td className="text-right">
                    {r.status === 'Pending' && (
                      <button onClick={() => setRequests(prev => prev.map(x => x.id === r.id ? { ...x, status: 'Fulfilled' } : x))}
                        className="rounded-lg border border-border px-2.5 py-1.5 text-xs font-semibold hover:bg-muted">Fulfil</button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {showModal && (
        <Modal title="Reserve Blood Unit" onClose={() => setShowModal(false)}>
          <form onSubmit={reserveUnit} className="space-y-4">
            <label className="field-label">Patient Name *<input required value={form.patient} onChange={e => upd('patient', e.target.value)} className="field" /></label>
            <div className="grid grid-cols-2 gap-4">
              <label className="field-label">Blood Group *
                <select value={form.group} onChange={e => upd('group', e.target.value)} className="field">
                  {BLOOD_GROUPS.map(g => <option key={g}>{g}</option>)}
                </select>
              </label>
              <label className="field-label">Units *<input required type="number" min="1" value={form.units} onChange={e => upd('units', e.target.value)} className="field" /></label>
            </div>
            <label className="field-label">Ward *
              <select required value={form.ward} onChange={e => upd('ward', e.target.value)} className="field">
                <option value="">Select ward</option>
                {WARDS.map(w => <option key={w}>{w}</option>)}
              </select>
            </label>
            <label className="field-label">Urgency
              <select value={form.urgency} onChange={e => upd('urgency', e.target.value)} className="field">
                <option>Routine</option><option>Urgent</option><option>Critical</option>
              </select>
            </label>
            <button className="w-full rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground">Reserve Unit</button>
          </form>
        </Modal>
      )}
    </>
  );
}
