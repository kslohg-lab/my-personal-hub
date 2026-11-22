/* 꼬마 기차 — 손님을 태울수록 길어지는 기차 (스네이크 방식, Phaser)
   조작: 밀어서 방향 바꾸기 (키보드 화살표도) · 저장: localStorage 'trainSnakeV1' {best, snd, games} */
(()=>{'use strict';
const {R,rnd,pick,clamp,$,AU,BGM}=KIT;
const SZ=KIT.size(420,680,940),W=SZ.W,H=SZ.H;
const CS=26,COLS=15,OX=(W-COLS*CS)/2,OY=62,ROWS=Math.floor((H-OY-16)/CS);
const DIRS={R:[1,0],L:[-1,0],U:[0,-1],D:[0,1]},OPP={R:'L',L:'R',U:'D',D:'U'};
const WCOL=['#ff7eb3','#ffad4d','#ffd93b','#6fd67a','#45cfc0','#5aa9ff','#a685ff'];
const SV=KIT.save('trainSnakeV1',()=>({best:0,snd:1,games:0}));const S=SV.data;

class Main extends Phaser.Scene{constructor(){super('main')}
 create(){window.__ts=this;KIT.ready(this,W,H);KIT.textures(this);this.mk();
  this.add.image(W/2,H/2,'field').setScale(1/R);
  this.stn=this.add.image(0,0,'stn').setScale(1/R).setDepth(2);this.pp=this.add.image(0,0,'pp').setScale(1/R).setDepth(3);
  this.star=this.add.image(0,0,'star').setScale(1/R).setDepth(3).setVisible(false);
  this.rocks=[];this.cars=[];
  this.smoke=this.add.particles(0,0,'dot',{lifespan:900,speedY:{min:-30,max:-10},speedX:{min:-10,max:10},scale:{start:.35,end:.9},alpha:{start:.55,end:0},tint:0xffffff,emitting:false}).setDepth(20);
  this.pop=this.add.particles(0,0,'spark',{lifespan:700,speed:{min:60,max:200},scale:{start:.6,end:0},tint:[0xffd93b,0xff7eb3,0x6fd67a,0x5aa9ff],emitting:false}).setDepth(25);
  this.ui=KIT.shell({S,SV,start:()=>this.start(),home:()=>this.home(),pause:on=>this.paused=on});
  this.input.on('pointerdown',p=>{this.sw={x:p.x,y:p.y}});
  this.input.on('pointermove',p=>{if(!this.sw||!p.isDown)return;const dx=p.x-this.sw.x,dy=p.y-this.sw.y;if(Math.hypot(dx,dy)<18*R)return;this.turn(Math.abs(dx)>Math.abs(dy)?(dx>0?'R':'L'):(dy>0?'D':'U'));this.sw={x:p.x,y:p.y}});
  this.input.on('pointerup',()=>this.sw=null);
  this.input.keyboard.on('keydown',e=>{const k={ArrowRight:'R',ArrowLeft:'L',ArrowUp:'U',ArrowDown:'D'}[e.key];if(k)this.turn(k)});
  this.home()}
 mk(){const t=(k,w,h,f)=>KIT.tex(this,k,w,h,f),rr=KIT.rr;
  t('field',W,H,x=>{x.fillStyle='#5fb85a';x.fillRect(0,0,W,H);for(let r=0;r<ROWS;r++)for(let c=0;c<COLS;c++){x.fillStyle=(r+c)%2?'#8fdc78':'#9be585';x.fillRect(OX+c*CS,OY+r*CS,CS,CS)}
   x.strokeStyle='#c98a5a';x.lineWidth=6;x.strokeRect(OX-3,OY-3,COLS*CS+6,ROWS*CS+6);x.strokeStyle='#e8b88a';x.lineWidth=2;x.strokeRect(OX-3,OY-3,COLS*CS+6,ROWS*CS+6);
   for(let i=0;i<40;i++){x.fillStyle=pick(['#fff','#ffd0e0','#fff3a0']);const a=OX+Math.random()*COLS*CS,b=OY+Math.random()*ROWS*CS;x.beginPath();x.arc(a,b,1.6,0,7);x.fill()}});
  t('loco',30,26,x=>{x.fillStyle='rgba(0,0,0,.18)';rr(x,2,4,27,21,7);x.fill();x.fillStyle='#ff5a6a';rr(x,1,2,26,21,7);x.fill();x.fillStyle='#3a3a5a';rr(x,20,4,8,17,4);x.fill();
   x.fillStyle='#ffd93b';x.beginPath();x.arc(27,12.5,2.5,0,7);x.fill();x.fillStyle='#5a3a4a';x.beginPath();x.arc(14,12.5,4,0,7);x.fill();x.fillStyle='#8a6a7a';x.beginPath();x.arc(14,12.5,2.2,0,7);x.fill();
   x.fillStyle='#bfe9ff';rr(x,3,5,6,15,2);x.fill();x.fillStyle='#fff';x.globalAlpha=.6;rr(x,4,4,18,3,1.5);x.fill()});
  WCOL.forEach((c,i)=>t('car'+i,24,22,x=>{x.fillStyle='rgba(0,0,0,.18)';rr(x,2,3,22,19,5);x.fill();x.fillStyle=c;rr(x,1,1,22,19,5);x.fill();x.fillStyle='#bfe9ff';rr(x,4,4,6,5,1.5);x.fill();rr(x,14,4,6,5,1.5);x.fill();rr(x,4,12,6,5,1.5);x.fill();rr(x,14,12,6,5,1.5);x.fill();
   x.fillStyle='#ffd8b0';x.beginPath();x.arc(7,6.5,1.8,0,7);x.fill();x.beginPath();x.arc(17,14.5,1.8,0,7);x.fill();x.fillStyle='rgba(255,255,255,.5)';rr(x,3,1.5,18,2.5,1);x.fill()}));
  t('stn',26,26,x=>{x.fillStyle='rgba(0,0,0,.12)';rr(x,2,4,24,20,5);x.fill();x.fillStyle='#e9d2b0';rr(x,1,2,24,20,5);x.fill();x.strokeStyle='#c9a87a';x.lineWidth=1.5;rr(x,1,2,24,20,5);x.stroke()});
  t('pp',20,24,x=>{x.fillStyle='rgba(0,0,0,.2)';x.beginPath();x.ellipse(10,21,7,2.5,0,0,7);x.fill();x.fillStyle='#5aa9ff';rr(x,4,10,12,11,5);x.fill();x.fillStyle='#ffd8b0';x.beginPath();x.arc(10,7,5,0,7);x.fill();x.fillStyle='#6a4a3a';x.beginPath();x.arc(10,5.5,5,Math.PI,0);x.fill();
   x.fillStyle='#333';x.fillRect(7.5,7,1.5,1.5);x.fillRect(11,7,1.5,1.5);x.fillStyle='#ffd93b';x.beginPath();x.arc(16,4,3,0,7);x.fill()});
  t('rock',26,26,x=>{x.fillStyle='rgba(0,0,0,.2)';x.beginPath();x.ellipse(13,20,11,5,0,0,7);x.fill();x.fillStyle='#9aa0b4';x.beginPath();x.moveTo(3,19);x.lineTo(6,8);x.lineTo(13,3);x.lineTo(21,7);x.lineTo(24,19);x.closePath();x.fill();x.fillStyle='#c0c6d6';x.beginPath();x.moveTo(7,9);x.lineTo(13,4.5);x.lineTo(16,9);x.lineTo(10,12);x.closePath();x.fill()});
  t('star',24,24,x=>{x.fillStyle='#ffd23a';x.strokeStyle='#e0a020';x.lineWidth=1.5;x.beginPath();for(let i=0;i<10;i++){const a=-Math.PI/2+i*Math.PI/5,r=i%2?5:11;x.lineTo(12+Math.cos(a)*r,12+Math.sin(a)*r)}x.closePath();x.fill();x.stroke()})}
 cx(c){return OX+c*CS+CS/2}
 cy(r){return OY+r*CS+CS/2}
 home(){this.mode='home';this.clear();this.ui.best(`🏆 최고 손님 ${S.best}명`);this.ui.sc('home');BGM.play('calm');this.pp.setVisible(false);this.stn.setVisible(false);this.star.setVisible(false)}
 clear(){this.cars.forEach(c=>c.destroy());this.cars=[];this.rocks.forEach(r=>r.img.destroy());this.rocks=[]}
 start(){this.clear();const r=Math.floor(ROWS/2);this.body=[{x:4,y:r},{x:3,y:r},{x:2,y:r}];this.prev=this.body.map(b=>({...b}));this.dir='R';this.q=[];this.grow=0;this.acc=0;this.score=0;this.mode='play';this.paused=false;this.starT=0;
  this.cars=this.body.map((b,i)=>this.add.image(0,0,i?'car'+((i-1)%WCOL.length):'loco').setScale(1/R).setDepth(10-i*.001));
  this.placePP();this.ui.sc(null);this.ui.hud('🧍 0','🏆 '+S.best);$('hint').style.opacity=1;BGM.play('play')}
 free(far){for(let k=0;k<400;k++){const x=Math.floor(Math.random()*COLS),y=Math.floor(Math.random()*ROWS);if(this.body.some(b=>b.x===x&&b.y===y)||this.rocks.some(r=>r.x===x&&r.y===y))continue;if(this.ppC&&this.ppC.x===x&&this.ppC.y===y)continue;
  if(far&&Math.abs(x-this.body[0].x)+Math.abs(y-this.body[0].y)<far)continue;return {x,y}}return null}
 placePP(){const c=this.free(3);this.ppC=c;this.pp.setPosition(this.cx(c.x),this.cy(c.y)-3).setVisible(true).setScale(.2/R);this.tweens.add({targets:this.pp,scale:1/R,duration:250,ease:'Back.easeOut'});this.stn.setPosition(this.cx(c.x),this.cy(c.y)).setVisible(true)}
 turn(d){if(this.mode!=='play'||this.paused)return;const last=this.q.length?this.q[this.q.length-1]:this.dir;if(d===last||d===OPP[last]||this.q.length>2)return;this.q.push(d);$('hint').style.opacity=0}
 stepTime(){return Math.max(.085,.17-this.score*.0035)}
 step(){if(this.q.length)this.dir=this.q.shift();const [dx,dy]=DIRS[this.dir],h=this.body[0],n={x:h.x+dx,y:h.y+dy};
  this.prev=this.body.map(b=>({...b}));
  const tailMoves=!this.grow;
  if(n.x<0||n.y<0||n.x>=COLS||n.y>=ROWS||this.rocks.some(r=>r.x===n.x&&r.y===n.y)||this.body.slice(0,tailMoves?-1:undefined).some(b=>b.x===n.x&&b.y===n.y)){this.crash(n);return}
  this.body.unshift(n);if(this.grow){this.grow--;this.prev.push({...this.prev[this.prev.length-1]});const i=this.body.length-1;this.cars.push(this.add.image(this.cx(this.prev[i].x),this.cy(this.prev[i].y),'car'+((i-1)%WCOL.length)).setScale(1/R).setDepth(10-i*.001))}else this.body.pop();
  this.prev.length=this.body.length;
  if(n.x===this.ppC.x&&n.y===this.ppC.y){this.score++;this.grow++;AU.sfx('coin');this.pop.explode(10,this.cx(n.x),this.cy(n.y));KIT.floatText(this,this.cx(n.x),this.cy(n.y)-10,'+1',`#fff`,20,40);
   if(this.score%4===0)this.addRock();if(this.score%7===0)this.spawnStar();this.placePP();this.ui.hud('🧍 '+this.score);
   if(this.score%10===0){AU.sfx('level');KIT.toast(`🎉 손님 ${this.score}명!`)}}
  if(this.starC&&n.x===this.starC.x&&n.y===this.starC.y){this.score+=3;this.grow++;AU.sfx('big');this.pop.explode(20,this.cx(n.x),this.cy(n.y));KIT.floatText(this,this.cx(n.x),this.cy(n.y)-10,'+3 ⭐','#ffd23a',22,40);this.starC=null;this.star.setVisible(false);this.ui.hud('🧍 '+this.score)}
  AU.tone(160,.03,'triangle',.04)}
 addRock(){const c=this.free(4);if(!c)return;const img=this.add.image(this.cx(c.x),this.cy(c.y),'rock').setScale(0).setDepth(4);this.tweens.add({targets:img,scale:1/R,duration:300,ease:'Back.easeOut'});this.rocks.push({...c,img})}
 spawnStar(){const c=this.free(3);if(!c)return;this.starC=c;this.starT=7;this.star.setPosition(this.cx(c.x),this.cy(c.y)).setVisible(true)}
 crash(n){this.mode='over';AU.sfx('boom');this.cameras.main.shake(300,.012);this.smoke.explode(20,this.cx(this.body[0].x),this.cy(this.body[0].y));
  this.cars.forEach((c,i)=>this.tweens.add({targets:c,angle:c.angle+rnd(-40,40),duration:300,delay:i*20}));
  S.games++;const nb=this.score>S.best;if(nb)S.best=this.score;SV.put();BGM.stop();
  this.time.delayedCall(900,()=>this.ui.result(nb?'🎉 새 최고 기록!':'💥 쾅!',`<div class="rline">손님 <b>${this.score}</b>명 태웠어요</div><div class="rline" style="font-size:18px">기차 ${this.body.length}칸 · 🏆 최고 ${S.best}명</div>`,nb))}
 update(t,dl){if(this.mode!=='play'||this.paused){if(this.mode==='home'){}return}const dt=Math.min(dl/1000,.05);
  this.acc+=dt;const st=this.stepTime();while(this.acc>=st&&this.mode==='play'){this.acc-=st;this.step()}if(this.mode!=='play')return;
  const f=this.acc/st;
  for(let i=0;i<this.body.length;i++){const a=this.prev[i]||this.body[i],b=this.body[i],x=this.cx(a.x+(b.x-a.x)*f),y=this.cy(a.y+(b.y-a.y)*f),c=this.cars[i];if(!c)continue;
   const ahead=i===0?{x:b.x+DIRS[this.dir][0]*0,y:b.y}:null;let ang;
   if(i===0){const dd=DIRS[this.dir];const mv=(b.x!==a.x||b.y!==a.y)?[b.x-a.x,b.y-a.y]:dd;ang=Math.atan2(mv[1],mv[0])}else{const p=this.body[i-1],pa=this.prev[i-1]||p;const px=pa.x+(p.x-pa.x)*f,py=pa.y+(p.y-pa.y)*f;ang=Math.atan2(py-(a.y+(b.y-a.y)*f),px-(a.x+(b.x-a.x)*f))}
   c.setPosition(x,y);const cur=c.rotation;let d=ang-cur;while(d>Math.PI)d-=Math.PI*2;while(d<-Math.PI)d+=Math.PI*2;c.rotation=cur+d*Math.min(1,dt*18)}
  if(Math.random()<dt*8)this.smoke.emitParticleAt(this.cars[0].x-Math.cos(this.cars[0].rotation)*1,this.cars[0].y-Math.sin(this.cars[0].rotation)*1-4,1);
  this.pp.y=this.cy(this.ppC.y)-3+Math.sin(t/200)*1.5;
  if(this.starC){this.starT-=dt;this.star.setAngle(t/10).setAlpha(this.starT<2?(Math.sin(t/60)>0?1:.3):1);if(this.starT<=0){this.starC=null;this.star.setVisible(false)}}}
}
KIT.boot(Main,{W,H,bg:'#5fb85a'});
})();
