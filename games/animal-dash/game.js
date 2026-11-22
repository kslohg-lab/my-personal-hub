/* 동물 친구 달리기 2 — Phaser 3 러너
   그림: ../animal-run/img (기존 동물 친구 달리기 그림을 같이 씀)
   저장: localStorage 'animalDashV1' (기존 게임 'animalRunV6'에서 열어 둔 친구는 자동으로 가져옴) */
(()=>{'use strict';
const W=800,H=400,G=322,PX=170,FONT='Jua, "Apple SD Gothic Neo", sans-serif';
const IMG='../animal-run/img/';
const R=(window.devicePixelRatio||1)>=1.5?2:1;
const $=id=>document.getElementById(id);
const rnd=(a,b)=>a+Math.random()*(b-a),pick=a=>a[Math.floor(Math.random()*a.length)],clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
const pad2=n=>String(n).padStart(2,'0');

/* ---------- 데이터 ---------- */
const AB={j:{jh:1.12,d:'점프가 아주 높아요'},s:{sh:5,d:'슬라이드하면 체력이 차올라요'},c:{cr:120,d:'코인을 멀리서 끌어와요'},h:{hd:.78,d:'체력이 천천히 줄어요'},t:{dm:.7,d:'부딪혀도 덜 아파요'},a:{ap:15,d:'사과를 먹으면 체력이 더 차요'},m:{mj:3,d:'3단 점프를 해요'},p:{pb:1.5,d:'파워업이 오래가요'},k:{cb:2,d:'코인을 2배로 모아요'},z:{mj:3,hd:.8,dm:.75,d:'3단 점프·체력·방어가 모두 좋아요'}};
const TD=[['하트몽','j'],['포롱','s'],['멍코','c'],['용기','h'],['우정이','t'],['포근','a'],['사랑빛','p'],['믿음','m'],['소망','k'],['하트여왕','z'],
['마카롱','j'],['푸딩','s'],['솜사탕','c'],['쿠키','h'],['초코','t'],['딸기','a'],['캔디','p'],['젤리','m'],['케이크','k'],['간식대장','z'],
['별빛','j'],['달토','s'],['구름이','c'],['무지개','h'],['오로라','t'],['유성','a'],['은하','p'],['새벽','m'],['달빛여신','k'],['우주용','z']];
const PR=[100,130,160,200,250,300,550,700,900,1800];
const CH=TD.map((r,i)=>({i,n:r[0],sk:r[1],p:i<3?0:PR[i%10],rr:i%10>8?2:i%10>5?1:0,...AB[r[1]]}));
CH.push({i:30,pet:1,n:'병아리',d:'코인을 더 멀리서 끌어와요',p:300,cr:90},{i:31,pet:1,n:'나비',d:'사과를 먹으면 체력이 10 더 차요',p:600,ap:10},{i:32,pet:1,n:'꿀벌',d:'파워업이 1.4배 오래가요',p:900,pb:1.4});
const TH=[
 {sky:['#8fd3ff','#e9fbff'],far:'#c7edbb',near:'#9ddc8c',gr:'#82d062',gr2:'#5fae45',dirt:'#c99561',spot:'#b07f4e',bg:'t0',cloud:1,amb:'petal'},
 {sky:['#ffb08c','#ffe8bc'],far:'#f6d1a6',near:'#e7ae80',gr:'#ecc57c',gr2:'#c99d55',dirt:'#cf975c',spot:'#b8824b',bg:'t1',cloud:1,amb:null},
 {sky:['#1b1e5a','#5c50b0'],far:'#2c2b70',near:'#3d3c90',gr:'#58a286',gr2:'#3c7a62',dirt:'#3d5a52',spot:'#30483f',bg:'t2',cloud:0,amb:'star'},
 {sky:['#b9e3ff','#f6fcff'],far:'#eef6fd',near:'#d6e9fa',gr:'#f8fbff',gr2:'#cfe2f3',dirt:'#a9c4de',spot:'#93b1cf',bg:'t3',cloud:1,amb:'snow'},
 {sky:['#ff8a76','#ffd69c'],far:'#c27c68',near:'#9a5850',gr:'#8a6457',gr2:'#664538',dirt:'#4e3530',spot:'#3d2925',bg:'t4',cloud:0,amb:'ember'}];
const OBS=[{small:['rock','log'],tall:'log',fall:'acorn',boar:1},{small:['rock','spike'],tall:'rock',fall:'meteor',boar:1},{small:['spike','rock'],tall:'log',fall:'meteor',boar:0},{small:['spike','water'],tall:'wave',fall:'acorn',boar:0},{small:['fire','rock'],tall:'fire',fall:'meteor',boar:1}];
const OH={rock:46,log:54,spike:52,water:30,fire:52,acorn:46,meteor:50,boar:60,bird:46,mush:58,wave:60};
const STG=[{n:'하트 숲',th:0},{n:'얼음 평원',th:3},{n:'별빛 밤숲',th:2},{n:'반짝 호수',th:0},{n:'솜사탕 평원',th:1},{n:'별빛 사막',th:1},{n:'무지개 협곡',th:0},{n:'달빛 바다',th:2},{n:'오로라 성',th:3},{n:'그림자 성',th:4}];
const BOSS=[{n:'불꽃 여우',at:['ball','ball','high'],pj:'fire'},{n:'가시 곰',at:['high','ball'],pj:'rock'},{n:'심술 멧돼지',at:['charge','ball'],pj:'rock'},{n:'그림자 늑대',at:['ball','high','combo'],pj:'fire',tint:0xb48cff},{n:'불꽃 사자',at:['drop','ball','high'],pj:'fire'},
 {n:'바위 고릴라',at:['drop','high','ball'],pj:'rock'},{n:'늪의 악어',at:['ball','tall','combo'],pj:'water'},{n:'파도 상어',at:['tall','high','drop'],pj:'water'},{n:'도깨비 왕',at:['ball','high','drop','charge','combo'],pj:'fire'},{n:'그림자 대마왕',at:['ball','high','drop','tall','charge','combo'],pj:'meteor',tint:0xc39cff}];
const PW={magnet:{n:'자석!',t:8},rocket:{n:'로켓!',t:3.2},giant:{n:'거대화!',t:5.5},bolt:{n:'번개! 장애물이 코인으로',t:0},fairy:{n:'요정 방패!',t:0}};

/* ---------- 저장 ---------- */
const KEY='animalDashV1';let S={};
try{S=JSON.parse(localStorage.getItem(KEY))||{}}catch(e){S={}}
const DEF=()=>({coins:0,un:[0,1,2],sel:0,pet:-1,cleared:0,stars:{},best:0,snd:1,bgm:1,tut:0});
S=Object.assign(DEF(),S);
try{const o=JSON.parse(localStorage.getItem('animalRunV6')||'null');if(o&&Array.isArray(o.un))o.un.forEach(i=>{if(Number.isInteger(i)&&i>=0&&i<CH.length&&!S.un.includes(i))S.un.push(i)})}catch(e){}
if(!S.un.includes(S.sel)||CH[S.sel].pet)S.sel=0;if(S.pet>=0&&!S.un.includes(S.pet))S.pet=-1;
const store=()=>{try{localStorage.setItem(KEY,JSON.stringify(S))}catch(e){}};
const starTotal=()=>Object.values(S.stars).reduce((a,b)=>a+b,0);

/* ---------- 소리 (직접 합성) ---------- */
const AU={ctx:null,
 init(){if(this.ctx){if(this.ctx.state==='suspended')this.ctx.resume();return}try{const C=window.AudioContext||window.webkitAudioContext;this.ctx=new C();this.out=this.ctx.createGain();this.out.gain.value=.9;this.out.connect(this.ctx.destination);this.mus=this.ctx.createGain();this.mus.gain.value=.5;this.mus.connect(this.out);
  const n=this.ctx.createBuffer(1,this.ctx.sampleRate*.5,this.ctx.sampleRate),d=n.getChannelData(0);for(let i=0;i<d.length;i++)d[i]=Math.random()*2-1;this.nb=n}catch(e){}},
 tone(f,d,ty='sine',v=.15,t0=0,f2=0,dest){if(!this.ctx||(!S.snd&&!dest))return;const c=this.ctx,o=c.createOscillator(),g=c.createGain(),s=c.currentTime+t0;o.type=ty;o.frequency.setValueAtTime(f,s);if(f2)o.frequency.exponentialRampToValueAtTime(f2,s+d);g.gain.setValueAtTime(0,s);g.gain.linearRampToValueAtTime(v,s+.008);g.gain.exponentialRampToValueAtTime(.0008,s+d);o.connect(g);g.connect(dest||this.out);o.start(s);o.stop(s+d+.02)},
 noise(d,v=.2,t0=0,ff=1200,dest,at){if(!this.ctx||!this.nb||(!S.snd&&!dest))return;const c=this.ctx,b=c.createBufferSource(),f=c.createBiquadFilter(),g=c.createGain(),s=at||c.currentTime+t0;b.buffer=this.nb;f.type='lowpass';f.frequency.value=ff;g.gain.setValueAtTime(v,s);g.gain.exponentialRampToValueAtTime(.0008,s+d);b.connect(f);f.connect(g);g.connect(dest||this.out);b.start(s);b.stop(s+d+.02)},
 sfx(k,a){switch(k){
  case'jump':this.tone(330,.2,'sine',.16,0,780);this.tone(660,.12,'triangle',.05,.02,1200);break;
  case'jump2':this.tone(520,.22,'sine',.14,0,1250);this.tone(1560,.1,'triangle',.05,.06,2200);break;
  case'land':this.noise(.07,.06,0,500);break;
  case'coin':{const q=1+Math.min(a||0,40)*.013;this.tone(1046*q,.07,'triangle',.09);this.tone(1568*q,.16,'triangle',.08,.055);break}
  case'hit':this.noise(.25,.3,0,1600);this.tone(220,.3,'sawtooth',.14,0,60);break;
  case'apple':this.tone(620,.12,'sine',.15);this.tone(930,.2,'sine',.14,.09);break;
  case'pow':[523,659,784,1046].forEach((f,i)=>this.tone(f,.14,'square',.06,i*.07));break;
  case'letter':this.tone(1318,.25,'triangle',.11);this.tone(1975,.3,'sine',.05,.04);break;
  case'bounce':this.tone(180,.35,'sine',.2,0,620);this.tone(360,.2,'triangle',.06,.05,900);break;
  case'roar':this.tone(110,.8,'sawtooth',.2,0,70);this.tone(165,.7,'square',.08,.05,90);this.noise(.8,.2,0,700);break;
  case'warn':this.tone(880,.09,'square',.07);this.tone(880,.09,'square',.07,.12);break;
  case'bhit':this.noise(.3,.32,0,2500);this.tone(980,.25,'square',.1,0,240);break;
  case'boom':this.noise(1.1,.4,0,900);this.tone(90,1,'sawtooth',.22,0,30);break;
  case'win':[523,659,784,1046,784,1046,1318].forEach((f,i)=>this.tone(f,.32,'triangle',.13,i*.11));break;
  case'lose':[523,466,392,330].forEach((f,i)=>this.tone(f,.35,'triangle',.13,i*.18));break;
  case'smash':this.noise(.18,.22,0,2200);this.tone(700,.15,'square',.06,0,200);break;
  case'shield':this.tone(1200,.3,'sine',.1,0,600);this.noise(.2,.1,0,3000);break;
  case'click':this.tone(700,.06,'sine',.1,0,900);break;
  case'whoosh':this.noise(.35,.12,0,2600);break;
 }}};
/* 배경 음악: 작은 순서기 */
const SONG={
 run:{bpm:126,root:[48,45,41,43],q:[0,0,0,0],mel:[72,0,74,76,0,79,76,0,72,0,76,74,0,72,69,0,77,0,76,74,0,72,74,0,74,0,76,79,0,77,76,74],w:'triangle',mv:.06},
 boss:{bpm:148,root:[45,41,43,40],q:[1,0,0,0],mel:[69,72,76,72,69,72,76,79,77,76,72,69,72,77,76,72,74,79,74,71,74,79,83,79,76,80,83,80,76,71,68,71],w:'square',mv:.035},
 menu:{bpm:104,root:[48,45,41,43],q:[0,1,0,0],mel:[76,0,0,79,0,0,76,0,72,0,0,76,0,0,74,0,72,0,0,77,0,0,76,0,74,0,0,71,0,0,0,0],w:'sine',mv:.07}};
const BGM={cur:null,step:0,next:0,tm:null,shift:0,
 play(k,shift){shift=shift||0;if(this.cur===k&&this.shift===shift)return;this.cur=k;this.shift=shift;this.step=0;if(!AU.ctx)return;this.next=AU.ctx.currentTime+.08;if(!this.tm)this.tm=setInterval(()=>this.tick(),60)},
 stop(){this.cur=null},
 tick(){const c=AU.ctx;if(!c||!this.cur||!S.bgm)return;const sg=SONG[this.cur],e=60/sg.bpm/2,f=n=>440*Math.pow(2,(n+this.shift-69)/12);
  while(this.next<c.currentTime+.2){const st=this.step%32,bar=Math.floor(st/8),r=sg.root[bar],minor=bar===0&&sg.q[0]||sg.q[bar];const t=this.next-c.currentTime;
   if(st%8===0||st%8===4)AU.tone(f(r),e*3.6,'triangle',.11,t,0,this.mus);
   if(st%2===1)AU.noise(.04,.025,0,7000,this.mus,this.next);
   const ch=[0,minor?3:4,7,12],an=r+24+ch[st%4];AU.tone(f(an),e*.9,'sine',.025,t,0,this.mus);
   const m=sg.mel[st];if(m)AU.tone(f(m),e*1.8,sg.w,sg.mv,t,0,this.mus);
   this.next+=e;this.step++}}};

/* ---------- 화면(UI) ---------- */
const UI={};
let SC=null; // Phaser 장면
function toast(t){const e=$('toast');e.textContent=t;e.style.opacity=1;clearTimeout(toast.h);toast.h=setTimeout(()=>e.style.opacity=0,1700)}
function screen(id){document.querySelectorAll('.scr').forEach(e=>e.classList.toggle('on',e.id===id));$('pbtn').style.display=id===null&&SC&&SC.playing()?'block':'none'}
function fitUI(){const c=document.querySelector('#game canvas');if(!c)return;const r=c.getBoundingClientRect(),k=r.width/W;$('ui').style.transform=`translate(${r.left}px,${r.top}px) scale(${k})`;$('rot').style.display=innerHeight>innerWidth*1.05?'flex':'none'}
addEventListener('resize',()=>setTimeout(fitUI,60));
function renderHome(){$('hc').textContent='🪙 '+S.coins;$('hs').textContent='⭐ '+starTotal();const inf=$('bInf');inf.textContent=S.cleared>=3?`♾️ 무한 달리기 (${S.best}m)`:'🔒 무한 달리기';inf.style.opacity=S.cleared>=3?1:.7}
function renderStages(){$('sc').textContent='⭐ '+starTotal()+'/30';const g=$('sgrid');g.innerHTML='';
 STG.forEach((s,i)=>{const n=i+1,lk=n>S.cleared+1,st=S.stars[n]||0,b=document.createElement('button');b.className='st'+(lk?' lk':'');
  b.innerHTML=`<span class="no">${n}</span><img src="${IMG}boss/${pad2(n)}.webp" alt=""><span>${s.n}</span><span class="sr">${lk?'🔒':'⭐'.repeat(st)+'☆'.repeat(3-st)}</span>`;
  b.onclick=()=>{AU.sfx('click');if(lk){toast('앞 단계를 먼저 깨요!');return}screen(null);SC.startRun('stage',n)};g.appendChild(b)})}
let ctab=0,cview=S.sel;
function renderChars(){$('cc').textContent='🪙 '+S.coins;const tb=$('ctabs');tb.innerHTML='';
 ['💗 하트','🍬 간식','🌙 하늘','🐾 펫'].forEach((t,j)=>{const b=document.createElement('button');b.textContent=t;if(j===ctab)b.className='on';b.onclick=()=>{AU.sfx('click');ctab=j;renderChars()};tb.appendChild(b)});
 const g=$('cgrid');g.innerHTML='';
 CH.forEach(c=>{const th=c.pet?3:Math.floor(c.i/10);if(th!==ctab)return;const u=S.un.includes(c.i),b=document.createElement('button');
  b.className='cc'+((S.sel===c.i||S.pet===c.i)?' sel':'')+(u?'':' lk');
  b.innerHTML=`<img src="${IMG}ch/${pad2(c.i)}.webp" alt=""><span>${c.n}</span>${u?'':`<span class="pr">🪙 ${c.p}</span>`}${c.rr?`<span class="bd">${['','✨','👑'][c.rr]}</span>`:''}`;
  b.onclick=()=>{AU.sfx('click');cview=c.i;renderChars()};g.appendChild(b)});
 const c=CH[cview],u=S.un.includes(c.i);$('ciImg').src=`${IMG}ch/${pad2(c.i)}.webp`;$('ciName').textContent=c.n+(c.rr?' '+['','✨','👑'][c.rr]:'');
 $('ciDesc').textContent=(c.pet?'🐾 펫: ':'')+(c.d||AB[c.sk].d);
 const btn=$('ciBtn');
 if(!u){btn.textContent=`🔓 ${c.p}🪙로 데려오기`;btn.disabled=false;btn.onclick=()=>{if(S.coins<c.p){toast(`코인이 ${c.p-S.coins}개 더 필요해요`);return}S.coins-=c.p;S.un.push(c.i);if(c.pet)S.pet=c.i;else S.sel=c.i;store();AU.sfx('win');toast(c.n+' 친구가 함께해요! 🎉');renderChars();SC&&SC.refreshHero()}}
 else if(c.pet){const on=S.pet===c.i;btn.textContent=on?'🐾 함께하는 중 (빼기)':'🐾 함께 가기';btn.onclick=()=>{S.pet=on?-1:c.i;store();AU.sfx('click');renderChars();SC&&SC.refreshHero()}}
 else{const on=S.sel===c.i;btn.textContent=on?'✅ 함께 달리는 중':'🏃 이 친구로 달리기';btn.onclick=()=>{S.sel=c.i;store();AU.sfx('click');renderChars();SC&&SC.refreshHero()}}}
function renderSet(){$('tSnd').textContent=S.snd?'🔊 효과음 켜짐':'🔇 효과음 꺼짐';$('tBgm').textContent=S.bgm?'🎵 음악 켜짐':'🔕 음악 꺼짐'}
function bindUI(){
 document.querySelectorAll('[data-back]').forEach(b=>b.onclick=()=>{AU.sfx('click');renderHome();screen('home')});
 $('bPlay').onclick=()=>{AU.init();AU.sfx('click');BGM.play('menu');renderStages();screen('stg')};
 $('bInf').onclick=()=>{AU.init();if(S.cleared<3){toast('3단계를 깨면 열려요!');return}AU.sfx('click');screen(null);SC.startRun('inf',1)};
 $('bChar').onclick=()=>{AU.init();AU.sfx('click');BGM.play('menu');cview=S.sel;ctab=Math.floor(S.sel/10);renderChars();screen('chs')};
 $('bSet').onclick=()=>{AU.init();AU.sfx('click');renderSet();screen('set')};
 $('tSnd').onclick=()=>{S.snd=S.snd?0:1;store();renderSet();AU.sfx('click')};
 $('tBgm').onclick=()=>{S.bgm=S.bgm?0:1;store();renderSet()};
 $('tDel').onclick=()=>{const b=$('tDel');if(b.dataset.s!=='1'){b.dataset.s='1';b.textContent='⚠️ 정말요? 한 번 더!';setTimeout(()=>{b.dataset.s='';b.textContent='🗑️ 기록 지우기'},3000);return}const un=S.un;S=DEF();store();b.dataset.s='';b.textContent='🗑️ 기록 지우기';toast('기록을 지웠어요');renderSet();SC.refreshHero()};
 $('pbtn').onclick=()=>SC.pause();
 $('pGo').onclick=()=>SC.resume();
 $('pRe').onclick=()=>{SC.resume(true);SC.quit(false);SC.startRun(SC.mode0,SC.stage)};
 $('pMenu').onclick=()=>{SC.resume(true);SC.quit(true)};
 $('rRe').onclick=()=>{AU.sfx('click');screen(null);SC.startRun(SC.mode0,SC.stage)};
 $('rNext').onclick=()=>{AU.sfx('click');screen(null);SC.startRun('stage',Math.min(10,SC.stage+1))};
 $('rMenu').onclick=()=>{AU.sfx('click');SC.toDemo();renderHome();screen('home')};
 document.addEventListener('visibilitychange',()=>{if(document.hidden&&SC&&SC.playing())SC.pause()});
 document.addEventListener('pointerdown',()=>AU.init(),{once:true});
}
function showResult(o){
 $('rT').textContent=o.clear?(o.stage===10?'🎉 하트를 모두 되찾았어요!':'🎉 '+o.stage+'단계 클리어!'):o.mode==='inf'?'♾️ 무한 달리기 끝!':'😵 아쉬워요!';
 $('rS').innerHTML=o.clear?[0,1,2].map(i=>`<span${i<o.stars?' class="on" style="animation-delay:'+(.25+i*.28)+'s"':''}>⭐</span>`).join(''):'';
 $('rS').style.display=o.clear?'block':'none';
 $('rB').innerHTML=`<div class="rline">🪙 모은 코인 <b>${o.coins}</b>${o.bonus?` <span style="font-size:17px">(보스 보너스 +${o.bonus})</span>`:''}</div>${o.mode==='inf'?`<div class="rline">🏃 ${o.dist}m ${o.best?'<b>🎉 최고 기록!</b>':`(최고 ${S.best}m)`}</div>`:`<div class="rline">🏃 ${o.clear?'보스까지 완주!':o.bossLeft?`보스까지 갔어요! (보스 하트 ${o.bossLeft}개 남음)`:Math.floor(o.prog*100)+'% 달렸어요'}</div>`}${o.unlock?`<div class="rline" style="font-size:18px">🔓 ${o.unlock}</div>`:''}${!o.clear&&o.mode==='stage'?`<div style="font-size:16px;margin-top:4px;color:#8a6a9a">💡 ${pick(['사과 🍎를 놓치지 마세요!','코인 길을 따라가면 점프 타이밍이 보여요','하늘을 나는 새는 왼쪽 꾹 슬라이드!','키 큰 장애물은 두 번 톡 2단 점프!','보스전 ⭐을 먹으면 보스에게 날아가요'])}</div>`:''}`;
 $('rNext').style.display=o.clear&&o.stage<10?'':'none';
 screen('res');
}

/* ---------- Phaser 장면 ---------- */
class Boot extends Phaser.Scene{
 constructor(){super('boot')}
 preload(){
  this.load.on('progress',v=>{$('lbar').style.width=Math.round(v*100)+'%'});
  for(let i=0;i<33;i++)this.load.image('ch'+i,IMG+'ch/'+pad2(i)+'.webp');
  for(let i=1;i<=10;i++)this.load.image('boss'+i,IMG+'boss/'+pad2(i)+'.webp');
  ['acorn','bird','boar','fire','log','meteor','mush','rock','spike','water','wave'].forEach(k=>this.load.image(k,IMG+'ob/'+k+'.webp'));
  ['apple','bolt','coin','fairy','magnet','mushroom','rocket','star'].forEach(k=>this.load.image('it_'+k,IMG+'it/'+k+'.webp'));
  ['t0_bush','t0_cloud','t0_deco','t0_tree','t1_bush','t1_cloud','t1_deco','t1_tree','t2_bush','t2_deco','t2_tree','t3_bush','t3_cloud','t3_deco','t3_tree','t4_bush','t4_deco','t4_tree'].forEach(k=>this.load.image(k,IMG+'bg/'+k+'.webp'));
 }
 create(){const go=()=>this.scene.start('main');const f=document.fonts&&document.fonts.load?document.fonts.load('24px Jua'):Promise.resolve();Promise.race([f,new Promise(r=>setTimeout(r,2500))]).then(go,go)}
}

class Main extends Phaser.Scene{
 constructor(){super('main')}
 create(){
  SC=this;window.__dash=this;this.cameras.main.setZoom(R).centerOn(W/2,H/2);
  this.makeTextures();
  this.mode='demo';this.th=-1;this.spd=250;this.t=0;this.ts=1;this.freeze=0;
  this.obs=[];this.items=[];this.bgo=[];this.slideIds=new Set();this.keys={};
  // 배경 층
  this.sky=this.add.image(0,0,'sky0').setOrigin(0).setDisplaySize(W,H).setDepth(0);
  this.sky2=this.add.image(0,0,'sky0').setOrigin(0).setDisplaySize(W,H).setDepth(0.5).setAlpha(0);
  this.far=this.add.tileSprite(0,H-250,W,190,'far0').setOrigin(0).setDepth(3);
  this.near=this.add.tileSprite(0,H-205,W,150,'near0').setOrigin(0).setDepth(4);
  this.ground=this.add.tileSprite(0,G-14,W,H-G+14,'gr0').setOrigin(0).setDepth(7);
  // 그림자·주인공·펫
  this.shadow=this.add.image(PX,G+3,'shadow').setDepth(12).setAlpha(.22);
  this.hero=this.add.image(PX,G,'ch0').setOrigin(.5,1).setDepth(14);
  this.petS=this.add.image(PX-78,G,'ch30').setOrigin(.5,1).setDepth(13).setVisible(false);
  this.bubble=this.add.image(PX,G-40,'dot').setDepth(15).setTint(0xffb8e0).setAlpha(0).setScale(5);
  this.pv={sx:1,sy:1,rot:0};
  // 파티클
  const P=(tex,cfg,d)=>this.add.particles(0,0,tex,Object.assign({emitting:false},cfg)).setDepth(d||20);
  this.emDust=P('dot',{lifespan:420,speedX:{min:-160,max:-60},speedY:{min:-70,max:-10},scale:{start:.55,end:0},alpha:{start:.7,end:0},tint:0xffffff},13);
  this.emSpark=P('spark',{lifespan:520,speed:{min:90,max:240},scale:{start:.8,end:0},rotate:{min:0,max:360},tint:[0xfff27a,0xffffff,0xffc2e6]});
  this.emHit=P('spark',{lifespan:600,speed:{min:160,max:360},scale:{start:1.1,end:0},rotate:{min:0,max:360},tint:[0xff6b6b,0xffd25a,0xffffff]});
  this.emBig=P('dot',{lifespan:900,speed:{min:120,max:460},scale:{start:1.6,end:0},alpha:{start:1,end:0},tint:[0xffd25a,0xff8a5a,0xffffff,0xff6fa8]});
  this.emTrail=P('dot',{lifespan:380,speedX:{min:-260,max:-140},speedY:{min:-30,max:30},scale:{start:.9,end:0},alpha:{start:.9,end:0},tint:[0xffb347,0xff6b3d,0xfff27a],frequency:22,emitting:false},13);
  this.emSpeed=P('line',{x:{min:W,max:W+40},y:{min:30,max:G-10},lifespan:500,speedX:{min:-1300,max:-900},alpha:{start:.6,end:0},scaleX:{min:.5,max:1.2},scaleY:.5,frequency:45,emitting:false},6);
  this.amb=null;
  // HUD
  this.hud=this.add.container(0,0).setDepth(60).setVisible(false);
  this.hpG=this.add.graphics();this.hud.add(this.hpG);
  this.hpIc=this.add.text(18,22,'❤️',{fontFamily:FONT,fontSize:'26px'}).setOrigin(.5).setResolution(R);this.hud.add(this.hpIc);
  this.coinIc=this.add.image(W-118,24,'it_coin').setDisplaySize(30,30);this.hud.add(this.coinIc);
  this.coinTx=this.txt(W-98,24,'0',26,'#fff').setOrigin(0,.5);this.hud.add(this.coinTx);
  this.progG=this.add.graphics();this.hud.add(this.progG);
  this.progHero=this.add.image(300,24,'ch0');this.hud.add(this.progHero);
  this.progBoss=this.add.image(520,24,'boss1');this.hud.add(this.progBoss);
  this.distTx=this.txt(W/2,24,'',22,'#fff');this.hud.add(this.distTx);
  this.lets=[...'BONUS'].map((ch,i)=>{const t=this.txt(30+i*26,56,ch,22,'#ffffff');t.setAlpha(.35);this.hud.add(t);return t});
  this.comboTx=this.txt(W/2,74,'',26,'#ffe066').setAlpha(0);this.hud.add(this.comboTx);
  this.bossG=this.add.graphics();this.hud.add(this.bossG);
  this.bossTx=this.txt(W/2,22,'',18,'#fff');this.hud.add(this.bossTx);
  this.hint=this.txt(W/2,150,'',30,'#fff').setDepth(70).setAlpha(0);
  // 입력
  this.input.addPointer(2);
  this.input.on('pointerdown',p=>{AU.init();if(!this.playing())return;if(p.x<this.scale.width*.42)this.slideIds.add(p.id);else{this.holdR=(this.holdR||0)+1;this.press()}});
  this.input.on('pointerup',p=>{if(this.slideIds.has(p.id))this.slideIds.delete(p.id);else this.holdR=Math.max(0,(this.holdR||0)-1)});
  this.input.on('gameout',()=>{this.slideIds.clear();this.holdR=0});
  const kb=this.input.keyboard;
  if(kb){kb.on('keydown',e=>{AU.init();if(e.repeat)return;if(e.code==='Space'||e.code==='ArrowUp'||e.code==='KeyW'){this.keys.j=1;if(this.playing())this.press()}if(e.code==='ArrowDown'||e.code==='KeyS')this.keys.d=1;if(e.code==='Escape'||e.code==='KeyP')this.playing()?this.pause():null});
   kb.on('keyup',e=>{if(e.code==='Space'||e.code==='ArrowUp'||e.code==='KeyW')this.keys.j=0;if(e.code==='ArrowDown'||e.code==='KeyS')this.keys.d=0})}
  this.scale.on('resize',()=>setTimeout(fitUI,30));
  this.refreshHero();this.setTheme(0,true);this.toDemo();
  $('load').style.display='none';fitUI();setTimeout(fitUI,300);bindUI();renderHome();screen('home');
 }
 txt(x,y,s,size,color){return this.add.text(x,y,s,{fontFamily:FONT,fontSize:size+'px',color:color||'#fff',stroke:'#4a2d5e',strokeThickness:Math.max(3,size/5)}).setOrigin(.5).setResolution(R)}
 makeTextures(){
  const g=this.make.graphics({x:0,y:0,add:false});
  g.fillStyle(0xffffff);g.fillCircle(8,8,8);g.generateTexture('dot',16,16);g.clear();
  g.fillStyle(0xffffff);g.beginPath();g.moveTo(10,0);g.lineTo(12.6,7.4);g.lineTo(20,10);g.lineTo(12.6,12.6);g.lineTo(10,20);g.lineTo(7.4,12.6);g.lineTo(0,10);g.lineTo(7.4,7.4);g.closePath();g.fillPath();g.generateTexture('spark',20,20);g.clear();
  g.fillStyle(0x000000);g.fillEllipse(40,10,80,18);g.generateTexture('shadow',80,20);g.clear();
  g.fillStyle(0xffffff);g.fillRoundedRect(0,0,90,4,2);g.generateTexture('line',90,4);g.clear();
  g.fillStyle(0xffffff,.9);g.fillCircle(32,32,30);g.fillStyle(0xffffff,1);g.fillCircle(32,32,24);g.generateTexture('glow',64,64);g.destroy();
  TH.forEach((t,i)=>{
   let c=this.textures.createCanvas('sky'+i,4,H),x=c.getContext(),gr=x.createLinearGradient(0,0,0,H);gr.addColorStop(0,t.sky[0]);gr.addColorStop(.85,t.sky[1]);x.fillStyle=gr;x.fillRect(0,0,4,H);c.refresh();
   const hill=(key,h,col,amp,f1,f2,ph)=>{const c=this.textures.createCanvas(key,W,h),x=c.getContext();x.fillStyle=col;x.beginPath();x.moveTo(0,h);for(let X=0;X<=W;X+=4){const y=h*.42-Math.sin(X/W*Math.PI*2*f1+ph)*amp-Math.sin(X/W*Math.PI*2*f2+ph*2)*amp*.35;x.lineTo(X,y)}x.lineTo(W,h);x.closePath();x.fill();
    x.globalAlpha=.18;x.strokeStyle='#ffffff';x.lineWidth=5;x.beginPath();for(let X=0;X<=W;X+=4){const y=h*.42-Math.sin(X/W*Math.PI*2*f1+ph)*amp-Math.sin(X/W*Math.PI*2*f2+ph*2)*amp*.35+3;X?x.lineTo(X,y):x.moveTo(X,y)}x.stroke();c.refresh()};
   hill('far'+i,190,t.far,38,2,5,.7);hill('near'+i,150,t.near,26,3,7,1.9);
   c=this.textures.createCanvas('gr'+i,160,H-G+14);x=c.getContext();const gh=H-G+14;
   x.fillStyle=t.dirt;x.fillRect(0,14,160,gh);
   x.fillStyle=t.spot;[[20,40,9],[70,60,6],[120,34,8],[150,70,5],[45,75,5],[95,48,4]].forEach(([a,b,r])=>{x.beginPath();x.ellipse(a,b,r*1.5,r,0,0,7);x.fill()});
   x.fillStyle=t.gr2;x.fillRect(0,12,160,14);for(let k=0;k<160;k+=20){x.beginPath();x.arc(k+10,26,10,0,Math.PI);x.fill()}
   x.fillStyle=t.gr;x.fillRect(0,4,160,16);for(let k=0;k<160;k+=20){x.beginPath();x.arc(k+10,20,10,0,Math.PI);x.fill()}
   x.globalAlpha=.35;x.fillStyle='#ffffff';x.fillRect(0,5,160,3);c.refresh();
  });
 }
 /* ---- 주인공 ---- */
 refreshHero(){const c=CH[S.sel];this.c=Object.assign({},c);const pt=S.pet>=0?CH[S.pet]:null;this.pet=pt;
  if(pt){['cr','ap','pb'].forEach(k=>{if(pt[k])this.c[k]=k==='ap'?(this.c.ap||0)+pt[k]:Math.max(this.c[k]||0,pt[k])})}
  this.hero.setTexture('ch'+c.i);this.hsc=78/this.hero.frame.height;this.hero.setScale(this.hsc);
  this.progHero.setTexture('ch'+c.i);this.progHero.setScale(26/this.progHero.frame.height);
  if(pt){this.petS.setTexture('ch'+pt.i).setVisible(true);this.petS.setScale(42/this.petS.frame.height)}else this.petS.setVisible(false)}
 playing(){return this.mode==='run'||this.mode==='boss'||this.mode==='bossIn'}
 /* ---- 테마 ---- */
 setTheme(i,instant){if(this.th===i)return;this.th=i;const t=TH[i];
  if(instant){this.sky.setTexture('sky'+i).setDisplaySize(W,H)}else{this.sky2.setTexture('sky'+i).setDisplaySize(W,H).setAlpha(0);this.tweens.add({targets:this.sky2,alpha:1,duration:900,onComplete:()=>{this.sky.setTexture('sky'+i).setDisplaySize(W,H);this.sky2.setAlpha(0)}});this.cameras.main.flash(350,255,255,255)}
  this.far.setTexture('far'+i);this.near.setTexture('near'+i);this.ground.setTexture('gr'+i);
  this.bgo.forEach(o=>o.s.destroy());this.bgo=[];
  for(let k=0;k<4;k++)this.addBg('tree',rnd(0,W));for(let k=0;k<5;k++)this.addBg('bush',rnd(0,W));for(let k=0;k<3;k++)this.addBg('deco',rnd(0,W));if(t.cloud)for(let k=0;k<3;k++)this.addBg('cloud',rnd(0,W));
  this.bgT={tree:rnd(.5,1.5),bush:rnd(.3,1),deco:rnd(1,2),cloud:rnd(2,4)};
  if(this.amb){this.amb.destroy();this.amb=null}if(this.stars){this.stars.forEach(s=>s.destroy());this.stars=null}
  if(t.amb==='petal')this.amb=this.add.particles(0,0,'dot',{x:{min:0,max:W+200},y:-10,lifespan:6000,speedX:{min:-90,max:-30},speedY:{min:25,max:60},scale:{min:.25,max:.45},alpha:.8,tint:[0xffb8d6,0xffffff,0xffd6ea],frequency:260}).setDepth(9);
  if(t.amb==='snow')this.amb=this.add.particles(0,0,'dot',{x:{min:0,max:W+200},y:-10,lifespan:7000,speedX:{min:-110,max:-40},speedY:{min:40,max:80},scale:{min:.2,max:.5},alpha:.9,frequency:90}).setDepth(9);
  if(t.amb==='ember')this.amb=this.add.particles(0,0,'dot',{x:{min:0,max:W+100},y:H,lifespan:4000,speedX:{min:-80,max:-20},speedY:{min:-90,max:-40},scale:{min:.15,max:.35},alpha:{start:1,end:0},tint:[0xffa040,0xff6020,0xffe080],frequency:140}).setDepth(9);
  if(t.amb==='star'){this.stars=[];for(let k=0;k<34;k++){const s=this.add.image(rnd(0,W),rnd(10,190),'spark').setScale(rnd(.2,.5)).setDepth(1).setAlpha(rnd(.3,1));this.tweens.add({targets:s,alpha:.15,duration:rnd(700,1800),yoyo:true,repeat:-1,delay:rnd(0,1500)});this.stars.push(s)}}
 }
 addBg(k,x){const t=TH[this.th];if(k==='cloud'&&!t.cloud)return;const key=t.bg+'_'+k;if(!this.textures.exists(key))return;
  const cfg={tree:{f:.42,h:rnd(120,165),y:G+6,d:5},bush:{f:.7,h:rnd(44,60),y:G+8,d:6},deco:{f:1,h:rnd(32,42),y:G+10,d:8},cloud:{f:.08,h:rnd(46,70),y:rnd(50,140),d:2}}[k];
  const s=this.add.image(x,cfg.y,key).setOrigin(.5,1).setDepth(cfg.d);s.setScale(cfg.h/s.frame.height);if(k==='tree')s.setTint(0xf2f2f2);if(k==='cloud')s.setAlpha(.92);
  this.bgo.push({s,f:cfg.f,k})}
 /* ---- 모드 ---- */
 toDemo(){this.clearWorld();this.mode='demo';this.dead=false;this.pv={sx:1,sy:1,rot:0};this.spd=250;this.hud.setVisible(false);this.p=this.newP();this.demoJ=2;this.setTheme(0);this.hero.setAlpha(1);BGM.play('menu');$('pbtn').style.display='none'}
 newP(){return{y:G,vy:0,j:0,ground:true,slide:false,inv:0,giant:0,rocket:0,magnet:0,guard:0,fly:0}}
 clearWorld(){this.obs.forEach(o=>o.s.destroy());this.items.forEach(o=>o.s.destroy());this.obs=[];this.items=[];if(this.boss){this.boss.s.destroy();this.boss=null}this.emTrail.stop();this.emSpeed.stop();this.bossG.clear();this.bossTx.setText('');this.hint.setAlpha(0);this.ts=1}
 startRun(mode,stage){
  AU.init();this.clearWorld();this.refreshHero();
  this.mode0=mode;this.stage=stage;this.mode='run';this.dist=0;this.coins=0;this.hp=100;this.combo=0;this.comboT=0;this.letters=0;this.bonusT=0;this.freeze=0;this.bossBonus=0;this.t=0;
  this.L=mode==='inf'?Infinity:1300+stage*110;this.base=mode==='inf'?300:318+stage*13;this.spd=this.base;
  this.p=this.newP();this.pv={sx:1,sy:1,rot:0};this.dead=false;this.slowK=1;this.hero.setAlpha(1).setRotation(0);
  this.nextX=W+120;this.stopSpawn=false;this.chunkN=0;this.appleT=rnd(9,12);this.powT=rnd(14,20);this.letT=rnd(5,8);
  this.tut=mode==='stage'&&stage===1&&!S.tut?['breath','tutJ','breath','tutT','breath','tutS']:[];this.tutOn=null;
  this.setTheme(mode==='inf'?0:STG[stage-1].th);this.lastTh=this.th;
  this.hud.setVisible(true);this.lets.forEach(t=>t.setAlpha(.35).setColor('#ffffff'));
  this.progBoss.setTexture('boss'+(mode==='inf'?10:stage));this.progBoss.setScale(30/this.progBoss.frame.height);this.progBoss.setVisible(mode!=='inf');this.progHero.setVisible(mode!=='inf');
  this.coinTx.setText('0');screen(null);$('pbtn').style.display='block';
  BGM.play('run',mode==='inf'?0:[0,2,-3,0,5,3,-2,-5,2,-4][stage-1]);
  this.banner(mode==='inf'?'♾️ 무한 달리기!':`${stage}단계 · ${STG[stage-1].n}`,mode==='inf'?'얼마나 멀리 갈 수 있을까요?':`${BOSS[stage-1].n}에게서 하트를 되찾아요!`);
 }
 banner(a,b){const t1=this.txt(W/2,150,a,40,'#fff').setDepth(80).setScale(.3).setAlpha(0),t2=b?this.txt(W/2,196,b,22,'#ffe9a8').setDepth(80).setAlpha(0):null;
  this.tweens.add({targets:t1,scale:1,alpha:1,duration:420,ease:'Back.easeOut'});if(t2)this.tweens.add({targets:t2,alpha:1,duration:400,delay:200});
  this.tweens.add({targets:[t1,t2].filter(Boolean),alpha:0,y:'-=30',duration:500,delay:1900,onComplete:()=>{t1.destroy();t2&&t2.destroy()}})}
 pause(){if(!this.playing())return;this.slideIds.clear();this.holdR=0;this.scene.pause();screen('pause');AU.ctx&&AU.ctx.suspend&&AU.ctx.suspend()}
 resume(silent){if(AU.ctx&&AU.ctx.resume)AU.ctx.resume();this.scene.resume();if(!silent)screen(null);$('pbtn').style.display='block'}
 quit(toMenu){S.coins+=this.coins||0;if(this.mode0==='inf'&&this.dist)S.best=Math.max(S.best,Math.floor(this.dist));store();this.coins=0;if(toMenu){this.toDemo();renderHome();screen('home')}}
 /* ---- 조작 ---- */
 press(){const p=this.p;if(this.bonusT>0||this.mode==='over')return;
  if(this.tutOn){const k=this.tutOn.k;if(k==='tutJ')this.endTut();else if(k==='tutT'){if(p.ground)this.hint.setText('👉 한 번 더 톡!');else if(p.j>=1)this.endTut()}}
  if(p.ground){this.jump(1)}else if(p.j<(this.c.mj||2)){this.jump(2)}else this.jbuf=.14}
 jump(n){const p=this.p;p.vy=-(n===1?850:770)*(this.c.jh||1);p.ground=false;p.j=n===1?1:p.j+1;p.slide=false;
  if(n===1){AU.sfx('jump');this.tweens.add({targets:this.pv,sx:.82,sy:1.22,duration:90,yoyo:true,ease:'Quad.easeOut'});this.emDust.explode(5,PX,G)}
  else{AU.sfx('jump2');this.pv.rot=0;this.tweens.add({targets:this.pv,rot:Math.PI*2,duration:420,ease:'Cubic.easeOut',onComplete:()=>this.pv.rot=0});this.emSpark.explode(6,PX,p.y-30)}}
 /* ---- 매 프레임 ---- */
 update(time,delta){
  let dt=Math.min(delta/1000,1/30);
  if(this.freeze>0){this.freeze-=dt;return}
  dt*=this.ts;this.t+=dt;
  const sp=this.mode==='result'?(this.dead?0:200):this.spd*(this.p.rocket>0?1.7:1)*(this.mode==='over'||this.mode==='clear'?this.slowK:1);
  this.scrollWorld(sp,dt);
  if(this.mode==='demo'){this.demo(dt);this.heroDraw(dt);return}
  if(this.mode==='result'){if(!this.dead){this.physics(dt);this.heroDraw(dt)}return}
  if(this.mode==='over'){this.heroDraw(dt);this.updObs(sp,dt,true);this.updItems(sp,dt);return}
  if(this.mode==='clear'){this.physics(dt);this.heroDraw(dt);this.updItems(sp,dt);this.drawHud();return}
  // 진행
  this.dist+=sp*dt/10;
  if(this.mode0==='inf'){this.spd=Math.min(560,this.base+this.dist*.06);const th=Math.floor(this.dist/1200)%5;if(th!==this.th){this.setTheme(th)}}
  else if(this.mode==='run')this.spd=this.base*(1+Math.min(.18,this.dist/this.L*.18));
  // 체력
  const drain=(this.mode==='boss'?.6:1.35)*(this.c.hd||1)*(this.stage>=6?1.1:1);
  if(this.bonusT<=0&&!this.tutOn)this.hp-=drain*dt;
  if(this.p.slide&&this.c.sh)this.hp=Math.min(100,this.hp+this.c.sh*dt);
  // 타이머
  const P=this.p;['inv','giant','rocket','magnet'].forEach(k=>{if(P[k]>0){P[k]-=dt;if(P[k]<=0){P[k]=0;if(k==='rocket'){this.emTrail.stop();this.emSpeed.stop();P.inv=Math.max(P.inv,1)}if(k==='giant'){P.inv=Math.max(P.inv,1);this.tweens.add({targets:this.pv,sx:1,sy:1,duration:200})}}}});
  if(this.comboT>0){this.comboT-=dt;if(this.comboT<=0)this.tweens.add({targets:this.comboTx,alpha:0,duration:300})}
  if(this.jbuf>0)this.jbuf-=dt;
  // 보너스 타임
  if(this.bonusT>0)this.bonus(dt);
  // 생성
  if(this.mode==='run'&&!this.stopSpawn&&this.bonusT<=0){this.nextX-=sp*dt;this.appleT-=dt;this.powT-=dt;this.letT-=dt;if(this.nextX<W+40)this.nextX+=this.spawnChunk(this.nextX)}
  if(this.mode==='run'&&this.dist>=this.L&&!this.stopSpawn){this.stopSpawn=true}
  if(this.mode==='run'&&this.stopSpawn&&!this.obs.some(o=>o.x>PX-40)&&this.bonusT<=0)this.bossEnter();
  if(this.mode==='boss')this.bossUpd(dt);
  if(this.boss)this.bossDraw(dt);
  this.physics(dt);
  this.updObs(sp,dt,false);this.updItems(sp,dt);
  this.tutCheck();
  this.heroDraw(dt);this.drawHud();
  if(this.hp<=0)this.die();
 }
 scrollWorld(sp,dt){
  this.ground.tilePositionX+=sp*dt;this.near.tilePositionX+=sp*.22*dt;this.far.tilePositionX+=sp*.1*dt;
  for(const o of this.bgo){o.s.x-=sp*o.f*dt+(o.k==='cloud'?8*dt:0);if(o.s.x<-o.s.displayWidth)o.dead=1}
  if(this.bgo.some(o=>o.dead)){this.bgo=this.bgo.filter(o=>{if(o.dead){o.s.destroy();return false}return true})}
  for(const k in this.bgT){this.bgT[k]-=dt*(sp/300);if(this.bgT[k]<=0){this.addBg(k,W+rnd(80,160));this.bgT[k]={tree:rnd(1.1,2.6),bush:rnd(.6,1.6),deco:rnd(1.4,3.2),cloud:rnd(3,6)}[k]}}}
 demo(dt){const p=this.p;this.demoJ-=dt;if(this.demoJ<=0){this.demoJ=rnd(2.2,4);this.jump(1);if(Math.random()<.5)this.time.delayedCall(260,()=>this.mode==='demo'&&this.jump(2))}this.physics(dt)}
 physics(dt){const p=this.p,gv=2700;
  const want=(this.slideIds.size>0||this.keys.d)&&this.mode!=='demo';
  if(this.bonusT>0)return;
  if(!p.ground){p.vy+=gv*dt*(want&&p.vy>-200?2.2:1);p.y+=p.vy*dt;
   if(p.y>=G){p.y=G;const hard=p.vy;p.vy=0;p.ground=true;p.j=0;this.pv.rot=0;AU.sfx('land');this.emDust.explode(hard>900?9:5,PX,G);
    this.tweens.add({targets:this.pv,sx:1.22,sy:.76,duration:70,yoyo:true,ease:'Quad.easeOut'});
    if(this.jbuf>0){this.jbuf=0;this.jump(1)}}}
  const was=p.slide;p.slide=p.ground&&want;
  if(p.slide&&!was){AU.sfx('whoosh');this.emDust.explode(4,PX+10,G);if(this.tutOn&&this.tutOn.k==='tutS')this.endTut()}
 }
 heroDraw(dt){const p=this.p,h=this.hero,gs=p.giant>0?1.55:1;
  let bob=0,rot=this.pv.rot,sx=this.pv.sx,sy=this.pv.sy;
  if(this.mode==='over'||this.dead){rot=this.deadRot||0}
  else if(p.slide){sy*=.58;sx*=1.18;rot+=.12+Math.sin(this.t*30)*.02;if(Math.random()<.4)this.emDust.emitParticleAt(PX-20,G-2,1)}
  else if(p.ground){bob=Math.abs(Math.sin(this.t*15))*4;rot+=Math.sin(this.t*15)*.06;if(Math.random()<.18)this.emDust.emitParticleAt(PX-18,G-2,1)}
  else if(this.pv.rot===0)rot+=clamp(p.vy/2600,-.25,.3);
  h.x=PX;h.y=p.y-bob;h.setScale(this.hsc*sx*gs,this.hsc*sy*gs);h.setRotation(rot);
  h.setAlpha(p.inv>0&&p.giant<=0&&p.rocket<=0?(Math.floor(this.t*16)%2?.35:1):1);
  if(p.rocket>0)this.emTrail.setPosition(PX-30,p.y-30);
  const hh=G-p.y;this.shadow.setScale(clamp(1-hh/260,.35,1)*(gs>1?1.5:1),1).setAlpha(.22*clamp(1-hh/300,.3,1));
  // 펫: 살짝 늦게 따라와요
  if(this.pet){const ty=p.y-(p.ground?0:10);this.petS.y+=(ty-this.petS.y)*Math.min(1,dt*6);this.petS.y-=0;const k=42/this.petS.frame.height;this.petS.setScale(k,k*(1+Math.sin(this.t*12)*.05));this.petS.x=PX-78+Math.sin(this.t*2)*4;this.petS.setRotation(Math.sin(this.t*12)*.05)}
  // 방패 거품
  this.bubble.setPosition(PX,p.y-40*gs);this.bubble.setAlpha(p.guard?.22+Math.sin(this.t*6)*.06:0).setScale(4.6*gs)}
 /* ---- 덩어리(장애물 묶음) 만들기 ---- */
 spawnChunk(x0){
  const d=this.mode0==='inf'?Math.min(10,1+this.dist/900):this.stage,set=OBS[this.th],sp=this.spd;
  let type;
  if(this.tut.length)type=this.tut.shift();
  else if(this.chunkN<2)type='breath';
  else{const w=[['single',3],['double',d>=2?2:0],['tall',d>=2?2:.6],['high',1.8],['fall',d>=3?1.4:0],['boar',set.boar&&d>=3?1.2:0],['bounce',.7],['mix',d>=5?1.6:0],['breath',.6]];
   let tot=w.reduce((a,b)=>a+b[1],0),r=Math.random()*tot;type='single';for(const [k,v] of w){if((r-=v)<0){type=k;break}}
   if(type===this.lastType&&type!=='single'&&Math.random()<.6)type='single'}
  this.lastType=type;this.chunkN++;
  const half=sp*.315,gap=Math.max(150,330-d*16);let len=0;
  const small=()=>pick(set.small);
  switch(type){
   case'breath':{const n=10;for(let i=0;i<n;i++)this.addCoin(x0+40+i*38,G-38-Math.sin(i/(n-1)*Math.PI)*30);len=40+n*38+60;break}
   case'single':case'tutJ':{const ox=x0+260;this.coinLine(x0+40,ox-half-30,G-38);const o=this.addOb(small(),ox);if(type==='tutJ')o.tut='tutJ';this.coinArc(ox-half,1);len=260+half+gap;break}
   case'double':{const o1=x0+240;this.coinLine(x0+40,o1-half-30,G-38);if(Math.random()<.5){const o2=o1+sp*.63+110;this.addOb(small(),o1);this.addOb(small(),o2);this.coinArc(o1-half,1);this.coinArc(o2-half,1);len=o2-x0+half+gap}
    else{const o2=o1+64;this.addOb(small(),o1);this.addOb(small(),o2);this.coinArc(o1-sp*.24,2);len=o2-x0+sp*.5+gap}break}
   case'tall':case'tutT':{const ox=x0+280;this.coinLine(x0+40,ox-sp*.36-30,G-38);const o=this.addOb(set.tall,ox,{tall:1});if(type==='tutT')o.tut='tutT';this.coinArc(ox-sp*.36,2);len=280+sp*.5+gap;break}
   case'high':case'tutS':{const ox=x0+260,n=d>=4&&type==='high'?2:1;this.coinLine(x0+40,ox-40,G-38);for(let i=0;i<n;i++){const o=this.addOb('bird',ox+i*120,{y:G-50});if(type==='tutS')o.tut='tutS'}this.coinLine(ox-20,ox+(n-1)*120+80,G-16);len=260+n*120+gap;break}
   case'fall':{const ox=x0+300;this.coinLine(x0+40,ox-half-30,G-38);this.addOb(set.fall,ox,{fall:1});this.coinArc(ox-half,1);len=300+half+gap;break}
   case'boar':{const ox=x0+520;this.coinLine(x0+40,x0+300,G-38);this.addOb('boar',ox,{vx:150});len=520+gap+40;break}
   case'bounce':{const ox=x0+250;this.coinLine(x0+40,ox-60,G-38);this.addOb('mush',ox,{bounce:1});this.coinArc(ox-20,1,1150);len=250+sp*.85+gap;break}
   case'mix':{const o1=x0+230;this.coinLine(x0+40,o1-half-30,G-38);this.addOb(small(),o1);this.coinArc(o1-half,1);const o2=o1+half+sp*.32+170;this.addOb('bird',o2,{y:G-50});this.coinLine(o2-60,o2+80,G-16);len=o2-x0+90+gap;break}
  }
  // 아이템: 덩어리 끝쪽
  const ex=x0+len-gap*.5;
  if(this.letT<=0&&this.letters<5&&this.mode0!=='tut'&&!this.tut.length){this.addItem('let',ex,G-118);this.letT=rnd(6,9)}
  else if(this.appleT<=0){this.addItem('apple',ex,G-44);this.appleT=rnd(9,13)}
  else if(this.powT<=0&&this.chunkN>3){this.addItem(pick(['magnet','rocket','giant','bolt','fairy','magnet','giant']),ex,G-96);this.powT=rnd(16,24)}
  return len;
 }
 addOb(k,x,o){o=o||{};const h=(o.tall?(k==='wave'?132:135):OH[k]);const s=this.add.image(x,o.y||G,k).setOrigin(.5,1).setDepth(11);s.setScale(h/s.frame.height);
  if(k==='boar'||k==='bird')s.setFlipX(false);
  const ob={k,s,x,y:o.y||G,h,w:s.displayWidth,vx:o.vx||0,tall:o.tall,bounce:o.bounce,ph:Math.random()*6};
  if(k==='water'){ob.hw=s.displayWidth*.36;ob.top=h*.6}else{ob.hw=Math.min(s.displayWidth*.32,o.tall?30:24);ob.top=h*(k==='bird'?.8:.84)}
  if(k==='fire')this.tweens.add({targets:s,scaleY:s.scaleY*1.1,duration:220,yoyo:true,repeat:-1});
  if(o.fall){ob.fall=1;ob.y=-60;s.y=-60;ob.vy=0;ob.shadow=this.add.image(x,G+3,'shadow').setDepth(10).setAlpha(0).setScale(.5)}
  if(o.vx){ob.warn=this.txt(W-26,G-40,'❗',30).setDepth(41).setAlpha(0)}
  this.obs.push(ob);return ob}
 addCoin(x,y){const s=this.add.image(x,y,'it_coin').setDepth(10);s.setScale(24/s.frame.height);const c={k:'coin',s,x,y,base:s.scaleX,ph:x*.02};this.items.push(c);return c}
 coinLine(a,b,y){for(let x=a;x<=b;x+=38)this.addCoin(x,y)}
 coinArc(x0,jumps,v1){const sp=this.spd,dt=1/60;let x=x0,y=0,vy=-(v1||850),j=1,acc=0,t=0;const gv=2700;
  for(let i=0;i<240;i++){t+=dt;vy+=gv*dt;y+=vy*dt;x+=sp*dt;acc+=sp*dt;if(jumps>=2&&j<2&&vy>=-60){vy=-770;j=2}if(y>=0)break;if(acc>=36){acc=0;this.addCoin(x,G-38+y)}}}
 addItem(k,x,y){let s,it;
  if(k==='let'){const L='BONUS'[this.letters],col=[0xff5a7a,0xffa23a,0x3cc46a,0x4aa8ff,0xa07aff][this.letters];
   const g=this.add.image(0,0,'glow').setTint(col).setScale(.72),t=this.txt(0,0,L,26,'#fff');s=this.add.container(x,y,[g,t]).setDepth(10);it={k,s,x,y,L}}
  else if(k==='star'){s=this.add.image(x,y,'it_star').setDepth(10);s.setScale(46/s.frame.height);it={k,s,x,y};this.tweens.add({targets:s,angle:360,duration:2000,repeat:-1})}
  else{const key=k==='giant'?'it_mushroom':'it_'+k;const gl=this.add.image(0,0,'glow').setTint(k==='apple'?0xffc2c2:0xfff3a0).setAlpha(.55).setScale(.8);const im=this.add.image(0,0,key);im.setScale((k==='apple'?40:42)/im.frame.height);s=this.add.container(x,y,[gl,im]).setDepth(10);it={k,s,x,y};this.tweens.add({targets:gl,scale:1,alpha:.25,duration:600,yoyo:true,repeat:-1})}
  it.ph=Math.random()*6;this.items.push(it);return it}
 /* ---- 장애물·아이템 움직임 ---- */
 pbox(){const p=this.p,gs=p.giant>0?1.55:1;return p.slide?[PX-28*gs,p.y-32*gs,PX+28*gs,p.y]:[PX-21*gs,p.y-62*gs,PX+21*gs,p.y-2]}
 updObs(sp,dt,noHit){const pb=this.pbox(),p=this.p;
  for(const o of this.obs){
   o.x-=(sp+o.vx)*dt;o.s.x=o.x;
   if(o.fall){if(o.x<W-40&&o.fall===1){o.fall=2;o.vy=60}if(o.fall===2){o.vy+=1800*dt;o.y+=o.vy*dt;if(o.y>=G){o.y=G;o.fall=0;o.shadow.destroy();o.shadow=null;this.emDust.explode(8,o.x,G);this.cameras.main.shake(90,.004);AU.sfx('land');o.s.angle=0;this.tweens.add({targets:o.s,scaleY:o.s.scaleY*.8,duration:80,yoyo:true})}o.s.y=o.y;o.s.angle+=dt*200}
    if(o.shadow){o.shadow.x=o.x;o.shadow.setAlpha(o.fall===2?clamp(o.y/G,0,1)*.3:.12).setScale(.3+clamp(o.y/G,0,1)*.5,1)}}
   if(o.k==='bird'){o.s.y=o.y+Math.sin(this.t*8+o.ph)*5;o.s.scaleY=Math.abs(o.s.scaleX)*(1+Math.sin(this.t*20+o.ph)*.12)}
   if(o.k==='boar'){o.s.y=o.y-Math.abs(Math.sin(this.t*18))*5;if(o.warn){o.warn.setAlpha(o.x>W+20?(Math.floor(this.t*8)%2?1:.3):0);if(o.x<W)o.warn.destroy(),o.warn=null;else if(!o.warned&&o.x<W+260){o.warned=1;AU.sfx('warn')}}if(Math.random()<.3)this.emDust.emitParticleAt(o.x+20,G-2,1)}
   if(o.proj){o.s.rotation-=dt*(o.spin||0)}
   if(o.charge)continue;
   if(o.dead||noHit||o.done)continue;
   const ob=[o.x-o.hw,(o.fall?o.y:o.y)-o.top,o.x+o.hw,o.y-(o.k==='bird'?2:4)];
   if(pb[0]<ob[2]&&pb[2]>ob[0]&&pb[1]<ob[3]&&pb[3]>ob[1]){
    if(o.bounce){if(!o.used){o.used=1;p.vy=-1150;p.ground=false;p.j=1;p.y=Math.min(p.y,G-1);AU.sfx('bounce');this.tweens.add({targets:o.s,scaleY:o.s.scaleY*.55,duration:90,yoyo:true});this.emSpark.explode(8,o.x,G-40)}continue}
    if(p.giant>0||p.rocket>0)this.smash(o);
    else if(p.inv<=0)this.hurt(o);
   }
   if(!o.passed&&o.x+o.hw<PX-22){o.passed=1;if(!o.bounce&&!o.dead)this.nearMiss(o)}
  }
  if(this.obs.some(o=>o.x<-120)){this.obs=this.obs.filter(o=>{if(o.x<-120){o.s.destroy();o.shadow&&o.shadow.destroy();o.warn&&o.warn.destroy();return false}return true})}
 }
 nearMiss(o){if(o.hitMe)return;}
 updItems(sp,dt){const p=this.p,pb=this.pbox(),cx=PX,cy=(pb[1]+pb[3])/2,mr=p.magnet>0?240:(this.c.cr||0);
  for(const it of this.items){
   if(it.fly)continue;
   it.x-=sp*dt;
   if(it.k==='coin'){if(mr&&Math.abs(it.x-cx)<mr&&Math.abs(it.y-cy)<mr*.9)it.pull=1;if(it.pull){it.x+=(cx-it.x)*Math.min(1,dt*10);it.y+=(cy-it.y)*Math.min(1,dt*10)}it.s.scaleX=it.base*Math.max(.25,Math.abs(Math.cos(this.t*5+it.ph)));it.s.y=it.y}
   else{it.s.y=it.y+Math.sin(this.t*4+it.ph)*5}
   it.s.x=it.x;
   const rx=it.k==='coin'?14:22;
   if(pb[0]-rx<it.x&&pb[2]+rx>it.x&&pb[1]-rx<it.y&&pb[3]+rx>it.y)this.collect(it);
  }
  if(this.items.some(i=>i.x<-60||i.got)){this.items=this.items.filter(i=>{if(i.x<-60&&!i.fly){i.s.destroy();return false}return !i.got})}
 }
 collect(it){const p=this.p;it.got=1;
  if(it.k==='coin'){const v=(this.c.cb||1);this.coins+=v;this.combo++;this.comboT=1.6;AU.sfx('coin',this.combo);
   if(this.combo>=10){this.comboTx.setText(this.combo+' 콤보!').setAlpha(1).setScale(1.25);this.tweens.add({targets:this.comboTx,scale:1,duration:150})}
   if(this.combo%25===0){this.coins+=5;this.ft('+5 콤보 보너스!',PX+60,p.y-110,'#ffd25a');this.emSpark.explode(12,PX,p.y-40);AU.sfx('pow')}
   // 코인이 HUD로 날아가요
   it.fly=1;it.got=0;const s=it.s;this.tweens.add({targets:s,x:W-118,y:24,scale:s.scaleY*.8,duration:380,ease:'Quad.easeIn',onComplete:()=>{s.destroy();it.got=1;this.coinTx.setText(this.coins);this.coinIc.setScale(30/this.coinIc.frame.height*1.35);this.tweens.add({targets:this.coinIc,scale:30/this.coinIc.frame.height,duration:160})}});
   return}
  it.s.destroy();
  if(it.k==='apple'){const v=25+(this.c.ap||0);this.hp=Math.min(100,this.hp+v);this.ft('체력 +'+v,PX,p.y-100,'#ff7a9a');AU.sfx('apple');this.emSpark.explode(8,PX,p.y-40);this.tweens.add({targets:this.hpIc,scale:1.5,duration:120,yoyo:true})}
  else if(it.k==='let'){this.letters++;const t=this.lets[this.letters-1];t.setAlpha(1).setColor(['#ff5a7a','#ffa23a','#3cc46a','#4aa8ff','#a07aff'][this.letters-1]).setScale(1.8);this.tweens.add({targets:t,scale:1,duration:300,ease:'Back.easeOut'});AU.sfx('letter');this.emSpark.explode(10,it.x,it.y);
   if(this.letters>=5)this.time.delayedCall(350,()=>this.startBonus())}
  else if(it.k==='star'){this.starToBoss(it)}
  else{const k=it.k,pb=this.c.pb||1;AU.sfx('pow');this.ft(PW[k].n,PX+20,p.y-110,'#ffe066');this.emSpark.explode(12,PX,p.y-40);
   if(k==='magnet')p.magnet=PW.magnet.t*pb;
   if(k==='rocket'){p.rocket=PW.rocket.t*pb;this.emTrail.start();this.emSpeed.start();this.cameras.main.zoomTo(R*1.04,200).once('camerazoomcomplete',()=>this.cameras.main.zoomTo(R,400))}
   if(k==='giant'){p.giant=PW.giant.t*pb;this.cameras.main.shake(150,.006)}
   if(k==='bolt'){this.cameras.main.flash(250,255,250,200);for(const o of this.obs)if(!o.proj&&!o.charge&&o.x<W+20&&!o.dead){o.dead=1;this.addCoin(o.x,G-40);this.emSpark.explode(6,o.x,G-30);o.s.destroy();o.x=-999}}
   if(k==='fairy'){p.guard=1;AU.sfx('shield')}}
 }
 ft(s,x,y,c,size){const t=this.txt(x,y,s,size||22,c||'#fff').setDepth(45);this.tweens.add({targets:t,y:y-48,alpha:0,duration:850,ease:'Cubic.easeOut',onComplete:()=>t.destroy()})}
 smash(o){o.dead=1;AU.sfx('smash');this.emHit.explode(8,o.x,o.y-o.h/2);this.coins+=1;this.coinTx.setText(this.coins);this.cameras.main.shake(80,.005);
  this.tweens.add({targets:o.s,x:o.x+220,y:o.y-180,angle:540,alpha:0,duration:600,ease:'Quad.easeOut'});o.vx=-this.spd}
 hurt(o){const p=this.p;
  if(p.guard){p.guard=0;p.inv=1;AU.sfx('shield');this.ft('요정이 막아 줬어요!',PX,p.y-100,'#ffc2e6');this.emSpark.explode(14,PX,p.y-40);this.smash(o);return}
  o.hitMe=1;const dmg=(this.mode==='boss'?16:20)*(this.c.dm||1)*(this.stage>=7?1.1:1);this.hp-=dmg;p.inv=1.3;
  if(this.combo>=10)this.ft('콤보 끊김',PX+40,p.y-120,'#ff8a9a');this.combo=0;this.comboT=0;this.comboTx.setAlpha(0);
  this.freeze=.075;this.cameras.main.shake(220,.012);this.cameras.main.flash(120,255,120,120);AU.sfx('hit');this.emHit.explode(10,PX+20,p.y-40);
  this.ft('-'+Math.round(dmg),PX,p.y-90,'#ff6b6b',26);
  this.tweens.add({targets:this.pv,rot:-.5,duration:90,yoyo:true});
  if(navigator.vibrate)try{navigator.vibrate(40)}catch(e){}
 }
 /* ---- 보너스 타임 ---- */
 startBonus(){this.bonusT=7.5;this.letters=0;this.p.vy=0;this.p.ground=false;this.bonusY=this.p.y;this.bonusRow=0;
  for(const o of this.obs){if(!o.proj){this.emSpark.explode(4,o.x,G-30);o.s.destroy();o.shadow&&o.shadow.destroy();o.warn&&o.warn.destroy()}}this.obs=this.obs.filter(o=>o.proj&&o.s.active);
  this.banner('🌈 보너스 타임!','화면을 꾹 누르면 날아올라요');AU.sfx('win');this.cameras.main.flash(300,255,230,250);
  this.rain=this.add.rectangle(0,0,W,H,0xffc8ec).setOrigin(0).setDepth(.6).setAlpha(0);this.tweens.add({targets:this.rain,alpha:.32,duration:400,onComplete:()=>this.rain&&this.rain.active&&this.tweens.add({targets:this.rain,alpha:.15,duration:700,yoyo:true,repeat:-1})})}
 bonus(dt){const p=this.p,hold=this.holdR>0||this.slideIds.size>0||this.keys.j;this.bonusT-=dt;
  p.vy+=(hold?-1500:1100)*dt;p.vy=clamp(p.vy,-420,420);p.y=clamp(p.y+p.vy*dt,90,G);if(p.y>=G&&p.vy>0){p.vy=0}p.ground=false;this.pv.rot=clamp(p.vy/1200,-.3,.3);
  if(Math.random()<.5)this.emSpark.emitParticleAt(PX-24,p.y-30,1);this.bonusRow-=dt;if(this.bonusRow<=0&&this.bonusT>1){this.bonusRow=.1;const y=200+Math.sin(this.t*2.2)*95;this.addCoin(W+20,y);if(Math.random()<.25)this.addCoin(W+20,y+40)}
  if(this.bonusT<=0){this.bonusT=0;this.lets.forEach(t=>t.setAlpha(.35).setColor('#ffffff'));const rn=this.rain;this.tweens.killTweensOf(rn);this.tweens.add({targets:rn,alpha:0,duration:500,onComplete:()=>rn.destroy()});p.j=1;this.nextX=W+240;this.p.inv=Math.max(this.p.inv,1)}}
 /* ---- 보스 ---- */
 bossEnter(){if(this.mode0==='inf')return;this.mode='bossIn';const i=this.stage,b=BOSS[i-1];
  const s=this.add.image(W+200,G+8,'boss'+i).setOrigin(.5,1).setDepth(11).setFlipX(!![1,1,0,0,0,0,0,0,1,0][i-1]);s.setScale(175/s.frame.height);
  this.boss={s,i,hp:3+Math.floor((i-1)/3),max:3+Math.floor((i-1)/3),cd:1.6,n:0,last:'',x:W-150,base:175/s.frame.height,state:'idle',star:0};
  this.progG.clear();this.progHero.setVisible(false);this.progBoss.setVisible(false);this.distTx.setText('');
  BGM.play('boss',[0,2,-3,0,5,3,-2,-5,2,-4][i-1]);
  this.tweens.add({targets:s,x:W-150,duration:1300,ease:'Back.easeOut',onComplete:()=>{AU.sfx('roar');this.cameras.main.shake(500,.012);this.tweens.add({targets:s,scaleX:this.boss.base*1.15,scaleY:this.boss.base*1.15,duration:160,yoyo:true,repeat:1});this.banner('⚠️ '+b.n+' 등장!','⭐을 먹으면 보스에게 날아가요!');this.mode='boss'}})}
 bossDraw(dt){const b=this.boss;if(!b||b.dead)return;if(b.state!=='charge'&&b.state!=='back'){b.s.y=G+8+Math.sin(this.t*3)*4;const br=1+Math.sin(this.t*3)*.02;if(b.state==='idle'&&!b.tw)b.s.setScale(b.base*(2-br),b.base*br)}
  // 체력
  const g=this.bossG;g.clear();const w=220,x0=W/2-w/2;g.fillStyle(0x000000,.35);g.fillRoundedRect(x0-4,32,w+8,16,8);g.fillStyle(0xff5a7a);g.fillRoundedRect(x0,35,w*b.hp/b.max,10,5);
  this.bossTx.setText(BOSS[b.i-1].n+'  '+'❤️'.repeat(b.hp))}
 bossUpd(dt){const b=this.boss;if(!b||b.dead)return;b.cd-=dt;
  if(b.state==='idle'&&b.cd<=0){const L=BOSS[b.i-1].at;let k=pick(L);if(k===b.last&&L.length>1)k=pick(L);b.last=k;b.state='wind';
   AU.sfx('warn');const ex=this.txt(b.s.x-20,G-190,'❗',34).setDepth(42);this.tweens.add({targets:ex,y:'-=14',alpha:0,duration:650,delay:250,onComplete:()=>ex.destroy()});
   b.tw=1;this.tweens.add({targets:b.s,scaleX:b.base*1.12,scaleY:b.base*.9,duration:260,yoyo:true,onComplete:()=>{b.tw=0}});b.s.setTint(0xffb0b0);
   this.time.delayedCall(Math.max(330,620-b.i*25),()=>{if(!this.boss||b.dead)return;b.s.clearTint();this.attack(k);b.n++;if(b.state==='wind')b.state='idle';b.cd=Math.max(1.1,rnd(1.55,2.15)-b.i*.05);
    if(b.n%3===0)this.time.delayedCall(1500,()=>{if(this.boss&&!b.dead)this.addItem('apple',W+30,G-44)});
    if(b.n%2===0||(b.hp===1&&b.n%2===1)){this.time.delayedCall(700,()=>{if(this.boss&&!b.dead)this.addItem('star',W+30,Math.random()<.5?G-40:G-125)})}})}}
 attack(k){const b=this.boss,bs=BOSS[b.i-1],pj=bs.pj,x=b.s.x-70;
  const proj=(key,y,h,vx,o)=>{const s=this.add.image(x,y,key).setOrigin(.5,1).setDepth(15);s.setScale(h/s.frame.height);if(bs.tint)s.setTint(bs.tint);const ob={k:key,s,x,y,h,w:s.displayWidth,vx,proj:1,spin:o&&o.spin,hw:o&&o.hw||h*.34,top:h*.82};if(o&&o.flip)s.setFlipX(true);this.obs.push(ob);this.emSpark.explode(6,x,y-h/2);return ob};
  switch(k){
   case'ball':proj(pj==='meteor'?'fire':pj,G,50,200+b.i*10,{spin:pj==='rock'?8:0});break;
   case'high':{const o=proj(pj==='water'?'water':'meteor',G-52,40,240+b.i*10,{hw:20});o.top=34;break}
   case'tall':{const o=proj(pj==='water'?'wave':'fire',G,135,180+b.i*8,{hw:28});o.tall=1;break}
   case'combo':proj(pj==='meteor'?'fire':pj,G,50,210);this.time.delayedCall(560,()=>{if(this.boss&&!this.boss.dead){const o=proj(pj==='water'?'water':'meteor',G-52,40,250,{hw:20});o.top=34}});break;
   case'drop':{const key=pj==='water'?'water':pj==='rock'?'rock':'meteor';[0,1,2].slice(0,b.i>=8?3:2).forEach(j=>{const o=this.addOb(key,W-20+j*190,{fall:1});o.fall=2;o.vy=80;o.y=-60-j*60;o.s.y=o.y});AU.sfx('warn');break}
   case'charge':{b.state='charge';const s=b.s;AU.sfx('roar');this.emDust.explode(10,s.x,G);
    const ob={k:'boss',s,x:s.x,y:G,h:120,hw:46,top:110,vx:0,charge:1};
    this.tweens.add({targets:s,x:s.x+30,duration:280,yoyo:false,onComplete:()=>{
     this.tweens.add({targets:s,x:-180,duration:900,ease:'Quad.easeIn',onUpdate:()=>{this.chargeHit(s)},onComplete:()=>{s.x=W+220;this.tweens.add({targets:s,x:W-150,duration:700,ease:'Back.easeOut',onComplete:()=>{if(b.state==='charge')b.state='idle'}})}})}});break}
  }}
 chargeHit(s){const p=this.p;if(p.inv>0||this.mode!=='boss')return;const pb=this.pbox(),ob=[s.x-50,G-105,s.x+40,G];if(pb[0]<ob[2]&&pb[2]>ob[0]&&pb[1]<ob[3]&&pb[3]>ob[1]){if(p.giant>0||p.rocket>0){p.inv=.6;return}this.hurt({s:{destroy(){}},x:s.x,y:G,h:100,set:0})}}
 starToBoss(it){const b=this.boss;AU.sfx('letter');if(!b||b.dead)return;const s=this.add.image(PX,this.p.y-40,'it_star').setDepth(46);s.setScale(46/s.frame.height);
  this.tweens.add({targets:s,x:b.s.x,y:b.s.y-90,angle:720,duration:520,ease:'Quad.easeIn',onComplete:()=>{s.destroy();this.bossHit()}});
  this.tweens.addCounter({from:0,to:1,duration:520,onUpdate:tw=>{s.y=Phaser.Math.Linear(this.p.y-40,b.s.y-90,tw.getValue())-Math.sin(tw.getValue()*Math.PI)*120}})}
 bossHit(){const b=this.boss;if(!b||b.dead)return;b.hp--;AU.sfx('bhit');this.freeze=.09;this.cameras.main.shake(260,.014);this.emHit.explode(16,b.s.x,b.s.y-90);
  b.s.setTintFill(0xffffff);this.time.delayedCall(110,()=>b.s.active&&b.s.clearTint());this.ft('-1',b.s.x,b.s.y-180,'#ff5a7a',34);
  if(b.state!=='charge')this.tweens.add({targets:b.s,x:b.s.x+40,duration:110,yoyo:true,ease:'Quad.easeOut'});
  if(b.hp<=0)this.bossDown()}
 bossDown(){const b=this.boss;b.dead=1;this.mode='clear';this.slowK=1;AU.sfx('boom');BGM.stop();
  for(const o of this.obs){this.emSpark.explode(3,o.x,o.y-20);o.s.destroy();o.shadow&&o.shadow.destroy()}this.obs=[];
  this.cameras.main.shake(700,.02);this.cameras.main.flash(300,255,255,255);this.emBig.explode(40,b.s.x,b.s.y-90);
  this.tweens.add({targets:b.s,angle:-30,y:b.s.y-40,duration:300,yoyo:true,onComplete:()=>{this.tweens.add({targets:b.s,alpha:0,scale:b.base*.3,angle:-200,duration:700,onComplete:()=>{b.s.destroy();this.boss=null}})}});
  const bn=40+this.stage*15;this.bossBonus=bn;
  for(let i=0;i<24;i++){this.time.delayedCall(i*45,()=>{const c=this.add.image(W-150,G-90,'it_coin').setDepth(46);c.setScale(26/c.frame.height);const tx=rnd(PX+40,W-60),ty=rnd(120,G-60);
   this.tweens.add({targets:c,x:tx,y:ty,duration:420,ease:'Quad.easeOut',onComplete:()=>this.tweens.add({targets:c,x:W-118,y:24,duration:360,delay:rnd(0,200),ease:'Quad.easeIn',onComplete:()=>{c.destroy();AU.sfx('coin',i);this.coinTx.setText(this.coins+Math.round(bn*(i+1)/24))}})})})}
  this.time.delayedCall(600,()=>AU.sfx('win'));
  this.time.delayedCall(2600,()=>this.finish(true))}
 die(){if(this.mode==='over')return;this.mode='over';this.dead=true;this.hp=0;this.slowK=1;AU.sfx('lose');BGM.stop();this.emTrail.stop();this.emSpeed.stop();
  this.tweens.add({targets:this,slowK:0,duration:1100,ease:'Quad.easeOut'});this.deadRot=0;this.tweens.add({targets:this,deadRot:-1.4,duration:500,ease:'Back.easeOut'});
  this.p.vy=-500;this.p.ground=false;const y0=this.p.y;this.tweens.addCounter({from:0,to:1,duration:700,onUpdate:tw=>{const v=tw.getValue();this.p.y=Math.min(G,y0-Math.sin(v*Math.PI)*70+(G-y0)*v)}});
  this.time.delayedCall(1500,()=>this.finish(false))}
 finish(clear){const mode=this.mode0,st=this.stage;let stars=0,unlock='';
  if(clear){stars=this.hp>=60?3:this.hp>=30?2:1;S.stars[st]=Math.max(S.stars[st]||0,stars);if(st>S.cleared){S.cleared=st;if(st===3)unlock='♾️ 무한 달리기가 열렸어요!';else if(st<10)unlock=(st+1)+'단계 '+STG[st].n+'이(가) 열렸어요!'}this.coins+=this.bossBonus;if(!S.tut&&st===1)S.tut=1}
  const best=mode==='inf'&&Math.floor(this.dist)>S.best;
  S.coins+=this.coins;if(mode==='inf')S.best=Math.max(S.best,Math.floor(this.dist));if(this.tutDone)S.tut=1;store();
  const o={bossLeft:!clear&&this.boss?this.boss.hp:0,clear,stage:st,stars,coins:this.coins,bonus:clear?this.bossBonus:0,dist:Math.floor(this.dist),best,mode,prog:Math.min(1,this.dist/this.L),unlock};
  this.coins=0;this.mode='result';this.hud.setVisible(false);$('pbtn').style.display='none';showResult(o);BGM.play('menu')}
 /* ---- 처음 배우기 ---- */
 tutCheck(){if(this.tutOn){const o=this.tutOn.o;if(o.hitMe||o.dead||o.x+o.hw<PX-24||this.p.inv>0)this.endTut();return}for(const o of this.obs){if(o.tut&&!o.tutDone){const lead=o.tut==='tutT'?this.spd*.36+40:o.tut==='tutS'?120:this.spd*.315+30;if(o.x-PX<lead+12){o.tutDone=1;this.tutOn={k:o.tut,o};this.ts=.12;
   this.hint.setText({tutJ:'👉 오른쪽 화면을 톡! 점프',tutT:'👉 톡! 한 번 더 톡! 2단 점프',tutS:'👈 왼쪽 화면을 꾹! 슬라이드'}[o.tut]).setAlpha(1).setScale(.6);this.tweens.add({targets:this.hint,scale:1,duration:300,ease:'Back.easeOut'});
   if(o.tut==='tutT'&&!this.p.ground&&this.p.j===1)this.endTut();if(o.tut==='tutS'&&this.p.slide)this.endTut();return}}}}
 endTut(){const k=this.tutOn&&this.tutOn.k;this.tutOn=null;this.ts=1;this.tweens.add({targets:this.hint,alpha:0,duration:250});if(k==='tutS'){this.tutDone=1;S.tut=1;store();this.ft('잘했어요! 이제 달려요 🎉',W/2,150,'#ffe066',30)}}
 /* ---- HUD ---- */
 drawHud(){const g=this.hpG,hp=clamp(this.hp,0,100);g.clear();g.fillStyle(0x000000,.3);g.fillRoundedRect(34,12,206,22,11);
  const col=hp>50?0xff6fa0:hp>25?0xffa040:0xff4040;g.fillStyle(0xffffff,.9);g.fillRoundedRect(37,15,200,16,8);g.fillStyle(col);if(hp>1)g.fillRoundedRect(37,15,Math.max(16,200*hp/100),16,8);g.fillStyle(0xffffff,.35);if(hp>1)g.fillRoundedRect(41,17,Math.max(8,192*hp/100),5,3);
  if(hp<25)this.hpIc.setScale(1+Math.abs(Math.sin(this.t*8))*.25);
  if(this.mode==='run'&&this.mode0!=='inf'){const pr=clamp(this.dist/this.L,0,1),a=300,b=510;const pg=this.progG;pg.clear();pg.lineStyle(6,0x000000,.25);pg.lineBetween(a,24,b,24);pg.lineStyle(4,0xffffff,.9);pg.lineBetween(a,24,a+(b-a)*pr,24);this.progHero.x=a+(b-a)*pr;this.progBoss.x=b+18}
  else if(this.mode0==='inf')this.distTx.setText(Math.floor(this.dist)+'m')}
}

new Phaser.Game({type:Phaser.AUTO,parent:'game',width:W*R,height:H*R,backgroundColor:'#2b2340',
 scale:{mode:Phaser.Scale.FIT,autoCenter:Phaser.Scale.CENTER_BOTH},render:{antialias:true,roundPixels:false},
 input:{activePointers:3},audio:{noAudio:true},scene:[Boot,Main]});
})();
