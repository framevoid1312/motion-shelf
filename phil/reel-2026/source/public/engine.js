
// ================= constants =================
const W=1920,H=1080,BEAT=0.4,PI=Math.PI;const S=env.S;
const LIME='#9cfa0a',BLUE='#1d0ff7',INK='#070707',WHITE='#f2f2ee',GREY='#7d7d78';
const C_LIME=[0.612,0.98,0.039],C_BLUE=[0.114,0.059,0.969],C_INK=[0.027,0.027,0.027],C_WHITE=[0.95,0.95,0.93];
const bgC=env.bg,fgC=env.fg,glC=env.gl;
[bgC,fgC,glC].forEach(c=>{c.width=Math.round(W*S);c.height=Math.round(H*S);c.style.width=c.width+'px';c.style.height=c.height+'px'});
const gb=bgC.getContext('2d'),gf=fgC.getContext('2d');

// ================= math =================
function hash(n){n=Math.imul((n|0)^0x9e3779b9,0x85ebca6b);n^=n>>>13;n=Math.imul(n,0xc2b2ae35);n^=n>>>16;return (n>>>0)/4294967296}
function spr(t,t0,w=18,z=1){const x=t-t0;if(x<=0)return 0;
  if(z>=1)return 1-(1+w*x)*Math.exp(-w*x);
  const wd=w*Math.sqrt(1-z*z);return 1-Math.exp(-z*w*x)*(Math.cos(wd*x)+z*w/wd*Math.sin(wd*x));}
const snap=(t,t0)=>spr(t,t0,26,0.8), heavy=(t,t0)=>spr(t,t0,14,1), soft=(t,t0)=>spr(t,t0,9,1), play=(t,t0)=>spr(t,t0,16,0.55);
// value through several targets; one spring per change, each starting at its own time
function track(t,keys,fn=(tt,t0)=>spr(tt,t0,16,0.9)){let v=keys[0][1];for(let i=1;i<keys.length;i++)v+=(keys[i][1]-keys[i-1][1])*fn(t,keys[i][0]);return v}
const lerp=(a,b,u)=>a+(b-a)*u, clamp=(x,a=0,b=1)=>Math.max(a,Math.min(b,x));
const pulse=t=>Math.exp(-((t%BEAT+BEAT)%BEAT)*10);       // kick on every beat
// drop with gravity + decaying bounces; returns {y (0 = rest, negative = up), sq (squash amount)}
function drop(t,t0,h){const x=t-t0;if(x<0)return{y:-h-2000,sq:0};
  const tf=0.30;if(x<tf){const u=x/tf;return{y:-h*(1-u*u),sq:-0.25*u*u}}
  const y2=x-tf;const b1=0.24,b2=0.13;
  let y=0;if(y2<b1)y=-h*0.22*Math.sin(PI*y2/b1);else if(y2<b1+b2)y=-h*0.06*Math.sin(PI*(y2-b1)/b2);
  const sq=0.55*Math.exp(-Math.pow(y2/0.045,2))+0.25*Math.exp(-Math.pow((y2-b1)/0.035,2));
  return{y,sq};}

// ================= camera =================
let CAM={x:0,y:0,z:1,r:0};
function camM(d=1){const z=1+(CAM.z-1)*d;return new DOMMatrix().scale(S).translate(W/2,H/2).rotate(CAM.r*180/PI).scale(z).translate(-CAM.x*d,-CAM.y*d)}
const mscale=m=>Math.hypot(m.a,m.b);

// ================= blobs (GPU metaballs) =================
let BL=[],BK=40;
function blob(m,ax,ay,bx,by,r,col){if(r<=0.01)return;const p=m.transformPoint({x:ax,y:ay}),q=m.transformPoint({x:bx,y:by});BL.push([p.x,p.y,q.x,q.y,r*mscale(m),col])}
const dot=(m,x,y,r,col)=>blob(m,x,y,x,y,r,col);
// squashable dot: sq>0 → wide & flat, sq<0 → tall
function sdot(m,x,y,r,sq,col){if(sq>=0){const hw=r*sq,rr=r*(1-sq*0.45);blob(m,x-hw,y+r-rr,x+hw,y+r-rr,rr,col)}else{const hh=r*(-sq),rr=r*(1+sq*0.3);blob(m,x,y-hh,x,y+hh,rr,col)}}

// ================= 2D helpers =================
function fillAll(g,col){g.setTransform(1,0,0,1,0,0);g.fillStyle=col;g.fillRect(0,0,W,H)}
function line(g,x1,y1,x2,y2,col,lw=2){g.strokeStyle=col;g.lineWidth=lw;g.beginPath();g.moveTo(x1,y1);g.lineTo(x2,y2);g.stroke()}
function mono(g,s,x,y,col,size=14,w=500,align='left'){g.font=`${w} ${size}px GM`;g.letterSpacing='1px';g.textAlign=align;g.fillStyle=col;g.fillText(s,x,y);g.letterSpacing='0px';g.textAlign='left'}
const SCR='?%#:/<*;+=!^&$0';
function decode(str,t,t0,per=0.035){if(t<t0)return '';const n=Math.floor((t-t0)/per);let o='';
  for(let i=0;i<str.length;i++){if(i<n||str[i]===' ')o+=str[i];else if(i<n+3)o+=SCR[Math.floor(hash(i*131+Math.floor(t*30))*SCR.length)];else break}return o}
// particle field: world-tiled specks, parallax by depth
function specks(g,seed,n,depth,col,size=2.5,kind='dot'){const m=camM(depth);g.setTransform(m);const T=2600;
  for(let i=0;i<n;i++){let x=hash(seed+i*3)*T-T/2,y=hash(seed+i*3+1)*T-T/2;
    x+=Math.round((CAM.x*depth-x)/T)*T;y+=Math.round((CAM.y*depth-y)/T)*T;
    g.fillStyle=col;g.strokeStyle=col;
    if(kind==='plus'&&hash(seed+i*3+2)<0.4){g.lineWidth=1.5;g.beginPath();g.moveTo(x-6,y);g.lineTo(x+6,y);g.moveTo(x,y-6);g.lineTo(x,y+6);g.stroke()}
    else{g.beginPath();g.arc(x,y,size*(0.5+hash(seed+i*3+2)),0,7);g.fill()}}}

// ================= Piqo-style type assembly =================
const FINAL=size=>`700 ${size}px IT`, MID=size=>`500 ${size}px GM`;
function layout(g,str,size,ls){g.font=FINAL(size);g.letterSpacing=ls+'px';const xs=[];for(let i=0;i<=str.length;i++)xs.push(g.measureText(str.slice(0,i)).width);g.letterSpacing='0px';return xs}
// draws `str` assembling from primitives (bars, stems, dots) → stretched mono → final face.
// opts: ls, align, t1 (start of disassembly), dots (callback per char when collapsing to blobs), seed
function assemble(g,m,str,x,y,size,col,t,t0,o={}){
  const ls=o.ls??-size*0.04, seed=o.seed??7, spread=o.spread??0.22;
  const xs=layout(g,str,size,ls), tw=xs[str.length];
  const x0=o.align==='center'?x-tw/2:x;
  g.setTransform(m);
  const out=[];
  // word underscores (sweep in, sweep out)
  let ws=0;for(let i=0;i<=str.length;i++){if(i===str.length||str[i]===' '){if(i>ws){const a=x0+xs[ws],b=x0+xs[i];const d=t0+ws*0.028;
        const grow=snap(t,d-0.05),shrink=snap(t,d+0.28);const L=a+(b-a)*shrink,R=a+(b-a)*grow;
        if(R-L>1&&t<d+0.8){g.fillStyle=col;g.fillRect(L,y+size*0.1,R-L,Math.max(3,size*0.045))}}ws=i+1}}
  for(let i=0;i<str.length;i++){const ch=str[i];if(ch===' ')continue;
    const h=hash(i*97+seed*13),h2=hash(i*53+seed*7+1);
    const d=t0+i*0.028+h*spread, lt=t-d;
    const cx=x0+(xs[i]+xs[i+1])/2, w=xs[i+1]-xs[i];
    // disassembly
    if(o.t1!==undefined){const d1=o.t1+i*0.018+h2*0.12,lo=t-d1;
      if(lo>0){ if(o.dots){out.push({i,cx,cy:y-size*0.35,lo,h});continue}
        if(lo<0.09){g.save();g.translate(cx,y);g.scale(1+lo*14,1);g.font=MID(size);g.fillStyle=col;g.textAlign='center';g.fillText(ch,0,0);g.restore();continue}
        if(lo<0.18){g.fillStyle=col;g.fillRect(cx-w*1.4,y-size*0.04,w*2.8*(1-(lo-0.09)/0.09),size*0.07);continue}
        continue;}}
    if(lt<0){if(lt>-0.14&&h<0.45){g.fillStyle=col;g.beginPath();g.arc(cx,y-size*(0.2+h),size*0.045,0,7);g.fill()}continue}
    const k=Math.floor(h2*3);
    if(lt<0.1){const u=lt/0.1;g.fillStyle=col;
      if(k===0){const bw=w*2.4*(1-u*0.55);g.fillRect(cx-bw/2,y-size*0.04,bw,size*0.07)}
      else if(k===1){const sh=size*0.72;g.fillRect(cx-size*0.045,y-sh-size*0.45*(1-u),size*0.09,sh)}
      else{g.beginPath();g.arc(cx,y-size*0.35-size*0.3*(1-u),size*0.085,0,7);g.fill()}
      continue}
    if(lt<0.3){const u=spr(t,d+0.1,22,1);const sx=lerp(2.3,1,u),dy=(h>0.5?-1:1)*size*0.22*(1-u);
      g.save();g.translate(cx,y+dy);g.scale(sx,1);g.font=MID(size*1.02);g.fillStyle=col;g.textAlign='center';g.fillText(ch,0,0);g.restore();continue}
    g.font=FINAL(size);g.fillStyle=col;g.textAlign='center';g.fillText(ch,cx,y);g.textAlign='left';
  }
  return {xs,x0,tw,out};
}


// ======================= pro easing =======================
const P=(t,a,b)=>clamp((t-a)/(b-a));
const oX=p=>p>=1?1:1-Math.pow(2,-10*p);            // easeOutExpo
const iX=p=>p<=0?0:Math.pow(2,10*p-10);             // easeInExpo
const ioX=p=>p<=0?0:p>=1?1:p<0.5?Math.pow(2,20*p-10)/2:(2-Math.pow(2,-20*p+10))/2;
const oQ=p=>1-Math.pow(1-p,5), iC=p=>p*p*p;
const G=()=>gb;                                     // single drawing surface
function base(){return new DOMMatrix().scale(S)}
function clipRect(g,m,x,y,w,h){g.setTransform(m);g.beginPath();g.rect(x,y,w,h);g.clip()}
function bgFill(col){gb.setTransform(1,0,0,1,0,0);gb.fillStyle=col;gb.fillRect(0,0,W,H)}
function rect(g,m,x,y,w,h,col){g.setTransform(m);g.fillStyle=col;g.fillRect(x,y,w,h)}

// mask reveal: each glyph rises from behind its own baseline mask; t1 = exit (glyphs drop away)
function maskText(g,m,str,x,y,size,col,t,t0,o={}){
  const ls=o.ls??-size*0.045, st=o.st??0.035, dur=o.dur??0.55;
  const xs=layout(g,str,size,ls),tw=xs[str.length];const x0=o.align==='center'?x-tw/2:o.align==='right'?x-tw:x;
  for(let i=0;i<str.length;i++){if(str[i]===' ')continue;
    const p=oX(P(t,t0+i*st,t0+i*st+dur));if(p<=0)continue;
    let off=size*1.05*(1-p);
    if(o.t1!==undefined){const q=iX(P(t,o.t1+i*st*0.6,o.t1+i*st*0.6+0.32));off-=size*1.05*q}
    g.save();clipRect(g,m,x0+xs[i]-size*0.1,y-size*0.86,xs[i+1]-xs[i]+size*0.2,size*1.02);
    g.font=FINAL(size);g.fillStyle=col;g.fillText(str[i],x0+xs[i]-ls*0,y+off);g.restore();}
  return {x0,tw};
}
function marquee(g,m,str,y,size,speed,t,col,stroke){g.setTransform(m);g.font=FINAL(size);g.letterSpacing=(-size*0.04)+'px';
  const w=g.measureText(str).width;let x=((t*speed)%w+w)%w-w-1200;
  for(;x<W+1200;x+=w){if(stroke){g.strokeStyle=col;g.lineWidth=2;g.strokeText(str,x,y)}else{g.fillStyle=col;g.fillText(str,x,y)}}g.letterSpacing='0px'}

// ======================= slot decode (digits → letters) =======================
const GLY='?%#/<*;+=!&$@ABCDEFGHKLMNPRSTUVXZ0123456789';
function decodeSlots(g,m,from,to,cx,cy,size,t,t0){
  g.font=FINAL(size);const cw=g.measureText('0').width*0.98;const x0=cx-cw*from.length/2;
  const order=[2,0,3,1];   // resolve out of order, like the reference
  for(let i=0;i<from.length;i++){const xc=x0+i*cw+cw/2;
    const ts=t0+order[i]*0.035, te=t0+0.42+order[i]*0.13;      // scramble window, then lands
    const fr=Math.floor(t*24);const h=hash(i*31+fr*7);
    g.setTransform(m);g.textAlign='center';
    if(t<ts){g.font=FINAL(size);g.fillStyle=WHITE;g.fillText(from[i],xc,cy)}
    else if(t<te){
      if(h<0.16){}                                                   // slot blinks empty
      else if(h<0.3){g.fillStyle=WHITE;g.fillRect(xc-cw*0.4,cy-size*0.72,cw*0.8,size*0.72)}   // solid block
      else if(h<0.55){g.font=MID(size*0.95);g.fillStyle=WHITE;g.fillText(GLY[Math.floor(hash(i*7+fr)*GLY.length)],xc,cy)}  // mono glyph
      else{g.save();g.translate(xc,cy);g.scale(1+hash(fr+i)*0.8,1);g.font=FINAL(size);g.fillStyle=WHITE;g.fillText(GLY[Math.floor(hash(i*13+fr*3)*GLY.length)],0,0);g.restore()}
    } else {
      const land=t-te;
      if(land<0.06){g.fillStyle=WHITE;g.fillRect(xc-cw*0.42,cy-size*0.72,cw*0.84,size*0.72)}          // block where the letter lands
      else{const p=oX(P(t,te+0.06,te+0.4));g.save();clipRect(g,m,xc-cw,cy-size*0.85,cw*2,size*1.0);g.font=FINAL(size);g.fillStyle=WHITE;g.textAlign='center';g.fillText(to[i],xc,cy+size*0.25*(1-p));g.restore()}
    }
    g.textAlign='left';
  }
}

// ======================= the year counter =======================
const T0=0.5,T1=4.4,NY=37;const DUR=[];{let s=0;for(let i=1;i<=NY;i++){const d=0.045+0.32*Math.pow(1-Math.sin(PI*(i-1)/(NY-1)),2.6);DUR.push(d);s+=d}for(let i=0;i<NY;i++)DUR[i]*=(T1-T0)/s}
const TICK=[];{let a=T0;for(let i=0;i<NY;i++){TICK.push(a);a+=DUR[i]}}
function yearVal(t){if(t<T0)return 1989;if(t>=T1)return 2026;let i=0;while(i<NY-1&&TICK[i+1]<=t)i++;
  const roll=Math.min(0.14,DUR[i]*0.95);return 1989+i+oX(P(t,TICK[i],TICK[i]+roll))}
