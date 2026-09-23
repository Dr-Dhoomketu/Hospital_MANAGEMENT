import { ClipboardList } from 'lucide-react';
import ModulePage from './ModulePage';

export default function OpdPage() {
  return (
    <ModulePage config={{
      title: 'OPD queue', eyebrow: 'CARE OPERATIONS',
      description: 'Move outpatient visits from arrival to consultation with a single queue view.',
      icon: ClipboardList,
      metrics: [['Waiting now', 27, 'Average wait 18 min'], ['In consultation', 8, '3 rooms active'], ['Completed today', 61, 'Since 8 AM']],
      columns: ['Queue', 'Patient', 'Service', 'Doctor', 'Wait', 'Status'],
      rows: [
        ['C-014', 'Aarav Sharma', 'Cardiology', 'Dr. Arjun Mehta', '12 min', 'Waiting'],
        ['E-008', 'Maya Kapoor', 'Endocrinology', 'Dr. Neha Iyer', 'In room', 'In consultation'],
        ['D-022', 'Rohan Desai', 'Orthopaedics', 'Dr. Sameer Rao', '25 min', 'Waiting'],
        ['G-006', 'Anita Pillai', 'General Medicine', 'Dr. Neha Iyer', '38 min', 'Waiting'],
      ],
      action: 'Add to queue',
    }} />
  );
}
