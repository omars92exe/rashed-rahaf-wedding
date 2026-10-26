/* ---------- Edit the wedding details here ---------- */
const CONFIG = {
  // Celebration start, UAE time (+04:00)
  date: '2026-12-20T19:00:00+04:00',
  venue: 'Abu Dhabi · Al Maryah Island',
  mapsUrl: 'https://www.google.com/maps/search/?api=1&query=Four+Seasons+Hotel+Abu+Dhabi+at+Al+Maryah+Island',
  // Fallback if the RSVP storage isn't set up: replies open WhatsApp to this number.
  // International format, digits only, e.g. '9715XXXXXXXX'. Leave '' to disable.
  whatsapp: '',
};

const $ = (s, el = document) => el.querySelector(s);
const $$ = (s, el = document) => [...el.querySelectorAll(s)];
const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
const hasGsap = !!(window.gsap && window.ScrollTrigger);

if ('scrollRestoration' in history) history.scrollRestoration = 'manual';
window.scrollTo(0, 0);

$('#venuePlace').textContent = CONFIG.venue;
$('#mapLink').href = CONFIG.mapsUrl;
$('#couple').appendChild($('#coupleTpl').content.cloneNode(true));

/* ---------- Flower bed: back row → front row ---------- */
// x / w are % of the stage width, h is % of the stage height
const BED = [
  { src: 'shrub-rhodo', row: 0, x: -14, w: 62 },
  { src: 'shrub-oleander', row: 0, x: 58, w: 56, flip: true },
  { src: 'shrub-judas', row: 0, x: 26, w: 48 },
  { src: 'lily-pink', row: 1, x: -10, h: 40 },
  { src: 'lily-orange', row: 1, x: 70, h: 42, flip: true },
  { src: 'shrub-pink', row: 1, x: 34, w: 34 },
  { src: 'rose', row: 2, x: -22, h: 30 },
  { src: 'lily-orange', row: 2, x: 12, h: 26 },
  { src: 'bouquet', row: 2, x: 66, h: 28 },
  { src: 'lily-pink', row: 2, x: 52, h: 20, flip: true },
  { src: 'shrub-rhodo', row: 3, x: -18, w: 58 },
  { src: 'shrub-pink', row: 3, x: 66, w: 52, flip: true },
];
const bed = $('#bed');
BED.forEach((p, i) => {
  const img = new Image();
  img.src = `assets/${p.src}.webp`;
  img.alt = '';
  img.decoding = 'async';
  img.className = `plant row-${p.row}${p.flip ? ' flip' : ''}`;
  img.style.left = `${p.x}%`;
  img.style.bottom = `${-2 - p.row * 1.5}%`;
  if (p.h) img.style.height = `${p.h}%`;
  if (p.w) img.style.width = `${p.w}%`;
  img.style.animationDelay = `${-i * 0.7}s`;
  bed.appendChild(img);
});

/* ---------- Text: split into letters so every line animates the same way ---------- */
$$('.split').forEach(el => {
  const text = el.textContent;
  el.setAttribute('aria-label', text);
  el.textContent = '';
  for (const word of text.split(/(\s+)/)) {
    if (!word) continue;
    if (/^\s+$/.test(word)) { el.append(' '); continue; }
    const w = document.createElement('span');
    w.style.display = 'inline-block';
    w.setAttribute('aria-hidden', 'true');
    for (const c of word) {
      const s = document.createElement('span');
      s.className = 'ch';
      s.textContent = c;
      w.appendChild(s);
    }
    el.appendChild(w);
  }
});

/* ---------- Ambient life: lake glints, petals, light motes, butterflies ---------- */
const sparkles = $('#sparkles');
for (let i = 0; i < 14; i++) {
  const g = document.createElement('i');
  g.style.cssText = `left:${8 + Math.random() * 84}%;top:${Math.random() * 100}%;animation-delay:${-Math.random() * 3.4}s;animation-duration:${2.6 + Math.random() * 2}s`;
  sparkles.appendChild(g);
}

