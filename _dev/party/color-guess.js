/*META
{"tool":"color-guess","title":"색깔 맞히기","emoji":"🎨","min":2,
 "sub":"96가지 색 중 숨은 한 칸!<br>색깔 이름 없이 한마디로 설명하고 맞혀요 (휴 앤 큐 방식)",
 "rules":["차례마다 한 명이 <b>출제자</b>예요. 출제자 폰에만 숨은 색 한 칸이 보여요.","출제자는 <b>한 단어</b> 힌트를 줘요. 예) \"바나나\" · 빨강·파랑 같은 <b>색깔 이름은 금지!</b>","나머지는 각자 판에서 한 칸을 골라요. 그다음 출제자가 <b>두 단어까지</b> 두 번째 힌트를 주면, 한 칸을 더 골라요.","정답 칸 3점 · 바로 옆(테두리 1칸) 2점 · 2칸 거리 1점. 출제자는 정답 주변 3×3 안에 들어온 표시 하나마다 1점!","한 바퀴(또는 두 바퀴) 돌면 점수가 제일 높은 사람이 우승 🏆"],
 "ui":{"l":1},
 "cssvars":"--bg:#fbf6f1;--ink:#3b2f2a;--sub:#7d6d64;--line:#eadfd6;--soft:#f4ebe3;--pri:#ffd08a;--pri2:#d9a24a;--card:#fffdfb",
 "css":".cg{display:grid;grid-template-columns:repeat(12,1fr);gap:2px;user-select:none}.cg .c{aspect-ratio:1/1;border-radius:4px;border:0;padding:0;box-shadow:none;position:relative;display:flex;align-items:center;justify-content:center;font-size:12px;line-height:1}.cg .c:active{transform:none}.cg .c:disabled{opacity:1}.cg .c.on{outline:3px solid #222;outline-offset:1px;z-index:2}.cg .c.tg{outline:3px solid #fff;box-shadow:0 0 0 5px #222;z-index:3}.cg .c.ring{outline:2px dashed rgba(0,0,0,.45);outline-offset:-2px}.sw{width:96px;height:96px;border-radius:20px;margin:6px auto;border:4px solid #fff;box-shadow:0 4px 12px rgba(0,0,0,.15)}.clue{text-align:center;font-size:28px;margin:4px 0;color:#9a4a1a;word-break:keep-all}.mini{display:flex;justify-content:center;gap:12px;font-size:14px;color:var(--sub);margin:2px 0 6px}.lg{display:flex;flex-wrap:wrap;gap:6px 12px;justify-content:center;font-size:13px;color:var(--sub);margin-top:6px}"}
META*/
const NC=12,NR=8,NCELL=NC*NR;
const colorOf=i=>{const c=i%NC,r=Math.floor(i/NC);return `hsl(${c*30},${r<2?60+r*15:85-(r-2)*6}%,${86-r*9}%)`};
const BAN=['빨강','빨간','파랑','파란','노랑','노란','초록','녹색','보라','주황','분홍','핑크','갈색','검정','검은','하양','하얀','흰','회색','남색','연두','레드','블루','그린','옐로','퍼플','오렌지','색'];
const dist=(a,b)=>Math.max(Math.abs(a%NC-b%NC),Math.abs(Math.floor(a/NC)-Math.floor(b/NC)));
const ptOf=d=>d===0?3:d===1?2:d===2?1:0;
let sel=-1;
const GAME={
 maps:['c1','c2','a1','a2','nx'],
 reset(){sel=-1},
 setup(n,id,ui){const R=n*(ui.l||1);return {t:[...Array(R)].map((_,r)=>(rint(NCELL)+hash(id+':'+r))%NCELL)}},
 settings(){return `<div class="lbl">몇 바퀴? (한 바퀴 = 모두 한 번씩 출제)</div><div class="chips">${opt('l',1,'1바퀴')}${opt('l',2,'2바퀴')}</div>`},
 derive(g){
  const P=g.pl,n=P.length,D=Dof(g),stop=stopOf(g,D),sk=skipsOf(P,D),R=g.t.length,score={};P.forEach(id=>score[id]=0);
  const hist=[],halt=o=>stop?{...o,ph:'end',stopped:stop}:o;
  for(let r=0;r<R;r++){
   const giver=P[r%n],t=((g.t[r]-hash(g.id+':'+r))%NCELL+NCELL)%NCELL,others=P.filter(id=>id!==giver);
   const base={g,P,D,R,r,giver,t,score,hist,others};
   const c1=(D(giver).c1||{})[r],c2=(D(giver).c2||{})[r];
   const okS=v=>typeof v==='string'&&v,okN=v=>typeof v==='number';
   if(!okS(c1)){if(sk.has('c:'+giver+':'+r)){hist.push({r,giver,t,c1:'(건너뜀)',c2:'',p1:[],p2:[],pts:{}});continue}return halt({...base,ph:'clue1'})}
   const p1=others.map(id=>({id,v:(D(id).a1||{})[r]})).filter(x=>okN(x.v));
   const m1=others.filter(id=>!p1.some(x=>x.id===id)&&!sk.has('a1:'+id+':'+r));
   if(m1.length)return halt({...base,ph:'pick1',c1,p1,missing:m1});
   if(!okS(c2)&&!sk.has('c2:'+giver+':'+r))return halt({...base,ph:'clue2',c1,p1});
   const p2=others.map(id=>({id,v:(D(id).a2||{})[r]})).filter(x=>okN(x.v));
   const m2=okS(c2)?others.filter(id=>!p2.some(x=>x.id===id)&&!sk.has('a2:'+id+':'+r)):[];
   if(m2.length)return halt({...base,ph:'pick2',c1,c2,p1,p2,missing:m2});
   const pts={};others.forEach(id=>pts[id]=0);pts[giver]=0;
   [...p1,...p2].forEach(x=>{const d=dist(x.v,t);pts[x.id]+=ptOf(d);if(d<=1)pts[giver]++});
   if(!anyFlag(P,D,'nx',r))return halt({...base,ph:'reveal',c1,c2:okS(c2)?c2:'',p1,p2,pts});
   P.forEach(id=>score[id]+=pts[id]||0);hist.push({r,giver,t,c1,c2:okS(c2)?c2:'',p1,p2,pts});
  }
  return {g,P,D,R,ph:'end',score,hist};
 },
 buzz(s){return ((s.ph==='clue1'||s.ph==='clue2')&&s.giver===ME)||((s.ph==='pick1'||s.ph==='pick2')&&s.missing.includes(ME))},
 grid(o){ // o: {pick, sel, t, marks:{idx:[emoji]}, ring}
  let h='<div class="cg">';
  for(let i=0;i<NCELL;i++){const cls=['c'];if(o.sel===i)cls.push('on');if(o.t===i)cls.push('tg');else if(o.ring!=null&&dist(i,o.ring)===1)cls.push('ring');
   const mk=(o.marks&&o.marks[i]||[]).slice(0,2).join('');
   h+=`<button class="${cls.join(' ')}" style="background:${colorOf(i)}" ${o.pick?`data-act="cell" data-i="${i}"`:'disabled'}>${mk}</button>`}
  return h+'</div>';
 },
 marks(list){const m={};list.forEach(x=>(m[x.v]=m[x.v]||[]).push(avOf(x.id)));return m},
 play(s,key,me){
  const mini=`<div class="mini">${s.P.map(id=>`<span>${avOf(id)} ${s.score[id]}</span>`).join('')}</div>`;
  let h=`<div class="small" style="text-align:center">${s.r+1} / ${s.R} 번째 · 출제자 ${who(s.giver)}</div>${mini}`;
  const isG=s.giver===ME;
  if(s.ph==='clue1'||s.ph==='clue2'){
   const second=s.ph==='clue2';
   if(isG){
    h+=`<div class="card"><h2>🤫 나만 보는 정답 색</h2><div class="sw" style="background:${colorOf(s.t)}"></div>${second?`<div class="small" style="text-align:center">첫 힌트 "${esc(s.c1)}" · 가족들이 고른 곳 ⬇️</div>`:''}
    <div class="small" style="margin-top:6px">${second?'<b>두 단어까지</b> 두 번째 힌트를 줘요':'<b>한 단어</b> 힌트를 줘요'}. 색깔 이름은 쓰면 안 돼요!</div>
    <input type="text" id="clueIn" maxlength="16" placeholder="${second?'예) 덜 익은 바나나':'예) 바나나'}" autocomplete="off" data-enter="clue"><div class="err">${esc(errMsg)}</div><button class="big" data-act="clue">힌트 보내기 📨</button></div>`;
    h+=`<div class="card">${GAME.grid({t:s.t,marks:second?GAME.marks(s.p1):{}})}</div>`;
   }else{
    h+=`<div class="card" style="text-align:center">${second?`<div class="small">첫 힌트</div><div class="clue">"${esc(s.c1)}"</div>`:''}<div style="font-size:18px"><span class="wait">🤔</span> ${esc(nameOf(s.giver))}님이 ${second?'두 번째 ':''}힌트를 생각하는 중</div></div>`;
    h+=`<div class="card">${GAME.grid({marks:second?GAME.marks(s.p1):{}})}</div>`;
   }
   if(me)h+=waitBtn(key,60000,[s.giver],id=>(second?'c2:':'c:')+id+':'+s.r,second?'두 번째 힌트 없이 진행':'차례 건너뛰기');
  }else if(s.ph==='pick1'||s.ph==='pick2'){
   const second=s.ph==='pick2',mineV=((s.D(ME)[second?'a2':'a1'])||{})[s.r];
   h+=`<div class="card" style="text-align:center"><div class="small">${who(s.giver)}님의 힌트</div><div class="clue">"${esc(s.c1)}"${second?` → "${esc(s.c2)}"`:''}</div></div>`;
   const prev=GAME.marks(s.p1);
   if(me&&!isG&&typeof mineV!=='number'){
    h+=`<div class="card"><h2>👆 ${second?'한 칸 더':'한 칸'} 골라요</h2>${GAME.grid({pick:true,sel,marks:second?prev:{}})}<button class="big" data-act="send" ${sel>=0?'':'disabled'}>여기! 🎯</button></div>`;
   }else{
    h+=`<div class="card">${GAME.grid({t:isG?s.t:null,marks:second?prev:{}})}${me&&!isG?`<div style="text-align:center;margin-top:8px">✅ 골랐어요</div><button class="big gray" data-act="edit">✏️ 다시 고르기</button>`:''}</div>`;
   }
   h+=`<div class="card"><h2>⏳ 고르는 중</h2>${s.others.map(id=>`<div class="row"><div class="av">${avOf(id)}</div><div class="nm">${esc(nameOf(id))}</div><span class="tag${s.missing.includes(id)?' turn':' on'}">${s.missing.includes(id)?'고민 중 🤔':'골랐어요'}</span></div>`).join('')}</div>`;
   if(me)h+=waitBtn(key,45000,s.missing,id=>(second?'a2:':'a1:')+id+':'+s.r);
  }else{
   h+=`<div class="card"><h2>🎉 정답 공개!</h2><div class="clue">"${esc(s.c1)}"${s.c2?` → "${esc(s.c2)}"`:''}</div><div class="sw" style="background:${colorOf(s.t)}"></div>${GAME.grid({t:s.t,ring:s.t,marks:GAME.marks([...s.p1,...s.p2])})}
   <div class="lg"><span>⬛ 굵은 테두리 = 정답</span><span>점선 = 바로 옆 칸</span></div>
   <div style="margin-top:8px">${s.others.map(id=>`<div class="row"><div class="av">${avOf(id)}</div><div class="nm">${esc(nameOf(id))}</div><b>+${s.pts[id]}</b></div>`).join('')}<div class="row"><div class="av">${avOf(s.giver)}</div><div class="nm">${esc(nameOf(s.giver))} <span class="small">(출제자)</span></div><b>+${s.pts[s.giver]}</b></div></div>
   ${me?`<button class="big" data-act="next">${s.r+1<s.R?'다음 ▶':'결과 보기 🏆'}</button>`:''}</div>`;
  }
  return h;
 },
 end(s){
  const order=s.P.slice().sort((a,b)=>s.score[b]-s.score[a]),mx=s.score[order[0]];
  let h=`<div class="card res"><div class="em">🏆</div><div class="t">${mx>0?order.filter(id=>s.score[id]===mx).map(nameOf).map(esc).join(', ')+'님 1등!':'다음 판을 기대해요!'}</div>
  ${order.map((id,i)=>`<div class="row"><div class="av">${['🥇','🥈','🥉'][i]||avOf(id)}</div><div class="nm">${esc(nameOf(id))}</div><b>${s.score[id]}점</b></div>`).join('')}</div>`;
  if(s.hist.length)h+=`<div class="card"><h2>📜 이번 판 힌트 모음</h2>${s.hist.map(x=>`<div class="row"><div class="av" style="background:${colorOf(x.t)}"></div><div class="nm" style="font-size:15px">"${esc(x.c1)}"${x.c2?` → "${esc(x.c2)}"`:''} <span class="small">(${esc(nameOf(x.giver))})</span></div></div>`).join('')}</div>`;
  return h;
 },
 record(s){if(s.stopped)return;const b=LS.get(TOOL+'_rec',{wins:{},done:[]});if(b.done.includes(s.g.id))return;const mx=Math.max(...s.P.map(id=>s.score[id]));if(mx>0)s.P.filter(id=>s.score[id]===mx).forEach(id=>b.wins[id]=(b.wins[id]||0)+1);b.done=[...b.done,s.g.id].slice(-40);LS.set(TOOL+'_rec',b)},
 recordHTML(){const b=LS.get(TOOL+'_rec',{wins:{}});const any=MEMBERS.some(m=>b.wins[m.id]);return `<div class="card"><h2>🏆 이 폰에서 본 1등 횟수</h2>${any?`<div class="score">${MEMBERS.map(m=>`<div>${avOf(m.id)}<b>${b.wins[m.id]||0}</b><span class="small">${esc(m.name)}</span></div>`).join('')}</div>`:'<div class="small">아직 기록이 없어요</div>'}</div>`},
 act(a,el,g,s,me){
  if(!me)return;const p=myP(g);
  if(a==='clue'&&(s.ph==='clue1'||s.ph==='clue2')&&s.giver===ME){
   const v=(($('clueIn')||{}).value||'').trim().replace(/\s+/g,' ');if(!v)return setErr('힌트를 적어 주세요');
   const words=v.split(' ');
   if(s.ph==='clue1'&&words.length>1)return setErr('첫 힌트는 한 단어만 (띄어쓰기 없이)');
   if(words.length>2)return setErr('두 단어까지만 쓸 수 있어요');
   const bad=BAN.find(b=>v.replace(/\s/g,'').includes(b));if(bad)return setErr(`색깔 이름("${bad}")은 쓸 수 없어요`);
   p[s.ph==='clue1'?'c1':'c2'][s.r]=v.slice(0,16);commit();
  }
  else if(a==='cell'&&(s.ph==='pick1'||s.ph==='pick2')){sel=+el.dataset.i;render()}
  else if(a==='send'&&(s.ph==='pick1'||s.ph==='pick2')&&s.giver!==ME&&sel>=0){p[s.ph==='pick1'?'a1':'a2'][s.r]=sel;sel=-1;commit()}
  else if(a==='edit'&&(s.ph==='pick1'||s.ph==='pick2')){delete p[s.ph==='pick1'?'a1':'a2'][s.r];commit()}
  else if(a==='next'&&s.ph==='reveal'){p.nx[s.r]=1;sel=-1;commit()}
 }
};
