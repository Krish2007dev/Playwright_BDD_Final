import * as fs from "fs";
import * as path from "path";
import { Logger } from "./logger";
import { PerformanceMetrics, AccessibilityResult } from "./performance-helper";

const log = new Logger("MetricsCollector");

export interface TestResult {
  name: string;
  feature: string;
  status: "passed" | "failed" | "skipped";
  duration: number;
  errorMessage?: string;
  tags: string[];
  browser: string;
  wasRetried: boolean;
  autoHealCount: number;
}

export interface MetricsSummary {
  runStartTime: string;
  runEndTime: string;
  totalDuration: number;

  totalTests: number;
  passed: number;
  failed: number;
  skipped: number;
  passRate: number;

  averageDuration: number;
  slowestTest: { name: string; duration: number } | null;
  fastestTest: { name: string; duration: number } | null;

  flakyTests: number;
  totalAutoHeals: number;

  avgPageLoadTime: number | null;
  avgApiResponseTime: number | null;
  databaseMetrics: DatabaseMetrics;
  performanceData: PerformanceMetrics[];
  accessibilityData: AccessibilityResult[];

  byFeature: Record<
    string,
    { passed: number; failed: number; skipped: number }
  >;
  byBrowser: Record<
    string,
    { passed: number; failed: number; skipped: number }
  >;
  byTag: Record<string, { passed: number; failed: number; skipped: number }>;

  failedTests: Array<{ name: string; feature: string; error: string }>;
}

export interface DatabaseMetrics {
  totalOperations: number;
  successfulOperations: number;
  failedOperations: number;
  averageDuration: number | null;
  byDatabase: Record<
    string,
    {
      operations: number;
      successful: number;
      failed: number;
      averageDuration: number;
    }
  >;
}

export class MetricsCollector {
  private static instance: MetricsCollector;

  private results: TestResult[] = [];

  private performanceData: PerformanceMetrics[] = [];

  private accessibilityData: AccessibilityResult[] = [];

  private apiResponseTimes: number[] = [];

  private databaseOperations: Array<{
    database: "mysql" | "mongodb";
    duration: number;
    success: boolean;
  }> = [];

  private runStartTime: Date;

  private constructor() {
    this.runStartTime = new Date();
    log.info("MetricsCollector initialized — tracking test execution metrics");
  }

  static getInstance(): MetricsCollector {
    if (!MetricsCollector.instance) {
      MetricsCollector.instance = new MetricsCollector();
    }
    return MetricsCollector.instance;
  }

  addTestResult(result: TestResult): void {
    this.results.push(result);
    log.debug(
      `Recorded result: ${result.status.toUpperCase()} — ${result.name}`,
    );
  }

  /** Records performance metrics from a page. */
  addPerformanceMetrics(metrics: PerformanceMetrics): void {
    this.performanceData.push(metrics);
  }

  /** Records an accessibility scan result. */
  addAccessibilityResult(result: AccessibilityResult): void {
    this.accessibilityData.push(result);
  }

  /** Records an API response time (in ms). */
  addApiResponseTime(duration: number): void {
    this.apiResponseTimes.push(duration);
  }

  addDatabaseOperation(
    database: "mysql" | "mongodb",
    duration: number,
    success: boolean,
  ): void {
    this.databaseOperations.push({ database, duration, success });
  }

