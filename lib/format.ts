/** '2026-08-01' → '8월 1일' */
export function formatKoreanDate(isoDate: string) {
  const [, month, day] = isoDate.split("-");
  return `${Number(month)}월 ${Number(day)}일`;
}

/** 캠페인 기간을 한 줄로. */
export function formatPeriod(startDate: string, endDate: string) {
  return `${formatKoreanDate(startDate)} – ${formatKoreanDate(endDate)}`;
}
