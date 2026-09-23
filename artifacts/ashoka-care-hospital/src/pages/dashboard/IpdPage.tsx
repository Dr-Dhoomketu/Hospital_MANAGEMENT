import { BedDouble } from 'lucide-react';
import ModulePage from './ModulePage';

export default function IpdPage() {
  return (
    <ModulePage config={{
      title: 'IPD & beds', eyebrow: 'INPATIENT CARE',
      description: 'Track admissions, bed capacity, and discharge readiness across wards.',
      icon: BedDouble,
      metrics: [['Occupied beds', '94 / 120', '78% occupancy'], ['Pending discharge', 6, '2 summaries unsigned'], ['Isolation beds', 4, '2 in use']],
      columns: ['Bed', 'Patient', 'Ward', 'Admitted', 'Lead clinician', 'Status'],
      rows: [
        ['3B-12', 'Aarav Sharma', 'Ward 3B', 'Today', 'Dr. Arjun Mehta', 'Admitted'],
        ['2A-04', 'Maya Kapoor', 'Ward 2A', '21 Sep', 'Dr. Neha Iyer', 'Confirmed'],
        ['4C-07', '—', 'Ward 4C', '—', '—', 'Available'],
        ['ICU-03', 'Vikram Singh', 'ICU', '19 Sep', 'Dr. Arjun Mehta', 'Critical'],
      ],
      action: 'New admission',
    }} />
  );
}
