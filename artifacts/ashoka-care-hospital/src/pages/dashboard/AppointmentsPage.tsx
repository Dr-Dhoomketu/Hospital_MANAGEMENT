import { useState } from 'react';
import { CalendarDays, QrCode, Check, X, Send } from 'lucide-react';
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

export default function AppointmentsPage() {
  const [dateFilter, setDateFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [selected, setSelected] = useState<null | { id: string; patientName: string; service: string; date: string; time: string; code: string }>(null);
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
        <input type="date" value={dateFilter} onChange={e => setDateFilter(e.target.value)}
          className="field md:w-44" />
        <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className="field md:w-44">
          <option value="">All statuses</option>
          <option value="scheduled">Confirmed</option>
          <option value="checked_in">Checked in</option>
          <option value="in_consultation">In consultation</option>
          <option value="completed">Completed</option>
          <option value="cancelled">Cancelled</option>
        </select>
        {(dateFilter || statusFilter) && (
          <button onClick={() => { setDateFilter(''); setStatusFilter(''); }}
            className="inline-flex items-center gap-1 rounded-lg border border-border px-3 text-sm font-medium hover:bg-muted">
            <X size={14} /> Clear
          </button>
        )}
      </div>

      <div className="rounded-xl border border-border bg-card p-4 soft-shadow">
        <div className="overflow-x-auto">
          <table className="data-table">
            <thead>
              <tr>
                <th>Patient</th><th>Service / Doctor</th><th>Date & time</th><th>Queue</th><th>Status</th><th className="text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {apts.map(apt => (
                <tr key={apt.id}>
                  <td>
                    <span className="font-semibold">{apt.patientName}</span>
                    <span className="block text-[11px] text-muted-foreground">{apt.appointmentNumber}</span>
                  </td>
                  <td>
                    <span className="block text-sm">{apt.serviceName}</span>
                    <span className="block text-[11px] text-muted-foreground">{apt.doctorName}</span>
                  </td>
                  <td>
                    <span className="block text-xs font-medium">{new Date(apt.scheduledAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}</span>
                    <span className="mono-font block text-[11px] text-muted-foreground">{new Date(apt.scheduledAt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}</span>
                  </td>
                  <td className="mono-font text-xs text-muted-foreground">{apt.checkInCode}</td>
                  <td><StatusPill status={statusLabel(apt.status)} /></td>
                  <td className="text-right">
                    <div className="flex justify-end gap-1">
                      <button onClick={() => setSelected({ id: apt.id, patientName: apt.patientName, service: apt.serviceName, date: new Date(apt.scheduledAt).toLocaleDateString('en-IN'), time: new Date(apt.scheduledAt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }), code: apt.checkInCode })}
                        className="rounded-lg p-2 text-primary hover:bg-secondary" aria-label="View QR">
                        <QrCode size={16} />
                      </button>
                      {apt.status === 'scheduled' && (
                        <button onClick={() => markCheckin(apt.id)}
                          className="rounded-lg p-2 text-muted-foreground hover:bg-muted" aria-label="Check in">
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

      {selected && (
        <Modal title="QR check-in pass" onClose={() => setSelected(null)}>
          <div className="text-center">
            <div className="mx-auto flex h-44 w-44 items-center justify-center rounded-xl border-8 border-slate-900 bg-white p-3">
              <div className="qr-grid grid h-full w-full grid-cols-7 gap-1 p-2">
                {Array.from({ length: 49 }).map((_, i) => (
                  <span key={i} className={(i * 17 + i * i) % 5 < 2 ? 'rounded-[1px] bg-slate-900' : 'bg-white'} />
                ))}
              </div>
            </div>
            <div className="mt-4">
              <p className="display-font text-xl font-bold">{selected.patientName}</p>
              <p className="mt-1 text-sm text-muted-foreground">{selected.service} · {selected.date} · {selected.time}</p>
              <p className="mono-font mt-3 text-xs font-semibold tracking-widest text-primary">{selected.code}</p>
            </div>
            <div className="mt-5 grid grid-cols-2 gap-2">
              <a href={`http://localhost:5000/api/scan/${selected.code}`} target="_blank" rel="noreferrer"
                className="rounded-lg bg-primary px-3 py-2 text-xs font-semibold text-primary-foreground">
                Verify pass
              </a>
              <button onClick={() => setSelected(null)}
                className="rounded-lg border border-border px-3 py-2 text-xs font-semibold hover:bg-muted">
                <Send size={14} className="mr-1 inline" /> Done
              </button>
            </div>
          </div>
        </Modal>
      )}
    </>
  );
}
