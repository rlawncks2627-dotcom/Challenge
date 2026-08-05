import { formatCo2 } from "@/lib/co2";

export type LeaderboardRow = {
  participant_id: string;
  nickname: string;
  total_points: number;
  total_co2_g: number;
  checkin_count: number;
  rank: number;
};

const VISIBLE = 20;

export function LeaderboardTable({
  rows,
  myParticipantId,
}: {
  rows: LeaderboardRow[];
  myParticipantId: string;
}) {
  const top = rows.slice(0, VISIBLE);
  // 20위 밖이라도 자기 순위는 봐야 한다. 안 보이면 순위표가 남의 이야기가 된다.
  const me = rows.find((r) => r.participant_id === myParticipantId);
  const pinned = me && !top.some((r) => r.participant_id === myParticipantId);

  if (rows.length === 0) {
    return (
      <p className="rounded-sm border-2 border-dashed border-rule px-4 py-6 text-ink-soft">
        아직 참가자가 없어요.
      </p>
    );
  }

  return (
    <div className="flex flex-col">
      <ol className="flex flex-col">
        {top.map((row) => (
          <Row
            key={row.participant_id}
            row={row}
            mine={row.participant_id === myParticipantId}
          />
        ))}
      </ol>

      {pinned && me && (
        <>
          <p className="py-2 text-center font-mono text-sm text-ink-soft">···</p>
          <Row row={me} mine />
        </>
      )}
    </div>
  );
}

function Row({ row, mine }: { row: LeaderboardRow; mine: boolean }) {
  return (
    <li
      className={`flex items-center gap-3 border-b border-rule py-3 ${
        mine ? "-mx-3 rounded-sm border-l-4 border-l-green bg-mint/40 px-3" : ""
      }`}
    >
      <span
        className={`w-8 shrink-0 text-center font-mono text-sm ${
          row.rank <= 3 ? "font-display text-lg text-green" : "text-ink-soft"
        }`}
      >
        {row.rank}
      </span>

      <span className="min-w-0 flex-1 truncate font-semibold">
        {row.nickname}
        {mine && <span className="ml-1.5 text-sm text-green">나</span>}
      </span>

      <span className="shrink-0 text-right">
        <span className="block font-semibold">
          {row.total_points.toLocaleString("ko-KR")}점
        </span>
        <span className="block font-mono text-xs text-ink-soft">
          {formatCo2(row.total_co2_g)} · {row.checkin_count}회
        </span>
      </span>
    </li>
  );
}
