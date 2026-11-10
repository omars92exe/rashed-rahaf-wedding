/* ---------- Edit the wedding details here ---------- */
const CONFIG = {
  // Celebration start, UAE time (+04:00)
  date: '2026-12-20T18:00:00+04:00',
  venueShort: 'W Dubai – The Palm, Dubai',
  venuePlace: 'West Crescent · Palm Jumeirah · Dubai',
  mapsUrl: 'https://maps.app.goo.gl/5YmUtDvq4DDznqqF9',
  // Shown under "View bank details", each with a copy button.
  bank: [
    ['Account name', 'RASHED ALFAGOUSH'],
    ['Bank', 'ADIB · Abu Dhabi Islamic Bank'],
    ['Account number', '19083958'],
    ['IBAN', 'AE21 0500 0000 0000 1908 3958'],
    ['SWIFT', 'ABDIAEADXXX'],
    ['Currency', 'AED'],
  ],
  // Optional online gift / payment page (a link from the couple's bank or a gift registry). '' hides the button.
  giftLink: '',
};

const $ = (s, el = document) => el.querySelector(s);
const $$ = (s, el = document) => [...el.querySelectorAll(s)];
const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
const hasGsap = !!(window.gsap && window.ScrollTrigger);
const rand = (a, b) => a + Math.random() * (b - a);

if ('scrollRestoration' in history) history.scrollRestoration = 'manual';
window.scrollTo(0, 0);

/* ---------- Details from CONFIG ---------- */
$$('[data-venue-short]').forEach(el => { el.textContent = CONFIG.venueShort; el.innerHTML = el.innerHTML.replace(', ', ',<br>'); });
$$('[data-venue-place]').forEach(el => (el.textContent = CONFIG.venuePlace));
$('#mapLink').href = CONFIG.mapsUrl;
if (CONFIG.giftLink) { $('#giftLink').href = CONFIG.giftLink; $('#giftLink').hidden = false; }

// A personal invitation: ?to=Name greets the guest by name
const guestName = (new URLSearchParams(location.search).get('to') || '').trim().slice(0, 60);
if (guestName) {
  $('#dear').textContent = `Dear ${guestName},`;
  $('#dear').hidden = false;
}

$('#couple').appendChild($('#coupleTpl').content.cloneNode(true));

/* ---------- Split headings into letters (every heading animates the same way) ---------- */
function splitText(el) {
  const walk = node => {
    for (const child of [...node.childNodes]) {
      if (child.nodeType === 3) {
        const frag = document.createDocumentFragment();
        for (const word of child.textContent.split(/(\s+)/)) {
          if (!word) continue;
          if (/^\s+$/.test(word)) { frag.append(word); continue; }
          const w = document.createElement('span');
          w.style.display = 'inline-block';
          for (const c of word) {
            const s = document.createElement('span');
            s.className = 'ch';
            s.textContent = c;
            w.appendChild(s);
          }
          frag.appendChild(w);
        }
        child.replaceWith(frag);
      } else if (child.nodeType === 1) walk(child);
    }
  };
  el.setAttribute('aria-label', el.textContent.replace(/\s+/g, ' ').trim());
  walk(el);
}
$$('.split').forEach(splitText);

