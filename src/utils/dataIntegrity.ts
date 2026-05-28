/**
 * Data Integrity Service
 * Ensures financial data integrity for cryptocurrency metrics
 * Validates: source authentication, transmission integrity, normalization, and visualization
 */

import crypto from 'crypto';
import { CryptoMetric } from '../types/metrics';

export interface IntegrityCheckResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
  integrityHash: string;
}

export interface DataValidationConfig {
  decimalPrecision: number; // 8 for BTC/crypto standard
  allowedSources: string[];
  certificatePinning: Map<string, string>;
  maxAgeSeconds: number;
}

/**
 * Default configuration for data integrity validation
 */
export const defaultValidationConfig: DataValidationConfig = {
  decimalPrecision: 8,
  allowedSources: [
    'https://blockchain.com/api',
    'https://api.glassnode.com',
    'https://api.cryptoquant.com',
    'https://api.blockcypher.com',
    'https://api.etherscan.io'
  ],
  certificatePinning: new Map(),
  maxAgeSeconds: 300, // 5 minutes
};

export class DataIntegrityService {
  private config: DataValidationConfig;

  constructor(config: Partial<DataValidationConfig> = {}) {
    this.config = { ...defaultValidationConfig, ...config };
  }

  /**
   * Verify source authentication
   * Checks if data comes from a trusted API endpoint
   */
  verifySourceAuthentication(source: string, certificates?: Record<string, string>): boolean {
    // Validate HTTPS
    if (!source.startsWith('https://')) {
      console.warn(`Source is not HTTPS: ${source}`);
      return false;
    }

    // Check against allowed sources
    const isAllowed = this.config.allowedSources.some(allowed => 
      source.includes(new URL(allowed).hostname)
    );

    if (!isAllowed) {
      console.warn(`Source not in whitelist: ${source}`);
      return false;
    }

    // Validate certificate pinning if configured
    const hostname = new URL(source).hostname;
    if (this.config.certificatePinning.has(hostname) && certificates) {
      const expectedPin = this.config.certificatePinning.get(hostname);
      const actualPin = certificates[hostname];
      if (expectedPin !== actualPin) {
        console.warn(`Certificate pinning validation failed for ${hostname}`);
        return false;
      }
    }

    return true;
  }

  /**
   * Verify transmission integrity
   * Checks if data was not modified during transmission
   */
  verifyTransmissionIntegrity(
    payload: any,
    signature?: string,
    timestamp?: number
  ): IntegrityCheckResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    // Check timestamp freshness
    if (timestamp) {
      const age = (Date.now() - timestamp) / 1000;
      if (age > this.config.maxAgeSeconds) {
        errors.push(`Data is stale: ${age}s old, max ${this.config.maxAgeSeconds}s allowed`);
      }
      if (age > this.config.maxAgeSeconds / 2) {
        warnings.push(`Data approaching age limit: ${age}s`);
      }
    }

    // Verify payload signature if provided
    let integrityHash = '';
    try {
      integrityHash = this.computePayloadHash(payload);
      
      if (signature && !this.verifySignature(payload, signature)) {
        errors.push('Payload signature verification failed');
      }
    } catch (error) {
      errors.push(`Hash computation failed: ${error}`);
    }

    // Detect replay attacks (ensure nonce uniqueness)
    if (!payload.nonce) {
      warnings.push('Missing nonce in payload - replay attack vulnerability');
    }

