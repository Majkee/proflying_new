import { chromium, type FullConfig } from "@playwright/test";
import dotenv from "dotenv";
import path from "path";

// Load env vars (setup runs in a separate process)
dotenv.config({ path: path.resolve(import.meta.dirname, "..", ".env.local") });

const TEST_EMAIL = "test@proflying.pl";
const TEST_PASSWORD = "TestUser123!";
const TEST_STUDIO_ID = "35f329af-34f3-443f-9fbd-47f187f4e627";

async function globalSetup(_config: FullConfig) {
  // Clean up leftover E2E data from previous (possibly interrupted) runs
  const { cleanupE2EData } = await import("./helpers/supabase-admin");
  console.log("[setup] Cleaning up leftover E2E data...");
  try {
    await cleanupE2EData();
    console.log("[setup] Pre-run cleanup complete.");
  } catch (err) {
    console.error("[setup] Pre-run cleanup failed:", err);
  }

  const browser = await chromium.launch();
  const context = await browser.newContext();
  const page = await context.newPage();

  // Navigate to login
  await page.goto("http://localhost:3000/login");
  await page.waitForSelector("#email");

  // Fill credentials
  await page.fill("#email", TEST_EMAIL);
  await page.fill("#password", TEST_PASSWORD);
  await page.click('button[type="submit"]');

  // Wait for redirect to dashboard
  await page.waitForURL("**/dashboard", { timeout: 15_000 });

  // Set active studio in localStorage
  await page.evaluate((studioId) => {
    localStorage.setItem("proflying_active_studio", studioId);
  }, TEST_STUDIO_ID);

  // Reload to apply studio selection
  await page.reload();
  await page.waitForURL("**/dashboard");

  // Verify studio is active
  await page.waitForSelector('text="Testowe"', { timeout: 10_000 });

  // Save auth state
  await context.storageState({ path: ".auth/super-admin.json" });

  await browser.close();
}

export default globalSetup;
