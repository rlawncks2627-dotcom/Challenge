"use client";

import { useActionState } from "react";

import { FieldError } from "@/components/field-error";
import { INPUT, LABEL } from "@/components/form-styles";
import { SubmitButton } from "@/components/submit-button";
import { adminSignIn, type AdminFormState } from "@/lib/actions/admin";

export function AdminLoginForm() {
  const [state, formAction] = useActionState<AdminFormState, FormData>(
    adminSignIn,
    null,
  );

  return (
    <form action={formAction} className="flex flex-col gap-5">
      <div className="flex flex-col gap-2">
        <label htmlFor="code" className={LABEL}>
          초대코드
        </label>
        <input
          id="code"
          name="code"
          required
          maxLength={16}
          autoCapitalize="characters"
          spellCheck={false}
          placeholder="GREEN2026"
          className={`${INPUT} font-mono tracking-[0.2em] uppercase`}
        />
      </div>

      <div className="flex flex-col gap-2">
        <label htmlFor="admin" className={LABEL}>
          관리자 코드
        </label>
        <input
          id="admin"
          name="admin"
          type="password"
          required
          autoComplete="off"
          className={INPUT}
        />
      </div>

      {state && <FieldError message={state.message} />}

      <SubmitButton pendingLabel="확인하는 중">관리 화면 열기</SubmitButton>
    </form>
  );
}