/* ---------- Ornate frame for the celebration card, drawn to fit ---------- */
const LEAF = 'M0 0 C4 -5 12 -5 16 0 C12 5 4 5 0 0Z';
function buildOrnate() {
  const svg = $('.ornate-svg');
  const { width: W, height: H } = svg.getBoundingClientRect();
  if (!W) return;
  const corner = `
    <path class="draw" d="M12 58 C12 32 28 14 54 12 C70 11 78 21 74 31 C71 39 60 38 60 30 C60 25 66 24 68 27"/>
    <path class="draw" d="M58 12 C32 12 14 28 12 54 C11 70 21 78 31 74 C39 71 38 60 30 60 C25 60 24 66 27 68"/>
    <path class="draw" d="M54 12 C76 5 98 14 120 9"/>
    <path class="draw" d="M12 54 C5 76 14 98 9 120"/>
    <use href="#leafShape" transform="translate(88 7) rotate(-14)"/>
    <use href="#leafShape" transform="translate(104 12) rotate(16) scale(.8)"/>
    <use href="#leafShape" transform="translate(7 88) rotate(104)"/>
    <use href="#leafShape" transform="translate(12 104) rotate(74) scale(.8)"/>
    <circle cx="30" cy="30" r="3.2"/>`;
  const sprig = `
    <path class="draw" d="M-46 0 C-30 -10 -14 -10 0 0 C14 -10 30 -10 46 0"/>
    <use href="#leafShape" transform="translate(-40 -3) rotate(-30)"/>
    <use href="#leafShape" transform="translate(-24 -8) rotate(-10) scale(.85)"/>
    <use href="#leafShape" transform="translate(40 -3) rotate(210)"/>
    <use href="#leafShape" transform="translate(24 -8) rotate(190) scale(.85)"/>
    <circle cx="0" cy="-2" r="4.5"/><circle cx="0" cy="-2" r="1.6" fill="var(--olive-deep)"/>`;
  const r = 18, i = 14;
  svg.setAttribute('viewBox', `0 0 ${W} ${H}`);
  svg.innerHTML = `
    <defs><path id="leafShape" d="${LEAF}"/></defs>
    <g fill="none" stroke="currentColor" stroke-width="1.1" stroke-linecap="round">
      <rect class="draw" x="3" y="3" width="${W - 6}" height="${H - 6}"/>
      <path class="draw" d="M${i + r} ${i} H${W - i - r} A${r} ${r} 0 0 0 ${W - i} ${i + r} V${H - i - r} A${r} ${r} 0 0 0 ${W - i - r} ${H - i}
        H${i + r} A${r} ${r} 0 0 0 ${i} ${H - i - r} V${i + r} A${r} ${r} 0 0 0 ${i + r} ${i}Z"/>
    </g>
    <g fill="currentColor" stroke="currentColor" stroke-width="1.1" stroke-linecap="round">
      ${[[0, 0, 1, 1], [W, 0, -1, 1], [0, H, 1, -1], [W, H, -1, -1]].map(([x, y, sx, sy]) =>
        `<g transform="translate(${x} ${y}) scale(${sx} ${sy})" class="o-corner">${corner}</g>`).join('')}
      <g transform="translate(${W / 2} ${i - 2})" class="o-sprig">${sprig}</g>
      <g transform="translate(${W / 2} ${H - i + 2}) scale(1 -1)" class="o-sprig">${sprig}</g>
    </g>`;
  $$('.draw', svg).forEach(p => { p.setAttribute('pathLength', '1'); p.setAttribute('fill', 'none'); });
  paintOrnate();   // a rebuilt frame picks up exactly where the drawing is
}

/* The frame's draw-in is one progress value (0 = not drawn, 1 = done) painted onto whatever nodes exist,
   so rebuilding the frame mid-animation or a repaint never makes it vanish or pop. */
const ornate = { p: hasGsap && !reduceMotion ? 0 : 1 };
function paintOrnate() {
  const paths = $$('.ornate-svg .draw'), bits = $$('.ornate-svg use, .ornate-svg circle');
  if (ornate.p >= 1) {   // finished: plain solid lines, no dash styling left for browsers to mis-repaint
    paths.forEach(el => { el.style.strokeDasharray = ''; el.style.strokeDashoffset = ''; });
    bits.forEach(el => { el.style.opacity = ''; });
    return;
  }
  const n = paths.length || 1;
  paths.forEach((el, k) => {
    const t = Math.min(1, Math.max(0, (ornate.p * 1.35 - (k / n) * 0.35)));     // a light stagger around the frame
    const e = t < .5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;              // ease in-out
    el.style.strokeDasharray = '1'; el.style.strokeDashoffset = String(1 - e);
  });
  const m = bits.length || 1;
  bits.forEach((el, k) => {
    const t = Math.min(1, Math.max(0, (ornate.p - 0.45 - (k / m) * 0.25) / 0.3));   // leaves and buds bloom in after the lines
    el.style.opacity = String(t * t * (3 - 2 * t));
  });
}

