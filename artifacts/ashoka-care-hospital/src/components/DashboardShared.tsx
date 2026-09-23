import { Plus, Search, X } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

// ─── PageIntro ────────────────────────────────────────────────────────────────
export function PageIntro({ eyebrow, title, description, action, onAction }: {
  eyebrow?: string; title: string; description: string; action?: string; onAction?: () => void;
}) {
  return (
    <div className="mb-7 flex flex-col justify-between gap-4 md:flex-row md:items-end">
      <div>
        <p className="mb-2 text-[11px] font-bold uppercase tracking-[.18em] text-primary">{eyebrow ?? 'ASHOKA CARE'}</p>
        <h2 className="display-font text-3xl font-extrabold tracking-tight text-foreground md:text-4xl">{title}</h2>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">{description}</p>
      </div>
      {action && (
        <button onClick={onAction}
          className="inline-flex shrink-0 items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground shadow-sm transition hover:opacity-90">
          <Plus size={17} />{action}
        </button>
      )}
    </div>
  );
}

// ─── MetricCard ───────────────────────────────────────────────────────────────
export function MetricCard({ label, value, hint, icon: Icon, tone = 'teal' }: {
  label: string; value: string | number; hint: string; icon: LucideIcon; tone?: 'teal' | 'blue' | 'amber' | 'red';
}) {
  const toneClass = tone === 'amber' ? 'bg-accent text-accent-foreground'
    : tone === 'blue' ? 'bg-secondary text-secondary-foreground'
    : tone === 'red' ? 'bg-destructive/10 text-destructive'
    : 'bg-primary/10 text-primary';
  return (
    <div className="lift rounded-xl border border-border bg-card p-4 soft-shadow">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-semibold text-muted-foreground">{label}</p>
          <p className="display-font mt-2 text-3xl font-extrabold tracking-tight">{value}</p>
        </div>
        <span className={`grid h-9 w-9 place-items-center rounded-lg ${toneClass}`}>
          <Icon size={18} />
        </span>
      </div>
      <p className="mt-3 text-xs text-muted-foreground">{hint}</p>
    </div>
  );
}

// ─── StatusPill ───────────────────────────────────────────────────────────────
const GOOD = new Set(['Confirmed','Available','Paid','Completed','Active','Checked in','Ready','Fulfilled','Signed','Healthy','Resolved','Approved','Done','Verified']);
const WARN = new Set(['Outstanding','Critical','On leave','Cancelled','Expired','Low Stock','Overdue','Pending','Processing','Expiring soon','Pre-Auth Required','In Progress','Open','Upcoming']);

export function StatusPill({ status }: { status: string }) {
  const tone = GOOD.has(status) ? 'status-good' : WARN.has(status) ? 'status-warn' : 'status-neutral';
  return (
    <span className={`status-pill ${tone}`}>
      <span className="h-1.5 w-1.5 rounded-full bg-current" />{status}
    </span>
  );
}

// ─── EmptyState ───────────────────────────────────────────────────────────────
export function EmptyState({ icon: Icon, title, detail, action, onAction }: {
  icon: LucideIcon; title: string; detail: string; action?: string; onAction?: () => void;
}) {
  return (
    <div className="rounded-xl border border-dashed border-border bg-card px-6 py-14 text-center">
      <div className="mx-auto grid h-12 w-12 place-items-center rounded-2xl bg-muted text-primary">
        <Icon size={23} />
      </div>
      <h3 className="mt-4 font-bold">{title}</h3>
      <p className="mx-auto mt-1 max-w-sm text-sm text-muted-foreground">{detail}</p>
      {action && (
        <button onClick={onAction} className="mt-5 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground">
          {action}
        </button>
      )}
    </div>
  );
}

// ─── Modal ────────────────────────────────────────────────────────────────────
export function Modal({ title, children, onClose }: {
  title: string; children: React.ReactNode; onClose: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-slate-950/35 p-4 backdrop-blur-sm"
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="max-h-[90dvh] w-full max-w-xl overflow-y-auto rounded-2xl border border-border bg-card shadow-2xl">
        <div className="flex items-center justify-between border-b border-border px-5 py-4">
          <h3 className="display-font text-lg font-bold">{title}</h3>
          <button onClick={onClose} aria-label="Close dialog" className="rounded-lg p-1.5 text-muted-foreground hover:bg-muted">
            <X size={18} />
          </button>
        </div>
        <div className="p-5">{children}</div>
      </div>
    </div>
  );
}

// ─── SearchInput ──────────────────────────────────────────────────────────────
export function SearchInput({ value, onChange, placeholder }: {
  value: string; onChange: (v: string) => void; placeholder?: string;
}) {
  return (
    <div className="relative">
      <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
      <input value={value} onChange={e => onChange(e.target.value)}
        placeholder={placeholder ?? 'Search…'}
        className="field pl-9 w-full" />
    </div>
  );
}

// ─── ModuleTable ──────────────────────────────────────────────────────────────
// Generic table for clinical module pages (OPD, Lab, Radiology, etc.)
export function ModuleTable({ columns, rows, onRowAction }: {
  columns: string[];
  rows: string[][];
  onRowAction: (row: string[]) => void;
}) {
  return (
    <div className="overflow-x-auto">
      <table className="data-table">
        <thead>
          <tr>
            {columns.map(c => <th key={c}>{c}</th>)}
            <th className="text-right">Action</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row, ri) => (
            <tr key={ri}>
              {row.map((cell, ci) => (
                <td key={ci} className={ci === row.length - 1 ? '' : ci === 0 ? 'font-semibold' : ''}>
                  {ci === row.length - 1
                    ? <StatusPill status={cell} />
                    : cell}
                </td>
              ))}
              <td className="text-right">
                <button onClick={() => onRowAction(row)}
                  className="rounded-lg border border-border px-2.5 py-1.5 text-xs font-semibold hover:bg-muted">
                  Open
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
