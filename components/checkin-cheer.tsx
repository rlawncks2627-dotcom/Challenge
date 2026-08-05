"use client";

import Image from "next/image";

import proud from "@/public/characters/seal-proud.png";
import moved from "@/public/characters/seals-moved.png";

/**
 * 도장을 찍은 순간 물범이 잠깐 튀어나온다.
 *
 * 하단 탭 바로 위, 오른쪽 구석에서 빼꼼 나온다. 가운데에 띄웠더니 방금 누른
 * 카드와 다음에 누를 카드를 덮어서, 연달아 체크하는 흐름이 끊겼다.
 *
 * 두 컷을 번갈아 쓴다. 같은 그림만 나오면 세 번째부터는 아무도 안 본다.
 * pointer-events 를 꺼서 축하가 뜨는 동안에도 계속 누를 수 있다.
 */
const CHEERS = [moved, proud];

export function CheckinCheer({ token }: { token: number }) {
  const src = CHEERS[token % CHEERS.length];

  return (
    <div
      aria-hidden
      className="pointer-events-none fixed inset-x-0 bottom-24 z-40 mx-auto flex max-w-sm justify-end pr-4"
    >
      <Image
        src={src}
        alt=""
        width={128}
        height={Math.round((128 * src.height) / src.width)}
        className="cheer drop-shadow-[0_8px_16px_rgba(53,71,60,0.25)]"
      />
    </div>
  );
}
