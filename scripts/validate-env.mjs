const required = [
  "NEXT_PUBLIC_SUPABASE_URL",
  "NEXT_PUBLIC_SUPABASE_ANON_KEY",
];

const optional = [
  "NEXT_PUBLIC_SENTRY_DSN",
];

const missing = required.filter((key) => !process.env[key]);

if (missing.length > 0) {
  console.error("\n❌ Missing required environment variables:\n");
  missing.forEach((key) => console.error(`  - ${key}`));
  console.error("\nPlease set them before building.\n");
  process.exit(1);
}

const missingOptional = optional.filter((key) => !process.env[key]);
if (missingOptional.length > 0) {
  console.warn("\n⚠️  Missing optional environment variables:\n");
  missingOptional.forEach((key) => console.warn(`  - ${key}`));
  console.warn("");
}

console.log("✅ All required environment variables are set.");
