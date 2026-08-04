"use client";

import { ErrorScreen } from "@/components/error-screen";

export default function RootError({ reset }: { reset: () => void }) {
  return (
    <ErrorScreen
      title="문제가 생겼습니다"
      description="잠시 후 다시 시도해주세요."
      reset={reset}
      homeHref="/"
      homeLabel="처음으로"
    />
  );
}
