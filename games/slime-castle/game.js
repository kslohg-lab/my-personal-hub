/* 슬라임 성 와르르 — 새총 물리 게임 (Phaser + Matter, 가로 화면)
   구슬 4종(기본·셋으로 갈라짐·폭탄·묵직), 나무·돌·얼음 블록, 슬라임 12단계. 저장: localStorage 'slimeCastleV1' */
(()=>{'use strict';
const {R,rnd,pick,clamp,$,AU,BGM}=KIT;
const W=800,H=400,WORLD=1700,GY=352,AX=170,AY=262,PULL=100,GRAV=1;
const MAT={wood:{hp:70,d:.0013,c:0xd9a066,c2:0xb07a44},stone:{hp:190,d:.003,c:0xb8b8c8,c2:0x8a8a9e},ice:{hp:32,d:.0009,c:0xbfe8ff,c2:0x8cc8ee}};
const SHOT={r:{n:'기본 구슬',c:0xff5a6a,r:17,d:.004},b:{n:'셋으로 갈라지는 구슬',c:0x5aa9ff,r:15,d:.0035},k:{n:'폭탄 구슬',c:0x3a3a4a,r:18,d:.0045},g:{n:'묵직한 금 구슬',c:0xffc83a,r:20,d:.011}};
/* ---- 단계 ---- 성을 쌓는 도구: frame(x, 층 수, 폭, 재료, 바닥 높이) = 기둥 두 개 + 지붕 + 안에 슬라임 */
function L(){const o=[];const api={
 rect:(x,y,w,h,m,a)=>o.push({t:'b',x,y,w,h,m,a:a||0}),slime:(x,y,k)=>o.push({t:'s',x,y,k:!!k}),hill:(x,w,h)=>o.push({t:'h',x,w,h}),
 frame(x,fl,w,m,y0,top){let y=y0||GY;for(let i=0;i<fl;i++){const mm=Array.isArray(m)?m[i%m.length]:m;api.rect(x-w/2+10,y-35,20,70,mm);api.rect(x+w/2-10,y-35,20,70,mm);api.rect(x,y-80,w+10,20,mm);api.slime(x,y-24);y-=90}if(top)api.slime(x,y-(top==='k'?36:24),top==='k');return y}};return [api,o]}
const LEVELS=[
 {s:'rrr',b(a){a.frame(1150,1,110,'wood')}},
 {s:'rrr',b(a){a.frame(1150,2,110,'wood',GY,'s')}},
 {s:'rbr',b(a){a.frame(1060,1,110,'wood');a.frame(1200,1,110,'wood');a.rect(1130,GY-99,260,18,'wood');a.slime(1130,GY-132)}},
 {s:'rrb',b(a){a.frame(1150,3,120,'ice',GY,'s')}},
 {s:'rkr',b(a){a.frame(1150,1,140,'stone');a.frame(1150,1,140,'wood',GY-90,'k')}},
 {s:'brkr',b(a){a.frame(1000,2,100,['wood','ice']);a.frame(1130,2,100,['ice','wood']);a.frame(1260,2,100,['wood','ice'],GY,'s')}},
 {s:'kgr',b(a){a.hill(1150,300,60);a.frame(1080,1,100,'stone',GY-60);a.frame(1220,1,100,'stone',GY-60);a.rect(1150,GY-160,260,20,'stone');a.slime(1150,GY-206,1)}},
 {s:'rbgr',b(a){a.frame(1090,3,110,['stone','wood','ice'],GY,'s');a.frame(1230,2,110,['stone','ice'],GY,'s')}},
 {s:'bbkr',b(a){a.frame(1000,3,100,'wood',GY,'s');a.frame(1300,3,100,'wood',GY,'s');a.rect(1150,GY-279,220,16,'ice');a.slime(1150,GY-310)}},
 {s:'gkbr',b(a){a.rect(960,GY-55,26,110,'stone');a.frame(1100,2,130,['stone','wood']);a.frame(1250,2,130,['stone','wood'],GY,'k');a.rect(1390,GY-55,26,110,'stone')}},
 {s:'bkb',b(a){a.frame(1060,2,90,'ice');a.frame(1170,3,90,'ice',GY,'k');a.frame(1280,2,90,'ice',GY,'s')}},
 {s:'gkbbr',b(a){a.hill(1180,420,50);a.frame(1040,2,110,['stone','stone'],GY-50);a.frame(1180,2,120,['stone','wood'],GY-50,'k');a.frame(1320,2,110,['stone','stone'],GY-50);a.slime(1450,GY-24)}}];
const SV=KIT.save('slimeCastleV1',()=>({stars:{},snd:1,last:1}));const S=SV.data;AU.on=BGM.on=!!S.snd;
const totalStars=()=>Object.values(S.stars).reduce((a,b)=>a+b,0);
const opened=n=>n===1||(S.stars[n-1]||0)>0;

class Main extends Phaser.Scene{constructor(){super('main')}
 create(){window.__sc=this;KIT.textures(this);this.M=Phaser.Physics.Matter.Matter;this.mkTex();
  this.wl=this.add.layer();this.hl=this.add.layer();const cam=this.cameras.main;cam.setZoom(R);cam.setBounds(0,0,WORLD,H);cam.centerOn(W/2,H/2);
  this.uic=this.cameras.add(0,0,W*R,H*R).setZoom(R);this.uic.centerOn(W/2,H/2);cam.ignore(this.hl);this.uic.ignore(this.wl);
  // 배경
  this.W(this.add.image(0,0,'sky').setOrigin(0).setDisplaySize(W,H).setScrollFactor(0).setDepth(-20));
  this.W(this.add.image(0,0,'far').setOrigin(0).setScrollFactor(.3).setDepth(-19));this.W(this.add.image(0,0,'near').setOrigin(0).setScrollFactor(.6).setDepth(-18));
  for(let i=0;i<7;i++){const c=this.W(this.add.ellipse(rnd(0,WORLD*.6),rnd(30,140),rnd(90,160),rnd(30,48),0xffffff,.85).setScrollFactor(.2).setDepth(-19.5))}
  const gg=this.W(this.add.graphics().setDepth(1));gg.fillStyle(0x7ccf6a);gg.fillRect(0,GY,WORLD,H-GY+40);gg.fillStyle(0x5fae4f);gg.fillRect(0,GY,WORLD,6);gg.fillStyle(0xa8e08a);for(let x=0;x<WORLD;x+=26)gg.fillCircle(x+rnd(0,10),GY+rnd(14,40),rnd(2,4));
  this.matter.add.rectangle(WORLD/2,GY+40,WORLD*2,80,{isStatic:true,friction:1,label:'ground'});
  this.matter.add.rectangle(-30,H/2,60,H*3,{isStatic:true});this.matter.add.rectangle(WORLD+30,H/2,60,H*3,{isStatic:true});
  // 새총
  const sg=this.W(this.add.graphics().setDepth(5));sg.fillStyle(0x8a5a32);sg.fillRect(AX-6,AY+10,12,GY-AY-10);sg.lineStyle(10,0x8a5a32);sg.beginPath();sg.moveTo(AX,AY+18);sg.lineTo(AX-18,AY-6);sg.moveTo(AX,AY+18);sg.lineTo(AX+16,AY-8);sg.strokePath();
  this.band=this.W(this.add.graphics().setDepth(6));this.bandF=this.W(this.add.graphics().setDepth(12));this.dots=this.W(this.add.graphics().setDepth(11));
  this.emP=this.W(this.add.particles(0,0,'dot',{emitting:false,lifespan:600,speed:{min:60,max:260},scale:{start:.9,end:0},alpha:{start:1,end:0},gravityY:400}).setDepth(30));
  this.emB=this.W(this.add.particles(0,0,'chip',{emitting:false,lifespan:900,speed:{min:80,max:280},scale:{start:1,end:.3},rotate:{min:0,max:360},gravityY:600}).setDepth(29));
  this.emS=this.W(this.add.particles(0,0,'spark',{emitting:false,lifespan:500,speed:{min:80,max:240},scale:{start:1,end:0},rotate:{min:0,max:360},tint:[0xffffff,0xffe066]}).setDepth(31));
  // HUD
  this.lvTx=this.H_(KIT.text(this,70,26,'',20,'#fff','#2f6a3e'));this.shotG=this.H_(this.add.container(0,0));this.slTx=this.H_(KIT.text(this,W/2,26,'',20,'#fff','#2f6a3e'));
  this.tipTx=this.H_(KIT.text(this,W/2,H-24,'',17,'#fff','#2f6a3e'));
  this.bodies=[];this.mode='home';
  this.matter.world.on('collisionstart',ev=>this.hits(ev.pairs));
  this.input.on('pointerdown',p=>this.pdown(p));this.input.on('pointermove',p=>this.pmove(p));this.input.on('pointerup',p=>this.pup(p));
  this.bindUI();$('load').style.display='none';KIT.fitUI(W);const fit=()=>{KIT.fitUI(W);$('rot').style.display=innerHeight>innerWidth*1.05?'flex':'none'};addEventListener('resize',()=>setTimeout(fit,60));this.scale.on('resize',()=>setTimeout(fit,30));fit();
  this.home()}
 W(o){this.wl.add(o);return o}
 ft(x,y,s,size){const t=this.W(KIT.text(this,x,y,s,size||22,'#ffffff','#2f6a3e').setDepth(40));this.tweens.add({targets:t,y:y-50,alpha:0,duration:900,ease:'Cubic.easeOut',onComplete:()=>t.destroy()})}H_(o){this.hl.add(o);return o}
 mkTex(){let c=this.textures.createCanvas('sky',4,256),x=c.getContext(),g=x.createLinearGradient(0,0,0,256);g.addColorStop(0,'#7cc8ff');g.addColorStop(1,'#e9f8ff');x.fillStyle=g;x.fillRect(0,0,4,256);c.refresh();
  const hill=(k,wid,col,amp,base,ph)=>{const c=this.textures.createCanvas(k,wid,H),x=c.getContext();x.fillStyle=col;x.beginPath();x.moveTo(0,H);for(let X=0;X<=wid;X+=6)x.lineTo(X,base-Math.sin(X/wid*Math.PI*6+ph)*amp-Math.sin(X/wid*Math.PI*15)*amp*.3);x.lineTo(wid,H);x.fill();c.refresh()};
  hill('far',WORLD,'#b9e3c8',40,250,0);hill('near',WORLD,'#9fd88e',28,300,1.7);
  c=this.textures.createCanvas('chip',10,10);x=c.getContext();x.fillStyle='#fff';x.fillRect(1,1,8,8);c.refresh();
  // 슬라임
  [['sl',0x6fd67a,22],['slk',0xff8ac0,34]].forEach(([k,col,r])=>{const s=r*2+12,c=this.textures.createCanvas(k,s,s),x=c.getContext(),cx=s/2,hex='#'+col.toString(16).padStart(6,'0');
   const g=x.createRadialGradient(cx-r*.3,cx-r*.4,r*.1,cx,cx,r);g.addColorStop(0,'#ffffff');g.addColorStop(.35,hex);g.addColorStop(1,hex);
   x.fillStyle='rgba(0,0,0,.15)';x.beginPath();x.ellipse(cx,cx+r*.85,r*.9,r*.22,0,0,7);x.fill();
   x.fillStyle=g;x.beginPath();x.moveTo(cx-r,cx+r*.7);x.quadraticCurveTo(cx-r*1.05,cx-r*.9,cx,cx-r);x.quadraticCurveTo(cx+r*1.05,cx-r*.9,cx+r,cx+r*.7);x.quadraticCurveTo(cx,cx+r*1.05,cx-r,cx+r*.7);x.fill();
   x.fillStyle='#2b2b3a';x.beginPath();x.ellipse(cx-r*.33,cx-r*.05,r*.12,r*.17,0,0,7);x.ellipse(cx+r*.33,cx-r*.05,r*.12,r*.17,0,0,7);x.fill();
   x.fillStyle='#fff';x.beginPath();x.arc(cx-r*.29,cx-r*.12,r*.05,0,7);x.arc(cx+r*.37,cx-r*.12,r*.05,0,7);x.fill();
   x.strokeStyle='#2b2b3a';x.lineWidth=2;x.beginPath();x.arc(cx,cx+r*.2,r*.15,.2,Math.PI-.2);x.stroke();
   x.fillStyle='rgba(255,255,255,.55)';x.beginPath();x.ellipse(cx-r*.45,cx-r*.55,r*.18,r*.1,-.6,0,7);x.fill();
   if(k==='slk'){x.fillStyle='#ffd25a';x.beginPath();x.moveTo(cx-r*.45,cx-r*.78);x.lineTo(cx-r*.5,cx-r*1.25);x.lineTo(cx-r*.22,cx-r*1);x.lineTo(cx,cx-r*1.35);x.lineTo(cx+r*.22,cx-r*1);x.lineTo(cx+r*.5,cx-r*1.25);x.lineTo(cx+r*.45,cx-r*.78);x.closePath();x.fill();x.strokeStyle='#d0a02a';x.stroke()}
   c.refresh()});
  // 구슬
  Object.entries(SHOT).forEach(([k,o])=>{const r=o.r,s=r*2+6,c=this.textures.createCanvas('ball_'+k,s,s),x=c.getContext(),cx=s/2,hex='#'+o.c.toString(16).padStart(6,'0');const g=x.createRadialGradient(cx-r*.4,cx-r*.4,r*.1,cx,cx,r);g.addColorStop(0,'#ffffff');g.addColorStop(.3,hex);g.addColorStop(1,hex);x.fillStyle=g;x.beginPath();x.arc(cx,cx,r,0,7);x.fill();x.lineWidth=2;x.strokeStyle='rgba(0,0,0,.25)';x.stroke();
   if(k==='k'){x.strokeStyle='#c8a060';x.lineWidth=3;x.beginPath();x.moveTo(cx+r*.4,cx-r*.7);x.quadraticCurveTo(cx+r*.9,cx-r*1.2,cx+r*.6,cx-r*1.4);x.stroke();x.fillStyle='#ffd25a';x.beginPath();x.arc(cx+r*.6,cx-r*1.4,3,0,7);x.fill()}
   if(k==='g'){x.fillStyle='rgba(255,255,255,.6)';x.font='bold '+r+'px sans-serif';x.textAlign='center';x.textBaseline='middle';x.fillText('★',cx,cx+1)}
   c.refresh()})}
 /* ---- 화면 ---- */
 bindUI(){const sc=id=>{document.querySelectorAll('.scr').forEach(e=>e.classList.toggle('on',e.id===id));$('hudb').style.display=id===null?'flex':'none'};this.sc=sc;
  $('bGo').onclick=()=>{AU.init();AU.sfx('click');let n=1;while(n<12&&(S.stars[n]||0)>0)n++;this.start(n)};
  $('bLv').onclick=()=>{AU.init();AU.sfx('click');this.levels()};$('lx').onclick=()=>{AU.sfx('click');this.home()};
  $('sbtn').onclick=()=>{S.snd=S.snd?0:1;AU.on=BGM.on=!!S.snd;SV.put();$('sbtn').textContent=S.snd?'🔊':'🔇';AU.init();AU.sfx('click')};$('sbtn').textContent=S.snd?'🔊':'🔇';
  $('bP').onclick=()=>{AU.sfx('click');this.matter.world.pause();this.paused=1;sc('pause')};$('pGo').onclick=()=>{this.matter.world.resume();this.paused=0;sc(null)};
  $('pRe').onclick=()=>{this.matter.world.resume();this.paused=0;this.start(this.lv)};$('pHome').onclick=()=>{this.matter.world.resume();this.paused=0;this.home()};
  $('bRe').onclick=()=>{AU.sfx('click');this.start(this.lv)};
  $('rRe').onclick=()=>{AU.sfx('click');this.start(this.lv)};$('rNext').onclick=()=>{AU.sfx('click');this.start(Math.min(12,this.lv+1))};$('rHome').onclick=()=>{AU.sfx('click');this.levels()}}
 home(){this.clear();this.mode='home';$('hs').textContent='⭐ '+totalStars()+'/36';this.sc('home');BGM.play('bright');this.lvTx.setText('');this.slTx.setText('');this.tipTx.setText('');this.shotG.removeAll(true);
  this.build(LEVELS[0]);this.cameras.main.pan(1100,H/2,1600,'Sine.easeInOut')}
 levels(){this.clear();this.mode='home';const g=$('lg');g.innerHTML='';for(let i=1;i<=12;i++){const b=document.createElement('button'),ok=opened(i);b.className=ok?'':'lk';b.innerHTML=`${ok?i:'🔒'}<small>${'⭐'.repeat(S.stars[i]||0)+'☆'.repeat(3-(S.stars[i]||0))}</small>`;b.onclick=()=>{AU.init();if(!ok){KIT.toast('앞 단계를 먼저 깨요!');return}AU.sfx('click');this.start(i)};g.appendChild(b)}this.sc('lv')}
 clear(){this.bodies.forEach(o=>{try{this.matter.world.remove(o.b)}catch(e){}o.v.destroy()});this.bodies=[];if(this.ball){this.ball=null}this.band.clear();this.bandF.clear();this.dots.clear();this.tweens.killAll();this.time.removeAllEvents()}
 /* ---- 단계 만들기 ---- */
 build(lv){const [a,o]=L();lv.b(a);
  for(const e of o){if(e.t==='h'){const b=this.matter.add.rectangle(e.x,GY-e.h/2,e.w,e.h,{isStatic:true,friction:1,label:'hill'});const g=this.W(this.add.graphics().setDepth(2));g.fillStyle(0x8fd17a);g.fillRoundedRect(e.x-e.w/2,GY-e.h,e.w,e.h+4,{tl:20,tr:20,bl:0,br:0});g.fillStyle(0x6fbe5a);g.fillRect(e.x-e.w/2,GY-e.h,e.w,5);this.bodies.push({b,v:g,k:'hill',dead:0})}}
  for(const e of o){if(e.t==='b')this.addBlock(e);if(e.t==='s')this.addSlime(e.x,e.y,e.k)}}
 addBlock(e){const m=MAT[e.m],b=this.matter.add.rectangle(e.x,e.y,e.w,e.h,{density:m.d,friction:.8,frictionStatic:1.2,restitution:.05,label:'block'});if(e.a)this.M.Body.setAngle(b,e.a);
  const v=this.W(this.add.graphics().setDepth(10));const o={b,v,k:'block',m:e.m,w:e.w,h:e.h,hp:m.hp,max:m.hp};b.obj=o;this.drawBlock(o);this.bodies.push(o);return o}
 drawBlock(o){const g=o.v,m=MAT[o.m],w=o.w,h=o.h;g.clear();g.fillStyle(m.c,o.m==='ice'?.85:1);g.fillRoundedRect(-w/2,-h/2,w,h,4);g.lineStyle(2,m.c2,1);g.strokeRoundedRect(-w/2,-h/2,w,h,4);
  if(o.m==='wood'){g.lineStyle(1.5,m.c2,.6);const L=Math.max(w,h);for(let i=1;i<3;i++){if(w>h)g.lineBetween(-w/2+4,-h/2+i*h/3,w/2-4,-h/2+i*h/3);else g.lineBetween(-w/2+i*w/3,-h/2+4,-w/2+i*w/3,h/2-4)}}
  if(o.m==='stone'){g.fillStyle(m.c2,.5);for(let i=0;i<4;i++)g.fillCircle(-w/2+(i*37%Math.max(6,w-6))+3,-h/2+(i*23%Math.max(6,h-6))+3,2.5)}
  if(o.m==='ice'){g.fillStyle(0xffffff,.5);g.fillRect(-w/2+3,-h/2+3,Math.max(3,w*.25),Math.max(3,h*.25))}
  const r=o.hp/o.max;if(r<.66){g.lineStyle(2,0x3a2a2a,.55);g.beginPath();g.moveTo(-w*.2,-h/2);g.lineTo(0,0);g.lineTo(-w*.1,h/2);g.strokePath()}
  if(r<.33){g.beginPath();g.moveTo(w*.3,-h/2);g.lineTo(w*.05,h*.1);g.lineTo(w*.25,h/2);g.strokePath()}}
 addSlime(x,y,k){const r=k?34:22,b=this.matter.add.circle(x,y,r,{density:.0012,friction:.6,restitution:.15,label:'slime'});const v=this.W(this.add.image(x,y,k?'slk':'sl').setDepth(9));const o={b,v,k:'slime',king:k,hp:k?40:12,max:k?40:12,r,base:1};b.obj=o;this.bodies.push(o);
  this.tweens.add({targets:v,scaleY:.92,scaleX:1.06,duration:600+Math.random()*300,yoyo:true,repeat:-1,ease:'Sine.easeInOut'});return o}
 start(n){this.clear();this.lv=n;this.mode='play';S.last=n;SV.put();const lv=LEVELS[n-1];this.shots=lv.s.split('');this.build(lv);this.grace=1.2;this.sc(null);BGM.play('bright');
  this.lvTx.setText(n+'단계');this.updHUD();this.state='intro';const cam=this.cameras.main;cam.panEffect.reset();cam.stopFollow();cam.centerOn(1150,H/2);
  this.time.delayedCall(1300,()=>{if(this.mode!=='play')return;cam.pan(W/2,H/2,900,'Sine.easeInOut');this.time.delayedCall(950,()=>{if(this.mode==='play')this.loadBall()})});
  this.tipTx.setText(n===1?'새총의 구슬을 뒤로 끌었다가 놓아요!':n===3?'파란 구슬은 날아가는 중에 화면을 톡! 셋으로 갈라져요':n===5?'검은 구슬은 화면을 톡 하면 펑!':n===7?'금 구슬은 무거워서 돌도 부숴요':'')}
 updHUD(){const g=this.shotG;g.removeAll(true);this.shots.forEach((k,i)=>{const im=this.add.image(130+i*30,26,'ball_'+k).setScale(.75);g.add(im)});const n=this.bodies.filter(o=>o.k==='slime'&&!o.dead).length;this.slTx.setText('🟢 남은 슬라임 '+n)}
 loadBall(){if(!this.shots.length){this.state='wait';return}const k=this.shots.shift();this.updHUD();const o=SHOT[k];const b=this.matter.add.circle(AX,AY,o.r,{isStatic:true,density:o.d,friction:.5,restitution:.25,frictionAir:0,label:'ball'});
  const v=this.W(this.add.image(AX,AY,'ball_'+k).setDepth(13));const ball={b,v,k:'ball',kind:k,r:o.r,used:0,t:0,still:0};b.obj=ball;this.bodies.push(ball);this.ball=ball;this.state='ready';v.setScale(.2);this.tweens.add({targets:v,scale:1,duration:250,ease:'Back.easeOut'});this.drawBand(AX,AY)}
 /* ---- 조작 ---- */
 wp(p){return this.cameras.main.getWorldPoint(p.x,p.y)}
 pdown(p){AU.init();if(this.mode!=='play'||this.paused)return;const w=this.wp(p);
  if(this.state==='ready'&&Math.hypot(w.x-AX,w.y-AY)<110){this.state='aim';this.tipTx.setText('');return}
  if(this.state==='fly'&&this.ball&&!this.ball.used)this.special(this.ball)}
 pmove(p){if(this.state!=='aim')return;const w=this.wp(p);let dx=w.x-AX,dy=w.y-AY;const d=Math.hypot(dx,dy);if(d>PULL){dx*=PULL/d;dy*=PULL/d}
  const x=AX+dx,y=Math.min(GY-this.ball.r,AY+dy);this.M.Body.setPosition(this.ball.b,{x,y});this.ball.v.setPosition(x,y);this.drawBand(x,y);this.preview(-dx,-(y-AY))}
 pup(p){if(this.state!=='aim')return;const b=this.ball,dx=AX-b.b.position.x,dy=AY-b.b.position.y;this.dots.clear();
  if(Math.hypot(dx,dy)<18){this.M.Body.setPosition(b.b,{x:AX,y:AY});b.v.setPosition(AX,AY);this.drawBand(AX,AY);this.state='ready';return}
  this.M.Body.setStatic(b.b,false);this.M.Body.setDensity(b.b,SHOT[b.kind].d);this.M.Body.setInertia(b.b,b.b.mass*b.r*b.r*.5);this.M.Body.setVelocity(b.b,{x:dx*.23,y:dy*.23});this.state='fly';b.t=0;AU.sfx('jump');this.band.clear();this.bandF.clear();
  this.cameras.main.startFollow(b.v,false,.08,.08,-120,0)}
 drawBand(x,y){const g=this.band,f=this.bandF;g.clear();f.clear();g.lineStyle(5,0x6a3a2a);g.lineBetween(AX+16,AY-8,x,y);f.lineStyle(5,0x8a4a32);f.lineBetween(AX-18,AY-6,x,y)}
 preview(vx,vy){const g=this.dots;g.clear();let x=AX-vx,y=AY-vy;vx*=.23;vy*=.23;const gs=GRAV*.001*16.67*16.67;g.fillStyle(0xffffff,.85);
  x=this.ball.b.position.x;y=this.ball.b.position.y;for(let i=0;i<60;i++){vy+=gs;x+=vx;y+=vy;if(i%4===3)g.fillCircle(x,y,Math.max(1.5,4-i*.05));if(y>GY)break}}
 special(o){o.used=1;const p=o.b.position,v=o.b.velocity;
  if(o.kind==='b'){AU.sfx('pop',4);this.emS.explode(10,p.x,p.y);[-.18,.18].forEach(da=>{const s=SHOT.b,b=this.matter.add.circle(p.x,p.y+da*40,s.r-2,{density:s.d,restitution:.25,frictionAir:0,label:'ball'});const sp=Math.hypot(v.x,v.y),a=Math.atan2(v.y,v.x)+da;this.M.Body.setVelocity(b,{x:Math.cos(a)*sp,y:Math.sin(a)*sp});const vv=this.W(this.add.image(p.x,p.y,'ball_b').setDepth(13).setScale(.88));const ob={b,v:vv,k:'ball',kind:'b',r:s.r,used:1,t:o.t,still:0,child:1};b.obj=ob;this.bodies.push(ob)})}
  else if(o.kind==='k'){this.explode(p.x,p.y,120);try{this.matter.world.remove(o.b)}catch(e){}o.v.destroy();o.dead=1}
  else if(o.kind==='r'||o.kind==='g'){this.M.Body.setVelocity(o.b,{x:v.x*1.15,y:v.y});this.emS.explode(5,p.x,p.y)}}
 explode(x,y,rad){AU.sfx('boom');this.cameras.main.shake(350,.015);this.emP.setParticleTint([0xffd25a,0xff8a3a,0xffffff,0x555566]);this.emP.explode(40,x,y);
  const ring=this.W(this.add.circle(x,y,rad,0xffb347,.35).setDepth(28));this.tweens.add({targets:ring,scale:1.3,alpha:0,duration:350,onComplete:()=>ring.destroy()});
  for(const o of this.bodies){if(o.dead||o.k==='hill'||o.k==='ball')continue;const p=o.b.position,d=Math.hypot(p.x-x,p.y-y);if(d<rad+30){const f=(1-d/(rad+30));this.M.Body.applyForce(o.b,p,{x:(p.x-x)/d*.06*o.b.mass*f,y:((p.y-y)/d-.6)*.06*o.b.mass*f});this.damage(o,f*(o.k==='slime'?60:150))}}}
 /* ---- 부딪힘 ---- */
 hits(pairs){if(this.mode!=='play'||this.grace>0)return;for(const pr of pairs){const A=pr.bodyA.parent||pr.bodyA,B=pr.bodyB.parent||pr.bodyB,a=A.obj,b=B.obj;
   const rv=Math.hypot(A.velocity.x-B.velocity.x,A.velocity.y-B.velocity.y);if(rv<1.6)continue;
   const ma=A.isStatic?1e3:A.mass,mb=B.isStatic?1e3:B.mass,k=1.15*rv*rv;
   if(a&&a.k!=='ball'&&a.k!=='hill')this.damage(a,k*mb/(ma+mb)*(b&&b.k==='ball'?1.6:1));if(b&&b.k!=='ball'&&b.k!=='hill')this.damage(b,k*ma/(ma+mb)*(a&&a.k==='ball'?1.6:1));
   if((a&&a.k==='ball')||(b&&b.k==='ball')){if(rv>5)AU.sfx('thud')}}}
 damage(o,v){if(o.dead||v<1)return;o.hp-=v;
  if(o.k==='slime'){if(o.hp<=0)this.pop(o);else{this.tweens.add({targets:o.v,scaleX:1.25,scaleY:.75,duration:80,yoyo:true});o.v.setTintFill(0xffffff);this.time.delayedCall(70,()=>o.v.active&&o.v.clearTint())}return}
  if(o.hp<=0)this.breakBlock(o);else this.drawBlock(o)}
 pop(o){o.dead=1;const p=o.b.position;try{this.matter.world.remove(o.b)}catch(e){}AU.sfx('pop',o.king?2:6);this.emP.setParticleTint(o.king?[0xff8ac0,0xffffff,0xffd25a]:[0x6fd67a,0xb8f0a8,0xffffff]);this.emP.explode(o.king?36:20,p.x,p.y);
  this.tweens.killTweensOf(o.v);this.tweens.add({targets:o.v,scale:1.5,alpha:0,duration:180,onComplete:()=>o.v.destroy()});this.ft(p.x,p.y-30,o.king?'왕 슬라임 펑!':'펑!',o.king?26:22);
  this.cameras.main.shake(120,.005);this.updHUD();this.check()}
 breakBlock(o){o.dead=1;const p=o.b.position;try{this.matter.world.remove(o.b)}catch(e){}AU.sfx(o.m==='ice'?'zap':'hit');this.emB.setParticleTint([MAT[o.m].c,MAT[o.m].c2]);this.emB.explode(o.m==='stone'?10:8,p.x,p.y);this.tweens.add({targets:o.v,alpha:0,scale:.6,duration:160,onComplete:()=>o.v.destroy()})}
 check(){if(this.mode!=='play')return;if(this.bodies.some(o=>o.k==='slime'&&!o.dead))return;this.mode='clearing';this.time.delayedCall(1200,()=>this.finish(true))}
 update(t,dl){const dt=Math.min(dl/1000,1/25);if(this.grace>0)this.grace-=dt;
  for(const o of this.bodies){if(o.dead||o.k==='hill')continue;const p=o.b.position;o.v.setPosition(p.x,p.y);if(o.k!=='slime')o.v.setRotation(o.b.angle);
   if(o.k!=='ball'&&!o.dead&&p.y>H+80){if(o.k==='slime')this.pop(o);else{o.dead=1;this.matter.world.remove(o.b);o.v.destroy()}}}
  if(this.mode!=='play'||this.paused)return;
  if(this.state==='fly'){const balls=this.bodies.filter(o=>o.k==='ball'&&!o.dead&&!o.b.isStatic);let alive=false;
   for(const b of balls){b.t+=dt;const sp=b.b.speed;if(sp<.35)b.still+=dt;else b.still=0;if(b.b.position.x>WORLD+50||b.b.position.y>H+60||b.still>1.3||b.t>9){b.done=1}else alive=true}
   if(!alive){this.state='settle';this.st=0;balls.forEach(b=>{if(!b.dead){b.dead=1;try{this.matter.world.remove(b.b)}catch(e){}this.tweens.add({targets:b.v,alpha:0,duration:300,onComplete:()=>b.v.destroy()})}})}}
  if(this.state==='settle'){this.st+=dt;const moving=this.bodies.some(o=>!o.dead&&o.k!=='hill'&&o.b.speed>.3);if((!moving&&this.st>.6)||this.st>3.5){this.state='';const cam=this.cameras.main;cam.stopFollow();cam.pan(W/2,H/2,700,'Sine.easeInOut');
    this.time.delayedCall(750,()=>{if(this.mode!=='play')return;if(this.shots.length)this.loadBall();else this.finish(false)})}}}
 finish(win){if(this.mode==='res')return;this.mode='res';const left=this.shots.length;let st=0;
  if(win){st=left>=2?3:left===1?2:1;S.stars[this.lv]=Math.max(S.stars[this.lv]||0,st);SV.put();AU.sfx('win')}else AU.sfx('lose');
  $('rT').textContent=win?(this.lv===12?'👑 모든 성을 무너뜨렸어요!':'🎉 '+this.lv+'단계 클리어!'):'😵 슬라임이 남았어요';
  $('rS').innerHTML=win?[0,1,2].map(i=>`<span${i<st?' class="on" style="animation-delay:'+(.2+i*.25)+'s"':''}>⭐</span>`).join(''):'';$('rS').style.display=win?'block':'none';
  $('rB').innerHTML=win?`<div class="rline">남은 구슬 <b>${left}</b>개${left>=2?' · 완벽해요!':''}</div>`:`<div class="rline" style="font-size:18px">💡 ${pick(['기둥 아래쪽을 맞히면 성이 와르르!','구슬을 끝까지 당기면 더 멀리 날아가요','파란 구슬은 날아가는 중에 톡!','폭탄은 성 한가운데에서 톡!'])}</div>`;
  $('rNext').style.display=win&&this.lv<12?'':'none';this.sc('res')}
}
new Phaser.Game({type:Phaser.AUTO,parent:'game',width:W*R,height:H*R,backgroundColor:'#7cc8ff',scale:{mode:Phaser.Scale.FIT,autoCenter:Phaser.Scale.CENTER_BOTH},render:{antialias:true},audio:{noAudio:true},
 physics:{default:'matter',matter:{gravity:{y:GRAV},enableSleeping:true,positionIterations:8,velocityIterations:6}},scene:[{key:'boot',create(){KIT.fontReady().then(()=>this.scene.start('main'))}},Main]});
$('ui').style.width=W+'px';$('ui').style.height=H+'px';
})();
