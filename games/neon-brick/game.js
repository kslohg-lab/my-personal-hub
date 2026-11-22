/* 네온 벽돌깨기 — 반짝이는 벽돌깨기 (Phaser로 그리고, 공 움직임은 직접 계산해서 빠른 공도 벽돌을 뚫지 않게)
   조작: 아무 데나 좌우로 끌기 = 받침대, 손 떼면 발사 (키보드 ←→, 스페이스)
   저장: localStorage 'neonBrickV1' {best, top, snd, games} */
(()=>{'use strict';
const {R,rnd,pick,clamp,$,AU,BGM}=KIT;
const SZ=KIT.size(420,680,940),W=SZ.W,H=SZ.H;
const COLS=10,BW=38,BH=18,CW=40,CH=20,LEFT=10,TOP=96,BALLR=7,PY=H-86;
const SV=KIT.save('neonBrickV1',()=>({best:0,top:1,snd:1,games:0}));const S=SV.data;AU.on=BGM.on=!!S.snd;
/* 벽돌: 1~6 색깔(1번), S 은(2번), G 금(3번), X 강철(안 깨짐), B 폭탄(주변까지 펑) */
const COL={1:'#ff4f7a',2:'#ff9a3a',3:'#ffe04a',4:'#4fe57a',5:'#3ac8ff',6:'#b36bff',S:'#d6e2f2',G:'#ffc93a',X:'#7a84a6',B:'#ff3a3a'};
const HP={S:2,G:3,X:99,B:1};
const MAPS=[
 ["..........","1111111111","2222222222","3333333333","4444444444","5555555555"],
 ["....66....","...5555...","..444444..",".33333333.","2222222222","1111111111"],
 [".11....11.","1111..1111","1111111111","1111111111",".11111111.","..111111..","...1111...","....11...."],
 ["SSSSSSSSSS","2222222222","..........","3333333333","SSSSSSSSSS","4444444444"],
 ["1.2.3.4.5.",".1.2.3.4.5","1.2B3.4.5.",".1.2.3B4.5","1.2.3.4.5.",".1.2.3.4.5"],
 ["X........X","X.555555.X","X.4SSSS4.X","X.333333.X","X.222222.X","XXX....XXX"],
 ["..444444..",".44444444.","44X4444X44","4444444444","44G4444G44",".44GGGG44.","..444444.."],
 ["....GG....","...S33S...","..S3333S..",".S33BB33S.","..S3333S..","...S33S...","....SS...."],
 ["1111111111","2222222222","33......33","44.BBBB.44","55......55","66......66"],
 ["X.GGGGGG.X","X.SSSSSS.X","XB666666BX","X.555555.X","X.444444.X","XXXX..XXXX"],
 ["..3....3..","...3..3...","..333333..",".33.33.33.","3333333333","3.333333.3","3.3....3.3","...33.33.."],
 ["BSSSSSSSSB","S12345612S","S2BB..BB2S","S12345612S","BSSSSSSSSB"],
 ["....XX....","...S55S...","..S5GG5S..","XS5GBBG5SX","..S5GG5S..","...S55S...","....XX...."],
 ["GGGGG.....",".SSSSS....","..44444...","...33333..","....22222.",".....11111"]];
function genMap(lv){let s=lv*9301+49297;const r=()=>(s=(s*9301+49297)%233280)/233280;const rows=6+Math.min(4,Math.floor(lv/6)),m=[];
 const pal=['1','2','3','4','5','6'];for(let y=0;y<rows;y++){const half=[];const base=pal[Math.floor(r()*6)];
  for(let x=0;x<5;x++){const q=r();half.push(q<.12?'.':q<.12+Math.min(.25,lv*.01)?'S':q<.17+Math.min(.3,lv*.012)?'G':q<.21+Math.min(.3,lv*.012)?'B':q<.24+Math.min(.3,lv*.012)&&y>1?'X':r()<.6?base:pick(pal))}
  m.push(half.join('')+half.slice().reverse().join(''))}return m}
const PW={W:{t:'넓게',c:'#4ac8ff',d:12},M:{t:'×3',c:'#ff5ad0',d:0},L:{t:'레이저',c:'#ff4f4f',d:8},F:{t:'불꽃',c:'#ff9a3a',d:7},S:{t:'느림',c:'#5ee07a',d:8},H:{t:'♥',c:'#ff7eb3',d:0}};

class Main extends Phaser.Scene{constructor(){super('main')}
 create(){window.__nb=this;KIT.textures(this);const cam=this.cameras.main;cam.setZoom(R);cam.centerOn(W/2,H/2);
  this.makeTex();
  this.add.image(W/2,H/2,'bg').setScale(1/R).setDepth(-10);
  this.grid=this.add.graphics().setDepth(-9);
  this.padG=this.add.image(W/2,PY,'pad').setScale(1/R).setDepth(20);this.padL=this.add.image(0,PY-6,'gun').setScale(1/R).setDepth(19).setVisible(false);this.padR=this.add.image(0,PY-6,'gun').setScale(1/R).setDepth(19).setVisible(false);
  this.emB=this.add.particles(0,0,'dot',{lifespan:600,speed:{min:60,max:240},scale:{start:.5,end:0},blendMode:'ADD',emitting:false}).setDepth(30);
  this.emT=this.add.particles(0,0,'glow',{lifespan:220,scale:{start:.22,end:0},alpha:{start:.5,end:0},blendMode:'ADD',emitting:false}).setDepth(14);
  this.emS=this.add.particles(0,0,'spark',{lifespan:1200,speed:{min:120,max:320},angle:{min:220,max:320},gravityY:380,scale:{start:.8,end:.1},rotate:{min:0,max:360},blendMode:'ADD',tint:[0xff5ad0,0x4ad8ff,0xffe04a,0x5ee07a],emitting:false}).setDepth(40);
  this.big=KIT.text(this,W/2,H*.5,'',40,'#fff','#7a2ab0').setDepth(60).setAlpha(0);
  this.bricks=[];this.balls=[];this.caps=[];this.buls=[];this.pw={};this.mode='home';
  this.input.on('pointerdown',p=>{this.px0=p.x/R;this.pd=1});this.input.on('pointermove',p=>{if(!this.pd||this.mode!=='play'||this.paused)return;const x=p.x/R;this.padX=clamp(this.padX+(x-this.px0)*1.25,this.padW/2,W-this.padW/2);this.px0=x});
  this.input.on('pointerup',()=>{this.pd=0;if(this.mode==='play'&&!this.paused)this.launch()});
  this.keys=this.input.keyboard.addKeys('LEFT,RIGHT,SPACE');
  this.bindUI();$('load').style.display='none';KIT.fitUI(W);addEventListener('resize',()=>setTimeout(()=>KIT.fitUI(W),60));this.scale.on('resize',()=>setTimeout(()=>KIT.fitUI(W),30));
  this.padX=W/2;this.padW=84;this.loadLevel(1);this.home()}
 tex(k,w,h,fn){const c=this.textures.createCanvas(k,Math.ceil(w*R),Math.ceil(h*R)),x=c.getContext();x.scale(R,R);fn(x,w,h);c.refresh()}
 rr(x,a,b,w,h,r){x.beginPath();x.moveTo(a+r,b);x.arcTo(a+w,b,a+w,b+h,r);x.arcTo(a+w,b+h,a,b+h,r);x.arcTo(a,b+h,a,b,r);x.arcTo(a,b,a+w,b,r);x.closePath()}
 makeTex(){const M=7;
  this.tex('bg',W,H,(x)=>{const g=x.createLinearGradient(0,0,0,H);g.addColorStop(0,'#1a0f3e');g.addColorStop(.6,'#2a1450');g.addColorStop(1,'#0e1a3e');x.fillStyle=g;x.fillRect(0,0,W,H);
   x.strokeStyle='rgba(120,90,255,.12)';x.lineWidth=1;for(let i=0;i<W;i+=30){x.beginPath();x.moveTo(i,0);x.lineTo(i,H);x.stroke()}for(let j=0;j<H;j+=30){x.beginPath();x.moveTo(0,j);x.lineTo(W,j);x.stroke()}
   for(let i=0;i<60;i++){x.fillStyle=`rgba(255,255,255,${Math.random()*.6})`;x.beginPath();x.arc(Math.random()*W,Math.random()*H*.8,Math.random()*1.4,0,7);x.fill()}
   x.strokeStyle='rgba(140,230,255,.5)';x.lineWidth=2;x.shadowColor='#4ad8ff';x.shadowBlur=10;x.strokeRect(3,TOP-30,W-6,H-TOP+60)});
  const brick=(k,col,crack,extra)=>this.tex(k,BW+M*2,BH+M*2,(x)=>{x.save();x.shadowColor=col;x.shadowBlur=9;x.fillStyle=col;this.rr(x,M,M,BW,BH,5);x.fill();x.restore();
   const g=x.createLinearGradient(0,M,0,M+BH);g.addColorStop(0,'rgba(255,255,255,.55)');g.addColorStop(.45,'rgba(255,255,255,.08)');g.addColorStop(1,'rgba(0,0,0,.25)');x.fillStyle=g;this.rr(x,M,M,BW,BH,5);x.fill();
   x.strokeStyle='rgba(255,255,255,.8)';x.lineWidth=1.2;this.rr(x,M+1.5,M+1.5,BW-3,BH-3,4);x.stroke();
   if(extra)extra(x);
   if(crack){x.strokeStyle='rgba(40,20,60,.75)';x.lineWidth=1.4;x.beginPath();x.moveTo(M+8,M+2);x.lineTo(M+15,M+9);x.lineTo(M+12,M+16);if(crack>1){x.moveTo(M+28,M+3);x.lineTo(M+24,M+10);x.lineTo(M+31,M+15)}x.stroke()}});
  for(const k of '123456')brick('b'+k,COL[k]);
  brick('bS',COL.S);brick('bS1',COL.S,1);brick('bG',COL.G,0,x=>{x.fillStyle='rgba(255,255,255,.9)';x.font='12px sans-serif';x.textAlign='center';x.fillText('★',M+BW/2,M+BH/2+4)});brick('bG1',COL.G,1);brick('bG2',COL.G,2);
  brick('bX',COL.X,0,x=>{x.fillStyle='rgba(30,30,50,.6)';[[5,5],[BW-5,5],[5,BH-5],[BW-5,BH-5]].forEach(([a,b])=>{x.beginPath();x.arc(M+a,M+b,1.8,0,7);x.fill()})});
  brick('bB',COL.B,0,x=>{x.fillStyle='#2a1020';x.beginPath();x.arc(M+BW/2,M+BH/2+1,5.5,0,7);x.fill();x.strokeStyle='#ffe04a';x.lineWidth=1.6;x.beginPath();x.moveTo(M+BW/2+3,M+BH/2-3);x.lineTo(M+BW/2+6,M+BH/2-7);x.stroke()});
  const pad=(k,w)=>this.tex(k,w+M*2,16+M*2,(x)=>{x.save();x.shadowColor='#4ad8ff';x.shadowBlur=12;const g=x.createLinearGradient(0,M,0,M+16);g.addColorStop(0,'#bff4ff');g.addColorStop(.5,'#4ad8ff');g.addColorStop(1,'#2a7ad0');x.fillStyle=g;this.rr(x,M,M,w,16,8);x.fill();x.restore();
   x.fillStyle='#ff5ad0';this.rr(x,M+2,M+4,10,8,4);x.fill();this.rr(x,M+w-12,M+4,10,8,4);x.fill();x.fillStyle='rgba(255,255,255,.7)';this.rr(x,M+14,M+3,w-28,3,1.5);x.fill()});
  pad('pad',84);pad('padW',128);
  this.tex('gun',10,14,x=>{x.fillStyle='#ff4f4f';this.rr(x,2,0,6,14,2);x.fill()});
  this.tex('ball',BALLR*2+12,BALLR*2+12,x=>{x.shadowColor='#fff';x.shadowBlur=10;x.fillStyle='#fff';x.beginPath();x.arc(BALLR+6,BALLR+6,BALLR,0,7);x.fill()});
  this.tex('fball',BALLR*2+12,BALLR*2+12,x=>{x.shadowColor='#ff7a2a';x.shadowBlur=12;const g=x.createRadialGradient(BALLR+6,BALLR+6,1,BALLR+6,BALLR+6,BALLR);g.addColorStop(0,'#fff6a0');g.addColorStop(1,'#ff5a2a');x.fillStyle=g;x.beginPath();x.arc(BALLR+6,BALLR+6,BALLR,0,7);x.fill()});
  this.tex('bul',6,14,x=>{x.shadowColor='#ff4f4f';x.shadowBlur=6;x.fillStyle='#ffd0d0';this.rr(x,1.5,1,3,12,1.5);x.fill()});
  for(const k in PW)this.tex('cap'+k,50,24,x=>{const c=PW[k].c;x.save();x.shadowColor=c;x.shadowBlur=8;x.fillStyle=c;this.rr(x,4,3,42,18,9);x.fill();x.restore();x.fillStyle='rgba(255,255,255,.35)';this.rr(x,8,5,34,5,2.5);x.fill();
   x.fillStyle='#fff';x.font='13px Jua, sans-serif';x.textAlign='center';x.textBaseline='middle';x.strokeStyle='rgba(0,0,0,.35)';x.lineWidth=3;x.strokeText(PW[k].t,25,12.5);x.fillText(PW[k].t,25,12.5)})}
 bindUI(){const sc=id=>{document.querySelectorAll('.scr').forEach(e=>e.classList.toggle('on',e.id===id));const pl=id===null;$('pbtn').style.display=pl?'block':'none';$('hud').classList.toggle('on',pl||id==='pause');$('hPw').classList.toggle('on',pl);$('hint').style.display=pl?'block':'none'};this.sc=sc;
  $('bGo').onclick=()=>{AU.init();AU.sfx('click');this.start(1)};$('bCont').onclick=()=>{AU.init();AU.sfx('click');this.start(S.top)};
  $('sbtn').onclick=()=>{S.snd=S.snd?0:1;AU.on=BGM.on=!!S.snd;SV.put();$('sbtn').textContent=S.snd?'🔊':'🔇';AU.init();AU.sfx('click')};$('sbtn').textContent=S.snd?'🔊':'🔇';
  $('pbtn').onclick=()=>{AU.sfx('click');this.paused=1;sc('pause')};$('pGo').onclick=()=>{this.paused=0;sc(null)};$('pHome').onclick=()=>{this.paused=0;this.home()};
  $('rRe').onclick=()=>{AU.sfx('click');this.start(this.startLv)};$('rHome').onclick=()=>{AU.sfx('click');this.home()}}
 home(){this.mode='home';this.clearBalls();this.clearCaps();$('hb').textContent='🏆 최고 '+S.best.toLocaleString();
  $('bCont').style.display=S.top>1?'block':'none';$('bCont').textContent=`⏩ ${S.top}단계부터`;this.sc('home');BGM.play('calm')}
 start(lv){this.startLv=lv;this.lv=lv;this.score=0;this.lives=3;this.mode='play';this.paused=0;this.sc(null);$('hint').style.opacity=1;this.newLevel()}
 newLevel(){this.t0=this.time.now;this.loadLevel(this.lv);this.resetPad();this.hud();BGM.play(this.lv%5===0?'boss':'play');this.show(`${this.lv}단계`)}
 show(t){this.big.setText(t).setAlpha(0).setScale(.5);this.tweens.killTweensOf(this.big);this.tweens.add({targets:this.big,alpha:1,scale:1,duration:280,ease:'Back.easeOut',yoyo:true,hold:700})}
 hud(){$('hL').textContent=this.lv+'단계';$('hS').textContent=this.score.toLocaleString();$('hV').textContent='♥'.repeat(Math.min(this.lives,6))||'-';
  $('hPw').innerHTML=Object.keys(this.pw).filter(k=>this.pw[k]>0).map(k=>`<span style="border:2px solid ${PW[k].c}">${PW[k].t} ${Math.ceil(this.pw[k])}</span>`).join('')}
 /* ---------- 단계 ---------- */
 loadLevel(lv){this.bricks.forEach(b=>b&&b.img.destroy());this.bricks=[];this.cells={};const m=lv<=MAPS.length?MAPS[lv-1]:genMap(lv);
  m.forEach((row,r)=>{for(let c=0;c<COLS;c++){const k=row[c];if(!k||k==='.')continue;const x=LEFT+c*CW+BW/2+1,y=TOP+r*CH+BH/2;
   const img=this.add.image(x,y,'b'+k).setScale(1/R).setDepth(10);const b={k,hp:HP[k]||1,x,y,r,c,img};this.bricks.push(b);this.cells[r+','+c]=b;
   img.setAlpha(0);this.tweens.add({targets:img,alpha:1,duration:250,delay:r*40+c*15})}});
  this.left=this.bricks.filter(b=>b.k!=='X').length}
 resetPad(){this.clearBalls();this.clearCaps();this.pw={};this.setWide(false);this.padX=W/2;this.addBall(this.padX,PY-16,0,0,true)}
 clearBalls(){this.balls.forEach(b=>b.img.destroy());this.balls=[]}
 clearCaps(){this.caps.forEach(c=>c.img.destroy());this.caps=[];this.buls.forEach(b=>b.img.destroy());this.buls=[]}
 addBall(x,y,vx,vy,stuck){const img=this.add.image(x,y,this.pw.F>0?'fball':'ball').setScale(1/R).setDepth(15);const b={x,y,vx,vy,img,stuck,off:0};this.balls.push(b);return b}
 speed(){return Math.min(560,390+this.lv*9)*(this.pw.S>0?.7:1)}
 launch(){if(this.time.now-(this.t0||0)<350)return;for(const b of this.balls)if(b.stuck){b.stuck=0;const a=(-90+rnd(-18,18))*Math.PI/180,s=this.speed();b.vx=Math.cos(a)*s;b.vy=Math.sin(a)*s;AU.sfx('shoot');$('hint').style.opacity=0}}
 setWide(on){this.padW=on?128:84;this.padG.setTexture(on?'padW':'pad');this.padX=clamp(this.padX,this.padW/2,W-this.padW/2)}
 /* ---------- 매 프레임 ---------- */
 update(t,dl){if(this.mode!=='play'||this.paused)return;const dt=Math.min(dl/1000,1/20);
  if(this.keys.LEFT.isDown)this.padX-=520*dt;if(this.keys.RIGHT.isDown)this.padX+=520*dt;this.padX=clamp(this.padX,this.padW/2,W-this.padW/2);if(Phaser.Input.Keyboard.JustDown(this.keys.SPACE))this.launch();
  this.padG.x+=(this.padX-this.padG.x)*Math.min(1,dt*30);const px=this.padG.x;
  // 효과 시간
  let ch=0;for(const k in this.pw)if(this.pw[k]>0){this.pw[k]-=dt;if(this.pw[k]<=0){this.pw[k]=0;ch=1;if(k==='W')this.setWide(false);if(k==='F')this.balls.forEach(b=>b.img.setTexture('ball'));if(k==='S')this.rescale(1/.7)}}
  if(ch||Math.floor(t/500)!==this.ht){this.ht=Math.floor(t/500);this.hud()}
  // 레이저
  const las=this.pw.L>0;this.padL.setVisible(las).setPosition(px-this.padW/2+8,PY-8);this.padR.setVisible(las).setPosition(px+this.padW/2-8,PY-8);
  if(las&&(this.lt=(this.lt||0)-dt)<=0){this.lt=.32;[px-this.padW/2+8,px+this.padW/2-8].forEach(x=>this.buls.push({x,y:PY-16,img:this.add.image(x,PY-16,'bul').setScale(1/R).setDepth(16)}));AU.tone(1400,.04,'square',.02,0,700)}
  for(const u of this.buls){u.y-=720*dt;u.img.y=u.y;const r=Math.floor((u.y-TOP)/CH),c=Math.floor((u.x-LEFT)/CW),b=this.cells[r+','+c];
   if(b&&Math.abs(u.y-b.y)<BH/2+6){u.dead=1;this.hit(b,1)}if(u.y<TOP-20)u.dead=1}
  this.buls=this.buls.filter(u=>{if(u.dead)u.img.destroy();return !u.dead});
  // 공
  for(const b of this.balls){if(b.stuck){b.x=px+b.off;b.y=PY-16;b.img.setPosition(b.x,b.y);continue}
   const sp=Math.hypot(b.vx,b.vy),n=Math.max(1,Math.ceil(sp*dt/4)),d=dt/n;
   for(let i=0;i<n&&!b.dead;i++){b.x+=b.vx*d;b.y+=b.vy*d;
    if(b.x<BALLR+4){b.x=BALLR+4;b.vx=Math.abs(b.vx);this.wallSnd()}if(b.x>W-BALLR-4){b.x=W-BALLR-4;b.vx=-Math.abs(b.vx);this.wallSnd()}if(b.y<TOP-30+BALLR){b.y=TOP-30+BALLR;b.vy=Math.abs(b.vy);this.wallSnd()}
    // 받침대
    if(b.vy>0&&b.y+BALLR>=PY-8&&b.y-BALLR<PY+8&&Math.abs(b.x-px)<this.padW/2+BALLR){const rel=clamp((b.x-px)/(this.padW/2),-1,1),a=(-90+rel*62)*Math.PI/180,s=Math.min(sp+3,this.speed()+190);
     b.vx=Math.cos(a)*s;b.vy=Math.sin(a)*s;b.y=PY-8-BALLR;this.combo=0;AU.tone(520+Math.abs(rel)*200,.07,'triangle',.12);this.tweens.add({targets:this.padG,scaleY:.8/R,duration:60,yoyo:true})}
    this.brickHit(b)}
   if(b.y>H+20)b.dead=1;b.img.setPosition(b.x,b.y);if(Math.random()<.5)this.emT.emitParticleAt(b.x,b.y,1)}
  this.balls=this.balls.filter(b=>{if(b.dead)b.img.destroy();return !b.dead});
  if(!this.balls.length)this.lose();
  // 캡슐
  for(const c of this.caps){c.y+=150*dt;c.img.setPosition(c.x,c.y);if(c.y>PY-14&&c.y<PY+14&&Math.abs(c.x-px)<this.padW/2+20){c.dead=1;this.power(c.k)}if(c.y>H+20)c.dead=1}
  this.caps=this.caps.filter(c=>{if(c.dead)c.img.destroy();return !c.dead})}
 wallSnd(){AU.tone(300,.04,'sine',.05)}
 brickHit(b){const r0=Math.floor((b.y-BALLR-TOP)/CH),r1=Math.floor((b.y+BALLR-TOP)/CH),c0=Math.floor((b.x-BALLR-LEFT)/CW),c1=Math.floor((b.x+BALLR-LEFT)/CW),fire=this.pw.F>0;
  for(let r=r0;r<=r1;r++)for(let c=c0;c<=c1;c++){const k=this.cells[r+','+c];if(!k)continue;
   const qx=clamp(b.x,k.x-BW/2,k.x+BW/2),qy=clamp(b.y,k.y-BH/2,k.y+BH/2);let dx=b.x-qx,dy=b.y-qy,d=Math.hypot(dx,dy);if(d>=BALLR)continue;
   if(fire&&k.k!=='X'){this.hit(k,9);continue}
   if(d<1e-6){const ox=BW/2+BALLR-Math.abs(b.x-k.x),oy=BH/2+BALLR-Math.abs(b.y-k.y);if(ox<oy){dx=Math.sign(b.x-k.x)||1;dy=0}else{dx=0;dy=Math.sign(b.y-k.y)||1}d=1;b.x+=dx*ox;b.y+=dy*oy}
   else{dx/=d;dy/=d;b.x=qx+dx*BALLR;b.y=qy+dy*BALLR}
   const vn=b.vx*dx+b.vy*dy;if(vn<0){b.vx-=2*vn*dx;b.vy-=2*vn*dy}
   // 너무 옆으로만 가지 않게
   const sp=Math.hypot(b.vx,b.vy);if(Math.abs(b.vy)<sp*.28){b.vy=Math.sign(b.vy||-1)*sp*.28;b.vx=Math.sign(b.vx)*Math.sqrt(sp*sp-b.vy*b.vy)}
   this.hit(k,1);return}}
 hit(k,dmg){if(k.dead)return;if(k.k==='X'){AU.tone(220,.05,'square',.05);this.tweens.add({targets:k.img,alpha:.6,duration:50,yoyo:true});return}
  k.hp-=dmg;if(k.hp>0){k.img.setTexture(k.k==='S'?'bS1':'bG'+(3-k.hp));AU.tone(700,.05,'triangle',.08);this.tweens.add({targets:k.img,scale:1.12/R,duration:60,yoyo:true});return}
  k.dead=1;delete this.cells[k.r+','+k.c];this.left--;this.combo=(this.combo||0)+1;const pts=Math.round((HP[k.k]||1)*10*(1+Math.min(this.combo,20)*.1));this.score+=pts;
  const col=Phaser.Display.Color.HexStringToColor(COL[k.k]).color;this.emB.setParticleTint(col);this.emB.explode(10,k.x,k.y);AU.sfx('pop',Math.min(this.combo,10));
  this.tweens.add({targets:k.img,scale:1.4/R,alpha:0,duration:160,onComplete:()=>k.img.destroy()});
  if(this.combo>=5&&this.combo%5===0)KIT.floatText(this,k.x,k.y,this.combo+' 연속!','#ffe04a',22,50);
  if(k.k==='B'){AU.sfx('boom');this.cameras.main.shake(180,.008);this.emS.explode(14,k.x,k.y);this.time.delayedCall(70,()=>{for(let r=k.r-1;r<=k.r+1;r++)for(let c=k.c-1;c<=k.c+1;c++){const n=this.cells[r+','+c];if(n&&n.k!=='X')this.hit(n,9)}})}
  if(Math.random()<(this.balls.length>3?.07:.14)){const ks=['W','M','L','F','S','W','M','F'];if(Math.random()<.08)ks.push('H');const t=pick(ks);this.caps.push({k:t,x:k.x,y:k.y,img:this.add.image(k.x,k.y,'cap'+t).setScale(1/R).setDepth(18)})}
  for(const b of this.balls){const sp=Math.hypot(b.vx,b.vy);if(sp&&sp<this.speed()+150){const f=(sp+2)/sp;b.vx*=f;b.vy*=f}}
  this.hud();if(this.left<=0)this.clear()}
 power(k){AU.sfx('heal');const p=PW[k];KIT.floatText(this,this.padG.x,PY-30,p.t+'!',p.c,22,50);
  if(k==='W'){this.setWide(true);this.pw.W=p.d}
  else if(k==='M'){const add=[];for(const b of this.balls.slice(0,6)){if(b.stuck)continue;const s=Math.hypot(b.vx,b.vy),a=Math.atan2(b.vy,b.vx);[-.38,.38].forEach(o=>add.push([b.x,b.y,Math.cos(a+o)*s,Math.sin(a+o)*s]))}add.forEach(a=>this.addBall(...a,false))}
  else if(k==='L'){this.pw.L=p.d}
  else if(k==='F'){this.pw.F=p.d;this.balls.forEach(b=>b.img.setTexture('fball'))}
  else if(k==='S'){if(!(this.pw.S>0))this.rescale(.7);this.pw.S=p.d}
  else if(k==='H'){this.lives++}this.hud()}
 rescale(f){for(const b of this.balls){b.vx*=f;b.vy*=f}}
 lose(){if(this.left<=0)return;this.lives--;AU.sfx('hurt');this.cameras.main.shake(250,.01);this.cameras.main.flash(200,120,0,40);
  if(this.lives<=0){this.over();return}this.hud();this.resetPad();this.show('♥ '+this.lives)}
 clear(){this.mode='wait';const bonus=this.lives*100;this.score+=bonus;this.clearBalls();this.clearCaps();this.emS.explode(60,W/2,H*.45);AU.sfx('level');this.show('클리어! +'+bonus);
  this.lv++;if(this.lv>S.top){S.top=this.lv;SV.put()}this.hud();this.time.delayedCall(1700,()=>{if(this.mode!=='wait')return;this.mode='play';this.newLevel()})}
 over(){this.mode='res';AU.sfx('lose');BGM.stop();S.games++;const nb=this.score>S.best;if(nb)S.best=this.score;SV.put();
  $('rT').textContent=nb?'🎉 새 최고 기록!':'💥 게임 끝!';$('rB').innerHTML=`<div class="rline">점수 <b>${this.score.toLocaleString()}</b></div><div class="rline">${this.lv}단계까지 · 최고 ${S.best.toLocaleString()}</div>`;if(nb)AU.sfx('win');
  this.time.delayedCall(500,()=>this.sc('res'))}
}
new Phaser.Game({type:Phaser.AUTO,parent:'game',width:W*R,height:H*R,backgroundColor:'#1a0f3e',scale:{mode:Phaser.Scale.FIT,autoCenter:Phaser.Scale.CENTER_BOTH},render:{antialias:true},audio:{noAudio:true},
 scene:[{key:'boot',create(){KIT.fontReady().then(()=>this.scene.start('main'))}},Main]});
$('ui').style.width=W+'px';$('ui').style.height=H+'px';
})();
