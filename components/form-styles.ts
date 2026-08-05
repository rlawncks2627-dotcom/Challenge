/** 폼 요소의 공통 스타일. 화면마다 조금씩 다른 입력칸이 생기지 않도록 한 곳에 둔다. */
export const INPUT =
  "w-full rounded-sm border-2 border-rule bg-paper/70 px-4 py-3.5 text-ink shadow-sm placeholder:text-ink-soft placeholder:opacity-50 focus:border-green focus:bg-paper focus:outline-none";

export const INPUT_SM =
  "w-full rounded-sm border-2 border-rule bg-paper/70 px-3 py-2 text-ink placeholder:text-ink-soft placeholder:opacity-50 focus:border-green focus:bg-paper focus:outline-none";

export const LABEL = "text-sm font-bold tracking-wide text-ink-soft";

/** 지금 누르라는 곳. 파스텔 위에서 이 색만 원색이다. */
export const BUTTON_PRIMARY =
  "rounded-full bg-accent px-5 py-3.5 font-bold text-white shadow-[var(--shadow)] transition-transform hover:brightness-105 active:translate-y-[2px] disabled:opacity-55";

export const BUTTON_OUTLINE =
  "rounded-full border-2 border-green/50 bg-paper/60 px-5 py-3.5 font-bold text-ink transition-colors hover:bg-paper disabled:opacity-55";
