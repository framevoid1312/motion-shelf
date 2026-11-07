#!/usr/bin/env python3
"""Build the UI components section of Phil's Motion Shelf.

Each component lives in components/src/<slug>.html as:

    ---
    { "name": ..., "cat": ..., "order": n, "desc": ..., "tags": [...], "prompt": ... }
    ---
    <style> component css </style>
    component markup
    <script> component js </script>

This script
  1. wraps every source into a standalone, copy-pasteable components/<slug>.html
     (shared theme tokens + a tiny runtime: autoplay demo, pause, theme),
  2. writes components/index.json,
  3. injects the #components section, nav link and counts into index.html.

Run:  python3 tools/build_components.py
"""
import html
import json
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
SRC = ROOT / "components" / "src"
OUT = ROOT / "components"
INDEX = ROOT / "index.html"
REPO = "https://github.com/framevoid1312/motion-shelf"

CATS = ["Kinetic type", "Buttons & toggles", "Inputs & switches", "Loaders & feedback"]

LIGHT = ("--bg:#f6f7fa;--surface:#fff;--ink:#151821;--muted:#5b6172;--line:#d5d9e3;--chip:#e3e7f2;"
         "--accent:#2944d6;--on:#fff;--mark:#ffd84d;--good:#14915f;--bad:#d6453d;color-scheme:light")
DARK = ("--bg:#12141b;--surface:#1c1f2a;--ink:#e8eaf2;--muted:#9aa1b5;--line:#2c3142;--chip:#252a39;"
        "--accent:#8ea0ff;--on:#11131a;--mark:#e9c53a;--good:#3ecf8e;--bad:#ff6b61;color-scheme:dark")

BASE_CSS = f""":root{{{LIGHT};
--fd:"Big Shoulders Display","Arial Narrow",Impact,sans-serif;--fb:"Figtree",system-ui,-apple-system,"Segoe UI",sans-serif;--fm:"JetBrains Mono",ui-monospace,Consolas,monospace;
--spring:cubic-bezier(.34,1.56,.64,1);--out:cubic-bezier(.22,1,.36,1)}}
@media (prefers-color-scheme:dark){{:root:not([data-theme=light]){{{DARK}}}}}
:root[data-theme=dark]{{{DARK}}}
*{{box-sizing:border-box}}
html,body{{height:100%}}
body{{margin:0;display:grid;place-items:center;background:var(--bg);color:var(--ink);font:15px/1.5 var(--fb);overflow:hidden;-webkit-font-smoothing:antialiased;-webkit-tap-highlight-color:transparent;transition:background .3s,color .3s}}
button{{font:inherit;color:inherit}}
:focus-visible{{outline:2px solid var(--accent);outline-offset:3px}}
.cap{{position:fixed;left:0;right:0;bottom:14px;text-align:center;font:500 10.5px var(--fm);letter-spacing:.14em;text-transform:uppercase;color:var(--muted);pointer-events:none}}
.fc-paused *,.fc-paused *::before,.fc-paused *::after{{animation-play-state:paused!important}}"""

RUNTIME = r"""/* Motion Shelf runtime: autoplay demo when idle, pause when off-screen, theme */
(function(){
var q=new URLSearchParams(location.search),de=document.documentElement,th=q.get('theme');
if(th==='light'||th==='dark')de.dataset.theme=th;
var FC=window.FC={paused:false,idle:true,reduce:matchMedia('(prefers-reduced-motion: reduce)').matches&&!q.has('demo')};
var sleep=FC.sleep=function(ms){return new Promise(function(r){setTimeout(r,ms)})};
var to;FC.touch=function(){FC.idle=false;clearTimeout(to);to=setTimeout(function(){FC.idle=true},6000)};
['pointerdown','keydown','wheel'].forEach(function(n){addEventListener(n,function(e){if(e.isTrusted)FC.touch()},{passive:true,capture:true})});
addEventListener('message',function(e){var d=e.data;
  if(d==='fc:pause'||d==='fc:play'){FC.paused=d==='fc:pause';de.classList.toggle('fc-paused',FC.paused)}
  else if(d&&d.fcTheme){if(d.fcTheme==='auto')delete de.dataset.theme;else de.dataset.theme=d.fcTheme}});
FC.gate=async function(){while(FC.paused)await sleep(120)};
/* wait ms of un-paused time; resolves true if the demo should keep going */
FC.wait=async function(ms){var left=ms;while(left>0){var s=performance.now();await sleep(Math.min(left,60));if(!FC.paused)left-=performance.now()-s}return FC.idle};
FC.demo=function(fn){if(FC.reduce)return;(async function(){await FC.wait(450);for(;;){while(FC.paused||!FC.idle)await sleep(250);await fn()}})()};
FC.raf=function(fn){var last=performance.now(),t=0;function f(n){var dt=Math.min(n-last,64);last=n;if(!FC.paused){t+=dt;fn(t,dt)}requestAnimationFrame(f)}requestAnimationFrame(f)};
})();"""

