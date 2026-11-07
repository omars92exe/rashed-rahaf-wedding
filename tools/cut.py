"""Cut botanical plates out of their paper into transparent WebP layers.

  python cut.py spec.json     (a list of jobs: src, out, box, lo, hi, keep_ratio, fill, max_side)
"""
import json
import sys

import numpy as np
from PIL import Image
from scipy import ndimage as ndi

Image.MAX_IMAGE_PIXELS = None


def cut(src, out, box=None, lo=0.10, hi=0.22, keep_ratio=0.08, fill=False, max_side=1400, choke=0.15, max_hole=0.004):
    a = np.asarray(Image.open(src).convert("RGB")).astype(np.float32) / 255
    if box:
        h, w, _ = a.shape
        a = a[int(box[1] * h):int(box[3] * h), int(box[0] * w):int(box[2] * w)]
    h, w, _ = a.shape
    b = max(4, int(min(h, w) * 0.03))
    paper = np.median(np.concatenate([a[:b].reshape(-1, 3), a[-b:].reshape(-1, 3), a[:, :b].reshape(-1, 3), a[:, -b:].reshape(-1, 3)]), 0)

    # distance from the paper colour, weighted toward chroma and darkness
    dist = np.sqrt(((a - paper) ** 2).sum(-1))
    sat = a.max(-1) - a.min(-1)
    score = np.maximum(dist, (sat - (paper.max() - paper.min())) * 1.4)
    t = np.clip((score - lo) / (hi - lo), 0, 1)
    alpha = t * t * (3 - 2 * t)
    alpha = np.clip((alpha - choke) / (1 - choke), 0, 1)

    solid = ndi.binary_closing(alpha > 0.35, iterations=2)
    if fill:  # pale petals: fill small enclosed holes (inside flowers), not the paper between stems
        holes = ndi.binary_fill_holes(solid) & ~solid
        hl, hn = ndi.label(holes)
        if hn:
            hs = ndi.sum(holes, hl, range(1, hn + 1))
            small = np.zeros(hn + 1, bool)
            small[1:] = hs < solid.size * max_hole
            solid = solid | small[hl]
    lab, n = ndi.label(solid)
    sizes = ndi.sum(solid, lab, range(1, n + 1))
    keep = np.zeros(n + 1, bool)
    keep[1:] = sizes >= sizes.max() * keep_ratio
    mask = ndi.gaussian_filter(ndi.binary_dilation(keep[lab], iterations=2).astype(np.float32), 1.0)
    alpha = np.maximum(alpha, ndi.gaussian_filter(solid.astype(np.float32), 1.2) * (1 if fill else 0)) * mask

    al = np.clip(alpha, 1e-3, 1)[..., None]
    rgb = np.clip((a - (1 - al) * paper) / al, 0, 1)  # remove the paper tint from soft edges
    ys, xs = np.where(alpha > 0.02)
    y0, y1, x0, x1 = ys.min(), ys.max() + 1, xs.min(), xs.max() + 1
    im = Image.fromarray((np.dstack([rgb, alpha[..., None]])[y0:y1, x0:x1] * 255).astype(np.uint8))
    im.thumbnail((max_side, max_side), Image.LANCZOS)
    im.save(out, "WEBP", quality=82, method=6)
    return im.size


if __name__ == "__main__":
    for job in json.load(open(sys.argv[1])):
        print(job["out"], cut(**job))
