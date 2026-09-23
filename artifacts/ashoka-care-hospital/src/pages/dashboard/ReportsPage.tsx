import { useState } from 'react';
import { FileBarChart, Download } from 'lucide-react';
import { useGetDashboardSummary } from '@workspace/api-client-react';
import { getGetDashboardSummaryQueryKey } from '@workspace/api-client-react';
import { PageIntro, MetricCard } from '@/components/DashboardShared';

const MONTHLY = [42,58,49,73,64,82,68,91,76,88,74,96];
const MIX = [['OPD consultations','42%','bg-primary'],['Diagnostics','24%','bg-secondary-foreground'],['Pharmacy','18%','bg-accent-foreground'],['Inpatient','16%','bg-primary/40']];

export default function ReportsPage() {
  const [period, setPeriod] = useState('This month');
  const q = useGetDashboardSummary({ query: { queryKey: getGetDashboardSummaryQueryKey() } });
  const s = q.data;

  return (
    <>
      <PageIntro eyebrow="INSIGHTS" title="Reports & analytics"
        description="Operational reports designed for decisions, not dashboard decoration."
        action="Export report" />

      <div className="mb-5 flex justify-end">
        <select value={period} onChange={e => setPeriod(e.target.value)} className="field w-40">
          <option>This month</option><option>Last month</option><option>Last 90 days</option>
        </select>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4 mb-6">
        <MetricCard label="Total patients" value={s?.totalPatients?.toLocaleString('en-IN') ?? '1,251'} hint="+3 this week" icon={FileBarChart} />
        <MetricCard label="Today's appointments" value={s?.todaysAppointments ?? 3} hint="Scheduled today" icon={FileBarChart} tone="blue" />
        <MetricCard label="Occupancy" value={`${s?.occupancy ?? 78}%`} hint="Current" icon={FileBarChart} tone="amber" />
        <MetricCard label="Revenue (Sep)" value="₹2.86L" hint="This month" icon={FileBarChart} tone="teal" />
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.2fr_.8fr]">
        <section className="rounded-xl border border-border bg-card p-5 soft-shadow">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold">Patient throughput</h3>
              <p className="mt-1 text-xs text-muted-foreground">Visits completed by day · September 2026</p>
            </div>
            <Download size={17} className="text-muted-foreground" />
          </div>
          <div className="mt-7 flex h-52 items-end gap-3 border-b border-l border-border px-3 pb-0">
            {MONTHLY.map((h, i) => (
              <div key={i} className="group flex flex-1 flex-col justify-end gap-2">
                <div className="w-full rounded-t-md bg-primary/75 transition-all group-hover:bg-primary" style={{ height: `${h}%` }} />
                <span className="text-center text-[10px] text-muted-foreground">{i + 1}</span>
              </div>
            ))}
          </div>
        </section>

        <section className="rounded-xl border border-border bg-card p-5 soft-shadow">
          <h3 className="font-bold">Service mix</h3>
          <p className="mt-1 text-xs text-muted-foreground">Share of visits this month</p>
          <div className="mt-6 space-y-4">
            {MIX.map(([label, value, color]) => (
              <div key={label}>
                <div className="flex justify-between text-xs">
                  <span className="font-semibold">{label}</span>
                  <span className="text-muted-foreground">{value}</span>
                </div>
                <div className="mt-2 h-2 rounded-full bg-muted">
                  <div className={`h-full rounded-full ${color}`} style={{ width: value }} />
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-3">
        {[['Average OPD wait', '18 min', '↓ 4 min this month'],['No-show rate', '6.8%', '↓ 1.2% this month'],['Patient satisfaction', '4.7 / 5', 'From 284 responses']].map(([label, val, hint]) => (
          <div key={label} className="rounded-xl border border-border bg-card p-4">
            <p className="text-xs text-muted-foreground">{label}</p>
            <p className="display-font mt-2 text-2xl font-bold">{val}</p>
            <p className="mt-1 text-xs text-primary">{hint}</p>
          </div>
        ))}
      </div>
    </>
  );
}
