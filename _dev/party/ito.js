/*META
{"tool":"ito","title":"숫자 텔레파시","emoji":"🔢","min":2,
 "sub":"각자 비밀 숫자(1~100)를 받아요<br>숫자는 말하지 말고, 주제에 맞는 말로 표현해서 작은 순서대로!",
 "rules":["라운드마다 각자 폰에 <b>비밀 숫자 1~100</b>이 나와요. 숫자는 절대 말하면 안 돼요!","주제가 나오면 내 숫자를 그 주제에 맞는 말로 적어요. 예) 주제 \"무서운 동물\" · 숫자 5 → \"토끼\", 숫자 95 → \"사자\"","다 같이 서로의 표현을 보고 이야기해요. 그리고 <b>내 숫자가 남은 것 중 제일 작다</b>고 생각되면 \"내가 다음!\"을 눌러요.","숫자는 누른 순서대로 공개돼요. 더 큰 숫자가 먼저 나왔으면 실수 1개 = 💔 하트 1개.","하트가 남아 있는 동안 라운드를 이어 가요. 다 같이 이기는 협동 게임이에요!"],
 "ui":{"rn":5,"hv":3},
 "cssvars":"--bg:#eefaf3;--ink:#24493a;--sub:#5f8a76;--line:#c9e8d7;--soft:#dcf3e6;--pri:#8fdcae;--pri2:#5bb684;--card:#fbfffd",
 "css":".num{font-size:64px;color:#1f8a55;line-height:1}.th{font-size:22px;margin:4px 0}.ex{display:flex;justify-content:space-between;font-size:13px;color:var(--sub);margin-top:6px}.bar{height:10px;border-radius:5px;background:linear-gradient(90deg,#bfe9d1,#ffb38a);margin-top:4px}.ln{display:flex;align-items:center;gap:10px;padding:10px 8px;border-radius:14px;margin:6px 0;background:#fff;border:2px solid var(--line)}.ln .n{font-size:26px;min-width:52px;text-align:center;color:#1f8a55}.ln.bad{border-color:#f3a4a4;background:#fff3f3}.ln.bad .n{color:#d84a4a}.ln.wait{opacity:.75;border-style:dashed}.ln .e{flex:1;font-size:18px;word-break:break-all}.ln .e small{display:block;font-size:13px;color:var(--sub)}.hearts{text-align:center;font-size:26px;letter-spacing:4px;margin:4px 0}"}
META*/
const THEMES=('무서운 동물|토끼|티라노사우루스;맛있는 음식|생 양파|생일 케이크;크기|개미|지구;무거운 것|깃털|코끼리;비싼 것|사탕 한 개|비행기;빠른 것|달팽이|로켓;시끄러운 소리|속삭임|천둥;귀여운 것|모기|아기 강아지;힘센 동물|햄스터|고릴라;뜨거운 것|얼음|태양;높은 곳|침대 위|에베레스트산;기분 좋은 일|숙제 폭탄|소원이 이루어짐;아픈 정도|모기 물림|다리 골절;신나는 놀이|줄 서서 기다리기|놀이공원;어려운 일|숨쉬기|우주선 만들기;지독한 냄새|꽃향기|썩은 달걀;위험한 것|베개|화산 폭발;갖고 싶은 선물|양말 한 짝|강아지;달콤한 것|레몬|솜사탕;매운 음식|우유|청양고추;부드러운 것|돌멩이|구름;유명한 사람·캐릭터|우리 동네 강아지|산타클로스;무인도에서 쓸모 있는 것|리모컨|칼;졸린 상황|놀이공원|자기 전 침대;부끄러운 상황|혼자 콧노래|무대에서 넘어짐;오래 사는 것|하루살이|거북이;차가운 것|따뜻한 코코아|남극;반짝이는 것|돌멩이|다이아몬드;엄마가 화나는 정도|조금 늦잠|거실에 물 쏟기;맛있는 과일|덜 익은 감|잘 익은 수박;여행 가고 싶은 곳|우리 집 앞|우주;배부른 정도|물 한 모금|뷔페 세 접시;무서운 상황|잠깐 정전|귀신의 집;재미있는 것|일기예보|제일 좋아하는 만화;빠르게 지나가는 시간|치과 기다리기|놀이공원;인기 있는 간식|맹물|치킨').split(';').map(x=>{const [t,a,b]=x.split('|');return {t,a,b}});
const GAME={
 maps:['e','pl','nx'],
 setup(n,id,ui){
  const R=ui.rn||5,th=shuffle([...THEMES.keys()]).slice(0,R),nums=[];
  for(let r=0;r<R;r++){const pick=shuffle([...Array(100).keys()].map(x=>x+1)).slice(0,n);pick.forEach((v,i)=>{const k=r*n+i;nums.push((v-1+hash(id+':'+k))%100+1)})}
  return {th,nums,hv:ui.hv||3};
 },
 settings(ui){return `<div class="lbl">라운드 수</div><div class="chips">${[3,5,7].map(n=>opt('rn',n,n+'라운드')).join('')}</div><div class="lbl">하트 (실수할 수 있는 횟수)</div><div class="chips">${[2,3,5].map(n=>opt('hv',n,'💚'.repeat(n))).join('')}</div>`},
 derive(g){
  const P=g.pl,n=P.length,D=Dof(g),stop=stopOf(g,D),sk=skipsOf(P,D),R=g.th.length,hist=[];
  let lives=g.hv||3,perfect=0;
  const base=()=>({g,P,D,R,lives,perfect,hist}),halt=o=>stop?{...base(),ph:'end',stopped:stop}:o;
  for(let r=0;r<R;r++){
   const th=THEMES[g.th[r]]||THEMES[0],num={};
   P.forEach((id,i)=>{const k=r*n+i;num[id]=(((g.nums[k]-1-hash(g.id+':'+k))%100)+100)%100+1});
   const ex={};P.forEach(id=>{const v=(D(id).e||{})[r];if(typeof v==='string'&&v)ex[id]=v;else if(sk.has('e:'+id+':'+r))ex[id]='(건너뜀)'});
   const noEx=P.filter(id=>!ex[id]);
   if(noEx.length)return halt({...base(),ph:'say',r,th,num,ex,noEx});
   const pr=P.map(id=>({id,a:(D(id).pl||{})[r]||(sk.has('p:'+id+':'+r)?9e15:0)})).filter(x=>x.a).sort((a,b)=>a.a-b.a);
   let mx=0;const line=pr.map(x=>{const v=num[x.id],bad=v<mx;if(v>mx)mx=v;return {id:x.id,v,bad}});
   const left=P.filter(id=>!pr.some(x=>x.id===id));
   if(left.length)return halt({...base(),ph:'line',r,th,num,ex,line,left});
   const lose=line.filter(x=>x.bad).length;
   if(!anyFlag(P,D,'nx',r))return halt({...base(),ph:'result',r,th,num,ex,line,lose});
   lives=Math.max(0,lives-lose);if(!lose)perfect++;hist.push({r,th,line,lose,ex});
   if(lives<=0)return {...base(),ph:'end',fail:1,lastR:r};
  }
  return {...base(),ph:'end'};
 },
 buzz(s){return s.ph==='say'&&s.noEx.includes(ME)},
 play(s,key,me){
  const hearts=`<div class="hearts">${'💚'.repeat(s.lives)}${'🤍'.repeat(Math.max(0,(s.g.hv||3)-s.lives))}</div>`;
  let h=`<div class="small" style="text-align:center">라운드 ${s.r+1} / ${s.R}</div>${hearts}
  <div class="card" style="text-align:center"><div class="small">이번 주제</div><div class="th">${esc(s.th.t)}</div><div class="bar"></div><div class="ex"><span>1 = ${esc(s.th.a)}</span><span>100 = ${esc(s.th.b)}</span></div></div>`;
  if(me&&s.ph!=='result')h+=`<div class="card" style="text-align:center"><div class="small">🤫 내 비밀 숫자 (말하면 안 돼요!)</div><div class="num">${s.num[ME]}</div>${s.ex[ME]?`<div style="margin-top:6px">내 표현: <b>${esc(s.ex[ME])}</b></div>`:''}</div>`;
  if(s.ph==='say'){
   if(me&&!s.ex[ME])h+=`<div class="card"><h2>✍️ 내 숫자를 주제에 맞게 표현해요</h2><input type="text" id="exIn" maxlength="15" placeholder="예) ${esc(s.th.a)}보다 조금 더…" autocomplete="off" data-enter="say"><div class="err">${esc(errMsg)}</div><button class="big" data-act="say">이렇게 할게요 ✋</button></div>`;
   h+=`<div class="card"><h2>⏳ 표현 쓰는 중</h2>${s.P.map(id=>`<div class="row"><div class="av">${avOf(id)}</div><div class="nm">${esc(nameOf(id))}</div><span class="tag${s.noEx.includes(id)?' turn':' on'}">${s.noEx.includes(id)?'생각 중 🤔':'다 썼어요'}</span></div>`).join('')}</div>`;
   if(me)h+=waitBtn(key,60000,s.noEx,id=>'e:'+id+':'+s.r);
  }else if(s.ph==='line'){
   h+=`<div class="card"><h2>🃏 낸 순서 (작은 수부터)</h2>${s.line.map(x=>`<div class="ln${x.bad?' bad':''}"><span class="n">${x.v}</span><span class="e">${esc(s.ex[x.id])}<small>${who(x.id)}${x.bad?' · 앗! 앞보다 작아요':''}</small></span></div>`).join('')||'<div class="small">아직 아무도 안 냈어요. 누가 제일 작을까요?</div>'}</div>`;
   h+=`<div class="card"><h2>🤔 아직 안 낸 사람</h2>${s.left.map(id=>`<div class="ln wait"><span class="n">?</span><span class="e">${esc(s.ex[id])}<small>${who(id)}</small></span></div>`).join('')}
   ${me&&s.left.includes(ME)?`<button class="big" data-act="play">🙋 내가 다음!</button><div class="small" style="text-align:center;margin-top:6px">남은 것 중 내 숫자가 제일 작다고 생각되면 눌러요.<br>말로 의논해도 돼요. 숫자만 말하지 마세요!</div>`:''}</div>`;
   if(me)h+=waitBtn(key,90000,s.left,id=>'p:'+id+':'+s.r,'맨 뒤로 보내기');
  }else{
   h+=`<div class="card res"><div class="em">${s.lose?'💔':'🎉'}</div><div class="t">${s.lose?`실수 ${s.lose}개! 하트 -${s.lose}`:'완벽해요! 텔레파시 성공!'}</div></div>
   <div class="card"><h2>🃏 낸 순서</h2>${s.line.map(x=>`<div class="ln${x.bad?' bad':''}"><span class="n">${x.v}</span><span class="e">${esc(s.ex[x.id])}<small>${who(x.id)}${x.bad?' · ❌ 더 일찍 냈어야 해요':''}</small></span></div>`).join('')}
   ${me?`<button class="big" data-act="next">${s.lives-s.lose<=0?'결과 보기':s.r+1<s.R?'다음 라운드 ▶':'결과 보기 🏆'}</button>`:''}</div>`;
  }
  return h;
 },
 end(s){
  const ok=!s.fail&&!s.stopped;
  let h=`<div class="card res"><div class="em">${s.fail?'💔':ok?'🏆':'🔢'}</div><div class="t">${s.fail?`${s.lastR+1}라운드에서 하트가 다 떨어졌어요`:ok?`${s.R}라운드 모두 성공!`:'게임 기록'}</div>
  <p>완벽한 라운드 <b>${s.perfect}</b>개 · 남은 하트 ${'💚'.repeat(s.lives)||'없음'}</p>${ok?'<p>마음이 척척! 대단한 팀이에요 🤝</p>':s.fail?'<p>다음엔 표현을 더 자세히 해 봐요!</p>':''}</div>`;
  if(s.hist.length)h+=`<div class="card"><h2>📜 라운드 기록</h2>${s.hist.map(x=>`<div class="row" style="display:block"><div style="font-size:15px">${x.lose?'💔':'🎉'} ${esc(x.th.t)}</div><div class="small">${x.line.map(l=>`${l.v} ${esc(x.ex[l.id])}${l.bad?'❌':''}`).join(' → ')}</div></div>`).join('')}</div>`;
  return h;
 },
 record(s){if(s.stopped)return;const b=LS.get(TOOL+'_rec',{best:{},done:[]});if(b.done.includes(s.g.id))return;const k=s.R+'r';const v=s.fail?s.hist.length-1:s.R;b.best[k]=Math.max(b.best[k]||0,v);b.done=[...b.done,s.g.id].slice(-40);LS.set(TOOL+'_rec',b)},
 recordHTML(){const b=LS.get(TOOL+'_rec',{best:{}});const ks=['3r','5r','7r'].filter(k=>b.best[k]!=null);
  return `<div class="card"><h2>🏆 이 폰의 최고 기록</h2>${ks.length?`<div class="score">${ks.map(k=>`<div><b>${b.best[k]}</b><span class="small">${parseInt(k)}라운드 중 성공</span></div>`).join('')}</div>`:'<div class="small">아직 기록이 없어요. 몇 라운드까지 갈 수 있을까요?</div>'}</div>`},
 act(a,el,g,s,me){
  if(!me)return;const p=myP(g);
  if(a==='say'&&s.ph==='say'){
   const v=(($('exIn')||{}).value||'').trim();
   if(!v)return setErr('표현을 적어 주세요');
   if(/\d/.test(v))return setErr('숫자는 쓰면 안 돼요! 말로 표현해요 🙊');
   p.e[s.r]=v.slice(0,15);commit();
  }
  else if(a==='play'&&s.ph==='line'&&s.left.includes(ME)){p.pl[s.r]=Date.now();commit()}
  else if(a==='next'&&s.ph==='result'){p.nx[s.r]=1;commit()}
 }
};
