import Image, { type StaticImageData } from "next/image";

import blueGogo from "@/public/characters/seal-blue-gogo.png";
import pinkStand from "@/public/characters/seal-pink-stand.png";
import trio from "@/public/characters/seals-trio.png";

/**
 * 첫 화면의 친구들 — 인천광역시 공공캐릭터 점박이물범.
 *
 * 초등학교 2학년이 처음 마주하는 화면이라, 글자보다 먼저 눈에 들어올 것이
 * 필요했다. 셋이 어울린 그림을 가운데 크게 두고, 양옆에 하나씩 세워
 * 각자 다른 박자로 둥실거리게 했다.
 *
 * 글자가 그려 넣어진 이모티콘 컷(메롱·자랑·양해·폭풍감동)은 화면의 문구와
 * 겹쳐 시끄러워지므로 첫 화면에는 쓰지 않았다. public/characters/ 에 함께
 * 두었으니 다른 자리에서 꺼내 쓸 수 있다.
 */

const CREDIT = "캐릭터 ⓒ 인천광역시";

function Floating({
  src,
  alt,
  width,
  delay,
  tilt,
  className = "",
  priority = false,
}: {
  src: StaticImageData;
  alt: string;
  width: number;
  delay: string;
  tilt: string;
  className?: string;
  priority?: boolean;
}) {
  return (
    <Image
      src={src}
      alt={alt}
      width={width}
      height={Math.round((width * src.height) / src.width)}
      priority={priority}
      className={`bob drop-shadow-[0_6px_10px_rgba(53,71,60,0.18)] ${className}`}
      style={{ "--delay": delay, "--tilt": tilt } as React.CSSProperties}
    />
  );
}

export function CharacterRow() {
  return (
    <div className="flex items-end justify-center gap-0.5">
      <Floating
        src={pinkStand}
        alt="분홍 점박이물범"
        width={64}
        delay="-1.6s"
        tilt="-4deg"
        className="mb-2"
      />
      <Floating
        src={trio}
        alt="점박이물범 세 마리가 신나게 춤추는 모습"
        width={188}
        delay="0s"
        tilt="1.5deg"
        priority
      />
      <Floating
        src={blueGogo}
        alt="깃발을 들고 응원하는 파란 점박이물범"
        width={72}
        delay="-2.6s"
        tilt="4deg"
        className="mb-3"
      />
    </div>
  );
}

/** 공공누리 이용 조건에 맞춘 출처 표시. 화면 맨 아래에 조용히 둔다. */
export function CharacterCredit() {
  return <p className="text-xs text-ink-soft opacity-70">{CREDIT}</p>;
}
