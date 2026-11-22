/* 슥삭 과일 썰기 — 날아오르는 과일을 손가락으로 그어서 자르기 (Phaser)
   과일을 놓치거나 폭탄을 자르면 ♥ -1 · 저장: localStorage 'fruitSliceV1' {best, snd, games, total} */
(()=>{'use strict';
const {R,rnd,pick,clamp,$,AU,BGM}=KIT;
const SZ=KIT.size(420,680,940),W=SZ.W,H=SZ.H,GRV=820;
const FR={
 melon:{r:34,skin:'#3aa04a',skin2:'#2a7a36',flesh:'#ff4f6a',rim:'#f6ffe0',seed:'#2a1a1a',juice:0xff4f6a},
 orange:{r:26,skin:'#ffa02a',skin2:'#e88010',flesh:'#ffc04a',rim:'#fff3d0',seed:null,juice:0xffa02a,seg:1},
 apple:{r:24,skin:'#ff4a4a',skin2:'#d02a2a',flesh:'#fff3c8',rim:'#ffe0a0',seed:'#6a3a1a',juice:0xfff0b0,stem:1},
 lemon:{r:23,skin:'#ffe04a',skin2:'#e8c020',flesh:'#fff6a0',rim:'#ffffe0',seed:null,juice:0xffe04a,seg:1},
 kiwi:{r:22,skin:'#8a6a3a',skin2:'#6a4a2a',flesh:'#7ad04a',rim:'#d8f0b0',seed:'#1a1a1a',juice:0x7ad04a},
 peach:{r:26,skin:'#ffb08a',skin2:'#ff8a7a',flesh:'#ffd08a',rim:'#fff0d0',seed:'#a05a3a',juice:0xffb08a,pit:1},
 star:{r:26,skin:'#ffd23a',skin2:'#ffb000',flesh:'#fff3a0',rim:'#fffbe0',seed:null,juice:0xffd23a,gold:1}};
const KINDS=['melon','orange','apple','lemon','kiwi','peach'];
const SV=KIT.save('fruitSliceV1',()=>({best:0,snd:1,games:0,total:0}));const S=SV.data;

class Main extends Phaser.Scene{constructor(){super('main')}
 create(){window.__fs=this;KIT.ready(this,W,H);KIT.textures(this);this.mk();
  this.add.image(W/2,H/2,'board').setScale(1/R).setDepth(-10);
  this.splats=this.add.layer().setDepth(-5);this.blade=this.add.graphics().setDepth(40);
  this.juice=this.add.particles(0,0,'dot',{lifespan:600,speed:{min:60,max:240},gravityY:500,scale:{start:.5,end:0},emitting:false}).setDepth(20);
  this.sparkE=this.add.particles(0,0,'spark',{lifespan:300,speed:{min:20,max:80},scale:{start:.5,end:0},tint:[0xffd23a,0xff7a3a],blendMode:'ADD',emitting:false}).setDepth(21);
  this.big=KIT.text(this,W/2,H*.3,'',38,'#fff','#a0401a').setDepth(50).setAlpha(0);
  this.fr=[];this.halves=[];this.trail=[];
  this.input.on('pointerdown',p=>{this.trail=[{x:p.x/R,y:p.y/R,t:this.time.now}];this.swipeN=0;this.swipeT=this.time.now;this.down=true});
  this.input.on('pointermove',p=>{if(!this.down)return;const pt={x:p.x/R,y:p.y/R,t:this.time.now},lp=this.trail[this.trail.length-1];this.trail.push(pt);if(lp)this.cut(lp,pt);if(Math.hypot(pt.x-lp.x,pt.y-lp.y)>14&&Math.random()<.3)AU.noise(.05,.03,0,4000)});
  this.input.on('pointerup',()=>{this.down=false;this.endSwipe()});
  this.ui=KIT.shell({S,SV,start:()=>this.start(),home:()=>this.home(),pause:on=>this.paused=on});
  this.home()}
 mk(){const t=(k,w,h,f)=>KIT.tex(this,k,w,h,f);
  t('board',W,H,x=>{x.fillStyle='#6a4630';x.fillRect(0,0,W,H);for(let i=0;i<H;i+=56){x.fillStyle=i/56%2?'#74503a':'#6a4630';x.fillRect(0,i,W,56);x.fillStyle='rgba(0,0,0,.18)';x.fillRect(0,i+54,W,2)}
   x.strokeStyle='rgba(40,20,10,.25)';x.lineWidth=1.2;for(let i=0;i<60;i++){const y=Math.random()*H,xx=Math.random()*W;x.beginPath();x.moveTo(xx,y);x.bezierCurveTo(xx+30,y+3,xx+60,y-3,xx+100,y);x.stroke()}});
  for(const [k,f] of Object.entries(FR)){const r=f.r,s=r*2+8,c=s/2;
   t('f_'+k,s,s,x=>{if(f.gold){x.fillStyle=f.skin;x.beginPath();for(let i=0;i<10;i++){const a=-Math.PI/2+i*Math.PI/5,rr=i%2?r*.5:r;x.lineTo(c+Math.cos(a)*rr,c+Math.sin(a)*rr)}x.closePath();x.fill();x.strokeStyle=f.skin2;x.lineWidth=2;x.stroke();x.fillStyle='rgba(255,255,255,.6)';x.beginPath();x.arc(c-r*.25,c-r*.3,r*.15,0,7);x.fill();return}
    const g=x.createRadialGradient(c-r*.35,c-r*.4,2,c,c,r);g.addColorStop(0,'rgba(255,255,255,.55)');g.addColorStop(.3,f.skin);g.addColorStop(1,f.skin2);x.fillStyle=g;x.beginPath();k==='lemon'?x.ellipse(c,c,r,r*.8,0,0,7):x.arc(c,c,r,0,7);x.fill();
    if(k==='melon'){x.strokeStyle='#1f6a2a';x.lineWidth=3;for(let i=-2;i<=2;i++){x.beginPath();x.ellipse(c+i*r*.35,c,r*.12,r*.95,0,0,7);x.stroke()}}
    if(k==='kiwi'){x.fillStyle='rgba(60,40,20,.4)';for(let i=0;i<30;i++){const a=Math.random()*7,d=Math.random()*r;x.fillRect(c+Math.cos(a)*d,c+Math.sin(a)*d,1.2,1.2)}}
    if(f.stem){x.strokeStyle='#6a3a1a';x.lineWidth=3;x.beginPath();x.moveTo(c,c-r+3);x.lineTo(c+2,c-r-3);x.stroke();x.fillStyle='#5ed67a';x.beginPath();x.ellipse(c+7,c-r,6,3,-.4,0,7);x.fill()}
    if(k==='peach'){x.strokeStyle='rgba(200,80,80,.5)';x.lineWidth=2;x.beginPath();x.arc(c+r*.15,c,r*.8,-1.2,1.2);x.stroke()}
    x.fillStyle='rgba(255,255,255,.45)';x.beginPath();x.ellipse(c-r*.35,c-r*.4,r*.22,r*.13,-.6,0,7);x.fill()});
   // 반쪽 (자른 면이 보이는 반원) — 위쪽 반원
   t('h_'+k,s,s/2+4,x=>{const y=s/2;x.fillStyle=f.skin2;x.beginPath();x.arc(c,y,r,Math.PI,0);x.closePath();x.fill();x.fillStyle=f.rim;x.beginPath();x.arc(c,y,r-3,Math.PI,0);x.closePath();x.fill();x.fillStyle=f.flesh;x.beginPath();x.arc(c,y,r-6,Math.PI,0);x.closePath();x.fill();
    if(f.seg){x.strokeStyle=f.rim;x.lineWidth=1.5;for(let i=1;i<5;i++){const a=Math.PI+i*Math.PI/5;x.beginPath();x.moveTo(c,y);x.lineTo(c+Math.cos(a)*(r-6),y+Math.sin(a)*(r-6));x.stroke()}}
    if(f.seed){x.fillStyle=f.seed;const n=k==='kiwi'?14:k==='melon'?7:3;for(let i=0;i<n;i++){const a=Math.PI+(i+.5)/n*Math.PI,d=k==='kiwi'?r*.45:r*.55;x.beginPath();x.ellipse(c+Math.cos(a)*d,y+Math.sin(a)*d-1,1.6,2.6,a,0,7);x.fill()}}
    if(f.pit){x.fillStyle=f.seed;x.beginPath();x.ellipse(c,y-2,r*.3,r*.22,0,Math.PI,0);x.fill()}
    if(k==='kiwi'){x.fillStyle='#f4ffe0';x.beginPath();x.arc(c,y,r*.22,Math.PI,0);x.fill()}})}
  t('bomb',58,64,x=>{x.fillStyle='#2a2a3a';x.beginPath();x.arc(29,36,24,0,7);x.fill();x.fillStyle='#4a4a5a';x.fillRect(22,8,14,8);x.strokeStyle='#c8a060';x.lineWidth=3;x.beginPath();x.moveTo(29,8);x.quadraticCurveTo(36,0,44,4);x.stroke();
   x.fillStyle='rgba(255,255,255,.35)';x.beginPath();x.arc(20,28,6,0,7);x.fill();x.strokeStyle='#ff4a4a';x.lineWidth=3;x.beginPath();x.moveTo(20,40);x.lineTo(38,40);x.moveTo(29,32);x.lineTo(29,48);x.stroke()});
  t('splat',80,80,x=>{x.fillStyle='#fff';x.beginPath();x.arc(40,40,20,0,7);x.fill();for(let i=0;i<9;i++){const a=Math.random()*7,d=18+Math.random()*16;x.beginPath();x.arc(40+Math.cos(a)*d,40+Math.sin(a)*d,3+Math.random()*6,0,7);x.fill()}})}
 home(){this.mode='home';this.clearAll();this.ui.best(`🏆 최고 ${S.best}개 · 모두 ${S.total}개 썰었어요`);this.ui.sc('home');BGM.play('calm');this.demoT=0}
 clearAll(){this.fr.forEach(f=>f.img.destroy());this.halves.forEach(h=>h.img.destroy());this.fr=[];this.halves=[];this.splats.removeAll(true)}
 start(){this.clearAll();this.mode='play';this.paused=false;this.score=0;this.hearts=3;this.waveT=1;this.level=0;this.ui.sc(null);this.hud();BGM.play('play')}
 hud(){this.ui.hud('🍉 '+this.score,'🏆 '+S.best,'♥'.repeat(Math.max(0,this.hearts))+'♡'.repeat(Math.max(0,3-this.hearts)))}
 launch(k){const f=k==='bomb'?{r:24}:FR[k],x=rnd(60,W-60),tx=rnd(W*.25,W*.75),peak=rnd(H*.18,H*.45),vy=-Math.sqrt(2*GRV*(H+20-peak)),tt=-vy/GRV,vx=(tx-x)/tt*rnd(.6,1);
  const img=this.add.image(x,H+30,k==='bomb'?'bomb':'f_'+k).setScale(1/R).setDepth(10);this.fr.push({k,x,y:H+30,vx,vy,r:f.r,va:rnd(-3,3),img});AU.tone(200,.1,'sine',.06,0,320)}
 wave(){this.level=Math.min(30,Math.floor(this.score/8));const n=1+Math.floor(Math.random()*Math.min(5,1+this.level/3)),bombP=this.score<5?0:Math.min(.22,.06+this.level*.01);
  for(let i=0;i<n;i++)this.time.delayedCall(i*rnd(90,220),()=>{if(this.mode!=='play')return;const r=Math.random();this.launch(r<bombP?'bomb':r<bombP+.03?'star':pick(KINDS))})}
 cut(a,b){if(this.mode!=='play'&&this.mode!=='home')return;if(this.paused)return;const dx=b.x-a.x,dy=b.y-a.y,L=Math.hypot(dx,dy);if(L<3)return;
  for(const f of this.fr){if(f.cut)continue;const t=clamp(((f.x-a.x)*dx+(f.y-a.y)*dy)/(L*L),0,1),px=a.x+dx*t,py=a.y+dy*t;if(Math.hypot(f.x-px,f.y-py)<f.r+4){f.cut=1;this.slice(f,Math.atan2(dy,dx))}}}
 slice(f,ang){if(f.k==='bomb'){this.boom(f);return}const d=FR[f.k];this.swipeN++;
  [0,1].forEach(s=>{const img=this.add.image(f.x,f.y,'h_'+f.k).setScale(1/R).setDepth(11).setRotation(ang+(s?Math.PI:0)).setOrigin(.5,1);const nx=-Math.sin(ang)*(s?-1:1),ny=Math.cos(ang)*(s?-1:1);
   this.halves.push({img,x:f.x,y:f.y,vx:f.vx*.5-nx*90,vy:Math.min(f.vy,-60)-ny*90,va:(s?-1:1)*rnd(2,5)})});
  this.juice.setParticleTint(d.juice);this.juice.explode(14,f.x,f.y);const sp=this.add.image(f.x,f.y,'splat').setScale(rnd(.5,.9)/R).setTint(d.juice).setAlpha(.45).setRotation(rnd(0,6));this.splats.add(sp);this.tweens.add({targets:sp,alpha:0,duration:3500,delay:1500,onComplete:()=>sp.destroy()});
  f.img.destroy();AU.noise(.12,.18,0,3000);AU.tone(700+this.swipeN*80,.08,'triangle',.08);
  if(this.mode==='play'){const pts=d.gold?10:1;this.score+=pts;S.total++;if(d.gold){AU.sfx('big');KIT.floatText(this,f.x,f.y-20,'⭐ +10','#ffd23a',26,45)}this.hud()}}
 endSwipe(){if(this.mode==='play'&&this.swipeN>=3){const b=this.swipeN;this.score+=b;this.hud();AU.sfx('clear',b);this.big.setText(`${b}개 콤보! +${b}`).setAlpha(1).setScale(.5);this.tweens.killTweensOf(this.big);this.tweens.add({targets:this.big,scale:1,duration:220,ease:'Back.easeOut'});this.tweens.add({targets:this.big,alpha:0,delay:700,duration:300})}this.swipeN=0}
 boom(f){f.img.destroy();this.sparkE.explode(30,f.x,f.y);this.juice.setParticleTint(0x555566);this.juice.explode(20,f.x,f.y);AU.sfx('boom');this.cameras.main.shake(400,.02);this.cameras.main.flash(250,255,255,255);if(this.mode==='play'){this.hearts--;this.hud();KIT.floatText(this,f.x,f.y,'💥 앗!','#fff',28,45);if(this.hearts<=0)this.over()}}
 update(t,dl){const dt=Math.min(dl/1000,.04);
  // 칼 자국
  const now=this.time.now;this.trail=this.trail.filter(p=>now-p.t<140);const g=this.blade;g.clear();if(this.trail.length>1){for(let i=1;i<this.trail.length;i++){const a=this.trail[i-1],b=this.trail[i],k=i/this.trail.length;g.lineStyle(2+k*7,0xffffff,.25+k*.7);g.lineBetween(a.x,a.y,b.x,b.y)}}
  if(this.paused)return;
  if(this.mode==='home'){this.demoT-=dt;if(this.demoT<=0){this.demoT=1.1;this.launch(pick(KINDS))}for(const f of this.fr)if(!f.cut&&f.vy>-100&&f.vy<100&&Math.random()<.05){f.cut=1;this.slice(f,rnd(-1,1))}}
  if(this.mode==='play'){this.waveT-=dt;if(this.waveT<=0){this.waveT=Math.max(.9,2.2-this.level*.05);this.wave()}}
  for(const f of this.fr){f.vy+=GRV*dt;f.x+=f.vx*dt;f.y+=f.vy*dt;f.img.setPosition(f.x,f.y).rotation+=f.va*dt;if(f.k==='bomb'&&Math.random()<.5)this.sparkE.emitParticleAt(f.x+12,f.y-26,1);
   if(f.vy>0&&f.y>H+40){f.gone=1;f.img.destroy();if(this.mode==='play'&&f.k!=='bomb'&&!f.cut){this.hearts--;AU.sfx('bad');this.hud();KIT.floatText(this,clamp(f.x,40,W-40),H-50,'놓쳤어요!','#ffb0b0',20,45);if(this.hearts<=0)this.over()}}}
  this.fr=this.fr.filter(f=>!f.cut&&!f.gone);
  for(const h of this.halves){h.vy+=GRV*dt;h.x+=h.vx*dt;h.y+=h.vy*dt;h.img.setPosition(h.x,h.y).rotation+=h.va*dt;if(h.y>H+60)h.gone=1}
  this.halves=this.halves.filter(h=>{if(h.gone){h.img.destroy();return false}return true})}
 over(){if(this.mode!=='play')return;this.mode='over';AU.sfx('lose');BGM.stop();S.games++;const nb=this.score>S.best;if(nb)S.best=this.score;SV.put();
  this.time.delayedCall(800,()=>this.ui.result(nb?'🎉 새 최고 기록!':'끝!',`<div class="rline">과일 <b>${this.score}</b>점</div><div class="rline" style="font-size:18px">🏆 최고 ${S.best} · 지금까지 ${S.total}개 썰었어요</div>`,nb))}
}
KIT.boot(Main,{W,H,bg:'#6a4630'});
})();
