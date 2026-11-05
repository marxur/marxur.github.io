(() => {
  'use strict';
  const wall = document.querySelector('#muro-ia');
  const dialog = wall?.querySelector('.mosaic-dialog');
  if (!dialog || typeof dialog.showModal !== 'function') return;
  const field = id => dialog.querySelector('#mosaic-detail-' + id);
  let opener, previousOverflow;
  wall.querySelectorAll('[data-mosaic-item]').forEach(link => {
    link.setAttribute('aria-haspopup', 'dialog');
    link.addEventListener('click', event => {
      if (event.button !== 0 || event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) return;
      event.preventDefault();
      opener = link;
      const image = link.querySelector('img');
      field('image').src = image.getAttribute('src');
      field('title').textContent = link.querySelector('h3').textContent;
      field('topic').textContent = link.querySelector('.mosaic-tile-top>span').textContent;
      field('date').textContent = 'Fuente: ' + link.querySelector('time').textContent;
      field('summary').textContent = link.querySelector('.mosaic-summary').textContent;
      field('article').href = link.getAttribute('href');
      field('source').href = link.dataset.sourceUrl;
      field('source').textContent = link.dataset.source + ' · Fuente original ↗';
      previousOverflow = document.documentElement.style.overflow;
      document.documentElement.style.overflow = 'hidden';
      dialog.showModal();
    });
  });
  dialog.querySelector('.mosaic-close').addEventListener('click', () => dialog.close());
  dialog.addEventListener('click', event => {
    if (event.target !== dialog) return;
    const bounds = dialog.getBoundingClientRect();
    if (event.clientX < bounds.left || event.clientX > bounds.right || event.clientY < bounds.top || event.clientY > bounds.bottom) dialog.close();
  });
  dialog.addEventListener('close', () => {
    document.documentElement.style.overflow = previousOverflow ?? '';
    opener?.focus({preventScroll:true});
  });
})();
