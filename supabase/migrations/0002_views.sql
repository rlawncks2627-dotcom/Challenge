-- 집계 뷰. 클라이언트가 체크인을 전부 내려받아 합산하지 않도록 DB 에서 끝낸다.
-- security_invoker = true: 뷰를 조회하는 사용자의 RLS 가 그대로 적용된다.
-- (기본값인 security_definer 뷰였다면 RLS 를 통째로 우회해버린다.)

create view public.leaderboard
with (security_invoker = true) as
select
  ranked.campaign_id,
  ranked.participant_id,
  ranked.nickname,
  ranked.total_points,
  ranked.total_co2_g,
  ranked.checkin_count,
  rank() over (
    partition by ranked.campaign_id
    order by ranked.total_points desc, ranked.checkin_count desc, ranked.nickname
  ) as rank
from (
  select
    p.campaign_id,
    p.id as participant_id,
    p.nickname,
    coalesce(sum(c.points), 0)::bigint as total_points,
    coalesce(sum(c.co2_g), 0)::bigint as total_co2_g,
    count(c.id)::bigint as checkin_count
  from public.participants p
  left join public.checkins c on c.participant_id = p.id
  group by p.campaign_id, p.id, p.nickname
) ranked;

comment on view public.leaderboard is
  '참가자별 누적 점수·CO2·체크인 수와 캠페인 내 순위. 동점은 체크인 수, 그다음 닉네임 순.';

-- 캠페인 전체 합계.
-- participants 와 checkins 를 한 번에 조인하면 합계가 참가자 수만큼 부풀려진다.
-- 스칼라 서브쿼리로 각각 따로 센다.
create view public.campaign_totals
with (security_invoker = true) as
select
  c.id as campaign_id,
  (select coalesce(sum(ck.co2_g), 0)
     from public.checkins ck where ck.campaign_id = c.id)::bigint as total_co2_g,
  (select coalesce(sum(ck.points), 0)
     from public.checkins ck where ck.campaign_id = c.id)::bigint as total_points,
  (select count(*)
     from public.participants p where p.campaign_id = c.id)::bigint as participant_count,
  (select count(*)
     from public.checkins ck where ck.campaign_id = c.id)::bigint as checkin_count
from public.campaigns c;

comment on view public.campaign_totals is
  '캠페인 단위 누적 합계. 공동 목표 게이지가 이 뷰를 읽는다.';
