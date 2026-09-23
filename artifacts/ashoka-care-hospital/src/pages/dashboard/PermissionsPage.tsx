import { useState } from 'react';
import { Lock } from 'lucide-react';
import { PageIntro } from '@/components/DashboardShared';

const ROLES = ['Admin', 'Doctor', 'Nurse', 'Receptionist', 'Pharmacist', 'Lab Tech'];

const DEFAULT = [
  { key: 'view_dashboard',      label: 'View Dashboard',          description: 'Access the main dashboard and statistics',     roles: { Admin:true, Doctor:true,  Nurse:true,  Receptionist:true,  Pharmacist:false, 'Lab Tech':false } },
  { key: 'manage_patients',     label: 'Manage Patients',         description: 'Create, edit and view patient records',         roles: { Admin:true, Doctor:true,  Nurse:true,  Receptionist:true,  Pharmacist:false, 'Lab Tech':false } },
  { key: 'manage_appointments', label: 'Manage Appointments',     description: 'Book, edit and cancel appointments',            roles: { Admin:true, Doctor:true,  Nurse:false, Receptionist:true,  Pharmacist:false, 'Lab Tech':false } },
  { key: 'view_emr',            label: 'View Medical Records',    description: 'Access patient EMR and clinical history',       roles: { Admin:true, Doctor:true,  Nurse:true,  Receptionist:false, Pharmacist:false, 'Lab Tech':false } },
  { key: 'manage_lab',          label: 'Manage Lab Orders',       description: 'Create and update laboratory test orders',      roles: { Admin:true, Doctor:true,  Nurse:false, Receptionist:false, Pharmacist:false, 'Lab Tech':true  } },
  { key: 'manage_pharmacy',     label: 'Manage Pharmacy',         description: 'Dispense medicines and manage prescriptions',   roles: { Admin:true, Doctor:false, Nurse:false, Receptionist:false, Pharmacist:true,  'Lab Tech':false } },
  { key: 'manage_billing',      label: 'Manage Billing',          description: 'Create invoices and process payments',          roles: { Admin:true, Doctor:false, Nurse:false, Receptionist:true,  Pharmacist:false, 'Lab Tech':false } },
  { key: 'view_reports',        label: 'View Reports',            description: 'Access analytics and export reports',           roles: { Admin:true, Doctor:false, Nurse:false, Receptionist:false, Pharmacist:false, 'Lab Tech':false } },
  { key: 'manage_emergency',    label: 'Manage Emergency Alerts', description: 'Acknowledge and resolve emergency alerts',      roles: { Admin:true, Doctor:true,  Nurse:true,  Receptionist:false, Pharmacist:false, 'Lab Tech':false } },
  { key: 'manage_inventory',    label: 'Manage Inventory',        description: 'Update stock and raise purchase orders',        roles: { Admin:true, Doctor:false, Nurse:false, Receptionist:false, Pharmacist:true,  'Lab Tech':false } },
  { key: 'manage_staff',        label: 'Manage Staff Users',      description: 'Create and deactivate staff accounts',         roles: { Admin:true, Doctor:false, Nurse:false, Receptionist:false, Pharmacist:false, 'Lab Tech':false } },
];

export default function PermissionsPage() {
  const [perms, setPerms] = useState(DEFAULT);
  const [saved, setSaved] = useState(false);

  const toggle = (key: string, role: string) => {
    if (role === 'Admin') return;
    setPerms(p => p.map(perm => perm.key === key
      ? { ...perm, roles: { ...perm.roles, [role]: !perm.roles[role as keyof typeof perm.roles] } }
      : perm
    ));
    setSaved(false);
  };

  const save = () => {
    try { localStorage.setItem('ashoka_permissions', JSON.stringify(perms)); } catch {}
    setSaved(true); setTimeout(() => setSaved(false), 2500);
  };

  return (
    <>
      <div className="mb-7 flex items-end justify-between gap-4">
        <div>
          <p className="mb-2 text-[11px] font-bold uppercase tracking-[.18em] text-primary">ACCESS CONTROL</p>
          <h2 className="display-font text-3xl font-extrabold tracking-tight md:text-4xl">Role permissions</h2>
          <p className="mt-2 max-w-xl text-sm text-muted-foreground">Admin always has full access. Toggle permissions for other roles freely.</p>
        </div>
        <button onClick={save}
          className={`inline-flex shrink-0 items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-semibold text-primary-foreground transition ${saved ? 'bg-green-600' : 'bg-primary hover:opacity-90'}`}>
          {saved ? '✓ Saved & live' : 'Save & push live'}
        </button>
      </div>

      {/* Role legend */}
      <div className="mb-4 flex flex-wrap gap-2">
        {ROLES.map(r => (
          <div key={r} className="flex items-center gap-1.5 rounded-full border border-border bg-card px-3 py-1.5 text-xs font-semibold">
            <span className={`h-2 w-2 rounded-full ${r === 'Admin' ? 'bg-primary' : 'bg-muted-foreground'}`} />
            {r}{r === 'Admin' && <span className="text-muted-foreground font-normal ml-1">· full access</span>}
          </div>
        ))}
      </div>

      <div className="rounded-xl border border-border bg-card overflow-hidden soft-shadow">
        {/* Header */}
        <div className={`grid gap-2 bg-sidebar px-5 py-3.5`}
          style={{ gridTemplateColumns: `1fr repeat(${ROLES.length}, 80px)` }}>
          <span className="text-[10px] font-bold uppercase tracking-widest text-sidebar-foreground/45">Permission</span>
          {ROLES.map(r => (
            <div key={r} className="text-center">
              <span className="text-[10px] font-bold uppercase tracking-wider text-sidebar-primary">{r}</span>
            </div>
          ))}
        </div>
        {/* Rows */}
        {perms.map((perm, idx) => (
          <div key={perm.key}
            style={{ gridTemplateColumns: `1fr repeat(${ROLES.length}, 80px)` }}
            className={`grid gap-2 items-center px-5 py-4 ${idx < perms.length - 1 ? 'border-b border-border' : ''} ${idx % 2 === 1 ? 'bg-muted/30' : 'bg-card'} transition hover:bg-muted/50`}>
            <div>
              <p className="text-sm font-semibold">{perm.label}</p>
              <p className="text-[11px] text-muted-foreground mt-0.5">{perm.description}</p>
            </div>
            {ROLES.map(role => {
              const enabled = perm.roles[role as keyof typeof perm.roles] ?? false;
              const isAdmin = role === 'Admin';
              return (
                <div key={role} className="flex justify-center">
                  <button onClick={() => toggle(perm.key, role)} disabled={isAdmin}
                    title={isAdmin ? 'Admin always has full access' : undefined}
                    className={`relative h-6 w-11 rounded-full transition-colors duration-200 ${enabled ? 'bg-primary' : 'bg-border'} ${isAdmin ? 'cursor-not-allowed opacity-75' : 'cursor-pointer'}`}>
                    <span className={`absolute top-1 h-4 w-4 rounded-full bg-white shadow transition-all duration-200 ${enabled ? 'left-6' : 'left-1'}`} />
                  </button>
                </div>
              );
            })}
          </div>
        ))}
      </div>
      <p className="mt-3 text-center text-[11px] text-muted-foreground">
        Changes are saved to localStorage and applied instantly without a redeploy.
      </p>
    </>
  );
}
