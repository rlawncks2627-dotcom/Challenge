import { redirect } from "next/navigation";

import { TabBar } from "@/components/tab-bar";
import { getCurrentParticipant } from "@/lib/participant";

/** 참가한 사람만 들어올 수 있는 구역. */
export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const participant = await getCurrentParticipant();
  if (!participant) redirect("/");

  return (
    <>
      {/* 하단 탭이 마지막 줄을 가리지 않도록 자리를 비워둔다. */}
      <div className="flex flex-1 flex-col pb-20">{children}</div>
      <TabBar />
    </>
  );
}
