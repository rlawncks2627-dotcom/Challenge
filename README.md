# 그린스텝

학교·회사가 기간을 정해 여는 친환경 실천 캠페인 웹앱.

참가자는 초대코드로 들어와 매일 실천 항목을 탭 한 번으로 체크하고, 전체 리더보드와 공동 CO2 절감 게이지에서 자기 기록이 반영되는 걸 본다. 운영자는 캠페인·항목·현황을 웹에서 관리한다.

- 기획과 설계 판단: [`docs/plan.md`](docs/plan.md)
- 스택: Next.js 16 (App Router) · TypeScript · Tailwind v4 · Supabase

## 화면

| 경로 | 용도 |
|---|---|
| `/` | 초대코드 입력 |
| `/join/[code]` | 캠페인 확인 → 가입(이메일·비밀번호·닉네임) 또는 참가 |
| `/login` | 기존 참가자 로그인 |
| `/today` | 오늘의 실천 목록 · 체크 · 사진 인증 |
| `/feed` | 인증샷 피드 |
| `/board` | 공동 CO2 게이지 · 리더보드 |
| `/me` | 누적 기록 · 실천 달력 |
| `/admin` | 운영자 진입 (초대코드 + 관리자 코드) |
| `/admin/new` | 캠페인 만들기 (생성 코드 필요) |

## 개발 환경

```bash
npm install
cp .env.example .env.local   # Supabase 값 채우기
npm run dev
```

`.env.local`:

```
NEXT_PUBLIC_SUPABASE_URL=https://<project-ref>.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=sb_publishable_...
# 배포 환경에서만 필요. 이메일 확인 링크가 돌아올 주소.
NEXT_PUBLIC_SITE_URL=https://<배포 도메인>
```

| 명령 | 하는 일 |
|---|---|
| `npm run dev` | 개발 서버 |
| `npm run build` | 프로덕션 빌드 + 타입 검사 |
| `npm test` | 단위 테스트 (Vitest, `*.test.ts`) |
| `npm run test:e2e` | 브라우저 E2E (Playwright, `e2e/*.spec.ts`) |
| `npm run lint` | ESLint |

E2E 는 확인이 끝난 계정으로 로그인해서 그 뒤를 검증한다. 처음 돌리기 전에 계정과 참가자를 한 번 만들어 둔다:

```sql
insert into auth.users (
  id, instance_id, aud, role, email, encrypted_password,
  email_confirmed_at, created_at, updated_at,
  raw_app_meta_data, raw_user_meta_data,
  confirmation_token, recovery_token, email_change_token_new, email_change
) values (
  gen_random_uuid(), '00000000-0000-0000-0000-000000000000',
  'authenticated', 'authenticated', 'verify-e2e@greenstep.test',
  extensions.crypt('verify-pass-1234', extensions.gen_salt('bf')),
  now(), now(), now(),
  '{"provider":"email","providers":["email"]}'::jsonb, '{}'::jsonb, '', '', '', ''
);

insert into auth.identities (id, user_id, provider_id, provider, identity_data, created_at, updated_at)
select gen_random_uuid(), u.id, u.id::text, 'email',
       jsonb_build_object('sub', u.id, 'email', u.email, 'email_verified', true),
       now(), now()
from auth.users u where u.email = 'verify-e2e@greenstep.test';

insert into public.participants (campaign_id, auth_user_id, nickname)
select c.id, u.id, 'E2E검증'
from public.campaigns c, auth.users u
where c.invite_code = 'GREEN2026' and u.email = 'verify-e2e@greenstep.test';
```

계정 정보는 `E2E_EMAIL` / `E2E_PASSWORD` 로 바꿀 수 있다. 이 계정은 개발용 프로젝트에만 두고 운영 DB 에는 만들지 않는다.

## 데이터베이스

`supabase/migrations/` 의 SQL 을 번호 순서대로 적용한다. 새 프로젝트라면 그대로 실행하면 시드 캠페인(`GREEN2026`)과 실천 항목 8개까지 들어간다.

핵심 설계 두 가지:

- **체크인은 실천 시점의 점수·CO2 를 복사해 저장한다.** 값을 찍는 주체는 클라이언트가 아니라 DB 트리거다. 관리자가 나중에 항목 값을 고쳐도 지난 기록과 순위가 흔들리지 않고, 요청을 조작해 점수를 올릴 수도 없다.
- **집계는 전부 DB 뷰(`leaderboard`, `campaign_totals`)가 한다.** 두 뷰 모두 `security_invoker` 라서 RLS 를 우회하지 않는다.

## 운영 시작 전 해야 할 일

1. **Supabase 인증 설정**
   - Authentication → URL Configuration 에 배포 도메인을 등록한다. 그래야 이메일 확인 링크가 돌아온다.
   - 기본 SMTP 는 발송량 제한이 빡빡하다. 참가자가 몰리는 캠페인 첫날에 확인 메일이 막힐 수 있으므로, 커스텀 SMTP 를 붙이거나 이메일 확인을 끄고 초대코드를 신뢰하는 쪽을 택한다.

2. **시드 코드 교체** — 저장소에 적힌 기본값은 개발용이다.
   - 관리자 코드(`ADMIN2026`): `/admin` 에서 진입 후 캠페인 설정에서 변경
   - 생성 코드(`CHANGE-ME-BOOTSTRAP`): SQL 로 변경
     ```sql
     update public.app_config
     set value_hash = extensions.crypt('새-생성-코드', extensions.gen_salt('bf')),
         updated_at = now()
     where key = 'campaign_bootstrap_code';
     ```

3. **관리자 코드는 길게.** 관리자 RPC 에는 자체 속도 제한이 없다. 실패 시 지연을 넣으면 커넥션 풀을 묶어 오히려 서비스 거부 통로가 되므로 넣지 않았다. 16자 이상 무작위 문자열을 쓴다.

## 배포 (Vercel)

1. [vercel.com/new](https://vercel.com/new) 에서 이 저장소를 가져온다. 빌드 설정은 기본값 그대로 둔다.
2. 환경변수 2개를 등록한다.
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`

   `NEXT_PUBLIC_SITE_URL` 은 없어도 된다. 없으면 요청 헤더(`x-forwarded-host` / `x-forwarded-proto`)에서 주소를 유추하는데, Vercel 은 두 헤더를 채워준다. 커스텀 도메인을 붙여 접속 경로가 여러 개가 되면 그때 명시한다.
3. 배포가 끝나면 그 도메인을 Supabase → Authentication → URL Configuration 의 **Site URL** 과 **Redirect URLs** 에 추가한다. 이걸 빼면 이메일 확인 링크가 돌아오지 못한다.

이후로는 `main` 에 push 할 때마다 자동 배포된다.
