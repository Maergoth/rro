#!/usr/bin/env python3
"""Extract pose-locked classic outfit layers from reviewed image edits.

The image editor returned RGB atlases with a baked checkerboard.  This tool
uses only the saturated red/blue calibration garments, aligns each cell to the
accepted normalized body pivot, creates independent neutral diffuse/tint
masks, and emits full-resolution plus gameplay-scale runtime composites.
"""

from argparse import ArgumentParser
from hashlib import sha256
from pathlib import Path
import json
import subprocess
import numpy as np
from PIL import Image, ImageDraw, ImageFont
from scipy import ndimage

ROOT = Path(__file__).resolve().parent.parent
CANVAS = (384, 512)
DIRS = ('north','north_east','east','south_east','south','south_west','west','north_west')
BODIES = ('base-a','base-b')
SOURCE_RELATIVE = Path('planning/art-sources/character-remediation-idle-classic-v1')
QA_RELATIVE = Path('planning/art-qa/character-remediation-idle-classic-v1')
SOURCE_NAMES = {'base-a':'base-a-atlas.png', 'base-b':'base-b-atlas.png'}
OVERRIDE_NAMES = {('base-a','south_west'):'base-a-south-west-sleeve-edit.png'}
TINT_A=np.array((40,104,148),dtype=np.float32)
TINT_B=np.array((196,117,54),dtype=np.float32)


def file_sha(path):
 return sha256(path.read_bytes()).hexdigest()

def load(p): return np.array(Image.open(p).convert('RGBA'))
def save(a,p): p.parent.mkdir(parents=True,exist_ok=True);Image.fromarray(a.astype(np.uint8),'RGBA').save(p,optimize=True)
def translate(a,dx,dy):
 h,w=a.shape[:2];o=np.zeros_like(a);sx0=max(0,-dx);sy0=max(0,-dy);sx1=min(w,w-dx);sy1=min(h,h-dy)
 o[sy0+dy:sy1+dy,sx0+dx:sx1+dx]=a[sy0:sy1,sx0:sx1];return o
def bbox(mask):
 y,x=np.where(mask)
 return (int(x.min()),int(y.min()),int(x.max()),int(y.max()))
def anchor(mask):
 x0,y0,x1,y1=bbox(mask); band=mask & (np.indices(mask.shape)[0]>=y1-max(6,round((y1-y0+1)*.04)))
 y,x=np.where(band);return float(x.mean()),int(y1)
def largest(mask):
 lab,n=ndimage.label(mask)
 if not n:return mask
 sizes=np.bincount(lab.ravel());sizes[0]=0
 out=lab==sizes.argmax();return ndimage.binary_fill_holes(out)
def subject_mask(rgb):
 mx=rgb.max(2).astype(float);mn=rgb.min(2).astype(float);sat=(mx-mn)/np.maximum(mx,1)
 return largest((sat>.055)|(mn<222))
def hue_masks(rgb,subject):
 f=rgb.astype(np.float32)/255.;mx=f.max(2);mn=f.min(2);delta=mx-mn
 hue=np.zeros(mx.shape,dtype=np.float32);nz=delta>1e-6
 r,g,b=f[:,:,0],f[:,:,1],f[:,:,2]
 q=nz&(mx==r);hue[q]=((g[q]-b[q])/delta[q])%6
 q=nz&(mx==g);hue[q]=(b[q]-r[q])/delta[q]+2
 q=nz&(mx==b);hue[q]=(r[q]-g[q])/delta[q]+4
 hue/=6;sat=delta/np.maximum(mx,1e-6)
 red=subject&(sat>.34)&((hue<.038)|(hue>.975))&(r>g*1.55)&(r>b*1.55)
 blue=subject&(sat>.25)&(hue>.53)&(hue<.72)&(b>r*1.22)&(b>g*1.04)
 def clean(m):
  lab,n=ndimage.label(m)
  if not n:return m
  sizes=np.bincount(lab.ravel());sizes[0]=0
  # Each edited garment is one connected design.  Keeping only its dominant
  # component rejects small red/blue hue aliases in eyes, ears, nails, and
  # deep skin shadows without geometric hand/face masks.
  keep=lab==sizes.argmax()
  keep=ndimage.binary_closing(keep,np.ones((3,3)),iterations=1)
  return ndimage.binary_fill_holes(keep)
 red=clean(red);blue=clean(blue)&~red
 return red,blue
