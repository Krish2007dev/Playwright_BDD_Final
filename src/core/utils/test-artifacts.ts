import { inspect } from "node:util";
import type { TestInfo } from "@playwright/test";

export async function captureFailureLogs(
  testInfo: TestInfo,
  use: () => Promise<void>,
): Promise<void> {
  const entries: string[] = [];
  const originalLog = console.log;
  const originalWarn = console.warn;
  const originalError = console.error;

  const capture = (level: string, args: unknown[]): void => {
    entries.push(
      `[${level}] ${args
        .map((arg) =>
          typeof arg === "string"
            ? arg
            : inspect(arg, { depth: 5, colors: false }),
        )
        .join(" ")}`,
    );
  };

  console.log = (...args: unknown[]): void => {
    capture("INFO", args);
    originalLog(...args);
  };
  console.warn = (...args: unknown[]): void => {
    capture("WARN", args);
    originalWarn(...args);
  };
  console.error = (...args: unknown[]): void => {
    capture("ERROR", args);
    originalError(...args);
  };

  try {
    await use();
  } finally {
    console.log = originalLog;
    console.warn = originalWarn;
    console.error = originalError;

    if (testInfo.status !== testInfo.expectedStatus) {
      await testInfo.attach("test-log", {
        body: Buffer.from(
          entries.join("\n") || "No console output captured.",
          "utf8",
        ),
        contentType: "text/plain",
      });
    }
  }
}
