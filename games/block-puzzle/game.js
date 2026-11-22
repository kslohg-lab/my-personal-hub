/* 동물 블록 퍼즐 — 8×8 판에 블록 3개씩 놓아 줄을 지우는 퍼즐 (블록 블래스트 방식)
   저장: localStorage 'blockPuzzleV1' {best, snd, cur:{판·손패·점수…}} */
(()=>{'use strict';
const {R,rnd,pick,clamp,$,IMG,AU,BGM}=KIT;
const SZ=KIT.size(420,700,940),W=SZ.W,H=SZ.H;
const N=8,C=46,BW=N*C,X0=(W-BW)/2,Y0=Math.round(128+(H-760)*.42),TRAY_Y=Math.round(Y0+BW+(H-Y0-BW)/2+6),TS=.56;
const COLS=[0xff7eb3,0xffad4d,0xffd93b,0x6fd67a,0x45cfc0,0x5aa9ff,0xa685ff];
const CSS=['#ff7eb3','#ffad4d','#ffd93b','#6fd67a','#45cfc0','#5aa9ff','#a685ff'];
const SH={
 o1:[[0,0]],h2:[[0,0],[0,1]],v2:[[0,0],[1,0]],h3:[[0,0],[0,1],[0,2]],v3:[[0,0],[1,0],[2,0]],h4:[[0,0],[0,1],[0,2],[0,3]],v4:[[0,0],[1,0],[2,0],[3,0]],h5:[[0,0],[0,1],[0,2],[0,3],[0,4]],v5:[[0,0],[1,0],[2,0],[3,0],[4,0]],
 q2:[[0,0],[0,1],[1,0],[1,1]],q3:[[0,0],[0,1],[0,2],[1,0],[1,1],[1,2],[2,0],[2,1],[2,2]],r23:[[0,0],[0,1],[0,2],[1,0],[1,1],[1,2]],r32:[[0,0],[0,1],[1,0],[1,1],[2,0],[2,1]],
 c1:[[0,0],[1,0],[1,1]],c2:[[0,0],[0,1],[1,0]],c3:[[0,0],[0,1],[1,1]],c4:[[0,1],[1,0],[1,1]],
 b1:[[0,0],[1,0],[2,0],[2,1],[2,2]],b2:[[0,0],[0,1],[0,2],[1,0],[2,0]],b3:[[0,0],[0,1],[0,2],[1,2],[2,2]],b4:[[0,2],[1,2],[2,2],[2,1],[2,0]],
 l1:[[0,0],[1,0],[2,0],[2,1]],l2:[[0,0],[0,1],[0,2],[1,0]],l3:[[0,0],[0,1],[1,1],[2,1]],l4:[[1,0],[1,1],[1,2],[0,2]],j1:[[0,1],[1,1],[2,1],[2,0]],j2:[[0,0],[1,0],[1,1],[1,2]],j3:[[0,0],[0,1],[1,0],[2,0]],j4:[[0,0],[0,1],[0,2],[1,2]],
 t1:[[0,0],[0,1],[0,2],[1,1]],t2:[[0,1],[1,0],[1,1],[2,1]],t3:[[1,0],[1,1],[1,2],[0,1]],t4:[[0,0],[1,0],[2,0],[1,1]],
 s1:[[0,1],[0,2],[1,0],[1,1]],s2:[[0,0],[1,0],[1,1],[2,1]],z1:[[0,0],[0,1],[1,1],[1,2]],z2:[[0,1],[1,1],[1,0],[2,0]]};
const WT={o1:3,h2:5,v2:5,h3:5,v3:5,h4:3,v4:3,h5:2,v5:2,q2:5,q3:2,r23:2,r32:2,c1:3,c2:3,c3:3,c4:3,b1:1.4,b2:1.4,b3:1.4,b4:1.4,l1:1.3,l2:1.3,l3:1.3,l4:1.3,j1:1.3,j2:1.3,j3:1.3,j4:1.3,t1:1.4,t2:1.4,t3:1.4,t4:1.4,s1:1.2,s2:1.2,z1:1.2,z2:1.2};
const PRAISE=['','좋아요!','멋져요!','대단해요!','최고예요!!','전설이에요!!!'];
const SV=KIT.save('blockPuzzleV1',()=>({best:0,snd:1,cur:null,games:0}));const S=SV.data;AU.on=!!S.snd;BGM.on=!!S.snd;
const dim=k=>{const c=SH[k];return {r:Math.max(...c.map(p=>p[0]))+1,c:Math.max(...c.map(p=>p[1]))+1}};

class Boot extends Phaser.Scene{constructor(){super('boot')}
 preload(){this.load.on('progress',v=>$('lbar').style.width=Math.round(v*100)+'%');[0,1,2,3,6,7,8,9,30,31,32].forEach(i=>this.load.image('ch'+i,IMG+'ch/'+KIT.pad2(i)+'.webp'));this.load.image('star',IMG+'it/star.webp')}
 create(){KIT.fontReady().then(()=>this.scene.start('main'))}}

class Main extends Phaser.Scene{constructor(){super('main')}
 create(){window.__bp=this;KIT.textures(this);this.cameras.main.setZoom(R).centerOn(W/2,H/2);this.mkTex();
  // 배경
  const bg=this.textures.createCanvas('bg',4,H),x=bg.getContext(),gr=x.createLinearGradient(0,0,0,H);gr.addColorStop(0,'#c9b6ff');gr.addColorStop(.5,'#f3c9f0');gr.addColorStop(1,'#ffe3c9');x.fillStyle=gr;x.fillRect(0,0,4,H);bg.refresh();
  this.add.image(0,0,'bg').setOrigin(0).setDisplaySize(W,H);
  this.add.particles(0,0,'dot',{x:{min:0,max:W},y:H+10,lifespan:9000,speedY:{min:-40,max:-15},speedX:{min:-8,max:8},scale:{min:.3,max:.9},alpha:{start:.45,end:0},tint:[0xffffff,0xffe6fa,0xe6deff],frequency:350}).setDepth(1);
  // 판
  const pg=this.add.graphics().setDepth(2);pg.fillStyle(0x5b3f8c,.28);pg.fillRoundedRect(X0-12,Y0-12+5,BW+24,BW+24,22);pg.fillStyle(0x3d2a66,1);pg.fillRoundedRect(X0-12,Y0-12,BW+24,BW+24,22);
  for(let r=0;r<N;r++)for(let c=0;c<N;c++){pg.fillStyle(0x2c1e4d,1);pg.fillRoundedRect(X0+c*C+2,Y0+r*C+2,C-4,C-4,8);pg.fillStyle(0x4a3678,.55);pg.fillRoundedRect(X0+c*C+4,Y0+r*C+4,C-8,C-10,7)}
  this.hl=this.add.graphics().setDepth(4);
  // 마스코트
  this.mas=this.add.image(X0+46,Y0-12,'ch0').setOrigin(.5,1).setDepth(6);this.mas.setScale(62/this.mas.frame.height);this.masS=this.mas.scaleX;
  this.tweens.add({targets:this.mas,y:Y0-16,duration:900,yoyo:true,repeat:-1,ease:'Sine.easeInOut'});
  // HUD
  this.scoreTx=KIT.text(this,W/2,78,'0',46,'#ffffff','#6a4aa8').setDepth(20);this.bestTx=KIT.text(this,W/2,34,'👑 0',20,'#fff3b0','#6a4aa8').setDepth(20);
  this.comboTx=KIT.text(this,W-70,Y0-30,'',20,'#ffe066','#6a4aa8').setDepth(20);
  this.em=this.add.particles(0,0,'spark',{emitting:false,lifespan:650,speed:{min:80,max:260},scale:{start:.9,end:0},rotate:{min:0,max:360}}).setDepth(30);
  this.emDot=this.add.particles(0,0,'dot',{emitting:false,lifespan:500,speed:{min:60,max:200},scale:{start:.7,end:0},alpha:{start:1,end:0}}).setDepth(30);
  this.emHeart=this.add.particles(0,0,'dot',{emitting:false,lifespan:900,speedY:{min:-160,max:-80},speedX:{min:-60,max:60},scale:{start:.6,end:0},tint:[0xff7eb3,0xffb3d9,0xffffff]}).setDepth(30);
  // 입력
  this.input.on('pointerdown',p=>this.down(p));this.input.on('pointermove',p=>this.move(p));this.input.on('pointerup',p=>this.up(p));this.input.on('gameout',()=>this.drag&&this.up(this.drag.ptr||{worldX:-999,worldY:-999}));
  this.grid=[...Array(N)].map(()=>Array(N).fill(null));this.tray=[null,null,null];this.score=0;this.shown=0;this.mode='home';
  this.bindUI();$('load').style.display='none';KIT.fitUI(W);addEventListener('resize',()=>setTimeout(()=>KIT.fitUI(W),60));this.scale.on('resize',()=>setTimeout(()=>KIT.fitUI(W),30));
  this.home();
 }
 mkTex(){COLS.forEach((col,i)=>{const s=64,c=this.textures.createCanvas('b'+i,s,s),x=c.getContext(),hex=CSS[i];
   const lighten=(h,a)=>{const n=parseInt(h.slice(1),16);let r=n>>16,g=n>>8&255,b=n&255;r=Math.round(r+(255-r)*a);g=Math.round(g+(255-g)*a);b=Math.round(b+(255-b)*a);return `rgb(${r},${g},${b})`};
   const dark=(h,a)=>{const n=parseInt(h.slice(1),16);return `rgb(${Math.round((n>>16)*(1-a))},${Math.round((n>>8&255)*(1-a))},${Math.round((n&255)*(1-a))})`};
   const rr=(X,Y,w,h,r)=>{x.beginPath();x.moveTo(X+r,Y);x.arcTo(X+w,Y,X+w,Y+h,r);x.arcTo(X+w,Y+h,X,Y+h,r);x.arcTo(X,Y+h,X,Y,r);x.arcTo(X,Y,X+w,Y,r);x.closePath()};
   x.fillStyle=dark(hex,.25);rr(2,4,60,58,14);x.fill();
   const g=x.createLinearGradient(0,2,0,56);g.addColorStop(0,lighten(hex,.35));g.addColorStop(1,hex);x.fillStyle=g;rr(2,2,60,54,14);x.fill();
   x.fillStyle='rgba(255,255,255,.55)';rr(9,7,46,10,5);x.fill();
   x.fillStyle=dark(hex,.55);x.beginPath();x.arc(23,33,4,0,7);x.arc(41,33,4,0,7);x.fill();
   x.fillStyle='#fff';x.beginPath();x.arc(24.3,31.7,1.4,0,7);x.arc(42.3,31.7,1.4,0,7);x.fill();
   x.fillStyle='rgba(255,120,150,.45)';x.beginPath();x.ellipse(16,41,4.5,3,0,0,7);x.ellipse(48,41,4.5,3,0,0,7);x.fill();
   x.strokeStyle=dark(hex,.55);x.lineWidth=2.2;x.lineCap='round';x.beginPath();x.arc(32,38,3.5,.2,Math.PI-.2);x.stroke();c.refresh()});
  const c=this.textures.createCanvas('gray',64,64),x=c.getContext();x.fillStyle='#8a809e';x.beginPath();x.roundRect?x.roundRect(2,2,60,58,14):x.rect(2,2,60,58);x.fill();x.fillStyle='rgba(255,255,255,.3)';x.fillRect(10,8,44,8);c.refresh()}
 /* ---- 화면 ---- */
 bindUI(){const sc=(id)=>{document.querySelectorAll('.scr').forEach(e=>e.classList.toggle('on',e.id===id));$('pbtn').style.display=id===null?'block':'none'};this.sc=sc;
  $('bGo').onclick=()=>{AU.init();AU.sfx('click');S.cur=null;SV.put();this.newGame()};
  $('bCont').onclick=()=>{AU.init();AU.sfx('click');this.loadGame()};
  $('sbtn').onclick=()=>{S.snd=S.snd?0:1;AU.on=BGM.on=!!S.snd;SV.put();$('sbtn').textContent=S.snd?'🔊':'🔇';AU.init();AU.sfx('click')};$('sbtn').textContent=S.snd?'🔊':'🔇';
  $('pbtn').onclick=()=>{AU.sfx('click');this.saveCur();sc('pause')};$('pGo').onclick=()=>{AU.sfx('click');sc(null)};
  $('pNew').onclick=()=>{AU.sfx('click');S.cur=null;SV.put();this.newGame()};$('pHome').onclick=()=>{AU.sfx('click');this.saveCur();this.home()};
  $('rRe').onclick=()=>{AU.sfx('click');this.newGame()};$('rHome').onclick=()=>{AU.sfx('click');this.home()}}
 home(){this.mode='home';this.clearAll();$('hb').textContent='👑 최고 '+S.best;$('bCont').style.display=S.cur?'block':'none';this.bestTx.setText('👑 '+S.best);this.scoreTx.setText('');this.sc('home');BGM.play('calm');
  // 처음 화면 장식: 판에 블록 몇 개
  for(let i=0;i<14;i++){const r=KIT.rnd(0,N)|0,c=KIT.rnd(0,N)|0;if(!this.grid[r][c])this.setCell(r,c,(Math.random()*7)|0,true)}}
 clearAll(){for(let r=0;r<N;r++)for(let c=0;c<N;c++)if(this.grid[r][c]){this.grid[r][c].img.destroy();this.grid[r][c]=null}this.tray.forEach(t=>t&&t.cont.destroy());this.tray=[null,null,null];this.hl.clear();this.mas.setAngle(0)}
 newGame(){this.clearAll();this.score=0;this.shown=0;this.combo=0;this.streak=0;this.moves=0;this.mode='play';this.scoreTx.setText('0');this.bestTx.setText('👑 '+S.best);this.comboTx.setText('');this.sc(null);this.deal();BGM.play('calm');S.games++;this.saveCur()}
 saveCur(){if(this.mode!=='play'){return}const g=[];for(let r=0;r<N;r++)for(let c=0;c<N;c++)g.push(this.grid[r][c]?this.grid[r][c].col:-1);
  S.cur={g,t:this.tray.map(t=>t?[t.k,t.col]:null),s:this.score,cb:this.combo,st:this.streak,m:this.moves};SV.put()}
 loadGame(){const cu=S.cur;if(!cu)return this.newGame();this.clearAll();this.mode='play';cu.g.forEach((v,i)=>{if(v>=0)this.setCell(Math.floor(i/N),i%N,v,true)});
  this.score=cu.s||0;this.shown=this.score;this.combo=cu.cb||0;this.streak=cu.st||0;this.moves=cu.m||0;this.scoreTx.setText(this.score);this.sc(null);
  cu.t.forEach((t,i)=>{if(t&&SH[t[0]])this.makePiece(i,t[0],t[1])});if(this.tray.every(t=>!t))this.deal();else this.checkOver()}
 /* ---- 판 ---- */
 setCell(r,c,col,quiet){const img=this.add.image(X0+c*C+C/2,Y0+r*C+C/2,'b'+col).setDepth(5);img.setScale((C-2)/64);this.grid[r][c]={col,img};if(!quiet){img.setScale(.2*(C-2)/64);this.tweens.add({targets:img,scale:(C-2)/64,duration:180,ease:'Back.easeOut'})}return img}
 fits(k,r0,c0){for(const [r,c] of SH[k]){const R_=r0+r,C_=c0+c;if(R_<0||C_<0||R_>=N||C_>=N||this.grid[R_][C_])return false}return true}
 anyFit(k){const d=dim(k);for(let r=0;r<=N-d.r;r++)for(let c=0;c<=N-d.c;c++)if(this.fits(k,r,c))return true;return false}
 linesIf(k,r0,c0){const occ=(r,c)=>this.grid[r][c]||SH[k].some(p=>p[0]+r0===r&&p[1]+c0===c);const rows=[],cols=[];
  for(let r=0;r<N;r++){let f=true;for(let c=0;c<N;c++)if(!occ(r,c)){f=false;break}if(f)rows.push(r)}
  for(let c=0;c<N;c++){let f=true;for(let r=0;r<N;r++)if(!occ(r,c)){f=false;break}if(f)cols.push(c)}return {rows,cols}}
 /* ---- 손패 ---- */
 deal(){const keys=Object.keys(SH),tot=keys.reduce((a,k)=>a+this.w(k),0);const pickOne=()=>{let x=Math.random()*tot;for(const k of keys){if((x-=this.w(k))<0)return k}return 'o1'};
  let set;for(let tries=0;tries<30;tries++){set=[pickOne(),pickOne(),pickOne()];
   // 가끔은 바로 줄을 지울 수 있는 블록을 하나 섞어 줘요
   if(Math.random()<.35){const good=keys.filter(k=>this.canClear(k));if(good.length)set[Math.floor(Math.random()*3)]=pick(good)}
   if(set.some(k=>this.anyFit(k)))break}
  const used=[];set.forEach((k,i)=>{let col;do{col=Math.floor(Math.random()*7)}while(used.includes(col)&&used.length<7);used.push(col);this.makePiece(i,k,col,true)});this.saveCur();this.checkOver()}
 w(k){const n=SH[k].length,big=n>=5;let w=WT[k];if(this.moves<6&&big)w*=.4;const fill=this.fillRatio();if(fill>.55&&n<=3)w*=1.6;return w}
 fillRatio(){let n=0;for(let r=0;r<N;r++)for(let c=0;c<N;c++)if(this.grid[r][c])n++;return n/64}
 canClear(k){const d=dim(k);for(let r=0;r<=N-d.r;r++)for(let c=0;c<=N-d.c;c++)if(this.fits(k,r,c)){const L=this.linesIf(k,r,c);if(L.rows.length+L.cols.length)return true}return false}
 makePiece(i,k,col,anim){const d=dim(k),cont=this.add.container(0,0).setDepth(10);SH[k].forEach(([r,c])=>{const b=this.add.image(c*C+C/2,r*C+C/2,'b'+col);b.setScale((C-2)/64);cont.add(b)});
  const p={i,k,col,cont,d};this.tray[i]=p;this.home_(p,anim);return p}
 slotX(i){return W/2+(i-1)*136}
 home_(p,anim){const cx=this.slotX(p.i),x=cx-p.d.c*C*TS/2,y=TRAY_Y-p.d.r*C*TS/2;p.cont.setScale(TS);
  if(anim){p.cont.setPosition(x+W,y);this.tweens.add({targets:p.cont,x,duration:380,delay:p.i*70,ease:'Back.easeOut'})}else this.tweens.add({targets:p.cont,x,y,scale:TS,duration:200,ease:'Quad.easeOut'});p.hx=x;p.hy=y}
 /* ---- 끌어서 놓기 ---- */
 down(p){if(this.mode!=='play'||this.drag)return;AU.init();const x=p.worldX,y=p.worldY;if(Math.abs(y-TRAY_Y)>95)return;
  let best=null,bd=1e9;this.tray.forEach(t=>{if(!t)return;const d=Math.abs(x-this.slotX(t.i));if(d<68&&d<bd){bd=d;best=t}});if(!best)return;
  this.drag={t:best,ptr:p};this.tweens.killTweensOf(best.cont);best.cont.setDepth(15);AU.sfx('pick');this.tweens.add({targets:best.cont,scale:1,duration:110,ease:'Quad.easeOut'});this.place(best,x,y,true)}
 lift(t){return C*t.d.r+46}
 place(t,x,y,inst){const cx=x-t.d.c*C/2,cy=y-this.lift(t);if(inst){t.cont.setPosition(cx,cy)}else{t.cont.x+=(cx-t.cont.x)*.6;t.cont.y+=(cy-t.cont.y)*.6}
  const c0=Math.round((cx-X0)/C),r0=Math.round((cy-Y0)/C);const ok=this.fits(t.k,r0,c0);this.drag.at=ok?[r0,c0]:null;this.drawHint(t,ok?r0:null,c0)}
 move(p){if(!this.drag)return;this.drag.ptr=p;this.place(this.drag.t,p.worldX,p.worldY,false)}
 drawHint(t,r0,c0){const g=this.hl;g.clear();if(r0==null)return;
  SH[t.k].forEach(([r,c])=>{g.fillStyle(COLS[t.col],.45);g.fillRoundedRect(X0+(c0+c)*C+3,Y0+(r0+r)*C+3,C-6,C-6,8)});
  const L=this.linesIf(t.k,r0,c0);g.fillStyle(0xffffff,.28);L.rows.forEach(r=>g.fillRoundedRect(X0+2,Y0+r*C+2,BW-4,C-4,9));L.cols.forEach(c=>g.fillRoundedRect(X0+c*C+2,Y0+2,C-4,BW-4,9));
  // 지워질 줄의 블록은 반짝
  this.glow=L;}
 up(p){const d=this.drag;if(!d)return;this.drag=null;this.hl.clear();const t=d.t;
  if(d.at){this.drop(t,d.at[0],d.at[1])}else{AU.sfx('bad');t.cont.setDepth(10);this.home_(t,false)}}
 drop(t,r0,c0){AU.sfx('place');this.moves++;const cells=SH[t.k].map(([r,c])=>[r0+r,c0+c]);t.cont.destroy();this.tray[t.i]=null;
  cells.forEach(([r,c])=>this.setCell(r,c,t.col));this.addScore(cells.length);
  this.cameras.main.shake(60,.0025);
  const L=this.linesIf('o1',-99,-99);// 지금 판 그대로 검사
  const n=L.rows.length+L.cols.length;
  if(n){this.streak=0;this.combo++;this.clearLines(L,cells,t.col,n)}else{this.streak++;if(this.streak>=3&&this.combo){this.combo=0;this.comboTx.setText('')}}
  if(this.tray.every(x=>!x))this.time.delayedCall(n?380:120,()=>{if(this.mode==='play')this.deal()});else this.checkOver();
  this.saveCur()}
 clearLines(L,cells,col,n){const set=new Map();L.rows.forEach(r=>{for(let c=0;c<N;c++)set.set(r*N+c,[r,c])});L.cols.forEach(c=>{for(let r=0;r<N;r++)set.set(r*N+c,[r,c])});
  const cr=cells.reduce((a,b)=>a+b[0],0)/cells.length,cc=cells.reduce((a,b)=>a+b[1],0)/cells.length;
  const mult=Math.max(1,this.combo);const pts=[0,10,30,60,100,150,210,280,360][Math.min(n,8)]*mult;
  set.forEach(([r,c])=>{const cell=this.grid[r][c];if(!cell)return;this.grid[r][c]=null;const img=cell.img,dl=Math.hypot(r-cr,c-cc)*28;
   this.tweens.add({targets:img,scale:img.scale*1.25,duration:90,delay:dl,yoyo:false,onComplete:()=>{this.em.setParticleTint(COLS[cell.col]);this.em.explode(3,img.x,img.y);this.tweens.add({targets:img,scale:0,angle:90,alpha:0,duration:180,ease:'Back.easeIn',onComplete:()=>img.destroy()})}})});
  this.time.delayedCall(60,()=>AU.sfx(n>=3?'big':'clear',this.combo));
  const px=X0+cc*C+C/2,py=Y0+cr*C;
  this.time.delayedCall(140,()=>{this.addScore(pts);KIT.floatText(this,clamp(px,80,W-80),py,'+'+pts,'#fff6a8',30);
   if(n>=2)KIT.floatText(this,W/2,Y0+BW/2,PRAISE[Math.min(n,5)],'#ffffff',44);
   if(this.combo>=2){this.comboTx.setText('🔥 콤보 x'+this.combo).setScale(1.5);this.tweens.add({targets:this.comboTx,scale:1,duration:220,ease:'Back.easeOut'})}
   if(n>=2)this.cameras.main.shake(180,.008);
   this.happy(n);
   let empty=true;for(let r=0;r<N&&empty;r++)for(let c=0;c<N;c++)if(this.grid[r][c]){empty=false;break}
   if(empty){this.time.delayedCall(300,()=>{this.addScore(300);KIT.floatText(this,W/2,Y0+BW/2+50,'판 전체 클리어! +300','#ffd25a',30);AU.sfx('win');this.cameras.main.flash(300,255,255,255)})}})}
 happy(n){this.tweens.add({targets:this.mas,y:Y0-46,duration:180,yoyo:true,ease:'Quad.easeOut'});this.emHeart.explode(4+n*3,this.mas.x,this.mas.y-40)}
 addScore(v){this.score+=v;const from=this.shown;this.tweens.addCounter({from,to:this.score,duration:400,onUpdate:tw=>{this.shown=Math.round(tw.getValue());this.scoreTx.setText(this.shown)}});
  this.tweens.add({targets:this.scoreTx,scale:1.15,duration:90,yoyo:true});if(this.score>S.best){this.bestTx.setText('👑 '+this.score)}}
 checkOver(){if(this.mode!=='play')return;const left=this.tray.filter(Boolean);
  left.forEach(t=>t.cont.setAlpha(this.anyFit(t.k)?1:.35));
  if(left.length&&!left.some(t=>this.anyFit(t.k)))this.gameOver()}
 gameOver(){this.mode='over';S.cur=null;const nb=this.score>S.best;if(nb)S.best=this.score;SV.put();AU.sfx('lose');
  this.tweens.add({targets:this.mas,angle:-20,duration:400});
  for(let r=0;r<N;r++)this.time.delayedCall(r*90,()=>{for(let c=0;c<N;c++){const cell=this.grid[r][c];if(cell){cell.img.setTexture('gray');this.tweens.add({targets:cell.img,scale:cell.img.scale*.9,duration:80,yoyo:true})}}AU.sfx('thud')});
  this.time.delayedCall(N*90+700,()=>{$('rT').textContent=nb?'🎉 새 최고 기록!':'더 놓을 곳이 없어요!';
   $('rB').innerHTML=`<div class="rline">점수 <b>${this.score}</b></div><div class="rline" style="font-size:18px">👑 최고 ${S.best}</div>`;this.sc('res');if(nb)AU.sfx('win')})}
 update(){if(this.drag){const L=this.glow;}}
}
new Phaser.Game({type:Phaser.AUTO,parent:'game',width:W*R,height:H*R,backgroundColor:'#2b2340',scale:{mode:Phaser.Scale.FIT,autoCenter:Phaser.Scale.CENTER_BOTH},render:{antialias:true},audio:{noAudio:true},input:{activePointers:2},scene:[Boot,Main]});
$('ui').style.width=W+'px';$('ui').style.height=H+'px';
document.addEventListener('visibilitychange',()=>{if(document.hidden&&window.__bp&&window.__bp.mode==='play')window.__bp.saveCur()});
})();
