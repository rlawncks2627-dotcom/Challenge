"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import {
  clearAdminSession,
  readAdminSession,
  writeAdminSession,
} from "@/lib/admin-session";
import { normalizeCode } from "@/lib/invite-code";
import { createClient } from "@/lib/supabase/server";

export type AdminFormState = { message: string } | null;

const GENERIC = "지금은 처리할 수 없습니다. 잠시 후 다시 시도해주세요.";

/** 관리자 코드 확인 후 관리 화면으로. */
export async function adminSignIn(
  _prev: AdminFormState,
  formData: FormData,
): Promise<AdminFormState> {
  const code = normalizeCode(String(formData.get("code") ?? ""));
  const admin = String(formData.get("admin") ?? "");

  if (!code || !admin) {
    return { message: "초대코드와 관리자 코드를 모두 입력해주세요." };
  }

  const supabase = await createClient();
  const { error } = await supabase.rpc("admin_campaign_overview", {
    p_invite_code: code,
    p_admin_code: admin,
  });

  if (error) return { message: error.hint ? error.message : GENERIC };

  await writeAdminSession({ code, admin });
  redirect(`/admin/${code}`);
}

export async function adminSignOut() {
  await clearAdminSession();
  redirect("/admin");
}

export async function createCampaign(
  _prev: AdminFormState,
  formData: FormData,
): Promise<AdminFormState> {
  const bootstrap = String(formData.get("bootstrap") ?? "");
  const name = String(formData.get("name") ?? "").trim();
  const code = normalizeCode(String(formData.get("code") ?? ""));
  const admin = String(formData.get("admin") ?? "");
  const startDate = String(formData.get("start_date") ?? "");
  const endDate = String(formData.get("end_date") ?? "");
  const goalKg = Number(formData.get("goal_kg") ?? 0);

  if (!name) return { message: "캠페인 이름을 입력해주세요." };
  if (!startDate || !endDate) return { message: "기간을 입력해주세요." };
  if (!Number.isFinite(goalKg) || goalKg < 0) {
    return { message: "목표는 0 이상의 숫자로 입력해주세요." };
  }

  const supabase = await createClient();
  const { data, error } = await supabase.rpc("admin_create_campaign", {
    p_bootstrap_code: bootstrap,
    p_name: name,
    p_invite_code: code,
    p_admin_code: admin,
    p_start_date: startDate,
    p_end_date: endDate,
    p_goal_co2_g: Math.round(goalKg * 1000),
  });

  if (error) return { message: error.hint ? error.message : GENERIC };

  await writeAdminSession({ code: data, admin });
  redirect(`/admin/${data}`);
}

export async function updateCampaign(
  _prev: AdminFormState,
  formData: FormData,
): Promise<AdminFormState> {
  const session = await requireSession();
  const goalKg = Number(formData.get("goal_kg") ?? 0);
  const newAdmin = String(formData.get("new_admin") ?? "").trim();

  if (!Number.isFinite(goalKg) || goalKg < 0) {
    return { message: "목표는 0 이상의 숫자로 입력해주세요." };
  }

  const supabase = await createClient();
  const { error } = await supabase.rpc("admin_update_campaign", {
    p_invite_code: session.code,
    p_admin_code: session.admin,
    p_name: String(formData.get("name") ?? "").trim(),
    p_start_date: String(formData.get("start_date") ?? ""),
    p_end_date: String(formData.get("end_date") ?? ""),
    p_goal_co2_g: Math.round(goalKg * 1000),
    p_new_admin_code: newAdmin || null,
  });

  if (error) return { message: error.hint ? error.message : GENERIC };

  // 관리자 코드를 바꿨으면 쿠키의 코드도 함께 바꿔야 다음 요청이 통과한다.
  if (newAdmin) await writeAdminSession({ code: session.code, admin: newAdmin });

  revalidatePath(`/admin/${session.code}`);
  return { message: "저장했습니다." };
}

export async function saveChallenge(
  _prev: AdminFormState,
  formData: FormData,
): Promise<AdminFormState> {
  const session = await requireSession();
  const id = String(formData.get("id") ?? "");
  const title = String(formData.get("title") ?? "").trim();
  const points = Number(formData.get("points") ?? 0);
  const co2 = Number(formData.get("co2_saved_g") ?? 0);
  const sortOrder = Number(formData.get("sort_order") ?? 0);

  if (!title) return { message: "항목 이름을 입력해주세요." };
  if (!Number.isInteger(points) || points < 1 || points > 100) {
    return { message: "점수는 1~100 사이의 정수여야 합니다." };
  }
  if (!Number.isInteger(co2) || co2 < 0 || co2 > 100_000) {
    return { message: "절감량은 0~100,000g 사이의 정수여야 합니다." };
  }

  const supabase = await createClient();
  const { error } = await supabase.rpc("admin_save_challenge", {
    p_invite_code: session.code,
    p_admin_code: session.admin,
    p_challenge_id: id || null,
    p_title: title,
    p_description: String(formData.get("description") ?? ""),
    p_icon: String(formData.get("icon") ?? ""),
    p_points: points,
    p_co2_saved_g: co2,
    p_sort_order: Number.isFinite(sortOrder) ? sortOrder : 0,
    p_is_active: formData.get("is_active") === "on",
  });

  if (error) return { message: error.hint ? error.message : GENERIC };

  revalidatePath(`/admin/${session.code}`);
  return { message: id ? "저장했습니다." : "항목을 추가했습니다." };
}

export async function deleteChallenge(
  _prev: AdminFormState,
  formData: FormData,
): Promise<AdminFormState> {
  const session = await requireSession();

  const supabase = await createClient();
  const { error } = await supabase.rpc("admin_delete_challenge", {
    p_invite_code: session.code,
    p_admin_code: session.admin,
    p_challenge_id: String(formData.get("id") ?? ""),
  });

  if (error) return { message: error.hint ? error.message : GENERIC };

  revalidatePath(`/admin/${session.code}`);
  return { message: "삭제했습니다." };
}

async function requireSession() {
  const session = await readAdminSession();
  if (!session) redirect("/admin");
  return session;
}
