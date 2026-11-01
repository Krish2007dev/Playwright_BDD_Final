import { Page, Locator, expect } from "@playwright/test";
import { BasePage } from "./BasePage";
import { UI_URLS } from "../../core/config/test-data.config";

export class PlaywrightDocsPage extends BasePage {
  readonly getStartedLink: Locator;

  readonly searchButton: Locator;

  readonly searchInput: Locator;

  constructor(page: Page) {
    super(page, "PlaywrightDocsPage");

    this.getStartedLink = page.getByRole("link", { name: "Get started" });
    this.searchButton = page.locator(".DocSearch-Button");
    this.searchInput = page.locator("#docsearch-input");
  }

  async navigate(): Promise<void> {
    this.log.step("Navigating to Playwright docs homepage");
    await this.navigateTo(UI_URLS.playwright.home);
  }

  async clickGetStarted(): Promise<void> {
    this.log.step('Clicking "Get Started" link');
    await this.click(this.getStartedLink, "Get Started link", {
      role: "link",
      text: "Get started",
    });
  }

  async searchFor(query: string): Promise<void> {
    this.log.step(`Searching for: "${query}"`);

    await this.searchButton.waitFor({ state: "visible", timeout: 15000 });

    await this.searchButton.click();

    try {
      await this.searchInput.waitFor({ state: "visible", timeout: 5000 });
    } catch {
      this.log.warn(
        "Search dialog did not open via click, trying keyboard shortcut",
      );
      await this.page.keyboard.press("Meta+k");
      await this.searchInput.waitFor({ state: "visible", timeout: 5000 });
    }

    await this.fill(this.searchInput, query, "Search Input");

    await this.page.waitForSelector(".DocSearch-Hit", {
      timeout: ENV_CONFIG_TIMEOUT,
    });

    this.log.info(`Search results loaded for: "${query}"`);
  }

  async clickSearchResult(text: string): Promise<void> {
    this.log.step(`Clicking search result: "${text}"`);
    await this.page
      .locator(".DocSearch-Hit")
      .filter({ hasText: text })
      .first()
      .click();
    this.log.info(`Clicked search result for: "${text}"`);
  }

  async interceptSearchApi(
    mockResults: Array<{ title: string; url: string }> = [],
  ): Promise<void> {
    this.log.step("Setting up search API interception");

    await this.page.route(/algolia|docsearch/, async (route) => {
      const json = {
        results: [
          {
            hits: mockResults.map((result, index) => ({
              objectID: String(index + 1),
              url: result.url,
              type: "lvl1",
              hierarchy: {
                lvl0: "Documentation",
                lvl1: result.title,
                lvl2: null,
                lvl3: null,
                lvl4: null,
                lvl5: null,
                lvl6: null,
              },
              _highlightResult: {
                hierarchy: {
                  lvl0: {
                    value: "Documentation",
                    matchLevel: "none",
                    matchedWords: [],
                  },
                  lvl1: {
                    value: result.title,
                    matchLevel: "full",
                    matchedWords: ["mocked"],
                  },
                },
              },
            })),
            nbHits: mockResults.length,
            page: 0,
            nbPages: 1,
            hitsPerPage: 20,
            query: "",
            params: "",
            index: "playwright",
            processingTimeMS: 1,
          },
        ],
      };
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify(json),
      });
    });

    this.log.info("Search API interception configured.");
  }

  async verifySearchResultVisible(expectedText: string): Promise<void> {
    this.log.step(`Verifying search result visible: "${expectedText}"`);
    const result = this.page
      .locator(".DocSearch-Hit")
      .filter({ hasText: expectedText })
      .first();
    await this.assertVisible(result, `Search result: ${expectedText}`);
  }
}

// ── Private constant for timeout (avoids importing full config in locator context) ──
const ENV_CONFIG_TIMEOUT = 10000;
