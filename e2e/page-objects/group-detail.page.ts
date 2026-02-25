import { type Page, type Locator, expect } from "@playwright/test";

export class GroupDetailPage {
  readonly page: Page;
  readonly editButton: Locator;
  readonly attendanceLink: Locator;
  readonly rosterSection: Locator;

  constructor(page: Page) {
    this.page = page;
    this.editButton = page.locator('button:has-text("Edytuj")');
    this.attendanceLink = page.locator('a:has-text("Sprawdz obecnosc")');
    this.rosterSection = page.locator('text="Kursantki w grupie"');
  }

  async goto(groupId: string) {
    await this.page.goto(`/groups/${groupId}`);
    await this.page.waitForSelector("h1", { timeout: 15_000 });
  }

  async expectGroupCode(code: string) {
    await expect(this.page.locator(`text="${code}"`).first()).toBeVisible();
  }

  async expectGroupName(name: string) {
    await expect(this.page.locator("h1").first()).toContainText(name);
  }

  async clickAttendance() {
    await this.attendanceLink.click();
    await this.page.waitForURL(/\/attendance\/.+/);
  }

  async clickEdit() {
    await this.editButton.click();
  }

  async addMember(studentName: string) {
    await this.page.locator('button:has-text("Dodaj kursantke")').click();
    await this.page.getByPlaceholder("Szukaj").fill(studentName);
    await this.page.waitForTimeout(500);
    await this.page.locator(`button:has-text("${studentName}")`).first().click();
  }

  async removeMember(studentName: string) {
    const row = this.page.locator(`div:has-text("${studentName}")`).first();
    await row.locator('button[title="Usun z grupy"]').click();
  }

  async expectMemberVisible(name: string) {
    await expect(this.page.locator(`text="${name}"`).first()).toBeVisible();
  }

  async expectEmptyRoster() {
    await expect(this.page.locator('text="Brak kursantek"').first()).toBeVisible();
  }
}
