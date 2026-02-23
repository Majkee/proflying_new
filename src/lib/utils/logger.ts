type LogLevel = "info" | "warn" | "error";

function formatMessage(level: LogLevel, message: string, meta?: Record<string, unknown>) {
  const timestamp = new Date().toISOString();
  const base = { timestamp, level, message };
  return meta ? { ...base, ...meta } : base;
}

export const logger = {
  info(message: string, meta?: Record<string, unknown>) {
    console.log(JSON.stringify(formatMessage("info", message, meta)));
  },
  warn(message: string, meta?: Record<string, unknown>) {
    console.warn(JSON.stringify(formatMessage("warn", message, meta)));
  },
  error(message: string, error?: unknown, meta?: Record<string, unknown>) {
    const errorInfo = error instanceof Error
      ? { errorMessage: error.message, stack: error.stack }
      : { errorMessage: String(error) };
    console.error(JSON.stringify(formatMessage("error", message, { ...errorInfo, ...meta })));
  },
};