/* ---------- Flower wreath around the gift note ---------- */
function buildWreath() {
  const wreath = $('#wreath');
  const kinds = ['olive', 'jasmine', 'rose-white', 'olive', 'bouquet-burgundy', 'jasmine', 'olive', 'bouquet'];
  const N = 16, R = 134;
  for (let k = 0; k < N; k++) {
    const a = (k / N) * Math.PI * 2 - Math.PI / 2;
    const img = new Image();
    img.src = `assets/${kinds[k % kinds.length]}.webp`;
    img.alt = '';
    img.className = 'bloom';
    const size = kinds[k % kinds.length] === 'olive' ? 74 : 60;
    img.style.width = `${size}px`;
    img.style.transform = `rotate(${((a * 180) / Math.PI + 90 + rand(-12, 12)).toFixed(1)}deg)`;
    // each flower sits in a zero-size spot on the circle that centres it with flexbox. No percentage
    // transforms: the bloom animation rewrites transforms, and reading one before the image has loaded
    // (size 0) used to throw the flowers off the circle on phones
    const spot = document.createElement('span');
    spot.className = 'wreath-spot';
    spot.style.left = `calc(50% + ${(Math.cos(a) * R).toFixed(1)}px)`;
    spot.style.top = `calc(50% + ${(Math.sin(a) * R).toFixed(1)}px)`;
    spot.appendChild(img);
    wreath.appendChild(spot);
  }
}
buildWreath();

/* ---------- Countdown ---------- */
const target = new Date(CONFIG.date).getTime();
const cd = Object.fromEntries($$('.cd-unit b').map(b => [b.dataset.u, b]));
let countdownLive = !hasGsap || reduceMotion;
function parts() {
  let diff = Math.max(0, target - Date.now());
  const d = Math.floor(diff / 864e5); diff -= d * 864e5;
  const h = Math.floor(diff / 36e5); diff -= h * 36e5;
  const m = Math.floor(diff / 6e4); diff -= m * 6e4;
  return { d, h, m, s: Math.floor(diff / 1e3) };
}
function setUnit(el, v) {
  if (el.textContent === v) return;
  el.textContent = v;
  // each number rolls in as it changes
  if (hasGsap && !reduceMotion) gsap.fromTo(el, { yPercent: -45, opacity: 0, filter: 'blur(3px)' }, { yPercent: 0, opacity: 1, filter: 'blur(0px)', duration: 0.5, ease: 'power2.out' });
}
function tick() {
  if (!countdownLive) return;
  const p = parts();
  setUnit(cd.d, String(p.d));
  setUnit(cd.h, String(p.h).padStart(2, '0'));
  setUnit(cd.m, String(p.m).padStart(2, '0'));
  setUnit(cd.s, String(p.s).padStart(2, '0'));
}
tick();
setInterval(tick, 1000);

/* ---------- Petals drifting through the page ---------- */
(() => {
  if (reduceMotion) return;
  const cv = $('#petals');
  const ctx = cv.getContext('2d');
  const COLORS = ['#fbf6ee', '#f4e3e2', '#ead2d4', '#f7efe2', '#d9c2c6'];
  let W, H, last = 0;
  const items = [];
  const resize = () => {
    const dpr = Math.min(2, devicePixelRatio || 1);
    W = cv.clientWidth; H = cv.clientHeight;
    cv.width = W * dpr; cv.height = H * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  };
  const spawn = anywhere => ({
    x: Math.random() * W, y: anywhere ? Math.random() * H : -20, s: rand(4, 8), z: Math.random(),
    vy: rand(14, 30), ph: rand(0, 6.3), sw: rand(0.5, 1.2), rot: rand(0, 6.3), vr: rand(-1.2, 1.2), flip: rand(0, 6.3),
    leaf: Math.random() < 0.28, c: COLORS[(Math.random() * COLORS.length) | 0],
  });
  function frame(now) {
    const dt = Math.min(0.05, (now - last) / 1000 || 0);
    last = now;
    ctx.clearRect(0, 0, W, H);
    const wind = Math.sin(now / 3500) * 10;
    for (const p of items) {
      const sp = 0.6 + p.z * 0.6;
      p.ph += dt * p.sw; p.y += p.vy * sp * dt; p.x += (Math.sin(p.ph) * 18 + wind) * sp * dt;
      p.rot += p.vr * dt; p.flip += dt * 2.2;
      if (p.y > H + 20) Object.assign(p, spawn(false));
      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate(p.rot);
      ctx.scale(1, 0.3 + Math.abs(Math.cos(p.flip)) * 0.7);
      ctx.globalAlpha = 0.55 + p.z * 0.4;
      ctx.fillStyle = p.leaf ? '#8e9a74' : p.c;
      ctx.beginPath();
      if (p.leaf) { ctx.ellipse(0, 0, p.s * 1.3, p.s * 0.42, 0, 0, 6.3); }
      else {
        ctx.moveTo(0, -p.s);
        ctx.bezierCurveTo(p.s * 0.9, -p.s * 0.6, p.s * 0.7, p.s * 0.8, 0, p.s);
        ctx.bezierCurveTo(-p.s * 0.7, p.s * 0.8, -p.s * 0.9, -p.s * 0.6, 0, -p.s);
      }
      ctx.fill();
      ctx.restore();
    }
    if (!document.hidden) requestAnimationFrame(frame);
  }
  resize();
  addEventListener('resize', resize);
  for (let k = 0; k < 16; k++) items.push(spawn(true));
  document.addEventListener('visibilitychange', () => { if (!document.hidden) { last = performance.now(); requestAnimationFrame(frame); } });
  requestAnimationFrame(frame);
})();

