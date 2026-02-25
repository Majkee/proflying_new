import { type Page, type Locator, expect } from "@playwright/test";
import { GROUP_FORM, TOAST } from "../helpers/selectors";

export class GroupFormPage {
  readonly page: Page;
  readonly codeInput: Locator;
  readonly nameInput: Locator;
  readonly startTimeInput: Locator;
  readonly endTimeInput: Locator;
  readonly capacityInput: Locator;
  readonly submitButton: Locator;
  readonly cancelButton: Locator;

  constructor(page: Page) {
    this.page = page;
    this.codeInput = page.locator(GROUP_FORM.code);
    this.nameInput = page.locator(GROUP_FORM.name);
    this.startTimeInput = page.locator(GROUP_FORM.startTime);
    this.endTimeInput = page.locator(GROUP_FORM.endTime);
    this.capacityInput = page.locator(GROUP_FORM.capacity);
    this.submitButton = page.locator('button[type="submit"]');
    this.cancelButton = page.locator('button:has-text("Anuluj")');
  }

  async goto() {
    await this.page.goto("/groups/new");
    await this.codeInput.waitFor({ timeout: 15_000 });
  }

  async fillCode(code: string) {
    await this.codeInput.fill(code);
  }

  async fillName(name: string) {
    await this.nameInput.fill(name);
  }

  async selectDay(dayLabel: string) {
    // First Radix Select on the form (day of week)
    const dayTrigger = this.page.locator('button[role="combobox"]').first();
    await dayTrigger.click();
    await this.page.getByRole("option", { name: dayLabel }).click();
  }

  async fillStartTime(time: string) {
    await this.startTimeInput.fill(time);
  }

  async fillEndTime(time: string) {
    await this.endTimeInput.fill(time);
  }

  async selectLevel(levelLabel: string) {
    // Second Radix Select (level)
    const levelTrigger = this.page.locator('button[role="combobox"]').nth(1);
    await levelTrigger.click();
    await this.page.getByRole("option", { name: levelLabel }).click();
  }

  async selectInstructor(name: string) {
    // Third Radix Select (instructor)
    const instructorTrigger = this.page.locator('button[role="combobox"]').nth(2);
    await instructorTrigger.click();
    await this.page.getByRole("option", { name }).click();
  }

  async fillCapacity(capacity: string) {
    await this.capacityInput.fill(capacity);
  }

  async submit() {
    await this.submitButton.click();
  }

  async expectSuccessToast() {
    await expect(this.page.locator(TOAST.container)).toContainText(TOAST.groupAdded);
  }

  async expectValidationError(text: string) {
    await expect(this.page.locator(".text-destructive").filter({ hasText: text })).toBeVisible();
  }

  async expectRedirectToList() {
    await this.page.waitForURL("**/groups", { timeout: 10_000 });
  }
}
