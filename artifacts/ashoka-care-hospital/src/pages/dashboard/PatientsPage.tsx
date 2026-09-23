import { useState } from 'react';
import { Link, useParams } from 'wouter';
import { Users, Search, ListFilter, ArrowLeft, CalendarDays, Plus, Printer, MoreHorizontal } from 'lucide-react';
import { useListPatients, useCreatePatient, useGetPatient, useGetPatientTimeline, getListPatientsQueryKey, getGetPatientQueryKey, getGetPatientTimelineQueryKey } from '@workspace/api-client-react';
import { useQueryClient } from '@tanstack/react-query';
import { PageIntro, StatusPill, EmptyState, Modal } from '@/components/DashboardShared';

function initials(name: string) { return name.split(' ').map(p => p[0]).slice(0, 2).join('').toUpperCase(); }

// ─── Patient record detail view ───────────────────────────────────────────────
function PatientRecord() {
  const params = useParams<{ id: string }>();
  const patientQ = useGetPatient(params.id ?? '', { query: { queryKey: getGetPatientQueryKey(params.id ?? ''), enabled: !!params.id } });
  const timelineQ = useGetPatientTimeline(params.id ?? '', { query: { queryKey: getGetPatientTimelineQueryKey(params.id ?? ''), enabled: !!params.id } });
  const patient = patientQ.data;
  const timeline = timelineQ.data ?? [];

  if (patientQ.isLoading) return <div className="p-8 text-center text-muted-foreground text-sm">Loading…</div>;
  if (!patient) return <EmptyState icon={Users} title="Patient not found" detail="This record may have been removed." />;

  return (
    <>
      <Link href="/dashboard/patients" className="mb-6 inline-flex items-center gap-2 text-xs font-semibold text-muted-foreground hover:text-primary">
        <ArrowLeft size={15} /> Back to patient registry
      </Link>
      <div className="mb-7 flex flex-col justify-between gap-4 rounded-2xl border border-border bg-card p-5 soft-shadow md:flex-row md:items-center">
        <div className="flex items-center gap-4">
          <div className="grid h-16 w-16 place-items-center rounded-2xl bg-primary/10 text-xl font-bold text-primary">{initials(patient.name)}</div>
          <div>
            <p className="text-xs text-muted-foreground">{patient.patientNumber}</p>
            <h2 className="display-font text-2xl font-extrabold">{patient.name}</h2>
            <p className="mt-1 text-sm text-muted-foreground">{patient.gender} · Born {patient.dateOfBirth} · {patient.bloodGroup}</p>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <StatusPill status={patient.status === 'active' ? 'Active' : 'Inactive'} />
          <button className="rounded-lg bg-primary px-3 py-2 text-xs font-semibold text-primary-foreground">
            <CalendarDays size={14} className="mr-1.5 inline" />Book appointment
          </button>
          <button className="rounded-lg border border-border px-3 py-2 text-xs font-semibold hover:bg-muted">
            <Printer size={14} className="mr-1.5 inline" />Print summary
          </button>
        </div>
      </div>
      <div className="grid gap-6 lg:grid-cols-[.8fr_1.2fr]">
        <div className="space-y-6">
          <section className="rounded-xl border border-border bg-card p-5">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="font-bold">Patient details</h3>
              <button className="text-xs font-semibold text-primary">Edit</button>
            </div>
            <dl className="grid grid-cols-2 gap-x-4 gap-y-4 text-sm">
              {[['Phone', patient.phone], ['Email', patient.email], ['Blood group', patient.bloodGroup ?? '—'], ['DOB', patient.dateOfBirth]].map(([k, v]) => (
                <div key={k}><dt className="text-xs text-muted-foreground">{k}</dt><dd className="mt-1 font-medium truncate">{v}</dd></div>
              ))}
            </dl>
          </section>
        </div>
        <section className="rounded-xl border border-border bg-card p-5">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold">Medical timeline</h3>
              <p className="mt-1 text-xs text-muted-foreground">Care history at ASHOKA</p>
            </div>
            <button className="rounded-lg border border-border p-2 text-muted-foreground hover:bg-muted"><Plus size={16} /></button>
          </div>
          {timeline.length === 0
            ? <p className="mt-4 text-sm text-muted-foreground">No timeline events recorded.</p>
            : <div className="relative mt-6 space-y-6 before:absolute before:bottom-2 before:left-[9px] before:top-2 before:w-px before:bg-border">
                {timeline.map((ev, i) => (
                  <div key={ev.id} className="relative flex gap-4">
                    <div className={`z-10 mt-1.5 h-[19px] w-[19px] rounded-full border-4 border-card ${i === 0 ? 'bg-primary' : 'bg-muted-foreground'}`} />
                    <div>
                      <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">{new Date(ev.occurredAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
                      <h4 className="mt-1 text-sm font-bold">{ev.title}</h4>
                      <p className="mt-1 text-sm leading-6 text-muted-foreground">{ev.description}</p>
                      {ev.doctorName && <p className="text-xs text-primary mt-1 font-medium">{ev.doctorName}</p>}
                    </div>
                  </div>
                ))}
              </div>
          }
        </section>
      </div>
    </>
  );
}

