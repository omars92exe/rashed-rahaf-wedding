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
        // only the panel fully on screen can be tapped, in either scroll direction
        const t = film.time();
        const i = SHOW.findIndex((s, k) => t > s + 1.6 && t < HIDE[k]);
        setLive(i >= 0 ? $(ids[i]) : null);
      },
    },
  });

  // 1 — the envelope opens
  film
    .to('#hint', { opacity: 0, duration: 1 }, 0)
    .to('#seal', { scale: 1.12, duration: 1.2, ease: 'power1.out' }, 0.4)
    .to('#seal', { scale: 0.4, opacity: 0, rotation: -25, y: -30, duration: 1.6, ease: 'power2.in' }, 1.6)
    .to('#flap', { rotationX: 178, duration: 3.2, ease: 'power2.inOut' }, 2)
    .to('#flap', { opacity: 0, duration: 0.6 }, 4.6)
    .fromTo('#scene', { scale: 1.45 }, { scale: 1.25, duration: 3, ease: 'none' }, 2)
    .fromTo('#near', { scale: 1.12 }, { scale: 1.2, duration: 3, ease: 'none' }, 2);

  // 2 — the camera flies through the envelope and the trees
  film
    .to('.env-front-l', { xPercent: -100, duration: 3.2, ease: 'power2.in' }, 5)
    .to('.env-front-r', { xPercent: 100, duration: 3.2, ease: 'power2.in' }, 5)
    .to('#envelope', { scale: 1.25, duration: 3.2, ease: 'power2.in' }, 5)
    .set('#envelope', { visibility: 'hidden' }, 8.3)
    .to('#scene', { scale: 1.06, duration: 6, ease: 'power2.out' }, 6)
    .to('.nt-l1', { xPercent: -80, yPercent: 10, scale: 1.6, filter: 'blur(5px) brightness(.8)', duration: 5, ease: 'power2.in' }, 6.4)
    .to('.nt-r1', { xPercent: 80, yPercent: 8, scale: 1.6, filter: 'blur(5px) brightness(.8)', duration: 5, ease: 'power2.in' }, 6.2)
    .to('.nt-l2', { xPercent: -90, yPercent: 30, scale: 1.8, filter: 'blur(6px) brightness(.8)', duration: 4.6, ease: 'power2.in' }, 6.8)
    .to('.nt-r2', { xPercent: 90, yPercent: 30, scale: 1.8, filter: 'blur(6px) brightness(.8)', duration: 4.6, ease: 'power2.in' }, 7)
    .to('.nt-b', { yPercent: 70, scale: 1.5, filter: 'blur(6px)', duration: 4.6, ease: 'power2.in' }, 7)
    .set('#near', { visibility: 'hidden' }, 12);

  // 3 — settle on the couple, then pull back: wisteria drops, flowers rise
  film
    .to('#scene', { scale: 1, duration: 4, ease: 'power1.inOut' }, 12)
    .to('.frame-tree', { opacity: 1, duration: 2 }, 12.5)
    .fromTo('.frame-l', { xPercent: -40 }, { xPercent: 0, duration: 4, ease: 'power2.out' }, 12.5)
    .fromTo('.frame-r', { xPercent: 40 }, { xPercent: 0, duration: 4, ease: 'power2.out' }, 12.5)
    .to('.wis', { yPercent: 0, duration: 4, stagger: 0.35, ease: 'power2.out' }, 14)
    .to('.plant.row-0', { yPercent: 0, duration: 3.6, stagger: 0.2, ease: 'power2.out' }, 14.5)
    .to('.plant.row-1', { yPercent: 0, duration: 3.6, stagger: 0.2, ease: 'power2.out' }, 15.1)
    .to('.plant.row-2', { yPercent: 0, duration: 3.6, stagger: 0.2, ease: 'power2.out' }, 15.7)
    .to('.plant.row-3', { yPercent: 0, duration: 3.6, stagger: 0.2, ease: 'power2.out' }, 16.3)
    .to('.haze', { opacity: 1, duration: 3 }, 16);

  // 4 — the words, one panel at a time; the sky moves toward sunset
  const SHOW = [18, 30, 41, 52];
  const HIDE = [26.5, 37.5, 48.5, 99];
  const ids = ['#p-names', '#p-date', '#p-venue', '#p-rsvp'];
  ids.forEach((id, i) => {
    textIn(film, $(id), SHOW[i]);
    if (HIDE[i] < 99) textOut(film, $(id), HIDE[i]);
  });
  film
    .to('#scene', { scale: 1.04, duration: 30, ease: 'none' }, 26)
    .to('.tint-gold', { opacity: 1, duration: 10, ease: 'none' }, 30)
    .to('.tint-dusk', { opacity: 0.75, duration: 10, ease: 'none' }, 44)
    .to({}, { duration: 4 }, 58); // a little hold at the end so the RSVP sits still
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
