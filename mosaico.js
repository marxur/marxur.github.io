(() => {
  'use strict';
  const section = document.querySelector('#muro-ia');
  const stage = section?.querySelector('.mosaic-wall');
  if (!stage) return;
  const links = [...stage.querySelectorAll('[data-mosaic-item]')];
  const fine = matchMedia('(hover: hover) and (pointer: fine) and (min-width:761px)');
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const ease = 'cubic-bezier(.22,1,.36,1)';
  const preview = document.createElement('div');
  preview.className = 'mosaic-hover'; preview.setAttribute('aria-hidden','true');
  const picture = document.createElement('div'); picture.className = 'mosaic-hover-pictures';
  const pictures = [document.createElement('img'), document.createElement('img')];
  pictures.forEach(img => { img.alt = ''; picture.append(img); });
  const caption = document.createElement('div'); caption.className = 'mosaic-hover-caption';
  const topic = document.createElement('span'); topic.className = 'mosaic-hover-topic';
  const title = document.createElement('p'); title.className = 'mosaic-hover-title';
  const date = document.createElement('span'); date.className = 'mosaic-hover-date';
  caption.append(topic,title,date); preview.append(picture,caption); stage.append(preview);
  let active, visible = false, front = 0, animation, fadeAnimation, hideToken = 0;
  let frame = 0, x = 0, y = 0, targetX = 0, targetY = 0, lastTime = 0, bounds;
  function rect(link) {
    const r = link.getBoundingClientRect(), s = stage.getBoundingClientRect();
    return {x:r.left-s.left,y:r.top-s.top,width:r.width,height:r.height};
  }
  const duration = value => reduced.matches ? 0 : value;
  function animate(to, ms) {
    const from = getComputedStyle(preview).transform;
    animation?.cancel();
    preview.style.transform = to;
    animation = preview.animate([{transform:from==='none'?to:from},{transform:to}],{duration:duration(ms),easing:ease});
  }
  function show(link) {
    if (!fine.matches || active === link && visible) return;
    ++hideToken;
    fadeAnimation?.cancel(); fadeAnimation=null; preview.style.opacity='1';
    const r = rect(link);
    const w = Math.min(380,stage.clientWidth-20), h = 270;
    preview.style.width=w+'px'; preview.style.height=h+'px';
    const left = Math.max(5,Math.min(stage.clientWidth-w-5,r.x+r.width/2-w/2));
    const top = Math.max(5,Math.min(stage.clientHeight-h-5,r.y+r.height/2-h/2));
    const to=`translate3d(${left}px,${top}px,0) scale(1,1)`;
    const old = pictures[front]; front=1-front; const next=pictures[front];
    next.src=link.querySelector('img').getAttribute('src');
    next.style.opacity='1'; old.style.opacity='0';
    topic.textContent=link.querySelector('.mosaic-tile-top>span').textContent;
    title.textContent=link.querySelector('h3').textContent;
    date.textContent=link.querySelector('time').textContent+' · Leer noticia ↗';
    active?.closest('.mosaic-tile').classList.remove('mosaic-current');
    active=link; active.closest('.mosaic-tile').classList.add('mosaic-current');
    section.classList.add('mosaic-hovering');
    if (!visible) {
      animation?.cancel();
      preview.style.transform=`translate3d(${r.x}px,${r.y}px,0) scale(${r.width/w},${r.height/h})`;
      preview.style.opacity='1';
      animate(to,420);
      caption.animate([{opacity:0},{opacity:1}],{duration:duration(220),delay:duration(90),fill:'backwards'});
    } else animate(to,330);
    visible=true;
  }
  function hide() {
    if (!visible) return;
    visible=false; const token=++hideToken;
    section.classList.remove('mosaic-hovering');
    active?.closest('.mosaic-tile').classList.remove('mosaic-current');
    if (active?.isConnected) {
      const r=rect(active);
      animate(`translate3d(${r.x}px,${r.y}px,0) scale(${r.width/preview.offsetWidth},${r.height/preview.offsetHeight})`,220);
    }
    const fade=preview.animate([{opacity:1},{opacity:0}],{duration:duration(180),fill:'forwards'});fadeAnimation=fade;
    fade.finished.then(()=>{if(token===hideToken){preview.style.opacity='0';fade.cancel();active=null;}}).catch(()=>{});
  }
  // This overlay never captures the pointer: the original next image always wins.
  links.forEach(link => {
    link.removeAttribute('aria-haspopup');
    const warm = () => { const img=link.querySelector('img');if(!img.complete)img.loading='eager';img.decode?.().catch(()=>{}); };
    link.addEventListener('pointerenter',()=>{warm();show(link);},{passive:true});
    link.addEventListener('focus',()=>{warm();show(link);});
  });
  stage.addEventListener('pointerleave',()=>{hide();resetDrift();});
  stage.addEventListener('focusout',event=>{if(!stage.contains(event.relatedTarget))hide();});
  stage.addEventListener('keydown',event=>{if(event.key==='Escape')hide();});
  function tick(now) {
    frame=0;const dt=Math.min(40,lastTime?now-lastTime:16);lastTime=now;
    const k=1-Math.exp(-dt/85);x+=(targetX-x)*k;y+=(targetY-y)*k;
    const done=Math.abs(targetX-x)+Math.abs(targetY-y)<.05;
    if(done){x=targetX;y=targetY;}
    stage.style.transform=`translate3d(${x.toFixed(2)}px,${y.toFixed(2)}px,0)`;
    if(!done)frame=requestAnimationFrame(tick);
  }
  function schedule(){if(!frame){lastTime=0;frame=requestAnimationFrame(tick);}}
  function resetDrift(){targetX=targetY=0;schedule();}
  function stop(){hide();cancelAnimationFrame(frame);frame=0;x=y=targetX=targetY=0;stage.style.transform='';bounds=null;}
  section.addEventListener('pointerenter',()=>{bounds=stage.getBoundingClientRect();});
  section.addEventListener('pointermove',event=>{
    if(!fine.matches||reduced.matches||!bounds)return;
    targetX=((event.clientX-bounds.left)/bounds.width-.5)*-14;
    targetY=Math.max(-1,Math.min(1,(event.clientY-bounds.top)/bounds.height-.5))*-10;schedule();
  },{passive:true});
  document.addEventListener('visibilitychange',()=>{if(document.hidden)stop();});
  new IntersectionObserver(entries=>{if(!entries[0].isIntersecting)stop();}).observe(section);
  window.addEventListener('resize',stop,{passive:true});fine.addEventListener('change',stop);reduced.addEventListener('change',stop);
})();
