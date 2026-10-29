/* ===== 📢 새 소식 (패치 노트) — 챌린지·가게 공용 =====
   새 버전으로 처음 들어오면 한 번 떠요. 설정의 '📢 새 소식'에서 다시 볼 수 있어요.
   업데이트할 때 맨 위에 새 항목을 더하고 v를 올려요. */
const NEWS=(()=>{
const KEY='bpNewsSeen';
const L=[
 {v:'3.1',d:'10월 29일',t:['📲 웹에서는 첫 화면과 가게 화면에 앱 설치 버튼이 늘 보여요 · 새 소식은 최근 3개만 펼쳐 보여요']},
 {v:'3.0',d:'10월 29일',t:[
  '🏆 순위표: 30위 밖이어도 맨 아래에 내 순위와 위·아래 3명이 보여요. 단계를 넘길 때 보이는 내 순위도 정확한 숫자로 나와요',
  '⚡ 순위를 더 가볍게 불러와서 사람이 많아져도 순위표가 잘 버텨요']},
 {v:'2.9',d:'10월 29일',t:[
  '🃏 카드 선택 (🔥 챌린지, 11월 2일 월요일 새 판부터): 5단계를 넘길 때마다 카드 3장 중 1장을 골라요. 이번 주엔 모두 같은 카드가 나오고, 같은 카드는 겹쳐요. 어떤 조합이 셀지 친구들과 겨뤄 보세요!',
  '🐶 굽기 알바가 강아지로 바뀌었어요 (곰 사장님과 안 헷갈리게)',
  '🏪 직원들이 카운터 뒤에 제대로 서고, 가게 캐릭터가 더 작아졌어요. 작은 가게(4×4)는 손님이 4명까지 들어와요']},
 {v:'2.8',d:'10월 29일',t:[
  '📦 기록 옮기기: ⚙️ 설정 → 📦 기록 옮기기에서 6자리 번호를 받아, 설치한 앱(또는 다른 폰)에서 넣으면 기록이 그대로 넘어가요',
  '📲 카톡에서 하던 기록도 앱으로 옮길 수 있어요 (번호는 15분 동안, 한 번만)']},
 {v:'2.7',d:'10월 29일',t:[
  '📲 앱으로 설치할 수 있어요! ⚙️ 설정 → 📲 앱으로 설치 (안드로이드 크롬은 바로, 아이폰은 사파리에서 홈 화면에 추가)']},
 {v:'2.6',d:'10월 29일',t:[
  '🎨 가구 그림이 캐릭터처럼 바뀌었어요 (진한 테두리 · 스티커 느낌)',
  '🛋️ 가구 고르기가 쉬워졌어요: 실제 모습 미리보기 카드, 분류(의자·탁자 / 식물 / 조명 / 장식 / 세트 / 특별), 꾸미기 점수 표시',
  '🎁 테마 세트 4종 · 새 가구 20개: ☕ 카페 · 🌸 봄 소풍 · ❄️ 겨울 · 🐟 붕어빵. 한 세트를 다 놓으면 꾸미기 ✨+400']},
 {v:'2.5',d:'10월 29일',t:[
  '🗑️ 탄 붕어빵을 톡 하면 바로 버리고 빈 틀이 돼요 (가게는 지금부터, 🔥 챌린지는 11월 2일 월요일 새 판부터)',
  '🔥 콤보 표시가 손님 주문을 가리지 않게 시간 줄 오른쪽으로 옮겼어요',
  '🏪 가게 화면 손님·직원 크기를 가구에 맞게 줄였어요',
  '🎨 꾸미기가 쉬워졌어요: 탭 4개(가구·벽바닥·간판장식·넓히기), 꾸미는 동안 손님 숨김, 고른 가구 한 번 더 톡 = 돌리기, 빈 칸 톡 = 옮기기',
  '📢 이 새 소식 창이 생겼어요']},
 {v:'2.4',d:'10월 29일',t:['👥 뽑은 직원들이 가게 그림에 나와요 (🐻 굽기 · 🐰 계산 · 🦊 홍보 · 🐼 바리스타)','🚶 손님들이 뒤뚱뒤뚱 걸어요']},
 {v:'2.3',d:'10월 29일',t:['☕ 카페가 생겼어요! 💼 경영 → ☕ 카페에서 커피머신을 사면 열려요','🥤 🙋 도와주기 → ☕ 음료 만들기: 컵 고르고 꾹 눌러 점선까지 붓기','🫘 원두 등급 · 음료 6종 · 🐼 바리스타']},
 {v:'2.2',d:'10월 29일',t:['💼 가게가 혼자서도 장사해요! 자리를 비워도 8시간까지','👥 알바 고용 (굽기 · 계산 · 홍보), 📒 장부 (매출 · 월세 · 월급 · 세금)','🏠 가게를 사면 월세 0원','▶ 장사하기 → 🙋 도와주기 (직접 굽기)']},
 {v:'2.1',d:'10월 28일',t:['💌 친구 자랑 링크로 들어오면 도전장이 떠요','👆 처음 온 사람은 직접 따라 하며 배워요','🚫 닉네임 · 가게 이름 욕설 거르기']},
 {v:'2.0',d:'10월 28일',t:['📤 결과 · 내 가게 자랑 카드로 카톡에 공유해요']}];
const latest=L[0].v;
let ov=null;
function open(){close();ov=document.createElement('div');ov.style.cssText='position:absolute;inset:0;background:rgba(40,24,14,.6);z-index:40;display:flex;align-items:center;justify-content:center;padding:14px;box-sizing:border-box';
 const c=document.createElement('div');c.style.cssText='background:#fff;border-radius:26px;width:100%;max-height:96%;box-sizing:border-box;padding:16px;display:flex;flex-direction:column;text-align:left;color:#5a3a22';
 const h=document.createElement('div');h.style.cssText='font-size:26px;text-align:center;margin-bottom:8px';h.textContent='📢 새 소식';
 const b=document.createElement('div');b.style.cssText='overflow-y:auto;touch-action:pan-y;flex:1;min-height:0';
 /* 📲 앱 설치 칸은 웹에서 늘 맨 위에 (앱으로 열면 안 보여요) */
 const I=typeof INSTALL!=='undefined'?INSTALL:null;let ap=null;if(I&&!I.standalone()){ap=document.createElement('button');ap.style.cssText='display:flex;align-items:center;gap:10px;width:100%;box-sizing:border-box;border:0;border-radius:16px;padding:10px 12px;margin-bottom:10px;background:#d6f2e4;box-shadow:0 3px 0 #8fc8a8;font-family:inherit;color:#1f5a4a;text-align:left;cursor:pointer';
  ap.innerHTML='<img src="img/icon-192.png" alt="" style="width:44px;height:44px;border-radius:12px"><span style="flex:1;font-size:15px;line-height:1.35"><b style="font-size:17px;font-weight:400">📲 앱으로 설치하기</b><br>홈 화면에서 바로 열어요 · 기록도 옮길 수 있어요</span><span style="font-size:20px">›</span>';ap.onclick=()=>{close();I.open()}}
 const more=[];
 L.forEach((n,i)=>{const s=document.createElement('div');if(i>=3){s.style.display='none';more.push(s)}s.style.cssText+=';background:'+(i===0?'#fff1b8':'#fff6e6')+';border-radius:16px;padding:10px 12px;margin-bottom:8px;font-size:15px;line-height:1.5';
  const t=document.createElement('b');t.style.cssText='display:block;font-size:17px;margin-bottom:2px';t.textContent=(i===0?'✨ ':'')+'v'+n.v+' · '+n.d;s.appendChild(t);
  n.t.forEach(x=>{const p=document.createElement('div');p.textContent='• '+x;s.appendChild(p)});b.appendChild(s)});
 if(more.length){const mb=document.createElement('button');mb.textContent='🗂️ 지난 소식 더 보기 ('+more.length+'개)';mb.style.cssText='width:100%;height:42px;border:0;border-radius:14px;background:#fff6e6;color:#8a6a4a;font-family:inherit;font-size:15px;margin-bottom:6px';mb.onclick=()=>{more.forEach(m=>m.style.display='');mb.remove()};b.appendChild(mb)}
 const x=document.createElement('button');x.textContent='좋아요!';x.style.cssText='margin-top:10px;height:54px;font-size:21px;border:0;border-radius:18px;background:#ffc94a;box-shadow:0 4px 0 #d9a020;color:#5a3a22;font-family:inherit';x.onclick=close;
 c.append(h,...(ap?[ap]:[]),b,x);ov.appendChild(c);(document.getElementById('box')||document.body).appendChild(ov);seen()}
function close(){if(ov){ov.remove();ov=null}}
function seen(){try{localStorage.setItem(KEY,latest)}catch(e){}}
/* isNew: 처음 온 사람은 띄우지 않고 '본 것'으로 */
function check(isNew){let v=null;try{v=localStorage.getItem(KEY)}catch(e){}if(v===latest)return false;if(isNew){seen();return false}open();return true}
return{L,latest,open,close,check}})();
