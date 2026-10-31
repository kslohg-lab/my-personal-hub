/* ===== 붕어빵 가게: 화면·저장·꾸미기 (굽기 규칙은 위의 BP2 그대로) ===== */
(()=>{
if(typeof CanvasRenderingContext2D!=='undefined'&&!CanvasRenderingContext2D.prototype.roundRect)CanvasRenderingContext2D.prototype.roundRect=function(x,y,w,h,r){r=Math.min(r||0,w/2,h/2);this.moveTo(x+r,y);this.arcTo(x+w,y,x+w,y+h,r);this.arcTo(x+w,y+h,x,y+h,r);this.arcTo(x,y+h,x,y,r);this.arcTo(x,y,x+w,y,r);this.closePath()};
const B=BP2,R=B.R,W=450,H=800,$=id=>document.getElementById(id),cv=$('cv'),cx=cv.getContext('2d'),fmt=B.fmt,KEY='bpShopPubV1';
/* ---------- 꾸미기 목록 (p=가격, g=필요한 가게 등급, st=필요한 ⭐, 가격 0이고 st가 있으면 ⭐ 보상) ---------- */
const SIGN=[{n:'나무 간판',e:'🪵',p:0,g:0},{n:'리본 간판',e:'🎀',p:900,g:0},{n:'칠판 간판',e:'📝',p:2800,g:1},{n:'네온 간판',e:'💜',p:9000,g:2},{n:'금박 간판',e:'🥇',p:32000,g:3},{n:'무지개 간판',e:'🌈',p:95000,g:4},{n:'황금 왕관 간판',e:'👑',p:300000,g:5},{n:'별빛 간판',e:'✨',p:0,g:0,st:60}];
const AWN=[{n:'빨강 줄무늬',e:'🟥',p:0,g:0},{n:'파랑 줄무늬',e:'🟦',p:700,g:0},{n:'초록 줄무늬',e:'🟩',p:700,g:0},{n:'분홍 물방울',e:'🩷',p:2200,g:1},{n:'노랑 줄무늬',e:'🟨',p:2200,g:1},{n:'무지개 차양',e:'🌈',p:11000,g:2},{n:'별빛 차양',e:'⭐',p:45000,g:3},{n:'벚꽃 차양',e:'🌸',p:140000,g:4},{n:'황금 장막',e:'🏅',p:380000,g:5}];
const WALL=[{n:'크림 벽',e:'⬜',p:0,g:0,c:'#fff3dc'},{n:'하늘색 벽',e:'🟦',p:600,g:0,c:'#d8ecff'},{n:'민트 벽',e:'🟩',p:600,g:0,c:'#d8f5e4'},{n:'분홍 벽',e:'🩷',p:1500,g:0,c:'#ffdce8'},{n:'벽돌 벽',e:'🧱',p:3800,g:1,c:'#c8664a'},{n:'나무판자 벽',e:'🪵',p:9500,g:2,c:'#c89a64'},{n:'타일 벽',e:'🔲',p:28000,g:3,c:'#f2f2ee'},{n:'대리석 벽',e:'🏛️',p:90000,g:4,c:'#ece8e4'},{n:'황금빛 벽',e:'🌟',p:260000,g:5,c:'#f6dc7a'}];
const FLOOR=[{n:'시멘트 바닥',e:'⬜',p:0,g:0},{n:'체크무늬 바닥',e:'🏁',p:1400,g:0},{n:'나무 바닥',e:'🪵',p:4800,g:1},{n:'잔디',e:'🌱',p:11000,g:2},{n:'돌길',e:'🪨',p:36000,g:3},{n:'레드카펫',e:'🟥',p:110000,g:4},{n:'별빛 유리 바닥',e:'💎',p:320000,g:5}];
const SIDE=[{n:'없음',e:'➖',p:0,g:0},{n:'화분',e:'🪴',p:700,g:0,sz:56},{n:'벤치',e:'🪑',p:2600,g:1,sz:60},{n:'등불',e:'🏮',p:5200,g:1,sz:66},{n:'나무',e:'🌳',p:9800,g:2,sz:96},{n:'자전거',e:'🚲',p:14000,g:2,sz:64},{n:'분수',e:'⛲',p:42000,g:3,sz:96},{n:'회전목마',e:'🎠',p:150000,g:4,sz:104},{n:'작은 타워',e:'🗼',p:320000,g:5,sz:124},{n:'대관람차',e:'🎡',p:600000,g:6,sz:134}];
const MAS=[{n:'없음',e:'➖',p:0,g:0},{n:'강아지',e:'🐶',p:2400,g:0},{n:'고양이',e:'🐱',p:2400,g:0},{n:'토끼',e:'🐰',p:5200,g:1},{n:'판다',e:'🐼',p:16000,g:2},{n:'여우',e:'🦊',p:26000,g:2},{n:'사자',e:'🦁',p:52000,g:3},{n:'용',e:'🐉',p:210000,g:4},{n:'유니콘',e:'🦄',p:420000,g:5},{n:'황금 붕어',e:'🌟',p:0,g:0,st:100}];
const LIT=[{n:'없음',e:'➖',p:0,g:0},{n:'전구줄',e:'💡',p:3200,g:1},{n:'별 조명',e:'⭐',p:12000,g:2},{n:'네온 불빛',e:'🌃',p:41000,g:3},{n:'샹들리에',e:'🔮',p:150000,g:4},{n:'오로라 조명',e:'🌌',p:520000,g:6}];
const SKY=[{n:'맑은 낮',e:'☀️',p:0,g:0},{n:'노을',e:'🌇',p:3000,g:0},{n:'별밤',e:'🌙',p:10500,g:1},{n:'눈 내리는 거리',e:'❄️',p:36000,g:2},{n:'벚꽃 거리',e:'🌸',p:72000,g:3},{n:'단풍 거리',e:'🍁',p:72000,g:3},{n:'오로라 밤',e:'🌌',p:250000,g:5},{n:'무지개 낮',e:'🌈',p:0,g:0,st:40}];
const TOP=[{n:'없음',e:'➖',p:0,g:0},{n:'잉어 깃발 줄',e:'🎏',p:2000,g:0},{n:'풍선 아치',e:'🎈',p:6500,g:1},{n:'대형 붕어 조형물',e:'🐟',p:24000,g:2},{n:'LED 전광판',e:'🪧',p:60000,g:3},{n:'황금 왕관 장식',e:'👑',p:200000,g:4},{n:'불꽃놀이',e:'🎆',p:450000,g:5}];
const MSH=[{n:'붕어 틀',e:'🐟',p:0,g:0},{n:'동그라미 틀',e:'⚪',p:800,g:0},{n:'네모 틀',e:'🟧',p:1500,g:0},{n:'세모 틀',e:'🔺',p:2600,g:1},{n:'하트 틀',e:'💗',p:6000,g:1},{n:'별 틀',e:'⭐',p:14000,g:2},{n:'곰돌이 틀',e:'🐻',p:38000,g:3},{n:'구름 틀',e:'☁️',p:90000,g:4},{n:'왕관 틀',e:'👑',p:240000,g:5}];
/* 🏠 외관 스킨: 붕어빵 거리에서 보이는 가게 겉모습 (그림은 street.js) */
const SKIN=[{n:'기본 가게',e:'🏪',p:0,g:0},{n:'벽돌집',e:'🧱',p:60000,g:1},{n:'통나무 오두막',e:'🪵',p:150000,g:2},{n:'한옥',e:'🏯',p:350000,g:3},{n:'카페 테라스',e:'☕',p:700000,g:4},{n:'과자집',e:'🍭',p:1300000,g:5},{n:'성',e:'🏰',p:2500000,g:6}];
const SLOTS=[{k:'skin',n:'외관',L:SKIN},{k:'sign',n:'간판',L:SIGN},{k:'shape',n:'틀 모양',L:MSH},{k:'top',n:'지붕 장식',L:TOP},{k:'awn',n:'차양',L:AWN},{k:'wall',n:'벽',L:WALL},{k:'floor',n:'바닥',L:FLOOR},{k:'sL',n:'왼쪽 장식',L:SIDE},{k:'sR',n:'오른쪽 장식',L:SIDE},{k:'mas',n:'마스코트',L:MAS},{k:'lit',n:'조명',L:LIT},{k:'sky',n:'하늘',L:SKY}];
const GR=[{n:'노점',e:'🛒',at:0},{n:'골목 가게',e:'🏠',at:60},{n:'동네 맛집',e:'🍴',at:250},{n:'줄 서는 가게',e:'🚶',at:700},{n:'소문난 명가',e:'🏮',at:1500},{n:'전국구 맛집',e:'🌏',at:3000},{n:'전설의 가게',e:'👑',at:6000}];
const charmOf=it=>{const v=it.p>0?it.p:(it.st?it.st*1500:0);return v>0?Math.floor(Math.log2(v/200+1)):0};
/* ---------- 저장 ---------- */
const DEF=()=>({v:1,name:'',seed:(Math.random()*4294967296)>>>0,coins:0,day:1,up:{mold:0,speed:0,auto:0,pat:0,deco:0,loc:0},nf:1,nfUse:1,fu:[0,0,0,0,0,0],served:0,days:0,stars:0,dex:{},dexS:{},dexAll:0,own:{skin:[0],shape:[0],top:[0],sign:[0],awn:[0],wall:[0],floor:[0],sL:[0],sR:[0],mas:[0],lit:[0],sky:[0]},eq:{skin:0,shape:0,top:0,sign:0,awn:0,wall:0,floor:0,sL:0,sR:0,mas:0,lit:0,sky:0},avg:0,bestNet:0,bestCombo:0,snd:true,fur:null,inv:{},room:4,st:{bake:1,serve:1,promo:0},bought:[]});
let save=DEF();try{const o=JSON.parse(localStorage.getItem(KEY));if(o&&typeof o==='object'){save=Object.assign(DEF(),o);save.up=Object.assign(DEF().up,o.up);save.own=Object.assign(DEF().own,o.own);if(!save.st||typeof save.st!=='object')save.st=DEF().st;if(!Array.isArray(save.bought))save.bought=[];save.eq=Object.assign(DEF().eq,o.eq);if(!save.dex)save.dex={};if(!Array.isArray(save.fu))save.fu=[0,0,0,0,0,0];if(!save.inv||typeof save.inv!=='object')save.inv={};if(!(save.room>=4))save.room=4;if(!save.dexS)save.dexS={}}}catch(e){}
const store=()=>{if(window.__noStore)return;/* 기록 옮겨 받는 중엔 덮어쓰지 않기 */try{localStorage.setItem(KEY,JSON.stringify(save))}catch(e){}};
/* 처음 가구: 새 가게(또는 업데이트 전 가게)에 탁자·의자 2개·화분을 놓아 드려요 */
const starter=()=>{if(Array.isArray(save.fur))return;save.inv=Object.assign({chair:2,table:1,plant:1},save.inv);save.fur=[{k:'table',x:0,y:2,d:0},{k:'chair',x:0,y:3,d:1},{k:'chair',x:1,y:2,d:1},{k:'plant',x:0,y:1,d:0}];store()};starter();
const gradeOf=n=>{let g=0;for(let i=0;i<GR.length;i++)if(n>=GR[i].at)g=i;return g};
const grade=()=>gradeOf(save.served);
const eqIt=(k,pv)=>{const sl=SLOTS.find(x=>x.k===k);const id=pv&&pv.k===k?pv.id:save.eq[k];return sl.L[id]||sl.L[0]};
const charm=()=>SLOTS.reduce((a,s)=>a+charmOf(eqIt(s.k)),0)+(save.fur||[]).reduce((a,it)=>{const f=IS.FK[it.k];return a+(f?charmOf(f):0)},0);
const charmBonus=()=>Math.min(.25,charm()*.0023);
const nm=()=>save.name||'붕어빵';
/* 사장님 그림: 0=기본(코드 그림), 1=곰, 2=얼룩곰 */
const COOKS=[{n:'기본 요리사'},{n:'곰 사장님',f:'img/cook1.webp'},{n:'얼룩곰 사장님',f:'img/cook2.webp'}];
function applyCook(){const c=COOKS[save.cook|0]||COOKS[0];if(c.f){const im=new Image();im.src=c.f;window.ART_IMG.cook=im}else delete window.ART_IMG.cook}
applyCook();
/* 꾸미기 점수: 꾸밈 칸 가치 + 놓은 가구 가치(가격/100) + 가구 종류 보너스 + 넓이 → 가게 레벨(손님 수·주문 크기) */
function decoScore(){let sc=0;SLOTS.forEach(sl=>{const it=sl.L[save.eq[sl.k]]||sl.L[0];const v=it.p>0?it.p:(it.st?it.st*1500:0);sc+=Math.floor(v/100)});
 const kinds=new Set();(save.fur||[]).forEach(it=>{const f=IS.FK[it.k];if(f){sc+=Math.floor(f.p/100);kinds.add(it.k)}});sc+=kinds.size*25+(save.room*save.room-16)*15;
 /* 테마 세트를 다 놓으면 보너스 */IS.SETS.forEach(st=>{if(setDone(st.k,kinds))sc+=IS.SET_BONUS});return sc}
function setDone(k,kinds){kinds=kinds||new Set((save.fur||[]).map(it=>it.k));return IS.FUR.filter(f=>f.set===k).every(f=>kinds.has(f.k))}
const shopLv=()=>Math.min(40,1+Math.floor(Math.sqrt(decoScore()/20)));
/* ---------- 상태 ---------- */
let scr='home',paused=false,acc=0,last=0,run=null,s=null,ui={ft:[],pa:[],rb:0,ma:[],tp:[],fly:[],coin:[],shake:0,hud:0},prev=null,dtab=0,goals=[],bg=null;
const walk=[0,1,2,3].map(i=>({off:i*131,sp:22+i*7,an:R.an[(i*3+1)%12]}));
const show=n=>{['hm','dc','up','res','pause','set','col','nm','rk','vs','led','stv'].forEach(i=>$(i).style.display=i===n?'block':'none');$('home2').style.display=scr==='game'||scr==='cafe'?'block':'none';$('toast').classList.toggle('top',scr==='game'||scr==='cafe')};
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
const seatsN=()=>(save.fur||[]).filter(it=>{const f=IS.FK[it.k];return f&&f.seat&&IS.inRoom(it.x,it.y,save.room)}).length;
const bctx=()=>({lv:shopLv(),charm:charmBonus(),seats:seatsN()});
let bizPop=0,bizFl=[],bizT=0,bizN=0;
function bizTick(away){const g=BIZ.settle(save,Date.now(),bctx());if(!g)return null;if(g.whole>0)bizPop+=g.whole;if(away&&g.h>=3/60&&save.name)awayCard(g);return g}
const hm=h=>{const m=Math.max(1,Math.round(h*60));return m>=60?Math.floor(m/60)+'시간'+(m%60?' '+m%60+'분':''):m+'분'};
const n1=x=>String(Math.round(x*10)/10);
const lgRow=(lab,v,minus)=>'<div class="lg'+(minus?' m':'')+'"><span>'+lab+'</span><span>'+(minus?'−':'+')+fmt(Math.round(v))+'</span></div>';
/* 📒 장부 한 칸: 남은 돈을 크게 + 매출을 막대 하나로 쪼개서(순이익·재료·월세·월급·세금) */
function lgBlock(x,title,extra){const net=x.rev-x.mat-x.rent-x.wage-x.tax,rev=Math.max(1,x.rev);
 const seg=[['순이익',Math.max(0,net),'#6cc87a'],['🧂 재료',x.mat,'#ffb04a'],['🏠 월세',x.rent,'#7ab8ff'],['👥 월급',x.wage,'#c08aff'],['🏛️ 세금',x.tax,'#b0a8a0']];
 return'<div class="lgb">'+(title?'<b style="font-size:14px">'+title+'</b>':'')+'<div class="tt"><span>🐾 '+fmt(Math.round(x.cust))+'명'+(x.drk>0?' · ☕ '+fmt(Math.round(x.drk))+'잔':'')+' · 💰 '+fmt(Math.round(x.rev))+'</span><b class="'+(net<0?'neg':'')+'">'+(net<0?'−':'+')+fmt(Math.abs(Math.round(net)))+'🪙</b></div>'+
  '<div class="lbar">'+seg.map(q=>q[1]>0?'<i style="width:'+(q[1]/Math.max(rev,x.mat+x.rent+x.wage+x.tax)*100).toFixed(1)+'%;background:'+q[2]+'"></i>':'').join('')+'</div>'+
  '<div class="lgl">'+seg.slice(1).filter(q=>q[1]>0).map(q=>'<span style="--c:'+q[2]+'">'+q[0]+' −'+fmt(Math.round(q[1]))+'</span>').join('')+'</div>'+(extra||'')+'</div>'}
function nkBox(r){const c=k=>r.neck===k||(r.neck==='both'&&k!=='arrive')?' class="on"':'';return'<div class="nk"><div'+c('arrive')+'>🐾 오는 손님<b>'+n1(r.arrive)+'</b>명/시간</div><div'+c('bake')+'>🍞 굽기<b>'+n1(r.bake)+'</b>명/시간</div><div'+c('serve')+'>🧾 계산<b>'+n1(r.serve)+'</b>명/시간</div></div>'}
const NKT={arrive:'🐾 손님이 더 와야 해요 → 📣 홍보 알바 · 🎨 꾸미기(가게 Lv)',bake:'🍞 굽기가 밀려요 → 굽기 알바를 키워요',serve:'🧾 계산이 밀려요 → 계산 알바를 키워요',both:'🍞 굽기 · 🧾 계산이 같이 밀려요 → 두 알바를 함께 키워요'};
const debtTxt=()=>save.debt>0?'<p class="ht" style="color:#c03030">💸 밀린 돈 '+fmt(Math.ceil(save.debt))+'원 · 다 갚을 때까지 알바가 절반만 일해요 (월급도 절반). 들어오는 돈으로 먼저 갚아요</p>':'';
function bzShow(e,t,h,b1,f1,b2,f2){$('bze').textContent=e;$('bzt').textContent=t;$('bzb').innerHTML=h;$('bz1').textContent=b1;$('bz1').onclick=()=>{bzHide();f1&&f1()};$('bz2').style.display=b2?'block':'none';if(b2){$('bz2').textContent=b2;$('bz2').onclick=()=>{bzHide();f2&&f2()}}$('bz').style.display='block'}
function bzHide(){$('bz').style.display='none'}
$('bzx').onclick=()=>{snd('tap');bzHide()};$('bz').addEventListener('click',e=>{if(e.target===$('bz'))bzHide()});
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
const SKYC=[['#9fd8ff','#e8f7ff'],['#ff9a6a','#ffe0a8'],['#141c4a','#3d4c8c'],['#b5c4d8','#f0f4fa'],['#ffcfe0','#fff2f7'],['#ff6a3d','#ffc58a'],['#0c1440','#1d3a6a'],['#9fd8ff','#e8f7ff']];
const id_=(k,pv)=>pv&&pv.k===k?pv.id:save.eq[k];
function drawSky(k,t){let c=SKYC[k]||SKYC[0];if(k===0){const se=seasonNow();if(se===2)c=['#8fcdff','#e6f4ff'];else if(se===3)c=['#b8cde4','#eef4fb'];else if(se===0)c=['#b6e0ff','#f4f9ff']}const g=cx.createLinearGradient(0,0,0,420);g.addColorStop(0,c[0]);g.addColorStop(1,c[1]);cx.fillStyle=g;cx.fillRect(0,0,450,420);if(k===0)seasonFx(t,450,420,1);
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
function hud(){rr(0,0,W,64,0,typeof THEME!=='undefined'?THEME.hud():'#8a5a3a');tx(nm(),12,22,24,'#fff','left');tx(GR[grade()].e+' '+GR[grade()].n+' · 🏪Lv'+shopLv()+' · ✨+'+Math.round(charmBonus()*100)+'%',12,48,15,'#ffe9a0','left');{const tv=save.coins;if(hud.cv==null||Math.abs(tv-hud.cv)>1e9)hud.cv=tv;const up=tv>hud.cv+.5;hud.cv+=(tv-hud.cv)*.14;if(Math.abs(tv-hud.cv)<1)hud.cv=tv;tx('🪙 '+fmt(Math.round(hud.cv)),438,22,up?25:22,up?'#fff6c0':'#ffe9a0','right')}lvWatch();tx(dateStr()+' '+SEAS[seasonNow()].split(' ')[0],438,48,15,'#fff','right')}
/* 가게 모습 (아이소메트릭): 꾸밈 칸 + 놓은 가구. pv=꾸미기 미리보기 */
function skyCols(k){let c=SKYC[k]||SKYC[0];if(k===0){const se=seasonNow();if(se===2)c=['#8fcdff','#e6f4ff'];else if(se===3)c=['#b8cde4','#eef4fb'];else if(se===0)c=['#b6e0ff','#f4f9ff']}return c}
function look(pv){const sk=id_('sky',pv),wi=id_('wall',pv);return{g:grade(),cafe:BIZ.cafeOn(save),staff:Object.assign({},save.st),n:pv&&pv.k==='room'?pv.id:save.room,wall:{c:(WALL[wi]||WALL[0]).c,id:wi},floor:id_('floor',pv),sky:skyCols(sk),night:sk===2||sk===6,awn:id_('awn',pv),sign:id_('sign',pv),name:nm(),top:id_('top',pv),lit:id_('lit',pv),sL:SIDE[id_('sL',pv)]||SIDE[0],sR:SIDE[id_('sR',pv)]||SIDE[0],mas:MAS[id_('mas',pv)]||MAS[0]}}
function drawHome(t,deco){
 cx.fillStyle='#4a3426';cx.fillRect(0,0,W,H);
 if(deco&&dtabK()==='skin'){SV.preview(t,myD(prev),0,H-DPH+30);return}
 if(deco){const lk=look(prev);lk.staff={};IS.draw(t,lk,save.fur,{top:56,bottom:H-DPH,edit:dtabK()==='fur',sel:dsel,ghost:dghost,noCust:true});
  if(dtabK()==='shape'){const sid=id_('shape',prev);rr(W-150,64,138,108,18,'rgba(255,248,236,.95)');bread(W-81,110,.9,'#e8a840',{shp:sid});tx(MSH[sid].n,W-81,154,14,'#5a3a22','center','#fff')}}
 else{IS.draw(t,look(null),save.fur,{top:64,bottom:518});const g=cx.createLinearGradient(0,470,0,H);g.addColorStop(0,'rgba(0,0,0,0)');g.addColorStop(1,'rgba(30,18,10,.55)');cx.fillStyle=g;cx.fillRect(0,470,W,330);hud();
  if(scr==='home'){if(bizPop>0&&t-bizT>2.5){bizFl.push({v:bizPop,t});bizPop=0;bizT=t}bizFl=bizFl.filter(f=>t-f.t<1.8);bizFl.forEach(f=>{const u=(t-f.t)/1.8;cx.globalAlpha=1-u*u;tx('+'+fmt(f.v)+' 🪙',16,(INSTALL.standalone()?132:180)-u*12,18,'#fff6c0','left','#5a3a22');cx.globalAlpha=1})}else bizPop=0}}
function gradeFloorBase(){return['#b8b4ac','#d2a46a','#c89a64','#6fbf5a','#8a867c','#9a968e','#9a80d8'][save.eq.floor]||'#b8b4ac'}

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
function renderHome(){starDot();const lv=shopLv();goals=goalsFor(dayKey(),lv);const w=todayWx(),gd=gdone();
 $('hg').innerHTML='<div class="ghd"><b>📋 오늘 목표 <small style="font-weight:400;opacity:.7">⭐</small></b><span>'+w.wea.e+(w.ev?' '+R.ev[w.ev].e+' '+R.ev[w.ev].n:' '+w.wea.n)+'</span></div><div class="gl3">'+goals.map((g,i)=>{const q=gShort(g);return'<div class="'+(gd.done[i]?'ok':'')+'"><b>'+(gd.done[i]?'✅':q.e)+'</b>'+q.t+'</div>'}).join('')+'</div>';
 {const h=hbNow(),left=Math.max(0,HB1-h.n);$('h1').innerHTML='🙋 도와주기<small style="display:block;font-size:12px;opacity:.75;margin-top:-2px">'+(left?'🎁 보너스 '+left+'/'+HB1+'판':h.n<HB2?'오늘은 50% (내일 100%)':'오늘은 20% (내일 100%)')+'</small>'}bizBtn()}
function toHome(){scr='home';s=null;paused=false;prev=null;renderHome();show('hm')}
/* ---------- 하루 ---------- */
const run0=()=>({seed:(save.seed^Math.imul(save.days+1,2654435761))>>>0,day:shopLv(),up:Object.assign({},save.up,{deco:charmBonus()/.06}),fu:save.fu.slice(),nf:Math.min(save.nfUse,save.nf),coins:save.coins,lg:null,mode:'shop'});
function startDay(){au();if(!goals.length)goals=goalsFor(dayKey(),shopLv());run=run0();s=B.newDay(run);{const w=todayWx();s.wea=w.wea;s.ev=w.ev}ui=A.newUi();A.use(s,run,ui);scr='game';paused=false;acc=0;last=0;show('none')}
/* 결과 맨 위: 받은 코인을 크게 + 세금·보너스 칩 */
function resTop(gain,net,tax,hm){return'<div class="rbig">'+(net>=0?'🪙 +'+fmt(gain):'📉 0')+'<small>'+(net<0?'재료비가 더 들었지만 손해는 없던 걸로!':'벌이 '+fmt(net)+(tax?' · 🏛️ 세금 −'+fmt(tax):''))+'</small></div><div class="chips"><span class="chip'+(hm<1?' red':' ok')+'">'+(hm<1?'🎁 오늘 보너스 끝 · '+Math.round(hm*100)+'%만 받아요 (내일 100%)':'🎁 보너스 '+Math.max(0,HB1-hbNow().n)+'/'+HB1+'판 남음')+'</span></div>'}
/* 목표 짧게: 아이콘 + 두세 단어 */
function gShort(g){const n=g.n,k=g.p.k;return{perf:{e:'✨',t:'PERFECT '+n},serve:{e:'🐾',t:'손님 '+n+'명'},combo:{e:'🔥',t:'콤보 '+n},noburn:{e:'😵',t:'안 태우기'},nolose:{e:'😊',t:'놓침 '+n+'명 이하'},net:{e:'💰',t:'수익 '+(n>=10000?Math.round(n/1000)/10+'만':fmt(n))}}[k]||{e:'📋',t:g.p.t(n)}}
/* 🎁 도와주기 하루 보너스: 처음 10판 100% · 11~20판 50% · 21판부터 20% (매일 초기화. 폰 시계를 뒤로 돌려도 다시 채워지지 않아요) */
const HB1=10,HB2=20;
function hbNow(){const d=BIZ.dayKey(Date.now());if(!save.hb||typeof save.hb!=='object')save.hb={d,n:0};if(d>save.hb.d)save.hb={d,n:0};return save.hb}
const hbMul=n=>n<HB1?1:n<HB2?.5:.2;
function hbUse(){const h=hbNow(),m=hbMul(h.n);h.n++;return m}
function hbTxt(m){const h=hbNow(),left=Math.max(0,HB1-h.n);return m<1?'🎁 오늘 보너스 판을 다 써서 <b>'+Math.round(m*100)+'%</b>만 받아요 · 내일 다시 100%!':'🎁 오늘 보너스 판 <b>'+left+'/'+HB1+'</b> 남았어요'+(left?'':' · 다음 판부터 50%')}
function finishDay(){const res=B.dayResult(s,run),gd=gdone(),lv=run.day;const gl=goals.map((g,i)=>({g,ok:g.p.ok(res,g.n),was:gd.done[i]}));let star=0,bonus=0;const g0=grade();
 gl.forEach((x,i)=>{if(x.ok&&!x.was){gd.done[i]=1;star++}});const got=gd.done.filter(Boolean).length;if(got===3&&!gd.all){gd.all=1;bonus=500+lv*250}
 const hm=res.net>0?hbUse():hbMul(hbNow().n),tax=Math.round(Math.max(0,res.net)*BIZ.TAX),gain=Math.round((Math.max(0,res.net)-tax)*hm)+bonus;save.coins+=gain;BIZ.ledger(save,Date.now()).help+=gain;save.stars+=star;save.served+=res.served;save.days++;save.avg=save.avg?Math.round(save.avg*.7+res.net*.3):Math.max(0,res.net);
 save.bestNet=Math.max(save.bestNet,res.net);save.bestCombo=Math.max(save.bestCombo,res.bc);
 const dn=[];for(const an of Object.keys(save.dex)){const lv=save.dexS[an]||0;if(lv<DXT.length&&save.dex[an]>=DXT[lv]){save.dexS[an]=lv+1;save.stars++;dn.push(an+' 단골 달성! ⭐+1')}}
 if(!save.dexAll&&Object.keys(save.dex).length>=R.an.length){save.dexAll=1;save.stars+=5;dn.push('📖 도감 완성! ⭐+5')}
 lastHelp='bread';save.lr={full:res.full|0,lost:res.lost,idle:res.idle,net:res.net};const nd=s.dxNew||[];store();
 const g1=grade();let h=resTop(gain-bonus,res.net,tax,hm)+'<div class="chips"><span class="chip">🐾 '+res.served+'명</span><span class="chip'+(res.lost?' red':'')+'">😡 '+res.lost+'</span><span class="chip">✨ '+res.perf+'</span><span class="chip">👍 '+(res.good|0)+'</span><span class="chip'+(res.burnt?' red':'')+'">😵 '+res.burnt+'</span><span class="chip">🔥 '+res.bc+'</span></div>';
 h+='<div class="gl3">'+gl.map((x,i)=>'<div class="'+(gd.done[i]?'ok':'')+(x.ok&&!x.was?' new':'')+'"><b>'+(gd.done[i]?'✅':gShort(x.g).e)+'</b>'+gShort(x.g).t+(x.ok&&!x.was?'<br>⭐+1':'')+'</div>').join('')+'</div>'+(bonus?'<div class="chips"><span class="chip ok">🎁 오늘 목표 3개 달성! +'+fmt(bonus)+'🪙</span></div>':'');
 if(nd.length)h+='<div class="sum">📖 새 손님 도감 등록! '+nd.join(' ')+'</div>';if(dn.length)h+='<div class="sum">'+dn.join('<br>')+'</div>';
 if(g1>g0)h+='<div class="sum" style="background:#ffeaa8"><b>🎉 가게 등급이 올랐어요!</b><br>'+GR[g1].e+' <b>'+GR[g1].n+'</b> · 새 꾸미기 상품이 열렸어요</div>';
 h+='<div class="chips"><span class="chip">🪙 '+fmt(save.coins)+'</span><span class="chip">⭐ '+save.stars+'</span><span class="chip">'+GR[g1].e+' '+GR[g1].n+'</span></div>';
 $('rt').textContent='🌙 도와주기 끝! (가게 Lv'+lv+')';syncShop();$('rb').innerHTML=h;scr='res';s=null;snd('win');setTimeout(()=>snd('coins'),380);show('res')}
/* ---------- ☕ 음료 도와주기 (js/cafe.js) ---------- */
let lastHelp='bread';
const CF=CAFE(cx,A,{snd:k=>snd(k),toast:t=>toast(t),coins:()=>save.coins,onServe:an=>{if(an&&an!=='🧐')save.dex[an]=(save.dex[an]|0)+1}});
function startCafe(){au();if(!BIZ.cafeOn(save)){startDay();return}CF.start({save,mul:BIZ.beanMul(save),dp:d=>BIZ.dPrice(save,d),pm:(R.loc[save.up.loc|0]||R.loc[0]).pm});scr='cafe';paused=false;acc=0;last=0;lastHelp='cafe';show('none')}
function finishCafe(){if(scr!=='cafe')return;const r=CF.res(),hm=r.net>0?hbUse():hbMul(hbNow().n),tax=Math.round(Math.max(0,r.net)*BIZ.TAX),gain=Math.round((Math.max(0,r.net)-tax)*hm);
 save.coins+=gain;save.served+=r.served;save.cafeBest=Math.max(save.cafeBest|0,r.net);BIZ.ledger(save,Date.now()).help+=gain;store();syncShop();
 let h=resTop(gain,r.net,tax,hm)+'<div class="chips"><span class="chip">☕ '+r.served+'잔</span><span class="chip">✨ '+r.perf+'</span><span class="chip">👍 '+r.great+'</span><span class="chip">🙂 '+r.good+'</span><span class="chip'+(r.lost?' red':'')+'">😡 '+r.lost+'</span><span class="chip'+(r.wrong?' red':'')+'">😣 '+r.wrong+'</span><span class="chip'+(r.spill?' red':'')+'">💦 '+r.spill+'</span><span class="chip">🔥 '+r.bc+'</span></div>';
 h+='<div class="tip">💡 점선에 딱 맞추면 ✨ PERFECT (값 1.5배)</div><div class="chips"><span class="chip">🪙 '+fmt(save.coins)+'</span><span class="chip">🏆 최고 '+fmt(save.cafeBest|0)+'</span></div>';
 $('rt').textContent='☕ 음료 도와주기 끝!';$('rb').innerHTML=h;scr='res';snd('win');setTimeout(()=>snd('coins'),380);show('res')}
const cafeXY=e=>{const r=cv.getBoundingClientRect();return[(e.clientX-r.left)/r.width*W,(e.clientY-r.top)/r.height*H]};
cv.addEventListener('pointerdown',e=>{if(scr!=='cafe'||paused)return;e.preventDefault();au();const [x,y]=cafeXY(e);CF.down(x,y)});
['pointerup','pointercancel','pointerleave'].forEach(ev=>cv.addEventListener(ev,()=>{if(scr==='cafe')CF.up()}));
$('r1').onclick=()=>{if(lastHelp==='cafe')startCafe();else startDay()};$('r4').onclick=()=>{toHome()};
$('r2').onclick=()=>openDeco('res');$('r3').onclick=()=>openUp('res');
$('p2').onclick=()=>ask($('p2'),'⚠️ 여기까지로 정산해요. 한 번 더!',()=>{paused=false;$('pause').style.display='none';if(scr==='cafe'){CF.finish();finishCafe()}else finishDay()});
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
 const card=o=>'<div class="uc'+(o.hot?' hot':'')+(o.lk?' lk':'')+'">'+(o.info?inf(...o.info):'')+(o.warn?'<span class="warn">'+o.warn+'</span>':'')+'<div class="av">'+o.e+'</div><div class="nm">'+o.n+'</div>'+(o.top||'')+'<div class="st">'+(o.st||'')+'</div><button class="ub'+(o.done?' done':o.can?'':' no')+'" data-act="'+act(o.fn||(()=>{}))+'">'+o.btn+'</button></div>';
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
  BIZ.STAFF.forEach(x=>{const lv=BIZ.lvOf(save,x.k),c=BIZ.hireCost(save,x.k),nm={bake:'굽기',serve:'계산',promo:'홍보',barista:'바리스타'}[x.k];
   if(!BIZ.canHire(save,x.k)){h+=card({e:x.an,n:nm,lk:1,top:dots(0,BIZ.SMAX),st:'☕ 카페를 열면',btn:'☕ 카페로',can:1,fn:()=>{utab=3;renderUp(true)}});return}
   const v={bake:['🍞',4+2.5*lv,4+2.5*(lv+1),''],serve:['🧾',4+2.5*lv,4+2.5*(lv+1),''],promo:['🐾',15*lv,15*(lv+1),'%'],barista:['☕',2+3*lv,2+3*(lv+1),'']}[x.k];
   const capped=x.k==='promo'&&r.neck!=='arrive';
   h+=card({e:x.an,n:nm,top:dots(lv,BIZ.SMAX),st:c==null?v[0]+' '+n1(v[1])+v[3]+' 최고!':v[0]+' '+(x.k==='promo'?'+':'')+n1(v[1])+v[3]+' → <b>'+(x.k==='promo'?'+':'')+n1(v[2])+v[3]+'</b>',btn:c==null?'✅ 최고':fmt(c)+'🪙',can:c!=null&&save.coins>=c,done:c==null,hot:rk.includes(x.k)&&c!=null,warn:capped?'⚠️':'',
    info:[x.an,x.e+' '+x.n+' · Lv '+lv+'/'+BIZ.SMAX,x.d+'<br>'+({bake:'시간당 구울 수 있는 손님 수',serve:'시간당 계산할 수 있는 손님 수',promo:'오는 손님이 늘어요',barista:'시간당 만들 수 있는 음료 수'}[x.k])+'<br>💵 월급 '+fmt(BIZ.wageOf(lv))+'원/시간'+(c==null?'':' → '+fmt(BIZ.wageOf(lv+1)))+(capped?'<br><br>⚠️ 지금은 굽기·계산이 막혀서 <b>홍보해도 손님이 안 늘어요</b>. 💰 값을 올려 보세요!':'')+'<br><br>💡 빨간 칸(👆)부터 키우면 손해가 없어요'],
    fn:()=>{if(c==null)return;buyFx(BIZ.hire(save,x.k),x.an+' '+nm+' Lv'+(lv+1)+'!')}})});
  h+='</div>'}
 else if(utab===1){const p=BIZ.place(save),own=BIZ.owned(save),n=save.room;
  h+='<div class="srow"><span>🏠 크기<b>'+n+'×'+n+'</b></span><span>💸 월세<b>'+fmt(BIZ.rentOf(save))+'</b></span><span>🐾 손님<b>+'+Math.round((p.mul-1)*100)+'%</b></span></div>';
  h+='<div class="cur"><div class="av">'+p.e+'</div><div class="tx"><b>'+p.n+'</b><div>'+(!p.rent?'월세 없음 ✅':own?'내 가게 ✅ 월세 0':'월세 '+fmt(p.rent)+'/시간 · '+Math.round(p.buy/p.rent)+'시간이면 본전')+'</div></div>'+(p.rent&&!own?'<button class="ub'+(save.coins>=p.buy?'':' no')+'" data-act="'+act(()=>{buyFx(BIZ.buyPlace(save),'🎉 '+p.n+'이 내 가게가 됐어요! 월세 0원')})+'">🏠 '+fmt(p.buy)+'</button>':'')+'</div>';
  const nx=IS.ROOM.find(q=>q.n===n+1);
  if(nx){const q=BIZ.PLACE[nx.n],lk=nx.g>grade();h+='<div class="dn2">▼</div><div class="nx"><div class="av">'+q.e+'</div><div class="tx"><b>'+q.n+' '+nx.n+'×'+nx.n+'</b><div class="chips" style="justify-content:flex-start;margin:3px 0 0"><span class="chip">🐾 +'+Math.round((q.mul-1)*100)+'%</span><span class="chip">💸 '+fmt(q.rent)+'</span><span class="chip">🪑 칸 +'+(nx.n*nx.n-n*n)+'</span></div></div><button class="ub'+(lk?' no':save.coins>=nx.p?'':' no')+'" data-act="'+act(()=>{if(lk){toast(GR[nx.g].e+' '+GR[nx.g].n+' 등급이 되면 넓힐 수 있어요');snd('no');return}openDeco('up',true)})+'">'+(lk?'🔒 '+GR[nx.g].e:'📐 '+fmt(nx.p))+'</button></div>'}
  else h+='<div class="tip">🎉 가장 넓은 가게예요!</div>';
  h+='<button class="more" data-act="'+act(()=>{upAll=!upAll;renderUp()})+'">📐 모든 크기 '+(upAll?'접기 ▴':'보기 ▾')+'</button>';
  if(upAll){h+='<div class="gr3">';[4,5,6,7,8,9,10].forEach(k=>{const q=BIZ.PLACE[k];h+='<div class="uc'+(k===n?' hot':'')+'" style="padding-bottom:6px"><div class="av">'+q.e+'</div><div class="nm">'+k+'×'+k+'</div><div class="st">🐾 +'+Math.round((q.mul-1)*100)+'%<br>💸 '+fmt(q.rent)+(save.bought.includes(k)?' ✅':'')+'</div></div>'});h+='</div>'}}
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
let dsub=0,fcat=0;
const FCAT=[{k:'sit',n:'🪑 의자·탁자'},{k:'plant',n:'🪴 식물'},{k:'lit',n:'💡 조명'},{k:'deco',n:'🧸 장식'},{k:'set',n:'🎁 세트'},{k:'sp',n:'✨ 특별'}];
/* 가구 카드 그림: 작은 캔버스에 실제 가구를 그려서 */
const TCV=document.createElement('canvas');TCV.width=TCV.height=240;const TCX=TCV.getContext('2d'),TI=ISO(TCX,ART(TCX,{shape:()=>save.eq.shape|0})),THC={};
const thumbOf=k=>THC[k]||(THC[k]=TI.thumb(k));
const DT=()=>DG;
const dtabK=()=>{const g=DG[dtab]||DG[0];return g.sl?g.sl[Math.min(dsub,g.sl.length-1)]:g.k};
/* 꾸미기는 처음부터 방 전체가 아래 판 위에 보이게 (나갈 때 원래 보기로) */
let dFit0=null;
function openDeco(from,room){if(dFit0==null){dFit0=IS.fit;IS.fit=true;IS.resetPan();zfK=''}save.dHint=(save.dHint|0)+1;dback=from;dtab=room?DG.length-1:0;dsub=0;prev=null;dsel=null;dpick=null;dghost=null;scr='deco';renderDeco();show('dc')}
function lockOf(it){if(it.g>grade())return'🔒 '+GR[it.g].e+' '+GR[it.g].n+' 등급';if(it.st&&save.stars<it.st)return'🔒 ⭐ '+it.st;return null}
const placed=k=>save.fur.filter(it=>it.k===k).length,spare=k=>(save.inv[k]||0)-placed(k);
function dbtn(id,label,cls,fn){const b=$(id);b.textContent=label;b.className=cls||'';b.onclick=fn||null}
function renderDeco(){const tabs=DT(),tk=dtabK();
 $('dcw').textContent='🪙 '+fmt(save.coins);$('dci').textContent='✨ 매력 +'+Math.round(charmBonus()*100)+'%';
 const T=$('dtabs');T.innerHTML='';tabs.forEach((x,i)=>{const b=document.createElement('button');b.textContent=x.n;if(i===dtab)b.className='on';b.onclick=()=>{dtab=i;dsub=0;prev=null;dsel=null;dpick=null;dghost=null;$('dl').scrollLeft=0;renderDeco()};T.appendChild(b)});
 {const S=$('dsub'),g=DG[dtab];S.innerHTML='';S.style.display=g.sl||g.k==='fur'?'flex':'none';if(g.k==='fur')FCAT.forEach((c,j)=>{const b=document.createElement('button');b.textContent=c.n;if(j===fcat)b.className='on';b.onclick=()=>{fcat=j;dpick=null;$('dl').scrollLeft=0;renderDeco()};S.appendChild(b)});if(g.sl)g.sl.forEach((k,j)=>{const sl=SLOTS.find(x=>x.k===k),b=document.createElement('button');b.textContent=sl.n;if(j===dsub)b.className='on';b.onclick=()=>{dsub=j;prev=null;$('dl').scrollLeft=0;renderDeco()};S.appendChild(b)})}
 const L=$('dl'),sl0=L.scrollLeft;L.innerHTML='';
 const card=(e,n,sub,cls,fn)=>{const b=document.createElement('button');b.className='cd '+(cls||'');b.innerHTML='<b>'+e+'</b>'+n+'<small>'+sub+'</small>';b.onclick=fn;L.appendChild(b)};
 let msg='';
 if(tk==='fur'){
  const fc=FCAT[fcat].k,fcard=f=>{const lk=lockOf(f),sp=spare(f.k),pl=placed(f.k),b=document.createElement('button');b.className='cd fu'+(dpick===f.k?' on':'')+(lk?' lk':'');
   b.innerHTML='<img src="'+thumbOf(f.k)+'" alt=""><span class="fn"></span><small class="fp">'+(lk?lk.replace(' 등급','부터'):sp>0?'📦 보관 '+sp+'개':'🪙 '+fmt(f.p))+'</small><i class="fs">✨+'+Math.floor(f.p/100)+'</i>'+(pl?'<i class="fpl">놓음 '+pl+'</i>':'');b.querySelector('.fn').textContent=f.n;
   b.onclick=()=>{if(lk){toast(lk.replace('🔒 ','')+'이 되면 살 수 있어요');snd('no');return}dpick=dpick===f.k?null:f.k;dsel=null;renderDeco()};L.appendChild(b)};
  if(fc==='set')IS.SETS.forEach(st=>{const its=IS.FUR.filter(f=>f.set===st.k),hv=its.filter(f=>placed(f.k)>0).length,h=document.createElement('div');h.className='cdh'+(hv===its.length?' done':'');h.innerHTML='<b></b><small>'+hv+'/'+its.length+(hv===its.length?' 완성! ✨+'+IS.SET_BONUS:' · 다 놓으면 ✨+'+IS.SET_BONUS)+'</small>';h.querySelector('b').textContent=st.n;L.appendChild(h);its.forEach(fcard)});
  else IS.FUR.filter(f=>f.c===fc).sort((a,b)=>a.p-b.p).forEach(fcard);
  const f=dsel&&IS.FK[dsel.k];
  dbtn('da1','↻ 돌리기',f&&f.rot?'go':'dis',()=>{if(dsel&&IS.FK[dsel.k].rot){dsel.d=((dsel.d|0)+1)%4;store();snd('tap')}});
  dbtn('da2','📦 보관함에 넣기',dsel?'':'dis',()=>{if(dsel){save.fur=save.fur.filter(it=>it!==dsel);dsel=null;store();snd('tap');renderDeco()}});
  msg=dsel?f.n+' 골랐어요 · 한 번 더 톡 = 돌리기 · 빈 칸 톡 = 옮기기':dpick?(spare(dpick)>0?IS.FK[dpick].n+' 놓을 칸을 톡! (보관함 '+spare(dpick)+'개)':IS.FK[dpick].n+' 놓을 칸을 톡! 놓으면 🪙'+fmt(IS.FK[dpick].p)):((save.dHint|0)<3?'가구를 고르고 바닥을 톡! · 놓인 가구 톡 = 고르기 · 🚪🧾 칸만 비워요':'')}
 else if(tk==='room'){
  IS.ROOM.forEach(r=>{const own=save.room>=r.n,lk=!own&&r.g>grade()?'🔒 '+GR[r.g].n:null;card('📐',r.n+'×'+r.n,own?(save.room===r.n?'지금 크기':'✅'):lk?lk.replace('🔒 ',''):'🪙'+fmt(r.p),(prev&&prev.k==='room'&&prev.id===r.n?'on':save.room===r.n?'eq':'')+(lk?' lk':''),()=>{prev=own?null:{k:'room',id:r.n};renderDeco()})});
  const nx=IS.ROOM.find(r=>r.n===save.room+1);
  if(prev&&prev.k==='room'){const r=IS.ROOM.find(q=>q.n===prev.id),lk=r.g>grade(),seq=r.n===save.room+1;
   dbtn('da1',lk?'🔒 '+GR[r.g].n+' 등급':!seq?'먼저 '+(save.room+1)+'×'+(save.room+1):'📐 넓히기 🪙'+fmt(r.p),lk||!seq?'dis':'go',()=>{if(lk||!seq)return;if(save.coins<r.p){toast('코인이 부족해요!');snd('no');return}save.coins-=r.p;save.room=r.n;prev=null;IS.reset();store();snd('fanfare');if(window.JUICE)JUICE.confetti(120);toast('가게가 '+r.n+'×'+r.n+'로 넓어졌어요! 🎉');renderDeco();bizBtn()});{const q=BIZ.PLACE[r.n];msg=q.e+' '+q.n+' · 보증금 🪙'+fmt(r.p)+' · 월세 '+fmt(q.rent)+'/시간 (사면 0원) · 손님 +'+Math.round((q.mul-1)*100)+'%'}}
  else{dbtn('da1',nx?'다음: '+nx.n+'×'+nx.n:'최대 크기예요!','dis');msg=nx?'카드를 눌러 넓어진 모습을 미리 봐요':'가장 넓은 가게예요 🎉'}
  dbtn('da2','✔ 완료','',()=>$('dx').click())}
 else{const sl=SLOTS.find(x=>x.k===tk);
  sl.L.forEach((it,id)=>{const own=save.own[sl.k].includes(id),eqd=save.eq[sl.k]===id,lk=own?null:lockOf(it),free=!it.p&&it.st&&!lk;
   card(it.e,it.n,eqd?'사용 중':own?'가지고 있어요':lk?lk.replace('🔒 ',''):free?'⭐ 보상':'🪙'+fmt(it.p),(prev&&prev.k===sl.k&&prev.id===id?'on':eqd?'eq':'')+(lk?' lk':''),()=>{prev={k:sl.k,id};renderDeco()})});
  const id=prev&&prev.k===sl.k?prev.id:save.eq[sl.k],it=sl.L[id],own=save.own[sl.k].includes(id),eqd=save.eq[sl.k]===id,lk=own?null:lockOf(it),free=!it.p&&it.st&&!lk;
  if(eqd)dbtn('da1','✅ 사용 중','dis');
  else if(own)dbtn('da1','바꾸기','go',()=>{save.eq[sl.k]=id;prev=null;store();snd('tap');renderDeco()});
  else if(lk)dbtn('da1',lk,'dis');
  else if(free)dbtn('da1','받기 🎁','go',()=>{save.own[sl.k].push(id);save.eq[sl.k]=id;prev=null;store();snd('win');renderDeco()});
  else dbtn('da1','사기 🪙'+fmt(it.p),save.coins>=it.p?'go':'dis',()=>{if(save.coins<it.p){toast('코인이 부족해요!');snd('no');return}save.coins-=it.p;save.own[sl.k].push(id);save.eq[sl.k]=id;prev=null;store();snd('buy');if(window.JUICE)JUICE.confetti(60);toast(it.n+' 설치 완료!');renderDeco()});
  dbtn('da2',prev?'↩ 되돌리기':'✔ 완료','',()=>{if(prev){prev=null;renderDeco()}else $('dx').click()});
  msg=prev&&!eqd?'미리 보는 중 · 매력 +'+charmOf(it):sl.n+' 고르기'}
 $('dmsg').textContent=msg;L.scrollLeft=sl0}
/* 가게 바닥을 톡: 가구 고르기 / 놓기 */
function decoTap(x,y){if(dtabK()!=='fur'||y>H-DPH||y<56)return;const n=save.room,{gx,gy}=IS.toTile(x,y);
 if(!IS.inRoom(gx,gy,n)){dsel=null;renderDeco();return}
 const it=save.fur.find(q=>q.x===gx&&q.y===gy);
 /* 고른 가구를 한 번 더 톡 = 돌리기 */
 if(it){if(dsel===it){if(IS.FK[it.k].rot){it.d=((it.d|0)+1)%4;store();snd('tap')}else toast('이 가구는 돌릴 수 없어요')}else{dsel=it;dpick=null;snd('tap')}renderDeco();return}
 if(IS.isCounter(gx,gy)){toast('여기는 카운터예요');snd('no');return}
 if(IS.isPath(gx,gy,n)){toast(gy===1?'카운터 앞은 손님이 계산하는 자리예요':'문 앞은 비워 둬야 손님이 들어와요');snd('no');return}
 const bs0=IS.blockedSeats(save.fur,n),seatWarn=()=>{if(IS.blockedSeats(save.fur,n)>bs0)setTimeout(()=>toast('⚠️ 손님이 갈 수 없는 의자가 생겼어요'),350)};
 /* 가구를 고른 채 빈 칸 톡 = 옮기기 */
 if(dsel&&!dpick){if(!IS.okPlace(save.fur,gx,gy,dsel.k,dsel,n)){toast('🚧 여기 놓으면 손님 길이 막혀요');snd('no');return}dsel.x=gx;dsel.y=gy;store();snd('place');IS.bounce(dsel);seatWarn();dghost={x:gx,y:gy,ok:true};setTimeout(()=>dghost=null,250);renderDeco();return}
 if(!dpick){dsel=null;renderDeco();return}
 if(!IS.okPlace(save.fur,gx,gy,dpick,null,n)){toast('🚧 여기 놓으면 손님 길이 막혀요');snd('no');return}
 const f=IS.FK[dpick];
 if(spare(dpick)<=0){if(save.coins<f.p){toast('코인이 부족해요! (🪙'+fmt(f.p)+')');snd('no');return}save.coins-=f.p;save.inv[dpick]=(save.inv[dpick]||0)+1;toast(f.n+' 구입! -🪙'+fmt(f.p))}
 const was=f.set&&setDone(f.set),nw={k:dpick,x:gx,y:gy,d:0};save.fur.push(nw);dsel=nw;store();snd('place');IS.bounce(nw);if(f.set&&!was&&setDone(f.set)){const st=IS.SETS.find(x=>x.k===f.set);setTimeout(()=>{toast('🎉 '+st.n+' 완성! 꾸미기 ✨+'+IS.SET_BONUS);snd('win')},300)}seatWarn();dghost={x:gx,y:gy,ok:true};setTimeout(()=>dghost=null,250);renderDeco()}
/* 가게 화면 손가락: 움직이면 끌어서 둘러보기, 제자리에서 떼면 톡(꾸미기에서 놓기·고르기), 두 손가락 = 확대·축소(핀치)
   가게에서 다 줄인 상태에서 더 줄이면 🏙️ 거리로, 거리에서 다 키운 상태에서 더 키우면 내 가게로 */
let drg=null,pin=null;const pts=new Map();const cvPt=e=>{const r=cv.getBoundingClientRect();return{x:(e.clientX-r.left)/r.width*W,y:(e.clientY-r.top)/r.height*H}};
const panScr=()=>scr==='home'||scr==='deco'||scr==='visit'||scr==='street';
function zoomBy(f){if(scr==='street'){const t0=SV.T;SV.zoom(f);if(f>1&&SV.T>=72&&t0>=72){pinAcc*=f;if(pinAcc>1.4){pinAcc=1;toHome()}}else pinAcc=1;return}
 const z=IS.zoom(f);if(scr==='home'&&f<1&&z.atMin){pinAcc*=f;if(pinAcc<.72){pinAcc=1;openStreet()}}else pinAcc=1}
let pinAcc=1;
cv.addEventListener('pointerdown',e=>{if(!panScr())return;e.preventDefault();const p=cvPt(e);if(scr==='deco'&&(p.y>H-DPH||p.y<56))return;pts.set(e.pointerId,p);try{cv.setPointerCapture(e.pointerId)}catch(_){}
 if(pts.size===2){const [a,b]=[...pts.values()];pin={d:Math.hypot(a.x-b.x,a.y-b.y)};drg=null;pinAcc=1;return}
 if(pts.size===1)drg={id:e.pointerId,x:p.x,y:p.y,lx:p.x,ly:p.y,mv:false}});
cv.addEventListener('pointermove',e=>{if(!pts.has(e.pointerId))return;const p=cvPt(e);pts.set(e.pointerId,p);
 if(pin&&pts.size>=2){const [a,b]=[...pts.values()],d=Math.hypot(a.x-b.x,a.y-b.y);if(d>10&&pin.d>10)zoomBy(d/pin.d);pin.d=d;return}
 if(!drg||e.pointerId!==drg.id)return;if(!drg.mv&&Math.hypot(p.x-drg.x,p.y-drg.y)>9)drg.mv=true;if(drg.mv){if(scr==='street')SV.drag(p.x-drg.lx,p.y-drg.ly);else if(IS.canPan())IS.pan(p.x-drg.lx,p.y-drg.ly)}drg.lx=p.x;drg.ly=p.y});
const endDrg=(e,ok)=>{pts.delete(e.pointerId);if(pts.size<2)pin=null;if(!drg||e.pointerId!==drg.id)return;const d=drg;drg=null;if(ok&&!d.mv&&scr==='deco')decoTap(d.x,d.y);if(ok&&!d.mv&&scr==='street')stTap(d.x,d.y)};
cv.addEventListener('pointerup',e=>endDrg(e,true));cv.addEventListener('pointercancel',e=>endDrg(e,false));
/* 아이폰 사파리: 화면 전체가 확대되지 않게 */try{document.addEventListener('gesturestart',e=>e.preventDefault(),{passive:false})}catch(_){}
/* 컴퓨터: 마우스 휠로 확대·축소 */
cv.addEventListener('wheel',e=>{if(!panScr())return;e.preventDefault();zoomBy(Math.exp(-e.deltaY*.0015))},{passive:false});
/* 🔍 전체 보기 ↔ 크게 보기 (큰 가게이거나 확대했을 때) · 🏙️ 거리 버튼(홈) */
$('zf').onclick=()=>{IS.fit=!IS.fit;snd('tap');zfK='';zfSync()};
let zfK='';function zfSync(){const b=$('zf'),hm=scr==='home'&&$('hm').style.display==='block',on=panScr()&&scr!=='street'&&!(scr==='deco'&&dtabK()==='skin')&&!(scr==='home'&&!hm)&&(IS.canPan()||IS.fit),k=(on?scr+IS.fit+dtabK():'')+hm;if(k===zfK)return;zfK=k;
 $('nst').style.display=hm?'block':'none';b.style.display=on?'block':'none';if(!on)return;b.textContent=IS.fit?'🔎 크게 보기':'🔍 전체 보기';b.style.top=(scr==='deco'?H-DPH-50:scr==='visit'?560:424)+'px'}
$('dx').onclick=()=>{if(dFit0!=null){IS.fit=dFit0;dFit0=null;IS.resetPan();zfK=''}prev=null;dsel=null;dpick=null;syncShop();bizBtn();if(dback==='res'){scr='res';show('res')}else if(dback==='up'){scr='up';renderUp(true);show('up')}else toHome()};
/* ---------- 도감 · 별 ---------- */
function renderCol(){const g=grade(),nx=GR[g+1],nd=Object.keys(save.dex).length;
 let h='<div class="srow"><span>⭐ 별<b>'+save.stars+'</b></span><span>🏅 등급<b>'+GR[g].e+'</b></span><span>📖 도감<b>'+nd+'/'+R.an.length+'</b></span></div>';
 h+='<div class="cur" style="flex-direction:column;align-items:stretch;gap:4px"><div style="display:flex;justify-content:space-between;font-size:15px"><b style="font-weight:400">'+GR[g].e+' '+GR[g].n+'</b><span>'+(nx?nx.e+' '+nx.n+'까지 🐾 '+fmt(nx.at-save.served):'🎉 최고 등급!')+'</span></div>'+(nx?'<div class="bar" style="margin:2px 0"><i style="width:'+Math.round(100*(save.served-GR[g].at)/(nx.at-GR[g].at))+'%"></i></div>':'')+'<div class="chips" style="justify-content:flex-start;margin:0"><span class="chip">🐾 '+fmt(save.served)+'명</span><span class="chip">📅 '+save.days+'일</span><span class="chip">💰 최고 '+fmt(save.bestNet)+'</span><span class="chip">🔥 '+save.bestCombo+'</span></div></div>';
 const rw=starRw();
 h+='<p class="ht" style="margin-top:12px"><b>⭐ 별 보상</b> <small style="opacity:.7">목표·단골로 별을 모아요</small></p><div class="gr3">'+rw.map((x,j)=>{const ok=save.stars>=x.st;return'<div class="uc'+(x.own||ok?'':' lk')+'"><div class="av">'+x.e+'</div><div class="nm">'+x.n+'</div><div class="st">'+x.sl+'</div>'+(x.own?'<button class="ub done">✅ 받음</button>':ok?'<button class="ub srw" data-j="'+j+'">🎁 받기</button>':'<button class="ub no">⭐ '+x.st+'</button>')+'</div>'}).join('')+'</div>';
 h+='<p class="ht" style="margin-top:12px"><b>📖 손님 도감</b> <small style="opacity:.7">10번·30번 오면 단골 ⭐</small></p><div class="dx">'+R.an.map(a=>{const n=save.dex[a];const lv=save.dexS[a]||0;return'<div><b>'+(n!==undefined?a:'❓')+'</b>'+(n!==undefined?(lv?'⭐'.repeat(lv)+' ':'')+n+'번':'?')+'</div>'}).join('')+'</div>';
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
$('nm1').onclick=()=>{const n=cleanName($('nmi').value);if(!n){$('nme').textContent='한 글자 이상 써 주세요';return}if(BADW.bad(n)){$('nme').textContent='다른 이름을 써 주세요 🙏';return}save.name=n;if(nmFirst)save.biz=1;store();toHome();if(nmFirst)setTimeout(()=>giftCheck(()=>{if(!save.tour)startTour()}),300);if(!nmFirst)toast('간판이 바뀌었어요')};
$('nmi').addEventListener('keydown',e=>{if(e.key==='Enter')$('nm1').click()});$('nmx').onclick=()=>show('set');
const sndLbl=()=>{const c=AU?AU.get():{mu:0,fx:0};$('smu').textContent=c.mu?'🎵 음악 켜짐':'🎵 음악 꺼짐';$('sfx').textContent=c.fx?'🔊 효과음 켜짐':'🔇 효과음 꺼짐';$('smu').classList.toggle('on',!!c.mu);$('sfx').classList.toggle('on',!!c.fx)};
$('smu').onclick=()=>{if(AU){AU.set('mu',!AU.get().mu);sndLbl()}};$('sfx').onclick=()=>{if(AU){AU.set('fx',!AU.get().fx);sndLbl();snd('ui')}};
$('sr').onclick=()=>openName(false);$('snw').onclick=()=>{show('hm');NEWS.open()};INSTALL.bind($('sin'));INSTALL.bind($('happ'));$('sxf').onclick=()=>{show('hm');INSTALL.xfer()};$('sc').onclick=()=>show('hm');
$('rst').onclick=()=>ask($('rst'),'⚠️ 가게가 모두 사라져요! 한 번 더',()=>{const sn=save.snd;save=DEF();save.snd=sn;store();openName(true);toast('모두 지웠어요')});
$('h1').onclick=()=>{au();if(BIZ.cafeOn(save))bzShow('🙋','어디를 도와줄까요?','<p style="text-align:center;margin:0">🐟 붕어빵: 틀에 넣고 뒤집어 굽기<br>☕ 음료: 컵 고르고 꾹 눌러 붓기</p>','🐟 붕어빵 굽기',()=>startDay(),'☕ 음료 만들기',()=>startCafe());else startDay()};$('h2').onclick=()=>{au();openDeco('home')};$('h3').onclick=()=>{au();openUp('home',0)};$('h4').onclick=()=>{au();renderCol();show('col')};
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
cv.addEventListener('pointerdown',e=>{e.preventDefault();au();if(scr!=='game'||paused||!s||s.ph!=='play')return;const r=cv.getBoundingClientRect();tap((e.clientX-r.left)/r.width*W,(e.clientY-r.top)/r.height*H)});
/* ---------- 하루 그리기 (공용 화면 + 내 가게 꾸밈 색) ---------- */
const FLC=['#c9935f','#d2a46a','#c89a64','#7fbf6a','#a8a498','#b8384a','#8ac8e8'];
/* 장사 화면: 챌린지처럼 가게 앞 거리 + 걸어오는 손님, 차양·마스코트는 내 가게 꾸밈 */
const AWX=[['#e8584a','#fff6ec'],['#4a8ae8','#fff6ec'],['#4ab86a','#fff6ec'],['#ff8ab0','#fff0f6'],['#ffcf3a','#fff6ec'],['rb'],['#2a3a7a','#ffd23a'],['#ffb0c8','#fff0f6'],['#d4a020','#fff3c0']];
function shopAwning(){const ac=AWX[save.eq.awn|0]||AWX[0],n=15,w=W/n;for(let i=0;i<n;i++){const c=ac[0]==='rb'?RB[i%RB.length]:i%2?ac[1]:ac[0];cx.fillStyle=c;cx.fillRect(i*w,60,w,16);cx.beginPath();cx.arc(i*w+w/2,76,w/2,0,Math.PI);cx.fill()}cx.fillStyle='rgba(0,0,0,.12)';cx.fillRect(0,60,W,3)}
function drawGame(){A.use(s,run,ui);A.drawPlay({street:true,title:'🙋 도와주기 시작!',sub:nm()+' · '+s.wea.n+' · 가게 Lv'+run.day,
 bg:t=>{cx.fillStyle='#ffe0b5';cx.fillRect(0,0,W,H);cx.fillStyle=FLC[save.eq.floor]||FLC[0];cx.fillRect(0,322,W,78);cx.fillStyle='rgba(255,255,255,.18)';cx.fillRect(0,322,W,6);cx.fillStyle='rgba(0,0,0,.14)';cx.fillRect(0,328,W,4);cx.fillStyle='#6b5344';cx.fillRect(0,394,W,310)},
 front:t=>{shopAwning();const g=cx.createLinearGradient(0,318,0,330);g.addColorStop(0,'#b97d4a');g.addColorStop(1,'#a06a3a');cx.fillStyle=g;cx.fillRect(0,318,W,8)},
 head:t=>{rr(0,0,W,58,0,typeof THEME!=='undefined'?THEME.hud():'#8a5a3a');tx(s.wea.e+' 🏪Lv'+run.day,12,18,20,'#fff','left');tx('🪙 '+fmt(save.coins+s.net),388,18,ui.hud>0?27:22,ui.hud>0?'#fff6c0':'#ffe9a0','right');
  const r=live(),gd=gdone();goals.forEach((g,i)=>{const ok=gd.done[i]||g.p.ok(r,g.n),x=8+i*146;rr(x,34,138,20,10,ok?'#4fa860':'rgba(0,0,0,.3)');tx((ok?'✅':'')+g.p.sh(r,g.n),x+69,44,13,'#fff','center','rgba(0,0,0,.4)')})},
 mid:t=>{if(save.eq.mas>0){const M=MAS[save.eq.mas];if(M.e==='🌟')fish(30,300+Math.sin(t*3)*3,.3,'#ffcf3a','#a87010');else em(M.e,26,298+Math.sin(t*3)*3,30)}},
 fx:()=>{if(s.wea.e==='☀️')seasonFx(s.t,W,700,.6)}})}
/* ---------- 가게 순위 · 친구 가게 구경 (js/net.js) ---------- */
function whenNet(fn,fail,n=0){const N=window.NET;if(N&&N.get)return fn(N);if(N&&N.pending&&n<40)return setTimeout(()=>whenNet(fn,fail,n+1),300);if(fail)fail()}
const chNick=()=>{try{return String((JSON.parse(localStorage.getItem('bungeoppang2Pub1'))||{}).nick||'').slice(0,12)}catch(e){return''}};
function shopPayload(){return{n:nm().slice(0,12),nk:chNick(),g:grade(),sc:Math.min(3000000,decoScore()),room:save.room,eq:Object.assign({},save.eq,{cook:save.cook|0}),fur:(save.fur||[]).slice(0,120).map(f=>f.k+','+f.x+','+f.y+','+(f.d|0))}}
function syncShop(){if(!save.name)return;whenNet(N=>{const d=shopPayload(),h=JSON.stringify(d);if(h===save.upH)return;N.save(d).then(()=>{save.upH=h;store()}).catch(e=>console.warn('shop sync',e&&e.code||e))})}
const lvOf=sc=>Math.min(40,1+Math.floor(Math.sqrt((sc|0)/20)));
let rkBy='sc',rkFrom='home';
function openRank(by){rkBy=by||rkBy;scr='rk';show('rk');renderRank()}
function renderRank(){$('rk0').className=rkBy==='sc'?'on':'';$('rk1').className=rkBy==='lk'?'on':'';$('rkh').textContent=rkBy==='sc'?'꾸미기 점수가 높은 가게 · 이름을 누르면 구경해요':'좋아요를 많이 받은 가게 · 이름을 누르면 구경해요';
 const L=$('rkl');L.innerHTML='<p class="ht">불러오는 중…</p>';
 whenNet(N=>{N.top(rkBy).then(rows=>{if(scr!=='rk')return;if(!rows.length){L.innerHTML='<p class="ht">아직 올라온 가게가 없어요. 꾸미기를 마치면 내 가게가 올라가요! 🏪</p>';return}L.innerHTML='';
  rows.forEach((r,i)=>{const d=document.createElement('div');d.className='rr'+(r.u===N.uid?' me':'');d.innerHTML='<b>'+(i<3?['🥇','🥈','🥉'][i]:(i+1))+'</b><span class="nm"><span></span><small></small></span><span class="vl">'+(rkBy==='sc'?'✨ '+fmt(r.sc):'❤️ '+fmt(r.lk))+'</span>';
   d.querySelector('.nm span').textContent='🏪 '+r.n;d.querySelector('.nm small').textContent=(GR[r.g]?GR[r.g].e+' '+GR[r.g].n:'')+' · Lv'+lvOf(r.sc)+(r.nk?' · 🙂 '+r.nk:'');d.onclick=()=>visit(r.u,'rk');L.appendChild(d)});
  const f=document.createElement('p');f.className='ht';f.style.textAlign='center';f.textContent=rows.length>=30?'위쪽 30곳만 보여요':rows.length+'곳';L.appendChild(f)}).catch(()=>{L.innerHTML='<p class="ht">불러오지 못했어요. 잠시 뒤에 다시 눌러 주세요.</p>'})},()=>{L.innerHTML='<p class="ht">지금은 연결할 수 없어요.</p>'})}
$('nb').onclick=()=>{au();syncShop();openRank('sc')};$('rk0').onclick=()=>openRank('sc');$('rk1').onclick=()=>openRank('lk');$('rkr').onclick=()=>{whenNet(N=>N.bust());renderRank()};$('rkx').onclick=()=>toHome();
/* 구경 */
let vd=null,vuid=null,vfur=[],vFrom='home';
function lookFrom(d){const eq=d.eq||{},g=k=>{const sl=SLOTS.find(x=>x.k===k),v=eq[k]|0;return sl&&sl.L[v]?v:0};const sk=g('sky'),wi=g('wall');
 return{g:d.g|0,n:Math.max(4,Math.min(10,d.room|0)),wall:{c:(WALL[wi]||WALL[0]).c,id:wi},floor:g('floor'),sky:skyCols(sk),night:sk===2||sk===6,awn:g('awn'),sign:g('sign'),name:String(d.n||'').slice(0,12),top:g('top'),lit:g('lit'),sL:SIDE[g('sL')]||SIDE[0],sR:SIDE[g('sR')]||SIDE[0],mas:MAS[g('mas')]||MAS[0]}}
function visit(uid,from){vFrom=from||'home';vd=null;vuid=uid;vfur=[];IS.reset();IS.resetPan();scr='visit';show('vs');$('vnm').textContent='불러오는 중…';$('vinfo').textContent='';$('vlk').className='';$('vlk').textContent='❤️ 좋아요';
 whenNet(N=>{N.get(uid).then(d=>{if(scr!=='visit'||vuid!==uid)return;if(!d){toast('아직 가게를 꾸미지 않은 사람이에요');leaveVisit();return}
  vd=d;{const c=COOKS[(d.eq&&d.eq.cook)|0]||COOKS[0];if(c.f){const im=new Image();im.src=c.f;window.ART_IMG.cook=im}else delete window.ART_IMG.cook}vfur=(d.fur||[]).map(x=>{const a=String(x).split(',');return{k:a[0],x:+a[1],y:+a[2],d:(+a[3])|0}}).filter(it=>IS.FK[it.k]);
  if(vFrom==='url'&&uid!==N.uid)toast('💌 '+((d.nk&&!BADW.bad(d.nk))?d.nk+'님이':'친구가')+' 가게 구경에 초대했어요!');
  $('vnm').innerHTML='';const a=document.createElement('span');a.textContent='🏪 '+(d.n||'');const b=document.createElement('small');b.textContent=(d.nk?'🙂 '+d.nk+' 님의 가게':'')+'';$('vnm').append(a,b);renderVisit();
  $('vmk').style.display=save.name?'none':'block';
  if(uid===N.uid){$('vlk').className='done';$('vlk').textContent='🏠 내 가게'}else N.liked(uid).then(l=>{if(l){$('vlk').className='done';$('vlk').textContent='❤️ 눌렀어요'}}).catch(()=>{})}).catch(()=>{toast('불러오지 못했어요');leaveVisit()})},()=>{toast('지금은 연결할 수 없어요');leaveVisit()})}
function renderVisit(){if(!vd)return;$('vinfo').innerHTML=(GR[vd.g]?GR[vd.g].e+' '+GR[vd.g].n:'')+' · 🏪Lv'+lvOf(vd.sc)+'<br>✨ 꾸미기 '+fmt(vd.sc|0)+' · ❤️ '+fmt(vd.lk|0)}
function leaveVisit(){vd=null;IS.reset();IS.resetPan();applyCook();$('vmk').style.display='none';if(vFrom==='street'){openStreet()}else if(vFrom==='rk'){openRank()}else if(!save.name){scr='home';renderHome();openName(true)}else toHome()}
$('vx').onclick=leaveVisit;
$('vmk1').onclick=()=>{vFrom='home';leaveVisit()};
/* 📤 내 가게 자랑: 가게 모습을 크게 다시 그려 카드로 */
function shopSnap(){const off=document.createElement('canvas');off.width=900;off.height=960;const c2=off.getContext('2d');c2.scale(2,2);
 const A2=ART(c2,{shape:()=>save.eq.shape|0}),I2=ISO(c2,A2);I2.draw(performance.now()/1000,look(null),save.fur||[],{top:10,bottom:470,noCust:true,fit:true});return off}
$('nbs').onclick=()=>{au();syncShop();whenNet(N=>go(N.uid),()=>go(null));
 function go(uid){const url=location.origin+'/shop.html'+(uid?'?visit='+uid:'');const txt='🏪 내 붕어빵 가게 「'+nm()+'」 구경 와! ❤️ 눌러주고, 너도 가게 만들어 봐 🐟';
  SHARE.send(SHARE.shop({name:nm(),lv:shopLv(),sc:decoScore(),lk:0,snap:shopSnap(),url}),txt,url,'붕어빵 가게')}};
$('vlk').onclick=()=>{if(!vd||$('vlk').className==='done')return;whenNet(N=>{if(vuid===N.uid)return;$('vlk').className='done';N.like(vuid).then(()=>{vd.lk=(vd.lk|0)+1;renderVisit();$('vlk').textContent='❤️ 눌렀어요';snd('win');toast('❤️ 좋아요를 보냈어요!')}).catch(()=>{$('vlk').textContent='❤️ 눌렀어요';toast('이미 눌렀거나 잠시 뒤에 다시 해 주세요')})})};
/* ---------- 가게 첫 방문 안내 (건너뛰기 가능) ---------- */
const TOUR=[['biz','💼 <b>영업 중</b> — 직원들이 알아서 장사해요. 자리를 비워도 8시간까지!<br>누르면 장부(매출·월세·월급·세금)를 봐요'],['h1','🙋 <b>도와주기</b> — 심심할 때 직접 90초 동안 구워서 더 벌어요'],['h2','🎨 <b>꾸미기</b> — 가구를 사서 가게 바닥에 직접 놓아요.<br>예쁠수록 손님이 많이 와요 (가게 Lv)'],['h3','💼 <b>경영</b> — 알바를 뽑고 키우고, 가게를 사서 월세를 없애요'],['nb','🏘️ <b>가게 순위</b> — 다른 사람 가게를 구경하고 ❤️를 눌러요'],['nbs','📤 <b>내 가게 자랑</b> — 카톡으로 "구경 와!" 링크를 보내요'],['hc','🔥 <b>챌린지</b> — 매주 친구들과 단계를 겨루는 서바이벌!']];
let ti=0;
function tourShow(){document.querySelectorAll('.hl').forEach(e=>e.classList.remove('hl'));
 if(ti>=TOUR.length){$('ttx').innerHTML='준비 끝! 🎉<br>첫 가구를 하나 놓아 볼까요? (선물로 준 의자·탁자도 있어요)';$('tnx').textContent='🎨 꾸미러 가기';$('tsk').textContent='나중에';$('tdot').textContent='';$('tcap').style.top='auto';$('tcap').style.bottom='24px';return}
 const [id,txt]=TOUR[ti],el=$(id);el.classList.add('hl');$('ttx').innerHTML=txt;$('tnx').textContent='다음 ▶';$('tsk').textContent='건너뛰기';$('tdot').textContent=(ti+1)+' / '+TOUR.length;
 const br=$('box').getBoundingClientRect(),sc=br.height/H,y=(el.getBoundingClientRect().top-br.top)/sc;if(y>420){$('tcap').style.top='70px';$('tcap').style.bottom='auto'}else{$('tcap').style.top='auto';$('tcap').style.bottom='24px'}}
function startTour(){if(save.tour)return;ti=0;$('tour').style.display='block';tourShow()}
function endTour(){document.querySelectorAll('.hl').forEach(e=>e.classList.remove('hl'));$('tour').style.display='none';save.tour=1;store()}
$('tnx').onclick=()=>{if(ti>=TOUR.length){endTour();openDeco('home');toast('🪑 아래에서 가구를 고르고 바닥을 톡!');return}ti++;tourShow()};
$('tsk').onclick=()=>endTour();
/* ---------- 반복 ---------- */
/* ---------- 🐟 붕어빵 동네 ----------
   하루 한 번 가게 40곳쯤(비슷한 가게·큰 가게·상위권)을 불러와 저장(bpTown) → '🔄 다른 동네'는 그 안에서 새로 섞어요(서버 안 읽음, 제한 없음).
   한 동네 = 내 가게 + 11곳: 가까운 자리엔 비슷한 가게 6, 그다음 큰 가게 3, 끝에 상위권 2 */
const SV=STREET(cx,A);
const myD=pv=>({room:save.room,skin:id_('skin',pv)|0,awn:id_('awn',pv)|0,sign:id_('sign',pv)|0,n:nm(),nk:chNick(),g:grade()});
const dD=r=>{const e=r.eq||{};return{room:r.room|0,skin:e.skin|0,awn:e.awn|0,sign:e.sign|0,n:r.n,nk:r.nk,g:r.g|0}};
let stRows=null,stHits=[],stList=[],stLoad=false,stMsg='';const ST_KEY='bpTown';
const lsJ=(k,v)=>{try{if(v===undefined)return JSON.parse(localStorage.getItem(k)||'null');localStorage.setItem(k,JSON.stringify(v))}catch(e){return null}};
const shuf=a=>{for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]]}return a};
function stBuild(){const rows=(stRows||[]).slice(),my=Math.min(3000000,decoScore()),used=new Set(),take=(arr,n)=>{const o=[];for(const r of arr){if(o.length>=n)break;if(used.has(r.u))continue;used.add(r.u);o.push(r)}return o};
 const near=take(shuf(rows.slice().sort((a,b)=>Math.abs(a.sc-my)-Math.abs(b.sc-my)).slice(0,14)),6).sort((a,b)=>Math.abs(a.sc-my)-Math.abs(b.sc-my));
 const big=take(shuf(rows.filter(r=>r.sc>my*1.5&&!r.top)),3).sort((a,b)=>a.sc-b.sc);
 const top=take(shuf(rows.filter(r=>r.top)),2).sort((a,b)=>a.sc-b.sc);
 const rest=take(shuf(rows.slice()),11-near.length-big.length-top.length);
 stList=[{d:myD(null),me:true,u:'me'},...[...near,...rest,...big,...top].map(r=>({d:dD(r),u:r.u}))].slice(0,SV.LOTS.length);SV.center(0)}
