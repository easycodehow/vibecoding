# 작업 기록

이 파일은 세션 간 작업 내용을 이어가기 위한 기록용 파일입니다.
새 세션 시작 시 클로드코드가 가장 최근 기록을 먼저 확인하고 보고합니다.
기존 기록은 지우지 않고 아래에 계속 누적합니다.

---

## 2026-07-11
- CLAUDE.md 확인 완료
- PROGRESS.md 파일 최초 생성 (빈 틀)
- 현재 상태: 게시판(커뮤니티) 기능 추가 작업 시작 전, 1단계(Supabase 기본 설정) 대기 중

### 다음 작업 제안
- 1단계: Supabase 계정/프로젝트 생성 여부 확인 후, .env.local 설정 및 .gitignore 확인부터 진행

---

## 2026-07-11 (1단계 완료)
- Supabase 프로젝트 생성 완료 (사용자 수동 작업)
  - Project URL: https://uwblesyqopvonxwxwzfj.supabase.co
  - anon public key 확보
- `.env.local` 파일 생성 (Project URL, anon key 저장)
- `.gitignore`에 `.env.local` 추가 확인
- 참고: 이 프로젝트는 빌드 도구 없는 순수 정적 HTML/JS 구조라 `.env.local`이 브라우저에서 자동 로드되지 않음. 실제 Supabase 클라이언트 초기화 시에는 `js/supabase-config.js` 같은 파일에 URL/anon key를 직접 넣는 방식 필요 (anon key는 RLS로 보호되어 공개돼도 안전하도록 설계됨)

### 다음 작업 제안
- 2단계: 로그인 기능 구현 (Supabase 이메일 로그인/회원가입, 로그인 상태 관리, 로그인/로그아웃 UI)
  - 이때 `js/supabase-config.js` 파일도 함께 생성 필요

---

## 2026-07-11 (2단계 - 게시판 폴더/레이아웃 생성)
- 게시판 관련 파일만 신규 생성 (더미 데이터, 기능 없이 레이아웃만)
  - `css/board.css` - 게시판 전용 스타일 (기존 style.css의 색상 변수/톤 재사용)
  - `js/board.js`, `js/auth.js` - 빈 파일 (이후 단계에서 구현 채움)
  - `board.html` - 목록 페이지 (더미 게시글 5개, 테이블형, 검색창, 글쓰기 버튼, 페이지네이션 1~5)
  - `board-write.html` - 글쓰기/수정 폼 (제목·내용·이미지 업로드+미리보기, `?id=`로 수정모드 구분 예정)
  - `board-detail.html` - 상세보기 (제목/작성자/작성일/조회수, 이미지, 본문, 수정/삭제 버튼, 더미 댓글 2개 + 댓글 입력창)
  - `login.html`, `signup.html` - 이메일/비밀번호 로그인·회원가입 폼
- 모든 신규 페이지는 index.html의 헤더 nav/푸터 마크업을 재사용, 헤더의 '커뮤니티' 메뉴는 board.html로 연결
- hero가 없는 페이지라 `js/main.js`(hero 요소 전제로 스크롤 효과 동작)는 포함하지 않고, `.header-solid` 클래스로 헤더를 고정 불투명 배경(#2D1B4E)으로 처리
- `index.html`은 이번 단계에서 의도적으로 수정하지 않음 (사용자 요청 범위: "게시판 관련 파일만") → 기존 '커뮤니티' 메뉴는 여전히 `#community`를 가리키는 상태

### 다음 작업 제안
- `index.html`의 '커뮤니티' 메뉴 링크를 `board.html`로 변경할지 결정 (CLAUDE.md 2단계 요구사항)
- 3단계: 로그인 기능 구현 (Supabase 이메일 로그인/회원가입, 로그인 상태 관리, 헤더 로그인/로그아웃 UI, `js/supabase-config.js` 생성)

---

## 2026-07-11 (폴더 정리 - 게시판 전용 파일을 board/ 폴더로 이동)
- 게시판 전용 파일만 `board/` 폴더로 이동, 로그인 관련 파일은 루트에 유지
  - 이동: `board.html`, `board-write.html`, `board-detail.html` → `board/`
  - 이동: `css/board.css` → `board/css/board.css`
  - 이동: `js/board.js` → `board/js/board.js`
  - 유지(루트): `login.html`, `signup.html`, `js/auth.js` — 로그인은 게시판 전용 기능이 아니라 사이트 전역 기능이라는 판단
- 이동된 `board/*.html` 3개 파일 내부 경로 수정
  - 루트 리소스 참조에 `../` 추가: `font/`, `css/style.css`, `index.html`, `img/hero.jpg`
  - `board.css`, `board.js`, board 페이지 간 링크(board.html/board-write.html/board-detail.html)는 같은 폴더라 경로 그대로 유지
- 루트에 남은 `login.html`, `signup.html`이 참조하던 `css/board.css`, `board.html` 경로를 `board/css/board.css`, `board/board.html`로 갱신
  (참고: `css/board.css`는 이름과 달리 로그인/회원가입 폼 스타일도 포함하고 있어 login/signup에서도 계속 참조함)
- `index.html`은 애초에 board 관련 경로를 참조하지 않아(커뮤니티 메뉴가 `#community` 앵커) 수정 불필요

### 다음 작업 제안
- `index.html`의 '커뮤니티' 메뉴 링크를 `board/board.html`로 변경할지 결정
- 3단계: 로그인 기능 구현 (Supabase 이메일 로그인/회원가입, 로그인 상태 관리, 헤더 로그인/로그아웃 UI, `js/supabase-config.js` 생성)

---

## 2026-07-11 (2단계 - index.html 최근 게시물 섹션 추가)
- 비어있던 `<section id="community">`에 최근 게시물 카드 3개(더미, board.html의 id 5/4/3과 동일한 제목·작성자·작성일) 추가
  - 각 카드는 `<a class="card recent-post-card">`로 구성, 클릭 시 `board/board-detail.html?id=`로 이동
  - 하단에 "커뮤니티 더보기" 링크로 `board/board.html` 연결
  - 실제 Supabase 데이터 연동은 5단계에서 진행 예정 (지금은 레이아웃/링크 구조만)
- `css/style.css`에 `.recent-post-card`, `.recent-post-meta`, `.community-more-link` 스타일 추가 (기존 `.card`, 색상 변수 재사용)
- CLAUDE.md 2단계 체크리스트에서 "index.html 최근 게시물 섹션 추가" 항목 체크 완료
- 미완료로 남은 2단계 항목: 헤더 '커뮤니티' 메뉴를 `board/board.html`로 연결 (현재 `#community` 앵커 유지 중, 별도 작업으로 남김)

### 다음 작업 제안
- 헤더 '커뮤니티' 메뉴 링크를 `board/board.html`로 변경할지 결정 (2단계 마지막 미완료 항목)
- 3단계: 로그인 기능 구현 (Supabase 이메일 로그인/회원가입, 로그인 상태 관리, 헤더 로그인/로그아웃 UI, `js/supabase-config.js` 생성)
