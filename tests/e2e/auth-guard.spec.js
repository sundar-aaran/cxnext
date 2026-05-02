const { test, expect, chromium } = require("@playwright/test");

test("logout blocks access to protected desk routes", async () => {
  const browser = await chromium.launch({ channel: "chrome", headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();

  try {
    await page.goto("http://localhost:3000/login", { waitUntil: "networkidle" });
    await page.getByLabel("Username or email").fill("admin");
    await page.getByLabel("Password").fill("Admin@12345");
    await page.getByRole("button", { name: "Login" }).click();

    await page.waitForURL(/\/desk(\/.*)?$/);
    await page.goto("http://localhost:3000/desk/sales", { waitUntil: "networkidle" });
    await expect(page).toHaveURL(/\/desk\/sales$/);

    await page.getByRole("button", { name: "Logout" }).click();
    await page.waitForURL(/\/login/);
    await expect(page).toHaveURL(/\/login/);

    await page.goto("http://localhost:3000/desk/sales", { waitUntil: "networkidle" });
    await expect(page).toHaveURL(/\/login\?next=%2Fdesk%2Fsales$/);
  } finally {
    await context.close();
    await browser.close();
  }
});
