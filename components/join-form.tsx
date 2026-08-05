"use client";

import { useActionState } from "react";

import { FieldError } from "@/components/field-error";
import { INPUT, LABEL } from "@/components/form-styles";
import { SubmitButton } from "@/components/submit-button";
import { joinWithRoster, type JoinFormState } from "@/lib/actions/join";
import { CLASSES, GRADES, STUDENT_NUMBERS } from "@/lib/roster";

const SELECT = `${INPUT} appearance-none pr-7 text-center`;

export function JoinForm({ code }: { code: string }) {
  const [state, formAction] = useActionState<JoinFormState, FormData>(
    joinWithRoster,
    null,
  );

  return (
    <form action={formAction} className="flex flex-col gap-5">
      <input type="hidden" name="code" value={code} />

      <fieldset className="flex flex-col gap-2">
        <legend className={`${LABEL} mb-2`}>학년 · 반 · 번호</legend>

        <div className="grid grid-cols-3 gap-2">
          <Picker
            id="grade"
            label="학년"
            unit="학년"
            options={[...GRADES]}
            invalid={state?.field === "slot"}
          />
          <Picker
            id="class_no"
            label="반"
            unit="반"
            options={[...CLASSES]}
            invalid={state?.field === "slot"}
          />
          <Picker
            id="student_no"
            label="번호"
            unit="번"
            options={STUDENT_NUMBERS}
            invalid={state?.field === "slot"}
          />
        </div>

        <p className="text-sm text-ink-soft">
          다음에 다시 들어올 때도 같은 번호를 고르면 내 기록이 이어집니다.
        </p>

        {state?.field === "slot" && <FieldError message={state.message} />}
      </fieldset>

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
          같은 캠페인 참가자들에게 보입니다. 20자까지 쓸 수 있어요.
        </p>
        {state?.field === "nickname" && <FieldError message={state.message} />}
      </div>

      {state?.field === "code" && <FieldError message={state.message} />}

      <SubmitButton pendingLabel="참가하는 중">캠페인 참가</SubmitButton>
    </form>
  );
}

function Picker({
  id,
  label,
  unit,
  options,
  invalid,
}: {
  id: string;
  label: string;
  unit: string;
  options: number[];
  invalid: boolean;
}) {
  return (
    <div className="flex flex-col gap-1">
      <label htmlFor={id} className="text-xs text-ink-soft">
        {label}
      </label>

      {/* appearance-none 으로 기본 화살표가 사라지므로 직접 그린다.
          없으면 고를 수 있는 칸인지 알 수 없다. */}
      <div className="relative">
        <select
          id={id}
          name={id}
          required
          defaultValue=""
          aria-invalid={invalid || undefined}
          className={SELECT}
        >
          <option value="" disabled>
            –
          </option>
          {options.map((value) => (
            <option key={value} value={value}>
              {value}
              {unit}
            </option>
          ))}
        </select>
        <span
          aria-hidden
          className="pointer-events-none absolute top-1/2 right-3 -translate-y-1/2 text-xs text-ink-soft"
        >
          ▾
        </span>
      </div>
    </div>
  );
}
