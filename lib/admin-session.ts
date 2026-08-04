import { cookies } from "next/headers";

const COOKIE = "greenstep_admin";
const MAX_AGE = 60 * 60 * 8; // 8시간. 캠페인 하루 작업이 끝날 만큼.

export type AdminSession = { code: string; admin: string };

/**
 * 관리자 코드를 httpOnly 쿠키에 담아둔다.
 *
 * 관리자에게는 계정이 없다. 매 요청마다 코드를 다시 입력시키는 대신
 * 브라우저에 넣어두되, 자바스크립트에서는 읽히지 않게 하고 경로도
 * /admin 아래로 제한한다. 서버 함수는 어차피 코드를 매번 검증한다.
 */
export async function readAdminSession(): Promise<AdminSession | null> {
  const raw = (await cookies()).get(COOKIE)?.value;
  if (!raw) return null;

  try {
    const parsed = JSON.parse(Buffer.from(raw, "base64").toString("utf8"));
    if (typeof parsed?.code === "string" && typeof parsed?.admin === "string") {
      return parsed;
    }
  } catch {
    // 형식이 깨진 쿠키는 없는 것으로 본다.
  }
  return null;
}

/** 서버 액션 / 라우트 핸들러에서만 호출할 수 있다. */
export async function writeAdminSession(session: AdminSession) {
  const value = Buffer.from(JSON.stringify(session), "utf8").toString("base64");
  (await cookies()).set(COOKIE, value, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/admin",
    maxAge: MAX_AGE,
  });
}

export async function clearAdminSession() {
  (await cookies()).delete({ name: COOKIE, path: "/admin" });
}
