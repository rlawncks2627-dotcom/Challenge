/**
 * 첫 화면의 친구들.
 *
 * 초등학교 2학년이 처음 마주하는 화면이라, 글자보다 먼저 눈에 들어올 것이
 * 필요했다. 캡슐 모양 몸에 큼직한 눈, 그리고 여럿이 옹기종기 몰려 있는
 * 구성 — 이 셋이 '귀여운 무리'를 만든다.
 *
 * 전부 직접 그린 오리지널 캐릭터이고 인라인 SVG다. 외부 이미지가 없으니
 * 로딩이 없고, 어떤 크기로 키워도 깨지지 않는다.
 * 캠페인 주제에 맞춰 새싹·물방울·햇살·도토리·구름·나뭇잎으로 골랐다.
 */

type Skin = { body: string; line: string };

type CharacterProps = {
  size?: number;
  delay?: string;
  tilt?: string;
  lift?: number;
};

/** 캡슐 몸통 + 얼굴 + 팔다리. 캐릭터마다 머리 위 장식만 다르다. */
function Body({
  skin,
  size = 76,
  delay = "0s",
  tilt = "0deg",
  lift = 0,
  label,
  topper,
}: CharacterProps & { skin: Skin; label: string; topper?: React.ReactNode }) {
  return (
    <svg
      viewBox="0 0 100 130"
      width={size}
      height={(size * 130) / 100}
      role="img"
      aria-label={label}
      className="bob shrink-0 drop-shadow-[0_5px_10px_rgba(53,71,60,0.18)]"
      style={
        {
          "--delay": delay,
          "--tilt": tilt,
          marginBottom: lift,
        } as React.CSSProperties
      }
    >
      {topper}

      {/* 발 — 몸통 뒤에 먼저 깔아 살짝만 보이게 */}
      <ellipse cx="38" cy="115" rx="9" ry="6" fill={skin.line} />
      <ellipse cx="62" cy="115" rx="9" ry="6" fill={skin.line} />

      {/* 팔 */}
      <path
        d={`M24 78 q-10 6 -8 16`}
        stroke={skin.line}
        strokeWidth="6"
        strokeLinecap="round"
        fill="none"
      />
      <path
        d={`M76 78 q10 6 8 16`}
        stroke={skin.line}
        strokeWidth="6"
        strokeLinecap="round"
        fill="none"
      />

      {/* 몸통 */}
      <rect
        x="21"
        y="28"
        width="58"
        height="84"
        rx="29"
        fill={skin.body}
        stroke={skin.line}
        strokeWidth="2.6"
      />

      {/* 눈 — 크게, 흰자와 하이라이트까지 */}
      <circle cx="39" cy="58" r="12.5" fill="#fff" stroke={skin.line} strokeWidth="2.2" />
      <circle cx="61" cy="58" r="12.5" fill="#fff" stroke={skin.line} strokeWidth="2.2" />
      <circle cx="40" cy="59" r="6" fill="#2c3b31" />
      <circle cx="62" cy="59" r="6" fill="#2c3b31" />
      <circle cx="42" cy="56" r="2.1" fill="#fff" />
      <circle cx="64" cy="56" r="2.1" fill="#fff" />

      {/* 볼터치와 입 */}
      <ellipse cx="29" cy="78" rx="6" ry="3.8" fill="#f2907e" opacity="0.55" />
      <ellipse cx="71" cy="78" rx="6" ry="3.8" fill="#f2907e" opacity="0.55" />
      <path
        d="M44 78 q6 7 12 0"
        stroke="#2c3b31"
        strokeWidth="2.6"
        strokeLinecap="round"
        fill="none"
      />
    </svg>
  );
}

