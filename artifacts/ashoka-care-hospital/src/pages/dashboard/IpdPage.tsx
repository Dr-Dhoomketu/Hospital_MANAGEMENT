import { useState } from 'react';
import { BedDouble } from 'lucide-react';
import { PageIntro, MetricCard, StatusPill, Modal } from '@/components/DashboardShared';

const WARDS = ['Ward 3B', 'Ward 2A', 'Ward 4C', 'ICU', 'Gynaecology Ward', 'Paediatric Ward'];
const DOCTORS = ['Dr. Arjun Mehta', 'Dr. Neha Iyer', 'Dr. Sameer Rao', 'Dr. Sunita Verma', 'Dr. Rajan Pillai'];

const STATUS_S: Record<string, string> = {
  Admitted: 'status-neutral', Critical: 'status-warn', 'Confirmed': 'status-good', Available: 'status-good', 'Discharge ready': 'status-good',
};

export default function IpdPage() {
  const [beds, setBeds] = useState([
    { bed: '3B-12', patient: 'Aarav Sharma',  ward: 'Ward 3B',   admitted: 'Today',  doctor: 'Dr. Arjun Mehta', diagnosis: 'Hypertension', status: 'Admitted' },
    { bed: '2A-04', patient: 'Maya Kapoor',   ward: 'Ward 2A',   admitted: '21 Sep', doctor: 'Dr. Neha Iyer',   diagnosis: 'Viral fever',  status: 'Discharge ready' },
    { bed: '4C-07', patient: '—',             ward: 'Ward 4C',   admitted: '—',      doctor: '—',               diagnosis: '—',           status: 'Available' },
    { bed: 'ICU-03', patient: 'Vikram Singh', ward: 'ICU',       admitted: '19 Sep', doctor: 'Dr. Arjun Mehta', diagnosis: 'Chest pain',   status: 'Critical' },
  ]);
  const [filter, setFilter] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ patient: '', ward: '', doctor: '', diagnosis: '', bed: '' });
  const upd = (k: string, v: string) => setForm(p => ({ ...p, [k]: v }));

  const admit = (e: React.FormEvent) => {
    e.preventDefault();
    setBeds(prev => prev.map(b => b.bed === form.bed ? { ...b, patient: form.patient, doctor: form.doctor, diagnosis: form.diagnosis, admitted: 'Today', status: 'Admitted' } : b));
    setShowModal(false);
    setForm({ patient: '', ward: '', doctor: '', diagnosis: '', bed: '' });
  };

  const filtered = beds.filter(b => b.patient.toLowerCase().includes(filter.toLowerCase()) || b.ward.toLowerCase().includes(filter.toLowerCase()));
  const occupied = beds.filter(b => b.status !== 'Available').length;
  const available = beds.filter(b => b.status === 'Available').length;

  return (
    <>
      <PageIntro eyebrow="INPATIENT CARE" title="IPD & beds"
        description="Track admissions, bed capacity, and discharge readiness across wards."
        action="New admission" onAction={() => setShowModal(true)} />

      <div className="grid gap-4 md:grid-cols-3 mb-5">
        <MetricCard label="Occupied beds" value={`${occupied} / ${beds.length}`} hint={`${Math.round((occupied/beds.length)*100)}% occupancy`} icon={BedDouble} />
        <MetricCard label="Available" value={available} hint="Ready for admission" icon={BedDouble} tone="teal" />
        <MetricCard label="Discharge ready" value={beds.filter(b => b.status === 'Discharge ready').length} hint="Pending summary" icon={BedDouble} tone="amber" />
      </div>

      {/* Occupancy bar */}
      <div className="mb-5 rounded-xl border border-border bg-card p-4">
        <div className="flex justify-between text-xs font-semibold mb-2">
          <span>Bed Occupancy</span><span className="text-destructive">{Math.round((occupied/beds.length)*100)}%</span>
        </div>
        <div className="h-2 rounded-full bg-muted overflow-hidden">
          <div className="h-full rounded-full bg-gradient-to-r from-primary to-destructive transition-all" style={{ width: `${(occupied/beds.length)*100}%` }} />
        </div>
      </div>

      <div className="rounded-xl border border-border bg-card p-4 soft-shadow">
        <div className="mb-4 flex flex-col justify-between gap-3 md:flex-row md:items-center">
          <div><h3 className="font-bold">Live worklist</h3><p className="mt-1 text-xs text-muted-foreground">{filtered.length} beds</p></div>
          <input value={filter} onChange={e => setFilter(e.target.value)} className="field md:w-72" placeholder="Filter IPD…" />
        </div>
        <div className="overflow-x-auto">
          <table className="data-table">
            <thead><tr><th>Bed</th><th>Patient</th><th>Ward</th><th>Admitted</th><th>Lead clinician</th><th>Diagnosis</th><th>Status</th><th className="text-right">Action</th></tr></thead>
            <tbody>
              {filtered.map(b => (
                <tr key={b.bed}>
                  <td><span className="font-bold mono-font text-xs">{b.bed}</span></td>
                  <td className={b.patient === '—' ? 'text-muted-foreground' : 'font-semibold'}>{b.patient}</td>
                  <td className="text-primary text-sm font-medium">{b.ward}</td>
                  <td className="text-xs text-muted-foreground">{b.admitted}</td>
                  <td className="text-xs text-muted-foreground">{b.doctor}</td>
                  <td className="text-xs">{b.diagnosis}</td>
                  <td><span className={`status-pill ${STATUS_S[b.status] ?? 'status-neutral'}`}><span className="h-1.5 w-1.5 rounded-full bg-current"/>{b.status}</span></td>
                  <td className="text-right">
                    {b.status !== 'Available' && (
                      <select value={b.status} onChange={e => setBeds(prev => prev.map(x => x.bed === b.bed ? { ...x, status: e.target.value } : x))}
                        className="field text-xs py-1 px-2" style={{ width: 'auto' }}>
                        <option>Admitted</option><option>Critical</option><option>Discharge ready</option>
                      </select>
                    )}
                    {b.status === 'Available' && <span className="text-xs text-muted-foreground">Empty</span>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {showModal && (
        <Modal title="New Admission" onClose={() => setShowModal(false)}>
          <form onSubmit={admit} className="space-y-4">
            <label className="field-label">Patient Name *<input required value={form.patient} onChange={e => upd('patient', e.target.value)} className="field" /></label>
            <label className="field-label">Assign Bed *
              <select required value={form.bed} onChange={e => upd('bed', e.target.value)} className="field">
                <option value="">Select available bed</option>
                {beds.filter(b => b.status === 'Available').map(b => <option key={b.bed} value={b.bed}>{b.bed} — {b.ward}</option>)}
              </select>
            </label>
            <label className="field-label">Lead Clinician *
              <select required value={form.doctor} onChange={e => upd('doctor', e.target.value)} className="field">
                <option value="">Select doctor</option>
                {DOCTORS.map(d => <option key={d}>{d}</option>)}
              </select>
            </label>
            <label className="field-label">Diagnosis / Reason *<input required value={form.diagnosis} onChange={e => upd('diagnosis', e.target.value)} className="field" placeholder="e.g. Post-op observation" /></label>
            <button className="w-full rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground">Admit Patient</button>
          </form>
        </Modal>
      )}
    </>
  );
}