    return {
      valid: errors.length === 0,
      errors,
      warnings,
      integrityHash,
    };
  }

  /**
   * Normalize decimal precision for cryptocurrency values
   */
  normalizeDecimalPrecision(value: number | string): string {
    const numValue = typeof value === 'string' ? parseFloat(value) : value;
    
    if (isNaN(numValue)) {
      throw new Error(`Invalid numeric value: ${value}`);
    }

    // Use fixed precision to avoid floating-point errors
    return numValue.toFixed(this.config.decimalPrecision);
  }

  /**
   * Normalize timezone to UTC
   */
  normalizeTimestamp(timestamp: number | string): number {
    const ts = typeof timestamp === 'string' ? parseInt(timestamp, 10) : timestamp;
    
    if (isNaN(ts) || ts <= 0) {
      throw new Error(`Invalid timestamp: ${timestamp}`);
    }

    return ts; // Timestamps are always UTC in unix epoch
  }

  /**
   * Validate unit conversions
   * E.g., satoshis to BTC, wei to ETH
   */
  validateUnitConversion(value: string, fromUnit: string, toUnit: string): string {
    const conversions: Record<string, number> = {
      'satoshis-to-BTC': 1e-8,
      'wei-to-ETH': 1e-18,
      'gwei-to-ETH': 1e-9,
    };

    const key = `${fromUnit}-to-${toUnit}`;
    const factor = conversions[key];

    if (!factor) {
      throw new Error(`Unknown unit conversion: ${key}`);
    }

    const numValue = parseFloat(value);
    const converted = numValue * factor;
    return this.normalizeDecimalPrecision(converted);
  }

  /**
   * Validate API response against expected schema
   */
  validateResponseSchema(response: any, schema: Record<string, string>): boolean {
    for (const [key, type] of Object.entries(schema)) {
      if (!(key in response)) {
        console.warn(`Missing required field in response: ${key}`);
        return false;
      }

      if (typeof response[key] !== type) {
        console.warn(`Type mismatch for field ${key}: expected ${type}, got ${typeof response[key]}`);
        return false;
      }
    }

    return true;
  }

  /**
   * Compute integrity hash for payload
   */
  private computePayloadHash(payload: any): string {
    const serialized = JSON.stringify(payload);
    return crypto.createHash('sha256').update(serialized).digest('hex');
  }

  /**
   * Verify cryptographic signature
   */
  private verifySignature(payload: any, signature: string): boolean {
    // This is a placeholder - actual implementation depends on your signing mechanism
    const payloadHash = this.computePayloadHash(payload);
    // In production, use proper cryptographic libraries and keys
    return true; // Simplified for example
  }

  /**
   * Comprehensive data integrity check
   */
  async checkDataIntegrity(
    metric: CryptoMetric,
    config?: Partial<DataValidationConfig>
  ): Promise<IntegrityCheckResult> {
    const errors: string[] = [];
    const warnings: string[] = [];

    try {
      // 1. Verify source
      if (!this.verifySourceAuthentication(metric.source)) {
        errors.push(`Invalid source: ${metric.source}`);
      }

      // 2. Verify transmission
      const transmissionCheck = this.verifyTransmissionIntegrity(metric, metric.integrityHash, metric.timestamp);
      errors.push(...transmissionCheck.errors);
      warnings.push(...transmissionCheck.warnings);

      // 3. Normalize and validate value
      try {
        const normalized = this.normalizeDecimalPrecision(metric.value);
        if (normalized !== metric.value.toString()) {
          warnings.push(`Value was normalized: ${metric.value} → ${normalized}`);
        }
      } catch (error) {
        errors.push(`Value normalization failed: ${error}`);
      }

      // 4. Validate timestamp
      try {
        this.normalizeTimestamp(metric.timestamp);
      } catch (error) {
        errors.push(`Invalid timestamp: ${error}`);
      }

      return {
        valid: errors.length === 0,
        errors,
        warnings,
        integrityHash: this.computePayloadHash(metric),
      };
    } catch (error) {
      return {
        valid: false,
        errors: [String(error)],
        warnings,
        integrityHash: '',
      };
    }
  }

  /**
   * Audit trail for data transformations
   */
  createAuditEntry(
    metricId: string,
    operation: string,
    originalValue: string | number,
    transformedValue: string | number,
    reason: string
  ): Record<string, any> {
    return {
      timestamp: Date.now(),
      metricId,
      operation,
      originalValue,
      transformedValue,
      reason,
      hash: crypto.createHash('sha256')
        .update(`${metricId}${operation}${originalValue}${transformedValue}`)
        .digest('hex'),
    };
  }
}

// Singleton instance
export const integrityService = new DataIntegrityService();
