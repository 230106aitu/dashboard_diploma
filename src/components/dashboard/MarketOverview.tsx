/**
 * MARKET OVERVIEW TABLE COMPONENT
 * 
 * Displays a comprehensive overview of all tracked crypto assets
 * in a sortable table format. Includes mini sparkline charts for
 * quick visual trend assessment.
 * 
 * This component demonstrates the multi-asset support requirement
 * of the thesis specification.
 */

import React, { useState, useMemo } from 'react';
import { CoinMarketData } from '@/types/crypto';
import { formatCurrency, formatPercent, formatNumber } from '@/utils/analysis';
import { ArrowUp, ArrowDown, ChevronUp, ChevronDown } from 'lucide-react';

interface MarketOverviewProps {
  data: CoinMarketData[];
  loading: boolean;
  onSelectCoin: (coinId: string) => void;
  selectedCoin: string;
}

type SortKey = 'market_cap_rank' | 'current_price' | 'price_change_percentage_24h' | 'total_volume' | 'market_cap';

const MarketOverview: React.FC<MarketOverviewProps> = ({
  data,
  loading,
  onSelectCoin,
  selectedCoin,
}) => {
  const [sortKey, setSortKey] = useState<SortKey>('market_cap_rank');
  const [sortAsc, setSortAsc] = useState(true);

  const sortedData = useMemo(() => {
    const sorted = [...data].sort((a, b) => {
      const aVal = a[sortKey] ?? 0;
      const bVal = b[sortKey] ?? 0;
      return sortAsc ? (aVal as number) - (bVal as number) : (bVal as number) - (aVal as number);
    });
    return sorted;
  }, [data, sortKey, sortAsc]);

  const handleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortAsc(!sortAsc);
    } else {
      setSortKey(key);
      setSortAsc(key === 'market_cap_rank');
    }
  };

  if (loading) {
    return (
      <div className="bg-[#0F1B2E] rounded-xl border border-slate-700/30 p-4">
        <div className="h-5 bg-slate-700 rounded w-40 mb-4 animate-pulse" />
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="flex items-center gap-4 py-3 animate-pulse">
            <div className="w-8 h-8 bg-slate-700 rounded-full" />
            <div className="h-4 bg-slate-700 rounded w-24" />
            <div className="h-4 bg-slate-700 rounded w-20 ml-auto" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="bg-[#0F1B2E] rounded-xl border border-slate-700/30 p-4">
      <h3 className="text-sm font-semibold text-white mb-3">Market Overview</h3>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-slate-700/50">
              <SortHeader label="#" sortKey="market_cap_rank" currentSort={sortKey} asc={sortAsc} onSort={handleSort} />
              <th className="text-left text-[10px] text-slate-500 font-medium uppercase tracking-wider pb-2 px-2">Asset</th>
              <SortHeader label="Price" sortKey="current_price" currentSort={sortKey} asc={sortAsc} onSort={handleSort} align="right" />
              <SortHeader label="24h %" sortKey="price_change_percentage_24h" currentSort={sortKey} asc={sortAsc} onSort={handleSort} align="right" />
              <SortHeader label="Volume" sortKey="total_volume" currentSort={sortKey} asc={sortAsc} onSort={handleSort} align="right" className="hidden sm:table-cell" />
              <SortHeader label="Market Cap" sortKey="market_cap" currentSort={sortKey} asc={sortAsc} onSort={handleSort} align="right" className="hidden md:table-cell" />
              <th className="text-right text-[10px] text-slate-500 font-medium uppercase tracking-wider pb-2 px-2 hidden lg:table-cell">7d Chart</th>
            </tr>
          </thead>
          <tbody>
            {sortedData.map((coin) => {
              const isSelected = coin.id === selectedCoin;
              const change24h = coin.price_change_percentage_24h;
              const isPositive = change24h >= 0;

              return (
                <tr
                  key={coin.id}
                  onClick={() => onSelectCoin(coin.id)}
                  className={`border-b border-slate-800/50 cursor-pointer transition-colors ${
                    isSelected
                      ? 'bg-cyan-400/5 border-l-2 border-l-cyan-400'
                      : 'hover:bg-slate-800/30'
                  }`}
                >
                  <td className="py-2.5 px-2 text-xs text-slate-500 font-mono">
                    {coin.market_cap_rank}
                  </td>
                  <td className="py-2.5 px-2">
                    <div className="flex items-center gap-2">
                      <img
                        src={coin.image}
                        alt={coin.name}
                        className="w-6 h-6 rounded-full"
                        loading="lazy"
                      />
                      <div>
                        <span className="text-xs font-semibold text-white">{coin.symbol}</span>
                        <span className="text-[10px] text-slate-500 ml-1.5 hidden sm:inline">{coin.name}</span>
                      </div>
                    </div>
                  </td>
                  <td className="py-2.5 px-2 text-right text-xs font-mono text-white">
                    {formatCurrency(coin.current_price)}
                  </td>
                  <td className="py-2.5 px-2 text-right">
                    <span className={`inline-flex items-center gap-0.5 text-xs font-medium ${
                      isPositive ? 'text-emerald-400' : 'text-red-400'
                    }`}>
                      {isPositive ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" />}
                      {Math.abs(change24h).toFixed(2)}%
                    </span>
                  </td>
                  <td className="py-2.5 px-2 text-right text-xs text-slate-400 font-mono hidden sm:table-cell">
                    {formatCurrency(coin.total_volume)}
                  </td>
                  <td className="py-2.5 px-2 text-right text-xs text-slate-400 font-mono hidden md:table-cell">
                    {formatCurrency(coin.market_cap)}
                  </td>
                  <td className="py-2.5 px-2 hidden lg:table-cell">
                    <MiniSparkline data={coin.sparkline_7d} positive={isPositive} />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

function SortHeader({ label, sortKey, currentSort, asc, onSort, align = 'left', className = '' }: {
  label: string;
  sortKey: SortKey;
  currentSort: SortKey;
  asc: boolean;
  onSort: (key: SortKey) => void;
  align?: 'left' | 'right';
  className?: string;
}) {
  const isActive = currentSort === sortKey;
  return (
    <th
      className={`text-${align} text-[10px] text-slate-500 font-medium uppercase tracking-wider pb-2 px-2 cursor-pointer hover:text-slate-300 select-none ${className}`}
      onClick={() => onSort(sortKey)}
    >
      <span className="inline-flex items-center gap-0.5">
        {label}
        {isActive && (
          asc ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />
        )}
      </span>
    </th>
  );
}

function MiniSparkline({ data, positive }: { data: number[]; positive: boolean }) {
  if (!data || data.length === 0) return null;

  // Sample to ~30 points for performance
  const step = Math.max(1, Math.floor(data.length / 30));
  const sampled = data.filter((_, i) => i % step === 0);

  const min = Math.min(...sampled);
  const max = Math.max(...sampled);
  const range = max - min || 1;
  const width = 80;
  const height = 24;

  const points = sampled.map((val, i) => {
    const x = (i / (sampled.length - 1)) * width;
    const y = height - ((val - min) / range) * height;
    return `${x},${y}`;
  }).join(' ');

  return (
    <svg width={width} height={height} className="ml-auto">
      <polyline
        points={points}
        fill="none"
        stroke={positive ? '#34d399' : '#f87171'}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export default MarketOverview;
