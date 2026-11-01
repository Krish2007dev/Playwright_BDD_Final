const COLORS = {
  reset: "\x1b[0m",
  red: "\x1b[31m",
  yellow: "\x1b[33m",
  blue: "\x1b[34m",
  green: "\x1b[32m",
  cyan: "\x1b[36m",
  gray: "\x1b[90m",
  magenta: "\x1b[35m",
} as const;

type LogLevel = "ERROR" | "WARN" | "INFO" | "DEBUG" | "STEP";

function getTimestamp(): string {
  return new Date().toISOString().replace("T", " ").substring(0, 19);
}

function getColorForLevel(level: LogLevel): string {
  const colorMap: Record<LogLevel, string> = {
    ERROR: COLORS.red,
    WARN: COLORS.yellow,
    INFO: COLORS.blue,
    DEBUG: COLORS.cyan,
    STEP: COLORS.magenta,
  };
  return colorMap[level];
}

export class Logger {
  private context: string;

  private static enabled: boolean = true;

  constructor(context: string) {
    this.context = context;
  }

  static setEnabled(enabled: boolean): void {
    Logger.enabled = enabled;
  }

  private log(level: LogLevel, message: string, data?: any): void {
    if (!Logger.enabled) return;

    const color = getColorForLevel(level);
    const timestamp = `${COLORS.gray}[${getTimestamp()}]${COLORS.reset}`;
    const levelTag = `${color}[${level}]${COLORS.reset}`;
    const contextTag = `${COLORS.green}[${this.context}]${COLORS.reset}`;
    const formattedMessage = `${timestamp} ${levelTag} ${contextTag} ${message}`;

    // Print to the appropriate console method
    if (level === "ERROR") {
      console.error(formattedMessage);
    } else if (level === "WARN") {
      console.warn(formattedMessage);
    } else {
      console.log(formattedMessage);
    }

    // If extra data was provided, print it too (formatted nicely)
    if (data !== undefined) {
      console.log(
        `${COLORS.gray}  └─ Data: ${JSON.stringify(data, null, 2)}${COLORS.reset}`,
      );
    }
  }

  /** Log an informational message — normal operations */
  info(message: string, data?: any): void {
    this.log("INFO", message, data);
  }

  /** Log a warning — something unexpected but not fatal */
  warn(message: string, data?: any): void {
    this.log("WARN", message, data);
  }

  /** Log an error — something went wrong */
  error(message: string, data?: any): void {
    this.log("ERROR", message, data);
  }

  /** Log debug info — very detailed technical information */
  debug(message: string, data?: any): void {
    this.log("DEBUG", message, data);
  }

  /** Log a BDD step — used when executing Given/When/Then steps */
  step(message: string, data?: any): void {
    this.log("STEP", `▶ ${message}`, data);
  }

  /**
   * Creates a separator line in the logs for visual grouping.
   * Useful at the start/end of test scenarios.
   *
   * @param title - Optional title to center in the separator
   *
   * EXAMPLE:
   *   log.separator('Login Test Starting');
   *   // Output: ════════════ Login Test Starting ════════════
   */
  separator(title?: string): void {
    if (!Logger.enabled) return;
    const line = "═".repeat(60);
    if (title) {
      const padding = Math.max(0, Math.floor((60 - title.length - 2) / 2));
      const paddedTitle =
        "═".repeat(padding) + ` ${title} ` + "═".repeat(padding);
      console.log(`${COLORS.gray}${paddedTitle}${COLORS.reset}`);
    } else {
      console.log(`${COLORS.gray}${line}${COLORS.reset}`);
    }
  }
}
