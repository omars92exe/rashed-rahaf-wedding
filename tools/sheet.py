"""Contact sheet of images on a grey background (to review cut-outs): python sheet.py out.jpg files..."""
import sys
from PIL import Image, ImageDraw

out, files = sys.argv[1], sys.argv[2:]
W, H, cols = 300, 420, 5
rows = (len(files) + cols - 1) // cols
sheet = Image.new("RGB", (W * cols, H * rows), "#777")
d = ImageDraw.Draw(sheet)
for i, f in enumerate(files):
    im = Image.open(f).convert("RGBA")
    im.thumbnail((W - 6, H - 20))
    bg = Image.new("RGBA", im.size, (120, 120, 120, 255))
    bg.alpha_composite(im)
    x, y = (i % cols) * W, (i // cols) * H
    sheet.paste(bg.convert("RGB"), (x + 3, y + 18))
    d.text((x + 4, y + 2), f.split("/")[-1][:40], fill="#fff")
sheet.save(out, quality=85)
