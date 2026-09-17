'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { Check, Minus, Plus, Printer, Trash2, MessageCircle, RotateCw } from 'lucide-react';
import { Bill, BillItem, Customer, money, today } from '@/lib/data';
import { useStore } from '@/lib/store';
import { useSiteSettings } from '@/lib/site-settings';
import { Panel, Toolbar } from '@/components/Panel';

const A4_W = 794;
const A4_H = 1123;

function loadImage(src: string) {
  return new Promise<HTMLImageElement>((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = reject;
    image.src = src;
  });
}

function drawWrapped(ctx: CanvasRenderingContext2D, text: string, x: number, y: number, maxWidth: number, lineHeight: number) {
  const words = text.split(/\s+/);
  let line = '';
  for (const word of words) {
    const test = line ? `${line} ${word}` : word;
    if (ctx.measureText(test).width > maxWidth && line) {
      ctx.fillText(line, x, y);
      y += lineHeight;
      line = word;
    } else line = test;
  }
  if (line) { ctx.fillText(line, x, y); y += lineHeight; }
  return y;
}

async function createReceiptImage(bill: Bill, storeName: string, logoSrc: string) {
  const canvas = document.createElement('canvas');
  canvas.width = A4_W;
  canvas.height = A4_H;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Canvas unavailable');

  ctx.fillStyle = '#fff';
  ctx.fillRect(0, 0, A4_W, A4_H);
  const margin = 38;
  const right = A4_W - margin;

  const gradient = ctx.createLinearGradient(0, 0, A4_W, 0);
  gradient.addColorStop(0, '#123f2c');
  gradient.addColorStop(.52, '#2f7d55');
  gradient.addColorStop(1, '#c79a42');
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, A4_W, 14);

  ctx.fillStyle = '#f8fbf9';
  ctx.fillRect(margin, 30, right - margin, 104);
  try {
    const logo = await loadImage(logoSrc || '/travel-story-logo.jpeg');
    ctx.drawImage(logo, margin + 18, 40, 82, 82);
  } catch {}

  ctx.fillStyle = '#173b2a';
  ctx.font = '700 30px Georgia, serif';
  ctx.fillText(storeName || 'Travel Story', margin + 118, 70);
  ctx.fillStyle = '#a57a2d';
  ctx.font = '700 12px Arial, sans-serif';
  ctx.fillText('SALES RECEIPT', margin + 120, 94);
  ctx.fillStyle = '#5e6d65';
  ctx.font = '500 11px Arial, sans-serif';
  ctx.fillText('Thank you for choosing us', margin + 120, 114);

  ctx.strokeStyle = '#d6c28f';
  ctx.lineWidth = 2;
  ctx.beginPath(); ctx.moveTo(margin, 148); ctx.lineTo(right, 148); ctx.stroke();

  let y = 178;
  ctx.fillStyle = '#173b2a';
  ctx.font = '700 13px Arial, sans-serif';
  ctx.fillText('Bill No', margin, y); ctx.fillText('Date', 438, y);
  ctx.font = '600 13px Arial, sans-serif';
  ctx.fillText(bill.billNo, margin + 72, y); ctx.fillText(bill.date, 478, y);
  y += 28;
  ctx.font = '700 13px Arial, sans-serif'; ctx.fillText('Customer', margin, y);
  ctx.font = '600 13px Arial, sans-serif'; ctx.fillText(bill.customer.name, margin + 72, y);
  y += 25;
  ctx.font = '700 13px Arial, sans-serif'; ctx.fillText('Mobile', margin, y);
  ctx.font = '600 13px Arial, sans-serif'; ctx.fillText(bill.customer.mobile, margin + 72, y);
  ctx.font = '700 13px Arial, sans-serif'; ctx.fillText('Place', 438, y);
  ctx.font = '600 13px Arial, sans-serif'; ctx.fillText(bill.customer.place || '-', 478, y);
  y += 40;

  ctx.fillStyle = '#edf6f0';
  ctx.fillRect(margin, y - 20, right - margin, 36);
  ctx.fillStyle = '#173b2a';
  ctx.font = '700 12px Arial, sans-serif';
  ctx.fillText('PRODUCT', margin + 10, y + 2);
  ctx.fillText('QTY', 505, y + 2);
  ctx.fillText('PRICE', 575, y + 2);
  ctx.fillText('TOTAL', 675, y + 2);
  y += 32;

  ctx.font = '500 12px Arial, sans-serif';
  for (const item of bill.items) {
    const rowTop = y - 14;
    const startY = y;
    ctx.fillStyle = '#26372e';
    const afterName = drawWrapped(ctx, item.name, margin + 10, startY, 410, 16);
    const rowHeight = Math.max(30, afterName - startY + 8);
    ctx.fillText(String(item.qty), 510, startY);
    ctx.fillText(money(item.price), 575, startY);
    ctx.font = '700 12px Arial, sans-serif'; ctx.fillText(money(item.total), 675, startY);
    ctx.font = '500 12px Arial, sans-serif';
    ctx.strokeStyle = '#e2e9e4'; ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(margin, rowTop + rowHeight); ctx.lineTo(right, rowTop + rowHeight); ctx.stroke();
    y += rowHeight;
  }

  y += 28;
  const summaryX = 485;
  const summaryRow = (label: string, value: string, strong = false) => {
    ctx.fillStyle = strong ? '#173b2a' : '#56665d';
    ctx.font = `${strong ? '700' : '600'} ${strong ? 16 : 13}px Arial, sans-serif`;
    ctx.fillText(label, summaryX, y);
    ctx.textAlign = 'right'; ctx.fillText(value, right, y); ctx.textAlign = 'left';
    y += strong ? 31 : 25;
  };
  summaryRow('Subtotal', money(bill.subtotal));
  if (bill.discount > 0) summaryRow('Discount', money(bill.discount));
  summaryRow('Total Amount', money(bill.total ?? bill.subtotal), true);
  summaryRow('Paid Amount', money(bill.paid));
  summaryRow('Balance', money(bill.balance));
  summaryRow('Payment', bill.payment);

  y += 30;
  ctx.fillStyle = '#f3ead7'; ctx.fillRect(margin, y - 16, right - margin, 2);
  y += 30;
  ctx.textAlign = 'center';
  ctx.fillStyle = '#2f7d55'; ctx.font = '700 15px Georgia, serif';
  ctx.fillText('Thank you for shopping with us!', A4_W / 2, y);
  ctx.fillStyle = '#a57a2d'; ctx.font = '12px Arial, sans-serif';
  ctx.fillText('Travel Story', A4_W / 2, y + 23);
  ctx.textAlign = 'left';
  return canvas;
}

