#!/usr/bin/env python3
"""pair-novel.html 하나에서 LOPE 용 파일을 만든다.

  dist/novel.css, dist/novel.js   본체 (jsDelivr 로 GitHub 에서 바로 내려받음)
  pair-novel-lope.html            LOPE 에 넣는 작은 불러오기 파일

LOPE 는 HTML 페이지 코드를 사이트 데이터에 통째로 저장하므로, 150KB 짜리 코드를 넣으면
매번 저장할 때마다 그만큼이 같이 올라간다. 불러오기 파일은 2KB 남짓이라 사이트 저장에 부담이 없다.

    python3 tools/build-lope.py <커밋 SHA>      # 그 커밋의 dist 를 가리키는 불러오기 파일
    python3 tools/build-lope.py                 # dist 만 다시 만들기
"""
import re, sys, pathlib

ROOT = pathlib.Path(__file__).resolve().parent.parent
REPO = "dan0030/lope"

src = (ROOT / "pair-novel.html").read_text(encoding="utf-8")

head = re.search(r"<head>([\s\S]*?)</head>", src).group(1)
style_m = re.search(r"<style>\n/\* ─+ 토큰[\s\S]*?</style>\n", head)
css = "@charset \"utf-8\";\n" + style_m.group(0)[len("<style>\n"):-len("</style>\n")]
head_rest = head.replace(style_m.group(0), "")

script_m = re.search(r"<script>\n(\(function\(\)\{\n\"use strict\";[\s\S]*)</script>\s*</body>", src)
js = script_m.group(1)
body = re.search(r"<body>\s*([\s\S]*?)\s*<script>\n\(function", src).group(1).strip()

(ROOT / "dist").mkdir(exist_ok=True)
(ROOT / "dist" / "novel.css").write_text(css, encoding="utf-8")
(ROOT / "dist" / "novel.js").write_text(js, encoding="utf-8")
print("dist/novel.css", len(css.encode()), "bytes")
print("dist/novel.js ", len(js.encode()), "bytes")

if len(sys.argv) > 1:
    ref = sys.argv[1].strip()
    if not re.fullmatch(r"[0-9a-f]{7,40}", ref):
        sys.exit("커밋 SHA 를 넣어 주세요")
    cdn = f"https://cdn.jsdelivr.net/gh/{REPO}@{ref}/dist"
    loader = f"""<!doctype html>
<html lang="ko">
<head>{head_rest.rstrip()}
<link rel="stylesheet" href="{cdn}/novel.css">
</head>
<body>
{body}
<script src="{cdn}/novel.js" charset="utf-8"></script>
<script>
if (!window.LOPE_NOVEL_READY) document.getElementById("app").innerHTML =
  '<p style="margin:40px 20px;font:14px/1.7 system-ui,sans-serif;text-align:center;opacity:.7">소설 서재를 불러오지 못했어요. 잠시 뒤 새로고침해 주세요.<br><small>({ref[:7]})</small></p>';
</script>
</body>
</html>
"""
    (ROOT / "pair-novel-lope.html").write_text(loader, encoding="utf-8")
    print("pair-novel-lope.html", len(loader.encode()), "bytes ->", cdn)
