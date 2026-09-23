import { Boxes } from 'lucide-react';
import ModulePage from './ModulePage';
export default function InventoryPage() {
  return <ModulePage config={{
    title: 'Inventory', eyebrow: 'SUPPLY CHAIN',
    description: "See what's on hand, what's running low, and which requests need a decision.",
    icon: Boxes,
    metrics: [['Stock items', '1,248', 'Across 6 locations'], ['Reorder alerts', 17, '5 critical'], ['Open requests', 23, '8 awaiting approval']],
    columns: ['Item', 'Category', 'On hand', 'Reorder at', 'Location', 'Status'],
    rows: [
      ['Nitrile gloves · M', 'Consumables', '420 boxes', '120 boxes', 'Central store', 'Healthy'],
      ['IV cannula · 20G', 'Consumables', '86 packs', '100 packs', 'Central store', 'Pending'],
      ['Insulin syringe', 'Diabetes care', '44 packs', '50 packs', 'Pharmacy', 'Pending'],
      ['Surgical mask', 'Consumables', '1,840 boxes', '400 boxes', 'Central store', 'Healthy'],
    ],
    action: 'Create request',
  }} />;
}
