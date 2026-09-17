'use client';

import { useMemo, useState } from 'react';
import { Eye, Trash2, Printer, FileSpreadsheet, Search, CalendarDays, X, Copy } from 'lucide-react';
import { Bill, money } from '@/lib/data';
import { useStore } from '@/lib/store';
import { useSiteSettings } from '@/lib/site-settings';
import { Panel, Toolbar } from '@/components/Panel';

const A4_W = 794;
const A4_H = 1123;

function monthBounds(): [string, string] {
  const d = new Date(); const y = d.getFullYear(); const m = String(d.getMonth() + 1).padStart(2, '0');
  const last = new Date(y, d.getMonth() + 1, 0).getDate();
  return [`${y}-${m}-01`, `${y}-${m}-${String(last).padStart(2, '0')}`];
}

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

function downloadExcel(rows: Bill[], from: string, to: string, includeProfit: boolean) {
  const header = includeProfit
    ? '<th>Bill No</th><th>Customer</th><th>Mobile</th><th>Total Amount</th><th>Payment</th><th>Expense</th><th>Profit</th><th>Date</th>'
    : '<th>Bill No</th><th>Customer</th><th>Mobile</th><th>Total Amount</th><th>Payment</th><th>Date</th>';
  const body = rows.map(b => includeProfit
    ? `<tr><td>${b.billNo}</td><td>${b.customer.name}</td><td>${b.customer.mobile}</td><td>${b.total ?? b.subtotal}</td><td>${b.payment}</td><td>${b.expense}</td><td>${b.profit}</td><td>${b.date}</td></tr>`
    : `<tr><td>${b.billNo}</td><td>${b.customer.name}</td><td>${b.customer.mobile}</td><td>${b.total ?? b.subtotal}</td><td>${b.payment}</td><td>${b.date}</td></tr>`
  ).join('');
  const html = `<html><head><meta charset="UTF-8"><style>table{border-collapse:collapse}th,td{padding:7px;border:1px solid #999}</style></head><body><h2>Travel Story - Bills Report</h2><p>${from} to ${to}</p><table><thead><tr>${header}</tr></thead><tbody>${body}</tbody></table></body></html>`;
  const blob = new Blob([html], { type: 'application/vnd.ms-excel' }); const url = URL.createObjectURL(blob); const a = document.createElement('a'); a.href = url; a.download = `travel-story-bills-${from}-to-${to}.xls`; a.click(); URL.revokeObjectURL(url);
}

