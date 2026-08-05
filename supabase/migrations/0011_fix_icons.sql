-- 아이콘 두 개 교체.
--
-- 🪜(사다리)와 🪥(칫솔)은 2020년에 추가된 이모지라 기기·OS 버전에 따라
-- 빈 네모로 보인다. 오래된 이모지로 바꾼다.
--
-- 이미 적용된 0010 을 고쳐도 운영 DB 에는 반영되지 않으므로 여기서 갱신한다.

update public.challenges set icon = '🏃' where icon = '🪜';
update public.challenges set icon = '🦷' where icon = '🪥';