// ─── Patients list ────────────────────────────────────────────────────────────
export default function PatientsPage() {
  const [query, setQuery] = useState('');
  const [status, setStatus] = useState('');
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ name: '', phone: '', email: '', dateOfBirth: '', gender: 'Male', bloodGroup: 'O+' });
  const qc = useQueryClient();
  const upd = (k: string, v: string) => setForm(p => ({ ...p, [k]: v }));

  const patientsQ = useListPatients({ search: query || undefined, status: status || undefined }, {
    query: { queryKey: getListPatientsQueryKey({ search: query || undefined, status: status || undefined }) },
  });
  const createMut = useCreatePatient();
  const patients = patientsQ.data ?? [];

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    createMut.mutate({ data: form }, {
      onSuccess: () => {
        qc.invalidateQueries({ queryKey: ['listPatients'] });
        setOpen(false);
        setForm({ name: '', phone: '', email: '', dateOfBirth: '', gender: 'Male', bloodGroup: 'O+' });
      },
    });
  };

  const FIELD = 'field';
  const LABEL = 'field-label';

  return (
    <>
      <PageIntro eyebrow="REGISTRY" title="Patient management"
        description="Search the full registry, open a patient record, or register someone in under a minute."
        action="Add patient" onAction={() => setOpen(true)} />

      <div className="rounded-xl border border-border bg-card p-4 soft-shadow">
        <div className="flex flex-col gap-3 md:flex-row">
          <div className="relative flex-1">
            <Search size={17} className="absolute left-3 top-3 text-muted-foreground" />
            <input value={query} onChange={e => setQuery(e.target.value)} placeholder="Search by name, patient # or phone"
              className={`${FIELD} pl-10`} />
          </div>
          <select value={status} onChange={e => setStatus(e.target.value)} className={`${FIELD} md:w-48`}>
            <option value="">All statuses</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
          <button onClick={() => { setQuery(''); setStatus(''); }}
            className="inline-flex items-center justify-center gap-2 rounded-lg border border-border px-4 text-sm font-medium hover:bg-muted">
            <ListFilter size={15} />Clear
          </button>
        </div>
        <div className="mt-5 overflow-x-auto">
          <table className="data-table">
            <thead>
              <tr>
                <th>Patient</th><th>Patient #</th><th>Contact</th><th>Blood</th><th>Last visit</th><th>Status</th><th className="text-right">Action</th>
              </tr>
            </thead>
            <tbody>
              {patients.map(p => (
                <tr key={p.id}>
                  <td>
                    <div className="flex items-center gap-3">
                      <div className="avatar">{initials(p.name)}</div>
                      <div>
                        <Link href={`/dashboard/patients/${p.id}`} className="font-semibold hover:text-primary">{p.name}</Link>
                        <span className="block text-[11px] text-muted-foreground">{p.gender}</span>
                      </div>
                    </div>
                  </td>
                  <td className="mono-font text-xs text-muted-foreground">{p.patientNumber}</td>
                  <td>
                    <span className="block text-xs">{p.phone}</span>
                    <span className="block text-[11px] text-muted-foreground">{p.email}</span>
                  </td>
                  <td><span className="mono-font text-xs font-bold text-destructive">{p.bloodGroup ?? '—'}</span></td>
                  <td className="text-xs text-muted-foreground">{new Date(p.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}</td>
                  <td><StatusPill status={p.status === 'active' ? 'Active' : 'Inactive'} /></td>
                  <td className="text-right">
                    <button className="rounded-lg p-2 text-muted-foreground hover:bg-muted hover:text-foreground"><MoreHorizontal size={17} /></button>
                  </td>
                </tr>
              ))}
              {patients.length === 0 && (
                <tr><td colSpan={7}><EmptyState icon={Users} title="No patients found" detail="Try another search or add a new patient." /></td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {open && (
        <Modal title="Register a new patient" onClose={() => setOpen(false)}>
          <form onSubmit={submit} className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <label className={`${LABEL} sm:col-span-2`}>Full name<input required value={form.name} onChange={e => upd('name', e.target.value)} className={FIELD} placeholder="Patient full name" /></label>
              <label className={LABEL}>Phone<input required value={form.phone} onChange={e => upd('phone', e.target.value)} className={FIELD} placeholder="+91 98765 43210" /></label>
              <label className={LABEL}>Email<input type="email" value={form.email} onChange={e => upd('email', e.target.value)} className={FIELD} placeholder="patient@email.com" /></label>
              <label className={LABEL}>Date of birth<input required type="date" value={form.dateOfBirth} onChange={e => upd('dateOfBirth', e.target.value)} className={FIELD} /></label>
              <label className={LABEL}>Gender<select value={form.gender} onChange={e => upd('gender', e.target.value)} className={FIELD}><option>Male</option><option>Female</option><option>Other</option></select></label>
              <label className={`${LABEL} sm:col-span-2`}>Blood group<select value={form.bloodGroup} onChange={e => upd('bloodGroup', e.target.value)} className={FIELD}>{['A+','A-','B+','B-','O+','O-','AB+','AB-'].map(g => <option key={g}>{g}</option>)}</select></label>
            </div>
            <button className="mt-2 w-full rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground" disabled={createMut.isPending}>
              {createMut.isPending ? 'Saving…' : 'Save patient record'}
            </button>
          </form>
        </Modal>
      )}
    </>
  );
}
