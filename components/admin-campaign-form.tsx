"use client";

import { useActionState } from "react";

import { INPUT, LABEL } from "@/components/form-styles";
import { SubmitButton } from "@/components/submit-button";
import { updateCampaign, type AdminFormState } from "@/lib/actions/admin";

export function AdminCampaignForm({
  name,
  startDate,
  endDate,
  goalCo2G,
}: {
  name: string;
  startDate: string;
  endDate: string;
  goalCo2G: number;
}) {
  const [state, formAction] = useActionState<AdminFormState, FormData>(
    updateCampaign,
    null,
  );

  return (
    <form action={formAction} className="flex flex-col gap-5">
      <div className="flex flex-col gap-2">
        <label htmlFor="name" className={LABEL}>
          캠페인 이름
        </label>
        <input
          id="name"
          name="name"
          defaultValue={name}
          required
          maxLength={60}
          className={INPUT}
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="flex flex-col gap-2">
          <label htmlFor="start_date" className={LABEL}>
            시작일
          </label>
          <input
            id="start_date"
            name="start_date"
            type="date"
            defaultValue={startDate}
            required
            className={INPUT}
          />
        </div>
        <div className="flex flex-col gap-2">
          <label htmlFor="end_date" className={LABEL}>
            종료일
          </label>
          <input
            id="end_date"
            name="end_date"
            type="date"
            defaultValue={endDate}
            required
            className={INPUT}
          />
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
          defaultValue={Math.round(goalCo2G / 1000)}
          required
          className={INPUT}
        />
      </div>

      <div className="flex flex-col gap-2">
        <label htmlFor="new_admin" className={LABEL}>
          새 관리자 코드 (선택)
        </label>
        <input
          id="new_admin"
          name="new_admin"
          type="password"
          autoComplete="new-password"
          placeholder="바꾸지 않으려면 비워두세요"
          aria-describedby="new-admin-help"
          className={INPUT}
        />
        <p id="new-admin-help" className="text-sm text-ink-soft">
          8자 이상. 바꾸면 이 브라우저는 새 코드로 자동 전환됩니다.
        </p>
      </div>

      {state && (
        <p role="status" className="text-sm font-medium">
          {state.message}
        </p>
      )}

      <SubmitButton pendingLabel="저장하는 중">캠페인 설정 저장</SubmitButton>
    </form>
  );
}
