import { Pill } from 'lucide-react';
import ModulePage from './ModulePage';
export default function PharmacyPage() {
  return <ModulePage config={{
    title: 'Pharmacy', eyebrow: 'MEDICATIONS',
    description: 'Process prescriptions, keep dispensing visible, and act before stock becomes a care delay.',
    icon: Pill,
    metrics: [['To dispense', 31, '8 high priority'], ['Ready for pickup', 18, 'Average 11 min'], ['Low stock items', 7, '3 reorder requests']],
    columns: ['Rx', 'Patient', 'Medication', 'Prescriber', 'Quantity', 'Status'],
    rows: [
      ['RX-4902', 'Aarav Sharma', 'Amlodipine 5mg', 'Dr. Arjun Mehta', '30 tabs', 'Ready'],
      ['RX-4901', 'Maya Kapoor', 'Paracetamol 500mg', 'Dr. Neha Iyer', '20 tabs', 'In Progress'],
      ['RX-4900', 'Rohan Desai', 'Diclofenac 75mg', 'Dr. Sameer Rao', '10 tabs', 'Ready'],
      ['RX-4899', 'Anita Pillai', 'Metformin 500mg', 'Dr. Neha Iyer', '60 tabs', 'Pending'],
    ],
    action: 'New prescription',
  }} />;
}
