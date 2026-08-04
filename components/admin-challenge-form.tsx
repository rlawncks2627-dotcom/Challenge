"use client";

import { useActionState } from "react";

import { INPUT_SM, LABEL } from "@/components/form-styles";
import {
  deleteChallenge,
  saveChallenge,
  type AdminFormState,
} from "@/lib/actions/admin";

export type AdminChallenge = {
  id: string;
  title: string;
  description: string | null;
  icon: string;
  points: number;
  co2_saved_g: number;
  sort_order: number;
  is_active: boolean;
  checkin_count: number;
};

/**
 * 항목 한 줄. 새 항목 추가에도 같은 폼을 쓴다(challenge 가 없을 때).
 *
 * 기록이 있는 항목은 삭제 버튼을 아예 내보내지 않는다. 눌러봐야 서버가
 * 거절할 버튼을 보여주는 건 안내가 아니라 함정이다.
 */
export function AdminChallengeForm({
  challenge,
  defaultSortOrder,
}: {
  challenge?: AdminChallenge;
  defaultSortOrder?: number;
}) {
  const [saveState, saveAction] = useActionState<AdminFormState, FormData>(
    saveChallenge,
    null,
  );
  const [deleteState, deleteAction] = useActionState<AdminFormState, FormData>(
    deleteChallenge,
    null,
  );

  const used = (challenge?.checkin_count ?? 0) > 0;

  return (
    <li className="flex flex-col gap-3 rounded-sm border-2 border-rule p-4">
      <form action={saveAction} className="flex flex-col gap-3">
        {challenge && <input type="hidden" name="id" value={challenge.id} />}

        <div className="flex gap-3">
          <div className="flex w-16 flex-col gap-1">
            <label htmlFor={`icon-${challenge?.id ?? "new"}`} className={LABEL}>
              아이콘
            </label>
            <input
              id={`icon-${challenge?.id ?? "new"}`}
              name="icon"
              defaultValue={challenge?.icon ?? ""}
              maxLength={4}
              placeholder="🌱"
              className={`${INPUT_SM} text-center`}
            />
          </div>

          <div className="flex flex-1 flex-col gap-1">
            <label htmlFor={`title-${challenge?.id ?? "new"}`} className={LABEL}>
              항목 이름
            </label>
            <input
              id={`title-${challenge?.id ?? "new"}`}
              name="title"
              defaultValue={challenge?.title ?? ""}
              required
              maxLength={40}
              className={INPUT_SM}
            />
          </div>
        </div>

        <div className="flex flex-col gap-1">
          <label
            htmlFor={`description-${challenge?.id ?? "new"}`}
            className={LABEL}
          >
            설명
          </label>
          <input
            id={`description-${challenge?.id ?? "new"}`}
            name="description"
            defaultValue={challenge?.description ?? ""}
            maxLength={200}
            className={INPUT_SM}
          />
        </div>

        <div className="grid grid-cols-3 gap-3">
          <div className="flex flex-col gap-1">
            <label htmlFor={`points-${challenge?.id ?? "new"}`} className={LABEL}>
              점수
            </label>
            <input
              id={`points-${challenge?.id ?? "new"}`}
              name="points"
              type="number"
              min={1}
              max={100}
              defaultValue={challenge?.points ?? 2}
              required
              className={INPUT_SM}
            />
          </div>
          <div className="flex flex-col gap-1">
            <label htmlFor={`co2-${challenge?.id ?? "new"}`} className={LABEL}>
              절감 g
            </label>
            <input
              id={`co2-${challenge?.id ?? "new"}`}
              name="co2_saved_g"
              type="number"
              min={0}
              max={100000}
              defaultValue={challenge?.co2_saved_g ?? 100}
              required
              className={INPUT_SM}
            />
          </div>
          <div className="flex flex-col gap-1">
            <label htmlFor={`order-${challenge?.id ?? "new"}`} className={LABEL}>
              순서
            </label>
            <input
              id={`order-${challenge?.id ?? "new"}`}
              name="sort_order"
              type="number"
              defaultValue={challenge?.sort_order ?? defaultSortOrder ?? 0}
              required
              className={INPUT_SM}
            />
          </div>
        </div>

        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            name="is_active"
            defaultChecked={challenge?.is_active ?? true}
            className="size-4 accent-[var(--green)]"
          />
          참가자 화면에 표시
        </label>

        <div className="flex items-center gap-3">
          <button
            type="submit"
            className="rounded-sm bg-green px-4 py-2.5 text-sm font-semibold text-paper"
          >
            {challenge ? "저장" : "항목 추가"}
          </button>

          {challenge && (
            <span className="font-mono text-xs text-ink-soft">
              실천 {challenge.checkin_count}회
            </span>
          )}
        </div>
      </form>

      {challenge && !used && (
        <form action={deleteAction}>
          <input type="hidden" name="id" value={challenge.id} />
          <button
            type="submit"
            className="text-sm text-pink underline underline-offset-4"
          >
            항목 삭제
          </button>
        </form>
      )}

      {challenge && used && (
        <p className="text-sm text-ink-soft">
          이미 실천 기록이 있어 삭제할 수 없습니다. 더 쓰지 않으려면 위
          체크박스를 꺼주세요. 점수를 바꿔도 지난 기록은 그대로 남습니다.
        </p>
      )}

      {(saveState || deleteState) && (
        <p role="status" className="text-sm font-medium">
          {saveState?.message ?? deleteState?.message}
        </p>
      )}
    </li>
  );
}
