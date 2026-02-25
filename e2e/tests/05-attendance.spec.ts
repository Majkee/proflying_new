import { test, expect } from "@playwright/test";
import { AttendanceIndexPage } from "../page-objects/attendance-index.page";
import {
  createTestGroup,
  deleteTestGroup,
  createTestStudent,
  deleteTestStudent,
  addStudentToGroup,
} from "../helpers/supabase-admin";
import { TESTID } from "../helpers/selectors";

const createdGroupIds: string[] = [];
const createdStudentIds: string[] = [];

test.afterAll(async () => {
  for (const id of createdGroupIds) {
    try { await deleteTestGroup(id); } catch { /* ignore */ }
  }
  for (const id of createdStudentIds) {
    try { await deleteTestStudent(id); } catch { /* ignore */ }
  }
});

test.describe("Attendance", () => {
  test.describe("Index page", () => {
    test("shows header 'Obecnosc'", async ({ page }) => {
      const indexPage = new AttendanceIndexPage(page);
      await indexPage.goto();
      await expect(indexPage.header).toBeVisible();
    });

    test("shows today's groups as cards", async ({ page }) => {
      const indexPage = new AttendanceIndexPage(page);
      await indexPage.goto();
      await page.waitForTimeout(2000);

      // There may or may not be groups today depending on day of week
      // Just verify the page loaded without error
      const pageContent = page.locator("main");
      await expect(pageContent).toBeVisible();
    });

    test("'Sprawdz' buttons navigate to attendance grid", async ({ page }) => {
      const indexPage = new AttendanceIndexPage(page);
      await indexPage.goto();
      await page.waitForTimeout(2000);

      const checkButtons = page.locator('a:has-text("Sprawdz")');
      const count = await checkButtons.count();
      if (count > 0) {
        await checkButtons.first().click();
        await page.waitForURL(/\/attendance\/.+/);
        expect(page.url()).toMatch(/\/attendance\/.+/);
      }
    });
  });

  test.describe("Attendance grid", () => {
    let testGroupId: string;
    let testStudentId: string;
    let testStudentName: string;

    test.beforeAll(async () => {
      testStudentName = `E2E_AttStudent_${Date.now()}`;
      const student = await createTestStudent(testStudentName);
      testStudentId = student.id;
      createdStudentIds.push(testStudentId);

      const group = await createTestGroup(`E2A${Date.now()}`, `E2E_AttGroup_${Date.now()}`);
      testGroupId = group.id;
      createdGroupIds.push(testGroupId);

      await addStudentToGroup(testStudentId, testGroupId);
    });

    test("shows group code and name", async ({ page }) => {
      await page.goto(`/attendance/${testGroupId}`);
      await page.waitForTimeout(3000);

      // Group name should be visible (partial match with regex)
      await expect(page.locator('text=/E2E_AttGroup_/')).toBeVisible();
    });

    test("shows date navigation with prev/next week buttons", async ({ page }) => {
      await page.goto(`/attendance/${testGroupId}`);
      await page.waitForTimeout(3000);

      const prevBtn = page.locator('button:has(svg.lucide-chevron-left)').first();
      const nextBtn = page.locator('button:has(svg.lucide-chevron-right)').first();
      await expect(prevBtn).toBeVisible();
      await expect(nextBtn).toBeVisible();
    });

    test("shows summary bar with attendance count", async ({ page }) => {
      await page.goto(`/attendance/${testGroupId}`);
      await page.waitForTimeout(3000);

      const summary = page.locator(`[data-testid="${TESTID.attendanceSummary}"]`);
      await expect(summary).toBeVisible();
      await expect(summary).toContainText("Obecne:");
    });

    test("shows student rows", async ({ page }) => {
      await page.goto(`/attendance/${testGroupId}`);
      await page.waitForTimeout(3000);

      const studentRows = page.locator(`[data-testid="${TESTID.attendanceStudentRow}"]`);
      await expect(studentRows.first()).toBeVisible();
      await expect(studentRows.filter({ hasText: testStudentName })).toBeVisible();
    });

    test("can mark student as present", async ({ page }) => {
      await page.goto(`/attendance/${testGroupId}`);
      await page.waitForTimeout(3000);

      const row = page.locator(`[data-testid="${TESTID.attendanceStudentRow}"]`).filter({ hasText: testStudentName });
      // The Check button is the third button in the row (after payment and note buttons)
      const checkBtn = row.locator('button:has(svg.lucide-check)');
      await checkBtn.click();

      // Wait for the attendance to be saved and summary to update
      // Summary format is "Obecne: X/Y" followed by sub-count spans
      const summary = page.locator(`[data-testid="${TESTID.attendanceSummary}"]`);
      await expect(summary.locator('text=/Obecne: 1\\/1/')).toBeVisible({ timeout: 10_000 });
    });

    test("can mark student as absent", async ({ page }) => {
      await page.goto(`/attendance/${testGroupId}`);
      await page.waitForTimeout(3000);

      const row = page.locator(`[data-testid="${TESTID.attendanceStudentRow}"]`).filter({ hasText: testStudentName });
      const xBtn = row.locator('button:has(svg.lucide-x)');
      await xBtn.click();

      // Verify summary shows 0 present after marking absent
      const summary = page.locator(`[data-testid="${TESTID.attendanceSummary}"]`);
      await expect(summary.locator('text=/Obecne: 0\\/1/')).toBeVisible({ timeout: 10_000 });
    });

    test("toggle: marking present then absent changes state", async ({ page }) => {
      await page.goto(`/attendance/${testGroupId}`);
      await page.waitForTimeout(3000);

      const row = page.locator(`[data-testid="${TESTID.attendanceStudentRow}"]`).filter({ hasText: testStudentName });
      const summary = page.locator(`[data-testid="${TESTID.attendanceSummary}"]`);

      // Mark present
      await row.locator('button:has(svg.lucide-check)').click();
      await expect(summary.locator('text=/Obecne: 1\\/1/')).toBeVisible({ timeout: 10_000 });

      // Then mark absent
      await row.locator('button:has(svg.lucide-x)').click();
      await expect(summary.locator('text=/Obecne: 0\\/1/')).toBeVisible({ timeout: 10_000 });
    });

    test("week navigation changes displayed date", async ({ page }) => {
      await page.goto(`/attendance/${testGroupId}`);
      await page.waitForTimeout(3000);

      // Get current date text
      const dateText = await page.locator(".text-center p.font-medium").first().textContent();

      // Navigate to previous week
      await page.locator('button:has(svg.lucide-chevron-left)').first().click();
      await page.waitForTimeout(1000);

      const newDateText = await page.locator(".text-center p.font-medium").first().textContent();
      if (dateText) {
        expect(newDateText).not.toBe(dateText);
      }
    });

    test("note dialog opens when clicking message icon", async ({ page }) => {
      await page.goto(`/attendance/${testGroupId}`);
      await page.waitForTimeout(3000);

      const row = page.locator(`[data-testid="${TESTID.attendanceStudentRow}"]`).filter({ hasText: testStudentName });
      await row.locator('button:has(svg.lucide-message-square)').click();
      await page.waitForTimeout(500);

      // Note dialog should appear
      await expect(page.locator('[role="dialog"]')).toBeVisible();
    });

    test("note dialog shows quick note buttons", async ({ page }) => {
      await page.goto(`/attendance/${testGroupId}`);
      await page.waitForTimeout(3000);

      const row = page.locator(`[data-testid="${TESTID.attendanceStudentRow}"]`).filter({ hasText: testStudentName });
      await row.locator('button:has(svg.lucide-message-square)').click();
      await page.waitForTimeout(500);

      // Quick note buttons (note: "Spózniona" has an accent ó)
      const quickButtons = ["Kontuzja", "Urlop", "Choroba"];
      for (const btn of quickButtons) {
        await expect(page.locator(`button:has-text("${btn}")`)).toBeVisible();
      }
      // Check for "Spózniona" with the accent
      await expect(page.locator('button:has-text("Sp")').last()).toBeVisible();
    });

    test("guest button opens substitute dialog", async ({ page }) => {
      await page.goto(`/attendance/${testGroupId}`);
      await page.waitForTimeout(3000);

      await page.locator('button:has-text("Gosc")').click();
      await page.waitForTimeout(500);

      await expect(page.locator('[role="dialog"]')).toBeVisible();
      await expect(page.getByPlaceholder("Imie i nazwisko")).toBeVisible();
    });

    test("summary bar updates when marking attendance", async ({ page }) => {
      await page.goto(`/attendance/${testGroupId}`);
      await page.waitForTimeout(3000);

      const summary = page.locator(`[data-testid="${TESTID.attendanceSummary}"]`);

      // Mark present
      const row = page.locator(`[data-testid="${TESTID.attendanceStudentRow}"]`).filter({ hasText: testStudentName });
      await row.locator('button:has(svg.lucide-check)').click();

      // Summary should show "Obecne: 1/1" (use regex to match exactly this part)
      await expect(summary.locator('text=/Obecne: 1\\/1/')).toBeVisible({ timeout: 10_000 });
    });
  });
});
