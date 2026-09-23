import { useState } from 'react';
import { Activity } from 'lucide-react';
import { PageIntro, MetricCard, Modal } from '@/components/DashboardShared';

const SURGEONS = ['Dr. Arjun Mehta','Dr. Sameer Rao','Dr. Sunita Verma','Dr. Rajan Pillai'];
const THEATRES = ['Theatre 1','Theatre 2','Theatre 3'];
const PROCEDURES = ['Knee Replacement','Appendectomy','C-Section','Cholecystectomy','Hernia Repair','Cataract Surgery','Hip Replacement','TURP','Tonsillectomy','Coronary Bypass'];

const STATUS_S: Record<string,string> = { 'In Progress':'status-warn', Scheduled:'status-neutral', Completed:'status-good', Available:'status-good' };

export default function OtPage() {
  const [cases, setCases] = useState([
    { id:'S1', time:'10:00 AM', patient:'Rohan Desai',  procedure:'Knee Replacement',   theatre:'Theatre 1', lead:'Dr. Sameer Rao',    status:'In Progress' },
    { id:'S2', time:'01:30 PM', patient:'Meera Shah',   procedure:'Appendectomy',        theatre:'Theatre 2', lead:'Dr. Arjun Mehta',  status:'Scheduled'   },
    { id:'S3', time:'03:00 PM', patient:'Adil Khan',    procedure:'Hernia Repair',       theatre:'Theatre 1', lead:'Dr. Sameer Rao',   status:'Scheduled'   },
    { id:'S4', time:'05:30 PM', patient:'Anita Pillai', procedure:'C-Section',          theatre:'Theatre 3', lead:'Dr. Sunita Verma', status:'Scheduled'   },
  ]);
  const [rooms, setRooms] = useState([
    { room:'Theatre 1', status:'Occupied',  case:'Knee Replacement' },
    { room:'Theatre 2', status:'Ready',     case:'—' },
    { room:'Theatre 3', status:'Cleaning',  case:'—' },
  ]);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ patient:'', procedure:'', theatre:'Theatre 1', lead:'', time:'', notes:'' });
  const upd = (k: string, v: string) => setForm(p => ({ ...p, [k]: v }));

  const schedule = (e: React.FormEvent) => {
    e.preventDefault();
    setCases(prev => [...prev, { id:`S${prev.length+5}`, time:form.time||'TBD', patient:form.patient, procedure:form.procedure, theatre:form.theatre, lead:form.lead||'TBD', status:'Scheduled' }]);
    setShowModal(false); setForm({ patient:'', procedure:'', theatre:'Theatre 1', lead:'', time:'', notes:'' });
  };

  const ROOM_S: Record<string,string> = { Occupied:'status-warn', Ready:'status-good', Cleaning:'status-neutral', Completed:'status-good' };

  return (
    <>
      <PageIntro eyebrow="SURGICAL SERVICES" title="Operating theatre"
        description="A shared surgical board for room readiness, checklists, and case handovers."
        action="Schedule case" onAction={() => setShowModal(true)} />

      <div className="grid gap-4 md:grid-cols-3 mb-5">
        <MetricCard label="Cases today" value={cases.length} hint="2 emergency slots" icon={Activity} />
        <MetricCard label="In progress" value={cases.filter(c=>c.status==='In Progress').length} hint="Currently on table" icon={Activity} tone="amber" />
        <MetricCard label="Scheduled" value={cases.filter(c=>c.status==='Scheduled').length} hint="Upcoming today" icon={Activity} tone="blue" />
      </div>

      {/* OT room status */}
      <div className="grid grid-cols-3 gap-3 mb-5">
        {rooms.map(r => (
          <div key={r.room} className="rounded-xl border border-border bg-card p-4">
            <div className="flex justify-between items-center mb-2">
              <span className="font-bold">{r.room}</span>
              <span className={`status-pill ${ROOM_S[r.status]??'status-neutral'}`}><span className="h-1.5 w-1.5 rounded-full bg-current"/>{r.status}</span>
            </div>
            <p className="text-xs text-muted-foreground">{r.case !== '—' ? r.case : 'No active case'}</p>
            <div className="mt-3 flex gap-2">
              {r.status !== 'Occupied' && (
                <button onClick={() => setRooms(prev => prev.map(x => x.room===r.room ? { ...x, status: r.status === 'Ready' ? 'Cleaning' : 'Ready' } : x))}
                  className="text-xs font-semibold text-primary hover:underline">
                  {r.status === 'Ready' ? 'Mark Cleaning' : 'Mark Ready'}
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Surgery schedule */}
      <div className="rounded-xl border border-border bg-card soft-shadow overflow-hidden">
        <div className="p-4 border-b border-border"><h3 className="font-bold">Today's Surgery Schedule</h3></div>
        <div className="overflow-x-auto">
          <table className="data-table">
            <thead><tr><th>Time</th><th>Patient</th><th>Procedure</th><th>Theatre</th><th>Lead Surgeon</th><th>Status</th><th className="text-right">Action</th></tr></thead>
            <tbody>
              {cases.map(c => (
                <tr key={c.id}>
                  <td className="mono-font font-black">{c.time}</td>
                  <td className="font-semibold">{c.patient}</td>
                  <td>{c.procedure}</td>
                  <td><span className="rounded px-2 py-0.5 text-xs font-bold bg-primary/10 text-primary">{c.theatre}</span></td>
                  <td className="text-xs text-muted-foreground">{c.lead}</td>
                  <td><span className={`status-pill ${STATUS_S[c.status]??'status-neutral'}`}><span className="h-1.5 w-1.5 rounded-full bg-current"/>{c.status}</span></td>
                  <td className="text-right">
                    <select value={c.status} onChange={e => setCases(prev => prev.map(x => x.id===c.id ? { ...x, status:e.target.value } : x))}
                      className="field text-xs py-1 px-2" style={{ width:'auto' }}>
                      <option>Scheduled</option><option>In Progress</option><option>Completed</option>
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {showModal && (
        <Modal title="Schedule Surgery Case" onClose={() => setShowModal(false)}>
          <form onSubmit={schedule} className="space-y-4">
            <label className="field-label">Patient Name *<input required value={form.patient} onChange={e => upd('patient', e.target.value)} className="field" /></label>
            <label className="field-label">Procedure *
              <select required value={form.procedure} onChange={e => upd('procedure', e.target.value)} className="field">
                <option value="">Select procedure</option>
                {PROCEDURES.map(p => <option key={p}>{p}</option>)}
              </select>
            </label>
            <div className="grid grid-cols-2 gap-4">
              <label className="field-label">Theatre *
                <select value={form.theatre} onChange={e => upd('theatre', e.target.value)} className="field">
                  {THEATRES.map(t => <option key={t}>{t}</option>)}
                </select>
              </label>
              <label className="field-label">Time<input value={form.time} onChange={e => upd('time', e.target.value)} className="field" placeholder="e.g. 02:00 PM" /></label>
            </div>
            <label className="field-label">Lead Surgeon *
              <select required value={form.lead} onChange={e => upd('lead', e.target.value)} className="field">
                <option value="">Select surgeon</option>
                {SURGEONS.map(s => <option key={s}>{s}</option>)}
              </select>
            </label>
            <label className="field-label">Pre-op Notes<textarea rows={2} value={form.notes} onChange={e => upd('notes', e.target.value)} className="field resize-none" /></label>
            <button className="w-full rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground">Schedule Case</button>
          </form>
        </Modal>
      )}
    </>
  );
}
