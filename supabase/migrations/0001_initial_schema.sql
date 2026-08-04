-- 그린스텝 초기 스키마: 캠페인 / 실천항목 / 참가자 / 체크인
--
-- 설계 요점
--  1. checkins 는 실천 시점의 points·co2_g 를 복사 저장한다(스냅샷).
--     관리자가 나중에 항목 값을 고쳐도 과거 기록과 순위가 흔들리지 않는다.
--  2. 그 스냅샷 값은 클라이언트가 보내는 게 아니라 트리거가 challenges 에서
--     직접 찍는다. 클라이언트가 보낸 값을 믿으면 점수를 조작할 수 있다.
--  3. checkins.campaign_id 가 참가자·항목의 캠페인과 어긋나지 않도록
--     복합 외래키로 DB 가 막는다.

create extension if not exists pgcrypto with schema extensions;

-- 캠페인 ---------------------------------------------------------------
create table public.campaigns (
  id uuid primary key default gen_random_uuid(),
  name text not null check (length(trim(name)) between 1 and 60),
  invite_code text not null unique,
  admin_code_hash text not null,
  start_date date not null,
  end_date date not null,
  goal_co2_g bigint not null default 0 check (goal_co2_g >= 0),
  created_at timestamptz not null default now(),

  constraint campaigns_period_valid check (end_date >= start_date),
  constraint campaigns_invite_code_format
    check (invite_code ~ '^[A-Z0-9]{4,16}$'),
  -- 복합 외래키의 대상이 되려면 (id, ...) 조합에 유니크 제약이 필요하다.
  constraint campaigns_id_unique unique (id)
);

comment on column public.campaigns.admin_code_hash is
  '관리자 진입 코드의 bcrypt 해시. 평문은 저장하지 않는다.';

-- 실천 항목 -----------------------------------------------------------
create table public.challenges (
  id uuid primary key default gen_random_uuid(),
  campaign_id uuid not null references public.campaigns(id) on delete cascade,
  title text not null check (length(trim(title)) between 1 and 40),
  description text check (description is null or length(description) <= 200),
  icon text not null default '🌱',
  points int not null default 1 check (points between 1 and 100),
  co2_saved_g int not null default 0 check (co2_saved_g between 0 and 100000),
  sort_order int not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),

  constraint challenges_id_campaign_unique unique (id, campaign_id)
);

create index challenges_campaign_order_idx
  on public.challenges (campaign_id, sort_order);

-- 참가자 ---------------------------------------------------------------
create table public.participants (
  id uuid primary key default gen_random_uuid(),
  campaign_id uuid not null references public.campaigns(id) on delete cascade,
  auth_user_id uuid not null references auth.users(id) on delete cascade,
  nickname text not null check (length(trim(nickname)) between 1 and 20),
  created_at timestamptz not null default now(),

  constraint participants_one_per_campaign unique (campaign_id, auth_user_id),
  constraint participants_id_campaign_unique unique (id, campaign_id)
);

-- 닉네임 중복은 대소문자를 구분하지 않는다. '민수' 와 'MINSU'/'minsu' 혼선 방지.
create unique index participants_nickname_unique
  on public.participants (campaign_id, lower(trim(nickname)));

create index participants_auth_user_idx
  on public.participants (auth_user_id);

-- 체크인 ---------------------------------------------------------------
create table public.checkins (
  id uuid primary key default gen_random_uuid(),
  campaign_id uuid not null,
  participant_id uuid not null,
  challenge_id uuid not null,
  checkin_date date not null,
  photo_path text,
  memo text check (memo is null or length(memo) <= 200),
  points int not null default 0 check (points >= 0),
  co2_g int not null default 0 check (co2_g >= 0),
  created_at timestamptz not null default now(),

  -- 하루에 같은 항목은 한 번만.
  constraint checkins_once_per_day unique (participant_id, challenge_id, checkin_date),

  -- 참가자와 항목이 모두 같은 캠페인에 속해야 한다.
  constraint checkins_participant_fk
    foreign key (participant_id, campaign_id)
    references public.participants (id, campaign_id) on delete cascade,
  constraint checkins_challenge_fk
    foreign key (challenge_id, campaign_id)
    references public.challenges (id, campaign_id) on delete cascade
);

create index checkins_campaign_date_idx
  on public.checkins (campaign_id, checkin_date desc);

create index checkins_participant_date_idx
  on public.checkins (participant_id, checkin_date desc);

-- 인증 피드는 사진 있는 체크인만 최신순으로 읽는다.
create index checkins_photo_feed_idx
  on public.checkins (campaign_id, created_at desc)
  where photo_path is not null;

-- 체크인 값 확정 트리거 -------------------------------------------------
-- 클라이언트는 participant_id / challenge_id / 날짜 / 사진 / 메모만 보낸다.
-- campaign_id 와 점수는 여기서 서버가 확정한다.
create or replace function public.stamp_checkin()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_challenge public.challenges%rowtype;
  v_campaign public.campaigns%rowtype;
  v_participant public.participants%rowtype;
begin
  select * into v_challenge
  from public.challenges where id = new.challenge_id;

  if not found then
    raise exception '존재하지 않는 실천 항목입니다.' using errcode = 'foreign_key_violation';
  end if;

  if not v_challenge.is_active then
    raise exception '지금은 참여할 수 없는 실천 항목입니다.' using errcode = 'check_violation';
  end if;

  select * into v_participant
  from public.participants where id = new.participant_id;

  if not found then
    raise exception '존재하지 않는 참가자입니다.' using errcode = 'foreign_key_violation';
  end if;

  if v_participant.campaign_id <> v_challenge.campaign_id then
    raise exception '다른 캠페인의 실천 항목입니다.' using errcode = 'check_violation';
  end if;

  select * into v_campaign
  from public.campaigns where id = v_challenge.campaign_id;

  if new.checkin_date < v_campaign.start_date
     or new.checkin_date > v_campaign.end_date then
    raise exception '캠페인 기간(% ~ %) 밖의 날짜입니다.',
      v_campaign.start_date, v_campaign.end_date using errcode = 'check_violation';
  end if;

  -- 클라이언트가 무엇을 보냈든 서버 값으로 덮어쓴다.
  new.campaign_id := v_challenge.campaign_id;
  new.points := v_challenge.points;
  new.co2_g := v_challenge.co2_saved_g;

  return new;
end;
$$;

create trigger checkins_stamp_values
  before insert or update on public.checkins
  for each row execute function public.stamp_checkin();
