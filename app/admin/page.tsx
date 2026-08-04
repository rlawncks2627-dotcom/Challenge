import Link from "next/link";
import { redirect } from "next/navigation";

import { AdminLoginForm } from "@/components/admin-login-form";
import { Wordmark } from "@/components/wordmark";
import { readAdminSession } from "@/lib/admin-session";

export default async function AdminPage() {
  const session = await readAdminSession();
  if (session) redirect(`/admin/${session.code}`);

  return (
    <main className="mx-auto flex w-full max-w-sm flex-1 flex-col justify-center gap-8 px-6 py-12">
      <header className="flex flex-col gap-3">
        <Wordmark className="text-2xl" />
        <h1 className="text-xl font-bold">캠페인 관리</h1>
        <p className="text-sm text-ink-soft">
          운영자용 화면입니다. 참가자에게는 관리자 코드를 알려주지 마세요.
        </p>
      </header>

      <AdminLoginForm />

      <p className="text-sm text-ink-soft">
        새 캠페인을 열려면{" "}
        <Link href="/admin/new" className="underline underline-offset-4">
          캠페인 만들기
        </Link>
      </p>
    </main>
  );
}
