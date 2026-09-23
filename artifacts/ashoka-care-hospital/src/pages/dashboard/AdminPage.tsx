import { useState } from 'react';
import { Settings } from 'lucide-react';
import { PageIntro, StatusPill, Modal } from '@/components/DashboardShared';

const STAFF = [
  { name: 'Admin User', email: 'admin@ashoka.com', role: 'Admin', status: 'Active', joined: '2025-01-01' },
  { name: 'Dr. Arjun Mehta', email: 'doctor@ashoka.com', role: 'Doctor', status: 'Active', joined: '2025-03-15' },
  { name: 'Nurse Priya', email: 'nurse@ashoka.com', role: 'Nurse', status: 'Active', joined: '2025-04-10' },
  { name: 'Receptionist', email: 'reception@ashoka.com', role: 'Receptionist', status: 'Active', joined: '2025-06-01' },
];

function initials(name: string) { return name.split(' ').map(p => p[0]).slice(0, 2).join('').toUpperCase(); }

export default function AdminPage() {
  const [tab, setTab] = useState<'info' | 'users' | 'system'>('info');
  const [info, setInfo] = useState({ name: 'ASHOKA Care Hospital', city: 'New Delhi', phone: '+91 98016 85127', email: 'info@ashokacare.in', beds: '120', founded: '2008' });
  const [saved, setSaved] = useState(false);

  const F = 'field'; const L = 'field-label';

  return (
    <>
      <PageIntro eyebrow="ADMINISTRATION" title="Admin & settings"
        description="Manage hospital information, staff accounts, and system configuration." />

      <div className="mb-6 flex gap-1 rounded-xl border border-border bg-card p-1 w-fit">
        {(['info', 'users', 'system'] as const).map(t => (
          <button key={t} onClick={() => setTab(t)}
            className={`rounded-lg px-5 py-2 text-sm font-semibold transition ${tab === t ? 'bg-primary text-primary-foreground shadow-sm' : 'text-muted-foreground hover:bg-muted'}`}>
            {t === 'info' ? 'Hospital info' : t === 'users' ? 'User management' : 'System settings'}
          </button>
        ))}
      </div>

      {tab === 'info' && (
        <div className="rounded-xl border border-border bg-card p-6 soft-shadow">
          <h3 className="font-bold mb-5">Hospital Information</h3>
          <div className="grid gap-4 sm:grid-cols-2">
            {[['Hospital Name', 'name'], ['City', 'city'], ['Phone', 'phone'], ['Email', 'email'], ['Total Beds', 'beds'], ['Founded Year', 'founded']].map(([label, key]) => (
              <label key={key} className={L}>
                {label}
                <input value={info[key as keyof typeof info]}
                  onChange={e => setInfo(p => ({ ...p, [key]: e.target.value }))}
                  className={F} />
              </label>
            ))}
          </div>
          <button onClick={() => { setSaved(true); setTimeout(() => setSaved(false), 2000); }}
            className={`mt-6 rounded-lg px-5 py-2.5 text-sm font-semibold text-primary-foreground transition ${saved ? 'bg-green-600' : 'bg-primary hover:opacity-90'}`}>
            {saved ? '✓ Saved' : 'Save changes'}
          </button>
        </div>
      )}

      {tab === 'users' && (
        <div className="rounded-xl border border-border bg-card soft-shadow overflow-hidden">
          <div className="flex items-center justify-between p-5 border-b border-border">
            <h3 className="font-bold">Staff accounts</h3>
            <button className="rounded-lg bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground">+ Invite staff</button>
          </div>
          <div className="overflow-x-auto">
            <table className="data-table">
              <thead><tr><th>Name</th><th>Email</th><th>Role</th><th>Status</th><th>Joined</th><th className="text-right">Action</th></tr></thead>
              <tbody>
                {STAFF.map(u => (
                  <tr key={u.email}>
                    <td>
                      <div className="flex items-center gap-3">
                        <div className="avatar">{initials(u.name)}</div>
                        <span className="font-semibold">{u.name}</span>
                      </div>
                    </td>
                    <td className="text-xs text-muted-foreground">{u.email}</td>
                    <td><span className="rounded-full bg-secondary px-2 py-1 text-[10px] font-semibold text-secondary-foreground">{u.role}</span></td>
                    <td><StatusPill status={u.status} /></td>
                    <td className="text-xs text-muted-foreground">{u.joined}</td>
                    <td className="text-right"><button className="rounded-lg border border-border px-2.5 py-1.5 text-xs font-semibold hover:bg-muted">Edit</button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {tab === 'system' && (
        <div className="rounded-xl border border-border bg-card p-6 soft-shadow">
          <h3 className="font-bold mb-4">System settings</h3>
          <div className="space-y-3">
            {[
              { label: 'Email Notifications', desc: 'Send email alerts for appointments and emergencies', on: true },
              { label: 'Auto-discharge Alerts', desc: 'Notify when IPD patients exceed 7 days', on: true },
              { label: 'Low Inventory Alerts', desc: 'Alert when stock falls below minimum level', on: true },
              { label: 'Emergency SMS Alerts', desc: 'Send SMS to emergency team on critical alerts', on: false },
            ].map(s => (
              <div key={s.label} className="flex items-center justify-between rounded-xl border border-border p-4">
                <div>
                  <p className="text-sm font-bold">{s.label}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{s.desc}</p>
                </div>
                <div className={`relative h-6 w-11 cursor-pointer rounded-full transition ${s.on ? 'bg-primary' : 'bg-border'}`}>
                  <div className={`absolute top-1 h-4 w-4 rounded-full bg-white shadow transition-all ${s.on ? 'left-6' : 'left-1'}`} />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </>
  );
}
