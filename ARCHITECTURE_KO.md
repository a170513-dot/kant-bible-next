# KANT BIBLE v2 최종 구조

## 전체 흐름

```text
방문자
  │
  ├─ /                         홈 · 성경 66권
  ├─ /bible/[slug]             성경책 페이지
  │      ├─ 강의안 목록
  │      └─ 책별 나눔 게시판
  ├─ /lecture/[id]             강의안 전체화면 뷰어
  ├─ /board                    66개 나눔 게시판 입구
  └─ /admin                    관리자

Next.js on Vercel
  │
  ├─ 공개 게시판 API
  │      └─ 입력 검증 · 속도 제한 · 삭제 비밀번호
  │
  └─ Supabase
         ├─ Auth               관리자 로그인
         ├─ Database
         │    ├─ books
         │    ├─ lectures
         │    ├─ posts
         │    ├─ admins
         │    └─ board_rate_limits
         └─ Storage
              └─ lectures      비공개 HTML 파일, 최대 50MB
```

## 성경 66권 페이지

정적 HTML 파일 66개를 만들지 않습니다.

하나의 동적 Next.js 페이지:

`app/bible/[slug]/page.tsx`

가 다음 주소를 자동으로 처리합니다.

- `/bible/genesis`
- `/bible/isaiah`
- `/bible/matthew`
- `/bible/luke`
- `/bible/romans`
- `/bible/revelation`

## 책별 나눔 게시판

각 성경책 페이지 안에 게시판이 하나씩 붙습니다.

게시물에는 `book_slug`가 저장되므로 66개 게시판이 데이터상 서로 분리됩니다.

로그인은 요구하지 않습니다.

작성 시:

1. 닉네임
2. 제목
3. 내용
4. 삭제 비밀번호

를 입력합니다.

공개 글은 누구나 읽고, 작성자는 삭제 비밀번호로 자기 글을 삭제할 수 있습니다.
관리자는 모든 글을 숨기거나 다시 공개하거나 삭제할 수 있습니다.

## 게시판 보호

익명 방문자에게 Supabase 직접 INSERT 권한을 주지 않습니다.

`/api/posts`가 서버에서:

- 입력 길이 검사
- honeypot 검사
- IP+브라우저 정보를 직접 저장하지 않고 솔트된 해시로 변환
- 기본 60분당 5회 등록 제한
- 삭제 비밀번호 해시 처리

후 DB에 저장합니다.

## 강의안 50MB

새 강의안은 DB의 `content_html`에 통째로 넣지 않습니다.

- 실제 HTML: Supabase Storage
- 제목, 설명, 성경책, 공개 여부: Supabase Database

업로드는 브라우저에서 Supabase Storage로 직접 TUS 이어올리기를 사용합니다.
따라서 큰 파일을 Vercel 함수 본문으로 통과시키지 않습니다.

기존 `content_html` 강의안은 호환을 위해 계속 표시합니다.

## 강의안 공개

Storage 버킷은 비공개입니다.

공개된 강의안을 방문자가 열면 Next.js 서버가 짧은 유효기간의 Signed URL을 생성합니다.

강의안은 iframe sandbox 안에서 열어 KANT BIBLE 본체와 격리합니다.

## 디자인

- 양피지 질감
- 고대 지도와 이동 경로
- 예루살렘, 갈릴리, 애굽, 소아시아, 로마, 바벨론 표식
- 두루마리, 방위표, 문화 아이콘 패턴
- 모바일 반응형

배경은 외부 저작물을 복사하지 않고 프로젝트에 포함된 자체 SVG로 구성했습니다.
