'use client';
import {useMemo,useState} from 'react';
import {Eye,MessageCircle,Pencil,Trash2,Printer,FileSpreadsheet,FileDown,Search,CalendarDays,X} from 'lucide-react';
import {Bill,money,WA_NUMBER} from '@/lib/data';
import {useStore} from '@/lib/store';
import {Panel,Toolbar} from '@/components/Panel';

function monthBounds(){const d=new Date();const y=d.getFullYear();const m=String(d.getMonth()+1).padStart(2,'0');const last=new Date(y,d.getMonth()+1,0).getDate();return [`${y}-${m}-01`,`${y}-${m}-${String(last).padStart(2,'0')}`] as const}
function downloadExcel(rows:Bill[],from:string,to:string){
 const body=rows.map(b=>`<tr><td>${b.billNo}</td><td>${b.customer.name}</td><td>${b.customer.mobile}</td><td>${b.customer.place||''}</td><td>${b.subtotal}</td><td>${b.paid}</td><td>${b.balance}</td><td>${b.payment}</td><td>${b.date}</td></tr>`).join('');
 const html=`<html><head><meta charset="UTF-8"></head><body><h2>Travel Story - Bills Report</h2><p>${from} to ${to}</p><table border="1"><thead><tr><th>Bill No</th><th>Customer</th><th>Mobile</th><th>Place</th><th>Total</th><th>Paid</th><th>Balance</th><th>Payment</th><th>Date</th></tr></thead><tbody>${body}</tbody></table></body></html>`;
 const blob=new Blob([html],{type:'application/vnd.ms-excel'});const url=URL.createObjectURL(blob);const a=document.createElement('a');a.href=url;a.download=`travel-story-bills-${from}-to-${to}.xls`;a.click();URL.revokeObjectURL(url)
}
export default function Bills(){
 const{bills,setBills,role,toast}=useStore();const[v,setV]=useState<Bill|null>(null);const[q,setQ]=useState('');const[monthStart,monthEnd]=monthBounds();
 const[from,setFrom]=useState(monthStart);const[to,setTo]=useState(monthEnd);
 const data=useMemo(()=>bills.filter(b=>{const text=(b.billNo+' '+b.customer.name+' '+b.customer.mobile).toLowerCase();return text.includes(q.toLowerCase())&&b.date>=from&&b.date<=to}),[bills,q,from,to]);
 function share(b:Bill){const text=`Travel Story\n${b.billNo}\nCustomer: ${b.customer.name}\n${b.items.map(i=>`${i.name} x ${i.qty} = ${money(i.total)}`).join('\n')}\nTotal Amount: ${money(b.subtotal)}\nPaid: ${money(b.paid)}\nBalance: ${money(b.balance)}`;navigator.clipboard?.writeText(text);toast('Bill copied to clipboard');window.open(`https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(text)}`,'_blank')}
 function del(id:number){if(confirm('Delete this bill?')){setBills(v=>v.filter(b=>b.id!==id));toast('Bill deleted')}}
 function resetMonth(){const[a,b]=monthBounds();setFrom(a);setTo(b);setQ('')}
 function printReport(){window.print()}
 return <>
  <Toolbar title="Bills & History" subtitle="Current-month bills are shown by default. Search older bills with dates."/>
  <Panel>
   <div className="report-filter-card">
    <div className="date-field"><CalendarDays size={16}/><label>From<input type="date" value={from} onChange={e=>setFrom(e.target.value)}/></label></div>
    <div className="date-field"><CalendarDays size={16}/><label>To<input type="date" value={to} onChange={e=>setTo(e.target.value)}/></label></div>
    <div className="search-box dark"><Search/><input value={q} onChange={e=>setQ(e.target.value)} placeholder="Search bill, customer or mobile..."/></div>
    <button onClick={resetMonth}>This Month</button>
    <button className="primary-btn" onClick={printReport}><Printer size={16}/> Print Report / PDF</button>
    <button className="ghost-btn" onClick={()=>downloadExcel(data,from,to)}><FileSpreadsheet size={16}/> Excel</button>
   </div>
   <div className="report-summary"><b>{data.length} bill(s)</b><span>{from} → {to}</span></div>
   <div className="table-card"><table><thead><tr><th>Bill No</th><th>Customer</th><th>Mobile</th><th>Total Amount</th><th>Payment</th>{role==='admin'&&<><th>Expense</th><th>Profit</th></>}<th>Date</th><th>Action</th></tr></thead><tbody>{data.map(b=><tr key={b.id}><td><b>{b.billNo}</b></td><td>{b.customer.name}</td><td>{b.customer.mobile}</td><td>{money(b.subtotal)}</td><td>{b.payment}</td>{role==='admin'&&<><td>{money(b.expense)}</td><td>{money(b.profit)}</td></>}<td>{b.date}</td><td><div className="row-actions"><button title="View / Print" onClick={()=>setV(b)}><Eye size={15}/></button><button title="WhatsApp" onClick={()=>share(b)}><MessageCircle size={15}/></button><button className="danger" title="Delete" onClick={()=>del(b.id)}><Trash2 size={15}/></button></div></td></tr>)}</tbody></table>{!data.length&&<p className="empty">No bills found for this date range.</p>}</div>
  </Panel>
  {v&&<div className="overlay"><div className="receipt-modal"><div className="receipt-actions no-print"><button className="primary-btn" onClick={()=>window.print()}><Printer/> Print / Save PDF</button><button className="ghost-btn" onClick={()=>downloadExcel([v],v.date,v.date)}><FileSpreadsheet/> Excel</button><button className="wa-btn" onClick={()=>share(v)}><MessageCircle/> Share on WhatsApp</button><button onClick={()=>setV(null)}><X/></button></div><div className="receipt print-report"><h2>Travel Story</h2><p>SALES RECEIPT</p><hr/><p>Bill No: <b>{v.billNo}</b></p><p>Customer: <b>{v.customer.name}</b> · {v.customer.mobile}</p><p>Date: {v.date}</p><table><thead><tr><th>Product</th><th>Qty</th><th>Price</th><th>Total</th></tr></thead><tbody>{v.items.map(i=><tr key={i.productId}><td>{i.name}</td><td>{i.qty}</td><td>{money(i.price)}</td><td>{money(i.total)}</td></tr>)}</tbody></table><div className="receipt-total"><span>Total Amount</span><b>{money(v.subtotal)}</b><span>Paid</span><b>{money(v.paid)}</b><span>Balance</span><b>{money(v.balance)}</b></div></div></div></div>}
 </>
}
