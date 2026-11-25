"""Offline compositing: one complete A & H seal travels with the reference flap.
The browser plays one finished MP4; there are no independently timed UI patches.
"""
from pathlib import Path
import cv2, numpy as np, subprocess, json
project=Path(__file__).resolve().parents[1]
root=project.parents[1]
public=project/'public'
ffmpeg=Path(r'C:/Users/Hameed/AppData/Local/Microsoft/WinGet/Packages/Gyan.FFmpeg_Microsoft.Winget.Source_8wekyb3d8bbwe/ffmpeg-8.1.2-full_build/bin/ffmpeg.exe')
source=root/'outputs/sacred-garden-source/assets/media/9bdf874a9952_1782224012851_1_m6ww6v.mp4'
seal=cv2.imread(str(public/'assets/images/wax-seal-ah-v2.png'),cv2.IMREAD_UNCHANGED)
assert seal.shape[2]==4
x,y,w,h=cv2.boundingRect((seal[:,:,3]>12).astype(np.uint8))
seal=seal[y:y+h,x:x+w].astype(np.float32)/255
cap=cv2.VideoCapture(str(source)); fps=cap.get(cv2.CAP_PROP_FPS); frames=[]; bounds=[]; contours=[]
while True:
 ok,frame=cap.read()
 if not ok: break
 hsv=cv2.cvtColor(frame,cv2.COLOR_BGR2HSV)
 mask=cv2.inRange(hsv,np.array([0,75,10]),np.array([10,255,255]))|cv2.inRange(hsv,np.array([160,75,10]),np.array([179,255,255]))
 found,_=cv2.findContours(mask,cv2.RETR_EXTERNAL,cv2.CHAIN_APPROX_SIMPLE)
 candidates=[c for c in found if 200<cv2.boundingRect(c)[2]<400 and 150<cv2.boundingRect(c)[3]<330]
 contour=max(candidates,key=cv2.contourArea)
 bx,by,bw,bh=cv2.boundingRect(contour)
 frames.append(frame); contours.append(contour); bounds.append([bx+bw/2,by+bh/2,bw,bh])
cap.release()
times=np.arange(len(frames))/fps
bounds=np.array(bounds,dtype=np.float64)
# Smooth the whole object's pose; never track the gold letters separately.
poses=np.stack([np.polyval(np.polyfit(times,bounds[:,c],5),times) for c in range(4)],axis=1)
output=public/'assets/media/envelope-opening-ah-v2.mp4'
pipe=subprocess.Popen([str(ffmpeg),'-hide_banner','-loglevel','error','-y','-f','rawvideo','-pixel_format','bgr24','-video_size','720x1280','-framerate',str(fps),'-i','-','-an','-c:v','libx264','-preset','medium','-crf','18','-profile:v','high','-level:v','3.1','-pix_fmt','yuv420p','-movflags','+faststart',str(output)],stdin=subprocess.PIPE)
for i,frame in enumerate(frames):
 # Remove the entire old seal, including its lettering and rim, in the offline
 # video composite. The original gold glow outside that silhouette is retained.
 mask=np.zeros(frame.shape[:2],np.uint8)
 cv2.drawContours(mask,[cv2.convexHull(contours[i])],-1,255,-1)
 mask=cv2.dilate(mask,cv2.getStructuringElement(cv2.MORPH_ELLIPSE,(19,19)))
 mx,my,mw,mh=cv2.boundingRect(mask)
 pad=20; x0=max(0,mx-pad);y0=max(0,my-pad);x1=min(720,mx+mw+pad);y1=min(1280,my+mh+pad)
 clean=frame.copy()
 clean[y0:y1,x0:x1]=cv2.inpaint(frame[y0:y1,x0:x1],mask[y0:y1,x0:x1],5,cv2.INPAINT_TELEA)
 cx,cy,width,height=poses[i]
 width*=1.035; height*=1.035
 # The entire seal shares the same smooth foreshortening as the lifting flap.
 sw,sh=round(width),round(height)
 object_rgba=cv2.resize(seal,(sw,sh),interpolation=cv2.INTER_AREA)
 px,py=round(cx-sw/2),round(cy-sh/2)
 alpha=object_rgba[:,:,3:4]
 # Keep a soft contact shadow attached to the same object.
 shadow=np.zeros(frame.shape[:2],np.float32)
 shadow[py+5:py+5+sh,px:px+sw]=alpha[:,:,0]
 shadow=cv2.GaussianBlur(shadow,(0,0),4)*.18
 clean=(clean.astype(np.float32)*(1-shadow[:,:,None]))
 roi=clean[py:py+sh,px:px+sw]
 clean[py:py+sh,px:px+sw]=object_rgba[:,:,:3]*255*alpha+roi*(1-alpha)
 rendered=np.clip(clean,0,255).astype(np.uint8)
 pipe.stdin.write(rendered.tobytes())
pipe.stdin.close(); assert pipe.wait()==0
# Extract the poster from the encoded file, so the first displayed pixels are
# the same before and after tapping, including the complete wax seal.
cap=cv2.VideoCapture(str(output));ok,first=cap.read();cap.release();assert ok
cv2.imwrite(str(public/'assets/images/envelope-poster-ah-v2.jpg'),first,[cv2.IMWRITE_JPEG_QUALITY,97])
# Pose data is only needed during offline rendering, never on the client.
print({'frames':len(frames),'seconds':len(frames)/fps,'video_bytes':output.stat().st_size,'seal_alpha':True})
