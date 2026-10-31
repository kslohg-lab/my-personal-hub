/* ===== 비스듬히 내려다보는(아이소메트릭) 가게 그리기 — 가게 홈·꾸미기 화면 공용 =====
   ISO(cx,A) 로 만들고, 매 프레임 draw(t,look,items,opt) 를 불러요.
   look: {n, wall:{c,id}, floor, sky:[위,아래], night, awn, sign, name, top, lit, sL:{e,sz}, sR:{e,sz}, mas:{e}}
   items: [{k,x,y,d}] 바닥에 놓은 가구 */
const ISO=(cx,A)=>{
const {em,tx,rr,m2,lite,dark,animal}=A;const W=450;
/* 가구 목록: p=가격, g=필요한 가게 등급, rot=돌릴 수 있음, seat=손님이 앉음, flat=바닥에 깔림
   c=분류(sit 의자·탁자 / plant 식물 / lit 조명 / deco 장식 / sp 특별), set=테마 세트, as=같은 모양으로 그리기(c1·c2 색) */
const FUR=[
 {k:'chair',n:'의자',e:'🪑',p:600,g:0,rot:1,seat:1,c:'sit'},{k:'table',n:'탁자',e:'🍽️',p:1500,g:0,c:'sit'},{k:'plant',n:'화분',e:'🪴',p:800,g:0,c:'plant'},
 {k:'rug',n:'러그',e:'🟥',p:1200,g:0,flat:1,c:'deco'},{k:'bear',n:'곰 인형',e:'🧸',p:2000,g:0,c:'deco'},{k:'stand',n:'붕어 입간판',e:'🐟',p:2500,g:1,c:'deco'},
 {k:'lamp',n:'등불',e:'🏮',p:3000,g:1,c:'lit'},{k:'sofa',n:'소파',e:'🛋️',p:6000,g:1,rot:1,seat:1,c:'sit'},{k:'shelf',n:'빵 진열대',e:'🥐',p:9000,g:2,rot:1,c:'deco'},
 {k:'tree',n:'나무 화분',e:'🌳',p:12000,g:2,c:'plant'},{k:'tank',n:'어항',e:'🐠',p:25000,g:3,c:'sp'},{k:'piano',n:'피아노',e:'🎹',p:60000,g:4,rot:1,c:'sp'},
 /* 받침 위 장식 (emo: 받침색 b, 크기 z) */
 {k:'cactus',n:'선인장',e:'🌵',p:1000,g:0,emo:1,b:'#c8643a',z:.46,c:'plant'},{k:'basket',n:'빵 바구니',e:'🧺',p:1500,g:0,emo:1,b:'#c89a64',z:.44,c:'deco'},
 {k:'candle',n:'촛대',e:'🕯️',p:1800,g:0,emo:1,b:'#8a6a50',z:.42,glow:1,c:'lit'},{k:'bench',n:'벤치',e:'🪑',p:4000,g:1,rot:1,seat:1,c:'sit'},
 {k:'books',n:'책장',e:'📚',p:4500,g:1,emo:1,b:'#7a5030',z:.5,tall:.42,c:'deco'},{k:'frame',n:'그림 이젤',e:'🖼️',p:5000,g:1,emo:1,b:'#6a4024',z:.52,c:'deco'},
 {k:'koi',n:'잉어 깃발',e:'🎏',p:6500,g:1,emo:1,b:'#5a5048',z:.6,pole:1,c:'deco'},{k:'pinata',n:'피냐타',e:'🪅',p:9000,g:2,emo:1,b:'#e8b04a',z:.52,c:'deco'},
 {k:'cake',n:'디저트 진열장',e:'🍰',p:15000,g:2,emo:1,b:'#f0d8e0',z:.4,tall:.36,glass:1,c:'deco'},{k:'coffee',n:'커피 머신',e:'☕',p:18000,g:2,emo:1,b:'#5a5a62',z:.42,tall:.3,c:'deco'},
 {k:'sakura',n:'벚꽃 나무',e:'🌸',p:22000,g:2,emo:1,b:'#a85a34',z:.9,tree:1,c:'plant'},{k:'vase',n:'도자기',e:'🏺',p:30000,g:3,emo:1,b:'#d8c8a8',z:.55,c:'deco'},
 {k:'slide',n:'미끄럼틀',e:'🛝',p:40000,g:3,emo:1,b:'#7ec8ff',z:.7,c:'sp'},{k:'moai',n:'돌 석상',e:'🗿',p:50000,g:3,emo:1,b:'#8a867c',z:.7,c:'sp'},
 {k:'carousel',n:'미니 회전목마',e:'🎠',p:70000,g:4,emo:1,b:'#ff9ab0',z:.8,c:'sp'},{k:'claw',n:'뽑기 기계',e:'🧸',p:90000,g:4,emo:1,b:'#ff6a8a',z:.4,tall:.6,glass:1,c:'sp'},
 {k:'fountain',n:'분수대',e:'⛲',p:120000,g:4,emo:1,b:'#b8c8d8',z:.85,c:'sp'},{k:'train',n:'기차 모형',e:'🚂',p:150000,g:4,emo:1,b:'#6a8a5a',z:.62,c:'sp'},
 {k:'trophy',n:'황금 트로피',e:'🏆',p:300000,g:5,emo:1,b:'#3a2a3a',z:.62,glow:1,c:'sp'},{k:'wheel',n:'미니 관람차',e:'🎡',p:500000,g:5,emo:1,b:'#7a8aa8',z:1,c:'sp'},
 {k:'dragon',n:'용 조각상',e:'🐉',p:800000,g:5,emo:1,b:'#4a3a30',z:.86,c:'sp'},{k:'throne',n:'왕좌',e:'👑',p:1500000,g:6,rot:1,seat:1,c:'sit'},
 {k:'galaxy',n:'은하 수족관',e:'🌌',p:2500000,g:6,emo:1,b:'#1a1a3a',z:.5,tall:.5,glass:1,glow:1,c:'sp'},
 /* ---- 테마 세트 (다 놓으면 꾸미기 점수 보너스) ---- */
 {k:'ctable',n:'카페 원탁',e:'☕',p:3500,g:1,as:'table',c1:'#f4efe6',c2:'#5a4a40',cup:1,set:'cafe',c:'sit'},
 {k:'cchair',n:'카페 의자',e:'🪑',p:1800,g:1,rot:1,seat:1,as:'chair',c1:'#7fae6a',c2:'#5a8a4a',set:'cafe',c:'sit'},
 {k:'cboard',n:'메뉴 칠판',e:'📋',p:4000,g:1,rot:1,as:'board',set:'cafe',c:'deco'},
 {k:'csack',n:'원두 자루',e:'🫘',p:2500,g:1,emo:1,b:'#b8925a',z:.42,set:'cafe',c:'deco'},
 {k:'ccup',n:'대형 커피잔',e:'☕',p:8000,g:2,emo:1,b:'#e8d8c8',z:.62,set:'cafe',c:'deco'},
 {k:'skbench',n:'벚꽃 벤치',e:'🌸',p:5000,g:1,rot:1,seat:1,as:'bench',c1:'#ffb8cc',c2:'#e88aa8',set:'spring',c:'sit'},
 {k:'tulip',n:'튤립 화단',e:'🌷',p:2500,g:0,emo:1,b:'#8a5a3a',z:.5,set:'spring',c:'plant'},
 {k:'picnic',n:'피크닉 매트',e:'🧺',p:2000,g:0,flat:1,as:'rug',c1:'#ff9ab0',c2:'#fff4f8',chk:1,set:'spring',c:'deco'},
 {k:'dango',n:'꽃경단 상',e:'🍡',p:3000,g:1,emo:1,b:'#f0d0dc',z:.44,set:'spring',c:'deco'},
 {k:'pond',n:'연꽃 연못',e:'🪷',p:9000,g:2,flat:1,as:'pond',set:'spring',c:'plant'},
 {k:'xtree',n:'크리스마스 트리',e:'🎄',p:12000,g:1,emo:1,b:'#a85a34',z:.9,tree:1,glow:1,set:'winter',c:'plant'},
 {k:'snowman',n:'눈사람',e:'⛄',p:6000,g:1,emo:1,b:'#e8f0f8',z:.72,set:'winter',c:'deco'},
 {k:'gifts',n:'선물 더미',e:'🎁',p:3000,g:0,emo:1,b:'#c8283c',z:.5,set:'winter',c:'deco'},
 {k:'fire',n:'벽난로',e:'🔥',p:15000,g:2,as:'fire',set:'winter',c:'lit'},
 {k:'knit',n:'니트 소파',e:'🛋️',p:7000,g:1,rot:1,seat:1,as:'sofa',c1:'#8cbce8',c2:'#6a9ccc',set:'winter',c:'sit'},
 {k:'bcushion',n:'붕어빵 쿠션',e:'🐟',p:2500,g:0,seat:1,as:'cushion',set:'bungeo',c:'sit'},
 {k:'bcart',n:'붕어빵 수레',e:'🛒',p:8000,g:1,as:'cart',set:'bungeo',c:'deco'},
 {k:'bbag',n:'봉투 진열대',e:'🛍️',p:3500,g:1,emo:1,b:'#d8b890',z:.46,set:'bungeo',c:'deco'},
 {k:'bflag',n:'붕어 깃발',e:'🎏',p:4500,g:1,as:'fflag',set:'bungeo',c:'deco'},
 {k:'bstatue',n:'황금 붕어 동상',e:'🏅',p:40000,g:3,as:'statue',set:'bungeo',c:'sp'}];
const SETS=[{k:'cafe',n:'☕ 카페 세트'},{k:'spring',n:'🌸 봄 소풍 세트'},{k:'winter',n:'❄️ 겨울 세트'},{k:'bungeo',n:'🐟 붕어빵 세트'}];
const SET_BONUS=400;
const FK={};FUR.forEach(f=>FK[f.k]=f);
/* 넓히기: n칸, g=필요 등급, p=가격 */
const ROOM=[{n:4,g:0,p:0},{n:5,g:1,p:8000},{n:6,g:2,p:30000},{n:7,g:4,p:120000},{n:8,g:5,p:400000},{n:9,g:6,p:1200000},{n:10,g:6,p:3000000}];
let N=4,TW=96,TH=48,WH=120,OX=225,OY=320;
/* 칸 크기 고정(5×5 기준 84) + 끌어서 둘러보기. 화면에 다 들어가면(작은 가게) 예전처럼 한눈에.
   FIT=true(🔍 전체 보기)면 작게 줄여서 한눈에. PAN = 끈 만큼 옮긴 거리(화면 밖으로 너무 못 가게 막음) */
const FIX=84,ZMAX=140;let PAN={x:0,y:0},FIT=false,CAN=false,ZM=FIX,LFT=84;
function layout(n,top,bottom,fit){N=n;const ft=Math.min(96,420/N,(bottom-top-40)/(N*.5+1.3));LFT=ft;
 const tw=FIT?ft:Math.max(ft,Math.min(ZMAX,ZM));
 if(fit||tw<=ft+.5){TW=ft;TH=TW/2;WH=Math.round(TW*1.25);OX=225;OY=Math.round(bottom-N*TH-8);if(OY-WH<top+30)OY=top+30+WH;CAN=false;return}
 TW=tw;TH=TW/2;WH=Math.round(TW*1.25);CAN=true;
 /* 처음엔 카운터가 가운데 */
 const cy=(top+bottom)/2+TW*.3;OX=225-TW*.5;OY=Math.round(cy-TH*1.1);
 /* 가게(+양옆 장식·지붕 장식)가 차지하는 칸 → 화면 밖으로 못 나가게 */
 const xL=OX-(N+.6)*TW/2,xR=OX+(N+.4)*TW/2,yT=OY-WH-60,yB=OY+N*TH+TW*.5;
 const cl=(v,a,b)=>a>b?(a+b)/2:Math.max(a,Math.min(b,v));
 PAN.x=cl(PAN.x,450-xR,-xL);PAN.y=cl(PAN.y,bottom-yB,top-yT);OX+=PAN.x;OY+=PAN.y}
const iso=(gx,gy)=>({x:OX+(gx-gy)*TW/2,y:OY+(gx+gy)*TH/2});
const toTile=(x,y)=>{const a=(x-OX)/(TW/2),b=(y-OY)/(TH/2);return{gx:Math.floor((a+b)/2),gy:Math.floor((b-a)/2)}};
const inRoom=(gx,gy,n=N)=>gx>=0&&gy>=0&&gx<n&&gy<n;
const isCounter=(gx,gy)=>gy===0&&(gx===1||gx===2);
/* 꼭 비워 둘 칸: 카운터 앞(계산하는 자리) + 문 앞(오른쪽 아래 구석). 나머지는 손님이 가구를 피해 알아서 걸어요 */
const isPath=(gx,gy,n=N)=>(gy===1&&(gx===1||gx===2))||(gx===n-1&&gy===n-1);
const canPlace=(gx,gy,n=N)=>inRoom(gx,gy,n)&&!isCounter(gx,gy)&&!isPath(gx,gy,n);
/* ---------- 손님 길 찾기 (칸 단위, 상하좌우) ---------- */
const walkF=f=>!!(f&&f.flat&&f.k!=='pond'&&f.as!=='pond'); /* 러그·매트는 밟고 지나가요 */
function blockSet(items,n){const s=new Set();for(const it of items||[]){if(!inRoom(it.x,it.y,n))continue;if(!walkF(FK[it.k]))s.add(it.x+','+it.y)}return s}
function bfs(sx,sy,n,blk,goal){const k=(x,y)=>x+','+y,prev=new Map([[k(sx,sy),null]]),q=[[sx,sy]];
 while(q.length){const [x,y]=q.shift();if(goal(x,y)){const out=[];let c=k(x,y);while(c){const [a,b]=c.split(',').map(Number);out.unshift({gx:a,gy:b});c=prev.get(c)}return out}
  for(const [dx,dy] of [[1,0],[-1,0],[0,1],[0,-1]]){const nx=x+dx,ny=y+dy,nk=k(nx,ny);if(!inRoom(nx,ny,n)||isCounter(nx,ny)||prev.has(nk))continue;
   if(blk.has(nk)&&!goal(nx,ny))continue;prev.set(nk,k(x,y));q.push([nx,ny])}}return null}
const DOOR=n=>({gx:n-1,gy:n-1});
/* 문 → 카운터 앞 길 (칸 목록). 막혔으면 null */
function mainRoute(items,n=N){const d=DOOR(n),b=blockSet(items,n);b.delete(d.gx+','+d.gy);return bfs(d.gx,d.gy,n,b,(x,y)=>x===2&&y===1)}
/* 문에서 갈 수 있는 의자인지 */
function seatOk(items,seat,n=N){const d=DOOR(n),b=blockSet(items,n);return!!bfs(d.gx,d.gy,n,b,(x,y)=>x===seat.x&&y===seat.y)}
/* 가구를 (gx,gy)에 놓아도 되는지: 문↔카운터 길이 안 막히면 OK. 움직이는 가구(mv)는 빼고 계산 */
function okPlace(items,gx,gy,k,mv,n=N){if(!canPlace(gx,gy,n))return false;if(walkF(FK[k]))return true;const its=items.filter(it=>it!==mv).concat([{k,x:gx,y:gy}]);return!!mainRoute(its,n)}
function blockedSeats(items,n=N){return items.filter(it=>FK[it.k]&&FK[it.k].seat&&inRoom(it.x,it.y,n)&&!seatOk(items,it,n)).length}
const ctr=p=>({x:p.gx+.5,y:p.gy+.5});
/* ---------- 기본 도형 ---------- */
function poly(pts,fill,stroke,lw=1.5){cx.beginPath();pts.forEach((p,i)=>i?cx.lineTo(p.x,p.y):cx.moveTo(p.x,p.y));cx.closePath();if(fill){cx.fillStyle=fill;cx.fill()}if(stroke){cx.strokeStyle=stroke;cx.lineWidth=lw;cx.stroke()}}
const up=(p,h)=>({x:p.x,y:p.y-h});
function box(gx,gy,m,h,col,o={}){const T=iso(gx+m,gy+m),Rr=iso(gx+1-m,gy+m),B=iso(gx+1-m,gy+1-m),L=iso(gx+m,gy+1-m);const z=o.z||0;
 const T0=up(T,z),R0=up(Rr,z),B0=up(B,z),L0=up(L,z),T1=up(T,z+h),R1=up(Rr,z+h),B1=up(B,z+h),L1=up(L,z+h);const ln=o.line||dark(col,.55),lw=Math.max(1.6,TW*.026);
 poly([L0,B0,B1,L1],dark(col,.12),ln,lw);poly([B0,R0,R1,B1],dark(col,.24),ln,lw);poly([T1,R1,B1,L1],o.top||lite(col,.08),ln,lw);return{T:T1,R:R1,B:B1,L:L1,c:{x:(T1.x+B1.x)/2,y:(T1.y+B1.y)/2}}}
function panel(gx,gy,d,m,z,h,col){const T=iso(gx+m,gy+m),Rr=iso(gx+1-m,gy+m),B=iso(gx+1-m,gy+1-m),L=iso(gx+m,gy+1-m);const E=[[T,Rr],[L,T],[Rr,B],[B,L]][d];
 poly([up(E[0],z),up(E[1],z),up(E[1],z+h),up(E[0],z+h)],d>=2?dark(col,.1):col,dark(col,.55),Math.max(1.6,TW*.026))}
function shadow(x,y,w){cx.fillStyle='rgba(0,0,0,.16)';cx.beginPath();cx.ellipse(x,y,w,w*.45,0,0,7);cx.fill()}
/* ---------- 가구 ---------- */
/* 스티커 이모지: 캐릭터 그림처럼 흰 테두리 + 그림자 (크기별로 한 번만 만들어 둬요) */
const STK={};
function stk(e,z){z=Math.max(8,Math.round(z));const k=e+'|'+z;let c=STK[k];if(c)return c;
 const pad=Math.ceil(z*.14)+2,S=Math.ceil(z*1.4)+pad*2,a=document.createElement('canvas');a.width=a.height=S;const ax=a.getContext('2d');ax.font=z+'px '+A.E;ax.textAlign='center';ax.textBaseline='middle';ax.fillText(e,S/2,S/2);
 c=document.createElement('canvas');c.width=c.height=S;const x=c.getContext('2d'),r=Math.max(2,z*.07);
 for(let i=0;i<12;i++){const an=i/12*Math.PI*2;x.drawImage(a,Math.cos(an)*r,Math.sin(an)*r)}
 x.globalCompositeOperation='source-in';x.fillStyle='#fff';x.fillRect(0,0,S,S);x.globalCompositeOperation='source-over';
 x.globalAlpha=.18;x.drawImage(c,0,0);x.globalAlpha=1;x.drawImage(a,0,0);STK[k]=c;return c}
function emS(e,x,y,z,al=1){const c=stk(e,z);cx.globalAlpha=al;cx.drawImage(c,x-c.width/2,y-c.height/2);cx.globalAlpha=1}
const OL='#5a3a22';
/* 가구 놓을 때 통통 (보이기만, 저장 안 해요) */
const BNC=new WeakMap();function bounce(it){if(it)BNC.set(it,performance.now())}
const LASTS=new WeakMap();
function drawB(it,t,sel){const b=BNC.get(it);if(b!=null){const u=(performance.now()-b)/480;if(u<1){const c=iso(it.x+.5,it.y+.5),sy=1+Math.sin(u*Math.PI*3)*.2*(1-u),sx=1-(sy-1)*.6,dy=-Math.max(0,Math.sin(u*Math.PI*1.5))*TH*.5*(1-u);cx.save();cx.translate(c.x,c.y+TH*.25);cx.scale(sx,sy);cx.translate(-c.x,-c.y-TH*.25+dy);drawItem(it,t,sel);cx.restore();return}BNC.delete(it)}drawItem(it,t,sel)}
function drawItem(it,t,sel){const gx=it.x,gy=it.y,d=it.d|0,c=iso(gx+.5,gy+.5),s=TW/78,F=FK[it.k]||{},kind=F.as||it.k,lw=Math.max(1.6,TW*.026);
 switch(kind){
 case'table':{shadow(c.x,c.y+2,TW*.28);const top=F.c1||'#d89a5e',base=F.c2||'#8a5a3a';const p=box(gx,gy,.38,TW*.22,base);cx.fillStyle=top;cx.strokeStyle=OL;cx.lineWidth=lw;cx.beginPath();cx.ellipse(p.c.x,p.c.y-2,TW*.33,TH*.33,0,0,7);cx.fill();cx.stroke();
  cx.fillStyle='rgba(255,255,255,.35)';cx.beginPath();cx.ellipse(p.c.x-TW*.08,p.c.y-5,TW*.12,TH*.08,0,0,7);cx.fill();
  emS('☕',p.c.x+7*s,p.c.y-8*s,15*s);if(!F.cup)emS('🐟',p.c.x-9*s,p.c.y-4*s,13*s);break}
 case'chair':{shadow(c.x,c.y+2,TW*.2);const sc=F.c1||'#e09a5a',bc=F.c2||'#b8743f',back=d<2;if(back)panel(gx,gy,d,.28,TW*.14,TW*.24,bc);box(gx,gy,.28,TW*.14,sc);if(!back)panel(gx,gy,d,.28,TW*.14,TW*.18,bc);break}
 case'sofa':{shadow(c.x,c.y+2,TW*.34);const sc=F.c1||'#f08aa0',bc=F.c2||'#d8667e';if(d<2)panel(gx,gy,d,.1,TW*.12,TW*.22,bc);box(gx,gy,.12,TW*.14,sc);if(d>=2)panel(gx,gy,d,.1,TW*.12,TW*.14,bc);break}
 case'bench':{shadow(c.x,c.y+2,TW*.34);const sc=F.c1||'#c08a56',bc=F.c2||'#9a6a3e';if(d<2)panel(gx,gy,d,.12,TW*.13,TW*.16,bc);box(gx,gy,.14,TW*.12,sc);if(d>=2)panel(gx,gy,d,.12,TW*.12,TW*.12,bc);if(F.set==='spring')emS('🌸',c.x,c.y-TW*.3,TW*.2);break}
 case'plant':{shadow(c.x,c.y+2,TW*.18);const p=box(gx,gy,.34,TW*.14,'#d8744a');emS('🪴',p.c.x,p.c.y-TW*.22,TW*.5);break}
 case'tree':{shadow(c.x,c.y+2,TW*.24);const p=box(gx,gy,.3,TW*.16,'#b8643c');emS('🌳',p.c.x,p.c.y-TW*.42+Math.sin(t*1.5+gx)*1,TW*.9);break}
 case'lamp':{shadow(c.x,c.y+2,TW*.14);cx.fillStyle=OL;cx.fillRect(c.x-2.5,c.y-TW*.62,5,TW*.62);const gl=cx.createRadialGradient(c.x,c.y-TW*.7,2,c.x,c.y-TW*.7,TW*.6);gl.addColorStop(0,'rgba(255,220,140,'+(.45+.1*Math.sin(t*3))+')');gl.addColorStop(1,'rgba(255,220,140,0)');cx.fillStyle=gl;cx.beginPath();cx.arc(c.x,c.y-TW*.7,TW*.6,0,7);cx.fill();emS('🏮',c.x,c.y-TW*.72,TW*.42);break}
 case'shelf':{shadow(c.x,c.y+2,TW*.34);box(gx,gy,.12,TW*.5,'#a8744a',{top:'#c8925e'});for(let r=0;r<2;r++)for(let q=0;q<3;q++){const u=(q+.5)/3,a=d%2?iso(gx+.12,gy+.12+u*.76):iso(gx+.12+u*.76,gy+.88);emS(['🥐','🍞','🐟'][(q+r)%3],a.x+(d%2?TW*.1:-TW*.04),a.y-TW*(.14+r*.18),TW*.2)}break}
 case'tank':{shadow(c.x,c.y+2,TW*.3);box(gx,gy,.16,TW*.08,'#6a5a50');box(gx,gy,.18,TW*.36,'#9fd8f0',{z:TW*.08,top:'rgba(200,240,255,.9)',line:'#4a8aa8'});emS('🐠',c.x+Math.sin(t*1.2+gx)*TW*.14,c.y-TW*.28,TW*.22);emS('🐟',c.x-Math.sin(t*1.5)*TW*.1,c.y-TW*.18,TW*.16);break}
 case'piano':{shadow(c.x,c.y+2,TW*.34);const p=box(gx,gy,.12,TW*.34,'#2e2a2e',{top:'#3e3a40',line:'#111'});const E=[[p.T,p.R],[p.L,p.T],[p.R,p.B],[p.B,p.L]][d];cx.strokeStyle='#fff';cx.lineWidth=TW*.07;cx.beginPath();cx.moveTo((E[0].x*3+p.c.x)/4,(E[0].y*3+p.c.y)/4);cx.lineTo((E[1].x*3+p.c.x)/4,(E[1].y*3+p.c.y)/4);cx.stroke();emS('🎵',p.c.x+Math.sin(t*2)*6,p.c.y-TW*.35-m2(t*20,14),TW*.18,.85);break}
 case'rug':{const a1=F.c1||'#e06a6a',a2=F.c2||'#f6c070';poly([iso(gx+.06,gy+.06),iso(gx+.94,gy+.06),iso(gx+.94,gy+.94),iso(gx+.06,gy+.94)],a1,OL,lw);
  if(F.chk){for(let i=0;i<4;i++)for(let j=0;j<4;j++)if((i+j)%2)poly([iso(gx+.06+i*.22,gy+.06+j*.22),iso(gx+.28+i*.22,gy+.06+j*.22),iso(gx+.28+i*.22,gy+.28+j*.22),iso(gx+.06+i*.22,gy+.28+j*.22)],a2)}
  else poly([iso(gx+.22,gy+.22),iso(gx+.78,gy+.22),iso(gx+.78,gy+.78),iso(gx+.22,gy+.78)],a2);break}
 case'bear':{shadow(c.x,c.y+2,TW*.16);emS('🧸',c.x,c.y-TW*.2,TW*.46);break}
 case'throne':{shadow(c.x,c.y+2,TW*.32);if(d<2)panel(gx,gy,d,.14,TW*.16,TW*.46,'#d8304a');box(gx,gy,.16,TW*.16,'#e0b030',{top:'#f05060'});if(d>=2)panel(gx,gy,d,.14,TW*.16,TW*.2,'#d8304a');emS('👑',c.x,c.y-TW*.62,TW*.3);break}
 case'stand':{shadow(c.x,c.y+2,TW*.18);cx.fillStyle=OL;cx.fillRect(c.x-TW*.16,c.y-TW*.2,3,TW*.2);cx.fillRect(c.x+TW*.14,c.y-TW*.2,3,TW*.2);rr(c.x-TW*.24,c.y-TW*.62,TW*.48,TW*.44,8,'#fff3dc');cx.strokeStyle=OL;cx.lineWidth=lw;cx.beginPath();cx.roundRect(c.x-TW*.24,c.y-TW*.62,TW*.48,TW*.44,8);cx.stroke();A.fish2(c.x,c.y-TW*.42,TW*.0042,'#f0b850',{plain:true});tx('붕어빵',c.x,c.y-TW*.26,Math.max(9,TW*.13),'#8a3a1a','center','#fff3dc');break}
 /* ---- 세트 전용 모양 ---- */
 case'board':{shadow(c.x,c.y+2,TW*.2);cx.strokeStyle=OL;cx.lineWidth=lw*1.4;cx.beginPath();cx.moveTo(c.x-TW*.18,c.y);cx.lineTo(c.x-TW*.1,c.y-TW*.66);cx.moveTo(c.x+TW*.18,c.y);cx.lineTo(c.x+TW*.1,c.y-TW*.66);cx.stroke();
  const x0=c.x-TW*.25,y0=c.y-TW*.72,w=TW*.5,h=TW*.46;rr(x0,y0,w,h,6,'#2f4a3a');cx.strokeStyle='#a8744a';cx.lineWidth=lw*1.6;cx.beginPath();cx.roundRect(x0,y0,w,h,6);cx.stroke();
  tx('오늘의',c.x,y0+h*.24,Math.max(8,TW*.1),'#fff','center','#2f4a3a');tx('커피 ☕',c.x,y0+h*.55,Math.max(9,TW*.12),'#ffe9a0','center','#2f4a3a');cx.strokeStyle='rgba(255,255,255,.5)';cx.lineWidth=1;cx.beginPath();cx.moveTo(x0+w*.2,y0+h*.8);cx.lineTo(x0+w*.8,y0+h*.8);cx.stroke();break}
 case'pond':{const P=[iso(gx+.08,gy+.5),iso(gx+.5,gy+.08),iso(gx+.92,gy+.5),iso(gx+.5,gy+.92)];cx.fillStyle='#8a7a6a';cx.strokeStyle=OL;cx.lineWidth=lw;cx.beginPath();cx.ellipse(c.x,c.y,TW*.44,TH*.44,0,0,7);cx.fill();cx.stroke();
  const g=cx.createRadialGradient(c.x,c.y,2,c.x,c.y,TW*.4);g.addColorStop(0,'#bfe8ff');g.addColorStop(1,'#6ab0e0');cx.fillStyle=g;cx.beginPath();cx.ellipse(c.x,c.y,TW*.37,TH*.37,0,0,7);cx.fill();
  cx.strokeStyle='rgba(255,255,255,.6)';cx.lineWidth=1.2;const rp=m2(t*.6,1);cx.globalAlpha=1-rp;cx.beginPath();cx.ellipse(c.x+TW*.08,c.y,TW*.08+rp*TW*.15,TH*.08+rp*TH*.15,0,0,7);cx.stroke();cx.globalAlpha=1;emS('🪷',c.x-TW*.1,c.y-TW*.06,TW*.26);emS('🪷',c.x+TW*.14,c.y+TW*.03,TW*.18);break}
 case'fire':{shadow(c.x,c.y+2,TW*.32);const p=box(gx,gy,.14,TW*.46,'#c8664a',{top:'#8a4a3a'});const fx_=p.c.x,fy=p.c.y+TW*.12;rr(fx_-TW*.16,fy-TW*.12,TW*.32,TW*.24,TW*.1,'#2a1a14');
  const g=cx.createRadialGradient(fx_,fy,2,fx_,fy,TW*.5);g.addColorStop(0,'rgba(255,170,60,'+(.5+.15*Math.sin(t*9))+')');g.addColorStop(1,'rgba(255,170,60,0)');cx.fillStyle=g;cx.beginPath();cx.arc(fx_,fy,TW*.5,0,7);cx.fill();
  emS('🔥',fx_,fy-TW*.02+Math.sin(t*12)*1.2,TW*.24);emS('🧦',p.c.x-TW*.12,p.c.y-TW*.22,TW*.14);emS('🧦',p.c.x+TW*.12,p.c.y-TW*.22,TW*.14);break}
 case'cushion':{shadow(c.x,c.y+2,TW*.28);cx.fillStyle='#e8a848';cx.strokeStyle=OL;cx.lineWidth=lw;cx.beginPath();cx.ellipse(c.x,c.y-TW*.04,TW*.32,TH*.3,0,0,7);cx.fill();cx.stroke();
  A.fish2(c.x,c.y-TW*.1,TW*.0048,'#f6c060',{plain:true});break}
 case'cart':{shadow(c.x,c.y+2,TW*.34);const p=box(gx,gy,.14,TW*.3,'#c88a4e',{z:TW*.08});for(const q of [iso(gx+.2,gy+.85),iso(gx+.8,gy+.85),iso(gx+.85,gy+.2)]){cx.fillStyle='#5a4a40';cx.strokeStyle=OL;cx.lineWidth=lw;cx.beginPath();cx.arc(q.x,q.y-TW*.06,TW*.09,0,7);cx.fill();cx.stroke()}
  for(let i=0;i<3;i++)A.fish2(p.c.x-TW*.16+i*TW*.16,p.c.y-TW*.05,TW*.0028,'#f0b850',{plain:true});
  const ty=p.c.y-TW*.62;for(let i=0;i<6;i++){cx.fillStyle=i%2?'#fff':'#e8584a';cx.fillRect(p.c.x-TW*.3+i*TW*.1,ty,TW*.1,TW*.1)}cx.strokeStyle=OL;cx.lineWidth=lw;cx.strokeRect(p.c.x-TW*.3,ty,TW*.6,TW*.1);cx.beginPath();cx.moveTo(p.c.x-TW*.28,ty+TW*.1);cx.lineTo(p.c.x-TW*.28,p.c.y-TW*.1);cx.moveTo(p.c.x+TW*.28,ty+TW*.1);cx.lineTo(p.c.x+TW*.28,p.c.y-TW*.1);cx.stroke();
  for(let i=0;i<2;i++){const ph=m2(t*.8+i*.5,1);cx.fillStyle='rgba(255,255,255,'+(.5*(1-ph))+')';cx.beginPath();cx.ellipse(p.c.x-TW*.1+i*TW*.2,p.c.y-TW*.15-ph*TW*.3,3+ph*4,2+ph*3,0,0,7);cx.fill()}break}
 case'fflag':{shadow(c.x,c.y+2,TW*.12);box(gx,gy,.38,TW*.06,'#8a7a6a');cx.fillStyle=OL;cx.fillRect(c.x-2,c.y-TW*1.05,4,TW*1.05);for(let i=0;i<3;i++){cx.save();cx.translate(c.x+TW*.16,c.y-TW*(.9-i*.22));cx.rotate(Math.sin(t*3+i)*.18);A.fish2(0,0,TW*.0034,['#ff8a6a','#ffcf3a','#6cc8ff'][i],{plain:true});cx.restore()}break}
 case'statue':{shadow(c.x,c.y+2,TW*.3);const p=box(gx,gy,.2,TW*.26,'#b8b4ac',{top:'#d8d4cc'});const g=cx.createRadialGradient(p.c.x,p.c.y-TW*.4,2,p.c.x,p.c.y-TW*.4,TW*.6);g.addColorStop(0,'rgba(255,220,80,'+(.4+.1*Math.sin(t*3))+')');g.addColorStop(1,'rgba(255,220,80,0)');cx.fillStyle=g;cx.beginPath();cx.arc(p.c.x,p.c.y-TW*.4,TW*.6,0,7);cx.fill();
  A.fish2(p.c.x,p.c.y-TW*.38+Math.sin(t*1.6)*2,TW*.0075,'#ffcf3a',{glow:'rgba(255,220,80,.8)'});break}
 default:{const f=FK[it.k];if(!f||!f.emo)break;shadow(c.x,c.y+2,TW*.3);const h=TW*(f.tall||.1);const p=box(gx,gy,f.tall?.14:.3,h,f.b,f.glass?{top:'rgba(220,240,255,.85)'}:{});
  if(f.pole){cx.fillStyle=OL;cx.fillRect(c.x-2,c.y-TW*.9,4,TW*.9)}
  if(f.glow){const g=cx.createRadialGradient(p.c.x,p.c.y-TW*.3,2,p.c.x,p.c.y-TW*.3,TW*.55);g.addColorStop(0,'rgba(255,230,150,'+(.4+.1*Math.sin(t*3))+')');g.addColorStop(1,'rgba(255,230,150,0)');cx.fillStyle=g;cx.beginPath();cx.arc(p.c.x,p.c.y-TW*.3,TW*.55,0,7);cx.fill()}
  const sway=f.tree||f.pole?Math.sin(t*1.5+gx)*1.2:0;emS(f.e,p.c.x+sway,p.c.y-TW*f.z*.5-(f.pole?TW*.5:0)+(f.glass?TW*.12:0),TW*f.z)}
 }
 if(sel){cx.globalAlpha=.6+.4*Math.sin(t*6);poly([iso(gx,gy),iso(gx+1,gy),iso(gx+1,gy+1),iso(gx,gy+1)],null,'#ffc94a',3);cx.globalAlpha=1}}
/* 꾸미기 카드용 작은 그림: 168×168 캔버스로 만든 ISO에서 불러요 (가구 하나를 타일 위에) */
function thumb(k){const f=FK[k];if(!f)return'';const C=cx.canvas,S=C.width;cx.clearRect(0,0,S,S);
 N=1;TW=Math.round(S*.6);TH=TW/2;WH=Math.round(TW*1.25);OX=S/2;OY=Math.round(S*.62);
 drawItem({k,x:0,y:0,d:f.rot?1:0},0,false);
 /* 그림이 있는 곳만 잘라서 카드에 꽉 차게 */
 try{const D=cx.getImageData(0,0,S,S).data;let x0=S,y0=S,x1=-1,y1=-1;for(let y=0;y<S;y++)for(let x=0;x<S;x++)if(D[(y*S+x)*4+3]>10){if(x<x0)x0=x;if(x>x1)x1=x;if(y<y0)y0=y;if(y>y1)y1=y}
  if(x1<0)return C.toDataURL();const pd=4;x0=Math.max(0,x0-pd);y0=Math.max(0,y0-pd);x1=Math.min(S-1,x1+pd);y1=Math.min(S-1,y1+pd);const o=document.createElement('canvas');o.width=x1-x0+1;o.height=y1-y0+1;o.getContext('2d').drawImage(C,x0,y0,o.width,o.height,0,0,o.width,o.height);return o.toDataURL()}catch(e){return''}}
/* ---------- 손님 (꾸밈용으로 걸어다녀요) ---------- */
let cust=[],spawnT=1.5,nid=1,fx=[];const AN=BP2.R.an;
const tileOf=c=>({gx:Math.max(0,Math.min(N-1,Math.floor(c.x))),gy:Math.max(0,Math.min(N-1,Math.floor(c.y)))});
/* 지금 자리에서 가구를 피해 문까지 → 밖으로 */
function pathOut(items,c){const s=c?tileOf(c):{gx:2,gy:1},r=bfs(s.gx,s.gy,N,blockSet(items,N),(x,y)=>x===N-1&&y===N-1);return[...(r||[]).slice(1).map(ctr),{x:N-.5,y:N-.5},{x:N+1.3,y:N-.5}]}
function queuePts(items){const r=mainRoute(items),P=r?[{x:2,y:1.5},...r.slice().reverse().map(ctr),{x:N+1.3,y:N-.5}]:[{x:2,y:1.5},{x:N-.5,y:1.5},{x:N-.5,y:N-.5},{x:N+1.3,y:N-.5}],out=[];
 for(let i=0;i<8;i++){let dist=i*.9,p=null;for(let j=0;j<P.length-1;j++){const a=P[j],b=P[j+1],L=Math.hypot(b.x-a.x,b.y-a.y);if(dist<=L){p={x:a.x+(b.x-a.x)*dist/L,y:a.y+(b.y-a.y)*dist/L};break}dist-=L}out.push(p||P[P.length-1])}return out}
/* 줄 서는 길(카운터 앞 → 문 → 밖): 손님은 이 선을 따라서만 움직여요 (가구를 뚫고 가로질러 가지 않게) */
function qLine(items){const r=mainRoute(items),P=r?[{x:2,y:1.5},...r.slice().reverse().map(ctr),{x:N+1.6,y:N-.5}]:[{x:2,y:1.5},{x:N-.5,y:1.5},{x:N-.5,y:N-.5},{x:N+1.6,y:N-.5}],C=[0];
 for(let j=0;j<P.length-1;j++)C.push(C[j]+Math.hypot(P[j+1].x-P[j].x,P[j+1].y-P[j].y));return{P,C,L:C[C.length-1]}}
function qAt(q,d){d=Math.max(0,Math.min(q.L,d));for(let j=0;j<q.P.length-1;j++){if(d<=q.C[j+1]||j===q.P.length-2){const L=q.C[j+1]-q.C[j]||1,u=Math.max(0,Math.min(1,(d-q.C[j])/L)),a=q.P[j],b=q.P[j+1];return{x:a.x+(b.x-a.x)*u,y:a.y+(b.y-a.y)*u}}}return q.P[0]}
/* 손님 수: 가게가 클수록 북적 (4×4 4명 → 10×10 12명) */
const CAP=()=>N<=4?4:Math.min(12,4+Math.round((N-4)*1.35));
function say(c,t){c.bub=t;c.bt=2}
function step(dt,items,rate=1){spawnT-=dt*rate;if(spawnT<=0){if(cust.length<CAP())cust.push({id:nid++,an:AN[Math.floor(Math.random()*AN.length)],x:N+1.6,y:N-.5,st:'q',route:[],t:0,sh:['#7ec8ff','#ff9ab0','#9ad870','#ffd23a','#b48aff'][nid%5]});spawnT=(2.6+Math.random()*2.6)*Math.min(1,6/CAP())}
 /* 빈 자리 중 무작위 (방금 누가 일어난 자리는 덜 골라요) */
 const seats=items.filter(it=>FK[it.k]&&FK[it.k].seat&&inRoom(it.x,it.y));const free=()=>{const L=seats.filter(ch=>!cust.some(c=>c.seat===ch)&&seatOk(items,ch));if(!L.length)return undefined;const now=performance.now(),w=L.map(ch=>{const u=LASTS.get(ch);return u&&now-u<20000?.25:1}),tot=w.reduce((a,b)=>a+b,0);let r=Math.random()*tot;for(let i=0;i<L.length;i++){r-=w[i];if(r<=0)return L[i]}return L[L.length-1]};
 const QL=qLine(items),inQ=cust.filter(c=>c.st==='q');
 inQ.forEach((c,i)=>{if(c.qd==null)c.qd=QL.L;c.qd=Math.min(c.qd,QL.L);const tg=Math.min(i*.9,QL.L),old=c.qd;if(c.qd>tg)c.qd=Math.max(tg,c.qd-1.6*dt);const p=qAt(QL,c.qd);c.x=p.x;c.y=p.y;c.mv=c.qd!==old?1:0;c.route=[]});
 for(const c of cust){c.t+=dt;if(c.bt>0)c.bt-=dt;
  /* 앉으려던 의자가 치워지거나 옮겨지면 → 나가요 */
  if(c.seat&&(!items.includes(c.seat)||c.sx!==c.seat.x||c.sy!==c.seat.y)){c.seat=null;if(c.st==='sit'||c.st==='go'){c.st='out';c.route=pathOut(items,c)}}
  if(c.st==='q'){if(inQ[0]===c&&c.qd<=.02){c.w=(c.w||0)+dt;if(c.w>.3&&!c.asked){c.asked=1;say(c,'🐟 하나 주세요!')}if(c.w>1.8){c.st='buy';c.w=0}}}
  else if(c.st==='buy'){c.w+=dt;if(c.w>.6&&!c.paid){c.paid=1;say(c,'💖 고마워요!');const p=iso(c.x,c.y);fx.push({e:'🪙',x:p.x,y:p.y-TW*.9,l:1})}
   if(c.w>1.2){const ch=free(),s=tileOf(c),r=ch&&bfs(s.gx,s.gy,N,blockSet(items,N),(x,y)=>x===ch.x&&y===ch.y);
    if(r){c.seat=ch;c.sx=ch.x;c.sy=ch.y;c.st='go';c.route=r.slice(1).map(ctr)}else{c.st='out';c.route=pathOut(items,c)}}}
  else if(c.st==='go'&&!c.route.length){c.st='sit';c.w=0;say(c,['😋 맛있다!','😊 여기 좋네요','🥰 분위기 최고'][c.id%3])}
  else if(c.st==='sit'){c.w+=dt;if(c.w>4.5){c.st='out';c.route=pathOut(items,c);if(c.seat)LASTS.set(c.seat,performance.now());c.seat=null;say(c,'또 올게요 👋')}}
  if(c.st!=='sit'&&c.route.length){const tg=c.route[0],dx=tg.x-c.x,dy=tg.y-c.y,L=Math.hypot(dx,dy),sp=1.6*dt;if(L<=sp){c.x=tg.x;c.y=tg.y;c.route.shift()}else{c.x+=dx/L*sp;c.y+=dy/L*sp;c.mv=1}}else if(c.st!=='q')c.mv=0}
 cust=cust.filter(c=>!(c.st==='out'&&!c.route.length));for(const f of fx)f.l-=dt;fx=fx.filter(f=>f.l>0)}
function reset(){cust=[];spawnT=1.2}
function bubble(x,y,t,a){cx.globalAlpha=a;cx.font='bold 13px "Jua","Noto Sans KR",sans-serif';const w=cx.measureText(t).width+16;rr(x-w/2,y-12,w,24,12,'#fff');cx.beginPath();cx.moveTo(x-5,y+11);cx.lineTo(x,y+17);cx.lineTo(x+5,y+11);cx.closePath();cx.fillStyle='#fff';cx.fill();tx(t,x,y,13,'#5a3a22','center','#fff');cx.globalAlpha=1}
function drawCust(c,t){const p=iso(c.x,c.y),sz=TW*.38,bob=c.mv?Math.abs(Math.sin(c.t*11))*3:0;let y=p.y-sz*.88-bob;if(c.st==='sit')y-=TW*.12;
 shadow(p.x,p.y,sz*.34);animal(c.an,p.x,y,sz,{walk:c.mv?c.t*10+c.id:null,t,ph:c.id,mood:c.st==='sit'||c.paid?'h':'n',shirt:c.sh});if(c.st==='sit')em('🐟',p.x+sz*.42,y+sz*.5,sz*.32);
 if(c.bub&&c.bt>0)bubble(p.x,y-sz*.75,c.bub,Math.min(1,c.bt*3))}
/* ---------- 마스코트: 가게 안을 천천히 돌아다녀요 ---------- */
const pet={x:.5,y:2.5,tx:.5,ty:2.5,w:0};
function petStep(dt,items){const sp=.6*dt,dx=pet.tx-pet.x,dy=pet.ty-pet.y,L=Math.hypot(dx,dy);if(L>sp){pet.x+=dx/L*sp;pet.y+=dy/L*sp;pet.mv=1}else{pet.mv=0;pet.w-=dt;if(pet.w<=0){pet.w=2+Math.random()*3;for(let k=0;k<12;k++){const gx=Math.floor(Math.random()*N),gy=Math.floor(Math.random()*N);if(canPlace(gx,gy)&&!items.some(it=>it.x===gx&&it.y===gy)){pet.tx=gx+.5;pet.ty=gy+.5;break}}}}}
function drawPet(look,t){const p=iso(pet.x,pet.y),b=pet.mv?Math.abs(Math.sin(t*10))*3:Math.sin(t*2)*1.5;if(look.mas.e==='🌟'){A.fish2(p.x,p.y-TW*.4-b,TW*.005,'#ffcf3a',{glow:'#ffe066'});return}shadow(p.x,p.y,TW*.12);em(look.mas.e,p.x,p.y-TW*.17-b,TW*.3)}
/* ---------- 꾸밈 칸 그리기 ---------- */
const WP=[null,null,null,null,'brick','plank','tile','marble','gold'];
const FLR=[['#cfc9bd','#c4beb2',0],['#f6f0e4','#d2a46a',1],['#d8a86c','#c99a5e',2],['#9ed27a','#8cc46a',3],['#bdb7aa','#a8a296',4],['#c8283c','#b01e30',5],['#9ad0ff','#c8a8ff',6]];
const AWC=[['#e8584a','#fff6ec'],['#4a8ae8','#fff6ec'],['#4ab86a','#fff6ec'],['#ff8ab0','#fff0f6'],['#ffcf3a','#fff6ec'],['rb'],['#2a3a7a','#ffd23a'],['#ffb0c8','#fff0f6'],['#d4a020','#fff3c0']];
const RB=['#ff5a5a','#ff9a3a','#ffd93a','#6ccf5a','#4aa8ff','#a85aff'];
/* 먼 동네 (하늘이 비어 보이지 않게): 언덕 + 건물 실루엣, 밤엔 창문 불빛 */
function skyline(look,t){const Lc=iso(0,N),hz=OY+(Lc.y-OY)*.2,nt=look.night;
 cx.fillStyle=nt?'rgba(60,80,120,.55)':'rgba(170,215,160,.55)';cx.beginPath();cx.ellipse(90,hz+8,190,46,0,Math.PI,0);cx.ellipse(380,hz+10,170,38,0,Math.PI,0);cx.fill();
 for(let i=0;i<14;i++){const w=22+(i*37)%26,h=26+(i*53)%58,x=-8+i*34+(i%3)*4,y=hz-h;cx.fillStyle=nt?'rgba(40,52,90,.8)':'rgba(255,255,255,'+(.32+(i%3)*.08)+')';cx.beginPath();cx.roundRect(x,y,w,h+12,[5,5,0,0]);cx.fill();
  if(nt){cx.fillStyle='rgba(255,220,120,.85)';for(let r=0;r<Math.floor(h/14);r++)for(let q=0;q<2;q++)if((i+r*3+q)%3)cx.fillRect(x+5+q*(w-14),y+6+r*14,4,5)}}}
function drawSky(look,t){const g=cx.createLinearGradient(0,0,0,OY);g.addColorStop(0,look.sky[0]);g.addColorStop(1,look.sky[1]);cx.fillStyle=g;cx.fillRect(0,0,W,800);skyline(look,t);
 if(look.night){cx.fillStyle='#fff';for(let i=0;i<30;i++){cx.globalAlpha=.4+.6*Math.abs(Math.sin(t*1.5+i));cx.beginPath();cx.arc((i*97)%W,(i*53)%Math.max(60,OY-WH-20)+60,1.4,0,7);cx.fill()}cx.globalAlpha=1;em('🌙',380,110,34)}
 else{em('☀️',385,120,46);cx.fillStyle='rgba(255,255,255,.8)';for(let i=0;i<4;i++){const x=m2(t*5+i*130,560)-60;cx.beginPath();cx.ellipse(x,100+i*16,30,9,0,0,7);cx.fill()}}
 if(look.lit===5){for(let b=0;b<3;b++){const g2=cx.createLinearGradient(0,60,0,OY);const c=['120,255,200','180,120,255','120,200,255'][b];g2.addColorStop(0,'rgba('+c+',0)');g2.addColorStop(.5,'rgba('+c+','+(.18+.08*Math.sin(t+b))+')');g2.addColorStop(1,'rgba('+c+',0)');cx.fillStyle=g2;const x=60+b*130+Math.sin(t*.7+b)*30;cx.beginPath();cx.moveTo(x,60);cx.lineTo(x+70,60);cx.lineTo(x+120,OY);cx.lineTo(x+20,OY);cx.closePath();cx.fill()}}
 if(look.top===6){const cl=['255,90,120','255,200,60','120,220,255','160,255,140'];for(let b=0;b<4;b++){const ph=m2(t*.6+b*.27,1),bx=60+b*110,by=110+(b%2)*30,cc=cl[b];if(ph<.8){const u=ph/.8,rad=12+u*40;cx.fillStyle='rgba('+cc+','+(1-u)+')';for(let i=0;i<14;i++){const a=i/14*Math.PI*2;cx.beginPath();cx.arc(bx+Math.cos(a)*rad,by+Math.sin(a)*rad+u*u*12,2.4,0,7);cx.fill()}}}}}
function drawGround(look,t){const ground=look.night?'#6f9a62':'#a8d890',Rc=iso(N,0),Bc=iso(N,N),Lc=iso(0,N);
 cx.fillStyle=ground;cx.beginPath();cx.moveTo(0,OY+(Lc.y-OY)*.2);cx.lineTo(W,OY+(Rc.y-OY)*.2);cx.lineTo(W,800);cx.lineTo(0,800);cx.closePath();cx.fill();
 /* 인도 */
 poly([iso(N,N-1),iso(N+3,N-1),iso(N+3,N),iso(N,N)],'#d8cbb6','#bba98e');for(let k=0;k<3;k++)poly([iso(N+k,N-1),iso(N+k+1,N-1),iso(N+k+1,N),iso(N+k,N)],null,'rgba(120,100,80,.25)',1);
}
/* 마당 장식 (왼쪽·오른쪽): 가게 앞마당 양쪽, 바닥보다 앞에 그려서 잘리지 않게 (화면 밖으로도 덜 나가요) */
const SIDE_L=()=>({gx:Math.min(2.2,N*.3),gy:N+1.05}),SIDE_R=()=>({gx:N+1.05,gy:Math.min(2.2,N*.3)});
function drawSide(it,g){if(!it||!it.sz)return;const p=iso(g.gx,g.gy);shadow(p.x,p.y,it.sz*.3);const z=it.sz*TW/96*.8;em(it.e,p.x,p.y-z*.42,z)}
function drawWalls(look,t){const T=iso(0,0),Rc=iso(N,0),Lc=iso(0,N),wc=look.wall.c,wp=WP[look.wall.id];
 poly([T,Rc,up(Rc,WH),up(T,WH)],dark(wc,.08),dark(wc,.35));poly([Lc,T,up(T,WH),up(Lc,WH)],lite(wc,.05),dark(wc,.35));
 const lines=(n,col,lw,vert)=>{cx.strokeStyle=col;cx.lineWidth=lw;for(let i=1;i<n;i++){const u=i/n;if(vert){for(const [a,b] of [[iso(u*N,0),0],[iso(0,u*N),0]]){cx.beginPath();cx.moveTo(a.x,a.y);cx.lineTo(a.x,a.y-WH);cx.stroke()}}else{const h=WH*u;cx.beginPath();cx.moveTo(Lc.x,Lc.y-h);cx.lineTo(T.x,T.y-h);cx.lineTo(Rc.x,Rc.y-h);cx.stroke()}}};
 if(wp==='brick'){lines(7,'rgba(110,40,20,.35)',1.2,0);lines(N*4,'rgba(110,40,20,.18)',1,1)}
 else if(wp==='plank')lines(N*3,'rgba(90,50,20,.3)',1.4,1);
 else if(wp==='tile'){lines(6,'rgba(150,150,140,.4)',1,0);lines(N*3,'rgba(150,150,140,.4)',1,1)}
 else if(wp==='marble'){cx.strokeStyle='rgba(150,140,130,.35)';cx.lineWidth=1.2;for(let i=0;i<8;i++){const a=iso((i*.37%1)*N,0),b=iso(0,(i*.61%1)*N);cx.beginPath();cx.moveTo(a.x,a.y-WH*.2);cx.quadraticCurveTo(a.x+10,a.y-WH*.5,a.x-6,a.y-WH*.9);cx.stroke();cx.beginPath();cx.moveTo(b.x,b.y-WH*.15);cx.quadraticCurveTo(b.x-10,b.y-WH*.5,b.x+6,b.y-WH*.85);cx.stroke()}}
 else if(wp==='gold'){const g=cx.createLinearGradient(Lc.x,0,Rc.x,0);g.addColorStop(0,'rgba(255,255,255,0)');g.addColorStop(m2(t*.2,1),'rgba(255,255,255,.35)');g.addColorStop(1,'rgba(255,255,255,0)');poly([Lc,T,Rc,up(Rc,WH),up(T,WH),up(Lc,WH)],g)}
 else if(look.wall.id===1||look.wall.id===2||look.wall.id===3){cx.fillStyle='rgba(255,255,255,.5)';for(let i=0;i<N*2;i++)for(let r=0;r<3;r++){const u=(i+.5)/(N*2),a=iso(u*N,0),b=iso(0,u*N);cx.beginPath();cx.arc(a.x,a.y-WH*(.22+r*.28),2,0,7);cx.fill();cx.beginPath();cx.arc(b.x,b.y-WH*(.22+r*.28),2,0,7);cx.fill()}}
 const trim=look.wall.id===8?'#b8860b':'#8a5a3a';poly([up(Lc,WH),up(T,WH),up(Rc,WH),up(Rc,WH+6),up(T,WH+6),up(Lc,WH+6)],trim);
 const win=(a,b)=>{const p=[up(a,WH*.36),up(b,WH*.36),up(b,WH*.8),up(a,WH*.8)];poly(p,look.night?'#2a3a6a':'#bfe6ff',trim,3);cx.strokeStyle=trim;cx.lineWidth=2;cx.beginPath();cx.moveTo((p[0].x+p[1].x)/2,(p[0].y+p[1].y)/2);cx.lineTo((p[2].x+p[3].x)/2,(p[2].y+p[3].y)/2);cx.stroke()};
 win(iso(0,N-1.5),iso(0,N-.5));win(iso(N-1.8,0),iso(N-.7,0));
 /* 간판(메뉴판) + 차양: 카운터 위 오른쪽 벽 */
 const a=iso(0,2.2),b=iso(0,.45),sid=look.sign|0;
 const SB=[['#8a5a3a','#fff3c0'],['#ff8ab0','#fff'],['#2a3a32','#f0f0e0'],['#2a1a3a','#e8b0ff'],['#d4a020','#fff6d0'],['rb','#fff'],['#d4a020','#fff6d0'],['#1a2a5a','#fff6c0']][sid]||['#8a5a3a','#fff3c0'];
 const sp=[up(a,WH*.48),up(b,WH*.48),up(b,WH*.8),up(a,WH*.8)];
 if(SB[0]==='rb'){const g=cx.createLinearGradient(a.x,0,b.x,0);RB.forEach((c,i)=>g.addColorStop(i/5,c));poly(sp,g,'#5a3a22',2)}else poly(sp,SB[0],sid===3?'hsl('+((t*60)%360)+',100%,70%)':'#5a3a22',sid===3?3:2);
 const mc={x:(a.x+b.x)/2,y:(a.y+b.y)/2-WH*.64};tx(look.name,mc.x,mc.y,Math.max(11,Math.min(18,TW*.18)),SB[1],'center',SB[0]==='rb'?'#5a3a22':SB[0]);if(sid===6)em('👑',mc.x,mc.y-WH*.24,TW*.3);if(sid===7)for(let i=0;i<3;i++){cx.globalAlpha=.4+.6*Math.abs(Math.sin(t*2+i));em('✨',mc.x-TW*.6+i*TW*.6,mc.y-WH*.2,TW*.14);cx.globalAlpha=1}
 const ac=AWC[look.awn|0]||AWC[0],n=8;for(let i=0;i<n;i++){const u0=i/n,u1=(i+1)/n,p0=iso(1+u0*2,0),p1=iso(1+u1*2,0);const col=ac[0]==='rb'?RB[i%6]:i%2?ac[1]:ac[0];
  const top0=up(p0,WH*.58),top1=up(p1,WH*.58),bo0={x:top0.x+TW*.08,y:top0.y+TW*.2},bo1={x:top1.x+TW*.08,y:top1.y+TW*.2};poly([top0,top1,bo1,bo0],col,'rgba(0,0,0,.15)',1);
  cx.fillStyle=col;cx.beginPath();cx.arc((bo0.x+bo1.x)/2,(bo0.y+bo1.y)/2,Math.hypot(bo1.x-bo0.x,bo1.y-bo0.y)/2,0,Math.PI);cx.fill()}
 /* 지붕 장식 (벽 윗줄) */
 const top=look.top|0;
 if(top===1){const cl=['#ff6a6a','#ffb04a','#6cc8ff','#7ed88a','#c08aff','#ff8ac0'];for(const [p0,p1] of [[Lc,T],[T,Rc]])for(let i=0;i<6;i++){const u=(i+.5)/6,x=p0.x+(p1.x-p0.x)*u,y=p0.y+(p1.y-p0.y)*u-WH-6+Math.sin(u*Math.PI)*8;A.fish2(x,y+8,TW*.0022,cl[i],{rot:Math.PI/2+Math.sin(t*2+i)*.25,plain:true})}}
 if(top===2){for(const p of [up(T,WH+20),up(Lc,WH+14),up(Rc,WH+14)])for(let i=0;i<3;i++){const c=['#ff6a8a','#ffd23a','#6cc8ff'][i];cx.fillStyle=c;cx.beginPath();cx.ellipse(p.x-14+i*14,p.y-i%2*8+Math.sin(t*1.6+i)*3,9,11,0,0,7);cx.fill()}}
 if(top===3){const p=up(T,WH+26);A.fish2(p.x,p.y+Math.sin(t*1.8)*2,TW*.009,'#ffcf3a',{glow:'rgba(255,220,80,.9)'})}
 if(top===4){const p=up(Rc,WH+4),q=up(T,WH+4);poly([p,q,up(q,30),up(p,30)],'#1a1a22','#555',2);cx.save();cx.beginPath();cx.moveTo(p.x,p.y);cx.lineTo(q.x,q.y);cx.lineTo(q.x,q.y-30);cx.lineTo(p.x,p.y-30);cx.closePath();cx.clip();cx.font='bold 16px "Jua",sans-serif';cx.fillStyle='#ffc850';cx.shadowColor='#ffb030';cx.shadowBlur=8;const msg='🐟 갓 구운 붕어빵 '+look.name+' 🐟  ';const w=cx.measureText(msg).width,ox=-m2(t*40,w);for(let k=0;k<3;k++)cx.fillText(msg,q.x+ox+k*w,(p.y+q.y)/2-8);cx.restore()}
 if(top===5){const p=up(T,WH+30);cx.save();cx.shadowColor='#ffd23a';cx.shadowBlur=14+6*Math.sin(t*2);em('👑',p.x,p.y,TW*.6);cx.restore()}
 /* 조명 */
 const lit=look.lit|0;
 if(lit===1){for(const [p0,p1] of [[Lc,T],[T,Rc]])for(let i=0;i<10;i++){const u=(i+.5)/10,x=p0.x+(p1.x-p0.x)*u,y=p0.y+(p1.y-p0.y)*u-WH+8+Math.sin(u*Math.PI)*6,c=['#ff6a5a','#ffd23a','#7ed88a','#7ec8ff'][(i+Math.floor(t*2))%4];cx.fillStyle=c;cx.shadowColor=c;cx.shadowBlur=8;cx.beginPath();cx.arc(x,y,3.4,0,7);cx.fill();cx.shadowBlur=0}}
 if(lit===2){for(let i=0;i<5;i++){const u=(i+.5)/5,p=i%2?iso(0,u*N):iso(u*N,0);em('⭐',p.x,p.y-WH*.88+Math.sin(t*2+i)*3,TW*.18)}}
 if(lit===3){cx.save();const c='hsl('+((t*60)%360)+',100%,65%)';cx.shadowColor=c;cx.shadowBlur=12;cx.strokeStyle=c;cx.lineWidth=3;cx.beginPath();cx.moveTo(Lc.x,Lc.y-WH+4);cx.lineTo(T.x,T.y-WH+4);cx.lineTo(Rc.x,Rc.y-WH+4);cx.stroke();cx.restore()}}
function drawFloor(look,t,edit,items){const f=FLR[look.floor|0]||FLR[0];
 for(let gx=0;gx<N;gx++)for(let gy=0;gy<N;gy++){const pts=[iso(gx,gy),iso(gx+1,gy),iso(gx+1,gy+1),iso(gx,gy+1)];let c=f[0];
  if(f[2]===1&&(gx+gy)%2)c=f[1];if(f[2]===4)c=(gx*7+gy*3)%3?f[0]:f[1];
  if(f[2]===6){c=(gx+gy)%2?f[0]:f[1]}poly(pts,c,f[2]===0||f[2]===2||f[2]===4?'rgba(0,0,0,.08)':null,1);
  if(f[2]===2){cx.strokeStyle='rgba(120,70,30,.2)';cx.lineWidth=1;for(const v of[.33,.66]){const a=iso(gx,gy+v),b=iso(gx+1,gy+v);cx.beginPath();cx.moveTo(a.x,a.y);cx.lineTo(b.x,b.y);cx.stroke()}}
  if(f[2]===3&&(gx*5+gy)%3===0)em('🌼',iso(gx+.5,gy+.5).x,iso(gx+.5,gy+.5).y,TW*.14)}
 if(f[2]===5){poly([iso(.3,.3),iso(N-.3,.3),iso(N-.3,N-.3),iso(.3,N-.3)],null,'#f0c040',3)}
 if(f[2]===6)for(let i=0;i<8;i++){const p=iso((i*.37%1)*N,(i*.71%1)*N);cx.globalAlpha=.3+.7*Math.abs(Math.sin(t*1.6+i));em('✨',p.x,p.y,TW*.14);cx.globalAlpha=1}
 /* 꾸미는 중: 손님이 걷는 길(문→카운터)을 옅게, 꼭 비울 칸은 진하게 */
 const rt=edit?(mainRoute(items||[])||[]):[];const on=new Set(rt.map(p=>p.gx+','+p.gy));
 for(let gx=0;gx<N;gx++)for(let gy=0;gy<N;gy++){const rs=isPath(gx,gy);if(!rs&&!on.has(gx+','+gy))continue;cx.globalAlpha=edit?(rs?.42:.2):.1;poly([iso(gx+.12,gy+.12),iso(gx+.88,gy+.12),iso(gx+.88,gy+.88),iso(gx+.12,gy+.88)],'#fff');cx.globalAlpha=1;if(edit&&rs){const c=iso(gx+.5,gy+.5);em(gy===1?'🧾':'🚪',c.x,c.y,TW*.2)}}
 const Lc=iso(0,N),Bc=iso(N,N),Rc=iso(N,0);poly([Lc,Bc,up(Bc,-8),up(Lc,-8)],dark(f[0],.3));poly([Bc,Rc,up(Rc,-8),up(Bc,-8)],dark(f[0],.42));
 poly([iso(N-.08,N-.9),iso(N+.4,N-.9),iso(N+.4,N-.1),iso(N-.08,N-.1)],'#c84a3a')}
/* ---------- 직원 (경영에서 뽑은 알바만 보여요) ---------- */
function apron(x,y,s,col){const w=s*.46,h=s*.4,ty=y+s*.3;cx.globalAlpha=.94;rr(x-w/2,ty,w,h,s*.08,col);cx.globalAlpha=1;rr(x-w*.2,ty+h*.38,w*.4,h*.3,s*.04,'rgba(255,255,255,.5)');cx.strokeStyle=col;cx.lineWidth=Math.max(1.5,s*.03);cx.beginPath();cx.moveTo(x-w*.42,ty+2);cx.lineTo(x-w*.2,ty-s*.12);cx.moveTo(x+w*.42,ty+2);cx.lineTo(x+w*.2,ty-s*.12);cx.stroke()}
function badge(x,y,e,col){const r=TW*.11;cx.fillStyle='#fff';cx.beginPath();cx.arc(x,y,r,0,7);cx.fill();cx.strokeStyle=col;cx.lineWidth=2.5;cx.stroke();em(e,x,y,r*1.35)}
const SCOL={bake:'#e8a840',serve:'#ff8ab0',promo:'#ff9a3a',barista:'#3a8a5a'};
/* 카운터 뒤 직원: 발이 카운터에 가려지게 (발 = 카운터 윗면보다 조금 아래). 왼쪽부터 🐼 바리스타 · 사장님 · 🐶 굽기 알바 */
const behind=(gx,gy,sc)=>{const p=iso(gx,gy),s=TW*sc;return{x:p.x,y:p.y-TW*.30-s*.9,s}};
function staffBack(t,look){const S=look.staff||{};
 if(look.cafe&&S.barista>0){const q=behind(1.42,.3,.36);animal('🐼',q.x,q.y,q.s,{t,ph:3,mood:'h'});
  const ph=m2(t*.9,1);cx.fillStyle='rgba(255,255,255,'+(.6*(1-ph))+')';cx.beginPath();cx.ellipse(q.x+q.s*.4,q.y+q.s*.2-ph*q.s*.3,3+ph*3,2+ph*2,0,0,7);cx.fill()}}
function staffBack2(t,look){const S=look.staff||{};
 if(S.bake>0){const q=behind(2.85,.32,.36);animal('🐶',q.x,q.y,q.s,{t,ph:5,mood:'h'});
  const hop=m2(t*.8,1);if(hop<.5){const u=hop/.5;A.bread(q.x-q.s*.42,q.y+q.s*.55-Math.sin(u*Math.PI)*q.s*.55,TW*.0024,'#f0b850',{rot:u*Math.PI*2,plain:true})}}}
/* 앞쪽 직원: 🐰 계산 알바는 카운터 왼쪽 바닥(계산대), 🦊 홍보 알바는 입구 앞 길가 */
function staffFront(t,look,L){const S=look.staff||{};
 if(S.serve>0){const gx=.5,gy=.42;L.push({z:gx+gy+.3,f:()=>{const p=iso(gx,gy),s=TW*.38,y=p.y-s*.88;shadow(p.x,p.y,s*.3);
  const q=iso(gx+.32,gy+.18);rr(q.x-s*.26,q.y-s*.62,s*.52,s*.62,5,'#a8744a');cx.strokeStyle=OL;cx.lineWidth=Math.max(1.4,TW*.02);cx.beginPath();cx.roundRect(q.x-s*.26,q.y-s*.62,s*.52,s*.62,5);cx.stroke();
  animal('🐰',p.x,y,s,{t,ph:7,mood:'h'});apron(p.x,y,s,SCOL.serve);
  rr(q.x-s*.2,q.y-s*.86,s*.4,s*.26,4,'#7a7a86');rr(q.x-s*.16,q.y-s*.82,s*.32,s*.09,2,'#bfe8bf');badge(p.x-s*.5,y-s*.3,'🧾',SCOL.serve)}})}
 if(S.promo>0){const gx=N-1.3,gy=N+.5; /* 입구 앞 길가 (옆 장식·나무와 안 겹치게) */L.push({z:gx+gy,f:()=>{const p=iso(gx,gy),s=TW*.38,w=Math.sin(t*5),y=p.y-s*.88-Math.abs(w)*2;shadow(p.x,p.y,s*.3);animal('🦊',p.x,y,s,{t,ph:9,mood:'h',tilt:w*.05});apron(p.x,y,s,SCOL.promo);
  cx.save();cx.translate(p.x+s*.48,y+s*.35);cx.rotate(-.3+w*.25);em('📄',0,0,s*.34);cx.restore();badge(p.x-s*.56,y-s*.5,'📣',SCOL.promo);
  const ph=t%8;const ms=look.cafe?['🐟 따끈한 붕어빵!','어서 오세요~','☕ 커피도 있어요!','오늘 맛있어요!']:['🐟 따끈한 붕어빵!','어서 오세요~','오늘 맛있어요!'];if(ph<2.4)bubble(p.x,y-s*.82,ms[Math.floor(t/8)%ms.length],Math.min(1,(2.4-ph)*3,ph*3))}})}}
/* 가게 등급이 오르면 카운터 주변이 커져요: 1 메뉴판 · 3 펜던트 조명 · 4 줄전구 · 5 빵 바구니 · 6 네온 붕어 */
function counterUp(t,look){const g=(look&&look.g)|0,lw=Math.max(1.4,TW*.024);if(g<1)return;
 if(g>=1){const a=up(iso(1.1,0),WH*.92),b=up(iso(2.9,0),WH*.92),c=up(iso(2.9,0),WH*.55),d=up(iso(1.1,0),WH*.55);poly([a,b,c,d],g>=5?'#2a3a2e':'#3e3228',g>=5?'#d4a020':OL,lw);
  const m={x:(a.x+c.x)/2,y:(a.y+c.y)/2},h=(d.y-a.y);cx.save();cx.translate(m.x,m.y);cx.transform(1,.5,0,1,0,0);tx('MENU',0,-h*.28,Math.max(7,TW*.1),'#fff6d0','center','#3e3228');
  const L=['🫘','🍮','🧀','🍠','🍫','🌟'].slice(0,Math.min(6,2+g));L.forEach((e,i)=>em(e,(i-(L.length-1)/2)*TW*.17,h*.12,Math.max(7,TW*.11)));cx.restore()}
 if(g>=3)for(const gx of[1.5,2.5]){const top=up(iso(gx,.45),WH*1.02),lp=up(iso(gx,.45),WH*.68);cx.strokeStyle='#3a2a1a';cx.lineWidth=1.2;cx.beginPath();cx.moveTo(top.x,top.y);cx.lineTo(lp.x,lp.y);cx.stroke();
  cx.fillStyle='rgba(255,230,150,.28)';cx.beginPath();cx.arc(lp.x,lp.y+TW*.05,TW*.22,0,7);cx.fill();cx.fillStyle=g>=5?'#d4a020':'#e8584a';cx.beginPath();cx.moveTo(lp.x-TW*.09,lp.y+TW*.05);cx.lineTo(lp.x+TW*.09,lp.y+TW*.05);cx.lineTo(lp.x+TW*.04,lp.y-TW*.03);cx.lineTo(lp.x-TW*.04,lp.y-TW*.03);cx.closePath();cx.fill();cx.fillStyle='#fff6c0';cx.beginPath();cx.arc(lp.x,lp.y+TW*.06,TW*.03,0,7);cx.fill()}
 if(g>=4){const C=['#ff6a5a','#ffd23a','#5ad07a','#5ab4ff','#ff9ad0'];for(let i=0;i<=16;i++){const u=i/16,p=up(iso(.2+u*Math.min(N-.4,5.6),0),WH*.99-Math.sin(u*Math.PI*4)*WH*.04);cx.globalAlpha=.55+.45*Math.abs(Math.sin(t*2+i));cx.fillStyle=C[i%5];cx.beginPath();cx.arc(p.x,p.y,Math.max(1.6,TW*.028),0,7);cx.fill()}cx.globalAlpha=1}
 if(g>=5){const p=iso(3.25,.35);em('🧺',p.x,p.y-TW*.12,TW*.3);em('🥖',p.x+TW*.05,p.y-TW*.24,TW*.18)}
 if(g>=6){const p=up(iso(Math.min(N-.55,3.6),0),WH*.74),gl=.6+.4*Math.sin(t*3);cx.fillStyle='rgba(255,120,200,'+(.22*gl)+')';cx.beginPath();cx.arc(p.x,p.y,TW*.38,0,7);cx.fill();em('🐟',p.x,p.y,TW*.42,.85+.15*gl)}}
function drawCounter(t,look){const S=(look&&look.staff)||{},cafe=!!(look&&look.cafe),cq=behind(S.bake>0||(cafe&&S.barista>0)?2.08:2,.35,.44);staffBack(t,look||{});staffBack2(t,look||{});animal('cook',cq.x,cq.y,cq.s,{t,ph:0,mood:'h',shirt:'#ffffff'});
 const H0=TW*.34,lw=Math.max(1.6,TW*.026);
 /* 매대 앞면 이름표 (비스듬한 면에 맞춰 기울여 그려요) */
 const plate=(b,txt,bg,fg)=>{const L=b.L,B=b.B,c={x:(L.x+B.x)/2,y:(L.y+B.y)/2+H0*.5};cx.save();cx.translate(c.x,c.y);cx.transform(1,.5,0,1,0,0);const w=TW*.36,h=TW*.15;
  rr(-w/2,-h/2,w,h,h*.35,bg);cx.strokeStyle=OL;cx.lineWidth=lw*.8;cx.beginPath();cx.roundRect(-w/2,-h/2,w,h,h*.35);cx.stroke();tx(txt,0,1,Math.max(8,TW*.076),fg,'center',bg);cx.restore()};
 /* ☕ 왼쪽: 카페를 열면 커피 매대(초록), 아니면 주문대 */
 const bL=box(1,0,.06,H0,cafe?'#5a8a64':'#b97d4a',{top:cafe?'#efe6d6':'#d9a06a'});
 if(cafe){/* 에스프레소 머신 */const q=iso(1.2,.42),w=TW*.34,h=TW*.3,x=q.x-w/2,y=q.y-H0-h;
  rr(x,y,w,h,6,'#c9ccd2');cx.strokeStyle=OL;cx.lineWidth=lw;cx.beginPath();cx.roundRect(x,y,w,h,6);cx.stroke();rr(x+3,y+3,w-6,h*.22,3,'#8a8e98');
  cx.fillStyle='#e8584a';cx.beginPath();cx.arc(x+w*.82,y+h*.14,TW*.022,0,7);cx.fill();
  for(const u of[.3,.7]){rr(x+w*u-TW*.04,y+h*.42,TW*.08,h*.14,2,'#3a3a40')}
  rr(x+w*.12,y+h*.86,w*.76,h*.1,2,'#5a5e68');
  rr(x+w*.22,y+h*.6,TW*.07,h*.24,2,'#fff');rr(x+w*.62,y+h*.6,TW*.07,h*.24,2,'#fff');
  const ph=m2(t*.8,1);cx.fillStyle='rgba(255,255,255,'+(.6*(1-ph))+')';cx.beginPath();cx.ellipse(x+w*.3,y-4-ph*TW*.3,3+ph*4,2+ph*3,0,0,7);cx.fill();
  /* 컵 쌓기 */const c=iso(1.74,.66);for(let i=0;i<3;i++){const cy=c.y-H0-TW*.07*(i+1);rr(c.x-TW*.055,cy,TW*.11,TW*.08,2,'#fff');cx.strokeStyle='rgba(90,58,34,.6)';cx.lineWidth=1;cx.beginPath();cx.roundRect(c.x-TW*.055,cy,TW*.11,TW*.08,2);cx.stroke();rr(c.x-TW*.055,cy+TW*.03,TW*.11,TW*.025,0,'#a8744a')}
  plate(bL,'☕ 커피','#2f4a3a','#ffe9a0')}
 else{const q=iso(1.5,.5);em('🧺',q.x,q.y-H0-TW*.08,TW*.26);plate(bL,'🧾 주문','#fff3dc','#8a3a1a')}
 /* 🐟 오른쪽: 유리 진열장 붕어빵 매대 */
 const bR=box(2,0,.06,H0,'#b97d4a',{top:'#d9a06a'});
 const gT=TW*.2,m=.12,P=(a,b,h)=>up(iso(2+a,b),H0+h);
 poly([P(m,m,0),P(1-m,m,0),P(1-m,1-m,0),P(m,1-m,0)],'#f6e2c0');
 for(const r of[.36,.66])for(let i=0;i<3;i++){const p=P(.24+i*.26,r,TW*.03);A.bread(p.x,p.y,TW*.0026,'#e8a840',{plain:true})}
 cx.globalAlpha=.32;poly([P(m,1-m,0),P(1-m,1-m,0),P(1-m,1-m,gT),P(m,1-m,gT)],'#cfefff');poly([P(1-m,1-m,0),P(1-m,m,0),P(1-m,m,gT),P(1-m,1-m,gT)],'#b8e2f8');poly([P(m,m,gT),P(1-m,m,gT),P(1-m,1-m,gT),P(m,1-m,gT)],'#e8f8ff');cx.globalAlpha=1;
 cx.strokeStyle='rgba(255,255,255,.9)';cx.lineWidth=lw;for(const [a,b] of [[P(m,1-m,gT),P(1-m,1-m,gT)],[P(1-m,1-m,gT),P(1-m,m,gT)],[P(m,m,gT),P(1-m,m,gT)],[P(m,m,gT),P(m,1-m,gT)],[P(m,1-m,0),P(m,1-m,gT)],[P(1-m,1-m,0),P(1-m,1-m,gT)],[P(1-m,m,0),P(1-m,m,gT)]]){cx.beginPath();cx.moveTo(a.x,a.y);cx.lineTo(b.x,b.y);cx.stroke()}
 {const a=P(.3,1-m,gT*.85),b=P(.45,1-m,gT*.2);cx.strokeStyle='rgba(255,255,255,.75)';cx.lineWidth=2;cx.beginPath();cx.moveTo(a.x,a.y);cx.lineTo(b.x,b.y);cx.stroke()}
 const st=P(.5,.5,gT);for(let i=0;i<2;i++){const ph=m2(t*.9+i*.5,1);cx.fillStyle='rgba(255,255,255,'+(.55*(1-ph))+')';cx.beginPath();cx.ellipse(st.x-TW*.14+i*TW*.28,st.y-TW*.08-ph*TW*.38,4+ph*5,3+ph*4,0,0,7);cx.fill()}
 plate(bR,'🐟 붕어빵','#8a3a1a','#fff3c0')}
function drawChandelier(look,t){if((look.lit|0)!==4)return;const c=iso(N/2,N/2);const y=c.y-WH*.95;cx.strokeStyle='#c89010';cx.lineWidth=2;cx.beginPath();cx.moveTo(c.x,y-30);cx.lineTo(c.x,y);cx.stroke();const g=cx.createRadialGradient(c.x,y,4,c.x,y,TW*1.2);g.addColorStop(0,'rgba(255,240,170,.5)');g.addColorStop(1,'rgba(255,240,170,0)');cx.fillStyle=g;cx.beginPath();cx.arc(c.x,y,TW*1.2,0,7);cx.fill();em('🔮',c.x,y+8,TW*.36)}
/* ---------- 전체 ---------- */
function draw(t,look,items,o={}){layout(look.n,o.top||64,o.bottom||520,o.fit);
 drawSky(look,t);drawGround(look,t);drawWalls(look,t);drawFloor(look,t,o.edit,items);
 const L=[];for(const it of items)if(FK[it.k]&&inRoom(it.x,it.y))L.push({z:it.x+it.y+1+(FK[it.k].flat?-.9:0),f:()=>drawB(it,t,o.sel===it)});
 L.push({z:1.4,f:()=>{drawCounter(t,look);counterUp(t,look)}});{const a=SIDE_L(),b=SIDE_R();L.push({z:a.gx+a.gy,f:()=>drawSide(look.sL,a)});L.push({z:b.gx+b.gy,f:()=>drawSide(look.sR,b)})}staffFront(t,look,L);if(look.mas&&look.mas.e&&look.mas.e!=='➖')L.push({z:pet.x+pet.y,f:()=>drawPet(look,t)});
 if(!o.noCust)for(const c of cust)L.push({z:c.x+c.y+(c.st==='sit'?.05:0),f:()=>drawCust(c,t)});
 L.sort((a,b)=>a.z-b.z).forEach(q=>q.f());drawChandelier(look,t);
 for(const f of fx){cx.globalAlpha=Math.max(0,f.l);em(f.e,f.x,f.y-(1-f.l)*30,22);cx.globalAlpha=1}
 if(o.ghost&&o.ghost.ok!==undefined){const g=o.ghost;cx.globalAlpha=.5+.2*Math.sin(t*6);poly([iso(g.x,g.y),iso(g.x+1,g.y),iso(g.x+1,g.y+1),iso(g.x,g.y+1)],g.ok?'rgba(120,220,120,.5)':'rgba(255,90,90,.5)');cx.globalAlpha=1}}
function tick(dt,items,rate){step(dt,items,rate);petStep(dt,items)}
return{bounce,get cust(){return cust},qLine:it=>qLine(it),FUR,FK,SETS,SET_BONUS,thumb,ROOM,draw,pan(dx,dy){PAN.x+=dx;PAN.y+=dy},resetPan(){PAN={x:0,y:0}},canPan:()=>CAN,get fit(){return FIT},set fit(v){FIT=!!v;if(!FIT&&ZM<=LFT+.5)ZM=Math.max(FIX,LFT*1.3)},
 /* 핀치 확대·축소: f배. atMin = 더 줄일 수 없음(한눈에 보기) */
 zoom(f){const cur=CAN?TW:LFT;let z=Math.max(30,Math.min(ZMAX,cur*f));FIT=false;const k=Math.max(z,LFT)/cur;PAN.x*=k;PAN.y*=k;ZM=z;return{atMin:z<=LFT+.5}},tick,reset,toTile,inRoom,isPath,isCounter,canPlace,okPlace,blockedSeats,mainRoute,iso:(a,b)=>iso(a,b),get N(){return N}}};
