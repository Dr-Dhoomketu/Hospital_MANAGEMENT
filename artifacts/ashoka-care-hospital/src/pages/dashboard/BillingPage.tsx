import { useState } from 'react';
import { WalletCards, CircleDollarSign, FileCheck2, Download, Printer } from 'lucide-react';
import { PageIntro, MetricCard, StatusPill, Modal } from '@/components/DashboardShared';

const SERVICES_LIST = ['OPD Consultation','IPD Package','Surgery Package','Lab Tests','Radiology','Pharmacy','Emergency Care','Physiotherapy'];
function money(n: number) { return `₹${n.toLocaleString('en-IN')}`; }

export default function BillingPage() {
  const [invoices, setInvoices] = useState([
    { id:'INV-24061', patient:'Aarav Sharma', service:'Cardiology + Lab', amount:87250, paid:60000, status:'Partially paid', due:'25 Sep 2026' },
    { id:'INV-24062', patient:'Maya Kapoor',  service:'OPD consultation', amount:2400,  paid:2400,  status:'Paid',          due:'23 Sep 2026' },
    { id:'INV-24063', patient:'Rohan Desai',  service:'Ortho + MRI',      amount:4800,  paid:0,     status:'Outstanding',   due:'23 Sep 2026' },
    { id:'INV-24064', patient:'Anita Pillai', service:'IPD Gynaecology',  amount:18500, paid:0,     status:'Outstanding',   due:'20 Sep 2026' },
  ]);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ patient:'', service:'', amount:'', due:'' });
  const upd = (k: string, v: string) => setForm(p => ({ ...p, [k]: v }));

  const createInvoice = (e: React.FormEvent) => {
    e.preventDefault();
    setInvoices(prev => [{ id:`INV-${24065+prev.length}`, patient:form.patient, service:form.service, amount:parseInt(form.amount)||0, paid:0, status:'Outstanding', due:form.due }, ...prev]);
    setShowModal(false); setForm({ patient:'', service:'', amount:'', due:'' });
  };

  const markPaid = (id: string) => setInvoices(prev => prev.map(i => i.id===id ? { ...i, paid:i.amount, status:'Paid' } : i));
  const S: Record<string,string> = { Paid:'status-good', 'Partially paid':'status-warn', Outstanding:'status-warn' };

  const total = invoices.reduce((s,i) => s+i.amount, 0);
  const collected = invoices.reduce((s,i) => s+i.paid, 0);

  return (
    <>
      <PageIntro eyebrow="REVENUE CYCLE" title="Billing & payments"
        description="Keep invoices understandable for teams and patients, with outstanding balances easy to act on."
        action="Create invoice" onAction={() => setShowModal(true)} />

      <div className="grid gap-4 md:grid-cols-3 mb-5">
        <MetricCard label="Collected" value={money(collected)} hint="↑ 8.2% from last month" icon={WalletCards} />
        <MetricCard label="Outstanding" value={money(total-collected)} hint="Across active invoices" icon={CircleDollarSign} tone="amber" />
        <MetricCard label="Collection rate" value={`${Math.round((collected/total)*100)||0}%`} hint="Current cycle" icon={FileCheck2} tone="blue" />
      </div>

      <div className="rounded-xl border border-border bg-card soft-shadow overflow-hidden">
        <div className="flex items-center justify-between p-4 border-b border-border">
          <div><h3 className="font-bold">Invoice ledger</h3><p className="mt-1 text-xs text-muted-foreground">Most recent patient invoices</p></div>
          <button className="inline-flex items-center gap-2 rounded-lg border border-border px-3 py-2 text-xs font-semibold hover:bg-muted">
            <Download size={14}/>Export
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="data-table">
            <thead><tr><th>Invoice</th><th>Patient</th><th>Service</th><th>Amount</th><th>Due</th><th>Status</th><th className="text-right">Action</th></tr></thead>
            <tbody>
              {invoices.map(inv => (
                <tr key={inv.id}>
                  <td className="mono-font text-xs font-bold">{inv.id}</td>
                  <td className="font-semibold">{inv.patient}</td>
                  <td className="text-muted-foreground text-sm">{inv.service}</td>
                  <td className="font-bold">{money(inv.amount)}</td>
                  <td className="text-xs text-muted-foreground">{inv.due}</td>
                  <td><span className={`status-pill ${S[inv.status]??'status-neutral'}`}><span className="h-1.5 w-1.5 rounded-full bg-current"/>{inv.status}</span></td>
                  <td className="text-right">
                    <div className="flex justify-end gap-1">
                      {inv.status !== 'Paid' && (
                        <button onClick={() => markPaid(inv.id)} className="rounded-lg border border-border px-2.5 py-1.5 text-xs font-semibold hover:bg-muted">Collect</button>
                      )}
                      <button onClick={() => window.print()} className="rounded-lg border border-border px-2.5 py-1.5 text-xs font-semibold hover:bg-muted"><Printer size={12}/></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {showModal && (
        <Modal title="Create Invoice" onClose={() => setShowModal(false)}>
          <form onSubmit={createInvoice} className="space-y-4">
            <label className="field-label">Patient Name *<input required value={form.patient} onChange={e => upd('patient', e.target.value)} className="field" /></label>
            <label className="field-label">Service *
              <select required value={form.service} onChange={e => upd('service', e.target.value)} className="field">
                <option value="">Select service</option>
                {SERVICES_LIST.map(s => <option key={s}>{s}</option>)}
              </select>
            </label>
            <div className="grid grid-cols-2 gap-4">
              <label className="field-label">Amount (₹) *<input required type="number" value={form.amount} onChange={e => upd('amount', e.target.value)} className="field" /></label>
              <label className="field-label">Due Date *<input required type="date" value={form.due} onChange={e => upd('due', e.target.value)} className="field" /></label>
            </div>
            <button className="w-full rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground">Create Invoice</button>
          </form>
        </Modal>
      )}
    </>
  );
}
