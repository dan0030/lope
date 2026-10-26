(function(){
"use strict";
window.LOPE_NOVEL_READY = true;   // 작은 불러오기 파일(pair-novel-lope.html)이 본체가 왔는지 확인하는 표시
const L = window.LOPE_HTML_PAGE || {};
const SITE = L.siteData || null;
const LOCAL = !L.pageId;                      // LOPE 밖에서 파일로 연 경우
const CAN_EDIT = L.admin === true || LOCAL;   // 주인이거나, 파일 미리보기
const app = document.getElementById("app");
const FRAME = document.getElementById("frame");
const ROOT = document.documentElement;
const EDITING = L.admin === true && !LOCAL;   // LOPE 편집 모드(오른쪽 서랍이 있는 상태)
const SKIN = str0((L.theme || {}).skin);
let SET = Object.assign({ bigTitle: "", smallTitle: "", motto: "", mode: "auto", customAccent: false, accent: "#0b4dff", grid: true, safeTop: 0 }, L.settings || {});
function str0(v){ return v == null ? "" : String(v).trim(); }

/* ═══════════════════════ 본문(소설·채팅) 공용 스타일 ═══════════════════════
   뷰어에서는 Shadow DOM 안에, 에디터에서는 문서에 그대로 들어간다.        */
const NV_CSS = `
.nv{ font-family:var(--r-font, var(--serif)); font-size:var(--r-size, 17px); line-height:var(--r-lh, 1.95);
  color:var(--ink); word-break:keep-all; overflow-wrap:anywhere; }
.nv > *:first-child{ margin-top:0; }
.nv p{ margin:0 0 var(--r-pgap, 1.15em); min-height:1em; }
.nv.indent p{ text-indent:1em; }
.nv.indent p.scene, .nv.indent p[style*="center"], .nv.indent p[style*="right"], .nv.indent .ct p, .nv.indent .box p{ text-indent:0; }
.nv h1, .nv h2, .nv h3{ font-family:var(--kr-display, sans-serif); font-weight:400; line-height:1.3; margin:1.8em 0 .8em; }
.nv h1{ font-size:1.7em; } .nv h2{ font-size:1.4em; } .nv h3{ font-size:1.15em; color:var(--blue); }
.nv a{ color:var(--blue); text-underline-offset:3px; }
.nv img, .nv video{ max-width:100%; height:auto; vertical-align:middle; }
.nv figure{ margin:1.6em 0; text-align:center; }
.nv figure img{ display:inline-block; }
.nv figcaption{ font-family:var(--sans); font-size:.75em; color:var(--faint); margin-top:.6em; }
.nv iframe{ max-width:100%; border:0; }
.nv blockquote{ margin:1.4em 0; padding:.3em 0 .3em 1.1em; border-left:3px solid var(--blue); color:var(--mute); }
.nv hr{ border:0; height:1px; background:var(--line); margin:2.4em auto; width:46%; }
.nv .scene{ text-align:center; letter-spacing:.6em; color:var(--blue); margin:2.2em 0; text-indent:0; }
.nv .box{ margin:1.6em 0; padding:1.1em 1.3em; background:var(--veil); border:1px solid var(--line); border-top:2px solid var(--blue); }
.nv .box > :last-child{ margin-bottom:0; }
.nv .letter{ margin:1.6em auto; padding:1.6em 1.6em; max-width:92%; background:color-mix(in srgb, #f6eeda 70%, transparent); color:#3b3127;
  border:1px solid #d9c9a8; box-shadow:0 6px 18px rgba(0,0,0,.08); font-family:'Gowun Batang', var(--serif); }
.nv .letter > :last-child{ margin-bottom:0; }
.nv .sp{ background:currentColor; border-radius:3px; cursor:pointer; transition:background .25s; padding:0 .1em; }
.nv .sp.on{ background:var(--blue-soft); }
.nv details{ margin:1.4em 0; border:1px solid var(--line); background:var(--veil); }
.nv summary{ cursor:pointer; padding:.7em 1em; font-family:var(--sans); font-size:.85em; font-weight:600; color:var(--blue); list-style:none; }
.nv summary::before{ content:"▸ "; } .nv details[open] > summary::before{ content:"▾ "; }
.nv summary::-webkit-details-marker{ display:none; }
.nv details > :not(summary){ margin-left:1em; margin-right:1em; }
.nv table{ border-collapse:collapse; margin:1.2em 0; font-size:.9em; }
.nv td, .nv th{ border:1px solid var(--line); padding:.4em .7em; }
.nv pre, .nv code{ font-family:var(--mono, monospace); font-size:.85em; }
.nv pre{ white-space:pre-wrap; background:var(--veil); padding:1em; }
.nv ruby rt{ font-size:.5em; color:var(--mute); }

/* 채팅 로그 — 소설형 */
.nv .ct{ margin:0 0 1.5em; }
.nv .ct-who{ display:flex; align-items:center; gap:.5em; font-family:var(--sans); font-size:.7em; font-weight:700; letter-spacing:.06em;
  color:var(--c, var(--blue)); margin-bottom:.35em; }
.nv .ct-who img{ width:1.9em; height:1.9em; border-radius:50%; object-fit:cover; }
.nv .ct-who::after{ content:""; flex:1; height:1px; background:color-mix(in srgb, var(--c, var(--blue)) 30%, transparent); max-width:6em; }
.nv .ct p{ margin-bottom:.75em; }
.nv .ct .q{ color:color-mix(in srgb, var(--c, var(--ink)) 72%, var(--ink)); font-weight:600; }
.nv .ct.me{ padding:.8em 1em .1em; background:var(--veil); border-left:2px solid var(--c, var(--blue)); }
.nv .ct.nar .ct-who{ display:none; }
.nv .act{ font-style:normal; }
.nv .ooc{ font-family:var(--sans); font-size:.75em; color:var(--faint); }
/* 채팅 로그 — 말풍선형 */
.nv .bub-row{ display:flex; gap:.6em; margin:0 0 1em; align-items:flex-start; }
.nv .bub-row.me{ flex-direction:row-reverse; }
.nv .bub-ava{ flex:none; width:2.4em; height:2.4em; border-radius:50%; overflow:hidden; display:grid; place-items:center;
  background:color-mix(in srgb, var(--c, var(--blue)) 25%, transparent); color:var(--c, var(--blue)); font-family:var(--sans); font-weight:800; font-size:.8em; }
.nv .bub-ava img{ width:100%; height:100%; object-fit:cover; display:block; }
.nv .bub-col{ max-width:min(78%, 34em); display:flex; flex-direction:column; min-width:0; }
.nv .bub-row.me .bub-col{ align-items:flex-end; }
.nv .bub-name{ font-family:var(--sans); font-size:.68em; font-weight:700; color:var(--c, var(--blue)); margin:0 .3em .25em; }
.nv .bub{ padding:.65em .95em; background:var(--veil2, rgba(0,0,0,.06)); border-radius:4px 16px 16px 16px; font-size:.92em; line-height:1.7; }
.nv .bub-row.me .bub{ background:var(--c, var(--blue)); color:#fff; border-radius:16px 4px 16px 16px; }
.nv .bub p{ margin:0 0 .5em; text-indent:0; } .nv .bub p:last-child{ margin:0; }
.nv .bub .act{ font-style:italic; opacity:.72; }
.nv .bub-row.me .bub .q{ color:inherit; }
.nv .bub-time{ font-family:var(--sans); font-size:.6em; color:var(--faint); margin:.25em .4em 0; }
.nv .bub-nar{ text-align:center; font-size:.85em; color:var(--mute); margin:1.2em 1em; font-style:italic; }
`;

/* ═══════════════════════ 작은 도구 ═══════════════════════ */
function h(tag, props){
  const e = document.createElement(tag);
  if (props) for (const k in props){
    const v = props[k];
    if (v == null || v === false) continue;
    if (k === "class") e.className = v;
    else if (k === "text") e.textContent = v;
    else if (k === "html") e.innerHTML = v;
    else if (k.startsWith("on") && typeof v === "function") e.addEventListener(k.slice(2), v);
    else if (k.startsWith("--")) e.style.setProperty(k, v);
    else if (k === "style" && typeof v === "object") Object.assign(e.style, v);
    else if (k === "value") e.value = v;
    else if (k === "checked") e.checked = !!v;
    else e.setAttribute(k, v === true ? "" : v);
  }
  for (let i = 2; i < arguments.length; i++) add(e, arguments[i]);
  return e;
}
function add(e, c){
  if (c == null || c === false) return;
  if (Array.isArray(c)) c.forEach(x => add(e, x));
  else e.appendChild(c instanceof Node ? c : document.createTextNode(String(c)));
}
const arr = (v) => Array.isArray(v) ? v : [];
const str = (v) => (v == null ? "" : String(v)).trim();
const esc = (s) => String(s == null ? "" : s).replace(/[&<>"']/g, c => ({ "&":"&amp;", "<":"&lt;", ">":"&gt;", '"':"&quot;", "'":"&#39;" }[c]));
const uid = () => (crypto.randomUUID ? crypto.randomUUID() : String(Date.now()) + Math.random()).replace(/-/g, "").slice(0, 12);
const pad = (n) => String(n).padStart(2, "0");
const isUrl = (s) => /^(https?:\/\/|data:image\/)/i.test(str(s));
// 사이트 데이터의 그림은 "/img/…", "sample/a.svg" 처럼 상대 경로로 온다 → 사이트 주소 기준 절대 주소로
function media(v){
  const s = str(v);
  if (!s) return "";
  if (/^(https?:\/\/|data:image\/|blob:)/i.test(s)) return s;
  if (/\s/.test(s) || /^[a-z][a-z0-9+.-]*:/i.test(s)) return "";
  if (!(/^(\/|\.{1,2}\/)/.test(s) || s.includes("/") || /\.(png|jpe?g|gif|webp|svg|avif|bmp)(\?|#|$)/i.test(s))) return "";
  try { return new URL(s, s.startsWith("/") && L.mediaBase ? L.mediaBase : document.baseURI).href; } catch (e){ return ""; }
}
const today = () => { const d = new Date(); return d.getFullYear() + "-" + pad(d.getMonth() + 1) + "-" + pad(d.getDate()); };
const fmtDate = (s) => str(s).replace(/-/g, ".");
const daysAgo = (s) => { const t = Date.parse(str(s)); return isNaN(t) ? 1e9 : (Date.now() - t) / 864e5; };
function safeColor(c){
  c = str(c);
  return /^(#[0-9a-f]{3,8}|rgba?\([\d\s.,%]+\)|hsla?\([\d\s.,%deg]+\)|[a-z]{3,20})$/i.test(c) ? c : "";
}
function hexOf(c){ c = safeColor(c); return /^#[0-9a-f]{6}$/i.test(c) ? c : (/^#[0-9a-f]{3}$/i.test(c) ? "#" + c.slice(1).split("").map(x => x + x).join("") : "#0b4dff"); }
function img(src, alt, cls){
  const i = h("img", { src, alt: alt || "", loading: "lazy", decoding: "async", class: cls });
  i.addEventListener("error", () => i.remove());
  return i;
}
function barcode(seed, n){
  let s = 0; for (const ch of String(seed)) s = (s * 31 + ch.charCodeAt(0)) >>> 0;
  const rnd = () => (s = (s * 1664525 + 1013904223) >>> 0) / 4294967296;
  let x = 0, r = "";
  for (let i = 0; i < (n || 26); i++){ const w = rnd() < .3 ? 3 : (rnd() < .5 ? 2 : 1); r += `<rect x="${x}" y="0" width="${w}" height="22"/>`; x += w + 1 + Math.floor(rnd() * 3); }
  return h("span", { class: "bar-code", "aria-hidden": "true", html: `<svg viewBox="0 0 ${x} 22" fill="currentColor" preserveAspectRatio="none">${r}</svg>` });
}
const charCount = (txt) => String(txt || "").replace(/\s/g, "").length;
let toastT;
function toast(msg){
  document.querySelectorAll(".toast").forEach(t => t.remove());
  const t = h("div", { class: "toast", role: "status", text: msg });
  FRAME.appendChild(t);
  clearTimeout(toastT); toastT = setTimeout(() => t.remove(), 3400);
}
function download(name, text, type){
  const a = h("a", { href: URL.createObjectURL(new Blob([text], { type: type || "text/plain;charset=utf-8" })), download: name });
  document.body.appendChild(a); a.click(); a.remove();
  setTimeout(() => URL.revokeObjectURL(a.href), 2000);
}
function pickFile(accept){
  return new Promise(res => {
    const i = h("input", { type: "file", accept, style: { display: "none" } });
    i.addEventListener("change", () => { res(i.files && i.files[0]); i.remove(); });
    document.body.appendChild(i); i.click();
  });
}
const readText = (f) => new Promise((res, rej) => { const r = new FileReader(); r.onload = () => res(String(r.result)); r.onerror = rej; r.readAsText(f); });
// 사진 파일 → 줄인 data URL (사이트 저장 용량을 아끼려고 긴 변을 줄여 압축)
function fileToImage(file, max){
  return new Promise((res, rej) => {
    const fr = new FileReader();
    fr.onerror = rej;
    fr.onload = () => {
      if (/gif|svg/.test(file.type)) return res(String(fr.result));
      const im = new Image();
      im.onerror = rej;
      im.onload = () => {
        const s = Math.min(1, (max || 1000) / Math.max(im.width, im.height));
        const c = h("canvas"); c.width = Math.round(im.width * s); c.height = Math.round(im.height * s);
        c.getContext("2d").drawImage(im, 0, 0, c.width, c.height);
        let out = c.toDataURL("image/webp", .8);
        if (!out.startsWith("data:image/webp")) out = c.toDataURL("image/jpeg", .82);
        res(out);
      };
      im.src = String(fr.result);
    };
    fr.readAsDataURL(file);
  });
}
const kb = (s) => Math.round(new Blob([s]).size / 1024);

/* HTML 정리: 스크립트·이벤트 속성·javascript: 주소만 걷어내고 꾸밈은 그대로 둔다 */
function sanitize(html){
  const t = document.createElement("template");
  t.innerHTML = String(html || "");
  t.content.querySelectorAll("script,object,embed,applet,base,meta,frame,frameset,noscript").forEach(n => n.remove());
  t.content.querySelectorAll("*").forEach(el => {
    for (const a of Array.from(el.attributes)){
      const n = a.name.toLowerCase(), v = a.value.replace(/[\s\u0000-\u001f]/g, "").toLowerCase();
      if (n.startsWith("on")) el.removeAttribute(a.name);
      else if (/^(href|src|action|formaction|xlink:href|data|poster|srcdoc)$/.test(n) && (v.startsWith("javascript:") || v.startsWith("vbscript:") || n === "srcdoc")) el.removeAttribute(a.name);
    }
    if (el.tagName === "IFRAME" && !/^https:\/\//i.test(el.getAttribute("src") || "")) el.remove();
  });
  return t.innerHTML;
}
// 태그가 하나도 없는 글은 문단으로 바꾼다
function textToHtml(s){
  return String(s || "").replace(/\r/g, "").split(/\n/).map(l => {
    const t = l.trim();
    if (!t) return "";
    if (/^(\*{3,}|-{3,}|◇+|◆+|#{3,})$/.test(t)) return '<p class="scene">◇</p>';
    return "<p>" + esc(t) + "</p>";
  }).join("");
}
const looksHtml = (s) => /<\/?(p|div|br|span|b|i|u|s|em|strong|h[1-6]|img|font|blockquote|figure|details|table|hr|a|ul|ol|li|style)\b/i.test(String(s || ""));
const bodyHtml = (s) => looksHtml(s) ? sanitize(s) : textToHtml(s);

/* ═══════════════════════ 사이트 데이터 ═══════════════════════ */
const siteChars = (() => {
  const out = [], seen = new Set();
  const push = (c, au) => {
    if (!c || !str(c.name)) return;
    const k = str(c.name) + "|" + (au || "");
    if (seen.has(k)) return; seen.add(k);
    out.push({
      name: str(c.name), eng: str(c.eng), role: str(c.role), color: safeColor(c.color),
      avatar: [c.profileImage, c.image, c.icon].map(media).find(Boolean) || "",
      icon: (str(c.icon) && !media(c.icon) && str(c.icon).length <= 4) ? str(c.icon) : "",
      intro: str(c.short) || str(c.intro), au: au || "", key: c.key || ""
    });
  };
  if (!SITE) return out;
  arr(SITE.characters).forEach(c => push(c, ""));
  arr(SITE.worlds).forEach(w => arr(w && w.characters).forEach(c => push(c, w.auId === "main" ? "" : str(w.auLabel))));
  return out;
})();
const siteImages = (() => {
  const out = [];
  if (!SITE) return out;
  arr(SITE.gallery).forEach(g => arr(g && g.items).forEach(it => { if (media(it && it.image) && !it.r18) out.push({ src: media(it.image), title: str(it.title) }); }));
  siteChars.forEach(c => { if (c.avatar) out.push({ src: c.avatar, title: c.name }); });
  arr(SITE.timeline).forEach(t => { if (media(t && t.image)) out.push({ src: media(t.image), title: str(t.title) }); });
  return out;
})();

// 사이트의 연표·대화로 만드는 읽기 전용 작품
function buildSiteSeries(){
  if (!SITE) return null;
  const chars = arr(SITE.characters), byKey = {};
  chars.forEach(c => { if (c && c.key) byKey[c.key] = c; });
  const rels = arr(SITE.relationships);
  const rel = rels.find(r => arr(r.memberKeys).length >= 2) || rels[0] || null;
  let pair = rel ? arr(rel.memberKeys).map(k => byKey[k]).filter(Boolean) : [];
  if (!pair.length) pair = chars.slice(0, 2);
  const pk = new Set(pair.map(c => c.key));
  const eps = [];
  let tl = arr(SITE.timeline).filter(Boolean);
  const tlp = tl.filter(t => !arr(t.memberKeys).length || arr(t.memberKeys).some(k => pk.has(k)));
  (tlp.length ? tlp : tl).forEach((t, i) => {
    if (t.locked){ eps.push({ id: "st" + i, locked: true, title: "잠긴 기록", date: str(t.year) }); return; }
    eps.push({ id: "st" + i, type: "novel", title: str(t.title) || str(t.year) || "기록", date: "", label: str(t.year),
      spoiler: !!t.spoiler, html: (media(t.image) ? `<figure><img src="${esc(media(t.image))}" alt=""></figure>` : "") + textToHtml(t.text) });
  });
  arr(SITE.dialogue).forEach(w => {
    const scenes = [];
    arr(w && w.scenes).forEach(s => scenes.push(s));
    arr(w && w.folders).forEach(f => arr(f && f.scenes).forEach(s => scenes.push(s)));
    scenes.forEach((s, i) => {
      if (!s || !arr(s.messages).length) return;
      eps.push({ id: "sd" + eps.length, type: "chat", title: str(s.title) || "대화", label: str(s.subtitle) || "대화 기록",
        chat: { mode: "novel", names: true, turns: arr(s.messages).map(m => ({
          name: m.side === "narration" ? "" : str(m.name), side: m.side === "narration" ? "nar" : (m.side === "right" ? "right" : "left"),
          color: safeColor(m.color), avatar: media(m.icon), text: str(m.text), time: str(m.time) })) } });
    });
  });
  if (!eps.length) return null;
  const site = SITE.site || {};
  return {
    id: "__site", readonly: true, title: str(site.pairName) || str(site.title) || "사이트 기록",
    tagline: str(site.pairLine) || (rel ? str(rel.subtitle) : ""), author: str(site.title), genre: "기록", status: "ongoing", age: "all",
    tags: rel ? arr(rel.keywords).map(str).filter(Boolean) : [], intro: rel ? str(rel.summary) : "", cover: media(L.heroImage),
    cast: pair.map(c => siteChars.find(x => x.key === c.key && !x.au) || { name: str(c.name), color: safeColor(c.color) }),
    episodes: eps
  };
}

/* ═══════════════════════ 예시 서재 ═══════════════════════ */
function sampleLib(){
  return {
    lopeNovel: 1, title: "NOVEL", sub: "ARCHIVE", motto: "STORIES\nKEPT\nFURTHER\nTHAN NOISE.", showSite: true, demo: true,
    series: [
      { id: uid(), title: "북부 대공의 계약 신부", tagline: "일 년만 부부인 척해요. 그다음엔 깔끔하게 남이 되는 거예요.",
        author: "IF", genre: "로맨스판타지", status: "ongoing", age: "15", color: "", cover: "", tags: ["계약결혼", "북부대공", "회귀"],
        intro: "세 번째 회귀에서 에리엘은 결심했다.\n이번 생엔 아무도 사랑하지 않겠다고.\n\n그래서 고른 상대가 하필, 제국에서 가장 차갑다는 북부의 대공이었다.",
        cast: [{ name: "에리엘 로셰", role: "회귀한 황녀", color: "#c0587e" }, { name: "카이렌 벨하르트", role: "북부 대공", color: "#3f6fd6" }],
        created: today(), updated: today(),
        episodes: [
          { id: uid(), type: "novel", title: "프롤로그. 세 번째 겨울", date: today(), spoiler: false, note: "첫 화입니다. 천천히 따라와 주세요!",
            html: '<p>눈이 내리고 있었다.</p><p>에리엘은 그 사실이 조금도 놀랍지 않았다. <b>세 번째</b>였으니까. 이 겨울도, 이 창가도, 곧 문을 두드릴 시종장의 발소리도.</p><p class="scene">◇</p><p>“황녀 전하, 북부에서 사절이 도착했습니다.”</p><p>예상대로였다. 그녀는 찻잔을 내려놓고 고개를 들었다.</p><div class="letter"><p style="text-align:center"><b>북부 대공가 인장</b></p><p>황녀 전하께.<br>혼담에 관해 직접 뵙고 말씀드리고자 합니다.</p><p style="text-align:right">— 카이렌 벨하르트</p></div><p>지난 두 번의 생에서 그녀는 이 편지를 <span style="color:#c0587e">찢어버렸다</span>. 그리고 두 번 모두, 봄이 오기 전에 죽었다.</p><p>그러니 이번에는.</p><p style="text-align:center"><span style="font-size:1.25em"><b>“들라 하세요.”</b></span></p><details><summary>작가의 설정 노트 (접기)</summary><p>회귀할 때마다 기억이 조금씩 흐려진다는 설정이 있어요.</p></details><p>그날 밤 에리엘은 알게 된다. 대공이 처음부터 <span class="sp">자신의 회귀를 알고 있었다</span>는 걸.</p>' },
          { id: uid(), type: "chat", title: "1화. 연회장의 첫 춤", date: today(), spoiler: false, note: "AI 채팅 로그를 그대로 붙여넣어 만든 화예요.",
            chat: { mode: "novel", names: true, hideOoc: true, user: "에리엘",
              raw: "*황궁의 연회장은 샹들리에 불빛으로 눈부셨다. 음악이 바뀌는 순간, 사람들의 시선이 한쪽으로 쏠렸다.*\n\n카이렌: *검은 제복 차림의 사내가 곧장 걸어와 멈춰 섰다.* \"황녀 전하.\"\n\n에리엘: *부채로 입가를 가리며* \"공작 각하께서 이런 자리에 다 오시고. 별일이네요.\"\n\n카이렌: \"초대장을 직접 쓰셨다고 들어서.\" *그가 낮게 웃었다.* \"글씨가 생각보다 단정하시더군요.\"\n\n에리엘: *잠시 눈을 깜빡였다.* \"……그건 시종장이 한 실수예요.\"\n\n카이렌: *망설임 없이 손을 내밀었다.* \"그럼 그 실수 덕분에, 춤 한 곡 청해도 되겠습니까.\"\n\n(OOC: 여기서 장면 끊어줘)",
              speakers: [{ name: "에리엘", color: "#c0587e", avatar: "", side: "right" }, { name: "카이렌", color: "#3f6fd6", avatar: "", side: "left" }] } },
          { id: uid(), type: "novel", title: "2화. 계약서의 마지막 줄", date: today(), spoiler: true, note: "",
            html: "<p>계약서는 단 세 장이었다.</p><p>마지막 줄에 적힌 조항을 읽은 순간, 에리엘은 펜을 떨어뜨렸다.</p><blockquote>제7조. 갑과 을은 서로를 사랑하지 않는다.</blockquote><p>“이건 왜 넣으셨어요?”</p><p>“필요할 것 같아서.”</p>" }
        ] },
      { id: uid(), title: "새벽과 윤슬", tagline: "끝내 서로에게 닿는 두 개의 빛", author: "IF", genre: "현대", status: "done", age: "all", color: "#3e9a8d", cover: "",
        tags: ["힐링", "섬"], intro: "폭풍이 지난 아침, 섬에 표류한 화가와 그를 발견한 등대지기.\n한 계절만 머물겠다던 약속은 자꾸만 미뤄진다.",
        cast: [], created: today(), updated: today(),
        episodes: [{ id: uid(), type: "novel", title: "단편. 등대의 밤", date: today(), note: "",
          html: textToHtml("폭풍은 밤새 섬을 두드렸다.\n새벽이 등대 아래 바위에서 사람을 발견한 건 해가 막 떠오를 무렵이었다.\n“……살아 있어요?”\n젖은 화구 상자를 끌어안은 채로, 그 사람은 눈을 떴다.\n***\n“여름이 끝나면 나갈게요. 배가 다시 들어오면.”\n새벽은 대답 대신 램프의 심지를 갈았다.") }] }
    ]
  };
}
function emptyLib(){ return { lopeNovel: 1, title: "NOVEL", sub: "ARCHIVE", motto: "STORIES\nKEPT\nFURTHER\nTHAN NOISE.", showSite: true, series: [] }; }

/* ═══════════════════════ 저장 형식 ═══════════════════════
   LOPE 는 richText 를 "글 꾸밈 HTML"로 보고 정리기(safeHtmlPageRichText)를 거친다.
   JSON 안의 <p class="…"> 같은 글자가 진짜 태그로 읽혀 속성이 지워지므로,
   < > & 와 nbsp 를 \uXXXX 로 바꿔 태그가 하나도 없는 순수 글자로 보낸다. 상한은 200,000자.   */
const STORE_PREFIX = "LOPENOVEL1:";
const STORE_MAX = 200000;
let recovered = false;
function encodeStore(o){
  return STORE_PREFIX + JSON.stringify(o).replace(/&/g, "\\u0026").replace(/</g, "\\u003c").replace(/>/g, "\\u003e").replace(/\u00a0/g, "\\u00a0");
}
function decodeStore(raw){
  if (raw && typeof raw === "object") return raw.lopeNovel ? raw : null;
  let t = String(raw || "").trim();
  if (!t) return null;
  if (t.startsWith(STORE_PREFIX)) t = t.slice(STORE_PREFIX.length);
  try { const j = JSON.parse(t); if (j && j.lopeNovel) return j; } catch (e) {}
  // 예전 저장분: 정리기가 &amp; &lt; 등으로 바꿔 둔 것을 되돌려 본다
  try {
    const u = t.replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&nbsp;/g, "\u00a0").replace(/&quot;/g, '"').replace(/&amp;/g, "&");
    const j = JSON.parse(u); if (j && j.lopeNovel){ recovered = true; return j; }
  } catch (e) {}
  return null;
}

/* ═══════════════════════ 불러오기 ═══════════════════════ */
function loadLib(){
  let raw = L.richText;
  const j0 = decodeStore(raw);
  if (j0) return normalizeLib(j0);
  if (typeof raw === "string" && raw.trim()){
    if (/lopeNovel/.test(raw)){ recovered = "broken"; return emptyLib(); }
    // 예전 버전(# 제목으로 나눈 원고) → 작품 하나로 옮겨 담기
    const lib = emptyLib(), eps = []; let cur = null;
    raw.replace(/\r/g, "").split("\n").forEach(line => {
      const m = /^#{1,3}\s+(.+)$/.exec(line.trim());
      if (m){ cur = { id: uid(), type: "novel", title: m[1].trim(), date: today(), body: [] }; eps.push(cur); return; }
      if (!cur){ if (!line.trim()) return; cur = { id: uid(), type: "novel", title: "1화", date: today(), body: [] }; eps.push(cur); }
      cur.body.push(line);
    });
    eps.forEach(e => { e.html = textToHtml(e.body.join("\n")); delete e.body; });
    lib.series.push({ id: uid(), title: (SITE && SITE.site && str(SITE.site.pairName)) || "연재 원고", tagline: "", author: "", genre: "", status: "ongoing", age: "all", tags: [], intro: "", cover: "", cast: [], created: today(), updated: today(), episodes: eps });
    return lib;
  }
  return LOCAL ? sampleLib() : emptyLib();
}
function normalizeLib(j){
  const lib = Object.assign(emptyLib(), j);
  lib.series = arr(lib.series).filter(s => s && typeof s === "object").map(s => Object.assign({
    id: uid(), title: "제목 없음", tagline: "", author: "", genre: "", status: "ongoing", age: "all", color: "", cover: "",
    tags: [], intro: "", cast: [], created: today(), updated: today(), episodes: [] }, s, {
      tags: arr(s.tags).map(str).filter(Boolean), cast: arr(s.cast),
      episodes: arr(s.episodes).filter(e => e && typeof e === "object").map(e => Object.assign({ id: uid(), type: "novel", title: "", date: "", html: "", note: "" }, e))
    }));
  return lib;
}

let lib = loadLib();
let dirty = false;
const siteSeries = buildSiteSeries();
const allSeries = () => lib.series.concat(lib.showSite !== false && siteSeries ? [siteSeries] : []);
const findSeries = (id) => allSeries().find(s => s.id === id);
const readEps = new Set();          // 이번에 읽은 회차 (새로고침하면 사라짐)
const lastRead = {};                // 작품별 마지막으로 연 회차
const ageOk = new Set();
const opened = new Set();           // 스포일러 펼친 회차
function markDirty(){ dirty = true; document.querySelectorAll(".adminbar").forEach(b => updateAdminBar(b)); }

function pack(){ const o = JSON.parse(JSON.stringify(lib)); delete o.demo; delete o.resume; return o; }
const storeSize = () => encodeStore(pack()).length;
function saveToSite(){
  if (LOCAL){ toast("LOPE 밖에서는 사이트에 저장할 수 없어요. '백업 받기'로 파일을 남겨 두세요."); return; }
  // 저장 뒤 LOPE 가 페이지를 다시 열면 지금 보던 화면으로 돌아오도록 표시해 둔다 (주인에게만 적용)
  const o = pack(); o.resume = cur ? { view: cur.view === "editEpisode" || cur.view === "editSeries" ? "library" : cur.view, params: cur.params, at: Date.now() } : null;
  const text = encodeStore(o);
  if (text.length > STORE_MAX){
    toast("저장 칸이 넘쳐요 (" + text.length.toLocaleString() + " / " + STORE_MAX.toLocaleString() + "자). 파일로 넣은 사진을 주소로 바꾸거나 회차를 줄여 주세요. 먼저 '백업 받기'를 눌러 두세요.");
    return;
  }
  parent.postMessage({ type: "lope-html-page-save-rich-text", pageId: L.pageId, richText: text }, "*");
  dirty = false; lib.demo = false;
  document.querySelectorAll(".adminbar").forEach(b => updateAdminBar(b));
  toast("저장 중… (" + Math.round(text.length / STORE_MAX * 100) + "% 사용)");
}
function exportBackup(){
  download("novel-archive-" + today() + ".json", JSON.stringify(pack(), null, 1), "application/json");
}
async function importBackup(){
  const f = await pickFile(".json,application/json");
  if (!f) return;
  try {
    const j = JSON.parse(await readText(f));
    if (!j || !j.lopeNovel) throw 0;
    if (!confirm("지금 서재를 이 백업으로 바꿀까요? (저장하기 전까지는 사이트에 반영되지 않아요)")) return;
    lib = normalizeLib(j); markDirty(); go("library", {}, false);
    toast("백업을 불러왔어요. '사이트에 저장'을 눌러야 반영돼요.");
  } catch (e){ toast("NOVEL ARCHIVE 백업 파일이 아니에요."); }
}

/* ═══════════════════════ 화면 전환 ═══════════════════════ */
const stack = [];
let cur = null, cleanup = null;
const VIEWS = {};
function go(view, params, push){
  if (push !== false && cur) stack.push(cur);
  if (cleanup){ cleanup(); cleanup = null; }
  cur = { view, params: params || {} };
  document.querySelectorAll(".drawer,.drawer-bg,.sheet,.modal-bg").forEach(n => n.remove());
  app.textContent = "";
  app.scrollTop = 0;
  VIEWS[view](cur.params);
}
function back(){
  const p = stack.pop();
  if (p) go(p.view, p.params, false); else go("library", {}, false);
}

/* ═══════════════════════ 공용: 표지 ═══════════════════════ */
function coverEl(s, idx, cls){
  const box = h("div", { class: "cv brk " + (cls || ""), "--c": safeColor(s.color) || null });
  if (media(s.cover)){
    const i = img(media(s.cover), s.title);
    i.addEventListener("error", () => box.appendChild(phBox(s, idx)));
    box.appendChild(i);
  } else box.appendChild(phBox(s, idx));
  return box;
}
function phBox(s, idx){
  return h("div", { class: "phbox ph" },
    h("span", { class: "mono b", text: "FILE / " + pad(idx + 1) }),
    h("span", { class: "outline-num", text: pad(idx + 1) }),
    h("span", { class: "t", text: s.title }));
}
const STATUS = { ongoing: "연재중", done: "완결", hiatus: "휴재" };
function badges(s){
  const b = h("div", { class: "badges" });
  b.appendChild(h("span", { class: "chip " + (s.status === "done" ? "ink" : "blue"), text: STATUS[s.status] || "연재중" }));
  if (s.age === "19") b.appendChild(h("span", { class: "chip red", text: "19" }));
  else if (s.age === "15") b.appendChild(h("span", { class: "chip", text: "15" }));
  const last = arr(s.episodes).map(e => e.date).filter(Boolean).sort().pop();
  if (last && daysAgo(last) < 4) b.appendChild(h("span", { class: "chip", text: "UP" }));
  else if (s.created && daysAgo(s.created) < 15) b.appendChild(h("span", { class: "chip", text: "NEW" }));
  return b;
}
const epCount = (s) => arr(s.episodes).filter(e => !e.locked).length;
function avatarEl(c, cls){
  const a = h("div", { class: cls || "ava", "--c": safeColor(c.color) || null });
  if (media(c.avatar)){ const i = img(media(c.avatar), c.name); i.addEventListener("error", () => { a.textContent = c.icon || str(c.name)[0] || "?"; }); a.appendChild(i); }
  else a.textContent = c.icon || str(c.name)[0] || "?";
  return a;
}

/* 관리자 바 */
function updateAdminBar(bar){
  bar.classList.toggle("dirty", dirty);
  const st = bar.querySelector(".st span");
  if (st) st.textContent = LOCAL ? "파일 미리보기 · 저장되지 않음" : (dirty ? "저장 안 된 변경이 있어요" : "EDIT MODE · 저장됨");
  const use = bar.querySelector(".use");
  if (use){ const n = storeSize(); use.textContent = "저장 칸 " + Math.min(999, Math.round(n / STORE_MAX * 100)) + "%"; use.title = n.toLocaleString() + " / " + STORE_MAX.toLocaleString() + "자"; use.classList.toggle("red", n > STORE_MAX * .9); }
}
function adminBar(extra){
  if (!CAN_EDIT) return null;
  const bar = h("div", { class: "adminbar" },
    h("div", { class: "st" }, h("i", { class: "dot" }), h("span"), LOCAL ? null : h("b", { class: "chip use" })),
    extra || null,
    h("button", { class: "btn sm line", type: "button", onclick: exportBackup, text: "백업 받기" }),
    h("button", { class: "btn sm line", type: "button", onclick: importBackup, text: "백업 불러오기" }),
    EDITING ? h("button", { class: "btn sm line", type: "button", title: "LOPE 편집창이 이 페이지를 가릴 때 그만큼 비켜 줍니다", onclick: (e) => cycleRsv(e.currentTarget), text: "편집창 자리: " + ({ auto: "자동", rail: "접힘", open: "펼침", none: "없음" })[rsvMode] }) : null,
    LOCAL ? null : h("button", { class: "btn sm", type: "button", onclick: saveToSite, text: "사이트에 저장" }));
  updateAdminBar(bar);
  return bar;
}

/* ═══════════════════════ 서재 (홈) ═══════════════════════ */
let libFilter = "all";
VIEWS.library = function(){
  const page = h("div", { class: "page" });
  const series = allSeries();
  const totalEps = series.reduce((n, s) => n + epCount(s), 0);

  const tk = ["SELECT YOUR STORY", "<b>" + pad(series.length) + "</b> SERIES", "<b>" + pad(totalEps) + "</b> EPISODES", "READ · KEEP · RETURN", "ARCHIVE / NOVEL"];
  const tkHtml = tk.concat(tk).map(t => "<span>" + t + "</span>").join("");
  page.appendChild(h("div", { class: "ticker", "aria-hidden": "true" }, h("div", { html: tkHtml + tkHtml })));

  const t1 = str(SET.bigTitle) || str(lib.title) || "NOVEL", t2 = str(SET.smallTitle) || str(lib.sub);
  const kr = /[가-힣]/.test(t1 + t2);
  const word = (w, cls) => { const s = h("span", { class: "w " + cls }); [...w].forEach((ch, i) => s.appendChild(h("span", { "--i": i + (cls === "w2" ? 4 : 0), text: ch === " " ? " " : ch }))); return s; };
  page.appendChild(h("header", { class: "mast" },
    h("div", { class: "top" }, h("span", { class: "mono", text: "IF" }), barcode(t1 + t2, 22), h("span", { class: "mono", text: "ARCHIVE / " + pad(series.length) })),
    h("h1", { class: kr ? "kr" : "" }, word(t1, "w1"), t2 ? word(t2, "w2") : null),
    h("div", { class: "side" },
      h("div", { class: "motto a-fade", text: str(SET.motto) ? SET.motto : str(lib.motto) }),
      h("div", { class: "count" },
        h("div", {}, h("b", { html: "<em>" + pad(series.length) + "</em>" }), h("span", { class: "mono mute", text: "SERIES" })),
        h("div", {}, h("b", { text: pad(totalEps) }), h("span", { class: "mono mute", text: "EPISODES" }))))));

  if (CAN_EDIT){
    page.appendChild(adminBar(h("span", {},
      h("button", { class: "btn sm kr", type: "button", onclick: () => go("editSeries", {}), text: "+ 새 작품" }), " ",
      h("button", { class: "btn sm line", type: "button", onclick: libSettings, text: "서재 설정" }))));
    if (lib.demo) page.appendChild(h("div", { class: "notice" }, "지금 보이는 건 예시 작품이에요. 마음껏 열어보고 고쳐 본 다음, 지우고 내 작품을 올리면 됩니다. ",
      h("button", { class: "more", type: "button", onclick: () => { if (confirm("예시 작품을 모두 지울까요?")){ lib.series = []; lib.demo = false; markDirty(); go("library", {}, false); } }, text: "예시 지우기" })));
    if (LOCAL) page.appendChild(h("div", { class: "notice", text: "LOPE 밖에서 파일로 연 미리보기예요. 여기서 고친 내용은 '백업 받기'로만 남길 수 있어요." }));
  }
  if (SITE && SITE.imagesOmitted) page.appendChild(h("div", { class: "notice", text: "사이트 용량 때문에 사진 " + SITE.imagesOmitted + "장은 빠진 채로 보여요." }));

  if (!series.length){
    page.appendChild(h("div", { class: "empty", style: { marginTop: "34px" } }, h("b", { text: "NO FILES" }),
      CAN_EDIT ? h("span", {}, "아직 올린 작품이 없어요. ", h("button", { class: "more", type: "button", onclick: () => go("editSeries", {}), text: "+ 첫 작품 만들기" }), " · ",
        h("button", { class: "more", type: "button", onclick: () => { lib = sampleLib(); markDirty(); go("library", {}, false); }, text: "예시 넣어보기" }))
        : "아직 올라온 작품이 없어요."));
    app.appendChild(page); return;
  }

  // 대표작: 최근 업데이트
  const sorted = series.slice().sort((a, b) => str(b.updated || "").localeCompare(str(a.updated || "")));
  const f = sorted.find(s => epCount(s)) || sorted[0];
  const fi = series.indexOf(f);
  const feat = h("div", { class: "feat", role: "button", tabindex: "0", "aria-label": f.title + " 열기", onclick: () => go("series", { id: f.id }),
    onkeydown: (e) => { if (e.key === "Enter") go("series", { id: f.id }); } },
    h("div", { class: "tx" },
      h("span", { class: "mono", text: "FEATURED / " + pad(fi + 1) + " · " + (f.genre || "NOVEL") }),
      h("h3", { text: f.title }),
      f.tagline ? h("div", { class: "tag", text: f.tagline }) : null,
      h("div", { class: "meta" }, h("span", { class: "chip", text: STATUS[f.status] || "연재중" }), h("span", { class: "chip", text: epCount(f) + "화" }),
        f.author ? h("span", { class: "chip", text: f.author }) : null),
      h("div", { class: "go" },
        h("button", { class: "btn white", type: "button", onclick: (e) => { e.stopPropagation(); const i = firstReadable(f); if (i >= 0) go("reader", { id: f.id, i }); }, disabled: firstReadable(f) < 0 || null }, "READ ▶"),
        h("span", { class: "mono", style: { color: "rgba(255,255,255,.8)" }, text: "OPEN FILE ↗" }))),
    h("div", { class: "cv" }, media(f.cover) ? img(media(f.cover), "") : h("div", { class: "ph" })),
    h("span", { class: "big", "aria-hidden": "true", text: pad(fi + 1) }));
  page.appendChild(feat);

  page.appendChild(h("div", { class: "sec" }, h("h2", { html: "ALL <em>SERIES</em>" }), h("span", { class: "rule" }), h("span", { class: "mono mute", text: pad(series.length) + " FILES" })));
  const genres = [...new Set(series.map(s => str(s.genre)).filter(Boolean))];
  const fl = h("div", { class: "filters", role: "group", "aria-label": "작품 거르기" });
  const opts = [["all", "ALL"], ["ongoing", "연재중"], ["done", "완결"]].concat(genres.map(g => ["g:" + g, g]));
  const grid = h("div", { class: "grid" });
  const drawGrid = () => {
    grid.textContent = "";
    const list = series.filter(s => libFilter === "all" || s.status === libFilter || ("g:" + str(s.genre)) === libFilter);
    if (!list.length) grid.appendChild(h("p", { class: "mute", text: "해당하는 작품이 없어요." }));
    list.forEach((s, k) => {
      const idx = series.indexOf(s);
      const cv = coverEl(s, idx);
      cv.appendChild(badges(s));
      cv.appendChild(h("span", { class: "cnt", text: pad(epCount(s)) + " EP" }));
      const card = h("button", { class: "card a-rise", type: "button", "--i": k, onclick: () => go("series", { id: s.id }) }, cv,
        h("div", { class: "mt" }, h("span", { class: "mono", text: (s.genre || "NOVEL") + (s.readonly ? " · SITE" : "") }), h("b", { text: s.title }),
          h("small", { text: [s.author, s.tagline].filter(Boolean).join(" · ") || " " })));
      const wrap = h("div", { style: { display: "flex", flexDirection: "column", gap: "6px", minWidth: "0" } }, card);
      if (CAN_EDIT && !s.readonly && lib.series.length > 1){
        const li = lib.series.indexOf(s);
        wrap.appendChild(h("div", { class: "ord" },
          h("button", { type: "button", "aria-label": "앞으로", disabled: li === 0 || null, onclick: () => { moveItem(lib.series, li, -1); markDirty(); go("library", {}, false); }, text: "◀" }),
          h("button", { type: "button", "aria-label": "뒤로", disabled: li === lib.series.length - 1 || null, onclick: () => { moveItem(lib.series, li, 1); markDirty(); go("library", {}, false); }, text: "▶" })));
      }
      grid.appendChild(wrap);
    });
  };
  opts.forEach(([v, label]) => fl.appendChild(h("button", { class: "chip" + (libFilter === v ? " on" : ""), type: "button", "aria-pressed": String(libFilter === v),
    onclick: (e) => { libFilter = v; fl.querySelectorAll(".chip").forEach(c => { c.classList.toggle("on", c === e.currentTarget); c.setAttribute("aria-pressed", String(c === e.currentTarget)); }); drawGrid(); }, text: label })));
  if (opts.length > 3 || series.length > 4) page.appendChild(fl);
  drawGrid();
  page.appendChild(grid);
  page.appendChild(h("p", { class: "mono mute", style: { textAlign: "center", marginTop: "56px", lineHeight: "2" }, html: "END OF ARCHIVE<br>읽던 위치는 저장되지 않아요 · 페이지를 다시 열면 처음부터" }));
  app.appendChild(page);
};
function moveItem(a, i, d){ const j = i + d; if (j < 0 || j >= a.length) return; const t = a[i]; a[i] = a[j]; a[j] = t; }
const firstReadable = (s) => arr(s.episodes).findIndex(e => !e.locked);

function libSettings(){
  const t = h("input", { class: "in", value: str(SET.bigTitle) || lib.title || "" }), s2 = h("input", { class: "in", value: str(SET.smallTitle) || lib.sub || "" });
  const m = h("textarea", { class: "in", rows: 4 }); m.value = str(SET.motto) ? SET.motto : (lib.motto || "");
  const sh = h("input", { type: "checkbox", checked: lib.showSite !== false });
  modal("서재 설정", [
    h("div", { class: "form", style: { marginTop: 0 } },
      h("div", { class: "row2" }, h("div", { class: "fld" }, h("label", { text: "큰 제목 1" }), t), h("div", { class: "fld" }, h("label", { text: "큰 제목 2 (포인트 색)" }), s2)),
      h("div", { class: "fld" }, h("label", { text: "작은 문구 (줄바꿈 가능)" }), m),
      siteSeries ? h("label", { class: "chk" }, sh, "사이트의 연표·대화를 '" + siteSeries.title + "' 작품으로 같이 보여주기") : null,
      h("p", { class: "help", html: "제목·문구는 <b>LOPE 관리자 › 이 페이지 설정</b>에서도 고칠 수 있고, 여기서 고치면 그쪽에도 바로 들어가요.<br>" +
        "사이트 메뉴에 보이는 이름 중 <b>작은 이름</b>은 관리자 › 부가기능 › HTML › 이 페이지의 <b>이름</b> 칸이에요. 큰 영문 이름(HTML)은 LOPE가 HTML 페이지마다 똑같이 붙이는 글자라 이 페이지에서는 바꿀 수 없어요." }))
  ], () => {
    lib.title = str(t.value); lib.sub = str(s2.value); lib.motto = m.value; lib.showSite = sh.checked;
    writeSetting("bigTitle", lib.title); writeSetting("smallTitle", lib.sub); writeSetting("motto", lib.motto);
    markDirty(); go("library", {}, false);
  });
}

function modal(title, body, onOk, okText){
  const bg = h("div", { class: "modal-bg" });
  const close = () => bg.remove();
  const box = h("div", { class: "modal", role: "dialog", "aria-modal": "true", "aria-label": title },
    h("h3", { text: title }), body,
    h("div", { class: "acts" }, h("button", { class: "btn sm line", type: "button", onclick: close, text: "닫기" }),
      onOk ? h("button", { class: "btn sm kr", type: "button", onclick: () => { if (onOk() !== false) close(); }, text: okText || "적용" }) : null));
  bg.addEventListener("click", (e) => { if (e.target === bg) close(); });
  bg.appendChild(box); FRAME.appendChild(bg);
  const f = box.querySelector("input,textarea,select"); if (f) f.focus();
  return close;
}

/* ═══════════════════════ 작품 페이지 ═══════════════════════ */
let epSort = "asc";
VIEWS.series = function(p){
  const s = findSeries(p.id);
  if (!s){ go("library", {}, false); return; }
  const idx = allSeries().indexOf(s);
  const page = h("div", { class: "page", "--c": safeColor(s.color) || null });
  page.appendChild(h("div", { style: { display: "flex", alignItems: "center", gap: "14px", flexWrap: "wrap" } },
    h("button", { class: "back", type: "button", onclick: () => go("library", {}, false) }, "← ARCHIVE"),
    h("span", { class: "mono mute", text: "SERIES / " + pad(idx + 1) }), barcode(s.id, 16)));
  if (CAN_EDIT && !s.readonly) page.appendChild(adminBar());

  const cv = coverEl(s, idx); cv.appendChild(badges(s));
  const i0 = firstReadable(s);
  const eps = arr(s.episodes);
  const lastIdx = (() => { for (let i = eps.length - 1; i >= 0; i--) if (!eps[i].locked) return i; return -1; })();
  const info = h("div", { class: "info" },
    h("span", { class: "mono b a-rise", text: (s.genre || "NOVEL") + " · " + (STATUS[s.status] || "연재중") + " · " + epCount(s) + "화" }),
    h("h1", { class: "a-rise", "--i": 1, text: s.title }),
    s.tagline ? h("p", { class: "tagline a-rise", "--i": 2, text: s.tagline }) : null,
    h("dl", { class: "a-rise", "--i": 3 },
      s.author ? [h("dt", { text: "AUTHOR" }), h("dd", { text: s.author })] : null,
      h("dt", { text: "RATING" }), h("dd", { text: s.age === "19" ? "19세 이상" : s.age === "15" ? "15세 이상" : "전체 이용가" }),
      s.updated ? [h("dt", { text: "UPDATED" }), h("dd", { text: fmtDate(s.updated) })] : null),
    arr(s.tags).length ? h("div", { class: "chips a-rise", "--i": 4 }, s.tags.map(t => h("span", { class: "chip", text: "#" + t }))) : null,
    h("div", { class: "cta a-rise", "--i": 5 },
      h("button", { class: "btn kr", type: "button", disabled: i0 < 0 || null, onclick: () => go("reader", { id: s.id, i: i0 }), text: "첫화 보기" }),
      lastRead[s.id] != null ? h("button", { class: "btn kr", type: "button", onclick: () => go("reader", { id: s.id, i: lastRead[s.id] }), text: "이어 보기 · " + (lastRead[s.id] + 1) + "화" }) : null,
      lastIdx > 0 ? h("button", { class: "btn line kr", type: "button", onclick: () => go("reader", { id: s.id, i: lastIdx }), text: "최신화" }) : null),
    CAN_EDIT && !s.readonly ? h("div", { class: "cta" },
      h("button", { class: "btn sm kr", type: "button", onclick: () => go("editEpisode", { sid: s.id }), text: "+ 새 회차" }),
      h("button", { class: "btn sm line", type: "button", onclick: () => go("editSeries", { id: s.id }), text: "작품 정보 수정" }),
      h("button", { class: "btn sm line", type: "button", onclick: () => {
        if (!confirm("'" + s.title + "' 작품과 회차 " + eps.length + "개를 모두 지울까요?")) return;
        lib.series.splice(lib.series.indexOf(s), 1); markDirty(); go("library", {}, false);
      }, text: "작품 삭제" })) : null,
    CAN_EDIT && s.readonly ? h("div", { class: "cta" },
      h("button", { class: "btn sm kr", type: "button", onclick: () => {
        if (!confirm("이 작품을 내 작품으로 복사할까요?\n복사본은 제목·회차를 마음대로 고치거나 지울 수 있고, 사이트에서 자동으로 만든 이 작품은 서재에서 숨겨져요.")) return;
        const copy = importSiteSeries(s);
        lib.series.unshift(copy); lib.showSite = false; markDirty(); go("series", { id: copy.id }, false);
        toast("내 작품으로 가져왔어요. '사이트에 저장'을 눌러야 남아요.");
      }, text: "내 작품으로 가져오기" }),
      h("button", { class: "btn sm line", type: "button", onclick: () => {
        if (!confirm("'" + s.title + "' 작품을 서재에서 지울까요?\n사이트의 연표·대화 원본은 그대로 남아요. 나중에 '서재 설정'에서 다시 켤 수 있어요.")) return;
        lib.showSite = false; markDirty(); go("library", {}, false);
        toast("지웠어요. '사이트에 저장'을 눌러야 방문자 화면에도 반영돼요.");
      }, text: "작품 삭제" })) : null,
    s.readonly ? h("p", { class: "mono mute", style: { margin: 0 }, text: "사이트의 연표·대화로 자동으로 만든 작품이에요" }) : null);
  page.appendChild(h("div", { class: "sv" }, cv, info));

  if (str(s.intro)){
    page.appendChild(h("div", { class: "sec" }, h("h2", { html: "SYNOP<em>SIS</em>" }), h("span", { class: "rule" })));
    const it = h("div", { class: "intro", text: s.intro });
    page.appendChild(it);
    if (s.intro.length > 220 || s.intro.split("\n").length > 6){
      it.classList.add("clip");
      const mb = h("button", { class: "more", type: "button", text: "MORE ▾", onclick: () => { const c = it.classList.toggle("clip"); mb.textContent = c ? "MORE ▾" : "CLOSE ▴"; } });
      page.appendChild(mb);
    }
  }
  if (arr(s.cast).length){
    page.appendChild(h("div", { class: "sec" }, h("h2", { html: "CHARAC<em>TERS</em>" }), h("span", { class: "rule" })));
    page.appendChild(h("div", { class: "cast" }, s.cast.map((c, k) => h("div", { class: "person a-rise", "--i": k, "--c": safeColor(c.color) || null }, avatarEl(c),
      h("div", { class: "who" }, h("b", { text: c.name }), (c.role || c.intro) ? h("small", { text: c.role || c.intro }) : null)))));
  }

  page.appendChild(h("div", { class: "sec" }, h("h2", { html: "EPI<em>SODES</em>" }), h("span", { class: "rule" }),
    h("button", { class: "chip", type: "button", onclick: () => { epSort = epSort === "asc" ? "desc" : "asc"; go("series", p, false); }, text: epSort === "asc" ? "1화부터 ↓" : "최신화부터 ↑" })));
  if (!eps.length){
    page.appendChild(h("div", { class: "empty" }, h("b", { text: "NO EPISODE" }), CAN_EDIT && !s.readonly ? h("button", { class: "more", type: "button", onclick: () => go("editEpisode", { sid: s.id }), text: "+ 첫 회차 쓰기" }) : "아직 회차가 없어요."));
  } else {
    const ul = h("ol", { class: "eps" });
    const order = eps.map((e, i) => i); if (epSort === "desc") order.reverse();
    let n = 0; const nums = eps.map(e => e.locked ? 0 : ++n);
    order.forEach((i, k) => {
      const e = eps[i];
      const li = h("li", { class: "a-rise", "--i": Math.min(k, 12) });
      const tags = h("span", { class: "r" });
      if (e.locked) tags.appendChild(h("span", { class: "chip", text: "LOCKED" }));
      else {
        if (e.type === "chat") tags.appendChild(h("span", { class: "chip", text: "LOG" }));
        if (e.spoiler) tags.appendChild(h("span", { class: "chip red", text: "스포" }));
        if (e.date && daysAgo(e.date) < 4) tags.appendChild(h("span", { class: "chip blue", text: "UP" }));
        tags.appendChild(h("span", { class: "arr", "aria-hidden": "true", text: "↗" }));
      }
      li.appendChild(h("button", { class: "ep" + (readEps.has(s.id + ":" + i) ? " read" : ""), type: "button", disabled: e.locked || null, onclick: () => go("reader", { id: s.id, i }) },
        h("span", { class: "no", text: e.locked ? "—" : pad(nums[i]) }),
        h("span", { class: "t" }, h("b", { text: e.locked ? "잠긴 기록" : (e.title || pad(nums[i]) + "화") }),
          h("small", {}, e.label ? h("span", { text: e.label }) : null, e.date ? h("span", { text: fmtDate(e.date) }) : null,
            !e.locked && e.type !== "chat" && e.html ? h("span", { text: charCount(stripTags(e.html)).toLocaleString() + "자" }) : null)),
        tags));
      if (CAN_EDIT && !s.readonly){
        li.appendChild(h("div", { class: "ep-tools" },
          h("button", { type: "button", onclick: () => go("editEpisode", { sid: s.id, eid: e.id }), text: "수정" }),
          h("button", { type: "button", disabled: i === 0 || null, onclick: () => { moveItem(eps, i, -1); markDirty(); go("series", p, false); }, text: "▲" }),
          h("button", { type: "button", disabled: i === eps.length - 1 || null, onclick: () => { moveItem(eps, i, 1); markDirty(); go("series", p, false); }, text: "▼" }),
          h("button", { type: "button", onclick: () => { if (confirm("'" + (e.title || "이 회차") + "'를 지울까요?")){ eps.splice(i, 1); markDirty(); go("series", p, false); } }, text: "삭제" })));
      }
      ul.appendChild(li);
    });
    page.appendChild(ul);
  }
  app.appendChild(page);
};
// 사이트 자동 작품 → 고칠 수 있는 내 작품 (대화는 "이름: 대사" 원문으로 바꿔서 채팅 로그 편집기에서 고칠 수 있게)
function importSiteSeries(s){
  const c = JSON.parse(JSON.stringify(s));
  c.id = uid(); delete c.readonly;
  c.created = today(); c.updated = today();
  c.episodes = arr(c.episodes).filter(e => !e.locked).map(e => {
    e.id = uid(); e.date = e.date || today();
    if (e.type === "chat" && e.chat && arr(e.chat.turns).length){
      const spk = [], seen = new Set();
      const lines = e.chat.turns.map(t => {
        const name = t.side === "nar" || !t.name ? "나레이션" : t.name;
        if (!seen.has(name)){ seen.add(name); spk.push({ name, color: t.color || "", avatar: t.avatar || "", side: name === "나레이션" ? "nar" : (t.side === "right" ? "right" : "left") }); }
        return name + ": " + String(t.text || "").replace(/\r/g, "");
      });
      const me = spk.find(x => x.side === "right");
      e.chat = { raw: lines.join("\n\n"), speakers: spk, user: me ? me.name : "", mode: e.chat.mode || "novel", names: true, hideOoc: true };
    }
    return e;
  });
  return c;
}
function stripTags(html){ const d = document.createElement("template"); d.innerHTML = html || ""; d.content.querySelectorAll("style").forEach(s => s.remove()); return d.content.textContent || ""; }

/* ═══════════════════════ 채팅 로그 해석 ═══════════════════════ */
const NAR_NAMES = /^(나레이션|내레이션|narration|narrator|해설|시스템|system|지문|상황)$/i;
const HEAD_RE = /^\s*(?:\*\*|\[|【|<)?\s*([^\n:：\]】>*"“”'()（）]{1,24}?)\s*(?:\*\*|\]|】|>)?\s*[:：]\s?(.*)$/;
function candidateName(n){
  n = str(n);
  if (!n || n.length > 24 || /\d$/.test(n) || /https?/i.test(n) || (n.match(/\s/g) || []).length > 3) return "";
  return n;
}
function detectSpeakers(raw){
  const j = tryJsonLog(raw);
  if (j) return [...new Set(j.map(t => t.name).filter(Boolean))];
  const cnt = {};
  String(raw || "").replace(/\r/g, "").split("\n").forEach(l => {
    const m = HEAD_RE.exec(l); if (!m) return;
    const n = candidateName(m[1]); if (n) cnt[n] = (cnt[n] || 0) + 1;
  });
  return Object.keys(cnt).filter(n => cnt[n] >= 2).sort((a, b) => cnt[b] - cnt[a]);
}
function tryJsonLog(raw){
  const t = str(raw);
  if (!/^[\[{]/.test(t)) return null;
  try {
    let j = JSON.parse(t);
    if (!Array.isArray(j)) j = j.messages || j.chat || j.log || j.history || j.data || null;
    if (!Array.isArray(j)) return null;
    const out = j.map(m => {
      if (!m || typeof m !== "object") return null;
      let name = str(m.name || m.speaker || m.character || m.author || m.sender || "");
      const role = str(m.role || (m.is_user ? "user" : ""));
      if (!name && role) name = role === "user" ? "나" : (role === "assistant" || role === "model" || role === "char") ? "AI" : role;
      let text = m.content != null ? m.content : (m.text != null ? m.text : (m.message != null ? m.message : m.mes));
      if (Array.isArray(text)) text = text.map(x => typeof x === "string" ? x : (x && x.text) || "").join("\n");
      return { name, text: str(text), time: str(m.time || m.send_date || "") };
    }).filter(x => x && x.text);
    return out.length ? out : null;
  } catch (e){ return null; }
}
function parseChat(chat){
  if (arr(chat.turns).length) return chat.turns;
  const raw = String(chat.raw || "");
  const spk = arr(chat.speakers);
  const cfg = (n) => spk.find(s => s.name === n) || null;
  const known = new Set(spk.map(s => s.name));
  let turns;
  const j = tryJsonLog(raw);
  if (j) turns = j.map(t => ({ name: t.name, text: t.text, time: t.time }));
  else {
    const accepted = new Set(detectSpeakers(raw).concat([...known]));
    turns = [];
    let curT = null;
    raw.replace(/\r/g, "").split("\n").forEach(line => {
      const trimmed = line.trim();
      const lone = trimmed.replace(/[:：]$/, "").replace(/^\*\*|\*\*$/g, "");
      if (known.has(lone) && lone){ curT = { name: lone, text: "" }; turns.push(curT); return; }
      const m = HEAD_RE.exec(line);
      const n = m && candidateName(m[1]);
      if (n && accepted.has(n)){ curT = { name: n, text: m[2] || "" }; turns.push(curT); return; }
      if (!curT){ if (!trimmed) return; curT = { name: "", text: "" }; turns.push(curT); }
      curT.text += (curT.text ? "\n" : "") + line;
    });
  }
  return turns.map(t => {
    const c = cfg(t.name);
    let side = c ? c.side : (t.name === chat.user ? "right" : "left");
    if (!t.name || NAR_NAMES.test(t.name)) side = "nar";
    return { name: t.name, side, color: c ? safeColor(c.color) : "", avatar: c && isUrl(c.avatar) ? c.avatar : "", text: str(t.text), time: t.time || "" };
  }).filter(t => t.text);
}
function fmtInline(t){
  let s = esc(t);
  s = s.replace(/\*\*(.+?)\*\*/g, "<b>$1</b>");
  s = s.replace(/\*(.+?)\*/g, '<span class="act">$1</span>');
  s = s.replace(/(&quot;|“)(.+?)(&quot;|”)/g, '<span class="q">“$2”</span>');
  s = s.replace(/\*/g, "");
  return s;
}
const OOC_RE = /^\s*(?:[(（\[]\s*)?(?:OOC|ooc|\/\/)\s*[:：)]?/;
function chatHtml(chat, mode){
  const turns = parseChat(chat);
  const names = chat.names !== false;
  const hide = chat.hideOoc !== false;
  const paras = (text) => text.split(/\n+/).map(x => x.trim()).filter(x => x && !(hide && OOC_RE.test(x)));
  let out = "";
  if (mode === "bubble"){
    turns.forEach(t => {
      const ps = paras(t.text); if (!ps.length) return;
      if (t.side === "nar"){ out += ps.map(x => `<p class="bub-nar">${fmtInline(x)}</p>`).join(""); return; }
      const c = t.color ? ` style="--c:${esc(t.color)}"` : "";
      const ava = t.avatar ? `<img src="${esc(t.avatar)}" alt="">` : esc((t.name || "?")[0]);
      out += `<div class="bub-row${t.side === "right" ? " me" : ""}"${c}><div class="bub-ava">${ava}</div><div class="bub-col">`
        + (t.name ? `<div class="bub-name">${esc(t.name)}</div>` : "")
        + `<div class="bub">${ps.map(x => "<p>" + fmtInline(x) + "</p>").join("")}</div>`
        + (t.time ? `<div class="bub-time">${esc(t.time)}</div>` : "") + `</div></div>`;
    });
  } else {
    let prev = null;
    turns.forEach(t => {
      const ps = paras(t.text); if (!ps.length) return;
      const c = t.color ? ` style="--c:${esc(t.color)}"` : "";
      const cls = t.side === "nar" ? " nar" : (t.side === "right" ? " me" : "");
      const who = names && t.name && t.side !== "nar" && t.name !== prev
        ? `<div class="ct-who">${t.avatar ? `<img src="${esc(t.avatar)}" alt="">` : ""}${esc(t.name)}</div>` : "";
      out += `<section class="ct${cls}"${c}>${who}${ps.map(x => "<p>" + fmtInline(x) + "</p>").join("")}</section>`;
      prev = t.side === "nar" ? null : t.name;
    });
  }
  return out || '<p class="scene">· · ·</p>';
}
function chatText(chat){ return parseChat(chat).map(t => t.text).join(" "); }

/* ═══════════════════════ 뷰어 ═══════════════════════ */
const RS = { size: 18, lh: 1.9, pgap: 1.15, w: 700, font: "serif", th: "skin", indent: false, page: "scroll", chatMode: "" };
const FONTS = { serif: ["명조", "var(--serif)"], gowun: ["바탕", "'Gowun Batang', var(--serif)"], nanum: ["나눔명조", "'Nanum Myeongjo', var(--serif)"], sans: ["고딕", "var(--sans)"] };
const THEMES = [["skin", "스킨", ""], ["white", "화이트", "#ffffff"], ["paper", "종이", "#f3ecdf"], ["green", "녹색", "#dfeadf"], ["black", "블랙", "#111214"]];

function renderBody(host, s, e){
  const root = host.shadowRoot || host.attachShadow({ mode: "open" });
  let inner;
  if (e.type === "chat") inner = chatHtml(e.chat || {}, RS.chatMode || (e.chat && e.chat.mode) || "novel");
  else inner = bodyHtml(e.html);
  root.innerHTML = `<style>:host{display:block}${NV_CSS}</style><div class="nv${RS.indent ? " indent" : ""}">${inner}</div>`;
  root.querySelectorAll("img").forEach(i => i.addEventListener("error", () => i.remove()));
  root.querySelectorAll("a[href]").forEach(a => { if (!a.getAttribute("href").startsWith("#")){ a.target = "_blank"; a.rel = "noopener"; } });
  root.addEventListener("click", (ev) => { const sp = ev.target.closest && ev.target.closest(".sp"); if (sp) sp.classList.toggle("on"); });
}

VIEWS.reader = function(p){
  const s = findSeries(p.id);
  const eps = s ? arr(s.episodes) : [];
  const e = eps[p.i];
  if (!s || !e || e.locked){ go("library", {}, false); return; }
  lastRead[s.id] = p.i; readEps.add(s.id + ":" + p.i);
  let num = 0; for (let k = 0; k <= p.i; k++) if (!eps[k].locked) num++;
  const prevI = (() => { for (let k = p.i - 1; k >= 0; k--) if (!eps[k].locked) return k; return -1; })();
  const nextI = (() => { for (let k = p.i + 1; k < eps.length; k++) if (!eps[k].locked) return k; return -1; })();
  const total = epCount(s);

  const rd = h("div", { class: "rd", "data-th": RS.th });
  applyRS(rd);
  const icon = (d) => h("span", { html: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${d}</svg>` }).firstChild;
  rd.appendChild(h("div", { class: "rd-prog" }));
  rd.appendChild(h("header", { class: "rd-top" }, h("div", { class: "bin" },
    h("button", { class: "ib", type: "button", "aria-label": "작품으로", onclick: () => go("series", { id: s.id }, false) }, icon('<path d="M15 18l-6-6 6-6"/>'), h("span", { class: "lbl", text: "BACK" })),
    h("div", { class: "where" }, h("b", { text: e.title || pad(num) + "화" }), h("small", { text: s.title + " · EP " + pad(num) })),
    h("button", { class: "ib", type: "button", "aria-label": "목차", onclick: () => openToc(s, p.i) }, icon('<path d="M4 6h16M4 12h16M4 18h10"/>'), h("span", { class: "lbl", text: "INDEX" })),
    h("button", { class: "ib", type: "button", "aria-label": "보기 설정", onclick: () => openSettings(rd, s, e) }, h("span", { style: { fontFamily: "var(--serif)", fontSize: "15px", letterSpacing: "0" }, text: "가" }), h("span", { class: "lbl", text: "VIEW" })))));
  const pct = h("aside", { class: "rd-pct", "aria-hidden": "true" }, h("span", { class: "mono", text: "READ" }), h("b", { html: "0<small>%</small>" }), h("div", { class: "track" }, h("i")));
  rd.appendChild(pct);

  const main = h("article", { class: "rd-main" });
  main.appendChild(h("header", { class: "rd-head" },
    h("span", { class: "mono", text: "CHAPTER " + pad(num) + " / FILE " + pad(allSeries().indexOf(s) + 1) + (e.type === "chat" ? " · CHAT LOG" : "") }),
    h("h1", { text: e.title || pad(num) + "화" }),
    h("div", { class: "meta" }, h("span", { text: s.title }), e.label ? h("span", { text: e.label }) : null, e.date ? h("span", { text: fmtDate(e.date) }) : null,
      h("span", { text: charCount(e.type === "chat" ? chatText(e.chat || {}) : stripTags(e.html)).toLocaleString() + "자" })),
    h("div", { class: "rule" })));

  const body = h("div", { class: "rd-body" });
  const key = s.id + ":" + e.id;
  const gate = (title, msg, okText, onOk) => h("div", { class: "veil-box" }, h("b", { text: title }), h("p", { text: msg }),
    h("button", { class: "btn kr", type: "button", onclick: onOk, text: okText }));
  const fill = () => {
    body.textContent = "";
    if (s.age === "19" && !ageOk.has(s.id)){
      body.appendChild(gate("ADULT ONLY", "19세 이상 이용 가능한 작품입니다. 성인이라면 확인을 눌러 주세요.", "19세 이상입니다", () => { ageOk.add(s.id); fill(); onScroll(); }));
      return;
    }
    if (e.spoiler && !opened.has(key)){
      body.appendChild(gate("SPOILER", "스포일러가 담긴 회차예요. 준비됐다면 펼쳐 주세요.", "펼치기", () => { opened.add(key); fill(); onScroll(); }));
      return;
    }
    const host = h("div"); body.appendChild(host); renderBody(host, s, e);
  };
  fill();
  rd._refill = fill;
  main.appendChild(body);

  main.appendChild(h("div", { class: "eof mono", text: "END OF FILE" }));
  if (str(e.note)) main.appendChild(h("div", { class: "note" }, h("span", { class: "mono", text: "AUTHOR'S NOTE · 작가의 말" }), h("p", { text: e.note })));
  if (nextI >= 0){
    const ne = eps[nextI];
    main.appendChild(h("button", { class: "next", type: "button", onclick: () => go("reader", { id: s.id, i: nextI }, false) },
      h("span", { class: "tx" }, h("span", { class: "mono", text: "NEXT EPISODE · " + pad(num + 1) }), h("b", { text: ne.title || pad(num + 1) + "화" })), h("span", { class: "ar", text: "▶" })));
  } else {
    main.appendChild(h("div", { class: "next end" }, h("span", { class: "tx" }, h("span", { class: "mono", text: s.status === "done" ? "THE END · 완결" : "LATEST · 최신화" }),
      h("b", { text: s.status === "done" ? "마지막 회차까지 읽었어요" : "다음 회차를 기다려 주세요" }))));
  }
  main.appendChild(h("div", { class: "pager2" },
    h("button", { class: "btn line kr", type: "button", disabled: prevI < 0 || null, onclick: () => go("reader", { id: s.id, i: prevI }, false), text: "← 이전화" }),
    h("button", { class: "btn line kr", type: "button", onclick: () => go("series", { id: s.id }, false), text: "목록" })));
  if (CAN_EDIT && !s.readonly) main.appendChild(h("div", { style: { display: "flex", gap: "8px", justifyContent: "center", marginTop: "18px", flexWrap: "wrap" } },
    h("button", { class: "btn sm line", type: "button", onclick: () => go("editEpisode", { sid: s.id, eid: e.id }), text: "이 회차 수정" }),
    h("button", { class: "btn sm line", type: "button", onclick: () => exportEpisode(s, e), text: "HTML 파일로 받기" })));
  rd.appendChild(main);

  rd.appendChild(h("footer", { class: "rd-bot" }, h("div", { class: "bin" },
    h("button", { class: "ib", type: "button", disabled: prevI < 0 || null, onclick: () => go("reader", { id: s.id, i: prevI }, false), text: "◀ PREV" }),
    h("span", { class: "pg", text: pad(num) + " / " + pad(total) }),
    h("button", { class: "ib", type: "button", onclick: () => openToc(s, p.i), text: "INDEX" }),
    h("button", { class: "ib fill", type: "button", disabled: nextI < 0 || null, onclick: () => go("reader", { id: s.id, i: nextI }, false), text: "NEXT ▶" }))));
  app.appendChild(rd);

  // 스크롤: 진행률 · 막대 자동 숨김
  let lastY = 0;
  const prog = rd.querySelector(".rd-prog"), pb = pct.querySelector("b"), pt = pct.querySelector(".track i");
  function onScroll(){
    const max = app.scrollHeight - app.clientHeight;
    const r = max > 0 ? Math.min(1, app.scrollTop / max) : 1;
    prog.style.width = (r * 100) + "%"; pt.style.height = (r * 100) + "%";
    pb.innerHTML = Math.round(r * 100) + "<small>%</small>";
    const y = app.scrollTop;
    if (y > 90 && y - lastY > 6) rd.classList.add("hide-ui");
    else if (lastY - y > 6 || y < 40 || r > .985) rd.classList.remove("hide-ui");
    lastY = y;
  }
  rd._onScroll = onScroll;
  // 탭: 가운데는 메뉴 보이기/숨기기, 넘김 모드에서 좌우는 한 화면씩
  function onTap(ev){
    if (document.querySelector(".drawer,.sheet,.modal-bg")) return;
    const path = ev.composedPath ? ev.composedPath() : [ev.target];
    if (path.some(n => n.nodeType === 1 && /^(A|BUTTON|SUMMARY|INPUT|SELECT|TEXTAREA|LABEL|IFRAME|VIDEO|AUDIO)$/.test(n.tagName))) return;
    if (path.some(n => n.classList && (n.classList.contains("sp") || n.classList.contains("rd-top") || n.classList.contains("rd-bot")))) return;
    const sel = window.getSelection(); if (sel && String(sel).length) return;
    const x = ev.clientX / (FRAME.clientWidth || window.innerWidth);
    if (RS.page === "tap" && (x < .3 || x > .7)){
      const step = (app.clientHeight - 90) * (x < .3 ? -1 : 1);
      if (x > .7 && app.scrollTop + app.clientHeight >= app.scrollHeight - 4 && nextI >= 0){ go("reader", { id: s.id, i: nextI }, false); return; }
      app.scrollBy({ top: step, behavior: matchMedia("(prefers-reduced-motion:reduce)").matches ? "auto" : "smooth" });
      rd.classList.add("hide-ui");
      return;
    }
    rd.classList.toggle("hide-ui");
  }
  function onKey(ev){
    if (ev.target.closest && ev.target.closest("input,textarea,select")) return;
    if (document.querySelector(".drawer,.sheet,.modal-bg")){ if (ev.key === "Escape") document.querySelectorAll(".drawer,.drawer-bg,.sheet").forEach(n => n.remove()); return; }
    if (ev.key === "ArrowLeft" && prevI >= 0) go("reader", { id: s.id, i: prevI }, false);
    else if (ev.key === "ArrowRight" && nextI >= 0) go("reader", { id: s.id, i: nextI }, false);
    else if (ev.key === " " && RS.page === "tap"){ ev.preventDefault(); app.scrollBy({ top: (app.clientHeight - 90) * (ev.shiftKey ? -1 : 1), behavior: "smooth" }); }
  }
  app.addEventListener("scroll", onScroll, { passive: true });
  rd.addEventListener("click", onTap);
  document.addEventListener("keydown", onKey);
  cleanup = () => { app.removeEventListener("scroll", onScroll); document.removeEventListener("keydown", onKey); };
  onScroll();
};
function applyRS(rd){
  rd.dataset.th = RS.th;
  rd.style.setProperty("--r-size", RS.size + "px");
  rd.style.setProperty("--r-lh", RS.lh);
  rd.style.setProperty("--r-pgap", RS.pgap + "em");
  rd.style.setProperty("--r-w", RS.w + "px");
  rd.style.setProperty("--r-font", FONTS[RS.font][1]);
}
function openToc(s, curI){
  document.querySelectorAll(".drawer,.drawer-bg").forEach(n => n.remove());
  const close = () => { bg.remove(); dr.remove(); };
  const bg = h("div", { class: "drawer-bg", onclick: close });
  const ol = h("ol");
  let n = 0;
  arr(s.episodes).forEach((e, i) => {
    const no = e.locked ? "—" : pad(++n);
    ol.appendChild(h("li", { class: i === curI ? "cur" : "" }, h("button", { type: "button", disabled: e.locked || null, onclick: () => go("reader", { id: s.id, i }, false) },
      h("span", { class: "n", text: no }), h("span", { class: "t", text: e.locked ? "잠긴 기록" : (e.title || no + "화") }),
      h("span", { class: "s", text: e.locked ? "LOCK" : (e.type === "chat" ? "LOG" : (e.spoiler ? "SPOIL" : "")) }))));
  });
  const dr = h("aside", { class: "drawer", role: "dialog", "aria-label": "목차" },
    h("div", { class: "hd" }, h("h3", { text: "INDEX" }), barcode(s.title, 14), h("span", { class: "mono", text: pad(n) + " EP" }),
      h("button", { class: "x", type: "button", onclick: close, text: "CLOSE ✕" })),
    h("div", { class: "bd" }, h("p", { class: "mono", style: { color: "rgba(255,255,255,.8)", margin: "0 0 12px 16px" }, text: s.title }), ol));
  FRAME.appendChild(bg); FRAME.appendChild(dr);
  const c = dr.querySelector(".cur"); if (c) c.scrollIntoView({ block: "center" });
}
function openSettings(rd, s, e){
  document.querySelectorAll(".sheet").forEach(n => n.remove());
  const close = () => { bg.remove(); sh.remove(); };
  const bg = h("div", { class: "drawer-bg", style: { background: "transparent", backdropFilter: "none" }, onclick: close });
  const rerender = () => { applyRS(rd); if (rd._refill) rd._refill(); rd._onScroll && rd._onScroll(); };
  const seg = (items, curv, set) => {
    const box = h("div", { class: "seg" });
    items.forEach(([v, label, sw]) => box.appendChild(h("button", { type: "button", class: sw != null && sw !== "" ? "sw" : "", title: label, "aria-label": label, "aria-pressed": String(curv() === v),
      style: sw ? { background: sw, borderColor: "var(--line)" } : null,
      onclick: (ev) => { set(v); box.querySelectorAll("button").forEach(b => b.setAttribute("aria-pressed", String(b === ev.currentTarget))); rerender(); }, text: sw ? "" : label })));
    return box;
  };
  const stepper = (get, set, min, max, step, fmt) => {
    const out = h("b", { text: fmt(get()) });
    const ch = (d) => { set(Math.round(Math.max(min, Math.min(max, get() + d)) * 100) / 100); out.textContent = fmt(get()); rerender(); };
    return h("div", { class: "seg" }, h("div", { class: "stp" }, h("button", { type: "button", "aria-label": "줄이기", onclick: () => ch(-step), text: "−" }), out, h("button", { type: "button", "aria-label": "늘리기", onclick: () => ch(step), text: "+" })));
  };
  const opt = (label, ctl) => h("div", { class: "opt" }, h("span", { text: label }), ctl);
  const sh = h("div", { class: "sheet", role: "dialog", "aria-label": "보기 설정" }, h("div", { class: "bin" },
    h("div", { class: "hd" }, h("h3", { text: "VIEWER" }), h("span", { class: "mono mute", style: { marginLeft: "12px" }, text: "저장되지 않음" }),
      h("button", { class: "ib x", type: "button", onclick: close, text: "CLOSE ✕" })),
    opt("배경", seg(THEMES.map(t => [t[0], t[1], t[2] || ""]), () => RS.th, v => RS.th = v)),
    opt("글꼴", seg(Object.keys(FONTS).map(k => [k, FONTS[k][0]]), () => RS.font, v => RS.font = v)),
    opt("글자 크기", stepper(() => RS.size, v => RS.size = v, 13, 28, 1, v => v + "px")),
    opt("줄 간격", stepper(() => RS.lh, v => RS.lh = v, 1.4, 2.6, .1, v => v.toFixed(1))),
    opt("문단 간격", stepper(() => RS.pgap, v => RS.pgap = v, 0, 2.4, .2, v => v.toFixed(1))),
    opt("본문 폭", seg([[560, "좁게"], [700, "보통"], [860, "넓게"]], () => RS.w, v => RS.w = v)),
    opt("들여쓰기", seg([[false, "없음"], [true, "1칸"]], () => RS.indent, v => RS.indent = v)),
    opt("넘기기", seg([["scroll", "스크롤"], ["tap", "탭 넘김"]], () => RS.page, v => { RS.page = v; if (v === "tap") toast("화면 왼쪽·오른쪽을 누르면 한 화면씩 넘어가요."); })),
    e.type === "chat" ? opt("채팅 로그", seg([["", "작가 설정"], ["novel", "소설형"], ["bubble", "말풍선"]], () => RS.chatMode, v => RS.chatMode = v)) : null));
  rd.appendChild(bg); rd.appendChild(sh);
}
function exportEpisode(s, e){
  const inner = e.type === "chat" ? chatHtml(e.chat || {}, (e.chat && e.chat.mode) || "novel") : bodyHtml(e.html);
  const doc = `<!doctype html><html lang="ko"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>${esc(s.title)} - ${esc(e.title)}</title>
<link href="https://fonts.googleapis.com/css2?family=Black+Han+Sans&family=Noto+Serif+KR:wght@400;700&family=Gowun+Batang&display=swap" rel="stylesheet">
<style>:root{--ink:#1d1d1f;--paper:#fbfaf7;--line:#e2e0da;--blue:${esc(hexOf(getComputedStyle(document.documentElement).getPropertyValue("--blue").trim() || "#0b4dff"))};--mute:#777;--faint:#aaa;--veil:rgba(0,0,0,.04);--veil2:rgba(0,0,0,.07);--blue-soft:rgba(11,77,255,.12);--serif:'Noto Serif KR',serif;--sans:system-ui,sans-serif;--kr-display:'Black Han Sans',sans-serif}
body{margin:0;background:var(--paper);color:var(--ink)}main{max-width:700px;margin:0 auto;padding:48px 20px 80px}h1{font-family:var(--kr-display);font-weight:400;font-size:32px;margin:6px 0 4px}small{color:var(--mute);font:12px var(--sans)}hr.t{border:0;height:2px;background:var(--blue);margin:18px 0 36px}${NV_CSS}</style></head>
<body><main><small>${esc(s.title)}${e.date ? " · " + esc(fmtDate(e.date)) : ""}</small><h1>${esc(e.title)}</h1><hr class="t"><div class="nv">${inner}</div>${str(e.note) ? `<hr><p style="white-space:pre-line;font:14px/1.8 var(--sans);color:var(--mute)">${esc(e.note)}</p>` : ""}</main>
<script>document.addEventListener("click",function(e){var s=e.target.closest&&e.target.closest(".sp");if(s)s.classList.toggle("on")});<\/script></body></html>`;
  download((s.title + " - " + (e.title || "회차")).replace(/[\\/:*?"<>|]/g, "_") + ".html", doc, "text/html;charset=utf-8");
}

/* ═══════════════════════ 작품 정보 편집 ═══════════════════════ */
VIEWS.editSeries = function(p){
  if (!CAN_EDIT){ go("library", {}, false); return; }
  const isNew = !p.id;
  const src = isNew ? null : lib.series.find(s => s.id === p.id);
  if (!isNew && !src){ go("library", {}, false); return; }
  const s = JSON.parse(JSON.stringify(src || { id: uid(), title: "", tagline: "", author: "", genre: "로맨스판타지", status: "ongoing", age: "all", color: "", cover: "", tags: [], intro: "", cast: [], created: today(), episodes: [] }));
  const page = h("div", { class: "page", style: { maxWidth: "860px" } });
  page.appendChild(h("button", { class: "back", type: "button", onclick: back }, "← BACK"));
  page.appendChild(h("div", { class: "sec", style: { marginTop: "22px" } }, h("h2", { html: isNew ? "NEW <em>SERIES</em>" : "EDIT <em>SERIES</em>" }), h("span", { class: "rule" })));

  const I = (k, ph, cls) => h("input", { class: "in " + (cls || ""), value: s[k] || "", placeholder: ph || "", oninput: (e) => { s[k] = e.target.value; } });
  const fld = (label, ctl, hint) => h("div", { class: "fld" }, h("label", { text: label }), ctl, hint ? h("small", { text: hint }) : null);
  const sel = (k, items) => { const x = h("select", { class: "in", onchange: (e) => { s[k] = e.target.value; } }); items.forEach(([v, l]) => x.appendChild(h("option", { value: v, text: l }))); x.value = s[k]; return x; };
  const intro = h("textarea", { class: "in", rows: 7, placeholder: "작품 소개를 적어 주세요. 줄바꿈이 그대로 보여요.", oninput: (e) => { s.intro = e.target.value; } }); intro.value = s.intro || "";
  const tags = h("input", { class: "in", value: arr(s.tags).join(", "), placeholder: "계약결혼, 회귀, 북부대공", oninput: (e) => { s.tags = e.target.value.split(/[,#]/).map(str).filter(Boolean); } });
  const genre = h("input", { class: "in", value: s.genre || "", list: "genres", oninput: (e) => { s.genre = e.target.value; } });
  const gl = h("datalist", { id: "genres" }); ["로맨스판타지", "로맨스", "판타지", "현대판타지", "무협", "BL", "GL", "드라마", "미스터리", "SF", "단편", "기타"].forEach(g => gl.appendChild(h("option", { value: g })));

  // 표지
  const prev = h("div", { class: "cv-prev ph" });
  const drawPrev = () => { prev.textContent = ""; if (isUrl(s.cover)) prev.appendChild(img(s.cover, "")); };
  const coverIn = h("input", { class: "in", value: isUrl(s.cover) && !s.cover.startsWith("data:") ? s.cover : "", placeholder: "https://… 이미지 주소", oninput: (e) => { s.cover = e.target.value.trim(); drawPrev(); } });
  drawPrev();
  const coverBox = h("div", { class: "inline", style: { alignItems: "flex-start" } }, prev,
    h("div", { style: { flex: "1", minWidth: "200px", display: "flex", flexDirection: "column", gap: "8px" } }, coverIn,
      h("div", { class: "inline" },
        h("button", { class: "btn sm line", type: "button", onclick: async () => { const u = (await pickImages(false, 640))[0]; if (!u) return; s.cover = u; coverIn.value = u.startsWith("data:") ? "" : u; drawPrev(); toast(u.startsWith("data:") ? "표지를 줄여서 넣었어요 (" + kb(u) + "KB)." : "표지를 사이트에 올렸어요."); }, text: CAN_UPLOAD ? "사진 올리기" : "사진 파일" }),
        siteImages.length ? h("button", { class: "btn sm line", type: "button", onclick: () => pickSiteImage(src2 => { s.cover = src2; coverIn.value = src2; drawPrev(); }), text: "사이트 갤러리에서" }) : null,
        h("button", { class: "btn sm line", type: "button", onclick: () => { s.cover = ""; coverIn.value = ""; drawPrev(); }, text: "지우기" })),
      h("small", { class: "mute", text: CAN_UPLOAD ? "올린 사진은 LOPE 사이트에 따로 저장되고 주소만 남아요." : "LOPE 밖에서는 640px로 줄여서 글자로 넣어요. LOPE 안에서는 사이트에 따로 올라가요." })));

  // 포인트 색
  const useC = h("input", { type: "checkbox", checked: !!s.color });
  const colorIn = h("input", { type: "color", value: hexOf(s.color || "#0b4dff"), style: { width: "44px", height: "36px", padding: "0", border: "1px solid var(--line)", background: "none" } });
  const syncColor = () => { s.color = useC.checked ? colorIn.value : ""; };
  useC.addEventListener("change", syncColor); colorIn.addEventListener("input", () => { useC.checked = true; syncColor(); });

  // 등장인물
  const castBox = h("div", { class: "pick-grid" });
  const has = (c) => arr(s.cast).some(x => x.name === c.name && (x.au || "") === (c.au || ""));
  siteChars.forEach(c => {
    const cb = h("input", { type: "checkbox", checked: has(c) });
    cb.addEventListener("change", () => { if (cb.checked){ if (!has(c)) s.cast.push(Object.assign({}, c)); } else s.cast = s.cast.filter(x => !(x.name === c.name && (x.au || "") === (c.au || ""))); drawManual(); });
    castBox.appendChild(h("label", {}, cb, avatarEl(c), h("span", { text: c.name + (c.au ? " · " + c.au : "") })));
  });
  const manual = h("div", { class: "spk-list" });
  function drawManual(){
    manual.textContent = "";
    arr(s.cast).forEach((c, i) => {
      if (siteChars.some(x => x.name === c.name && (x.au || "") === (c.au || ""))) return;
      manual.appendChild(h("div", { class: "spk", "--c": safeColor(c.color) || null },
        h("input", { type: "color", value: hexOf(c.color), oninput: (e) => { c.color = e.target.value; } }),
        h("input", { class: "in", value: c.name, placeholder: "이름", style: { minHeight: "32px", padding: "4px 8px" }, oninput: (e) => { c.name = e.target.value; } }),
        h("input", { class: "in", value: c.role || "", placeholder: "한 줄 설명", style: { minHeight: "32px", padding: "4px 8px", maxWidth: "160px" }, oninput: (e) => { c.role = e.target.value; } }),
        h("button", { class: "ib", type: "button", "aria-label": "삭제", onclick: () => { s.cast.splice(i, 1); drawManual(); }, text: "✕" }),
        h("div", { class: "more2" }, h("input", { class: "in", value: c.avatar || "", placeholder: "프로필 이미지 주소 (https://…)", oninput: (e) => { c.avatar = e.target.value.trim(); } }))));
    });
  }
  drawManual();

  page.appendChild(h("div", { class: "form" },
    fld("작품 제목 *", I("title", "제목을 입력하세요", "big")),
    fld("한 줄 소개", I("tagline", "표지와 목록에 나오는 짧은 문장")),
    h("div", { class: "row2" }, fld("작가 / 필명", I("author", "")), fld("장르", h("div", {}, genre, gl))),
    h("div", { class: "row2" },
      fld("연재 상태", sel("status", [["ongoing", "연재중"], ["hiatus", "휴재"], ["done", "완결"]])),
      fld("이용가", sel("age", [["all", "전체 이용가"], ["15", "15세 이상"], ["19", "19세 이상 (열 때 확인)"]])),
      fld("포인트 색", h("div", { class: "inline" }, h("label", { class: "chk" }, useC, "따로 지정"), colorIn), "끄면 스킨의 색을 따라가요.")),
    fld("태그 (쉼표로 구분)", tags),
    fld("표지", coverBox),
    fld("작품 소개", intro),
    h("div", { class: "fld" }, h("span", { class: "lb", text: "등장인물" }),
      siteChars.length ? castBox : h("small", { text: "사이트 데이터 넘기기를 켜면 사이트의 캐릭터를 골라 넣을 수 있어요." }),
      manual,
      h("div", {}, h("button", { class: "btn sm line", type: "button", onclick: () => { s.cast.push({ name: "", color: "#888888", role: "" }); drawManual(); }, text: "+ 직접 추가" })))));

  page.appendChild(h("div", { class: "foot-act" },
    h("span", { class: "grow", text: isNew ? "만든 뒤 회차를 추가할 수 있어요" : "" }),
    h("button", { class: "btn line kr", type: "button", onclick: back, text: "취소" }),
    h("button", { class: "btn kr", type: "button", onclick: () => {
      if (!str(s.title)){ toast("작품 제목을 적어 주세요."); return; }
      s.title = str(s.title); s.cast = arr(s.cast).filter(c => str(c.name)); s.updated = today();
      if (isNew) lib.series.unshift(s); else lib.series[lib.series.indexOf(src)] = s;
      markDirty(); stack.pop(); go("series", { id: s.id }, false);
      if (!LOCAL) toast("적용했어요. 위의 '사이트에 저장'을 눌러야 사이트에 남아요.");
    }, text: isNew ? "작품 만들기" : "적용" })));
  app.appendChild(page);
};
function pickSiteImage(cb){
  const g = h("div", { class: "gal" });
  let close;
  siteImages.forEach(im => g.appendChild(h("button", { type: "button", title: im.title, onclick: () => { cb(im.src); close(); } }, img(im.src, im.title))));
  close = modal("사이트 이미지", g);
}

/* ═══════════════════════ 회차 편집 ═══════════════════════ */
VIEWS.editEpisode = function(p){
  if (!CAN_EDIT){ go("library", {}, false); return; }
  const s = lib.series.find(x => x.id === p.sid);
  if (!s){ go("library", {}, false); return; }
  const src = p.eid ? s.episodes.find(e => e.id === p.eid) : null;
  const e = JSON.parse(JSON.stringify(src || { id: uid(), type: p.type || "novel", title: "", date: today(), spoiler: false, note: "", html: "", chat: null }));
  if (!e.chat) e.chat = { raw: "", speakers: [], user: "", mode: "novel", names: true, hideOoc: true };
  const n = src ? s.episodes.indexOf(src) + 1 : s.episodes.length + 1;

  const page = h("div", { class: "page", style: { maxWidth: "1100px" } });
  page.appendChild(h("div", { style: { display: "flex", alignItems: "center", gap: "12px", flexWrap: "wrap" } },
    h("button", { class: "back", type: "button", onclick: () => { if (changed() && !confirm("적용하지 않은 내용이 사라져요. 나갈까요?")) return; back(); } }, "← BACK"),
    h("span", { class: "mono mute", text: s.title + " / EP " + pad(n) })));
  page.appendChild(h("div", { class: "sec", style: { marginTop: "20px" } }, h("h2", { html: (src ? "EDIT" : "NEW") + " <em>EPISODE</em>" }), h("span", { class: "rule" })));

  const title = h("input", { class: "in big", value: e.title, placeholder: pad(n) + "화. 회차 제목", oninput: (ev) => { e.title = ev.target.value; } });
  const date = h("input", { class: "in", type: "date", value: e.date || "", oninput: (ev) => { e.date = ev.target.value; } });
  const sp = h("input", { type: "checkbox", checked: !!e.spoiler, onchange: (ev) => { e.spoiler = ev.target.checked; } });
  const note = h("textarea", { class: "in", rows: 3, placeholder: "회차 끝에 나오는 작가의 말 (선택)", oninput: (ev) => { e.note = ev.target.value; } }); note.value = e.note || "";

  const tabs = h("div", { class: "tabs", role: "tablist" });
  const pane = h("div", { style: { marginTop: "14px" } });
  let editor = null;
  const setType = (t) => {
    if (editor && editor.flush) editor.flush();
    e.type = t;
    tabs.querySelectorAll("button").forEach(b => b.setAttribute("aria-selected", String(b.dataset.t === t)));
    pane.textContent = "";
    editor = t === "chat" ? chatEditor(pane, e) : richEditor(pane, e);
  };
  [["novel", "NOVEL · 소설"], ["chat", "CHAT LOG · 채팅 로그"]].forEach(([t, l]) => tabs.appendChild(h("button", { type: "button", role: "tab", "data-t": t, onclick: () => setType(t), text: l })));

  page.appendChild(h("div", { class: "form" },
    h("div", { class: "fld" }, h("label", { text: "회차 제목" }), title),
    h("div", { class: "row2" }, h("div", { class: "fld" }, h("label", { text: "올린 날짜" }), date),
      h("div", { class: "fld" }, h("span", { class: "lb", text: "공개" }), h("label", { class: "chk", style: { minHeight: "42px" } }, sp, "스포일러 회차 (눌러야 보임)"))),
    h("div", { class: "fld" }, h("span", { class: "lb", text: "본문 형식" }), tabs, pane),
    h("div", { class: "fld" }, h("label", { text: "작가의 말" }), note)));

  const snapshot = () => { if (editor && editor.flush) editor.flush(); return JSON.stringify(e); };
  let initial = "";
  const changed = () => snapshot() !== initial;
  page.appendChild(h("div", { class: "foot-act" },
    h("span", { class: "grow", text: "적용 후 '사이트에 저장'까지 눌러야 남아요" }),
    h("button", { class: "btn line kr", type: "button", onclick: () => { snapshot(); previewEpisode(s, e); }, text: "미리보기" }),
    h("button", { class: "btn kr", type: "button", onclick: () => {
      snapshot();
      if (e.type === "chat"){ delete e.html; e.chat.turns && delete e.chat.turns; } else { e.chat = null; }
      if (!str(e.title)) e.title = pad(n) + "화";
      if (src) s.episodes[s.episodes.indexOf(src)] = e; else s.episodes.push(e);
      s.updated = today(); markDirty();
      stack.pop(); go("series", { id: s.id }, false);
      if (!LOCAL) toast("적용했어요. '사이트에 저장'을 눌러야 사이트에 남아요.");
    }, text: src ? "적용" : "회차 올리기" })));
  app.appendChild(page);
  setType(e.type === "chat" ? "chat" : "novel");
  initial = snapshot();
  cleanup = () => { if (editor && editor.destroy) editor.destroy(); };
};
function previewEpisode(s, e){
  const host = h("div", { style: { maxHeight: "62vh", overflow: "auto", padding: "4px 2px" } });
  const inner = h("div"); host.appendChild(inner);
  modal("미리보기 · " + (e.title || "회차"), host);
  renderBody(inner, s, e);
  document.querySelector(".modal").style.width = "min(760px,100%)";
}

/* ─────────── 리치 에디터 ─────────── */
const ED_FONTS = [["", "글꼴"], ["Noto Serif KR", "명조"], ["Gowun Batang", "고운바탕"], ["Nanum Myeongjo", "나눔명조"], ["Pretendard", "고딕"], ["Black Han Sans", "검은고딕"], ["Anton", "ANTON"], ["IBM Plex Mono", "MONO"]];
const ED_SIZES = [["", "크기"], [".8em", "작게"], ["1em", "보통"], ["1.25em", "크게"], ["1.6em", "아주 크게"], ["2.2em", "제목급"]];
function richEditor(pane, e){
  let srcMode = false;
  const ed = h("div", { class: "nv ed", contenteditable: "true", spellcheck: "false", "data-ph": "여기에 본문을 쓰거나, 다른 에디터에서 꾸민 글을 그대로 붙여넣으세요." });
  const ta = h("textarea", { class: "src", spellcheck: "false", placeholder: "<p>HTML 코드를 직접 쓰거나 붙여넣을 수 있어요. <style>도 이 회차 안에서만 적용됩니다.</p>" });
  const count = h("div", { class: "edcount" });
  const wrap = h("div", { class: "edwrap", style: { position: "relative" } }, ed, ta);
  ta.hidden = true;

  function toEditor(html){
    const t = document.createElement("template"); t.innerHTML = bodyHtml(html);
    t.content.querySelectorAll("style").forEach(st => { st.setAttribute("media", "not all"); st.setAttribute("data-off", ""); });
    t.content.querySelectorAll("details").forEach(d => d.setAttribute("open", ""));
    return t.innerHTML;
  }
  function fromEditor(){
    const c = ed.cloneNode(true);
    c.querySelectorAll("style[data-off]").forEach(st => { st.removeAttribute("media"); st.removeAttribute("data-off"); });
    c.querySelectorAll("details").forEach(d => d.removeAttribute("open"));
    c.querySelectorAll(".sel").forEach(x => { x.classList.remove("sel"); if (!x.className) x.removeAttribute("class"); });
    let html = c.innerHTML.replace(/^(<p><br><\/p>|<br>)+$/, "").replace(/(<p><br><\/p>)+$/, "");
    return sanitize(html);
  }
  ed.innerHTML = toEditor(e.html || "") || "<p><br></p>";
  // 문단이 항상 <p>로 감싸져 있어야 상자·장면 전환 같은 블록이 제대로 들어간다
  ed.addEventListener("focus", () => { try { document.execCommand("defaultParagraphSeparator", false, "p"); } catch (er) {} if (!ed.textContent.trim() && !ed.querySelector("img,hr,iframe")) ed.innerHTML = "<p><br></p>"; });

  const updCount = () => { count.textContent = (srcMode ? charCount(stripTags(ta.value)) : charCount(ed.textContent)).toLocaleString() + "자 · " + kb(srcMode ? ta.value : ed.innerHTML) + "KB"; };
  updCount();

  // 선택 영역 기억 (색 고르기 등으로 포커스가 나가도 되돌리기)
  let range = null;
  const saveSel = () => { const s = window.getSelection(); if (s.rangeCount && ed.contains(s.anchorNode)) range = s.getRangeAt(0).cloneRange(); };
  const restore = () => { ed.focus(); if (range){ const s = window.getSelection(); s.removeAllRanges(); s.addRange(range); } };
  document.addEventListener("selectionchange", saveSel);
  const ex = (cmd, val) => { if (srcMode) return; restore(); try { document.execCommand("styleWithCSS", false, true); } catch (er) {} document.execCommand(cmd, false, val); saveSel(); updCount(); };
  // 상자·이미지 같은 블록은 커서가 있는 문단 바로 뒤에 직접 끼워 넣는다 (insertHTML은 꾸밈을 뭉개서)
  const insert = (html) => {
    if (srcMode){ insertAtCursor(ta, html); return; }
    restore();
    const s = window.getSelection();
    let blk = s.rangeCount ? s.getRangeAt(0).startContainer : null;
    while (blk && blk.parentNode !== ed) blk = blk.parentNode;
    const t = document.createElement("template"); t.innerHTML = html;
    const nodes = [...t.content.childNodes];
    const tail = nodes[nodes.length - 1];
    if (!blk) ed.appendChild(t.content);
    else if (blk.nodeType === 1 && !blk.textContent.trim() && !blk.querySelector("img,hr,iframe")) blk.replaceWith(t.content);
    else blk.after(t.content);
    if (tail && tail.nodeType === 1){ const r = document.createRange(); r.selectNodeContents(tail); r.collapse(true); s.removeAllRanges(); s.addRange(r); }
    saveSel(); updCount();
  };
  const wrapSel = (make, after) => {
    if (srcMode) return; restore();
    const s = window.getSelection(); if (!s.rangeCount) return;
    const r = s.getRangeAt(0);
    if (r.collapsed){ toast("먼저 글자를 선택해 주세요."); return; }
    const el = make(); el.appendChild(r.extractContents()); if (after) after(el); r.insertNode(el);
    s.removeAllRanges(); const nr = document.createRange(); nr.selectNodeContents(el); s.addRange(nr); saveSel(); updCount();
  };
  const sizeSel = (v) => {
    ex("fontSize", "7");
    ed.querySelectorAll('font[size="7"]').forEach(f => { const sp = document.createElement("span"); sp.style.fontSize = v; while (f.firstChild) sp.appendChild(f.firstChild); f.replaceWith(sp); });
    ed.querySelectorAll("span").forEach(sp => { if (/xxx-large|-webkit-xxx-large/.test(sp.style.fontSize)) sp.style.fontSize = v; });
  };

  const B = (label, title, fn, style) => h("button", { type: "button", title, "aria-label": title, onmousedown: (ev) => ev.preventDefault(), onclick: fn, html: label, style: style || null });
  const colorBtn = (title, label, cmd, initC) => {
    const bar = h("i", { class: "clr", style: { background: initC } });
    const inp = h("input", { type: "color", value: initC, "aria-label": title });
    inp.addEventListener("input", () => { bar.style.background = inp.value; ex(cmd, inp.value); });
    return h("label", { class: "tbb", title }, h("span", { html: label }), bar, inp);
  };
  const S = (opts, fn, title) => { const x = h("select", { title, "aria-label": title }); opts.forEach(([v, l]) => x.appendChild(h("option", { value: v, text: l }))); x.addEventListener("mousedown", saveSel); x.addEventListener("change", () => { if (x.value) fn(x.value); x.selectedIndex = 0; }); return x; };
  const srcBtn = B("&lt;/&gt; HTML", "HTML 코드 보기", () => toggleSrc());
  const tb = h("div", { class: "tb", role: "toolbar", "aria-label": "본문 꾸미기" },
    B("↶", "실행 취소", () => ex("undo")), B("↷", "다시 실행", () => ex("redo")), h("span", { class: "sep" }),
    S([["", "문단"], ["p", "본문"], ["h2", "제목"], ["h3", "소제목"], ["blockquote", "인용"], ["pre", "코드"]], v => ex("formatBlock", "<" + v + ">"), "문단 모양"),
    S(ED_FONTS, v => ex("fontName", v), "글꼴"), S(ED_SIZES, sizeSel, "글자 크기"), h("span", { class: "sep" }),
    B("<b>B</b>", "굵게", () => ex("bold")), B("<i>I</i>", "기울임", () => ex("italic")), B("<u>U</u>", "밑줄", () => ex("underline")), B("<s>S</s>", "취소선", () => ex("strikeThrough")),
    colorBtn("글자 색", "A", "foreColor", "#d8344a"), colorBtn("형광펜", "<span style='background:#ffe36e;color:#222;padding:0 3px'>A</span>", "hiliteColor", "#ffe36e"),
    h("span", { class: "sep" }),
    B("⇤", "왼쪽 정렬", () => ex("justifyLeft")), B("↔", "가운데 정렬", () => ex("justifyCenter")), B("⇥", "오른쪽 정렬", () => ex("justifyRight")), B("☰", "양쪽 정렬", () => ex("justifyFull")),
    h("span", { class: "sep" }),
    B("🖼 이미지", "이미지 넣기", () => imageDialog(insert)),
    B("🔗", "링크", () => { const u = prompt("링크 주소 (https://…)"); if (u && /^https?:\/\//i.test(u.trim())) ex("createLink", u.trim()); }),
    B("◇", "장면 전환", () => insert('<p class="scene">◇</p><p><br></p>')),
    B("―", "구분선", () => insert("<hr><p><br></p>")),
    B("▢ 상자", "글 상자", () => insert('<div class="box"><p>상자 안 내용</p></div><p><br></p>')),
    B("✉ 편지", "편지지", () => insert('<div class="letter"><p>편지 내용을 적어 주세요.</p><p style="text-align:right">— 보낸 사람</p></div><p><br></p>')),
    B("▸ 접기", "접기", () => insert('<details open><summary>접은 글 제목</summary><p>펼치면 보이는 내용</p></details><p><br></p>')),
    B("▮ 가리기", "스포일러 가리기 (선택한 글자)", () => wrapSel(() => h("span", { class: "sp" }))),
    B("윗주", "윗주(루비) — 선택한 글자 위에 작은 글씨", () => { if (srcMode) return; const t = prompt("글자 위에 달 작은 글씨"); if (t) wrapSel(() => h("ruby"), (r) => r.appendChild(h("rt", { text: t }))); }),
    B("⌫", "꾸밈 지우기", () => ex("removeFormat")),
    h("span", { class: "sep" }), srcBtn);

  // 이미지 고르면 크기 바
  let imgbar = null, selImg = null;
  const dropBar = () => { if (imgbar) imgbar.remove(); imgbar = null; if (selImg) selImg.classList.remove("sel"); selImg = null; };
  ed.addEventListener("click", (ev) => {
    dropBar();
    if (ev.target.tagName !== "IMG") return;
    selImg = ev.target; selImg.classList.add("sel");
    const set = (w) => { selImg.style.width = w; selImg.style.height = "auto"; updCount(); };
    imgbar = h("div", { class: "imgbar" },
      B("30%", "작게", () => set("30%")), B("50%", "중간", () => set("50%")), B("75%", "크게", () => set("75%")), B("100%", "꽉 차게", () => set("100%")), B("원본", "원본 크기", () => { selImg.style.width = ""; }),
      B("설명", "이미지 설명", () => { const fig = selImg.closest("figure"); const t = prompt("이미지 아래 설명", fig && fig.querySelector("figcaption") ? fig.querySelector("figcaption").textContent : ""); if (t == null) return; if (fig){ let c = fig.querySelector("figcaption"); if (!t){ c && c.remove(); return; } if (!c){ c = h("figcaption"); fig.appendChild(c); } c.textContent = t; } }),
      B("삭제", "이미지 삭제", () => { const fig = selImg.closest("figure"); (fig && fig.querySelectorAll("img").length === 1 ? fig : selImg).remove(); dropBar(); updCount(); }));
    const wr = wrap.getBoundingClientRect(), ir = selImg.getBoundingClientRect();
    imgbar.style.left = Math.max(4, ir.left - wr.left) + "px"; imgbar.style.top = Math.max(4, ir.top - wr.top + 6) + "px";
    wrap.appendChild(imgbar);
  });
  ed.addEventListener("input", updCount);
  ta.addEventListener("input", updCount);
  // 사진 파일을 끌어다 놓거나 붙여넣기
  const handleFiles = async (files) => {
    if (CAN_UPLOAD){ toast("사진은 '🖼 이미지' → '사진 올리기'로 넣어 주세요. 사이트에 따로 올라가 저장 칸을 아껴요."); return; }
    for (const f of files){ if (!/^image\//.test(f.type)) continue; const d = await fileToImage(f, 1100); insert(`<figure><img src="${d}" alt=""></figure><p><br></p>`); toast("사진을 줄여서 넣었어요 (" + kb(d) + "KB). 주소로 넣으면 용량을 아낄 수 있어요."); }
  };
  ed.addEventListener("drop", (ev) => { const fs = ev.dataTransfer && [...ev.dataTransfer.files].filter(f => /^image\//.test(f.type)); if (fs && fs.length){ ev.preventDefault(); handleFiles(fs); } });
  ed.addEventListener("paste", (ev) => {
    const items = ev.clipboardData ? [...ev.clipboardData.files].filter(f => /^image\//.test(f.type)) : [];
    if (items.length && !ev.clipboardData.getData("text/html")){ ev.preventDefault(); handleFiles(items); return; }
    const html = ev.clipboardData && ev.clipboardData.getData("text/html");
    if (html){ ev.preventDefault(); const body = /<body[^>]*>([\s\S]*)<\/body>/i.exec(html); document.execCommand("insertHTML", false, sanitize((body ? body[1] : html).replace(/<!--(?:Start|End)Fragment-->/g, ""))); updCount(); }
  });

  function toggleSrc(){
    dropBar();
    if (!srcMode){ ta.value = prettyHtml(fromEditor()); ed.hidden = true; ta.hidden = false; srcMode = true; ta.focus(); }
    else { ed.innerHTML = toEditor(ta.value); ta.hidden = true; ed.hidden = false; srcMode = false; ed.focus(); }
    srcBtn.setAttribute("aria-pressed", String(srcMode));
    tb.querySelectorAll("button,select,label.tbb").forEach(b => { if (b !== srcBtn && !/이미지|장면|구분선|상자|편지|접기/.test(b.title || "")) b.style.opacity = srcMode ? ".35" : ""; });
    updCount();
  }
  pane.appendChild(h("div", { class: "help", style: { marginBottom: "10px" } },
    "다른 에디터에서 꾸민 글을 붙여넣으면 꾸밈이 그대로 들어와요. ", h("code", { text: "</> HTML" }), " 버튼으로 코드를 직접 고칠 수 있고, ",
    h("code", { text: "<style>" }), "을 넣으면 이 회차 안에서만 적용됩니다. 스크립트는 안전을 위해 지워져요."));
  pane.appendChild(tb); pane.appendChild(wrap); pane.appendChild(count);
  return {
    flush(){ e.html = srcMode ? sanitize(ta.value) : fromEditor(); },
    destroy(){ document.removeEventListener("selectionchange", saveSel); }
  };
}
function insertAtCursor(ta, text){
  const a = ta.selectionStart, b = ta.selectionEnd;
  ta.value = ta.value.slice(0, a) + text + ta.value.slice(b);
  ta.selectionStart = ta.selectionEnd = a + text.length; ta.focus();
  ta.dispatchEvent(new Event("input"));
}
function prettyHtml(html){
  return html.replace(/(<\/(p|div|h[1-6]|blockquote|figure|details|summary|ul|ol|li|table|tr|pre|section)>)(?!\n)/gi, "$1\n").replace(/(<(hr|br)\s*\/?>)(?=<(p|div|h|hr))/gi, "$1\n");
}
function imageDialog(insert){
  const u = h("input", { class: "in", placeholder: "https://… 이미지 주소" });
  const cap = h("input", { class: "in", placeholder: "이미지 아래 설명 (선택)" });
  const w = h("select", { class: "in" }); [["100%", "꽉 차게"], ["75%", "크게"], ["50%", "중간"], ["", "원본 크기"]].forEach(([v, l]) => w.appendChild(h("option", { value: v, text: l })));
  let data = "";
  const prev = h("div", { style: { minHeight: "0" } });
  const showPrev = (src) => { prev.textContent = ""; if (isUrl(src)) prev.appendChild(img(src, "", "")).style.maxHeight = "180px"; };
  u.addEventListener("input", () => { data = ""; showPrev(u.value.trim()); });
  let close;
  const make = (src) => `<figure><img src="${esc(src)}" alt=""${w.value ? ` style="width:${w.value}"` : ""}>${str(cap.value) ? `<figcaption>${esc(cap.value)}</figcaption>` : ""}</figure><p><br></p>`;
  close = modal("이미지 넣기", h("div", { class: "form", style: { marginTop: 0 } },
    h("div", { class: "fld" }, h("label", { text: "주소" }), u),
    h("div", { class: "inline" },
      h("button", { class: "btn sm line", type: "button", onclick: async () => { const got = (await pickImages(false, 1100))[0]; if (!got) return; if (got.startsWith("data:")){ data = got; u.value = ""; } else { data = ""; u.value = got; } showPrev(got); }, text: CAN_UPLOAD ? "사진 올리기" : "사진 파일 고르기" }),
      siteImages.length ? h("button", { class: "btn sm line", type: "button", onclick: () => pickSiteImage(src => { u.value = src; data = ""; showPrev(src); }), text: "사이트 갤러리" }) : null),
    prev,
    h("div", { class: "row2" }, h("div", { class: "fld" }, h("label", { text: "크기" }), w), h("div", { class: "fld" }, h("label", { text: "설명" }), cap)),
    h("small", { class: "mute", text: CAN_UPLOAD ? "'사진 올리기'로 고른 사진은 LOPE 사이트에 따로 올라가서, 서재 저장 칸을 차지하지 않아요." : "LOPE 밖에서 고른 사진은 줄여서 글자로 넣어요. LOPE 안에서 쓰면 사이트에 따로 올라갑니다." })),
  () => { const src = data || u.value.trim(); if (!isUrl(src)){ toast("https:// 로 시작하는 주소나 파일을 넣어 주세요."); return false; } insert(make(src)); }, "넣기");
}

/* ─────────── 채팅 로그 에디터 ─────────── */
function chatEditor(pane, e){
  const c = e.chat;
  c.speakers = arr(c.speakers);
  const raw = h("textarea", { class: "in", rows: 16, spellcheck: "false", style: { fontFamily: "var(--mono)", fontSize: "13px" },
    placeholder: "AI 채팅 화면의 대화를 통째로 복사해 붙여넣으세요.\n\n예)\n*연회장은 샹들리에 불빛으로 눈부셨다.*\n카이렌: \"황녀 전하.\"\n에리엘: *부채로 입가를 가리며* \"별일이네요.\"" });
  raw.value = c.raw || "";
  const userSel = h("select", { class: "in" });
  const spkList = h("div", { class: "spk-list" });
  const prevHost = h("div");
  const prevBox = h("div", { class: "prev" }, h("div", { class: "mono b", style: { marginBottom: "12px" }, text: "LIVE PREVIEW" }), prevHost);

  const mode = h("select", { class: "in" }); [["novel", "소설형 (지문·대사를 소설처럼)"], ["bubble", "말풍선형 (메신저처럼)"]].forEach(([v, l]) => mode.appendChild(h("option", { value: v, text: l }))); mode.value = c.mode || "novel";
  const names = h("input", { type: "checkbox", checked: c.names !== false });
  const ooc = h("input", { type: "checkbox", checked: c.hideOoc !== false });

  function syncSpeakers(){
    const found = detectSpeakers(raw.value);
    found.forEach((n, i) => { if (!c.speakers.some(s => s.name === n)){
      const sc = siteChars.find(x => x.name === n || x.name.split(" ")[0] === n || n.includes(x.name));
      c.speakers.push({ name: n, color: sc && sc.color ? sc.color : ["#3f6fd6", "#c0587e", "#3e9a8d", "#c98a2c", "#8a5cc8", "#5b6b7d"][c.speakers.length % 6], avatar: sc ? sc.avatar : "", side: NAR_NAMES.test(n) ? "nar" : "left" });
    } });
    c.speakers = c.speakers.filter(s => found.includes(s.name) || raw.value.includes(s.name + "\n") || raw.value.includes(s.name));
    if (!c.user && c.speakers.length){
      const guess = c.speakers.find(s => /^(나|user|유저|you|me)$/i.test(s.name)) || c.speakers[c.speakers.length > 1 ? 1 : 0];
      c.user = guess.name;
    }
    c.speakers.forEach(s => { if (s.side !== "nar") s.side = s.name === c.user ? "right" : "left"; });
    drawSpeakers();
  }
  function drawSpeakers(){
    userSel.textContent = "";
    userSel.appendChild(h("option", { value: "", text: "— 없음 —" }));
    c.speakers.forEach(s => userSel.appendChild(h("option", { value: s.name, text: s.name })));
    userSel.value = c.user || "";
    spkList.textContent = "";
    if (!c.speakers.length) spkList.appendChild(h("small", { class: "mute", text: "화자를 아직 못 찾았어요. '이름: 대사' 형식이 두 번 이상 나오면 자동으로 잡혀요." }));
    c.speakers.forEach(s => {
      const linkSel = h("select", { title: "사이트 캐릭터와 연결" });
      linkSel.appendChild(h("option", { value: "", text: "캐릭터 연결" }));
      siteChars.forEach((sc, i) => linkSel.appendChild(h("option", { value: String(i), text: sc.name + (sc.au ? " · " + sc.au : "") })));
      linkSel.addEventListener("change", () => { const sc = siteChars[+linkSel.value]; if (!sc) return; if (sc.color) s.color = sc.color; s.avatar = sc.avatar || s.avatar; drawSpeakers(); preview(); });
      const side = h("select", { title: "위치" }); [["left", "왼쪽(상대)"], ["right", "오른쪽(나)"], ["nar", "지문"]].forEach(([v, l]) => side.appendChild(h("option", { value: v, text: l }))); side.value = s.side || "left";
      side.addEventListener("change", () => { s.side = side.value; if (s.side === "right"){ c.user = s.name; c.speakers.forEach(o => { if (o !== s && o.side === "right") o.side = "left"; }); } drawSpeakers(); preview(); });
      spkList.appendChild(h("div", { class: "spk", "--c": safeColor(s.color) || null },
        h("input", { type: "color", value: hexOf(s.color), "aria-label": s.name + " 색", oninput: (ev) => { s.color = ev.target.value; ev.target.closest(".spk").style.setProperty("--c", s.color); preview(); } }),
        h("b", { text: s.name }), side, siteChars.length ? linkSel : h("span"),
        h("div", { class: "more2" }, h("input", { class: "in", value: s.avatar || "", placeholder: "프로필 이미지 주소 (https://…)", oninput: (ev) => { s.avatar = ev.target.value.trim(); preview(); } }))));
    });
  }
  let pt;
  function preview(){
    clearTimeout(pt);
    pt = setTimeout(() => {
      c.raw = raw.value; c.mode = mode.value; c.names = names.checked; c.hideOoc = ooc.checked;
      const tmp = Object.assign({}, e, { type: "chat", chat: c });
      const saved = RS.chatMode; RS.chatMode = "";
      renderBody(prevHost, { }, tmp);
      RS.chatMode = saved;
    }, 180);
  }
  raw.addEventListener("input", () => { clearTimeout(raw._t); raw._t = setTimeout(() => { c.raw = raw.value; syncSpeakers(); preview(); }, 350); });
  userSel.addEventListener("change", () => { c.user = userSel.value; c.speakers.forEach(s => { if (s.side !== "nar") s.side = s.name === c.user ? "right" : "left"; }); drawSpeakers(); preview(); });
  [mode, names, ooc].forEach(x => x.addEventListener("change", preview));

  pane.appendChild(h("div", { class: "help", style: { marginBottom: "12px" }, html:
    "AI 채팅(제타·크랙·캐릭터챗 등)에서 대화를 복사해 붙여넣으면 화자별로 나눠 소설처럼 보여줘요.<br>" +
    "· <code>이름: 대사</code> · <code>[이름] 대사</code> · <code>**이름**: 대사</code> 또는 이름만 있는 줄 다음에 대사가 오는 형식을 알아봐요.<br>" +
    "· <code>*행동·지문*</code>은 지문으로, <code>\"대사\"</code>는 화자 색으로 칠해져요. <code>(OOC: …)</code> 줄은 숨길 수 있어요.<br>" +
    "· SillyTavern·ChatGPT 내보내기 같은 <code>.json</code> 파일도 그대로 불러올 수 있어요." }));
  pane.appendChild(h("div", { class: "chat-ed" },
    h("div", { style: { display: "flex", flexDirection: "column", gap: "12px", minWidth: "0" } },
      h("div", { class: "inline" },
        h("button", { class: "btn sm line", type: "button", onclick: async () => { const f = await pickFile(".txt,.json,.md,.log,text/plain,application/json"); if (!f) return; raw.value = await readText(f); c.raw = raw.value; syncSpeakers(); preview(); toast(f.name + " 을(를) 불러왔어요."); }, text: "파일에서 불러오기" }),
        h("button", { class: "btn sm line", type: "button", onclick: () => { c.speakers = []; c.user = ""; syncSpeakers(); preview(); }, text: "화자 다시 찾기" }),
        h("button", { class: "btn sm line", type: "button", onclick: () => download((e.title || "chat-log") + ".txt", raw.value), text: "원문 백업(.txt)" })),
      raw,
      h("div", { class: "row2" }, h("div", { class: "fld" }, h("label", { text: "나(유저)로 볼 화자" }), userSel), h("div", { class: "fld" }, h("label", { text: "기본 보기" }), mode)),
      h("div", { class: "inline" }, h("label", { class: "chk" }, names, "화자 이름 표시"), h("label", { class: "chk" }, ooc, "OOC 줄 숨기기")),
      h("div", { class: "fld" }, h("span", { class: "lb", text: "화자" }), spkList)),
    prevBox));
  syncSpeakers(); preview();
  return { flush(){ c.raw = raw.value; c.mode = mode.value; c.names = names.checked; c.hideOoc = ooc.checked; } };
}

/* ═══════════════════════ LOPE 연동 ═══════════════════════ */
const toLope = (msg) => { if (!LOCAL) parent.postMessage(Object.assign({ pageId: L.pageId }, msg), "*"); };

// ── 이 페이지 설정 (LOPE 관리자 › 이 페이지 설정 칸과 같은 값)
function writeSetting(key, value){
  SET[key] = value;
  if (EDITING) toLope({ type: "lope-settings-write", path: key, value });
}
function applySettings(){
  ROOT.classList.toggle("no-grid", SET.grid === false);
  if (SET.customAccent && safeColor(SET.accent)) ROOT.style.setProperty("--accent-own", safeColor(SET.accent));
  else ROOT.style.removeProperty("--accent-own");
  applyMode();
  layoutSafe();
}

// ── 밝기 · 배경: LOPE 에 "이 페이지 뒤 배경이 뭐냐"고 물어서 실제 사이트 배경에 맞춘다
//    (LOPE 의 다크 표시보다 정확: 스킨이 칠한 진짜 배경색의 밝기, 배경 이미지 여부까지 알려줌)
let backdrop = null;
function applyMode(){
  let m = SET.mode === "light" || SET.mode === "dark" ? SET.mode : "";
  if (!m && backdrop) m = backdrop.dark ? "dark" : "light";
  if (!m && !LOCAL && typeof (L.theme || {}).dark === "boolean") m = L.theme.dark ? "dark" : "light";
  if (m) ROOT.setAttribute("data-mode", m); else ROOT.removeAttribute("data-mode");
  const forced = SET.mode === "light" || SET.mode === "dark";
  const bg = backdrop && !forced ? str(backdrop.color) : "";
  if (bg && /^rgba?\([\d\s.,]+\)$/.test(bg)) ROOT.style.setProperty("--site-bg", bg); else ROOT.style.removeProperty("--site-bg");
  // 배경 이미지가 깔린 사이트는 투명하게 두어 이미지가 비치게, 아니면 같은 색을 직접 칠해 경계가 안 보이게
  ROOT.classList.toggle("solid-bg", !!bg && !(backdrop && backdrop.image));
}

// ── 오른쪽 편집 서랍 자리
//    LOPE 는 서랍(접힘 48px · 펼침 390+40px)을 화면 위에 덮어 그리고 이 페이지에는 알려주지 않는다.
//    마우스가 오른쪽에서 이 페이지로 들어오는 자리 = 가리는 판의 왼쪽 끝 → 그만큼 #frame 을 좁힌다.
let rsv = 0, rsvMode = "auto";
const RAIL = 48, DRAWER = () => Math.min(390, Math.round(window.innerWidth * .92)) + 40;
function setRsv(px){
  px = Math.max(0, Math.min(Math.round(window.innerWidth * .6), Math.round(px)));
  if (Math.abs(px - rsv) < 8 && px !== 0) return;
  rsv = px;
  ROOT.style.setProperty("--rsv", px + "px");
  layoutSafe();
}
function guessRsv(x, dirX, dirY){
  if (!EDITING || rsvMode !== "auto" || window.innerWidth < 760) return;
  if ((dirX || dirY) && !(dirX > 0 && Math.abs(dirX) >= Math.abs(dirY))) return;   // 오른쪽 경계를 넘을 때만 믿는다
  const gap = window.innerWidth - x;
  if (gap < 20) setRsv(0);
  else if (gap < 140) setRsv(RAIL);
  else if (gap < DRAWER() + 90) setRsv(gap > DRAWER() - 70 ? DRAWER() : gap);
}
let outside = true;
document.addEventListener("mouseout", (e) => { if (!e.relatedTarget){ outside = true; guessRsv(e.clientX, e.movementX || 0, e.movementY || 0); } });
document.addEventListener("mousemove", (e) => { if (!outside) return; outside = false; guessRsv(e.clientX, -(e.movementX || 0), -(e.movementY || 0)); }, { passive: true });
function cycleRsv(btn){
  const order = ["auto", "rail", "open", "none"], lab = { auto: "자동", rail: "접힘", open: "펼침", none: "없음" };
  rsvMode = order[(order.indexOf(rsvMode) + 1) % order.length];
  if (rsvMode === "rail") setRsv(RAIL); else if (rsvMode === "open") setRsv(DRAWER()); else if (rsvMode === "none") setRsv(0); else setRsv(window.innerWidth >= 760 ? RAIL : 0);
  if (btn) btn.textContent = "편집창 자리: " + lab[rsvMode];
}

// ── 스킨 메뉴 단추가 가리는 위쪽 높이
//    PV(IF ARCHIVE) 스킨은 1600×900 무대를 화면에 맞춰 늘이고, 오른쪽 위에 MENU 단추(높이 68, 폰 46)를 띄운다.
function layoutSafe(){
  let top = 0;
  const manual = Number(SET.safeTop) || 0;
  if (manual > 0) top = manual;
  else if (SKIN === "pv"){
    const W0 = window.innerWidth, sw = W0 - rsv, sh = window.innerHeight;
    const phone = W0 < 760 || W0 / sh < 0.85;
    if (phone){ const W = sw <= 480 ? Math.max(360, sw) : Math.round(Math.min(600, Math.max(480, sw / 1.5))); top = 46 * (sw / W); }
    else top = 68 * Math.min(sw / 1600, sh / 900);
    top = Math.ceil(top) + 6;
  }
  ROOT.style.setProperty("--safe-top", top + "px");
}
window.addEventListener("resize", layoutSafe);

// ── LOPE 서버에 사진 올리기 (사이트 데이터에 글자로 박지 않고 주소만 남김)
const CAN_UPLOAD = EDITING;
function lopeUpload(multiple){
  return new Promise(res => {
    const requestId = uid();
    const on = (ev) => {
      const d = ev.data || {};
      if (ev.source !== parent || d.type !== "lope-html-page-images-added" || d.requestId !== requestId) return;
      window.removeEventListener("message", on);
      res(arr(d.images).map(x => str(x && x.url)).filter(isUrl));
    };
    window.addEventListener("message", on);
    toLope({ type: "lope-html-page-add-images", requestId, multiple: !!multiple });
  });
}
async function pickImages(multiple, max){
  if (CAN_UPLOAD) return lopeUpload(multiple);
  const f = await pickFile("image/*");
  if (!f) return [];
  return [await fileToImage(f, max || 1000)];
}

// ── LOPE 에서 오는 소식
window.addEventListener("message", (ev) => {
  if (ev.source !== parent) return;
  const d = ev.data || {};
  if (d.type === "lope-html-page-backdrop" && (!d.pageId || d.pageId === L.pageId)){
    backdrop = { dark: !!d.dark, color: str(d.color), image: !!d.image };
    applyMode();
  } else if (d.type === "lope-settings-update" && String(d.id) === String(L.pageId)){
    SET = Object.assign(SET, d.settings || {});
    applySettings();
    if (cur && cur.view === "library") go("library", {}, false);
  } else if (d.type === "lope-html-page-saved" && d.pageId === L.pageId){
    toast("사이트에 저장했어요.");
  }
});

/* ═══════════════════════ 시작 ═══════════════════════ */
document.head.appendChild(h("style", { text: NV_CSS + `.ed.nv .sp{ background:var(--blue-soft); outline:1px dashed var(--blue); } .ed.nv details > :not(summary){ outline:1px dashed var(--line); }` }));
const t0 = str(SET.bigTitle) || str(lib.title); if (t0) document.title = t0 + ((str(SET.smallTitle) || lib.sub) ? " " + (str(SET.smallTitle) || lib.sub) : "");
if (EDITING && window.innerWidth >= 760) setRsv(RAIL);
applySettings();
toLope({ type: "lope-html-page-backdrop" });
// 저장 직후 LOPE 가 페이지를 새로 열었으면 보던 화면으로 (주인만, 2분 안)
const resume = EDITING && lib.resume && Date.now() - (lib.resume.at || 0) < 120000 ? lib.resume : null;
delete lib.resume;
if (resume && VIEWS[resume.view]){ go("library", {}, false); go(resume.view, resume.params || {}); }
else go("library", {}, false);
if (recovered === true && EDITING) toast("예전 형식으로 저장된 서재를 되살렸어요. 한 번 '사이트에 저장'을 눌러 새 형식으로 바꿔 주세요.");
if (recovered === "broken" && EDITING) toast("저장된 서재를 읽지 못했어요. 백업 파일이 있다면 '백업 불러오기'로 되돌려 주세요.");
})();
