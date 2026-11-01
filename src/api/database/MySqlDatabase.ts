import {
  createPool,
  ExecuteValues,
  Pool,
  PoolConnection,
  QueryValues,
  ResultSetHeader,
  RowDataPacket,
} from "mysql2/promise";
import { ENV_CONFIG } from "../../core/config/env.config";
import { Logger } from "../../core/utils/logger";
import { MetricsCollector } from "../../core/utils/metrics-collector";

const log = new Logger("MySqlDatabase");
const metrics = MetricsCollector.getInstance();

export interface MySqlConfig {
  host: string;
  port: number;
  user: string;
  password: string;
  database: string;
  connectionLimit: number;
}

export type SqlRow = RowDataPacket & Record<string, unknown>;

export class MySqlDatabase {
  private readonly config: MySqlConfig;
  private pool?: Pool;

  constructor(config: MySqlConfig = ENV_CONFIG.MYSQL) {
    this.config = config;
  }

  async connect(): Promise<void> {
    if (this.pool) return;

    const startedAt = Date.now();
    try {
      this.pool = createPool({
        ...this.config,
        waitForConnections: true,
      });
      await this.pool.query("SELECT 1");
      this.record("connect", startedAt, true);
      log.info(`Connected to MySQL database "${this.config.database}".`);
    } catch (error) {
      this.record("connect", startedAt, false);
      log.error(`MySQL connection failed: ${getErrorMessage(error)}`);
      this.pool = undefined;
      throw error;
    }
  }

  async query<T extends RowDataPacket[] = SqlRow[]>(
    sql: string,
    parameters: QueryValues[] = [],
  ): Promise<T> {
    return this.measure("query", async () => {
      const [rows] = await this.requirePool().query<T>(sql, parameters);
      return rows;
    });
  }

  async execute(
    sql: string,
    parameters: ExecuteValues[] = [],
  ): Promise<ResultSetHeader> {
    return this.measure("execute", async () => {
      const [result] = await this.requirePool().execute<ResultSetHeader>(
        sql,
        parameters,
      );
      return result;
    });
  }

  async transaction<T>(
    callback: (connection: PoolConnection) => Promise<T>,
  ): Promise<T> {
    return this.measure("transaction", async () => {
      const connection = await this.requirePool().getConnection();
      try {
        await connection.beginTransaction();
        const result = await callback(connection);
        await connection.commit();
        return result;
      } catch (error) {
        await connection.rollback();
        throw error;
      } finally {
        connection.release();
      }
    });
  }

  async close(): Promise<void> {
    if (!this.pool) return;

    const startedAt = Date.now();
    try {
      await this.pool.end();
      this.pool = undefined;
      this.record("close", startedAt, true);
      log.info("MySQL connection pool closed.");
    } catch (error) {
      this.record("close", startedAt, false);
      log.error(`MySQL pool close failed: ${getErrorMessage(error)}`);
      throw error;
    }
  }

  private async measure<T>(
    operation: string,
    action: () => Promise<T>,
  ): Promise<T> {
    const startedAt = Date.now();
    try {
      const result = await action();
      this.record(operation, startedAt, true);
      return result;
    } catch (error) {
      this.record(operation, startedAt, false);
      log.error(`MySQL ${operation} failed: ${getErrorMessage(error)}`);
      throw error;
    }
  }

  private record(operation: string, startedAt: number, success: boolean): void {
    const duration = Date.now() - startedAt;
    metrics.addDatabaseOperation("mysql", duration, success);
    log.debug(
      `MySQL ${operation} ${success ? "succeeded" : "failed"} (${duration}ms)`,
    );
  }

  private requirePool(): Pool {
    if (!this.pool) {
      throw new Error(
        "MySQL is not connected. Use the mysql fixture or call connect() first.",
      );
    }

    return this.pool;
  }
}

function getErrorMessage(error: unknown): string {
  return error instanceof Error ? error.message : String(error);
}
