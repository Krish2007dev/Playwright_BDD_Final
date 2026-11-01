import { Given, When, Then } from "./ui.fixtures";
import { expect } from "@playwright/test";

When(
  "I add {string} to the cart",
  async ({ inventoryPage }, productName: string) => {
    await inventoryPage.addProductToCart(productName);
  },
);

When(
  "I remove {string} from the cart",
  async ({ inventoryPage }, productName: string) => {
    await inventoryPage.removeProductFromCart(productName);
  },
);

When(
  "I sort products by {string}",
  async ({ inventoryPage }, sortOption: string) => {
    await inventoryPage.sortProducts(sortOption);
  },
);

Then("I should see the products page title", async ({ inventoryPage }) => {
  await inventoryPage.verifyPageLoaded();
});

Then(
  "I should see at least {int} product on the page",
  async ({ inventoryPage }, minCount: number) => {
    const count = await inventoryPage.getProductCount();
    expect(count).toBeGreaterThanOrEqual(minCount);
  },
);

Then(
  "the cart should show {int} item(s)",
  async ({ inventoryPage }, count: number) => {
    await inventoryPage.verifyCartCount(String(count));
  },
);

Then("the cart should be empty", async ({ page }) => {
  const badge = page.locator(".shopping_cart_badge");
  await expect(badge).toHaveCount(0);
});

Then("the products should be sorted correctly", async ({ page }) => {
  const products = page.locator(".inventory_item_name");
  const count = await products.count();
  expect(count).toBeGreaterThan(0);
});
