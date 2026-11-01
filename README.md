# 🚀 PlaywrightBDD Framework

> A comprehensive, beginner-friendly BDD automation framework built with **Playwright**, **Cucumber/Gherkin**, and **TypeScript**. Features **cross-browser parallel execution**, **UI + API testing**, and **4 rich report types** — all in one command.

---

## ✨ Key Features

| Feature | Description |
|---|---|
| 🧪 **BDD / Cucumber** | Write tests in plain English using Gherkin syntax |
| 🏗️ **Page Object Model** | Clean separation of test logic and page interactions |
| 📡 **API Testing** | Full CRUD API testing with dedicated client and validators |
| 🌐 **Cross-Browser** | Runs on **Chromium, Firefox, and WebKit** simultaneously |
| ⚡ **Parallel Execution** | Tests run in parallel across browsers with `fullyParallel: true` |
| 📊 **4 Report Types** | HTML, Allure, Monocart, Custom Dashboard — all in one command |
| 🔧 **Auto-Healing** | Self-healing locators that adapt when the UI changes |
| ⚡ **Performance Metrics** | Page load times, FCP, LCP, resource analysis |
| 🔄 **Auto-Retry** | Failed tests automatically retry with configurable counts |
| 📈 **Observability** | Flaky test detection, metrics aggregation, trend analysis |

---

## 🛠️ Quick Setup

