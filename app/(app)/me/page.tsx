import { CheckinCalendar } from "@/components/checkin-calendar";
import { signOut } from "@/lib/actions/auth";
import { describeCo2, formatCo2 } from "@/lib/co2";
import { campaignToday } from "@/lib/date";
import { formatPeriod } from "@/lib/format";
import { getCurrentParticipant } from "@/lib/participant";
import { formatSlot } from "@/lib/roster";
import { createClient } from "@/lib/supabase/server";

export default async function MePage() {
  const participant = await getCurrentParticipant();
  if (!participant) return null;

  const { campaign, nickname, participantId, slot } = participant;
  const today = campaignToday();
  const supabase = await createClient();

  const [{ data: checkins }, { data: standing }] = await Promise.all([
    supabase
      .from("checkins")
      .select("checkin_date")
      .eq("participant_id", participantId),
    supabase
      .from("leaderboard")
      .select("total_points, total_co2_g, checkin_count, rank")
      .eq("participant_id", participantId)
      .maybeSingle(),
  ]);

  const countsByDate = new Map<string, number>();
  for (const { checkin_date } of checkins ?? []) {
    countsByDate.set(checkin_date, (countsByDate.get(checkin_date) ?? 0) + 1);
  }

  const totalCo2 = standing?.total_co2_g ?? 0;

  return (
    <main className="mx-auto flex w-full max-w-sm flex-1 flex-col gap-8 px-6 py-10">
      <header className="flex flex-col gap-1">
        <h1 className="text-2xl font-bold">{nickname}님의 기록</h1>
        <p className="text-sm text-ink-soft">
          {formatSlot(slot.grade, slot.classNo, slot.studentNo)} ·{" "}
          {campaign.name}
        </p>
        <p className="text-sm text-ink-soft">
          {formatPeriod(campaign.startDate, campaign.endDate)}
        </p>
      </header>

      <section className="flex flex-col gap-4" aria-label="누적 기록">
        <dl className="grid grid-cols-3 gap-3">
          <Stat label="점수" value={`${(standing?.total_points ?? 0).toLocaleString("ko-KR")}`} />
          <Stat label="실천" value={`${standing?.checkin_count ?? 0}회`} />
          <Stat label="순위" value={standing?.rank ? `${standing.rank}위` : "–"} />
        </dl>

        <div className="flex flex-col gap-1 border-l-4 border-green pl-4">
          <p className="font-display text-2xl leading-none text-green">
            {formatCo2(totalCo2)}
          </p>
          <p className="text-sm text-ink-soft">{describeCo2(totalCo2)}</p>
        </div>
      </section>

      {countsByDate.size === 0 && (
        <p className="rounded-sm border-2 border-dashed border-rule px-4 py-6 text-ink-soft">
          아직 기록이 없어요. 오늘 화면에서 실천한 항목을 눌러 첫 도장을
          찍어보세요.
        </p>
      )}

      <section className="flex flex-col gap-3">
        <h2 className="text-lg font-bold">실천 달력</h2>
        <CheckinCalendar
          startDate={campaign.startDate}
          endDate={campaign.endDate}
          today={today}
          countsByDate={countsByDate}
        />
      </section>

      <section className="flex flex-col gap-3 border-t-2 border-rule pt-6">
        <p className="text-sm text-ink-soft">
          이 기기에서 나가도 기록은 남습니다. 다시 들어올 때 초대코드와{" "}
          {formatSlot(slot.grade, slot.classNo, slot.studentNo)}를 고르면
          이어집니다.
        </p>
        <form action={signOut}>
          <button
            type="submit"
            className="w-full rounded-full border-2 border-green/50 bg-paper/60 px-4 py-3.5 font-bold"
          >
            이 기기에서 나가기
          </button>
        </form>
      </section>
    </main>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col gap-1 rounded-sm border-2 border-rule px-3 py-3">
      <dt className="text-xs text-ink-soft">{label}</dt>
      <dd className="font-display text-xl leading-none">{value}</dd>
    </div>
  );
}
