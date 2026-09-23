import { useState } from 'react';
import { FileText, Plus } from 'lucide-react';
import { PageIntro, MetricCard, Modal } from '@/components/DashboardShared';

const DOCTORS = ['Dr. Arjun Mehta','Dr. Neha Iyer','Dr. Sameer Rao','Dr. Sunita Verma','Dr. Rajan Pillai'];
const DEPTS = ['Cardiology','General Medicine','Orthopaedics','Gynaecology','Neurology','Dermatology','Laboratory'];
const REC_TYPES = ['Consultation note','Operative note','Lab result','Care plan','Discharge summary','Prescription','Referral letter'];

export default function EmrPage() {
  const [records, setRecords] = useState([
    { id:'R1', patient:'Aarav Sharma',  type:'Consultation note',   dept:'Cardiology',      updated:'Today, 16:32', owner:'Dr. Arjun Mehta', status:'Signed',      notes:'BP 140/90. Amlodipine 5mg prescribed.' },
    { id:'R2', patient:'Rohan Desai',   type:'Operative note',      dept:'Orthopaedics',    updated:'Today, 08:58', owner:'Dr. Sameer Rao',  status:'Signed',      notes:'Knee replacement completed. No complications.' },
    { id:'R3', patient:'Maya Kapoor',   type:'Lab result',           dept:'Laboratory',      updated:'Today, 08:42', owner:'Lab Tech',        status:'Needs review',notes:'HbA1c: 7.1% — within target.' },
    { id:'R4', patient:'Anita Pillai',  type:'Care plan',            dept:'Gynaecology',     updated:'22 Sep, 11:05',owner:'Dr. Sunita Verma',status:'Signed',      notes:'Post-partum care plan. Iron supplements.' },
  ]);
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState<null | typeof records[0]>(null);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ patient:'', type:'Consultation note', dept:'Cardiology', owner:'', notes:'' });
  const upd = (k: string, v: string) => setForm(p => ({ ...p, [k]: v }));

  const createRecord = (e: React.FormEvent) => {
    e.preventDefault();
    setRecords(prev => [{ id:`R${prev.length+5}`, patient:form.patient, type:form.type, dept:form.dept, updated:'Just now', owner:form.owner||'Self', status:'Draft', notes:form.notes }, ...prev]);
    setShowModal(false); setForm({ patient:'', type:'Consultation note', dept:'Cardiology', owner:'', notes:'' });
  };

  const filtered = records.filter(r => r.patient.toLowerCase().includes(search.toLowerCase()) || r.type.toLowerCase().includes(search.toLowerCase()));
  const S: Record<string,string> = { Signed:'status-good', 'Needs review':'status-warn', Draft:'status-neutral' };

  return (
    <>
      <PageIntro eyebrow="CLINICAL RECORDS" title="Medical records"
        description="Review a patient's care timeline, documents, orders, and signed clinical notes."
        action="Create record" onAction={() => setShowModal(true)} />

      <div className="grid gap-4 md:grid-cols-3 mb-5">
        <MetricCard label="Records today" value={records.length} hint="Updated since yesterday" icon={FileText} />
        <MetricCard label="Needs review" value={records.filter(r=>r.status==='Needs review').length} hint="Awaiting clinician sign-off" icon={FileText} tone="amber" />
        <MetricCard label="Signed" value={records.filter(r=>r.status==='Signed').length} hint="Complete records" icon={FileText} tone="teal" />
      </div>

      <div className="grid gap-5 lg:grid-cols-[300px_1fr]">
        {/* Record list */}
        <div className="rounded-xl border border-border bg-card overflow-hidden">
          <div className="p-3 border-b border-border">
            <input value={search} onChange={e => setSearch(e.target.value)} className="field text-sm" placeholder="Search records…" />
          </div>
          <div className="max-h-[500px] overflow-y-auto">
            {filtered.map(r => (
              <button key={r.id} onClick={() => setSelected(r)}
                className={`w-full text-left p-3 border-b border-border/50 transition hover:bg-muted/50 ${selected?.id === r.id ? 'bg-primary/8 border-l-2 border-l-primary' : ''}`}>
                <p className="font-semibold text-sm">{r.patient}</p>
                <p className="text-xs text-muted-foreground">{r.type}</p>
                <p className="text-[11px] text-muted-foreground mt-0.5">{r.updated}</p>
              </button>
            ))}
            {filtered.length === 0 && <p className="p-6 text-center text-sm text-muted-foreground">No records found</p>}
          </div>
        </div>

        {/* Record detail */}
        <div className="rounded-xl border border-border bg-card p-6">
          {!selected ? (
            <div className="h-64 flex flex-col items-center justify-center text-muted-foreground gap-3">
              <FileText size={40} className="opacity-30" />
              <p className="text-sm font-medium">Select a record to view</p>
            </div>
          ) : (
            <div>
              <div className="flex items-start justify-between mb-5">
                <div>
                  <p className="text-xs text-muted-foreground uppercase tracking-widest font-bold mb-1">{selected.type}</p>
                  <h2 className="display-font text-2xl font-extrabold">{selected.patient}</h2>
                  <p className="text-sm text-muted-foreground mt-1">{selected.dept} · {selected.owner} · {selected.updated}</p>
                </div>
                <span className={`status-pill ${S[selected.status]??'status-neutral'} text-sm`}><span className="h-2 w-2 rounded-full bg-current"/>{selected.status}</span>
              </div>
              <div className="rounded-xl bg-muted/40 p-5 mb-5">
                <p className="text-sm leading-relaxed">{selected.notes}</p>
              </div>
              <div className="flex gap-3">
                {selected.status !== 'Signed' && (
                  <button onClick={() => { setRecords(prev => prev.map(r => r.id===selected.id ? { ...r, status:'Signed' } : r)); setSelected(s => s ? { ...s, status:'Signed' } : null); }}
                    className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground">Sign Record</button>
                )}
                <button onClick={() => setShowModal(true)} className="rounded-lg border border-border px-4 py-2 text-sm font-semibold hover:bg-muted flex items-center gap-1.5">
                  <Plus size={15}/>Add Note
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {showModal && (
        <Modal title="Create Medical Record" onClose={() => setShowModal(false)}>
          <form onSubmit={createRecord} className="space-y-4">
            <label className="field-label">Patient Name *<input required value={form.patient} onChange={e => upd('patient', e.target.value)} className="field" /></label>
            <div className="grid grid-cols-2 gap-4">
              <label className="field-label">Record Type *
                <select required value={form.type} onChange={e => upd('type', e.target.value)} className="field">
                  {REC_TYPES.map(t => <option key={t}>{t}</option>)}
                </select>
              </label>
              <label className="field-label">Department
                <select value={form.dept} onChange={e => upd('dept', e.target.value)} className="field">
                  {DEPTS.map(d => <option key={d}>{d}</option>)}
                </select>
              </label>
            </div>
            <label className="field-label">Owner / Doctor
              <select value={form.owner} onChange={e => upd('owner', e.target.value)} className="field">
                <option value="">Select doctor</option>
                {DOCTORS.map(d => <option key={d}>{d}</option>)}
              </select>
            </label>
            <label className="field-label">Clinical Notes *<textarea required rows={4} value={form.notes} onChange={e => upd('notes', e.target.value)} className="field resize-none" placeholder="Diagnosis, treatment, observations…" /></label>
            <button className="w-full rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground">Create Record</button>
          </form>
        </Modal>
      )}
    </>
  );
}
