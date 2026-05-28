/**
 * STATISTICS BAR COMPONENT
 * 
 * Displays statistical summary metrics for the selected asset
 * and time period. These metrics support the empirical analysis
 * component of the thesis.
 */

import React from 'react';
import { DataStats } from '@/types/crypto';
import { formatCurrency, formatNumber, formatPercent } from '@/utils/analysis';
import { calculateVolatility, calculateMomentum, detectTrend } from '@/utils/analysis';
import {
  TrendingUp,
  TrendingDown,
  Minus,
  BarChart3,
  Activity,
  Zap,
  ArrowUpDown,
} from 'lucide-react';

interface StatsBarProps {
  stats: DataStats | null;
  prices: number[];
  loading: boolean;
  coinName: string;
}

const StatsBar: React.FC<StatsBarProps> = ({ stats, prices, loading, coinName }) => {
  if (loading || !stats) {
    return (
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="bg-[#0F1B2E] rounded-xl border border-slate-700/30 p-3 animate-pulse">
            <div className="h-3 bg-slate-700 rounded w-16 mb-2" />
            <div className="h-5 bg-slate-700 rounded w-20" />
          </div>
        ))}
      </div>
    );
  }

  const trend = detectTrend(prices);
  const volatility = calculateVolatility(prices);
  const momentum = calculateMomentum(prices);

  const statItems = [
    {
      label: 'Period Change',
      value: formatPercent(stats.price.change),
      icon: stats.price.change >= 0 ? TrendingUp : TrendingDown,
      color: stats.price.change >= 0 ? 'text-emerald-400' : 'text-red-400',
    },
    {
      label: 'Price Range',
      value: `${formatCurrency(stats.price.min)} — ${formatCurrency(stats.price.max)}`,
      icon: ArrowUpDown,
      color: 'text-cyan-400',
      small: true,
    },
    {
      label: 'Mean Price',
      value: formatCurrency(stats.price.mean),
      icon: BarChart3,
      color: 'text-blue-400',
    },
    {
      label: 'Volatility',
      value: `${volatility.toFixed(1)}%`,
      icon: Activity,
      color: volatility > 80 ? 'text-red-400' : volatility > 40 ? 'text-yellow-400' : 'text-emerald-400',
    },
    {
      label: 'Momentum',
      value: `${momentum >= 0 ? '+' : ''}${momentum.toFixed(2)}%`,
      icon: Zap,
      color: momentum >= 0 ? 'text-emerald-400' : 'text-red-400',
    },
    {
      label: 'Trend',
      value: trend.charAt(0).toUpperCase() + trend.slice(1),
      icon: trend === 'uptrend' ? TrendingUp : trend === 'downtrend' ? TrendingDown : Minus,
      color: trend === 'uptrend' ? 'text-emerald-400' : trend === 'downtrend' ? 'text-red-400' : 'text-slate-400',
    },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
      {statItems.map((item, i) => {
        const Icon = item.icon;
        return (
          <div
            key={i}
            className="bg-[#0F1B2E] rounded-xl border border-slate-700/30 p-3 hover:border-slate-600/50 transition-all"
          >
            <div className="flex items-center gap-1.5 mb-1">
              <Icon className={`w-3.5 h-3.5 ${item.color}`} />
              <span className="text-[10px] text-slate-500 font-medium uppercase tracking-wider">
                {item.label}
              </span>
            </div>
            <div className={`font-bold ${item.color} ${item.small ? 'text-[11px]' : 'text-sm'}`}>
              {item.value}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default StatsBar;
