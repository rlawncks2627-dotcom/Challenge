import Link from "next/link";

import { BUTTON_OUTLINE } from "@/components/form-styles";
import { Wordmark } from "@/components/wordmark";

export default function NotFound() {
  return (
    <main className="mx-auto flex w-full max-w-sm flex-1 flex-col justify-center gap-6 px-6 py-12">
      <Wordmark className="text-2xl" />

      <div className="flex flex-col gap-2 border-l-4 border-blue pl-4">
        <h1 className="text-xl font-bold">없는 주소입니다</h1>
        <p className="text-ink-soft">
          주소를 잘못 입력했거나, 캠페인이 끝나 사라진 화면일 수 있어요.
        </p>
      </div>

      <Link href="/" className={`${BUTTON_OUTLINE} text-center`}>
        처음으로
      </Link>
    </main>
  );
}
