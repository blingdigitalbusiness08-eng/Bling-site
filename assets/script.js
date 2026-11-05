/* Bling Digit - Portfolio v2 - comportements partagés
   Sans dépendance. Les animations respectent prefers-reduced-motion. */
(() => {
  'use strict';

  const $  = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
  const root = document.documentElement;
  root.classList.add('js');
  window.__bling = true;

  const ready = (fn) => (document.readyState === 'loading' ? document.addEventListener('DOMContentLoaded', fn) : fn());

  const ICONS = {
    close: '<svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M5 5L19 19M19 5L5 19" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"/></svg>',
    prev:  '<svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M15 5L8 12L15 19" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/></svg>',
    next:  '<svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M9 5L16 12L9 19" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/></svg>',
    up:    '<svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M12 19V5M5 12L12 5L19 12" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/></svg>',
    wa:    '<svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M4 20L5.3 15.6C4.5 14.2 4 12.6 4 11C4 6 8 2 13 2C18 2 21.5 6 21.5 11C21.5 16 18 19.5 13 19.5C11.5 19.5 10.1 19.1 8.9 18.4L4 20Z" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/><path d="M9.5 8.5C9.5 12 12 14.5 15.5 14.5L16.2 13.2L14.6 12.3L13.9 12.9C12.9 12.5 12.2 11.8 11.8 10.8L12.4 10.1L11.6 8.5L9.5 8.5Z" fill="currentColor"/></svg>'
  };


  /* ---------- Pied de page : année ---------- */
  function initYear() {
    $$('.js-year').forEach((el) => (el.textContent = new Date().getFullYear()));
  }

  /* ---------- Barre de progression, navigation (réduction / masquage), menu mobile ---------- */
  function initProgressAndNav() {
    const bar = document.createElement('div');
    bar.className = 'progress';
    bar.setAttribute('aria-hidden', 'true');
    document.body.prepend(bar);

    const nav = $('.nav');
    const toggle = $('.nav-toggle');
    const links = $('.nav-links');
    let lastY = window.scrollY;
    let menuOpen = false;

    if (links) $$('a', links).forEach((a, i) => a.style.setProperty('--i', i));

    const setOpen = (open) => {
      menuOpen = open;
      if (!links || !toggle) return;
      links.classList.toggle('open', open);
      document.body.classList.toggle('no-scroll', open);
      toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
      toggle.setAttribute('aria-label', open ? 'Fermer le menu' : 'Ouvrir le menu');
      if (open && nav) nav.classList.remove('hidden');
    };
    if (toggle && links) {
      toggle.addEventListener('click', () => setOpen(!menuOpen));
      $$('a', links).forEach((a) => a.addEventListener('click', () => setOpen(false)));
      document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && menuOpen) { setOpen(false); toggle.focus(); }
      });
      const desktop = window.matchMedia('(min-width: 861px)');
      const onChange = (e) => { if (e.matches) setOpen(false); };
      if (desktop.addEventListener) desktop.addEventListener('change', onChange);
    }

    let ticking = false;
    const onScroll = () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        const y = window.scrollY;
        const max = document.documentElement.scrollHeight - window.innerHeight;
        bar.style.setProperty('--p', max > 0 ? clamp(y / max, 0, 1).toFixed(4) : 0);
        if (nav) {
          nav.classList.toggle('scrolled', y > 24);
          const goingDown = y > lastY + 4;
          const goingUp = y < lastY - 4;
          if (!menuOpen) {
            if (goingDown && y > 360) { nav.classList.add('hidden'); root.classList.add('nav-away'); }
            else if (goingUp || y < 200) { nav.classList.remove('hidden'); root.classList.remove('nav-away'); }
          }
        }
        lastY = y;
        ticking = false;
      });
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  }

  /* ---------- Titres : découpe mot à mot ---------- */
  function initSplit() {
    $$('[data-split]').forEach((el) => {
      let i = 0;
      const walk = (node) => {
        Array.from(node.childNodes).forEach((n) => {
          if (n.nodeType === 3) {
            const frag = document.createDocumentFragment();
            n.textContent.split(/(\s+)/).forEach((part) => {
              if (!part) return;
              if (/^\s+$/.test(part)) { frag.appendChild(document.createTextNode(' ')); return; }
              const w = document.createElement('span');
              w.className = 'w';
              const s = document.createElement('span');
              s.textContent = part;
              s.style.setProperty('--i', i++);
              w.appendChild(s);
              frag.appendChild(w);
            });
            n.replaceWith(frag);
          } else if (n.nodeType === 1 && n.tagName !== 'BR') {
            walk(n);
          }
        });
      };
      walk(el);
    });
  }

  /* ---------- Révélation au défilement ---------- */
  // Une fois l'entrée terminée, on retire .reveal pour que les transitions
  // propres au composant (survol, inclinaison) reprennent la main.
  const settle = (el) => {
    if (!el.classList.contains('reveal')) return;
    const d = (parseFloat(getComputedStyle(el).getPropertyValue('--d')) || 0) * 1000;
    setTimeout(() => el.classList.remove('reveal'), d + 1500);
  };
  function initReveal() {
    const targets = $$('.reveal, [data-split]');
    if (!targets.length) return;

    // décalage automatique des enfants d'un conteneur [data-stagger]
    $$('[data-stagger]').forEach((box) => {
      const step = parseFloat(box.dataset.stagger) || 0.08;
      $$(':scope > .reveal', box).forEach((child, i) => child.style.setProperty('--d', (i * step).toFixed(2) + 's'));
    });

    const show = (el) => { el.classList.add('in'); settle(el); };
    if (!('IntersectionObserver' in window) || reduce) {
      targets.forEach((el) => el.classList.add('in'));
      return;
    }
    const io = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) { show(e.target); io.unobserve(e.target); }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -6% 0px' });
    targets.forEach((el) => io.observe(el));
    // filet de sécurité : le contenu ne reste jamais caché
    setTimeout(() => targets.forEach((el) => { if (!el.classList.contains('in')) show(el); }), 3500);
  }

  /* ---------- Marquees : duplication pour une boucle continue ---------- */
  function initMarquees() {
    $$('.marquee-track, .band-track').forEach((track) => {
      const wrapper = document.createElement('div');
      wrapper.setAttribute('aria-hidden', 'true');
      wrapper.style.display = 'contents';
      Array.from(track.children).forEach((c) => wrapper.appendChild(c.cloneNode(true)));
      track.appendChild(wrapper);
    });
    $$('.wall-track').forEach((track) => {
      const wrapper = document.createElement('div');
      wrapper.setAttribute('aria-hidden', 'true');
      wrapper.style.display = 'contents';
      Array.from(track.children).forEach((c) => wrapper.appendChild(c.cloneNode(true)));
      track.appendChild(wrapper);
    });
  }

  /* ---------- Compteurs ---------- */
  function initCounters() {
    const els = $$('[data-count]');
    if (!els.length) return;
    const run = (el) => {
      const end = parseFloat(el.dataset.count);
      const suffix = el.dataset.suffix || '';
      if (reduce) { el.textContent = end + suffix; return; }
      const dur = 1700;
      const t0 = performance.now();
      const tick = (t) => {
        const p = clamp((t - t0) / dur, 0, 1);
        const eased = p === 1 ? 1 : 1 - Math.pow(2, -10 * p);
        el.textContent = Math.round(end * eased) + suffix;
        if (p < 1) requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
    };
    if (!('IntersectionObserver' in window)) { els.forEach(run); return; }
    const io = new IntersectionObserver((entries) => {
      entries.forEach((e) => { if (e.isIntersecting) { run(e.target); io.unobserve(e.target); } });
    }, { threshold: 0.6 });
    els.forEach((el) => { if (!reduce) el.textContent = '0' + (el.dataset.suffix || ''); io.observe(el); });
  }

  /* ---------- Parallaxe légère ---------- */
  function initParallax() {
    if (reduce) return;
    const items = $$('[data-parallax]');
    const star = $('.hero-star');
    if (!items.length && !star) return;
    let ticking = false;
    const update = () => {
      const vh = window.innerHeight;
      items.forEach((el) => {
        const r = el.getBoundingClientRect();
        if (r.bottom < -100 || r.top > vh + 100) return;
        const speed = parseFloat(el.dataset.parallax) || 0.1;
        const offset = (r.top + r.height / 2 - vh / 2) * speed;
        el.style.transform = `translate3d(0, ${offset.toFixed(1)}px, 0)`;
      });
      if (star) star.style.setProperty('--py', (window.scrollY * 0.12).toFixed(1) + 'px');
      ticking = false;
    };
    window.addEventListener('scroll', () => { if (!ticking) { ticking = true; requestAnimationFrame(update); } }, { passive: true });
    update();
  }

  /* ---------- Effets au pointeur : halo, inclinaison, projecteur, aimant ---------- */
  function initPointerFx() {
    if (!finePointer || reduce) return;

    // halo qui suit le curseur
    const glow = document.createElement('div');
    glow.className = 'cursor-glow';
    glow.setAttribute('aria-hidden', 'true');
    document.body.appendChild(glow);
    let tx = 0, ty = 0, cx = 0, cy = 0, glowRun = false;
    const loop = () => {
      cx += (tx - cx) * 0.14; cy += (ty - cy) * 0.14;
      glow.style.transform = `translate3d(${cx.toFixed(1)}px, ${cy.toFixed(1)}px, 0)`;
      if (Math.abs(tx - cx) > 0.5 || Math.abs(ty - cy) > 0.5) requestAnimationFrame(loop); else glowRun = false;
    };
    window.addEventListener('pointermove', (e) => {
      tx = e.clientX; ty = e.clientY;
      glow.classList.add('on');
      if (!glowRun) { glowRun = true; requestAnimationFrame(loop); }
    }, { passive: true });
    document.addEventListener('pointerleave', () => glow.classList.remove('on'));

    // projecteur sur les cartes
    $$('.offer, .step, .contact-card').forEach((el) => {
      el.addEventListener('pointermove', (e) => {
        const r = el.getBoundingClientRect();
        el.style.setProperty('--mx', (e.clientX - r.left) + 'px');
        el.style.setProperty('--my', (e.clientY - r.top) + 'px');
      });
    });

    // inclinaison 3D + reflet
    const tilt = (el, max) => {
      el.addEventListener('pointermove', (e) => {
        const r = el.getBoundingClientRect();
        const px = (e.clientX - r.left) / r.width;
        const py = (e.clientY - r.top) / r.height;
        el.style.setProperty('--ry', ((px - 0.5) * max * 2).toFixed(2) + 'deg');
        el.style.setProperty('--rx', ((0.5 - py) * max * 2).toFixed(2) + 'deg');
        el.style.setProperty('--mx', (px * 100).toFixed(1) + '%');
        el.style.setProperty('--my', (py * 100).toFixed(1) + '%');
      });
      el.addEventListener('pointerleave', () => {
        el.style.setProperty('--rx', '0deg'); el.style.setProperty('--ry', '0deg');
      });
    };
    $$('.work-card').forEach((el) => tilt(el, 4));
    $$('.brand-tile').forEach((el) => tilt(el, 7));

    // boutons magnétiques
    $$('.btn, .nav-cta').forEach((el) => {
      el.addEventListener('pointermove', (e) => {
        const r = el.getBoundingClientRect();
        const dx = (e.clientX - (r.left + r.width / 2)) * 0.22;
        const dy = (e.clientY - (r.top + r.height / 2)) * 0.3;
        el.style.transform = `translate(${dx.toFixed(1)}px, ${dy.toFixed(1)}px)`;
      });
      el.addEventListener('pointerleave', () => { el.style.transform = ''; });
    });
  }

  /* ---------- Portfolio : grille sans recadrage, filtres animés ---------- */
  let galleryApi = null;
  function initGallery() {
    const gallery = $('.gallery');
    if (!gallery) return;
    const items = $$('.g-item', gallery);
    const chips = $$('.filter-chip');
    const ind = $('.filter-ind');
    const ROW = 2;

    const gap = () => parseFloat(getComputedStyle(gallery).columnGap) || 18;
    const layout = () => {
      const g = gap();
      items.forEach((it) => {
        if (it.classList.contains('hide')) return;
        it.style.gridRowEnd = 'span ' + Math.ceil((it.offsetHeight + g) / ROW);
      });
    };

    const moveInd = () => {
      const active = chips.find((c) => c.classList.contains('active'));
      if (!active || !ind) return;
      ind.style.width = active.offsetWidth + 'px';
      ind.style.transform = `translateX(${active.offsetLeft}px)`;
    };

    // compteurs par catégorie
    chips.forEach((c) => {
      const cat = c.dataset.filter;
      const n = cat === 'all' ? items.length : items.filter((i) => i.dataset.cat === cat).length;
      const span = document.createElement('span');
      span.className = 'count';
      span.textContent = n;
      c.appendChild(span);
    });

    const setFilter = (cat, { updateHash = false, animate = true } = {}) => {
      const before = new Map();
      if (animate && !reduce) items.forEach((i) => { if (!i.classList.contains('hide')) before.set(i, i.getBoundingClientRect()); });

      chips.forEach((c) => {
        const on = c.dataset.filter === cat;
        c.classList.toggle('active', on);
        c.setAttribute('aria-pressed', on ? 'true' : 'false');
      });
      items.forEach((i) => i.classList.toggle('hide', !(cat === 'all' || i.dataset.cat === cat)));
      const visible = items.filter((i) => !i.classList.contains('hide'));
      visible.forEach((i) => { i.classList.add('in'); settle(i); });
      layout();
      moveInd();

      if (animate && !reduce) {
        let n = 0;
        visible.forEach((i) => {
          const f = before.get(i);
          if (f) {
            const l = i.getBoundingClientRect();
            const dx = f.left - l.left, dy = f.top - l.top;
            if (dx || dy) i.animate([{ transform: `translate(${dx}px, ${dy}px)` }, { transform: 'none' }], { duration: 650, easing: 'cubic-bezier(.22,1,.36,1)' });
          } else {
            i.animate([{ opacity: 0, transform: 'translateY(26px) scale(.96)' }, { opacity: 1, transform: 'none' }],
              { duration: 650, delay: Math.min(n * 35, 420), easing: 'cubic-bezier(.22,1,.36,1)', fill: 'backwards' });
            n++;
          }
        });
      }
      if (updateHash) {
        const url = cat === 'all' ? location.pathname : `${location.pathname}#${cat}`;
        history.replaceState(null, '', url);
      }
    };

    chips.forEach((chip) => chip.addEventListener('click', () => setFilter(chip.dataset.filter, { updateHash: true })));

    const hash = location.hash.replace('#', '');
    const startCat = hash && chips.some((c) => c.dataset.filter === hash) ? hash : 'all';
    setFilter(startCat, { animate: false });
    if (startCat !== 'all') {
      setTimeout(() => { const f = $('.filter-wrap'); if (f) f.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'start' }); }, 80);
    }

    // recalcul quand la largeur change, quand les images/polices arrivent
    let rt;
    const relayout = () => { clearTimeout(rt); rt = setTimeout(() => { layout(); moveInd(); }, 60); };
    window.addEventListener('resize', relayout);
    window.addEventListener('load', relayout);
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(relayout);
    items.forEach((it) => { const img = $('img', it); if (img && !img.complete) img.addEventListener('load', relayout, { once: true }); });
    if ('ResizeObserver' in window) new ResizeObserver(relayout).observe(gallery);

    // accessibilité clavier + clic
    items.forEach((item) => {
      item.setAttribute('tabindex', '0');
      item.setAttribute('role', item.dataset.link ? 'link' : 'button');
      const label = $('.t', item)?.textContent;
      if (label) item.setAttribute('aria-label', `${item.dataset.link ? 'Ouvrir' : 'Agrandir'} : ${label}`);
      const act = () => {
        if (item.dataset.link) { navigate(item.dataset.link); return; }
        const group = items.filter((i) => !i.classList.contains('hide') && !i.dataset.link);
        galleryApi?.openGroup(group.map(toSlide), group.indexOf(item), item);
      };
      item.addEventListener('click', act);
      item.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); act(); }
      });
    });
    galleryApi = { items };
  }

  const toSlide = (el) => {
    const img = $('img', el);
    return {
      src: el.dataset.full || img.currentSrc || img.src,
      thumb: img.currentSrc || img.src,
      alt: img.alt || '',
      title: $('.t', el)?.textContent || img.alt || '',
      cat: $('.k', el)?.textContent || ''
    };
  };

  /* ---------- Visionneuse (lightbox) ----------
     Correctif : l'ancien <img> du visualiseur portait width="1" height="1",
     ce qui le rendait de 1 pixel de large. Il est maintenant créé ici sans
     attributs de taille et dimensionné uniquement en CSS. */
  function initLightbox() {
    const lb = document.createElement('div');
    lb.className = 'lightbox';
    lb.id = 'lightbox';
    lb.setAttribute('role', 'dialog');
    lb.setAttribute('aria-modal', 'true');
    lb.setAttribute('aria-label', 'Aperçu du visuel');
    lb.setAttribute('aria-hidden', 'true');
    lb.innerHTML = `
      <div class="lb-backdrop"></div>
      <button type="button" class="lb-btn lb-close" aria-label="Fermer l'aperçu">${ICONS.close}</button>
      <button type="button" class="lb-btn lb-prev" aria-label="Visuel précédent">${ICONS.prev}</button>
      <button type="button" class="lb-btn lb-next" aria-label="Visuel suivant">${ICONS.next}</button>
      <figure class="lb-stage loading">
        <img class="lb-img" alt="" decoding="async">
        <div class="lb-loader" aria-hidden="true"></div>
      </figure>
      <div class="lb-bar"><div class="lb-info"><span class="lb-k"></span><strong class="lb-t"></strong></div><div class="lb-count" aria-live="polite"></div></div>`;
    document.body.appendChild(lb);

    const stage = $('.lb-stage', lb);
    const img = $('.lb-img', lb);
    const kEl = $('.lb-k', lb), tEl = $('.lb-t', lb), cEl = $('.lb-count', lb);
    const btnClose = $('.lb-close', lb), btnPrev = $('.lb-prev', lb), btnNext = $('.lb-next', lb);

    let slides = [], index = 0, opener = null, token = 0;

    const preload = (i) => {
      const s = slides[(i + slides.length) % slides.length];
      if (s) { const p = new Image(); p.src = s.src; }
    };

    const show = (i, dir = 0) => {
      index = (i + slides.length) % slides.length;
      const s = slides[index];
      const my = ++token;
      img.classList.remove('zoomed');
      img.style.removeProperty('--ox'); img.style.removeProperty('--oy');
      const swap = () => {
        img.classList.remove('ready', 'slide-l', 'slide-r');
        if (dir) img.classList.add(dir > 0 ? 'slide-r' : 'slide-l');
        img.alt = s.alt;
        stage.classList.add('loading');
        // on affiche d'abord la vignette (déjà en cache), puis l'image complète
        img.src = s.thumb;
        const full = new Image();
        full.onload = () => {
          if (my !== token) return;
          img.src = s.src;
          stage.classList.remove('loading');
          requestAnimationFrame(() => requestAnimationFrame(() => img.classList.add('ready')));
        };
        full.onerror = () => {
          if (my !== token) return;
          stage.classList.remove('loading');
          img.classList.add('ready');
        };
        full.src = s.src;
        if (full.complete && full.naturalWidth) full.onload();
      };
      if (dir && img.classList.contains('ready')) {
        img.classList.remove('ready'); img.classList.add(dir > 0 ? 'slide-l' : 'slide-r');
        setTimeout(swap, 180);
      } else swap();
      kEl.textContent = s.cat;
      tEl.textContent = s.title;
      cEl.textContent = slides.length > 1 ? `${index + 1} / ${slides.length}` : '';
      preload(index + 1); preload(index - 1);
    };

    const open = (list, start, from) => {
      slides = list; opener = from || null;
      if (!slides.length) return;
      lb.classList.toggle('single', slides.length < 2);
      lb.setAttribute('aria-hidden', 'false');
      lb.classList.add('open');
      document.body.classList.add('no-scroll');
      show(start, 0);
      setTimeout(() => btnClose.focus(), 50);
    };

    const close = () => {
      lb.classList.remove('open');
      lb.setAttribute('aria-hidden', 'true');
      document.body.classList.remove('no-scroll');
      img.classList.remove('ready', 'zoomed');
      token++;
      if (opener && opener.focus) opener.focus({ preventScroll: true });
    };

    const step = (d) => { if (slides.length > 1) show(index + d, d); };

    btnClose.addEventListener('click', close);
    btnPrev.addEventListener('click', () => step(-1));
    btnNext.addEventListener('click', () => step(1));
    $('.lb-backdrop', lb).addEventListener('click', close);
    stage.addEventListener('click', (e) => { if (e.target === stage) close(); });

    // zoom au clic, déplacement en suivant le pointeur
    img.addEventListener('click', (e) => {
      const r = img.getBoundingClientRect();
      if (!img.classList.contains('zoomed')) {
        img.style.setProperty('--ox', ((e.clientX - r.left) / r.width * 100).toFixed(1) + '%');
        img.style.setProperty('--oy', ((e.clientY - r.top) / r.height * 100).toFixed(1) + '%');
      }
      img.classList.toggle('zoomed');
    });
    img.addEventListener('pointermove', (e) => {
      if (!img.classList.contains('zoomed') || e.pointerType === 'touch') return;
      const r = img.getBoundingClientRect();
      img.style.setProperty('--ox', clamp((e.clientX - r.left) / r.width * 100, 0, 100).toFixed(1) + '%');
      img.style.setProperty('--oy', clamp((e.clientY - r.top) / r.height * 100, 0, 100).toFixed(1) + '%');
    });

    // balayage tactile
    let sx = 0, sy = 0, sw = false;
    stage.addEventListener('touchstart', (e) => { if (e.touches.length === 1) { sx = e.touches[0].clientX; sy = e.touches[0].clientY; sw = true; } }, { passive: true });
    stage.addEventListener('touchend', (e) => {
      if (!sw) return; sw = false;
      const t = e.changedTouches[0]; const dx = t.clientX - sx, dy = t.clientY - sy;
      if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy) * 1.4) step(dx < 0 ? 1 : -1);
      else if (dy > 90 && Math.abs(dy) > Math.abs(dx) * 1.6) close();
    }, { passive: true });

    document.addEventListener('keydown', (e) => {
      if (!lb.classList.contains('open')) return;
      if (e.key === 'Escape') close();
      else if (e.key === 'ArrowRight') step(1);
      else if (e.key === 'ArrowLeft') step(-1);
      else if (e.key === 'Tab') {
        const f = [btnClose, btnPrev, btnNext].filter((b) => b.offsetParent !== null);
        const i = f.indexOf(document.activeElement);
        e.preventDefault();
        f[(i + (e.shiftKey ? -1 : 1) + f.length) % f.length].focus();
      }
    });

    // utilisable depuis la galerie et depuis n'importe quelle image [data-zoom]
    const api = { openGroup: open };
    galleryApi = Object.assign(galleryApi || {}, api);
    window.__lightbox = api;

    const zoomables = $$('[data-zoom]');
    zoomables.forEach((el) => {
      el.setAttribute('tabindex', '0');
      el.setAttribute('role', 'button');
      const im = el.tagName === 'IMG' ? el : $('img', el);
      el.setAttribute('aria-label', 'Agrandir : ' + (im?.alt || 'visuel'));
      const act = () => {
        const list = zoomables.map((z) => {
          const zi = z.tagName === 'IMG' ? z : $('img', z);
          return { src: z.dataset.full || zi.currentSrc || zi.src, thumb: zi.currentSrc || zi.src, alt: zi.alt || '', title: z.dataset.title || zi.alt || '', cat: z.dataset.cat || '' };
        });
        open(list, zoomables.indexOf(el), el);
      };
      el.addEventListener('click', act);
      el.addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); act(); } });
    });
  }

  /* ---------- Étapes : ligne de progression ---------- */
  function initSteps() {
    const steps = $('.steps');
    if (!steps) return;
    const update = () => {
      const r = steps.getBoundingClientRect();
      const p = clamp((window.innerHeight * 0.78 - r.top) / (r.height + window.innerHeight * 0.2), 0, 1);
      steps.style.setProperty('--prog', (reduce ? 1 : p).toFixed(3));
    };
    window.addEventListener('scroll', () => requestAnimationFrame(update), { passive: true });
    update();
  }

  /* ---------- Formulaire de contact : passage vers l'application email ---------- */
  function initForm() {
    const form = $('#contact-form');
    if (!form) return;
    const status = $('.form-status', form);
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      if (!form.checkValidity()) { form.reportValidity(); return; }
      const data = new FormData(form);
      const name = String(data.get('name') || '').trim();
      const email = String(data.get('email') || '').trim();
      const service = String(data.get('service') || '');
      const message = String(data.get('message') || '').trim();
      const subject = encodeURIComponent(`Nouveau projet de ${name}`);
      const body = encodeURIComponent(`Nom : ${name}\r\nEmail : ${email}\r\nType de projet : ${service}\r\n\r\n${message}`);
      if (status) status.textContent = 'Ouverture de votre application email, il ne reste qu\'à envoyer.';
      window.location.href = `mailto:blingdigitalbusiness08@gmail.com?subject=${subject}&body=${body}`;
    });
  }

  /* ---------- Boutons flottants : WhatsApp et retour en haut ---------- */
  function initFab() {
    const stack = document.createElement('div');
    stack.className = 'fab-stack';
    const isContact = /contact\.html$/.test(location.pathname);
    stack.innerHTML = `
      <button type="button" class="fab fab-top" aria-label="Retour en haut de page">${ICONS.up}</button>
      ${isContact ? '' : `<a class="fab fab-wa" href="https://wa.me/22661421352" target="_blank" rel="noopener" aria-label="Discuter sur WhatsApp">${ICONS.wa}</a>`}`;
    document.body.appendChild(stack);
    const top = $('.fab-top', stack);
    top.addEventListener('click', () => window.scrollTo({ top: 0, behavior: reduce ? 'auto' : 'smooth' }));
    const upd = () => top.classList.toggle('show', window.scrollY > 700);
    window.addEventListener('scroll', () => requestAnimationFrame(upd), { passive: true });
    upd();
  }

  /* ---------- Transition douce entre les pages ---------- */
  function navigate(url) {
    if (reduce) { window.location.href = url; return; }
    document.body.classList.add('leaving');
    setTimeout(() => { window.location.href = url; }, 230);
  }
  function initTransitions() {
    if (reduce) return;
    document.addEventListener('click', (e) => {
      const a = e.target.closest('a[href]');
      if (!a || e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      if (a.target === '_blank' || a.hasAttribute('download')) return;
      const href = a.getAttribute('href');
      if (!href || href.startsWith('#') || /^(mailto:|tel:|https?:\/\/(?!www\.blingdigit\.com))/i.test(href)) return;
      const url = new URL(a.href, location.href);
      if (url.origin !== location.origin) return;
      if (url.pathname === location.pathname && url.hash) return;
      e.preventDefault();
      navigate(a.href);
    });
    window.addEventListener('pageshow', (ev) => { if (ev.persisted) document.body.classList.remove('leaving'); });
  }

  ready(() => {
    initYear();
    initProgressAndNav();
    initSplit();
    initReveal();
    initMarquees();
    initCounters();
    initParallax();
    initPointerFx();
    initGallery();
    initLightbox();
    initSteps();
    initForm();
    initFab();
    initTransitions();
  });
})();
