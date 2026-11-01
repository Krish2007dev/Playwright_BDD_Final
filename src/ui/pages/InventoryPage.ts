import { Page, Locator, expect } from "@playwright/test";
import { BasePage } from "./BasePage";

export class InventoryPage extends BasePage {
  readonly pageTitle: Locator;

  readonly sortDropdown: Locator;

  readonly cartLink: Locator;

  readonly cartBadge: Locator;

  readonly menuButton: Locator;

  readonly logoutLink: Locator;

  constructor(page: Page) {
    super(page, "InventoryPage");

    this.pageTitle = page.locator(".title");
    this.sortDropdown = page.locator('[data-test="product-sort-container"]');
    this.cartLink = page.locator(".shopping_cart_link");
    this.cartBadge = page.locator(".shopping_cart_badge");
    this.menuButton = page.locator("#react-burger-menu-btn");
    this.logoutLink = page.locator("#logout_sidebar_link");
  }

  async addProductToCart(productName: string): Promise<void> {
    this.log.step(`Adding product to cart: "${productName}"`);

    const productCard = this.page
      .locator(".inventory_item")
      .filter({ hasText: productName });

    await productCard.locator("button", { hasText: "Add to cart" }).click();

    this.log.info(`✅ "${productName}" added to cart.`);
  }

  async removeProductFromCart(productName: string): Promise<void> {
    this.log.step(`Removing product from cart: "${productName}"`);

    const productCard = this.page
      .locator(".inventory_item")
      .filter({ hasText: productName });

    await productCard.locator("button", { hasText: "Remove" }).click();

    this.log.info(`✅ "${productName}" removed from cart.`);
  }

  async goToCart(): Promise<void> {
    this.log.step("Navigating to cart");
    await this.click(this.cartLink, "Shopping Cart");
  }

  async sortProducts(sortOption: string): Promise<void> {
    this.log.step(`Sorting products by: "${sortOption}"`);
    await this.selectOption(this.sortDropdown, sortOption, "Sort Dropdown");
  }

  async logout(): Promise<void> {
    this.log.step("Logging out");
    await this.click(this.menuButton, "Menu Button");
    await this.click(this.logoutLink, "Logout Link");
    this.log.info("✅ Logged out successfully.");
  }

  async verifyPageLoaded(): Promise<void> {
    this.log.step("Verifying inventory page loaded");
    await this.assertTextContains(this.pageTitle, "Products", "Page Title");
    this.log.info("✅ Inventory page loaded.");
  }

  async verifyCartCount(expectedCount: string): Promise<void> {
    this.log.step(`Verifying cart count: ${expectedCount}`);
    await expect(this.cartBadge).toHaveText(expectedCount);
    this.log.info(`✅ Cart shows ${expectedCount} items.`);
  }

  /**
   * Gets the number of products displayed on the page.
   *
   * @returns The count of product cards visible
   */
  async getProductCount(): Promise<number> {
    const count = await this.page.locator(".inventory_item").count();
    this.log.info(`Products on page: ${count}`);
    return count;
  }
}
