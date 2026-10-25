# 📌 My Personal Hub — 프로젝트 정리 (Project Summary)

- **현재 버전:** v1.23
- **마지막 업데이트:** 2026-10-25
- **저장소:** `kslohg-lab/my-personal-hub` (branch: `main`)
- **이 문서의 목적:** 새 대화방이나 다른 AI가 이 문서만 읽고도 프로젝트를 정확히 이해하고, 기존 기능을 깨뜨리지 않고 수정할 수 있게 하는 **단일 상태 문서**입니다. 수정할 때마다 맨 아래 "변경 이력"과 필요한 섹션을 함께 갱신하세요.

---

## 1. 프로젝트 비전

1. 스마트폰 홈 화면에 추가해서 앱처럼 쓰는 **가족용 개인 허브(PWA 스타일 웹앱)**.
2. 직접 만든 **AI 미니 게임 모음**을 카드로 고르고 전체 화면으로 플레이.
3. **가족 실시간 채팅**(텍스트 + 사진), **일정 플래너**, 소셜 채널 링크 모음.
4. AI가 만들고 사람이 폰에서 검토/테스트한 뒤 GitHub에 반영하는 **AI-Human 개발 루프**.

---

## 2. 현재 구조

### 파일 구조
```
my-personal-hub/
├─ index.html              ← 화면 뼈대(HTML)만. 스타일/스크립트는 아래 파일을 불러옴
├─ css/app.css             ← 공통 스타일
├─ js/
│  ├─ core.js              ← [일반 스크립트] $, store, 화면 전환(enterApp/showLogin), 탭 전환, 연결 실패 안내
│  ├─ games.js             ← [일반 스크립트] 게임·도구 목록(CATS/GAMES), 전체 화면 플레이어
│  ├─ main.js              ← [모듈] 진입점: 로그인 상태에 따라 chat/todos/videos를 켜고 끔
│  ├─ firebase-init.js     ← [모듈] firebaseConfig, FAMILY(가족 계정), Firebase 초기화, 공유 상태(state)
│  ├─ login.js             ← [모듈] 이름 선택 + 비밀번호 로그인 화면, 로그아웃 버튼
│  ├─ chat.js              ← [모듈] 가족 채팅, 사진, 연결 상태 표시, 읽음 표시(안 읽음 배지·'여기부터 새 메시지'·내 메시지 읽음 글자)
│  ├─ todos.js             ← [모듈] 가족 보드(받는 사람·답글·수정), 옛 기기 저장 일정 이전
│  ├─ tickets.js           ← [모듈] 게임 티켓(wallets): 부모 지급/회수, 아이 입장 결제, 내역
│  ├─ calendar.js          ← [모듈] 가족 달력(events), 일정 탭의 [달력|보드] 전환, 홈의 '다가오는 일정'
│  ├─ videos.js            ← [모듈] 가족 영상 카드
│  ├─ scores.js            ← [모듈] 게임 점수판(scores): 게임이 저장한 이 기기 최고 기록을 읽어 올리고 가족 순위 표시
│  ├─ holidays.js          ← [데이터] 대한민국 공휴일 표(2026~2030, 대체공휴일 포함) — 달력 빨간 날
│  └─ util.js              ← [모듈] 공통 도구 `$`
├─ manifest.json           ← PWA 설정 (이름, 아이콘, 전체 화면 표시)
├─ icons/                  ← 앱 아이콘 (icon-192, icon-512, icon-maskable-512, apple-touch-icon)
├─ README.md
├─ PROJECT_SUMMARY.md      ← 이 문서
└─ games/
   ├─ math-monster/    (index.html, thumb.svg)  산수 몬스터 격파!
   ├─ speed-math/      (index.html, thumb.svg)  스피드 매쓰 블리츠 2
   ├─ animal-run/      (index.html, thumb.svg)  동물 친구 달리기 (가로 전용)
   ├─ claw-machine/    (index.html, thumb.svg)  말랑말랑 인형뽑기
   ├─ bungeoppang/     (index.html, thumb.svg)  붕어빵 타이쿤 (세로 게임, 저장 키 bungeoppangV1)
   ├─ chess/           (index.html, thumb.svg)  체스 (컴퓨터 3단계 + 둘이서, 저장 chessV1 / 판 도중 chessV1run)
   ├─ sudoku/          (index.html, thumb.svg)  스도쿠 (4×4·6×6·9×9, 오늘의 퍼즐, 저장 sudokuV1 / sudokuV1run)
   ├─ memory-match/    (index.html, thumb.svg)  짝 맞추기 (단계식, 저장 memoryV1 / memoryV1run)
   ├─ ice-cream/       (index.html, thumb.svg)  아이스크림 가게 타이쿤 (세로 게임, 저장 키 iceCreamV1 / 하루 도중 iceCreamV1run) — 허브에서 밸런스 수정함(부록 참고)
   ├─ travel-picker/   (index.html, thumb.svg)  우리 가족 해외여행 선택 보드  [도구]
   └─ h1-golf/         (index.html, thumb.svg)  H1 골프맵 (화성 H1 출발 1시간 이내 골프장 35곳)  [도구]
```
- 배포: GitHub 저장소의 파일이 그대로 반영됨 (반영까지 약 1~2분). 배포 서비스 이름: ______ (직접 기입)

### 하단 메뉴 (4개)
| 탭 | 내용 |
|---|---|
| 홈 | 환영 카드, **우리 가족 영상 카드**(Firestore `videos`, 앱 안에서 유튜브 링크 추가/삭제, **누르면 그 자리에서 바로 재생** — 영상마다 유튜브 스튜디오에서 '퍼가기 허용'이 켜져 있어야 재생됨), YouTube / Instagram 링크 카드 (현재 링크는 각 사이트 첫 화면 placeholder) |
| 가족채팅 | Firebase Firestore 실시간 채팅, 사진 전송 (보낸 사람 이름은 로그인 계정 기준). **읽음 표시(v1.20):** 하단 메뉴 '가족채팅'에 빨간 안 읽은 개수 배지, 채팅을 열면 '여기부터 새 메시지' 선, 내가 보낸 메시지 옆에 `읽음 ✓` / `엄마·지아 안 읽음` |
| 게임·도구 | 분류 2개: **🎮 AI 미니 게임**(산수 몬스터, 스피드 매쓰, 동물 달리기, 인형뽑기, 붕어빵 타이쿤, 아이스크림 가게 타이쿤, 체스, 스도쿠, 짝 맞추기) / **🧭 가족 도구**(해외여행 선택 보드, H1 골프맵). 카드 → 실행 |
| 게임 티켓 | 아빠·엄마가 채아·지아에게 🎫 티켓을 주거나 회수(이유 기록). 게임 입장 시 티켓 `cost`장(게임 1장, **도구는 무료**)을 내고 입장, 같은 게임 5분 안 재입장은 무료, 부모님은 무료, 부족하면 입장 불가. 잔액 `wallets/{id}`, 내역 `wallets/{id}/log` |
| 가족 달력 | 월간 달력(날짜별 색 점, 날짜를 누르면 그날 목록, 추가/수정/삭제), 시간·누구 일정·메모, **매년 반복**(생일·기념일). 홈에 오늘/30일 안 일정과 D-day 표시. Firestore `events` |
| 일정(가족 보드) | 가족이 함께 보는 일정/요청 게시판 (Firestore `todos` 실시간 공유, 추가한 사람/완료한 사람 표시, **받는 사람 지정**, 글을 눌러 **답글**, 글쓴이 **수정**) |