FONTS = ("https://fonts.googleapis.com/css2?family=Big+Shoulders+Display:wght@100..900"
         "&family=Figtree:wght@300..900&family=JetBrains+Mono:wght@400;500;700&display=swap")


def parse(path):
    text = path.read_text(encoding="utf-8")
    m = re.match(r"---\s*\n(.*?)\n---\s*\n(.*)", text, re.S)
    if not m:
        sys.exit(f"{path.name}: missing --- meta --- header")
    meta = json.loads(m.group(1))
    body = m.group(2)
    css = "\n".join(re.findall(r"<style>(.*?)</style>", body, re.S)).strip()
    js = "\n".join(re.findall(r"<script>(.*?)</script>", body, re.S)).strip()
    markup = re.sub(r"<(style|script)>.*?</\1>", "", body, flags=re.S).strip()
    for k in ("name", "cat", "order", "desc", "tags", "prompt"):
        if k not in meta:
            sys.exit(f"{path.name}: meta is missing {k}")
    if meta["cat"] not in CATS:
        sys.exit(f"{path.name}: unknown category {meta['cat']}")
    meta["slug"] = path.stem
    return meta, css, markup, js


def standalone(meta, css, markup, js):
    return f"""<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>{html.escape(meta['name'])} · Motion Shelf UI components</title>
<!-- {html.escape(meta['desc'])}
     From Phil's Motion Shelf: {REPO} — free to use. -->
<link rel="stylesheet" href="{FONTS}">
<style>
{BASE_CSS}
/* --- {meta['slug']} --- */
{css}
</style></head><body>
{markup}
<script>
{RUNTIME}
</script>
<script>
{js}
</script>
</body></html>
"""


