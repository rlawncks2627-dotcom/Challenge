import type { Metadata } from "next";

/** 관리 화면은 검색엔진에 노출될 이유가 없다. */
export const metadata: Metadata = {
  title: "캠페인 관리 — 그린스텝",
  robots: { index: false, follow: false },
};

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
