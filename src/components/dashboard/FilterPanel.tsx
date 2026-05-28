/**
 * FILTER PANEL COMPONENT
 * 
 * Provides controls for:
 * - Asset selection (primary and comparison)
 * - Time range selection (7/30/90/365 days)
 * - Indicator toggles (MA7, MA30, MA200, Trend Line)
 * 
 * Configuration is persisted to localStorage via the useDashboardConfig hook.
 */

import React from 'react';
import { DashboardConfig, SUPPORTED_COINS, TIME_RANGES } from '@/types/crypto';
import {
  TrendingUp,
  BarChart3,
  GitCompare,
  SlidersHorizontal,
  ChevronDown,
} from 'lucide-react';

interface FilterPanelProps {
  config: DashboardConfig;
  onUpdateConfig: (updates: Partial<DashboardConfig>) => void;
}

const FilterPanel: React.FC<FilterPanelProps> = ({ config, onUpdateConfig }) => {
  return (
    <div className="bg-[#0B1426] border-b border-slate-700/50 px-4 lg:px-6 py-3">
      <div className="flex flex-wrap items-center gap-3 lg:gap-5">
        {/* Primary Asset Selector */}
        <div className="flex items-center gap-2">
          <TrendingUp className="w-4 h-4 text-slate-500" />
          <span className="text-xs text-slate-500 font-medium uppercase tracking-wider hidden sm:inline">Asset</span>
          <div className="relative">
            <select
              value={config.primaryCoin}
              onChange={(e) => onUpdateConfig({ primaryCoin: e.target.value })}
              className="appearance-none bg-slate-800 border border-slate-700 text-white text-sm rounded-lg px-3 py-1.5 pr-8 focus:ring-1 focus:ring-cyan-400 focus:border-cyan-400 outline-none cursor-pointer"
            >
              {SUPPORTED_COINS.map(coin => (
                <option key={coin.id} value={coin.id}>
                  {coin.symbol} - {coin.name}
                </option>
              ))}
            </select>
            <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
          </div>
        </div>

        {/* Comparison Asset */}
        <div className="flex items-center gap-2">
          <GitCompare className="w-4 h-4 text-slate-500" />
          <span className="text-xs text-slate-500 font-medium uppercase tracking-wider hidden sm:inline">Compare</span>
          <div className="relative">
            <select
              value={config.comparisonCoin}
              onChange={(e) => onUpdateConfig({ comparisonCoin: e.target.value })}
              className="appearance-none bg-slate-800 border border-slate-700 text-white text-sm rounded-lg px-3 py-1.5 pr-8 focus:ring-1 focus:ring-cyan-400 focus:border-cyan-400 outline-none cursor-pointer"
            >
              {SUPPORTED_COINS.map(coin => (
                <option key={coin.id} value={coin.id}>
                  {coin.symbol} - {coin.name}
                </option>
              ))}
            </select>
            <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
          </div>
        </div>

        {/* Divider */}
        <div className="hidden lg:block w-px h-6 bg-slate-700" />

        {/* Time Range */}
        <div className="flex items-center gap-2">
          <BarChart3 className="w-4 h-4 text-slate-500" />
          <span className="text-xs text-slate-500 font-medium uppercase tracking-wider hidden sm:inline">Range</span>
          <div className="flex bg-slate-800 rounded-lg border border-slate-700 overflow-hidden">
            {TIME_RANGES.map(range => (
              <button
                key={range.value}
                onClick={() => onUpdateConfig({ timeRange: range.value })}
                className={`px-3 py-1.5 text-xs font-semibold transition-all ${
                  config.timeRange === range.value
                    ? 'bg-cyan-500 text-white'
                    : 'text-slate-400 hover:text-white hover:bg-slate-700'
                }`}
              >
                {range.label}
              </button>
            ))}
          </div>
        </div>

        {/* Divider */}
        <div className="hidden lg:block w-px h-6 bg-slate-700" />

        {/* Indicators */}
        <div className="flex items-center gap-2">
          <SlidersHorizontal className="w-4 h-4 text-slate-500" />
          <span className="text-xs text-slate-500 font-medium uppercase tracking-wider hidden sm:inline">Indicators</span>
          <div className="flex gap-1.5">
            <IndicatorToggle
              label="MA7"
              active={config.showMA7}
              color="text-yellow-400 bg-yellow-400/10 border-yellow-400/30"
              onClick={() => onUpdateConfig({ showMA7: !config.showMA7 })}
            />
            <IndicatorToggle
              label="MA30"
              active={config.showMA30}
              color="text-purple-400 bg-purple-400/10 border-purple-400/30"
              onClick={() => onUpdateConfig({ showMA30: !config.showMA30 })}
            />
            <IndicatorToggle
              label="MA200"
              active={config.showMA200}
              color="text-pink-400 bg-pink-400/10 border-pink-400/30"
              onClick={() => onUpdateConfig({ showMA200: !config.showMA200 })}
            />
            <IndicatorToggle
              label="Trend"
              active={config.showTrendLine}
              color="text-emerald-400 bg-emerald-400/10 border-emerald-400/30"
              onClick={() => onUpdateConfig({ showTrendLine: !config.showTrendLine })}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

function IndicatorToggle({ label, active, color, onClick }: {
  label: string;
  active: boolean;
  color: string;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`px-2.5 py-1 text-xs font-semibold rounded-md border transition-all ${
        active
          ? color
          : 'text-slate-500 bg-slate-800/50 border-slate-700 hover:text-slate-300'
      }`}
    >
      {label}
    </button>
  );
}

export default FilterPanel;
