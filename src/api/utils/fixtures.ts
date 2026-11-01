import { test as base } from "@playwright/test";
import { RequestHandler } from "../utils/request-handler";
import { APILogger } from "./logger";
import { setCustomExpectLogger } from "./custom-exptect";
import { ENV_CONFIG } from "../../core/config/env.config";

export type TestOptions = {
  api: RequestHandler;
  config: typeof ENV_CONFIG;
};

export type WorkerFixture = {
  authToken: string;
};

export const test = base.extend<TestOptions, WorkerFixture>({
  authToken: [
    async ({}, use) => {
      await use("");
    },
    { scope: "worker" },
  ],

  api: async ({ request, authToken }, use) => {
    const logger = new APILogger();
    setCustomExpectLogger(logger);
    const requestHandler = new RequestHandler(
      request,
      ENV_CONFIG.API_BASE_URL,
      logger,
      authToken,
    );
    await use(requestHandler);
  },
  config: async ({}, use) => {
    await use(ENV_CONFIG);
  },
});
