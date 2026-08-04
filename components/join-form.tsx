"use client";

import { useActionState } from "react";

import { FieldError } from "@/components/field-error";
import { INPUT, LABEL } from "@/components/form-styles";
import { SubmitButton } from "@/components/submit-button";
import {
  joinWithSession,
  signUpAndJoin,
  type JoinFormState,
} from "@/lib/actions/join";

export function JoinForm({
  code,
  signedIn,
}: {
  code: string;
  signedIn: boolean;
}) {
  const [state, formAction] = useActionState<JoinFormState, FormData>(
    signedIn ? joinWithSession : signUpAndJoin,
    null,
  );

  return (
    <form action={formAction} className="flex flex-col gap-5">
      <input type="hidden" name="code" value={code} />

      {!signedIn && (
        <>
          <div className="flex flex-col gap-2">
            <label htmlFor="email" className={LABEL}>
              이메일
            </label>
            <input
              id="email"
              name="email"
              type="email"
              required
              autoComplete="email"
              placeholder="you@school.ac.kr"
              aria-invalid={state?.field === "email" || undefined}
              className={INPUT}
            />
            {state?.field === "email" && <FieldError message={state.message} />}
          </div>

          <div className="flex flex-col gap-2">
            <label htmlFor="password" className={LABEL}>
              비밀번호
            </label>
            <input
              id="password"
              name="password"
              type="password"
              required
              minLength={8}
              autoComplete="new-password"
              aria-invalid={state?.field === "password" || undefined}
              aria-describedby="password-help"
              className={INPUT}
            />
            <p id="password-help" className="text-sm text-ink-soft">
              8자 이상으로 정해주세요.
            </p>
            {state?.field === "password" && (
              <FieldError message={state.message} />
            )}
          </div>
        </>
      )}

      <div className="flex flex-col gap-2">
        <label htmlFor="nickname" className={LABEL}>
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
          aria-describedby="nickname-help"
          className={INPUT}
        />
        <p id="nickname-help" className="text-sm text-ink-soft">
          같은 캠페인 참가자들에게 보입니다. 이메일은 공개되지 않아요.
        </p>
        {state?.field === "nickname" && <FieldError message={state.message} />}
      </div>

      {state?.field === "code" && <FieldError message={state.message} />}

      <SubmitButton pendingLabel="참가하는 중">
        {signedIn ? "캠페인 참가" : "가입하고 참가"}
      </SubmitButton>
    </form>
  );
}
