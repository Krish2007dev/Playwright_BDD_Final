@ui @a11y
Feature: Accessibility checks
  As a product team
  I want accessibility issues to be visible in BDD execution
  So that accessibility regressions are detected early

  @regression
  Scenario: Login page meets the configured accessibility threshold
    Given I am on the SauceDemo login page for accessibility testing
    When I run an accessibility scan
    Then the accessibility issue count should be at most 10