### 코드 구조 — **이 구조를 유지할 것**
- **일반 스크립트(core.js, games.js)는 Firebase와 무관**해야 함. Firebase가 실패해도 탭 전환, 게임은 항상 동작.
- **모듈(main.js 이하)이 Firebase 전담.** Firebase 주소(`https://www.gstatic.com/...`)는 `firebase-init.js`에서만 import하고, 다른 모듈은 `firebase-init.js`에서 가져다 씀. 모듈 간 공유 상태는 `state`(`state.me` 로그인한 사람, `state.db`, `state.auth`).
- **기능 격리:** `main.js`가 chat/todos/videos/calendar를 각각 `import()`로 따로 불러오고, 하나가 실패하거나 오류를 내도 로그인과 나머지 기능은 계속 동작. 각 기능 모듈은 `start()` / `stop()`을 export하고, 로그인 시 시작·로그아웃 시 정지됨.
- **새 기능(예: 점수판) 추가 순서:** ① `js/새기능.js`를 만들어 `start`/`stop` export ② `main.js`의 `['chat','todos','videos','calendar','tickets','scores']` 목록(2곳)에 이름 추가 ③ 필요한 HTML을 `index.html`에, Firestore 규칙에 컬렉션 추가.
- **캐시 버전(`?v=1.15`):** `index.html`과 모든 `js/*.js`의 import/script 주소 끝에 `?v=버전`이 붙어 있음. **공유 파일(`firebase-init.js`, `util.js`)을 고칠 때는 모든 참조의 버전 문자열을 같은 값으로 함께 올릴 것.** 기능 파일 하나(`videos.js` 등)만 고칠 때는 `main.js`의 `FVER`에 그 파일 번호만 따로 올리면 됨(v1.19부터), `games.js`는 `index.html`의 script 태그 번호만 올리면 됨. (일부만 바꾸면 새 파일과 옛 파일이 섞여 로딩될 수 있음. 한 번에 모두 `grep -rn "?v="`로 확인.)
- **아이콘:** 외부 라이브러리 없이 `index.html` 상단의 **인라인 SVG 스프라이트**(`#i-home` 등)를 `<use>`로 사용. (CDN 아이콘 라이브러리 사용 금지 — 아래 "문제 기록" 참고)
- **레이아웃:** `header / main / nav`를 세로로 쌓은 구조(`.shell`, 높이 `100dvh`). 각 탭은 `.tab`(absolute, 보이는 탭만 `.active`). 하단 메뉴는 `fixed`가 아님.
- **숨김 처리:** `hidden` 속성 + CSS `[hidden]{display:none!important}`(css/app.css) 사용.
- **스타일:** Tailwind CDN `3.4.17` 고정 + `css/app.css`.

### 브라우저 저장소 키
| 키 | 용도 |
|---|---|
| `hub_flip` | 가로 전용 게임 방향 뒤집기 상태 |
| `my_hub_todos` | (옛 기기 저장 일정 — 가족 일정으로 옮기기 위해서만 읽음) |
| `hub_todos_migrated` | 옛 일정 이전 여부 (`1` 옮김, `no` 거절) |
| `hub_plannerSub` | 일정 탭에서 마지막으로 본 화면 (`cal` 달력 / `board` 보드) |

---

> ℹ️ 아이폰은 홈 화면에 추가한 앱과 사파리가 로그인 정보를 따로 보관하므로, **설치한 앱에서 한 번 다시 로그인**해야 함.

## 3. Firebase (채팅)

- **올바른 프로젝트 ID: `my-family-hub-daf46`**
  - ⚠️ `my-personal-hub-daf46`은 **존재하지 않는 값**입니다. (과거 AI가 잘못 바꿔 채팅이 끊긴 적 있음) 설정값(`js/firebase-init.js`의 `firebaseConfig`)을 임의로 수정하거나 새로 만들지 말 것. 실제 값은 Firebase 콘솔 → 프로젝트 설정 → 내 앱에서 확인.
- **로그인(Firebase Authentication): 이메일/비밀번호 방식 (v1.5~)**
  - 가족 4명 계정은 Firebase 콘솔 → Authentication → 사용자에서 **직접 생성**(앱에 가입 기능 없음). 앱 로그인 화면에서는 이름 버튼을 누르고 비밀번호만 입력.
  - 이름 ↔ 이메일 대응(`js/firebase-init.js`의 `FAMILY` 배열): 아빠 `dad@family-hub.app`, 엄마 `mom@family-hub.app`, 채아 `chaea@family-hub.app`, 지아 `jia@family-hub.app` (실제 메일이 아니어도 됨, 비밀번호 분실 시 콘솔에서 직접 재설정)
  - 비밀번호는 문서/코드에 적지 않음. 한 번 로그인하면 기기에 유지됨.
- **Firestore 컬렉션:** `chats`
  | 필드 | 설명 |
  |---|---|
  | `sender` | 보낸 사람 이름 |
  | `uid` | Firebase 로그인 계정 uid (옛 메시지에는 기기 ID 또는 없음) |
  | `text` | 메시지 내용 |
  | `imageUrl` | 사진(base64 data URL) 또는 `null` (옛 메시지에는 없음) |
  | `timestamp` | `serverTimestamp()` |
