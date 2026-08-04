-- 관리자 기능.
--
-- 관리자는 참가자 계정과 별개다. 캠페인마다 발급된 관리자 코드로 들어온다.
-- 모든 관리자 함수는 코드를 인자로 받아 매번 검증한다 — 세션이 없으니
-- '한 번 확인했으니 통과' 같은 상태를 둘 곳이 없고, 두는 편이 더 위험하다.
--
-- 오류 규약은 참가 RPC 와 같다: errcode P0001, hint 에 기계용 토큰,
-- message 에 사용자에게 보여줄 한국어.

-- 캠페인 생성을 아무나 할 수 있으면 안 된다. 배포 단위의 비밀 하나를 둔다.
-- RLS 를 켜고 정책을 하나도 만들지 않아 아무 역할도 직접 읽을 수 없다.
create table public.app_config (
  key text primary key,
  value_hash text not null,
  updated_at timestamptz not null default now()
);

alter table public.app_config enable row level security;

comment on table public.app_config is
  '배포 단위 비밀의 해시. SECURITY DEFINER 함수 안에서만 읽힌다.';

-- 기본값. 운영에 올리기 전에 반드시 바꿀 것:
--   update public.app_config set value_hash = extensions.crypt('새코드', extensions.gen_salt('bf'))
--   where key = 'campaign_bootstrap_code';
insert into public.app_config (key, value_hash)
values (
  'campaign_bootstrap_code',
  extensions.crypt('CHANGE-ME-BOOTSTRAP', extensions.gen_salt('bf'))
);

-- 코드 검증 헬퍼 ---------------------------------------------------------
-- 다른 SECURITY DEFINER 함수 안에서만 쓴다. REST 로 노출하지 않는다.
create or replace function public.admin_campaign_id(
  p_invite_code text,
  p_admin_code text
)
returns uuid
language sql
stable
security definer
set search_path = public, extensions
as $$
  select id from public.campaigns
  where invite_code = upper(trim(p_invite_code))
    and admin_code_hash = extensions.crypt(p_admin_code, admin_code_hash);
$$;

revoke all on function public.admin_campaign_id(text, text) from public, anon, authenticated;

create or replace function public.require_admin(
  p_invite_code text,
  p_admin_code text
)
returns uuid
language plpgsql
stable
security definer
set search_path = public, extensions
as $$
declare
  v_id uuid := public.admin_campaign_id(p_invite_code, p_admin_code);
begin
  if v_id is null then
    raise exception '초대코드 또는 관리자 코드가 맞지 않습니다.'
      using errcode = 'P0001', hint = 'ADMIN_DENIED';
  end if;
  return v_id;
end;
$$;

revoke all on function public.require_admin(text, text) from public, anon, authenticated;

-- 캠페인 생성 -----------------------------------------------------------
create or replace function public.admin_create_campaign(
  p_bootstrap_code text,
  p_name text,
  p_invite_code text,
  p_admin_code text,
  p_start_date date,
  p_end_date date,
  p_goal_co2_g bigint
)
returns text
language plpgsql
security definer
set search_path = public, extensions
as $$
declare
  v_ok boolean;
  v_code text := upper(trim(p_invite_code));
begin
  select value_hash = extensions.crypt(p_bootstrap_code, value_hash)
  into v_ok
  from public.app_config where key = 'campaign_bootstrap_code';

  if not coalesce(v_ok, false) then
    raise exception '생성 코드가 맞지 않습니다.'
      using errcode = 'P0001', hint = 'BOOTSTRAP_DENIED';
  end if;

  if v_code !~ '^[A-Z0-9]{4,16}$' then
    raise exception '초대코드는 영문 대문자와 숫자 4~16자여야 합니다.'
      using errcode = 'P0001', hint = 'CODE_INVALID';
  end if;

  if length(p_admin_code) < 8 then
    raise exception '관리자 코드는 8자 이상으로 정해주세요.'
      using errcode = 'P0001', hint = 'ADMIN_CODE_WEAK';
  end if;

  if p_end_date < p_start_date then
    raise exception '종료일이 시작일보다 앞설 수 없습니다.'
      using errcode = 'P0001', hint = 'INVALID_PERIOD';
  end if;

  begin
    insert into public.campaigns
      (name, invite_code, admin_code_hash, start_date, end_date, goal_co2_g)
    values
      (trim(p_name), v_code,
       extensions.crypt(p_admin_code, extensions.gen_salt('bf')),
       p_start_date, p_end_date, greatest(p_goal_co2_g, 0));
  exception when unique_violation then
    raise exception '이미 사용 중인 초대코드입니다.'
      using errcode = 'P0001', hint = 'CODE_TAKEN';
  end;

  return v_code;