function decadeCol(y){return y>=2020?[INK,WHITE]:y>=2010?[LIME,BLUE]:y>=2000?[BLUE,LIME]:[INK,WHITE]}
// odometer: each column rolls, carries ride on the ones' fraction
function odometer(g,m,v,cx,cy,size,col,digits=4,o={}){
  g.font=FINAL(size);const cw=g.measureText('0').width*0.98;const x0=cx-cw*digits/2;const dh=size*0.92;
  const b=Math.floor(v),f=v-b;
  for(let k=0;k<digits;k++){const pw=Math.pow(10,digits-1-k);let pos=Math.floor(b/pw)%10;
    const low=b%pw;if(pw===1||low===pw-1)pos+=f;
    const n=Math.floor(pos),fr=pos-n;
    g.save();clipRect(g,m,x0+k*cw-4,cy-size*0.82,cw+8,size*0.98);g.fillStyle=col;g.textAlign='center';
    for(let j=-1;j<=2;j++){const dgt=((n+j)%10+10)%10;g.fillText(String(dgt),x0+k*cw+cw/2,cy-(fr-j)*dh)}
    g.restore();}
  return {x0,w:cw*digits};
}

function paint(t){
  BL=[];gb.textBaseline='alphabetic';gb.textAlign='left';
  const m0=base();

  // ===================== 0 – 4.4  COUNT 1989 → 2026 =====================
  if(t<4.8){
    const v=yearVal(t),yi=Math.floor(v+1e-6);
    // speed (years / s) drives camera push and streaks
    const sp=Math.abs(yearVal(t+0.01)-yearVal(t-0.01))/0.02;
    const [bgc,fgc]=t>=T1?[INK,WHITE]:decadeCol(yi);
    // decade wipe: new colour sweeps up over the old one
    let prevBg=bgc;const dec=[2000,2010,2020].find(d=>yi>=d&&yi<d+1)??null;
    bgFill(bgc);
    if(dec){const i=dec-1989-1,tt=TICK[i];const p=oX(P(t,tt,tt+0.16));const pb=decadeCol(dec-1)[0];gb.setTransform(m0);gb.fillStyle=pb;gb.fillRect(0,0,W,H*(1-p))}
    // slam: flash + shake
    const sl=t>=T1?Math.exp(-(t-T1)*9):0;
    const shake=sl*22*Math.sin((t-T1)*95);
    const z=1+0.10*clamp(sp/18)+0.12*oX(P(t,0,0.6))*0+0.1*sl;
    const m=m0.translate(W/2+shake,H/2+shake*0.4).scale(z*(t<0.5?lerp(1.15,1,oX(P(t,0,0.5))):1)).translate(-W/2,-H/2);
    if(t>=T1&&t<T1+0.07)bgFill(LIME);
    const dc=t>=T1&&t<T1+0.07?INK:fgc;
    // backdrop: giant outlined echo + ruler
    gb.setTransform(m);gb.font=FINAL(380);gb.strokeStyle=bgc===LIME?'rgba(29,15,247,0.14)':'rgba(255,255,255,0.06)';gb.lineWidth=2;gb.textAlign='center';
    gb.strokeText(String(Math.round(v)),W/2+((v-1989)*-24)%240,H/2+140);gb.textAlign='left';
    // year strip (top) — film strip of years scrolling with the count
    const STEP=150,sx=W/2-(v-1989)*STEP;
    for(let y=1989;y<=2026;y++){const x=sx+(y-1989)*STEP;if(x<-200||x>W+200)continue;const cur=y===yi;
      mono(gb,String(y),x,150,cur?(bgc===LIME?BLUE:LIME):(bgc===LIME?'rgba(29,15,247,0.55)':'rgba(255,255,255,0.4)'),cur?24:18,500,'center');
      line(gb,x,170,x,cur?196:182,cur?(bgc===LIME?BLUE:LIME):(bgc===LIME?'rgba(29,15,247,0.4)':'rgba(255,255,255,0.3)'),2)}
    // progress rail (bottom)
    const pr=(v-1989)/37;rect(gb,m,160,930,W-320,2,bgc===LIME?'rgba(29,15,247,0.35)':'rgba(255,255,255,0.25)');rect(gb,m,160,926,(W-320)*pr,10,fgc);
    mono(gb,'1989',160,905,fgc,16,500);mono(gb,'2026',W-160,905,fgc,16,500,'right');
    // the digits — rise in by mask at the start
    const intro=oX(P(t,0.05,0.6));
    gb.save();gb.setTransform(m);const dy=(1-intro)*170;
    const OD=odometer(gb,m.translate(0,dy),v,W/2,H/2+52,150,dc,4);gb.restore();
    // speed streaks while racing
    if(sp>6){const a=clamp((sp-6)/16)*0.5;gb.setTransform(m);for(let i=0;i<14;i++){const yy=H/2-260+hash(i*7)*460,ln=200+hash(i*3)*600,xx=((hash(i*5)*W*2-t*2600*(0.5+hash(i)))%(W+ln)+W+ln)%(W+ln)-ln;
      gb.fillStyle=bgc===LIME?`rgba(29,15,247,${a})`:`rgba(255,255,255,${a})`;gb.fillRect(xx,yy,ln,3)}}
    mono(gb,decode('COUNT / 1989 → 2026',t,0.2),OD.x0+2,H/2-96+dy,fgc,14,500);
    mono(gb,'Δ '+sp.toFixed(1)+' YR/S',OD.x0+OD.w-2,H/2-96+dy,fgc,14,500,'right');
  }

  // ===================== 4.8 – 7.2  REEL 2026 =====================
  if(t>=4.8&&t<6.85){
    const drawLock=(clipY,clipH,ox)=>{
      gb.save();gb.setTransform(m0);gb.beginPath();gb.rect(0,clipY,W,clipH);gb.clip();
      bgFill(INK);const m=m0.translate(ox,0);
      // marquee wall behind
      // 2026 decodes into REEL in place — Innate "Lockup in Motion" style
      lockDecode(gb,m,'2026','REEL',W/2,H/2+52,150,t,4.7,{mini:true});
      // lime bar + decoding line
      gb.restore();};
    if(t<6.6)drawLock(0,H,0);
    else{montage(t)}
    if(t>=6.6)return;
  }
  if(t>=6.85)montage(t);
}

// ======================= the rest =======================
function paintRest(t){
  const m0=base();
  // ---- R1 7.0–8.9: three editorial panels (bento), resize on beats, drop away ----
  if(t<8.95){
    if(t>8.6)paintR2(t);
    const wk=[[7.0,[1/3,1/3,1/3]],[8.0,[0.5,0.25,0.25]],[8.4,[0.22,0.48,0.30]]];
    const widths=[0,1,2].map(i=>track(t,wk.map(([tt,w])=>[tt,w[i]]),(tt,t0)=>oX(P(tt,t0,t0+0.45))));
    const cols=[[INK,WHITE,'DESIGN'],[BLUE,LIME,'MOTION'],[LIME,BLUE,'CODE']];let x=0;
    widths.forEach((w,i)=>{const pw=w*W;const drop=iX(P(t,8.6+i*0.06,8.95+i*0.06))*H*1.1;
      gb.save();gb.setTransform(m0);gb.beginPath();gb.rect(x,drop,pw+1,H);gb.clip();gb.fillStyle=cols[i][0];gb.fillRect(x,drop,pw+1,H);
      // vertical word, mask-revealed along its axis
      const m=m0.translate(x+pw/2+95,H-60+drop).rotate(-90);
      maskText(gb,m,cols[i][2],0,0,250,cols[i][1],t,7.15+i*0.18,{st:0.04,dur:0.5,ls:-10});
      gb.setTransform(m0);mono(gb,'0'+(i+1)+' /',x+30,60+drop,cols[i][1],18,500);gb.restore();x+=pw});
    return;
  }
  if(t<10.4){paintR2(t);return}
  if(t<12.0){paintR3(t);return}
  if(t<13.6){paintR4(t);return}
  if(t<15.2){paintR5(t);return}
  if(t<16.8){paintR6(t);return}
  paintR7(t);
}
// ---- R2 8.6–10.4: marquee wall, rows ignite on beats, accelerate into a lime row that swallows the frame ----
function paintR2(t){const m0=base();bgFill(INK);
  const acc=iX(P(t,9.95,10.4));const m=m0.translate(W/2,H/2).rotate(-7).scale(1.12+0.08*P(t,8.6,10.4)).translate(-W/2,-H/2);
  const lit=Math.floor((t-8.8)/BEAT);
  for(let r=0;r<15;r++){const y=-20+r*80;const dir=r%2?-1:1;const on=r===((lit*4)%15+15)%15&&t>8.8;
    const spd=dir*(380+r*40)*(1+acc*14);
    if(r===7&&t>9.95){const hgt=80+H*2.4*acc;rect(gb,m,-600,y-62-(hgt-80)/2,W+1200,hgt,LIME);marquee(gb,m,'MOTION · CODE · DESIGN · ',y,64,spd,t,BLUE,false);continue}
    marquee(gb,m,'MOTION · CODE · DESIGN · ',y,64,spd,t,on?LIME:'rgba(255,255,255,0.18)',false)}
}
// ---- R3 10.4–12.0: stats roll on an odometer, a black disc opens into the next shot ----
function paintR3(t){const m0=base();bgFill(LIME);const m=m0.translate(W/2,H/2).scale(1+0.04*P(t,10.4,12)).translate(-W/2,-H/2);
  const v=track(t,[[0,0],[10.45,150],[11.05,60],[11.45,0]],(tt,t0)=>oX(P(tt,t0,t0+0.5)));
  odometer(gb,m,v,W/2-120,H/2+190,520,BLUE,3);
  const labels=[['BPM',10.5],['FPS',11.05],['KEYFRAMES',11.45]];
  labels.forEach(([s,tt],i)=>{const nx=labels[i+1]?labels[i+1][1]:99;maskText(gb,m,s,W/2+430,H/2+190,110,BLUE,t,tt,{t1:nx-0.12,st:0.03,dur:0.4})});
  gb.setTransform(m);gb.save();gb.translate(W/2-120,H/2-30);gb.rotate(t*0.9);gb.strokeStyle=BLUE;gb.lineWidth=3;gb.setLineDash([14,14]);gb.beginPath();gb.arc(0,0,430,0,7);gb.stroke();gb.restore();
  rect(gb,m,160,H-150,(W-320)*oX(P(t,10.45,11.0)),8,BLUE);
  if(t>11.6){const r=oX(P(t,11.6,12.0))*1300;gb.save();gb.setTransform(m0);gb.beginPath();gb.arc(W/2,H/2,r,0,7);gb.clip();paintR4(t);gb.restore()}
}
// ---- R4 11.6–13.6: dot-matrix 2026, dots pop outward from centre, beat waves run through ----
const FONT5={0:['111','101','101','101','111'],2:['111','001','111','100','111'],6:['111','100','111','101','111']};
function paintR4(t){const m0=base();bgFill(INK);const m=m0.translate(W/2,H/2).scale(1.05+0.08*P(t,11.6,13.6)).rotate(-3*P(t,11.6,13.6)).translate(-W/2,-H/2);
  const digits=[2,0,2,6],SP=46,R=17;gb.setTransform(m);
  const out=iX(P(t,13.2,13.6));
  digits.forEach((d,k)=>FONT5[d].forEach((row,j)=>[...row].forEach((c,i)=>{const x=W/2+(k-1.5)*190+(i-1)*SP,y=H/2+(j-2)*SP;
    const dist=Math.hypot(x-W/2,y-H/2);const p=oX(P(t,11.8+dist*0.0006,12.2+dist*0.0006));
    const wave=Math.exp(-Math.pow((dist-((t-12.4)%0.8)*1400)/80,2))*(t>12.4?1:0);
    const on=c==='1';const r=(on?R*(1+0.45*wave):5)*p*(1-out);
    gb.fillStyle=on?(wave>0.4?LIME:WHITE):'#2a2a27';gb.beginPath();gb.arc(x,y,Math.max(0,r),0,7);gb.fill()})));
  mono(gb,decode('DOT DISPLAY / 5×7',t,12.3),W/2-380,H/2+190,'#8a8a86',18,500);
  if(t>13.3)paintR5(t,oX(P(t,13.3,13.75)));
}
// ---- R5 13.3–15.2: bento grid slides in, tiles swap, one tile takes the frame ----
function paintR5(t,introP){const m0=base();if(introP===undefined)bgFill(INK);
  const g=16,cw=(W-g*4)/3,ch=(H-g*3)/2;
  const tiles=[[BLUE,'wave'],[LIME,'big'],['#151513','chart'],['#f2f2ee','dots'],[INK,'ring'],[BLUE,'glyph']];
  let slots=[0,1,2,3,4,5];const sw=oX(P(t,14.4,14.85));
  const pos=i=>{const c=i%3,r=Math.floor(i/3);return[g+c*(cw+g),g+r*(ch+g)]};
  tiles.forEach(([col,kind],i)=>{let [x,y]=pos(i);
    if(i===0||i===4){const[a,b]=pos(i===0?4:0);x=lerp(x,a,sw);y=lerp(y,b,sw)}
    const d=13.3+i*0.05;const p=oX(P(t,d,d+0.55));const from=i%2?1:-1;let ox=from*(W*0.7)*(1-p);
    let w=cw,h=ch;
    if(i===1){const e=oX(P(t,14.8,15.2));x=lerp(x,0,e);y=lerp(y,0,e);w=lerp(cw,W,e);h=lerp(ch,H,e)}
    gb.save();gb.setTransform(m0.translate(ox,0));gb.beginPath();gb.roundRect(x,y,w,h,10*(1-(i===1?oX(P(t,14.8,15.2)):0)));gb.clip();gb.fillStyle=col;gb.fillRect(x,y,w,h);
    const cx=x+w/2,cy=y+h/2;gb.translate(cx,cy);const ink=(col===LIME||col==='#f2f2ee')?BLUE:WHITE;gb.strokeStyle=ink;gb.fillStyle=ink;gb.lineWidth=4;
    if(kind==='wave'){for(let k=0;k<40;k++){const xx=(k-19.5)*12,hh=8+90*Math.abs(Math.sin(k*0.5+t*12))*Math.sin(k/39*PI);gb.fillRect(xx-3,-hh,6,hh*2)}}
    if(kind==='big'){gb.font=FINAL(120);gb.textAlign='center';gb.fillText('26',0,42)}
    if(kind==='chart'){const pts=[-220,-120,-20,80,200];gb.beginPath();pts.forEach((px,k)=>{const py=60*Math.sin(k*1.3+t*4);k?gb.lineTo(px,py):gb.moveTo(px,py)});gb.strokeStyle=LIME;gb.stroke();pts.forEach((px,k)=>{gb.fillStyle=WHITE;gb.fillRect(px-8,60*Math.sin(k*1.3+t*4)-8,16,16)})}
    if(kind==='dots'){for(let a=0;a<7;a++)for(let b=0;b<4;b++){const on=hash(a*9+b*3+Math.floor(t/BEAT))<0.5;gb.beginPath();gb.arc((a-3)*52,(b-1.5)*52,on?18:6,0,7);gb.fill()}}
    if(kind==='ring'){gb.rotate(t*1.5);gb.beginPath();gb.arc(0,0,120,0,PI*1.5);gb.stroke();gb.setLineDash([8,10]);gb.beginPath();gb.arc(0,0,160,0,7);gb.stroke();gb.setLineDash([]);gb.fillStyle=LIME;gb.beginPath();gb.arc(0,0,30,0,7);gb.fill()}
    if(kind==='glyph'){['1110111','0011100','1111111','1001001'].forEach((r,j)=>[...r].forEach((c,k)=>{if(c==='1')gb.fillRect((k-3.5)*40,(j-2)*40,40,40)}))}
    gb.restore();
    gb.setTransform(m0.translate(ox,0));mono(gb,'0'+(i+1),x+22,y+40,ink,18,500)});
}
// ---- R6 15.2–16.8: one word per beat, hard cuts, each rides in on its mask and drifts ----
function paintR6(t){const m0=base();const words=[['MADE',LIME,BLUE],['IN',BLUE,WHITE],['CODE',INK,LIME],['2026',WHITE,INK]];
  const k=Math.min(3,Math.floor((t-15.2)/BEAT));const[wd,bg,fg]=words[k];bgFill(bg);const t0=15.2+k*BEAT;
  const m=m0.translate(W/2,H/2).scale(1.06-0.06*oX(P(t,t0,t0+0.4))).translate(-W/2,-H/2);
  const size=wd.length<=2?760:wd==='2026'?560:520;
  maskText(gb,m,wd,W/2,H/2+size*0.36,size,fg,t,t0,{align:'center',st:0.03,dur:0.32,ls:-size*0.05});
  gb.setTransform(m0);mono(gb,String(k+1).padStart(2,'0')+' / 04',80,H-70,fg,18,500);mono(gb,'150 BPM',W-80,H-70,fg,18,500,'right');}
