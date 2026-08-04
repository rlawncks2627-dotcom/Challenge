import { describe, expect, it } from "vitest";

import { buildMonthGrid, monthsBetween } from "./calendar";

describe("monthsBetween", () => {
  it("한 달짜리 캠페인은 한 칸", () => {
    expect(monthsBetween("2026-08-01", "2026-08-31")).toEqual([
      { year: 2026, month: 8 },
    ]);
  });

  it("달을 걸치면 두 칸", () => {
    expect(monthsBetween("2026-08-20", "2026-09-10")).toEqual([
      { year: 2026, month: 8 },
      { year: 2026, month: 9 },
    ]);
  });

  it("해를 넘어가도 이어진다", () => {
    expect(monthsBetween("2026-11-15", "2027-02-01")).toEqual([
      { year: 2026, month: 11 },
      { year: 2026, month: 12 },
      { year: 2027, month: 1 },
      { year: 2027, month: 2 },
    ]);
  });
});

describe("buildMonthGrid", () => {
  it("2026년 8월 1일은 토요일이라 앞이 6칸 비어 있다", () => {
    const weeks = buildMonthGrid(2026, 8);
    expect(weeks[0]).toEqual([
      null,
      null,
      null,
      null,
      null,
      null,
      "2026-08-01",
    ]);
  });

  it("모든 주는 7칸", () => {
    for (const week of buildMonthGrid(2026, 8)) {
      expect(week).toHaveLength(7);
    }
  });

  it("그 달의 날짜를 하나도 빠뜨리지 않는다", () => {
    const days = buildMonthGrid(2026, 8).flat().filter(Boolean);
    expect(days).toHaveLength(31);
    expect(days.at(-1)).toBe("2026-08-31");
  });

  it("윤년 2월은 29일까지", () => {
    const days = buildMonthGrid(2028, 2).flat().filter(Boolean);
    expect(days).toHaveLength(29);
  });

  it("평년 2월은 28일까지", () => {
    const days = buildMonthGrid(2026, 2).flat().filter(Boolean);
    expect(days).toHaveLength(28);
  });
});
