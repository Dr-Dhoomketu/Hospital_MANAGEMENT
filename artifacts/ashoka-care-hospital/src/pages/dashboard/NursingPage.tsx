import { useState } from 'react';
import { HeartPulse } from 'lucide-react';
import { PageIntro, MetricCard, Modal } from '@/components/DashboardShared';

const NURSES = ['Nurse Priya Sharma','Nurse Anjali Singh','Nurse Meena Rao','Nurse Anil Joseph'];
const WARDS = ['Ward 3B','Ward 2A','Ward 4C','ICU','Gynaecology Ward'];
const TASK_TYPES = ['Vitals round','Medication round','Care plan review','Handover note','Dressing change','IV line check','Patient transfer'];
const PRIORITY_S: Record<string,string> = { High:'status-warn', Routine:'status-neutral', Critical:'status-warn' };
const STATUS_S: Record<string,string> = { 'Due now':'status-warn', Scheduled:'status-neutral', Open:'status-neutral', Done:'status-good' };

export default function NursingPage() {
  const [tasks, setTasks] = useState([
    { id:'T1', task:'Vitals round',       patient:'Aarav Sharma',  ward:'Ward 3B',    due:'09:30 AM', nurse:'Nurse Priya Sharma', priority:'High',    status:'Due now'  },
    { id:'T2', task:'Medication round',   patient:'All patients',  ward:'Ward 2A',    due:'10:00 AM', nurse:'Nurse Anjali Singh', priority:'Routine', status:'Scheduled'},
    { id:'T3', task:'Care plan review',   patient:'Vikram Singh',  ward:'ICU',        due:'10:15 AM', nurse:'Nurse Priya Sharma', priority:'High',    status:'Open'     },
    { id:'T4', task:'Handover note',      patient:'All patients',  ward:'Ward 4C',    due:'11:00 AM', nurse:'Nurse Anil Joseph',  priority:'Routine', status:'Scheduled'},
  ]);
  const [vitals] = useState([
    { patient:'Aarav Sharma',  ward:'Ward 3B', bed:'3B-12', bp:'130/85', pulse:78, temp:'98.6°F', spo2:'97%', time:'08:30', nurse:'Nurse Priya', flag: false },
    { patient:'Maya Kapoor',   ward:'Ward 2A', bed:'2A-04', bp:'118/76', pulse:82, temp:'101.2°F',spo2:'98%', time:'09:00', nurse:'Nurse Anjali',flag: true  },
    { patient:'Vikram Singh',  ward:'ICU',     bed:'ICU-03',bp:'145/95', pulse:95, temp:'100.4°F',spo2:'96%', time:'09:30', nurse:'Nurse Meena', flag: true  },
  ]);
  const [tab, setTab] = useState<'tasks'|'vitals'>('tasks');
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ task:'', patient:'', ward:'', due:'', nurse:'', priority:'Routine' });
  const upd = (k: string, v: string) => setForm(p => ({ ...p, [k]: v }));

  const addTask = (e: React.FormEvent) => {
    e.preventDefault();
    setTasks(prev => [...prev, { id:`T${prev.length+5}`, task:form.task, patient:form.patient, ward:form.ward, due:form.due, nurse:form.nurse, priority:form.priority, status:'Scheduled' }]);
    setShowModal(false); setForm({ task:'', patient:'', ward:'', due:'', nurse:'', priority:'Routine' });
  };

  const dueNow = tasks.filter(t => t.status === 'Due now' || t.status === 'Open').length;
  const done = tasks.filter(t => t.status === 'Done').length;

  return (
    <>
      <PageIntro eyebrow="CARE TEAM" title="Nursing operations"
        description="Make rounds, vitals, and handover tasks visible to every nurse on shift."
        action="Assign task" onAction={() => setShowModal(true)} />

      <div className="grid gap-4 md:grid-cols-3 mb-5">
        <MetricCard label="Vitals due" value={vitals.length} hint="Next 30 minutes" icon={HeartPulse} />
        <MetricCard label="Open tasks" value={dueNow} hint="Requires attention" icon={HeartPulse} tone="amber" />
        <MetricCard label="Completed" value={done} hint="Today so far" icon={HeartPulse} tone="teal" />
      </div>

      <div className="flex gap-2 mb-4">
        {(['tasks','vitals'] as const).map(t => (
          <button key={t} onClick={() => setTab(t)} className={`rounded-lg px-4 py-2 text-sm font-semibold transition ${tab===t ? 'bg-primary text-primary-foreground' : 'border border-border hover:bg-muted text-muted-foreground'}`}>
            {t === 'tasks' ? 'Task Board' : 'Vitals Log'}
          </button>
        ))}
      </div>

      {tab === 'tasks' && (
        <div className="rounded-xl border border-border bg-card soft-shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="data-table">
              <thead><tr><th>Task</th><th>Patient / Ward</th><th>Due</th><th>Nurse</th><th>Priority</th><th>Status</th><th className="text-right">Action</th></tr></thead>
              <tbody>
                {tasks.map(t => (
                  <tr key={t.id}>
                    <td className="font-semibold">{t.task}</td>
                    <td><span className="block text-sm">{t.patient}</span><span className="text-xs text-muted-foreground">{t.ward}</span></td>
                    <td className="mono-font text-xs font-bold">{t.due}</td>
                    <td className="text-xs text-muted-foreground">{t.nurse}</td>
                    <td><span className={`status-pill ${PRIORITY_S[t.priority]??'status-neutral'}`}><span className="h-1.5 w-1.5 rounded-full bg-current"/>{t.priority}</span></td>
                    <td><span className={`status-pill ${STATUS_S[t.status]??'status-neutral'}`}><span className="h-1.5 w-1.5 rounded-full bg-current"/>{t.status}</span></td>
                    <td className="text-right">
                      {t.status !== 'Done' && (
                        <button onClick={() => setTasks(prev => prev.map(x => x.id===t.id ? { ...x, status:'Done' } : x))}
                          className="rounded-lg border border-border px-2.5 py-1.5 text-xs font-semibold hover:bg-muted">Mark Done</button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {tab === 'vitals' && (
        <div className="space-y-3">
          {vitals.map(v => (
            <div key={v.patient} className={`rounded-xl border p-4 ${v.flag ? 'border-amber-200 bg-amber-50/50' : 'border-border bg-card'}`}>
              <div className="flex justify-between items-start mb-3">
                <div><p className="font-bold">{v.patient}</p><p className="text-xs text-muted-foreground">{v.ward} · {v.bed} · {v.nurse}</p></div>
                <span className="text-xs text-muted-foreground">Recorded {v.time}</span>
              </div>
              <div className="grid grid-cols-4 gap-3">
                {[['BP', v.bp, parseInt(v.bp) > 140], ['Pulse', `${v.pulse} bpm`, v.pulse > 90], ['Temp', v.temp, parseFloat(v.temp) > 100], ['SpO₂', v.spo2, parseInt(v.spo2) < 97]].map(([label, value, alert]) => (
                  <div key={String(label)} className={`rounded-lg p-3 text-center ${alert ? 'bg-amber-100' : 'bg-muted/40'}`}>
                    <p className={`text-base font-black ${alert ? 'text-amber-700' : 'text-foreground'}`}>{String(value)}</p>
                    <p className="text-[10px] text-muted-foreground uppercase tracking-wide mt-1">{String(label)}</p>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {showModal && (
        <Modal title="Assign Nursing Task" onClose={() => setShowModal(false)}>
          <form onSubmit={addTask} className="space-y-4">
            <label className="field-label">Task Type *
              <select required value={form.task} onChange={e => upd('task', e.target.value)} className="field">
                <option value="">Select task</option>
                {TASK_TYPES.map(t => <option key={t}>{t}</option>)}
              </select>
            </label>
            <label className="field-label">Patient / Location *<input required value={form.patient} onChange={e => upd('patient', e.target.value)} className="field" placeholder="Patient name or 'All patients'" /></label>
            <div className="grid grid-cols-2 gap-4">
              <label className="field-label">Ward *
                <select required value={form.ward} onChange={e => upd('ward', e.target.value)} className="field">
                  <option value="">Select ward</option>
                  {WARDS.map(w => <option key={w}>{w}</option>)}
                </select>
              </label>
              <label className="field-label">Due Time<input value={form.due} onChange={e => upd('due', e.target.value)} className="field" placeholder="e.g. 10:30 AM" /></label>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <label className="field-label">Assign Nurse
                <select value={form.nurse} onChange={e => upd('nurse', e.target.value)} className="field">
                  <option value="">Unassigned</option>
                  {NURSES.map(n => <option key={n}>{n}</option>)}
                </select>
              </label>
              <label className="field-label">Priority
                <select value={form.priority} onChange={e => upd('priority', e.target.value)} className="field">
                  <option>Routine</option><option>High</option><option>Critical</option>
                </select>
              </label>
            </div>
            <button className="w-full rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground">Assign Task</button>
          </form>
        </Modal>
      )}
    </>
  );
}