// ---- R7 16.8–20: end card ----
function paintR7(t){const m0=base();bgFill(INK);const m=m0.translate(W/2,H/2).scale(1+0.03*P(t,16.8,20)).translate(-W/2,-H/2);
  const L=maskText(gb,m,'REEL',W/2-60,H/2+40,230,WHITE,t,16.85,{align:'right',st:0.04});
  gb.font=FINAL(230);gb.setTransform(m);
  odometer(gb,m,track(t,[[0,1989],[16.95,2026]],(tt,t0)=>oX(P(tt,t0,t0+0.9))),W/2+300,H/2+40,230,LIME,4);
  rect(gb,m,W/2-420,H/2+110,840*oX(P(t,17.3,17.8)),8,WHITE);
  gb.setTransform(m);mono(gb,decode('MOTION / CODE / DESIGN',t,17.5,0.02),W/2,H/2+170,'#8a8a86',20,500,'center');
}

// ======================= montage infrastructure =======================
let OFFM=new DOMMatrix();
base=function(){return new DOMMatrix().scale(S).multiply(OFFM)};
bgFill=function(col){gb.save();gb.setTransform(base());gb.fillStyle=col;gb.fillRect(-20,-20,W+40,H+40);gb.restore()};
// gooey metaball layer (blur + alpha threshold through an SVG filter)
const gooC=document.createElement('canvas');gooC.width=Math.round(W*S);gooC.height=Math.round(H*S);const gg=gooC.getContext('2d');
if(env.gooBlur)env.gooBlur.setAttribute('stdDeviation',String(12*S));
function goo(col,drawFn){gg.setTransform(1,0,0,1,0,0);gg.clearRect(0,0,gooC.width,gooC.height);gg.fillStyle=col;drawFn(gg);
  gb.save();gb.setTransform(1,0,0,1,0,0);gb.filter='url(#goo)';gb.drawImage(gooC,0,0);gb.filter='none';gb.restore()}
function circ(g,m,x,y,r){if(r<=0)return;g.setTransform(m);g.beginPath();g.arc(x,y,r,0,7);g.fill()}
function caps(g,m,x1,y1,x2,y2,r){g.setTransform(m);g.lineCap='round';g.lineWidth=2*r;g.strokeStyle=g.fillStyle;g.beginPath();g.moveTo(x1,y1);g.lineTo(x2,y2);g.stroke()}
function caption(t,s,n,title,sub,col){if(env.nocap)return;const m=base();gb.setTransform(m);
  mono(gb,decode(n+' — '+title,t,s+0.1,0.02),64,H-82,col,18,500);mono(gb,decode(sub,t,s+0.25,0.012),64,H-58,col==LIME||col==WHITE?'rgba(255,255,255,0.55)':col,15,400)}

// ----- V1 LIQUID: lime droplets on blue converge, merge, burst into a ring, orbit, collapse -----
function V1(t){const s=6.6,lt=t-s;bgFill(BLUE);const m=base().translate(W/2,H/2).scale(1+0.05*clamp(lt/2.8)).translate(-W/2,-H/2);
  goo(LIME,g=>{
    const pre=[[-900,-300],[880,-260],[-700,420],[760,380],[0,-620]];
    if(t<7.9){pre.forEach(([x,y],i)=>{const p=oX(P(t,s+i*0.07,s+0.75+i*0.07));const q=iX(P(t,7.35,7.9));const px=lerp(x,0,p),py=lerp(y,0,p);circ(g,m,W/2+px*(1-q),H/2+py*(1-q),lerp(85,140,q))})}
    const R0=t<7.9?0:270*oX(P(t,7.85,8.15))*(1-oX(P(t,8.35,8.6))*0.85);circ(g,m,W/2,H/2,R0);
    if(t>8.35){const N=8;for(let i=0;i<N;i++){const a=i/N*2*PI+ (t-8.35)*1.6*oX(P(t,8.6,9.0));const rad=400*oX(P(t,8.35,8.75))*(1-iX(P(t,9.05,9.4)));
      const st=0.45*oX(P(t,8.75,9.0))*(1-iX(P(t,9.0,9.3)));const r=58+12*Math.sin(t*8+i);
      const x=W/2+Math.cos(a)*rad,y=H/2+Math.sin(a)*rad;g.fillStyle=LIME;caps(g,m,x,y,W/2+Math.cos(a-st)*rad,H/2+Math.sin(a-st)*rad,r)}}
  });
  gb.setTransform(m);gb.strokeStyle='rgba(156,250,10,0.35)';gb.lineWidth=2;gb.setLineDash([6,10]);gb.beginPath();gb.arc(W/2,H/2,400*oX(P(t,8.3,8.8)),0,7);gb.stroke();gb.setLineDash([]);
  caption(t,s,'01','LIQUID SYSTEM','2D SIMULATION / METABALLS',LIME)}

// ----- V2 INTERFACE: dense HUD, every element on its own clock -----
function V2(t){const s=9.4;bgFill(INK);const m=base().translate(W/2,H/2).rotate(-4+3*P(t,s,s+2.4)).scale(1.3).translate(-W/2,-H/2);gb.setTransform(m);
  const cx=W/2-180,cy=H/2;gb.lineCap='butt';
  const ring=(r,a0,len,lw,col,spd,tt,dash)=>{const p=oX(P(t,tt,tt+0.5));if(p<=0)return;gb.save();gb.translate(cx,cy);gb.rotate(t*spd);if(dash)gb.setLineDash(dash);gb.strokeStyle=col;gb.lineWidth=lw;gb.beginPath();gb.arc(0,0,r,a0,a0+len*p);gb.stroke();gb.restore()};
  ring(90,0,2*PI,2,WHITE,0.9,s);ring(140,0,2*PI,2,WHITE,-1.4,s+0.08,[8,10]);ring(190,0,PI*1.3,18,LIME,0.6,s+0.16);ring(240,0,2*PI,1.5,'#555',-0.3,s+0.24,[2,6]);ring(290,1,PI*0.7,6,WHITE,1.8,s+0.32);
  gb.fillStyle=LIME;gb.beginPath();gb.arc(cx,cy,40*oX(P(t,s,s+0.3))*(1+0.15*pulse(t)),0,7);gb.fill();
  // radar sweep
  gb.save();gb.translate(cx,cy);gb.rotate(t*3);gb.fillStyle='rgba(156,250,10,0.18)';gb.beginPath();gb.moveTo(0,0);gb.arc(0,0,290*oX(P(t,s,s+0.5)),0,0.5);gb.fill();gb.restore();
  // bar chart panel
  const px=W/2+260,py=H/2-220;for(let i=0;i<12;i++){const hh=(40+180*hash(i*7+Math.floor(t/BEAT)*3))*oX(P(t,s+0.2+i*0.03,s+0.6+i*0.03));gb.fillStyle=i===7?LIME:WHITE;gb.fillRect(px+i*30,py+220-hh,18,hh)}
  // scrolling line graph
  gb.strokeStyle=WHITE;gb.lineWidth=2;gb.beginPath();for(let i=0;i<=60;i++){const x=px+i*6,y=H/2+170+40*Math.sin(i*0.35+t*7)*Math.sin(i*0.05+t);i?gb.lineTo(x,y):gb.moveTo(x,y)}gb.stroke();
  line(gb,px,H/2+60,px+370,H/2+60,'#444',1);
  mono(gb,'SIGNAL '+(50+40*Math.sin(t*5)).toFixed(2),px,H/2+110,WHITE,16,500);mono(gb,'LAT 37.94  LON 23.65',px,H/2+260,'#8a8a86',15);
  mono(gb,decode('SYS / ONLINE',t,s+0.3),cx-280,cy-320,LIME,16,500);for(let i=0;i<6;i++)mono(gb,(hash(i+Math.floor(t*12))*9999).toFixed(0).padStart(4,'0'),cx+320,cy-240+i*22,'#8a8a86',14);
  caption(t,s,'02','INTERFACE / HUD','MICROGRAPHICS SYSTEM',LIME)}

// ----- V3 POSTER: Swiss grid, blocks land on columns, giant cropped numerals -----
function V3(t){const s=11.8;bgFill(LIME);const m=base();gb.setTransform(m);
  const col=W/12;for(let i=1;i<12;i++)line(gb,i*col,0,i*col,H,'rgba(29,15,247,0.12)',1);
  gb.save();gb.font=FINAL(300);gb.letterSpacing='-14px';gb.fillStyle=BLUE;gb.fillText('35',col-8+(-80)*(1-oX(P(t,s,s+0.6))),H-150);gb.letterSpacing='0px';gb.restore();
  const blocks=[[7,1,3,2,BLUE],[10,1,2,5,INK],[7,4,3,1,WHITE],[8,6,4,2,BLUE]];
  blocks.forEach(([c,r,w,h,cl],i)=>{const d=s+0.15+i*0.1;const p=oX(P(t,d,d+0.5));const bx=c*col,by=r*H/9;const hop=(Math.floor((t-s)/BEAT)%4===i)?-20*Math.exp(-((t-s)%BEAT)*12):0;
    gb.fillStyle=cl;gb.fillRect(bx,by+hop,w*col*p,h*H/9)});
  gb.save();gb.beginPath();gb.rect(7*col,7.2*H/9,3*col*oX(P(t,s+0.5,s+1)),40);gb.clip();for(let x=7*col-60;x<10*col;x+=16)line(gb,x+((t*80)%16),7.2*H/9+50,x+((t*80)%16)+50,7.2*H/9-10,BLUE,3);gb.restore();
  for(let i=0;i<7;i++)mono(gb,decode(['MOTION DESIGN','REEL — 2026','150 BPM / 35 SEC','GRID 12 COL','ART DIRECTION','TYPE / LAYOUT','ATHENS — GR'][i],t,s+0.3+i*0.06,0.015),7*col+8,4.9*H/9+i*24,BLUE,16,500);
  // rotating stamp
  gb.save();gb.translate(10.9*col,2*H/9);gb.rotate(t*1.2);gb.scale(oX(P(t,s+0.4,s+0.8)),oX(P(t,s+0.4,s+0.8)));gb.fillStyle=LIME;gb.beginPath();gb.arc(0,0,105,0,7);gb.fill();
  const txt='MOTION DESIGN · REEL 2026 · ';gb.font='500 17px GM';gb.fillStyle=BLUE;for(let i=0;i<txt.length;i++){gb.save();gb.rotate(i/txt.length*2*PI);gb.fillText(txt[i],-5,-80);gb.restore()}gb.restore();
  caption(t,s,'03','EDITORIAL POSTER','SWISS GRID / KINETIC LAYOUT',BLUE)}

// ----- V4 ISOMETRIC: a field of columns rises, breathes on the beat, the whole city turns 90° -----
function V4(t){const s=14.2;bgFill(BLUE);const m=base();gb.setTransform(m);
  const yaw=PI/4+track(t,[[0,0],[s+1.2,PI/2]],(tt,t0)=>ioX(P(tt,t0,t0+0.6))),pitch=0.62,sc=112;
  const pr=(x,y,z)=>{const xr=x*Math.cos(yaw)-z*Math.sin(yaw),zr=x*Math.sin(yaw)+z*Math.cos(yaw);return[W/2+xr*sc,H/2+150-y*sc*0.85+zr*sc*Math.sin(pitch),zr]};
  const N=6,cubes=[];for(let i=0;i<N;i++)for(let j=0;j<N;j++){const d=Math.hypot(i-2.5,j-2.5);const up=oX(P(t,s+d*0.07,s+0.5+d*0.07));
    const beat=Math.floor((t-s)/BEAT);const hh=up*(0.4+3*hash(i*7+j*13+beat*5))*(1-iX(P(t,s+2.1,s+2.4)));cubes.push([i-2.5,j-2.5,hh,(i+j)%5===0])}
  cubes.forEach(c=>{c.push(pr(c[0],0,c[1])[2])});cubes.sort((a,b)=>a[4]-b[4]);
  cubes.forEach(([x,z,h,acc])=>{if(h<0.02)return;const s0=0.42;const v=[[-s0,-s0],[s0,-s0],[s0,s0],[-s0,s0]].map(([a,b])=>[x+a,z+b]);
    const faces=[];for(let k=0;k<4;k++){const a=v[k],b=v[(k+1)%4];const mid=pr((a[0]+b[0])/2,0,(a[1]+b[1])/2)[2];faces.push([a,b,mid,k])}
    faces.sort((p,q)=>p[2]-q[2]).slice(2).forEach(([a,b,_,k])=>{const p1=pr(a[0],0,a[1]),p2=pr(b[0],0,b[1]),p3=pr(b[0],h,b[1]),p4=pr(a[0],h,a[1]);
      gb.fillStyle=k%2?'#e9e9e4':(acc?'#6db400':'#b9b9b3');gb.beginPath();gb.moveTo(p1[0],p1[1]);gb.lineTo(p2[0],p2[1]);gb.lineTo(p3[0],p3[1]);gb.lineTo(p4[0],p4[1]);gb.fill()});
    gb.fillStyle=acc?LIME:WHITE;gb.beginPath();v.forEach(([a,b],k)=>{const p=pr(a,h,b);k?gb.lineTo(p[0],p[1]):gb.moveTo(p[0],p[1])});gb.fill()});
  caption(t,s,'04','ISOMETRIC CITY','PROCEDURAL / 36 COLUMNS',LIME)}

// ----- V5 HALFTONE: one dot field becomes a ring, a wave, a pill — morphing on the beat -----
function V5(t){const s=16.6;bgFill(LIME);const m=base().translate(W/2,H/2).rotate(8*Math.sin((t-s)*0.8)).scale(1.05).translate(-W/2,-H/2);gb.setTransform(m);gb.fillStyle=BLUE;
  const k=Math.min(3,Math.floor((t-s)/0.6)),mix=oX(P(t,s+k*0.6,s+k*0.6+0.35));
  const sdf=(id,x,y)=>{if(id===0)return Math.abs(Math.hypot(x,y)-260)-60;if(id===1)return Math.abs(y-120*Math.sin(x*0.008+t*4))-70;if(id===2)return Math.min(Math.hypot(x-200,y)-140,Math.hypot(x+200,y)-140,Math.max(Math.abs(x)-200,Math.abs(y)-50));return Math.hypot(x,y)-330};
  const SP=34;for(let y=-60;y<H+60;y+=SP)for(let x=-60;x<W+60;x+=SP){const dx=x-W/2,dy=y-H/2;const a=sdf(Math.max(0,k-1),dx,dy),b=sdf(k,dx,dy);const d=k===0?lerp(400,b,mix):lerp(a,b,mix);
    const u=clamp((30-d)/110),r=2.2+14*u*u*(3-2*u)+2*Math.max(0,Math.sin(Math.hypot(dx,dy)*0.03-(t-s)*10));gb.beginPath();gb.arc(x,y,r,0,7);gb.fill()}
  caption(t,s,'05','HALFTONE FIELD','SDF MORPHS / 1,900 DOTS',BLUE)}