const air = (() => {
  const cv = $('#air');
  const ctx = cv.getContext('2d');
  const PETAL = ['#f6cdd4', '#fbe3e6', '#fff6f0', '#eab0bd', '#e2d3ee', '#fff1d6'];
  let W = 0, H = 0, density = 0, last = 0, wind = 0;
  const petals = [], motes = [];
  const flies = $$('.bfly').map((el, i) => ({ el, seed: i * 17.3 + 3, x: 0, y: 0 }));

  function resize() {
    const dpr = Math.min(2, devicePixelRatio || 1);
    W = cv.clientWidth; H = cv.clientHeight;
    cv.width = W * dpr; cv.height = H * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }
  const petal = (anywhere) => ({
    x: Math.random() * W, y: anywhere ? Math.random() * H : -20,
    s: 3 + Math.random() * 6, z: Math.random(),
    vy: 16 + Math.random() * 26, ph: Math.random() * 6.3, sw: 0.6 + Math.random() * 1.2,
    rot: Math.random() * 6.3, vr: (Math.random() - 0.5) * 2.4, flip: Math.random() * 6.3,
    c: PETAL[(Math.random() * PETAL.length) | 0],
  });
  const mote = () => ({ x: Math.random() * W, y: H * (0.25 + Math.random() * 0.6), r: 1 + Math.random() * 2.2, ph: Math.random() * 6.3, sp: 0.2 + Math.random() * 0.5 });

  function frame(now) {
    const dt = Math.min(0.05, (now - last) / 1000 || 0);
    last = now;
    ctx.clearRect(0, 0, W, H);
    wind = Math.sin(now / 3200) * 14 + Math.sin(now / 1300) * 5;

    const want = Math.round(density * 34);
    while (petals.length < want) petals.push(petal(petals.length < want / 2));
    while (motes.length < Math.round(density * 18)) motes.push(mote());

    // drifting light motes (soft bokeh)
    for (const m of motes.slice(0, Math.round(density * 18))) {
      m.ph += dt * m.sp;
      const x = m.x + Math.sin(m.ph * 1.3) * 18, y = m.y + Math.cos(m.ph) * 12;
      const a = (0.25 + 0.25 * Math.sin(m.ph * 2)) * density;
      const g = ctx.createRadialGradient(x, y, 0, x, y, m.r * 5);
      g.addColorStop(0, `rgba(255,244,214,${a})`);
      g.addColorStop(1, 'rgba(255,244,214,0)');
      ctx.fillStyle = g;
      ctx.fillRect(x - m.r * 5, y - m.r * 5, m.r * 10, m.r * 10);
    }

    // falling petals, tumbling in the breeze
    for (let i = petals.length - 1; i >= 0; i--) {
      const p = petals[i];
      const sp = 0.55 + p.z * 0.75;
      p.ph += dt * p.sw;
      p.y += p.vy * sp * dt;
      p.x += (Math.sin(p.ph) * 22 + wind) * sp * dt;
      p.rot += p.vr * dt;
      p.flip += dt * 2.6;
      if (p.y > H + 20 || p.x < -30 || p.x > W + 30) {
        if (petals.length > want) { petals.splice(i, 1); continue; }
        Object.assign(p, petal(false), { x: Math.random() * W });
      }
      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate(p.rot);
      ctx.scale(1, 0.25 + Math.abs(Math.cos(p.flip)) * 0.75);
      ctx.globalAlpha = (0.55 + p.z * 0.45) * Math.min(1, density * 1.5);
      ctx.fillStyle = p.c;
      ctx.beginPath();
      ctx.moveTo(0, -p.s);
      ctx.bezierCurveTo(p.s * 0.9, -p.s * 0.6, p.s * 0.7, p.s * 0.8, 0, p.s);
      ctx.bezierCurveTo(-p.s * 0.7, p.s * 0.8, -p.s * 0.9, -p.s * 0.6, 0, -p.s);
      ctx.fill();
      ctx.globalAlpha *= 0.5;
      ctx.fillStyle = '#fff';
      ctx.beginPath();
      ctx.ellipse(-p.s * 0.2, -p.s * 0.2, p.s * 0.22, p.s * 0.5, 0.3, 0, 6.3);
      ctx.fill();
      ctx.restore();
    }

    // butterflies wander over the meadow
    const t = now / 1000;
    for (const f of flies) {
      const k = f.seed;
      f.x = W * (0.5 + 0.38 * Math.sin(t * 0.21 + k) * Math.cos(t * 0.09 + k * 2));
      f.y = H * (0.6 + 0.12 * Math.sin(t * 0.33 + k * 1.7) + 0.03 * Math.sin(t * 3.1 + k));
      const dir = Math.cos(t * 0.21 + k) >= 0 ? 1 : -1;
      f.el.style.transform = `translate(${f.x}px, ${f.y}px) scaleX(${dir}) rotate(${Math.sin(t * 2 + k) * 12}deg)`;
      f.el.style.opacity = density;
    }

    if (!document.hidden) requestAnimationFrame(frame);
  }
  resize();
  addEventListener('resize', resize);
  document.addEventListener('visibilitychange', () => { if (!document.hidden) { last = performance.now(); requestAnimationFrame(frame); } });
  if (!reduceMotion) requestAnimationFrame(frame);
  return { set density(v) { density = Math.max(0, Math.min(1, v)); } };
})();

