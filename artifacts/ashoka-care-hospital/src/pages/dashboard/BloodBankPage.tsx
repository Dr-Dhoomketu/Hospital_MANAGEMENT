import { TestTube2 } from 'lucide-react';
import ModulePage from './ModulePage';
export default function BloodBankPage() {
  return <ModulePage config={{
    title: 'Blood bank', eyebrow: 'TRANSFUSION SERVICES',
    description: 'Track units, reservations, and expiry risk with a precise inventory view.',
    icon: TestTube2,
    metrics: [['Available units', 142, 'Across 8 groups'], ['Reserved', 18, '7 for today'], ['Expiry alerts', 3, 'Within 72 hours']],
    columns: ['Unit', 'Group', 'Component', 'Expiry', 'Location', 'Status'],
    rows: [
      ['BLD-8841', 'O−', 'Packed RBC', '25 Sep 2026', 'Cold room A', 'Pending'],
      ['BLD-8840', 'B+', 'Platelets', '24 Sep 2026', 'Cold room B', 'Confirmed'],
      ['BLD-8839', 'AB+', 'Plasma', '07 Oct 2026', 'Cold room A', 'Available'],
      ['BLD-8838', 'A+', 'Packed RBC', '10 Oct 2026', 'Cold room A', 'Available'],
    ],
    action: 'Reserve unit',
  }} />;
}
