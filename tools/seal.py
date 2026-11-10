"""A pressed beige wax seal with an interlocking RR in relief -> assets/seal.png (transparent).
Built as a height map (wax puddle, stamped rim and field, bevelled letters), then lit like wax:
soft diffuse, a glossy highlight, darker hollows and a little colour bleeding through the thin edges."""
import numpy as np
from PIL import Image, ImageDraw, ImageFont
from scipy import ndimage as nd

S = 720
rng = np.random.default_rng(3)
yy, xx = np.mgrid[0:S, 0:S].astype(float)
cx = cy = S / 2
r = np.hypot(xx - cx, yy - cy); th = np.arctan2(yy - cy, xx - cx)

def smooth_noise(n, scale, seed):
    g = np.random.default_rng(seed).standard_normal((n // scale + 3, n // scale + 3))
    return nd.zoom(g, scale, order=3)[:n, :n]

# ---- wax puddle: an irregular, thick-edged disc
wob = sum(np.random.default_rng(10 + k).uniform(.006, .02) * np.cos((k + 2) * th + np.random.default_rng(20 + k).uniform(0, 6.3)) for k in range(7))
R0 = S * 0.47 * (1 + wob)
edge = (R0 - r)                                   # px inside the outline
mask = np.clip(edge / 1.5 + .5, 0, 1)
h = np.clip(edge / (S * .05), 0, 1) ** .55 * 1.0  # rounded rim of spilled wax

# ---- the stamp: rim, sloped wall, sunken field
Rf = S * 0.355
wall = np.clip((r - Rf) / (S * .03), 0, 1)
h = h - (1 - wall) * 0.42 * (edge > 0)
ring = np.exp(-((r - S * .322) / (S * .0045)) ** 2) * 0.12   # fine raised border ring inside the field
h += ring

# ---- interlocking RR in relief
def glyph(ch, size, x, y, font):
    im = Image.new("L", (S, S)); d = ImageDraw.Draw(im)
    f = ImageFont.truetype(font, size, index=1)
    d.text((x, y), ch, font=f, fill=255, anchor="mm")
    return np.asarray(im).astype(float) / 255
F = "/System/Library/Fonts/Supplemental/Baskerville.ttc"
r1 = glyph("R", 270, cx - 64, cy - 10, F)
r2 = glyph("R", 270, cx + 64, cy + 14, F)
gap = nd.grey_dilation(r2, size=(9, 9))
r1 = r1 * (1 - np.clip(gap, 0, 1))                # the second R passes over the first
def bevel(m, lift):
    b = nd.gaussian_filter(m, 3.2)
    return np.clip(b * 1.6, 0, 1) ** 1.2 * lift
h += bevel(r1, .26) + bevel(r2, .3)

# ---- wax surface: soft undulation, tiny pits
h += smooth_noise(S, 60, 5) * .012 + smooth_noise(S, 9, 6) * .003
pits = nd.gaussian_filter((rng.random((S, S)) > .99985).astype(float), 1.4) * 3
h -= pits * (r < Rf) * .25
h *= (edge > -2)
hs = nd.gaussian_filter(h, 1.0)

# ---- lighting
k = 26.0
gy, gx = np.gradient(hs)
n = np.dstack([-gx * k, -gy * k, np.ones_like(hs)]); n /= np.linalg.norm(n, axis=2, keepdims=True)
L = np.array([-.5, -.62, .6]); L /= np.linalg.norm(L)
V = np.array([0, 0, 1.])
Hh = (L + V); Hh /= np.linalg.norm(Hh)
dot = lambda v: n[..., 0] * v[0] + n[..., 1] * v[1] + n[..., 2] * v[2]  # (numpy's matmul is unreliable here)
diff = np.clip(dot(L), 0, 1)
spec = np.clip(dot(Hh), 0, 1) ** 30
sheen = np.clip(dot(Hh), 0, 1) ** 8
ao = np.clip(1 - (nd.gaussian_filter(hs, 9) - hs) * 2.2, .55, 1)

base = np.array([214, 202, 178.]) / 255
deep = np.array([138, 126, 104.]) / 255
lit = np.array([240, 233, 216.]) / 255
c = deep + (base - deep) * np.clip(diff * 1.25, 0, 1)[..., None]
c = c + (lit - base) * np.clip(diff - .72, 0, 1)[..., None] * 2.2
c = c * ao[..., None] * (1 + smooth_noise(S, 40, 9)[..., None] * .022)
# thin outer edge glows a little (light through the wax)
thin = np.exp(-np.clip(edge, 0, None) / 5)[..., None] * (edge > 0)[..., None]
c = c + thin * np.array([.04, .035, .02])
c = c + spec[..., None] * .22 + sheen[..., None] * .04
rgba = np.dstack([np.clip(c, 0, 1), mask])
Image.fromarray((rgba * 255).astype(np.uint8)).resize((600, 600), Image.LANCZOS).save("assets/seal.png", optimize=True)
print("wrote assets/seal.png")