/* ---------- Countdown ---------- */
const target = new Date(CONFIG.date).getTime();
const cd = Object.fromEntries($$('#countdown b').map(b => [b.dataset.u, b]));
function tick() {
  let diff = Math.max(0, target - Date.now());
  const d = Math.floor(diff / 864e5); diff -= d * 864e5;
  const h = Math.floor(diff / 36e5); diff -= h * 36e5;
  const m = Math.floor(diff / 6e4);
  cd.d.textContent = d;
  cd.h.textContent = String(h).padStart(2, '0');
  cd.m.textContent = String(m).padStart(2, '0');
}
tick();
setInterval(tick, 15000);

/* ---------- Envelope flaps: scalloped edges drawn to fit the screen ---------- */
function buildEnvelope() {
  const box = $('#envelope').getBoundingClientRect();
  const W = box.width, H = box.height, r = Math.max(7, W / 44);
  // arcs from the current point to (bx,by); travelling clockwise, sweep 1 bulges outward
  const scallop = (ax, ay, bx, by) => {
    const n = Math.max(3, Math.round(Math.hypot(bx - ax, by - ay) / (r * 2)));
    let d = '';
    for (let i = 1; i <= n; i++) {
      const x = ax + ((bx - ax) * i) / n, y = ay + ((by - ay) * i) / n;
      d += ` A ${r * 1.08} ${r * 1.08} 0 0 1 ${x.toFixed(1)} ${y.toFixed(1)}`;
    }
    return d;
  };
  const tip = { t: [W / 2, H * 0.41], b: [W / 2, H * 0.6], l: [W * 0.56, H * 0.5], r: [W * 0.44, H * 0.5] };
  const shapes = {
    t: `M0 0 L${W} 0` + scallop(W, 0, ...tip.t) + scallop(...tip.t, 0, 0) + 'Z',
    b: `M${W} ${H} L0 ${H}` + scallop(0, H, ...tip.b) + scallop(...tip.b, W, H) + 'Z',
    l: `M0 ${H} L0 0` + scallop(0, 0, ...tip.l) + scallop(...tip.l, 0, H) + 'Z',
    r: `M${W} 0 L${W} ${H}` + scallop(W, H, ...tip.r) + scallop(...tip.r, W, 0) + 'Z',
  };
  const tone = { t: 0.9, b: 0.82, l: 1, r: 1.08 };
  const offset = { t: '0 0', b: `${-W * 0.2} ${-H * 0.1}`, l: `${-W * 0.1} ${-H * 0.05}`, r: `${-W * 0.3} ${-H * 0.15}` };
  for (const side of ['t', 'b', 'l', 'r']) {
    const flap = $(`[data-side="${side}"]`);
    const svg = fill => `<svg width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
      <defs><pattern id="dm-${side}" patternUnits="userSpaceOnUse" width="${W * 1.4}" height="${H * 1.3}" patternTransform="translate(${offset[side]})">
        <image href="assets/damask-wine.jpg" width="${W * 1.4}" height="${H * 1.3}" preserveAspectRatio="xMidYMid slice"/></pattern>
        <linearGradient id="light-${side}" x1="0" y1="0" x2="${W}" y2="${H}" gradientUnits="userSpaceOnUse">
          <stop offset="0" stop-color="#fff2ea" stop-opacity=".10"/><stop offset=".45" stop-color="#fff2ea" stop-opacity="0"/>
          <stop offset="1" stop-color="#12030a" stop-opacity=".28"/>
        </linearGradient>
        <radialGradient id="lift-${side}" cx="${tip[side][0]}" cy="${tip[side][1]}" r="${Math.max(W, H) * 0.55}" gradientUnits="userSpaceOnUse">
          <stop offset="0" stop-color="#fff0ea" stop-opacity=".07"/><stop offset="1" stop-color="#12030a" stop-opacity=".12"/>
        </radialGradient></defs>
      <path d="${shapes[side]}" fill="${fill}" style="filter:brightness(${tone[side]})"/>
      <path d="${shapes[side]}" fill="url(#light-${side})"/>
      <path d="${shapes[side]}" fill="url(#lift-${side})"/>
      <path d="${shapes[side]}" fill="none" stroke="rgba(255,226,220,.13)" stroke-width=".8"/>
    </svg>`;
    const front = $('.front', flap), back = $('.back', flap);
    $$(':scope > svg', front).forEach(n => n.remove());
    front.insertAdjacentHTML('afterbegin', svg(`url(#dm-${side})`));
    // the inside of each flap is plain wine paper
    back.innerHTML = svg('#6a2331').replace(/<defs>[\s\S]*?<\/defs>/, '');
  }
  // the seal sits dead centre, over the tip of the right flap
  const seal = $('#seal');
  seal.style.left = `${W / 2}px`;
  seal.style.top = `${H / 2}px`;
}
buildEnvelope();
let lastW = innerWidth;
addEventListener('resize', () => { if (innerWidth !== lastW) { lastW = innerWidth; buildEnvelope(); } });

