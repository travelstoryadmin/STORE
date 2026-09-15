'use client';
import Link from 'next/link';
import {usePathname,useRouter} from 'next/navigation';
import {BarChart3,Boxes,FileText,LayoutDashboard,LogOut,Package,ReceiptText,Settings,ShoppingCart,Users,WalletCards} from 'lucide-react';
import Logo from './Logo';
import Toast from './Toast';
import {useStore} from '@/lib/store';
const nav=[['Dashboard','/admin/dashboard',LayoutDashboard],['Products','/admin/products',Package],['Sales / Billing','/admin/sales',ShoppingCart],['Stock Management','/admin/stock',Boxes],['Expenses','/admin/expenses',WalletCards],['Reports','/admin/reports',BarChart3],['Bills & History','/admin/bills',ReceiptText],['Customers','/admin/customers',Users],['Settings','/admin/settings',Settings]] as const;
export default function AdminShell({children}:{children:React.ReactNode}){
 const path=usePathname();const router=useRouter();const{role,setLogged}=useStore();
 function logout(){setLogged(false);router.push('/')}
 const title=nav.find(n=>n[1]===path)?.[0]||'Admin Panel';
 return <><aside className="sidebar"><div className="brand-row"><Logo/><strong>Travel Story</strong></div><nav>{nav.map(([label,href,Icon])=>{if(role==='staff'&&label==='Expenses')return null;return <Link key={href} href={href} className={path===href?'active':''}><Icon size={18}/>{label}{label==='Expenses'&&<small>ADMIN</small>}</Link>})}</nav><button className="logout" onClick={logout}><LogOut size={17}/>Logout</button></aside><main className="main-area"><header className="admin-header"><div><div className="page-brand">Travel Story</div><h1>{title}</h1></div><div className="profile"><div className="avatar">{role==='admin'?'A':'S'}</div><div><b>{role==='admin'?'Admin':'Staff'}</b><small>{role==='admin'?'Administrator':'Staff Member'}</small></div></div></header><section className="content">{children}</section></main><Toast/></>}