function stUI(){$('stinfo').innerHTML=stLoad?'이웃 가게를 불러오는 중…':stMsg||('가게를 톡 하면 구경해요 · 끌어서 둘러보고 🤏 두 손가락으로 확대');const b=$('str');b.textContent='🔄 다른 동네';b.className=stLoad?'dis':''}
function loadStreet(){const c=lsJ(ST_KEY);if(c&&c.d===dayKey()&&Array.isArray(c.rows)&&c.rows.length){stRows=c.rows;stMsg='';stBuild();stUI();return}
 const tries=lsJ(ST_KEY+'T')||{};if(tries.d===dayKey()&&(tries.n|0)>=3){stRows=stRows||(c&&c.rows)||[];stMsg=stRows.length?'':'아직 이웃 가게가 없어요';stBuild();stUI();return}
 stLoad=true;stUI();lsJ(ST_KEY+'T',{d:dayKey(),n:(tries.d===dayKey()?tries.n|0:0)+1});const sc=Math.min(3000000,decoScore());
 whenNet(N=>{if(!N.pool){stLoad=false;stMsg='지금은 이웃을 불러올 수 없어요';stUI();return}N.pool(sc,nm().trim()+'|'+chNick().trim()).then(rows=>{stLoad=false;stRows=rows;stMsg=rows.length?'':'아직 이웃 가게가 없어요';lsJ(ST_KEY,{d:dayKey(),rows});if(scr==='street'){stBuild();stUI()}})
  .catch(e=>{console.warn('town',e&&e.code||e);stLoad=false;stMsg='이웃을 불러오지 못했어요';stRows=stRows||(c&&c.rows)||[];stBuild();stUI()})},()=>{stLoad=false;stRows=stRows||(c&&c.rows)||[];stMsg='인터넷에 연결되면 이웃이 보여요';stBuild();stUI()})}