// ----- V6 PRODUCT UI: phone, cards cascade, toggle flips on the beat, floating cards in parallax -----
function V6(t){const s=19.0;bgFill(INK);const lt=t-s;const m=base().translate(W/2,H/2).rotate(-6+4*clamp(lt/2.4)).scale(1.22+0.08*clamp(lt/2.4)).translate(-W/2,-H/2);gb.setTransform(m);
  const PW=380,PH=780,px=W/2-PW/2,py=H/2-PH/2+60*(1-oX(P(t,s,s+0.6)));
  gb.fillStyle='#1b1b19';gb.beginPath();gb.roundRect(px-14,py-14,PW+28,PH+28,58);gb.fill();gb.fillStyle='#f2f2ee';gb.beginPath();gb.roundRect(px,py,PW,PH,46);gb.fill();
  gb.save();gb.beginPath();gb.roundRect(px,py,PW,PH,46);gb.clip();
  gb.font=FINAL(44);gb.fillStyle=INK;gb.fillText('Reel',px+28,py+92);mono(gb,'MOTION / 2026',px+30,py+120,'#777',14,500);
  for(let i=0;i<4;i++){const d=s+0.25+i*0.08,p=oX(P(t,d,d+0.5));const cy=py+150+i*140+80*(1-p);gb.globalAlpha=1;
    gb.fillStyle=i===0?BLUE:i===2?LIME:'#e2e2dc';gb.beginPath();gb.roundRect(px+20,cy,PW-40,120,24);gb.fill();
    if(p>0.05){gb.fillStyle=i===0?WHITE:INK;gb.font=FINAL(26);gb.fillText(['Projects','Toggle','Progress','Stats'][i],px+44,cy+48);
      if(i===1){const on=Math.floor((t-s)/BEAT)%2===0;const k=oX(((t-s)%BEAT)/0.25);const kx=on?lerp(0,46,k):lerp(46,0,k);gb.fillStyle=on?LIME:'#bbb';gb.beginPath();gb.roundRect(px+PW-130,cy+40,92,46,23);gb.fill();gb.fillStyle=WHITE;gb.beginPath();gb.arc(px+PW-107+kx,cy+63,19,0,7);gb.fill()}
      if(i===2){gb.strokeStyle=BLUE;gb.lineWidth=8;gb.lineCap='round';gb.beginPath();gb.arc(px+PW-80,cy+60,30,-PI/2,-PI/2+2*PI*oX(P(t,s+0.6,s+1.8)));gb.stroke()}
      if(i===3){for(let b=0;b<7;b++){const hh=10+50*hash(b*5+Math.floor(t/BEAT));gb.fillStyle=BLUE;gb.fillRect(px+180+b*22,cy+90-hh,12,hh)}}
      if(i===0){gb.fillStyle=LIME;gb.beginPath();gb.arc(px+PW-80,cy+60,22*(1+0.2*pulse(t)),0,7);gb.fill()}}}
  gb.restore();
  // floating cards (parallax, deeper = slower)
  [[-470,-180,LIME,'+128%',1.4],[440,-240,BLUE,'60 FPS',1.0],[470,220,WHITE,'0 KEYFRAMES',1.2]].forEach(([dx,dy,c,txt,dp],i)=>{const p=oX(P(t,s+0.5+i*0.12,s+1.1+i*0.12));
    const fx=W/2+dx+Math.sin(t*1.5+i)*12*dp,fy=H/2+dy+Math.cos(t*1.3+i)*10*dp+120*(1-p);gb.fillStyle=c;gb.beginPath();gb.roundRect(fx-130*p,fy-50,260*p,100,20);gb.fill();
    if(p>0.4){gb.font=FINAL(34);gb.fillStyle=c===BLUE?WHITE:INK;gb.textAlign='center';gb.fillText(txt,fx,fy+12);gb.textAlign='left'}});
  caption(t,s,'06','PRODUCT UI','INTERFACE MOTION / PROTOTYPE',LIME)}

// ----- V7 MARQUEE (reuse, time-shifted) / V8 BENTO (reuse) -----
function V7(t){paintR2(t-13.4);caption(t,21.4,'07','TYPE WALL','MARQUEE / 8 LAYERS',LIME)}
function V8(t){paintR5(t-10.5);caption(t,23.8,'08','BENTO SYSTEM','LAYOUT / 6 TILES',WHITE)}
// ----- V9 DOT DISPLAY: REEL in a 5×7 dot matrix, a lime wave rolls through on every beat -----
const F5={R:['110','101','110','101','101'],E:['111','100','110','100','111'],L:['100','100','100','100','111']};
function V9(t){const s=26.2;bgFill(INK);const m=base().translate(W/2,H/2).scale(1.0+0.1*P(t,s,s+2.4)).rotate(-3*P(t,s,s+2.4)).translate(-W/2,-H/2);gb.setTransform(m);
  const SP=26,R=10;const word='REEL';
  for(let gy=-14;gy<=14;gy++)for(let gx=-30;gx<=30;gx++){const x=W/2+gx*SP,y=H/2+gy*SP;gb.fillStyle='#1d1d1b';gb.beginPath();gb.arc(x,y,2,0,7);gb.fill()}
  [...word].forEach((ch,k)=>F5[ch].forEach((row,j)=>[...row].forEach((c,i)=>{if(c!=='1')return;const x=W/2+(k-1.5)*104+(i-1)*SP,y=H/2+(j-2)*SP;
    const dist=Math.hypot(x-W/2,y-H/2);const p=oX(P(t,s+0.1+dist*0.0005,s+0.5+dist*0.0005));
    const wave=Math.exp(-Math.pow((x-W/2+900-((t-s)%0.8)*2800)/90,2))*(t>s+0.6?1:0);
    gb.fillStyle=wave>0.3?LIME:WHITE;gb.beginPath();gb.arc(x,y,R*p*(1+0.5*wave)*(1-iX(P(t,s+2.1,s+2.4))),0,7);gb.fill()})));
  caption(t,s,'09','DOT DISPLAY','5×7 MATRIX / TYPE',LIME)}
// ----- V10 GENERATIVE: epicycles draw lime and white traces -----
function V10(t){const s=28.6;bgFill(INK);const m=base();gb.setTransform(m);const lt=t-s;
  const arms=[[300,1.0],[150,-3.1],[80,7.2]];const draw=(tt)=>{let x=W/2,y=H/2;arms.forEach(([r,w],i)=>{x+=Math.cos(tt*w+i)*r;y+=Math.sin(tt*w+i)*r});return[x,y]};
  const L=Math.min(lt,2.4)*2.6;gb.strokeStyle=LIME;gb.lineWidth=6;gb.beginPath();for(let k=0;k<=400;k++){const tt=L*k/400;const[x,y]=draw(tt);k?gb.lineTo(x,y):gb.moveTo(x,y)}gb.stroke();
  // live arms
  let x=W/2,y=H/2;const tt=L;arms.forEach(([r,w],i)=>{const nx=x+Math.cos(tt*w+i)*r,ny=y+Math.sin(tt*w+i)*r;gb.strokeStyle='rgba(255,255,255,0.35)';gb.lineWidth=1.5;gb.beginPath();gb.arc(x,y,r,0,7);gb.stroke();line(gb,x,y,nx,ny,WHITE,2);x=nx;y=ny});
  gb.fillStyle=WHITE;gb.beginPath();gb.arc(x,y,9,0,7);gb.fill();
  // second trace, mirrored, white
  gb.strokeStyle='rgba(242,242,238,0.5)';gb.lineWidth=1.5;gb.beginPath();for(let k=0;k<=200;k++){const q=L*k/200;const[a,b]=draw(q*0.7+1.7);k?gb.lineTo(W-a,b):gb.moveTo(W-a,b)}gb.stroke();
  caption(t,s,'10','GENERATIVE','EPICYCLES / PARAMETRIC',LIME)}
// ----- end card -----
function VEND(t){const s=32.6;bgFill(INK);const m=base().translate(W/2,H/2).scale(1+0.03*P(t,s,35)).translate(-W/2,-H/2);
  lockDecode(gb,m,'2026','REEL',W/2-188,H/2+30,96,t,s,{stretch:0.6});
  if(t>s+0.95){const rise=oX(P(t,s+0.95,s+1.3));gb.save();gb.setTransform(m);gb.beginPath();gb.rect(W/2+192-160,H/2+30-96*0.85,320,96*1.02);gb.clip();odometer(gb,m.translate(0,96*(1-rise)),track(t,[[0,1989],[s+0.95,2026]],(tt,t0)=>oX(P(tt,t0,t0+0.6))),W/2+192,H/2+30,96,LIME,4);gb.restore()}
  rect(gb,m,W/2-312,H/2+56,624*oX(P(t,s+0.5,s+1.0)),3,WHITE);
  gb.setTransform(m);mono(gb,decode('MOTION DESIGN REEL — 2026',t,s+0.8,0.02),W/2,H/2+96,'#8a8a86',14,500,'center')}

const SHOTS=[[6.6,V1,'iris'],[9.4,V2,'whip'],[11.8,V3,'slice'],[14.2,V4,'cut'],[16.6,V5,'zoom'],[19.0,V6,'drop'],[21.4,V7,'cut'],[23.8,V8,'cut'],[26.2,V9,'whip'],[28.6,V10,'recap'],[31.0,null,'cut'],[32.6,VEND,null]];
// rapid recap: one frame-world per beat, punched in
function RECAP(t){const k=Math.min(3,Math.floor((t-31.0)/BEAT));const picks=[[V1,8.9],[V4,15.0],[V6,20.4],[V3,13.0]];const[f,tt]=picks[k];
  const lt=(t-31.0)%BEAT;OFFM=new DOMMatrix().translate(W/2,H/2).scale(1.18-0.18*oX(lt/0.35)).translate(-W/2,-H/2);f(tt+lt);OFFM=new DOMMatrix();
  if(lt<0.05){gb.setTransform(1,0,0,1,0,0);gb.fillStyle='rgba(255,255,255,0.85)';gb.fillRect(0,0,W,H)}}
function drawShot(i,t){const f=SHOTS[i][1];if(f)f(t);else RECAP(t)}

function montage(t){
  let i=0;while(i<SHOTS.length-1&&SHOTS[i+1][0]<=t)i++;
  const next=SHOTS[i+1],ty=SHOTS[i][2];
  const TW=0.32;   // transition window before the next shot's start
  if(next&&t>next[0]-TW&&ty&&ty!=='cut'&&ty!=='recap'&&ty!=='carry'||(next&&ty==='recap'&&false)){
    const p=P(t,next[0]-TW,next[0]);
    if(ty==='whip'){const e=ioX(p);OFFM=new DOMMatrix().translate(-W*e,0);drawShot(i,t);OFFM=new DOMMatrix().translate(W*(1-e),0);drawShot(i+1,t);OFFM=new DOMMatrix();return}
    drawShot(i+1,t);
    gb.save();gb.setTransform(1,0,0,1,0,0);gb.beginPath();
    if(ty==='iris'){gb.rect(0,0,W,H);gb.moveTo(W*S/2+oX(p)*W*0.62*S,H*S/2);gb.arc(W*S/2,H*S/2,oX(p)*W*0.62*S,0,2*PI,true);gb.clip('evenodd');drawShot(i,t)}
    else if(ty==='slice'){const q=iX(p);gb.restore();[[0,-1],[1,1]].forEach(([h,dir])=>{gb.save();gb.setTransform(1,0,0,1,0,0);gb.beginPath();gb.rect(0,h*H*S/2,W*S,H*S/2);gb.clip();OFFM=new DOMMatrix().translate(dir*W*1.1*q,0);drawShot(i,t);OFFM=new DOMMatrix();gb.restore()});return}
    else if(ty==='drop'){gb.restore();gb.save();OFFM=new DOMMatrix().translate(0,H*1.1*iX(p));drawShot(i,t);OFFM=new DOMMatrix()}
    else if(ty==='zoom'){gb.restore();gb.save();const q=iX(p);gb.setTransform(1,0,0,1,0,0);gb.beginPath();gb.rect(0,0,W,H);gb.moveTo(W*S/2+q*W*0.62*S,H*S/2);gb.arc(W*S/2,H*S/2,q*W*0.62*S,0,2*PI,true);gb.clip('evenodd');OFFM=new DOMMatrix().translate(W/2,H/2).scale(1+q*3).translate(-W/2,-H/2);drawShot(i,t);OFFM=new DOMMatrix()}
    gb.restore();return}
  drawShot(i,t);
  // hard cut flash on 'cut' boundaries
  if(SHOTS[i-1]&&SHOTS[i-1][2]==='cut'&&t-SHOTS[i][0]<0.035){gb.setTransform(1,0,0,1,0,0);gb.fillStyle='rgba(255,255,255,0.9)';gb.fillRect(0,0,W,H)}
}

// ======================= 3D helpers =======================
const FOC=900;
function proj(px,py,pz,C){const dx=px-C.x,dy=py-C.y,dz=pz-C.z;
  const cy=Math.cos(C.yaw),sy=Math.sin(C.yaw);const x1=dx*cy-dz*sy,z1=dx*sy+dz*cy;
  const cp=Math.cos(C.pitch),sp=Math.sin(C.pitch);const y2=dy*cp-z1*sp,z2=dy*sp+z1*cp;
  if(z2<20)return null;const k=FOC/z2;return[W/2+x1*k,H/2-y2*k,z2,k]}

// ======================= L1 ripple ocean (11.8–14.8) =======================
const IMP=[[12.0,0,0,95],[12.55,-560,320,70],[12.95,640,-260,70],[13.35,-200,820,80]];
function L1_2D(t){const s=11.8;bgFill(INK);
  const e=ioX(P(t,13.35,14.2)),fly=iX(P(t,14.2,14.8));
  const C={x:0,y:lerp(1150,330,e),z:lerp(0,-760,e)+3600*fly,yaw:0,pitch:lerp(-PI/2,-0.30,e)};
  const m=base();gb.setTransform(m);
  const wave=(x,z)=>{let h=0;for(const[ti,ix,iz,A]of IMP){const dt=t-ti;if(dt<0)continue;const d=Math.hypot(x-ix,z-iz);
      h+=A*Math.exp(-Math.pow((d-950*dt)/85,2))*Math.exp(-dt*0.7)+A*0.45*Math.sin(d*0.03-dt*13)*Math.exp(-d/520)*Math.exp(-dt*1.3)*(d<950*dt?1:0)}
    if(t>13.4)h+=48*P(t,13.4,14.0)*Math.sin(x*0.0045+t*2.2)*Math.cos(z*0.0052+t*1.7);return h};
  const SPC=64;
  for(let z=3800;z>=-1300;z-=SPC)for(let x=-1900;x<=1900;x+=SPC){const h=wave(x,z);const p=proj(x,h,z,C);if(!p)continue;
    if(p[0]<-40||p[0]>W+40||p[1]<-40||p[1]>H+40)continue;
    const r=Math.max(0.6,(4.2+Math.min(10,Math.abs(h)*0.09))*p[3]*1.25);
    gb.fillStyle=h>26?LIME:h<-26?'#5d5d58':WHITE;
    if(fly>0.02){const q=proj(x,h,z-160*fly,C);if(q){gb.strokeStyle=gb.fillStyle;gb.lineWidth=r*1.6;gb.lineCap='round';gb.beginPath();gb.moveTo(p[0],p[1]);gb.lineTo(q[0],q[1]);gb.stroke();continue}}
    gb.beginPath();gb.arc(p[0],p[1],r,0,7);gb.fill()}
  // the falling core (from the HUD) — stretched by its speed
  if(t<12.02){const p=iX(P(t,11.8,12.0));const y=lerp(-200,H/2,p);gb.setTransform(m);gb.fillStyle=LIME;gb.beginPath();gb.ellipse(W/2,y,22,22+90*p,0,0,7);gb.fill()}
  caption(t,s,'01','RIPPLE FIELD','3D DOT OCEAN / 6,000 POINTS',LIME)}

