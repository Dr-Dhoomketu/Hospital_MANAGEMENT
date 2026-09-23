import { useState } from 'react';
import { CalendarDays, QrCode, Check, X, ChevronDown, FileText } from 'lucide-react';
import { useListAppointments, useUpdateAppointmentStatus, getListAppointmentsQueryKey } from '@workspace/api-client-react';
import { useQueryClient } from '@tanstack/react-query';
import { PageIntro, StatusPill, EmptyState, Modal } from '@/components/DashboardShared';

function statusLabel(s: string) {
  if (s === 'checked_in') return 'Checked in';
  if (s === 'completed') return 'Completed';
  if (s === 'cancelled') return 'Cancelled';
  if (s === 'in_consultation') return 'In consultation';
  return 'Confirmed';
}

// Patient visit history (simulated — in real system from DB)
const PATIENT_HISTORY: Record<string, { date: string; service: string; doctor: string; notes: string; diagnosis: string }[]> = {
  'Aarav Sharma': [
    { date: '21 Aug 2026', service: 'Cardiology consultation', doctor: 'Dr. Arjun Mehta', diagnosis: 'Hypertension Stage 1', notes: 'BP 140/90. Prescribed Amlodipine 5mg. Follow up in 1 month.' },
    { date: '15 Jul 2026', service: 'General checkup', doctor: 'Dr. Neha Iyer', diagnosis: 'Routine checkup', notes: 'All vitals normal. Lipid panel ordered.' },
  ],
  'Maya Kapoor': [
    { date: '18 Sep 2026', service: 'General physician', doctor: 'Dr. Neha Iyer', diagnosis: 'Viral fever', notes: 'Temperature 101.2F. Paracetamol prescribed. Rest advised.' },
  ],
  'Rohan Desai': [
    { date: '20 Aug 2026', service: 'Orthopaedics', doctor: 'Dr. Sameer Rao', diagnosis: 'Knee pain — meniscal tear (Grade II)', notes: 'MRI confirmed. Surgery recommended. Pre-op workup ordered.' },
  ],
};

