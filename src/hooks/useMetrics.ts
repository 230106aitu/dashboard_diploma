/**
 * Custom React Hooks for Cryptocurrency Metrics
 * Handles data fetching, validation, and error management
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { useQuery, UseQueryResult } from '@tanstack/react-query';
import { CryptoMetric, DashboardMetrics } from '../types/metrics';
import { apiClient } from '../utils/api';
import { integrityService } from '../utils/dataIntegrity';

export interface UseMetricOptions {
  enabled?: boolean;
  refetchInterval?: number;
  staleTime?: number;
}

/**
 * Hook for fetching and validating a single metric
 */
export const useMetric = <T extends CryptoMetric>(
  metricName: string,
  blockchain: string,
  options?: UseMetricOptions
): UseQueryResult<T | null, Error> => {
  return useQuery({
    queryKey: [metricName, blockchain],
    queryFn: async () => {
      try {
        let response;

        // Route to appropriate API method
        switch (metricName) {
          case 'transactions':
            response = await apiClient.fetchTransactions(blockchain);
            break;
          case 'activeAddresses':
            response = await apiClient.fetchActiveAddresses(blockchain);
            break;
          case 'hashRate':
            response = await apiClient.fetchHashRate(blockchain);
            break;
          case 'fees':
            response = await apiClient.fetchFees(blockchain);
            break;
          case 'blockInterval':
            response = await apiClient.fetchBlockInterval(blockchain);
            break;
          case 'mempool':
            response = await apiClient.fetchMempool(blockchain);
            break;
          case 'walletDistribution':
            response = await apiClient.fetchWalletDistribution(blockchain);
            break;
          case 'exchangeFlow':
            response = await apiClient.fetchExchangeFlow(blockchain);
            break;
          case 'nvtRatio':
            response = await apiClient.fetchNVTRatio(blockchain);
            break;
          case 'realizedCap':
            response = await apiClient.fetchRealizedCap(blockchain);
            break;
          default:
            throw new Error(`Unknown metric: ${metricName}`);
        }

        if (response.error) {
          throw new Error(response.error);
        }

        // Validate integrity
        const integrityCheck = await integrityService.checkDataIntegrity(response.data);
        if (!integrityCheck.valid) {
          console.warn(`Integrity check failed for ${metricName}:`, integrityCheck.errors);
        }

        return response.data as T;
      } catch (error) {
        throw error instanceof Error ? error : new Error(String(error));
      }
    },
    enabled: options?.enabled !== false,
    refetchInterval: options?.refetchInterval || 60000, // Default 1 minute
    staleTime: options?.staleTime || 30000, // Default 30 seconds
    retry: 3,
    retryDelay: attemptIndex => Math.min(1000 * 2 ** attemptIndex, 30000),
  });
};

/**
 * Hook for fetching all metrics at once
 */
export const useDashboardMetrics = (
  blockchain: string,
  options?: UseMetricOptions
): UseQueryResult<DashboardMetrics, Error> => {
  return useQuery({
    queryKey: ['dashboardMetrics', blockchain],
    queryFn: async () => {
      const metrics: DashboardMetrics = {
        transactions: null,
        activeAddresses: null,
        hashRate: null,
        fees: null,
        blockInterval: null,
        mempool: null,
        walletDistribution: null,
        exchangeFlow: null,
        nvtRatio: null,
        realizedCap: null,
        lastUpdate: Date.now(),
        isValid: true,
      };

      // Fetch all metrics in parallel
      const results = await Promise.allSettled([
        apiClient.fetchTransactions(blockchain),
        apiClient.fetchActiveAddresses(blockchain),
        apiClient.fetchHashRate(blockchain),
        apiClient.fetchFees(blockchain),
        apiClient.fetchBlockInterval(blockchain),
        apiClient.fetchMempool(blockchain),
        apiClient.fetchWalletDistribution(blockchain),
        apiClient.fetchExchangeFlow(blockchain),
        apiClient.fetchNVTRatio(blockchain),
        apiClient.fetchRealizedCap(blockchain),
      ]);

      // Process results
      const [tx, addr, hash, fees, block, mem, wallet, exchange, nvt, realCap] = results;

      if (tx.status === 'fulfilled' && !tx.value.error) {
        metrics.transactions = tx.value.data;
      }
      if (addr.status === 'fulfilled' && !addr.value.error) {
        metrics.activeAddresses = addr.value.data;
      }
      if (hash.status === 'fulfilled' && !hash.value.error) {
        metrics.hashRate = hash.value.data;
      }
      if (fees.status === 'fulfilled' && !fees.value.error) {
        metrics.fees = fees.value.data;
      }
      if (block.status === 'fulfilled' && !block.value.error) {
        metrics.blockInterval = block.value.data;
      }
      if (mem.status === 'fulfilled' && !mem.value.error) {
        metrics.mempool = mem.value.data;
      }
      if (wallet.status === 'fulfilled' && !wallet.value.error) {
        metrics.walletDistribution = wallet.value.data;
      }
      if (exchange.status === 'fulfilled' && !exchange.value.error) {
        metrics.exchangeFlow = exchange.value.data;
      }
      if (nvt.status === 'fulfilled' && !nvt.value.error) {
        metrics.nvtRatio = nvt.value.data;
      }
      if (realCap.status === 'fulfilled' && !realCap.value.error) {
        metrics.realizedCap = realCap.value.data;
      }

      metrics.lastUpdate = Date.now();
      metrics.isValid = Object.values(metrics).filter(v => v !== null).length > 5; // Valid if at least 5 metrics loaded

      return metrics;
    },
    enabled: options?.enabled !== false,
    refetchInterval: options?.refetchInterval || 60000,
    staleTime: options?.staleTime || 30000,
    retry: 2,
  });
};

