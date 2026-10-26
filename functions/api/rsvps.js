// Cloudflare Pages Function: GET /api/rsvps?key=ADMIN_KEY
// Lists every reply. Set an ADMIN_KEY secret in Pages → Settings → Variables.
export async function onRequestGet({ request, env }) {
  const key = new URL(request.url).searchParams.get('key');
  if (!env.ADMIN_KEY || key !== env.ADMIN_KEY) return new Response('Not found', { status: 404 });
  if (!env.RSVPS) return Response.json({ error: 'RSVP storage is not configured' }, { status: 503 });

  const replies = [];
  let cursor;
  do {
    const page = await env.RSVPS.list({ prefix: 'rsvp:', cursor });
    for (const k of page.keys) {
      const v = await env.RSVPS.get(k.name, 'json');
      if (v) replies.push(v);
    }
    cursor = page.list_complete ? undefined : page.cursor;
  } while (cursor);

  const attending = replies.filter(r => r.attending === 'yes');
  return Response.json({
    total_replies: replies.length,
    attending: attending.length,
    declined: replies.length - attending.length,
    total_guests: attending.reduce((n, r) => n + (r.guests || 0), 0),
    replies,
  });
}