- **Firestore 컬렉션:** `todos` — 필드: `text`, `done`(bool), `doneBy`(완료한 사람 이름 또는 빈 문자열), `by`(추가한 사람), `uid`, `createdAt`(serverTimestamp). 조회: `orderBy('createdAt','asc')` + `limitToLast(200)`, 화면에서 안 한 일정을 먼저 표시. **v1.12 추가 필드:** `to`(받는 사람 이름, 빈 문자열=전체), `rc`(답글 개수; 답글 추가/삭제 때 `increment`로 갱신). **답글**은 하위 컬렉션 `todos/{id}/replies` — 필드 `text`, `by`, `uid`, `createdAt`; 글을 펼쳤을 때만 구독(한 번에 하나). 옛 글에는 `to`/`rc`가 없어도 정상 동작(없으면 전체/0으로 취급). 목록은 항목별로 갱신해서 답글을 쓰는 중에 목록이 바뀌어도 입력이 지워지지 않음.
- **Firestore 컬렉션:** `events` (가족 달력, v1.13) — 필드: `title`, `date`('YYYY-MM-DD', 매년 반복은 처음 날짜), `time`('HH:MM' 또는 빈 문자열=종일), `who`(가족 이름 또는 빈 문자열=모두), `repeat`('yearly' 또는 빈 문자열), `memo`, `by`, `uid`, `createdAt`. 화면에 보이는 6주 구간은 `where(date >= ..) + where(date <= ..) + orderBy(date)`로 구독(복합 색인 불필요), 매년 반복은 `where(repeat == 'yearly')`로 따로 구독, 홈은 오늘~30일 뒤 구간을 구독. 날짜 문자열은 기기의 현재 시간대 기준. 2/29 반복 일정은 평년에 2/28로 표시. 가족 누구나 수정/삭제 가능(소유자 `uid`는 바꿀 수 없음).
- **Firestore 컬렉션:** `wallets/{id}` (게임 티켓, v1.15) — `id`는 이메일 앞부분(`chaea`, `jia`). 필드 `name`, `balance`(정수, 0 이상). 하위 `log/{자동id}` — `amount`(+/-), `kind`(`grant` 지급 / `revoke` 회수 / `spend` 입장), `reason`, `game`(입장일 때 게임 id), `by`, `uid`, `createdAt`. 잔액 변경은 `writeBatch`로 잔액(`increment`)과 내역을 한 번에 기록. **규칙:** 부모(아빠·엄마)만 만들고 아무 값으로 올릴 수 있음, 아이는 자기 지갑을 줄이는 것(최대 5장씩)만 가능하고 올릴 수 없음(서버가 잔액 0 미만도 거부). 부모 이메일은 규칙의 `isParent()`와 `firebase-init.js`의 `FAMILY`(`parent: true`) 두 곳에서 같아야 함. **한계:** 게임 파일 주소로 직접 들어가는 것까지는 막을 수 없는 가족 규칙용 장치(허브 안에서의 입장만 관리). `tickets.js`가 없거나 고장 나면 게임은 무료로 열림.
- **Firestore 컬렉션:** `reads/{id}` (채팅 읽음 표시, v1.20) — `id`는 이메일 앞부분(`dad`,`mom`,`chaea`,`jia`). 필드 `name`, `uid`, `at`(serverTimestamp = 그 사람이 채팅을 마지막으로 본 시각). 각자 자기 문서만 쓸 수 있고(규칙: 이메일이 `id@family-hub.app`) 가족은 모두 읽을 수 있음. 채팅 탭이 열려 있고 앱이 화면에 보이는 동안 새 메시지가 오면 1.5초 간격으로 갱신. **표시 규칙:** 메시지 시각 > 상대의 `at`이면 '안 읽음'. 배지/새 메시지 선의 기준은 내 `at`(읽음 정보가 없으면 기기 `localStorage['hub_chatSeen']`로 대체). **2026-10-25 이전 메시지에는 읽음 글자를 표시하지 않음**(`RECEIPT_FROM`). `reads` 규칙이 없거나 실패하면 읽음 글자만 숨겨지고 채팅·배지는 계속 동작. 채팅 모듈이 바뀌어 `main.js`의 `FVER`에 `chat: '?v=1.20'`.
- **Firestore 컬렉션:** `scores/{게임id}__{사람id}` (게임 점수판, v1.21) — 필드 `game`, `name`, `uid`, `score`(정수), `at`(serverTimestamp). 사람id = 이메일 앞부분. **게임 파일은 고치지 않음:** 게임은 자기 최고 기록을 localStorage에 저장하고(허브와 같은 주소라 허브가 읽을 수 있음) `scores.js`가 읽어서, 서버의 내 기록보다 높을 때만 올림(앱 시작 · 게임 닫을 때 `hub:gameclosed` 이벤트 · 앱으로 돌아올 때). 읽는 키: 산수 몬스터 `mmBest`, 스피드 매쓰 `mb2_best`, 동물 달리기 `animalRunV6`의 `best`(무한 모드 거리, m). **새 게임을 점수판에 넣으려면** `scores.js`의 `BOARD`에 한 줄(id·제목·단위·읽는 방법)만 추가하면 됨(규칙은 `게임id__이름` 형태면 그대로 통과). 규칙: 각자 자기 문서만, 점수는 올라가기만 함(내려가는 쓰기 거부), 삭제 불가. **한계:** 기록은 '이 기기'의 최고 기록이라 한 기기를 여러 명이 쓰면 로그인한 사람 이름으로 올라감. 규칙이 없으면 점수판 패널에 안내가 뜨고 나머지는 정상.
- **공휴일(v1.21):** `js/holidays.js`의 고정 표(2026~2030). 달력 칸에 빨간 숫자 + 작은 이름(긴 이름은 줄여 표시), 날짜를 누르면 `🎌 이름 (공휴일)`. 2026·2027·2028년은 공개 목록과 대조 확인, 2029·2030년은 같은 규칙(설날·추석·부처님오신날은 음력 변환, 겹치면 대체공휴일)으로 계산한 값. 2026년부터 **노동절(5/1)·제헌절(7/17)이 공휴일**. 2030년 이후와 2030년 선거일은 아직 없음 → 2030년이 되기 전에 추가. 임시공휴일은 이 파일에 한 줄 추가.
- **Firestore 컬렉션:** `videos` — 필드: `videoId`(유튜브 11자리 ID), `title`, `by`, `uid`, `createdAt`. 조회: `orderBy('createdAt','desc')` + `limit(20)`. 최신 영상은 큰 카드, 나머지는 작은 줄. 썸네일은 `i.ytimg.com`에서 자동 로드, 카드를 누르면 그 자리에서 재생(v1.19, `youtube-nocookie.com/embed`). 영상마다 유튜브 스튜디오의 **'퍼가기 허용'**이 켜져 있어야 재생됨(꺼져 있으면 "동영상을 재생할 수 없음"이 뜨고 'YouTube ↗' 링크로만 볼 수 있음). 영상은 **일부 공개**로 올리고 링크는 코드에 직접 적지 말고 앱에서만 추가할 것.
- **조회(채팅):** `orderBy('timestamp','asc')` + `limitToLast(100)`.
- **사진:** 브라우저에서 최대 800px JPEG로 줄여 Firestore 문서에 직접 저장 (문서 1MB 제한 때문에 용량 초과 시 전송 차단).
- **연결 방식:** `initializeFirestore(..., { experimentalForceLongPolling: true })` — 일부 네트워크에서 연결이 멈추는 문제 방지.
- **상태 표시:** 채팅창 위에 `● 연결됨 · 메시지 N개`. 연결 실패 시 빨간 문구 + 노란 줄에 원인(서버에 직접 요청해서 진단) 표시.
- **Firestore 규칙 (적용 완료, 가족 4명만 허용).** 컬렉션을 추가할 때는 이 규칙에도 같이 추가해야 함:
```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    function isFamily() {
      return request.auth != null
        && request.auth.token.email in [
          'dad@family-hub.app', 'mom@family-hub.app',
          'chaea@family-hub.app', 'jia@family-hub.app'
        ];
    }
    function isParent() {
      return request.auth != null
        && request.auth.token.email in ['dad@family-hub.app', 'mom@family-hub.app'];
    }
    match /chats/{doc} {
      allow read: if isFamily();
      allow create: if isFamily() && request.resource.data.uid == request.auth.uid;
      allow update, delete: if false;
    }
    match /todos/{doc} {
      allow read: if isFamily();
      allow create: if isFamily() && request.resource.data.uid == request.auth.uid;
      allow update: if isFamily() && (
        request.resource.data.diff(resource.data).affectedKeys().hasOnly(['done', 'doneBy'])
        || request.resource.data.diff(resource.data).affectedKeys().hasOnly(['rc'])
        || (resource.data.uid == request.auth.uid
            && request.resource.data.diff(resource.data).affectedKeys().hasOnly(['text', 'to']))
      );
      allow delete: if isFamily();
      match /replies/{rid} {
        allow read: if isFamily();
        allow create: if isFamily() && request.resource.data.uid == request.auth.uid;
        allow update: if false;
        allow delete: if isFamily() && resource.data.uid == request.auth.uid;
      }
    }
    match /events/{doc} {
      allow read: if isFamily();
      allow create: if isFamily() && request.resource.data.uid == request.auth.uid
        && request.resource.data.title is string && request.resource.data.title.size() > 0 && request.resource.data.title.size() <= 100;
      allow update: if isFamily() && request.resource.data.uid == resource.data.uid
        && request.resource.data.title is string && request.resource.data.title.size() > 0 && request.resource.data.title.size() <= 100;
      allow delete: if isFamily();
    }
    match /wallets/{id} {
      allow read: if isFamily();
      allow create: if isParent()
        && request.resource.data.balance is int && request.resource.data.balance >= 0;
      allow update: if isFamily()
        && request.resource.data.balance is int && request.resource.data.balance >= 0
        && (isParent()
            || (request.auth.token.email == id + '@family-hub.app'
                && request.resource.data.balance < resource.data.balance
                && request.resource.data.balance >= resource.data.balance - 5));
      allow delete: if false;
      match /log/{lid} {
        allow read: if isFamily();
        allow create: if isFamily() && request.resource.data.uid == request.auth.uid
          && request.resource.data.amount is int
          && (isParent()
              || (request.auth.token.email == id + '@family-hub.app'
                  && request.resource.data.kind == 'spend'
                  && request.resource.data.amount < 0));
        allow update, delete: if false;
      }
    }
    match /reads/{id} {   // 채팅 읽음 표시: 각자 자기 문서(id = 이메일 앞부분)만 쓸 수 있음
      allow read: if isFamily();
      allow create, update: if isFamily()
        && request.auth.token.email == id + '@family-hub.app'
        && request.resource.data.uid == request.auth.uid
        && request.resource.data.at is timestamp;
      allow delete: if false;
    }
    match /scores/{id} {   // 게임 최고 기록: 문서 id = 게임id__이메일앞부분, 각자 자기 것만 쓰고 점수는 올라가기만 함
      function okScore(sid) {
        return isFamily()
          && sid.matches('[a-z0-9-]+__[a-z]+')
          && request.auth.token.email == sid.split('__')[1] + '@family-hub.app'
          && request.resource.data.game == sid.split('__')[0]
          && request.resource.data.uid == request.auth.uid
          && request.resource.data.score is int
          && request.resource.data.score > 0 && request.resource.data.score <= 10000000
          && request.resource.data.at is timestamp;
      }
      allow read: if isFamily();
      allow create: if okScore(id);
      allow update: if okScore(id) && request.resource.data.score >= resource.data.score;
      allow delete: if false;
    }
    match /videos/{doc} {
      allow read: if isFamily();
      allow create: if isFamily() && request.resource.data.uid == request.auth.uid;
      allow update: if false;
      allow delete: if isFamily();
    }
  }
}
```

