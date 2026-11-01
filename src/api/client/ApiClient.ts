import { APIRequestContext, APIResponse } from "@playwright/test";
import { Logger } from "../../core/utils/logger";
import { MetricsCollector } from "../../core/utils/metrics-collector";
import { ENV_CONFIG } from "../../core/config/env.config";

const log = new Logger("ApiClient");

export interface ApiRequestOptions {
  headers?: Record<string, string>;
  params?: Record<string, string>;
  body?: any;
  timeout?: number;
  retries?: number;
}

export interface ApiResponseData {
  status: number;
  statusText: string;
  body: any;
  rawBody: string;
  headers: Record<string, string>;
  responseTime: number;
  url: string;
  method: string;
}

export class ApiClient {
  private request: APIRequestContext;

  private baseUrl: string;

  private defaultHeaders: Record<string, string>;

  constructor(
    request: APIRequestContext,
    baseUrl: string = ENV_CONFIG.API_BASE_URL,
    defaultHeaders: Record<string, string> = {},
  ) {
    this.request = request;
    this.baseUrl = baseUrl;
    this.defaultHeaders = {
      "Content-Type": "application/json",
      Accept: "application/json",
      ...defaultHeaders,
    };
    log.info(`ApiClient initialized with base URL: ${this.baseUrl}`);
  }

  // ═══════════════════════════════════════════════════════════════════
  // 📡 HTTP METHODS — The core request functions
  // ═══════════════════════════════════════════════════════════════════

  /**
   * Sends a GET request.
   * Use GET when you want to RETRIEVE data from the server.
   *
   * @param path - The URL path (appended to baseUrl), e.g., '/users'
   * @param options - Optional configuration (headers, params, timeout)
   * @returns An ApiResponseData with the server's response
   *
   * EXAMPLE:
   *   const response = await api.get('/users?page=2');
   *   console.log(response.body.data); // Array of users
   */
  async get(
    path: string,
    options: ApiRequestOptions = {},
  ): Promise<ApiResponseData> {
    return this.makeRequest("GET", path, options);
  }

  /**
   * Sends a POST request.
   * Use POST when you want to CREATE new data on the server.
   *
   * @param path - The URL path, e.g., '/users'
   * @param options - Must include `body` with the data to create
   * @returns An ApiResponseData with the server's response
   *
   * EXAMPLE:
   *   const response = await api.post('/users', {
   *     body: { name: 'Neo', job: 'The One' }
   *   });
   *   console.log(response.body.id); // The new user's ID
   */
  async post(
    path: string,
    options: ApiRequestOptions = {},
  ): Promise<ApiResponseData> {
    return this.makeRequest("POST", path, options);
  }

  /**
   * Sends a PUT request.
   * Use PUT when you want to COMPLETELY UPDATE existing data.
   *
   * @param path - The URL path, e.g., '/users/2'
   * @param options - Must include `body` with the full updated data
   * @returns An ApiResponseData with the server's response
   */
  async put(
    path: string,
    options: ApiRequestOptions = {},
  ): Promise<ApiResponseData> {
    return this.makeRequest("PUT", path, options);
  }

  /**
   * Sends a PATCH request.
   * Use PATCH when you want to PARTIALLY UPDATE existing data.
   *
   * @param path - The URL path, e.g., '/users/2'
   * @param options - Include `body` with ONLY the fields to change
   * @returns An ApiResponseData with the server's response
   */
  async patch(
    path: string,
    options: ApiRequestOptions = {},
  ): Promise<ApiResponseData> {
    return this.makeRequest("PATCH", path, options);
  }

  /**
   * Sends a DELETE request.
   * Use DELETE when you want to REMOVE data from the server.
   *
   * @param path - The URL path, e.g., '/users/2'
   * @param options - Optional configuration
   * @returns An ApiResponseData (body is usually empty for DELETE)
   */
  async delete(
    path: string,
    options: ApiRequestOptions = {},
  ): Promise<ApiResponseData> {
    return this.makeRequest("DELETE", path, options);
  }

  // ═══════════════════════════════════════════════════════════════════
  // 🔧 HELPERS — Utility methods
  // ═══════════════════════════════════════════════════════════════════

  /**
   * Sets an authorization header for all subsequent requests.
   * Use this after logging in via API to authenticate future requests.
   *
   * @param token - The auth token (e.g., a JWT or Bearer token)
   *
   * EXAMPLE:
   *   const loginResponse = await api.post('/login', { body: { email, password } });
   *   api.setAuthToken(loginResponse.body.token);
   *   // Now all future requests include Authorization: Bearer <token>
   */
  setAuthToken(token: string): void {
    this.defaultHeaders["Authorization"] = `Bearer ${token}`;
    log.info("Authorization token set for future requests.");
  }

