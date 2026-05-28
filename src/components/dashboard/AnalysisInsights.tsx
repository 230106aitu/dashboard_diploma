/**
 * ANALYSIS INSIGHTS COMPONENT
 * 
 * This is the RESEARCH COMPONENT required by the thesis.
 * It automatically generates analytical interpretations based on
 * the collected market data, demonstrating how visualization tools
 * can provide actionable insights.
 * 
 * Features:
 * - Trend detection results
 * - Volatility analysis
 * - Volume analysis
 * - Momentum indicators
 * - Support/Resistance levels
 * - Linear trend projections
 * - Save Report button (persists to database)
 * 
 * Each insight includes:
 * - Severity classification (bullish/bearish/neutral)
 * - Descriptive text explaining the finding
 * - Relevant metric values
 */

import React from 'react';
import { AnalysisInsight } from '@/types/crypto';
import {
  TrendingUp,
  TrendingDown,
  Activity,
  BarChart3,
  Target,
  Zap,
  AlertTriangle,
  ArrowRight,
  Minus,
  BookOpen,
  Save,
  FolderOpen,
  Loader2,
} from 'lucide-react';

interface AnalysisInsightsProps {
  insights: AnalysisInsight[];
  coinName: string;
  loading: boolean;
  days: number;
  onSaveReport: () => void;
  onOpenReports: () => void;
  saving: boolean;
  savedCount: number;
}

const AnalysisInsights: React.FC<AnalysisInsightsProps> = ({
  insights,
  coinName,
  loading,
  days,
  onSaveReport,
  onOpenReports,
  saving,
  savedCount,
}) => {
  if (loading) {
    return (
      <div className="bg-[#0F1B2E] rounded-xl border border-slate-700/30 p-4">
        <div className="h-5 bg-slate-700 rounded w-40 mb-4 animate-pulse" />
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="mb-3 p-3 bg-slate-800/50 rounded-lg animate-pulse">
            <div className="h-4 bg-slate-700 rounded w-32 mb-2" />
            <div className="h-3 bg-slate-700 rounded w-full mb-1" />
            <div className="h-3 bg-slate-700 rounded w-3/4" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="bg-[#0F1B2E] rounded-xl border border-slate-700/30 p-4">
      {/* Header with Save/Open buttons */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center">
            <BookOpen className="w-4 h-4 text-white" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-white">Analysis Insights</h3>
            <p className="text-[10px] text-slate-500">
              {coinName} — {days}-day analysis
            </p>
          </div>
        </div>
        <div className="flex items-center gap-1.5">
          {/* Saved Reports button */}
          <button
            onClick={onOpenReports}
            className="relative flex items-center gap-1 px-2 py-1.5 text-[10px] font-medium text-violet-400 bg-violet-400/10 border border-violet-400/20 rounded-lg hover:bg-violet-400/20 transition-colors"
            title="View saved reports"
          >
            <FolderOpen className="w-3 h-3" />
            <span className="hidden sm:inline">Reports</span>
            {savedCount > 0 && (
              <span className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full bg-violet-500 text-white text-[8px] font-bold flex items-center justify-center">
                {savedCount > 9 ? '9+' : savedCount}
              </span>
            )}
          </button>
          {/* Save button */}
          <button
            onClick={onSaveReport}
            disabled={saving || insights.length === 0}
            className="flex items-center gap-1 px-2 py-1.5 text-[10px] font-medium text-amber-400 bg-amber-400/10 border border-amber-400/20 rounded-lg hover:bg-amber-400/20 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            title="Save current analysis to database"
          >
            {saving ? (
              <Loader2 className="w-3 h-3 animate-spin" />
            ) : (
              <Save className="w-3 h-3" />
            )}
            <span className="hidden sm:inline">Save</span>
          </button>
        </div>
      </div>

      {/* Methodology note */}
      <div className="mb-3 p-2.5 bg-cyan-400/5 border border-cyan-400/10 rounded-lg">
        <p className="text-[10px] text-cyan-400/70 leading-relaxed">
          <span className="font-semibold">Research Note:</span> These insights are automatically generated using statistical analysis of {days}-day historical data collected via the CoinGecko API. Methods include linear regression, moving averages, and standard deviation calculations.
        </p>
      </div>

      <div className="space-y-2.5 max-h-[500px] overflow-y-auto pr-1 custom-scrollbar">
        {insights.map((insight) => (
          <InsightCard key={insight.id} insight={insight} />
        ))}
      </div>

      {insights.length === 0 && (
        <div className="text-center py-8 text-slate-500 text-sm">
          No insights available. Select an asset and time range to generate analysis.
        </div>
      )}
    </div>
  );
};

function InsightCard({ insight }: { insight: AnalysisInsight }) {
  const getIcon = () => {
    switch (insight.type) {
      case 'trend': return insight.severity === 'bullish' ? TrendingUp : insight.severity === 'bearish' ? TrendingDown : Minus;
      case 'volume': return BarChart3;
      case 'volatility': return Activity;
      case 'comparison': return ArrowRight;
      case 'prediction': return Zap;
      case 'support_resistance': return Target;
      default: return AlertTriangle;
    }
  };

  const getColors = () => {
    switch (insight.severity) {
      case 'bullish':
        return {
          bg: 'bg-emerald-400/5',
          border: 'border-emerald-400/20',
          icon: 'text-emerald-400',
          badge: 'bg-emerald-400/10 text-emerald-400',
        };
      case 'bearish':
        return {
          bg: 'bg-red-400/5',
          border: 'border-red-400/20',
          icon: 'text-red-400',
          badge: 'bg-red-400/10 text-red-400',
        };
      default:
        return {
          bg: 'bg-slate-400/5',
          border: 'border-slate-600/20',
          icon: 'text-slate-400',
          badge: 'bg-slate-400/10 text-slate-400',
        };
    }
  };

  const Icon = getIcon();
  const colors = getColors();

  return (
    <div className={`p-3 rounded-lg border ${colors.bg} ${colors.border} transition-all hover:border-opacity-40`}>
      <div className="flex items-start gap-2.5">
        <div className={`mt-0.5 ${colors.icon}`}>
          <Icon className="w-4 h-4" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h4 className="text-xs font-semibold text-white truncate">
              {insight.title}
            </h4>
            <span className={`text-[9px] font-bold uppercase px-1.5 py-0.5 rounded ${colors.badge}`}>
              {insight.severity}
            </span>
          </div>
          <p className="text-[11px] text-slate-400 leading-relaxed">
            {insight.description}
          </p>
          {insight.metric && (
            <div className="mt-1.5 flex items-center gap-1.5">
              <span className="text-[9px] text-slate-600 uppercase tracking-wider font-medium">
                {insight.metric}
              </span>
              {insight.value !== undefined && (
                <span className="text-[10px] font-mono text-slate-400">
                  {typeof insight.value === 'number' ? insight.value.toFixed(2) : insight.value}
                </span>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default AnalysisInsights;
