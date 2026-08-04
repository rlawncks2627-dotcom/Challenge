import type { SupabaseClient } from "@supabase/supabase-js";

import type { Database } from "@/lib/supabase/database.types";

export const FEED_PAGE_SIZE = 12;
const SIGNED_URL_TTL_SECONDS = 60 * 60;
const BUCKET = "checkin-photos";

export type FeedItem = {
  id: string;
  memo: string | null;
  createdAt: string;
  nickname: string;
  challengeTitle: string;
  challengeIcon: string;
  photoUrl: string | null;
};

/**
 * 인증샷 피드 한 페이지.
 *
 * created_at 커서로 넘긴다. offset 페이징은 새 인증샷이 올라오는 동안
 * 같은 항목이 두 번 보이거나 건너뛰어진다.
 *
 * 서버 컴포넌트와 '더 보기' 버튼이 같은 함수를 쓴다. 그래야 두 경로가
 * 갈라지지 않는다.
 */
export async function loadFeed(
  supabase: SupabaseClient<Database>,
  campaignId: string,
  before?: string,
): Promise<FeedItem[]> {
  let query = supabase
    .from("checkins")
    .select("id, memo, created_at, photo_path, participant_id, challenge_id")
    .eq("campaign_id", campaignId)
    .not("photo_path", "is", null)
    .order("created_at", { ascending: false })
    .limit(FEED_PAGE_SIZE);

  if (before) query = query.lt("created_at", before);

  const { data: checkins } = await query;
  if (!checkins || checkins.length === 0) return [];

  const participantIds = [...new Set(checkins.map((c) => c.participant_id))];
  const challengeIds = [...new Set(checkins.map((c) => c.challenge_id))];
  const paths = checkins
    .map((c) => c.photo_path)
    .filter((p): p is string => p !== null);

  const [{ data: participants }, { data: challenges }, signed] =
    await Promise.all([
      supabase.from("participants").select("id, nickname").in("id", participantIds),
      supabase.from("challenges").select("id, title, icon").in("id", challengeIds),
      // 비공개 버킷이라 매번 서명 URL 을 만든다.
      supabase.storage.from(BUCKET).createSignedUrls(paths, SIGNED_URL_TTL_SECONDS),
    ]);

  const nicknames = new Map(participants?.map((p) => [p.id, p.nickname]));
  const challengeById = new Map(challenges?.map((c) => [c.id, c]));
  const urlByPath = new Map(
    signed.data
      ?.filter((s) => s.signedUrl && s.path)
      .map((s) => [s.path as string, s.signedUrl]),
  );

  return checkins.map((checkin) => {
    const challenge = challengeById.get(checkin.challenge_id);
    return {
      id: checkin.id,
      memo: checkin.memo,
      createdAt: checkin.created_at,
      nickname: nicknames.get(checkin.participant_id) ?? "알 수 없음",
      challengeTitle: challenge?.title ?? "실천",
      challengeIcon: challenge?.icon ?? "🌱",
      photoUrl: checkin.photo_path
        ? (urlByPath.get(checkin.photo_path) ?? null)
        : null,
    };
  });
}
