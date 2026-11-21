/*META
{"tool":"mind-dial","title":"마음 다이얼","emoji":"🎚️","min":2,
 "sub":"\"차가운 ↔ 뜨거운\" 사이 어딘가에 숨은 정답!<br>한마디 힌트로 위치를 맞혀요 (웨이브렝스 방식)",
 "rules":["차례마다 한 명이 <b>출제자</b>예요. 출제자 폰에만 막대 위 <b>숨은 정답 위치</b>가 보여요.","출제자는 그 위치에 어울리는 <b>한마디 힌트</b>를 적어요. 예) 차가운↔뜨거운, 정답이 오른쪽 끝 근처면 \"용암\"","나머지는 각자 막대를 움직여 위치를 골라요. 가까울수록 점수! 🎯 4점 · 3점 · 2점","출제자는 맞힌 사람들 점수의 평균을 받아요. 그러니 잘 맞힐 힌트를 줘야 해요","정답은 없어요. 서로 생각이 달라서 생기는 수다가 이 게임의 재미 😄"],
 "ui":{"l":1},
 "cssvars":"--bg:#f1f8ff;--ink:#1f3550;--sub:#5f7895;--line:#d3e3f3;--soft:#e2eefa;--pri:#ffcf6b;--pri2:#d9a23a;--card:#fbfdff",
 "css":".ends{display:flex;justify-content:space-between;font-size:16px;margin:4px 2px 6px;gap:8px}.ends span{max-width:48%;word-break:keep-all}.ends span:last-child{text-align:right}.bar{position:relative;height:56px;border-radius:16px;background:linear-gradient(90deg,#7fb8f0,#f3e7a0 50%,#f39a7f);overflow:hidden;border:3px solid var(--line)}.bd{position:absolute;top:0;bottom:0}.bd.b2{background:rgba(255,255,255,.35)}.bd.b3{background:rgba(255,255,255,.6)}.bd.b4{background:#fff}.bd i{position:absolute;bottom:2px;left:0;right:0;text-align:center;font-style:normal;font-size:11px;color:#556}.mk{position:absolute;top:50%;transform:translate(-50%,-50%);font-size:22px;line-height:1}.tgt{position:absolute;top:0;bottom:0;width:3px;background:#e5484d;transform:translateX(-50%)}input[type=range]{width:100%;height:44px;margin:10px 0 0;accent-color:#d9a23a}.rd{text-align:center;font-size:14px;color:var(--sub)}.clue{text-align:center;font-size:30px;margin:6px 0;color:#c0661a;word-break:keep-all}.mini{display:flex;justify-content:center;gap:12px;font-size:14px;color:var(--sub);margin:2px 0 6px}"}
META*/
const SPEC=('차가운|뜨거운,싫어하는 음식|좋아하는 음식,쉬운 일|어려운 일,안 무서운|무서운,조용한|시끄러운,작은|커다란,싼|비싼,몸에 좋은|몸에 나쁜,쓸모없는|쓸모있는,심심한|신나는,느린|빠른,부드러운|딱딱한,어린이용|어른용,평범한|특이한,여름 느낌|겨울 느낌,옛날 것|요즘 것,가벼운|무거운,싫어하는 과목|좋아하는 과목,별로인 간식|최고의 간식,안 귀여운|귀여운,쉬운 운동|힘든 운동,짧게 걸리는|오래 걸리는,안 아픈|아픈,깨끗한|더러운,안 매운|매운,집에 있는 것|밖에 있는 것,필요 없는 물건|꼭 필요한 물건,별로인 선물|최고의 선물,평화로운|위험한,재미없는 영화|재밌는 영화,낮에 하는 일|밤에 하는 일,동물이 싫어할|동물이 좋아할,안 냄새나는|냄새나는,싫은 날씨|좋은 날씨,슬픈|기쁜,약한|강한,진짜 같은|가짜 같은,흔한|드문,좁은 곳|넓은 곳,아침 메뉴|저녁 메뉴,아기 같은|어른 같은,별로인 방학 계획|최고의 방학 계획,쓴|단,불편한|편한,안 시끄러운 동물|시끄러운 동물,현실적인|상상 속,못 참는|참을 만한,싫은 소리|좋은 소리,덜 중요한|아주 중요한,엄마가 싫어할|엄마가 좋아할,아빠 스타일 아님|완전 아빠 스타일').split(',').map(x=>x.split('|'));
let gv=50,drag=false;
const band=d=>d<=3?4:d<=8?3:d<=13?2:0;
const GAME={
 maps:['c','a','nx'],
 reset(){gv=50;drag=false},
 setup(n,id,ui){const R=n*(ui.l||1),recent=LS.get(TOOL+'_recent',[]);let pool=[...SPEC.keys()].filter(i=>!recent.includes(i));if(pool.length<R)pool=[...SPEC.keys()];const sp=shuffle(pool).slice(0,R);LS.set(TOOL+'_recent',[...recent,...sp].slice(-30));
  return {sp,t:sp.map((_,r)=>(5+rint(91)+hash(id+':'+r))%101)}},
 settings(){return `<div class="lbl">몇 바퀴? (한 바퀴 = 모두 한 번씩 출제)</div><div class="chips">${opt('l',1,'1바퀴')}${opt('l',2,'2바퀴')}${opt('l',3,'3바퀴')}</div>`},
 derive(g){
  const P=g.pl,n=P.length,D=Dof(g),stop=stopOf(g,D),sk=skipsOf(P,D),R=g.sp.length,score={};P.forEach(id=>score[id]=0);
  const hist=[];let team=0;
  const halt=o=>stop?{...o,ph:'end',stopped:stop}:o;
  for(let r=0;r<R;r++){
   const psy=P[r%n],sp=SPEC[g.sp[r]]||['?','?'],t=((g.t[r]-hash(g.id+':'+r))%101+101)%101;
   const base={g,P,D,R,r,psy,sp,t,score,hist,team};
   const clue=(D(psy).c||{})[r];
   if(!(typeof clue==='string'&&clue)){if(sk.has('c:'+psy+':'+r)){hist.push({r,psy,sp,t,clue:'(건너뜀)',gs:[],pts:{}});continue}return halt({...base,ph:'clue'})}
   const gs=P.filter(id=>id!==psy).map(id=>({id,v:(D(id).a||{})[r]})).filter(x=>typeof x.v==='number');
   const missing=P.filter(id=>id!==psy&&!gs.some(x=>x.id===id)&&!sk.has('a:'+id+':'+r));
   if(missing.length)return halt({...base,ph:'guess',clue,gs,missing});
   const pts={};gs.forEach(x=>pts[x.id]=band(Math.abs(x.v-t)));
   pts[psy]=gs.length?Math.round(gs.reduce((a,x)=>a+pts[x.id],0)/gs.length):0;
   if(!anyFlag(P,D,'nx',r))return halt({...base,ph:'reveal',clue,gs,pts});
   P.forEach(id=>score[id]+=pts[id]||0);gs.forEach(x=>team+=pts[x.id]);hist.push({r,psy,sp,t,clue,gs,pts});
  }
  return {g,P,D,R,ph:'end',score,hist,team};
 },
 buzz(s){return (s.ph==='clue'&&s.psy===ME)||(s.ph==='guess'&&s.missing.includes(ME))},
 busy(){return drag},
 bar(t,marks,showT){
  const z=(lo,hi,c,lab)=>`<div class="bd ${c}" style="left:${Math.max(0,lo)}%;width:${Math.min(100,hi)-Math.max(0,lo)}%">${lab?`<i>${lab}</i>`:''}</div>`;
  return `<div class="bar">${showT?z(t-13.5,t+13.5,'b2')+z(t-8.5,t+8.5,'b3')+z(t-3.5,t+3.5,'b4','🎯')+`<div class="tgt" style="left:${t}%"></div>`:''}${(marks||[]).map(m=>`<span class="mk" style="left:${Math.min(97,Math.max(3,m.v))}%">${m.e}</span>`).join('')}</div>`;
 },
 ends(sp){return `<div class="ends"><span>⬅️ ${esc(sp[0])}</span><span>${esc(sp[1])} ➡️</span></div>`},
 play(s,key,me){
  const mini=`<div class="mini">${s.P.map(id=>`<span>${avOf(id)} ${s.score[id]}</span>`).join('')}</div>`;
  let h=`<div class="small" style="text-align:center">${s.r+1} / ${s.R} 번째 · 출제자 ${who(s.psy)}</div>${mini}`;
  if(s.ph==='clue'){
   if(s.psy===ME)h+=`<div class="card"><h2>🤫 나만 보는 정답 위치</h2>${GAME.ends(s.sp)}${GAME.bar(s.t,[],true)}<div class="small" style="margin-top:8px">빨간 선 위치에 딱 맞는 <b>한마디</b>를 적어요. 양 끝 말을 그대로 쓰면 안 돼요!</div><input type="text" id="clueIn" maxlength="15" placeholder="예) 용암" autocomplete="off" data-enter="clue"><div class="err">${esc(errMsg)}</div><button class="big" data-act="clue">힌트 보내기 📨</button></div>`;
   else h+=`<div class="card">${GAME.ends(s.sp)}${GAME.bar(0,[],false)}<div style="text-align:center;font-size:18px;margin-top:10px"><span class="wait">🤔</span> ${esc(nameOf(s.psy))}님이 힌트를 생각하는 중</div></div>`;
   if(me)h+=waitBtn(key,60000,[s.psy],id=>'c:'+id+':'+s.r,'차례 건너뛰기');
  }else if(s.ph==='guess'){
   const mine=(s.D(ME).a||{})[s.r];
   h+=`<div class="card"><div class="small" style="text-align:center">${who(s.psy)}님의 힌트</div><div class="clue">"${esc(s.clue)}"</div>${GAME.ends(s.sp)}`;
   if(me&&s.psy!==ME&&typeof mine!=='number'){
    h+=`${GAME.bar(0,[{v:gv,e:avOf(ME)}],false)}<input type="range" id="dial" min="0" max="100" value="${gv}"><div class="rd">막대를 움직여 위치를 골라요</div><button class="big" data-act="send">여기! 🎯</button>`;
   }else if(me&&s.psy!==ME){
    h+=`${GAME.bar(0,[{v:mine,e:avOf(ME)}],false)}<div style="text-align:center;margin-top:8px">✅ 골랐어요</div><button class="big gray" data-act="edit">✏️ 다시 고르기</button>`;
   }else if(s.psy===ME){
    h+=`${GAME.bar(s.t,[],true)}<div class="small" style="text-align:center;margin-top:6px">가족들이 고르는 중이에요. 표정 관리! 😐</div>`;
   }
   h+=`</div><div class="card"><h2>⏳ 고르는 중</h2>${s.P.filter(id=>id!==s.psy).map(id=>`<div class="row"><div class="av">${avOf(id)}</div><div class="nm">${esc(nameOf(id))}</div><span class="tag${s.missing.includes(id)?' turn':' on'}">${s.missing.includes(id)?'고민 중 🤔':'골랐어요'}</span></div>`).join('')}</div>`;
   if(me)h+=waitBtn(key,45000,s.missing,id=>'a:'+id+':'+s.r);
  }else{
   h+=`<div class="card"><h2>🎉 정답 공개!</h2><div class="clue">"${esc(s.clue)}"</div>${GAME.ends(s.sp)}${GAME.bar(s.t,s.gs.map(x=>({v:x.v,e:avOf(x.id)})),true)}
   <div style="margin-top:8px">${s.gs.map(x=>`<div class="row"><div class="av">${avOf(x.id)}</div><div class="nm">${esc(nameOf(x.id))}</div><b>+${s.pts[x.id]}</b></div>`).join('')}<div class="row"><div class="av">${avOf(s.psy)}</div><div class="nm">${esc(nameOf(s.psy))} <span class="small">(출제자 · 평균)</span></div><b>+${s.pts[s.psy]}</b></div></div>
   ${me?`<button class="big" data-act="next">${s.r+1<s.R?'다음 ▶':'결과 보기 🏆'}</button>`:''}</div>`;
  }
  return h;
 },
 after(){
  const d=$('dial');if(d&&!d.__on){d.__on=1;
   const up=()=>{gv=+d.value;const b=d.previousElementSibling;const m=b&&b.querySelector('.mk');if(m)m.style.left=Math.min(97,Math.max(3,gv))+'%'};
   d.addEventListener('input',up);d.addEventListener('pointerdown',()=>{drag=true});
   ['pointerup','pointercancel','change','blur'].forEach(t=>d.addEventListener(t,()=>{drag=false}));}
 },
 end(s){
  const order=s.P.slice().sort((a,b)=>s.score[b]-s.score[a]),mx=s.score[order[0]];
  let h=`<div class="card res"><div class="em">🏆</div><div class="t">${mx>0?order.filter(id=>s.score[id]===mx).map(nameOf).map(esc).join(', ')+'님 1등!':'다음엔 마음이 통할 거예요!'}</div>
  ${order.map((id,i)=>`<div class="row"><div class="av">${['🥇','🥈','🥉'][i]||avOf(id)}</div><div class="nm">${esc(nameOf(id))}</div><b>${s.score[id]}점</b></div>`).join('')}<p class="small">가족 팀 점수(맞힌 점수 합계) ${s.team}점</p></div>`;
  if(s.hist.length)h+=`<div class="card"><h2>📜 이번 판 힌트 모음</h2>${s.hist.map(x=>`<div class="row" style="display:block"><div style="font-size:15px">${esc(x.sp[0])} ↔ ${esc(x.sp[1])}: <b>"${esc(x.clue)}"</b> <span class="small">(${esc(nameOf(x.psy))})</span></div>${GAME.bar(x.t,x.gs.map(y=>({v:y.v,e:avOf(y.id)})),true)}</div>`).join('')}</div>`;
  return h;
 },
 record(s){if(s.stopped)return;const b=LS.get(TOOL+'_rec',{wins:{},best:0,done:[]});if(b.done.includes(s.g.id))return;const mx=Math.max(...s.P.map(id=>s.score[id]));if(mx>0)s.P.filter(id=>s.score[id]===mx).forEach(id=>b.wins[id]=(b.wins[id]||0)+1);b.best=Math.max(b.best||0,s.team);b.done=[...b.done,s.g.id].slice(-40);LS.set(TOOL+'_rec',b)},
 recordHTML(){const b=LS.get(TOOL+'_rec',{wins:{},best:0});const any=MEMBERS.some(m=>b.wins[m.id]);return `<div class="card"><h2>🏆 이 폰에서 본 1등 횟수</h2>${any?`<div class="score">${MEMBERS.map(m=>`<div>${avOf(m.id)}<b>${b.wins[m.id]||0}</b><span class="small">${esc(m.name)}</span></div>`).join('')}</div><div class="small" style="text-align:center">최고 가족 팀 점수 ${b.best}</div>`:'<div class="small">아직 기록이 없어요</div>'}</div>`},
 act(a,el,g,s,me){
  if(!me)return;const p=myP(g);
  if(a==='clue'&&s.ph==='clue'&&s.psy===ME){
   const v=(($('clueIn')||{}).value||'').trim();if(!v)return setErr('힌트를 적어 주세요');
   if(s.sp.some(x=>norm(x)===norm(v)))return setErr('양 끝 말은 그대로 쓸 수 없어요');
   p.c[s.r]=v.slice(0,15);commit();
  }
  else if(a==='send'&&s.ph==='guess'&&s.psy!==ME){p.a[s.r]=Math.round(gv);drag=false;commit()}
  else if(a==='edit'&&s.ph==='guess'){gv=p.a[s.r]!=null?p.a[s.r]:50;delete p.a[s.r];commit()}
  else if(a==='next'&&s.ph==='reveal'){p.nx[s.r]=1;gv=50;commit()}
 }
};