SECTION_CSS = r"""<style>
/* --- UI components --- */
.k-comp .cv{position:relative;aspect-ratio:4/3;background:var(--bg);border-bottom:1px solid var(--line)}
.k-comp .cv{overflow:hidden}
.k-comp .cv iframe{position:absolute;left:0;top:0;width:480px;height:360px;border:0;display:block;color-scheme:normal;transform-origin:0 0;transform:scale(var(--s,.66))}
.k-comp .cx{position:absolute;top:8px;right:8px;width:34px;height:34px;display:grid;place-items:center;border:1px solid var(--line);border-radius:6px;background:var(--surface);color:var(--ink);cursor:pointer;opacity:0;transform:translateY(-4px);transition:opacity .2s,transform .25s cubic-bezier(.22,1,.36,1)}
.k-comp:hover .cx,.k-comp .cx:focus-visible{opacity:1;transform:none}
@media (hover:none){.k-comp .cx{opacity:1;transform:none}}
.k-comp .acts button.ghost{font:600 13px var(--fb);background:transparent;color:var(--accent);border:1px solid var(--line);border-radius:4px;padding:5px 11px;cursor:pointer}
.k-comp .acts button.ghost:hover{border-color:var(--accent)}
.cchips{display:flex;flex-wrap:wrap;gap:6px;margin:-6px 0 18px}
.cchips button{font:600 13px var(--fb);color:var(--ink);background:var(--surface);border:1px solid var(--line);border-radius:999px;padding:6px 13px;cursor:pointer}
.cchips button small{font:11px var(--fm);color:var(--muted);margin-left:4px}
.cchips button[aria-pressed=true]{background:var(--ink);color:var(--bg);border-color:var(--ink)}
.cchips button[aria-pressed=true] small{color:inherit;opacity:.7}
.k-comp.off{display:none}
/* viewer */
.cvw{position:fixed;inset:0;z-index:50;display:grid;grid-template-columns:270px 1fr;background:var(--bg);color:var(--ink)}
.cvw[hidden]{display:none}
.cvw-open{overflow:hidden}
.cvs{border-right:1px solid var(--line);overflow:auto;padding:14px 10px 30px;background:var(--surface)}
.cvs h4{margin:18px 10px 6px;font:500 11px var(--fm);letter-spacing:.1em;text-transform:uppercase;color:var(--muted)}
.cvs .brand{display:flex;align-items:baseline;gap:8px;padding:2px 10px 4px;font:800 26px/1 var(--fd);text-transform:uppercase}
.cvs .brand small{font:11px var(--fm);color:var(--muted)}
.cvs a{display:flex;align-items:center;gap:9px;padding:6px 10px;border-radius:6px;color:var(--ink);text-decoration:none;font-size:14px}
.cvs a::before{content:"";width:6px;height:6px;border-radius:50%;background:var(--line);flex:none;transition:background .2s,transform .3s}
.cvs a:hover{background:var(--chip)}
.cvs a[aria-current=true]{background:var(--chip);font-weight:600}
.cvs a[aria-current=true]::before{background:var(--accent);transform:scale(1.4)}
.cvm{display:grid;grid-template-rows:auto minmax(0,1fr) auto;grid-template-columns:minmax(0,1fr);min-width:0;min-height:0}
.cvt{display:flex;align-items:center;gap:8px;padding:10px 14px;border-bottom:1px solid var(--line)}
.cvt .crumb{flex:1;min-width:0;font:500 12px var(--fm);color:var(--muted);text-transform:uppercase;letter-spacing:.08em;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.cvt .crumb b{color:var(--ink);font-weight:500}
.cvt button{height:34px;min-width:34px;padding:0 10px;display:inline-flex;align-items:center;justify-content:center;gap:6px;border:1px solid var(--line);border-radius:6px;background:var(--surface);color:var(--ink);font:600 13px var(--fb);cursor:pointer}
.cvt button:hover{border-color:var(--ink)}
.cvt .menu{display:none}
.cvstage{position:relative;min-height:0;background:var(--bg)}
.cvstage iframe{position:absolute;inset:0;width:100%;height:100%;border:0;opacity:1;transition:opacity .25s}
.cvstage iframe.ld{opacity:0}
.cvinfo{border-top:1px solid var(--line);background:var(--surface);display:grid;grid-template-columns:minmax(220px,1fr) minmax(0,1.6fr);gap:6px 28px;padding:16px 18px;max-height:40vh;min-height:0}
.cvinfo h3{margin:0 0 6px}
.cvinfo p{margin:0;color:var(--muted);font-size:14px}
.cvinfo .tags{margin-top:10px}
.cvcode{display:grid;grid-template-rows:auto 1fr;min-height:0}
.cvtabs{display:flex;gap:4px;align-items:center;margin-bottom:8px}
.cvtabs [role=tab]{font:600 13px var(--fb);background:transparent;color:var(--muted);border:0;border-radius:999px;padding:5px 12px;cursor:pointer}
.cvtabs [role=tab][aria-selected=true]{background:var(--chip);color:var(--ink)}
.cvtabs .copy{margin-left:auto}
.cvcode pre{margin:0;overflow:auto;font:12px/1.6 var(--fm);background:var(--bg);border:1px solid var(--line);border-radius:6px;padding:12px 14px;white-space:pre-wrap;word-break:break-word;min-height:0;max-height:calc(40vh - 80px)}
@media (max-width:860px){
 .cvw{grid-template-columns:minmax(0,1fr)}
 .cvs{position:absolute;inset:0 auto 0 0;width:min(300px,86vw);z-index:2;transform:translateX(-102%);transition:transform .35s cubic-bezier(.22,1,.36,1);box-shadow:0 0 0 100vmax rgba(0,0,0,0)}
 .cvw.menu-open .cvs{transform:none;box-shadow:0 0 0 100vmax rgba(0,0,0,.45)}
 .cvt .menu{display:inline-flex}
 .cvt .tl{display:none}
 .cvinfo{grid-template-columns:minmax(0,1fr);max-height:46vh;overflow:auto}
 .cvt{gap:6px;padding:8px 10px}
 .cvcode pre{max-height:none}
}
</style>"""

