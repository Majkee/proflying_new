import dotenv from "dotenv";
import path from "path";

// Load env vars (teardown runs in a separate process)
dotenv.config({ path: path.resolve(import.meta.dirname, "..", ".env.local") });

async function globalTeardown() {
  const { cleanupE2EData } = await import("./helpers/supabase-admin");

  console.log("[teardown] Cleaning up E2E test data...");
  try {
    await cleanupE2EData();
    console.log("[teardown] Cleanup complete.");
  } catch (err) {
    console.error("[teardown] Cleanup failed:", err);
  }
}

export default globalTeardown;
