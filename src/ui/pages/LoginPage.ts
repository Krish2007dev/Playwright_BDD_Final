import { Page, Locator, expect } from "@playwright/test";
import { BasePage } from "./BasePage";
import { UI_URLS } from "../../core/config/test-data.config";

export class LoginPage extends BasePage {
  readonly usernameInput: Locator;

  readonly passwordInput: Locator;

  readonly loginButton: Locator;

  readonly errorMessage: Locator;

  readonly pageTitle: Locator;

  constructor(page: Page) {
    super(page, "LoginPage");

    this.usernameInput = page.locator("#user-name");
    this.passwordInput = page.locator("#password");
    this.loginButton = page.locator("#login-button");
    this.errorMessage = page.locator('[data-test="error"]');
    this.pageTitle = page.locator(".login_logo");
  }

  async navigate(): Promise<void> {
    this.log.step("Navigating to SauceDemo login page");
    await this.navigateTo(UI_URLS.saucedemo.login);
  }

  async login(username: string, password: string): Promise<void> {
    this.log.step(`Logging in as: ${username}`);

    // Fill the username field
    await this.fill(this.usernameInput, username, "Username");

    // Fill the password field
    await this.fill(this.passwordInput, password, "Password");

    // Click the Login button (with auto-heal context in case the ID changes)
    await this.click(this.loginButton, "Login Button", {
      role: "button",
      text: "Login",
    });

    this.log.info("Login form submitted.");
  }

  // ═══════════════════════════════════════════════════════════════════
  // ✅ VERIFICATIONS — Checking that things worked correctly
  // ═══════════════════════════════════════════════════════════════════

  /**
   * Verifies that login was successful by checking the URL.
   * After a successful login, the URL changes to include "inventory.html".
   *
   * THROWS: If the URL doesn't change to inventory within the timeout,
   * this will throw an assertion error (test fails).
   */
  async verifyLoginSuccess(): Promise<void> {
    this.log.step("Verifying successful login");
    await this.assertUrl(/inventory.html/);
    this.log.info("✅ Login successful — redirected to inventory page.");
  }

  /**
   * Verifies that a specific error message is displayed.
   * Used after attempting login with invalid credentials.
   *
   * @param expectedMessage - The exact error text to look for
   *
   * EXAMPLE:
   *   await loginPage.verifyErrorMessage('Epic sadface: Username is required');
   */
  async verifyErrorMessage(expectedMessage: string): Promise<void> {
    this.log.step(`Verifying error message: "${expectedMessage}"`);
    await this.assertTextContains(
      this.errorMessage,
      expectedMessage,
      "Error Message",
    );
    this.log.info("✅ Error message verified.");
  }

  /**
   * Verifies that the login page is displayed correctly.
   * Checks that the logo, input fields, and button are all visible.
   */
  async verifyPageLoaded(): Promise<void> {
    this.log.step("Verifying login page is fully loaded");
    await this.assertVisible(this.pageTitle, "Swag Labs Logo");
    await this.assertVisible(this.usernameInput, "Username Input");
    await this.assertVisible(this.passwordInput, "Password Input");
    await this.assertVisible(this.loginButton, "Login Button");
    this.log.info("✅ Login page fully loaded.");
  }
}
