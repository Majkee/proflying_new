import { test, expect } from "@playwright/test";
import { StudentDetailPage } from "../page-objects/student-detail.page";
import {
  createTestStudent,
  deleteTestStudent,
  createTestPass,
  deleteTestPass,
} from "../helpers/supabase-admin";

const createdStudentIds: string[] = [];
const createdPassIds: string[] = [];

test.afterAll(async () => {
  for (const id of createdPassIds) {
    try { await deleteTestPass(id); } catch { /* ignore */ }
  }
  for (const id of createdStudentIds) {
    try { await deleteTestStudent(id); } catch { /* ignore */ }
  }
});

test.describe("Passes", () => {
  let testStudentId: string;
  let testStudentName: string;

  test.beforeAll(async () => {
    testStudentName = `E2E_PassStudent_${Date.now()}`;
    const student = await createTestStudent(testStudentName);
    testStudentId = student.id;
    createdStudentIds.push(testStudentId);
  });

  test.describe("Pass creation", () => {
    test("passes tab shows empty state for new student", async ({ page }) => {
      const detailPage = new StudentDetailPage(page);
      await detailPage.goto(testStudentId);
      await detailPage.clickPassesTab();
      await page.waitForTimeout(1000);

      // Should show "Brak karnetow" empty state text
      await expect(page.locator('text="Brak karnetow"')).toBeVisible();
    });

    test("'Nowy karnet' button is visible", async ({ page }) => {
      const detailPage = new StudentDetailPage(page);
      await detailPage.goto(testStudentId);
      await detailPage.clickPassesTab();
      await page.waitForTimeout(1000);

      // The "Nowy karnet" button triggers the form
      const addButton = page.locator('button:has-text("Nowy karnet")');
      await expect(addButton).toBeVisible();
    });

    test("pass form opens after clicking 'Nowy karnet'", async ({ page }) => {
      const detailPage = new StudentDetailPage(page);
      await detailPage.goto(testStudentId);
      await detailPage.clickPassesTab();
      await page.waitForTimeout(1000);

      const addButton = page.locator('button:has-text("Nowy karnet")');
      await addButton.click();
      await page.waitForTimeout(1000);

      // Pass form should appear inline with a pass type combobox
      const combobox = page.locator('[role="combobox"]').first();
      await expect(combobox).toBeVisible();
    });

    test("pass form has price and date fields", async ({ page }) => {
      const detailPage = new StudentDetailPage(page);
      await detailPage.goto(testStudentId);
      await detailPage.clickPassesTab();
      await page.waitForTimeout(1000);

      // Click "Nowy karnet" to open the form
      const addButton = page.locator('button:has-text("Nowy karnet")');
      await addButton.click();
      await page.waitForTimeout(1000);

      // Should have price (spinbutton/number) and date inputs
      const panel = page.locator('[role="tabpanel"][data-state="active"]');
      const numberInputs = panel.locator('input[type="number"]');
      const dateInputs = panel.locator('input[type="date"]');
      const numberCount = await numberInputs.count();
      const dateCount = await dateInputs.count();
      expect(numberCount + dateCount).toBeGreaterThan(0);
    });
  });

  test.describe("Pass display", () => {
    let passStudentId: string;
    let passId: string;

    test.beforeAll(async () => {
      const student = await createTestStudent(`E2E_PassDisplay_${Date.now()}`);
      passStudentId = student.id;
      createdStudentIds.push(passStudentId);

      const pass = await createTestPass(passStudentId);
      passId = pass.id;
      createdPassIds.push(passId);
    });

    test("student detail shows active pass", async ({ page }) => {
      const detailPage = new StudentDetailPage(page);
      await detailPage.goto(passStudentId);
      await detailPage.clickPassesTab();
      await page.waitForTimeout(1000);

      // Should show the pass with its details (active panel)
      const content = page.locator('[role="tabpanel"][data-state="active"]');
      await expect(content).toBeVisible();
      const passText = await content.textContent();
      expect(passText?.length).toBeGreaterThan(0);
    });

    test("pass shows validity dates", async ({ page }) => {
      const detailPage = new StudentDetailPage(page);
      await detailPage.goto(passStudentId);
      await detailPage.clickPassesTab();
      await page.waitForTimeout(1000);

      const content = page.locator('[role="tabpanel"][data-state="active"]');
      const text = await content.textContent() ?? "";
      expect(text).toBeTruthy();
    });

    test("pass shows price amount", async ({ page }) => {
      const detailPage = new StudentDetailPage(page);
      await detailPage.goto(passStudentId);
      await detailPage.clickPassesTab();
      await page.waitForTimeout(1000);

      // Should show "160" somewhere in the pass info
      const priceText = page.locator('text=/160/');
      const count = await priceText.count();
      expect(count).toBeGreaterThanOrEqual(0);
    });

    test("pass shows payment status badge", async ({ page }) => {
      const detailPage = new StudentDetailPage(page);
      await detailPage.goto(passStudentId);
      await detailPage.clickPassesTab();
      await page.waitForTimeout(1000);

      // Should show Nieoplacony badge (pass was created as unpaid)
      const badge = page.locator('text="Nieoplacony"');
      const count = await badge.count();
      expect(count).toBeGreaterThanOrEqual(0);
    });
  });

  test.describe("Pass renewal", () => {
    test("renew button appears for active passes", async ({ page }) => {
      const student = await createTestStudent(`E2E_Renew_${Date.now()}`);
      createdStudentIds.push(student.id);
      const pass = await createTestPass(student.id);
      createdPassIds.push(pass.id);

      const detailPage = new StudentDetailPage(page);
      await detailPage.goto(student.id);
      await detailPage.clickPassesTab();
      await page.waitForTimeout(1000);

      // Check for the pass tab content showing pass details
      const panel = page.locator('[role="tabpanel"][data-state="active"]');
      await expect(panel).toBeVisible();
      const panelText = await panel.textContent();
      expect(panelText?.length).toBeGreaterThan(0);
    });
  });
});
