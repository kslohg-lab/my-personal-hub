/* 알록달록 미니골프 — 위에서 내려다보는 9홀 미니골프 (Phaser, 공 움직임은 직접 계산)
   혼자: 9홀 최소 타수 기록 / 같이: 아빠·엄마·채아·지아가 한 폰을 돌려 가며
   저장: localStorage 'miniGolfV1' {best, hio, snd, who, rounds} */
(()=>{'use strict';
const {R,rnd,clamp,$,AU,BGM}=KIT;
const SZ=KIT.size(420,680,940),W=SZ.W,H=SZ.H;
const FW=400,FH=640,BR=7,CUPR=10,MAXV=800,PULL=130;
const MEMBERS=[['dad','아빠',0x4aa8ff],['mom','엄마',0xff6fa8],['chaea','채아',0xffc93a],['jia','지아',0x5fd36a]];
const SV=KIT.save('miniGolfV1',()=>({best:0,hio:0,snd:1,who:['dad','mom','chaea','jia'],rounds:0}));const S=SV.data;AU.on=BGM.on=!!S.snd;
const rect=(x1,y1,x2,y2)=>[[x1,y1],[x2,y1],[x2,y2],[x1,y2]];
/* 홀: o 잔디 테두리, w 벽 [x,y,w,h], b 범퍼 [x,y,r], s 모래, wa 물, sl 경사 [x,y,w,h,ax,ay], mv 움직이는 벽 [x,y,w,h,dx,dy,주기], t 시작, c 컵, p 파 */
const HOLES=[
 {n:'똑바로 쏙',p:2,o:rect(110,40,290,600),t:[200,540],c:[200,120]},
 {n:'기역자 길',p:3,o:[[60,40],[340,40],[340,200],[180,200],[180,600],[60,600]],t:[120,545],c:[285,118]},
 {n:'통통 범퍼',p:2,o:rect(70,40,330,600),b:[[200,330,22],[128,250,17],[272,250,17],[148,430,15],[252,430,15]],t:[200,550],c:[200,112]},
 {n:'모래 언덕',p:3,o:rect(70,40,330,600),w:[[70,300,165,24],[290,300,40,24]],s:[[110,150,180,66],[90,420,90,80]],t:[130,545],c:[200,100]},
 {n:'다리 건너기',p:3,o:rect(70,40,330,600),wa:[[70,250,118,120],[262,250,68,120]],t:[200,545],c:[280,112]},
 {n:'움직이는 문',p:3,o:rect(70,40,330,600),w:[[70,310,100,20],[230,310,100,20]],mv:[[110,270,60,20,120,0,2.8]],t:[200,550],c:[200,112]},
 {n:'바람 부는 길',p:3,o:rect(60,40,340,600),sl:[[60,195,280,95,420,0],[60,330,280,95,-420,0]],t:[200,550],c:[112,100]},
 {n:'지그재그',p:4,o:rect(60,40,340,600),w:[[60,180,200,22],[140,330,200,22],[60,470,200,22]],b:[[318,255,12]],t:[110,555],c:[112,100]},
 {n:'보물섬',p:3,o:rect(50,40,350,600),wa:[[110,90,180,40],[110,130,40,100],[250,130,40,100],[110,230,65,40],[225,230,65,40]],b:[[95,360,17],[305,360,17],[200,420,14]],t:[200,555],c:[200,178]}];
const NAMES=a=>a<=-3?'🦅 앨버트로스!':a===-2?'🦅 이글!':a===-1?'🐦 버디!':a===0?'👍 파!':a===1?'보기':a===2?'더블 보기':'+'+a;

class Main extends Phaser.Scene{constructor(){super('main')}
 create(){window.__mg=this;KIT.textures(this);
  this.wl=this.add.layer();this.hl=this.add.layer();
  const z=this.z=Math.min((W-12)/FW,(H-92)/FH),cam=this.cameras.main;cam.setZoom(z*R);cam.centerOn(FW/2,FH/2-26/z);
  this.uic=this.cameras.add(0,0,W*R,H*R).setZoom(R);this.uic.centerOn(W/2,H/2);cam.ignore(this.hl);this.uic.ignore(this.wl);
  this.bg=this.W(this.add.image(FW/2,FH/2,'__DEFAULT').setDepth(0));
  this.dyn=this.W(this.add.graphics().setDepth(5));      // 움직이는 벽, 경사 화살표
  this.wave=this.W(this.add.graphics().setDepth(4));
  this.aimG=this.W(this.add.graphics().setDepth(30));
  this.shadow=this.W(this.add.ellipse(0,0,BR*2.2,BR*1.1,0x000000,.25).setDepth(19));
  this.ball=this.W(this.add.container(0,0).setDepth(20));
  const bb=this.add.circle(0,0,BR,0xffffff).setStrokeStyle(1.2,0xc8c8c8);this.ballRing=this.add.arc(0,0,BR-2.2,0,360,false,0x000000,0).setStrokeStyle(2.4,0xff9a3a);
  this.ball.add([bb,this.ballRing,this.add.circle(-2.2,-2.4,1.8,0xffffff,1)]);
  this.pole=this.W(this.add.rectangle(0,0,2,46,0xf4f4f4).setOrigin(.5,1).setDepth(22));
  this.flag=this.W(this.add.triangle(0,0,0,0,24,7,0,14,0xff4f6a).setOrigin(0,0).setDepth(22));
  this.tweens.add({targets:this.flag,scaleX:.75,duration:500,yoyo:true,repeat:-1,ease:'Sine.easeInOut'});
  this.bump=[];this.trail=this.W(this.add.particles(0,0,'dot',{lifespan:280,scale:{start:.45,end:0},alpha:{start:.5,end:0},emitting:false}).setDepth(18));
  this.spl=this.W(this.add.particles(0,0,'dot',{lifespan:700,speed:{min:40,max:150},scale:{start:.5,end:0},tint:[0x9fdcff,0xffffff,0x5ab8ff],gravityY:240,emitting:false}).setDepth(25));
  this.conf=this.H(this.add.particles(0,0,'spark',{lifespan:1600,speed:{min:120,max:340},angle:{min:220,max:320},gravityY:420,scale:{start:.9,end:.2},rotate:{min:0,max:360},tint:[0xff7eb3,0xffd93b,0x6fd67a,0x5aa9ff,0xa685ff],emitting:false}).setDepth(90));
  this.big=this.H(KIT.text(this,W/2,H*.42,'',40,'#fff','#1f6a3a').setDepth(95).setAlpha(0));
  this.sub=this.H(KIT.text(this,W/2,H*.42+46,'',22,'#fff','#1f6a3a').setDepth(95).setAlpha(0));
  this.input.on('pointerdown',p=>this.down(p));this.input.on('pointermove',p=>this.move(p));this.input.on('pointerup',p=>this.up(p));
  this.bindUI();$('load').style.display='none';KIT.fitUI(W);addEventListener('resize',()=>setTimeout(()=>KIT.fitUI(W),60));this.scale.on('resize',()=>setTimeout(()=>KIT.fitUI(W),30));
  this.mode='home';this.buildHole(0);this.home()}
 W(o){this.wl.add(o);return o}
 H(o){this.hl.add(o);return o}
 bindUI(){const sc=id=>{document.querySelectorAll('.scr').forEach(e=>e.classList.toggle('on',e.id===id));const play=id===null;$('pbtn').style.display=play?'block':'none';$('hud').classList.toggle('on',play||id==='pause');$('hint').style.display=play?'block':'none'};this.sc=sc;
  $('bSolo').onclick=()=>{AU.init();AU.sfx('click');this.start([['me','나',0xffffff]])};
  $('bMulti').onclick=()=>{AU.init();AU.sfx('click');if(S.who.length<2){KIT.toast('두 명 이상 골라요');return}this.start(MEMBERS.filter(m=>S.who.includes(m[0])))};
  $('sbtn').onclick=()=>{S.snd=S.snd?0:1;AU.on=BGM.on=!!S.snd;SV.put();$('sbtn').textContent=S.snd?'🔊':'🔇';AU.init();AU.sfx('click')};$('sbtn').textContent=S.snd?'🔊':'🔇';
  $('pbtn').onclick=()=>{AU.sfx('click');this.paused=1;sc('pause')};$('pGo').onclick=()=>{this.paused=0;sc(null)};$('pHome').onclick=()=>{this.paused=0;this.home()};
  $('pCard').onclick=()=>{this.showCard(true)};
  $('cGo').onclick=()=>{AU.sfx('click');if(this.cardBack){this.cardBack=0;sc('pause');return}if(this.hi>=HOLES.length-1)this.start(this.pl.map(p=>p.m));else this.nextHole()};
  $('cHome').onclick=()=>{AU.sfx('click');if(this.cardBack){this.cardBack=0;this.paused=0}this.home()}}
 home(){this.mode='home';this.paused=0;this.state='';this.aimG.clear();
  const w=$('who');w.innerHTML='';MEMBERS.forEach(([id,n])=>{const b=document.createElement('button');b.textContent=n;if(S.who.includes(id))b.className='on';b.onclick=()=>{AU.init();AU.sfx('pick');S.who=S.who.includes(id)?S.who.filter(x=>x!==id):[...S.who,id];SV.put();this.home()};w.appendChild(b)});
  $('hb').textContent=S.best?`🏆 혼자 최고 ${S.best}타 · 홀인원 ${S.hio}번`:(S.hio?`⛳ 홀인원 ${S.hio}번`:'🏆 최고 기록 없음');
  this.buildHole(Math.floor(Math.random()*HOLES.length));this.ball.setVisible(false);this.shadow.setVisible(false);this.sc('home');BGM.play('calm')}
 start(list){this.pl=list.map(m=>({m,id:m[0],name:m[1],col:m[2],st:[]}));this.hi=-1;this.solo=list.length===1&&list[0][0]==='me';this.mode='play';this.nextHole()}
 nextHole(){this.hi++;this.pi=0;this.buildHole(this.hi);this.sc(null);BGM.play('bright');this.beginTurn()}
 beginTurn(){const p=this.pl[this.pi],h=this.h;this.strokes=0;this.cap=Math.min(h.p+4,9);
  this.ballRing.setStrokeStyle(2.4,p.col===0xffffff?0xff9a3a:p.col);this.ball.setVisible(true).setScale(1).setAlpha(1);this.shadow.setVisible(true);
  this.bx=h.t[0];this.by=h.t[1];this.vx=this.vy=0;this.lastX=this.bx;this.lastY=this.by;this.state='intro';this.hud();
  $('hint').style.opacity=this.hi===0&&this.pi===0?1:0;
  this.banner(`${this.hi+1}번 홀 · 파 ${h.p}`,(this.pl.length>1?p.name+' 차례! · ':'')+h.n,()=>{this.state='aim'})}
 banner(a,b,cb){this.big.setText(a).setAlpha(0).setScale(.5);this.sub.setText(b).setAlpha(0);
  this.tweens.add({targets:this.big,alpha:1,scale:1,duration:300,ease:'Back.easeOut'});this.tweens.add({targets:this.sub,alpha:1,duration:300,delay:100});
  this.tweens.add({targets:[this.big,this.sub],alpha:0,duration:300,delay:1250,onComplete:()=>cb&&cb()})}
 hud(){const p=this.pl[this.pi],c='#'+p.col.toString(16).padStart(6,'0');$('hH').textContent=`${this.hi+1}/9홀 · 파 ${this.h.p}`;
  $('hP').innerHTML=`<i style="background:${c}"></i>${p.name}`;$('hS').textContent=this.strokes+'타'}
 /* ---------- 홀 만들기 ---------- */
 buildHole(i){const h=this.h=HOLES[i];this.segs=[];this.bump.forEach(b=>b.destroy());this.bump=[];
  const o=h.o;for(let k=0;k<o.length;k++){const a=o[k],b=o[(k+1)%o.length];this.segs.push([a[0],a[1],b[0],b[1]])}
  (h.w||[]).forEach(([x,y,w,hh])=>this.segs.push(...this.rsegs(x,y,w,hh)));
  this.movers=(h.mv||[]).map(m=>({x0:m[0],y0:m[1],w:m[2],h:m[3],dx:m[4],dy:m[5],per:m[6],x:m[0],y:m[1],vx:0,vy:0}));
  (h.b||[]).forEach(([x,y,r])=>{const c=this.W(this.add.container(x,y).setDepth(15));c.add([this.add.circle(2,3,r,0x000000,.22),this.add.circle(0,0,r,0xff4f6a).setStrokeStyle(3,0xffffff),this.add.circle(0,0,r*.45,0xffd0dc),this.add.circle(-r*.35,-r*.35,r*.18,0xffffff,.9)]);c.r=r;this.bump.push(c)});
  this.drawField();this.pole.setPosition(h.c[0],h.c[1]);this.flag.setPosition(h.c[0]+1,h.c[1]-46);this.pole.setAlpha(1);this.flag.setAlpha(1)}
 rsegs(x,y,w,h){return [[x,y,x+w,y],[x+w,y,x+w,y+h],[x+w,y+h,x,y+h],[x,y+h,x,y]]}
 drawField(){const h=this.h,K=2*R,c=document.createElement('canvas');c.width=FW*K;c.height=FH*K;const x=c.getContext('2d');x.scale(K,K);
  // 바깥 잔디
  x.fillStyle='#3f9a4c';x.fillRect(0,0,FW,FH);for(let i=0;i<260;i++){x.fillStyle=Math.random()<.5?'#378a43':'#4aa857';const a=Math.random()*FW,b=Math.random()*FH;x.fillRect(a,b,2,5)}
  [[20,60],[375,120],[25,620],[380,560],[30,330],[372,380]].forEach(([a,b])=>{x.fillStyle='rgba(0,0,0,.15)';x.beginPath();x.ellipse(a+3,b+5,15,8,0,0,7);x.fill();x.fillStyle='#2f7d3c';x.beginPath();x.arc(a,b,14,0,7);x.fill();x.fillStyle='#46a454';x.beginPath();x.arc(a-4,b-4,8,0,7);x.fill();x.fillStyle='#ff8fb8';x.beginPath();x.arc(a+5,b-3,2.5,0,7);x.fill()});
  const poly=()=>{x.beginPath();h.o.forEach((p,k)=>k?x.lineTo(p[0],p[1]):x.moveTo(p[0],p[1]));x.closePath()};
  // 벽(테두리)
  x.save();x.shadowColor='rgba(0,0,0,.35)';x.shadowBlur=10;x.shadowOffsetY=4;poly();x.lineJoin='round';x.lineWidth=26;x.strokeStyle='#b8753f';x.stroke();x.restore();
  poly();x.lineWidth=20;x.strokeStyle='#d8955a';x.stroke();poly();x.lineWidth=9;x.strokeStyle='#e9b07a';x.stroke();
  // 잔디 + 줄무늬
  x.save();poly();x.clip();x.fillStyle='#6cd474';x.fillRect(0,0,FW,FH);x.fillStyle='#62c96b';for(let yy=0;yy<FH;yy+=40)x.fillRect(0,yy,FW,20);
  x.shadowColor='rgba(0,0,0,.28)';x.shadowBlur=8;x.shadowOffsetY=3;x.strokeStyle='rgba(0,0,0,0)';poly();x.lineWidth=2;x.strokeStyle='rgba(0,0,0,.25)';x.stroke();x.restore();
  // 모래
  (h.s||[]).forEach(([a,b,w,hh])=>{x.fillStyle='#e9cf8f';this.rr(x,a,b,w,hh,16);x.fill();x.fillStyle='#d9b870';for(let i=0;i<w*hh/60;i++)x.fillRect(a+6+Math.random()*(w-12),b+6+Math.random()*(hh-12),1.6,1.6);x.strokeStyle='#cfae66';x.lineWidth=2;this.rr(x,a,b,w,hh,16);x.stroke()});
  // 물
  (h.wa||[]).forEach(([a,b,w,hh])=>{x.fillStyle='#3aa0e8';x.fillRect(a,b,w,hh);const g=x.createLinearGradient(0,b,0,b+hh);g.addColorStop(0,'rgba(255,255,255,.25)');g.addColorStop(1,'rgba(0,40,120,.15)');x.fillStyle=g;x.fillRect(a,b,w,hh);x.strokeStyle='#8fd6ff';x.lineWidth=3;x.strokeRect(a+1.5,b+1.5,w-3,hh-3)});
  // 경사(바람) 띠
  (h.sl||[]).forEach(([a,b,w,hh,ax,ay])=>{x.fillStyle='rgba(120,190,255,.28)';x.fillRect(a,b,w,hh)});
  // 벽 블록
  (h.w||[]).forEach(([a,b,w,hh])=>{x.save();x.shadowColor='rgba(0,0,0,.35)';x.shadowBlur=8;x.shadowOffsetY=4;x.fillStyle='#b8753f';x.fillRect(a,b,w,hh);x.restore();x.fillStyle='#d8955a';x.fillRect(a+2,b+2,w-4,hh-4);x.fillStyle='#e9b07a';x.fillRect(a+2,b+2,w-4,Math.min(5,hh/3))});
  // 시작 매트, 컵
  const [tx,ty]=h.t;x.fillStyle='#4fb35a';this.rr(x,tx-20,ty-14,40,28,8);x.fill();x.fillStyle='rgba(255,255,255,.65)';x.beginPath();x.arc(tx,ty,3,0,7);x.fill();
  const [cx,cy]=h.c;x.fillStyle='#4fb35a';x.beginPath();x.arc(cx,cy,CUPR+7,0,7);x.fill();x.fillStyle='#fff';x.beginPath();x.arc(cx,cy,CUPR+1.5,0,7);x.fill();x.fillStyle='#1d2a20';x.beginPath();x.arc(cx,cy,CUPR,0,7);x.fill();x.fillStyle='#34463a';x.beginPath();x.arc(cx,cy+2,CUPR-3,0,7);x.fill();
  // 홀 번호 표지
  x.fillStyle='rgba(255,255,255,.9)';this.rr(x,8,8,58,26,10);x.fill();x.fillStyle='#2f7d3c';x.font='18px Jua, sans-serif';x.textAlign='center';x.textBaseline='middle';x.fillText((HOLES.indexOf(h)+1)+'번 홀',37,22);
  const key='field'+(this.fk=(this.fk||0)+1),old=this.lastKey;this.textures.addCanvas(key,c);this.lastKey=key;this.bg.setTexture(key).setDisplaySize(FW,FH);if(old)this.textures.remove(old)}
 rr(x,a,b,w,h,r){x.beginPath();x.moveTo(a+r,b);x.arcTo(a+w,b,a+w,b+h,r);x.arcTo(a+w,b+h,a,b+h,r);x.arcTo(a,b+h,a,b,r);x.arcTo(a,b,a+w,b,r);x.closePath()}
 /* ---------- 조준 ---------- */
 down(p){if(this.mode!=='play'||this.state!=='aim'||this.paused)return;const w=p.positionToCamera(this.cameras.main);this.drag={x:w.x,y:w.y};this.pw=0}
 move(p){if(!this.drag||this.state!=='aim')return;const w=p.positionToCamera(this.cameras.main);let dx=this.drag.x-w.x,dy=this.drag.y-w.y,l=Math.hypot(dx,dy);
  this.pw=clamp(l/PULL,0,1);this.ax=l?dx/l:0;this.ay=l?dy/l:0;this.drawAim()}
 up(){if(!this.drag)return;this.drag=null;this.aimG.clear();if(this.state!=='aim'||this.pw<.06)return;this.shoot(this.ax,this.ay,this.pw)}
 drawAim(){const g=this.aimG;g.clear();if(this.pw<.06)return;const p=this.pw,col=p<.5?0x6fe06f:p<.8?0xffd23a:0xff5a5a,L=24+p*120;
  for(let d=14;d<L;d+=11){const k=1-d/(L+30);g.fillStyle(0xffffff,.85*k+.15);g.fillCircle(this.bx+this.ax*d,this.by+this.ay*d,2.6)}
  const ex=this.bx+this.ax*(L+6),ey=this.by+this.ay*(L+6),nx=-this.ay,ny=this.ax;g.fillStyle(col,1);g.fillTriangle(ex+this.ax*10,ey+this.ay*10,ex+nx*7,ey+ny*7,ex-nx*7,ey-ny*7);
  g.lineStyle(4,0x000000,.18);g.strokeCircle(this.bx,this.by,BR+9);g.lineStyle(4,col,1);g.beginPath();g.arc(this.bx,this.by,BR+9,-Math.PI/2,-Math.PI/2+Math.PI*2*p);g.strokePath()}
 shoot(ax,ay,p){const v=MAXV*Math.pow(p,1.15);this.vx=ax*v;this.vy=ay*v;this.lastX=this.bx;this.lastY=this.by;this.strokes++;this.hud();this.state='roll';this.rollT=0;
  AU.tone(300+p*500,.06,'triangle',.18);AU.noise(.05,.15,0,3000);$('hint').style.opacity=0}
 /* ---------- 공 움직임 ---------- */
 update(t,dl){const dt=Math.min(dl/1000,1/20);if(this.paused)return;
  // 움직이는 벽
  for(const m of this.movers){const s=Math.sin(t/1000/m.per*Math.PI*2)*.5+.5,nx=m.x0+m.dx*s,ny=m.y0+m.dy*s;m.vx=(nx-m.x)/Math.max(dt,1e-3);m.vy=(ny-m.y)/Math.max(dt,1e-3);m.x=nx;m.y=ny}
  this.drawDyn(t);
  if(this.mode==='play'&&this.state==='roll')this.step(dt);
  else if(this.mode==='play'&&this.state==='aim')this.pushByMovers();
  this.ball.setPosition(this.bx,this.by);this.shadow.setPosition(this.bx+2,this.by+3);
  if(this.state==='aim'&&this.drag)this.drawAim()}
 pushByMovers(){for(const m of this.movers)this.collideRect(m,this.rsegs(m.x,m.y,m.w,m.h))}
 step(dt){const h=this.h;this.rollT+=dt;let sp=Math.hypot(this.vx,this.vy);const n=Math.max(1,Math.ceil(sp*dt/3)),d=dt/n;
  for(let i=0;i<n;i++){
   // 경사·바람
   for(const s of h.sl||[])if(this.inR(s)){this.vx+=s[4]*d;this.vy+=s[5]*d}
   this.bx+=this.vx*d;this.by+=this.vy*d;
   for(const s of this.segs)this.collideSeg(s,0,0,.78);
   for(const m of this.movers)this.collideRect(m,this.rsegs(m.x,m.y,m.w,m.h));
   for(const b of this.bump)this.collideBump(b);
   // 컵
   const cx=h.c[0]-this.bx,cy=h.c[1]-this.by,cd=Math.hypot(cx,cy);sp=Math.hypot(this.vx,this.vy);
   if(cd<CUPR+4&&sp<160){this.vx+=cx/cd*500*d;this.vy+=cy/cd*500*d}
   if(cd<CUPR-2){if(sp<430){this.sink();return}if(!this.lip){this.lip=1;const a=rnd(-.5,.5),c=Math.cos(a),s=Math.sin(a);[this.vx,this.vy]=[(this.vx*c-this.vy*s)*.75,(this.vx*s+this.vy*c)*.75];AU.tone(900,.05,'sine',.08)}}else this.lip=0;
   // 물
   for(const w of h.wa||[])if(this.inR(w)){this.splash();return}}
  // 마찰
  sp=Math.hypot(this.vx,this.vy);const sand=(h.s||[]).some(s=>this.inR(s)),dec=(sand?950:150)+sp*(sand?1.6:.32);
  if(sp>0){const ns=Math.max(0,sp-dec*dt);this.vx*=ns/sp;this.vy*=ns/sp;sp=ns}
  if(sp>260&&Math.random()<.6)this.trail.emitParticleAt(this.bx,this.by,1);
  const inSlope=(h.sl||[]).some(s=>this.inR(s));
  if(sp<5&&!inSlope||this.rollT>14){this.vx=this.vy=0;this.stopped()}}
 inR(r){return this.bx>r[0]&&this.bx<r[0]+r[2]&&this.by>r[1]&&this.by<r[1]+r[3]}
 collideSeg(s,mvx,mvy,e){const [x1,y1,x2,y2]=s,ex=x2-x1,ey=y2-y1,L=ex*ex+ey*ey;let u=((this.bx-x1)*ex+(this.by-y1)*ey)/L;u=clamp(u,0,1);
  const qx=x1+ex*u,qy=y1+ey*u;let dx=this.bx-qx,dy=this.by-qy,d=Math.hypot(dx,dy);if(d>=BR||d<1e-6)return false;dx/=d;dy/=d;
  this.bx=qx+dx*BR;this.by=qy+dy*BR;const rvx=this.vx-mvx,rvy=this.vy-mvy,vn=rvx*dx+rvy*dy;
  if(vn<0){this.vx-=(1+e)*vn*dx;this.vy-=(1+e)*vn*dy;const tx=-dy,ty=dx,vt=this.vx*tx+this.vy*ty;this.vx-=vt*.06*tx;this.vy-=vt*.06*ty;if(-vn>60)this.knock(-vn)}return true}
 collideRect(m,segs){for(const s of segs)this.collideSeg(s,m.vx,m.vy,.8)}
 collideBump(b){const dx=this.bx-b.x,dy=this.by-b.y,d=Math.hypot(dx,dy),r=b.r+BR;if(d>=r||d<1e-6)return;const nx=dx/d,ny=dy/d;this.bx=b.x+nx*r;this.by=b.y+ny*r;
  const vn=this.vx*nx+this.vy*ny;if(vn<0){this.vx-=2.15*vn*nx;this.vy-=2.15*vn*ny;const sp=Math.hypot(this.vx,this.vy),want=Math.max(sp,240);if(sp>1){this.vx*=want/sp;this.vy*=want/sp}
   const s2=Math.hypot(this.vx,this.vy);if(s2>MAXV){this.vx*=MAXV/s2;this.vy*=MAXV/s2}
   AU.sfx('pop',3);this.tweens.killTweensOf(b);b.setScale(1.25);this.tweens.add({targets:b,scale:1,duration:260,ease:'Back.easeOut'})}}
 knock(v){const n=performance.now();if(n-(this.kt||0)<60)return;this.kt=n;AU.noise(.05,Math.min(.25,v/2200),0,700);AU.tone(180,.06,'triangle',Math.min(.12,v/5000))}
 drawDyn(t){const g=this.dyn;g.clear();
  for(const m of this.movers){g.fillStyle(0x000000,.25);g.fillRoundedRect(m.x+2,m.y+4,m.w,m.h,6);g.fillStyle(0xa685ff,1);g.fillRoundedRect(m.x,m.y,m.w,m.h,6);g.fillStyle(0xc9b5ff,1);g.fillRoundedRect(m.x+3,m.y+3,m.w-6,5,3)}
  for(const s of this.h.sl||[]){const [a,b,w,hh,ax,ay]=s,dir=Math.sign(ax),off=(t/1000*60)%40;g.fillStyle(0xffffff,.55);
   for(let yy=b+20;yy<b+hh;yy+=hh/2-6)for(let xx=a-40+(dir>0?off:40-off);xx<a+w;xx+=40){if(xx<a+6||xx>a+w-14)continue;const x0=xx,c=yy;if(dir>0)g.fillTriangle(x0,c-8,x0+12,c,x0,c+8);else g.fillTriangle(x0+12,c-8,x0,c,x0+12,c+8)}}
  const wv=this.wave;wv.clear();for(const r of this.h.wa||[]){wv.lineStyle(2,0xffffff,.45);for(let k=0;k<Math.max(1,r[2]*r[3]/2600);k++){const px=r[0]+10+((k*53+t/40)%(r[2]-24)),py=r[1]+12+((k*37)%(r[3]-24))+Math.sin(t/400+k)*2;wv.beginPath();wv.arc(px,py,5,Math.PI*1.15,Math.PI*1.85);wv.strokePath()}}
  // 깃대는 공이 가까이 오면 흐리게
  const cd=Math.hypot(this.h.c[0]-this.bx,this.h.c[1]-this.by),al=this.mode==='play'?clamp((cd-20)/70,.25,1):1;this.pole.setAlpha(al);this.flag.setAlpha(al)}
 /* ---------- 결과 ---------- */
 splash(){this.state='wait';this.spl.explode(22,this.bx,this.by);AU.noise(.4,.25,0,1800);AU.tone(500,.3,'sine',.1,0,160);this.ball.setVisible(false);this.shadow.setVisible(false);
  this.strokes++;this.hud();this.W(KIT.floatText(this,this.bx,this.by-10,'풍덩! +1타','#bfe9ff',20,40));
  this.time.delayedCall(900,()=>{this.bx=this.lastX;this.by=this.lastY;this.vx=this.vy=0;this.ball.setVisible(true).setScale(.2);this.shadow.setVisible(true);this.tweens.add({targets:this.ball,scale:1,duration:250,ease:'Back.easeOut'});this.afterShot()})}
 stopped(){this.state='wait';this.afterShot()}
 afterShot(){if(this.strokes>=this.cap){this.big.setText('여기까지!');this.done(this.cap,true);return}this.state='aim'}
 sink(){this.state='wait';const h=this.h;this.vx=this.vy=0;this.shadow.setVisible(false);
  this.tweens.add({targets:this.ball,x:h.c[0],y:h.c[1],scale:.45,duration:160,onUpdate:()=>{this.bx=this.ball.x;this.by=this.ball.y},onComplete:()=>{this.ball.setVisible(false)}});
  AU.tone(1200,.05,'sine',.12);AU.tone(400,.12,'triangle',.18,.07);AU.noise(.08,.12,.07,1200);this.done(this.strokes,false)}
 done(n,capped){const p=this.pl[this.pi],h=this.h,d=n-h.p;p.st[this.hi]=n;const ace=n===1&&!capped;
  if(ace){S.hio++;SV.put()}
  const msg=capped?'공을 주워요':ace?'🎉 홀인원!':NAMES(d);
  if(ace||d<0){this.conf.explode(ace?70:40,W/2,H*.5);AU.sfx(ace?'big':'level')}else if(!capped&&d===0)AU.sfx('coin');else AU.sfx('drop');
  this.time.delayedCall(250,()=>this.banner(msg,`${p.name} · ${n}타`,()=>{
   this.pi++;if(this.pi<this.pl.length){this.beginTurn();return}
   this.showCard(false)}))}
 showCard(fromPause){this.cardBack=fromPause?1:0;const last=this.hi>=HOLES.length-1&&!fromPause,pl=this.pl;
  const tot=p=>p.st.reduce((a,b)=>a+(b||0),0),par=HOLES.slice(0,this.hi+1).reduce((a,h)=>a+h.p,0);
  let html='<table><tr><th></th>'+HOLES.map((h,i)=>`<th${i===this.hi?' class="cur"':''}>${i+1}</th>`).join('')+'<th>합</th></tr>';
  html+='<tr><td class="n" style="color:#a08870">파</td>'+HOLES.map(h=>`<td style="color:#a08870">${h.p}</td>`).join('')+`<td style="color:#a08870">${HOLES.reduce((a,h)=>a+h.p,0)}</td></tr>`;
  pl.forEach(p=>{html+=`<tr><td class="n">${p.name}</td>`+HOLES.map((h,i)=>{const s=p.st[i];return `<td class="${s==null?'':s<h.p?'u':s>h.p?'o':''}${i===this.hi?' cur':''}">${s==null?'':s}</td>`}).join('')+`<td class="t">${tot(p)}</td></tr>`});html+='</table>';
  if(last){const sorted=[...pl].sort((a,b)=>tot(a)-tot(b));S.rounds++;
   if(this.solo){const t=tot(pl[0]),nb=!S.best||t<S.best;if(nb)S.best=t;SV.put();$('cT').textContent=nb?'🎉 새 최고 기록!':'⛳ 9홀 끝!';
    html=`<div class="rline">모두 <b>${t}</b>타 (파 ${par}보다 ${t-par>=0?'+'+(t-par):t-par})</div>`+html+`<div class="rline" style="font-size:17px">🏆 최고 ${S.best}타</div>`;if(nb)AU.sfx('win')}
   else{SV.put();const best=tot(sorted[0]),win=sorted.filter(p=>tot(p)===best);$('cT').textContent='🏆 '+win.map(p=>p.name).join(', ')+' 우승!';AU.sfx('win');this.conf.explode(80,W/2,H*.4);
    html=`<div class="rline" style="font-size:18px">${sorted.map((p,i)=>`${['🥇','🥈','🥉','4️⃣'][i]} ${p.name} ${tot(p)}타`).join(' · ')}</div>`+html}
   $('cGo').textContent='🔁 한 번 더'}
  else{$('cT').textContent=fromPause?'📋 점수표':`${this.hi+1}번 홀 끝!`;$('cGo').textContent=fromPause?'◀ 돌아가기':'▶ 다음 홀'}
  $('cB').innerHTML=html;this.sc('sc')}
}
new Phaser.Game({type:Phaser.AUTO,parent:'game',width:W*R,height:H*R,backgroundColor:'#3f9a4c',scale:{mode:Phaser.Scale.FIT,autoCenter:Phaser.Scale.CENTER_BOTH},render:{antialias:true},audio:{noAudio:true},
 scene:[{key:'boot',create(){KIT.fontReady().then(()=>this.scene.start('main'))}},Main]});
$('ui').style.width=W+'px';$('ui').style.height=H+'px';
})();
