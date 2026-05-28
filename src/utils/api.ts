/**
 * API Client for Cryptocurrency Metrics
 * Handles HTTPS requests with validation, error handling, and rate limiting
 */

import {
  validateAPIUrl,
  validateJSONResponse,
  RateLimiter,
  createSecureErrorMessage,
  sanitizeInput,
  generateNonce,
} from './security';
import { DataIntegrityService } from './dataIntegrity';
import { CryptoMetric } from '../types/metrics';

export interface APIRequestConfig {
  method?: 'GET' | 'POST' | 'PUT';
  headers?: Record<string, string>;
  body?: any;
  timeout?: number;
  retries?: number;
}

export interface APIResponse<T> {
  data: T | null;
  error: string | null;
  status: number;
  timestamp: number;
  nonce: string;
}

export class CryptoMetricsAPI {
  private readonly baseUrls: string[];
  private readonly rateLimiter: RateLimiter;
  private readonly integrityService: DataIntegrityService;
  private readonly defaultTimeout: number = 30000;
  private readonly maxRetries: number = 3;

  constructor(
    baseUrls: string[] = [
      'https://api.glassnode.com',
      'https://api.cryptoquant.com',
      'https://blockchain.com/api',
      'https://api.blockcypher.com',
      'https://api.etherscan.io',
    ],
    rateLimitConfig?: { maxRequests: number; windowMs: number }
  ) {
    this.baseUrls = baseUrls;
    this.rateLimiter = new RateLimiter(
      rateLimitConfig?.maxRequests || 100,
      rateLimitConfig?.windowMs || 60000
    );
    this.integrityService = new DataIntegrityService();
  }

  /**
   * Fetch transactions metric
   */
  async fetchTransactions(
    blockchain: string,
    config?: APIRequestConfig
  ): Promise<APIResponse<any>> {
    return this.fetchMetric(`/transactions/${blockchain}`, config);
  }

  /**
   * Fetch active addresses metric
   */
  async fetchActiveAddresses(
    blockchain: string,
    config?: APIRequestConfig
  ): Promise<APIResponse<any>> {
    return this.fetchMetric(`/active-addresses/${blockchain}`, config);
  }

  /**
   * Fetch hash rate metric
   */
  async fetchHashRate(
    blockchain: string,
    config?: APIRequestConfig
  ): Promise<APIResponse<any>> {
    return this.fetchMetric(`/hash-rate/${blockchain}`, config);
  }

  /**
   * Fetch fees metric
   */
  async fetchFees(
    blockchain: string,
    config?: APIRequestConfig
  ): Promise<APIResponse<any>> {
    return this.fetchMetric(`/fees/${blockchain}`, config);
  }

  /**
   * Fetch block interval metric
   */
  async fetchBlockInterval(
    blockchain: string,
    config?: APIRequestConfig
  ): Promise<APIResponse<any>> {
    return this.fetchMetric(`/block-interval/${blockchain}`, config);
  }

  /**
   * Fetch mempool metric
   */
  async fetchMempool(
    blockchain: string,
    config?: APIRequestConfig
  ): Promise<APIResponse<any>> {
    return this.fetchMetric(`/mempool/${blockchain}`, config);
  }

  /**
   * Fetch wallet distribution metric
   */
  async fetchWalletDistribution(
    blockchain: string,
    config?: APIRequestConfig
  ): Promise<APIResponse<any>> {
    return this.fetchMetric(`/wallet-distribution/${blockchain}`, config);
  }

  /**
   * Fetch exchange flow metric
   */
  async fetchExchangeFlow(
    blockchain: string,
    config?: APIRequestConfig
  ): Promise<APIResponse<any>> {
    return this.fetchMetric(`/exchange-flow/${blockchain}`, config);
  }

  /**
   * Fetch NVT ratio metric
   */
  async fetchNVTRatio(
    blockchain: string,
    config?: APIRequestConfig
  ): Promise<APIResponse<any>> {
    return this.fetchMetric(`/nvt-ratio/${blockchain}`, config);
  }

  /**
   * Fetch realized capitalization metric
   */
  async fetchRealizedCap(
    blockchain: string,
    config?: APIRequestConfig
  ): Promise<APIResponse<any>> {
    return this.fetchMetric(`/realized-cap/${blockchain}`, config);
  }