export default function Sales() {
  const { products, customers, setProducts, setCustomers, setBills, toast } = useStore();
  const site = useSiteSettings();
  const nameRef = useRef<HTMLInputElement>(null);
  const [name, setName] = useState('');
  const [mobile, setMobile] = useState('');
  const [place, setPlace] = useState('');
  const [productId, setProductId] = useState('');
  const [qty, setQty] = useState(1);
  const [payment, setPayment] = useState<'Cash' | 'GPay / UPI' | 'Credit'>('Cash');
  const [received, setReceived] = useState('');
  const [discount, setDiscount] = useState('');
  const [items, setItems] = useState<BillItem[]>([]);
  const [done, setDone] = useState<Bill | null>(null);
  const [saving, setSaving] = useState(false);
  const [paidTouched, setPaidTouched] = useState(false);
  const [selectedCustomerId, setSelectedCustomerId] = useState<number | null>(null);

  const found = customers.find(c => c.mobile === mobile);
  const nameMatches = !selectedCustomerId && name.trim().length >= 4 ? customers.filter(c => c.name.toLowerCase().includes(name.trim().toLowerCase())).slice(0, 8) : [];
  const mobileMatches = !selectedCustomerId && mobile.trim().length >= 4 ? customers.filter(c => c.mobile.includes(mobile.trim())).slice(0, 8) : [];
  const subtotal = useMemo(() => items.reduce((sum, item) => sum + item.total, 0), [items]);
  const expense = useMemo(() => items.reduce((sum, item) => sum + item.expense * item.qty, 0), [items]);
  const discountAmount = Math.min(Math.max(0, Number(discount) || 0), subtotal);
  const total = Math.max(0, subtotal - discountAmount);
  const balance = Math.max(0, total - (Number(received) || 0));

  useEffect(() => { if (!paidTouched) setReceived(total > 0 ? String(total) : ''); }, [total, paidTouched]);

  function selectCustomer(customer: Customer) {
    setSelectedCustomerId(customer.id); setName(customer.name); setMobile(customer.mobile); setPlace(customer.place);
  }

  function add() {
    const product = products.find(p => p.id === Number(productId));
    if (!product || qty < 1) return;
    const existing = items.find(i => i.productId === product.id); const newQty = (existing?.qty || 0) + qty;
    if (newQty > product.stock) { toast(`Only ${product.stock} available`); return; }
    if (existing) setItems(c => c.map(i => i.productId === product.id ? { ...i, qty: newQty, total: newQty * i.price } : i));
    else setItems(c => [...c, { productId: product.id, name: product.name, qty, price: product.price, expense: product.expense, total: product.price * qty }]);
    setQty(1);
  }

  function decrease(id: number) { setItems(c => c.flatMap(i => { if (i.productId !== id) return [i]; if (i.qty <= 1) return []; const q = i.qty - 1; return [{ ...i, qty: q, total: q * i.price }]; })); }
  function increase(id: number) {
    const product = products.find(p => p.id === id); if (!product) return;
    setItems(c => c.map(i => { if (i.productId !== id) return i; if (i.qty >= product.stock) { toast(`Only ${product.stock} available`); return i; } const q = i.qty + 1; return { ...i, qty: q, total: q * i.price }; }));
  }

  function resetEntry() {
    setItems([]); setName(''); setMobile(''); setPlace(''); setReceived(''); setDiscount(''); setPayment('Cash'); setProductId(''); setQty(1); setPaidTouched(false); setSelectedCustomerId(null);
    requestAnimationFrame(() => nameRef.current?.focus());
  }

  function clear() { resetEntry(); setDone(null); toast('Bill cleared'); }

  async function copyBillImage(bill: Bill | null = done) {
    if (!bill) { toast('Complete the bill first'); return; }
    try {
      const canvas = await createReceiptImage(bill, site.storeName, site.logo);
      const blob = await new Promise<Blob>((resolve, reject) => canvas.toBlob(b => b ? resolve(b) : reject(new Error('Image conversion failed')), 'image/png', 1));
      if (!navigator.clipboard?.write || !('ClipboardItem' in window)) throw new Error('Image clipboard is not supported');
      await navigator.clipboard.write([new ClipboardItem({ 'image/png': blob })]);
      toast('✓ Bill image copied to clipboard');
    } catch { toast('Could not copy receipt image. Please allow clipboard access in Chrome/Edge.'); }
  }

  async function printBill(bill: Bill | null = done) {
    if (!bill) { toast('Complete the bill first'); return; }
    try {
      const canvas = await createReceiptImage(bill, site.storeName, site.logo);
      const dataUrl = canvas.toDataURL('image/png', 1);
      const printWindow = window.open('', '_blank', 'width=900,height=1200');
      if (!printWindow) { toast('Please allow pop-ups to print the bill'); return; }
      printWindow.document.write(`<!doctype html><html><head><title>${bill.billNo}</title><style>@page{size:A4;margin:0}html,body{margin:0;padding:0;background:#fff}body{width:210mm}img{display:block;width:210mm;height:297mm;object-fit:fill;margin:0 auto}@media print{img{width:210mm;height:297mm}}</style></head><body><img src="${dataUrl}" alt="Travel Story receipt" /></body></html>`);
      printWindow.document.close(); printWindow.focus(); setTimeout(() => printWindow.print(), 250);
    } catch { toast('Could not prepare the bill for printing'); }
  }

  async function complete() {
    if (saving) return;
    if (!name || !mobile || !items.length) { toast('Enter customer and add products'); return; }
    const existing = found; const customer: Customer = existing || { id: Date.now(), name, mobile, place, balance: 0 };
    const bill: Bill = { id: Date.now(), billNo: `NC-${String(Date.now()).slice(-5)}`, date: today(), customer, items, subtotal, discount: discountAmount, total, paid: Number(received) || 0, balance, payment, expense, profit: total - expense, status: 'Completed' };
    setSaving(true);
    try {
      const res = await fetch('/api/site-settings?resource=bill', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id: bill.id, billNo: bill.billNo, billDate: new Date().toISOString().slice(0, 10), customer, items, subtotal, discount: discountAmount, total, paid: Number(received) || 0, payment, expense, profit: total - expense }), cache: 'no-store' });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) { toast(data.error || 'Bill was not saved to cloud'); return; }
      setBills(c => [bill, ...c]);
      setProducts(c => c.map(product => { const item = items.find(line => line.productId === product.id); return item ? { ...product, stock: product.stock - item.qty } : product; }));
      setCustomers(c => { const nextBalance = payment === 'Credit' ? customer.balance + balance : Math.max(0, customer.balance - balance); if (existing) return c.map(x => x.mobile === mobile ? { ...x, name, place, balance: nextBalance } : x); return [...c, { ...customer, balance: nextBalance }]; });
      setDone(bill);
      resetEntry();
      toast('✓ Bill Successfully Completed');
    } catch { toast('Bill save failed — check your internet connection'); }
    finally { setSaving(false); }
  }

  const suggestionList = (list: Customer[]) => list.length > 0 ? <div className="customer-suggestions" role="listbox">{list.map(customer => <button key={customer.id} type="button" role="option" className="customer-suggestion" onMouseDown={e => e.preventDefault()} onClick={() => selectCustomer(customer)}><span className="suggestion-name">{customer.name}</span><span className="suggestion-meta">{customer.mobile} <i>•</i> {customer.place || 'Place not added'}</span></button>)}</div> : null;

  return <>
    <Toolbar title="Sales / Billing" subtitle="Create a bill, apply discount, update stock and complete payment" />
    <div className="billing-layout">
      <Panel><h3>Customer Details</h3>
        <label>Customer Name<div className="autocomplete-wrap"><input ref={nameRef} value={name} onChange={e => { setName(e.target.value); setSelectedCustomerId(null); }} autoComplete="off" />{suggestionList(nameMatches)}</div></label>
        <label>Mobile Number<div className="autocomplete-wrap inline"><input value={mobile} onChange={e => { setMobile(e.target.value.replace(/\D/g, '')); setSelectedCustomerId(null); }} autoComplete="off" inputMode="numeric" /><button className="icon-btn" onClick={() => found && selectCustomer(found)} type="button" title="Find customer"><RotateCw size={16} /></button>{suggestionList(mobileMatches)}</div></label>
        <label>Place<input value={place} onChange={e => setPlace(e.target.value)} /></label>
        <div className="balance-box">Previous Credit Balance <b>{money(found?.balance || 0)}</b></div>
      </Panel>
      <Panel><h3>Add Items</h3><div className="add-line"><select value={productId} onChange={e => setProductId(e.target.value)}><option value="">Select product</option>{products.map(product => <option key={product.id} value={product.id}>{product.name} · {money(product.price)} · Stock {product.stock}</option>)}</select><input type="number" min="1" value={qty} onChange={e => setQty(Number(e.target.value))} /><button className="primary-btn" onClick={add} type="button"><Plus /> Add</button></div><div className="bill-items">{items.map(item => <div className="bill-row" key={item.productId}><span><b>{item.name}</b><small>{money(item.price)} each</small></span><button onClick={() => decrease(item.productId)} type="button"><Minus /></button><b>{item.qty}</b><button onClick={() => increase(item.productId)} type="button"><Plus /></button><strong>{money(item.total)}</strong><button className="danger" onClick={() => setItems(c => c.filter(line => line.productId !== item.productId))} type="button"><Trash2 size={14} /></button></div>)}</div></Panel>
      <Panel className="summary"><h3>Bill Summary</h3><div className="total-box"><span>Total Amount</span><strong>{money(total)}</strong></div><div className="summary-list"><span>Subtotal <b>{money(subtotal)}</b></span><span>Discount <input className="discount-input" type="number" min="0" max={subtotal} step="1" placeholder="₹ 0" value={discount} onChange={e => setDiscount(e.target.value)} /></span><span>Total Items <b>{items.reduce((sum, item) => sum + item.qty, 0)}</b></span><span>Payment<select value={payment} onChange={e => setPayment(e.target.value as 'Cash' | 'GPay / UPI' | 'Credit')}><option>Cash</option><option>GPay / UPI</option><option>Credit</option></select></span><span>Amount Paid<input type="number" min="0" value={received} onChange={e => { setPaidTouched(true); setReceived(e.target.value); }} /></span><span>Balance <b>{money(balance)}</b></span></div><div className="summary-actions"><button onClick={clear} type="button">Clear</button><button className="summary-icon-btn" onClick={() => printBill()} type="button" title="Print last completed bill" aria-label="Print last completed bill"><Printer size={17} /></button><button className="summary-icon-btn whatsapp-icon" onClick={() => copyBillImage()} type="button" title="Copy last completed bill image" aria-label="Copy last completed bill image"><MessageCircle size={18} /></button><button className="primary-btn" onClick={complete} type="button" disabled={saving}><Check />{saving ? 'Saving...' : 'Complete Bill'}</button></div></Panel>
    </div>
    <style jsx global>{`
      .customer-suggestions{position:absolute;left:0;right:0;top:calc(100% + 4px);z-index:80;background:#fff;border:1px solid #d9e4dd;border-radius:10px;box-shadow:0 12px 28px rgba(20,55,38,.14);padding:4px;max-height:260px;overflow-y:auto}.autocomplete-wrap{position:relative}.customer-suggestion{display:flex!important;flex-direction:column!important;align-items:flex-start!important;gap:2px;width:100%;padding:10px 11px;border:0;border-radius:7px;background:transparent;text-align:left;cursor:pointer}.customer-suggestion:hover,.customer-suggestion:focus{background:#eef8f1;outline:none}.suggestion-name{font-size:13px;font-weight:700;color:#173b2a}.suggestion-meta{font-size:11px;color:#6d7e74}.suggestion-meta i{font-style:normal;margin:0 3px;color:#91a198}
      .summary-actions{display:flex;align-items:center;gap:7px;flex-wrap:nowrap}.summary-actions .summary-icon-btn{width:36px;height:36px;padding:0;display:inline-flex;align-items:center;justify-content:center;border:1px solid var(--line);border-radius:8px;background:#fff;cursor:pointer}.summary-actions .summary-icon-btn:hover{transform:translateY(-1px)}.summary-actions .whatsapp-icon{color:#15803d;border-color:#b8dec5;background:#f0fbf3}.summary-actions .primary-btn{margin-left:auto}
      @media(max-width:620px){.summary-actions{gap:5px}.summary-actions .summary-icon-btn{width:34px;height:34px}.summary-actions .primary-btn{padding-inline:10px}}
    `}</style>
  </>;
}
