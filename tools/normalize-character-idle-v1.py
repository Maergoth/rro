#!/usr/bin/env python3
"""Normalize accepted idle bodies to one pivot and remove green edge spill."""

from argparse import ArgumentParser
from hashlib import sha256
import json
from pathlib import Path
import subprocess

import numpy as np
from PIL import Image, ImageDraw, ImageFont
from scipy import ndimage


ROOT=Path(__file__).resolve().parent.parent
CANVAS=(384,512)
PIVOT=(192,472)
BATCH_RELATIVE=Path('planning/art-qa/character-remediation-idle-classic-v1')
BODIES=('base-a','base-b')
DIRECTIONS=('north','north_east','east','south_east','south','south_west','west','north_west')


def rgba(path):
 image=Image.open(path).convert('RGBA')
 if image.size!=CANVAS:raise ValueError(f'{path}: expected {CANVAS}, got {image.size}')
 return np.array(image)


def save(data,path):
 path.parent.mkdir(parents=True,exist_ok=True);Image.fromarray(data.astype(np.uint8),'RGBA').save(path,optimize=True)


def digest(path):return sha256(path.read_bytes()).hexdigest()


def bbox(data,threshold=20):
 y,x=np.where(data[:,:,3]>threshold)
 if not len(x):raise ValueError('empty image')
 return int(x.min()),int(y.min()),int(x.max()),int(y.max())


def anchor(data):
 left,top,right,bottom=bbox(data);height=bottom-top+1;yy,xx=np.indices(data.shape[:2]);alpha=data[:,:,3].astype(np.float64)
 band=(alpha>20)&(yy>=bottom-max(6,round(height*.04)));weight=np.where(band,alpha,0.)
 return float((xx*weight).sum()/weight.sum()),bottom


def translate(data,dx,dy):
 height,width=data.shape[:2];result=np.zeros_like(data);sx0=max(0,-dx);sy0=max(0,-dy);sx1=min(width,width-dx);sy1=min(height,height-dy)
 result[sy0+dy:sy1+dy,sx0+dx:sx1+dx]=data[sy0:sy1,sx0:sx1];return result


def edge(mask,depth=4):
 eroded=mask.copy()
 for _ in range(depth):eroded=ndimage.binary_erosion(eroded,np.ones((3,3)),border_value=0)
 return mask&~eroded


def green_edge_count(data):
 rgb=data[:,:,:3].astype(np.int16);boundary=edge(data[:,:,3]>0)
 return int((boundary&((rgb[:,:,1]-np.maximum(rgb[:,:,0],rgb[:,:,2]))>=4)).sum())


def despill(data):
 result=data.copy();rgb=result[:,:,:3].astype(np.int16);boundary=edge(result[:,:,3]>0);replacement=np.maximum(rgb[:,:,0],rgb[:,:,2]);bad=boundary&((rgb[:,:,1]-replacement)>=4)
 result[:,:,1]=np.where(bad,replacement,rgb[:,:,1]).astype(np.uint8);return result,int(bad.sum())


def skin_layers(body):
 rgb=body[:,:,:3].astype(np.float32);alpha=body[:,:,3];red,green,blue=rgb[:,:,0],rgb[:,:,1],rgb[:,:,2];maximum=rgb.max(2);minimum=rgb.min(2);saturation=(maximum-minimum)/np.maximum(maximum,1)
 skin=(alpha>0)&(red>green*1.045)&(green>blue*1.055)&(saturation>.085);light=np.clip(red*.2126+green*.7152+blue*.0722,0,255).astype(np.uint8)
 diffuse=np.zeros_like(body);diffuse[:,:,:3]=light[:,:,None];diffuse[:,:,3]=np.where(skin,alpha,0).astype(np.uint8)
 mask=np.zeros_like(body);mask[:,:,:3]=255;mask[:,:,3]=diffuse[:,:,3]
 return diffuse,mask


def font(size,bold=False):
 return ImageFont.truetype('/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf' if bold else '/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf',size)


