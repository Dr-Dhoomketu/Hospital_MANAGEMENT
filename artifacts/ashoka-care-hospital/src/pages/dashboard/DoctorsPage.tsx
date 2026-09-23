import { useState } from 'react';
import { Stethoscope, Search } from 'lucide-react';
import { useListPublicDoctors } from '@workspace/api-client-react';
import { PageIntro, StatusPill } from '@/components/DashboardShared';

function initials(name: string) { return name.split(' ').map(p => p[0]).slice(0, 2).join('').toUpperCase(); }

const DEMO = [
  { id: 'd1', name: 'Dr. Arjun Mehta', role: 'Consultant Cardiologist', department: 'Heart & Vascular', specialization: 'Interventional Cardiology', status: 'Available', nextAvailable: '09:30 AM', appointmentsToday: 14, experienceYears: 18 },
  { id: 'd2', name: 'Dr. Neha Iyer', role: 'Consultant Physician', department: 'General Medicine', specialization: 'Internal Medicine', status: 'Available', nextAvailable: '10:15 AM', appointmentsToday: 11, experienceYears: 12 },
  { id: 'd3', name: 'Dr. Sameer Rao', role: 'Senior Orthopaedic Surgeon', department: 'Bone & Joint', specialization: 'Joint Replacement', status: 'In consultation', nextAvailable: '01:00 PM', appointmentsToday: 9, experienceYears: 15 },
  { id: 'd4', name: 'Dr. Sunita Verma', role: 'Consultant Gynaecologist', department: "Women's Health", specialization: 'Obstetrics', status: 'Available', nextAvailable: 'Now', appointmentsToday: 7, experienceYears: 14 },
  { id: 'd5', name: 'Dr. Rajan Pillai', role: 'Consultant Neurologist', department: 'Neuro Sciences', specialization: 'Neurology', status: 'On leave', nextAvailable: 'Tomorrow', appointmentsToday: 0, experienceYears: 20 },
  { id: 'd6', name: 'Nurse Priya Sharma', role: 'Head Nurse', department: 'Nursing', specialization: 'Critical Care', status: 'Available', nextAvailable: 'Now', appointmentsToday: 0, experienceYears: 8 },
];

export default function DoctorsPage() {
  const [query, setQuery] = useState('');
  const [dept, setDept] = useState('All departments');
  const depts = ['All departments', ...new Set(DEMO.map(d => d.department))];
  const filtered = DEMO.filter(s =>
    (dept === 'All departments' || s.department === dept) &&
    `${s.name} ${s.specialization}`.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <>
      <PageIntro eyebrow="PEOPLE & CAPACITY" title="Doctors & staff"
        description="See who is available, where they work, and how much capacity is already committed."
        action="Add staff member" />

      <div className="mb-5 flex flex-col gap-3 md:flex-row">
        <div className="relative flex-1">
          <Search size={17} className="absolute left-3 top-3 text-muted-foreground" />
          <input value={query} onChange={e => setQuery(e.target.value)} className="field pl-10" placeholder="Search staff or specialization" />
        </div>
        <select value={dept} onChange={e => setDept(e.target.value)} className="field md:w-52">
          {depts.map(d => <option key={d}>{d}</option>)}
        </select>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {filtered.map(s => (
          <div key={s.id} className="lift rounded-xl border border-border bg-card p-5 soft-shadow">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="avatar avatar-lg">{initials(s.name)}</div>
                <div>
                  <h3 className="font-bold">{s.name}</h3>
                  <p className="text-xs text-muted-foreground">{s.role}</p>
                </div>
              </div>
              <StatusPill status={s.status === 'Available' ? 'Available' : s.status === 'In consultation' ? 'In consultation' : 'On leave'} />
            </div>
            <div className="mt-5 border-t border-border pt-4 space-y-3">
              {[['Department', s.department], ['Specialization', s.specialization], ['Experience', `${s.experienceYears} years`], ['Next available', s.nextAvailable]].map(([k, v]) => (
                <div key={k} className="flex justify-between text-xs">
                  <span className="text-muted-foreground">{k}</span>
                  <span className="font-semibold">{v}</span>
                </div>
              ))}
            </div>
            <button className="mt-5 w-full rounded-lg border border-border py-2 text-xs font-semibold hover:bg-muted">
              View availability · {s.appointmentsToday} today
            </button>
          </div>
        ))}
      </div>
    </>
  );
}
