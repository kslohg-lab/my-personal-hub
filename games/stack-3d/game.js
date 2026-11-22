/* 착착 쌓기 3D — Three.js(3D 엔진)로 만든 타이밍 쌓기 게임
   움직이는 블록을 톡! 해서 내려놓으면 아래 블록과 겹친 부분만 남고 나머지는 잘려 떨어져요. 딱 맞추면 다시 커져요.
   저장: localStorage 'stack3dV1' {best, snd, games, perfect} */
(()=>{'use strict';
const {clamp,$,AU,BGM}=KIT;
const UW=420,LH=.55,SIZE=3,RANGE=4.6,PERF=.11;
const SV=KIT.save('stack3dV1',()=>({best:0,snd:1,games:0,perfect:0}));const S=SV.data;AU.on=BGM.on=!!S.snd;

const renderer=new THREE.WebGLRenderer({antialias:true,alpha:true});renderer.setPixelRatio(Math.min(2,window.devicePixelRatio||1));renderer.outputEncoding=THREE.sRGBEncoding;$('game').appendChild(renderer.domElement);
const scene=new THREE.Scene();let VIEW=7.2;const cam=new THREE.OrthographicCamera(-1,1,1,-1,.1,200);
scene.add(new THREE.HemisphereLight(0xffffff,0x6a6a90,.5));const sun=new THREE.DirectionalLight(0xffffff,.95);sun.position.set(-4,10,6);scene.add(sun);const fill=new THREE.DirectionalLight(0xffffff,.25);fill.position.set(6,3,-2);scene.add(fill);
function resize(){const w=innerWidth,h=innerHeight;renderer.setSize(w,h);const a=w/h;cam.left=-VIEW*a;cam.right=VIEW*a;cam.top=VIEW;cam.bottom=-VIEW;cam.updateProjectionMatrix();
 const ui=$('ui');ui.style.width=UW+'px';ui.style.height=Math.round(h*UW/w)+'px';ui.style.transform=`scale(${w/UW})`}
addEventListener('resize',resize);resize();
const box=new THREE.BoxGeometry(1,1,1);
const hue=i=>((S.hue0||0)+i*7)%360;
const colOf=i=>new THREE.Color().setHSL(hue(i)/360,.72,.6);
const mat=i=>new THREE.MeshLambertMaterial({color:colOf(i)});
function bgFor(i){const h=hue(i+8);document.body.style.background=`linear-gradient(hsl(${h},55%,78%),hsl(${(h+40)%360},60%,62%))`}

/* ---------- 상태 ---------- */
let stack=[],debris=[],rings=[],cur=null,mode='home',paused=false,combo=0,speed=4,camY=0,camWant=0,zoomOut=0,score=0;
const base=new THREE.Mesh(box,new THREE.MeshLambertMaterial({color:0x5a6a8a}));base.scale.set(SIZE,8,SIZE);base.position.y=-4-LH/2;scene.add(base);
function addLayer(x,z,w,d,y,i){const m=new THREE.Mesh(box,mat(i));m.scale.set(w,LH,d);m.position.set(x,y,z);scene.add(m);return m}
function reset(){stack.forEach(s=>scene.remove(s.m));debris.forEach(d=>scene.remove(d.m));rings.forEach(r=>scene.remove(r.m));if(cur)scene.remove(cur.m);stack=[];debris=[];rings=[];cur=null;
 S.hue0=Math.floor(Math.random()*360);base.material.color.setHSL(hue(-6)/360,.35,.5);
 stack.push({x:0,z:0,w:SIZE,d:SIZE,y:0,m:addLayer(0,0,SIZE,SIZE,0,0)});combo=0;score=0;speed=3.6;camWant=camY=0;zoomOut=0;VIEW=7.2;resize();bgFor(0);$('score').textContent='0'}
function spawn(){const top=stack[stack.length-1],i=stack.length,ax=i%2?'x':'z';const c={ax,x:top.x,z:top.z,w:top.w,d:top.d,y:top.y+LH,dir:1,t:0};c[ax]=-RANGE;c.m=addLayer(c.x,c.z,c.w,c.d,c.y,i);cur=c;camWant=top.y}
function drop(){if(mode!=='play'||paused||!cur)return;const top=stack[stack.length-1],ax=cur.ax,sz=ax==='x'?'w':'d',delta=cur[ax]-top[ax],size=top[sz],ov=size-Math.abs(delta);
 if(ov<=0){// 완전히 빗나감
  debris.push({m:cur.m,vy:0,vx:Math.sign(delta)*(ax==='x'?1:0)*2,vz:Math.sign(delta)*(ax==='z'?1:0)*2,rx:ax==='z'?Math.sign(delta)*2:0,rz:ax==='x'?-Math.sign(delta)*2:0,t:0});cur=null;AU.sfx('lose');end();return}
 const i=stack.length;let pf=Math.abs(delta)<PERF;
 if(pf){cur[ax]=top[ax];combo++;S.perfect++;
  let ns=cur[sz];if(combo>=3&&ns<SIZE){ns=Math.min(SIZE,ns+.14);}cur[sz]=ns;
  ring(cur);AU.tone(523*Math.pow(2,Math.min(combo,14)/12),.18,'triangle',.14);AU.tone(1046*Math.pow(2,Math.min(combo,14)/12),.12,'sine',.06,.04);
  const p=$('perf');p.textContent=combo>=3?`✨ ${combo}번 연속 딱!`:'딱 맞았어요!';p.style.opacity=1;clearTimeout(drop.h);drop.h=setTimeout(()=>p.style.opacity=0,700)}
 else{combo=0;const cut=Math.abs(delta),keepC=top[ax]+delta/2,dC=keepC+Math.sign(delta)*(ov/2+cut/2);
  cur[sz]=ov;cur[ax]=keepC;
  const dm=new THREE.Mesh(box,mat(i));const dw=ax==='x'?cut:cur.w,dd=ax==='z'?cut:cur.d;dm.scale.set(dw,LH,dd);dm.position.set(ax==='x'?dC:cur.x,cur.y,ax==='z'?dC:cur.z);scene.add(dm);
  debris.push({m:dm,vy:0,vx:ax==='x'?Math.sign(delta)*1.2:0,vz:ax==='z'?Math.sign(delta)*1.2:0,rx:ax==='z'?Math.sign(delta)*2.2:0,rz:ax==='x'?-Math.sign(delta)*2.2:0,t:0});
  AU.noise(.08,.14,0,1400);AU.tone(260,.1,'triangle',.12,0,180)}
 cur.m.scale.set(cur.w,LH,cur.d);cur.m.position.set(cur.x,cur.y,cur.z);
 stack.push({x:cur.x,z:cur.z,w:cur.w,d:cur.d,y:cur.y,m:cur.m});cur=null;score=stack.length-1;$('score').textContent=score;
 const sc=$('score');sc.style.transform='scale(1.18)';setTimeout(()=>sc.style.transform='scale(1)',120);
 if(score%10===0){AU.sfx('level');KIT.toast(`🎉 ${score}층 돌파!`)}
 speed=Math.min(8.2,3.6+score*.07);bgFor(score);$('tap').style.display='none';spawn()}
function ring(c){const g=new THREE.EdgesGeometry(new THREE.BoxGeometry(c.w,.02,c.d)),m=new THREE.LineSegments(g,new THREE.LineBasicMaterial({color:0xffffff,transparent:true}));m.position.set(c.x,c.y-LH/2+.01,c.z);scene.add(m);rings.push({m,t:0})}
function end(){mode='over';S.games++;const nb=score>S.best;if(nb)S.best=score;SV.put();BGM.stop();
 // 탑 전체가 보이게 뒤로
 zoomOut=1;setTimeout(()=>{$('rT').textContent=nb?'🎉 새 최고 기록!':'와르르!';$('rB').innerHTML=`<div class="rline"><b>${score}</b>층 쌓았어요</div><div class="rline" style="font-size:18px">🏆 최고 ${S.best}층</div>`;if(nb)AU.sfx('win');sc('res')},900)}

/* ---------- 화면 ---------- */
function sc(id){document.querySelectorAll('.scr').forEach(e=>e.classList.toggle('on',e.id===id));const pl=id===null;$('pbtn').style.display=pl?'block':'none';$('score').style.display=(pl||id==='res'||id==='pause')?'block':'none'}
function home(){mode='home';paused=false;reset();for(let i=0;i<14;i++){const w=SIZE-i*.05,s={x:Math.sin(i)*.15,z:Math.cos(i*1.3)*.15,w,d:w,y:(i+1)*LH};s.m=addLayer(s.x,s.z,w,w,s.y,i+1);stack.push(s)}camWant=stack[stack.length-1].y-2;
 $('hb').textContent=`🏆 최고 ${S.best}층`;$('tap').style.display='none';sc('home');BGM.play('calm')}
function start(){AU.init();reset();mode='play';paused=false;sc(null);$('tap').style.display='block';BGM.play('bright');spawn()}
$('bGo').onclick=()=>{AU.sfx('click');start()};$('rRe').onclick=()=>{AU.sfx('click');start()};$('rHome').onclick=()=>{AU.sfx('click');home()};
$('pbtn').onclick=e=>{e.stopPropagation();AU.sfx('click');paused=true;sc('pause')};$('pGo').onclick=()=>{paused=false;sc(null)};$('pHome').onclick=()=>home();
$('sbtn').onclick=()=>{S.snd=S.snd?0:1;AU.on=BGM.on=!!S.snd;SV.put();$('sbtn').textContent=S.snd?'🔊':'🔇';AU.init();AU.sfx('click')};$('sbtn').textContent=S.snd?'🔊':'🔇';
renderer.domElement.addEventListener('pointerdown',e=>{AU.init();drop()});
addEventListener('keydown',e=>{if(e.code==='Space'||e.code==='Enter'){e.preventDefault();if(mode==='play')drop();else if(mode==='home')start()}});

/* ---------- 매 프레임 ---------- */
let last=performance.now();
function loop(now){requestAnimationFrame(loop);const dt=Math.min(.05,(now-last)/1000);last=now;
 if(!paused){
  if(cur&&mode==='play'){cur[cur.ax]+=cur.dir*speed*dt;if(cur[cur.ax]>RANGE){cur[cur.ax]=RANGE;cur.dir=-1}if(cur[cur.ax]<-RANGE){cur[cur.ax]=-RANGE;cur.dir=1}cur.m.position.set(cur.x,cur.y,cur.z)}
  for(const d of debris){d.t+=dt;d.vy-=22*dt;d.m.position.y+=d.vy*dt;d.m.position.x+=d.vx*dt;d.m.position.z+=d.vz*dt;d.m.rotation.x+=d.rx*dt;d.m.rotation.z+=d.rz*dt}
  debris=debris.filter(d=>{if(d.t>3){scene.remove(d.m);return false}return true});
  for(const r of rings){r.t+=dt;const k=1+r.t*1.6;r.m.scale.set(k,1,k);r.m.material.opacity=Math.max(0,1-r.t*2)}rings=rings.filter(r=>{if(r.t>.5){scene.remove(r.m);return false}return true});
  if(mode==='home'){const t=now/1000;stack.forEach((s,i)=>{s.m.rotation.y=Math.sin(t*.6+i*.25)*.08})}
 }
 // 카메라: 맨 위를 따라가고, 끝나면 탑 전체가 보이게
 const topY=stack.length?stack[stack.length-1].y:0;
 if(zoomOut){const want=Math.max(7.2,(topY+6)/2*1.15);VIEW+=(want-VIEW)*Math.min(1,dt*3);resize();camWant=topY/2-1}
 camY+=(camWant-camY)*Math.min(1,dt*4);cam.position.set(10,camY+10.5,10);cam.lookAt(0,camY+1.5,0);
 renderer.render(scene,cam)}
home();requestAnimationFrame(loop);
window.__st={get mode(){return mode},get score(){return score},get cur(){return cur},get stack(){return stack},drop,start,
 perfect(){if(cur){const t=stack[stack.length-1];cur[cur.ax]=t[cur.ax]+(Math.random()-.5)*.08}},
 near(e){if(cur){const t=stack[stack.length-1];cur[cur.ax]=t[cur.ax]+e}}};
})();
