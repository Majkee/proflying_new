import { test, expect } from "@playwright/test";
import { LoginPage } from "../page-objects/login.page";

// These tests run WITHOUT auth state (unauthenticated)
test.use({ storageState: { cookies: [], origins: [] } });

test.describe("Authentication", () => {
  test("redirects unauthenticated user from /dashboard to /login", async ({ page }) => {
    await page.goto("/dashboard");
    await page.waitForURL("**/login", { timeout: 10_000 });
    expect(page.url()).toContain("/login");
  });

  test("redirects unauthenticated user from /students to /login", async ({ page }) => {
    await page.goto("/students");
    await page.waitForURL("**/login", { timeout: 10_000 });
    expect(page.url()).toContain("/login");
  });

  test("redirects unauthenticated user from /groups to /login", async ({ page }) => {
    await page.goto("/groups");
    await page.waitForURL("**/login", { timeout: 10_000 });
    expect(page.url()).toContain("/login");
  });

  test("valid login redirects to /dashboard", async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.goto();
    await loginPage.login("test@proflying.pl", "TestUser123!");
    await loginPage.expectRedirectToDashboard();
  });

  test("invalid login shows error message", async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.goto();
    await loginPage.login("wrong@email.pl", "WrongPassword!");
    await loginPage.expectError("Nieprawidlowy email lub haslo");
  });

  test("login button shows loading state", async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.goto();
    await loginPage.emailInput.fill("test@proflying.pl");
    await loginPage.passwordInput.fill("TestUser123!");
    await loginPage.submitButton.click();
    // Check loading text appears (may be brief)
    await expect(loginPage.submitButton).toContainText("Logowanie...");
  });
});
