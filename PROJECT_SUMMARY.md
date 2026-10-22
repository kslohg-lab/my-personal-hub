# 📌 My Personal Hub — 프로젝트 정리 (Project Summary)

- **현재 버전:** v1.9
- **마지막 업데이트:** 2026-10-22
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
│  ├─ games.js             ← [일반 스크립트] 게임 목록(GAMES), 전체 화면 플레이어, 내장 Cyber Runner
│  ├─ main.js              ← [모듈] 진입점: 로그인 상태에 따라 chat/todos/videos를 켜고 끔
│  ├─ firebase-init.js     ← [모듈] firebaseConfig, FAMILY(가족 계정), Firebase 초기화, 공유 상태(state)
│  ├─ login.js             ← [모듈] 이름 선택 + 비밀번호 로그인 화면, 로그아웃 버튼
│  ├─ chat.js              ← [모듈] 가족 채팅, 사진, 연결 상태 표시
│  ├─ todos.js             ← [모듈] 가족 일정, 옛 기기 저장 일정 이전
│  ├─ videos.js            ← [모듈] 가족 영상 카드
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
   ├─ travel-picker/   (index.html, thumb.svg)  우리 가족 해외여행 선택 보드
   └─ cyber-runner/    (thumb.svg만 있음)         Cyber Runner (js/games.js 안에 내장)
