/* 피아노 타일 — 내려오는 검은 타일을 누르면 노래가 한 음씩 나와요 (Phaser)
   노래는 모두 저작권이 끝난 옛 노래/동요 · 저장: localStorage 'rhythmTilesV1' {best:{곡:점수}, song, snd, games} */
(()=>{'use strict';
const {R,rnd,clamp,$,AU,BGM}=KIT;
const SZ=KIT.size(420,680,940),W=SZ.W,H=SZ.H;
const LANES=4,LW=W/LANES,TH=Math.round(H/4.4);
const SONGS=[
 {id:'star',t:'⭐ 작은 별',n:'C4 C4 G4 G4 A4 A4 G4 F4 F4 E4 E4 D4 D4 C4 G4 G4 F4 F4 E4 E4 D4 G4 G4 F4 F4 E4 E4 D4 C4 C4 G4 G4 A4 A4 G4 F4 F4 E4 E4 D4 D4 C4'},
 {id:'bday',t:'🎂 생일 축하',n:'G4 G4 A4 G4 C5 B4 G4 G4 A4 G4 D5 C5 G4 G4 G5 E5 C5 B4 A4 F5 F5 E5 C5 D5 C5'},
 {id:'joy',t:'🎶 환희의 송가',n:'E4 E4 F4 G4 G4 F4 E4 D4 C4 C4 D4 E4 E4 D4 D4 E4 E4 F4 G4 G4 F4 E4 D4 C4 C4 D4 E4 D4 C4 C4 D4 D4 E4 C4 D4 E4 F4 E4 C4 D4 E4 F4 E4 D4 C4 D4 G3 E4 E4 F4 G4 G4 F4 E4 D4 C4 C4 D4 E4 D4 C4 C4'},
 {id:'bridge',t:'🌉 런던 다리',n:'G4 A4 G4 F4 E4 F4 G4 D4 E4 F4 E4 F4 G4 G4 A4 G4 F4 E4 F4 G4 D4 G4 E4 C4'},
 {id:'bell',t:'🔔 징글벨',n:'E4 E4 E4 E4 E4 E4 E4 G4 C4 D4 E4 F4 F4 F4 F4 F4 E4 E4 E4 E4 D4 D4 E4 D4 G4 E4 E4 E4 E4 E4 E4 E4 G4 C4 D4 E4 F4 F4 F4 F4 F4 E4 E4 E4 G4 G4 F4 D4 C4'},
 {id:'elise',t:'🎹 엘리제를 위하여',n:'E5 D#5 E5 D#5 E5 B4 D5 C5 A4 C4 E4 A4 B4 E4 G#4 B4 C5 E4 E5 D#5 E5 D#5 E5 B4 D5 C5 A4 C4 E4 A4 B4 E4 C5 B4 A4'}];
const NOTE={C:0,'C#':1,D:2,'D#':3,E:4,F:5,'F#':6,G:7,'G#':8,A:9,'A#':10,B:11};
const midi=s=>{const m=s.match(/^([A-G]#?)(\d)$/);return 12*(+m[2]+1)+NOTE[m[1]]};
const SV=KIT.save('rhythmTilesV1',()=>({best:{},song:'star',snd:1,games:0}));const S=SV.data;

class Main extends Phaser.Scene{constructor(){super('main')}
 create(){window.__rt=this;KIT.ready(this,W,H);KIT.textures(this);
  KIT.tex(this,'bg',W,H,x=>{x.fillStyle='#fbf9ff';x.fillRect(0,0,W,H);x.strokeStyle='#e4dcf6';x.lineWidth=2;for(let i=1;i<LANES;i++){x.beginPath();x.moveTo(i*LW,0);x.lineTo(i*LW,H);x.stroke()}});
  KIT.tex(this,'tile',LW-4,TH-4,x=>{const g=x.createLinearGradient(0,0,0,TH);g.addColorStop(0,'#3a2a6a');g.addColorStop(1,'#1a1238');x.fillStyle=g;KIT.rr(x,0,0,LW-4,TH-4,10);x.fill();x.fillStyle='rgba(255,255,255,.12)';KIT.rr(x,6,6,LW-16,10,5);x.fill()});
  KIT.tex(this,'tileS',LW-4,TH-4,x=>{const g=x.createLinearGradient(0,0,0,TH);g.addColorStop(0,'#7a5ad0');g.addColorStop(1,'#4a2ab0');x.fillStyle=g;KIT.rr(x,0,0,LW-4,TH-4,10);x.fill();x.fillStyle='#fff';x.font='26px Jua, sans-serif';x.textAlign='center';x.textBaseline='middle';x.fillText('시작',(LW-4)/2,(TH-4)/2)});
  KIT.tex(this,'tileH',LW-4,TH-4,x=>{x.fillStyle='rgba(122,90,208,.18)';KIT.rr(x,0,0,LW-4,TH-4,10);x.fill()});
  KIT.tex(this,'tileX',LW-4,TH-4,x=>{x.fillStyle='rgba(255,80,100,.75)';KIT.rr(x,0,0,LW-4,TH-4,10);x.fill()});
  this.add.image(W/2,H/2,'bg').setScale(1/R);
  this.fx=this.add.particles(0,0,'spark',{lifespan:500,speed:{min:40,max:160},scale:{start:.5,end:0},tint:[0xa685ff,0xff7eb3,0x5aa9ff,0xffd93b],emitting:false}).setDepth(20);
  this.rows=[];this.input.on('pointerdown',p=>this.tap(p.x/R,p.y/R));
  this.input.keyboard.on('keydown',e=>{const i='DFJK'.indexOf(e.key.toUpperCase());if(i<0)return;const r=this.rows.find(r=>!r.hit);if(r)this.tap(i*LW+LW/2,r.y+TH/2)});
  this.ui=KIT.shell({S,SV,start:()=>this.start(),home:()=>this.home(),pause:on=>this.paused=on});
  this.home()}
 home(){this.mode='home';this.clearRows();const box=$('songs');box.innerHTML='';SONGS.forEach(s=>{const b=document.createElement('button');b.textContent=s.t;if(S.song===s.id)b.className='on';b.onclick=()=>{AU.init();S.song=s.id;SV.put();this.preview(s);this.home()};box.appendChild(b)});
  const s=this.song();this.ui.best(`🏆 ${s.t} 최고 ${S.best[s.id]||0}`);this.ui.sc('home');BGM.stop()}
 song(){return SONGS.find(s=>s.id===S.song)||SONGS[0]}
 preview(s){s.n.split(' ').slice(0,6).forEach((n,i)=>this.time.delayedCall(i*180,()=>this.note(midi(n),.35)))}
 note(m,v){const f=440*Math.pow(2,(m-69)/12);AU.tone(f,.7,'triangle',(v||1)*.2);AU.tone(f*2,.4,'sine',(v||1)*.06);AU.tone(f*3,.15,'sine',(v||1)*.025)}
 clearRows(){this.rows.forEach(r=>r.img.destroy());this.rows=[]}
 start(){this.clearRows();const s=this.song();this.notes=s.n.split(' ').map(midi);this.ni=0;this.lap=1;this.score=0;this.hearts=3;this.speed=TH*2.1;this.started=false;this.mode='play';this.paused=false;this.lastLane=-1;
  // 시작 타일은 아래에서 두 번째 칸
  let y=H-TH*2;this.addRow(y,true);while(y>-TH*2){y-=TH;this.addRow(y)}
  this.ui.sc(null);this.hud()}
 addRow(y,first){let l;do{l=Math.floor(Math.random()*LANES)}while(l===this.lastLane&&Math.random()<.7);this.lastLane=l;
  const img=this.add.image(l*LW+LW/2,y+TH/2,first?'tileS':'tile').setScale(1/R).setDepth(5);this.rows.push({lane:l,y,img,hit:false})}
 hud(){this.ui.hud(this.lap>1?`🔁 ${this.lap}바퀴`:this.song().t,String(this.score),'♥'.repeat(Math.max(0,this.hearts)))}
 tap(x,y){if(this.mode!=='play'||this.paused)return;const r=this.rows.find(r=>!r.hit);if(!r)return;const lane=Math.floor(x/LW);
  if(y<r.y-TH*.6||y>r.y+TH*1.3){// 다른 줄 높이: 바로 위 줄의 검은 타일이면 봐줌
   return}
  if(lane===r.lane){this.hit(r)}else this.miss(lane,r)}
 hit(r){r.hit=true;this.started=true;r.img.setTexture('tileH');const m=this.notes[this.ni%this.notes.length];this.note(m);this.ni++;this.score++;
  this.fx.explode(6,r.lane*LW+LW/2,r.y+TH/2);this.tweens.add({targets:r.img,scaleX:1.06/R,scaleY:1.06/R,duration:70,yoyo:true});
  if(this.ni%this.notes.length===0){this.lap++;this.speed*=1.15;AU.sfx('level');KIT.toast(`🎉 ${this.lap}바퀴째! 더 빨라져요`)}
  this.speed+=TH*.006;this.hud()}
 miss(lane,r){this.hearts--;AU.sfx('bad');this.cameras.main.shake(160,.008);const m=this.add.image(lane*LW+LW/2,r.y+TH/2,'tileX').setScale(1/R).setDepth(4);this.tweens.add({targets:m,alpha:0,duration:500,onComplete:()=>m.destroy()});
  this.hud();if(this.hearts<=0)this.over()}
 update(t,dl){if(this.mode!=='play'||this.paused||!this.started)return;const dt=Math.min(dl/1000,.05),dy=this.speed*dt;
  for(const r of this.rows){r.y+=dy;r.img.y=r.y+TH/2}
  const low=this.rows.find(r=>!r.hit);if(low&&low.y>H-TH*.15){low.hit=true;low.img.setTexture('tileX');this.miss(low.lane,{y:low.y-1e4});this.cameras.main.flash(150,255,80,100)}
  while(this.rows.length&&this.rows[0].y>H+10){this.rows.shift().img.destroy()}
  const top=this.rows[this.rows.length-1];if(top.y>-TH*1.5)this.addRow(top.y-TH)}
 over(){if(this.mode!=='play')return;this.mode='over';AU.sfx('lose');const s=this.song(),b=S.best[s.id]||0,nb=this.score>b;if(nb)S.best[s.id]=this.score;S.games++;SV.put();
  this.time.delayedCall(700,()=>this.ui.result(nb?'🎉 새 최고 기록!':'🎹 끝!',`<div class="rline">${s.t} · <b>${this.score}</b>타일</div><div class="rline" style="font-size:18px">${this.lap>1?this.lap+'바퀴째까지 · ':''}🏆 최고 ${S.best[s.id]}</div>`,nb))}
}
KIT.boot(Main,{W,H,bg:'#fbf9ff'});
})();
