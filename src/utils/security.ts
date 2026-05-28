/**
 * Security Utilities
 * Implements security measures: HTTPS, CSP, input validation, secure headers
 */

/**
 * Content Security Policy Headers
 */
export const getCSPHeaders = (): Record<string, string> => {
  return {
    'Content-Security-Policy': [
      "default-src 'self'",
      "script-src 'self' 'wasm-unsafe-eval'",
      "style-src 'self' 'unsafe-inline'",
      "img-src 'self' data: https:",
      "font-src 'self' data:",
      "connect-src 'self' https://api.glassnode.com https://api.cryptoquant.com https://blockchain.com https://api.blockcypher.com https://api.etherscan.io",
      "frame-ancestors 'none'",
      "base-uri 'self'",
      "form-action 'self'",
    ].join('; '),
    'X-Content-Type-Options': 'nosniff',
    'X-Frame-Options': 'DENY',
    'X-XSS-Protection': '1; mode=block',
    'Referrer-Policy': 'strict-origin-when-cross-origin',
    'Permissions-Policy': 'geolocation=(), microphone=(), camera=()',
    'Strict-Transport-Security': 'max-age=31536000; includeSubDomains; preload',
  };
};

/**
 * Input Sanitization
 * Removes potentially dangerous characters and patterns
 */
export const sanitizeInput = (input: string): string => {
  if (typeof input !== 'string') {
    return '';
  }

  // Remove script tags and event handlers
  let sanitized = input
    .replace(/<script[^>]*>.*?<\/script>/gi, '')
    .replace(/on\w+\s*=\s*["'][^"']*["']/gi, '')
    .replace(/on\w+\s*=\s*[^\s>]*/gi, '');

  // Remove HTML tags
  sanitized = sanitized.replace(/<[^>]*>/g, '');

  // Remove SQL injection patterns
  sanitized = sanitized.replace(/('|"|--|(;)|(\/\*)|(\*\/))/g, '');

  return sanitized.trim();
};

/**
 * Validate API URL
 * Ensures URL is HTTPS and from a known good domain
 */
export const validateAPIUrl = (url: string, allowedDomains: string[]): boolean => {
  try {
    const parsed = new URL(url);

    // Must be HTTPS
    if (parsed.protocol !== 'https:') {
      console.warn(`API URL is not HTTPS: ${url}`);
      return false;
    }

    // Must be from allowed domain
    const isAllowed = allowedDomains.some(domain => 
      parsed.hostname.endsWith(domain)
    );

    if (!isAllowed) {
      console.warn(`API URL not from allowed domain: ${url}`);
      return false;
    }

    return true;
  } catch (error) {
    console.warn(`Invalid URL format: ${url}`);
    return false;
  }
};

/**
 * Validate JSON response structure
 * Prevents XSS through malicious JSON
 */
export const validateJSONResponse = (
  data: any,
  schema: Record<string, string>
): { valid: boolean; errors: string[] } => {
  const errors: string[] = [];

  // Check for circular references
  try {
    JSON.stringify(data);
  } catch (error) {
    errors.push('Response contains circular references');
    return { valid: false, errors };
  }

  // Validate against schema
  for (const [key, expectedType] of Object.entries(schema)) {
    if (!(key in data)) {
      errors.push(`Missing required field: ${key}`);
      continue;
    }

    const actualType = typeof data[key];
    if (actualType !== expectedType && expectedType !== 'any') {
      errors.push(`Type mismatch for ${key}: expected ${expectedType}, got ${actualType}`);
    }

    // Additional checks for strings (XSS prevention)
    if (expectedType === 'string' && typeof data[key] === 'string') {
      if (data[key].includes('<') || data[key].includes('>')) {
        errors.push(`Potential XSS in field ${key}`);
      }
    }
  }

  return {
    valid: errors.length === 0,
    errors,
  };
};

/**
 * Rate limiting utility
 * Prevents API abuse
 */
export class RateLimiter {
  private requests: Map<string, number[]> = new Map();
  private readonly maxRequests: number;
  private readonly windowMs: number;

  constructor(maxRequests: number = 100, windowMs: number = 60000) {
    this.maxRequests = maxRequests;
    this.windowMs = windowMs;
  }

  isAllowed(key: string): boolean {
    const now = Date.now();
    const timestamps = this.requests.get(key) || [];

    // Remove old requests outside the window
    const validTimestamps = timestamps.filter(ts => now - ts < this.windowMs);

    if (validTimestamps.length >= this.maxRequests) {
      return false;
    }

    // Add current request
    validTimestamps.push(now);
    this.requests.set(key, validTimestamps);

    return true;
  }

  getRemainingRequests(key: string): number {
    const now = Date.now();
    const timestamps = this.requests.get(key) || [];
    const validTimestamps = timestamps.filter(ts => now - ts < this.windowMs);
    return Math.max(0, this.maxRequests - validTimestamps.length);
  }

  reset(key: string): void {
    this.requests.delete(key);
  }
}

/**
 * Secure error handling
 * Prevents information disclosure
 */
export const createSecureErrorMessage = (error: any): string => {
  // Never expose full error details to client
  if (error instanceof TypeError) {
    return 'Invalid data received from server';
  }
  if (error instanceof SyntaxError) {
    return 'Server response format error';
  }
  if (error.message?.includes('CORS')) {
    return 'Cross-origin request denied';
  }

  return 'An error occurred processing your request';
};

/**
 * Input validation patterns
 */
export const validationPatterns = {
  // Ethereum address
  ethereumAddress: /^0x[a-fA-F0-9]{40}$/,
  // Bitcoin address
  bitcoinAddress: /^[13][a-km-zA-HJ-NP-Z1-9]{25,34}$|^bc1[a-z0-9]{39,59}$/,
  // Positive decimal number
  positiveDecimal: /^\d+(\.\d{1,8})?$/,
  // ISO timestamp
  isoTimestamp: /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d{3})?Z?$/,
  // API key format
  apiKey: /^[a-zA-Z0-9_-]{32,}$/,
};

/**
 * Validate input against pattern
 */
export const validatePattern = (input: string, pattern: RegExp): boolean => {
  return pattern.test(input);
};

/**
 * Encrypt sensitive data for storage
 */
export const encryptSensitiveData = (data: string, key: string): string => {
  // In production, use proper encryption library like TweetNaCl.js
  // This is a placeholder implementation
  try {
    const encoded = btoa(data);
    return encoded;
  } catch (error) {
    console.error('Encryption failed:', error);
    return '';
  }
};

/**
 * Decrypt sensitive data
 */
export const decryptSensitiveData = (encrypted: string, key: string): string => {
  try {
    const decoded = atob(encrypted);
    return decoded;
  } catch (error) {
    console.error('Decryption failed:', error);
    return '';
  }
};

/**
 * Generate secure random nonce
 * Used to prevent replay attacks
 */
export const generateNonce = (): string => {
  return Array.from(crypto.getRandomValues(new Uint8Array(16)))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
};

/**
 * Verify HTTPS connection
 */
export const isSecureContext = (): boolean => {
  return window.isSecureContext || process.env.NODE_ENV === 'development';
};