SECTION_JS = r"""<script>
(function(){
var data=JSON.parse(document.getElementById('comp-data').textContent),bySlug={};data.forEach(function(d,i){d.i=i;bySlug[d.slug]=d});
var sec=document.getElementById('components'),cards=[].slice.call(sec.querySelectorAll('.k-comp'));
function post(f,m){try{f.contentWindow.postMessage(m,'*')}catch(e){}}
/* pause previews that are off-screen */
var vis=new Map();
if('IntersectionObserver' in window){var io=new IntersectionObserver(function(es){es.forEach(function(e){var f=e.target.querySelector('iframe');vis.set(f,e.isIntersecting);post(f,e.isIntersecting&&!viewerOpen()?'fc:play':'fc:pause')})},{rootMargin:'120px'});cards.forEach(function(c){io.observe(c);c.querySelector('iframe').addEventListener('load',function(){post(this,vis.get(this)&&!viewerOpen()?'fc:play':'fc:pause')})})}
/* render previews at a 480px virtual size, scaled to the card */
function fit(c){var w=c.clientWidth,v=Math.max(480,w),f=c.querySelector('iframe');f.style.width=v+'px';f.style.height=v*.75+'px';f.style.setProperty('--s',w/v)}
var ro='ResizeObserver' in window?new ResizeObserver(function(es){es.forEach(function(e){fit(e.target)})}):null;
sec.querySelectorAll('.cv').forEach(function(c){fit(c);if(ro)ro.observe(c)});
/* category chips */
sec.querySelectorAll('.cchips button').forEach(function(b){b.addEventListener('click',function(){sec.querySelectorAll('.cchips button').forEach(function(x){x.setAttribute('aria-pressed',x===b)});var c=b.dataset.cat;cards.forEach(function(k){k.classList.toggle('off',!!c&&k.dataset.cat!==c)})})});
/* code cache + copy */
var codes={};
function code(slug){return codes[slug]||(codes[slug]=fetch('components/'+slug+'.html').then(function(r){if(!r.ok)throw 0;return r.text()}))}
function copyText(t,b){var old=b.textContent;function ok(){b.textContent='Copied';setTimeout(function(){b.textContent=old},1400)}
  if(navigator.clipboard&&navigator.clipboard.writeText)navigator.clipboard.writeText(t).then(ok,function(){b.textContent='Copy failed'});else b.textContent='Copy failed'}
sec.querySelectorAll('.ccode').forEach(function(b){b.addEventListener('click',function(){var s=b.closest('.k-comp').dataset.slug;code(s).then(function(t){copyText(t,b)},function(){b.textContent='Open source →'})})});
/* viewer */
var vw=document.getElementById('cvw'),fr=document.getElementById('cvf'),pre=document.getElementById('cvpre'),cur=null,tab='prompt',theme='auto',lastFocus=null;
var themes=['auto','light','dark'],tl={auto:'Theme: auto',light:'Theme: light',dark:'Theme: dark'};
function viewerOpen(){return !vw.hidden}
function list(){var h='<div class="brand">UI components <small>'+data.length+'</small></div>',cat='';
  data.forEach(function(d){if(d.cat!==cat){cat=d.cat;h+='<h4>'+cat+'</h4>'}h+='<a href="#c/'+d.slug+'" data-slug="'+d.slug+'">'+d.name.replace(/&/g,'&amp;')+'</a>'});
  document.getElementById('cvlist').innerHTML=h}
function fill(){pre.textContent='';if(tab==='prompt'){pre.textContent=cur.prompt}else{pre.textContent='Loading…';code(cur.slug).then(function(t){if(tab==='code')pre.textContent=t},function(){pre.textContent='Could not load the file. Open the source link instead.'})}
  vw.querySelectorAll('.cvtabs [role=tab]').forEach(function(b){b.setAttribute('aria-selected',b.dataset.tab===tab)})}
function show(slug){var d=bySlug[slug];if(!d)return;cur=d;
  if(vw.hidden){lastFocus=document.activeElement;vw.hidden=false;document.documentElement.classList.add('cvw-open');sec.querySelectorAll('.cv iframe').forEach(function(f){post(f,'fc:pause')});setTimeout(function(){vw.querySelector('.close').focus()},0)}
  fr.classList.add('ld');fr.src='components/'+slug+'.html'+(theme==='auto'?'':'?theme='+theme);
  vw.querySelector('.crumb').innerHTML=d.cat.replace(/&/g,'&amp;')+' / <b>'+d.name.replace(/&/g,'&amp;')+'</b> · '+(d.i+1)+' of '+data.length;
  vw.querySelector('.cvinfo h3').textContent=d.name;vw.querySelector('.cvinfo p').textContent=d.desc;
  vw.querySelector('.cvinfo .tags').innerHTML=d.tags.map(function(t){return '<span>'+t+'</span>'}).join('');
  vw.querySelector('.src').href='"""+REPO+r"""/blob/main/components/'+slug+'.html';
  vw.querySelectorAll('#cvlist a').forEach(function(a){var on=a.dataset.slug===slug;a.setAttribute('aria-current',on);if(on&&a.scrollIntoView)a.scrollIntoView({block:'nearest'})});
  vw.classList.remove('menu-open');fill()}
fr.addEventListener('load',function(){fr.classList.remove('ld')});
function close(){if(vw.hidden)return;vw.hidden=true;fr.src='about:blank';document.documentElement.classList.remove('cvw-open');history.replaceState(null,'',location.pathname+location.search+'#components');
  var c=cur&&document.getElementById('c-'+cur.slug);sec.querySelectorAll('.cv iframe').forEach(function(f){post(f,vis.get(f)?'fc:play':'fc:pause')});
  if(c){c.scrollIntoView({block:'center'});var b=c.querySelector('.cx');if(b)b.focus()}else if(lastFocus)lastFocus.focus()}
function step(n){var i=(cur.i+n+data.length)%data.length;location.hash='c/'+data[i].slug}
function route(){var m=location.hash.match(/^#c\/([\w-]+)/);if(m&&bySlug[m[1]])show(m[1]);else close()}
list();
vw.querySelector('.close').addEventListener('click',close);
vw.querySelector('.prev').addEventListener('click',function(){step(-1)});
vw.querySelector('.next').addEventListener('click',function(){step(1)});
vw.querySelector('.menu').addEventListener('click',function(){vw.classList.toggle('menu-open')});
vw.querySelector('.cvs').addEventListener('click',function(e){if(e.target.closest('a'))vw.classList.remove('menu-open')});
vw.querySelector('.thm').addEventListener('click',function(){theme=themes[(themes.indexOf(theme)+1)%3];this.textContent=tl[theme];post(fr,{fcTheme:theme})});
vw.querySelectorAll('.cvtabs [role=tab]').forEach(function(b){b.addEventListener('click',function(){tab=b.dataset.tab;fill()})});
vw.querySelector('.cvtabs .copy').addEventListener('click',function(){var b=this;if(tab==='prompt')copyText(cur.prompt,b);else code(cur.slug).then(function(t){copyText(t,b)})});
document.addEventListener('keydown',function(e){if(vw.hidden)return;if(e.key==='Escape'){e.preventDefault();close()}
  else if(!/INPUT|TEXTAREA|SELECT/.test(e.target.tagName)&&!e.metaKey&&!e.ctrlKey){if(e.key==='ArrowRight'||e.key==='j'){step(1)}else if(e.key==='ArrowLeft'||e.key==='k'){step(-1)}}
  else if(e.key==='Tab'){var f=[].slice.call(vw.querySelectorAll('a[href],button,iframe')).filter(function(x){return x.offsetParent!==null});if(!f.length)return;
    if(e.shiftKey&&document.activeElement===f[0]){e.preventDefault();f[f.length-1].focus()}else if(!e.shiftKey&&document.activeElement===f[f.length-1]){e.preventDefault();f[0].focus()}}});
document.addEventListener('keydown',function(e){if(vw.hidden||e.key!=='Tab')return;var f=[].slice.call(vw.querySelectorAll('a[href],button,iframe')).filter(function(x){return x.offsetParent!==null});if(!f.length)return;
  if(e.shiftKey&&document.activeElement===f[0]){e.preventDefault();f[f.length-1].focus()}else if(!e.shiftKey&&document.activeElement===f[f.length-1]){e.preventDefault();f[0].focus()}});
sec.querySelectorAll('.cx').forEach(function(b){b.addEventListener('click',function(){location.hash='c/'+b.closest('.k-comp').dataset.slug})});
addEventListener('hashchange',route);route();
})();
</script>"""


