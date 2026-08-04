/**
 * Supabase 인증 오류를 사용자에게 보여줄 문장으로 바꾼다.
 *
 * 원문은 영어이고 개발자에게 하는 말이다. 그대로 띄우면 참가자는
 * 무엇을 어떻게 고쳐야 할지 알 수 없다.
 */
export function authErrorMessage(raw: string): string {
  const message = raw.toLowerCase();

  if (message.includes("already registered") || message.includes("already been registered")) {
    return "이미 가입된 이메일입니다. 로그인해주세요.";
  }
  if (message.includes("invalid login credentials")) {
    return "이메일 또는 비밀번호가 맞지 않습니다.";
  }
  if (message.includes("email not confirmed")) {
    return "이메일 확인이 아직 안 됐어요. 메일함의 확인 링크를 눌러주세요.";
  }
  if (message.includes("password should be at least")) {
    return "비밀번호가 너무 짧습니다. 8자 이상으로 정해주세요.";
  }
  if (message.includes("is invalid") && message.includes("email")) {
    return "이메일 주소를 다시 확인해주세요.";
  }
  if (message.includes("rate limit") || message.includes("too many")) {
    return "요청이 너무 잦습니다. 잠시 후 다시 시도해주세요.";
  }

  return "지금은 처리할 수 없습니다. 잠시 후 다시 시도해주세요.";
}
