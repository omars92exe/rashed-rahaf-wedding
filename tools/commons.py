"""Search Wikimedia Commons and download images (preview size) for the invitation artwork.

  python commons.py search "query" ["query" ...]
  python commons.py get WIDTH OUTDIR "File:Title.jpg" ["File:..." ...]
"""
import json
import sys
import time
import urllib.parse
import urllib.request

UA = {"User-Agent": "RashedRahafWeddingSite/1.0"}
API = "https://commons.wikimedia.org/w/api.php?"


def api(params):
    req = urllib.request.Request(API + urllib.parse.urlencode(params), headers=UA)
    return json.load(urllib.request.urlopen(req))


def search(q):
    d = api({"action": "query", "format": "json", "generator": "search", "gsrnamespace": "6", "gsrsearch": q,
             "gsrlimit": "10", "prop": "imageinfo", "iiprop": "size|extmetadata", "iiextmetadatafilter": "LicenseShortName"})
    print("==", q)
    for pg in d.get("query", {}).get("pages", {}).values():
        i = pg["imageinfo"][0]
        print(f'  {i["width"]}x{i["height"]} | {i["extmetadata"].get("LicenseShortName", {}).get("value")} | {pg["title"][:150]}')


def get(width, out, titles):
    d = api({"action": "query", "format": "json", "titles": "|".join(titles), "prop": "imageinfo",
             "iiprop": "url|extmetadata", "iiextmetadatafilter": "LicenseShortName", "iiurlwidth": width})
    for pg in d["query"]["pages"].values():
        if "imageinfo" not in pg:
            print("MISSING", pg.get("title"))
            continue
        i = pg["imageinfo"][0]
        name = pg["title"].split(":", 1)[1]
        ext = ".png" if name.lower().endswith(".png") else ".jpg"
        safe = "".join(c if c.isalnum() else "_" for c in name.rsplit(".", 1)[0])[:60] + ext
        for wait in (0, 8, 20, 45):
            time.sleep(wait)
            try:
                data = urllib.request.urlopen(urllib.request.Request(i["thumburl"], headers=UA)).read()
                break
            except urllib.error.HTTPError as e:
                if e.code != 429:
                    raise
        else:
            print("RATE-LIMITED", name)
            continue
        open(out.rstrip("/") + "/" + safe, "wb").write(data)
        print(safe, len(data) // 1024, "KB |", i["extmetadata"].get("LicenseShortName", {}).get("value"))
        time.sleep(1)


if __name__ == "__main__":
    if sys.argv[1] == "search":
        for q in sys.argv[2:]:
            search(q)
            time.sleep(3)
    else:
        get(sys.argv[2], sys.argv[3], sys.argv[4:])
