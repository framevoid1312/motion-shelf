import json
from playwright.sync_api import sync_playwright
D=json.load(open('digits.json')); FPS=24; f=lambda n: round(n/FPS,4)
INK='#1c1a16'; GRAY='#8a8884'; RULE='#a9a7a2'; GRID='#dddbd6'
with sync_playwright() as p:
    b=p.chromium.launch(); pg=b.new_page(); pg.set_content('<canvas id=c></canvas>')
    W=lambda t,font: pg.evaluate("([t,f])=>{const c=document.getElementById('c').getContext('2d');c.font=f;return c.measureText(t).width}",[t,font])
    def words(line,font):
        out=[];x=0
        for i,w in enumerate(line.split(' ')):
            out.append((w,W(' '.join(line.split(' ')[:i])+(' ' if i else ''),font))); 
        return out
    HEAD='600 36px Inter'
    lines={k:words(k,'400 36px Inter' if k.startswith('And') else HEAD) for k in ['Align everything.','And a little dull.','Break one rule.']}
    b.close()
def txt(id,text,x,y,w,h,size,weight=500,color=INK,start=0,end=99,extra=None,frames=None,parent=''):
    st={'color':color,'fontFamily':'Inter','fontSize':f'{size}px','fontWeight':str(weight),'lineHeight':f'{h/(text.count(chr(10))+1):g}px','whiteSpace':'pre'}
    st.update(extra or {})
    return dict(id=id,kind='text',parent=parent,text=text,style=st,start=start,end=end,frames=frames or [dict(t=start,x=x,y=y,w=w,h=h)])
def rect(id,x,y,w,h,bg,start=0,end=99,parent='',frames=None,extra=None):
    st={'background':bg}; st.update(extra or {})
    return dict(id=id,kind='rect',parent=parent,style=st,start=start,end=end,frames=frames or [dict(t=start,x=x,y=y,w=w,h=h)])
L=[]
# header + rules
L.append(rect('topRule',48,17,426,1,RULE))
L.append(txt('hdTitle','Five Rules for a Poster',48,23.5,140,13,9))
L.append(txt('hdRule4','Rule 04 / 05',194,23.5,80,13,9,end=6.0))
L.append(txt('hdRule5','Rule 05 / 05',194,23.5,80,13,9,start=6.0))
L.append(txt('hdAlign','Alignment',340,23.5,80,13,9,end=6.0))
L.append(txt('hdExc','Exception',340,23.5,80,13,9,start=6.0))
L.append(rect('botRule',340,481,134,1,RULE))
L.append(txt('botNote4','Axis flush left\nEvery edge on a line',340,486,140,26,9,start=0.458,end=5.875))
L.append(txt('botNote5','Exceptions 1',340,486,140,13,9,start=6.5))
for k in range(15):  # bar counter ticks every beat at 120 bpm
    beat=k; t0=k*0.5
    L.append(txt(f'ctr{k}',f'♩ = 120\nbar {9+beat//4:02d}.{beat%4+1}',487,495,60,26,8,start=t0,end=t0+0.5,extra={'color':INK}))
# kicker
L.append(txt('kRule4','Rule four.',49,69.6,120,17,14,400,GRAY,start=0.5,end=3.708,
   frames=[dict(t=0.5,x=49,y=69.6,w=120,h=17,reveal=0.4,ease='step'),dict(t=0.75,x=49,y=69.6,w=120,h=17,reveal=1)]))
L.append(txt('kPerfect','Perfect.',49,69.6,120,17,14,400,GRAY,start=4.208,end=6.0))
L.append(txt('kRule5','Rule five.',49,69.6,120,17,14,400,GRAY,start=6.292,
   frames=[dict(t=6.292,x=49,y=69.6,w=120,h=17,reveal=0.4,ease='step'),dict(t=6.542,x=49,y=69.6,w=120,h=17,reveal=1)]))
# headline: words rise into a clip strip, leave upward
L.append(dict(id='headClip',kind='group',parent='',style={'overflow':'hidden'},start=0,end=99,frames=[dict(t=0,x=40,y=90,w=440,h=48)]))
def head(line,times,exit_t,start_from,wt=600):
    for i,((w,dx),t) in enumerate(zip(lines[line],times)):
        y=-0.5; x=8+dx
        fr=[dict(t=round(t-0.042,4),x=x,y=y+44,w=300,h=44),dict(t=t,x=x,y=y+9,w=300,h=44),dict(t=round(t+0.042,4),x=x,y=y+1,w=300,h=44),dict(t=round(t+0.083,4),x=x,y=y,w=300,h=44)]
        if exit_t: fr+= [dict(t=exit_t,x=x,y=y,w=300,h=44),dict(t=round(exit_t+0.042,4),x=x,y=y-4,w=300,h=44),dict(t=round(exit_t+0.125,4),x=x,y=y-14,w=300,h=44),dict(t=round(exit_t+0.167,4),x=x,y=y-46,w=300,h=44)]
        L.append(txt(f'h{start_from}_{i}',w,0,0,300,44,36,wt,start=round(t-0.042,4),end=round(exit_t+0.2,4) if exit_t else 99,frames=fr,parent='headClip'))
