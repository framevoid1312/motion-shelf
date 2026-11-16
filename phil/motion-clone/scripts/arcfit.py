import numpy as np
def circ(p):
    x,y=p[:,0],p[:,1]; A=np.c_[2*x,2*y,np.ones(len(p))]; b=x*x+y*y
    try: s=np.linalg.lstsq(A,b,rcond=None)[0]
    except Exception: return None
    cx,cy=s[0],s[1]; r2=s[2]+cx*cx+cy*cy
    if r2<=0: return None
    r=np.sqrt(r2); return cx,cy,r,np.abs(np.hypot(x-cx,y-cy)-r).max()
def line_dev(p):
    a,b=p[0],p[-1]; d=b-a; L=np.hypot(*d)
    if L<1e-6: return 1e9
    return np.abs((p[:,0]-a[0])*d[1]-(p[:,1]-a[1])*d[0]).max()/L
def fit_contour(c,tol=1.2,rmax=20000):
    """closed contour (N,2) float -> list of ('L',p0,p1) / ('A',p0,p1,cx,cy,r,positive_sweep)"""
    n=len(c); out=[]; i=0
    k=6; v1=c-np.roll(c,k,0); v2=np.roll(c,-k,0)-c   # start at the sharpest corner
    ang=np.abs(np.arctan2(v1[:,0]*v2[:,1]-v1[:,1]*v2[:,0],(v1*v2).sum(1))); s0=int(np.argmax(ang)); cc=np.vstack([np.roll(c,-s0,0)]*2)
    while i<n:
        def ok_line(j): return line_dev(cc[i:j+1])<tol
        def ok_arc(j):
            r=circ(cc[i:j+1]); return r is not None and r[3]<tol and r[2]<rmax
        def extend(ok):
            lo=min(i+3,n)
            if not ok(lo): return i+2
            step=8; hi=lo
            while hi<n and ok(min(hi+step,n)): hi=min(hi+step,n); step*=2
            a,b=hi,min(hi+step,n)
            while b-a>1:
                m=(a+b)//2
                if ok(m): a=m
                else: b=m
            return a
        jl=extend(ok_line); ja=extend(ok_arc)
        if jl>=ja-2 or ja-i<12:
            j=max(jl,i+1); out.append(('L',cc[i].copy(),cc[j%len(cc)].copy()))
        else:
            j=ja; cx,cy,r,_=circ(cc[i:j+1]); m=cc[(i+j)//2]
            a0=np.arctan2(cc[i][1]-cy,cc[i][0]-cx); am=np.arctan2(m[1]-cy,m[0]-cx); a1=np.arctan2(cc[j][1]-cy,cc[j][0]-cx)
            out.append(('A',cc[i].copy(),cc[j].copy(),cx,cy,r,((am-a0)%(2*np.pi))<((a1-a0)%(2*np.pi))))
        i=j
    return out
def to_bezier(segs):
    """-> list of (p0,c1,c2,p1) cubics: exact lines, arcs split to <=90 degrees.
    The arc flag means: sweep with increasing screen angle (y down) from p0 to p1."""
    bz=[]
    for s in segs:
        if s[0]=='L': bz.append((s[1],s[1],s[2],s[2])); continue
        _,p0,p1,cx,cy,r,pos=s; a0=np.arctan2(p0[1]-cy,p0[0]-cx); a1=np.arctan2(p1[1]-cy,p1[0]-cx)
        d=a1-a0
        if pos:
            while d<=0: d+=2*np.pi
        else:
            while d>=0: d-=2*np.pi
        k=int(np.ceil(abs(d)/(np.pi/2))); da=d/k
        for q in range(k):
            b0=a0+q*da; b1=b0+da; t=4/3*np.tan(da/4)
            P0=np.array([cx+r*np.cos(b0),cy+r*np.sin(b0)]); P3=np.array([cx+r*np.cos(b1),cy+r*np.sin(b1)])
            C1=P0+t*r*np.array([-np.sin(b0),np.cos(b0)]); C2=P3-t*r*np.array([-np.sin(b1),np.cos(b1)])
            if q==0: P0=np.array(p0,float)
            if q==k-1: P3=np.array(p1,float)
            bz.append((P0,C1,C2,P3))
    return bz
def to_path(segs,closed=True):
    """segments -> a `path` item: v (vertices), o (out tangents), i (in tangents), relative, as After Effects stores them."""
    bz=to_bezier(segs); n=len(bz); r=lambda a:[round(float(a[0]),2),round(float(a[1]),2)]
    v=[r(b[0]) for b in bz]; o=[r(b[1]-b[0]) for b in bz]; i=[r(bz[j-1][2]-bz[j-1][3]) for j in range(n)]
    if not closed:
        e=bz[-1]; v.append(r(e[3])); o.append([0,0]); i.append(r(e[2]-e[3])); i[0]=[0,0]
    return dict(t='path',v=v,o=o,i=i,closed=closed)
