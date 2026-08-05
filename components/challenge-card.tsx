"use client";

export type Challenge = {
  id: string;
  title: string;
  description: string | null;
  icon: string;
  points: number;
  co2_saved_g: number;
};

export type TodayCheckin = {
  id: string;
  challenge_id: string;
  photo_path: string | null;
  memo: string | null;
};

export function ChallengeCard({
  challenge,
  checkin,
  busy,
  locked,
  onToggle,
  onOpenSheet,
}: {
  challenge: Challenge;
  checkin: TodayCheckin | null;
  busy: boolean;
  locked: boolean;
  onToggle: () => void;
  onOpenSheet: () => void;
}) {
  const done = Boolean(checkin);

  return (
    <li className="flex flex-col">
      <button
        type="button"
        onClick={onToggle}
        disabled={busy || locked}
        aria-pressed={done}
        className={`flex w-full items-center gap-4 rounded-sm border-2 px-4 py-4 text-left shadow-[var(--shadow)] transition-all active:translate-y-[1px] disabled:opacity-60 ${
          done
            ? "border-green/40 bg-mint/45"
            : "border-rule bg-paper/70 hover:bg-paper"
        }`}
      >
        <span aria-hidden className="text-2xl leading-none">
          {challenge.icon}
        </span>

        <span className="flex min-w-0 flex-1 flex-col gap-0.5">
          <span className="font-semibold">{challenge.title}</span>
          <span className="font-mono text-xs tracking-wide text-ink-soft">
            {challenge.points}점 · {challenge.co2_saved_g.toLocaleString("ko-KR")}g
          </span>
        </span>

        <span className="stamp" data-stamped={done} aria-hidden>
          {busy ? (
            <span className="text-sm text-ink-soft">···</span>
          ) : done ? (
            <span className="text-xl leading-none">✓</span>
          ) : null}
        </span>
      </button>

      {/* 사진·메모는 아직 안 한 항목에만 권한다. 이미 찍은 도장을 다시 꾸미게
          만들 이유가 없다. */}
      {!done && !locked && (
        <button
          type="button"
          onClick={onOpenSheet}
          disabled={busy}
          className="self-start px-4 py-2 text-sm text-ink-soft underline underline-offset-4 disabled:opacity-55"
        >
          사진·메모와 함께 남기기
        </button>
      )}

      {done && (checkin?.photo_path || checkin?.memo) && (
        <p className="px-4 py-2 text-sm text-ink-soft">
          {checkin.photo_path && "📷 "}
          {checkin.memo ?? "인증샷을 남겼어요"}
        </p>
      )}
    </li>
  );
}
