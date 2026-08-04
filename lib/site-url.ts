import { headers } from "next/headers";

/**
 * 이메일 확인 링크가 돌아올 주소.
 *
 * 배포 환경에서는 NEXT_PUBLIC_SITE_URL 을 박아두는 편이 확실하다.
 * 없으면 요청 헤더에서 유추한다 — 로컬 개발에서 매번 설정하지 않아도 되게.
 */
export async function getSiteOrigin(): Promise<string> {
  const configured = process.env.NEXT_PUBLIC_SITE_URL;
  if (configured) return configured.replace(/\/+$/, "");

  const h = await headers();
  const host = h.get("x-forwarded-host") ?? h.get("host") ?? "localhost:3000";
  const proto =
    h.get("x-forwarded-proto") ??
    (host.startsWith("localhost") || host.startsWith("127.0.0.1")
      ? "http"
      : "https");

  return `${proto}://${host}`;
}
