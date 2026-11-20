/*META
{"tool":"same-mind","title":"이심전심","emoji":"💞","min":2,
 "sub":"같은 질문에 각자 몰래 답해요<br>다른 사람과 답이 같으면 점수! 마음이 통했나요?",
 "rules":["질문이 나오면 각자 몰래 <b>짧은 답</b>을 적어요. (예: \"빨간색 과일 하나!\" → 사과)","모두 내면 답이 공개돼요. <b>나와 같은 답을 쓴 사람 수</b>만큼 점수! (3명이 같으면 각자 +2)","모두 똑같은 답이면 🧠 텔레파시 보너스 +1","\"딸기\"와 \"딸기요\"처럼 같은 뜻인데 따로 나왔으면, 두 답을 차례로 눌러 묶을 수 있어요.","정답은 없어요. <b>다른 가족이 뭐라고 쓸지</b> 생각해서 쓰는 게 이기는 방법이에요 😉"],
 "ui":{"n":10},
 "cssvars":"--bg:#fff0f5;--ink:#5a2a40;--sub:#9a6a80;--line:#f3d0dd;--soft:#ffe2ec;--pri:#ffb3c8;--pri2:#e0809c;--card:#fffafc",
 "css":".grp{width:100%;text-align:left;padding:12px 14px;margin:8px 0;display:flex;align-items:center;gap:10px;font-size:20px}.grp .tx{flex:1;word-break:break-all}.grp .pp{font-size:15px;color:var(--sub)}.grp .pt{font-size:18px;color:#d0457a}.grp.sel{background:#ffe08a;box-shadow:0 4px 0 #d6b04a}.grp.solo{opacity:.85}.mini{display:flex;justify-content:center;gap:12px;font-size:14px;color:var(--sub);margin:2px 0 6px}"}
META*/
const QS=('빨간색 과일 하나!|바다에 사는 동물 하나!|1부터 10 중 숫자 하나!|치킨은 무슨 치킨?|라면 하면 떠오르는 라면 이름은?|제일 좋아하는 계절은?|놀이공원에서 제일 먼저 탈 놀이기구는?|가족 여행 가고 싶은 곳은?|생일 선물로 받고 싶은 것은?|공룡 이름 하나!|겨울 하면 떠오르는 것은?|편의점에서 꼭 사는 것은?|학교 과목 중 하나!|아침밥으로 먹고 싶은 것은?|갖고 싶은 초능력 하나!|무인도에 가져갈 물건 하나!|우리 집 냉장고에 꼭 있는 것은?|엄마가 제일 자주 하는 말은?|아빠가 제일 좋아하는 음식은?|크리스마스 하면 떠오르는 것은?|비 오는 날 먹고 싶은 음식은?|가장 무서운 동물은?|색깔 하나!|분식집 메뉴 하나!|아이스크림 맛 하나!|과자 이름 하나!|운동 종목 하나!|악기 하나!|동화 주인공 하나!|제일 좋아하는 요일은?|주말에 제일 하고 싶은 것은?|캠핑 가면 꼭 먹어야 하는 것은?|제일 귀여운 동물은?|피자 토핑 하나!|나라 이름 하나!|곤충 하나!|꽃 이름 하나!|직업 하나!|하늘을 나는 것 하나!|탈것 하나!|방학 때 꼭 하고 싶은 것은?|소풍 도시락 메뉴는?|김밥에 꼭 들어가야 하는 재료는?|여름 간식 하나!|겨울 간식 하나!|보드게임 하나!|제일 싫어하는 채소는?|제일 좋아하는 반찬은?|잠들기 전에 하는 일은?|보물상자 안에 들어 있을 것은?|슈퍼히어로 하나!|산타에게 받고 싶은 선물은?|돈이 많으면 제일 먼저 살 것은?|우리 가족 외식 메뉴 1위는?|빵 이름 하나!|음료수 하나!|학교 급식 최고 메뉴는?|동물원에서 제일 먼저 볼 동물은?|놀이터 놀이기구 하나!|무지개 색 중 하나!|가위·바위·보 중 하나!|1부터 5 중 숫자 하나!|하얀색 하면 떠오르는 것은?|노란색 음식 하나!|과일 하나!|집에서 제일 편한 곳은?|우리 집 하면 떠오르는 것은?|일요일 아침 하면 떠오르는 것은?|여름 바다에 가져갈 것 하나!|목욕할 때 필요한 것 하나!|문구점에서 살 것 하나!|마트에서 꼭 사는 것은?|떡볶이랑 같이 먹을 것은?|외계인에게 보여주고 싶은 것은?|부엌에 있는 물건 하나!|동그란 물건 하나!|맛있는 소리가 나는 음식은?|가족이 다 같이 보는 TV 프로그램 종류는?|친구 생일 선물로 줄 것은?|추석 하면 떠오르는 것은?|설날 하면 떠오르는 것은?|비 오는 날 필요한 것은?|가방 속에 꼭 있는 것은?|한 글자 단어 하나!').split('|');
let selK=null;
const GAME={
 maps:['a','mg','nx'],
 reset(){selK=null},
 setup(n,id,ui){
  const N=ui.n||10, recent=LS.get(TOOL+'_recent',[]);
  let pool=[...QS.keys()].filter(i=>!recent.includes(QS[i]));if(pool.length<N)pool=[...QS.keys()];
  const q=shuffle(pool).slice(0,N);LS.set(TOOL+'_recent',[...recent,...q.map(i=>QS[i])].slice(-60));
  return {q};
 },
 settings(ui){return `<div class="lbl">질문 수</div><div class="chips">${[6,10,15].map(n=>opt('n',n,n+'개')).join('')}</div>`},
 derive(g){
  const P=g.pl,D=Dof(g),stop=stopOf(g,D),sk=skipsOf(P,D),score={};P.forEach(id=>score[id]=0);
  const hist=[],N=g.q.length,halt=o=>stop?{g,P,D,N,ph:'end',score,hist,stopped:stop}:o;
  for(let r=0;r<N;r++){
   const q=QS[g.q[r]]||'?';
   const ans=P.map(id=>({id,t:(D(id).a||{})[r]})).filter(x=>typeof x.t==='string'&&x.t);
   const missing=P.filter(id=>!ans.some(x=>x.id===id)&&!sk.has('a:'+id+':'+r));
   if(missing.length)return halt({g,P,D,N,ph:'answer',r,q,ans,missing,score,hist});
   const par={},f=k=>{let n=0;while(par[k]&&par[k]!==k&&n++<50)k=par[k];return k};
   ans.forEach(x=>{const k=norm(x.t);if(!par[k])par[k]=k});
   P.forEach(id=>((D(id).mg||{})[r]||[]).forEach(s=>{const [a,b]=String(s).split('|');if(par[a]&&par[b]){const A=f(a),B=f(b);if(A!==B)par[B]=A}}));
   const gm={};ans.forEach(x=>{const k=f(norm(x.t));(gm[k]=gm[k]||{k,ids:[],texts:[]}).ids.push(x.id);if(!gm[k].texts.includes(x.t))gm[k].texts.push(x.t)});
   const G=Object.values(gm).sort((a,b)=>b.ids.length-a.ids.length);
   const pts={};G.forEach(gr=>gr.ids.forEach(id=>pts[id]=gr.ids.length-1));
   const all=G.length===1&&ans.length===P.length&&P.length>1;if(all)P.forEach(id=>pts[id]=(pts[id]||0)+1);
   if(!anyFlag(P,D,'nx',r))return halt({g,P,D,N,ph:'reveal',r,q,G,pts,all,score,hist});
   P.forEach(id=>score[id]+=pts[id]||0);hist.push({r,q,G,pts,all});
  }
  return {g,P,D,N,ph:'end',score,hist};
 },
 buzz(s){return s.ph==='answer'&&s.missing.includes(ME)},
 play(s,key,me){
  const mini=`<div class="mini">${s.P.map(id=>`<span>${avOf(id)} ${s.score[id]}</span>`).join('')}</div>`;
  let h=`<div class="small" style="text-align:center">질문 ${s.r+1} / ${s.N}</div>${mini}<div class="card q"><span class="k">💞 모두에게 같은 질문</span>${esc(s.q)}</div>`;
  if(s.ph==='answer'){
   const myA=(s.D(ME).a||{})[s.r];
   if(me&&!(typeof myA==='string'&&myA))h+=`<div class="card"><h2>✍️ 내 답 (다른 가족이 뭐라고 쓸까?)</h2><input type="text" id="ans" maxlength="12" placeholder="짧게 한두 단어" autocomplete="off" data-enter="send"><div class="err">${esc(errMsg)}</div><button class="big" data-act="send">답 내기 ✋</button></div>`;
   else if(me)h+=`<div class="card" style="text-align:center"><div style="font-size:19px">✅ 내 답: <b>${esc(myA)}</b></div><button class="big gray" data-act="edit">✏️ 고치기</button></div>`;
   h+=`<div class="card"><h2>⏳ 답 내는 중</h2>${s.P.map(id=>`<div class="row"><div class="av">${avOf(id)}</div><div class="nm">${esc(nameOf(id))}</div><span class="tag${s.missing.includes(id)?' turn':' on'}">${s.missing.includes(id)?'생각 중 🤔':'냈어요'}</span></div>`).join('')}</div>`;
   if(me)h+=waitBtn(key,40000,s.missing,id=>'a:'+id+':'+s.r);
  }else{
   const myM=((s.D(ME).mg||{})[s.r]||[]).length;
   h+=`<div class="card"><h2>🎉 답 공개!</h2>${s.all?`<div class="res"><div class="em" style="font-size:44px">🧠</div><div class="t" style="font-size:22px">텔레파시! 모두 같은 답 (+1 보너스)</div></div>`:''}
   ${s.G.map(gr=>`<button class="grp${selK===gr.k?' sel':''}${gr.ids.length<2?' solo':''}" data-act="pick" data-k="${esc(gr.k)}"><span class="tx">${gr.texts.map(esc).join(' / ')}<br><span class="pp">${gr.ids.map(who).join(' ')}</span></span><span class="pt">${gr.ids.length>1?'+'+(gr.ids.length-1+(s.all?1:0)):'0'}</span></button>`).join('')}
   <div class="small" style="text-align:center;margin-top:6px">${selK?'👉 같은 뜻인 다른 답을 누르면 묶여요 (다시 누르면 취소)':'같은 뜻인데 따로 나온 답이 있으면 두 답을 차례로 눌러 묶어요'}</div>
   ${me&&myM?`<button class="big gray" data-act="unmerge">↩️ 내가 묶은 것 풀기</button>`:''}
   ${me?`<button class="big" data-act="next">${s.r+1<s.N?'다음 질문 ▶':'결과 보기 🏆'}</button>`:''}</div>`;
  }
  return h;
 },
 end(s){
  const order=s.P.slice().sort((a,b)=>s.score[b]-s.score[a]),mx=s.score[order[0]];
  let h=`<div class="card res"><div class="em">🏆</div><div class="t">${mx>0?order.filter(id=>s.score[id]===mx).map(nameOf).map(esc).join(', ')+'님이 마음을 제일 잘 맞혔어요!':'다음엔 마음이 통할 거예요!'}</div>
  ${order.map((id,i)=>`<div class="row"><div class="av">${['🥇','🥈','🥉'][i]||avOf(id)}</div><div class="nm">${esc(nameOf(id))}</div><b>${s.score[id]}점</b></div>`).join('')}</div>`;
  if(s.hist.length)h+=`<div class="card"><h2>📜 이번 판 답 모음</h2>${s.hist.map(x=>`<div class="row" style="display:block"><div style="font-size:15px">${esc(x.q)}${x.all?' 🧠':''}</div><div class="small">${x.G.map(gr=>`${gr.texts.map(esc).join('/')}(${gr.ids.map(nameOf).map(esc).join(',')})`).join(' · ')}</div></div>`).join('')}</div>`;
  return h;
 },
 record(s){
  if(s.stopped)return;const b=LS.get(TOOL+'_rec',{wins:{},done:[]});if(b.done.includes(s.g.id))return;
  const mx=Math.max(...s.P.map(id=>s.score[id]));if(mx>0)s.P.filter(id=>s.score[id]===mx).forEach(id=>b.wins[id]=(b.wins[id]||0)+1);
  b.done=[...b.done,s.g.id].slice(-40);LS.set(TOOL+'_rec',b);
 },
 recordHTML(){const b=LS.get(TOOL+'_rec',{wins:{}});const any=MEMBERS.some(m=>b.wins[m.id]);
  return `<div class="card"><h2>🏆 이 폰에서 본 1등 횟수</h2>${any?`<div class="score">${MEMBERS.map(m=>`<div>${avOf(m.id)}<b>${b.wins[m.id]||0}</b><span class="small">${esc(m.name)}</span></div>`).join('')}</div>`:'<div class="small">아직 기록이 없어요</div>'}</div>`},
 act(a,el,g,s,me){
  if(!me)return;
  const p=myP(g);
  if(a==='send'&&s.ph==='answer'){
   const v=(($('ans')||{}).value||'').trim();
   if(!v)return setErr('답을 적어 주세요');
   if(v.length>12)return setErr('12자까지 쓸 수 있어요');
   p.a[s.r]=v;commit();
  }
  else if(a==='edit'&&s.ph==='answer'){delete p.a[s.r];commit()}
  else if(a==='pick'&&s.ph==='reveal'){
   const k=el.dataset.k;
   if(!selK||selK===k){selK=selK===k?null:k;render();return}
   const arr=(p.mg[s.r]||[]).slice();arr.push(selK+'|'+k);p.mg[s.r]=arr.slice(-20);selK=null;toast('🔗 같은 답으로 묶었어요');commit();
  }
  else if(a==='unmerge'&&s.ph==='reveal'){p.mg[s.r]=[];selK=null;commit()}
  else if(a==='next'&&s.ph==='reveal'){p.nx[s.r]=1;selK=null;commit()}
 }
};
