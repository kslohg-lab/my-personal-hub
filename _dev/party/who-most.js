/*META
{"tool":"who-most","title":"누가 제일?","emoji":"👑","min":3,
 "sub":"\"우리 가족 중 누가 제일 ○○할까?\"<br>각자 몰래 투표하고 결과를 공개해요!",
 "rules":["질문이 나오면 우리 가족 중 <b>가장 어울리는 사람</b>에게 몰래 투표해요. 나 자신도 뽑을 수 있어요!","모두 투표하면 공개! 가장 많이 뽑힌 사람은 그 질문의 <b>칭호</b>를 받아요 👑","가장 많이 뽑힌 사람에게 투표했으면 <b>+1점</b> (가족 마음을 맞혔어요)","끝나면 각자 받은 칭호와 점수를 보여줘요.","장난은 좋지만 상처 주는 말은 하지 않기로 약속해요 🤙"],
 "ui":{"n":10},
 "cssvars":"--bg:#fff8e6;--ink:#5a4520;--sub:#93784a;--line:#f0dfb2;--soft:#fdeec4;--pri:#ffd25a;--pri2:#d6a020;--card:#fffdf6",
 "css":".vote{display:grid;grid-template-columns:1fr 1fr;gap:10px}.vote button{height:78px;font-size:19px}.vote button.on{background:var(--pri);box-shadow:0 4px 0 var(--pri2)}.vr{display:flex;align-items:center;gap:10px;padding:8px 4px}.vr .bars{flex:1;height:26px;background:#f5ecd2;border-radius:13px;overflow:hidden}.vr .bars i{display:block;height:100%;background:linear-gradient(90deg,#ffd25a,#ff9a3c);border-radius:13px}.vr .c{min-width:28px;text-align:right;font-size:18px}.vr .who2{min-width:84px;font-size:16px}.crown{font-size:22px}.ttl{display:inline-block;background:#fff3c4;border:2px solid #f0d27a;border-radius:99px;padding:3px 10px;margin:3px;font-size:14px}"}
META*/
const QS=('가장 늦잠을 많이 자는 사람은?|늦잠왕 😴;가장 많이 먹는 먹보는?|먹보왕 🍗;웃음이 제일 많은 사람은?|웃음보따리 😆;노래를 제일 잘하는 사람은?|가수왕 🎤;방이 제일 지저분한 사람은?|어질러왕 🧦;휴대폰을 제일 오래 보는 사람은?|폰순이·폰돌이 📱;방귀를 제일 잘 뀌는 사람은?|방귀대장 💨;무서운 영화를 제일 못 보는 사람은?|겁쟁이 👻;깜빡깜빡 잘 잊어버리는 사람은?|깜빡왕 🤔;요리를 제일 잘하는 사람은?|요리왕 🍳;화나면 제일 무서운 사람은?|호랑이 🐯;애교가 제일 많은 사람은?|애교쟁이 🥰;운동을 제일 잘하는 사람은?|운동왕 ⚽;길을 제일 잘 잃어버리는 사람은?|길치 🧭;부자가 될 것 같은 사람은?|미래 부자 💰;유튜버가 되면 대박 날 사람은?|인기 유튜버 🎬;좀비 세상에서 제일 오래 살아남을 사람은?|생존왕 🧟;무인도에 꼭 데려가고 싶은 사람은?|든든이 🏝️;비밀을 제일 잘 지키는 사람은?|비밀지킴이 🤐;거짓말을 제일 못하는 사람은?|정직이 😇;쇼핑을 제일 좋아하는 사람은?|쇼핑왕 🛍️;게임을 제일 잘하는 사람은?|게임왕 🎮;잠꼬대를 할 것 같은 사람은?|잠꼬대왕 💤;귀가 제일 얇은(잘 넘어가는) 사람은?|팔랑귀 👂;제일 꼼꼼한 사람은?|꼼꼼이 🔍;제일 잘 우는 사람은?|울보 😢;간식을 몰래 먹을 것 같은 사람은?|간식 도둑 🍪;제일 부지런한 사람은?|부지런이 🐝;잔소리를 제일 많이 하는 사람은?|잔소리왕 📢;동물을 제일 좋아하는 사람은?|동물 친구 🐶;제일 멋을 많이 부리는 사람은?|멋쟁이 😎;외계인을 만나면 제일 먼저 말 걸 사람은?|용감이 👽;제일 수다스러운 사람은?|수다왕 🗣️;제일 잘 삐지는 사람은?|삐침왕 😤;제일 착한 사람은?|천사 😇;제일 엉뚱한 사람은?|엉뚱이 🤪;제일 빨리 잠드는 사람은?|기절왕 🛌;숙제(일)를 미루다 막판에 하는 사람은?|벼락치기왕 ⏰;가족 사진 찍을 때 눈 감을 사람은?|눈감기왕 📸;텔레비전 리모컨을 제일 오래 잡는 사람은?|리모컨 주인 📺;제일 기억력이 좋은 사람은?|기억왕 🧠;매운 음식을 제일 잘 먹는 사람은?|매운맛왕 🌶️;단 걸 제일 좋아하는 사람은?|달콤이 🍭;제일 힘센 사람은?|천하장사 💪;제일 잘 웃겨 주는 사람은?|개그왕 🤡;나중에 제일 유명해질 사람은?|스타 ⭐;제일 정리정돈을 잘하는 사람은?|정리왕 🧹;제일 겁이 없는 사람은?|용감왕 🦁;가족을 제일 잘 챙기는 사람은?|챙김이 🤗;아침에 제일 먼저 일어나는 사람은?|일찍이 🐓;제일 잘 자는(코 고는) 사람은?|코골이왕 😪;책을 제일 많이 읽는 사람은?|책벌레 📚;소원 세 개를 받으면 제일 엉뚱하게 쓸 사람은?|엉뚱 소원왕 🧞;우리 집 대장은?|우리 집 대장 👑').split(';').map(x=>{const [q,t]=x.split('|');return {q,t}});
const GAME={
 maps:['v','nx'],
 setup(n,id,ui){
  const N=ui.n||10,recent=LS.get(TOOL+'_recent',[]);
  let pool=[...QS.keys()].filter(i=>!recent.includes(QS[i].q));if(pool.length<N)pool=[...QS.keys()];
  const q=shuffle(pool).slice(0,N);LS.set(TOOL+'_recent',[...recent,...q.map(i=>QS[i].q)].slice(-60));
  return {q};
 },
 settings(ui){return `<div class="lbl">질문 수</div><div class="chips">${[6,10,15].map(n=>opt('n',n,n+'개')).join('')}</div>`},
 derive(g){
  const P=g.pl,D=Dof(g),stop=stopOf(g,D),sk=skipsOf(P,D),score={},titles={};P.forEach(id=>{score[id]=0;titles[id]=[]});
  const hist=[],N=g.q.length,base=()=>({g,P,D,N,score,titles,hist}),halt=o=>stop?{...base(),ph:'end',stopped:stop}:o;
  for(let r=0;r<N;r++){
   const Q=QS[g.q[r]]||QS[0];
   const votes=P.map(id=>[id,(D(id).v||{})[r]]).filter(([a,b])=>b&&P.includes(b));
   const missing=P.filter(id=>!votes.some(x=>x[0]===id)&&!sk.has('v:'+id+':'+r));
   if(missing.length)return halt({...base(),ph:'vote',r,Q,missing,votes});
   const c={};votes.forEach(([a,b])=>c[b]=(c[b]||0)+1);
   const mx=Math.max(0,...Object.values(c)),top=mx?P.filter(id=>c[id]===mx):[];
   const pts={};votes.forEach(([a,b])=>{if(top.includes(b))pts[a]=1});
   if(!anyFlag(P,D,'nx',r))return halt({...base(),ph:'reveal',r,Q,votes,c,top,pts});
   P.forEach(id=>score[id]+=pts[id]||0);top.forEach(id=>titles[id].push(Q.t));hist.push({r,Q,top,c});
  }
  return {...base(),ph:'end'};
 },
 buzz(s){return s.ph==='vote'&&s.missing.includes(ME)},
 play(s,key,me){
  let h=`<div class="small" style="text-align:center">질문 ${s.r+1} / ${s.N}</div><div class="card q"><span class="k">👑 우리 가족 중에서</span>${esc(s.Q.q)}</div>`;
  if(s.ph==='vote'){
   const my=(s.D(ME).v||{})[s.r];
   if(me){
    h+=`<div class="card"><h2>🗳️ 몰래 투표해요${my?' (다시 누르면 바꿀 수 있어요)':''}</h2><div class="vote">${s.P.map(id=>`<button class="${my===id?'on':''}" data-act="vote" data-id="${id}">${who(id)}${id===ME?'<br><span class="small">(나)</span>':''}</button>`).join('')}</div>
    ${my?`<div class="small" style="text-align:center;margin-top:10px">✅ ${esc(nameOf(my))}님에게 투표했어요</div>`:''}</div>`;
   }
   h+=`<div class="card"><h2>⏳ 투표 ${s.P.length-s.missing.length}/${s.P.length}</h2>${s.P.map(id=>`<div class="row"><div class="av">${avOf(id)}</div><div class="nm">${esc(nameOf(id))}</div><span class="tag${s.missing.includes(id)?' turn':' on'}">${s.missing.includes(id)?'고민 중 🤔':'투표 완료'}</span></div>`).join('')}</div>`;
   if(me)h+=waitBtn(key,40000,s.missing,id=>'v:'+id+':'+s.r);
  }else{
   const mx=Math.max(1,...Object.values(s.c));
   h+=`<div class="card res"><div class="em">👑</div><div class="t">${s.top.map(nameOf).map(esc).join(', ')}</div><p><span class="ttl">${esc(s.Q.t)}</span></p>${s.pts[ME]?'<p>🎯 나도 맞혔어요! +1</p>':''}</div>
   <div class="card"><h2>📊 투표 결과</h2>${s.P.slice().sort((a,b)=>(s.c[b]||0)-(s.c[a]||0)).map(id=>`<div class="vr"><span class="who2">${s.top.includes(id)?'<span class="crown">👑</span>':''}${who(id)}</span><span class="bars"><i style="width:${(s.c[id]||0)/mx*100}%"></i></span><span class="c">${s.c[id]||0}</span></div>`).join('')}
   <div class="small" style="margin-top:8px">${s.votes.map(([a,b])=>`${esc(nameOf(a))}→${esc(nameOf(b))}`).join(' · ')}</div>
   ${me?`<button class="big" data-act="next">${s.r+1<s.N?'다음 질문 ▶':'결과 보기 🏆'}</button>`:''}</div>`;
  }
  return h;
 },
 end(s){
  const order=s.P.slice().sort((a,b)=>s.score[b]-s.score[a]||s.titles[b].length-s.titles[a].length);
  let h=`<div class="card"><h2>🏅 받은 칭호</h2>${order.map(id=>`<div class="row" style="align-items:flex-start"><div class="av">${avOf(id)}</div><div class="nm">${esc(nameOf(id))}<div>${s.titles[id].map(t=>`<span class="ttl">${esc(t)}</span>`).join('')||'<span class="small">칭호 없음</span>'}</div></div></div>`).join('')}</div>`;
  const mx=s.score[order[0]]||0;
  h+=`<div class="card res"><div class="em">🎯</div><div class="t">${mx?order.filter(id=>s.score[id]===mx).map(nameOf).map(esc).join(', ')+'님이 가족 마음을 제일 잘 알아요!':'다음엔 가족 마음을 맞혀 봐요!'}</div>${order.map(id=>`<div class="row"><div class="av">${avOf(id)}</div><div class="nm">${esc(nameOf(id))}</div><b>${s.score[id]}점</b></div>`).join('')}</div>`;
  return h;
 },
 act(a,el,g,s,me){
  if(!me)return;const p=myP(g);
  if(a==='vote'&&s.ph==='vote'){p.v[s.r]=el.dataset.id;commit()}
  else if(a==='next'&&s.ph==='reveal'){p.nx[s.r]=1;commit()}
 }
};
