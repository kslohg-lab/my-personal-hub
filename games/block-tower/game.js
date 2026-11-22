/* 와르르 블록 탑 — 장난감 블록을 쌓는 물리 게임 (Phaser + Matter)
   혼자: 얼마나 높이 쌓나 / 같이: 한 폰을 돌려 가며, 무너뜨린 사람이 져요. 저장: localStorage 'blockTowerV1' */
(()=>{'use strict';
const {R,rnd,pick,clamp,$,AU,BGM}=KIT;
const SZ=KIT.size(420,680,940),W=SZ.W,H=SZ.H;
const BASE=H-150,PW=210,HOVER=150,CM=4;   // 받침대 윗면, 받침대 폭, 들고 있는 높이(화면 기준), px→cm
const COLS=[0xff7eb3,0xffad4d,0xffd93b,0x6fd67a,0x45cfc0,0x5aa9ff,0xa685ff,0xf08a5d];
const MEMBERS=[['dad','아빠'],['mom','엄마'],['chaea','채아'],['jia','지아']];
const SH={
 bar:{w:1.4,p:[['r',0,0,150,24]]},plank:{w:3,p:[['r',0,0,100,30]]},sq:{w:3,p:[['r',0,0,56,56]]},tall:{w:1.6,p:[['r',0,0,32,96]]},
 tri:{w:1.6,p:[['v',[[-46,32],[46,32],[0,-34]]]]},dome:{w:1.2,p:[['v',[...Array(9)].map((_,i)=>[Math.round(Math.cos(Math.PI+i/8*Math.PI)*38),Math.round(16+Math.sin(Math.PI+i/8*Math.PI)*38)])]]},trap:{w:2,p:[['v',[[-50,22],[50,22],[30,-22],[-30,-22]]]]},
 hex:{w:1.5,p:[['v',[...Array(6)].map((_,i)=>[Math.cos(i/6*Math.PI*2)*34,Math.sin(i/6*Math.PI*2)*34])]]},
 L:{w:1.5,p:[['r',0,0,100,28],['r',-36,-42,28,56]]},T:{w:1.5,p:[['r',0,-30,110,26],['r',0,13,28,60]]},
 arch:{w:1.4,p:[['r',0,-24,124,24],['r',-48,14,26,52],['r',48,14,26,52]]},dia:{w:1,p:[['v',[[0,-36],[34,0],[0,36],[-34,0]]]]}};
const SV=KIT.save('blockTowerV1',()=>({best:0,snd:1,who:['dad','mom','chaea','jia'],games:0}));const S=SV.data;AU.on=BGM.on=!!S.snd;

class Main extends Phaser.Scene{constructor(){super('main')}
 create(){window.__bt=this;KIT.textures(this);this.M=Phaser.Physics.Matter.Matter;
  this.wl=this.add.layer();this.hl=this.add.layer();const cam=this.cameras.main;cam.setZoom(R);cam.centerOn(W/2,H/2);
  this.uic=this.cameras.add(0,0,W*R,H*R).setZoom(R);this.uic.centerOn(W/2,H/2);cam.ignore(this.hl);this.uic.ignore(this.wl);
  // 배경 (하늘은 UI 카메라 쪽에 두어 움직이지 않게)
  const sk=this.textures.createCanvas('sky',4,256),x=sk.getContext(),g=x.createLinearGradient(0,0,0,256);g.addColorStop(0,'#8fd0ff');g.addColorStop(1,'#e6f7ff');x.fillStyle=g;x.fillRect(0,0,4,256);sk.refresh();
  this.sky=this.W(this.add.image(0,0,'sky').setOrigin(0).setDisplaySize(W,H).setDepth(-10));
  this.cl=[0,1,2,3].map(i=>{const c=this.W(this.add.ellipse(rnd(0,W),0,rnd(90,150),rnd(34,50),0xffffff,.8).setDepth(-9));c.fy=rnd(40,H*.6);c.sp=rnd(6,14);return c});
  // 바다와 받침대 (월드)
  const sea=this.W(this.add.rectangle(W/2,BASE+70,W*3,400,0x5ab8ff).setOrigin(.5,0).setDepth(1));this.W(this.add.rectangle(W/2,BASE+70,W*3,8,0xffffff,.6).setOrigin(.5,0).setDepth(2));
  const pg=this.W(this.add.graphics().setDepth(3));pg.fillStyle(0xc98a5a);pg.fillRoundedRect(W/2-PW/2,BASE,PW,22,8);pg.fillStyle(0xa86a3a);pg.fillRect(W/2-PW/2+20,BASE+20,PW-40,60);pg.fillStyle(0xe8b88a);pg.fillRoundedRect(W/2-PW/2+4,BASE+3,PW-8,6,3);
  this.matter.add.rectangle(W/2,BASE+11,PW,22,{isStatic:true,friction:1,frictionStatic:2,label:'base'});
  this.ruler=this.W(this.add.graphics().setDepth(4));this.hiTx=this.W(KIT.text(this,W-44,BASE,'',16,'#fff','#2f6fa8').setDepth(5));
  this.guide=this.W(this.add.graphics().setDepth(6));
  this.emS=this.W(this.add.particles(0,0,'dot',{emitting:false,lifespan:700,speedY:{min:-260,max:-120},speedX:{min:-80,max:80},gravityY:500,scale:{start:.8,end:0},tint:[0xffffff,0xbfe6ff]}).setDepth(8));
  this.emP=this.W(this.add.particles(0,0,'spark',{emitting:false,lifespan:500,speed:{min:40,max:160},scale:{start:.7,end:0},rotate:{min:0,max:360},tint:[0xffffff,0xffe066]}).setDepth(9));
  // HUD
  this.turnTx=this.H_(KIT.text(this,W/2,32,'',24,'#fff','#2f6fa8'));this.subTx=this.H_(KIT.text(this,W/2,62,'',16,'#fff','#2f6fa8'));
  this.nextBox=this.H_(this.add.graphics());this.nextG=this.H_(this.add.graphics());this.H_(KIT.text(this,W-48,18,'다음',13,'#fff','#2f6fa8'));
  this.pieces=[];this.mode='home';this.dragX=null;
  this.input.on('pointerdown',p=>{AU.init();if(this.state==='aim'){this.dragX=p.x/R;this.hx0=this.hx;$('hint').style.opacity=0}});
  this.input.on('pointermove',p=>{if(this.state==='aim'&&this.dragX!=null&&p.isDown){this.hx=clamp(this.hx0+(p.x/R-this.dragX),30,W-30)}});
  this.input.on('pointerup',()=>{this.dragX=null});
  this.keys=this.input.keyboard?this.input.keyboard.addKeys('LEFT,RIGHT,UP,SPACE,DOWN'):null;
  this.bindUI();$('load').style.display='none';KIT.fitUI(W);addEventListener('resize',()=>setTimeout(()=>KIT.fitUI(W),60));this.scale.on('resize',()=>setTimeout(()=>KIT.fitUI(W),30));
  this.home()}
 W(o){this.wl.add(o);return o}H_(o){this.hl.add(o);return o}
 /* ---- 화면 ---- */
 bindUI(){const sc=id=>{document.querySelectorAll('.scr').forEach(e=>e.classList.toggle('on',e.id===id));$('ctl').classList.toggle('on',id===null);$('pbtn').style.display=id===null?'block':'none';$('hint').style.display=id===null?'block':'none'};this.sc=sc;
  $('bSolo').onclick=()=>{AU.init();AU.sfx('click');this.start([])};
  $('bMulti').onclick=()=>{AU.init();AU.sfx('click');if(S.who.length<2){KIT.toast('두 명 이상 골라요');return}this.start(MEMBERS.filter(m=>S.who.includes(m[0])))};
  $('sbtn').onclick=()=>{S.snd=S.snd?0:1;AU.on=BGM.on=!!S.snd;SV.put();$('sbtn').textContent=S.snd?'🔊':'🔇';AU.init();AU.sfx('click')};$('sbtn').textContent=S.snd?'🔊':'🔇';
  $('bRot').onclick=()=>{AU.init();this.rotate()};$('bDrop').onclick=()=>{AU.init();this.drop()};
  $('pbtn').onclick=()=>{AU.sfx('click');this.matter.world.pause();sc('pause')};$('pGo').onclick=()=>{this.matter.world.resume();sc(null)};$('pHome').onclick=()=>{this.matter.world.resume();this.home()};
  $('rRe').onclick=()=>{AU.sfx('click');this.start(this.players)};$('rHome').onclick=()=>{AU.sfx('click');this.home()}}
 home(){this.clear();this.mode='home';this.state='';$('hb').textContent='🏆 혼자 최고 '+S.best+'cm';
  const w=$('who');w.innerHTML='';MEMBERS.forEach(([id,n])=>{const b=document.createElement('button');b.textContent=n;if(S.who.includes(id))b.className='on';b.onclick=()=>{AU.init();AU.sfx('pick');S.who=S.who.includes(id)?S.who.filter(x=>x!==id):[...S.who,id];SV.put();this.home()};w.appendChild(b)});
  this.turnTx.setText('');this.subTx.setText('');this.nextG.clear();this.nextBox.clear();this.sc('home');BGM.play('calm')}
 clear(){this.pieces.forEach(p=>{this.matter.world.remove(p.b);p.c.destroy()});this.pieces=[];if(this.hold){this.hold.c.destroy();this.hold=null}this.guide.clear();this.camY=H/2;this.cameras.main.centerOn(W/2,H/2)}
 start(players){this.clear();this.players=players;this.turn=0;this.count=0;this.top=BASE;this.mode='play';this.camY=H/2;S.games++;SV.put();
  this.nextK=this.pickShape();this.sc(null);$('hint').style.opacity=1;BGM.play('calm');this.newHold()}
 pickShape(){const ks=Object.keys(SH);let tot=0;const w=k=>SH[k].w*(this.count<4&&['dome','tri','dia','hex'].includes(k)?.3:1);ks.forEach(k=>tot+=w(k));let x=Math.random()*tot;for(const k of ks){if((x-=w(k))<0)return k}return 'plank'}
 /* ---- 블록 ---- */
 drawShape(g,k,col,sc){sc=sc||1;const lighten=c=>Phaser.Display.Color.IntegerToColor(c).lighten(18).color,darken=c=>Phaser.Display.Color.IntegerToColor(c).darken(22).color;
  g.lineStyle(3*sc,darken(col),1);
  for(const p of SH[k].p){g.fillStyle(col,1);
   if(p[0]==='r'){const [,ox,oy,w,h]=p;g.fillRoundedRect((ox-w/2)*sc,(oy-h/2)*sc,w*sc,h*sc,6*sc);g.strokeRoundedRect((ox-w/2)*sc,(oy-h/2)*sc,w*sc,h*sc,6*sc);g.fillStyle(0xffffff,.35);g.fillRoundedRect((ox-w/2+4)*sc,(oy-h/2+3)*sc,(w-8)*sc,Math.min(7,h*.22)*sc,3*sc)}
   else if(p[0]==='c'){g.fillCircle(p[1]*sc,p[2]*sc,p[3]*sc);g.strokeCircle(p[1]*sc,p[2]*sc,p[3]*sc);g.fillStyle(0xffffff,.4);g.fillCircle((p[1]-p[3]*.35)*sc,(p[2]-p[3]*.4)*sc,p[3]*.25*sc)}
   else{const pts=p[1].map(([x,y])=>new Phaser.Math.Vector2(x*sc,y*sc));g.fillPoints(pts,true);g.strokePoints(pts,true)}}
  // 귀여운 눈 (큰 블록만)
  const e=SH[k].p[0];if(sc>=1&&k!=='bar'&&k!=='tall'){const ey=e[0]==='r'?e[2]:e[0]==='c'?e[2]:4;const ex=e[0]==='r'?e[1]:0;g.fillStyle(darken(darken(col)));g.fillCircle((ex-8)*sc,(ey-1)*sc,2.6*sc);g.fillCircle((ex+8)*sc,(ey-1)*sc,2.6*sc);g.fillStyle(0xff8aa8,.5);g.fillCircle((ex-14)*sc,(ey+4)*sc,3*sc);g.fillCircle((ex+14)*sc,(ey+4)*sc,3*sc)}}
 newHold(){const k=this.nextK;this.nextK=this.pickShape();const col=pick(COLS);const c=this.W(this.add.graphics().setDepth(20));this.drawShape(c,k,col);
  this.hx=W/2;this.ang=0;this.hold={k,col,c};this.state='aim';c.setScale(.2);this.tweens.add({targets:c,scale:1,duration:220,ease:'Back.easeOut'});
  const nb=this.nextBox;nb.clear();nb.fillStyle(0xffffff,.75);nb.fillRoundedRect(W-84,26,72,58,14);const ng=this.nextG;ng.clear();ng.setPosition(W-48,56);this.drawShape(ng,this.nextK,0xb8a8d8,.42);
  if(this.players.length){const p=this.players[this.turn%this.players.length];this.turnTx.setText(p[1]+' 차례!');this.subTx.setText(this.count+'개 쌓음 · '+Math.round((BASE-this.top)/CM)+'cm');this.tweens.add({targets:this.turnTx,scale:{from:1.4,to:1},duration:300,ease:'Back.easeOut'})}
  else{this.turnTx.setText(Math.round((BASE-this.top)/CM)+'cm');this.subTx.setText(this.count+'개 쌓음 · 최고 '+S.best+'cm')}}
 rotate(){if(this.state!=='aim')return;AU.sfx('pick');this.ang+=Math.PI/6;this.tweens.add({targets:this.hold.c,scale:{from:.9,to:1},duration:120})}
 drop(){if(this.state!=='aim')return;const h=this.hold,M=this.M,x=this.hx,y=this.holdY();
  const parts=SH[h.k].p.map(p=>p[0]==='r'?M.Bodies.rectangle(x+p[1],y+p[2],p[3],p[4]):p[0]==='c'?M.Bodies.circle(x+p[1],y+p[2],p[3]):M.Bodies.fromVertices(x,y,[p[1].map(([a,b])=>({x:a,y:b}))]));
  let b;if(parts.length===1)b=parts[0];else b=M.Body.create({parts});
  // 모양 중심이 들고 있던 자리와 같도록
  if(parts.length===1&&SH[h.k].p[0][0]==='v'){const cx=SH[h.k].p[0][1].reduce((a,v)=>a+v[0],0)/SH[h.k].p[0][1].length,cy=SH[h.k].p[0][1].reduce((a,v)=>a+v[1],0)/SH[h.k].p[0][1].length;M.Body.setPosition(b,{x:x+cx,y:y+cy})}
  const off={x:b.position.x-x,y:b.position.y-y};
  M.Body.set(b,{friction:.9,frictionStatic:1.4,restitution:0,frictionAir:.012,density:.002});M.Body.rotate(b,this.ang,{x,y});
  this.matter.world.add(b);const c=h.c;c.off=off;this.pieces.push({b,c,k:h.k,off,a0:this.ang});this.hold=null;this.state='fall';this.fallT=0;this.calm=0;this.count++;AU.sfx('drop');this.guide.clear()}
 holdY(){return this.camY-H/2+HOVER}
 update(t,dl){const dt=Math.min(dl/1000,1/25),M=this.M;
  const vy=this.cameras.main.worldView.y;this.sky.y=vy;this.cl.forEach(c=>{c.x+=c.sp*dt;if(c.x>W+90)c.x=-90;c.y=vy+c.fy+(vy-(0))*-.15})
  for(const p of this.pieces){const b=p.b;// 그림 = 처음 만든 모양을 몸의 회전만큼 돌려서
   const a=b.angle-p.a0;p.c.setPosition(b.position.x,b.position.y).setRotation(b.angle);p.c.x-=Math.cos(b.angle)*p.off.x-Math.sin(b.angle)*p.off.y;p.c.y-=Math.sin(b.angle)*p.off.x+Math.cos(b.angle)*p.off.y}
  if(this.mode!=='play')return;
  if(this.keys){const k=this.keys;if(this.state==='aim'){if(k.LEFT.isDown)this.hx=Math.max(30,this.hx-220*dt);if(k.RIGHT.isDown)this.hx=Math.min(W-30,this.hx+220*dt)}if(Phaser.Input.Keyboard.JustDown(k.UP))this.rotate();if(Phaser.Input.Keyboard.JustDown(k.SPACE)||Phaser.Input.Keyboard.JustDown(k.DOWN))this.drop()}
  // 카메라: 탑 꼭대기를 따라 위로
  const want=Math.min(H/2,this.top-H*.12);this.camY+=(want-this.camY)*Math.min(1,dt*2.5);this.cameras.main.centerOn(W/2,this.camY);
  if(this.state==='aim'&&this.hold){const c=this.hold.c,y=this.holdY();c.setPosition(c.x+(this.hx-c.x)*.5,y+Math.sin(t/300)*3).setRotation(this.ang);
   const g=this.guide;g.clear();g.lineStyle(2,0xffffff,.6);for(let yy=y+40;yy<this.top+40;yy+=14)g.lineBetween(c.x,yy,c.x,yy+7)}
  // 떨어진 블록 확인
  for(const p of this.pieces){if(!p.lost&&p.b.position.y>BASE+60){p.lost=1;this.emS.explode(14,p.b.position.x,BASE+70);AU.sfx('boom');this.cameras.main.shake(250,.01);if(this.mode==='play'&&!this.over){this.over=1;this.time.delayedCall(900,()=>this.finish())}}}
  for(const p of this.pieces)if(p.lost&&!p.gone&&p.b.position.y>BASE+600){p.gone=1;this.matter.world.remove(p.b);p.c.setVisible(false)}
  if(this.state==='fall'){this.fallT+=dt;const last=this.pieces[this.pieces.length-1];
   const moving=this.pieces.some(p=>!p.lost&&(p.b.speed>.22||Math.abs(p.b.angularVelocity)>.01));
   if(!moving&&this.fallT>.4)this.calm+=dt;else this.calm=0;
   if(!last.landed&&(last.b.speed<1||this.fallT>.8)&&this.fallT>.2&&last.b.position.y>this.holdY()+20){last.landed=1;this.emP.explode(6,last.b.position.x,last.b.bounds.max.y);AU.sfx('place')}
   if(!this.over&&(this.calm>.7||this.fallT>6)){this.top=Math.min(BASE,...this.pieces.filter(p=>!p.lost).map(p=>p.b.bounds.min.y));this.drawRuler();this.turn++;this.newHold()}}}
 drawRuler(){const g=this.ruler;g.clear();const h=BASE-this.top;g.lineStyle(2,0xffffff,.8);g.lineBetween(W-20,BASE,W-20,this.top);g.lineBetween(W-30,this.top,W-10,this.top);
  for(let y=BASE;y>this.top;y-=100){g.lineBetween(W-26,y,W-14,y)}this.hiTx.setPosition(W-52,this.top-14).setText(Math.round(h/CM)+'cm')}
 finish(){if(this.mode!=='play')return;this.mode='res';this.state='';if(this.hold){this.hold.c.destroy();this.hold=null}this.guide.clear();
  const hcm=Math.round((BASE-this.top)/CM),n=this.count-1;AU.sfx('lose');
  if(this.players.length){const p=this.players[this.turn%this.players.length];$('rT').textContent='💥 와르르! '+p[1]+' 탈락';$('rB').innerHTML=`<div class="rline">모두 <b>${n}</b>개 · <b>${hcm}</b>cm 쌓았어요</div><div class="rline" style="font-size:18px">🏆 ${this.players.filter(q=>q!==p).map(q=>q[1]).join(', ')} 승리!</div>`}
  else{const nb=hcm>S.best;if(nb)S.best=hcm;SV.put();$('rT').textContent=nb?'🎉 새 최고 기록!':'💥 와르르!';$('rB').innerHTML=`<div class="rline">높이 <b>${hcm}</b>cm · 블록 <b>${n}</b>개</div><div class="rline" style="font-size:18px">🏆 최고 ${S.best}cm</div>`;if(nb)AU.sfx('win')}
  this.time.delayedCall(400,()=>this.sc('res'))}
}
new Phaser.Game({type:Phaser.AUTO,parent:'game',width:W*R,height:H*R,backgroundColor:'#8fd0ff',scale:{mode:Phaser.Scale.FIT,autoCenter:Phaser.Scale.CENTER_BOTH},render:{antialias:true},audio:{noAudio:true},
 physics:{default:'matter',matter:{gravity:{y:1.1},enableSleeping:true,positionIterations:10,velocityIterations:8}},scene:[{key:'boot',create(){KIT.fontReady().then(()=>this.scene.start('main'))}},Main]});
$('ui').style.width=W+'px';$('ui').style.height=H+'px';
})();