// ======================= L2 ring tunnel (14.8–17.8) =======================
function L2(t){const s=14.8;bgFill(INK);const m=base();gb.setTransform(m);
  const zc=1700*oX(P(t,14.8,15.95))+140*(t-14.8)+11000*iX(P(t,16.55,17.8));
  const bend=z=>[240*Math.sin(z*0.0011),150*Math.cos(z*0.0008)];const [bx,by]=bend(zc+500);
  const C={x:bx,y:by,z:zc,yaw:0,pitch:0};
  for(let k=44;k>=0;k--){const z=k*380;if(z-zc<40||z-zc>9500)continue;const [ox,oy]=bend(z);const c=proj(ox,oy,z,C);if(!c)continue;
    const R=540*c[3],st=k%5,roll=t*(0.25+(k%4)*0.35)*(k%2?1:-1);const fade=clamp((9500-(z-zc))/3500);
    gb.save();gb.translate(c[0],c[1]);gb.rotate(roll);gb.globalAlpha=fade;const lw=Math.max(1,Math.min(14,3*c[3]));
    gb.strokeStyle=WHITE;gb.lineWidth=lw;
    if(st===0){gb.beginPath();gb.arc(0,0,R,0,7);gb.stroke()}
    if(st===1){gb.setLineDash([R*0.06,R*0.05]);gb.beginPath();gb.arc(0,0,R,0,7);gb.stroke();gb.setLineDash([])}
    if(st===2){for(let i=0;i<72;i++){const a=i/72*2*PI,L=(i%6?0.04:0.1)*R;gb.beginPath();gb.moveTo(Math.cos(a)*R,Math.sin(a)*R);gb.lineTo(Math.cos(a)*(R-L),Math.sin(a)*(R-L));gb.stroke()}}
    if(st===3){gb.strokeStyle=LIME;gb.lineWidth=Math.max(2,lw*4);gb.beginPath();gb.arc(0,0,R,0,PI*1.35);gb.stroke()}
    if(st===4){gb.lineWidth=Math.max(1,lw*0.5);gb.beginPath();gb.arc(0,0,R,0,7);gb.stroke();gb.beginPath();gb.arc(0,0,R*0.93,0,7);gb.stroke()}
    gb.fillStyle=k%3===0?LIME:WHITE;const sq=Math.max(3,10*c[3]);gb.fillRect(R-sq/2,-sq/2,sq,sq);
    if(k%3===1&&c[3]>0.25){gb.font=`500 ${Math.max(8,16*c[3])}px GM`;gb.fillStyle=WHITE;gb.fillText('R-'+String(k).padStart(2,'0')+' / '+(z/100).toFixed(1)+'M',R*0.72,-R*0.72)}
    gb.restore()}
  gb.globalAlpha=1;
  // reading moment: the ring in front is labelled while the camera nearly stops
  if(t>15.6&&t<16.55){gb.setTransform(m);mono(gb,decode('SECTOR 07 — DEPTH '+(zc/100).toFixed(1)+'M',t,15.65,0.02),W/2,H/2+8,LIME,16,500,'center')}
  if(t>17.62){gb.setTransform(m);gb.fillStyle=LIME;gb.globalAlpha=1;const p=iX(P(t,17.62,17.8));gb.beginPath();gb.arc(W/2,H/2,p*1200,0,7);gb.fill()}
  caption(t,s,'04','RING TUNNEL','3D HUD / 45 RINGS',LIME)}

// ======================= L3 dot globe → torus → cube (17.8–20.8) =======================
const NG=760,SPH=[],TOR=[],CUB=[];
for(let i=0;i<NG;i++){const y=1-2*(i+0.5)/NG,r=Math.sqrt(1-y*y),a=i*2.39996;SPH.push([Math.cos(a)*r*330,y*330,Math.sin(a)*r*330]);
  const u=(i/NG)*2*PI*1,v=(i*0.618%1)*2*PI;TOR.push([(300+105*Math.cos(v))*Math.cos(u*1),105*Math.sin(v),(300+105*Math.cos(v))*Math.sin(u)]);
  const f=i%6,p=(hash(i*3)-0.5)*2,q=(hash(i*7)-0.5)*2,S0=250;const g=[[S0,p*S0,q*S0],[-S0,p*S0,q*S0],[p*S0,S0,q*S0],[p*S0,-S0,q*S0],[p*S0,q*S0,S0],[p*S0,q*S0,-S0]][f];
  const sn=x=>Math.round(x/(S0/4))*(S0/4);CUB.push(g.map((c,j)=>Math.abs(c)===S0?c:sn(c)))}
function L3(t){const s=17.8;bgFill(INK);const m=base();gb.setTransform(m);
  const yaw=(t-s)*0.9,tilt=0.42+0.12*Math.sin(t*1.3);const cy=Math.cos(yaw),sy=Math.sin(yaw),ct=Math.cos(tilt),st=Math.sin(tilt);
  const pts=[];
  for(let i=0;i<NG;i++){const d=hash(i*11)*0.35;const a=oX(P(t,19.0+d,19.5+d)),b=oX(P(t,19.95+d,20.45+d));
    let [x,y,z]=SPH[i];x=lerp(x,TOR[i][0],a);y=lerp(y,TOR[i][1],a);z=lerp(z,TOR[i][2],a);x=lerp(x,CUB[i][0],b);y=lerp(y,CUB[i][1],b);z=lerp(z,CUB[i][2],b);
    const born=oX(P(t,s+hash(i)*0.3,s+0.4+hash(i)*0.3)),boom=1+3.5*iX(P(t,20.5+hash(i*5)*0.15,20.8));x*=born*boom;y*=born*boom;z*=born*boom;
    const x1=x*cy-z*sy,z1=x*sy+z*cy;const y2=y*ct-z1*st,z2=y*st+z1*ct;const k=FOC/(FOC+z2+500)*1.55;
    const band=Math.sin(Math.asin(clamp(SPH[i][1]/330,-1,1))*5-(t-s)*5)>0.82;
    pts.push([W/2+x1*k,H/2-y2*k,z2,k,band])}
  pts.sort((a,b)=>b[2]-a[2]);
  // orbit ring behind
  const orb=(front)=>{gb.strokeStyle='rgba(242,242,238,0.5)';gb.lineWidth=1.5;gb.beginPath();gb.ellipse(W/2,H/2,560,120,-0.25,front?0:PI,front?PI:2*PI);gb.stroke()};
  orb(false);
  pts.forEach(([x,y,z,k,band])=>{gb.fillStyle=band?LIME:z<0?WHITE:'#6a6a65';gb.beginPath();gb.arc(x,y,Math.max(0.8,3.3*k),0,7);gb.fill()});
  orb(true);const sa=(t-s)*2.2;gb.fillStyle=LIME;const sx=W/2+Math.cos(sa)*560*Math.cos(-0.25)-Math.sin(sa)*120*Math.sin(-0.25),sy2=H/2+Math.cos(sa)*560*Math.sin(-0.25)+Math.sin(sa)*120*Math.cos(-0.25);gb.fillRect(sx-8,sy2-8,16,16);
  gb.setTransform(m);mono(gb,decode(t<19.0?'SPHERE / 760 PTS':t<19.95?'TORUS / 760 PTS':'LATTICE / 760 PTS',t,t<19.0?18.0:t<19.95?19.0:19.95,0.03),W/2+380,H/2-200,LIME,15,500);
  caption(t,s,'05','POINT CLOUD','3D MORPH / SPHERE · TORUS · CUBE',LIME)}

// ======================= L4 particles → word → wind (20.8–23.8) =======================
let TGT=null;
function targets(){if(TGT)return TGT;const c=document.createElement('canvas');c.width=1920;c.height=600;const g=c.getContext('2d');g.font=FINAL(250);g.letterSpacing='-10px';g.textAlign='center';g.fillStyle='#fff';g.fillText('MOTION',960,390);
  const d=g.getImageData(0,0,1920,600).data;const out=[];for(let y=0;y<600;y+=9)for(let x=0;x<1920;x+=9)if(d[(y*1920+x)*4+3]>128)out.push([x,y-300+H/2]);
  TGT=[];for(let i=0;i<out.length;i++)TGT.push(out[i]);return TGT}
function L4(t){const s=20.8;bgFill(INK);const m=base();gb.setTransform(m);const T=targets();
  const pos=(i,tt)=>{const[tx,ty]=T[i];const a=hash(i*13)*2*PI,r0=900+hash(i*7)*700;const sx=W/2+Math.cos(a)*r0,sy=H/2+Math.sin(a)*r0*0.7;
    const d=hash(i*5)*0.45;const p=oX(P(tt,s+d,s+0.7+d));let x=lerp(sx,tx,p),y=lerp(sy,ty,p);
    const shimmer=Math.sin(tt*20+i)*1.5*P(tt,s+1.2,s+1.4);x+=shimmer;
    const w0=22.55+hash(i*17)*0.35+((tx-W/2)/W)*0.3;const wv=iX(P(tt,w0,w0+0.85));x+=2600*wv;y+=Math.sin(tx*0.012+tt*3)*160*wv;
    return[x,y]};
  for(let i=0;i<T.length;i++){const a=pos(i,t),b=pos(i,t-0.035);const sp=Math.hypot(a[0]-b[0],a[1]-b[1]);
    const col=(i%11===0)?LIME:WHITE;
    if(sp>3){gb.strokeStyle=col;gb.lineWidth=2.6;gb.lineCap='round';gb.beginPath();gb.moveTo(b[0],b[1]);gb.lineTo(a[0],a[1]);gb.stroke()}
    else{gb.fillStyle=col;gb.fillRect(a[0]-2,a[1]-2,4,4)}}
  if(t>21.9&&t<22.6){gb.setTransform(m);mono(gb,decode(T.length+' PARTICLES / 1 WORD',t,21.95,0.02),W/2,H/2+170,'#8a8a86',15,500,'center')}
  caption(t,s,'06','PARTICLE TYPE','ASSEMBLY / FLOW FIELD',LIME)}

// ======================= L5 liquid domino (23.8–26.8) =======================
function L5(t){const s=23.8;bgFill(BLUE);const m=base();gb.setTransform(m);const FL=H/2+150;
  line(gb,0,FL+64,W,FL+64,'rgba(156,250,10,0.4)',2);for(let x=0;x<W;x+=32)line(gb,x,FL+58,x,FL+70,'rgba(156,250,10,0.4)',2);
  goo(LIME,g=>{
    if(t<24.95){[-1,0,1].forEach((j,k)=>{const d=drop(t,23.85+k*0.12,640);const ant=oX(P(t,24.55,24.68)),go=iX(P(t,24.68,24.95));
      const x=W/2+j*300*(1-go),y=FL+d.y+16*ant;const r=62*(1+0.25*ant*0);circ(g,m,x,y-(d.sq>0?d.sq*12:0),r*(1+(d.sq>0?d.sq*0.25:0)))})}
    else if(t<25.2){const p=oX(P(t,24.95,25.2));circ(g,m,W/2-170*p,FL-40,90);circ(g,m,W/2+170*p,FL-40,90);g.fillStyle=LIME;caps(g,m,W/2-170*p,FL-40,W/2+170*p,FL-40,30*p)}
    else if(t<26.35){for(let k=0;k<7;k++){const d=Math.abs(k-3)*0.05;const out=oX(P(t,25.2+d,25.65+d));const cx=W/2+(k-3)*235*out,cy=FL-40;
        const rot=(PI/2)*oX(P(t,25.62+k*0.075,25.95+k*0.075))+(PI/2)*oX(P(t,26.0+(6-k)*0.04,26.3+(6-k)*0.04));const hop=-60*Math.sin(PI*P(t,25.62+k*0.075,25.95+k*0.075));
        const sc=lerp(1,0.42,out);const L=170*sc,R=90*sc,b=30*sc;const ex=Math.cos(rot)*L,ey=Math.sin(rot)*L;
        circ(g,m,cx-ex,cy+hop-ey,R);circ(g,m,cx+ex,cy+hop+ey,R);g.fillStyle=LIME;caps(g,m,cx-ex,cy+hop-ey,cx+ex,cy+hop+ey,b)}}
    else{const p=iX(P(t,26.35,26.8));for(let k=0;k<7;k++){const cx=lerp(W/2+(k-3)*235,W/2,oX(P(t,26.35,26.55)));circ(g,m,cx,FL-40,38)}circ(g,m,W/2,FL-40,lerp(40,1600,p))}
  });
  caption(t,s,'07','LIQUID CHOREOGRAPHY','METABALLS / DOMINO',LIME)}

// ======================= L6 ASCII field (26.8–31.0) =======================
const RAMP=' .·:-=+*#%@';let MASK26=null;
function mask26(){if(MASK26)return MASK26;const c=document.createElement('canvas');c.width=96;c.height=44;const g=c.getContext('2d');g.font='700 17px IT';g.textAlign='center';g.fillStyle='#fff';g.fillText('2026',48,28);
  MASK26=g.getImageData(0,0,96,44).data;return MASK26}
function torusI(u,v,t){// tiny raymarch: rotating torus, Lambert shade
  let ro=[0,0,-3.2],rd=[u,v,1.6];const l=Math.hypot(...rd);rd=rd.map(c=>c/l);const a=t*1.1,b=t*0.7;
  const map=p=>{let[x,y,z]=p;let x1=x*Math.cos(a)-z*Math.sin(a),z1=x*Math.sin(a)+z*Math.cos(a);let y1=y*Math.cos(b)-z1*Math.sin(b),z2=y*Math.sin(b)+z1*Math.cos(b);return Math.hypot(Math.hypot(x1,y1)-1.0,z2)-0.42};
  let d=0;for(let i=0;i<28;i++){const p=[ro[0]+rd[0]*d,ro[1]+rd[1]*d,ro[2]+rd[2]*d];const h=map(p);if(h<0.01){const e=0.01;
      const n=[map([p[0]+e,p[1],p[2]])-h,map([p[0],p[1]+e,p[2]])-h,map([p[0],p[1],p[2]+e])-h];const nl=Math.hypot(...n);return clamp(0.15+0.85*Math.max(0,(n[0]*-0.5+n[1]*0.6+n[2]*-0.62)/nl))}d+=h;if(d>6)break}return 0}