head('Align everything.',[1.25,1.5],3.583,'a')
head('And a little dull.',[4.5,4.833,4.917,5.042],5.917,'b',400)
head('Break one rule.',[7.083,7.208,7.417],None,'c')
# big digits inside a clip that ends at y=522
L.append(dict(id='digClip',kind='group',parent='',style={'overflow':'hidden'},start=0,end=99,frames=[dict(t=0,x=0,y=0,w=480,h=522)]))
four=[(1,522),(2,459),(3,450),(4,436),(5,366),(6,357),(7,343),(8,273),(9,265),(10,251),(11,181),(12,172),(132,172),(133,174),(134,181),(135,197),(136,227),(137,293),(138,407),(139,474),(140,507),(141,540)]
L.append(dict(id='four',kind='path',parent='digClip',path=D['four'],style={'fill':'#111111'},start=0.042,end=5.9,frames=[dict(t=f(n),x=48,y=y,w=267,h=350) for n,y in four]))
five=[(145,540),(146,465),(147,456),(148,442),(149,372),(150,363),(151,350),(152,280),(153,271),(154,257),(155,187),(156,178)]
L.append(dict(id='five',kind='path',parent='digClip',path=D['five'],style={'fill':'#111111'},start=6.04,end=99,frames=[dict(t=f(n),x=48,y=y,w=252,h=344) for n,y in five]))
# poster
L.append(dict(id='poster',kind='group',parent='',style={'background':'#ffffff','overflow':'hidden'},start=0,end=99,frames=[dict(t=0,x=559,y=18,w=353,h=504)]))
L.append(dict(id='grid',kind='group',parent='poster',style={},start=0,end=4.45,frames=[dict(t=0,x=0,y=0,w=353,h=504),dict(t=4.0,x=0,y=0,w=353,h=504,ease='out'),dict(t=4.42,x=0,y=0,w=353,h=504,opacity=0)]))
for i,x in enumerate([17,62,108,153,199,244,290,335]): L.append(rect(f'gv{i}',x,17,1,320,GRID,parent='grid',end=4.45))
for k in range(17): L.append(rect(f'gh{k}',17,17+20*k,319,1,GRID,parent='grid',end=4.45))
for i,y in enumerate([356,395,408,421,434,447,460,473,486]): L.append(rect(f'gb{i}',17,y,319,1,GRID,parent='grid',end=4.45))
L.append(rect('bar',17,18,46,0.01,'#cdcbc5',parent='poster',frames=[dict(t=0,x=17,y=18,w=46,h=0.01),dict(t=1.0,x=17,y=18,w=46,h=320)]))
cols=[(20,40),(65,41),(111,40),(156,41)]
for k in range(16):
    x,w=cols[k%4]; y=19+20*k; T=round(2.042+0.125*k,4)
    L.append(rect(f'blk{k}',x,y,w,17,'#111111',parent='poster',start=T,frames=[dict(t=T,x=x,y=y,w=5,h=17),dict(t=round(T+0.042,4),x=x,y=y,w=37,h=17),dict(t=round(T+0.083,4),x=x,y=y,w=w,h=17)]))
red=[(87,-95),(87,-85),(88,-76),(89,-56),(90,-22),(91,-2),(92,7),(93,13),(94,16),(95,17),(96,18)]
fr=[dict(t=f(n),x=245,y=y,w=90,h=90) for n,y in red]+[dict(t=7.375,x=245,y=18,w=90,h=90),dict(t=f(178),x=247,y=18,w=90,h=90),dict(t=f(179),x=256,y=18,w=90,h=90),dict(t=7.6,x=272,y=18,w=90,h=90)]
L.append(dict(id='dot',kind='ellipse',parent='poster',style={'background':'#dc1327'},start=3.6,end=99,frames=fr))
L.append(txt('nm','neue musik',19,346.8,330,60,50,800,'#111111',parent='poster',extra={'letterSpacing':'-0.2px'}))
L.append(txt('konz','konzert 1961',19,405.5,200,18,15,700,'#111111',parent='poster'))
L.append(txt('det','freitag 17. märz 1961 · 20.15 uhr\nkleiner saal\nwerke von marti, brunner, weiss\neintritt fr. 3.–',19,434,300,52,9,400,parent='poster'))
for s in (0,1):
    json.dump(dict(title='Five Rules for a Poster — rule 4',background='#e9e7e3',
      notes=['Big digits are traced vector outlines of the reference glyphs; all other type is Inter, a close stand-in for the reference grotesk.',
             'Grid lines fade out where the reference wipes them; tiny counter text is approximate.'] if s==0 else [],layers=L),
      open(f'work/scene-{s:02d}/layers.json','w'),ensure_ascii=False)
print(len(L),'layers')
