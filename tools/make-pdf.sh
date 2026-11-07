#!/bin/sh
# Render the printable invitation (tools/invitation-card.html) to assets/Rashed-Rahaf-Invitation.pdf with Chrome.
cd "$(dirname "$0")/.." || exit 1
"/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" \
  --headless=new --disable-gpu --no-pdf-header-footer --allow-file-access-from-files \
  --virtual-time-budget=10000 --run-all-compositor-stages-before-draw \
  --print-to-pdf="$PWD/assets/Rashed-Rahaf-Invitation.pdf" \
  "file://$PWD/tools/invitation-card.html"