end;
$$;

-- 캠페인 현황 -----------------------------------------------------------
create or replace function public.admin_campaign_overview(
  p_invite_code text,
  p_admin_code text
)
returns table (
  id uuid,
  name text,
  invite_code text,
  start_date date,
  end_date date,
  goal_co2_g bigint,
  participant_count bigint,
  checkin_count bigint,
  total_co2_g bigint
)
language plpgsql
stable
security definer
set search_path = public, extensions
as $$
declare
  v_id uuid := public.require_admin(p_invite_code, p_admin_code);
begin
  return query
  select c.id, c.name, c.invite_code, c.start_date, c.end_date, c.goal_co2_g,
         (select count(*) from public.participants p where p.campaign_id = c.id)::bigint,
         (select count(*) from public.checkins k where k.campaign_id = c.id)::bigint,
         (select coalesce(sum(k.co2_g), 0) from public.checkins k where k.campaign_id = c.id)::bigint
  from public.campaigns c where c.id = v_id;
end;
$$;

create or replace function public.admin_update_campaign(
  p_invite_code text,
  p_admin_code text,
  p_name text,
  p_start_date date,
  p_end_date date,
  p_goal_co2_g bigint,
  p_new_admin_code text default null
)
returns void
language plpgsql
security definer
set search_path = public, extensions
as $$
declare
  v_id uuid := public.require_admin(p_invite_code, p_admin_code);
begin
  if p_end_date < p_start_date then
    raise exception '종료일이 시작일보다 앞설 수 없습니다.'
      using errcode = 'P0001', hint = 'INVALID_PERIOD';
  end if;

  if p_new_admin_code is not null and length(p_new_admin_code) < 8 then
    raise exception '관리자 코드는 8자 이상으로 정해주세요.'
      using errcode = 'P0001', hint = 'ADMIN_CODE_WEAK';
  end if;

  update public.campaigns set
    name = trim(p_name),
    start_date = p_start_date,
    end_date = p_end_date,
    goal_co2_g = greatest(p_goal_co2_g, 0),
    admin_code_hash = case
      when p_new_admin_code is null then admin_code_hash
      else extensions.crypt(p_new_admin_code, extensions.gen_salt('bf'))
    end
  where id = v_id;
end;
$$;

-- 실천 항목 -------------------------------------------------------------
create or replace function public.admin_list_challenges(
  p_invite_code text,
  p_admin_code text
)
returns table (
  id uuid,
  title text,
  description text,
  icon text,
  points int,
  co2_saved_g int,
  sort_order int,
  is_active boolean,
  checkin_count bigint
)
language plpgsql
stable
security definer
set search_path = public, extensions
as $$
declare
  v_id uuid := public.require_admin(p_invite_code, p_admin_code);
begin
  return query
  select ch.id, ch.title, ch.description, ch.icon, ch.points, ch.co2_saved_g,
         ch.sort_order, ch.is_active,
         (select count(*) from public.checkins k where k.challenge_id = ch.id)::bigint
  from public.challenges ch
  where ch.campaign_id = v_id
  order by ch.sort_order, ch.title;
end;
$$;

create or replace function public.admin_save_challenge(
  p_invite_code text,
  p_admin_code text,
  p_challenge_id uuid,
  p_title text,
  p_description text,
  p_icon text,
  p_points int,
  p_co2_saved_g int,
  p_sort_order int,
  p_is_active boolean
)
returns uuid
language plpgsql
security definer
set search_path = public, extensions
as $$
declare
  v_id uuid := public.require_admin(p_invite_code, p_admin_code);
  v_challenge uuid;