---

## 4. 게임·도구 모듈

### 동작 방식
- 목록은 `js/games.js`의 `GAMES` 배열에서 만들어짐. 항목: `id`, `cat`(`'game'` 게임 / `'tool'` 도구 — 분류는 `CATS` 배열), `title`, `desc`, `landscape`(가로 전용), `v`(파일 캐시 번호), `cost`(입장 티켓 수, 없거나 0이면 무료 — **도구는 티켓 없이 무료**). 분류 이름은 `CATS`에서 바꿈.
- 카드 이미지: `games/<id>/thumb.svg` (2:1 가로 비율).
- 카드를 누르면 `games/<id>/index.html`을 **화면 전체를 덮는 iframe**으로 실행 (헤더/하단 메뉴 숨김). 안드로이드 크롬에서는 Fullscreen API도 함께 시도.
- 왼쪽 위 `←` 버튼 또는 **폰 뒤로가기**로 목록 복귀 (`history.pushState` / `popstate` 사용, **뒤로가기 1번**으로 복귀). 다른 탭으로 이동하면 게임은 종료됨. 게임 iframe은 **열고 닫을 때마다 새 iframe으로 갈아 끼움**(`freshFrame()`) — iframe의 `src`를 바꾸면 브라우저 이동 기록이 쌓여 뒤로가기를 두 번 눌러야 하므로 `src`를 직접 바꾸지 말 것. 카드 이미지는 `games/<id>/thumb.svg`라서 `GAMES`의 `id`는 폴더 이름과 같아야 함
- **도구(`cat: 'tool'`)는 위에 제목 줄(`#gpBar`: ← 버튼 + 이름)을 두고 그 아래에 화면(iframe)을 배치**해서 ← 버튼이 내용을 가리지 않음. 전체화면은 요청하지 않음(링크가 새 탭으로 열려도 안전). 게임(`'game'`)은 기존대로 화면 전체.
- **가로 전용 게임**(`landscape: true`, 현재 동물 친구 달리기): 폰이 세로 상태면 iframe을 CSS로 90° 회전해 가로로 채움 → 게임이 "화면을 가로로 돌려주세요"를 띄우지 않고 바로 실행. `↻ 방향` 버튼으로 반대 방향 전환(선택 기억). 폰이 이미 가로면 회전 없이 실행.
- **회전 중 손가락 스크롤 보정(v1.14):** 브라우저는 `touch-action`(예: 게임의 `pan-y`)을 회전 전 화면 기준으로 판단해서, 회전해 보여 주는 동안 게임 안 스크롤 영역(캐릭터 목록 등)이 손가락으로 안 움직임. 그래서 `games.js`의 `hookRotatedScroll()`이 iframe이 로드될 때 게임 문서에 `<style id="hubRotStyle">`(touch-action 끄기, 회전 중에만 켜짐)와 터치 리스너를 넣어 손가락 이동을 직접 스크롤로 바꿔 줌(폰 세로 이동과 가로 이동 모두 사용, 끌다 뗀 자리의 버튼은 눌리지 않음). 게임 파일은 고칠 필요 없음. 폰이 가로면 꺼져서 기본 스크롤 사용.

