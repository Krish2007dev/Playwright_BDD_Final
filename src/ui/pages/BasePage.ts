import { Page, Locator, expect, BrowserContext } from "@playwright/test";
import { Logger } from "../../core/utils/logger";
import { autoHealLocator, ElementContext } from "../../core/utils/auto-heal";
import {
  collectPerformanceMetrics,
  runAccessibilityCheck,
  PerformanceMetrics,
  AccessibilityResult,
} from "../../core/utils/performance-helper";
import { MetricsCollector } from "../../core/utils/metrics-collector";
import { ENV_CONFIG } from "../../core/config/env.config";

export class BasePage {
  readonly page: Page;

  protected readonly log: Logger;

  protected readonly pageName: string;

  constructor(page: Page, pageName: string = "BasePage") {
    this.page = page;
    this.pageName = pageName;
    this.log = new Logger(pageName);
  }

  async navigateTo(url: string): Promise<void> {
    this.log.info(`Navigating to: ${url}`);
    await this.page.goto(url, {
      waitUntil: "domcontentloaded",
      timeout: ENV_CONFIG.NAVIGATION_TIMEOUT,
    });
    this.log.info(`Navigation complete.`);
  }

  /**
   * Waits for the page to be fully loaded (all resources downloaded).
   * Useful after a navigation or form submission.
   */
  async waitForPageLoad(): Promise<void> {
    this.log.info("Waiting for page to fully load...");
    await this.page.waitForLoadState("load");
    this.log.info("Page fully loaded.");
  }

  /**
   * Gets the current page title.
   *
   * @returns The text in the browser's title bar (e.g., "Swag Labs")
   */
  async getTitle(): Promise<string> {
    const title = await this.page.title();
    this.log.info(`Page title: "${title}"`);
    return title;
  }

  /**
   * Gets the current page URL.
   *
   * @returns The full URL currently in the browser's address bar
   */
  getCurrentUrl(): string {
    return this.page.url();
  }

  // ═══════════════════════════════════════════════════════════════════
  // 🖱️ INTERACTIONS — Clicking, typing, selecting
  // ═══════════════════════════════════════════════════════════════════

  /**
   * Clicks on an element, with auto-heal support.
   *
   * @param locator - The Playwright Locator for the element to click
   * @param description - A human-readable description (for logging)
   * @param healContext - Optional context for auto-heal if the locator fails
   */
  async click(
    locator: Locator,
    description: string = "element",
    healContext?: Omit<ElementContext, "originalSelector">,
  ): Promise<void> {
    this.log.info(`Clicking: ${description}`);
    try {
      await locator.click({ timeout: ENV_CONFIG.DEFAULT_TIMEOUT });
    } catch (error) {
      // If click failed and we have heal context, try auto-heal
      if (healContext) {
        this.log.warn(
          `Click failed on "${description}", attempting auto-heal...`,
        );
        const healed = await autoHealLocator(this.page, locator, {
          ...healContext,
          originalSelector: description,
        });
        await healed.click();
      } else {
        throw error;
      }
    }
  }

  /**
   * Types text into an input field, clearing it first.
   *
   * @param locator - The Locator for the input field
   * @param text - The text to type
   * @param description - A human-readable description (for logging)
   */
  async fill(
    locator: Locator,
    text: string,
    description: string = "input",
  ): Promise<void> {
    this.log.info(`Filling "${description}" with: "${text}"`);
    await locator.fill(text, { timeout: ENV_CONFIG.DEFAULT_TIMEOUT });
  }

  /**
   * Selects an option from a dropdown by its visible text.
   *
   * @param locator - The Locator for the <select> element
   * @param option - The visible text of the option to select
   * @param description - A human-readable description (for logging)
   */
  async selectOption(
    locator: Locator,
    option: string,
    description: string = "dropdown",
  ): Promise<void> {
    this.log.info(`Selecting "${option}" from ${description}`);
    await locator.selectOption({ label: option });
  }

