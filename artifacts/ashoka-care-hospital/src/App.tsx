import { useState } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Route, Router as WouterRouter, Switch, useLocation, Redirect } from 'wouter';
import { ErrorBoundary } from '@/components/error-boundary';
import { Toaster } from '@/components/ui/toaster';
import { TooltipProvider } from '@/components/ui/tooltip';
import { EmergencyModal, FloatingSOS } from '@/components/EmergencyModal';

import { AuthenticateWithRedirectCallback, useAuth, useUser as useClerkUser, UserButton, SignedIn, SignedOut } from '@clerk/clerk-react';

// Public pages (all self-contained from original App, kept inline below)
import LoginPage from '@/pages/public/LoginPage';
import SignupPage from '@/pages/public/SignupPage';
import PortalDashboardPage from '@/pages/public/PortalDashboardPage';

// Dashboard pages
import DashboardLayout from '@/pages/dashboard/DashboardLayout';
import DashboardLoginPage from '@/pages/dashboard/DashboardLoginPage';
import DashboardHome from '@/pages/dashboard/DashboardHome';
import PatientsPage from '@/pages/dashboard/PatientsPage';
import AppointmentsPage from '@/pages/dashboard/AppointmentsPage';
import DoctorsPage from '@/pages/dashboard/DoctorsPage';
import OpdPage from '@/pages/dashboard/OpdPage';
import IpdPage from '@/pages/dashboard/IpdPage';
import EmergencyPage from '@/pages/dashboard/EmergencyPage';
import EmrPage from '@/pages/dashboard/EmrPage';
import LaboratoryPage from '@/pages/dashboard/LaboratoryPage';
import RadiologyPage from '@/pages/dashboard/RadiologyPage';
import PharmacyPage from '@/pages/dashboard/PharmacyPage';
import BillingPage from '@/pages/dashboard/BillingPage';
import InsurancePage from '@/pages/dashboard/InsurancePage';
import OtPage from '@/pages/dashboard/OtPage';
import NursingPage from '@/pages/dashboard/NursingPage';
import BloodBankPage from '@/pages/dashboard/BloodBankPage';
import InventoryPage from '@/pages/dashboard/InventoryPage';
import NotificationsPage from '@/pages/dashboard/NotificationsPage';
import ReportsPage from '@/pages/dashboard/ReportsPage';
import AdminPage from '@/pages/dashboard/AdminPage';
import PermissionsPage from '@/pages/dashboard/PermissionsPage';
import NotFound from '@/pages/not-found';

// Inline public pages (Home, Book, Confirmation) kept from original
import {
  getGetDashboardSummaryQueryKey, getHealthCheckQueryKey,
  getListAppointmentsQueryKey, getListPatientsQueryKey,
  getListPublicDoctorsQueryKey, getListPublicServicesQueryKey,
  useCreatePublicAppointment, useHealthCheck,
  useListPublicDoctors, useListPublicServices,
} from '@workspace/api-client-react';
import type { Doctor } from '@workspace/api-client-react';
import { Link, useParams } from 'wouter';
import {
  ArrowRight, BadgeCheck, CalendarDays, Check, ChevronRight,
  FlaskConical, HeartPulse, Hospital, LifeBuoy, Menu,
  Phone, ShieldCheck, Stethoscope,
} from 'lucide-react';

const queryClient = new QueryClient();

// ─── helpers ────────────────────────────────────────────────────────────────

function cx(...v: Array<string | false | undefined>) { return v.filter(Boolean).join(' '); }
function money(n?: number) { return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(n ?? 0); }
function initials(name = 'A') { return name.split(' ').map(p => p[0]).slice(0, 2).join('').toUpperCase(); }

// ─── PublicLayout wrapper (adds SOS button) ──────────────────────────────────

function PublicLayout({ children }: { children: React.ReactNode }) {
  const [sosOpen, setSosOpen] = useState(false);
  return (
    <>
      {children}
      <FloatingSOS onClick={() => setSosOpen(true)} />
      <EmergencyModal open={sosOpen} onClose={() => setSosOpen(false)} />
    </>
  );
}

// ─── Public Header ────────────────────────────────────────────────────────────

