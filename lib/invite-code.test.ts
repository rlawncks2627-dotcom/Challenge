import { describe, expect, it } from "vitest";

import { INVITE_CODE, normalizeCode } from "./invite-code";

describe("normalizeCode", () => {
  it("소문자와 앞뒤 공백을 정리한다", () => {
    expect(normalizeCode("  green2026 ")).toBe("GREEN2026");
  });

  it("이미 정규형이면 그대로 둔다", () => {
    expect(normalizeCode("GREEN2026")).toBe("GREEN2026");
  });
});

describe("INVITE_CODE", () => {
  it.each(["GREEN2026", "ABCD", "A1B2C3D4E5F6G7H8"])("통과: %s", (code) => {
    expect(INVITE_CODE.test(code)).toBe(true);
  });

  it.each([
    ["짧음", "ABC"],
    ["김", "A1B2C3D4E5F6G7H8I"],
    ["소문자", "green2026"],
    ["하이픈", "GREEN-2026"],
    ["공백", "GREEN 2026"],
    ["빈 값", ""],
  ])("거부: %s", (_label, code) => {
    expect(INVITE_CODE.test(code)).toBe(false);
  });
});
