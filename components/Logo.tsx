'use client';
import {useSiteSettings} from '@/lib/site-settings';

export default function Logo({small=false}:{small?:boolean}){
  const{logo,headerTitle}=useSiteSettings();
  return <div className={'brand '+(small?'small':'')}>
    <img className="brand-logo-image" src={logo} alt={headerTitle}/>
  </div>
}
