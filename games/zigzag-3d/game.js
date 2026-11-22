/* 지그재그 3D — 톡 할 때마다 방향이 바뀌는 공 굴리기 (Three.js)
   저장: localStorage 'zigzag3dV1' {best, gems, snd, games} */
(()=>{'use strict';
const {rnd,$,AU,BGM}=KIT;
const UW=420,BR=.26,PH=4;
const SV=KIT.save('zigzag3dV1',()=>({best:0,gems:0,snd:1,games:0}));const S=SV.data;
$('load').style.display='none';
const renderer=new THREE.WebGLRenderer({antialias:true,alpha:true});renderer.setPixelRatio(Math.min(2,window.devicePixelRatio||1));renderer.outputEncoding=THREE.sRGBEncoding;$('game').appendChild(renderer.domElement);
const scene=new THREE.Scene(),VIEW=7,cam=new THREE.OrthographicCamera(-1,1,1,-1,.1,200);
scene.add(new THREE.HemisphereLight(0xffffff,0x7080a0,.55));const sun=new THREE.DirectionalLight(0xffffff,.9);sun.position.set(-6,10,3);scene.add(sun);
function resize(){const w=innerWidth,h=innerHeight,a=w/h;renderer.setSize(w,h);cam.left=-VIEW*a;cam.right=VIEW*a;cam.top=VIEW;cam.bottom=-VIEW;cam.updateProjectionMatrix();
 const ui=$('ui');ui.style.width=UW+'px';ui.style.height=Math.round(h*UW/w)+'px';ui.style.transform=`scale(${w/UW})`}
addEventListener('resize',resize);resize();
const box=new THREE.BoxGeometry(1,PH,1),hueAt=i=>(200+i*1.2)%360;
const tMat=i=>{const c=new THREE.Color().setHSL(hueAt(i)/360,.68,.66);return [new THREE.MeshLambertMaterial({color:c.clone().multiplyScalar(.82)}),new THREE.MeshLambertMaterial({color:c.clone().multiplyScalar(.82)}),new THREE.MeshLambertMaterial({color:c}),new THREE.MeshLambertMaterial({color:c}),new THREE.MeshLambertMaterial({color:c.clone().multiplyScalar(.65)}),new THREE.MeshLambertMaterial({color:c.clone().multiplyScalar(.65)})]};
const ball=new THREE.Mesh(new THREE.SphereGeometry(BR,24,16),new THREE.MeshStandardMaterial({color:0xffffff,roughness:.25,metalness:.05}));scene.add(ball);
const shadow=new THREE.Mesh(new THREE.CircleGeometry(BR*.95,20),new THREE.MeshBasicMaterial({color:0x000000,transparent:true,opacity:.18}));shadow.rotation.x=-Math.PI/2;scene.add(shadow);
const gemGeo=new THREE.OctahedronGeometry(.22),gemMat=new THREE.MeshStandardMaterial({color:0xff5ad0,emissive:0x802060,roughness:.2,metalness:.3});
const sparkGeo=new THREE.BoxGeometry(.07,.07,.07),sparkMat=new THREE.MeshBasicMaterial({color:0xffffff});

let started=false,tiles=[],map=new Map(),gems=[],sparks=[],mode='home',paused=false,bx=0,bz=0,dir='x',speed=3,score=0,gemN=0,gx=0,gz=0,run=0,gdir='x',vy=0,by=0,camT=new THREE.Vector3(),passed=0,ti=0,bgI=-1;
const key=(x,z)=>x+','+z;
function addTile(x,z,plat){const m=new THREE.Mesh(box,tMat(ti));m.position.set(x,-PH/2,z);scene.add(m);const t={x,z,m,i:ti++,fall:0,vy:0};tiles.push(t);map.set(key(x,z),t);
 if(!plat&&ti>12&&Math.random()<.12){const g=new THREE.Mesh(gemGeo,gemMat);g.position.set(x,.35,z);scene.add(g);gems.push({x,z,m:g})}return t}
function genNext(){if(run<=0){gdir=Math.random()<.5?'x':'z';run=1+Math.floor(Math.random()*(speed>5?3:5))}
 if(gdir==='x')gx++;else gz--;run--;addTile(gx,gz)}
function reset(){tiles.forEach(t=>scene.remove(t.m));gems.forEach(g=>scene.remove(g.m));sparks.forEach(s=>scene.remove(s.m));tiles=[];map.clear();gems=[];sparks=[];ti=0;
 for(let x=-1;x<=1;x++)for(let z=-1;z<=1;z++)addTile(x,z,1);gx=1;gz=-1;run=0;for(let i=0;i<40;i++)genNext();
 bx=-1;bz=1;by=BR;vy=0;dir='z';speed=2.6;score=0;gemN=0;passed=0;started=false;ball.position.set(bx,BR,bz);camT.set(0,0,0);bg(0)}
function bg(i){const k=Math.floor(i/40);if(k===bgI)return;bgI=k;const h=hueAt(i+30);document.body.style.background=`linear-gradient(hsl(${h},60%,80%),hsl(${(h+30)%360},55%,62%))`}
function onTile(x,z){const cx=Math.round(x),cz=Math.round(z);for(let a=-1;a<=1;a++)for(let b=-1;b<=1;b++){const t=map.get(key(cx+a,cz+b));if(t&&!t.fall&&Math.abs(x-t.x)<.5+BR*.35&&Math.abs(z-t.z)<.5+BR*.35)return t}return null}
function turn(){if(mode!=='play'||paused)return;if(!started){started=true;$('tap').style.display='none';AU.tone(520,.05,'triangle',.08);return}dir=dir==='x'?'z':'x';AU.tone(dir==='x'?660:520,.05,'triangle',.08);$('tap').style.display='none';score++;$('score').textContent=score}
function burst(x,y,z,n,c){for(let i=0;i<n;i++){const m=new THREE.Mesh(sparkGeo,c?new THREE.MeshBasicMaterial({color:c}):sparkMat);m.position.set(x,y,z);scene.add(m);sparks.push({m,v:new THREE.Vector3(rnd(-2,2),rnd(1,4),rnd(-2,2)),t:0})}}
function over(){if(mode!=='play')return;mode='fall';AU.sfx('lose');BGM.stop();S.games++;S.gems+=gemN;const nb=score>S.best;if(nb)S.best=score;SV.put();
 setTimeout(()=>{mode='over';ui.result(nb?'🎉 새 최고 기록!':'떨어졌어요!',`<div class="rline"><b>${score}</b>점 · 💎 ${gemN}개</div><div class="rline" style="font-size:18px">🏆 최고 ${S.best} · 모은 보석 ${S.gems}</div>`,nb)},1000)}
const ui=KIT.shell({S,SV,start:()=>start(),home:()=>home(),pause:on=>paused=on});
function home(){mode='home';paused=false;reset();ui.best(`🏆 최고 ${S.best} · 💎 ${S.gems}`);ui.sc('home');BGM.play('calm')}
function start(){AU.init();reset();mode='play';paused=false;ui.sc(null);$('score').textContent='0';$('tap').style.display='block';BGM.play('bright')}
renderer.domElement.addEventListener('pointerdown',()=>{AU.init();turn()});
addEventListener('keydown',e=>{if(e.code==='Space'){e.preventDefault();if(mode==='play')turn();else if(mode==='home')start()}});
let last=performance.now();
function loop(now){requestAnimationFrame(loop);const dt=Math.min(.05,(now-last)/1000);last=now;
 if(!paused){
  if(mode==='play'||mode==='home'){
   if(mode==='home'){// 처음 화면: 저절로 굴러가는 모습
    const ahead=dir==='x'?onTile(bx+.6,bz):onTile(bx,bz-.6);if(!ahead||Math.random()<.004)dir=dir==='x'?'z':'x'}
   const d=(mode==='home'||started)?speed*dt:0;if(dir==='x')bx+=d;else bz-=d;ball.rotation.z-=dir==='x'?d/BR:0;ball.rotation.x-=dir==='z'?d/BR:0;
   const t=onTile(bx,bz);if(!t&&mode==='play'){over()}else if(!t&&mode==='home'){reset()}
   else{// 지나간 길 정리·새 길
    if(t.i>passed){if(mode==='play'){speed=Math.min(6.8,speed+.02*(t.i-passed))}passed=t.i;bg(passed)}
    for(const q of tiles)if(!q.fall&&q.i<passed-3){q.fall=1}
    while(tiles.length&&tiles[tiles.length-1].i<passed+38)genNext()}
   for(const g of gems)if(!g.got&&Math.abs(g.x-bx)<.45&&Math.abs(g.z-bz)<.45&&mode==='play'){g.got=1;gemN++;score+=2;$('score').textContent=score;AU.sfx('gem',gemN);burst(g.x,.4,g.z,10,0xff7ad0);scene.remove(g.m)}}
  if(mode==='fall'||mode==='over'){vy-=18*dt;by+=vy*dt;const d=speed*.5*dt;if(dir==='x')bx+=d;else bz-=d}
  ball.position.set(bx,by,bz);shadow.position.set(bx,.01,bz);shadow.visible=by>-.1;
  for(const q of tiles)if(q.fall){q.vy-=20*dt;q.m.position.y+=q.vy*dt}
  tiles=tiles.filter(q=>{if(q.fall&&q.m.position.y<-14){scene.remove(q.m);map.delete(key(q.x,q.z));return false}return true});
  gems=gems.filter(g=>{if(g.got)return false;g.m.rotation.y+=dt*2;g.m.position.y=.38+Math.sin(now/300+g.x)*.05;const tl=map.get(key(g.x,g.z));if(!tl||tl.fall){if(tl)g.m.position.y=tl.m.position.y+PH/2+.35;if(!tl||tl.m.position.y<-10){scene.remove(g.m);return false}}return true});
  for(const s of sparks){s.t+=dt;s.v.y-=9*dt;s.m.position.addScaledVector(s.v,dt)}sparks=sparks.filter(s=>{if(s.t>.8){scene.remove(s.m);return false}return true})}
 camT.lerp(new THREE.Vector3(bx+1.8,0,bz-1.8),Math.min(1,dt*(mode==='fall'?.5:3)));cam.position.set(camT.x-10,camT.y+12,camT.z+10);cam.lookAt(camT.x,camT.y-.5,camT.z);
 renderer.render(scene,cam)}
home();requestAnimationFrame(loop);
window.__zz={get mode(){return mode},get score(){return score},get dir(){return dir},turn,start,onTile:(x,z)=>!!onTile(x,z),get bx(){return bx},get bz(){return bz}};
})();
