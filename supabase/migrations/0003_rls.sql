-- RLS. 익명 로그인을 쓰기 때문에 여기가 유일한 방어선이다.
--
-- 정책 안에서 participants 를 직접 조회하면 participants 자신의 정책이 다시
-- 평가되면서 무한 재귀가 난다. SECURITY DEFINER 헬퍼로 그 고리를 끊는다.

create or replace function public.my_campaign_ids()
returns setof uuid
language sql
stable
security definer
set search_path = public
as $$
  select campaign_id from public.participants where auth_user_id = auth.uid();
$$;

create or replace function public.my_participant_ids()
returns setof uuid
language sql
stable
security definer
set search_path = public
as $$
  select id from public.participants where auth_user_id = auth.uid();
$$;

revoke all on function public.my_campaign_ids() from public;
revoke all on function public.my_participant_ids() from public;
grant execute on function public.my_campaign_ids() to authenticated;
grant execute on function public.my_participant_ids() to authenticated;

alter table public.campaigns enable row level security;
alter table public.challenges enable row level security;
alter table public.participants enable row level security;
alter table public.checkins enable row level security;

-- 읽기: 내가 참가한 캠페인의 것만 -----------------------------------------
create policy "참가 캠페인만 조회"
  on public.campaigns for select to authenticated
  using (id in (select public.my_campaign_ids()));

create policy "참가 캠페인의 실천 항목만 조회"
  on public.challenges for select to authenticated
  using (campaign_id in (select public.my_campaign_ids()));

create policy "같은 캠페인 참가자만 조회"
  on public.participants for select to authenticated
  using (campaign_id in (select public.my_campaign_ids()));

create policy "같은 캠페인 체크인만 조회"
  on public.checkins for select to authenticated
  using (campaign_id in (select public.my_campaign_ids()));

-- 쓰기: 체크인만, 그것도 본인 것만 ----------------------------------------
-- points·co2_g·campaign_id 는 클라이언트가 뭘 보내든 트리거가 덮어쓴다.
create policy "본인 체크인만 생성"
  on public.checkins for insert to authenticated
  with check (participant_id in (select public.my_participant_ids()));

create policy "본인 체크인만 수정"
  on public.checkins for update to authenticated
  using (participant_id in (select public.my_participant_ids()))
  with check (participant_id in (select public.my_participant_ids()));

create policy "본인 체크인만 삭제"
  on public.checkins for delete to authenticated
  using (participant_id in (select public.my_participant_ids()));

-- campaigns / challenges / participants 에는 쓰기 정책이 없다.
-- 참가 등록과 관리자 작업은 SECURITY DEFINER RPC 를 통해서만 이뤄진다.
