import { defineConfig, devices } from "@playwright/test";

const PORT = 3140;
const baseURL = `http://localhost:${PORT}`;

export default defineConfig({
  testDir: "./e2e",
  fullyParallel: false, // 같은 캠페인 데이터를 건드리므로 순서대로 돈다
  workers: 1,
  retries: 0,
  reporter: [["list"]],
  timeout: 60_000,
  use: {
    baseURL,
    trace: "off",
  },
  projects: [
    {
      // 실천 체크는 대부분 휴대폰에서 일어난다. 기본 뷰포트를 그렇게 둔다.
      name: "mobile",
      use: { ...devices["Pixel 7"] },
    },
  ],
  webServer: {
    command: `npx next start -p ${PORT}`,
    url: baseURL,
    reuseExistingServer: false,
    timeout: 120_000,
  },
});