  /**
   * Generates the final aggregated summary from all collected data.
   * Call this AFTER all tests have finished.
   *
   * @returns A MetricsSummary object with all the aggregated data
   */
  generateSummary(): MetricsSummary {
    const runEndTime = new Date();
    const totalDuration = runEndTime.getTime() - this.runStartTime.getTime();

    // ── Count results by status ──────────────────────────────────────
    const passed = this.results.filter((r) => r.status === "passed").length;
    const failed = this.results.filter((r) => r.status === "failed").length;
    const skipped = this.results.filter((r) => r.status === "skipped").length;
    const total = this.results.length;

    // ── Calculate timing stats ───────────────────────────────────────
    const durations = this.results.map((r) => r.duration);
    const avgDuration =
      total > 0 ? durations.reduce((a, b) => a + b, 0) / total : 0;

    const sortedByDuration = [...this.results].sort(
      (a, b) => b.duration - a.duration,
    );
    const slowest = sortedByDuration[0] || null;
    const fastest = sortedByDuration[sortedByDuration.length - 1] || null;

    // ── Count flaky tests and auto-heals ─────────────────────────────
    const flakyTests = this.results.filter((r) => r.wasRetried).length;
    const totalAutoHeals = this.results.reduce(
      (sum, r) => sum + r.autoHealCount,
      0,
    );

    // ── Calculate performance averages ───────────────────────────────
    const avgPageLoad =
      this.performanceData.length > 0
        ? Math.round(
            this.performanceData.reduce((sum, p) => sum + p.pageLoadTime, 0) /
              this.performanceData.length,
          )
        : null;

    const avgApiResponse =
      this.apiResponseTimes.length > 0
        ? Math.round(
            this.apiResponseTimes.reduce((a, b) => a + b, 0) /
              this.apiResponseTimes.length,
          )
        : null;

    const databaseDurations = this.databaseOperations.map(
      (operation) => operation.duration,
    );
    const byDatabase: DatabaseMetrics["byDatabase"] = {};
    for (const operation of this.databaseOperations) {
      const current = byDatabase[operation.database] ?? {
        operations: 0,
        successful: 0,
        failed: 0,
        averageDuration: 0,
      };
      current.operations++;
      current.successful += operation.success ? 1 : 0;
      current.failed += operation.success ? 0 : 1;
      current.averageDuration += operation.duration;
      byDatabase[operation.database] = current;
    }
    for (const metrics of Object.values(byDatabase)) {
      metrics.averageDuration = Math.round(
        metrics.averageDuration / metrics.operations,
      );
    }

    // ── Group results by feature ─────────────────────────────────────
    const byFeature: Record<
      string,
      { passed: number; failed: number; skipped: number }
    > = {};
    this.results.forEach((r) => {
      if (!byFeature[r.feature])
        byFeature[r.feature] = { passed: 0, failed: 0, skipped: 0 };
      byFeature[r.feature][r.status]++;
    });

    // ── Group results by browser ─────────────────────────────────────
    const byBrowser: Record<
      string,
      { passed: number; failed: number; skipped: number }
    > = {};
    this.results.forEach((r) => {
      if (!byBrowser[r.browser])
        byBrowser[r.browser] = { passed: 0, failed: 0, skipped: 0 };
      byBrowser[r.browser][r.status]++;
    });

    // ── Group results by tag ─────────────────────────────────────────
    const byTag: Record<
      string,
      { passed: number; failed: number; skipped: number }
    > = {};
    this.results.forEach((r) => {
      r.tags.forEach((tag) => {
        if (!byTag[tag]) byTag[tag] = { passed: 0, failed: 0, skipped: 0 };
        byTag[tag][r.status]++;
      });
    });

    // ── Collect failed test details ──────────────────────────────────
    const failedTests = this.results
      .filter((r) => r.status === "failed")
      .map((r) => ({
        name: r.name,
        feature: r.feature,
        error: r.errorMessage || "Unknown error",
      }));

    const summary: MetricsSummary = {
      runStartTime: this.runStartTime.toISOString(),
      runEndTime: runEndTime.toISOString(),
      totalDuration,
      totalTests: total,
      passed,
      failed,
      skipped,
      passRate: total > 0 ? Math.round((passed / total) * 10000) / 100 : 0,
      averageDuration: Math.round(avgDuration),
      slowestTest: slowest
        ? { name: slowest.name, duration: slowest.duration }
        : null,
      fastestTest: fastest
        ? { name: fastest.name, duration: fastest.duration }
        : null,
      flakyTests,
      totalAutoHeals,
      avgPageLoadTime: avgPageLoad,
      avgApiResponseTime: avgApiResponse,
      databaseMetrics: {
        totalOperations: this.databaseOperations.length,
        successfulOperations: this.databaseOperations.filter(
          (operation) => operation.success,
        ).length,
        failedOperations: this.databaseOperations.filter(
          (operation) => !operation.success,
        ).length,
        averageDuration:
          databaseDurations.length > 0
            ? Math.round(
                databaseDurations.reduce((sum, duration) => sum + duration, 0) /
                  databaseDurations.length,
              )
            : null,
        byDatabase,
      },
      performanceData: this.performanceData,
      accessibilityData: this.accessibilityData,
      byFeature,
      byBrowser,
      byTag,
      failedTests,
    };

    log.info(
      `📊 Metrics Summary: ${passed}/${total} passed (${summary.passRate}%)`,
    );
    return summary;
  }

  /**
   * Saves the metrics summary to a JSON file.
   * This file is consumed by the HTML report generator.
   *
   * @param outputPath - Where to save the JSON file
   */
  saveToFile(outputPath: string): void {
    const summary = this.generateSummary();
    const dir = path.dirname(outputPath);

    // Create the directory if it doesn't exist
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    fs.writeFileSync(outputPath, JSON.stringify(summary, null, 2), "utf-8");
    log.info(`Metrics saved to: ${outputPath}`);
  }

  /**
   * Resets all collected data. Useful between separate test suite runs.
   */
  reset(): void {
    this.results = [];
    this.performanceData = [];
    this.accessibilityData = [];
    this.apiResponseTimes = [];
    this.databaseOperations = [];
    this.runStartTime = new Date();
    log.info("MetricsCollector reset");
  }
}
