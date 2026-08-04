/**
 * 게이지에 "12,480g"만 띄우면 아무 의미가 없다.
 * 사람이 크기를 가늠할 수 있는 단위로 바꿔준다.
 *
 * 기준: 소나무 1그루가 1년간 흡수하는 CO2 약 6.6kg (산림청 환산 자료).
 * 캠페인마다 다른 기준을 쓰고 싶다면 이 상수만 옮기면 된다.
 */
export const PINE_TREE_ANNUAL_CO2_G = 6600;

const DAYS_PER_YEAR = 365;
const PINE_TREE_DAILY_CO2_G = PINE_TREE_ANNUAL_CO2_G / DAYS_PER_YEAR;

/** 25 → '25g', 1250 → '1.3kg', 1250000 → '1.3t' */
export function formatCo2(grams: number): string {
  if (grams < 1_000) return `${Math.round(grams)}g`;
  if (grams < 1_000_000) return `${trim(grams / 1_000)}kg`;
  return `${trim(grams / 1_000_000)}t`;
}

/**
 * 소나무로 환산한 한 줄.
 *
 * 캠페인 첫날의 25g과 마지막 날의 400kg을 같은 문장 틀로 설명해야 한다.
 * 그루 수가 1을 넘기 전에는 '한 그루가 며칠치'로 말하는 편이 와닿는다.
 */
export function describeCo2(grams: number): string {
  if (grams <= 0) return "아직 시작 전이에요";

  if (grams >= PINE_TREE_ANNUAL_CO2_G) {
    const trees = grams / PINE_TREE_ANNUAL_CO2_G;
    return `소나무 ${trim(trees)}그루가 1년간 흡수할 양`;
  }

  const days = Math.max(1, Math.round(grams / PINE_TREE_DAILY_CO2_G));
  return `소나무 한 그루가 ${days}일 동안 흡수할 양`;
}

/** 목표 대비 진행률(0~100). 목표가 없으면 0. */
export function goalProgress(totalG: number, goalG: number): number {
  if (goalG <= 0) return 0;
  return Math.min(100, Math.round((totalG / goalG) * 100));
}

/** 10 미만은 소수 한 자리, 그 이상은 정수. 1.0 같은 꼬리는 떼어낸다. */
function trim(value: number): string {
  if (value >= 10) return Math.round(value).toLocaleString("ko-KR");
  return String(Math.round(value * 10) / 10);
}
