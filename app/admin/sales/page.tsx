'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { Check, Minus, Plus, Printer, Trash2, MessageCircle, RotateCw, X, Heart, Copy } from 'lucide-react';
import { Bill, BillItem, Customer, money, today } from '@/lib/data';
import { useStore } from '@/lib/store';
import { useSiteSettings, whatsappNumber } from '@/lib/site-settings';
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
    ? customers.filter(c => c.name.toLowerCase().includes(name.trim().toLowerCase())).slice(0, 6)
    : [];
  const mobileMatches = mobile.trim().length >= 4
    ? customers.filter(c => c.mobile.includes(mobile.trim())).slice(0, 6)
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
    if (newQty > product.stock) {
      toast(`Only ${product.stock} available`);
      return;
    }
    if (existing) {
      setItems(c => c.map(i => i.productId === product.id ? { ...i, qty: newQty, total: newQty * i.price } : i));
    } else {
      setItems(c => [...c, { productId: product.id, name: product.name, qty, price: product.price, expense: product.expense, total: product.price * qty }]);
    }
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
      if (i.qty >= product.stock) {
        toast(`Only ${product.stock} available`);
        return i;
      }
      const q = i.qty + 1;
      return { ...i, qty: q, total: q * i.price };
    }));
  }

  function clear() {
    setItems([]); setName(''); setMobile(''); setPlace(''); setReceived(''); setDiscount('');
    setPayment('Cash'); setProductId(''); setQty(1); setDone(null); setPaidTouched(false); setCopyMessage(false);
    toast('Bill cleared');
    requestAnimationFrame(() => nameRef.current?.focus());
  }

  function currentBillText() {
    const customerName = name || 'Walk-in Customer';
    return [
      site.storeName,
      'SALES RECEIPT',
      `Customer: ${customerName}`,
      `Mobile: ${mobile || '-'}`,
      `Place: ${place || '-'}`,
      '',
      ...items.map(i => `${i.name} x ${i.qty} = ${money(i.total)}`),
      '',
      `Subtotal: ${money(subtotal)}`,
      ...(discountAmount > 0 ? [`Discount: ${money(discountAmount)}`] : []),
      `Total Amount: ${money(total)}`,
      `Paid: ${money(Number(received) || 0)}`,
      `Balance: ${money(balance)}`,
      `Payment: ${payment}`,
    ].join('\n');
  }

  async function copyBill() {
    if (!items.length) {
      toast('Add at least one product first');
      return;
    }
    const text = done ? receiptText(done) : currentBillText();
    try {
      await navigator.clipboard.writeText(text);
      setCopyMessage(true);
      toast('Bill copied to clipboard');
      window.setTimeout(() => setCopyMessage(false), 2500);
    } catch {
      toast('Could not copy bill to clipboard');
    }
  }

  function receiptText(bill: Bill) {
    return [
      site.storeName,
      'SALES RECEIPT',
      `Bill No: ${bill.billNo}`,
      `Customer: ${bill.customer.name}`,
      `Mobile: ${bill.customer.mobile}`,
      '',
      ...bill.items.map(i => `${i.name} x ${i.qty} = ${money(i.total)}`),
      '',
      `Subtotal: ${money(bill.subtotal)}`,
      ...(bill.discount > 0 ? [`Discount: ${money(bill.discount)}`] : []),
      `Total Amount: ${money(bill.total ?? bill.subtotal)}`,
      `Paid: ${money(bill.paid)}`,
      `Balance: ${money(bill.balance)}`,
      `Payment: ${bill.payment}`,
    ].join('\n');
  }

  async function complete() {
    if (saving) return;
    if (!name || !mobile || !items.length) {
      toast('Enter customer and add products');
      return;
    }
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
      setItems([]); setName(''); setMobile(''); setPlace(''); setReceived(''); setDiscount('');
      setPayment('Cash'); setProductId(''); setQty(1); setPaidTouched(false); setCopyMessage(false);
      toast('Bill Completed and saved to cloud');
      requestAnimationFrame(() => nameRef.current?.focus());
    } catch {
      toast('Bill save failed — check your internet connection');
    } finally {
      setSaving(false);
    }
  }

  return <>
    <Toolbar title="Sales / Billing" subtitle="Create a bill, apply discount, update stock and complete payment" />
    <div className="billing-layout">
      <Panel>
        <h3>Customer Details</h3>
        <label>Customer Name
          <div className="autocomplete-wrap">
            <input ref={nameRef} value={name} onChange={e => setName(e.target.value)} autoComplete="off" />
            {nameMatches.length > 0 && <div className="autocomplete-list">{nameMatches.map(customer => <button type="button" key={customer.id} onMouseDown={e => e.preventDefault()} onClick={() => selectCustomer(customer)}><b>{customer.name}</b><small>{customer.mobile} · {customer.place}</small></button>)}</div>}
          </div>
        </label>
        <label>Mobile Number
          <div className="autocomplete-wrap inline">
            <input value={mobile} onChange={e => setMobile(e.target.value)} onBlur={lookup} autoComplete="off" inputMode="numeric" />
            <button className="icon-btn" onClick={lookup} type="button"><RotateCw size={16} /></button>
            {mobileMatches.length > 0 && <div className="autocomplete-list">{mobileMatches.map(customer => <button type="button" key={customer.id} onMouseDown={e => e.preventDefault()} onClick={() => selectCustomer(customer)}><b>{customer.name}</b><small>{customer.mobile} · {customer.place}</small></button>)}</div>}
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
        <div className="summary-actions"><button onClick={clear} type="button">Clear</button><button className="print-small-btn" onClick={() => window.print()} type="button"><Printer size={16} /> Print</button><button className="wa-small-btn" onClick={copyBill} type="button" title="Copy bill to clipboard"><MessageCircle size={17} /> WhatsApp</button><button className="primary-btn" onClick={complete} type="button" disabled={saving}><Check />{saving ? 'Saving...' : 'Complete Bill'}</button></div>
      </Panel>
    </div>

    {done && <div className="overlay"><div className="receipt-modal"><div className="receipt-actions"><button className="primary-btn" onClick={() => window.print()} type="button"><Printer /> Print</button><button className="wa-btn" onClick={copyBill} type="button"><MessageCircle /> WhatsApp</button><button onClick={() => setDone(null)} type="button"><X size={18} /></button></div><div className="receipt"><h2>{site.storeName}</h2><p>SALES RECEIPT</p><hr /><div className="receipt-meta"><span>Bill No <b>{done.billNo}</b></span><span>Date <b>{done.date}</b></span><span>Customer <b>{done.customer.name}</b></span><span>Mobile <b>{done.customer.mobile}</b></span><span>Place <b>{done.customer.place}</b></span></div><table><thead><tr><th>Product</th><th>Qty</th><th>Price</th><th>Total</th></tr></thead><tbody>{done.items.map(item => <tr key={item.productId}><td>{item.name}</td><td>{item.qty}</td><td>{money(item.price)}</td><td>{money(item.total)}</td></tr>)}</tbody></table><div className="receipt-total"><span>Subtotal</span><b>{money(done.subtotal)}</b>{done.discount > 0 && <><span>Discount</span><b>{money(done.discount)}</b></>}<span>Total Amount</span><b>{money(done.total ?? done.subtotal)}</b><span>Paid Amount</span><b>{money(done.paid)}</b><span>Balance</span><b>{money(done.balance)}</b></div><p className="thanks">Thank you for shopping with us! <Heart size={14} fill="currentColor" /></p></div><div className="complete-banner"><Check /> Bill Completed — Ready for next bill</div><button className="primary-btn newbill" onClick={() => { setDone(null); requestAnimationFrame(() => nameRef.current?.focus()); }} type="button"><Plus /> New Bill</button></div></div>}
  </>;
}
