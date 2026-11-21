/*META
{"tool":"tile-garden","title":"타일 정원","emoji":"🔷","min":2,"max":2,
 "sub":"예쁜 타일을 골라 와서 내 벽 무늬를 완성해요!<br>둘이서 하는 타일 퍼즐 (아줄 방식)",
 "rules":["내 차례엔 <b>공방 접시 하나</b>(또는 가운데)에서 <b>한 색깔을 전부</b> 가져와요. 접시에 남은 타일은 가운데로 가요.","가져온 타일은 내 왼쪽 <b>줄 하나</b>에 채워요 (1~5칸). 한 줄엔 한 색만, 넘치면 바닥으로 떨어져 감점!","가운데에서 처음 가져가는 사람은 <b>1번 표</b>도 가져가요 (−1점, 대신 다음 판 먼저).","타일이 다 떨어지면, 꽉 찬 줄마다 타일 하나가 오른쪽 벽으로 올라가요. 옆·위아래로 붙어 있을수록 점수가 커요.","벽의 가로줄 하나가 완성되면 그 판이 끝나고 게임 끝. 가로줄 +2, 세로줄 +7, 같은 색 5개 +10!"],
 "ui":{},
 "cssvars":"--bg:#eef5fb;--ink:#22384e;--sub:#5f7a94;--line:#cfe0ee;--soft:#dcebf7;--pri:#9cc8f0;--pri2:#5d93c8;--card:#fbfdff",
 "css":".fac{display:flex;flex-wrap:wrap;gap:8px;justify-content:center}.fc{width:92px;height:92px;border-radius:50%;background:#f3ead9;border:3px solid #e2d3b6;display:grid;grid-template-columns:1fr 1fr;gap:4px;padding:16px}.ctr{display:flex;flex-wrap:wrap;gap:4px;justify-content:center;min-height:36px;padding:6px;border-radius:14px;background:#f3ead9;margin-top:8px}.t{display:inline-block;width:26px;height:26px;border-radius:6px;border:0;padding:0;box-shadow:inset 0 -3px 0 rgba(0,0,0,.18)}.t.on{outline:3px solid #ff7a00;outline-offset:1px}.t.c0{background:#3a7bd5}.t.c1{background:#f7c843}.t.c2{background:#e5484d}.t.c3{background:#2b2b2b}.t.c4{background:#5cc6c0}.t.fp{background:#fff;text-align:center;line-height:24px;color:#22384e;font-size:13px;font-weight:900}.brd{display:flex;gap:8px;justify-content:center;align-items:flex-start}.pls{display:flex;flex-direction:column;gap:3px}.pl{display:flex;justify-content:flex-end;gap:3px;padding:2px;border-radius:8px}.pl.can{background:#e3f6e1;cursor:pointer}.pl .t,.wl .t{width:24px;height:24px}.e{width:24px;height:24px;border-radius:6px;background:#e8eef4;display:block}.wl{display:grid;grid-template-columns:repeat(5,24px);gap:3px}.wl .h{opacity:.18}.fl{display:flex;gap:3px;justify-content:center;margin-top:8px;align-items:center;padding:4px;border-radius:8px}.fl.can{background:#ffe3e3;cursor:pointer}.fl .pen{font-size:10px;color:#c44;width:24px;text-align:center}.mini .t,.mini .e{width:14px!important;height:14px!important}.mini .wl{grid-template-columns:repeat(5,14px)}"}
META*/
const NC=5,FLOORP=[-1,-1,-2,-2,-2,-3,-3];
const wallCol=(r,c)=>(c+r)%5;   // r줄에서 색 c가 들어가는 칸
let pick=null; // {src:'f'|'c', fi, color}
const GAME={
 reset(){pick=null},
 setup(){return {seed:Math.floor(Math.random()*1e9),first:rint(2)}},
 settings(){return `<div class="small">둘이서 한 판 (20~30분). 공방 접시 5개로 해요.</div>`},
 derive(g){
  const P=g.pl,D=Dof(g),stop=stopOf(g,D),r=rng(g.seed);
  let bag=[];for(let c=0;c<NC;c++)for(let i=0;i<20;i++)bag.push(c);bag=sshuffle(bag,r);let lid=[];
  const pl=[0,1].map(()=>({lines:[[],[],[],[],[]],wall:Array(25).fill(-1),floor:[],fp:false,score:0}));
  let fac=[],center=[],fpIn=true,turn=g.first||0,round=1,n=0,over=false,log='',roundLog=[];
  const draw=()=>{if(!bag.length){bag=sshuffle(lid,r);lid=[]}return bag.length?bag.pop():null};
  const fill=()=>{fac=[];for(let f=0;f<5;f++){const t=[];for(let k=0;k<4;k++){const x=draw();if(x!=null)t.push(x)}fac.push(t.sort())}center=[];fpIn=true};
  fill();
  const place=(p,color,cnt,line,gotFp)=>{
   if(gotFp){p.fp=true}
   let over1=cnt;
   if(line<5){const L=p.lines[line],room=line+1-L.length;const k=Math.min(room,cnt);for(let i=0;i<k;i++)L.push(color);over1=cnt-k}
   for(let i=0;i<over1;i++){if(p.floor.length<7)p.floor.push(color);else lid.push(color)}
  };
  const canLine=(p,color,line)=>{if(line===5)return true;const L=p.lines[line];if(L.length>=line+1)return false;if(L.length&&L[0]!==color)return false;return p.wall[line*5+wallCol(line,color)]<0};
  const tile=()=>{
   let nextFirst=-1;roundLog=[];
   pl.forEach((p,i)=>{let gain=0;
    p.lines.forEach((L,rw)=>{if(L.length===rw+1){const c=L[0],col=wallCol(rw,c),idx=rw*5+col;p.wall[idx]=c;
      let h=1,v=1;for(let q=col-1;q>=0&&p.wall[rw*5+q]>=0;q--)h++;for(let q=col+1;q<5&&p.wall[rw*5+q]>=0;q++)h++;
      for(let q=rw-1;q>=0&&p.wall[q*5+col]>=0;q--)v++;for(let q=rw+1;q<5&&p.wall[q*5+col]>=0;q++)v++;
      const pts=(h>1&&v>1)?h+v:Math.max(h,v);gain+=pts;for(let k=1;k<L.length;k++)lid.push(c);p.lines[rw]=[]}});
    let pen=0;const fl=p.floor.length+(p.fp?1:0);for(let k=0;k<Math.min(7,fl);k++)pen+=FLOORP[k];
    p.floor.forEach(c=>lid.push(c));p.floor=[];if(p.fp){nextFirst=i;p.fp=false}
    p.score=Math.max(0,p.score+gain+pen);roundLog.push(`${nameOf(P[i])} +${gain}${pen?` ${pen}`:''}`)});
   const ended=pl.some(p=>{for(let rw=0;rw<5;rw++){if([0,1,2,3,4].every(q=>p.wall[rw*5+q]>=0))return true}return false});
   if(ended){pl.forEach(p=>{let b=0;for(let rw=0;rw<5;rw++)if([0,1,2,3,4].every(q=>p.wall[rw*5+q]>=0))b+=2;for(let q=0;q<5;q++)if([0,1,2,3,4].every(rw=>p.wall[rw*5+q]>=0))b+=7;for(let c=0;c<5;c++)if(p.wall.filter(x=>x===c).length===5)b+=10;p.bonus=b;p.score+=b});over=true;return}
   round++;turn=nextFirst>=0?nextFirst:turn;fill();
  };
  for(const m of movesOf(g,D)){
   if(over)break;if(m.n!==n||m.id!==P[turn])continue;
   const p=pl[turn],[k,a,b,c]=m.mv.split('|');let ok=false;
   if(k==='f'){const fi=+a,color=+b,line=+c,F=fac[fi];if(F&&F.includes(color)&&canLine(p,color,line)){const cnt=F.filter(x=>x===color).length;F.filter(x=>x!==color).forEach(x=>center.push(x));fac[fi]=[];place(p,color,cnt,line,false);ok=true;log=`${nameOf(P[turn])}: 접시에서 ${cnt}개`}}
   else if(k==='c'){const color=+a,line=+b;if(center.includes(color)&&canLine(p,color,line)){const cnt=center.filter(x=>x===color).length;center=center.filter(x=>x!==color);const gf=fpIn;fpIn=false;place(p,color,cnt,line,gf);ok=true;log=`${nameOf(P[turn])}: 가운데에서 ${cnt}개${gf?' + 1번 표':''}`}}
   if(!ok)continue;n++;turn=1-turn;
   if(fac.every(F=>!F.length)&&!center.length)tile();
  }
  const base={g,P,D,pl,fac,center,fpIn,turn,round,n,log,roundLog,canLine,r:n};
  if(over)return {...base,ph:'end'};
  if(stop)return {...base,ph:'end',stopped:stop};
  return {...base,ph:'play'};
 },
 buzz(s){return s.ph==='play'&&s.P[s.turn]===ME},
 T(c,act,on){return `<button class="t c${c}${on?' on':''}" ${act||'disabled'}></button>`},
 boardHTML(s,p,mine,mini){
  const can=line=>mine&&pick&&s.canLine(p,pick.color,line);
  return `<div class="${mini?'mini':''}"><div class="brd"><div class="pls">${p.lines.map((L,rw)=>`<div class="pl${can(rw)?' can':''}" ${can(rw)?`data-act="line" data-l="${rw}"`:''}>${[...Array(rw+1)].map((_,k)=>{const x=L[rw-k];return x!=null?`<span class="t c${x}"></span>`:'<span class="e"></span>'}).join('')}</div>`).join('')}</div>
  <div class="wl">${[...Array(25)].map((_,i)=>{const rw=Math.floor(i/5),q=i%5,col=[0,1,2,3,4].find(c=>wallCol(rw,c)===q);return p.wall[i]>=0?`<span class="t c${p.wall[i]}"></span>`:`<span class="t c${col} h"></span>`}).join('')}</div></div>
  <div class="fl${can(5)?' can':''}" ${can(5)?'data-act="line" data-l="5"':''}>${[...Array(7)].map((_,k)=>{const items=[...(p.fp?['fp']:[]),...p.floor];const x=items[k];return `<div><div class="pen">${FLOORP[k]}</div>${x==='fp'?'<span class="t fp">1</span>':x!=null?`<span class="t c${x}"></span>`:'<span class="e"></span>'}</div>`}).join('')}</div></div>`;
 },
 play(s,key,me){
  const my=s.P.indexOf(ME),side=my<0?0:my,op=1-side,myTurn=me&&s.turn===side;
  let h=`<div class="card"><h2>${myTurn?'🙋 내 차례! 타일 고르기':`<span class="wait">⏳</span> ${esc(nameOf(s.P[s.turn]))}님 차례`} <span class="small">· ${s.round}라운드</span></h2>
  <div class="fac">${s.fac.map((F,fi)=>`<div class="fc">${F.map(c=>GAME.T(c,myTurn?`data-act="pf" data-f="${fi}" data-c="${c}"`:'',pick&&pick.src==='f'&&pick.fi===fi&&pick.color===c)).join('')}</div>`).join('')}</div>
  <div class="ctr">${s.fpIn?'<span class="t fp">1</span>':''}${s.center.slice().sort().map(c=>GAME.T(c,myTurn?`data-act="pc" data-c="${c}"`:'',pick&&pick.src==='c'&&pick.color===c)).join('')||'<span class="small">가운데 비어 있음</span>'}</div>
  <div class="small" style="text-align:center;margin-top:6px">${myTurn?(pick?'👉 이제 내 판에서 <b>초록색으로 빛나는 줄</b>(또는 빨간 바닥)을 눌러요':'접시나 가운데에서 타일 색을 눌러요'):esc(s.log)}</div></div>`;
  h+=`<div class="card"><h2>${who(s.P[side])} <span class="small">점수 ${s.pl[side].score}</span></h2>${GAME.boardHTML(s,s.pl[side],myTurn,false)}${s.roundLog.length?`<div class="small" style="text-align:center;margin-top:6px">지난 라운드: ${s.roundLog.map(esc).join(' · ')}</div>`:''}</div>`;
  h+=`<div class="card"><h2>${who(s.P[op])} <span class="small">점수 ${s.pl[op].score}</span></h2>${GAME.boardHTML(s,s.pl[op],false,true)}</div>`;
  return h;
 },
 end(s){
  const sc=[0,1].map(i=>s.pl[i].score),w=sc[0]>sc[1]?0:sc[1]>sc[0]?1:-1;
  return `<div class="card res"><div class="em">${w<0?'🤝':'🏆'}</div><div class="t">${s.stopped?'게임 기록':w<0?'무승부!':esc(nameOf(s.P[w]))+'님 승리!'}</div>
  ${[0,1].map(i=>`<div class="row" style="align-items:flex-start"><div class="av">${avOf(s.P[i])}</div><div class="nm">${esc(nameOf(s.P[i]))}${s.pl[i].bonus?`<div class="small">보너스 +${s.pl[i].bonus}</div>`:''}${GAME.boardHTML(s,s.pl[i],false,true)}</div><b>${sc[i]}점</b></div>`).join('')}</div>`;
 },
 record(s){if(s.stopped)return;const sc=[0,1].map(i=>s.pl[i].score);if(sc[0]===sc[1])return;const b=LS.get(TOOL+'_rec',{wins:{},best:0,done:[]});if(b.done.includes(s.g.id))return;const w=sc[0]>sc[1]?0:1;b.wins[s.P[w]]=(b.wins[s.P[w]]||0)+1;b.best=Math.max(b.best,...sc);b.done=[...b.done,s.g.id].slice(-40);LS.set(TOOL+'_rec',b)},
 recordHTML(){const b=LS.get(TOOL+'_rec',{wins:{},best:0});const any=MEMBERS.some(m=>b.wins[m.id]);return `<div class="card"><h2>🏆 이 폰의 기록</h2>${any?`<div class="score">${MEMBERS.map(m=>`<div>${avOf(m.id)}<b>${b.wins[m.id]||0}</b><span class="small">${esc(m.name)} 승</span></div>`).join('')}</div><div class="small" style="text-align:center">최고 점수 ${b.best}</div>`:'<div class="small">아직 기록이 없어요</div>'}</div>`},
 act(a,el,g,s,me){
  if(!me||s.ph!=='play')return;const my=s.P.indexOf(ME);if(s.turn!==my)return;
  if(a==='pf'){pick={src:'f',fi:+el.dataset.f,color:+el.dataset.c};render()}
  else if(a==='pc'){pick={src:'c',color:+el.dataset.c};render()}
  else if(a==='line'&&pick){const l=+el.dataset.l,pk=pick;pick=null;pushMove(g,s.n,pk.src==='f'?`f|${pk.fi}|${pk.color}|${l}`:`c|${pk.color}|${l}`)}
 }
};
