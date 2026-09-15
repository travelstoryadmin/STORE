'use client';
import {useState} from 'react';
import {Plus,PackagePlus} from 'lucide-react';
import {money,today,Product} from '@/lib/data';
import {useStore} from '@/lib/store';
import {Panel} from '@/components/Panel';

export default function Stock(){
  const{products,setProducts,setStockLogs,role,toast}=useStore();
  const[p,setP]=useState<Product|null>(null);
  const[q,setQ]=useState('');
  const[e,setE]=useState('');
  const[search,setSearch]=useState('');

  function open(prod:Product){setP(prod);setQ('');setE('')}
  function close(){setP(null);setQ('');setE('')}
  function save(){
    if(!p||Number(q)<=0){toast('Enter a valid stock quantity');return}
    const qty=Number(q),cost=Number(e)||p.expense;
    setProducts(v=>v.map(x=>x.id===p.id?{...x,stock:x.stock+qty,expense:role==='admin'?cost:x.expense}:x));
    setStockLogs(v=>[{id:Date.now(),productId:p.id,productName:p.name,qty,expense:cost,date:today(),type:'Purchase'},...v]);
    close();
    toast('Stock updated');
  }

  const qty=Number(q)||0;

  return <>
    <Panel>
      <div className="filterbar"><div className="search-box dark"><input value={search} onChange={x=>setSearch(x.target.value)} placeholder="Search product..."/></div></div>
      <div className="table-card"><table>
        <thead><tr><th>Product</th><th>Category</th><th>Current Stock</th>{role==='admin'&&<th>Expense / Unit</th>}<th>Status</th><th>Action</th></tr></thead>
        <tbody>{products.filter(x=>x.name.toLowerCase().includes(search.toLowerCase())).map(x=>
          <tr key={x.id}>
            <td><div className="prod-cell"><img src={x.image||"/placeholder.svg"} alt={x.name}/><b>{x.name}</b></div></td>
            <td>{x.category}</td>
            <td><b>{x.stock}</b></td>
            {role==='admin'&&<td>{money(x.expense)}</td>}
            <td><span className={x.stock<5?'pill low':'pill good'}>{x.stock<5?'Low Stock':'In Stock'}</span></td>
            <td><button className="icon-btn" onClick={()=>open(x)} title="Add stock"><Plus size={16}/></button></td>
          </tr>)}
        </tbody>
      </table></div>
    </Panel>

    {p&&<div className="overlay" onClick={close}><div className="modal stock-modal" onClick={ev=>ev.stopPropagation()}>
      <button className="modal-x" onClick={close} aria-label="Close">×</button>
      <div className="stock-modal-head">
        <span className="stock-modal-icon"><PackagePlus size={20}/></span>
        <div><h2>Add Stock</h2><p>Record a new purchase for this product</p></div>
      </div>
      <div className="stock-modal-product">
        <img src={p.image||"/placeholder.svg"} alt={p.name}/>
        <div><b>{p.name}</b><small>{p.category}</small></div>
        <div className="stock-modal-current"><span>Current</span><b>{p.stock}</b></div>
      </div>
      <div className="stock-modal-fields">
        <label>Quantity to add<input type="number" min={1} value={q} onChange={x=>setQ(x.target.value)} placeholder="e.g. 10" autoFocus/></label>
        {role==='admin'&&<label>Purchase cost / unit (₹)<input type="number" min={0} value={e} onChange={x=>setE(x.target.value)} placeholder={String(p.expense)}/></label>}
      </div>
      {qty>0&&<div className="stock-modal-summary"><span>New stock total</span><b>{p.stock} + {qty} = {p.stock+qty}</b></div>}
      <div className="modal-actions"><button className="ghost-btn" onClick={close}>Cancel</button><button className="primary-btn" onClick={save}><Plus size={16}/>Add Stock</button></div>
    </div></div>}
  </>;
}
