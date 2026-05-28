/**
 * CUSTOM HOOKS FOR CRYPTO DATA
 * 
 * These hooks implement the data collection layer of the thesis,
 * managing API calls, caching, error handling, and auto-refresh.
 * 
 * Architecture:
 * Frontend (React) → Supabase Edge Functions → CoinGecko API
 * 
 * This separation of concerns demonstrates proper backend/frontend
 * architecture as required by the thesis specification.
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '@/lib/supabase';
import {
  CoinMarketData,
  HistoricalDataResponse,
  DashboardConfig,
  DEFAULT_CONFIG,
} from '@/types/crypto';

// Simple in-memory cache to reduce API calls
const cache: Record<string, { data: any; timestamp: number }> = {};
const CACHE_TTL = 60000; // 60 seconds cache

function getCached<T>(key: string): T | null {
  const entry = cache[key];
  if (entry && Date.now() - entry.timestamp < CACHE_TTL) {
    return entry.data as T;
  }
  return null;
}

function setCache(key: string, data: any): void {
  cache[key] = { data, timestamp: Date.now() };
}

/**
 * Hook for fetching market data for multiple coins
 */
export function useMarketData(coins: string[]) {
  const [data, setData] = useState<CoinMarketData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const fetchData = useCallback(async () => {
    const cacheKey = `market-${coins.join(',')}`;
    const cached = getCached<CoinMarketData[]>(cacheKey);
    
    if (cached) {
      setData(cached);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const { data: response, error: fnError } = await supabase.functions.invoke('crypto-market-data', {
        body: { coins },
      });

      if (fnError) throw new Error(fnError.message);
      if (response?.error) throw new Error(response.error);

      const marketData = response?.data || [];
      setData(marketData);
      setCache(cacheKey, marketData);
      setLastUpdated(new Date());
    } catch (err: any) {
      console.error('Market data fetch error:', err);
      setError(err.message || 'Failed to fetch market data');
    } finally {
      setLoading(false);
    }
  }, [coins.join(',')]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { data, loading, error, lastUpdated, refetch: fetchData };
}

/**
 * Hook for fetching historical data for a specific coin
 */
export function useHistoricalData(coinId: string, days: number) {
  const [data, setData] = useState<HistoricalDataResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    const cacheKey = `historical-${coinId}-${days}`;
    const cached = getCached<HistoricalDataResponse>(cacheKey);
    
    if (cached) {
      setData(cached);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const { data: response, error: fnError } = await supabase.functions.invoke('crypto-historical', {
        body: { coinId, days },
      });

      if (fnError) throw new Error(fnError.message);
      if (response?.error) throw new Error(response.error);

      setData(response);
      setCache(cacheKey, response);
    } catch (err: any) {
      console.error('Historical data fetch error:', err);
      setError(err.message || 'Failed to fetch historical data');
    } finally {
      setLoading(false);
    }
  }, [coinId, days]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { data, loading, error, refetch: fetchData };
}

/**
 * Hook for managing dashboard configuration with localStorage persistence
 */
export function useDashboardConfig() {
  const [config, setConfig] = useState<DashboardConfig>(() => {
    try {
      const saved = localStorage.getItem('crypto-dashboard-config');
      return saved ? { ...DEFAULT_CONFIG, ...JSON.parse(saved) } : DEFAULT_CONFIG;
    } catch {
      return DEFAULT_CONFIG;
    }
  });

  const updateConfig = useCallback((updates: Partial<DashboardConfig>) => {
    setConfig(prev => {
      const newConfig = { ...prev, ...updates };
      localStorage.setItem('crypto-dashboard-config', JSON.stringify(newConfig));
      return newConfig;
    });
  }, []);

  const resetConfig = useCallback(() => {
    localStorage.removeItem('crypto-dashboard-config');
    setConfig(DEFAULT_CONFIG);
  }, []);

  return { config, updateConfig, resetConfig };
}

/**
 * Hook for auto-refresh functionality
 */
export function useAutoRefresh(callback: () => void, intervalMs: number, enabled: boolean) {
  const savedCallback = useRef(callback);

  useEffect(() => {
    savedCallback.current = callback;
  }, [callback]);

  useEffect(() => {
    if (!enabled || intervalMs <= 0) return;

    const id = setInterval(() => {
      savedCallback.current();
    }, intervalMs);

    return () => clearInterval(id);
  }, [intervalMs, enabled]);
}

/**
 * Hook for comparison data between two coins
 */
export function useComparisonData(coinA: string, coinB: string, days: number) {
  const histA = useHistoricalData(coinA, days);
  const histB = useHistoricalData(coinB, days);

  return {
    coinA: histA,
    coinB: histB,
    loading: histA.loading || histB.loading,
    error: histA.error || histB.error,
    refetch: () => {
      histA.refetch();
      histB.refetch();
    },
  };
}
