import { useState } from 'react';
import { ClipboardList } from 'lucide-react';
import { PageIntro, MetricCard, StatusPill, Modal } from '@/components/DashboardShared';

const DOCTORS = ['Dr. Arjun Mehta', 'Dr. Neha Iyer', 'Dr. Sameer Rao', 'Dr. Sunita Verma', 'Dr. Rajan Pillai'];
const SERVICES = ['Cardiology', 'General Medicine', 'Orthopaedics', 'Gynaecology', 'Neurology', 'Dermatology', 'Paediatrics', 'ENT'];

const STATUS_S: Record<string, string> = {
  Waiting: 'status-neutral', 'In consultation': 'status-warn', Completed: 'status-good',
};

export default function OpdPage() {
  const [queue, setQueue] = useState([
    { id: 'C-014', patient: 'Aarav Sharma',  service: 'Cardiology',      doctor: 'Dr. Arjun Mehta', wait: '12 min', status: 'Waiting' },
    { id: 'E-008', patient: 'Maya Kapoor',   service: 'Endocrinology',   doctor: 'Dr. Neha Iyer',   wait: 'In room', status: 'In consultation' },
    { id: 'D-022', patient: 'Rohan Desai',   service: 'Orthopaedics',    doctor: 'Dr. Sameer Rao',  wait: '25 min', status: 'Waiting' },
    { id: 'G-006', patient: 'Anita Pillai',  service: 'General Medicine', doctor: 'Dr. Neha Iyer',  wait: '38 min', status: 'Waiting' },
  ]);
  const [filter, setFilter] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ patient: '', service: '', doctor: '' });
  const upd = (k: string, v: string) => setForm(p => ({ ...p, [k]: v }));

  const addToQueue = (e: React.FormEvent) => {
    e.preventDefault();
    const prefix = form.service.charAt(0).toUpperCase();
    const num = Math.floor(10 + Math.random() * 90);
    setQueue(prev => [...prev, {
      id: `${prefix}-${String(num).padStart(3, '0')}`,
      patient: form.patient, service: form.service,
      doctor: form.doctor || 'Unassigned',
      wait: 'Just added', status: 'Waiting',
    }]);
    setShowModal(false);
    setForm({ patient: '', service: '', doctor: '' });
  };

  const filtered = queue.filter(r => r.patient.toLowerCase().includes(filter.toLowerCase()) || r.service.toLowerCase().includes(filter.toLowerCase()));
  const waiting = queue.filter(q => q.status === 'Waiting').length;
  const inConsult = queue.filter(q => q.status === 'In consultation').length;
  const done = queue.filter(q => q.status === 'Completed').length;

  return (
    <>
      <PageIntro eyebrow="CARE OPERATIONS" title="OPD queue"
        description="Move outpatient visits from arrival to consultation with a single queue view."
        action="Add to queue" onAction={() => setShowModal(true)} />

      <div className="grid gap-4 md:grid-cols-3">
        <MetricCard label="Waiting now" value={waiting} hint="Average wait 18 min" icon={ClipboardList} />
        <MetricCard label="In consultation" value={inConsult} hint={`${inConsult} rooms active`} icon={ClipboardList} tone="amber" />
        <MetricCard label="Completed today" value={done} hint="Since 8 AM" icon={ClipboardList} tone="teal" />
      </div>

      <div className="mt-6 rounded-xl border border-border bg-card p-4 soft-shadow">
        <div className="mb-4 flex flex-col justify-between gap-3 md:flex-row md:items-center">
          <div><h3 className="font-bold">Live worklist</h3><p className="mt-1 text-xs text-muted-foreground">{filtered.length} in queue</p></div>
          <input value={filter} onChange={e => setFilter(e.target.value)} className="field md:w-72" placeholder="Filter OPD queue…" />
        </div>
        <div className="overflow-x-auto">
          <table className="data-table">
            <thead><tr><th>Queue</th><th>Patient</th><th>Service</th><th>Doctor</th><th>Wait</th><th>Status</th><th className="text-right">Action</th></tr></thead>
            <tbody>
              {filtered.map(r => (
                <tr key={r.id}>
                  <td className="font-bold mono-font">{r.id}</td>
                  <td className="font-semibold">{r.patient}</td>
                  <td>{r.service}</td>
                  <td className="text-muted-foreground text-sm">{r.doctor}</td>
                  <td className="text-xs text-muted-foreground">{r.wait}</td>
                  <td><span className={`status-pill ${STATUS_S[r.status] ?? 'status-neutral'}`}><span className="h-1.5 w-1.5 rounded-full bg-current"/>{r.status}</span></td>
                  <td className="text-right">
                    <select value={r.status}
                      onChange={e => setQueue(prev => prev.map(q => q.id === r.id ? { ...q, status: e.target.value } : q))}
                      className="field text-xs py-1 px-2" style={{ width: 'auto' }}>
                      <option>Waiting</option><option>In consultation</option><option>Completed</option>
                    </select>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && <tr><td colSpan={7} className="text-center py-8 text-sm text-muted-foreground">Queue is empty</td></tr>}
            </tbody>
          </table>
        </div>
      </div>

      {showModal && (
        <Modal title="Add to OPD Queue" onClose={() => setShowModal(false)}>
          <form onSubmit={addToQueue} className="space-y-4">
            <label className="field-label">Patient Name *<input required value={form.patient} onChange={e => upd('patient', e.target.value)} className="field" placeholder="Patient full name" /></label>
            <label className="field-label">Service / Department *
              <select required value={form.service} onChange={e => upd('service', e.target.value)} className="field">
                <option value="">Select service</option>
                {SERVICES.map(s => <option key={s}>{s}</option>)}
              </select>
            </label>
            <label className="field-label">Preferred Doctor
              <select value={form.doctor} onChange={e => upd('doctor', e.target.value)} className="field">
                <option value="">Assign automatically</option>
                {DOCTORS.map(d => <option key={d}>{d}</option>)}
              </select>
            </label>
            <button className="w-full rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground">Add to Queue</button>
          </form>
        </Modal>
      )}
    </>
  );
}
