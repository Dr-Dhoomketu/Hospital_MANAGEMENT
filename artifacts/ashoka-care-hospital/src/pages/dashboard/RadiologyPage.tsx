import { Microscope } from 'lucide-react';
import ModulePage from './ModulePage';
export default function RadiologyPage() {
  return <ModulePage config={{
    title: 'Radiology', eyebrow: 'DIAGNOSTICS',
    description: 'Coordinate imaging slots, acquisition, and reporting from one calm queue.',
    icon: Microscope,
    metrics: [['Studies today', 24, '6 awaiting report'], ['Scanner uptime', '98.4%', 'No incidents'], ['Reports signed', 18, '75% complete']],
    columns: ['Study', 'Patient', 'Modality', 'Slot', 'Radiologist', 'Status'],
    rows: [
      ['RAD-318', 'Rohan Desai', 'MRI Knee', '10:30 AM', 'Dr. Gupta', 'Confirmed'],
      ['RAD-317', 'Vikram Singh', 'CT Chest', '09:45 AM', 'Dr. Gupta', 'In Progress'],
      ['RAD-316', 'Anita Pillai', 'Ultrasound', '09:20 AM', 'Dr. Mehta', 'Ready'],
      ['RAD-315', 'Maya Kapoor', 'X-ray', 'Tomorrow', 'Dr. Gupta', 'Confirmed'],
    ],
    action: 'Book study',
  }} />;
}