function openStreet(){scr='street';show('stv');if(!stRows)stRows=[];stBuild();loadStreet();stUI()}
function drawStreet(t,dt){const m=stList.find(x=>x.me);if(m)m.d=myD(null);const r=SV.scene(t,stList,{dt,an:R.an,night:save.eq.sky===2||save.eq.sky===6});stHits=r.hits}
function stTap(x,y){const h=SV.hit(stHits,x,y);if(!h)return;const it=stList[h.i];snd('tap');if(it.me){toHome();return}visit(it.u,'street')}
$('nst').onclick=()=>{au();openStreet()};$('stx').onclick=()=>{snd('tap');toHome()};$('str').onclick=()=>{if(stLoad)return;snd('tap');if(!stRows||!stRows.length){loadStreet();return}stBuild();toast('🔄 새 동네로 왔어요!')};
function loop(ts){const dt=Math.min(.05,(ts-last)/1000||0);last=ts;const t=ts/1000;
 if(window.__gal){window.__gal(t);requestAnimationFrame(loop);return}
 if(scr==='game'&&s){if(!paused){acc+=dt;let n=0;while(acc>=B.DT&&n++<4){B.step(s,run,B.DT);acc-=B.DT;drain();if(s.done)break}
  A.tickFx(dt);
  if(s.done){drawGame();finishDay();requestAnimationFrame(loop);return}}drawGame()}
 else if(scr==='cafe'){if(!paused)CF.step(dt);CF.draw(t);if(CF.done){finishCafe()}}
 else if(scr==='street'){drawStreet(t,dt)}
 else if(scr==='visit'){cx.fillStyle='#4a3426';cx.fillRect(0,0,W,H);if(vd){const lk=lookFrom(vd);IS.tick(dt,vfur,1);IS.draw(t,lk,vfur,{top:60,bottom:600})}}
 else{IS.tick(dt,save.fur,1);drawHome(t,scr==='deco')}
 zfSync();requestAnimationFrame(loop)}
