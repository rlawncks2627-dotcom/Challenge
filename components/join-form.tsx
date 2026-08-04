"use client";

import { useActionState } from "react";

import { FieldError } from "@/components/field-error";
import { SubmitButton } from "@/components/submit-button";
import { joinCampaign, type JoinFormState } from "@/lib/actions/join";

export function JoinForm({ code }: { code: string }) {
  const [state, formAction] = useActionState<JoinFormState, FormData>(
    joinCampaign,
    null,
  );

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <input type="hidden" name="code" value={code} />

      <div className="flex flex-col gap-2">
        <label
          htmlFor="nickname"
          className="text-sm font-semibold tracking-wide text-ink-soft"
        >
          닉네임
        </label>
        <input
          id="nickname"
          name="nickname"
          type="text"
          required
          maxLength={20}
          autoComplete="off"
          placeholder="순위표에 표시될 이름"
          aria-invalid={state?.field === "nickname" || undefined}
          aria-describedby={
            state?.field === "nickname" ? "nickname-error" : "nickname-help"
          }
          className="w-full rounded-sm border-2 border-rule bg-paper-sunk px-4 py-4 text-lg text-ink placeholder:text-ink-soft placeholder:opacity-45 focus:border-green focus:outline-none"
        />
        <p id="nickname-help" className="text-sm text-ink-soft">
          같은 캠페인 참가자들에게 보입니다. 20자까지 쓸 수 있어요.
        </p>
      </div>

      {state?.field === "nickname" && (
        <div id="nickname-error">
          <FieldError message={state.message} />
        </div>
      )}

      {state?.field === "code" && <FieldError message={state.message} />}

      <SubmitButton pendingLabel="참가하는 중">캠페인 참가</SubmitButton>
    </form>
  );
}
