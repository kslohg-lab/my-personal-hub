/* 동물 친구 서바이벌 — 몰려오는 장난꾸러기를 5분 동안 막는 생존 게임 (탕탕특공대·뱀서 방식)
   조작: 화면 아무 데나 누르고 끌면 움직여요(공격은 자동). 저장: localStorage 'animalSurvivorV1' */
(()=>{'use strict';
const {R,rnd,pick,clamp,$,IMG,AU,BGM}=KIT;
const SZ=KIT.size(420,680,940),W=SZ.W,H=SZ.H;
const HEROES=[{c:0,n:'하트몽',w:'heart',d:'하트 발사로 시작'},{c:1,n:'포롱',w:'orbit',d:'빙글빙글 별로 시작'},{c:2,n:'멍코',w:'apple',d:'사과 폭탄으로 시작'},{c:3,n:'용기',w:'zap',d:'번개로 시작'},{c:4,n:'우정이',w:'aura',d:'꽃가루 오라 · 체력 +20',hp:20},{c:7,n:'믿음',w:'fairy',d:'요정 친구와 함께'}];
const WP={
 heart:{n:'하트 발사',ic:'💗',d:['가까운 적에게 하트를 쏴요','하트가 더 세져요','하트 2개씩!','하트가 적을 뚫고 지나가요','하트 3개씩, 더 빠르게!']},
 orbit:{n:'빙글빙글 별',ic:'⭐',d:['별 2개가 내 주위를 돌아요','별이 더 세져요','별 3개!','별 4개, 더 넓게!','별 5개, 아주 빠르게!']},
 zap:{n:'번개',ic:'⚡',d:['아무 적에게나 번개가 떨어져요','번개 2개!','번개가 더 세져요','번개 3개!','번개 4개, 더 자주!']},
 aura:{n:'꽃가루 오라',ic:'🌸',d:['내 주위 적이 계속 아파해요','오라가 넓어져요','오라가 더 세져요','더 넓고 세게!','최대 오라!']},
 apple:{n:'사과 폭탄',ic:'🍎',d:['사과를 던져 펑! 터뜨려요','폭발이 커져요','사과 2개!','더 세게, 더 자주!','사과 3개!']},
 fairy:{n:'요정 친구',ic:'🧚',d:['요정이 따라다니며 마법을 쏴요','마법이 세져요','마법 2발!','더 자주 쏴요','마법 3발!']},
 spd:{n:'날쌘 운동화',ic:'👟',d:['이동 속도 +8%'],p:1},hp:{n:'하트 쿠키',ic:'🍪',d:['최대 체력 +20, 체력 회복'],p:1},mag:{n:'자석',ic:'🧲',d:['보석을 더 멀리서 끌어와요'],p:1},
 cd:{n:'모래시계',ic:'⏳',d:['공격이 7% 더 자주'],p:1},pow:{n:'힘센 장갑',ic:'🥊',d:['공격력 +12%'],p:1},regen:{n:'사과나무',ic:'🌳',d:['체력이 조금씩 차올라요'],p:1}};
const ET={acorn:{hp:9,sp:52,dmg:7,xp:1,sz:34},mush:{hp:16,sp:46,dmg:8,xp:1,sz:40},bird:{hp:7,sp:92,dmg:6,xp:1,sz:34},water:{hp:20,sp:58,dmg:8,xp:2,sz:36},fire:{hp:22,sp:64,dmg:10,xp:2,sz:38},rock:{hp:55,sp:36,dmg:12,xp:3,sz:48},boar:{hp:34,sp:72,dmg:11,xp:3,sz:46},meteor:{hp:40,sp:80,dmg:12,xp:3,sz:40}};
const BOSS=[{t:90,i:1,n:'불꽃 여우',hp:700},{t:180,i:6,n:'바위 고릴라',hp:1700},{t:270,i:10,n:'그림자 대마왕',hp:3600,final:1}];
const RUN=300;
const SV=KIT.save('animalSurvivorV1',()=>({best:0,bestKills:0,clears:0,hero:0,snd:1,games:0}));const S=SV.data;AU.on=BGM.on=!!S.snd;

class Boot extends Phaser.Scene{constructor(){super('boot')}
 preload(){this.load.on('progress',v=>$('lbar').style.width=Math.round(v*100)+'%');HEROES.forEach(h=>this.load.image('ch'+h.c,IMG+'ch/'+KIT.pad2(h.c)+'.webp'));
  Object.keys(ET).forEach(k=>this.load.image(k,IMG+'ob/'+k+'.webp'));BOSS.forEach(b=>this.load.image('boss'+b.i,IMG+'boss/'+KIT.pad2(b.i)+'.webp'));
  ['apple','star','fairy','magnet','bolt'].forEach(k=>this.load.image('it_'+k,IMG+'it/'+k+'.webp'));['t0_bush','t0_deco','t0_tree','t2_deco'].forEach(k=>this.load.image(k,IMG+'bg/'+k+'.webp'))}
 create(){KIT.fontReady().then(()=>this.scene.start('main'))}}

class Main extends Phaser.Scene{constructor(){super('main')}
 create(){window.__sv=this;KIT.textures(this);this.mkTex();
  this.wl=this.add.layer();this.hl=this.add.layer();
  const cam=this.cameras.main;cam.setZoom(R);this.uic=this.cameras.add(0,0,W*R,H*R).setZoom(R);this.uic.centerOn(W/2,H/2);cam.ignore(this.hl);this.uic.ignore(this.wl);
  this.ground=this.W(this.add.tileSprite(0,0,W+128,H+128,'grass').setOrigin(0));
  this.hero=this.W(this.add.image(0,0,'ch0').setDepth(50));this.heroSh=this.W(this.add.image(0,0,'shadow').setAlpha(.25).setDepth(5));
  this.hpG=this.W(this.add.graphics().setDepth(60));this.auraG=this.W(this.add.graphics().setDepth(4));
  const P=(tex,cfg,d)=>this.W(this.add.particles(0,0,tex,Object.assign({emitting:false},cfg)).setDepth(d||70));
  this.emPuff=P('dot',{lifespan:420,speed:{min:40,max:160},scale:{start:.9,end:0},alpha:{start:.9,end:0},tint:[0xffffff,0xffe6f2]});
  this.emSpark=P('spark',{lifespan:500,speed:{min:60,max:220},scale:{start:.8,end:0},rotate:{min:0,max:360},tint:[0xfff27a,0xffffff,0xffb3d9]});
  this.emBoom=P('dot',{lifespan:600,speed:{min:120,max:340},scale:{start:1.4,end:0},alpha:{start:1,end:0},tint:[0xffd25a,0xff8a5a,0xffffff]});
  // HUD
  this.H_=o=>{this.hl.add(o);return o};
  this.xpG=this.H_(this.add.graphics());this.lvTx=this.H_(KIT.text(this,30,30,'1',20,'#fff','#4a2d5e'));
  this.timeTx=this.H_(KIT.text(this,W/2,40,'0:00',28,'#fff','#4a2d5e'));this.killTx=this.H_(KIT.text(this,W-70,26,'',16,'#fff','#4a2d5e'));
  this.bossG=this.H_(this.add.graphics());this.bossTx=this.H_(KIT.text(this,W/2,82,'',16,'#fff','#4a2d5e'));
  this.joyB=this.H_(this.add.image(0,0,'ring').setAlpha(0).setScale(1));this.joyK=this.H_(this.add.image(0,0,'dot').setAlpha(0).setScale(2.6).setTint(0xffffff));
  this.warnTx=this.H_(KIT.text(this,W/2,H*.32,'',30,'#ffe066','#c0406a').setAlpha(0));
  // 입력
  this.input.addPointer(1);this.keys=this.input.keyboard?this.input.keyboard.addKeys('W,A,S,D,UP,DOWN,LEFT,RIGHT'):null;
  this.input.on('pointerdown',p=>{AU.init();if(this.mode!=='play')return;this.joy={id:p.id,x:p.x/R,y:p.y/R,dx:0,dy:0};this.joyB.setPosition(this.joy.x,this.joy.y).setAlpha(.5);this.joyK.setPosition(this.joy.x,this.joy.y).setAlpha(.8)});
  this.input.on('pointermove',p=>{const j=this.joy;if(!j||j.id!==p.id)return;let dx=p.x/R-j.x,dy=p.y/R-j.y;const m=Math.hypot(dx,dy),mx=44;if(m>mx){dx*=mx/m;dy*=mx/m}j.dx=dx/mx;j.dy=dy/mx;this.joyK.setPosition(j.x+dx,j.y+dy)});
  this.input.on('pointerup',p=>{if(this.joy&&this.joy.id===p.id){this.joy=null;this.joyB.setAlpha(0);this.joyK.setAlpha(0)}});
  this.dmgN=0;this.mode='home';this.bindUI();$('load').style.display='none';KIT.fitUI(W);addEventListener('resize',()=>setTimeout(()=>KIT.fitUI(W),60));this.scale.on('resize',()=>setTimeout(()=>KIT.fitUI(W),30));
  this.decor=new Map();this.home();
 }
 W(o){this.wl.add(o);return o}
 mkTex(){let c=this.textures.createCanvas('grass',128,128),x=c.getContext();x.fillStyle='#9fdc84';x.fillRect(0,0,128,128);
  x.fillStyle='#8fd174';for(let i=0;i<26;i++){const a=(i*53)%128,b=(i*97)%128;x.beginPath();x.ellipse(a,b,7,3,0,0,7);x.fill()}
  x.fillStyle='#b4e89a';for(let i=0;i<14;i++){const a=(i*71+20)%128,b=(i*37+9)%128;x.beginPath();x.arc(a,b,2.5,0,7);x.fill()}
  x.fillStyle='#ffffff';[[20,30],[90,100],[60,70]].forEach(([a,b])=>{for(let k=0;k<5;k++){x.beginPath();x.arc(a+Math.cos(k*1.26)*3,b+Math.sin(k*1.26)*3,2,0,7);x.fill()}x.fillStyle='#ffd23f';x.beginPath();x.arc(a,b,1.6,0,7);x.fill();x.fillStyle='#ffffff'});c.refresh();
  c=this.textures.createCanvas('heart',32,32);x=c.getContext();x.fillStyle='#ff5c9a';x.beginPath();x.moveTo(16,28);x.bezierCurveTo(-6,14,6,-4,16,8);x.bezierCurveTo(26,-4,38,14,16,28);x.fill();x.fillStyle='rgba(255,255,255,.7)';x.beginPath();x.ellipse(10,10,3.5,2.2,-.6,0,7);x.fill();c.refresh();
  c=this.textures.createCanvas('gem',20,24);x=c.getContext();x.fillStyle='#ffffff';x.beginPath();x.moveTo(10,0);x.lineTo(20,9);x.lineTo(10,24);x.lineTo(0,9);x.closePath();x.fill();x.fillStyle='rgba(255,255,255,.6)';x.beginPath();x.moveTo(10,2);x.lineTo(15,9);x.lineTo(10,9);x.closePath();x.fill();c.refresh();
  c=this.textures.createCanvas('ring',96,96);x=c.getContext();x.strokeStyle='rgba(255,255,255,.9)';x.lineWidth=5;x.beginPath();x.arc(48,48,44,0,7);x.stroke();x.fillStyle='rgba(255,255,255,.15)';x.fill();c.refresh();
  c=this.textures.createCanvas('magic',24,24);x=c.getContext();const g=x.createRadialGradient(12,12,1,12,12,12);g.addColorStop(0,'#fff');g.addColorStop(.4,'#d8a8ff');g.addColorStop(1,'rgba(180,120,255,0)');x.fillStyle=g;x.fillRect(0,0,24,24);c.refresh();
  c=this.textures.createCanvas('chest',40,34);x=c.getContext();x.fillStyle='#b8743c';x.fillRect(2,10,36,22);x.fillStyle='#d99a55';x.fillRect(2,4,36,10);x.fillStyle='#ffd25a';x.fillRect(17,10,6,9);x.strokeStyle='#7a4a22';x.lineWidth=2;x.strokeRect(2,4,36,28);c.refresh()}
 /* ---- 화면 ---- */
 bindUI(){const sc=id=>{document.querySelectorAll('.scr').forEach(e=>e.classList.toggle('on',e.id===id));$('pbtn').style.display=id===null?'block':'none';$('sbtn').style.display=id==='home'?'block':'none'};this.sc=sc;
  $('bGo').onclick=()=>{AU.init();AU.sfx('click');this.start()};
  $('sbtn').onclick=()=>{S.snd=S.snd?0:1;AU.on=BGM.on=!!S.snd;SV.put();$('sbtn').textContent=S.snd?'🔊':'🔇';AU.init();AU.sfx('click')};$('sbtn').textContent=S.snd?'🔊':'🔇';
  $('pbtn').onclick=()=>this.pause();$('pGo').onclick=()=>{AU.sfx('click');this.mode='play';sc(null)};$('pHome').onclick=()=>{AU.sfx('click');this.home()};
  $('rRe').onclick=()=>{AU.sfx('click');this.start()};$('rHome').onclick=()=>{AU.sfx('click');this.home()};
  document.addEventListener('visibilitychange',()=>{if(document.hidden&&this.mode==='play')this.pause()})}
 pause(){if(this.mode!=='play')return;AU.sfx('click');this.mode='pause';this.joy=null;this.joyB.setAlpha(0);this.joyK.setAlpha(0);
  $('pInfo').innerHTML=Object.entries(this.lv).map(([k,v])=>`${WP[k].ic} ${WP[k].n} Lv${v}`).join('<br>');this.sc('pause')}
 home(){this.clearWorld();this.cameras.main.stopFollow();this.mode='home';this.sc('home');BGM.play('play');
  const hs=$('heroes');hs.innerHTML='';HEROES.forEach((h,i)=>{const b=document.createElement('button');b.className='hc'+(S.hero===i?' sel':'');b.innerHTML=`<img src="${IMG}ch/${KIT.pad2(h.c)}.webp" alt="">${h.n}<small>${WP[h.w].ic} ${h.d}</small>`;b.onclick=()=>{AU.init();AU.sfx('pick');S.hero=i;SV.put();this.home()};hs.appendChild(b)});
  $('hb').textContent=S.best?`🏆 최고 ${this.fmt(S.best)} 버팀 · 👾 ${S.bestKills}마리`+(S.clears?` · 클리어 ${S.clears}번`:''):'🏆 아직 기록이 없어요';
  this.px=0;this.py=0;this.hero.setTexture('ch'+HEROES[S.hero].c);this.hero.setScale(58/this.hero.frame.height);this.hero.setVisible(true);this.cameras.main.centerOn(0,40);this.hpG.clear();this.hudVis(false)}
 hudVis(v){[this.xpG,this.lvTx,this.timeTx,this.killTx,this.bossG,this.bossTx].forEach(o=>o.setVisible(v))}
 clearWorld(){['en','pj','gems','eb','items'].forEach(k=>{(this[k]||[]).forEach(o=>o.s&&o.s.destroy());this[k]=[]});(this.orbs||[]).forEach(o=>o.destroy());this.orbs=[];if(this.fairyS){this.fairyS.destroy();this.fairyS=null}this.auraG.clear();this.bossG.clear();this.bossTx.setText('');this.boss=null}
 start(){this.clearWorld();const h=HEROES[S.hero];this.heroDef=h;
  Object.assign(this,{mode:'play',t:0,px:0,py:0,hp:100+(h.hp||0),maxhp:100+(h.hp||0),xp:0,level:1,need:5,kills:0,inv:0,face:1,spawnAcc:0,nextBoss:0,nextElite:50,wave:{45:0,120:0,210:0},lastHurt:0,pendingLv:0});
  this.lv={};this.lv[h.w]=1;this.cdT={};this.hero.setTexture('ch'+h.c);this.hero.setScale(58/this.hero.frame.height).setVisible(true).setAlpha(1).clearTint();this.hs=this.hero.scaleX;
  this.cameras.main.startFollow(this.hero,true,.12,.12);this.hudVis(true);this.sc(null);BGM.play('play');S.games++;SV.put();
  this.warn('출발! 끌어서 움직여요 👆',1.8);this.drawXP()}
 ft(x,y,str,col){const t=this.W(KIT.text(this,x,y,str,22,col||'#fff').setDepth(95));this.tweens.add({targets:t,y:y-40,alpha:0,duration:800,onComplete:()=>t.destroy()})}
 fmt(s){s=Math.floor(s);return Math.floor(s/60)+':'+String(s%60).padStart(2,'0')}
 warn(t,d){this.warnTx.setText(t).setAlpha(1).setScale(.6);this.tweens.killTweensOf(this.warnTx);this.tweens.add({targets:this.warnTx,scale:1,duration:300,ease:'Back.easeOut'});this.tweens.add({targets:this.warnTx,alpha:0,duration:400,delay:(d||1.5)*1000})}
 /* ---- 매 프레임 ---- */
 update(time,dl){const dt=Math.min(dl/1000,1/25),cam=this.cameras.main,v=cam.worldView;
  this.ground.setPosition(Math.floor(v.x/128)*128-64,Math.floor(v.y/128)*128-64);this.decorUpd(v);
  if(this.mode==='home'){this.t=(this.t||0)+dt;this.hero.setPosition(0,Math.sin(this.t*3)*6);this.heroSh.setPosition(0,30);return}
  if(this.mode!=='play'){return}
  this.t+=dt;
  // 이동
  let mx=0,my=0;if(this.joy){mx=this.joy.dx;my=this.joy.dy}if(this.keys){const k=this.keys;if(k.A.isDown||k.LEFT.isDown)mx=-1;if(k.D.isDown||k.RIGHT.isDown)mx=1;if(k.W.isDown||k.UP.isDown)my=-1;if(k.S.isDown||k.DOWN.isDown)my=1}
  const m=Math.hypot(mx,my);if(m>1){mx/=m;my/=m}const sp=150*(1+.08*(this.lv.spd||0));this.px+=mx*sp*dt;this.py+=my*sp*dt;
  if(mx<-.1)this.face=-1;else if(mx>.1)this.face=1;const moving=m>.15;
  this.hero.setPosition(this.px,this.py-(moving?Math.abs(Math.sin(this.t*14))*5:0)).setFlipX(this.face<0).setRotation(moving?Math.sin(this.t*14)*.07:0);this.heroSh.setPosition(this.px,this.py+28);
  this.hero.setAlpha(this.inv>0?(Math.floor(this.t*16)%2?.4:1):1);if(this.inv>0)this.inv-=dt;
  if(this.lv.regen)this.hp=Math.min(this.maxhp,this.hp+this.lv.regen*.5*dt);
  this.spawn(dt);this.weapons(dt);this.updEnemies(dt);this.updProj(dt);this.updGems(dt);this.drawHUD();
  if(this.hp<=0)this.die()}
 decorUpd(v){const G=360,cx0=Math.floor((v.x-100)/G),cy0=Math.floor((v.y-100)/G),cx1=Math.floor((v.right+100)/G),cy1=Math.floor((v.bottom+100)/G);const keep=new Set();
  for(let cx=cx0;cx<=cx1;cx++)for(let cy=cy0;cy<=cy1;cy++){const k=cx+','+cy;keep.add(k);if(this.decor.has(k))continue;const list=[];let s=Math.abs(cx*7349+cy*1931)%1000;const r=()=>{s=(s*9301+49297)%233280;return s/233280};
   const n=2+Math.floor(r()*3);for(let i=0;i<n;i++){const key=pick(['t0_bush','t0_deco','t0_deco','t0_tree','t2_deco']);const im=this.W(this.add.image(cx*G+r()*G,cy*G+r()*G,key).setOrigin(.5,1).setDepth(key==='t0_tree'?3:2));im.setScale((key==='t0_tree'?95:key==='t0_bush'?40:30)/im.frame.height);if(key==='t0_tree')im.setAlpha(.95);list.push(im)}this.decor.set(k,list)}
  for(const [k,list] of this.decor)if(!keep.has(k)){list.forEach(i=>i.destroy());this.decor.delete(k)}}
 /* ---- 적 ---- */
 spawn(dt){const t=this.t;
  if(this.nextBoss<BOSS.length&&t>=BOSS[this.nextBoss].t){this.spawnBoss(BOSS[this.nextBoss]);this.nextBoss++}
  if(t>=this.nextElite){this.nextElite+=50;this.addEnemy(this.pickType(),true)}
  for(const wt in this.wave){if(!this.wave[wt]&&t>=+wt){this.wave[wt]=1;this.warn('😱 몰려와요!',1.4);AU.sfx('warn');const k=wt==45?'bird':wt==120?'mush':'fire',n=wt==45?14:wt==120?20:24;for(let i=0;i<n;i++){const a=i/n*Math.PI*2;this.addEnemy(k,false,this.px+Math.cos(a)*330,this.py+Math.sin(a)*(H/2+40))}}}
  const rate=(.6+Math.pow(t/RUN,1.25)*6)*(this.boss?.6:1);this.spawnAcc+=rate*dt;
  while(this.spawnAcc>=1){this.spawnAcc--;if(this.en.length<170)this.addEnemy(this.pickType())}}
 pickType(){const t=this.t,L=['acorn'];if(t>25)L.push('mush');if(t>55)L.push('bird');if(t>95)L.push('water');if(t>135)L.push('fire');if(t>170)L.push('rock','boar');if(t>230)L.push('meteor');return pick(L)}
 edgePos(){const v=this.cameras.main.worldView,side=Math.floor(Math.random()*4),pad=50;
  if(side===0)return [rnd(v.x-pad,v.right+pad),v.y-pad];if(side===1)return [rnd(v.x-pad,v.right+pad),v.bottom+pad];if(side===2)return [v.x-pad,rnd(v.y-pad,v.bottom+pad)];return [v.right+pad,rnd(v.y-pad,v.bottom+pad)]}
 addEnemy(k,elite,x,y){if(x==null)[x,y]=this.edgePos();const d=ET[k],sc=1+this.t/200;const s=this.W(this.add.image(x,y,k).setDepth(20));const sz=d.sz*(elite?1.7:1);s.setScale(sz/s.frame.height);
  const e={k,s,x,y,hp:d.hp*sc*(elite?9:1),sp:d.sp*(elite?.8:1)*(1+this.t/900),dmg:d.dmg*(elite?1.5:1),xp:d.xp*(elite?6:1),r:sz*.42,elite,kx:0,ky:0,ph:Math.random()*6,hitT:{}};e.max=e.hp;
  if(elite){s.setTint(0xffe0a0);e.glow=this.W(this.add.image(x,y,'glow').setDepth(19).setTint(0xffd25a).setAlpha(.45).setScale(sz/40))}
  this.en.push(e);return e}
 spawnBoss(b){const [x,y]=this.edgePos();const s=this.W(this.add.image(x,y,'boss'+b.i).setDepth(25));s.setScale(150/s.frame.height);
  const e={k:'boss',s,x,y,hp:b.hp,max:b.hp,sp:46,dmg:18,xp:40,r:52,boss:b,atk:2.5,kx:0,ky:0,ph:0,hitT:{}};this.en.push(e);this.boss=e;
  AU.sfx('roar');this.cameras.main.shake(500,.01);this.warn('⚠️ '+b.n+' 등장!',2);BGM.play('boss')}
 updEnemies(dt){const px=this.px,py=this.py,pr=22;
  for(const e of this.en){if(e.dead)continue;let dx=px-e.x,dy=py-e.y;const d=Math.hypot(dx,dy)||1;dx/=d;dy/=d;
   let sp=e.sp;if(e.k==='bird'){const a=Math.sin(this.t*4+e.ph)*.6;const c=Math.cos(a),s=Math.sin(a);[dx,dy]=[dx*c-dy*s,dx*s+dy*c]}
   if(e.k==='boar'&&!e.boss){e.ph+=dt;if(e.ph%4>3.2)sp*=2.4}
   if(e.boss)this.bossAI(e,dt,dx,dy,d);
   if(e.dash>0){e.dash-=dt;e.x+=e.dvx*dt;e.y+=e.dvy*dt}else{e.x+=dx*sp*dt+e.kx*dt;e.y+=dy*sp*dt+e.ky*dt}
   e.kx*=Math.pow(.02,dt);e.ky*=Math.pow(.02,dt);
   e.s.setPosition(e.x,e.y-Math.abs(Math.sin(this.t*9+e.ph))*3).setFlipX(e.boss&&e.boss.i===1?dx<0:dx>0);
   if(e.glow)e.glow.setPosition(e.x,e.y);
   if(e.flash>0){e.flash-=dt;if(e.flash<=0)e.elite?e.s.setTint(0xffe0a0):e.s.clearTint()}
   if(d<e.r+pr&&this.inv<=0)this.hurt(e.dmg)
   if(d>900&&!e.boss){const [nx,ny]=this.edgePos();e.x=nx;e.y=ny}}
  // 서로 겹치지 않게 살짝 밀기
  if((this.sepF=(this.sepF||0)+1)%2===0){const L=this.en;for(let i=0;i<L.length;i++){const a=L[i];for(let j=i+1;j<L.length;j++){const b=L[j];const dx=b.x-a.x,dy=b.y-a.y,rr=(a.r+b.r)*.8;if(Math.abs(dx)>rr||Math.abs(dy)>rr)continue;const d=Math.hypot(dx,dy)||.1;if(d<rr){const p=(rr-d)/d*.25;if(!a.boss){a.x-=dx*p;a.y-=dy*p}if(!b.boss){b.x+=dx*p;b.y+=dy*p}}}}}
  if(this.en.some(e=>e.dead))this.en=this.en.filter(e=>!e.dead)}
 bossAI(e,dt,dx,dy,d){e.atk-=dt;if(e.atk>0)return;const lvl=e.boss.i;
  if(Math.random()<.5){// 사방으로 불꽃
   const n=lvl>=10?16:lvl>=6?12:9,off=Math.random();for(let i=0;i<n;i++){const a=(i+off)/n*Math.PI*2;this.addEB(e.x,e.y,Math.cos(a)*150,Math.sin(a)*150,lvl>=6?'rock':'fire')}AU.sfx('boom');e.atk=lvl>=10?2.1:2.8}
  else{// 돌진 (빨간 선으로 미리 알려줘요)
   const g=this.W(this.add.graphics().setDepth(8));g.lineStyle(14,0xff4060,.35);g.lineBetween(e.x,e.y,e.x+dx*420,e.y+dy*420);AU.sfx('warn');e.atk=99;
   this.time.delayedCall(700,()=>{g.destroy();if(e.dead||this.mode!=='play')return;e.dash=.75;e.dvx=dx*560;e.dvy=dy*560;e.atk=lvl>=10?1.8:2.6})}}
 addEB(x,y,vx,vy,k){const s=this.W(this.add.image(x,y,k).setDepth(30));s.setScale(26/s.frame.height);this.eb.push({s,x,y,vx,vy,life:4,r:11,dmg:10})}
 hurt(dmg){this.hp-=dmg;this.inv=.6;AU.sfx('hurt');this.cameras.main.shake(150,.008);this.hero.setTintFill(0xff6b6b);this.time.delayedCall(80,()=>this.hero.clearTint());if(navigator.vibrate)try{navigator.vibrate(30)}catch(e){}}
 damage(e,v,kx,ky){if(e.dead)return;v*=1+.12*(this.lv.pow||0);e.hp-=v;e.flash=.07;e.s.setTintFill(0xffffff);if(!e.boss){e.kx+=kx||0;e.ky+=ky||0}
  if(this.dmgN<40){this.dmgN=(this.dmgN||0)+1;const t=this.W(KIT.text(this,e.x+rnd(-8,8),e.y-e.r,Math.round(v)+'',e.boss?20:15,'#fff','#4a2d5e').setDepth(90));this.tweens.add({targets:t,y:t.y-26,alpha:0,duration:500,onComplete:()=>{t.destroy();this.dmgN--}})}
  if(e.hp<=0)this.kill(e);else AU.sfx('hit')}
 kill(e){e.dead=1;this.kills++;AU.sfx('kill');this.emPuff.explode(e.boss?30:6,e.x,e.y);if(e.glow)e.glow.destroy();
  this.tweens.add({targets:e.s,scale:0,angle:180,duration:180,onComplete:()=>e.s.destroy()});
  if(e.boss){this.bossDown(e);return}
  const v=e.xp;this.addGem(e.x,e.y,v);if(e.elite){this.addItem('chest',e.x+10,e.y)}else{const r=Math.random();if(r<.012)this.addItem('apple',e.x,e.y);else if(r<.017)this.addItem('magnet',e.x,e.y);else if(r<.020)this.addItem('bolt',e.x,e.y)}}
 bossDown(e){this.boss=null;this.bossG.clear();this.bossTx.setText('');AU.sfx('boom');AU.sfx('win');this.cameras.main.shake(700,.02);this.cameras.main.flash(300,255,255,255);this.emBoom.explode(40,e.x,e.y);
  for(let i=0;i<8;i++)this.addGem(e.x+rnd(-60,60),e.y+rnd(-60,60),5);this.addItem('chest',e.x,e.y);this.addItem('apple',e.x+40,e.y);
  this.eb.forEach(b=>b.s.destroy());this.eb=[];BGM.play('play');
  if(e.boss.final){this.time.delayedCall(1600,()=>this.finish(true))}else this.warn('🎉 '+e.boss.n+' 물리쳤어요!',1.8)}
 /* ---- 무기 ---- */
 cdm(){return Math.pow(.93,this.lv.cd||0)}
 nearest(maxd){let best=null,bd=maxd||9999;for(const e of this.en){if(e.dead)continue;const d=Math.hypot(e.x-this.px,e.y-this.py);if(d<bd){bd=d;best=e}}return best}
 tick(k,cd,dt){this.cdT[k]=(this.cdT[k]||0)-dt;if(this.cdT[k]>0)return false;this.cdT[k]=cd*this.cdm();return true}
 weapons(dt){const L=this.lv;
  if(L.heart){const l=L.heart;if(this.tick('heart',[0,.75,.68,.6,.52,.45][l],dt)){const tgt=this.nearest(380);if(tgt){const n=[0,1,1,2,2,3][l],a0=Math.atan2(tgt.y-this.py,tgt.x-this.px);for(let i=0;i<n;i++){const a=a0+(i-(n-1)/2)*.18;this.addPJ('heart',this.px,this.py-10,Math.cos(a)*430,Math.sin(a)*430,[0,12,14,16,19,23][l],l>=4?3:1,1.2,12)}AU.sfx('shoot')}}}
  if(L.orbit){const l=L.orbit,n=[0,2,2,3,4,5][l],rad=[0,70,72,78,90,96][l],spd=[0,3,3.2,3.4,3.6,4.4][l];while(this.orbs.length<n){const s=this.W(this.add.image(0,0,'it_star').setDepth(55));s.setScale(26/s.frame.height);this.orbs.push(s)}
   this.orbA=(this.orbA||0)+spd*dt;this.orbs.forEach((s,i)=>{const a=this.orbA+i/n*Math.PI*2;s.setPosition(this.px+Math.cos(a)*rad,this.py+Math.sin(a)*rad).setRotation(a*2);
    for(const e of this.en){if(e.dead)continue;if(Math.hypot(e.x-s.x,e.y-s.y)<e.r+13){const k='o'+i;if((e.hitT[k]||0)<this.t){e.hitT[k]=this.t+.45;this.damage(e,[0,8,11,13,15,18][l],Math.cos(a)*120,Math.sin(a)*120)}}}})}
  if(L.zap){const l=L.zap;if(this.tick('zap',[0,2.2,2,1.8,1.6,1.25][l],dt)){const n=[0,1,2,2,3,4][l],cand=this.en.filter(e=>!e.dead&&Math.abs(e.x-this.px)<W/2&&Math.abs(e.y-this.py)<H/2);
    for(let i=0;i<n&&cand.length;i++){const e=cand.splice(Math.floor(Math.random()*cand.length),1)[0];const g=this.W(this.add.graphics().setDepth(80));g.lineStyle(5,0xfff27a,1);let x=e.x+rnd(-30,30),y=e.y-260;g.beginPath();g.moveTo(x,y);for(let k=1;k<=6;k++){x=e.x+(k<6?rnd(-18,18):0);y=e.y-260+k*260/6;g.lineTo(x,y)}g.strokePath();g.lineStyle(2,0xffffff,1);g.strokePath();this.tweens.add({targets:g,alpha:0,duration:220,onComplete:()=>g.destroy()});
     this.emSpark.explode(8,e.x,e.y);const dmg=[0,24,28,34,40,50][l];for(const o of this.en)if(!o.dead&&Math.hypot(o.x-e.x,o.y-e.y)<o.r+38)this.damage(o,o===e?dmg:dmg*.5)}if(n)AU.sfx('zap')}}
  if(L.aura){const l=L.aura,rad=[0,72,82,90,100,118][l];const g=this.auraG;g.clear();g.fillStyle(0xffb3d9,.16+Math.sin(this.t*4)*.04);g.fillCircle(this.px,this.py,rad);g.lineStyle(3,0xff8fc0,.4);g.strokeCircle(this.px,this.py,rad);
   if(this.tick('aura',.5,dt)){for(const e of this.en)if(!e.dead&&Math.hypot(e.x-this.px,e.y-this.py)<rad+e.r*.5)this.damage(e,[0,5,6,8,10,13][l])}}
  if(L.apple){const l=L.apple;if(this.tick('apple',[0,2.4,2.2,2,1.8,1.5][l],dt)){const n=[0,1,1,2,2,3][l];for(let i=0;i<n;i++){const tgt=pick(this.en.filter(e=>!e.dead&&Math.hypot(e.x-this.px,e.y-this.py)<300))||{x:this.px+rnd(-150,150),y:this.py+rnd(-150,150)};this.lob(tgt.x,tgt.y,[0,26,32,38,46,56][l],[0,55,64,66,72,82][l])}}}
  if(L.fairy){const l=L.fairy;if(!this.fairyS){this.fairyS=this.W(this.add.image(this.px,this.py,'it_fairy').setDepth(56));this.fairyS.setScale(36/this.fairyS.frame.height)}
   const fx=this.px-this.face*38,fy=this.py-42+Math.sin(this.t*3)*6;this.fairyS.x+=(fx-this.fairyS.x)*Math.min(1,dt*5);this.fairyS.y+=(fy-this.fairyS.y)*Math.min(1,dt*5);
   if(this.tick('fairy',[0,1.1,1,.9,.8,.65][l],dt)){const n=[0,1,1,2,2,3][l];const C=this.en.filter(e=>!e.dead&&Math.hypot(e.x-this.px,e.y-this.py)<330);for(let i=0;i<n&&C.length;i++){const e=pick(C),a=Math.atan2(e.y-this.fairyS.y,e.x-this.fairyS.x);this.addPJ('magic',this.fairyS.x,this.fairyS.y,Math.cos(a)*380,Math.sin(a)*380,[0,9,12,13,15,18][l],1,1.1,10,e)}}}}
 addPJ(tex,x,y,vx,vy,dmg,pierce,life,r,home){const s=this.W(this.add.image(x,y,tex).setDepth(60));s.setScale((tex==='heart'?22:22)/s.frame.height);s.setRotation(Math.atan2(vy,vx));this.pj.push({s,x,y,vx,vy,dmg,pierce,life,r,hit:new Set(),home})}
 lob(tx,ty,dmg,rad){const s=this.W(this.add.image(this.px,this.py,'it_apple').setDepth(62));s.setScale(26/s.frame.height);const sx=this.px,sy=this.py;
  const sh=this.W(this.add.image(tx,ty+6,'shadow').setDepth(6).setAlpha(.3).setScale(.3));
  this.tweens.addCounter({from:0,to:1,duration:520,onUpdate:tw=>{const k=tw.getValue();s.setPosition(sx+(tx-sx)*k,sy+(ty-sy)*k-Math.sin(k*Math.PI)*120);s.setRotation(k*8);sh.setScale(.3+k*.5)},
   onComplete:()=>{s.destroy();sh.destroy();if(this.mode!=='play')return;AU.sfx('boom');this.emBoom.explode(14,tx,ty);this.cameras.main.shake(80,.004);
    const ring=this.W(this.add.circle(tx,ty,rad,0xffa040,.35).setDepth(7));this.tweens.add({targets:ring,alpha:0,scale:1.15,duration:280,onComplete:()=>ring.destroy()});
    for(const e of this.en)if(!e.dead&&Math.hypot(e.x-tx,e.y-ty)<rad+e.r*.5){const a=Math.atan2(e.y-ty,e.x-tx);this.damage(e,dmg,Math.cos(a)*220,Math.sin(a)*220)}}})}
 updProj(dt){for(const p of this.pj){p.life-=dt;if(p.home&&!p.home.dead){const a=Math.atan2(p.home.y-p.y,p.home.x-p.x),sp=Math.hypot(p.vx,p.vy);p.vx+=(Math.cos(a)*sp-p.vx)*Math.min(1,dt*6);p.vy+=(Math.sin(a)*sp-p.vy)*Math.min(1,dt*6)}
   p.x+=p.vx*dt;p.y+=p.vy*dt;p.s.setPosition(p.x,p.y).setRotation(Math.atan2(p.vy,p.vx));
   for(const e of this.en){if(e.dead||p.hit.has(e))continue;if(Math.abs(e.x-p.x)<e.r+p.r&&Math.abs(e.y-p.y)<e.r+p.r&&Math.hypot(e.x-p.x,e.y-p.y)<e.r+p.r){p.hit.add(e);const k=1/Math.hypot(p.vx,p.vy)*120;this.damage(e,p.dmg,p.vx*k,p.vy*k);this.emSpark.explode(2,p.x,p.y);if(--p.pierce<=0){p.life=0;break}}}}
  if(this.pj.some(p=>p.life<=0)){this.pj=this.pj.filter(p=>{if(p.life<=0){p.s.destroy();return false}return true})}
  for(const b of this.eb){b.life-=dt;b.x+=b.vx*dt;b.y+=b.vy*dt;b.s.setPosition(b.x,b.y).setRotation(b.s.rotation+dt*6);if(this.inv<=0&&Math.hypot(b.x-this.px,b.y-this.py)<b.r+18){this.hurt(b.dmg);b.life=0}}
  if(this.eb.some(b=>b.life<=0)){this.eb=this.eb.filter(b=>{if(b.life<=0){b.s.destroy();return false}return true})}}
 /* ---- 보석·아이템 ---- */
 addGem(x,y,v){const s=this.W(this.add.image(x,y,'gem').setDepth(10));const col=v>=5?0xc07aff:v>=3?0x5ee08a:0x5ab8ff;s.setTint(col).setScale(v>=5?1:v>=3?.85:.7);this.gems.push({s,x,y,v});if(this.gems.length>260){const o=this.gems.shift();this.xpAdd(o.v,true);o.s.destroy()}}
 addItem(k,x,y){const tex=k==='chest'?'chest':'it_'+k;const s=this.W(this.add.image(x,y,tex).setDepth(11));s.setScale((k==='chest'?34:30)/s.frame.height);this.tweens.add({targets:s,y:y-6,duration:500,yoyo:true,repeat:-1});this.items.push({k,s,x,y})}
 updGems(dt){const rad=95*(1+.35*(this.lv.mag||0));for(const g of this.gems){const dx=this.px-g.x,dy=this.py-g.y,d=Math.hypot(dx,dy)||1;if(g.pull||d<rad){g.pull=1;const sp=420+(g.pull++)*8;g.x+=dx/d*sp*dt;g.y+=dy/d*sp*dt;g.s.setPosition(g.x,g.y)}if(d<20){g.got=1;g.s.destroy();this.xpAdd(g.v)}}
  if(this.gems.some(g=>g.got))this.gems=this.gems.filter(g=>!g.got);
  for(const it of this.items){if(Math.hypot(this.px-it.x,this.py-it.y)<30){it.got=1;it.s.destroy();this.useItem(it.k,it.x,it.y)}}if(this.items.some(i=>i.got))this.items=this.items.filter(i=>!i.got)}
 useItem(k,x,y){if(k==='apple'){this.hp=Math.min(this.maxhp,this.hp+30);AU.sfx('heal');this.ft(this.px,this.py-50,'+30','#ff7a9a')}
  if(k==='magnet'){AU.sfx('level');this.gems.forEach(g=>g.pull=1)}
  if(k==='bolt'){AU.sfx('boom');this.cameras.main.flash(250,255,250,200);for(const e of this.en)if(!e.dead&&!e.boss&&Math.abs(e.x-this.px)<W/2+20&&Math.abs(e.y-this.py)<H/2+20)this.damage(e,9999)}
  if(k==='chest'){AU.sfx('win');this.emSpark.explode(16,x,y);this.pendingLv++;this.time.delayedCall(250,()=>this.levelUp(true))}}
 xpAdd(v,quiet){this.xp+=v;if(!quiet)AU.sfx('gem',this.xp%30);while(this.xp>=this.need){this.xp-=this.need;this.level++;this.need=Math.round(4+this.level*2.6);this.pendingLv++}if(this.pendingLv&&this.mode==='play')this.levelUp(false);this.drawXP()}
 /* ---- 레벨업 ---- */
 levelUp(chest){if(this.mode!=='play'||!this.pendingLv)return;this.pendingLv--;this.mode='lvl';this.joy=null;this.joyB.setAlpha(0);this.joyK.setAlpha(0);AU.sfx('level');
  const own=Object.keys(this.lv),wk=Object.keys(WP).filter(k=>!WP[k].p),pk=Object.keys(WP).filter(k=>WP[k].p);
  let opts=Object.keys(WP).filter(k=>(this.lv[k]||0)<5);
  const wCount=own.filter(k=>!WP[k].p).length;if(wCount>=4)opts=opts.filter(k=>WP[k].p||this.lv[k]);
  opts=Phaser.Utils.Array.Shuffle(opts).slice(0,3);
  $('lvT').textContent=chest?'🎁 보물 상자!':'⬆️ 레벨 업! Lv'+this.level;
  const box=$('cards');box.innerHTML='';
  if(!opts.length){const b=document.createElement('button');b.className='uc';b.innerHTML='<div class="ic">🍎</div><div><b>체력 회복</b><span>모든 능력이 최고예요! 체력이 다 차요</span></div>';b.onclick=()=>{this.hp=this.maxhp;this.resumeLv()};box.appendChild(b)}
  opts.forEach((k,i)=>{const w=WP[k],cur=this.lv[k]||0,b=document.createElement('button');b.className='uc'+(cur?'':' new');b.style.animationDelay=i*.07+'s';
   b.innerHTML=`<div class="ic">${w.ic}</div><div><b>${w.n}</b><span>${w.p?w.d[0]:w.d[cur]}</span></div><div class="lv">${cur?'Lv'+cur+' → '+(cur+1):'✨ 새로!'}</div>`;
   b.onclick=()=>{AU.sfx('pick');this.lv[k]=cur+1;if(k==='hp'){this.maxhp+=20;this.hp=Math.min(this.maxhp,this.hp+40)}this.resumeLv()};box.appendChild(b)});
  this.sc('lvl');$('pbtn').style.display='none'}
 resumeLv(){this.mode='play';this.sc(null);this.inv=Math.max(this.inv,.6);if(this.pendingLv)this.time.delayedCall(150,()=>this.levelUp(false))}
 /* ---- HUD ---- */
 drawXP(){const g=this.xpG;g.clear();g.fillStyle(0x000000,.35);g.fillRoundedRect(56,10,W-150,14,7);g.fillStyle(0x5ab8ff);g.fillRoundedRect(56,10,Math.max(10,(W-150)*this.xp/this.need),14,7);g.fillStyle(0xffffff,.35);g.fillRoundedRect(58,12,Math.max(6,(W-154)*this.xp/this.need),4,2);
  g.fillStyle(0xffd25a);g.fillCircle(30,30,20);g.lineStyle(3,0xffffff);g.strokeCircle(30,30,20);this.lvTx.setText(this.level)}
 drawHUD(){this.timeTx.setText(this.fmt(this.t));this.killTx.setText('👾 '+this.kills);
  const g=this.hpG;g.clear();const w=50,x=this.px-w/2,y=this.py+36;g.fillStyle(0x000000,.4);g.fillRoundedRect(x-2,y-2,w+4,10,5);g.fillStyle(this.hp/this.maxhp>.3?0x6fd67a:0xff5a5a);g.fillRoundedRect(x,y,Math.max(4,w*clamp(this.hp/this.maxhp,0,1)),6,3);
  const b=this.boss;if(b){const bg=this.bossG;bg.clear();bg.fillStyle(0x000000,.45);bg.fillRoundedRect(40,96,W-80,14,7);bg.fillStyle(0xff4a7a);bg.fillRoundedRect(42,98,Math.max(6,(W-84)*b.hp/b.max),10,5);this.bossTx.setText(b.boss.n)}}
 die(){if(this.mode!=='play')return;this.mode='dead';AU.sfx('lose');BGM.stop();this.tweens.add({targets:this.hero,angle:90,alpha:.5,duration:500});this.cameras.main.shake(400,.012);this.time.delayedCall(1300,()=>this.finish(false))}
 finish(win){this.mode='res';const t=Math.floor(this.t),nb=t>S.best;if(nb)S.best=t;S.bestKills=Math.max(S.bestKills,this.kills);if(win)S.clears++;SV.put();
  $('rT').textContent=win?'🏆 대마왕을 물리쳤어요!':'😵 쓰러졌어요…';
  $('rB').innerHTML=`<div class="rline">⏱️ ${this.fmt(t)} 버팀${nb?' <b>최고 기록!</b>':''}</div><div class="rline">👾 ${this.kills}마리 · ⬆️ Lv${this.level}</div><div style="font-size:15px;margin-top:6px;color:#8a6a9a">${Object.entries(this.lv).map(([k,v])=>WP[k].ic+v).join(' ')}</div>${win?'':'<div style="font-size:15px;margin-top:6px;color:#8a6a9a">💡 '+pick(['보물 상자는 꼭 먹어요!','적에게 둘러싸이지 않게 크게 원을 그리며 움직여요','같은 무기를 계속 키우면 훨씬 세져요','보스의 빨간 선은 돌진 신호! 옆으로 피해요'])+'</div>'}`;
  this.sc('res');if(win)AU.sfx('win');BGM.play('play')}
}
new Phaser.Game({type:Phaser.AUTO,parent:'game',width:W*R,height:H*R,backgroundColor:'#9fdc84',scale:{mode:Phaser.Scale.FIT,autoCenter:Phaser.Scale.CENTER_BOTH},render:{antialias:true},audio:{noAudio:true},input:{activePointers:2},scene:[Boot,Main]});
$('ui').style.width=W+'px';$('ui').style.height=H+'px';
})();
