-- 실천 항목 6개 추가.
--
-- 초등학생이 학교와 집에서 오늘 당장 할 수 있는 것들로 골랐다.
-- CO2 값은 공개 환산 자료 기준의 근사치이고, 관리자 화면에서 조정할 수 있다.
-- 이미 쌓인 기록은 체크인 시점 값을 그대로 유지하므로 영향받지 않는다.

insert into public.challenges
  (campaign_id, title, description, icon, points, co2_saved_g, sort_order)
select
  c.id, v.title, v.description, v.icon, v.points, v.co2_saved_g, v.sort_order
from public.campaigns c
cross join (values
  ('몽당연필 끝까지 쓰기',   '짧아진 연필도 끝까지 다 쓰기',              '✏️', 2,   15,  9),
  ('손수건 챙겨 다니기',     '휴지 대신 손수건으로 손 닦기',              '🧣', 3,   60, 10),
  ('빈 방 불 끄기',          '아무도 없는 방의 불 끄기',                  '💡', 2,  120, 11),
  ('계단 이용하기',          '낮은 층은 엘리베이터 대신 계단으로',        '🪜', 3,   50, 12),
  ('양치 컵 사용하기',       '물 틀어놓지 않고 컵에 받아서 양치하기',     '🪥', 2,  200, 13),
  ('쓰레기 줍기(플로깅)',    '길에 떨어진 쓰레기 주워서 버리기',          '🧹', 4,  100, 14)
) as v(title, description, icon, points, co2_saved_g, sort_order)
where not exists (
  select 1 from public.challenges ch
  where ch.campaign_id = c.id and ch.title = v.title
);
