#!/bin/sh
# Render the Arabic names calligraphy (tools/calligraphy.html) to transparent PNG layers with Chrome.
cd "$(dirname "$0")/.." || exit 1
for layer in names waw; do
  "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" \
    --headless=new --disable-gpu --hide-scrollbars --default-background-color=00000000 \
    --force-device-scale-factor=4 --window-size=360,280 \
    --screenshot="$PWD/assets/calli-$layer.png" \
    "file://$PWD/tools/calligraphy.html?layer=$layer"
done
# trim both layers to the same box so they stay aligned
"${PY:-python3}" - <<'PY'
from PIL import Image
a, b = (Image.open(f"assets/calli-{n}.png") for n in ("names", "waw"))
x0, y0, x1, y1 = a.getbbox()
u, v, w, z = b.getbbox()
box = (max(min(x0, u) - 16, 0), max(min(y0, v) - 16, 0), max(x1, w) + 16, max(y1, z) + 16)
for n, im in (("names", a), ("waw", b)):
    im.crop(box).save(f"assets/calli-{n}.png", optimize=True)
print("calligraphy box", box)
PY
