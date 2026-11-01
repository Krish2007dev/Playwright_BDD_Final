import { test as base, createBdd } from "playwright-bdd";
import { ApiClient, ApiResponseData } from "../../src/api/client/ApiClient";
import { ENV_CONFIG } from "../../src/core/config/env.config";
import { captureFailureLogs } from "../../src/core/utils/test-artifacts";
import { APILogger } from "../../src/api/utils/logger";
import { setCustomExpectLogger } from "../../src/api/utils/custom-exptect";
import { RequestHandler } from "../../src/api/utils/request-handler";
import { MySqlDatabase } from "../../src/api/database/MySqlDatabase";
import { MongoDatabase } from "../../src/api/database/MongoDatabase";

type APIWorkerFixtures = {
  mysql: MySqlDatabase;
  mongo: MongoDatabase;
};

type APIFixtures = {
  apiClient: ApiClient;
  apiResponse: ApiResponseData;
  apiLogger: APILogger;
  requestHandler: RequestHandler;
  failureArtifacts: void;
};

export const test = base.extend<APIFixtures, APIWorkerFixtures>({
  failureArtifacts: [
    async ({}, use, testInfo) => {
      await captureFailureLogs(testInfo, use);
    },
    { auto: true },
  ],

  apiClient: async ({ request }, use) => {
    const client = new ApiClient(request, ENV_CONFIG.API_BASE_URL);
    await use(client);
  },

  apiLogger: [
    async ({}, use) => {
      const logger = new APILogger();
      setCustomExpectLogger(logger);
      await use(logger);
    },
    { auto: true },
  ],

  requestHandler: async ({ request, apiLogger }, use) => {
    await use(new RequestHandler(request, ENV_CONFIG.API_BASE_URL, apiLogger));
  },

  mysql: [
    async ({}, use) => {
      const database = new MySqlDatabase();
      await database.connect();
      try {
        await use(database);
      } finally {
        await database.close();
      }
    },
    { scope: "worker" },
  ],

  mongo: [
    async ({}, use) => {
      const database = new MongoDatabase();
      await database.connect();
      try {
        await use(database);
      } finally {
        await database.close();
      }
    },
    { scope: "worker" },
  ],

  // eslint-disable-next-line no-empty-pattern
  apiResponse: async ({}, use) => {
    const response: ApiResponseData = {
      status: 0,
      statusText: "",
      body: null,
      rawBody: "",
      headers: {},
      responseTime: 0,
      url: "",
      method: "",
    };
    await use(response);
  },
});

export const { Given, When, Then } = createBdd(test);
