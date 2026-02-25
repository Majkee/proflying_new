import { test as base, expect } from "@playwright/test";

export const test = base.extend({
  page: async ({ page }, use) => {
    // Navigate to dashboard and wait for app shell to be ready
    await page.goto("/dashboard");
    await page.waitForSelector("h1", { timeout: 15_000 });
    await use(page);
  },
});

export { expect };
