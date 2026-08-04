import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

import { getSupabaseEnv } from "./env";

/**
 * 서버 컴포넌트 / 서버 액션용 Supabase 클라이언트.
 * 서버 컴포넌트에서는 쿠키 쓰기가 불가능해 setAll 이 던지는데,
 * 세션 갱신은 middleware 가 담당하므로 그 예외는 무시해도 된다.
 */
export async function createClient() {
  const { url, key } = getSupabaseEnv();
  const cookieStore = await cookies();

  return createServerClient(url, key, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          for (const { name, value, options } of cookiesToSet) {
            cookieStore.set(name, value, options);
          }
        } catch {
          // 서버 컴포넌트에서 호출된 경우 — middleware 가 세션을 갱신한다.
        }
      },
    },
  });
}
