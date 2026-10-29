/* ===== 화면·저장·조작 (규칙은 위의 BP2에서만 계산) ===== */
(()=>{
const B=BP2,R=B.R,W=450,H=800,$=id=>document.getElementById(id),cv=$('cv'),cx=cv.getContext('2d'),fmt=B.fmt,KEY='bungeoppang2Pub1',VER='3.1';
let save={};try{save=JSON.parse(localStorage.getItem(KEY))||{}}catch(e){}
save=Object.assign({nick:'',sub:{id:0,stage:0,net:0},snd:true,runs:0,clears:0,best:{stage:0,net:0},week:{id:0,stage:0,net:0},free:{stage:0,net:0},run:null},save);
/* 규칙이 바뀌기 전에 하던 판은 이어서 할 수 없어요 (순위표 검증이 맞지 않아서) */
let oldRun=false;if(save.run&&save.run.run&&save.run.run.sv!==B.SIMV){save.run=null;oldRun=true}
const store=()=>{if(window.__noStore)return;/* 기록 옮겨 받는 중엔 덮어쓰지 않기 */try{localStorage.setItem(KEY,JSON.stringify(save))}catch(e){}};
const wid=()=>B.weekId(Date.now()),weekSeed=()=>B.weekSeed(wid());
let run=null,s=null,scr='menu',paused=false,acc=0,last=0,ui=null;
const MODE=m=>m==='week'?'이번 주 판':'연습 판';
let A=null;

/* ---------- 소리 ---------- */
let AC;const au=()=>{if(!AC){try{AC=new(window.AudioContext||window.webkitAudioContext)()}catch(e){}}if(AC&&AC.state==='suspended')AC.resume();return AC};
function tone(f,d,ty='sine',v=.14,t0=0,f2){if(!save.snd)return;const a=au();if(!a)return;const o=a.createOscillator(),g=a.createGain(),t=a.currentTime+t0;o.type=ty;o.frequency.setValueAtTime(f,t);if(f2)o.frequency.exponentialRampToValueAtTime(f2,t+d);g.gain.setValueAtTime(v,t);g.gain.exponentialRampToValueAtTime(.001,t+d);o.connect(g);g.connect(a.destination);o.start(t);o.stop(t+d)}
const SND={tap(){tone(500,.08,'triangle',.1)},pour(){tone(300,.18,'sine',.12,0,180)},flip(){tone(700,.1,'square',.07,0,1000)},coin(){tone(988,.1,'triangle',.12);tone(1319,.2,'triangle',.12,.08)},perf(){[784,988,1319].forEach((f,i)=>tone(f,.16,'triangle',.12,i*.07))},burn(){tone(160,.4,'sawtooth',.16,0,60)},angry(){tone(220,.3,'square',.1,0,110)},ready(){tone(1200,.08,'sine',.07)},win(){[523,659,784,1047].forEach((f,i)=>tone(f,.25,'triangle',.14,i*.13))},no(){tone(200,.12,'square',.08)}};
const snd=k=>{try{SND[k]&&SND[k]()}catch(e){}};

/* ---------- 화면 전환 ---------- */
const show=n=>{['menu','shop','over','pause','set','how','nick','lb','rv'].forEach(i=>$(i).style.display=i===n?'block':'none');$('home').style.display=scr==='game'?'block':'none'};
function toast(t){const e=$('toast');e.textContent=t;e.style.opacity=1;clearTimeout(toast.h);toast.h=setTimeout(()=>e.style.opacity=0,1700)}
function ask(btn,label,fn){if(btn.dataset.a!=='1'){btn.dataset.a='1';btn.dataset.o=btn.textContent;btn.textContent=label;setTimeout(()=>{if(btn.dataset.a==='1'){btn.dataset.a='0';btn.textContent=btn.dataset.o}},3000)}else{btn.dataset.a='0';btn.textContent=btn.dataset.o;fn()}}
const esc=t=>String(t).replace(/[<>&"]/g,c=>({'<':'&lt;','>':'&gt;','&':'&amp;','"':'&quot;'}[c]));
/* 체크포인트: 10단계마다 그 순간의 판을 저장해 두고, 죽으면 거기서 다시 */
const cpOK=()=>save.cp&&save.cp.wid===wid()&&save.cp.run&&save.cp.run.sv===B.SIMV;
const clone=o=>JSON.parse(JSON.stringify(o));
function startFromCp(){if(!cpOK())return;au();run=clone(save.cp.run);save.runs++;save.run={run};store();startDay();toast('🔁 '+(save.cp.stage+1)+'단계부터 다시! 화이팅 🔥')}
function renderMenu(){
 if(save.run&&save.run.run&&save.run.run.over){run=save.run.run;record();save.run=null;store();run=null}
 const sr=save.run,wk=save.week.id===wid()?save.week:{stage:0,net:0};
 $('mw').innerHTML='<span class="pill">🙂 '+esc(save.nick)+'</span><span class="pill">🏅 이번 주 '+wk.stage+'단계</span>';$('ver').textContent='시험판 v'+VER+' · 이번 주 판 #'+wid();
 $('mi').innerHTML='컷트라인을 못 넘으면 탈락!<br>몇 단계까지 갈 수 있을까요? (최고 '+R.maxStage+'단계 완주)<br>⭐ 이번 주 판은 모두 같은 손님! 순위표에서 겨뤄요';
 if(sr&&sr.run&&!sr.run.over&&sr.run.mode==='week'&&sr.run.wid===wid()){$('m1').textContent='▶ 이어서 하기 · '+sr.run.day+'일차';$('m5').style.display='block';$('m5').textContent='🆕 처음부터 다시 시작'}
 else if(cpOK()){$('m1').textContent='▶ 이번 주 판 1단계부터';$('m5').style.display='block';$('m5').textContent='🔁 '+(save.cp.stage+1)+'단계부터 다시 (체크포인트)'}
 else{$('m1').textContent='▶ 이번 주 판 시작';$('m5').style.display='none'}}
function toMenu(){scr='menu';s=null;paused=false;renderMenu();show('menu')}

/* ---------- 판 · 하루 흐름 ---------- */
function startRun(mode){au();run=B.newRun(mode==='week'?weekSeed():(Math.random()*4294967296)>>>0,mode);run.wid=wid();run.sv=B.SIMV;save.runs++;save.run={run};store();startDay()}
/* 🃏 5단계마다 카드 고르기 (고르기 전엔 다음 날로 못 가요) */
let cdo=null;
function openCards(then){const offer=B.cardOffer(run);if(!offer.length){then&&then();return}const st=B.cardStage(run);scr='cards';
 if(!cdo){cdo=document.createElement('div');cdo.style.cssText='position:absolute;inset:0;background:rgba(40,24,14,.72);z-index:30;display:flex;align-items:center;justify-content:center;padding:14px;box-sizing:border-box';$('box').appendChild(cdo)}
 cdo.style.display='flex';cdo.innerHTML='';const c=document.createElement('div');c.style.cssText='background:#fff8ec;border-radius:28px;width:100%;box-sizing:border-box;padding:16px;text-align:center;color:#5a3a22';
 c.innerHTML='<div style="font-size:15px;opacity:.75">'+st+'단계 통과 보상</div><div style="font-size:27px;margin:2px 0 4px">🃏 카드 한 장 고르기</div><div style="font-size:14px;opacity:.7;margin-bottom:10px">이번 주엔 모두 같은 카드가 나와요 · 같은 카드는 겹쳐요</div>';
 offer.forEach((k,i)=>{const d=B.CK[k],have=B.cn(run,k),b=document.createElement('button');b.style.cssText='display:flex;align-items:center;gap:12px;width:100%;box-sizing:border-box;text-align:left;margin:0 0 10px;padding:12px 14px;border-radius:20px;background:#fff;box-shadow:0 4px 0 #e0c4a0;font-family:inherit;color:#5a3a22;border:3px solid #ffe2a8';
  b.innerHTML='<span style="font-size:42px;line-height:1">'+d.e+'</span><span style="flex:1"><b style="font-weight:400;font-size:21px">'+d.n+(have?' <small style="font-size:13px;color:#2a8a3a">보유 '+have+' → '+(have+1)+'</small>':'')+'</b><br><span style="font-size:15px;opacity:.85">'+d.d+(k==='flav'?' ('+R.menu[run.nf-1].e+' '+R.menu[run.nf-1].n+')':'')+'</span></span>';
  b.onclick=()=>{if(!B.pickCard(run,k))return;save.run={run};store();snd('win');cdo.style.display='none';toast(d.e+' '+d.n+' 카드를 얻었어요!');if(then)then()};c.appendChild(b)});
 cdo.appendChild(c)}
const cardPill=()=>run&&run.cards&&run.cards.length?'<span class="pill" style="background:#efe2ff">🃏 '+run.cards.map(c=>B.CK[c.split(':')[0]].e).join('')+'</span>':'';
function startDay(){if(run&&B.cardStage(run)&&scr!=='cards'){openCards(()=>startDay());return}s=B.newDay(run);ui=A.newUi();A.use(s,run,ui);scr='game';paused=false;acc=0;last=0;show('none')}
/* ---------- 순위표 보내기 ---------- */
const LB=()=>window.LB&&!window.LB.off?window.LB:null;
/* 매 단계 통과 때 진행 중(live)으로 올리고, 판이 끝나면(fin) 무조건 한 번 더 보내 확정해요. 더 나쁜 기록으로는 덮지 않아요 */
function submit(withProof,fin){if(!run||run.mode!=='week'||run.wid!==wid()||!save.nick||run.stage<1)return;const lb=LB();if(!lb)return;
 const st=run.stage,net=run.tot,sb=save.sub,same=sb.id===run.wid&&st===sb.stage&&net===sb.net;
 if(sb.id===run.wid&&(st<sb.stage||(st===sb.stage&&net<sb.net)))return;
 if(same&&!fin&&sb.live)return;if(same&&fin&&!sb.live)return;
 return lb.submit({w:run.wid,n:save.nick,st,net,live:!fin,lg:withProof?run.lg:null}).then(ok=>{if(ok){save.sub={id:run.wid,stage:st,net,live:!fin};store()}return ok})}
function record(){const st=run.stage,net=run.tot,m=run.mode,gt=(a,b)=>st>a.stage||(st===a.stage&&net>a.net);
 if(gt(save.best,0)){save.best={stage:st,net}}
 if(m==='week'){if(save.week.id!==run.wid)save.week={id:run.wid,stage:0,net:0};if(gt(save.week,0))save.week={id:run.wid,stage:st,net}}
 else if(gt(save.free,0))save.free={stage:st,net};
 if(run.clear)save.clears++;return submit(true,true)}
function finishDay(){const res=B.dayResult(s,run),kind=B.endDay(run,res);
 if(kind==='pass'||kind==='revive'){
  if(kind==='pass'&&run.mode==='week'&&run.stage%10===0&&run.stage<R.maxStage&&(!cpOK()||run.stage>=save.cp.stage))save.cp={wid:run.wid,stage:run.stage,run:clone(run)};
  save.run={run};store();let pr=null;if(kind==='pass')pr=submit(run.stage%5===0,false);goShop(res,kind);rankInto('srk',pr,'shop');if(kind==='pass'&&B.cardStage(run))setTimeout(()=>openCards(()=>{scr='shop';renderShop();$('s1').textContent='▶ '+run.day+'일차 시작 (컷트라인 '+fmt(B.cutRun(run,run.day))+')'}),350)}
 else if(kind==='over'&&run.mode==='week'&&B.canLateRevive(run)){save.run={run};store();openRevive(res)}
 else endRun(res,kind)}
function endRun(res,kind){const pr=record();save.run=null;store();goOver(res,kind);rankInto('ork',pr,'over')}
/* 탈락 직후: 부활권을 사서 같은 날 한 번 더 */
let rvRes=null;
function openRevive(res){rvRes=res;scr='rv';const c=B.ticketCost(run);$('rvb').innerHTML='💰 오늘 순수익 <b>'+fmt(res.net)+'원</b> / 컷트라인 '+fmt(res.cut)+'<br>🪙 가진 코인 '+fmt(run.coins)+'<br>부활권을 사면 <b>'+run.day+'일차를 한 번 더</b> 할 수 있어요';
 $('rv1').textContent='🎫 부활권 사고 다시 (🪙 '+fmt(c)+')';show('rv')}
$('rv1').onclick=()=>{if(!B.lateRevive(run)){toast('코인이 부족해요!');snd('no');return}save.run={run};store();snd('win');goShop(rvRes,'revive')};
$('rv2').onclick=()=>ask($('rv2'),'⚠️ 정말 끝낼까요? 한 번 더!',()=>endRun(rvRes,'over'));
/* 지금 내 순위 (순위표 위쪽 30명 안) */
let lastRank='';
const rkTxt=n=>n+'위'+(n<=3?' '+['🥇','🥈','🥉'][n-1]:'');
const mySc=()=>save.sub&&save.sub.id===wid()?save.sub.stage*1000000000+save.sub.net:0;
/* 내 순위: 순위표 전체 대신 '나보다 높은 사람 수'만 세요 (읽기 1번) */
function rankInto(id,pr,where){const lb=LB(),el=()=>$(id);if(!lb||!lb.rank){if(el())el().textContent='';return}if(el())el().textContent=where==='over'?'🏆 순위 확인 중…':'🏆 …';
 Promise.resolve(pr).then(()=>{const sc=mySc();if(!sc)throw 0;return lb.rank(wid(),sc)}).then(n=>{lastRank=rkTxt(n);if(scr!==where)return;if(el())el().textContent='🏆 이번 주 '+lastRank}).catch(()=>{if(el())el().textContent=''})}
function sumHtml(res,kind){let h=(kind==='revive'?'🎫 <b>부활권을 썼어요!</b> 같은 날을 한 번 더 해요<br>':'')+'💰 순수익 <b>'+fmt(res.net)+'원</b> / 컷트라인 '+fmt(res.cut)+(res.pass?' ✅':' ❌')+'<br>🐾 손님 '+res.served+'명 · 😡 놓침 '+res.lost+' · ✨ PERFECT '+res.perf+' · 👍 GREAT '+(res.good|0)+' · 😵 BURNT '+res.burnt+' · 🔥 콤보 '+res.bc;return h}
let lastR=null;
function goShop(res,kind){lastR=res;scr='shop';$('st').textContent=kind==='revive'?'🎫 한 번 더!':'🌙 '+(run.day-1)+'단계 통과!';$('ss').innerHTML=sumHtml(res,kind);renderShop();
 const ev=B.evOf(run.day),c=B.cutRun(run,run.day);$('s1').textContent=(kind==='revive'?'▶ '+run.day+'일차 다시 시작':'▶ '+run.day+'일차 시작')+' (컷트라인 '+fmt(c)+')';show('shop')}
function renderShop(){
 $('sw').innerHTML='<span class="pill">🪙 '+fmt(run.coins)+'</span><span class="pill">'+(B.evOf(run.day)?R.ev[B.evOf(run.day)].e+' '+run.day+'일차 '+R.ev[B.evOf(run.day)].n:'📅 '+run.day+'일차')+'</span>'+(rivalOK()?'<span class="pill" style="background:#ffd8c8">🎯 '+esc(save.rival.n)+' '+save.rival.s+'단계'+(run.stage>=save.rival.s?' ✅ 넘었다!':'')+'</span>':'')+cardPill()+(run.mode==='week'&&LB()?'<span class="pill" id="srk" style="background:#ffe9a0">🏆 '+(lastRank?'이번 주 '+lastRank:'…')+'</span>':'');
 const L=$('shl');L.innerHTML='';
 const row=(e,n,d,label,can,fn,rec)=>{const r=document.createElement('div');r.className='it'+(rec?' rec':'');r.innerHTML='<b>'+e+'</b><div>'+(String(n).startsWith('<span')?n:'<span>'+n+'</span>')+'<br>'+d+'</div>';const b=document.createElement('button');b.textContent=label;if(!can)b.className='no';b.onclick=fn;r.appendChild(b);L.appendChild(r)};
 const buyK=k=>{if(!B.buy(run,k)){toast('코인이 부족해요!');snd('no');return}save.run={run};store();snd('win');renderShop()};
 const sec=h=>{const p=document.createElement('p');p.className='ht';p.innerHTML='<b>'+h+'</b>';L.appendChild(p)};
 const FU=[0,1,2,3,4,5].filter(f=>f<run.nf).map(f=>'fu'+f),ALL=['fl','mold','rack','speed','auto','pat','deco','loc',...FU];
 const rc=B.recUp(run,ALL,lastR&&Object.assign({},lastR,{cut:B.cutRun(run,run.day)}));
 const one=k=>{const c=B.upCost(run,k),d=B.upInfo(run,k),isR=rc&&rc.k===k,nm='<span>'+d[1]+'</span> <small>'+d[3]+'</small>';
  if(c==null){row(d[0],nm,d[2],'완료 ✅',false,()=>{});return}
  row(d[0],nm,d[2]+(isR?'<br><b class="why">👍 추천 · '+rc.why+'</b>':''),fmt(c)+'🪙',run.coins>=c,()=>buyK(k),isR)};
 if(rc){sec('👍 지금 추천');one(rc.k)}
 sec('🔥 굽기');['fl','mold','rack','speed','auto'].filter(k=>!rc||rc.k!==k).forEach(one);
 sec('🫘 맛 강화 (값이 올라요 · 싼 맛일수록 많이)');FU.filter(k=>!rc||rc.k!==k).forEach(one);
 sec('🏪 손님');['pat','deco','loc'].filter(k=>!rc||rc.k!==k).forEach(one);
 sec('🎫 부활권');
 const tc=B.ticketCost(run);
 if(run.ticket)row('🎫','부활권','탈락할 때 같은 날을 한 번 더 해요','보유 ✅',false,()=>{});
 else row('🎫','부활권','컷트라인에 못 미쳐도 같은 날을 한 번 더 해요 (탈락한 순간에도 살 수 있어요)',fmt(tc)+'🪙',run.coins>=tc,()=>{if(!B.buyTicket(run)){toast('코인이 부족해요!');snd('no');return}save.run={run};store();snd('win');renderShop()})}
function goOver(res,kind){scr='over';const st=run.stage;$('ot').textContent=run.clear?'🎉 '+R.maxStage+'단계 완주!':(run.giveUp?'🏳️ 포기했어요':'💥 '+(st+1)+'일차에서 탈락');
 let h=run.clear?'모든 단계를 통과했어요!':(run.giveUp?'':sumHtml(res,kind).replace('💰 순수익','💰 오늘 수익')+'<br>');
 h+='<br>🏅 도달 단계 <b>'+st+'</b> · 누적 순수익 '+fmt(run.tot)+'원';
 const w=save.week.id===run.wid?save.week:null;if(run.mode==='week'&&w)h+='<br>이번 주 내 최고 <b>'+w.stage+'단계</b>';
 $('obd').innerHTML=h;const cp=cpOK()&&!run.clear;$('o5').style.display=cp?'block':'none';if(cp)$('o5').textContent='🔁 '+(save.cp.stage+1)+'단계부터 다시 (체크포인트)';
 $('o1').textContent=cp?'🆕 1단계부터 새로':'🔁 이번 주 판 다시 도전';$('o1').className=cp?'big sm':'big';$('ork').textContent='';show('over')}
$('o5').onclick=startFromCp;
function giveUp(){if(!run||run.over)return;run.over=true;run.giveUp=true;paused=false;$('pause').style.display='none';endRun(null,'over')}

/* ---------- 연결: 버튼 ---------- */
$('m1').onclick=()=>{au();const sr=save.run;if(sr&&sr.run&&!sr.run.over&&sr.run.mode==='week'&&sr.run.wid===wid()){run=sr.run;startDay()}else startRun('week')};
$('m5').onclick=()=>{const sr=save.run;if(sr&&sr.run&&!sr.run.over&&sr.run.mode==='week'&&sr.run.wid===wid())ask($('m5'),'⚠️ 지금 판이 사라져요. 한 번 더!',()=>startRun('week'));else startFromCp()};
function renderHow(){const wk=save.week.id===wid()?save.week:{stage:0,net:0};
 $('hw').innerHTML='<p class="ht"><b>🏅 내 기록</b></p><div class="sum">이번 주 판: <b>'+wk.stage+'단계</b> ('+fmt(wk.net)+'원)<br>전체 최고: <b>'+save.best.stage+'단계</b> · 도전 '+save.runs+'번 · 완주 '+save.clears+'번</div>'+
 '<p class="ht"><b>📖 이렇게 해요</b></p><div class="sum">• 하루는 90초! 번 돈이 <b>컷트라인</b>을 넘어야 다음 단계로 가요. 못 넘으면 끝!<br>• 빈 틀을 톡 → 속 넣기 → 덮개 톡 → 앞면 굽기 → 뒤집기 → 꺼내기. 노란 구간에 누르면 좋은 빵이 돼요.<br>• <b>빵 등급</b>: 양면 모두 노란 구간 ✨<b>PERFECT</b>(값 ×1.4) · 한 면만 👍<b>GREAT</b>(×1.15) · 둘 다 초록 🙂<b>GOOD</b> · 빨강은 😵<b>BURNT</b>(버려요)<br>• 손님을 톡 하면 좋은 빵부터 줘요. 평론가🎩는 PERFECT만 받아요. PERFECT를 이어서 주면 🔥콤보!<br>• 번 돈으로 업그레이드를 사요. <b>새 메뉴</b>는 비싸지만 굽기가 어렵고, <b>🫘 맛 강화</b>로 쉬운 맛의 값을 올릴 수도 있어요. 팥 하나만 키워서 멀리 가는 것도 가능해요!<br>• 틀은 최대 8개, 🍽️ 접시를 넓히면 미리 많이 구워 둘 수 있어요.<br>• 🎫 부활권: 탈락한 날을 한 번 더 해요. 미리 사 두거나, 탈락한 순간에 사도 돼요.<br>• 🔁 <b>체크포인트</b>: 10·20·30…단계를 통과하면 저장돼요. 예를 들어 27단계에서 탈락하면 21단계부터 다시 할 수 있어요 (그 주 판 안에서).<br>• 이번 주 판은 모두 같은 손님·날씨·이벤트로 겨뤄요. 🏆 순위표에서 친구들과 비교해요 (월요일 0시에 새로 시작).</div>'}
$('m4').onclick=()=>{au();renderHow();show('how')};$('hx').onclick=()=>show('menu');
$('m6').onclick=()=>{au();openLb(0)};$('m7').onclick=()=>share();
$('o6').onclick=()=>share({stage:run?run.stage:0,net:run?run.tot:0});
$('m3').onclick=()=>{au();$('sn').textContent=save.snd?'🔊 소리 켜짐':'🔇 소리 꺼짐';$('sk').textContent='✏️ 닉네임 바꾸기 ('+save.nick+')';$('rs').textContent='🗑️ 기록·저장 지우기';show('set')};
$('sk').onclick=()=>openNick(false);
$('sn').onclick=()=>{save.snd=!save.snd;store();$('sn').textContent=save.snd?'🔊 소리 켜짐':'🔇 소리 꺼짐'};
$('sc').onclick=()=>show('menu');
$('rs').onclick=()=>ask($('rs'),'⚠️ 정말 지울까요? 한 번 더!',()=>{save={snd:save.snd,runs:0,clears:0,best:{stage:0,net:0},week:{id:0,stage:0,net:0},free:{stage:0,net:0},run:null};store();renderMenu();toast('모두 지웠어요')});
$('s1').onclick=()=>{au();startDay()};
$('sm1').onclick=()=>openLb(0);$('sm2').onclick=()=>{toMenu();toast('판은 저장됐어요. ▶ 이어서 하기로 돌아와요')};
$('o4').onclick=()=>openLb(0);$('o1').onclick=()=>{startRun('week')};$('o3').onclick=toMenu;
/* ---------- 닉네임 ---------- */
let nickFrom=null;
function cleanNick(t){return String(t).replace(/[\u0000-\u001f\u007f<>&"\\]/g,'').replace(/\s+/g,' ').trim().slice(0,10)}
function openNick(first){nickFrom=first?'first':scr==='over'?'over':'menu';$('nkx').style.display=first?'none':'block';$('nkh').textContent=first?'처음이네요! 순위표에 보일 이름을 정해요':'닉네임 바꾸기';
 $('nki').value=save.nick||'붕어빵'+(10+Math.floor(Math.random()*90));$('nke').textContent='';show('nick');setTimeout(()=>{try{$('nki').focus();$('nki').select()}catch(e){}},50)}
$('nk1').onclick=()=>{const n=cleanNick($('nki').value);if(n.length<1){$('nke').textContent='한 글자 이상 써 주세요';return}if(BADW.bad(n)){$('nke').textContent='다른 닉네임을 써 주세요 🙏';return}
 const ch=n!==save.nick;save.nick=n;store();
 const lb=LB();if(ch&&lb&&save.sub.id===wid())lb.submit({w:save.sub.id,n,st:save.sub.stage,net:save.sub.net,live:!!save.sub.live,lg:null});
 toMenu();if(nickFrom==='first'){if(!showInvite())setTimeout(()=>{if(!save.tut)startTut(false);else startTour()},300)}else if(ch)toast('닉네임: '+n)};
$('nki').addEventListener('keydown',e=>{if(e.key==='Enter')$('nk1').click()});
$('nkx').onclick=()=>toMenu();
/* ---------- 순위표 ---------- */
let lbWk=0,lbBusy=false;
function openLb(wk){lbWk=wk;show('lb');renderLb()}
async function renderLb(){const L=$('lbl'),w=wid()-lbWk;$('lbt0').className='tab'+(lbWk===0?' on':'');$('lbt1').className='tab'+(lbWk===1?' on':'');
 $('lbh').textContent=lbWk===0?'이번 주 판 #'+w+' · 월요일 0시에 새로 시작':'지난 주 판 #'+w+' 최종 순위';
 const lb=LB();if(!lb){L.innerHTML='<p class="ht">순위표를 아직 연결하지 않았어요.<br>(firebase-config.js 설정 후 열려요)</p>';return}
 L.innerHTML='<p class="ht">불러오는 중…</p>';if(lbBusy)return;lbBusy=true;
 let rows=null;try{rows=await lb.top(w)}catch(e){rows=null}lbBusy=false;if(scr==='game')return;
 if(w!==wid()-lbWk)return;
 if(!rows){L.innerHTML='<p class="ht">불러오지 못했어요. 잠시 뒤에 다시 눌러 주세요.</p>';return}
 if(!rows.length){L.innerHTML='<p class="ht">'+(lbWk===0?'아직 아무도 없어요. 첫 번째 주인공이 되어 보세요! 🏆':'지난 주 기록이 없어요.')+'</p>';return}
 const me=lb.uid;L.innerHTML='';
 rows.forEach((r,i)=>{const d=document.createElement('div');d.className='lr'+(r.u===me?' me':'');
  const lv=r.live&&Date.now()-r.ts<3*3600e3;d.innerHTML='<b>'+(i<3?['🥇','🥈','🥉'][i]:(i+1))+'</b><span class="ln"></span>'+(lv?'<span class="lv">🔥 진행 중</span>':'')+'<span class="ls"><i>'+r.st+'단계</i><small>'+fmt(r.net)+'원</small></span>';
  d.querySelector('.ln').textContent=r.n;d.style.cursor='pointer';d.onclick=()=>{location.href='shop.html?visit='+encodeURIComponent(r.u)};L.appendChild(d)});
 const f=document.createElement('p');f.className='ht';f.style.textAlign='center';f.textContent=(rows.length>=30?'위쪽 30명이에요 · ':rows.length+'명 · ')+'이름을 누르면 그 사람 가게를 구경해요 🏪';L.appendChild(f);
 /* 30위 밖이면 내 순위 주변 (위·아래 3명) */
 const sc=lbWk===0?mySc():0;if(rows.length>=30&&sc&&!rows.some(r=>r.u===me)&&lb.around){const h=document.createElement('p');h.className='ht';h.style.textAlign='center';h.textContent='⋯ 내 순위 주변 불러오는 중 ⋯';L.appendChild(h);
  Promise.all([lb.rank(w,sc),lb.around(w,sc)]).then(([n,a])=>{if(scr==='game')return;h.innerHTML='<b>⋯ 내 순위 주변 ⋯</b>';lastRank=rkTxt(n);
   const mk=(r,k,isMe)=>{const d=document.createElement('div');d.className='lr'+(isMe?' me':'');d.innerHTML='<b>'+k+'</b><span class="ln"></span><span class="ls"><i>'+r.st+'단계</i><small>'+fmt(r.net)+'원</small></span>';d.querySelector('.ln').textContent=r.n;if(!isMe){d.style.cursor='pointer';d.onclick=()=>{location.href='shop.html?visit='+encodeURIComponent(r.u)}}return d};
   a.above.forEach((r,i)=>L.appendChild(mk(r,n-a.above.length+i,false)));L.appendChild(mk({n:save.nick,st:save.sub.stage,net:save.sub.net},n,true));a.below.forEach((r,i)=>L.appendChild(mk(r,n+1+i,false)))}).catch(()=>{h.textContent=''})}}
$('lbt0').onclick=()=>openLb(0);$('lbt1').onclick=()=>openLb(1);$('lbr').onclick=()=>{const lb=LB();if(lb&&lb.bust)lb.bust();renderLb()};$('lbx').onclick=()=>{if(scr==='over')show('over');else if(scr==='shop')show('shop');else show('menu')};
/* ---------- 공유 ---------- */
/* 자랑하기: 그림 카드 + 링크 (js/share.js) */
if(!window.ART_IMG.cook){const im=new Image();im.src='img/cook1.webp';window.ART_IMG.cook=im}
function share(o){au();const wk=save.week.id===wid()?save.week:{stage:0,net:0},url=location.origin+'/';
 const st=o&&o.stage!=null?o.stage:wk.stage,net=o&&o.net!=null?o.net:wk.net;
 const curl=()=>url+'?c='+encodeURIComponent(save.nick||'')+'&s='+st+'&w='+wid()+(lastRank?'&r='+encodeURIComponent(lastRank):'');
 const txt=st?'🔥 붕어빵 챌린지 이번 주 '+st+'단계'+(lastRank?' ('+lastRank+')':'')+'까지 갔어요! 내 기록 넘어 봐 😎':'🔥 붕어빵 챌린지 같이 해요! 이번 주 누가 제일 멀리 가는지 겨뤄요 🏆';
 if(!st){if(navigator.share){navigator.share({title:'붕어빵 챌린지',text:txt,url}).catch(()=>{});return}SHARE.copy(txt+'\n'+url).then(()=>toast('복사했어요! 카톡에 붙여넣기 하세요'));return}
 const go=()=>{const u=curl(),cv=SHARE.challenge({nick:save.nick||'붕어빵',stage:st,net,rank:lastRank,wk:wid(),url});SHARE.send(cv,txt.replace('단계(','단계 ('),u,'붕어빵 챌린지')};
 const lb=LB();if(lastRank||!lb){go();return}toast('카드 만드는 중…');const sc=mySc();if(!sc||!lb.rank){go();return}Promise.race([lb.rank(wid(),sc),new Promise(r=>setTimeout(()=>r(null),2500))]).then(n=>{if(n)lastRank=rkTxt(n);go()}).catch(go)}
function pauseGame(){if(scr!=='game'||!s||paused||s.ph!=='play')return;paused=true;$('pause').style.display='block'}
function resumeGame(){if(!paused)return;paused=false;$('pause').style.display='none';last=0}
$('home').onclick=pauseGame;$('p1').onclick=resumeGame;$('p2').onclick=()=>ask($('p2'),'⚠️ 판이 끝나요. 한 번 더!',giveUp);

/* ---------- 조작 ---------- */
A=ART(cx,{shape:()=>0,toast:t=>toast(t),snd:k=>snd(k)});const {em,tx,rr,m2,lite,dark}=A;
cv.addEventListener('pointerdown',e=>{e.preventDefault();au();if(scr==='tut'&&tut){const r=cv.getBoundingClientRect(),x=(e.clientX-r.left)/r.width*W,y=(e.clientY-r.top)/r.height*H;if(tut.done){if(tut.done>.4&&y>420&&y<490)endTut(true);return}const st=TS[tut.i];if(st.hold&&!tut.ready)return;tap(x,y);return}if(scr!=='game'||paused||!s||s.ph!=='play')return;const r=cv.getBoundingClientRect();tap((e.clientX-r.left)/r.width*W,(e.clientY-r.top)/r.height*H)});
cv.addEventListener('contextmenu',e=>e.preventDefault());
function tap(x,y){A.tapPlay(x,y);drain()}
function drain(){A.drainFx()}

/* ---------- 그리기 (가게와 같은 그림 도구, 배경만 챌린지 노점) ---------- */
function awning(t){const n=15,w=W/n;for(let i=0;i<n;i++){const c=i%2?'#fff6ec':'#e8584a';cx.fillStyle=c;cx.fillRect(i*w,60,w,16);cx.beginPath();cx.arc(i*w+w/2,76,w/2,0,Math.PI);cx.fill()}
 cx.fillStyle='rgba(0,0,0,.12)';cx.fillRect(0,60,W,3)}
function draw(){A.use(s,run,ui);const lc=B.L(run);A.drawPlay({street:true,sub:s.wea.n+' · 컷트라인 '+fmt(s.cut)+'원',
 bg:t=>{cx.fillStyle='#ffe0b5';cx.fillRect(0,0,W,H);cx.fillStyle='#c9935f';cx.fillRect(0,322,W,78);cx.fillStyle='#d9a873';cx.fillRect(0,322,W,6);cx.fillStyle='rgba(0,0,0,.14)';cx.fillRect(0,328,W,4);cx.fillStyle='#6b5344';cx.fillRect(0,394,W,310)},
 front:t=>{awning(t);/* 카운터 앞판 */const g=cx.createLinearGradient(0,318,0,330);g.addColorStop(0,'#b97d4a');g.addColorStop(1,'#a06a3a');cx.fillStyle=g;cx.fillRect(0,318,W,8)},
 head:t=>{rr(0,0,W,58,0,'#8a5a3a');tx(s.d+'일차 '+s.wea.e,50,20,22,'#fff','left');
  const dc=['','🏮','🏮⛱️','🏮⛱️✨'][run.up.deco|0];tx(lc.e+(dc||''),160,20,16,'#fff','left');
  tx('🪙 '+fmt(run.coins+s.net),385,20,ui.hud>0?26:22,ui.hud>0?'#fff6c0':'#ffe9a0','right');
  const gr=Math.max(0,Math.min(1.25,s.net/s.cut));rr(128,38,258,12,6,'rgba(0,0,0,.35)');rr(128,38,258*gr/1.25,12,6,gr>=1?'#ffd23a':'#7ed88a');rr(128+258/1.25-1.5,36,3,16,1,'#fff');tx('컷트라인 '+fmt(s.cut),122,45,13,'#fff','right')}})}

/* ---------- 도전장 (자랑 링크로 들어온 사람) ---------- */
const rivalOK=()=>save.rival&&save.rival.w===wid()&&save.rival.n;
let inv=null;{const q=new URLSearchParams(location.search),c=(q.get('c')||'').slice(0,12),sN=parseInt(q.get('s'),10),w=parseInt(q.get('w'),10);
 if(c&&sN>0&&sN<=R.maxStage){inv={n:c,s:sN,r:(q.get('r')||'').slice(0,12),w}}if(q.has('c')){try{history.replaceState(null,'',location.pathname)}catch(e){}}}
function showInvite(){if(!inv)return false;const same=inv.w===wid();if(same&&!BADW.bad(inv.n)&&inv.n!==save.nick){save.rival={n:inv.n,s:inv.s,w:inv.w};store()}
 $('chlt').textContent=(BADW.bad(inv.n)?'친구':inv.n)+'님이 도전장을 보냈어요!';
 $('chlb').innerHTML=same?'이번 주 기록 <b style="font-size:26px;color:#e8642a">'+inv.s+'단계</b>'+(inv.r?'<br>🏆 '+esc(inv.r):'')+'<br>이 기록을 넘을 수 있을까요? 🔥':'지난 주 '+inv.s+'단계까지 갔대요!<br>이번 주엔 내가 이겨 볼까요? 🔥';
 $('chl').style.display='block';inv=null;return true}
$('chl1').onclick=()=>{$('chl').style.display='none';au();if(!save.tut){startTut(true);return}$('m1').click()};
$('chl2').onclick=()=>{$('chl').style.display='none';if(!save.tour)startTour()};
/* ---------- 첫 판 '직접 해보기': 손님 1명·틀 1개, 화살표를 따라 누르면 진행해요 ---------- */
let tut=null;
const TS=[
 {c:'① 빈 틀을 톡! 반죽을 부어요',p:()=>MP(),ok:()=>s.mold[0].s>=1},
 {c:'② 한 번 더 톡! 속(팥)을 넣어요',p:()=>MP(),ok:()=>s.mold[0].s>=2},
 {c:'③ 덮개를 톡! 굽기 시작',p:()=>MP(),ok:()=>s.mold[0].s>=3},
 {c:'④ 막대가 노란 구간에 오면… 지금 톡! 뒤집어요',p:()=>MP(),ok:()=>s.mold[0].s>=4,hold:3},
 {c:'⑤ 또 노란 구간! 톡 해서 꺼내요',p:()=>MP(),ok:()=>s.rack.length>0||s.served>0,hold:4},
 {c:'⑥ 손님을 톡! 붕어빵을 건네요',p:()=>CP(),ok:()=>s.served>0}];
function startTut(fromInv){au();run=B.newRun(777,'free');run.lg=null;s=B.newDay(run);s.ban=0;s.spawnT=999;s.noHint=1;ui=A.newUi();A.use(s,run,ui);
 s.cust=[null,{an:'🐰',ty:'n',ord:[1,0,0,0,0,0],got:[0,0,0,0,0,0],pat:999,max:999,in:1,leave:0,sh:0,ag:9},null];
 tut={i:0,done:0,inv:!!fromInv,t:0};scr='tut';paused=false;show('none');$('dm').style.display='block';$('dmx').textContent='건너뛰기 ▶';$('home').style.display='none'}
function tutTick(dt){if(!tut)return;s.spawnT=999;tut.t+=dt;s.t=Math.min(s.t,20);const m=s.mold[0];
 if(tut.done){if(tut.done>0)tut.done+=dt;return}
 const st=TS[tut.i];if(st.hold&&m.s===st.hold){const M=R.menu[m.f];if(m.p>1)m.p=1;tut.ready=m.p>=1-M.w*.5}else tut.ready=!st.hold;
 if(st.ok()){tut.i++;tut.t=0;if(tut.i>=TS.length){tut.done=.01;snd('win');save.tut=1;store()}}}
function tutDraw(){if(!tut)return;
 if(tut.done){A.rr(30,250,390,250,26,'rgba(255,248,236,.97)');A.em('🎉',225,300,56);A.tx('PERFECT! 잘했어요!',225,360,28,'#e8642a','center','#fff');A.tx('이제 진짜 이번 주 판에 도전!',225,400,19,'#5a3a22','center','#fff');
  A.rr(90,425,270,58,22,'#ffc94a');A.tx('⚔️ 도전 시작',225,454,24,'#5a3a22','center','#ffc94a');return}
 const st=TS[tut.i],tg=st.p(),wait=st.hold&&!tut.ready;
 A.rr(16,80,418,50,18,'rgba(90,58,34,.94)');A.tx(wait?'노란 구간이 올 때까지 기다려요…':st.c,225,105,st.c.length>22?15:17,'#fff','center','#5a3a22');
 if(!wait){const b=Math.abs(Math.sin(performance.now()/180))*10;cx.strokeStyle='rgba(255,220,80,.9)';cx.lineWidth=4;cx.beginPath();cx.arc(tg.x,tg.y,34+b*.6,0,7);cx.stroke();A.em('👆',tg.x+14,tg.y+34+b,46)}}
function endTut(go){const inv2=tut&&tut.inv;tut=null;s=null;run=null;$('dm').style.display='none';$('dmx').textContent='✕ 그만 보기';save.tut=1;store();
 if(go){au();startRun('week');toast('🔥 이번 주 판 시작! 화이팅');return}toMenu();if(!save.tour)setTimeout(startTour,250)}
$('ht').onclick=()=>startTut(false);
/* ---------- 따라하기 영상: 진짜 게임 화면에서 손가락이 직접 시연해요 ---------- */
let demo=null,demoFrom='how';
function playDemo(from){au();demoFrom=from||'how';run=B.newRun(12345,'free');run.lg=null;s=B.newDay(run);s.ban=0;s.spawnT=999;s.noHint=1;ui=A.newUi();A.use(s,run,ui);
 s.cust=[null,{an:'🐰',ty:'n',ord:[1,0,0,0,0,0],got:[0,0,0,0,0,0],pat:999,max:999,in:1,leave:0,sh:0,ag:9},null];
 demo={i:0,w:0,fx:225,fy:620,tap:0,done:0};scr='demo';paused=false;show('none');$('dm').style.display='block';$('home').style.display='none'}
const MP=()=>({x:A.mpos(0).x+64,y:A.mpos(0).y+29}),FP=()=>({x:225,y:744}),CP=()=>({x:225,y:236});
const inYel=()=>{const m=s.mold[0],M=R.menu[m.f];return m.p>=1-M.w*.3};
const DS=[
 {c:'① 빈 틀을 톡! 반죽을 부어요',p:MP,w:1.1},
 {c:'② 아래에서 맛(팥)을 골라요',p:FP,w:1},
 {c:'③ 틀을 한 번 더 톡! 속을 넣어요',p:MP,w:1},
 {c:'④ 덮개를 톡! 굽기 시작',p:MP,w:1},
 {c:'⑤ 막대가 노란 구간에 오면 톡! 뒤집어요',p:MP,u:()=>s.mold[0].s===3&&inYel()},
 {c:'⑥ 또 노란 구간에서 톡! 꺼내면 ✨PERFECT',p:MP,u:()=>s.mold[0].s===4&&inYel()},
 {c:'⑦ 손님을 톡! 붕어빵을 건네요',p:CP,w:1.2},
 {c:'🔥 PERFECT를 이어서 주면 콤보! 이제 직접 해 봐요',p:()=>({x:225,y:560}),w:2.8,end:1}];
function demoTick(dt){if(!demo||demo.done)return;s.spawnT=999;const st=DS[demo.i],tg=st.p(),k=Math.min(1,dt*6);demo.fx+=(tg.x-demo.fx)*k;demo.fy+=(tg.y-demo.fy)*k;if(demo.tap>0)demo.tap-=dt;
 const near=Math.hypot(tg.x-demo.fx,tg.y-demo.fy)<6;demo.w+=dt;
 if(near&&(st.u?st.u():demo.w>=st.w)){if(st.end){endDemo();return}A.tapPlay(tg.x,tg.y);drain();demo.tap=.35;demo.i++;demo.w=0}}
function demoDraw(){if(!demo)return;const st=DS[Math.min(demo.i,DS.length-1)];
 A.rr(16,80,418,50,18,'rgba(90,58,34,.94)');A.tx(st.c,225,105,st.c.length>22?16:18,'#fff','center','#5a3a22');
 if(demo.tap>0){cx.strokeStyle='rgba(255,230,90,'+demo.tap*2.5+')';cx.lineWidth=4;cx.beginPath();cx.arc(demo.fx,demo.fy,30*(1.2-demo.tap*2),0,7);cx.stroke()}
 A.em('👆',demo.fx+12,demo.fy+26-(demo.tap>0?6:0),48)}
function endDemo(){demo=null;s=null;run=null;$('dm').style.display='none';if(demoFrom==='how'){scr='menu';renderHow();show('how')}else toMenu()}
$('hd').onclick=()=>playDemo('how');$('dmx').onclick=()=>{if(scr==='tut')endTut(false);else endDemo()};
/* ---------- 처음 온 사람: 메뉴 안내 (건너뛰기 가능) ---------- */
const TOUR=[['m1','▶ <b>시작</b> — 이번 주 판을 시작해요.<br>이번 주엔 모두 같은 손님이 와요!'],['bk','🏪 <b>내 가게</b> — 꾸미고 키우는 나만의 붕어빵 가게'],['m6','🏆 <b>순위표</b> — 이번 주 친구들과 단계를 겨뤄요'],['m7','📤 <b>친구에게 자랑하기</b> — 내 기록 카드를 카톡으로 보내요'],['m4','📖 <b>규칙</b> — 움직이는 따라하기 영상도 있어요'],['m3','⚙️ <b>설정</b> — 소리 끄기, 닉네임 바꾸기']];
let ti=0;
function tourShow(){document.querySelectorAll('.hl').forEach(e=>e.classList.remove('hl'));
 if(ti>=TOUR.length){$('ttx').innerHTML='준비 끝! 🎉<br>게임 방법을 움직이는 영상으로 볼까요?';$('tnx').textContent='▶ 따라하기 보기';$('tsk').textContent='바로 시작';$('tdot').textContent='';$('tcap').style.top='auto';$('tcap').style.bottom='24px';return}
 const [id,txt]=TOUR[ti],el=$(id);el.classList.add('hl');$('ttx').innerHTML=txt;$('tnx').textContent=ti===TOUR.length-1?'다음 ▶':'다음 ▶';$('tsk').textContent='건너뛰기';$('tdot').textContent=(ti+1)+' / '+TOUR.length;
 const br=$('box').getBoundingClientRect(),sc=br.height/H,y=(el.getBoundingClientRect().top-br.top)/sc;if(y>420){$('tcap').style.top='24px';$('tcap').style.bottom='auto'}else{$('tcap').style.top='auto';$('tcap').style.bottom='24px'}}
function startTour(){if(save.tour)return;ti=0;$('tour').style.display='block';tourShow()}
function endTour(){document.querySelectorAll('.hl').forEach(e=>e.classList.remove('hl'));$('tour').style.display='none';save.tour=1;store()}
$('tnx').onclick=()=>{if(ti>=TOUR.length){endTour();playDemo('menu');return}ti++;tourShow()};
$('tsk').onclick=()=>endTour();

/* ---------- 반복 ---------- */
function loop(ts){const dt=Math.min(.05,(ts-last)/1000||0);last=ts;
 if(s&&scr==='tut'){acc+=dt;let n=0;while(acc>=B.DT&&n++<4){B.step(s,run,B.DT);acc-=B.DT;drain();tutTick(B.DT)}A.tickFx(dt);if(scr==='tut'){draw();tutDraw()}}
 else if(s&&scr==='demo'){acc+=dt;let n=0;while(acc>=B.DT&&n++<4){B.step(s,run,B.DT);acc-=B.DT;drain()}A.tickFx(dt);demoTick(dt);if(scr==='demo'){draw();demoDraw()}}
 else if(s&&scr==='game'){if(!paused){acc+=dt;let n=0;while(acc>=B.DT&&n++<4){B.step(s,run,B.DT);acc-=B.DT;drain();if(s.done)break}
  A.tickFx(dt);
  if(s.done){draw();finishDay();requestAnimationFrame(loop);return}}draw()}
 requestAnimationFrame(loop)}
function fit(){const b=document.body,sc=Math.min(b.clientWidth/W,b.clientHeight/H);$('box').style.transform='translate('+(b.clientWidth-W*sc)/2+'px,'+(b.clientHeight-H*sc)/2+'px) scale('+sc+')'}
addEventListener('resize',fit);addEventListener('orientationchange',()=>setTimeout(fit,200));
document.addEventListener('visibilitychange',()=>{if(document.hidden)pauseGame();if(AC){if(document.hidden)AC.suspend();else AC.resume()}});
addEventListener('pagehide',pauseGame);
window.__bp2={save,B,get run(){return run},get s(){return s},startRun,startDay,tap,drain,finishDay,get scr(){return scr}};
$('snw').onclick=()=>{show('menu');NEWS.open()};INSTALL.bind($('sin'));INSTALL.bind($('mapp'));$('sxf').onclick=()=>{show('menu');INSTALL.xfer()};
fit();renderMenu();show('menu');if(!save.nick){NEWS.check(true);openNick(true);INSTALL.nudge(false)}else if(showInvite()){}else if(oldRun){store();toast('규칙이 새로 바뀌어서 이번 판은 처음부터 해요')}else NEWS.check(false);INSTALL.nudge(!!save.nick);requestAnimationFrame(loop);
})();