### Prerequisites
- **Node.js** 18+ installed ([download](https://nodejs.org/))
- **npm** (comes with Node.js)

### Installation

```bash
# 1. Clone the repository
git clone <your-repo-url>
cd PlaywrightBDD

# 2. Install all dependencies + browsers
npm run setup

# That's it! You're ready to run tests.
```

---

## 🏃 Running Tests

```bash
# ── Run ALL tests (UI + API, all browsers) ─────────────────────
npm test

# ── Run only UI tests (all 3 browsers) ─────────────────────────
npm run test:ui

# ── Run only API tests (no browser, very fast!) ────────────────
npm run test:api

# ── Run on a specific browser ──────────────────────────────────
npm run test:chrome
npm run test:firefox
npm run test:webkit

# ── Run by tag (smoke = critical tests, regression = full) ─────
npm run test:smoke
npm run test:regression

# ── Debugging modes ────────────────────────────────────────────
npm run test:headed       # Watch the browser as tests run
npm run test:debug        # Step through tests with debugger
npm run test:interactive  # Playwright's visual UI mode
```

---

## 📊 Viewing Reports

After running tests, 5 reports are generated automatically:

```bash
# 🎯 Open ALL 4 reports at once (recommended)
npm run report:all

# Or open individually:
npm run report            # Playwright HTML Report
npm run report:dashboard   # Custom Dashboard (charts, metrics)
npm run report:monocart    # Monocart Report (tree-view)
npm run report:allure      # Allure Report (management dashboards)
npm run report:cucumber    # Cucumber HTML Report (features and scenarios)
```

---

## 🌐 Cross-Browser Parallel Execution

This framework runs tests across **3 browser engines simultaneously** with **parallel workers**:

```
┌─────────────────────────────────────────────────────────────────┐
│                  npm run test:report                            │
│                         │                                       │
│    ┌────────────────────┼────────────────────┐                  │
│    │                    │                    │                  │
│    ▼                    ▼                    ▼                  │
│ ┌──────────┐    ┌──────────┐    ┌──────────┐   ┌───────────┐   │
│ │ Chromium  │    │ Firefox  │    │  WebKit  │   │    API    │   │
│ │ (Chrome)  │    │          │    │ (Safari) │   │ (no       │   │
│ │          │    │          │    │          │   │  browser) │   │
│ │ 13 tests │    │ 13 tests │    │ 13 tests │   │  6 tests  │   │
│ └──────────┘    └──────────┘    └──────────┘   └───────────┘   │
│       │                │              │              │          │
│       └────────────────┴──────────────┴──────────────┘          │
│                         │                                       │
│              ┌──────────┴──────────┐                            │
│              │   4 Workers (CPU)   │                            │
│              │  fullyParallel=true │                            │
│              └─────────────────────┘                            │
│                         │                                       │
│         ┌───────┬───────┴───────┬────────────┐                  │
│         ▼       ▼               ▼            ▼                  │
│     HTML    Dashboard      Monocart      Allure                │
│     Report   Report        Report        Report                │
└─────────────────────────────────────────────────────────────────┘
```

### Configuration (in `playwright.config.ts`)

| Setting | Value | What It Does |
|---|---|---|
| `fullyParallel` | `true` | Tests within the same file run in parallel |
| `workers` | `4` (local), `2` (CI) | Number of parallel threads |
| `retries` | `1` | Failed tests retry once automatically |
| `projects` | Chromium, Firefox, WebKit, API | Each browser runs the full UI suite |

### Run Modes

```bash
npm test                   # All browsers + API in parallel
npm run test:chrome        # Chrome only
npm run test:ui            # All 3 browsers, no API
npm run test:api           # API only, no browser
```

---

## 📁 Project Structure

```
PlaywrightBDD/
│
├── features/                    # 📝 BDD Feature Files (Gherkin)
│   ├── ui/                      #    UI test scenarios
│   │   ├── login.feature        #    Login page tests
│   │   ├── inventory.feature    #    Products page tests
│   │   ├── playwright_docs.feature  # Playwright docs tests
│   │   └── network_intercept.feature # Network mocking tests
│   └── api/                     #    API test scenarios
│       └── reqres_api.feature   #    ReqRes API CRUD tests
│
├── steps/                       # 🔗 Step Definitions
│   ├── ui/                      #    UI step implementations
│   │   ├── ui.fixtures.ts       #    Fixtures for UI tests
│   │   ├── login.steps.ts       #    Login step definitions
│   │   ├── inventory.steps.ts   #    Inventory step definitions
│   │   └── playwright_docs.steps.ts # Docs step definitions
│   └── api/                     #    API step implementations
│       ├── api.fixtures.ts      #    Fixtures for API tests
│       └── api.steps.ts         #    API step definitions
│
├── src/                         # 🏗️ Framework Source Code
│   ├── core/                    #    Core utilities (used by both UI & API)
│   │   ├── config/
│   │   │   ├── env.config.ts    #    Environment configuration
│   │   │   └── test-data.config.ts # Test data management
│   │   └── utils/
│   │       ├── logger.ts        #    Color-coded logging
│   │       ├── auto-heal.ts     #    Self-healing locators
│   │       ├── performance-helper.ts # Performance & a11y metrics
│   │       └── metrics-collector.ts  # Metrics aggregation
│   │
│   ├── ui/                      #    UI-specific code
│   │   └── pages/               #    Page Object Model classes
│   │       ├── BasePage.ts      #    Parent class (common methods)
│   │       ├── LoginPage.ts     #    Login page interactions
│   │       ├── InventoryPage.ts #    Products page interactions
│   │       └── PlaywrightDocsPage.ts # Docs page interactions
│   │
│   ├── api/                     #    API-specific code
│   │   ├── client/
│   │   │   └── ApiClient.ts     #    HTTP request wrapper
│   │   └── helpers/
│   │       └── ApiValidator.ts  #    Response validation helpers
│   │
│   └── reporting/               #    Custom reporting
│       └── custom-reporter.ts   #    HTML dashboard generator
│
├── playwright.config.ts         # ⚙️ Master configuration
├── package.json                 # 📦 Dependencies & scripts
├── tsconfig.json                # 🔧 TypeScript configuration
├── .env                         # 🔐 Environment variables
└── AGENT.md                     # 🤖 AI agent reference guide
```

---

## 🆕 How to Add a New Test

### Adding a UI Test

**Step 1:** Create a feature file in `features/ui/`
```gherkin
# features/ui/my_feature.feature
@ui
Feature: My New Feature
  Scenario: My test case
    Given I am on the login page
    When I do something
    Then I should see the result
```

**Step 2:** Create/reuse a Page Object in `src/ui/pages/`
```typescript
// src/ui/pages/MyPage.ts
import { BasePage } from './BasePage';

export class MyPage extends BasePage {
  constructor(page: Page) {
    super(page, 'MyPage');
  }
  // Add your locators and methods...
}
```

**Step 3:** Add fixtures in `steps/ui/ui.fixtures.ts`

**Step 4:** Create step definitions in `steps/ui/my.steps.ts`

**Step 5:** Run `npm test` — it auto-generates and runs everything!

### Adding an API Test

**Step 1:** Create a feature file in `features/api/`
```gherkin
# features/api/my_api.feature
@api
Feature: My API
  Scenario: Get data
    When I send a GET request to "/my-endpoint"
    Then the API response status should be 200
```

**Step 2:** Run `npm run test:api` — the generic API steps handle it!

---

## 🧰 Available NPM Scripts

| Script | Description |
|---|---|
| `npm test` | Run all tests (UI + API, all browsers, parallel) |
| `npm run test:report` | **Run all tests + open all 4 reports** |
| `npm run test:ui` | Run only UI tests (3 browsers in parallel) |
| `npm run test:api` | Run only API tests |
| `npm run test:chrome` | Run UI tests in Chrome only |
| `npm run test:smoke` | Run smoke tests (@smoke tag) |
| `npm run test:regression` | Run regression tests (@regression tag) |
| `npm run test:headed` | Run with visible browser |
| `npm run test:debug` | Run with Playwright debugger |
| `npm run test:interactive` | Run with Playwright UI mode |
| `npm run report:all` | Open all 4 reports at once |
| `npm run report` | Open Playwright HTML report |
| `npm run report:dashboard` | Open custom dashboard report |
| `npm run report:allure` | Open Allure report |
| `npm run report:cucumber` | Open Cucumber HTML report |
| `npm run clean` | Delete all test output |
| `npm run setup` | Install everything from scratch |

---

## 📖 Further Reading

- **`WALKTHROUGH.md`** — Comprehensive onboarding guide for newcomers
- **`AGENT.md`** — Architecture deep-dive for AI agents and developers
- **`SKILL.md`** — Quick reference for framework patterns and conventions
- Every source file has **extensive inline comments** explaining what it does and why
"# Playwright_BDD_Final" 
