'use client';

import {useEffect} from 'react';
import {animate} from 'motion';

export default function MotionInteractions(){
  useEffect(()=>{
    const reduce=window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if(reduce)return;
    const cleanups:(()=>void)[]=[];
    const setup=()=>{
      const selectors=['.hero-copy button','.login-btn','.offer button','.public-card button','.qr-head-btn','.logout','.content button'];
      const els=Array.from(document.querySelectorAll<HTMLElement>(selectors.join(',')));
      els.forEach(el=>{
        const enter=()=>{animate(el as any,{transform:'translateY(-3px) scale(1.025)'},{duration:.22,easing:'ease-out'});};
        const leave=()=>{animate(el as any,{transform:'translateY(0px) scale(1)'},{duration:.28,easing:'ease-out'});};
        el.addEventListener('mouseenter',enter);el.addEventListener('mouseleave',leave);
        cleanups.push(()=>{el.removeEventListener('mouseenter',enter);el.removeEventListener('mouseleave',leave);});
      });
    };
    setup();
    const observer=new MutationObserver(setup);
    observer.observe(document.body,{childList:true,subtree:true});
    return()=>{observer.disconnect();cleanups.forEach(fn=>fn());};
  },[]);
  return null;
}
