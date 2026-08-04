import Link from "next/link";

import { AdminCreateForm } from "@/components/admin-create-form";
import { Wordmark } from "@/components/wordmark";

export default function AdminNewPage() {
  return (
    <main className="mx-auto flex w-full max-w-sm flex-1 flex-col gap-8 px-6 py-12">
      <header className="flex flex-col gap-3">
        <Wordmark className="text-2xl" />
        <h1 className="text-xl font-bold">새 캠페인 만들기</h1>
      </header>

      <AdminCreateForm />

      <p className="text-sm text-ink-soft">
        이미 만든 캠페인이 있다면{" "}
        <Link href="/admin" className="underline underline-offset-4">
          관리 화면 열기
        </Link>
      </p>
    </main>
  );
}
