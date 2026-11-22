/* 방울 터뜨리기 — 버블 슈터 (Phaser). 같은 색 3개 이상 붙으면 퐁, 매달린 방울은 우수수
   저장: localStorage 'bubblePopV1' {top, best, snd, games} */
(()=>{'use strict';
const {R,rnd,pick,clamp,$,AU,BGM}=KIT;
const SZ=KIT.size(420,680,940),W=SZ.W,H=SZ.H;
const COLS=10,BR=W/(COLS*2+1),RH=BR*Math.sqrt(3),TOP0=64,SX=W/2,SY=H-92,DANGER=SY-BR*2.6,SPD=950,DROP=8;
const COLR=[0xff5a7a,0xffb23a,0xffe04a,0x5ed67a,0x4ab8ff,0xb07aff];
const SV=KIT.save('bubblePopV1',()=>({top:1,best:0,snd:1,games:0}));const S=SV.data;

class Main extends Phaser.Scene{constructor(){super('main')}
 create(){window.__bp2=this;KIT.ready(this,W,H);KIT.textures(this);
  KIT.tex(this,'bg',W,H,x=>{const g=x.createLinearGradient(0,0,0,H);g.addColorStop(0,'#cfeeff');g.addColorStop(1,'#fdf0ff');x.fillStyle=g;x.fillRect(0,0,W,H);
   for(let i=0;i<30;i++){x.strokeStyle='rgba(255,255,255,.7)';x.lineWidth=2;x.beginPath();x.arc(Math.random()*W,Math.random()*H,4+Math.random()*16,0,7);x.stroke()}
   x.fillStyle='rgba(120,160,220,.12)';x.fillRect(0,SY-30,W,H-SY+30)});
  COLR.forEach((c,i)=>KIT.tex(this,'b'+i,BR*2+2,BR*2+2,x=>{const h='#'+c.toString(16).padStart(6,'0'),k=BR+1,g=x.createRadialGradient(k-BR*.35,k-BR*.4,2,k,k,BR);g.addColorStop(0,'#ffffff');g.addColorStop(.25,h);g.addColorStop(1,h);
   x.fillStyle=g;x.beginPath();x.arc(k,k,BR-.5,0,7);x.fill();x.strokeStyle='rgba(0,0,0,.12)';x.lineWidth=1.5;x.stroke();x.fillStyle='rgba(255,255,255,.85)';x.beginPath();x.ellipse(k-BR*.38,k-BR*.42,BR*.22,BR*.14,-.6,0,7);x.fill();
   x.fillStyle='rgba(60,30,60,.55)';x.beginPath();x.arc(k-BR*.25,k+BR*.05,1.8,0,7);x.arc(k+BR*.25,k+BR*.05,1.8,0,7);x.fill();x.strokeStyle='rgba(60,30,60,.55)';x.lineWidth=1.4;x.beginPath();x.arc(k,k+BR*.15,BR*.18,.2,Math.PI-.2);x.stroke()}));
  KIT.tex(this,'cannon',70,70,x=>{x.fillStyle='#8a7ad0';KIT.rr(x,26,4,18,40,8);x.fill();x.fillStyle='#b5a8ff';KIT.rr(x,29,6,5,34,2.5);x.fill();x.fillStyle='#6a5ab0';x.beginPath();x.arc(35,48,20,0,7);x.fill();x.fillStyle='#fff';x.globalAlpha=.25;x.beginPath();x.arc(29,42,7,0,7);x.fill()});
  this.add.image(W/2,H/2,'bg').setScale(1/R).setDepth(-5);
  this.dl=this.add.graphics().setDepth(1);this.guide=this.add.graphics().setDepth(2);
  this.can=this.add.image(SX,SY+6,'cannon').setScale(1/R).setOrigin(.5,.68).setDepth(5);
  this.fx=this.add.particles(0,0,'dot',{lifespan:500,speed:{min:50,max:200},scale:{start:.45,end:0},emitting:false}).setDepth(30);
  this.big=KIT.text(this,W/2,H*.45,'',38,'#fff','#3a70b0').setDepth(50).setAlpha(0);
  this.cells={};this.ang=-Math.PI/2;
  this.input.on('pointerdown',p=>{if(this.mode!=='play'||this.paused)return;const x=p.x/R,y=p.y/R;if(Math.hypot(x-(SX+62),y-SY)<34){this.swap();return}this.aiming=true;this.aimAt(x,y)});
  this.input.on('pointermove',p=>{if(this.aiming)this.aimAt(p.x/R,p.y/R)});
  this.input.on('pointerup',()=>{if(!this.aiming)return;this.aiming=false;this.guide.clear();this.fire()});
  this.ui=KIT.shell({S,SV,start:k=>this.start(k==='cur'?this.lv:k?S.top:1),home:()=>this.home(),pause:on=>this.paused=on,again:()=>'cur'});
  this.home()}
 key(r,c){return r+','+c}
 cx(r,c){return BR+c*BR*2+(r%2?BR:0)}
 cy(r){return this.topY+BR+r*RH}
 nb(r,c){const o=r%2?[[0,-1],[0,1],[-1,0],[-1,1],[1,0],[1,1]]:[[0,-1],[0,1],[-1,-1],[-1,0],[1,-1],[1,0]];return o.map(([a,b])=>[r+a,c+b]).filter(([a,b])=>a>=0&&b>=0&&b<COLS)}
 home(){this.mode='home';this.clear();$('bGo2').style.display=S.top>1?'block':'none';$('bGo2').textContent=`⏩ ${S.top}단계부터`;this.ui.best(`🏆 최고 ${S.best.toLocaleString()}점 · ${S.top}단계`);this.ui.sc('home');BGM.play('calm');if(this.shot){this.shot.img.destroy();this.shot=null}}
 clear(){Object.values(this.cells).forEach(b=>b.img.destroy());this.cells={};if(this.cur)this.cur.destroy();if(this.nxt)this.nxt.destroy();this.cur=this.nxt=null}
 start(lv){this.lv=lv;this.score=0;this.mode='play';this.paused=false;this.ui.sc(null);BGM.play('bright');this.level()}
 level(){this.clear();this.topY=TOP0;this.shots=0;const nc=Math.min(6,3+Math.floor((this.lv-1)/2)),rows=Math.min(10,4+Math.floor(this.lv/2));this.nc=nc;
  let s=this.lv*7919;const rr=()=>(s=(s*9301+49297)%233280)/233280;
  for(let r=0;r<rows;r++)for(let c=0;c<COLS;c++){if(r%2&&c===COLS-1)continue;let col=Math.floor(rr()*nc);if(c>0&&rr()<.45&&this.cells[this.key(r,c-1)])col=this.cells[this.key(r,c-1)].col;this.put(r,c,col,true)}
  this.cur=this.mkBall(this.pickCol(),SX,SY);this.nxt=this.mkBall(this.pickCol(),SX+62,SY+6).setScale(.8/R);this.hud();this.show(`${this.lv}단계`);this.drawDanger()}
 show(t){this.big.setText(t).setAlpha(0).setScale(.5);this.tweens.killTweensOf(this.big);this.tweens.add({targets:this.big,alpha:1,scale:1,duration:280,ease:'Back.easeOut',yoyo:true,hold:700})}
 hud(){this.ui.hud(this.lv+'단계',this.score.toLocaleString(),`⬇ ${DROP-this.shots%DROP}`)}
 mkBall(col,x,y){const b=this.add.image(x,y,'b'+col).setScale(1/R).setDepth(6);b.col=col;return b}
 pickCol(){const have=[...new Set(Object.values(this.cells).map(b=>b.col))];return have.length?pick(have):Math.floor(Math.random()*this.nc)}
 put(r,c,col,init){const img=this.add.image(this.cx(r,c),this.cy(r),'b'+col).setScale(1/R).setDepth(4);const b={r,c,col,img};this.cells[this.key(r,c)]=b;if(init){img.setScale(0);this.tweens.add({targets:img,scale:1/R,duration:200,delay:r*30+c*10})}return b}
 swap(){if(!this.cur||this.shot)return;const a=this.cur.col;this.cur.col=this.nxt.col;this.nxt.col=a;this.cur.setTexture('b'+this.cur.col);this.nxt.setTexture('b'+this.nxt.col);AU.sfx('pick')}
 aimAt(x,y){let a=Math.atan2(y-SY,x-SX);if(a>0)a=x<SX?-Math.PI+.15:-.15;this.ang=clamp(a,-Math.PI+.15,-.15);this.can.setRotation(this.ang+Math.PI/2);this.drawGuide()}
 drawGuide(){const g=this.guide;g.clear();if(!this.cur)return;let x=SX,y=SY,vx=Math.cos(this.ang),vy=Math.sin(this.ang),len=0,col=COLR[this.cur.col];
  for(let i=0;i<70&&len<760;i++){x+=vx*12;y+=vy*12;len+=12;if(x<BR){x=BR*2-x;vx=-vx}if(x>W-BR){x=(W-BR)*2-x;vx=-vx}if(y<this.topY+BR||this.hitAt(x,y))break;g.fillStyle(col,1-len/800);g.fillCircle(x,y,3)}}
 hitAt(x,y){for(const b of Object.values(this.cells)){if(Math.hypot(b.img.x-x,b.img.y-y)<BR*1.75)return b}return null}
 fire(){if(!this.cur||this.shot||this.mode!=='play')return;this.shot={img:this.cur,x:SX,y:SY,vx:Math.cos(this.ang)*SPD,vy:Math.sin(this.ang)*SPD};this.cur=null;AU.sfx('shoot');
  this.tweens.add({targets:this.nxt,x:SX,y:SY,scale:1/R,duration:150});this.time.delayedCall(160,()=>{if(this.mode!=='play')return;this.cur=this.nxt;this.nxt=this.mkBall(this.pickCol(),SX+62,SY+6).setScale(.8/R)})}
 land(x,y,col){// 가장 가까운 빈칸에 붙이기
  let best=null,bd=1e9;const r0=Math.max(0,Math.floor((y-this.topY)/RH)-1);
  for(let r=r0;r<=r0+2;r++)for(let c=0;c<COLS;c++){if(r%2&&c===COLS-1)continue;if(this.cells[this.key(r,c)])continue;const ok=r===0||this.nb(r,c).some(([a,b])=>this.cells[this.key(a,b)]);if(!ok)continue;const d=Math.hypot(this.cx(r,c)-x,this.cy(r)-y);if(d<bd){bd=d;best=[r,c]}}
  if(!best)best=[0,clamp(Math.round((x-BR)/(BR*2)),0,COLS-1)];const b=this.put(best[0],best[1],col);AU.sfx('place');
  // 같은 색 찾기
  const grp=[b],seen=new Set([this.key(b.r,b.c)]);for(let i=0;i<grp.length;i++)for(const [a,c] of this.nb(grp[i].r,grp[i].c)){const k=this.key(a,c),o=this.cells[k];if(o&&!seen.has(k)&&o.col===col){seen.add(k);grp.push(o)}}
  let popped=0,dropped=0;
  if(grp.length>=3){grp.forEach((o,i)=>{delete this.cells[this.key(o.r,o.c)];this.time.delayedCall(i*30,()=>{this.fx.setParticleTint(COLR[o.col]);this.fx.explode(8,o.img.x,o.img.y);AU.sfx('pop',Math.min(i,10));this.tweens.add({targets:o.img,scale:1.4/R,alpha:0,duration:140,onComplete:()=>o.img.destroy()})})});popped=grp.length;
   // 매달린 방울
   const keep=new Set(),q=Object.values(this.cells).filter(o=>o.r===0);q.forEach(o=>keep.add(this.key(o.r,o.c)));for(let i=0;i<q.length;i++)for(const [a,c] of this.nb(q[i].r,q[i].c)){const k=this.key(a,c);if(this.cells[k]&&!keep.has(k)){keep.add(k);q.push(this.cells[k])}}
   for(const [k,o] of Object.entries(this.cells))if(!keep.has(k)){delete this.cells[k];dropped++;this.tweens.add({targets:o.img,y:H+40,x:o.img.x+rnd(-30,30),angle:rnd(-90,90),duration:rnd(600,900),ease:'Quad.easeIn',delay:150,onComplete:()=>o.img.destroy()})}
   const pts=popped*10+dropped*20*(1+Math.floor(dropped/5));this.score+=pts;KIT.floatText(this,x,y,'+'+pts,'#fff',22,40);if(dropped>=3){AU.sfx('clear',dropped);this.show(dropped>=8?'와르르르!':'우수수!')}}
  else{this.shots++;if(this.shots%DROP===0)this.lower()}
  this.hud();
  if(!Object.keys(this.cells).length){this.win();return}
  if(Object.values(this.cells).some(o=>this.cy(o.r)>DANGER))this.over()}
 lower(){this.topY+=RH;AU.sfx('thud');this.cameras.main.shake(150,.006);for(const o of Object.values(this.cells))this.tweens.add({targets:o.img,y:this.cy(o.r),duration:200});this.drawDanger()}
 drawDanger(){const g=this.dl;g.clear();g.lineStyle(2,0xff7a9a,.5);for(let x=0;x<W;x+=16)g.lineBetween(x,DANGER+BR,x+8,DANGER+BR);g.fillStyle(0x8a7ad0,.25);g.fillRect(0,0,W,this.topY)}
 win(){this.mode='wait';const bonus=200+this.lv*50;this.score+=bonus;AU.sfx('level');this.show('🎉 깨끗! +'+bonus);this.fx.setParticleTint(0xffd93b);this.fx.explode(40,W/2,H/2);
  this.lv++;if(this.lv>S.top)S.top=this.lv;if(this.score>S.best)S.best=this.score;SV.put();this.time.delayedCall(1600,()=>{if(this.mode!=='wait')return;this.mode='play';this.level()})}
 over(){this.mode='over';AU.sfx('lose');S.games++;const nb=this.score>S.best;if(nb)S.best=this.score;SV.put();
  this.time.delayedCall(700,()=>this.ui.result(nb?'🎉 새 최고 기록!':'방울이 너무 내려왔어요',`<div class="rline">점수 <b>${this.score.toLocaleString()}</b></div><div class="rline" style="font-size:18px">${this.lv}단계 · 🏆 최고 ${S.best.toLocaleString()}</div>`,nb))}
 update(t,dl){if(this.mode!=='play'||this.paused||!this.shot)return;const dt=Math.min(dl/1000,.04),s=this.shot,n=Math.ceil(SPD*dt/8),d=dt/n;
  for(let i=0;i<n;i++){s.x+=s.vx*d;s.y+=s.vy*d;if(s.x<BR){s.x=BR*2-s.x;s.vx=-s.vx;AU.tone(500,.03,'sine',.05)}if(s.x>W-BR){s.x=(W-BR)*2-s.x;s.vx=-s.vx;AU.tone(500,.03,'sine',.05)}
   if(s.y<=this.topY+BR||this.hitAt(s.x,s.y)){const col=s.img.col;s.img.destroy();this.shot=null;this.land(s.x,s.y,col);return}}
  s.img.setPosition(s.x,s.y)}
}
KIT.boot(Main,{W,H,bg:'#cfeeff'});
})();
