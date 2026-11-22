/* 반짝 우주 슈팅 — 세로 슈팅 (Phaser). 끌면 우주선이 따라오고 총은 자동, 5파도마다 보스
   저장: localStorage 'spaceShooterV1' {best, wave, snd, games} */
(()=>{'use strict';
const {R,rnd,pick,clamp,$,AU,BGM}=KIT;
const SZ=KIT.size(420,680,940),W=SZ.W,H=SZ.H;
const SV=KIT.save('spaceShooterV1',()=>({best:0,wave:0,snd:1,games:0}));const S=SV.data;
const ETYPE={a:{hp:1,r:15,pts:10,tex:'ea'},b:{hp:4,r:19,pts:30,tex:'eb'},c:{hp:2,r:15,pts:20,tex:'ec'},rock:{hp:5,r:22,pts:25,tex:'rock'}};

class Main extends Phaser.Scene{constructor(){super('main')}
 create(){window.__sp=this;KIT.ready(this,W,H);KIT.textures(this);this.mk();
  this.add.image(W/2,H/2,'bg').setScale(1/R).setDepth(-10);
  this.stars=[];for(let i=0;i<90;i++){const l=i%3;this.stars.push({x:rnd(0,W),y:rnd(0,H),v:30+l*45,s:this.add.image(0,0,'dot').setScale(.08+l*.06).setAlpha(.4+l*.25).setDepth(-5)})}
  this.ship=this.add.image(W/2,H-120,'ship').setScale(1/R).setDepth(20);this.shield=this.add.image(0,0,'shield').setScale(1/R).setDepth(21).setVisible(false);
  this.flame=this.add.particles(0,0,'dot',{lifespan:220,speedY:{min:120,max:200},speedX:{min:-15,max:15},scale:{start:.45,end:0},tint:[0x7ff3ff,0x5aa9ff,0xffffff],blendMode:'ADD',emitting:false}).setDepth(19);
  this.boom=this.add.particles(0,0,'dot',{lifespan:600,speed:{min:40,max:220},scale:{start:.6,end:0},tint:[0xffd93b,0xff7a3a,0xffffff,0xff5ad0],blendMode:'ADD',emitting:false}).setDepth(30);
  this.big=KIT.text(this,W/2,H*.4,'',36,'#fff','#3a2a9a').setDepth(50).setAlpha(0);
  this.pb=[];this.eb=[];this.en=[];this.caps=[];this.boss=null;
  this.input.on('pointerdown',p=>{this.lp={x:p.x/R,y:p.y/R}});
  this.input.on('pointermove',p=>{if(!p.isDown||!this.lp||this.mode!=='play'||this.paused)return;const x=p.x/R,y=p.y/R;this.sx=clamp(this.sx+(x-this.lp.x)*1.3,16,W-16);this.sy=clamp(this.sy+(y-this.lp.y)*1.3,90,H-40);this.lp={x,y}});
  this.input.on('pointerup',()=>this.lp=null);
  this.keys=this.input.keyboard.addKeys('LEFT,RIGHT,UP,DOWN,B');
  $('bomb').onclick=e=>{e.stopPropagation();this.useBomb()};
  this.ui=KIT.shell({S,SV,start:()=>this.start(),home:()=>this.home(),pause:on=>this.paused=on});
  this.home()}
 mk(){const t=(k,w,h,f)=>KIT.tex(this,k,w,h,f),rr=KIT.rr;
  t('bg',W,H,x=>{const g=x.createLinearGradient(0,0,0,H);g.addColorStop(0,'#0b0824');g.addColorStop(.5,'#1d1150');g.addColorStop(1,'#0a1a3a');x.fillStyle=g;x.fillRect(0,0,W,H);
   [[90,180,120,'rgba(255,90,208,.18)'],[330,420,150,'rgba(90,160,255,.16)'],[150,H-200,130,'rgba(120,255,200,.10)']].forEach(([a,b,r,c])=>{const q=x.createRadialGradient(a,b,0,a,b,r);q.addColorStop(0,c);q.addColorStop(1,'rgba(0,0,0,0)');x.fillStyle=q;x.fillRect(0,0,W,H)});
   x.fillStyle='#ffb86a';x.beginPath();x.arc(350,120,26,0,7);x.fill();x.strokeStyle='rgba(255,220,180,.6)';x.lineWidth=4;x.beginPath();x.ellipse(350,120,44,10,-.3,0,7);x.stroke()});
  t('ship',44,48,x=>{x.shadowColor='#7ff3ff';x.shadowBlur=8;x.fillStyle='#e8f4ff';x.beginPath();x.moveTo(22,2);x.quadraticCurveTo(31,14,30,34);x.lineTo(14,34);x.quadraticCurveTo(13,14,22,2);x.fill();x.shadowBlur=0;
   x.fillStyle='#5aa9ff';x.beginPath();x.moveTo(14,22);x.lineTo(2,38);x.lineTo(4,44);x.lineTo(15,36);x.fill();x.beginPath();x.moveTo(30,22);x.lineTo(42,38);x.lineTo(40,44);x.lineTo(29,36);x.fill();
   x.fillStyle='#ff5ad0';x.beginPath();x.ellipse(22,16,4,6,0,0,7);x.fill();x.fillStyle='#fff';x.beginPath();x.ellipse(21,14,1.5,2.5,0,0,7);x.fill();x.fillStyle='#ffd23a';x.fillRect(17,34,10,4)});
  t('shield',64,64,x=>{x.strokeStyle='rgba(120,240,255,.8)';x.lineWidth=3;x.shadowColor='#7ff3ff';x.shadowBlur=10;x.beginPath();x.arc(32,32,27,0,7);x.stroke();x.fillStyle='rgba(120,240,255,.12)';x.fill()});
  t('pb',8,20,x=>{x.shadowColor='#7ff3ff';x.shadowBlur=6;x.fillStyle='#d0fbff';rr(x,2,2,4,16,2);x.fill()});
  t('ebul',14,14,x=>{x.shadowColor='#ff4fa0';x.shadowBlur=6;x.fillStyle='#ff6fb8';x.beginPath();x.arc(7,7,4.5,0,7);x.fill();x.fillStyle='#fff';x.beginPath();x.arc(7,7,2,0,7);x.fill()});
  const ufo=(k,w,c1,c2)=>t(k,w+8,w*.7+8,x=>{const cx=(w+8)/2,cy=(w*.7+8)/2+3;x.shadowColor=c1;x.shadowBlur=6;x.fillStyle=c1;x.beginPath();x.ellipse(cx,cy,w/2,w*.18,0,0,7);x.fill();x.shadowBlur=0;x.fillStyle='rgba(200,255,255,.85)';x.beginPath();x.ellipse(cx,cy-w*.12,w*.24,w*.2,0,Math.PI,0);x.fill();
   x.fillStyle=c2;for(let i=-2;i<=2;i++){x.beginPath();x.arc(cx+i*w*.17,cy+1,w*.04,0,7);x.fill()}x.fillStyle='#3a2a5a';x.beginPath();x.arc(cx-w*.07,cy-w*.16,w*.035,0,7);x.arc(cx+w*.07,cy-w*.16,w*.035,0,7);x.fill()});
  ufo('ea',32,'#6fe07a','#fff7a0');ufo('eb',42,'#ff7a5a','#ffe07a');ufo('ec',32,'#b07aff','#7ff3ff');ufo('boss',150,'#ff5ad0','#ffe07a');
  t('rock',50,50,x=>{x.fillStyle='#8a7a9a';x.beginPath();for(let i=0;i<9;i++){const a=i/9*Math.PI*2,r=20+((i*7)%5);x.lineTo(25+Math.cos(a)*r,25+Math.sin(a)*r)}x.closePath();x.fill();x.fillStyle='#6a5a7a';[[18,20,5],[31,30,4],[28,15,3]].forEach(([a,b,r])=>{x.beginPath();x.arc(a,b,r,0,7);x.fill()})});
  const cap=(k,c,s)=>t(k,30,30,x=>{x.shadowColor=c;x.shadowBlur=8;x.fillStyle=c;x.beginPath();x.arc(15,15,11,0,7);x.fill();x.shadowBlur=0;x.fillStyle='#fff';x.font='15px Jua, sans-serif';x.textAlign='center';x.textBaseline='middle';x.fillText(s,15,16)});
  cap('cP','#ffd23a','⭐');cap('cS','#45d8ff','🛡');cap('cB','#ff5a5a','💣');cap('cH','#ff7eb3','♥')}
 home(){this.mode='home';this.clearAll();this.ship.setVisible(false);this.shield.setVisible(false);$('bossbar').style.display='none';this.ui.best(`🏆 최고 ${S.best.toLocaleString()} · ${S.wave}파도`);this.ui.sc('home');BGM.play('calm')}
 clearAll(){[...this.pb,...this.eb,...this.en,...this.caps].forEach(o=>o.img.destroy());this.pb=[];this.eb=[];this.en=[];this.caps=[];if(this.boss){this.boss.img.destroy();this.boss=null}}
 start(){this.clearAll();this.mode='play';this.paused=false;this.score=0;this.lives=3;this.wl=1;this.bombs=1;this.inv=2;this.shieldOn=false;this.wave=0;this.fireT=0;this.sx=W/2;this.sy=H-120;
  this.ship.setVisible(true).setPosition(this.sx,this.sy);this.ui.sc(null);this.hud();BGM.play('play');this.nextWave()}
 hud(){this.ui.hud(this.wave+'파도',this.score.toLocaleString(),'♥'.repeat(Math.max(0,this.lives)));$('bombN').textContent=this.bombs}
 show(t){this.big.setText(t).setAlpha(0).setScale(.5);this.tweens.killTweensOf(this.big);this.tweens.add({targets:this.big,alpha:1,scale:1,duration:300,ease:'Back.easeOut',yoyo:true,hold:900})}
 nextWave(){this.wave++;this.hud();if(this.wave>S.wave){S.wave=this.wave;SV.put()}
  if(this.wave%5===0){this.show(`⚠️ 보스 등장!`);BGM.play('boss');AU.sfx('roar');this.time.delayedCall(1200,()=>this.spawnBoss());return}
  this.show(`${this.wave}파도`);if(this.wave%5===1&&this.wave>1)BGM.play('play');
  const n=6+Math.min(14,this.wave*2),pat=this.wave%4;this.toSpawn=[];
  for(let i=0;i<n;i++){const k=this.wave<2?'a':Math.random()<.18+this.wave*.02?'b':Math.random()<.35?'c':Math.random()<.15?'rock':'a';
   const x=pat===0?50+(i%8)*45:pat===1?W/2+Math.sin(i*.9)*150:pat===2?(i%2?80:W-80):rnd(40,W-40);this.toSpawn.push({k,x,t:i*(pat===3?.35:.28)+.8})}
  this.spawnT=0}
 spawn(k,x){const e=ETYPE[k],hp=Math.ceil(e.hp*(1+this.wave*.08));const o={k,x,y:-30,hp,max:hp,r:e.r,t:0,ph:rnd(0,6),vy:k==='rock'?rnd(60,90):80+this.wave*3,fire:rnd(1,2.5),img:this.add.image(x,-30,e.tex).setScale(1/R).setDepth(10)};this.en.push(o)}
 spawnBoss(){if(this.mode!=='play')return;const hp=80+this.wave*14;this.boss={x:W/2,y:-80,hp,max:hp,r:62,t:0,ph:0,img:this.add.image(W/2,-80,'boss').setScale(1/R).setDepth(11)};$('bossbar').style.display='block';$('bossfill').style.width='100%'}
 shoot(){const x=this.sx,y=this.sy-22,L=this.wl;const add=(dx,a)=>{const s=760;this.pb.push({x:x+dx,y,vx:Math.sin(a)*s,vy:-Math.cos(a)*s,img:this.add.image(x+dx,y,'pb').setScale(1/R).setDepth(15).setRotation(a)})};
  if(L===1)add(0,0);else if(L===2){add(-7,0);add(7,0)}else if(L===3){add(0,0);add(-8,-.13);add(8,.13)}else if(L===4){add(-6,0);add(6,0);add(-10,-.2);add(10,.2)}else{add(0,0);add(-6,-.1);add(6,.1);add(-10,-.25);add(10,.25)}
  AU.tone(1100,.03,'square',.012,0,1500)}
 ebShoot(x,y,a,s){this.eb.push({x,y,vx:Math.cos(a)*s,vy:Math.sin(a)*s,img:this.add.image(x,y,'ebul').setScale(1/R).setDepth(16)})}
 aimAt(x,y){return Math.atan2(this.sy-y,this.sx-x)}
 hitEnemy(e,d){e.hp-=d;if(!e.fl){e.fl=1;e.img.setTintFill(0xffffff);this.time.delayedCall(50,()=>{e.fl=0;e.img.active&&e.img.clearTint()})}if(e.hp<=0&&!e.dead){e.dead=1;this.kill(e)}}
 kill(e){const pts=ETYPE[e.k].pts;this.score+=pts;this.boom.explode(e.k==='b'||e.k==='rock'?18:10,e.x,e.y);AU.sfx('kill');this.hud();
  const r=Math.random();const c=r<.09?'cP':r<.12?'cS':r<.145?'cB':r<.16?'cH':null;if(c)this.caps.push({k:c,x:e.x,y:e.y,img:this.add.image(e.x,e.y,c).setScale(1/R).setDepth(14)})}
 useBomb(){if(this.mode!=='play'||this.paused||this.bombs<=0)return;this.bombs--;this.hud();AU.sfx('boom');this.cameras.main.flash(300,255,240,200);this.cameras.main.shake(300,.012);
  this.eb.forEach(b=>b.dead=1);this.en.forEach(e=>{this.hitEnemy(e,20)});if(this.boss)this.hitBoss(25)}
 hitBoss(d){const b=this.boss;b.hp-=d;if(!b.fl){b.fl=1;b.img.setTint(0xffb0d0);this.time.delayedCall(60,()=>{b.fl=0;b.img.active&&b.img.clearTint()})}$('bossfill').style.width=Math.max(0,b.hp/b.max*100)+'%';
  if(b.hp<=0){this.score+=500+this.wave*50;this.hud();for(let i=0;i<6;i++)this.time.delayedCall(i*120,()=>{this.boom.explode(25,b.x+rnd(-60,60),b.y+rnd(-30,30));AU.sfx('boom')});
   this.cameras.main.shake(600,.015);this.caps.push({k:'cP',x:b.x-30,y:b.y,img:this.add.image(b.x-30,b.y,'cP').setScale(1/R).setDepth(14)},{k:'cH',x:b.x+30,y:b.y,img:this.add.image(b.x+30,b.y,'cH').setScale(1/R).setDepth(14)});
   this.tweens.add({targets:b.img,alpha:0,scale:1.3/R,duration:700,onComplete:()=>b.img.destroy()});this.boss=null;$('bossbar').style.display='none';this.time.delayedCall(1800,()=>{if(this.mode==='play')this.nextWave()})}}
 hurt(){if(this.inv>0)return;if(this.shieldOn){this.shieldOn=false;this.shield.setVisible(false);this.inv=1;AU.sfx('zap');return}
  this.lives--;this.inv=2;this.wl=Math.max(1,this.wl-1);AU.sfx('hurt');this.cameras.main.shake(250,.012);this.boom.explode(20,this.sx,this.sy);this.hud();if(this.lives<=0)this.over()}
 power(k){AU.sfx('heal');const m={cP:'⭐ 총 강화!',cS:'🛡️ 방패!',cB:'💣 폭탄 +1',cH:'♥ +1'}[k];KIT.floatText(this,this.sx,this.sy-30,m,'#fff',20,60);
  if(k==='cP'){if(this.wl<5)this.wl++;else this.score+=100}if(k==='cS'){this.shieldOn=true;this.shield.setVisible(true)}if(k==='cB')this.bombs=Math.min(3,this.bombs+1);if(k==='cH')this.lives=Math.min(5,this.lives+1);this.hud()}
 update(t,dl){const dt=Math.min(dl/1000,.05);for(const s of this.stars){s.y+=s.v*dt*(this.mode==='play'?1.5:.6);if(s.y>H)s.y-=H;s.s.setPosition(s.x,s.y)}
  if(this.mode!=='play'||this.paused)return;const k=this.keys;
  if(k.LEFT.isDown)this.sx-=330*dt;if(k.RIGHT.isDown)this.sx+=330*dt;if(k.UP.isDown)this.sy-=330*dt;if(k.DOWN.isDown)this.sy+=330*dt;if(Phaser.Input.Keyboard.JustDown(k.B))this.useBomb();this.sx=clamp(this.sx,16,W-16);this.sy=clamp(this.sy,90,H-40);
  this.ship.x+=(this.sx-this.ship.x)*Math.min(1,dt*25);this.ship.y+=(this.sy-this.ship.y)*Math.min(1,dt*25);this.ship.setAlpha(this.inv>0&&Math.floor(t/80)%2?.35:1);this.shield.setPosition(this.ship.x,this.ship.y);
  this.flame.emitParticleAt(this.ship.x,this.ship.y+22,1);if(this.inv>0)this.inv-=dt;
  if((this.fireT-=dt)<=0){this.fireT=.13;this.shoot()}
  // 적 등장
  if(this.toSpawn){this.spawnT+=dt;while(this.toSpawn.length&&this.toSpawn[0].t<=this.spawnT){const s=this.toSpawn.shift();this.spawn(s.k,s.x)}}
  // 적 움직임
  for(const e of this.en){e.t+=dt;if(e.k==='a'){e.y+=e.vy*dt;e.x+=Math.sin(e.t*2+e.ph)*60*dt}else if(e.k==='b'){e.y+=(e.y<160?e.vy:12)*dt;e.x+=Math.sin(e.t*1.2+e.ph)*50*dt;if(e.t>8)e.y+=e.vy*dt}
   else if(e.k==='c'){if(e.t<1.2)e.y+=e.vy*dt;else{const a=Math.atan2(this.sy-e.y,this.sx-e.x);if(!e.dive){e.dive=1;e.dx=Math.cos(a);e.dy=Math.sin(a)}e.x+=e.dx*230*dt;e.y+=Math.max(.3,e.dy)*230*dt}}
   else{e.y+=e.vy*dt;e.img.rotation+=dt}
   e.x=clamp(e.x,10,W-10);e.img.setPosition(e.x,e.y);
   if(e.k!=='rock'&&e.y>40&&e.y<H*.6&&(e.fire-=dt)<=0){e.fire=e.k==='b'?rnd(1.2,2):rnd(2.5,4.5)/(1+this.wave*.05);const a=this.aimAt(e.x,e.y);this.ebShoot(e.x,e.y+10,a,170+this.wave*4);if(e.k==='b'){this.ebShoot(e.x,e.y+10,a-.25,170);this.ebShoot(e.x,e.y+10,a+.25,170)}}
   if(Math.hypot(e.x-this.sx,e.y-this.sy)<e.r+12){this.hurt();this.hitEnemy(e,99)}
   if(e.y>H+40)e.gone=1}
  // 보스
  const b=this.boss;if(b){b.t+=dt;if(b.y<130)b.y+=60*dt;else{b.x=W/2+Math.sin(b.t*.7)*(W/2-90);b.ph+=dt;
    if(b.ph>1.6){b.ph=0;const m=Math.floor(b.t/1.6)%3;if(m===0)for(let i=0;i<14;i++)this.ebShoot(b.x,b.y+20,i/14*Math.PI*2+b.t,150);else if(m===1){const a=this.aimAt(b.x,b.y);for(let i=-2;i<=2;i++)this.ebShoot(b.x,b.y+30,a+i*.15,210)}else{this.spawn('a',b.x-60);this.spawn('a',b.x+60);this.en.slice(-2).forEach(e=>e.y=b.y)}AU.tone(200,.15,'sawtooth',.05,0,120)}}
   b.img.setPosition(b.x,b.y+Math.sin(t/300)*4);if(Math.hypot(b.x-this.sx,b.y-this.sy)<b.r)this.hurt()}
  // 내 총알
  for(const p of this.pb){p.x+=p.vx*dt;p.y+=p.vy*dt;p.img.setPosition(p.x,p.y);if(p.y<-20)p.dead=1;
   for(const e of this.en){if(!e.dead&&Math.hypot(e.x-p.x,e.y-p.y)<e.r+4){p.dead=1;this.hitEnemy(e,1);break}}
   if(!p.dead&&this.boss&&Math.abs(p.x-this.boss.x)<70&&Math.abs(p.y-this.boss.y)<34){p.dead=1;this.hitBoss(1);if(Math.random()<.3)this.boom.explode(2,p.x,p.y)}}
  // 적 총알
  for(const q of this.eb){q.x+=q.vx*dt;q.y+=q.vy*dt;q.img.setPosition(q.x,q.y);if(q.y>H+20||q.y<-30||q.x<-20||q.x>W+20)q.dead=1;if(!q.dead&&Math.hypot(q.x-this.sx,q.y-this.sy)<(this.shieldOn?24:9)){q.dead=1;this.hurt()}}
  for(const c of this.caps){c.y+=110*dt;c.img.setPosition(c.x,c.y+Math.sin(t/150)*2);if(Math.hypot(c.x-this.sx,c.y-this.sy)<30){c.dead=1;this.power(c.k)}if(c.y>H+20)c.dead=1}
  const sweep=a=>a.filter(o=>{if(o.dead||o.gone){if(o.img&&!o.keep)o.img.destroy();return false}return true});
  this.en=this.en.filter(e=>{if(e.dead||e.gone){e.img.destroy();return false}return true});this.pb=sweep(this.pb);this.eb=sweep(this.eb);this.caps=sweep(this.caps);
  if(this.mode==='play'&&!this.boss&&this.wave%5!==0&&this.toSpawn&&!this.toSpawn.length&&!this.en.length){this.toSpawn=null;this.time.delayedCall(900,()=>{if(this.mode==='play')this.nextWave()})}}
 over(){this.mode='over';AU.sfx('lose');BGM.stop();S.games++;const nb=this.score>S.best;if(nb)S.best=this.score;SV.put();this.ship.setVisible(false);this.shield.setVisible(false);$('bossbar').style.display='none';this.boom.explode(40,this.sx,this.sy);
  this.time.delayedCall(900,()=>this.ui.result(nb?'🎉 새 최고 기록!':'💥 우주선이 부서졌어요',`<div class="rline">점수 <b>${this.score.toLocaleString()}</b></div><div class="rline" style="font-size:18px">${this.wave}파도까지 · 🏆 최고 ${S.best.toLocaleString()}</div>`,nb))}
}
KIT.boot(Main,{W,H,bg:'#0b0824'});
})();