def esc(s):
    return html.escape(s, quote=True)


def card(d):
    tags = "".join(f"<span>{esc(t)}</span>" for t in d["tags"])
    return (
        f'<article class="card k-comp" id="c-{d["slug"]}" data-slug="{d["slug"]}" data-cat="{esc(d["cat"])}">'
        f'<div class="cv"><iframe src="components/{d["slug"]}.html" loading="lazy" title="{esc(d["name"])}: live preview"></iframe>'
        f'<button type="button" class="cx" aria-label="Open {esc(d["name"])} full screen">'
        '<svg width="15" height="15" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.7" aria-hidden="true"><path d="M10 2h4v4M6 14H2v-4M14 2 9.5 6.5M2 14l4.5-4.5"/></svg></button></div>'
        f'<div class="c"><div class="meta"><b>{esc(d["cat"])}</b><span>html · css · js</span></div>'
        f'<h3>{esc(d["name"])}</h3><p class="sub">{esc(d["desc"])}</p><div class="tags">{tags}</div>'
        f'<details class="rm"><summary>Prompt for Claude Design</summary><textarea readonly rows="9">{esc(d["prompt"])}</textarea></details>'
        f'<div class="acts"><button type="button" class="copy" hidden>Copy prompt</button>'
        f'<button type="button" class="ghost ccode">Copy code</button>'
        f'<a href="#c/{d["slug"]}">Full screen</a>'
        f'<a href="{REPO}/blob/main/components/{d["slug"]}.html" target="_blank" rel="noopener">Source</a></div></div></article>'
    )


