/**
 * 첫 화면의 친구들.
 *
 * 초등학교 2학년이 처음 마주하는 화면이라, 글자보다 먼저 눈에 들어올 것이
 * 필요했다. 둥근 몸·큰 눈·볼터치 셋이면 귀여움은 만들어진다.
 *
 * 전부 직접 그린 오리지널 캐릭터이고 인라인 SVG다. 외부 이미지가 없으니
 * 로딩이 없고, 어떤 크기로 키워도 깨지지 않는다.
 * 캠페인 주제에 맞춰 새싹·물방울·햇살·도토리·구름으로 골랐다.
 */

type CharacterProps = { size?: number; delay?: string; tilt?: string };

function Face({
  cx = 50,
  cy = 52,
  gap = 11,
  eye = 4.2,
  blush = 5.5,
}: {
  cx?: number;
  cy?: number;
  gap?: number;
  eye?: number;
  blush?: number;
}) {
  return (
    <>
      <circle cx={cx - gap} cy={cy} r={eye} fill="#2c3b31" />
      <circle cx={cx + gap} cy={cy} r={eye} fill="#2c3b31" />
      <circle cx={cx - gap + 1.4} cy={cy - 1.6} r={eye * 0.34} fill="#fff" />
      <circle cx={cx + gap + 1.4} cy={cy - 1.6} r={eye * 0.34} fill="#fff" />
      <ellipse
        cx={cx - gap - 6}
        cy={cy + 7}
        rx={blush}
        ry={blush * 0.62}
        fill="#f2907e"
        opacity="0.55"
      />
      <ellipse
        cx={cx + gap + 6}
        cy={cy + 7}
        rx={blush}
        ry={blush * 0.62}
        fill="#f2907e"
        opacity="0.55"
      />
      <path
        d={`M${cx - 5} ${cy + 9} q5 5 10 0`}
        stroke="#2c3b31"
        strokeWidth="2.2"
        strokeLinecap="round"
        fill="none"
      />
    </>
  );
}

function Shell({
  size = 76,
  delay = "0s",
  tilt = "0deg",
  label,
  children,
}: CharacterProps & { label: string; children: React.ReactNode }) {
  return (
    <svg
      viewBox="0 0 100 100"
      width={size}
      height={size}
      role="img"
      aria-label={label}
      className="bob shrink-0 drop-shadow-[0_4px_8px_rgba(53,71,60,0.16)]"
      style={{ "--delay": delay, "--tilt": tilt } as React.CSSProperties}
    >
      {children}
    </svg>
  );
}

/** 새싹이 */
export function Sprout(props: CharacterProps) {
  return (
    <Shell {...props} label="새싹이">
      <path
        d="M50 30 q-16 -12 -21 -1 q5 9 21 1Z"
        fill="#7cbf8e"
        stroke="#4e9268"
        strokeWidth="2"
        strokeLinejoin="round"
      />
      <path d="M50 32 v-8" stroke="#4e9268" strokeWidth="3" strokeLinecap="round" />
      <ellipse cx="50" cy="58" rx="30" ry="28" fill="#b9dfa9" />
      <ellipse cx="50" cy="58" rx="30" ry="28" fill="none" stroke="#4e9268" strokeWidth="2.4" />
      <Face />
    </Shell>
  );
}

/** 물방울이 */
export function Droplet(props: CharacterProps) {
  return (
    <Shell {...props} label="물방울이">
      <path
        d="M50 18 C66 40 78 52 78 64 a28 28 0 0 1 -56 0 C22 52 34 40 50 18Z"
        fill="#a9dcef"
        stroke="#5a9ec4"
        strokeWidth="2.4"
        strokeLinejoin="round"
      />
      <path
        d="M36 62 a14 14 0 0 1 6 -14"
        stroke="#fff"
        strokeWidth="3.5"
        strokeLinecap="round"
        fill="none"
        opacity="0.75"
      />
      <Face cy={60} gap={10} />
    </Shell>
  );
}

/** 햇살이 */
export function Sunny(props: CharacterProps) {
  const rays = Array.from({ length: 8 }, (_, i) => i * 45);
  return (
    <Shell {...props} label="햇살이">
      <g stroke="#f0b93f" strokeWidth="4" strokeLinecap="round">
        {rays.map((deg) => (
          <line
            key={deg}
            x1="50"
            y1="12"
            x2="50"
            y2="4"
            transform={`rotate(${deg} 50 52)`}
          />
        ))}
      </g>
      <circle cx="50" cy="52" r="30" fill="#ffd977" stroke="#e8a92e" strokeWidth="2.4" />
      <Face />
    </Shell>
  );
}

/** 도토리 */
export function Acorn(props: CharacterProps) {
  return (
    <Shell {...props} label="도토리">
      <path
        d="M22 62 a28 26 0 0 0 56 0Z"
        fill="#e0b184"
        stroke="#a97a4e"
        strokeWidth="2.4"
        strokeLinejoin="round"
      />
      <path
        d="M20 44 a30 16 0 0 1 60 0 a30 10 0 0 1 -60 0Z"
        fill="#a97a4e"
        stroke="#835a37"
        strokeWidth="2.2"
        strokeLinejoin="round"
      />
      <path d="M50 30 v-8" stroke="#835a37" strokeWidth="3.4" strokeLinecap="round" />
      <Face cy={62} gap={10} eye={4} blush={5} />
    </Shell>
  );
}

/** 구름이 */
export function Cloudy(props: CharacterProps) {
  return (
    <Shell {...props} label="구름이">
      <g fill="#e8f4fb" stroke="#8fb9d4" strokeWidth="2.4" strokeLinejoin="round">
        <path d="M26 70 a16 16 0 0 1 2 -31 a20 20 0 0 1 38 -3 a16 16 0 0 1 8 34Z" />
      </g>
      <Face cy={52} gap={10} eye={4} blush={5} />
    </Shell>
  );
}

/** 첫 화면에 흩어놓는 다섯 친구. */
export function CharacterRow() {
  return (
    <div
      className="flex items-end justify-center gap-1 sm:gap-3"
      aria-label="친환경 챌린지 친구들"
    >
      <Cloudy size={58} delay="-0.4s" tilt="-4deg" />
      <Droplet size={70} delay="-1.6s" tilt="3deg" />
      <Sprout size={88} delay="0s" tilt="-2deg" />
      <Sunny size={70} delay="-2.2s" tilt="4deg" />
      <Acorn size={58} delay="-1s" tilt="-3deg" />
    </div>
  );
}
