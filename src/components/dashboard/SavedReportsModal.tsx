/**
 * SAVED REPORTS MODAL
 * 
 * Displays a list of all previously saved analysis reports.
 * Users can:
 * - View report metadata (title, coin, time range, date)
 * - Load a report to restore the exact dashboard configuration
 * - Delete reports they no longer need
 * 
 * This component demonstrates the data retrieval and management
 * aspects of the persistence methodology for the thesis.
 */

import React, { useState } from 'react';
import {
  X,
  FolderOpen,
  Trash2,
  ExternalLink,
  Clock,
  BarChart3,
  TrendingUp,
  Loader2,
  FileText,
  Database,
  AlertCircle,
  SlidersHorizontal,
} from 'lucide-react';
import { AnalysisReportSummary, SUPPORTED_COINS } from '@/types/crypto';

interface SavedReportsModalProps {
  isOpen: boolean;
  onClose: () => void;
  reports: AnalysisReportSummary[];
  loading: boolean;
  error: string | null;
  onLoadReport: (id: string) => void;
  onDeleteReport: (id: string) => void;
  onRefresh: () => void;
  loadingReportId: string | null;
}

const SavedReportsModal: React.FC<SavedReportsModalProps> = ({
  isOpen,
  onClose,
  reports,
  loading,
  error,
  onLoadReport,
  onDeleteReport,
  onRefresh,
  loadingReportId,
}) => {
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleDelete = (id: string) => {
    if (confirmDeleteId === id) {
      onDeleteReport(id);
      setConfirmDeleteId(null);
    } else {
      setConfirmDeleteId(id);
      // Auto-reset confirm state after 3 seconds
      setTimeout(() => setConfirmDeleteId(null), 3000);
    }
  };

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getTimeRangeLabel = (days: number) => {
    if (days === 7) return '7D';
    if (days === 30) return '30D';
    if (days === 90) return '90D';
    if (days === 365) return '1Y';
    return `${days}D`;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />

      {/* Modal */}
      <div className="relative bg-[#0B1426] border border-slate-700/50 rounded-2xl w-full max-w-2xl max-h-[85vh] flex flex-col shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-700/50 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center">
              <FolderOpen className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">Saved Reports</h2>
              <p className="text-[10px] text-slate-500">
                {reports.length} report{reports.length !== 1 ? 's' : ''} saved to database
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={onRefresh}
              disabled={loading}
              className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors disabled:opacity-50"
              title="Refresh list"
            >
              <Loader2 className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Methodology note */}
        <div className="mx-5 mt-4 p-2.5 bg-violet-400/5 border border-violet-400/10 rounded-lg shrink-0">
          <p className="text-[10px] text-violet-400/70 leading-relaxed">
            <span className="font-semibold">Data Persistence:</span> Reports are stored in a PostgreSQL database (Supabase) with JSONB columns for insights and configuration. Loading a report restores the exact dashboard state and re-fetches live data for the saved coin and timeframe.
          </p>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-5 custom-scrollbar">
          {/* Error state */}
          {error && (
            <div className="flex items-center gap-2 p-3 mb-4 bg-red-400/10 border border-red-400/20 rounded-lg">
              <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
              <span className="text-xs text-red-400">{error}</span>
            </div>
          )}

          {/* Loading state */}
          {loading && reports.length === 0 && (
            <div className="space-y-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="p-4 bg-slate-800/30 rounded-xl border border-slate-700/20 animate-pulse">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-8 h-8 bg-slate-700 rounded-lg" />
                    <div className="flex-1">
                      <div className="h-4 bg-slate-700 rounded w-48 mb-1.5" />
                      <div className="h-3 bg-slate-700 rounded w-32" />
                    </div>
                  </div>
                  <div className="h-3 bg-slate-700 rounded w-full" />
                </div>
              ))}
            </div>
          )}

          {/* Empty state */}
          {!loading && reports.length === 0 && (
            <div className="text-center py-12">
              <div className="w-16 h-16 rounded-2xl bg-slate-800/50 border border-slate-700/30 flex items-center justify-center mx-auto mb-4">
                <Database className="w-8 h-8 text-slate-600" />
              </div>
              <h3 className="text-sm font-semibold text-slate-400 mb-1">No Saved Reports</h3>
              <p className="text-xs text-slate-600 max-w-xs mx-auto">
                Save your first analysis report by clicking the "Save Report" button in the Analysis Insights panel.
              </p>
            </div>
          )}

          {/* Reports list */}
          {reports.length > 0 && (
            <div className="space-y-3">
              {reports.map((report) => {
                const coin = SUPPORTED_COINS.find(c => c.id === report.coin_id);
                const isLoading = loadingReportId === report.id;
                const isConfirmingDelete = confirmDeleteId === report.id;
                const config = report.chart_config;
                const activeIndicators = [
                  config?.showMA7 && 'MA7',
                  config?.showMA30 && 'MA30',
                  config?.showMA200 && 'MA200',
                  config?.showTrendLine && 'Trend',
                ].filter(Boolean);

                return (
                  <div
                    key={report.id}
                    className="group p-4 bg-slate-800/30 rounded-xl border border-slate-700/20 hover:border-slate-600/40 transition-all"
                  >
                    {/* Top row: coin + title + actions */}
                    <div className="flex items-start gap-3">
                      {/* Coin icon */}
                      <div
                        className="w-9 h-9 rounded-lg flex items-center justify-center text-xs font-bold text-white shrink-0"
                        style={{ backgroundColor: coin?.color || '#475569' }}
                      >
                        {coin?.symbol?.substring(0, 3) || '?'}
                      </div>

                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <h4 className="text-sm font-semibold text-white truncate">
                          {report.title}
                        </h4>
                        <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                          <span className="text-[10px] text-slate-500 flex items-center gap-1">
                            <TrendingUp className="w-3 h-3" />
                            {report.coin_name}
                          </span>
                          <span className="text-[10px] text-slate-600">|</span>
                          <span className="text-[10px] text-slate-500 flex items-center gap-1">
                            <BarChart3 className="w-3 h-3" />
                            {getTimeRangeLabel(report.time_range)}
                          </span>
                          <span className="text-[10px] text-slate-600">|</span>
                          <span className="text-[10px] text-slate-500 flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {formatDate(report.created_at)}
                          </span>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-1.5 shrink-0">
                        <button
                          onClick={() => onLoadReport(report.id)}
                          disabled={isLoading}
                          className="flex items-center gap-1.5 px-3 py-1.5 text-[11px] font-medium text-cyan-400 bg-cyan-400/10 border border-cyan-400/20 rounded-lg hover:bg-cyan-400/20 transition-colors disabled:opacity-50"
                        >
                          {isLoading ? (
                            <Loader2 className="w-3 h-3 animate-spin" />
                          ) : (
                            <ExternalLink className="w-3 h-3" />
                          )}
                          {isLoading ? 'Loading...' : 'Load'}
                        </button>
                        <button
                          onClick={() => handleDelete(report.id)}
                          className={`p-1.5 rounded-lg transition-colors ${
                            isConfirmingDelete
                              ? 'text-red-400 bg-red-400/20 border border-red-400/30'
                              : 'text-slate-500 hover:text-red-400 hover:bg-red-400/10'
                          }`}
                          title={isConfirmingDelete ? 'Click again to confirm delete' : 'Delete report'}
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    {/* Notes (if any) */}
                    {report.notes && (
                      <div className="mt-2.5 ml-12 flex items-start gap-1.5">
                        <FileText className="w-3 h-3 text-slate-600 mt-0.5 shrink-0" />
                        <p className="text-[11px] text-slate-500 leading-relaxed line-clamp-2">
                          {report.notes}
                        </p>
                      </div>
                    )}

                    {/* Indicator badges */}
                    {activeIndicators.length > 0 && (
                      <div className="mt-2.5 ml-12 flex items-center gap-1.5">
                        <SlidersHorizontal className="w-3 h-3 text-slate-600" />
                        {activeIndicators.map((ind) => (
                          <span
                            key={ind}
                            className="text-[9px] font-semibold px-1.5 py-0.5 rounded bg-slate-700/50 text-slate-400"
                          >
                            {ind}
                          </span>
                        ))}
                        {config?.comparisonCoin && (
                          <span className="text-[9px] text-slate-600 ml-1">
                            vs {SUPPORTED_COINS.find(c => c.id === config.comparisonCoin)?.symbol || config.comparisonCoin}
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-700/50 shrink-0">
          <div className="flex items-center justify-between">
            <span className="text-[10px] text-slate-600">
              Stored in PostgreSQL via Supabase
            </span>
            <button
              onClick={onClose}
              className="px-4 py-1.5 text-xs font-medium text-slate-400 bg-slate-800 border border-slate-700 rounded-lg hover:bg-slate-700 hover:text-white transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SavedReportsModal;
