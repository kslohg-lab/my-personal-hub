/*META
{"tool":"word-duet","title":"단어 듀엣","emoji":"🕵️‍♀️","min":2,"max":2,
 "sub":"둘이 한 팀! 서로 한 단어 힌트로<br>숨은 요원 단어 15개를 찾아요 (코드네임 듀엣 방식)",
 "rules":["단어 25개가 깔려요. 내 폰에는 <b>내 쪽 열쇠</b>가 보여요: 🟩 요원 9개, ⬛ 암살자 3개. 상대 쪽 열쇠는 달라요!","힌트 주는 사람은 <b>내 🟩 단어</b>들을 묶는 한 단어와 개수를 보내요. 예) \"바다 2\"","맞히는 사람은 단어를 눌러요. 🟩면 계속, 아무것도 아닌 단어면 차례 끝, ⬛ 암살자면 바로 패배!","힌트 주는 사람은 차례마다 번갈아 바뀌어요. 9번의 차례 안에 15개를 모두 찾으면 승리 🎉","내 🟩를 다 찾은 사람은 그다음부터 맞히기만 해요."],
 "ui":{"t":9},
 "cssvars":"--bg:#eef6f0;--ink:#21402e;--sub:#5d8070;--line:#cfe6d7;--soft:#ddf0e4;--pri:#9fe0b4;--pri2:#5fb37f;--card:#fbfffc",
 "css":".grid5{display:grid;grid-template-columns:repeat(5,1fr);gap:5px}.wc{position:relative;height:62px;padding:2px;font-size:14px;line-height:1.2;word-break:keep-all;border:3px solid #e6eee9;box-shadow:0 3px 0 var(--line);border-radius:12px;background:#fff}.wc.kg{border-color:#45b56a}.wc.kb{border-color:#2b2b2b;background:#f3f3f3}.wc.fd{background:#45b56a;color:#fff;border-color:#45b56a}.wc.sel{background:#ffe08a;border-color:#d6a020}.wc.dead{background:#2b2b2b;color:#fff}.wc .mk{position:absolute;top:2px;right:3px;font-size:10px;line-height:1}.wc:disabled{opacity:1}.cl{text-align:center;font-size:30px;margin:4px 0;color:#2f7a4a}.nums{display:flex;gap:6px;justify-content:center;margin-top:8px}.nums button{width:46px;height:44px;font-size:18px}.nums button.on{background:var(--pri);box-shadow:0 3px 0 var(--pri2)}.stat{display:flex;justify-content:space-around;text-align:center;font-size:14px;color:var(--sub)}.stat b{display:block;font-size:22px;color:var(--ink)}.keyrow{display:flex;gap:4px;justify-content:center;margin-top:6px;flex-wrap:wrap}"}
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
function keyOf(g){
 const r=rng(g.seed+7),pos=sshuffle([...Array(25).keys()],r),A=Array(25).fill('n'),B=Array(25).fill('n');
 pos.forEach((p,i)=>{
  if(i<3){A[p]='g';B[p]='g'}else if(i===3){A[p]='b';B[p]='b'}else if(i===4){A[p]='b';B[p]='g'}else if(i===5){A[p]='b'}
  else if(i===6){B[p]='b';A[p]='g'}else if(i===7){B[p]='b'}else if(i<13){A[p]='g'}else if(i<18){B[p]='g'}
 });
 return [A,B];
}
const GAME={
 reset(){selW=-1;clueNum=2},
 setup(n,id,ui){return {seed:Math.floor(Math.random()*1e9),T:ui.t||9}},
 settings(ui){return `<div class="lbl">차례 수 (적을수록 어려워요)</div><div class="chips">${[11,9,7].map(t=>opt('t',t,t+'번'+(t===11?' (쉬움)':t===7?' (어려움)':''))).join('')}</div>`},
 derive(g){
  const P=g.pl,D=Dof(g),stop=stopOf(g,D),r=rng(g.seed);
  const words=sshuffle(WORDS,r).slice(0,25),K=keyOf(g),T=g.T||9;
  const found=Array(25).fill(0),neu=[Array(25).fill(0),Array(25).fill(0)];
  let t=0,giver=0,ph='clue',clue=null,guessed=0,n=0,dead=-1,log=[];
  const greensLeft=s=>K[s].reduce((a,v,i)=>a+(v==='g'&&!found[i]?1:0),0);
  const total=()=>found.reduce((a,v)=>a+v,0);
  const nextTurn=()=>{t++;clue=null;guessed=0;ph='clue';let ng=1-giver;if(greensLeft(ng)===0)ng=giver;if(greensLeft(ng)===0)ng=1-ng;giver=ng};
  if(greensLeft(giver)===0)giver=1;
  for(const m of movesOf(g,D)){
   if(ph==='end')break;if(m.n!==n)continue;
   const who=ph==='clue'?P[giver]:P[1-giver];if(m.id!==who)continue;
   const [k,a,b]=m.mv.split('|');
   if(ph==='clue'&&k==='c'){clue={w:a,c:+b||1,by:giver};ph='guess';n++;log.push({t,giver,w:a,c:+b||1,res:[]});continue}
   if(ph==='guess'&&k==='g'){const i=+a,v=K[giver][i];if(!(i>=0&&i<25)||found[i]||neu[giver][i])continue;n++;guessed++;
    const L=log[log.length-1];L.res.push([i,v]);
    if(v==='g'){found[i]=1;if(total()===15){ph='end';break}if(greensLeft(giver)===0){nextTurn();if(t>=T){ph='end';break}}}
    else if(v==='b'){dead=i;ph='end';break}
    else{neu[giver][i]=1;nextTurn();if(t>=T){ph='end';break}}
    continue}
   if(ph==='guess'&&k==='e'&&guessed>0){n++;nextTurn();if(t>=T){ph='end';break}continue}
  }
  const base={g,P,D,words,K,found,neu,t,T,giver,clue,guessed,n,log,dead,total:total(),r:t+':'+ph};
  if(stop&&ph!=='end')return {...base,ph:'end',stopped:stop};
  if(ph==='end')return {...base,ph:'end',win:total()===15&&dead<0};
  return {...base,ph};
 },
 buzz(s){const me=s.P.indexOf(ME);return (s.ph==='clue'&&me===s.giver)||(s.ph==='guess'&&me===1-s.giver)},
 grid(s,interactive,showBoth){
  const my=s.P.indexOf(ME),side=my<0?0:my;
  return `<div class="grid5">${s.words.map((w,i)=>{
   const k=s.K[side][i],cls=['wc'];
   if(s.found[i])cls.push('fd');else if(i===s.dead)cls.push('dead');else{if(k==='g')cls.push('kg');if(k==='b')cls.push('kb')}
   if(interactive&&selW===i)cls.push('sel');
   const mk=(s.neu[0][i]?'🟤':'')+(s.neu[1][i]?'🟠':'');
   const both=showBoth?`<span class="mk">${s.K[0][i]==='g'?'🟩':s.K[0][i]==='b'?'⬛':'▫️'}${s.K[1][i]==='g'?'🟩':s.K[1][i]==='b'?'⬛':'▫️'}</span>`:(mk?`<span class="mk">${mk}</span>`:'');
   const can=interactive&&!s.found[i]&&!s.neu[s.giver][i];
   return `<button class="${cls.join(' ')}" ${can?`data-act="pickw" data-i="${i}"`:'disabled'}>${both}${esc(w)}</button>`;
  }).join('')}</div>`;
 },
 play(s,key,me){
  const my=s.P.indexOf(ME),giverId=s.P[s.giver],guesserId=s.P[1-s.giver];
  let h=`<div class="card"><div class="stat"><div><b>${s.total}/15</b>찾은 요원</div><div><b>${Math.max(0,s.T-s.t)}</b>남은 차례</div><div><b>${who(giverId)}</b>힌트 주는 사람</div></div></div>`;
  if(s.ph==='clue'){
   if(my===s.giver)h+=`<div class="card"><h2>🗣️ 내 차례! 힌트 한 단어 + 개수</h2><div class="small">초록 테두리 🟩 단어들을 묶어 줄 한 단어. 검은 테두리 ⬛는 피하게!</div><input type="text" id="clueIn" maxlength="12" placeholder="예) 바다" autocomplete="off" data-enter="clue"><div class="nums">${[1,2,3,4,5].map(c=>`<button class="${clueNum===c?'on':''}" data-act="num" data-c="${c}">${c}</button>`).join('')}</div><div class="err">${esc(errMsg)}</div><button class="big" data-act="clue">힌트 보내기 📨</button></div>`;
   else h+=`<div class="card" style="text-align:center;font-size:19px"><span class="wait">🤔</span> ${esc(nameOf(giverId))}님이 힌트를 생각하는 중</div>`;
  }else{
   h+=`<div class="card" style="text-align:center"><div class="small">${who(giverId)}님의 힌트</div><div class="cl">"${esc(s.clue.w)}" ${s.clue.c}</div><div class="small">맞힌 수 ${s.guessed}</div></div>`;
   if(my===1-s.giver)h+=`<div class="card"><div class="small" style="text-align:center;margin-bottom:6px">단어를 누르고 <b>이 단어!</b> (내 쪽 색은 상관없어요. 상대 쪽 열쇠로 판정돼요)</div><div class="two"><button class="big" data-act="guess" ${selW>=0?'':'disabled'}>이 단어! ${selW>=0?esc(s.words[selW]):''}</button>${s.guessed>0?`<button class="big gray" data-act="endg">그만 맞히기</button>`:''}</div></div>`;
   else h+=`<div class="card" style="text-align:center;font-size:17px"><span class="wait">👀</span> ${esc(nameOf(guesserId))}님이 맞히는 중</div>`;
  }
  h+=`<div class="card">${GAME.grid(s,s.ph==='guess'&&my===1-s.giver,false)}<div class="small" style="margin-top:6px">테두리 = 내 열쇠 (🟩 요원 · ⬛ 암살자) · 🟤🟠 = ${esc(nameOf(s.P[0]))}·${esc(nameOf(s.P[1]))} 쪽에서 아무것도 아니었던 단어</div></div>`;
  return h;
 },
 end(s){
  return `<div class="card res"><div class="em">${s.win?'🎉':s.dead>=0?'💀':'⏰'}</div><div class="t">${s.win?'요원 15명 모두 찾았어요!':s.dead>=0?`💣 암살자 단어 "${esc(s.words[s.dead])}"`:s.stopped?'게임 기록':'차례가 다 끝났어요'}</div><p>찾은 요원 <b>${s.total}</b>/15 · 쓴 차례 ${Math.min(s.t+(s.win?1:0),s.T)}/${s.T}</p></div>
  <div class="card"><h2>🗝️ 두 사람의 열쇠 (왼쪽 ${esc(nameOf(s.P[0]))} · 오른쪽 ${esc(nameOf(s.P[1]))})</h2>${GAME.grid(s,false,true)}</div>
  <div class="card"><h2>📜 힌트 기록</h2>${s.log.map(x=>`<div class="row" style="display:block"><b>${esc(nameOf(s.P[x.giver]))}</b> "${esc(x.w)}" ${x.c} → <span class="small">${x.res.map(([i,v])=>`${esc(s.words[i])}${v==='g'?'🟩':v==='b'?'⬛':'▫️'}`).join(' ')||'-'}</span></div>`).join('')||'<div class="small">없음</div>'}</div>`;
 },
 record(s){if(s.stopped)return;const b=LS.get(TOOL+'_rec',{win:0,play:0,done:[]});if(b.done.includes(s.g.id))return;b.play++;if(s.win)b.win++;b.done=[...b.done,s.g.id].slice(-40);LS.set(TOOL+'_rec',b)},
 recordHTML(){const b=LS.get(TOOL+'_rec',{win:0,play:0});return `<div class="card"><h2>🏆 이 폰의 기록</h2>${b.play?`<div class="score"><div><b>${b.win}</b><span class="small">성공</span></div><div><b>${b.play}</b><span class="small">도전</span></div></div>`:'<div class="small">아직 기록이 없어요</div>'}</div>`},
 act(a,el,g,s,me){
  if(!me)return;const my=s.P.indexOf(ME);
  if(a==='num'){clueNum=+el.dataset.c;render()}
  else if(a==='clue'&&s.ph==='clue'&&my===s.giver){
   const w=(($('clueIn')||{}).value||'').trim().replace(/\s+/g,'');
   if(!w)return setErr('힌트를 적어 주세요');
   if(s.words.some((x,i)=>!s.found[i]&&norm(x)===norm(w)))return setErr('판에 있는 단어는 힌트로 쓸 수 없어요');
   pushMove(g,s.n,'c|'+w.slice(0,12).replace(/\|/g,'')+'|'+clueNum);
  }
  else if(a==='pickw'&&s.ph==='guess'){selW=+el.dataset.i;render()}
  else if(a==='guess'&&s.ph==='guess'&&my===1-s.giver&&selW>=0){const i=selW;selW=-1;pushMove(g,s.n,'g|'+i)}
  else if(a==='endg'&&s.ph==='guess'&&my===1-s.giver&&s.guessed>0){selW=-1;pushMove(g,s.n,'e')}
 }
};
