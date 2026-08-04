"use server";

import { redirect } from "next/navigation";

import { authErrorMessage } from "@/lib/auth-errors";
import { INVITE_CODE, normalizeCode } from "@/lib/invite-code";
import { getSiteOrigin } from "@/lib/site-url";
import { createClient } from "@/lib/supabase/server";

export type JoinField = "code" | "email" | "password" | "nickname";
export type JoinFormState = { message: string; field: JoinField } | null;

const MIN_PASSWORD = 8;

/** 초대코드가 실제 캠페인을 가리키는지 확인하고 참가 화면으로 보낸다. */
export async function findCampaign(
  _prev: JoinFormState,
  formData: FormData,
): Promise<JoinFormState> {
  const code = normalizeCode(String(formData.get("code") ?? ""));

  if (!INVITE_CODE.test(code)) {
    return { message: "초대코드는 영문 대문자와 숫자 4~16자입니다.", field: "code" };
  }

  const supabase = await createClient();
  const { data, error } = await supabase.rpc("campaign_preview", {
    p_invite_code: code,
  });

  if (error) {
    return {
      message: "지금은 코드를 확인할 수 없습니다. 잠시 후 다시 시도해주세요.",
      field: "code",
    };
  }

  if (!data || data.length === 0) {
    return {
      message:
        "이 초대코드에 해당하는 캠페인이 없습니다. 운영자에게 받은 코드를 확인해주세요.",
      field: "code",
    };
  }

  redirect(`/join/${code}`);
}

/**
 * 가입하면서 참가.
 *
 * 이메일 확인이 필요한 프로젝트에서는 signUp 이 세션을 주지 않는다.
 * 그때는 참가에 필요한 값을 계정 메타데이터에 실어두고, 확인 링크가
 * 돌아왔을 때 /auth/confirm 이 참가를 마무리한다.
 */
export async function signUpAndJoin(
  _prev: JoinFormState,
  formData: FormData,
): Promise<JoinFormState> {
  const code = normalizeCode(String(formData.get("code") ?? ""));
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  const nickname = String(formData.get("nickname") ?? "").trim();

  const invalid = validate({ email, password, nickname });
  if (invalid) return invalid;

  const supabase = await createClient();
  const origin = await getSiteOrigin();

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: `${origin}/auth/confirm`,
      data: { pending_invite_code: code, pending_nickname: nickname },
    },
  });

  if (error) {
    const field: JoinField = /password/i.test(error.message) ? "password" : "email";
    return { message: authErrorMessage(error.message), field };
  }

  if (!data.session) {
    redirect(`/verify-email?email=${encodeURIComponent(email)}`);
  }

  const joinError = await joinNow(supabase, code, nickname);
  if (joinError) return joinError;

  redirect("/today");
}

/** 이미 로그인한 사람이 다른 캠페인에 참가할 때. */
export async function joinWithSession(
  _prev: JoinFormState,
  formData: FormData,
): Promise<JoinFormState> {
  const code = normalizeCode(String(formData.get("code") ?? ""));
  const nickname = String(formData.get("nickname") ?? "").trim();

  if (nickname.length < 1 || nickname.length > 20) {
    return { message: "닉네임은 1자 이상 20자 이하로 입력해주세요.", field: "nickname" };
  }

  const supabase = await createClient();
  const joinError = await joinNow(supabase, code, nickname);
  if (joinError) return joinError;

  redirect("/today");
}

type ServerClient = Awaited<ReturnType<typeof createClient>>;

async function joinNow(
  supabase: ServerClient,
  code: string,
  nickname: string,
): Promise<JoinFormState> {
  const { error } = await supabase.rpc("join_campaign", {
    p_invite_code: code,
    p_nickname: nickname,
  });

  if (!error) return null;

  // RPC 는 hint 에 기계용 토큰을, message 에 보여줄 문장을 담는다.
  switch (error.hint) {
    case "NICKNAME_TAKEN":
    case "NICKNAME_INVALID":
      return { message: error.message, field: "nickname" };
    case "CAMPAIGN_NOT_FOUND":
      return { message: error.message, field: "code" };
    default:
      return {
        message: "참가에 실패했습니다. 잠시 후 다시 시도해주세요.",
        field: "nickname",
      };
  }
}

function validate({
  email,
  password,
  nickname,
}: {
  email: string;
  password: string;
  nickname: string;
}): JoinFormState {
  if (!email.includes("@") || email.length < 5) {
    return { message: "이메일 주소를 다시 확인해주세요.", field: "email" };
  }
  if (password.length < MIN_PASSWORD) {
    return { message: `비밀번호는 ${MIN_PASSWORD}자 이상으로 정해주세요.`, field: "password" };
  }
  if (nickname.length < 1 || nickname.length > 20) {
    return { message: "닉네임은 1자 이상 20자 이하로 입력해주세요.", field: "nickname" };
  }
  return null;
}
