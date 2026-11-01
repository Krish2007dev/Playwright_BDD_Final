import * as path from "path";
import { config as loadDotenv } from "dotenv";

loadDotenv({
  path: path.resolve(process.cwd(), `.env.${process.env.ENV_NAME || "dev"}`),
});
loadDotenv();

/**
 * Interface defining all available environment settings.
 * Adding a new setting? Add it here first, then set its default below.
 */
export interface EnvironmentConfig {
  /** The name of the current environment (e.g., 'dev', 'staging', 'prod') */
  ENV_NAME: string;

  /** Base URL for the UI application under test */
  UI_BASE_URL: string;

  /** Base URL for the API under test */
  API_BASE_URL: string;

  /** Default timeout for page actions (in milliseconds) */
  DEFAULT_TIMEOUT: number;

  /** Timeout for API requests (in milliseconds) */
  API_TIMEOUT: number;

  /** Timeout for navigation (in milliseconds) */
  NAVIGATION_TIMEOUT: number;

  /** Whether to run the browser in headless mode (no visible window) */
  HEADLESS: boolean;

  /** How many times to retry a failed test before marking it as failed */
  RETRY_COUNT: number;

  /** Number of parallel workers (tests running at the same time) */
  WORKERS: number;

  /** Where to save test report files */
  REPORT_DIR: string;

  /** Where to save screenshots on failure */
  SCREENSHOT_DIR: string;

  /** Where to save test videos */
  VIDEO_DIR: string;

  /** Where to save trace files (for debugging) */
  TRACE_DIR: string;

  /** The viewport width for the browser window */
  VIEWPORT_WIDTH: number;

  /** The viewport height for the browser window */
  VIEWPORT_HEIGHT: number;

  /** Default username for login tests (SauceDemo) */
  DEFAULT_USERNAME: string;

  /** Default password for login tests (SauceDemo) */
  DEFAULT_PASSWORD: string;

  /** MySQL connection settings used by API database fixtures */
  MYSQL: {
    host: string;
    port: number;
    user: string;
    password: string;
    database: string;
    connectionLimit: number;
  };

  /** MongoDB connection settings used by API database fixtures */
  MONGO: {
    uri: string;
    database: string;
  };
}

/**
 * Reads an environment variable and returns its value,
 * or a fallback default if the variable is not set.
 *
 * @param key - The name of the environment variable (e.g., 'UI_BASE_URL')
 * @param defaultValue - What to use if the variable isn't set
 * @returns The value from the environment, or the default
 *
 * EXAMPLE:
 *   getEnvVar('UI_BASE_URL', 'https://www.saucedemo.com')
 *   // If UI_BASE_URL is set in your .env → returns that value
 *   // If UI_BASE_URL is NOT set → returns 'https://www.saucedemo.com'
 */
function getEnvVar(key: string, defaultValue?: string): string {
  const value = process.env[key] ?? defaultValue;
  if (value === undefined || value.trim() === "") {
    throw new Error(`Missing required environment variable: ${key}`);
  }
  return value;
}

function getOptionalEnvVar(key: string): string {
  return process.env[key] ?? "";
}

function getNumberEnvVar(
  key: string,
  defaultValue: number,
  minimum = 0,
): number {
  const value = Number(getEnvVar(key, String(defaultValue)));
  if (!Number.isFinite(value) || value < minimum) {
    throw new Error(
      `${key} must be a number greater than or equal to ${minimum}`,
    );
  }
  return value;
}

function getBooleanEnvVar(key: string, defaultValue: boolean): boolean {
  const value = getEnvVar(key, String(defaultValue)).toLowerCase();
  if (value !== "true" && value !== "false") {
    throw new Error(`${key} must be either true or false`);
  }
  return value === "true";
}

/**
 * The master configuration object.
 * Every setting your framework needs lives here.
 *
 * TO OVERRIDE A SETTING:
 *   Option 1: Create a `.env` file in the project root with KEY=VALUE pairs.
 *   Option 2: Set environment variables before running tests:
 *             `UI_BASE_URL=https:
 */
export const ENV_CONFIG: EnvironmentConfig = {
  ENV_NAME: getEnvVar("ENV_NAME", "development"),

  UI_BASE_URL: getEnvVar("UI_BASE_URL", "https://www.saucedemo.com"),
  API_BASE_URL: getEnvVar(
    "API_BASE_URL",
    "https://jsonplaceholder.typicode.com",
  ),

  DEFAULT_TIMEOUT: getNumberEnvVar("DEFAULT_TIMEOUT", 30000, 1),
  API_TIMEOUT: getNumberEnvVar("API_TIMEOUT", 15000, 1),
  NAVIGATION_TIMEOUT: getNumberEnvVar("NAVIGATION_TIMEOUT", 30000, 1),

  HEADLESS: getBooleanEnvVar("HEADLESS", true),
  VIEWPORT_WIDTH: getNumberEnvVar("VIEWPORT_WIDTH", 1280, 320),
  VIEWPORT_HEIGHT: getNumberEnvVar("VIEWPORT_HEIGHT", 720, 240),

  RETRY_COUNT: getNumberEnvVar("RETRY_COUNT", 1),
  WORKERS: getNumberEnvVar("WORKERS", 4, 1),

  REPORT_DIR: getEnvVar("REPORT_DIR", "test-results/reports"),
  SCREENSHOT_DIR: getEnvVar("SCREENSHOT_DIR", "test-results/screenshots"),
  VIDEO_DIR: getEnvVar("VIDEO_DIR", "test-results/videos"),
  TRACE_DIR: getEnvVar("TRACE_DIR", "test-results/traces"),

  DEFAULT_USERNAME: getOptionalEnvVar("DEFAULT_USERNAME"),
  DEFAULT_PASSWORD: getOptionalEnvVar("DEFAULT_PASSWORD"),

  MYSQL: {
    host: getEnvVar("MYSQL_HOST", "localhost"),
    port: getNumberEnvVar("MYSQL_PORT", 3306, 1),
    user: getEnvVar("MYSQL_USER", "root"),
    password: getOptionalEnvVar("MYSQL_PASSWORD"),
    database: getEnvVar("MYSQL_DATABASE", "test"),
    connectionLimit: getNumberEnvVar("MYSQL_CONNECTION_LIMIT", 10, 1),
  },

  MONGO: {
    uri: getEnvVar("MONGO_URI", "mongodb://localhost:27017"),
    database: getEnvVar("MONGO_DATABASE", "test"),
  },
};

for (const [key, value] of Object.entries({
  UI_BASE_URL: ENV_CONFIG.UI_BASE_URL,
  API_BASE_URL: ENV_CONFIG.API_BASE_URL,
})) {
  try {
    new URL(value);
  } catch {
    throw new Error(`${key} must be a valid absolute URL`);
  }
}

/**
 * Helper to resolve paths relative to the project root.
 * This ensures paths work correctly regardless of where you run the tests from.
 *
 * @param relativePath - A path relative to the project root (e.g., 'test-results')
 * @returns The absolute path on your computer
 */
export function resolveProjectPath(relativePath: string): string {
  return path.resolve(process.cwd(), relativePath);
}
