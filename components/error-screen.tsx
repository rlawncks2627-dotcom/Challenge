"use client";

import Link from "next/link";

import { BUTTON_OUTLINE, BUTTON_PRIMARY } from "@/components/form-styles";
import { Wordmark } from "@/components/wordmark";

/**
 * 오류 화면.
 * 무슨 일이 일어났고 지금 무엇을 할 수 있는지만 말한다. 사과하지 않고,
 * 참가자가 고칠 수 없는 기술적 원인을 늘어놓지도 않는다.
 */
export function ErrorScreen({
  title,
  description,
  reset,
  homeHref = "/today",
  homeLabel = "오늘 화면으로",
}: {
  title: string;
  description: string;
  reset?: () => void;
  homeHref?: string;
  homeLabel?: string;
}) {
  return (
    <main className="mx-auto flex w-full max-w-sm flex-1 flex-col justify-center gap-6 px-6 py-12">
      <Wordmark className="text-2xl" />

      <div className="flex flex-col gap-2 border-l-4 border-pink pl-4">
        <h1 className="text-xl font-bold">{title}</h1>
        <p className="text-ink-soft">{description}</p>
      </div>

      <div className="flex flex-col gap-3">
        {reset && (
          <button type="button" onClick={reset} className={BUTTON_PRIMARY}>
            다시 시도
          </button>
        )}
        <Link href={homeHref} className={`${BUTTON_OUTLINE} text-center`}>
          {homeLabel}
        </Link>
      </div>
    </main>
  );
}
