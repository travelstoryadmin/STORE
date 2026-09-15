'use client';

import {useEffect,useRef} from 'react';
import gsap from 'gsap';
import {ScrollTrigger} from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

export default function PremiumMotion(){
  const root=useRef<HTMLDivElement>(null);
  useEffect(()=>{
    const host=root.current;
    if(!host)return;
    const prefersReduced=window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if(prefersReduced)return;

    const scope=gsap.context(()=>{
      const q=(s:string)=>document.querySelector(s);
      const heroCopy=q('.hero-copy');
      const heroPhoto=q('.hero-photo');
      const heroBottle=q('.hero-bottle');
      const header=q('.public-head');
      const categories=gsap.utils.toArray('.category-row > button');
      const cards=gsap.utils.toArray('.public-card');
      const info=gsap.utils.toArray('.public-info');
      const offer=q('.offer');

      if(header)gsap.fromTo(header,{y:-24,opacity:0},{y:0,opacity:1,duration:.8,ease:'power3.out'});
      if(heroCopy)gsap.fromTo(heroCopy,{y:40,opacity:0},{y:0,opacity:1,duration:1,ease:'power3.out',delay:.12});
      if(heroPhoto)gsap.fromTo(heroPhoto,{scale:.94,opacity:0,x:35},{scale:1,opacity:1,x:0,duration:1.15,ease:'power3.out',delay:.2});
      if(heroBottle){
        gsap.to(heroBottle,{y:-12,rotation:2,duration:2.4,ease:'sine.inOut',repeat:-1,yoyo:true});
        gsap.utils.toArray('.hero-bottle').forEach((el:any,i)=>gsap.to(el,{y:i?10:-12,rotation:i?-2:2,duration:2.6+i*.25,ease:'sine.inOut',repeat:-1,yoyo:true,delay:i*.15}));
      }
      if(offer)gsap.fromTo(offer,{y:45,opacity:0},{y:0,opacity:1,duration:.9,ease:'power3.out',scrollTrigger:{trigger:offer,start:'top 82%'}});
      categories.forEach((el:any,i)=>{
        gsap.fromTo(el,{y:28,opacity:0,scale:.96},{y:0,opacity:1,scale:1,duration:.55,delay:i*.055,ease:'power3.out',scrollTrigger:{trigger:el,start:'top 92%',once:true}});
      });
      cards.forEach((el:any,i)=>{
        gsap.fromTo(el,{y:55,opacity:0,scale:.97},{y:0,opacity:1,scale:1,duration:.65,delay:(i%4)*.07,ease:'power3.out',scrollTrigger:{trigger:el,start:'top 88%',once:true}});
        el.addEventListener('mouseenter',()=>gsap.to(el,{y:-8,scale:1.02,duration:.25,ease:'power2.out'}));
        el.addEventListener('mouseleave',()=>gsap.to(el,{y:0,scale:1,duration:.3,ease:'power2.out'}));
      });
      info.forEach((el:any)=>gsap.fromTo(el,{y:45,opacity:0},{y:0,opacity:1,duration:.8,ease:'power3.out',scrollTrigger:{trigger:el,start:'top 84%',once:true}}));

      const hero=q('.hero');
      if(hero&&heroPhoto){
        gsap.to(heroPhoto,{yPercent:5,scale:1.025,ease:'none',scrollTrigger:{trigger:hero,start:'top top',end:'bottom top',scrub:true}});
      }

      const magnetic=gsap.utils.toArray('.primary-btn,.login-btn,.offer button,.hero-copy button,.public-card button,.qr-head-btn');
      magnetic.forEach((el:any)=>{
        el.addEventListener('mouseenter',()=>gsap.to(el,{y:-3,scale:1.025,duration:.2,ease:'power2.out'}));
        el.addEventListener('mouseleave',()=>gsap.to(el,{y:0,scale:1,duration:.25,ease:'power2.out'}));
      });

      const mobile=window.matchMedia('(max-width:720px)').matches;
      if(!mobile){
        gsap.utils.toArray('.hero-copy,.hero-photo,.public-card,.category-row > button').forEach((el:any)=>{
          el.addEventListener('mousemove',(e:MouseEvent)=>{
            const r=el.getBoundingClientRect();
            const x=(e.clientX-r.left)/r.width-.5;
            const y=(e.clientY-r.top)/r.height-.5;
            gsap.to(el,{rotateY:x*3,rotateX:-y*3,duration:.25,ease:'power2.out',transformPerspective:700});
          });
          el.addEventListener('mouseleave',()=>gsap.to(el,{rotateX:0,rotateY:0,duration:.35,ease:'power2.out'}));
        });
      }
    },host);
    return()=>scope.revert();
  },[]);
  return <div ref={root} aria-hidden="true" style={{position:'fixed',inset:0,pointerEvents:'none',zIndex:-1}}/>;
}
