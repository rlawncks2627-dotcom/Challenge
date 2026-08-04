"use server";

import { redirect } from "next/navigation";

import { INVITE_CODE, normalizeCode } from "@/lib/invite-code";
import { isValidSlot } from "@/lib/roster";
import { createClient } from "@/lib/supabase/server";

export type JoinField = "code" | "slot" | "nickname";
export type JoinFormState = { message: string; field: JoinField } | null;

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
        "이 초대코드에 해당하는 캠페인이 없습니다. 선생님께 받은 코드를 확인해주세요.",
      field: "code",
    };
  }

  redirect(`/join/${code}`);
}

/**
 * 학년·반·번호로 참가.
 *
 * 참가자는 계정을 만들지 않는다. 대신 서버가 그 자리에 해당하는 내부 계정을
 * 만들거나 찾아 로그인시킨다. 비밀번호는 매번 새로 만들어져 이 함수 안에서만
 * 쓰이고 브라우저로 내려가지 않는다.
 */
export async function joinWithRoster(
  _prev: JoinFormState,
  formData: FormData,
): Promise<JoinFormState> {
  const code = normalizeCode(String(formData.get("code") ?? ""));
  const grade = Number(formData.get("grade"));
  const classNo = Number(formData.get("class_no"));
  const studentNo = Number(formData.get("student_no"));
  const nickname = String(formData.get("nickname") ?? "").trim();

  if (!isValidSlot(grade, classNo, studentNo)) {
    return { message: "학년·반·번호를 모두 선택해주세요.", field: "slot" };
  }

  if (nickname.length < 1 || nickname.length > 20) {
    return { message: "닉네임은 1자 이상 20자 이하로 입력해주세요.", field: "nickname" };
  }

  const supabase = await createClient();

  const { data, error } = await supabase.rpc("roster_sign_in", {
    p_invite_code: code,
    p_grade: grade,
    p_class_no: classNo,
    p_student_no: studentNo,
    p_nickname: nickname,
  });

  if (error) {
    switch (error.hint) {
      case "NICKNAME_TAKEN":
      case "NICKNAME_INVALID":
        return { message: error.message, field: "nickname" };
      case "SLOT_INVALID":
        return { message: error.message, field: "slot" };
      case "CAMPAIGN_NOT_FOUND":
        return { message: error.message, field: "code" };
      default:
        return {
          message: "참가에 실패했습니다. 잠시 후 다시 시도해주세요.",
          field: "nickname",
        };
    }
  }

  const credentials = data?.[0];
  if (!credentials) {
    return { message: "참가에 실패했습니다. 잠시 후 다시 시도해주세요.", field: "nickname" };
  }

  const { error: signInError } = await supabase.auth.signInWithPassword({
    email: credentials.login_email,
    password: credentials.login_password,
  });

  if (signInError) {
    return {
      message: "참가 처리를 마치지 못했습니다. 다시 시도해주세요.",
      field: "nickname",
    };
  }

  redirect("/today");
}
