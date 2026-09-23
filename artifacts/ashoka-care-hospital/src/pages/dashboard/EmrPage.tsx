import { FileText } from 'lucide-react';
import ModulePage from './ModulePage';
export default function EmrPage() {
  return <ModulePage config={{
    title: 'Medical records', eyebrow: 'CLINICAL RECORDS',
    description: "Review a patient's care timeline, documents, orders, and signed clinical notes.",
    icon: FileText,
    metrics: [['Records updated', 46, 'Since yesterday'], ['Awaiting signature', 7, 'Across 4 departments'], ['Documents filed', 129, 'This month']],
    columns: ['Patient', 'Record type', 'Department', 'Updated', 'Owner', 'Status'],
    rows: [
      ['Aarav Sharma', 'Consultation note', 'Cardiology', 'Today, 16:32', 'Dr. Arjun Mehta', 'Signed'],
      ['Maya Kapoor', 'Operative note', 'Surgery', 'Today, 08:58', 'Dr. Sameer Rao', 'Signed'],
      ['Rohan Desai', 'Lab result', 'Laboratory', 'Today, 08:42', 'Lab Tech', 'Confirmed'],
      ['Anita Pillai', 'Care plan', 'Gynaecology', '22 Sep, 11:05', 'Dr. Sunita Verma', 'Signed'],
    ],
    action: 'Create record',
  }} />;
}
