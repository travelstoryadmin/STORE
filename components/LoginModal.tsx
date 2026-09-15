'use client';
import {FormEvent,useState} from 'react';
import {useRouter} from 'next/navigation';
import {X,LockKeyhole} from 'lucide-react';
import Logo from '@/components/Logo';
import {useStore} from '@/lib/store';

export default function LoginModal({onClose}:{onClose:()=>void}){
  const router=useRouter();
  const{login,toast}=useStore();
  const[u,setU]=useState('');
  const[p,setP]=useState('');
  function submit(e:FormEvent){
    e.preventDefault();
    const user=login(u,p);
    if(user){toast(`Welcome, ${user.name}`);router.push('/admin/dashboard')}
    else toast('Invalid username or password');
  }
  return <div className="overlay login-overlay" onClick={onClose}>
    <div className="login-modal" onClick={ev=>ev.stopPropagation()}>
      <button className="modal-x" onClick={onClose} aria-label="Close"><X size={18}/></button>
      <div className="modal-logo"><Logo small/></div>
      <h2>Welcome Back</h2>
      <p>Login to manage your products</p>
      <form onSubmit={submit}>
        <label>Username<input value={u} onChange={e=>setU(e.target.value)} placeholder="Enter username" autoFocus/></label>
        <label>Password<input type="password" value={p} onChange={e=>setP(e.target.value)} placeholder="Enter password"/></label>
        <button className="submit-btn" type="submit"><LockKeyhole size={16}/>Login</button>
      </form>
      <small>Admin / Staff Only</small>
      <div className="demo-hint">Admin: admin / admin123 · Staff: staff / staff123</div>
    </div>
  </div>;
}
