-- 참가 등록.
--
-- participants 에는 INSERT 정책이 없다. 참가는 오직 이 함수를 통해서만 이뤄지고,
-- 함수가 초대코드를 검증한다. service role 키를 앱에 두지 않으려는 선택이다.
--
-- 오류 신호 규약: message 는 사용자에게 그대로 보여줄 한국어,
-- hint 는 UI 가 분기할 기계용 토큰. errcode 는 PostgREST 가 400 으로 매핑하는
-- P0001 로 통일한다.

-- 코드 입력 직후 "이 캠페인이 맞나?"를 확인시켜 주는 용도.
-- 로그인 전에도 호출해야 하므로 anon 에게도 열어둔다.
-- 노출되는 것은 캠페인 이름·기간·참가자 수뿐이다.
create or replace function public.campaign_preview(p_invite_code text)
returns table (name text, start_date date, end_date date, participant_count bigint)
language sql
stable
security definer
set search_path = public
as $$
  select
    c.name,
    c.start_date,
    c.end_date,
    (select count(*) from public.participants p where p.campaign_id = c.id)::bigint
  from public.campaigns c
  where c.invite_code = upper(trim(p_invite_code));
$$;

create or replace function public.join_campaign(p_invite_code text, p_nickname text)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_uid uuid := auth.uid();
  v_campaign_id uuid;
  v_participant_id uuid;
  v_nickname text := trim(p_nickname);
begin
  if v_uid is null then
    raise exception '로그인이 필요합니다. 다시 시도해주세요.'
      using errcode = 'P0001', hint = 'AUTH_REQUIRED';
  end if;

  select id into v_campaign_id
  from public.campaigns
  where invite_code = upper(trim(p_invite_code));

  if v_campaign_id is null then
    raise exception '초대코드를 찾을 수 없습니다.'
      using errcode = 'P0001', hint = 'CAMPAIGN_NOT_FOUND';
  end if;

  -- 이미 참가한 캠페인이면 그대로 돌려준다.
  -- 새로고침이나 중복 제출로 오류가 나면 안 된다.
  select id into v_participant_id
  from public.participants
  where campaign_id = v_campaign_id and auth_user_id = v_uid;

  if v_participant_id is not null then
    return v_participant_id;
  end if;

  if length(v_nickname) < 1 or length(v_nickname) > 20 then
    raise exception '닉네임은 1자 이상 20자 이하로 입력해주세요.'
      using errcode = 'P0001', hint = 'NICKNAME_INVALID';
  end if;

  begin
    insert into public.participants (campaign_id, auth_user_id, nickname)
    values (v_campaign_id, v_uid, v_nickname)
    returning id into v_participant_id;
  exception when unique_violation then
    raise exception '이미 사용 중인 닉네임입니다. 다른 이름을 써주세요.'
      using errcode = 'P0001', hint = 'NICKNAME_TAKEN';
  end;

  return v_participant_id;
end;
$$;

revoke all on function public.campaign_preview(text) from public;
grant execute on function public.campaign_preview(text) to anon, authenticated;

-- 참가는 익명 로그인을 마친 뒤에만 가능하다.
revoke all on function public.join_campaign(text, text) from public, anon;
grant execute on function public.join_campaign(text, text) to authenticated;
