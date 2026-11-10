"""Backdrop for the share image (1200 x 630, drawn at 2x), in the site's painted style: ivory linen,
a soft watercolour wash, botanical florals from the site, and the couple from the watercolour sketch
(sketch.png + sketch-mask.png from lift.swift) with soft painted edges that fade into the paper at the
bottom, as if painted straight onto the card. Writes tools/og/backdrop.png."""
import numpy as np
from PIL import Image, ImageFilter
from scipy import ndimage as nd

S = 2
W, H = 1200 * S, 630 * S
rng = np.random.default_rng(11)
yy, xx = np.mgrid[0:H, 0:W].astype(float)

def noise(scale, seed):
    g = np.random.default_rng(seed).standard_normal((H // scale + 3, W // scale + 3))
    return nd.zoom(g, scale, order=3)[:H, :W]

# ivory linen, as on the site
lin = Image.open("assets/linen-sage.jpg").convert("L")
lin = lin.resize((lin.width * S // 2, lin.height * S // 2))
tile = Image.new("L", (W, H))
for y in range(0, H, lin.height):
    for x in range(0, W, lin.width):
        tile.paste(lin, (x, y))
t = nd.gaussian_filter(np.asarray(tile).astype(float), 1.0 * S)
t = (t - t.mean()) / max(t.std(), 1e-6)
ivory = np.array([247, 242, 232.]) / 255
img = ivory[None, None, :] * (1 + 0.022 * t[..., None])
img *= 1 - 0.10 * (((xx / W - .5) ** 2) * 1.2 + ((yy / H - .5) ** 2) * 1.4)[..., None]

# a soft watercolour wash behind the couple: sage with a blush edge, uneven like pigment on paper
cx, cy = 0.73 * W, 0.50 * H
d = np.sqrt(((xx - cx) / (0.27 * W)) ** 2 + ((yy - cy) / (0.50 * H)) ** 2) + 0.18 * noise(70, 1) + 0.06 * noise(14, 2)
wash = np.clip(1 - d, 0, 1) ** 0.8
edge = np.exp(-((d - 0.92) / 0.06) ** 2) * (d < 1.2)          # pigment pools at the rim
sage = np.array([168, 182, 146.]) / 255
blush = np.array([214, 168, 172.]) / 255
a = (wash * 0.30 + edge * 0.10)[..., None]
tint = sage * (1 - 0.25 * np.clip(noise(90, 3), 0, 1)[..., None]) + (blush - sage) * np.clip(noise(120, 4) * .6, 0, 1)[..., None]
img = img * (1 - a) + img * tint * a / np.maximum(ivory, 1e-3) * 0.98       # multiply-like, keeps the paper texture
canvas = Image.fromarray((np.clip(img, 0, 1) * 255).astype(np.uint8)).convert("RGBA")

def flower(name, width, angle, xy, flip=False, alpha=1.0):
    im = Image.open(f"assets/{name}.webp").convert("RGBA")
    if flip: im = im.transpose(Image.FLIP_LEFT_RIGHT)
    im = im.resize((width * S, int(im.height * width * S / im.width)), Image.LANCZOS).rotate(angle, expand=True, resample=Image.BICUBIC)
    if alpha < 1: im.putalpha(im.getchannel("A").point(lambda v: int(v * alpha)))
    sh = Image.new("RGBA", im.size, (40, 50, 30, 0)); sh.putalpha(im.getchannel("A").point(lambda v: int(v * .18)).filter(ImageFilter.GaussianBlur(5 * S)))
    x, y = int(xy[0] * S - im.width / 2), int(xy[1] * S - im.height / 2)
    canvas.alpha_composite(sh, (x + 3 * S, y + 5 * S)); canvas.alpha_composite(im, (x, y))

flower("olive", 300, 40, (35, 40))
flower("jasmine", 200, -25, (150, 25), alpha=.95)
flower("rose-white", 230, -150, (50, 600))
flower("bouquet-burgundy", 180, 205, (1170, 70), True)
flower("jasmine", 210, 160, (1190, 600), True)

# the couple, painted onto the paper
ph = Image.open("tools/og/sketch.png").convert("RGB")
mk = np.asarray(Image.open("tools/og/sketch-mask.png").convert("L")).astype(float) / 255
x0, y0, x1, y1 = Image.fromarray((mk * 255).astype(np.uint8)).getbbox()
h0, w0 = mk.shape
# soften and roughen the edge like a watercolour vignette, and let the bottom dissolve into the paper
n = nd.zoom(np.random.default_rng(7).standard_normal((h0 // 18 + 3, w0 // 18 + 3)), 18, order=3)[:h0, :w0]
soft = np.clip(nd.gaussian_filter(mk, 2.2) * 1.15 + n * 0.06, 0, 1)
fade = np.clip((y1 - np.arange(h0)[:, None]) / ((y1 - y0) * 0.22), 0, 1) ** 1.3
fade = np.clip(fade + n * 0.08 * (fade < 1), 0, 1)
alpha = soft * fade
scale = (600 * S) / (x1 - x0)          # about half the width, with room around them
nw, nh = int(w0 * scale), int(h0 * scale)
person = ph.convert("RGBA").resize((nw, nh), Image.LANCZOS)
person.putalpha(Image.fromarray((alpha * 255).astype(np.uint8)).resize((nw, nh), Image.LANCZOS))
px = int(0.715 * W - (x0 + x1) / 2 * scale)
py = int(H - y1 * scale) + 8 * S
canvas.alpha_composite(person, (px, py))
canvas.save("tools/og/backdrop.png")
print("backdrop", canvas.size, "couple at", px // S, py // S, "w", nw // S)
