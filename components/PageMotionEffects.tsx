'use client';
import {useEffect} from 'react';
import {motion} from 'motion/react';
import {gsap} from 'gsap';
import {usePathname} from 'next/navigation';

export default function PageMotionEffects(){
  const pathname=usePathname();
  useEffect(()=>{
    const reduce=window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if(reduce)return;
    const ctx=gsap.context(()=>{
      const selectors=pathname.startsWith('/admin')
        ? '.content > *, .content .panel, .content .kpi, .content .settings-v2-card, .content table tbody tr'
        : '.public-head, .hero-copy, .hero-photo, .category-row > button, .offer, .public-card, .public-info, footer';
      const items=gsap.utils.toArray<HTMLElement>(selectors).filter(Boolean);
      if(!items.length)return;
      gsap.fromTo(items,
        {y:18,opacity:0,scale:.985},
        {y:0,opacity:1,scale:1,duration:.58,ease:'power3.out',stagger:.045,clearProps:'transform,opacity'}
      );
      const hero=gsap.utils.toArray<HTMLElement>('.hero-photo')[0];
      if(hero){gsap.to(hero,{y:-8,duration:2.8,ease:'sine.inOut',repeat:-1,yoyo:true});}
      const bottles=gsap.utils.toArray<HTMLElement>('.hero-bottle');
      if(bottles.length){gsap.to(bottles,{y:-10,rotation:2,duration:2.2,ease:'sine.inOut',stagger:.18,repeat:-1,yoyo:true});}
    });
    return()=>ctx.revert();
  },[pathname]);

  return <motion.div
    className="motion-page-glow"
    initial={{scaleX:0,opacity:0}}
    animate={{scaleX:1,opacity:[0,.8,0]}}
    transition={{duration:.8,ease:'easeOut'}}
    aria-hidden="true"
  />;
}
