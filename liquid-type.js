(() => {
  'use strict';
  const hero=document.querySelector('.liquid-hero');
  if(!hero)return;
  const title=hero.querySelector('.liquid-title');
  const canvas=hero.querySelector('canvas');
  const ctx=canvas.getContext('2d');
  const reduced=matchMedia('(prefers-reduced-motion: reduce)');
  const characters=[...hero.querySelectorAll('.liquid-letter')].map((el,i)=>({el,slot:el.parentElement,i,cx:0,cy:0,w:300,wv:0,s:1,sv:0,oldW:0,oldS:0,oldGlow:0}));
  let bounds,width=0,height=0,frame=0,last=0,lastPaint=0,ready=false,visible=false,idleMix=1;
  const pointer={x:Infinity,y:Infinity,active:false,lastDot:0,oldX:0,oldY:0,oldTime:0};
  const dots=[],ripples=[];
  const palette=()=>document.body.classList.contains('dark')?'235,222,202':'119,91,62';
  function measure(){
    bounds=hero.getBoundingClientRect();width=bounds.width;height=bounds.height;
    const dpr=Math.min(devicePixelRatio||1,2);canvas.width=Math.round(width*dpr);canvas.height=Math.round(height*dpr);ctx?.setTransform(dpr,0,0,dpr,0,0);
    characters.forEach(c=>{c.slot.style.width='';c.el.style.fontVariationSettings="'wght' 300";c.el.style.transform='scale(1)';});
    const sizes=characters.map(c=>c.el.getBoundingClientRect().width);
    characters.forEach((c,i)=>{c.slot.style.width=sizes[i]+'px';});
    characters.forEach(c=>{const r=c.slot.getBoundingClientRect();c.cx=r.left-bounds.left+r.width/2;c.cy=r.top-bounds.top+r.height/2;c.w=300;c.wv=0;c.s=1;c.sv=0;c.oldW=0;c.oldS=0;});
  }
  function stop(){cancelAnimationFrame(frame);frame=0;last=0;}
  function start(){if(!frame&&ready&&visible&&!reduced.matches&&!document.hidden)frame=requestAnimationFrame(tick);}
  function tick(now){
    frame=0;
    if(!visible||document.hidden||reduced.matches)return;
    if(!pointer.active&&!dots.length&&!ripples.length&&now-lastPaint<33){frame=requestAnimationFrame(tick);return;}
    const delta=Math.min(2.4,last?(now-last)/16.667:1);last=now;lastPaint=now;
    idleMix+=((pointer.active?0:1)-idleMix)*Math.min(1,.05*delta);
    const radius=Math.min(180,width*.3),rgb=palette();
    for(const c of characters){
      const distance=Math.hypot(c.cx-pointer.x,c.cy-pointer.y);
      const influence=pointer.active?Math.max(0,1-distance/radius)**2:0;
      const breathe=(Math.sin(now*.0008+c.i*.5)*.5+.5)*20*idleMix;
      const targetW=300+550*influence+breathe,targetS=1+.12*influence;
      for(const ripple of ripples){const dist=Math.hypot(c.cx-ripple.x,c.cy-ripple.y),near=1-Math.abs(dist-ripple.radius)/60;if(near>0){const fade=1-ripple.radius/ripple.max;c.wv+=fade*near*17*delta;c.sv+=fade*near*.0025*delta;}}
      c.wv=(c.wv+(targetW-c.w)*.035*delta)*Math.pow(.92,delta);c.w=Math.max(100,Math.min(900,c.w+c.wv*delta));
      c.sv=(c.sv+(targetS-c.s)*.035*delta)*Math.pow(.92,delta);c.s=Math.max(.98,Math.min(1.16,c.s+c.sv*delta));
      const w=Math.round(c.w),s=c.s.toFixed(4),glow=Math.max(0,(c.w-300)/550);
      if(w!==c.oldW){c.el.style.fontVariationSettings="'wght' "+w;c.oldW=w;}
      if(s!==c.oldS){c.el.style.transform='scale('+s+')';c.oldS=s;}
      if(Math.abs(glow-c.oldGlow)>.035){c.el.style.textShadow=glow>.1?`0 0 ${Math.round(30*glow)}px rgba(${rgb},${(glow*.14).toFixed(3)})`:'';c.oldGlow=glow;}
    }
    if(ctx){
      ctx.clearRect(0,0,width,height);
      for(let i=dots.length-1;i>=0;i--){const d=dots[i];d.age+=delta;const life=1-d.age/d.max;if(life<=0){dots.splice(i,1);continue;}ctx.beginPath();ctx.arc(d.x,d.y,d.size*(.5+life*.5),0,Math.PI*2);ctx.fillStyle=`rgba(${rgb},${life*.045})`;ctx.fill();}
      for(let i=ripples.length-1;i>=0;i--){const r=ripples[i];r.radius+=5*delta;const p=r.radius/r.max;if(p>=1){ripples.splice(i,1);continue;}const alpha=(1-p)**2;ctx.beginPath();ctx.arc(r.x,r.y,r.radius,0,Math.PI*2);ctx.strokeStyle=`rgba(${rgb},${alpha*.22})`;ctx.lineWidth=2.5*(1-p*.5);ctx.stroke();ctx.beginPath();ctx.arc(r.x,r.y,r.radius*.92,0,Math.PI*2);ctx.strokeStyle=`rgba(${rgb},${alpha*.1})`;ctx.lineWidth=8*(1-p);ctx.stroke();}
    }
    frame=requestAnimationFrame(tick);
  }
  hero.addEventListener('pointerenter',()=>{bounds=hero.getBoundingClientRect();});
  hero.addEventListener('pointermove',event=>{
    if(reduced.matches||event.pointerType==='touch')return;
    if(!bounds)bounds=hero.getBoundingClientRect();
    const x=event.clientX-bounds.left,y=event.clientY-bounds.top,now=performance.now();
    pointer.x=x;pointer.y=y;pointer.active=true;
    if(now-pointer.lastDot>18){const speed=Math.hypot(x-pointer.oldX,y-pointer.oldY)/Math.max(1,now-pointer.oldTime)*16;dots.push({x,y,size:Math.max(3,12-speed*.04),age:0,max:45+Math.random()*15});if(dots.length>60)dots.shift();pointer.lastDot=now;}
    pointer.oldX=x;pointer.oldY=y;pointer.oldTime=now;start();
  },{passive:true});
  hero.addEventListener('pointerleave',()=>{pointer.active=false;pointer.x=pointer.y=Infinity;});
  hero.addEventListener('click',event=>{
    if(reduced.matches||event.target.closest('a,button'))return;
    bounds=hero.getBoundingClientRect();ripples.push({x:event.clientX-bounds.left,y:event.clientY-bounds.top,radius:0,max:Math.max(width,height)*.6});if(ripples.length>4)ripples.shift();start();
  });
  const observer=new IntersectionObserver(entries=>{visible=entries[0].isIntersecting;if(visible){bounds=hero.getBoundingClientRect();start();}else{pointer.active=false;stop();}}, {threshold:.02});observer.observe(hero);
  document.addEventListener('visibilitychange',()=>{if(document.hidden)stop();else start();});
  new ResizeObserver(()=>{if(ready){measure();start();}}).observe(hero);
  reduced.addEventListener('change',()=>{stop();dots.length=ripples.length=0;ctx?.clearRect(0,0,width,height);measure();if(!reduced.matches)start();});
  async function init(){
    try{await document.fonts.load('300 100px "IA Liquid"');}catch{}
    measure();
    if(!reduced.matches&&performance.now()<2500){
      const animations=characters.map((c,i)=>c.el.animate([{opacity:0,transform:'translate3d(0,24px,0) scale(.92)'},{opacity:1,transform:'none'}],{duration:650,delay:160+i*35,easing:'cubic-bezier(.22,1,.36,1)',fill:'backwards'}));
      hero.querySelectorAll('[data-liquid-reveal]').forEach((el,i)=>el.animate([{opacity:0,transform:'translate3d(0,14px,0)'},{opacity:1,transform:'none'}],{duration:650,delay:280+i*90,easing:'cubic-bezier(.22,1,.36,1)',fill:'backwards'}));
      await Promise.all(animations.map(a=>a.finished.catch(()=>{})));
    }
    measure();ready=true;hero.dataset.liquidReady='true';start();
  }
  init();
})();
