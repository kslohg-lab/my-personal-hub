/*META
{"tool":"spice-market","title":"보석 시장","emoji":"🐪","min":2,"max":2,
 "sub":"시장에서 물건을 가져오고, 바꾸고, 모아서 팔아요!<br>둘이서 하는 장사 대결 (자이푸르 방식)",
 "rules":["내 차례에 <b>한 가지</b>만 해요: ① 시장에서 물건 1장 가져오기 ② 낙타 모두 가져오기 ③ 시장 물건 2장 이상을 내 카드·낙타와 바꾸기 ④ 같은 물건 여러 장 팔기","팔 때는 그 물건 토큰을 위에서부터 가져가요. <b>먼저 파는 사람이 비싸게</b> 팔아요! 💎🥇🥈는 2장 이상만 팔 수 있어요.","한 번에 3장·4장·5장 이상 팔면 보너스 토큰(숫자는 비밀)을 받아요.","손에는 물건 7장까지만. 낙타는 손 장수에 안 세요.","물건 토큰 3종류가 다 떨어지거나 카드 더미가 바닥나면 끝! 낙타가 더 많은 사람 +5. 돈이 많은 사람이 승리."],
 "ui":{},
 "cssvars":"--bg:#fff5e8;--ink:#4a3218;--sub:#8e6a44;--line:#f0d9b6;--soft:#fde7c4;--pri:#ffc46b;--pri2:#d6922f;--card:#fffcf6",
 "css":".cards{display:flex;flex-wrap:wrap;gap:6px;justify-content:center}.cd{width:58px;height:78px;border-radius:10px;font-size:26px;display:flex;flex-direction:column;align-items:center;justify-content:center;border:3px solid #fff;box-shadow:0 3px 0 rgba(0,0,0,.12);padding:0}.cd small{font-size:11px;margin-top:2px}.cd.on{transform:translateY(-6px);outline:3px solid #2b6fd6}.cD{background:#ffd6e0}.cG{background:#fff0a8}.cS{background:#e6ecf2}.cC{background:#e3d6ff}.cP{background:#ffd2b0}.cL{background:#e8d2bc}.cK{background:#f5e6c8}.tk{display:flex;align-items:center;gap:6px;margin:4px 0;font-size:14px}.tk .ic{width:28px;text-align:center;font-size:20px}.tk .ts{display:flex;gap:3px;flex-wrap:wrap}.tk .ts i{font-style:normal;min-width:24px;height:24px;border-radius:12px;background:#fff;border:2px solid var(--line);display:flex;align-items:center;justify-content:center;font-size:12px}.tk .ts i:first-child{background:var(--pri);border-color:var(--pri2)}.acts{display:grid;grid-template-columns:1fr 1fr;gap:8px}.acts .big{margin-top:0;height:52px;font-size:16px}.opp{display:flex;justify-content:space-between;align-items:center;font-size:15px}.herd{display:flex;align-items:center;gap:8px;justify-content:center;margin-top:8px}.herd button{padding:6px 12px;font-size:14px}"}
META*/
const TY=['D','G','S','C','P','L'],EM={D:'💎',G:'🥇',S:'🥈',C:'🧵',P:'🌶️',L:'👞',K:'🐪'},NM={D:'보석',G:'금',S:'은',C:'비단',P:'향신료',L:'가죽',K:'낙타'};
const PRECIOUS='DGS',TOK={D:[7,7,5,5,5],G:[6,6,5,5,5],S:[5,5,5,5,5],C:[5,3,3,2,2,1,1],P:[5,3,3,2,2,1,1],L:[4,3,2,1,1,1,1,1,1]};
let selM=[],selH=[],selK=0;
const GAME={
 reset(){selM=[];selH=[];selK=0},
 setup(){return {seed:Math.floor(Math.random()*1e9),first:rint(2)}},
 settings(){return `<div class="small">둘이서 한 판 (15~20분). 먼저 할 사람은 무작위로 정해요.</div>`},
 derive(g){
  const P=g.pl,D=Dof(g),stop=stopOf(g,D),r=rng(g.seed);
  let deck=[];[['D',6],['G',6],['S',6],['C',8],['P',8],['L',10],['K',8]].forEach(([t,c])=>{for(let i=0;i<c;i++)deck.push(t)});
  deck=sshuffle(deck,r);
  const bon={3:sshuffle([3,3,2,2,2,1,1],r),4:sshuffle([6,6,5,5,4,4],r),5:sshuffle([10,10,9,8,8],r)};
  const tok={};TY.forEach(t=>tok[t]=TOK[t].slice());
  const market=['K','K','K',deck.pop(),deck.pop()];
  const pl=[0,1].map(()=>({hand:[],camel:0,coins:0,bonus:[],goods:0}));
  for(let k=0;k<5;k++)for(let q=0;q<2;q++){const c=deck.pop();if(c==='K')pl[q].camel++;else pl[q].hand.push(c)}
  let turn=g.first||0,n=0,over=false,last='';
  const refill=()=>{while(market.length<5&&deck.length)market.push(deck.pop());if(market.length<5)over=true};
  const sortH=h=>h.sort((a,b)=>TY.indexOf(a)-TY.indexOf(b));
  pl.forEach(x=>sortH(x.hand));
  for(const m of movesOf(g,D)){
   if(over)break;if(m.n!==n||m.id!==P[turn])continue;
   const me=pl[turn],[k,a,b]=m.mv.split('|');let ok=false;
   if(k==='t'){const i=+a,c=market[i];if(c&&c!=='K'&&me.hand.length<7){market.splice(i,1);me.hand.push(c);refill();ok=true;last=`${EM[c]} 1장 가져감`}}
   else if(k==='k'){const c=market.filter(x=>x==='K').length;if(c){for(let i=market.length-1;i>=0;i--)if(market[i]==='K')market.splice(i,1);me.camel+=c;refill();ok=true;last=`🐪 ${c}마리 데려감`}}
   else if(k==='x'){
    const is=(a||'').split(',').filter(x=>x!=='').map(Number),gs=(b||'').split(',').filter(Boolean);
    const take=is.map(i=>market[i]);
    const hc={};me.hand.forEach(c=>hc[c]=(hc[c]||0)+1);const gc={};gs.forEach(c=>gc[c]=(gc[c]||0)+1);
    const valid=is.length>=2&&is.length===gs.length&&new Set(is).size===is.length&&take.every(c=>c&&c!=='K')&&gs.every(c=>!take.includes(c))&&Object.keys(gc).every(c=>c==='K'?me.camel>=gc[c]:(hc[c]||0)>=gc[c])&&me.hand.length+is.length-(gs.length-(gc.K||0))<=7;
    if(valid){is.slice().sort((x,y)=>y-x).forEach(i=>market.splice(i,1));gs.forEach(c=>{if(c==='K')me.camel--;else me.hand.splice(me.hand.indexOf(c),1);market.push(c)});take.forEach(c=>me.hand.push(c));ok=true;last=`${take.map(c=>EM[c]).join('')} ↔ ${gs.map(c=>EM[c]).join('')} 교환`}
   }
   else if(k==='s'){const t=a,c=+b,have=me.hand.filter(x=>x===t).length;
    if(TY.includes(t)&&c>=1&&c<=have&&(c>=2||!PRECIOUS.includes(t))){
     for(let i=0;i<c;i++)me.hand.splice(me.hand.indexOf(t),1);
     let got=0;for(let i=0;i<c;i++){const v=tok[t].shift();if(v!=null){got+=v;me.goods++}}
     me.coins+=got;const bk=c>=5?5:c;if(bk>=3&&bon[bk].length)me.bonus.push(bon[bk].shift());
     ok=true;last=`${EM[t]} ${c}장 팔아서 ${got}원${bk>=3?' + 보너스':''}`;
     if(TY.filter(x=>!tok[x].length).length>=3)over=true;
    }
   }
   if(!ok)continue;
   sortH(me.hand);n++;turn=1-turn;
  }
  const base={g,P,D,pl,market,tok,deck:deck.length,turn,n,last,r:n};
  if(over){
   const fin=pl.map(x=>({...x,total:x.coins+x.bonus.reduce((s,v)=>s+v,0)}));
   const cw=fin[0].camel>fin[1].camel?0:fin[1].camel>fin[0].camel?1:-1;if(cw>=0)fin[cw].total+=5;
   let w=fin[0].total>fin[1].total?0:fin[1].total>fin[0].total?1:fin[0].bonus.length!==fin[1].bonus.length?(fin[0].bonus.length>fin[1].bonus.length?0:1):fin[0].goods!==fin[1].goods?(fin[0].goods>fin[1].goods?0:1):-1;
   return {...base,ph:'end',fin,cw,w};
  }
  if(stop)return {...base,ph:'end',stopped:stop,fin:pl.map(x=>({...x,total:x.coins+x.bonus.reduce((s,v)=>s+v,0)})),cw:-1,w:-1};
  return {...base,ph:'play'};
 },
 buzz(s){return s.ph==='play'&&s.P[s.turn]===ME},
 card(c,on,act,extra){return `<button class="cd c${c}${on?' on':''}" ${act?act:'disabled style="opacity:1"'}>${EM[c]}<small>${NM[c]}${extra||''}</small></button>`},
 play(s,key,me){
  const my=s.P.indexOf(ME),side=my<0?0:my,op=1-side,mine1=s.pl[side],opp=s.pl[op],myTurn=me&&s.turn===side;
  let h=`<div class="card"><div class="opp"><span>${who(s.P[op])}</span><span>🂠 ${opp.hand.length}장 · 🐪 ${opp.camel} · 💰 ${opp.coins}${opp.bonus.length?` +🎁${opp.bonus.length}`:''}</span></div>${s.last?`<div class="small" style="text-align:center;margin-top:6px">방금: ${esc(s.last)}</div>`:''}</div>`;
  h+=`<div class="card"><h2>🏪 시장 <span class="small">(남은 카드 ${s.deck}장)</span></h2><div class="cards">${s.market.map((c,i)=>GAME.card(c,selM.includes(i),myTurn&&c!=='K'?`data-act="selm" data-i="${i}"`:'')).join('')}</div></div>`;
  h+=`<div class="card"><h2>${myTurn?'🙋 내 차례!':`<span class="wait">⏳</span> ${esc(nameOf(s.P[s.turn]))}님 차례`} · 내 손 ${mine1.hand.length}/7</h2><div class="cards">${mine1.hand.map((c,i)=>GAME.card(c,selH.includes(i),myTurn?`data-act="selh" data-i="${i}"`:'')).join('')||'<div class="small">손에 카드가 없어요</div>'}</div>
  <div class="herd">🐪 낙타 ${mine1.camel}마리${myTurn&&mine1.camel?` · 교환에 쓸 낙타 <button data-act="kminus">−</button> <b>${selK}</b> <button data-act="kplus">+</button>`:''}</div>
  <div class="small" style="text-align:center;margin-top:4px">💰 내 돈 ${mine1.coins}원${mine1.bonus.length?` + 🎁 보너스 ${mine1.bonus.join('·')}`:''}</div>`;
  if(myTurn){
   const sel=selH.map(i=>mine1.hand[i]),same=sel.length&&sel.every(c=>c===sel[0]),takeOne=selM.length===1&&!selH.length&&!selK;
   const canSell=same&&!selM.length&&!selK&&(sel.length>=2||!PRECIOUS.includes(sel[0]));
   const canX=selM.length>=2&&selH.length+selK===selM.length;
   h+=`<div class="acts" style="margin-top:10px"><button class="big" data-act="take" ${takeOne&&mine1.hand.length<7?'':'disabled'}>🛒 가져오기</button><button class="big" data-act="camel" ${s.market.includes('K')?'':'disabled'}>🐪 낙타 모두</button><button class="big" data-act="swap" ${canX?'':'disabled'}>🔄 교환 (${selM.length}↔${selH.length+selK})</button><button class="big" data-act="sell" ${canSell?'':'disabled'}>💰 ${canSell?`${NM[sel[0]]} ${sel.length}장 팔기`:'팔기'}</button></div>
   <div class="err">${esc(errMsg)}</div><div class="small" style="text-align:center">카드를 눌러서 고른 뒤 버튼을 눌러요. ${selM.length||selH.length||selK?'<button class="chip" data-act="clr">선택 지우기</button>':''}</div>`;
  }
  h+=`</div><div class="card"><h2>🪙 남은 토큰 (왼쪽부터 가져가요)</h2>${TY.map(t=>`<div class="tk"><span class="ic">${EM[t]}</span><span class="ts">${s.tok[t].map(v=>`<i>${v}</i>`).join('')||'<span class="small">다 팔림</span>'}</span></div>`).join('')}<div class="small">3·4·5장 팔면 보너스 토큰 / 다 떨어진 토큰 ${TY.filter(t=>!s.tok[t].length).length}/3이면 끝</div></div>`;
  return h;
 },
 end(s){
  const f=s.fin;
  return `<div class="card res"><div class="em">${s.w<0?'🤝':s.P[s.w]===ME?'🏆':'🐪'}</div><div class="t">${s.stopped?'게임 기록':s.w<0?'무승부!':esc(nameOf(s.P[s.w]))+'님 승리!'}</div>
  ${[0,1].map(i=>`<div class="row"><div class="av">${avOf(s.P[i])}</div><div class="nm">${esc(nameOf(s.P[i]))}<div class="small">물건 ${f[i].coins} + 보너스 ${f[i].bonus.reduce((a,v)=>a+v,0)} (${f[i].bonus.join('·')||'없음'})${s.cw===i?' + 낙타왕 5':''} · 🐪${f[i].camel}</div></div><b>${f[i].total}원</b></div>`).join('')}</div>`;
 },
 record(s){if(s.stopped||s.w<0)return;const b=LS.get(TOOL+'_rec',{wins:{},done:[]});if(b.done.includes(s.g.id))return;const id=s.P[s.w];b.wins[id]=(b.wins[id]||0)+1;b.done=[...b.done,s.g.id].slice(-40);LS.set(TOOL+'_rec',b)},
 recordHTML(){const b=LS.get(TOOL+'_rec',{wins:{}});const any=MEMBERS.some(m=>b.wins[m.id]);return `<div class="card"><h2>🏆 이 폰에서 본 승리 횟수</h2>${any?`<div class="score">${MEMBERS.map(m=>`<div>${avOf(m.id)}<b>${b.wins[m.id]||0}</b><span class="small">${esc(m.name)}</span></div>`).join('')}</div>`:'<div class="small">아직 기록이 없어요</div>'}</div>`},
 act(a,el,g,s,me){
  if(!me||s.ph!=='play')return;const my=s.P.indexOf(ME);if(s.turn!==my)return;
  const mine1=s.pl[my],tog=(arr,i)=>arr.includes(i)?arr.filter(x=>x!==i):[...arr,i];
  if(a==='selm'){selM=tog(selM,+el.dataset.i);errMsg='';render()}
  else if(a==='selh'){selH=tog(selH,+el.dataset.i);errMsg='';render()}
  else if(a==='kplus'){selK=Math.min(mine1.camel,selK+1);render()}
  else if(a==='kminus'){selK=Math.max(0,selK-1);render()}
  else if(a==='clr'){GAME.reset();render()}
  else if(a==='take'&&selM.length===1){const i=selM[0];GAME.reset();pushMove(g,s.n,'t|'+i)}
  else if(a==='camel'){GAME.reset();pushMove(g,s.n,'k')}
  else if(a==='sell'){const sel=selH.map(i=>mine1.hand[i]);GAME.reset();pushMove(g,s.n,'s|'+sel[0]+'|'+sel.length)}
  else if(a==='swap'){
   const take=selM.map(i=>s.market[i]),give=[...selH.map(i=>mine1.hand[i]),...Array(selK).fill('K')];
   if(give.some(c=>take.includes(c)))return setErr('가져오는 것과 같은 물건은 내줄 수 없어요');
   if(mine1.hand.length+take.length-selH.length>7)return setErr('손에는 7장까지만 들 수 있어요');
   const mv='x|'+selM.join(',')+'|'+give.join(',');GAME.reset();pushMove(g,s.n,mv);
  }
 }
};
