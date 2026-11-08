"""Crops of the Winslow Homer beach and palm watercolours used on the site.
python beach.py SRC_DIR  (SRC_DIR holds the Commons downloads at 1600px+)"""
import sys
from PIL import Image

SRC, OUT = sys.argv[1], "../assets"


def crop(src, out, box, width, q=78):
    im = Image.open(f"{SRC}/{src}").convert("RGB")
    W, H = im.size
    im = im.crop((int(box[0] * W), int(box[1] * H), int(box[2] * W), int(box[3] * H)))
    im = im.resize((width, round(width * im.size[1] / im.size[0])), Image.LANCZOS)
    im.save(f"{OUT}/{out}", quality=q, optimize=True, progressive=True)
    print(out, im.size)


# palm over the turquoise sea: the hero background (portrait, phone shaped)
crop("Palm_Tree__Nassau_MET_DT208361.jpg", "hero-palm.jpg", (0.14, 0.02, 0.92, 0.98), 900)
# rolling surf: the sea band
crop("Shore_and_Surf__Nassau_MET_DT275856.jpg", "band-sea.jpg", (0.01, 0.2, 0.99, 0.82), 1400)
# palms by the water: the closing arch
crop("Winslow_Homer___Palm_Trees__Florida__1904_.jpg", "closing-palms.jpg", (0.04, 0.03, 0.96, 0.97), 1000)
