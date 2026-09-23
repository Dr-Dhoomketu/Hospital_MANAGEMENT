import { useState, useEffect } from 'react';
import { Link, useLocation } from 'wouter';
import {
  Hospital, Menu, Bell, Search, MoreHorizontal, LayoutDashboard, Users,
  CalendarDays, Stethoscope, ClipboardList, BedDouble, Siren, FileText,
  FlaskConical, Microscope, Pill, HeartPulse, CircleDollarSign, ShieldCheck,
  Activity, TestTube2, Boxes, Bell as BellIcon, FileBarChart, Lock, Settings,
} from 'lucide-react';

const NAV = [
  { label: 'Workspace', items: [
    { href: '/dashboard', label: 'Overview', icon: LayoutDashboard },
    { href: '/dashboard/patients', label: 'Patients', icon: Users },
    { href: '/dashboard/appointments', label: 'Appointments', icon: CalendarDays },
    { href: '/dashboard/doctors', label: 'Doctors & staff', icon: Stethoscope },
  ]},
  { label: 'Care operations', items: [
    { href: '/dashboard/opd', label: 'OPD queue', icon: ClipboardList },
    { href: '/dashboard/ipd', label: 'IPD & beds', icon: BedDouble },
    { href: '/dashboard/emergency', label: 'Emergency', icon: Siren },
    { href: '/dashboard/emr', label: 'Medical records', icon: FileText },
    { href: '/dashboard/laboratory', label: 'Laboratory', icon: FlaskConical },
    { href: '/dashboard/radiology', label: 'Radiology', icon: Microscope },
    { href: '/dashboard/pharmacy', label: 'Pharmacy', icon: Pill },
    { href: '/dashboard/nursing', label: 'Nursing', icon: HeartPulse },
  ]},
  { label: 'Hospital services', items: [
    { href: '/dashboard/billing', label: 'Billing', icon: CircleDollarSign },
    { href: '/dashboard/insurance', label: 'Insurance', icon: ShieldCheck },
    { href: '/dashboard/ot', label: 'Operating theatre', icon: Activity },
    { href: '/dashboard/blood-bank', label: 'Blood bank', icon: TestTube2 },
    { href: '/dashboard/inventory', label: 'Inventory', icon: Boxes },
  ]},
  { label: 'Admin', items: [
    { href: '/dashboard/notifications', label: 'Notifications', icon: BellIcon },
    { href: '/dashboard/reports', label: 'Reports', icon: FileBarChart },
    { href: '/dashboard/permissions', label: 'Permissions', icon: Lock },
    { href: '/dashboard/admin', label: 'Settings', icon: Settings },
  ]},
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [location, navigate] = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);

  // Auth guard
  useEffect(() => {
    if (!localStorage.getItem('ashoka_staff_token')) navigate('/dashboard/login');
  }, [navigate]);

  let staffUser: { name?: string; role?: string } = {};
  try { const r = localStorage.getItem('ashoka_staff_user'); if (r) staffUser = JSON.parse(r); } catch {}

  const pageTitle = location === '/dashboard' ? 'Overview'
    : location.slice('/dashboard/'.length).replaceAll('-', ' ').replace(/\b\w/g, c => c.toUpperCase());

  return (
    <div className="app-shell flex bg-background text-foreground">
      {/* ── Sidebar ─────────────────────────────────────────────────────── */}
      <aside className={`fixed inset-y-0 left-0 z-40 w-[258px] transform bg-sidebar text-sidebar-foreground transition-transform duration-200 lg:relative lg:translate-x-0 ${mobileOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="flex h-full flex-col">
          {/* Logo */}
          <div className="flex items-center gap-3 border-b border-sidebar-border px-5 py-5">
            <div className="grid h-10 w-10 place-items-center rounded-xl bg-sidebar-primary text-sidebar-primary-foreground">
              <Hospital size={21} />
            </div>
            <div>
              <p className="display-font text-lg font-bold tracking-tight">ASHOKA Care</p>
              <p className="text-[10px] uppercase tracking-[.18em] text-sidebar-foreground/60">Hospital operations</p>
            </div>
          </div>

          {/* Live status */}
          <div className="mx-4 mt-5 rounded-xl border border-sidebar-border bg-sidebar-accent/65 px-3 py-3">
            <div className="flex items-center gap-2 text-xs font-semibold">
              <span className="pulse-dot h-2 w-2 rounded-full bg-sidebar-primary" /> Operations live
            </div>
            <p className="mt-1 text-[11px] text-sidebar-foreground/60">
              {new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
            </p>
          </div>

          {/* Nav */}
          <nav className="flex-1 overflow-y-auto px-3 py-4">
            {NAV.map(group => (
              <div key={group.label} className="mb-5">
                <p className="mb-2 px-3 text-[10px] font-bold uppercase tracking-[.16em] text-sidebar-foreground/45">{group.label}</p>
                {group.items.map(({ href, label, icon: Icon }) => {
                  const active = href === '/dashboard' ? location === '/dashboard' : location.startsWith(href);
                  return (
                    <Link key={href} href={href} onClick={() => setMobileOpen(false)}
                      className={`group mb-1 flex items-center gap-3 rounded-lg px-3 py-2.5 text-[13px] font-medium transition-colors ${active ? 'bg-sidebar-primary text-sidebar-primary-foreground shadow-sm' : 'text-sidebar-foreground/72 hover:bg-sidebar-accent hover:text-sidebar-foreground'}`}>
                      <Icon size={17} strokeWidth={active ? 2.3 : 1.8} />
                      <span>{label}</span>
                    </Link>
                  );
                })}
              </div>
            ))}
          </nav>

          {/* User */}
          <div className="border-t border-sidebar-border p-4">
            {staffUser.name && (
              <div className="flex items-center gap-3">
                <div className="grid h-9 w-9 place-items-center rounded-full bg-sidebar-primary/20 text-xs font-bold text-sidebar-primary">
                  {staffUser.name.charAt(0).toUpperCase()}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-xs font-semibold">{staffUser.name}</p>
                  <p className="truncate text-[11px] text-sidebar-foreground/55 capitalize">{staffUser.role}</p>
                </div>
                <button onClick={() => { localStorage.removeItem('ashoka_staff_token'); localStorage.removeItem('ashoka_staff_user'); navigate('/dashboard/login'); }}
                  className="text-sidebar-foreground/50 hover:text-sidebar-foreground" aria-label="Sign out">
                  <MoreHorizontal size={17} />
                </button>
              </div>
            )}
          </div>
        </div>
      </aside>

      {/* Mobile overlay */}
      {mobileOpen && (
        <button className="fixed inset-0 z-30 bg-slate-900/30 lg:hidden" onClick={() => setMobileOpen(false)} aria-label="Close nav" />
      )}

      {/* ── Main ────────────────────────────────────────────────────────── */}
      <div className="min-w-0 flex-1">
        {/* Topbar */}
        <header className="sticky top-0 z-20 flex h-[72px] items-center justify-between border-b border-border bg-background/95 px-4 backdrop-blur md:px-8">
          <div className="flex items-center gap-3">
            <button className="rounded-lg p-2 hover:bg-muted lg:hidden" onClick={() => setMobileOpen(true)} aria-label="Open nav">
              <Menu size={20} />
            </button>
            <div>
              <p className="text-xs text-muted-foreground">ASHOKA Care / <span className="text-foreground capitalize">{pageTitle}</span></p>
              <h1 className="display-font mt-0.5 text-lg font-bold capitalize">
                {location === '/dashboard' ? `Good morning, ${staffUser.name?.split(' ')[0] ?? 'Admin'}` : pageTitle}
              </h1>
            </div>
          </div>
          <div className="flex items-center gap-2 md:gap-4">
            <div className="hidden items-center gap-2 rounded-lg border border-border bg-card px-3 py-2 text-xs text-muted-foreground md:flex">
              <Search size={15} />
              <span>Search patients, UHID or service</span>
              <kbd className="ml-5 rounded border border-border bg-muted px-1.5 py-0.5 text-[10px]">⌘ K</kbd>
            </div>
            <Link href="/dashboard/notifications" className="relative rounded-lg p-2 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground" aria-label="Notifications">
              <Bell size={19} />
            </Link>
            <div className="hidden h-7 w-px bg-border md:block" />
            <div className="grid h-9 w-9 place-items-center rounded-full bg-secondary text-xs font-bold text-secondary-foreground">
              {staffUser.name?.charAt(0)?.toUpperCase() ?? 'A'}
            </div>
          </div>
        </header>

        {/* Content */}
        <main className="page-enter mx-auto w-full max-w-[1500px] p-4 md:p-8">
          {children}
        </main>
      </div>

      <style>{`
        @keyframes pulse-dot { 0%,100%{opacity:.45;transform:scale(.9)} 50%{opacity:1;transform:scale(1)} }
        @keyframes page-enter { from{opacity:0;transform:translateY(5px)} to{opacity:1;transform:translateY(0)} }
      `}</style>
    </div>
  );
}
