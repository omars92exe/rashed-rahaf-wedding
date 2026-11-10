"""Sage envelope paper with blind-embossed florals (like letterpress on cotton card).
The botanical cut-outs in assets/ are turned into relief: their silhouettes are raised a little
and their painted line work is pressed in finer detail, then lit from the top left.
  assets/env-pocket.jpg  the back of the envelope: side flaps, bottom flap, fold shadows
  assets/env-flap.jpg    the top flap (front face)
Both are drawn at 1000 x 2000 / 1000 x 1020 and stretched to the envelope by CSS."""
import numpy as np
from PIL import Image
from scipy import ndimage as nd

rng = np.random.default_rng(7)
W, H = 1000, 2000
PAPER = np.array([118, 128, 104.]) / 255      # sage card
CX, CY = 500, 980                               # where the folds meet (50%, 49%)

def noise(shape, scale, octaves=4):
    out = np.zeros(shape)
    for o in range(octaves):
        s = scale / 2 ** o
        n = rng.standard_normal((int(shape[0] / s) + 3, int(shape[1] / s) + 3))
        out += nd.zoom(n, s, order=3)[: shape[0], : shape[1]] * (0.55 ** o)
    return out / np.abs(out).max()

def paper_grain(shape):
    g = 0.03 * noise(shape, 90) + 0.012 * noise(shape, 6, 2) + 0.006 * rng.standard_normal(shape)
    # cotton fibres: short streaks
    f = nd.gaussian_filter(rng.standard_normal(shape) * (rng.random(shape) > .998), (0.8, 4)) * 1.6
    return g + f

def relief(name, width, angle=0, flip=False):
    im = Image.open(f"assets/{name}.webp").convert("RGBA")
    if flip: im = im.transpose(Image.FLIP_LEFT_RIGHT)
    im = im.resize((width, int(im.height * width / im.width)), Image.LANCZOS).rotate(angle, expand=True, resample=Image.BICUBIC)
    a = np.asarray(im).astype(float) / 255
    alpha = a[..., 3]
    lum = (a[..., 0] * .3 + a[..., 1] * .59 + a[..., 2] * .11) * alpha + (1 - alpha)
    body = nd.gaussian_filter((alpha > .5).astype(float), 2.6)            # the raised silhouette
    lines = nd.gaussian_filter(np.clip(nd.gaussian_filter(lum, 1.5) - lum, 0, None) * 6, .8)  # painted line work
    return body * 1.0 + np.clip(lines, 0, 1.0) * alpha * 0.42

def place(Hm, r, x, y):
    h, w = r.shape
    x0, y0 = int(x - w / 2), int(y - h / 2)
    xs, ys = max(x0, 0), max(y0, 0)
    xe, ye = min(x0 + w, Hm.shape[1]), min(y0 + h, Hm.shape[0])
    if xe > xs and ye > ys:
        Hm[ys:ye, xs:xe] = np.maximum(Hm[ys:ye, xs:xe], r[ys - y0: ye - y0, xs - x0: xe - x0])

def shade(Hm, depth=2.6):
    Hs = nd.gaussian_filter(Hm, 1.1)
    gy, gx = np.gradient(Hs)
    nx, ny, nz = -gx * depth, -gy * depth, np.ones_like(Hs)
    n = np.sqrt(nx ** 2 + ny ** 2 + nz ** 2)
    L = np.array([-0.55, -0.6, 0.58]); L /= np.linalg.norm(L)
    d = (nx * L[0] + ny * L[1] + nz * L[2]) / n
    return d - L[2]                                 # 0 on flat paper, + lit, - in shadow

def render(Hm, extra, out, shape):
    grain = paper_grain(shape)
    s = shade(Hm) + extra
    rgb = PAPER[None, None, :] * (1 + grain[..., None]) * (1 + 1.25 * s[..., None])
    # a little warmth where the relief catches light, a little depth in its hollows
    rgb += np.clip(s, 0, None)[..., None] * np.array([.06, .06, .04])
    Image.fromarray((np.clip(rgb, 0, 1) * 255).astype(np.uint8)).save(out, quality=86, optimize=True, progressive=True)
    print("wrote", out)

# ---------- pocket ----------
Hm = np.zeros((H, W))
place(Hm, relief("rose-white", 520, -18), 150, 1240)
place(Hm, relief("jasmine", 470, 24), 120, 1720)
place(Hm, relief("wisteria-white", 300, 8, True), 920, 1180)
place(Hm, relief("rose-white", 470, 160, True), 880, 1690)
place(Hm, relief("olive", 360, -70), 520, 1950)
place(Hm, relief("jasmine", 300, 200), 70, 640)
place(Hm, relief("olive", 330, 115, True), 940, 600)

yy, xx = np.mgrid[0:H, 0:W].astype(float)
# bottom flap: triangle from the bottom corners up to the centre, slightly rounded tip
def side(px, py, ax, ay, bx, by):  # signed distance-ish to line a->b
    return ((bx - ax) * (py - ay) - (by - ay) * (px - ax)) / np.hypot(bx - ax, by - ay)
dl = side(xx, yy, 0, H, CX, CY)          # >0 right of left edge (inside bottom flap)
dr = -side(xx, yy, W, H, CX, CY)
inside = np.minimum(dl, dr)              # positive inside the bottom flap
extra = np.zeros((H, W))
extra += np.where(inside > 0, 0.035, 0)                                   # bottom flap catches more light
# fold shadow cast by the bottom flap onto the side flaps, and a lit paper edge on the flap
outside = np.clip(-inside, 0, None)
extra -= 0.16 * np.exp(-outside / 9) * (inside <= 0) * np.clip((yy - CY + 30) / 60, 0, 1)
extra += 0.10 * np.exp(-np.clip(inside, 0, None) / 1.4) * (inside > 0)
# side flaps meet the top edge: a soft valley along the top V (under the closed top flap)
dv = np.minimum(np.abs(side(xx, yy, 0, 0, CX, CY)), np.abs(side(xx, yy, W, 0, CX, CY)))
extra -= 0.05 * np.exp(-dv / 30) * (yy < CY)
# gentle vignette, like card under soft light
extra -= 0.06 * (((xx - W / 2) / W) ** 2 * 2 + ((yy - H * .55) / H) ** 2 * 1.5)
render(Hm, extra, "assets/env-pocket.jpg", (H, W))

# ---------- top flap ----------
FH = 1020
Hf = np.zeros((FH, W))
place(Hf, relief("rose-white", 520, 200), 140, 170)
place(Hf, relief("jasmine", 430, 160, True), 870, 160)
place(Hf, relief("olive", 300, -120, True), 640, 120)
yy, xx = np.mgrid[0:FH, 0:W].astype(float)
d = np.minimum(np.abs(side(xx, yy, 0, 0, W / 2, FH)), np.abs(side(xx, yy, W, 0, W / 2, FH)))
extra = 0.03 + 0.09 * np.exp(-d / 1.6) - 0.05 * ((xx - W / 2) / W) ** 2 * 2 + 0.03 * (1 - yy / FH)
render(Hf, extra, "assets/env-flap.jpg", (FH, W))
