import Link from "next/link";
import { redirect } from "next/navigation";

import { InviteCodeForm } from "@/components/invite-code-form";
import { Wordmark } from "@/components/wordmark";
import { getCurrentParticipant } from "@/lib/participant";

export default async function Home() {
  // 이미 참가한 브라우저를 초대코드 화면에 다시 세워둘 이유가 없다.
  const participant = await getCurrentParticipant();
  if (participant) redirect("/today");

  return (
    <main className="mx-auto flex w-full max-w-sm flex-1 flex-col justify-center gap-10 px-6 py-12">
      <header className="flex flex-col gap-6">
        <Wordmark className="text-3xl" />

        {/* 이 앱이 무엇인지 한 문장으로 설명하는 자리.
            추상적인 구호 대신 실제 데이터에 있는 숫자를 쓴다. */}
        <p className="text-xl leading-relaxed font-medium">
          오늘 텀블러 한 번이{" "}
          <span className="font-display text-2xl text-green">25g</span>
          입니다.
          <br />
          <span className="text-ink-soft">
            혼자서는 그램이지만, 다 같이 모으면 킬로그램이 됩니다.
          </span>
        </p>
      </header>

      <div className="flex flex-col gap-4">
        <div className="h-px w-full bg-rule" />
        <InviteCodeForm />
        <p className="text-sm text-ink-soft">
          초대코드는 캠페인 운영자에게 받으세요.
        </p>
        <p className="text-sm text-ink-soft">
          이미 참가했다면{" "}
          <Link href="/login" className="underline underline-offset-4">
            로그인
          </Link>
        </p>
      </div>
    </main>
  );
}
