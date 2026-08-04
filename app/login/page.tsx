import Link from "next/link";
import { redirect } from "next/navigation";

import { LoginForm } from "@/components/login-form";
import { Wordmark } from "@/components/wordmark";
import { getCurrentParticipant } from "@/lib/participant";

export default async function LoginPage({
  searchParams,
}: PageProps<"/login">) {
  const participant = await getCurrentParticipant();
  if (participant) redirect("/today");

  const { error } = await searchParams;

  return (
    <main className="mx-auto flex w-full max-w-sm flex-1 flex-col justify-center gap-8 px-6 py-12">
      <header className="flex flex-col gap-3">
        <Wordmark className="text-2xl" />
        <h1 className="text-xl font-bold">다시 오셨네요</h1>
      </header>

      {error === "link" && (
        <p
          role="alert"
          className="rounded-sm border-2 border-pink px-4 py-3 text-sm font-medium text-pink"
        >
          확인 링크가 만료됐거나 이미 사용됐습니다. 로그인해주세요.
        </p>
      )}

      <LoginForm />

      <p className="text-sm text-ink-soft">
        아직 참가 전인가요?{" "}
        <Link href="/" className="underline underline-offset-4">
          초대코드로 참가하기
        </Link>
      </p>
    </main>
  );
}
