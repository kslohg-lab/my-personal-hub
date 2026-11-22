/* 2048 사탕 숫자 — 밀어서 같은 숫자를 합치는 퍼즐 (Phaser 애니메이션)
   저장: localStorage 'num2048V1' {best, bestTile, cur:{g,score,undo}, snd, games} */
(()=>{'use strict';
const {R,clamp,$,AU,BGM}=KIT;
const SZ=KIT.size(420,680,940),W=SZ.W,H=SZ.H;
const N=4,GAP=10,CELL=Math.floor((W-40-GAP*(N+1))/N),BS=CELL*N+GAP*(N+1),BX=(W-BS)/2,BY=Math.round(Math.max(150,(H-BS)/2-10));
const PAL={2:['#ffe9f2','#c86a8a'],4:['#ffd6e6','#c0507a'],8:['#ffb38a','#fff'],16:['#ff9a5a','#fff'],32:['#ff7a6a','#fff'],64:['#ff5a5a','#fff'],128:['#ffd85a','#fff'],256:['#ffc93a','#fff'],512:['#9ae06a','#fff'],1024:['#5ad0c0','#fff'],2048:['#a685ff','#fff']};
const SV=KIT.save('num2048V1',()=>({best:0,bestTile:0,cur:null,snd:1,games:0}));const S=SV.data;

class Main extends Phaser.Scene{constructor(){super('main')}
 create(){window.__n2=this;KIT.ready(this,W,H);KIT.textures(this);
  KIT.tex(this,'bg',W,H,x=>{const g=x.createLinearGradient(0,0,0,H);g.addColorStop(0,'#fff3e8');g.addColorStop(1,'#ffe3ee');x.fillStyle=g;x.fillRect(0,0,W,H);
   for(let i=0;i<26;i++){x.fillStyle=['#ffd6e6','#ffe9a8','#d6f0ff','#e0ffd6'][i%4];x.globalAlpha=.6;x.beginPath();x.arc(Math.random()*W,Math.random()*H,6+Math.random()*14,0,7);x.fill()}x.globalAlpha=1;
   x.fillStyle='rgba(160,110,90,.18)';KIT.rr(x,BX+3,BY+6,BS,BS,20);x.fill();x.fillStyle='#e8cdb8';KIT.rr(x,BX,BY,BS,BS,20);x.fill();
   for(let r=0;r<N;r++)for(let c=0;c<N;c++){x.fillStyle='#f6e3d4';KIT.rr(x,BX+GAP+c*(CELL+GAP),BY+GAP+r*(CELL+GAP),CELL,CELL,14);x.fill()}});
  this.add.image(W/2,H/2,'bg').setScale(1/R);
  this.title=KIT.text(this,W/2,BY-46,'2048',44,'#ff8a5a','#fff').setDepth(1);
  this.pop=this.add.particles(0,0,'spark',{lifespan:600,speed:{min:60,max:180},scale:{start:.6,end:0},tint:[0xff7eb3,0xffd93b,0x6fd67a,0x5aa9ff],emitting:false}).setDepth(30);
  this.tiles=[];this.g=null;
  this.input.on('pointerdown',p=>this.sw={x:p.x,y:p.y});
  this.input.on('pointerup',p=>{if(!this.sw)return;const dx=p.x-this.sw.x,dy=p.y-this.sw.y;this.sw=null;if(Math.hypot(dx,dy)<24*R)return;this.move(Math.abs(dx)>Math.abs(dy)?(dx>0?'R':'L'):(dy>0?'D':'U'))});
  this.input.keyboard.on('keydown',e=>{const k={ArrowRight:'R',ArrowLeft:'L',ArrowUp:'U',ArrowDown:'D'}[e.key];if(k)this.move(k)});
  $('bUndo').onclick=e=>{e.stopPropagation();this.undo()};$('bNew').onclick=e=>{e.stopPropagation();AU.sfx('click');if(this.score>0&&!confirmNew(this))return;this.start(0)};
  function confirmNew(sc){if(sc.newAsk&&Date.now()-sc.newAsk<2500)return true;sc.newAsk=Date.now();KIT.toast('한 번 더 누르면 새로 시작해요');return false}
  this.ui=KIT.shell({S,SV,start:k=>this.start(k),home:()=>this.home()});
  this.home()}
 tileTex(v){const k='t'+v;if(this.textures.exists(k))return k;const p=PAL[v]||['#5a4a7a','#fff'],s=String(v),fs=s.length<3?CELL*.46:s.length<4?CELL*.38:s.length<5?CELL*.3:CELL*.24;
  KIT.tex(this,k,CELL+8,CELL+10,x=>{x.fillStyle='rgba(120,70,60,.18)';KIT.rr(x,4,7,CELL,CELL,14);x.fill();if(v>=128){x.shadowColor=p[0];x.shadowBlur=10}x.fillStyle=p[0];KIT.rr(x,4,4,CELL,CELL,14);x.fill();x.shadowBlur=0;
   const g=x.createLinearGradient(0,4,0,CELL);g.addColorStop(0,'rgba(255,255,255,.45)');g.addColorStop(.5,'rgba(255,255,255,0)');x.fillStyle=g;KIT.rr(x,4,4,CELL,CELL,14);x.fill();
   x.font=`${fs}px Jua, sans-serif`;x.textAlign='center';x.textBaseline='middle';if(p[1]==='#fff'){x.strokeStyle='rgba(0,0,0,.15)';x.lineWidth=4;x.strokeText(s,4+CELL/2,6+CELL/2)}x.fillStyle=p[1];x.fillText(s,4+CELL/2,6+CELL/2)});return k}
 px(c){return BX+GAP+c*(CELL+GAP)+CELL/2}
 py(r){return BY+GAP+r*(CELL+GAP)+CELL/2}
 home(){this.mode='home';$('bGo2').style.display=S.cur?'block':'none';this.ui.best(`🏆 최고 ${S.best.toLocaleString()} · 가장 큰 수 ${S.bestTile||0}`);this.ui.sc('home');BGM.play('calm')}
 start(cont){this.tiles.forEach(t=>t.img.destroy());this.tiles=[];this.g=[...Array(N)].map(()=>Array(N).fill(null));this.mode='play';this.won=false;this.hist=[];
  if(cont&&S.cur){const c=S.cur;this.score=c.score;this.undoN=c.undo;c.g.forEach((v,i)=>{if(v)this.add2(Math.floor(i/N),i%N,v)});this.won=c.won}
  else{this.score=0;this.undoN=3;this.spawn();this.spawn();S.games++}
  this.ui.sc(null);this.hud();this.save();BGM.play('bright')}
 hud(){this.ui.hud('⭐ '+this.score.toLocaleString(),'🏆 '+Math.max(S.best,this.score).toLocaleString());$('bUndo').textContent='↩️ 되돌리기 '+this.undoN;$('bUndo').style.opacity=this.undoN&&this.hist.length?1:.5}
 add2(r,c,v,anim){const img=this.add.image(this.px(c),this.py(r)+1,this.tileTex(v)).setScale(1/R).setDepth(5);const t={r,c,v,img};this.g[r][c]=t;this.tiles.push(t);if(anim){img.setScale(.1/R);this.tweens.add({targets:img,scale:1/R,duration:140,ease:'Back.easeOut'})}return t}
 spawn(){const e=[];for(let r=0;r<N;r++)for(let c=0;c<N;c++)if(!this.g[r][c])e.push([r,c]);if(!e.length)return;const [r,c]=e[Math.floor(Math.random()*e.length)];this.add2(r,c,Math.random()<.9?2:4,true)}
 snap(){return {g:this.g.flat().map(t=>t?t.v:0),score:this.score}}
 move(d){if(this.mode!=='play'||this.busy)return;const before=this.snap();let moved=false,gain=0,merges=[];
  const lines=[];for(let i=0;i<N;i++){const L=[];for(let j=0;j<N;j++){const [r,c]=d==='L'?[i,j]:d==='R'?[i,N-1-j]:d==='U'?[j,i]:[N-1-j,i];L.push([r,c])}lines.push(L)}
  const ng=[...Array(N)].map(()=>Array(N).fill(null)),anims=[];
  for(const L of lines){let k=0,last=null;for(const [r,c] of L){const t=this.g[r][c];if(!t)continue;
    if(last&&last.v===t.v&&!last.merged){const [tr,tc]=L[k-1];anims.push([t,tr,tc,true]);last.merged=true;last.v*=2;merges.push([tr,tc,last.v,last,t]);gain+=last.v;moved=true}
    else{const [tr,tc]=L[k];ng[tr][tc]=t;if(tr!==r||tc!==c)moved=true;anims.push([t,tr,tc,false]);t.v0=t.v;last=t;last.merged=false;k++}}}
  if(!moved){this.tweens.add({targets:this.tiles.map(t=>t.img),x:'+='+(d==='L'?-4:d==='R'?4:0),y:'+='+(d==='U'?-4:d==='D'?4:0),duration:50,yoyo:true});return}
  this.hist.push(before);if(this.hist.length>5)this.hist.shift();this.busy=true;
  for(const [t,r,c] of anims){t.r=r;t.c=c;this.tweens.add({targets:t.img,x:this.px(c),y:this.py(r)+1,duration:100,ease:'Quad.easeOut'})}
  AU.sfx('place');
  this.time.delayedCall(105,()=>{for(const [r,c,v,keep,gone] of merges){gone.img.destroy();this.tiles=this.tiles.filter(x=>x!==gone);keep.img.setTexture(this.tileTex(v));keep.img.setScale(1.22/R);this.tweens.add({targets:keep.img,scale:1/R,duration:150,ease:'Back.easeOut'});
     if(v>=64)this.pop.explode(v>=512?20:8,this.px(c),this.py(r));if(v>S.bestTile)S.bestTile=v;if(v===2048&&!this.won){this.won=true;AU.sfx('win');KIT.toast('🎉 2048 완성! 계속 해 볼까요?',2600);this.pop.explode(60,W/2,H/2)}}
   if(merges.length)AU.sfx('pop',Math.min(9,Math.log2(Math.max(...merges.map(m=>m[2])))-1));
   for(const t of this.tiles)t.merged=false;this.g=ng;this.score+=gain;if(gain)KIT.floatText(this,W/2+120,BY-46,'+'+gain,'#ff8a5a',22,40);
   if(this.score>S.best)S.best=this.score;this.spawn();this.busy=false;this.hud();this.save();if(this.stuck())this.over()})}
 stuck(){for(let r=0;r<N;r++)for(let c=0;c<N;c++){const t=this.g[r][c];if(!t)return false;if(c<N-1&&this.g[r][c+1]&&this.g[r][c+1].v===t.v)return false;if(r<N-1&&this.g[r+1][c]&&this.g[r+1][c].v===t.v)return false}return true}
 undo(){if(this.mode!=='play'||this.busy||!this.undoN||!this.hist.length){AU.sfx('bad');return}AU.sfx('click');this.undoN--;const s=this.hist.pop();this.tiles.forEach(t=>t.img.destroy());this.tiles=[];this.g=[...Array(N)].map(()=>Array(N).fill(null));
  s.g.forEach((v,i)=>{if(v)this.add2(Math.floor(i/N),i%N,v)});this.score=s.score;this.hud();this.save()}
 save(){S.cur=this.mode==='play'?{g:this.g.flat().map(t=>t?t.v:0),score:this.score,undo:this.undoN,won:this.won}:null;SV.put()}
 over(){this.mode='over';S.cur=null;SV.put();AU.sfx('lose');const big=Math.max(...this.tiles.map(t=>t.v));
  this.time.delayedCall(700,()=>this.ui.result(this.score>=S.best?'🎉 최고 기록!':'더 이상 못 움직여요',`<div class="rline">점수 <b>${this.score.toLocaleString()}</b></div><div class="rline" style="font-size:18px">가장 큰 수 ${big} · 🏆 최고 ${S.best.toLocaleString()}</div>`,this.score>=S.best))}
}
KIT.boot(Main,{W,H,bg:'#fff3e8'});
})();
