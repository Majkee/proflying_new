import { type Page, type Locator, expect } from "@playwright/test";
import { HEADERS, TESTID } from "../helpers/selectors";

export class StudentsListPage {
  readonly page: Page;
  readonly header: Locator;
  readonly addButton: Locator;
  readonly searchInput: Locator;
  readonly studentRows: Locator;

  constructor(page: Page) {
    this.page = page;
    this.header = page.locator(HEADERS.students);
    this.addButton = page.locator('a:has-text("Dodaj")');
    this.searchInput = page.getByPlaceholder("Szukaj");
    this.studentRows = page.locator(`[data-testid="${TESTID.studentRow}"]`);
  }

  async goto() {
    await this.page.goto("/students");
    await this.header.waitFor({ timeout: 15_000 });
  }

  async search(query: string) {
    await this.searchInput.fill(query);
    // Wait for debounce
    await this.page.waitForTimeout(500);
  }

  async clickAddStudent() {
    await this.addButton.click();
    await this.page.waitForURL("**/students/new");
  }

  async clickStudent(name: string) {
    await this.page.locator(`a:has-text("${name}")`).click();
    await this.page.waitForURL(/\/students\/.+/);
  }

  async expectStudentVisible(name: string) {
    await expect(this.page.locator(`text="${name}"`).first()).toBeVisible();
  }

  async expectStudentNotVisible(name: string) {
    await expect(this.page.locator(`text="${name}"`)).toHaveCount(0);
  }

  async expectStudentCount(text: string) {
    await expect(this.page.locator(`text="${text}"`)).toBeVisible();
  }

  async expectPaymentBadge(studentName: string, badge: "Oplacony" | "Nieoplacony" | "Wygasl") {
    const row = this.page.locator(`a:has-text("${studentName}")`);
    await expect(row.locator(`text="${badge}"`)).toBeVisible();
  }
}
