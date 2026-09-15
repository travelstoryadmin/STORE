'use client';

import {useEffect} from 'react';
import {gsap} from 'gsap';
import {ScrollTrigger} from 'gsap/ScrollTrigger';

if(typeof window!=='undefined')gsap.registerPlugin(ScrollTrigger);

export default function PublicPremiumInteractions(){
  useEffect(()=>{
    const reduce=window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if(reduce)return;
    const ctx=gsap.context(()=>{
      const heroCopy=document.querySelector<HTMLElement>('.hero-copy');
      const heroPhoto=document.querySelector<HTMLElement>('.hero-photo');
      if(heroCopy){
        gsap.fromTo(heroCopy.querySelectorAll('.hero-eyebrow, h1, p, .hero-cta-row'),{y:34,opacity:0},{y:0,opacity:1,duration:.85,ease:'power3.out',stagger:.12,delay:.08});
      }
      if(heroPhoto){
        gsap.fromTo(heroPhoto,{x:45,opacity:0,scale:.92},{x:0,opacity:1,scale:1,duration:1.15,ease:'power3.out',delay:.2});
        gsap.to(heroPhoto,{y:-18,ease:'none',scrollTrigger:{trigger:'.hero',start:'top top',end:'bottom top',scrub:1.2}});
      }
      gsap.utils.toArray<HTMLElement>('.category-row > button, .offer, .public-card, .public-info, footer').forEach((el,i)=>{
        gsap.fromTo(el,{y:55,opacity:0,rotateX:i%2?2:-2},{y:0,opacity:1,rotateX:0,duration:.75,ease:'power3.out',scrollTrigger:{trigger:el,start:'top 88%',toggleActions:'play none none reverse'}});
      });
      gsap.utils.toArray<HTMLElement>('.public-card').forEach(card=>{
        const img=card.querySelector<HTMLElement>('.public-card-image img');
        const move=(e:MouseEvent)=>{
          const r=card.getBoundingClientRect();
          const x=(e.clientX-r.left)/r.width-.5;
          const y=(e.clientY-r.top)/r.height-.5;
          gsap.to(card,{rotationY:x*8,rotationX:-y*7,y:-7,scale:1.018,duration:.28,ease:'power2.out',transformPerspective:900});
          if(img)gsap.to(img,{scale:1.08,x:x*8,y:y*6,duration:.35,ease:'power2.out'});
        };
        const leave=()=>{gsap.to(card,{rotationY:0,rotationX:0,y:0,scale:1,duration:.5,ease:'power3.out'});if(img)gsap.to(img,{scale:1,x:0,y:0,duration:.5,ease:'power3.out'});};
        card.addEventListener('mousemove',move);card.addEventListener('mouseleave',leave);
        ctx.add(()=>{card.removeEventListener('mousemove',move);card.removeEventListener('mouseleave',leave);});
      });
      const hero=document.querySelector<HTMLElement>('.hero');
      const scene=document.querySelector<HTMLElement>('.three-showcase');
      if(hero&&scene){
        const move=(e:MouseEvent)=>{const r=hero.getBoundingClientRect();const x=(e.clientX-r.left)/r.width-.5;const y=(e.clientY-r.top)/r.height-.5;gsap.to(scene,{x:x*16,y:y*12,duration:.8,ease:'power2.out'});};
        const leave=()=>gsap.to(scene,{x:0,y:0,duration:1,ease:'power3.out'});
        hero.addEventListener('mousemove',move);hero.addEventListener('mouseleave',leave);
        ctx.add(()=>{hero.removeEventListener('mousemove',move);hero.removeEventListener('mouseleave',leave);});
      }
      gsap.utils.toArray<HTMLElement>('.offer').forEach(el=>gsap.to(el,{backgroundPosition:'120% 0%',duration:3,ease:'none',repeat:-1,yoyo:true}));
    });
    return()=>ctx.revert();
  },[]);
  return null;
}
