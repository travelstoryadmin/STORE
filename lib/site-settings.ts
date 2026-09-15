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

const STORAGE_KEY='travel_site_settings_v2';

function clean(value:unknown,fallback:string){
  return typeof value==='string'&&value.trim()?value.trim():fallback;
}

export function readSiteSettings():SiteSettings{
  if(typeof window==='undefined') return DEFAULT_SITE_SETTINGS;
  try{
    const bundle=localStorage.getItem(STORAGE_KEY);
    if(bundle){
      const parsed=JSON.parse(bundle) as Partial<SiteSettings>;
      return {
        storeName:clean(parsed.storeName,DEFAULT_SITE_SETTINGS.storeName),
        whatsapp:clean(parsed.whatsapp,DEFAULT_SITE_SETTINGS.whatsapp),
        currency:clean(parsed.currency,DEFAULT_SITE_SETTINGS.currency),
        theme:clean(parsed.theme,DEFAULT_SITE_SETTINGS.theme),
        accent:clean(parsed.accent,DEFAULT_SITE_SETTINGS.accent),
        headerTitle:clean(parsed.headerTitle,DEFAULT_SITE_SETTINGS.headerTitle),
        logo:clean(parsed.logo,DEFAULT_SITE_SETTINGS.logo)
      };
    }
  }catch{}
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
  const next:SiteSettings={
    storeName:clean(settings.storeName,DEFAULT_SITE_SETTINGS.storeName),
    whatsapp:clean(settings.whatsapp,DEFAULT_SITE_SETTINGS.whatsapp),
    currency:clean(settings.currency,DEFAULT_SITE_SETTINGS.currency),
    theme:clean(settings.theme,DEFAULT_SITE_SETTINGS.theme),
    accent:clean(settings.accent,DEFAULT_SITE_SETTINGS.accent),
    headerTitle:clean(settings.headerTitle,DEFAULT_SITE_SETTINGS.headerTitle),
    logo:clean(settings.logo,DEFAULT_SITE_SETTINGS.logo)
  };
  localStorage.setItem(STORAGE_KEY,JSON.stringify(next));
  (Object.keys(next) as (keyof SiteSettings)[]).forEach(key=>localStorage.setItem(`travel_${key}`,next[key]));
  localStorage.setItem('travel_settings_saved_at',new Date().toISOString());
  window.dispatchEvent(new CustomEvent('travel-settings-changed',{detail:next}));
}

export function useSiteSettings(){
  const[settings,setSettings]=useState<SiteSettings>(DEFAULT_SITE_SETTINGS);
  useEffect(()=>{
    const sync=(event?:Event)=>{
      const custom=event as CustomEvent<SiteSettings>|undefined;
      setSettings(custom?.detail||readSiteSettings());
    };
    sync();
    window.addEventListener('travel-settings-changed',sync);
    window.addEventListener('storage',()=>sync());
    return()=>window.removeEventListener('travel-settings-changed',sync);
  },[]);
  return settings;
}

export function whatsappNumber(value:string){
  const digits=(value||'').replace(/\D/g,'');
  return digits.startsWith('00')?digits.slice(2):digits;
}
