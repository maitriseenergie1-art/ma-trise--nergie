import { useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';

export function PageMotion({children}) {
  const { pathname } = useLocation();
  const root = useRef(null);
  useEffect(() => {
    const node=root.current;
    const preference=matchMedia('(prefers-reduced-motion: reduce)');
    const animations=new Set();
    let observer;
    const stop=()=>{observer?.disconnect();animations.forEach(animation=>animation.cancel());animations.clear();};
    const start=()=>{
      stop();
      if(preference.matches || !window.IntersectionObserver || !Element.prototype.animate)return;
      const mobile=matchMedia('(max-width: 680px)').matches;
      const animate=(element,delay=0)=>{
        const animation=element.animate([{opacity:.65,transform:`translateY(${mobile?12:22}px)`},{opacity:1,transform:'translateY(0)'}],{duration:mobile?320:460,delay,easing:'cubic-bezier(.2,.65,.3,1)'});
        animations.add(animation);animation.onfinish=()=>animations.delete(animation);
      };
      observer=new IntersectionObserver(entries=>{
        entries.forEach(entry=>{
          if(!entry.isIntersecting)return;
          observer.unobserve(entry.target);
          // Animate collections as a unit; never transform individual scrolling cards.
          animate(entry.target);
        });
      },{threshold:.08});
      node.querySelectorAll('.section-intro,.process,.why-grid,.competency-grid,.card-carousel,.sector-carousel,.contact-home-grid,.faq-layout,.mid-contact,.funding-preview-flow,.flow-diagram,.finance-focus-grid,.finance-study-grid,.funding-flow,.symptom-list,.site-map,.story-grid').forEach(el=>{
        // Avoid nested reveals combining their offsets.
        if(!el.parentElement.closest('.mid-contact,.sector-carousel,.contact-home-grid'))observer.observe(el);
      });
      node.querySelectorAll('.hero-copy>h1,.hero-copy>p:not(.eyebrow),.hero-copy>.button-row,.page-hero-copy>h1,.page-hero-copy>.lead,.page-hero-copy>.button,.page-hero-copy>.button-row').forEach((el,index)=>animate(el,Math.min(index,2)*(mobile?35:60)));
    };
    start();preference.addEventListener('change',start);
    return ()=>{stop();preference.removeEventListener('change',start);};
  },[pathname]);
  return <main ref={root} className="page-motion" key={pathname}>{children}</main>;
}
