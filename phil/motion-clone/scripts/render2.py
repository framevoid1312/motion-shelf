import cv2,numpy as np
W,H,S=2048,858,2   # comp size and supersampling; set W,H to the source aspect
def hx(h): return np.array([int(h[5:7],16),int(h[3:5],16),int(h[1:3],16)],np.float32)
def flatpath(it,n=12):
    v=np.array(it['v'],np.float32); o=np.array(it.get('o') or np.zeros_like(v),np.float32); i=np.array(it.get('i') or np.zeros_like(v),np.float32)
    t=np.linspace(0,1,n,endpoint=False)[:,None]; out=[]; N=len(v); rng=range(N) if it.get('closed',True) else range(N-1)
    for a in rng:
        b=(a+1)%N
        if not o[a].any() and not i[b].any(): out.append(v[a][None]); continue
        P0,P1,P2,P3=v[a],v[a]+o[a],v[b]+i[b],v[b]; out.append((1-t)**3*P0+3*(1-t)**2*t*P1+3*(1-t)*t*t*P2+t**3*P3)
    if not it.get('closed',True): out.append(v[-1][None])
    return np.vstack(out)
def alpha(layer,dx=0,dy=0):
    a=np.zeros((H*S,W*S),np.uint8); sh=4; k=S*(1<<sh)
    fill=layer.get('fill') is not None or layer.get('grad') is not None; st=layer.get('stroke')
    for it in layer['items']:
        t=it['t']
        if t=='path':
            p=np.round((flatpath(it)+[dx,dy])*k).astype(np.int32)
            if fill and it.get('closed',True): cv2.fillPoly(a,[p],255,cv2.LINE_AA,sh)
            if st: cv2.polylines(a,[p],it.get('closed',True),255,max(1,int(round(st[1]*S))),cv2.LINE_AA,sh)
        elif t=='ellipse':
            c=(int((it['cx']+dx)*k),int((it['cy']+dy)*k)); ax=(int(it['rx']*k),int(it['ry']*k))
            if fill: cv2.ellipse(a,c,ax,0,0,360,255,-1,cv2.LINE_AA,sh)
            if st: cv2.ellipse(a,c,ax,0,0,360,255,max(1,int(round(st[1]*S))),cv2.LINE_AA,sh)
        elif t=='rect':
            cv2.rectangle(a,(int((it['x']+dx)*k),int((it['y']+dy)*k)),(int((it['x']+it['w']+dx)*k),int((it['y']+it['h']+dy)*k)),255,-1,cv2.LINE_AA,sh)
        elif t=='line':
            cv2.line(a,(int((it['x0']+dx)*k),int((it['y0']+dy)*k)),(int((it['x1']+dx)*k),int((it['y1']+dy)*k)),255,max(1,int(round(it['w']*S))),cv2.LINE_AA,sh)
    a=a.astype(np.float32)/255
    if layer.get('blur'): a=cv2.GaussianBlur(a,(0,0),layer['blur']*S)   # blur = sigma in comp px
    return cv2.resize(a,(W,H),interpolation=cv2.INTER_AREA)
def interp(keys,t):
    ts=[k[0] for k in keys]; return [float(np.interp(t,ts,[k[j] for k in keys])) for j in range(1,len(keys[0]))]
def render(layers,t=0.0,cache=None):
    im=np.zeros((H,W,3),np.float32)
    for li,L in enumerate(layers):
        dx=dy=0; op=L.get('opacity',100)/100
        if L.get('pos'): dx,dy=interp(L['pos'],t)
        key=(li,round(dx,2),round(dy,2))
        if cache is not None and key in cache: a=cache[key]
        else:
            a=alpha(L,dx,dy)
            if cache is not None and not L.get('pos'): cache[key]=a
        a=(a*op)[:,:,None]
        if L.get('grad'):
            c0,c1,y0,y1=L['grad']; g=np.clip((np.arange(H,dtype=np.float32)-y0)/max(1e-3,y1-y0),0,1)[:,None,None]; col=hx(c0)*(1-g)+hx(c1)*g
        else: col=hx(L.get('fill') or L['stroke'][0])
        m=L.get('mode','normal')
        if m=='normal': im=im*(1-a)+col*a
        elif m=='screen': im=255-(255-im)*(1-a*col/255)
        elif m=='add': im=np.minimum(255,im+col*a)
        elif m=='multiply': im=im*(1-a)+im*col/255*a
    return np.clip(im,0,255).astype(np.uint8)
