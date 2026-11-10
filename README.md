# Rashed & Rahaf — wedding invitation

A phone-first invitation in sage, ivory and soft burgundy, structured like The Digital Yes "Fresco" demo but with its own artwork.

1. **Envelope** — sage card blind-embossed with florals (`tools/envelope.py`), a beige wax seal with an interlocking RR in relief (`tools/seal.py`). Tap the seal or scroll: the seal lifts, the flap opens onto the site and the envelope slides away.
2. **Hero** — a torn ivory card over Winslow Homer's palm and sea: the calligraphy is written in, then names, date, 6 PM, Secret Garden at W Dubai – The Palm. A personal link (`?to=Name`) adds "Dear Name," at the top.
3. **Countdown** in a sage linen frame with flowers that bloom in.
4. **A Note from Us**, then a painted sea band that drifts like the tide.
5. **The Celebration** — olive section with an ornate frame that draws itself, venue, time and map.
6. **The Evening** — the night's program as a timeline.
7. **Dress Code** — the couple under a floral arch, gentlemen in a black suit and black bow tie.
8. **Wedding Gift** — a flower wreath, bank details sheet with copy buttons, optional online gift link.
9. **Invite a Guest** — type a name to share a personal invitation link (share sheet or WhatsApp).
10. **RSVP** — numbered questions, guests counter, message.
11. **Closing** — arched palm painting, the calligraphy and a PDF download of the invitation.

## Edit before sharing

In `CONFIG` at the top of `script.js`:

- `bank`: the gift account details shown in the bank sheet
- `giftLink`: optional online gift / payment page; leave `''` to hide the button
- `venueShort`, `venuePlace`, `mapsUrl`, `date`, `whatsapp`

In `index.html`: the "A Note from Us" text, the program times in "The Evening", and the dress code wording.

The PDF is made from `tools/invitation-card.html`; after editing it run `tools/make-pdf.sh` (uses Google Chrome on the Mac).

The Arabic names are set in Diwan Thuluth (a macOS font): `tools/make-calligraphy.sh` renders راشد, و and رهف one by one (`tools/calligraphy.html`), and `tools/compose-calligraphy.py` stacks them into a monogram (راشد above and a little right, رهف close beneath and a little left, the و between them passing under رهف, the ف dot moved clear), written to the transparent layers `assets/calli-names.png` and `assets/calli-waw.png`. The site uses them as masks, so their colour is set in CSS.

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

- Paintings: Winslow Homer, *Palm Tree, Nassau* (1898), *Shore and Surf, Nassau* (1899), *Palm Trees, Florida* (1904); The Met, CC0
- Jasmine: *Jasminum officinale*, Curtis's Botanical Magazine, 1787
- Olive: *Olea europaea*, Köhler's Medizinal-Pflanzen, 1887
- Roses: Pierre-Joseph Redouté, *Rosa alba foliacea* and *Rosa muscosa alba*; bouquet by Redouté (a burgundy version is made by `tools/burgundy.py`)
- Wisteria: Heinrich Witte, *Flora* (1868)
- Paper, linen and torn-edge textures are generated (`tools/textures.py`)
