# 그린스텝 — 친환경 행동 실천 챌린지 웹앱 구현 계획

## Context

학교·회사가 기간을 정해 여는 친환경 캠페인을 운영할 도구가 없다. 지금은 보통 단톡방과 스프레드시트로 굴러가는데, 집계가 수작업이고 참가자는 자기 기여가 전체에 어떻게 쌓이는지 볼 수 없어 캠페인 중반에 동력이 꺼진다.

이 앱은 그 루프를 웹으로 옮긴다. 참가자는 초대코드로 30초 안에 진입해 매일 실천 항목을 탭 한 번으로 체크하고, 전체 리더보드와 공동 CO2 절감 게이지에서 자기 기록이 즉시 반영되는 걸 본다. 관리자는 캠페인·항목·현황을 웹에서 직접 관리한다.

**결과물**: 실제 캠페인 1회를 운영할 수 있는 배포 가능한 웹앱 (`C:\Users\user\Desktop\Challenge`, 현재 빈 디렉터리 → 신규 프로젝트).

## 확정된 설계 결정

| 항목 | 결정 | 이유 |
|---|---|---|
| 사용 맥락 | 학교/회사 캠페인 (기간 한정, 참가자 다수) | 참가자 식별과 집계가 핵심 |
| 인증 방식 | 체크 완료 + 사진·메모는 **선택** | 마찰 최소화, 사진은 동기부여용 |
| 계정 | 초대코드 + 이메일·비밀번호 + 닉네임 | 익명 로그인이 프로젝트에서 비활성이라 2026-08-05 전환 |
| 동기부여 | 전체 리더보드 + 공동 CO2 게이지 | 경쟁과 협력을 동시에 |
| 스택 | Next.js 15 (App Router) + Supabase | Supabase MCP 연결됨, Vercel 무료 배포 |
| 관리자 | 기본 관리자 페이지 (캠페인/항목 CRUD + 현황) | 실제 운영 가능한 최소 단위 |

### 비범위 (YAGNI — 명시적으로 만들지 않음)
좋아요·댓글, 푸시 알림, 팀/부서 대항전, 개인 스트릭 뱃지, 인증샷 신고·승인 큐, CSV 내보내기, 다국어.

---

## 아키텍처

```
Next.js 15 App Router (TypeScript, Tailwind)
  ├─ 클라이언트 컴포넌트 → Supabase JS (RLS로 보호된 직접 조회/쓰기)
  ├─ 서버 액션 → 초대코드 검증·참가자 생성, 관리자 코드 검증 (service role 필요 작업만)
  └─ Supabase
       ├─ Postgres (테이블 4 + 뷰 2)
       ├─ Auth (anonymous sign-in)
       └─ Storage (checkin-photos 버킷)
```

핵심 원칙: **집계는 전부 DB 뷰에서 한다.** 클라이언트가 체크인을 전부 내려받아 합산하는 구조는 참가자가 늘면 바로 깨진다.

## 데이터 모델

```sql
-- 캠페인
campaigns (
  id uuid pk, name text, invite_code text unique,       -- 예: 'GREEN2026'
  admin_code text,                                       -- 관리자 진입용 (hash 저장)
  start_date date, end_date date,
  goal_co2_g bigint,                                     -- 공동 목표
  created_at timestamptz
)

-- 실천 항목 (관리자가 정의)
challenges (
  id uuid pk, campaign_id fk, title text, description text,
  icon text,                                             -- 이모지 1자
  points int, co2_saved_g int,                           -- 1회 실천당
  sort_order int, is_active bool
)

-- 참가자
participants (
  id uuid pk, campaign_id fk, auth_user_id uuid,         -- auth.users 익명 계정
  nickname text, created_at timestamptz,
  unique (campaign_id, nickname),
  unique (campaign_id, auth_user_id)
)

-- 체크인 (핵심 테이블)
checkins (
  id uuid pk, participant_id fk, challenge_id fk, campaign_id fk,
  checkin_date date,                                     -- 참가자 로컬 날짜
  photo_path text null, memo text null,
  points int, co2_g int,                                 -- 체크인 시점 값 복사(스냅샷)
  created_at timestamptz,
  unique (participant_id, challenge_id, checkin_date)    -- 하루 1회 제한
)
```

**포인트·CO2를 checkins에 복사 저장하는 이유**: 관리자가 나중에 항목 값을 수정해도 과거 기록과 리더보드가 소급 변경되지 않는다. 이건 반정규화가 아니라 의도된 스냅샷이다.

**뷰 2개** (RLS 우회 방지를 위해 `security_invoker = true`):
- `leaderboard` — `campaign_id, participant_id, nickname, total_points, total_co2_g, checkin_count`, 포인트 내림차순
- `campaign_totals` — `campaign_id, total_co2_g, participant_count, checkin_count`

**인덱스**: `checkins(campaign_id, checkin_date)`, `checkins(participant_id, checkin_date)`, `campaigns(invite_code)`

## RLS 정책

