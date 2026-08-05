import { GrowingTree } from "@/components/growing-tree";
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
      {/* 숫자보다 먼저 눈에 들어오는 자리. 얼마나 왔는지를 나무가 말해준다. */}
      <GrowingTree percent={percent} className="self-center" />

      <div className="flex items-baseline gap-2">
        <p className="font-display text-4xl leading-none text-green">
          {formatCo2(totalG)}
        </p>
        <p className="text-sm text-ink-soft">/ 목표 {formatCo2(goalG)}</p>
      </div>

      {/* 물이 차오르듯. 지브리의 하늘색에서 잎사귀색으로 옮겨간다. */}
      <div
        role="progressbar"
        aria-valuenow={percent}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label="목표 달성률"
        className="h-6 w-full overflow-hidden rounded-full border-2 border-green/30 bg-paper/70"
      >
        {/* 1% 도 눈에 보여야 한다. 첫날 참가자에게 '아무것도 안 됐다'로
            보이면 그 게이지는 제 일을 못 하는 것이다. */}
        <div
          className="h-full rounded-full bg-gradient-to-r from-mint to-green transition-[width] duration-700"
          style={{ width: `${percent}%`, minWidth: percent > 0 ? "1.25rem" : 0 }}
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
