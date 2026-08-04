/**
 * 환경변수를 한 곳에서 읽고 검증한다.
 * 빠뜨린 설정은 런타임 깊은 곳이 아니라 여기서 바로 드러나야 한다.
 */
export function getSupabaseEnv() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

  if (!url || !key) {
    throw new Error(
      "Supabase 환경변수가 없습니다. .env.example 을 참고해 .env.local 을 만들어주세요.",
    );
  }

  return { url, key };
}
