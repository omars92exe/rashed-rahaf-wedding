# Rashed & Rahaf — wedding invitation

A phone-first invitation in sage, ivory and soft burgundy, structured like The Digital Yes "Fresco" demo but with its own artwork.

1. **Envelope** — ivory paper tied with a sage linen ribbon and a burgundy wax seal. Tap the bow or scroll: the bow unties, the ribbon slides away, the flap lifts and the card rises.
2. **Hero** — a torn ivory card over a Sargent garden painting: names, date, venue. A personal link (`?to=Name`) adds "Dear Name," at the top.
3. **Countdown** in a sage linen frame with flowers that bloom in.
4. **A Note from Us**, then a painted garden band.
5. **The Celebration** — olive section with an ornate frame that draws itself, venue, time and map.
6. **The Evening** — the night's program as a timeline.
7. **Dress Code** — the couple under a floral arch and the colour palette.
8. **Wedding Gift** — a flower wreath, bank details sheet with copy buttons, optional online gift link.
9. **Invite a Guest** — type a name to share a personal invitation link (share sheet or WhatsApp).
10. **RSVP** — numbered questions, guests counter, message.
11. **Closing** — arched painting, names and a PDF download of the invitation.

## Edit before sharing

In `CONFIG` at the top of `script.js`:

- `bank`: the couple's real account name, bank and IBAN (placeholders now)
- `giftLink`: optional online gift / payment page; leave `''` to hide the button
- `venueShort`, `venuePlace`, `mapsUrl`, `date`, `whatsapp`

In `index.html`: the "A Note from Us" text, the program times in "The Evening", and the dress code wording.

The PDF is made from `tools/invitation-card.html`; after editing it run `tools/make-pdf.sh` (uses Google Chrome on the Mac).

## Files

- `index.html`, `style.css`, `script.js`: the site (no build step)
- `assets/`: artwork, textures and the invitation PDF
- `functions/api/rsvp.js`, `functions/api/rsvps.js`: RSVP storage on Cloudflare
- `tools/`: scripts that fetched and cut out the artwork, made the textures and the PDF

## Deploy (GitHub → Cloudflare Pages)

1. Push this folder to a GitHub repository.
2. Cloudflare dashboard → **Workers & Pages → Create → Pages → Connect to Git**, then pick the repo.
3. Build settings: Framework preset **None**, build command empty, build output directory `/`.
4. **Storage & Databases → KV**: create a namespace `wedding-rsvps`. In the Pages project → **Settings → Bindings → Add → KV namespace**, set variable name `RSVPS` and namespace `wedding-rsvps`.
5. **Settings → Variables and Secrets**: add a secret `ADMIN_KEY` set to a long random value.
6. Redeploy so the binding takes effect, then add your custom domain.

To see replies, open `https://<your-domain>/api/rsvps?key=<ADMIN_KEY>`.

## Image credits

All public domain or CC0, from Wikimedia Commons:

- Paintings: John Singer Sargent, *Villa di Marlia, Lucca* (A Fountain; the garden; The Balustrade), 1910
- Jasmine: *Jasminum officinale*, Curtis's Botanical Magazine, 1787
- Olive: *Olea europaea*, Köhler's Medizinal-Pflanzen, 1887
- Roses: Pierre-Joseph Redouté, *Rosa alba foliacea* and *Rosa muscosa alba*; bouquet by Redouté
- Wisteria: Heinrich Witte, *Flora* (1868)
- Paper, linen and torn-edge textures are generated (`tools/textures.py`)
