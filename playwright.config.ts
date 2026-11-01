import { defineConfig, devices } from "@playwright/test";
import { cucumberReporter, defineBddProject } from "playwright-bdd";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { ENV_CONFIG } from "./src/core/config/env.config";

type BrowserName = "chromium" | "firefox" | "webkit";

function findCachedBrowserExecutable(browser: BrowserName): string | undefined {
  const browserRoot = process.env.PLAYWRIGHT_BROWSERS_PATH
    ? path.resolve(process.env.PLAYWRIGHT_BROWSERS_PATH)
    : process.platform === "win32"
      ? path.join(
          process.env.LOCALAPPDATA ??
            path.join(os.homedir(), "AppData", "Local"),
          "ms-playwright",
        )
      : process.platform === "darwin"
        ? path.join(os.homedir(), "Library", "Caches", "ms-playwright")
        : path.join(os.homedir(), ".cache", "ms-playwright");

  const executableNames: Record<BrowserName, string[]> = {
    chromium: process.platform === "win32" ? ["chrome.exe"] : ["chrome"],
    firefox: process.platform === "win32" ? ["firefox.exe"] : ["firefox"],
    webkit: process.platform === "win32" ? ["Playwright.exe"] : ["Playwright"],
  };

  if (!fs.existsSync(browserRoot)) {
    return undefined;
  }

  const browserDirectories = fs
    .readdirSync(browserRoot)
    .filter((name) => name.startsWith(`${browser}-`))
    .sort()
    .reverse();

  for (const browserDirectory of browserDirectories) {
    const stack = [path.join(browserRoot, browserDirectory)];
    while (stack.length > 0) {
      const current = stack.pop();
      if (!current) continue;

      for (const entry of fs.readdirSync(current, { withFileTypes: true })) {
        const entryPath = path.join(current, entry.name);
        if (entry.isDirectory()) {
          stack.push(entryPath);
        } else if (executableNames[browser].includes(entry.name)) {
          return entryPath;
        }
      }
    }
  }

  return undefined;
}

const cachedBrowsers = {
  chromium: findCachedBrowserExecutable("chromium"),
  firefox: findCachedBrowserExecutable("firefox"),
  webkit: findCachedBrowserExecutable("webkit"),
};

