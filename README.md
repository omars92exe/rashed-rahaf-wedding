# Rashed & Rahaf — wedding invitation

A phone-first invitation that plays like a film as you scroll. No tapping is needed until the RSVP button.

1. A sage embossed envelope with a wax seal. The seal lifts and the flap opens.
2. The camera flies through the trees.
3. A lake scene with the couple. Wisteria drops in from the top and a bed of flowers rises from the bottom.
4. Four text panels, each animated the same way: names → date and countdown → venue → RSVP. Meanwhile the light warms toward sunset.

## Files

- `index.html`, `style.css`, `script.js`: the site (no build step)
- `assets/`: painted layers, cut out to transparent WebP (credits below)
- `functions/api/rsvp.js`: saves replies to Cloudflare KV
- `functions/api/rsvps.js`: lists replies for the hosts

Wedding details (date, venue line, Maps link, WhatsApp fallback) are in `CONFIG` at the top of `script.js`. Text lives in the `.panel` sections of `index.html`. The flower bed layout is the `BED` list in `script.js`.

## Deploy (GitHub → Cloudflare Pages)

1. Push this folder to a GitHub repository.
2. Cloudflare dashboard → **Workers & Pages → Create → Pages → Connect to Git**, then pick the repo.
3. Build settings: Framework preset **None**, build command empty, build output directory `/`.
4. **Storage & Databases → KV**: create a namespace `wedding-rsvps`. In the Pages project → **Settings → Bindings → Add → KV namespace**, set variable name `RSVPS` and namespace `wedding-rsvps`.
5. **Settings → Variables and Secrets**: add a secret `ADMIN_KEY` set to a long random value.
6. Redeploy (Deployments → Retry) so the binding takes effect.
7. **Custom domains**: add your domain.

To see replies, open `https://<your-domain>/api/rsvps?key=<ADMIN_KEY>`. Every push to `main` redeploys automatically.

## Upgrading the images with AI

Every layer is a separate file in `assets/`. To swap one, generate a PNG with a **transparent background**, save it as WebP under the same name, and roughly match the aspect ratio. Suggested prompts:

- `bg-lake.jpg`: "Soft impressionist oil painting, portrait 9:16, pastel sunset sky with peach and lavender clouds, misty blue mountains, calm lake, no people, no buildings, visible brush strokes"
- `meadow.webp`: "Impressionist oil-painted green meadow grass, horizontal strip, transparent background above the grass tips"
- `tree-*.webp`, `spruce-*.webp`: "Single realistic vintage botanical illustration of a [weeping willow / olive tree / flowering chestnut], full tree, isolated on transparent background, soft natural colours"
- `wisteria-*.webp`: "Hanging wisteria racemes, [white / lilac], realistic botanical painting, hanging from the top edge, isolated on transparent background"
- `lily-*.webp`, `rose.webp`, `bouquet.webp`: "Realistic Redouté-style botanical painting of [pink lilies / garden roses / peonies], full stem with leaves, isolated on transparent background"
- To show the real venue: "Four Seasons Hotel Abu Dhabi at golden hour, soft oil-painting style, isolated building on transparent background", then add it to the scene behind the trees.

## Image credits

All images are public domain or CC0, from Wikimedia Commons:

- Background: John Ferguson Weir, *Lake Leman (Lake Geneva), Switzerland*: public domain
- Meadow: *Alpine Landscape at Sunset* (SM 1559): public domain mark
- Lilies: Pierre-Joseph Redouté, *Les Liliacées* (*Lilium superbum*, *Lilium martagon*): public domain
- Rose and bouquet: Pierre-Joseph Redouté: public domain
- Wisteria: Heinrich Witte, *Flora* (1868), *Wisteria sinensis*: public domain
- Trees and shrubs: *Arbres d'ornement*, Larousse du XXe siècle (1932): CC0
- Envelope emboss: *Les Travaux de la Manufacture*, The Metropolitan Museum of Art: CC0