  // ═══════════════════════════════════════════════════════════════════
  // ⏳ WAITING — Pausing until conditions are met
  // ═══════════════════════════════════════════════════════════════════

  /**
   * Waits until an element becomes visible on the page.
   *
   * @param locator - The element to wait for
   * @param timeout - Maximum time to wait (ms). Defaults to config value.
   */
  async waitForVisible(
    locator: Locator,
    timeout: number = ENV_CONFIG.DEFAULT_TIMEOUT,
  ): Promise<void> {
    this.log.info("Waiting for element to become visible...");
    await locator.waitFor({ state: "visible", timeout });
  }

  /**
   * Waits until an element disappears from the page.
   *
   * @param locator - The element to wait for disappearance
   * @param timeout - Maximum time to wait (ms)
   */
  async waitForHidden(
    locator: Locator,
    timeout: number = ENV_CONFIG.DEFAULT_TIMEOUT,
  ): Promise<void> {
    this.log.info("Waiting for element to disappear...");
    await locator.waitFor({ state: "hidden", timeout });
  }

  /**
   * Waits for the URL to contain a specific string.
   * Useful after clicking a link or submitting a form.
   *
   * @param urlPart - The substring to look for in the URL
   */
  async waitForUrlContains(urlPart: string): Promise<void> {
    this.log.info(`Waiting for URL to contain: "${urlPart}"`);
    await this.page.waitForURL(`**/*${urlPart}*`, {
      timeout: ENV_CONFIG.NAVIGATION_TIMEOUT,
    });
  }

  async assertTextContains(
    locator: Locator,
    expectedText: string,
    description: string = "element",
  ): Promise<void> {
    this.log.info(
      `Asserting "${description}" contains text: "${expectedText}"`,
    );
    await expect(locator).toContainText(expectedText);
    this.log.info(`✅ Assertion passed.`);
  }

  async assertUrl(urlPattern: string | RegExp): Promise<void> {
    this.log.info(`Asserting URL matches: ${urlPattern}`);
    await expect(this.page).toHaveURL(urlPattern);
    this.log.info(`✅ URL assertion passed.`);
  }

  /**
   * Asserts that an element is visible on the page.
   */
  async assertVisible(
    locator: Locator,
    description: string = "element",
  ): Promise<void> {
    this.log.info(`Asserting "${description}" is visible`);
    await expect(locator).toBeVisible();
    this.log.info(`✅ "${description}" is visible.`);
  }

  // ═══════════════════════════════════════════════════════════════════
  // 📸 SCREENSHOTS & DEBUGGING — Capturing evidence
  // ═══════════════════════════════════════════════════════════════════

  /**
   * Takes a screenshot of the current page.
   * Useful for debugging or saving evidence of test state.
   *
   * @param name - A name for the screenshot file (without extension)
   * @returns The path to the saved screenshot
   */
  async takeScreenshot(name: string): Promise<string> {
    const screenshotPath = `${ENV_CONFIG.SCREENSHOT_DIR}/${name}-${Date.now()}.png`;
    this.log.info(`Taking screenshot: ${screenshotPath}`);
    await this.page.screenshot({ path: screenshotPath, fullPage: true });
    return screenshotPath;
  }

  // ═══════════════════════════════════════════════════════════════════
  // 📊 METRICS — Performance & Accessibility
  // ═══════════════════════════════════════════════════════════════════

  /**
   * Collects performance metrics from the current page and adds them
   * to the global metrics collector.
   *
   * @returns The collected PerformanceMetrics
   */
  async collectPerformance(): Promise<PerformanceMetrics> {
    const metrics = await collectPerformanceMetrics(this.page);
    MetricsCollector.getInstance().addPerformanceMetrics(metrics);
    return metrics;
  }

  /**
   * Runs an accessibility check on the current page and adds results
   * to the global metrics collector.
   *
   * @returns The AccessibilityResult with any issues found
   */
  async checkAccessibility(): Promise<AccessibilityResult> {
    const result = await runAccessibilityCheck(this.page);
    MetricsCollector.getInstance().addAccessibilityResult(result);
    return result;
  }
}