export default function Bills() {
  const { bills, setBills, role, toast } = useStore();
  const site = useSiteSettings();
  const [viewBill, setViewBill] = useState<Bill | null>(null);
  const [query, setQuery] = useState(''); const [from, setFrom] = useState(() => monthBounds()[0]); const [to, setTo] = useState(() => monthBounds()[1]);
  const data = useMemo(() => { const q = query.toLowerCase(); return bills.filter(b => `${b.billNo} ${b.customer.name} ${b.customer.mobile}`.toLowerCase().includes(q) && b.date >= from && b.date <= to); }, [bills, query, from, to]);

  async function copyBillImage(b: Bill) {
    try {
      const canvas = await createReceiptImage(b, site.storeName, site.logo);
      const blob = await new Promise<Blob>((resolve, reject) => canvas.toBlob(x => x ? resolve(x) : reject(new Error('Image conversion failed')), 'image/png', 1));
      if (!navigator.clipboard?.write || !('ClipboardItem' in window)) throw new Error('Image clipboard unsupported');
      await navigator.clipboard.write([new ClipboardItem({ 'image/png': blob })]);
      toast('✓ Bill image copied to clipboard');
    } catch { toast('Could not copy receipt image. Please allow clipboard access in Chrome/Edge.'); }
  }

  async function printBill(b: Bill) {
    try {
      const canvas = await createReceiptImage(b, site.storeName, site.logo);
      const dataUrl = canvas.toDataURL('image/png', 1);
      const printWindow = window.open('', '_blank', 'width=900,height=1200');
      if (!printWindow) { toast('Please allow pop-ups to print the bill'); return; }
      printWindow.document.write(`<!doctype html><html><head><title>${b.billNo}</title><style>@page{size:A4;margin:0}html,body{margin:0;padding:0;background:#fff}body{width:210mm}img{display:block;width:210mm;height:297mm;object-fit:fill;margin:0 auto}@media print{img{width:210mm;height:297mm}}</style></head><body><img src="${dataUrl}" alt="Travel Story receipt" /></body></html>`);
      printWindow.document.close(); printWindow.focus(); setTimeout(() => printWindow.print(), 250);
    } catch { toast('Could not prepare the bill for printing'); }
  }

  function printReport() {
    setViewBill(null);
    window.setTimeout(() => window.print(), 60);
  }

  async function removeBill(id: number) {
    if (!confirm('Delete this bill permanently?')) return;
    try {
      const res = await fetch('/api/site-settings?resource=bill', { method: 'DELETE', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id }), cache: 'no-store' });
      const payload = await res.json().catch(() => ({}));
      if (!res.ok) { toast(payload.error || 'Bill could not be deleted from cloud storage'); return; }
      setBills(current => current.filter(b => b.id !== id));
      setViewBill(current => current?.id === id ? null : current);
      toast('✓ Bill deleted permanently');
    } catch { toast('Bill deletion failed — check your internet connection'); }
  }

  function resetMonth() { const [start, end] = monthBounds(); setFrom(start); setTo(end); setQuery(''); }

  return <>
    <Toolbar title="Bills & History" subtitle="Current-month bills are shown by default. Search older bills with dates." />
    <Panel>
      <div className="report-filter-card">
        <div className="date-field"><CalendarDays size={16} /><label>From<input type="date" value={from} onChange={e => setFrom(e.currentTarget.value)} /></label></div>
        <div className="date-field"><CalendarDays size={16} /><label>To<input type="date" value={to} onChange={e => setTo(e.currentTarget.value)} /></label></div>
        <div className="search-box dark"><Search /><input value={query} onChange={e => setQuery(e.currentTarget.value)} placeholder="Search bill, customer or mobile..." /></div>
        <button onClick={resetMonth}>This Month</button><button className="primary-btn" onClick={printReport}><Printer size={16} /> Print Report / PDF</button><button className="ghost-btn" onClick={() => downloadExcel(data, from, to, role === 'admin')}><FileSpreadsheet size={16} /> Excel</button>
      </div>
      <div className="report-summary"><b>{data.length} bill(s)</b><span>{from} → {to}</span></div>
      <div className="table-card"><table><thead><tr><th>Bill No</th><th>Customer</th><th>Mobile</th><th>Total Amount</th><th>Payment</th>{role === 'admin' && <><th>Expense</th><th>Profit</th></>}<th>Date</th><th className="report-action">Action</th></tr></thead>
        <tbody>{data.map(b => <tr key={b.id}><td><b>{b.billNo}</b></td><td>{b.customer.name}</td><td>{b.customer.mobile}</td><td>{money(b.total ?? b.subtotal)}</td><td>{b.payment}</td>{role === 'admin' && <><td>{money(b.expense)}</td><td>{money(b.profit)}</td></>}<td>{b.date}</td><td className="report-action"><div className="row-actions"><button title="View bill" onClick={() => setViewBill(b)}><Eye size={15} /></button><button title="Print bill" onClick={() => printBill(b)}><Printer size={15} /></button><button title="Copy receipt image" onClick={() => copyBillImage(b)}><Copy size={15} /></button><button className="danger" title="Delete permanently" onClick={() => removeBill(b.id)}><Trash2 size={15} /></button></div></td></tr>)}</tbody>
      </table>{!data.length && <p className="empty">No bills found for this date range.</p>}</div>
    </Panel>

    {viewBill && <div className="overlay no-print"><div className="receipt-modal"><div className="receipt-actions no-print"><button className="primary-btn" onClick={() => printBill(viewBill)}><Printer /> Print / Save PDF</button><button className="ghost-btn" onClick={() => copyBillImage(viewBill)}><Copy /> Copy Receipt Image</button><button onClick={() => setViewBill(null)}><X /></button></div>
      <div className="receipt"><h2>Travel Story</h2><p>SALES RECEIPT</p><hr /><p>Bill No: <b>{viewBill.billNo}</b></p><p>Customer: <b>{viewBill.customer.name}</b> · {viewBill.customer.mobile}</p><p>Place: {viewBill.customer.place || '-'}</p><p>Date: {viewBill.date}</p>
        <table><thead><tr><th>Product</th><th>Qty</th><th>Price</th><th>Total</th></tr></thead><tbody>{viewBill.items.map(i => <tr key={i.productId}><td>{i.name}</td><td>{i.qty}</td><td>{money(i.price)}</td><td>{money(i.total)}</td></tr>)}</tbody></table>
        <div className="receipt-total"><span>Subtotal</span><b>{money(viewBill.subtotal)}</b>{viewBill.discount > 0 && <><span>Discount</span><b>{money(viewBill.discount)}</b></>}<span>Total Amount</span><b>{money(viewBill.total ?? viewBill.subtotal)}</b><span>Paid</span><b>{money(viewBill.paid)}</b><span>Balance</span><b>{money(viewBill.balance)}</b></div>
      </div></div></div>}

    <style jsx global>{`
      .report-filter-card{display:grid;grid-template-columns:150px 150px minmax(220px,1fr) auto auto auto;gap:9px;align-items:end;margin-bottom:13px;padding:12px;background:#f5f8f6;border:1px solid var(--line);border-radius:11px}.date-field{display:flex;gap:7px;align-items:center;color:var(--green)}.date-field label{flex:1;margin:0}.date-field input{margin-top:4px}.report-summary{display:flex;justify-content:space-between;align-items:center;margin:8px 0 12px;padding:8px 10px;background:#edf8f1;border-radius:8px;font-size:9px;color:var(--muted)}.report-summary b{color:var(--green)}
      @media(max-width:1000px){.report-filter-card{grid-template-columns:1fr 1fr}.report-filter-card .search-box{width:auto;grid-column:1/-1}}@media(max-width:620px){.report-filter-card{grid-template-columns:1fr}.report-filter-card .search-box{grid-column:auto}.report-filter-card button{width:100%}}
      @page{size:A4;margin:10mm}@media print{body{background:#fff!important}.sidebar,.admin-header,.page-toolbar,.no-print,.report-filter-card,.report-summary,.toast{display:none!important}.main-area{margin:0!important}.content{padding:0!important}.panel{border:0!important;padding:0!important}.table-card{overflow:visible!important}.report-action{display:none!important}.table-card table{width:100%!important}.table-card th,.table-card td{font-size:10px!important}.table-card{box-shadow:none!important;border:0!important}.receipt{display:none!important}}
    `}</style>
  </>;
}
