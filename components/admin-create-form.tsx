"use client";

import { useActionState } from "react";

import { FieldError } from "@/components/field-error";
import { INPUT, LABEL } from "@/components/form-styles";
import { SubmitButton } from "@/components/submit-button";
import { createCampaign, type AdminFormState } from "@/lib/actions/admin";

export function AdminCreateForm() {
  const [state, formAction] = useActionState<AdminFormState, FormData>(
    createCampaign,
    null,
  );

  return (
    <form action={formAction} className="flex flex-col gap-5">
      <div className="flex flex-col gap-2">
        <label htmlFor="bootstrap" className={LABEL}>
          생성 코드
        </label>
        <input
          id="bootstrap"
          name="bootstrap"
          type="password"
          required
          autoComplete="off"
          aria-describedby="bootstrap-help"
          className={INPUT}
        />
        <p id="bootstrap-help" className="text-sm text-ink-soft">
          캠페인을 새로 만들 수 있는 사람을 제한하는 코드입니다. 이 서비스를
          설치한 사람에게 받으세요.
        </p>
      </div>

      <div className="flex flex-col gap-2">
        <label htmlFor="name" className={LABEL}>
          캠페인 이름
        </label>
        <input
          id="name"
          name="name"
          required
          maxLength={60}
          placeholder="2026 우리학교 그린챌린지"
          className={INPUT}
        />
      </div>

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
          aria-describedby="code-help"
          className={`${INPUT} font-mono tracking-[0.2em] uppercase`}
        />
        <p id="code-help" className="text-sm text-ink-soft">
          참가자들이 입력할 코드입니다. 영문 대문자와 숫자 4~16자.
        </p>
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
          minLength={8}
          autoComplete="new-password"
          aria-describedby="admin-help"
          className={INPUT}
        />
        <p id="admin-help" className="text-sm text-ink-soft">
          이 화면에 다시 들어올 때 씁니다. 8자 이상, 참가자에게 알려주지 마세요.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="flex flex-col gap-2">
          <label htmlFor="start_date" className={LABEL}>
            시작일
          </label>
          <input id="start_date" name="start_date" type="date" required className={INPUT} />
        </div>
        <div className="flex flex-col gap-2">
          <label htmlFor="end_date" className={LABEL}>
            종료일
          </label>
          <input id="end_date" name="end_date" type="date" required className={INPUT} />
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <label htmlFor="goal_kg" className={LABEL}>
          공동 목표 (kg CO2)
        </label>
        <input
          id="goal_kg"
          name="goal_kg"
          type="number"
          min={0}
          step={1}
          defaultValue={500}
          required
          className={INPUT}
        />
      </div>

      {state && <FieldError message={state.message} />}

      <SubmitButton pendingLabel="만드는 중">캠페인 만들기</SubmitButton>
    </form>
  );
}