```
- 배포: GitHub 저장소의 파일이 그대로 반영됨 (반영까지 약 1~2분). 배포 서비스 이름: ______ (직접 기입)

### 하단 메뉴 (4개)
| 탭 | 내용 |
|---|---|
| 홈 | 환영 카드, **우리 가족 영상 카드**(Firestore `videos`, 앱 안에서 유튜브 링크 추가/삭제), YouTube / Instagram 링크 카드 (현재 링크는 각 사이트 첫 화면 placeholder) |
| 가족채팅 | Firebase Firestore 실시간 채팅, 사진 전송 (보낸 사람 이름은 로그인 계정 기준) |
| AI게임 | 게임 카드 목록 → 전체 화면 실행 |
| 일정 | 가족이 함께 보는 일정 (Firestore `todos` 실시간 공유, 추가한 사람/완료한 사람 표시) |

### 코드 구조 — **이 구조를 유지할 것**
- **일반 스크립트(core.js, games.js)는 Firebase와 무관**해야 함. Firebase가 실패해도 탭 전환, 게임은 항상 동작.
- **모듈(main.js 이하)이 Firebase 전담.** Firebase 주소(`https://www.gstatic.com/...`)는 `firebase-init.js`에서만 import하고, 다른 모듈은 `firebase-init.js`에서 가져다 씀. 모듈 간 공유 상태는 `state`(`state.me` 로그인한 사람, `state.db`, `state.auth`).
- **기능 격리:** `main.js`가 chat/todos/videos를 각각 `import()`로 따로 불러오고, 하나가 실패하거나 오류를 내도 로그인과 나머지 기능은 계속 동작. 각 기능 모듈은 `start()` / `stop()`을 export하고, 로그인 시 시작·로그아웃 시 정지됨.
- **새 기능(예: 점수판) 추가 순서:** ① `js/새기능.js`를 만들어 `start`/`stop` export ② `main.js`의 `['chat','todos','videos']` 목록(2곳)에 이름 추가 ③ 필요한 HTML을 `index.html`에, Firestore 규칙에 컬렉션 추가.
- **캐시 버전(`?v=1.9`):** `index.html`과 모든 `js/*.js`의 import/script 주소 끝에 `?v=버전`이 붙어 있음. **파일을 수정해서 올릴 때는 모든 참조의 버전 문자열을 같은 값으로 함께 올릴 것.** (일부만 바꾸면 새 파일과 옛 파일이 섞여 로딩될 수 있음. 한 번에 모두 `grep -rn "?v="`로 확인.)
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
- **Firestore 컬렉션:** `todos` — 필드: `text`, `done`(bool), `doneBy`(완료한 사람 이름 또는 빈 문자열), `by`(추가한 사람), `uid`, `createdAt`(serverTimestamp). 조회: `orderBy('createdAt','asc')` + `limitToLast(200)`, 화면에서 안 한 일정을 먼저 표시.
- **Firestore 컬렉션:** `videos` — 필드: `videoId`(유튜브 11자리 ID), `title`, `by`, `uid`, `createdAt`. 조회: `orderBy('createdAt','desc')` + `limit(20)`. 최신 영상은 큰 카드, 나머지는 작은 줄. 썸네일은 `i.ytimg.com`에서 자동 로드, 카드를 누르면 YouTube로 열림. 영상은 **일부 공개**로 올리고 링크는 코드에 직접 적지 말고 앱에서만 추가할 것.
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
    match /chats/{doc} {
      allow read: if isFamily();
      allow create: if isFamily() && request.resource.data.uid == request.auth.uid;
      allow update, delete: if false;
    }
    match /todos/{doc} {
      allow read: if isFamily();
      allow create: if isFamily() && request.resource.data.uid == request.auth.uid;
      allow update: if isFamily() && request.resource.data.diff(resource.data).affectedKeys().hasOnly(['done', 'doneBy']);
      allow delete: if isFamily();
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

## 4. AI 게임 모듈

### 동작 방식
- 목록은 `js/games.js`의 `GAMES` 배열에서 만들어짐. 항목: `id`, `title`, `desc`, `landscape`(가로 전용), `builtin`(내장).
- 카드 이미지: `games/<id>/thumb.svg` (2:1 가로 비율).
- 카드를 누르면 `games/<id>/index.html`을 **화면 전체를 덮는 iframe**으로 실행 (헤더/하단 메뉴 숨김). 안드로이드 크롬에서는 Fullscreen API도 함께 시도.
- 왼쪽 위 `←` 버튼 또는 **폰 뒤로가기**로 목록 복귀 (`history.pushState` / `popstate` 사용, **뒤로가기 1번**으로 복귀). 다른 탭으로 이동하면 게임은 종료됨. 게임 iframe은 **열고 닫을 때마다 새 iframe으로 갈아 끼움**(`freshFrame()`) — iframe의 `src`를 바꾸면 브라우저 이동 기록이 쌓여 뒤로가기를 두 번 눌러야 하므로 `src`를 직접 바꾸지 말 것. 카드 이미지는 `games/<id>/thumb.svg`라서 `GAMES`의 `id`는 폴더 이름과 같아야 함(내장 러너도 `cyber-runner`).
- **가로 전용 게임**(`landscape: true`, 현재 동물 친구 달리기): 폰이 세로 상태면 iframe을 CSS로 90° 회전해 가로로 채움 → 게임이 "화면을 가로로 돌려주세요"를 띄우지 않고 바로 실행. `↻ 방향` 버튼으로 반대 방향 전환(선택 기억). 폰이 이미 가로면 회전 없이 실행.

### 새 게임 추가 방법
1. `games/새게임이름/index.html` (게임 본체), `games/새게임이름/thumb.svg` (카드 이미지) 추가.
2. `js/games.js`의 `GAMES` 배열에 한 줄 추가. (가로 전용이면 `landscape: true`)
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
- [ ] 홈 화면의 가족 영상: 유튜브 링크를 추가하면 썸네일 카드가 보이고, 누르면 YouTube로 열리며, 삭제가 되는가
- [ ] 일정을 추가하면 다른 기기에서도 바로 보이고, 완료 체크/삭제가 되는가
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
5. **게임 점수 랭킹:** 가족 점수판 (Firestore) — `js/scores.js` 모듈로 추가, 게임 파일 일부 수정 필요(점수가 있는 게임 1~2개부터)
6. **채팅 개선:** 메시지 삭제, 사진을 Firebase Storage로 이동, 알림
7. **홈 화면:** 실제 YouTube / Instagram 링크 연결, 설정/정보 탭
8. **새 게임 추가:** 퍼즐, 틱택토 등 `games/` 모듈로 확장

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
