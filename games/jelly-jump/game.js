/* 통통 점프 — 젤리가 발판을 밟고 끝없이 위로 (두들 점프 방식, Phaser)
   조작: 화면 왼쪽/오른쪽 누르고 있기 (키보드 ←→) · 저장: localStorage 'jellyJumpV1' {best, snd, games} */
(()=>{'use strict';
const {R,rnd,pick,clamp,$,AU,BGM}=KIT;
const SZ=KIT.size(420,680,940),W=SZ.W,H=SZ.H;
const GR=1500,JV=-800,SPR=-1300,PW=72,PR=17,ACC=1700,MAXV=330;
const SV=KIT.save('jellyJumpV1',()=>({best:0,snd:1,games:0}));const S=SV.data;
const SKY=[[0,[150,215,255]],[3000,[255,190,160]],[7000,[120,90,200]],[12000,[20,20,60]]];

class Main extends Phaser.Scene{constructor(){super('main')}
 create(){window.__jj=this;KIT.ready(this,W,H);KIT.textures(this);this.mk();
  this.clouds=[];for(let i=0;i<7;i++){const c=this.add.image(rnd(0,W),rnd(0,H),'cloud').setScale(rnd(.6,1.1)/R).setAlpha(.8).setDepth(-5);c.sp=rnd(.15,.35);c.sy=c.y;this.clouds.push(c)}
  this.pl=this.add.image(W/2,H-100,'jelly').setScale(1/R).setDepth(20);this.plats=[];this.ens=[];this.items=[];
  this.fx=this.add.particles(0,0,'dot',{lifespan:400,speed:{min:40,max:140},scale:{start:.4,end:0},tint:[0x7ae87a,0xffffff],emitting:false}).setDepth(25);
  this.fire=this.add.particles(0,0,'dot',{lifespan:300,speedY:{min:150,max:260},speedX:{min:-30,max:30},scale:{start:.6,end:0},tint:[0xff7a3a,0xffd23a],blendMode:'ADD',emitting:false}).setDepth(19);
  this.input.addPointer(2);this.keys=this.input.keyboard.addKeys('LEFT,RIGHT');
  this.ui=KIT.shell({S,SV,start:()=>this.start(),home:()=>this.home(),pause:on=>this.paused=on});
  this.home()}
 mk(){const t=(k,w,h,f)=>KIT.tex(this,k,w,h,f),rr=KIT.rr;
  t('jelly',40,40,x=>{x.fillStyle='rgba(0,0,0,.12)';x.beginPath();x.ellipse(20,36,14,3,0,0,7);x.fill();const g=x.createRadialGradient(15,14,2,20,22,19);g.addColorStop(0,'#c8ffb8');g.addColorStop(1,'#4ccf5a');x.fillStyle=g;
   x.beginPath();x.moveTo(3,34);x.quadraticCurveTo(1,6,20,4);x.quadraticCurveTo(39,6,37,34);x.quadraticCurveTo(20,38,3,34);x.fill();x.fillStyle='#fff';x.beginPath();x.arc(14,18,5,0,7);x.arc(26,18,5,0,7);x.fill();x.fillStyle='#2a3a4a';x.beginPath();x.arc(15,19,2.6,0,7);x.arc(27,19,2.6,0,7);x.fill();
   x.fillStyle='#ff8fb8';x.globalAlpha=.6;x.beginPath();x.arc(9,25,3,0,7);x.arc(31,25,3,0,7);x.fill();x.globalAlpha=1;x.strokeStyle='#2a6a3a';x.lineWidth=1.6;x.beginPath();x.arc(20,24,3.5,.2,Math.PI-.2);x.stroke();x.fillStyle='rgba(255,255,255,.6)';x.beginPath();x.ellipse(11,9,4,2.5,-.5,0,7);x.fill()});
  const plat=(k,c1,c2,deco)=>t(k,PW+4,18,x=>{x.fillStyle='rgba(0,0,0,.15)';rr(x,3,5,PW,12,6);x.fill();x.fillStyle=c1;rr(x,2,2,PW,12,6);x.fill();x.fillStyle=c2;rr(x,5,3.5,PW-6,4,2);x.fill();if(deco)deco(x)});
  plat('pN','#5ed67a','#a8f0b0');plat('pM','#4ab8ff','#a8dcff');plat('pB','#b88a5a','#d8b08a',x=>{x.strokeStyle='#7a5a3a';x.lineWidth=1.5;x.beginPath();x.moveTo(PW/2,2);x.lineTo(PW/2-4,8);x.lineTo(PW/2+3,14);x.stroke()});plat('pC','#ffffff','#e8f4ff');
  t('spring',22,18,x=>{x.strokeStyle='#8a8aa0';x.lineWidth=2.5;x.beginPath();for(let i=0;i<4;i++){x.moveTo(4,16-i*3.5);x.lineTo(18,14-i*3.5)}x.stroke();x.fillStyle='#ff5a6a';rr(x,1,0,20,5,2.5);x.fill()});
  t('balloon',30,46,x=>{x.strokeStyle='#888';x.lineWidth=1;x.beginPath();x.moveTo(15,30);x.quadraticCurveTo(10,38,15,46);x.stroke();x.fillStyle='#ff6fa8';x.beginPath();x.ellipse(15,15,12,14,0,0,7);x.fill();x.fillStyle='rgba(255,255,255,.6)';x.beginPath();x.ellipse(10,9,3,5,-.4,0,7);x.fill()});
  t('rocket',26,40,x=>{x.fillStyle='#e8eef8';x.beginPath();x.moveTo(13,1);x.quadraticCurveTo(23,12,21,30);x.lineTo(5,30);x.quadraticCurveTo(3,12,13,1);x.fill();x.fillStyle='#ff5a6a';x.beginPath();x.moveTo(5,22);x.lineTo(0,34);x.lineTo(7,30);x.fill();x.beginPath();x.moveTo(21,22);x.lineTo(26,34);x.lineTo(19,30);x.fill();x.fillStyle='#4ab8ff';x.beginPath();x.arc(13,14,4,0,7);x.fill()});
  t('spike',40,40,x=>{x.fillStyle='#8a5ad0';x.beginPath();for(let i=0;i<16;i++){const a=i/16*Math.PI*2,r=i%2?13:19;x.lineTo(20+Math.cos(a)*r,20+Math.sin(a)*r)}x.closePath();x.fill();x.fillStyle='#fff';x.beginPath();x.arc(15,18,4,0,7);x.arc(25,18,4,0,7);x.fill();x.fillStyle='#2a1a3a';x.beginPath();x.arc(16,19,2,0,7);x.arc(24,19,2,0,7);x.fill();x.strokeStyle='#2a1a3a';x.lineWidth=1.5;x.beginPath();x.moveTo(14,26);x.lineTo(26,26);x.stroke()});
  t('cloud',90,40,x=>{x.fillStyle='#fff';[[25,24,16],[45,18,20],[66,24,15],[45,28,16]].forEach(([a,b,r])=>{x.beginPath();x.arc(a,b,r,0,7);x.fill()})})}
 home(){this.mode='home';this.reset();this.ui.best(`🏆 최고 ${S.best}m`);this.ui.sc('home');BGM.play('calm')}
 reset(){[...this.plats,...this.ens,...this.items].forEach(o=>{o.img.destroy();if(o.spring)o.spring.destroy()});if(this.flyImg){this.flyImg.destroy();this.flyImg=null}this.plats=[];this.ens=[];this.items=[];this.px=W/2;this.py=H-120;this.vx=0;this.vy=JV;this.top=H;this.hi=0;this.fly=0;this.flyK='';
  this.camTop=0;this.cameras.main.centerOn(W/2,H/2);this.addPlat(W/2,H-80,'pN',true);let y=H-80;while(y>-H){y-=rnd(55,85);this.addPlat(rnd(PW/2,W-PW/2),y)}this.top=y}
 start(){this.reset();this.mode='play';this.paused=false;this.score=0;this.ui.sc(null);this.ui.hud('0m','🏆 '+S.best+'m');$('hint').style.opacity=1;BGM.play('bright')}
 addPlat(x,y,k,safe){const h=Math.max(0,-y)/10;if(!k){const r=Math.random();k=h<150?(r<.85?'pN':'pM'):r<.5?'pN':r<.7?'pM':r<.85?'pB':'pC'}
  const img=this.add.image(x,y,k).setScale(1/R).setDepth(5);const p={x,y,k,img,vx:k==='pM'?rnd(50,90+h*.05)*(Math.random()<.5?-1:1):0};this.plats.push(p);
  if(!safe&&k!=='pB'&&k!=='pC'){const r=Math.random();if(r<.08)p.spring=this.add.image(x,y-14,'spring').setScale(1/R).setDepth(6);else if(r<.1&&h>40)this.items.push({k:'balloon',x,y:y-34,img:this.add.image(x,y-34,'balloon').setScale(1/R).setDepth(7)});else if(r<.115&&h>100)this.items.push({k:'rocket',x,y:y-30,img:this.add.image(x,y-30,'rocket').setScale(1/R).setDepth(7)})}
  if(!safe&&h>60&&Math.random()<Math.min(.08,.02+h/8000)){const ey=y-rnd(60,90);this.ens.push({x:rnd(30,W-30),y:ey,vx:rnd(40,80)*(Math.random()<.5?-1:1),img:this.add.image(0,ey,'spike').setScale(1/R).setDepth(8)})}
  return p}
 bounce(v,s){this.vy=v;AU.tone(s||380,.12,'sine',.12,0,(s||380)*1.8);this.tweens.killTweensOf(this.pl);this.pl.setScale(1.25/R,.75/R);this.tweens.add({targets:this.pl,scaleX:1/R,scaleY:1/R,duration:220,ease:'Back.easeOut'})}
 update(t,dl){const cam=this.cameras.main;if(this.mode!=='play'&&this.mode!=='home')return;if(this.paused)return;const dt=Math.min(dl/1000,.033);
  // 좌우
  let dir=0;if(this.mode==='play'){for(const p of this.input.manager.pointers)if(p.isDown&&p.y/R>80){dir+=p.x/R<W/2?-1:1}if(this.keys.LEFT.isDown)dir=-1;if(this.keys.RIGHT.isDown)dir=1}
  else{const tg=this.plats.find(p=>p.y<this.py-30&&p.y>this.py-140);if(tg)dir=Math.sign(tg.x-this.px)*(Math.abs(tg.x-this.px)>10?1:0)}
  if(dir){this.vx+=dir*ACC*dt;$('hint').style.opacity=0}else this.vx*=Math.pow(.004,dt);this.vx=clamp(this.vx,-MAXV,MAXV);
  if(this.fly>0){this.fly-=dt;this.vy=this.flyK==='rocket'?-900:-420;if(this.flyK==='rocket')this.fire.emitParticleAt(this.px,this.py+20,2)}else this.vy+=GR*dt;
  const oy=this.py;this.px+=this.vx*dt;this.py+=this.vy*dt;if(this.px<-PR)this.px+=W+PR*2;if(this.px>W+PR)this.px-=W+PR*2;
  // 발판 착지 (내려올 때만)
  if(this.vy>0&&this.fly<=0)for(const p of this.plats){if(p.dead)continue;const top=p.y-6;if(oy+PR<=top+2&&this.py+PR>=top&&Math.abs(this.px-p.x)<PW/2+PR*.6){
    if(p.k==='pB'){p.dead=1;AU.sfx('thud');this.tweens.add({targets:p.img,y:p.y+300,angle:rnd(-40,40),alpha:0,duration:700});continue}
    this.py=top-PR;if(p.spring&&Math.abs(this.px-p.x)<16){this.bounce(SPR,600);p.spring.setScale(1/R,1.6/R);this.tweens.add({targets:p.spring,scaleY:1/R,duration:250})}else this.bounce(JV);this.fx.explode(5,this.px,top);
    if(p.k==='pC'){p.dead=1;this.tweens.add({targets:p.img,alpha:0,scale:1.3/R,duration:250})}break}}
  for(const p of this.plats){if(p.vx){p.x+=p.vx*dt;if(p.x<PW/2||p.x>W-PW/2)p.vx*=-1;p.img.x=p.x;if(p.spring)p.spring.x=p.x}}
  // 아이템·적
  for(const it of this.items){if(!it.got&&Math.abs(it.x-this.px)<26&&Math.abs(it.y-this.py)<34){it.got=1;it.img.destroy();this.fly=it.k==='rocket'?3:2.2;this.flyK=it.k;AU.sfx(it.k==='rocket'?'zap':'heal');KIT.toast(it.k==='rocket'?'🚀 슝!':'🎈 둥실둥실~')}}
  for(const e of this.ens){if(e.dead)continue;e.x+=e.vx*dt;if(e.x<20||e.x>W-20)e.vx*=-1;e.img.setPosition(e.x,e.y+Math.sin(t/300+e.x)*4).setAngle(t/8);
   if(Math.hypot(e.x-this.px,e.y-this.py)<PR+16){if(this.fly>0||(this.vy>0&&this.py<e.y-6)){e.dead=1;AU.sfx('pop',6);this.fx.explode(12,e.x,e.y);this.tweens.add({targets:e.img,scale:0,duration:200});if(this.fly<=0)this.bounce(JV*1.1);if(this.mode==='play')this.score+=0}else if(this.mode==='play'){this.die();return}}}
  // 그림
  this.pl.setPosition(this.px,this.py);this.pl.setFlipX(this.vx<-20?true:this.vx>20?false:this.pl.flipX);
  if(this.flyK&&this.fly>0){if(!this.flyImg)this.flyImg=this.add.image(0,0,this.flyK).setScale(1/R).setDepth(19);this.flyImg.setTexture(this.flyK).setPosition(this.px,this.flyK==='rocket'?this.py+14:this.py-34)}else if(this.flyImg){this.flyImg.destroy();this.flyImg=null}
  // 카메라·점수
  const want=this.py-H*.42;if(want<this.camTop)this.camTop=want;cam.centerOn(W/2,this.camTop+H/2);const h=Math.max(0,Math.round((H-120-this.py)/10));
  if(this.mode==='play'&&h>this.hi){this.hi=h;this.ui.hud(h+'m');if(h>0&&h%500===0&&h!==this.ms){this.ms=h;AU.sfx('level');KIT.toast(`🎉 ${h}m!`)}}
  const c=this.skyCol(-this.camTop);cam.setBackgroundColor(c);
  this.clouds.forEach(cl=>{let y=(cl.sy-this.camTop*cl.sp)%(H+60);if(y<-30)y+=H+60;cl.y=this.camTop+y;cl.setAlpha(clamp(.8-(-this.camTop)/9000,0,.8))});
  // 새 발판, 지난 것 정리
  while(this.top>this.camTop-H*.5){const hh=Math.max(0,-this.top)/10,gap=clamp(60+hh*.035,60,160);this.top-=rnd(gap*.7,gap);this.addPlat(rnd(PW/2,W-PW/2),this.top)}
  const bot=this.camTop+H+60;this.plats=this.plats.filter(p=>{if(p.y>bot){p.img.destroy();if(p.spring)p.spring.destroy();return false}return true});this.ens=this.ens.filter(e=>{if(e.y>bot){e.img.destroy();return false}return true});this.items=this.items.filter(i=>{if(i.got)return false;if(i.y>bot){i.img.destroy();return false}return true});
  if(this.py>this.camTop+H+40){if(this.mode==='play')this.die();else this.reset()}}
 skyCol(h){let a=SKY[0],b=SKY[SKY.length-1];for(let i=0;i<SKY.length-1;i++)if(h>=SKY[i][0]&&h<SKY[i+1][0]){a=SKY[i];b=SKY[i+1];break}if(h>=b[0])a=b;const k=a===b?0:(h-a[0])/(b[0]-a[0]);const c=a[1].map((v,i)=>Math.round(v+(b[1][i]-v)*k));return Phaser.Display.Color.GetColor(c[0],c[1],c[2])}
 die(){if(this.mode!=='play')return;this.mode='over';AU.sfx('lose');S.games++;const nb=this.hi>S.best;if(nb)S.best=this.hi;SV.put();BGM.stop();this.tweens.add({targets:this.pl,angle:360,duration:600});
  this.time.delayedCall(700,()=>this.ui.result(nb?'🎉 새 최고 기록!':'떨어졌어요!',`<div class="rline"><b>${this.hi}</b>m 올라갔어요</div><div class="rline" style="font-size:18px">🏆 최고 ${S.best}m</div>`,nb))}
}
KIT.boot(Main,{W,H,bg:'#96d7ff'});
})();