/* ---------- The scroll film ---------- */
if (!hasGsap) {
  // No animation library: show the finished scene with all the details
  $('#envelope').hidden = true;
  $('#near').hidden = true;
  $$('.panel').forEach(p => { p.style.visibility = 'visible'; p.style.position = 'relative'; p.classList.add('live'); });
  $('.words').style.cssText = 'position:relative;overflow:auto;padding-top:8%';
} else {
  gsap.registerPlugin(ScrollTrigger);
  ScrollTrigger.config({ ignoreMobileResize: true });

  const chars = panel => $$('.ch', panel);
  const fades = panel => $$('.fade', panel);

  // Same entrance/exit for every line of text: letters rise out of a soft blur
  function textIn(tl, panel, at) {
    tl.set(panel, { visibility: 'visible' }, at)
      .fromTo(chars(panel),
        { opacity: 0, yPercent: 60, filter: 'blur(10px)' },
        { opacity: 1, yPercent: 0, filter: 'blur(0px)', duration: 1.4, stagger: 0.045, ease: 'power2.out' }, at)
      .fromTo(fades(panel),
        { opacity: 0, y: 16, filter: 'blur(6px)' },
        { opacity: 1, y: 0, filter: 'blur(0px)', duration: 1, ease: 'power2.out' }, at + 1.4)
      ;
  }
  function textOut(tl, panel, at) {
    tl.to(chars(panel), { opacity: 0, yPercent: -40, filter: 'blur(8px)', duration: 0.9, stagger: 0.015, ease: 'power1.in' }, at)
      .to(fades(panel), { opacity: 0, y: -10, filter: 'blur(6px)', duration: 0.6 }, at)
      .set(panel, { visibility: 'hidden' }, at + 1.6);
  }
  // Only the panel on screen can be tapped
  let livePanel = null;
  function setLive(panel) {
    if (livePanel === panel) return;
    $$('.panel').forEach(p => p.classList.toggle('live', p === panel));
    livePanel = panel;
  }

  gsap.set('.wis', { yPercent: -105 });
  gsap.set('.plant', { yPercent: 110 });
  gsap.set('.frame-tree', { opacity: 0 });

  const film = gsap.timeline({
    defaults: { ease: 'power1.inOut' },
    scrollTrigger: {
      trigger: '#film',
      start: 'top top',
      end: 'bottom bottom',
      scrub: reduceMotion ? true : 1.1,
      onUpdate() {
        // petals and butterflies arrive once the garden is revealed
        air.density = (film.time() - 13) / 5;
        // only the panel fully on screen can be tapped, in either scroll direction
        const t = film.time();
        const i = SHOW.findIndex((s, k) => t > s + 1.6 && t < HIDE[k]);
        setLive(i >= 0 ? $(ids[i]) : null);
      },
    },
  });

  // 1 — the envelope opens: right flap with the seal, left flap, then top and bottom
  film
    .to('#hint', { opacity: 0, duration: 1 }, 0)
    .to('#seal', { scale: 1.08, duration: 1.4, ease: 'power1.out' }, 0.2)
    .to('#flapR', { rotationY: 168, duration: 3, ease: 'power2.inOut' }, 1.4)
    .to('#liner', { opacity: 0, duration: 2.2, ease: 'power1.in' }, 1.8)
    .to('#flapL', { rotationY: -168, duration: 3, ease: 'power2.inOut' }, 2.3)
    .to('#flapT', { rotationX: 172, duration: 2.6, ease: 'power2.inOut' }, 4.1)
    .to('#flapB', { rotationX: -172, duration: 2.6, ease: 'power2.inOut' }, 4.4)
    .to('.flap', { opacity: 0, duration: 0.8 }, 6.4)
    .set('#envelope', { visibility: 'hidden' }, 7.3)
    // the garden waits just behind the flaps, slowly drifting closer
    .fromTo('#scene', { scale: 1.45 }, { scale: 1.25, duration: 4, ease: 'none' }, 2)
    .fromTo('#near', { scale: 1.12 }, { scale: 1.2, duration: 4, ease: 'none' }, 2);

  // 2 — the camera flies through the trees
  film
    .to('#scene', { scale: 1.06, duration: 6, ease: 'power2.out' }, 7)
    .to('.nt-l1', { xPercent: -80, yPercent: 10, scale: 1.6, filter: 'blur(5px) brightness(.8)', duration: 5, ease: 'power2.in' }, 7.4)
    .to('.nt-r1', { xPercent: 80, yPercent: 8, scale: 1.6, filter: 'blur(5px) brightness(.8)', duration: 5, ease: 'power2.in' }, 7.2)
    .to('.nt-l2', { xPercent: -90, yPercent: 30, scale: 1.8, filter: 'blur(6px) brightness(.8)', duration: 4.6, ease: 'power2.in' }, 7.8)
    .to('.nt-r2', { xPercent: 90, yPercent: 30, scale: 1.8, filter: 'blur(6px) brightness(.8)', duration: 4.6, ease: 'power2.in' }, 8)
    .to('.nt-b', { yPercent: 70, scale: 1.5, filter: 'blur(6px)', duration: 4.6, ease: 'power2.in' }, 8)
    .set('#near', { visibility: 'hidden' }, 13);

  // 3 — settle on the couple, then pull back: wisteria drops, flowers rise
  film
    .to('#scene', { scale: 1, duration: 4, ease: 'power1.inOut' }, 13)
    .to('.frame-tree', { opacity: 1, duration: 2 }, 13.5)
    .fromTo('.frame-l', { xPercent: -40 }, { xPercent: 0, duration: 4, ease: 'power2.out' }, 13.5)
    .fromTo('.frame-r', { xPercent: 40 }, { xPercent: 0, duration: 4, ease: 'power2.out' }, 13.5)
    .to('.wis', { yPercent: 0, duration: 4, stagger: 0.35, ease: 'power2.out' }, 15)
    .to('.plant.row-0', { yPercent: 0, duration: 3.6, stagger: 0.2, ease: 'power2.out' }, 15.5)
    .to('.plant.row-1', { yPercent: 0, duration: 3.6, stagger: 0.2, ease: 'power2.out' }, 16.1)
    .to('.plant.row-2', { yPercent: 0, duration: 3.6, stagger: 0.2, ease: 'power2.out' }, 16.7)
    .to('.plant.row-3', { yPercent: 0, duration: 3.6, stagger: 0.2, ease: 'power2.out' }, 17.3)
    .to('.haze', { opacity: 1, duration: 3 }, 17);

  // 4 — the words, one panel at a time; the sky moves toward sunset
  const SHOW = [19, 31, 42, 53];
  const HIDE = [27.5, 38.5, 49.5, 99];
  const ids = ['#p-names', '#p-date', '#p-venue', '#p-rsvp'];
  ids.forEach((id, i) => {
    textIn(film, $(id), SHOW[i]);
    if (HIDE[i] < 99) textOut(film, $(id), HIDE[i]);
  });
  film
    .to('#scene', { scale: 1.04, duration: 30, ease: 'none' }, 27)
    .to('.tint-gold', { opacity: 1, duration: 10, ease: 'none' }, 31)
    .to('.tint-dusk', { opacity: 0.75, duration: 10, ease: 'none' }, 45)
    .to({}, { duration: 4 }, 59); // a little hold at the end so the RSVP sits still

  // slow camera drift while the words play: near layers move more than far ones
  film
    .to('.far', { yPercent: -6, duration: 40, ease: 'none' }, 19)
    .to('.frame-l', { xPercent: -10, yPercent: 3, duration: 40, ease: 'none' }, 19)
    .to('.frame-r', { xPercent: 10, yPercent: 3, duration: 40, ease: 'none' }, 19)
    .to('.wis', { yPercent: -8, duration: 40, ease: 'none' }, 23)
    .to('.plant.row-2, .plant.row-3', { yPercent: 8, duration: 40, ease: 'none' }, 23)
    .to('#couple', { scale: 1.12, duration: 40, ease: 'none' }, 19);
}

