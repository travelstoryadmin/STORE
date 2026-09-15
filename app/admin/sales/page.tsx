'use client';

import { useMemo, useState } from 'react';
import {
  Check,
  Minus,
  Plus,
  Printer,
  Trash2,
  MessageCircle,
  RotateCw,
  X,
  Heart,
} from 'lucide-react';
import { Bill, BillItem, Customer, money, today, WA_NUMBER } from '@/lib/data';
import { useStore } from '@/lib/store';
import { Panel, Toolbar } from '@/components/Panel';

export default function Sales() {
  const {
    products,
    customers,
    setProducts,
    setCustomers,
    setBills,
    toast,
  } = useStore();

  const [name, setName] = useState('');
  const [mobile, setMobile] = useState('');
  const [place, setPlace] = useState('');
  const [productId, setProductId] = useState('');
  const [qty, setQty] = useState(1);
  const [payment, setPayment] = useState<'Cash' | 'GPay / UPI' | 'Credit'>('Cash');
  const [received, setReceived] = useState('');
  const [items, setItems] = useState<BillItem[]>([]);
  const [done, setDone] = useState<Bill | null>(null);

  const found = customers.find((c) => c.mobile === mobile);

  const total = useMemo(
    () => items.reduce((sum, item) => sum + item.total, 0),
    [items],
  );

  const expense = useMemo(
    () => items.reduce((sum, item) => sum + item.expense * item.qty, 0),
    [items],
  );

  const balance = Math.max(0, total - (Number(received) || 0));

  function lookup() {
    if (found) {
      setName(found.name);
      setPlace(found.place);
    }
  }

  function add() {
    const product = products.find((p) => p.id === Number(productId));
    if (!product || qty < 1) return;

    const existing = items.find((item) => item.productId === product.id);
    const newQty = (existing?.qty || 0) + qty;

    if (newQty > product.stock) {
      toast(`Only ${product.stock} available`);
      return;
    }

    if (existing) {
      setItems((current) =>
        current.map((item) =>
          item.productId === product.id
            ? { ...item, qty: newQty, total: newQty * item.price }
            : item,
        ),
      );
    } else {
      setItems((current) => [
        ...current,
        {
          productId: product.id,
          name: product.name,
          qty,
          price: product.price,
          expense: product.expense,
          total: product.price * qty,
        },
      ]);
    }

    setQty(1);
  }

  function decrease(productIdToChange: number) {
    setItems((current) =>
      current.flatMap((item) => {
        if (item.productId !== productIdToChange) return [item];
        if (item.qty <= 1) return [];
        const nextQty = item.qty - 1;
        return [{ ...item, qty: nextQty, total: nextQty * item.price }];
      }),
    );
  }

  function increase(productIdToChange: number) {
    const product = products.find((p) => p.id === productIdToChange);
    if (!product) return;

    setItems((current) =>
      current.map((item) => {
        if (item.productId !== productIdToChange) return item;
        if (item.qty >= product.stock) {
          toast(`Only ${product.stock} available`);
          return item;
        }
        const nextQty = item.qty + 1;
        return { ...item, qty: nextQty, total: nextQty * item.price };
      }),
    );
  }

  function clear() {
    setItems([]);
    setName('');
    setMobile('');
    setPlace('');
    setReceived('');
    setPayment('Cash');
    setProductId('');
    setQty(1);
    setDone(null);
    toast('Bill cleared');
  }

  function complete() {
    if (!name || !mobile || !items.length) {
      toast('Enter customer and add products');
      return;
    }

    const existing = found;
    const customer: Customer =
      existing || {
        id: Date.now(),
        name,
        mobile,
        place,
        balance: 0,
      };

    const bill: Bill = {
      id: Date.now(),
      billNo: `NC-${String(Date.now()).slice(-5)}`,
      date: today(),
      customer,
      items,
      subtotal: total,
      paid: Number(received) || 0,
      balance,
      payment,
      expense,
      profit: total - expense,
      status: 'Completed',
    };

    setBills((current) => [bill, ...current]);

    setProducts((current) =>
      current.map((product) => {
        const item = items.find((line) => line.productId === product.id);
        return item
          ? { ...product, stock: product.stock - item.qty }
          : product;
      }),
    );

    setCustomers((current) => {
      const nextBalance =
        payment === 'Credit'
          ? customer.balance + balance
          : Math.max(0, customer.balance - balance);

      if (existing) {
        return current.map((c) =>
          c.mobile === mobile
            ? { ...c, name, place, balance: nextBalance }
            : c,
        );
      }

      return [...current, { ...customer, balance: nextBalance }];
    });

    setDone(bill);
    setItems([]);
    setName('');
    setMobile('');
    setPlace('');
    setReceived('');
    setPayment('Cash');
    setProductId('');
    setQty(1);
    toast('Bill Completed');
  }

  function share() {
    if (!done) return;

    const text = [
      'Travel Story',
      'SALES RECEIPT',
      `Bill No: ${done.billNo}`,
      `Customer: ${done.customer.name}`,
      `Mobile: ${done.customer.mobile}`,
      '',
      ...done.items.map(
        (item) => `${item.name} x ${item.qty} = ${money(item.total)}`,
      ),
      '',
      `Total Amount: ${money(done.subtotal)}`,
      `Paid: ${money(done.paid)}`,
      `Balance: ${money(done.balance)}`,
      `Payment: ${done.payment}`,
    ].join('\n');

    navigator.clipboard?.writeText(text);
    toast('Bill copied to clipboard');

    window.open(
      `https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(text)}`,
      '_blank',
      'noopener,noreferrer',
    );
  }

  return (
    <>
      <Toolbar
        title="Sales / Billing"
        subtitle="Create a bill, update stock and complete payment"
      />

      <div className="billing-layout">
        <Panel>
          <h3>Customer Details</h3>

          <label>
            Customer Name
            <input value={name} onChange={(e) => setName(e.target.value)} />
          </label>

          <label>
            Mobile Number
            <div className="inline">
              <input
                value={mobile}
                onChange={(e) => setMobile(e.target.value)}
                onBlur={lookup}
              />
              <button className="icon-btn" onClick={lookup} type="button" aria-label="Look up customer">
                <RotateCw size={16} />
              </button>
            </div>
          </label>

          <label>
            Place
            <input value={place} onChange={(e) => setPlace(e.target.value)} />
          </label>

          <div className="balance-box">
            Previous Credit Balance <b>{money(found?.balance || 0)}</b>
          </div>
        </Panel>

        <Panel>
          <h3>Add Items</h3>

          <div className="add-line">
            <select
              value={productId}
              onChange={(e) => setProductId(e.target.value)}
            >
              <option value="">Select product</option>
              {products.map((product) => (
                <option key={product.id} value={product.id}>
                  {product.name} · {money(product.price)} · Stock {product.stock}
                </option>
              ))}
            </select>

            <input
              type="number"
              min="1"
              value={qty}
              onChange={(e) => setQty(Number(e.target.value))}
            />

            <button className="primary-btn" onClick={add} type="button">
              <Plus /> Add
            </button>
          </div>

          <div className="bill-items">
            {items.map((item) => (
              <div className="bill-row" key={item.productId}>
                <span>
                  <b>{item.name}</b>
                  <small>{money(item.price)} each</small>
                </span>

                <button
                  onClick={() => decrease(item.productId)}
                  type="button"
                  aria-label="Decrease quantity"
                >
                  <Minus />
                </button>

                <b>{item.qty}</b>

                <button
                  onClick={() => increase(item.productId)}
                  type="button"
                  aria-label="Increase quantity"
                >
                  <Plus />
                </button>

                <strong>{money(item.total)}</strong>

                <button
                  className="danger"
                  onClick={() =>
                    setItems((current) =>
                      current.filter((line) => line.productId !== item.productId),
                    )
                  }
                  type="button"
                  aria-label="Delete item"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            ))}
          </div>
        </Panel>

        <Panel className="summary">
          <h3>Bill Summary</h3>

          <div className="total-box">
            <span>Total Amount</span>
            <strong>{money(total)}</strong>
          </div>

          <div className="summary-list">
            <span>
              Total Items <b>{items.reduce((sum, item) => sum + item.qty, 0)}</b>
            </span>

            <span>
              Payment
              <select
                value={payment}
                onChange={(e) =>
                  setPayment(e.target.value as 'Cash' | 'GPay / UPI' | 'Credit')
                }
              >
                <option>Cash</option>
                <option>GPay / UPI</option>
                <option>Credit</option>
              </select>
            </span>

            <span>
              Amount Paid
              <input
                type="number"
                min="0"
                value={received}
                onChange={(e) => setReceived(e.target.value)}
              />
            </span>

            <span>
              Balance <b>{money(balance)}</b>
            </span>
          </div>

          <div className="summary-actions">
            <button onClick={clear} type="button">
              Clear
            </button>
            <button className="primary-btn" onClick={complete} type="button">
              <Check /> Complete Bill
            </button>
          </div>
        </Panel>
      </div>

      {done && (
        <div className="overlay">
          <div className="receipt-modal">
            <div className="receipt-actions">
              <button
                className="primary-btn"
                onClick={() => window.print()}
                type="button"
              >
                <Printer /> Print
              </button>

              <button className="wa-btn" onClick={share} type="button">
                <MessageCircle /> Share on WhatsApp
              </button>

              <button onClick={() => setDone(null)} type="button" aria-label="Close">
                <X size={18} />
              </button>
            </div>

            <div className="receipt">
              <h2>Travel Story</h2>
              <p>SALES RECEIPT</p>
              <hr />

              <div className="receipt-meta">
                <span>
                  Bill No <b>{done.billNo}</b>
                </span>
                <span>
                  Date <b>{done.date}</b>
                </span>
                <span>
                  Customer <b>{done.customer.name}</b>
                </span>
                <span>
                  Mobile <b>{done.customer.mobile}</b>
                </span>
                <span>
                  Place <b>{done.customer.place}</b>
                </span>
              </div>

              <table>
                <thead>
                  <tr>
                    <th>Product</th>
                    <th>Qty</th>
                    <th>Price</th>
                    <th>Total</th>
                  </tr>
                </thead>
                <tbody>
                  {done.items.map((item) => (
                    <tr key={item.productId}>
                      <td>{item.name}</td>
                      <td>{item.qty}</td>
                      <td>{money(item.price)}</td>
                      <td>{money(item.total)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>

              <div className="receipt-total">
                <span>Total Amount</span>
                <b>{money(done.subtotal)}</b>
                <span>Paid Amount</span>
                <b>{money(done.paid)}</b>
                <span>Balance</span>
                <b>{money(done.balance)}</b>
              </div>

              <p className="thanks">Thank you for shopping with us! <Heart size={14} fill="currentColor" /></p>
            </div>

            <div className="complete-banner">
              <Check /> Bill Completed
            </div>

            <button
              className="primary-btn newbill"
              onClick={() => setDone(null)}
              type="button"
            >
              <Plus /> New Bill
            </button>
          </div>
        </div>
      )}
    </>
  );
}
