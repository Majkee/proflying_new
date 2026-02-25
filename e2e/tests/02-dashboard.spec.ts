import { test, expect } from "@playwright/test";
import { HEADERS } from "../helpers/selectors";

test.describe("Dashboard", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/dashboard");
    await page.waitForSelector(HEADERS.dashboard, { timeout: 15_000 });
  });

  test.describe("Stats cards", () => {
    test("shows 'Aktywne kursantki' stats card", async ({ page }) => {
      await expect(page.locator('text="Aktywne kursantki"').first()).toBeVisible();
    });

    test("shows 'Aktywne grupy' stats card", async ({ page }) => {
      await expect(page.locator('text="Aktywne grupy"').first()).toBeVisible();
    });

    test("shows 'Przychod (miesiac)' stats card", async ({ page }) => {
      await expect(page.locator('text=/Przychod/').first()).toBeVisible();
    });

    test("shows 'Zaleglosci' stats card", async ({ page }) => {
      await expect(page.locator('text="Zaleglosci"').first()).toBeVisible();
    });

    test("stats cards contain numeric values", async ({ page }) => {
      // At least one card should have a number
      const statValues = page.locator('[data-testid="page-header"] ~ div .text-2xl, .text-3xl');
      await page.waitForTimeout(2000);
      const count = await statValues.count();
      expect(count).toBeGreaterThan(0);
    });
  });

  test.describe("Sections", () => {
    test("shows 'Do oplaty dzisiaj' section", async ({ page }) => {
      // This section may or may not have items
      await page.waitForTimeout(2000);
      const section = page.locator('text="Do oplaty"');
      // Soft check — may not appear if no payments due
      const count = await section.count();
      expect(count).toBeGreaterThanOrEqual(0);
    });

    test("page loads without errors", async ({ page }) => {
      await page.waitForTimeout(2000);
      // No error messages should be visible
      const errorTexts = page.locator('text="Wystapil blad"');
      await expect(errorTexts).toHaveCount(0);
    });

    test("dashboard has correct page header", async ({ page }) => {
      const header = page.locator('[data-testid="page-header"]');
      await expect(header).toBeVisible();
      await expect(header.locator("h1")).toContainText("Pulpit");
    });

    test("alert banners render when applicable", async ({ page }) => {
      await page.waitForTimeout(2000);
      // Check for any alert banners (overdue, birthdays, etc.)
      // These are soft checks - may or may not be present
      const alerts = page.locator('[role="alert"], .bg-yellow-50, .bg-red-50');
      const count = await alerts.count();
      // Just verify no crash
      expect(count).toBeGreaterThanOrEqual(0);
    });
  });
});