/* ---------- Opening the envelope: tap the seal, or scroll/swipe ----------
   The seal lifts, the flap opens onto the site itself and the envelope slides away. */
const intro = $('#intro');
let opened = false;
function openEnvelope() {
  if (opened) return;
  opened = true;
  removeOpenTriggers();
  const done = () => {
    intro.remove();
    document.body.classList.remove('sealed');
    if (hasGsap) ScrollTrigger.refresh();
  };
  if (!hasGsap || reduceMotion) { done(); heroIn(); return; }
  $('#seal').style.animation = 'none';
  gsap.timeline({ onComplete: done, defaults: { force3D: true } })
    .to('#introHint', { opacity: 0, duration: 0.3 }, 0)
    // the seal presses, then lifts away
    .to('#seal', { scale: 0.92, duration: 0.14, ease: 'power2.out' }, 0)
    .to('#seal', { scale: 1.18, y: -36, opacity: 0, duration: 0.7, ease: 'power2.in' }, 0.14)
    // the flap opens; the site is already there inside
    .to('#envFlapShadow', { opacity: 0, duration: 0.5 }, 0.95)
    .to('#envFlap', { rotationX: 180, duration: 1.15, ease: 'power2.inOut' }, 0.95)
    .call(heroIn, null, 1.35)
    // the envelope slides down and away
    .to('#envPocket', { yPercent: 102, duration: 1.25, ease: 'power3.inOut' }, 1.85);
}
const onWheel = e => { if (e.deltaY > 4) openEnvelope(); };
let touchY = null;
const onTouchStart = e => { touchY = e.touches[0].clientY; };
const onTouchMove = e => { if (touchY !== null && touchY - e.touches[0].clientY > 24) openEnvelope(); };
const onKey = e => { if (['ArrowDown', 'PageDown', ' ', 'Enter'].includes(e.key)) openEnvelope(); };
function removeOpenTriggers() {
  removeEventListener('wheel', onWheel);
  removeEventListener('touchstart', onTouchStart);
  removeEventListener('touchmove', onTouchMove);
  removeEventListener('keydown', onKey);
}
addEventListener('wheel', onWheel, { passive: true });
addEventListener('touchstart', onTouchStart, { passive: true });
addEventListener('touchmove', onTouchMove, { passive: true });
addEventListener('keydown', onKey);
$('#seal').addEventListener('click', openEnvelope);
$('#envPocket').addEventListener('click', openEnvelope);

