'use client';
import {useEffect} from 'react';
import {useSiteSettings} from '@/lib/site-settings';
import {THEME_MAP} from '@/lib/theme-catalog';

export default function SiteThemeRuntime(){
  const{theme,accent}=useSiteSettings();
  useEffect(()=>{
    const root=document.documentElement;
    const t=THEME_MAP[theme]||THEME_MAP['Emerald Luxury'];
    const accentMap:Record<string,string>={'Forest Green':t.green,'Warm Gold':t.gold,'Deep Teal':'#0d5960','Plum':'#76507f','Ocean Blue':'#34758b'};
    root.style.setProperty('--green',t.green);
    root.style.setProperty('--green2',t.green2);
    root.style.setProperty('--cream',t.cream);
    root.style.setProperty('--gold',accentMap[accent]||t.gold);
    root.style.setProperty('--mint',t.soft);
    root.style.setProperty('--theme-page',t.page);
    root.style.setProperty('--theme-hero',t.hero);
    root.style.setProperty('--theme-text',t.text);
    root.style.setProperty('--theme-muted',t.muted);
    root.style.setProperty('--theme-line',t.line);
    root.style.setProperty('--theme-on-green',t.onGreen);
    root.style.setProperty('--theme-card','#ffffff');
    root.dataset.theme=theme;
    root.dataset.accent=accent;
  },[theme,accent]);
  return null;
}