begin
  if p_challenge_id is null then
    insert into public.challenges
      (campaign_id, title, description, icon, points, co2_saved_g, sort_order, is_active)
    values
      (v_id, trim(p_title), nullif(trim(coalesce(p_description, '')), ''),
       coalesce(nullif(trim(p_icon), ''), '🌱'),
       p_points, p_co2_saved_g, p_sort_order, p_is_active)
    returning id into v_challenge;
  else
    update public.challenges set
      title = trim(p_title),
      description = nullif(trim(coalesce(p_description, '')), ''),
      icon = coalesce(nullif(trim(p_icon), ''), '🌱'),
      points = p_points,
      co2_saved_g = p_co2_saved_g,
      sort_order = p_sort_order,
      is_active = p_is_active
    where id = p_challenge_id and campaign_id = v_id
    returning id into v_challenge;

    if v_challenge is null then
      raise exception '해당 실천 항목을 찾을 수 없습니다.'
        using errcode = 'P0001', hint = 'CHALLENGE_NOT_FOUND';
    end if;
  end if;

  return v_challenge;
end;
$$;

-- 삭제는 기록이 하나도 없을 때만.
-- checkins 가 캐스케이드로 딸려 사라지면 참가자의 점수와 기록이 소리 없이
-- 바뀐다. 이미 쓰인 항목은 비활성으로 내린다.
create or replace function public.admin_delete_challenge(
  p_invite_code text,
  p_admin_code text,
  p_challenge_id uuid
)
returns void
language plpgsql
security definer
set search_path = public, extensions
as $$
declare
  v_id uuid := public.require_admin(p_invite_code, p_admin_code);
  v_used bigint;
begin
  select count(*) into v_used
  from public.checkins where challenge_id = p_challenge_id;

  if v_used > 0 then
    raise exception '이미 %건의 실천 기록이 있는 항목은 삭제할 수 없습니다. 대신 비활성으로 내려주세요.', v_used
      using errcode = 'P0001', hint = 'HAS_CHECKINS';
  end if;

  delete from public.challenges
  where id = p_challenge_id and campaign_id = v_id;
end;
$$;

-- 참가자 현황 -----------------------------------------------------------
create or replace function public.admin_list_participants(
  p_invite_code text,
  p_admin_code text
)
returns table (
  nickname text,
  joined_at timestamptz,
  checkin_count bigint,
  total_points bigint,
  total_co2_g bigint
)
language plpgsql
stable
security definer
set search_path = public, extensions
as $$
declare
  v_id uuid := public.require_admin(p_invite_code, p_admin_code);
begin
  return query
  select p.nickname, p.created_at,
         count(k.id)::bigint,
         coalesce(sum(k.points), 0)::bigint,
         coalesce(sum(k.co2_g), 0)::bigint
  from public.participants p
  left join public.checkins k on k.participant_id = p.id
  where p.campaign_id = v_id
  group by p.id, p.nickname, p.created_at
  order by coalesce(sum(k.points), 0) desc, p.created_at;
end;
$$;

-- 관리자는 참가자 계정이 아닐 수 있으므로 anon 에게도 열어둔다.
-- 코드를 모르면 어느 함수도 통과하지 못한다.
grant execute on function public.admin_create_campaign(text, text, text, text, date, date, bigint) to anon, authenticated;
grant execute on function public.admin_campaign_overview(text, text) to anon, authenticated;
grant execute on function public.admin_update_campaign(text, text, text, date, date, bigint, text) to anon, authenticated;
grant execute on function public.admin_list_challenges(text, text) to anon, authenticated;
grant execute on function public.admin_save_challenge(text, text, uuid, text, text, text, int, int, int, boolean) to anon, authenticated;
grant execute on function public.admin_delete_challenge(text, text, uuid) to anon, authenticated;
grant execute on function public.admin_list_participants(text, text) to anon, authenticated;