  /**
   * Removes the authorization header.
   */
  clearAuthToken(): void {
    delete this.defaultHeaders["Authorization"];
    log.info("Authorization token cleared.");
  }

  // ═══════════════════════════════════════════════════════════════════
  // 🔒 PRIVATE — Internal implementation
  // ═══════════════════════════════════════════════════════════════════

  /**
   * The core method that actually makes HTTP requests.
   * All public methods (get, post, put, etc.) delegate to this.
   *
   * It handles:
   * - Building the full URL
   * - Merging headers
   * - Timing the request
   * - Parsing the response
   * - Retry logic for transient failures
   */
  private async makeRequest(
    method: string,
    path: string,
    options: ApiRequestOptions,
  ): Promise<ApiResponseData> {
    // ── Build the full URL ───────────────────────────────────────────
    // If the path is already a full URL (starts with http), use it as-is
    // Otherwise, prepend the base URL
    const url = path.startsWith("http") ? path : `${this.baseUrl}${path}`;

    // ── Merge headers ────────────────────────────────────────────────
    const headers = { ...this.defaultHeaders, ...options.headers };
    const timeout = options.timeout || ENV_CONFIG.API_TIMEOUT;
    const maxRetries = options.retries ?? 1;

    log.info(`→ ${method} ${url}`);
    if (options.body) {
      log.debug("Request body:", options.body);
    }

    // ── Make the request with retry logic ─────────────────────────────
    let lastError: Error | null = null;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        // Record the start time (for performance metrics)
        const startTime = Date.now();

        // Make the actual HTTP request using Playwright's API
        const response = await this.executeRequest(
          method,
          url,
          headers,
          options,
          timeout,
        );

        // Calculate how long it took
        const responseTime = Date.now() - startTime;

        // Parse the response into our enriched format
        const result = await this.parseResponse(
          response,
          method,
          url,
          responseTime,
        );

        // Record the response time for performance reports
        MetricsCollector.getInstance().addApiResponseTime(responseTime);

        log.info(`← ${result.status} ${result.statusText} (${responseTime}ms)`);

        return result;
      } catch (error) {
        lastError = error as Error;
        if (attempt < maxRetries) {
          log.warn(
            `Request failed (attempt ${attempt}/${maxRetries}). Retrying...`,
          );
          // Wait a bit before retrying (exponential backoff)
          await new Promise((r) => setTimeout(r, 1000 * attempt));
        }
      }
    }

    // All retries exhausted
    log.error(`Request FAILED after ${maxRetries} attempts: ${method} ${url}`);
    throw lastError;
  }

  /**
   * Executes the actual HTTP request using Playwright's API.
   */
  private async executeRequest(
    method: string,
    url: string,
    headers: Record<string, string>,
    options: ApiRequestOptions,
    timeout: number,
  ): Promise<APIResponse> {
    const requestOptions: any = {
      headers,
      timeout,
    };

    // Add query parameters if provided
    if (options.params) {
      requestOptions.params = options.params;
    }

    // Add request body for methods that support it
    if (options.body && ["POST", "PUT", "PATCH"].includes(method)) {
      requestOptions.data = options.body;
    }

    // Dispatch to the correct Playwright method
    switch (method) {
      case "GET":
        return await this.request.get(url, requestOptions);
      case "POST":
        return await this.request.post(url, requestOptions);
      case "PUT":
        return await this.request.put(url, requestOptions);
      case "PATCH":
        return await this.request.patch(url, requestOptions);
      case "DELETE":
        return await this.request.delete(url, requestOptions);
      default:
        throw new Error(`Unsupported HTTP method: ${method}`);
    }
  }

  /**
   * Parses a raw Playwright APIResponse into our enriched format.
   */
  private async parseResponse(
    response: APIResponse,
    method: string,
    url: string,
    responseTime: number,
  ): Promise<ApiResponseData> {
    // Get the raw response body as text
    const rawBody = await response.text();

    // Try to parse it as JSON (APIs usually return JSON)
    let body: any = null;
    try {
      body = JSON.parse(rawBody);
    } catch {
      // Not JSON — that's okay, some responses are plain text or empty
      body = rawBody;
    }

    // Extract response headers into a simple object
    const headers: Record<string, string> = {};
    const allHeaders = response.headers();
    for (const [key, value] of Object.entries(allHeaders)) {
      headers[key] = value;
    }

    return {
      status: response.status(),
      statusText: response.statusText(),
      body,
      rawBody,
      headers,
      responseTime,
      url,
      method,
    };
  }
}
