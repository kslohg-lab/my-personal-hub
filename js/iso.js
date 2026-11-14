/* ===== 비스듬히 내려다보는(아이소메트릭) 가게 그리기 — 가게 홈·꾸미기 화면 공용 =====
   ISO(cx,A) 로 만들고, 매 프레임 draw(t,look,items,opt) 를 불러요.
   look: {n, wall:{c,id}, floor, sky:[위,아래], night, awn, sign, name, top, lit, sL:{e,sz}, sR:{e,sz}, mas:{e}}
   items: [{k,x,y,d}] 바닥에 놓은 가구 */
const ISO=(cx,A)=>{
const {em,tx,rr,m2,lite,dark,animal}=A;const W=450;
/* 가구 목록: p=가격, g=필요한 가게 등급, rot=돌릴 수 있음, seat=손님이 앉음, flat=바닥에 깔림
   c=분류(sit 의자·탁자 / plant 식물 / lit 조명 / deco 장식 / sp 특별), set=테마 세트, as=같은 모양으로 그리기(c1·c2 색) */
const FUR=[
 {k:'chair',n:'의자',e:'🪑',p:600,g:0,rot:1,seat:1,c:'sit'},{k:'table',n:'탁자',e:'🍽️',p:1500,g:0,c:'sit'},{k:'plant',n:'화분',e:'🪴',p:800,g:0,c:'plant'},
 {k:'rug',n:'러그',e:'🟥',p:1200,g:0,flat:1,c:'deco'},{k:'bear',n:'곰 인형',e:'🧸',p:2000,g:0,c:'deco'},{k:'stand',n:'붕어 입간판',e:'🐟',p:2500,g:1,c:'deco'},
 {k:'lamp',n:'등불',e:'🏮',p:3000,g:1,c:'lit'},{k:'sofa',n:'소파',e:'🛋️',p:6000,g:1,rot:1,seat:1,c:'sit'},{k:'shelf',n:'빵 진열대',e:'🥐',p:9000,g:2,rot:1,c:'deco'},
 {k:'tree',n:'나무 화분',e:'🌳',p:12000,g:2,c:'plant'},{k:'tank',n:'어항',e:'🐠',p:25000,g:3,c:'sp'},{k:'piano',n:'피아노',e:'🎹',p:60000,g:4,rot:1,c:'sp'},
 /* 받침 위 장식 (emo: 받침색 b, 크기 z) */
 {k:'cactus',n:'선인장',e:'🌵',p:1000,g:0,emo:1,b:'#c8643a',z:.46,c:'plant'},{k:'basket',n:'빵 바구니',e:'🧺',p:1500,g:0,emo:1,b:'#c89a64',z:.44,c:'deco'},
 {k:'candle',n:'촛대',e:'🕯️',p:1800,g:0,emo:1,b:'#8a6a50',z:.42,glow:1,c:'lit'},{k:'bench',n:'벤치',e:'🪑',p:4000,g:1,rot:1,seat:1,c:'sit'},
 {k:'books',n:'책장',e:'📚',p:4500,g:1,emo:1,b:'#7a5030',z:.5,tall:.42,c:'deco'},{k:'frame',n:'그림 이젤',e:'🖼️',p:5000,g:1,emo:1,b:'#6a4024',z:.52,c:'deco'},
 {k:'koi',n:'잉어 깃발',e:'🎏',p:6500,g:1,emo:1,b:'#5a5048',z:.6,pole:1,c:'deco'},{k:'pinata',n:'피냐타',e:'🪅',p:9000,g:2,emo:1,b:'#e8b04a',z:.52,c:'deco'},
 {k:'cake',n:'디저트 진열장',e:'🍰',p:15000,g:2,emo:1,b:'#f0d8e0',z:.4,tall:.36,glass:1,c:'deco'},{k:'coffee',n:'커피 머신',e:'☕',p:18000,g:2,emo:1,b:'#5a5a62',z:.42,tall:.3,c:'deco'},
 {k:'sakura',n:'벚꽃 나무',e:'🌸',p:22000,g:2,emo:1,b:'#a85a34',z:.9,tree:1,c:'plant'},{k:'vase',n:'도자기',e:'🏺',p:30000,g:3,emo:1,b:'#d8c8a8',z:.55,c:'deco'},
 {k:'slide',n:'미끄럼틀',e:'🛝',p:40000,g:3,emo:1,b:'#7ec8ff',z:.7,c:'sp'},{k:'moai',n:'돌 석상',e:'🗿',p:50000,g:3,emo:1,b:'#8a867c',z:.7,c:'sp'},
 {k:'carousel',n:'미니 회전목마',e:'🎠',p:70000,g:4,emo:1,b:'#ff9ab0',z:.8,c:'sp'},{k:'claw',n:'뽑기 기계',e:'🧸',p:90000,g:4,emo:1,b:'#ff6a8a',z:.4,tall:.6,glass:1,c:'sp'},
 {k:'fountain',n:'분수대',e:'⛲',p:120000,g:4,emo:1,b:'#b8c8d8',z:.85,c:'sp'},{k:'train',n:'기차 모형',e:'🚂',p:150000,g:4,emo:1,b:'#6a8a5a',z:.62,c:'sp'},
 {k:'trophy',n:'황금 트로피',e:'🏆',p:300000,g:5,emo:1,b:'#3a2a3a',z:.62,glow:1,c:'sp'},{k:'wheel',n:'미니 관람차',e:'🎡',p:500000,g:5,emo:1,b:'#7a8aa8',z:1,c:'sp'},
 {k:'dragon',n:'용 조각상',e:'🐉',p:800000,g:5,emo:1,b:'#4a3a30',z:.86,c:'sp'},{k:'throne',n:'왕좌',e:'👑',p:1500000,g:6,rot:1,seat:1,c:'sit'},
 /* ---- 11/8 의자·탁자 더 (다양하게 놓으면 점수·매력 보너스) ---- */
 {k:'stool',n:'둥근 스툴',e:'🪑',p:900,g:0,seat:1,c:'sit'},{k:'wchair',n:'원목 의자',e:'🪑',p:1200,g:0,rot:1,seat:1,c:'sit'},
 {k:'ptable',n:'체크무늬 식탁',e:'🍽️',p:8000,g:2,c:'sit'},{k:'rattan',n:'라탄 의자',e:'🪑',p:9000,g:2,rot:1,seat:1,c:'sit'},
 {k:'barstool',n:'바 의자',e:'🪑',p:12000,g:2,seat:1,c:'sit'},{k:'beanbag',n:'빈백',e:'🛋️',p:15000,g:2,seat:1,c:'sit'},
 {k:'bartable',n:'바 테이블',e:'🍸',p:25000,g:3,c:'sit'},{k:'marble',n:'대리석 원탁',e:'🍽️',p:60000,g:3,c:'sit'},
 {k:'leather',n:'가죽 소파',e:'🛋️',p:120000,g:4,rot:1,seat:1,c:'sit'},{k:'cloud',n:'구름 소파',e:'☁️',p:400000,g:5,rot:1,seat:1,set:'cloud',c:'sit'},
 /* ☁️ 11/13 VOC '구름 의자랑 어울리는 낮은 탁자 · 구름 의자 더' → 구름 세트 */
 {k:'c_white',n:'하얀 구름 의자',e:'☁️',p:450000,g:5,rot:1,seat:1,set:'cloud',c:'sit'},{k:'c_pink',n:'솜사탕 구름 의자',e:'💗',p:550000,g:5,rot:1,seat:1,set:'cloud',c:'sit'},
 {k:'c_sky',n:'별 하늘 구름 의자',e:'⭐',p:550000,g:5,rot:1,seat:1,set:'cloud',c:'sit'},{k:'c_night',n:'밤하늘 구름 의자',e:'🌙',p:800000,g:6,rot:1,seat:1,set:'cloud',c:'sit'},
 {k:'c_pouf',n:'무지개 구름 쿠션',e:'🌈',p:350000,g:5,rot:1,seat:1,set:'cloud',c:'sit'},
 {k:'c_table',n:'구름 낮은 탁자',e:'☁️',p:600000,g:5,set:'cloud',c:'sit'},{k:'c_tea',n:'구름 티테이블',e:'🍵',p:700000,g:5,rot:1,set:'cloud',c:'sit'},
 /* 🍰 11/13 디저트 세트: 아랫단계도 살 수 있게 싼 것부터 비싼 자랑 장식까지 */
 {k:'d_donut',n:'도넛 스툴',e:'🍩',p:3000,g:0,seat:1,set:'dessert',c:'sit'},{k:'d_candy',n:'사탕 화분',e:'🍭',p:4000,g:0,set:'dessert',c:'plant'},{k:'d_cookie',n:'쿠키 탁자',e:'🍪',p:6000,g:1,set:'dessert',c:'sit'},
 {k:'d_mac_p',n:'딸기 의자',e:'🍓',p:8000,g:1,rot:1,seat:1,set:'dessert',c:'sit'},{k:'d_mac_m',n:'민트 마카롱 의자',e:'🟢',p:8000,g:1,rot:1,seat:1,set:'dessert',c:'sit'},{k:'d_lolli',n:'롤리팝 조명',e:'🍭',p:25000,g:2,set:'dessert',c:'lit'},
 {k:'d_sofa',n:'생크림 소파',e:'🍰',p:300000,g:4,rot:1,seat:1,set:'dessert',c:'sit'},{k:'d_cake',n:'딸기 케이크 탁자',e:'🎂',p:1500000,g:5,set:'dessert',c:'sit'},{k:'d_choco',n:'초콜릿 분수',e:'🍫',p:6000000,g:6,set:'dessert',c:'deco'},
 /* 🏖️ 11/14 바다 세트 */
 {k:'s_ring',n:'튜브 스툴',e:'🛟',p:3500,g:0,seat:1,set:'sea',c:'sit'},{k:'s_coral',n:'산호 화분',e:'🪸',p:5000,g:0,set:'sea',c:'plant'},{k:'s_drift',n:'유목 탁자',e:'🪵',p:7000,g:1,set:'sea',c:'sit'},
 {k:'s_shell',n:'조개 의자',e:'🐚',p:9000,g:1,rot:1,seat:1,set:'sea',c:'sit'},{k:'s_light',n:'등대 조명',e:'🗼',p:30000,g:2,glow:1,set:'sea',c:'lit'},{k:'s_lounge',n:'선베드',e:'🏖️',p:80000,g:3,seat:1,set:'sea',c:'sit'},
 {k:'s_umb',n:'파라솔 테이블',e:'⛱️',p:250000,g:4,set:'sea',c:'sit'},{k:'s_boat',n:'보트 소파',e:'🚣',p:1200000,g:5,seat:1,set:'sea',c:'sit'},{k:'s_whale',n:'고래 분수',e:'🐳',p:8000000,g:6,set:'sea',c:'deco'},
 /* 🧣 11/14 따뜻한 겨울 세트 (12월에만 살 수 있어요) */
 {k:'v_log',n:'눈 그루터기 스툴',e:'🪵',p:3000,g:0,seat:1,set:'xmas2',xm:1,c:'sit'},{k:'v_pine',n:'눈 소나무 화분',e:'🌲',p:5000,g:0,set:'xmas2',xm:1,c:'plant'},{k:'v_knit',n:'니트 의자',e:'🧶',p:10000,g:1,rot:1,seat:1,set:'xmas2',xm:1,c:'sit'},
 {k:'v_cane',n:'캔디케인 조명',e:'🍬',p:35000,g:2,glow:1,set:'xmas2',xm:1,c:'lit'},{k:'v_cocoa',n:'핫초코 탁자',e:'☕',p:120000,g:3,set:'xmas2',xm:1,c:'sit'},{k:'v_snowsofa',n:'눈사람 소파',e:'⛄',p:900000,g:5,rot:1,seat:1,set:'xmas2',xm:1,c:'sit'},
 {k:'v_globe',n:'대형 스노우볼',e:'🔮',p:7000000,g:6,set:'xmas2',xm:1,c:'deco'},
 /* 🎨 11/14 인기 가구 색깔 버전 */
 {k:'bean_p',n:'딸기 빈백',e:'🛋️',p:18000,g:2,seat:1,c:'sit'},{k:'bean_m',n:'민트 빈백',e:'🛋️',p:18000,g:2,seat:1,c:'sit'},{k:'bean_l',n:'라벤더 빈백',e:'🛋️',p:18000,g:2,seat:1,c:'sit'},
 {k:'mar_p',n:'로즈 대리석 원탁',e:'🍽️',p:70000,g:3,c:'sit'},{k:'mar_k',n:'블랙 대리석 원탁',e:'🍽️',p:70000,g:3,c:'sit'},
 {k:'lea_p',n:'로즈 가죽 소파',e:'🛋️',p:150000,g:4,rot:1,seat:1,c:'sit'},{k:'lea_n',n:'네이비 가죽 소파',e:'🛋️',p:150000,g:4,rot:1,seat:1,c:'sit'},
 {k:'cld_p',n:'딸기 구름 소파',e:'☁️',p:450000,g:5,rot:1,seat:1,c:'sit'},{k:'cld_s',n:'하늘 구름 소파',e:'☁️',p:450000,g:5,rot:1,seat:1,c:'sit'},
 {k:'gtable',n:'황금 원탁',e:'👑',p:800000,g:6,rot:1,c:'sit'},
 {k:'galaxy',n:'은하 수족관',e:'🌌',p:2500000,g:6,emo:1,b:'#1a1a3a',z:.5,tall:.5,glass:1,glow:1,c:'sp'},
 /* 🎄 크리스마스 세트 (12월 한정 판매 xm:1 · 산 건 계속 써요) — 그림 오기 전엔 이모지 스티커 */
 /* 💎 11/11 프리미엄 가구 (2층을 올린 가게만 사기, f2:1) */
 {k:'p_chand',n:'크리스탈 샹들리에',e:'💎',p:12000000,g:6,emo:1,b:'#d4a020',z:.7,tall:.5,glow:1,f2:1,c:'prem'},{k:'p_swan',n:'백조 벨벳 의자',e:'🦢',p:18000000,g:6,rot:1,seat:1,f2:1,c:'prem'},
 {k:'p_fount',n:'황금 붕어 분수',e:'⛲',p:30000000,g:6,emo:1,b:'#d8e0e8',z:.85,f2:1,c:'prem'},{k:'p_aqua',n:'산호초 수족관',e:'🐠',p:45000000,g:6,emo:1,b:'#3a6a9a',z:.6,tall:.4,glass:1,f2:1,c:'prem'},
 {k:'p_scope',n:'천체 망원경',e:'🔭',p:60000000,g:6,emo:1,b:'#6a4a2a',z:.8,f2:1,c:'prem'},{k:'p_diamond',n:'다이아 붕어 조각',e:'💎',p:100000000,g:6,emo:1,b:'#c8283c',z:.72,glow:1,f2:1,c:'prem'},
 {k:'x_candle',n:'촛대 원탁',e:'🕯️',p:120000,g:2,emo:1,b:'#8a2a2a',z:.68,glow:1,set:'xmas',xm:1,c:'sit'},
 {k:'x_giftmt',n:'선물 산',e:'🎁',p:400000,g:3,emo:1,b:'#c8283c',z:.75,set:'xmas',xm:1,c:'deco'},
 {k:'x_rudolph',n:'루돌프 장식',e:'🦌',p:1500000,g:4,emo:1,b:'#a85a34',z:.78,set:'xmas',xm:1,c:'deco'},
 {k:'x_cookie',n:'쿠키 하우스 테이블',e:'🍪',p:3000000,g:4,emo:1,b:'#c88a50',z:.6,set:'xmas',xm:1,c:'sit'},
 {k:'x_snowlit',n:'눈꽃 조명',e:'❄️',p:6000000,g:5,emo:1,b:'#6a9ccc',z:.85,glow:1,set:'xmas',xm:1,c:'lit'},
 {k:'x_sleigh',n:'산타 썰매',e:'🛷',p:10000000,g:5,emo:1,b:'#c8283c',z:.8,set:'xmas',xm:1,c:'sp'},
 {k:'x_tree',n:'황금 대형 트리',e:'🎄',p:20000000,g:6,emo:1,b:'#d4a020',z:1.15,tree:1,glow:1,set:'xmas',xm:1,c:'plant'},
 /* ---- 테마 세트 (다 놓으면 꾸미기 점수 보너스) ---- */
 {k:'ctable',n:'카페 원탁',e:'☕',p:3500,g:1,as:'table',c1:'#f4efe6',c2:'#5a4a40',cup:1,set:'cafe',c:'sit'},
 {k:'cchair',n:'카페 의자',e:'🪑',p:1800,g:1,rot:1,seat:1,as:'chair',c1:'#7fae6a',c2:'#5a8a4a',set:'cafe',c:'sit'},
 {k:'cboard',n:'메뉴 칠판',e:'📋',p:4000,g:1,rot:1,as:'board',set:'cafe',c:'deco'},
 {k:'csack',n:'원두 자루',e:'🫘',p:2500,g:1,emo:1,b:'#b8925a',z:.42,set:'cafe',c:'deco'},
 {k:'ccup',n:'대형 커피잔',e:'☕',p:8000,g:2,emo:1,b:'#e8d8c8',z:.62,set:'cafe',c:'deco'},
 {k:'skbench',n:'벚꽃 벤치',e:'🌸',p:5000,g:1,rot:1,seat:1,as:'bench',c1:'#ffb8cc',c2:'#e88aa8',set:'spring',c:'sit'},
 {k:'tulip',n:'튤립 화단',e:'🌷',p:2500,g:0,emo:1,b:'#8a5a3a',z:.5,set:'spring',c:'plant'},
 {k:'picnic',n:'피크닉 매트',e:'🧺',p:2000,g:0,flat:1,as:'rug',c1:'#ff9ab0',c2:'#fff4f8',chk:1,set:'spring',c:'deco'},
 {k:'dango',n:'꽃경단 상',e:'🍡',p:3000,g:1,emo:1,b:'#f0d0dc',z:.44,set:'spring',c:'deco'},
 {k:'pond',n:'연꽃 연못',e:'🪷',p:9000,g:2,flat:1,as:'pond',set:'spring',c:'plant'},
 {k:'xtree',n:'크리스마스 트리',e:'🎄',p:12000,g:1,emo:1,b:'#a85a34',z:.9,tree:1,glow:1,set:'winter',c:'plant'},
 {k:'snowman',n:'눈사람',e:'⛄',p:6000,g:1,emo:1,b:'#e8f0f8',z:.72,set:'winter',c:'deco'},
 {k:'gifts',n:'선물 더미',e:'🎁',p:3000,g:0,emo:1,b:'#c8283c',z:.5,set:'winter',c:'deco'},
 {k:'fire',n:'벽난로',e:'🔥',p:15000,g:2,as:'fire',set:'winter',c:'lit'},
 {k:'knit',n:'니트 소파',e:'🛋️',p:7000,g:1,rot:1,seat:1,as:'sofa',c1:'#8cbce8',c2:'#6a9ccc',set:'winter',c:'sit'},
 {k:'bcushion',n:'붕어빵 쿠션',e:'🐟',p:2500,g:0,seat:1,as:'cushion',set:'bungeo',c:'sit'},
 {k:'bcart',n:'붕어빵 수레',e:'🛒',p:8000,g:1,as:'cart',set:'bungeo',c:'deco'},
 {k:'bbag',n:'봉투 진열대',e:'🛍️',p:3500,g:1,emo:1,b:'#d8b890',z:.46,set:'bungeo',c:'deco'},
 {k:'bflag',n:'붕어 깃발',e:'🎏',p:4500,g:1,as:'fflag',set:'bungeo',c:'deco'},
 {k:'bstatue',n:'황금 붕어 동상',e:'🏅',p:40000,g:3,as:'statue',set:'bungeo',c:'sp'}];
const SETS=[{k:'cafe',n:'☕ 카페 세트'},{k:'spring',n:'🌸 봄 소풍 세트'},{k:'winter',n:'❄️ 겨울 세트'},{k:'bungeo',n:'🐟 붕어빵 세트'},{k:'xmas',n:'🎄 크리스마스 세트 (12월 한정)'},{k:'cloud',n:'☁️ 구름 세트',b:3000},{k:'dessert',n:'🍰 디저트 세트',b:2000},{k:'sea',n:'🏖️ 바다 세트',b:2000},{k:'xmas2',n:'🧣 따뜻한 겨울 세트 (12월 한정)',b:2000}]; /* b = 세트 보너스(없으면 SET_BONUS 400) — 비싼 구름 세트는 3,000 */
const SET_BONUS=400;
const FK={};FUR.forEach(f=>FK[f.k]=f);
/* 🖼️ 벽 장식: 뒤쪽 두 벽에 거는 물건. 바닥 가구와 같은 save.fur에 담고 자리만 벽(왼쪽 벽 {x:-1,y:칸} · 오른쪽 벽 {x:칸,y:-1}).
   h=걸리는 높이(벽 높이 비율), s=크기, glow=빛. 그림 img/fu/{키}.webp 가 있으면 그림, 없으면 이모지 */
const WFUR=[
 {k:'w_frame',n:'붕어 액자',e:'🖼️',p:1500,g:0,c:'wall'},{k:'w_clock',n:'벽시계',e:'🕰️',p:2500,g:0,c:'wall'},{k:'w_hplant',n:'걸이 화분',e:'🪴',p:3000,g:0,h:.62,c:'wall'},
 {k:'w_scroll',n:'붕어빵 족자',e:'📜',p:4000,g:1,s:1.05,c:'wall'},{k:'w_mirror',n:'둥근 거울',e:'🪞',p:6000,g:1,c:'wall'},{k:'w_shelf',n:'벽 선반',e:'🫙',p:9000,g:2,h:.5,s:1.08,c:'wall'},
 {k:'w_cert',n:'장인 상장',e:'🎖️',p:12000,g:2,c:'wall'},{k:'w_neon',n:'붕어 네온사인',e:'🐟',p:20000,g:3,glow:1,s:1.05,c:'wall'},{k:'w_plaque',n:'황금 붕어 방패',e:'🛡️',p:45000,g:3,c:'wall'},
 {k:'w_art',n:'명화 액자',e:'🎨',p:80000,g:4,s:1.08,c:'wall'},{k:'w_glass',n:'스테인드글라스',e:'🪟',p:150000,g:5,s:1.08,c:'wall'},{k:'w_relief',n:'황금 붕어 부조',e:'👑',p:400000,g:6,glow:1,s:1.08,c:'wall'},
 {k:'w_wreath',n:'크리스마스 리스',e:'🎄',p:30000,g:0,glow:1,xm:1,c:'wall'},{k:'w_mac',n:'마카롱 벽 선반',e:'🧁',p:40000,g:2,h:.5,s:1.08,c:'wall'},{k:'w_wheel',n:'배 키 장식',e:'⚓',p:20000,g:1,h:.5,s:1,c:'wall'},{k:'w_stock',n:'양말 선반',e:'🧦',p:30000,g:1,h:.5,s:1.08,xm:1,c:'wall'}];
/* 그림이 준비된 벽 장식만 여기에 (없는 파일을 매번 찾지 않게) */
const WIMG=new Set(['w_frame','w_clock','w_hplant','w_scroll','w_mirror','w_shelf','w_cert','w_neon','w_plaque','w_art','w_glass','w_relief','w_wreath','w_mac','w_wheel','w_stock']);const wImg=k=>WIMG.has(k)?ld('img/fu/'+k+'.webp'):null;
const WK={};WFUR.forEach(f=>WK[f.k]=f);const CK=k=>FK[k]||WK[k];
/* 벽 칸: 왼쪽 벽은 간판(0~2칸) 다음부터, 오른쪽 벽은 차양·메뉴판(1~3칸) 다음부터 끝까지. 창문 칸에 걸면 창문은 안 그려요 */
const wallSlots=(n=N)=>{const L=[];for(let i=3;i<n;i++){L.push({x:-1,y:i});L.push({x:i,y:-1})}return L};
const isWallAt=(it,n=N)=>!!WK[it.k]&&((it.x===-1&&it.y>=3&&it.y<n)||(it.y===-1&&it.x>=3&&it.x<n));
const wallItemAt=(items,s)=>(items||[]).find(it=>WK[it.k]&&it.x===s.x&&it.y===s.y)||null;
/* 넓히기: n칸, g=필요 등급, p=가격 */
/* 11/8: 기본 5×5 (모든 가게 +1, 가격표도 한 칸씩 밀림) */
const ROOM=[{n:5,g:0,p:0},{n:6,g:1,p:8000},{n:7,g:2,p:30000},{n:8,g:4,p:120000},{n:9,g:5,p:400000},{n:10,g:6,p:1200000},{n:11,g:6,p:3000000}];
let N=4,TW=96,TH=48,WH=120,OX=225,OY=320;
/* 🏢 2층 (11/10): FL=1 이면 2층을 그리는 중(카운터·문 없음, 계단 = 입구 옆 (N-2,0) · 11/11부터), ST=1 이면 1층 그 칸에 올라가는 계단 */
let FL=0,ST=0;
/* 칸 크기 고정(5×5 기준 84) + 끌어서 둘러보기. 화면에 다 들어가면(작은 가게) 예전처럼 한눈에.
   FIT=true(🔍 전체 보기)면 작게 줄여서 한눈에. PAN = 끈 만큼 옮긴 거리(화면 밖으로 너무 못 가게 막음) */
const FIX=84,ZMAX=140;let PAN={x:0,y:0},FIT=false,CAN=false,ZM=FIX,LFT=84;
function layout(n,top,bottom,fit){N=n;const ft=Math.min(96,420/N,(bottom-top-40)/(N*.5+1.3));LFT=ft;
 const tw=FIT?ft:Math.max(ft,Math.min(ZMAX,ZM));
 if(fit||tw<=ft+.5){TW=ft;TH=TW/2;WH=Math.round(TW*1.25);OX=225;OY=Math.round(bottom-N*TH-8);if(OY-WH<top+30)OY=top+30+WH;CAN=false;return}
 TW=tw;TH=TW/2;WH=Math.round(TW*1.25);CAN=true;
 /* 처음엔 카운터가 가운데 */
 const cy=(top+bottom)/2+TW*.3;OX=225-TW*.5;OY=Math.round(cy-TH*1.1);
 /* 가게(+양옆 장식·지붕 장식)가 차지하는 칸 → 화면 밖으로 못 나가게 */
 const xL=OX-(N+.6)*TW/2,xR=OX+(N+.4)*TW/2,yT=OY-WH-60,yB=OY+N*TH+TW*.5;
 const cl=(v,a,b)=>a>b?(a+b)/2:Math.max(a,Math.min(b,v));
 PAN.x=cl(PAN.x,450-xR,-xL);PAN.y=cl(PAN.y,bottom-yB,top-yT);OX+=PAN.x;OY+=PAN.y}
const iso=(gx,gy)=>({x:OX+(gx-gy)*TW/2,y:OY+(gx+gy)*TH/2});
const toTile=(x,y)=>{const a=(x-OX)/(TW/2),b=(y-OY)/(TH/2);return{gx:Math.floor((a+b)/2),gy:Math.floor((b-a)/2)}};
const inRoom=(gx,gy,n=N)=>gx>=0&&gy>=0&&gx<n&&gy<n;
const isCounter=(gx,gy)=>!FL&&gy===0&&(gx===1||gx===2);
/* 꼭 비워 둘 칸: 카운터 앞(계산하는 자리) + 문(오른쪽 구석 = 3시, 11/10에 6시 → 3시로 옮김). 나머지는 손님이 가구를 피해 알아서 걸어요 */
/* 🪜 11/11 계단 = 입구(3시) 바로 옆 칸 (n-2,0), 오른쪽 벽에 붙음 → 문까지 길이 있으면 계단도 늘 갈 수 있어요. 2층 구멍도 같은 칸 */
const STT=n=>({gx:n-2,gy:0}),isSt=(gx,gy,n=N)=>(FL||!!ST)&&gx===n-2&&gy===0;
const isPath=(gx,gy,n=N)=>FL?isSt(gx,gy,n):((gy===1&&(gx===1||gx===2))||(gx===n-1&&gy===0)||isSt(gx,gy,n));
const canPlace=(gx,gy,n=N)=>inRoom(gx,gy,n)&&!isCounter(gx,gy)&&!isPath(gx,gy,n);
/* 🛋️ 2칸 가구 (11/2): 소파·니트 소파·벤치·벚꽃 벤치·빵 진열대·피아노. 방향 0·3은 오른쪽 아래 칸(x+1), 1·2는 왼쪽 아래 칸(y+1)까지 */
/* 11/2: 2칸 가구는 사람 눈에 어색해서 되돌림 (기능은 남겨 두고 목록만 비움) */
const WIDE=new Set([]);
const isWide=k=>WIDE.has(k);
/* 칸 방향은 그림과 똑같이: 그림을 안 뒤집으면 길이가 x(오른쪽 아래), 뒤집으면 y(왼쪽 아래) */
/* 방향 d: 0 앞·왼쪽 아래 보기 · 1 앞·오른쪽 아래 · 2 뒤·왼쪽 위 · 3 뒤·오른쪽 위.
   긴 쪽은 방향으로 정해져요: 0·3 = x(오른쪽 아래로 2칸), 1·2 = y(왼쪽 아래로 2칸).
   그림마다 원래 긴 쪽이 달라서(fy = 앞 그림이 y, by = 뒷모습이 y) 맞도록 뒤집어요 */
const needY=d=>(d|0)===1||(d|0)===2;
function flipOf(k,d){d=d|0;const fi=FIMG[k]||{},back=d>=2&&!!fi.b,nat=back?!!fi.by:!!(fi.fy||fi.fr);return nat!==needY(d)}
function cellsOf(k,x,y,d){if(!isWide(k))return[{x,y}];return needY(d)?[{x,y},{x,y:y+1}]:[{x,y},{x:x+1,y}]}
const cells=it=>cellsOf(it.k,it.x,it.y,it.d);
function occAt(items,gx,gy){for(const it of items||[])if(FK[it.k]&&cells(it).some(c=>c.x===gx&&c.y===gy))return it;return null}
/* 놓을 수 있는지(칸만): 모든 칸이 방 안·카운터/길 아님·다른 가구 없음 */
function fitAt(items,k,x,y,d,mv,n=N){return cellsOf(k,x,y,d).every(c=>canPlace(c.x,c.y,n)&&!(items||[]).some(it=>it!==mv&&FK[it.k]&&cells(it).some(q=>q.x===c.x&&q.y===c.y)))}
/* ---------- 손님 길 찾기 (칸 단위, 상하좌우) ---------- */
const walkF=f=>!!(f&&f.flat&&f.k!=='pond'&&f.as!=='pond'); /* 러그·매트는 밟고 지나가요 */
function blockSet(items,n){const s=new Set();if(FL||ST){const q=STT(n);s.add(q.gx+','+q.gy)}for(const it of items||[]){if(!FK[it.k]||walkF(FK[it.k]))continue;for(const c of cells(it))if(inRoom(c.x,c.y,n))s.add(c.x+','+c.y)}return s}
function bfs(sx,sy,n,blk,goal){const k=(x,y)=>x+','+y,prev=new Map([[k(sx,sy),null]]),q=[[sx,sy]];
 while(q.length){const [x,y]=q.shift();if(goal(x,y)){const out=[];let c=k(x,y);while(c){const [a,b]=c.split(',').map(Number);out.unshift({gx:a,gy:b});c=prev.get(c)}return out}
  for(const [dx,dy] of [[1,0],[-1,0],[0,1],[0,-1]]){const nx=x+dx,ny=y+dy,nk=k(nx,ny);if(!inRoom(nx,ny,n)||isCounter(nx,ny)||prev.has(nk))continue;
   if(blk.has(nk)&&!goal(nx,ny))continue;prev.set(nk,k(x,y));q.push([nx,ny])}}return null}
const DOOR=n=>FL?STT(n):{gx:n-1,gy:0};
/* 문 → 카운터 앞 길 (칸 목록). 막혔으면 null */
function mainRoute(items,n=N){if(FL)return[STT(n)];const d=DOOR(n),b=blockSet(items,n);b.delete(d.gx+','+d.gy);return bfs(d.gx,d.gy,n,b,(x,y)=>x===2&&y===1)}
/* 문에서 갈 수 있는 의자인지 */
function seatOk(items,seat,n=N){const d=DOOR(n),b=blockSet(items,n);return!!bfs(d.gx,d.gy,n,b,(x,y)=>x===seat.x&&y===seat.y)}
/* 가구를 (gx,gy)에 놓아도 되는지: 문↔카운터 길이 안 막히면 OK. 움직이는 가구(mv)는 빼고 계산 */
/* 2층: 계단 구멍에서 못 가는 자리 수 (자리 칸 자체나 바로 옆 칸까지 가면 OK) */
function deadSeats(items,n=N){const blk=blockSet(items,n),s=STT(n),seen=new Set([s.gx+','+s.gy]),q=[[s.gx,s.gy]];
 while(q.length){const [x,y]=q.shift();for(const [dx,dy] of [[1,0],[-1,0],[0,1],[0,-1]]){const nx=x+dx,ny=y+dy,kk=nx+','+ny;if(!inRoom(nx,ny,n)||isCounter(nx,ny)||seen.has(kk)||blk.has(kk))continue;seen.add(kk);q.push([nx,ny])}}
 let c=0;for(const it of items||[])if(FK[it.k]&&FK[it.k].seat)for(const sl of slotsOf(it))if(![[0,0],[1,0],[-1,0],[0,1],[0,-1]].some(([dx,dy])=>seen.has((sl.x+dx)+','+(sl.y+dy))))c++;return c}
function okPlace(items,gx,gy,k,mv,n=N,d){d=d==null?(mv?mv.d|0:0):d;if(!fitAt(items,k,gx,gy,d,mv,n))return false;if(walkF(FK[k]))return true;const its=items.filter(it=>it!==mv).concat([{k,x:gx,y:gy,d}]);/* 11/14 VOC: 2층도 1층처럼 — 놓는 건 막지 않고, 손님이 못 가는 의자가 생기면 ⚠️ 알림만 (계단 칸은 fitAt이 막아요) */if(FL)return true;return!!mainRoute(its,n)}
/* 돌리기: 다음 방향 중 놓을 수 있는 방향 (없으면 null) */
/* 돌리기 순서는 시계 방향: 0 왼쪽 아래 → 1 오른쪽 아래 → 3 오른쪽 위 → 2 왼쪽 위 (두 번 돌리면 정확히 반대 = 180°) */
const RING=[0,1,3,2];
/* 뒷모습 그림이 없는 그림 가구는 앞모습 두 방향(왼쪽 아래 ↔ 오른쪽 아래)만 → 누를 때마다 확실히 바뀌어요 */
function nextRot(items,it,n=N){const fi=FIMG[it.k],Rg=fi&&!fi.b?[0,1]:RING,cur=it.d|0;let p=Rg.indexOf(cur);if(p<0)p=cur===2?1:0;
 for(let i=1;i<=Rg.length;i++){const d=Rg[(p+i)%Rg.length];if(d!==cur&&okPlace(items,it.x,it.y,it.k,it,n,d))return d}return Rg.includes(cur)?null:Rg[(p+1)%Rg.length]}
/* 불러올 때 정리: 2칸 가구가 겹치거나 방 밖이면 돌려 보고, 안 되면 빼요 → 뺀 목록 */
function fixWide(items,n=N){const out=[];for(const it of items.slice()){if(!isWide(it.k)||!FK[it.k])continue;if(fitAt(items,it.k,it.x,it.y,it.d,it,n))continue;let ok=false;for(let d=0;d<4;d++)if(fitAt(items,it.k,it.x,it.y,d,it,n)){it.d=d;ok=true;break}if(!ok){items.splice(items.indexOf(it),1);out.push(it)}}return out}
/* 11/10 문을 3시로 옮긴 뒤 정리: 문·카운터 앞 칸에 있던 가구 + (그래도 길이 막히면) 가장 적게 치우는 길 위의 가구를 빼요 → 뺀 목록 */
function fixDoor(items,n=N){const out=[],rm=it=>{const i=items.indexOf(it);if(i>=0){items.splice(i,1);out.push(it)}};
 for(const it of items.slice())if(FK[it.k]&&cells(it).some(c=>isPath(c.x,c.y,n)))rm(it);
 if(!mainRoute(items,n)){const b=blockSet(items,n),d=DOOR(n),k=(x,y)=>x+','+y,dist=new Map([[k(d.gx,d.gy),0]]),prev=new Map(),done=new Set();
  /* 가구 칸은 100, 빈 칸은 1 → 가장 적게 치우고, 그중 가장 짧은 길 */
  for(;;){let bk=null,bv=1/0;for(const [kk,v] of dist)if(!done.has(kk)&&v<bv){bv=v;bk=kk}if(bk==null)break;done.add(bk);const [x,y]=bk.split(',').map(Number);if(x===2&&y===1)break;
   for(const [dx,dy] of [[1,0],[-1,0],[0,1],[0,-1]]){const nx=x+dx,ny=y+dy,nk=k(nx,ny);if(!inRoom(nx,ny,n)||isCounter(nx,ny)||isSt(nx,ny,n)||done.has(nk))continue;const nc=bv+(b.has(nk)?100:1);if(dist.has(nk)&&dist.get(nk)<=nc)continue;dist.set(nk,nc);prev.set(nk,bk)}}
  let c=k(2,1);const onP=new Set();while(c){onP.add(c);c=prev.get(c)}
  for(const it of items.slice())if(FK[it.k]&&!walkF(FK[it.k])&&cells(it).some(q=>onP.has(k(q.x,q.y))))rm(it)}
 return out}
function blockedSeats(items,n=N){return items.filter(it=>FK[it.k]&&FK[it.k].seat&&inRoom(it.x,it.y,n)&&!cells(it).some(c=>seatOk(items,c,n))).length}
/* 앉는 자리: 2칸 가구는 두 자리 (자리 객체는 가구마다 고정) */
const SLOTM=new WeakMap();function slotsOf(it){let L=SLOTM.get(it);const C=cells(it);if(!L||L.length!==C.length){L=C.map((c,i)=>({it,i}));SLOTM.set(it,L)}L.forEach((s,i)=>{s.x=C[i].x;s.y=C[i].y});return L}
const seatCount=items=>items.reduce((a,it)=>a+(FK[it.k]&&FK[it.k].seat?cells(it).length:0),0);
const ctr=p=>({x:p.gx+.5,y:p.gy+.5});
/* ---------- 기본 도형 ---------- */
function poly(pts,fill,stroke,lw=1.5){cx.beginPath();pts.forEach((p,i)=>i?cx.lineTo(p.x,p.y):cx.moveTo(p.x,p.y));cx.closePath();if(fill){cx.fillStyle=fill;cx.fill()}if(stroke){cx.strokeStyle=stroke;cx.lineWidth=lw;cx.stroke()}}
const up=(p,h)=>({x:p.x,y:p.y-h});
function box(gx,gy,m,h,col,o={}){const T=iso(gx+m,gy+m),Rr=iso(gx+1-m,gy+m),B=iso(gx+1-m,gy+1-m),L=iso(gx+m,gy+1-m);const z=o.z||0;
 const T0=up(T,z),R0=up(Rr,z),B0=up(B,z),L0=up(L,z),T1=up(T,z+h),R1=up(Rr,z+h),B1=up(B,z+h),L1=up(L,z+h);const ln=o.line||dark(col,.55),lw=Math.max(1.6,TW*.026);
 const gv=(a,b,c0,c1)=>{const g=cx.createLinearGradient(a.x,a.y,b.x,b.y);g.addColorStop(0,c0);g.addColorStop(1,c1);return g};
 poly([L0,B0,B1,L1],h>TW*.06?gv(B1,B0,dark(col,.06),dark(col,.26)):dark(col,.12),ln,lw);poly([B0,R0,R1,B1],h>TW*.06?gv(B1,B0,dark(col,.18),dark(col,.38)):dark(col,.24),ln,lw);poly([T1,R1,B1,L1],o.top||gv(T1,B1,lite(col,.16),lite(col,.02)),ln,lw);
 /* 윗면 앞 모서리 하이라이트 */cx.strokeStyle='rgba(255,255,255,.35)';cx.lineWidth=Math.max(1,lw*.6);cx.beginPath();cx.moveTo(L1.x+(B1.x-L1.x)*.08,L1.y+(B1.y-L1.y)*.08-1);cx.lineTo(B1.x,B1.y-1.2);cx.lineTo(R1.x+(B1.x-R1.x)*.08,R1.y+(B1.y-R1.y)*.08-1);cx.stroke();return{T:T1,R:R1,B:B1,L:L1,c:{x:(T1.x+B1.x)/2,y:(T1.y+B1.y)/2}}}
function panel(gx,gy,d,m,z,h,col){const T=iso(gx+m,gy+m),Rr=iso(gx+1-m,gy+m),B=iso(gx+1-m,gy+1-m),L=iso(gx+m,gy+1-m);const E=[[T,Rr],[L,T],[Rr,B],[B,L]][d];
 const g=cx.createLinearGradient(0,up(E[0],z+h).y,0,up(E[0],z).y);g.addColorStop(0,lite(d>=2?dark(col,.08):col,.06));g.addColorStop(1,dark(col,d>=2?.24:.14));poly([up(E[0],z),up(E[1],z),up(E[1],z+h),up(E[0],z+h)],g,dark(col,.55),Math.max(1.6,TW*.026))}
/* ⚡ 11/12 그림자·★ 바닥 빛은 매번 그라데이션을 만들지 않고 미리 만든 그림을 늘려 붙임 (모양 같음) */
const SPR=(f)=>{try{const c=document.createElement('canvas');c.width=c.height=128;f(c.getContext('2d'));return c}catch(e){return null}};
const SHD=SPR(g=>{const r=g.createRadialGradient(64,64,64*.2/1.15,64,64,64);r.addColorStop(0,'rgba(40,24,14,.28)');r.addColorStop(1,'rgba(40,24,14,0)');g.fillStyle=r;g.fillRect(0,0,128,128)});
const GLW=SPR(g=>{const r=g.createRadialGradient(64,64,0,64,64,64);r.addColorStop(0,'rgba(255,220,100,1)');r.addColorStop(.7,'rgba(255,200,60,.35)');r.addColorStop(1,'rgba(255,200,60,0)');g.fillStyle=r;g.fillRect(0,0,128,128)});
function shadow(x,y,w){const r=w*1.15;if(SHD&&r>0){cx.drawImage(SHD,x-r,y-r*.45,r*2,r*.9);return}cx.save();cx.translate(x,y);cx.scale(1,.45);const g=cx.createRadialGradient(0,0,w*.2,0,0,w*1.15);g.addColorStop(0,'rgba(40,24,14,.28)');g.addColorStop(1,'rgba(40,24,14,0)');cx.fillStyle=g;cx.beginPath();cx.arc(0,0,w*1.15,0,7);cx.fill();cx.restore()}
/* ---------- 가구 ---------- */
/* 스티커 이모지: 캐릭터 그림처럼 흰 테두리 + 그림자 (크기별로 한 번만 만들어 둬요) */
const STK={};
/* AI 그림 가구 (img/fu): 소품(emo) + 아래 목록. w = 칸 너비 대비 그림 너비, fr = 그림이 오른쪽 아래를 봄, b = 뒷모습 그림(_b) 있음.
   방향 d: 0 왼쪽 아래 보기(앞) · 1 오른쪽 아래(앞 뒤집기) · 2 왼쪽 위(뒤 뒤집기) · 3 오른쪽 위(뒤) — 뒷모습이 없으면 앞 그림을 써요. 러그·피크닉 매트는 바닥이라 코드 그림 */
/* by = 뒷모습 그림이 (안 뒤집었을 때) 왼쪽 위를 보고 길이가 y 방향 (그림마다 달라서 눈으로 확인해 적었어요) */
const FIMG={s_ring:{w:.62},s_coral:{w:.55},s_drift:{w:.72},s_shell:{w:.66,b:1},s_light:{w:.42},s_lounge:{w:.8},s_umb:{w:.8},s_boat:{w:.9},s_whale:{w:.9},v_log:{w:.6},v_pine:{w:.5},v_knit:{w:.68,b:1},v_cane:{w:.42},v_cocoa:{w:.75},v_snowsofa:{w:.82,b:1},v_globe:{w:.75},bean_p:{w:.74},bean_m:{w:.74},bean_l:{w:.74},mar_p:{w:.86},mar_k:{w:.86},lea_p:{w:.7,fr:1,b:1},lea_n:{w:.7,fr:1,b:1},cld_p:{w:.9,b:1},cld_s:{w:.9,b:1},d_donut:{w:.58},d_candy:{w:.52},d_cookie:{w:.72},d_mac_p:{w:.66,b:1},d_mac_m:{w:.66,b:1,fy:1},d_lolli:{w:.42},d_sofa:{w:.8,b:1,fy:1},d_cake:{w:.78},d_choco:{w:.95},c_white:{w:.72,b:1},c_pink:{w:.74,b:1},c_sky:{w:.7,b:1},c_night:{w:.72,b:1},c_pouf:{w:.6,b:1},c_table:{w:.95},c_tea:{w:.9,b:1},p_swan:{w:.66},chair:{w:.62,b:1},sofa:{w:.7,b:1},shelf:{w:.98},piano:{w:.9,b:1,by:1},bench:{w:.6},throne:{w:.72,b:1},cchair:{w:.58,fr:1,b:1},cboard:{w:.7},skbench:{w:.72,b:1},knit:{w:.7,b:1,by:1},
 stool:{w:.5},wchair:{w:.52,fr:1,b:1},ptable:{w:1.15,r:7},rattan:{w:.66,fr:1,b:1},barstool:{w:.4},beanbag:{w:.74},bartable:{w:.52},marble:{w:.86},leather:{w:.7,fr:1,b:1},cloud:{w:.9,b:1},gtable:{w:.82},
 table:{w:.9},plant:{w:.6},bear:{w:.72},stand:{w:.62},lamp:{w:.5},tree:{w:.68},tank:{w:.82},ctable:{w:.78},pond:{w:1.05},fire:{w:.9},bcushion:{w:.82},bcart:{w:.95},bflag:{w:.55},bstatue:{w:.62}};
const FUI={};function ld(src){let im=FUI[src];if(!im){im=new Image();im.decoding='async';im.src=src;FUI[src]=im}return im.complete&&im.naturalWidth?im:null}
/* 11/8 파란 배경 그림자 다시 지운 그림 → 새로 받게 */const FV=new Set(['stool','wchair','ptable','rattan','barstool','beanbag','bartable','marble','leather','cloud','gtable']);
function fuImg(k,back){if(!FK[k]||FK[k].noimg||!(FK[k].emo||FIMG[k]))return null;const q=FV.has(k)?'?v=2':'';if(back&&FIMG[k]&&FIMG[k].b){const b=ld('img/fu/'+k+'_b.webp'+q);if(b)return b}return ld('img/fu/'+k+'.webp'+q)}
function drawImgF(it,t){const fi=FIMG[it.k];if(!fi)return false;const d=it.d|0,back=d>=2&&!!fi.b,im=fuImg(it.k,back);if(!im)return false;
 const C=cells(it),c=iso(C.reduce((a,q)=>a+q.x,0)/C.length+.5,C.reduce((a,q)=>a+q.y,0)/C.length+.5),ww=TW*fi.w*(C.length>1?1.12:.86),hh=ww*im.naturalHeight/im.naturalWidth,flip=flipOf(it.k,d);
 shadow(c.x,c.y+2,Math.min(ww*.45,TW*.42));cx.save();cx.translate(c.x,c.y+TH*(C.length>1?.55:.3));if(flip)cx.scale(-1,1);if(fi.r){/* 윗면 방향을 칸 격자(26.6°)에 맞추려고 윗면 가운데 기준으로 살짝 돌림 */cx.translate(0,-hh*.66);cx.rotate(fi.r*Math.PI/180);cx.drawImage(im,-ww/2,-hh*.34,ww,hh)}else cx.drawImage(im,-ww/2,-hh,ww,hh);cx.restore();return true}
function stk(e,z){z=Math.max(8,Math.round(z));const k=e+'|'+z;let c=STK[k];if(c)return c;
 const pad=Math.ceil(z*.14)+2,S=Math.ceil(z*1.4)+pad*2,a=document.createElement('canvas');a.width=a.height=S;const ax=a.getContext('2d');ax.font=z+'px '+A.E;ax.textAlign='center';ax.textBaseline='middle';ax.fillText(e,S/2,S/2);
 /* 흰 스티커 테두리 대신: 얇은 진한 테두리 + 아래쪽 그늘 → 바닥에 놓인 물건처럼 */
 c=document.createElement('canvas');c.width=c.height=S;const x=c.getContext('2d'),r=Math.max(1,z*.035);
 for(let i=0;i<10;i++){const an=i/10*Math.PI*2;x.drawImage(a,Math.cos(an)*r,Math.sin(an)*r)}
 x.globalCompositeOperation='source-in';x.fillStyle='rgba(70,44,28,.75)';x.fillRect(0,0,S,S);x.globalCompositeOperation='source-over';x.drawImage(a,0,0);
 x.globalCompositeOperation='source-atop';const g=x.createLinearGradient(0,S*.35,0,S*.85);g.addColorStop(0,'rgba(40,20,10,0)');g.addColorStop(1,'rgba(40,20,10,.28)');x.fillStyle=g;x.fillRect(0,0,S,S);
 const h=x.createLinearGradient(0,S*.1,0,S*.45);h.addColorStop(0,'rgba(255,255,255,.18)');h.addColorStop(1,'rgba(255,255,255,0)');x.fillStyle=h;x.fillRect(0,0,S,S);x.globalCompositeOperation='source-over';STK[k]=c;return c}
function emS(e,x,y,z,al=1){const c=stk(e,z);cx.globalAlpha=al;cx.drawImage(c,x-c.width/2,y-c.height/2);cx.globalAlpha=1}
const OL='#5a3a22';
/* 가구 놓을 때 통통 (보이기만, 저장 안 해요) */
const BNC=new WeakMap();function bounce(it){if(it)BNC.set(it,performance.now())}
const LASTS=new WeakMap();
/* ✨ 11/9 반짝 강화(★1~3): ★2부터 바닥 금빛, 반짝이는 ★마다 늘고 ★3은 무지개. 고른 가구엔 ★ 표시 */
function sparkle(x,y,r,col){cx.fillStyle=col;cx.beginPath();cx.moveTo(x,y-r);cx.quadraticCurveTo(x,y,x+r,y);cx.quadraticCurveTo(x,y,x,y+r);cx.quadraticCurveTo(x,y,x-r,y);cx.quadraticCurveTo(x,y,x,y-r);cx.fill()}
const hs01=n=>{n=Math.imul(n^0x9e3779b9,0x85ebca6b);n^=n>>>13;n=Math.imul(n,0xc2b2ae35);n^=n>>>16;return(n>>>0)/4294967296};
function starFx(x0,y0,hg,wd,s,t,seed,sel){cx.save();
 if(sel){const n=[0,3,5,8][s],P=1.7;for(let i=0;i<n;i++){const q=t/P+i/n,k=Math.floor(q),u=q-k,h1=hs01(seed*131+i*17+k*7919),h2=hs01(seed*977+i*29+k*104729),a=Math.sin(u*Math.PI);
  const x=x0+(h1-.5)*wd,y=y0-hg*(.12+.88*h2),r=TW*(.045+.06*a)*(s===1?.8:1);cx.globalAlpha=a*(s===1?.75:.95);
  sparkle(x,y,r,s===3?'hsl('+Math.round((h1*360+t*90)%360)+',95%,72%)':s===2?'#ffd84a':'#fff3b8');if(s>1){cx.globalAlpha=a*.9;sparkle(x,y,r*.45,'#fff')}}}
 else{const Pc=[0,9,7,5.5][s],ph=hs01(seed*53+11)*Pc,q=(t+ph)/Pc,k=Math.floor(q),w=(q-k)*Pc;
  for(let i=0;i<s;i++){const u=(w-i*.3)/.9;if(u<0||u>1)continue;const a=Math.sin(u*Math.PI),h1=hs01(seed*131+i*17+k*7919),h2=hs01(seed*977+i*29+k*104729);
   const x=x0+(h1-.5)*wd*.8,y=y0-hg*(.2+.75*h2),r=TW*(.03+.05*a);cx.globalAlpha=a*.85;
   sparkle(x,y,r,s===3?'hsl('+Math.round(h1*360)+',90%,78%)':s===2?'#ffd84a':'#fff3b8');cx.globalAlpha=a*.8;sparkle(x,y,r*.4,'#fff')}}
 cx.restore()}
function starGlow(it,t,sel){const s=it.s|0;if(s<2)return;const c=iso(it.x+.5,it.y+.5),a=sel?(s===3?.5:.32)*(.8+.2*Math.sin(t*2.2+it.x+it.y)):(s===3?.2:.11);if(GLW){const r=TW*.62,ry=r*TH/TW,ga=cx.globalAlpha;cx.globalAlpha=ga*a;cx.drawImage(GLW,c.x-r,c.y-ry,r*2,ry*2);cx.globalAlpha=ga;return}
 cx.save();cx.translate(c.x,c.y);cx.scale(1,TH/TW);
 const g=cx.createRadialGradient(0,0,0,0,0,TW*.62);g.addColorStop(0,'rgba(255,220,100,'+a+')');g.addColorStop(.7,'rgba(255,200,60,'+(a*.35)+')');g.addColorStop(1,'rgba(255,200,60,0)');cx.fillStyle=g;cx.beginPath();cx.arc(0,0,TW*.62,0,7);cx.fill();cx.restore()}
function starTag(x,y,s){const t='★'.repeat(s),fs=Math.max(10,TW*.17);cx.save();cx.font='900 '+fs+'px sans-serif';cx.textAlign='center';cx.textBaseline='middle';cx.lineWidth=fs*.28;cx.strokeStyle='#5a3a22';cx.strokeText(t,x,y);cx.fillStyle='#ffd23a';cx.fillText(t,x,y);cx.restore()}
function drawB(it,t,sel){const s=it.s|0;if(s>=2)starGlow(it,t,sel);drawB0(it,t,sel);if(s){const c=iso(it.x+.5,it.y+.5);starFx(c.x,c.y,TW*.85,TW*.75,s,t,it.x*7+it.y*13+1,sel);if(sel)starTag(c.x,c.y+TH*.42,s)}}
function drawB0(it,t,sel){const b=BNC.get(it);if(b!=null){const u=(performance.now()-b)/480;if(u<1){const c=iso(it.x+.5,it.y+.5),sy=1+Math.sin(u*Math.PI*3)*.2*(1-u),sx=1-(sy-1)*.6,dy=-Math.max(0,Math.sin(u*Math.PI*1.5))*TH*.5*(1-u);cx.save();cx.translate(c.x,c.y+TH*.25);cx.scale(sx,sy);cx.translate(-c.x,-c.y-TH*.25+dy);drawItem(it,t,sel);cx.restore();return}BNC.delete(it)}drawItem(it,t,sel)}
function selBox(it,t){cx.globalAlpha=.6+.4*Math.sin(t*6);for(const q of cells(it))poly([iso(q.x,q.y),iso(q.x+1,q.y),iso(q.x+1,q.y+1),iso(q.x,q.y+1)],null,'#ffc94a',3);cx.globalAlpha=1}
function drawItem(it,t,sel){if(drawImgF(it,t)){if(sel)selBox(it,t);return}const gx=it.x,gy=it.y,d=it.d|0,c=iso(gx+.5,gy+.5),s=TW/78,F=FK[it.k]||{},kind=F.as||it.k,lw=Math.max(1.6,TW*.026);
 switch(kind){
 case'table':{shadow(c.x,c.y+2,TW*.28);const top=F.c1||'#d89a5e',base=F.c2||'#8a5a3a';const p=box(gx,gy,.38,TW*.22,base);cx.fillStyle=top;cx.strokeStyle=OL;cx.lineWidth=lw;cx.beginPath();cx.ellipse(p.c.x,p.c.y-2,TW*.33,TH*.33,0,0,7);cx.fill();cx.stroke();
  cx.fillStyle='rgba(255,255,255,.35)';cx.beginPath();cx.ellipse(p.c.x-TW*.08,p.c.y-5,TW*.12,TH*.08,0,0,7);cx.fill();
  emS('☕',p.c.x+7*s,p.c.y-8*s,15*s);if(!F.cup)emS('🐟',p.c.x-9*s,p.c.y-4*s,13*s);break}
 case'chair':{shadow(c.x,c.y+2,TW*.2);const sc=F.c1||'#e09a5a',bc=F.c2||'#b8743f',back=d<2;if(back)panel(gx,gy,d,.28,TW*.14,TW*.24,bc);box(gx,gy,.28,TW*.14,sc);if(!back)panel(gx,gy,d,.28,TW*.14,TW*.18,bc);break}
 case'sofa':{shadow(c.x,c.y+2,TW*.34);const sc=F.c1||'#f08aa0',bc=F.c2||'#d8667e';if(d<2)panel(gx,gy,d,.1,TW*.12,TW*.22,bc);box(gx,gy,.12,TW*.14,sc);if(d>=2)panel(gx,gy,d,.1,TW*.12,TW*.14,bc);break}
 case'bench':{shadow(c.x,c.y+2,TW*.34);const sc=F.c1||'#c08a56',bc=F.c2||'#9a6a3e';if(d<2)panel(gx,gy,d,.12,TW*.13,TW*.16,bc);box(gx,gy,.14,TW*.12,sc);if(d>=2)panel(gx,gy,d,.12,TW*.12,TW*.12,bc);if(F.set==='spring')emS('🌸',c.x,c.y-TW*.3,TW*.2);break}
 case'plant':{shadow(c.x,c.y+2,TW*.18);const p=box(gx,gy,.34,TW*.14,'#d8744a');emS('🪴',p.c.x,p.c.y-TW*.22,TW*.5);break}
 case'tree':{shadow(c.x,c.y+2,TW*.24);const p=box(gx,gy,.3,TW*.16,'#b8643c');emS('🌳',p.c.x,p.c.y-TW*.42+Math.sin(t*1.5+gx)*1,TW*.9);break}
 case'lamp':{shadow(c.x,c.y+2,TW*.14);cx.fillStyle=OL;cx.fillRect(c.x-2.5,c.y-TW*.62,5,TW*.62);const gl=cx.createRadialGradient(c.x,c.y-TW*.7,2,c.x,c.y-TW*.7,TW*.6);gl.addColorStop(0,'rgba(255,220,140,'+(.45+.1*Math.sin(t*3))+')');gl.addColorStop(1,'rgba(255,220,140,0)');cx.fillStyle=gl;cx.beginPath();cx.arc(c.x,c.y-TW*.7,TW*.6,0,7);cx.fill();emS('🏮',c.x,c.y-TW*.72,TW*.42);break}
 case'shelf':{shadow(c.x,c.y+2,TW*.34);box(gx,gy,.12,TW*.5,'#a8744a',{top:'#c8925e'});for(let r=0;r<2;r++)for(let q=0;q<3;q++){const u=(q+.5)/3,a=d%2?iso(gx+.12,gy+.12+u*.76):iso(gx+.12+u*.76,gy+.88);emS(['🥐','🍞','🐟'][(q+r)%3],a.x+(d%2?TW*.1:-TW*.04),a.y-TW*(.14+r*.18),TW*.2)}break}
 case'tank':{shadow(c.x,c.y+2,TW*.3);box(gx,gy,.16,TW*.08,'#6a5a50');box(gx,gy,.18,TW*.36,'#9fd8f0',{z:TW*.08,top:'rgba(200,240,255,.9)',line:'#4a8aa8'});emS('🐠',c.x+Math.sin(t*1.2+gx)*TW*.14,c.y-TW*.28,TW*.22);emS('🐟',c.x-Math.sin(t*1.5)*TW*.1,c.y-TW*.18,TW*.16);break}
 case'piano':{shadow(c.x,c.y+2,TW*.34);const p=box(gx,gy,.12,TW*.34,'#2e2a2e',{top:'#3e3a40',line:'#111'});const E=[[p.T,p.R],[p.L,p.T],[p.R,p.B],[p.B,p.L]][d];cx.strokeStyle='#fff';cx.lineWidth=TW*.07;cx.beginPath();cx.moveTo((E[0].x*3+p.c.x)/4,(E[0].y*3+p.c.y)/4);cx.lineTo((E[1].x*3+p.c.x)/4,(E[1].y*3+p.c.y)/4);cx.stroke();emS('🎵',p.c.x+Math.sin(t*2)*6,p.c.y-TW*.35-m2(t*20,14),TW*.18,.85);break}
 case'rug':{const a1=F.c1||'#e06a6a',a2=F.c2||'#f6c070';poly([iso(gx+.06,gy+.06),iso(gx+.94,gy+.06),iso(gx+.94,gy+.94),iso(gx+.06,gy+.94)],a1,OL,lw);
  if(F.chk){for(let i=0;i<4;i++)for(let j=0;j<4;j++)if((i+j)%2)poly([iso(gx+.06+i*.22,gy+.06+j*.22),iso(gx+.28+i*.22,gy+.06+j*.22),iso(gx+.28+i*.22,gy+.28+j*.22),iso(gx+.06+i*.22,gy+.28+j*.22)],a2)}
  else poly([iso(gx+.22,gy+.22),iso(gx+.78,gy+.22),iso(gx+.78,gy+.78),iso(gx+.22,gy+.78)],a2);break}
 case'bear':{shadow(c.x,c.y+2,TW*.16);emS('🧸',c.x,c.y-TW*.2,TW*.46);break}
 case'throne':{shadow(c.x,c.y+2,TW*.32);if(d<2)panel(gx,gy,d,.14,TW*.16,TW*.46,'#d8304a');box(gx,gy,.16,TW*.16,'#e0b030',{top:'#f05060'});if(d>=2)panel(gx,gy,d,.14,TW*.16,TW*.2,'#d8304a');emS('👑',c.x,c.y-TW*.62,TW*.3);break}
 case'stand':{shadow(c.x,c.y+2,TW*.18);cx.fillStyle=OL;cx.fillRect(c.x-TW*.16,c.y-TW*.2,3,TW*.2);cx.fillRect(c.x+TW*.14,c.y-TW*.2,3,TW*.2);rr(c.x-TW*.24,c.y-TW*.62,TW*.48,TW*.44,8,'#fff3dc');cx.strokeStyle=OL;cx.lineWidth=lw;cx.beginPath();cx.roundRect(c.x-TW*.24,c.y-TW*.62,TW*.48,TW*.44,8);cx.stroke();A.fish2(c.x,c.y-TW*.42,TW*.0042,'#f0b850',{plain:true});tx('붕어빵',c.x,c.y-TW*.26,Math.max(9,TW*.13),'#8a3a1a','center','#fff3dc');break}
 /* ---- 세트 전용 모양 ---- */
 case'board':{shadow(c.x,c.y+2,TW*.2);cx.strokeStyle=OL;cx.lineWidth=lw*1.4;cx.beginPath();cx.moveTo(c.x-TW*.18,c.y);cx.lineTo(c.x-TW*.1,c.y-TW*.66);cx.moveTo(c.x+TW*.18,c.y);cx.lineTo(c.x+TW*.1,c.y-TW*.66);cx.stroke();
  const x0=c.x-TW*.25,y0=c.y-TW*.72,w=TW*.5,h=TW*.46;rr(x0,y0,w,h,6,'#2f4a3a');cx.strokeStyle='#a8744a';cx.lineWidth=lw*1.6;cx.beginPath();cx.roundRect(x0,y0,w,h,6);cx.stroke();
  tx('오늘의',c.x,y0+h*.24,Math.max(8,TW*.1),'#fff','center','#2f4a3a');tx('커피 ☕',c.x,y0+h*.55,Math.max(9,TW*.12),'#ffe9a0','center','#2f4a3a');cx.strokeStyle='rgba(255,255,255,.5)';cx.lineWidth=1;cx.beginPath();cx.moveTo(x0+w*.2,y0+h*.8);cx.lineTo(x0+w*.8,y0+h*.8);cx.stroke();break}
 case'pond':{const P=[iso(gx+.08,gy+.5),iso(gx+.5,gy+.08),iso(gx+.92,gy+.5),iso(gx+.5,gy+.92)];cx.fillStyle='#8a7a6a';cx.strokeStyle=OL;cx.lineWidth=lw;cx.beginPath();cx.ellipse(c.x,c.y,TW*.44,TH*.44,0,0,7);cx.fill();cx.stroke();
  const g=cx.createRadialGradient(c.x,c.y,2,c.x,c.y,TW*.4);g.addColorStop(0,'#bfe8ff');g.addColorStop(1,'#6ab0e0');cx.fillStyle=g;cx.beginPath();cx.ellipse(c.x,c.y,TW*.37,TH*.37,0,0,7);cx.fill();
  cx.strokeStyle='rgba(255,255,255,.6)';cx.lineWidth=1.2;const rp=m2(t*.6,1);cx.globalAlpha=1-rp;cx.beginPath();cx.ellipse(c.x+TW*.08,c.y,TW*.08+rp*TW*.15,TH*.08+rp*TH*.15,0,0,7);cx.stroke();cx.globalAlpha=1;emS('🪷',c.x-TW*.1,c.y-TW*.06,TW*.26);emS('🪷',c.x+TW*.14,c.y+TW*.03,TW*.18);break}
 case'fire':{shadow(c.x,c.y+2,TW*.32);const p=box(gx,gy,.14,TW*.46,'#c8664a',{top:'#8a4a3a'});const fx_=p.c.x,fy=p.c.y+TW*.12;rr(fx_-TW*.16,fy-TW*.12,TW*.32,TW*.24,TW*.1,'#2a1a14');
  const g=cx.createRadialGradient(fx_,fy,2,fx_,fy,TW*.5);g.addColorStop(0,'rgba(255,170,60,'+(.5+.15*Math.sin(t*9))+')');g.addColorStop(1,'rgba(255,170,60,0)');cx.fillStyle=g;cx.beginPath();cx.arc(fx_,fy,TW*.5,0,7);cx.fill();
  emS('🔥',fx_,fy-TW*.02+Math.sin(t*12)*1.2,TW*.24);emS('🧦',p.c.x-TW*.12,p.c.y-TW*.22,TW*.14);emS('🧦',p.c.x+TW*.12,p.c.y-TW*.22,TW*.14);break}
 case'cushion':{shadow(c.x,c.y+2,TW*.28);cx.fillStyle='#e8a848';cx.strokeStyle=OL;cx.lineWidth=lw;cx.beginPath();cx.ellipse(c.x,c.y-TW*.04,TW*.32,TH*.3,0,0,7);cx.fill();cx.stroke();
  A.fish2(c.x,c.y-TW*.1,TW*.0048,'#f6c060',{plain:true});break}
 case'cart':{shadow(c.x,c.y+2,TW*.34);const p=box(gx,gy,.14,TW*.3,'#c88a4e',{z:TW*.08});for(const q of [iso(gx+.2,gy+.85),iso(gx+.8,gy+.85),iso(gx+.85,gy+.2)]){cx.fillStyle='#5a4a40';cx.strokeStyle=OL;cx.lineWidth=lw;cx.beginPath();cx.arc(q.x,q.y-TW*.06,TW*.09,0,7);cx.fill();cx.stroke()}
  for(let i=0;i<3;i++)A.fish2(p.c.x-TW*.16+i*TW*.16,p.c.y-TW*.05,TW*.0028,'#f0b850',{plain:true});
  const ty=p.c.y-TW*.62;for(let i=0;i<6;i++){cx.fillStyle=i%2?'#fff':'#e8584a';cx.fillRect(p.c.x-TW*.3+i*TW*.1,ty,TW*.1,TW*.1)}cx.strokeStyle=OL;cx.lineWidth=lw;cx.strokeRect(p.c.x-TW*.3,ty,TW*.6,TW*.1);cx.beginPath();cx.moveTo(p.c.x-TW*.28,ty+TW*.1);cx.lineTo(p.c.x-TW*.28,p.c.y-TW*.1);cx.moveTo(p.c.x+TW*.28,ty+TW*.1);cx.lineTo(p.c.x+TW*.28,p.c.y-TW*.1);cx.stroke();
  for(let i=0;i<2;i++){const ph=m2(t*.8+i*.5,1);cx.fillStyle='rgba(255,255,255,'+(.5*(1-ph))+')';cx.beginPath();cx.ellipse(p.c.x-TW*.1+i*TW*.2,p.c.y-TW*.15-ph*TW*.3,3+ph*4,2+ph*3,0,0,7);cx.fill()}break}
 case'fflag':{shadow(c.x,c.y+2,TW*.12);box(gx,gy,.38,TW*.06,'#8a7a6a');cx.fillStyle=OL;cx.fillRect(c.x-2,c.y-TW*1.05,4,TW*1.05);for(let i=0;i<3;i++){cx.save();cx.translate(c.x+TW*.16,c.y-TW*(.9-i*.22));cx.rotate(Math.sin(t*3+i)*.18);A.fish2(0,0,TW*.0034,['#ff8a6a','#ffcf3a','#6cc8ff'][i],{plain:true});cx.restore()}break}
 case'statue':{shadow(c.x,c.y+2,TW*.3);const p=box(gx,gy,.2,TW*.26,'#b8b4ac',{top:'#d8d4cc'});const g=cx.createRadialGradient(p.c.x,p.c.y-TW*.4,2,p.c.x,p.c.y-TW*.4,TW*.6);g.addColorStop(0,'rgba(255,220,80,'+(.4+.1*Math.sin(t*3))+')');g.addColorStop(1,'rgba(255,220,80,0)');cx.fillStyle=g;cx.beginPath();cx.arc(p.c.x,p.c.y-TW*.4,TW*.6,0,7);cx.fill();
  A.fish2(p.c.x,p.c.y-TW*.38+Math.sin(t*1.6)*2,TW*.0075,'#ffcf3a',{glow:'rgba(255,220,80,.8)'});break}
 default:{const f=FK[it.k];if(!f||!f.emo)break;
  /* AI 그림 소품 (img/fu/키.webp): 불러왔으면 그림, 아니면 예전 받침+이모지 */
  {const im=fuImg(it.k);if(im){const hh=TW*Math.max(.62,f.z*1.2+(f.tall||0)*1.0),ww=hh*im.naturalWidth/im.naturalHeight,sway=f.tree||f.pole?Math.sin(t*1.5+gx)*.02:0;shadow(c.x,c.y+2,Math.min(ww*.42,TW*.36));
   if(f.glow){const g=cx.createRadialGradient(c.x,c.y-hh*.75,2,c.x,c.y-hh*.75,TW*.5);g.addColorStop(0,'rgba(255,230,150,'+(.35+.1*Math.sin(t*3))+')');g.addColorStop(1,'rgba(255,230,150,0)');cx.fillStyle=g;cx.beginPath();cx.arc(c.x,c.y-hh*.75,TW*.5,0,7);cx.fill()}
   cx.save();cx.translate(c.x,c.y+TH*.22);if(sway)cx.rotate(sway);cx.drawImage(im,-ww/2,-hh,ww,hh);cx.restore();break}}shadow(c.x,c.y+2,TW*.3);const h=TW*(f.tall||.1);const p=box(gx,gy,f.tall?.14:.3,h,f.b,f.glass?{top:'rgba(220,240,255,.85)'}:{});
  if(f.pole){cx.fillStyle=OL;cx.fillRect(c.x-2,c.y-TW*.9,4,TW*.9)}
  if(f.glow){const g=cx.createRadialGradient(p.c.x,p.c.y-TW*.3,2,p.c.x,p.c.y-TW*.3,TW*.55);g.addColorStop(0,'rgba(255,230,150,'+(.4+.1*Math.sin(t*3))+')');g.addColorStop(1,'rgba(255,230,150,0)');cx.fillStyle=g;cx.beginPath();cx.arc(p.c.x,p.c.y-TW*.3,TW*.55,0,7);cx.fill()}
  const sway=f.tree||f.pole?Math.sin(t*1.5+gx)*1.2:0;emS(f.e,p.c.x+sway,p.c.y-TW*f.z*.5-(f.pole?TW*.5:0)+(f.glass?TW*.12:0),TW*f.z)}
 }
 if(sel){cx.globalAlpha=.6+.4*Math.sin(t*6);poly([iso(gx,gy),iso(gx+1,gy),iso(gx+1,gy+1),iso(gx,gy+1)],null,'#ffc94a',3);cx.globalAlpha=1}}
/* 꾸미기 카드용 작은 그림: 168×168 캔버스로 만든 ISO에서 불러요 (가구 하나를 타일 위에) */
function thumb(k){const f=FK[k],wf=WK[k];if(!f&&!wf)return'';const C=cx.canvas,S=C.width;cx.clearRect(0,0,S,S);
 N=1;TW=Math.round(S*.6);TH=TW/2;WH=Math.round(TW*1.25);OX=S/2;OY=Math.round(S*.62);
 if(wf){const im=wImg(k);if(im){const z=S*.8/Math.max(im.naturalWidth,im.naturalHeight);cx.drawImage(im,S/2-im.naturalWidth*z/2,S/2-im.naturalHeight*z/2,im.naturalWidth*z,im.naturalHeight*z)}else em(wf.e,S/2,S/2,S*.6)}
 else drawItem({k,x:0,y:0,d:f.rot?1:0},0,false);
 /* 그림이 있는 곳만 잘라서 카드에 꽉 차게 */
 try{const D=cx.getImageData(0,0,S,S).data;let x0=S,y0=S,x1=-1,y1=-1;for(let y=0;y<S;y++)for(let x=0;x<S;x++)if(D[(y*S+x)*4+3]>10){if(x<x0)x0=x;if(x>x1)x1=x;if(y<y0)y0=y;if(y>y1)y1=y}
  if(x1<0)return C.toDataURL();const pd=4;x0=Math.max(0,x0-pd);y0=Math.max(0,y0-pd);x1=Math.min(S-1,x1+pd);y1=Math.min(S-1,y1+pd);const o=document.createElement('canvas');o.width=x1-x0+1;o.height=y1-y0+1;o.getContext('2d').drawImage(C,x0,y0,o.width,o.height,0,0,o.width,o.height);return o.toDataURL()}catch(e){return''}}
/* ---------- 손님 (꾸밈용으로 걸어다녀요) ---------- */
let cust=[],spawnT=1.5,nid=1,fx=[];const AN=BP2.R.an;
const tileOf=c=>({gx:Math.max(0,Math.min(N-1,Math.floor(c.x))),gy:Math.max(0,Math.min(N-1,Math.floor(c.y)))});
/* 지금 자리에서 가구를 피해 문까지 → 밖으로 */
function pathOut(items,c){const s=c?tileOf(c):{gx:2,gy:1},r=bfs(s.gx,s.gy,N,blockSet(items,N),(x,y)=>x===N-1&&y===0);return[...(r||[]).slice(1).map(ctr),{x:N-.5,y:.5},{x:N+1.3,y:.5}]}
function queuePts(items){const r=mainRoute(items),P=r?[{x:2,y:1.5},...r.slice().reverse().map(ctr),{x:N+1.3,y:.5}]:[{x:2,y:1.5},{x:N-.5,y:1.5},{x:N-.5,y:.5},{x:N+1.3,y:.5}],out=[];
 for(let i=0;i<8;i++){let dist=i*.9,p=null;for(let j=0;j<P.length-1;j++){const a=P[j],b=P[j+1],L=Math.hypot(b.x-a.x,b.y-a.y);if(dist<=L){p={x:a.x+(b.x-a.x)*dist/L,y:a.y+(b.y-a.y)*dist/L};break}dist-=L}out.push(p||P[P.length-1])}return out}
/* 줄 서는 길(카운터 앞 → 문 → 밖): 손님은 이 선을 따라서만 움직여요 (가구를 뚫고 가로질러 가지 않게) */
function qLine(items){const r=mainRoute(items),P=r?[{x:2,y:1.5},...r.slice().reverse().map(ctr),{x:N+1.6,y:.5}]:[{x:2,y:1.5},{x:N-.5,y:1.5},{x:N-.5,y:.5},{x:N+1.6,y:.5}],C=[0];
 for(let j=0;j<P.length-1;j++)C.push(C[j]+Math.hypot(P[j+1].x-P[j].x,P[j+1].y-P[j].y));return{P,C,L:C[C.length-1]}}
function qAt(q,d){d=Math.max(0,Math.min(q.L,d));for(let j=0;j<q.P.length-1;j++){if(d<=q.C[j+1]||j===q.P.length-2){const L=q.C[j+1]-q.C[j]||1,u=Math.max(0,Math.min(1,(d-q.C[j])/L)),a=q.P[j],b=q.P[j+1];return{x:a.x+(b.x-a.x)*u,y:a.y+(b.y-a.y)*u}}}return q.P[0]}
/* 손님 수: 가게가 클수록 북적 (4×4 4명 → 10×10 12명) */
/* 👥 11/14 인기 가게일수록 손님이 바글바글: POP = 등급·꾸미기 점수로 정한 배수 (0.8~2.4) */
let POP=1;const CAP=()=>Math.min(22,Math.round((N<=4?4:Math.min(12,4+Math.round((N-4)*1.35)))*POP));
function say(c,t){c.bub=t;c.bt=2}
/* 🍽️ 11/14 가게 생활감: 앉으면 옆 탁자에 붕어빵(카페면 ☕도) → 먹으며 줄어듦 → 나가면 빈 접시·휴지 → 수습생이 치워요 (없으면 사장님이 톡) · 보이는 것만, 돈·점수엔 영향 없음 */
let junk=[],JK=0,MGI=null,CAFE=0;const JMAX=8;
const isTbl=f=>!!(f&&f.c==='sit'&&!f.seat&&!walkF(f));
function tableFor(items,sl){let best=null,bd=9;for(const it of items){const f=FK[it.k];if(!isTbl(f)||!inRoom(it.x,it.y))continue;for(const q of cells(it)){const d=Math.abs(q.x-sl.x)+Math.abs(q.y-sl.y),dd=d===1?1:(Math.abs(q.x-sl.x)===1&&Math.abs(q.y-sl.y)===1?1.5:9);if(dd<bd){bd=dd;best={it,cx:q.x,cy:q.y}}}}
 if(!best)return null;const k=.24;return{it:best.it,x:best.cx+.5+(sl.x-best.cx)*k,y:best.cy+.5+(sl.y-best.cy)*k,ox:best.it.x,oy:best.it.y}}
const tbOk=(items,b)=>b&&items.includes(b.it)&&b.it.x===b.ox&&b.it.y===b.oy;
/* 수습생이 서 있는 자리(카운터 앞 빈 칸) */
function mgSpot(items){for(const [x,y] of [[0,2],[1,2],[0,3],[2,2],[1,3],[3,2],[0,4]])if(inRoom(x,y)&&!isPath(x,y)&&!isCounter(x,y)&&!occAt(items,x,y))return{x:x+.5,y:y+.45};return null}
let cl={x:null,y:null,st:'idle',w:0,route:[],j:null,carry:0,fl:0};
function clStep(dt,items){const sp=MGI?mgSpot(items):null;if(!sp||!JK){cl.x=null;cl.st='idle';cl.route=[];cl.j=null;cl.carry=0;return}
 if(cl.x==null){cl.x=sp.x;cl.y=sp.y;cl.st='idle';cl.w=0}cl.t=(cl.t||0)+dt;if(cl.bt>0)cl.bt-=dt;
 const blk=blockSet(items,N),from=()=>{const s=tileOf(cl);return s};
 const goJ=()=>{const L=junk.filter(j=>j.t>1.2&&!j.nr);if(!L.length)return false;L.sort((a,b)=>Math.hypot(a.x-cl.x,a.y-cl.y)-Math.hypot(b.x-cl.x,b.y-cl.y));
  for(const j of L){const jx=Math.floor(j.x),jy=Math.floor(j.y),s=from(),r=bfs(s.gx,s.gy,N,blk,(x,y)=>Math.abs(x-jx)+Math.abs(y-jy)<=1&&!blk.has(x+','+y));if(r){cl.j=j;cl.route=r.slice(1).map(ctr);cl.st='go';return true}j.nr=1}return false};
 const goHome=()=>{const s=from(),g={gx:Math.floor(sp.x),gy:Math.floor(sp.y)},r=bfs(s.gx,s.gy,N,blk,(x,y)=>x===g.gx&&y===g.gy);cl.route=(r||[]).slice(1).map(ctr);cl.route.push({x:sp.x,y:sp.y});cl.st='back'};
 if(cl.st==='idle'){cl.w+=dt;if(Math.hypot(cl.x-sp.x,cl.y-sp.y)>.05){cl.x=sp.x;cl.y=sp.y}if(cl.w>1.5&&goJ()){cl.bub=['치울게요! 🧹','제가 할게요~','반짝반짝 ✨'][cl.t%3|0];cl.bt=1.6}}
 else if(cl.st==='go'){if(!junk.includes(cl.j)){cl.j=null;if(!goJ())goHome()}else if(!cl.route.length){cl.st='wipe';cl.w=0}}
 else if(cl.st==='wipe'){cl.w+=dt;if(!junk.includes(cl.j)){cl.w=9}if(cl.w>1.0){if(junk.includes(cl.j)){junk=junk.filter(j=>j!==cl.j);cl.carry++;const p=iso(cl.j.x,cl.j.y);fx.push({e:'✨',x:p.x,y:p.y-TW*.3,l:1})}cl.j=null;if(cl.carry>=3||!goJ())goHome()}}
 else if(cl.st==='back'&&!cl.route.length){cl.st='idle';cl.w=0;cl.carry=0}
 if((cl.st==='go'||cl.st==='back')&&cl.route.length){const tg=cl.route[0],dx=tg.x-cl.x,dy=tg.y-cl.y,L=Math.hypot(dx,dy),v=1.8*dt;if(Math.abs(dx-dy)>.01)cl.fl=dx-dy<0?1:0;if(L<=v){cl.x=tg.x;cl.y=tg.y;cl.route.shift()}else{cl.x+=dx/L*v;cl.y+=dy/L*v}cl.mv=1}else cl.mv=0}
function addJunk(c){if(!JK||FL||junk.length>=JMAX)return;const b=c.tb,x=b?b.x:c.seat.x+.5,y=b?b.y:c.seat.y+.5;if(junk.some(j=>Math.hypot(j.x-x,j.y-y)<.3))return;
 junk.push({x,y,it:b?b.it:c.seat.it,ox:b?b.ox:c.seat.it.x,oy:b?b.oy:c.seat.it.y,on:b?1:0,t:0,e2:CAFE&&b?'☕':'🧻',id:c.id})}
/* 먹는 붕어빵: 0 통째 → 1 반쪽 → 2 빈 접시 */
function foodSt(c){const f=c.w/(c.sd||12);return f<.45?0:f<.85?1:2}
function drawFish(x,y,z,st){if(st===0){em('🐟',x,y,z);return}if(st===1){cx.save();cx.beginPath();cx.rect(x-z,y-z,z*1.02,z*2);cx.clip();em('🐟',x,y,z);cx.restore();em('·',x+z*.15,y,z*.5);return}}
function drawFood(c,t){const b=c.tb,p=iso(b.x,b.y),h=TW*.3,y=p.y-h,st=foodSt(c),z=TW*.24;
 em('🍽️',p.x,y+z*.15,z*1.05);if(st<2)drawFish(p.x-z*.08,y-z*.12,z*.8,st);if(CAFE)em('☕',p.x+z*.62,y-z*.25,z*.75)}
function drawJunk(j,t){const p=iso(j.x,j.y),h=j.on?TW*.3:0,y=p.y-h,z=TW*.23;em('🍽️',p.x,y+z*.15,z);em(j.e2,p.x+z*.55,y-z*.2,z*.7);if(j.on===0){cx.globalAlpha=.5;em('·',p.x-z*.4,y,z*.6);cx.globalAlpha=1}}
function step(dt,items,rate=1){spawnT-=dt*rate;if(spawnT<=0){if(cust.length<CAP())cust.push({id:nid++,an:AN[Math.floor(Math.random()*AN.length)],x:N+1.6,y:.5,st:'q',route:[],t:0,sh:['#7ec8ff','#ff9ab0','#9ad870','#ffd23a','#b48aff'][nid%5]});spawnT=(2.6+Math.random()*2.6)*Math.min(1,6/CAP())/Math.max(1,POP*.8)}
 /* 빈 자리 중 무작위 (방금 누가 일어난 자리는 덜 골라요) */
 const seats=[];for(const it of items)if(FK[it.k]&&FK[it.k].seat&&inRoom(it.x,it.y))for(const sl of slotsOf(it))if(inRoom(sl.x,sl.y))seats.push(sl);const free=()=>{const L=seats.filter(ch=>!cust.some(c=>c.seat===ch)&&seatOk(items,ch));if(!L.length)return undefined;const now=performance.now(),dirty=ch=>junk.length&&(()=>{const b=tableFor(items,ch),x=b?b.x:ch.x+.5,y=b?b.y:ch.y+.5;return junk.some(j=>Math.hypot(j.x-x,j.y-y)<.35)})(),w=L.map(ch=>{const u=LASTS.get(ch);return(u&&now-u<20000?.25:1)*(dirty(ch)?.12:1)}),tot=w.reduce((a,b)=>a+b,0);let r=Math.random()*tot;for(let i=0;i<L.length;i++){r-=w[i];if(r<=0)return L[i]}return L[L.length-1]};
 const QL=qLine(items),inQ=cust.filter(c=>c.st==='q');
 inQ.forEach((c,i)=>{if(c.qd==null)c.qd=QL.L;c.qd=Math.min(c.qd,QL.L);const tg=Math.min(i*.9,QL.L),old=c.qd;if(c.qd>tg)c.qd=Math.max(tg,c.qd-1.6*dt);const p=qAt(QL,c.qd);c.x=p.x;c.y=p.y;c.mv=c.qd!==old?1:0;c.route=[]});
 for(const c of cust){c.t+=dt;if(c.bt>0)c.bt-=dt;
  /* 앉으려던 의자가 치워지거나 옮겨지면 → 나가요 */
  if(c.seat&&(!items.includes(c.seat.it)||c.sx!==c.seat.x||c.sy!==c.seat.y)){c.seat=null;if(c.st==='sit'||c.st==='go'){c.st='out';c.route=pathOut(items,c)}}
  if(c.st==='q'){if(inQ[0]===c&&c.qd<=.02){c.w=(c.w||0)+dt;if(c.w>.3&&!c.asked){c.asked=1;say(c,'🐟 하나 주세요!')}if(c.w>1.8){c.st='buy';c.w=0}}}
  else if(c.st==='buy'){c.w+=dt;if(c.w>.6&&!c.paid){c.paid=1;say(c,'💖 고마워요!');const p=iso(c.x,c.y);fx.push({e:'🪙',x:p.x,y:p.y-TW*.9,l:1})}
   if(c.w>1.2&&ST&&UP2>0&&Math.random()<UP2){const s=tileOf(c),r=bfs(s.gx,s.gy,N,blockSet(items,N),(x,y)=>isSt(x,y));if(r){c.st='up';c.route=r.slice(1).map(ctr);say(c,'⬆️ 2층 가 볼래요');continue}}
   if(c.w>1.2){const ch=free(),s=tileOf(c),r=ch&&bfs(s.gx,s.gy,N,blockSet(items,N),(x,y)=>x===ch.x&&y===ch.y);
    if(r){c.seat=ch;c.sx=ch.x;c.sy=ch.y;c.st='go';c.route=r.slice(1).map(ctr)}else{c.st='out';c.route=pathOut(items,c)}}}
  else if(c.st==='go'&&!c.route.length){c.st='sit';c.w=0;c.sd=12+Math.random()*12;c.tb=c.seat?tableFor(items,c.seat):null;if(c.tb)junk=junk.filter(j=>Math.hypot(j.x-c.tb.x,j.y-c.tb.y)>=.35);say(c,['😋 맛있다!','😊 여기 좋네요','🥰 분위기 최고'][c.id%3])}
  else if(c.st==='sit'){c.w+=dt;if(c.tb&&!tbOk(items,c.tb))c.tb=null;if(c.w>(c.sd||12)){c.st='out';c.route=pathOut(items,c);if(c.seat){LASTS.set(c.seat,performance.now());addJunk(c)}c.seat=null;c.tb=null;say(c,'또 올게요 👋')}}
  if(c.st!=='sit'&&c.route.length){const tg=c.route[0],dx=tg.x-c.x,dy=tg.y-c.y,L=Math.hypot(dx,dy),sp=1.6*dt;if(L<=sp){c.x=tg.x;c.y=tg.y;c.route.shift()}else{c.x+=dx/L*sp;c.y+=dy/L*sp;c.mv=1}}else if(c.st!=='q')c.mv=0}
 cust=cust.filter(c=>!((c.st==='out'||c.st==='up')&&!c.route.length));for(const f of fx)f.l-=dt;fx=fx.filter(f=>f.l>0);
 junk=junk.filter(j=>items.includes(j.it)&&j.it.x===j.ox&&j.it.y===j.oy);for(const j of junk){j.t+=dt;if(j.nr&&(j.t%6)<dt)j.nr=0}clStep(dt,items)}
/* 🏢 2층 손님: 계단(0,N-1)에서 올라와 빈 자리에 앉았다가 다시 계단으로 내려가요 (1층에서 '⬆️' 한 손님과 비슷한 빈도) */
let cust2=[],spawn2=1,UP2=0;
function step2(dt,items){const seats=[];for(const it of items)if(FK[it.k]&&FK[it.k].seat&&inRoom(it.x,it.y))for(const sl of slotsOf(it))if(inRoom(sl.x,sl.y))seats.push(sl);
 const S=STT(N),blk=blockSet(items,N);spawn2-=dt;
 if(spawn2<=0){spawn2=(3+Math.random()*3)/Math.max(1,POP*.8);const L=seats.filter(ch=>!cust2.some(c=>c.seat===ch));if(L.length&&cust2.length<Math.min(Math.round(8*Math.max(1,POP)),seats.length)){const ch=L[Math.floor(Math.random()*L.length)],r=bfs(S.gx,S.gy,N,blk,(x,y)=>x===ch.x&&y===ch.y);
  if(r)cust2.push({id:nid++,an:AN[Math.floor(Math.random()*AN.length)],x:N-1.5,y:.5,st:'go',seat:ch,route:r.slice(1).map(ctr),t:0,sh:['#7ec8ff','#ff9ab0','#9ad870','#ffd23a','#b48aff'][nid%5]})}}
 for(const c of cust2){c.t+=dt;if(c.bt>0)c.bt-=dt;
  if(c.seat&&!items.includes(c.seat.it)&&c.st!=='out'){c.st='out';const s=tileOf(c),r=bfs(s.gx,s.gy,N,blk,(x,y)=>x===S.gx&&y===S.gy);c.route=(r||[]).slice(1).map(ctr)}
  if(c.st==='go'&&!c.route.length){c.st='sit';c.w=0;c.sd=14+Math.random()*12;c.tb=c.seat?tableFor(items,c.seat):null;say(c,['😍 2층 최고!','🌇 경치 좋다~','😋 여기서 먹을래요'][c.id%3])}
  else if(c.st==='sit'){c.w=(c.w||0)+dt;if(c.tb&&!tbOk(items,c.tb))c.tb=null;if(c.w>(c.sd||14)){c.tb=null;c.st='out';const s=tileOf(c),r=bfs(s.gx,s.gy,N,blk,(x,y)=>x===S.gx&&y===S.gy);c.route=(r||[]).slice(1).map(ctr);say(c,'잘 먹었어요 👋')}}
  if(c.st!=='sit'&&c.route.length){const tg=c.route[0],dx=tg.x-c.x,dy=tg.y-c.y,L=Math.hypot(dx,dy),sp=1.6*dt;if(L<=sp){c.x=tg.x;c.y=tg.y;c.route.shift()}else{c.x+=dx/L*sp;c.y+=dy/L*sp;c.mv=1}}else c.mv=0}
 cust2=cust2.filter(c=>!(c.st==='out'&&!c.route.length));for(const f of fx)f.l-=dt;fx=fx.filter(f=>f.l>0)}
function reset(){cust=[];spawnT=1.2;cust2=[];spawn2=.6;junk=[];cl.x=null;cl.st='idle';cl.route=[];cl.j=null;cl.carry=0}
function bubble(x,y,t,a){cx.globalAlpha=a;cx.font='bold 13px "Jua","Noto Sans KR",sans-serif';const w=cx.measureText(t).width+16;rr(x-w/2,y-12,w,24,12,'#fff');cx.beginPath();cx.moveTo(x-5,y+11);cx.lineTo(x,y+17);cx.lineTo(x+5,y+11);cx.closePath();cx.fillStyle='#fff';cx.fill();tx(t,x,y,13,'#5a3a22','center','#fff');cx.globalAlpha=1}
function drawCust(c,t){const p=iso(c.x,c.y),sz=TW*.38,bob=c.mv?Math.abs(Math.sin(c.t*11))*3:0;let y=p.y-sz*.88-bob;if(c.st==='sit')y-=TW*.12;
 shadow(p.x,p.y,sz*.34);animal(c.an,p.x,y,sz,{walk:c.mv?c.t*10+c.id:null,t,ph:c.id,mood:c.st==='sit'||c.paid?'h':'n',shirt:c.sh});if(c.st==='sit'&&!c.tb){const fs=foodSt(c);if(fs<2)drawFish(p.x+sz*.42,y+sz*.5,sz*.32,fs)}
 if(c.bub&&c.bt>0)bubble(p.x,y-sz*.75,c.bub,Math.min(1,c.bt*3))}
/* ---------- 마스코트: 가게 안을 천천히 돌아다녀요 ---------- */
const pet={x:.5,y:2.5,tx:.5,ty:2.5,w:0};
function petStep(dt,items){const sp=.6*dt,dx=pet.tx-pet.x,dy=pet.ty-pet.y,L=Math.hypot(dx,dy);if(L>sp){pet.x+=dx/L*sp;pet.y+=dy/L*sp;pet.mv=1}else{pet.mv=0;pet.w-=dt;if(pet.w<=0){pet.w=2+Math.random()*3;for(let k=0;k<12;k++){const gx=Math.floor(Math.random()*N),gy=Math.floor(Math.random()*N);if(canPlace(gx,gy)&&!items.some(it=>it.x===gx&&it.y===gy)){pet.tx=gx+.5;pet.ty=gy+.5;break}}}}}
/* 🐾 펫 그림(img/pet_*.webp, 왼쪽을 봐요): 가는 방향으로 뒤집고 걸을 땐 통통. 그림이 없으면 예전 이모지 */
const PETI={'🦄':'unicorn','🐉':'dragon','🦁':'lion','🦊':'fox','🐼':'panda','🐶':'dog','🐱':'cat','🐰':'rabbit'},PETH=new Set(['unicorn','dragon','lion','fox','panda','dog','cat','rabbit']);
function drawPet(look,t){const p=iso(pet.x,pet.y),b=pet.mv?Math.abs(Math.sin(t*10))*3:Math.sin(t*2)*1.5;if(look.mas.e==='🌟'){A.fish2(p.x,p.y-TW*.4-b,TW*.005,'#ffcf3a',{glow:'#ffe066'});return}
 const pk=PETI[look.mas.e],im=pk&&PETH.has(pk)?ld('img/pet_'+pk+'.webp?v=2'):null;
 if(im){const h=TW*.42,w=h*im.naturalWidth/im.naturalHeight,dx=pet.tx-pet.x,dy=pet.ty-pet.y;if(pet.mv&&Math.abs(dx-dy)>.01)pet.fr=(dx-dy)>0; /* 화면 오른쪽으로 가면 뒤집기 */
  shadow(p.x,p.y,w*.38);cx.save();cx.translate(p.x,p.y-b);if(pet.fr)cx.scale(-1,1);if(pet.mv)cx.rotate(Math.sin(t*10)*.04);cx.drawImage(im,-w/2,-h+TW*.03,w,h);cx.restore();return}
 shadow(p.x,p.y,TW*.12);em(look.mas.e,p.x,p.y-TW*.17-b,TW*.3)}
/* ---------- 꾸밈 칸 그리기 ---------- */
const WP=[null,null,null,null,'brick','plank','tile','marble','gold','straw','dots','sakura','heart','night','fish','stripeY','stripeM','gingham','cloudw','wainscot','rainbow','dessert','damask'];
/* 🎀 새 벽지 무늬 (11/8): P(u,v) = 벽 위 점(u 가로 0~1, v 아래→위 0~1), L·H = 벽 길이·높이(px). 반짝임 없이 고정 무늬 */
const heart=(x,y,s,c)=>{cx.fillStyle=c;cx.beginPath();cx.moveTo(x,y+s*.35);cx.bezierCurveTo(x-s*.9,y-s*.25,x-s*.35,y-s*.95,x,y-s*.45);cx.bezierCurveTo(x+s*.35,y-s*.95,x+s*.9,y-s*.25,x,y+s*.35);cx.fill()};
const star5=(x,y,r,c)=>{cx.fillStyle=c;cx.beginPath();for(let i=0;i<10;i++){const a=-Math.PI/2+i*Math.PI/5,q=i%2?r*.45:r;cx.lineTo(x+Math.cos(a)*q,y+Math.sin(a)*q)}cx.closePath();cx.fill()};
const fr=x=>x-Math.floor(x);
const qd=(a,b,c,d,col)=>{cx.fillStyle=col;cx.beginPath();cx.moveTo(a.x,a.y);cx.lineTo(b.x,b.y);cx.lineTo(c.x,c.y);cx.lineTo(d.x,d.y);cx.closePath();cx.fill()};
const strp=(P,L,H,col)=>{const n=Math.max(4,Math.round(L/(H*.16)));for(let i=0;i<n;i++)qd(P(i/n,0),P((i+.42)/n,0),P((i+.42)/n,1),P(i/n,1),col)};
const grid=(L,H,sp,fn)=>{const cols=Math.max(2,Math.round(L/sp)),rows=Math.max(2,Math.round(H/sp));for(let j=0;j<rows;j++)for(let i=0;i<cols+1;i++)fn((i+.25+(j%2)*.5)/cols,(j+.5)/rows,i,j)};
const MOT={
 /* 🎨 11/13 새 벽지 */
 stripeY(P,L,H){strp(P,L,H,'rgba(255,214,90,.42)')},stripeM(P,L,H){strp(P,L,H,'rgba(120,205,160,.38)')},
 gingham(P,L,H){strp(P,L,H,'rgba(170,140,220,.22)');const n=Math.max(4,Math.round(H/(H*.16)));for(let j=0;j<n;j++){const v0=j/n,v1=(j+.42)/n;qd(P(0,v0),P(1,v0),P(1,v1),P(0,v1),'rgba(170,140,220,.22)')}},
 cloudw(P,L,H){const n=Math.round(L/H*7);cx.fillStyle='rgba(255,255,255,.92)';for(let k=0;k<n;k++){const p=P(fr(k*.618+.05),.25+fr(k*.414+.2)*.62),r=H*(.04+fr(k*.27)*.025);for(const [dx,dy,s] of[[-1.1,.2,.8],[0,0,1],[1.1,.2,.8],[.5,.35,.75],[-.5,.35,.75]]){cx.beginPath();cx.arc(p.x+dx*r,p.y+dy*r,r*s,0,7);cx.fill()}}},
 wainscot(P,L,H){qd(P(0,0),P(1,0),P(1,.38),P(0,.38),'#c99a64');const n=Math.max(3,Math.round(L/(H*.32)));cx.strokeStyle='rgba(110,65,25,.45)';cx.lineWidth=Math.max(1,H*.01);for(let i=0;i<n;i++){const a=(i+.12)/n,b=(i+.88)/n;const q=[P(a,.06),P(b,.06),P(b,.31),P(a,.31)];cx.beginPath();cx.moveTo(q[0].x,q[0].y);for(const z of q.slice(1))cx.lineTo(z.x,z.y);cx.closePath();cx.stroke()}
  qd(P(0,.37),P(1,.37),P(1,.42),P(0,.42),'#a8743e');qd(P(0,.42),P(1,.42),P(1,.435),P(0,.435),'rgba(255,255,255,.6)')},
 rainbow(P,L,H){const C=['#ffc2cc','#ffd9b0','#fff1a8','#c8f0c0','#bfe2ff','#dccbff'];for(let i=0;i<6;i++)qd(P(0,i/6),P(1,i/6),P(1,(i+1)/6),P(0,(i+1)/6),C[i])},
 dessert(P,L,H){const C=['#ffb3c6','#a8e6c8','#ffe28a','#cdb8ff'];grid(L,H*.85,H*.2,(u,v,i,j)=>{const p=P(u,v*.85),r=H*.045;cx.fillStyle=C[(i+j)%4];cx.beginPath();cx.ellipse(p.x,p.y-r*.35,r,r*.45,0,0,7);cx.ellipse(p.x,p.y+r*.35,r,r*.45,0,0,7);cx.fill();cx.fillStyle='#fffaf0';cx.fillRect(p.x-r*.95,p.y-r*.12,r*1.9,r*.24)});
  qd(P(0,.9),P(1,.9),P(1,1),P(0,1),'#fffaf0');const n=Math.max(6,Math.round(L/(H*.07)));cx.fillStyle='#fffaf0';for(let i=0;i<n;i++){const p=P((i+.5)/n,.9);cx.beginPath();cx.arc(p.x,p.y,H*.03*(1+.5*fr(i*.37)),0,7);cx.fill()}},
 damask(P,L,H){grid(L,H,H*.2,(u,v,i,j)=>{const p=P(u,v),s=H*.06;cx.fillStyle='rgba(216,180,90,.85)';cx.beginPath();cx.moveTo(p.x,p.y-s);cx.lineTo(p.x+s*.6,p.y);cx.lineTo(p.x,p.y+s);cx.lineTo(p.x-s*.6,p.y);cx.closePath();cx.fill();cx.fillStyle='#3e2a5c';cx.beginPath();cx.arc(p.x,p.y,s*.22,0,7);cx.fill()});
  qd(P(0,0),P(1,0),P(1,.04),P(0,.04),'#d8b45a');qd(P(0,.96),P(1,.96),P(1,1),P(0,1),'#d8b45a')},
 straw(P,L,H){const n=Math.max(4,Math.round(L/(H*.16)));for(let i=0;i<n;i++){const u0=i/n,u1=(i+.42)/n;const q=[P(u0,0),P(u1,0),P(u1,1),P(u0,1)];cx.fillStyle='rgba(255,140,175,.42)';cx.beginPath();cx.moveTo(q[0].x,q[0].y);for(const z of q.slice(1))cx.lineTo(z.x,z.y);cx.closePath();cx.fill();
  const m=P((u1+(i+1)/n)/2,0),m2_=P((u1+(i+1)/n)/2,1);cx.strokeStyle='rgba(255,255,255,.7)';cx.lineWidth=Math.max(1,H*.012);cx.beginPath();cx.moveTo(m.x,m.y);cx.lineTo(m2_.x,m2_.y);cx.stroke()}},
 dots(P,L,H){const C=['#ffb3c7','#9fd8ff','#ffd66b','#a8e6b8'];grid(L,H,H*.2,(u,v,i,j)=>{const p=P(u,v);cx.fillStyle=C[(i+j*2)%4];cx.beginPath();cx.arc(p.x,p.y,H*.036,0,7);cx.fill()})},
 sakura(P,L,H){const n=Math.round(L/H*14),r=H*.045;for(let k=0;k<n;k++){const p=P(fr(k*.618+.07),.08+fr(k*.381+.13)*.86);for(let i=0;i<5;i++){const a=i/5*Math.PI*2+k;cx.fillStyle=k%3?'#f7a8c4':'#ffc6d9';cx.beginPath();cx.arc(p.x+Math.cos(a)*r*.62,p.y+Math.sin(a)*r*.62,r*.5,0,7);cx.fill()}cx.fillStyle='#ffe08a';cx.beginPath();cx.arc(p.x,p.y,r*.3,0,7);cx.fill()}},
 heart(P,L,H){grid(L,H,H*.22,(u,v,i,j)=>{const p=P(u,v);heart(p.x,p.y,H*.075,(i+j)%2?'#ff7fa3':'#ffa9c2')})},
 night(P,L,H){const n=Math.round(L/H*22);for(let k=0;k<n;k++){const p=P(fr(k*.618+.11),.12+fr(k*.414+.3)*.84);if(k%4===0)star5(p.x,p.y,H*.045,'#ffe27a');else{cx.fillStyle=k%2?'rgba(255,255,255,.85)':'rgba(255,240,180,.7)';cx.beginPath();cx.arc(p.x,p.y,H*(k%3?.009:.014),0,7);cx.fill()}}
  const m=P(.72,.78);cx.fillStyle='rgba(255,242,176,.25)';cx.beginPath();cx.arc(m.x,m.y,H*.1,0,7);cx.fill();cx.fillStyle='#fff2b0';cx.beginPath();cx.arc(m.x,m.y,H*.065,0,7);cx.fill()},
 fish(P,L,H){grid(L,H,H*.24,(u,v,i,j)=>{const p=P(u,v);A.fish2(p.x,p.y,H*.0011,j%2?'#f2b544':'#e89a3c',{plain:true,sx:j%2?-1:1})})}};
const clipDo=(q,fn)=>{cx.save();cx.beginPath();cx.moveTo(q[0].x,q[0].y);for(const z of q.slice(1))cx.lineTo(z.x,z.y);cx.closePath();cx.clip();fn();cx.restore()};
function wallMotif(id,P,L,H,t){const f=MOT[WP[id]];if(f)f(P,L,H,t)}
const FLR=[['#cfc9bd','#c4beb2',0],['#f6f0e4','#d2a46a',1],['#d8a86c','#c99a5e',2],['#9ed27a','#8cc46a',3],['#bdb7aa','#a8a296',4],['#c8283c','#b01e30',5],['#9ad0ff','#c8a8ff',6],['#fff','#fff',7],['#d9a066','#c98d55',8],['#cfeaff','#bfe0fb',9],['#e2b47c','#d6a66e',10],['#fff','#fff',11],['#fff3d6','#f6cf6a',12],
 /* 🎨 11/13 추가: 13~16 = 새 무늬 */
 ['#fff8d8','#ffe7a0',1],['#eefaf3','#bfe8d0',1],['#f3ecfb','#dccbf2',1],['#f1e6d2','#e6d6bc',8],['#d6ebff','#c8e2ff',13],['#fdebf1','#f6d6e1',14],['#7a4a2e','#6a3e25',15],['#fbf7f0','#f1e9da',16]];
const PAS=['#ffd6e0','#cdf0dc','#fff1b8','#d4e9ff'];
const AWC=[['#e8584a','#fff6ec'],['#4a8ae8','#fff6ec'],['#4ab86a','#fff6ec'],['#ff8ab0','#fff0f6'],['#ffcf3a','#fff6ec'],['rb'],['#2a3a7a','#ffd23a'],['#ffb0c8','#fff0f6'],['#d4a020','#fff3c0']];
const RB=['#ff5a5a','#ff9a3a','#ffd93a','#6ccf5a','#4aa8ff','#a85aff'];
/* 먼 동네 (하늘이 비어 보이지 않게): 언덕 + 건물 실루엣, 밤엔 창문 불빛 */
function skyline(look,t){const Lc=iso(0,N),hz=OY+(Lc.y-OY)*.2,nt=look.night;
 cx.fillStyle=nt?'rgba(60,80,120,.55)':'rgba(170,215,160,.55)';cx.beginPath();cx.ellipse(90,hz+8,190,46,0,Math.PI,0);cx.ellipse(380,hz+10,170,38,0,Math.PI,0);cx.fill();
 for(let i=0;i<14;i++){const w=22+(i*37)%26,h=26+(i*53)%58,x=-8+i*34+(i%3)*4,y=hz-h;cx.fillStyle=nt?'rgba(40,52,90,.8)':'rgba(255,255,255,'+(.32+(i%3)*.08)+')';cx.beginPath();cx.roundRect(x,y,w,h+12,[5,5,0,0]);cx.fill();
  if(nt){cx.fillStyle='rgba(255,220,120,.85)';for(let r=0;r<Math.floor(h/14);r++)for(let q=0;q<2;q++)if((i+r*3+q)%3)cx.fillRect(x+5+q*(w-14),y+6+r*14,4,5)}}}
function drawSky(look,t){const g=cx.createLinearGradient(0,0,0,OY);g.addColorStop(0,look.sky[0]);g.addColorStop(1,look.sky[1]);cx.fillStyle=g;cx.fillRect(0,0,W,800);
 /* 🏞️ 그림 배경: 그림 속 땅이 시작하는 줄(hf)을 가게 벽 윗부분 높이에 맞춰 풍경이 벽 위로 보이게, 그 아래는 땅 색 */
 const bg=look.bg;if(bg&&bg.im&&bg.im.complete&&bg.im.naturalWidth){const im=bg.im,L_=iso(0,N),R_=iso(N,0),hz=(L_.y+R_.y)/2-WH*1.02,ar=im.naturalWidth/im.naturalHeight;let ih=Math.max(W/ar,hz/bg.hf),iw=ih*ar,iy=hz-ih*bg.hf;cx.fillStyle=bg.gr;cx.fillRect(0,iy+ih-2,W,800);cx.drawImage(im,(W-iw)/2,iy,iw,ih)}
 const pic=bg&&bg.im&&bg.im.complete&&bg.im.naturalWidth;if(!pic){skyline(look,t);
 if(look.night){cx.fillStyle='#fff';for(let i=0;i<30;i++){cx.globalAlpha=.4+.6*Math.abs(Math.sin(t*1.5+i));cx.beginPath();cx.arc((i*97)%W,(i*53)%Math.max(60,OY-WH-20)+60,1.4,0,7);cx.fill()}cx.globalAlpha=1;em('🌙',380,110,34)}
 else{em('☀️',385,120,46);cx.fillStyle='rgba(255,255,255,.8)';for(let i=0;i<4;i++){const x=m2(t*5+i*130,560)-60;cx.beginPath();cx.ellipse(x,100+i*16,30,9,0,0,7);cx.fill()}}}
 if(look.lit===5){for(let b=0;b<3;b++){const g2=cx.createLinearGradient(0,60,0,OY);const c=['120,255,200','180,120,255','120,200,255'][b];g2.addColorStop(0,'rgba('+c+',0)');g2.addColorStop(.5,'rgba('+c+','+(.18+.08*Math.sin(t+b))+')');g2.addColorStop(1,'rgba('+c+',0)');cx.fillStyle=g2;const x=60+b*130+Math.sin(t*.7+b)*30;cx.beginPath();cx.moveTo(x,60);cx.lineTo(x+70,60);cx.lineTo(x+120,OY);cx.lineTo(x+20,OY);cx.closePath();cx.fill()}}
 if(look.top===6){const cl=['255,90,120','255,200,60','120,220,255','160,255,140'];for(let b=0;b<4;b++){const ph=m2(t*.6+b*.27,1),bx=60+b*110,by=110+(b%2)*30,cc=cl[b];if(ph<.8){const u=ph/.8,rad=12+u*40;cx.fillStyle='rgba('+cc+','+(1-u)+')';for(let i=0;i<14;i++){const a=i/14*Math.PI*2;cx.beginPath();cx.arc(bx+Math.cos(a)*rad,by+Math.sin(a)*rad+u*u*12,2.4,0,7);cx.fill()}}}}}
function drawGround(look,t){const ground=look.bg&&look.bg.gr?look.bg.gr:look.xmas?(look.night?'#c8d4e2':'#eef3f8'):look.night?'#6f9a62':'#a8d890',Rc=iso(N,0),Bc=iso(N,N),Lc=iso(0,N);
 cx.fillStyle=ground;cx.beginPath();cx.moveTo(0,OY+(Lc.y-OY)*.2);cx.lineTo(W,OY+(Rc.y-OY)*.2);cx.lineTo(W,800);cx.lineTo(0,800);cx.closePath();cx.fill();
if(!FL){ /* 인도 (문 = 3시 쪽) */
 poly([iso(N,0),iso(N+3,0),iso(N+3,1),iso(N,1)],'#d8cbb6','#bba98e');for(let k=0;k<3;k++)poly([iso(N+k,0),iso(N+k+1,0),iso(N+k+1,1),iso(N+k,1)],null,'rgba(120,100,80,.25)',1)}
}
/* 마당 장식 (왼쪽·오른쪽): 가게 앞마당 양쪽, 바닥보다 앞에 그려서 잘리지 않게 (화면 밖으로도 덜 나가요) */
const SIDE_L=()=>({gx:Math.min(2.2,N*.3),gy:N+1.05}),SIDE_R=()=>({gx:N+1.05,gy:Math.min(N-.6,3.3)});
function drawSide(it,g){if(!it||!it.sz)return;const p=iso(g.gx,g.gy);shadow(p.x,p.y,it.sz*.3);const z=it.sz*TW/96*.8;em(it.e,p.x,p.y-z*.42,z)}
function drawWalls(look,t,items){const T=iso(0,0),Rc=iso(N,0),Lc=iso(0,N),wc=look.wall.c,wp=WP[look.wall.id];
 poly([T,Rc,up(Rc,WH),up(T,WH)],dark(wc,.08),dark(wc,.35));poly([Lc,T,up(T,WH),up(Lc,WH)],lite(wc,.05),dark(wc,.35));
 const lines=(n,col,lw,vert)=>{cx.strokeStyle=col;cx.lineWidth=lw;for(let i=1;i<n;i++){const u=i/n;if(vert){for(const [a,b] of [[iso(u*N,0),0],[iso(0,u*N),0]]){cx.beginPath();cx.moveTo(a.x,a.y);cx.lineTo(a.x,a.y-WH);cx.stroke()}}else{const h=WH*u;cx.beginPath();cx.moveTo(Lc.x,Lc.y-h);cx.lineTo(T.x,T.y-h);cx.lineTo(Rc.x,Rc.y-h);cx.stroke()}}};
 if(wp==='brick'){lines(7,'rgba(110,40,20,.35)',1.2,0);lines(N*4,'rgba(110,40,20,.18)',1,1)}
 else if(wp==='plank')lines(N*3,'rgba(90,50,20,.3)',1.4,1);
 else if(wp==='tile'){lines(6,'rgba(150,150,140,.4)',1,0);lines(N*3,'rgba(150,150,140,.4)',1,1)}
 else if(wp==='marble'){cx.strokeStyle='rgba(150,140,130,.35)';cx.lineWidth=1.2;for(let i=0;i<8;i++){const a=iso((i*.37%1)*N,0),b=iso(0,(i*.61%1)*N);cx.beginPath();cx.moveTo(a.x,a.y-WH*.2);cx.quadraticCurveTo(a.x+10,a.y-WH*.5,a.x-6,a.y-WH*.9);cx.stroke();cx.beginPath();cx.moveTo(b.x,b.y-WH*.15);cx.quadraticCurveTo(b.x-10,b.y-WH*.5,b.x+6,b.y-WH*.85);cx.stroke()}}
 else if(wp==='gold'){const g=cx.createLinearGradient(Lc.x,0,Rc.x,0);g.addColorStop(0,'rgba(255,255,255,0)');g.addColorStop(m2(t*.2,1),'rgba(255,255,255,.35)');g.addColorStop(1,'rgba(255,255,255,0)');poly([Lc,T,Rc,up(Rc,WH),up(T,WH),up(Lc,WH)],g)}
 else if(MOT[wp]){for(const [a,b] of [[Lc,T],[T,Rc]]){const P=(u,v)=>({x:a.x+(b.x-a.x)*u,y:a.y+(b.y-a.y)*u-v*WH});clipDo([P(0,0),P(1,0),P(1,1),P(0,1)],()=>MOT[wp](P,Math.hypot(b.x-a.x,b.y-a.y),WH,t))}}
 else if(look.wall.id===1||look.wall.id===2||look.wall.id===3){cx.fillStyle='rgba(255,255,255,.5)';for(let i=0;i<N*2;i++)for(let r=0;r<3;r++){const u=(i+.5)/(N*2),a=iso(u*N,0),b=iso(0,u*N);cx.beginPath();cx.arc(a.x,a.y-WH*(.22+r*.28),2,0,7);cx.fill();cx.beginPath();cx.arc(b.x,b.y-WH*(.22+r*.28),2,0,7);cx.fill()}}
 const trim=look.wall.id===8?'#b8860b':'#8a5a3a';poly([up(Lc,WH),up(T,WH),up(Rc,WH),up(Rc,WH+6),up(T,WH+6),up(Lc,WH+6)],trim);
 const win=(a,b)=>{const p=[up(a,WH*.36),up(b,WH*.36),up(b,WH*.8),up(a,WH*.8)];poly(p,look.night?'#2a3a6a':'#bfe6ff',trim,3);cx.strokeStyle=trim;cx.lineWidth=2;cx.beginPath();cx.moveTo((p[0].x+p[1].x)/2,(p[0].y+p[1].y)/2);cx.lineTo((p[2].x+p[3].x)/2,(p[2].y+p[3].y)/2);cx.stroke()};
 {const ws=(items||[]).filter(it=>isWallAt(it)),hasL=i=>ws.some(it=>it.x===-1&&it.y===i),hasR=i=>ws.some(it=>it.y===-1&&it.x===i);
  if(!hasL(N-2)&&!hasL(N-1))win(iso(0,N-1.5),iso(0,N-.5));if(!hasR(N-2)&&!hasR(N-1)&&!(FL||ST))win(iso(N-1.8,0),iso(N-.7,0))}
 if(!FL){
 /* 간판(메뉴판) + 차양: 카운터 위 오른쪽 벽 */
 const a=iso(0,2.2),b=iso(0,.45),sid=look.sign|0;
 const SB=[['#8a5a3a','#fff3c0'],['#ff8ab0','#fff'],['#2a3a32','#f0f0e0'],['#2a1a3a','#e8b0ff'],['#d4a020','#fff6d0'],['rb','#fff'],['#d4a020','#fff6d0'],['#1a2a5a','#fff6c0']][sid]||['#8a5a3a','#fff3c0'];
 const sp=[up(a,WH*.48),up(b,WH*.48),up(b,WH*.8),up(a,WH*.8)];
 if(SB[0]==='rb'){const g=cx.createLinearGradient(a.x,0,b.x,0);RB.forEach((c,i)=>g.addColorStop(i/5,c));poly(sp,g,'#5a3a22',2)}else poly(sp,SB[0],sid===3?'hsl('+((t*60)%360)+',100%,70%)':'#5a3a22',sid===3?3:2);
 const mc={x:(a.x+b.x)/2,y:(a.y+b.y)/2-WH*.64};tx(look.name,mc.x,mc.y,Math.max(11,Math.min(18,TW*.18)),SB[1],'center',SB[0]==='rb'?'#5a3a22':SB[0]);if(sid===6)em('👑',mc.x,mc.y-WH*.24,TW*.3);if(sid===7)for(let i=0;i<3;i++){cx.globalAlpha=.4+.6*Math.abs(Math.sin(t*2+i));em('✨',mc.x-TW*.6+i*TW*.6,mc.y-WH*.2,TW*.14);cx.globalAlpha=1}
 const ac=AWC[look.awn|0]||AWC[0],n=8;for(let i=0;i<n;i++){const u0=i/n,u1=(i+1)/n,p0=iso(1+u0*2,0),p1=iso(1+u1*2,0);const col=ac[0]==='rb'?RB[i%6]:i%2?ac[1]:ac[0];
  const top0=up(p0,WH*.58),top1=up(p1,WH*.58),bo0={x:top0.x+TW*.08,y:top0.y+TW*.2},bo1={x:top1.x+TW*.08,y:top1.y+TW*.2};poly([top0,top1,bo1,bo0],col,'rgba(0,0,0,.15)',1);
  cx.fillStyle=col;cx.beginPath();cx.arc((bo0.x+bo1.x)/2,(bo0.y+bo1.y)/2,Math.hypot(bo1.x-bo0.x,bo1.y-bo0.y)/2,0,Math.PI);cx.fill()}
 }
 /* 지붕 장식 (벽 윗줄) */
 const top=look.top|0;
 if(top===1){const cl=['#ff6a6a','#ffb04a','#6cc8ff','#7ed88a','#c08aff','#ff8ac0'];for(const [p0,p1] of [[Lc,T],[T,Rc]])for(let i=0;i<6;i++){const u=(i+.5)/6,x=p0.x+(p1.x-p0.x)*u,y=p0.y+(p1.y-p0.y)*u-WH-6+Math.sin(u*Math.PI)*8;A.fish2(x,y+8,TW*.0022,cl[i],{rot:Math.PI/2+Math.sin(t*2+i)*.25,plain:true})}}
 if(top===2){for(const p of [up(T,WH+20),up(Lc,WH+14),up(Rc,WH+14)])for(let i=0;i<3;i++){const c=['#ff6a8a','#ffd23a','#6cc8ff'][i];cx.fillStyle=c;cx.beginPath();cx.ellipse(p.x-14+i*14,p.y-i%2*8+Math.sin(t*1.6+i)*3,9,11,0,0,7);cx.fill()}}
 if(top===3){const p=up(T,WH+26);A.fish2(p.x,p.y+Math.sin(t*1.8)*2,TW*.009,'#ffcf3a',{glow:'rgba(255,220,80,.9)'})}
 if(top===4){const p=up(Rc,WH+4),q=up(T,WH+4);poly([p,q,up(q,30),up(p,30)],'#1a1a22','#555',2);cx.save();cx.beginPath();cx.moveTo(p.x,p.y);cx.lineTo(q.x,q.y);cx.lineTo(q.x,q.y-30);cx.lineTo(p.x,p.y-30);cx.closePath();cx.clip();cx.font='bold 16px "Jua",sans-serif';cx.fillStyle='#ffc850';cx.shadowColor='#ffb030';cx.shadowBlur=8;const msg='🐟 갓 구운 붕어빵 '+look.name+' 🐟  ';const w=cx.measureText(msg).width,ox=-m2(t*40,w);for(let k=0;k<3;k++)cx.fillText(msg,q.x+ox+k*w,(p.y+q.y)/2-8);cx.restore()}
 if(top===5){const p=up(T,WH+30);cx.save();cx.shadowColor='#ffd23a';cx.shadowBlur=14+6*Math.sin(t*2);em('👑',p.x,p.y,TW*.6);cx.restore()}
 /* 조명 */
 const lit=look.lit|0;
 if(lit===1){for(const [p0,p1] of [[Lc,T],[T,Rc]])for(let i=0;i<10;i++){const u=(i+.5)/10,x=p0.x+(p1.x-p0.x)*u,y=p0.y+(p1.y-p0.y)*u-WH+8+Math.sin(u*Math.PI)*6,c=['#ff6a5a','#ffd23a','#7ed88a','#7ec8ff'][(i+Math.floor(t*2))%4];cx.fillStyle=c;cx.shadowColor=c;cx.shadowBlur=8;cx.beginPath();cx.arc(x,y,3.4,0,7);cx.fill();cx.shadowBlur=0}}
 if(lit===2){for(let i=0;i<5;i++){const u=(i+.5)/5,p=i%2?iso(0,u*N):iso(u*N,0);em('⭐',p.x,p.y-WH*.88+Math.sin(t*2+i)*3,TW*.18)}}
 if(lit===3){cx.save();const c='hsl('+((t*60)%360)+',100%,65%)';cx.shadowColor=c;cx.shadowBlur=12;cx.strokeStyle=c;cx.lineWidth=3;cx.beginPath();cx.moveTo(Lc.x,Lc.y-WH+4);cx.lineTo(T.x,T.y-WH+4);cx.lineTo(Rc.x,Rc.y-WH+4);cx.stroke();cx.restore()}}
/* 🪜 계단: 입구 옆 칸(N-2,0)에 오른쪽 벽 쪽으로 올라가는 나무 계단 / 2층 같은 칸에 내려가는 구멍 + 난간(입구 쪽은 열림) */
function slab(x0,y0,x1,y1,z,h,col){const P=(x,y,zz)=>{const p=iso(x,y);return{x:p.x,y:p.y-zz}},lw=Math.max(1,TW*.014);
 poly([P(x0,y1,z),P(x1,y1,z),P(x1,y1,z+h),P(x0,y1,z+h)],dark(col,.22),OL,lw);poly([P(x1,y0,z),P(x1,y1,z),P(x1,y1,z+h),P(x1,y0,z+h)],dark(col,.1),OL,lw);poly([P(x0,y0,z+h),P(x1,y0,z+h),P(x1,y1,z+h),P(x0,y1,z+h)],col,OL,lw)}
function stairUp(){const x0=N-2+.06,x1=N-1-.06,s=WH*.13;for(let k=0;k<5;k++)slab(x0,0,x1,1-k*.19,k*s,s,k%2?'#c8925a':'#d6a26a');
 const c=iso(N-1.5,.55);badge(c.x+TW*.22,c.y-WH*.62,'⬆️','#8a5a3a')}
function stairHole(){const n=N,P=(a,b)=>iso(n-2+b,a);poly([P(.08,.08),P(.92,.08),P(.92,.92),P(.08,.92)],'#3a2618',OL,1.5);
 for(let k=1;k<5;k++){const u=k/5;poly([P(.08+u*.84,.1),P(.92,.1),P(.92,.9),P(.08+u*.84,.9)],'rgba(214,162,106,'+(.25+u*.15)+')')}}
function stairRail(){const n=N,h=WH*.28,lw=Math.max(2,TW*.03),a=iso(n-2+.06,.94),b=iso(n-1-.06,.94),c=iso(n-2+.06,.06);cx.strokeStyle='#8a5a3a';cx.lineWidth=lw;cx.lineCap='round';
 for(const [p,q] of [[a,b],[c,a]]){cx.beginPath();cx.moveTo(p.x,p.y-h);cx.lineTo(q.x,q.y-h);cx.stroke();for(let i=0;i<=3;i++){const u=i/3,x=p.x+(q.x-p.x)*u,y=p.y+(q.y-p.y)*u;cx.beginPath();cx.moveTo(x,y);cx.lineTo(x,y-h);cx.stroke()}}cx.lineCap='butt'}
/* ⚡ 11/12 VOC(1위 가게) '가게 화면 움직일 때 버벅': 바닥 칸(최대 121칸×무늬)은 안 바뀌니 한 번 그려 두고 끌 때는 붙이기만 */
let FC=null;
function floorBase(f){
 for(let gx=0;gx<N;gx++)for(let gy=0;gy<N;gy++){const pts=[iso(gx,gy),iso(gx+1,gy),iso(gx+1,gy+1),iso(gx,gy+1)];let c=f[0];
  if(f[2]===1&&(gx+gy)%2)c=f[1];if(f[2]===4)c=(gx*7+gy*3)%3?f[0]:f[1];
  if(f[2]===6){c=(gx+gy)%2?f[0]:f[1]}let st=f[2]===0||f[2]===2||f[2]===4||f[2]===10?'rgba(0,0,0,.08)':null,lw=1;
  if(f[2]===7){c=PAS[(gx+gy*2)%4];st='#fff';lw=2}if(f[2]===8)c=(gx+gy)%2?f[0]:f[1];if(f[2]===9){st='#fff';lw=1.6}if(f[2]===10)c=(gx+gy)%2?f[0]:f[1];if(f[2]===12){c=(gx+gy)%2?f[1]:f[0];st='rgba(200,150,60,.35)'}if(f[2]===14||f[2]===16){c=(gx+gy)%2?f[1]:f[0];st=f[2]===16?'rgba(212,170,80,.4)':'rgba(255,255,255,.6)'}if(f[2]===15)c='#4a2a18';if(f[2]===13)st='rgba(255,255,255,.5)';
  if(f[2]===11){for(let sx=0;sx<2;sx++)for(let sy=0;sy<2;sy++){const h=((gx*2+sx)+(gy*2+sy))*26%360;poly([iso(gx+sx/2,gy+sy/2),iso(gx+sx/2+.5,gy+sy/2),iso(gx+sx/2+.5,gy+sy/2+.5),iso(gx+sx/2,gy+sy/2+.5)],'hsl('+h+',75%,82%)','#fff',1.4)}}else poly(pts,c,st,lw);
  if(f[2]===8){cx.strokeStyle='rgba(110,60,25,.3)';cx.lineWidth=1;for(const v of[.33,.66]){const a=(gx+gy)%2?iso(gx,gy+v):iso(gx+v,gy),b=(gx+gy)%2?iso(gx+1,gy+v):iso(gx+v,gy+1);cx.beginPath();cx.moveTo(a.x,a.y);cx.lineTo(b.x,b.y);cx.stroke()}}
  if(f[2]===10){cx.strokeStyle='rgba(120,70,30,.18)';cx.lineWidth=1;for(const v of[.5]){const a=iso(gx,gy+v),b=iso(gx+1,gy+v);cx.beginPath();cx.moveTo(a.x,a.y);cx.lineTo(b.x,b.y);cx.stroke()}}
  if(f[2]===9){const q=iso(gx+.22,gy+.22);cx.fillStyle='rgba(255,255,255,.55)';cx.beginPath();cx.ellipse(q.x,q.y,TW*.06,TW*.03,0,0,7);cx.fill()}
  if(f[2]===12&&(gx+gy)%2){const q=iso(gx+.5,gy+.5);A.fish2(q.x,q.y,TW*.0034,'#e39a35',{plain:true,sy:.55})}
  if(f[2]===2){cx.strokeStyle='rgba(120,70,30,.2)';cx.lineWidth=1;for(const v of[.33,.66]){const a=iso(gx,gy+v),b=iso(gx+1,gy+v);cx.beginPath();cx.moveTo(a.x,a.y);cx.lineTo(b.x,b.y);cx.stroke()}}
  if(f[2]===3&&(gx*5+gy)%3===0)em('🌼',iso(gx+.5,gy+.5).x,iso(gx+.5,gy+.5).y,TW*.14)
  /* 🎨 11/13 새 바닥 무늬 */
  if(f[2]===13&&(gx*3+gy*5)%4===0){const q=iso(gx+.5,gy+.5),r=TW*.09;cx.fillStyle='rgba(255,255,255,.9)';for(const [dx,dy,s] of[[-1.1,.1,.8],[0,0,1],[1.1,.1,.8]]){cx.beginPath();cx.ellipse(q.x+dx*r,q.y+dy*r*.5,r*s,r*s*.5,0,0,7);cx.fill()}}
  if(f[2]===14||f[2]===16){const h=fr((gx*13+gy*7)*.618),a=iso(gx+h,gy),b=iso(gx+1-h*.6,gy+1),m=iso(gx+.5+(h-.5)*.6,gy+.5);cx.strokeStyle=f[2]===14?'rgba(220,130,160,.35)':'rgba(212,170,80,.6)';cx.lineWidth=f[2]===14?1:1.3;cx.beginPath();cx.moveTo(a.x,a.y);cx.quadraticCurveTo(m.x+TW*.08,m.y,b.x,b.y);cx.stroke()}
  if(f[2]===15){for(let sx=0;sx<2;sx++)for(let sy=0;sy<2;sy++){const x0=gx+sx/2+.04,y0=gy+sy/2+.04;poly([iso(x0,y0),iso(x0+.42,y0),iso(x0+.42,y0+.42),iso(x0,y0+.42)],(sx+sy)%2?f[1]:f[0],'#4a2a18',1);cx.strokeStyle='rgba(255,220,190,.35)';cx.lineWidth=1;const a=iso(x0+.05,y0+.05),b=iso(x0+.37,y0+.05);cx.beginPath();cx.moveTo(a.x,a.y);cx.lineTo(b.x,b.y);cx.stroke()}}}
 if(f[2]===5){poly([iso(.3,.3),iso(N-.3,.3),iso(N-.3,N-.3),iso(.3,N-.3)],null,'#f0c040',3)}
 if(f[2]===10){const c=iso(N/2,N/2),R=TW*Math.min(1.7,N*.3);cx.save();cx.translate(c.x,c.y);cx.scale(1,.5);
  cx.fillStyle='#f6dfb8';cx.strokeStyle='#c9945e';cx.lineWidth=5;cx.beginPath();cx.arc(0,0,R,0,7);cx.fill();cx.stroke();cx.setLineDash([6,6]);cx.lineWidth=2;cx.strokeStyle='rgba(201,148,94,.7)';cx.beginPath();cx.arc(0,0,R*.86,0,7);cx.stroke();cx.setLineDash([]);
  const r=R*.42;cx.fillStyle='#c98a54';for(const sx of[-1,1]){cx.beginPath();cx.arc(sx*r*.72,-r*.72,r*.38,0,7);cx.fill()}cx.beginPath();cx.arc(0,0,r,0,7);cx.fill();
  cx.fillStyle='#f6dfb8';cx.beginPath();cx.ellipse(0,r*.28,r*.48,r*.36,0,0,7);cx.fill();cx.fillStyle='#4a2c18';for(const sx of[-1,1]){cx.beginPath();cx.arc(sx*r*.36,-r*.14,r*.1,0,7);cx.fill()}cx.beginPath();cx.ellipse(0,r*.16,r*.14,r*.1,0,0,7);cx.fill();
  cx.fillStyle='rgba(255,130,150,.55)';for(const sx of[-1,1]){cx.beginPath();cx.arc(sx*r*.62,r*.18,r*.12,0,7);cx.fill()}cx.restore()}
}
function drawFloor(look,t,edit,items){const f=FLR[look.floor|0]||FLR[0];
 if(f[2]===12||f[2]===3||typeof document==='undefined')floorBase(f);else{
  const key=[look.floor|0,N,TW,FL].join(','),m=8,w=Math.ceil(N*TW+2*m),h=Math.ceil(N*TH+2*m);
  if(!FC||FC.key!==key){try{const c=FC&&FC.c||document.createElement('canvas');c.width=w;c.height=h;const g=c.getContext('2d'),o=cx,ox=OX,oy=OY;cx=g;OX=m+N*TW/2;OY=m;try{floorBase(f)}finally{cx=o;OX=ox;OY=oy}FC={key,c}}catch(e){FC=null}}
  if(FC)cx.drawImage(FC.c,OX-N*TW/2-m,OY-m);else floorBase(f)}
 if(f[2]===6)for(let i=0;i<8;i++){const p=iso((i*.37%1)*N,(i*.71%1)*N);cx.globalAlpha=.3+.7*Math.abs(Math.sin(t*1.6+i));em('✨',p.x,p.y,TW*.14);cx.globalAlpha=1}
 /* 꾸미는 중: 손님이 걷는 길(문→카운터)을 옅게, 꼭 비울 칸은 진하게 */
 const rt=edit?(mainRoute(items||[])||[]):[];const on=new Set(rt.map(p=>p.gx+','+p.gy));
 for(let gx=0;gx<N;gx++)for(let gy=0;gy<N;gy++){const rs=isPath(gx,gy);if(!rs&&!on.has(gx+','+gy))continue;cx.globalAlpha=edit?(rs?.42:.2):.1;poly([iso(gx+.12,gy+.12),iso(gx+.88,gy+.12),iso(gx+.88,gy+.88),iso(gx+.12,gy+.88)],'#fff');cx.globalAlpha=1;if(edit&&rs){const c=iso(gx+.5,gy+.5);em(FL||(ST&&gx===0)?'🪜':gy===1?'🧾':'🚪',c.x,c.y,TW*.2)}}
 const Lc=iso(0,N),Bc=iso(N,N),Rc=iso(N,0);poly([Lc,Bc,up(Bc,-8),up(Lc,-8)],dark(f[0],.3));poly([Bc,Rc,up(Rc,-8),up(Bc,-8)],dark(f[0],.42));
 if(FL)stairHole();else poly([iso(N-.08,.1),iso(N+.4,.1),iso(N+.4,.9),iso(N-.08,.9)],'#c84a3a')} /* 문 앞 발판 (3시) · 2층은 계단 구멍 */
/* ---------- 직원 (경영에서 뽑은 알바만 보여요) ---------- */
function apron(x,y,s,col){const w=s*.46,h=s*.4,ty=y+s*.3;cx.globalAlpha=.94;rr(x-w/2,ty,w,h,s*.08,col);cx.globalAlpha=1;rr(x-w*.2,ty+h*.38,w*.4,h*.3,s*.04,'rgba(255,255,255,.5)');cx.strokeStyle=col;cx.lineWidth=Math.max(1.5,s*.03);cx.beginPath();cx.moveTo(x-w*.42,ty+2);cx.lineTo(x-w*.2,ty-s*.12);cx.moveTo(x+w*.42,ty+2);cx.lineTo(x+w*.2,ty-s*.12);cx.stroke()}
function badge(x,y,e,col){const r=TW*.11;cx.fillStyle='#fff';cx.beginPath();cx.arc(x,y,r,0,7);cx.fill();cx.strokeStyle=col;cx.lineWidth=2.5;cx.stroke();em(e,x,y,r*1.35)}
const SCOL={bake:'#e8a840',serve:'#ff8ab0',promo:'#ff9a3a',barista:'#3a8a5a'};
/* 직원 전용 그림(img/st_*.webp)이 있으면 그 그림, 없으면 예전처럼 손님 그림 + 앞치마 */
const stImg=k=>{const im=window.ART_IMG&&window.ART_IMG['st_'+k];return!!(im&&im.complete&&im.naturalWidth)};
const stKey=(k,e)=>stImg(k)?'st_'+k:e;
/* 카운터 뒤 직원: 발이 카운터에 가려지게 (발 = 카운터 윗면보다 조금 아래). 왼쪽부터 🐼 바리스타 · 사장님 · 🐶 굽기 알바 */
const behind=(gx,gy,sc)=>{const p=iso(gx,gy),s=TW*sc;return{x:p.x,y:p.y-TW*.30-s*.9,s}};
function staffBack(t,look){const S=look.staff||{};
 if(look.cafe&&S.barista>0){const q=behind(1.42,.3,.36);animal(stKey('barista','🐼'),q.x,q.y,q.s,{t,ph:3,mood:'h'});
  const ph=m2(t*.9,1);cx.fillStyle='rgba(255,255,255,'+(.6*(1-ph))+')';cx.beginPath();cx.ellipse(q.x+q.s*.4,q.y+q.s*.2-ph*q.s*.3,3+ph*3,2+ph*2,0,0,7);cx.fill()}}
function staffBack2(t,look){const S=look.staff||{};
 if(S.bake>0){const q=behind(2.85,.32,.36);animal(stKey('bake','🐶'),q.x,q.y,q.s,{t,ph:5,mood:'h'});
  const hop=m2(t*.8,1);if(hop<.5){const u=hop/.5;A.bread(q.x-q.s*.42,q.y+q.s*.55-Math.sin(u*Math.PI)*q.s*.55,TW*.0024,'#f0b850',{rot:u*Math.PI*2,plain:true})}}}
/* 앞쪽 직원: 🐰 계산 알바는 카운터 왼쪽 바닥(계산대), 🦊 홍보 알바는 입구 앞 길가 */
/* 🦙 11/14 점장 키우기: 몽실이는 카운터 앞쪽 빈 칸에 서 있어요 (가구 없는 칸만) */
function mgFront(t,look,items,L){if(!look.mg||FL)return;const im=window.ART_IMG&&window.ART_IMG[look.mg];if(!im||!im.complete||!im.naturalWidth)return;
 const sp=cl.x!=null?{x:cl.x,y:cl.y}:mgSpot(items);if(!sp)return;const gx=sp.x,gy=sp.y;
 L.push({z:gx+gy+.3,f:()=>{const p=iso(gx,gy),h=TW*.68*im.naturalHeight/230,w=h*im.naturalWidth/im.naturalHeight,mv=cl.x!=null&&cl.mv,b=mv?Math.abs(Math.sin(t*10))*TW*.035:Math.abs(Math.sin(t*1.8))*TW*.025,wp=cl.st==='wipe';shadow(p.x,p.y,w*.3);
  cx.save();cx.translate(p.x,p.y-b+TW*.03);if(wp)cx.rotate(Math.sin(t*14)*.08);if(cl.fl)cx.scale(-1,1);cx.drawImage(im,-w/2,-h,w,h);cx.restore();
  if(wp&&cl.j){const q=iso(cl.j.x,cl.j.y),qy=q.y-(cl.j.on?TW*.3:0);for(let i=0;i<3;i++){const u=(t*1.6+i/3)%1;cx.globalAlpha=1-u;em('🫧',q.x+Math.sin(t*5+i*2)*TW*.12,qy-u*TW*.35,TW*.13);cx.globalAlpha=1}}
  for(let i=0;i<cl.carry;i++)em('🍽️',p.x,p.y-h-b-TW*.02-i*TW*.05,TW*.17);
  if(cl.bub&&cl.bt>0)bubble(p.x,p.y-h-b-TW*.12,cl.bub,Math.min(1,cl.bt*3))}})}
function staffFront(t,look,L){const S=look.staff||{};
 /* 🏢 2호 알바 (2층이 생기면, 그림 있을 때만): 🐹 굽기 2호는 카운터 오른쪽 옆(벽 쪽, 줄 서는 길 밖) · 🐧 계산 2호는 🐰 옆에서 포장 */
 if(S.bake2>0&&stImg('bake2')){const gx=3.38,gy=.36;L.push({z:gx+gy+.3,f:()=>{const p=iso(gx,gy),s=TW*.37,hop=m2(t*.7+.5,1),y=p.y-s*.88;shadow(p.x,p.y,s*.3);animal('st_bake2',p.x,y,s,{t,ph:11,mood:'h'});
  if(hop<.4){const u=hop/.4;A.bread(p.x+s*.36,y+s*.45-Math.sin(u*Math.PI)*s*.5,TW*.0022,'#f0b850',{rot:-u*Math.PI*2,plain:true})}}})}
 if(S.serve2>0&&stImg('serve2')){const gx=.5,gy=1.32;L.push({z:gx+gy+.3,f:()=>{const p=iso(gx,gy),s=TW*.36,y=p.y-s*.88;shadow(p.x,p.y,s*.3);animal('st_serve2',p.x,y,s,{t,ph:13,mood:'h',tilt:Math.sin(t*2.2)*.04})}})}
 if(S.serve>0){const gx=.5,gy=.42;L.push({z:gx+gy+.3,f:()=>{const p=iso(gx,gy),s=TW*.38,y=p.y-s*.88;shadow(p.x,p.y,s*.3);
  const q=iso(gx+.32,gy+.18);rr(q.x-s*.26,q.y-s*.62,s*.52,s*.62,5,'#a8744a');cx.strokeStyle=OL;cx.lineWidth=Math.max(1.4,TW*.02);cx.beginPath();cx.roundRect(q.x-s*.26,q.y-s*.62,s*.52,s*.62,5);cx.stroke();
  animal(stKey('serve','🐰'),p.x,y,s,{t,ph:7,mood:'h'});if(!stImg('serve'))apron(p.x,y,s,SCOL.serve);
  rr(q.x-s*.2,q.y-s*.86,s*.4,s*.26,4,'#7a7a86');rr(q.x-s*.16,q.y-s*.82,s*.32,s*.09,2,'#bfe8bf');badge(p.x-s*.5,y-s*.3,'🧾',SCOL.serve)}})}
 if(S.promo>0){const gx=N+.5,gy=1.75; /* 입구(3시) 옆 길가 (인도·옆 장식과 안 겹치게) */L.push({z:gx+gy,f:()=>{const p=iso(gx,gy),s=TW*.38,w=Math.sin(t*5),y=p.y-s*.88-Math.abs(w)*2;shadow(p.x,p.y,s*.3);animal(stKey('promo','🦊'),p.x,y,s,{t,ph:9,mood:'h',tilt:w*.05});if(!stImg('promo')){apron(p.x,y,s,SCOL.promo);
  cx.save();cx.translate(p.x+s*.48,y+s*.35);cx.rotate(-.3+w*.25);em('📄',0,0,s*.34);cx.restore()}badge(p.x-s*.56,y-s*.5,'📣',SCOL.promo);
  const ph=t%8;const ms=look.cafe?['🐟 따끈한 붕어빵!','어서 오세요~','☕ 커피도 있어요!','오늘 맛있어요!']:['🐟 따끈한 붕어빵!','어서 오세요~','오늘 맛있어요!'];if(ph<2.4)bubble(p.x,y-s*.82,ms[Math.floor(t/8)%ms.length],Math.min(1,(2.4-ph)*3,ph*3))}})}}
/* 가게 등급이 오르면 카운터 주변이 커져요: 1 메뉴판 · 3 펜던트 조명 · 4 줄전구 · 5 빵 바구니 · 6 네온 붕어
   벽에 붙는 것(메뉴판·조명·줄전구·네온)은 사장님보다 먼저(wall=true), 빵 바구니만 나중에 그려요 → 사장님 얼굴을 안 가려요 */
/* ---------- 🖼️ 벽 장식 그리기 ---------- */
function wPos(sl,hf){return sl.x===-1?{c:up(iso(0,sl.y+.5),WH*hf),k:-.5}:{c:up(iso(sl.x+.5,0),WH*hf),k:.5}}
function wSlotPoly(sl,hf){const a=sl.x===-1?[iso(0,sl.y+.1),iso(0,sl.y+.9)]:[iso(sl.x+.1,0),iso(sl.x+.9,0)];return[up(a[0],WH*(hf-.2)),up(a[1],WH*(hf-.2)),up(a[1],WH*(hf+.2)),up(a[0],WH*(hf+.2))]}
function drawWallItem(it,t,sel){drawWallItem0(it,t,sel);const s=it.s|0;if(s&&WK[it.k]){const {c}=wPos(it,WK[it.k].h||.56);starFx(c.x,c.y+TW*.22,TW*.5,TW*.45,s,t,it.x*7+it.y*13+5,sel);if(sel)starTag(c.x,c.y+TW*.3,s)}}
function drawWallItem0(it,t,sel){const f=WK[it.k];if(!f)return;const hf=f.h||.56,{c,k}=wPos(it,hf),im=wImg(it.k);
 let w=TW*.42*(f.s||1),h=im?w*im.naturalHeight/im.naturalWidth:w;if(h>WH*.5){w*=WH*.5/h;h=WH*.5}
 const b=BNC.get(it),u=b!=null?(performance.now()-b)/480:1,sc=u<1?1+Math.sin(u*Math.PI*3)*.12*(1-u):1;
 cx.save();cx.translate(c.x,c.y);cx.transform(1,k,0,1,0,0);cx.scale(sc,sc);
 if(f.glow){const gl=.6+.4*Math.sin(t*3+it.x+it.y);cx.fillStyle=it.k==='w_neon'?'rgba(120,220,255,'+(.25*gl)+')':'rgba(255,215,90,'+(.25*gl)+')';cx.beginPath();cx.arc(0,0,w*.75,0,7);cx.fill()}
 cx.shadowColor='rgba(60,30,10,.28)';cx.shadowBlur=3;cx.shadowOffsetX=2;cx.shadowOffsetY=3;
 if(im)cx.drawImage(im,-w/2,-h/2,w,h);else em(f.e,0,0,w*.95);cx.restore();
 if(sel){cx.save();cx.setLineDash([5,4]);poly(wSlotPoly(it,hf),null,'#ffcf3a',2.5);cx.restore()}}
function drawWallItems(items,t,o){const ws=(items||[]).filter(it=>isWallAt(it));
 if(o.wedit){const fr=wallSlots().filter(sl=>!wallItemAt(ws,sl));cx.save();cx.setLineDash([5,4]);cx.globalAlpha=.55+.25*Math.sin(t*5);for(const sl of fr)poly(wSlotPoly(sl,.56),'rgba(140,230,140,.28)','#3a9a4a',2);cx.restore()}
 for(const it of ws)drawWallItem(it,t,o.sel===it)}
/* 화면 좌표 → 벽 칸 (없으면 null) */
function wallAt(px,py,n){for(const sl of wallSlots(n)){const {c,k}=wPos(sl,.56),dx=px-c.x,dy=py-(c.y+k*dx);if(Math.abs(dx)<TW*.25&&Math.abs(dy)<WH*.26)return sl}return null}
function counterUp(t,look,wall){const g=(look&&look.g)|0,lw=Math.max(1.4,TW*.024);if(g<1)return;if(!wall){if(g>=5){const p=iso(3.25,.35);em('🧺',p.x,p.y-TW*.12,TW*.3);em('🥖',p.x+TW*.05,p.y-TW*.24,TW*.18)}return}
 if(g>=1){const a=up(iso(1.1,0),WH*.97),b=up(iso(2.9,0),WH*.97),c=up(iso(2.9,0),WH*.74),d=up(iso(1.1,0),WH*.74);poly([a,b,c,d],g>=5?'#2a3a2e':'#3e3228',g>=5?'#d4a020':OL,lw);
  const m={x:(a.x+c.x)/2,y:(a.y+c.y)/2},h=(d.y-a.y);cx.save();cx.translate(m.x,m.y);cx.transform(1,.5,0,1,0,0);tx('MENU',0,-h*.28,Math.max(7,TW*.1),'#fff6d0','center','#3e3228');
  const L=['🫘','🍮','🧀','🍠','🍫','🌟'].slice(0,Math.min(6,2+g));L.forEach((e,i)=>em(e,(i-(L.length-1)/2)*TW*.17,h*.12,Math.max(7,TW*.11)));cx.restore()}
 if(g>=3)for(const gx of[1.5,2.5]){const top=up(iso(gx,.45),WH*1.02),lp=up(iso(gx,.45),WH*.68);cx.strokeStyle='#3a2a1a';cx.lineWidth=1.2;cx.beginPath();cx.moveTo(top.x,top.y);cx.lineTo(lp.x,lp.y);cx.stroke();
  cx.fillStyle='rgba(255,230,150,.28)';cx.beginPath();cx.arc(lp.x,lp.y+TW*.05,TW*.22,0,7);cx.fill();cx.fillStyle=g>=5?'#d4a020':'#e8584a';cx.beginPath();cx.moveTo(lp.x-TW*.09,lp.y+TW*.05);cx.lineTo(lp.x+TW*.09,lp.y+TW*.05);cx.lineTo(lp.x+TW*.04,lp.y-TW*.03);cx.lineTo(lp.x-TW*.04,lp.y-TW*.03);cx.closePath();cx.fill();cx.fillStyle='#fff6c0';cx.beginPath();cx.arc(lp.x,lp.y+TW*.06,TW*.03,0,7);cx.fill()}
 if(g>=4){const C=['#ff6a5a','#ffd23a','#5ad07a','#5ab4ff','#ff9ad0'];for(let i=0;i<=16;i++){const u=i/16,p=up(iso(.2+u*Math.min(N-.4,5.6),0),WH*.99-Math.sin(u*Math.PI*4)*WH*.04);cx.globalAlpha=.55+.45*Math.abs(Math.sin(t*2+i));cx.fillStyle=C[i%5];cx.beginPath();cx.arc(p.x,p.y,Math.max(1.6,TW*.028),0,7);cx.fill()}cx.globalAlpha=1}
 if(g>=6){const p=up(iso(.5,0),WH*.74),gl=.6+.4*Math.sin(t*3);cx.fillStyle='rgba(255,120,200,'+(.22*gl)+')';cx.beginPath();cx.arc(p.x,p.y,TW*.38,0,7);cx.fill();em('🐟',p.x,p.y,TW*.42,.85+.15*gl)}}
function drawCounter(t,look){const S=(look&&look.staff)||{},cafe=!!(look&&look.cafe),cq=behind(S.bake>0||(cafe&&S.barista>0)?2.08:2,.35,.44);staffBack(t,look||{});staffBack2(t,look||{});animal('cook',cq.x,cq.y,cq.s,{t,ph:0,mood:'h',shirt:'#ffffff'});
 const H0=TW*.34,lw=Math.max(1.6,TW*.026);
 /* 매대 앞면 이름표 (비스듬한 면에 맞춰 기울여 그려요) */
 const plate=(b,txt,bg,fg)=>{const L=b.L,B=b.B,c={x:(L.x+B.x)/2,y:(L.y+B.y)/2+H0*.5};cx.save();cx.translate(c.x,c.y);cx.transform(1,.5,0,1,0,0);const w=TW*.36,h=TW*.15;
  rr(-w/2,-h/2,w,h,h*.35,bg);cx.strokeStyle=OL;cx.lineWidth=lw*.8;cx.beginPath();cx.roundRect(-w/2,-h/2,w,h,h*.35);cx.stroke();tx(txt,0,1,Math.max(8,TW*.076),fg,'center',bg);cx.restore()};
 /* ☕ 왼쪽: 카페를 열면 커피 매대(초록), 아니면 주문대 */
 const bL=box(1,0,.06,H0,cafe?'#5a8a64':'#b97d4a',{top:cafe?'#efe6d6':'#d9a06a'});
 if(cafe){/* 에스프레소 머신 */const q=iso(1.2,.42),w=TW*.34,h=TW*.3,x=q.x-w/2,y=q.y-H0-h;
  rr(x,y,w,h,6,'#c9ccd2');cx.strokeStyle=OL;cx.lineWidth=lw;cx.beginPath();cx.roundRect(x,y,w,h,6);cx.stroke();rr(x+3,y+3,w-6,h*.22,3,'#8a8e98');
  cx.fillStyle='#e8584a';cx.beginPath();cx.arc(x+w*.82,y+h*.14,TW*.022,0,7);cx.fill();
  for(const u of[.3,.7]){rr(x+w*u-TW*.04,y+h*.42,TW*.08,h*.14,2,'#3a3a40')}
  rr(x+w*.12,y+h*.86,w*.76,h*.1,2,'#5a5e68');
  rr(x+w*.22,y+h*.6,TW*.07,h*.24,2,'#fff');rr(x+w*.62,y+h*.6,TW*.07,h*.24,2,'#fff');
  const ph=m2(t*.8,1);cx.fillStyle='rgba(255,255,255,'+(.6*(1-ph))+')';cx.beginPath();cx.ellipse(x+w*.3,y-4-ph*TW*.3,3+ph*4,2+ph*3,0,0,7);cx.fill();
  /* 컵 쌓기 */const c=iso(1.74,.66);for(let i=0;i<3;i++){const cy=c.y-H0-TW*.07*(i+1);rr(c.x-TW*.055,cy,TW*.11,TW*.08,2,'#fff');cx.strokeStyle='rgba(90,58,34,.6)';cx.lineWidth=1;cx.beginPath();cx.roundRect(c.x-TW*.055,cy,TW*.11,TW*.08,2);cx.stroke();rr(c.x-TW*.055,cy+TW*.03,TW*.11,TW*.025,0,'#a8744a')}
  plate(bL,'☕ 커피','#2f4a3a','#ffe9a0')}
 else{const q=iso(1.5,.5);em('🧺',q.x,q.y-H0-TW*.08,TW*.26);plate(bL,'🧾 주문','#fff3dc','#8a3a1a')}
 /* 🐟 오른쪽: 유리 진열장 붕어빵 매대 */
 const bR=box(2,0,.06,H0,'#b97d4a',{top:'#d9a06a'});
 const gT=TW*.2,m=.12,P=(a,b,h)=>up(iso(2+a,b),H0+h);
 poly([P(m,m,0),P(1-m,m,0),P(1-m,1-m,0),P(m,1-m,0)],'#f6e2c0');
 for(const r of[.36,.66])for(let i=0;i<3;i++){const p=P(.24+i*.26,r,TW*.03);A.bread(p.x,p.y,TW*.0026,'#e8a840',{plain:true})}
 cx.globalAlpha=.32;poly([P(m,1-m,0),P(1-m,1-m,0),P(1-m,1-m,gT),P(m,1-m,gT)],'#cfefff');poly([P(1-m,1-m,0),P(1-m,m,0),P(1-m,m,gT),P(1-m,1-m,gT)],'#b8e2f8');poly([P(m,m,gT),P(1-m,m,gT),P(1-m,1-m,gT),P(m,1-m,gT)],'#e8f8ff');cx.globalAlpha=1;
 cx.strokeStyle='rgba(255,255,255,.9)';cx.lineWidth=lw;for(const [a,b] of [[P(m,1-m,gT),P(1-m,1-m,gT)],[P(1-m,1-m,gT),P(1-m,m,gT)],[P(m,m,gT),P(1-m,m,gT)],[P(m,m,gT),P(m,1-m,gT)],[P(m,1-m,0),P(m,1-m,gT)],[P(1-m,1-m,0),P(1-m,1-m,gT)],[P(1-m,m,0),P(1-m,m,gT)]]){cx.beginPath();cx.moveTo(a.x,a.y);cx.lineTo(b.x,b.y);cx.stroke()}
 {const a=P(.3,1-m,gT*.85),b=P(.45,1-m,gT*.2);cx.strokeStyle='rgba(255,255,255,.75)';cx.lineWidth=2;cx.beginPath();cx.moveTo(a.x,a.y);cx.lineTo(b.x,b.y);cx.stroke()}
 const st=P(.5,.5,gT);for(let i=0;i<2;i++){const ph=m2(t*.9+i*.5,1);cx.fillStyle='rgba(255,255,255,'+(.55*(1-ph))+')';cx.beginPath();cx.ellipse(st.x-TW*.14+i*TW*.28,st.y-TW*.08-ph*TW*.38,4+ph*5,3+ph*4,0,0,7);cx.fill()}
 plate(bR,'🐟 붕어빵','#8a3a1a','#fff3c0')}
function drawChandelier(look,t){if((look.lit|0)!==4)return;const c=iso(N/2,N/2);const y=c.y-WH*.95;cx.strokeStyle='#c89010';cx.lineWidth=2;cx.beginPath();cx.moveTo(c.x,y-30);cx.lineTo(c.x,y);cx.stroke();const g=cx.createRadialGradient(c.x,y,4,c.x,y,TW*1.2);g.addColorStop(0,'rgba(255,240,170,.5)');g.addColorStop(1,'rgba(255,240,170,0)');cx.fillStyle=g;cx.beginPath();cx.arc(c.x,y,TW*1.2,0,7);cx.fill();em('🔮',c.x,y+8,TW*.36)}
/* ---------- 전체 ---------- */
function draw(t,look,items,o={}){FL=look.f2v?1:0;ST=look.st?1:0;JK=o.junk&&!FL?1:0;CAFE=look.cafe?1:0;MGI=look.mg&&window.ART_IMG&&window.ART_IMG[look.mg]&&window.ART_IMG[look.mg].naturalWidth?look.mg:null;layout(look.n,o.top||64,o.bottom||520,o.fit);
 drawSky(look,t);drawGround(look,t);drawWalls(look,t,items);drawWallItems(items,t,o);drawFloor(look,t,o.edit,items);
 const L=[];for(const it of items)if(FK[it.k]&&inRoom(it.x,it.y))L.push({z:(()=>{const C=cells(it);return C.reduce((a,q)=>a+q.x+q.y,0)/C.length})()+1+(FK[it.k].flat?-.9:0),f:()=>drawB(it,t,o.sel===it)});
 if(FL)L.push({z:N,f:stairRail});else{if(ST)L.push({z:N,f:stairUp});
 L.push({z:.2,f:()=>counterUp(t,look,true)});L.push({z:1.4,f:()=>{drawCounter(t,look);counterUp(t,look,false)}});{const a=SIDE_L(),b=SIDE_R();L.push({z:a.gx+a.gy,f:()=>drawSide(look.sL,a)});L.push({z:b.gx+b.gy,f:()=>drawSide(look.sR,b)})}mgFront(t,look,items,L);staffFront(t,look,L);if(look.mas&&look.mas.e&&look.mas.e!=='➖')L.push({z:pet.x+pet.y,f:()=>drawPet(look,t)})}
 if(!o.noCust)for(const c of FL?cust2:cust)L.push({z:c.x+c.y+(c.st==='sit'?.05:0),f:()=>drawCust(c,t)});
 if(!o.noCust){for(const c of FL?cust2:cust)if(c.st==='sit'&&c.tb&&items.includes(c.tb.it)){const C=cells(c.tb.it),z=C.reduce((a,q)=>a+q.x+q.y,0)/C.length+1.02;L.push({z,f:()=>drawFood(c,t)})}
  if(JK)for(const j of junk){const C=cells(j.it),z=j.on?C.reduce((a,q)=>a+q.x+q.y,0)/C.length+1.02:j.x+j.y+.02;L.push({z,f:()=>drawJunk(j,t)})}}
 L.sort((a,b)=>a.z-b.z).forEach(q=>q.f());drawChandelier(look,t);
 if(look.xmas&&window.SNOW)SNOW(cx,t,40,Math.min(800,OY+N*TH+40),Math.round(30+N*3));
 if(!FL)for(const f of fx){cx.globalAlpha=Math.max(0,f.l);em(f.e,f.x,f.y-(1-f.l)*30,22);cx.globalAlpha=1}
 if(o.ghost&&o.ghost.ok!==undefined){const g=o.ghost;cx.globalAlpha=.5+.2*Math.sin(t*6);for(const q of(g.k?cellsOf(g.k,g.x,g.y,g.d):[{x:g.x,y:g.y}]))poly([iso(q.x,q.y),iso(q.x+1,q.y),iso(q.x+1,q.y+1),iso(q.x,q.y+1)],g.ok?'rgba(120,220,120,.5)':'rgba(255,90,90,.5)');cx.globalAlpha=1}}
function tick(dt,items,rate){if(FL){step2(dt,items);return}step(dt,items,rate);petStep(dt,items)}
return{isStair:(x,y,n)=>isSt(x,y,n),STT,wallMotif,isWide,cells,occAt,fitAt,nextRot,fixWide,fixDoor,seatCount,imgReady:k=>WK[k]?(!WIMG.has(k)||!!wImg(k)):!FK[k]||FK[k].noimg||!(FK[k].emo||FIMG[k])||!!fuImg(k),WFUR,WK,CK,wallSlots,wallAt:(x,y,n)=>wallAt(x,y,n),wallItemAt,isWallAt,bounce,get cust(){return cust},qLine:it=>qLine(it),FUR,FK,SETS,SET_BONUS,thumb,ROOM,draw,pan(dx,dy){PAN.x+=dx;PAN.y+=dy},resetPan(){PAN={x:0,y:0}},canPan:()=>CAN,get fit(){return FIT},set fit(v){FIT=!!v;if(!FIT&&ZM<=LFT+.5)ZM=Math.max(FIX,LFT*1.3)},
 /* 핀치 확대·축소: f배. atMin = 더 줄일 수 없음(한눈에 보기) */
 zoom(f){const cur=CAN?TW:LFT;let z=Math.max(30,Math.min(ZMAX,cur*f));FIT=false;const k=Math.max(z,LFT)/cur;PAN.x*=k;PAN.y*=k;ZM=z;return{atMin:z<=LFT+.5}},junkHit(x,y){for(const j of junk){const p=iso(j.x,j.y),yy=p.y-(j.on?TW*.3:0);if(Math.hypot(x-p.x,y-yy)<Math.max(26,TW*.3)){junk=junk.filter(q=>q!==j);fx.push({e:'✨',x:p.x,y:yy-10,l:1});return true}}return false},get junk(){return junk},get cl(){return cl},tick,setPop(p){POP=Math.max(.6,Math.min(2.6,+p||1))},reset,setFloor(f,st,up){FL=f?1:0;ST=st?1:0;UP2=up||0},toTile,inRoom,isPath,isCounter,canPlace,okPlace,blockedSeats,mainRoute,iso:(a,b)=>iso(a,b),get N(){return N}}};
