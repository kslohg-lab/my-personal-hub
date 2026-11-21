/*META
{"tool":"fake-artist","title":"가짜 화가","emoji":"🎭","min":3,
 "sub":"한 장에 한 줄씩 이어 그리기!<br>제시어를 모르는 가짜 화가는 누구? (가짜 화가 방식)",
 "rules":["모두 같은 제시어를 받는데, <b>한 명(가짜 화가)</b>은 주제(예: 동물)만 알아요.","차례대로 한 사람씩 <b>한 붓(손을 떼기 전까지)</b>만 그려요. 두 바퀴 돌면 그림 완성!","너무 쉽게 그리면 가짜 화가가 제시어를 눈치채고, 너무 애매하면 내가 의심받아요 😅","다 그리면 모두 <b>가짜 화가라고 생각하는 사람</b>에게 투표해요. 가장 많이 받은 사람이 가짜면 붙잡아요! (동점이면 가짜가 빠져나가요)","붙잡힌 가짜 화가는 제시어를 맞히면 역전승! 가짜가 이기면 가짜 +2점, 화가들이 이기면 화가 모두 +1점"],
 "ui":{"n":3},
 "cssvars":"--bg:#f7f3ff;--ink:#35294d;--sub:#76699a;--line:#e1d8f3;--soft:#ece5fa;--pri:#c9b5f5;--pri2:#9078d0;--card:#fdfcff",
 "css":".padw,.vieww{width:100%;aspect-ratio:1/1;background:#fff;border:3px solid var(--line);border-radius:16px;overflow:hidden;margin:6px auto}.vieww{max-width:340px}#pad,.view{width:100%;height:100%;display:block;touch-action:none}.word{text-align:center;font-size:30px;color:#6a3fc0;margin:2px 0;word-break:keep-all}.cat{text-align:center;font-size:14px;color:var(--sub)}.fake{text-align:center;font-size:22px;color:#c0392b}.order{display:flex;flex-wrap:wrap;gap:6px;justify-content:center;margin:4px 0 8px}.order span{padding:4px 8px;border-radius:10px;background:var(--soft);font-size:14px;border-bottom:4px solid transparent}.order span.now{background:#ffe08a}.order span.dn{opacity:.5}.vt{width:100%;display:flex;align-items:center;gap:10px;padding:10px 12px;margin:6px 0;font-size:18px}.vt.on{background:var(--pri);box-shadow:0 4px 0 var(--pri2)}.mini{display:flex;justify-content:center;gap:12px;font-size:14px;color:var(--sub);margin:2px 0 6px}"}
META*/
const WL=[['동물','고양이,강아지,토끼,기린,코끼리,펭귄,문어,거북이,사자,돼지,뱀,나비,달팽이,공룡'],['음식','피자,햄버거,아이스크림,수박,바나나,김밥,라면,케이크,도넛,달걀프라이,사탕,당근,치킨,포도'],['탈것','자동차,자전거,비행기,기차,배,로켓,헬리콥터,버스,트럭,열기구,잠수함'],['물건','우산,안경,가위,시계,의자,컵,열쇠,전구,가방,모자,신발,칫솔,휴대폰'],['자연','나무,꽃,산,해,달,구름,번개,무지개,눈사람,화산,섬,폭포,선인장'],['장소','집,학교,성,등대,텐트,놀이터,수영장,병원,피라미드'],['캐릭터','로봇,유령,외계인,공주,해적,마녀,천사,산타클로스,슈퍼히어로,인어'],['악기·운동','기타,피아노,북,축구공,농구,야구,스키,줄넘기,수영,트로피']];
const WORDS=[];WL.forEach(([c,ws])=>ws.split(',').forEach(w=>WORDS.push([c,w])));
const PCI=[1,5,4,6,2,8,7,0];   // 사람마다 붓 색 (PCOL 번호)
const MAXP=160;
let st=null,vsel='';
const VIEW={};
const GAME={
 maps:['s','v','fg','nx'],
 reset(){st=null;vsel=''},
 setup(n,id,ui){const R=ui.n||3,L=WORDS.length,recent=LS.get(TOOL+'_recent',[]);let pool=[...WORDS.keys()].filter(i=>!recent.includes(i));if(pool.length<R)pool=[...WORDS.keys()];
  const w=shuffle(pool).slice(0,R);LS.set(TOOL+'_recent',[...recent,...w].slice(-40));
  return {w:w.map((i,r)=>(i+hash(id+':w'+r))%L),f:w.map((_,r)=>(rint(n)+hash(id+':f'+r))%n)}},
 settings(){return `<div class="lbl">몇 판?</div><div class="chips">${[3,5].map(n=>opt('n',n,n+'판')).join('')}</div>`},
 derive(g){
  const P=g.pl,n=P.length,D=Dof(g),stop=stopOf(g,D),sk=skipsOf(P,D),R=g.w.length,L=WORDS.length,score={};P.forEach(id=>score[id]=0);
  const hist=[],halt=o=>stop?{...o,ph:'end',stopped:stop}:o;
  for(let r=0;r<R;r++){
   const [cat,word]=WORDS[((g.w[r]-hash(g.id+':w'+r))%L+L)%L],fake=P[((g.f[r]-hash(g.id+':f'+r))%n+n)%n];
   const order=P.map((_,i)=>P[(i+r)%n]),strokes=[];let turn='',tk='';
   for(let lap=0;lap<2&&!turn;lap++)for(const id of order){const k=r+'_'+lap,v=(D(id).s||{})[k];
    if(typeof v==='string'&&v)strokes.push({id,v});else if(sk.has('s:'+id+':'+k))strokes.push({id,v:''});else{turn=id;tk=k;break}}
   const base={g,P,D,R,r,cat,word,fake,order,strokes,score,hist};
   if(turn)return halt({...base,ph:'draw',turn,tk,done:strokes.length,total:2*n});
   const votes=P.map(id=>({id,to:(D(id).v||{})[r]})).filter(x=>P.includes(x.to)&&x.to!==x.id);
   const missing=P.filter(id=>!votes.some(x=>x.id===id)&&!sk.has('v:'+id+':'+r));
   if(missing.length)return halt({...base,ph:'vote',votes,missing});
   const cnt={};votes.forEach(x=>cnt[x.to]=(cnt[x.to]||0)+1);const mx=Math.max(0,...Object.values(cnt)),top=P.filter(id=>cnt[id]===mx&&mx>0);
   const caught=top.length===1&&top[0]===fake,accused=top.length===1?top[0]:'';
   let fg=null;
   if(caught){fg=(D(fake).fg||{})[r];if(!(typeof fg==='string'&&fg)){if(sk.has('fg:'+fake+':'+r))fg='(건너뜀)';else return halt({...base,ph:'fguess',votes,cnt,accused,caught})}}
   const guessed=caught&&norm(fg)===norm(word),fakeWin=!caught||guessed;
   const pts={};P.forEach(id=>pts[id]=fakeWin?(id===fake?2:0):(id===fake?0:1));
   const out={...base,votes,cnt,accused,caught,fg,guessed,fakeWin,pts};
   if(!anyFlag(P,D,'nx',r))return halt({...out,ph:'reveal'});
   P.forEach(id=>score[id]+=pts[id]);hist.push(out);
  }
  return {g,P,D,R,ph:'end',score,hist};
 },
 buzz(s){return (s.ph==='draw'&&s.turn===ME)||(s.ph==='vote'&&s.missing.includes(ME))||(s.ph==='fguess'&&s.fake===ME)},
 busy(){return !!(st&&st.cur)},
 list(s,extra){const l=s.strokes.map(x=>x.v).filter(Boolean);if(extra)l.push(extra);return l},
 topic(s){return s.fake===ME?`<div class="fake">🎭 나는 가짜 화가!</div><div class="cat">주제: <b>${esc(s.cat)}</b> · 제시어는 몰라요. 들키지 않게 그려요</div>`:`<div class="cat">주제: ${esc(s.cat)}</div><div class="word">${esc(s.word)}</div>`},
 play(s,key,me){
  const mini=`<div class="mini">${s.P.map(id=>`<span>${avOf(id)} ${s.score[id]}</span>`).join('')}</div>`;
  let h=`<div class="small" style="text-align:center">${s.r+1} / ${s.R} 판</div>${mini}`;
  if(me)h+=`<div class="card">${GAME.topic(s)}</div>`;
  if(s.ph==='draw'){
   const ord=s.order.concat(s.order);
   h+=`<div class="order">${ord.map((id,i)=>`<span class="${i<s.done?'dn':i===s.done?'now':''}" style="border-bottom-color:${PCOL[PCI[s.P.indexOf(id)%PCI.length]]}">${avOf(id)}</span>`).join('')}</div>`;
   if(s.turn===ME){
    if(!st||st.key!==key)st={key,cur:null,done:''};
    h+=`<div class="card"><h2>🖌️ 내 차례! 한 붓만 그려요</h2><div class="padw"><canvas id="pad"></canvas></div><div class="small" style="text-align:center">손가락을 떼면 한 줄 끝. 마음에 안 들면 다시 그어요</div><div class="two"><button class="big gray" data-act="redo" ${st.done?'':'disabled'}>↩️ 다시 긋기</button><button class="big" data-act="sendd" ${st.done?'':'disabled'}>이걸로! ✅</button></div></div>`;
   }else{
    VIEW.see=GAME.list(s);
    h+=`<div class="card"><h2><span class="wait">🖌️</span> ${esc(nameOf(s.turn))}님이 그리는 중</h2><div class="vieww"><canvas class="view" id="see"></canvas></div></div>`;
    if(me)h+=waitBtn(key,60000,[s.turn],id=>'s:'+id+':'+s.tk);
   }
  }else if(s.ph==='vote'){
   VIEW.see=GAME.list(s);
   const mineV=(s.D(ME).v||{})[s.r];
   h+=`<div class="card"><div class="vieww"><canvas class="view" id="see"></canvas></div></div>`;
   if(me&&!s.P.includes(mineV)){
    h+=`<div class="card"><h2>🕵️ 가짜 화가는 누구?</h2>${s.P.filter(id=>id!==ME).map(id=>`<button class="vt${vsel===id?' on':''}" data-act="vs" data-id="${id}">${who(id)}</button>`).join('')}<button class="big" data-act="vote" ${vsel?'':'disabled'}>투표하기 🗳️</button></div>`;
   }else if(me)h+=`<div class="card" style="text-align:center;font-size:18px">✅ ${esc(nameOf(mineV))}님에게 투표했어요 <button class="chip" data-act="unvote">바꾸기</button></div>`;
   h+=`<div class="card"><h2>⏳ 투표 중</h2>${s.P.map(id=>`<div class="row"><div class="av">${avOf(id)}</div><div class="nm">${esc(nameOf(id))}</div><span class="tag${s.missing.includes(id)?' turn':' on'}">${s.missing.includes(id)?'고민 중 🤔':'투표했어요'}</span></div>`).join('')}</div>`;
   if(me)h+=waitBtn(key,45000,s.missing,id=>'v:'+id+':'+s.r);
  }else if(s.ph==='fguess'){
   VIEW.see=GAME.list(s);
   h+=`<div class="card res"><div class="em">🚨</div><div class="t">${esc(nameOf(s.fake))}님이 가짜 화가였어요!</div><p>하지만 제시어를 맞히면 역전승!</p></div><div class="card"><div class="vieww"><canvas class="view" id="see"></canvas></div></div>`;
   if(s.fake===ME)h+=`<div class="card"><h2>🎯 제시어는 무엇일까요? (주제: ${esc(s.cat)})</h2><input type="text" id="fgIn" maxlength="12" placeholder="그림을 보고 맞혀요" autocomplete="off" data-enter="fg"><div class="err">${esc(errMsg)}</div><button class="big" data-act="fg">이거다! ✋</button></div>`;
   else{h+=`<div class="card" style="text-align:center;font-size:18px"><span class="wait">🤔</span> ${esc(nameOf(s.fake))}님이 제시어를 생각하는 중</div>`;if(me)h+=waitBtn(key,60000,[s.fake],id=>'fg:'+id+':'+s.r)}
  }else{
   VIEW.see=GAME.list(s);
   h+=`<div class="card res"><div class="em">${s.fakeWin?'🎭':'🎨'}</div><div class="t">${s.fakeWin?'가짜 화가 승리!':'화가들 승리!'}</div>
   <p>가짜 화가: <b>${who(s.fake)}</b> · 제시어: <b>${esc(s.word)}</b></p>
   <p class="small">${s.caught?(s.guessed?`붙잡혔지만 "${esc(s.fg)}" 정답으로 역전! 😎`:`붙잡혔고 "${esc(s.fg)}"(으)로 틀렸어요`):s.accused?`${esc(nameOf(s.accused))}님이 억울하게 의심받았어요 😂`:'표가 갈려서 가짜가 빠져나갔어요'}</p>
   <div class="vieww"><canvas class="view" id="see"></canvas></div>
   ${s.P.map(id=>`<div class="row"><div class="av">${avOf(id)}</div><div class="nm" style="text-align:left">${esc(nameOf(id))} <span class="small">표 ${s.cnt[id]||0}${s.votes.find(x=>x.id===id)?' · → '+esc(nameOf(s.votes.find(x=>x.id===id).to)):''}</span></div><b>+${s.pts[id]}</b></div>`).join('')}
   ${me?`<button class="big" data-act="next">${s.r+1<s.R?'다음 판 ▶':'결과 보기 🏆'}</button>`:''}</div>`;
  }
  return h;
 },
 after(changed){
  const pad=$('pad');if(pad&&st){fitCanvas(pad);const g=current(),s=g&&GAME.derive(g);paintStrokes(pad,s&&s.strokes?GAME.list(s,st.cur&&st.cur.p.length?strokeStr(st.cur):st.done):[])}
  document.querySelectorAll('canvas.view').forEach(c=>{const w=c.width;fitCanvas(c);if(changed||c.width!==w||!c.__p){paintStrokes(c,VIEW[c.id]||[]);c.__p=1}});
 },
 end(s){
  const order=s.P.slice().sort((a,b)=>s.score[b]-s.score[a]),mx=s.score[order[0]];
  let h=`<div class="card res"><div class="em">🏆</div><div class="t">${mx>0?order.filter(id=>s.score[id]===mx).map(nameOf).map(esc).join(', ')+'님 1등!':'다음 판을 기대해요!'}</div>
  ${order.map((id,i)=>`<div class="row"><div class="av">${['🥇','🥈','🥉'][i]||avOf(id)}</div><div class="nm">${esc(nameOf(id))}</div><b>${s.score[id]}점</b></div>`).join('')}</div>`;
  s.hist.forEach((x,i)=>{const cid='h'+i;VIEW[cid]=x.strokes.map(y=>y.v).filter(Boolean);h+=`<div class="card"><h2>${i+1}판: ${esc(x.word)} <span class="small">(가짜 ${esc(nameOf(x.fake))} · ${x.fakeWin?'🎭 가짜 승':'🎨 화가 승'})</span></h2><div class="vieww"><canvas class="view" id="${cid}"></canvas></div></div>`});
  return h;
 },
 record(s){if(s.stopped)return;const b=LS.get(TOOL+'_rec',{wins:{},done:[]});if(b.done.includes(s.g.id))return;const mx=Math.max(...s.P.map(id=>s.score[id]));if(mx>0)s.P.filter(id=>s.score[id]===mx).forEach(id=>b.wins[id]=(b.wins[id]||0)+1);b.done=[...b.done,s.g.id].slice(-40);LS.set(TOOL+'_rec',b)},
 recordHTML(){const b=LS.get(TOOL+'_rec',{wins:{}});const any=MEMBERS.some(m=>b.wins[m.id]);return `<div class="card"><h2>🏆 이 폰에서 본 1등 횟수</h2>${any?`<div class="score">${MEMBERS.map(m=>`<div>${avOf(m.id)}<b>${b.wins[m.id]||0}</b><span class="small">${esc(m.name)}</span></div>`).join('')}</div>`:'<div class="small">아직 기록이 없어요</div>'}</div>`},
 act(a,el,g,s,me){
  if(!me)return;const p=myP(g);
  if(a==='redo'&&st){st.done='';st.cur=null;render();GAME.after(false)}
  else if(a==='sendd'&&s.ph==='draw'&&s.turn===ME&&st&&st.done){p.s[s.tk]=st.done;st=null;commit()}
  else if(a==='vs'&&s.ph==='vote'){vsel=el.dataset.id;render()}
  else if(a==='vote'&&s.ph==='vote'&&vsel&&vsel!==ME){p.v[s.r]=vsel;vsel='';commit()}
  else if(a==='unvote'&&s.ph==='vote'){delete p.v[s.r];commit()}
  else if(a==='fg'&&s.ph==='fguess'&&s.fake===ME){const v=(($('fgIn')||{}).value||'').trim();if(!v)return setErr('제시어를 적어 주세요');p.fg[s.r]=v.slice(0,12);commit()}
  else if(a==='next'&&s.ph==='reveal'){p.nx[s.r]=1;commit()}
 }
};
/* 그림판 입력: 한 붓만 */
function padPt(e,cv){const r=cv.getBoundingClientRect();return [Math.max(0,Math.min(1000,(e.clientX-r.left)/r.width*1000)),Math.max(0,Math.min(1000,(e.clientY-r.top)/r.height*1000))]}
document.addEventListener('pointerdown',e=>{
 const cv=e.target;if(!cv||cv.id!=='pad'||!st||st.done)return;e.preventDefault();
 const g=current();if(!g)return;const ci=PCI[g.pl.indexOf(ME)%PCI.length];
 try{cv.setPointerCapture(e.pointerId)}catch(x){}
 st.cur={c:ci,w:1,p:[padPt(e,cv)]};GAME.after(false);
});
document.addEventListener('pointermove',e=>{
 if(!st||!st.cur)return;const cv=$('pad');if(!cv)return;e.preventDefault();
 const q=padPt(e,cv),l=st.cur.p[st.cur.p.length-1];if(Math.hypot(q[0]-l[0],q[1]-l[1])<6||st.cur.p.length>=MAXP)return;
 st.cur.p.push(q);
 const cx=cv.getContext('2d'),k=cv.width/1000;cx.strokeStyle=PCOL[st.cur.c];cx.lineWidth=PWID[1]*k;cx.lineCap='round';cx.beginPath();cx.moveTo(l[0]*k,l[1]*k);cx.lineTo(q[0]*k,q[1]*k);cx.stroke();
},{passive:false});
['pointerup','pointercancel'].forEach(t=>document.addEventListener(t,()=>{if(st&&st.cur){st.done=strokeStr(st.cur);st.cur=null;render();GAME.after(false)}}));
