/*META
{"tool":"truth-lie","title":"진실 혹은 거짓","emoji":"🤥","min":2,
 "sub":"내 이야기 3개 중 하나는 거짓말!<br>가족이 내 거짓말을 찾아낼 수 있을까요?",
 "rules":["각자 <b>나에 대한 이야기 3개</b>를 적어요. 2개는 진짜, 1개는 거짓말! (거짓말이 어느 건지 표시해요)","한 명씩 차례로 이야기가 공개돼요. 나머지는 <b>어느 것이 거짓말</b>인지 투표해요.","거짓말을 맞히면 <b>+1</b>, 내 거짓말에 속은 사람 1명마다 나는 <b>+1</b>.","진짜 같은 거짓말, 거짓말 같은 진짜를 섞으면 더 재미있어요 😏","가족끼리 몰랐던 이야기를 알게 되는 게임이에요. 비밀은 말하고 싶은 만큼만!"],
 "ui":{},
 "cssvars":"--bg:#f0f4ff;--ink:#2a3560;--sub:#6a7aa8;--line:#d4dcf5;--soft:#e2e9ff;--pri:#a8c0ff;--pri2:#6f8ee0;--card:#fbfcff",
 "css":".st{display:flex;gap:8px;align-items:center;margin:8px 0}.st input{margin-top:0;font-size:17px;height:52px}.st .lie{flex:none;width:64px;height:52px;font-size:13px;padding:0}.st .lie.on{background:#ffb3b3;box-shadow:0 4px 0 #e07a7a}.opt3 button{width:100%;text-align:left;padding:14px 16px;margin:7px 0;font-size:18px;line-height:1.4;word-break:keep-all;display:block}.opt3 button.on{background:var(--pri);box-shadow:0 4px 0 var(--pri2)}.opt3 .tr{background:#e3f6e1;box-shadow:0 4px 0 #a9d8a4}.opt3 .ly{background:#ffe0e0;box-shadow:0 4px 0 #e8a0a0}.opt3 .vv{display:block;font-size:13px;color:var(--sub);margin-top:4px}.ideas{display:flex;flex-wrap:wrap;gap:6px;margin-top:6px}.ideas span{font-size:12px;background:var(--soft);border-radius:99px;padding:4px 9px;color:var(--sub)}"}
META*/
const IDEAS=['나는 ○○를 먹어 본 적이 있다','어렸을 때 ○○ 했다','나는 ○○를 무서워한다','내 꿈은 ○○였다','나는 ○○에 가 본 적이 있다','나는 ○○를 할 줄 안다','내가 제일 좋아하는 ○○는 ○○다','나는 ○○ 때문에 혼난 적이 있다'];
let lieSel=-1, pick=-1;
const lieKey=(g,id)=>hash(g.id+':'+id)%3;
const GAME={
 maps:['v','nx'],
 reset(){lieSel=-1;pick=-1},
 setup(){return {}},
 settings(){return `<div class="small">설정할 건 없어요. 가족 수만큼 차례가 돌아요!</div>`},
 derive(g){
  const P=g.pl,D=Dof(g),stop=stopOf(g,D),sk=skipsOf(P,D),score={};P.forEach(id=>score[id]=0);
  const hist=[],base=()=>({g,P,D,score,hist}),halt=o=>stop?{...base(),ph:'end',stopped:stop}:o;
  const ok=id=>{const d=D(id);return Array.isArray(d.st)&&d.st.length===3&&d.st.every(x=>typeof x==='string'&&x)&&d.li>=0};
  const notW=P.filter(id=>!ok(id)&&!sk.has('w:'+id));
  if(notW.length)return halt({...base(),ph:'write',notW});
  const order=P.filter(ok);
  for(let r=0;r<order.length;r++){
   const sub=order[r],d=D(sub),lie=((d.li-lieKey(g,sub))%3+3)%3,voters=P.filter(x=>x!==sub);
   const votes=voters.map(id=>[id,(D(id).v||{})[r]]).filter(x=>x[1]>=0&&x[1]<=2);
   const missing=voters.filter(id=>!votes.some(x=>x[0]===id)&&!sk.has('v:'+id+':'+r));
   if(missing.length)return halt({...base(),ph:'vote',r,N:order.length,sub,st:d.st,missing,votes});
   const pts={};let fooled=0;votes.forEach(([id,v])=>{if(v===lie)pts[id]=1;else fooled++});if(fooled)pts[sub]=fooled;
   if(!anyFlag(P,D,'nx',r))return halt({...base(),ph:'reveal',r,N:order.length,sub,st:d.st,lie,votes,pts});
   Object.keys(pts).forEach(id=>score[id]+=pts[id]);hist.push({sub,st:d.st,lie,votes});
  }
  return {...base(),ph:'end'};
 },
 buzz(s){return (s.ph==='write'&&s.notW.includes(ME))||(s.ph==='vote'&&s.missing.includes(ME))},
 play(s,key,me){
  let h='';
  if(s.ph==='write'){
   const mine1=s.D(ME),done=Array.isArray(mine1.st)&&mine1.li>=0;
   if(me&&!done){
    h+=`<div class="card"><h2>✍️ 나에 대한 이야기 3개</h2><div class="small">2개는 진짜, 1개는 거짓말! 거짓말 옆의 <b>🤥</b>를 눌러 표시해요.</div>
    ${[0,1,2].map(i=>`<div class="st"><input type="text" id="s${i}" maxlength="40" placeholder="이야기 ${i+1}" autocomplete="off"><button class="lie${lieSel===i?' on':''}" data-act="lie" data-i="${i}">🤥<br>거짓말</button></div>`).join('')}
    <div class="err">${esc(errMsg)}</div><button class="big" data-act="write">다 썼어요 ✋</button>
    <div class="lbl">💡 이런 이야기 어때요?</div><div class="ideas">${IDEAS.map(x=>`<span>${esc(x)}</span>`).join('')}</div></div>`;
   }else if(me)h+=`<div class="card" style="text-align:center"><div style="font-size:19px">✅ 다 썼어요!</div><button class="big gray" data-act="rewrite">✏️ 다시 쓰기</button></div>`;
   h+=`<div class="card"><h2>⏳ 이야기 쓰는 중</h2>${s.P.map(id=>`<div class="row"><div class="av">${avOf(id)}</div><div class="nm">${esc(nameOf(id))}</div><span class="tag${s.notW.includes(id)?' turn':' on'}">${s.notW.includes(id)?'쓰는 중 ✍️':'다 썼어요'}</span></div>`).join('')}</div>`;
   if(me)h+=waitBtn(key,120000,s.notW,id=>'w:'+id,'빼고 시작하기');
   return h;
  }
  h+=`<div class="small" style="text-align:center">${s.r+1} / ${s.N} 번째 이야기</div><div class="card q"><span class="k">이 중 하나는 거짓말!</span>${who(s.sub)}님의 이야기</div>`;
  if(s.ph==='vote'){
   const my=(s.D(ME).v||{})[s.r];
   if(ME===s.sub)h+=`<div class="card opt3">${s.st.map(t=>`<button disabled style="opacity:1">${esc(t)}</button>`).join('')}<div class="small" style="text-align:center">😏 가족들이 내 거짓말을 찾는 중… 표정 관리!</div></div>`;
   else if(me)h+=`<div class="card opt3"><h2>🔍 거짓말은 어느 것?${my>=0?' (바꿀 수 있어요)':''}</h2>${s.st.map((t,i)=>`<button class="${my===i?'on':''}" data-act="vote" data-i="${i}">${['①','②','③'][i]} ${esc(t)}</button>`).join('')}</div>`;
   else h+=`<div class="card opt3">${s.st.map(t=>`<button disabled style="opacity:1">${esc(t)}</button>`).join('')}</div>`;
   const voters=s.P.filter(x=>x!==s.sub);
   h+=`<div class="card"><h2>⏳ 투표 ${voters.length-s.missing.length}/${voters.length}</h2>${voters.map(id=>`<div class="row"><div class="av">${avOf(id)}</div><div class="nm">${esc(nameOf(id))}</div><span class="tag${s.missing.includes(id)?' turn':' on'}">${s.missing.includes(id)?'고민 중 🤔':'투표 완료'}</span></div>`).join('')}</div>`;
   if(me)h+=waitBtn(key,60000,s.missing,id=>'v:'+id+':'+s.r);
  }else{
   h+=`<div class="card opt3"><h2>🎉 정답 공개!</h2>${s.st.map((t,i)=>{const vs=s.votes.filter(x=>x[1]===i).map(x=>nameOf(x[0]));return `<button class="${i===s.lie?'ly':'tr'}" disabled style="opacity:1">${i===s.lie?'🤥 거짓말':'✅ 진짜'} · ${esc(t)}${vs.length?`<span class="vv">👉 ${vs.map(esc).join(', ')}</span>`:''}</button>`}).join('')}
   <div class="small" style="text-align:center;margin-top:6px">${Object.keys(s.pts).length?Object.keys(s.pts).map(id=>`${esc(nameOf(id))} +${s.pts[id]}`).join(' · '):'점수 없음'}</div>
   ${me?`<button class="big" data-act="next">${s.r+1<s.N?'다음 사람 이야기 ▶':'결과 보기 🏆'}</button>`:''}</div>`;
  }
  h+=`<div class="card"><h2>🏅 점수</h2><div class="score">${s.P.map(id=>`<div>${avOf(id)}<b>${s.score[id]}</b><span class="small">${esc(nameOf(id))}</span></div>`).join('')}</div></div>`;
  return h;
 },
 end(s){
  const order=s.P.slice().sort((a,b)=>s.score[b]-s.score[a]),mx=s.score[order[0]]||0;
  let h=`<div class="card res"><div class="em">🏆</div><div class="t">${mx?order.filter(id=>s.score[id]===mx).map(nameOf).map(esc).join(', ')+'님 우승!':'게임 끝!'}</div>${order.map((id,i)=>`<div class="row"><div class="av">${['🥇','🥈','🥉'][i]||avOf(id)}</div><div class="nm">${esc(nameOf(id))}</div><b>${s.score[id]}점</b></div>`).join('')}</div>`;
  if(s.hist.length)h+=`<div class="card"><h2>📜 이번 판 이야기</h2>${s.hist.map(x=>`<div class="row" style="display:block"><div>${who(x.sub)}</div>${x.st.map((t,i)=>`<div class="small">${i===x.lie?'🤥':'✅'} ${esc(t)}</div>`).join('')}</div>`).join('')}</div>`;
  return h;
 },
 act(a,el,g,s,me){
  if(!me)return;const p=myP(g);
  if(a==='lie'&&s.ph==='write'){lieSel=+el.dataset.i;render()}
  else if(a==='write'&&s.ph==='write'){
   const v=[0,1,2].map(i=>(($('s'+i)||{}).value||'').trim());
   if(v.some(x=>!x))return setErr('이야기 3개를 모두 적어 주세요');
   if(lieSel<0)return setErr('어느 게 거짓말인지 🤥를 눌러 표시해 주세요');
   p.st=v.map(x=>x.slice(0,40));p.li=(lieSel+lieKey(g,ME))%3;lieSel=-1;commit();
  }
  else if(a==='rewrite'&&s.ph==='write'){delete p.st;delete p.li;commit()}
  else if(a==='vote'&&s.ph==='vote'&&ME!==s.sub){p.v[s.r]=+el.dataset.i;commit()}
  else if(a==='next'&&s.ph==='reveal'){p.nx[s.r]=1;commit()}
 }
};
