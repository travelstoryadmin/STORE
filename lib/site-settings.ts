'use client';

import {useEffect,useState} from 'react';

export type SiteSettings={
  storeName:string; whatsapp:string; currency:string; theme:string; accent:string; headerTitle:string; logo:string;
  contactPhone:string; instagram:string; facebook:string; address:string; aboutText:string; upiId:string; showQr:boolean;
};

export const DEFAULT_SITE_SETTINGS:SiteSettings={
  storeName:'Travel Store',whatsapp:'919999999999',currency:'INR (₹)',theme:'Emerald Luxury',accent:'Forest Green',headerTitle:'Travel Store',logo:'/travel-story-logo.jpeg',
  contactPhone:'',instagram:'',facebook:'',address:'',aboutText:'Travel Store brings premium attars, thoughtful gifts, home décor and beautiful everyday products for every special moment.',upiId:'',showQr:false
};

const STORAGE_KEY='travel_site_settings_v2';
function clean(value:unknown,fallback:string){return typeof value==='string'&&value.trim()?value.trim():fallback;}
function normalize(value:Partial<SiteSettings>|null|undefined):SiteSettings{
  const p=value||{};
  return {
    storeName:clean(p.storeName,DEFAULT_SITE_SETTINGS.storeName),whatsapp:clean(p.whatsapp,DEFAULT_SITE_SETTINGS.whatsapp),currency:clean(p.currency,DEFAULT_SITE_SETTINGS.currency),theme:clean(p.theme,DEFAULT_SITE_SETTINGS.theme),accent:clean(p.accent,DEFAULT_SITE_SETTINGS.accent),headerTitle:clean(p.headerTitle,DEFAULT_SITE_SETTINGS.headerTitle),logo:clean(p.logo,DEFAULT_SITE_SETTINGS.logo),
    contactPhone:clean(p.contactPhone,DEFAULT_SITE_SETTINGS.contactPhone),instagram:clean(p.instagram,DEFAULT_SITE_SETTINGS.instagram),facebook:clean(p.facebook,DEFAULT_SITE_SETTINGS.facebook),address:clean(p.address,DEFAULT_SITE_SETTINGS.address),aboutText:clean(p.aboutText,DEFAULT_SITE_SETTINGS.aboutText),upiId:clean(p.upiId,DEFAULT_SITE_SETTINGS.upiId),showQr:typeof p.showQr==='boolean'?p.showQr:DEFAULT_SITE_SETTINGS.showQr
  };
}

export function readSiteSettings():SiteSettings{
  if(typeof window==='undefined')return DEFAULT_SITE_SETTINGS;
  try{const bundle=localStorage.getItem(STORAGE_KEY);if(bundle)return normalize(JSON.parse(bundle));}catch{}
  const get=(key:keyof SiteSettings,fallback:string)=>localStorage.getItem(`travel_${key}`)||fallback;
  return normalize({storeName:get('storeName',DEFAULT_SITE_SETTINGS.storeName),whatsapp:get('whatsapp',DEFAULT_SITE_SETTINGS.whatsapp),currency:get('currency',DEFAULT_SITE_SETTINGS.currency),theme:get('theme',DEFAULT_SITE_SETTINGS.theme),accent:get('accent',DEFAULT_SITE_SETTINGS.accent),headerTitle:get('headerTitle',DEFAULT_SITE_SETTINGS.headerTitle),logo:get('logo',DEFAULT_SITE_SETTINGS.logo)});
}

function cache(settings:SiteSettings){
  localStorage.setItem(STORAGE_KEY,JSON.stringify(settings));
  (Object.keys(settings) as (keyof SiteSettings)[]).forEach(key=>localStorage.setItem(`travel_${key}`,String(settings[key])));
  localStorage.setItem('travel_settings_saved_at',new Date().toISOString());
}

export async function saveSiteSettings(settings:SiteSettings){
  if(typeof window==='undefined')return false;
  const next=normalize(settings);cache(next);window.dispatchEvent(new CustomEvent('travel-settings-changed',{detail:next}));
  try{
    const res=await fetch('/api/site-settings',{method:'PUT',headers:{'Content-Type':'application/json'},body:JSON.stringify(next),cache:'no-store'});
    if(!res.ok)throw new Error('cloud save failed');
    const data=await res.json();const synced=normalize(data.settings||next);cache(synced);window.dispatchEvent(new CustomEvent('travel-settings-changed',{detail:synced}));
    return true;
  }catch{return false;}
}

export function useSiteSettings(){
  const[settings,setSettings]=useState<SiteSettings>(DEFAULT_SITE_SETTINGS);
  useEffect(()=>{
    let active=true;
    const sync=(event?:Event)=>{const custom=event as CustomEvent<SiteSettings>|undefined;if(active)setSettings(custom?.detail||readSiteSettings());};
    sync();
    const load=async()=>{
      try{
        const res=await fetch('/api/site-settings',{cache:'no-store'});
        if(res.ok){const data=await res.json();if(active&&data?.settings){const next=normalize(data.settings);cache(next);setSettings(next);}return;}
        // If the cloud table is empty, establish a shared default instead of
        // letting each device create a different local-only setting.
        if(res.status===404){
          const local=readSiteSettings();
          const seed=local?.storeName&&local.storeName!=='Travel Story'?local:DEFAULT_SITE_SETTINGS;
          const put=await fetch('/api/site-settings',{method:'PUT',headers:{'Content-Type':'application/json'},body:JSON.stringify(seed),cache:'no-store'});
          if(put.ok&&active){const data=await put.json();const next=normalize(data.settings||seed);cache(next);setSettings(next);window.dispatchEvent(new CustomEvent('travel-settings-changed',{detail:next}));}
        }
      }catch{}
    };
    load();
    window.addEventListener('travel-settings-changed',sync);window.addEventListener('storage',sync);
    return()=>{active=false;window.removeEventListener('travel-settings-changed',sync);window.removeEventListener('storage',sync)};
  },[]);
  return settings;
}

export function whatsappNumber(value:string){const digits=(value||'').replace(/\D/g,'');return digits.startsWith('00')?digits.slice(2):digits;}
export function upiQrImage(upiId:string,storeName:string){const pa=upiId.trim();if(!pa)return '';const payload=`upi://pay?pa=${pa}&pn=${encodeURIComponent(storeName)}&cu=INR`;return `https://api.qrserver.com/v1/create-qr-code/?size=320x320&margin=12&data=${encodeURIComponent(payload)}`;}
