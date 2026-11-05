/*  REEL 2026 (v3) — After Effects project builder
    File > Scripts > Run Script File… and pick this file (keep the folder structure next to it).

    Builds, natively and fully editable:
      • 01 OPENER   1989→2026 odometer counter (expression-driven, exact tick timing), decade colour flips,
                    slam flash + camera shake, year strip, progress rail, speed readout,
                    2026 → REEL decode in the "Lockup in Motion" grammar (band wipe, half glyph → grey → white,
                    cursor block, macron, tracking snap, scrambling mono lines)
      • 02 MICRO RUN A / 03 RIPPLE / 04 MICRO RUN B + POSTER / 05 ASCII / 06 RECAP — cut from the 1080p plate,
        every hard cut marked inside the precomps, live captions on 03 and 05
      • 07 END CARD (native decode + odometer)
      • beat markers at 150 BPM, shot markers, the score (audio/score.wav)
    Fonts: install fonts/InterTight-Bold.ttf and fonts/GeistMono-Medium.ttf first (SIL OFL).
*/
(function REEL2026(){
  var W=1920,H=1080,FPS=30,DUR=35,BEAT=0.4;
  var LIME=[0.612,0.980,0.039],BLUE=[0.114,0.059,0.969],INK=[0.027,0.027,0.027],WHITE=[0.949,0.949,0.933],
      GREY=[0.490,0.490,0.471],G1=[0.561,0.561,0.541],G2=[0.722,0.722,0.698],SOFT=[0.784,0.784,0.761];
  var F_BOLD="InterTight-Bold",F_MONO="GeistMono-Medium";
  var ROOT=(new File($.fileName)).parent;

  if(!app.project)app.newProject();
  var proj=app.project;
  app.beginUndoGroup("Build REEL 2026");
  var bin=proj.items.addFolder("REEL 2026");
  var binPre=proj.items.addFolder("_precomps");binPre.parentFolder=bin;
  var binSrc=proj.items.addFolder("_sources");binSrc.parentFolder=bin;

  // ---------------- helpers ----------------
  function mkComp(name,w,h,d,parent){var c=proj.items.addComp(name,w,h,1,d,FPS);c.parentFolder=parent||binPre;c.bgColor=INK;return c}
  function solid(c,name,col,w,h){var l=c.layers.addSolid(col,name,w||c.width,h||c.height,1,c.duration);return l}
  function text(c,str,font,size,col,just,tracking){
    var l=c.layers.addText(str);var p=l.property("ADBE Text Properties").property("ADBE Text Document");var d=p.value;
    d.resetCharStyle();d.resetParagraphStyle();d.font=font;d.fontSize=size;d.applyFill=true;d.fillColor=col;d.applyStroke=false;
    d.justification=just||ParagraphJustification.LEFT_JUSTIFY;d.tracking=tracking||0;p.setValue(d);return l}
  function setLeading(l,lead){var p=l.property("ADBE Text Properties").property("ADBE Text Document");var d=p.value;try{d.autoLeading=false;d.leading=lead}catch(e){}p.setValue(d)}
  function srcText(l){return l.property("ADBE Text Properties").property("ADBE Text Document")}
  function tr(l,name){return l.property("ADBE Transform Group").property(name)}
  function fill(l,col){var e=l.property("ADBE Effect Parade").addProperty("ADBE Fill");e.property("ADBE Fill-0002").setValue(col);return e.property("ADBE Fill-0002")}
  function slider(l,name,val){var e=l.property("ADBE Effect Parade").addProperty("ADBE Slider Control");e.name=name;e.property("ADBE Slider Control-0001").setValue(val||0);return e.property("ADBE Slider Control-0001")}
  function rectShape(x1,y1,x2,y2){var s=new Shape();s.vertices=[[x1,y1],[x2,y1],[x2,y2],[x1,y2]];s.closed=true;return s}
  function addMask(l,shape){var m=l.property("ADBE Mask Parade").addProperty("ADBE Mask Atom");m.property("ADBE Mask Shape").setValue(shape);return m.property("ADBE Mask Shape")}
  function holdAll(p){for(var k=1;k<=p.numKeys;k++)p.setInterpolationTypeAtKey(k,KeyframeInterpolationType.HOLD,KeyframeInterpolationType.HOLD)}
  // expo-out feel: leave fast, arrive very slowly (AE speed graph ~ easeOutExpo)
  function expoOut(p){for(var k=1;k<=p.numKeys;k++){var dims=1;
      if(p.propertyValueType==PropertyValueType.TwoD)dims=2;else if(p.propertyValueType==PropertyValueType.ThreeD)dims=3;
      var e=[];var ein=[];for(var i=0;i<dims;i++){e.push(new KeyframeEase(0,0.1));ein.push(new KeyframeEase(0,92))}
      try{p.setTemporalEaseAtKey(k,ein,e)}catch(err){}}}
  function expoIn(p){for(var k=1;k<=p.numKeys;k++){var dims=1;
      if(p.propertyValueType==PropertyValueType.TwoD)dims=2;else if(p.propertyValueType==PropertyValueType.ThreeD)dims=3;
      var eo=[];var ei=[];for(var i=0;i<dims;i++){eo.push(new KeyframeEase(0,92));ei.push(new KeyframeEase(0,0.1))}
      try{p.setTemporalEaseAtKey(k,ei,eo)}catch(err){}}}
  function keys(p,ts,vs){for(var i=0;i<ts.length;i++)p.setValueAtTime(ts[i],vs[i])}
  function marker(c,t,s){try{c.markerProperty.setValueAtTime(t,new MarkerValue(s));return true}catch(e){return false}}
  function J(a){return a.join("\n")}

  // shared expression snippets
  var EX_EASE="function oX(p){p=Math.max(0,Math.min(1,p));return p>=1?1:1-Math.pow(2,-10*p);}";
  var EX_YEAR=J([
    "// exact tick timing: 37 ticks, slow → blur through the 2000s → slow into the slam at 4.4s",
    EX_EASE,
    "var T0=0.5,T1=4.4,NY=37,D=[],s=0,i;",
    "for(i=0;i<NY;i++){var d=0.045+0.32*Math.pow(1-Math.sin(Math.PI*i/(NY-1)),2.6);D.push(d);s+=d;}",
    "for(i=0;i<NY;i++)D[i]*=(T1-T0)/s;",
    "var t=time,v;",
    "if(t<T0)v=1989;else if(t>=T1)v=2026;else{var a=T0;i=0;while(i<NY-1&&a+D[i]<=t){a+=D[i];i++;}",
    "var roll=Math.min(0.14,D[i]*0.95);v=1989+i+oX((t-a)/roll);}",
    "v;"]);
  function exDecode(str,t0,per){ // mono decode: resolves left→right, 3 scramble chars ahead
    return J(["var s="+JSON_str(str)+",t0="+t0+",per="+per+",SCR=\"?%#:/<*;+=!^&$0\",out=\"\";",
      "seedRandom(Math.floor(time*30),true);",
      "if(time>=t0){var n=Math.floor((time-t0)/per);for(var i=0;i<s.length;i++){var c=s.charAt(i);",
      "if(i<n||c==\" \")out+=c;else if(i<n+3)out+=SCR.charAt(Math.floor(random(SCR.length)));else break;}}",
      "out;"])}
  function JSON_str(s){return "\""+s.replace(/\\/g,"\\\\").replace(/"/g,"\\\"")+"\""}

  // odometer: 4 digit-column precomps reading a "Value" slider on a CTRL null in the host comp
  function odometer(host,ctrlLayerName,prefix,cx,cy,size,colExpr,inPt){
    var tmp=text(host,"0",F_BOLD,size,WHITE);var cw=Math.round(tmp.sourceRectAtTime(0,false).width*1.06)+2;tmp.remove();
    var cellH=Math.round(size*0.98),DH=size*0.92,Y0=size*0.82;var layers=[];
    for(var k=0;k<4;k++){
      var dc=mkComp(prefix+" DIGIT "+(k+1),cw,cellH,host.duration);
      var col=text(dc,"0\r1\r2\r3\r4\r5\r6\r7\r8\r9\r0\r1",F_BOLD,size,WHITE,ParagraphJustification.CENTER_JUSTIFY);setLeading(col,DH);
      tr(col,"ADBE Position").expression=J(["var v=comp("+JSON_str(host.name)+").layer("+JSON_str(ctrlLayerName)+").effect(\"Value\")(\"Slider\");",
        "var pw="+Math.pow(10,3-k)+",b=Math.floor(v+1e-6),f=v-b,pos=Math.floor(b/pw)%10;","if(pw==1||b%pw==pw-1)pos+=f;",
        "["+(cw/2)+","+Y0+"-pos*"+DH+"];"]);
      var L=host.layers.add(dc);L.name=prefix+" "+(k+1);
      tr(L,"ADBE Position").setValue([cx-cw*2+cw*(k+0.5),cy-Y0+cellH/2]);
      var fc=fill(L,WHITE);if(colExpr)fc.expression=colExpr;
      if(inPt!==undefined)L.inPoint=inPt;
      layers.push(L)}
    return {layers:layers,cw:cw,cellH:cellH,Y0:Y0};
  }

  // the Lockup-in-Motion decode, built from keyframes (see notes in the header)
  function lockDecode(c,from,to,cx,cy,size,t0,digitLayers,cw,cellH,mini){
    var top=cy-size*0.73,hh=size*0.73;
    // 1) digits leave through a falling band (mask keys on each digit precomp)
    for(var i=0;i<digitLayers.length;i++){var D=digitLayers[i];var mk=addMask(D,rectShape(-4,-4,cw+4,cellH+4));
      mk.setValueAtTime(t0+i*0.05,rectShape(-4,-4,cw+4,cellH+4));mk.setValueAtTime(t0+0.13+i*0.05,rectShape(-4,cellH+2,cw+4,cellH+4));expoOut(mk)}
    // 2) letters: measure, place wide, snap tight
    var Ls=[],ws=[],tot=0,trk=-size*0.04;
    for(var i=0;i<to.length;i++){var l=text(c,to.charAt(i),F_BOLD,size,WHITE,ParagraphJustification.CENTER_JUSTIFY);l.name="REEL — "+to.charAt(i)+(i+1);
      var w=l.sourceRectAtTime(t0,false).width;ws.push(w);tot+=w+(i<to.length-1?trk:0);Ls.push(l)}
    var TA=[0,0.1,0.23,0.3];var x=cx-tot/2;var fx=[],wx=[];
    for(var i=0;i<to.length;i++){fx.push(x+ws[i]/2);x+=ws[i]+trk;wx.push(cx+(i-(to.length-1)/2)*size*1.08)}
    for(var i=0;i<Ls.length;i++){var l=Ls[i],ta=t0+0.26+TA[i];
      var op=tr(l,"ADBE Opacity");keys(op,[0,ta],[0,100]);holdAll(op);
      var ps=tr(l,"ADBE Position");keys(ps,[ta,ta+0.05,ta+0.12,t0+0.78,t0+1.25],[[wx[i],cy-size*0.06],[wx[i],cy+size*0.05],[wx[i],cy],[wx[i],cy],[fx[i],cy]]);
      ps.setInterpolationTypeAtKey(1,KeyframeInterpolationType.HOLD,KeyframeInterpolationType.HOLD);expoOut(ps);
      var fc=fill(l,G1);keys(fc,[ta,ta+0.05,ta+0.12],[G1,G2,WHITE]);holdAll(fc);
      var mk=addMask(l,rectShape(-size,-size*1.1,size,-size*0.36));mk.setValueAtTime(ta,rectShape(-size,-size*1.1,size,-size*0.36));mk.setValueAtTime(ta+0.05,rectShape(-size,-size*1.1,size,size*0.4));holdAll(mk);
      l.inPoint=Math.max(0,ta-0.01)}
    // 3) cursor block: leads letter to letter, stretches, retracts from the left
    var blk=solid(c,"CURSOR BLOCK",WHITE,Math.round(size*0.62),Math.round(hh));tr(blk,"ADBE Anchor Point").setValue([0,hh/2]);
    var last=t0+0.26+TA[3],bp=tr(blk,"ADBE Position"),bs=tr(blk,"ADBE Scale");var bw=size*0.62;
    var slotX=function(k){return (k<to.length?wx[k]:wx[to.length-1]+size*0.62)-size*0.31};
    var ts=[t0+0.16],ps=[[slotX(0),top+hh/2]];for(var k=0;k<to.length;k++){ts.push(t0+0.26+TA[k]);ps.push([slotX(k+1),top+hh/2])}
    keys(bp,ts,ps);holdAll(bp);
    var stretch=(bw+size*2.4)/bw*100;
    keys(bs,[last+0.06,last+0.2],[[100,100],[stretch,100]]);expoOut(bs);
    bp.setValueAtTime(last+0.24,[slotX(to.length),top+hh/2]);bp.setValueAtTime(last+0.43,[slotX(to.length)+bw*stretch/100,top+hh/2]);
    bs.setValueAtTime(last+0.24,[stretch,100]);bs.setValueAtTime(last+0.43,[0,100]);
    blk.inPoint=t0+0.16;blk.outPoint=last+0.45;
    // 4) macron dash
    var dash=solid(c,"MACRON",WHITE,Math.round(size*0.24),Math.max(3,Math.round(size*0.045)));
    var dp=tr(dash,"ADBE Position");keys(dp,[t0+0.78,t0+1.25],[[wx[0]-size*0.08,cy-size*0.9],[fx[0]-size*0.08,cy-size*0.9]]);expoOut(dp);dash.inPoint=t0+0.26;dash.outPoint=t0+1.6;
    // 5) tiny mono lines + pulsing block
    if(mini){var lx=cx-tot/2+4,ly=cy-size*1.08;
      var a=text(c," ",F_MONO,14,WHITE);a.name="MINI — SHOWREEL 2026";srcText(a).expression=exScramble("SHOWREEL 2026",t0+0.05,t0+0.35,0.028);tr(a,"ADBE Position").setValue([lx,ly]);
      var b=text(c," ",F_MONO,14,GREY);b.name="MINI — MOTION · CODE · DESIGN";srcText(b).expression=exScramble("MOTION · CODE · DESIGN",t0+0.13,t0+0.5,0.028);tr(b,"ADBE Position").setValue([lx,ly+20]);
      var pb=solid(c,"PULSE BLOCK",SOFT,34,22);tr(pb,"ADBE Position").setValue([cx,cy-size*1.6]);
      tr(pb,"ADBE Scale").expression="var on=Math.floor((time-"+t0+")/0.2)%2==0; on?[64.7,100]:[100,50];";pb.inPoint=t0;pb.outPoint=t0+1.7}
    return {fx:fx,tot:tot};
  }
  function exScramble(s,tShow,tRes,per){ // full-length noise line that resolves left → right (the reference's mono lines)
    return J(["var s="+JSON_str(s)+",SCR=\"?%#:/<*;+=!^&$0\",out=\"\";seedRandom(Math.floor(time*24),true);",
      "if(time>="+tShow+"){for(var j=0;j<s.length;j++){var c=s.charAt(j);",
      "out+=(time>"+tRes+"+j*"+per+"||c==\" \")?c:SCR.charAt(Math.floor(random(SCR.length)));}}","out;"])}

  // ================= 01 OPENER (0 – 6.85) =================
  var OP=mkComp("01 OPENER — COUNTER + DECODE",W,H,6.85);
  var CTRL=OP.layers.addNull(6.85);CTRL.name="CTRL";var yv=slider(CTRL,"Value",1989);yv.expression=EX_YEAR;
  var CAM=OP.layers.addNull(6.85);CAM.name="CAM (slam shake)";tr(CAM,"ADBE Position").setValue([W/2,H/2]);
  tr(CAM,"ADBE Position").expression=J(["var d=time-4.4;","if(d>0){var a=22*Math.exp(-d*9)*Math.sin(d*95);value+[a,a*0.4];}else value;"]);
  tr(CAM,"ADBE Scale").expression=J(["var d=time-4.4;var k=d>0?1+0.1*Math.exp(-d*9):1;","var intro=time<0.5?1.15-0.15*(1-Math.pow(2,-10*time/0.5)):1;","[100*k*intro,100*k*intro];"]);
  var BG=solid(OP,"BG (decade colour)",INK);BG.moveToEnd();
  var V="comp(\""+OP.name+"\").layer(\"CTRL\").effect(\"Value\")(\"Slider\")";
  fill(BG,INK).expression=J(["var y=Math.floor("+V+"+1e-6);","if(time>=4.4&&time<4.47)["+LIME+",1];",
    "else if(time>=4.4)["+INK+",1];else if(y>=2020)["+INK+",1];else if(y>=2010)["+LIME+",1];else if(y>=2000)["+BLUE+",1];else ["+INK+",1];"]);
  var FG=J(["var y=Math.floor("+V+"+1e-6);","if(time>=4.4&&time<4.47)["+INK+",1];","else if(time>=4.4)["+WHITE+",1];else if(y>=2020)["+WHITE+",1];else if(y>=2010)["+BLUE+",1];else if(y>=2000)["+LIME+",1];else ["+WHITE+",1];"]);
  var CY=H/2+52,SZ=150;
  var od=odometer(OP,"CTRL","YEAR",W/2,CY,SZ,FG);
  for(var i=0;i<od.layers.length;i++){var L=od.layers[i];tr(L,"ADBE Opacity").setValue(100);
    // rise in at the start
    var p=tr(L,"ADBE Position"),v0=p.value;keys(p,[0.05,0.6],[[v0[0],v0[1]+170],v0]);expoOut(p);L.parent=CAM}
  // year strip, progress rail, labels
  var yrs="";for(var y=1989;y<=2026;y++)yrs+=y+(y<2026?"    ":"");
  var strip=text(OP,yrs,F_MONO,18,WHITE);strip.name="YEAR STRIP";
  tr(strip,"ADBE Position").expression=J(["var v="+V+",w=sourceRectAtTime(0,false).width,step=w/37.6;","["+W/2+"-(v-1989)*step-step*0.22,150];"]);
  fill(strip,WHITE).expression=FG;tr(strip,"ADBE Opacity").setValue(55);
  var rail=solid(OP,"RAIL",WHITE,W-320,2);tr(rail,"ADBE Position").setValue([W/2,931]);tr(rail,"ADBE Opacity").setValue(25);
  var bar=solid(OP,"PROGRESS",WHITE,W-320,10);tr(bar,"ADBE Anchor Point").setValue([0,5]);tr(bar,"ADBE Position").setValue([160,931]);
  tr(bar,"ADBE Scale").expression="[("+V+"-1989)/37*100,100];";fill(bar,WHITE).expression=FG;
  var l1=text(OP,"1989",F_MONO,16,WHITE);tr(l1,"ADBE Position").setValue([160,905]);fill(l1,WHITE).expression=FG;
  var l2=text(OP,"2026",F_MONO,16,WHITE,ParagraphJustification.RIGHT_JUSTIFY);tr(l2,"ADBE Position").setValue([W-160,905]);fill(l2,WHITE).expression=FG;
  var cnt=text(OP," ",F_MONO,14,WHITE);cnt.name="LABEL — COUNT";srcText(cnt).expression=exDecode("COUNT / 1989 — 2026",0.2,0.035);
  tr(cnt,"ADBE Position").setValue([W/2-od.cw*2+2,CY-96-SZ*0.82+SZ*0.82]);fill(cnt,WHITE).expression=FG;cnt.parent=CAM;cnt.outPoint=4.75;
  var spd=text(OP," ",F_MONO,14,WHITE,ParagraphJustification.RIGHT_JUSTIFY);spd.name="LABEL — SPEED";
  srcText(spd).expression=J(["var a=comp(\""+OP.name+"\").layer(\"CTRL\").effect(\"Value\")(\"Slider\");","var sp=Math.abs(a.valueAtTime(time+0.01)-a.valueAtTime(time-0.01))/0.02;","\"\\u0394 \"+sp.toFixed(1)+\" YR/S\";"]);
  tr(spd,"ADBE Position").setValue([W/2+od.cw*2-2,CY-96]);fill(spd,WHITE).expression=FG;spd.parent=CAM;spd.outPoint=4.75;
  // the decode: 2026 → REEL
  lockDecode(OP,"2026","REEL",W/2,CY,SZ,4.7,od.layers,od.cw,od.cellH,true);
  CTRL.moveToBeginning();CAM.moveToBeginning();
  marker(OP,4.4,"SLAM — 2026");marker(OP,4.7,"DECODE → REEL");

  // ================= sources: plate + score =================
  function imp(rel){var f=new File(ROOT.fsName+"/"+rel);if(!f.exists)return null;var it=proj.importFile(new ImportOptions(f));it.parentFolder=binSrc;return it}
  var PLATE=imp("plates/reel2026_plate_1080p.mp4"),SCORE=imp("audio/score.wav");
  var PLATE_T0=6.6;

  // ================= MAIN =================
  var MAIN=mkComp("REEL 2026 — MAIN",W,H,DUR,bin);
  // v3 structure. Cut lists = every hard cut inside the micro runs (Lockup-in-Motion grammar), added as precomp markers.
  var CUTS_A=[6.6, 6.67, 6.8, 7, 7.13, 7.4, 7.53, 7.73, 7.93, 8.07, 8.13, 8.2, 8.27, 8.4, 9, 9.67, 9.9, 10.3, 10.4, 10.55, 10.95, 11.15, 11.35, 11.55, 11.65, 11.75], CUTS_B=[14.8, 15.25, 15.65, 15.95, 16.35, 16.55, 17.05, 17.12, 17.25, 19.65, 19.85, 20.05, 20.18, 20.45, 20.58, 20.78, 20.92, 21.59, 21.79, 22.05, 22.25, 22.45, 22.65, 23.4, 24.2, 25, 25.8, 26.4];
  var SHOTS=[
    [6.6,11.8,"02 MICRO RUN A",null,null,null,CUTS_A],
    [11.8,14.8,"03 RIPPLE FIELD","01","RIPPLE FIELD","3D DOT OCEAN / 6,000 POINTS",null],
    [14.8,26.8,"04 MICRO RUN B + POSTER",null,null,null,CUTS_B],
    [26.8,31.0,"05 ASCII RENDERER","02","ASCII RENDERER","RAYMARCHED TORUS / 4,224 CELLS",null],
    [31.0,32.6,"06 RECAP",null,null,null,null]];
  for(var s=0;s<SHOTS.length;s++){var S=SHOTS[s],d=S[1]-S[0];var c=mkComp(S[2],W,H,d);
    if(PLATE){var pl=c.layers.add(PLATE);pl.startTime=-(S[0]-PLATE_T0);pl.name="PLATE";}
    else{var ph=solid(c,"PLATE MISSING — put plates/reel2026_plate_1080p.mp4 next to the script",[0.12,0.12,0.12]);var pt=text(c,S[2]+"\nplate missing",F_MONO,28,WHITE,ParagraphJustification.CENTER_JUSTIFY);tr(pt,"ADBE Position").setValue([W/2,H/2])}
    if(S[3]){var ti=text(c," ",F_MONO,18,LIME);ti.name="CAPTION — TITLE";srcText(ti).expression=exDecode(S[3]+" — "+S[4],0.1,0.02);tr(ti,"ADBE Position").setValue([64,H-82]);
      var su=text(c," ",F_MONO,15,WHITE);su.name="CAPTION — SUB";srcText(su).expression=exDecode(S[5],0.25,0.012);tr(su,"ADBE Position").setValue([64,H-58]);tr(su,"ADBE Opacity").setValue(55)}
    if(S[6]){for(var q=0;q<S[6].length;q++){var tq=S[6][q]-S[0];if(tq>=0&&tq<d)marker(c,tq,"CUT "+(q+1))}}
    var L=MAIN.layers.add(c);L.startTime=S[0];L.inPoint=S[0];L.outPoint=S[1];marker(MAIN,S[0],S[2])}
  // opener on top — in v3 REEL cuts straight into the first micrographic (no slice)
  var opL=MAIN.layers.add(OP);opL.name="01 OPENER";opL.startTime=0;opL.outPoint=6.6;

  // ================= 11 END CARD (32.6 – 35) =================
  var EC=mkComp("07 END CARD",W,H,DUR-32.6);solid(EC,"BG",INK).moveToEnd();
  var EC_CTRL=EC.layers.addNull(EC.duration);EC_CTRL.name="CTRL";
  slider(EC_CTRL,"Value",1989).expression=J([EX_EASE,"1989+37*oX((time-0.1)/1.0);"]);
  var eod=odometer(EC,"CTRL","END YEAR",W/2+144,H/2+30,96,"["+LIME+",1];");
  // REEL decodes from a static 2026 next to the counter
  var src=[];var tmp=text(EC,"0",F_BOLD,96,WHITE);var cw2=Math.round(tmp.sourceRectAtTime(0,false).width*1.06)+2;tmp.remove();
  for(var k=0;k<4;k++){var dl=text(EC,"2026".charAt(k),F_BOLD,96,WHITE,ParagraphJustification.CENTER_JUSTIFY);tr(dl,"ADBE Position").setValue([W/2-140-cw2*2+cw2*(k+0.5),H/2+30]);dl.name="FROM "+(k+1);
    var mk=addMask(dl,rectShape(-cw2,-96*0.8,cw2,20));mk.setValueAtTime(0+k*0.05,rectShape(-cw2,-96*0.8,cw2,20));mk.setValueAtTime(0.13+k*0.05,rectShape(-cw2,18,cw2,20));expoOut(mk);dl.outPoint=0.3}
  lockDecode(EC,"2026","REEL",W/2-140,H/2+30,96,0,[],cw2,96,false);
  var eb=solid(EC,"BAR",WHITE,480,3);tr(eb,"ADBE Anchor Point").setValue([0,1.5]);tr(eb,"ADBE Position").setValue([W/2-240,H/2+56]);var es=tr(eb,"ADBE Scale");keys(es,[0.5,1.0],[[0,100],[100,100]]);expoOut(es);
  var et=text(EC," ",F_MONO,14,GREY,ParagraphJustification.CENTER_JUSTIFY);et.name="END — LINE";srcText(et).expression=exDecode("MOTION DESIGN REEL — 2026",0.8,0.02);tr(et,"ADBE Position").setValue([W/2,H/2+96]);
  EC_CTRL.moveToBeginning();
  var EL=MAIN.layers.add(EC);EL.startTime=32.6;EL.moveToBeginning();marker(MAIN,32.6,"07 END CARD");

  // ================= score + beat grid =================
  if(SCORE){var au=MAIN.layers.add(SCORE);au.name="SCORE (150 BPM)";au.moveToEnd()}
  var BEATS=MAIN.layers.addNull(DUR);BEATS.name="BEATS — 150 BPM";BEATS.enabled=false;BEATS.guideLayer=true;
  var mp=BEATS.property("ADBE Marker");for(var b=0;b*BEAT<DUR;b++){var mv=new MarkerValue(b%4==0?("BAR "+(b/4+1)):"");mp.setValueAtTime(b*BEAT,mv)}
  marker(MAIN,0,"01 OPENER");marker(MAIN,4.4,"SLAM");marker(MAIN,4.7,"DECODE");
  MAIN.workAreaStart=0;MAIN.workAreaDuration=DUR;
  app.endUndoGroup();
  MAIN.openInViewer();
  alert("REEL 2026 built.\n\nMain comp: \"REEL 2026 — MAIN\"\n"+(PLATE?"":"⚠ Plate not found — shots show placeholders.\n")+(SCORE?"":"⚠ Score not found.\n")+"Fonts needed: Inter Tight Bold, Geist Mono Medium.");
})();