### 새 게임·도구 추가 방법
1. `games/새이름/index.html` (본체), `games/새이름/thumb.svg` (카드 이미지, 320×160) 추가.
2. `js/games.js`의 `GAMES` 배열에 한 줄 추가. (`cat: 'game'` 또는 `'tool'`, 가로 전용이면 `landscape: true`, 게임이면 `cost: 1`)
3. 게임 파일은 **독립 파일**이므로 허브 코드를 고칠 때 게임 파일은 건드리지 않음.

---

## 5. AI에게 수정을 맡길 때의 규칙 ⚠️

1. **요청한 부분만 수정**하고, 나머지는 그대로 유지할 것. 전체 파일을 새로 쓰지 말 것.
2. 수정한 부분(어느 위치, 무엇을)을 알려줄 것.
3. **Firebase `firebaseConfig` 값, 프로젝트 ID, 가족 계정 목록(`FAMILY`)을 바꾸지 말 것.**
4. 아이콘을 외부 CDN 라이브러리로 바꾸지 말 것 (인라인 SVG 유지).
5. 파일 구조(일반 스크립트 / Firebase 모듈 분리, 기능별 모듈)와 레이아웃 구조(`header/main/nav` 세로 쌓기)를 유지할 것. 한 파일에 기능을 다시 몰아넣지 말 것.
6. 사용자 입력은 `innerHTML`이 아니라 `textContent`로 화면에 넣을 것.
7. 한 번에 한 가지 기능만 수정할 것.
8. 수정한 파일은 **파일 이름과 함께** 알려주고, `?v=` 버전 문자열을 모든 참조에서 함께 올릴 것. 게임 iframe의 `src`를 직접 바꾸지 말 것(`freshFrame()` 사용).

### 수정 후 확인 체크리스트
- [ ] 이름 선택 + 비밀번호로 로그인되고, 로그아웃 후 다시 로그인 화면이 나오는가
- [ ] 하단 메뉴 4개 아이콘이 모두 보이고 탭 이동이 되는가
- [ ] 채팅: 상태가 `● 연결됨`이고, 메시지 전송 후 입력창이 비워지는가, 다른 기기에서도 보이는가
- [ ] 채팅: 사진 전송과 확대 보기가 되는가
- [ ] 체스·스도쿠·짝 맞추기: 각각 열리고, 홈 버튼을 눌렀다 돌아오면 일시정지(계속하기)가 뜨고, 앱을 껐다 켜면 '이어서 하기'가 뜨는가
- [ ] 아이스크림 가게: 하루 도중 홈 버튼 → 일시정지, 앱을 껐다 켜면 '이어서 하기'가 뜨는가 / 상점에 '가게 꾸미기 수집'이 보이는가
- [ ] 점수판: 게임·도구 탭의 '🏆 가족 최고 기록' [보기]에 가족 순위가 뜨고, 게임을 하고 나오면 내 기록이 올라가는가 (안 되면 Firestore 규칙의 `scores` 줄 확인)
- [ ] 달력: 공휴일이 빨간 날로 표시되고, 누르면 `🎌 …(공휴일)`이 뜨는가
- [ ] 채팅 읽음: 다른 탭에 있을 때 상대가 보내면 '가족채팅'에 빨간 숫자가 뜨고, 열면 '여기부터 새 메시지' 선이 보이며 숫자가 사라지는가 / 내가 보낸 글 옆에 상대가 읽으면 `읽음 ✓`로 바뀌는가 (안 되면 Firestore 규칙의 `reads` 줄 확인)
- [ ] 홈 화면의 가족 영상: 유튜브 링크를 추가하면 썸네일 카드가 보이고, 누르면 새 창 없이 그 자리에서 재생되며, 다른 탭으로 가면 멈추고, 삭제가 되는가 (안 나오면 그 영상의 '퍼가기 허용' 확인)
- [ ] 동물 친구 달리기: 판 도중 홈 버튼을 눌렀다 돌아오면 같은 자리에서 일시정지로 유지되고, 앱을 완전히 종료했다 다시 열어도 메뉴에 '이어서 하기'가 뜨는가
- [ ] 게임·도구 탭에 🎮 게임 9개와 🧭 도구 2개(해외여행·H1 골프맵)가 나뉘어 보이고, 도구는 티켓 없이 열리는가
- [ ] 동물 친구 달리기(세로 폰)에서 캐릭터 목록을 손가락으로 끌어 아래 캐릭터/펫까지 볼 수 있는가
- [ ] 일정을 추가하면 다른 기기에서도 바로 보이고, 완료 체크/삭제가 되는가
- [ ] 부모 계정에서 티켓을 주면 아이 폰에 잔액이 바로 뜨고, 게임에 들어가면 1장 줄고, 0장이면 입장이 막히는가 (안 되면 Firestore 규칙의 `wallets` 줄 확인)
- [ ] 달력에서 일정을 추가하면 다른 기기에서도 보이고, 홈의 '다가오는 일정'에 오늘/D-day가 뜨는가 (안 뜨면 Firestore 규칙의 `events` 줄 확인)
- [ ] 받는 사람을 고르면 `아빠 → 엄마`로 보이고, 받는 사람 본인 화면에는 `나에게` 표시가 뜨는가
- [ ] 글을 눌러 답글을 달면 다른 기기에서도 보이고 💬 개수가 맞는가 (안 보이면 Firestore 규칙의 `replies` 줄 확인)
- [ ] 게임 목록이 보이고, 각 게임이 전체 화면으로 열리며 `←`와 폰 뒤로가기(**한 번만 눌러도**)로 목록에 돌아오는가, 모든 게임 카드에 이미지가 보이는가
- [ ] 동물 친구 달리기가 폰 세로 상태에서도 바로 가로로 시작되는가
- [ ] 홈 화면에 추가한 앱이 아이콘/이름 "가족 아지트"로 보이고, 주소창 없이 열리는가

---

## 6. 문제 기록 (같은 실수를 반복하지 않기 위해)

