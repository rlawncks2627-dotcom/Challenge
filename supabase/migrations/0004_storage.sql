-- 인증샷 저장소.
-- 경로 규약: {campaign_id}/{participant_id}/{uuid}.webp
-- 이 규약 덕분에 경로만 보고 권한을 판단할 수 있다.

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'checkin-photos',
  'checkin-photos',
  false,                                    -- 공개 버킷이 아니다. 서명 URL 로만 읽는다.
  2097152,                                  -- 2MB. 클라이언트가 WebP 로 리사이즈해 올린다.
  array['image/webp', 'image/jpeg', 'image/png']
)
on conflict (id) do nothing;

-- 폴더 비교는 uuid 캐스팅 대신 텍스트로 한다.
-- 누가 규약을 벗어난 경로를 올려도 캐스팅 에러 대신 조용히 거부되게 하려는 것.

create policy "같은 캠페인 인증샷만 조회"
  on storage.objects for select to authenticated
  using (
    bucket_id = 'checkin-photos'
    and (storage.foldername(name))[1] in (select public.my_campaign_ids()::text)
  );

create policy "본인 폴더에만 인증샷 업로드"
  on storage.objects for insert to authenticated
  with check (
    bucket_id = 'checkin-photos'
    and (storage.foldername(name))[2] in (select public.my_participant_ids()::text)
  );

create policy "본인 인증샷만 삭제"
  on storage.objects for delete to authenticated
  using (
    bucket_id = 'checkin-photos'
    and (storage.foldername(name))[2] in (select public.my_participant_ids()::text)
  );