function L6(t){const s=26.8;bgFill(INK);const m=base();gb.setTransform(m);const COLS=96,ROWS=44,cw=W/COLS,ch=H/ROWS;gb.font=`500 ${Math.round(ch*0.95)}px GM`;gb.textAlign='center';
  const M=mask26();const wipe1=oX(P(t,27.85,28.35)),wipe2=oX(P(t,29.35,29.85));const fr=Math.floor(t*24);
  for(let j=0;j<ROWS;j++)for(let i=0;i<COLS;i++){const x=(i+0.5)*cw,y=(j+0.75)*ch;const dx=x-W/2,dy=y-H/2,d=Math.hypot(dx,dy*1.4);
    const ripple=d<1600*(t-s)?0.5+0.5*Math.sin(d*0.03-(t-s)*10)*Math.exp(-d/900):0;
    const u=(i-COLS/2)/(ROWS*0.55)*(ch/cw)*1.0,v=-(j-ROWS/2)/(ROWS*0.55);
    const tor=(t>27.8&&t<29.9)?torusI(u*0.9,v,t):0;
    const inMask=M[(j*96+i)*4+3]>120?1:0;const land=oX(P(t,29.5+i*0.008,29.75+i*0.008));
    let I=ripple;const w1=(i/COLS)<wipe1;if(w1)I=tor;const w2=(i/COLS)<wipe2;if(w2)I=inMask?0.95*land+0.05:0.08*hash(i*3+j*7+fr)*1.2;
    if(t>30.75)I=Math.max(I,0.6*iX(P(t,30.75,31.0))*hash(i+j*97+fr));
    if(I<0.04)continue;let ch_=RAMP[Math.min(RAMP.length-1,Math.floor(I*RAMP.length))];
    if((w2&&inMask&&land<1)||(t>30.75))ch_=SCR[Math.floor(hash(i*13+j*7+fr)*SCR.length)];
    gb.fillStyle=I>0.78?LIME:I>0.38?WHITE:'#4a4a46';gb.fillText(ch_,x,y)}
  gb.textAlign='left';
  caption(t,s,'02','ASCII RENDERER','RAYMARCHED TORUS / 4,224 CELLS',LIME)}

// ======================= new shot list =======================
SHOTS.length=0;
[[6.6,V1,'iris'],[9.4,V2,'carry'],[11.8,L1,'carry'],[14.8,L2,'carry'],[17.8,L3,'carry'],[20.8,L4,'carry'],[23.8,L5,'carry'],[26.8,L6,'recap'],[31.0,null,'cut'],[32.6,VEND,null]].forEach(x=>SHOTS.push(x));
RECAP=function(t){const k=Math.min(3,Math.floor((t-31.0)/BEAT));const picks=[[L3,19.4],[L1,13.9],[L4,22.2],[L2,16.2]];const[f,tt]=picks[k];
  const lt=(t-31.0)%BEAT;OFFM=new DOMMatrix().translate(W/2,H/2).scale(1.18-0.18*oX(lt/0.35)).translate(-W/2,-H/2);f(tt+lt);OFFM=new DOMMatrix();
  if(lt<0.05){gb.setTransform(1,0,0,1,0,0);gb.fillStyle='rgba(255,255,255,0.85)';gb.fillRect(0,0,W,H)}};

// ======================= Lockup-in-Motion decode (studied frame by frame) =======================
// digits are wiped by a band; letters arrive one by one, wide-tracked: half glyph → grey → white;
// a solid block leads like a cursor, stretches, retracts; tracking then tightens. Scramble lives only in the tiny mono lines.
function lockDecode(g,m,from,to,cx,cy,size,t,t0,o={}){
  g.save();g.setTransform(m);g.font=FINAL(size);
  const cw=g.measureText('0').width*0.98, ls=-size*0.04;
  const xs=layout(g,to,size,ls),tw=xs[to.length];g.font=FINAL(size);
  const fx=i=>cx-tw/2+(xs[i]+xs[i+1])/2, wx=i=>cx+(i-(to.length-1)/2)*size*1.08, ox=i=>cx-cw*from.length/2+cw*(i+0.5);
  const tight=oX(P(t,t0+0.78,t0+1.25));
  const TA=[0,0.1,0.23,0.3].map(d=>t0+0.26+d);
  const top=cy-size*0.73,hh=size*0.73;
  g.textAlign='center';
  // 1) digits leave through a falling band
  for(let i=0;i<from.length;i++){const b=oX(P(t,t0+i*0.05,t0+0.13+i*0.05));if(b>=1)continue;
    g.save();g.beginPath();g.rect(ox(i)-cw,top+hh*b,cw*2,hh*(1-b)+size*0.1);g.clip();g.fillStyle=WHITE;g.fillText(from[i],ox(i),cy);g.restore()}
  // 2) letters arrive
  for(let i=0;i<to.length;i++){const lt=t-TA[i];if(lt<0)continue;const x=lerp(wx(i),fx(i),tight);
    if(lt<0.05){g.save();g.beginPath();g.rect(x-size,top-size*0.1,size*2,hh*0.5+size*0.1);g.clip();g.fillStyle='#8f8f8a';g.fillText(to[i],x,cy-size*0.06);g.restore()}
    else if(lt<0.12){g.fillStyle='#b8b8b2';g.fillText(to[i],x,cy+size*0.05*(1-(lt-0.05)/0.07))}
    else{g.fillStyle=WHITE;g.fillText(to[i],x,cy)}}
  // 3) the cursor block
  const arrived=TA.filter(a=>t>=a).length, last=TA[TA.length-1];
  if(t>t0+0.16&&t<last+0.45){const k=Math.min(arrived,to.length);const bx=(k<to.length?lerp(wx(k),fx(k),tight):lerp(wx(to.length-1),fx(to.length-1),tight)+size*0.62)-size*0.31;
    let w=size*0.62;if(t>last+0.06)w+=size*(o.stretch??2.4)*oX(P(t,last+0.06,last+0.2));const L=w*oX(P(t,last+0.24,last+0.43));
    if(k<to.length||t>last+0.06){g.fillStyle=WHITE;g.fillRect(bx+L,top,w-L,hh)}}
  // 4) the macron dash over the first letter
  if(t>TA[0]&&t<t0+1.6){const x=lerp(wx(0),fx(0),tight);g.fillStyle=WHITE;g.fillRect(x-size*0.2,cy-size*0.92,size*0.24,Math.max(3,size*0.045))}
  g.textAlign='left';
  // 5) tiny mono lines scramble then resolve; a small block pulses above
  if(o.mini){const lx=cx-tw/2+4,ly=cy-size*1.08;const fr=Math.floor(t*24);
    ['SHOWREEL 2026','MOTION · CODE · DESIGN'].forEach((s,r)=>{let out='';for(let j=0;j<s.length;j++){const res=t0+0.35+r*0.15+j*0.028;
        out+=t<t0+0.05+r*0.08?'':t>res||s[j]===' '?s[j]:SCR[Math.floor(hash(j*31+r*7+fr)*SCR.length)]}
      mono(g,out,lx,ly+r*20,r?'#8a8a86':WHITE,14,500)});
    if(t<t0+1.7){const sq=Math.floor((t-t0)/0.2)%2===0;g.fillStyle='#c8c8c2';const bw=sq?22:34,bh=sq?22:11;g.fillRect(cx-bw/2,cy-size*1.6-bh/2,bw,bh)}}
  g.restore();
}



// ======================= Lockup-in-Motion grammar (measured from the reference, 15 fps study) =======================
// shots of 4–8 frames, hard cuts with matched positions, one element at a time, footage cards, bevel pills, glitch frames.
const FR=1/30;
const g_=()=>gb;
function M(){return base()}
function fr(t){return Math.floor(t*30)}
// ---------- primitives (white on ink unless a colour is passed) ----------
function blk(x,y,w,h,c=WHITE){const g=g_();g.setTransform(M());g.fillStyle=c;g.fillRect(x-w/2,y-h/2,w,h)}
function ringP(x,y,r,lw=2.5,c=WHITE){const g=g_();g.setTransform(M());g.strokeStyle=c;g.lineWidth=lw;g.beginPath();g.arc(x,y,r,0,7);g.stroke()}
function pix(x,y,cell,rows,c=WHITE){const g=g_();g.setTransform(M());g.fillStyle=c;const w=rows[0].length,h=rows.length;
  rows.forEach((r,j)=>[...r].forEach((b,i)=>{if(b==='1')g.fillRect(x+(i-w/2)*cell,y+(j-h/2)*cell,cell+0.5,cell+0.5)}))}
function footage(x,y,w,h,t,seed=1,blurPx=16){const g=g_();g.save();g.setTransform(M());g.beginPath();g.rect(x-w/2,y-h/2,w,h);g.clip();
  g.fillStyle='#0d0d0c';g.fillRect(x-w/2,y-h/2,w,h);g.filter=`blur(${blurPx*S}px)`;
  for(let i=0;i<3;i++){const a=-0.6+hash(seed*7+i)*1.2+Math.sin(t*0.7+i)*0.05,ox=(hash(seed*3+i)-0.5)*w*0.8,oy=(hash(seed*5+i)-0.5)*h*0.6+t*12*(i%2?1:-1);
    const L=Math.max(w,h)*1.6;const gr=g.createLinearGradient(x+ox-30,y+oy-30,x+ox+30,y+oy+30);gr.addColorStop(0,'#222');gr.addColorStop(0.5,i===1?'#9a9a96':'#6b6b67');gr.addColorStop(1,'#1a1a19');
    g.strokeStyle=gr;g.lineWidth=40+hash(seed+i*11)*90;g.beginPath();g.moveTo(x+ox-Math.cos(a)*L,y+oy-Math.sin(a)*L);g.lineTo(x+ox+Math.cos(a)*L,y+oy+Math.sin(a)*L);g.stroke()}
  g.filter='none';g.restore()}
function bevel(x,y,L,hh=13){const g=g_();g.setTransform(M());const gr=g.createLinearGradient(0,y-hh,0,y+hh);gr.addColorStop(0,'#b5b5b1');gr.addColorStop(0.45,'#6e6e6a');gr.addColorStop(1,'#262625');
  g.fillStyle=gr;g.beginPath();g.moveTo(x-L,y);g.lineTo(x-L+hh,y-hh);g.lineTo(x+L-hh,y-hh);g.lineTo(x+L,y);g.lineTo(x+L-hh,y+hh);g.lineTo(x-L+hh,y+hh);g.closePath();g.fill()}
function hatchP(x,y,w,h,t,c=WHITE){const g=g_();g.save();g.setTransform(M());g.beginPath();g.rect(x-w/2,y-h/2,w,h);g.clip();g.strokeStyle=c;g.lineWidth=h*0.18;
  for(let i=-20;i<40;i++){const xx=x-w/2+i*h*0.42+((t*90)%(h*0.42));g.beginPath();g.moveTo(xx,y+h/2);g.lineTo(xx+h*0.7,y-h/2);g.stroke()}g.restore()}
function mtext(s,x,y,size,c=WHITE,align='left',w=500){const g=g_();g.setTransform(M());mono(g,s,x,y,c,size,w,align)}
function btext(s,x,y,size,c=WHITE,align='left',ls=-0.03){const g=g_();g.setTransform(M());g.font=FINAL(size);g.letterSpacing=(size*ls)+'px';g.textAlign=align;g.fillStyle=c;g.fillText(s,x,y);g.letterSpacing='0px';g.textAlign='left'}
function noise(n,t,salt=0){let o='';for(let i=0;i<n;i++)o+=SCR[Math.floor(hash(i*31+salt*7+fr(t)*13)*SCR.length)];return o}
// resolve: full-length noise that resolves left→right; gaps (missing letters) like the reference
function resolveTxt(s,t,t0,dur,gaps=true){let o='';for(let i=0;i<s.length;i++){const c=s[i];const r=t0+dur*(i/s.length)*(0.6+0.8*hash(i*17));
    if(c===' '||t>r)o+=c;else if(gaps&&hash(i*13+fr(t))<0.35)o+=' ';else o+=SCR[Math.floor(hash(i*7+fr(t)*3)*SCR.length)]}return o}
function dumbbell(x,y,s,c=WHITE){const g=g_();g.setTransform(M());g.fillStyle=c;g.beginPath();g.arc(x-1.0*s,y,0.5*s,0,7);g.arc(x+1.0*s,y,0.5*s,0,7);g.fill();g.fillRect(x-1.0*s,y-0.2*s,2*s,0.4*s)}
function crossX(x,y,s,lw=3,c=WHITE){const g=g_();g.setTransform(M());line(g,x-s,y-s,x+s,y+s,c,lw);line(g,x+s,y-s,x-s,y+s,c,lw)}
const PXG=[['1111','0001','0110','0100'],['0111','1100','0111','0001'],['11101','01111','11100','00111'],['1110','0011','0110','0100'],['10101','11111','01010','11011'],['1100','0111','1101','0011'],['111','101','111']];

// ---------- the sequencer ----------
// each shot: [start, end, fn(lt, t)] — absolute times, hard cuts
function runSeq(seq,t){for(const [a,b,f] of seq){if(t>=a&&t<b)f(t-a,t)}}