export default function AppointmentsPage() {
  const [dateFilter, setDateFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [selected, setSelected] = useState<null | { id: string; patientName: string; service: string; date: string; time: string; code: string; visitType: string; notes: string | null }>(null);
  const [showHistory, setShowHistory] = useState(false);
  const [consultNotes, setConsultNotes] = useState('');
  const [savedNotes, setSavedNotes] = useState<Record<string, string>>({});
  const qc = useQueryClient();

  const query = useListAppointments(
    { date: dateFilter || undefined, status: statusFilter || undefined },
    { query: { queryKey: getListAppointmentsQueryKey({ date: dateFilter || undefined, status: statusFilter || undefined }) } }
  );
  const updateStatus = useUpdateAppointmentStatus();
  const apts = Array.isArray(query.data) ? query.data : [];

  const markCheckin = (id: string) => {
    updateStatus.mutate({ id, data: { status: 'checked_in' } }, {
      onSuccess: () => qc.invalidateQueries({ queryKey: ['listAppointments'] }),
    });
  };

  const saveConsultNotes = () => {
    if (!selected || !consultNotes.trim()) return;
    setSavedNotes(prev => ({ ...prev, [selected.id]: consultNotes }));
    window.alert(`Consultation notes saved for ${selected.patientName}`);
  };

  return (
    <>
      <PageIntro eyebrow="SERVICE DESK" title="Appointments"
        description="Book services, confirm arrivals, and give every patient a simple check-in pass."
        action="New appointment" onAction={() => {}} />

      <div className="mb-4 flex flex-col gap-3 rounded-xl border border-border bg-card p-4 md:flex-row">
        <div className="flex flex-1 items-center gap-2 text-sm font-semibold">
          <CalendarDays size={17} className="text-primary" />
          Booking desk
          <span className="text-xs font-normal text-muted-foreground">· {apts.length} visible</span>
        </div>
        <input type="date" value={dateFilter} onChange={e => setDateFilter(e.target.value)} className="field md:w-44" />
        <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className="field md:w-44">
          <option value="">All statuses</option>
          <option value="scheduled">Confirmed</option>
          <option value="checked_in">Checked in</option>
          <option value="in_consultation">In consultation</option>
          <option value="completed">Completed</option>
          <option value="cancelled">Cancelled</option>
        </select>
        {(dateFilter || statusFilter) && (
          <button onClick={() => { setDateFilter(''); setStatusFilter(''); }} className="inline-flex items-center gap-1 rounded-lg border border-border px-3 text-sm font-medium hover:bg-muted">
            <X size={14} /> Clear
          </button>
        )}
      </div>

      <div className="rounded-xl border border-border bg-card p-4 soft-shadow">
        <div className="overflow-x-auto">
          <table className="data-table">
            <thead>
              <tr>
                <th>Patient</th><th>Service / Doctor</th><th>Date & time</th><th>Type</th><th>Status</th><th className="text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {apts.map(apt => (
                <tr key={apt.id}>
                  <td>
                    <span className="font-semibold">{apt.patientName}</span>
                    <span className="block text-[11px] text-muted-foreground">{apt.checkInCode}</span>
                  </td>
                  <td>
                    <span className="block text-sm">{apt.serviceName}</span>
                    <span className="block text-[11px] text-muted-foreground">{apt.doctorName}</span>
                  </td>
                  <td>
                    <span className="block text-xs font-medium">{new Date(apt.scheduledAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}</span>
                    <span className="mono-font block text-[11px] text-muted-foreground">{new Date(apt.scheduledAt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}</span>
                  </td>
                  <td>
                    <span className={`status-pill ${apt.visitType === 'follow_up' || apt.visitType === 'revisit' ? 'status-warn' : 'status-neutral'}`}>
                      <span className="h-1.5 w-1.5 rounded-full bg-current"/>
                      {(apt.visitType ?? 'new').replace(/_/g, ' ')}
                    </span>
                  </td>
                  <td><StatusPill status={statusLabel(apt.status)} /></td>
                  <td className="text-right">
                    <div className="flex justify-end gap-1">
                      <button
                        onClick={() => { setSelected({ id: apt.id, patientName: apt.patientName, service: apt.serviceName, date: new Date(apt.scheduledAt).toLocaleDateString('en-IN'), time: new Date(apt.scheduledAt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }), code: apt.checkInCode, visitType: apt.visitType ?? 'new', notes: apt.notes ?? null }); setShowHistory(apt.visitType === 'follow_up' || apt.visitType === 'revisit'); setConsultNotes(savedNotes[apt.id] ?? ''); }}
                        className="rounded-lg p-2 text-primary hover:bg-secondary" title="View details">
                        <QrCode size={16} />
                      </button>
                      {apt.status === 'scheduled' && (
                        <button onClick={() => markCheckin(apt.id)} className="rounded-lg p-2 text-muted-foreground hover:bg-muted" title="Check in">
                          <Check size={16} />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
              {apts.length === 0 && (
                <tr><td colSpan={6}><EmptyState icon={CalendarDays} title="No appointments in this view" detail="Adjust filters or create a new booking." /></td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Appointment detail + patient history modal */}
      {selected && (
        <Modal title={`${selected.patientName} — ${selected.service}`} onClose={() => setSelected(null)}>
          <div className="space-y-4">
            {/* QR code */}
            <div className="text-center">
              <div className="mx-auto flex h-36 w-36 items-center justify-center rounded-xl border-8 border-slate-900 bg-white p-2">
                <div className="qr-grid grid h-full w-full grid-cols-7 gap-1 p-1">
                  {Array.from({ length: 49 }).map((_, i) => (
                    <span key={i} className={(i * 17 + i * i) % 5 < 2 ? 'rounded-[1px] bg-slate-900' : 'bg-white'} />
                  ))}
                </div>
              </div>
              <p className="mono-font mt-2 text-xs font-bold tracking-widest text-primary">{selected.code}</p>
              <p className="text-xs text-muted-foreground">{selected.date} · {selected.time}</p>
            </div>

            {/* Follow-up / revisit — show patient history */}
            {(selected.visitType === 'follow_up' || selected.visitType === 'revisit') && (
              <div className="rounded-xl border border-amber-200 bg-amber-50 p-4">
                <button onClick={() => setShowHistory(!showHistory)} className="flex w-full items-center justify-between text-sm font-bold text-amber-800">
                  <span className="flex items-center gap-2"><FileText size={16} /> Previous Visit History</span>
                  <ChevronDown size={16} className={showHistory ? 'rotate-180 transition' : 'transition'} />
                </button>
                {showHistory && (
                  <div className="mt-3 space-y-3">
                    {(PATIENT_HISTORY[selected.patientName] ?? []).length === 0 ? (
                      <p className="text-xs text-amber-700">No previous visits recorded.</p>
                    ) : (PATIENT_HISTORY[selected.patientName] ?? []).map((h, i) => (
                      <div key={i} className="rounded-lg bg-white border border-amber-100 p-3">
                        <div className="flex justify-between text-xs font-semibold text-amber-800 mb-1">
                          <span>{h.service}</span><span>{h.date}</span>
                        </div>
                        <p className="text-xs font-bold text-gray-700">Dx: {h.diagnosis}</p>
                        <p className="text-xs text-gray-500 mt-1">{h.notes}</p>
                        <p className="text-xs text-amber-600 mt-1 font-medium">{h.doctor}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Consultation notes */}
            <div>
              <label className="field-label">Consultation Notes
                <textarea value={consultNotes} onChange={e => setConsultNotes(e.target.value)} rows={4}
                  className="field mt-1 resize-none" placeholder="Record diagnosis, treatment plan, prescriptions…" />
              </label>
              <button onClick={saveConsultNotes} className="mt-2 w-full rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground">
                Save Consultation Notes
              </button>
            </div>

            {selected.notes && (
              <div className="rounded-lg bg-muted/50 p-3 text-xs text-muted-foreground">
                <span className="font-semibold">Patient note: </span>{selected.notes}
              </div>
            )}
          </div>
        </Modal>
      )}
    </>
  );
}
