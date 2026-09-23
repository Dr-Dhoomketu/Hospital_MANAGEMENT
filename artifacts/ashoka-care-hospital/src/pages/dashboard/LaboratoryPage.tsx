import { FlaskConical } from 'lucide-react';
import ModulePage from './ModulePage';
export default function LaboratoryPage() {
  return <ModulePage config={{
    title: 'Laboratory', eyebrow: 'DIAGNOSTICS',
    description: 'Keep lab orders moving and give clinicians a confident result verification queue.',
    icon: FlaskConical,
    metrics: [['Orders today', 68, '+9 vs yesterday'], ['Ready to verify', 12, '3 critical results'], ['Collected', 54, '79% of orders']],
    columns: ['Order', 'Patient', 'Test panel', 'Collected', 'Priority', 'Status'],
    rows: [
      ['LAB-8821', 'Aarav Sharma', 'Electrolytes', '08:12', 'Critical', 'Confirmed'],
      ['LAB-8820', 'Maya Kapoor', 'Lipid profile', '07:45', 'Routine', 'Confirmed'],
      ['LAB-8819', 'Rohan Desai', 'CBC', '07:30', 'Routine', 'In Progress'],
      ['LAB-8818', 'Anita Pillai', 'HbA1c', 'Yesterday', 'Routine', 'Ready'],
    ],
    action: 'New lab order',
  }} />;
}
