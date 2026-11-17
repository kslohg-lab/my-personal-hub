/* ===== 붕어빵 가게: 화면·저장·꾸미기 (굽기 규칙은 위의 BP2 그대로) ===== */
(()=>{
if(typeof CanvasRenderingContext2D!=='undefined'&&!CanvasRenderingContext2D.prototype.roundRect)CanvasRenderingContext2D.prototype.roundRect=function(x,y,w,h,r){r=Math.min(r||0,w/2,h/2);this.moveTo(x+r,y);this.arcTo(x+w,y,x+w,y+h,r);this.arcTo(x+w,y+h,x,y+h,r);this.arcTo(x,y+h,x,y,r);this.arcTo(x,y,x+w,y,r);this.closePath()};
const B=BP2,R=B.R,W=450,H=800,$=id=>document.getElementById(id),cv=$('cv'),cx=cv.getContext('2d'),fmt=B.fmt,KEY='bpShopPubV1';
/* ---------- 꾸미기 목록 (p=가격, g=필요한 가게 등급, st=필요한 ⭐, 가격 0이고 st가 있으면 ⭐ 보상) ---------- */
const SIGN=[{n:'나무 간판',e:'🪵',p:0,g:0},{n:'리본 간판',e:'🎀',p:900,g:0},{n:'칠판 간판',e:'📝',p:2800,g:1},{n:'네온 간판',e:'💜',p:9000,g:2},{n:'금박 간판',e:'🥇',p:32000,g:3},{n:'무지개 간판',e:'🌈',p:95000,g:4},{n:'황금 왕관 간판',e:'👑',p:300000,g:5},{n:'별빛 간판',e:'✨',p:0,g:0,st:60}];
const AWN=[{n:'빨강 줄무늬',e:'🟥',p:0,g:0},{n:'파랑 줄무늬',e:'🟦',p:700,g:0},{n:'초록 줄무늬',e:'🟩',p:700,g:0},{n:'분홍 물방울',e:'🩷',p:2200,g:1},{n:'노랑 줄무늬',e:'🟨',p:2200,g:1},{n:'무지개 차양',e:'🌈',p:11000,g:2},{n:'별빛 차양',e:'⭐',p:45000,g:3},{n:'벚꽃 차양',e:'🌸',p:140000,g:4},{n:'황금 장막',e:'🏅',p:380000,g:5}];
const WALL=[{n:'크림 벽',e:'⬜',p:0,g:0,c:'#fff3dc'},{n:'하늘색 벽',e:'🟦',p:600,g:0,c:'#d8ecff'},{n:'민트 벽',e:'🟩',p:600,g:0,c:'#d8f5e4'},{n:'분홍 벽',e:'🩷',p:1500,g:0,c:'#ffdce8'},{n:'벽돌 벽',e:'🧱',p:3800,g:1,c:'#c8664a'},{n:'나무판자 벽',e:'🪵',p:9500,g:2,c:'#c89a64'},{n:'타일 벽',e:'🔲',p:28000,g:3,c:'#f2f2ee'},{n:'대리석 벽',e:'🏛️',p:90000,g:4,c:'#ece8e4'},{n:'황금빛 벽',e:'🌟',p:260000,g:5,c:'#f6dc7a'},
 /* 🎀 11/8 추가 (번호는 저장값이라 뒤에만 붙여요, 목록은 가격순으로 보여요) */
 {n:'딸기우유 줄무늬',e:'🍓',p:2500,g:0,c:'#ffe6ee'},{n:'물방울 벽지',e:'⚪',p:6000,g:1,c:'#fff4d6'},{n:'벚꽃 벽지',e:'🌸',p:15000,g:2,c:'#fdebf1'},{n:'하트 벽지',e:'💗',p:40000,g:3,c:'#ffe3ea'},{n:'밤하늘 별 벽지',e:'🌙',p:120000,g:4,c:'#2f3a6e'},{n:'붕어빵 무늬 벽지',e:'🐟',p:0,g:0,m:15,c:'#fff0cf'},
 /* 🎨 11/13 추가: 싼 파스텔부터 고급 벽지까지 */
 {n:'레몬 줄무늬',e:'🍋',p:2000,g:0,c:'#fff8d8'},{n:'민트 줄무늬',e:'🌿',p:2000,g:0,c:'#eefaf3'},{n:'라벤더 체크',e:'💜',p:8000,g:1,c:'#f3ecfb'},{n:'구름 하늘 벽지',e:'☁️',p:30000,g:2,c:'#cfe6ff'},
 {n:'원목 웨인스코팅',e:'🪵',p:60000,g:3,c:'#f6eddc'},{n:'무지개 파스텔 벽',e:'🌈',p:180000,g:4,c:'#ffffff'},{n:'디저트 가게 벽지',e:'🧁',p:1200000,g:5,c:'#ffe4ec'},{n:'로열 다마스크',e:'👑',p:3000000,g:6,c:'#3e2a5c'}];
const FLOOR=[{n:'시멘트 바닥',e:'⬜',p:0,g:0},{n:'체크무늬 바닥',e:'🏁',p:1400,g:0},{n:'나무 바닥',e:'🪵',p:4800,g:1},{n:'잔디',e:'🌱',p:11000,g:2},{n:'돌길',e:'🪨',p:36000,g:3},{n:'레드카펫',e:'🟥',p:110000,g:4},{n:'별빛 유리 바닥',e:'💎',p:320000,g:5},
 {n:'파스텔 체크 타일',e:'🧁',p:3000,g:0},{n:'쪽모이 원목 마루',e:'🪵',p:15000,g:2},{n:'하늘 타일',e:'🩵',p:25000,g:3},{n:'곰돌이 러그',e:'🧸',p:60000,g:3},{n:'무지개 모자이크',e:'🌈',p:150000,g:4},{n:'붕어빵 타일',e:'🐟',p:0,g:0,m:15},
 /* 🎨 11/13 추가 */
 {n:'레몬 체크',e:'🍋',p:2500,g:0},{n:'민트 체크',e:'🌿',p:2500,g:0},{n:'라벤더 체크',e:'💜',p:8000,g:1},{n:'화이트 원목',e:'🤍',p:25000,g:2},
 {n:'구름 카펫',e:'☁️',p:60000,g:3},{n:'딸기우유 대리석',e:'🍓',p:150000,g:4},{n:'초콜릿 타일',e:'🍫',p:400000,g:5},{n:'황금 결 대리석',e:'✨',p:1500000,g:6}];
const SIDE=[{n:'없음',e:'➖',p:0,g:0},{n:'화분',e:'🪴',p:700,g:0,sz:56},{n:'벤치',e:'🪑',p:2600,g:1,sz:60},{n:'등불',e:'🏮',p:5200,g:1,sz:66},{n:'나무',e:'🌳',p:9800,g:2,sz:96},{n:'자전거',e:'🚲',p:14000,g:2,sz:64},{n:'분수',e:'⛲',p:42000,g:3,sz:96},{n:'회전목마',e:'🎠',p:150000,g:4,sz:104},{n:'작은 타워',e:'🗼',p:320000,g:5,sz:124},{n:'대관람차',e:'🎡',p:600000,g:6,sz:134}];
const MAS=[{n:'없음',e:'➖',p:0,g:0},{n:'강아지',e:'🐶',p:2400,g:0},{n:'고양이',e:'🐱',p:2400,g:0},{n:'토끼',e:'🐰',p:5200,g:1},{n:'판다',e:'🐼',p:16000,g:2},{n:'여우',e:'🦊',p:26000,g:2},{n:'사자',e:'🦁',p:52000,g:3},{n:'용',e:'🐉',p:210000,g:4},{n:'유니콘',e:'🦄',p:420000,g:5},{n:'황금 붕어',e:'🌟',p:0,g:0,st:100}];
const LIT=[{n:'없음',e:'➖',p:0,g:0},{n:'전구줄',e:'💡',p:3200,g:1},{n:'별 조명',e:'⭐',p:12000,g:2},{n:'네온 불빛',e:'🌃',p:41000,g:3},{n:'샹들리에',e:'🔮',p:150000,g:4},{n:'오로라 조명',e:'🌌',p:520000,g:6}];
const SKY=[{n:'맑은 낮',e:'☀️',p:0,g:0},{n:'노을',e:'🌇',p:3000,g:0},{n:'별밤',e:'🌙',p:10500,g:1},{n:'눈 내리는 거리',e:'❄️',p:36000,g:2},{n:'벚꽃 거리',e:'🌸',p:72000,g:3},{n:'단풍 거리',e:'🍁',p:72000,g:3},{n:'오로라 밤',e:'🌌',p:250000,g:5},{n:'무지개 낮',e:'🌈',p:0,g:0,st:40},
 /* 🏞️ 11/13 그림 배경 (빙 그림 img/bg_*.webp): gr=땅 색, hf=그림에서 땅이 시작하는 높이, nt=밤 */
 {n:'시골 들판',e:'🌻',p:400000,g:4,img:'farm',gr:'#a7cc5a',hf:0.86},{n:'바닷가',e:'🏖️',p:600000,g:4,img:'beach',gr:'#fae9ca',hf:0.86},{n:'벚꽃 언덕',e:'🌸',p:800000,g:5,img:'sakura',gr:'#bed699',hf:0.82},{n:'눈 덮인 산',e:'🏔️',p:800000,g:5,img:'snow',gr:'#ecf3fa',hf:0.79},{n:'과자 나라',e:'🍭',p:1500000,g:5,img:'candy',gr:'#f8b9cd',hf:0.84},{n:'도시 야경',e:'🌃',p:1500000,g:5,img:'city',gr:'#1f3a33',hf:0.85,nt:1},{n:'동화 속 성',e:'🏰',p:3000000,g:6,img:'castle',gr:'#b2cb88',hf:0.84},{n:'우주',e:'🪐',p:5000000,g:6,img:'space',gr:'#ae91d9',hf:0.78,nt:1}];
const TOP=[{n:'없음',e:'➖',p:0,g:0},{n:'잉어 깃발 줄',e:'🎏',p:2000,g:0},{n:'풍선 아치',e:'🎈',p:6500,g:1},{n:'대형 붕어 조형물',e:'🐟',p:24000,g:2},{n:'LED 전광판',e:'🪧',p:60000,g:3},{n:'황금 왕관 장식',e:'👑',p:200000,g:4},{n:'불꽃놀이',e:'🎆',p:450000,g:5}];
const MSH=[{n:'붕어 틀',e:'🐟',p:0,g:0},{n:'동그라미 틀',e:'⚪',p:800,g:0},{n:'네모 틀',e:'🟧',p:1500,g:0},{n:'세모 틀',e:'🔺',p:2600,g:1},{n:'하트 틀',e:'💗',p:6000,g:1},{n:'별 틀',e:'⭐',p:14000,g:2},{n:'곰돌이 틀',e:'🐻',p:38000,g:3},{n:'구름 틀',e:'☁️',p:90000,g:4},{n:'왕관 틀',e:'👑',p:240000,g:5}];
/* 🏠 외관 스킨: 붕어빵 거리에서 보이는 가게 겉모습 (그림은 street.js) */
const MS2=1796050800000,MS3=1798729200000; /* 2026-12-01 · 2027-01-01 00:00 한국 시간 */
const SKIN=[{n:'기본 가게',e:'🏪',p:0,g:0},{n:'벽돌집',e:'🧱',p:60000,g:1,img:'img/sk/c1.webp'},{n:'통나무 오두막',e:'🪵',p:150000,g:2,img:'img/sk/c2.webp'},{n:'한옥',e:'🏯',p:350000,g:3,img:'img/sk/c3.webp'},{n:'카페 테라스',e:'☕',p:700000,g:4,img:'img/sk/c4.webp'},{n:'과자집',e:'🍭',p:1300000,g:5,img:'img/sk/c5.webp'},{n:'성',e:'🏰',p:2500000,g:6,img:'img/sk/c6.webp'},
 /* 🏅 메달 스킨: 메달로만 사요 (그림 img/sk, 싼 것 → 비싼 것) */
 {n:'분홍 비늘 집',e:'🏅',p:0,g:0,m:30,img:'img/sk/m1.webp',a:2,h:0},{n:'숲속 트리하우스',e:'🏅',p:0,g:0,m:30,img:'img/sk/m2.webp',a:0,h:3},{n:'붕어 기차',e:'🏅',p:0,g:0,m:30,img:'img/sk/m3.webp',a:0,h:3},{n:'눈 오는 오두막',e:'🏅',p:0,g:0,m:30,img:'img/sk/m4.webp',a:2,h:0},{n:'진저브레드 하우스',e:'🏅',p:0,g:0,m:30,img:'img/sk/m5.webp',a:0,h:3},{n:'붕어 목조 주막',e:'🏅',p:0,g:0,m:50,img:'img/sk/m6.webp',a:0,h:4},{n:'벚꽃 한옥',e:'🏅',p:0,g:0,m:50,img:'img/sk/m7.webp',a:3,h:0},{n:'붕어 버섯 집',e:'🏅',p:0,g:0,m:50,img:'img/sk/m8.webp',a:0,h:4},{n:'우주 돔 가게',e:'🏅',p:0,g:0,m:50,img:'img/sk/m9.webp',a:3,h:0},{n:'붕어 지붕 집',e:'🏅',p:0,g:0,m:80,img:'img/sk/m10.webp',a:0,h:6},{n:'하얀 붕어 집',e:'🏅',p:0,g:0,m:80,img:'img/sk/m11.webp',a:4,h:0},{n:'눈 덮인 붕어 오두막',e:'🏅',p:0,g:0,m:80,img:'img/sk/m12.webp',a:4,h:0},{n:'붕어 등대',e:'🏅',p:0,g:0,m:80,img:'img/sk/m13.webp',a:0,h:6},{n:'붕어 잠수함',e:'🏅',p:0,g:0,m:120,img:'img/sk/m14.webp',a:0,h:8},{n:'벚꽃 붕어 가게',e:'🏅',p:0,g:0,m:120,img:'img/sk/m15.webp',a:5,h:0},{n:'왕관 붕어 집',e:'🏅',p:0,g:0,m:120,img:'img/sk/m16.webp',a:0,h:8},{n:'분홍 고양이 집',e:'🏅',p:0,g:0,m:120,img:'img/sk/m17.webp',a:5,h:0},{n:'황금 붕어 궁전',e:'🏅',p:0,g:0,m:150,img:'img/sk/m18.webp',a:6,h:5},{n:'고양이 얼굴 집',e:'🏅',p:0,g:0,m:150,img:'img/sk/m19.webp',a:6,h:5},{n:'꼬리 붕어빵 집',e:'🏅',p:0,g:0,m:150,img:'img/sk/m20.webp',a:6,h:5},
 /* 🏅 2차 (12월 1일 0시 공개 · from = 그 시각 ms, 그 전엔 미리보기만) */
 {n:'분홍 지붕 작은 집',e:'🏅',p:0,g:0,m:30,img:'img/sk/m21.webp',a:2,h:0,from:MS2},{n:'빨간 기와 가게',e:'🏅',p:0,g:0,m:30,img:'img/sk/m22.webp',a:0,h:3,from:MS2},
 {n:'아이싱 쿠키 집',e:'🏅',p:0,g:0,m:50,img:'img/sk/m23.webp',a:3,h:0,from:MS2},{n:'비늘 지붕 통나무집',e:'🏅',p:0,g:0,m:50,img:'img/sk/m24.webp',a:0,h:4,from:MS2},
 {n:'아치 지붕 카라반',e:'🏅',p:0,g:0,m:80,img:'img/sk/m25.webp',a:4,h:0,from:MS2},{n:'분홍 마차 가게',e:'🏅',p:0,g:0,m:80,img:'img/sk/m26.webp',a:0,h:6,from:MS2},
 {n:'이층 붕어 간판 집',e:'🏅',p:0,g:0,m:120,img:'img/sk/m27.webp',a:0,h:8,from:MS2},{n:'눈 내린 크리스마스 집',e:'🏅',p:0,g:0,m:150,img:'img/sk/m28.webp',a:6,h:5,from:MS2},
 /* 🏅 3차 (1월) */
 {n:'귤 가게',e:'🏅',p:0,g:0,m:30,img:'img/sk/m31.webp',a:2,h:0,from:MS3},{n:'북극곰 가게',e:'🏅',p:0,g:0,m:30,img:'img/sk/m32.webp',a:0,h:3,from:MS3},
 {n:'코코아 머그 가게',e:'🏅',p:0,g:0,m:50,img:'img/sk/m34.webp',a:3,h:0,from:MS3},{n:'이글루 가게',e:'🏅',p:0,g:0,m:50,img:'img/sk/m30.webp',a:0,h:4,from:MS3},
 {n:'복주머니 가게',e:'🏅',p:0,g:0,m:80,img:'img/sk/m36.webp',a:4,h:0,from:MS3},{n:'군고구마 가게',e:'🏅',p:0,g:0,m:80,img:'img/sk/m35.webp',a:0,h:6,from:MS3},
 {n:'얼음 성',e:'🏅',p:0,g:0,m:120,img:'img/sk/m33.webp',a:0,h:8,from:MS3},{n:'설날 한옥 떡집',e:'🏅',p:0,g:0,m:150,img:'img/sk/m29.webp',a:6,h:5,from:MS3}];
const SLOTS=[{k:'skin',n:'외관',L:SKIN},{k:'sign',n:'간판',L:SIGN},{k:'shape',n:'틀 모양',L:MSH},{k:'top',n:'지붕 장식',L:TOP},{k:'awn',n:'차양',L:AWN},{k:'wall',n:'벽',L:WALL},{k:'floor',n:'바닥',L:FLOOR},{k:'sL',n:'왼쪽 장식',L:SIDE},{k:'sR',n:'오른쪽 장식',L:SIDE},{k:'mas',n:'마스코트',L:MAS},{k:'lit',n:'조명',L:LIT},{k:'sky',n:'하늘',L:SKY}];
const GR=[{n:'노점',e:'🛒',at:0},{n:'골목 가게',e:'🏠',at:60},{n:'동네 맛집',e:'🍴',at:250},{n:'줄 서는 가게',e:'🚶',at:700},{n:'소문난 명가',e:'🏮',at:1500},{n:'전국구 맛집',e:'🌏',at:3000},{n:'전설의 가게',e:'👑',at:6000}];
const charmOf=it=>{const v=it.p>0?it.p:(it.st?it.st*1500:0);return v>0?Math.floor(Math.log2(v/200+1)):0};
/* ---------- 저장 ---------- */
const DEF=()=>({v:1,name:'',seed:(Math.random()*4294967296)>>>0,coins:0,day:1,up:{mold:0,speed:0,auto:0,pat:0,deco:0,loc:0},nf:1,nfUse:1,fu:[0,0,0,0,0,0],served:0,days:0,stars:0,dex:{},dexS:{},dexAll:0,own:{skin:[0],shape:[0],top:[0],sign:[0],awn:[0],wall:[0],floor:[0],sL:[0],sR:[0],mas:[0],lit:[0],sky:[0]},eq:{skin:0,shape:0,top:0,sign:0,awn:0,wall:0,floor:0,sL:0,sR:0,mas:0,lit:0,sky:0},avg:0,bestNet:0,bestCombo:0,snd:true,fur:null,inv:{},room:5,r5:1,st:{bake:1,serve:1,promo:0},bought:[]});
let save=DEF();try{const o=JSON.parse(localStorage.getItem(KEY));if(o&&typeof o==='object'){if(Array.isArray(o.fur))o.fur=o.fur.filter(f=>!f.pend);save=Object.assign(DEF(),o);save.up=Object.assign(DEF().up,o.up);save.own=Object.assign(DEF().own,o.own);if(!save.st||typeof save.st!=='object')save.st=DEF().st;if(!Array.isArray(save.bought))save.bought=[];save.eq=Object.assign(DEF().eq,o.eq);if(!save.dex)save.dex={};if(!Array.isArray(save.fu))save.fu=[0,0,0,0,0,0];if(!save.inv||typeof save.inv!=='object')save.inv={};if(!(save.room>=4))save.room=4;if(!o.r5){/* 📐 11/8 모든 가게 +1칸 */save.room=Math.min(11,save.room+1);save.bought=save.bought.map(x=>(x|0)+1);save.r5=1}if(!save.dexS)save.dexS={}}}catch(e){}
const store=()=>{if(window.__noStore)return;/* 기록 옮겨 받는 중엔 덮어쓰지 않기 */try{localStorage.setItem(KEY,JSON.stringify(save))}catch(e){}};
/* 처음 가구: 새 가게(또는 업데이트 전 가게)에 탁자·의자 2개·화분을 놓아 드려요 */
const starter=()=>{if(Array.isArray(save.fur))return;save.inv=Object.assign({chair:2,table:1,plant:1},save.inv);save.fur=[{k:'table',x:0,y:2,d:0},{k:'chair',x:0,y:3,d:1},{k:'chair',x:1,y:2,d:1},{k:'plant',x:0,y:1,d:0}];store()};starter();
const gradeOf=n=>{let g=0;for(let i=0;i<GR.length;i++)if(n>=GR[i].at)g=i;return g};
/* 🏪 11/14 VOC: 등급 점수 = 도와주기로 직접 대접한 손님 + 자동 영업 손님 4명당 1점 (6.13.10: 절반은 꾸밈 많은 가게가 3단계씩 뛰어서 낮춤) */
const grPts=()=>(save.served|0)+Math.floor((save.bizCust|0)/4);
const grade=()=>gradeOf(grPts());
const eqIt=(k,pv)=>{const sl=SLOTS.find(x=>x.k===k);const id=pv&&pv.k===k?pv.id:eqG(k);return sl.L[id]||sl.L[0]};
/* 11/8 다양하게 놓기 보너스: 가구 종류 하나마다 꾸미기 점수 +150 · 매력 +1 (같은 걸 여러 개 놓아도 깎이진 않아요) */
/* ✨ 11/9 가구 반짝 강화 ★1~3: 놓인 가구를 골라 코인으로 강화(값의 3배·8배·20배, 합 31배) → 반짝이 + 꾸미기 점수(들인 돈/200)
   보관함에 넣어도 ★은 남아요(save.stS {키:[★…]}) → 다시 놓을 때 높은 ★부터 돌아와요. 서버엔 'k,x,y,d,s' */
const STC=[3,8,20],STS=[0,3,11,31];
const stCost=it=>{const f=IS.CK(it.k);return f&&(it.s|0)<3?f.p*STC[it.s|0]:0};
/* 🏢 2층: 가구는 save.fur(1층) + save.fur2(2층). F2V = 지금 2층을 보는 중 */
let F2V=false;
/* 🧱 11/11 2층 벽지·바닥은 따로 (save.eq2 {wall,floor}, 없으면 1층 것). 산 무늬(save.own)는 두 층 같이 써요 */
const F2K=k=>F2V&&(k==='wall'||k==='floor'),eqG=k=>F2K(k)&&save.eq2&&save.eq2[k]!=null?save.eq2[k]:save.eq[k],eqS=(k,id)=>{if(F2K(k)){save.eq2=save.eq2||{};save.eq2[k]=id}else save.eq[k]=id};const allFur=()=>(save.fur||[]).concat(save.fur2||[]),FUR=()=>F2V?save.fur2:save.fur,RMN=()=>F2V?BIZ.f2Of(save):save.room,setFUR=a=>{if(F2V)save.fur2=a;else save.fur=a};
/* 💎 1,000만 넘는 가구는 점수가 1/10씩만 (순위 점수 폭주 막기) */
const ptV=p=>p<=1e7?p:1e7+(p-1e7)/10;
const stScore=()=>{let v=0;allFur().forEach(it=>{const f=IS.CK(it.k);if(f&&it.s&&!it.pend)v+=ptV(f.p)*STS[Math.min(3,it.s|0)]});return Math.floor(v/200)};
function grabS(k){const L=save.stS&&save.stS[k];if(!L||!L.length)return 0;L.sort((a,b)=>a-b);const v=L.pop();if(!L.length)delete save.stS[k];return v|0}
function keepS(it){if(it&&it.s&&!it.pend){save.stS=save.stS||{};(save.stS[it.k]=save.stS[it.k]||[]).push(it.s|0)}}
const fmtS=n=>n>=1e4?(Math.round(n/1e3)/10).toLocaleString('ko-KR')+'만':fmt(n);
const KIND_PT=150,kindsN=()=>{const k=new Set();allFur().forEach(it=>{if(IS.CK(it.k))k.add(it.k)});return k.size};
const charm=()=>SLOTS.reduce((a,s)=>a+charmOf(eqIt(s.k)),0)+allFur().reduce((a,it)=>{const f=IS.CK(it.k);return a+(f?charmOf(f):0)},0)+kindsN();
const charmBonus=()=>Math.min(BIZ.charmCap(save),charm()*.0023); /* 11/10 매력 상한은 가게 크기에 따라 15%~40% */
/* 11/10 알바 값 내림 → 예전 값으로 산 차액 계산(한 번만) */try{BIZ.ec2(save)}catch(e){}
if(!Array.isArray(save.fur2))save.fur2=[];else save.fur2=save.fur2.filter(f=>f&&!f.pend);save.f2=BIZ.f2Of(save);
/* 🏅 메달 스킨 효과 (쓰고 있는 스킨만): a = 손님 +%, h = 도와주기 수익 +% · 가게에만, 챌린지엔 없음 */
const skBuf=()=>{const it=SKIN[save.eq.skin|0]||{};return{a:(it.a|0)/100,h:(it.h|0)/100}};
const skTxt=it=>(it.a?'👥+'+it.a+'%':'')+(it.a&&it.h?' ':'')+(it.h?'🙋+'+it.h+'%':'');
const nm=()=>save.name||'붕어빵';
/* 사장님 그림: 0=기본(코드 그림), 1=곰, 2=얼룩곰 */
const COOKS=[{n:'기본 요리사'},{n:'곰 사장님',f:'img/cook1.webp?v=2'},{n:'얼룩곰 사장님',f:'img/cook2.webp?v=2'},{n:'고양이 사장님',f:'img/cook3.webp?v=2'},{n:'너구리 사장님',f:'img/cook4.webp?v=2'}];
/* 직원 전용 그림 */if(typeof ART_LOAD==='function')ART_LOAD({st_bake:'img/st_bake.webp?v=2',st_serve:'img/st_serve.webp?v=2',st_promo:'img/st_promo.webp?v=2',st_barista:'img/st_barista.webp?v=2',st_bake2:'img/st_bake2.webp',st_serve2:'img/st_serve2.webp'});
function applyCook(){const c=COOKS[save.cook|0]||COOKS[0];if(c.f){const im=new Image();im.src=c.f;window.ART_IMG.cook=im}else delete window.ART_IMG.cook}
applyCook();
/* 꾸미기 점수: 꾸밈 칸 가치 + 놓은 가구 가치(가격/100) + 가구 종류 보너스 + 넓이 → 가게 레벨(손님 수·주문 크기) */
function decoScore(){let sc=0;SLOTS.forEach(sl=>{const it=sl.L[save.eq[sl.k]]||sl.L[0];const v=it.p>0?it.p:(it.st?it.st*1500:0);sc+=Math.floor(v/100)});
 const kinds=new Set();allFur().forEach(it=>{const f=IS.CK(it.k);if(f){sc+=Math.floor(ptV(f.p)/100);kinds.add(it.k)}});sc+=kinds.size*KIND_PT+((save.room-1)*(save.room-1)-16)*15+BIZ.f2Of(save)*BIZ.f2Of(save)*15; /* 11/8 +1칸 뒤에도 점수는 그대로 */
 /* 테마 세트를 다 놓으면 보너스 */IS.SETS.forEach(st=>{if(setDone(st.k,kinds))sc+=(st.b||IS.SET_BONUS)});return sc+stScore()}
function setDone(k,kinds){kinds=kinds||new Set(allFur().map(it=>it.k));return IS.FUR.filter(f=>f.set===k).every(f=>kinds.has(f.k))}
const shopLv=()=>Math.min(40,1+Math.floor(Math.sqrt(decoScore()/20)));
/* ---------- 상태 ---------- */
let scr='home',paused=false,acc=0,last=0,run=null,s=null,ui={ft:[],pa:[],rb:0,ma:[],tp:[],fly:[],coin:[],shake:0,hud:0},prev=null,dtab=0,goals=[],bg=null;
const walk=[0,1,2,3].map(i=>({off:i*131,sp:22+i*7,an:R.an[(i*3+1)%12]}));
const show=n=>{['hm','dc','up','res','pause','set','col','nm','rk','vs','led','stv','gbv'].forEach(i=>$(i).style.display=i===n?'block':'none');$('home2').style.display=scr==='game'||scr==='cafe'?'block':'none';$('toast').classList.toggle('top',scr==='game'||scr==='cafe')};
function toast(t){const e=$('toast');e.textContent=t;e.style.opacity=1;clearTimeout(toast.h);toast.h=setTimeout(()=>e.style.opacity=0,1800)}
const esc=t=>String(t).replace(/[<>&"]/g,c=>({'<':'&lt;','>':'&gt;','&':'&amp;','"':'&quot;'}[c]));
function ask(btn,label,fn){if(btn.dataset.a!=='1'){btn.dataset.a='1';btn.dataset.o=btn.textContent;btn.textContent=label;setTimeout(()=>{if(btn.dataset.a==='1'){btn.dataset.a='0';btn.textContent=btn.dataset.o}},3000)}else{btn.dataset.a='0';btn.textContent=btn.dataset.o;fn()}}
/* ---------- 소리 ---------- */
/* js/audio.js 공용 소리 (음악·효과음). 옛 '소리 꺼짐'은 효과음 꺼짐으로 한 번 옮겨요 */
const AU=window.AUDIO;const au=()=>{if(AU)AU.unlock()};
const snd=(k,o)=>{if(AU)AU.sfx(k,o||{combo:s?s.combo:0})};
if(save.snd===false&&AU){try{if(!localStorage.getItem('bpAudio'))AU.set('fx',0)}catch(e){}}
if(AU)AU.music('shop');
/* ---------- 그리기 도구 ---------- */
const A=ART(cx,{shape:()=>save.eq.shape|0,toast:t=>toast(t),snd:k=>snd(k)});
const IS=ISO(cx,A);
const {E,em,tx,rr,m2,fish,rgbOf,mix,lite,dark,animal,fish2,shapePath,bread,bakeCol,steam,mold,custDraw,mpos,hit,at}=A;
/* ---------- 경영: 직원이 알아서 장사 (js/biz.js) ---------- */
const seatsN=()=>IS.seatCount((save.fur||[]).filter(it=>IS.inRoom(it.x,it.y,save.room)))+IS.seatCount((save.fur2||[]).filter(it=>IS.inRoom(it.x,it.y,BIZ.f2Of(save))));
const bctx=()=>({lv:shopLv(),charm:charmBonus()+skBuf().a+lkBuf(),seats:seatsN()});
let bizPop=0,bizFl=[],bizT=0,bizN=0;
/* ⭐📅 하루가 바뀌면 평점 정리 · 단체 주문 시간 넘으면 실패 */
function dayTick(){const ms=Date.now(),R0=BIZ.rtDaily(save,ms,bctx());if(R0&&R0.dv&&save.name)setTimeout(()=>toast('⭐ 가게 평점 '+R0.v.toFixed(1)+' ('+(R0.dv>0?'+':'')+R0.dv.toFixed(2)+')'+(R0.rv[0]?' · '+R0.rv[0]:'')),900);
 const f=BIZ.evCheck(save,ms);if(f&&f.fail){toast('🚌 단체 주문 시간이 지났어요… 평점 −0.3');store()}}
function bizTick(away){dayTick();const gb=save.name?grade():0;const g=BIZ.settle(save,Date.now(),bctx());if(!g)return null;if(save.name&&grade()>gb){const ng=grade();setTimeout(()=>{snd('fanfare');if(window.JUICE)JUICE.confetti(80);toast('🎉 놔둔 사이 손님이 많이 와서 '+GR[ng].e+' '+GR[ng].n+'(으)로 올랐어요!')},away?2500:300)}if(g.whole>0)bizPop+=g.whole;if(away&&g.h>=3/60&&save.name)awayCard(g);return g}
const hm=h=>{const m=Math.max(1,Math.round(h*60));return m>=60?Math.floor(m/60)+'시간'+(m%60?' '+m%60+'분':''):m+'분'};
const n1=x=>String(Math.round(x*10)/10);
const lgRow=(lab,v,minus)=>'<div class="lg'+(minus?' m':'')+'"><span>'+lab+'</span><span>'+(minus?'−':'+')+fmt(Math.round(v))+'</span></div>';
/* 📒 장부 한 칸: 남은 돈을 크게 + 매출을 막대 하나로 쪼개서(순이익·재료·월세·월급·세금) */
function lgBlock(x,title,extra){const zr=x.zr||0,net=x.rev-x.mat-x.rent-x.wage-x.tax-zr,rev=Math.max(1,x.rev);
 const seg=[['순이익',Math.max(0,net),'#6cc87a'],['🧂 재료',x.mat,'#ffb04a'],['🏠 월세',x.rent,'#7ab8ff'],['📍 자리값',zr,'#ff8ab0'],['👥 월급',x.wage,'#c08aff'],['🏛️ 세금',x.tax,'#b0a8a0']];
 return'<div class="lgb">'+(title?'<b style="font-size:14px">'+title+'</b>':'')+'<div class="tt"><span>🐾 '+fmt(Math.round(x.cust))+'명'+(x.drk>0?' · ☕ '+fmt(Math.round(x.drk))+'잔':'')+' · 💰 '+fmt(Math.round(x.rev))+'</span><b class="'+(net<0?'neg':'')+'">'+(net<0?'−':'+')+fmt(Math.abs(Math.round(net)))+'🪙</b></div>'+
  '<div class="lbar">'+seg.map(q=>q[1]>0?'<i style="width:'+(q[1]/Math.max(rev,x.mat+x.rent+x.wage+x.tax+zr)*100).toFixed(1)+'%;background:'+q[2]+'"></i>':'').join('')+'</div>'+
  '<div class="lgl">'+seg.slice(1).filter(q=>q[1]>0).map(q=>'<span style="--c:'+q[2]+'">'+q[0]+' −'+fmt(Math.round(q[1]))+'</span>').join('')+'</div>'+(extra||'')+'</div>'}
function nkBox(r){const c=k=>r.neck===k||(r.neck==='both'&&k!=='arrive')?' class="on"':'';return'<div class="nk"><div'+c('arrive')+'>🐾 오는 손님<b>'+n1(r.arrive)+'</b>명/시간</div><div'+c('bake')+'>🍞 굽기<b>'+n1(r.bake)+'</b>명/시간</div><div'+c('serve')+'>🧾 계산<b>'+n1(r.serve)+'</b>명/시간</div></div>'}
const NKT={arrive:'🐾 손님이 더 와야 해요 → 📣 홍보 알바 · 🎨 꾸미기(가게 Lv)',bake:'🍞 굽기가 밀려요 → 굽기 알바를 키워요',serve:'🧾 계산이 밀려요 → 계산 알바를 키워요',both:'🍞 굽기 · 🧾 계산이 같이 밀려요 → 두 알바를 함께 키워요'};
const debtTxt=()=>save.debt>0?'<p class="ht" style="color:#c03030">💸 밀린 돈 '+fmt(Math.ceil(save.debt))+'원 · 다 갚을 때까지 알바가 절반만 일해요 (월급도 절반). 들어오는 돈으로 먼저 갚아요</p>':'';
function bzShow(e,t,h,b1,f1,b2,f2){bzShow.t=Date.now();$('bzb').scrollTop=0;$('bze').textContent=e;$('bzt').textContent=t;$('bzb').innerHTML=h;$('bz1').textContent=b1;$('bz1').onclick=()=>{bzHide();f1&&f1()};$('bz2').style.display=b2?'block':'none';if(b2){$('bz2').textContent=b2;$('bz2').onclick=()=>{bzHide();f2&&f2()}}$('bz').style.display='block'}
function bzHide(){$('bz').style.display='none'}
$('bzx').onclick=()=>{snd('tap');bzHide()};/* 11/14 VOC '눌러도 안 열려요': 폰은 손을 뗀 뒤 click이 한 번 더 와서, 방금 연 창의 바깥을 누른 걸로 쳐서 바로 닫혔어요 → 연 직후 0.5초는 무시 */$('bz').addEventListener('click',e=>{if(e.target===$('bz')&&Date.now()-(bzShow.t||0)>500)bzHide()});
function awayCard(g){bzShow('🌙','자리 비운 동안 '+hm(g.h),'<p class="ht" style="text-align:center;margin-top:0">직원들이 가게를 지켰어요!</p>'+lgBlock(g,'')+(g.capped?'<p class="ht" style="text-align:center">⏰ 8시간까지만 쌓여요. 자주 들러 주세요!</p>':'')+(g.paid?'<p class="ht">💸 밀린 돈 '+fmt(g.paid)+'원을 갚았어요</p>':'')+debtTxt(),'🪙 좋아요!',null,'📒 장부 보기',()=>openLed())}
function bizIntro(){save.biz=1;store();bzShow('💼','이제 가게가 혼자서도 장사해요!','• 개업 선물: 🍞 굽기 알바 · 🧾 계산 알바 Lv1<br>• 자리를 비워도 <b>최대 8시간</b>까지 장사해요<br>• 매출에서 재료비 · 월세 · 월급 · 세금(10%)을 빼고 남은 돈이 들어와요<br>• 넓은 가게는 월세가 있어요. <b>가게를 사면 월세 0원!</b><br>• 심심할 때 <b>🙋 도와주기</b>로 직접 구워 더 벌어요','👥 직원 보러 가기',()=>openUp('home',0),'좋아요',null)}
/* ⭐ 받을 수 있는 별 보상 (같은 이름은 한 번만) */
function starRw(){const rw=[];SLOTS.forEach(sl=>sl.L.forEach((it,i)=>{if(!it.p&&it.st&&!rw.some(x=>x.n===it.n))rw.push({n:it.n,e:it.e,st:it.st,sl:sl.n,k:sl.k,i,own:save.own[sl.k].includes(i)})}));return rw.sort((a,b)=>a.st-b.st)}
function starDot(){const b=$('h4');if(!b)return;const n=starRw().filter(x=>!x.own&&save.stars>=x.st).length;b.style.position='relative';b.innerHTML='📖 도감·⭐'+(n?'<i style="position:absolute;top:-6px;right:-4px;min-width:22px;height:22px;border-radius:11px;background:#ff4a3a;color:#fff;font-size:14px;line-height:22px;font-style:normal;box-shadow:0 2px 0 #c02a1a">'+n+'</i>':'')}
function bizBtn(){starDot();const b=$('biz');if(!b)return;if(save.debt>0){b.className='debt';b.textContent='💸 밀린 돈 '+fmt(Math.ceil(save.debt))}else{const r=BIZ.rates(save,bctx());b.className='';b.textContent='💼 영업 중 '+(r.net>=0?'+':'−')+fmt(Math.abs(Math.round(r.net)))+'/시간'}}
/* 계절: 14일마다 바뀌어요 (봄→여름→가을→겨울) */
const seasonOf=d=>Math.floor((d-1)/14)%4,SEAS=['🌸 봄','☀️ 여름','🍂 가을','❄️ 겨울'];
/* ---------- 실제 날짜 (한국 시간, 모두 같은 날씨·이벤트·목표) ---------- */
const kdate=()=>new Date(Date.now()+9*3600e3),dayKey=()=>Math.floor((Date.now()+9*3600e3)/864e5);
const seasonNow=()=>{const m=kdate().getUTCMonth()+1;return m>=3&&m<=5?0:m>=6&&m<=8?1:m>=9&&m<=11?2:3};
const dateStr=()=>{const d=kdate();return(d.getUTCMonth()+1)+'월 '+d.getUTCDate()+'일 ('+'일월화수목금토'[d.getUTCDay()]+')'};
function todayWx(){const dk=dayKey(),ev=B.evOf(dk);let wi=0;const r=B.mul(B.hs(777,dk))()*100;let a=0;for(let i=0;i<R.wea.length;i++){a+=R.wea[i].w;if(r<a){wi=i;break}}if(ev==='fest')wi=0;else if(ev==='bomb')wi=1;return{wea:R.wea[wi],ev}}
function seasonFx(t,W_,H_,dens=1){const se=seasonNow();
 if(se===0){cx.fillStyle='rgba(255,160,190,.9)';for(let i=0;i<Math.round(22*dens);i++){const x=m2(i*61+Math.sin(t*1.2+i)*24+t*12,W_+20)-10,y=m2(i*89+t*34,H_);cx.beginPath();cx.ellipse(x,y,4.4,2.6,t*1.5+i,0,7);cx.fill()}}
 else if(se===2){for(let i=0;i<Math.round(14*dens);i++){const x=m2(i*79+Math.sin(t*1.1+i)*30+t*8,W_+20)-10,y=m2(i*111+t*38,H_);cx.save();cx.translate(x,y);cx.rotate(t*1.4+i);em(i%2?'🍁':'🍂',0,0,18);cx.restore()}}
 else if(se===3){cx.fillStyle='rgba(255,255,255,.92)';for(let i=0;i<Math.round(34*dens);i++){const x=m2(i*53+Math.sin(t*1.5+i)*16,W_+10),y=m2(i*97+t*(34+(i%5)*8),H_);cx.beginPath();cx.arc(x,y,i%3?2.2:3.2,0,7);cx.fill()}}}
/* ---------- 가게 그림 (논리 크기 450×420) ---------- */
const SKYC=[['#9fd8ff','#e8f7ff'],['#ff9a6a','#ffe0a8'],['#141c4a','#3d4c8c'],['#b5c4d8','#f0f4fa'],['#ffcfe0','#fff2f7'],['#ff6a3d','#ffc58a'],['#0c1440','#1d3a6a'],['#9fd8ff','#e8f7ff'],['#7acefa','#c5f2f9'],['#62c2f9','#d7f4f9'],['#b5dff8','#faebec'],['#b5defa','#dfeef8'],['#d3c0ee','#fadde4'],['#101d47','#54558f'],['#8ecdf5','#f1f4f0'],['#201b64','#665abe']];
const id_=(k,pv)=>pv&&pv.k===k?pv.id:eqG(k);
function drawSky(k,t){let c=SKYC[k]||SKYC[0];if(k===0){const se=seasonNow();if(se===2)c=['#8fcdff','#e6f4ff'];else if(se===3)c=['#b8cde4','#eef4fb'];else if(se===0)c=['#b6e0ff','#f4f9ff']}const g=cx.createLinearGradient(0,0,0,420);g.addColorStop(0,c[0]);g.addColorStop(1,c[1]);cx.fillStyle=g;cx.fillRect(0,0,450,420);{const b=skyBg(k);if(b&&b.im&&b.im.complete&&b.im.naturalWidth){const ih=Math.max(420,450*b.im.naturalHeight/b.im.naturalWidth),iw=ih*b.im.naturalWidth/b.im.naturalHeight;cx.drawImage(b.im,(450-iw)/2,420-ih,iw,ih)}}if(k===0)seasonFx(t,450,420,1);
 if(k===0||k===7){em('☀️',385,42,54);cx.fillStyle='rgba(255,255,255,.85)';for(let i=0;i<3;i++){const x=m2(t*7+i*170,560)-70,y=30+i*24;cx.beginPath();cx.ellipse(x,y,38,13,0,0,7);cx.ellipse(x+22,y-8,24,12,0,0,7);cx.fill()}}
 if(k===7){const cl=['#ff5a5a','#ff9a3a','#ffd93a','#6ccf5a','#4aa8ff','#4a5aff','#a85aff'];cx.lineWidth=9;for(let i=0;i<7;i++){cx.strokeStyle=cl[i];cx.globalAlpha=.8;cx.beginPath();cx.arc(225,215,200-i*9,Math.PI,Math.PI*2);cx.stroke()}cx.globalAlpha=1}
 if(k===1){cx.fillStyle='#ff7a3a';cx.beginPath();cx.arc(370,60,34,0,7);cx.fill();cx.fillStyle='rgba(255,255,255,.5)';for(let i=0;i<2;i++){const x=m2(t*5+i*220,560)-70;cx.beginPath();cx.ellipse(x,36+i*26,36,10,0,0,7);cx.fill()}}
 if(k===2||k===6){for(let i=0;i<30;i++){cx.globalAlpha=.35+.65*Math.abs(Math.sin(t*1.7+i*2.3));cx.fillStyle='#fff';cx.fillRect((i*83)%450,(i*47)%150,2.4,2.4)}cx.globalAlpha=1;if(k===2)em('🌙',62,46,46)}
 if(k===6){for(let b=0;b<3;b++){const g2=cx.createLinearGradient(0,0,0,200);g2.addColorStop(0,b%2?'rgba(120,255,200,.0)':'rgba(180,120,255,.0)');g2.addColorStop(.5,b%2?'rgba(120,255,200,.5)':'rgba(180,120,255,.45)');g2.addColorStop(1,'rgba(0,0,0,0)');cx.fillStyle=g2;cx.beginPath();cx.moveTo(0,40+b*20);for(let x=0;x<=450;x+=30)cx.lineTo(x,50+b*22+Math.sin(x/70+t*.9+b)*22);cx.lineTo(450,200);cx.lineTo(0,200);cx.closePath();cx.fill()}}
 if(k===3){cx.fillStyle='rgba(255,255,255,.95)';for(let i=0;i<40;i++){const x=m2(i*53+Math.sin(t*1.5+i)*16,450),y=m2(i*97+t*38,420);cx.beginPath();cx.arc(x,y,2.4,0,7);cx.fill()}}
 if(k===4){cx.fillStyle='rgba(255,150,185,.9)';for(let i=0;i<30;i++){const x=m2(i*61+Math.sin(t*1.2+i)*22+t*10,450),y=m2(i*89+t*30,420);cx.beginPath();cx.ellipse(x,y,4,2.4,t+i,0,7);cx.fill()}}
 if(k===5){cx.fillStyle='rgba(255,230,180,.35)';cx.beginPath();cx.arc(360,70,46,0,7);cx.fill();for(let i=0;i<22;i++){const x=m2(i*79+Math.sin(t+i)*26+t*8,450),y=m2(i*111+t*(30+i%4*6),420);cx.save();cx.translate(x,y);cx.rotate(Math.sin(t*1.6+i)*.8);em(i%3?'🍁':'🍂',0,0,14+i%3*5);cx.restore()}}}
function wallPat(id,c,t){const x=30,y=72,w=390,h=270;
 rr(x,y,w,h,8,id===8?(()=>{const g=cx.createLinearGradient(x,y,x+w,y+h);g.addColorStop(0,'#fbe58a');g.addColorStop(.5,'#f0c850');g.addColorStop(1,'#e8b832');return g})():c);
 cx.save();cx.beginPath();cx.roundRect(x,y,w,h,8);cx.clip();
 if(id===4){cx.strokeStyle='rgba(60,20,10,.4)';cx.lineWidth=2;for(let r=0;r<16;r++){const yy=y+r*18;cx.beginPath();cx.moveTo(x,yy);cx.lineTo(x+w,yy);cx.stroke();const o=r%2?0:36;for(let xx=x+o;xx<x+w;xx+=72){cx.beginPath();cx.moveTo(xx,yy);cx.lineTo(xx,yy+18);cx.stroke()}}}
 else if(id===5){cx.strokeStyle='rgba(80,50,20,.35)';cx.lineWidth=2;for(let xx=x;xx<x+w;xx+=26){cx.beginPath();cx.moveTo(xx,y);cx.lineTo(xx,y+h);cx.stroke()}}
 else if(id===6){for(let r=0;r<9;r++)for(let q=0;q<13;q++){if((r+q)%2){cx.fillStyle='rgba(120,160,200,.16)';cx.fillRect(x+q*30,y+r*30,30,30)}}cx.strokeStyle='rgba(150,150,140,.5)';cx.lineWidth=1.5;for(let r=0;r<=9;r++){cx.beginPath();cx.moveTo(x,y+r*30);cx.lineTo(x+w,y+r*30);cx.stroke()}for(let q=0;q<=13;q++){cx.beginPath();cx.moveTo(x+q*30,y);cx.lineTo(x+q*30,y+h);cx.stroke()}}
 else if(id===7){cx.strokeStyle='rgba(140,130,130,.28)';cx.lineWidth=2;for(let i=0;i<9;i++){cx.beginPath();cx.moveTo(x+i*50,y);cx.bezierCurveTo(x+i*50+40,y+90,x+i*50-30,y+170,x+i*50+20,y+h);cx.stroke()}}
 else if(id===8){for(let i=0;i<5;i++){cx.globalAlpha=.4+.6*Math.abs(Math.sin(t*1.5+i*1.7));em('✨',x+50+i*80,y+30+(i%3)*80,18)}cx.globalAlpha=1}
 else if(id>=9)IS.wallMotif(id,(u,v)=>({x:x+u*w,y:y+h-v*h}),w,h,t);
 cx.restore()}
function signDraw(id,t){const x=115,y=92,w=220,h=50,name=nm();rr(x+4,y+7,w,h,12,'rgba(0,0,0,.22)');cx.strokeStyle='#6a4a2a';cx.lineWidth=3;cx.beginPath();cx.moveTo(150,80);cx.lineTo(150,y+4);cx.moveTo(300,80);cx.lineTo(300,y+4);cx.stroke();
 const fs=name.length>6?24:28,cy=y+h/2;
 if(id===0){rr(x,y,w,h,10,'#b9824f');cx.lineWidth=4;cx.strokeStyle='#7a4a22';cx.beginPath();cx.roundRect(x,y,w,h,10);cx.stroke();tx(name,225,cy,fs,'#fff8e0','center','#6a3a14')}
 else if(id===1){cx.fillStyle='#e0607f';cx.beginPath();cx.moveTo(x-16,y+8);cx.lineTo(x+6,y+8);cx.lineTo(x+6,y+h-8);cx.lineTo(x-16,y+h-8);cx.lineTo(x-6,y+h/2);cx.closePath();cx.fill();cx.beginPath();cx.moveTo(x+w+16,y+8);cx.lineTo(x+w-6,y+8);cx.lineTo(x+w-6,y+h-8);cx.lineTo(x+w+16,y+h-8);cx.lineTo(x+w+6,y+h/2);cx.closePath();cx.fill();rr(x,y,w,h,12,'#ffb3c6');tx(name,225,cy,fs,'#fff','center','#d0486a')}
 else if(id===2){rr(x,y,w,h,8,'#2f3a33');cx.lineWidth=5;cx.strokeStyle='#caa66a';cx.beginPath();cx.roundRect(x,y,w,h,8);cx.stroke();tx(name,225,cy,fs,'#f6f6e8','center','#2f3a33');cx.fillStyle='rgba(255,255,255,.25)';cx.fillRect(x+12,y+h-9,w-24,2)}
 else if(id===3){rr(x,y,w,h,12,'#1a1030');cx.save();cx.shadowColor='#ff4fd8';cx.shadowBlur=10+6*Math.sin(t*3);cx.lineWidth=4;cx.strokeStyle='#ff4fd8';cx.beginPath();cx.roundRect(x+2,y+2,w-4,h-4,12);cx.stroke();cx.restore();cx.save();cx.shadowColor='#ff8ae8';cx.shadowBlur=14;tx(name,225,cy,fs,'#ffc0f4','center','rgba(0,0,0,0)');cx.restore()}
 else if(id===4){const g=cx.createLinearGradient(x,y,x,y+h);g.addColorStop(0,'#fff0a0');g.addColorStop(.5,'#f0c030');g.addColorStop(1,'#c89010');rr(x,y,w,h,10,g);cx.lineWidth=4;cx.strokeStyle='#8a6a10';cx.beginPath();cx.roundRect(x,y,w,h,10);cx.stroke();tx(name,225,cy,fs,'#5a3a00','center','#ffe99a')}
 else if(id===5){rr(x,y,w,h,12,'#fff');const g=cx.createLinearGradient(x,0,x+w,0);['#ff5a5a','#ff9a3a','#ffd93a','#6ccf5a','#4aa8ff','#a85aff'].forEach((c,i)=>g.addColorStop(i/5,c));cx.lineWidth=6;cx.strokeStyle=g;cx.beginPath();cx.roundRect(x+3,y+3,w-6,h-6,10);cx.stroke();tx(name,225,cy,fs,'#5a3a22','center','#fff')}
 else if(id===6){cx.save();cx.shadowColor='#ffd23a';cx.shadowBlur=14+6*Math.sin(t*2);const g=cx.createLinearGradient(x,y,x,y+h);g.addColorStop(0,'#fff0a0');g.addColorStop(.5,'#f0c030');g.addColorStop(1,'#b88008');rr(x,y,w,h,12,g);cx.restore();cx.lineWidth=4;cx.strokeStyle='#8a6a10';cx.beginPath();cx.roundRect(x,y,w,h,12);cx.stroke();tx(name,225,cy,fs,'#5a3a00','center','#ffe99a');em('👑',225,y-4,34)}
 else{rr(x,y,w,h,12,'#1c2a6a');cx.lineWidth=3;cx.strokeStyle='#ffe066';cx.beginPath();cx.roundRect(x+2,y+2,w-4,h-4,12);cx.stroke();tx(name,225,cy,fs,'#fff6c0','center','#1c2a6a');for(let i=0;i<4;i++){cx.globalAlpha=.4+.6*Math.abs(Math.sin(t*2+i*1.4));em('✨',x+8+i*66,i%2?y+h+2:y-2,16)}cx.globalAlpha=1}}
const RB=['#ff5a5a','#ff9a3a','#ffd93a','#6ccf5a','#4aa8ff','#4a5aff','#a85aff'];
function awnDraw(id,t){const x0=66,n=14,w=318/n,y=150,h=26;
 {const g=cx.createLinearGradient(0,y+h,0,y+h+34);g.addColorStop(0,'rgba(0,0,0,.28)');g.addColorStop(1,'rgba(0,0,0,0)');cx.fillStyle=g;cx.fillRect(x0,y+h+4,n*w,34)}
 for(let i=0;i<n;i++){let c;if(id===0)c=i%2?'#fff':'#e8584a';else if(id===1)c=i%2?'#fff':'#4a8ae8';else if(id===2)c=i%2?'#fff':'#4ab870';else if(id===3)c=i%2?'#ffd0e0':'#ffb3c9';else if(id===4)c=i%2?'#fff':'#ffc93a';else if(id===5)c=RB[i%7];else if(id===6)c=i%2?'#34459a':'#2a3a7a';else if(id===7)c=i%2?'#ffd6e6':'#ffc0d8';else c=i%2?'#f5c542':'#dba420';
  cx.fillStyle=c;cx.fillRect(x0+i*w,y,w+.6,h);cx.beginPath();cx.arc(x0+i*w+w/2,y+h,w/2,0,Math.PI);cx.fill()}
 {const g=cx.createLinearGradient(0,y,0,y+h+w/2);g.addColorStop(0,'rgba(0,0,0,.16)');g.addColorStop(.35,'rgba(255,255,255,.1)');g.addColorStop(1,'rgba(0,0,0,.14)');cx.fillStyle=g;cx.fillRect(x0,y,n*w,h);cx.beginPath();for(let i=0;i<n;i++){cx.moveTo(x0+i*w,y+h);cx.arc(x0+i*w+w/2,y+h,w/2,Math.PI,0,true)}cx.fill();cx.strokeStyle='rgba(0,0,0,.12)';cx.lineWidth=1;cx.beginPath();for(let i=1;i<n;i++){cx.moveTo(x0+i*w,y);cx.lineTo(x0+i*w,y+h)}cx.stroke()}
 cx.fillStyle='rgba(0,0,0,.14)';cx.fillRect(x0,y,n*w,4);rr(x0-4,y-6,n*w+8,10,4,'#6a4a2a');
 if(id===3){cx.fillStyle='#fff';for(let i=0;i<n;i++){cx.beginPath();cx.arc(x0+i*w+w/2,y+12,3,0,7);cx.fill()}}
 if(id===6){for(let i=0;i<n;i++){cx.globalAlpha=.4+.6*Math.abs(Math.sin(t*2+i));cx.fillStyle='#ffe066';cx.font='13px sans-serif';cx.textAlign='center';cx.fillText('✦',x0+i*w+w/2,y+14)}cx.globalAlpha=1}
 if(id===7){cx.fillStyle='rgba(255,255,255,.85)';for(let i=0;i<n;i+=2){cx.beginPath();cx.ellipse(x0+i*w+w/2,y+12,4,2.4,i,0,7);cx.fill()}}
 if(id===8){for(let i=0;i<4;i++){cx.globalAlpha=.4+.6*Math.abs(Math.sin(t*1.8+i*1.6));em('✨',x0+30+i*85,y+10,14)}cx.globalAlpha=1}}
function floorDraw(id,t){const y=342,h=78;
 if(id===0){cx.fillStyle='#b8b4ac';cx.fillRect(0,y,450,h);cx.fillStyle='rgba(0,0,0,.06)';for(let i=0;i<8;i++)cx.fillRect(i*64,y,2,h)}
 else if(id===1){for(let r=0;r<3;r++)for(let q=0;q<16;q++){cx.fillStyle=(r+q)%2?'#f6f0e4':'#d2a46a';cx.fillRect(q*30,y+r*26,30,26)}}
 else if(id===2){cx.fillStyle='#c89a64';cx.fillRect(0,y,450,h);cx.strokeStyle='rgba(80,50,20,.35)';cx.lineWidth=2;for(let r=0;r<6;r++){cx.beginPath();cx.moveTo(0,y+r*14);cx.lineTo(450,y+r*14);cx.stroke();for(let q=r%2*40;q<450;q+=80){cx.beginPath();cx.moveTo(q,y+r*14);cx.lineTo(q,y+r*14+14);cx.stroke()}}}
 else if(id===3){cx.fillStyle='#6fbf5a';cx.fillRect(0,y,450,h);cx.strokeStyle='#4f9a3e';cx.lineWidth=2;for(let i=0;i<46;i++){const gx=(i*53)%450,gy=y+8+(i*29)%66;cx.beginPath();cx.moveTo(gx,gy);cx.lineTo(gx-3,gy-8);cx.moveTo(gx,gy);cx.lineTo(gx+3,gy-7);cx.stroke()}for(let i=0;i<6;i++)em(['🌼','🌷'][i%2],(i*79+30)%450,y+22+(i*17)%44,14)}
 else if(id===4){cx.fillStyle='#8a867c';cx.fillRect(0,y,450,h);for(let r=0;r<3;r++)for(let q=-1;q<8;q++){rr(q*64+(r%2?32:0)+2,y+r*26+2,60,22,8,'#cfc9bd')}}
 else if(id===5){cx.fillStyle='#9a968e';cx.fillRect(0,y,450,h);rr(110,y,230,h,0,'#c8283c');cx.fillStyle='#f0c040';cx.fillRect(110,y,6,h);cx.fillRect(334,y,6,h);cx.fillStyle='rgba(255,255,255,.12)';for(let i=0;i<4;i++)cx.fillRect(130+i*50,y,12,h)}
 else{const g=cx.createLinearGradient(0,y,450,y+h);g.addColorStop(0,'#7ad8ff');g.addColorStop(.5,'#c8a8ff');g.addColorStop(1,'#7ad8ff');cx.fillStyle=g;cx.fillRect(0,y,450,h);for(let i=0;i<9;i++){cx.globalAlpha=.3+.7*Math.abs(Math.sin(t*1.6+i*1.3));em('✨',(i*57+20)%450,y+14+(i*23)%54,14)}cx.globalAlpha=1}
 cx.fillStyle='rgba(0,0,0,.18)';cx.fillRect(0,y,450,4)}
function litDraw(id,t,front){
 if(id===1&&!front){for(let i=0;i<14;i++){const x=66+i*22.7+11,on=(i+Math.floor(t*2))%4,c=['#ff6a5a','#ffd23a','#7ed88a','#7ec8ff'][on];cx.fillStyle=c;cx.shadowColor=c;cx.shadowBlur=8;cx.beginPath();cx.arc(x,194,4,0,7);cx.fill();cx.shadowBlur=0}}
 if(id===2&&!front){[[84,132,22],[366,128,26],[66,236,20],[388,240,22],[226,152,18]].forEach((p,i)=>em('⭐',p[0],p[1]+Math.sin(t*2+i)*4,p[2]))}
 if(id===3&&!front){cx.save();cx.shadowBlur=14;const c='hsl('+((t*60)%360)+',100%,65%)';cx.shadowColor=c;cx.strokeStyle=c;cx.lineWidth=4;cx.beginPath();cx.roundRect(98,166,254,136,10);cx.stroke();cx.restore()}
 if(id===4&&!front){const g=cx.createRadialGradient(225,215,5,225,215,90);g.addColorStop(0,'rgba(255,240,170,.55)');g.addColorStop(1,'rgba(255,240,170,0)');cx.fillStyle=g;cx.fillRect(120,180,210,120);cx.strokeStyle='#c89010';cx.lineWidth=2;cx.beginPath();cx.moveTo(225,170);cx.lineTo(225,192);cx.stroke();em('🔮',225,208,34)}
 if(id===5&&front){for(let b=0;b<4;b++){const g=cx.createLinearGradient(0,0,0,420);const c=['120,255,200','180,120,255','120,200,255','255,150,220'][b];g.addColorStop(0,'rgba('+c+',0)');g.addColorStop(.4,'rgba('+c+','+(.16+.08*Math.sin(t*1.3+b))+')');g.addColorStop(1,'rgba('+c+',0)');cx.fillStyle=g;const x=40+b*100+Math.sin(t*.8+b*1.7)*30;cx.beginPath();cx.moveTo(x,0);cx.lineTo(x+60,0);cx.lineTo(x+110,420);cx.lineTo(x+20,420);cx.closePath();cx.fill()}for(let i=0;i<8;i++){cx.globalAlpha=.4+.6*Math.abs(Math.sin(t*2+i*1.9));em('✨',(i*61+25)%450,(i*53+40)%330,13)}cx.globalAlpha=1}}
function scene(t,pv,pop){
 drawSky(id_('sky',pv),t);
 topDraw(id_('top',pv),t,false);
 const wi=id_('wall',pv),wl=WALL[wi]||WALL[0];wallPat(wi,wl.c,t);rr(22,60,406,18,6,wi===8?'#b8860b':'#8a5a3a');rr(22,76,406,8,0,'rgba(0,0,0,.14)');topDraw(id_('top',pv),t,true);
 /* 창문 + 가게 안 */
 const g=cx.createLinearGradient(0,168,0,300);g.addColorStop(0,'#fff6dc');g.addColorStop(1,'#ffd9a0');rr(100,168,250,130,10,g);
 animal('cook',190,240,54,{t,ph:0,mood:'h',shirt:'#ffffff'});{const sw=Math.sin(t*2.4);cx.strokeStyle='#d0a070';cx.lineWidth=6;cx.lineCap='round';cx.beginPath();cx.moveTo(214,286);cx.lineTo(246,270+sw*6);cx.stroke();cx.fillStyle='#c8c8c8';cx.beginPath();cx.roundRect(240,262+sw*6,22,12,3);cx.fill()}
 for(let i=0;i<3;i++){const px=262+i*22,py=287;bread(px,py,.2,'#e8a840',{plain:true,shp:id_('shape',pv)})}
 {const hop=m2(t*.7,1);if(hop<.5){const u=hop/.5;bread(282,282-Math.sin(u*Math.PI)*34,.2,'#f0b850',{rot:u*Math.PI*2,plain:true,shp:id_('shape',pv)})}}
 for(let i=0;i<3;i++){const ph=m2(t*14+i*17,50);cx.globalAlpha=Math.max(0,1-ph/50)*.8;em('💨',262+i*14,272-ph,16);cx.globalAlpha=1}
 const mi=id_('mas',pv),mas=MAS[mi]||MAS[0];
 rr(90,292,270,24,8,'#b97d4a');rr(90,292,270,6,3,'#d9a06a');
 litDraw(id_('lit',pv),t,false);
 if(mi>0){const by=Math.sin(t*3)*2;if(mas.e==='🌟'){fish2(318,274+by,.52,'#ffcf3a',{glow:'#ffe066'});cx.globalAlpha=.5+.5*Math.sin(t*3);em('✨',344,246,16);cx.globalAlpha=1}else animal(mas.e,324,262+by,38,{t,ph:2,mood:'h',shirt:null,bust:true})}
 rr(100,166,250,4,2,'rgba(0,0,0,.18)');cx.lineWidth=6;cx.strokeStyle=wi===8?'#b8860b':'#8a5a3a';cx.beginPath();cx.roundRect(100,168,250,130,10);cx.stroke();
 signDraw(id_('sign',pv),t);awnDraw(id_('awn',pv),t);
 floorDraw(id_('floor',pv),t);
 /* 지나가는 손님 */
 const dk=Object.keys(save.dex);walk.forEach((w,i)=>{const dir=i%2?-1:1,x=dir>0?m2(t*w.sp+w.off,520)-35:485-m2(t*w.sp+w.off,520),an=dk.length?dk[i%dk.length]:w.an;em(an,x,386+Math.abs(Math.sin(t*5+i))*-5,36)});
 [['sL',54],['sR',398]].forEach(([k,x])=>{const it=SIDE[id_(k,pv)]||SIDE[0];if(it.sz)em(it.e,x,344-it.sz*.42,it.sz)});
 litDraw(id_('lit',pv),t,true)}
const gradeCol=()=>['#aaa','#c8a070','#7ec8ff','#7ed88a','#ffd23a','#ff9a3a','#ff6aa8'][grade()];
/* 🎉 가게 레벨·등급이 오르면 꽃가루 */
function lvWatch(){if(vd)return;const lv=shopLv(),g=grade();if(lvWatch.l==null){lvWatch.l=lv;lvWatch.g=g;return}
 if(g>lvWatch.g){if(window.JUICE)JUICE.confetti(140);snd('fanfare');toast('🎉 '+GR[g].e+' '+GR[g].n+' 등급이 됐어요!')}else if(lv>lvWatch.l){if(window.JUICE)JUICE.confetti(70);snd('win');toast('🎉 가게 Lv'+lv+'!')}lvWatch.l=lv;lvWatch.g=g}
/* 🏮 등급 · 🏪 레벨 안내 (위쪽 줄을 누르면): 무엇으로 오르는지, 다음까지 얼마나 */
function gradeCard(){const g=grade(),nx=GR[g+1],sv=grPts(),lv=shopLv(),sc=decoScore(),need=20*lv*lv,prev=20*(lv-1)*(lv-1);
 const bar=(a,b,col)=>'<div style="height:14px;border-radius:7px;background:rgba(0,0,0,.12);overflow:hidden;margin:4px 0 2px"><div style="height:100%;width:'+Math.max(3,Math.min(100,a/b*100))+'%;background:'+col+';border-radius:7px"></div></div>';
 let h='<div class="sum"><b>'+GR[g].e+' 가게 등급: '+GR[g].n+'</b>';
 if(nx)h+=bar(sv-GR[g].at,nx.at-GR[g].at,'#ffc94a')+'<small>다음 '+nx.e+' <b>'+nx.n+'</b>까지 <b>'+fmt(nx.at-sv)+'점</b> ('+fmt(sv)+' / '+fmt(nx.at)+')</small>';else h+='<br><small>최고 등급이에요! 👑</small>';
 h+='<br><small>🙋 <b>도와주기</b>로 직접 대접한 손님 1명 = <b>1점</b> ('+fmt(save.served|0)+'명)<br>💼 가게를 놔둬도 오는 손님 4명 = <b>1점</b> ('+fmt(save.bizCust|0)+'명) · 가게 레벨·꾸밈·직원이 좋을수록 많이 와요<br>오르면 새 가구·꾸밈이 열리고 카운터에 메뉴판·조명이 생겨요</small></div>';
 h+='<div class="sum"><b>🏪 가게 레벨: Lv'+lv+'</b>';
 if(lv<40)h+=bar(sc-prev,need-prev,'#7ed88a')+'<small>다음 Lv'+(lv+1)+'까지 꾸미기 점수 <b>'+fmt(need-sc)+'</b> ('+fmt(sc)+' / '+fmt(need)+')</small>';else h+='<br><small>최고 레벨이에요! 🎉</small>';
 h+='<br><small>🪑 가구 놓기 · 📐 넓히기 · 🎨 꾸밈 바꾸기 · 🎁 세트 완성으로 올라요 · 오르면 손님이 더 많이 와요</small><br><small>✨ 놓은 가구를 골라 <b>반짝 강화</b>(★1~3)하면 꾸미기 점수가 더 올라요</small><br><small>🌈 <b>여러 가지 가구</b>를 놓으면 종류마다 +'+KIND_PT+'점 · 매력 +1 (지금 '+kindsN()+'가지 → +'+fmt(kindsN()*KIND_PT)+'점)</small></div>';
 {const R0=BIZ.rt(save),W={wait:'⏱️ 기다림',price:'💰 붕어빵 값',deco:'🎨 꾸미기',menu:'🍡 메뉴 수',help:'✨ 도와주기 솜씨'},m=BIZ.rtMul(save);
  h+='<div class="sum"><b>⭐ 가게 평점: '+R0.v.toFixed(1)+'</b> <small>(손님 '+(m>=1?'+':'−')+Math.round(Math.abs(m-1)*100)+'%)</small>'+bar(R0.v-1,4,'#ffb04a');
  if(R0.rv&&R0.rv.length)h+='<small>💬 '+R0.rv.map(x=>'"'+x+'"').join(' · ')+'</small><br>';
  h+='<small>'+(R0.why&&R0.why.length?R0.why.map(([k,v])=>W[k]+' '+(v>0?'▲':'▼')).join(' · ')+'<br>':'')+'하루에 한 번 바뀌어요 · 줄이 밀리지 않게, 값은 알맞게, 예쁘게 꾸미고, 도와주기에서 ✨완벽하게 구우면 올라요</small></div>'}
{const cb=Math.round(charmBonus()*100),cap=Math.round(BIZ.charmCap(save)*100);
  h+='<div class="sum"><b>✨ 매력: +'+cb+'%</b> <small>(지금 가게 크기에서 최대 +'+cap+'%)</small>'+bar(cb,Math.max(1,cap),'#ff9ac0')+'<small>손님이 내는 돈이 +'+cb+'% 늘어요 · 가구·꾸밈을 놓을수록 오르고, 가게를 넓히면 최대치가 올라가요'+(cb>=cap?'<br>👉 <b>최대치예요!</b> 가게를 넓히면 더 오를 수 있어요':'')+'</small></div>'}
 {const nx2=IS.ROOM.find(r=>r.n===save.room+1),fr=(()=>{const v=F2V;F2V=false;const c=freeN();F2V=v;return c})();
  h+='<div class="sum"><b>🪑 가구를 더 놓고 싶다면?</b><br><small>지금 1층 <b>'+save.room+'×'+save.room+'</b> · 빈 칸 '+fr+'개<br>'+(nx2?'🎨 꾸미기 › <b>📐 넓히기</b>에서 '+nx2.n+'×'+nx2.n+'로 넓혀요 (🪙'+fmt(nx2.p)+(nx2.g>g?' · '+GR[nx2.g].e+' '+GR[nx2.g].n+' 등급부터':'')+')':BIZ.f2Next(save)?'1층은 가장 넓어요 · 📐 넓히기에서 <b>🏢 2층</b>을 올려요':'1층·2층 모두 가장 넓어요 🎉')+'</small>'+(nx2||BIZ.f2Next(save)?'<button id="gcR" style="display:block;width:100%;margin-top:8px;height:44px;font-size:16px">📐 넓히기 보러 가기</button>':'')+'</div>'}
 h+='<div class="sum"><small>🪙 <b>코인</b>: 장사로 벌어요 · 가구·넓히기·직원에 써요<br>🏅 <b>메달</b>: 🔥 챌린지에서 모아요 · 메달 상점의 특별 외관에 써요</small></div>';
 save.hudT=1;store();
 bzShow(GR[g].e,'등급 · 레벨 안내',h,'🙋 도와주러 가기',()=>$('h1').click(),'🎨 꾸미러 가기',()=>openDeco('home'));{const b=$('gcR');if(b)b.onclick=()=>{bzHide();openDeco('home',true);if(save.room>=11&&BIZ.f2Of(save)>0)setF2V(true)}}}
function hud(){rr(0,0,W,64,0,typeof THEME!=='undefined'?THEME.hud():'#8a5a3a');tx(nm(),12,22,24,'#fff','left');tx(GR[grade()].e+' '+GR[grade()].n+' · 🏪Lv'+shopLv()+' · ⭐'+BIZ.rt(save).v.toFixed(1)+' · ✨+'+Math.round(charmBonus()*100)+'%'+(save.hudT?' ⓘ':''),12,48,15,'#ffe9a0','left');if(!save.hudT){const a=.65+.35*Math.sin(Date.now()/240);cx.save();cx.globalAlpha=a;rr(318,37,122,22,11,'#ffd54a');tx('👈 누르면 설명',379,48,13,'#5a3a22','center');cx.restore()}{const tv=save.coins;if(hud.cv==null||Math.abs(tv-hud.cv)>1e9)hud.cv=tv;const up=tv>hud.cv+.5;hud.cv+=(tv-hud.cv)*.14;if(Math.abs(tv-hud.cv)<1)hud.cv=tv;tx('🪙 '+fmt(Math.round(hud.cv)),438,22,up?25:22,up?'#fff6c0':'#ffe9a0','right')}lvWatch();if(save.hudT)tx(dateStr()+' '+SEAS[seasonNow()].split(' ')[0],438,48,15,'#fff','right')}
/* 가게 모습 (아이소메트릭): 꾸밈 칸 + 놓은 가구. pv=꾸미기 미리보기 */
/* 밤 하늘인지 · 그림 배경 (처음 쓸 때 받아요) */
const skyNt=k=>k===2||k===6||!!(SKY[k]&&SKY[k].nt);
function skyBg(k){const s=SKY[k];if(!s||!s.img)return null;let im=window.ART_IMG&&ART_IMG['bg_'+s.img];if(!im&&typeof ART_LOAD==='function'){ART_LOAD({['bg_'+s.img]:'img/bg_'+s.img+'.webp'});im=ART_IMG['bg_'+s.img]}return{im,gr:s.gr,hf:s.hf}}
function skyCols(k){let c=SKYC[k]||SKYC[0];if(k===0){const se=seasonNow();if(se===2)c=['#8fcdff','#e6f4ff'];else if(se===3)c=['#b8cde4','#eef4fb'];else if(se===0)c=['#b6e0ff','#f4f9ff']}return c}
function look(pv){const sk=id_('sky',pv),wi=id_('wall',pv);return{g:grade(),cafe:BIZ.cafeOn(save),xmas:window.XMAS&&XMAS(),staff:BIZ.useSt(save),f2v:F2V,st:BIZ.f2Of(save)>0,n:F2V?(pv&&pv.k==='room2'?pv.id:BIZ.f2Of(save)):pv&&pv.k==='room'?pv.id:save.room,wall:{c:(WALL[wi]||WALL[0]).c,id:wi},floor:id_('floor',pv),sky:skyCols(sk),bg:skyBg(sk),night:skyNt(sk),mg:mgKey(),awn:id_('awn',pv),sign:id_('sign',pv),name:nm(),top:id_('top',pv),lit:id_('lit',pv),sL:SIDE[id_('sL',pv)]||SIDE[0],sR:SIDE[id_('sR',pv)]||SIDE[0],mas:MAS[id_('mas',pv)]||MAS[0]}}
function drawHome(t,deco){
 cx.fillStyle='#4a3426';cx.fillRect(0,0,W,H);
 if(deco&&dtabK()==='skin'){SV.preview(t,myD(prev),0,H-DPH+30);return}
 if(deco){const lk=look(prev);lk.staff={};IS.draw(t,lk,FUR(),{top:56,bottom:H-DPH,edit:dtabK()==='fur',sel:dsel,ghost:dghost,noCust:true,wedit:dtabK()==='fur'&&(FCAT[fcat].k==='wall'||!!(dpick&&IS.WK[dpick])||!!(dsel&&IS.WK[dsel.k]))});
  if(F2V){rr(W/2-46,62,92,30,15,'rgba(255,241,196,.95)');tx('🏢 2층',W/2,77,16,'#5a3a22','center')}
  if(dtabK()==='shape'){const sid=id_('shape',prev);rr(W-150,64,138,108,18,'rgba(255,248,236,.95)');bread(W-81,110,.9,'#e8a840',{shp:sid});tx(MSH[sid].n,W-81,154,14,'#5a3a22','center','#fff')}}
 else{IS.draw(t,look(null),FUR(),{top:64,bottom:518,junk:!F2V});if(F2V){rr(W/2-46,176,92,30,15,'rgba(255,241,196,.95)');tx('🏢 2층',W/2,191,16,'#5a3a22','center')}const g=cx.createLinearGradient(0,470,0,H);g.addColorStop(0,'rgba(0,0,0,0)');g.addColorStop(1,'rgba(30,18,10,.55)');cx.fillStyle=g;cx.fillRect(0,470,W,330);hud();
  if(scr==='home'){if(bizPop>0&&t-bizT>2.5){bizFl.push({v:bizPop,t});bizPop=0;bizT=t}bizFl=bizFl.filter(f=>t-f.t<1.8);bizFl.forEach(f=>{const u=(t-f.t)/1.8;cx.globalAlpha=1-u*u;tx('+'+fmt(f.v)+' 🪙',16,(INSTALL.standalone()?132:180)-u*12,18,'#fff6c0','left','#5a3a22');cx.globalAlpha=1})}else bizPop=0}}
function gradeFloorBase(){return['#b8b4ac','#d2a46a','#c89a64','#6fbf5a','#8a867c','#9a968e','#9a80d8','#e8b8c8','#b88350','#9cc8e8','#c89a64','#b898d8','#d8b058','#f2dc8a','#a8dcc0','#c8b4e8','#d8c6a8','#9cc8f0','#e8b4c4','#5a3420','#d8c8a8'][save.eq.floor]||'#b8b4ac'}

/* 지붕 장식: front=false 는 하늘 쪽(불꽃놀이), true 는 건물 앞 */
function topDraw(id,t,front){
 if(id===6&&!front){const cl=['255,90,120','255,200,60','120,220,255','160,255,140','220,140,255'];for(let b=0;b<4;b++){const ph=m2(t*.6+b*.27,1),bx=60+b*110+Math.sin(b*7)*20,by=36+(b%2)*22,cc=cl[b%5];if(ph<.8){const u=ph/.8,rad=14+u*46;cx.fillStyle='rgba('+cc+','+(1-u)+')';for(let i=0;i<16;i++){const a=i/16*Math.PI*2,px=bx+Math.cos(a)*rad,py=by+Math.sin(a)*rad+u*u*14;cx.beginPath();cx.arc(px,py,2.6*(1-u*.5),0,7);cx.fill()}}}}
 if(!front)return;
 if(id===1){cx.strokeStyle='#6a4a2a';cx.lineWidth=2.5;cx.beginPath();cx.moveTo(24,46);cx.quadraticCurveTo(225,74,426,46);cx.stroke();const cl=['#ff6a6a','#ffb04a','#6cc8ff','#7ed88a','#c08aff','#ff8ac0'];for(let i=0;i<6;i++){const u=(i+.5)/6,x=24+u*402,y=46+Math.sin(u*Math.PI)*14*1.2+2;fish2(x,y+10,.2,cl[i],{rot:Math.PI/2+Math.sin(t*2+i)*.25,plain:true})}}
 if(id===2){const cl=['#ff6a8a','#ffd23a','#6cc8ff','#7ed88a','#c08aff','#ff9a4a'];const ball=(x,y,r,c,ph)=>{const by=Math.sin(t*1.6+ph)*3;cx.strokeStyle='rgba(60,40,30,.5)';cx.lineWidth=1.4;cx.beginPath();cx.moveTo(x,y+r+by);cx.lineTo(x+Math.sin(ph)*4,y+r+22+by);cx.stroke();const g=cx.createRadialGradient(x-r*.35,y-r*.35+by,r*.1,x,y+by,r);g.addColorStop(0,lite(c,.55));g.addColorStop(1,c);cx.fillStyle=g;cx.beginPath();cx.ellipse(x,y+by,r*.9,r,0,0,7);cx.fill()};
  for(let i=0;i<7;i++){const a=Math.PI+i/6*Math.PI;ball(225+Math.cos(a)*190,56+Math.sin(a)*26,13,cl[i%6],i)}for(let i=0;i<4;i++){ball(34+i*8,40+i*5,12,cl[(i+2)%6],i+9);ball(416-i*8,40+i*5,12,cl[(i+4)%6],i+3)}}
 if(id===3){const bob=Math.sin(t*1.8)*2;fish2(225,30+bob,.95,'#ffcf3a',{glow:'rgba(255,220,80,.9)'});rr(205,52,40,12,4,'#8a6a10')}
 if(id===4){rr(70,10,310,46,8,'#1a1a22');cx.strokeStyle='#555';cx.lineWidth=3;cx.beginPath();cx.roundRect(70,10,310,46,8);cx.stroke();cx.save();cx.beginPath();cx.rect(76,14,298,38);cx.clip();const msg='🐟 붕어빵 팔아요! 갓 구운 따끈따끈 '+nm()+' 🐟   ';cx.font='bold 26px "Jua","Noto Sans KR",sans-serif';cx.textBaseline='middle';cx.shadowColor='#ffb030';cx.shadowBlur=10;cx.fillStyle='#ffc850';const w=cx.measureText(msg).width,x=-m2(t*60,w);for(let k=0;k<3;k++)cx.fillText(msg,x+k*w+80,33);cx.restore();rr(200,56,50,8,2,'#444')}
 if(id===5){cx.save();cx.shadowColor='#ffd23a';cx.shadowBlur=18+8*Math.sin(t*2);em('👑',225,30,70);cx.restore();for(let i=0;i<5;i++){cx.globalAlpha=.3+.7*Math.abs(Math.sin(t*2.2+i*1.5));em('✨',165+i*30,12+(i%2)*40,14)}cx.globalAlpha=1}}
/* ---------- 하루 목표 · 도감 ---------- */
const GP=[
 {k:'perf',f:d=>Math.min(15,3+Math.floor(d/6)),t:n=>'✨ PERFECT 붕어빵 '+n+'개 굽기',sh:(r,n)=>'✨'+r.perf+'/'+n,ok:(r,n)=>r.perf>=n},
 {k:'serve',f:d=>Math.min(26,6+Math.floor(d/4)),t:n=>'🐾 손님 '+n+'명에게 붕어빵 주기',sh:(r,n)=>'🐾'+r.served+'/'+n,ok:(r,n)=>r.served>=n},
 {k:'combo',f:d=>Math.min(10,3+Math.floor(d/8)),t:n=>'🔥 콤보 '+n+' 만들기',sh:(r,n)=>'🔥'+r.bc+'/'+n,ok:(r,n)=>r.bc>=n},
 {k:'noburn',f:()=>0,t:()=>'😵 하나도 태우지 않기',sh:r=>'😵'+(r.burnt?'✗':'○'),ok:r=>r.burnt===0},
 {k:'nolose',f:()=>1,t:n=>'😊 놓친 손님 '+n+'명 이하',sh:(r,n)=>'😡'+r.lost+'/≤'+n,ok:(r,n)=>r.lost<=n},
 {k:'net',f:()=>Math.max(2000,Math.round(save.avg*.95/100)*100),t:n=>'💰 하루 수익 '+fmt(n)+'원 넘기기',sh:(r,n)=>'💰'+Math.min(100,Math.max(0,Math.round(r.net/n*100)))+'%',ok:(r,n)=>r.net>=n}];
function goalsFor(day,lv){const rng=B.mul(B.hs(2026,day*131+7)),idx=GP.map((_,i)=>i);for(let i=idx.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[idx[i],idx[j]]=[idx[j],idx[i]]}
 return idx.slice(0,3).map(i=>{const p=GP[i];return{p,n:p.f(lv)}})}
const live=()=>({perf:s.perf,served:s.served,bc:s.bc,burnt:s.burnt,lost:s.lost,net:Math.round(s.net)});
const DXT=[10,30];
/* ---------- 집 화면 ---------- */
const gdone=()=>{const dk=dayKey();if(!save.gd||save.gd.k!==dk)save.gd={k:dk,done:[0,0,0],all:0};return save.gd};
/* 🔥 챌린지를 아직 안 해 본 사람: 도와주기 결과에 챌린지 안내 (메달 → 특별 외관) */
const chLink=()=>{let ch=null;try{ch=JSON.parse(localStorage.getItem('bungeoppang2Pub1'))}catch(e){}if(ch&&ch.runs>0||(save.days|0)%3!==1)return'';return'<a href="./" class="sum" style="display:block;text-decoration:none;color:inherit;background:#ffe9d6;margin-top:6px"><b>🔥 챌린지도 해 봐요!</b><br><small>매주 친구들과 단계 겨루기 · 🏅 메달을 모아 특별한 가게 외관을 사요 ›</small></a>'};
/* 📺 앱에서만: 광고 보고 도와주기 번 돈 한 번 더 (하루 ADS.MAX번) */
let adGain=0;
const adBtn=g=>{adGain=0;if(!window.ADS||!ADS.on||g<=0)return'';const n=ADS.left();if(!n)return'<div class="tip">📺 오늘 광고 보너스를 다 받았어요 · 내일 또 '+ADS.MAX+'번!</div>';adGain=g;
 return'<button id="adx" class="big" style="background:#7ec8ff;box-shadow:0 4px 0 #3f8fd1;margin-top:8px;height:auto;min-height:0;font-size:18px;line-height:1.3;padding:9px 10px">📺 광고 보고 🪙+'+fmt(g)+' 더 받기<br><small style="font-size:13px">오늘 '+n+'/'+ADS.MAX+'번 남음</small></button>'};
function adBind(){const b=$('adx');if(!b)return;b.onclick=async()=>{if(b.disabled||!adGain)return;const g=adGain;b.disabled=true;b.style.opacity=.6;b.innerHTML='📺 광고 여는 중…';
 const ok=await ADS.show();if(ok){adGain=0;save.coins+=g;BIZ.ledger(save,Date.now()).help+=g;store();syncShop();snd('coins');b.innerHTML='✅ 🪙+'+fmt(g)+' 받았어요!';toast('📺 고마워요! 🪙+'+fmt(g))}
 else{b.disabled=false;b.style.opacity=1;b.innerHTML='📺 못 받았어요 · 다시 누르기<br><small>광고를 끝까지 보면 받아요</small>'}}}
/* ---------- ✨ 버튼은 하나씩 열려요 (처음엔 꼭 필요한 것만) ----------
   새로 가게를 연 사람만(save.d0). 예전부터 하던 사람은 다 열려 있어요. 열리면 'NEW' 표시 + 알림 */
const UNL=[{id:'nst',e:'🏙️',n:'붕어빵 동네',ok:a=>a.days>=1||a.age>=1},{id:'nb',e:'🏘️',n:'가게 순위',ok:a=>a.days>=1||a.age>=1},{id:'h4',e:'📖',n:'도감',ok:a=>a.days>=1},{id:'nbs',e:'📤',n:'내 가게 자랑',ok:a=>a.days>=2||a.age>=1},{id:'nnt',e:'📮',n:'방명록',ok:a=>a.age>=1},{id:'nms',e:'🏅',n:'메달 상점',ok:a=>a.age>=1||(window.MEDAL&&MEDAL.get().n>0)}];
function unlockUI(){const fresh=save.d0>0,a={days:save.days|0,age:fresh?dayKey()-save.d0:99};if(!Array.isArray(save.unl))save.unl=[];const nw=[];
 for(const u of UNL){const el=$(u.id);if(!el)continue;const on=!fresh||u.ok(a);el.classList.toggle('lk0',!on);
  if(on&&fresh&&!save.unl.includes(u.id)){save.unl.push(u.id);nw.push(u);el.classList.add('nw0');el.addEventListener('click',()=>el.classList.remove('nw0'),{once:true})}}
 if(nw.length){store();setTimeout(()=>toast('✨ 새로 열렸어요: '+nw.map(u=>u.e+' '+u.n).join(' · ')),700)}
 /* 챌린지를 아직 안 해 봤으면 챌린지 버튼에 한 줄 */let ch=null;try{ch=JSON.parse(localStorage.getItem('bungeoppang2Pub1'))}catch(e){}$('hcs').style.display=ch&&ch.runs>0?'none':'block'}
/* ---------- 📅 연속 출석 도장 (11/10 VOC '출석이 짜다') ----------
   하루 한 번(날짜가 바뀔 때). 매일 = 내 가게 1시간 수입(최소 3,000) · 연속 3·7·14·30일째(그 뒤로도 반복) 큰 선물.
   하루 빠지면 연속이 끊겨요. 단, 🛡️ 한 주(월~일)에 한 번은 하루 빠져도 이어져요.
   폰 시계를 되돌려도 마지막으로 받은 날보다 앞 날짜엔 못 받아요. 한 번에 받는 코인은 최대 100만(클라우드 백업 규칙 안쪽, 차액 150만과 겹쳐도) */
const att=()=>{if(!save.att||typeof save.att!=='object')save.att={last:0,n:0};const A=save.att;if(A.s==null){A.s=A.last>=dayKey()-2?((Math.max(1,A.n|0)-1)%7)+1:0}return A};
const attCan=()=>!!save.name&&dayKey()>att().last;
const wkOf=d=>Math.floor((d+3)/7);
const ATTM=[[30,{h:24,m:20,x:3,t:'🏆 한 달 보너스'}],[14,{h:12,m:15,x:2,t:'🌟 2주 보너스'}],[7,{h:6,m:10,x:1,t:'🎉 일주일 보너스'}],[3,{h:3,t:'✨ 보너스'}]];
const attMs=s=>{for(const [d,r] of ATTM)if(s>=d&&(d===3?s%7===3:s%d===0))return r;return null};
const attHr=()=>{let h=0;try{h=Math.max(0,BIZ.rates(save,bctx()).net)}catch(e){}return h};
const r1k=v=>Math.round(v/1000)*1000;
/* 오늘 받을 선물 (아직 안 받았을 때 기준) */
function attNext(){const A=att(),d=dayKey(),gap=d-A.last,wk=wkOf(d),prot=gap===2&&A.pw!==wk&&A.s>0,s=gap===1||prot?A.s+1:1,hr=attHr(),day=Math.max(3000,Math.min(5e5,r1k(hr))),ms=attMs(s),bonus=ms?Math.min(1e6-day,Math.max(5000*ms.h,r1k(hr*ms.h))):0;
 return{s,prot,broke:gap>1&&!prot&&A.s>0,old:A.s,c:day+bonus,day,bonus,ms}}
const attTxt=g=>'🪙 '+fmt(g.c)+(g.ms&&g.ms.m?' · 🏅 '+g.ms.m:'')+(g.ms&&g.ms.x?' · 🎫 강화권 '+g.ms.x:'');
const nextMs=s=>{for(let k=s+1;k<=s+30;k++){const m=attMs(k);if(m)return{k,m}}return null};
function attClaim(){if(!attCan())return null;const A=att(),g=attNext(),d=dayKey();if(g.prot)A.pw=wkOf(d);A.s=g.s;A.best=Math.max(A.best|0,g.s);A.last=d;A.n=(A.n|0)+1;
 save.coins+=g.c;if(g.ms&&g.ms.m&&window.MEDAL&&MEDAL.add)MEDAL.add(g.ms.m);if(g.ms&&g.ms.x)save.tix=(save.tix|0)+g.ms.x;store();return g}
function attCard(){if(!attCan())return false;const g=attNext(),A=att(),nm2=nextMs(g.s),base=Math.floor((g.s-1)/7)*7;
 const dots=Array.from({length:7},(_,j)=>{const k=base+j+1,m=attMs(k),done=k<g.s,cur=k===g.s;return'<span style="display:inline-block;width:36px;height:40px;line-height:1.1;padding-top:4px;border-radius:10px;margin:2px;font-size:12px;vertical-align:top;background:'+(done?'#d8f5dc':cur?'#ffd76a':'#f1e6d4')+'">'+(done?'✅':cur?'🐟':k)+'<br><small style="font-size:10px">'+(m?m.t.split(' ')[0]:k+'일')+'</small></span>'}).join('');
 bzShow('📅','🔥 연속 출석 '+g.s+'일째!','<div style="text-align:center">'+(g.broke?'<p class="ht" style="margin:0 0 6px;color:#c03030">연속이 끊겨서 1일부터 다시 시작해요 (전에 '+g.old+'일)</p>':g.prot?'<p class="ht" style="margin:0 0 6px;color:#2a7ac0">🛡️ 어제 빠졌지만 이번 주 보호로 이어졌어요!</p>':'')+dots+
  '<p style="margin:8px 0 0;font-size:19px">오늘 선물: <b style="color:#e8642a">'+attTxt(g)+'</b></p>'+(g.ms?'<p class="ht" style="margin:4px 0 0">'+g.ms.t+' 포함!</p>':'')+
  (nm2?'<p class="ht" style="margin:6px 0 0">🎁 '+nm2.k+'일째: '+nm2.m.t+(nm2.m.m?' · 🏅'+nm2.m.m:'')+(nm2.m.x?' · 🎫'+nm2.m.x:'')+'</p>':'')+'<p class="ht" style="margin:4px 0 0">🛡️ 한 주에 한 번은 하루 빠져도 이어져요'+(A.pw===wkOf(dayKey())&&!g.prot?' (이번 주 사용함)':'')+'</p></div>',
  '🎁 받기',()=>{const r=attClaim();if(!r)return;snd('fanfare');if(window.JUICE)JUICE.confetti(r.ms?140:90);toast('🎁 '+attTxt(r)+' 받았어요! · 🔥 연속 '+r.s+'일');renderHome();bizBtn()});return true}
const attLine=()=>{if(!save.name)return'';const A=att(),done=A.last>=dayKey(),s=done?A.s:attNext().s,nm2=nextMs(done?A.s:s-1);return'<div class="evl" id="atl" style="background:#e8f4ff">📅 🔥 연속 '+(done?A.s:Math.max(0,s-1))+'일'+(done?(nm2?' · 🎁 '+nm2.k+'일째 '+nm2.m.t:''):' · <b>오늘 도장 찍기 ›</b>')+'</div>'};
let attShown=false;function attAuto(n){if(attShown||!save.name||n>40)return;setTimeout(()=>{if(attShown)return;const busy=[...document.querySelectorAll('.ov')].some(o=>o.id!=='hm'&&getComputedStyle(o).display!=='none');
 if(scr!=='home'||busy){attAuto(n+1);return}attShown=true;attCard()},n?1500:900)}
/* ---------- 📅 오늘의 사건 ---------- */
const grpTxt=g=>!g?'':g.ok?'<div class="sum" style="background:#d8f5dc"><b>🚌 단체 주문 완료!</b> +'+fmt(g.rw)+'🪙 · ⭐ 평점 +0.2</div>':'<div class="sum">🚌 단체 주문 '+g.got+' / '+g.need+'명 · '+hm(Math.max(0,(save.ev.until-Date.now())/3600e3))+' 남았어요</div>';
const EVT={group:['🚌','단체 주문이 들어왔어요!',c=>'근처 회사에서 붕어빵 단체 주문! <b>3시간 안에</b> 🙋 도와주기(붕어빵·음료)로 <b>손님 '+BIZ.GRP_NEED+'명</b>을 대접하면 <b>+'+fmt(c.grp)+'🪙</b> · ⭐ +0.2<br><small>못 하면 평점 −0.3</small>','🚌 받을게요!','다음에요'],
 rival:['🏪','옆에 경쟁 가게가 생겼어요',c=>'오늘 하루 어떻게 할까요?<br>🏷️ <b>할인 행사</b>: 손님 +25% · 값 −15% <small>(알바가 밀리면 손해일 수도)</small><br>💪 <b>버티기</b>: 손님 −15%','🏷️ 할인 행사','💪 버티기'],
 influ:['📸','유명 먹방 유튜버가 왔어요!',c=>'🎁 <b>공짜로 드리기</b>: −'+fmt(c.free)+'🪙 · ⭐ 평점 +0.25 · <b>내일 손님 +15%</b><br>🪙 <b>정가 받기</b>: +'+fmt(c.paid)+'🪙','🎁 공짜로 드리기','🪙 정가 받기'],
 rain:['🌧️','오늘은 비가 와요',c=>'비 오는 날은 손님이 <b>−20%</b>예요.<br>☂️ <b>우산 빌려주기</b>(−'+fmt(c.umb)+'🪙)를 하면 손님이 그대로 와요','☂️ 우산 빌려주기','그냥 둘게요'],
 fest:['🎉','동네 축제가 열려요!',c=>'🎪 <b>축제에 노점 내기</b>: −'+fmt(c.fest)+'🪙 · 오늘 손님 <b>+35%</b> <small>(알바가 밀리면 손님이 늘어도 못 받아요)</small>','🎪 노점 내기','오늘은 쉬기']};
let evShown=false;
function evCard(){const e=save.ev;if(!e||e.dk!==BIZ.dayKey(Date.now())||e.ch!==-1||!EVT[e.k])return false;const T=EVT[e.k],c=BIZ.evCost(save,bctx());
 const go=i=>{const r=BIZ.evChoose(save,i,Date.now(),bctx());if(!r)return;if(r.err){toast(r.err);snd('no');setTimeout(evCard,300);return}store();snd(i===0?'win':'tap');toast(r.msg);renderHome()};
 bzShow(T[0],T[1],'<p style="margin:0;line-height:1.6">'+T[2](c)+'</p><p class="ht" style="margin:6px 0 0">📅 오늘의 사건 · 하루에 하나</p>',T[3],()=>go(0),T[4],()=>go(1));return true}
function evLine(){const e=save.ev,dk=BIZ.dayKey(Date.now());if(!e||e.dk!==dk||!EVT[e.k])return'';const T=EVT[e.k];
 if(e.ch===-1)return'<div class="evl" id="evl">'+T[0]+' 오늘의 사건: '+T[1]+' <b>› 고르기</b></div>';
 if(e.k==='group'&&e.ch===0){if(e.res==='ok')return'<div class="evl ok">🚌 단체 주문 완료! ✅</div>';if(e.res==='fail')return'<div class="evl">🚌 단체 주문 실패 😢</div>';return'<div class="evl">🚌 단체 주문 '+(e.got|0)+'/'+e.need+'명 · '+hm(Math.max(0,(e.until-Date.now())/3600e3))+' 남음 · 🙋 도와주기!</div>'}
 return e.msg?'<div class="evl">'+T[0]+' '+e.msg+'</div>':''}
function renderHome(){setTimeout(hmLay,0);unlockUI();starDot();noteBadge();noteCheck();if(save.name){dayTick();const ne=BIZ.evNew(save,Date.now());if(ne){/* 🌧️ 사건은 오늘 날씨가 비·눈일 때만 (맑은 날엔 다른 사건) */if(ne.k==='rain'&&!/🌧/.test(todayWx().wea.e||''))ne.k=['influ','fest','rival'][ne.dk%3];store()}}const lv=shopLv();goals=goalsFor(dayKey(),lv);const w=todayWx(),gd=gdone();
 $('hg').innerHTML='<div class="ghd"><b>📋 오늘 목표 <small style="font-weight:400;opacity:.7">⭐</small></b><span>'+w.wea.e+(w.ev?' '+R.ev[w.ev].e+' '+R.ev[w.ev].n:' '+w.wea.n)+'</span></div><div class="gl3">'+goals.map((g,i)=>{const q=gShort(g);return'<div class="'+(gd.done[i]?'ok':'')+'"><b>'+(gd.done[i]?'✅':q.e)+'</b>'+q.t+'</div>'}).join('')+'</div>'+evLine()+mgLine()+(save.name&&att().n?attLine():'');{const ml=$('mgl');if(ml)ml.onclick=()=>{snd('tap');mgCard()}}mgBtn();{const el=$('evl');if(el)el.onclick=()=>{snd('tap');evCard()}}{const al=$('atl');if(al)al.onclick=()=>{snd('tap');if(!attCard())toast('📅 오늘 선물은 받았어요 · 내일 또 와요!')}}
 {const h=hbNow(),left=Math.max(0,HB1-h.n);$('h1').innerHTML='🙋 도와주기<small style="display:block;font-size:12px;opacity:.75;margin-top:-2px">'+(left?'🎁 보너스 '+left+'/'+HB1+'판':h.n<HB2?'오늘은 50% (내일 100%)':'오늘은 20% (내일 100%)')+'</small>'}bizBtn()}
function toHome(){scr='home';s=null;paused=false;prev=null;tipMake();if(tipLeft()&&!save.tipH){save.tipH=1;store();setTimeout(()=>{if(scr==='home')toast('🧹 손님들이 팁·접시를 남겼어요! 가게 바닥에서 톡톡 눌러 모아요')},900)}renderHome();show('hm');attAuto(0);evAuto(0);setTimeout(()=>{if(scr!=='home'||$('bz').style.display==='block')return;if(save.name&&(save.days|0)>=1&&!mgr().k&&!save.mgAsk){save.mgAsk=1;store();mgPick();return}decoWkReward()},2500)}
/* 오늘의 사건 카드: 다른 창(자리 비운 동안·새 소식·선물 등)이 다 닫힌 뒤 한 번 자동으로 */
function evAuto(n){if(evShown||!save.name||n>40)return;setTimeout(()=>{if(evShown)return;if(attCan()){evAuto(n+1);return}const busy=[...document.querySelectorAll('.ov')].some(o=>o.id!=='hm'&&getComputedStyle(o).display!=='none');
 if(scr!=='home'||busy){evAuto(n+1);return}evShown=true;evCard()},n?1500:1200)}
/* ---------- 하루 ---------- */
const run0=()=>({seed:(save.seed^Math.imul(save.days+1,2654435761))>>>0,day:shopLv(),up:Object.assign({},save.up,{deco:Math.min(.25,charmBonus())/.06}),fu:save.fu.slice(),nf:Math.min(save.nfUse,save.nf),coins:save.coins,lg:null,mode:'shop'});
/* 📍 11/17 가게 자리(상권): 일주일 평균 순이익을 미리 계산해서 보여 줘요 */
function zWeek(k){const o=save.zn,cx_=bctx(),t0=Date.now();save.zn={k};let a=0;for(let h=0;h<168;h++)a+=BIZ.rates(save,Object.assign({},cx_,{noEv:1,ms:t0+h*3600e3})).net;save.zn=o;return a/168}
function zoneUI(r,card,act,inf){const z=BIZ.zoneOf(save),now=Date.now(),pk=BIZ.zPeak(z,now)&&z.A!==1&&z.k!=='mall'&&z.k!=='prime',base=zWeek('alley');
 let h='<div class="tip" style="margin-top:16px;font-size:16px">'+inf('📍','가게 자리 (상권)','동네 어디에 가게를 두느냐에 따라 손님 수와 <b>한 명이 쓰는 돈</b>이 달라져요.<br>• 🏫·🚉·🌳 은 <b>붐비는 시간</b>에 크게 벌어요 (자리 비운 동안 장사도 시간대별로 계산)<br>• 🛍️·👑 은 늘 조금씩 더 벌어요<br>• 📍 자리값 = 순이익의 몇 %. 손해 보는 시간엔 안 떼요<br>• 이사할 때 <b>권리금</b>을 내고, 옛 자리 권리금은 절반 돌려받아요<br>• 🙋 도와주기 수입에도 적용돼요 (판 시작 시각 기준)<br>가게가 클수록(알바가 바쁠수록) 손님 수보다 <b>값</b>이 중요해요.')+'<span style="margin-left:22px">📍 <b>가게 자리</b> · 🗺️ 동네 지도에서 빈 땅을 눌러도 돼요 · 지금 '+z.e+' '+z.n+(pk?' <span class="chip ok" style="font-size:13px">🔥 붐비는 시간!</span>':'')+'</span></div><div class="gr2">';
 BIZ.ZONES.forEach(q=>{const cur=q===z,w=zWeek(q.k),d=Math.round(w-base),pct=base>0?Math.round((w/base-1)*100):0;
  const st='<small style="display:block;line-height:1.35">'+q.d+'</small>'+(q.r?'📍 자리값 '+Math.round(q.r*100)+'%<br>':'')+'<b>'+(q.k==='alley'?'기준':(d>=0?'▲':'▼')+fmt(Math.abs(d))+'/시간'+(base>0?' ('+(pct>=0?'+':'')+pct+'%)':''))+'</b><small style="display:block">일주일 평균</small>';
  h+=card({e:q.e,n:q.n,st:st+(q.key&&!cur?'<small style="display:block">🔑 권리금 '+fmt(BIZ.zKey(save,q.k))+'</small>':''),hot:cur,btn:cur?'✅ 여기예요':'🗺️ 지도에서 고르기',can:1,done:cur,
   info:[q.e,q.n,q.d+'<br>평소: 값 ×'+q.bp+'<br>📍 자리값: 순이익의 '+Math.round(q.r*100)+'%<br>🔑 권리금: '+fmt(BIZ.zKey(save,q.k))+(q.kd?' (기본 '+fmt(q.key)+' 또는 하루 수입의 '+q.kd+'일치 중 큰 쪽)':'')+'<br><br>지금 가게로 일주일 평균 <b>'+fmt(Math.round(w))+'/시간</b> (골목 '+fmt(Math.round(base))+')<br>🗺️ 동네 지도에서 이 구역의 빈 땅을 눌러 이사해요'],
   fn:()=>{if(cur)return;snd('tap');openStreet(q.k)}})});
 return h+'</div>'}
let helpT=0;
function startDay(){au();helpT=Date.now();try{if(window.ADS&&ADS.warm)ADS.warm()}catch(e){}if(!goals.length)goals=goalsFor(dayKey(),shopLv());run=run0();s=B.newDay(run);{const w=todayWx();s.wea=w.wea;s.ev=w.ev}ui=A.newUi();A.use(s,run,ui);scr='game';paused=false;acc=0;last=0;show('none')}
/* 결과 맨 위: 받은 코인을 크게 + 세금·보너스 칩 */
function resTop(gain,net,tax,hm){return'<div class="rbig">'+(net>=0?'🪙 +'+fmt(gain):'📉 0')+'<small>'+(net<0?'재료비가 더 들었지만 손해는 없던 걸로!':'벌이 '+fmt(net)+(tax?' · 🏛️ 세금 −'+fmt(tax):''))+'</small></div><div class="chips"><span class="chip'+(hm<1?' red':' ok')+'">'+(hm<1?'🎁 오늘 보너스 끝 · '+Math.round(hm*100)+'%만 받아요 (내일 100%)':'🎁 보너스 '+Math.max(0,HB1-hbNow().n)+'/'+HB1+'판 남음')+'</span></div>'}
/* 목표 짧게: 아이콘 + 두세 단어 */
function gShort(g){const n=g.n,k=g.p.k;return{perf:{e:'✨',t:'PERFECT '+n},serve:{e:'🐾',t:'손님 '+n+'명'},combo:{e:'🔥',t:'콤보 '+n},noburn:{e:'😵',t:'안 태우기'},nolose:{e:'😊',t:'놓침 '+n+'명 이하'},net:{e:'💰',t:'수익 '+(n>=10000?Math.round(n/1000)/10+'만':fmt(n))}}[k]||{e:'📋',t:g.p.t(n)}}
/* 🎁 도와주기 하루 보너스: 처음 20판 100% · 21~30판 50% · 31판부터 20% (매일 초기화. 폰 시계를 뒤로 돌려도 다시 채워지지 않아요) */
const HB1=20,HB2=30;
function hbNow(){const d=BIZ.dayKey(Date.now());if(!save.hb||typeof save.hb!=='object')save.hb={d,n:0};if(d>save.hb.d)save.hb={d,n:0};return save.hb}
const hbMul=n=>n<HB1?1:n<HB2?.5:.2;
function hbUse(){const h=hbNow(),m=hbMul(h.n);h.n++;return m}
function hbTxt(m){const h=hbNow(),left=Math.max(0,HB1-h.n);return m<1?'🎁 오늘 보너스 판을 다 써서 <b>'+Math.round(m*100)+'%</b>만 받아요 · 내일 다시 100%!':'🎁 오늘 보너스 판 <b>'+left+'/'+HB1+'</b> 남았어요'+(left?'':' · 다음 판부터 50%')}
const zhChip=zh=>zh.m===1?'':'<div class="chips"><span class="chip'+(zh.pk?' ok':'')+'">'+zh.z.e+' '+zh.z.n+(zh.pk?' 붐비는 시간':'')+' ×'+zh.m.toFixed(2)+' (자리값 '+Math.round(zh.z.r*100)+'% 뺌)</span></div>';
function finishDay(){const res=B.dayResult(s,run),gd=gdone(),lv=run.day;const gl=goals.map((g,i)=>({g,ok:g.p.ok(res,g.n),was:gd.done[i]}));let star=0,bonus=0;const g0=grade();
 gl.forEach((x,i)=>{if(x.ok&&!x.was){gd.done[i]=1;star++}});const got=gd.done.filter(Boolean).length;if(got===3&&!gd.all){gd.all=1;bonus=500+lv*250}
 const hm=res.net>0?hbUse():hbMul(hbNow().n),tax=Math.round(Math.max(0,res.net)*BIZ.TAX),zh=BIZ.zHelp(save,helpT||Date.now()),gain=Math.round((Math.max(0,res.net)-tax)*hm*(1+skBuf().h)*(1+mgB('shop'))*zh.m)+bonus;save.coins+=gain;BIZ.ledger(save,Date.now()).help+=gain;save.stars+=star;save.served+=res.served;mgCount(res.served,res.perf|0,0);save.days++;save.avg=save.avg?Math.round(save.avg*.7+res.net*.3):Math.max(0,res.net);
 save.bestNet=Math.max(save.bestNet,res.net);save.bestCombo=Math.max(save.bestCombo,res.bc);
 const dn=[];for(const an of Object.keys(save.dex)){const lv=save.dexS[an]||0;if(lv<DXT.length&&save.dex[an]>=DXT[lv]){save.dexS[an]=lv+1;save.stars++;dn.push(an+' 단골 달성! ⭐+1')}}
 if(!save.dexAll&&Object.keys(save.dex).length>=R.an.length){save.dexAll=1;save.stars+=5;dn.push('📖 도감 완성! ⭐+5')}
 BIZ.rtHelp(save,Date.now(),res.perf,res.served);const grp=BIZ.evHelp(save,res.served,Date.now());lastHelp='bread';save.lr={full:res.full|0,lost:res.lost,idle:res.idle,net:res.net};const nd=s.dxNew||[];store();
 const g1=grade();let h=resTop(gain-bonus,res.net,tax,hm)+'<div class="chips"><span class="chip">🐾 '+res.served+'명</span><span class="chip'+(res.lost?' red':'')+'">😡 '+res.lost+'</span><span class="chip">✨ '+res.perf+'</span><span class="chip">👍 '+(res.good|0)+'</span><span class="chip'+(res.burnt?' red':'')+'">😵 '+res.burnt+'</span><span class="chip">🔥 '+res.bc+'</span></div>'+zhChip(zh);
 h+='<div class="gl3">'+gl.map((x,i)=>'<div class="'+(gd.done[i]?'ok':'')+(x.ok&&!x.was?' new':'')+'"><b>'+(gd.done[i]?'✅':gShort(x.g).e)+'</b>'+gShort(x.g).t+(x.ok&&!x.was?'<br>⭐+1':'')+'</div>').join('')+'</div>'+(bonus?'<div class="chips"><span class="chip ok">🎁 오늘 목표 3개 달성! +'+fmt(bonus)+'🪙</span></div>':'');
 h+=grpTxt(grp);
 if(nd.length)h+='<div class="sum">📖 새 손님 도감 등록! '+nd.join(' ')+'</div>';if(dn.length)h+='<div class="sum">'+dn.join('<br>')+'</div>';
 if(g1>g0)h+='<div class="sum" style="background:#ffeaa8"><b>🎉 가게 등급이 올랐어요!</b><br>'+GR[g1].e+' <b>'+GR[g1].n+'</b> · 새 꾸미기 상품이 열렸어요</div>';
 h+=adBtn(gain-bonus)+chLink();
 h+='<div class="chips"><span class="chip">🪙 '+fmt(save.coins)+'</span><span class="chip">⭐ '+save.stars+'</span><span class="chip">'+GR[g1].e+' '+GR[g1].n+'</span></div>';
 $('rt').textContent='🌙 도와주기 끝! (가게 Lv'+lv+')';syncShop();$('rb').innerHTML=h;adBind();scr='res';s=null;snd('win');setTimeout(()=>snd('coins'),380);show('res')}
/* ---------- ☕ 음료 도와주기 (js/cafe.js) ---------- */
let lastHelp='bread';
const CF=CAFE(cx,A,{back:(t,g)=>{const k=mgKey(),im=k&&window.ART_IMG&&ART_IMG[k];if(!im||!im.complete||!im.naturalWidth)return;const x=152,h=74*im.naturalHeight/230,w=h*im.naturalWidth/im.naturalHeight,b=Math.abs(Math.sin(t*2.2))*3;cx.drawImage(im,x-w/2,318-h-b,w,h);
  const L=mgr().lv|0,ph=t%9;if(ph<1.4){const msg=L===0?(ph<.7?'앗, 우유!':'에헤헤'):L===1?'어서 오세요!':L===2?'라떼 나갑니다~':'오늘도 화이팅!';rr(x-50,318-h-32,100,24,12,'rgba(255,255,255,.92)');tx(msg,x,318-h-20,13,'#7a4a2a','center')}},snd:k=>snd(k),toast:t=>toast(t),coins:()=>save.coins,onServe:an=>{if(an&&an!=='🧐')save.dex[an]=(save.dex[an]|0)+1}});
function startCafe(){au();if(!BIZ.cafeOn(save)){startDay();return}helpT=Date.now();try{if(window.ADS&&ADS.warm)ADS.warm()}catch(e){}/* 11/16 꾸민 가게라 음료값을 더 받아요: ✨ 꾸미기 보너스만큼(최대 +25%, 붕어빵과 같은 상한) */CF.start({save,mul:BIZ.beanMul(save)*(1+Math.min(.25,charmBonus())),dp:d=>BIZ.dPrice(save,d),pm:(R.loc[save.up.loc|0]||R.loc[0]).pm});scr='cafe';paused=false;acc=0;last=0;lastHelp='cafe';show('none')}
function finishCafe(){if(scr!=='cafe')return;const r=CF.res(),hm=r.net>0?hbUse():hbMul(hbNow().n),tax=Math.round(Math.max(0,r.net)*BIZ.TAX),zh=BIZ.zHelp(save,helpT||Date.now()),gain=Math.round((Math.max(0,r.net)-tax)*hm*(1+skBuf().h)*(1+mgB('cafe'))*zh.m);
 save.coins+=gain;save.served+=r.served;mgCount(r.served,0,r.served);save.cafeN=(save.cafeN|0)+1;BIZ.rtHelp(save,Date.now(),r.perf,r.served);const grp=BIZ.evHelp(save,r.served,Date.now());save.cafeBest=Math.max(save.cafeBest|0,r.net);BIZ.ledger(save,Date.now()).help+=gain;store();syncShop();
 let h=resTop(gain,r.net,tax,hm)+'<div class="chips"><span class="chip">☕ '+r.served+'잔</span><span class="chip">✨ '+r.perf+'</span><span class="chip">👍 '+r.great+'</span><span class="chip">🙂 '+r.good+'</span><span class="chip'+(r.lost?' red':'')+'">😡 '+r.lost+'</span><span class="chip'+(r.wrong?' red':'')+'">😣 '+r.wrong+'</span><span class="chip'+(r.spill?' red':'')+'">💦 '+r.spill+'</span><span class="chip">🔥 '+r.bc+'</span></div>'+zhChip(zh);
 h+=grpTxt(grp)+adBtn(gain)+chLink();h+='<div class="tip">💡 샷이 내려가는 동안 다른 컵을 만들고, 우유는 초록 온도에서 멈추면 ✨ PERFECT (값 1.5배)</div><div class="chips"><span class="chip">🪙 '+fmt(save.coins)+'</span><span class="chip">🏆 최고 '+fmt(save.cafeBest|0)+'</span></div>';
 $('rt').textContent='☕ 음료 도와주기 끝!';$('rb').innerHTML=h;adBind();scr='res';snd('win');setTimeout(()=>snd('coins'),380);show('res')}
const cafeXY=e=>{const r=cv.getBoundingClientRect();return[(e.clientX-r.left)/r.width*W,(e.clientY-r.top)/r.height*H]};
const cafeDown=e=>{if(scr!=='cafe'||paused)return;e.preventDefault();au();if(typeof dupTap==='function'&&dupTap(e))return;const [x,y]=cafeXY(e);CF.down(x,y)};cv.addEventListener('pointerdown',cafeDown);setTimeout(()=>touchAlso(cv,cafeDown),0);
['pointerup','pointercancel','pointerleave'].forEach(ev=>cv.addEventListener(ev,()=>{if(scr==='cafe')CF.up()}));
$('r1').onclick=()=>{if(lastHelp==='cafe')startCafe();else startDay()};$('r4').onclick=()=>{toHome()};
$('r2').onclick=()=>openDeco('res');$('r3').onclick=()=>openUp('res');
const quitHelp=()=>{paused=false;$('pause').style.display='none';if(scr==='cafe'){CF.finish();finishCafe()}else finishDay()};
$('p2').onclick=()=>JUICE.ask('🏁 그만 도와줄까요?','지금까지 번 만큼 정산해요','🏁 네, 그만할래요',quitHelp,'▶ 계속하기',resumeGame);
/* 📱 뒤로 가기: 게임 중이면 멈추고 물어봐요 */
JUICE.backGuard(()=>scr==='game'||scr==='cafe',()=>{pauseGame();JUICE.ask('🏁 그만 도와줄까요?','지금까지 번 만큼 정산해요','🏁 네, 그만할래요',quitHelp,'▶ 계속하기',resumeGame)});
/* ---------- 가게 키우기 (굽기 업그레이드) ---------- */
let backTo='home',utab=0;
function openUp(from,tab){backTo=from;if(tab!=null)utab=tab;scr='up';renderUp(true);show('up')}
/* 💼 경영 화면: 글 대신 숫자·아이콘·카드. 설명은 ⓘ를 누르면 나와요 */
let upAll=false;
const dots=(l,m)=>'<span class="dots">'+Array.from({length:m},(_,i)=>'<i'+(i<l?' class="f"':'')+'></i>').join('')+'</span>';
const stars=(l,m)=>'<span class="stars">'+'★'.repeat(l)+'<s>'+'★'.repeat(Math.max(0,m-l))+'</s></span>';
const sgn=v=>(v>=0?'+':'−')+fmt(Math.abs(Math.round(v)));
const infoShow=(e,t,h)=>bzShow(e,t,'<div style="text-align:left;font-size:16px;line-height:1.55">'+h+'</div>','알겠어요');
function renderUp(top){[0,1,2,3].forEach(i=>$('ut'+i).className=i===utab?'on':'');
 const L=$('shl'),sy=L.scrollTop;$('um').style.display=utab===2?'block':'none';L.style.height=utab===2?'470px':'560px';
 const r=BIZ.rates(save,bctx()),acts={},infos={};let aid=0,h='';
 const act=fn=>{const k='a'+(aid++);acts[k]=fn;return k},inf=(e,t,x)=>{const k='i'+(aid++);infos[k]=[e,t,x];return'<i class="inf" data-inf="'+k+'">i</i>'};
 /* 카드: o = {e, n, top(점·별), st, btn, can, done, hot, lk, warn, info:[e,t,html], fn} */
 const card=o=>'<div class="uc'+(o.hot?' hot':'')+(o.lk?' lk':'')+'">'+(o.info?inf(...o.info):'')+(o.warn?'<span class="warn">'+o.warn+'</span>':'')+'<div class="av">'+o.e+'</div><div class="nm">'+o.n+'</div>'+(o.top||'')+'<div class="st">'+(o.st||'')+'</div>'+(o.ex||'')+'<button class="ub'+(o.done?' done':o.can?'':' no')+'" data-act="'+act(o.fn||(()=>{}))+'">'+o.btn+'</button></div>';
 const buyFx=(ok,msg)=>{if(!ok){toast('코인이 부족해요!');snd('no');return}store();snd('buy');if(window.JUICE)JUICE.confetti(45);if(msg)toast(msg);renderUp();bizBtn()};
 /* 💰 가격 스위치 */
 const price=(k,lab)=>{const pr=Object.assign({b:1,d:1},save.pr||{}),cur=pr[k],cx_=bctx(),net=i=>{const t=JSON.parse(JSON.stringify(save));t.pr=Object.assign({},pr);t.pr[k]=i;return BIZ.rates(t,cx_).net},n0=net(cur);
  let x='<div class="prc">'+inf('💰','가격 정하기','값을 올리면 한 명이 더 많이 내지만, 오는 손님이 줄어요.<br>• <b>손님이 넘칠 때</b>(굽기·계산이 막힘) → 올려도 받을 만큼은 와요 → 이득<br>• <b>손님이 모자랄 때</b> → 내리면 더 와요<br>버튼 아래 숫자는 지금보다 시간당 얼마 더(▲)·덜(▼) 버는지예요.')+'<div class="pt"><span style="margin-left:22px">'+lab+'</span><b class="'+(n0<0?'neg':'')+'">'+sgn(n0)+'/시간</b></div><div class="seg">';
  BIZ.PRICE.forEach((q,i)=>{const d=Math.round(net(i)-n0);x+='<button data-act="'+act(()=>{BIZ.setPrice(save,k,i);store();snd('tap');renderUp();bizBtn()})+'"'+(i===cur?' class="on"':'')+'>'+q.e+'<small>'+q.n.replace('아주 비싸게','아주')+'</small><i class="'+(i===cur?'':d>0?'up':d<0?'dn':'')+'">'+(i===cur?'지금':d>0?'▲'+fmt(d):d<0?'▼'+fmt(-d):'±0')+'</i></button>'});
  return x+'</div></div>'};
 $('uw').innerHTML='<span class="pill">🪙 '+fmt(save.coins)+'</span><span class="pill">💼 '+sgn(r.net)+'/시간</span>';
 if(utab===0){
  const red=k=>r.neck===k||(r.neck==='both'&&(k==='bake'||k==='serve'));
  h+='<div class="flow">'+[['arrive','🐾','오는 손님'],['bake','🍞','굽기'],['serve','🧾','계산']].map(([k,e,n],i)=>(i?'<span class="ar">▶</span>':'')+'<div class="nd'+(red(k)?' red':'')+'">'+e+'<b>'+n1(r[k])+'</b><small>'+n+'/시간</small></div>').join('')+'</div>';
  h+='<div class="chips" style="margin-top:12px">'+(r.dNeck?'<span class="chip red">☕ 음료 밀림 '+n1(r.dCap)+'/'+n1(r.dWant)+'잔</span>':'')+(r.seatB?'<span class="chip">🪑 자리 +'+Math.round(r.seatB*100)+'%</span>':'')+(save.debt>0?'<span class="chip red">💸 밀린 돈 '+fmt(Math.ceil(save.debt))+' · 알바 절반</span>':'')+'</div>';
  h+=price('b','🐟 붕어빵 값');
  const rk=r.neck==='arrive'?['promo']:r.neck==='both'?['bake','serve']:[r.neck];if(r.dNeck)rk.push('barista');
  h+='<div class="gr2">';
  BIZ.STAFF.forEach(x=>{if(x.f2&&(save.room|0)<11)return;const lv=BIZ.lvOf(save,x.k),c=BIZ.hireCost(save,x.k),nm={bake:'굽기',serve:'계산',promo:'홍보',barista:'바리스타',bake2:'굽기 2호',serve2:'계산 2호'}[x.k];
   const cap=BIZ.capOf(save,x.k),lvN=(l,u)=>'<div class="lvn">Lv <b>'+l+'</b><small>/'+Math.max(l,cap)+'</small></div>',full=c!=null&&lv>=cap,nr=x.f2?BIZ.F2ROOM.find(q=>BIZ.STCAP[q.n]>lv):IS.ROOM.find(q=>BIZ.STCAP[q.n]>lv);
   if(!BIZ.canHire(save,x.k)){h+=x.f2?card({e:x.an,n:nm,lk:1,top:lvN(0),st:'🏢 2층을 올리면',btn:'🏢 가게로',can:1,fn:()=>{utab=1;renderUp(true)}}):card({e:x.an,n:nm,lk:1,top:lvN(0),st:'☕ 카페를 열면',btn:'☕ 카페로',can:1,fn:()=>{utab=3;renderUp(true)}});return}
   const u=BIZ.useOf(save,x.k),low=u<lv,v={bake:['🍞',4+2.5*u,4+2.5*(lv+1),''],serve:['🧾',4+2.5*u,4+2.5*(lv+1),''],promo:['🐾',15*u,15*(lv+1),'%'],barista:['☕',2+3*u,2+3*(lv+1),''],bake2:['🍞',2.5*u,2.5*(lv+1),''],serve2:['🧾',2.5*u,2.5*(lv+1),'']}[x.k];
   const setU=d=>act(()=>{const n=BIZ.setUse(save,x.k,BIZ.useOf(save,x.k)+d);store();snd('tap');renderUp();bizBtn();if(d<0&&n===BIZ.useOf(save,x.k)&&n===0)toast(x.an+' '+nm+' 알바가 쉬어요 · 월급 0')}),
    ex=lv>0?'<div class="wk'+(low?' low':'')+'"><button data-act="'+setU(-1)+'"'+(u<=0?' disabled':'')+'>−</button><span>'+(low?'💤 ':'')+'일 Lv'+u+'<small>💵 '+fmt(BIZ.wageOf(u))+'/시간</small></span><button data-act="'+setU(1)+'"'+(u>=lv?' disabled':'')+'>+</button></div>':'';
   const capped=x.k==='promo'&&r.neck!=='arrive';
   h+=card({e:x.an,n:nm,top:lvN(lv),ex,st:c==null?v[0]+' '+n1(v[1])+v[3]+' 최고!':v[0]+' '+(x.k==='promo'?'+':'')+n1(v[1])+v[3]+' → <b>'+(x.k==='promo'?'+':'')+n1(v[2])+v[3]+'</b>',btn:c==null?'✅ 최고':full?(x.f2?'🏢 2층 넓히면 Lv':'🏠 넓히면 Lv')+(nr?BIZ.STCAP[nr.n]:BIZ.SMAX):fmt(c)+'🪙',can:full||c!=null&&save.coins>=c,done:c==null,hot:(rk.includes(x.k)||x.f2&&rk.includes(x.k.slice(0,-1)))&&c!=null&&!full,warn:capped?'⚠️':'',
    info:[x.an,x.e+' '+x.n+' · Lv '+lv+'/'+BIZ.SMAX,x.d+'<br>'+(x.f2?'🏢 지금 2층('+BIZ.f2Of(save)+'×'+BIZ.f2Of(save)+')에서는 <b>Lv'+cap+'</b>까지 · 2층을 넓히면 더 키울 수 있어요<br>':'🏠 지금 가게('+save.room+'×'+save.room+')에서는 <b>Lv'+cap+'</b>까지 · 넓히면 더 키울 수 있어요<br>')+({bake:'시간당 구울 수 있는 손님 수',serve:'시간당 계산할 수 있는 손님 수',promo:'오는 손님이 늘어요',barista:'시간당 만들 수 있는 음료 수',bake2:'1호와 같이 구워서 더 많은 손님을 받아요',serve2:'1호와 같이 계산해서 더 많은 손님을 받아요'}[x.k])+'<br>💵 월급 '+fmt(BIZ.wageOf(u))+'원/시간'+(c==null?'':' → 올리면 '+fmt(BIZ.wageOf(lv+1)))+'<br><br>➖➕ <b>일 Lv</b>을 낮추면 그만큼만 일하고 월급도 줄어요. 올리면 다시 고용한 레벨까지 일해요(돈 안 들어요)'+(capped?'<br><br>⚠️ 지금은 굽기·계산이 막혀서 <b>홍보해도 손님이 안 늘어요</b>. 💰 값을 올려 보세요!':'')+'<br><br>💡 빨간 칸(👆)부터 키우면 손해가 없어요'],
    fn:()=>{if(c==null)return;if(full){toast((x.f2?'🏢 2층을 ':'🏠 ')+(nr?nr.n+'×'+nr.n+'로 넓히면 Lv'+BIZ.STCAP[nr.n]+'까지 키울 수 있어요':'넓히면 더 키울 수 있어요'));snd('no');utab=1;renderUp(true);return}buyFx(BIZ.hire(save,x.k),x.an+' '+nm+' Lv'+(lv+1)+'!')}})});
  h+='</div>'}
 else if(utab===1){const p=BIZ.place(save),own=BIZ.owned(save),n=save.room;
  h+='<div class="srow"><span>🏠 크기<b>'+n+'×'+n+'</b></span><span>💸 월세<b>'+fmt(BIZ.rentOf(save))+'</b></span><span>🐾 손님<b>+'+Math.round((p.mul-1)*100)+'%</b></span><span>👥 알바<b>Lv'+BIZ.capOf(save)+'</b></span><span>✨ 매력<b>'+Math.round(BIZ.charmCap(save)*100)+'%</b></span></div>';
  h+='<div class="cur"><div class="av">'+p.e+'</div><div class="tx"><b>'+p.n+'</b><div>'+(!p.rent?'월세 없음 ✅':own?'내 가게 ✅ 월세 0':'월세 '+fmt(p.rent)+'/시간 · '+Math.round(p.buy/p.rent)+'시간이면 본전')+'</div></div>'+(p.rent&&!own?'<button class="ub'+(save.coins>=p.buy?'':' no')+'" data-act="'+act(()=>{buyFx(BIZ.buyPlace(save),'🎉 '+p.n+'이 내 가게가 됐어요! 월세 0원')})+'">🏠 '+fmt(p.buy)+'</button>':'')+'</div>';
  const nx=IS.ROOM.find(q=>q.n===n+1);
  if(nx){const q=BIZ.PLACE[nx.n],lk=nx.g>grade();h+='<div class="dn2">▼</div><div class="nx"><div class="av">'+q.e+'</div><div class="tx"><b>'+q.n+' '+nx.n+'×'+nx.n+'</b><div class="chips" style="justify-content:flex-start;margin:3px 0 0"><span class="chip">🐾 +'+Math.round((q.mul-1)*100)+'%</span><span class="chip">💸 '+fmt(q.rent)+'</span><span class="chip">🪑 칸 +'+(nx.n*nx.n-n*n)+'</span><span class="chip">👥 알바 Lv'+BIZ.STCAP[nx.n]+'</span><span class="chip">✨ 매력 '+Math.round(BIZ.CHCAP[nx.n]*100)+'%</span></div></div><button class="ub'+(lk?' no':save.coins>=nx.p?'':' no')+'" data-act="'+act(()=>{if(lk){toast(GR[nx.g].e+' '+GR[nx.g].n+' 등급이 되면 넓힐 수 있어요');snd('no');return}openDeco('up',true)})+'">'+(lk?'🔒 '+GR[nx.g].e:'📐 '+fmt(nx.p))+'</button></div>'}
  else{h+='<div class="tip">🎉 가장 넓은 1층이에요!</div>';const f2=BIZ.f2Of(save),q=BIZ.f2Next(save),en=q?q.n:f2;
   h+='<div class="dn2">▼</div><div class="nx"><div class="av">🏢</div><div class="tx"><b>'+(f2?'2층 '+f2+'×'+f2+(q?' → '+q.n+'×'+q.n:' (최대)'):'2층 올리기 5×5')+'</b><div class="chips" style="justify-content:flex-start;margin:3px 0 0"><span class="chip">✨ 매력 +'+Math.round(BIZ.F2CH[en]*100)+'%p</span><span class="chip">🐾 +'+Math.round(BIZ.F2MUL[en]*100)+'%</span><span class="chip">🪑 꾸밀 곳 +'+en*en+'칸</span></div></div>'+(q?'<button class="ub'+(save.coins>=q.p?'':' no')+'" data-act="'+act(buildF2)+'">🏢 '+fmtS(q.p)+'</button>':'')+'</div>'}
  h+='<button class="more" data-act="'+act(()=>{upAll=!upAll;renderUp()})+'">📐 모든 크기 '+(upAll?'접기 ▴':'보기 ▾')+'</button>';
  if(upAll){h+='<div class="gr3">';[5,6,7,8,9,10,11].forEach(k=>{const q=BIZ.PLACE[k];h+='<div class="uc'+(k===n?' hot':'')+'" style="padding-bottom:6px"><div class="av">'+q.e+'</div><div class="nm">'+k+'×'+k+'</div><div class="st">🐾 +'+Math.round((q.mul-1)*100)+'%<br>👥 Lv'+BIZ.STCAP[k]+' · ✨ '+Math.round(BIZ.CHCAP[k]*100)+'%<br>💸 '+fmt(q.rent)+(save.bought.includes(k)?' ✅':'')+'</div></div>'});h+='</div>'}
  h+=zoneUI(r,card,act,inf)}
 else if(utab===3){const cf=BIZ.cafe(save);
  if(!cf.on){h+='<div class="hero"><div class="av">☕</div><h3>카페 열기</h3><div class="chips"><span class="chip">🐾 손님 +10%</span><span class="chip">🥤 음료도 팔아요</span><span class="chip">🙋 직접 만들기</span></div><button class="ub'+(save.coins>=BIZ.MACHINE?'':' no')+'" data-act="'+act(()=>{if(!BIZ.buyMachine(save)){toast('코인이 부족해요!');snd('no');return}store();snd('win');renderUp(true);bizBtn();bzShow('☕','카페를 열었어요!','• 🧊 아이스 아메리카노 · ☕ 카페라떼를 팔아요<br>• <b>🙋 도와주기 → ☕ 음료 만들기</b>로 직접 만들 수 있어요<br>• 👥 직원에서 🐼 바리스타를 뽑아요','좋아요!')})+'">'+fmt(BIZ.MACHINE)+'🪙</button></div><div class="gr3">';
   BIZ.DRINKS.forEach(d=>{h+='<div class="uc'+(d.un?' lk':'')+'"><div class="av">'+d.e+'</div><div class="nm">'+d.s+'</div><div class="st">'+fmt(d.p)+'원</div></div>'});h+='</div>'}
  else{h+='<div class="srow"><span>🥤 잔/시간<b>'+n1(r.drk)+'</b></span><span>💵 한 잔<b>'+fmt(Math.round(r.dPer))+'</b></span><span>🫘 원두<b>'+stars(cf.bean|0,BIZ.BEAN.length)+'</b></span></div>';
   if(r.dNeck)h+='<div class="chips"><span class="chip red" data-act="'+act(()=>{utab=0;renderUp(true)})+'">☕ 음료가 밀려요 → 🐼 바리스타 키우기 ›</span></div>';
   h+=price('d','☕ 음료 값')+'<div class="gr3">';
   BIZ.DRINKS.forEach(d=>{const own=cf.dr.includes(d.k),ig=BIZ.ING[d.k],lv=BIZ.ingLv(save,d.k),c=BIZ.ingCost(save,d.k),pr=Math.round(BIZ.dPrice(save,d)*BIZ.beanMul(save));
    if(!own){h+=card({e:d.e,n:d.s,lk:1,st:'🔒 배우기',btn:fmt(d.un)+'🪙',can:save.coins>=d.un,info:[d.e,d.n,'판매가 '+fmt(d.p)+'원 · '+(d.cup==='ice'?'🧊 아이스':'🔥 따뜻하게')+'<br>'+d.st.map(q=>CAFE_ING[q[0]].e+CAFE_ING[q[0]].n).join(' → ')],fn:()=>buyFx(BIZ.buyDrink(save,d.k),d.e+' '+d.n+' 메뉴 추가!')});return}
    h+=card({e:d.e,n:d.s,top:stars(lv,3),st:fmt(pr)+'원',btn:c==null?'✅':ig.e+' '+fmt(c),can:c!=null&&save.coins>=c,done:c==null,info:[d.e,d.n,'판매가 '+fmt(pr)+'원<br>'+d.st.map(q=>CAFE_ING[q[0]].e+CAFE_ING[q[0]].n).join(' → ')+'<br><br>🧪 재료 '+ig.e+' '+ig.n+' '+'★'.repeat(lv)+'☆'.repeat(3-lv)+'<br>단계마다 이 음료 값 +8% · +16% · +25%'],fn:()=>{if(c==null)return;buyFx(BIZ.buyIng(save,d.k),ig.e+' '+ig.n+' '+'★'.repeat(lv+1)+'!')}})});
   const bc=BIZ.beanCost(save),bl=cf.bean|0;
   h+=card({e:'🫘',n:'원두',top:stars(bl,BIZ.BEAN.length),st:'모든 음료 ×'+BIZ.beanMul(save).toFixed(2),btn:bc==null?'✅':fmt(bc),can:bc!=null&&save.coins>=bc,done:bc==null,info:['🫘','원두 등급','모든 음료 값이 한 단계마다 ×0.15씩 올라요'],fn:()=>{if(bc==null)return;buyFx(BIZ.buyBean(save),'🫘 원두 등급 업!')}});
   h+=card({e:'🎁',n:'세트',st:cf.set?'팔고 있어요':'🐟+☕',btn:cf.set?'✅':fmt(BIZ.SET_COST),can:!cf.set&&save.coins>=BIZ.SET_COST,done:!!cf.set,info:['🎁','붕어빵 + 음료 세트','음료를 같이 사는 손님이 늘어요 (+10%p)'],fn:()=>{if(cf.set)return;buyFx(BIZ.buySet(save),'🎁 세트 메뉴 시작!')}});
   h+='</div><div class="tip">🐼 바리스타는 👥 직원 · 직접 만들기는 🙋 도와주기</div>'}}
 else{
  const nu=Math.min(save.nfUse,save.nf);$('um').innerHTML='<div style="display:flex;align-items:center;justify-content:center;gap:8px"><b>팔 메뉴</b> <span style="font-size:20px">'+R.menu.slice(0,nu).map(m=>m.e).join('')+'</span> <button id="nfm" style="width:40px;height:34px;padding:0;font-size:18px">➖</button><button id="nfp" style="width:40px;height:34px;padding:0;font-size:18px">➕</button></div>';
  $('nfm').onclick=()=>{if(save.nfUse>1){save.nfUse--;store();renderUp();bizBtn()}};$('nfp').onclick=()=>{if(save.nfUse<save.nf){save.nfUse++;store();renderUp();bizBtn()}};
  const FU=[0,1,2,3,4,5].filter(f=>f<save.nf).map(f=>'fu'+f),ALL=['fl','mold','rack','speed','auto','pat','loc',...FU],rc=B.recUp(save,ALL,save.lr);
  const short=t=>{t=String(t);const w=t.match(/([+\-−]?\d[\d,]*%?)(개)?[^()]*\(지금\s*([^)]+)\)/);if(w)return w[3].replace('개','')+' → <b>'+w[1]+'</b>'+(w[2]||'');if(/반죽+/.test(t))return'🤖 톡 한 번에';t=t.replace(/\(.*?\)/g,'').trim();const m=t.match(/(\d[\d,]*)\s*(개|원)?\s*→\s*(\d[\d,]*)\s*(개|원)?/);if(m)return m[1]+' → <b>'+m[3]+'</b>'+(m[4]||m[2]||'');const p=t.split('·')[0].trim();return p.length>12?p.slice(0,11)+'…':p};
  h+='<div class="gr2">';
  ALL.forEach(k=>{const c=B.upCost(save,k),d=B.upInfo(save,k),lv=(d[3].match(/(\d+)\s*\/\s*(\d+)/)||[0,0,1]),isR=rc&&rc.k===k;
   h+=card({e:d[0],n:d[1],top:dots(+lv[1],+lv[2]),st:c==null?'최고!':short(d[2]),btn:c==null?'✅':fmt(c)+'🪙',can:c!=null&&save.coins>=c,done:c==null,hot:isR,info:[d[0],d[1]+' · '+d[3],d[2]+(isR?'<br><br>👍 추천: '+rc.why:'')],fn:()=>{if(c==null)return;const ok=B.buy(save,k);if(ok&&k==='fl')save.nfUse=save.nf;buyFx(ok,d[0]+' '+d[1]+'!')}})});
  h+='</div><div class="tip">🙋 도와주기가 쉬워져요 · 🆕 메뉴 · 🫘 맛 · 🗺️ 장사 터는 직원 장사 매출도 올려요</div>'}
 L.innerHTML=h;
 L.querySelectorAll('[data-act]').forEach(b=>b.onclick=e=>{e.stopPropagation();const f=acts[b.dataset.act];if(f)f()});
 L.querySelectorAll('[data-inf]').forEach(b=>b.onclick=e=>{e.stopPropagation();snd('tap');infoShow(...infos[b.dataset.inf])});
 L.scrollTop=top?0:sy}
[0,1,2,3].forEach(i=>$('ut'+i).onclick=()=>{utab=i;renderUp(true)});
$('ux').onclick=()=>{if(backTo==='res'){scr='res';show('res')}else if(backTo==='led')openLed();else toHome()};
/* ---------- 장부 ---------- */
function openLed(){bzHide();scr='led';renderLed();show('led')}
function renderLed(){const r=BIZ.rates(save,bctx()),L=BIZ.ledger(save,Date.now()),Y=save.ledY,hp=x=>x&&x.help?'<div class="chips" style="justify-content:flex-start"><span class="chip ok">🙋 도와주기 +'+fmt(Math.round(x.help))+'</span></div>':'';
 const red=k=>r.neck===k||(r.neck==='both'&&(k==='bake'||k==='serve'));
 let h='<div class="flow">'+[['arrive','🐾','오는 손님'],['bake','🍞','굽기'],['serve','🧾','계산']].map(([k,e,n],i)=>(i?'<span class="ar">▶</span>':'')+'<div class="nd'+(red(k)?' red':'')+'">'+e+'<b>'+n1(r[k])+'</b><small>'+n+'/시간</small></div>').join('')+'</div><div style="height:12px"></div>';
 {const R0=BIZ.rt(save),m=BIZ.rtMul(save),em=BIZ.evMul(save,Date.now()),e=save.ev,T=e&&EVT[e.k];h+='<div class="chips" style="justify-content:flex-start"><span class="chip">⭐ 평점 '+R0.v.toFixed(1)+' · 손님 '+(m>=1?'+':'−')+Math.round(Math.abs(m-1)*100)+'%</span>'+(em.a!==1||em.p!==1?'<span class="chip'+(em.a<1?' red':' ok')+'">📅 오늘 사건: 손님 '+(em.a>=1?'+':'−')+Math.round(Math.abs(em.a-1)*100)+'%'+(em.p!==1?' · 값 −'+Math.round((1-em.p)*100)+'%':'')+'</span>':'')+'</div>'}
 h+=lgBlock(r,'⏱️ 지금 1시간에')+(save.debt>0?'<div class="chips"><span class="chip red">💸 밀린 돈 '+fmt(Math.ceil(save.debt))+' · 다 갚을 때까지 알바 절반</span></div>':'');
 h+=lgBlock(L,'📅 오늘 '+(L.h?'('+hm(L.h)+')':''),hp(L));
 if(Y)h+=lgBlock(Y,'📅 어제 ('+hm(Y.h)+')',hp(Y));
 h+='<div class="tip">🧂 재료 · 🏠 월세(가게를 사면 0) · 👥 월급 · 🏛️ 세금(남은 돈의 10%) · 자리 비워도 8시간까지 장사</div>';
 $('lb').innerHTML=h}
$('l1').onclick=()=>openUp('led',0);$('lx').onclick=()=>toHome();$('biz').onclick=()=>{au();openLed()};
/* ---------- 꾸미기 (가구 놓기 + 꾸밈 칸 + 넓히기) ---------- */
let dback='home',dsel=null,dpick=null,dghost=null;
/* 꾸미기 탭 4개: 가구 / 벽·바닥 / 간판·장식 / 넓히기 (벽·바닥·장식은 아래 작은 칸으로 고르기) */
const DPH=324; /* 꾸미기 아래 판 높이 */
const DG=[{k:'fur',n:'🪑 가구'},{k:'wf',n:'🧱 벽·바닥',sl:['wall','floor','sky']},{k:'dec',n:'🏮 장식',sl:['sign','awn','top','lit','sL','sR','mas','shape']},{k:'skin',n:'🏠 외관',sl:['skin']},{k:'room',n:'📐 넓히기'}];
let dsub=0,fcat=2;
/* 🆕 11/14 새로 나온 가구: 나온 날부터 2주 동안 'NEW' + 🆕 칸 (키 앞부분 → 나온 날) */
const NEWP=[['r_',Date.UTC(2026,10,16)],['w_crown',Date.UTC(2026,10,16)],['c_',Date.UTC(2026,10,12)],['d_',Date.UTC(2026,10,13)],['w_mac',Date.UTC(2026,10,13)],['s_',Date.UTC(2026,10,14)],['v_',Date.UTC(2026,10,14)],['w_wheel',Date.UTC(2026,10,14)],['w_stock',Date.UTC(2026,10,14)],['bean_',Date.UTC(2026,10,14)],['mar_',Date.UTC(2026,10,14)],['lea_',Date.UTC(2026,10,14)],['cld_',Date.UTC(2026,10,14)]];
const isNewF=k=>{const p=NEWP.find(([q])=>k.indexOf(q)===0);return!!p&&Date.now()<p[1]+15*864e5};
const FCAT=[{k:'own',n:'📦 내 가구'},{k:'new',n:'🆕 새로 나온'},{k:'sit',n:'🪑 의자·탁자'},{k:'plant',n:'🪴 식물'},{k:'lit',n:'💡 조명'},{k:'deco',n:'🧸 장식'},{k:'set',n:'🎁 세트'},{k:'sp',n:'✨ 특별'},{k:'prem',n:'💎 프리미엄'},{k:'wall',n:'🖼️ 벽 장식'}];
if(IS.FUR.some(f=>isNewF(f.k)))fcat=1;
/* 가구 카드 그림: 작은 캔버스에 실제 가구를 그려서 */
const TCV=document.createElement('canvas');TCV.width=TCV.height=240;const TCX=TCV.getContext('2d'),TI=ISO(TCX,ART(TCX,{shape:()=>save.eq.shape|0})),THC={};
const thumbOf=k=>{if(THC[k])return THC[k];const v=TI.thumb(k);if(TI.imgReady(k))THC[k]=v;return v};
/* 11/13 그림이 아직 안 받아졌으면 카드가 비어 보여서: 받아지는 대로 카드 그림을 다시 그려요 */
let thW=null;function thFix(){if(thW)return;let n=0;thW=setInterval(()=>{const ims=document.querySelectorAll('#dl img[data-k]');let left=0;ims.forEach(im=>{const k=im.dataset.k;if(TI.imgReady(k)){im.src=thumbOf(k);im.removeAttribute('data-k')}else left++});if(!left||++n>60){clearInterval(thW);thW=null}},250)}
/* 🏅 메달 상점: 꾸미기 화면을 '메달 전용 탭'으로 열어요. 나중에 품목이 늘면 MG에 탭을 더해요 */
const MG=[{k:'mskin',n:'🏠 메달 스킨',sl:['skin']},{k:'mwall',n:'🧱 벽지',sl:['wall']},{k:'mfloor',n:'🟫 바닥',sl:['floor']}];
/* 벽·바닥은 가격순으로 보여 줘요 (번호는 저장값이라 그대로) */
const slOrd=sl=>{const o=sl.L.map((it,id)=>[it,id]);if(sl.k==='wall'||sl.k==='floor')o.sort((a,b)=>(a[0].m?1e12:a[0].p)-(b[0].m?1e12:b[0].p));return o};let dMed=false;
const DT=()=>dMed?MG:DG;
const dtabK=()=>{const g=DT()[dtab]||DT()[0];return g.sl?g.sl[Math.min(dsub,g.sl.length-1)]:g.k};
/* 꾸미기는 처음부터 방 전체가 아래 판 위에 보이게 (나갈 때 원래 보기로) */
let dFit0=null;
function openMedal(from){dMed=true;openDeco(from||'home');dtab=0;dsub=0;const L=SKIN.map((it,i)=>i).filter(i=>SKIN[i].m);prev={k:'skin',id:L.find(i=>!save.own.skin.includes(i))??L[0]};renderDeco()}
let dSc0=0;function openDeco(from,room){dSc0=decoScore();if(!dMed)dMed=false;if(dFit0==null){dFit0=IS.fit;IS.fit=true;IS.resetPan();zfK=''}save.dHint=(save.dHint|0)+1;dback=from;dtab=room?DG.length-1:0;dsub=0;prev=null;dsel=null;dpick=null;dghost=null;scr='deco';renderDeco();show('dc')}
function lockOf(it){if(it.xm&&!(window.XMAS&&XMAS()))return'🔒 12월 한정';if(it.f2&&!BIZ.f2Of(save))return'🔒 🏢 2층을 올리면';if(it.from&&Date.now()<it.from){const d=new Date(it.from+9*3600e3);return'🔒 '+(d.getUTCMonth()+1)+'월 '+d.getUTCDate()+'일 공개'}if(it.g>grade())return'🔒 '+GR[it.g].e+' '+GR[it.g].n+' 등급';if(it.st&&save.stars<it.st)return'🔒 ⭐ '+it.st;return null}
const f0=k=>IS.CK(k)||{n:'',p:0};const placed=k=>allFur().filter(it=>it.k===k).length,spare=k=>(save.inv[k]||0)-placed(k);
const pendList=()=>{const L=allFur().filter(f=>f.pend);return{L,n:L.length,sum:L.reduce((a,f)=>a+((IS.CK(f.k)||{}).p||0),0)}};
/* 🏢 2층 올리기·넓히기 (계단 자리 = 입구 옆 칸의 가구는 1·2층 모두 보관함으로) */
/* 🪜 계단 칸(입구 옆 (n-2,0))에 있는 가구 → 보관함 (1층·2층) */
function stClr(){if(!(BIZ.f2Of(save)>0))return 0;let c=0;const go=(key,n)=>{let it;while((it=IS.occAt(save[key]||[],n-2,0))){keepS(it);save[key]=save[key].filter(x=>x!==it);c++}};go('fur',save.room);if(save.fur2)go('fur2',BIZ.f2Of(save));return c}
function buildF2(){const first=!BIZ.f2Of(save),nx=BIZ.f2Next(save);if(!nx)return;if(save.coins<nx.p){toast('코인이 부족해요! 🪙'+fmtS(nx.p-save.coins)+' 모자라요');snd('no');return}
 if(!BIZ.buyF2(save))return;const mv=stClr();
 store();snd('fanfare');if(window.JUICE)JUICE.confetti(140);prev=null;
 if(first){F2V=true;IS.resetPan();dsel=null;toast('🏢 2층이 생겼어요! 왼쪽 버튼으로 1층·2층을 오가요'+(mv?' · 계단 자리 가구는 📦 보관함에':''))}
 else toast('🏢 2층이 '+save.f2+'×'+save.f2+'로 넓어졌어요! ✨ 매력 상한 +'+Math.round(BIZ.F2CH[save.f2]*100)+'%p'+(mv?' · 계단 자리 가구는 📦 보관함에':''));
 if(scr==='deco')renderDeco();else if(scr==='up')renderUp(true);bizBtn()}
function setF2V(v){if(F2V===!!v)return;F2V=!!v&&BIZ.f2Of(save)>0;IS.resetPan();dsel=null;dghost=null;IS.reset();hPre=0;if(scr==='deco'){prev=null;renderDeco()}snd('tap')}
let flbK='';function flbSync(){const b=$('flb');if(!b)return;const hm=scr==='home'&&$('hm').style.display==='block',vis=scr==='visit'&&vd&&((vd.eq&&vd.eq.f2)|0)>=5,on=vis||BIZ.f2Of(save)>0&&(hm||(scr==='deco'&&!dMed&&dtabK()!=='skin')),up=vis?vF2:F2V,k=on+'|'+up+'|'+scr;if(k===flbK)return;flbK=k;b.style.display=on?'block':'none';if(!on)return;b.textContent=up?'⬇️ 1층':'⬆️ 2층';b.style.top=(scr==='deco'?H-DPH-50:scr==='visit'?560:424)+'px'}
/* 🧱 11/14 VOC '가구 더 놓고 싶은데 어떻게 넓혀요?': 빈 칸이 적으면 넓히기로 안내 */
function freeN(){const n=RMN(),L=FUR();let c=0;for(let x=0;x<n;x++)for(let y=0;y<n;y++){if(!IS.inRoom(x,y,n)||IS.isCounter(x,y)||IS.isPath(x,y,n)||IS.occAt(L,x,y))continue;c++}return c}
const canGrow=()=>F2V?!!BIZ.f2Next(save):save.room<11;
function dbtn(id,label,cls,fn){const b=$(id);b.textContent=label;b.className=cls||'';b.onclick=fn||null}
function renderDeco(){$('da3').style.display='none';thFix();const tabs=DT(),tk=dtabK();
 {const pd=pendList();$('dcw').textContent='🪙 '+fmt(save.coins)+(pd.n?' · 🛒'+pd.n+' −'+fmt(pd.sum):'')+(window.MEDAL&&!pd.n&&MEDAL.get().n?' · 🏅'+MEDAL.get().n:'')}$('dci').textContent=dMed?'🔥 챌린지에서 모아요':'✨ 매력 +'+Math.round(charmBonus()*100)+'%';if(dMed&&window.MEDAL)$('dcw').textContent='🏅 메달 '+MEDAL.get().n+'개';
 const T=$('dtabs');T.innerHTML='';const tight=!dMed&&tk==='fur'&&canGrow()&&freeN()<=4;tabs.forEach((x,i)=>{const b=document.createElement('button');b.textContent=x.n+(tight&&x.k==='room'?' ❗':'');if(i===dtab)b.className='on';b.onclick=()=>{dtab=i;dsub=0;prev=null;dsel=null;dpick=null;dghost=null;$('dl').scrollLeft=0;renderDeco()};T.appendChild(b)});
 {const S=$('dsub'),g=DT()[dtab];S.innerHTML='';S.style.display=!dMed&&(g.sl||g.k==='fur')?'flex':'none';if(g.k==='fur')FCAT.forEach((c,j)=>{const b=document.createElement('button');b.textContent=c.n;if(j===fcat)b.className='on';b.onclick=()=>{fcat=j;dpick=null;$('dl').scrollLeft=0;renderDeco()};S.appendChild(b)});if(g.sl)g.sl.forEach((k,j)=>{const sl=SLOTS.find(x=>x.k===k),b=document.createElement('button');b.textContent=sl.n;if(j===dsub)b.className='on';b.onclick=()=>{dsub=j;prev=null;$('dl').scrollLeft=0;renderDeco()};S.appendChild(b)})}
 const L=$('dl'),sl0=L.scrollLeft;L.innerHTML='';
 const card=(e,n,sub,cls,fn)=>{const b=document.createElement('button');b.className='cd '+(cls||'');b.innerHTML='<b>'+e+'</b>'+n+'<small>'+sub+'</small>';b.onclick=fn;L.appendChild(b)};
 let msg='';
 if(tk==='fur'){
  const fc=FCAT[fcat].k,fcard=f=>{const sp=spare(f.k),lk=sp>0?null:lockOf(f),pl=placed(f.k),b=document.createElement('button');b.className='cd fu'+(dpick===f.k?' on':'')+(lk?' lk':'');
   b.innerHTML='<img src="'+thumbOf(f.k)+'" alt=""'+(TI.imgReady(f.k)?'':' data-k="'+f.k+'"')+'><span class="fn"></span><small class="fp">'+(lk?lk.replace(' 등급','부터'):sp>0?'📦 보관 '+sp+'개':'🪙 '+fmt(f.p))+'</small><i class="fs">✨+'+(Math.floor(ptV(f.p)/100)+(pl?0:KIND_PT))+'</i>'+(pl?'<i class="fpl">놓음 '+pl+'</i>':isNewF(f.k)&&!(save.inv[f.k]|0)?'<i class="fnw">NEW</i>':'');b.querySelector('.fn').textContent=f.n;
   b.onclick=()=>{if(lk){toast(f.xm?'🎄 12월 한정 가구는 12월에만 살 수 있어요 (산 건 언제든 놓아요)':lk.replace('🔒 ','')+'이 되면 살 수 있어요');snd('no');return}dpick=dpick===f.k?null:f.k;dsel=null;renderDeco()};L.appendChild(b)};
  if(fc==='set')IS.SETS.forEach(st=>{const its=IS.FUR.filter(f=>f.set===st.k),hv=its.filter(f=>placed(f.k)>0).length,h=document.createElement('div');h.className='cdh'+(hv===its.length?' done':'');h.innerHTML='<b></b><small>'+hv+'/'+its.length+(hv===its.length?' 완성! ✨+'+(st.b||IS.SET_BONUS):' · 다 놓으면 ✨+'+(st.b||IS.SET_BONUS))+'</small>';h.querySelector('b').textContent=st.n;L.appendChild(h);its.forEach(fcard)});
  else if(fc==='own'){const my=IS.FUR.concat(IS.WFUR).filter(f=>(save.inv[f.k]|0)>0||placed(f.k)>0).sort((a,b)=>(spare(b.k)>0)-(spare(a.k)>0)||b.p-a.p);if(my.length)my.forEach(fcard);else{const h=document.createElement('div');h.className='cdh';h.innerHTML='<b>아직 가진 가구가 없어요</b><small>다른 칸에서 골라 놓으면 여기 모여요</small>';L.appendChild(h)}}
  else if(fc==='new'){const nl=IS.FUR.concat(IS.WFUR).filter(f=>isNewF(f.k)).sort((a,b)=>a.p-b.p);if(nl.length)nl.forEach(fcard);else{const h=document.createElement('div');h.className='cdh';h.innerHTML='<b>지금은 새 가구가 없어요</b><small>새 가구가 나오면 2주 동안 여기 모여요</small>';L.appendChild(h)}}
  else if(fc==='wall')IS.WFUR.forEach(fcard);
  else IS.FUR.filter(f=>f.c===fc).sort((a,b)=>a.p-b.p).forEach(fcard);
  const f=dsel&&IS.CK(dsel.k),wsel=dsel&&IS.WK[dsel.k],wpk=dpick&&IS.WK[dpick];
  $('da3').style.display='';const sellK=!dsel&&dpick&&spare(dpick)>0&&f0(dpick).p>0?dpick:null;
  if(sellK){const F=f0(sellK),v=Math.floor(F.p/2);dbtn('da3','💰 팔기 🪙'+fmtS(v),'go',()=>{if(spare(sellK)<=0)return;/* 🔢 11/14 VOC: 수량 골라 팔기 (★ 강화한 건 맨 나중에 팔려요) */const mx=spare(sellK),nst=(save.stS&&save.stS[sellK]||[]).length;JUICE.ask('💰 '+F.n+' 팔기','보관함에 있는 걸 1개당 산 값의 절반 🪙'+fmt(v)+'에 팔아요 (보관 '+mx+'개)'+(nst?' · ★ 강화한 '+nst+'개는 맨 나중에 팔려요':''),'💰 1개 팔기 🪙'+fmt(v),n=>{n=Math.max(1,Math.min(n|0||1,spare(sellK)));if(spare(sellK)<=0)return;save.inv[sellK]=(save.inv[sellK]|0)-n;if(save.inv[sellK]<=0)delete save.inv[sellK];save.coins+=v*n;
   const Ls=save.stS&&save.stS[sellK];if(Ls&&Ls.length>Math.max(0,spare(sellK))){Ls.sort((a,b)=>a-b);while(Ls.length>Math.max(0,spare(sellK)))Ls.shift();if(!Ls.length)delete save.stS[sellK]}
   if(spare(sellK)<=0)dpick=null;store();snd('coins');toast('💰 '+F.n+' '+n+'개 팔았어요 +🪙'+fmt(v*n));renderDeco();bizBtn()},'그만두기',()=>{},null,null,{max:mx,lab:n=>'💰 '+n+'개 팔기 🪙'+fmt(v*n)})})}
  else{/* ✨ 11/14 VOC: 강화권이 있어도 코인/강화권 중 고르기 (싼 가구에 강화권이 자동으로 써지지 않게) */const it=dsel,sv=it?it.s|0:0,tk=(save.tix|0)>0,c=it?stCost(it):0;dbtn('da3',!it?'✨ 강화'+(tk?' 🎫'+save.tix:''):sv>=3?'✨ ★3 최고':'✨ ★'+(sv+1)+' 🪙'+fmtS(c),it&&sv<3?'go':'dis',()=>{if(!it||sv>=3)return;if(it.pend){toast('🛒 먼저 사야 강화할 수 있어요 (✔ 완료)');snd('no');return}
   const okC=save.coins>=c;if(!tk&&!okC){toast('코인이 부족해요! 🪙'+fmt(c));snd('no');return}const F=IS.CK(it.k),gain=Math.floor(ptV(F.p)*(STS[sv+1]-STS[sv])/200);
   const up=byTk=>{if((it.s|0)!==sv)return;if(byTk){if((save.tix|0)<=0)return;save.tix--}else{if(save.coins<c){toast('코인이 부족해요! 🪙'+fmt(c));snd('no');return}save.coins-=c}it.s=sv+1;store();snd('win');JUICE.confetti(50);IS.bounce(it);toast('✨ '+F.n+' ★'+it.s+'! 꾸미기 +'+fmt(gain)+(byTk?' · 🎫 남은 '+save.tix+'장':''));renderDeco()};
   const msg='반짝이가 붙고 꾸미기 ✨+'+fmt(gain)+(tk?' · 🎫 강화권은 비싼 가구의 높은 별에 쓰면 이득이에요':'');
   if(tk)JUICE.ask('✨ '+F.n+' ★'+(sv+1)+' 강화',msg,'🎫 강화권 1장 쓰기 (남은 '+save.tix+'장)',()=>up(1),'그만두기',()=>{},okC?'🪙 코인 '+fmt(c)+' 쓰기':null,()=>up(0));
   else JUICE.ask('✨ '+F.n+' ★'+(sv+1)+' 강화','🪙'+fmt(c)+' · '+msg,'✨ 강화하기',()=>up(0),'그만두기',()=>{})})}
  dbtn('da1','↻ 돌리기',f&&f.rot?'go':'dis',()=>{if(dsel&&IS.FK[dsel.k].rot){const nd=IS.nextRot(FUR(),dsel,RMN());if(nd==null){toast('🚧 돌릴 자리가 없어요 (2칸 가구)');snd('no');return}dsel.d=nd;store();snd('tap')}});
  dbtn('da2','📦 보관',dsel?'':'dis',()=>{if(!dsel)return;const it=dsel,F0=f0(it.k),keep=()=>{if(!FUR().includes(it))return;keepS(it);setFUR(FUR().filter(q=>q!==it));if(dsel===it)dsel=null;store();snd('tap');renderDeco()};
   /* 💰 11/14 VOC: 되팔기를 찾기 쉽게 — 📦을 누르면 보관/팔기 고르기 (값은 산 값의 절반, ★ 강화는 못 돌려받아요) */const v=F0&&F0.p>0&&!it.pend?Math.floor(F0.p/2):0;if(!v){keep();return}
   JUICE.ask('📦 '+F0.n+(it.s?' ★'+it.s:''),'보관하면 언제든 다시 놓을 수 있어요 · 팔면 산 값의 절반 🪙'+fmt(v)+(it.s?' · ⚠️ ★ 강화는 돌려받지 못해요':''),'📦 보관하기',keep,'그만두기',()=>{},'💰 팔기 🪙'+fmt(v),()=>{if(!FUR().includes(it))return;const I=save.inv[it.k]|0,P=placed(it.k);setFUR(FUR().filter(q=>q!==it));if(dsel===it)dsel=null;/* 보관함 개수는 그대로 (산 개수에서 1개 빼기) */if(I>=P){save.inv[it.k]=I-1;if(save.inv[it.k]<=0)delete save.inv[it.k]}save.coins+=v;store();snd('coins');toast('💰 '+F0.n+' 팔았어요 +🪙'+fmt(v));renderDeco()})});
  msg=wsel?f.n+' 골랐어요 · 다른 빈 벽 칸 톡 = 옮기기 · 📦 = 떼기':wpk?(spare(dpick)>0?f0(dpick).n+' 걸 벽 칸(초록)을 톡! (보관함 '+spare(dpick)+'개)':f0(dpick).n+' 걸 벽 칸(초록)을 톡! 걸면 🪙'+fmt(f0(dpick).p)):fc==='wall'&&!dsel?'벽 장식을 고르고 초록 벽 칸을 톡! · 가게를 넓히면 벽 칸도 늘어요':dsel?f.n+(dsel.s?' ★'+dsel.s:'')+' 골랐어요 · 한 번 더 톡 = 돌리기 · 끌거나 빈 칸 톡 = 옮기기':dpick?(spare(dpick)>0?IS.FK[dpick].n+' 놓을 칸을 톡! (보관함 '+spare(dpick)+'개)':IS.FK[dpick].n+' 놓을 칸을 톡! 놓으면 🪙'+fmt(IS.FK[dpick].p)):((save.dHint|0)<3?'가구를 고르고 바닥을 톡! · 놓인 가구 톡 = 고르기 · 🚪🧾 칸만 비워요':'');
  if(tight&&!dsel&&!wsel&&fc!=='wall'){const fn_=freeN();msg=(fn_?'🧱 빈 칸 '+fn_+'개 남았어요':'🧱 빈 칸이 없어요')+' → 📐 넓히기로 가게를 넓혀요'}}
 else if(tk==='room'&&F2V){const f2=BIZ.f2Of(save);
  BIZ.F2ROOM.forEach(r=>{const own=f2>=r.n;card('🏢',r.n+'×'+r.n,own?(f2===r.n?'지금 크기':'✅'):'🪙'+fmtS(r.p),(prev&&prev.k==='room2'&&prev.id===r.n?'on':f2===r.n?'eq':''),()=>{prev=own?null:{k:'room2',id:r.n};renderDeco()})});
  if(prev&&prev.k==='room2'){const r=BIZ.F2ROOM.find(q=>q.n===prev.id),seq=r.n===f2+1;dbtn('da1',!seq?'먼저 '+(f2+1)+'×'+(f2+1):'🏢 넓히기 🪙'+fmtS(r.p),seq?'go':'dis',()=>{if(seq)buildF2()});msg='🏢 2층 '+r.n+'×'+r.n+' · ✨ 매력 상한 +'+Math.round(BIZ.F2CH[r.n]*100)+'%p · 🐾 손님 +'+Math.round(BIZ.F2MUL[r.n]*100)+'%'}
  else{const nx=BIZ.f2Next(save);dbtn('da1',nx?'다음: '+nx.n+'×'+nx.n:'최대 크기예요!','dis');msg=nx?'카드를 눌러 넓어진 2층을 미리 봐요':'가장 넓은 2층이에요 🎉'}
  dbtn('da2','✔ 완료','',()=>$('dx').click())}
 else if(tk==='room'){
  IS.ROOM.forEach(r=>{const own=save.room>=r.n,lk=!own&&r.g>grade()?'🔒 '+GR[r.g].n:null;card('📐',r.n+'×'+r.n,own?(save.room===r.n?'지금 크기':'✅'):lk?lk.replace('🔒 ',''):'🪙'+fmt(r.p),(prev&&prev.k==='room'&&prev.id===r.n?'on':save.room===r.n?'eq':'')+(lk?' lk':''),()=>{prev=own?null:{k:'room',id:r.n};renderDeco()})});
  const nx=IS.ROOM.find(r=>r.n===save.room+1);
  if(prev&&prev.k==='room'){const r=IS.ROOM.find(q=>q.n===prev.id),lk=r.g>grade(),seq=r.n===save.room+1;
   dbtn('da1',lk?'🔒 '+GR[r.g].n+' 등급':!seq?'먼저 '+(save.room+1)+'×'+(save.room+1):'📐 넓히기 🪙'+fmt(r.p),lk||!seq?'dis':'go',()=>{if(lk||!seq)return;if(save.coins<r.p){toast('코인이 부족해요!');snd('no');return}save.coins-=r.p;save.room=r.n;prev=null;IS.reset();store();snd('fanfare');if(window.JUICE)JUICE.confetti(120);toast('가게가 '+r.n+'×'+r.n+'로 넓어졌어요! 🎉 알바 Lv'+BIZ.STCAP[r.n]+'·매력 '+Math.round(BIZ.CHCAP[r.n]*100)+'%까지');renderDeco();bizBtn()});{const q=BIZ.PLACE[r.n];msg=q.e+' '+q.n+' · 보증금 🪙'+fmt(r.p)+' · 월세 '+fmt(q.rent)+'/시간 (사면 0원) · 손님 +'+Math.round((q.mul-1)*100)+'% · 👥 알바 Lv'+BIZ.STCAP[r.n]+'까지 · ✨ 매력 '+Math.round(BIZ.CHCAP[r.n]*100)+'%까지'}}
  else if(!nx&&BIZ.f2Next(save)&&!BIZ.f2Of(save)){const q=BIZ.f2Next(save);dbtn('da1','🏢 2층 올리기 🪙'+fmtS(q.p),save.coins>=q.p?'go':'',buildF2);msg='1층이 가장 넓어요! 🏢 2층을 올리면 꾸밀 곳이 생기고 매력·손님이 더 올라요'}
  else if(!nx&&BIZ.f2Of(save)){dbtn('da1','⬆️ 2층 꾸미러 가기','go',()=>setF2V(true));msg='가장 넓은 1층이에요 🎉 2층은 2층에서 넓혀요'}
  else{dbtn('da1',nx?'다음: '+nx.n+'×'+nx.n:'최대 크기예요!','dis');msg=nx?'카드를 눌러 넓어진 모습을 미리 봐요':'가장 넓은 가게예요 🎉'}
  dbtn('da2','✔ 완료','',()=>$('dx').click())}
 else{const sl=SLOTS.find(x=>x.k===tk);
  slOrd(sl).forEach(([it,id])=>{if(dMed?!it.m:it.m&&!save.own[sl.k].includes(id))return;const own=save.own[sl.k].includes(id),eqd=eqG(sl.k)===id,lk=own?null:lockOf(it),free=!it.p&&it.st&&!lk;
   card(it.img?'<img src="'+it.img+'" alt="" style="height:38px;display:block;margin:0 auto">':it.e,it.n,eqd?'사용 중':own?'가지고 있어요':lk?lk.replace('🔒 ',''):free?'⭐ 보상':it.m?'🏅'+it.m+(sl.k==='skin'?' · '+skTxt(it):''):'🪙'+fmt(it.p),(prev&&prev.k===sl.k&&prev.id===id?'on':eqd?'eq':'')+(lk?' lk':''),()=>{prev={k:sl.k,id};renderDeco()})});
  const id=prev&&prev.k===sl.k?prev.id:eqG(sl.k),it=sl.L[id],own=save.own[sl.k].includes(id),eqd=eqG(sl.k)===id,lk=own?null:lockOf(it),free=!it.p&&it.st&&!lk;
  if(eqd)dbtn('da1','✅ 사용 중','dis');
  else if(own)dbtn('da1','바꾸기','go',()=>{eqS(sl.k,id);prev=null;store();snd('tap');renderDeco()});
  else if(lk)dbtn('da1',lk,'dis');
  else if(it.m)dbtn('da1','🏅 메달 '+it.m+'개로 사기',window.MEDAL&&MEDAL.get().n>=it.m?'go':'dis',()=>{if(!window.MEDAL||!MEDAL.spend(it.m)){toast('🏅 메달이 부족해요! 챌린지에서 모아요 (가진 메달 '+(window.MEDAL?MEDAL.get().n:0)+')');snd('no');return}save.own[sl.k].push(id);eqS(sl.k,id);prev=null;store();snd('fanfare');if(window.JUICE)JUICE.confetti(120);toast('🏅 '+it.n+' 설치 완료!');renderDeco();syncShop()});
  else if(free)dbtn('da1','받기 🎁','go',()=>{save.own[sl.k].push(id);eqS(sl.k,id);prev=null;store();snd('win');renderDeco()});
  else dbtn('da1','사기 🪙'+fmt(it.p),save.coins>=it.p?'go':'dis',()=>{if(save.coins<it.p){toast('코인이 부족해요!');snd('no');return}save.coins-=it.p;save.own[sl.k].push(id);eqS(sl.k,id);prev=null;store();snd('buy');if(window.JUICE)JUICE.confetti(60);toast(it.n+' 설치 완료!');renderDeco()});
  dbtn('da2',prev?'↩ 되돌리기':'✔ 완료','',()=>{if(prev){prev=null;renderDeco()}else $('dx').click()});
  msg=it.m&&(it.a||it.h)?(prev&&!eqd?'미리 보는 중 · ':'')+'효과: '+(it.a?'손님 +'+it.a+'%':'')+(it.a&&it.h?' · ':'')+(it.h?'도와주기 수익 +'+it.h+'%':''):prev&&!eqd?'미리 보는 중 · '+(it.m?'🏅 메달 전용':'매력 +'+charmOf(it)):sl.n+' 고르기'}
 $('dmsg').textContent=msg;L.scrollLeft=sl0}
/* 가게 바닥을 톡: 가구 고르기 / 놓기 */
function decoTap(x,y){if(dtabK()!=='fur'||y>H-DPH||y<56)return;const n=RMN(),{gx,gy}=IS.toTile(x,y);
 /* 🖼️ 벽 장식: 벽 칸을 톡 = 고르기 / 걸기 / 옮기기 */
 {const ws=IS.wallAt(x,y,n),wpk=dpick&&IS.WK[dpick],wsl=dsel&&IS.WK[dsel.k];
  if(ws){const it=IS.wallItemAt(FUR(),ws);
   if(it){dsel=dsel===it?null:it;dpick=null;snd('tap');renderDeco();return}
   if(wpk){const f=IS.WK[dpick];let pend=0;if(spare(dpick)<=0){pend=1;toast('🛒 '+f.n+' 담았어요 · 완료할 때 계산해요')}const nw={k:dpick,x:ws.x,y:ws.y,d:0};if(pend)nw.pend=1;else{const s0=grabS(dpick);if(s0)nw.s=s0}FUR().push(nw);dsel=nw;store();snd('place');IS.bounce(nw);renderDeco();return}
   if(wsl&&!dpick){dsel.x=ws.x;dsel.y=ws.y;store();snd('place');IS.bounce(dsel);renderDeco();return}}
  if(wpk){toast('🖼️ 초록 테두리 벽 칸을 톡 하세요');snd('no');return}
  if(wsl&&!ws){dsel=null;renderDeco();return}}
 if(!IS.inRoom(gx,gy,n)){dsel=null;renderDeco();return}
 const it=IS.occAt(FUR(),gx,gy);
 /* 고른 가구를 한 번 더 톡 = 돌리기 */
 if(it){if(dsel===it){if(IS.FK[it.k].rot){const nd=IS.nextRot(FUR(),it,n);if(nd==null){toast('🚧 돌릴 자리가 없어요 (2칸 가구)');snd('no')}else{it.d=nd;store();snd('tap')}}else toast('이 가구는 돌릴 수 없어요')}else{dsel=it;dpick=null;snd('tap')}renderDeco();return}
 if(IS.isCounter(gx,gy)){toast('여기는 카운터예요');snd('no');return}
 if(IS.isPath(gx,gy,n)){toast(F2V||IS.isStair(gx,gy,n)?'🪜 계단 자리는 비워 둬요':gy===1?'카운터 앞은 손님이 계산하는 자리예요':'문 앞은 비워 둬야 손님이 들어와요');snd('no');return}
 const bs0=IS.blockedSeats(FUR(),n),seatWarn=()=>{if(IS.blockedSeats(FUR(),n)>bs0)setTimeout(()=>toast('⚠️ 손님이 갈 수 없는 의자가 생겼어요'),350)};
 /* 가구를 고른 채 빈 칸 톡 = 옮기기 */
 if(dsel&&!dpick){if(!IS.okPlace(FUR(),gx,gy,dsel.k,dsel,n)){toast(IS.fitAt(FUR(),dsel.k,gx,gy,dsel.d,dsel,n)?'🚧 여기 놓으면 손님 길이 막혀요':'🚧 2칸이 비어야 놓을 수 있어요');snd('no');return}dsel.x=gx;dsel.y=gy;store();snd('place');IS.bounce(dsel);seatWarn();dghost={x:gx,y:gy,ok:true};setTimeout(()=>dghost=null,250);renderDeco();return}
 if(!dpick){dsel=null;renderDeco();return}
 if(!IS.okPlace(FUR(),gx,gy,dpick,null,n)){toast(IS.fitAt(FUR(),dpick,gx,gy,0,null,n)?'🚧 여기 놓으면 손님 길이 막혀요':'🚧 '+(IS.isWide(dpick)?'2칸이 비어야':'여기엔')+' 놓을 수 없어요');snd('no');return}
 const f=IS.FK[dpick];
 /* 🛒 보관함에 없으면 바로 사지 않고 담아 둬요 → ✔ 완료 때 한꺼번에 계산 */
 let pend=0;if(spare(dpick)<=0){pend=1;toast('🛒 '+f.n+' 담았어요 · 완료할 때 계산해요')}
 const was=f.set&&setDone(f.set),nw={k:dpick,x:gx,y:gy,d:0};if(pend)nw.pend=1;else{const s0=grabS(dpick);if(s0)nw.s=s0}FUR().push(nw);dsel=nw;store();snd('place');IS.bounce(nw);if(f.set&&!was&&setDone(f.set)){const st=IS.SETS.find(x=>x.k===f.set);setTimeout(()=>{toast('🎉 '+st.n+' 완성! 꾸미기 ✨+'+(st.b||IS.SET_BONUS));snd('win')},300)}seatWarn();dghost={x:gx,y:gy,ok:true};setTimeout(()=>dghost=null,250);renderDeco()}
/* 가게 화면 손가락: 움직이면 끌어서 둘러보기, 제자리에서 떼면 톡(꾸미기에서 놓기·고르기), 두 손가락 = 확대·축소(핀치)
   가게에서 다 줄인 상태에서 더 줄이면 🏙️ 거리로, 거리에서 다 키운 상태에서 더 키우면 내 가게로 */
let drg=null,pin=null;const pts=new Map();const cvPt=e=>{const r=cv.getBoundingClientRect();return{x:(e.clientX-r.left)/r.width*W,y:(e.clientY-r.top)/r.height*H}};
const panScr=()=>scr==='home'||scr==='deco'||scr==='visit'||scr==='street';
function zoomBy(f){if(scr==='street'){const t0=SV.T;SV.zoom(f);if(f>1&&SV.T>=72&&t0>=72){pinAcc*=f;if(pinAcc>1.4){pinAcc=1;toHome()}}else pinAcc=1;return}
 const z=IS.zoom(f);if(scr==='home'&&f<1&&z.atMin){pinAcc*=f;if(pinAcc<.72){pinAcc=1;openStreet()}}else pinAcc=1}
let pinAcc=1;
cv.addEventListener('pointerdown',e=>{if(!panScr())return;e.preventDefault();const p=cvPt(e);if(scr==='deco'&&(p.y>H-DPH||p.y<56))return;pts.set(e.pointerId,p);try{cv.setPointerCapture(e.pointerId)}catch(_){}
 if(pts.size===2){const [a,b]=[...pts.values()];pin={d:Math.hypot(a.x-b.x,a.y-b.y)};drg=null;pinAcc=1;return}
 if(pts.size===1){drg={id:e.pointerId,x:p.x,y:p.y,lx:p.x,ly:p.y,mv:false};
  /* 🖐️ 꾸미기: 놓인 가구를 누른 채 끌면 옮겨요 */
  if(scr==='deco'&&dtabK()==='fur'&&!dpick){const t=IS.toTile(p.x,p.y),it=IS.occAt(FUR(),t.gx,t.gy);if(it){drg.fur=it;drg.ox=t.gx-it.x;drg.oy=t.gy-it.y}}}});
cv.addEventListener('pointermove',e=>{if(!pts.has(e.pointerId))return;const p=cvPt(e);pts.set(e.pointerId,p);
 if(pin&&pts.size>=2){const [a,b]=[...pts.values()],d=Math.hypot(a.x-b.x,a.y-b.y);if(d>10&&pin.d>10)zoomBy(d/pin.d);pin.d=d;return}
 if(!drg||e.pointerId!==drg.id)return;if(!drg.mv&&Math.hypot(p.x-drg.x,p.y-drg.y)>9)drg.mv=true;if(drg.mv){if(drg.fur){const t=IS.toTile(p.x,p.y),f=drg.fur,gx=t.gx-drg.ox,gy=t.gy-drg.oy;dsel=f;dghost={x:gx,y:gy,k:f.k,d:f.d,ok:IS.okPlace(FUR(),gx,gy,f.k,f,RMN())}}else if(scr==='street')SV.drag(p.x-drg.lx,p.y-drg.ly);else if(IS.canPan())IS.pan(p.x-drg.lx,p.y-drg.ly)}drg.lx=p.x;drg.ly=p.y});
const endDrg=(e,ok)=>{pts.delete(e.pointerId);if(pts.size<2)pin=null;if(!drg||e.pointerId!==drg.id)return;const d=drg;drg=null;if(d.fur&&d.mv){const g=dghost;dghost=null;if(ok&&g&&(g.x!==d.fur.x||g.y!==d.fur.y)){if(g.ok){const bs0=IS.blockedSeats(FUR(),RMN());d.fur.x=g.x;d.fur.y=g.y;store();snd('place');IS.bounce(d.fur);if(IS.blockedSeats(FUR(),RMN())>bs0)setTimeout(()=>toast('⚠️ 손님이 갈 수 없는 의자가 생겼어요'),350)}else{toast(IS.fitAt(FUR(),d.fur.k,g.x,g.y,d.fur.d,d.fur,RMN())?'🚧 여기 놓으면 손님 길이 막혀요':'🚧 여기엔 놓을 수 없어요');snd('no')}}renderDeco();return}if(ok&&!d.mv&&scr==='home'&&$('hm').style.display==='block'&&d.y<64&&(d.x<300||!save.hudT)){snd('tap');gradeCard();return}if(ok&&!d.mv&&scr==='home'&&$('hm').style.display==='block'&&tipHit(d.x,d.y))return;if(ok&&!d.mv&&scr==='home'&&$('hm').style.display==='block'&&!F2V&&IS.junkHit(d.x,d.y)){snd('tap');return}if(ok&&!d.mv&&scr==='deco')decoTap(d.x,d.y);if(ok&&!d.mv&&scr==='street')stTap(d.x,d.y)};
cv.addEventListener('pointerup',e=>endDrg(e,true));cv.addEventListener('pointercancel',e=>endDrg(e,false));
/* 아이폰 사파리: 화면 전체가 확대되지 않게 */try{document.addEventListener('gesturestart',e=>e.preventDefault(),{passive:false})}catch(_){}
/* 컴퓨터: 마우스 휠로 확대·축소 */
cv.addEventListener('wheel',e=>{if(!panScr())return;e.preventDefault();zoomBy(Math.exp(-e.deltaY*.0015))},{passive:false});
/* 🔍 전체 보기 ↔ 크게 보기 (큰 가게이거나 확대했을 때) · 🏙️ 거리 버튼(홈) */
$('zf').onclick=()=>{IS.fit=!IS.fit;snd('tap');zfK='';zfSync()};
$('flb').onclick=()=>{au();if(scr==='visit'){vF2=!vF2;vPre=null;IS.reset();IS.resetPan();snd('tap')}else setF2V(!F2V);flbK='';flbSync()};
let zfK='';function zfSync(){const b=$('zf'),hm=scr==='home'&&$('hm').style.display==='block',on=panScr()&&scr!=='street'&&!(scr==='deco'&&dtabK()==='skin')&&!(scr==='home'&&!hm)&&(IS.canPan()||IS.fit),k=(on?scr+IS.fit+dtabK():'')+hm;if(k===zfK)return;zfK=k;
 $('nst').style.display=hm?'block':'none';$('nms').style.display=hm?'block':'none';$('nmg').style.display=hm&&save.name&&(save.days|0)>=1?'block':'none';b.style.display=on?'block':'none';if(!on)return;b.textContent=IS.fit?'🔎 크게 보기':'🔍 전체 보기';b.style.top=(scr==='deco'?H-DPH-50:scr==='visit'?560:424)+'px'}
$('dx').onclick=()=>{if(dMed){dMed=false;prev=null;dtab=0;dsub=0;if(dFit0!=null){IS.fit=dFit0;dFit0=null;IS.resetPan();zfK=''}scr='home';toHome();return}const pd=pendList();if(pd.n){const buy=()=>{if(save.coins<pd.sum){toast('코인이 부족해요! 🪙'+fmt(pd.sum-save.coins)+' 모자라요');snd('no');renderDeco();return}save.coins-=pd.sum;pd.L.forEach(f=>{delete f.pend;save.inv[f.k]=(save.inv[f.k]||0)+1});store();snd('buy');if(window.JUICE)JUICE.confetti(50);toast('🛒 '+pd.n+'개 구입! −🪙'+fmt(pd.sum));$('dx').onclick()},drop=()=>{save.fur=save.fur.filter(f=>!f.pend);save.fur2=(save.fur2||[]).filter(f=>!f.pend);dsel=null;store();renderDeco();toast('담아 둔 가구를 뺐어요')};
  JUICE.ask('🛒 '+pd.n+'개를 살까요?','합계 🪙'+fmt(pd.sum)+' · 가진 돈 🪙'+fmt(save.coins),'↩️ 사지 않고 빼기',drop,'🪙 '+fmt(pd.sum)+' 사기',buy);return}
 if(dFit0!=null){IS.fit=dFit0;dFit0=null;IS.resetPan();zfK=''}prev=null;dsel=null;dpick=null;syncShop(true);bizBtn();if(dback==='res'){scr='res';show('res')}else if(dback==='up'){scr='up';renderUp(true);show('up')}else toHome();
 /* 📸 11/14 꾸미기 점수가 꽤 오르면 하루 한 번 '자랑할까요?' (공짜 홍보) */
 {const sc=decoScore(),up=sc-dSc0,nb=$('nbs');if(up>=Math.max(500,dSc0*.03)&&save.brg!==dayKey()&&nb&&!nb.classList.contains('lk0')&&window.JUICE){save.brg=dayKey();store();setTimeout(()=>JUICE.ask('📸 가게가 더 예뻐졌어요!','꾸미기 ✨+'+fmt(up)+' · 친구에게 가게 사진을 보내 자랑해 볼까요?','다음에',()=>{},'📤 자랑하기',()=>nb.click()),900)}}};
/* ===== 🦙 11/14 점장 키우기 1단계: 수습생 4명 중 1명을 골라 함께 장사하며 키워요 =====
   save.mgr={k:고른 수습생,lv:단계,p:{play,srv,pf,cup,dn,dk}=이 단계 들어와서 함께 한 기록,w:선배 선물 받음}
   미션은 '고른 뒤 함께 한 장사'만 세요 (예전 기록은 안 쳐요 → 모두 수습생부터) · 승급하면 기록을 새로 세요
   다 크면 특기 보너스(작게) · 2단계(점장 시험 · 2호점 독립)는 출시 뒤에 */
const MGK=[{k:'al',n:'몽실이',a:'알파카',e:'🦙',sp:'친절',d:'손님에게 상냥해요',m:'shop'},{k:'bv',n:'뚝딱이',a:'비버',e:'🦫',sp:'손재주',d:'붕어빵을 야무지게 구워요',m:'shop'},
 {k:'cp',n:'느긋이',a:'카피바라',e:'🍊',sp:'느긋함',d:'카페에서 차분하게 음료를 만들어요',m:'cafe'},{k:'mk',n:'망보리',a:'미어캣',e:'👀',sp:'눈치',d:'지나가는 손님을 잘 불러와요',m:'all'}];
const MGRB=[0,.01,.03,.05],MGRB2=[0,.01,.02,.03];
function mgr(){let M=save.mgr;if(!M||typeof M!=='object'||!('p' in M)){M=save.mgr={k:null,lv:0,p:{},w:0}}if(!M.p||typeof M.p!=='object')M.p={};return M}
const mgOf=()=>MGK.find(x=>x.k===mgr().k)||null;
function mgKey(){const M=mgr();if(!save.name||!M.k)return null;const k='mg_'+M.k+Math.min(3,M.lv|0);if(!(window.ART_IMG&&ART_IMG[k])&&typeof ART_LOAD==='function')ART_LOAD({[k]:'img/'+k+'.webp'});return k}
const mgB=mode=>{const o=mgOf();if(!o)return 0;const L=Math.min(3,mgr().lv|0);return o.m==='all'?MGRB2[L]:o.m===mode?MGRB[L]:0};
function mgCount(srv,pf,cup){const M=mgr();if(!M.k)return;const p=M.p,dk=dayKey();p.play=(p.play|0)+1;p.srv=(p.srv|0)+(srv|0);p.pf=(p.pf|0)+(pf|0);p.cup=(p.cup|0)+(cup|0);if(p.dk!==dk){p.dk=dk;p.dn=(p.dn|0)+1}}
const MGRN={play:'🤝 함께 장사',srv:'🙋 함께 손님 대접',pf:'✨ 함께 완벽하게 굽기',cup:'☕ 함께 카페 음료',dn:'📅 함께 일한 날'};
const MGR_=[{n:'수습생',e:'🐣'},{n:'정식 직원',e:'🧑‍🍳'},{n:'매니저',e:'📋'},{n:'점장 후보',e:'🎓'}];
const mgMis=lv=>lv===0?[['play',3],['srv',80],['pf',30]]:lv===1?[['play',8],['srv',250],BIZ.cafeOn(save)?['cup',40]:['pf',80],['dn',3]]:lv===2?[['play',15],['srv',500],['dn',7]]:null;
const mgRw=lv=>lv===0?{t:'🪙 '+fmt(Math.max(10000,r1k((save.avg|0)*1.5))),f:()=>{save.coins+=Math.max(10000,r1k((save.avg|0)*1.5))}}:lv===1?{t:'🎫 강화권 3장',f:()=>{save.tix=(save.tix|0)+3}}:{t:'🏅 메달 10개',f:()=>{if(window.MEDAL)MEDAL.add(10)}};
const mgDone=()=>{const m=mgMis(mgr().lv);return m?m.filter(([k,n])=>(mgr().p[k]|0)>=n).length:0};
const mbar=(a,b,col)=>'<div style="height:12px;border-radius:6px;background:rgba(0,0,0,.12);overflow:hidden;margin:3px 0 2px"><div style="height:100%;width:'+Math.max(3,Math.min(100,a/b*100))+'%;background:'+col+';border-radius:6px"></div></div>';
function mgLine(){if(!save.name)return'';const M=mgr(),o=mgOf();if(!o)return'<div class="evl" id="mgl" style="background:#ffe08a">🐣 <b>수습생이 왔어요! 함께 일할 친구를 골라요 ›</b></div>';
 const st=MGR_[M.lv],m=mgMis(M.lv);if(!m)return'<div class="evl" id="mgl" style="background:#efe6ff">'+o.e+' '+st.e+' '+st.n+' '+o.n+' · 🏪 2호점 준비 중 ›</div>';
 const d=mgDone(),all=d>=m.length;return'<div class="evl" id="mgl" style="background:'+(all?'#ffe08a':'#fff0e0')+'">'+o.e+' '+st.e+' '+st.n+' '+o.n+' · '+(all?'<b>🎉 승급할 수 있어요! ›</b>':'승급 미션 '+d+'/'+m.length+' ›')+'</div>'}
/* 🐣 가게 화면 왼쪽 '수습생' 버튼: 안 골랐거나 승급할 수 있으면 노랗게 통통 */
/* 👥 11/14 가게 인기 배수: 등급(노점 0.8 → 전설 2.0) × 꾸미기 점수(최대 +20%) */
const popOf=(g,sc)=>[.8,.9,1,1.2,1.45,1.7,2][Math.max(0,Math.min(6,g|0))]*(1+Math.min(.2,Math.log10(1+Math.max(0,sc|0)/1e5)*.12));
let popC={t:0,v:1};const myPop=()=>{if(Date.now()-popC.t>3000)popC={t:Date.now(),v:popOf(grade(),decoScore())};return popC.v};
/* 🧹 11/14 다시 들어오면 '가게 정리': 손님들이 남긴 팁·빈 접시가 의자·탁자 위에 놓여 있어요 → 톡 눌러 모아요
   20분마다 1개(최대 10개) · 값은 평균 장사 수익 × 시간 × 0.2 (최대 8시간) · 가끔 🎁 강화권 */
const TIPI=['💰','🍽️','💰','🧺','💰'];
function tipMake(){if(save.tipL){save.tipM=(1<<Math.min(10,save.tipL|0))-1;delete save.tipL}if(!save.name||(save.days|0)<1)return;const now=Date.now();if(!save.tipT){save.tipT=now;store();return}if((save.tipN|0)>0)return;
 const hr=Math.min(8,(now-save.tipT)/36e5),n=Math.min(10,Math.floor(hr*3));if(n<1)return;save.tipN=n;save.tipM=0;save.tipH=0;save.tipV=Math.max(n*300,r1k(Math.max(1000,save.avg|0)*hr*.2));save.tipG=Math.random()<.15?1:0;save.tipT=now;store();tipSpots=null}
let tipSpots=null;
/* 11/14 VOC: 줄 글씨 말고 가게 바닥에 흩어져 있게 — 빈 바닥 칸 중 화면에 보이는 곳에 골고루 */
function tipPos(){if(tipSpots&&tipSpots.n===save.tipN)return tipSpots.a;const N=IS.N,fur=save.fur||[],c=[],c2=[];let sd=(save.tipT|0)%9973+7;const rn=()=>(sd=(sd*16807)%2147483647)/2147483647;
 for(let y=0;y<N;y++)for(let x=0;x<N;x++){if(!IS.inRoom(x,y,N)||IS.isCounter(x,y)||IS.isStair(x,y,N)||IS.occAt(fur,x,y))continue;const p=IS.iso(x+.5,y+.5),q={x:x+.5,y:y+.5,r:rn()};if(p.x<30||p.x>W-30||p.y<150||p.y>520)continue;(IS.isPath(x,y,N)?c2:c).push(q)}
 c.sort((p,q)=>p.r-q.r);c2.sort((p,q)=>p.r-q.r);const pool=c.concat(c2),a=[];
 for(const md of[2.2,1.5,0])for(const q of pool){if(a.length>=save.tipN)break;if(a.includes(q))continue;if(a.every(o=>Math.hypot(o.x-q.x,o.y-q.y)>=md))a.push(q)}
 for(let k=0;a.length<save.tipN&&k<60;k++){const it=fur[k%Math.max(1,fur.length)];a.push(it?{x:it.x+.5,y:it.y+.5}:{x:2.5,y:2.5})}
 tipSpots={n:save.tipN,a};return a}
const tipGot=i=>((save.tipM|0)>>i)&1,tipLeft=()=>{let n=0;for(let i=0;i<(save.tipN|0);i++)if(!tipGot(i))n++;return n};
function tipDraw(t){if(scr!=='home'||F2V||!tipLeft()||$('hm').style.display!=='block')return;const a=tipPos();for(let i=0;i<save.tipN;i++){const q=a[i];if(!q||tipGot(i))continue;const p=IS.iso(q.x,q.y),b=Math.abs(Math.sin(t*3+i))*6,gl=.5+.5*Math.sin(t*4+i*1.7);
  cx.save();const g=cx.createRadialGradient(p.x,p.y-4,2,p.x,p.y-4,30);g.addColorStop(0,'rgba(255,236,120,'+(.55+.35*gl)+')');g.addColorStop(1,'rgba(255,220,90,0)');cx.fillStyle=g;cx.beginPath();cx.ellipse(p.x,p.y-4,30,15,0,0,7);cx.fill();
  cx.fillStyle='rgba(80,50,20,.18)';cx.beginPath();cx.ellipse(p.x,p.y-2,13-b,5,0,0,7);cx.fill();cx.restore();
  em(i===save.tipN-1&&save.tipG?'🎁':TIPI[i%TIPI.length],p.x,p.y-20-b,32);if(gl>.75)em('✨',p.x+15,p.y-38-b,14)}}
function tipTake(i,all){const n=save.tipN|0;if(!n)return;const per=Math.floor(save.tipV/n);let got=0;
 for(let k=0;k<n;k++){if(tipGot(k)||(!all&&k!==i))continue;save.tipM=(save.tipM|0)|(1<<k);got+=per;const q=tipPos()[k];if(q&&window.JUICE){const p=IS.iso(q.x,q.y);JUICE.burst(p.x,p.y-20,k===n-1&&save.tipG?'🎁':'🪙',6)}}
 if(!got)return;save.coins+=got;let msg='🪙 +'+fmt(got);if(!tipLeft()){if(save.tipG){save.tix=(save.tix|0)+1;msg+=' · 🎁 강화권 1장'}msg='🧹 가게 정리 끝! '+msg;save.tipN=0;save.tipM=0;save.tipV=0;save.tipG=0;save.tipT=Date.now();tipSpots=null}else msg+=' · 남은 '+tipLeft()+'개';
 store();snd('coins');toast(msg);renderHome()}
function tipHit(x,y){if(F2V||!tipLeft())return false;for(let k=0;k<save.tipN;k++){const r=tipPos()[k];if(!r||tipGot(k))continue;const p=IS.iso(r.x,r.y);if(Math.hypot(x-p.x,y-(p.y-20))<36){tipTake(k,false);return true}}return false}
function mgBtn(){const b=$('nmg');if(!b)return;if(!save.name||(save.days|0)<1){b.style.display='none';return}const M=mgr(),o=mgOf(),m=o&&mgMis(M.lv),all=m&&mgDone()>=m.length;
 b.textContent=!o?'🐣 수습생 고르기':all?o.e+' 🎉 승급!':o.e+' '+o.n+(m?' '+mgDone()+'/'+m.length:'');b.className=!o||all?'go':'';b.onclick=()=>{snd('tap');mgCard()}}
function mgPick(){let h='<div class="sum" style="text-align:center"><small>함께 장사하며 키울 수습생을 1명 골라요<br>잘 키우면 언젠가 🏪 <b>2호점 점장</b>이 돼요 · 다음 수습생은 그때 골라요</small></div><div style="display:grid;grid-template-columns:1fr 1fr;gap:8px">';
 MGK.forEach(o=>{h+='<button class="mgp" data-k="'+o.k+'" style="height:auto;padding:8px 4px;border-radius:16px;background:#fff8ec;display:block;width:100%"><img src="img/mg_'+o.k+'0.webp" alt="" style="height:96px;display:block;margin:0 auto 2px"><b style="font-size:16px">'+o.e+' '+o.n+'</b><br><small style="font-weight:400">'+o.a+' · 특기 '+o.sp+'<br>'+o.d+'</small></button>'});
 h+='</div><div class="sum"><small>💡 특기 보너스는 작아요 (다 커도 3~5%) · 마음에 드는 친구를 골라요</small></div>';
 bzShow('🐣','수습생 고르기',h,'다음에 고를게요',()=>bzHide());
 document.querySelectorAll('.mgp').forEach(b=>b.onclick=()=>{const o=MGK.find(x=>x.k===b.dataset.k),M=mgr();M.k=o.k;M.lv=0;M.p={};let g='';if(!M.w&&(save.served|0)>0){M.w=1;save.tix=(save.tix|0)+3;g=' · 🎁 선배 사장님 선물 🎫 강화권 3장!'}store();snd('win');if(window.JUICE)JUICE.confetti(50);toast(o.e+' '+o.n+'와(과) 함께 일해요!'+g);bzHide();renderHome();setTimeout(mgCard,500)})}
function mgCard(){const M=mgr(),o=mgOf();if(!o){mgPick();return}const L=M.lv,st=MGR_[L],nx=MGR_[L+1],m=mgMis(L);
 let h='<div style="text-align:center"><img src="img/mg_'+o.k+Math.min(3,L)+'.webp" alt="" style="height:130px"></div><div class="sum" style="text-align:center"><b>'+st.e+' '+st.n+' '+o.n+'</b> <small>('+o.a+' · 특기 '+o.sp+')</small><br><small>장사할 때마다 '+o.n+'이(가) 함께 일해요 · 함께 한 장사만 미션에 쳐요</small></div>';
 if(m){h+='<div class="sum"><b>'+nx.e+' '+nx.n+'(으)로 승급하려면</b>';m.forEach(([k,n])=>{const v=Math.min(n,M.p[k]|0);h+='<div style="margin-top:6px"><small>'+(v>=n?'✅ ':'')+MGRN[k]+' <b>'+fmt(v)+'</b> / '+fmt(n)+'</small>'+mbar(v,n,v>=n?'#7cc86a':'#ffb35a')+'</div>'});h+='<small>🎁 승급 선물: '+mgRw(L).t+'</small></div>'}
 else h+='<div class="sum"><small>🎓 점장 시험과 🏪 2호점 독립은 곧 열려요! 조금만 기다려 주세요</small></div>';
 {const b0=Math.round(mgB(o.m==='cafe'?'cafe':'shop')*100),bx=Math.round((o.m==='all'?MGRB2[3]:MGRB[3])*100),md=o.m==='cafe'?'☕ 카페 수익':o.m==='all'?'🏪 가게·☕ 카페 수익':'🏪 가게 수익';h+='<div class="sum"><small>⭐ 특기 보너스: '+md+' <b>+'+b0+'%</b> (다 크면 +'+bx+'%)</small></div>'}
 h+='<div class="sum"><small>'+MGR_.map((x,i)=>(i<=L?'<b>':'<span style="opacity:.45">')+x.e+' '+x.n+(i<=L?'</b>':'</span>')).join(' → ')+'</small></div>';
 const all=m&&mgDone()>=m.length;
 bzShow(o.e,'점장 키우기',h,all?'🎉 승급하기':'🙋 함께 장사하러 가기',all?mgUp:()=>{bzHide();$('h1').click()},'닫기',()=>bzHide())}
function mgUp(){const M=mgr(),L=M.lv,m=mgMis(L);if(!m||mgDone()<m.length)return;const rw=mgRw(L);rw.f();M.lv=L+1;M.p={dk:M.p.dk};store();snd('win');if(window.JUICE)JUICE.confetti(80);toast('🎉 '+mgOf().n+'이(가) '+MGR_[L+1].e+' '+MGR_[L+1].n+'(으)로 승급! 선물 '+rw.t);bzHide();renderHome();setTimeout(mgCard,600)}
/* 🏆 11/14 지난 주 꾸미기 성장 상위 30 보상: 월요일 뒤 처음 들어올 때 한 번 (2968주=11/16부터) */
const DWR=r=>r===1?30:r<=3?20:r<=10?10:r<=30?5:0;
function decoWkReward(){const W=Math.floor((Math.floor((Date.now()+32400000)/86400000)+3)/7)-1;if(W<2967||(save.dwR|0)>=W||!save.name)return;
 whenNet(N=>{if(!N.lastWk)return;N.lastWk().then(({W:w,rows})=>{if(w!==W||(save.dwR|0)>=W)return;save.dwR=W;const i=rows.findIndex(r=>r.u===N.uid),rk=i+1,n=rk?DWR(rk):0;store();if(!n)return;
  if(window.MEDAL)MEDAL.add(n);snd('fanfare');if(window.JUICE)JUICE.confetti(90);
  bzShow('🏆','지난 주 꾸미기 성장 '+rk+'위!','<div class="sum" style="text-align:center"><b style="font-size:20px">'+(rk<=3?['🥇','🥈','🥉'][rk-1]:'🏆')+' '+rk+'위 · 📈 +'+fmt(rows[i].v)+'</b><br><small>지난 주에 가게를 정말 많이 꾸몄어요!</small></div><div class="sum" style="text-align:center"><b>🏅 메달 +'+n+'</b><br><small>메달 상점에서 특별한 외관을 살 수 있어요</small></div>','🎉 좋아요',()=>bzHide())}).catch(()=>{})})}
/* ---------- 도감 · 별 ---------- */
function renderCol(){const g=grade(),nx=GR[g+1],nd=Object.keys(save.dex).length;
 let h='<div class="srow"><span>⭐ 별<b>'+save.stars+'</b></span><span>🏅 등급<b>'+GR[g].e+'</b></span><span>📖 도감<b>'+nd+'/'+R.an.length+'</b></span></div>';
 h+='<div class="cur" style="flex-direction:column;align-items:stretch;gap:4px"><div style="display:flex;justify-content:space-between;font-size:15px"><b style="font-weight:400">'+GR[g].e+' '+GR[g].n+'</b><span>'+(nx?nx.e+' '+nx.n+'까지 '+fmt(nx.at-grPts())+'점':'🎉 최고 등급!')+'</span></div>'+(nx?'<div class="bar" style="margin:2px 0"><i style="width:'+Math.round(100*(grPts()-GR[g].at)/(nx.at-GR[g].at))+'%"></i></div>':'')+'<div class="chips" style="justify-content:flex-start;margin:0"><span class="chip">🏅 '+fmt(grPts())+'점</span><span class="chip">🙋 '+fmt(save.served|0)+'명</span><span class="chip">💼 '+fmt(save.bizCust|0)+'명</span><span class="chip">📅 '+save.days+'일</span><span class="chip">💰 최고 '+fmt(save.bestNet)+'</span><span class="chip">🔥 '+save.bestCombo+'</span></div></div>';
 const rw=starRw();
 h+='<p class="ht" style="margin-top:12px"><b>⭐ 별 보상</b> <small style="opacity:.7">목표·단골로 별을 모아요</small></p><div class="gr3">'+rw.map((x,j)=>{const ok=save.stars>=x.st;return'<div class="uc'+(x.own||ok?'':' lk')+'"><div class="av">'+x.e+'</div><div class="nm">'+x.n+'</div><div class="st">'+x.sl+'</div>'+(x.own?'<button class="ub done">✅ 받음</button>':ok?'<button class="ub srw" data-j="'+j+'">🎁 받기</button>':'<button class="ub no">⭐ '+x.st+'</button>')+'</div>'}).join('')+'</div>';
 h+='<p class="ht" style="margin-top:12px"><b>📖 손님 도감</b> <small style="opacity:.7">10번·30번 오면 단골 ⭐</small></p><div class="dx">'+R.an.map(a=>{const n=save.dex[a];const lv=save.dexS[a]||0;const im=window.ART_IMG&&window.ART_IMG[a];return'<div><b>'+(n!==undefined?(im&&im.src?'<img src="'+im.src+'" alt="" style="height:30px;vertical-align:middle">':a):'❓')+'</b>'+(n!==undefined?(lv?'⭐'.repeat(lv)+' ':'')+n+'번':'?')+'</div>'}).join('')+'</div>';
 $('cb').innerHTML=h;
 $('cb').querySelectorAll('.srw').forEach(bt=>bt.onclick=()=>{const x=rw[+bt.dataset.j];if(!x||x.own||save.stars<x.st)return;if(!save.own[x.k].includes(x.i))save.own[x.k].push(x.i);save.eq[x.k]=x.i;store();snd('win');syncShop();toast(x.e+' '+x.n+' 받았어요! 가게에 바로 달았어요 ✨');const sc=$('cb').scrollTop;renderCol();$('cb').scrollTop=sc;starDot()})}
$('cx').onclick=()=>show('hm');
/* ---------- 이름 · 설정 ---------- */
let nmFirst=false;
function cleanName(t){return String(t).replace(/[\u0000-\u001f\u007f<>&"\\]/g,'').replace(/\s+/g,' ').trim().slice(0,8)}
/* 🎁 챌린지 따라 하기를 끝낸 사람: 가게 오픈 자금 한 번 */
function giftCheck(then){let g=0;try{g=localStorage.getItem('bpGift1')==='1'}catch(e){}if(!g||save.g1||!save.name){then&&then();return false}
 save.g1=1;save.coins+=3000;store();if(window.JUICE)JUICE.confetti(130);snd('fanfare');
 bzShow('🎁','첫 선물 도착!','<p style="text-align:center;margin:0">붕어빵 첫 성공 축하해요!<br>가게 오픈 자금 <b style="font-size:24px;color:#e8642a">🪙3,000</b>을 받았어요</p>','🪙 고마워요!',then);return true}
function openName(first){nmFirst=first;$('nmh').textContent=first?'내 붕어빵 가게 이름을 지어요!':'가게 이름 바꾸기';$('nmx').style.display=first?'none':'block';$('nmi').value=save.name||'행복 붕어빵';$('nme').textContent='';show('nm');setTimeout(()=>{try{$('nmi').focus();$('nmi').select()}catch(e){}},50)}
$('nm1').onclick=()=>{const n=cleanName($('nmi').value);if(!n){$('nme').textContent='한 글자 이상 써 주세요';return}if(BADW.bad(n)){$('nme').textContent='다른 이름을 써 주세요 🙏';return}save.name=n;if(nmFirst){save.biz=1;if(!save.d0&&!(save.days|0))save.d0=dayKey()}store();toHome();if(nmFirst)setTimeout(()=>giftCheck(()=>{attShown=true;if(!attCard()){if(!save.tour)startTour();return}const o=$('bz1').onclick;$('bz1').onclick=()=>{o();if(!save.tour)setTimeout(startTour,400)}}),300);if(!nmFirst)toast('간판이 바뀌었어요')};
$('nmi').addEventListener('keydown',e=>{if(e.key==='Enter')$('nm1').click()});$('nmx').onclick=()=>show('set');
const sndLbl=()=>{const c=AU?AU.get():{mu:0,fx:0};$('smu').textContent=c.mu?'🎵 음악 켜짐':'🎵 음악 꺼짐';$('sfx').textContent=c.fx?'🔊 효과음 켜짐':'🔇 효과음 꺼짐';$('smu').classList.toggle('on',!!c.mu);$('sfx').classList.toggle('on',!!c.fx)};
$('smu').onclick=()=>{if(AU){AU.set('mu',!AU.get().mu);sndLbl()}};$('sfx').onclick=()=>{if(AU){AU.set('fx',!AU.get().fx);sndLbl();snd('ui')}};
$('sr').onclick=()=>openName(false);$('snw').onclick=()=>{show('hm');NEWS.open()};INSTALL.bind($('sin'));INSTALL.bind($('happ'));$('sxf').onclick=()=>{show('hm');INSTALL.xfer()};$('sc').onclick=()=>show('hm');
$('rst').onclick=()=>ask($('rst'),'⚠️ 가게가 모두 사라져요! 한 번 더',()=>{const sn=save.snd;save=DEF();save.snd=sn;store();openName(true);toast('모두 지웠어요')});
$('h1').onclick=()=>{au();if(BIZ.cafeOn(save))bzShow('🙋','어디를 도와줄까요?','<p style="text-align:center;margin:0">🐟 붕어빵: 틀에 넣고 뒤집어 굽기<br>☕ 음료: 샷 내리고 우유 데우며 여러 잔 동시에</p>','🐟 붕어빵 굽기',()=>startDay(),'☕ 음료 만들기',()=>startCafe());else startDay()};$('h2').onclick=()=>{au();openDeco('home')};$('h3').onclick=()=>{au();openUp('home',0)};$('h4').onclick=()=>{au();renderCol();show('col')};
const ckLabel=()=>{$('sck').textContent='🧑‍🍳 사장님: '+COOKS[save.cook|0].n+' (눌러서 바꾸기)'};
$('h5').onclick=()=>{au();sndLbl();ckLabel();show('set')};
$('sck').onclick=()=>{save.cook=((save.cook|0)+1)%COOKS.length;applyCook();store();ckLabel();syncShop();snd('tap')};
/* ---------- 일시정지 ---------- */
function pauseGame(){if(scr==='cafe'){if(paused||CF.done)return;CF.up();paused=true;$('pause').style.display='block';return}if(scr!=='game'||!s||paused||s.ph!=='play')return;paused=true;$('pause').style.display='block'}
function resumeGame(){if(!paused)return;paused=false;$('pause').style.display='none';last=0}
$('home2').onclick=pauseGame;$('p1').onclick=resumeGame;
/* ---------- 조작 ---------- */
function tap(x,y){const h=A.tapPlay(x,y);if(h&&h.k==='c')count();drain()}
function count(){for(const c of s.cust){if(c&&c.happy&&!c.cnt){c.cnt=1;if(c.an==='🧐')continue;if(save.dex[c.an]===undefined){save.dex[c.an]=0;(s.dxNew=s.dxNew||[]).push(c.an);ui.ft.push({t:'도감 등록! '+c.an,x:225,y:150,c:'#fff',l:1.6})}save.dex[c.an]++}}}
function drain(){A.drainFx()}
/* 📱 11/11 아이폰 VOC '아래쪽 틀이 잘 안 눌려요': 아이폰은 터치 신호(touchstart)도 같이 받아서, 한쪽이 씹혀도 들어가게 (같은 자리 120ms 안 두 번은 한 번으로) */
const IOS=/iP(hone|ad|od)/.test(navigator.userAgent)||(/Mac/.test(navigator.platform||'')&&navigator.maxTouchPoints>1);/* 11/12 VOC(아이폰) '반죽만 놨는데 아직!' = 터치 하나에 pointerdown·touchstart 둘 다 들어옴 (폰이 바쁘면 120ms 넘게 벌어짐) → 시간 대신 '다른 종류 신호끼리 짝'으로 한 번만 */
const PQ=[];const dupTap=e=>{const n=performance.now(),tp=e.__t?'t':'p';for(let i=PQ.length-1;i>=0;i--)if(n-PQ[i].n>700)PQ.splice(i,1);
 const j=PQ.findIndex(q=>q.tp!==tp&&Math.hypot(e.clientX-q.x,e.clientY-q.y)<40);if(j>=0){PQ.splice(j,1);return true}PQ.push({tp,n,x:e.clientX,y:e.clientY});return false};
const touchAlso=(el,fn)=>{if(!IOS)return;el.addEventListener('touchstart',e=>{for(const t of e.changedTouches)fn({clientX:t.clientX,clientY:t.clientY,pointerType:'touch',__t:1,preventDefault(){}})},{passive:true})};
const gameDown=e=>{e.preventDefault();au();if(scr!=='game'||paused||!s||s.ph!=='play')return;if(dupTap(e))return;const r=cv.getBoundingClientRect();tap((e.clientX-r.left)/r.width*W,(e.clientY-r.top)/r.height*H)};
cv.addEventListener('pointerdown',gameDown);touchAlso(cv,gameDown);
/* ---------- 하루 그리기 (공용 화면 + 내 가게 꾸밈 색) ---------- */
const FLC=['#c9935f','#d2a46a','#c89a64','#7fbf6a','#a8a498','#b8384a','#8ac8e8','#f4c6d4','#c98d55','#a9d6f5','#d6a66e','#c8a6e8','#e8c069'];
/* 장사 화면: 챌린지처럼 가게 앞 거리 + 걸어오는 손님, 차양·마스코트는 내 가게 꾸밈 */
const AWX=[['#e8584a','#fff6ec'],['#4a8ae8','#fff6ec'],['#4ab86a','#fff6ec'],['#ff8ab0','#fff0f6'],['#ffcf3a','#fff6ec'],['rb'],['#2a3a7a','#ffd23a'],['#ffb0c8','#fff0f6'],['#d4a020','#fff3c0']];
function shopAwning(){const ac=AWX[save.eq.awn|0]||AWX[0],n=15,w=W/n;for(let i=0;i<n;i++){const c=ac[0]==='rb'?RB[i%RB.length]:i%2?ac[1]:ac[0];cx.fillStyle=c;cx.fillRect(i*w,60,w,16);cx.beginPath();cx.arc(i*w+w/2,76,w/2,0,Math.PI);cx.fill()}cx.fillStyle='rgba(0,0,0,.12)';cx.fillRect(0,60,W,3)}
function drawGame(){A.use(s,run,ui);A.drawPlay({street:true,title:'🙋 도와주기 시작!',sub:nm()+' · '+s.wea.n+' · 가게 Lv'+run.day,
 bg:t=>{cx.fillStyle='#ffe0b5';cx.fillRect(0,0,W,H);cx.fillStyle=FLC[save.eq.floor]||FLC[0];cx.fillRect(0,322,W,78);cx.fillStyle='rgba(255,255,255,.18)';cx.fillRect(0,322,W,6);cx.fillStyle='rgba(0,0,0,.14)';cx.fillRect(0,328,W,4);cx.fillStyle='#6b5344';cx.fillRect(0,394,W,310)},
 front:t=>{shopAwning();const g=cx.createLinearGradient(0,318,0,330);g.addColorStop(0,'#b97d4a');g.addColorStop(1,'#a06a3a');cx.fillStyle=g;cx.fillRect(0,318,W,8)},
 head:t=>{rr(0,0,W,58,0,typeof THEME!=='undefined'?THEME.hud():'#8a5a3a');tx(s.wea.e+' 🏪Lv'+run.day,12,18,20,'#fff','left');tx('🪙 '+fmt(save.coins+s.net),388,18,ui.hud>0?27:22,ui.hud>0?'#fff6c0':'#ffe9a0','right');
  const r=live(),gd=gdone();goals.forEach((g,i)=>{const ok=gd.done[i]||g.p.ok(r,g.n),x=8+i*146;rr(x,34,138,20,10,ok?'#4fa860':'rgba(0,0,0,.3)');tx((ok?'✅':'')+g.p.sh(r,g.n),x+69,44,13,'#fff','center','rgba(0,0,0,.4)')})},
 mid:t=>{{const k=mgKey(),im=k&&window.ART_IMG&&ART_IMG[k];if(im&&im.complete&&im.naturalWidth){const h=66*im.naturalHeight/230,w=h*im.naturalWidth/im.naturalHeight,b=Math.abs(Math.sin(t*2))*3;cx.drawImage(im,404-w/2,326-h-b,w,h);const L=mgr().lv|0,ph=(t%8);if(ph<1.3){const msg=L===0?(ph<.65?'앗!':'에헤헤'):L===1?'어서 오세요!':L===2?'잘하고 있어요!':'오늘도 화이팅!';rr(404-46,326-h-30,92,24,12,'rgba(255,255,255,.92)');tx(msg,404,326-h-18,13,'#7a4a2a','center')}}}if(save.eq.mas>0){const M=MAS[save.eq.mas];if(M.e==='🌟')fish(30,300+Math.sin(t*3)*3,.3,'#ffcf3a','#a87010');else em(M.e,26,298+Math.sin(t*3)*3,30)}},
 fx:()=>{if(s.wea.e==='☀️')seasonFx(s.t,W,700,.6)}})}
/* ---------- 가게 순위 · 친구 가게 구경 (js/net.js) ---------- */
function whenNet(fn,fail,n=0){const N=window.NET;if(N&&N.get)return fn(N);if(N&&N.pending&&n<40)return setTimeout(()=>whenNet(fn,fail,n+1),300);if(fail)fail()}
const chNick=()=>{try{return String((JSON.parse(localStorage.getItem('bungeoppang2Pub1'))||{}).nick||'').slice(0,12)}catch(e){return''}};
function shopPayload(){return{n:nm().slice(0,12),nk:chNick(),g:grade(),sc:Math.min(3000000,decoScore()),room:save.room,eq:Object.assign({},save.eq,{cook:save.cook|0,r5:1},BIZ.f2Of(save)?Object.assign({f2:BIZ.f2Of(save)},save.eq2?{f2w:((save.eq2.wall!=null?save.eq2.wall:save.eq.wall)|0)*100+((save.eq2.floor!=null?save.eq2.floor:save.eq.floor)|0)}:{}):{}),fur:(()=>{const enc=(f,p)=>p+f.k+','+f.x+','+f.y+','+(f.d|0)+(f.s?','+Math.min(3,f.s|0):'');return(save.fur||[]).filter(f=>!f.pend).map(f=>enc(f,'')).concat((save.fur2||[]).filter(f=>!f.pend).map(f=>enc(f,'2|'))).slice(0,120)})()}} /* 🏢 2층 가구는 '2|' 붙여서 (옛 앱은 모르는 가구라 그냥 건너뛰어요) */
/* ⏳ 무료 한도에 걸렸을 때 안내 (1시간 안에 resource-exhausted가 났으면) */
const busyMsg=()=>window.NET&&NET.full&&Date.now()-NET.full<3600e3?'⏳ 지금 사람이 많아서 잠깐 못 불러와요 · 가게는 그대로 할 수 있어요':'';
/* 11/8 5.6.6: 꾸미기 완료(force)는 늘 올리고 결과를 보여 줘요 · 실패하면 이유(에러 이름)를 화면에 */
function syncShop(force){if(!save.name)return;whenNet(N=>{const d=shopPayload(),h=JSON.stringify(d);if(!force&&h===save.upH)return;N.save(d).then(sc=>{/* 점수가 천천히 올라가는 중이면 다음에 또 보내요 */if(!(typeof sc==='number'&&sc<d.sc))save.upH=h;save.upE=0;store();if(force)toast('🏪 가게 순위에 올렸어요')}).catch(e=>{const c=String(e&&(e.code||e.message)||e).slice(0,60);console.warn('shop sync',c);save.upH='';save.upE={t:Date.now(),c};store();if(force||!save.upEs){save.upEs=1;toast('⚠️ 가게를 순위에 못 올렸어요 · '+c+' · '+String(N.uid||'?').slice(0,6))}})},()=>{if(force)toast('⚠️ 가게 순위 서버에 연결이 안 돼요')})}
const lvOf=sc=>Math.min(40,1+Math.floor(Math.sqrt((sc|0)/20)));
let rkBy='sc',rkFrom='home';
function openRank(by){rkBy=by||rkBy;scr='rk';show('rk');renderRank()}
function renderRank(){$('rk0').className=rkBy==='sc'?'on':'';$('rk1').className=rkBy==='lk'?'on':'';$('rk2').className=rkBy==='wk'?'on':'';$('rkh').textContent=rkBy==='wk'?'이번 주에 꾸미기 점수가 오른 만큼 · 🏆 다음 월요일 🏅 메달 (1위 30 · 2~3위 20 · ~10위 10 · ~30위 5)':rkBy==='sc'?'꾸미기 점수가 높은 가게 · 이름을 누르면 구경해요':'좋아요를 많이 받은 가게 · 이름을 누르면 구경해요';
 const L=$('rkl');L.innerHTML='<p class="ht">불러오는 중…</p>';
 whenNet(N=>{N.top(rkBy).then(rows=>{if(scr!=='rk')return;if(!rows.length){L.innerHTML='<p class="ht">'+(rkBy==='wk'?'이번 주엔 아직 점수가 오른 가게가 없어요. 가구를 놓으면 1등이 될 수 있어요! 📈':'아직 올라온 가게가 없어요. 꾸미기를 마치면 내 가게가 올라가요! 🏪')+'</p>';return}L.innerHTML='';
  rows.forEach((r,i)=>{const d=document.createElement('div');d.className='rr'+(r.u===N.uid?' me':'');d.innerHTML='<b>'+(i<3?['🥇','🥈','🥉'][i]:(i+1))+'</b><span class="nm"><span></span><small></small></span><span class="vl">'+(rkBy==='wk'?'📈 +'+fmt(r.gw):rkBy==='sc'?'✨ '+fmt(r.sc):'❤️ '+fmt(r.lk))+'</span>';
   d.querySelector('.nm span').textContent='🏪 '+r.n;d.querySelector('.nm small').textContent=(GR[r.g]?GR[r.g].e+' '+GR[r.g].n:'')+' · Lv'+lvOf(r.sc)+(r.nk?' · 🙂 '+r.nk:'');d.onclick=()=>visit(r.u,'rk');L.appendChild(d)});
  const f=document.createElement('p');f.className='ht';f.style.textAlign='center';f.textContent=rows.length>=30?'위쪽 30곳만 보여요':rows.length+'곳';L.appendChild(f)}).catch(()=>{L.innerHTML='<p class="ht">'+(busyMsg()||'불러오지 못했어요. 잠시 뒤에 다시 눌러 주세요.')+'</p>'})},()=>{L.innerHTML='<p class="ht">지금은 연결할 수 없어요.</p>'})}
$('nb').onclick=()=>{au();syncShop();openRank('wk')};$('rk0').onclick=()=>openRank('sc');$('rk1').onclick=()=>openRank('lk');$('rk2').onclick=()=>openRank('wk');$('rkr').onclick=()=>{whenNet(N=>N.bust());renderRank()};$('rkx').onclick=()=>toHome();
/* 구경 */
let vd=null,vuid=null,vfur=[],vfur2=[],vF2=false,vFrom='home';
function lookFrom(d){const eq=d.eq||{},g=k=>{const sl=SLOTS.find(x=>x.k===k),v=eq[k]|0;return sl&&sl.L[v]?v:0};const sk=g('sky'),wi=g('wall');
 return{xmas:window.XMAS&&XMAS(),g:d.g|0,n:Math.max(4,Math.min(11,d.room|0)),wall:{c:(WALL[wi]||WALL[0]).c,id:wi},floor:g('floor'),sky:skyCols(sk),bg:skyBg(sk),night:skyNt(sk),awn:g('awn'),sign:g('sign'),name:String(d.n||'').slice(0,12),top:g('top'),lit:g('lit'),sL:SIDE[g('sL')]||SIDE[0],sR:SIDE[g('sR')]||SIDE[0],mas:MAS[g('mas')]||MAS[0]}}
/* 구경·처음 화면은 손님이 이미 와 있는 모습으로 (20초쯤 미리 돌려요) */
let vPre=null,hPre=0;
function visit(uid,from){vFrom=from||'home';vd=null;vuid=uid;vfur=[];IS.reset();IS.resetPan();scr='visit';show('vs');$('vnm').textContent='불러오는 중…';$('vinfo').textContent='';$('vlk').className='';$('vlk').textContent='❤️ 좋아요';$('vnt').className='';$('vnt').textContent='💌';
 whenNet(N=>{N.get(uid).then(d=>{if(scr!=='visit'||vuid!==uid)return;if(!d){toast('아직 가게를 꾸미지 않은 사람이에요');leaveVisit();return}
  vd=d;if(uid!==N.uid)twVisit(uid);{const c=COOKS[(d.eq&&d.eq.cook)|0]||COOKS[0];if(c.f){const im=new Image();im.src=c.f;window.ART_IMG.cook=im}else delete window.ART_IMG.cook}{const pf=x=>{const a=String(x).replace(/^2\|/,'').split(',');const v={k:a[0],x:+a[1],y:+a[2],d:(+a[3])|0},st=Math.max(0,Math.min(3,(+a[4])|0));if(st)v.s=st;return v},L=d.fur||[];vfur=L.filter(x=>!/^2\|/.test(String(x))).map(pf).filter(it=>IS.CK(it.k));vfur2=L.filter(x=>/^2\|/.test(String(x))).map(pf).filter(it=>IS.CK(it.k))}vF2=false;IS.fixWide(vfur,Math.max(4,Math.min(11,d.room|0)));IS.fixDoor(vfur,Math.max(4,Math.min(11,d.room|0)));{const f2=Math.min(11,(d.eq&&d.eq.f2)|0),rn=Math.max(4,Math.min(11,d.room|0)),cut=(L,n)=>L.filter(it=>!IS.cells(it).some(c=>c.x===n-2&&c.y===0));if(f2>=5){vfur=cut(vfur,rn);vfur2=cut(vfur2,f2)}}
  if(vFrom==='url'&&uid!==N.uid)toast('💌 '+((d.nk&&!BADW.bad(d.nk))?d.nk+'님이':'친구가')+' 가게 구경에 초대했어요!');
  $('vnm').innerHTML='';const a=document.createElement('span');a.textContent='🏪 '+(d.n||'');const b=document.createElement('small');b.textContent=(d.nk?'🙂 '+d.nk+' 님의 가게':'')+'';$('vnm').append(a,b);renderVisit();
  $('vmk').style.display=save.name?'none':'block';
  $('vrp').style.display=uid===N.uid?'none':'block';if(uid===N.uid){$('vlk').className='done';$('vlk').textContent='🏠 내 가게';$('vnt').className='done'}else{N.liked(uid).then(l=>{if(l&&vuid===uid){$('vlk').className='done';$('vlk').textContent='❤️ 오늘 눌렀어요'}}).catch(()=>{});if(N.noteMine)N.noteMine(uid).then(k=>{if(k>=0&&vuid===uid){$('vnt').className='done';$('vnt').textContent=STK[k][0]}}).catch(()=>{})}}).catch(()=>{toast(busyMsg()||'불러오지 못했어요');leaveVisit()})},()=>{toast('지금은 연결할 수 없어요');leaveVisit()})}
function renderVisit(){if(!vd)return;$('vinfo').innerHTML=(GR[vd.g]?GR[vd.g].e+' '+GR[vd.g].n:'')+' · 🏪Lv'+lvOf(vd.sc)+'<br>✨ 꾸미기 '+fmt(vd.sc|0)+' · ❤️ '+fmt(vd.lk|0)}
function leaveVisit(){vd=null;hPre=0;IS.reset();IS.resetPan();applyCook();$('vmk').style.display='none';if(vFrom==='street'){openStreet()}else if(vFrom==='rk'){openRank()}else if(vFrom==='gb'){openNotes()}else if(!save.name){scr='home';renderHome();openName(true)}else toHome()}
$('vx').onclick=leaveVisit;
$('vmk1').onclick=()=>{vFrom='home';leaveVisit()};
/* 📤 내 가게 자랑: 가게 모습을 크게 다시 그려 카드로 */
function shopSnap(){const off=document.createElement('canvas');off.width=900;off.height=960;const c2=off.getContext('2d');c2.scale(2,2);
 const A2=ART(c2,{shape:()=>save.eq.shape|0}),I2=ISO(c2,A2);I2.draw(performance.now()/1000,Object.assign(look(null),{f2v:false,n:save.room}),save.fur||[],{top:10,bottom:470,noCust:true,fit:true});return off}
$('nbs').onclick=()=>{au();syncShop();whenNet(N=>go(N.uid),()=>go(null));
 function go(uid){const url=location.origin+'/shop.html'+(uid?'?visit='+uid:'');const txt='🏪 내 붕어빵 가게 「'+nm()+'」 구경 와! ❤️ 눌러주고, 너도 가게 만들어 봐 🐟';
  SHARE.send(SHARE.shop({name:nm(),lv:shopLv(),sc:decoScore(),lk:0,snap:shopSnap(),url}),txt,url,'붕어빵 가게')}};
/* ❤️ 좋아요: 보냈을 때 · 이미 눌렀을 때 · 못 보냈을 때를 다르게 보여 줘요 (못 보냈으면 이유 코드도) */
$('vlk').onclick=()=>{if(!vd||$('vlk').className==='done')return;whenNet(N=>{if(vuid===N.uid)return;const uid=vuid;$('vlk').className='done';$('vlk').textContent='❤️ 보내는 중…';
 N.like(uid).then(()=>{if(vuid!==uid)return;vd.lk=(vd.lk|0)+1;renderVisit();$('vlk').textContent='💖 보냈어요';snd('win');if(window.JUICE)JUICE.burst(330,700,'💖',8);{const tw=twNow();if(tw.lg<10){tw.lg++;const c=Math.max(500,Math.min(30000,r1k(attHr()*.05)));save.coins+=c;store();toast('💖 좋아요 +1! 고마움 +🪙'+fmt(c)+' ('+tw.lg+'/10) · 내일 또 누를 수 있어요')}else toast('💖 좋아요 +1! 내일 또 누를 수 있어요')}})
 .catch(e=>{const code=(e&&e.code||'').replace('firestore/','');N.liked(uid).then(l=>{if(vuid!==uid)return;if(l){$('vlk').textContent='❤️ 오늘 눌렀어요';toast('❤️ 이 가게엔 오늘 이미 눌렀어요 · 내일 또 눌러요')}else{$('vlk').className='';$('vlk').textContent='❤️ 좋아요';toast((busyMsg()||'좋아요를 못 보냈어요 · 잠시 뒤에 다시 눌러 주세요')+(code?' ('+code+')':''))}}).catch(()=>{$('vlk').className='';$('vlk').textContent='❤️ 좋아요';toast('좋아요를 못 보냈어요'+(code?' ('+code+')':''))})})})};
/* ---------- 💌 구경 반응: 스티커 방명록 (정해진 스티커만, 가게마다 하루 한 번) ---------- */
const STK=[['😍','예뻐요'],['🐟','맛있어 보여요'],['🛋️','인테리어 최고'],['🎉','축하해요'],['👍','또 올게요'],['🌸','따뜻해요'],['🔥','대박'],['🙌','배워 갈게요']];
$('vnt').onclick=()=>{if(!vd||$('vnt').className==='done'){if(vd&&vuid!==(window.NET&&NET.uid))toast('💌 이 가게엔 오늘 남겼어요 · 내일 또 남길 수 있어요');return}
 if(!save.name){toast('🏪 내 가게를 만들면 스티커를 남길 수 있어요');snd('no');return}
 $('stph').textContent='💌 스티커 남기기';$('stps').textContent='하루 한 번 · 가게 주인 방명록에 내 가게 이름과 함께 남아요';
 const g=$('stg');g.innerHTML='';STK.forEach((x,i)=>{const b=document.createElement('button');b.innerHTML='<b>'+x[0]+'</b>';b.append(x[1]);b.onclick=()=>sendNote(i);g.appendChild(b)});$('stp').style.display='block';snd('tap')};
/* 🚩 가게 신고: 이유 3가지 → 운영자가 확인하고 숨겨요 (자동으로 숨기지 않아요) */
const RPR=[['🤬','이상한 이름'],['📈','이상한 점수'],['❓','다른 문제']];
$('vrp').onclick=()=>{if(!vd)return;whenNet(N=>{if(vuid===N.uid){toast('내 가게예요');return}
 $('stph').textContent='🚩 신고하기';$('stps').textContent='운영자가 확인해서 문제가 있으면 숨겨요 · 장난 신고는 하지 말아 주세요';
 const g=$('stg');g.innerHTML='';RPR.forEach((x,i)=>{const b=document.createElement('button');b.innerHTML='<b>'+x[0]+'</b>';b.append(x[1]);b.onclick=()=>{$('stp').style.display='none';const u=vuid;N.report&&N.report(u,i).then(()=>toast('🚩 신고했어요. 고마워요!')).catch(()=>toast('이미 신고했거나 잠시 뒤에 다시 해 주세요'))};g.appendChild(b)});$('stp').style.display='block';snd('tap')},()=>toast('지금은 연결할 수 없어요'))};
$('stpx').onclick=()=>{$('stp').style.display='none'};
function sendNote(i){$('stp').style.display='none';const uid=vuid;whenNet(N=>{if(!N.note||uid===N.uid)return;$('vnt').className='done';
 N.note(uid,i).then(()=>{if(vuid===uid)$('vnt').textContent=STK[i][0];snd('win');if(window.JUICE)JUICE.burst(225,620,STK[i][0],8);toast('💌 '+STK[i][1]+'! 스티커를 남겼어요')})
 .catch(e=>{$('vnt').className='';if(e&&e.message==='noshop'){syncShop();toast('🏪 내 가게를 올리는 중이에요. 잠시 뒤에 다시 해 주세요')}else toast('오늘은 이미 남겼거나 잠시 뒤에 다시 해 주세요')})},()=>toast('지금은 연결할 수 없어요'))}
/* 📮 내 가게 방명록: 새로 온 스티커 수(10분마다 한 번 확인, 새 것만 읽어요) */
const NS_KEY='bpNoteSeen';const nSeen=()=>{try{return+localStorage.getItem(NS_KEY)||0}catch(e){return 0}};let nChkT=0,nNew=0;
function noteBadge(){const b=$('nnt');if(!b)return;b.style.display=save.name?'block':'none';b.innerHTML='📮 방명록'+(nNew?'<i>'+(nNew>=9?'9+':nNew)+'</i>':'')}
let nGen=0;function noteCheck(force){if(!save.name||(!force&&Date.now()-nChkT<600000))return;nChkT=Date.now();const gen=nGen;whenNet(N=>{if(!N.newNotes){nChkT=0;return}N.newNotes(nSeen()).then(n=>{if(gen!==nGen)return; /* 그 사이 방명록을 열어 읽었으면 옛 결과는 버려요 */nNew=n;noteBadge()}).catch(()=>{nChkT=0})},()=>{nChkT=0})}
addEventListener('net-ready',()=>noteCheck(true));
const ago=ms=>{const m=Math.max(0,Math.floor((Date.now()-ms)/60000));return m<1?'방금':m<60?m+'분 전':m<1440?Math.floor(m/60)+'시간 전':Math.floor(m/1440)+'일 전'};
function openNotes(){au();const L=$('gbl');L.innerHTML='<div style="text-align:center;padding:30px;opacity:.6">불러오는 중…</div>';show('gbv');scr='gb';
 whenNet(N=>{if(!N.notes)return;N.notes().then(rows=>{const seen=nSeen();L.innerHTML='';if(!rows.length){L.innerHTML='<div style="text-align:center;padding:30px;line-height:1.6;opacity:.7">아직 방명록이 없어요<br>📤 내 가게 자랑으로 친구를 불러 보세요!</div>'}
  rows.forEach(r=>{const x=STK[r.s]||STK[0],d=document.createElement('div');d.className='gb'+(Math.floor(r.t)>seen?' new':'');d.innerHTML='<b>'+x[0]+'</b><div></div>';const t=d.querySelector('div');const a=document.createElement('span');a.textContent=(BADW.bad(r.n)?'붕어빵 가게':r.n)+' 사장님 · '+x[1]+'!';const sm=document.createElement('small');sm.textContent=(r.nk&&!BADW.bad(r.nk)?'🙂 '+r.nk+' · ':'')+ago(r.t)+' · 놀러 가기 ›';t.append(a,sm);d.onclick=()=>{$('gbv').style.display='none';visit(r.u,'gb')};L.appendChild(d)});
  /* +1ms: 서버 시간은 1ms보다 잘게 저장돼서, 읽은 것과 같은 ms면 '새 것'으로 또 세어지던 문제 */const mx=rows.reduce((m,r)=>Math.max(m,Math.floor(r.t)),seen);try{localStorage.setItem(NS_KEY,String(mx))}catch(e){}nGen++;nNew=0;noteBadge()}).catch(()=>{L.innerHTML='<div style="text-align:center;padding:30px;opacity:.7">'+(busyMsg()||'불러오지 못했어요. 잠시 뒤에 다시 열어 주세요')+'</div>'})},()=>{L.innerHTML='<div style="text-align:center;padding:30px;opacity:.7">지금은 연결할 수 없어요</div>'})}
$('nnt').onclick=openNotes;$('gbx').onclick=()=>{$('gbv').style.display='none';toHome()};
/* ---------- 가게 첫 방문 안내 (건너뛰기 가능) ---------- */
const TOUR=[['biz','💼 <b>영업 중</b> — 알바들이 알아서 장사해요. <b>자리를 비워도 8시간까지</b> 돈이 쌓여요!'],['h1','🙋 <b>도와주기</b> — 직접 90초 구워서 더 벌어요 (하루 첫 20판은 보너스)'],['h2','🎨 <b>꾸미기</b> — 가구를 놓아 가게를 예쁘게! 예쁠수록 손님이 많이 와요']];
let ti=0;
function tourShow(){document.querySelectorAll('.hl').forEach(e=>e.classList.remove('hl'));
 if(ti>=TOUR.length){$('ttx').innerHTML='준비 끝! 🎉<br>첫 가구를 하나 놓아 볼까요? (선물로 준 의자·탁자도 있어요)';$('tnx').textContent='🎨 꾸미러 가기';$('tsk').textContent='나중에';$('tdot').textContent='';$('tcap').style.top='auto';$('tcap').style.bottom='24px';return}
 const [id,txt]=TOUR[ti],el=$(id);el.classList.add('hl');$('ttx').innerHTML=txt;$('tnx').textContent='다음 ▶';$('tsk').textContent='건너뛰기';$('tdot').textContent=(ti+1)+' / '+TOUR.length;
 const br=$('box').getBoundingClientRect(),sc=br.width/W,y=(el.getBoundingClientRect().top-br.top)/sc;if(y>420){$('tcap').style.top='70px';$('tcap').style.bottom='auto'}else{$('tcap').style.top='auto';$('tcap').style.bottom='24px'}}
function startTour(){if(save.tour)return;ti=0;$('tour').style.display='block';tourShow()}
function endTour(){document.querySelectorAll('.hl').forEach(e=>e.classList.remove('hl'));$('tour').style.display='none';save.tour=1;store()}
$('tnx').onclick=()=>{if(ti>=TOUR.length){endTour();openDeco('home');toast('🪑 아래에서 가구를 고르고 바닥을 톡!');return}ti++;tourShow()};
$('tsk').onclick=()=>endTour();
/* ---------- 반복 ---------- */
/* ---------- 🐟 붕어빵 동네 ----------
   하루 한 번 가게 40곳쯤(비슷한 가게·큰 가게·상위권)을 불러와 저장(bpTown) → '🔄 다른 동네'는 그 안에서 새로 섞어요(서버 안 읽음, 제한 없음).
   한 동네 = 내 가게 + 11곳: 가까운 자리엔 비슷한 가게 6, 그다음 큰 가게 3, 끝에 상위권 2 */
const SV=STREET(cx,A);
const myD=pv=>({r5:1,room:save.room,skin:id_('skin',pv)|0,awn:id_('awn',pv)|0,sign:id_('sign',pv)|0,n:nm(),nk:chNick(),g:grade()});
const dD=r=>{const e=r.eq||{};return{r5:e.r5|0,room:r.room|0,skin:e.skin|0,awn:e.awn|0,sign:e.sign|0,n:r.n,nk:r.nk,g:r.g|0}};
let stRows=null,stHits=[],stList=[],stLoad=false,stMsg='';const ST_KEY='bpTown2';
/* 🏙️ 동네에 올 이유 (11/10): 🐟 숨은 황금 붕어빵(하루 한 번) · 🐾 이웃 3곳 구경 도장 · ❤️ 좋아요 누르면 작은 코인(하루 10번) · 💌 방명록 남긴 이웃 답방 표시 */
const twNow=()=>{const d=dayKey();if(!save.tw||save.tw.d!==d)save.tw={d,g:0,v:[],st:0,lg:0};return save.tw};
const twPay=f=>Math.max(3000,Math.min(300000,r1k(attHr()*f)));
function goldIdx(){const tw=twNow();if(tw.g||stList.length<2)return -1;let x=(Math.imul(dayKey(),2654435761)^(save.seed|0))>>>0;x^=x>>>15;x=Math.imul(x,2246822519)>>>0;return 1+(x%(stList.length-1))}
function goldGet(){const tw=twNow();if(tw.g)return;tw.g=1;const c=twPay(.5),tk=Math.random()<.25;save.coins+=c;if(tk)save.tix=(save.tix|0)+1;store();snd('fanfare');if(window.JUICE)JUICE.confetti(110);toast('🐟 황금 붕어빵 찾았다! +🪙'+fmt(c)+(tk?' · 🎫 강화권 +1':'')+' · 내일 또 숨어요');stUI();bizBtn()}
function twVisit(uid){if(!uid||uid==='me'||(window.NET&&uid===NET.uid))return;save.vst=save.vst||{};save.vst[uid]=Date.now();const ks=Object.keys(save.vst);if(ks.length>80)ks.sort((a,b)=>save.vst[a]-save.vst[b]).slice(0,ks.length-80).forEach(k=>delete save.vst[k]);
 const tw=twNow();if(!tw.v.includes(uid)){tw.v.push(uid);if(tw.v.length>=3&&!tw.st){tw.st=1;const c=twPay(.5);save.coins+=c;snd('win');if(window.JUICE)JUICE.confetti(70);setTimeout(()=>toast('🐾 이웃 도장 완성! 오늘 3곳 구경 +🪙'+fmt(c)),600)}else if(!tw.st)setTimeout(()=>toast('🐾 이웃 구경 '+tw.v.length+'/3'),600)}store()}
/* ❤️ 받은 좋아요(오늘) → 손님 +0.5%씩, 최대 +5% */
function lkTick(){const v=window.NET&&NET.myLk;if(v==null)return;const d=dayKey(),L=save.lkD;if(!L||L.d!==d)save.lkD={d,b:L&&L.c!=null?Math.min(L.c,v):v,c:v};else L.c=v}
function lkRecv(){const L=save.lkD;return L&&L.d===dayKey()?Math.max(0,(L.c|0)-(L.b|0)):0}function lkBuf(){return Math.min(.05,lkRecv()*.005)}
const lsJ=(k,v)=>{try{if(v===undefined)return JSON.parse(localStorage.getItem(k)||'null');localStorage.setItem(k,JSON.stringify(v))}catch(e){return null}};
const shuf=a=>{for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]]}return a};
/* 🗺️ 11/17 동네 지도는 모두에게 같아요: 서버 lots에 잡힌 칸은 그 주인 가게가 그 칸에, 칸을 안 잡은 이웃은 🏘️ 골목 빈 칸에 모여요 */
/* 🗺️ 11/17~18 동네 지도는 모두에게 같아요 (서버 lots). 🏘️ 마을: 칸 번호 = 마을×1000 + 칸(블록 i·100 + j·10 + 0~2).
   처음 들어오면 골목(바깥 한 줄) 빈 칸을 무료로 잡아요. 그 마을 골목이 다 차면(ALLEY_CAP) 다음 마을로. 다른 마을 빈 땅도 눌러서 이사할 수 있어요 */
let stLots=null,stTown=0;const LOT_K='bpLots2',LOT_TTL=14*864e5;
const lotLook=()=>{const d=myD(null);return{n:String(d.n||'붕어빵').slice(0,12),nk:String(d.nk||'').slice(0,12),g:d.g|0,room:Math.max(4,Math.min(11,d.room|0)),sk:d.skin|0,aw:d.awn|0,sg:d.sign|0,r5:1}};
const lotDoc=f=>Object.assign(lotLook(),{tw:Math.floor(f/1000),z:SV.LID.get(f%1000).z});
const lotLive=()=>(stLots||[]).filter(x=>x.t>Date.now()-LOT_TTL&&x.tw===stTown&&SV.LID.has(x.l%1000)&&!(window.HIDE&&HIDE.has(x.u)));
const meUid=()=>window.NET&&NET.uid;
const myLot=()=>save.zn&&save.zn.c&&save.zn.l>=1000?save.zn.l:null;
const myTown=()=>{const l=myLot();return l?Math.floor(l/1000):(save.zn&&save.zn.tw)||1};
const ALLEY_CAP=()=>SV.LOTS.filter(l=>l.z==='alley').length;
const uh=u=>{let h=2166136261;for(const c of String(u))h=Math.imul(h^c.charCodeAt(0),16777619);return h>>>0};
function stBuild(){if(!stTown)stTown=myTown();const live=lotLive(),me=meUid(),others=live.filter(x=>x.u!==me),taken=new Set(others.map(x=>x.l%1000)),cu=new Set(others.map(x=>x.u)),home=stTown===myTown();
 let meL=null;if(home){const ml=myLot();meL=ml!=null&&!taken.has(ml%1000)?ml%1000:SV.ALLEY.find(l=>!taken.has(l))}
 const free=SV.ALLEY.filter(l=>SV.LID.get(l).z==='alley'&&!taken.has(l)&&l!==meL);
 const rows=home?(stRows||[]).filter(r=>!(window.HIDE&&HIDE.has(r.u))&&!cu.has(r.u)):[],used=new Set(),take=arr=>{const o=[];for(const r of arr){if(used.has(r.u))continue;used.add(r.u);o.push(r)}return o};
 /* 아직 칸이 없는 이웃(옛 앱)은 내 마을 골목 빈 칸에, 가게 번호로 정한 자리부터 */
 /* 11/18 칸 없는 이웃은 가게 번호(uid)로 정한 골목 칸에 (아래쪽 골목 48칸 안). 다른 사람이 칸을 잡거나 비워도 안 밀려요 */
 const pick=take(rows.slice().sort((a,b)=>uh(a.u)-uh(b.u))).slice(0,free.length),fs=new Set(free),AL=SV.ALLEY.filter(l=>SV.LID.get(l).z==='alley'),SL=AL.slice(0,48),used2=new Set();
 const place=r=>{for(const L of [SL,AL]){const n=L.length;let k=uh(r.u)%n;for(let j=0;j<n;j++){const l=L[(k+j)%n];if(fs.has(l)&&!used2.has(l)){used2.add(l);return l}}}return null};
 stList=[...(meL!=null?[{d:myD(null),me:true,u:'me',lid:meL}]:[]),...others.map(x=>({d:{r5:x.r5,room:x.room,skin:x.sk,awn:x.aw,sign:x.sg,n:x.n,nk:x.nk,g:x.g},u:x.u,lid:x.l%1000})),...pick.map(r=>({d:dD(r),u:r.u,lid:place(r)})).filter(x=>x.lid!=null)];
 if(meL!=null)SV.center(meL);else SV.centerZone('prime');stTitle()}
function stTitle(){const e=$('stnm');if(!e)return;const h=stTown===myTown();e.innerHTML='<button id="stp" style="border:0;background:none;font:inherit;font-size:20px;padding:0 6px;pointer-events:auto">◀</button>🐟 마을 '+stTown+(h?' 🏠':'')+'<button id="stn" style="border:0;background:none;font:inherit;font-size:20px;padding:0 6px;pointer-events:auto">▶</button>';
 $('stp').onclick=e=>{e.stopPropagation();if(stTown<=1){snd('no');return}snd('tap');stGo(stTown-1)};
 $('stn').onclick=e=>{e.stopPropagation();snd('tap');const t=stTown+1;if(t<=myTown()){stGo(t);return}whenNet(N=>{(N.lotCount?N.lotCount(t):Promise.resolve(0)).then(c=>{if(c>0)stGo(t);else toast('🏗️ 마을 '+t+'은 아직 없어요 · 마을 '+(t-1)+' 골목이 다 차면 생겨요')}).catch(()=>toast('📶 지금은 다른 마을을 볼 수 없어요'))},()=>toast('📶 인터넷이 연결되면 볼 수 있어요'))}}
function stGo(t){stTown=t;stLots=null;lotsLoad(t,false).then(()=>{if(scr==='street')stBuild()});stBuild()}
/* 서버 칸 목록 읽기: 마을마다 하루 한 번(폰에 저장), force면 바로 다시 */
function lotsLoad(t,force){const K=LOT_K+'_'+t,c=lsJ(K);if(!force&&c&&c.d===dayKey()&&Array.isArray(c.rows)){if(t===stTown||!stTown)stLots=c.rows;return Promise.resolve(c.rows)}
 return new Promise(res=>whenNet(N=>{if(!N.lots){res([]);return}N.lots(t).then(rows=>{lsJ(K,{d:dayKey(),rows});if(t===stTown)stLots=rows;res(rows)}).catch(e=>{console.warn('lots',e&&e.code||e);const r=(c&&c.rows)||[];if(t===stTown)stLots=r;res(r)})},()=>{const r=(c&&c.rows)||[];if(t===stTown)stLots=r;res(r)}))}
const lotPut=f=>{const me=meUid(),t=Math.floor(f/1000),K=LOT_K+'_'+t,c=lsJ(K),rows=((c&&c.rows)||[]).filter(x=>x.u!==me&&x.l!==f);rows.push(Object.assign({l:f,u:me,t:Date.now()},lotDoc(f)));lsJ(K,{d:dayKey(),rows});if(t===stTown)stLots=rows;else if(stLots)stLots=stLots.filter(x=>x.u!==me)};
/* 골목이 안 찬 마을 찾기: 1번부터 골목 칸 수를 세요(마을마다 읽기 1) */
async function findTown(N){for(let t=1;t<200;t++){let c=0;try{c=await N.lotCount(t)}catch(e){const r=await lotsLoad(t,true);c=r.filter(x=>x.z==='alley').length}if(c<ALLEY_CAP())return t}return 1}
/* 칸 지키기 (앱 켤 때·동네 열 때):
   · 내 칸을 다른 사람이 가져갔으면(14일 안 와서) 칸 없는 상태로 → 다시 골목 빈 칸을 잡아요
   · 6.16.3~4(7×7)에 잡은 옛 칸(번호 1000 미만)은 9×9 마을 1의 같은 상권 칸으로 옮겨요(옛 골목은 새 골목으로)
   · 6.16.0~2에 폰에서만 이사한 상권은 그 상권 빈 칸을 잡아 주고, 자리가 없으면 권리금을 다 돌려줘요
   · 하루 한 번 내 칸 모습·시간 새로 */
let lotBusy=false;const OLDZ=(i,j)=>i===3&&j===3?'prime':i===3||j===3?'mall':i<3&&j<3?'school':i>3&&j<3?'station':i<3?'park':'alley';
async function lotFix(){if(lotBusy||!window.NET||NET.off||!NET.lotMove||!save.name)return;const N=NET,me=meUid();if(!me)return;lotBusy=true;
 try{let zn=save.zn||{k:'alley'},z=BIZ.zoneOf(save);const ml=myLot();
  if(ml!=null){const t=Math.floor(ml/1000),rows=await lotsLoad(t,false),o=rows.find(x=>x.l===ml);
   if(o&&o.u!==me){toast('🏘️ 오래 비운 사이 '+z.e+' '+z.n+' 자리를 다른 가게가 가져갔어요 · 골목으로 돌아왔어요');save.zn={k:'alley'};store();bizBtn();zn=save.zn;z=BIZ.zoneOf(save)}
   else{if(!o||Date.now()-(zn.st||0)>20*3600e3||zn.h!==JSON.stringify(lotLook())){await N.lotSync(ml,lotDoc(ml));zn.st=Date.now();zn.h=JSON.stringify(lotLook());lotPut(ml);store()}return}}
  /* 옛 7×7 칸 → 상권 그대로 9×9로 (골목이었으면 새 골목) */
  let want=null,t=null;const old=zn.c&&zn.l!=null&&zn.l<1000?zn.l:null;
  if(old!=null){const i=Math.floor(old/100),j=Math.floor(old/10)%10,k=old%10;if(OLDZ(i,j)!=='alley'&&z.k!=='alley'){t=1;const nl=(i+1)*100+(j+1)*10+k;const rows=await lotsLoad(1,true),tk=new Set(rows.filter(x=>x.u!==me&&x.t>Date.now()-LOT_TTL).map(x=>x.l%1000));want=!tk.has(nl)&&SV.LID.has(nl)&&SV.LID.get(nl).z===z.k?nl:SV.ORD[z.k].find(l=>SV.LID.get(l).z===z.k&&!tk.has(l))}}
  else if(z.k!=='alley'&&zn.paid){t=myTown();const rows=await lotsLoad(t,true),tk=new Set(rows.filter(x=>x.u!==me&&x.t>Date.now()-LOT_TTL).map(x=>x.l%1000));want=SV.ORD[z.k].find(l=>SV.LID.get(l).z===z.k&&!tk.has(l))}
  if(want==null&&z.k!=='alley'&&(old!=null||zn.paid)){const back=zn.paid|0;save.coins+=back;save.zn={k:'alley'};store();bizBtn();toast('🏘️ '+z.e+' '+z.n+'에 빈 자리가 없어서 골목으로 · 권리금 🪙'+fmt(back)+' 돌려받았어요');z=BIZ.zoneOf(save)}
  if(want==null){/* 골목: 골목이 안 찬 마을의 빈 골목 칸 (가게 번호로 정한 자리부터) */t=await findTown(N);const rows=await lotsLoad(t,true),tk=new Set(rows.filter(x=>x.u!==me&&x.t>Date.now()-LOT_TTL).map(x=>x.l%1000)),fr=SV.ALLEY.filter(l=>SV.LID.get(l).z==='alley'&&!tk.has(l));if(!fr.length)return;want=fr[0];
   /* 골목은 아래 가운데부터 차례로 채워요(이웃끼리 모이게). 동시에 같은 칸을 잡으면 다음 칸으로 (3번까지) */
   for(let k=0;k<3&&k<fr.length;k++){const f=t*1000+fr[k];try{await N.lotMove(f,zn.c&&zn.l!=null?zn.l:null,lotDoc(f));want=fr[k];break}catch(e){if(k===2||k===fr.length-1)throw e}}
   const f=t*1000+want;save.zn=Object.assign({},save.zn,{k:'alley',l:f,c:1,tw:t,st:Date.now(),h:JSON.stringify(lotLook())});lotPut(f);store();if(scr==='street'){stTown=t;stBuild()}return}
  const f=t*1000+want;await N.lotMove(f,zn.c&&zn.l!=null?zn.l:null,lotDoc(f));
  save.zn=Object.assign({},save.zn,{k:SV.LID.get(want).z==='alley'&&z.k==='alley'?'alley':z.k,l:f,c:1,tw:t,st:Date.now(),h:JSON.stringify(lotLook())});lotPut(f);store();if(scr==='street'){stTown=t;stBuild()}}
 catch(e){console.warn('lotFix',e&&e.code||e)}finally{lotBusy=false}}
addEventListener('net-ready',()=>{lotFix()});
function stUI(){const tw=twNow(),lr=lkRecv();$('stinfo').innerHTML=stLoad?'이웃 가게를 불러오는 중…':stMsg||('🐾 이웃 구경 <b>'+Math.min(3,tw.v.length)+'/3</b>'+(tw.st?' ✅':'')+' · 🐟 황금 붕어빵 '+(tw.g?'찾음 ✅':'<b>어딘가 숨어 있어요!</b>')+'<br><small>💌 = 방명록 남긴 이웃 · ❤️ 오늘 받은 좋아요 '+lr+(lr?' (손님 +'+(Math.round(lkBuf()*1000)/10)+'%)':'')+'</small>');const b=$('str');b.textContent='🔄 새로고침';b.className=stLoad?'dis':''}
function loadStreet(){const c=lsJ(ST_KEY);if(c&&c.d===dayKey()&&Array.isArray(c.rows)&&c.rows.length){stRows=c.rows;stMsg='';stBuild();stUI();return}
 const tries=lsJ(ST_KEY+'T')||{};if(tries.d===dayKey()&&(tries.n|0)>=3){stRows=stRows||(c&&c.rows)||[];stMsg=stRows.length?'':'아직 이웃 가게가 없어요';stBuild();stUI();return}
 stLoad=true;stUI();lsJ(ST_KEY+'T',{d:dayKey(),n:(tries.d===dayKey()?tries.n|0:0)+1});const sc=Math.min(3000000,decoScore());
 whenNet(N=>{if(!N.pool){stLoad=false;stMsg='지금은 이웃을 불러올 수 없어요';stUI();return}N.pool(sc,nm().trim()+'|'+chNick().trim()).then(rows=>{stLoad=false;stRows=rows;stMsg=rows.length?'':'아직 이웃 가게가 없어요';lsJ(ST_KEY,{d:dayKey(),rows});if(scr==='street'){stBuild();stUI()}})
  .catch(e=>{console.warn('town',e&&e.code||e);stLoad=false;stMsg=busyMsg()||'이웃을 불러오지 못했어요';stRows=stRows||(c&&c.rows)||[];stBuild();stUI()})},()=>{stLoad=false;stRows=stRows||(c&&c.rows)||[];stMsg='인터넷에 연결되면 이웃이 보여요';stBuild();stUI()})}
function openStreet(zk){scr='street';show('stv');if(!stRows)stRows=[];stTown=myTown();stLots=null;stBuild();loadStreet();lotsLoad(stTown,false).then(()=>{if(scr==='street'){stBuild();if(zk)SV.centerZone(zk)}lotFix()});if(zk)SV.centerZone(zk);stUI()}
function drawStreet(t,dt){const m=stList.find(x=>x.me);if(m)m.d=myD(null);const nf=(window.NET&&NET.noteFrom)||[],vs=save.vst||{};stList.forEach(it=>{if(it.me)return;const n=nf.find(q=>q.u===it.u);it.mk=n&&n.t>(vs[it.u]||0)?'💌':null});const r=SV.scene(t,stList,{dt,an:R.an,night:skyNt(save.eq.sky),gold:goldIdx(),pick:stPick});stHits=r.hits}
/* 🗺️ 11/17 지도에서 빈 땅을 눌러 이사: 다른 구역이면 이사비+권리금, 같은 구역 안에서는 무료로 자리만 옮겨요 */
let stPick=null;
function stMove(h){snd('tap');if(!window.NET||NET.off||!NET.lotMove){toast('📶 인터넷이 연결되면 이사할 수 있어요');return}if(!save.name){toast('🏪 가게 이름부터 정해 주세요');return}
 const z=BIZ.ZK[h.zone],c=BIZ.zMoveCost(save,z.k,bctx());if(!c)return;if(stTown!==myTown()&&c.same)c.tw=1;stPick=h.lot;const done=()=>{stPick=null};
 const go=()=>{done();if(save.coins<c.total){toast('코인이 부족해요! (🪙 '+fmt(c.total)+')');snd('no');return}toast('🚚 자리 잡는 중…');
  const f=stTown*1000+h.lot;NET.lotMove(f,myLot(),lotDoc(f)).then(()=>{const ok=BIZ.zMove(save,z.k,bctx(),Date.now(),f,c);if(!ok){toast('코인이 부족해요!');return}save.zn.tw=stTown;save.zn.st=Date.now();save.zn.h=JSON.stringify(lotLook());lotPut(f);store();syncShop();snd(c.same?'buy':'fanfare');if(!c.same&&window.JUICE)JUICE.confetti(70);toast(c.same?'🚚 가게를 옮겼어요!':z.e+' '+z.n+'(으)로 이사했어요!');stBuild();bizBtn()})
   .catch(e=>{console.warn('lotMove',e&&e.code||e);snd('no');toast('앗, 방금 다른 가게가 들어왔어요 · 지도를 새로 불러요');lotsLoad(stTown,true).then(()=>{if(scr==='street')stBuild()})})};
 if(c.same){JUICE.ask(z.e+(stTown!==myTown()?' 마을 '+stTown+'(으)로 옮길까요?':' 여기로 옮길까요?'),'같은 '+z.n+'이라 무료예요','🚚 옮기기',go,'그만두기',done);return}
 JUICE.ask((stTown!==myTown()?'마을 '+stTown+' ':'')+z.e+' '+z.n+'(으)로 이사할까요?',z.d+' · 📍 자리값 '+Math.round(z.r*100)+'% — 🚚 이사비 '+fmt(c.fee)+' · 🔑 권리금 '+fmt(c.key)+(c.back?' · ↩️ 옛 권리금 절반 −'+fmt(c.back):'')+' → 합계 🪙 '+fmt(c.total),'🚚 이사하기',go,'그만두기',done)}
function stTap(x,y){const h=SV.hit(stHits,x,y);if(!h)return;if(h.gold){goldGet();return}
 if(h.lot!=null){stMove(h);return}
 if(h.zone){snd('tap');const z=BIZ.ZK[h.zone],mz=BIZ.zoneOf(save);bzShow(z.e,z.n,'<p class="ht" style="text-align:center;margin-top:0">'+z.d+'</p><div class="chips"><span class="chip">📍 자리값 '+Math.round(z.r*100)+'%</span><span class="chip">🔑 권리금 '+fmt(z.key)+'</span></div>'+((mz===z?'<p class="ht" style="text-align:center">✅ 내 가게가 여기 있어요</p>':'')+'<p class="ht" style="text-align:center">🟫 이 구역의 빈 땅(점선 칸)을 누르면 이사할 수 있어요</p>'),mz===z?'좋아요':'📍 가게 자리 보기',mz===z?null:()=>{openUp('home',1);const L=$('shl');L.scrollTop=L.scrollHeight},mz===z?null:'닫기',null);return}const it=stList[h.i];snd('tap');if(it.me){toHome();return}visit(it.u,'street')}
$('nst').onclick=()=>{au();openStreet()};$('stx').onclick=()=>{snd('tap');toHome()};$('str').onclick=()=>{if(stLoad)return;snd('tap');const t=lsJ(LOT_K+'R')||{};if(t.d===dayKey()&&(t.n|0)>=5){toast('🔄 오늘은 새로고침을 다 썼어요 · 내일 다시');return}lsJ(LOT_K+'R',{d:dayKey(),n:(t.d===dayKey()?t.n|0:0)+1});toast('🔄 동네를 새로 불러요');lotsLoad(stTown,true).then(()=>{if(scr==='street')stBuild()});if(!stRows||!stRows.length)loadStreet()};
function loop(ts){const dt=Math.min(.05,(ts-last)/1000||0);last=ts;const t=ts/1000;
 if(window.__gal){window.__gal(t);requestAnimationFrame(loop);return}
 if(scr==='game'&&s){if(!paused){acc+=dt;let n=0;while(acc>=B.DT&&n++<4){B.step(s,run,B.DT);acc-=B.DT;drain();if(s.done)break}
  A.tickFx(dt);
  if(s.done){drawGame();finishDay();requestAnimationFrame(loop);return}}drawGame()}
 else if(scr==='cafe'){if(!paused)CF.step(dt);CF.draw(t);if(CF.done){finishCafe()}}
 else if(scr==='street'){drawStreet(t,dt)}
 else if(scr==='visit'){cx.fillStyle='#4a3426';cx.fillRect(0,0,W,H);if(vd){const lk=lookFrom(vd),vf2=Math.max(0,Math.min(11,(vd.eq&&vd.eq.f2)|0)),VF=vF2&&vf2?vfur2:vfur;lk.st=vf2>=5;if(vF2&&vf2){lk.f2v=true;lk.n=vf2;const fw=vd.eq.f2w;if(fw!=null){const w=Math.floor(fw/100)|0,f=(fw%100)|0;if(WALL[w])lk.wall={c:WALL[w].c,id:w};const fs=SLOTS.find(x=>x.k==='floor');if(fs&&fs.L[f])lk.floor=f}}IS.setFloor(vF2&&vf2?1:0,vf2>=5,vf2>=5&&IS.seatCount(vfur2)>0?.35:0);if(vPre!==vd){vPre=vd;IS.draw(t,lk,VF,{top:60,bottom:600});for(let i=0;i<90;i++)(IS.setPop(popOf(vd.g|0,vd.sc|0)),IS.tick(.25,VF,1))}(IS.setPop(popOf(vd.g|0,vd.sc|0)),IS.tick(dt,VF,1));IS.draw(t,lk,VF,{top:60,bottom:600});if(vF2&&vf2){rr(W/2-46,66,92,30,15,'rgba(255,241,196,.95)');tx('🏢 2층',W/2,81,16,'#5a3a22','center')}}}
 else{const f2=BIZ.f2Of(save)>0,up=f2&&IS.seatCount(save.fur2||[])>0?.35:0;IS.setFloor(F2V?1:0,f2,up);if(!hPre&&!F2V){hPre=1;drawHome(t,scr==='deco');IS.setFloor(0,f2,up);IS.setPop(myPop());for(let i=0;i<90;i++)IS.tick(.25,save.fur,1)}(IS.setPop(myPop()),IS.tick(dt,FUR(),1));drawHome(t,scr==='deco');tipDraw(t)}
 zfSync();flbSync();if(scr!==fitScr)fit();requestAnimationFrame(loop)}
/* 📐 세로가 긴 폰: 가게 첫 화면만 판을 아래로 늘려 (최대 +170) 아래 메뉴 판을 넓게. 다른 화면은 그대로 450×800 */
let EXT=0,fitScr='';
function boxBg(){if(!EXT){$('box').style.background='';return}try{const d=cx.getImageData(2,cv.height-3,1,1).data;$('box').style.background='rgb('+d[0]+','+d[1]+','+d[2]+')'}catch(e){}}
function hmLay(){const p=document.querySelector('#hm .pn');if(!p||scr!=='home'||!p.offsetParent)return;const t=p.offsetTop,y=Math.min(470+EXT,t-56);for(const id of ['nst','nms']){const e=$(id);if(e)e.style.top=y+'px'}const z=$('zf');if(z)z.style.top=(y-46)+'px';const g=$('nmg');if(g)g.style.top=(y-50)+'px'}
function fit(){const b=document.body,w=b.clientWidth,h=window.visualViewport?Math.min(b.clientHeight,Math.round(visualViewport.height)):b.clientHeight,ex=scr==='home'?Math.min(170,h*W/w-H):0;EXT=ex>6?Math.round(ex):0;const BH=H+EXT,sc=Math.min(w/W,h/BH),bx=$('box');
 bx.style.height=BH+'px';bx.style.transform='translate('+(w-W*sc)/2+'px,'+(h-BH*sc)/2+'px) scale('+sc+')';fitScr=scr;boxBg();hmLay()}
addEventListener('resize',fit);try{new ResizeObserver(()=>fit()).observe(document.body)}catch(e){}try{visualViewport.addEventListener('resize',()=>fit())}catch(e){}addEventListener('orientationchange',()=>setTimeout(fit,200));
document.addEventListener('visibilitychange',()=>{if(document.hidden){bizTick(false);store()}else bizTick(true);if(document.hidden)pauseGame();if(0){if(document.hidden)AC.suspend();else AC.resume()}});
addEventListener('pagehide',()=>{bizTick(false);store();pauseGame()});
/* 1초마다 직원 장사 정산 */
/* 💸 11/10 알바 값 내림 차액: 게임을 켜 둔 동안 5분마다 최대 150만씩 (클라우드 백업 규칙 '한 번에 +300만' 안쪽) */
let rfdT=Date.now()-300e3; /* 11/11 남은 차액은 한 번에 (클라우드 규칙 +1억 허용 · 1억 넘게 남으면 5분 뒤 나머지) */
function rfdTick(){const r=save.rfd;if(!r||!(r.l>0)||!save.name)return;if(Date.now()-rfdT<300e3)return;rfdT=Date.now();const a=Math.min(95e6,r.l);save.coins+=a;r.l-=a;if(r.l<=0){delete save.rfd;toast('💸 알바 값 차액을 모두 돌려받았어요! 총 '+fmt(r.t)+'🪙')}else toast('💸 알바 값 차액 +'+fmt(a)+'🪙 · 남은 '+fmt(r.l)+' (5분 뒤)');if(window.JUICE)JUICE.confetti(40);store();if(scr==='home')bizBtn()}
setInterval(()=>{if(document.hidden)return;bizTick(false);rfdTick();lkTick();if(scr==='home'){bizBtn();hmLay();if(EXT)boxBg()}if(++bizN%5===0)store()},1000);
window.__shop={tipPts:()=>{const r=$('cv').getBoundingClientRect(),k=r.width/W;return tipPos().slice(0,save.tipN).map((q,i)=>tipGot(i)?null:IS.iso(q.x,q.y)).filter(Boolean).map(p=>[r.left+p.x*k,r.top+(p.y-20)*k])},tipMake:()=>tipMake(),tipTake:(i,a)=>tipTake(i,a),decoWkReward:()=>decoWkReward(),gradeCard:()=>gradeCard(),mgCard:()=>mgCard(),mgr:()=>mgr(),mgCount:(a,b,c)=>mgCount(a,b,c),freeN:()=>freeN(),openDeco:a=>openDeco(a),lockOf:i=>lockOf(i),decoScore:()=>decoScore(),setF2V:v=>setF2V(v),payload:()=>shopPayload(),look:()=>look(null),eqS:(k,i)=>eqS(k,i),eqG:k=>eqG(k),visit:(u,f)=>visit(u,f),goldIdx:()=>goldIdx(),SV:()=>SV,stTap:(x,y)=>stTap(x,y),get stHits(){return stHits},get stList(){return stList},CF,startCafe,finishCafe,BIZ,bctx,bizTick,openLed,openUp,awayCard,IS,animal,fish2,bakeCol,em,tx,rr,cx,B,get save(){return save},set save(v){save=v},get run(){return run},get s(){return s},get scr(){return scr},startDay,tap,drain,finishDay,toHome,goalsFor,grade,charmBonus,SLOTS,GR};
$('nms').onclick=()=>{au();snd('tap');openMedal('home')};
/* 🚪 11/10 입구를 3시로 옮긴 뒤 처음: 문·길을 막는 가구는 보관함으로 (★은 그대로 보관) */
if(!save.d4){save.d4=1;const n=stClr();store();if(n&&save.name)setTimeout(()=>bzShow('🪜','계단이 입구 옆으로 옮겨졌어요!','<p style="text-align:center;margin:0">이제 계단이 <b>입구 바로 옆</b>에 있어서<br>가구 때문에 2층 길이 막히지 않아요.<br><br>새 계단 자리에 있던 가구 <b>'+n+'개</b>는 📦 보관함에 넣어 뒀어요.</p>','🎨 꾸미러 가기',()=>openDeco('home')),2200)}
if(!save.d3){save.d3=1;let mv=[];if(save.fur&&save.fur.length){mv=IS.fixDoor(save.fur,save.room);mv.forEach(it=>keepS(it))}store();
 if(mv.length&&save.name)setTimeout(()=>bzShow('🚪','입구가 옮겨졌어요!','<p style="text-align:center;margin:0">이제 손님이 <b>오른쪽 벽을 따라 일자로</b> 카운터까지 와요.<br>방 가운데가 넓어져서 꾸밀 자리가 늘었어요!<br><br>새 길을 막던 가구 <b>'+mv.length+'개</b>는 📦 보관함에 넣어 뒀어요.</p>','🎨 꾸미러 가기',()=>openDeco('home')),1600)}
/* 🛋️ 2칸 가구로 바뀐 뒤 처음: 겹치는 소파·벤치는 돌려 보고, 안 되면 보관함으로 */
if(!save.w4&&save.fur){const moved=IS.fixWide(save.fur,save.room);save.w2=save.w3=save.w4=1;store();if(0&&moved.length)setTimeout(()=>bzShow('🛋️','2칸 가구가 됐어요!','<p style="text-align:center;margin:0">소파 · 벤치 · 빵 진열대 · 피아노가 이제 2칸을 차지하고 두 명이 앉아요.<br>자리가 모자란 <b>'+moved.length+'개</b>는 📦 보관함에 넣어 뒀어요. 🎨 꾸미기에서 다시 놓아 주세요!</p>','🎨 꾸미러 가기',()=>openDeco('home'),'좋아요',null),900)}
fit();{const qm=new URLSearchParams(location.search).get('medal');if(qm!=null&&save.name){try{history.replaceState(null,'',location.pathname)}catch(e){}setTimeout(()=>openMedal('home'),400)}}{const qv=new URLSearchParams(location.search).get('visit');if(qv){try{history.replaceState(null,'',location.pathname)}catch(e){}renderHome();visit(qv,'url')}else if(save.name){const g=bizTick(false);toHome();if(!save.biz)setTimeout(bizIntro,350);else if(giftCheck()){}else if(g&&g.h>=3/60)setTimeout(()=>awayCard(g),350);setTimeout(()=>NEWS.check(false),400);INSTALL.nudge(true)}else{NEWS.check(true);renderHome();openName(true);INSTALL.nudge(false)}}requestAnimationFrame(loop);
setTimeout(syncShop,1500); /* 11/12 VOC(앱만 버벅): 광고는 앱 켜자마자 받지 않고 도와주기를 시작할 때 받아 둠 */
})();
