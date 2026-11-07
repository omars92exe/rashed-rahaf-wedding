"""Generate the paper, torn-edge, linen and painting crops used by the invitation.

  python textures.py SRC_DIR OUT_DIR
"""
import sys

import numpy as np
from PIL import Image
from scipy import ndimage as ndi

Image.MAX_IMAGE_PIXELS = None
SRC, OUT = sys.argv[1].rstrip("/"), sys.argv[2].rstrip("/")
rng = np.random.default_rng(11)


def noise(shape, sigma, wrap=True):
    n = ndi.gaussian_filter(rng.random(shape).astype(np.float32), sigma, mode="wrap" if wrap else "reflect")
    return (n - n.mean()) / (n.std() + 1e-6)


def paper(shape, base, fibre=1.0, wrap=True):
    """Cotton paper: fine grain, long fibres both ways, soft clouding."""
    h, w = shape
    g = (0.020 * noise(shape, 0.7, wrap) + 0.012 * noise(shape, (0.6, 9), wrap) + 0.012 * noise(shape, (9, 0.6), wrap)
         + 0.008 * noise(shape, 30, wrap)) * fibre
    return np.clip(np.array(base, np.float32)[None, None] / 255 * (1 + g[..., None]), 0, 1)


def save(arr, path, alpha=None, q=82):
    a = (np.clip(arr, 0, 1) * 255).astype(np.uint8)
    if alpha is not None:
        a = np.dstack([a, (np.clip(alpha, 0, 1) * 255).astype(np.uint8)])
        Image.fromarray(a).save(path, "WEBP", quality=q, method=6)
    else:
        Image.fromarray(a).save(path, quality=q, optimize=True, progressive=True)


def torn_mask(h, w, margin, rough=1.0):
    """Alpha for a hand-torn sheet: a ragged edge with a lighter, fibrous rim."""
    yy, xx = np.mgrid[0:h, 0:w].astype(np.float32)
    d = np.minimum.reduce([xx, w - 1 - xx, yy, h - 1 - yy])            # distance to the image edge
    edge = margin + rough * (7 * noise((h, w), 16, False) + 2.2 * noise((h, w), 3, False) + 0.8 * noise((h, w), 0.8, False))
    inside = np.clip((d - edge) / 1.6, 0, 1)
    rim = np.clip(1 - np.abs(d - edge - 5) / 6, 0, 1) * inside          # the torn fibres show lighter
    return inside, rim


# 1. ivory cotton paper (tiles)
save(paper((900, 900), (248, 244, 236)), f"{OUT}/paper-ivory.jpg")

# 2. torn ivory card
h, w = 1500, 920
card = paper((h, w), (246, 241, 230), wrap=False)
inside, rim = torn_mask(h, w, 26, 1.2)
card = card * (1 - 0.06 * (1 - inside[..., None])) + rim[..., None] * 0.05
save(card, f"{OUT}/card-torn.webp", inside)

# 3. torn section edges (ivory over colour): a strip whose lower edge is torn
for name, base in (("edge-ivory", (248, 244, 236)), ("edge-olive", (64, 76, 50))):
    h, w = 140, 1400
    strip = paper((h, w), base, wrap=False)
    yy = np.mgrid[0:h, 0:w][0].astype(np.float32)
    edge = 70 + 13 * noise((1, w), 26, False)[0] + 3 * noise((1, w), 3, False)[0]
    alpha = np.clip((edge[None, :] - yy) / 1.6, 0, 1)
    rim = np.clip(1 - np.abs(edge[None, :] - yy - 4) / 5, 0, 1) * alpha
    strip = strip + rim[..., None] * (0.08 if name == "edge-ivory" else 0.18)
    save(strip, f"{OUT}/{name}.webp", alpha)

# 4. ivory envelope paper and sage linen (tiles)
save(paper((1000, 1000), (241, 235, 222), fibre=1.4), f"{OUT}/env-ivory.jpg")
h = w = 320
yy, xx = np.mgrid[0:h, 0:w].astype(np.float32)
weave = 0.5 * np.sin(xx * 2 * np.pi / 4) * (1 + 0.3 * noise((h, w), (0.5, 6))) + 0.5 * np.sin(yy * 2 * np.pi / 4) * (1 + 0.3 * noise((h, w), (6, 0.5)))
slub = 0.04 * noise((h, w), (0.6, 14)) + 0.03 * noise((h, w), (14, 0.6))
linen = np.array([128, 140, 104], np.float32)[None, None] / 255 * (1 + 0.07 * weave[..., None] + slub[..., None] + 0.02 * noise((h, w), 0.6)[..., None])
save(linen, f"{OUT}/linen-sage.jpg")

# 5. painting crops
def crop(src, out, cx, aspect, width, top=0.0, bottom=1.0):
    im = Image.open(src).convert("RGB")
    W, H = im.size
    y0, y1 = int(H * top), int(H * bottom)
    cw = int((y1 - y0) * aspect)
    x0 = int(min(max(cx * W - cw / 2, 0), W - cw))
    im = im.crop((x0, y0, x0 + cw, y1))
    im = im.resize((width, int(width * im.size[1] / im.size[0])), Image.LANCZOS)
    im.save(out, quality=76, optimize=True, progressive=True)
    print(out, im.size)


crop(f"{SRC}/John_Singer_Sargent___Villa_di_Marlia__Lucca__A_Fountain___G.jpg", f"{OUT}/hero-garden.jpg", 0.5, 0.5, 860, 0.02, 0.98)
crop(f"{SRC}/Sargent___Villa_di_Marlia__Lucca_The_Balustrade__1910__12_22.jpg", f"{OUT}/closing-balustrade.jpg", 0.33, 0.62, 1000, 0.02, 0.97)
im = Image.open(f"{SRC}/John_Singer_Sargent___Villa_di_Marlia__Lucca___Google_Art_Pr.jpg").convert("RGB")
W, H = im.size
band = im.crop((int(W * 0.02), int(H * 0.28), int(W * 0.98), int(H * 0.86)))
band = band.resize((1400, int(1400 * band.size[1] / band.size[0])), Image.LANCZOS)
band.save(f"{OUT}/band-garden.jpg", quality=80, optimize=True, progressive=True)
print("band", band.size)
