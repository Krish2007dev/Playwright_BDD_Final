import {
  Collection,
  Db,
  Document,
  Filter,
  FindOptions,
  MongoClient,
  OptionalUnlessRequiredId,
  UpdateFilter,
  UpdateOptions,
  WithId,
} from "mongodb";
import { ENV_CONFIG } from "../../core/config/env.config";
import { Logger } from "../../core/utils/logger";
import { MetricsCollector } from "../../core/utils/metrics-collector";

const log = new Logger("MongoDatabase");
const metrics = MetricsCollector.getInstance();

export interface MongoConfig {
  uri: string;
  database: string;
}

export class MongoDatabase {
  private readonly config: MongoConfig;
  private client?: MongoClient;
  private database?: Db;

  constructor(config: MongoConfig = ENV_CONFIG.MONGO) {
    this.config = config;
  }

  async connect(): Promise<void> {
    if (this.client && this.database) return;

    const startedAt = Date.now();
    try {
      this.client = new MongoClient(this.config.uri);
      await this.client.connect();
      this.database = this.client.db(this.config.database);
      await this.database.command({ ping: 1 });
      this.record("connect", startedAt, true);
      log.info(`Connected to MongoDB database "${this.config.database}".`);
    } catch (error) {
      this.record("connect", startedAt, false);
      log.error(`MongoDB connection failed: ${getErrorMessage(error)}`);
      await this.client?.close().catch(() => undefined);
      this.client = undefined;
      this.database = undefined;
      throw error;
    }
  }

  collection<T extends Document = Document>(name: string): Collection<T> {
    if (!this.database) {
      throw new Error(
        "MongoDB is not connected. Use the mongo fixture or call connect() first.",
      );
    }
    return this.database.collection<T>(name);
  }

  async find<T extends Document = Document>(
    collectionName: string,
    filter: Filter<T> = {},
    options: FindOptions = {},
  ): Promise<WithId<T>[]> {
    return this.measure("find", () =>
      this.collection<T>(collectionName).find(filter, options).toArray(),
    );
  }

  async findOne<T extends Document = Document>(
    collectionName: string,
    filter: Filter<T>,
  ): Promise<WithId<T> | null> {
    return this.measure("findOne", () =>
      this.collection<T>(collectionName).findOne(filter),
    );
  }

  async insert<T extends Document = Document>(
    collectionName: string,
    document: OptionalUnlessRequiredId<T>,
  ): Promise<WithId<T>> {
    return this.measure("insert", async () => {
      const result =
        await this.collection<T>(collectionName).insertOne(document);
      return { ...document, _id: result.insertedId } as WithId<T>;
    });
  }

  async update<T extends Document = Document>(
    collectionName: string,
    filter: Filter<T>,
    update: UpdateFilter<T>,
    options: UpdateOptions = {},
  ): Promise<number> {
    return this.measure("update", async () => {
      const result = await this.collection<T>(collectionName).updateMany(
        filter,
        update,
        options,
      );
      return result.modifiedCount;
    });
  }

  async close(): Promise<void> {
    if (!this.client) return;

    const startedAt = Date.now();
    try {
      await this.client.close();
      this.client = undefined;
      this.database = undefined;
      this.record("close", startedAt, true);
      log.info("MongoDB client closed.");
    } catch (error) {
      this.record("close", startedAt, false);
      log.error(`MongoDB client close failed: ${getErrorMessage(error)}`);
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
      log.error(`MongoDB ${operation} failed: ${getErrorMessage(error)}`);
      throw error;
    }
  }

  private record(operation: string, startedAt: number, success: boolean): void {
    const duration = Date.now() - startedAt;
    metrics.addDatabaseOperation("mongodb", duration, success);
    log.debug(
      `MongoDB ${operation} ${success ? "succeeded" : "failed"} (${duration}ms)`,
    );
  }
}

function getErrorMessage(error: unknown): string {
  return error instanceof Error ? error.message : String(error);
}
