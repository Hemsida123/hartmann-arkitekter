(() => {
  'use strict';
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const header = document.querySelector('.site-header');
  new IntersectionObserver(([entry]) => header.classList.toggle('scrolled', !entry.isIntersecting)).observe(document.querySelector('.top-sentinel'));
  const menu = document.querySelector('.mobile-menu');
  const toggle = document.querySelector('.menu-toggle');
  const lock = () => document.body.style.overflow = 'hidden';
  const unlock = () => document.body.style.overflow = '';
  toggle.addEventListener('click', () => {menu.showModal();toggle.setAttribute('aria-expanded','true');lock()});
  menu.querySelector('.menu-close').addEventListener('click', () => menu.close());
  menu.addEventListener('close', () => {toggle.setAttribute('aria-expanded','false');unlock();toggle.focus()});
  menu.querySelectorAll('a').forEach(a => a.addEventListener('click', () => menu.close()));
  matchMedia('(min-width:901px)').addEventListener('change', e => {if(e.matches && menu.open) menu.close()});
  if (!reduced && 'IntersectionObserver' in window) {
    document.documentElement.classList.add('js-reveal');
    const observer = new IntersectionObserver(entries => entries.forEach(entry => {if(entry.isIntersecting){entry.target.classList.add('visible');observer.unobserve(entry.target)}}), {rootMargin:'0px 0px 35px 0px',threshold:0.02});
    document.querySelectorAll('.reveal').forEach(el => observer.observe(el));
  }
  document.querySelectorAll('[data-drawing-viewer]').forEach(viewer => {
    const tabs = [...viewer.querySelectorAll('[role="tab"]')];
    const show = (tab, focus = false) => {
      tabs.forEach(button => {
        const selected = button === tab;
        button.setAttribute('aria-selected', String(selected));
        button.tabIndex = selected ? 0 : -1;
        const panel = document.getElementById(button.getAttribute('aria-controls'));
        panel.hidden = !selected;
        panel.classList.remove('changing');
        if (selected && !reduced) requestAnimationFrame(() => panel.classList.add('changing'));
      });
      if (focus) tab.focus();
    };
    tabs.forEach((tab, i) => {
      tab.addEventListener('click', () => show(tab));
      tab.addEventListener('keydown', event => {
        const directions = {ArrowRight:(i+1)%tabs.length, ArrowLeft:(i-1+tabs.length)%tabs.length, Home:0, End:tabs.length-1};
        if (event.key in directions) {event.preventDefault();show(tabs[directions[event.key]], true);}
      });
    });
  });
  const search = document.querySelector('#project-search');
  if(search) {
    const buttons=[...document.querySelectorAll('[data-filter]')], cards=[...document.querySelectorAll('.archive-grid .project-card')];
    const params=new URLSearchParams(location.search);
    let category=params.get('kategori') || 'Alle';
    if(!buttons.some(b=>b.dataset.filter===category))category='Alle';
    const normalize = s => s.toLocaleLowerCase('nb').normalize('NFD').replace(/[\u0300-\u036f]/g,'');
    const update = () => {
      const query=normalize(search.value.trim());let count=0;
      cards.forEach(c=>{const show=(category==='Alle'||category===c.dataset.category)&&normalize(c.dataset.search).includes(query);c.hidden=!show;if(show){count++;c.classList.add('visible')}});
      buttons.forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.filter===category)));
      document.querySelector('#project-count').textContent=`${count} ${count===1?'prosjekt':'prosjekter'}`;
      document.querySelector('.empty-state').hidden=count!==0;
    };
    buttons.forEach(b=>b.addEventListener('click',()=>{category=b.dataset.filter;const url=new URL(location.href);if(category==='Alle')url.searchParams.delete('kategori');else url.searchParams.set('kategori',category);history.replaceState(null,'',url);update()}));
    search.addEventListener('input',update);
    document.querySelector('#reset-filters').addEventListener('click',()=>{category='Alle';search.value='';history.replaceState(null,'',location.pathname);update();search.focus()});
    update();
  }
  const gallery=[...document.querySelectorAll('.gallery-open')], lightbox=document.querySelector('.lightbox');
  if(gallery.length){
    let current=0,trigger;
    const render=()=>{const item=gallery[current],image=lightbox.querySelector('img');image.src=item.dataset.image;image.alt=item.dataset.caption;lightbox.querySelector('.lightbox-caption').textContent=item.dataset.caption;lightbox.querySelector('.lightbox-count').textContent=`${current+1} / ${gallery.length}`;lightbox.querySelectorAll('.lightbox-prev,.lightbox-next').forEach(b=>b.hidden=gallery.length<2)};
    gallery.forEach((b,i)=>b.addEventListener('click',()=>{current=i;trigger=b;render();lightbox.showModal();lock()}));
    lightbox.querySelector('.lightbox-close').addEventListener('click',()=>lightbox.close());
    const advance=delta=>{current=(current+delta+gallery.length)%gallery.length;render()};
    lightbox.querySelector('.lightbox-prev').addEventListener('click',()=>advance(-1));
    lightbox.querySelector('.lightbox-next').addEventListener('click',()=>advance(1));
    lightbox.addEventListener('keydown',e=>{if(e.key==='ArrowRight'){advance(1);e.preventDefault()}if(e.key==='ArrowLeft'){advance(-1);e.preventDefault()}});
    lightbox.addEventListener('close',()=>{unlock();trigger?.focus()});
  }
})();
