/* 색깔 물 정렬 — 같은 색끼리 한 병에 모으는 퍼즐 (Phaser). 단계마다 풀 수 있는지 컴퓨터가 먼저 풀어 보고 내요.
   저장: localStorage 'waterSortV1' {level, snd, moves} */
(()=>{'use strict';
const {R,rnd,clamp,$,AU,BGM}=KIT;
const SZ=KIT.size(420,680,940),W=SZ.W,H=SZ.H;
const CAP=4,SEG=30,TW=44,TH=SEG*CAP+26;
const PAL=[0xff5a7a,0xffb23a,0xffe04a,0x5ed67a,0x4ab8ff,0xb07aff,0xff8fd0,0x3ad0c0,0x8a5a3a,0x9aa4c6,0x2a4ad0,0xa0e04a];
const SV=KIT.save('waterSortV1',()=>({level:1,snd:1,moves:0}));const S=SV.data;

function solvable(t0,limit){const seen=new Set();let n=0;const key=t=>t.map(x=>x.join('')).sort().join('|');
 const done=t=>t.every(x=>!x.length||(x.length===CAP&&x.every(v=>v===x[0])));
 function dfs(t){if(done(t))return true;if(++n>limit)return false;const k=key(t);if(seen.has(k))return false;seen.add(k);
  for(let i=0;i<t.length;i++){const a=t[i];if(!a.length)continue;const top=a[a.length-1];let run=1;while(run<a.length&&a[a.length-1-run]===top)run++;if(run===a.length&&a.length===CAP)continue;
   for(let j=0;j<t.length;j++){if(i===j)continue;const b=t[j];if(b.length>=CAP)continue;if(b.length&&b[b.length-1]!==top)continue;if(!b.length&&run===a.length)continue;
    const m=Math.min(run,CAP-b.length),nt=t.map(x=>x.slice());for(let k=0;k<m;k++)nt[j].push(nt[i].pop());if(dfs(nt))return true}}return false}
 return dfs(t0)}
function makeLevel(lv){const c=Math.min(PAL.length,3+Math.floor((lv-1)/2)),e=lv<4?2:2;for(let tries=0;tries<40;tries++){const all=[];for(let i=0;i<c;i++)for(let k=0;k<CAP;k++)all.push(i);
  for(let i=all.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[all[i],all[j]]=[all[j],all[i]]}const t=[];for(let i=0;i<c;i++)t.push(all.slice(i*CAP,i*CAP+CAP));for(let i=0;i<e;i++)t.push([]);
  if(t.some(x=>x.length===CAP&&x.every(v=>v===x[0])))continue;if(solvable(t.map(x=>x.slice()),40000))return t}
 const t=[];for(let i=0;i<c;i++)t.push([]);for(let i=0;i<c;i++)for(let k=0;k<CAP;k++)t[(i+k)%c].push(i);t.push([],[]);return t}

class Main extends Phaser.Scene{constructor(){super('main')}
 create(){window.__ws=this;KIT.ready(this,W,H);KIT.textures(this);
  KIT.tex(this,'bg',W,H,x=>{const g=x.createLinearGradient(0,0,0,H);g.addColorStop(0,'#eef4ff');g.addColorStop(1,'#fdeefa');x.fillStyle=g;x.fillRect(0,0,W,H);x.fillStyle='rgba(180,200,240,.25)';for(let i=0;i<14;i++){x.beginPath();x.arc(Math.random()*W,Math.random()*H,10+Math.random()*30,0,7);x.fill()}});
  KIT.tex(this,'glass',TW+8,TH+8,x=>{x.strokeStyle='rgba(90,110,160,.55)';x.lineWidth=3;x.beginPath();x.moveTo(4,6);x.lineTo(4,TH-TW/2+4);x.arc(4+TW/2,TH-TW/2+4,TW/2,Math.PI,0,true);x.lineTo(4+TW,6);x.stroke();
   x.fillStyle='rgba(255,255,255,.35)';x.fillRect(9,14,4,TH-40);x.strokeStyle='rgba(90,110,160,.55)';x.lineWidth=3;x.beginPath();x.moveTo(0,5);x.lineTo(TW+8,5);x.stroke()});
  this.add.image(W/2,H/2,'bg').setScale(1/R);this.tubes=[];
  this.conf=this.add.particles(0,0,'spark',{lifespan:1400,speed:{min:120,max:320},angle:{min:220,max:320},gravityY:400,scale:{start:.8,end:.2},rotate:{min:0,max:360},tint:[0xff7eb3,0xffd93b,0x6fd67a,0x5aa9ff,0xa685ff],emitting:false}).setDepth(50);
  this.lvT=KIT.text(this,W/2,92,'',30,'#5a70d0','#fff').setDepth(5);
  this.stream=this.add.graphics().setDepth(30);
  this.input.on('pointerdown',p=>this.tap(p.x/R,p.y/R));
  $('bUndo').onclick=e=>{e.stopPropagation();this.undo()};$('bAdd').onclick=e=>{e.stopPropagation();this.addTube()};$('bRe').onclick=e=>{e.stopPropagation();AU.sfx('click');this.loadT(this.init)};
  this.ui=KIT.shell({S,SV,start:()=>this.start(),home:()=>this.home()});
  this.home()}
 home(){this.mode='home';this.ui.best(`🧪 ${S.level}단계 도전 중`);$('bGo').textContent=S.level>1?`▶ ${S.level}단계 이어서`:'▶ 시작!';this.ui.sc('home');BGM.play('calm');if(!this.tubes.length)this.loadT(makeLevel(1))}
 start(){this.mode='play';this.ui.sc(null);BGM.play('calm');this.newLevel()}
 newLevel(){this.lv=S.level;this.init=makeLevel(this.lv);this.loadT(this.init);this.lvT.setText(this.lv+'단계')}
 loadT(t){this.tubes.forEach(o=>{o.g.destroy();o.img.destroy()});this.tubes=[];this.t=t.map(x=>x.slice());this.sel=-1;this.hist=[];this.undoN=5;this.added=0;this.busy=false;this.layout();this.hud()}
 layout(){const n=this.t.length,rows=n>6?2:1,per=Math.ceil(n/rows),gap=Math.min(26,(W-30-per*TW)/(per-1||1)),totalH=rows*TH+(rows-1)*60,y0=Math.max(140,(H-totalH)/2+20);
  this.tubes.forEach(o=>{o.g.destroy();o.img.destroy()});this.tubes=[];
  for(let i=0;i<n;i++){const r=Math.floor(i/per),inRow=r===rows-1?n-per*(rows-1):per,c=i-r*per,rowW=inRow*TW+(inRow-1)*gap,x=(W-rowW)/2+c*(TW+gap)+TW/2,y=y0+r*(TH+60)+TH/2;
   const img=this.add.image(x,y,'glass').setScale(1/R).setDepth(11),g=this.add.graphics().setDepth(10);this.tubes.push({x,y,bx:x,by:y,img,g,rot:0});this.draw(i)}}
 draw(i){const o=this.tubes[i],g=o.g,a=this.t[i];g.clear();g.setPosition(o.x,o.y).setRotation(o.rot);o.img.setPosition(o.x,o.y).setRotation(o.rot);
  const bot=TH/2-2,left=-TW/2+3,w=TW-6;
  a.forEach((v,k)=>{const y1=bot-(k+1)*SEG,h=SEG;g.fillStyle(PAL[v],1);if(k===0){g.fillRect(left,y1,w,h-w/2);g.fillCircle(0,bot-w/2,w/2);g.fillRect(left,y1,w,h-w/2+1)}else g.fillRect(left,y1,w,h+.5);g.fillStyle(0xffffff,.18);g.fillRect(left+3,y1+2,4,h-4)});
  if(a.length){g.fillStyle(0xffffff,.35);g.fillRect(left,bot-a.length*SEG,w,3)}
  if(a.length===CAP&&a.every(v=>v===a[0])){g.lineStyle(3,0xffd23a,1);g.strokeRoundedRect(-TW/2-2,-TH/2-4,TW+4,TH+8,10)}}
 hud(){this.ui.hud(this.lv?this.lv+'단계':'');$('bUndo').textContent='↩️ '+this.undoN;$('bAdd').style.opacity=this.added?.45:1;$('bUndo').style.opacity=this.undoN&&this.hist.length?1:.45}
 hitTube(x,y){for(let i=0;i<this.tubes.length;i++){const o=this.tubes[i];if(Math.abs(x-o.bx)<TW/2+8&&Math.abs(y-o.by)<TH/2+20)return i}return -1}
 tap(x,y){if(this.mode!=='play'||this.busy)return;const i=this.hitTube(x,y);if(i<0){if(this.sel>=0)this.lift(this.sel,false);this.sel=-1;return}
  if(this.sel<0){if(!this.t[i].length)return;this.sel=i;this.lift(i,true);AU.sfx('pick');return}
  if(this.sel===i){this.lift(i,false);this.sel=-1;return}
  const a=this.t[this.sel],b=this.t[i],top=a[a.length-1];if(b.length>=CAP||(b.length&&b[b.length-1]!==top)){AU.sfx('bad');this.tweens.add({targets:this.tubes[i],x:this.tubes[i].bx+6,duration:50,yoyo:true,repeat:2,onUpdate:()=>this.draw(i)});return}
  this.pour(this.sel,i)}
 lift(i,up){const o=this.tubes[i];this.tweens.add({targets:o,y:o.by-(up?22:0),duration:120,onUpdate:()=>this.draw(i)})}
 pour(i,j){const a=this.t[i],b=this.t[j],top=a[a.length-1];let run=1;while(run<a.length&&a[a.length-1-run]===top)run++;const m=Math.min(run,CAP-b.length);
  this.hist.push(this.t.map(x=>x.slice()));this.busy=true;this.sel=-1;const o=this.tubes[i],q=this.tubes[j],side=o.bx<q.bx?-1:1,tx=q.bx+side*(TW*.55),ty=q.by-TH/2-30,ang=-side*1.15;
  this.tweens.add({targets:o,x:tx,y:ty,rot:ang,duration:260,ease:'Quad.easeOut',onUpdate:()=>this.draw(i),onComplete:()=>{
   AU.noise(.5,.08,0,1800);let k=0;const col=PAL[top];const step=()=>{if(k>=m){this.stream.clear();this.tweens.add({targets:o,x:o.bx,y:o.by,rot:0,duration:240,ease:'Quad.easeIn',onUpdate:()=>this.draw(i),onComplete:()=>{this.busy=false;S.moves++;SV.put();this.after(j)}});return}
     b.push(a.pop());k++;this.draw(i);this.draw(j);AU.tone(500+b.length*90,.08,'sine',.08);
     this.stream.clear();this.stream.fillStyle(col,1);this.stream.fillRect(q.bx-3,ty+10,6,q.by+TH/2-ty-b.length*SEG-12);this.time.delayedCall(140,step)};step()}})}
 after(j){const b=this.t[j];if(b.length===CAP&&b.every(v=>v===b[0])){AU.sfx('clear',2);this.conf.explode(12,this.tubes[j].bx,this.tubes[j].by-TH/2)}this.hud();
  if(this.t.every(x=>!x.length||(x.length===CAP&&x.every(v=>v===x[0]))))this.win()}
 undo(){if(this.mode!=='play'||this.busy||!this.undoN||!this.hist.length){AU.sfx('bad');return}AU.sfx('click');this.undoN--;this.t=this.hist.pop();this.sel=-1;this.tubes.forEach((o,i)=>{o.x=o.bx;o.y=o.by;o.rot=0;this.draw(i)});this.hud()}
 addTube(){if(this.mode!=='play'||this.busy||this.added){AU.sfx('bad');return}AU.sfx('heal');this.added=1;this.t.push([]);this.sel=-1;this.layout();this.hud()}
 win(){this.mode='wait';AU.sfx('win');this.conf.explode(80,W/2,H*.45);S.level++;SV.put();KIT.toast(`🎉 ${this.lv}단계 완성!`,1600);
  this.time.delayedCall(1700,()=>{if(this.mode!=='wait')return;this.mode='play';this.newLevel()})}
}
KIT.boot(Main,{W,H,bg:'#eef4ff'});
})();
