"use server";

import { redirect } from "next/navigation";

import { INVITE_CODE, normalizeCode } from "@/lib/invite-code";
import { createClient } from "@/lib/supabase/server";

export type JoinFormState = {
  message: string;
  field: "code" | "nickname";
} | null;

/** 초대코드가 실제 캠페인을 가리키는지 확인하고 참가 화면으로 보낸다. */
export async function findCampaign(
  _prev: JoinFormState,
  formData: FormData,
): Promise<JoinFormState> {
  const code = normalizeCode(String(formData.get("code") ?? ""));

  if (!INVITE_CODE.test(code)) {
    return {
      message: "초대코드는 영문 대문자와 숫자 4~16자입니다.",
      field: "code",
    };
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
      message: "이 초대코드에 해당하는 캠페인이 없습니다. 운영자에게 받은 코드를 확인해주세요.",
      field: "code",
    };
  }

  redirect(`/join/${code}`);
}

/** 익명 계정을 만들고 캠페인에 참가시킨다. */
export async function joinCampaign(
  _prev: JoinFormState,
  formData: FormData,
): Promise<JoinFormState> {
  const code = normalizeCode(String(formData.get("code") ?? ""));
  const nickname = String(formData.get("nickname") ?? "").trim();

  if (nickname.length < 1 || nickname.length > 20) {
    return {
      message: "닉네임은 1자 이상 20자 이하로 입력해주세요.",
      field: "nickname",
    };
  }

  const supabase = await createClient();

  // 이미 이 브라우저에 익명 계정이 있으면 그대로 쓴다.
  // 새로 만들면 이전에 쌓은 기록과 연결이 끊긴다.
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    const { error } = await supabase.auth.signInAnonymously();
    if (error) {
      return {
        message: "지금은 참가할 수 없습니다. 잠시 후 다시 시도해주세요.",
        field: "nickname",
      };
    }
  }

  const { error } = await supabase.rpc("join_campaign", {
    p_invite_code: code,
    p_nickname: nickname,
  });

  if (error) {
    // RPC 는 hint 에 기계용 토큰을, message 에 사용자에게 보여줄 문장을 담는다.
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

  redirect("/today");
}
