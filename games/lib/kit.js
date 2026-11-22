/* 허브 엔진 게임 공용 키트 (games/lib/kit.js)
   - 소리: 효과음·배경음악을 파일 없이 직접 합성 (KIT.AU, KIT.BGM)
   - 화면: 세로형 게임 크기 계산(KIT.size), DOM 메뉴를 캔버스에 맞추기(KIT.fitUI), 안내 문구(KIT.toast)
   - 저장: KIT.save(key, 기본값) → {data, put()}
   쓰는 게임: block-puzzle, animal-merge, animal-survivor */
window.KIT=(()=>{'use strict';
const R=(window.devicePixelRatio||1)>=1.5?2:1;
const rnd=(a,b)=>a+Math.random()*(b-a),pick=a=>a[Math.floor(Math.random()*a.length)],clamp=(v,a,b)=>Math.max(a,Math.min(b,v)),pad2=n=>String(n).padStart(2,'0');
const $=id=>document.getElementById(id);
const IMG='../animal-run/img/';
const FONT='Jua, "Apple SD Gothic Neo", sans-serif';
function save(key,def){let d={};try{d=JSON.parse(localStorage.getItem(key))||{}}catch(e){}d=Object.assign(def(),d);
 return {data:d,put(){try{localStorage.setItem(key,JSON.stringify(this.data))}catch(e){}},reset(){this.data=def();this.put()}}}
/* 세로 게임: 가로 420 기준, 세로는 화면 비율에 맞춤 */
function size(w,minH,maxH){w=w||420;const h=Math.round(w*innerHeight/Math.max(1,innerWidth));return {W:w,H:clamp(h,minH||680,maxH||940)}}
function fitUI(W){const c=document.querySelector('#game canvas'),ui=$('ui');if(!c||!ui)return;const r=c.getBoundingClientRect(),k=r.width/W;ui.style.transform=`translate(${r.left}px,${r.top}px) scale(${k})`}
function toast(t,ms){const e=$('toast');if(!e)return;e.textContent=t;e.style.opacity=1;clearTimeout(toast.h);toast.h=setTimeout(()=>e.style.opacity=0,ms||1700)}
function fontReady(){const f=document.fonts&&document.fonts.load?document.fonts.load('24px Jua'):Promise.resolve();return Promise.race([f,new Promise(r=>setTimeout(r,2500))]).catch(()=>{})}
/* ---------- 소리 ---------- */
const AU={ctx:null,on:true,
 init(){if(this.ctx){if(this.ctx.state==='suspended')this.ctx.resume();return}try{const C=window.AudioContext||window.webkitAudioContext;this.ctx=new C();this.out=this.ctx.createGain();this.out.gain.value=.9;this.out.connect(this.ctx.destination);this.mus=this.ctx.createGain();this.mus.gain.value=.5;this.mus.connect(this.out);
  const n=this.ctx.createBuffer(1,this.ctx.sampleRate*.5,this.ctx.sampleRate),d=n.getChannelData(0);for(let i=0;i<d.length;i++)d[i]=Math.random()*2-1;this.nb=n}catch(e){}},
 tone(f,d,ty='sine',v=.15,t0=0,f2=0,dest){if(!this.ctx||(!this.on&&!dest))return;const c=this.ctx,o=c.createOscillator(),g=c.createGain(),s=c.currentTime+t0;o.type=ty;o.frequency.setValueAtTime(f,s);if(f2)o.frequency.exponentialRampToValueAtTime(f2,s+d);g.gain.setValueAtTime(0,s);g.gain.linearRampToValueAtTime(v,s+.008);g.gain.exponentialRampToValueAtTime(.0008,s+d);o.connect(g);g.connect(dest||this.out);o.start(s);o.stop(s+d+.02)},
 noise(d,v=.2,t0=0,ff=1200,dest,at){if(!this.ctx||!this.nb||(!this.on&&!dest))return;const c=this.ctx,b=c.createBufferSource(),f=c.createBiquadFilter(),g=c.createGain(),s=at||c.currentTime+t0;b.buffer=this.nb;f.type='lowpass';f.frequency.value=ff;g.gain.setValueAtTime(v,s);g.gain.exponentialRampToValueAtTime(.0008,s+d);b.connect(f);f.connect(g);g.connect(dest||this.out);b.start(s);b.stop(s+d+.02)},
 sfx(k,a){a=a||0;switch(k){
  case'click':this.tone(700,.06,'sine',.1,0,900);break;
  case'pick':this.tone(520,.08,'sine',.1,0,700);break;
  case'place':this.noise(.06,.12,0,900);this.tone(220,.09,'triangle',.12,0,160);break;
  case'bad':this.tone(200,.15,'square',.06,0,150);break;
  case'clear':{const b=1+Math.min(a,8)*.06;[0,4,7,12].forEach((s,i)=>this.tone(523*b*Math.pow(2,s/12),.22,'triangle',.11,i*.05));this.noise(.25,.08,0,5000);break}
  case'big':[523,659,784,1046,1318,1568].forEach((f,i)=>this.tone(f,.3,'triangle',.12,i*.06));this.noise(.5,.1,0,6000);break;
  case'pop':{const f=300+a*70;this.tone(f,.12,'sine',.18,0,f*2.2);this.tone(f*2,.08,'triangle',.05,.02);break}
  case'drop':this.tone(500,.12,'sine',.08,0,300);break;
  case'thud':this.noise(.05,.06,0,400);break;
  case'coin':this.tone(1046,.07,'triangle',.08);this.tone(1568,.14,'triangle',.07,.05);break;
  case'gem':{const q=1+Math.min(a,30)*.02;this.tone(1200*q,.06,'sine',.06);break}
  case'shoot':this.tone(880,.05,'square',.025,0,1400);break;
  case'hit':this.noise(.05,.07,0,2500);break;
  case'hurt':this.noise(.2,.25,0,1500);this.tone(220,.25,'sawtooth',.12,0,80);break;
  case'kill':this.tone(600,.07,'triangle',.05,0,1200);break;
  case'level':[523,659,784,1046,1318].forEach((f,i)=>this.tone(f,.25,'triangle',.12,i*.07));break;
  case'zap':this.noise(.18,.18,0,4000);this.tone(1400,.15,'sawtooth',.06,0,300);break;
  case'boom':this.noise(.7,.35,0,900);this.tone(90,.7,'sawtooth',.18,0,30);break;
  case'roar':this.tone(110,.8,'sawtooth',.2,0,70);this.tone(165,.7,'square',.08,.05,90);this.noise(.8,.2,0,700);break;
  case'win':[523,659,784,1046,784,1046,1318].forEach((f,i)=>this.tone(f,.32,'triangle',.13,i*.11));break;
  case'lose':[523,466,392,330].forEach((f,i)=>this.tone(f,.35,'triangle',.13,i*.18));break;
  case'warn':this.tone(880,.09,'square',.06);this.tone(880,.09,'square',.06,.13);break;
  case'heal':this.tone(620,.12,'sine',.14);this.tone(930,.2,'sine',.13,.09);break;
 }}};
/* 배경음악: 8분음표 32칸 순서기 */
const SONG={
 calm:{bpm:96,root:[48,45,41,43],mn:[0,1,0,0],mel:[76,0,79,0,76,0,72,0,74,0,76,0,72,0,69,0,72,0,74,0,77,0,76,0,74,0,72,0,71,0,74,0],w:'sine',mv:.06,arp:.02},
 play:{bpm:132,root:[45,41,48,43],mn:[1,0,0,0],mel:[69,0,72,76,0,72,74,0,72,0,69,72,0,77,76,0,72,0,76,79,0,76,74,0,71,0,74,79,0,77,76,74],w:'triangle',mv:.055,arp:.022},
 boss:{bpm:150,root:[45,41,43,40],mn:[1,0,0,0],mel:[69,72,76,72,69,72,76,79,77,76,72,69,72,77,76,72,74,79,74,71,74,79,83,79,76,80,83,80,76,71,68,71],w:'square',mv:.03,arp:.02},
 bright:{bpm:120,root:[48,43,45,41],mn:[0,0,1,0],mel:[72,0,76,79,0,76,72,0,74,0,79,83,0,79,74,0,76,0,72,69,0,72,76,0,77,0,76,74,0,72,71,0],w:'triangle',mv:.055,arp:.022}};
const BGM={cur:null,step:0,next:0,tm:null,on:true,
 play(k){if(this.cur===k)return;this.cur=k;this.step=0;if(!AU.ctx)return;this.next=AU.ctx.currentTime+.08;if(!this.tm)this.tm=setInterval(()=>this.tick(),60)},
 stop(){this.cur=null},
 tick(){const c=AU.ctx;if(!c||!this.cur||!this.on||c.state!=='running')return;const sg=SONG[this.cur],e=60/sg.bpm/2,f=n=>440*Math.pow(2,(n-69)/12);
  if(this.next<c.currentTime)this.next=c.currentTime+.02;
  while(this.next<c.currentTime+.2){const st=this.step%32,bar=Math.floor(st/8),r=sg.root[bar],t=this.next-c.currentTime;
   if(st%8===0||st%8===4)AU.tone(f(r),e*3.6,'triangle',.1,t,0,this.mus);
   if(st%2===1)AU.noise(.04,.02,0,7000,this.mus,this.next);
   const ch=[0,sg.mn[bar]?3:4,7,12];AU.tone(f(r+24+ch[st%4]),e*.9,'sine',sg.arp,t,0,this.mus);
   const m=sg.mel[st];if(m)AU.tone(f(m),e*1.8,sg.w,sg.mv,t,0,this.mus);
   this.next+=e;this.step++}}};
document.addEventListener('pointerdown',()=>{AU.init();if(BGM.cur&&AU.ctx&&!BGM.tm){BGM.next=AU.ctx.currentTime+.05;BGM.tm=setInterval(()=>BGM.tick(),60)}},true);
/* 공용 텍스처 */
function textures(sc){if(sc.textures.exists('dot'))return;const g=sc.make.graphics({x:0,y:0,add:false});
 g.fillStyle(0xffffff);g.fillCircle(8,8,8);g.generateTexture('dot',16,16);g.clear();
 g.fillStyle(0xffffff);g.beginPath();g.moveTo(10,0);g.lineTo(12.6,7.4);g.lineTo(20,10);g.lineTo(12.6,12.6);g.lineTo(10,20);g.lineTo(7.4,12.6);g.lineTo(0,10);g.lineTo(7.4,7.4);g.closePath();g.fillPath();g.generateTexture('spark',20,20);g.clear();
 g.fillStyle(0x000000);g.fillEllipse(40,10,80,18);g.generateTexture('shadow',80,20);g.clear();
 g.fillStyle(0xffffff,.9);g.fillCircle(32,32,30);g.fillStyle(0xffffff,1);g.fillCircle(32,32,24);g.generateTexture('glow',64,64);g.destroy()}
function text(sc,x,y,s,size,color,stroke){return sc.add.text(x,y,s,{fontFamily:FONT,fontSize:size+'px',color:color||'#fff',stroke:stroke||'#4a2d5e',strokeThickness:Math.max(3,Math.round(size/5))}).setOrigin(.5).setResolution(R)}
function floatText(sc,x,y,s,color,size,depth){const t=text(sc,x,y,s,size||22,color||'#fff').setDepth(depth||80).setScale(.6);sc.tweens.add({targets:t,scale:1,duration:140,ease:'Back.easeOut'});sc.tweens.add({targets:t,y:y-50,alpha:0,duration:900,delay:120,ease:'Cubic.easeOut',onComplete:()=>t.destroy()});return t}
return {R,rnd,pick,clamp,pad2,$,IMG,FONT,save,size,fitUI,toast,fontReady,AU,BGM,textures,text,floatText};
})();
