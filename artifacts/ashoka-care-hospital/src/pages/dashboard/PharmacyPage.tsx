import { useState } from 'react';
import { Pill } from 'lucide-react';
import { PageIntro, MetricCard, StatusPill, Modal } from '@/components/DashboardShared';

const MEDS = ['Paracetamol 500mg','Amlodipine 5mg','Metformin 500mg','Amoxicillin 250mg','Atorvastatin 20mg','Cetirizine 10mg','Omeprazole 20mg','Aspirin 75mg','Diclofenac 75mg','Insulin (Actrapid)'];
const DOCTORS = ['Dr. Arjun Mehta','Dr. Neha Iyer','Dr. Sameer Rao','Dr. Sunita Verma'];

export default function PharmacyPage() {
  const [tab, setTab] = useState<'rx'|'stock'>('rx');
  const [rxList, setRxList] = useState([
    { id: 'RX-4902', patient: 'Aarav Sharma', medicine: 'Amlodipine 5mg', doctor: 'Dr. Arjun Mehta', qty: '30 tabs', status: 'Ready' },
    { id: 'RX-4901', patient: 'Maya Kapoor', medicine: 'Paracetamol 500mg', doctor: 'Dr. Neha Iyer', qty: '20 tabs', status: 'Processing' },
    { id: 'RX-4900', patient: 'Rohan Desai', medicine: 'Diclofenac 75mg', doctor: 'Dr. Sameer Rao', qty: '10 tabs', status: 'Ready' },
    { id: 'RX-4899', patient: 'Anita Pillai', medicine: 'Metformin 500mg', doctor: 'Dr. Neha Iyer', qty: '60 tabs', status: 'Pending' },
  ]);
  const [stock, setStock] = useState([
    { name: 'Paracetamol 500mg', category: 'Analgesic', qty: 2400, min: 500 },
    { name: 'Amlodipine 5mg', category: 'Cardiac', qty: 120, min: 200 },
    { name: 'Metformin 500mg', category: 'Antidiabetic', qty: 980, min: 300 },
    { name: 'Amoxicillin 250mg', category: 'Antibiotic', qty: 45, min: 100 },
    { name: 'Normal Saline 500ml', category: 'IV Fluid', qty: 230, min: 100 },
  ]);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ patient: '', medicine: '', doctor: '', qty: '' });
  const upd = (k: string, v: string) => setForm(p => ({ ...p, [k]: v }));

  const createRx = (e: React.FormEvent) => {
    e.preventDefault();
    setRxList(prev => [{ id: `RX-${4903 + prev.length}`, patient: form.patient, medicine: form.medicine, doctor: form.doctor || 'Self-order', qty: form.qty, status: 'Pending' }, ...prev]);
    setShowModal(false); setForm({ patient: '', medicine: '', doctor: '', qty: '' });
  };

  const STATUS_S: Record<string, string> = { Ready: 'status-good', Processing: 'status-warn', Pending: 'status-neutral', Dispensed: 'status-good' };

  return (
    <>
      <PageIntro eyebrow="MEDICATIONS" title="Pharmacy"
        description="Process prescriptions, keep dispensing visible, and act before stock becomes a care delay."
        action="New prescription" onAction={() => setShowModal(true)} />

      <div className="grid gap-4 md:grid-cols-3 mb-5">
        <MetricCard label="To dispense" value={rxList.filter(r => r.status !== 'Dispensed').length} hint="8 high priority" icon={Pill} />
        <MetricCard label="Ready for pickup" value={rxList.filter(r => r.status === 'Ready').length} hint="Average 11 min" icon={Pill} tone="teal" />
        <MetricCard label="Low stock items" value={stock.filter(s => s.qty < s.min).length} hint="Needs reorder" icon={Pill} tone="amber" />
      </div>

      <div className="flex gap-2 mb-4">
        {(['rx','stock'] as const).map(t => (
          <button key={t} onClick={() => setTab(t)} className={`rounded-lg px-4 py-2 text-sm font-semibold transition ${tab === t ? 'bg-primary text-primary-foreground' : 'border border-border hover:bg-muted text-muted-foreground'}`}>
            {t === 'rx' ? 'Prescriptions' : 'Medicine Stock'}
          </button>
        ))}
      </div>

      {tab === 'rx' && (
        <div className="rounded-xl border border-border bg-card p-4 soft-shadow overflow-x-auto">
          <table className="data-table">
            <thead><tr><th>Rx</th><th>Patient</th><th>Medicine</th><th>Prescriber</th><th>Qty</th><th>Status</th><th className="text-right">Action</th></tr></thead>
            <tbody>
              {rxList.map(r => (
                <tr key={r.id}>
                  <td className="mono-font text-xs font-bold">{r.id}</td>
                  <td className="font-semibold">{r.patient}</td>
                  <td>{r.medicine}</td>
                  <td className="text-xs text-muted-foreground">{r.doctor}</td>
                  <td className="text-xs">{r.qty}</td>
                  <td><span className={`status-pill ${STATUS_S[r.status] ?? 'status-neutral'}`}><span className="h-1.5 w-1.5 rounded-full bg-current"/>{r.status}</span></td>
                  <td className="text-right">
                    <select value={r.status} onChange={e => setRxList(prev => prev.map(x => x.id === r.id ? { ...x, status: e.target.value } : x))}
                      className="field text-xs py-1 px-2" style={{ width: 'auto' }}>
                      <option>Pending</option><option>Processing</option><option>Ready</option><option>Dispensed</option>
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {tab === 'stock' && (
        <div className="space-y-3">
          {stock.map(item => {
            const low = item.qty < item.min;
            const pct = Math.min((item.qty / (item.min * 5)) * 100, 100);
            return (
              <div key={item.name} className={`rounded-xl border p-4 ${low ? 'border-destructive/20 bg-destructive/3' : 'border-border bg-card'}`}>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-sm">{item.name}</span>
                    <span className="rounded px-2 py-0.5 text-xs font-medium bg-secondary text-secondary-foreground">{item.category}</span>
                    {low && <span className="text-xs font-bold text-destructive bg-destructive/10 px-2 py-0.5 rounded">LOW STOCK</span>}
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`font-bold text-lg ${low ? 'text-destructive' : 'text-foreground'}`}>{item.qty}</span>
                    <button onClick={() => setStock(prev => prev.map(s => s.name === item.name ? { ...s, qty: s.qty + 500 } : s))}
                      className="rounded-lg border border-border px-3 py-1.5 text-xs font-semibold hover:bg-muted">+ Restock</button>
                  </div>
                </div>
                <div className="h-1.5 rounded-full bg-muted overflow-hidden">
                  <div className={`h-full rounded-full transition-all ${low ? 'bg-destructive' : pct < 50 ? 'bg-amber-500' : 'bg-primary'}`} style={{ width: `${pct}%` }} />
                </div>
                <p className="text-xs text-muted-foreground mt-1">Min level: {item.min} units</p>
              </div>
            );
          })}
        </div>
      )}

      {showModal && (
        <Modal title="New Prescription" onClose={() => setShowModal(false)}>
          <form onSubmit={createRx} className="space-y-4">
            <label className="field-label">Patient Name *<input required value={form.patient} onChange={e => upd('patient', e.target.value)} className="field" /></label>
            <label className="field-label">Medicine *
              <select required value={form.medicine} onChange={e => upd('medicine', e.target.value)} className="field">
                <option value="">Select medicine</option>
                {MEDS.map(m => <option key={m}>{m}</option>)}
              </select>
            </label>
            <div className="grid grid-cols-2 gap-4">
              <label className="field-label">Prescribed By
                <select value={form.doctor} onChange={e => upd('doctor', e.target.value)} className="field">
                  <option value="">Select doctor</option>
                  {DOCTORS.map(d => <option key={d}>{d}</option>)}
                </select>
              </label>
              <label className="field-label">Quantity *<input required value={form.qty} onChange={e => upd('qty', e.target.value)} className="field" placeholder="e.g. 30 tabs" /></label>
            </div>
            <button className="w-full rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground">Create Prescription</button>
          </form>
        </Modal>
      )}
    </>
  );
}
