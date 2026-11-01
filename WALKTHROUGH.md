# 🎓 PlaywrightBDD Framework — Onboarding Guide

> **Welcome, new team member!** This guide walks you through every file in this project. By the end, you'll understand the entire framework and be able to write your own test cases confidently.

---

## Table of Contents

1. [What Is This Project?](#1-what-is-this-project)
2. [The Big Picture — How Tests Flow](#2-the-big-picture--how-tests-flow)
3. [Getting Started (Setup)](#3-getting-started-setup)
4. [Project Structure at a Glance](#4-project-structure-at-a-glance)
5. [Root Configuration Files](#5-root-configuration-files)
6. [Feature Files — Writing Test Scenarios](#6-feature-files--writing-test-scenarios)
7. [Step Definitions — Connecting Words to Actions](#7-step-definitions--connecting-words-to-actions)
8. [Fixtures — The Setup Crew](#8-fixtures--the-setup-crew)
9. [Page Objects — Your UI Interaction Layer](#9-page-objects--your-ui-interaction-layer)
10. [API Testing Layer](#10-api-testing-layer)
11. [Core Utilities](#11-core-utilities)
12. [Reporting](#12-reporting)
13. [How to Write Your First UI Test (Step-by-Step)](#13-how-to-write-your-first-ui-test-step-by-step)
14. [How to Write Your First API Test (Step-by-Step)](#14-how-to-write-your-first-api-test-step-by-step)
15. [Running Tests](#15-running-tests)
16. [FAQ & Troubleshooting](#16-faq--troubleshooting)

---

## 1. What Is This Project?

This is a **test automation framework** — software that automatically tests other software. It combines three technologies:

| Technology       | What It Does                           | Analogy                                        |
| ---------------- | -------------------------------------- | ---------------------------------------------- |
| **Playwright**   | Controls web browsers programmatically | A robot that clicks buttons and reads pages    |
| **Cucumber/BDD** | Lets you write tests in plain English  | Writing a recipe instead of chemistry formulas |
| **TypeScript**   | The programming language used          | The language the robot understands             |

### Why BDD (Behavior-Driven Development)?

Instead of writing technical test code like:

```typescript
// Hard to read — only developers understand this
await page.locator("#login-btn").click();
assert(page.url()).contains("/dashboard");
```

With BDD, tests read like plain English:

```gherkin
When I click the login button
Then I should be on the dashboard
```

**Anyone** — developers, testers, product managers — can read and write these tests.

---

## 2. The Big Picture — How Tests Flow

Here's how a test goes from English words to browser actions:

```
╔══════════════════════════════════════════════════════════════╗
║ You write this (plain English):                              ║
║                                                              ║
║   Feature: Login                                             ║
║     Scenario: Successful login                               ║
║       Given I am on the login page                           ║
║       When I login with "user" and "password"                ║
║       Then I should see the products page                    ║
╚══════════════════╤═══════════════════════════════════════════╝
                   │
                   ▼
╔══════════════════════════════════════════════════════════════╗
║ Step definitions translate English → code:                   ║
║                                                              ║
║   Given('I am on the login page', async ({ loginPage }) => { ║
║     await loginPage.navigate();                              ║
║   });                                                        ║
╚══════════════════╤═══════════════════════════════════════════╝
                   │
                   ▼
╔══════════════════════════════════════════════════════════════╗
║ Page objects do the actual browser work:                     ║
║                                                              ║
║   class LoginPage {                                          ║
║     async navigate() {                                       ║
║       await this.page.goto('https://www.saucedemo.com');     ║
║     }                                                        ║
║   }                                                          ║
╚══════════════════════════════════════════════════════════════╝
```

**Three layers, each with a clear job:**

| Layer                | File Location   | Responsibility                           |
| -------------------- | --------------- | ---------------------------------------- |
| **Feature files**    | `features/`     | WHAT to test (plain English)             |
| **Step definitions** | `steps/`        | HOW to connect English to code           |
| **Page objects**     | `src/ui/pages/` | WHERE to find and interact with elements |

---

## 3. Getting Started (Setup)

```bash
# 1. Install all dependencies (Node.js packages + browser binaries)
npm run setup

# 2. Run all tests and open all 4 reports
npm run test:report

# 3. Or just run tests without reports
npm test
```

**Prerequisites:**

- Node.js v18+ installed
- A terminal (Terminal.app, iTerm, VS Code terminal)

---

## 4. Project Structure at a Glance

```
PlaywrightBDD/
│
├── 📄 package.json              ← Project identity + npm scripts
├── 📄 playwright.config.ts      ← Master test configuration
├── 📄 tsconfig.json             ← TypeScript compiler settings
├── 📄 .env                      ← Environment variables (URLs, timeouts)
├── 📄 .gitignore                ← Files Git should ignore
│
├── 📁 features/                 ← 🧪 TEST SCENARIOS (plain English)
│   ├── 📁 api/                  ← API test scenarios
│   │   └── reqres_api.feature
│   └── 📁 ui/                   ← UI test scenarios
│       ├── inventory.feature
│       ├── login.feature
│       ├── network_intercept.feature
│       └── playwright_docs.feature
│
├── 📁 steps/                    ← 🔗 STEP DEFINITIONS (English → Code)
│   ├── 📁 api/
│   │   ├── api.fixtures.ts      ← API test setup
│   │   └── api.steps.ts         ← API step translations
│   └── 📁 ui/
│       ├── ui.fixtures.ts       ← UI test setup
│       ├── login.steps.ts       ← Login step translations
│       ├── inventory.steps.ts   ← Inventory step translations
│       └── playwright_docs.steps.ts
│
├── 📁 src/                      ← 🏗️ SOURCE CODE (the engine)
│   ├── 📁 api/
│   │   ├── client/ApiClient.ts      ← HTTP request maker
│   │   └── helpers/ApiValidator.ts   ← Response checker
│   ├── 📁 core/
│   │   ├── config/env.config.ts          ← Environment settings reader
│   │   ├── config/test-data.config.ts    ← Centralized test data
│   │   └── utils/                        ← Logger, auto-heal, metrics
│   ├── 📁 ui/pages/                      ← Page Object classes
│   │   ├── BasePage.ts                   ← Shared page behavior
│   │   ├── LoginPage.ts
│   │   ├── InventoryPage.ts
│   │   └── PlaywrightDocsPage.ts
│   └── 📁 reporting/
│       └── custom-reporter.ts            ← Dashboard report generator
│
├── 📁 .features-gen/            ← ⚙️ Auto-generated (DO NOT EDIT)
├── 📁 playwright-report/        ← 📊 HTML report output
├── 📁 test-results/             ← 📊 Other reports output
└── 📁 allure-results/           ← 📊 Allure data output
```

---

## 5. Root Configuration Files

### 📄 `package.json` — The Project ID Card

**Why it exists:** Every Node.js project has one. It defines the project name, dependencies, and runnable scripts.

**What matters to you:**

```json
{
  "name": "playwright-bdd-framework",
  "scripts": {
    "test": "...", // Runs all tests
    "test:report": "...", // Runs tests + opens all 4 reports
    "test:ui": "...", // Runs only UI tests
    "test:api": "...", // Runs only API tests
    "test:smoke": "...", // Runs only @smoke tagged tests
    "test:headed": "...", // Runs tests with visible browser
    "report:all": "...", // Opens all 4 reports
    "clean": "...", // Deletes all test outputs
    "setup": "..." // Installs everything from scratch
  }
}
```

**When to edit:** When adding new npm scripts or installing new libraries.

---

### 📄 `playwright.config.ts` — The Master Control Panel

**Why it exists:** This is the single most important configuration file. Playwright reads it to know:

- Which browsers to test in
- Where to find test files
- What reporters to use
- Timeouts, retries, and parallelism

**Key sections explained:**

```typescript
// SECTION 1: Global settings
export default defineConfig({
  timeout: 60_000,           // Each test gets 60 seconds max
  retries: 1,                // Retry failed tests once
  workers: 4,                // Run 4 tests in parallel

  // SECTION 2: Reporters — generate 4 different report types
  reporter: [
    ['html'],                             // 1. Playwright HTML report
    ['allure-playwright'],                // 2. Allure data collector
    ['monocart-reporter', { ... }],       // 3. Monocart visual report
    ['./src/reporting/custom-reporter.ts'], // 4. Custom dashboard
  ],

  // SECTION 3: Projects — separate configs for each browser + API
  projects: [
    // UI tests run in Chromium, Firefox, and WebKit
    defineBddProject({ name: 'chromium', ... }),
    defineBddProject({ name: 'firefox', ... }),
    defineBddProject({ name: 'webkit', ... }),
    // API tests run without a browser
    defineBddProject({ name: 'api', ... }),
  ],
});
```

**When to edit:** When adding a new application to test, changing browsers, adding reporters, or adjusting timeouts.

---

### 📄 `tsconfig.json` — TypeScript Settings

**Why it exists:** Tells the TypeScript compiler how to process `.ts` files. Defines path shortcuts so you can write cleaner imports.

**Key feature — Path aliases:**

```json
{
  "paths": {
    "@core/*": ["./src/core/*"],
    "@ui/*": ["./src/ui/*"],
    "@api/*": ["./src/api/*"]
  }
}
```

This lets you write `import { Logger } from '@core/utils/logger'` instead of `import { Logger } from '../../../src/core/utils/logger'`.

**When to edit:** Rarely. Only if you add new top-level source directories.

---

### 📄 `.env` — Environment Variables

**Why it exists:** Separates configuration from code. Different environments (dev, staging, production) just need different `.env` files.

```env
# URLs — Change these to point to YOUR application
UI_BASE_URL=https://www.saucedemo.com
API_BASE_URL=https://jsonplaceholder.typicode.com

# Browser settings
HEADLESS=true               # false = see the browser window
DEFAULT_TIMEOUT=30000       # 30 seconds for each action

# Test execution
RETRY_COUNT=1               # How many times to retry failures
WORKERS=4                   # Parallel test threads
```

**When to edit:** When switching environments, changing timeouts, or pointing to a different application URL.

---

### 📄 `.gitignore` — Git's Ignore List

**Why it exists:** Tells Git which files should NOT be committed to version control. Test outputs (`test-results/`, `allure-results/`) and dependencies (`node_modules/`) are generated and should not be stored in Git.

**When to edit:** When you add new generated files/directories that shouldn't be tracked.

---

## 6. Feature Files — Writing Test Scenarios

**Location:** `features/`

Feature files are written in **Gherkin**, a plain-English syntax. They are the heart of BDD.

### 📄 `features/ui/login.feature` — Login Tests

**Purpose:** Tests the login functionality of the SauceDemo application.

```gherkin
@ui @smoke
Feature: Login Functionality
  As a user
  I want to log in to the application
  So that I can access the inventory

  Scenario: Successful login with standard user
    Given I am on the login page
    When I login with "standard_user" and "secret_sauce"
    Then I should see the inventory page

  Scenario Outline: Failed login with invalid credentials
    Given I am on the login page
    When I login with "<username>" and "<password>"
    Then I should see error message containing "<error_message>"

    Examples:
      | username      | password     | error_message              |
      | locked_out    | secret_sauce | locked out                 |
      | invalid_user  | wrong_pass   | do not match               |
```

**Gherkin keywords explained:**

| Keyword             | Meaning                                                | Example                                  |
| ------------------- | ------------------------------------------------------ | ---------------------------------------- |
| `Feature:`          | A group of related scenarios                           | "Login Functionality"                    |
| `Scenario:`         | One specific test case                                 | "Successful login"                       |
| `Scenario Outline:` | A template test run multiple times with different data | Data-driven login tests                  |
| `Examples:`         | The data table for a Scenario Outline                  | Different username/password combinations |
| `Given`             | The starting state (precondition)                      | "I am on the login page"                 |
| `When`              | The action being performed                             | "I login with ..."                       |
| `Then`              | The expected outcome (assertion)                       | "I should see the inventory page"        |
| `And`               | Continues the previous keyword                         | "And I should see welcome message"       |
| `@tag`              | Labels for organizing/filtering tests                  | `@smoke`, `@regression`, `@ui`           |

### 📄 `features/ui/inventory.feature` — Product Inventory Tests

**Purpose:** Tests the product listing page — adding items to cart, sorting products, verifying product display.

### 📄 `features/ui/playwright_docs.feature` — External Site Tests

**Purpose:** Tests the Playwright documentation website — navigating, searching. Demonstrates testing third-party sites.

### 📄 `features/ui/network_intercept.feature` — Mocking Network Requests

**Purpose:** Demonstrates a powerful Playwright feature — intercepting and faking API responses. This lets you test frontend behavior without depending on a real backend.

### 📄 `features/api/reqres_api.feature` — API Tests

**Purpose:** Tests REST API endpoints directly (no browser needed). Covers CRUD operations: Create, Read, Update, Delete.

```gherkin
@api @smoke
Feature: REST API CRUD Operations
  Scenario: Get list of users
    When I send a GET request to "/users"
    Then the API response status should be 200

  Scenario: Create a new post
    When I send a POST request to "/posts" with body:
      """json
      { "title": "My Post", "body": "Content", "userId": 1 }
      """
    Then the API response status should be 201
```

---

## 7. Step Definitions — Connecting Words to Actions

**Location:** `steps/`

Step definitions are the **translation layer**. They take each line from a feature file and execute actual code.

### 📄 `steps/ui/login.steps.ts` — Login Step Translations

**Purpose:** Translates login feature file sentences into browser actions.

```typescript
import { Given, When, Then } from "./ui.fixtures";
import { expect } from "@playwright/test";

// When the feature file says "Given I am on the login page"
// ...this code runs:
Given("I am on the login page", async ({ loginPage }) => {
  await loginPage.navigate();
  //    ^^^^^^^^^ This is a "fixture" (explained in next section)
  //              It's a pre-built LoginPage object ready to use
});

// When the feature file says 'When I login with "user" and "pass"'
// ...this code runs:
When(
  "I login with {string} and {string}",
  //             ^^^^^^^^    ^^^^^^^^ These capture the quoted values
  async ({ loginPage }, username: string, password: string) => {
    await loginPage.login(username, password);
  },
);

// When the feature file says "Then I should see the inventory page"
// ...this code runs:
Then("I should see the inventory page", async ({ page }) => {
  await expect(page).toHaveURL(/inventory/);
  // Asserts that the current URL contains "inventory"
});
```

**Key concepts:**

- `{string}` captures text in double quotes from the feature file
- `{int}` captures a number
- The first argument `{ loginPage, page }` contains fixtures (injected automatically)
- `async/await` is used because browser actions take time

### 📄 `steps/ui/inventory.steps.ts` — Inventory Step Translations

**Purpose:** Translates inventory/product-related feature sentences into actions like adding to cart, sorting, etc.

### 📄 `steps/ui/playwright_docs.steps.ts` — Docs Site Step Translations

**Purpose:** Translates documentation site actions — navigating, searching, intercepting search API calls.

### 📄 `steps/api/api.steps.ts` — Generic API Step Translations

**Purpose:** Provides **reusable** API testing steps that work with ANY REST API. You don't need to write new step definitions for each API endpoint — these are generic.

```typescript
// Works for ANY URL — just change the path in the feature file
When("I send a GET request to {string}", async ({ apiClient }, url: string) => {
  lastResponse = await apiClient.get(url);
});

When(
  "I send a POST request to {string} with body:",
  async ({ apiClient }, url: string, body: string) => {
    lastResponse = await apiClient.post(url, JSON.parse(body));
  },
);

// Works for ANY status code
Then(
  "the API response status should be {int}",
  async ({}, expectedStatus: number) => {
    expect(lastResponse.status).toBe(expectedStatus);
  },
);
```

---

## 8. Fixtures — The Setup Crew

**Location:** `steps/ui/ui.fixtures.ts` and `steps/api/api.fixtures.ts`

### What Are Fixtures?

Fixtures are **pre-built objects** that get automatically created before each test and cleaned up after. Think of them as lab equipment that appears on your desk before each experiment.

### 📄 `steps/ui/ui.fixtures.ts` — UI Test Setup

**Purpose:** Creates page objects and makes them available to step definitions.

```typescript
import { test as base, createBdd } from "playwright-bdd";
import { LoginPage } from "../../src/ui/pages/LoginPage";
import { InventoryPage } from "../../src/ui/pages/InventoryPage";

// Define what fixtures are available
type TestFixtures = {
  loginPage: LoginPage;
  inventoryPage: InventoryPage;
  playwrightPage: PlaywrightDocsPage;
};

// Create the fixtures — Playwright calls these automatically
const test = base.extend<TestFixtures>({
  loginPage: async ({ page }, use) => {
    await use(new LoginPage(page));
    // Playwright creates a LoginPage, gives it to your test,
    // then cleans it up when the test finishes
  },
  inventoryPage: async ({ page }, use) => {
    await use(new InventoryPage(page));
  },
});

// Export Given/When/Then that know about our fixtures
export const { Given, When, Then } = createBdd(test);
```

**Why fixtures matter:** Without fixtures, you'd have to manually create page objects in every test. Fixtures do it automatically.

### 📄 `steps/api/api.fixtures.ts` — API Test Setup

**Purpose:** Creates an `ApiClient` instance for each API test. The API client handles making HTTP requests.

```typescript
const test = base.extend<{ apiClient: ApiClient }>({
  apiClient: async ({ request }, use) => {
    await use(new ApiClient(request));
    // 'request' is Playwright's built-in HTTP client
    // ApiClient wraps it with logging, timing, and error handling
  },
});
```

---

## 9. Page Objects — Your UI Interaction Layer

**Location:** `src/ui/pages/`

Page Objects encapsulate all interactions with a specific page of your application. This is the **Page Object Model (POM)** pattern — one of the most important patterns in test automation.

### Why Page Objects?

Without Page Objects, if a button's CSS selector changes, you'd have to update **every test** that uses that button. With Page Objects, you update it in **one place**.

### 📄 `src/ui/pages/BasePage.ts` — The Parent Class

**Purpose:** Contains shared behavior that ALL page objects need — navigation, clicking, typing, waiting. Every other page object **extends** this class to inherit these abilities.

```typescript
export class BasePage {
  protected page: Page;
  protected log: Logger;

  constructor(page: Page, pageName: string) {
    this.page = page;
    this.log = new Logger(pageName);
  }

  // Navigate to a URL — all pages can do this
  async navigateTo(url: string): Promise<void> { ... }

  // Click any element with logging
  async click(locator: Locator, name: string): Promise<void> { ... }

  // Fill any input field with logging
  async fill(locator: Locator, value: string, name: string): Promise<void> { ... }

  // Get text from any element
  async getText(locator: Locator): Promise<string> { ... }
}
```

**When to edit:** When you want to add a new shared ability (like drag-and-drop, file upload) that multiple pages need.

### 📄 `src/ui/pages/LoginPage.ts` — Login Page

**Purpose:** Knows everything about the login page — where the username field is, where the password field is, how to click login.

```typescript
export class LoginPage extends BasePage {
  // Locators — WHERE things are on the page
  readonly usernameInput: Locator;
  readonly passwordInput: Locator;
  readonly loginButton: Locator;
  readonly errorMessage: Locator;

  constructor(page: Page) {
    super(page, "LoginPage");
    // Define WHERE each element is using Playwright's locator API
    this.usernameInput = page.getByPlaceholder("Username");
    this.passwordInput = page.getByPlaceholder("Password");
    this.loginButton = page.getByRole("button", { name: "Login" });
    this.errorMessage = page.locator('[data-test="error"]');
  }

  // Actions — WHAT you can do on this page
  async navigate(): Promise<void> {
    await this.navigateTo("https://www.saucedemo.com");
  }

  async login(username: string, password: string): Promise<void> {
    await this.fill(this.usernameInput, username, "Username");
    await this.fill(this.passwordInput, password, "Password");
    await this.click(this.loginButton, "Login button");
  }

  async getErrorMessage(): Promise<string> {
    return this.getText(this.errorMessage);
  }
}
```

**The pattern:** Each page object has:

1. **Locators** (defined in constructor) — WHERE elements are
2. **Action methods** — WHAT you can do (click, fill, navigate)
3. **Verification methods** — HOW to check results (get error text, check visibility)

### 📄 `src/ui/pages/InventoryPage.ts` — Product Listing Page

**Purpose:** Interacts with the products/inventory page — adding items to cart, sorting, reading product names and prices.

### 📄 `src/ui/pages/PlaywrightDocsPage.ts` — External Documentation Site

**Purpose:** Interacts with the Playwright docs website — searching, navigating, intercepting network requests. Demonstrates that page objects work for ANY website, not just your own.

---

## 10. API Testing Layer

**Location:** `src/api/`

### 📄 `src/api/client/ApiClient.ts` — The HTTP Client

**Purpose:** A wrapper around Playwright's HTTP request API. It adds logging, timing, and error handling to every request.

```typescript
export class ApiClient {
  // Makes a GET request to any URL
  async get(url: string): Promise<ApiResponseData> { ... }

  // Makes a POST request with a JSON body
  async post(url: string, body: object): Promise<ApiResponseData> { ... }

  // Makes a PUT request to update a resource
  async put(url: string, body: object): Promise<ApiResponseData> { ... }

  // Makes a DELETE request
  async delete(url: string): Promise<ApiResponseData> { ... }
}
```

**Why a wrapper?** Raw HTTP requests don't log anything. `ApiClient` automatically logs:

- The URL being requested
- The response status code
- How long the request took
- The response body (for debugging)

### 📄 `src/api/helpers/ApiValidator.ts` — Response Assertions

**Purpose:** Helper functions for validating API responses — checking status codes, verifying response body contains expected data.

---

## 11. Core Utilities

**Location:** `src/core/`

### 📄 `src/core/config/env.config.ts` — Environment Reader

**Purpose:** Reads the `.env` file and provides typed configuration values with sensible defaults.

```typescript
// Instead of:  process.env.DEFAULT_TIMEOUT || '30000'  (everywhere)
// You write:   ENV_CONFIG.DEFAULT_TIMEOUT               (one import)
```

**Why it exists:** Centralizes all environment configuration. If you need a new setting, add it here once and use it everywhere.

### 📄 `src/core/config/test-data.config.ts` — Centralized Test Data

**Purpose:** Stores test data constants — API endpoints, request bodies, test credentials, status codes. Keeps test data out of test code.

```typescript
export const TEST_CREDENTIALS = {
  standard: { username: "standard_user", password: "secret_sauce" },
  locked: { username: "locked_out_user", password: "secret_sauce" },
};

export const API_ENDPOINTS = {
  users: { list: "/users", single: (id: number) => `/users/${id}` },
  posts: { list: "/posts", create: "/posts" },
};
```

### 📄 `src/core/utils/logger.ts` — Colored Logger

**Purpose:** Provides structured, color-coded console output so you can see exactly what each test is doing.

```
[12:34:56] [INFO] [LoginPage] 🔗 Navigating to https://www.saucedemo.com
[12:34:57] [INFO] [LoginPage] ✍️  Filling Username: standard_user
[12:34:57] [INFO] [LoginPage] 🖱️  Clicking Login button
```

### 📄 `src/core/utils/auto-heal.ts` — Self-Healing Locators

**Purpose:** If a locator fails (e.g., a button ID changed), it automatically tries alternative locator strategies before giving up. This makes tests more resilient to minor UI changes.

### 📄 `src/core/utils/metrics-collector.ts` — Test Metrics

**Purpose:** Collects performance metrics (page load time, response times) and test outcomes for reporting.

### 📄 `src/core/utils/performance-helper.ts` — Web Performance

**Purpose:** Captures Web Vitals (LCP, FCP, CLS) and page load timing data.

---

## 12. Reporting

### 📄 `src/reporting/custom-reporter.ts` — Dashboard Report Generator

**Purpose:** A custom Playwright reporter that generates a beautiful dark-themed HTML dashboard with:

- Pass rate gauge
- Pie chart of results distribution
- Bar chart of results by browser
- Test duration chart
- Detailed results table

This file implements the Playwright `Reporter` interface, which means Playwright calls its methods automatically during test execution.

### Report Locations After Running Tests

| Report               | Description                  | How to Open                                |
| -------------------- | ---------------------------- | ------------------------------------------ |
| **Playwright HTML**  | Standard detailed report     | `npx playwright show-report`               |
| **Custom Dashboard** | Dark-themed visual dashboard | `open test-results/reports/dashboard.html` |
| **Monocart**         | Tree-view with charts        | `open test-results/monocart/report.html`   |
| **Allure**           | Industry-standard report     | `npx allure open allure-report`            |

Or just run **`npm run report:all`** to open all 4 at once.

---

## 13. How to Write Your First UI Test (Step-by-Step)

Let's say you want to test a "Sign Up" page. Here's exactly what to do:

### Step 1: Create the Page Object

```typescript
// src/ui/pages/SignUpPage.ts
import { Page, Locator } from "@playwright/test";
import { BasePage } from "./BasePage";

export class SignUpPage extends BasePage {
  readonly nameInput: Locator;
  readonly emailInput: Locator;
  readonly passwordInput: Locator;
  readonly signUpButton: Locator;
  readonly successMessage: Locator;

  constructor(page: Page) {
    super(page, "SignUpPage");
    this.nameInput = page.getByLabel("Full Name");
    this.emailInput = page.getByLabel("Email");
    this.passwordInput = page.getByLabel("Password");
    this.signUpButton = page.getByRole("button", { name: "Sign Up" });
    this.successMessage = page.getByText("Account created successfully");
  }

  async navigate(): Promise<void> {
    await this.navigateTo("https://your-app.com/signup");
  }

  async fillForm(name: string, email: string, password: string): Promise<void> {
    await this.fill(this.nameInput, name, "Name");
    await this.fill(this.emailInput, email, "Email");
    await this.fill(this.passwordInput, password, "Password");
  }

  async submit(): Promise<void> {
    await this.click(this.signUpButton, "Sign Up button");
  }
}
```

### Step 2: Register the Fixture

Open `steps/ui/ui.fixtures.ts` and add:

```typescript
import { SignUpPage } from "../../src/ui/pages/SignUpPage";

// Add to the TestFixtures type:
type TestFixtures = {
  loginPage: LoginPage;
  inventoryPage: InventoryPage;
  playwrightPage: PlaywrightDocsPage;
  signUpPage: SignUpPage; // ← ADD THIS
};

// Add to the test.extend block:
const test = base.extend<TestFixtures>({
  // ...existing fixtures...
  signUpPage: async ({ page }, use) => {
    // ← ADD THIS
    await use(new SignUpPage(page));
  },
});
```

### Step 3: Write the Feature File

```gherkin
# features/ui/signup.feature
@ui @smoke
Feature: User Registration
  As a new visitor
  I want to create an account
  So that I can access the platform

  Scenario: Successful registration
    Given I am on the sign up page
    When I register with name "John Doe" email "john@test.com" and password "Pass123!"
    And I click the sign up button
    Then I should see a success message

  Scenario: Registration with missing email
    Given I am on the sign up page
    When I register with name "Jane Doe" email "" and password "Pass123!"
    And I click the sign up button
    Then I should see an error about the email field
```

### Step 4: Write Step Definitions

```typescript
// steps/ui/signup.steps.ts
import { Given, When, Then } from "./ui.fixtures";
import { expect } from "@playwright/test";

Given("I am on the sign up page", async ({ signUpPage }) => {
  await signUpPage.navigate();
});

When(
  "I register with name {string} email {string} and password {string}",
  async ({ signUpPage }, name: string, email: string, password: string) => {
    await signUpPage.fillForm(name, email, password);
  },
);

When("I click the sign up button", async ({ signUpPage }) => {
  await signUpPage.submit();
});

Then("I should see a success message", async ({ signUpPage }) => {
  await expect(signUpPage.successMessage).toBeVisible();
});
```

### Step 5: Generate & Run

```bash
npx bddgen              # Generate test stubs from feature files
npx playwright test --project=chromium   # Run on Chrome
```

---

## 14. How to Write Your First API Test (Step-by-Step)

API tests are **even simpler** — you usually don't need new step definitions because the generic ones handle everything.

### Step 1: Write the Feature File

```gherkin
# features/api/my_api.feature
@api
Feature: My Application API
  Scenario: Get all products
    When I send a GET request to "/products"
    Then the API response status should be 200
    And the API response should contain "name"

  Scenario: Create a product
    When I send a POST request to "/products" with body:
      """json
      {
        "name": "Widget",
        "price": 29.99,
        "category": "Tools"
      }
      """
    Then the API response status should be 201
    And the API response field "name" should equal "Widget"
```

### Step 2: That's It!

The generic steps in `steps/api/api.steps.ts` already handle:

- `I send a GET request to {string}`
- `I send a POST request to {string} with body:`
- `I send a PUT request to {string} with body:`
- `I send a DELETE request to {string}`
- `the API response status should be {int}`
- `the API response should contain {string}`
- `the API response field {string} should equal {}`

Just change the URL in `.env` if needed:

```env
API_BASE_URL=https://your-api.example.com
```

---

## 15. Running Tests

| Command               | What It Does                                  |
| --------------------- | --------------------------------------------- |
| `npm test`            | Run ALL tests (all browsers + API)            |
| `npm run test:report` | Run all tests + open all 4 reports            |
| `npm run test:ui`     | Run only UI tests (all browsers)              |
| `npm run test:api`    | Run only API tests                            |
| `npm run test:chrome` | Run UI tests on Chrome only                   |
| `npm run test:smoke`  | Run only `@smoke` tagged tests                |
| `npm run test:headed` | Run with visible browser                      |
| `npm run test:debug`  | Run with Playwright Inspector (step through)  |
| `npm run report:all`  | Open all 4 reports (without re-running tests) |
| `npm run clean`       | Delete all generated test outputs             |

---

## 16. FAQ & Troubleshooting

### "I added a feature file but tests don't run"

→ Run `npx bddgen` first. This generates Playwright test files from your feature files.

### "Element not found / Timeout"

→ Check your locator in the Page Object. Use `npx playwright codegen https://your-site.com` to auto-generate locators by clicking on elements.

### "Which locator strategy should I use?"

Use this priority:

1. `getByRole('button', { name: 'Submit' })` — **best**, works like a user
2. `getByLabel('Email')` — great for form fields
3. `getByPlaceholder('Enter email')` — for placeholder text
4. `getByText('Welcome')` — for visible text
5. `getByTestId('submit-btn')` — for data-testid attributes
6. `locator('.css-class')` — **last resort**

### "Tests pass locally but fail in CI"

→ Set `HEADLESS=true` in CI environment. Make sure `npx playwright install --with-deps` runs in CI.

### "How do I test only my changes?"

→ Tag your scenario with `@wip`, then run: `npx playwright test --grep "@wip"`

### "How do I see what the browser is doing?"

→ Run `npm run test:headed` (visible browser) or `npm run test:debug` (step-by-step with inspector).

### "My API test gets 403/Forbidden"

→ The API may require authentication. Add auth headers in `ApiClient.ts` or check if the API is behind Cloudflare/CAPTCHA.

---

> **You made it!** 🎉 You now understand every file in this project. Start by reading existing feature files, then try writing one of your own. The patterns you see repeated in this codebase are the same patterns used in every real-world Playwright BDD project.
