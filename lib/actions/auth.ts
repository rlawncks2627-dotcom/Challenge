"use server";

import { redirect } from "next/navigation";

import { authErrorMessage } from "@/lib/auth-errors";
import { createClient } from "@/lib/supabase/server";

export type LoginFormState = {
  message: string;
  field: "email" | "password";
} | null;

export async function signIn(
  _prev: LoginFormState,
  formData: FormData,
): Promise<LoginFormState> {
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");

  if (!email || !password) {
    return { message: "이메일과 비밀번호를 모두 입력해주세요.", field: "email" };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    return { message: authErrorMessage(error.message), field: "password" };
  }

  // 참가 이력이 없으면 초대코드부터 받아야 한다.
  redirect("/today");
}

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/");
}
