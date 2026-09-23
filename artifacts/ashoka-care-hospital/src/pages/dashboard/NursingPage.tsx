import { HeartPulse } from 'lucide-react';
import ModulePage from './ModulePage';
export default function NursingPage() {
  return <ModulePage config={{
    title: 'Nursing operations', eyebrow: 'CARE TEAM',
    description: 'Make rounds, vitals, and handover tasks visible to every nurse on shift.',
    icon: HeartPulse,
    metrics: [['Vitals due', 12, 'Next 30 minutes'], ['Round completion', '74%', 'Across 4 wards'], ['Open tasks', 19, '4 high priority']],
    columns: ['Task', 'Patient / Ward', 'Due', 'Nurse', 'Priority', 'Status'],
    rows: [
      ['Vitals round', 'Ward 3B · Aarav Sharma', '09:30 AM', 'Nurse Priya', 'High', 'Pending'],
      ['Medication round', 'Ward 2A', '10:00 AM', 'Nurse Anjali', 'Routine', 'Confirmed'],
      ['Care plan review', 'ICU · Vikram Singh', '10:15 AM', 'Nurse Priya', 'High', 'Open'],
      ['Handover note', 'Ward 4C', '11:00 AM', 'Nurse Meena', 'Routine', 'Open'],
    ],
    action: 'Assign task',
  }} />;
}
