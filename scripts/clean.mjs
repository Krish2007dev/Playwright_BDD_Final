import { rm } from "node:fs/promises";

await Promise.all(
  ["test-results", "allure-results", "playwright-report", ".features-gen"].map(
    (directory) => rm(directory, { recursive: true, force: true }),
  ),
);
