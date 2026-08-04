import { createClient } from "@/lib/supabase/server";

/**
 * Phase 1 확인용 임시 화면. Phase 3 에서 초대코드 입력 화면으로 대체된다.
 * Supabase 에 실제로 요청이 닿는지까지 확인한다.
 */
async function checkSupabase(): Promise<{ ok: boolean; detail: string }> {
  try {
    const supabase = await createClient();
    // 세션이 없는 게 정상이다. 요청이 왕복했다는 사실 자체가 확인 대상.
    const { error } = await supabase.auth.getClaims();
    if (error) return { ok: false, detail: error.message };
    return { ok: true, detail: "인증 엔드포인트 응답 정상" };
  } catch (e) {
    return { ok: false, detail: e instanceof Error ? e.message : String(e) };
  }
}

export default async function Home() {
  const status = await checkSupabase();

  return (
    <main className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center gap-6 p-6">
      <div>
        <h1 className="text-2xl font-bold">🌱 그린스텝</h1>
        <p className="mt-1 text-sm text-black/60 dark:text-white/60">
          친환경 행동 실천 챌린지 · Phase 1 설정 확인
        </p>
      </div>

      <div className="rounded-xl border border-black/10 p-4 dark:border-white/15">
        <div className="flex items-center gap-2 font-medium">
          <span>{status.ok ? "✅" : "❌"}</span>
          <span>Supabase 연결 {status.ok ? "성공" : "실패"}</span>
        </div>
        <p className="mt-2 text-sm text-black/60 dark:text-white/60">
          {status.detail}
        </p>
      </div>

      <p className="text-sm text-black/50 dark:text-white/50">
        다음 단계: Phase 2 — 테이블·뷰·RLS 정책 마이그레이션
      </p>
    </main>
  );
}
