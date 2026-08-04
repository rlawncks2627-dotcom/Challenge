import Link from "next/link";

import { Wordmark } from "@/components/wordmark";

export default async function VerifyEmailPage({
  searchParams,
}: PageProps<"/verify-email">) {
  const { email } = await searchParams;

  return (
    <main className="mx-auto flex w-full max-w-sm flex-1 flex-col justify-center gap-6 px-6 py-12">
      <Wordmark className="text-2xl" />

      <div className="flex flex-col gap-3 border-l-4 border-green pl-4">
        <h1 className="text-xl font-bold">메일함을 확인해주세요</h1>
        <p className="text-ink-soft">
          {typeof email === "string" ? (
            <>
              <span className="font-semibold text-ink">{email}</span> 으로 확인
              링크를 보냈습니다.
            </>
          ) : (
            "입력하신 주소로 확인 링크를 보냈습니다."
          )}
        </p>
        <p className="text-ink-soft">
          링크를 누르면 참가가 완료되고 바로 오늘의 실천 화면으로 이동합니다.
        </p>
      </div>

      <p className="text-sm text-ink-soft">
        메일이 오지 않았다면 스팸함을 확인해보세요. 이미 확인을 마쳤다면{" "}
        <Link href="/login" className="underline underline-offset-4">
          로그인
        </Link>
        하면 됩니다.
      </p>
    </main>
  );
}
