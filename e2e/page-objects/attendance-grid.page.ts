import { type Page, type Locator, expect } from "@playwright/test";
import { TESTID } from "../helpers/selectors";

export class AttendanceGridPage {
  readonly page: Page;
  readonly summaryBar: Locator;
  readonly prevWeekButton: Locator;
  readonly nextWeekButton: Locator;
  readonly guestButton: Locator;

  constructor(page: Page) {
    this.page = page;
    this.summaryBar = page.locator(`[data-testid="${TESTID.attendanceSummary}"]`);
    this.prevWeekButton = page.locator('button:has(svg.lucide-chevron-left)').first();
    this.nextWeekButton = page.locator('button:has(svg.lucide-chevron-right)').first();
    this.guestButton = page.locator('button:has-text("Gosc")');
  }

  async goto(groupId: string) {
    await this.page.goto(`/attendance/${groupId}`);
    await this.page.waitForSelector(`[data-testid="${TESTID.attendanceSummary}"]`, { timeout: 15_000 });
  }

  async markPresent(studentName: string) {
    const row = this.page.locator(`[data-testid="${TESTID.attendanceStudentRow}"]`).filter({ hasText: studentName });
    // Click the green check button (first action button with Check icon)
    await row.locator('button:has(svg.lucide-check)').click();
  }

  async markAbsent(studentName: string) {
    const row = this.page.locator(`[data-testid="${TESTID.attendanceStudentRow}"]`).filter({ hasText: studentName });
    // Click the red X button
    await row.locator('button:has(svg.lucide-x)').click();
  }

  async openNoteDialog(studentName: string) {
    const row = this.page.locator(`[data-testid="${TESTID.attendanceStudentRow}"]`).filter({ hasText: studentName });
    await row.locator('button:has(svg.lucide-message-square)').click();
  }

  async selectQuickNote(note: string) {
    await this.page.locator(`button:has-text("${note}")`).click();
  }

  async openGuestDialog() {
    await this.guestButton.click();
  }

  async addGuest(name: string) {
    await this.page.getByPlaceholder("Imie i nazwisko").fill(name);
    await this.page.locator('button:has-text("Dodaj")').last().click();
  }

  async expectSummary(presentCount: number, totalCount: number) {
    await expect(this.summaryBar).toContainText(`Obecne: ${presentCount}/${totalCount}`);
  }

  async expectStudentPresent(name: string) {
    const row = this.page.locator(`[data-testid="${TESTID.attendanceStudentRow}"]`).filter({ hasText: name });
    await expect(row.locator('button:has(svg.lucide-check).bg-green-500')).toBeVisible();
  }

  async expectStudentAbsent(name: string) {
    const row = this.page.locator(`[data-testid="${TESTID.attendanceStudentRow}"]`).filter({ hasText: name });
    await expect(row.locator('button:has(svg.lucide-x).bg-red-500')).toBeVisible();
  }

  async navigatePrevWeek() {
    await this.prevWeekButton.click();
  }

  async navigateNextWeek() {
    await this.nextWeekButton.click();
  }
}
