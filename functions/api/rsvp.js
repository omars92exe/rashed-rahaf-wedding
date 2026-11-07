// Cloudflare Pages Function: POST /api/rsvp
// Needs a KV namespace bound as RSVPS (Pages → Settings → Bindings).
const json = (body, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { 'content-type': 'application/json' } });

export async function onRequestPost({ request, env }) {
  if (!env.RSVPS) return json({ error: 'RSVP storage is not configured' }, 503);

  let body;
  try {
    body = await request.json();
  } catch {
    return json({ error: 'Invalid request' }, 400);
  }

  // a hidden 'website' field catches spam bots; quietly accept and drop
  if (body.website) return json({ ok: true });

  const name = String(body.name || '').trim().slice(0, 100);
  if (!name) return json({ error: 'Name is required' }, 400);

  const attending = body.attending === 'no' ? 'no' : 'yes';
  const guests = attending === 'no' ? 0 : Math.min(10, Math.max(1, parseInt(body.guests, 10) || 1));
  const entry = {
    name,
    attending,
    guests,
    message: String(body.message || '').trim().slice(0, 500),
    at: new Date().toISOString(),
  };

  await env.RSVPS.put(`rsvp:${Date.now()}:${crypto.randomUUID()}`, JSON.stringify(entry));
  return json({ ok: true });
}