function fit(){const b=document.body,sc=Math.min(b.clientWidth/W,b.clientHeight/H);$('box').style.transform='translate('+(b.clientWidth-W*sc)/2+'px,'+(b.clientHeight-H*sc)/2+'px) scale('+sc+')'}
addEventListener('resize',fit);addEventListener('orientationchange',()=>setTimeout(fit,200));
document.addEventListener('visibilitychange',()=>{if(document.hidden){bizTick(false);store()}else bizTick(true);if(document.hidden)pauseGame();if(0){if(document.hidden)AC.suspend();else AC.resume()}});
addEventListener('pagehide',()=>{bizTick(false);store();pauseGame()});
/* 1초마다 직원 장사 정산 */
setInterval(()=>{if(document.hidden)return;bizTick(false);if(scr==='home')bizBtn();if(++bizN%5===0)store()},1000);
window.__shop={get stHits(){return stHits},get stList(){return stList},CF,startCafe,finishCafe,BIZ,bctx,bizTick,openLed,openUp,awayCard,IS,animal,fish2,bakeCol,em,tx,rr,cx,B,get save(){return save},set save(v){save=v},get run(){return run},get s(){return s},get scr(){return scr},startDay,tap,drain,finishDay,toHome,goalsFor,grade,charmBonus,SLOTS,GR};
fit();{const qv=new URLSearchParams(location.search).get('visit');if(qv){try{history.replaceState(null,'',location.pathname)}catch(e){}renderHome();visit(qv,'url')}else if(save.name){const g=bizTick(false);toHome();if(!save.biz)setTimeout(bizIntro,350);else if(giftCheck()){}else if(g&&g.h>=3/60)setTimeout(()=>awayCard(g),350);setTimeout(()=>NEWS.check(false),400);INSTALL.nudge(true)}else{NEWS.check(true);renderHome();openName(true);INSTALL.nudge(false)}}requestAnimationFrame(loop);
setTimeout(syncShop,1500);
})();
