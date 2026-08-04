import { describe, expect, it } from "vitest";

import { describeCo2, formatCo2, goalProgress } from "./co2";

describe("formatCo2", () => {
  it.each([
    [0, "0g"],
    [25, "25g"],
    [999, "999g"],
    [1_000, "1kg"],
    [1_250, "1.3kg"],
    [12_480, "12kg"],
    [500_000, "500kg"],
    [1_250_000, "1.3t"],
  ])("%i g → %s", (grams, expected) => {
    expect(formatCo2(grams)).toBe(expected);
  });
});

describe("describeCo2", () => {
  it("아직 아무것도 없으면 그렇게 말한다", () => {
    expect(describeCo2(0)).toBe("아직 시작 전이에요");
  });

  it("한 그루에 못 미치면 며칠치로 말한다", () => {
    // 25g ÷ (6600/365) ≈ 1.38일
    expect(describeCo2(25)).toBe("소나무 한 그루가 1일 동안 흡수할 양");
  });

  it("아주 적은 양도 0일이라고 하지 않는다", () => {
    expect(describeCo2(1)).toBe("소나무 한 그루가 1일 동안 흡수할 양");
  });

  it("한 그루를 넘기면 그루 수로 바뀐다", () => {
    expect(describeCo2(6_600)).toBe("소나무 1그루가 1년간 흡수할 양");
    expect(describeCo2(12_540)).toBe("소나무 1.9그루가 1년간 흡수할 양");
  });

  it("목표치(500kg)는 76그루쯤 된다", () => {
    expect(describeCo2(500_000)).toBe("소나무 76그루가 1년간 흡수할 양");
  });
});

describe("goalProgress", () => {
  it("목표가 없으면 0", () => {
    expect(goalProgress(1_000, 0)).toBe(0);
  });

  it("반쯤 왔으면 50", () => {
    expect(goalProgress(250_000, 500_000)).toBe(50);
  });

  it("목표를 넘겨도 100 을 넘지 않는다", () => {
    expect(goalProgress(900_000, 500_000)).toBe(100);
  });
});
