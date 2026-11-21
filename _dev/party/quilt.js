/*META
{"tool":"quilt","title":"조각보 퍼즐","emoji":"🧵","min":2,"max":2,
 "sub":"단추로 천 조각을 사서 내 이불을 빈틈없이 채워요!<br>둘이서 하는 테트리스 퍼즐 (패치워크 방식)",
 "rules":["시간 막대에서 <b>뒤에 있는 사람</b>이 차례를 가져요 (한 사람이 여러 번 할 수도 있어요).","내 차례엔 ① 앞에 놓인 천 조각 3개 중 하나를 <b>단추를 내고 사서</b> 내 9×9 판에 놓거나 ② 상대 바로 앞까지 건너뛰고 건너뛴 칸만큼 단추를 받아요.","조각을 사면 그 조각의 ⏱ 시간만큼 앞으로 가요. 🔘가 그려진 조각은 '단추 받는 날'(🔘 칸)을 지날 때마다 단추를 줘요.","시간 막대의 🟫 칸을 먼저 지나면 1칸짜리 가죽 조각을 공짜로 받아요. 7×7을 처음 꽉 채우면 +7!","둘 다 끝까지 가면 끝. 점수 = 단추 − 빈칸×2 (+7 보너스)."],
 "ui":{},
 "cssvars":"--bg:#f7f0ff;--ink:#3c2a58;--sub:#7a6a98;--line:#e2d6f3;--soft:#ece2fb;--pri:#c9a8ff;--pri2:#9a74d6;--card:#fdfbff",
 "css":".bd{display:grid;grid-template-columns:repeat(9,1fr);gap:2px;background:#e8e0f4;padding:3px;border-radius:10px;max-width:360px;margin:0 auto}.bd i{aspect-ratio:1/1;border-radius:3px;background:#fff;display:block}.bd.mini{max-width:150px;gap:1px;padding:2px}.bd i.pv{background:#9fe0b4!important}.bd i.bad{background:#ffb3b3!important}.pcs{display:flex;gap:8px;justify-content:center;flex-wrap:wrap}.pc{padding:6px;border-radius:12px;display:flex;flex-direction:column;align-items:center;gap:4px;min-width:96px}.pc.on{background:var(--pri);box-shadow:0 4px 0 var(--pri2)}.pc.no{opacity:.45}.sh{display:grid;gap:1px}.sh b{width:12px;height:12px;border-radius:2px;display:block}.pc small{font-size:12px}.trk{position:relative;height:34px;background:#eee6fb;border-radius:17px;margin:6px 0}.trk .m{position:absolute;top:2px;font-size:22px;transform:translateX(-50%)}.trk .x{position:absolute;top:24px;font-size:9px;transform:translateX(-50%)}.ors{display:flex;gap:8px;justify-content:center;margin-top:8px}.ors button{padding:8px 14px;font-size:15px}.up{display:flex;gap:6px;overflow-x:auto;padding-bottom:4px}.up .pc{min-width:70px;opacity:.6}"}
META*/
const PIECES=[ // [모양, 단추 값, 시간, 🔘 수입]
 ['XX',2,1,0],['XXX',2,2,0],['XX/X.',3,1,0],['XX/XX',6,5,2],['XXXX',3,3,1],['XXX/X..',4,2,1],['XXX/.X.',2,2,0],['XX./.XX',3,2,1],
 ['XXXXX',7,1,1],['XXXX/X...',10,3,2],['XXX/X.X',1,2,0],['.X./XXX/.X.',5,4,2],['XX./.XX/..X',10,4,3],['XXX/XX.',8,6,3],['X../XXX/..X',2,3,0],
 ['XXXX/.X..',3,4,1],['XXX/.X./.X.',5,5,2],['X.X/XXX/X.X',2,3,0],['XXXXX/..X..',7,2,2],['.XX./XXXX',7,4,2],['XXX/XXX',8,5,3],['X..X/XXXX',1,5,1],
 ['.X../XXXX/..X.',0,3,1],['XX../.XXX/..X.',4,2,0],['X.../XXXX/X...',3,6,2],['.XX./XXXX/.XX.',5,3,1],['XX/X./XX',3,6,2],['.X./XXX/X.X',4,2,1],
 ['XXX./..XX',4,2,0],['XX../XXXX',6,5,2],['X../XX./.XX',5,4,2],['XXXX/XX..',7,5,2]
];
const INCOME=[5,11,17,23,29,35,41,47,53],LEATHER=[20,26,32,44,50],END=53,CLR=['#ff9aa8','#ffc46b','#9fd8ff','#a8e6a1','#d6b4ff','#ffd6f0','#b4e0d8','#f5d38a'];
const cellsOf=s=>{const c=[];s.split('/').forEach((row,r)=>[...row].forEach((ch,q)=>{if(ch==='X')c.push([r,q])}));return c};
const normC=c=>{const mr=Math.min(...c.map(x=>x[0])),mc=Math.min(...c.map(x=>x[1]));return c.map(([r,q])=>[r-mr,q-mc]).sort((a,b)=>a[0]-b[0]||a[1]-b[1])};
function variants(shape){const out=[],seen=new Set();let c=cellsOf(shape);for(let f=0;f<2;f++){for(let k=0;k<4;k++){const n=normC(c),key=JSON.stringify(n);if(!seen.has(key)){seen.add(key);out.push(n)}c=c.map(([r,q])=>[q,-r])}c=c.map(([r,q])=>[r,-q])}return out}
let sel=-1,ori=0,anchor=null;
const GAME={
 reset(){sel=-1;ori=0;anchor=null},
 setup(){return {seed:Math.floor(Math.random()*1e9),first:rint(2)}},
 settings(){return `<div class="small">둘이서 한 판 (20~30분). 단추 5개로 시작해요.</div>`},
 derive(g){
  const P=g.pl,D=Dof(g),stop=stopOf(g,D),r=rng(g.seed);
  let circle=sshuffle([...Array(PIECES.length).keys()].slice(1),r);circle.push(0);  // 2칸짜리는 맨 뒤
  let tokenAt=0;
  const pl=[0,1].map(i=>({pos:0,btn:5,inc:0,board:Array(81).fill(-1),pend:0}));
  let topAt0=g.first===1?0:1; // 같은 칸이면 나중에 온 사람이 먼저 → 처음엔 first가 위
  let last=[g.first===1?1:0,g.first===1?0:1],n=0,bonus7=-1,lastTxt='',leatherLeft=LEATHER.slice();
  const whoTurn=()=>{const a=pl[0],b=pl[1];if(a.pend)return 0;if(b.pend)return 1;if(a.pos<b.pos)return 0;if(b.pos<a.pos)return 1;return last[0]};
  const fits=(bd,cells,r0,c0)=>cells.every(([dr,dc])=>{const rr=r0+dr,cc=c0+dc;return rr>=0&&rr<9&&cc>=0&&cc<9&&bd[rr*9+cc]<0});
  const check7=(i)=>{if(bonus7>=0)return;const bd=pl[i].board;for(let r0=0;r0<=2;r0++)for(let c0=0;c0<=2;c0++){let ok=true;for(let rr=0;rr<7&&ok;rr++)for(let cc=0;cc<7;cc++)if(bd[(r0+rr)*9+c0+cc]<0){ok=false;break}if(ok){bonus7=i;return}}};
  const move=(i,to)=>{const p=pl[i],from=p.pos;to=Math.min(END,to);
   INCOME.forEach(m=>{if(from<m&&to>=m)p.btn+=p.inc});
   leatherLeft=leatherLeft.filter(m=>{if(from<m&&to>=m){p.pend++;return false}return true});
   p.pos=to;last=[i,1-i]; };
  const avail=()=>{const L=circle.length,a=[];for(let k=0;k<Math.min(3,L);k++)a.push(circle[(tokenAt+k)%L]);return a};
  for(const m of movesOf(g,D)){
   if(pl[0].pos>=END&&pl[1].pos>=END&&!pl[0].pend&&!pl[1].pend)break;
   const t=whoTurn();if(m.n!==n||m.id!==P[t])continue;
   const p=pl[t],o=pl[1-t],[k,a,b,c,d]=m.mv.split('|');let ok=false;
   if(p.pend){if(k==='l'){const rr=+a,cc=+b;if(fits(p.board,[[0,0]],rr,cc)){p.board[rr*9+cc]=99;p.pend--;check7(t);ok=true;lastTxt='🟫 가죽 조각을 놓았어요'}}}
   else if(k==='a'){const to=Math.min(END,o.pos+1),gain=to-p.pos;if(gain>0){p.btn+=gain;move(t,to);ok=true;lastTxt=`건너뛰고 🔘 ${gain}개 받음`}}
   else if(k==='b'){const av=avail(),pi=av[+a],V=pi!=null?variants(PIECES[pi][0]):[],cells=V[+b],rr=+c,cc=+d;
    if(pi!=null&&cells&&PIECES[pi][1]<=p.btn&&fits(p.board,cells,rr,cc)){
     const [shape,cost,time,inc]=PIECES[pi];p.btn-=cost;p.inc+=inc;cells.forEach(([dr,dc])=>p.board[(rr+dr)*9+cc+dc]=pi);
     const L=circle.length,idx=(tokenAt+(+a))%L;circle.splice(idx,1);tokenAt=circle.length?idx%circle.length:0;
     check7(t);move(t,p.pos+time);ok=true;lastTxt=`조각을 사서 놓음 (🔘${cost} · ⏱${time}${inc?` · 수입 +${inc}`:''})`}}
   if(!ok)continue;n++;
  }
  const t=whoTurn(),done=pl[0].pos>=END&&pl[1].pos>=END&&!pl[0].pend&&!pl[1].pend;
  const score=i=>pl[i].btn-2*pl[i].board.filter(x=>x<0).length+(bonus7===i?7:0);
  const base={g,P,D,pl,turn:t,n,avail:avail(),circle,tokenAt,bonus7,lastTxt,score,r:n,leatherLeft};
  if(done)return {...base,ph:'end'};
  if(stop)return {...base,ph:'end',stopped:stop};
  return {...base,ph:'play'};
 },
 buzz(s){return s.ph==='play'&&s.P[s.turn]===ME},
 shape(pi,cells,size){const c=cells||normC(cellsOf(PIECES[pi][0])),R=Math.max(...c.map(x=>x[0]))+1,C=Math.max(...c.map(x=>x[1]))+1,set=new Set(c.map(x=>x[0]*10+x[1]));
  let h=`<div class="sh" style="grid-template-columns:repeat(${C},${size||12}px)">`;for(let r=0;r<R;r++)for(let q=0;q<C;q++)h+=`<b style="width:${size||12}px;height:${size||12}px;background:${set.has(r*10+q)?CLR[pi%CLR.length]:'transparent'}"></b>`;return h+'</div>'},
 board(p,mini,prev){
  return `<div class="bd${mini?' mini':''}">${p.board.map((v,i)=>{const pv=prev&&prev.cells.has(i);return `<i ${!mini?`data-act="cell" data-i="${i}"`:''} class="${pv?(prev.ok?'pv':'bad'):''}" style="${v>=0?`background:${v===99?'#8b5a2b':CLR[v%CLR.length]}`:''}"></i>`}).join('')}</div>`;
 },
 track(s){const pc=x=>(x/END*100).toFixed(1)+'%';
  return `<div class="trk">${INCOME.map(m=>`<span class="x" style="left:${pc(m)}">🔘</span>`).join('')}${s.leatherLeft.map(m=>`<span class="x" style="left:${pc(m)}">🟫</span>`).join('')}${[0,1].map(i=>`<span class="m" style="left:${pc(s.pl[i].pos)}">${avOf(s.P[i])}</span>`).join('')}</div>`},
 play(s,key,me){
  const my=s.P.indexOf(ME),side=my<0?0:my,op=1-side,P0=s.pl[side],O=s.pl[op],myTurn=me&&s.turn===side;
  let h=`<div class="card"><div class="small" style="text-align:center">⏱ 시간 막대 (${s.pl[0].pos}·${s.pl[1].pos} / ${END})</div>${GAME.track(s)}<div class="small" style="text-align:center">${s.lastTxt?'방금: '+esc(s.lastTxt):''}</div></div>`;
  h+=`<div class="card"><h2>${myTurn?'🙋 내 차례!':`<span class="wait">⏳</span> ${esc(nameOf(s.P[s.turn]))}님 차례`}</h2><div class="small" style="text-align:center">🔘 내 단추 <b>${P0.btn}</b> · 수입 ${P0.inc} · 빈칸 ${P0.board.filter(x=>x<0).length}${s.bonus7===side?' · 7×7 보너스 ✨':''}</div>`;
  let prev=null;
  if(myTurn&&P0.pend){
   h+=`<div class="res"><p>🟫 가죽 조각 1칸을 받았어요! 내 판의 빈칸을 눌러 놓아요</p></div>`;
   if(anchor!=null)prev={cells:new Set([anchor]),ok:P0.board[anchor]<0};
  }else if(myTurn){
   h+=`<div class="pcs">${s.avail.map((pi,k)=>{const [sh,cost,time,inc]=PIECES[pi],can=cost<=P0.btn;return `<button class="pc${sel===k?' on':''}${can?'':' no'}" data-act="sel" data-k="${k}">${GAME.shape(pi)}<small>🔘${cost} ⏱${time}${inc?` 수입${inc}`:''}</small></button>`}).join('')}</div>`;
   if(sel>=0){const pi=s.avail[sel],V=variants(PIECES[pi][0]),cells=V[ori%V.length];
    h+=`<div class="ors"><button data-act="rot">↻ 돌리기</button><span>${GAME.shape(pi,cells,16)}</span></div><div class="small" style="text-align:center;margin-top:6px">내 판에서 조각의 <b>왼쪽 위</b>가 될 칸을 눌러요</div>`;
    if(anchor!=null){const r0=Math.floor(anchor/9),c0=anchor%9,set=new Set();let ok=true;cells.forEach(([dr,dc])=>{const rr=r0+dr,cc=c0+dc;if(rr<9&&cc<9)set.add(rr*9+cc);if(rr>=9||cc>=9||P0.board[rr*9+cc]>=0)ok=false});prev={cells:set,ok}}
   }
  }
  h+=`<div style="margin-top:10px">${GAME.board(P0,false,prev)}</div>`;
  if(myTurn){
   if(P0.pend)h+=`<button class="big" data-act="leather" ${prev&&prev.ok?'':'disabled'}>여기에 놓기</button>`;
   else{const gain=Math.min(END,O.pos+1)-P0.pos;
    h+=`<div class="two"><button class="big gray" data-act="adv">⏩ 건너뛰기 +🔘${gain}</button><button class="big" data-act="buy" ${sel>=0&&prev&&prev.ok&&PIECES[s.avail[sel]][1]<=P0.btn?'':'disabled'}>여기에 놓기</button></div>`}
  }
  h+=`<div class="err">${esc(errMsg)}</div></div>`;
  h+=`<div class="card"><h2>${who(s.P[op])} <span class="small">🔘${O.btn} · 수입 ${O.inc} · 빈칸 ${O.board.filter(x=>x<0).length}</span></h2>${GAME.board(O,true)}</div>`;
  const L=s.circle.length,up=[];for(let k=3;k<Math.min(L,9);k++)up.push(s.circle[(s.tokenAt+k)%L]);
  if(up.length)h+=`<div class="card"><h2>🔜 그다음 조각들</h2><div class="up">${up.map(pi=>`<div class="pc">${GAME.shape(pi,null,9)}<small>🔘${PIECES[pi][1]} ⏱${PIECES[pi][2]}</small></div>`).join('')}</div></div>`;
  return h;
 },
 end(s){
  const sc=[0,1].map(i=>s.score(i)),w=sc[0]>sc[1]?0:sc[1]>sc[0]?1:-1;
  return `<div class="card res"><div class="em">${w<0?'🤝':'🏆'}</div><div class="t">${s.stopped?'게임 기록':w<0?'무승부!':esc(nameOf(s.P[w]))+'님 승리!'}</div>
  ${[0,1].map(i=>`<div class="row" style="align-items:flex-start"><div class="av">${avOf(s.P[i])}</div><div class="nm">${esc(nameOf(s.P[i]))}<div class="small">🔘${s.pl[i].btn} − 빈칸 ${s.pl[i].board.filter(x=>x<0).length}×2${s.bonus7===i?' + 7×7 보너스 7':''}</div>${GAME.board(s.pl[i],true)}</div><b>${sc[i]}점</b></div>`).join('')}</div>`;
 },
 record(s){if(s.stopped)return;const sc=[0,1].map(i=>s.score(i));if(sc[0]===sc[1])return;const b=LS.get(TOOL+'_rec',{wins:{},best:-99,done:[]});if(b.done.includes(s.g.id))return;const w=sc[0]>sc[1]?0:1;b.wins[s.P[w]]=(b.wins[s.P[w]]||0)+1;b.best=Math.max(b.best,...sc);b.done=[...b.done,s.g.id].slice(-40);LS.set(TOOL+'_rec',b)},
 recordHTML(){const b=LS.get(TOOL+'_rec',{wins:{},best:-99});const any=MEMBERS.some(m=>b.wins[m.id]);return `<div class="card"><h2>🏆 이 폰의 기록</h2>${any?`<div class="score">${MEMBERS.map(m=>`<div>${avOf(m.id)}<b>${b.wins[m.id]||0}</b><span class="small">${esc(m.name)} 승</span></div>`).join('')}</div><div class="small" style="text-align:center">최고 점수 ${b.best}</div>`:'<div class="small">아직 기록이 없어요</div>'}</div>`},
 act(a,el,g,s,me){
  if(!me||s.ph!=='play')return;const my=s.P.indexOf(ME);if(s.turn!==my)return;const P0=s.pl[my];
  if(a==='sel'){const k=+el.dataset.k;if(PIECES[s.avail[k]][1]>P0.btn){toast('단추가 모자라요');return}sel=k;ori=0;anchor=null;render()}
  else if(a==='rot'){ori++;render()}
  else if(a==='cell'){anchor=+el.dataset.i;render()}
  else if(a==='adv'){GAME.reset();pushMove(g,s.n,'a')}
  else if(a==='buy'&&sel>=0&&anchor!=null){const V=variants(PIECES[s.avail[sel]][0]),o=ori%V.length,r0=Math.floor(anchor/9),c0=anchor%9,k=sel;GAME.reset();pushMove(g,s.n,`b|${k}|${o}|${r0}|${c0}`)}
  else if(a==='leather'&&anchor!=null){const r0=Math.floor(anchor/9),c0=anchor%9;GAME.reset();pushMove(g,s.n,`l|${r0}|${c0}`)}
 }
};