| 증상 | 원인 | 해결 |
|---|---|---|
| 하단 메뉴 아이콘이 사라짐 | 외부 CDN 아이콘 라이브러리 로딩 실패 / 스크립트 하나가 실패하면 전체 중단 | 인라인 SVG로 교체, Firebase 코드와 일반 코드 분리 |
| 채팅이 서로 안 보임 | 모두 같은 기본 이름("아빠")으로 "내 메시지" 구분 불가, 오류 표시 없음 | 기기 고유 ID(`uid`) 도입, 연결 상태/오류 표시 |
| 채팅 연결 실패 (403 `Permission denied on resource project`) | 코드의 프로젝트 ID가 실제와 다름 (`my-personal-hub-daf46`) | `my-family-hub-daf46`으로 교정 |
| 메시지 전송 후 입력창이 안 비워짐 | 서버 응답이 와야 비우는 구조 + 연결 지연 | 즉시 비우고 실패 시 복원, 롱폴링 사용 |
| 한글 입력 시 Enter 중복 전송 | IME 조합 중 Enter | `isComposing` 확인 |
| 메시지에 `<` 입력 시 화면 깨짐 | `innerHTML` 사용 | `textContent` 사용 |
| 사진 클릭 확대가 안 됨 | `window.open(data URL)` 차단 | 화면 내 확대 보기 |
| 동물 달리기가 "가로로 돌려주세요"에서 멈춤 | 게임이 세로 화면을 감지하면 시작을 막음 | 허브가 iframe을 CSS로 회전해 가로 화면으로 제공 |
| 게임에서 뒤로가기를 두 번 눌러야 목록으로 돌아옴 (v1.9에서 발견) | iframe의 `src`를 바꿀 때마다 브라우저 이동 기록이 하나씩 쌓임 | 열고 닫을 때 iframe을 새로 만들어 갈아 끼움(`freshFrame()`) |
| Cyber Runner 카드 이미지가 안 나옴 (v1.9에서 발견) | `GAMES`의 id(`runner`)와 폴더 이름(`cyber-runner`)이 달랐음 | id를 `cyber-runner`로 통일 |

---

## 7. 보안 메모

- 저장소가 **공개(public)**이므로 `js/firebase-init.js`의 Firebase 설정과 가족 이메일 목록은 누구나 볼 수 있음. 보안은 **로그인 + Firestore 규칙**으로 확보함(비밀번호는 코드에 없음). Firestore 규칙은 가족 4명만 허용으로 잠겨 있음.
- 채팅 내용을 보호하려면 Firestore 규칙 강화 + Firebase 로그인(Authentication) 도입이 필요. 규칙을 `allow read, write: if true`로 장기간 열어두지 말 것.

---

## 8. 로드맵

1. ~~PWA 설정 보강~~ → manifest·아이콘 적용 완료(v1.6). service worker(오프라인/푸시 알림)는 의도적으로 미적용 — 캐시 때문에 옛 버전이 계속 뜨는 문제를 피하기 위함. 푸시 알림을 만들 때 함께 도입 예정.
2. ~~보안 강화~~ → 로그인(v1.5)과 Firestore 규칙 잠금 완료. (남은 선택 사항: Authentication의 가입 허용 끄기)
3. ~~일정 가족 공유~~ → 완료(v1.7)
4. ~~`index.html` 파일 분리~~ → 완료(v1.9)
**남은 할 일 / 아이디어 (v1.21 기준)**
- ⚠️ **먼저 확인:** Firestore 규칙(`firestore.rules.txt`)이 Firebase 콘솔에 붙여 넣어져 있는지(일정·티켓·답글·**채팅 읽음(`reads`)·점수판(`scores`)** 기능에 필요), v1.12~v1.21 파일이 모두 GitHub에 올라갔는지.
- ~~채팅 읽음 표시~~ → 완료(v1.20). 폰 실제 확인 필요.
- ~~게임 점수판~~ → 완료(v1.21, v1.22에서 아이스크림·붕어빵 추가: 클리어/장사한 일수). 새 게임은 `BOARD`에 한 줄씩 추가.
- ~~공휴일 표시~~ → 완료(v1.21). 2030년이 되기 전에 `holidays.js`에 2031년 이후 추가.
- **2인용 게임**: 게임방에서 만든 뒤 가져오면 허브 호환 검토 후 등록(요청문은 대화에서 안내).
- **2인용 게임**: 처음 받은 2인용 파일은 보류(등록 안 함). 대신 체스에 '둘이서 하기'가 들어 있음.
- **붕어빵 타이쿤 보완**(아이스크림에 적용한 방식 참고: 목표 계산에서 업그레이드 배율 빼기, 못 깰 때 응원 -10%, 꾸미기 수집): 초반(2~7일차) 목표 완화, 별 기준 완화, 35일차 이후 코인 쓸 곳, 하루 도중 이어서 하기.
- **입장 티켓 유예 시간**: 지금은 같은 게임 5분 안 재입장만 무료. '이어서 하기' 때문에 늘릴지 결정 필요.
- **홈의 YouTube / Instagram 카드**에 실제 채널 주소 연결(주소 필요).
- **달력에 공휴일 표시**, 게임별 티켓 비용 다르게, 숙제 같은 일을 하면 티켓 자동 지급.
- **채팅**: 메시지 삭제, 사진을 Firebase Storage로 이동(지금은 Firestore에 base64 저장).
- **푸시 알림**: Blaze(카드 등록)가 필요해서 보류. 사용자가 카드 등록을 원하지 않음.
- 게임 파일 안의 작은 정리: H1 골프맵 제목의 '35개 구장'(실제 38곳), 이 문서 맨 위 '배포 서비스 이름' 기입.

---

## 9. 변경 이력

