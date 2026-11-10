"""Backdrop for the share image (1200 x 630, drawn at 2x): deep sage linen, a warm glow where the couple
stand, faint white botanical sprigs, and the couple lifted from their photo (couple.png + couple-mask.png
from lift.swift) with a soft shadow so they sit in the scene. Writes tools/og/backdrop.png."""
import numpy as np
from scipy import ndimage as nd
from PIL import Image, ImageFilter, ImageEnhance

S = 2
W, H = 1200 * S, 630 * S
yy, xx = np.mgrid[0:H, 0:W].astype(float)

# linen, deepened to a calm sage
lin = Image.open("assets/linen-sage.jpg").convert("RGB")
tile = Image.new("RGB", (W, H))
lw, lh = lin.size
lin = lin.resize((lw * S // 2, lh * S // 2))
for y in range(0, H, lin.height):
    for x in range(0, W, lin.width):
        tile.paste(lin, (x, y))
t = np.asarray(tile).astype(float) / 255
lum = (t[..., 0] * .3 + t[..., 1] * .59 + t[..., 2] * .11)[..., None]
base = np.array([66, 80, 56.]) / 255
lum = nd.gaussian_filter(lum[..., 0], 1.6 * S)[..., None]                      # soften the weave so it reads as cloth, not a grid
img = base * (1.0 + 0.045 * (lum - lum.mean()) / max(lum.std(), 1e-6))

# warm glow behind the couple, soft light from the upper left, gentle vignette
cx, cy = 0.73 * W, 0.42 * H
g = np.exp(-(((xx - cx) / (0.30 * W)) ** 2 + ((yy - cy) / (0.62 * H)) ** 2))
img = img + g[..., None] * np.array([.20, .19, .14]) * 0.9
g2 = np.exp(-(((xx - 0.25 * W) / (0.32 * W)) ** 2 + ((yy - 0.35 * H) / (0.55 * H)) ** 2))
img = img + g2[..., None] * np.array([.05, .055, .04])
v = ((xx / W - .5) ** 2 * 1.1 + (yy / H - .5) ** 2 * 1.6)
img = img * (1 - 0.55 * v[..., None])
canvas = Image.fromarray((np.clip(img, 0, 1) * 255).astype(np.uint8)).convert("RGBA")

def sprig(name, width, angle, xy, alpha, flip=False):
    im = Image.open(f"assets/{name}.webp").convert("RGBA")
    if flip: im = im.transpose(Image.FLIP_LEFT_RIGHT)
    im = im.resize((width * S, int(im.height * width * S / im.width)), Image.LANCZOS).rotate(angle, expand=True, resample=Image.BICUBIC)
    a = np.asarray(im.getchannel("A")).astype(float) * alpha
    w = Image.new("RGBA", im.size, (246, 241, 228, 0)); w.putalpha(Image.fromarray(a.astype(np.uint8)))
    canvas.alpha_composite(w, (int(xy[0] * S - im.width / 2), int(xy[1] * S - im.height / 2)))

sprig("olive", 330, 38, (40, 40), .10)
sprig("jasmine", 300, -140, (70, 610), .09)
sprig("olive", 260, 200, (600, 640), .07, True)
sprig("wisteria-white", 170, -28, (1185, 90), .08)

# the couple
ph = Image.open("tools/og/couple.png").convert("RGB")
mk = Image.open("tools/og/couple-mask.png").convert("L")
# clean the edges: pull the mask in a touch and replace edge colours with the subject's own colours,
# so no light from the old wall rims the hair and shoulders
m = np.asarray(mk).astype(float) / 255
core = nd.grey_erosion(m, size=(5, 5))
mm = np.minimum(m, nd.gaussian_filter(nd.grey_erosion(m, size=(3, 3)), 1.0))
P = np.asarray(ph).astype(float)
num = nd.gaussian_filter(P * core[..., None], (6, 6, 0)); den = nd.gaussian_filter(core, 6)[..., None]
inner = num / np.maximum(den, 1e-4)
edge = np.clip((1 - core) * (mm > 0.02), 0, 1)[..., None]
P = P * (1 - edge * 0.85) + inner * edge * 0.85
ph = Image.fromarray(np.clip(P, 0, 255).astype(np.uint8))
mk = Image.fromarray((mm * 255).astype(np.uint8))
x0, y0, x1, y1 = mk.getbbox()
scale = (H - 52 * S) / (y1 - y0)          # head near the top, cropped at the bottom like the photo
nw, nh = int(ph.width * scale), int(ph.height * scale)
ph = ph.resize((nw, nh), Image.LANCZOS)
mk = mk.resize((nw, nh), Image.LANCZOS).filter(ImageFilter.GaussianBlur(0.7 * S))
ph = ImageEnhance.Brightness(ph).enhance(1.04)
ph = ImageEnhance.Color(ph).enhance(0.96)
px = int(0.74 * W - (x0 + x1) / 2 * scale)
py = int(H - y1 * scale) + 2
sh = Image.new("RGBA", (nw, nh), (14, 20, 10, 0)); sh.putalpha(mk.point(lambda a: a * .42).filter(ImageFilter.GaussianBlur(22 * S)))
canvas.alpha_composite(sh, (px - 26 * S, py + 6 * S))
person = ph.convert("RGBA"); person.putalpha(mk)
canvas.alpha_composite(person, (px, py))
canvas.save("tools/og/backdrop.png")
print("backdrop", canvas.size, "couple at", px // S, py // S, "w", nw // S)
