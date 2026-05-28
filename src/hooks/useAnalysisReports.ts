/**
 * ANALYSIS REPORTS HOOK
 * 
 * Manages CRUD operations for saved analysis reports using the
 * Supabase client directly. This demonstrates the data persistence
 * layer of the thesis architecture.
 * 
 * Operations:
 * - saveReport: Persist current analysis state to the database
 * - loadReports: Fetch all saved report summaries
 * - loadFullReport: Fetch a complete report with insights
 * - deleteReport: Remove a report from the database
 */

import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import {
  AnalysisInsight,
  AnalysisReport,
  AnalysisReportSummary,
  DashboardConfig,
  DataStats,
} from '@/types/crypto';

export function useAnalysisReports() {
  const [reports, setReports] = useState<AnalysisReportSummary[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [totalCount, setTotalCount] = useState(0);

  /**
   * Fetch all saved report summaries (lightweight, no full insights)
   */
  const loadReports = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const { data, error: fnError } = await supabase.functions.invoke('manage-reports', {
        body: { action: 'list', limit: 50, offset: 0 },
      });

      if (fnError) throw new Error(fnError.message);
      if (data?.error) throw new Error(data.error);

      setReports(data?.data || []);
      setTotalCount(data?.total || 0);
    } catch (err: any) {
      console.error('Load reports error:', err);
      setError(err.message || 'Failed to load reports');
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Save a new analysis report to the database
   */
  const saveReport = useCallback(async (params: {
    coinId: string;
    coinName: string;
    timeRange: number;
    title: string;
    notes: string;
    insights: AnalysisInsight[];
    config: DashboardConfig;
    stats: DataStats | null;
  }): Promise<boolean> => {
    try {
      setSaving(true);
      setError(null);

      const { data, error: fnError } = await supabase.functions.invoke('manage-reports', {
        body: {
          action: 'save',
          coin_id: params.coinId,
          coin_name: params.coinName,
          time_range: params.timeRange,
          title: params.title,
          notes: params.notes,
          insights: params.insights,
          chart_config: {
            showMA7: params.config.showMA7,
            showMA30: params.config.showMA30,
            showMA200: params.config.showMA200,
            showTrendLine: params.config.showTrendLine,
            comparisonCoin: params.config.comparisonCoin,
          },
          stats_snapshot: params.stats,
        },
      });

      if (fnError) throw new Error(fnError.message);
      if (data?.error) throw new Error(data.error);

      // Refresh the reports list
      await loadReports();
      return true;
    } catch (err: any) {
      console.error('Save report error:', err);
      setError(err.message || 'Failed to save report');
      return false;
    } finally {
      setSaving(false);
    }
  }, [loadReports]);

  /**
   * Load a full report by ID (includes insights data)
   */
  const loadFullReport = useCallback(async (id: string): Promise<AnalysisReport | null> => {
    try {
      setError(null);

      const { data, error: fnError } = await supabase.functions.invoke('manage-reports', {
        body: { action: 'get', id },
      });

      if (fnError) throw new Error(fnError.message);
      if (data?.error) throw new Error(data.error);

      return data?.data || null;
    } catch (err: any) {
      console.error('Load full report error:', err);
      setError(err.message || 'Failed to load report');
      return null;
    }
  }, []);

  /**
   * Delete a report by ID
   */
  const deleteReport = useCallback(async (id: string): Promise<boolean> => {
    try {
      setError(null);

      const { data, error: fnError } = await supabase.functions.invoke('manage-reports', {
        body: { action: 'delete', id },
      });

      if (fnError) throw new Error(fnError.message);
      if (data?.error) throw new Error(data.error);

      // Remove from local state immediately for responsiveness
      setReports(prev => prev.filter(r => r.id !== id));
      setTotalCount(prev => Math.max(0, prev - 1));
      return true;
    } catch (err: any) {
      console.error('Delete report error:', err);
      setError(err.message || 'Failed to delete report');
      return false;
    }
  }, []);

  // Load reports on mount
  useEffect(() => {
    loadReports();
  }, [loadReports]);

  return {
    reports,
    totalCount,
    loading,
    saving,
    error,
    saveReport,
    loadReports,
    loadFullReport,
    deleteReport,
  };
}
