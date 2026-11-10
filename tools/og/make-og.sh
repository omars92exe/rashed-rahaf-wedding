#!/bin/sh
# Build the link-preview image assets/og-image.jpg (1200 x 630):
#   1. lift the couple out of tools/og/sketch.png (Vision subject lifting, macOS 14+) -> sketch-mask.png
#   2. make-backdrop.py: ivory linen, watercolour wash, florals and the couple    -> backdrop.png
#   3. og.html: the names in olive and burgundy, rendered by Chrome at 2x, then saved as JPEG
cd "$(dirname "$0")/../.." || exit 1
PY="${PY:-python3}"
[ -f tools/og/sketch-mask.png ] || swift tools/og/lift.swift tools/og/sketch.png tools/og/sketch-mask.png
"$PY" tools/og/make-backdrop.py
"/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" \
  --headless=new --disable-gpu --hide-scrollbars --allow-file-access-from-files \
  --force-device-scale-factor=2 --window-size=1200,630 --virtual-time-budget=8000 \
  --screenshot="$PWD/tools/og/og@2x.png" "file://$PWD/tools/og/og.html" 2>/dev/null
"$PY" -c "from PIL import Image; Image.open('tools/og/og@2x.png').convert('RGB').resize((1200, 630), Image.LANCZOS).save('assets/og-image.jpg', quality=88, optimize=True, progressive=True)"
ls -l assets/og-image.jpg
