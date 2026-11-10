#!/bin/sh
# Render راشد, و and رهف separately with Chrome (tools/calligraphy.html), then compose them into the
# two transparent mask layers assets/calli-names.png and assets/calli-waw.png (tools/compose-calligraphy.py).
cd "$(dirname "$0")/.." || exit 1
mkdir -p tools/out
for pair in rashed:راشد waw:و rahaf:رهف; do
  "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" \
    --headless=new --disable-gpu --hide-scrollbars --default-background-color=00000000 \
    --force-device-scale-factor=4 --window-size=500,320 \
    --screenshot="$PWD/tools/out/${pair%%:*}.png" \
    "file://$PWD/tools/calligraphy.html#${pair#*:}" 2>/dev/null
done
"${PY:-python3}" tools/compose-calligraphy.py tools/out
