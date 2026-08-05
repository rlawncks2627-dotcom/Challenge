import { redirect } from "next/navigation";

import { CharacterCredit, CharacterRow } from "@/components/characters";
import { InviteCodeForm } from "@/components/invite-code-form";
import { Wordmark } from "@/components/wordmark";
import { getCurrentParticipant } from "@/lib/participant";

export default async function Home() {
  // 이미 참가한 브라우저를 초대코드 화면에 다시 세워둘 이유가 없다.
  const participant = await getCurrentParticipant();
  if (participant) redirect("/today");

  return (
    <main className="mx-auto flex w-full max-w-sm flex-1 flex-col justify-center gap-10 px-6 py-12">
      <header className="flex flex-col items-center gap-5 text-center">
        {/* 글자보다 먼저 눈에 들어와야 하는 자리. */}
        <CharacterRow />

        <Wordmark className="text-3xl" />

        {/* 이 앱이 무엇인지 한 문장으로. 초등학교 2학년이 읽을 문장이라
            추상적인 구호 대신 실제 항목에 붙은 숫자를 쓴다. */}
        <p className="text-lg leading-relaxed font-medium">
          오늘 텀블러 한 번이{" "}
          <span className="font-display text-2xl text-green">25g</span>
          이에요.
          <br />
          <span className="text-ink-soft">
            혼자서는 조금이지만, 다 같이 모으면 나무 한 그루가 돼요.
          </span>
        </p>
      </header>

      <div className="flex flex-col gap-4">
        <div className="h-px w-full bg-rule" />
        <InviteCodeForm />
        <p className="text-sm text-ink-soft">
          초대코드는 선생님이나 캠페인 운영자에게 받으세요. 가입도 비밀번호도
          없이 학년·반·번호만 고르면 참가됩니다.
        </p>
        <CharacterCredit />
      </div>
    </main>
  );
}
