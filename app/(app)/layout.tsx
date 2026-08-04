import { redirect } from "next/navigation";

import { getCurrentParticipant } from "@/lib/participant";

/**
 * 참가한 사람만 들어올 수 있는 구역.
 * 하단 탭 네비게이션은 화면이 갖춰지는 Phase 5 에서 붙인다.
 */
export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const participant = await getCurrentParticipant();
  if (!participant) redirect("/");

  return <>{children}</>;
}
