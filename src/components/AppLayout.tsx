/**
 * MAIN DASHBOARD LAYOUT
 * 
 * This is the root component of the CryptoMetrics Analytics Dashboard.
 * It orchestrates all data fetching, state management, and component composition.
 * 
 * Architecture:
 * - useDashboardConfig: Manages user preferences (persisted to localStorage)
 * - useMarketData: Fetches current market data for all tracked assets
 * - useHistoricalData: Fetches historical time-series data for the selected asset
 * - useComparisonData: Fetches data for two assets for comparison
 * - useAutoRefresh: Periodically refreshes data when enabled
 * - useAnalysisReports: Manages saved analysis reports (database persistence)
 * 
 * The layout follows a professional analytics dashboard pattern:
 * Header → Filters → KPIs → Stats → Charts Grid → Market Table → Footer
 */

import React, { useMemo, useState, useCallback } from 'react';
import {
  useDashboardConfig,
  useMarketData,
  useHistoricalData,
  useComparisonData,
  useAutoRefresh,
} from '@/hooks/useCryptoData';
import { useAnalysisReports } from '@/hooks/useAnalysisReports';
import { SUPPORTED_COINS } from '@/types/crypto';
import { processChartData, generateInsights, exportToCSV } from '@/utils/analysis';

// Dashboard components
import Header from '@/components/dashboard/Header';
import FilterPanel from '@/components/dashboard/FilterPanel';
import KPICards from '@/components/dashboard/KPICards';
import StatsBar from '@/components/dashboard/StatsBar';
import PriceChart from '@/components/dashboard/PriceChart';
import VolumeChart from '@/components/dashboard/VolumeChart';
import ComparisonChart from '@/components/dashboard/ComparisonChart';
import MarketCapChart from '@/components/dashboard/MarketCapChart';
import AnalysisInsights from '@/components/dashboard/AnalysisInsights';
import MarketOverview from '@/components/dashboard/MarketOverview';
import CorrelationMatrix from '@/components/dashboard/CorrelationMatrix';
import MethodologyModal from '@/components/dashboard/MethodologyModal';
import SaveReportDialog from '@/components/dashboard/SaveReportDialog';
import SavedReportsModal from '@/components/dashboard/SavedReportsModal';

