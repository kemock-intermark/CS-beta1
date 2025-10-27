export const logger = {
  info: (message: string, ...args: unknown[]) => {
    console.log(`[INFO] ${message}`, ...args);
  },
  error: (message: string, error?: unknown) => {
    const details =
      typeof error === 'string'
        ? error
        : error && typeof error === 'object' && 'message' in (error as any)
        ? (error as any).message
        : error;
    console.error(`[ERROR] ${message}`, details);
  },
  warn: (message: string, ...args: unknown[]) => {
    console.warn(`[WARN] ${message}`, ...args);
  },
  debug: (message: string, ...args: unknown[]) => {
    if (process.env.LOG_LEVEL === 'debug') {
      console.log(`[DEBUG] ${message}`, ...args);
    }
  },
};
