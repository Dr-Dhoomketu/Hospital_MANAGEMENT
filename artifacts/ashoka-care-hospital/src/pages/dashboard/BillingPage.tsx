import { useState } from 'react';
import { WalletCards, CircleDollarSign, FileCheck2, Download } from 'lucide-react';
import { PageIntro, MetricCard, StatusPill } from '@/components/DashboardShared';

const SEED = [
  { id: 'INV-24061', patientName: 'Aarav Sharma', service: 'Cardiology consultation + Lab', amount: 87250, paid: 60000, status: 'Partially paid', dueDate: '25 Sep 2026' },
  { id: 'INV-24062', patientName: 'Maya Kapoor', service: 'OPD consultation', amount: 2400, paid: 2400, status: 'Paid', dueDate: '23 Sep 2026' },
  { id: 'INV-24063', patientName: 'Rohan Desai', service: 'Ortho consultation + MRI', amount: 4800, paid: 0, status: 'Outstanding', dueDate: '23 Sep 2026' },
  { id: 'INV-24064', patientName: 'Anita Pillai', service: 'IPD — Gynaecology (3 days)', amount: 18500, paid: 0, status: 'Outstanding', dueDate: '20 Sep 2026' },
];

function money(n: number) { return `₹${n.toLocaleString('en-IN')}`; }

export default function BillingPage() {
  const [invoices, setInvoices] = useState(SEED);
  const outstanding = invoices.reduce((s, i) => s + i.amount - i.paid, 0);
  const collected = invoices.reduce((s, i) => s + i.paid, 0);

  return (
    <>
      <PageIntro eyebrow="REVENUE CYCLE" title="Billing & payments"
        description="Keep invoices understandable for teams and patients, with outstanding balances easy to act on."
        action="Create invoice" />

      <div className="grid gap-4 md:grid-cols-3">
        <MetricCard label="Collected" value={money(collected)} hint="↑ 8.2% from last month" icon={WalletCards} />
        <MetricCard label="Outstanding" value={money(outstanding)} hint="Across active invoices" icon={CircleDollarSign} tone="amber" />
        <MetricCard label="Collection rate" value="86.4%" hint="Healthy for current cycle" icon={FileCheck2} tone="blue" />
      </div>

      <div className="mt-6 rounded-xl border border-border bg-card p-4 soft-shadow">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h3 className="font-bold">Invoice ledger</h3>
            <p className="mt-1 text-xs text-muted-foreground">Most recent patient invoices</p>
          </div>
          <button className="inline-flex items-center gap-2 rounded-lg border border-border px-3 py-2 text-xs font-semibold hover:bg-muted">
            <Download size={14} />Export
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="data-table">
            <thead><tr><th>Invoice</th><th>Patient</th><th>Service</th><th>Amount</th><th>Due date</th><th>Status</th><th className="text-right">Action</th></tr></thead>
            <tbody>
              {invoices.map(inv => (
                <tr key={inv.id}>
                  <td className="mono-font text-xs">{inv.id}</td>
                  <td className="font-semibold">{inv.patientName}</td>
                  <td className="text-muted-foreground">{inv.service}</td>
                  <td className="font-semibold">{money(inv.amount)}</td>
                  <td className="text-xs text-muted-foreground">{inv.dueDate}</td>
                  <td><StatusPill status={inv.status === 'Paid' ? 'Paid' : inv.status === 'Partially paid' ? 'In Progress' : 'Outstanding'} /></td>
                  <td className="text-right">
                    <button
                      disabled={inv.status === 'Paid'}
                      onClick={() => setInvoices(items => items.map(i => i.id === inv.id ? { ...i, paid: i.amount, status: 'Paid' } : i))}
                      className="rounded-lg border border-border px-2.5 py-1.5 text-xs font-semibold hover:bg-muted disabled:cursor-not-allowed disabled:opacity-40">
                      {inv.status === 'Paid' ? 'Paid' : 'Record payment'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
