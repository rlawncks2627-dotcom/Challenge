import { Wordmark } from "@/components/wordmark";
import { formatPeriod } from "@/lib/format";
import { getCurrentParticipant } from "@/lib/participant";

export default async function TodayPage() {
  // 레이아웃이 이미 막아주지만, 페이지 혼자서도 성립해야 한다.
  const participant = await getCurrentParticipant();
  if (!participant) return null;

  const { campaign, nickname } = participant;

  return (
    <main className="mx-auto flex w-full max-w-sm flex-1 flex-col gap-8 px-6 py-12">
      <header className="flex flex-col gap-4">
        <Wordmark className="text-xl" />
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl leading-tight font-bold">
            {nickname}님, 반가워요
          </h1>
          <p className="text-ink-soft">
            {campaign.name} · {formatPeriod(campaign.startDate, campaign.endDate)}
          </p>
        </div>
      </header>

      <div className="rounded-sm border-2 border-dashed border-rule px-4 py-6 text-ink-soft">
        오늘의 실천 항목은 다음 단계에서 들어옵니다.
      </div>
    </main>
  );
}