/**
 * Hook for monitoring metric data integrity
 */
export const useMetricIntegrity = (metric: CryptoMetric | null) => {
  const [integrityStatus, setIntegrityStatus] = useState({
    valid: false,
    errors: [] as string[],
    warnings: [] as string[],
    lastChecked: 0,
  });

  useEffect(() => {
    if (!metric) return;

    const checkIntegrity = async () => {
      const result = await integrityService.checkDataIntegrity(metric);
      setIntegrityStatus({
        valid: result.valid,
        errors: result.errors,
        warnings: result.warnings,
        lastChecked: Date.now(),
      });
    };

    checkIntegrity();
  }, [metric]);

  return integrityStatus;
};

/**
 * Hook for tracking rate limit status
 */
export const useRateLimitStatus = (endpoint: string) => {
  const [rateLimitStatus, setRateLimitStatus] = useState({
    remaining: 100,
    resetTime: Date.now() + 60000,
  });

  const checkRateLimit = useCallback(() => {
    const remaining = apiClient.getRemainingRequests(endpoint);
    setRateLimitStatus({
      remaining,
      resetTime: Date.now() + 60000,
    });
  }, [endpoint]);

  useEffect(() => {
    checkRateLimit();
    const interval = setInterval(checkRateLimit, 10000);
    return () => clearInterval(interval);
  }, [checkRateLimit]);

  return rateLimitStatus;
};

/**
 * Hook for caching metrics locally
 */
export const useLocalMetricsCache = (key: string) => {
  const getFromCache = useCallback((): CryptoMetric | null => {
    try {
      const cached = localStorage.getItem(`metric_${key}`);
      if (!cached) return null;

      const data = JSON.parse(cached);
      const age = (Date.now() - data.timestamp) / 1000;

      // Cache valid for 5 minutes
      if (age < 300) {
        return data;
      }

      localStorage.removeItem(`metric_${key}`);
      return null;
    } catch (error) {
      console.error('Cache retrieval failed:', error);
      return null;
    }
  }, [key]);

  const saveToCache = useCallback((metric: CryptoMetric) => {
    try {
      localStorage.setItem(`metric_${key}`, JSON.stringify(metric));
    } catch (error) {
      console.error('Cache storage failed:', error);
    }
  }, [key]);

  const clearCache = useCallback(() => {
    try {
      localStorage.removeItem(`metric_${key}`);
    } catch (error) {
      console.error('Cache clear failed:', error);
    }
  }, [key]);

  return { getFromCache, saveToCache, clearCache };
};

/**
 * Hook for error tracking and reporting
 */
export const useMetricsErrorHandler = () => {
  const [errors, setErrors] = useState<Array<{ metric: string; error: string; timestamp: number }>>([]);
  const errorCountRef = useRef<Map<string, number>>(new Map());

  const addError = useCallback((metric: string, error: string) => {
    const count = (errorCountRef.current.get(metric) || 0) + 1;
    errorCountRef.current.set(metric, count);

    setErrors(prev => [
      ...prev,
      {
        metric,
        error,
        timestamp: Date.now(),
      },
    ].slice(-50)); // Keep last 50 errors
  }, []);

  const clearErrors = useCallback((metric?: string) => {
    if (metric) {
      errorCountRef.current.delete(metric);
      setErrors(prev => prev.filter(e => e.metric !== metric));
    } else {
      errorCountRef.current.clear();
      setErrors([]);
    }
  }, []);

  const getErrorCount = useCallback((metric: string): number => {
    return errorCountRef.current.get(metric) || 0;
  }, []);

  return { errors, addError, clearErrors, getErrorCount };
};

/**
 * Hook for metric data normalization
 */
export const useMetricNormalization = (metric: CryptoMetric | null) => {
  const [normalized, setNormalized] = useState<CryptoMetric | null>(null);

  useEffect(() => {
    if (!metric) {
      setNormalized(null);
      return;
    }

    try {
      const normalizedValue = integrityService.normalizeDecimalPrecision(metric.value);
      const normalizedTimestamp = integrityService.normalizeTimestamp(metric.timestamp);

      setNormalized({
        ...metric,
        value: normalizedValue,
        timestamp: normalizedTimestamp,
      });
    } catch (error) {
      console.error('Normalization failed:', error);
      setNormalized(metric);
    }
  }, [metric]);

  return normalized;
};