def visible_skin_mask(rgb,subject):
 f=rgb.astype(np.float32)/255.;mx=f.max(2);mn=f.min(2);delta=mx-mn
 hue=np.zeros(mx.shape,dtype=np.float32);nz=delta>1e-6
 r,g,b=f[:,:,0],f[:,:,1],f[:,:,2]
 q=nz&(mx==r);hue[q]=((g[q]-b[q])/delta[q])%6
 q=nz&(mx==g);hue[q]=(b[q]-r[q])/delta[q]+2
 q=nz&(mx==b);hue[q]=(r[q]-g[q])/delta[q]+4
 hue/=6;sat=delta/np.maximum(mx,1e-6)
 return subject&(sat>.12)&(hue>.045)&(hue<.14)&(r>g)&(g>b)
def visible_skin_guards(skin,subject):
 _x0,y0,_x1,y1=bbox(subject);height=y1-y0+1;yy=np.indices(skin.shape)[0]
 labels,count=ndimage.label(skin);face=np.zeros_like(skin);hands=np.zeros_like(skin);feet=np.zeros_like(skin)
 for label in range(1,count+1):
  component=labels==label;ys,xs=np.where(component)
  if len(xs)<100:continue
  top,bottom=int(ys.min()),int(ys.max());interior=ndimage.binary_erosion(component,np.ones((3,3)),iterations=2)
  if bottom<=y0+round(height*.36):face|=interior
  elif top>=y0+round(height*.68):feet|=interior
  elif top>=y0+round(height*.25) and bottom<=y0+round(height*.68):
   hands|=interior&(yy>=top+round((bottom-top+1)*.65))
 return face,hands,feet
def translate_mask(mask,dx,dy):
 rgba=np.zeros((*mask.shape,4),np.uint8);rgba[:,:,3]=mask.astype(np.uint8)*255
 return translate(rgba,dx,dy)[:,:,3]>0
def layer(rgb,mask,dominant):
 # Extrapolate garment color into one antialias ring to avoid baked-white fringe.
 core=ndimage.binary_erosion(mask,np.ones((3,3)),iterations=1)
 if not core.any():core=mask
 _,indices=ndimage.distance_transform_edt(~core,return_indices=True)
 nearest=rgb[indices[0],indices[1]]
 expanded=ndimage.binary_dilation(mask,np.ones((3,3)),iterations=1)
 alpha=ndimage.gaussian_filter(expanded.astype(np.float32)*255.,.55)
 alpha=np.where(ndimage.binary_dilation(expanded,np.ones((3,3)),iterations=1),alpha,0)
 light=np.clip(nearest[:,:,dominant].astype(np.float32)*.72,42,218).astype(np.uint8)
 out=np.zeros((*mask.shape,4),np.uint8);out[:,:,:3]=light[:,:,None];out[:,:,3]=np.clip(alpha,0,255).astype(np.uint8)
 return out
def mask_layer(alpha):
 o=np.zeros((*alpha.shape,4),np.uint8);o[:,:,:3]=255;o[:,:,3]=alpha;return o
def tint(diff,p,s):
 o=np.zeros_like(diff);light=diff[:,:,:3].mean(2).astype(np.float32)/128.;c=diff[:,:,:3].astype(np.float32)
 c=np.where((p[:,:,3]>0)[:,:,None],TINT_A,c);c=np.where((s[:,:,3]>0)[:,:,None],TINT_B,c)
 o[:,:,:3]=np.clip(c*light[:,:,None],0,255).astype(np.uint8);o[:,:,3]=diff[:,:,3];return o
