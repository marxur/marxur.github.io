(() => {
  'use strict';
  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];
  const icons = { bookmark: '<svg aria-hidden="true"><use href="#i-bookmark"/></svg>', close: '<svg aria-hidden="true"><use href="#i-close"/></svg>' };
  const escape = (value) => String(value).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const normalise = value => value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
  const date = value => new Intl.DateTimeFormat('es-ES', {day:'numeric',month:'short',year:'numeric',timeZone:'Europe/Madrid'}).format(new Date(value + 'T12:00:00Z')).replace('.', '');
  let data = [], saved = [], storageOK = true, toastTimer;
  try { const raw = JSON.parse(localStorage.getItem('noticias-ia-saved') || '[]'); saved = Array.isArray(raw) ? raw.filter(v => typeof v === 'string') : []; } catch { storageOK = false; }
  try { if (localStorage.getItem('noticias-ia-theme') === 'dark') document.body.classList.add('dark'); } catch {}
  const toast = message => { const element = $('#toast'); if (!element) return; element.textContent = message; element.classList.add('visible'); clearTimeout(toastTimer); toastTimer = setTimeout(() => element.classList.remove('visible'), 3200); };
  const openDialog = id => { const dialog = $(id); if (dialog && !dialog.open) { dialog.showModal(); if (id === '#search-dialog') $('#search-input').focus(); } };
  const closeDialog = dialog => { if (dialog?.open) dialog.close(); };
  $$('.dialog').forEach(dialog => { dialog.addEventListener('click', e => { if (e.target === dialog) { const r = dialog.getBoundingClientRect(); if (e.clientX < r.left || e.clientX > r.right || e.clientY < r.top || e.clientY > r.bottom) closeDialog(dialog); } }); dialog.addEventListener('close', () => { const video = $('video', dialog); if (video) video.pause(); }); });
  $$('[data-close-dialog]').forEach(button => button.addEventListener('click', () => closeDialog(button.closest('dialog'))));
  const syncSaved = () => { $$('[data-save]').forEach(button => { const active = saved.includes(button.dataset.save); button.setAttribute('aria-pressed', String(active)); button.setAttribute('aria-label', active ? 'Quitar de guardados' : 'Guardar artículo'); button.title = active ? 'Quitar de guardados' : 'Guardar artículo'; }); $$('.saved-dot').forEach(dot => dot.hidden = !saved.length); };
  const persistSaved = () => { try { localStorage.setItem('noticias-ia-saved', JSON.stringify(saved)); storageOK = true; } catch { storageOK = false; } };
  const toggleSaved = slug => { const wasSaved = saved.includes(slug); saved = wasSaved ? saved.filter(v => v !== slug) : [...saved, slug]; persistSaved(); syncSaved(); renderSaved(); toast(storageOK ? (wasSaved ? 'Artículo retirado de guardados' : 'Artículo guardado para leer con calma') : 'Guardado en esta sesión. El navegador no permite conservarlo.'); };
  const resultMarkup = article => `<a class="search-result" href="/noticias/${escape(article.slug)}.html"><span class="tag">${escape(article.category)} · ${escape(article.topic)}</span><h3>${escape(article.title)}</h3><span class="meta">${escape(article.source)} · ${date(article.date)}</span></a>`;
  const renderSaved = () => { const list = $('#saved-results'); if (!list) return; const items = data.filter(a => saved.includes(a.slug)); list.innerHTML = items.length ? items.map(a => `<div class="result-item">${resultMarkup(a)}<button class="icon-button" data-save="${escape(a.slug)}" aria-label="Quitar de guardados" aria-pressed="true">${icons.close}</button></div>`).join('') : '<div class="empty-state">Tu próxima lectura puede esperar aquí.<br>Guarda un artículo con el icono de marcador.</div>'; };
  const renderSearch = () => { const value = normalise($('#search-input')?.value.trim() || ''); const results = data.filter(a => normalise([a.title,a.summary,a.category,a.topic,a.source].join(' ')).includes(value)); const target = $('#search-results'); if (!target) return; target.innerHTML = results.length ? results.map(resultMarkup).join('') : '<div class="empty-state">No encontramos esa búsqueda en la selección.<br>Prueba con OpenAI, agentes, DeepSeek, Notebook o voz.</div>'; $('#search-count').textContent = value ? `${results.length} ${results.length === 1 ? 'resultado' : 'resultados'}` : 'Explora la selección o escribe un tema'; };
  const dataPromise = fetch('/data.json').then(response => { if (!response.ok) throw new Error('Datos no disponibles'); return response.json(); }).then(json => { data = json.articles; renderSearch(); renderSaved(); }).catch(() => { $('#search-results').innerHTML = '<div class="empty-state">La búsqueda no se ha podido cargar. Puedes seguir leyendo desde la portada.</div>'; $('#saved-results').innerHTML = '<div class="empty-state">No se ha podido cargar la lista. Recarga la página para intentarlo de nuevo.</div>'; });
  let searchTimer,searchSequence=0;
  $('#search-input')?.addEventListener('input', () => { renderSearch(); clearTimeout(searchTimer); const sequence=++searchSequence; searchTimer=setTimeout(async()=>{try{const json=await fetch('/api/search?q='+encodeURIComponent($('#search-input').value)).then(r=>r.json()); if(sequence===searchSequence){data=[...new Map([...data,...json.articles].map(a=>[a.slug,a])).values()];renderSearch();}}catch{}},250); });
  $$('.search-trigger').forEach(button => button.addEventListener('click', () => { openDialog('#search-dialog'); dataPromise.then(renderSearch); }));
  $$('.save-trigger').forEach(button => button.addEventListener('click', () => { openDialog('#saved-dialog'); dataPromise.then(async()=>{if(saved.length){try{const json=await fetch('/api/search?saved='+encodeURIComponent(saved.join(','))).then(r=>r.json());data=[...new Map([...data,...json.articles].map(a=>[a.slug,a])).values()];}catch{}}renderSaved();}); }));
  document.addEventListener('click', event => { const save = event.target.closest('[data-save]'); if (save) { event.preventDefault(); toggleSaved(save.dataset.save); } const preferences = event.target.closest('[data-preferences]'); if (preferences) openDialog('#preferences-dialog'); });
  const syncTheme = () => { $$('.theme-toggle').forEach(button => { const dark = document.body.classList.contains('dark'); button.setAttribute('aria-label', dark ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'); button.setAttribute('aria-pressed', String(dark)); }); };
  $$('.theme-toggle').forEach(button => button.addEventListener('click', () => { document.body.classList.toggle('dark'); try { localStorage.setItem('noticias-ia-theme', document.body.classList.contains('dark') ? 'dark' : 'light'); } catch {} syncTheme(); }));
  $('.mobile-toggle')?.addEventListener('click', event => { const open = $('.header').classList.toggle('menu-open'); event.currentTarget.setAttribute('aria-expanded', String(open)); event.currentTarget.setAttribute('aria-label', open ? 'Cerrar menú' : 'Abrir menú'); });
  $$('.desktop-nav a').forEach(link => link.addEventListener('click', () => { $('.header').classList.remove('menu-open'); $('.mobile-toggle')?.setAttribute('aria-expanded','false'); $('.mobile-toggle')?.setAttribute('aria-label','Abrir menú'); }));
  let activeCategory = 'Todas', activeTopic = '', visibleLimit = 9;
  const cards = $$('.story-grid[data-news-grid] .story-card');
  const updateFilter = () => { if (!cards.length) return; const selected = cards.filter(card => (activeCategory === 'Todas' || card.dataset.category === activeCategory) && (!activeTopic || (card.dataset.topics||card.dataset.topic).split('|').includes(activeTopic))); cards.forEach(card => card.hidden = true); selected.slice(0,visibleLimit).forEach(card => card.hidden = false); $$('.filter-button[data-category]').forEach(button => button.setAttribute('aria-pressed', String(button.dataset.category === activeCategory && !activeTopic))); $('#result-count').textContent = `${selected.length} ${selected.length === 1 ? 'lectura' : 'lecturas'}${activeTopic ? ' sobre ' + activeTopic : ' en la selección'}`; $('#news-empty').hidden = selected.length > 0; $('#load-more').hidden = selected.length <= visibleLimit; $('#reset-filter').hidden = !activeTopic; };
  $$('.filter-button[data-category]').forEach(button => button.addEventListener('click', () => { activeCategory = button.dataset.category; activeTopic = ''; visibleLimit = 6; updateFilter(); }));
  const setTopic = topic => { activeCategory = 'Todas'; activeTopic = topic; visibleLimit = 6; updateFilter(); $('#actualidad')?.scrollIntoView({behavior:matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth'}); };
  $$('[data-topic-filter]').forEach(button => button.addEventListener('click', () => { if (cards.length) setTopic(button.dataset.topicFilter); else location.href = '/?tema=' + encodeURIComponent(button.dataset.topicFilter) + '#actualidad'; }));
  $('#load-more')?.addEventListener('click', () => { visibleLimit = cards.length; updateFilter(); });
  const resetFilter = () => { activeCategory = 'Todas'; activeTopic = ''; visibleLimit = 6; updateFilter(); };
  $('#reset-filter')?.addEventListener('click', resetFilter); $('#all-stories')?.addEventListener('click', resetFilter);
  $('#video-trigger')?.addEventListener('click', () => { openDialog('#video-dialog'); const video = $('#brand-video'); video.currentTime = 0; video.play().catch(() => {}); });
  $$('[data-share]').forEach(button => button.addEventListener('click', async () => { const url = location.href.split('#')[0]; try { if (navigator.share) await navigator.share({title:document.title,url}); else if (navigator.clipboard) { await navigator.clipboard.writeText(url); toast('Enlace copiado'); } else { openDialog('#share-dialog'); $('#share-url').value = url; $('#share-url').select(); } } catch (error) { if (error.name !== 'AbortError') { openDialog('#share-dialog'); $('#share-url').value = url; $('#share-url').select(); } } }));
  $('#clear-saved')?.addEventListener('click', () => { saved = []; persistSaved(); syncSaved(); renderSaved(); toast('Tu lista de guardados se ha vaciado'); });
  $('#copy-share')?.addEventListener('click', async () => { try { await navigator.clipboard.writeText($('#share-url').value); toast('Enlace copiado'); } catch { $('#share-url').select(); toast('Selecciona y copia el enlace'); } });
  document.addEventListener('keydown', event => { if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'k') { event.preventDefault(); openDialog('#search-dialog'); } });
  $$('[data-tool-filter]').forEach(button=>button.addEventListener('click',()=>{const selected=button.dataset.toolFilter;$$('[data-tool-category]').forEach(card=>card.hidden=selected!=='Todas'&&card.dataset.toolCategory!==selected);$$('[data-tool-filter]').forEach(b=>b.setAttribute('aria-pressed',String(b===button)));}));
  syncSaved(); syncTheme(); updateFilter();
  const topicFromUrl = new URLSearchParams(location.search).get('tema'); if (topicFromUrl && cards.length) setTopic(topicFromUrl);
  $$('.assistant-trigger').forEach(button=>button.addEventListener('click',()=>{openDialog('#assistant-dialog');$('#assistant-input').focus();}));
  let assistantBusy=false;
  const askAssistant=async question=>{
    if(assistantBusy||!question.trim())return;
    assistantBusy=true;$('#assistant-input').value=question;const result=$('#assistant-results');result.innerHTML='<p class="assistant-answer">Consultando las noticias y guías…</p>';$('#assistant-form button').disabled=true;
    try {
      const response=await fetch('/api/assistant',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({question})});
      if(!response.ok)throw Error('No disponible');const answer=await response.json();
      result.innerHTML=`<p class="assistant-answer">${escape(answer.answer)}</p>${answer.links.map(l=>`<a class="assistant-link" href="${escape(l.url)}">${escape(l.title)} ↗</a>`).join('')}${answer.articles.map(a=>`<article class="assistant-result"><span class="tag">${escape(a.source)} · ${date(a.date)}</span><a href="${escape(a.url)}"><h3>${escape(a.title)}</h3></a><p>${escape(a.summary)}</p><a class="assistant-link" href="${escape(a.sourceUrl)}" target="_blank" rel="noopener noreferrer">Fuente original ↗</a></article>`).join('')}${answer.tools.map(t=>`<article class="assistant-result"><h3>${escape(t.name)}</h3><p>${escape(t.description)}</p><a class="assistant-link" href="${escape(t.url)}" target="_blank" rel="noopener noreferrer">Abrir herramienta ↗</a></article>`).join('')}`;
    }catch{result.innerHTML='<p>No he podido consultar la selección. Inténtalo de nuevo o utiliza el buscador de la web.</p>';}finally{assistantBusy=false;$('#assistant-form button').disabled=false;}
  };
  $('#assistant-form')?.addEventListener('submit',event=>{event.preventDefault();askAssistant($('#assistant-input').value.trim());});
  $$('[data-question]').forEach(button=>button.addEventListener('click',()=>askAssistant(button.dataset.question)));
  const channelGrid=$('#channel-videos');
  if(channelGrid){
    const prev=$('#videos-prev'),next=$('#videos-next');
    const updateCarousel=()=>{prev.disabled=channelGrid.scrollLeft<2;next.disabled=channelGrid.scrollLeft+channelGrid.clientWidth>=channelGrid.scrollWidth-2;};
    const moveCarousel=direction=>{const card=channelGrid.querySelector('.channel-video');channelGrid.scrollBy({left:direction*((card?.getBoundingClientRect().width??280)+24),behavior:window.matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth'});};
    prev.addEventListener('click',()=>moveCarousel(-1));next.addEventListener('click',()=>moveCarousel(1));
    channelGrid.addEventListener('scroll',updateCarousel,{passive:true});
    channelGrid.addEventListener('keydown',e=>{if(e.target===channelGrid&&['ArrowLeft','ArrowRight'].includes(e.key)){e.preventDefault();moveCarousel(e.key==='ArrowLeft'?-1:1);}});
    new ResizeObserver(updateCarousel).observe(channelGrid);updateCarousel();
    fetch('/api/videos').then(r=>{if(!r.ok)throw Error();return r.json();}).then(json=>{
      const videos=json.videos.filter(v=>/^[\w-]{11}$/.test(v.id));
      if(videos.length)channelGrid.innerHTML=videos.map((v,i)=>`<article class="channel-video"><button class="video-play" data-youtube-id="${v.id}" aria-label="Reproducir ${escape(v.title)}"><img src="https://i.ytimg.com/vi/${v.id}/hqdefault.jpg" alt="" loading="lazy" width="480" height="360"><span class="play-badge">▶</span><span class="video-platform">YOUTUBE SHORTS</span></button><div><h3>${escape(v.title)}</h3><a href="https://www.youtube.com/shorts/${v.id}" target="_blank" rel="noopener noreferrer">Abrir en YouTube ↗</a></div></article>`).join('');
      updateCarousel();$('#channel-status').textContent=json.checkedAt?'Vídeos de @NoticiasIAes · Canal consultado el '+new Intl.DateTimeFormat('es-ES',{day:'numeric',month:'long',hour:'2-digit',minute:'2-digit',timeZone:'Europe/Madrid'}).format(new Date(json.checkedAt))+(json.feedAvailable?'':'. Mostramos la última selección disponible.'):'Vídeos publicados en @NoticiasIAes.';
    }).catch(()=>{$('#channel-status').textContent='Mostramos los vídeos guardados. Puedes ver todas las novedades en el canal de YouTube.';});

  }
  document.addEventListener('click',event=>{const button=event.target.closest('[data-youtube-id]');if(!button)return;const id=button.dataset.youtubeId;if(!/^[\w-]{11}$/.test(id))return;$('#youtube-player').innerHTML=`<iframe title="Short de Noticias IA" src="https://www.youtube-nocookie.com/embed/${id}?autoplay=1" allow="autoplay; encrypted-media; picture-in-picture" allowfullscreen referrerpolicy="strict-origin-when-cross-origin"></iframe>`;openDialog('#youtube-dialog');});
  $('#youtube-dialog')?.addEventListener('close',()=>{$('#youtube-player').innerHTML='';});
})();

document.querySelectorAll('[data-x-author]').forEach(button=>button.addEventListener('click',()=>{const name=button.dataset.xAuthor;document.querySelectorAll('[data-x-name]').forEach(card=>card.hidden=name!=='Todas'&&card.dataset.xName!==name);document.querySelectorAll('[data-x-author]').forEach(b=>b.setAttribute('aria-pressed',String(b===button)));}));
