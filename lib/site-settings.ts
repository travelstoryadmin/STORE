'use client';

import {useEffect,useState} from 'react';

export type SiteSettings={
  storeName:string; whatsapp:string; currency:string; theme:string; accent:string; headerTitle:string; logo:string;
  contactPhone:string; instagram:string; facebook:string; address:string; aboutText:string; upiId:string; showQr:boolean;
};

export const DEFAULT_SITE_SETTINGS:SiteSettings={
  storeName:'Travel Story',whatsapp:'919999999999',currency:'INR (₹)',theme:'Emerald Luxury',accent:'Forest Green',headerTitle:'Travel Story',logo:'/travel-story-logo.jpeg',
  contactPhone:'',instagram:'',facebook:'',address:'',aboutText:'Travel Story brings premium attars, thoughtful gifts, home décor and beautiful everyday products for every special moment.',upiId:'',showQr:false
};

const STORAGE_KEY='travel_site_settings_v2';
function clean(value:unknown,fallback:string){return typeof value==='string'&&value.trim()?value.trim():fallback;}

export function readSiteSettings():SiteSettings{
  if(typeof window==='undefined') return DEFAULT_SITE_SETTINGS;
  try{
    const bundle=localStorage.getItem(STORAGE_KEY);
    if(bundle){
      const p=JSON.parse(bundle) as Partial<SiteSettings>;
      return {
        storeName:clean(p.storeName,DEFAULT_SITE_SETTINGS.storeName),whatsapp:clean(p.whatsapp,DEFAULT_SITE_SETTINGS.whatsapp),currency:clean(p.currency,DEFAULT_SITE_SETTINGS.currency),theme:clean(p.theme,DEFAULT_SITE_SETTINGS.theme),accent:clean(p.accent,DEFAULT_SITE_SETTINGS.accent),headerTitle:clean(p.headerTitle,DEFAULT_SITE_SETTINGS.headerTitle),logo:clean(p.logo,DEFAULT_SITE_SETTINGS.logo),
        contactPhone:clean(p.contactPhone,DEFAULT_SITE_SETTINGS.contactPhone),instagram:clean(p.instagram,DEFAULT_SITE_SETTINGS.instagram),facebook:clean(p.facebook,DEFAULT_SITE_SETTINGS.facebook),address:clean(p.address,DEFAULT_SITE_SETTINGS.address),aboutText:clean(p.aboutText,DEFAULT_SITE_SETTINGS.aboutText),upiId:clean(p.upiId,DEFAULT_SITE_SETTINGS.upiId),showQr:typeof p.showQr==='boolean'?p.showQr:DEFAULT_SITE_SETTINGS.showQr
      };
    }
  }catch{}
  const get=(key:keyof SiteSettings,fallback:string)=>localStorage.getItem(`travel_${key}`)||fallback;
  return {...DEFAULT_SITE_SETTINGS,storeName:get('storeName',DEFAULT_SITE_SETTINGS.storeName),whatsapp:get('whatsapp',DEFAULT_SITE_SETTINGS.whatsapp),currency:get('currency',DEFAULT_SITE_SETTINGS.currency),theme:get('theme',DEFAULT_SITE_SETTINGS.theme),accent:get('accent',DEFAULT_SITE_SETTINGS.accent),headerTitle:get('headerTitle',DEFAULT_SITE_SETTINGS.headerTitle),logo:get('logo',DEFAULT_SITE_SETTINGS.logo)};
}

export function saveSiteSettings(settings:SiteSettings){
  if(typeof window==='undefined') return;
  const next:SiteSettings={
    storeName:clean(settings.storeName,DEFAULT_SITE_SETTINGS.storeName),whatsapp:clean(settings.whatsapp,DEFAULT_SITE_SETTINGS.whatsapp),currency:clean(settings.currency,DEFAULT_SITE_SETTINGS.currency),theme:clean(settings.theme,DEFAULT_SITE_SETTINGS.theme),accent:clean(settings.accent,DEFAULT_SITE_SETTINGS.accent),headerTitle:clean(settings.headerTitle,DEFAULT_SITE_SETTINGS.headerTitle),logo:clean(settings.logo,DEFAULT_SITE_SETTINGS.logo),
    contactPhone:clean(settings.contactPhone,DEFAULT_SITE_SETTINGS.contactPhone),instagram:clean(settings.instagram,DEFAULT_SITE_SETTINGS.instagram),facebook:clean(settings.facebook,DEFAULT_SITE_SETTINGS.facebook),address:clean(settings.address,DEFAULT_SITE_SETTINGS.address),aboutText:clean(settings.aboutText,DEFAULT_SITE_SETTINGS.aboutText),upiId:clean(settings.upiId,DEFAULT_SITE_SETTINGS.upiId),showQr:Boolean(settings.showQr)
  };
  localStorage.setItem(STORAGE_KEY,JSON.stringify(next));
  (Object.keys(next) as (keyof SiteSettings)[]).forEach(key=>localStorage.setItem(`travel_${key}`,String(next[key])));
  localStorage.setItem('travel_settings_saved_at',new Date().toISOString());
  window.dispatchEvent(new CustomEvent('travel-settings-changed',{detail:next}));
}

export function useSiteSettings(){
  const[settings,setSettings]=useState<SiteSettings>(DEFAULT_SITE_SETTINGS);
  useEffect(()=>{
    const sync=(event?:Event)=>{const custom=event as CustomEvent<SiteSettings>|undefined;setSettings(custom?.detail||readSiteSettings());};
    sync();window.addEventListener('travel-settings-changed',sync);window.addEventListener('storage',sync);
    return()=>{window.removeEventListener('travel-settings-changed',sync);window.removeEventListener('storage',sync)};
  },[]);return settings;
}

export function whatsappNumber(value:string){const digits=(value||'').replace(/\D/g,'');return digits.startsWith('00')?digits.slice(2):digits;}
export function upiQrImage(upiId:string,storeName:string){const pa=upiId.trim();if(!pa)return '';const payload=`upi://pay?pa=${pa}&pn=${encodeURIComponent(storeName)}&cu=INR`;return `https://api.qrserver.com/v1/create-qr-code/?size=320x320&margin=12&data=${encodeURIComponent(payload)}`;}
