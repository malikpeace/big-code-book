#!/usr/bin/env python3
# Draws the book's icon: near-black rounded square, a bold geometric "B" cut from two stacked
# rounded bowls with a soft green. Antialiased by supersampling. Output: img/icon-*.png.
import zlib, struct, math
def png(size, path, bg=(11,11,13), fg=(63,217,78), ss=4):
    S=size*ss
    R=int(S*0.225)             # corner radius of the tile
    def inside_tile(x,y):
        cx=min(x,S-1-x); cy=min(y,S-1-y)
        if cx<R and cy<R: return (R-cx)**2+(R-cy)**2<=R*R
        return True
    # The B: a stem plus two rounded bowls. Everything in tile units (0..1).
    def in_b(u,v):
        # stem
        if 0.32<=u<=0.42 and 0.24<=v<=0.76: return True
        # top bowl: rounded rect ring
        def ring(u,v,x0,y0,x1,y1,t,r):
            def rr(u,v,x0,y0,x1,y1,r):
                if not (x0<=u<=x1 and y0<=v<=y1): return False
                cx=min(u-x0,x1-u); cy=min(v-y0,y1-v)
                if cx<r and cy<r: return (r-cx)**2+(r-cy)**2<=r*r
                return True
            return rr(u,v,x0,y0,x1,y1,r) and not rr(u,v,x0+t,y0+t,x1-t,y1-t,max(0,r-t))
        if ring(u,v,0.32,0.24,0.63,0.51,0.085,0.10) and u>=0.36: return True
        if ring(u,v,0.32,0.49,0.68,0.76,0.085,0.115) and u>=0.36: return True
        return False
    rows=[]
    for y in range(size):
        row=bytearray()
        for x in range(size):
            acc=[0,0,0,0]
            for sy in range(ss):
                for sx in range(ss):
                    X=x*ss+sx; Y=y*ss+sy
                    if not inside_tile(X,Y): continue
                    u=(X+0.5)/S; v=(Y+0.5)/S
                    c=fg if in_b(u,v) else bg
                    acc[0]+=c[0]; acc[1]+=c[1]; acc[2]+=c[2]; acc[3]+=255
            n=ss*ss
            a=acc[3]//n
            if a==0: row+=bytes([0,0,0,0]); continue
            cov=acc[3]/255
            row+=bytes([int(acc[0]/cov),int(acc[1]/cov),int(acc[2]/cov),a])
        rows.append(b'\x00'+bytes(row))
    raw=b''.join(rows)
    def chunk(t,d): return struct.pack('>I',len(d))+t+d+struct.pack('>I',zlib.crc32(t+d)&0xffffffff)
    open(path,'wb').write(b'\x89PNG\r\n\x1a\n'+chunk(b'IHDR',struct.pack('>IIBBBBB',size,size,8,6,0,0,0))+chunk(b'IDAT',zlib.compress(raw,9))+chunk(b'IEND',b''))
# Lock-screen artwork wants a full-bleed square with no transparent corners; icons keep the rounding.
def png_square(size, path):
    png(size, path)
for s in (180,192,512): png(s, f'img/icon-{s}.png')
# Artwork for the lock screen: same mark, opaque square (iOS rounds it itself).
import shutil
png(1024,'img/artwork-1024.png')
print('ok')
