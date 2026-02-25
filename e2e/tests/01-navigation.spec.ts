import { test, expect } from "@playwright/test";
import { NAV, HEADERS } from "../helpers/selectors";

test.describe("Navigation & Layout", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/dashboard");
    await page.waitForSelector(HEADERS.dashboard, { timeout: 15_000 });
  });

  test.describe("Sidebar", () => {
    test("shows all 7 nav items for super_admin", async ({ page }) => {
      await expect(page.locator(NAV.pulpit)).toBeVisible();
      await expect(page.locator(NAV.obecnosc)).toBeVisible();
      await expect(page.locator(NAV.grafik)).toBeVisible();
      await expect(page.locator(NAV.kursantki)).toBeVisible();
      await expect(page.locator(NAV.grupy)).toBeVisible();
      await expect(page.locator(NAV.platnosci)).toBeVisible();
      await expect(page.locator(NAV.ustawienia)).toBeVisible();
    });

    test("highlights active route with text-primary", async ({ page }) => {
      const pulpitLink = page.locator(NAV.pulpit);
      await expect(pulpitLink).toHaveClass(/text-primary/);
    });

    test("Pulpit navigates to /dashboard", async ({ page }) => {
      await page.locator(NAV.pulpit).click();
      await expect(page).toHaveURL(/\/dashboard/);
    });

    test("Kursantki navigates to /students", async ({ page }) => {
      await page.locator(NAV.kursantki).click();
      await expect(page).toHaveURL(/\/students/);
      await expect(page.locator(HEADERS.students)).toBeVisible();
    });

    test("Grupy navigates to /groups", async ({ page }) => {
      await page.locator(NAV.grupy).click();
      await expect(page).toHaveURL(/\/groups/);
      await expect(page.locator(HEADERS.groups)).toBeVisible();
    });

    test("Obecnosc navigates to /attendance", async ({ page }) => {
      await page.locator(NAV.obecnosc).click();
      await expect(page).toHaveURL(/\/attendance/);
      await expect(page.locator(HEADERS.attendance)).toBeVisible();
    });

    test("Grafik navigates to /schedule", async ({ page }) => {
      await page.locator(NAV.grafik).click();
      await expect(page).toHaveURL(/\/schedule/);
      await expect(page.locator(HEADERS.schedule)).toBeVisible();
    });

    test("Platnosci navigates to /payments", async ({ page }) => {
      await page.locator(NAV.platnosci).click();
      await expect(page).toHaveURL(/\/payments/);
      await expect(page.locator(HEADERS.payments)).toBeVisible();
    });

    test("Ustawienia navigates to /settings", async ({ page }) => {
      await page.locator(NAV.ustawienia).click();
      await expect(page).toHaveURL(/\/settings/);
      await expect(page.locator(HEADERS.settings)).toBeVisible();
    });
  });

  test.describe("Logo", () => {
    test("logo links to /dashboard", async ({ page }) => {
      await page.goto("/students");
      await page.waitForSelector(HEADERS.students);
      await page.locator(NAV.logo).click();
      await expect(page).toHaveURL(/\/dashboard/);
    });
  });

  test.describe("Studio switcher", () => {
    test("shows 'Testowe' studio name", async ({ page }) => {
      await expect(page.locator('text="Testowe"').first()).toBeVisible();
    });
  });

  test.describe("User menu", () => {
    test("shows user avatar/initials", async ({ page }) => {
      const userMenu = page.locator('[data-testid="user-menu"]');
      await expect(userMenu).toBeVisible();
    });

    test("shows name and role on click", async ({ page }) => {
      await page.locator('[data-testid="user-menu"]').click();
      await expect(page.locator('text="Administrator"').first()).toBeVisible();
    });

    test("logout button is visible", async ({ page }) => {
      await page.locator('[data-testid="user-menu"]').click();
      await expect(page.locator('text="Wyloguj sie"')).toBeVisible();
    });
  });
});
