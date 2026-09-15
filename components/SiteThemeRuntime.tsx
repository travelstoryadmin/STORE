'use client';
import {useEffect} from 'react';
import {useSiteSettings} from '@/lib/site-settings';

export default function SiteThemeRuntime(){
  const{theme,accent}=useSiteSettings();
  useEffect(()=>{
    const root=document.documentElement;
    const themes:Record<string,[string,string,string]>={
      'Emerald Luxury':['#075642','#0a745a','#f7f1e7'],
      'Midnight Gold':['#173027','#315e4e','#f3ead8'],
      'Travel Teal':['#0d5960','#17818a','#f4ead7'],
      'Royal Plum':['#4d315c','#76507f','#f5ecdf'],
      'Ocean Sand':['#23556a','#34758b','#f4ead8']
    };
    const [green,green2,cream]=themes[theme]||themes['Emerald Luxury'];
    const accentMap:Record<string,string>={'Forest Green':green,'Warm Gold':'#b8893b','Deep Teal':'#0d5960','Plum':'#76507f','Ocean Blue':'#34758b'};
    root.style.setProperty('--green',green);root.style.setProperty('--green2',green2);root.style.setProperty('--cream',cream);root.style.setProperty('--gold',accentMap[accent]||'#b8893b');root.dataset.theme=theme;
  },[theme,accent]);
  return null;
}
