'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { Check, Minus, Plus, Printer, Trash2, MessageCircle, RotateCw, Heart, Copy, X } from 'lucide-react';
import { Bill, BillItem, Customer, money, today } from '@/lib/data';
import { useStore } from '@/lib/store';
import { useSiteSettings } from '@/lib/site-settings';
import { Panel, Toolbar } from '@/components/Panel';

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
  const [copyMessage, setCopyMessage] = useState(false);

  const found = customers.find(c => c.mobile === mobile);
  const nameMatches = name.trim().length >= 4
    ? customers.filter(c => c.name.toLowerCase().includes(name.trim().toLowerCase())).slice(0, 8)
    : [];
  const mobileMatches = mobile.trim().length >= 4
    ? customers.filter(c => c.mobile.includes(mobile.trim())).slice(0, 8)
    : [];
  const subtotal = useMemo(() => items.reduce((sum, item) => sum + item.total, 0), [items]);
  const expense = useMemo(() => items.reduce((sum, item) => sum + item.expense * item.qty, 0), [items]);
  const discountAmount = Math.min(Math.max(0, Number(discount) || 0), subtotal);
  const total = Math.max(0, subtotal - discountAmount);
  const balance = Math.max(0, total - (Number(received) || 0));

  useEffect(() => {
    if (!paidTouched) setReceived(total > 0 ? String(total) : '');
  }, [total, paidTouched]);

  function selectCustomer(customer: Customer) {
    setName(customer.name);
    setMobile(customer.mobile);
    setPlace(customer.place);
  }

  function lookup() {
    if (found) selectCustomer(found);
  }

  function add() {
    const product = products.find(p => p.id === Number(productId));
    if (!product || qty < 1) return;
    const existing = items.find(i => i.productId === product.id);
    const newQty = (existing?.qty || 0) + qty;
    if (newQty > product.stock) { toast(`Only ${product.stock} available`); return; }
    if (existing) setItems(c => c.map(i => i.productId === product.id ? { ...i, qty: newQty, total: newQty * i.price } : i));
    else setItems(c => [...c, { productId: product.id, name: product.name, qty, price: product.price, expense: product.expense, total: product.price * qty }]);
    setQty(1);
  }

  function decrease(id: number) {
    setItems(c => c.flatMap(i => {
      if (i.productId !== id) return [i];
      if (i.qty <= 1) return [];
      const q = i.qty - 1;
      return [{ ...i, qty: q, total: q * i.price }];
    }));
  }

  function increase(id: number) {
    const product = products.find(p => p.id === id);
    if (!product) return;
    setItems(c => c.map(i => {
      if (i.productId !== id) return i;
      if (i.qty >= product.stock) { toast(`Only ${product.stock} available`); return i; }
      const q = i.qty + 1;
      return { ...i, qty: q, total: q * i.price };
    }));
  }

  function resetEntry(keepDone = false) {
    setItems([]); setName(''); setMobile(''); setPlace(''); setReceived(''); setDiscount('');
    setPayment('Cash'); setProductId(''); setQty(1); setPaidTouched(false); setCopyMessage(false);
    if (!keepDone) setDone(null);
    requestAnimationFrame(() => nameRef.current?.focus());
  }

  function clear() {
    resetEntry(false);
    toast('Bill cleared');
  }

  function receiptText(bill: Bill) {
    return [
      site.storeName, 'SALES RECEIPT', `Bill No: ${bill.billNo}`,
      `Customer: ${bill.customer.name}`, `Mobile: ${bill.customer.mobile}`, `Place: ${bill.customer.place || '-'}`, '',
      ...bill.items.map(i => `${i.name} x ${i.qty} = ${money(i.total)}`), '',
      `Subtotal: ${money(bill.subtotal)}`,
      ...(bill.discount > 0 ? [`Discount: ${money(bill.discount)}`] : []),
      `Total Amount: ${money(bill.total ?? bill.subtotal)}`,
      `Paid: ${money(bill.paid)}`, `Balance: ${money(bill.balance)}`, `Payment: ${bill.payment}`,
    ].join('\n');
  }

  async function copyBill(bill: Bill | null = done) {
    if (!bill) { toast('Complete the bill first'); return; }
    try {
      await navigator.clipboard.writeText(receiptText(bill));
      setCopyMessage(true);
      toast('Bill copied to clipboard');
      window.setTimeout(() => setCopyMessage(false), 2500);
    } catch { toast('Could not copy bill to clipboard'); }
  }

  function printBill(bill: Bill | null = done) {
    if (!bill) { toast('Complete the bill first'); return; }
    setDone(bill);
    requestAnimationFrame(() => window.print());
  }

  async function complete() {
    if (saving) return;
    if (!name || !mobile || !items.length) { toast('Enter customer and add products'); return; }
    const existing = found;
    const customer: Customer = existing || { id: Date.now(), name, mobile, place, balance: 0 };
    const bill: Bill = {
      id: Date.now(), billNo: `NC-${String(Date.now()).slice(-5)}`, date: today(), customer, items,
      subtotal, discount: discountAmount, total, paid: Number(received) || 0, balance, payment,
      expense, profit: total - expense, status: 'Completed'
    };
    setSaving(true);
    try {
      const res = await fetch('/api/site-settings?resource=bill', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: bill.id, billNo: bill.billNo, billDate: new Date().toISOString().slice(0, 10), customer, items, subtotal, discount: discountAmount, total, paid: Number(received) || 0, payment, expense, profit: total - expense }),
        cache: 'no-store'
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) { toast(data.error || 'Bill was not saved to cloud'); return; }
      setBills(c => [bill, ...c]);
      setProducts(c => c.map(product => {
        const item = items.find(line => line.productId === product.id);
        return item ? { ...product, stock: product.stock - item.qty } : product;
      }));
      setCustomers(c => {
        const nextBalance = payment === 'Credit' ? customer.balance + balance : Math.max(0, customer.balance - balance);
        if (existing) return c.map(x => x.mobile === mobile ? { ...x, name, place, balance: nextBalance } : x);
        return [...c, { ...customer, balance: nextBalance }];
      });
      setDone(bill);
      resetEntry(true);
      toast('Bill Successfully Completed');
    } catch { toast('Bill save failed — check your internet connection'); }
    finally { setSaving(false); }
  }

  const suggestionList = (list: Customer[]) => list.length > 0 ? (
    <div className="customer-suggestions" role="listbox">
      {list.map(customer => (
        <button key={customer.id} type="button" role="option" className="customer-suggestion" onMouseDown={e => e.preventDefault()} onClick={() => selectCustomer(customer)}>
          <span className="suggestion-name">{customer.name}</span>
          <span className="suggestion-meta">{customer.mobile} <i>•</i> {customer.place || 'Place not added'}</span>
        </button>
      ))}
    </div>
  ) : null;

  return <>
    <Toolbar title="Sales / Billing" subtitle="Create a bill, apply discount, update stock and complete payment" />
    <div className="billing-layout">
      <Panel>
        <h3>Customer Details</h3>
        <label>Customer Name
          <div className="autocomplete-wrap">
            <input ref={nameRef} value={name} onChange={e => setName(e.target.value)} autoComplete="off" />
            {suggestionList(nameMatches)}
          </div>
        </label>
        <label>Mobile Number
          <div className="autocomplete-wrap inline">
            <input value={mobile} onChange={e => setMobile(e.target.value)} onBlur={lookup} autoComplete="off" inputMode="numeric" />
            <button className="icon-btn" onClick={lookup} type="button" title="Find customer"><RotateCw size={16} /></button>
            {suggestionList(mobileMatches)}
          </div>
        </label>
        <label>Place<input value={place} onChange={e => setPlace(e.target.value)} /></label>
        <div className="balance-box">Previous Credit Balance <b>{money(found?.balance || 0)}</b></div>
      </Panel>

      <Panel>
        <h3>Add Items</h3>
        <div className="add-line"><select value={productId} onChange={e => setProductId(e.target.value)}><option value="">Select product</option>{products.map(product => <option key={product.id} value={product.id}>{product.name} · {money(product.price)} · Stock {product.stock}</option>)}</select><input type="number" min="1" value={qty} onChange={e => setQty(Number(e.target.value))} /><button className="primary-btn" onClick={add} type="button"><Plus /> Add</button></div>
        <div className="bill-items">{items.map(item => <div className="bill-row" key={item.productId}><span><b>{item.name}</b><small>{money(item.price)} each</small></span><button onClick={() => decrease(item.productId)} type="button"><Minus /></button><b>{item.qty}</b><button onClick={() => increase(item.productId)} type="button"><Plus /></button><strong>{money(item.total)}</strong><button className="danger" onClick={() => setItems(c => c.filter(line => line.productId !== item.productId))} type="button"><Trash2 size={14} /></button></div>)}</div>
      </Panel>

      <Panel className="summary">
        <h3>Bill Summary</h3>
        <div className="total-box"><span>Total Amount</span><strong>{money(total)}</strong></div>
        <div className="summary-list"><span>Subtotal <b>{money(subtotal)}</b></span><span>Discount <input className="discount-input" type="number" min="0" max={subtotal} step="1" placeholder="₹ 0" value={discount} onChange={e => setDiscount(e.target.value)} /></span><span>Total Items <b>{items.reduce((sum, item) => sum + item.qty, 0)}</b></span><span>Payment<select value={payment} onChange={e => setPayment(e.target.value as 'Cash' | 'GPay / UPI' | 'Credit')}><option>Cash</option><option>GPay / UPI</option><option>Credit</option></select></span><span>Amount Paid<input type="number" min="0" value={received} onChange={e => { setPaidTouched(true); setReceived(e.target.value); }} /></span><span>Balance <b>{money(balance)}</b></span></div>
        {copyMessage && <div className="bill-copy-message"><Copy size={15} /> Bill copied to clipboard</div>}
        <div className="summary-actions">
          <button onClick={clear} type="button">Clear</button>
          <button className="summary-icon-btn" onClick={() => printBill()} type="button" title="Print completed bill" aria-label="Print completed bill"><Printer size={17} /></button>
          <button className="summary-icon-btn whatsapp-icon" onClick={() => copyBill()} type="button" title="Copy completed bill for WhatsApp" aria-label="Copy completed bill for WhatsApp"><MessageCircle size={18} /></button>
          <button className="primary-btn" onClick={complete} type="button" disabled={saving}><Check />{saving ? 'Saving...' : 'Complete Bill'}</button>
        </div>
      </Panel>
    </div>

    {done && <div className="completed-bill-card">
      <div className="complete-banner"><Check size={17} /> <b>Bill Successfully Completed</b><span>Ready for next bill</span></div>
      <div className="last-bill-head"><div><b>{done.billNo}</b><span>{done.customer.name} · {done.customer.mobile} · {done.customer.place}</span></div><div className="last-bill-actions">
        <button className="summary-icon-btn" onClick={() => printBill(done)} type="button" title="Print completed bill" aria-label="Print completed bill"><Printer size={17} /></button>
        <button className="summary-icon-btn whatsapp-icon" onClick={() => copyBill(done)} type="button" title="Copy bill for WhatsApp" aria-label="Copy bill for WhatsApp"><MessageCircle size={18} /></button>
        <button className="summary-icon-btn" onClick={() => setDone(null)} type="button" title="Close last bill" aria-label="Close last bill"><X size={16} /></button>
      </div></div>
      <div className="receipt printable-receipt" id="completed-receipt">
        <h2>{site.storeName}</h2><p>SALES RECEIPT</p><hr />
        <div className="receipt-meta"><span>Bill No <b>{done.billNo}</b></span><span>Date <b>{done.date}</b></span><span>Customer <b>{done.customer.name}</b></span><span>Mobile <b>{done.customer.mobile}</b></span><span>Place <b>{done.customer.place}</b></span></div>
        <table><thead><tr><th>Product</th><th>Qty</th><th>Price</th><th>Total</th></tr></thead><tbody>{done.items.map(item => <tr key={item.productId}><td>{item.name}</td><td>{item.qty}</td><td>{money(item.price)}</td><td>{money(item.total)}</td></tr>)}</tbody></table>
        <div className="receipt-total"><span>Subtotal</span><b>{money(done.subtotal)}</b>{done.discount > 0 && <><span>Discount</span><b>{money(done.discount)}</b></>}<span>Total Amount</span><b>{money(done.total ?? done.subtotal)}</b><span>Paid Amount</span><b>{money(done.paid)}</b><span>Balance</span><b>{money(done.balance)}</b></div>
        <p className="thanks">Thank you for shopping with us! <Heart size={14} fill="currentColor" /></p>
      </div>
    </div>}

    <style jsx global>{`
      .customer-suggestions{position:absolute;left:0;right:0;top:calc(100% + 4px);z-index:80;background:#fff;border:1px solid #d9e4dd;border-radius:10px;box-shadow:0 12px 28px rgba(20,55,38,.14);padding:4px;max-height:260px;overflow-y:auto}
      .autocomplete-wrap{position:relative}.customer-suggestion{display:flex!important;flex-direction:column!important;align-items:flex-start!important;gap:2px;width:100%;padding:10px 11px;border:0;border-radius:7px;background:transparent;text-align:left;cursor:pointer}.customer-suggestion:hover,.customer-suggestion:focus{background:#eef8f1;outline:none}.suggestion-name{font-size:13px;font-weight:700;color:#173b2a}.suggestion-meta{font-size:11px;color:#6d7e74}.suggestion-meta i{font-style:normal;margin:0 3px;color:#91a198}
      .summary-actions{display:flex;align-items:center;gap:7px;flex-wrap:nowrap}.summary-actions .summary-icon-btn{width:36px;height:36px;padding:0;display:inline-flex;align-items:center;justify-content:center;border:1px solid var(--line);border-radius:8px;background:#fff;cursor:pointer}.summary-actions .summary-icon-btn:hover,.last-bill-actions .summary-icon-btn:hover{transform:translateY(-1px)}.summary-actions .whatsapp-icon,.last-bill-actions .whatsapp-icon{color:#15803d;border-color:#b8dec5;background:#f0fbf3}.summary-actions .primary-btn{margin-left:auto}
      .completed-bill-card{margin-top:14px;padding:12px;background:#f7fbf8;border:1px solid #cfe6d7;border-radius:12px}.complete-banner{display:flex;align-items:center;gap:7px;color:#15803d;background:#eaf8ee;border:1px solid #c8e8d2;padding:8px 10px;border-radius:8px;font-size:12px}.complete-banner span{margin-left:auto;color:#6b7f72;font-weight:500}.last-bill-head{display:flex;justify-content:space-between;align-items:center;gap:12px;padding:10px 2px}.last-bill-head>div:first-child{display:flex;flex-direction:column;gap:3px}.last-bill-head span{font-size:11px;color:#6d7e74}.last-bill-actions{display:flex;gap:6px}.last-bill-actions .summary-icon-btn{width:34px;height:34px;padding:0;display:inline-flex;align-items:center;justify-content:center;border:1px solid var(--line);border-radius:8px;background:#fff;cursor:pointer}.completed-bill-card .receipt{margin-top:2px}
      @media(max-width:620px){.summary-actions{gap:5px}.summary-actions .summary-icon-btn{width:34px;height:34px}.summary-actions .primary-btn{padding-inline:10px}.complete-banner span{display:none}.last-bill-head{align-items:flex-start;flex-direction:column}.last-bill-actions{width:100%}.last-bill-actions .summary-icon-btn{flex:0 0 34px}}
      @media print{body *{visibility:hidden!important}.printable-receipt,.printable-receipt *{visibility:visible!important}.printable-receipt{position:absolute!important;left:0!important;top:0!important;width:100%!important;margin:0!important;border:0!important;box-shadow:none!important;background:#fff!important}.completed-bill-card{position:static!important;border:0!important;padding:0!important;margin:0!important;background:#fff!important}.completed-bill-card>.complete-banner,.completed-bill-card>.last-bill-head{display:none!important}}
    `}</style>
  </>;
}
