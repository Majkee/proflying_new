import { test, expect } from "@playwright/test";
import { PaymentsPage } from "../page-objects/payments.page";
import { PaymentFormPage } from "../page-objects/payment-form.page";
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
    try {
      await deleteTestPass(id);
    } catch {
      // ignore
    }
  }
  for (const id of createdStudentIds) {
    try {
      await deleteTestStudent(id);
    } catch {
      // ignore
    }
  }
});

test.describe("Payments", () => {
  test.describe("Overview page", () => {
    test("shows header 'Platnosci'", async ({ page }) => {
      const paymentsPage = new PaymentsPage(page);
      await paymentsPage.goto();
      await expect(paymentsPage.header).toBeVisible();
    });

    test("shows month navigation arrows", async ({ page }) => {
      const paymentsPage = new PaymentsPage(page);
      await paymentsPage.goto();
      await expect(paymentsPage.prevMonthButton).toBeVisible();
      await expect(paymentsPage.nextMonthButton).toBeVisible();
    });

    test("shows revenue summary cards", async ({ page }) => {
      const paymentsPage = new PaymentsPage(page);
      await paymentsPage.goto();
      await paymentsPage.expectRevenueCards();
    });

    test("month navigation changes displayed month", async ({ page }) => {
      const paymentsPage = new PaymentsPage(page);
      await paymentsPage.goto();

      // Get current month text
      const monthText = await page.locator("h2, h3").filter({ hasText: /\d{4}/ }).first().textContent();

      // Navigate to previous month
      await paymentsPage.navigateMonth("prev");
      await page.waitForTimeout(500);

      // Month text should change
      const newMonthText = await page.locator("h2, h3").filter({ hasText: /\d{4}/ }).first().textContent();
      if (monthText) {
        expect(newMonthText).not.toBe(monthText);
      }
    });

    test("has 'Zapisz platnosc' button", async ({ page }) => {
      const paymentsPage = new PaymentsPage(page);
      await paymentsPage.goto();
      await expect(paymentsPage.recordButton).toBeVisible();
    });

    test("'Zapisz platnosc' navigates to record form", async ({ page }) => {
      const paymentsPage = new PaymentsPage(page);
      await paymentsPage.goto();
      await paymentsPage.clickRecordPayment();
      expect(page.url()).toContain("/payments/record");
    });
  });

  test.describe("Record payment form", () => {
    let testStudentId: string;
    let testPassId: string;
    let testStudentName: string;

    test.beforeAll(async () => {
      testStudentName = `E2E_PayStudent_${Date.now()}`;
      const student = await createTestStudent(testStudentName);
      testStudentId = student.id;
      createdStudentIds.push(testStudentId);

      const pass = await createTestPass(testStudentId);
      testPassId = pass.id;
      createdPassIds.push(testPassId);
    });

    test("form renders student search", async ({ page }) => {
      const formPage = new PaymentFormPage(page);
      await formPage.goto();
      await expect(page.getByPlaceholder("Szukaj")).toBeVisible();
    });

    test("can search and select a student", async ({ page }) => {
      test.setTimeout(30_000);
      const formPage = new PaymentFormPage(page);
      await formPage.goto();

      // Use full name to avoid matching leftover E2E students from previous runs
      await formPage.searchStudent(testStudentName);
      await page.waitForTimeout(1000);
      await formPage.selectStudent(testStudentName);

      // Student should be selected
      await expect(page.locator(`text="${testStudentName}"`).first()).toBeVisible();
    });

    test("selecting student loads their passes", async ({ page }) => {
      test.setTimeout(30_000);
      const formPage = new PaymentFormPage(page);
      await formPage.goto();

      // Use full name to avoid matching leftover E2E students from previous runs
      await formPage.searchStudent(testStudentName);
      await page.waitForTimeout(1000);
      await formPage.selectStudent(testStudentName);
      await page.waitForTimeout(1500);

      // Pass selector should appear
      const passSelect = page.locator('button[role="combobox"]').first();
      await expect(passSelect).toBeVisible();
    });

    test("URL params pre-fill student and pass", async ({ page }) => {
      const formPage = new PaymentFormPage(page);
      await formPage.goto({ studentId: testStudentId, passId: testPassId });
      await page.waitForTimeout(2000);

      // Student should be pre-selected
      await formPage.expectStudentPreselected(testStudentName);
    });

    test("submit button is disabled without required fields", async ({ page }) => {
      const formPage = new PaymentFormPage(page);
      await formPage.goto();

      // No student selected yet, submit should be disabled
      await expect(formPage.submitButton).toBeDisabled();
    });

    test("recording payment shows success toast and confirmation", async ({ page }) => {
      const formPage = new PaymentFormPage(page);
      await formPage.goto({ studentId: testStudentId, passId: testPassId });
      await page.waitForTimeout(3000);

      // Amount should be auto-filled from pass (160 zl)
      const amountValue = await formPage.amountInput.inputValue();
      expect(parseInt(amountValue)).toBeGreaterThan(0);

      await formPage.submit();

      // Wait for success heading to appear
      await expect(
        page.getByRole("heading", { name: "Platnosc zapisana" })
      ).toBeVisible({ timeout: 10_000 });
    });

    test("cancel button navigates back", async ({ page }) => {
      const formPage = new PaymentFormPage(page);
      await formPage.goto();
      await formPage.cancelButton.click();
      await page.waitForTimeout(500);
      expect(page.url()).not.toContain("/payments/record");
    });
  });
});
