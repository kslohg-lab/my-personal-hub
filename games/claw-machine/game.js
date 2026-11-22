/* 말랑말랑 인형뽑기 2 — Phaser + Matter 물리
   집게가 잡은 인형은 줄에 매달려 흔들리고, 놓치면 진짜로 떨어져요. 동물 친구 인형 33종 도감.
   저장: localStorage 'clawV2' {coins, col{번호:개수}, total, day, fails, snd} */
(()=>{'use strict';
const {R,rnd,pick,clamp,$,IMG,AU,BGM}=KIT;
const SZ=KIT.size(420,700,940),W=SZ.W,H=SZ.H;
const CTL=150,FLOOR=H-CTL-34,LX=18,RX=W-18,CHR=112,BAR=FLOOR-118,RAIL=96,HOMEX=64,TOP=RAIL+34;
const NAMES=['하트몽','포롱','멍코','용기','우정이','포근','사랑빛','믿음','소망','하트여왕','마카롱','푸딩','솜사탕','쿠키','초코','딸기','캔디','젤리','케이크','간식대장','별빛','달토','구름이','무지개','오로라','유성','은하','새벽','달빛여신','우주용','병아리','나비','꿀벌'];
const rare=i=>i>=30?0:(i%10===9?2:i%10>5?1:0);
const WT=i=>[10,4,1.5][rare(i)];
const SV=KIT.save('clawV2',()=>({coins:15,col:{},total:0,day:'',fails:0,snd:1}));const S=SV.data;AU.on=BGM.on=!!S.snd;
const dex=()=>Object.keys(S.col).filter(k=>S.col[k]>0).length;
(function daily(){const d=new Date(),k=d.getFullYear()+'-'+(d.getMonth()+1)+'-'+d.getDate();if(S.day!==k){if(S.day)S.coins+=10,S.bonusMsg=1;S.day=k;SV.put()}})();

class Boot extends Phaser.Scene{constructor(){super('boot')}
 preload(){this.load.on('progress',v=>$('lbar').style.width=Math.round(v*100)+'%');for(let i=0;i<33;i++)this.load.image('ch'+i,IMG+'ch/'+KIT.pad2(i)+'.webp')}
 create(){KIT.fontReady().then(()=>this.scene.start('main'))}}

class Main extends Phaser.Scene{constructor(){super('main')}
 create(){window.__cm=this;KIT.textures(this);this.cameras.main.setZoom(R).centerOn(W/2,H/2);
  this.drawCabinet();
  const st={isStatic:true,friction:.6,restitution:.02};
  this.matter.add.rectangle(CHR+(RX-CHR)/2,FLOOR+20,RX-CHR+20,40,st);   // 바닥 (출구 쪽은 뚫려 있어요)
  this.matter.add.rectangle(LX-20,H/2,40,H*2,st);this.matter.add.rectangle(RX+20,H/2,40,H*2,st);
  this.matter.add.rectangle(CHR+5,(BAR+FLOOR)/2+10,10,FLOOR-BAR+20,st);   // 출구 칸막이
  // 집게
  this.cx=HOMEX;this.cy=TOP;this.open=.55;this.state='idle';this.timer=0;
  this.armL=this.matter.add.rectangle(0,0,8,44,{isStatic:true,friction:.8});this.armR=this.matter.add.rectangle(0,0,8,44,{isStatic:true,friction:.8});
  this.anchor=this.matter.add.circle(0,0,4,{isStatic:true,isSensor:true});
  this.cg=this.add.graphics().setDepth(40);
  this.glass();
  this.emC=this.add.particles(0,0,'spark',{emitting:false,lifespan:1400,speed:{min:150,max:420},angle:{min:230,max:310},gravityY:500,scale:{start:1,end:.2},rotate:{min:0,max:360},tint:[0xff7eb3,0xffd25a,0x6fd67a,0x5aa9ff,0xa685ff]}).setDepth(60);
  this.emP=this.add.particles(0,0,'dot',{emitting:false,lifespan:400,speed:{min:40,max:140},scale:{start:.6,end:0},alpha:{start:.8,end:0}}).setDepth(45);
  this.plush=[];this.keys=this.input.keyboard?this.input.keyboard.addKeys('LEFT,RIGHT,SPACE,DOWN'):null;
  this.matter.world.on('collisionstart',ev=>{for(const p of ev.pairs){[p.bodyA,p.bodyB].forEach(b=>{const o=b.plush;if(!o)return;const v=Math.hypot(b.velocity.x,b.velocity.y);if(v>2.2&&this.time.now-(o.sq||0)>250){o.sq=this.time.now;this.tweens.add({targets:o.s,scaleY:o.base*.82,scaleX:o.base*1.1,duration:90,yoyo:true});if(v>4)AU.sfx('thud')}})}});
  for(let i=0;i<16;i++)this.addPlush(rnd(CHR+60,RX-40),FLOOR-60-Math.floor(i/5)*60-rnd(0,20));
  this.bindUI();$('load').style.display='none';KIT.fitUI(W);addEventListener('resize',()=>setTimeout(()=>KIT.fitUI(W),60));this.scale.on('resize',()=>setTimeout(()=>KIT.fitUI(W),30));
  this.home();
 }
 drawCabinet(){const bg=this.textures.createCanvas('bg',4,H),x=bg.getContext(),g0=x.createLinearGradient(0,0,0,H);g0.addColorStop(0,'#ffd6ea');g0.addColorStop(1,'#d6c8ff');x.fillStyle=g0;x.fillRect(0,0,4,H);bg.refresh();
  this.add.image(0,0,'bg').setOrigin(0).setDisplaySize(W,H);
  const g=this.add.graphics().setDepth(1);
  g.fillStyle(0xff7eb3);g.fillRoundedRect(6,6,W-12,FLOOR+40,26);g.fillStyle(0xe0609c);g.fillRoundedRect(6,FLOOR+30,W-12,18,{tl:0,tr:0,bl:20,br:20});
  g.fillStyle(0xbfe9ff,1);g.fillRoundedRect(LX,RAIL-14,RX-LX,FLOOR-RAIL+14,10);
  const gr=this.textures.createCanvas('glassbg',4,200),gx=gr.getContext(),gg=gx.createLinearGradient(0,0,0,200);gg.addColorStop(0,'#e6f6ff');gg.addColorStop(1,'#bfe2ff');gx.fillStyle=gg;gx.fillRect(0,0,4,200);gr.refresh();
  this.add.image(LX,RAIL-14,'glassbg').setOrigin(0).setDisplaySize(RX-LX,FLOOR-RAIL+14).setDepth(1.5);
  const f=this.add.graphics().setDepth(2);
  f.fillStyle(0xfff3c4);f.fillRect(CHR,FLOOR,RX-CHR,8);f.fillStyle(0xffe08a);f.fillRect(CHR,FLOOR+8,RX-CHR,20);
  // 출구
  f.fillStyle(0x6b4a8a);f.fillRect(LX,FLOOR,CHR-LX,30);for(let i=0;i<4;i++){f.fillStyle(i%2?0xffd25a:0x5a3d6e);f.fillRect(LX+i*(CHR-LX)/4,FLOOR-4,(CHR-LX)/4,6)}
  f.fillStyle(0xff9ec4);f.fillRect(CHR,BAR,10,FLOOR-BAR);f.fillStyle(0xffffff,.6);f.fillRect(CHR+2,BAR,3,FLOOR-BAR);
  KIT.text(this,(LX+CHR)/2,FLOOR+15,'출구',16,'#ffe9a8','#3a2650').setDepth(3);
  this.add.image((LX+CHR)/2,FLOOR+60,'glow').setTint(0xffe066).setAlpha(.35).setScale(1.2).setDepth(2);
  // 레일
  f.fillStyle(0x9a8aa8);f.fillRect(LX,RAIL-6,RX-LX,8);f.fillStyle(0xd8cde6);f.fillRect(LX,RAIL-6,RX-LX,3);
  // 위 간판 + 전구
  const sg=this.add.graphics().setDepth(3);sg.fillStyle(0xffffff);sg.fillRoundedRect(W/2-120,16,240,52,24);sg.lineStyle(4,0xffc94a);sg.strokeRoundedRect(W/2-120,16,240,52,24);
  KIT.text(this,W/2,42,'🧸 말랑말랑 인형뽑기',22,'#ff5a8a','#ffffff').setDepth(4);
  this.bulbs=[];for(let i=0;i<14;i++){const b=this.add.image(24+i*(W-48)/13,10,'dot').setScale(.55).setDepth(4);this.bulbs.push(b)}
  this.time.addEvent({delay:260,loop:true,callback:()=>{this.blink=(this.blink||0)+1;this.bulbs.forEach((b,i)=>b.setTint((i+this.blink)%3===0?0xffffff:[0xff7eb3,0xffd25a,0x6fd67a,0x5aa9ff][(i+this.blink)%4]))}})}
 glass(){const g=this.add.graphics().setDepth(50);g.fillStyle(0xffffff,.12);g.beginPath();g.moveTo(LX+30,RAIL);g.lineTo(LX+80,RAIL);g.lineTo(LX+20,RAIL+260);g.lineTo(LX,RAIL+260);g.lineTo(LX,RAIL+120);g.closePath();g.fillPath();
  g.fillStyle(0xffffff,.08);g.beginPath();g.moveTo(RX-120,RAIL);g.lineTo(RX-100,RAIL);g.lineTo(RX-210,FLOOR);g.lineTo(RX-230,FLOOR);g.closePath();g.fillPath();
  g.lineStyle(4,0xffffff,.5);g.strokeRoundedRect(LX,RAIL-14,RX-LX,FLOOR-RAIL+14,10)}
 pickId(){const tot=[...Array(33).keys()].reduce((a,i)=>a+WT(i),0);let x=Math.random()*tot;for(let i=0;i<33;i++){if((x-=WT(i))<0)return i}return 0}
 addPlush(x,y,id){if(id==null)id=this.pickId();const rr=rare(id),r=id>=30?25:rnd(28,32);
  const b=this.matter.add.circle(x,y,r,{restitution:.05,friction:.55,frictionStatic:.9,frictionAir:.015,density:.0016*(1+rr*.35),label:'plush'});
  const s=this.add.image(x,y,'ch'+id).setDepth(20);const base=r*2.35/Math.max(s.frame.height,s.frame.width*.85);s.setScale(base);
  let glow=null;if(rr){glow=this.add.image(x,y,'glow').setTint(rr===2?0xffd25a:0xfff3a0).setAlpha(.5).setScale(r/24).setDepth(19);this.tweens.add({targets:glow,alpha:.2,duration:700,yoyo:true,repeat:-1})}
  const o={id,b,s,r,base,glow,rr};b.plush=o;this.plush.push(o);return o}
 /* ---- 화면 ---- */
 bindUI(){const sc=id=>{document.querySelectorAll('.scr').forEach(e=>e.classList.toggle('on',e.id===id));$('ctl').classList.toggle('on',id===null||id==='win')};this.sc=sc;
  $('bGo').onclick=()=>{AU.init();AU.sfx('click');this.play()};
  $('bCol').onclick=()=>{AU.init();AU.sfx('click');this.showCol()};$('cx').onclick=()=>{AU.sfx('click');this.mode==='play'?sc(null):this.home()};
  $('sbtn').onclick=()=>{S.snd=S.snd?0:1;AU.on=BGM.on=!!S.snd;SV.put();$('sbtn').textContent=S.snd?'🔊':'🔇';AU.init();AU.sfx('click')};$('sbtn').textContent=S.snd?'🔊':'🔇';
  $('bMenu').onclick=()=>{AU.sfx('click');if(this.state==='idle'||this.state==='aim')this.home();else KIT.toast('집게가 돌아오면 나갈 수 있어요')};
  $('wGo').onclick=()=>{AU.sfx('click');sc(null)};
  $('bFree').onclick=()=>{if(S.coins>0)return;S.coins+=5;S.freeAt=Date.now();SV.put();AU.sfx('coin');this.hud();KIT.toast('🪙 동전 5개를 받았어요!')};
  const hold=(id,d)=>{const b=$(id);const on=e=>{e.preventDefault();AU.init();this.mv=d};const off=()=>{if(this.mv===d)this.mv=0};b.addEventListener('pointerdown',on);['pointerup','pointerleave','pointercancel'].forEach(t=>b.addEventListener(t,off))};
  hold('bL',-1);hold('bR',1);
  $('grab').onclick=()=>{AU.init();this.grabBtn()};
  document.addEventListener('visibilitychange',()=>{if(document.hidden)this.mv=0})}
 home(){this.mode='home';$('hc').textContent='🪙 '+S.coins;$('hd').textContent='📖 '+dex()+'/33';this.sc('home');BGM.play('bright');$('timer').style.display='none'}
 play(){this.mode='play';this.sc(null);this.hud();if(S.bonusMsg){S.bonusMsg=0;SV.put();this.time.delayedCall(300,()=>KIT.toast('🎁 오늘의 선물: 동전 10개!',2200))}}
 hud(){$('cn').textContent='🪙 '+S.coins;$('cd').textContent='📖 '+dex()+'/33';const st=this.state;
  $('grab').textContent=st==='idle'?(S.coins>0?'🪙 동전 넣기':'동전이 없어요'):st==='aim'?'⬇ 잡기!':'…';$('grab').disabled=!(st==='aim'||(st==='idle'&&S.coins>0));
  $('bFree').style.display=S.coins<=0&&st==='idle'?'block':'none'}
 showCol(){const g=$('cg');g.innerHTML='';const n=dex();$('cc').textContent=n+'/33';
  [...Array(33).keys()].sort((a,b)=>rare(a)-rare(b)||a-b).forEach(i=>{const c=S.col[i]||0,d=document.createElement('div');d.className='it'+(c?'':' no')+(rare(i)?' rare':'');d.innerHTML=`${c?`<b>×${c}</b>`:''}<img src="${IMG}ch/${KIT.pad2(i)}.webp" alt="">${c?NAMES[i]:'???'}${rare(i)?' '+['','✨','👑'][rare(i)]:''}`;g.appendChild(d)});this.sc('col')}
 /* ---- 조작 ---- */
 grabBtn(){if(this.state==='idle'){if(S.coins<=0){KIT.toast('동전이 없어요! 위의 +5 받기를 눌러요');return}S.coins--;SV.put();AU.sfx('coin');this.state='aim';this.timer=15;$('timer').style.display='block';BGM.play('bright');this.hud();KIT.toast('◀ ▶ 로 움직이고 잡기!',1400);return}
  if(this.state==='aim')this.drop()}
 drop(){this.state='down';this.mv=0;$('timer').style.display='none';AU.sfx('drop');this.hud()}
 update(t,dl){const dt=Math.min(dl/1000,1/25);
  if(this.keys&&this.mode==='play'){const k=this.keys;if(Phaser.Input.Keyboard.JustDown(k.SPACE)||Phaser.Input.Keyboard.JustDown(k.DOWN))this.grabBtn();const kv=k.LEFT.isDown?-1:k.RIGHT.isDown?1:0;if(kv)this.mv=kv;else if(this.kbmv)this.mv=0;this.kbmv=kv}
  const st=this.state,tipY=()=>this.cy+16+42;
  if(st==='aim'){this.timer-=dt;$('timer').textContent='⏱️ '+Math.ceil(this.timer);if(this.mv){this.cx=clamp(this.cx+this.mv*150*dt,HOMEX,RX-40);if((this.tk=(this.tk||0)+dt)>.12){this.tk=0;AU.sfx('pick')}}if(this.timer<=0)this.drop()}
  else if(st==='down'){this.open=Math.min(.75,this.open+dt*1.2);this.cy+=170*dt;const ty=tipY();
   const hit=this.plush.some(o=>Math.abs(o.b.position.x-this.cx)<o.r+10&&o.b.position.y-o.r<ty-6&&o.b.position.y>this.cy);
   if(hit||ty>=FLOOR-4){this.state='close';this.ct=0;AU.sfx('place')}}
  else if(st==='close'){this.ct+=dt;this.open=Math.max(.06,.75-this.ct*1.6);if(this.ct>.5)this.tryGrab()}
  else if(st==='up'){this.cy-=150*dt;this.slip(dt);if(this.cy<=TOP){this.cy=TOP;this.state='carry';this.slip(0,true)}}
  else if(st==='carry'){this.cx=Math.max(HOMEX,this.cx-130*dt);this.slip(dt);if(this.cx<=HOMEX){this.state='release';this.rt=0;AU.sfx('drop')}}
  else if(st==='release'){this.rt+=dt;this.open=Math.min(.6,.06+this.rt*1.4);if(this.rt>.15&&this.held){this.held.free=1;if(this.held2)this.held2.free=1;this.letGo()}if(this.rt>1){this.state='idle';this.open=.55;this.afterTurn();this.hud()}}
  // 물리 몸 따라가기
  const M=this.matter.body,hx=this.cx,hy=this.cy+16;
  const L=42;   // 팔 길이 · 팔 끝 위치
  const lx=hx-10-Math.sin(this.open)*L,rx=hx+10+Math.sin(this.open)*L,ly=hy+Math.cos(this.open)*L;
  M.setPosition(this.armL,{x:(hx-10+lx)/2,y:(hy+ly)/2});M.setAngle(this.armL,this.open);M.setPosition(this.armR,{x:(hx+10+rx)/2,y:(hy+ly)/2});M.setAngle(this.armR,-this.open);
  M.setPosition(this.anchor,{x:hx,y:hy+24});
  this.drawClaw(hx,hy,lx,rx,ly);
  for(const o of this.plush){const p=o.b.position;o.s.setPosition(p.x,p.y).setRotation(o.b.angle*.6);if(o.glow)o.glow.setPosition(p.x,p.y);
   if(p.y>FLOOR+40&&p.x<CHR+4&&!o.won){if(this.state==='idle'&&!o.free){this.matter.body.setPosition(o.b,{x:rnd(CHR+80,RX-40),y:RAIL+40});this.matter.body.setVelocity(o.b,{x:0,y:0})}else{o.won=1;this.win(o)}}}
 }
 drawClaw(hx,hy,lx,rx,ly){const g=this.cg;g.clear();
  g.fillStyle(0x7a6a8a);g.fillRoundedRect(hx-18,RAIL-12,36,14,5);g.lineStyle(3,0x8a7a9a);g.lineBetween(hx,RAIL,hx,hy-6);
  g.fillStyle(0xc8c0d8);g.fillRoundedRect(hx-20,hy-8,40,24,8);g.fillStyle(0xffffff,.6);g.fillRoundedRect(hx-15,hy-5,30,6,3);g.fillStyle(0xff5a8a);g.fillCircle(hx,hy+4,4);
  g.lineStyle(7,0xa898b8);g.lineBetween(hx-10,hy+14,lx,ly);g.lineBetween(hx+10,hy+14,rx,ly);
  g.lineStyle(7,0xa898b8);g.lineBetween(lx,ly,lx+10,ly+8);g.lineBetween(rx,ly,rx-10,ly+8);
  g.fillStyle(0xd8d0e6);g.fillCircle(hx-10,hy+14,5);g.fillCircle(hx+10,hy+14,5);g.fillCircle(lx,ly,4);g.fillCircle(rx,ly,4)}
 tryGrab(){this.state='up';const hx=this.cx,hy=this.cy+16;let best=null,bd=1e9;
  for(const o of this.plush){const p=o.b.position,dx=Math.abs(p.x-hx);if(dx<o.r*1.05&&p.y>hy&&p.y<hy+42+o.r*1.2){if(dx<bd){bd=dx;best=o}}}
  if(!best){AU.sfx('bad');KIT.floatText(this,hx,hy+60,'허공을 잡았어요','#ffffff',20);S.fails++;SV.put();return}
  const q=1-bd/(best.r*1.05),pity=Math.min(.25,S.fails*.04),ch=clamp(.22+.58*q-[0,.1,.18][best.rr]+pity,.08,.95);
  if(Math.random()<ch){this.grip=q;this.held=best;this.con=this.matter.add.constraint(this.anchor,best.b,best.r*.65,.18,{damping:.08});AU.sfx('pick');this.emP.explode(6,best.b.position.x,best.b.position.y);
   // 가끔 둘을 한꺼번에!
   const two=this.plush.find(o=>o!==best&&Math.hypot(o.b.position.x-best.b.position.x,o.b.position.y-best.b.position.y)<best.r+o.r+4&&o.b.position.y>best.b.position.y);
   if(two&&Math.random()<.12){this.held2=two;this.con2=this.matter.add.constraint(best.b,two.b,best.r+two.r,.15,{damping:.08})}}
  else{this.matter.body.applyForce(best.b,best.b.position,{x:(best.b.position.x<hx?-1:1)*.004*best.b.mass*10,y:-.006*best.b.mass*10});KIT.floatText(this,hx,hy+70,'스르륵… 미끄러졌어요','#ffffff',20);AU.sfx('bad');S.fails++;SV.put()}}
 slip(dt,jolt){if(!this.held)return;const pr=jolt?.14*(1-this.grip):(1-this.grip)*.3*dt+(this.held.rr*.04*dt);
  if(this.con2&&Math.random()<.6*dt){this.matter.world.removeConstraint(this.con2);this.con2=null;this.held2=null}
  if(Math.random()<pr){this.matter.world.removeConstraint(this.con);this.con=null;const o=this.held;this.held=null;if(this.con2){this.matter.world.removeConstraint(this.con2);this.con2=null;this.held2=null}
   AU.sfx('lose');KIT.floatText(this,o.b.position.x,o.b.position.y-40,'앗! 놓쳤다!','#ff7a9a',24);this.cameras.main.shake(120,.004);S.fails++;SV.put()}}
 letGo(){if(this.con){this.matter.world.removeConstraint(this.con);this.con=null}if(this.con2){this.matter.world.removeConstraint(this.con2);this.con2=null}this.held=null;this.held2=null}
 win(o){S.fails=0;S.total++;const isNew=!S.col[o.id];S.col[o.id]=(S.col[o.id]||0)+1;SV.put();
  this.matter.world.remove(o.b);this.plush=this.plush.filter(p=>p!==o);if(o.glow)o.glow.destroy();
  this.tweens.add({targets:o.s,y:FLOOR+20,scale:o.base*1.4,duration:300,ease:'Back.easeOut',onComplete:()=>o.s.destroy()});
  this.emC.explode(40,(LX+CHR)/2,FLOOR+20);AU.sfx('win');this.cameras.main.flash(200,255,255,255);
  this.time.delayedCall(450,()=>{$('wI').src=`${IMG}ch/${KIT.pad2(o.id)}.webp`;$('wT').innerHTML=(o.rr===2?'👑 전설 인형!':o.rr?'✨ 반짝 인형!':'🎉 뽑았어요!');
   $('wN').innerHTML=`${NAMES[o.id]} 인형${isNew?'<span class="new">NEW!</span>':''}`;$('wD').textContent=`도감 ${dex()}/33 · 이 친구 ${S.col[o.id]}개째`+(dex()===33?' · 🏆 도감 완성!':'');this.sc('win');this.hud()})}
 afterTurn(){if(this.plush.length<14){const n=16-this.plush.length;for(let i=0;i<n;i++)this.time.delayedCall(i*180,()=>this.addPlush(rnd(CHR+50,RX-40),RAIL+40));KIT.toast('🧸 새 인형이 들어왔어요!')}
  if(S.coins<=0)this.hud()}
}
new Phaser.Game({type:Phaser.AUTO,parent:'game',width:W*R,height:H*R,backgroundColor:'#2b2340',scale:{mode:Phaser.Scale.FIT,autoCenter:Phaser.Scale.CENTER_BOTH},render:{antialias:true},audio:{noAudio:true},
 physics:{default:'matter',matter:{gravity:{y:1.3},positionIterations:8,velocityIterations:6}},scene:[Boot,Main]});
$('ui').style.width=W+'px';$('ui').style.height=H+'px';
})();