def section(items):
    n = len(items)
    counts = {c: sum(1 for d in items if d["cat"] == c) for c in CATS}
    chips = f'<button type="button" aria-pressed="true" data-cat="">All<small>{n}</small></button>' + "".join(
        f'<button type="button" aria-pressed="false" data-cat="{esc(c)}">{esc(c)}<small>{counts[c]}</small></button>' for c in CATS if counts[c])
    manifest = json.dumps([{k: d[k] for k in ("slug", "name", "cat", "desc", "tags", "prompt")} for d in items],
                          ensure_ascii=False).replace("</", "<\\/")
    viewer = (
        '<div class="cvw" id="cvw" hidden role="dialog" aria-modal="true" aria-label="UI component viewer">'
        '<aside class="cvs" aria-label="All components"><nav id="cvlist"></nav></aside>'
        '<div class="cvm"><div class="cvt">'
        '<button type="button" class="menu" aria-label="Show component list"><svg width="16" height="16" viewBox="0 0 16 16" stroke="currentColor" stroke-width="1.7" aria-hidden="true"><path d="M2 4h12M2 8h12M2 12h12"/></svg></button>'
        '<span class="crumb"></span>'
        '<button type="button" class="thm tl">Theme: auto</button>'
        '<button type="button" class="prev" aria-label="Previous component">←</button>'
        '<button type="button" class="next" aria-label="Next component">→</button>'
        '<button type="button" class="close" aria-label="Close viewer">✕</button></div>'
        '<div class="cvstage"><iframe id="cvf" title="Component preview"></iframe></div>'
        '<div class="cvinfo"><div><h3></h3><p></p><div class="tags"></div>'
        '<p style="margin-top:10px"><a class="src" target="_blank" rel="noopener">Source file on GitHub</a></p></div>'
        '<div class="cvcode"><div class="cvtabs" role="tablist"><button type="button" role="tab" data-tab="prompt" aria-selected="true">Prompt</button>'
        '<button type="button" role="tab" data-tab="code" aria-selected="false">Code</button><button type="button" class="copy">Copy</button></div>'
        '<pre id="cvpre"></pre></div></div></div></div>'
    )
    return (
        "<!-- components:start (generated by tools/build_components.py; edit components/src instead) -->"
        + SECTION_CSS
        + f'<section class="sec pad" id="components"><div class="sh"><h2>UI components</h2><span class="cnt">{n}</span></div>'
        '<p class="blurb">Live, animated UI pieces you can play with right here: kinetic type, buttons, inputs and loaders. '
        'Each one is a single self-contained HTML file with a prompt you can paste into Claude Design, the code, and a full-screen view. '
        'Made for the Shelf with Claude; the idea comes from <a href="https://forevercomponents.com" target="_blank" rel="noopener">Forever Components</a>.</p>'
        f'<div class="cchips" role="group" aria-label="Filter components">{chips}</div>'
        f'<div class="wall">{"".join(card(d) for d in items)}</div></section>'
        + viewer
        + f'<script type="application/json" id="comp-data">{manifest}</script>'
        + SECTION_JS
        + "<!-- components:end -->"
    )