// ===================== SEQUENCE A  (6.6 – 11.8): REEL → rapid micrographic run → lime dumbbell =====================
const CX=W/2,CY0=H/2;
const SEQ_A=[
 [6.60,6.67,()=>blk(CX,CY0-2,360,112)],
 [6.67,6.80,(l)=>{blk(CX,CY0,40,40);if(l>0.06)blk(CX,CY0,40,20,'#888')}],
 [6.80,7.00,(l,t)=>{ringP(CX,CY0,128,2.5);bevel(CX-40,CY0-128,34,9);bevel(CX+40,CY0-128,34,9)}],
 [7.00,7.13,()=>{ringP(CX,CY0,128,2.5);pix(CX,CY0,30,PXG[0])}],
 [7.13,7.40,(l,t)=>{footage(CX-60,CY0-40,320,400,t,3);pix(CX+40,CY0+20,26,PXG[l<0.13?3:1]);mtext(resolveTxt('SECTOR 01 / 1080P',t,7.15,0.2),CX+130,CY0+30,13,WHITE)}],
 [7.40,7.53,(l,t)=>{footage(CX-60,CY0-40,320,400,t,3);pix(CX+40,CY0+20,26,PXG[5])}],
 [7.53,7.73,(l,t)=>{const g=g_();g.setTransform(M());line(g,CX-380,CY0+40,CX+380,CY0+40,WHITE,2);footage(CX-120,CY0-90,260,170,t,5);mtext(resolveTxt('FRAME 0229 / 30FPS',t,7.55,0.15),CX+170,CY0+20,12,WHITE)}],
 [7.73,7.93,(l,t)=>{for(let i=-4;i<=4;i++)bevel(CX+i*215,CY0+40,96,14);const g=g_();g.setTransform(M());g.fillStyle=WHITE;g.beginPath();g.arc(CX+40,CY0-10,62,0,7);g.fill();
    g.fillStyle=INK;g.beginPath();g.arc(CX+18,CY0-24,15,0,7);g.arc(CX+60,CY0-30,10,0,7);g.fill();if(l>0.07)blk(CX+150,CY0+70,190,190)}],
 [7.93,8.07,(l,t)=>{for(let i=-4;i<=4;i++)bevel(CX+i*215,CY0+40,96,14);hatchP(CX+40,CY0+10,180,48,t)}],
 [8.07,8.13,()=>mtext('^',CX,CY0+10,46,WHITE,'center',400)],
 [8.13,8.20,()=>{const g=g_();g.setTransform(M());line(g,CX-150,CY0,CX-60,CY0,WHITE,2);mtext('%=',CX-20,CY0+14,40,WHITE,'left',400)}],
 [8.20,8.27,()=>{const g=g_();g.setTransform(M());line(g,CX+40,CY0,CX+150,CY0,WHITE,2);mtext('#%',CX-60,CY0+14,40,WHITE,'left',400)}],
 [8.27,8.40,()=>{const g=g_();g.setTransform(M());line(g,CX+60,CY0,CX+190,CY0,WHITE,2);btext('37',CX-50,CY0+16,48,WHITE)}],
 [8.40,9.00,(l,t)=>{const x=CX-420,y=CY0-60;if(l<0.08){mtext(noise(1,t),x+300,y-40,13)}else if(l<0.3){mtext(resolveTxt('37 YEARS      IN MOTION',t,8.47,0.25),x,y,15)}
    else{mtext('37 YEARS',x,y,15);mtext('IN MOTION',x,y+20,15)};if(l<0.42){const g=g_();g.setTransform(M());line(g,x,y+22,x+64,y+22,WHITE,1.5)}}],
 [9.00,9.67,(l,t)=>{const x=CX-420,y=CY0-60;mtext('37 YEARS',x,y,15);mtext('IN MOTION',x,y+20,15);const bx=CX-380,by=CY0+90;
    if(l<0.1)blk(bx,by,62,62);else if(l<0.3){blk(bx,by+12,62,40);blk(bx+150,by,240,62)}else if(l<0.4){blk(bx,by+12,62,40);blk(bx+150,by,240,62);blk(bx+250,by-80,100,160)}
    else if(l<0.5){btext('37',bx-20,by+16,32,WHITE);blk(bx+200,by,60,60)}else if(l<0.6){blk(bx+60,by-40,180,56);blk(bx+210,by-30,60,56)}else{const g=g_();g.save();g.filter=`blur(${7*S}px)`;blk(bx+120,by-20,180,56);g.restore()}}],
 [9.67,9.90,(l,t)=>{footage(CX+120,CY0-30,300,220,t,9);mtext(resolveTxt('CODE / CANVAS / GL',t,9.68,0.18),CX-160,CY0+60,13);if(l>0.06&&l<0.2)blk(CX+120,CY0-110,62,62)}],
 [9.90,10.30,(l,t)=>{const g=g_();g.setTransform(M());const sl=oX(P(t,10.05,10.2))*48;
    if(l>0.15){g.strokeStyle=WHITE;g.lineWidth=3;g.beginPath();g.arc(CX-sl,CY0,72,0,7);g.stroke();for(let k=-2;k<=2;k++){g.beginPath();g.ellipse(CX-sl,CY0,72*Math.abs(k)/2.4+4,72,0,PI/2,PI*1.5);g.stroke()}line(g,CX-sl-72,CY0,CX-sl,CY0,WHITE,3)}
    g.fillStyle=INK;g.beginPath();g.arc(CX,CY0,72,0,7);g.fill();g.strokeStyle=WHITE;g.lineWidth=3;g.beginPath();g.arc(CX,CY0,72,0,7);g.stroke();btext('www',CX,CY0+14,38,WHITE,'center',0)}],
 [10.30,10.40,(l,t)=>footage(CX,CY0,240,240,t,13,10)],
 [10.40,10.55,(l,t)=>{bevel(CX-40,CY0-40,34,9);bevel(CX+40,CY0-40,34,9);mtext(l<0.07?'0""':'*=?',CX,CY0+20,22,WHITE,'center',400)}],
 [10.55,10.95,(l,t)=>{const lines=[['Code','1'],['Motion','2'],['Design','3']];const n=l<0.12?1:l<0.25?2:3;if(l>0.15)footage(CX+40,CY0+10,330,200,t,17);
    for(let i=0;i<n;i++){const y=CY0-40+i*48;btext(lines[i][0],CX-120,y,46,WHITE,'left',-0.04);const g=g_();g.setTransform(M());g.font=FINAL(46);g.letterSpacing='-1.8px';const w=g.measureText(lines[i][0]).width;g.letterSpacing='0px';btext(lines[i][1],CX-118+w,y-22,18,WHITE)}}],
 [10.95,11.15,(l)=>{const g=g_();g.setTransform(M());g.strokeStyle=WHITE;g.lineCap='round';g.lineJoin='round';g.lineWidth=34;g.beginPath();
    const P1=l<0.1?[[-80,20],[-80,-10],[-20,-10],[-20,20],[40,20],[40,-30],[80,-30]]:[[-70,20],[20,20],[20,-20],[60,-20]];P1.forEach(([x,y],i)=>i?g.lineTo(CX+x,CY0+y):g.moveTo(CX+x,CY0+y));g.stroke()}],
 [11.15,11.35,(l,t)=>{const g=g_();g.setTransform(M());if(l<0.08){g.strokeStyle=WHITE;g.lineWidth=2.5;[[-40,-50,70,22],[-55,10,22,60],[-20,40,70,22]].forEach(([x,y,w,h])=>{g.beginPath();g.roundRect(CX+x,CY0+y,w,h,11);g.stroke()})}
    else{line(g,CX-150,CY0+70,CX+150,CY0+70,WHITE,1.5);line(g,CX-150,CY0+70,CX-150,CY0-80,WHITE,1.5);for(let k=0;k<=5;k++)mtext(String(k*2),CX-170,CY0+74-k*30,10,WHITE,'right',400);
      const m=oX(P(t,11.22,11.32));const A=[[-120,30],[-30,20],[60,-10],[140,-40]],B=[[-120,50],[-30,-20],[60,20],[140,15]];
      [A,B].forEach((pts,j)=>{g.strokeStyle=WHITE;g.lineWidth=2;g.beginPath();pts.forEach(([x,y],i)=>{const yy=j? lerp(y,-y*0.6,m):lerp(y,y-20,m);i?g.lineTo(CX+x,CY0+yy):g.moveTo(CX+x,CY0+yy)});g.stroke();
        pts.forEach(([x,y])=>{const yy=j?lerp(y,-y*0.6,m):lerp(y,y-20,m);g.fillStyle=WHITE;g.fillRect(CX+x-4,CY0+yy-4,8,8)})})}}],
 [11.35,11.55,(l,t)=>{const g=g_();g.setTransform(M());for(let b=0;b<2;b++)for(let j=0;j<4;j++)for(let i=0;i<5;i++){const x=CX-150+b*170+i*28,y=CY0-50+j*28;const on=hash(i*5+j*9+b*31+fr(t)*7)<0.35;
      if(on){g.fillStyle=WHITE;g.fillRect(x,y,22,22)}else{g.strokeStyle=WHITE;g.lineWidth=1.5;g.strokeRect(x+0.75,y+0.75,20.5,20.5)}}}],
 [11.55,11.65,(l,t)=>{const g=g_();g.setTransform(M());for(let i=0;i<46;i++){const hh=4+30*Math.abs(Math.sin(i*0.8+t*20))*Math.sin(i/45*PI);line(g,CX-180+i*8,CY0-hh,CX-180+i*8,CY0+hh,WHITE,2)}}],
 [11.65,11.75,(l,t)=>{for(let r=0;r<3;r++)mtext(noise(11,t,r),CX-140,CY0-30+r*34,30,WHITE,'left',400)}],
 [11.75,11.80,()=>dumbbell(CX,CY0,52,LIME)],
];
function IA(t){bgFill(INK);runSeq(SEQ_A,t)}

