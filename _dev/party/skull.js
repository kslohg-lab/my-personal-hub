/*META
{"tool":"skull","title":"해골 블러핑","emoji":"💀","min":3,"max":4,
 "sub":"꽃 3장, 해골 1장. 몰래 내려놓고 큰소리치기!<br>눈치와 허세의 심리전 (스컬 방식)",
 "rules":["각자 <b>🌸 꽃 3장 + 💀 해골 1장</b>을 가지고 시작해요. 판이 시작되면 모두 한 장씩 몰래 엎어 놓아요.","내 차례엔 <b>한 장 더 엎어 놓거나</b>, \"꽃을 ○장 뒤집을 수 있다!\"고 <b>입찰</b>을 시작해요.","입찰이 시작되면 차례대로 <b>숫자를 올리거나 포기</b>해요. 끝까지 남은 사람이 도전자!","도전자는 <b>자기 카드부터 전부</b> 뒤집고, 그다음 다른 사람 카드를 위에서부터 골라 뒤집어요. 말한 수만큼 꽃만 나오면 성공 ⭐","해골이 나오면 실패 → 내 카드 한 장을 무작위로 잃어요. <b>두 번 성공</b>하거나 혼자 남으면 승리 🏆"],
 "ui":{},
 "cssvars":"--bg:#f5f2ee;--ink:#33281f;--sub:#7a6a5c;--line:#e2d8cc;--soft:#ece4da;--pri:#f4b6c2;--pri2:#c97c8c;--card:#fffdfa",
 "css":".pls .row{gap:8px}.stk{display:flex;gap:2px;align-items:flex-end}.dk{width:24px;height:24px;border-radius:50%;background:#7a5a44;border:2px solid #5a3e2c;display:flex;align-items:center;justify-content:center;font-size:13px}.dk.f{background:#ffe3ea;border-color:#f4a6b8}.dk.s{background:#333;border-color:#111}.wins{font-size:14px}.hand{font-size:13px;color:var(--sub)}.bidbox{text-align:center;font-size:22px;margin:4px 0}.nums{display:flex;flex-wrap:wrap;gap:6px;justify-content:center;margin-top:8px}.nums button{min-width:44px;height:44px;font-size:18px}.nums button.on{background:var(--pri);box-shadow:0 3px 0 var(--pri2)}.choice{display:flex;gap:10px}.choice button{flex:1;height:84px;font-size:20px;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:2px}.choice button span{font-size:32px}.fl{display:flex;flex-wrap:wrap;gap:6px;justify-content:center;margin-top:6px}.fl span{font-size:15px;padding:4px 8px;border-radius:10px;background:var(--soft)}.tgt{width:100%;margin:6px 0;display:flex;align-items:center;gap:10px;padding:10px 12px;font-size:17px}.tgt .stk{margin-left:auto}.out{opacity:.45}"}
META*/
let bidN=0;
const GAME={
 maps:['ini','nx'],
 reset(){bidN=0},
 setup(){return {seed:Math.floor(Math.random()*1e9)}},
 settings(){return `<div class="small">3~4명이 해요. 한 판 15~25분. 표정 관리가 제일 중요해요 😐</div>`},
 derive(g){
  const P=g.pl,D=Dof(g),stop=stopOf(g,D),sk=skipsOf(P,D);
  const byN={};movesOf(g,D).forEach(m=>(byN[m.n]=byN[m.n]||[]).push(m));
  const hand={},wins={},alive={};P.forEach(id=>{hand[id]={f:3,s:1};wins[id]=0;alive[id]=true});
  let k=0,st=0,ph='init',n=0,stacks={},turn=0,bid=0,holder='',passed={},ch='',flipped={},flog=[],need=0,res=null,winner='',lastTxt='',hist=[];
  const live=()=>P.filter(id=>alive[id]);
  const nextFrom=(i,skip)=>{for(let d=1;d<=P.length;d++){const j=(i+d)%P.length,id=P[j];if(alive[id]&&!(skip&&skip(id)))return j}return i};
  const total=()=>live().reduce((a,id)=>a+(stacks[id]||[]).length,0);
  const free=(id,t)=>hand[id][t]-(stacks[id]||[]).filter(x=>x===t).length;
  const startFlip=()=>{ph='flip';ch=holder;flipped={};flog=[];P.forEach(id=>flipped[id]=0);
   const own=stacks[ch]||[];flipped[ch]=own.length;own.slice().reverse().forEach(t=>flog.push({id:ch,t}));
   if(own.includes('s'))return finish(false,ch);need=bid-own.length;if(need<=0)finish(true)};
  const finish=(ok,skOwner)=>{
   ph='res';const r={k,ch,bid,ok,skOwner:skOwner||'',flog:flog.slice(),lost:''};
   if(ok){wins[ch]++;lastTxt=`${nameOf(ch)}님 도전 성공!`;if(wins[ch]>=2)winner=ch;st=P.indexOf(ch)}
   else{const rr=rng(g.seed+k*131+7),pool=[...Array(hand[ch].f).fill('f'),...Array(hand[ch].s).fill('s')],lose=pool[Math.floor(rr()*pool.length)];
    hand[ch][lose]--;r.lost=lose;if(hand[ch].f+hand[ch].s===0)alive[ch]=false;
    st=alive[skOwner]?P.indexOf(skOwner):nextFrom(P.indexOf(ch));
    if(live().length===1)winner=live()[0]}
   res=r;hist.push(r);
  };
  const actor=()=>ph==='flip'?ch:P[turn];
  const apply=(id,mv)=>{
   if(id!==actor())return false;const [c,a]=mv.split('|');
   if(ph==='add'){
    if(c==='a'&&(a==='f'||a==='s')&&free(id,a)>0){stacks[id].push(a);lastTxt=`${nameOf(id)}님이 한 장 더 놓았어요`;turn=nextFrom(turn);return true}
    if(c==='b'){const v=+a;if(v>=1&&v<=total()){bid=v;holder=id;passed={};ph='bid';lastTxt=`${nameOf(id)}님 입찰 시작: ${v}장`;if(v>=total())startFlip();else turn=nextFrom(turn,x=>passed[x]);return true}}
    return false}
   if(ph==='bid'){
    if(c==='b'){const v=+a;if(v>bid&&v<=total()){bid=v;holder=id;lastTxt=`${nameOf(id)}님 ${v}장!`;if(v>=total())startFlip();else turn=nextFrom(turn,x=>passed[x]);return true}return false}
    if(c==='x'){passed[id]=1;lastTxt=`${nameOf(id)}님 포기`;const left=live().filter(x=>!passed[x]);if(left.length===1&&left[0]===holder)startFlip();else turn=nextFrom(turn,x=>passed[x]);return true}
    return false}
   if(ph==='flip'&&c==='f'){const s=stacks[a];if(!s||a===ch||flipped[a]>=s.length)return false;const t=s[s.length-1-flipped[a]];flipped[a]++;flog.push({id:a,t});
    if(t==='s')finish(false,a);else{need--;if(need<=0)finish(true)}return true}
   return false;
  };
  const auto=id=>{
   if(ph==='add')return free(id,'f')>0?'a|f':free(id,'s')>0?'a|s':'b|1';
   if(ph==='bid')return 'x';
   if(ph==='flip'){const o=live().find(x=>x!==ch&&flipped[x]<(stacks[x]||[]).length);return o?'f|'+o:''}
   return '';
  };
  for(let guard=0;guard<2000&&!winner;guard++){
   if(ph==='init'){
    const L=live(),miss=L.filter(id=>{const v=(D(id).ini||{})[k];return !((v==='f'||v==='s')&&hand[id][v]>0)&&!sk.has('i:'+id+':'+k)});
    if(miss.length){const b={g,P,D,ph:'init',k,missing:miss,hand,wins,alive,stacks:{},r:'i'+k,hist,lastTxt};return stop?{...b,ph:'end',stopped:stop}:b}
    stacks={};L.forEach(id=>{const v=(D(id).ini||{})[k];stacks[id]=[(v==='f'||v==='s')&&hand[id][v]>0?v:(hand[id].f>0?'f':'s')]});
    ph='add';turn=alive[P[st]]?st:nextFrom(st);bid=0;holder='';passed={};res=null;lastTxt='';continue}
   if(ph==='res'){if(anyFlag(P,D,'nx',k)){k++;ph='init';continue}break}
   const a=actor(),ms=(byN[n]||[]).filter(m=>m.id===a);let done=false;
   for(const m of ms)if(apply(m.id,m.mv)){done=true;break}
   if(!done&&sk.has('t:'+a+':'+n)){const mv=auto(a);if(mv&&apply(a,mv))done=true}
   if(!done)break;n++;
  }
  const base={g,P,D,k,n,ph,hand,wins,alive,stacks,turn,bid,holder,passed,ch,flipped,flog,need,res,lastTxt,hist,total:total(),actor:actor(),r:n+':'+ph+':'+k,free};
  if(winner)return {...base,ph:'end',winner};
  if(stop)return {...base,ph:'end',stopped:stop};
  return base;
 },
 buzz(s){if(s.ph==='end')return false;if(s.ph==='init')return s.missing.includes(ME);if(s.ph==='res')return false;return s.actor===ME},
 discs(n,showTypes){return `<span class="stk">${(showTypes||Array(n).fill('')).map(t=>`<span class="dk ${t}">${t==='f'?'🌸':t==='s'?'💀':''}</span>`).join('')}</span>`},
 board(s){
  return `<div class="card pls">${s.P.map((id,i)=>{const st=s.stacks[id]||[],fl=s.flipped&&s.ph==='flip'?s.flipped[id]||0:0,h=s.hand[id];
   const shown=st.map((t,j)=>j>=st.length-fl?t:'');
   return `<div class="row${s.alive[id]?'':' out'}"><div class="av">${avOf(id)}</div><div class="nm">${esc(nameOf(id))}${s.ph!=='init'&&s.ph!=='res'&&s.actor===id?' <span class="tag turn">차례</span>':''}${s.holder===id&&s.ph!=='add'&&s.ph!=='init'?' <span class="tag">입찰 '+s.bid+'</span>':''}${s.passed&&s.passed[id]&&s.ph==='bid'?' <span class="small">포기</span>':''}<div class="hand">${s.alive[id]?`카드 ${h.f+h.s}장`:'탈락 😵'} <span class="wins">${'⭐'.repeat(s.wins[id])}</span></div></div>${GAME.discs(st.length,shown)}</div>`}).join('')}</div>`;
 },
 play(s,key,me){
  const h0=s.hand[ME]||{f:0,s:0},mySt=s.stacks[ME]||[];
  let h='';
  if(s.ph==='init'){
   const mine=(s.D(ME).ini||{})[s.k];
   h+=`<div class="card"><h2>🎴 ${s.k+1}번째 판: 첫 카드를 몰래 엎어 놓아요</h2>`;
   if(me&&s.alive[ME]&&!(mine==='f'||mine==='s'))h+=`<div class="choice"><button data-act="ini" data-t="f" ${h0.f>0?'':'disabled'}><span>🌸</span>꽃 (${h0.f})</button><button data-act="ini" data-t="s" ${h0.s>0?'':'disabled'}><span>💀</span>해골 (${h0.s})</button></div><div class="small" style="text-align:center;margin-top:6px">다른 사람이 내 폰을 못 보게 조심! 🙈</div>`;
   else if(me&&s.alive[ME])h+=`<div style="text-align:center;font-size:18px">✅ 놓았어요 (${mine==='f'?'🌸':'💀'}) <button class="chip" data-act="unini">바꾸기</button></div>`;
   h+=`${s.missing.map(id=>`<div class="row"><div class="av">${avOf(id)}</div><div class="nm">${esc(nameOf(id))}</div><span class="tag turn">고르는 중 🤔</span></div>`).join('')}</div>`;
   if(me)h+=waitBtn(key,40000,s.missing,id=>'i:'+id+':'+s.k);
   return h+GAME.board(s);
  }
  if(s.ph==='res'){
   const r=s.res;
   h+=`<div class="card res"><div class="em">${r.ok?'🌸':'💀'}</div><div class="t">${esc(nameOf(r.ch))}님 ${r.bid}장 도전 ${r.ok?'성공! ⭐':'실패…'}</div>
   <div class="fl">${r.flog.map(x=>`<span>${avOf(x.id)} ${x.t==='f'?'🌸':'💀'}</span>`).join('')}</div>
   ${r.ok?'':`<p>${r.skOwner===r.ch?'자기 해골을 만났어요 😅':esc(nameOf(r.skOwner))+'님의 해골!'}<br>${esc(nameOf(r.ch))}님이 ${r.ch===ME?`<b>${r.lost==='f'?'🌸 꽃':'💀 해골'}</b>을`:'카드 한 장을'} 잃었어요${s.alive[r.ch]?'':' → 탈락 😵'}</p>`}
   ${me?`<button class="big" data-act="next">다음 판 ▶</button>`:''}</div>`;
   return h+GAME.board(s);
  }
  h+=`<div class="card" style="text-align:center"><div class="small">${s.k+1}번째 판 · 놓인 카드 ${s.total}장${s.lastTxt?' · '+esc(s.lastTxt):''}</div>${s.ph!=='add'?`<div class="bidbox">🔨 ${esc(nameOf(s.holder))}님 <b>${s.bid}장</b></div>`:''}</div>`;
  const myTurn=me&&s.actor===ME;
  if(myTurn&&s.ph==='add'){
   const lo=1;if(bidN<lo||bidN>s.total)bidN=lo;
   h+=`<div class="card"><h2>🙋 내 차례!</h2><div class="choice"><button data-act="add" data-t="f" ${s.free(ME,'f')>0?'':'disabled'}><span>🌸</span>꽃 놓기 (${s.free(ME,'f')})</button><button data-act="add" data-t="s" ${s.free(ME,'s')>0?'':'disabled'}><span>💀</span>해골 놓기 (${s.free(ME,'s')})</button></div>
   <div class="lbl">또는 입찰 시작: 꽃을 몇 장 뒤집을 수 있나요?</div><div class="nums">${[...Array(s.total)].map((_,i)=>`<button class="${bidN===i+1?'on':''}" data-act="bn" data-v="${i+1}">${i+1}</button>`).join('')}</div><button class="big" data-act="bid">🔨 ${bidN}장 입찰!</button></div>`;
  }else if(myTurn&&s.ph==='bid'){
   if(bidN<=s.bid||bidN>s.total)bidN=s.bid+1;
   h+=`<div class="card"><h2>🔨 올릴까요, 포기할까요?</h2><div class="nums">${[...Array(s.total-s.bid)].map((_,i)=>{const v=s.bid+1+i;return `<button class="${bidN===v?'on':''}" data-act="bn" data-v="${v}">${v}</button>`}).join('')}</div><div class="two"><button class="big" data-act="bid">${bidN}장!</button><button class="big gray" data-act="pass">포기</button></div></div>`;
  }else if(myTurn&&s.ph==='flip'){
   h+=`<div class="card"><h2>🌸 꽃 ${s.need}장 더! 누구 카드를 뒤집을까요?</h2><div class="small" style="text-align:center">내 카드는 다 뒤집었어요. 다른 사람 카드는 맨 위부터 뒤집혀요</div><div class="fl">${s.flog.map(x=>`<span>${avOf(x.id)} ${x.t==='f'?'🌸':'💀'}</span>`).join('')}</div>
   ${s.P.filter(id=>id!==ME&&s.alive[id]&&(s.stacks[id]||[]).length>s.flipped[id]).map(id=>`<button class="tgt" data-act="flip" data-id="${id}">${who(id)} <span class="small">남은 ${(s.stacks[id]||[]).length-s.flipped[id]}장</span>${GAME.discs((s.stacks[id]||[]).length-s.flipped[id])}</button>`).join('')}</div>`;
  }else{
   h+=`<div class="card" style="text-align:center;font-size:18px"><span class="wait">⏳</span> ${esc(nameOf(s.actor))}님 ${s.ph==='flip'?'뒤집는 중':s.ph==='bid'?'입찰 고민 중':'차례'}${s.ph==='flip'?`<div class="fl">${s.flog.map(x=>`<span>${avOf(x.id)} ${x.t==='f'?'🌸':'💀'}</span>`).join('')}</div>`:''}</div>`;
   if(me)h+=waitBtn(key,60000,[s.actor],id=>'t:'+id+':'+s.n);
  }
  if(me&&s.alive[ME])h+=`<div class="card"><h2>🤫 내 카드</h2><div class="small">손에 남은 것: 🌸 ${s.free(ME,'f')} · 💀 ${s.free(ME,'s')} · 내가 놓은 것(아래→위): ${mySt.map(t=>t==='f'?'🌸':'💀').join(' ')||'-'}</div></div>`;
  return h+GAME.board(s);
 },
 end(s){
  return `<div class="card res"><div class="em">${s.stopped?'🛑':'🏆'}</div><div class="t">${s.winner?esc(nameOf(s.winner))+'님 승리!':'게임 기록'}</div>
  ${s.P.map(id=>`<div class="row"><div class="av">${avOf(id)}</div><div class="nm">${esc(nameOf(id))}</div><span>${'⭐'.repeat(s.wins[id])||'-'}</span></div>`).join('')}</div>
  <div class="card"><h2>📜 도전 기록</h2>${s.hist.map(r=>`<div class="row" style="display:block">${esc(nameOf(r.ch))} ${r.bid}장 ${r.ok?'⭐ 성공':'💀 실패'} <span class="small">${r.flog.map(x=>avOf(x.id)+(x.t==='f'?'🌸':'💀')).join(' ')}</span></div>`).join('')||'<div class="small">없음</div>'}</div>`;
 },
 record(s){if(s.stopped||!s.winner)return;const b=LS.get(TOOL+'_rec',{wins:{},done:[]});if(b.done.includes(s.g.id))return;b.wins[s.winner]=(b.wins[s.winner]||0)+1;b.done=[...b.done,s.g.id].slice(-40);LS.set(TOOL+'_rec',b)},
 recordHTML(){const b=LS.get(TOOL+'_rec',{wins:{}});const any=MEMBERS.some(m=>b.wins[m.id]);return `<div class="card"><h2>🏆 이 폰에서 본 승리 횟수</h2>${any?`<div class="score">${MEMBERS.map(m=>`<div>${avOf(m.id)}<b>${b.wins[m.id]||0}</b><span class="small">${esc(m.name)}</span></div>`).join('')}</div>`:'<div class="small">아직 기록이 없어요</div>'}</div>`},
 act(a,el,g,s,me){
  if(!me)return;const p=myP(g);
  if(a==='next'&&s.ph==='res'){p.nx[s.k]=1;commit();return}
  if(a==='ini'&&s.ph==='init'){p.ini[s.k]=el.dataset.t;commit()}
  else if(a==='unini'&&s.ph==='init'){delete p.ini[s.k];commit()}
  else if(a==='bn'){bidN=+el.dataset.v;render()}
  else if(s.actor!==ME)return;
  else if(a==='add'&&s.ph==='add')pushMove(g,s.n,'a|'+el.dataset.t);
  else if(a==='bid'&&(s.ph==='add'||s.ph==='bid')){const v=bidN;bidN=0;pushMove(g,s.n,'b|'+v)}
  else if(a==='pass'&&s.ph==='bid')pushMove(g,s.n,'x');
  else if(a==='flip'&&s.ph==='flip')pushMove(g,s.n,'f|'+el.dataset.id);
 }
};