| 버전 | 날짜 | 내용 |
|---|---|---|
| v1.0 | 2026-10-22 | 초안: 단일 파일 허브 (홈, 채팅, Cyber Runner, 일정, 비밀번호 잠금) |
| v1.1 | 2026-10-22 | 구조 안정화: 스크립트 분리, 인라인 SVG 아이콘, 레이아웃 재구성, 채팅 기기 ID·XSS 방지·사진 압축·상태 표시 |
| v1.2 | 2026-10-22 | 채팅 연결 복구: 롱폴링, 원인 진단 표시, Firebase 프로젝트 ID 교정(`my-family-hub-daf46`) |
| v1.3 | 2026-10-22 | AI게임 탭을 카드 목록으로 개편, 게임 5개 추가(`games/` 폴더), 카드 이미지 제작 |
| v1.4 | 2026-10-22 | 게임 전체 화면 실행, 폰 뒤로가기/`←` 복귀, 동물 친구 달리기 가로 자동 전환 |
| v1.5 | 2026-10-22 | 이메일/비밀번호 로그인 도입(아빠·엄마·채아·지아), PIN 잠금 제거, 채팅 보낸 사람을 계정 기준으로 표시, 로그아웃 추가 (Firestore 규칙은 아직 열림) |
| v1.6 | 2026-10-22 | PWA 설정: manifest.json, 앱 아이콘 4종, 홈 화면 추가 시 앱 이름/아이콘 적용 (service worker는 미적용) |
| v1.7 | 2026-10-22 | Firestore 규칙 잠금 적용(가족 4명만), 일정을 가족 공유로 전환(`todos`), 옛 기기 저장 일정 이전 기능 |
| v1.8 | 2026-10-22 | 홈 화면에 "우리 가족 영상" 카드 추가(앱 안에서 유튜브 링크 추가/삭제, `videos` 컬렉션) |
| v1.9 | 2026-10-22 | `index.html`을 기능별 파일(css/, js/)로 분리, 기능 격리(chat/todos/videos 개별 로딩), 캐시 버전(`?v=`) 도입. 게임 뒤로가기 1번으로 복귀하도록 수정, Cyber Runner 카드 이미지 수정 |
| v1.10 | 2026-10-22 | 채팅: 이모지만 1~3개 보내면 말풍선 없이 크게 표시 (`chat.js`, 글자가 섞이면 기존대로) |
| v1.11 | 2026-10-22 | 동물 친구 달리기를 새 버전(저장 키 `animalRunV6`, V4/V5 저장 이어받기)으로 교체. 게임 주소에 `?v=게임번호` 추가(`GAMES`의 `v`) — 게임 파일을 바꿀 때 이 숫자를 올릴 것 |
| v1.12 | 2026-10-22 | 일정 탭을 가족 보드로 확장: 받는 사람 지정(`to`), 답글(`todos/{id}/replies`, 개수 `rc`), 글쓴이 수정. **Firestore 규칙 변경 필요**(위 규칙 블록). 일정 목록을 항목별 갱신으로 바꿔 입력 중 내용 보존 |
| v1.13 | 2026-10-22 | 가족 달력 추가(`js/calendar.js`, `events` 컬렉션): 월간 달력, 일정 추가/수정/삭제, 매년 반복, 홈 '다가오는 일정'·D-day. 일정 탭에 [달력 \| 보드] 전환. **Firestore 규칙 변경 필요**(`events` 줄) |
| v1.14 | 2026-10-25 | 세로 폰에서 회전해 보여 주는 게임의 스크롤 보정(캐릭터 목록이 안 내려가던 문제 수정). `js/games.js`와 `index.html`의 games.js 주소만 변경 |
| v1.15 | 2026-10-25 | 게임 티켓 추가(`js/tickets.js`, `wallets` 컬렉션): 부모가 아이에게 티켓 지급/회수, 모든 게임 입장 1장, 부모님 무료, 5분 안 재입장 무료, 내역 기록. `FAMILY`에 `parent` 표시, `state.me`에 `email/id/parent` 추가. **Firestore 규칙 변경 필요**(`isParent()`와 `wallets`). 캐시 버전 전체 `?v=1.15` |
| v1.16 | 2026-10-25 | 동물 친구 달리기 새 버전 반영(`GAMES`의 `v`: 7): 🏠 버튼이 일시정지 화면(계속하기/메뉴로)으로 바뀜, 앱이 백그라운드로 가면 자동 일시정지, 메뉴에 "이어서 (N단계부터)" 버튼 복원. 저장 키 `animalRunV6` 그대로 |
| v1.17 | 2026-10-25 | **동물 달리기 "이어서 하기"**: 판 도중 상태를 localStorage `animalRunV6run`에 2초마다·일시정지·백그라운드 때 저장 → 앱을 껐다 켜도 메뉴의 "▶️ 이어서 하기 (N단계 · 🪙코인)"로 그 자리에서 계속(복원 직후엔 일시정지 상태). 판이 끝나거나 '메뉴로'/'처음부터'를 누르면 저장본 삭제(모은 코인은 정산). 기존 "이어서 (N단계부터)"는 "N단계부터 새로 시작"으로 이름 변경. **허브(`games.js`)**: 폰 홈 버튼으로 전체화면이 풀릴 때(fullscreenchange) 게임을 닫아 버려 게임이 리셋되던 문제 수정 — 백그라운드 직후 2.5초 안의 전체화면 해제는 무시. `GAMES`의 `v`: 8 |
| v1.18 | 2026-10-25 | **Cyber Runner 삭제**(허브 안 내장 코드·화면·`games/cyber-runner/` 폴더 제거). **분류 신설**: 게임·도구 탭을 `🎮 AI 미니 게임` / `🧭 가족 도구`로 나누고(`CATS`, 항목의 `cat`), 해외여행 선택 보드를 도구로 이동 + **H1 골프맵 추가**. 도구는 제목 줄이 있는 화면, 티켓 없이 무료, 전체화면 안 씀. **붕어빵 타이쿤 추가**(게임, 티켓 1장, `v`: 1). 하단 메뉴 이름 `AI게임` → `게임·도구`. `games.js` 태그 `?v=1.18` |
| v1.19 | 2026-10-25 | **우리 가족 영상: 새 창 없이 그 자리에서 바로 재생.** 큰 카드를 누르면 썸네일이 유튜브 플레이어(`youtube-nocookie.com/embed`, 자동재생)로 바뀜. 지난 영상 줄을 누르면 큰 카드로 올라와 재생(동시에 1개만). 재생 중 새 영상이 추가돼도 끊기지 않음(큰 카드와 목록을 따로 그림). `닫기` 버튼, 다른 탭으로 가면 자동 정지, `YouTube ↗` 링크(퍼가기가 막힌 영상용). `js/videos.js`만 번호를 올림(`main.js`의 `FVER`) — 공유 파일(`firebase-init`, `util`)은 `?v=1.15` 그대로 |
| v1.20 | 2026-10-25 | **채팅 읽음 표시.** 하단 '가족채팅'에 안 읽은 개수 배지(99+), 채팅을 열면 '여기부터 새 메시지' 선으로 스크롤, 내 메시지 옆에 `읽음 ✓` / `엄마·지아 안 읽음`. `reads` 컬렉션 신설(각자 자기 문서만 쓰기) — **Firestore 규칙 변경 필요**. 앱이 백그라운드일 때 온 글은 읽음 처리 안 함. 읽음 정보를 못 불러오면 글자만 숨기고 배지는 기기 기준으로 동작. `chat.js`(`FVER chat '?v=1.20'`), `index.html`(배지, `main.js?v=1.20`) |
| v1.21 | 2026-10-25 | **게임 점수판 + 달력 공휴일.** ① `js/scores.js`(신규): 게임·도구 탭에 `🏆 가족 최고 기록` 줄(보기/닫기) — 게임 3개(산수 몬스터·스피드 매쓰·동물 달리기 무한 모드)별 4명 순위(🥇🥈🥉). 게임이 localStorage에 저장한 최고 기록을 읽어 올림(게임 파일 수정 없음), 기록은 올라가기만 함. `games.js`가 게임을 닫을 때 `hub:gameclosed` 이벤트를 보냄. `scores` 컬렉션 신설 — **Firestore 규칙 변경 필요**. ② `js/holidays.js`(신규) + `calendar.js`: 2026~2030 공휴일(대체공휴일 포함)을 빨간 날로 표시, 날짜를 누르면 이름 안내. `main.js`(`FVER`: calendar·scores `?v=1.21`, 목록에 scores), `index.html`(점수판 줄, `main.js?v=1.21`, `games.js?v=1.21`) |
| v1.22 | 2026-10-25 | **아이스크림 가게 타이쿤 추가**(`games/ice-cream/`, 게임·티켓 1장). 개발방 파일을 허브에서 밸런스 수정: 목표에서 업그레이드 배율 제거, 꾸미기·냉동고·팁 단계 확장, 꾸미기 수집 6종, 못 깰 때 응원(목표 -10%씩). 점수판에 `아이스크림(클리어한 일차)`·`붕어빵(장사한 날)` 추가(`scores.js`의 `BOARD`). 2인용 게임은 보류(미등록). `games.js`/`main.js` 태그 `?v=1.22`(`FVER scores`도 1.22) |
| v1.23 | 2026-10-25 | **게임 3개 추가: 체스·스도쿠·짝 맞추기**(`games/chess`, `games/sudoku`, `games/memory-match`, 각 티켓 1장, 개발방 파일 수정 없이 등록). 점수판에 체스(이긴 횟수)·스도쿠(9×9 클리어)·짝 맞추기(클리어한 단계) 추가. `games.js`/`main.js` 태그 `?v=1.23`(`FVER scores`도 1.23) |


