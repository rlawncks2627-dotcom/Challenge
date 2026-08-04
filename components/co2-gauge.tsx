import { describeCo2, formatCo2, goalProgress } from "@/lib/co2";

/**
 * 공동 목표 게이지.
 * 큰 숫자 하나와 그 숫자가 무슨 뜻인지 설명하는 한 줄. 그 이상은 넣지 않는다.
 */
export function Co2Gauge({
  totalG,
  goalG,
}: {
  totalG: number;
  goalG: number;
}) {
  const percent = goalProgress(totalG, goalG);

  return (
    <section className="flex flex-col gap-4" aria-label="캠페인 공동 목표">
      <div className="flex items-baseline gap-2">
        <p className="font-display text-4xl leading-none text-green">
          {formatCo2(totalG)}
        </p>
        <p className="text-sm text-ink-soft">/ 목표 {formatCo2(goalG)}</p>
      </div>

      <div
        role="progressbar"
        aria-valuenow={percent}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label="목표 달성률"
        className="h-5 w-full border-2 border-ink"
      >
        <div
          className="h-full bg-green transition-[width] duration-500"
          style={{ width: `${percent}%` }}
        />
      </div>

      <div className="flex items-baseline justify-between gap-3">
        <p className="text-sm">{describeCo2(totalG)}</p>
        <p className="font-mono text-sm font-semibold text-ink-soft">
          {percent}%
        </p>
      </div>

      <p className="text-xs text-ink-soft">
        CO2 절감량은 실천 항목별 환산 추정치입니다.
      </p>
    </section>
  );
}
