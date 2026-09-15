'use client';
import {useEffect} from 'react';
import {useSiteSettings} from '@/lib/site-settings';

export default function SiteThemeRuntime(){
  const{theme,accent}=useSiteSettings();
  useEffect(()=>{
    const root=document.documentElement;
    const themes:Record<string,{green:string;green2:string;cream:string;gold:string;page:string;soft:string;hero:string;text:string}>={
      'Emerald Luxury':{green:'#075642',green2:'#0a745a',cream:'#f7f1e7',gold:'#b8893b',page:'#f4f7f5',soft:'#eaf5ef',hero:'#f3e5d1',text:'#14221e'},
      'Midnight Gold':{green:'#10251f',green2:'#315e4e',cream:'#f3ead8',gold:'#c79b52',page:'#eef1ef',soft:'#e6ece8',hero:'#e8dfce',text:'#15221e'},
      'Travel Teal':{green:'#0d5960',green2:'#17818a',cream:'#f4ead7',gold:'#b8893b',page:'#f1f6f5',soft:'#e5f1ef',hero:'#e9dfca',text:'#142321'},
      'Royal Plum':{green:'#4d315c',green2:'#76507f',cream:'#f5ecdf',gold:'#c7a66a',page:'#f6f2f5',soft:'#eee6f0',hero:'#eee2e5',text:'#241b28'},
      'Ocean Sand':{green:'#23556a',green2:'#34758b',cream:'#f4ead8',gold:'#b98c50',page:'#f1f5f6',soft:'#e5eef1',hero:'#e9dfcf',text:'#15242a'}
    };
    const t=themes[theme]||themes['Emerald Luxury'];
    const accentMap:Record<string,string>={'Forest Green':t.green,'Warm Gold':t.gold,'Deep Teal':'#0d5960','Plum':'#76507f','Ocean Blue':'#34758b'};
    root.style.setProperty('--green',t.green);
    root.style.setProperty('--green2',t.green2);
    root.style.setProperty('--cream',t.cream);
    root.style.setProperty('--gold',accentMap[accent]||t.gold);
    root.style.setProperty('--mint',t.soft);
    root.style.setProperty('--theme-page',t.page);
    root.style.setProperty('--theme-hero',t.hero);
    root.style.setProperty('--theme-text',t.text);
    root.dataset.theme=theme;
    root.dataset.accent=accent;
  },[theme,accent]);
  return null;
}
