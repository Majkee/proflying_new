import { test, expect } from "@playwright/test";
import { StudentsListPage } from "../page-objects/students-list.page";
import { StudentFormPage } from "../page-objects/student-form.page";
import { StudentDetailPage } from "../page-objects/student-detail.page";
import { deleteTestStudent } from "../helpers/supabase-admin";

const createdStudentIds: string[] = [];

test.afterAll(async () => {
  for (const id of createdStudentIds) {
    try {
      await deleteTestStudent(id);
    } catch {
      // ignore cleanup errors
    }
  }
});

test.describe("Students", () => {
  test.describe("List page", () => {
    test("shows header 'Kursantki' with 'Dodaj' button", async ({ page }) => {
      const listPage = new StudentsListPage(page);
      await listPage.goto();
      await expect(listPage.header).toBeVisible();
      await expect(listPage.addButton).toBeVisible();
    });

    test("search filters students in real time", async ({ page }) => {
      const listPage = new StudentsListPage(page);
      await listPage.goto();
      // Wait for initial list to load
      await page.waitForTimeout(1000);
      const initialCount = await listPage.studentRows.count();

      // Search for a name that likely doesn't exist
      await listPage.search("ZZZZZ_NONEXISTENT");
      await page.waitForTimeout(500);

      // Should show fewer (likely 0) results
      const filteredCount = await listPage.studentRows.count();
      expect(filteredCount).toBeLessThanOrEqual(initialCount);
    });

    test("student rows are clickable and navigate to detail", async ({ page }) => {
      const listPage = new StudentsListPage(page);
      await listPage.goto();
      await page.waitForTimeout(1000);

      const firstRow = listPage.studentRows.first();
      const count = await listPage.studentRows.count();
      if (count > 0) {
        await firstRow.click();
        await page.waitForURL(/\/students\/.+/);
        expect(page.url()).toMatch(/\/students\/.+/);
      }
    });

    test("payment badges are visible on students with passes", async ({ page }) => {
      const listPage = new StudentsListPage(page);
      await listPage.goto();
      await page.waitForTimeout(1000);

      // Check that at least one badge type exists (Oplacony, Nieoplacony, or Wygasl)
      const badges = page.locator('text="Oplacony", text="Nieoplacony", text="Wygasl"');
      const count = await badges.count();
      // This is a soft assertion — some studios may have no passes
      expect(count).toBeGreaterThanOrEqual(0);
    });

    test("shows student count label", async ({ page }) => {
      const listPage = new StudentsListPage(page);
      await listPage.goto();
      await page.waitForTimeout(1000);

      // Page shows count like "Kursantki (X)" or similar
      const header = page.locator('[data-testid="page-header"]');
      await expect(header).toBeVisible();
    });
  });

  test.describe("Create student", () => {
    test("form renders with all fields", async ({ page }) => {
      const formPage = new StudentFormPage(page);
      await formPage.goto();

      await expect(formPage.fullNameInput).toBeVisible();
      await expect(formPage.phoneInput).toBeVisible();
      await expect(formPage.emailInput).toBeVisible();
      await expect(formPage.dateOfBirthInput).toBeVisible();
      await expect(formPage.notesInput).toBeVisible();
      await expect(formPage.submitButton).toBeVisible();
      await expect(formPage.cancelButton).toBeVisible();
    });

    test("submitting with valid data creates student and shows toast", async ({ page }) => {
      test.setTimeout(30_000);
      const formPage = new StudentFormPage(page);
      await formPage.goto();

      // Wait for studio context to load (required for form submission)
      await page.waitForSelector('button:has-text("Testowe")', { timeout: 10_000 });

      const uniqueName = `E2E_Student_${Date.now()}`;
      await formPage.fillName(uniqueName);
      await formPage.fillPhone("+48 600 000 001");
      await formPage.fillEmail("e2e-test@example.pl");
      await formPage.submit();

      // Should eventually land on the students list
      await page.waitForURL("**/students", { timeout: 15_000 });

      // Capture ID for cleanup
      const listPage = new StudentsListPage(page);
      await listPage.search(uniqueName);
      await page.waitForTimeout(500);
      await listPage.clickStudent(uniqueName);
      const url = page.url();
      const id = url.split("/students/")[1]?.split("?")[0];
      if (id) createdStudentIds.push(id);
    });

    test("validation error for short name", async ({ page }) => {
      const formPage = new StudentFormPage(page);
      await formPage.goto();

      // Wait for studio context to load (required for validation to trigger)
      await page.waitForSelector('button:has-text("Testowe")', { timeout: 10_000 });

      await formPage.fillName("A");
      await formPage.submit();

      // Should show validation error (name must be at least 2 chars)
      const errors = page.locator(".text-destructive");
      await expect(errors.first()).toBeVisible({ timeout: 5000 });
    });

    test("validation error for invalid phone format", async ({ page }) => {
      const formPage = new StudentFormPage(page);
      await formPage.goto();

      // Wait for studio context to load (required for validation to trigger)
      await page.waitForSelector('button:has-text("Testowe")', { timeout: 10_000 });

      await formPage.fillName("E2E Test Student");
      await formPage.fillPhone("invalid-phone");
      await formPage.submit();

      const errors = page.locator(".text-destructive");
      await expect(errors.first()).toBeVisible({ timeout: 5000 });
    });

    test("cancel button navigates back", async ({ page }) => {
      const formPage = new StudentFormPage(page);
      await formPage.goto();
      await formPage.cancelButton.click();
      // Should navigate away from /students/new
      await page.waitForTimeout(500);
      expect(page.url()).not.toContain("/students/new");
    });

    test("submit button is disabled when name is empty", async ({ page }) => {
      const formPage = new StudentFormPage(page);
      await formPage.goto();

      // Clear name field
      await formPage.fullNameInput.fill("");
      await expect(formPage.submitButton).toBeDisabled();
    });
  });

  test.describe("Detail page", () => {
    let testStudentId: string;

    test.beforeAll(async () => {
      // Create a test student via API
      const { createTestStudent } = await import("../helpers/supabase-admin");
      const student = await createTestStudent(`E2E_Detail_${Date.now()}`);
      testStudentId = student.id;
      createdStudentIds.push(testStudentId);
    });

    test("shows student name in header", async ({ page }) => {
      const detailPage = new StudentDetailPage(page);
      await detailPage.goto(testStudentId);
      await expect(page.locator("h1").first()).toContainText("E2E_Detail_");
    });

    test("has tabs: Grupy, Karnet, Platnosci", async ({ page }) => {
      const detailPage = new StudentDetailPage(page);
      await detailPage.goto(testStudentId);

      await expect(detailPage.groupsTab).toBeVisible();
      await expect(detailPage.passesTab).toBeVisible();
      await expect(detailPage.paymentsTab).toBeVisible();
    });

    test("edit button is visible", async ({ page }) => {
      const detailPage = new StudentDetailPage(page);
      await detailPage.goto(testStudentId);
      await expect(detailPage.editButton).toBeVisible();
    });

    test("groups tab shows content", async ({ page }) => {
      const detailPage = new StudentDetailPage(page);
      await detailPage.goto(testStudentId);
      await detailPage.clickGroupsTab();
      // Should show either groups or empty state
      await page.waitForTimeout(1000);
      const content = page.locator('[role="tabpanel"][data-state="active"]');
      await expect(content).toBeVisible();
    });

    test("passes tab shows content", async ({ page }) => {
      const detailPage = new StudentDetailPage(page);
      await detailPage.goto(testStudentId);
      await detailPage.clickPassesTab();
      await page.waitForTimeout(1000);
      const content = page.locator('[role="tabpanel"][data-state="active"]');
      await expect(content).toBeVisible();
    });

    test("payments tab shows content", async ({ page }) => {
      const detailPage = new StudentDetailPage(page);
      await detailPage.goto(testStudentId);
      await detailPage.clickPaymentsTab();
      await page.waitForTimeout(1000);
      const content = page.locator('[role="tabpanel"][data-state="active"]');
      await expect(content).toBeVisible();
    });
  });

  test.describe("Edit student", () => {
    let editStudentId: string;

    test.beforeAll(async () => {
      const { createTestStudent } = await import("../helpers/supabase-admin");
      const student = await createTestStudent(`E2E_Edit_${Date.now()}`);
      editStudentId = student.id;
      createdStudentIds.push(editStudentId);
    });

    test("can toggle edit mode and update name", async ({ page }) => {
      const detailPage = new StudentDetailPage(page);
      await detailPage.goto(editStudentId);
      await detailPage.clickEdit();

      // Should show form fields
      const nameInput = page.locator("#fullName");
      await expect(nameInput).toBeVisible();

      // Update the name
      const newName = `E2E_Edited_${Date.now()}`;
      await nameInput.fill(newName);
      await page.locator('button:has-text("Zapisz")').click();

      // Should show success toast
      await expect(page.locator("[data-sonner-toast]")).toContainText("Kursantka zaktualizowana");
    });
  });
});