클라이언트가 DB를 직접 읽고 쓰므로 RLS가 유일한 방어선이다. 모든 테이블 RLS 활성화.

- 현재 사용자의 참가 캠페인을 구하는 헬퍼 함수 `my_campaign_ids()` (SECURITY DEFINER, `participants`에서 `auth.uid()` 조회) — 정책 안에서 `participants`를 직접 조회하면 재귀가 난다.
- `campaigns` / `challenges` / `participants` / `checkins` SELECT: `campaign_id in (select my_campaign_ids())`
- `checkins` INSERT/UPDATE/DELETE: 해당 `participant_id`가 본인 것일 때만
- `participants` INSERT: 정책 없음. 참가는 `join_campaign` RPC(SECURITY DEFINER)로만 가능하고 그 안에서 초대코드를 검증한다. service role 키를 앱에 두지 않기 위한 선택.
- `campaigns` / `challenges` 쓰기: 정책 없음 (관리자 RPC 경유 — Phase 6)
- Storage `checkin-photos`: 경로 `{campaign_id}/{participant_id}/{uuid}.webp`, 본인 폴더에만 업로드, 같은 캠페인 참가자는 읽기 가능

## 화면 / 파일 구조

```
app/
  page.tsx                      참가 화면 — 초대코드 입력
  join/[code]/page.tsx          캠페인 확인 + 가입(이메일·비번·닉네임) 또는 참가
  login/page.tsx                기존 참가자 로그인
  verify-email/page.tsx         이메일 확인 안내
  auth/confirm/route.ts         확인 링크 콜백 — 참가 마무리
  (app)/layout.tsx              하단 탭 네비게이션 + 캠페인 컨텍스트
  (app)/today/page.tsx          홈: 오늘의 챌린지 카드 목록
  (app)/feed/page.tsx           인증 피드 (사진 있는 체크인만, 최신순 무한스크롤)
  (app)/board/page.tsx          공동 CO2 게이지 + 전체 리더보드
  (app)/me/page.tsx             내 기록: 월간 달력 + 누적 통계
  admin/page.tsx                관리자 코드 입력
  admin/[campaignId]/page.tsx   캠페인 설정 · 항목 CRUD · 참가자 현황
components/
  challenge-card.tsx            체크/해제 + 사진·메모 시트 열기
  checkin-sheet.tsx             사진 선택(리사이즈) + 메모 입력
  co2-gauge.tsx                 목표 대비 진행 게이지 + 환산 문구
  leaderboard-table.tsx         순위표 (내 순위 하이라이트·고정)
lib/
  supabase/{client,server}.ts   클라이언트 팩토리
  actions/{join,admin}.ts       서버 액션
  image.ts                      canvas 리사이즈 → WebP (최대 1200px, ~300KB)
  co2.ts                        CO2 g → 사람이 읽는 문구 환산
supabase/migrations/            SQL 마이그레이션
```

**모바일 우선.** 실천 체크는 대부분 휴대폰에서 일어난다. 하단 탭 4개(오늘/피드/순위/나), 카드 탭 영역은 최소 44px.

## CO2 환산 문구 (`lib/co2.ts`)

게이지에 "12,480g"만 띄우면 아무 의미가 없다. 기준 상수 하나로 환산해 문구를 만든다: 소나무 1그루 연간 흡수량 ≈ 6,600g CO2. 예) "지금까지 소나무 1.9그루가 1년간 흡수할 CO2를 아꼈어요."

## 시드 챌린지 항목 (8개)

| 항목 | 아이콘 | pt | CO2(g) |
|---|---|---|---|
| 텀블러 사용 | ☕ | 3 | 25 |
| 대중교통·도보 출퇴근 | 🚌 | 5 | 1200 |
| 일회용기 대신 다회용기 | 🥡 | 3 | 40 |
| 잔반 남기지 않기 | 🍚 | 2 | 300 |
| 분리배출 실천 | ♻️ | 2 | 100 |
| 안 쓰는 플러그 뽑기 | 🔌 | 2 | 150 |
| 채식 한 끼 | 🥗 | 4 | 900 |
| 종이 대신 전자문서 | 📱 | 2 | 30 |

값은 공개 환산 자료 기준의 근사치다. 관리자 페이지에서 수정 가능하고, 화면에 "추정치" 표기를 단다.

---

## 구현 단계

각 단계는 독립적으로 동작 확인이 가능하다.

**Phase 1 — 기반**
Next.js 15 + TypeScript + Tailwind 프로젝트 생성, Supabase 프로젝트 연결(`.env.local`), 클라이언트 팩토리 작성. 확인: 빈 페이지가 뜨고 Supabase 연결이 성공한다.

**Phase 2 — 스키마**
마이그레이션으로 테이블 4개 + 뷰 2개 + 인덱스 + RLS 정책 + Storage 버킷 생성. 시드 캠페인 1개와 챌린지 8개 삽입. 확인: `list_tables`로 구조 검증, 익명 키로 남의 캠페인 데이터가 안 보이는지 직접 쿼리로 확인.

