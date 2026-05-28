/**
 * KPI CARDS COMPONENT
 * 
 * Displays key performance indicators for the selected crypto asset.
 * These metrics provide an at-a-glance overview of market conditions,
 * which is essential for the thesis visualization requirements.
 * 
 * Metrics displayed:
 * - Current Price
 * - Market Cap
 * - 24h Volume
 * - 24h Change
 * - 7d Change
 * - 30d Change
 * - Circulating Supply
 * - ATH Distance
 */

import React from 'react';
import { CoinMarketData } from '@/types/crypto';
import { formatCurrency, formatPercent, formatNumber } from '@/utils/analysis';
import {
  DollarSign,
  BarChart3,
  TrendingUp,
  TrendingDown,
  Activity,
  Layers,
  Target,
  Coins,
  ArrowUp,
  ArrowDown,
  Minus,
} from 'lucide-react';

interface KPICardsProps {
  coin: CoinMarketData | null;
  loading: boolean;
}

const KPICards: React.FC<KPICardsProps> = ({ coin, loading }) => {
  if (loading) {
    return (
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="bg-slate-800/50 rounded-xl p-3 animate-pulse border border-slate-700/30">
            <div className="h-3 bg-slate-700 rounded w-16 mb-2" />
            <div className="h-6 bg-slate-700 rounded w-20 mb-1" />
            <div className="h-3 bg-slate-700 rounded w-12" />
          </div>
        ))}
      </div>
    );
  }

  if (!coin) return null;

  const kpis = [
    {
      label: 'Price',
      value: formatCurrency(coin.current_price),
      change: coin.price_change_percentage_24h,
      icon: DollarSign,
      color: 'from-blue-500 to-cyan-500',
    },
    {
      label: 'Market Cap',
      value: formatCurrency(coin.market_cap),
      sublabel: `Rank #${coin.market_cap_rank}`,
      icon: Layers,
      color: 'from-purple-500 to-indigo-500',
    },
    {
      label: '24h Volume',
      value: formatCurrency(coin.total_volume),
      sublabel: `${((coin.total_volume / coin.market_cap) * 100).toFixed(1)}% of MCap`,
      icon: BarChart3,
      color: 'from-emerald-500 to-teal-500',
    },
    {
      label: '1h Change',
      value: formatPercent(coin.price_change_percentage_1h),
      change: coin.price_change_percentage_1h,
      icon: Activity,
      color: 'from-amber-500 to-orange-500',
    },
    {
      label: '24h Change',
      value: formatPercent(coin.price_change_percentage_24h),
      change: coin.price_change_percentage_24h,
      icon: coin.price_change_percentage_24h >= 0 ? TrendingUp : TrendingDown,
      color: 'from-cyan-500 to-blue-500',
    },
    {
      label: '7d Change',
      value: formatPercent(coin.price_change_percentage_7d),
      change: coin.price_change_percentage_7d,
      icon: coin.price_change_percentage_7d >= 0 ? TrendingUp : TrendingDown,
      color: 'from-violet-500 to-purple-500',
    },
    {
      label: 'Circulating',
      value: formatNumber(coin.circulating_supply) + ' ' + coin.symbol,
      sublabel: coin.max_supply ? `${((coin.circulating_supply / coin.max_supply) * 100).toFixed(1)}% of max` : 'No max supply',
      icon: Coins,
      color: 'from-rose-500 to-pink-500',
    },
    {
      label: 'ATH Distance',
      value: formatPercent(coin.ath_change_percentage),
      sublabel: `ATH: ${formatCurrency(coin.ath)}`,
      change: coin.ath_change_percentage,
      icon: Target,
      color: 'from-teal-500 to-emerald-500',
    },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
      {kpis.map((kpi, i) => {
        const Icon = kpi.icon;
        const isPositive = kpi.change !== undefined ? kpi.change > 0 : undefined;
        const isNegative = kpi.change !== undefined ? kpi.change < 0 : undefined;

        return (
          <div
            key={i}
            className="bg-[#0F1B2E] rounded-xl p-3 border border-slate-700/30 hover:border-slate-600/50 transition-all group"
          >
            <div className="flex items-center gap-1.5 mb-1.5">
              <div className={`w-5 h-5 rounded-md bg-gradient-to-br ${kpi.color} flex items-center justify-center`}>
                <Icon className="w-3 h-3 text-white" />
              </div>
              <span className="text-[10px] text-slate-500 font-medium uppercase tracking-wider">
                {kpi.label}
              </span>
            </div>
            <div className="text-sm font-bold text-white leading-tight mb-0.5">
              {kpi.value}
            </div>
            {kpi.sublabel && (
              <div className="text-[10px] text-slate-500">{kpi.sublabel}</div>
            )}
            {kpi.change !== undefined && !kpi.sublabel && (
              <div className={`flex items-center gap-0.5 text-[10px] font-medium ${
                isPositive ? 'text-emerald-400' : isNegative ? 'text-red-400' : 'text-slate-400'
              }`}>
                {isPositive ? <ArrowUp className="w-2.5 h-2.5" /> : isNegative ? <ArrowDown className="w-2.5 h-2.5" /> : <Minus className="w-2.5 h-2.5" />}
                <span>24h</span>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};

export default KPICards;
