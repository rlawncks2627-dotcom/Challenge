import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

import { getSupabaseEnv } from "@/lib/supabase/env";

/**
 * 익명 로그인 세션을 매 요청마다 갱신한다.
 * 이걸 빼면 참가자가 며칠 뒤 다시 들어왔을 때 자기 기록을 잃는다.
 * (Next 16 부터 middleware 는 proxy 로 이름이 바뀌었다.)
 */
export async function proxy(request: NextRequest) {
  const { url, key } = getSupabaseEnv();
  let response = NextResponse.next({ request });

  const supabase = createServerClient(url, key, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        for (const { name, value } of cookiesToSet) {
          request.cookies.set(name, value);
        }
        response = NextResponse.next({ request });
        for (const { name, value, options } of cookiesToSet) {
          response.cookies.set(name, value, options);
        }
      },
    },
  });

  // getClaims() 호출이 만료된 토큰을 갱신하고 위 setAll 을 트리거한다.
  await supabase.auth.getClaims();

  return response;
}

export const config = {
  matcher: [
    // 정적 자산과 이미지 최적화 경로는 세션 갱신이 필요 없다.
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
