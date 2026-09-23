import { useState } from 'react';
import { Search } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { PageIntro, MetricCard, StatusPill, EmptyState } from '@/components/DashboardShared';

export interface ModuleConfig {
  title: string;
  eyebrow: string;
  description: string;
  icon: LucideIcon;
  metrics: [string, string | number, string][];
  columns: string[];
  rows: string[][];
  action: string;
}

export default function ModulePage({ config, onAction }: { config: ModuleConfig; onAction?: (row: string[]) => void }) {
  const [filter, setFilter] = useState('');
  const { title, eyebrow, description, icon: Icon, metrics, columns, rows, action } = config;
  const filtered = rows.filter(row => row.join(' ').toLowerCase().includes(filter.toLowerCase()));

  return (
    <>
      <PageIntro
        eyebrow={eyebrow}
        title={title}
        description={description}
        action={action}
        onAction={() => onAction?.([])}
      />

      {/* Metric cards */}
      <div className="grid gap-4 md:grid-cols-3">
        {metrics.map(([label, value, hint], i) => (
          <MetricCard key={label} label={label} value={value} hint={hint} icon={Icon}
            tone={i === 1 ? 'blue' : i === 2 ? 'amber' : 'teal'} />
        ))}
      </div>

      {/* Live worklist */}
      <div className="mt-6 rounded-xl border border-border bg-card p-4 soft-shadow">
        <div className="mb-4 flex flex-col justify-between gap-3 md:flex-row md:items-center">
          <div>
            <h3 className="font-bold">Live worklist</h3>
            <p className="mt-1 text-xs text-muted-foreground">Updated moments ago · {filtered.length} records</p>
          </div>
          <div className="relative md:w-72">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input value={filter} onChange={e => setFilter(e.target.value)}
              className="field pl-9" placeholder={`Filter ${title.toLowerCase()}…`} />
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="data-table">
            <thead>
              <tr>
                {columns.map(c => <th key={c}>{c}</th>)}
                <th className="text-right">Action</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((row, ri) => (
                <tr key={ri}>
                  {row.map((cell, ci) => (
                    <td key={ci} className={ci === 0 ? 'font-semibold' : ''}>
                      {ci === row.length - 1
                        ? <StatusPill status={cell} />
                        : cell}
                    </td>
                  ))}
                  <td className="text-right">
                    <button onClick={() => onAction?.(row)}
                      className="rounded-lg border border-border px-2.5 py-1.5 text-xs font-semibold hover:bg-muted">
                      Open
                    </button>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={columns.length + 1}>
                    <EmptyState icon={Icon} title="Nothing matches this filter" detail="Try a broader search to see more records." />
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
