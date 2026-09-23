import { Activity } from 'lucide-react';
import ModulePage from './ModulePage';
export default function OtPage() {
  return <ModulePage config={{
    title: 'Operating theatre', eyebrow: 'SURGICAL SERVICES',
    description: 'A shared surgical board for room readiness, checklists, and case handovers.',
    icon: Activity,
    metrics: [['Cases today', 8, '2 emergency slots'], ['Rooms ready', '2 / 3', 'Theatre 2 checklist pending'], ['Avg turnaround', '42 min', 'Within target']],
    columns: ['Time', 'Patient', 'Procedure', 'Theatre', 'Lead', 'Status'],
    rows: [
      ['10:00 AM', 'Rohan Desai', 'Knee Replacement', 'Theatre 1', 'Dr. Sameer Rao', 'In Progress'],
      ['01:30 PM', 'Meera Shah', 'Appendectomy', 'Theatre 2', 'Dr. Arjun Mehta', 'Confirmed'],
      ['03:00 PM', 'Adil Khan', 'Hernia repair', 'Theatre 1', 'Dr. Sameer Rao', 'Confirmed'],
      ['05:30 PM', 'Anita Pillai', 'C-Section', 'Theatre 3', 'Dr. Sunita Verma', 'Confirmed'],
    ],
    action: 'Schedule case',
  }} />;
}
