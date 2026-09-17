'use client';

import { useMemo, useState } from 'react';
import { Eye, MessageCircle, Trash2, Printer, FileSpreadsheet, Search, CalendarDays, X } from 'lucide-react';
import { Bill, money, WA_NUMBER } from '@/lib/data';
import { useStore } from '@/lib/store';
import { Panel, Toolbar } from '@/components/Panel';

function monthBounds(): [string, string] {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const last = new Date(y, d.getMonth() + 1, 0).getDate();
  return [`${y}-${m}-01`, `${y}-${m}-${String(last).padStart(2, '0')}`];
}

function downloadExcel(rows: Bill[], from: string, to: string) {
  const body = rows.map((b) => `
    <tr><td>${b.billNo}</td><td>${b.customer.name}</td><td>${b.customer.mobile}</td>
    <td>${b.customer.place || ''}</td><td>${b.subtotal}</td><td>${b.paid}</td>
    <td>${b.balance}</td><td>${b.payment}</td><td>${b.date}</td></tr>`).join('');
  const html = `<html><head><meta charset="UTF-8"></head><body>
    <h2>Travel Story - Bills Report</h2><p>${from} to ${to}</p>
    <table border="1"><thead><tr><th>Bill No</th><th>Customer</th><th>Mobile</th><th>Place</th>
    <th>Total</th><th>Paid</th><th>Balance</th><th>Payment</th><th>Date</th></tr></thead>
    <tbody>${body}</tbody></table></body></html>`;
  const blob = new Blob([html], { type: 'application/vnd.ms-excel' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `travel-story-bills-${from}-to-${to}.xls`;
  a.click();
  URL.revokeObjectURL(url);
}

export default function Bills() {
  const { bills, setBills, role, toast } = useStore();
  const [viewBill, setViewBill] = useState<Bill | null>(null);
  const [query, setQuery] = useState<string>('');
  const [from, setFrom] = useState<string>(() => monthBounds()[0]);
  const [to, setTo] = useState<string>(() => monthBounds()[1]);

  const data = useMemo(() => {
    const q = query.toLowerCase();
    return bills.filter((b) => {
      const text = `${b.billNo} ${b.customer.name} ${b.customer.mobile}`.toLowerCase();
      return text.includes(q) && b.date >= from && b.date <= to;
    });
  }, [bills, query, from, to]);

  function share(b: Bill) {
    const text = `Travel Story\n${b.billNo}\nCustomer: ${b.customer.name}\n${b.items.map((i) => `${i.name} x ${i.qty} = ${money(i.total)}`).join('\n')}\nTotal Amount: ${money(b.subtotal)}\nPaid: ${money(b.paid)}\nBalance: ${money(b.balance)}`;
    navigator.clipboard?.writeText(text);
    toast('Bill copied to clipboard');
    window.open(`https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(text)}`, '_blank');
  }

  function removeBill(id: number) {
    if (!confirm('Delete this bill?')) return;
    setBills((current) => current.filter((b) => b.id !== id));
    toast('Bill deleted');
  }

  function resetMonth() {
    const [start, end] = monthBounds();
    setFrom(start);
    setTo(end);
    setQuery('');
  }

  return (
    <>
      <Toolbar title="Bills & History" subtitle="Current-month bills are shown by default. Search older bills with dates." />
      <Panel>
        <div className="report-filter-card">
          <div className="date-field"><CalendarDays size={16} /><label>From<input type="date" value={from} onChange={(e) => setFrom(e.currentTarget.value)} /></label></div>
          <div className="date-field"><CalendarDays size={16} /><label>To<input type="date" value={to} onChange={(e) => setTo(e.currentTarget.value)} /></label></div>
          <div className="search-box dark"><Search /><input value={query} onChange={(e) => setQuery(e.currentTarget.value)} placeholder="Search bill, customer or mobile..." /></div>
          <button onClick={resetMonth}>This Month</button>
          <button className="primary-btn" onClick={() => window.print()}><Printer size={16} /> Print Report / PDF</button>
          <button className="ghost-btn" onClick={() => downloadExcel(data, from, to)}><FileSpreadsheet size={16} /> Excel</button>
        </div>

        <div className="report-summary"><b>{data.length} bill(s)</b><span>{from} → {to}</span></div>
        <div className="table-card">
          <table>
            <thead><tr><th>Bill No</th><th>Customer</th><th>Mobile</th><th>Total Amount</th><th>Payment</th>{role === 'admin' && <><th>Expense</th><th>Profit</th></>}<th>Date</th><th>Action</th></tr></thead>
            <tbody>{data.map((b) => (
              <tr key={b.id}>
                <td><b>{b.billNo}</b></td><td>{b.customer.name}</td><td>{b.customer.mobile}</td><td>{money(b.subtotal)}</td><td>{b.payment}</td>
                {role === 'admin' && <><td>{money(b.expense)}</td><td>{money(b.profit)}</td></>}
                <td>{b.date}</td>
                <td><div className="row-actions"><button title="View / Print" onClick={() => setViewBill(b)}><Eye size={15} /></button><button title="WhatsApp" onClick={() => share(b)}><MessageCircle size={15} /></button><button className="danger" title="Delete" onClick={() => removeBill(b.id)}><Trash2 size={15} /></button></div></td>
              </tr>
            ))}</tbody>
          </table>
          {!data.length && <p className="empty">No bills found for this date range.</p>}
        </div>
      </Panel>

      {viewBill && (
        <div className="overlay">
          <div className="receipt-modal">
            <div className="receipt-actions no-print">
              <button className="primary-btn" onClick={() => window.print()}><Printer /> Print / Save PDF</button>
              <button className="ghost-btn" onClick={() => downloadExcel([viewBill], viewBill.date, viewBill.date)}><FileSpreadsheet /> Excel</button>
              <button className="wa-btn" onClick={() => share(viewBill)}><MessageCircle /> Share on WhatsApp</button>
              <button onClick={() => setViewBill(null)}><X /></button>
            </div>
            <div className="receipt print-report">
              <h2>Travel Story</h2><p>SALES RECEIPT</p><hr />
              <p>Bill No: <b>{viewBill.billNo}</b></p>
              <p>Customer: <b>{viewBill.customer.name}</b> · {viewBill.customer.mobile}</p>
              <p>Date: {viewBill.date}</p>
              <table><thead><tr><th>Product</th><th>Qty</th><th>Price</th><th>Total</th></tr></thead>
                <tbody>{viewBill.items.map((i) => <tr key={i.productId}><td>{i.name}</td><td>{i.qty}</td><td>{money(i.price)}</td><td>{money(i.total)}</td></tr>)}</tbody>
              </table>
              <div className="receipt-total"><span>Total Amount</span><b>{money(viewBill.subtotal)}</b><span>Paid</span><b>{money(viewBill.paid)}</b><span>Balance</span><b>{money(viewBill.balance)}</b></div>
            </div>
          </div>
        </div>
      )}

      <style jsx global>{`
        .report-filter-card{display:grid;grid-template-columns:150px 150px minmax(220px,1fr) auto auto auto;gap:9px;align-items:end;margin-bottom:13px;padding:12px;background:#f5f8f6;border:1px solid var(--line);border-radius:11px}
        .date-field{display:flex;gap:7px;align-items:center;color:var(--green)}.date-field label{flex:1;margin:0}.date-field input{margin-top:4px}
        .report-summary{display:flex;justify-content:space-between;align-items:center;margin:8px 0 12px;padding:8px 10px;background:#edf8f1;border-radius:8px;font-size:9px;color:var(--muted)}.report-summary b{color:var(--green)}
        @media(max-width:1000px){.report-filter-card{grid-template-columns:1fr 1fr}.report-filter-card .search-box{width:auto;grid-column:1/-1}}
        @media(max-width:620px){.report-filter-card{grid-template-columns:1fr}.report-filter-card .search-box{grid-column:auto}.report-filter-card button{width:100%}}
        @media print{body{background:#fff!important}.sidebar,.admin-header,.page-toolbar,.no-print,.report-filter-card,.report-summary,.toast{display:none!important}.main-area{margin:0!important}.content{padding:0!important}.panel{border:0!important;padding:0!important}.table-card{overflow:visible!important}.table-card table{font-size:9px}.table-card th{background:#eee!important}.overlay{position:static!important;background:#fff!important;padding:0!important}.receipt-modal{width:100%!important;max-height:none!important;padding:0!important;border-radius:0!important;overflow:visible!important}.receipt{border:0!important;max-width:100%!important;padding:20px!important}.print-report{display:block!important}}
      `}</style>
    </>
  );
}
