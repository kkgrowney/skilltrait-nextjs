function safeValues(values: unknown[]) {
  return values.map((value) => {
    if (value instanceof Error) return { name: value.name, message: value.message };
    if (value === null || ["string", "number", "boolean", "undefined"].includes(typeof value)) {
      return value;
    }
    return "[structured data omitted]";
  });
}

/** Centralized logging that drops diagnostics in production and redacts objects. */
export const logger = {
  debug: (...values: unknown[]) => {
    if (process.env.NODE_ENV !== "production") globalThis["console"].debug(...safeValues(values));
  },
  info: (...values: unknown[]) => {
    if (process.env.NODE_ENV !== "production") globalThis["console"].info(...safeValues(values));
  },
  warn: (...values: unknown[]) => {
    globalThis["console"].warn(...safeValues(values));
  },
  error: (...values: unknown[]) => {
    globalThis["console"].error(...safeValues(values));
  },
};
