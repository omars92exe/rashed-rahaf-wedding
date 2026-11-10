# Rashed & Rahaf — wedding invitation

A phone-first invitation in sage, ivory and soft burgundy, structured like The Digital Yes "Fresco" demo but with its own artwork.

1. **Envelope** — sage card blind-embossed with florals (`tools/envelope.py`), a beige wax seal with an interlocking RR in relief (`tools/seal.py`). Tap the seal or scroll: the seal lifts, the flap opens onto the site and the envelope slides away.
2. **Hero** — a torn ivory card over Winslow Homer's palm and sea: the calligraphy is written in, then names, date, 5 PM, Secret Garden at W Dubai – The Palm. A personal link (`?to=Name`) adds "Dear Name," at the top.
3. **Countdown** in a sage linen frame with flowers that bloom in.
4. **A Note from Us**, then a painted sea band that drifts like the tide.
5. **The Celebration** — olive section with an ornate frame that draws itself, venue, time and map.
6. **The Evening** — the night's program as a timeline.
7. **Dress Code** — the couple under a floral arch, gentlemen in a black suit and black bow tie.
8. **Wedding Gift** — a flower wreath, bank details sheet with copy buttons, optional online gift link.
9. **Closing** — arched palm painting, the calligraphy and a PDF download of the invitation.

## Edit before sharing

In `CONFIG` at the top of `script.js`:

- `bank`: the gift account details shown in the bank sheet
- `giftLink`: optional online gift / payment page; leave `''` to hide the button
- `venueShort`, `venuePlace`, `mapsUrl`, `date`

In `index.html`: the "A Note from Us" text, the program times in "The Evening", and the dress code wording.

The PDF is made from `tools/invitation-card.html`; after editing it run `tools/make-pdf.sh` (uses Google Chrome on the Mac).

The Arabic names are set in Diwan Thuluth (a macOS font): `tools/make-calligraphy.sh` renders راشد, و and رهف one by one (`tools/calligraphy.html`), and `tools/compose-calligraphy.py` stacks them into a monogram (راشد above and a little right, رهف close beneath and a little left, the و between them passing under رهف, the ف dot moved clear), written to the transparent layers `assets/calli-names.png` and `assets/calli-waw.png`. The site uses them as masks, so their colour is set in CSS.

## Link preview (WhatsApp)

`assets/og-image.jpg` is the picture shown when the link is shared: the couple from their watercolour sketch on ivory
linen with the site's florals and the names. Built by `tools/og/make-og.sh` from the sketch (put it at
`tools/og/sketch.png`; it is lifted out with macOS subject lifting and kept out of git), `make-backdrop.py` and `og.html`.
The tags in `index.html` point at `https://rashedandrahaf.wedding/assets/og-image.jpg` (WhatsApp needs full addresses).

## Files

- `index.html`, `style.css`, `script.js`: the site (no build step)
- `assets/`: artwork, textures and the invitation PDF
- `tools/`: scripts that fetched and cut out the artwork, made the textures and the PDF

## Live site and publishing

Live at **https://rashedandrahaf.wedding** (and www.), served by Cloudflare as the static-assets Worker
`rashed-rahaf-wedding` (`wrangler.jsonc`). After any change, publish with:

    sh tools/deploy.sh

Only `index.html`, `style.css`, `script.js` and `assets/` go up; `.assetsignore` keeps `tools/`, this README and the
config off the site. The first run on a new Mac asks you to sign in to Cloudflare in the browser.

## Image credits

All public domain or CC0, from Wikimedia Commons:

- Paintings: Winslow Homer, *Palm Tree, Nassau* (1898), *Shore and Surf, Nassau* (1899), *Palm Trees, Florida* (1904); The Met, CC0
- Jasmine: *Jasminum officinale*, Curtis's Botanical Magazine, 1787
- Olive: *Olea europaea*, Köhler's Medizinal-Pflanzen, 1887
- Roses: Pierre-Joseph Redouté, *Rosa alba foliacea* and *Rosa muscosa alba*; bouquet by Redouté (a burgundy version is made by `tools/burgundy.py`)
- Wisteria: Heinrich Witte, *Flora* (1868)
- Paper, linen and torn-edge textures are generated (`tools/textures.py`)
