import { describe, expect, it } from "vitest";

import { campaignPhase, campaignToday } from "./date";

describe("campaignToday", () => {
  it("서울 자정을 막 넘긴 순간은 다음 날이다", () => {
    // 2026-08-04 15:30 UTC = 2026-08-05 00:30 서울
    expect(campaignToday(new Date("2026-08-04T15:30:00Z"))).toBe("2026-08-05");
  });

  it("서울 자정 직전은 아직 같은 날이다", () => {
    // 2026-08-04 14:30 UTC = 2026-08-04 23:30 서울
    expect(campaignToday(new Date("2026-08-04T14:30:00Z"))).toBe("2026-08-04");
  });

  it("한 자리 월·일도 두 자리로 채운다", () => {
    expect(campaignToday(new Date("2026-01-02T03:00:00Z"))).toBe("2026-01-02");
  });
});

describe("campaignPhase", () => {
  const start = "2026-08-01";
  const end = "2026-08-31";

  it("시작 전", () => {
    expect(campaignPhase(start, end, "2026-07-31")).toBe("before");
  });

  it("시작 당일은 이미 열려 있다", () => {
    expect(campaignPhase(start, end, "2026-08-01")).toBe("open");
  });

  it("기간 중", () => {
    expect(campaignPhase(start, end, "2026-08-15")).toBe("open");
  });

  it("종료 당일까지는 참여할 수 있다", () => {
    expect(campaignPhase(start, end, "2026-08-31")).toBe("open");
  });

  it("종료 다음 날", () => {
    expect(campaignPhase(start, end, "2026-09-01")).toBe("ended");
  });

  it("해를 넘기는 캠페인도 사전순 비교로 맞는다", () => {
    expect(campaignPhase("2026-12-20", "2027-01-10", "2027-01-05")).toBe("open");
    expect(campaignPhase("2026-12-20", "2027-01-10", "2027-01-11")).toBe("ended");
  });
});
