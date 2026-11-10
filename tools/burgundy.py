"""Make a burgundy variant of the Redouté bouquet: petals (non-green, opaque pixels) are
mapped onto a burgundy ramp by their brightness, stretched so the painted shading stays;
leaves keep their colour. Faint paper left around the cut-outs is ignored.
  bouquet.webp -> bouquet-burgundy.webp"""
import numpy as np
from PIL import Image, ImageFilter

dark, mid, light = np.array([46, 6, 18.]), np.array([128, 32, 54.]), np.array([222, 160, 168.])

def recolor(src, dst, pink_only=False):
    im = np.asarray(Image.open(src).convert("RGBA")).astype(float)
    rgb, a = im[..., :3] / 255, im[..., 3:]
    r, g, b = rgb[..., 0], rgb[..., 1], rgb[..., 2]
    mx, mn = rgb.max(-1), rgb.min(-1)
    sat = np.where(mx > 0, (mx - mn) / np.maximum(mx, 1e-6), 0)
    petal = ~((g >= r - 0.02) & (sat > 0.10)) & (a[..., 0] > 200)
    if pink_only:
        petal &= (r > g + 0.08) & (r >= b)
    w = Image.fromarray((petal * 255).astype(np.uint8)).filter(ImageFilter.GaussianBlur(1.2))
    w = (np.asarray(w).astype(float) / 255)[..., None]
    w *= np.clip((a - 170) / 80, 0, 1)
    lum = 0.3 * r + 0.59 * g + 0.11 * b
    lo, hi = np.percentile(lum[petal], [3, 97])
    t = np.clip((lum - lo) / (hi - lo), 0, 1)[..., None] ** 1.3
    ramp = np.where(t < .55, dark + (mid - dark) * (t / .55), mid + (light - mid) * ((t - .55) / .45)) / 255
    out = rgb * (1 - w) + ramp * w
    Image.fromarray(np.concatenate([out * 255, a], -1).clip(0, 255).astype(np.uint8)).save(dst, quality=88, method=6)
    print("wrote", dst)


recolor("assets/bouquet.webp", "assets/bouquet-burgundy.webp", pink_only=True)