const AppLayout: React.FC = () => {
  // Dashboard configuration (persisted to localStorage)
  const { config, updateConfig } = useDashboardConfig();

  // Modal states
  const [showMethodology, setShowMethodology] = useState(false);
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [showReportsModal, setShowReportsModal] = useState(false);
  const [loadingReportId, setLoadingReportId] = useState<string | null>(null);

  // Analysis reports (database persistence)
  const {
    reports,
    totalCount: savedReportsCount,
    loading: reportsLoading,
    saving: reportSaving,
    error: reportsError,
    saveReport,
    loadReports,
    loadFullReport,
    deleteReport,
  } = useAnalysisReports();

  // Fetch market data for all selected coins
  const {
    data: marketData,
    loading: marketLoading,
    lastUpdated,
    refetch: refetchMarket,
  } = useMarketData(config.selectedCoins);

  // Fetch historical data for the primary selected coin
  const {
    data: historicalData,
    loading: historicalLoading,
    refetch: refetchHistorical,
  } = useHistoricalData(config.primaryCoin, config.timeRange);

  // Fetch comparison data for two coins
  const {
    coinA: compDataA,
    coinB: compDataB,
    loading: compLoading,
    refetch: refetchComparison,
  } = useComparisonData(config.primaryCoin, config.comparisonCoin, config.timeRange);

  // Refresh all data
  const refreshAll = useCallback(() => {
    refetchMarket();
    refetchHistorical();
    refetchComparison();
  }, [refetchMarket, refetchHistorical, refetchComparison]);

  // Auto-refresh
  useAutoRefresh(refreshAll, config.refreshInterval * 1000, config.autoRefresh);

  // Get the selected coin's market data for KPI cards
  const selectedCoinData = useMemo(() => {
    return marketData.find(c => c.id === config.primaryCoin) || null;
  }, [marketData, config.primaryCoin]);

  // Get coin name
  const coinName = useMemo(() => {
    const coin = SUPPORTED_COINS.find(c => c.id === config.primaryCoin);
    return coin?.name || config.primaryCoin;
  }, [config.primaryCoin]);

  // Process chart data with indicators
  const chartData = useMemo(() => {
    if (!historicalData) return [];
    return processChartData(
      historicalData.prices,
      historicalData.volumes,
      {
        showMA7: config.showMA7,
        showMA30: config.showMA30,
        showMA200: config.showMA200,
        showTrendLine: config.showTrendLine,
      }
    );
  }, [historicalData, config.showMA7, config.showMA30, config.showMA200, config.showTrendLine]);

  // Generate analysis insights
  const insights = useMemo(() => {
    if (!historicalData || !historicalData.prices.length) return [];
    const prices = historicalData.prices.map(p => p.value);
    const volumes = historicalData.volumes.map(v => v.value);
    return generateInsights(coinName, prices, volumes, historicalData.stats, config.timeRange);
  }, [historicalData, coinName, config.timeRange]);

  // Handle CSV export
  const handleExport = useCallback(() => {
    if (chartData.length > 0) {
      exportToCSV(chartData, coinName, config.timeRange);
    }
  }, [chartData, coinName, config.timeRange]);

  // Handle coin selection from market overview
  const handleSelectCoin = useCallback((coinId: string) => {
    updateConfig({ primaryCoin: coinId });
  }, [updateConfig]);

  // Handle saving a report
  const handleSaveReport = useCallback(async (title: string, notes: string): Promise<boolean> => {
    return saveReport({
      coinId: config.primaryCoin,
      coinName,
      timeRange: config.timeRange,
      title,
      notes,
      insights,
      config,
      stats: historicalData?.stats || null,
    });
  }, [saveReport, config, coinName, insights, historicalData]);

  // Handle loading a saved report (restores dashboard config and re-fetches data)
  const handleLoadReport = useCallback(async (id: string) => {
    setLoadingReportId(id);
    try {
      const report = await loadFullReport(id);
      if (report) {
        // Restore the dashboard configuration from the saved report
        updateConfig({
          primaryCoin: report.coin_id,
          timeRange: report.time_range,
          showMA7: report.chart_config.showMA7,
          showMA30: report.chart_config.showMA30,
          showMA200: report.chart_config.showMA200,
          showTrendLine: report.chart_config.showTrendLine,
          comparisonCoin: report.chart_config.comparisonCoin,
        });
        // Close the modal after loading
        setShowReportsModal(false);
      }
    } finally {
      setLoadingReportId(null);
    }
  }, [loadFullReport, updateConfig]);

  // Handle deleting a report
  const handleDeleteReport = useCallback(async (id: string) => {
    await deleteReport(id);
  }, [deleteReport]);

  const isLoading = marketLoading || historicalLoading;

  return (
    <div className="min-h-screen bg-[#070E1A] text-white">
      {/* Header */}
      <Header
        lastUpdated={lastUpdated}
        isLoading={isLoading}
        autoRefresh={config.autoRefresh}
        onRefresh={refreshAll}
        onToggleAutoRefresh={() => updateConfig({ autoRefresh: !config.autoRefresh })}
        onExport={handleExport}
        onToggleMethodology={() => setShowMethodology(true)}
        onOpenReports={() => setShowReportsModal(true)}
        savedReportsCount={savedReportsCount}
      />

      {/* Filter Panel */}
      <FilterPanel config={config} onUpdateConfig={updateConfig} />

      {/* Main Content */}
      <main className="px-4 lg:px-6 py-4 space-y-4">
        {/* KPI Cards */}
        <KPICards coin={selectedCoinData} loading={marketLoading} />

        {/* Statistics Bar */}
        <StatsBar
          stats={historicalData?.stats || null}
          prices={historicalData?.prices.map(p => p.value) || []}
          loading={historicalLoading}
          coinName={coinName}
        />

        {/* Charts Grid - Main content area */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
          {/* Left Column - Charts (2/3 width) */}
          <div className="xl:col-span-2 space-y-4">
            {/* Price Chart */}
            <PriceChart
              data={chartData}
              coinName={coinName}
              loading={historicalLoading}
              showMA7={config.showMA7}
              showMA30={config.showMA30}
              showMA200={config.showMA200}
              showTrendLine={config.showTrendLine}
            />

            {/* Volume and Market Cap side by side */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <VolumeChart
                data={chartData}
                coinName={coinName}
                loading={historicalLoading}
              />
              <MarketCapChart
                data={historicalData?.marketCaps || []}
                coinName={coinName}
                loading={historicalLoading}
              />
            </div>

            {/* Comparison Chart */}
            <ComparisonChart
              dataA={compDataA.data?.prices || []}
              dataB={compDataB.data?.prices || []}
              coinAId={config.primaryCoin}
              coinBId={config.comparisonCoin}
              loading={compLoading}
            />
          </div>

          {/* Right Column - Analysis Insights (1/3 width) */}
          <div className="space-y-4">
            <AnalysisInsights
              insights={insights}
              coinName={coinName}
              loading={historicalLoading}
              days={config.timeRange}
              onSaveReport={() => setShowSaveDialog(true)}
              onOpenReports={() => setShowReportsModal(true)}
              saving={reportSaving}
              savedCount={savedReportsCount}
            />
            <CorrelationMatrix
              coins={marketData}
              loading={marketLoading}
            />
          </div>
        </div>

        {/* Market Overview Table */}
        <MarketOverview
          data={marketData}
          loading={marketLoading}
          onSelectCoin={handleSelectCoin}
          selectedCoin={config.primaryCoin}
        />

        {/* Footer */}
        <footer className="border-t border-slate-800/50 pt-6 pb-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* About */}
            <div>
              <h4 className="text-sm font-semibold text-white mb-2">CryptoMetrics Dashboard</h4>
              <p className="text-xs text-slate-500 leading-relaxed">
                A production-grade analytics platform for visualizing on-chain metrics and market data 
                of crypto assets. Built as part of a bachelor thesis research project demonstrating 
                real-time API-based data collection, processing, and visualization methodologies.
              </p>
            </div>

            {/* Data Sources */}
            <div>
              <h4 className="text-sm font-semibold text-white mb-2">Data Sources</h4>
              <ul className="space-y-1.5">
                <li className="text-xs text-slate-500 flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                  CoinGecko API — Market Data & Historical Prices
                </li>
                <li className="text-xs text-slate-500 flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-400" />
                  Supabase Edge Functions — Backend API Layer
                </li>
                <li className="text-xs text-slate-500 flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-purple-400" />
                  PostgreSQL Database — Report Persistence
                </li>
              </ul>
            </div>

            {/* Analytical Methods */}
            <div>
              <h4 className="text-sm font-semibold text-white mb-2">Analytical Methods</h4>
              <ul className="space-y-1.5">
                <li className="text-xs text-slate-500 flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-yellow-400" />
                  Simple Moving Averages (SMA-7, SMA-30, SMA-200)
                </li>
                <li className="text-xs text-slate-500 flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
                  Linear Regression & Trend Detection
                </li>
                <li className="text-xs text-slate-500 flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-pink-400" />
                  Pearson Correlation & Volatility Analysis
                </li>
              </ul>
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-slate-800/50 flex flex-wrap items-center justify-between gap-4">
            <div className="text-[10px] text-slate-600">
              Bachelor Thesis Project — On-Chain Metrics Dashboard — {new Date().getFullYear()}
            </div>
            <div className="flex items-center gap-4">
              <button
                onClick={() => setShowMethodology(true)}
                className="text-[10px] text-cyan-400/60 hover:text-cyan-400 transition-colors"
              >
                Research Methodology
              </button>
              <span className="text-[10px] text-slate-700">|</span>
              <button
                onClick={() => setShowReportsModal(true)}
                className="text-[10px] text-violet-400/60 hover:text-violet-400 transition-colors"
              >
                {savedReportsCount} Saved Report{savedReportsCount !== 1 ? 's' : ''}
              </button>
              <span className="text-[10px] text-slate-700">|</span>
              <span className="text-[10px] text-slate-600">
                Data refreshes every {config.refreshInterval}s
              </span>
              <span className="text-[10px] text-slate-700">|</span>
              <span className="text-[10px] text-slate-600">
                React + Recharts + Supabase + CoinGecko
              </span>
            </div>
          </div>
        </footer>
      </main>

      {/* Methodology Modal */}
      <MethodologyModal
        isOpen={showMethodology}
        onClose={() => setShowMethodology(false)}
      />

      {/* Save Report Dialog */}
      <SaveReportDialog
        isOpen={showSaveDialog}
        onClose={() => setShowSaveDialog(false)}
        onSave={handleSaveReport}
        saving={reportSaving}
        coinId={config.primaryCoin}
        timeRange={config.timeRange}
      />

      {/* Saved Reports Modal */}
      <SavedReportsModal
        isOpen={showReportsModal}
        onClose={() => setShowReportsModal(false)}
        reports={reports}
        loading={reportsLoading}
        error={reportsError}
        onLoadReport={handleLoadReport}
        onDeleteReport={handleDeleteReport}
        onRefresh={loadReports}
        loadingReportId={loadingReportId}
      />
    </div>
  );
};

export default AppLayout;