function PublicHeader() {
  const [open, setOpen] = useState(false);
  const [sosOpen, setSosOpen] = useState(false);
  return (
    <>
      <header className="sticky top-0 z-30 border-b border-[hsl(var(--border)/.7)] bg-[hsl(var(--background)/.88)] backdrop-blur-xl">
        <div className="mx-auto flex h-[76px] max-w-7xl items-center justify-between px-5 lg:px-8">
          <Link href="/" className="flex items-center gap-3">
            <span className="grid h-10 w-10 place-items-center rounded-[13px] bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))] shadow-sm">
              <Hospital size={20} strokeWidth={2.3} />
            </span>
            <span className="leading-none">
              <span className="block font-serif text-[17px] font-semibold tracking-[-.04em]">ASHOKA</span>
              <span className="mt-1 block text-[9px] font-bold uppercase tracking-[.21em] text-[hsl(var(--muted-foreground))]">Care Hospital</span>
            </span>
          </Link>
          <nav className="hidden items-center gap-7 text-sm font-semibold text-[hsl(var(--muted-foreground))] lg:flex">
            <a href="#care">Care at Ashoka</a>
            <a href="#specialists">Our specialists</a>
            <a href="#visit">Plan your visit</a>
          </nav>
          <div className="flex items-center gap-2">
            <button onClick={() => setSosOpen(true)} className="hidden rounded-xl bg-red-600 px-3 py-2 text-sm font-bold text-white hover:bg-red-700 sm:inline-flex items-center gap-1">
              🚨 Emergency
            </button>
            <SignedOut>
              <Link href="/login" className="hidden rounded-xl px-3 py-2 text-sm font-bold text-[hsl(var(--muted-foreground))] hover:bg-[hsl(var(--muted))] sm:inline-flex">Patient login</Link>
            </SignedOut>
            <SignedIn>
              <Link href="/portal/dashboard" className="hidden rounded-xl px-3 py-2 text-sm font-bold text-[hsl(var(--muted-foreground))] hover:bg-[hsl(var(--muted))] sm:inline-flex">My Portal</Link>
              <UserButton afterSignOutUrl="/">
                <UserButton.MenuItems>
                  <UserButton.Link label="My Portal" labelIcon={<svg style={{width:'14px',height:'14px'}} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"/></svg>} href="/portal/dashboard" />
                  <UserButton.Link label="Book Appointment" labelIcon={<svg style={{width:'14px',height:'14px'}} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/></svg>} href="/book" />
                </UserButton.MenuItems>
                <UserButton.UserProfilePage label="account" />
                <UserButton.UserProfilePage label="security" />
              </UserButton>
            </SignedIn>
            <Link href="/book" className="inline-flex items-center gap-2 rounded-xl bg-[hsl(var(--primary))] px-4 py-2.5 text-sm font-bold text-white shadow-sm hover:-translate-y-0.5">Book a visit <ArrowRight size={15} /></Link>
            <button aria-label="Open menu" className="rounded-xl p-2 lg:hidden" onClick={() => setOpen(!open)}><Menu size={20} /></button>
          </div>
        </div>
        {open && (
          <div className="border-t border-[hsl(var(--border))] px-5 py-4 lg:hidden">
            <div className="flex flex-col gap-3 text-sm font-semibold">
              <a href="#care">Care at Ashoka</a>
              <a href="#specialists">Our specialists</a>
              <Link href="/login">Patient login</Link>
              <Link href="/dashboard/login">Staff portal</Link>
            </div>
          </div>
        )}
      </header>
      <EmergencyModal open={sosOpen} onClose={() => setSosOpen(false)} />
    </>
  );
}

// ─── Public Home ─────────────────────────────────────────────────────────────

const publicServices = [
  { name: 'Outpatient consultation', description: 'A thoughtful first visit with the right specialist, without the runaround.', icon: Stethoscope, tone: 'mint' },
  { name: 'Diagnostics & imaging', description: 'Laboratory, ultrasound and X-ray services under one trusted roof.', icon: FlaskConical, tone: 'coral' },
  { name: 'Emergency care', description: 'A calm, equipped response team available around the clock.', icon: LifeBuoy, tone: 'ink' },
];

function DoctorCard({ doctor }: { doctor: Doctor }) {
  return (
    <div className="rounded-2xl border border-[hsl(var(--border))] p-5">
      <div className="flex items-start justify-between">
        <div className="grid h-14 w-14 place-items-center rounded-2xl bg-[hsl(var(--secondary)/.35)] font-serif text-xl font-semibold">{initials(doctor.name)}</div>
        <span className={cx('rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-widest', doctor.available ? 'bg-[hsl(var(--secondary)/.35)]' : 'bg-[hsl(var(--muted))]')}>{doctor.available ? 'Available' : 'Away'}</span>
      </div>
      <h3 className="mt-4 font-serif text-xl font-semibold">{doctor.name}</h3>
      <p className="mt-1 text-sm text-[hsl(var(--muted-foreground))]">{doctor.specialty}</p>
      <p className="mt-4 text-xs font-bold text-[hsl(var(--muted-foreground))]">{doctor.experienceYears} years · {doctor.department}</p>
    </div>
  );
}

function PublicHome() {
  const servicesQuery = useListPublicServices({ query: { queryKey: getListPublicServicesQueryKey() } });
  const doctorsQuery = useListPublicDoctors(undefined, { query: { queryKey: getListPublicDoctorsQueryKey() } });
  useHealthCheck({ query: { queryKey: getHealthCheckQueryKey() } });
  const services = Array.isArray(servicesQuery.data) && servicesQuery.data.length > 0
    ? servicesQuery.data
    : publicServices.map((s, i) => ({ id: `f${i}`, name: s.name, description: s.description, category: 'Care', durationMinutes: 45, startingPrice: i === 0 ? 800 : 1200 }));
  const doctors = Array.isArray(doctorsQuery.data) ? doctorsQuery.data.slice(0, 3) : [];

  return (
    <div className="min-h-[100dvh] bg-[hsl(var(--background))]">
      <PublicHeader />
      <main>
        {/* Hero */}
        <section className="relative overflow-hidden border-b border-[hsl(var(--border))]">
          <div className="absolute inset-0 grid-lines opacity-50" />
          <div className="absolute -right-28 top-10 h-80 w-80 rounded-full bg-[hsl(var(--secondary)/.35)] blur-3xl" />
          <div className="relative mx-auto grid max-w-7xl gap-12 px-5 pb-20 pt-16 lg:grid-cols-[1.03fr_.97fr] lg:items-center lg:px-8 lg:pb-28 lg:pt-24">
            <div className="animate-rise">
              <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-[hsl(var(--border))] bg-[hsl(var(--card)/.7)] px-3 py-1.5 text-xs font-bold text-[hsl(var(--muted-foreground))]">
                <span className="h-2 w-2 animate-pulse-soft rounded-full bg-[hsl(var(--secondary-foreground))]" /> Care that makes room for you
              </div>
              <h1 className="max-w-2xl font-serif text-[clamp(3.35rem,7vw,6.6rem)] font-semibold leading-[.92] tracking-[-.075em] text-[hsl(var(--foreground))]">
                Medicine with a <span className="text-[hsl(var(--muted-foreground))]">human pulse.</span>
              </h1>
              <p className="mt-7 max-w-lg text-lg leading-8 text-[hsl(var(--muted-foreground))]">Ashoka Care is a multi-specialty hospital in the heart of the city, where clear answers and kinder journeys come first.</p>
              <div className="mt-9 flex flex-wrap items-center gap-3">
                <Link href="/book" className="inline-flex items-center gap-2 rounded-xl bg-[hsl(var(--primary))] px-5 py-3.5 text-sm font-bold text-white shadow-lg shadow-[hsl(var(--primary)/.16)] hover:-translate-y-0.5">Find your care <ArrowRight size={16} /></Link>
                <a href="#care" className="inline-flex items-center gap-2 rounded-xl px-4 py-3.5 text-sm font-bold text-[hsl(var(--muted-foreground))] hover:bg-[hsl(var(--muted))]">Explore services <ChevronRight size={16} /></a>
              </div>
              <div className="mt-10 flex items-center gap-3 text-xs font-semibold text-[hsl(var(--muted-foreground))]">
                <span className="grid h-7 w-7 place-items-center rounded-full bg-[hsl(var(--secondary))] text-[hsl(var(--foreground))]"><ShieldCheck size={14} /></span> NABH-inspired standards, designed around you
              </div>
            </div>
            <div className="relative animate-rise [animation-delay:120ms]">
              <div className="relative overflow-hidden rounded-[2rem] bg-[hsl(var(--primary))] p-6 text-white shadow-2xl shadow-[hsl(var(--primary)/.16)] sm:p-8">
                <div className="absolute -right-16 -top-16 h-56 w-56 rounded-full border border-white/10" />
                <div className="absolute -bottom-24 -left-12 h-56 w-56 rounded-full border border-white/10" />
                <div className="relative">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-xs font-bold uppercase tracking-[.2em] text-white/55">Today at Ashoka</p>
                      <p className="mt-2 font-serif text-2xl font-semibold">The right next step.</p>
                    </div>
                    <div className="rounded-xl bg-white/10 p-3"><HeartPulse size={23} /></div>
                  </div>
                  <div className="my-10 flex items-end gap-2">
                    <span className="font-serif text-7xl font-semibold tracking-[-.08em]">24</span>
                    <span className="pb-3 text-sm text-white/65">specialists<br />on duty</span>
                  </div>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between rounded-xl bg-white/10 px-4 py-3">
                      <span className="text-sm text-white/75">Outpatient clinic</span>
                      <span className="text-sm font-bold text-[hsl(var(--secondary))]">Open now</span>
                    </div>
                    <div className="flex items-center justify-between rounded-xl bg-white/10 px-4 py-3">
                      <span className="text-sm text-white/75">Emergency department</span>
                      <span className="flex items-center gap-1.5 text-sm font-bold"><span className="h-2 w-2 rounded-full bg-[hsl(var(--accent))]" /> 24 / 7</span>
                    </div>
                  </div>
                </div>
              </div>
              <div className="mt-4 grid grid-cols-2 gap-3">
                <div className="rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-4">
                  <p className="text-2xl font-bold tracking-[-.05em]">18 yrs</p>
                  <p className="mt-1 text-xs text-[hsl(var(--muted-foreground))]">of trusted care</p>
                </div>
                <div className="rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-4">
                  <p className="text-2xl font-bold tracking-[-.05em]">4.9<span className="text-base text-[hsl(var(--accent-foreground))]"> / 5</span></p>
                  <p className="mt-1 text-xs text-[hsl(var(--muted-foreground))]">patient experience</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Services */}
        <section id="care" className="mx-auto max-w-7xl px-5 py-20 lg:px-8 lg:py-28">
          <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
            <div>
              <p className="text-xs font-bold uppercase tracking-[.2em] text-[hsl(var(--muted-foreground))]">One connected hospital</p>
              <h2 className="mt-3 max-w-xl font-serif text-4xl font-semibold tracking-[-.06em]">Care that stays in the room.</h2>
            </div>
            <p className="max-w-sm text-sm leading-6 text-[hsl(var(--muted-foreground))]">From your first question to your follow-up, every part of your visit is designed to feel considered.</p>
          </div>
          <div className="mt-10 grid gap-4 md:grid-cols-3">
            {services.slice(0, 3).map((service, index) => {
              const icon = publicServices[index]?.icon ?? HeartPulse;
              const tone = publicServices[index]?.tone ?? 'mint';
              const Icon = icon;
              return (
                <div key={service.id} className={cx('group rounded-2xl border border-[hsl(var(--border))] p-6 transition hover:-translate-y-1 hover:shadow-xl', tone === 'mint' && 'bg-[hsl(var(--secondary)/.28)]', tone === 'coral' && 'bg-[hsl(var(--accent)/.24)]', tone === 'ink' && 'bg-[hsl(var(--primary))] text-white')}>
                  <div className={cx('mb-14 grid h-11 w-11 place-items-center rounded-xl', tone === 'ink' ? 'bg-white/10' : 'bg-[hsl(var(--card)/.7)]')}><Icon size={20} /></div>
                  <p className={cx('text-xs font-bold uppercase tracking-[.16em]', tone === 'ink' ? 'text-white/55' : 'text-[hsl(var(--muted-foreground))]')}>{service.category}</p>
                  <h3 className="mt-2 font-serif text-2xl font-semibold tracking-[-.04em]">{service.name}</h3>
                  <p className={cx('mt-3 text-sm leading-6', tone === 'ink' ? 'text-white/65' : 'text-[hsl(var(--muted-foreground))]')}>{service.description}</p>
                  <Link href="/book" className={cx('mt-6 inline-flex items-center gap-2 text-sm font-bold', tone === 'ink' ? 'text-[hsl(var(--secondary))]' : 'text-[hsl(var(--foreground))]')}>Book this care <ArrowRight size={15} /></Link>
                </div>
              );
            })}
          </div>
        </section>

        {/* Specialists */}
        <section id="specialists" className="border-y border-[hsl(var(--border))] bg-[hsl(var(--card))]">
          <div className="mx-auto max-w-7xl px-5 py-20 lg:px-8 lg:py-24">
            <div className="flex items-end justify-between gap-4">
              <div>
                <p className="text-xs font-bold uppercase tracking-[.2em] text-[hsl(var(--muted-foreground))]">People you can trust</p>
                <h2 className="mt-3 font-serif text-4xl font-semibold tracking-[-.06em]">Meet your care team.</h2>
              </div>
              <Link href="/book" className="hidden items-center gap-1 text-sm font-bold sm:inline-flex">Find a specialist <ArrowRight size={15} /></Link>
            </div>
            <div className="mt-10 grid gap-4 sm:grid-cols-3">
              {doctors.length ? doctors.map(d => <DoctorCard key={d.id} doctor={d} />) : ['Dr. Meera Sethi', 'Dr. Arjun Rao', 'Dr. Naina Kapoor'].map((name, i) => (
                <div key={name} className="rounded-2xl border border-[hsl(var(--border))] p-5">
                  <div className="grid h-14 w-14 place-items-center rounded-2xl bg-[hsl(var(--muted))] font-serif text-xl font-semibold">{initials(name)}</div>
                  <h3 className="mt-4 font-serif text-xl font-semibold">{name}</h3>
                  <p className="mt-1 text-sm text-[hsl(var(--muted-foreground))]">{['Internal Medicine', 'Cardiology', "Women's Health"][i]}</p>
                  <p className="mt-4 text-xs font-bold text-[hsl(var(--muted-foreground))]">{12 + i * 4} years experience</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Visit steps */}
        <section id="visit" className="mx-auto grid max-w-7xl gap-10 px-5 py-20 lg:grid-cols-[.9fr_1.1fr] lg:px-8 lg:py-28">
          <div>
            <p className="text-xs font-bold uppercase tracking-[.2em] text-[hsl(var(--muted-foreground))]">Your visit, made simple</p>
            <h2 className="mt-3 max-w-md font-serif text-4xl font-semibold leading-tight tracking-[-.06em]">Clear steps. No guesswork.</h2>
            <p className="mt-5 max-w-md text-sm leading-7 text-[hsl(var(--muted-foreground))]">Tell us what you need and we will help you find the right service, doctor and time. Your confirmation includes a secure QR pass for a quicker arrival.</p>
            <Link href="/book" className="mt-7 inline-flex items-center gap-2 rounded-xl bg-[hsl(var(--primary))] px-5 py-3.5 text-sm font-bold text-white">Start with a booking <ArrowRight size={16} /></Link>
          </div>
          <div className="grid gap-3 sm:grid-cols-3">
            {[['01', 'Share what you need', 'Choose a service or specialist.'], ['02', 'Pick your moment', 'See available times that work.'], ['03', 'Arrive with confidence', 'Use your QR pass at check-in.']].map(([number, title, text]) => (
              <div key={number} className="rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-5">
                <span className="font-mono text-xs font-bold text-[hsl(var(--accent-foreground))]">{number}</span>
                <h3 className="mt-16 font-serif text-xl font-semibold leading-tight">{title}</h3>
                <p className="mt-2 text-sm leading-6 text-[hsl(var(--muted-foreground))]">{text}</p>
              </div>
            ))}
          </div>
        </section>
      </main>

      <footer className="bg-[hsl(var(--primary))] text-white">
        <div className="mx-auto flex max-w-7xl flex-col gap-7 px-5 py-10 sm:flex-row sm:items-center sm:justify-between lg:px-8">
          <Link href="/" className="flex items-center gap-3">
            <span className="grid h-10 w-10 place-items-center rounded-[13px] bg-[hsl(var(--secondary))] text-[hsl(var(--foreground))] shadow-sm"><Hospital size={20} strokeWidth={2.3} /></span>
            <span className="leading-none">
              <span className="block font-serif text-[17px] font-semibold tracking-[-.04em] text-white">ASHOKA</span>
              <span className="mt-1 block text-[9px] font-bold uppercase tracking-[.21em] text-white/55">Care Hospital</span>
            </span>
          </Link>
          <div className="flex flex-wrap gap-5 text-sm text-white/65">
            <Link href="/login">Patient login</Link>
            <Link href="/book">Book an appointment</Link>
            <Link href="/dashboard/login">Staff portal</Link>
            <a href="tel:+919801685127">Call +91 98016 85127</a>
          </div>
        </div>
      </footer>
    </div>
  );
}

// ─── Book page ────────────────────────────────────────────────────────────────

const TIME_SLOTS = ['09:00', '09:30', '10:00', '10:30', '11:00', '11:30', '12:00', '14:00', '14:30', '15:00', '15:30', '16:00', '16:30', '17:00'];

function BookPage() {
  const servicesQuery = useListPublicServices({ query: { queryKey: getListPublicServicesQueryKey() } });
  const doctorsQuery = useListPublicDoctors(undefined, { query: { queryKey: getListPublicDoctorsQueryKey() } });
  const create = useCreatePublicAppointment();
  const { isSignedIn } = useAuth();
  const { user: clerkUser } = useClerkUser();
  const [, setLocation] = useLocation();

  const todayStr = new Date().toISOString().slice(0, 10);
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');

  const clerkEmail = clerkUser?.primaryEmailAddress?.emailAddress ?? '';
  const clerkName  = [clerkUser?.firstName, clerkUser?.lastName].filter(Boolean).join(' ');
  const clerkPhone = clerkUser?.primaryPhoneNumber?.phoneNumber ?? '';

  const [form, setForm] = useState({
    patientName: clerkName,
    phone: clerkPhone,
    email: clerkEmail,
    serviceId: '',
    doctorId: '',
    visitType: 'new',
    notes: '',
  });

  // Keep form in sync if Clerk user loads after initial render
  const prevEmail = form.email;
  if (clerkEmail && clerkEmail !== prevEmail) {
    setForm(p => ({ ...p, email: clerkEmail, patientName: clerkName || p.patientName, phone: clerkPhone || p.phone }));
  }

  const services = Array.isArray(servicesQuery.data) ? servicesQuery.data : [];
  const doctors = Array.isArray(doctorsQuery.data) ? doctorsQuery.data : [];
  const upd = (k: string, v: string) => setForm(p => ({ ...p, [k]: v }));

  // OTP verification state for guests
  const [otpStep, setOtpStep] = useState<'none' | 'sending' | 'verify' | 'verified'>('none');
  const [otp, setOtp] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [otpError, setOtpError] = useState('');
  const [mockOtp] = useState(() => String(Math.floor(100000 + Math.random() * 900000)));

  const sendOtp = async () => {
    if (!form.email) return;
    setOtpStep('sending');
    // In production this calls the backend; for now simulate sending
    await new Promise(r => setTimeout(r, 800));
    setOtpSent(true);
    setOtpStep('verify');
    // Dev: show OTP in console
    console.log(`[DEV] OTP for ${form.email}: ${mockOtp}`);
  };

  const verifyOtp = () => {
    if (otp === mockOtp) {
      setOtpStep('verified');
      setOtpError('');
    } else {
      setOtpError('Incorrect code. Please try again.');
    }
  };

  const canBook = isSignedIn || otpStep === 'verified';

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!canBook) { sendOtp(); return; }
    if (!form.patientName || !form.phone || !form.email || !form.serviceId || !selectedDate || !selectedTime) return;
    const scheduledAt = `${selectedDate}T${selectedTime}:00`;
    create.mutate({
      data: {
        ...form,
        scheduledAt,
        doctorId: form.doctorId || null,
        notes: form.notes || null,
        visitType: form.visitType as 'new' | 'follow_up' | 'revisit',
      },
    }, {
      onSuccess: apt => setLocation(`/confirmation/${apt.id}`),
    });
  };

  const INPUT = 'w-full rounded-xl border border-[hsl(var(--input))] bg-[hsl(var(--card))] px-3.5 py-3 text-sm outline-none transition focus:border-[hsl(var(--secondary))] focus:ring-2 focus:ring-[hsl(var(--secondary)/.25)]';

  return (
    <div className="min-h-[100dvh] bg-[hsl(var(--background))]">
      <PublicHeader />
      <main className="mx-auto max-w-7xl px-5 py-10 lg:px-8 lg:py-16">
        <div className="mb-10">
          <Link href="/" className="mb-6 inline-flex items-center gap-2 text-sm font-bold text-[hsl(var(--muted-foreground))]"><ChevronRight className="rotate-180" size={15} /> Back to Ashoka Care</Link>
          <p className="text-xs font-bold uppercase tracking-[.2em] text-[hsl(var(--muted-foreground))]">Appointment desk</p>
          <h1 className="mt-3 max-w-xl font-serif text-5xl font-semibold tracking-[-.07em]">Let's find your<br /><span className="text-[hsl(var(--muted-foreground))]">right next step.</span></h1>
        </div>

        <div className="grid gap-7 lg:grid-cols-[1.2fr_.8fr]">
          <form onSubmit={submit} className="rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-6 shadow-sm sm:p-8">
            <div className="mb-7 flex items-center justify-between">
              <div>
                <h2 className="font-serif text-xl font-semibold">Book a visit</h2>
                <p className="mt-1 text-sm text-[hsl(var(--muted-foreground))]">Usually takes under two minutes.</p>
              </div>
              <span className="grid h-10 w-10 place-items-center rounded-xl bg-[hsl(var(--secondary)/.35)]"><CalendarDays size={19} /></span>
            </div>

            <div className="grid gap-5 sm:grid-cols-2">
              {/* Name */}
              <label className="block space-y-1.5">
                <span className="text-xs font-bold">Your full name</span>
                <input required value={form.patientName} onChange={e => upd('patientName', e.target.value)} placeholder="e.g. Kavya Sharma" className={INPUT}/>
              </label>

              {/* Phone */}
              <label className="block space-y-1.5">
                <span className="text-xs font-bold">Mobile number</span>
                <input required value={form.phone} onChange={e => upd('phone', e.target.value)} placeholder="+91 98765 43210" className={INPUT}/>
              </label>

              {/* Email + OTP for guests */}
              <div className="block space-y-1.5 sm:col-span-2">
                <label className="text-xs font-bold block mb-1.5">
                  Email address
                  {isSignedIn && <span className="ml-2 text-[10px] font-bold text-green-600 bg-green-50 px-2 py-0.5 rounded-full">✓ Verified</span>}
                </label>
                <div className="flex gap-2">
                  <input
                    required type="email" value={form.email}
                    onChange={e => { upd('email', e.target.value); if (otpStep !== 'none') { setOtpStep('none'); setOtpSent(false); } }}
                    placeholder="you@example.com"
                    readOnly={!!isSignedIn || otpStep === 'verified'}
                    className={INPUT + (isSignedIn || otpStep === 'verified' ? ' opacity-70 cursor-not-allowed' : '')}
                    style={{ flex: 1 }}
                  />
                  {!isSignedIn && otpStep === 'none' && form.email && (
                    <button type="button" onClick={sendOtp} style={{ flexShrink: 0, padding: '0 14px', borderRadius: '10px', border: 'none', background: '#2F5DAA', color: '#fff', fontSize: '0.72rem', fontWeight: 700, cursor: 'pointer', whiteSpace: 'nowrap' }}>
                      Verify
                    </button>
                  )}
                  {otpStep === 'verified' && <span style={{ flexShrink: 0, display: 'flex', alignItems: 'center', color: '#16a34a', fontSize: '0.78rem', fontWeight: 700 }}>✓ Verified</span>}
                </div>
                {/* OTP input */}
                {otpStep === 'verify' && (
                  <div style={{ marginTop: '10px', padding: '14px', borderRadius: '12px', background: 'rgba(47,93,170,0.06)', border: '1px solid rgba(47,93,170,0.15)' }}>
                    <p style={{ fontSize: '0.75rem', color: '#2F5DAA', fontWeight: 600, marginBottom: '8px' }}>Enter the 6-digit code sent to {form.email}</p>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <input value={otp} onChange={e => setOtp(e.target.value)} placeholder="123456" maxLength={6}
                        style={{ flex: 1, padding: '9px 12px', borderRadius: '8px', border: '1.5px solid rgba(47,93,170,0.2)', outline: 'none', fontSize: '1.1rem', letterSpacing: '0.3em', fontWeight: 700, textAlign: 'center' }}/>
                      <button type="button" onClick={verifyOtp} style={{ padding: '9px 18px', borderRadius: '8px', border: 'none', background: '#0A1F44', color: '#fff', fontSize: '0.72rem', fontWeight: 700, cursor: 'pointer' }}>Confirm</button>
                    </div>
                    {otpError && <p style={{ fontSize: '0.72rem', color: '#dc2626', marginTop: '6px' }}>{otpError}</p>}
                    <p style={{ fontSize: '0.65rem', color: '#A0AEC0', marginTop: '6px' }}>
                      [Dev mode] Code: <strong style={{ color: '#2F5DAA' }}>{mockOtp}</strong>
                    </p>
                  </div>
                )}
                {otpStep === 'sending' && <p style={{ fontSize: '0.72rem', color: '#6B7FA3', marginTop: '6px' }}>Sending code…</p>}
                {!isSignedIn && otpStep === 'none' && (
                  <p style={{ fontSize: '0.7rem', color: '#A0AEC0', marginTop: '4px' }}>We'll verify your email before confirming the appointment.</p>
                )}
              </div>

              {/* Visit type */}
              <label className="block space-y-1.5">
                <span className="text-xs font-bold">Visit type</span>
                <select value={form.visitType} onChange={e => upd('visitType', e.target.value)} className={INPUT}>
                  <option value="new">First visit</option>
                  <option value="follow_up">Follow-up</option>
                  <option value="revisit">Revisit</option>
                </select>
              </label>

              {/* Service */}
              <label className="block space-y-1.5">
                <span className="text-xs font-bold">What would you like help with?</span>
                <select required value={form.serviceId} onChange={e => upd('serviceId', e.target.value)} className={INPUT}>
                  <option value="">Select a service</option>
                  {services.map(s => <option key={s.id} value={s.id}>{s.name}{s.startingPrice ? ` · from ${money(s.startingPrice)}` : ''}</option>)}
                  {!services.length && <option value="general-consultation">General consultation</option>}
                </select>
              </label>

              {/* Doctor */}
              <label className="block space-y-1.5">
                <span className="text-xs font-bold">Preferred specialist <span className="font-normal text-[hsl(var(--muted-foreground))]">(optional)</span></span>
                <select value={form.doctorId} onChange={e => upd('doctorId', e.target.value)} className={INPUT}>
                  <option value="">No preference</option>
                  {doctors.map(d => <option key={d.id} value={d.id}>{d.name} · {d.specialty}</option>)}
                </select>
              </label>

              {/* Date picker — no past dates */}
              <label className="block space-y-1.5">
                <span className="text-xs font-bold">Preferred date</span>
                <input
                  required type="date"
                  min={todayStr}
                  value={selectedDate}
                  onChange={e => { setSelectedDate(e.target.value); setSelectedTime(''); }}
                  className={INPUT}
                />
              </label>

              {/* Time slots */}
              {selectedDate && (
                <div className="block space-y-1.5 sm:col-span-2">
                  <span className="text-xs font-bold block mb-2">Select a time slot</span>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(90px, 1fr))', gap: '8px' }}>
                    {TIME_SLOTS.map(slot => {
                      const isSelected = selectedTime === slot;
                      // Block past slots if today
                      const now = new Date();
                      const slotDateTime = new Date(`${selectedDate}T${slot}:00`);
                      const isPast = slotDateTime <= now;
                      return (
                        <button
                          key={slot} type="button"
                          disabled={isPast}
                          onClick={() => setSelectedTime(slot)}
                          style={{
                            padding: '9px 4px', borderRadius: '10px', border: `1.5px solid ${isSelected ? '#0A1F44' : 'rgba(10,31,68,0.12)'}`,
                            background: isSelected ? '#0A1F44' : isPast ? 'rgba(10,31,68,0.03)' : '#fff',
                            color: isSelected ? '#fff' : isPast ? '#D1D5DB' : '#0A1F44',
                            fontSize: '0.8rem', fontWeight: 700, cursor: isPast ? 'not-allowed' : 'pointer',
                            transition: 'all 0.15s', textDecoration: isPast ? 'line-through' : 'none',
                          }}
                        >{slot}</button>
                      );
                    })}
                  </div>
                  {!selectedTime && <p style={{ fontSize: '0.7rem', color: '#dc2626', marginTop: '4px' }}>Please select a time slot</p>}
                </div>
              )}

              {/* Notes */}
              <label className="block space-y-1.5 sm:col-span-2">
                <span className="text-xs font-bold">Anything we should know? <span className="font-normal text-[hsl(var(--muted-foreground))]">(optional)</span></span>
                <textarea value={form.notes} onChange={e => upd('notes', e.target.value)}
                  className="min-h-24 w-full resize-y rounded-xl border border-[hsl(var(--input))] bg-[hsl(var(--card))] px-3.5 py-3 text-sm outline-none focus:border-[hsl(var(--secondary))]"
                  placeholder="A short note helps your care team prepare."/>
              </label>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={create.isPending || (otpStep === 'sending')}
              className="mt-7 w-full inline-flex items-center justify-center gap-2 rounded-xl bg-[hsl(var(--primary))] px-4 py-2.5 text-sm font-bold text-white transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg disabled:cursor-not-allowed disabled:opacity-50"
            >
              {create.isPending ? 'Confirming your visit…'
                : !canBook ? <>Verify email to continue <ArrowRight size={16} /></>
                : <>Confirm appointment <ArrowRight size={16} /></>}
            </button>
            {create.isError && (
              <p className="mt-3 text-sm font-semibold text-red-700">
                Could not confirm right now — please check all fields and try again.
              </p>
            )}
          </form>

          <aside className="space-y-4">
            <div className="rounded-2xl bg-[hsl(var(--primary))] p-6 text-white">
              <p className="text-xs font-bold uppercase tracking-[.2em] text-white/55">Before you arrive</p>
              <ul className="mt-6 space-y-5">
                {['Bring a photo ID and any previous reports.', 'Arrive 15 minutes before your appointment.', 'Your QR pass works at the front desk.'].map(item => (
                  <li key={item} className="flex gap-3 text-sm leading-6 text-white/75">
                    <Check size={17} className="mt-0.5 shrink-0 text-[hsl(var(--secondary))]" />{item}
                  </li>
                ))}
              </ul>
            </div>
            <div className="rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-6">
              <div className="flex items-center gap-3">
                <Phone size={18} />
                <div>
                  <p className="text-sm font-bold">Need help choosing?</p>
                  <p className="mt-1 text-sm text-[hsl(var(--muted-foreground))]">Our care navigators are here.</p>
                </div>
              </div>
              <a href="tel:+919801685127" className="mt-5 inline-flex text-sm font-bold underline underline-offset-4">+91 98016 85127</a>
            </div>
            {!isSignedIn && (
              <div className="rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-6">
                <p className="text-sm font-bold text-[hsl(var(--foreground))] mb-2">Already a patient?</p>
                <p className="text-xs text-[hsl(var(--muted-foreground))] mb-4">Sign in to auto-fill your details and track appointments.</p>
                <Link href="/login" className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[hsl(var(--primary))] px-4 py-2.5 text-sm font-bold text-white">
                  Sign in <ArrowRight size={14} />
                </Link>
              </div>
            )}
          </aside>
        </div>
      </main>
    </div>
  );
}

