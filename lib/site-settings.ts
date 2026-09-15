'use client';

import {useEffect,useState} from 'react';

export type SiteSettings={
  storeName:string;
  whatsapp:string;
  currency:string;
  theme:string;
  accent:string;
  headerTitle:string;
  logo:string;
};

export const DEFAULT_SITE_SETTINGS:SiteSettings={
  storeName:'Travel Story',
  whatsapp:'919999999999',
  currency:'INR (₹)',
  theme:'Emerald Luxury',
  accent:'Forest Green',
  headerTitle:'Travel Story',
  logo:'/travel-story-logo.jpeg'
};

export function readSiteSettings():SiteSettings{
  if(typeof window==='undefined') return DEFAULT_SITE_SETTINGS;
  const get=(key:keyof SiteSettings,fallback:string)=>localStorage.getItem(`travel_${key}`)||fallback;
  return {
    storeName:get('storeName',DEFAULT_SITE_SETTINGS.storeName),
    whatsapp:get('whatsapp',DEFAULT_SITE_SETTINGS.whatsapp),
    currency:get('currency',DEFAULT_SITE_SETTINGS.currency),
    theme:get('theme',DEFAULT_SITE_SETTINGS.theme),
    accent:get('accent',DEFAULT_SITE_SETTINGS.accent),
    headerTitle:get('headerTitle',DEFAULT_SITE_SETTINGS.headerTitle),
    logo:get('logo',DEFAULT_SITE_SETTINGS.logo)
  };
}

export function saveSiteSettings(settings:SiteSettings){
  if(typeof window==='undefined') return;
  (Object.keys(settings) as (keyof SiteSettings)[]).forEach(key=>localStorage.setItem(`travel_${key}`,settings[key]));
  window.dispatchEvent(new CustomEvent('travel-settings-changed'));
}

export function useSiteSettings(){
  const[settings,setSettings]=useState<SiteSettings>(DEFAULT_SITE_SETTINGS);
  useEffect(()=>{
    const sync=()=>setSettings(readSiteSettings());
    sync();
    window.addEventListener('travel-settings-changed',sync);
    window.addEventListener('storage',sync);
    const timer=window.setInterval(sync,1000);
    return()=>{window.removeEventListener('travel-settings-changed',sync);window.removeEventListener('storage',sync);window.clearInterval(timer)};
  },[]);
  return settings;
}

export function whatsappNumber(value:string){
  const digits=value.replace(/\D/g,'');
  return digits.startsWith('00')?digits.slice(2):digits;
}
