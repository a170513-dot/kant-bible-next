# KANT BIBLE v2 설치 순서

기존 사이트를 바로 지우지 말고 새 버전을 먼저 테스트한 뒤 교체하는 방식을 권장합니다.

## 1. Supabase SQL

Supabase → **SQL Editor → New query**

`supabase/migration-v2.sql` 전체를 붙여넣고 실행합니다.

마지막에:

`KANT BIBLE v2 데이터베이스 준비 완료`

가 나오면 성공입니다.

기존 `books`, `lectures`, `admins` 데이터는 삭제하지 않습니다.

## 2. 관리자 확인

이미 관리자 이메일을 등록했다면 그대로 유지됩니다.

```sql
select * from public.admins;
```

## 3. Vercel 환경변수

Vercel → **Settings → Environment Variables**

추가할 값:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`
- `NEXT_PUBLIC_SITE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`
- `BOARD_DELETE_PEPPER`
- `BOARD_RATE_LIMIT_SALT`

`NEXT_PUBLIC_SITE_URL` 예:

`https://kant-bible.vercel.app`

`SUPABASE_SERVICE_ROLE_KEY`는 비밀키입니다. GitHub 파일에 넣지 않습니다.

`BOARD_DELETE_PEPPER`, `BOARD_RATE_LIMIT_SALT`는 서로 다른 긴 임의 문자열을 사용하세요.

## 4. Supabase Auth 주소

Supabase → **Authentication → URL Configuration**

Site URL:

`https://kant-bible.vercel.app`

Redirect URLs:

`https://kant-bible.vercel.app/admin`

## 5. GitHub

기존 저장소를 바로 갈아엎기보다 새 저장소를 하나 만드는 편이 안전합니다.

예:

`kant-bible-next`

이 ZIP 안의 파일을 새 저장소 루트에 올립니다.

## 6. Vercel

Vercel → **Add New → Project**

새 GitHub 저장소를 Import합니다.

Framework Preset은 Next.js로 자동 인식됩니다.

환경변수를 넣고 Deploy 합니다.

## 7. 테스트 순서

1. `/` 홈
2. `/bible/luke`
3. 누가복음 게시판에 로그인 없이 글 등록
4. 삭제 비밀번호로 자기 글 삭제
5. `/admin` 관리자 로그인
6. 작은 HTML 강의안 업로드
7. 공개 강의안 전체화면 보기
8. 휴대폰에서 `https://kant-bible.vercel.app` 접속

## 8. 50MB 강의안 구조

새 강의안은 DB 본문 칸에 넣지 않습니다.

`HTML 파일 → Supabase Storage`

`제목·책·설명·공개 여부 → Supabase Database`

로 나눕니다.

브라우저에서 TUS 이어올리기를 사용하므로 큰 HTML을 Vercel 서버 함수로 통째로 보내지 않습니다.

## 9. 기존 content_html 강의안

기존 강의안은 새 사이트에서도 그대로 열립니다.

나중에 DB 용량을 줄이고 싶으면 선택적으로:

`node scripts/migrate-content-html-to-storage.mjs`

를 실행해 Storage로 옮길 수 있습니다.

## 10. 공개 게시판 운영

현재 포함된 보호:

- 봇용 숨은 입력칸(honeypot)
- 기본 시간당 5회 등록 제한
- 글 길이 제한
- 작성자 삭제 비밀번호
- 관리자 숨김/삭제

실사용자가 많아지면 Cloudflare Turnstile 같은 CAPTCHA 추가를 권장합니다.


## 11. 책별 자료 기능

관리자 `/admin`에 **책별 자료** 탭이 추가되어 있습니다.

성경책을 고른 뒤 다음 영역 중 하나를 선택합니다.

- 개관
- 구조와 흐름
- 본문 연구

각 영역에는:

- 글 직접 입력
- 파일 업로드

둘 다 가능합니다.

지원하는 주요 파일 형식:

- HTML / HTM
- PDF
- TXT / Markdown
- PNG / JPG / WEBP / GIF
- DOCX
- PPTX
- XLSX

파일 최대 크기는 50MB입니다.
