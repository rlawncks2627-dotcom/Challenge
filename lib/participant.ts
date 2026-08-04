import { createClient } from "@/lib/supabase/server";

export type CurrentParticipant = {
  participantId: string;
  nickname: string;
  campaign: {
    id: string;
    name: string;
    startDate: string;
    endDate: string;
    goalCo2G: number;
  };
};

/**
 * 지금 브라우저가 참가 중인 캠페인과 참가자 정보.
 *
 * 익명 계정 하나로 여러 캠페인에 참가할 수 있다. 그런 경우 가장 최근에
 * 참가한 쪽을 쓴다 — 방금 초대코드를 넣고 들어온 캠페인이 그 사람의 관심사다.
 */
export async function getCurrentParticipant(): Promise<CurrentParticipant | null> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data } = await supabase
    .from("participants")
    .select(
      "id, nickname, campaign:campaigns!participants_campaign_id_fkey(id, name, start_date, end_date, goal_co2_g)",
    )
    .eq("auth_user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (!data?.campaign) return null;

  return {
    participantId: data.id,
    nickname: data.nickname,
    campaign: {
      id: data.campaign.id,
      name: data.campaign.name,
      startDate: data.campaign.start_date,
      endDate: data.campaign.end_date,
      goalCo2G: data.campaign.goal_co2_g,
    },
  };
}
