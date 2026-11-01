import { Given, When, Then } from "./api.fixtures";
import { expect as apiExpect } from "../../src/api/utils/custom-exptect";
import { ApiClient, ApiResponseData } from "../../src/api/client/ApiClient";
import { validateJsonSchema } from "../../src/api/helpers/JsonSchemaValidator";
import {
  validateBodyContainsKey,
  validateBodyFieldEquals,
  validateResponseTime,
  validateStatus,
} from "../../src/api/helpers/ApiValidator";

let lastResponse: ApiResponseData;

When(
  "I send a GET request to {string}",
  async ({ apiClient }, path: string) => {
    lastResponse = await apiClient.get(path);
  },
);

When(
  "I send a POST request to {string} with body:",
  async ({ apiClient }, path: string, docString: string) => {
    const body = JSON.parse(docString);
    lastResponse = await apiClient.post(path, { body });
  },
);

When(
  "I send a PUT request to {string} with body:",
  async ({ apiClient }, path: string, docString: string) => {
    const body = JSON.parse(docString);
    lastResponse = await apiClient.put(path, { body });
  },
);

When(
  "I send a PATCH request to {string} with body:",
  async ({ apiClient }, path: string, docString: string) => {
    const body = JSON.parse(docString);
    lastResponse = await apiClient.patch(path, { body });
  },
);

When(
  "I send a DELETE request to {string}",
  async ({ apiClient }, path: string) => {
    lastResponse = await apiClient.delete(path);
  },
);

Then(
  "the API response status should be {int}",
  // eslint-disable-next-line no-empty-pattern
  async ({}, expectedStatus: number) => {
    apiExpect(lastResponse.status).shouldEqual(expectedStatus);
    validateStatus(lastResponse, expectedStatus);
  },
);

Then(
  "the API response should contain {string}",
  // eslint-disable-next-line no-empty-pattern
  async ({}, expectedText: string) => {
    validateBodyContainsKey(lastResponse, expectedText);
  },
);

Then(
  "the API response field {string} should equal {int}",
  // eslint-disable-next-line no-empty-pattern
  async ({}, fieldPath: string, expectedValue: number) => {
    const value = fieldPath
      .split(".")
      .reduce<unknown>(
        (current, segment) =>
          typeof current === "object" && current !== null
            ? (current as Record<string, unknown>)[segment]
            : undefined,
        lastResponse.body,
      );
    apiExpect(value).shouldEqual(expectedValue);
    validateBodyFieldEquals(lastResponse, fieldPath, expectedValue);
  },
);

Then(
  "the API response time should be under {int} ms",
  // eslint-disable-next-line no-empty-pattern
  async ({}, maxTime: number) => {
    apiExpect(lastResponse.responseTime).shouldBeLessThanOrEqual(maxTime);
    validateResponseTime(lastResponse, maxTime);
  },
);

Then(
  "the API response should match the JSON schema {string}",
  // eslint-disable-next-line no-empty-pattern
  async ({}, schemaName: string) => {
    validateJsonSchema(schemaName, lastResponse.body);
  },
);
