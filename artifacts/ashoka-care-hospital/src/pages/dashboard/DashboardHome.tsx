import { useState } from 'react';
import { Link } from 'wouter';
import { Users, CalendarDays, ClipboardList, BedDouble, RefreshCw, ArrowRight, DoorOpen, FlaskConical, UserPlus } from 'lucide-react';
import { useGetDashboardSummary, useListAppointments } from '@workspace/api-client-react';
import { getGetDashboardSummaryQueryKey, getListAppointmentsQueryKey } from '@workspace/api-client-react';
import { PageIntro, MetricCard, StatusPill, EmptyState } from '@/components/DashboardShared';

export default function DashboardHome() {
  const summaryQ = useGetDashboardSummary({ query: { queryKey: getGetDashboardSummaryQueryKey() } });
  const appointmentsQ = useListAppointments({}, { query: { queryKey: getListAppointmentsQueryKey({}) } });
  const s = summaryQ.data;
  const appointments = Array.isArray(appointmentsQ.data) ? appointmentsQ.data.slice(0, 4) : [];

  const today = new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });

  return (
    <>
      <PageIntro
        eyebrow={today.toUpperCase()}
        title="Hospital pulse"
        description="A clear view of today's care flow, bottlenecks, and patient-facing work."
        action="Book appointment"
        onAction={() => {}}
      />

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard label="Total patients" value={s?.totalPatients?.toLocaleString('en-IN') ?? '1,251'} hint="+3 new today" icon={Users} />
        <MetricCard label="Appointments" value={s?.todaysAppointments ?? 3} hint="Scheduled today" icon={CalendarDays} tone="blue" />
        <MetricCard label="OPD queue" value="27" hint="Average wait 18 min" icon={ClipboardList} tone="amber" />
        <MetricCard label="Bed occupancy" value={`${s?.occupancy ?? 78}%`} hint={`${s?.pendingAdmissions ?? 12} pending admissions`} icon={BedDouble} />
      </div>

      {/* Care flow + alerts */}
      <div className="mt-6 grid gap-6 xl:grid-cols-[1.35fr_.85fr]">
        <section className="rounded-xl border border-border bg-card p-5 soft-shadow">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold">Today's care flow</h3>
              <p className="mt-1 text-xs text-muted-foreground">Live queue movement across the hospital</p>
            </div>
            <button className="rounded-lg border border-border p-2 text-muted-foreground hover:bg-muted" aria-label="Refresh">
              <RefreshCw size={16} />
            </button>
          </div>
          <div className="mt-6 grid grid-cols-3 gap-3 sm:grid-cols-6">
            {[['Registration','12','bg-secondary'],['OPD','27','bg-primary/10'],['Lab','18','bg-accent'],['Radiology','9','bg-secondary'],['Pharmacy','31','bg-primary/10'],['Discharge','6','bg-accent']].map(([label, value, tone]) => (
              <div key={label} className="rounded-lg border border-border p-3">
                <div className={`mb-4 h-1.5 rounded-full ${tone}`} />
                <p className="text-[11px] text-muted-foreground">{label}</p>
                <p className="mt-1 display-font text-xl font-bold">{value}</p>
                <p className="mt-1 text-[10px] text-muted-foreground">in queue</p>
              </div>
            ))}
          </div>
          <div className="mt-6 rounded-lg bg-muted/60 p-4">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold">Throughput target</span>
              <span className="mono-font text-muted-foreground">68% · 127 / 184</span>
            </div>
            <div className="mt-3 h-2 overflow-hidden rounded-full bg-border">
              <div className="h-full w-[68%] rounded-full bg-primary" />
            </div>
          </div>
        </section>

        <section className="rounded-xl border border-border bg-card p-5 soft-shadow">
          <div className="flex items-start justify-between">
            <div>
              <h3 className="font-bold">Emergency cases</h3>
              <p className="mt-1 text-xs text-muted-foreground">Requires immediate response</p>
            </div>
            <Link href="/dashboard/emergency" className="text-xs font-semibold text-primary hover:underline">View all</Link>
          </div>
          <div className="mt-4 space-y-2">
            <div className="flex items-center gap-2 rounded-lg bg-destructive/6 border border-destructive/15 px-3 py-3">
              <span className="h-2 w-2 rounded-full bg-destructive animate-pulse shrink-0" />
              <div>
                <p className="text-sm font-semibold">{s?.emergencyCases ?? 4} active emergency cases</p>
                <p className="text-xs text-muted-foreground mt-0.5">Response team on standby</p>
              </div>
            </div>
            {[
              { title: 'Critical lab result', desc: 'Potassium level — clinician review', time: '8 min ago' },
              { title: 'Blood unit expiry', desc: '3 O− units expire within 72h', time: '24 min ago' },
              { title: 'OT checklist incomplete', desc: 'Theatre 2 · Pre-op item pending', time: '1 hr ago' },
            ].map(item => (
              <div key={item.title} className="flex gap-3 rounded-lg px-2 py-3 transition hover:bg-muted">
                <div className="mt-1 h-2 w-2 shrink-0 rounded-full bg-accent-foreground" />
                <div className="min-w-0">
                  <p className="text-sm font-semibold">{item.title}</p>
                  <p className="mt-0.5 truncate text-xs text-muted-foreground">{item.desc}</p>
                  <p className="mt-1 text-[10px] text-muted-foreground">{item.time}</p>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>

      {/* Appointments + Shortcuts */}
      <div className="mt-6 grid gap-6 lg:grid-cols-[1.2fr_.8fr]">
        <section className="rounded-xl border border-border bg-card p-5 soft-shadow">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold">Upcoming appointments</h3>
              <p className="mt-1 text-xs text-muted-foreground">Next four scheduled visits</p>
            </div>
            <Link href="/dashboard/appointments" className="text-xs font-semibold text-primary hover:underline">Open desk</Link>
          </div>
          <div className="mt-4 overflow-x-auto">
            <table className="data-table">
              <thead>
                <tr><th>Patient</th><th>Service</th><th>Time</th><th>Status</th></tr>
              </thead>
              <tbody>
                {appointments.length === 0
                  ? <tr><td colSpan={4} className="text-center py-8 text-muted-foreground text-sm">No appointments today</td></tr>
                  : appointments.map(apt => (
                    <tr key={apt.id}>
                      <td>
                        <span className="font-semibold">{apt.patientName}</span>
                        <span className="block text-[11px] text-muted-foreground">{apt.appointmentNumber}</span>
                      </td>
                      <td>{apt.serviceName}</td>
                      <td className="mono-font text-xs">
                        {new Date(apt.scheduledAt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                      </td>
                      <td><StatusPill status={apt.status === 'checked_in' ? 'Checked in' : apt.status === 'completed' ? 'Completed' : apt.status === 'cancelled' ? 'Cancelled' : 'Confirmed'} /></td>
                    </tr>
                  ))
                }
              </tbody>
            </table>
          </div>
        </section>

        <section className="rounded-xl border border-border bg-card p-5 soft-shadow">
          <h3 className="font-bold">Quick actions</h3>
          <div className="mt-4 grid grid-cols-2 gap-3">
            {([
              ['Register patient', UserPlus, '/dashboard/patients'],
              ['OPD queue', ClipboardList, '/dashboard/opd'],
              ['New lab order', FlaskConical, '/dashboard/laboratory'],
              ['Patient portal', DoorOpen, '/portal/dashboard'],
            ] as [string, typeof UserPlus, string][]).map(([label, Icon, href]) => (
              <Link key={label} href={href}
                className="group rounded-lg border border-border p-3 transition hover:border-primary/40 hover:bg-secondary/50">
                <span className="grid h-8 w-8 place-items-center rounded-md bg-muted text-primary"><Icon size={16} /></span>
                <span className="mt-3 block text-xs font-semibold group-hover:text-primary">{label}</span>
                <ArrowRight size={14} className="mt-2 text-muted-foreground transition group-hover:translate-x-1" />
              </Link>
            ))}
          </div>
        </section>
      </div>
    </>
  );
}
