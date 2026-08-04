"use client";

import { useActionState } from "react";

import { FieldError } from "@/components/field-error";
import { SubmitButton } from "@/components/submit-button";
import { findCampaign, type JoinFormState } from "@/lib/actions/join";

export function InviteCodeForm() {
  const [state, formAction] = useActionState<JoinFormState, FormData>(
    findCampaign,
    null,
  );

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <div className="flex flex-col gap-2">
        <label
          htmlFor="code"
          className="text-sm font-semibold tracking-wide text-ink-soft"
        >
          초대코드
        </label>
        <input
          id="code"
          name="code"
          type="text"
          required
          maxLength={16}
          autoComplete="off"
          autoCapitalize="characters"
          spellCheck={false}
          placeholder="GREEN2026"
          aria-invalid={state?.field === "code" || undefined}
          aria-describedby={state?.field === "code" ? "code-error" : undefined}
          className="w-full rounded-sm border-2 border-rule bg-paper-sunk px-4 py-4 text-center font-mono text-xl tracking-[0.3em] uppercase text-ink placeholder:text-ink-soft placeholder:opacity-45 focus:border-green focus:outline-none"
        />
      </div>

      {state?.field === "code" && (
        <div id="code-error">
          <FieldError message={state.message} />
        </div>
      )}

      <SubmitButton pendingLabel="확인하는 중">캠페인 확인</SubmitButton>
    </form>
  );
}
