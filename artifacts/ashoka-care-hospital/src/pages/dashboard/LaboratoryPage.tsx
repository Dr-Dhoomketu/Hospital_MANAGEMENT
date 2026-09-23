import { useState } from 'react';
import { FlaskConical } from 'lucide-react';
import { PageIntro, MetricCard, StatusPill, Modal } from '@/components/DashboardShared';
import { supabase } from '@/lib/supabase';

const STATUS_S: Record<string, { bg: string; color: string }> = {
  Ready:      { bg: 'rgba(22,163,74,0.1)',  color: '#16a34a' },
  Processing: { bg: 'rgba(217,119,6,0.1)',  color: '#d97706' },
  Pending:    { bg: 'rgba(47,93,170,0.1)',  color: '#2F5DAA' },
  Confirmed:  { bg: 'rgba(47,93,170,0.1)',  color: '#2F5DAA' },
  'In Progress': { bg: 'rgba(217,119,6,0.1)', color: '#d97706' },
};

const SEED = [
  { id: 'LAB-8821', patient: 'Aarav Sharma', test: 'Electrolytes', ordered: 'Dr. Arjun Mehta', orderedAt: '08:12', priority: 'Critical', status: 'Confirmed', result: '' },
  { id: 'LAB-8820', patient: 'Maya Kapoor', test: 'Lipid profile', ordered: 'Dr. Neha Iyer', orderedAt: '07:45', priority: 'Routine', status: 'Confirmed', result: '' },
  { id: 'LAB-8819', patient: 'Rohan Desai', test: 'CBC', ordered: 'Dr. Sameer Rao', orderedAt: '07:30', priority: 'Routine', status: 'In Progress', result: '' },
  { id: 'LAB-8818', patient: 'Anita Pillai', test: 'HbA1c', ordered: 'Dr. Neha Iyer', orderedAt: 'Yesterday', priority: 'Routine', status: 'Ready', result: 'HbA1c: 7.1%' },
];

const TESTS = ['CBC', 'Lipid Profile', 'HbA1c', 'Electrolytes', 'Thyroid Function', 'Liver Function', 'Kidney Function', 'Blood Glucose', 'Urine Analysis', 'COVID-19 RT-PCR'];

export default function LaboratoryPage() {
  const [orders, setOrders] = useState(SEED);
  const [filter, setFilter] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ patient: '', test: '', ordered: '', priority: 'Routine' });
  const [saving, setSaving] = useState(false);

  const filtered = orders.filter(r => r.patient.toLowerCase().includes(filter.toLowerCase()) || r.test.toLowerCase().includes(filter.toLowerCase()));
  const upd = (k: string, v: string) => setForm(p => ({ ...p, [k]: v }));

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    const newOrder = {
      id: `LAB-${Math.floor(8900 + Math.random() * 99)}`,
      patient: form.patient, test: form.test,
      ordered: form.ordered || 'Self-ordered',
      orderedAt: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
      priority: form.priority, status: 'Pending', result: '',
    };
    // Save to Supabase if table exists
    await supabase.from('lab_orders').insert({ ...newOrder, created_at: new Date().toISOString() }).then(() => {});
    setOrders(prev => [newOrder, ...prev]);
    // Create notification
    await supabase.from('notifications').insert({ title: 'New Lab Order', message: `${form.test} ordered for ${form.patient}`, type: 'clinical', read: false, created_at: new Date().toISOString() }).then(() => {});
    setShowModal(false);
    setForm({ patient: '', test: '', ordered: '', priority: 'Routine' });
    setSaving(false);
  };

  return (
    <>
      <PageIntro eyebrow="DIAGNOSTICS" title="Laboratory"
        description="Keep lab orders moving and give clinicians a confident result verification queue."
        action="New lab order" onAction={() => setShowModal(true)} />

      <div className="grid gap-4 md:grid-cols-3">
        <MetricCard label="Orders today" value={orders.length} hint="+9 vs yesterday" icon={FlaskConical} />
        <MetricCard label="Ready to verify" value={orders.filter(o => o.status === 'Ready').length} hint="3 critical results" icon={FlaskConical} tone="blue" />
        <MetricCard label="In progress" value={orders.filter(o => o.status === 'In Progress' || o.status === 'Processing').length} hint="79% collected" icon={FlaskConical} tone="amber" />
      </div>

      <div className="mt-6 rounded-xl border border-border bg-card p-4 soft-shadow">
        <div className="mb-4 flex flex-col justify-between gap-3 md:flex-row md:items-center">
          <div><h3 className="font-bold">Live worklist</h3><p className="mt-1 text-xs text-muted-foreground">Updated moments ago · {filtered.length} records</p></div>
          <input value={filter} onChange={e => setFilter(e.target.value)} className="field md:w-72" placeholder="Filter laboratory…" />
        </div>
        <div className="overflow-x-auto">
          <table className="data-table">
            <thead><tr><th>Order</th><th>Patient</th><th>Test panel</th><th>Ordered at</th><th>Priority</th><th>Status</th><th>Result</th><th className="text-right">Action</th></tr></thead>
            <tbody>
              {filtered.map((r, i) => {
                const ss = STATUS_S[r.status] ?? { bg: 'rgba(107,127,163,0.1)', color: '#6B7FA3' };
                return (
                  <tr key={r.id}>
                    <td className="font-semibold mono-font text-xs">{r.id}</td>
                    <td>{r.patient}</td>
                    <td>{r.test}</td>
                    <td className="text-xs text-muted-foreground">{r.orderedAt}</td>
                    <td><span className={`status-pill ${r.priority === 'Critical' ? 'status-warn' : 'status-neutral'}`}><span className="h-1.5 w-1.5 rounded-full bg-current"/>{r.priority}</span></td>
                    <td><span style={{ padding: '3px 10px', borderRadius: '999px', background: ss.bg, color: ss.color, fontSize: '0.67rem', fontWeight: 700 }}>{r.status}</span></td>
                    <td className="text-xs text-muted-foreground">{r.result || '—'}</td>
                    <td className="text-right">
                      <select value={r.status} onChange={e => setOrders(prev => prev.map(o => o.id === r.id ? { ...o, status: e.target.value } : o))}
                        className="field text-xs py-1 px-2" style={{ width: 'auto' }}>
                        <option>Pending</option><option>In Progress</option><option>Ready</option>
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
        <Modal title="New Lab Order" onClose={() => setShowModal(false)}>
          <form onSubmit={handleCreate} className="space-y-4">
            <label className="field-label">Patient Name *<input required value={form.patient} onChange={e => upd('patient', e.target.value)} className="field" placeholder="Patient full name" /></label>
            <label className="field-label">Test *
              <select required value={form.test} onChange={e => upd('test', e.target.value)} className="field">
                <option value="">Select test panel</option>
                {TESTS.map(t => <option key={t}>{t}</option>)}
              </select>
            </label>
            <label className="field-label">Ordered By<input value={form.ordered} onChange={e => upd('ordered', e.target.value)} className="field" placeholder="Dr. Name (optional)" /></label>
            <label className="field-label">Priority
              <select value={form.priority} onChange={e => upd('priority', e.target.value)} className="field">
                <option>Routine</option><option>Urgent</option><option>Critical</option>
              </select>
            </label>
            <button className="w-full rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground" disabled={saving}>{saving ? 'Saving…' : 'Create Lab Order'}</button>
          </form>
        </Modal>
      )}
    </>
  );
}