## 부록: 동물 달리기 '이어서 하기' 주의 (게임 개발방에 새 버전 요청할 때)
- 게임 파일 안의 `중단 저장 / 이어서 하기 (허브 추가)` 블록(`snapRun/getRun/bankRun/resumeRun/clrRun`, `RKEY='animalRunV6run'`)과 `startGame`의 `bankRun()`, `fin`의 `clrRun()`, `toMenu`의 `clrRun()`, `loop`의 2초 저장, `visibilitychange`/`pagehide`의 `snapRun()` 호출은 **새 버전에서도 반드시 유지**해야 한다. (개발방 새 버전을 받으면 이 기능이 빠졌는지 먼저 확인)
- 허브 쪽 입장 티켓: 앱을 닫았다가 5분 넘어 다시 들어오면 입장 티켓이 다시 차감된다(이어서 하기 포함). 필요하면 유예 시간을 늘리는 것을 검토.

## 부록: 체스 / 스도쿠 / 짝 맞추기 메모 (v1.23)
- 개발방 파일을 **수정 없이 그대로** 등록함(허브 호환 조건 충족, 자체 시험 통과). 새 버전을 받으면 그대로 교체하면 됨.
- 모두 세로 고정(450×800 화면을 비율에 맞춰 줄임), 오른쪽 위 ⏸️ 버튼, 백그라운드로 가면 자동 일시정지, 판 도중 자동 저장 + 이어서 하기.
- 체스: 이동 규칙을 perft(표준 시험 국면 5종)로 검증해 전부 일치(캐슬링·앙파상·승진 포함). 컴퓨터 레벨 1·2·3(고수가 초보를 이김). 저장 `chessV1`(rec 레벨별 승·패·무, pvp 2인 승수), `pvpChessWins`(2인 승수 별도 키). 판 도중 `chessV1run`.
- 스도쿠: 모든 퍼즐이 해가 하나뿐임을 검증(4×4/6×6/9×9 쉬움·보통·어려움), 생성 속도 수 ms. 오늘의 퍼즐은 날짜가 시드라 같은 날 같은 문제(가족이 같은 퍼즐로 겨룰 수 있음). 저장 `sudokuV1`(best 최단 초, clears 클리어 횟수, streak …), `sudokuV1run`.
- 짝 맞추기: 단계가 계속 올라감(2쌍 → 최대 15쌍, 6단계부터 시간 제한, 4단계부터 틀릴 수 있는 횟수 제한, 12단계부터 틀리면 카드 자리 바뀜). 저장 `memoryV1`(level, bestLevel, stars …), `memoryV1run`.
- 점수판 반영(`scores.js` `BOARD`): 체스 = 컴퓨터 이긴 횟수(레벨 1~3 합), 스도쿠 = 9×9(보통+어려움) 클리어 횟수(쉬운 판·오늘의 퍼즐은 반복으로 올릴 수 있어 제외), 짝 맞추기 = `bestLevel-1`(클리어한 단계).
- 입장 티켓: 세 게임 모두 1장(`games.js`의 `cost`). 두뇌 게임은 무료로 하고 싶으면 그 줄의 `cost: 1`만 지우면 됨.

## 부록: 아이스크림 가게 타이쿤 메모 (v1.22)
- 개발방에서 만든 파일을 **허브에서 직접 수정해 등록**함. **개발방에서 새 버전을 받아 교체할 때는 아래 수정이 빠지지 않았는지 확인**(없으면 다시 적용):
  1. `gmul()`: 장소 효과만 반영(업그레이드·도우미 배율을 목표에 넣지 않음) — 돈을 써도 목표가 같이 올라 정체되던 문제 해결.
  2. 업그레이드 단계 확장: 간판·의자·장식 최대 6(가격 …8000/20000/50000), 냉동고 최대 6칸 추가(25000/40000), 팁 보너스 최대 10, `COS`(꾸미기 수집 6종: 15천~40만 코인, 가게 양옆에 표시, `save.un.c1~c6`).
  3. 응원 기능: 같은 날 목표미달/게임오버마다 목표 -10%(최대 -40%), `save.tr={d,n}`, `trN()`/`goalOf()`(= `goalOf0` × 응원).
  4. 장식 이모지는 3개까지만 표시(수집 장식 자리).
- 저장: `iceCreamV1`(coins, day, bestDay …), 하루 도중 `iceCreamV1run`. 점수판은 `bestDay-1`(클리어한 일차)을 읽음.
- 밸런스 시험(봇, 탭 간격): 0.5·1.0·1.4초 → 50일차까지 무난, 2.0초 → 응원 덕에 50일차(하트 게임오버 몇 번), 2.6초 → 20일차 정체. 실제 아이 플레이로는 아직 미확인. 조정할 곳: `goalOf0`(목표), `UPS`/`COS`(가격), `spawnC`·`base`(참을성).
- 알려진 한계: 폰을 가로로 들면 화면이 작게 보임(세로 고정형). 하트 3개 게임오버는 오답 서빙·손님 이탈로만 깎임.

## 부록: 붕어빵 타이쿤 / H1 골프맵 메모
- 붕어빵 타이쿤: 저장 키 `bungeoppangV1`. 하루(약 2분) 도중에는 저장하지 않음(앱이 꺼지면 그날 진행 분실, 홈 버튼으로 나가면 일시정지로 유지). 필요하면 동물 달리기처럼 '이어서 하기'를 추가할 수 있음. 난이도 조정 후보: 초반(2~7일차) 목표가 수입보다 빨리 커짐, 별 기준이 평범한 실력에는 높음, 35일차 이후 코인 쓸 곳이 없음.
- H1 골프맵: 외부 CDN(Tailwind, FontAwesome, Google Fonts)을 쓰므로 인터넷이 필요. 파일 안 제목은 '35개 구장'인데 실제 자료는 38곳. 요금·거리 등은 AI가 만든 자료라 예약 전 각 골프장 공식 사이트에서 확인해야 함.
