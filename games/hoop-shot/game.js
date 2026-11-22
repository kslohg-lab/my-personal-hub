/* 슝슝 농구 — 60초 동안 슛을 몇 개 넣을까 (Phaser + Matter 물리: 림·백보드에 진짜처럼 튕김)
   조작: 당겼다 놓기 · 저장: localStorage 'hoopShotV1' {best, snd, games, swish} */
(()=>{'use strict';
const {R,rnd,clamp,$,AU,BGM}=KIT;
const SZ=KIT.size(420,680,940),W=SZ.W,H=SZ.H;
const FLOOR=H-80,BR=15,TIME=60,G=1.6,PULL=150,K=.15;
const SV=KIT.save('hoopShotV1',()=>({best:0,snd:1,games:0,swish:0}));const S=SV.data;

class Main extends Phaser.Scene{constructor(){super('main')}
 create(){window.__hs=this;KIT.ready(this,W,H);KIT.textures(this);this.mk();const M=this.M=Phaser.Physics.Matter.Matter;
  this.add.image(W/2,H/2,'gym').setScale(1/R);
  this.hx=300;this.hy=Math.round(Math.max(H*.3,FLOOR-300));this.hy0=this.hy;
  // 물리: 바닥, 림 앞·뒤, 백보드
  this.matter.add.rectangle(W/2,FLOOR+30,W*3,60,{isStatic:true,label:'floor',restitution:.6});
  this.rimF=this.matter.add.circle(0,0,4,{isStatic:true,label:'rim',restitution:.55});this.rimB=this.matter.add.circle(0,0,4,{isStatic:true,label:'rim',restitution:.55});
  this.board=this.matter.add.rectangle(0,0,8,120,{isStatic:true,label:'board',restitution:.5});
  this.ballB=this.matter.add.circle(120,FLOOR-BR,BR,{restitution:.68,friction:.02,frictionAir:.004,density:.002,label:'ball'});M.Body.setStatic(this.ballB,true);
  // 그림
  this.pole=this.add.image(0,0,'pole').setScale(1/R).setOrigin(.5,0).setDepth(2);
  this.bd=this.add.image(0,0,'board').setScale(1/R).setDepth(3);
  this.shadow=this.add.image(0,FLOOR+2,'shadow').setDepth(4).setAlpha(.25);
  this.ball=this.add.image(0,0,'ball').setScale(1/R).setDepth(10);
  this.net=this.add.graphics().setDepth(12);this.rimG=this.add.graphics().setDepth(13);
  this.aim=this.add.graphics().setDepth(20);
  this.fire=this.add.particles(0,0,'dot',{lifespan:400,speed:{min:10,max:40},scale:{start:.7,end:0},tint:[0xff5a2a,0xffb03a,0xffe07a],blendMode:'ADD',emitting:false}).setDepth(9);
  this.conf=this.add.particles(0,0,'spark',{lifespan:900,speed:{min:80,max:260},scale:{start:.7,end:0},gravityY:300,tint:[0xff7eb3,0xffd93b,0x6fd67a,0x5aa9ff],emitting:false}).setDepth(30);
  this.big=KIT.text(this,W/2,H*.2,'',36,'#fff','#c0501a').setDepth(40).setAlpha(0);
  this.matter.world.on('collisionstart',e=>{for(const p of e.pairs){const l=[p.bodyA.label,p.bodyB.label];if(!l.includes('ball'))continue;const o=l[0]==='ball'?l[1]:l[0];
   if(o==='rim'||o==='board'){this.touched=1;AU.tone(o==='rim'?620:300,.08,'triangle',.12)}else if(o==='floor'){const v=Math.abs(this.ballB.velocity.y);if(v>1.5)AU.tone(120,.08,'sine',Math.min(.2,v/40))}}});
  this.input.on('pointerdown',p=>{if(this.state!=='ready'||this.paused)return;this.drag={x:p.x/R,y:p.y/R};this.pv=null});
  this.input.on('pointermove',p=>{if(!this.drag)return;const dx=this.drag.x-p.x/R,dy=this.drag.y-p.y/R,l=Math.hypot(dx,dy),k=Math.min(l,PULL)/(l||1);this.pv={x:dx*k,y:dy*k};this.drawAim()});
  this.input.on('pointerup',()=>{if(!this.drag)return;this.drag=null;this.aim.clear();if(this.pv&&Math.hypot(this.pv.x,this.pv.y)>18)this.shoot(this.pv.x*K,this.pv.y*K)});
  this.ui=KIT.shell({S,SV,start:()=>this.start(),home:()=>this.home(),pause:on=>{this.paused=on;on?this.matter.world.pause():this.matter.world.resume()}});
  this.placeHoop();this.home()}
 mk(){const t=(k,w,h,f)=>KIT.tex(this,k,w,h,f),rr=KIT.rr;
  t('gym',W,H,x=>{const g=x.createLinearGradient(0,0,0,FLOOR);g.addColorStop(0,'#ffb27a');g.addColorStop(1,'#ffe0b8');x.fillStyle=g;x.fillRect(0,0,W,FLOOR);
   x.fillStyle='rgba(255,255,255,.18)';for(let i=0;i<W;i+=60)x.fillRect(i,0,30,FLOOR);
   x.fillStyle='rgba(120,60,30,.12)';for(let i=0;i<70;i++){x.beginPath();x.arc(Math.random()*W,40+Math.random()*FLOOR*.25,6+Math.random()*4,0,7);x.fill()}
   x.fillStyle='#d99a5a';x.fillRect(0,FLOOR,W,H-FLOOR);x.strokeStyle='#c4844a';x.lineWidth=2;for(let i=0;i<W;i+=48){x.beginPath();x.moveTo(i,FLOOR);x.lineTo(i-30,H);x.stroke()}
   x.fillStyle='#fff';x.globalAlpha=.6;x.fillRect(0,FLOOR,W,3);x.fillRect(118,FLOOR,3,H-FLOOR);x.globalAlpha=1;x.font='13px Jua, sans-serif';x.fillStyle='rgba(255,255,255,.85)';x.textAlign='center';x.fillText('3점',70,FLOOR+22);x.fillText('2점',170,FLOOR+22)});
  t('ball',BR*2+2,BR*2+2,x=>{const c=BR+1,g=x.createRadialGradient(c-5,c-6,2,c,c,BR);g.addColorStop(0,'#ffb26a');g.addColorStop(1,'#e8702a');x.fillStyle=g;x.beginPath();x.arc(c,c,BR,0,7);x.fill();
   x.strokeStyle='#7a3a1a';x.lineWidth=1.6;x.beginPath();x.arc(c,c,BR-.8,0,7);x.stroke();x.beginPath();x.moveTo(1,c);x.lineTo(BR*2+1,c);x.stroke();x.beginPath();x.moveTo(c,1);x.lineTo(c,BR*2+1);x.stroke();
   x.beginPath();x.arc(c-BR*1.15,c,BR*.9,-.9,.9);x.stroke();x.beginPath();x.arc(c+BR*1.15,c,BR*.9,Math.PI-.9,Math.PI+.9);x.stroke()});
  t('board',14,124,x=>{x.fillStyle='#fff';rr(x,1,0,12,124,3);x.fill();x.strokeStyle='#c8d0e0';x.lineWidth=2;rr(x,1,0,12,124,3);x.stroke();x.fillStyle='#ff5a5a';x.fillRect(3,64,8,36)});
  t('pole',12,H,x=>{x.fillStyle='#7a84a6';x.fillRect(3,0,6,H);x.fillStyle='#9aa4c6';x.fillRect(3,0,2,H)})}
 placeHoop(){const M=this.M,x=this.hx,y=this.hy;M.Body.setPosition(this.rimF,{x:x-38,y});M.Body.setPosition(this.rimB,{x:x+36,y});M.Body.setPosition(this.board,{x:x+46,y:y-48});
  this.bd.setPosition(x+46,y-48);this.pole.setPosition(x+58,y+8);this.drawRim()}
 drawRim(){const g=this.rimG,x=this.hx,y=this.hy;g.clear();g.lineStyle(5,0xff5a2a,1);g.lineBetween(x-40,y,x+38,y);g.fillStyle(0xd0401a);g.fillCircle(x-40,y,3.5);g.fillRect(x+36,y-3,10,6)}
 drawNet(t){const g=this.net,x=this.hx,y=this.hy,sw=this.netT>0?Math.sin(t/40)*this.netT*6:0;g.clear();g.lineStyle(1.6,0xffffff,.9);const n=6,top=[],bot=[];
  for(let i=0;i<=n;i++){top.push([x-38+i*74/n,y]);bot.push([x-24+i*46/n+sw*(i/n-.5),y+42+Math.abs(sw)])}
  for(let i=0;i<=n;i++){g.lineBetween(top[i][0],top[i][1],bot[Math.min(n,i+1)][0],bot[Math.min(n,i+1)][1]);g.lineBetween(top[i][0],top[i][1],bot[Math.max(0,i-1)][0],bot[Math.max(0,i-1)][1])}
  for(let r=1;r<=3;r++){const k=r/3;g.beginPath();for(let i=0;i<=n;i++){const px=top[i][0]+(bot[i][0]-top[i][0])*k,py=y+(bot[i][1]-y)*k;i?g.lineTo(px,py):g.moveTo(px,py)}g.strokePath()}}
 home(){this.mode='home';this.state='';this.ui.best(`🏆 최고 ${S.best}점`);this.ui.sc('home');BGM.play('calm');this.spawn()}
 start(){this.mode="play";this.paused=false;this.moving=0;this.score=0;this.streak=0;this.time0=null;this.left=TIME;this.made=0;this.shots=0;this.hy=this.hy0;this.placeHoop();
  this.ui.sc(null);this.ui.hud('🏀 0','⏱️ 60');$('hint').style.opacity=1;$('tfill').style.width='100%';BGM.play('play');this.spawn()}
 spawn(){const M=this.M,far=this.mode==='play'&&this.score>=10&&Math.random()<.45,x=far?rnd(50,110):rnd(130,210);M.Body.setStatic(this.ballB,true);M.Body.setPosition(this.ballB,{x,y:FLOOR-BR});M.Body.setAngle(this.ballB,0);
  this.state='ready';this.touched=0;this.above=0;this.scored=0;this.ball.setScale(.2/R);this.tweens.add({targets:this.ball,scale:1/R,duration:220,ease:'Back.easeOut'});this.far=x<119}
 shoot(vx,vy){const M=this.M;M.Body.setStatic(this.ballB,false);M.Body.setVelocity(this.ballB,{x:vx,y:vy});M.Body.setAngularVelocity(this.ballB,-.15);this.state='fly';this.flyT=0;this.shots++;
  if(this.mode==='play'&&this.time0==null)this.time0=this.time.now;AU.tone(240,.1,'sine',.15,0,420);$('hint').style.opacity=0}
 drawAim(){const g=this.aim;g.clear();if(!this.pv)return;const b=this.ballB.position;let x=b.x,y=b.y,vx=this.pv.x*K,vy=this.pv.y*K;const gs=G*.001*16.67*16.67;
  for(let i=0;i<26;i++){for(let k=0;k<2;k++){vy+=gs;x+=vx;y+=vy}g.fillStyle(0xffffff,1-i/30);g.fillCircle(x,y,3.2-i*.08)}
  const p=Math.hypot(this.pv.x,this.pv.y)/PULL;g.lineStyle(4,p<.6?0x6fe06f:p<.85?0xffd23a:0xff5a5a,1);g.beginPath();g.arc(b.x,b.y,BR+8,-Math.PI/2,-Math.PI/2+Math.PI*2*p);g.strokePath()}
 goal(){this.scored=1;this.made++;this.netT=1;const sw=!this.touched;this.streak++;const fire=this.streak>=3;let pts=(this.far?3:2)*(fire?2:1)+(sw?1:0);
  if(this.mode==='play'){this.score+=pts;if(sw){S.swish++;this.left=Math.min(TIME,this.left+2)}this.ui.hud('🏀 '+this.score)}
  AU.sfx(sw?'big':'clear',this.streak);this.conf.explode(sw?26:14,this.hx,this.hy+20);this.cameras.main.shake(120,.004);
  const msg=(sw?'✨ 쏙! ':'')+(this.far?'3점슛! ':'골! ')+(fire?'🔥×2':'');this.big.setText(msg+' +'+pts).setAlpha(1).setScale(.5);this.tweens.killTweensOf(this.big);this.tweens.add({targets:this.big,scale:1,duration:250,ease:'Back.easeOut'});this.tweens.add({targets:this.big,alpha:0,delay:800,duration:300});
  if(this.mode==='play'&&this.score>=20&&!this.moving){this.moving=1;KIT.toast('🏀 골대가 움직여요!')}}
 update(t,dl){const dt=Math.min(dl/1000,.05),b=this.ballB.position;this.ball.setPosition(b.x,b.y).setRotation(this.ballB.angle);
  const hgt=clamp((FLOOR-b.y)/400,0,1);this.shadow.setPosition(b.x,FLOOR+3).setScale(.5*(1-hgt*.6),.6*(1-hgt*.6));
  if(this.netT>0)this.netT=Math.max(0,this.netT-dt*1.6);this.drawNet(t);if(this.paused)return;
  if(this.mode==='play'&&this.moving&&this.state!=='fly'){this.hy=this.hy0+Math.sin(t/1400)*70;this.placeHoop()}
  if(this.state==='fly'){this.flyT+=dt;const v=this.ballB.velocity;
   if(b.y<this.hy-BR*.4&&b.x>this.hx-38&&b.x<this.hx+36)this.above=1;
   if(!this.scored&&this.above&&v.y>0&&b.y>this.hy+4&&b.y<this.hy+40&&b.x>this.hx-36&&b.x<this.hx+34)this.goal();
   if(this.streak>=3&&this.mode==='play')this.fire.emitParticleAt(b.x,b.y,1);
   const done=b.x<-60||b.x>W+60||(this.flyT>1&&b.y>FLOOR-BR-2&&Math.hypot(v.x,v.y)<1.2)||this.flyT>4.5;
   if(done){if(!this.scored)this.streak=0;this.state='wait';this.time.delayedCall(250,()=>{if(this.mode==='play'||this.mode==='home')this.spawn()})}}
  if(this.mode==='play'&&this.time0!=null){this.left-=dt;if(this.left<=0){this.left=0;this.over()}const s=Math.ceil(this.left);if(s!==this.ls){this.ls=s;this.ui.hud(undefined,'⏱️ '+s);if(s<=5&&s>0)AU.sfx('warn')}$('tfill').style.width=(this.left/TIME*100)+'%'}}
 over(){if(this.mode!=='play')return;this.mode='over';AU.sfx('lose');S.games++;const nb=this.score>S.best;if(nb)S.best=this.score;SV.put();BGM.stop();
  this.time.delayedCall(600,()=>this.ui.result(nb?'🎉 새 최고 기록!':'⏱️ 시간 끝!',`<div class="rline"><b>${this.score}</b>점</div><div class="rline" style="font-size:18px">${this.shots}번 던져서 ${this.made}골 · 🏆 최고 ${S.best}점</div>`,nb))}
}
KIT.boot(Main,{W,H,bg:'#ffb27a',physics:{default:'matter',matter:{gravity:{y:G},positionIterations:8,velocityIterations:6}}});
})();