**Phase 3 — 참가 플로우**
초대코드 입력 → 캠페인 확인 → 이메일·비밀번호·닉네임 → 가입 → 참가자 생성 → `/today` 이동. 닉네임 중복과 잘못된 코드 처리 포함. 확인: 코드로 진입해 참가자 레코드가 생긴다.

이 프로젝트는 이메일 확인이 필수(`mailer_autoconfirm: false`)라 가입 직후에는 세션이 없다. 가입 시 초대코드와 닉네임을 계정 메타데이터에 실어두고, 확인 링크가 `/auth/confirm` 으로 돌아왔을 때 참가를 마무리한다. 확인이 불필요한 설정으로 바꾸면 가입 즉시 참가되는 경로로 자동 전환된다 — 코드가 양쪽을 모두 다룬다.

**Phase 4 — 체크인 (핵심 루프)**
오늘의 챌린지 목록, 탭으로 체크/해제, 사진·메모 시트, 이미지 리사이즈 후 업로드. 유니크 제약 위반은 "이미 완료" UI로 처리. 확인: 체크 → 새로고침 후에도 유지, 같은 항목 재체크 불가.

**Phase 5 — 대시보드 · 피드 · 내 기록**
뷰를 읽어 게이지와 리더보드 렌더, 사진 피드, 월간 달력. 확인: Phase 4에서 만든 체크인이 세 화면 모두에 반영된다.

**Phase 6 — 관리자**
관리자 코드 진입, 캠페인 생성·설정(기간·목표), 챌린지 항목 CRUD, 참가자 현황 표. 확인: 항목을 추가하면 참가자 화면에 즉시 나타난다.

관리자에게는 계정이 없다. 모든 관리자 함수가 초대코드+관리자 코드를 인자로 받아 매번 검증하고, 코드는 httpOnly 쿠키(`/admin` 경로 한정, 8시간)에 담아 재입력을 면한다.

캠페인 생성은 별도의 '생성 코드'로 막는다(`app_config` 테이블에 bcrypt 해시로 저장, RLS 정책 없음 → 아무도 직접 읽을 수 없음). 이게 없으면 누구나 캠페인을 무제한으로 만들 수 있다.

실천 항목은 기록이 하나라도 있으면 삭제할 수 없다. `checkins` 가 캐스케이드로 딸려 사라지면 참가자의 점수와 기록이 소리 없이 바뀐다. 대신 비활성으로 내린다.

**Phase 7 — 마감**
빈 상태·로딩·에러 UI, 캠페인 기간 밖 처리(시작 전/종료 후 화면), 모바일 반응형 점검, Vercel 배포.

## 검증

- **단위 테스트 (Vitest)**: `lib/co2.ts` 환산, 포인트 스냅샷 계산, 날짜 경계(로컬 자정) 처리
- **E2E (Playwright) 1개**: 초대코드 진입 → 닉네임 설정 → 항목 2개 체크 → 리더보드에 내 닉네임과 점수 노출 → 게이지 증가
- **RLS 검증**: 서로 다른 캠페인 참가자 2명을 만들어, A의 세션으로 B의 캠페인 체크인을 조회·수정 시도 → 모두 차단되는지 확인. 이건 자동화 테스트로 남긴다.
- **수동 확인**: 모바일 뷰포트(375px)에서 체크인 → 사진 업로드 → 대시보드까지 실제 Supabase 프로젝트로 한 바퀴

## 운영 전 확인 필요

- **시드 코드 교체**: 관리자 코드 `ADMIN2026` 과 생성 코드 `CHANGE-ME-BOOTSTRAP` 은 개발용 기본값이다. 관리자 코드는 관리 화면에서 바꾸고, 생성 코드는 SQL 로 바꾼다:
  ```sql
  update public.app_config
  set value_hash = extensions.crypt('새-생성-코드', extensions.gen_salt('bf')), updated_at = now()
  where key = 'campaign_bootstrap_code';
  ```
- **관리자 코드 무차별 대입**: 관리자 RPC 에는 자체 속도 제한이 없다. 실패 시 지연을 넣으면 커넥션 풀을 묶어 오히려 서비스 거부 통로가 되므로 넣지 않았다. 대신 관리자 코드를 길고 무작위하게(16자 이상) 정하는 것으로 대응한다.

- **이메일 발송량**: Supabase 기본 SMTP 는 시간당 소수의 메일만 보낸다. 참가자가 몰리는 캠페인 첫날에 확인 메일이 막힐 수 있으므로 커스텀 SMTP 를 연결하거나, 이메일 확인을 끄고 초대코드를 신뢰하는 쪽을 택한다.
- **리다이렉트 허용 목록**: 배포 도메인을 Authentication → URL Configuration 에 등록해야 확인 링크가 돌아온다.
- **`NEXT_PUBLIC_SITE_URL`**: 배포 환경에 설정 (없으면 요청 헤더로 유추)

## 산출물 저장

승인 후 이 계획서를 프로젝트 안 `docs/plan.md`로 복사해 함께 커밋한다.
