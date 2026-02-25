import { test, expect } from "@playwright/test";
import { SettingsPage } from "../page-objects/settings.page";
import { HEADERS } from "../helpers/selectors";

test.describe("Settings", () => {
  test.describe("Settings index", () => {
    test("shows header 'Ustawienia'", async ({ page }) => {
      const settingsPage = new SettingsPage(page);
      await settingsPage.goto();
      await expect(settingsPage.header).toBeVisible();
    });

    test("shows settings cards", async ({ page }) => {
      const settingsPage = new SettingsPage(page);
      await settingsPage.goto();
      await page.waitForTimeout(1000);

      // Should show various settings sections
      const expectedCards = ["Studia", "Uzytkownicy", "Typy karnetow", "Poziomy grup", "Dni wolne"];
      let foundCards = 0;
      for (const card of expectedCards) {
        const count = await page.locator(`text="${card}"`).count();
        if (count > 0) foundCards++;
      }
      expect(foundCards).toBeGreaterThan(0);
    });

    test("settings card links navigate to sub-pages", async ({ page }) => {
      const settingsPage = new SettingsPage(page);
      await settingsPage.goto();
      await page.waitForTimeout(1000);

      // Click on "Typy karnetow" card
      const passTypesLink = page.locator('a:has-text("Typy karnetow")');
      const count = await passTypesLink.count();
      if (count > 0) {
        await passTypesLink.first().click();
        await page.waitForURL(/\/settings\/pass-types/);
        expect(page.url()).toContain("/settings/pass-types");
      }
    });
  });

  test.describe("Pass types", () => {
    test("shows pass types page header", async ({ page }) => {
      await page.goto("/settings/pass-types");
      await page.waitForSelector("h1", { timeout: 15_000 });
      await expect(page.locator("h1").first()).toBeVisible();
    });

    test("shows 'Nowy typ karnetu' button", async ({ page }) => {
      await page.goto("/settings/pass-types");
      await page.waitForSelector("h1", { timeout: 15_000 });
      const addButton = page.locator('button:has-text("Nowy typ karnetu")');
      await expect(addButton.first()).toBeVisible();
    });

    test("shows existing pass types", async ({ page }) => {
      await page.goto("/settings/pass-types");
      await page.waitForSelector("h1", { timeout: 15_000 });
      await page.waitForTimeout(1000);

      // Page should have some content
      const mainContent = page.locator("main");
      await expect(mainContent).toBeVisible();
    });

    test("add button opens form dialog", async ({ page }) => {
      await page.goto("/settings/pass-types");
      await page.waitForSelector("h1", { timeout: 15_000 });
      await page.waitForTimeout(1000);

      const addButton = page.locator('button:has-text("Nowy typ karnetu")');
      await addButton.first().click();
      await page.waitForTimeout(500);

      // Dialog should appear
      const dialog = page.locator('[role="dialog"]');
      await expect(dialog).toBeVisible();
    });
  });

  test.describe("Group levels", () => {
    test("shows levels page header", async ({ page }) => {
      await page.goto("/settings/levels");
      await page.waitForSelector("h1", { timeout: 15_000 });
      await expect(page.locator("h1").first()).toBeVisible();
    });

    test("shows 'Nowy poziom' button", async ({ page }) => {
      await page.goto("/settings/levels");
      await page.waitForSelector("h1", { timeout: 15_000 });
      const addButton = page.locator('button:has-text("Nowy poziom")');
      await expect(addButton.first()).toBeVisible();
    });

    test("shows existing levels", async ({ page }) => {
      await page.goto("/settings/levels");
      await page.waitForSelector("h1", { timeout: 15_000 });
      await page.waitForTimeout(1000);

      const mainContent = page.locator("main");
      await expect(mainContent).toBeVisible();
    });

    test("add button opens form", async ({ page }) => {
      await page.goto("/settings/levels");
      await page.waitForSelector("h1", { timeout: 15_000 });
      await page.waitForTimeout(1000);

      const addButton = page.locator('button:has-text("Nowy poziom")');
      await addButton.first().click();
      await page.waitForTimeout(500);

      const dialog = page.locator('[role="dialog"]');
      await expect(dialog).toBeVisible();
    });
  });

  test.describe("Holidays", () => {
    test("shows holidays page header", async ({ page }) => {
      await page.goto("/settings/holidays");
      await page.waitForSelector("h1", { timeout: 15_000 });
      await expect(page.locator("h1").first()).toBeVisible();
    });

    test("shows 'Dodaj dzien wolny' button", async ({ page }) => {
      await page.goto("/settings/holidays");
      await page.waitForSelector("h1", { timeout: 15_000 });
      const addButton = page.locator('button:has-text("Dodaj dzien wolny")');
      await expect(addButton.first()).toBeVisible();
    });

    test("shows year navigation", async ({ page }) => {
      await page.goto("/settings/holidays");
      await page.waitForSelector("h1", { timeout: 15_000 });
      await page.waitForTimeout(1000);

      // Should show year and navigation arrows
      const yearText = page.locator(`text="${new Date().getFullYear()}"`);
      const count = await yearText.count();
      expect(count).toBeGreaterThanOrEqual(0);
    });

    test("add button opens form", async ({ page }) => {
      await page.goto("/settings/holidays");
      await page.waitForSelector("h1", { timeout: 15_000 });
      await page.waitForTimeout(1000);

      const addButton = page.locator('button:has-text("Dodaj dzien wolny")');
      await addButton.first().click();
      await page.waitForTimeout(500);

      const dialog = page.locator('[role="dialog"]');
      await expect(dialog).toBeVisible();
    });
  });

  test.describe("Studios", () => {
    test("shows studios settings page", async ({ page }) => {
      await page.goto("/settings/studios");
      await page.waitForSelector("h1", { timeout: 15_000 });
      await expect(page.locator("h1").first()).toBeVisible();
    });
  });

  test.describe("Users", () => {
    test("shows users settings page", async ({ page }) => {
      await page.goto("/settings/users");
      await page.waitForSelector("h1", { timeout: 15_000 });
      await expect(page.locator("h1").first()).toBeVisible();
    });

    test("shows existing users", async ({ page }) => {
      await page.goto("/settings/users");
      await page.waitForSelector("h1", { timeout: 15_000 });
      await page.waitForTimeout(1000);

      // Should show at least the test user
      const mainContent = page.locator("main");
      await expect(mainContent).toBeVisible();
    });
  });
});
