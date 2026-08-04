import type { EmailOtpType } from "@supabase/supabase-js";
import { NextResponse, type NextRequest } from "next/server";

import { createClient } from "@/lib/supabase/server";

/**
 * 이메일 확인 링크가 돌아오는 자리.
 *
 * 확인이 끝나면 가입할 때 넣어둔 초대코드·닉네임으로 참가를 마무리한다.
 * 여기서 하지 않으면 사용자는 메일 확인 후 초대코드를 다시 입력해야 한다.
 */
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const tokenHash = searchParams.get("token_hash");
  const type = searchParams.get("type") as EmailOtpType | null;

  if (!tokenHash || !type) {
    return NextResponse.redirect(new URL("/login?error=link", request.url));
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.verifyOtp({ type, token_hash: tokenHash });

  if (error) {
    return NextResponse.redirect(new URL("/login?error=link", request.url));
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const code = user?.user_metadata?.pending_invite_code;
  const nickname = user?.user_metadata?.pending_nickname;

  if (typeof code === "string" && typeof nickname === "string") {
    // 실패해도 확인 자체는 끝났다. 참가는 /join 화면에서 다시 시도할 수 있다.
    await supabase.rpc("join_campaign", {
      p_invite_code: code,
      p_nickname: nickname,
    });
  }

  return NextResponse.redirect(new URL("/today", request.url));
}
