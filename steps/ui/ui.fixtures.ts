import { test as base, createBdd } from "playwright-bdd";
import { LoginPage } from "../../src/ui/pages/LoginPage";
import { InventoryPage } from "../../src/ui/pages/InventoryPage";
import { PlaywrightDocsPage } from "../../src/ui/pages/PlaywrightDocsPage";
import { captureFailureLogs } from "../../src/core/utils/test-artifacts";

type UIFixtures = {
  loginPage: LoginPage;
  inventoryPage: InventoryPage;
  playwrightPage: PlaywrightDocsPage;
  failureArtifacts: void;
};

export const test = base.extend<UIFixtures>({
  failureArtifacts: [
    async ({}, use, testInfo) => {
      await captureFailureLogs(testInfo, use);
    },
    { auto: true },
  ],

  loginPage: async ({ page }, use) => {
    await use(new LoginPage(page));
  },

  inventoryPage: async ({ page }, use) => {
    await use(new InventoryPage(page));
  },

  playwrightPage: async ({ page }, use) => {
    await use(new PlaywrightDocsPage(page));
  },
});

export const { Given, When, Then } = createBdd(test);
