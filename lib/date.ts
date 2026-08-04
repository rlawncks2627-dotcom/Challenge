/**
 * 캠페인의 '오늘'은 서울 기준이다.
 *
 * 브라우저 시간대를 쓰면 서버가 렌더한 '오늘의 체크인'과 클라이언트가 보내는
 * 날짜가 어긋난다. 캠페인 자체가 한 지역에서 열리므로 기준을 하나로 고정하는
 * 편이 맞다. 다른 지역 캠페인을 열게 되면 이 상수를 캠페인 속성으로 옮긴다.
 */
export const CAMPAIGN_TIME_ZONE = "Asia/Seoul";

/** 'YYYY-MM-DD' */
export function campaignToday(now: Date = new Date()): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: CAMPAIGN_TIME_ZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(now);
}

export type CampaignPhase = "before" | "open" | "ended";

/** ISO 날짜 문자열은 사전순 비교가 곧 시간순 비교다. */
export function campaignPhase(
  startDate: string,
  endDate: string,
  today: string = campaignToday(),
): CampaignPhase {
  if (today < startDate) return "before";
  if (today > endDate) return "ended";
  return "open";
}
