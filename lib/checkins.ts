import { createClient } from "@/lib/supabase/client";

const BUCKET = "checkin-photos";

export type CheckinInput = {
  campaignId: string;
  participantId: string;
  challengeId: string;
  date: string;
  photo?: Blob | null;
  memo?: string | null;
};

export type CheckinResult = { error?: string };

/**
 * 체크인 생성.
 *
 * points 와 co2_g 는 보내지 않는다. DB 트리거가 challenges 에서 직접 찍는다.
 * 여기서 보내봐야 덮어써지고, 보낼 수 있다고 착각하게 만들 뿐이다.
 */
export async function createCheckin(input: CheckinInput): Promise<CheckinResult> {
  const supabase = createClient();
  let photoPath: string | null = null;

  if (input.photo) {
    // 경로 규약이 곧 권한이다: {campaign_id}/{participant_id}/{uuid}.webp
    photoPath = `${input.campaignId}/${input.participantId}/${crypto.randomUUID()}.webp`;

    const { error } = await supabase.storage
      .from(BUCKET)
      .upload(photoPath, input.photo, { contentType: "image/webp" });

    if (error) {
      return { error: "사진을 올리지 못했습니다. 다시 시도해주세요." };
    }
  }

  const { error } = await supabase.from("checkins").insert({
    campaign_id: input.campaignId,
    participant_id: input.participantId,
    challenge_id: input.challengeId,
    checkin_date: input.date,
    photo_path: photoPath,
    memo: input.memo?.trim() || null,
  });

  if (error) {
    // 사진만 남고 기록이 없는 상태를 만들지 않는다.
    if (photoPath) {
      await supabase.storage.from(BUCKET).remove([photoPath]);
    }
    if (error.code === "23505") {
      return { error: "오늘 이미 완료한 항목입니다." };
    }
    return { error: error.message };
  }

  return {};
}

export async function deleteCheckin(
  checkinId: string,
  photoPath: string | null,
): Promise<CheckinResult> {
  const supabase = createClient();

  const { error } = await supabase.from("checkins").delete().eq("id", checkinId);
  if (error) return { error: "취소하지 못했습니다. 다시 시도해주세요." };

  // 기록이 지워진 뒤에 사진을 지운다. 순서가 반대면 사진 없는 기록이 남는다.
  if (photoPath) {
    await supabase.storage.from(BUCKET).remove([photoPath]);
  }

  return {};
}
