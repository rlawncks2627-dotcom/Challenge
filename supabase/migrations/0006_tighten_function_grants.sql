-- Supabase 는 public 스키마의 함수에 anon/authenticated EXECUTE 를 기본으로 준다.
-- SECURITY DEFINER 함수가 그대로 노출되면 /rest/v1/rpc/... 로 직접 호출된다.
-- 필요한 최소 권한만 남긴다.

-- 트리거 전용 함수. 어떤 역할도 직접 호출할 이유가 없다.
revoke all on function public.stamp_checkin() from public, anon, authenticated;

-- RLS 정책 안에서 평가되므로 authenticated 에게는 EXECUTE 가 반드시 있어야 한다.
-- 반면 anon 은 어차피 아무것도 볼 수 없으니 노출할 이유가 없다.
revoke all on function public.my_campaign_ids() from public, anon;
revoke all on function public.my_participant_ids() from public, anon;
grant execute on function public.my_campaign_ids() to authenticated;
grant execute on function public.my_participant_ids() to authenticated;
