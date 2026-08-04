import { Co2Gauge } from "@/components/co2-gauge";
import {
  LeaderboardTable,
  type LeaderboardRow,
} from "@/components/leaderboard-table";
import { getCurrentParticipant } from "@/lib/participant";
import { createClient } from "@/lib/supabase/server";

export default async function BoardPage() {
  const participant = await getCurrentParticipant();
  if (!participant) return null;

  const { campaign, participantId } = participant;
  const supabase = await createClient();

  // 합계도 순위도 DB 뷰가 계산한다. 여기서는 읽어서 그리기만 한다.
  const [{ data: totals }, { data: board }] = await Promise.all([
    supabase
      .from("campaign_totals")
      .select("total_co2_g, participant_count, checkin_count")
      .eq("campaign_id", campaign.id)
      .maybeSingle(),
    supabase
      .from("leaderboard")
      .select("participant_id, nickname, total_points, total_co2_g, checkin_count, rank")
      .eq("campaign_id", campaign.id)
      .order("rank"),
  ]);

  const rows = (board ?? []).filter(
    (row): row is LeaderboardRow =>
      row.participant_id !== null &&
      row.nickname !== null &&
      row.rank !== null &&
      row.total_points !== null &&
      row.total_co2_g !== null &&
      row.checkin_count !== null,
  );

  return (
    <main className="mx-auto flex w-full max-w-sm flex-1 flex-col gap-8 px-6 py-10">
      <header className="flex flex-col gap-1">
        <h1 className="text-2xl font-bold">함께 모은 결과</h1>
        <p className="text-sm text-ink-soft">
          {campaign.name} · 참가자 {totals?.participant_count ?? 0}명 · 실천{" "}
          {totals?.checkin_count ?? 0}회
        </p>
      </header>

      <Co2Gauge totalG={totals?.total_co2_g ?? 0} goalG={campaign.goalCo2G} />

      <section className="flex flex-col gap-3">
        <h2 className="text-lg font-bold">순위</h2>
        <LeaderboardTable rows={rows} myParticipantId={participantId} />
      </section>
    </main>
  );
}