  /**
   * Generic metric fetch with retry logic
   */
  private async fetchMetric(
    endpoint: string,
    config?: APIRequestConfig
  ): Promise<APIResponse<any>> {
    const nonce = generateNonce();
    let lastError: Error | null = null;

    for (let attempt = 0; attempt <= (config?.retries || this.maxRetries); attempt++) {
      try {
        // Rate limiting check
        if (!this.rateLimiter.isAllowed(endpoint)) {
          const remaining = this.rateLimiter.getRemainingRequests(endpoint);
          return {
            data: null,
            error: `Rate limit exceeded. Requests reset in 60s. (${remaining} remaining)`,
            status: 429,
            timestamp: Date.now(),
            nonce,
          };
        }

        // Sanitize endpoint
        const sanitizedEndpoint = sanitizeInput(endpoint);

        // Try each base URL
        for (const baseUrl of this.baseUrls) {
          if (!validateAPIUrl(`${baseUrl}${sanitizedEndpoint}`, ['glassnode.com', 'cryptoquant.com', 'blockchain.com', 'blockcypher.com', 'etherscan.io'])) {
            continue;
          }

          try {
            const response = await this.makeRequest(
              `${baseUrl}${sanitizedEndpoint}`,
              config,
              nonce
            );

            return response;
          } catch (error) {
            lastError = error as Error;
            continue;
          }
        }

        throw lastError || new Error('All API endpoints failed');
      } catch (error) {
        lastError = error as Error;

        if (attempt < (config?.retries || this.maxRetries)) {
          // Exponential backoff
          const delay = Math.min(1000 * Math.pow(2, attempt), 10000);
          await new Promise(resolve => setTimeout(resolve, delay));
        }
      }
    }

    return {
      data: null,
      error: createSecureErrorMessage(lastError),
      status: 0,
      timestamp: Date.now(),
      nonce,
    };
  }

  /**
   * Make HTTP request with validation
   */
  private async makeRequest(
    url: string,
    config?: APIRequestConfig,
    nonce?: string
  ): Promise<APIResponse<any>> {
    const controller = new AbortController();
    const timeout = config?.timeout || this.defaultTimeout;
    const timeoutId = setTimeout(() => controller.abort(), timeout);

    try {
      const response = await fetch(url, {
        method: config?.method || 'GET',
        headers: {
          'Content-Type': 'application/json',
          'X-Nonce': nonce || generateNonce(),
          ...config?.headers,
        },
        body: config?.body ? JSON.stringify(config.body) : undefined,
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      // Check response status
      if (!response.ok) {
        return {
          data: null,
          error: `HTTP ${response.status}: ${response.statusText}`,
          status: response.status,
          timestamp: Date.now(),
          nonce: nonce || '',
        };
      }

      // Parse response
      const contentType = response.headers.get('content-type');
      if (!contentType?.includes('application/json')) {
        return {
          data: null,
          error: 'Invalid response content type',
          status: response.status,
          timestamp: Date.now(),
          nonce: nonce || '',
        };
      }

      let data = await response.json();

      // Validate response structure
      const schema: Record<string, string> = {
        value: 'any',
        timestamp: 'number',
        unit: 'string',
      };

      const validation = validateJSONResponse(data, schema);
      if (!validation.valid) {
        return {
          data: null,
          error: `Invalid response schema: ${validation.errors.join(', ')}`,
          status: response.status,
          timestamp: Date.now(),
          nonce: nonce || '',
        };
      }

      // Add integrity hash
      data.integrityHash = this.computeHash(data);
      data.source = url;

      return {
        data,
        error: null,
        status: response.status,
        timestamp: Date.now(),
        nonce: nonce || '',
      };
    } catch (error) {
      clearTimeout(timeoutId);

      if (error instanceof Error && error.name === 'AbortError') {
        return {
          data: null,
          error: 'Request timeout',
          status: 0,
          timestamp: Date.now(),
          nonce: nonce || '',
        };
      }

      return {
        data: null,
        error: createSecureErrorMessage(error),
        status: 0,
        timestamp: Date.now(),
        nonce: nonce || '',
      };
    }
  }

  /**
   * Compute integrity hash for response
   */
  private computeHash(data: any): string {
    try {
      const serialized = JSON.stringify(data);
      // In browser environment, use crypto API
      const encoder = new TextEncoder();
      const dataBuffer = encoder.encode(serialized);
      // Simplified hash - in production use proper crypto library
      return Array.from(new Uint8Array(dataBuffer))
        .map(b => b.toString(16).padStart(2, '0'))
        .join('')
        .slice(0, 16);
    } catch (error) {
      return '';
    }
  }

  /**
   * Reset rate limiter
   */
  resetRateLimit(endpoint: string): void {
    this.rateLimiter.reset(endpoint);
  }

  /**
   * Get remaining requests
   */
  getRemainingRequests(endpoint: string): number {
    return this.rateLimiter.getRemainingRequests(endpoint);
  }
}

// Singleton instance
export const apiClient = new CryptoMetricsAPI();
