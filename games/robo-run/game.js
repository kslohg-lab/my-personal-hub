/* 로봇 달리기 3D — Three.js(3D 엔진)로 만든 3줄 달리기 (서브웨이 서퍼 방식)
   조작: 좌우로 밀기 = 줄 바꾸기, 위로 = 점프, 아래로 = 슬라이드 (키보드 화살표도 돼요)
   저장: localStorage 'roboRunV1' {best, coins, snd, runs} */
(()=>{'use strict';
const {rnd,pick,clamp,$,AU,BGM}=KIT;
const UW=420,LANE=2.3,LX=[-LANE,0,LANE],FAR=-95,ROAD=200;
const SV=KIT.save('roboRunV1',()=>({best:0,coins:0,snd:1,runs:0}));const S=SV.data;AU.on=BGM.on=!!S.snd;

/* ---------- 3D 기본 ---------- */
const renderer=new THREE.WebGLRenderer({antialias:true,powerPreference:'high-performance'});renderer.setPixelRatio(Math.min(2,window.devicePixelRatio||1));
renderer.outputEncoding=THREE.sRGBEncoding;$('game').appendChild(renderer.domElement);
const scene=new THREE.Scene(),cam=new THREE.PerspectiveCamera(62,1,.1,220);
function canvasTex(w,h,draw,rep){const c=document.createElement('canvas');c.width=w;c.height=h;draw(c.getContext('2d'),w,h);const t=new THREE.CanvasTexture(c);t.encoding=THREE.sRGBEncoding;if(rep){t.wrapS=t.wrapT=THREE.RepeatWrapping;t.repeat.set(rep[0],rep[1])}t.anisotropy=4;return t}
scene.background=canvasTex(4,256,(x,w,h)=>{const g=x.createLinearGradient(0,0,0,h);g.addColorStop(0,'#6fb8ff');g.addColorStop(.6,'#cfeaff');g.addColorStop(1,'#ffe6f2');x.fillStyle=g;x.fillRect(0,0,w,h)});
scene.fog=new THREE.Fog(0xdcefff,35,95);
scene.add(new THREE.HemisphereLight(0xffffff,0x9aa6c8,.95));const sun=new THREE.DirectionalLight(0xffffff,.85);sun.position.set(6,12,8);scene.add(sun);
const M=(c,o)=>new THREE.MeshStandardMaterial(Object.assign({color:c,roughness:.55,metalness:.05},o||{}));
function resize(){const w=innerWidth,h=innerHeight;renderer.setSize(w,h);cam.aspect=w/h;cam.updateProjectionMatrix();const ui=$('ui');ui.style.width=UW+'px';ui.style.height=Math.round(h*UW/w)+'px';ui.style.transform=`scale(${w/UW})`}
addEventListener('resize',resize);resize();

/* ---------- 길과 도시 ---------- */
const roadTex=canvasTex(256,256,(x,w,h)=>{x.fillStyle='#5d6684';x.fillRect(0,0,w,h);x.fillStyle='#69728f';for(let i=0;i<40;i++)x.fillRect(Math.random()*w,Math.random()*h,3,3);
 x.fillStyle='#ffffff';[w*.333,w*.667].forEach(u=>{x.fillRect(u-3,0,6,h*.45)});x.fillStyle='#ffd25a';x.fillRect(2,0,6,h);x.fillRect(w-8,0,6,h)},[1,ROAD/8]);
const road=new THREE.Mesh(new THREE.PlaneGeometry(LANE*3+.4,ROAD),M(0xffffff,{map:roadTex,roughness:.8}));road.rotation.x=-Math.PI/2;road.position.z=-ROAD/2+12;scene.add(road);
const walkTex=canvasTex(128,128,(x,w,h)=>{x.fillStyle='#ffc9de';x.fillRect(0,0,w,h);x.strokeStyle='#f0a8c6';x.lineWidth=4;x.strokeRect(0,0,w,h);x.beginPath();x.moveTo(w/2,0);x.lineTo(w/2,h);x.stroke()},[1,ROAD/3]);
[-1,1].forEach(s=>{const m=new THREE.Mesh(new THREE.BoxGeometry(2.6,.25,ROAD),M(0xffffff,{map:walkTex}));m.position.set(s*(LANE*1.5+1.5),.12,-ROAD/2+12);scene.add(m)});
const grass=new THREE.Mesh(new THREE.PlaneGeometry(120,ROAD),M(0x9fe08a));grass.rotation.x=-Math.PI/2;grass.position.set(0,-.02,-ROAD/2+12);scene.add(grass);
const winTex=[0,1,2].map(k=>canvasTex(64,128,(x,w,h)=>{x.fillStyle='#ffffff';x.fillRect(0,0,w,h);for(let r=0;r<8;r++)for(let c=0;c<3;c++){x.fillStyle=Math.random()<.35?'#fff3a8':(k===1?'#bfe6ff':'#cfd6f6');x.fillRect(6+c*20,8+r*15,12,9)}}));
const BCOL=[0xff9ec4,0x9fd8ff,0xffd36b,0xb8a2ff,0x8fe3c8,0xffb38a,0xf6f0ff];
const bldGeo=new THREE.BoxGeometry(1,1,1),blds=[];
for(let i=0;i<34;i++){const side=i%2?1:-1,mat=M(pick(BCOL),{map:winTex[i%3]});const b=new THREE.Mesh(bldGeo,mat);const roof=new THREE.Mesh(bldGeo,M(0xffffff));b.add(roof);roof.scale.set(1.04,.04,1.04);roof.position.y=.5;
 b.userData.side=side;scene.add(b);blds.push(b);placeBld(b,-i*6+8)}
function placeBld(b,z){const w=rnd(3,5.5),h=rnd(4,15),d=rnd(4,6);b.scale.set(w,h,d);b.position.set(b.userData.side*(LANE*1.5+3+w/2+rnd(0,1.2)),h/2,z);b.material.color.setHex(pick(BCOL));b.material.map.repeat.set(Math.max(1,Math.round(w/2)),Math.max(1,Math.round(h/3)))}
const lamps=[];for(let i=0;i<10;i++){const g=new THREE.Group(),p=new THREE.Mesh(new THREE.CylinderGeometry(.07,.09,3.2,8),M(0x7a82a8));p.position.y=1.6;g.add(p);const l=new THREE.Mesh(new THREE.SphereGeometry(.25,12,8),new THREE.MeshBasicMaterial({color:0xfff3b0}));l.position.set(0,3.25,0);g.add(l);
 g.position.set((i%2?1:-1)*(LANE*1.5+1.1),0,-i*10);scene.add(g);lamps.push(g)}

/* ---------- 로봇 ---------- */
function makeRobot(){const g=new THREE.Group(),white=M(0xf6f8ff,{roughness:.3,metalness:.15}),blue=M(0x4aa8ff,{roughness:.35}),org=M(0xffa63a),dark=M(0x2b3550,{roughness:.2,metalness:.3}),glow=new THREE.MeshBasicMaterial({color:0x7ff3ff});
 const body=new THREE.Mesh(new THREE.CapsuleGeometry(.42,.42,6,14),white);body.position.y=1.02;g.add(body);
 const belly=new THREE.Mesh(new THREE.BoxGeometry(.42,.3,.08),blue);belly.position.set(0,1.02,-.4);g.add(belly);
 const pack=new THREE.Mesh(new THREE.BoxGeometry(.5,.55,.25),blue);pack.position.set(0,1.1,.42);g.add(pack);
 const head=new THREE.Group();head.position.y=1.82;g.add(head);
 head.add(new THREE.Mesh(new THREE.SphereGeometry(.48,20,16),white));const vis=new THREE.Mesh(new THREE.SphereGeometry(.4,20,14),dark);vis.scale.set(1,.72,.6);vis.position.set(0,0,-.24);head.add(vis);
 [-.14,.14].forEach(x=>{const e=new THREE.Mesh(new THREE.SphereGeometry(.07,10,8),glow);e.position.set(x,.02,-.47);e.scale.set(1,1.3,.5);head.add(e)});
 const ant=new THREE.Mesh(new THREE.CylinderGeometry(.03,.03,.3,6),dark);ant.position.y=.55;head.add(ant);const ab=new THREE.Mesh(new THREE.SphereGeometry(.09,10,8),org);ab.position.y=.73;head.add(ab);
 [-1,1].forEach(s=>{const ear=new THREE.Mesh(new THREE.CylinderGeometry(.12,.12,.12,12),org);ear.rotation.z=Math.PI/2;ear.position.set(s*.48,0,0);head.add(ear)});
 const limb=(r,l,mat,x,y)=>{const p=new THREE.Group();p.position.set(x,y,0);const m=new THREE.Mesh(new THREE.CapsuleGeometry(r,l,4,8),mat);m.position.y=-(l/2+r);p.add(m);g.add(p);return p};
 const arms=[limb(.12,.36,blue,-.58,1.35),limb(.12,.36,blue,.58,1.35)],legs=[limb(.15,.28,dark,-.2,.62),limb(.15,.28,dark,.2,.62)];
 const flame=new THREE.Mesh(new THREE.ConeGeometry(.16,.6,10),new THREE.MeshBasicMaterial({color:0xffa040,transparent:true,opacity:.9}));flame.rotation.x=Math.PI;flame.position.set(0,.6,.45);flame.visible=false;g.add(flame);
 const sh=new THREE.Mesh(new THREE.CircleGeometry(.6,20),new THREE.MeshBasicMaterial({color:0x000000,transparent:true,opacity:.22}));sh.rotation.x=-Math.PI/2;sh.position.y=.02;scene.add(sh);
 return {g,arms,legs,head,flame,sh}}
const R=makeRobot();scene.add(R.g);

/* ---------- 장애물·코인 ---------- */
const stripe=canvasTex(128,32,(x,w,h)=>{for(let i=0;i<8;i++){x.fillStyle=i%2?'#ffffff':'#ff4a5a';x.beginPath();x.moveTo(i*20-10,h);x.lineTo(i*20+6,0);x.lineTo(i*20+22,0);x.lineTo(i*20+6,h);x.fill()}});
const box=new THREE.BoxGeometry(1,1,1);
function mkLow(){const g=new THREE.Group(),b=new THREE.Mesh(box,M(0xffffff,{map:stripe}));b.scale.set(1.9,.45,.22);b.position.y=.78;g.add(b);[-.75,.75].forEach(x=>{const l=new THREE.Mesh(box,M(0xdde2f0));l.scale.set(.1,.75,.1);l.position.set(x,.37,0);g.add(l)});return {g,y1:0,y2:1.0,d:.3}}
function mkHigh(){const g=new THREE.Group(),bar=new THREE.Mesh(box,M(0xffd25a));bar.scale.set(2.1,.35,.3);bar.position.y=1.85;g.add(bar);const sign=new THREE.Mesh(box,M(0xffffff,{map:stripe}));sign.scale.set(1.6,.22,.32);sign.position.y=1.85;g.add(sign);
 [-1.05,1.05].forEach(x=>{const p=new THREE.Mesh(box,M(0x8a92b8));p.scale.set(.14,2.1,.14);p.position.set(x,1.05,0);g.add(p)});return {g,y1:1.25,y2:2.1,d:.3}}
const contTex=canvasTex(128,64,(x,w,h)=>{x.fillStyle='#fff';x.fillRect(0,0,w,h);x.fillStyle='rgba(0,0,0,.12)';for(let i=0;i<8;i++)x.fillRect(4+i*16,4,6,h-8)});
function mkWall(){const g=new THREE.Group(),b=new THREE.Mesh(box,M(pick([0xff7eb3,0x5aa9ff,0x6fd67a,0xffad4d]),{map:contTex}));b.scale.set(2,2.6,1.6);b.position.y=1.3;g.add(b);return {g,y1:0,y2:2.6,d:.8}}
const trainTex=canvasTex(256,64,(x,w,h)=>{x.fillStyle='#ffffff';x.fillRect(0,0,w,h);x.fillStyle='#9fdcff';for(let i=0;i<6;i++)x.fillRect(10+i*41,10,28,22);x.fillStyle='#ff5a7a';x.fillRect(0,44,w,8)});
function mkTrain(){const g=new THREE.Group(),L=12,b=new THREE.Mesh(box,[M(0xf6f6ff,{map:trainTex}),M(0xf6f6ff,{map:trainTex}),M(0xeef0fa),M(0xeef0fa),M(0xff5a7a),M(0xff5a7a)]);b.scale.set(2.1,2.9,L);b.position.y=1.45;g.add(b);
 const lt=new THREE.Mesh(new THREE.SphereGeometry(.22,10,8),new THREE.MeshBasicMaterial({color:0xfff3a0}));lt.position.set(0,2.3,L/2+.01);g.add(lt);return {g,y1:0,y2:2.9,d:L/2,train:1}}
const coinGeo=new THREE.CylinderGeometry(.36,.36,.09,22),coinMat=M(0xffd23f,{metalness:.6,roughness:.25,emissive:0x5a4000,emissiveIntensity:.35});
const emoTex={};function emo(e){if(!emoTex[e])emoTex[e]=canvasTex(128,128,(x,w,h)=>{x.fillStyle='rgba(255,255,255,.95)';x.beginPath();x.arc(64,64,58,0,7);x.fill();x.strokeStyle='#ffd25a';x.lineWidth=8;x.stroke();x.font='70px "Apple Color Emoji","Segoe UI Emoji","Noto Color Emoji",sans-serif';x.textAlign='center';x.textBaseline='middle';x.fillText(e,64,70)});return emoTex[e]}
let objs=[],coins=[];
function addObs(type,lane,z){const o=type==='low'?mkLow():type==='high'?mkHigh():type==='wall'?mkWall():mkTrain();o.type=type;o.lane=lane;o.g.position.set(LX[lane],0,z);scene.add(o.g);objs.push(o);return o}
function addCoin(lane,z,y){const m=new THREE.Mesh(coinGeo,coinMat);m.rotation.x=Math.PI/2;m.position.set(LX[lane],y||.9,z);scene.add(m);coins.push({m,lane});return m}
function addPow(kind,lane,z){const sp=new THREE.Sprite(new THREE.SpriteMaterial({map:emo({mag:'🧲',jet:'🚀',x2:'✨'}[kind]),transparent:true}));sp.scale.set(1.1,1.1,1);sp.position.set(LX[lane],1.2,z);scene.add(sp);objs.push({g:sp,type:'pow',kind,lane,y1:0,y2:2,d:.5})}

/* ---------- 상태 ---------- */
let G=null,mode='home',last=0,shake=0;
function newRun(){objs.forEach(o=>scene.remove(o.g));coins.forEach(c=>scene.remove(c.m));objs=[];coins=[];
 G={lane:1,x:0,y:0,vy:0,slide:0,speed:14,dist:0,coins:0,score:0,next:30,mag:0,jet:0,x2:0,dead:0,t:0,lastTrain:0,rows:0};R.g.rotation.set(0,0,0);R.g.scale.set(1,1,1)}
function hud(){$('hS').textContent=Math.floor(G.score).toLocaleString();$('hC').textContent='🪙 '+G.coins;
 $('hP').innerHTML=[['mag','🧲'],['jet','🚀'],['x2','✨ ×2']].filter(([k])=>G[k]>0).map(([k,e])=>`<span>${e} ${Math.ceil(G[k])}</span>`).join('')}
function spawnRow(z){const sp=G.speed,d=Math.min(1,G.dist/1800);G.rows++;
 if(G.rows<3){const l=Math.floor(rnd(0,3));for(let i=0;i<6;i++)addCoin(l,z-i*1.6);return}
 // 기차 (가끔)
 if(G.dist>250&&G.t-G.lastTrain>7&&Math.random()<.22+d*.15){G.lastTrain=G.t;const l=Math.floor(rnd(0,3));const t=addObs('train',l,z-20);t.extra=7+d*5;AU.sfx('warn');const free=[0,1,2].filter(x=>x!==l);addCoin(pick(free),z-4);return}
 const kinds=['low','high','wall',null,null].concat(d>.3?['low','high','wall']:[]);
 let row=[0,1,2].map(()=>pick(kinds));
 if(row.every(k=>k==='wall'||k==='high'&&false))row[Math.floor(rnd(0,3))]=null;
 if(row.filter(k=>k==='wall').length>=2&&Math.random()<.6)row[row.indexOf('wall')]=pick([null,'low']);
 if(!row.includes(null)&&!row.includes('low')&&!row.includes('high'))row[1]=null;
 row.forEach((k,l)=>{if(k)addObs(k,l,z)});
 // 코인: 빈 줄에 한 줄, 낮은 막대 위엔 무지개 모양
 const free=row.map((k,l)=>k?-1:l).filter(l=>l>=0);
 if(free.length&&Math.random()<.8){const l=pick(free);for(let i=0;i<5;i++)addCoin(l,z+4-i*1.7)}
 const low=row.indexOf('low');if(low>=0&&Math.random()<.5){for(let i=0;i<5;i++){const t=(i-2)/2;addCoin(low,z-i*1.2+2.4,.9+1.6*(1-t*t))}}
 if(Math.random()<.07&&G.dist>150){const l=free.length?pick(free):Math.floor(rnd(0,3));addPow(pick(['mag','jet','x2']),l,z-6)}}
function jetCoins(){for(let i=0;i<40;i++){const l=Math.floor((Math.sin(i*.35)+1)*1.49);addCoin(l,-12-i*2.2,4.6)}}

/* ---------- 조작 ---------- */
function act(k){if(mode!=='play'||G.dead)return;
 if(k==='L'&&G.lane>0){G.lane--;AU.sfx('pick')}else if(k==='R'&&G.lane<2){G.lane++;AU.sfx('pick')}
 else if(k==='U'&&G.y<=0.01&&G.jet<=0){G.vy=10.5;G.slide=0;AU.sfx('jump');$('swipe').style.opacity=0}
 else if(k==='D'&&G.jet<=0){if(G.y>0.01)G.vy=-16;G.slide=.75;AU.sfx('whoosh')}}
let sx=0,sy=0,sw=false;
renderer.domElement.addEventListener('pointerdown',e=>{AU.init();sx=e.clientX;sy=e.clientY;sw=true});
addEventListener('pointermove',e=>{if(!sw)return;const dx=e.clientX-sx,dy=e.clientY-sy,th=Math.max(24,innerWidth*.05);if(Math.abs(dx)>th||Math.abs(dy)>th){sw=false;act(Math.abs(dx)>Math.abs(dy)?(dx<0?'L':'R'):(dy<0?'U':'D'))}});
addEventListener('pointerup',()=>{sw=false});
addEventListener('keydown',e=>{const m={ArrowLeft:'L',KeyA:'L',ArrowRight:'R',KeyD:'R',ArrowUp:'U',KeyW:'U',Space:'U',ArrowDown:'D',KeyS:'D'}[e.code];if(m){e.preventDefault();act(m)}});

/* ---------- 매 프레임 ---------- */
function crash(o){G.dead=1;mode='dead';AU.sfx('hurt');AU.sfx('boom');shake=.5;BGM.stop();
 const s=Math.floor(G.score),nb=s>S.best;if(nb)S.best=s;S.coins+=G.coins;S.runs++;SV.put();if(navigator.vibrate)try{navigator.vibrate(60)}catch(e){}
 setTimeout(()=>{$('rT').textContent=nb?'🎉 새 최고 기록!':'💥 쿵!';$('rB').innerHTML=`<div class="rline">점수 <b>${s.toLocaleString()}</b></div><div class="rline">🏃 ${Math.floor(G.dist)}m · 🪙 ${G.coins}</div><div class="rline" style="font-size:17px">🏆 최고 ${S.best.toLocaleString()} · 모은 코인 ${S.coins}</div>`;screen('res');if(nb)AU.sfx('win')},1300)}
function update(dt){const t=performance.now()/1000;
 if(mode==='home'){R.g.rotation.y=Math.PI+Math.sin(t*.8)*.5;R.g.position.set(0,0,0);runAnim(t,.4);roadTex.offset.y+=dt*.5;walkTex.offset.y+=dt*1.3;moveCity(4*dt);camFollow(dt,0,0,true);return}
 if(mode!=='play'){if(mode==='dead'){R.g.rotation.x=Math.max(-1.3,R.g.rotation.x-dt*4);R.g.position.y=Math.max(0,R.g.position.y-dt*3)}camFollow(dt,R.g.position.x,R.g.position.y);return}
 G.t+=dt;G.speed=Math.min(32,14+G.dist/75);const v=G.speed;G.dist+=v*dt;
 G.score+=v*dt*(G.x2>0?2:1);
 // 길 움직이기
 roadTex.offset.y+=v*dt/8;walkTex.offset.y+=v*dt/3;moveCity(v*dt);
 // 줄 생성
 G.next-=v*dt;if(G.next<=0&&G.jet<=0){spawnRow(FAR);G.next=clamp(22-G.speed*.25,13,20)}
 // 플레이어
 G.x+=(LX[G.lane]-G.x)*Math.min(1,dt*14);
 if(G.jet>0){G.jet-=dt;G.y+=(4.2-G.y)*Math.min(1,dt*3);G.vy=0;if(G.jet<=0){G.vy=0;G.next=25}}
 else{G.vy-=30*dt;G.y=Math.max(0,G.y+G.vy*dt);if(G.y<=0&&G.vy<0){if(G.vy<-8)AU.sfx('thud');G.vy=0}}
 if(G.slide>0)G.slide-=dt;['mag','x2'].forEach(k=>{if(G[k]>0)G[k]-=dt});
 R.g.position.set(G.x,G.y,0);R.g.rotation.set(G.slide>0?.5:0,Math.PI*0+(LX[G.lane]-G.x)*-.15,0);R.g.scale.set(1,G.slide>0?.6:1,1);R.flame.visible=G.jet>0;if(G.jet>0)R.flame.scale.y=.8+Math.random()*.5;
 runAnim(t,G.y>0.05?0:1,v);R.sh.position.set(G.x,.03,0);R.sh.scale.setScalar(Math.max(.3,1-G.y*.15));
 // 물체 이동·충돌
 const pz1=-.35,pz2=.35,py1=G.y,py2=G.y+(G.slide>0?.95:1.95),px1=G.x-.42,px2=G.x+.42;
 for(const o of objs){o.g.position.z+=(v+(o.extra||0))*dt;if(o.type==='pow'){o.g.position.y=1.2+Math.sin(t*4)*.15;o.g.material.rotation=Math.sin(t*3)*.2}
  const oz=o.g.position.z,ox=o.g.position.x;if(o.gone)continue;
  if(Math.abs(oz)<(o.d||.3)+.4&&Math.abs(ox-G.x)<1.25){
   if(o.type==='pow'){o.gone=1;scene.remove(o.g);G[o.kind]=o.kind==='mag'?9:o.kind==='jet'?7:10;AU.sfx('level');KIT.toast({mag:'🧲 자석!',jet:'🚀 제트팩!',x2:'✨ 점수 2배!'}[o.kind]);if(o.kind==='jet'){jetCoins()}continue}
   if(G.jet>0)continue;
   if(oz-(o.d||.3)<pz2&&oz+(o.d||.3)>pz1&&ox-.95<px2&&ox+.95>px1&&o.y2>py1&&o.y1<py2){crash(o);return}}}
 for(const c of coins){c.m.position.z+=v*dt;c.m.rotation.z+=dt*4;if(c.got){c.m.scale.multiplyScalar(1+dt*8);c.m.position.y+=dt*4;continue}
  const dz=c.m.position.z,dx=c.m.position.x-G.x,dy=c.m.position.y-(G.y+1);
  if(G.mag>0&&Math.abs(dz)<9&&dz<1.5){c.m.position.x-=dx*Math.min(1,dt*8);c.m.position.y-=dy*Math.min(1,dt*8)}
  if(Math.abs(dz)<.6&&Math.abs(dx)<.8&&Math.abs(dy)<1.2){c.got=1;G.coins++;G.score+=10*(G.x2>0?2:1);AU.sfx('coin');setTimeout(()=>scene.remove(c.m),150)}}
 if(objs.some(o=>o.g.position.z>14||o.gone)){objs=objs.filter(o=>{if(o.g.position.z-(o.d||0)>14||o.gone){scene.remove(o.g);return false}return true})}
 if(coins.some(c=>c.m.position.z>10||c.got&&c.m.scale.x>2)){coins=coins.filter(c=>{if(c.m.position.z>10||(c.got&&c.m.scale.x>2)){scene.remove(c.m);return false}return true})}
 camFollow(dt,G.x,G.y);hud()}
function runAnim(t,k,v){const f=v?v*.75:6,s=Math.sin(t*f)*.9*k;R.legs[0].rotation.x=s;R.legs[1].rotation.x=-s;R.arms[0].rotation.x=-s*.8;R.arms[1].rotation.x=s*.8;R.head.position.y=1.82+Math.abs(Math.sin(t*f))*.05*k;
 if(G&&G.y>0.05&&mode==='play'){R.legs[0].rotation.x=.7;R.legs[1].rotation.x=-.3;R.arms[0].rotation.x=-1.6;R.arms[1].rotation.x=-1.6}}
function moveCity(dz){for(const b of blds){b.position.z+=dz;if(b.position.z-b.scale.z/2>14){const minZ=Math.min(...blds.filter(x=>x.userData.side===b.userData.side).map(x=>x.position.z-x.scale.z/2));placeBld(b,minZ-rnd(.5,2)-b.scale.z/2)}}
 for(const l of lamps){l.position.z+=dz;if(l.position.z>12)l.position.z-=100}}
function camFollow(dt,x,y,menu){const tx=menu?0:x*.55,ty=menu?2.6:4.3+y*.55,tz=menu?5.2:7.6;cam.position.x+=(tx-cam.position.x)*Math.min(1,dt*6);cam.position.y+=(ty-cam.position.y)*Math.min(1,dt*4);cam.position.z+=(tz-cam.position.z)*Math.min(1,dt*3);
 if(shake>0){shake-=dt;cam.position.x+=(Math.random()-.5)*shake;cam.position.y+=(Math.random()-.5)*shake}
 cam.lookAt(menu?0:x*.45,menu?1.4:1.3+y*.6,menu?0:-6)}
function loop(ts){requestAnimationFrame(loop);const dt=Math.min(.05,(ts-last)/1000||0);last=ts;if(!paused)update(dt);renderer.render(scene,cam)}

/* ---------- 화면 ---------- */
let paused=false;
function screen(id){document.querySelectorAll('.scr').forEach(e=>e.classList.toggle('on',e.id===id));$('hud').style.display=id===null||id==='pause'?'block':'none';$('pbtn').style.display=id===null?'block':'none';$('swipe').style.display=id===null?'block':'none'}
function home(){mode='home';if(G){objs.forEach(o=>scene.remove(o.g));coins.forEach(c=>scene.remove(c.m));objs=[];coins=[]}G=null;R.g.rotation.set(0,Math.PI,0);R.g.position.set(0,0,0);R.g.scale.set(1,1,1);R.flame.visible=false;
 $('hb').textContent='🏆 최고 '+S.best.toLocaleString()+' · 🪙 '+S.coins;screen('home');BGM.play('play')}
function start(){AU.init();newRun();mode='play';screen(null);$('swipe').style.opacity=1;BGM.play('play');hud();setTimeout(()=>{$('swipe').style.opacity=0},4000)}
$('bGo').onclick=()=>{AU.sfx('click');start()};$('rRe').onclick=()=>{AU.sfx('click');start()};$('rHome').onclick=()=>{AU.sfx('click');home()};
$('pbtn').onclick=()=>{AU.sfx('click');paused=true;screen('pause')};$('pGo').onclick=()=>{paused=false;screen(null)};$('pHome').onclick=()=>{paused=false;home()};
$('sbtn').onclick=()=>{S.snd=S.snd?0:1;AU.on=BGM.on=!!S.snd;SV.put();$('sbtn').textContent=S.snd?'🔊':'🔇';AU.init();AU.sfx('click')};$('sbtn').textContent=S.snd?'🔊':'🔇';
document.addEventListener('visibilitychange',()=>{if(document.hidden&&mode==='play'&&!paused){paused=true;screen('pause')}});
window.__rr={get G(){return G},get mode(){return mode},get objs(){return objs},act,start};
home();requestAnimationFrame(loop);
})();
