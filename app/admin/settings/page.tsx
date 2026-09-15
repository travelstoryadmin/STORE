'use client';
import {useState} from 'react';
import {Save,ShieldCheck,Trash2,LockKeyhole,UserPlus,KeyRound,UserCog,Store,Users,Database,ChevronRight,X,Settings2} from 'lucide-react';
import {useStore,PERMISSIONS,Permission,User} from '@/lib/store';
import {Panel} from '@/components/Panel';

const permissionLabels:Record<Permission,string>={dashboard:'Dashboard',products:'Products',sales:'Sales / Billing',stock:'Stock Management',reports:'Reports',bills:'Bills & History',customers:'Customers',settings:'Settings'};
const safePermissions=(u:User)=>u.permissions||[];

type ModalType='store'|'account'|'password'|'staff'|'data'|null;

export default function Settings(){
 const{role,currentUser,users,setUsers,products,customers,bills,setProducts,setCustomers,setBills,setStockLogs,toast}=useStore();
 const[modal,setModal]=useState<ModalType>(null);
 const[oldPass,setOldPass]=useState('');
 const[newPass,setNewPass]=useState('');
 const[confirmPass,setConfirmPass]=useState('');
 const[name,setName]=useState('');
 const[username,setUsername]=useState('');
 const[password,setPassword]=useState('');
 const[permissions,setPermissions]=useState<Permission[]>(['sales','customers']);
 const[storeName,setStoreName]=useState('Travel Story');
 const[whatsapp,setWhatsapp]=useState('919999999999');
 const[currency,setCurrency]=useState('INR (₹)');

 function closeModal(){setModal(null)}
 function changePassword(){
  if(!currentUser||oldPass!==currentUser.password){toast('Current password is incorrect');return}
  if(newPass.length<6){toast('New password must be at least 6 characters');return}
  if(newPass!==confirmPass){toast('Passwords do not match');return}
  setUsers(v=>v.map(u=>u.id===currentUser.id?{...u,password:newPass,permissions:safePermissions(u)}:u));
  setOldPass('');setNewPass('');setConfirmPass('');closeModal();toast('Password changed successfully');
 }
 function createStaff(){
  const u=username.trim();const n=name.trim();
  if(!u||!n||password.length<6){toast('Enter name, username and a password of 6+ characters');return}
  if(users.some(x=>x.username.toLowerCase()===u.toLowerCase())){toast('Username already exists');return}
  if(!permissions.length){toast('Select at least one access permission');return}
  const user:User={id:Date.now(),username:u,password,role:'staff',name:n,permissions};
  setUsers(v=>[...v,user]);setName('');setUsername('');setPassword('');setPermissions(['sales','customers']);closeModal();toast('Staff account created');
 }
 function togglePermission(p:Permission){setPermissions(v=>v.includes(p)?v.filter(x=>x!==p):[...v,p])}
 function saveStore(){closeModal();toast('Store settings saved')}
 function reset(){
  if(confirm('Reset all Travel Story demo data?')){
   localStorage.removeItem('noor_products_v4');localStorage.removeItem('noor_customers_v4');localStorage.removeItem('noor_bills_v4');localStorage.removeItem('noor_stock_logs_v4');
   setProducts([]);setCustomers([]);setBills([]);setStockLogs([]);closeModal();toast('Demo data reset');
  }
 }

 const cards=[
  {key:'store' as ModalType,title:'Store Settings',desc:'Store name, WhatsApp & currency',icon:Store,tag:'GENERAL'},
  {key:'account' as ModalType,title:'Account & Access',desc:'Login role and security controls',icon:ShieldCheck,tag:'SECURITY'},
  {key:'password' as ModalType,title:'Change Password',desc:'Update your account password',icon:KeyRound,tag:'SECURITY'},
  ...(role==='admin'?[{key:'staff' as ModalType,title:'Staff Management',desc:'Create staff login & set access',icon:Users,tag:'ADMIN ONLY'}]:[]),
  {key:'data' as ModalType,title:'Data Overview',desc:'View your store data summary',icon:Database,tag:'OVERVIEW'},
 ];

 return <>
  <div className="settings-page">
   <div className="settings-intro">
    <div><div className="settings-kicker">TRAVEL STORY</div><h2>Settings</h2><p>Manage your store, account access and staff controls.</p></div>
    <div className="settings-badge"><Settings2 size={17}/><span>{role==='admin'?'Administrator':'Staff Account'}</span></div>
   </div>

   <div className="settings-cards">
    {cards.map(({key,title,desc,icon:Icon,tag})=><button key={title} className="settings-card" onClick={()=>setModal(key)}>
      <div className="settings-card-top"><span className="settings-icon"><Icon size={22}/></span><span className="settings-tag">{tag}</span></div>
      <div className="settings-card-title">{title}</div>
      <div className="settings-card-desc">{desc}</div>
      <div className="settings-open">Open <ChevronRight size={16}/></div>
    </button>)}
   </div>

   <div className="settings-note"><LockKeyhole size={18}/><div><b>Privacy & permissions</b><span>Expense and profit values are visible only to Admin accounts.</span></div></div>

   {role==='admin'&&<div className="danger-zone"><div><b>Danger Zone</b><span>Use this only when you want to remove demo products, customers, bills and stock logs.</span></div><button onClick={()=>setModal('data')} className="danger-outline"><Trash2 size={16}/> Reset Demo Data</button></div>}
  </div>

  {modal&&<div className="settings-overlay" onMouseDown={e=>{if(e.target===e.currentTarget)closeModal()}}>
   <div className="settings-modal">
    <button className="settings-close" onClick={closeModal}><X size={19}/></button>

    {modal==='store'&&<>
      <ModalHeader icon={<Store/>} title="Store Settings" subtitle="Update the basic information shown across Travel Story."/>
      <div className="modal-form">
       <label>Store Name<input value={storeName} onChange={e=>setStoreName(e.target.value)}/></label>
       <label>WhatsApp Number<input value={whatsapp} onChange={e=>setWhatsapp(e.target.value)}/></label>
       <label>Currency<input value={currency} onChange={e=>setCurrency(e.target.value)}/></label>
      </div>
      <ModalActions onCancel={closeModal} onSave={saveStore} saveText="Save Settings" icon={<Save/>}/>
    </>}

    {modal==='account'&&<>
      <ModalHeader icon={<ShieldCheck/>} title="Account & Access" subtitle="Review your current role and access level."/>
      <div className="account-profile"><div className="account-avatar">{role==='admin'?'A':'S'}</div><div><b>{currentUser?.name||'Administrator'}</b><span>@{currentUser?.username||'admin'}</span></div><strong>{role==='admin'?'ADMIN':'STAFF'}</strong></div>
      <div className="security-row"><LockKeyhole size={19}/><div><b>Protected information</b><span>Expenses and profit are restricted to Admin accounts.</span></div></div>
      <div className="access-list"><div className="section-label">CURRENT ACCESS</div>{(role==='admin'?PERMISSIONS:currentUser?.permissions||[]).map(p=><span key={p}>{permissionLabels[p]}</span>)}</div>
      <ModalActions onCancel={closeModal} onSave={closeModal} saveText="Done" icon={<ShieldCheck/>}/>
    </>}

    {modal==='password'&&<>
      <ModalHeader icon={<KeyRound/>} title="Change Password" subtitle="Keep your administrator or staff account secure."/>
      <div className="modal-form">
       <label>Current Password<input type="password" value={oldPass} onChange={e=>setOldPass(e.target.value)} placeholder="Enter current password"/></label>
       <label>New Password<input type="password" value={newPass} onChange={e=>setNewPass(e.target.value)} placeholder="Minimum 6 characters"/></label>
       <label>Confirm New Password<input type="password" value={confirmPass} onChange={e=>setConfirmPass(e.target.value)} placeholder="Re-enter new password"/></label>
      </div>
      <ModalActions onCancel={closeModal} onSave={changePassword} saveText="Change Password" icon={<KeyRound/>}/>
    </>}

    {modal==='staff'&&role==='admin'&&<>
      <ModalHeader icon={<UserPlus/>} title="Staff Management" subtitle="Create a staff login and choose exactly which pages they can access."/>
      <div className="modal-form staff-form">
       <label>Staff Name<input value={name} onChange={e=>setName(e.target.value)} placeholder="e.g. Accounts Staff"/></label>
       <div className="two-inputs"><label>Username<input value={username} onChange={e=>setUsername(e.target.value)} placeholder="Login username"/></label><label>Password<input type="password" value={password} onChange={e=>setPassword(e.target.value)} placeholder="Minimum 6 characters"/></label></div>
       <div className="section-label access-heading">PAGE ACCESS</div>
       <div className="permission-grid">{PERMISSIONS.map(p=><label className="permission-item" key={p}><input type="checkbox" checked={permissions.includes(p)} onChange={()=>togglePermission(p)}/><span>{permissionLabels[p]}</span></label>)}</div>
      </div>
      <button className="primary-btn modal-main-btn" onClick={createStaff}><UserCog size={17}/>Create Staff Account</button>
      <div className="staff-existing"><div className="section-label">EXISTING STAFF</div>{users.filter(u=>u.role==='staff').map(u=><div className="existing-staff" key={u.id}><div className="mini-avatar">{u.name.slice(0,1).toUpperCase()}</div><div><b>{u.name}</b><span>@{u.username} · {safePermissions(u).length} pages</span></div><em>STAFF</em></div>)}</div>
    </>}

    {modal==='data'&&<>
      <ModalHeader icon={<Database/>} title="Data Overview" subtitle="A quick summary of the information currently stored in this browser."/>
      <div className="data-counters"><div><span>Products</span><b>{products.length}</b></div><div><span>Customers</span><b>{customers.length}</b></div><div><span>Bills</span><b>{bills.length}</b></div></div>
      {role==='admin'&&<div className="reset-box"><div><b>Reset Demo Data</b><span>This clears products, customers, bills and stock logs from local storage.</span></div><button className="danger-wide" onClick={reset}><Trash2 size={16}/>Reset Everything</button></div>}
      <ModalActions onCancel={closeModal} onSave={closeModal} saveText="Close" icon={<Database/>}/>
    </>}
   </div>
  </div>}

  <style jsx>{`
   .settings-page{max-width:1100px;margin:0 auto;padding:4px 2px 28px}
   .settings-intro{display:flex;align-items:center;justify-content:space-between;gap:20px;margin:2px 0 20px}
   .settings-kicker{font-size:9px;letter-spacing:3px;color:#b8893b;font-weight:800;margin-bottom:4px}
   .settings-intro h2{margin:0;font-size:26px;font-family:'Playfair Display',serif;color:#17312b}
   .settings-intro p{margin:5px 0 0;color:#71807a;font-size:11px}
   .settings-badge{display:flex;align-items:center;gap:7px;background:#edf8f1;border:1px solid #d4e9dc;color:#075642;border-radius:99px;padding:9px 13px;font-size:10px;font-weight:800}
   .settings-cards{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:15px}
   .settings-card{text-align:left;background:linear-gradient(145deg,#fff,#f9fbfa);border:1px solid #dfe7e2;border-radius:16px;padding:19px;min-height:165px;box-shadow:0 8px 25px rgba(21,55,45,.05);transition:transform .18s ease,box-shadow .18s ease,border-color .18s ease;cursor:pointer;color:#14221e}
   .settings-card:hover{transform:translateY(-3px);box-shadow:0 14px 32px rgba(21,55,45,.10);border-color:#a9cdbb}
   .settings-card-top{display:flex;align-items:center;justify-content:space-between}
   .settings-icon{width:46px;height:46px;border-radius:13px;background:#eaf5ef;color:#075642;display:grid;place-items:center}
   .settings-tag{font-size:7px;letter-spacing:1px;font-weight:900;color:#8a9a93;background:#f3f6f4;border-radius:99px;padding:6px 8px}
   .settings-card-title{font-size:16px;font-weight:800;margin-top:18px}
   .settings-card-desc{font-size:10px;color:#71807a;margin-top:5px;line-height:1.5}
   .settings-open{display:flex;align-items:center;gap:3px;color:#087252;font-size:10px;font-weight:800;margin-top:16px}
   .settings-note{display:flex;align-items:center;gap:11px;margin-top:15px;padding:13px 15px;background:#edf8f1;border:1px solid #d5e9dc;border-radius:12px;color:#075642}
   .settings-note b,.settings-note span{display:block}.settings-note b{font-size:10px}.settings-note span{font-size:9px;color:#71807a;margin-top:3px}
   .danger-zone{display:flex;align-items:center;justify-content:space-between;gap:15px;margin-top:15px;padding:14px 16px;border:1px solid #f0d5d5;background:#fff8f8;border-radius:12px}.danger-zone b,.danger-zone span{display:block}.danger-zone b{font-size:10px;color:#a52d35}.danger-zone span{font-size:8px;color:#8b7777;margin-top:3px}
   .danger-outline{display:flex;align-items:center;gap:6px;background:#fff;color:#c73b45;border:1px solid #edbfc2;border-radius:8px;padding:9px 12px;font-size:9px;font-weight:800;white-space:nowrap}
   .settings-overlay{position:fixed;inset:0;background:rgba(7,29,23,.62);backdrop-filter:blur(3px);display:grid;place-items:center;z-index:100;padding:20px}
   .settings-modal{position:relative;width:min(620px,96vw);max-height:90vh;overflow:auto;background:#fff;border:1px solid #dfe7e2;border-radius:20px;padding:25px;box-shadow:0 25px 80px rgba(0,0,0,.25)}
   .settings-close{position:absolute;right:15px;top:15px;width:32px;height:32px;border-radius:50%;background:#f3f6f4;color:#61706a;display:grid;place-items:center}
   .settings-close:hover{background:#eaf5ef;color:#075642}
   .modal-head{display:flex;align-items:center;gap:12px;padding-right:35px;margin-bottom:20px}.modal-head-icon{width:44px;height:44px;border-radius:12px;background:#eaf5ef;color:#075642;display:grid;place-items:center}.modal-head h3{margin:0;font-size:17px}.modal-head p{margin:4px 0 0;color:#71807a;font-size:9px;line-height:1.45}
   .modal-form{display:grid;gap:12px}.modal-form label{margin:0}.modal-form input{margin-top:6px;padding:11px;border-radius:9px;font-size:10px}
   .two-inputs{display:grid;grid-template-columns:1fr 1fr;gap:11px}.two-inputs label{margin:0}
   .modal-actions{display:flex;justify-content:flex-end;gap:8px;margin-top:20px;padding-top:14px;border-top:1px solid #edf1ef}.modal-actions .ghost-btn{padding:10px 14px}
   .account-profile{display:flex;align-items:center;gap:11px;background:#f5f8f6;border:1px solid #e4ebe7;padding:13px;border-radius:11px}.account-avatar{width:40px;height:40px;border-radius:50%;background:#dff2e6;color:#075642;display:grid;place-items:center;font-weight:900}.account-profile b,.account-profile span{display:block}.account-profile b{font-size:11px}.account-profile span{font-size:8px;color:#71807a;margin-top:3px}.account-profile strong{margin-left:auto;background:#eaf5ef;color:#075642;padding:5px 8px;border-radius:99px;font-size:7px}
   .security-row{display:flex;gap:10px;align-items:center;margin-top:12px;padding:12px;background:#edf8f1;border-radius:10px;color:#075642}.security-row b,.security-row span{display:block}.security-row b{font-size:9px}.security-row span{font-size:8px;color:#71807a;margin-top:3px}
   .section-label{font-size:7px;letter-spacing:1.2px;color:#8a9a93;font-weight:900}.access-list{margin-top:16px}.access-list>span{display:inline-block;background:#f3f6f4;border:1px solid #e2eae5;color:#52635b;padding:6px 8px;border-radius:7px;font-size:8px;font-weight:700;margin:7px 5px 0 0}
   .access-heading{margin-top:4px}.permission-grid{display:grid;grid-template-columns:repeat(2,1fr);gap:8px;margin-top:8px}.permission-item{display:flex!important;align-items:center;gap:8px;background:#f6f8f7;border:1px solid #e5ebe8;border-radius:8px;padding:9px!important;margin:0!important;font-size:8px!important;font-weight:700!important}.permission-item input{width:14px!important;margin:0!important}.modal-main-btn{margin-top:15px}.staff-existing{margin-top:20px;border-top:1px solid #edf1ef;padding-top:14px}.existing-staff{display:flex;align-items:center;gap:9px;margin-top:8px;padding:9px;background:#f7f9f8;border-radius:9px}.mini-avatar{width:30px;height:30px;border-radius:50%;display:grid;place-items:center;background:#eaf5ef;color:#075642;font-size:9px;font-weight:900}.existing-staff b,.existing-staff span{display:block}.existing-staff b{font-size:9px}.existing-staff span{font-size:7px;color:#71807a;margin-top:2px}.existing-staff em{margin-left:auto;font-style:normal;font-size:7px;color:#087252;background:#def6e8;padding:5px 7px;border-radius:99px;font-weight:800}
   .data-counters{display:grid;grid-template-columns:repeat(3,1fr);gap:10px}.data-counters>div{background:#f6f8f7;border:1px solid #e4ebe7;border-radius:11px;padding:15px;text-align:center}.data-counters span,.data-counters b{display:block}.data-counters span{font-size:8px;color:#71807a}.data-counters b{font-size:24px;color:#075642;margin-top:5px}.reset-box{margin-top:15px;padding:13px;background:#fff5f5;border:1px solid #f0d5d5;border-radius:10px}.reset-box b,.reset-box span{display:block}.reset-box b{font-size:10px;color:#a52d35}.reset-box span{font-size:8px;color:#8b7777;margin-top:3px}.reset-box .danger-wide{width:auto;margin-top:10px}
   @media(max-width:760px){.settings-cards{grid-template-columns:1fr}.settings-intro{align-items:flex-start;flex-direction:column}.settings-badge{align-self:flex-start}.two-inputs,.permission-grid,.data-counters{grid-template-columns:1fr}.settings-modal{padding:20px}.danger-zone{align-items:flex-start;flex-direction:column}.danger-outline{width:100%;justify-content:center}}
  `}</style>
 </>
}

function ModalHeader({icon,title,subtitle}:{icon:React.ReactNode;title:string;subtitle:string}){
 return <div className="modal-head"><span className="modal-head-icon">{icon}</span><div><h3>{title}</h3><p>{subtitle}</p></div></div>
}

function ModalActions({onCancel,onSave,saveText,icon}:{onCancel:()=>void;onSave:()=>void;saveText:string;icon:React.ReactNode}){
 return <div className="modal-actions"><button className="ghost-btn" onClick={onCancel}>Cancel</button><button className="primary-btn" onClick={onSave}>{icon}{saveText}</button></div>
}