def comp(a,b):return np.array(Image.alpha_composite(Image.fromarray(a,'RGBA'),Image.fromarray(b,'RGBA')))
def checker(sz,cell=16):
 im=Image.new('RGBA',sz,(28,33,36,255));d=ImageDraw.Draw(im)
 for y in range(0,sz[1],cell):
  for x in range(0,sz[0],cell):
   if (x//cell+y//cell)%2:d.rectangle((x,y,min(sz[0]-1,x+cell-1),min(sz[1]-1,y+cell-1)),fill=(43,49,52,255))
 return im
def font(n,b=False):
 return ImageFont.truetype('/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf' if b else '/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf',n)
def sheet(frames,path,game=False):
 if game:
  cw,ch,cols=126,132,8;rows=2;im=Image.new('RGBA',(cw*cols,58+ch*rows),(18,22,25,255));d=ImageDraw.Draw(im);d.text((18,14),'Character remediation — edited classic composites (gameplay scale)',font=font(22,1),fill=(241,235,216,255))
  for i,(lab,a) in enumerate(frames):
   z=Image.fromarray(a,'RGBA');bb=z.getchannel('A').getbbox();z=z.crop(bb);scale=72/z.height;z=z.resize((round(z.width*scale),72),Image.Resampling.LANCZOS);x=i%8*cw;y=58+i//8*ch;p=checker((cw-8,92),8);p.alpha_composite(z,((p.width-z.width)//2,p.height-z.height-8));im.alpha_composite(p,(x+4,y+24));d.text((x+5,y+3),lab,font=font(11),fill=(190,205,205,255))
 else:
  cw,ch,cols=404,554,4;rows=4;im=Image.new('RGBA',(cw*cols,62+ch*rows),(18,22,25,255));d=ImageDraw.Draw(im);d.text((18,16),'Character remediation — edited classic composites (1:1 pixels)',font=font(24,1),fill=(241,235,216,255))
  for i,(lab,a) in enumerate(frames):
   x=i%4*cw;y=62+i//4*ch;p=checker(CANVAS);p.alpha_composite(Image.fromarray(a,'RGBA'));im.alpha_composite(p,(x+10,y+28));d.text((x+10,y+5),lab,font=font(15),fill=(190,205,205,255))
 path.parent.mkdir(parents=True,exist_ok=True);im.convert('RGB').save(path,quality=95)

def lower_body_leakage(body_alpha, garment, trouser, body_height):
 yy=np.indices(body_alpha.shape)[0]
 rows=np.where(trouser)[0]
 top,bottom=int(rows.min()),int(rows.max())
 exposed=body_alpha&~garment&(yy>=top)
 labels,count=ndimage.label(exposed)
 leaked=np.zeros_like(exposed)
 for label in range(1,count+1):
  ys=np.where(labels==label)[0]
  if len(ys) and int(ys.max())>=bottom-round(body_height*.04) and int(ys.max())-int(ys.min())+1>=round(body_height*.16):
   leaked|=labels==label
 return int((leaked&(yy<=bottom)).sum())


def main():
 parser=ArgumentParser()
 parser.add_argument('--apply',action='store_true')
 parser.add_argument('--output-root')
 parser.add_argument('--repo-root')
 parser.add_argument('--body-root')
 parser.add_argument('--source-root')
 args=parser.parse_args()
 if args.apply==bool(args.output_root):parser.error('choose exactly one of --apply or --output-root')

 repo=Path(args.repo_root).resolve() if args.repo_root else ROOT
 output=repo if args.apply else Path(args.output_root).resolve()
 base=Path(args.body_root).resolve() if args.body_root else repo/'apps/client-godot/assets/characters'
 source_root=Path(args.source_root).resolve() if args.source_root else repo/SOURCE_RELATIVE
 assets=output/'apps/client-godot/assets/characters'
 qa=output/QA_RELATIVE
 generated={body:source_root/SOURCE_NAMES[body] for body in BODIES}
 overrides={key:source_root/name for key,name in OVERRIDE_NAMES.items()}
 for path in (*generated.values(),*overrides.values()):
  if not path.is_file():raise FileNotFoundError(path)

 source_commit=subprocess.run(('git','rev-parse','HEAD'),cwd=repo,check=True,capture_output=True,text=True).stdout.strip()
 def report_path(path):return str(path.relative_to(repo)) if path.is_relative_to(repo) else str(path)
 input_files={}
 frames=[];metrics=[];output_paths=[]
 for body in BODIES:
  atlas_image=Image.open(generated[body]).convert('RGB')
  if atlas_image.size!=(1536,1024):raise ValueError(f'{generated[body]}: expected 1536x1024')
  atlas=np.array(atlas_image)
  for i,direction in enumerate(DIRS):
   x=i%4*CANVAS[0];y=i//4*CANVAS[1]
   if (body,direction) in overrides:
    source_image=Image.open(overrides[(body,direction)]).convert('RGB').resize(CANVAS,Image.Resampling.LANCZOS)
    rgb=np.array(source_image)
   else:
    rgb=atlas[y:y+CANVAS[1],x:x+CANVAS[0]]
   subject=subject_mask(rgb);generated_anchor=anchor(subject)
   body_path=base/f'body/{body}/idle/{direction}.png'
   skin_path=base/f'body/{body}/idle/skin-mask/{direction}.png'
   body_im=load(body_path);body_alpha=body_im[:,:,3]>20;body_anchor=anchor(body_alpha)
   if body_anchor[1]!=472 or abs(body_anchor[0]-192)>.51:raise ValueError(f'{body}/{direction}: body pivot {body_anchor} is not normalized')
   input_files[report_path(body_path)]=file_sha(body_path);input_files[report_path(skin_path)]=file_sha(skin_path)
   dx=round(body_anchor[0]-generated_anchor[0]);dy=body_anchor[1]-generated_anchor[1]
   red,blue=hue_masks(rgb,subject)
   protected_face,protected_hands,protected_feet=visible_skin_guards(visible_skin_mask(rgb,subject),subject)
   protected_face=translate_mask(protected_face,dx,dy);protected_hands=translate_mask(protected_hands,dx,dy);protected_feet=translate_mask(protected_feet,dx,dy)
   primary=translate(layer(rgb,red,0),dx,dy);secondary=translate(layer(rgb,blue,2),dx,dy)
   skin=load(skin_path)[:,:,3]>20
   yy,xx=np.indices(body_alpha.shape);bb=bbox(body_alpha);body_height=bb[3]-bb[1]+1
   fitted_sleeve_pixels=0
   if (body,direction)==('base-a','south_west'):
    visible=primary[:,:,3]>20;shirt_bottom=int(np.where(visible)[0].max())
    upper_seed=skin&(yy<=bb[1]+round(body_height*.15));_hy,_hx=np.where(upper_seed)
    head_guard=skin&(yy<=bb[1]+round(body_height*.25))&(xx>=_hx.min()-2)&(xx<=_hx.max()+2)
    candidate=body_alpha&(xx>=(bb[0]+bb[2])//2)&(yy>=bb[1]+round(body_height*.13))&(yy<=shirt_bottom)&~visible&~head_guard
    extension=ndimage.binary_dilation(visible,np.ones((3,3)),iterations=18)&candidate
    _,near_idx=ndimage.distance_transform_edt(~visible,return_indices=True);nearest=primary[near_idx[0],near_idx[1]]
    sleeve_cap=np.percentile(primary[:,:,0][visible],80);extension_rgb=np.minimum(nearest[:,:,:3],sleeve_cap).astype(np.uint8)
    primary[:,:,:3]=np.where(extension[:,:,None],extension_rgb,primary[:,:,:3])
    primary[:,:,3]=np.where(extension,body_im[:,:,3],primary[:,:,3]).astype(np.uint8)
    fitted_sleeve_pixels=int(extension.sum())
   feet=skin&(yy>bb[3]-round(body_height*.08));feet=ndimage.binary_dilation(feet,np.ones((3,3)),iterations=2)&body_alpha
   primary[:,:,3]=np.where(feet,0,primary[:,:,3]).astype(np.uint8)
   secondary[:,:,3]=np.where(feet,0,secondary[:,:,3]).astype(np.uint8)
   secondary[:,:,3]=np.where(primary[:,:,3]>0,0,secondary[:,:,3]).astype(np.uint8)
   alpha=np.maximum(primary[:,:,3],secondary[:,:,3])
   diffuse=np.zeros_like(primary);diffuse[:,:,:3]=np.where((primary[:,:,3]>0)[:,:,None],primary[:,:,:3],secondary[:,:,:3]);diffuse[:,:,3]=alpha
   primary_mask=mask_layer(primary[:,:,3]);secondary_mask=mask_layer(secondary[:,:,3])
   for kind,data in (('diffuse',diffuse),('primary-mask',primary_mask),('secondary-mask',secondary_mask)):
    path=assets/f'outfits/classic/{body}/idle/{kind}/{direction}.png';save(data,path);output_paths.append(path)
   rendered=comp(body_im,tint(diffuse,primary_mask,secondary_mask));frames.append((f'{body} / {direction}',rendered))
   garment=alpha>20;near=ndimage.binary_dilation(body_alpha,np.ones((3,3)),iterations=8)
   scalp=skin&(yy<=bb[1]+round(body_height*.10))
   mismatch=int((alpha!=np.maximum(primary_mask[:,:,3],secondary_mask[:,:,3])).sum())
   leakage=lower_body_leakage(body_alpha,garment,secondary_mask[:,:,3]>20,body_height)
   metrics.append({'body':body,'direction':direction,'translation':[dx,dy],'generatedSubjectBounds':list(bbox(subject)),'bodyBounds':list(bb),'primaryPixels':int((primary[:,:,3]>20).sum()),'secondaryPixels':int((secondary[:,:,3]>20).sum()),'fittedSleevePixels':fitted_sleeve_pixels,'maskOverlapPixels':int(((primary[:,:,3]>0)&(secondary[:,:,3]>0)).sum()),'diffuseMaskUnionMismatchPixels':mismatch,'uncoveredRearLegPixels':leakage,'protectedFacePixels':int(protected_face.sum()),'protectedHandPixels':int(protected_hands.sum()),'protectedFootPixels':int(protected_feet.sum()),'garmentPixelsOnProtectedFace':int((garment&protected_face).sum()),'garmentPixelsOnProtectedHands':int((garment&protected_hands).sum()),'garmentPixelsOnProtectedFeetFromEdit':int((garment&protected_feet).sum()),'garmentPixelsOnProtectedScalp':int((garment&scalp).sum()),'garmentPixelsOnProtectedFeet':int((garment&feet).sum()),'garmentOutsideBodyProximityPixels':int((garment&~near).sum()),'visibleScalpPixels':int((scalp&~garment).sum()),'visibleFeetPixels':int((feet&~garment).sum())})

 qa.mkdir(parents=True,exist_ok=True)
 full_path=qa/'classic-composites-full.png';game_path=qa/'classic-composites-gameplay.png'
 sheet(frames,full_path);sheet(frames,game_path,True);output_paths.extend((full_path,game_path))
 totals={'variants':len(metrics),'runtimeFiles':len(output_paths)-2,'maskOverlapPixels':sum(m['maskOverlapPixels'] for m in metrics),'diffuseMaskUnionMismatchPixels':sum(m['diffuseMaskUnionMismatchPixels'] for m in metrics),'uncoveredRearLegPixels':sum(m['uncoveredRearLegPixels'] for m in metrics),'garmentPixelsOnProtectedFace':sum(m['garmentPixelsOnProtectedFace'] for m in metrics),'garmentPixelsOnProtectedHands':sum(m['garmentPixelsOnProtectedHands'] for m in metrics),'garmentPixelsOnProtectedFeetFromEdit':sum(m['garmentPixelsOnProtectedFeetFromEdit'] for m in metrics),'garmentPixelsOnProtectedScalp':sum(m['garmentPixelsOnProtectedScalp'] for m in metrics),'garmentPixelsOnProtectedFeet':sum(m['garmentPixelsOnProtectedFeet'] for m in metrics),'garmentOutsideBodyProximityPixels':sum(m['garmentOutsideBodyProximityPixels'] for m in metrics),'maximumAbsoluteTranslationPixels':max(max(abs(v) for v in m['translation']) for m in metrics),'minimumProtectedFacePixels':min(m['protectedFacePixels'] for m in metrics),'minimumProtectedHandPixels':min(m['protectedHandPixels'] for m in metrics),'minimumProtectedFootPixels':min(m['protectedFootPixels'] for m in metrics),'minimumVisibleScalpPixels':min(m['visibleScalpPixels'] for m in metrics),'minimumVisibleFeetPixels':min(m['visibleFeetPixels'] for m in metrics),'fittedSleevePixels':sum(m['fittedSleevePixels'] for m in metrics)}
 report={'schemaVersion':1,'batch':'character-remediation-idle-classic-v1','component':'classic-outfit','sourceCommit':source_commit,'canvas':list(CANVAS),'groundContactPivot':[192,472],'layerOrderUnderTest':['body','classic-outfit'],'sourcePreservation':{'method':'Generated edit sources are committed separately; pre-replacement body/skin input hashes are recorded here and original runtime art remains in sourceCommit.','generatedSources':[{'path':str(path.relative_to(repo)) if path.is_relative_to(repo) else str(path),'sha256':file_sha(path)} for path in (*generated.values(),*overrides.values())],'bodyInputs':[{'path':path,'sha256':digest} for path,digest in sorted(input_files.items())]},'directions':metrics,'totals':totals,'visualQa':{'fullResolution':str(QA_RELATIVE/'classic-composites-full.png'),'gameplayScale':str(QA_RELATIVE/'classic-composites-gameplay.png')},'outputs':[{'path':str(path.relative_to(output)),'sha256':file_sha(path)} for path in sorted(output_paths)]}
 metrics_path=qa/'classic-composites-metrics.json';metrics_path.write_text(json.dumps(report,indent=2)+'\n')
 zero_gates=('maskOverlapPixels','diffuseMaskUnionMismatchPixels','uncoveredRearLegPixels','garmentPixelsOnProtectedFace','garmentPixelsOnProtectedHands','garmentPixelsOnProtectedFeetFromEdit','garmentPixelsOnProtectedScalp','garmentPixelsOnProtectedFeet')
 failures={name:totals[name] for name in zero_gates if totals[name]!=0}
 if totals['variants']!=16:failures['variants']=totals['variants']
 if totals['runtimeFiles']!=48:failures['runtimeFiles']=totals['runtimeFiles']
 if totals['maximumAbsoluteTranslationPixels']>12:failures['maximumAbsoluteTranslationPixels']=totals['maximumAbsoluteTranslationPixels']
 if totals['garmentOutsideBodyProximityPixels']>64:failures['garmentOutsideBodyProximityPixels']=totals['garmentOutsideBodyProximityPixels']
 if totals['minimumProtectedFacePixels']<2000:failures['minimumProtectedFacePixels']=totals['minimumProtectedFacePixels']
 if totals['minimumProtectedHandPixels']<150:failures['minimumProtectedHandPixels']=totals['minimumProtectedHandPixels']
 if totals['minimumProtectedFootPixels']<900:failures['minimumProtectedFootPixels']=totals['minimumProtectedFootPixels']
 print(json.dumps({'outputRoot':str(output),'totals':totals,'failures':failures},indent=2))
 if failures:raise SystemExit(1)


if __name__=='__main__':
 main()
