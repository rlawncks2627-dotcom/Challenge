import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    // vitest 의 기본 include 는 .spec 도 잡는다. e2e/ 는 Playwright 담당이므로
    // 확장자로 경계를 나눈다: 단위 테스트는 .test.ts, E2E 는 .spec.ts.
    include: ["**/*.test.ts"],
    exclude: ["node_modules/**", ".next/**", "e2e/**"],
  },
});