/* ---------- RSVP ---------- */
const dialog = $('#rsvpDialog');
const form = $('#rsvpForm');
const statusEl = $('#formStatus');
const guestsField = $('#guestsField');

$('#openRsvp').addEventListener('click', () => {
  form.hidden = false;
  $('#thanks').hidden = true;
  statusEl.textContent = '';
  dialog.showModal();
});
$('#closeRsvp').addEventListener('click', () => dialog.close());
$('#doneRsvp').addEventListener('click', () => dialog.close());
dialog.addEventListener('click', e => { if (e.target === dialog) dialog.close(); });
form.addEventListener('change', () => {
  guestsField.hidden = form.elements.attending.value === 'no';
});

form.addEventListener('submit', async e => {
  e.preventDefault();
  const data = Object.fromEntries(new FormData(form));
  data.name = (data.name || '').trim();
  if (!data.name) {
    statusEl.textContent = 'Please write your name.';
    form.elements.name.focus();
    return;
  }
  if (data.attending === 'no') data.guests = '0';
  const btn = form.querySelector('[type=submit]');
  btn.disabled = true;
  statusEl.textContent = 'Sending…';
  try {
    const res = await fetch('/api/rsvp', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error(res.status);
    showThanks(data);
  } catch {
    if (CONFIG.whatsapp) {
      const text = `RSVP — Rashed & Rahaf\nName: ${data.name}\nAttending: ${data.attending === 'yes' ? 'Yes' : 'No'}\nGuests: ${data.guests}` +
        (data.message ? `\nNote: ${data.message}` : '');
      window.open(`https://wa.me/${CONFIG.whatsapp}?text=${encodeURIComponent(text)}`, '_blank', 'noopener');
      showThanks(data);
    } else {
      statusEl.textContent = 'Sorry, replies could not be sent right now. Please try again later.';
    }
  } finally {
    btn.disabled = false;
  }
});

function showThanks(data) {
  form.hidden = true;
  $('#thanksMsg').textContent = data.attending === 'yes'
    ? `We can't wait to celebrate with you, ${data.name}.`
    : `You will be missed, ${data.name}. Thank you for letting us know.`;
  $('#thanks').hidden = false;
  statusEl.textContent = '';
  form.reset();
  guestsField.hidden = false;
}
