/** 초대코드는 영문 대문자와 숫자 4~16자. DB 의 check 제약과 같은 규칙이다. */
export const INVITE_CODE = /^[A-Z0-9]{4,16}$/;

/** 소문자로 적어 오거나 앞뒤 공백이 붙어 오는 경우가 흔하다. */
export function normalizeCode(raw: string) {
  return raw.trim().toUpperCase();
}
