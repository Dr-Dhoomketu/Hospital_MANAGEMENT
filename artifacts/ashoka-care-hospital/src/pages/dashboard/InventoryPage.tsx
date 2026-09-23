import { useState } from 'react';
import { Boxes } from 'lucide-react';
import { PageIntro, MetricCard, Modal } from '@/components/DashboardShared';

const CATS = ['Consumables','PPE','Linen','Equipment','Pharmacy','Diagnostics'];

export default function InventoryPage() {
  const [items, setItems] = useState([
    { id:'I001', name:'Surgical Gloves (L)', category:'Consumables', stock:1200, min:500, unit:'pairs',  supplier:'MedSupply Co.' },
    { id:'I002', name:'Syringes 5ml',        category:'Consumables', stock:3400, min:1000,unit:'pcs',    supplier:'HealthPro India' },
    { id:'I003', name:'IV Cannula 20G',      category:'Consumables', stock:80,   min:200, unit:'pcs',    supplier:'MedSupply Co.' },
    { id:'I004', name:'Surgical Mask N95',   category:'PPE',         stock:450,  min:300, unit:'pcs',    supplier:'SafeGuard Ltd.' },
    { id:'I005', name:'Hospital Bed Sheets', category:'Linen',       stock:220,  min:100, unit:'sets',   supplier:'CleanCare' },
    { id:'I006', name:'Oxygen Cylinder',     category:'Equipment',   stock:12,   min:20,  unit:'cylinders',supplier:'GasPure' },
  ]);
  const [search, setSearch] = useState('');
  const [catFilter, setCatFilter] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ name:'', category:'Consumables', stock:'', min:'', unit:'', supplier:'' });
  const upd = (k: string, v: string) => setForm(p => ({ ...p, [k]: v }));

  const addItem = (e: React.FormEvent) => {
    e.preventDefault();
    setItems(prev => [...prev, { id:`I${String(prev.length+10).padStart(3,'0')}`, name:form.name, category:form.category, stock:parseInt(form.stock)||0, min:parseInt(form.min)||0, unit:form.unit, supplier:form.supplier }]);
    setShowModal(false); setForm({ name:'', category:'Consumables', stock:'', min:'', unit:'', supplier:'' });
  };

  const filtered = items.filter(i => (!search || i.name.toLowerCase().includes(search.toLowerCase())) && (!catFilter || i.category === catFilter));
  const lowStock = items.filter(i => i.stock < i.min).length;

  return (
    <>
      <PageIntro eyebrow="SUPPLY CHAIN" title="Inventory"
        description="See what's on hand, what's running low, and which requests need a decision."
        action="Add item" onAction={() => setShowModal(true)} />

      <div className="grid gap-4 md:grid-cols-3 mb-5">
        <MetricCard label="Total items" value={items.length} hint="Across all categories" icon={Boxes} />
        <MetricCard label="Low stock alerts" value={lowStock} hint="Below minimum level" icon={Boxes} tone={lowStock > 0 ? 'red' : 'teal'} />
        <MetricCard label="Categories" value={CATS.length} hint="Across 6 locations" icon={Boxes} tone="blue" />
      </div>

      {lowStock > 0 && (
        <div className="mb-4 flex items-center gap-3 rounded-xl border border-destructive/25 bg-destructive/5 px-4 py-3 text-sm font-bold text-destructive">
          ⚠️ {lowStock} item{lowStock > 1 ? 's' : ''} below minimum stock level — reorder needed
        </div>
      )}

      <div className="flex gap-3 mb-4 flex-wrap">
        <div className="relative flex-1 min-w-[200px]">
          <input value={search} onChange={e => setSearch(e.target.value)} className="field pl-8" placeholder="Search items…" />
        </div>
        <select value={catFilter} onChange={e => setCatFilter(e.target.value)} className="field w-auto">
          <option value="">All Categories</option>
          {CATS.map(c => <option key={c}>{c}</option>)}
        </select>
      </div>

      <div className="rounded-xl border border-border bg-card soft-shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="data-table">
            <thead><tr><th>Item</th><th>Category</th><th>Stock</th><th>Min Level</th><th>Supplier</th><th>Status</th><th className="text-right">Action</th></tr></thead>
            <tbody>
              {filtered.map(item => {
                const low = item.stock < item.min;
                return (
                  <tr key={item.id} className={low ? 'bg-destructive/2' : ''}>
                    <td className="font-semibold">{item.name}</td>
                    <td><span className="rounded px-2 py-0.5 text-xs font-medium bg-secondary text-secondary-foreground">{item.category}</span></td>
                    <td><span className={`font-bold ${low ? 'text-destructive' : 'text-foreground'}`}>{item.stock}</span><span className="text-xs text-muted-foreground ml-1">{item.unit}</span></td>
                    <td className="text-xs text-muted-foreground">{item.min} {item.unit}</td>
                    <td className="text-xs text-muted-foreground">{item.supplier}</td>
                    <td><span className={`status-pill ${low ? 'status-warn' : 'status-good'}`}><span className="h-1.5 w-1.5 rounded-full bg-current"/>{low ? 'Low Stock' : 'Healthy'}</span></td>
                    <td className="text-right">
                      <button onClick={() => setItems(prev => prev.map(i => i.id === item.id ? { ...i, stock: i.stock + i.min * 3 } : i))}
                        className="rounded-lg border border-border px-2.5 py-1.5 text-xs font-semibold hover:bg-muted">Restock</button>
                    </td>
                  </tr>
                );
              })}
              {filtered.length === 0 && <tr><td colSpan={7} className="py-10 text-center text-sm text-muted-foreground">No items found</td></tr>}
            </tbody>
          </table>
        </div>
      </div>

      {showModal && (
        <Modal title="Add Inventory Item" onClose={() => setShowModal(false)}>
          <form onSubmit={addItem} className="space-y-4">
            <label className="field-label">Item Name *<input required value={form.name} onChange={e => upd('name', e.target.value)} className="field" /></label>
            <div className="grid grid-cols-2 gap-4">
              <label className="field-label">Category
                <select value={form.category} onChange={e => upd('category', e.target.value)} className="field">
                  {CATS.map(c => <option key={c}>{c}</option>)}
                </select>
              </label>
              <label className="field-label">Unit<input value={form.unit} onChange={e => upd('unit', e.target.value)} className="field" placeholder="pcs / boxes" /></label>
              <label className="field-label">Current Stock *<input required type="number" value={form.stock} onChange={e => upd('stock', e.target.value)} className="field" /></label>
              <label className="field-label">Min Level *<input required type="number" value={form.min} onChange={e => upd('min', e.target.value)} className="field" /></label>
            </div>
            <label className="field-label">Supplier<input value={form.supplier} onChange={e => upd('supplier', e.target.value)} className="field" /></label>
            <button className="w-full rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground">Add Item</button>
          </form>
        </Modal>
      )}
    </>
  );
}
