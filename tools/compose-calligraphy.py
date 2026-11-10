"""Lay out راشد ورهف as a stacked monogram from the single-word renders in tools/out/:
- راشد above and a little to the right, رهف tucked closely beneath it a little to the left;
- the و (burgundy layer) between them; the names are drawn over it, so its tail slips under رهف;
- the dot of the ف lifted up and to the left so it clears the tail.
Writes assets/calli-names.png and assets/calli-waw.png (white on transparent, used as CSS masks)."""
import sys
from collections import deque
import numpy as np
from PIL import Image, ImageFilter

D = sys.argv[1] if len(sys.argv) > 1 else "tools/out"
L = {k: Image.open(f"{D}/{k}.png").getchannel("A") for k in ("rashed", "waw", "rahaf")}

# layout, in px of the 4x renders (all words share one text origin)
RAHAF = (-60, 300)        # رهف just under راشد, a little to the left
WAW = (580, 690, 1.2)     # و centre and scale; drawn beneath the names
DOT = (-105, 25)          # move of the ف dot

def components(alpha):
    a = np.asarray(alpha) > 40
    lab = np.zeros(a.shape, int); n = 0; sizes = {}
    for y, x in zip(*np.nonzero(a)):
        if lab[y, x]: continue
        n += 1; q = deque([(y, x)]); lab[y, x] = n; c = 0
        while q:
            cy, cx = q.popleft(); c += 1
            for ny, nx in ((cy + 1, cx), (cy - 1, cx), (cy, cx + 1), (cy, cx - 1)):
                if 0 <= ny < a.shape[0] and 0 <= nx < a.shape[1] and a[ny, nx] and not lab[ny, nx]:
                    lab[ny, nx] = n; q.append((ny, nx))
        sizes[n] = c
    return lab, sizes

# the ف dot is the smallest piece of رهف
lab, sizes = components(L["rahaf"])
dot = min(sizes, key=sizes.get)
m = np.asarray(Image.fromarray(((lab == dot) * 255).astype(np.uint8)).filter(ImageFilter.MaxFilter(7))) > 0
ra = np.asarray(L["rahaf"])
dot_img = Image.fromarray(np.where(m, ra, 0).astype(np.uint8))
body = Image.fromarray(np.where(m, 0, ra).astype(np.uint8))

names = Image.new("L", (2600, 2200)); waw = Image.new("L", names.size)
ox, oy = 900, 500
names.paste(L["rashed"], (ox, oy), L["rashed"])
names.paste(body, (ox + RAHAF[0], oy + RAHAF[1]), body)
names.paste(dot_img, (ox + RAHAF[0] + DOT[0], oy + RAHAF[1] + DOT[1]), dot_img)
wx, wy, s = WAW
x0, y0, x1, y1 = L["waw"].getbbox()
w2 = L["waw"].resize((int(L["waw"].width * s), int(L["waw"].height * s)), Image.LANCZOS)
waw.paste(w2, (int(ox + wx - (x0 + x1) / 2 * s), int(oy + wy - (y0 + y1) / 2 * s)), w2)

a, b = names.getbbox(), waw.getbbox()
box = (min(a[0], b[0]) - 16, min(a[1], b[1]) - 16, max(a[2], b[2]) + 16, max(a[3], b[3]) + 16)
for name, layer in (("names", names), ("waw", waw)):
    out = Image.new("RGBA", names.size, (255, 255, 255, 0)); out.putalpha(layer)
    out.crop(box).save(f"assets/calli-{name}.png", optimize=True)
print("calligraphy size", box[2] - box[0], "x", box[3] - box[1])

# a ready-coloured copy for the printable PDF: masks are drawn wrongly by some PDF viewers (iPhone/WhatsApp),
# so the PDF uses a plain image with the و in burgundy beneath the names in deep olive
crop = lambda layer: layer.crop(box)
nm, ww = crop(names), crop(waw)
art = Image.new("RGBA", nm.size, (0, 0, 0, 0))
for layer, rgb in ((ww, (143, 70, 86)), (nm, (66, 78, 51))):
    c = Image.new("RGBA", nm.size, rgb + (0,)); c.putalpha(layer); art.alpha_composite(c)
art.save("tools/pdf/calli-print.png", optimize=True)
print("print calligraphy tools/pdf/calli-print.png")
