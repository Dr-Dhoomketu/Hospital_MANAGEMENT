import { useState } from 'react';
import { ShieldCheck } from 'lucide-react';
import { PageIntro, MetricCard, Modal } from '@/components/DashboardShared';

const PAYERS = ['Star Health','HDFC Ergo','Bajaj Allianz','New India Assurance','Apollo Munich','Max Bupa','National Insurance'];
const SERVICES = ['OPD Consultation','Surgery Package','IPD Package','Lab & Diagnostics','Emergency Care','Pharmacy','Physiotherapy'];
const STATUS_S: Record<string,string> = { Approved:'status-good', Submitted:'status-neutral', 'Documents needed':'status-warn', 'Eligibility check':'status-neutral', Rejected:'status-warn' };

export default function InsurancePage() {
  const [claims, setClaims] = useState([
    { id:'INS-761', patient:'Aarav Sharma',  payer:'Star Health',    policy:'SH-2891044', service:'Cardiology',      updated:'Today, 09:10', status:'Documents needed', amount:18000 },
    { id:'INS-760', patient:'Maya Kapoor',   payer:'HDFC Ergo',     policy:'HE-5521089', service:'OPD consult',      updated:'Today, 08:56', status:'Approved',         amount:2400  },
    { id:'INS-759', patient:'Rohan Desai',   payer:'Bajaj Allianz', policy:'BA-9934712', service:'Orthopaedics',     updated:'Yesterday',    status:'Eligibility check', amount:4800  },
    { id:'INS-758', patient:'Anita Pillai',  payer:'New India',     policy:'NI-3347621', service:'Gynaecology IPD',  updated:'Yesterday',    status:'Submitted',        amount:42000 },
  ]);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ patient:'', payer:'', policy:'', service:'', amount:'' });
  const upd = (k: string, v: string) => setForm(p => ({ ...p, [k]: v }));

  const addClaim = (e: React.FormEvent) => {
    e.preventDefault();
    setClaims(prev => [{ id:`INS-${762+prev.length}`, patient:form.patient, payer:form.payer, policy:form.policy, service:form.service, updated:'Just now', status:'Submitted', amount:parseInt(form.amount)||0 }, ...prev]);
    setShowModal(false); setForm({ patient:'', payer:'', policy:'', service:'', amount:'' });
  };

  function money(n: number) { return `₹${n.toLocaleString('en-IN')}`; }
  const pending = claims.filter(c => c.status !== 'Approved' && c.status !== 'Rejected').length;

  return (
    <>
      <PageIntro eyebrow="REVENUE CYCLE" title="Insurance desk"
        description="Follow eligibility, authorizations, and claims before they become patient friction."
        action="Start verification" onAction={() => setShowModal(true)} />

      <div className="grid gap-4 md:grid-cols-3 mb-5">
        <MetricCard label="Active claims" value={claims.length} hint="Across all payers" icon={ShieldCheck} />
        <MetricCard label="Pending action" value={pending} hint="Needs documents or follow-up" icon={ShieldCheck} tone="amber" />
        <MetricCard label="Approved" value={claims.filter(c=>c.status==='Approved').length} hint="Cleared for billing" icon={ShieldCheck} tone="teal" />
      </div>

      <div className="rounded-xl border border-border bg-card soft-shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="data-table">
            <thead><tr><th>Case</th><th>Patient</th><th>Payer</th><th>Policy</th><th>Service</th><th>Amount</th><th>Updated</th><th>Status</th><th className="text-right">Action</th></tr></thead>
            <tbody>
              {claims.map(c => (
                <tr key={c.id}>
                  <td className="mono-font text-xs font-bold">{c.id}</td>
                  <td className="font-semibold">{c.patient}</td>
                  <td className="text-sm">{c.payer}</td>
                  <td className="mono-font text-xs text-muted-foreground">{c.policy}</td>
                  <td className="text-xs">{c.service}</td>
                  <td className="font-semibold">{money(c.amount)}</td>
                  <td className="text-xs text-muted-foreground">{c.updated}</td>
                  <td><span className={`status-pill ${STATUS_S[c.status]??'status-neutral'}`}><span className="h-1.5 w-1.5 rounded-full bg-current"/>{c.status}</span></td>
                  <td className="text-right">
                    <select value={c.status} onChange={e => setClaims(prev => prev.map(x => x.id===c.id ? { ...x, status:e.target.value, updated:'Just now' } : x))}
                      className="field text-xs py-1 px-2" style={{ width:'auto' }}>
                      <option>Eligibility check</option><option>Documents needed</option><option>Submitted</option><option>Approved</option><option>Rejected</option>
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {showModal && (
        <Modal title="Start Insurance Verification" onClose={() => setShowModal(false)}>
          <form onSubmit={addClaim} className="space-y-4">
            <label className="field-label">Patient Name *<input required value={form.patient} onChange={e => upd('patient', e.target.value)} className="field" /></label>
            <div className="grid grid-cols-2 gap-4">
              <label className="field-label">Payer / Insurer *
                <select required value={form.payer} onChange={e => upd('payer', e.target.value)} className="field">
                  <option value="">Select payer</option>
                  {PAYERS.map(p => <option key={p}>{p}</option>)}
                </select>
              </label>
              <label className="field-label">Policy Number<input value={form.policy} onChange={e => upd('policy', e.target.value)} className="field" placeholder="Policy ID" /></label>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <label className="field-label">Service *
                <select required value={form.service} onChange={e => upd('service', e.target.value)} className="field">
                  <option value="">Select service</option>
                  {SERVICES.map(s => <option key={s}>{s}</option>)}
                </select>
              </label>
              <label className="field-label">Claim Amount (₹)<input type="number" value={form.amount} onChange={e => upd('amount', e.target.value)} className="field" /></label>
            </div>
            <button className="w-full rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground">Submit for Verification</button>
          </form>
        </Modal>
      )}
    </>
  );
}
