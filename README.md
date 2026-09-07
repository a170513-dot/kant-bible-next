# KANT BIBLE v2

정적 HTML 사이트를 다음 구조로 전환한 버전입니다.

**Next.js 웹앱 + Supabase Auth + Supabase Database + Supabase Storage + Vercel**

## 들어간 기능

- 성경 66권 자동 페이지: `/bible/luke`, `/bible/romans`
- 각 성경책마다 로그인 없는 **나눔 게시판**
- 각 성경책의 **개관 · 구조와 흐름 · 본문 연구**에 글과 파일 모두 등록
- 닉네임 / 제목 / 내용 / 삭제 비밀번호
- 서버 측 도배 완화 속도 제한
- 관리자 게시글 숨김 / 공개 / 삭제
- Supabase Auth 관리자 로그인 및 비밀번호 재설정
- HTML 강의안 **최대 50MB**
- 개관·구조·본문연구 첨부 파일도 **최대 50MB**
- 6MB 단위 TUS 이어올리기로 Supabase Storage에 직접 업로드
- 강의안 공개 / 비공개 관리
- 강의안 전체화면 뷰어
- 기존 `content_html` 강의안 호환
- 양피지 디자인
- 성경 문화·지리를 모티프로 한 자체 SVG 인포그래픽 배경

## 보안 구조

공개 게시판은 로그인 없이 작성할 수 있지만 브라우저가 Supabase DB에 직접 INSERT하지 않습니다.

`방문자 → Next.js /api/posts → 검증·속도 제한 → Supabase`

게시글은 일반 텍스트로 출력하므로 게시글에 적은 HTML/스크립트가 실행되지 않습니다.

강의안 Storage는 비공개 버킷이며 공개 강의안은 서버가 짧은 유효기간의 Signed URL을 만들어 보여줍니다.

`SUPABASE_SERVICE_ROLE_KEY`는 절대로 GitHub에 올리거나 `NEXT_PUBLIC_` 이름으로 만들면 안 됩니다.

설치 순서는 `SETUP_KO.md`를 따라가세요.
