/**
 * 함께 모은 결과가 쌓일수록 자라는 나무.
 *
 * 숫자만으로는 초등학생이 '얼마나 왔는지'를 느끼기 어렵다. 씨앗에서
 * 새싹으로, 새싹에서 나무로 자라는 모습이 그 자리를 대신한다.
 * 목표에 닿으면 열매가 맺힌다.
 */

type Stage = {
  /** 이 단계로 넘어가는 달성률(%) */
  at: number;
  label: string;
  stem: number;
  canopy: number;
  leaves: boolean;
};

const STAGES: Stage[] = [
  { at: 0, label: "씨앗을 심었어요", stem: 0, canopy: 0, leaves: false },
  { at: 1, label: "새싹이 돋았어요", stem: 16, canopy: 0, leaves: true },
  { at: 25, label: "줄기가 자랐어요", stem: 32, canopy: 17, leaves: true },
  { at: 50, label: "가지가 뻗었어요", stem: 46, canopy: 25, leaves: false },
  { at: 75, label: "나무가 커졌어요", stem: 54, canopy: 30, leaves: false },
  { at: 100, label: "열매를 맺었어요", stem: 58, canopy: 32, leaves: false },
];

export function treeStage(percent: number) {
  let stage = STAGES[0];
  for (const candidate of STAGES) {
    if (percent >= candidate.at) stage = candidate;
  }
  return stage;
}

const GROUND_Y = 104;

export function GrowingTree({
  percent,
  className = "",
}: {
  percent: number;
  className?: string;
}) {
  const stage = treeStage(percent);
  const topY = GROUND_Y - stage.stem;
  const fruited = percent >= 100;

  return (
    <figure className={`flex flex-col items-center gap-1 ${className}`}>
      {/* 위쪽 여백은 '앞으로 자랄 자리'다. 다 자란 나무 높이에 맞춰
          잘라내서, 값이 올라도 화면이 출렁이지 않게 한다. */}
      <svg
        viewBox="0 18 120 96"
        width="100%"
        role="img"
        aria-label={`목표 달성률 ${percent}퍼센트 · ${stage.label}`}
        className="max-w-[150px]"
      >
        {/* 땅 */}
        <ellipse cx="60" cy={GROUND_Y} rx="34" ry="8" fill="#cfe3c6" />
        <ellipse cx="60" cy={GROUND_Y - 2} rx="26" ry="6" fill="#b6d5ac" />

        <g className="sway">
          {/* 씨앗 — 아직 아무것도 자라지 않았을 때만 */}
          <ellipse
            cx="60"
            cy={GROUND_Y - 5}
            rx="6"
            ry="7"
            fill="#a97a4e"
            className="grow-part"
            opacity={stage.stem === 0 ? 1 : 0}
          />

          {/* 줄기 */}
          <path
            d={`M60 ${GROUND_Y} L60 ${topY}`}
            stroke="#8a6a45"
            strokeWidth={stage.stem > 40 ? 7 : 5}
            strokeLinecap="round"
            className="grow-part"
            opacity={stage.stem > 0 ? 1 : 0}
          />

          {/* 새싹 잎 — 줄기만 있을 때의 두 장 */}
          <g
            className="grow-part"
            opacity={stage.leaves ? 1 : 0}
            style={{ transform: stage.leaves ? "scale(1)" : "scale(0.4)" }}
          >
            <path
              d={`M60 ${topY + 4} q-15 -10 -19 1 q6 8 19 -1Z`}
              fill="#8ecb9c"
              stroke="#4e9268"
              strokeWidth="2"
              strokeLinejoin="round"
            />
            <path
              d={`M60 ${topY + 8} q15 -10 19 1 q-6 8 -19 -1Z`}
              fill="#a9d9b3"
              stroke="#4e9268"
              strokeWidth="2"
              strokeLinejoin="round"
            />
          </g>

          {/* 잎이 무성해진 뒤의 수관 */}
          <g
            className="grow-part"
            opacity={stage.canopy > 0 ? 1 : 0}
            style={{
              transformOrigin: `60px ${topY}px`,
              transform: stage.canopy > 0 ? "scale(1)" : "scale(0.3)",
            }}
          >
            <circle cx={60 - stage.canopy * 0.55} cy={topY + 4} r={stage.canopy * 0.72} fill="#8ecb9c" />
            <circle cx={60 + stage.canopy * 0.55} cy={topY + 4} r={stage.canopy * 0.72} fill="#7cbf8e" />
            <circle cx="60" cy={topY - stage.canopy * 0.35} r={stage.canopy * 0.85} fill="#a9d9b3" />
            <circle
              cx="60"
              cy={topY - stage.canopy * 0.1}
              r={stage.canopy * 0.62}
              fill="#8ecb9c"
              opacity="0.75"
            />
          </g>

          {/* 목표를 채우면 열매 */}
          <g className="grow-part" opacity={fruited ? 1 : 0}>
            <circle cx={60 - stage.canopy * 0.7} cy={topY + 6} r="4.5" fill="#e2563d" />
            <circle cx={60 + stage.canopy * 0.6} cy={topY - 4} r="4.5" fill="#e2563d" />
            <circle cx={60 + stage.canopy * 0.1} cy={topY + 14} r="4" fill="#f0774f" />
          </g>
        </g>
      </svg>

      <figcaption className="text-sm font-bold text-green">{stage.label}</figcaption>
    </figure>
  );
}