// ===================== SEQUENCE B  (14.8 – 26.8): plate → seal → glyphs → poster climax → lime/blue burst =====================
// poster: a dense sheet of every micrographic, alive and glitching (the reference's climax), 16:9
function poster(t,t0,sc=1,ox=0,oy=0){const g=g_();const lt=t-t0;const PX=150,PY=80,PW=W-300,PH=H-160;
  const m=M().translate(W/2+ox,H/2+oy).scale(sc).translate(-W/2,-H/2);
  g.save();g.setTransform(m);g.fillStyle='#121211';g.beginPath();g.roundRect(PX,PY,PW,PH,14);g.fill();g.restore();
  const cells=[];const cell=(x,y,w,h,fn,k)=>cells.push([x,y,w,h,fn,k]);
  const L0=PX+40,T0=PY+36;
  // header row: pixel titles + icons
  for(let i=0;i<6;i++)cell(L0+i*120,T0,104,34,(x,y,w,h)=>{const rows=[0,1,2].map(j=>[...Array(13)].map((_,q)=>hash(i*91+j*17+q*7+Math.floor(lt*8)*(i%2))<0.55?'1':'0').join(''));
      g.fillStyle=WHITE;rows.forEach((r,j)=>[...r].forEach((b,q)=>{if(b==='1')g.fillRect(x+q*8,y+j*10,7,9)}))},i);
  cell(L0+760,T0,120,34,(x,y)=>{g.fillStyle=WHITE;for(let a=0;a<4;a++){g.beginPath();g.arc(x+12+a*26,y+17,a===2?12:6,0,7);g.fill()}},6);
  cell(L0+910,T0,170,34,(x,y)=>{g.strokeStyle=WHITE;g.lineWidth=2;g.beginPath();g.arc(x+30,y+17,14,0,7);g.stroke();g.beginPath();g.arc(x+50,y+17,14,0,7);g.stroke();line(g,x+70,y+17,x+160,y+17,WHITE,2)},7);
  cell(L0+1110,T0,200,34,(x,y)=>{for(let a=0;a<6;a++)for(let b=0;b<3;b++){g.fillStyle=hash(a*7+b*3+Math.floor(lt*10))<0.6?WHITE:'#333';g.beginPath();g.arc(x+12+a*24,y+6+b*12,4.5,0,7);g.fill()}},8);
  // row 1
  cell(L0,T0+60,300,190,(x,y,w,h)=>{g.fillStyle=WHITE;g.fillRect(x,y,w,h);g.strokeStyle=INK;g.lineWidth=2;for(let k=0;k<7;k++){const a=-0.9+k*0.3;line(g,x+w,y+h/2,x+w+Math.cos(PI+a)*400,y+h/2+Math.sin(PI+a)*400,INK,2)}
      for(let k=1;k<4;k++){g.beginPath();g.arc(x+w,y+h/2,k*70,PI*0.5,PI*1.5);g.stroke()}},9);
  cell(L0+330,T0+60,520,70,(x,y)=>{const rows=[0,1,2,3].map(j=>[...Array(40)].map((_,q)=>hash(j*13+q*5+Math.floor(lt*6))<0.5?'1':'0').join(''));g.fillStyle=WHITE;rows.forEach((r,j)=>[...r].forEach((b,q)=>{if(b==='1')g.fillRect(x+q*13,y+j*16,12,14)}))},10);
  cell(L0+330,T0+150,520,90,(x,y)=>{g.strokeStyle=WHITE;g.lineWidth=3;for(let r=0;r<3;r++){g.beginPath();for(let q=0;q<=26;q++){const xx=x+q*20,yy=y+20+r*12+(q%2?30:0)+Math.sin(lt*6)*2;q?g.lineTo(xx,yy):g.moveTo(xx,yy)}g.stroke()}},11);
  cell(L0+880,T0+60,240,180,(x,y)=>{g.strokeStyle=WHITE;g.lineWidth=3;g.beginPath();g.arc(x+80,y+90,70,0,7);g.stroke();g.beginPath();g.ellipse(x+80,y+90,30,70,0,0,7);g.stroke();line(g,x+10,y+90,x+150,y+90,WHITE,3);
      g.fillStyle='#121211';g.beginPath();g.arc(x+150,y+90,58,0,7);g.fill();g.strokeStyle=WHITE;g.beginPath();g.arc(x+150,y+90,58,0,7);g.stroke();g.font=FINAL(30);g.fillStyle=WHITE;g.textAlign='center';g.fillText('www',x+150,y+101);g.textAlign='left'},12);
  cell(L0+1160,T0+60,60,440,(x,y)=>{g.fillStyle=WHITE;for(let k=0;k<14;k++){const yy=y+k*30+((lt*60)%30);g.beginPath();g.moveTo(x,yy);g.lineTo(x+40,yy+14);g.lineTo(x+60,yy+14);g.lineTo(x+60,yy+24);g.lineTo(x+40,yy+24);g.lineTo(x,yy+10);g.fill()}},13);
  // row 2
  cell(L0,T0+270,1120,56,(x,y,w,h)=>{g.strokeStyle=WHITE;g.lineWidth=3;g.beginPath();g.roundRect(x,y,w,h,28);g.stroke();
      const s='MADE IN CODE. FRAME BY FRAME. 1989 — 2026';const n=Math.floor(clamp((t-(t0+0.9))/1.4)*s.length);mono(g,s.slice(0,n)+(n<s.length&&Math.floor(t*4)%2?'█':''),x+28,y+36,WHITE,22,500)},14);
  cell(L0,T0+350,360,96,(x,y,w,h)=>{g.fillStyle=WHITE;g.beginPath();g.roundRect(x,y,w,h,8);g.fill();g.strokeStyle=INK;g.lineWidth=3;g.beginPath();g.arc(x+44,y+48,26,0,7);g.stroke();g.font=FINAL(28);g.fillStyle=INK;g.fillText('C',x+34,y+59);
      ['ALL MOTION IN THIS REEL IS RENDERED','IN CODE, FRAME BY FRAME. NO KEYFRAMES,','NO TIMELINE — ONLY t.'].forEach((s,i)=>mono(g,s,x+86,y+30+i*20,INK,12,500))},15);
  cell(L0+400,T0+350,360,96,(x,y)=>{for(let q=0;q<48;q++){const hh=(8+38*Math.abs(Math.sin(q*0.5+lt*9)))*(q<6||q>40?0.4:1);line(g,x+q*7.5,y+48-hh,x+q*7.5,y+48,WHITE,3)}},16);
  cell(L0+800,T0+350,320,96,(x,y)=>{for(let q=0;q<56;q++){const hh=4+30*Math.abs(Math.sin(q*1.3+lt*14))*Math.sin(q/55*PI);line(g,x+q*5.7,y+48-hh,x+q*5.7,y+48+hh,WHITE,2)}},17);
  // row 3
  cell(L0,T0+470,280,150,(x,y)=>{for(let b=0;b<3;b++)for(let j=0;j<3;j++)for(let i=0;i<4;i++){const xx=x+b*96+i*20,yy=y+j*20;const on=hash(i+j*7+b*31+Math.floor(lt*7)*3)<0.4;g.fillStyle=WHITE;g.strokeStyle=WHITE;g.lineWidth=1.5;on?g.fillRect(xx,yy,16,16):g.strokeRect(xx+0.75,yy+0.75,14.5,14.5)}
      line(g,x,y+100,x+260,y+100,WHITE,1.5);mono(g,'10',x,y+90,WHITE,10,400);const pts=[[20,130],[80,108],[140,122],[200,104],[250,96]];g.strokeStyle=LIME;g.lineWidth=2.5;g.beginPath();pts.forEach(([a,b],i)=>{const yy=y+b+Math.sin(lt*5+i)*6;i?g.lineTo(x+a,yy):g.moveTo(x+a,yy)});g.stroke()},18);
  cell(L0+300,T0+470,250,150,(x,y)=>{g.strokeStyle=WHITE;g.lineWidth=2;[[0,0],[100,0],[0,64],[100,64]].forEach(([a,b],i)=>{g.beginPath();g.moveTo(x+a,y+b+12);g.lineTo(x+a+30,y+b+12);g.lineTo(x+a+38,y+b+20);g.lineTo(x+a+86,y+b+20);g.lineTo(x+a+86,y+b+56);g.lineTo(x+a,y+b+56);g.closePath();if(i%2&&Math.floor(lt*4)%2){g.fillStyle=WHITE;g.fill()}else g.stroke()})},19);
  cell(L0+580,T0+470,330,150,(x,y)=>{g.font=FINAL(64);g.letterSpacing='-2px';g.strokeStyle=WHITE;g.lineWidth=2;g.strokeText('MADE IN',x,y+60);g.strokeText('CODE',x,y+126);g.letterSpacing='0px'},20);
  cell(L0+940,T0+470,370,150,(x,y)=>{g.strokeStyle=WHITE;g.lineWidth=2.5;g.beginPath();g.roundRect(x,y+10,210,44,22);g.stroke();g.beginPath();g.arc(x+22,y+32,14,0,7);g.stroke();mono(g,'150 BPM / 35 SEC',x+46,y+38,WHITE,12,500);
      g.fillStyle=WHITE;g.beginPath();g.arc(x+270,y+32,26,0,7);g.fill();hatchP(x+150,y+100,150,40,t);g.setTransform(m);g.strokeStyle=WHITE;g.lineWidth=2.5;g.beginPath();g.roundRect(x,y+80,48,34,6);g.stroke()},21);
  // footer
  cell(L0,PY+PH-110,400,90,(x,y)=>{g.font=FINAL(52);g.letterSpacing='-2px';g.fillStyle=WHITE;g.fillText('REEL',x,y+40);g.fillText('2026',x,y+86);g.letterSpacing='0px'},22);
  cell(L0+460,PY+PH-60,600,30,(x,y)=>{mono(g,'MOTION / CODE / DESIGN',x,y+16,WHITE,12,500);mono(g,'REEL 2026, VOLUME 1',x+360,y+16,WHITE,12,500)},23);
  cell(PX+PW-120,PY+PH-110,80,80,(x,y)=>{g.strokeStyle=WHITE;g.lineWidth=3;g.beginPath();g.arc(x+40,y+40,34,0,7);g.stroke();g.font=FINAL(40);g.fillStyle=WHITE;g.textAlign='center';g.fillText('1',x+40,y+54);g.textAlign='left'},24);
  // build-in: cells pop on within ~0.5 s (1–2 frames apart), then a glitch flips a cell every 2 frames
  const gk=Math.floor(t*15);
  cells.forEach(([x,y,w,h,fn,k])=>{const on=lt>hash(k*37)*0.45;if(!on)return;g.save();g.setTransform(m);g.beginPath();g.rect(x-6,y-6,w+12,h+12);g.clip();
    const inv=lt>0.6&&hash(k*13+gk*7)<0.07;const blurF=lt>0.6&&hash(k*29+gk*3)<0.04;if(blurF)g.filter=`blur(${5*S*sc}px)`;
    if(inv){g.fillStyle=WHITE;g.fillRect(x-4,y-4,w+8,h+8);g.globalCompositeOperation='difference'}
    fn(x,y,w,h);g.globalCompositeOperation='source-over';g.filter='none';g.restore()});
}
const SEQ_B=[
 [14.80,15.25,(l,t)=>{footage(CX+130,CY0-40,360,280,t,21);const g=g_();g.setTransform(M());const x=CX-180,y=CY0-20;g.fillStyle=WHITE;g.beginPath();g.roundRect(x,y,360,62,6);g.fill();
    g.fillStyle=INK;g.font=FINAL(44);g.fillText('↙',x+14,y+48);g.fillText('R',x+66,y+48);g.strokeStyle=INK;g.lineWidth=2;g.beginPath();g.arc(x+340,y+16,8,0,7);g.stroke();
    mtext(resolveTxt('NEW EDITION',t,14.82,0.3),x,y-12,13,WHITE,'left',700);mtext(resolveTxt('© 2026. ALL MOTION IN CODE',t,14.85,0.35),x,y+82,13,WHITE,'left',500)}],
 [15.25,15.65,(l,t)=>{if(l<0.27)footage(CX,CY0+20,W*0.8,160,t,23,22);const g=g_();g.setTransform(M());g.strokeStyle=WHITE;g.lineWidth=4;g.beginPath();g.arc(CX,CY0,46,0,7);g.stroke();
    if(l<0.05){line(g,CX,CY0-22,CX,CY0+22,WHITE,6)}else{g.lineWidth=5;g.beginPath();g.arc(CX,CY0,22,0.6,2*PI-0.6);g.stroke()}
    const s='MOTION · DESIGN · 2026 · ALL IN CODE · ';g.font='500 15px GM';g.fillStyle=WHITE;for(let i=0;i<s.length;i++){g.save();g.setTransform(M().translate(CX,CY0).rotate((i/s.length*360)+t*40));g.fillText(s[i],-4,-66);g.restore()}}],
 [15.65,15.95,(l,t)=>{const k=Math.min(2,Math.floor(l/0.1));pix(CX+(k===2?40:0),CY0,22,[PXG[4],PXG[2],PXG[3]][k]);if(k===1)footage(CX+80,CY0,220,200,t,25);if(k===1)pix(CX,CY0,22,PXG[2])}],
 [15.95,16.35,(l,t)=>{const g=g_();g.setTransform(M());if(l<0.25){const w=lerp(40,110,oX(l/0.25));line(g,CX-w,CY0,CX+w,CY0,WHITE,2);line(g,CX-10,CY0-14,CX+10,CY0-14,WHITE,2);line(g,CX-10,CY0+14,CX+10,CY0+14,WHITE,2);g.fillStyle=WHITE;g.beginPath();g.moveTo(CX,CY0-7);g.lineTo(CX+6,CY0);g.lineTo(CX,CY0+7);g.lineTo(CX-6,CY0);g.fill()}
    else if(l<0.3)mtext('*',CX,CY0+14,40,WHITE,'center',400);else{mtext(noise(6,t,3),CX-60,CY0-6,36,WHITE,'left',400);mtext(noise(2,t,4),CX-60,CY0+34,36,WHITE,'left',400)}}],
 [16.35,16.55,(l,t)=>{btext(l<0.1?'REEL+9*':'REEL2026',CX-150,CY0,52,WHITE,'left',-0.02);btext(l<0.1?'^-':'-26',CX-150,CY0+56,52,WHITE,'left',-0.02)}],
 [16.55,17.05,(l,t)=>{footage(CX,CY0,260,380,t,27);const g=g_();g.setTransform(M());for(let j=0;j<5;j++)for(let i=0;i<5;i++){const on=hash(i*7+j*13+fr(t)*5)<0.7;const r=on?13:5;g.fillStyle=WHITE;g.beginPath();g.arc(CX-100+i*50,CY0-100+j*50,r,0,7);g.fill()}}],
 [17.05,17.12,(l,t)=>{footage(CX-500,CY0+180,260,200,t,29);poster(t,16.4,0.32,-560,250)}],
 [17.12,17.25,(l,t)=>{blk(CX-330,CY0+130,190,190);const g=g_();g.save();g.setTransform(M());g.beginPath();g.rect(CX-180,0,W,H);g.clip();poster(t,16.4,0.62,170,0);g.restore()}],
 [17.25,19.65,(l,t)=>{poster(t,17.25,1,0,0);if(t>19.25&&t<19.32){blk(CX+430,CY0+180,560,440)}}],
 [19.65,19.85,(l,t)=>{// poster glitches away: rows drop out frame by frame
    const g=g_();g.save();g.setTransform(M());g.beginPath();const k=Math.floor(l*30);for(let r=0;r<12;r++)if(hash(r*11+k*3)>l*4)g.rect(0,r*90,W,90);g.clip();poster(t,17.25,1,0,0);g.restore()}],
 // lime / blue burst
 [22.05,22.25,()=>{bgFill(INK);blk(CX,CY0,10,46)}],
 [22.25,22.45,(l,t)=>{bgFill(INK);crossX(CX,CY0,lerp(46,40,l),4);if(l>0.1){bevel(CX-120,CY0,70,12);bevel(CX+120,CY0,70,12)}}],
 [22.45,22.65,()=>{bgFill(INK);crossX(CX,CY0,16,2.5)}],
 [22.65,23.40,(l,t)=>{bgFill(INK);const s='MOTION™ × CODE';const n=Math.floor(clamp(l/0.3)*s.length);const g=g_();g.setTransform(M());g.font=FINAL(38);g.letterSpacing='-1px';g.textAlign='center';
    let out='';for(let i=0;i<s.length;i++)out+=i<n?s[i]:' ';g.fillStyle=WHITE;g.fillText(out,CX,CY0+14);if(n<s.length){g.filter=`blur(${4*S}px)`;g.fillText(s.slice(n,n+2).padStart(n+2),CX,CY0+14);g.filter='none'}g.letterSpacing='0px';g.textAlign='left'}],
 [23.40,24.20,(l,t)=>{bgFill(BLUE);const k=Math.floor(l/0.1);pix(CX+[0,-200,200,0,-120,120,0,0][k%8],CY0+[0,0,0,-80,60,60,0,0][k%8],30,PXG[k%PXG.length],LIME);if(k%3===1)ringP(CX,CY0,150,3,LIME);mtext(resolveTxt('GLYPH '+String(k+1).padStart(2,'0')+' / 08',t,23.4+k*0.1,0.08),CX-420,CY0+200,14,LIME)}],
 [24.20,25.00,(l,t)=>{bgFill(LIME);const k=Math.floor(l/0.2);const g=g_();g.setTransform(M());
    if(k===0){for(let i=0;i<46;i++){const hh=6+70*Math.abs(Math.sin(i*0.7+t*16))*Math.sin(i/45*PI);line(g,CX-230+i*10,CY0-hh,CX-230+i*10,CY0+hh,BLUE,4)}}
    if(k===1){for(let j=0;j<5;j++)for(let i=0;i<9;i++){g.fillStyle=BLUE;g.beginPath();g.arc(CX-200+i*50,CY0-100+j*50,hash(i+j*9+fr(t))<0.6?16:6,0,7);g.fill()}}
    if(k===2){dumbbell(CX,CY0,70,BLUE);hatchP(CX,CY0+150,300,40,t,BLUE)}
    if(k>=3){line(g,CX-250,CY0+90,CX+250,CY0+90,BLUE,2);const pts=[-220,-110,0,110,220];g.strokeStyle=BLUE;g.lineWidth=4;g.beginPath();pts.forEach((x,i)=>{const y=CY0+40*Math.sin(i*1.4+t*9);i?g.lineTo(CX+x,y):g.moveTo(CX+x,y)});g.stroke()}}],
 [25.00,25.80,(l,t)=>{bgFill(BLUE);const g=g_();g.setTransform(M());if(l<0.4){g.strokeStyle=LIME;g.lineWidth=4;g.beginPath();g.arc(CX,CY0,46,0,7);g.stroke();g.lineWidth=5;g.beginPath();g.arc(CX,CY0,22,0.6,2*PI-0.6);g.stroke();
      const s='MADE IN CODE · REEL 2026 · ';g.font='500 15px GM';g.fillStyle=LIME;for(let i=0;i<s.length;i++){g.save();g.setTransform(M().translate(CX,CY0).rotate(i/s.length*360-t*60));g.fillText(s[i],-4,-66);g.restore()}}
    else{const w=lerp(30,260,oX(P(l,0.4,0.6)));line(g,CX-w,CY0,CX+w,CY0,LIME,2);for(let i=-8;i<=8;i++)line(g,CX+i*30,CY0-(i%4?6:14),CX+i*30,CY0+(i%4?6:14),LIME,2);g.fillStyle=LIME;g.fillRect(CX-8+Math.sin(t*8)*200,CY0-8,16,16)}}],
 [25.80,26.40,(l,t)=>{bgFill(INK);mtext(resolveTxt('MADE-IN-CODE.2026',t,25.82,0.3,false),CX,CY0+5,14,WHITE,'center',500);if(l>0.45)mtext(noise(17,t,9),CX,CY0+5,14,WHITE,'center',500)}],
 [26.40,26.80,(l,t)=>{bgFill(INK);for(let r=0;r<4;r++)mtext(noise(14+r*3,t,r+20),CX-260+r*30,CY0-60+r*40,30,r===2?LIME:WHITE,'left',400)}],
];
// second rapid run (19.85–22.05): earlier shapes re-cut, each landing somewhere new in the frame
const PICK=[[6.80,7.13,[-520,-160]],[7.13,7.53,[460,120]],[7.73,8.07,[0,-240]],[9.00,9.67,[520,60]],[11.15,11.35,[-480,200]],[11.35,11.55,[300,-200]]];
const SEQ_C=[];{let c=19.85;PICK.forEach(([a,b,off])=>{const f=SEQ_A.find(s=>s[0]===a)||SEQ_A.find(s=>s[0]<=a&&s[1]>a);
  // gather every SEQ_A shot inside [a,b) so multi-shot picks keep their internal cuts
  SEQ_A.filter(s=>s[0]>=a&&s[1]<=b).forEach(([sa,sb,fn])=>{SEQ_C.push([c+(sa-a),c+(sb-a),(l,t)=>{OFFM=new DOMMatrix().translate(off[0],off[1]);fn(l,sa+l);OFFM=new DOMMatrix()}])});c+=b-a})}
function IB(t){bgFill(INK);runSeq(SEQ_B,t);runSeq(SEQ_C,t)}

// ===================== wire into the montage =====================
SHOTS.length=0;
[[6.6,IA,'carry'],[11.8,L1,'carry'],[14.8,IB,'carry'],[26.8,L6,'recap'],[31.0,null,'cut'],[32.6,VEND,null]].forEach(x=>SHOTS.push(x));
RECAP=function(t){const k=Math.min(3,Math.floor((t-31.0)/BEAT));const picks=[[IB,18.6],[L1,13.9],[IA,10.7],[L6,28.6]];const[f,tt]=picks[k];
  const lt=(t-31.0)%BEAT;OFFM=new DOMMatrix().translate(W/2,H/2).scale(1.18-0.18*oX(lt/0.35)).translate(-W/2,-H/2);f(tt+lt);OFFM=new DOMMatrix();
  if(lt<0.05){gb.setTransform(1,0,0,1,0,0);gb.fillStyle='rgba(255,255,255,0.85)';gb.fillRect(0,0,W,H)}};

function drawBlobs(){}

// ======================= v4 upgrades (Remotion build) =======================
// 1) every hard cut on the 30 fps grid, so in-engine motion blur (forward shutter) never straddles a cut
const SNAP=x=>Math.round(x*30)/30;
[SEQ_A,SEQ_B,SEQ_C].forEach(seq=>seq.forEach(s=>{s[0]=SNAP(s[0]);s[1]=SNAP(s[1])}));

// 2) footage cards: real 3D ribbon renders (Three.js, studio lighting), defocused like the reference
function footage(x,y,w,h,t,seed=1,blurPx=16){
  const g=gb;g.save();g.setTransform(base());g.beginPath();g.rect(x-w/2,y-h/2,w,h);g.clip();
  g.fillStyle='#0b0b0a';g.fillRect(x-w/2,y-h/2,w,h);
  if(env.ribbons){const c=env.ribbons(w,h,t,seed);g.filter=`blur(${Math.max(1.5,blurPx*0.28)*S}px)`;g.drawImage(c,0,0,c.width,c.height,x-w/2,y-h/2,w,h);g.filter='none'}
  g.restore()}

// 3) ripple field: a real 3D point ocean (Three.js), engine draws the falling core + caption on top
function L1(t){const s=11.8;if(!env.ocean){return L1_2D(t)}
  const c=env.ocean(t);gb.save();gb.setTransform(1,0,0,1,0,0);gb.drawImage(c,0,0,W*S,H*S);gb.restore();
  const m=base();
  if(t<12.02){const p=iX(P(t,11.8,12.0));const y=lerp(-200,H/2,p);gb.setTransform(m);gb.fillStyle=LIME;gb.beginPath();gb.ellipse(W/2,y,22,22+90*p,0,0,7);gb.fill()}
  caption(t,s,'01','RIPPLE FIELD','3D POINT OCEAN / 22,176 POINTS',LIME)}

// 4) everything the score and the effects need to know about the cut
function cutTimes(){const c=new Set();
  [SEQ_A,SEQ_B,SEQ_C].forEach(seq=>seq.forEach(s=>c.add(+s[0].toFixed(4))));
  SHOTS.forEach(s=>c.add(+SNAP(s[0]).toFixed(4)));[31.0,31.4,31.8,32.2].forEach(x=>c.add(x));
  return [...c].sort((a,b)=>a-b)}
return {paint,cutTimes,W,H,IMP:(typeof IMP!=='undefined'?IMP:[])};
