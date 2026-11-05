(() => {
  'use strict';
  const section = document.querySelector('#muro-ia');
  const stage = section?.querySelector('.mosaic-wall');
  const dialog = section?.querySelector('.mosaic-dialog');
  if (!dialog || typeof dialog.showModal !== 'function') return;
  const field = id => dialog.querySelector('#mosaic-detail-' + id);
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const fine = matchMedia('(hover: hover) and (pointer: fine)');
  const canFly = () => !reduced.matches && matchMedia('(min-width:761px)').matches;
  const links = [...stage.querySelectorAll('[data-mosaic-item]')];
  let opener, phase = 'closed', ticket = 0, previousOverflow, flight;
  let frame = 0, x = 0, y = 0, targetX = 0, targetY = 0, lastTime = 0, bounds;
  const ease = 'cubic-bezier(.22,1,.36,1)';
  // One compositor transform for the whole wall, only while its position settles.
  function tick(now) {
    frame = 0;
    const dt = Math.min(40, lastTime ? now - lastTime : 16); lastTime = now;
    const weight = 1 - Math.exp(-dt / 85);
    x += (targetX - x) * weight; y += (targetY - y) * weight;
    const settled = Math.abs(targetX - x) + Math.abs(targetY - y) < .05;
    if (settled) { x = targetX; y = targetY; }
    stage.style.transform = `translate3d(${x.toFixed(2)}px,${y.toFixed(2)}px,0)`;
    if (!settled) frame = requestAnimationFrame(tick);
  }
  function schedule() { if (!frame) { lastTime = 0; frame = requestAnimationFrame(tick); } }
  function resetDrift() { targetX = targetY = 0; schedule(); }
  section.addEventListener('pointerenter', () => { bounds = stage.getBoundingClientRect(); });
  section.addEventListener('pointermove', event => {
    if (!fine.matches || reduced.matches || phase !== 'closed' || !bounds) return;
    targetX = ((event.clientX - bounds.left) / bounds.width - .5) * -18;
    targetY = Math.max(-1, Math.min(1, (event.clientY - bounds.top) / bounds.height - .5)) * -12;
    schedule();
  }, {passive:true});
  section.addEventListener('pointerleave', resetDrift);
  window.addEventListener('resize', () => { bounds = null; resetDrift(); }, {passive:true});
  function stopDrift() { cancelAnimationFrame(frame); frame = 0; x = y = targetX = targetY = 0; stage.style.transform = ''; }
  document.addEventListener('visibilitychange', () => { if (document.hidden) stopDrift(); });
  new IntersectionObserver(entries => { if (!entries[0].isIntersecting) stopDrift(); }).observe(section);
  reduced.addEventListener('change', stopDrift);
  function clearFlight() { flight?.remove(); flight = null; }
  function cancelMotion() { clearFlight(); dialog.getAnimations({subtree:true}).forEach(a => a.cancel()); }
  function rectangle(element) { const r = element.getBoundingClientRect(); return {left:r.left, top:r.top, width:r.width, height:r.height}; }
  function fly(from, to, duration) {
    clearFlight();
    const ghost = document.createElement('img');
    ghost.className = 'mosaic-flight'; ghost.alt = ''; ghost.src = field('image').src;
    Object.assign(ghost.style, {left:from.left+'px',top:from.top+'px',width:from.width+'px',height:from.height+'px'});
    dialog.append(ghost); flight = ghost;
    return ghost.animate([
      {transform:'translate3d(0,0,0) scale(1,1)',borderRadius:'4px'},
      {transform:`translate3d(${to.left-from.left}px,${to.top-from.top}px,0) scale(${to.width/from.width},${to.height/from.height})`,borderRadius:'2px'}
    ], {duration,easing:ease,fill:'forwards'}).finished.catch(() => {});
  }
  function populate(link) {
    field('image').src = link.querySelector('img').getAttribute('src');
    field('title').textContent = link.querySelector('h3').textContent;
    field('topic').textContent = link.querySelector('.mosaic-tile-top>span').textContent;
    field('date').textContent = 'Fuente: ' + link.querySelector('time').textContent;
    field('summary').textContent = link.querySelector('.mosaic-summary').textContent;
    field('article').href = link.getAttribute('href');
    field('source').href = link.dataset.sourceUrl;
    field('source').textContent = link.dataset.source + ' · Fuente original ↗';
  }
  async function open(link) {
    if (phase !== 'closed') return;
    const run = ++ticket; phase = 'opening'; opener = link; populate(link);
    try { await field('image').decode(); } catch {}
    if (run !== ticket) return;
    const from = rectangle(link.querySelector('img'));
    previousOverflow = document.documentElement.style.overflow;
    document.documentElement.style.overflow = 'hidden';
    section.classList.add('mosaic-engaged');
    dialog.dataset.phase = reduced.matches ? 'open' : 'opening';
    dialog.showModal();
    if (canFly()) {
      const to = rectangle(dialog.querySelector('.mosaic-detail-art'));
      const motion = fly(from, to, 520);
      dialog.dataset.phase = 'open'; dialog.classList.add('mosaic-in-flight');
      dialog.querySelector('.mosaic-detail-copy').animate([
        {opacity:0,transform:'translate3d(18px,0,0)'},{opacity:1,transform:'none'}
      ], {duration:340,delay:150,easing:ease,fill:'backwards'});
      await motion;
      if (run !== ticket) return;
      clearFlight(); dialog.classList.remove('mosaic-in-flight');
    } else if (!reduced.matches) {
      dialog.dataset.phase = 'open';
      await dialog.animate([{opacity:0,transform:'translate3d(0,18px,0)'},{opacity:1,transform:'none'}], {duration:300,easing:ease}).finished.catch(() => {});
      if (run !== ticket) return;
    }
    phase = 'open';
  }
  async function close() {
    if (!dialog.open || phase === 'closing') return;
    const run = ++ticket;
    const currentImage = flight ? rectangle(flight) : rectangle(dialog.querySelector('.mosaic-detail-art'));
    phase = 'closing'; cancelMotion();
    if (canFly() && opener?.isConnected) {
      opener.closest('.mosaic-tile').classList.add('mosaic-return-target');
      const to = rectangle(opener.querySelector('img'));
      dialog.classList.add('mosaic-in-flight'); dialog.dataset.phase = 'closing';
      await fly(currentImage, to, 400);
      if (run !== ticket) return;
    } else if (!reduced.matches) {
      await dialog.animate([{opacity:1,transform:'none'},{opacity:0,transform:'translate3d(0,12px,0)'}], {duration:180,easing:'ease-out'}).finished.catch(() => {});
      if (run !== ticket) return;
    }
    clearFlight(); dialog.classList.remove('mosaic-in-flight'); dialog.close();
  }
  links.forEach(link => {
    link.setAttribute('aria-haspopup', 'dialog');
    link.addEventListener('click', event => {
      if (event.button !== 0 || event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) return;
      event.preventDefault(); open(link);
    });
    const warm = () => { const img = link.querySelector('img'); if (!img.complete) img.loading = 'eager'; img.decode?.().catch(() => {}); };
    link.addEventListener('pointerenter', warm, {passive:true}); link.addEventListener('focus', warm);
  });
  dialog.querySelector('.mosaic-close').addEventListener('click', close);
  dialog.addEventListener('cancel', event => { event.preventDefault(); close(); });
  dialog.addEventListener('click', event => {
    if (event.target !== dialog) return;
    const r = dialog.getBoundingClientRect();
    if (event.clientX < r.left || event.clientX > r.right || event.clientY < r.top || event.clientY > r.bottom) close();
  });
  dialog.addEventListener('close', () => {
    ++ticket; cancelMotion(); phase = 'closed'; dialog.classList.remove('mosaic-in-flight');
    section.classList.remove('mosaic-engaged');
    document.documentElement.style.overflow = previousOverflow ?? '';
    opener?.focus({preventScroll:true});
    opener?.closest('.mosaic-tile').classList.remove('mosaic-return-target');
    resetDrift();
  });
})();