def checker(size,cell=16):
 image=Image.new('RGBA',size,(28,33,36,255));draw=ImageDraw.Draw(image)
 for y in range(0,size[1],cell):
  for x in range(0,size[0],cell):
   if (x//cell+y//cell)%2:draw.rectangle((x,y,min(size[0]-1,x+cell-1),min(size[1]-1,y+cell-1)),fill=(43,49,52,255))
 return image


def contact_sheet(frames,path):
 cw,ch,columns=404,554,4;image=Image.new('RGBA',(cw*columns,62+ch*4),(18,22,25,255));draw=ImageDraw.Draw(image);draw.text((18,16),'Character remediation — normalized idle bodies (1:1 pixels)',font=font(24,True),fill=(241,235,216,255))
 for index,(label,data) in enumerate(frames):
  x=index%columns*cw;y=62+index//columns*ch;panel=checker(CANVAS);panel.alpha_composite(Image.fromarray(data,'RGBA'));image.alpha_composite(panel,(x+10,y+28));draw.text((x+10,y+5),label,font=font(15),fill=(190,205,205,255))
 path.parent.mkdir(parents=True,exist_ok=True);image.convert('RGB').save(path,quality=95)


def main():
 parser=ArgumentParser();parser.add_argument('--apply',action='store_true');parser.add_argument('--output-root');parser.add_argument('--repo-root');args=parser.parse_args()
 if args.apply==bool(args.output_root):parser.error('choose exactly one of --apply or --output-root')
 repo=Path(args.repo_root).resolve() if args.repo_root else ROOT;output=repo if args.apply else Path(args.output_root).resolve();source=repo/'apps/client-godot/assets/characters';destination=output/'apps/client-godot/assets/characters';qa=output/BATCH_RELATIVE
 source_commit=subprocess.run(('git','rev-parse','HEAD'),cwd=repo,check=True,capture_output=True,text=True).stdout.strip();source_hashes={};frames=[];directions=[];outputs=[]
 for body in BODIES:
  for direction in DIRECTIONS:
   body_path=source/f'body/{body}/idle/{direction}.png';original=rgba(body_path);source_hashes[str(body_path.relative_to(repo))]=digest(body_path)
   for kind in ('skin-diffuse','skin-mask'):
    old=source/f'body/{body}/idle/{kind}/{direction}.png'
    if old.exists():source_hashes[str(old.relative_to(repo))]=digest(old)
   source_anchor=anchor(original);dx=round(PIVOT[0]-source_anchor[0]);dy=PIVOT[1]-source_anchor[1];cleaned,count=despill(original);normalized=translate(cleaned,dx,dy);normalized_anchor=anchor(normalized);bounds=bbox(normalized)
   if normalized_anchor[1]!=PIVOT[1] or abs(normalized_anchor[0]-PIVOT[0])>.51:raise ValueError(f'{body}/{direction}: pivot {normalized_anchor}')
   if bounds[0]<=0 or bounds[1]<=0 or bounds[2]>=CANVAS[0]-1 or bounds[3]>=CANVAS[1]-1:raise ValueError(f'{body}/{direction}: touches canvas boundary')
   body_out=destination/f'body/{body}/idle/{direction}.png';save(normalized,body_out);outputs.append(body_out)
   skin_diffuse,skin_mask=skin_layers(normalized)
   for kind,data in (('skin-diffuse',skin_diffuse),('skin-mask',skin_mask)):
    path=destination/f'body/{body}/idle/{kind}/{direction}.png';save(data,path);outputs.append(path)
   if not np.array_equal(skin_diffuse[:,:,3],skin_mask[:,:,3]):raise ValueError(f'{body}/{direction}: skin alpha mismatch')
   frames.append((f'{body} / {direction}',normalized));directions.append({'body':body,'direction':direction,'sourceAnchor':[round(source_anchor[0],3),source_anchor[1]],'translation':[dx,dy],'normalizedAnchor':[round(normalized_anchor[0],3),normalized_anchor[1]],'normalizedBounds':list(bounds),'despilledPixels':count,'remainingGreenEdgePixels':green_edge_count(normalized),'skinPixels':int((skin_mask[:,:,3]>20).sum())})
 evidence=qa/'normalized-bodies-full.png';contact_sheet(frames,evidence);outputs.append(evidence)
 totals={'bodyDirectionFiles':16,'skinRuntimeFiles':32,'despilledPixels':sum(d['despilledPixels'] for d in directions),'remainingGreenEdgePixels':sum(d['remainingGreenEdgePixels'] for d in directions),'maximumPivotXError':max(abs(d['normalizedAnchor'][0]-PIVOT[0]) for d in directions),'minimumSkinPixels':min(d['skinPixels'] for d in directions)}
 report={'schemaVersion':1,'batch':'character-remediation-idle-classic-v1','component':'normalized-idle-bodies','sourceCommit':source_commit,'canvas':list(CANVAS),'groundContactPivot':list(PIVOT),'sourcePreservation':{'method':'Exact pre-normalization bytes remain in sourceCommit; SHA-256 values are recorded before replacement.','files':[{'path':path,'sha256':value} for path,value in sorted(source_hashes.items())]},'directions':directions,'totals':totals,'visualQa':str(BATCH_RELATIVE/'normalized-bodies-full.png'),'outputs':[{'path':str(path.relative_to(output)),'sha256':digest(path)} for path in sorted(outputs)]}
 metrics=qa/'normalized-bodies-metrics.json';metrics.write_text(json.dumps(report,indent=2)+'\n')
 failures={}
 if totals['remainingGreenEdgePixels']!=0:failures['remainingGreenEdgePixels']=totals['remainingGreenEdgePixels']
 if totals['maximumPivotXError']>.51:failures['maximumPivotXError']=totals['maximumPivotXError']
 if totals['minimumSkinPixels']<1000:failures['minimumSkinPixels']=totals['minimumSkinPixels']
 print(json.dumps({'outputRoot':str(output),'totals':totals,'failures':failures},indent=2))
 if failures:raise SystemExit(1)


if __name__=='__main__':main()