function heroIn() {
  if (!hasGsap || reduceMotion) return;
  gsap.timeline()
    .from('.hero-bg img', { scale: 1.16, duration: 2.6, ease: 'power2.out' }, 0)
    .from('#heroCard', { y: 30, opacity: 0, scale: 0.96, duration: 1.4, ease: 'power3.out' }, 0.15)
    .from('.hero-flora-a', { x: -80, y: -60, rotation: -40, opacity: 0, duration: 1.8, ease: 'power3.out' }, 0.3)
    // the names are written in, right to left, then the و sweeps in
    .fromTo('.hero-calli .calli-names', { clipPath: 'inset(0 0 0 100%)' }, { clipPath: 'inset(0 0 0 0%)', duration: 1.6, ease: 'power2.inOut' }, 0.7)
    .fromTo('.hero-calli .calli-waw', { opacity: 0, scale: 0.85, rotation: -8 }, { opacity: 1, scale: 1, rotation: 0, duration: 1, ease: 'power3.out' }, 1.7)
    .from('.hero-card > *:not(.hero-calli)', { opacity: 0, y: 14, stagger: 0.1, duration: 0.9, ease: 'power2.out' }, 1.3)
    .from('.scroll-cue', { opacity: 0, y: 12, duration: 0.8 }, 2.4);
}

/* ---------- Scroll reveals ---------- */
buildOrnate();
if (!hasGsap || reduceMotion) {
  document.documentElement.classList.add('static');
} else {
  gsap.registerPlugin(ScrollTrigger);
  ScrollTrigger.config({ ignoreMobileResize: true });

  // headings: letters rise out of a soft blur
  $$('.sec .split, .closing .split').forEach(el => {
    gsap.from($$('.ch', el), {
      opacity: 0, yPercent: 70, filter: 'blur(8px)', stagger: 0.045, duration: 1.1, ease: 'power2.out',
      scrollTrigger: { trigger: el, start: 'top 86%', once: true },
    });
  });
  // text and buttons
  ScrollTrigger.batch('.rv', {
    start: 'top 90%', once: true,
    onEnter: els => gsap.fromTo(els, { opacity: 0, y: 26, filter: 'blur(6px)' }, { opacity: 1, y: 0, filter: 'blur(0px)', duration: 1.1, stagger: 0.12, ease: 'power2.out' }),
  });
  gsap.set('.rv', { opacity: 0 });

  // flowers bloom into place around frames
  $$('.cd-frame, .dress-art, .wreath, .closing-arch').forEach(box => {
    gsap.from($$('.bloom', box), {
      opacity: 0, scale: 0.5, rotation: '-=25', duration: 1.4, stagger: 0.09, ease: 'back.out(1.6)',
      scrollTrigger: { trigger: box, start: 'top 80%', once: true },
    });
  });

  // countdown counts up the first time it appears
  ScrollTrigger.create({
    trigger: '.cd-frame', start: 'top 75%', once: true,
    onEnter: () => {
      const p = parts();
      const o = { d: 0, h: 0, m: 0, s: 0 };
      gsap.to(o, {
        ...p, duration: 2, ease: 'power3.out',
        onUpdate: () => {
          cd.d.textContent = Math.round(o.d);
          cd.h.textContent = String(Math.round(o.h)).padStart(2, '0');
          cd.m.textContent = String(Math.round(o.m)).padStart(2, '0');
          cd.s.textContent = String(Math.round(o.s)).padStart(2, '0');
        },
        onComplete: () => { countdownLive = true; tick(); },
      });
    },
  });

  // the ornate frame draws itself in
  const drawFrame = () => gsap.to(ornate, { p: 1, duration: 2.8, ease: 'none', onUpdate: paintOrnate, onComplete: paintOrnate });
  ScrollTrigger.create({ trigger: '.ornate', start: 'top 78%', once: true, onEnter: drawFrame });

  // the painted band glides as you pass
  gsap.fromTo('.band-img', { yPercent: -8 }, { yPercent: 8, ease: 'none', scrollTrigger: { trigger: '.band', start: 'top bottom', end: 'bottom top', scrub: true } });
  gsap.fromTo('.closing-img', { scale: 1.12 }, { scale: 1, ease: 'none', scrollTrigger: { trigger: '.closing-arch', start: 'top bottom', end: 'bottom 60%', scrub: true } });

  // timeline: the line grows and each moment slides in from its side
  gsap.fromTo('.timeline', { '--grow': 0 }, { '--grow': 1, ease: 'none', scrollTrigger: { trigger: '.timeline', start: 'top 80%', end: 'bottom 70%', scrub: true } });
  $$('.tl-item').forEach((li, k) => {
    gsap.from($('.tl-text', li), { opacity: 0, x: k % 2 ? 40 : -40, duration: 1, ease: 'power2.out', scrollTrigger: { trigger: li, start: 'top 85%', once: true } });
    gsap.from($('.tl-icon', li), { opacity: 0, scale: 0.4, rotation: -30, duration: 1.1, ease: 'back.out(1.8)', scrollTrigger: { trigger: li, start: 'top 85%', once: true } });
  });

  // the closing names are written in, right to left
  gsap.timeline({ scrollTrigger: { trigger: '.closing-calli', start: 'top 85%', once: true } })
    .fromTo('.closing-calli .calli-names', { clipPath: 'inset(0 0 0 100%)' }, { clipPath: 'inset(0 0 0 0%)', duration: 1.6, ease: 'power2.inOut' })
    .fromTo('.closing-calli .calli-waw', { opacity: 0, scale: 0.85, rotation: -8 }, { opacity: 1, scale: 1, rotation: 0, duration: 1, ease: 'power3.out' }, 1);

  // the day marker gently beats
  gsap.to('.days .today', { scale: 1.08, duration: 0.8, repeat: -1, yoyo: true, ease: 'sine.inOut' });
}
// keep the frame fitted whenever its box changes size (fonts loading, text, rotation); a rebuilt frame is fully visible
if ('ResizeObserver' in window) {
  let lastBox = '', raf = 0;
  new ResizeObserver(([e]) => {
    const box = Math.round(e.contentRect.width) + 'x' + Math.round(e.contentRect.height);
    if (box === lastBox) return;
    lastBox = box;
    cancelAnimationFrame(raf);
    raf = requestAnimationFrame(buildOrnate);
  }).observe($('.ornate'));
} else {
  let lastW = innerWidth;
  addEventListener('resize', () => { if (innerWidth !== lastW) { lastW = innerWidth; buildOrnate(); } });
}

