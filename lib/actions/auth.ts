"use server";

import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";

/**
 * 이 기기에서 나가기.
 *
 * 참가자에게는 계정도 비밀번호도 없으므로, 다시 들어오려면 초대코드와
 * 자기 학년·반·번호를 고르면 된다. 기록은 그대로 남는다.
 */
export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/");
}
