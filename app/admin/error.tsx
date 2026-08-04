"use client";

import { ErrorScreen } from "@/components/error-screen";

export default function AdminError({ reset }: { reset: () => void }) {
  return (
    <ErrorScreen
      title="관리 화면을 불러오지 못했습니다"
      description="관리자 코드가 바뀌었거나 일시적인 문제일 수 있습니다."
      reset={reset}
      homeHref="/admin"
      homeLabel="관리자 코드 다시 입력"
    />
  );
}
