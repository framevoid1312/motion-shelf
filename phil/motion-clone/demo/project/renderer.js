// Pure function of time: drawFrame(t) sets every layer. Keyframe poses interpolate with optional per-segment ease.
function buildProject(){
const P=window.project,root=document.getElementById('root'),nodes={},items=[];
const E={linear:q=>q,out:q=>1-Math.pow(1-q,3),in:q=>q*q*q,inout:q=>q<.5?4*q*q*q:1-Math.pow(-2*q+2,3)/2,smooth:q=>q*q*(3-2*q),step:q=>q<1?0:1,
 back:q=>{const c=1.70158;return 1+(c+1)*Math.pow(q-1,3)+c*Math.pow(q-1,2)}};
for(const l of P.layers){
 const el=document.createElement('div');el.className='layer';el.id=l.id;l.style=l.style||{};
 if(l.kind==='path'){const ns='http://www.w3.org/2000/svg',svg=document.createElementNS(ns,'svg');svg.setAttribute('viewBox','0 0 100 100');svg.setAttribute('preserveAspectRatio','none');svg.style.cssText='width:100%;height:100%;overflow:visible;display:block';const p=document.createElementNS(ns,'path');p.setAttribute('d',l.path||'');p.setAttribute('vector-effect','non-scaling-stroke');svg.append(p);el.append(svg);
  for(const k of ['fill','stroke','strokeWidth','strokeLinecap','strokeLinejoin','strokeDasharray','strokeDashoffset'])if(l.style[k]!=null)p.style[k]=l.style[k];}
 else if(l.kind==='text')el.textContent=l.text||'';
 const st={...l.style};for(const k of ['fill','stroke','strokeWidth','strokeLinecap','strokeLinejoin','strokeDasharray','strokeDashoffset'])if(l.kind==='path')delete st[k];
 Object.assign(el.style,st);if(l.kind==='ellipse')el.style.borderRadius='50%';
 (nodes[l.parent]||root).append(el);nodes[l.id]=el;items.push([el,l]);
}
function draw(t){for(const [el,l] of items){const on=t>=l.start&&t<l.end;el.style.visibility=on?'':'hidden';if(!on)continue;
 const F=l.frames;let a=F[0],b=F[0];for(const f of F){if(f.t<=t){a=f;b=f;}else{b=f;break;}}
 let q=b.t===a.t?0:Math.max(0,Math.min(1,(t-a.t)/(b.t-a.t)));q=(E[a.ease||'linear']||E.linear)(q);
 const v=k=>{const d={opacity:1,rotation:0,reveal:1}[k]??0,x=a[k]??d,y=b[k]??d;return x+(y-x)*q;};
 const base=F[0],g=l.kind==='group',w=v('w'),h=v('h');
 Object.assign(el.style,{left:v('x')+'px',top:v('y')+'px',width:(g?base.w:w)+'px',height:(g?base.h:h)+'px',
  opacity:v('opacity')*Number(l.style.opacity??1),transformOrigin:g?'0 0':(l.style.transformOrigin||'center'),
  transform:'rotate('+v('rotation')+'deg)'+(g?' scale('+(w/base.w)+','+(h/base.h)+')':'')});
 if(l.kind==='text'){const r=v('reveal');el.textContent=r>=1?l.text:l.text.slice(0,Math.ceil(l.text.length*r));}
}}
window.drawFrame=draw;draw(0);
const qs=new URLSearchParams(location.search);if(qs.has('t'))draw(+qs.get('t'));
if(qs.has('play')){const t0=performance.now();(function loop(){draw(((performance.now()-t0)/1000)%P.duration);requestAnimationFrame(loop)})();}
if(window.gsap){const c={t:0};window.__timelines=window.__timelines||{};window.__timelines['rebuilt']=gsap.timeline({paused:true}).to(c,{t:P.duration,duration:P.duration,ease:'none',onUpdate:()=>draw(c.t)});}
}
