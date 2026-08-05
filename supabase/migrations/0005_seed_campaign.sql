-- 시연·개발용 시드 캠페인.
-- 초대코드 GREEN2026 / 관리자코드 ADMIN2026
--
-- 이 파일은 공개 저장소에 있다. 여기 적힌 관리자 코드는 그대로 쓰면 안 된다.
-- 배포한 캠페인의 관리자 코드는 관리 화면에서 반드시 새로 정할 것.
-- 운영 캠페인은 관리자 화면에서 만든다. 이 시드는 개발 중 확인용이다.
--
-- CO2 절감량은 공개 환산 자료 기준의 근사치다. 화면에도 '추정치'로 표기하고,
-- 관리자가 캠페인 성격에 맞게 조정할 수 있다.

insert into public.campaigns (
  name, invite_code, admin_code_hash, start_date, end_date, goal_co2_g
)
values (
  '2026 친환경 챌린지',
  'GREEN2026',
  extensions.crypt('ADMIN2026', extensions.gen_salt('bf')),
  date '2026-08-01',
  date '2026-08-31',
  500000                                    -- 500kg. 소나무 약 76그루의 연간 흡수량.
)
on conflict (invite_code) do nothing;

insert into public.challenges
  (campaign_id, title, description, icon, points, co2_saved_g, sort_order)
select
  c.id, v.title, v.description, v.icon, v.points, v.co2_saved_g, v.sort_order
from public.campaigns c
cross join (values
  ('텀블러 사용',          '일회용 컵 대신 개인 텀블러로 음료 마시기',      '☕',  3,   25, 1),
  ('대중교통·도보 이동',   '자가용 대신 대중교통이나 걷기로 이동하기',      '🚌',  5, 1200, 2),
  ('다회용기 사용',        '일회용 포장 용기 대신 다회용기 사용하기',       '🥡',  3,   40, 3),
  ('잔반 남기지 않기',     '먹을 만큼만 담고 음식물 쓰레기 줄이기',         '🍚',  2,  300, 4),
  ('분리배출 실천',        '재활용품을 올바르게 분리해서 배출하기',         '♻️',  2,  100, 5),
  ('안 쓰는 플러그 뽑기',  '대기전력 차단하기',                             '🔌',  2,  150, 6),
  ('채식 한 끼',           '하루 한 끼를 육류 없이 먹기',                   '🥗',  4,  900, 7),
  ('종이 대신 전자문서',   '인쇄 대신 화면으로 보고 서명하기',              '📱',  2,   30, 8)
) as v(title, description, icon, points, co2_saved_g, sort_order)
where c.invite_code = 'GREEN2026'
  and not exists (
    select 1 from public.challenges ch
    where ch.campaign_id = c.id and ch.title = v.title
  );
