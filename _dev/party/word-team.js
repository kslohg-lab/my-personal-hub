/*META
{"tool": "word-team", "title": "단어 팀전", "emoji": "🕵️", "min": 4, "max": 4, "sub": "2:2 팀 대결! 팀장의 한 단어 힌트로<br>우리 팀 단어를 먼저 다 찾아요 (코드네임 방식)", "rules": ["4명이 두 팀(🔴·🔵)으로 나뉘고, 팀마다 👑 팀장 1명과 🔍 맞히는 사람 1명이 있어요.", "단어 25개 중 빨강 9개·파랑 8개·폭탄 1개가 숨어 있어요. <b>팀장 폰에만</b> 어느 단어가 어느 팀인지 보여요.", "팀장은 우리 팀 단어들을 묶는 <b>한 단어 + 개수</b>를 보내요. 예) \"동물 3\"", "맞히는 사람은 단어를 골라요. 우리 팀 색이면 계속(개수+1번까지), 상대 팀·빈 단어면 차례 끝, 💣 폭탄이면 바로 패배!", "우리 팀 단어를 먼저 다 찾으면 승리. 팀장은 표정·말로 힌트 주면 안 돼요 🤐"], "ui": {}, "cssvars": "--bg:#f4f1fb;--ink:#2e2648;--sub:#6e6690;--line:#ddd6f0;--soft:#ebe5fa;--pri:#c3b5f2;--pri2:#8d7bd0;--card:#fcfbff", "css": ".grid5{display:grid;grid-template-columns:repeat(5,1fr);gap:5px}.wc{height:58px;padding:2px;font-size:14px;line-height:1.2;word-break:keep-all;border:3px solid #e8e4f2;border-radius:12px;background:#fff}.wc:disabled{opacity:1}.wc.k0{border-color:#e5484d}.wc.k1{border-color:#3a7bd5}.wc.kx{border-color:#2b2b2b;background:#eee}.wc.kn{border-color:#e8e4f2}.wc.t0{background:#e5484d;color:#fff;border-color:#e5484d}.wc.t1{background:#3a7bd5;color:#fff;border-color:#3a7bd5}.wc.neu{background:#d9d4c7;color:#6b6556;border-color:#d9d4c7}.wc.dead{background:#2b2b2b;color:#fff}.wc.sel{background:#ffe08a;border-color:#d6a020;color:var(--ink)}.cl{text-align:center;font-size:30px;margin:4px 0}.nums{display:flex;gap:6px;justify-content:center;margin-top:8px}.nums button{width:46px;height:44px;font-size:18px}.nums button.on{background:var(--pri);box-shadow:0 3px 0 var(--pri2)}.teams{display:flex;gap:8px}.tm{flex:1;border-radius:14px;padding:8px;display:flex;flex-direction:column;gap:3px;font-size:13px;border:3px solid transparent}.tm b{font-size:17px}.tm.t0{background:#fde3e4}.tm.t1{background:#e1ecfb}.tm.now.t0{border-color:#e5484d}.tm.now.t1{border-color:#3a7bd5}"}
META*/
const WORDS=[...new Set(('사과,바나나,수박,딸기,포도,귤,레몬,당근,감자,옥수수,버섯,호박,우유,치즈,빵,케이크,사탕,초콜릿,아이스크림,피자,라면,김밥,떡볶이,치킨,햄버거,만두,국수,달걀,소금,설탕,'+
'강아지,고양이,토끼,곰,호랑이,사자,여우,늑대,원숭이,코끼리,기린,말,소,돼지,양,닭,오리,펭귄,부엉이,독수리,앵무새,상어,고래,돌고래,문어,게,거북이,뱀,개구리,나비,벌,개미,거미,모기,공룡,용,'+
'바다,강,호수,산,섬,숲,사막,동굴,폭포,화산,하늘,구름,비,눈,바람,번개,무지개,해,달,별,우주,지구,얼음,불,물,모래,돌,꽃,나무,잔디,'+
'학교,병원,도서관,공원,놀이터,시장,마트,은행,공항,역,항구,성,탑,다리,집,방,부엌,화장실,계단,엘리베이터,창문,문,지붕,벽,'+
'자동차,버스,기차,비행기,배,자전거,오토바이,헬리콥터,로켓,잠수함,택시,트럭,썰매,열기구,'+
'의사,경찰,소방관,요리사,선생님,가수,배우,화가,농부,어부,우주비행사,해적,닌자,마법사,공주,왕,기사,로봇,외계인,유령,천사,요정,거인,난쟁이,'+
'시계,거울,우산,안경,모자,신발,양말,장갑,목도리,가방,지갑,열쇠,자물쇠,가위,풀,연필,지우개,책,공책,컴퓨터,휴대폰,텔레비전,카메라,라디오,피아노,기타,북,나팔,'+
'공,풍선,인형,블록,퍼즐,주사위,카드,연,팽이,줄넘기,그네,미끄럼틀,텐트,침대,베개,이불,소파,의자,책상,냉장고,세탁기,청소기,전구,촛불,선물,편지,지도,나침반,보물,왕관,반지,동전,깃발,트로피,메달,'+
'축구,야구,농구,수영,스키,태권도,달리기,춤,노래,그림,사진,영화,만화,게임,파티,생일,결혼식,크리스마스,여름,겨울,봄,가을,아침,밤,꿈,잠,'+
'심장,눈물,웃음,손,발,눈썹,머리카락,이빨,코,귀,그림자,거품,비누,칫솔,수건,종이,유리,금,은,다이아몬드,자석,시간,전기,소리,색깔,냄새,맛,'+
'피라미드,등대,풍차,허수아비,눈사람,산타,트리,호빵,팥빙수,김치,된장,솜사탕,팝콘,도토리,솔방울,조개,진주,해파리,오징어,새우,코알라,판다,캥거루,하마,악어').split(','))];
let selW=-1,clueNum=2;
const TN=['🔴 빨강팀','🔵 파랑팀'],TC=['#e5484d','#3a7bd5'];
function keyOf(g){const r=rng(g.seed+7),pos=sshuffle([...Array(25).keys()],r),K=Array(25).fill('n');pos.forEach((p,i)=>{if(i<9)K[p]=0;else if(i<17)K[p]=1;else if(i===17)K[p]='x'});return K}
const GAME={
 reset(){selW=-1;clueNum=2},
 setup(){return {seed:Math.floor(Math.random()*1e9)}},
 settings(){return `<div class="small">4명이 2명씩 두 팀으로 나뉘어요 (팀과 팀장은 무작위). 한 판 15~20분.</div>`},
 derive(g){
  const P=g.pl,D=Dof(g),stop=stopOf(g,D),r=rng(g.seed);
  const words=sshuffle(WORDS,r).slice(0,25),K=keyOf(g);
  const boss=[P[0],P[2]],mate=[P[1],P[3]],teamOf=id=>P.indexOf(id)<2?0:1;
  const open=Array(25).fill(0);let T=0,ph='clue',clue=null,left=0,guessed=0,n=0,win=-1,dead=-1,log=[];
  const remain=t=>K.reduce((a,v,i)=>a+(v===t&&!open[i]?1:0),0);
  const next=()=>{T=1-T;ph='clue';clue=null;guessed=0};
  for(const m of movesOf(g,D)){
   if(ph==='end')break;if(m.n!==n)continue;
   const actor=ph==='clue'?boss[T]:mate[T];if(m.id!==actor)continue;
   const [k,a,b]=m.mv.split('|');
   if(ph==='clue'&&k==='c'){clue={w:a,c:+b||1};left=clue.c+1;ph='guess';n++;log.push({T,w:a,c:clue.c,res:[]});continue}
   if(ph==='guess'&&k==='g'){const i=+a;if(!(i>=0&&i<25)||open[i])continue;n++;open[i]=1;guessed++;left--;const v=K[i];log[log.length-1].res.push(i);
    if(v==='x'){dead=i;win=1-T;ph='end';break}
    if(remain(0)===0){win=0;ph='end';break}if(remain(1)===0){win=1;ph='end';break}
    if(v!==T||left<=0)next();continue}
   if(ph==='guess'&&k==='e'&&guessed>0){n++;next();continue}
  }
  const base={g,P,D,words,K,open,T,clue,left,guessed,n,log,boss,mate,teamOf,dead,remain:[remain(0),remain(1)],r:n};
  if(ph==='end')return {...base,ph:'end',win};
  if(stop)return {...base,ph:'end',win:-1,stopped:stop};
  return {...base,ph};
 },
 buzz(s){return (s.ph==='clue'&&s.boss[s.T]===ME)||(s.ph==='guess'&&s.mate[s.T]===ME)},
 grid(s,interactive,showKey){
  return `<div class="grid5">${s.words.map((w,i)=>{
   const k=s.K[i],cls=['wc'];
   if(s.open[i])cls.push(k==='x'?'dead':k==='n'?'neu':'t'+k);else if(showKey)cls.push(k==='x'?'kx':k==='n'?'kn':'k'+k);
   if(interactive&&selW===i)cls.push('sel');
   return `<button class="${cls.join(' ')}" ${interactive&&!s.open[i]?`data-act="pickw" data-i="${i}"`:'disabled'}>${esc(w)}</button>`;
  }).join('')}</div>`;
 },
 play(s,key,me){
  const amBoss=s.boss.includes(ME),myT=s.P.includes(ME)?s.teamOf(ME):-1;
  let h=`<div class="card"><div class="teams">${[0,1].map(t=>`<div class="tm t${t}${s.T===t?' now':''}"><b>${TN[t]} ${s.remain[t]}</b><span>👑 ${who(s.boss[t])}</span><span>🔍 ${who(s.mate[t])}</span></div>`).join('')}</div></div>`;
  if(s.ph==='clue'){
   if(s.boss[s.T]===ME)h+=`<div class="card"><h2>👑 우리 팀 차례! 힌트 한 단어 + 개수</h2><div class="small">우리 팀 색 단어들을 묶어 줄 한 단어. ⬛ 폭탄과 상대 팀 색은 피하게!</div><input type="text" id="clueIn" maxlength="12" placeholder="예) 바다" autocomplete="off" data-enter="clue"><div class="nums">${[1,2,3,4,5].map(c=>`<button class="${clueNum===c?'on':''}" data-act="num" data-c="${c}">${c}</button>`).join('')}</div><div class="err">${esc(errMsg)}</div><button class="big" data-act="clue">힌트 보내기 📨</button></div>`;
   else h+=`<div class="card" style="text-align:center;font-size:18px"><span class="wait">🤔</span> ${TN[s.T]} 팀장 ${esc(nameOf(s.boss[s.T]))}님이 힌트를 생각하는 중</div>`;
  }else{
   h+=`<div class="card" style="text-align:center"><div class="small">${TN[s.T]} 팀장 ${who(s.boss[s.T])}님의 힌트</div><div class="cl" style="color:${TC[s.T]}">"${esc(s.clue.w)}" ${s.clue.c}</div><div class="small">남은 선택 ${s.left}번 (개수 +1까지)</div></div>`;
   if(s.mate[s.T]===ME)h+=`<div class="card"><div class="small" style="text-align:center;margin-bottom:6px">단어를 고르고 <b>이 단어!</b> 우리 팀 색이면 계속, 아니면 차례 끝. ⬛ 폭탄이면 바로 패배!</div><div class="two"><button class="big" data-act="guess" ${selW>=0?'':'disabled'}>이 단어! ${selW>=0?esc(s.words[selW]):''}</button>${s.guessed>0?`<button class="big gray" data-act="endg">그만</button>`:''}</div></div>`;
   else h+=`<div class="card" style="text-align:center;font-size:17px"><span class="wait">👀</span> ${esc(nameOf(s.mate[s.T]))}님이 고르는 중${myT===s.T&&amBoss?' (팀장은 말하면 안 돼요 🤐)':''}</div>`;
  }
  h+=`<div class="card">${GAME.grid(s,s.ph==='guess'&&s.mate[s.T]===ME,amBoss)}${amBoss?`<div class="small" style="margin-top:6px">👑 팀장만 보는 열쇠: 테두리 색 = 그 팀 단어, ⬛ = 폭탄</div>`:''}</div>`;
  return h;
 },
 end(s){
  const t=s.win;
  return `<div class="card res"><div class="em">${t<0?'🛑':s.dead>=0?'💣':'🎉'}</div><div class="t">${t<0?'게임 기록':TN[t]+' 승리!'}</div>${s.dead>=0?`<p>${TN[1-t]}이(가) 폭탄 "${esc(s.words[s.dead])}"을(를) 골랐어요</p>`:''}<p>${[0,1].map(k=>`${TN[k]}: ${esc(nameOf(s.boss[k]))}·${esc(nameOf(s.mate[k]))}`).join('<br>')}</p></div>
  <div class="card"><h2>🗝️ 정답 열쇠</h2>${GAME.grid(s,false,true)}</div>
  <div class="card"><h2>📜 힌트 기록</h2>${s.log.map(x=>`<div class="row" style="display:block"><b style="color:${TC[x.T]}">${TN[x.T]}</b> "${esc(x.w)}" ${x.c} → <span class="small">${x.res.map(i=>`${esc(s.words[i])}${s.K[i]===0?'🔴':s.K[i]===1?'🔵':s.K[i]==='x'?'💣':'⚪'}`).join(' ')||'-'}</span></div>`).join('')||'<div class="small">없음</div>'}</div>`;
 },
 record(s){if(s.stopped||s.win<0)return;const b=LS.get(TOOL+'_rec',{wins:{},done:[]});if(b.done.includes(s.g.id))return;[s.boss[s.win],s.mate[s.win]].forEach(id=>b.wins[id]=(b.wins[id]||0)+1);b.done=[...b.done,s.g.id].slice(-40);LS.set(TOOL+'_rec',b)},
 recordHTML(){const b=LS.get(TOOL+'_rec',{wins:{}});const any=MEMBERS.some(m=>b.wins[m.id]);return `<div class="card"><h2>🏆 이 폰에서 본 승리 횟수</h2>${any?`<div class="score">${MEMBERS.map(m=>`<div>${avOf(m.id)}<b>${b.wins[m.id]||0}</b><span class="small">${esc(m.name)}</span></div>`).join('')}</div>`:'<div class="small">아직 기록이 없어요</div>'}</div>`},
 act(a,el,g,s,me){
  if(!me)return;
  if(a==='num'){clueNum=+el.dataset.c;render()}
  else if(a==='clue'&&s.ph==='clue'&&s.boss[s.T]===ME){
   const w=(($('clueIn')||{}).value||'').trim().replace(/\s+/g,'');
   if(!w)return setErr('힌트를 적어 주세요');
   if(s.words.some((x,i)=>!s.open[i]&&norm(x)===norm(w)))return setErr('판에 있는 단어는 힌트로 쓸 수 없어요');
   pushMove(g,s.n,'c|'+w.slice(0,12).replace(/\|/g,'')+'|'+clueNum);
  }
  else if(a==='pickw'&&s.ph==='guess'){selW=+el.dataset.i;render()}
  else if(a==='guess'&&s.ph==='guess'&&s.mate[s.T]===ME&&selW>=0){const i=selW;selW=-1;pushMove(g,s.n,'g|'+i)}
  else if(a==='endg'&&s.ph==='guess'&&s.mate[s.T]===ME&&s.guessed>0){selW=-1;pushMove(g,s.n,'e')}
 }
};