// ─── Confirmation page ────────────────────────────────────────────────────────

function ConfirmationPage() {
  const { id } = useParams<{ id: string }>();
  const code = id ? `ASH-${id.slice(-6).toUpperCase()}` : 'ASH-20481';
  return (
    <div className="min-h-[100dvh] bg-[hsl(var(--background))]">
      <PublicHeader />
      <main className="mx-auto max-w-4xl px-5 py-12 lg:px-8 lg:py-20">
        <div className="mx-auto max-w-xl text-center">
          <div className="mx-auto grid h-16 w-16 place-items-center rounded-2xl bg-[hsl(var(--secondary))]"><BadgeCheck size={30} /></div>
          <p className="mt-6 text-xs font-bold uppercase tracking-[.2em] text-[hsl(var(--muted-foreground))]">Booking confirmed</p>
          <h1 className="mt-3 font-serif text-5xl font-semibold tracking-[-.07em]">You're on the list.</h1>
          <p className="mt-4 text-sm leading-7 text-[hsl(var(--muted-foreground))]">Keep this pass handy for your visit. We've also sent the details to your email.</p>
        </div>
        <div className="relative mx-auto mt-10 max-w-2xl overflow-hidden rounded-[2rem] bg-[hsl(var(--primary))] p-6 text-white shadow-2xl sm:p-8">
          <div className="absolute -left-8 top-1/2 h-16 w-16 -translate-y-1/2 rounded-full bg-[hsl(var(--background))]" />
          <div className="absolute -right-8 top-1/2 h-16 w-16 -translate-y-1/2 rounded-full bg-[hsl(var(--background))]" />
          <div className="relative">
            <p className="text-xs font-bold uppercase tracking-[.2em] text-white/55">Your check-in code</p>
            <p className="mt-2 font-mono text-4xl font-bold tracking-[.15em]">{code}</p>
            <div className="mt-6 flex items-center gap-3">
              <Link href="/" className="inline-flex items-center gap-2 rounded-xl bg-white px-4 py-2.5 text-sm font-bold text-[hsl(var(--primary))] hover:-translate-y-0.5">Back to home <ArrowRight size={15} /></Link>
              <Link href="/book" className="inline-flex items-center gap-2 rounded-xl border border-white/20 px-4 py-2.5 text-sm font-bold text-white hover:bg-white/10">Book another</Link>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

// ─── Dashboard wrapper ────────────────────────────────────────────────────────

function DashPage({ children }: { children: React.ReactNode }) {
  return <DashboardLayout>{children}</DashboardLayout>;
}

// ─── App ──────────────────────────────────────────────────────────────────────

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <WouterRouter base={import.meta.env.BASE_URL?.replace(/\/$/, '') ?? ''}>
          <ErrorBoundary>
            <Switch>
              {/* Clerk SSO callback — handles Google OAuth redirect */}
              <Route path="/sso-callback">
                <AuthenticateWithRedirectCallback
                  signInForceRedirectUrl="/portal/dashboard"
                  signUpForceRedirectUrl="/portal/dashboard"
                />
              </Route>

              {/* Public */}
              <Route path="/">
                <PublicLayout><PublicHome /></PublicLayout>
              </Route>
              <Route path="/book">
                <PublicLayout><BookPage /></PublicLayout>
              </Route>
              <Route path="/confirmation/:id">
                <PublicLayout><ConfirmationPage /></PublicLayout>
              </Route>
              <Route path="/login" component={LoginPage} />
              <Route path="/signup" component={SignupPage} />

              {/* Patient portal */}
              <Route path="/portal/dashboard" component={PortalDashboardPage} />

              {/* Staff dashboard login (no sidebar) */}
              <Route path="/dashboard/login" component={DashboardLoginPage} />

              {/* Dashboard pages — all wrapped in DashboardLayout */}
              <Route path="/dashboard">
                <DashPage><DashboardHome /></DashPage>
              </Route>
              <Route path="/dashboard/patients">
                <DashPage><PatientsPage /></DashPage>
              </Route>
              <Route path="/dashboard/appointments">
                <DashPage><AppointmentsPage /></DashPage>
              </Route>
              <Route path="/dashboard/doctors">
                <DashPage><DoctorsPage /></DashPage>
              </Route>
              <Route path="/dashboard/opd">
                <DashPage><OpdPage /></DashPage>
              </Route>
              <Route path="/dashboard/ipd">
                <DashPage><IpdPage /></DashPage>
              </Route>
              <Route path="/dashboard/emergency">
                <DashPage><EmergencyPage /></DashPage>
              </Route>
              <Route path="/dashboard/emr">
                <DashPage><EmrPage /></DashPage>
              </Route>
              <Route path="/dashboard/laboratory">
                <DashPage><LaboratoryPage /></DashPage>
              </Route>
              <Route path="/dashboard/radiology">
                <DashPage><RadiologyPage /></DashPage>
              </Route>
              <Route path="/dashboard/pharmacy">
                <DashPage><PharmacyPage /></DashPage>
              </Route>
              <Route path="/dashboard/billing">
                <DashPage><BillingPage /></DashPage>
              </Route>
              <Route path="/dashboard/insurance">
                <DashPage><InsurancePage /></DashPage>
              </Route>
              <Route path="/dashboard/ot">
                <DashPage><OtPage /></DashPage>
              </Route>
              <Route path="/dashboard/nursing">
                <DashPage><NursingPage /></DashPage>
              </Route>
              <Route path="/dashboard/blood-bank">
                <DashPage><BloodBankPage /></DashPage>
              </Route>
              <Route path="/dashboard/inventory">
                <DashPage><InventoryPage /></DashPage>
              </Route>
              <Route path="/dashboard/notifications">
                <DashPage><NotificationsPage /></DashPage>
              </Route>
              <Route path="/dashboard/reports">
                <DashPage><ReportsPage /></DashPage>
              </Route>
              <Route path="/dashboard/admin">
                <DashPage><AdminPage /></DashPage>
              </Route>
              <Route path="/dashboard/permissions">
                <DashPage><PermissionsPage /></DashPage>
              </Route>

              <Route component={NotFound} />
            </Switch>
          </ErrorBoundary>
        </WouterRouter>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}
