import sys, numpy as np, cv2
sys.path.insert(0,'/home/claude/mc_sting'); import compose
def sbs(frames, plate_dir, out, scale=0.5, text=None):
    rows=[]
    for n in frames:
        ref=cv2.cvtColor(cv2.imread(f'/home/claude/mc_sting/ref/f{n+1:03d}.png'),cv2.COLOR_BGR2RGB)
        me=compose.frame(n, plate_dir, text)
        a=cv2.resize(ref,None,fx=scale,fy=scale,interpolation=cv2.INTER_AREA); b=cv2.resize(me,None,fx=scale,fy=scale,interpolation=cv2.INTER_AREA)
        r=np.hstack([a,np.full((a.shape[0],8,3),255,np.uint8),b])
        cv2.putText(r,f'REF f{n}',(10,28),cv2.FONT_HERSHEY_SIMPLEX,0.8,(255,220,0),2); cv2.putText(r,f'CLONE f{n}',(a.shape[1]+18,28),cv2.FONT_HERSHEY_SIMPLEX,0.8,(0,255,160),2)
        rows.append(r)
    cv2.imwrite(out,cv2.cvtColor(np.vstack(rows),cv2.COLOR_RGB2BGR),[cv2.IMWRITE_JPEG_QUALITY,88])
if __name__=='__main__':
    sbs([int(x) for x in sys.argv[1].split(',')], sys.argv[2], sys.argv[3], float(sys.argv[4]) if len(sys.argv)>4 else 0.5)
