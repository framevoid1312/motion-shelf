import cv2,numpy as np
W,H=2048,858
PAPER=np.array([216,234,242],np.float32)   # BGR, warm paper
yy,xx=np.mgrid[0:H,0:W].astype(np.float32)
def halftone(period=5.0,ang=45,amp=17):
    a=np.radians(ang); u=xx*np.cos(a)+yy*np.sin(a); v=-xx*np.sin(a)+yy*np.cos(a)
    return np.clip(128+amp*np.cos(2*np.pi*u/period)*np.cos(2*np.pi*v/period),0,255).astype(np.uint8)
def plates(n=24,seed=5):
    """n-frame loops: dropout plate (screen) and grain plate (overlay). Hold each frame for two."""
    rng=np.random.default_rng(seed); sp=[];gr=[]
    drum=cv2.GaussianBlur(rng.normal(0,1,(H,W)).astype(np.float32),(0,0),60); drum/=drum.std()
    for i in range(n):
        fine=cv2.GaussianBlur(rng.normal(0,1,(H,W)).astype(np.float32),(0,0),0.55); fine/=fine.std()
        blot=cv2.GaussianBlur(rng.normal(0,1,(H,W)).astype(np.float32),(0,0),7); blot/=blot.std()
        a=np.clip((fine-(1.75-0.3*blot-0.2*drum))*1.6,0,1)                 # dry-ink dropouts, clustered
        sp.append((a[:,:,None]*PAPER*0.16).astype(np.uint8))
        gr.append(np.clip(128+rng.normal(0,1,(H,W)).astype(np.float32)*8+blot*3.5,0,255).astype(np.uint8))
    return sp,gr
def ov(a,g): return np.where(a<0.5,2*a*g,1-2*(1-a)*(1-g))
def riso(im,sp,gr,ht,off=(1.5,1.0),mis=0.25):
    a=im.astype(np.float32)/255
    sh=cv2.warpAffine(a,np.float32([[1,0,off[0]],[0,1,off[1]]]),(W,H),borderMode=cv2.BORDER_REPLICATE)
    a=a*(1-mis)+a*sh*mis                                   # misregistered overprint (multiply)
    a=ov(a,(ht.astype(np.float32)/255)[:,:,None])          # halftone screen (overlay)
    a=1-(1-a)*(1-sp.astype(np.float32)/255)                # dropouts (screen)
    a=ov(a,(gr.astype(np.float32)/255)[:,:,None])          # grain (overlay)
    return np.clip(a*255,0,255).astype(np.uint8)