export default defineConfig({
  // ─── Global Settings ────────────────────────────────────────────────
  // These apply to ALL projects unless overridden at the project level.

  /** Maximum time a single test can run before timing out (ms) */
  timeout: 60_000,

  /** Maximum time expect() assertions will wait before failing (ms) */
  expect: {
    timeout: 10_000,
  },

  /**
   * Retry failed tests automatically.
   * If a test fails, Playwright will re-run it this many times.
   * Helps with "flaky" tests (tests that sometimes pass, sometimes fail).
   * Tests that pass on retry are marked as "flaky" in reports.
   */
  retries: ENV_CONFIG.RETRY_COUNT,

  /**
   * Run tests in parallel using this many workers.
   * More workers = faster execution, but uses more CPU/memory.
   * Set to 1 for debugging (tests run one at a time).
   */
  workers: process.env.CI
    ? Math.min(ENV_CONFIG.WORKERS, 2)
    : ENV_CONFIG.WORKERS,

  /**
   * Fail the entire test suite as soon as any test fails.
   * Useful in CI to get fast feedback. Set to false for local development.
   */
  fullyParallel: true,

  // ─── Reporter Configuration ──────────────────────────────────────────
  // Reporters generate output after tests run. We use MULTIPLE reporters
  // simultaneously — each serves a different purpose.

  reporter: [
    // 1. HTML Report — Playwright's built-in, great for debugging
    //    View with: npx playwright show-report
    ["html", { open: "never" }],

    // 2. Allure Report — Industry-standard, great for management dashboards
    //    View with: npx allure serve allure-results
    ["allure-playwright"],

    // 3. Monocart Reporter — Modern, chart-rich, visual appeal
    //    Opens: test-results/monocart/report.html
    [
      "monocart-reporter",
      {
        name: "PlaywrightBDD Framework Report",
        outputFile: "./test-results/monocart/report.html",
      },
    ],

    // 4. Custom Dashboard — Our own reporter with tailored metrics
    //    Opens: test-results/reports/dashboard.html
    [
      "./src/reporting/custom-reporter.ts",
      {
        outputDir: "test-results/reports",
      },
    ],

    // 5. Cucumber HTML — Feature/scenario report for BDD stakeholders
    cucumberReporter("html", {
      outputFile: "cucumber-report.html",
    }),

    // 6. Console list — Shows results in the terminal as tests run
    ["list"],
  ],

  // ─── Global "use" Settings ──────────────────────────────────────────
  // Default settings for ALL tests. Individual projects can override these.

  use: {
    /** Take a screenshot when a test fails (for debugging) */
    screenshot: "only-on-failure",

    /** Record a video of tests that fail (for debugging) */
    video: "retain-on-failure",

    /**
     * Record a trace for failing tests. Traces capture every action
     * (clicks, navigations, network requests) and let you replay them
     * in Playwright's Trace Viewer. Incredibly useful for debugging.
     */
    trace: "retain-on-failure",

    /** Default action timeout (ms) — how long to wait for clicks, fills, etc. */
    actionTimeout: ENV_CONFIG.DEFAULT_TIMEOUT,

    /** Default navigation timeout (ms) — how long to wait for page loads */
    navigationTimeout: ENV_CONFIG.NAVIGATION_TIMEOUT,
    baseURL: ENV_CONFIG.UI_BASE_URL,
    headless: ENV_CONFIG.HEADLESS,
  },

  // ─── Projects Configuration ──────────────────────────────────────────
  // Each "project" defines a different way to run tests.

  projects: [
    // ══════════════════════════════════════════════════════════════════
    // 🌐 UI Tests — Run in Chromium (Google Chrome)
    // ══════════════════════════════════════════════════════════════════
    {
      ...defineBddProject({
        name: "chromium",
        features: "features/ui/**/*.feature",
        steps: "steps/ui/**/*.ts",
      }),
      use: {
        ...devices["Desktop Chrome"],
        ...(cachedBrowsers.chromium
          ? { launchOptions: { executablePath: cachedBrowsers.chromium } }
          : {}),
        // Viewport size for consistent screenshots
        viewport: {
          width: ENV_CONFIG.VIEWPORT_WIDTH,
          height: ENV_CONFIG.VIEWPORT_HEIGHT,
        },
      },
    },

    // ══════════════════════════════════════════════════════════════════
    // 🦊 UI Tests — Run in Firefox
    // ══════════════════════════════════════════════════════════════════
    {
      ...defineBddProject({
        name: "firefox",
        features: "features/ui/**/*.feature",
        steps: "steps/ui/**/*.ts",
      }),
      use: {
        ...devices["Desktop Firefox"],
        ...(cachedBrowsers.firefox
          ? { launchOptions: { executablePath: cachedBrowsers.firefox } }
          : {}),
      },
    },

    // ══════════════════════════════════════════════════════════════════
    // 🍎 UI Tests — Run in WebKit (Safari)
    // ══════════════════════════════════════════════════════════════════
    {
      ...defineBddProject({
        name: "webkit",
        features: "features/ui/**/*.feature",
        steps: "steps/ui/**/*.ts",
      }),
      use: {
        ...devices["Desktop Safari"],
        ...(cachedBrowsers.webkit
          ? { launchOptions: { executablePath: cachedBrowsers.webkit } }
          : {}),
      },
    },

    // ══════════════════════════════════════════════════════════════════
    // 📡 API Tests — No browser needed!
    // ══════════════════════════════════════════════════════════════════
    // API tests run WITHOUT launching a browser, making them very fast.
    // They use Playwright's built-in HTTP client (APIRequestContext).
    {
      ...defineBddProject({
        name: "api",
        features: "features/api/**/*.feature",
        steps: "steps/api/**/*.ts",
      }),
      use: {
        // Base URL for API requests — all paths are relative to this
        baseURL: ENV_CONFIG.API_BASE_URL,
        navigationTimeout: ENV_CONFIG.API_TIMEOUT,
      },
    },
  ],
});
