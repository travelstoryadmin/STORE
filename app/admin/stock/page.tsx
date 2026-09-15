'use client';
import {useState} from 'react';
import {Plus,PackagePlus,Printer,FileSpreadsheet,Search} from 'lucide-react';
import {money,today,Product} from '@/lib/data';
import {useStore} from '@/lib/store';
import {Panel,Toolbar} from '@/components/Panel';

function downloadStockExcel(rows:Product[]){
  const body=rows.map(p=>`<tr><td>${p.name}</td><td>${p.category}</td><td>${p.stock}</td><td>${p.expense}</td><td>${p.stock<5?'Low Stock':'In Stock'}</td></tr>`).join('');
  const html=`<html><head><meta charset="UTF-8"></head><body><h2>Travel Story - Stock Report</h2><p>Generated: ${new Date().toLocaleString('en-IN')}</p><table border="1"><thead><tr><th>Product</th><th>Category</th><th>Current Stock</th><th>Expense / Unit</th><th>Status</th></tr></thead><tbody>${body}</tbody></table></body></html>`;
  const blob=new Blob([html],{type:'application/vnd.ms-excel'});
  const url=URL.createObjectURL(blob);const a=document.createElement('a');a.href=url;a.download=`travel-story-stock-${new Date().toISOString().slice(0,10)}.xls`;a.click();URL.revokeObjectURL(url);
}

export default function Stock(){
  const{products,setProducts,setStockLogs,role,toast}=useStore();
  const[p,setP]=useState<Product|null>(null);const[q,setQ]=useState('');const[e,setE]=useState('');const[search,setSearch]=useState('');
  function open(prod:Product){setP(prod);setQ('');setE('')}
  function close(){setP(null);setQ('');setE('')}
  function save(){
    if(!p||Number(q)<=0){toast('Enter a valid stock quantity');return}
    const qty=Number(q),cost=Number(e)||p.expense;
    setProducts(v=>v.map(x=>x.id===p.id?{...x,stock:x.stock+qty,expense:role==='admin'?cost:x.expense}:x));
    setStockLogs(v=>[{id:Date.now(),productId:p.id,productName:p.name,qty,expense:cost,date:today(),type:'Purchase'},...v]);close();toast('Stock updated');
  }
  const qty=Number(q)||0;
  const data=products.filter(x=>(x.name+' '+x.category).toLowerCase().includes(search.toLowerCase()));
  return <>
    <Toolbar title="Stock Management" subtitle="Manage current stock and export a complete stock report"/>
    <Panel>
      <div className="stock-report-toolbar no-print">
        <div className="search-box dark"><Search size={16}/><input value={search} onChange={x=>setSearch(x.target.value)} placeholder="Search product or category..."/></div>
        <div className="report-buttons">
          <button className="primary-btn" onClick={()=>window.print()}><Printer size={16}/> Print Report / PDF</button>
          <button className="ghost-btn" onClick={()=>downloadStockExcel(data)}><FileSpreadsheet size={16}/> Excel</button>
        </div>
      </div>
      <div className="stock-report-head">
        <div><h2>Travel Story</h2><b>STOCK REPORT</b><small>Generated: {new Date().toLocaleString('en-IN')}</small></div>
        <div><b>{data.length} Product(s)</b><small>Total Units: {data.reduce((sum,p)=>sum+p.stock,0)}</small></div>
      </div>
      <div className="table-card stock-report-table"><table>
        <thead><tr><th>Product</th><th>Category</th><th>Current Stock</th>{role==='admin'&&<th>Expense / Unit</th>}<th>Status</th><th className="no-print">Action</th></tr></thead>
        <tbody>{data.map(x=><tr key={x.id}>
          <td><div className="prod-cell"><img src={x.image||"/placeholder.svg"} alt={x.name}/><b>{x.name}</b></div></td><td>{x.category}</td><td><b>{x.stock}</b></td>{role==='admin'&&<td>{money(x.expense)}</td>}<td><span className={x.stock<5?'pill low':'pill good'}>{x.stock<5?'Low Stock':'In Stock'}</span></td><td className="no-print"><button className="icon-btn" onClick={()=>open(x)} title="Add stock"><Plus size={16}/></button></td>
        </tr>)}</tbody>
      </table></div>
      {!data.length&&<p className="empty">No products found.</p>}
    </Panel>

    {p&&<div className="overlay no-print" onClick={close}><div className="modal stock-modal" onClick={ev=>ev.stopPropagation()}>
      <button className="modal-x" onClick={close} aria-label="Close">×</button>
      <div className="stock-modal-head"><span className="stock-modal-icon"><PackagePlus size={20}/></span><div><h2>Add Stock</h2><p>Record a new purchase for this product</p></div></div>
      <div className="stock-modal-product"><img src={p.image||"/placeholder.svg"} alt={p.name}/><div><b>{p.name}</b><small>{p.category}</small></div><div className="stock-modal-current"><span>Current</span><b>{p.stock}</b></div></div>
      <div className="stock-modal-fields"><label>Quantity to add<input type="number" min={1} value={q} onChange={x=>setQ(x.target.value)} placeholder="e.g. 10" autoFocus/></label>{role==='admin'&&<label>Purchase cost / unit (₹)<input type="number" min={0} value={e} onChange={x=>setE(x.target.value)} placeholder={String(p.expense)}/></label>}</div>
      {qty>0&&<div className="stock-modal-summary"><span>New stock total</span><b>{p.stock} + {qty} = {p.stock+qty}</b></div>}
      <div className="modal-actions"><button className="ghost-btn" onClick={close}>Cancel</button><button className="primary-btn" onClick={save}><Plus size={16}/>Add Stock</button></div>
    </div></div>}
    <style jsx global>{`@media print{body{background:#fff!important}.sidebar,.admin-header,.page-toolbar,.no-print{display:none!important}.main-area{margin-left:0!important}.content{padding:0!important}.panel{border:0!important;box-shadow:none!important;padding:0!important}.stock-report-head{display:flex!important;justify-content:space-between!important;border-bottom:2px solid #222!important;padding:10px 0!important;margin-bottom:12px!important}.stock-report-head h2{margin:0!important}.stock-report-head small{display:block!important;margin-top:4px!important}.stock-report-table{overflow:visible!important}.stock-report-table table{font-size:11px!important}.stock-report-table th,.stock-report-table td{padding:7px!important}.stock-report-table img{width:35px!important;height:35px!important}.stock-report-table .pill{background:none!important;padding:0!important}.stock-report-table .pill.low{color:#a05c0a!important}.stock-report-table .pill.good{color:#087252!important}} .stock-report-head{display:flex;justify-content:space-between;align-items:center;margin:4px 0 14px;padding:10px 12px;background:#f7faf8;border:1px solid #dfe7e2;border-radius:9px}.stock-report-head h2{margin:0 0 3px;font:600 20px 'Playfair Display',serif}.stock-report-head b,.stock-report-head small{display:block}.stock-report-head small{font-size:8px;color:#71807a;margin-top:3px}.stock-report-toolbar{display:flex;justify-content:space-between;gap:12px;align-items:center;margin-bottom:12px}.report-buttons{display:flex;gap:8px;flex-wrap:wrap}`}</style>
  </>;
}
