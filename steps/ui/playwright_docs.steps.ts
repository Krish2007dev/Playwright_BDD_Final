import { Given, When, Then } from "./ui.fixtures";
import { expect } from "@playwright/test";

Given("I am on the Playwright homepage", async ({ playwrightPage }) => {
  await playwrightPage.navigate();
});

Given(
  "I intercept the search API to return mocked results",
  async ({ playwrightPage, $testInfo }) => {
    $testInfo.skip(
      $testInfo.project.name === "webkit",
      "Route interception for cross-origin requests is not reliable on WebKit",
    );
    await playwrightPage.interceptSearchApi([
      {
        title: "Mocked Result",
        url: "https://playwright.dev/docs/intro",
      },
    ]);
  },
);

When("I click on the Get Started link", async ({ playwrightPage }) => {
  await playwrightPage.clickGetStarted();
});

When("I search for {string}", async ({ playwrightPage }, query: string) => {
  await playwrightPage.searchFor(query);
});

When(
  "I click the first search result for {string}",
  async ({ playwrightPage }, text: string) => {
    await playwrightPage.clickSearchResult(text);
  },
);

When(
  "I send a direct request to {string}",
  async ({ request }, url: string) => {
    const response = await request.get(url);
    (request as any).__lastResponse = response;
  },
);

Then("the URL should contain {string}", async ({ page }, text: string) => {
  await expect(page).toHaveURL(new RegExp(text));
});

Then(
  "I should see {string} in the page heading",
  async ({ page }, text: string) => {
    await expect(page.locator("h1")).toContainText(text);
  },
);

Then(
  "the page title should contain {string}",
  async ({ page }, text: string) => {
    await expect(page).toHaveTitle(new RegExp(text));
  },
);

Then(
  "I should see {string} in the search results",
  async ({ page }, text: string) => {
    await expect(
      page.locator(".DocSearch-Hit").filter({ hasText: text }).first(),
    ).toBeVisible();
  },
);

Then(
  "the direct response status should be {int}",
  async ({ request }, status: number) => {
    const response = (request as any).__lastResponse;
    expect(response.status()).toBe(status);
  },
);
