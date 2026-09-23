import { ShieldCheck } from 'lucide-react';
import ModulePage from './ModulePage';
export default function InsurancePage() {
  return <ModulePage config={{
    title: 'Insurance desk', eyebrow: 'REVENUE CYCLE',
    description: 'Follow eligibility, authorizations, and claims before they become patient friction.',
    icon: ShieldCheck,
    metrics: [['Awaiting eligibility', 9, 'Oldest 43 min'], ['Authorizations', 14, '5 need documents'], ['Claims this month', 284, '96.8% clean rate']],
    columns: ['Case', 'Patient', 'Payer', 'Service', 'Updated', 'Status'],
    rows: [
      ['INS-761', 'Aarav Sharma', 'HealthSecure', 'Cardiology', 'Today, 09:10', 'Pending'],
      ['INS-760', 'Maya Kapoor', 'MediCare Plus', 'OPD consult', 'Today, 08:56', 'Approved'],
      ['INS-759', 'Rohan Desai', 'HealthSecure', 'Orthopaedics', 'Yesterday', 'Confirmed'],
      ['INS-758', 'Anita Pillai', 'CareFirst', 'Gynaecology', 'Yesterday', 'Pending'],
    ],
    action: 'Start verification',
  }} />;
}
