#!/bin/sh
# Publish the site to Cloudflare (worker rashed-rahaf-wedding on rashedandrahaf.wedding and www.).
# What goes up is set by wrangler.jsonc + .assetsignore: index.html, style.css, script.js, assets/.
cd "$(dirname "$0")/.." || exit 1
npx --yes wrangler@4 deploy