/* ---------- Bank details ---------- */
const bankSheet = $('#bankSheet');
$('#bankList').innerHTML = CONFIG.bank.map(([k, v]) =>
  `<div><span><dt>${k}</dt><dd>${v}</dd></span><button type="button" data-copy="${k === 'IBAN' ? v.replace(/\s/g, '') : v}">Copy</button></div>`).join('');
$('#openBank').addEventListener('click', () => { $('#copyNote').textContent = ''; bankSheet.showModal(); });
// Copy that works on iPhone Safari and in in-app browsers (WhatsApp, Instagram), where the Clipboard API can
// report success without copying. The selection trick runs first, inside the open dialog (a modal dialog makes
// the rest of the page inert, so the helper field has to live in it), then the Clipboard API as a backup.
function copyText(text) {
  let ok = false;
  const ta = document.createElement('textarea');
  ta.value = text;
  ta.setAttribute('readonly', '');
  ta.style.cssText = 'position:fixed;top:0;left:0;width:1px;height:1px;opacity:0;font-size:16px;';
  bankSheet.appendChild(ta);
  ta.focus({ preventScroll: true });
  ta.select();
  ta.setSelectionRange(0, text.length);
  try { ok = document.execCommand('copy'); } catch { ok = false; }
  ta.remove();
  if (navigator.clipboard && window.isSecureContext) navigator.clipboard.writeText(text).catch(() => {});
  return ok || !!(navigator.clipboard && window.isSecureContext);
}
bankSheet.addEventListener('click', e => {
  if (e.target === bankSheet || e.target.closest('[data-close]')) return bankSheet.close();
  const btn = e.target.closest('[data-copy]');
  if (!btn) return;
  const ok = copyText(btn.dataset.copy);
  $$('[data-copy]', bankSheet).forEach(b => { b.textContent = 'Copy'; b.classList.remove('copied'); });
  if (ok) {
    btn.textContent = 'Copied ✓';
    btn.classList.add('copied');
    $('#copyNote').textContent = `${btn.closest('div').querySelector('dt').textContent} copied`;
    clearTimeout(btn._t);
    btn._t = setTimeout(() => { btn.textContent = 'Copy'; btn.classList.remove('copied'); }, 2200);
  } else {
    // last resort: show the value selected so it can be copied by hand
    $('#copyNote').textContent = btn.dataset.copy;
    getSelection().selectAllChildren($('#copyNote'));
  }
});
