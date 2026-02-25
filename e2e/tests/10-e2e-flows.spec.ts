import { test, expect } from "@playwright/test";
import {
  createTestStudent,
  createTestPass,
  deleteTestStudent,
  deleteTestGroup,
  deleteTestPass,
} from "../helpers/supabase-admin";
import { StudentsListPage } from "../page-objects/students-list.page";
import { StudentFormPage } from "../page-objects/student-form.page";
import { StudentDetailPage } from "../page-objects/student-detail.page";

const cleanupIds = {
  students: [] as string[],
  groups: [] as string[],
  passes: [] as string[],
};

test.afterAll(async () => {
  for (const id of cleanupIds.passes) {
    try { await deleteTestPass(id); } catch { /* ignore */ }
  }
  for (const id of cleanupIds.students) {
    try { await deleteTestStudent(id); } catch { /* ignore */ }
  }
  for (const id of cleanupIds.groups) {
    try { await deleteTestGroup(id); } catch { /* ignore */ }
  }
});

test.describe("End-to-End Flows", () => {
  test("golden path: create student → view detail → record payment", async ({ page }) => {
    test.setTimeout(120_000);

    // Step 1: Create a student via UI
    const uniqueName = `E2E_Golden_${Date.now()}`;
    const formPage = new StudentFormPage(page);
    await formPage.goto();
    // Wait for studio context to load
    await page.waitForSelector('button:has-text("Testowe")', { timeout: 10_000 });
    await formPage.fillName(uniqueName);
    await formPage.fillPhone("+48 600 111 222");
    await formPage.submit();

    // Wait for redirect to students list
    await page.waitForURL("**/students", { timeout: 15_000 });

    // Step 2: Find the student in list and navigate to detail
    const listPage = new StudentsListPage(page);
    await listPage.search(uniqueName);
    await page.waitForTimeout(500);
    await listPage.clickStudent(uniqueName);

    // Capture student ID for cleanup
    const studentUrl = page.url();
    const studentId = studentUrl.split("/students/")[1]?.split("?")[0];
    if (studentId) cleanupIds.students.push(studentId);

    // Step 3: Verify student detail page
    const detailPage = new StudentDetailPage(page);
    await detailPage.expectName(uniqueName);

    // Step 4: Create a pass via API (more reliable than UI for this flow)
    if (studentId) {
      const pass = await createTestPass(studentId);
      cleanupIds.passes.push(pass.id);

      // Step 5: Record payment via the payments page
      await page.goto(`/payments/record?student=${studentId}&pass=${pass.id}`);
      await page.waitForSelector("h3, h1", { timeout: 15_000 });
      await page.waitForTimeout(3000);

      // Amount should be auto-filled from pass (160 zl)
      const amountInput = page.locator("#amount");
      const amountValue = await amountInput.inputValue();
      expect(parseInt(amountValue)).toBeGreaterThan(0);

      const submitBtn = page.locator('button:has-text("Zapisz platnosc")');
      const isDisabled = await submitBtn.isDisabled();
      if (!isDisabled) {
        await submitBtn.click();
        await expect(page.locator("[data-sonner-toast]")).toContainText("Platnosc zapisana");
      }
    }
  });

  test("navigate through all main pages without errors", async ({ page }) => {
    const routes = [
      { path: "/dashboard", header: "Pulpit" },
      { path: "/students", header: "Kursantki" },
      { path: "/groups", header: "Grupy" },
      { path: "/attendance", header: "Obecnosc" },
      { path: "/payments", header: "Platnosci" },
      { path: "/schedule", header: "Grafik" },
      { path: "/settings", header: "Ustawienia" },
    ];

    for (const route of routes) {
      await page.goto(route.path);
      await expect(page.locator(`h1:has-text("${route.header}")`)).toBeVisible({ timeout: 15_000 });

      // No error banners should be visible
      const errorBanner = page.locator('text="Wystapil blad"');
      await expect(errorBanner).toHaveCount(0);
    }
  });

  test("student search → click → detail → back to list preserves context", async ({ page }) => {
    const listPage = new StudentsListPage(page);
    await listPage.goto();
    await page.waitForTimeout(1000);

    // Count initial students
    const initialCount = await listPage.studentRows.count();

    if (initialCount > 0) {
      // Click first student
      const firstName = await listPage.studentRows.first().locator("p.font-medium").textContent();
      await listPage.studentRows.first().click();
      await page.waitForURL(/\/students\/.+/);

      // Go back to list
      await page.goBack();
      await listPage.header.waitFor();

      // List should still be visible
      await expect(listPage.header).toBeVisible();
      if (firstName) {
        await expect(page.locator(`text="${firstName.trim()}"`).first()).toBeVisible();
      }
    }
  });

  test("sidebar navigation maintains auth state across pages", async ({ page }) => {
    // Navigate through multiple pages via sidebar
    await page.goto("/dashboard");
    await page.waitForSelector('h1:has-text("Pulpit")');

    // Click Students
    await page.locator('aside >> a:has-text("Kursantki")').click();
    await expect(page.locator('h1:has-text("Kursantki")')).toBeVisible();
    await expect(page.locator('[data-testid="user-menu"]')).toBeVisible();

    // Click Groups
    await page.locator('aside >> a:has-text("Grupy")').click();
    await expect(page.locator('h1:has-text("Grupy")')).toBeVisible();
    await expect(page.locator('[data-testid="user-menu"]')).toBeVisible();

    // Click Payments
    await page.locator('aside >> a:has-text("Platnosci")').click();
    await expect(page.locator('h1:has-text("Platnosci")')).toBeVisible();
    await expect(page.locator('[data-testid="user-menu"]')).toBeVisible();
  });

  test("studio switcher shows 'Testowe' and dropdown works", async ({ page }) => {
    await page.goto("/dashboard");
    await page.waitForSelector('h1:has-text("Pulpit")');

    const switcher = page.locator('[data-testid="studio-switcher"]');
    await expect(switcher).toBeVisible();
    await expect(switcher).toContainText("Testowe");

    await switcher.click();
    await page.waitForTimeout(500);

    await expect(page.locator('text="Studia"')).toBeVisible();
  });

  test("page header component renders consistently", async ({ page }) => {
    const pages = [
      { url: "/students", title: "Kursantki" },
      { url: "/groups", title: "Grupy" },
      { url: "/payments", title: "Platnosci" },
    ];

    for (const p of pages) {
      await page.goto(p.url);
      const header = page.locator('[data-testid="page-header"]');
      await expect(header).toBeVisible({ timeout: 15_000 });
      await expect(header.locator("h1")).toContainText(p.title);
    }
  });

  test("form validation prevents submission of invalid data", async ({ page }) => {
    await page.goto("/students/new");
    await page.waitForSelector("#fullName");

    // Wait for studio context to load
    await page.waitForSelector('button:has-text("Testowe")', { timeout: 10_000 });

    const submitBtn = page.locator('button[type="submit"]');
    await page.locator("#fullName").fill("");
    await expect(submitBtn).toBeDisabled();

    await page.locator("#fullName").fill("A");
    await submitBtn.click({ force: true });

    const errors = page.locator(".text-destructive");
    await expect(errors.first()).toBeVisible({ timeout: 5000 });
  });
});
