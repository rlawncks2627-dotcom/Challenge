"use client";

import { ErrorScreen } from "@/components/error-screen";

export default function AppError({ reset }: { reset: () => void }) {
  return (
    <ErrorScreen
      title="화면을 불러오지 못했습니다"
      description="잠시 후 다시 시도해주세요. 계속 같은 화면이 나오면 캠페인 운영자에게 알려주세요."
      reset={reset}
    />
  );
}
