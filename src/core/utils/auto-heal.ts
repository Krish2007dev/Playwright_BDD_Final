import { Page, Locator } from "@playwright/test";
import { Logger } from "./logger";

const log = new Logger("AutoHeal");

export interface AutoHealConfig {
  enabled: boolean;
  timeout: number;
  logWarnings: boolean;
}

const DEFAULT_CONFIG: AutoHealConfig = {
  enabled: true,
  timeout: 5000,
  logWarnings: true,
};

interface HealingStrategy {
  name: string;
  locate: (page: Page, context: ElementContext) => Locator;
}

export interface ElementContext {
  originalSelector: string;
  role?: string;
  text?: string;
  placeholder?: string;
  testId?: string;
}

const HEALING_STRATEGIES: HealingStrategy[] = [
  {
    name: "By Role",
    locate: (page, ctx) => {
      if (!ctx.role) return page.locator("__nonexistent__");
      const options: any = {};
      if (ctx.text) options.name = ctx.text;
      return page.getByRole(ctx.role as any, options);
    },
  },
  {
    name: "By Text (exact)",
    locate: (page, ctx) => {
      if (!ctx.text) return page.locator("__nonexistent__");
      return page.getByText(ctx.text, { exact: true });
    },
  },
  {
    name: "By Placeholder",
    locate: (page, ctx) => {
      if (!ctx.placeholder) return page.locator("__nonexistent__");
      return page.getByPlaceholder(ctx.placeholder);
    },
  },
  {
    name: "By Test ID",
    locate: (page, ctx) => {
      if (!ctx.testId) return page.locator("__nonexistent__");
      return page.getByTestId(ctx.testId);
    },
  },
  {
    name: "By Text (partial)",
    locate: (page, ctx) => {
      if (!ctx.text) return page.locator("__nonexistent__");
      return page.getByText(ctx.text, { exact: false });
    },
  },
];

export async function autoHealLocator(
  page: Page,
  primaryLocator: Locator,
  context: ElementContext,
  config: AutoHealConfig = DEFAULT_CONFIG,
): Promise<Locator> {
  try {
    await primaryLocator.waitFor({ state: "visible", timeout: config.timeout });
    return primaryLocator;
  } catch {
    if (!config.enabled) {
      throw new Error(
        `Element not found: "${context.originalSelector}". Auto-heal is disabled.`,
      );
    }

    if (config.logWarnings) {
      log.warn(
        `Primary locator FAILED: "${context.originalSelector}". Attempting auto-heal...`,
      );
    }
  }

  for (const strategy of HEALING_STRATEGIES) {
    try {
      const alternativeLocator = strategy.locate(page, context);
      await alternativeLocator
        .first()
        .waitFor({ state: "visible", timeout: 2000 });

      if (config.logWarnings) {
        log.warn(
          `✅ Auto-healed! Strategy "${strategy.name}" found the element. ` +
            `Please update locator: "${context.originalSelector}"`,
        );
      }
      return alternativeLocator.first();
    } catch {
      log.debug(`Strategy "${strategy.name}" did not find element.`);
    }
  }

  log.error(
    `❌ Auto-heal FAILED for "${context.originalSelector}". ` +
      `No alternative strategies could find the element.`,
  );
  throw new Error(
    `Auto-heal exhausted all strategies for: "${context.originalSelector}". ` +
      `Element not found on the page.`,
  );
}

export function resilientLocator(
  page: Page,
  selector: string,
  healContext: Omit<ElementContext, "originalSelector">,
): () => Promise<Locator> {
  return () =>
    autoHealLocator(page, page.locator(selector), {
      ...healContext,
      originalSelector: selector,
    });
}
