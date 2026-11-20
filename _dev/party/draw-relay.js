/*META
{"tool":"draw-relay","title":"그림 릴레이","emoji":"🖍️","min":3,
 "sub":"단어 → 그림 → 맞히기 → 그림…<br>돌고 돌아 마지막에 어떻게 바뀌었는지 다 같이 봐요!",
 "rules":["각자 <b>시작 단어</b>를 하나씩 받아요. 먼저 그 단어를 그려요. (글자·숫자는 쓰면 안 돼요!)","다 그리면 그림이 옆 사람에게 넘어가요. 받은 그림을 보고 <b>무엇인지 글로</b> 적어요.","그 글은 또 다음 사람에게! 이번엔 그 글을 보고 그려요. 이렇게 그림 ↔ 글을 번갈아 가며 한 바퀴 돌아요.","한 바퀴 돌면 모든 책을 공개해요. 처음 단어가 어떻게 바뀌었는지 보며 웃어요 😂","그림 잉크는 정해져 있어요. 아껴서 그려요!"],
 "ui":{"ink":1},
 "cssvars":"--bg:#fff6ea;--ink:#4a3424;--sub:#8e6e52;--line:#f0dcc2;--soft:#fde9cf;--pri:#ffc56b;--pri2:#d99a35;--card:#fffdf8",
 "css":".prompt{text-align:center;font-size:28px;color:#c05a1a;margin:4px 0 10px;word-break:keep-all}.padw{width:100%;aspect-ratio:1/1;background:#fff;border:3px solid var(--line);border-radius:16px;overflow:hidden}#pad,.view{width:100%;height:100%;display:block;touch-action:none}.vieww{width:100%;max-width:340px;margin:6px auto;aspect-ratio:1/1;background:#fff;border:3px solid var(--line);border-radius:14px;overflow:hidden}.tools{display:flex;flex-wrap:wrap;gap:6px;justify-content:center;margin-top:8px}.tools .sw{width:32px;height:32px;border-radius:50%;border:3px solid #fff;box-shadow:0 3px 0 rgba(0,0,0,.15)}.tools .sw.on{outline:3px solid var(--ink);outline-offset:1px}.tools .wd{width:40px;height:36px;display:flex;align-items:center;justify-content:center}.tools .wd i{display:block;border-radius:50%;background:var(--ink)}.tools .wd.on{background:var(--pri);box-shadow:0 3px 0 var(--pri2)}.tools .tb{height:36px;padding:0 10px;font-size:14px}.inkb{height:12px;border-radius:6px;background:#f2e6d6;margin-top:10px;overflow:hidden}.inkb i{display:block;height:100%;background:linear-gradient(90deg,#3a8ee6,#8e5ad6);border-radius:6px}.step{margin:10px 0;text-align:center}.step .lb{font-size:14px;color:var(--sub)}.gbub{display:inline-block;background:#fff;border:3px solid var(--pri);border-radius:16px;padding:8px 16px;font-size:22px;margin-top:4px}.arrow{text-align:center;color:var(--sub);font-size:20px}"}
META*/
const WORDS=[...new Set(('사과,바나나,수박,딸기,포도,당근,버섯,파인애플,고양이,강아지,토끼,물고기,병아리,뱀,거북이,달팽이,나비,거미,문어,코끼리,기린,펭귄,돼지,오리,곰,사자,상어,고래,공룡,부엉이,해,달,별,구름,무지개,눈사람,번개,나무,꽃,산,집,성,등대,자동차,버스,기차,비행기,배,자전거,로켓,헬리콥터,우산,안경,모자,신발,양말,가방,시계,열쇠,가위,연필,책,컵,의자,침대,텔레비전,휴대폰,카메라,전구,촛불,풍선,선물,케이크,피자,햄버거,아이스크림,도넛,사탕,라면,달걀,치킨,기타,피아노,축구공,텐트,왕관,보물상자,해적,유령,로봇,외계인,천사,마녀,하트,화산,섬,폭포,그네,미끄럼틀,신호등,사다리,망원경,돋보기,칫솔,빗자루,냉장고,편지,지도,트로피,산타클로스,크리스마스트리,호박,허수아비,해바라기,선인장,우주선,낙하산,주사위,모래성,수영장,낚시,방귀,잠자기,줄넘기,눈싸움,생일파티,소방관,요리사,의사,경찰,마법사,공주,용,인어공주,닌자,캠핑,불꽃놀이,비누방울').split(','))];
const MAXI=[4500,6500,8500];
let st=null;            // 지금 내가 그리는 그림 {key,list,cur,c,w,full}
const VIEW={};          // 보기용 그림 (캔버스 id → 획 목록)
const live=()=>{const l=st?st.list.slice():[];if(st&&st.cur&&st.cur.p.length)l.push(strokeStr(st.cur));return l};
const used=()=>live().reduce((a,x)=>a+x.length,0);
const GAME={
 maps:['e'],
 reset(){st=null},
 setup(n,id,ui){const L=WORDS.length,pick=shuffle([...Array(L).keys()]).slice(0,n);return {w:pick.map((i,b)=>(i+hash(id+':'+b))%L),ink:ui.ink==null?1:ui.ink}},
 settings(ui){return `<div class="lbl">그림 잉크 양</div><div class="chips">${opt('ink',0,'🖊️ 조금 (빨리빨리)')}${opt('ink',1,'🖍️ 보통')}${opt('ink',2,'🎨 많이')}</div>`},
 derive(g){
  const P=g.pl,n=P.length,D=Dof(g),stop=stopOf(g,D),sk=skipsOf(P,D),L=WORDS.length;
  const word=b=>WORDS[((g.w[b]-hash(g.id+':'+b))%L+L)%L];
  const books=P.map((id,b)=>({b,start:id,word:word(b),steps:[]}));
  for(let k=0;k<n;k++){
   const missing=[];
   P.forEach((id,i)=>{const b=(i-k+n)%n,v=(D(id).e||{})[k],draw=k%2===0;
    if(draw?Array.isArray(v):(typeof v==='string'&&v))books[b].steps.push({k,id,v,draw});
    else if(sk.has('e:'+id+':'+k))books[b].steps.push({k,id,v:draw?[]:'(건너뜀)',draw,skip:1});
    else missing.push(id)});
   if(missing.length)return stop?{g,P,D,n,ph:'end',books,stopped:stop}:{g,P,D,n,ph:'step',r:k,k,missing,books};
  }
  return {g,P,D,n,ph:'end',books};
 },
 buzz(s){return s.ph==='step'&&s.missing.includes(ME)},
 busy(){return !!(st&&st.cur)},
 play(s,key,me){
  const k=s.k,draw=k%2===0;
  let h=`<div class="small" style="text-align:center">${k+1} / ${s.n} 단계 · ${draw?'🖍️ 그리기':'💬 맞히기'}</div>`;
  if(me&&s.missing.includes(ME)){
   const i=s.P.indexOf(ME),b=(i-k+s.n)%s.n,book=s.books[b],prev=k===0?null:book.steps.find(x=>x.k===k-1);
   if(draw){
    const text=k===0?book.word:(prev?prev.v:'?');
    if(!st||st.key!==key)st={key,list:[],cur:null,c:0,w:1,full:false};
    const max=MAXI[s.g.ink==null?1:s.g.ink];
    h+=`<div class="card"><h2>${k===0?'🎁 내 시작 단어를 그려요':'🖍️ 이 말을 그림으로!'}</h2><div class="prompt">${esc(text)}</div>
    <div class="padw"><canvas id="pad"></canvas></div>
    <div class="tools">${PCOL.map((c,j)=>`<button class="sw${st.c===j?' on':''}" style="background:${c}${j===9?';border-color:#ddd':''}" data-act="pc" data-c="${j}">${j===9?'🧽':''}</button>`).join('')}${PWID.map((w,j)=>`<button class="wd${st.w===j?' on':''}" data-act="pw" data-w="${j}"><i style="width:${[6,12,20][j]}px;height:${[6,12,20][j]}px"></i></button>`).join('')}<button class="tb" data-act="undo">↩️ 되돌리기</button><button class="tb" data-act="clr">🗑️ 지우기</button></div>
    <div class="inkb"><i id="inkbar" style="width:${Math.max(0,100-used()/max*100).toFixed(0)}%"></i></div><div class="small" style="text-align:center">남은 잉크</div>
    <button class="big" data-act="sendd">다 그렸어요 ✅</button></div>`;
   }else{
    VIEW.see=prev?prev.v:[];
    h+=`<div class="card"><h2>🤔 이 그림은 무엇일까요?</h2><div class="vieww"><canvas class="view" id="see"></canvas></div>
    <input type="text" id="gs" maxlength="15" placeholder="그림을 보고 떠오르는 말" autocomplete="off" data-enter="sendg"><div class="err">${esc(errMsg)}</div><button class="big" data-act="sendg">이거예요! ✋</button></div>`;
   }
  }else if(me){
   h+=`<div class="card" style="text-align:center;font-size:19px">✅ 다 했어요! 다른 사람을 기다리는 중 <span class="wait">⏳</span></div>`;
  }
  h+=`<div class="card"><h2>⏳ 이번 단계</h2>${s.P.map(id=>`<div class="row"><div class="av">${avOf(id)}</div><div class="nm">${esc(nameOf(id))}</div><span class="tag${s.missing.includes(id)?' turn':' on'}">${s.missing.includes(id)?(draw?'그리는 중 🖍️':'생각 중 🤔'):'다 했어요'}</span></div>`).join('')}</div>`;
  if(me)h+=waitBtn(key,90000,s.missing,id=>'e:'+id+':'+k);
  return h;
 },
 after(changed){
  const pad=$('pad');if(pad){fitCanvas(pad);paintStrokes(pad,live())}
  if(changed||1)document.querySelectorAll('canvas.view').forEach(c=>{const w=c.width;fitCanvas(c);if(changed||c.width!==w||!c.__p){paintStrokes(c,VIEW[c.id]||[]);c.__p=1}});
 },
 end(s){
  let h='',ok=0;
  s.books.forEach(bk=>{
   const last=bk.steps[bk.steps.length-1];if(last&&!last.draw&&norm(last.v)===norm(bk.word))ok++;
   h+=`<div class="card"><h2>📖 ${who(bk.start)}의 책</h2><div class="step"><div class="lb">시작 단어</div><div class="gbub">${esc(bk.word)}</div></div>`;
   bk.steps.forEach(x=>{
    h+=`<div class="arrow">⬇️</div>`;
    if(x.draw){const cid='v'+bk.b+'_'+x.k;VIEW[cid]=x.v;h+=`<div class="step"><div class="lb">🖍️ ${esc(nameOf(x.id))}님의 그림${x.skip?' (건너뜀)':''}</div><div class="vieww"><canvas class="view" id="${cid}"></canvas></div></div>`}
    else h+=`<div class="step"><div class="lb">💬 ${esc(nameOf(x.id))}님이 본 것</div><div class="gbub">${esc(x.v)}</div></div>`;
   });
   if(last&&!last.draw)h+=`<div class="res"><p>${norm(last.v)===norm(bk.word)?'🎯 끝까지 그대로 전달 성공!':'😂 이렇게 바뀌었어요!'}</p></div>`;
   h+=`</div>`;
  });
  return `<div class="card res"><div class="em">📚</div><div class="t">모든 책 공개!</div>${s.n%2===0?`<p>끝까지 전달 성공 <b>${ok}</b> / ${s.books.length}</p>`:'<p>처음 단어와 마지막 그림을 비교해 봐요 😆</p>'}</div>`+h;
 },
 act(a,el,g,s,me){
  if(!me||s.ph!=='step')return;const p=myP(g);
  if(a==='pc'&&st){st.c=+el.dataset.c;if(st.c===9&&st.w<1)st.w=2;render()}
  else if(a==='pw'&&st){st.w=+el.dataset.w;render()}
  else if(a==='undo'&&st){st.list.pop();st.full=false;render();GAME.after(false)}
  else if(a==='clr'&&st){if(confirm('그림을 다 지울까요?')){st.list=[];st.full=false;render();GAME.after(false)}}
  else if(a==='sendd'&&st&&s.k%2===0){
   if(!st.list.length&&!confirm('아무것도 안 그렸어요. 그냥 넘길까요?'))return;
   p.e[s.k]=st.list.slice();st=null;commit();
  }
  else if(a==='sendg'&&s.k%2===1){
   const v=(($('gs')||{}).value||'').trim();if(!v)return setErr('보이는 대로 한마디 적어 주세요');
   p.e[s.k]=v.slice(0,15);commit();
  }
 }
};
/* 그림판 입력 (한 번만 연결) */
function padPt(e,cv){const r=cv.getBoundingClientRect();return [Math.max(0,Math.min(1000,(e.clientX-r.left)/r.width*1000)),Math.max(0,Math.min(1000,(e.clientY-r.top)/r.height*1000))]}
document.addEventListener('pointerdown',e=>{
 const cv=e.target;if(!cv||cv.id!=='pad'||!st)return;e.preventDefault();
 const g=current(),max=MAXI[g&&g.ink!=null?g.ink:1];
 if(used()>=max){if(!st.full){st.full=true;toast('잉크가 다 떨어졌어요! 되돌리기나 지우기를 써요')}return}
 try{cv.setPointerCapture(e.pointerId)}catch(x){}
 st.cur={c:st.c,w:st.w,p:[padPt(e,cv)]};paintStrokes(cv,live());
});
document.addEventListener('pointermove',e=>{
 if(!st||!st.cur)return;const cv=$('pad');if(!cv)return;e.preventDefault();
 const q=padPt(e,cv),l=st.cur.p[st.cur.p.length-1];if(Math.hypot(q[0]-l[0],q[1]-l[1])<5)return;
 const g=current(),max=MAXI[g&&g.ink!=null?g.ink:1];if(used()+4>max){if(!st.full){st.full=true;toast('잉크가 다 떨어졌어요!')}return}
 st.cur.p.push(q);
 const cx=cv.getContext('2d'),k=cv.width/1000;cx.strokeStyle=PCOL[st.cur.c];cx.lineWidth=PWID[st.cur.w]*k;cx.lineCap='round';cx.beginPath();cx.moveTo(l[0]*k,l[1]*k);cx.lineTo(q[0]*k,q[1]*k);cx.stroke();
 const bar=$('inkbar');if(bar)bar.style.width=Math.max(0,100-used()/max*100).toFixed(0)+'%';
},{passive:false});
['pointerup','pointercancel'].forEach(t=>document.addEventListener(t,()=>{if(st&&st.cur){if(st.cur.p.length)st.list.push(strokeStr(st.cur));st.cur=null;render();GAME.after(false)}}));
