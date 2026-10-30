import cv2, numpy as np
from PIL import Image
D='/tmp/claude-0/img/'
src=np.array(Image.open(D+'src.png').convert('RGB'))
sup=Image.open(D+'sup.png').convert('RGBA')
H,W=src.shape[:2]
k=1.28
Z={'M':((135,118,100),(75,428,44)),'E':((305,625,132),(438,428,32)),'I':((450,138,110),(598,370,34)),'C':((935,200,125),(752,437,36))}
mx=src.max(axis=2).astype(int); mn=src.min(axis=2).astype(int)
dark=(((mx<232)&((mx-mn)<34))|(mx<150)).astype(np.uint8)
dark=cv2.dilate(dark,np.ones((7,7),np.uint8))
def circ(m,c,r): cv2.circle(m,(int(c[0]*k),int(c[1]*k)),int(r*k),1,-1)
def hull(z):
    (bx,by,br),(sx,sy,sr)=Z[z]; pts=[]
    for a in np.linspace(0,2*np.pi,72):
        pts+= [(bx+br*np.cos(a),by+br*np.sin(a)),(sx+(sr+10)*np.cos(a),sy+(sr+10)*np.sin(a))]
    m=np.zeros((H,W),np.uint8); cv2.fillConvexPoly(m,cv2.convexHull((np.array(pts)*k).astype(np.int32)),1)
    m=cv2.dilate(m,np.ones((15,15),np.uint8)); return m
borr={}
total=np.zeros((H,W),np.uint8)
for z,((bx,by,br),_) in Z.items():
    m=np.zeros((H,W),np.uint8); circ(m,(bx,by),br+7)
    borr[z]=np.maximum(m,dark*hull(z)); total=np.maximum(total,borr[z])
base=cv2.inpaint(src,total*255,6,cv2.INPAINT_TELEA)
# zonas de círculos grandes: fondo liso
for z,((bx,by,br),_) in Z.items():
    m=np.zeros((H,W),np.uint8); circ(m,(bx,by),br+7)
    base[m>0]=(250,252,254)
base=cv2.GaussianBlur(base,(1,1),0)
al=np.array(sup)[...,3]
ley=sup.copy(); a=np.array(ley); a[:, :int(840*k), 3]=0; ley=Image.fromarray(a)
reg=sup.copy(); a=np.array(reg); a[:, int(840*k):, 3]=0; reg=Image.fromarray(a)
def comp(arr,capas):
    im=Image.fromarray(arr).convert('RGBA')
    for c in capas: im=Image.alpha_composite(im,c)
    return im.convert('RGB')
O='/root/nl/img/potencial/'
comp(base,[ley]).save(O+'neurona-canales-base.jpg',quality=88)
for z,nom,r in (('M','pacini',0),('E','glu',1),('I','gaba',1),('C','cono',1)):
    a=base.copy(); m=borr[z]>0; a[m]=src[m]
    comp(a,[ley]+([reg] if r else [])).save(O+f'neurona-canales-{nom}.jpg',quality=88)
# capas acumulativas (PNG con alfa): cada aumento y el marco del registro, sobre la base
for z,nom in (('M','pacini'),('E','glu'),('I','gaba'),('C','cono')):
    m=cv2.GaussianBlur((borr[z]>0).astype(np.float32),(5,5),0)
    rgba=np.dstack([src*(m[...,None]>0),(m*255).astype(np.uint8)]).astype(np.uint8)
    Image.fromarray(rgba).save(O+f'capa-{nom}.webp',quality=86,method=6)
reg.save(O+'capa-registro.webp',quality=90,method=6)
