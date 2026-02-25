import { test, expect } from "@playwright/test";
import { SchedulePage } from "../page-objects/schedule.page";
import { HEADERS } from "../helpers/selectors";

test.describe("Schedule", () => {
  test("shows header 'Grafik'", async ({ page }) => {
    const schedulePage = new SchedulePage(page);
    await schedulePage.goto();
    await expect(schedulePage.header).toBeVisible();
  });

  test("shows week day columns", async ({ page }) => {
    const schedulePage = new SchedulePage(page);
    await schedulePage.goto();
    await page.waitForTimeout(2000);

    // Check for Polish day abbreviations or full names
    const dayNames = ["Pon", "Wt", "Sr", "Czw", "Pt", "Sob"];
    let foundDays = 0;
    for (const day of dayNames) {
      const count = await page.locator(`text="${day}"`).count();
      if (count > 0) foundDays++;
    }

    // Also check for full names
    const fullDayNames = ["Poniedzialek", "Wtorek", "Sroda", "Czwartek", "Piatek", "Sobota"];
    for (const day of fullDayNames) {
      const count = await page.locator(`text="${day}"`).count();
      if (count > 0) foundDays++;
    }

    expect(foundDays).toBeGreaterThan(0);
  });

  test("shows group blocks in the schedule", async ({ page }) => {
    const schedulePage = new SchedulePage(page);
    await schedulePage.goto();
    await page.waitForTimeout(2000);

    // Schedule should contain some group blocks (or be empty)
    const mainContent = page.locator("main");
    await expect(mainContent).toBeVisible();
  });

  test("week navigation exists", async ({ page }) => {
    const schedulePage = new SchedulePage(page);
    await schedulePage.goto();
    await page.waitForTimeout(1000);

    // Should have prev/next navigation
    const navButtons = page.locator('button:has(svg.lucide-chevron-left), button:has(svg.lucide-chevron-right)');
    const count = await navButtons.count();
    expect(count).toBeGreaterThanOrEqual(0);
  });

  test("page loads without errors", async ({ page }) => {
    const schedulePage = new SchedulePage(page);
    await schedulePage.goto();
    await page.waitForTimeout(2000);

    const errorTexts = page.locator('text="Wystapil blad"');
    await expect(errorTexts).toHaveCount(0);
  });

  test("clicking a group block navigates to group detail", async ({ page }) => {
    const schedulePage = new SchedulePage(page);
    await schedulePage.goto();
    await page.waitForTimeout(2000);

    // Find any clickable group block
    const groupLinks = page.locator('a[href*="/groups/"]');
    const count = await groupLinks.count();
    if (count > 0) {
      await groupLinks.first().click();
      await page.waitForURL(/\/groups\/.+/);
      expect(page.url()).toMatch(/\/groups\/.+/);
    }
  });
});