def inject(items):
    page = INDEX.read_text(encoding="utf-8")
    block = section(items)
    if "<!-- components:start" in page:
        page = re.sub(r"<!-- components:start.*?<!-- components:end -->", lambda m: block, page, flags=re.S)
    else:
        anchor = '<section class="sec pad" id="phil"'
        if anchor not in page:
            sys.exit("index.html: cannot find the #phil section to insert before")
        page = page.replace(anchor, block + anchor, 1)
    # nav link
    n = len(items)
    link = f'<a href="#components">UI components <small>{n}</small></a>'
    if 'href="#components"' in page:
        page = re.sub(r'<a href="#components">UI components <small>\d+</small></a>', link, page)
    else:
        page = page.replace('<a href="#phil">', link + '<a href="#phil">', 1)
    # lede counts
    nav = re.search(r'<nav class="bar pad".*?</nav>', page, re.S).group(0)
    total = sum(int(x.replace(",", "")) for x in re.findall(r"<small>([\d,]+)</small>", nav))
    page = re.sub(r"<b>[\d,]+</b> free things", f"<b>{total:,}</b> free things", page, count=1)
    page = re.sub(r"(\d+) skill files(?: and|,) (\d+) HyperFrames blocks(?: and \d+ live UI components)?\.",
                  lambda m: f"{m.group(1)} skill files, {m.group(2)} HyperFrames blocks and {n} live UI components.",
                  page, count=1)
    INDEX.write_text(page, encoding="utf-8")


def main():
    srcs = sorted(SRC.glob("*.html"))
    if not srcs:
        sys.exit("no sources in components/src")
    items = []
    for p in srcs:
        meta, css, markup, js = parse(p)
        (OUT / f"{meta['slug']}.html").write_text(standalone(meta, css, markup, js), encoding="utf-8")
        items.append(meta)
    items.sort(key=lambda d: (CATS.index(d["cat"]), d["order"], d["name"]))
    (OUT / "index.json").write_text(json.dumps(
        [{k: d[k] for k in ("slug", "name", "cat", "desc", "tags", "prompt")} for d in items],
        ensure_ascii=False, indent=1) + "\n", encoding="utf-8")
    inject(items)
    print(f"built {len(items)} components")


if __name__ == "__main__":
    main()