export function Sprout(props: CharacterProps) {
  return (
    <Body
      {...props}
      label="새싹이"
      skin={{ body: "#b9dfa9", line: "#4e9268" }}
      topper={
        <>
          <path d="M50 30 v-14" stroke="#4e9268" strokeWidth="3.4" strokeLinecap="round" />
          <path
            d="M50 20 q-17 -12 -22 -1 q6 10 22 1Z"
            fill="#7cbf8e"
            stroke="#4e9268"
            strokeWidth="2.2"
            strokeLinejoin="round"
          />
        </>
      }
    />
  );
}

export function Droplet(props: CharacterProps) {
  return (
    <Body
      {...props}
      label="물방울이"
      skin={{ body: "#a9dcef", line: "#5a9ec4" }}
      topper={
        <path
          d="M50 4 C58 16 64 22 64 27 a14 14 0 0 1 -28 0 C36 22 42 16 50 4Z"
          fill="#cdebf7"
          stroke="#5a9ec4"
          strokeWidth="2.2"
          strokeLinejoin="round"
        />
      }
    />
  );
}

export function Sunny(props: CharacterProps) {
  return (
    <Body
      {...props}
      label="햇살이"
      skin={{ body: "#ffd977", line: "#e8a92e" }}
      topper={
        <g stroke="#e8a92e" strokeWidth="3.6" strokeLinecap="round">
          <line x1="50" y1="18" x2="50" y2="6" />
          <line x1="34" y1="22" x2="28" y2="12" />
          <line x1="66" y1="22" x2="72" y2="12" />
        </g>
      }
    />
  );
}

export function Acorn(props: CharacterProps) {
  return (
    <Body
      {...props}
      label="도토리"
      skin={{ body: "#e6bd93", line: "#a97a4e" }}
      topper={
        <>
          <path d="M50 16 v-9" stroke="#835a37" strokeWidth="3.4" strokeLinecap="round" />
          <path
            d="M20 32 a30 18 0 0 1 60 0 a30 8 0 0 1 -60 0Z"
            fill="#a97a4e"
            stroke="#835a37"
            strokeWidth="2.2"
            strokeLinejoin="round"
          />
        </>
      }
    />
  );
}

export function Cloudy(props: CharacterProps) {
  return (
    <Body
      {...props}
      label="구름이"
      skin={{ body: "#eef6fb", line: "#8fb9d4" }}
      topper={
        <g fill="#e0eff8" stroke="#8fb9d4" strokeWidth="2.2">
          <circle cx="38" cy="24" r="9" />
          <circle cx="52" cy="18" r="11" />
          <circle cx="64" cy="25" r="8" />
        </g>
      }
    />
  );
}

export function Leafy(props: CharacterProps) {
  return (
    <Body
      {...props}
      label="나뭇잎이"
      skin={{ body: "#d8ecb2", line: "#6aa84f" }}
      topper={
        <>
          <path d="M50 30 v-10" stroke="#6aa84f" strokeWidth="3.2" strokeLinecap="round" />
          <path
            d="M50 22 q20 -16 24 -2 q-7 12 -24 2Z"
            fill="#a8d474"
            stroke="#6aa84f"
            strokeWidth="2.2"
            strokeLinejoin="round"
          />
        </>
      }
    />
  );
}

/**
 * 첫 화면의 무리.
 * 겹쳐 세우고 키와 높이를 어긋나게 해서 '옹기종기' 느낌을 만든다.
 */
export function CharacterRow() {
  return (
    <div
      className="flex items-end justify-center -space-x-3 sm:-space-x-2"
      aria-label="친환경 챌린지 친구들"
    >
      <Cloudy size={48} delay="-0.4s" tilt="-4deg" lift={-4} />
      <Acorn size={56} delay="-2.6s" tilt="3deg" lift={4} />
      <Droplet size={64} delay="-1.6s" tilt="-3deg" lift={-2} />
      <Sprout size={76} delay="0s" tilt="2deg" />
      <Sunny size={62} delay="-2.2s" tilt="-2deg" lift={-3} />
      <Leafy size={52} delay="-1s" tilt="4deg" lift={5} />
    </div>
  );
}
