/* ===== 📢 새 소식 (패치 노트) — 챌린지·가게 공용 =====
   새 버전으로 처음 들어오면 한 번 떠요. 설정의 '📢 새 소식'에서 다시 볼 수 있어요.
   업데이트할 때 맨 위에 새 항목을 더하고 v를 올려요.
   ✍️ 이용자가 알아야 할 것만 써요(내부 수정·속도 개선 같은 건 빼요). q:1 = 목록에만 두고 창은 안 띄움.
   '🔕 일주일간 안 보기'를 누르면 7일 동안 창이 안 떠요(그 뒤 최신 소식 한 번). */
const NEWS=(()=>{
const KEY='bpNewsSeen',MUTE='bpNewsMute';
const L=[
 {v:'4.1.4',d:'10월 31일',t:['👥 큰 가게일수록 손님이 많이 와요 (10×10은 최대 12명) · 🧾 가게 등급이 오르면 카운터에 메뉴판·조명·줄전구·빵 바구니·네온 붕어가 생겨요 · 🏙️ 하늘 뒤로 먼 동네가 보여요']},
 {v:'4.1.3',d:'10월 31일',t:['🎠 왼쪽·오른쪽 장식이 가게 앞마당 양쪽으로 옮겨졌어요 (바닥에 가려 잘리지 않아요)']},
 {v:'4.1.2',d:'10월 31일',t:['🎨 꾸미기 화면이 처음부터 가게 전체를 보여 줘요 (양옆·앞쪽 소품이 잘리지 않게) · 🪑 손님이 여러 의자·소파에 골고루 앉아요']},
 {v:'4.1',d:'10월 31일',t:[
  '🎵 배경음악이 생겼어요! 가게는 잔잔한 카페 음악, 챌린지는 신나는 음악 (12월엔 🎄 크리스마스 곡도). ⚙️ 설정에서 🎵 음악 · 🔊 효과음을 따로 끄고 켤 수 있어요',
  '🔊 효과음을 새로 만들었어요: 반죽 쭈욱 · 치익 굽는 소리 · 뒤집기 · 완성 띵 · 손님 인사 · 코인 짤랑 (콤보가 이어질수록 소리가 높아져요)',
  '✨ 손맛: PERFECT 반짝 · 🔥 콤보 5·10·20에 화면 테두리가 달아올라요 · 구매·레벨업 꽃가루 · 가구 놓을 때 통통 · 코인 숫자 또르륵 · 버튼 누르는 느낌',
  '🟢 PERFECT 구간이 초록색이 됐어요 (노랑 = GOOD, 빨강 = 탐). 신호등처럼 초록에 누르세요!',
  '🏯 한옥 지붕이 건물 전체를 덮어요 · 🍁 단풍 거리 하늘이 붉게 물들어 맑은 낮과 확실히 달라요 · 🙋 도와주기 창에 ✕ 닫기 버튼',
  '🗓️ 월요일엔 새 주 판 알림이 떠요 · 메뉴가 더 간단해졌어요 · 게임 중 알림이 틀을 가리지 않아요 (손님 말풍선·위쪽) · 테마가 위쪽 정보 바에도 적용돼요',
  '🔥 11월 2일(월) 챌린지 새 판부터: 🃏 5단계마다 카드 고르기 시작! ⚖️ 양날 카드(보너스 크고 손해도 있음) 4장 추가',
  '🧰 10단계부터 보조 칸: 🔮 눈치 반죽(손님이 원하는 맛 자동) 또는 🙋 자동 서빙 중 하나, 5단계마다 바꿀 수 있어요',
  '🍮 손님 주문이 여러 맛으로 고르게 나뉘어요 (강화한 맛은 조금 더) · 51~60단계는 마지막 구간! · 💪 같은 날 3번 떨어지면 응원 보너스 · 👻 지난 기록이 막대에 보여요']},
 {v:'4.0.1',d:'10월 30일',q:1,t:['🚶 줄 서는 손님도 길을 따라 걸어요 (가구를 뚫고 가로질러 가지 않아요) · 9×9·10×10 가게도 구경할 때 제 크기로 보여요']},
 {v:'4.0',d:'10월 30일',t:[
  '✨ 가게 화면이 한눈에 보이게 바뀌었어요! 💼 경영은 카드로 · 막힌 곳은 👆로 · 설명은 ⓘ를 누르면 나와요',
  '📒 장부는 막대 하나로 (순이익·재료·월세·월급·세금), 🙋 도와주기 결과와 📋 오늘 목표는 아이콘 칸으로, 📖 도감·⭐ 별 보상도 카드로 정리했어요']},
 {v:'3.9',d:'10월 30일',t:[
  '💰 가격 정하기: 💼 경영 → 👥 직원에서 붕어빵·음료 값을 싸게 / 보통 / 비싸게 / 아주 비싸게로 골라요. 고르기 전에 시간당 수익을 미리 보여 줘요 (손님이 넘치면 올리고, 모자라면 내려요!)',
  '👥 알바가 12레벨까지 커요 (시간당 손님 한계 24명 → 34명). 막혀 있을 땐 홍보 알바에 안내가 떠요',
  '☕ 카페: 음료마다 재료 업그레이드 3단계(스페셜티 원두 · 목장 우유 · 바닐라 빈 · 벨기에 초콜릿 · 생딸기 청 · 제주 말차)로 값이 최대 +25%, 🎁 붕어빵+음료 세트 메뉴',
  '🎁 도와주기 하루 보너스: 매일 처음 10판은 100%, 그다음 10판은 50%, 그 뒤엔 20%예요. 매일 조금씩 들러 주세요!']},
 {v:'3.8',d:'10월 30일',t:['🎨 테마를 고를 수 있어요: ⚙️ 설정 → 🎨 테마에서 🍞 기본 · 🤍 화이트 · 🖤 블랙 (챌린지·가게 모두 같이 바뀌어요)']},
 {v:'3.7',d:'10월 30일',t:[
  '🏘️ 붕어빵 거리가 붕어빵 동네가 됐어요! 바둑판 길과 블록 4개에 가게 12곳 · 공원 · 횡단보도 · 가로등',
  '🏠 내 가게 근처엔 비슷한 가게, 조금 멀리엔 큰 가게와 상위권 가게가 있어요. 내 가게를 가리는 건물은 살짝 투명해져요',
  '🔄 다른 동네는 이제 마음껏 눌러도 돼요']},
 {v:'3.6',d:'10월 30일',t:[
  '🏙️ 붕어빵 거리가 입체(3D)로 바뀌었어요! 지붕·옆면까지 스킨이 보여요 (한옥 기와, 성의 탑, 과자집 크림 지붕…)',
  '🤏 두 손가락으로 가게를 확대·축소해요 (컴퓨터는 마우스 휠). 끝까지 줄이면 거리로 나가고, 거리에서 끝까지 키우면 내 가게로 들어와요']},
 {v:'3.5',d:'10월 30일',t:[
  '🏙️ 붕어빵 거리가 생겼어요! 다른 사람 가게들 사이에 내 가게가 있어요. 끌어서 둘러보고, 가게를 톡 하면 구경 가요',
  '🏠 외관 스킨: 🎨 꾸미기 → 🏠 외관에서 벽돌집 · 통나무 오두막 · 한옥 · 카페 테라스 · 과자집 · 성으로 가게 겉모습을 바꿔요. 거리에서 모두에게 보여요',
  '📐 가게가 클수록 거리에서도 건물이 커요 (노점은 수레, 7×7부터 2층, 9×9부터 3층)']},
 {v:'3.4.1',d:'10월 30일',q:1,t:['🏆 순위표에서 같은 사람(여러 기기에서 한 기록)은 제일 좋은 기록 하나만 보여요']},
 {v:'3.4',d:'10월 30일',t:[
  '🖐️ 가게 화면을 손가락으로 끌어서 둘러봐요. 가구·캐릭터 크기가 가게가 커져도 그대로예요. 한눈에 보고 싶으면 🔍 전체 보기',
  '📐 가게를 9×9 · 10×10까지 넓힐 수 있어요 (👑 전설의 가게부터). 꾸밀 자리가 훨씬 많아져요',
  '🐟 붕어빵 매대가 유리 진열장으로, ☕ 카페를 열면 커피 매대(에스프레소 머신·컵)로 바뀌었어요']},
 {v:'3.3',d:'10월 30일',t:[
  '🎨 꾸미기가 자유로워졌어요: 흰 길 칸이 없어지고, 손님이 가구를 피해서 걸어요. 🚪 문 앞과 🧾 카운터 앞만 비워 두면 돼요 (길을 막는 자리는 알려 줘요)',
  '⭐ 별 보상을 📖 도감에서 바로 받아요. 받을 게 있으면 도감 버튼에 숫자가 떠요',
  '🦊 홍보 알바가 가게 앞에 서서 옆 장식과 겹치지 않아요',
  '📲 아이폰 설치 안내가 새 iOS(아래 ⋯ 메뉴)에 맞게 바뀌었어요']},
 {v:'3.2',d:'10월 29일',t:['🚚 기록 옮기기가 "이사"로 바뀌었어요: 옮긴 뒤엔 보낸 쪽 기록이 잠기고, 받은 곳에서만 이어져요. 번호는 한 번에 하나만 만들 수 있어요']},
 {v:'3.1',d:'10월 29일',q:1,t:['📲 웹에서는 첫 화면과 가게 화면에 앱 설치 버튼이 늘 보여요']},
 {v:'3.0',d:'10월 29일',t:[
  '🏆 순위표: 30위 밖이어도 맨 아래에 내 순위와 위·아래 3명이 보여요. 단계를 넘길 때 보이는 내 순위도 정확한 숫자로 나와요']},
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
 const c=document.createElement('div');c.className='thc';c.style.cssText='background:#fff;border-radius:26px;width:100%;max-height:96%;box-sizing:border-box;padding:16px;display:flex;flex-direction:column;text-align:left;color:#5a3a22';
 const h=document.createElement('div');h.style.cssText='font-size:26px;text-align:center;margin-bottom:8px';h.textContent='📢 새 소식';
 const b=document.createElement('div');b.style.cssText='overflow-y:auto;touch-action:pan-y;flex:1;min-height:0';
 /* 📲 앱 설치 칸은 웹에서 늘 맨 위에 (앱으로 열면 안 보여요) */
 const I=typeof INSTALL!=='undefined'?INSTALL:null;let ap=null;if(I&&!I.standalone()){ap=document.createElement('button');ap.style.cssText='display:flex;align-items:center;gap:10px;width:100%;box-sizing:border-box;border:0;border-radius:16px;padding:10px 12px;margin-bottom:10px;background:#d6f2e4;box-shadow:0 3px 0 #8fc8a8;font-family:inherit;color:#1f5a4a;text-align:left;cursor:pointer';
  ap.innerHTML='<img src="img/icon-192.png" alt="" style="width:44px;height:44px;border-radius:12px"><span style="flex:1;font-size:15px;line-height:1.35"><b style="font-size:17px;font-weight:400">📲 앱으로 설치하기</b><br>홈 화면에서 바로 열어요 · 기록도 옮길 수 있어요</span><span style="font-size:20px">›</span>';ap.onclick=()=>{close();I.open()}}
 const more=[];
 L.forEach((n,i)=>{const s=document.createElement('div');s.className=i===0?'thh':'ths';if(i>=3){s.style.display='none';more.push(s)}s.style.cssText+=';background:'+(i===0?'#fff1b8':'#fff6e6')+';border-radius:16px;padding:10px 12px;margin-bottom:8px;font-size:15px;line-height:1.5';
  const t=document.createElement('b');t.style.cssText='display:block;font-size:17px;margin-bottom:2px';t.textContent=(i===0?'✨ ':'')+'v'+n.v+' · '+n.d;s.appendChild(t);
  n.t.forEach(x=>{const p=document.createElement('div');p.textContent='• '+x;s.appendChild(p)});b.appendChild(s)});
 if(more.length){const mb=document.createElement('button');mb.className='ths';mb.textContent='🗂️ 지난 소식 더 보기 ('+more.length+'개)';mb.style.cssText='width:100%;height:42px;border:0;border-radius:14px;background:#fff6e6;color:#8a6a4a;font-family:inherit;font-size:15px;margin-bottom:6px';mb.onclick=()=>{more.forEach(m=>m.style.display='');mb.remove()};b.appendChild(mb)}
 const x=document.createElement('button');x.textContent='좋아요!';x.style.cssText='margin-top:10px;height:54px;font-size:21px;border:0;border-radius:18px;background:#ffc94a;box-shadow:0 4px 0 #d9a020;color:#5a3a22;font-family:inherit';x.onclick=close;
 const mu=document.createElement('button');mu.textContent='🔕 일주일간 안 보기';mu.style.cssText='margin-top:6px;height:38px;font-size:15px;border:0;background:none;box-shadow:none;color:#a08060;font-family:inherit;text-decoration:underline';mu.onclick=()=>{try{localStorage.setItem(MUTE,String(Date.now()+7*864e5))}catch(e){}close()};
 c.append(h,...(ap?[ap]:[]),b,x,mu);ov.appendChild(c);(document.getElementById('box')||document.body).appendChild(ov);seen()}
function close(){if(ov){ov.remove();ov=null}}
function seen(){try{localStorage.setItem(KEY,latest)}catch(e){}}
/* isNew: 처음 온 사람은 띄우지 않고 '본 것'으로 */
function check(isNew){let v=null,m=0;try{v=localStorage.getItem(KEY);m=+localStorage.getItem(MUTE)||0}catch(e){}if(v===latest)return false;if(isNew){seen();return false}
 /* 안 본 소식이 모두 조용한 것(q)이면 창 없이 본 걸로 */const i=L.findIndex(n=>n.v===v),un=i<0?L:L.slice(0,i);if(!un.some(n=>!n.q)){seen();return false}
 if(Date.now()<m)return false;open();return true}
return{L,latest,open,close,check}})();
