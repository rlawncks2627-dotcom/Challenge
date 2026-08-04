/** 폼 요소의 공통 스타일. 화면마다 조금씩 다른 입력칸이 생기지 않도록 한 곳에 둔다. */
export const INPUT =
  "w-full rounded-sm border-2 border-rule bg-paper-sunk px-4 py-3.5 text-ink placeholder:text-ink-soft placeholder:opacity-45 focus:border-green focus:outline-none";

export const INPUT_SM =
  "w-full rounded-sm border-2 border-rule bg-paper-sunk px-3 py-2 text-ink placeholder:text-ink-soft placeholder:opacity-45 focus:border-green focus:outline-none";

export const LABEL = "text-sm font-semibold tracking-wide text-ink-soft";

export const BUTTON_PRIMARY =
  "rounded-sm bg-green px-5 py-3.5 font-semibold text-paper transition-transform active:translate-y-[2px] disabled:opacity-55";

export const BUTTON_OUTLINE =
  "rounded-sm border-2 border-ink px-5 py-3.5 font-semibold disabled:opacity-55";
