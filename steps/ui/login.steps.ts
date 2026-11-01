import { Given, When, Then } from "./ui.fixtures";
import { expect } from "@playwright/test";

Given("I am on the SauceDemo login page", async ({ loginPage }) => {
  await loginPage.navigate();
});

Given("I am logged in as a standard user", async ({ loginPage }) => {
  await loginPage.navigate();
  await loginPage.login("standard_user", "secret_sauce");
  await loginPage.verifyLoginSuccess();
});

When("I login with valid credentials", async ({ loginPage }) => {
  await loginPage.login("standard_user", "secret_sauce");
});

When(
  "I login with {string} and {string}",
  async ({ loginPage }, username: string, password: string) => {
    await loginPage.login(username, password);
  },
);

Then("I should be redirected to the inventory page", async ({ loginPage }) => {
  await loginPage.verifyLoginSuccess();
});

Then(
  "I should see the error message {string}",
  async ({ loginPage }, message: string) => {
    await loginPage.verifyErrorMessage(message);
  },
);
