-- 학년·반·번호로 참가한다. 이메일도 비밀번호도 받지 않는다.
--
-- 문제: RLS 가 이 앱의 유일한 보안 경계이고, 그 경계는 auth.uid() 위에 서 있다.
-- 인증을 없애면 경계가 통째로 사라진다.
--
-- 해법: 학년·반·번호로 결정되는 내부 계정을 서버가 대신 만들고 로그인시킨다.
-- 참가자는 계정의 존재를 모르지만 세션·auth.uid()·RLS 는 그대로 유지된다.
-- 비밀번호는 호출할 때마다 새로 만들어 서버 액션에만 돌려주고, 브라우저로는
-- 내려가지 않는다.
--
-- 받아들인 약점: 비밀번호가 없으므로 초대코드를 아는 사람은 같은 반 친구의
-- 번호를 입력해 그 기록에 들어갈 수 있다. '비밀번호 없이'를 택하면 피할 수
-- 없다. 대신 내부 계정 주소는 예약 TLD(.invalid)를 써서, 이 함수가 실제
-- 사용자 계정을 건드리는 일은 구조적으로 불가능하다.

alter table public.participants
  add column grade smallint,
  add column class_no smallint,
  add column student_no smallint;

alter table public.participants
  add constraint participants_grade_range check (grade between 1 and 6),
  add constraint participants_class_range check (class_no between 1 and 5),
  add constraint participants_student_range check (student_no between 1 and 30);

-- 한 캠페인 안에서 같은 자리는 하나뿐이다.
create unique index participants_slot_unique
  on public.participants (campaign_id, grade, class_no, student_no);

comment on column public.participants.grade is '학년 1~6. 참가 자리를 이루는 값.';

-- 이메일 기반 참가는 더 이상 쓰지 않는다.
drop function if exists public.join_campaign(text, text);

-- 반환 열이 바뀌므로 create or replace 로는 안 된다.
drop function if exists public.admin_list_participants(text, text);

create or replace function public.roster_sign_in(
  p_invite_code text,
  p_grade int,
  p_class_no int,
  p_student_no int,
  p_nickname text
)
returns table (login_email text, login_password text)
language plpgsql
security definer
set search_path = public, extensions
as $$
declare
  v_campaign public.campaigns%rowtype;
  v_email text;
  v_password text;
  v_user_id uuid;
  v_nickname text := trim(p_nickname);
begin
  select * into v_campaign from public.campaigns
  where invite_code = upper(trim(p_invite_code));

  if not found then
    raise exception '초대코드를 찾을 수 없습니다.'
      using errcode = 'P0001', hint = 'CAMPAIGN_NOT_FOUND';
  end if;

  if p_grade not between 1 and 6
     or p_class_no not between 1 and 5
     or p_student_no not between 1 and 30 then
    raise exception '학년·반·번호를 다시 선택해주세요.'
      using errcode = 'P0001', hint = 'SLOT_INVALID';
  end if;

  -- invite_code 는 campaigns 의 check 제약으로 A-Z0-9 만 들어온다.
  -- 예약 TLD 라 실제 메일 주소와 겹칠 수 없다.
  v_email := format('r%sc%sn%s.%s@roster.greenstep.invalid',
                    p_grade, p_class_no, p_student_no,
                    lower(v_campaign.invite_code));

  -- 호출할 때마다 새 비밀번호. 이전 값이 어딘가 남아 있어도 쓸모없게 만든다.
  v_password := encode(extensions.gen_random_bytes(24), 'base64');

  select id into v_user_id from auth.users where email = v_email;

  if v_user_id is null then
    v_user_id := gen_random_uuid();

    insert into auth.users (
      id, instance_id, aud, role, email, encrypted_password,
      email_confirmed_at, created_at, updated_at,
      raw_app_meta_data, raw_user_meta_data,
      confirmation_token, recovery_token, email_change_token_new, email_change
    ) values (
      v_user_id, '00000000-0000-0000-0000-000000000000',
      'authenticated', 'authenticated', v_email,
      extensions.crypt(v_password, extensions.gen_salt('bf')),
      now(), now(), now(),
      '{"provider":"email","providers":["email"]}'::jsonb,
      jsonb_build_object('roster', true),
      '', '', '', ''
    );

    insert into auth.identities (
      id, user_id, provider_id, provider, identity_data, created_at, updated_at
    ) values (
      gen_random_uuid(), v_user_id, v_user_id::text, 'email',
      jsonb_build_object('sub', v_user_id, 'email', v_email, 'email_verified', true),
      now(), now()
    );
  else
    update auth.users
    set encrypted_password = extensions.crypt(v_password, extensions.gen_salt('bf')),
        updated_at = now()
    where id = v_user_id;
  end if;

  -- 이미 이 자리로 참가한 적이 있으면 그대로 이어 쓴다.
  -- 그때 정한 닉네임을 새로 입력한 값으로 덮어쓰지 않는다.
  if not exists (
    select 1 from public.participants
    where campaign_id = v_campaign.id and auth_user_id = v_user_id
  ) then
    if length(v_nickname) < 1 or length(v_nickname) > 20 then
      raise exception '닉네임은 1자 이상 20자 이하로 입력해주세요.'
        using errcode = 'P0001', hint = 'NICKNAME_INVALID';
    end if;

    begin
      insert into public.participants
        (campaign_id, auth_user_id, nickname, grade, class_no, student_no)
      values
        (v_campaign.id, v_user_id, v_nickname, p_grade, p_class_no, p_student_no);
    exception when unique_violation then
      raise exception '이미 사용 중인 닉네임입니다. 다른 이름을 써주세요.'
        using errcode = 'P0001', hint = 'NICKNAME_TAKEN';
    end;
  end if;

  return query select v_email, v_password;
end;
$$;

revoke all on function public.roster_sign_in(text, int, int, int, text) from public;
grant execute on function public.roster_sign_in(text, int, int, int, text) to anon, authenticated;

-- 관리자 현황에도 자리를 보여준다.
create function public.admin_list_participants(
  p_invite_code text,
  p_admin_code text
)
returns table (
  nickname text,
  grade smallint,
  class_no smallint,
  student_no smallint,
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
  select p.nickname, p.grade, p.class_no, p.student_no, p.created_at,
         count(k.id)::bigint,
         coalesce(sum(k.points), 0)::bigint,
         coalesce(sum(k.co2_g), 0)::bigint
  from public.participants p
  left join public.checkins k on k.participant_id = p.id
  where p.campaign_id = v_id
  group by p.id, p.nickname, p.grade, p.class_no, p.student_no, p.created_at
  order by p.grade, p.class_no, p.student_no;
end;
$$;

grant execute on function public.admin_list_participants(text, text) to anon, authenticated;
