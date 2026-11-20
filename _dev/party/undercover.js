/*META
{"tool":"undercover","title":"언더커버","emoji":"🕶️","min":3,
 "sub":"모두 단어를 받지만, 한 명만 <b>비슷한 다른 단어</b>!<br>그런데… 그게 나일 수도 있어요 😱",
 "rules":["각자 폰에 단어가 나와요. 딱 한 명(언더커버)만 비슷하지만 <b>다른 단어</b>를 받아요. 예) 사과 vs 배","<b>내가 언더커버인지는 아무도 몰라요!</b> 다른 사람 힌트를 듣고 눈치채야 해요.","순서대로 한 명씩 힌트 한마디. 내 단어를 그대로 쓰면 안 돼요.","힌트가 다 돌면 언더커버라고 생각되는 사람에게 투표해요. 동점이면 동점자끼리 한 번 더!","언더커버가 뽑히면 나머지 모두 +1, 다른 사람이 뽑히면 언더커버 +3."],
 "ui":{"r":2},
 "cssvars":"--bg:#eef1f6;--ink:#2a3140;--sub:#6a7488;--line:#d3d9e4;--soft:#e2e7f0;--pri:#9ec5ff;--pri2:#5f8fd6;--card:#fbfcfe",
 "css":".mw{text-align:center;padding:16px 10px}.mw .w{font-size:40px;color:#2f62b0;margin:4px 0}.hint{display:flex;gap:8px;align-items:flex-start;padding:7px 2px}.hint .who{flex:none;min-width:58px;color:var(--sub);font-size:15px;padding-top:3px}.bub{background:#fff;border:2px solid var(--line);border-radius:14px 14px 14px 4px;padding:7px 12px;font-size:18px;word-break:break-all}.bub.me{background:#eaf2ff;border-color:#9ec5ff}.bub.sk{color:#aab;font-size:14px;background:transparent;border-style:dashed}.rd{font-size:13px;color:var(--sub);margin:8px 0 2px}.vote{display:grid;grid-template-columns:1fr 1fr;gap:10px}.vote button{height:72px;font-size:19px}.vote button.on{background:#ffd0d0;box-shadow:0 4px 0 #e89a9a}"}
META*/
const PAIRS=('사과|배;고양이|호랑이;피자|햄버거;우유|요구르트;바다|강;의사|간호사;축구|농구;연필|볼펜;자전거|오토바이;눈|비;수박|참외;짜장면|짬뽕;라면|우동;버스|기차;사자|호랑이;딸기|체리;김밥|초밥;떡볶이|순대;치킨|돈가스;강아지|늑대;토끼|햄스터;펭귄|오리;비행기|헬리콥터;냉장고|세탁기;텔레비전|컴퓨터;책상|식탁;침대|소파;숟가락|젓가락;우산|비옷;모자|헬멧;장갑|양말;선생님|교수님;경찰관|소방관;가수|배우;수영|스키;피아노|기타;야구|테니스;영화관|놀이공원;학교|도서관;병원|약국;마트|편의점;여름|겨울;아침|저녁;해|달;별|달;구름|안개;산|언덕;바나나|망고;아이스크림|빙수;케이크|빵;사탕|초콜릿;콜라|사이다;커피|차;카메라|휴대폰;시계|달력;가위|칼;거울|창문;이불|베개;샴푸|비누;칫솔|치약;크리스마스|생일;설날|추석;공룡|용;로봇|외계인;유령|좀비;마법사|요정;해적|닌자;공주|왕자').split(';').map(x=>x.split('|'));
let pick=null,showW=true;
const GAME={
 maps:['h'],
 reset(){pick=null;showW=true},
 setup(n,id,ui){
  const pi=rint(PAIRS.length),u=1+rint(n-1),k=hash(id);   // 언더커버는 첫 번째로 말하지 않게
  return {pi:(pi+k)%PAIRS.length,sw:rint(2),u:(u+k)%n,r:ui.r||2};
 },
 settings(ui){return `<div class="lbl">힌트는 몇 바퀴?</div><div class="chips">${[1,2,3].map(r=>opt('r',r,r+'바퀴')).join('')}</div>`},
 derive(g){
  const P=g.pl,n=P.length,D=Dof(g),stop=stopOf(g,D),sk=skipsOf(P,D),k=hash(g.id);
  const pair=PAIRS[((g.pi-k)%PAIRS.length+PAIRS.length)%PAIRS.length],U=P[((g.u-k)%n+n)%n];
  const maj=pair[g.sw],und=pair[1-g.sw],wordOf=id=>id===U?und:maj;
  const slots=[];let turn=null;
  for(let r=0;r<(g.r||2);r++)for(const id of P){
   const h=(D(id).h||{})[r];
   if(typeof h==='string'&&h)slots.push({id,r,t:h});
   else if(sk.has('h:'+id+':'+r))slots.push({id,r,skip:1});
   else{if(!turn)turn={id,r};slots.push({id,r,wait:1})}
  }
  const base={g,P,n,D,U,maj,und,wordOf,slots,turn},halt=o=>stop?{...o,ph:'end',stopped:stop}:o;
  if(turn)return halt({...base,ph:'hint',r:'h'+turn.r+turn.id});
  const tally=(key,cands)=>{const c={},votes=[];P.forEach(id=>{const v=D(id)[key];if(typeof v==='string'&&cands.includes(v)&&v!==id){c[v]=(c[v]||0)+1;votes.push([id,v])}});const mx=Math.max(0,...Object.values(c));return {c,votes,top:mx?cands.filter(x=>c[x]===mx):[]}};
  const voted=(key)=>P.filter(id=>{const v=D(id)[key];return (typeof v==='string'&&v)||sk.has(key+':'+id)});
  const v1=tally('v',P);
  if(voted('v').length<n)return halt({...base,ph:'vote',v1,missing:P.filter(id=>!voted('v').includes(id))});
  let out=null,v2=null,re=null;
  if(v1.top.length===1)out=v1.top[0];
  else if(v1.top.length>1){re=v1.top;v2=tally('v2',re);if(voted('v2').length<n)return halt({...base,ph:'revote',v1,re,v2,missing:P.filter(id=>!voted('v2').includes(id))});if(v2.top.length===1)out=v2.top[0]}
  return {...base,ph:'end',v1,v2,re,out,win:out===U?'citizen':'under'};
 },
 buzz(s){return (s.ph==='hint'&&s.turn.id===ME)||((s.ph==='vote'||s.ph==='revote')&&s.missing.includes(ME))},
 board(s){
  let h='',r=-1;
  for(const x of s.slots){
   if(x.wait&&!(s.turn&&x.id===s.turn.id&&x.r===s.turn.r))continue;
   if(x.r!==r){r=x.r;h+=`<div class="rd">${r+1}바퀴</div>`}
   h+=`<div class="hint"><span class="who">${who(x.id)}</span>${x.skip?'<span class="bub sk">건너뜀</span>':x.wait?'<span class="tag turn">✍️ 생각 중…</span>':`<span class="bub${x.id===ME?' me':''}">${esc(x.t)}</span>`}</div>`;
  }
  return `<div class="card"><h2>💬 힌트</h2>${h||'<div class="small">아직 힌트가 없어요</div>'}</div>`;
 },
 play(s,key,me){
  let h='';
  if(me)h+=`<div class="card mw"><div class="small">🔑 내 단어 (나도 언더커버일 수 있어요!)</div>${showW?`<div class="w">${esc(s.wordOf(ME))}</div>`:'<div class="w">● ● ●</div>'}<button class="chip" data-act="peek">${showW?'🙈 가리기':'👀 보기'}</button></div>`;
  else h+=`<div class="card mw"><div class="small">👀 구경 중</div></div>`;
  if(s.ph==='hint'){
   h+=GAME.board(s);
   if(s.turn.id===ME)h+=`<div class="card"><h2>✍️ 내 차례! 힌트 한마디 (${s.turn.r+1}바퀴)</h2><input type="text" id="hin" maxlength="20" placeholder="내 단어를 말하지 말고 힌트를" autocomplete="off" data-enter="hint"><div class="err">${esc(errMsg)}</div><button class="big" data-act="hint">말하기 💬</button></div>`;
   else{h+=`<div class="card" style="text-align:center;font-size:19px"><span class="wait">✍️</span> ${esc(nameOf(s.turn.id))}님 차례예요</div>`;if(me)h+=waitBtn(key,40000,[s.turn.id],id=>'h:'+id+':'+s.turn.r,'건너뛰기')}
  }else{
   const re=s.ph==='revote',key2=re?'v2':'v',cands=(re?s.re:s.P).filter(id=>id!==ME),my=me?(s.D(ME)[key2]||''):'';
   h+=`<div class="card"><h2>${re?'⚖️ 동점! 둘 중에서 다시 투표':'🗳️ 언더커버는 누구일까요?'}</h2>${me?`<div class="vote">${cands.map(id=>`<button class="${my===id?'on':''}" data-act="vote" data-id="${id}">${who(id)}</button>`).join('')}</div>${my?`<div class="small" style="text-align:center;margin-top:8px">✅ ${esc(nameOf(my))}님에게 투표 (바꿀 수 있어요)</div>`:''}`:''}
   <div class="small" style="text-align:center;margin-top:8px">투표 ${s.n-s.missing.length}/${s.n} <span class="wait">⏳</span></div></div>`;
   if(me)h+=waitBtn(key,45000,s.missing,id=>key2+':'+id);
   h+=GAME.board(s);
  }
  return h;
 },
 end(s){
  if(s.stopped)return `<div class="card res"><p>언더커버는 <b>${who(s.U)}</b>님</p><p>단어: <b>${esc(s.maj)}</b> / 언더커버 단어: <b>${esc(s.und)}</b></p></div>`+GAME.board(s);
  const cw=s.win==='citizen',pt=GAME.points(s);
  const vl=(t,v)=>v&&v.votes.length?`<div class="small">${t}: ${v.votes.map(([a,b])=>`${esc(nameOf(a))}→${esc(nameOf(b))}`).join(' · ')}</div>`:'';
  return `<div class="card res"><div class="em">${cw?'🎉':'🕶️'}</div><div class="t">${cw?'언더커버를 찾았어요!':'언더커버 승리!'}</div>
  <p>언더커버는 <b style="color:#d84a4a">${who(s.U)}</b>님</p><p>모두의 단어 <b style="font-size:22px">${esc(s.maj)}</b> · 언더커버 단어 <b style="font-size:22px;color:#d84a4a">${esc(s.und)}</b></p>
  <p>${s.out?`뽑힌 사람: ${who(s.out)}`:'동점이라 아무도 못 뽑았어요!'}</p>${vl('투표',s.v1)}${vl('다시 투표',s.v2)}
  ${s.P.includes(ME)?`<p>${pt[ME]?`🎁 나는 <b>+${pt[ME]}점</b>`:'이번엔 점수 없음'}</p>`:''}</div>`+GAME.board(s);
 },
 points(s){const pt={};if(s.stopped)return pt;if(s.win==='under')pt[s.U]=3;else s.P.forEach(id=>{if(id!==s.U)pt[id]=1});return pt},
 record(s){if(s.stopped)return;const b=LS.get(TOOL+'_rec',{pts:{},done:[]});if(b.done.includes(s.g.id))return;const pt=GAME.points(s);Object.keys(pt).forEach(id=>b.pts[id]=(b.pts[id]||0)+pt[id]);b.done=[...b.done,s.g.id].slice(-60);LS.set(TOOL+'_rec',b)},
 recordHTML(){const b=LS.get(TOOL+'_rec',{pts:{}});const any=MEMBERS.some(m=>b.pts[m.id]);
  return `<div class="card"><h2>🏆 이 폰의 점수판</h2>${any?`<div class="score">${MEMBERS.map(m=>`<div>${avOf(m.id)}<b>${b.pts[m.id]||0}</b><span class="small">${esc(m.name)}</span></div>`).join('')}</div>`:'<div class="small">아직 점수가 없어요</div>'}</div>`},
 act(a,el,g,s,me){
  if(a==='peek'){showW=!showW;render();return}
  if(!me)return;const p=myP(g);
  if(a==='hint'&&s.ph==='hint'&&s.turn.id===ME){
   const t=(($('hin')||{}).value||'').trim().replace(/\s+/g,' ');
   if(!t)return setErr('힌트를 한마디 적어 주세요');
   const w=s.wordOf(ME);if(norm(t).includes(norm(w)))return setErr('앗! 내 단어가 들어 있어요 🙊');
   p.h[s.turn.r]=t.slice(0,20);commit();
  }
  else if(a==='vote'&&(s.ph==='vote'||s.ph==='revote')){p[s.ph==='revote'?'v2':'v']=el.dataset.id;commit()}
 }
};
