import { expect, test, type Page } from "@playwright/test";

/**
 * 참가자 흐름 E2E.
 *
 * 사전 준비가 필요 없다. 초대코드와 자리만 있으면 참가되고, 같은 자리를
 * 다시 고르면 그 기록으로 이어진다 — 그래서 몇 번을 돌려도 같은 참가자다.
 */
const CODE = process.env.E2E_CODE ?? "GREEN2026";
const SLOT = { grade: "3", classNo: "2", studentNo: "15" };
const NICKNAME = "E2E검증";

async function login(page: Page) {
  await page.goto(`/join/${CODE}`);
  await page.selectOption("#grade", SLOT.grade);
  await page.selectOption("#class_no", SLOT.classNo);
  await page.selectOption("#student_no", SLOT.studentNo);
  await page.getByLabel("닉네임").fill(NICKNAME);
  await page.getByRole("button", { name: "캠페인 참가" }).click();
  await page.waitForURL("**/today");
  // 목록이 그려지기 전에 도장 수를 세면 0 이 나온다.
  await expect(page.locator('button[aria-pressed]').first()).toBeVisible();
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
    // 자리가 화면에 남아 있어야 다음에 어느 번호로 들어올지 알 수 있다.
    await expect(page.getByText("3학년 2반 15번").first()).toBeVisible();

    expect(title.length).toBeGreaterThan(0);
  });

  test("도장을 찍으면 물범이 잠깐 나타났다 사라진다", async ({ page }) => {
    await login(page);

    const cheer = page.locator(".cheer");
    await expect(cheer).toHaveCount(0);

    await firstUnchecked(page).click();
    await expect(cheer).toBeVisible();

    // 누르는 것을 막으면 안 된다.
    await expect(cheer).toHaveCSS("pointer-events", "none");

    // 스스로 물러난다. DOM 에는 남지만 보이지 않는 상태가 된다.
    await expect
      .poll(
        () => cheer.evaluate((el) => Number(getComputedStyle(el).opacity)),
        { timeout: 6000 },
      )
      .toBeLessThan(0.05);
  });

  test("같은 자리를 다시 고르면 기존 기록으로 이어진다", async ({ page }) => {
    await login(page);
    const before = await page.locator('[data-stamped="true"]').count();
    // 그 자리에 이미 참가한 적이 있으면 처음 정한 닉네임이 유지된다.
    // 그래서 입력한 이름이 아니라 화면에 뜬 이름을 기준으로 삼는다.
    const greeting = await page.locator("header p").first().innerText();

    // 세션을 버리고 처음부터 다시 참가한다.
    await page.context().clearCookies();
    await login(page);

    await expect(page.locator("header p").first()).toHaveText(greeting);
    await expect(page.locator('[data-stamped="true"]')).toHaveCount(before);
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
