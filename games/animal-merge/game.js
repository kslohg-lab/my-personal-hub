/* 동물 친구 합치기 — 같은 친구끼리 부딪히면 더 큰 친구가 되는 물리 퍼즐 (수박게임 방식, Phaser Matter 물리)
   저장: localStorage 'animalMergeV1' {best, seen(가장 큰 단계), snd} */
(()=>{'use strict';
const {R,rnd,pick,clamp,$,IMG,AU,BGM}=KIT;
const SZ=KIT.size(420,700,940),W=SZ.W,H=SZ.H;
const JL=22,JR=W-22,JB=H-34,JT=Math.round(196+(H-760)*.15),HOLDY=JT-58;
const LV=[{c:30,n:'병아리',r:17,col:'#fff3b0'},{c:32,n:'꿀벌',r:22,col:'#ffe08a'},{c:31,n:'나비',r:28,col:'#f6d6ff'},{c:8,n:'별이',r:34,col:'#fff6c2'},{c:0,n:'토끼',r:41,col:'#ffd9e6'},{c:1,n:'고양이',r:49,col:'#ffe4c4'},{c:2,n:'강아지',r:57,col:'#f6e2c9'},{c:3,n:'여우',r:66,col:'#ffd2b0'},{c:4,n:'판다',r:76,col:'#eef0f4'},{c:7,n:'유니콘',r:87,col:'#e9dcff'},{c:9,n:'하트여왕',r:99,col:'#ffc4dc'}];
const PTS=[1,3,6,10,15,21,28,36,45,55,66];
const SV=KIT.save('animalMergeV1',()=>({best:0,seen:0,snd:1,games:0}));const S=SV.data;AU.on=BGM.on=!!S.snd;

class Boot extends Phaser.Scene{constructor(){super('boot')}
 preload(){this.load.on('progress',v=>$('lbar').style.width=Math.round(v*100)+'%');LV.forEach(l=>this.load.image('ch'+l.c,IMG+'ch/'+KIT.pad2(l.c)+'.webp'));['t0_bush','t0_deco','t0_cloud'].forEach(k=>this.load.image(k,IMG+'bg/'+k+'.webp'))}
 create(){KIT.fontReady().then(()=>this.scene.start('main'))}}

class Main extends Phaser.Scene{constructor(){super('main')}
 create(){window.__am=this;KIT.textures(this);this.cameras.main.setZoom(R).centerOn(W/2,H/2);this.mkTex();
  const bg=this.textures.createCanvas('bg',4,H),x=bg.getContext(),gr=x.createLinearGradient(0,0,0,H);gr.addColorStop(0,'#a9e2ff');gr.addColorStop(.6,'#fff1d9');gr.addColorStop(1,'#ffd9b3');x.fillStyle=gr;x.fillRect(0,0,4,H);bg.refresh();
  this.add.image(0,0,'bg').setOrigin(0).setDisplaySize(W,H);
  [[60,70,.8],[330,110,.65]].forEach(([cx,cy,s])=>{const c=this.add.image(cx,cy,'t0_cloud').setScale(s*.55).setAlpha(.9);this.tweens.add({targets:c,x:cx+20,duration:4000,yoyo:true,repeat:-1,ease:'Sine.easeInOut'})});
  // 병
  const g=this.add.graphics().setDepth(2);g.fillStyle(0xffffff,.28);g.fillRoundedRect(JL-10,JT-6,JR-JL+20,JB-JT+16,{tl:8,tr:8,bl:30,br:30});
  g.lineStyle(10,0xffffff,.9);g.beginPath();g.moveTo(JL-5,JT-6);g.lineTo(JL-5,JB-20);g.arc(JL+25,JB-20,30,Math.PI,Math.PI/2,true);g.lineTo(JR-25,JB+10);g.arc(JR-25,JB-20,30,Math.PI/2,0,true);g.lineTo(JR+5,JT-6);g.strokePath();
  g.lineStyle(4,0xd99ab0,.6);g.strokeRoundedRect(JL-10,JT-6,JR-JL+20,JB-JT+16,{tl:8,tr:8,bl:30,br:30});
  [70,170,300].forEach((bx,i)=>{const b=this.add.image(bx,JB+30,i===1?'t0_deco':'t0_bush').setOrigin(.5,1).setDepth(1);b.setScale(46/b.frame.height)});
  this.danger=this.add.graphics().setDepth(3);this.drawDanger(0);
  // 벽 (물리)
  const st={isStatic:true,friction:.2,restitution:.1,label:'wall'};
  this.matter.add.rectangle(W/2,JB+30,W,60,st);this.matter.add.rectangle(JL-30,H/2,60,H*2,st);this.matter.add.rectangle(JR+30,H/2,60,H*2,st);
  // HUD
  this.scoreTx=KIT.text(this,W/2,58,'0',42,'#ffffff','#c0607c').setDepth(20);this.bestTx=KIT.text(this,W/2,20,'👑 '+S.best,18,'#fff7c2','#c0607c').setDepth(20);
  this.nextBg=this.add.image(W-46,70,'disc0').setDepth(20).setAlpha(.95);this.nextIm=this.add.image(W-46,70,'ch30').setDepth(21);this.nextTx=KIT.text(this,W-46,30,'다음',15,'#ffffff','#c0607c').setDepth(21);
  this.guide=this.add.graphics().setDepth(4);
  this.em=this.add.particles(0,0,'spark',{emitting:false,lifespan:650,speed:{min:100,max:300},scale:{start:1,end:0},rotate:{min:0,max:360}}).setDepth(30);
  this.emDot=this.add.particles(0,0,'dot',{emitting:false,lifespan:500,speed:{min:60,max:180},scale:{start:.8,end:0},alpha:{start:1,end:0}}).setDepth(30);
  this.balls=[];this.mode='home';this.queue=[];
  this.matter.world.on('collisionstart',ev=>{if(this.mode!=='play')return;for(const pr of ev.pairs){const a=pr.bodyA.ball,b=pr.bodyB.ball;if(a&&b&&a.lv===b.lv&&!a.gone&&!b.gone){a.gone=b.gone=1;this.queue.push([a,b])}
    else if((a||b)&&!(a&&b)){const o=a||b;if(o.fresh&&o.body.velocity.y>3){o.fresh=0;AU.sfx('thud')}}}});
  this.input.on('pointerdown',p=>this.pdown(p));this.input.on('pointermove',p=>this.pmove(p));this.input.on('pointerup',p=>this.pup(p));
  this.bindUI();$('load').style.display='none';KIT.fitUI(W);addEventListener('resize',()=>setTimeout(()=>KIT.fitUI(W),60));this.scale.on('resize',()=>setTimeout(()=>KIT.fitUI(W),30));
  this.home();
 }
 mkTex(){LV.forEach((l,i)=>{const r=l.r,s=r*2+8,c=this.textures.createCanvas('disc'+i,s,s),x=c.getContext(),cx=s/2;
   const g=x.createRadialGradient(cx-r*.35,cx-r*.4,r*.1,cx,cx,r);g.addColorStop(0,'#ffffff');g.addColorStop(.55,l.col);g.addColorStop(1,l.col);
   x.fillStyle='rgba(0,0,0,.12)';x.beginPath();x.arc(cx,cx+2.5,r,0,7);x.fill();x.fillStyle=g;x.beginPath();x.arc(cx,cx,r,0,7);x.fill();
   x.lineWidth=Math.max(2,r*.07);x.strokeStyle='rgba(255,255,255,.95)';x.beginPath();x.arc(cx,cx,r-x.lineWidth/2,0,7);x.stroke();
   x.fillStyle='rgba(255,255,255,.6)';x.beginPath();x.ellipse(cx-r*.42,cx-r*.5,r*.22,r*.12,-.6,0,7);x.fill();c.refresh()})}
 drawDanger(a){const g=this.danger;g.clear();g.lineStyle(3,0xff5a7a,.25+a*.7);for(let x=JL;x<JR;x+=18)g.lineBetween(x,JT,x+10,JT)}
 /* ---- 화면 ---- */
 bindUI(){const sc=id=>{document.querySelectorAll('.scr').forEach(e=>e.classList.toggle('on',e.id===id));$('pbtn').style.display=$('shk').style.display=id===null?'block':'none'};this.sc=sc;
  $('bGo').onclick=()=>{AU.init();AU.sfx('click');this.newGame()};
  $('sbtn').onclick=()=>{S.snd=S.snd?0:1;AU.on=BGM.on=!!S.snd;SV.put();$('sbtn').textContent=S.snd?'🔊':'🔇';AU.init();AU.sfx('click')};$('sbtn').textContent=S.snd?'🔊':'🔇';
  $('pbtn').onclick=()=>{AU.sfx('click');this.matter.world.pause();this.mode='pause';sc('pause')};
  $('pGo').onclick=()=>{AU.sfx('click');this.matter.world.resume();this.mode='play';sc(null)};
  $('pNew').onclick=()=>{AU.sfx('click');this.matter.world.resume();this.newGame()};$('pHome').onclick=()=>{AU.sfx('click');this.matter.world.resume();this.home()};
  $('rRe').onclick=()=>{AU.sfx('click');this.newGame()};$('rHome').onclick=()=>{AU.sfx('click');this.home()};
  $('shk').onclick=()=>this.shake()}
 home(){this.mode='home';this.clearBalls();$('hb').textContent='👑 최고 '+S.best;this.bestTx.setText('👑 '+S.best);
  $('chain').innerHTML=LV.map((l,i)=>`<div class="${i>S.seen?'no':''}"><img src="${IMG}ch/${KIT.pad2(l.c)}.webp" alt="">${i>S.seen?'???':l.n}</div>`).join('');
  this.sc('home');BGM.play('bright');
  for(let i=0;i<9;i++)this.time.delayedCall(i*120,()=>{if(this.mode==='home')this.spawn(rnd(JL+60,JR-60),JT+20,Math.floor(rnd(0,6)),true)})}
 clearBalls(){this.balls.forEach(b=>this.kill(b));this.balls=[];this.queue=[];if(this.held){this.held.d.destroy();this.held.f.destroy();this.held=null}this.guide.clear()}
 newGame(){this.clearBalls();this.score=0;this.shown=0;this.dangerT=0;this.cool=0;this.shakes=3;this.combo=0;this.comboT=0;this.mode='play';this.scoreTx.setText('0');this.bestTx.setText('👑 '+S.best);$('shk').textContent='🫨 흔들기 3';
  this.next=this.rndLv();this.heldX=W/2;this.newHeld();this.sc(null);BGM.play('bright');S.games++;SV.put()}
 rndLv(){const w=[.3,.27,.2,.15,.08],top=Math.min(4,Math.max(2,S.seen>=6?4:3));let x=Math.random()*w.slice(0,top+1).reduce((a,b)=>a+b,0);for(let i=0;i<=top;i++){if((x-=w[i])<0)return i}return 0}
 newHeld(){const lv=this.next;this.next=this.rndLv();const l=LV[lv],d=this.add.image(this.heldX,HOLDY,'disc'+lv).setDepth(12),f=this.face(lv,this.heldX,HOLDY,13);
  d.setScale(0);f.setScale(0);this.tweens.add({targets:[d],scale:1,duration:200,ease:'Back.easeOut'});this.tweens.add({targets:f,scale:f.sc,duration:200,ease:'Back.easeOut'});
  this.held={lv,d,f};this.heldX=clamp(this.heldX,JL+l.r,JR-l.r);
  const n=LV[this.next];this.nextBg.setTexture('disc'+this.next).setScale(Math.min(1,26/n.r));this.nextIm.setTexture('ch'+n.c);this.nextIm.setScale(Math.min(1,26/n.r)*n.r*1.7/this.nextIm.frame.height)}
 face(lv,x,y,d){const l=LV[lv],f=this.add.image(x,y,'ch'+l.c).setDepth(d);f.sc=l.r*1.72/Math.max(f.frame.height,f.frame.width*.95);f.setScale(f.sc);return f}
 spawn(x,y,lv,quiet){const l=LV[lv],body=this.matter.add.circle(x,y,l.r,{restitution:.12,friction:.06,frictionStatic:.4,frictionAir:.004,density:.001*(1+lv*.05),label:'ball'});
  const d=this.add.image(x,y,'disc'+lv).setDepth(6),f=this.face(lv,x,y,7);const b={lv,body,d,f,born:this.time.now,fresh:1};body.ball=b;this.balls.push(b);
  if(!quiet){d.setScale(.55);f.setScale(f.sc*.55);this.tweens.add({targets:d,scale:1,duration:260,ease:'Back.easeOut'});this.tweens.add({targets:f,scale:f.sc,duration:260,ease:'Back.easeOut'})}return b}
 kill(b){b.gone=1;try{this.matter.world.remove(b.body)}catch(e){}b.d.destroy();b.f.destroy()}
 /* ---- 조작 ---- */
 pdown(p){if(this.mode!=='play')return;AU.init();this.aim=true;this.pmove(p)}
 pmove(p){if(this.mode!=='play'||!this.held||!this.aim)return;const r=LV[this.held.lv].r;this.heldX=clamp(p.worldX,JL+r,JR-r)}
 pup(p){if(this.mode!=='play'||!this.aim)return;this.aim=false;if(!this.held||this.cool>0)return;this.pmove(p);this.drop()}
 drop(){const h=this.held;this.held=null;h.d.destroy();h.f.destroy();const b=this.spawn(this.heldX,HOLDY,h.lv,true);AU.sfx('drop');this.cool=.55;this.guide.clear();
  this.time.delayedCall(550,()=>{if(this.mode==='play')this.newHeld()})}
 shake(){if(this.mode!=='play'||this.shakes<=0)return;this.shakes--;$('shk').textContent='🫨 흔들기 '+this.shakes;AU.sfx('boom');this.cameras.main.shake(400,.015);
  this.balls.forEach(b=>{this.matter.body.applyForce(b.body,b.body.position,{x:rnd(-.02,.02)*b.body.mass,y:-rnd(.02,.045)*b.body.mass})})}
 /* ---- 합치기 ---- */
 merge(a,b){const lv=a.lv,x=(a.body.position.x+b.body.position.x)/2,y=(a.body.position.y+b.body.position.y)/2;
  // 두 친구가 가운데로 빨려 들어가요
  [a,b].forEach(o=>{try{this.matter.world.remove(o.body)}catch(e){}this.tweens.add({targets:[o.d,o.f],x,y,duration:70,onComplete:()=>{o.d.destroy();o.f.destroy()}})});
  this.balls=this.balls.filter(o=>o!==a&&o!==b);
  this.combo=this.comboT>0?this.combo+1:1;this.comboT=1.1;
  const col=Phaser.Display.Color.HexStringToColor(LV[lv].col).color;
  this.time.delayedCall(70,()=>{if(this.mode!=='play')return;
   if(lv<10){const nb=this.spawn(x,y,lv+1);this.matter.body.setVelocity(nb.body,{x:0,y:-1.2});if(lv+1>S.seen){S.seen=lv+1;SV.put();KIT.toast('🎉 새 친구 '+LV[lv+1].n+'!');this.cameras.main.flash(250,255,255,255)}}
   else{KIT.floatText(this,x,y-40,'하트여왕 둘이 만나 반짝! +500','#ffd25a',26);this.addScore(500);AU.sfx('win')}
   const pts=PTS[Math.min(10,lv+1)]*(this.combo>=2?this.combo:1);this.addScore(pts);
   AU.sfx('pop',lv);this.em.setParticleTint([0xffffff,col,0xffe066]);this.em.explode(6+lv*2,x,y);this.emDot.setParticleTint(col);this.emDot.explode(8,x,y);
   const ring=this.add.circle(x,y,LV[lv].r,0xffffff,0).setStrokeStyle(4,0xffffff,.9).setDepth(29);this.tweens.add({targets:ring,scale:2.2,alpha:0,duration:380,onComplete:()=>ring.destroy()});
   KIT.floatText(this,x,y-LV[Math.min(10,lv+1)].r,'+'+pts+(this.combo>=2?` 연쇄 x${this.combo}`:''),this.combo>=2?'#ffe066':'#ffffff',this.combo>=2?24:20);
   if(lv>=5)this.cameras.main.shake(120+lv*15,.002*lv)})}
 addScore(v){this.score+=v;this.tweens.addCounter({from:this.shown,to:this.score,duration:350,onUpdate:t=>{this.shown=Math.round(t.getValue());this.scoreTx.setText(this.shown)}});this.tweens.add({targets:this.scoreTx,scale:1.15,duration:90,yoyo:true});if(this.score>S.best)this.bestTx.setText('👑 '+this.score)}
 update(t,dl){const dt=Math.min(dl/1000,1/20);
  for(const b of this.balls){const p=b.body.position;b.d.setPosition(p.x,p.y).setRotation(b.body.angle);b.f.setPosition(p.x,p.y).setRotation(b.body.angle)}
  if(this.mode==='home'){if(this.balls.length>16){const o=this.balls.shift();this.kill(o)}return}
  if(this.mode!=='play')return;
  while(this.queue.length){const [a,b]=this.queue.shift();this.merge(a,b)}
  if(this.cool>0)this.cool-=dt;if(this.comboT>0)this.comboT-=dt;
  if(this.held){const h=this.held,r=LV[h.lv].r;h.d.x+=(this.heldX-h.d.x)*.45;h.f.x=h.d.x;h.f.y=h.d.y=HOLDY+Math.sin(t/300)*3;
   const g=this.guide;g.clear();g.lineStyle(3,0xffffff,.55);for(let y=HOLDY+r+6;y<JB;y+=16)g.lineBetween(h.d.x,y,h.d.x,y+8)}
  // 넘침 검사
  let over=false;for(const b of this.balls){if(t-b.born>1300&&b.body.position.y-LV[b.lv].r<JT&&Math.abs(b.body.velocity.y)<1.5){over=true;break}}
  if(over){this.dangerT+=dt;this.drawDanger(.5+.5*Math.sin(t/80));if(this.dangerT>.1&&!this.warned){this.warned=1;AU.sfx('warn')}if(this.dangerT>2.6)this.gameOver()}
  else{if(this.dangerT>0){this.dangerT=Math.max(0,this.dangerT-dt*2);this.drawDanger(0)}this.warned=0}}
 gameOver(){this.mode='over';const nb=this.score>S.best;if(nb)S.best=this.score;SV.put();AU.sfx('lose');if(this.held){this.held.d.destroy();this.held.f.destroy();this.held=null}this.guide.clear();
  this.balls.slice().reverse().forEach((b,i)=>this.time.delayedCall(i*60,()=>{if(b.gone)return;this.em.setParticleTint(0xffffff);this.em.explode(4,b.body.position.x,b.body.position.y);b.d.setTint(0xb0a8c0);b.f.setTint(0xb0a8c0)}));
  const top=this.balls.reduce((m,b)=>Math.max(m,b.lv),0);
  this.time.delayedCall(Math.min(2000,this.balls.length*60)+500,()=>{$('rT').textContent=nb?'🎉 새 최고 기록!':'병이 가득 찼어요!';
   $('rB').innerHTML=`<div class="rline">점수 <b>${this.score}</b></div><div class="rline" style="font-size:18px">가장 큰 친구: ${LV[top].n} · 👑 최고 ${S.best}</div>`;this.sc('res');if(nb)AU.sfx('win')})}
}
new Phaser.Game({type:Phaser.AUTO,parent:'game',width:W*R,height:H*R,backgroundColor:'#2b2340',scale:{mode:Phaser.Scale.FIT,autoCenter:Phaser.Scale.CENTER_BOTH},render:{antialias:true},audio:{noAudio:true},
 physics:{default:'matter',matter:{gravity:{y:1.5},positionIterations:8,velocityIterations:6,debug:false}},scene:[Boot,Main]});
$('ui').style.width=W+'px';$('ui').style.height=H+'px';
})();
