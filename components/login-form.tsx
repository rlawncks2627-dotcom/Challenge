"use client";

import { useActionState } from "react";

import { FieldError } from "@/components/field-error";
import { INPUT, LABEL } from "@/components/form-styles";
import { SubmitButton } from "@/components/submit-button";
import { signIn, type LoginFormState } from "@/lib/actions/auth";

export function LoginForm() {
  const [state, formAction] = useActionState<LoginFormState, FormData>(
    signIn,
    null,
  );

  return (
    <form action={formAction} className="flex flex-col gap-5">
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
          aria-invalid={state?.field === "email" || undefined}
          className={INPUT}
        />
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
          autoComplete="current-password"
          aria-invalid={state?.field === "password" || undefined}
          className={INPUT}
        />
      </div>

      {state && <FieldError message={state.message} />}

      <SubmitButton pendingLabel="로그인하는 중">로그인</SubmitButton>
    </form>
  );
}
