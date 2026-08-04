"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

import {
  ChallengeCard,
  type Challenge,
  type TodayCheckin,
} from "@/components/challenge-card";
import { CheckinSheet, type SheetSubmit } from "@/components/checkin-sheet";
import { createCheckin, deleteCheckin } from "@/lib/checkins";

/**
 * 오늘의 실천 목록.
 *
 * 체크 상태의 진실은 언제나 서버가 보내준 props 다. 낙관적 표시로 상태를
 * 앞질러 두면 실패했을 때 되돌리는 코드가 늘고, 무엇보다 '찍혔다'고 보였다가
 * 사라지는 게 스탬프 카드에서는 가장 나쁜 경험이다. 대신 진행 중임을 분명히
 * 보여주고 서버 응답을 기다린다.
 */
export function ChallengeList({
  challenges,
  checkins,
  campaignId,
  participantId,
  date,
  locked,
}: {
  challenges: Challenge[];
  checkins: TodayCheckin[];
  campaignId: string;
  participantId: string;
  date: string;
  locked: boolean;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [actedId, setActedId] = useState<string | null>(null);
  const [mutating, setMutating] = useState(false);
  const [sheetFor, setSheetFor] = useState<Challenge | null>(null);
  const [error, setError] = useState<string | null>(null);

  // 진행 중 = 네트워크 요청 중이거나, 서버 재렌더를 기다리는 중.
  // 두 상태에서 파생시키면 정리해줄 것이 없다.
  const busyId = mutating || isPending ? actedId : null;

  const byChallenge = new Map(checkins.map((c) => [c.challenge_id, c]));

  async function toggle(challenge: Challenge) {
    setError(null);
    setActedId(challenge.id);
    setMutating(true);

    const existing = byChallenge.get(challenge.id);
    const result = existing
      ? await deleteCheckin(existing.id, existing.photo_path)
      : await createCheckin({
          campaignId,
          participantId,
          challengeId: challenge.id,
          date,
        });

    if (result.error) {
      setError(result.error);
      setMutating(false);
      return;
    }

    // 재렌더를 먼저 걸어야 isPending 이 이어받는다. 순서가 반대면 한 프레임 깜빡인다.
    startTransition(() => router.refresh());
    setMutating(false);
  }

  async function submitSheet(challenge: Challenge, value: SheetSubmit) {
    setError(null);
    setActedId(challenge.id);
    setMutating(true);

    const result = await createCheckin({
      campaignId,
      participantId,
      challengeId: challenge.id,
      date,
      photo: value.photo,
      memo: value.memo,
    });

    setSheetFor(null);

    if (result.error) {
      setError(result.error);
      setMutating(false);
      return;
    }

    startTransition(() => router.refresh());
    setMutating(false);
  }

  return (
    <>
      {error && (
        <p
          role="alert"
          className="rounded-sm border-2 border-pink px-4 py-3 text-sm font-medium text-pink"
        >
          {error}
        </p>
      )}

      <ul className="flex flex-col gap-3">
        {challenges.map((challenge) => (
          <ChallengeCard
            key={challenge.id}
            challenge={challenge}
            checkin={byChallenge.get(challenge.id) ?? null}
            busy={busyId === challenge.id}
            locked={locked}
            onToggle={() => toggle(challenge)}
            onOpenSheet={() => setSheetFor(challenge)}
          />
        ))}
      </ul>

      {sheetFor && (
        <CheckinSheet
          title={sheetFor.title}
          onClose={() => setSheetFor(null)}
          onSubmit={(value) => submitSheet(sheetFor, value)}
        />
      )}
    </>
  );
}
