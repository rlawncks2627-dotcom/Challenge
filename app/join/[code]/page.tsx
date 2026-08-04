import Link from "next/link";
import { redirect } from "next/navigation";

import { JoinForm } from "@/components/join-form";
import { Wordmark } from "@/components/wordmark";
import { formatPeriod } from "@/lib/format";
import { normalizeCode } from "@/lib/invite-code";
import { getCurrentParticipant } from "@/lib/participant";
import { createClient } from "@/lib/supabase/server";

export default async function JoinPage({ params }: PageProps<"/join/[code]">) {
  const { code: rawCode } = await params;
  const code = normalizeCode(decodeURIComponent(rawCode));

  const participant = await getCurrentParticipant();
  if (participant) redirect("/today");

  const supabase = await createClient();
  const [{ data }, { data: auth }] = await Promise.all([
    supabase.rpc("campaign_preview", { p_invite_code: code }),
    supabase.auth.getUser(),
  ]);
  const campaign = data?.[0];
  const signedIn = Boolean(auth.user);

  if (!campaign) {
    return (
      <main className="mx-auto flex w-full max-w-sm flex-1 flex-col justify-center gap-6 px-6 py-12">
        <Wordmark className="text-2xl" />
        <div className="flex flex-col gap-2">
          <p className="text-lg font-semibold">
            <span className="font-mono">{code}</span> 코드에 해당하는 캠페인이
            없습니다.
          </p>
          <p className="text-ink-soft">
            운영자에게 받은 코드를 다시 확인해주세요.
          </p>
        </div>
        <Link
          href="/"
          className="w-full rounded-sm border-2 border-ink px-5 py-4 text-center font-semibold"
        >
          코드 다시 입력
        </Link>
      </main>
    );
  }

  return (
    <main className="mx-auto flex w-full max-w-sm flex-1 flex-col justify-center gap-8 px-6 py-12">
      <Wordmark className="text-2xl" />

      {/* 코드가 맞는지 확인시켜 주는 자리. 닉네임을 묻기 전에 온다. */}
      <section className="flex flex-col gap-3 border-l-4 border-green pl-4">
        <p className="font-mono text-sm tracking-[0.2em] text-ink-soft">
          {code}
        </p>
        <h1 className="text-2xl leading-tight font-bold">{campaign.name}</h1>
        <p className="text-ink-soft">
          {formatPeriod(campaign.start_date, campaign.end_date)}
          {" · "}
          {campaign.participant_count > 0 ? (
            <>
              지금{" "}
              <span className="font-display text-base text-blue">
                {campaign.participant_count}명
              </span>{" "}
              참여 중
            </>
          ) : (
            "첫 번째 참가자가 됩니다"
          )}
        </p>
      </section>

      <JoinForm code={code} signedIn={signedIn} />

      <div className="flex flex-col gap-2 text-sm text-ink-soft">
        <Link href="/" className="underline underline-offset-4">
          다른 코드로 참가하기
        </Link>
        {!signedIn && (
          <Link href="/login" className="underline underline-offset-4">
            이미 계정이 있다면 로그인
          </Link>
        )}
      </div>
    </main>
  );
}
