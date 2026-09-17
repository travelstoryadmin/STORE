'use client';

import Link from 'next/link';
import { useRef, useState } from 'react';
import { Pencil, Plus, Search, Trash2, Upload, Image as ImageIcon, X, RefreshCw, Layers3, Printer, FileSpreadsheet } from 'lucide-react';
import { categories as seedCategories, Product, money, seedProducts } from '@/lib/data';
import { useStore } from '@/lib/store';
import { Panel, Toolbar } from '@/components/Panel';

function downloadProductsExcel(rows: Product[]) {
  const body = rows.map(p => `<tr><td>${p.name}</td><td>${p.category}</td><td>${p.price}</td><td>${p.expense}</td><td>${p.stock}</td></tr>`).join('');
  const html = `<html><head><meta charset="UTF-8"></head><body><h2>Travel Story - Products Report</h2><table border="1"><thead><tr><th>Product</th><th>Category</th><th>Selling Price</th><th>Expense / Cost</th><th>Stock</th></tr></thead><tbody>${body}</tbody></table></body></html>`;
  const blob = new Blob([html], { type: 'application/vnd.ms-excel' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `travel-story-products-${new Date().toISOString().slice(0, 10)}.xls`;
  a.click();
  URL.revokeObjectURL(url);
}

export default function Products() {
  const { products, setProducts, toast, role, categories } = useStore();
  const blank: Product = { id: 0, name: '', category: categories[0] || seedCategories[0], price: 0, expense: 0, stock: 0, image: '', active: true };
  const [form, setForm] = useState<Product>(blank);
  const [edit, setEdit] = useState<number | null>(null);
  const [q, setQ] = useState('');
  const fileRef = useRef<HTMLInputElement>(null);
  const data = products.filter(p => (p.name + ' ' + p.category).toLowerCase().includes(q.toLowerCase()));

  function save() {
    if (!form.name || !form.price) { toast('Enter product name and price'); return; }
    if (edit !== null) setProducts(v => v.map(p => p.id === edit ? { ...form, id: edit } : p));
    else setProducts(v => [...v, { ...form, id: Date.now() }]);
    setForm({ ...blank, category: categories[0] || seedCategories[0] });
    setEdit(null);
    toast(edit !== null ? 'Product updated' : 'Product added');
  }

  function remove(id: number) {
    if (confirm('Delete this product?')) { setProducts(v => v.filter(p => p.id !== id)); toast('Product deleted'); }
  }

  function chooseImage(file?: File) {
    if (!file) return;
    if (!file.type.startsWith('image/')) { toast('Please select an image file'); return; }
    if (file.size > 3 * 1024 * 1024) { toast('Image must be 3MB or smaller'); return; }
    const reader = new FileReader();
    reader.onload = () => setForm(v => ({ ...v, image: String(reader.result || '') }));
    reader.readAsDataURL(file);
  }

  function restoreDemo() {
    if (confirm('Add the demo products again? Existing products will be kept.')) {
      setProducts(v => {
        const existing = new Set(v.map(p => p.name.toLowerCase()));
        const add = seedProducts.filter(p => !existing.has(p.name.toLowerCase())).map(p => ({ ...p, id: Date.now() + Math.floor(Math.random() * 100000) }));
        return [...v, ...add];
      });
    }
  }

  const grouped = categories.map(c => ({ category: c, items: data.filter(p => p.category === c) })).filter(g => g.items.length);
  const uncategorized = data.filter(p => !categories.includes(p.category));

  const productTable = (rows: Product[]) => (
    <div className="table-card">
      <table>
        <thead><tr><th>Image</th><th>Name</th><th>Price</th>{role === 'admin' && <th>Expense</th>}<th>Stock</th><th className="no-print">Action</th></tr></thead>
        <tbody>{rows.map(p => (
          <tr key={p.id}>
            <td>{p.image ? <img className="thumb" src={p.image} alt={p.name} /> : <div className="thumb-placeholder"><ImageIcon size={16} /></div>}</td>
            <td><b>{p.name}</b></td>
            <td>{money(p.price)}</td>
            {role === 'admin' && <td>{money(p.expense)}</td>}
            <td>{p.stock}</td>
            <td className="no-print"><div className="row-actions"><button onClick={() => { setForm(p); setEdit(p.id); }}><Pencil size={15} /></button><button className="danger" onClick={() => remove(p.id)}><Trash2 size={15} /></button></div></td>
          </tr>
        ))}</tbody>
      </table>
    </div>
  );

  return (
    <>
      <Toolbar title="Products" subtitle="Add, edit and manage products shown on the customer homepage" />
      <div className="two-col">
        <Panel>
          <div className="products-form-head"><h3>{edit !== null ? 'Edit Product' : 'Add New Product'}</h3><Link href="/admin/categories" className="ghost-btn"><Layers3 size={14} /> Manage Categories</Link></div>
          <div className="form-grid">
            <label>Category<select value={form.category} onChange={e => setForm({ ...form, category: e.target.value })}>{categories.map(c => <option key={c}>{c}</option>)}</select></label>
            <label>Product Name<input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="e.g. Premium Oud" /></label>
            <label>Selling Price (₹)<input type="number" value={form.price || ''} onChange={e => setForm({ ...form, price: Number(e.target.value) })} /></label>
            {role === 'admin' && <label>Expense / Cost (₹)<input type="number" value={form.expense || ''} onChange={e => setForm({ ...form, expense: Number(e.target.value) })} /></label>}
            <label>Stock Quantity<input type="number" value={form.stock || ''} onChange={e => setForm({ ...form, stock: Number(e.target.value) })} /></label>
            <label>Image URL <span className="muted-label">(optional)</span><input value={form.image.startsWith('data:') ? '' : form.image} onChange={e => setForm({ ...form, image: e.target.value })} placeholder="https://..." /></label>
          </div>
          <div className="product-image-upload" onClick={() => fileRef.current?.click()}>
            <input ref={fileRef} type="file" accept="image/png,image/jpeg,image/webp,image/gif" hidden onChange={e => chooseImage(e.target.files?.[0])} />
            {form.image ? <div className="image-preview-wrap"><img src={form.image} className="product-preview" alt="Product preview" /><button type="button" className="remove-image" onClick={e => { e.stopPropagation(); setForm(v => ({ ...v, image: '' })); if (fileRef.current) fileRef.current.value = ''; }}><X size={15} /></button><div className="upload-overlay"><Upload size={18} /> Change image</div></div> : <><div className="upload-icon"><ImageIcon size={28} /><Upload size={15} /></div><b>Upload Product Image</b><span>Click to choose JPG, PNG, WEBP or GIF</span><small>Maximum 3MB</small></>}
          </div>
          <div className="modal-actions"><button onClick={() => { setForm({ ...blank, category: categories[0] || seedCategories[0] }); setEdit(null); if (fileRef.current) fileRef.current.value = ''; }}>Clear</button><button className="primary-btn" onClick={save}><Plus /> {edit !== null ? 'Update Product' : 'Add Product'}</button></div>
        </Panel>
        <Panel>
          <div className="products-report-toolbar"><div className="search-box dark"><Search /><input value={q} onChange={e => setQ(e.target.value)} placeholder="Search products..." /></div><div className="report-buttons"><button className="primary-btn" onClick={() => window.print()}><Printer size={16} /> Print Report / PDF</button><button className="ghost-btn" onClick={() => downloadProductsExcel(data)}><FileSpreadsheet size={16} /> Download Excel</button></div></div>
          {data.length === 0 ? <div className="empty-state"><div className="empty-icon"><ImageIcon size={28} /></div><h3>No products found</h3><p>Your demo products may have been cleared from this browser.</p><button className="primary-btn" onClick={restoreDemo}><RefreshCw size={16} /> Restore Demo Products</button></div> : <div className="product-report-list">
            {grouped.map(g => <section className="product-category-section" key={g.category}><div className="product-category-heading"><i></i><div><small>CATEGORY</small><h3>{g.category}</h3><span>{g.items.length} product(s)</span></div><i></i></div>{productTable(g.items)}</section>)}
            {uncategorized.length > 0 && <section className="product-category-section"><div className="product-category-heading"><i></i><div><small>CATEGORY</small><h3>Other / Uncategorized</h3><span>{uncategorized.length} product(s)</span></div><i></i></div>{productTable(uncategorized)}</section>}
          </div>}
        </Panel>
      </div>
      <style jsx global>{`
        .products-form-head{display:flex;justify-content:space-between;align-items:center;gap:10px;margin-bottom:13px}.products-form-head h3{margin:0}.products-report-toolbar{display:flex;justify-content:space-between;gap:10px;align-items:center;margin-bottom:8px}.report-buttons{display:flex;gap:7px;flex-wrap:wrap}.product-category-section{margin:18px 0 26px}.product-category-section:first-child{margin-top:4px}.product-category-heading{display:grid;grid-template-columns:1fr auto 1fr;gap:12px;align-items:center;margin:8px 0 10px}.product-category-heading i{height:1px;background:linear-gradient(90deg,transparent,var(--gold),transparent)}.product-category-heading div{text-align:center;min-width:170px}.product-category-heading small{font-size:7px;letter-spacing:2px;color:var(--gold);font-weight:800}.product-category-heading h3{margin:3px 0;font:600 17px 'Playfair Display',serif;color:var(--green)}.product-category-heading span{font-size:8px;color:var(--muted)}@media(max-width:700px){.products-report-toolbar{display:block}.report-buttons{margin-top:8px}.report-buttons button{flex:1}.product-category-heading h3{font-size:15px}.product-category-heading div{min-width:145px}}@media print{body{background:#fff!important}.sidebar,.admin-header,.page-toolbar,.products-report-toolbar,.no-print,.two-col>.panel:first-child{display:none!important}.main-area{margin:0!important}.content{padding:0!important}.two-col{display:block!important}.panel{border:0!important;padding:0!important}.product-category-section{break-inside:avoid;margin:16px 0 24px}.product-category-heading i{background:#999!important}.product-category-heading h3{color:#111!important}.table-card{overflow:visible!important}.thumb{width:35px;height:35px}.table-card th{background:#eee!important}}
      `}</style>
    </>
  );
}
