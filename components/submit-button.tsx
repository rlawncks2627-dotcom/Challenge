"use client";

import { useFormStatus } from "react-dom";

/**
 * 잉크로 찍는 버튼. 누르면 판이 종이에 닿듯 살짝 내려앉는다.
 */
export function SubmitButton({
  children,
  pendingLabel,
}: {
  children: React.ReactNode;
  pendingLabel: string;
}) {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      className="w-full rounded-sm bg-green px-5 py-4 font-sans text-base font-semibold text-paper transition-transform active:translate-y-[2px] disabled:opacity-55"
    >
      {pending ? pendingLabel : children}
    </button>
  );
}
