import { expect, test, type Page } from "@playwright/test";

/**
 * 참가자 흐름 E2E.
 *
 * 계정은 마이그레이션과 별개로 미리 만들어 둔다(README 의 검증 절차 참고).
 * 이메일 확인이 필수인 프로젝트라 가입은 메일 왕복이 필요해서, 여기서는
 * 확인이 끝난 계정으로 로그인해 그 뒤를 검증한다.
 */
const EMAIL = process.env.E2E_EMAIL ?? "verify-e2e@greenstep.test";
const PASSWORD = process.env.E2E_PASSWORD ?? "verify-pass-1234";

async function login(page: Page) {
  await page.goto("/login");
  await page.getByLabel("이메일").fill(EMAIL);
  await page.getByLabel("비밀번호").fill(PASSWORD);
  await page.getByRole("button", { name: "로그인" }).click();
  await page.waitForURL("**/today");
}

/** 아직 도장이 찍히지 않은 첫 항목의 카드. */
function firstUnchecked(page: Page) {
  return page.locator('button[aria-pressed="false"]').first();
}

test.describe("참가자 흐름", () => {
  test("항목을 체크하면 도장이 찍히고 순위에 반영된다", async ({ page }) => {
    await login(page);

    const before = await page.locator('[data-stamped="true"]').count();

    const card = firstUnchecked(page);
    const title = await card.locator("span").nth(1).innerText();
    await card.click();

    // 서버 재렌더까지 기다린다.
    await expect(page.locator('[data-stamped="true"]')).toHaveCount(before + 1);

    await page.goto("/board");
    await expect(page.getByText("함께 모은 결과")).toBeVisible();
    // 내 행이 순위표에 있고 점수가 0 이 아니다.
    const myRow = page.locator("li", { hasText: "나" }).first();
    await expect(myRow).toBeVisible();
    await expect(myRow).not.toContainText("0점");

    await page.goto("/me");
    await expect(page.getByText("실천 달력")).toBeVisible();

    expect(title.length).toBeGreaterThan(0);
  });

  test("사진을 붙이면 브라우저에서 1200px 로 줄여 올린다", async ({ page }) => {
    await login(page);

    await page
      .getByRole("button", { name: "사진·메모와 함께 남기기" })
      .first()
      .click();

    await expect(page.getByRole("dialog")).toBeVisible();

    // 2000x1500 원본을 만들어 파일 입력에 넣는다.
    // lib/image.ts 의 리사이즈 경로는 브라우저에서만 도는 코드라
    // 여기가 아니면 실행될 곳이 없다.
    await page.evaluate(async () => {
      const canvas = document.createElement("canvas");
      canvas.width = 2000;
      canvas.height = 1500;
      const ctx = canvas.getContext("2d")!;
      ctx.fillStyle = "#00a95c";
      ctx.fillRect(0, 0, 2000, 1500);
      ctx.fillStyle = "#ff48b0";
      ctx.fillRect(200, 200, 600, 600);

      const blob = await new Promise<Blob | null>((resolve) =>
        canvas.toBlob(resolve, "image/png"),
      );
      const file = new File([blob!], "original.png", { type: "image/png" });
      const transfer = new DataTransfer();
      transfer.items.add(file);

      const input = document.querySelector<HTMLInputElement>("#photo")!;
      input.files = transfer.files;
      input.dispatchEvent(new Event("change", { bubbles: true }));
    });

    const preview = page.getByAltText("선택한 인증 사진 미리보기");
    await expect(preview).toBeVisible();

    // 긴 변이 1200 으로 줄고 비율이 유지됐는지.
    await expect
      .poll(() => preview.evaluate((el: HTMLImageElement) => el.naturalWidth))
      .toBe(1200);
    await expect
      .poll(() => preview.evaluate((el: HTMLImageElement) => el.naturalHeight))
      .toBe(900);

    const memo = `E2E 인증 ${Date.now()}`;
    await page.getByLabel("한 줄 메모 (선택)").fill(memo);

    const before = await page.locator('[data-stamped="true"]').count();
    await page.getByRole("button", { name: "완료로 표시" }).click();
    await expect(page.locator('[data-stamped="true"]')).toHaveCount(before + 1);

    await page.goto("/feed");
    await expect(page.getByText(memo)).toBeVisible();
    // 서명 URL 로 실제 이미지가 그려졌는지.
    const feedImage = page.locator("main img").first();
    await expect
      .poll(() => feedImage.evaluate((el: HTMLImageElement) => el.naturalWidth))
      .toBeGreaterThan(0);
  });

  test("모바일 폭에서 가로 스크롤이 생기지 않는다", async ({ page }) => {
    await login(page);

    for (const path of ["/today", "/feed", "/board", "/me"]) {
      await page.goto(path);
      await page.waitForLoadState("networkidle");

      const overflow = await page.evaluate(() => ({
        scrollWidth: document.documentElement.scrollWidth,
        clientWidth: document.documentElement.clientWidth,
      }));

      expect(
        overflow.scrollWidth,
        `${path} 에서 가로 스크롤 발생`,
      ).toBeLessThanOrEqual(overflow.clientWidth + 1);
    }
  });

  test("없는 주소는 안내 화면을 보여준다", async ({ page }) => {
    const response = await page.goto("/그런페이지없음");
    expect(response?.status()).toBe(404);
    await expect(page.getByText("없는 주소입니다")).toBeVisible();
  });
});
