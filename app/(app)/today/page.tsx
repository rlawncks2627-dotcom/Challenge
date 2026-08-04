import { ChallengeList } from "@/components/challenge-list";
import { Wordmark } from "@/components/wordmark";
import { campaignPhase, campaignToday } from "@/lib/date";
import { formatKoreanDate, formatPeriod } from "@/lib/format";
import { getCurrentParticipant } from "@/lib/participant";
import { createClient } from "@/lib/supabase/server";

const PHASE_NOTICE = {
  before: "아직 캠페인이 시작되지 않았어요.",
  ended: "캠페인이 끝났어요. 기록은 그대로 남아 있습니다.",
} as const;

export default async function TodayPage() {
  // 레이아웃이 이미 막아주지만, 페이지 혼자서도 성립해야 한다.
  const participant = await getCurrentParticipant();
  if (!participant) return null;

  const { campaign, nickname, participantId } = participant;
  const today = campaignToday();
  const phase = campaignPhase(campaign.startDate, campaign.endDate, today);

  const supabase = await createClient();

  const [{ data: challenges }, { data: checkins }] = await Promise.all([
    supabase
      .from("challenges")
      .select("id, title, description, icon, points, co2_saved_g")
      .eq("campaign_id", campaign.id)
      .eq("is_active", true)
      .order("sort_order"),
    supabase
      .from("checkins")
      .select("id, challenge_id, photo_path, memo")
      .eq("participant_id", participantId)
      .eq("checkin_date", today),
  ]);

  const list = challenges ?? [];
  const done = checkins ?? [];

  return (
    <main className="mx-auto flex w-full max-w-sm flex-1 flex-col gap-7 px-6 py-10">
      <header className="flex flex-col gap-5">
        <Wordmark className="text-xl" />

        <div className="flex items-end justify-between gap-4">
          <div className="flex flex-col gap-1">
            <h1 className="text-2xl leading-tight font-bold">
              {formatKoreanDate(today)}
            </h1>
            <p className="text-sm text-ink-soft">
              {nickname}님 · {campaign.name}
            </p>
          </div>

          {/* 오늘 몇 개를 찍었는지. 이 화면에서 가장 알고 싶은 숫자다. */}
          <p className="font-display text-3xl leading-none text-green">
            {done.length}
            <span className="text-lg text-ink-soft">/{list.length}</span>
          </p>
        </div>

        <div className="h-px w-full bg-rule" />
      </header>

      {phase !== "open" ? (
        <div className="flex flex-col gap-2 rounded-sm border-2 border-rule px-4 py-5">
          <p className="font-semibold">{PHASE_NOTICE[phase]}</p>
          <p className="text-sm text-ink-soft">
            캠페인 기간은 {formatPeriod(campaign.startDate, campaign.endDate)}
            입니다.
          </p>
        </div>
      ) : null}

      {list.length === 0 ? (
        <p className="rounded-sm border-2 border-dashed border-rule px-4 py-6 text-ink-soft">
          아직 등록된 실천 항목이 없어요. 캠페인 운영자에게 알려주세요.
        </p>
      ) : (
        <ChallengeList
          challenges={list}
          checkins={done}
          campaignId={campaign.id}
          participantId={participantId}
          date={today}
          locked={phase !== "open"}
        />
      )}
    </main>
  );
}
