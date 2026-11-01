import { expect } from '@playwright/test';
import { Given, When, Then } from './ui.fixtures';
import { runAccessibilityCheck } from '../../src/core/utils/performance-helper';

Given('I am on the SauceDemo login page for accessibility testing', async ({ loginPage }) => {
  await loginPage.navigate();
});

When('I run an accessibility scan', async ({ page }) => {
  await runAccessibilityCheck(page);
});

Then(
  'the accessibility issue count should be at most {int}',
  async ({ page }, maximumIssues: number) => {
    const result = await runAccessibilityCheck(page);
    expect(result.totalIssues).toBeLessThanOrEqual(maximumIssues);
  },
);
