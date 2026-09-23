import { useState } from 'react';
import { Microscope } from 'lucide-react';
import { PageIntro, MetricCard, StatusPill, Modal } from '@/components/DashboardShared';
import { supabase } from '@/lib/supabase';

const STATUS_S: Record<string, { bg: string; color: string }> = {
  Confirmed:    { bg: 'rgba(47,93,170,0.1)',  color: '#2F5DAA' },
  'In Progress':{ bg: 'rgba(217,119,6,0.1)',  color: '#d97706' },
  Ready:        { bg: 'rgba(22,163,74,0.1)',   color: '#16a34a' },
  Pending:      { bg: 'rgba(107,127,163,0.1)', color: '#6B7FA3' },
};

const SEED = [
  { id: 'RAD-318', patient: 'Rohan Desai',  scan: 'MRI Knee',        modality: 'MRI',      slot: '10:30 AM', radiologist: 'Dr. Gupta',  status: 'Confirmed',    report: '' },
  { id: 'RAD-317', patient: 'Vikram Singh',  scan: 'CT Chest',        modality: 'CT Scan',  slot: '09:45 AM', radiologist: 'Dr. Gupta',  status: 'In Progress',  report: '' },
  { id: 'RAD-316', patient: 'Anita Pillai',  scan: 'Ultrasound Abdomen', modality: 'USG',   slot: '09:20 AM', radiologist: 'Dr. Mehta',  status: 'Ready',        report: 'Normal study.' },
  { id: 'RAD-315', patient: 'Maya Kapoor',   scan: 'X-ray Chest',     modality: 'X-Ray',    slot: 'Tomorrow', radiologist: 'Dr. Gupta',  status: 'Confirmed',    report: '' },
];

const MODALITIES = ['X-Ray', 'CT Scan', 'MRI', 'Ultrasound (USG)', 'PET Scan', 'Mammography', 'Fluoroscopy'];

export default function RadiologyPage() {
  const [studies, setStudies] = useState(SEED);
  const [filter, setFilter] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ patient: '', scan: '', modality: '', slot: '', radiologist: '' });
  const [saving, setSaving] = useState(false);

  const filtered = studies.filter(r => r.patient.toLowerCase().includes(filter.toLowerCase()) || r.scan.toLowerCase().includes(filter.toLowerCase()));
  const upd = (k: string, v: string) => setForm(p => ({ ...p, [k]: v }));

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    const entry = {
      id: `RAD-${Math.floor(320 + Math.random() * 99)}`,
      patient: form.patient, scan: form.scan, modality: form.modality,
      slot: form.slot || 'TBD', radiologist: form.radiologist || 'TBD',
      status: 'Pending', report: '',
    };
    await supabase.from('radiology_orders').insert({ ...entry, created_at: new Date().toISOString() }).then(() => {});
    setStudies(prev => [entry, ...prev]);
    await supabase.from('notifications').insert({ title: 'New Radiology Study', message: `${form.modality} - ${form.scan} booked for ${form.patient}`, type: 'clinical', read: false, created_at: new Date().toISOString() }).then(() => {});
    setShowModal(false);
    setForm({ patient: '', scan: '', modality: '', slot: '', radiologist: '' });
    setSaving(false);
  };

  return (
    <>
      <PageIntro eyebrow="DIAGNOSTICS" title="Radiology"
        description="Coordinate imaging slots, acquisition, and reporting from one calm queue."
        action="Book study" onAction={() => setShowModal(true)} />

      <div className="grid gap-4 md:grid-cols-3">
        <MetricCard label="Studies today" value={studies.length} hint="6 awaiting report" icon={Microscope} />
        <MetricCard label="Reports ready" value={studies.filter(s => s.status === 'Ready').length} hint="75% complete" icon={Microscope} tone="blue" />
        <MetricCard label="In progress" value={studies.filter(s => s.status === 'In Progress').length} hint="Scanner uptime 98.4%" icon={Microscope} tone="amber" />
      </div>

      <div className="mt-6 rounded-xl border border-border bg-card p-4 soft-shadow">
        <div className="mb-4 flex flex-col justify-between gap-3 md:flex-row md:items-center">
          <div><h3 className="font-bold">Live worklist</h3><p className="mt-1 text-xs text-muted-foreground">{filtered.length} records</p></div>
          <input value={filter} onChange={e => setFilter(e.target.value)} className="field md:w-72" placeholder="Filter radiology…" />
        </div>
        <div className="overflow-x-auto">
          <table className="data-table">
            <thead><tr><th>Study</th><th>Patient</th><th>Modality</th><th>Slot</th><th>Radiologist</th><th>Status</th><th>Report</th><th className="text-right">Action</th></tr></thead>
            <tbody>
              {filtered.map(r => {
                const ss = STATUS_S[r.status] ?? { bg: 'rgba(107,127,163,0.1)', color: '#6B7FA3' };
                return (
                  <tr key={r.id}>
                    <td className="font-semibold mono-font text-xs">{r.id}</td>
                    <td>{r.patient}</td>
                    <td><span className="rounded px-2 py-0.5 text-xs font-bold" style={{ background: 'rgba(47,93,170,0.08)', color: '#2F5DAA' }}>{r.modality}</span></td>
                    <td className="text-xs">{r.slot}</td>
                    <td className="text-xs text-muted-foreground">{r.radiologist}</td>
                    <td><span style={{ padding: '3px 10px', borderRadius: '999px', background: ss.bg, color: ss.color, fontSize: '0.67rem', fontWeight: 700 }}>{r.status}</span></td>
                    <td className="text-xs text-muted-foreground">{r.report || '—'}</td>
                    <td className="text-right">
                      <select value={r.status} onChange={e => setStudies(prev => prev.map(s => s.id === r.id ? { ...s, status: e.target.value } : s))}
                        className="field text-xs py-1 px-2" style={{ width: 'auto' }}>
                        <option>Pending</option><option>Confirmed</option><option>In Progress</option><option>Ready</option>
                      </select>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {showModal && (
        <Modal title="Book Radiology Study" onClose={() => setShowModal(false)}>
          <form onSubmit={handleCreate} className="space-y-4">
            <label className="field-label">Patient Name *<input required value={form.patient} onChange={e => upd('patient', e.target.value)} className="field" placeholder="Patient full name" /></label>
            <label className="field-label">Study Description *<input required value={form.scan} onChange={e => upd('scan', e.target.value)} className="field" placeholder="e.g. MRI Right Knee" /></label>
            <label className="field-label">Modality *
              <select required value={form.modality} onChange={e => upd('modality', e.target.value)} className="field">
                <option value="">Select modality</option>
                {MODALITIES.map(m => <option key={m}>{m}</option>)}
              </select>
            </label>
            <div className="grid grid-cols-2 gap-4">
              <label className="field-label">Slot / Time<input value={form.slot} onChange={e => upd('slot', e.target.value)} className="field" placeholder="e.g. 10:30 AM" /></label>
              <label className="field-label">Radiologist<input value={form.radiologist} onChange={e => upd('radiologist', e.target.value)} className="field" placeholder="Dr. Name" /></label>
            </div>
            <button className="w-full rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground" disabled={saving}>{saving ? 'Booking…' : 'Book Study'}</button>
          </form>
        </Modal>
      )}
    </>
  );
}
