/**
 * CORRELATION MATRIX COMPONENT
 * 
 * Displays a heatmap of Pearson correlation coefficients between
 * tracked crypto assets. This is a key analytical visualization
 * for the thesis, showing how different assets move in relation
 * to each other.
 * 
 * Interpretation:
 * - +1.0: Perfect positive correlation (move together)
 * -  0.0: No correlation (independent movement)
 * - -1.0: Perfect negative correlation (move opposite)
 */

import React from 'react';
import { CoinMarketData } from '@/types/crypto';
import { calculateCorrelation } from '@/utils/analysis';

interface CorrelationMatrixProps {
  coins: CoinMarketData[];
  loading: boolean;
}

const CorrelationMatrix: React.FC<CorrelationMatrixProps> = ({ coins, loading }) => {
  if (loading || coins.length < 2) {
    return (
      <div className="bg-[#0F1B2E] rounded-xl border border-slate-700/30 p-4">
        <div className="h-5 bg-slate-700 rounded w-40 mb-4 animate-pulse" />
        <div className="h-48 bg-slate-800/50 rounded-lg animate-pulse" />
      </div>
    );
  }

  // Use sparkline data (7-day) for correlation calculation
  const validCoins = coins.filter(c => c.sparkline_7d && c.sparkline_7d.length > 10).slice(0, 6);

  if (validCoins.length < 2) {
    return (
      <div className="bg-[#0F1B2E] rounded-xl border border-slate-700/30 p-4">
        <h3 className="text-sm font-semibold text-white mb-3">Correlation Matrix</h3>
        <p className="text-xs text-slate-500">Insufficient data for correlation analysis</p>
      </div>
    );
  }

  // Calculate correlation matrix
  const matrix: number[][] = [];
  for (let i = 0; i < validCoins.length; i++) {
    matrix[i] = [];
    for (let j = 0; j < validCoins.length; j++) {
      if (i === j) {
        matrix[i][j] = 1;
      } else {
        matrix[i][j] = calculateCorrelation(
          validCoins[i].sparkline_7d,
          validCoins[j].sparkline_7d
        );
      }
    }
  }

  return (
    <div className="bg-[#0F1B2E] rounded-xl border border-slate-700/30 p-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold text-white">7-Day Correlation Matrix</h3>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded-sm bg-red-500/60" />
            <span className="text-[9px] text-slate-500">Negative</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded-sm bg-slate-700" />
            <span className="text-[9px] text-slate-500">Neutral</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded-sm bg-emerald-500/60" />
            <span className="text-[9px] text-slate-500">Positive</span>
          </div>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr>
              <th className="w-16" />
              {validCoins.map(coin => (
                <th key={coin.id} className="text-center px-1 pb-2">
                  <div className="flex flex-col items-center gap-1">
                    <img src={coin.image} alt={coin.symbol} className="w-4 h-4 rounded-full" />
                    <span className="text-[9px] text-slate-500 font-medium">{coin.symbol}</span>
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {validCoins.map((coinRow, i) => (
              <tr key={coinRow.id}>
                <td className="py-1 pr-2">
                  <div className="flex items-center gap-1.5">
                    <img src={coinRow.image} alt={coinRow.symbol} className="w-4 h-4 rounded-full" />
                    <span className="text-[10px] text-slate-400 font-medium">{coinRow.symbol}</span>
                  </div>
                </td>
                {validCoins.map((_, j) => {
                  const val = matrix[i][j];
                  const bg = getCorrelationColor(val);
                  const textColor = Math.abs(val) > 0.5 ? 'text-white' : 'text-slate-300';

                  return (
                    <td key={j} className="p-0.5">
                      <div
                        className={`w-full aspect-square flex items-center justify-center rounded-md ${bg} ${textColor} transition-all hover:scale-105`}
                        title={`${coinRow.symbol} vs ${validCoins[j].symbol}: ${val.toFixed(3)}`}
                      >
                        <span className="text-[10px] font-mono font-medium">
                          {val.toFixed(2)}
                        </span>
                      </div>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <p className="mt-3 text-[10px] text-slate-600 leading-relaxed">
        Pearson correlation coefficients calculated from 7-day sparkline data. 
        Values close to +1 indicate assets move together; values near -1 indicate inverse movement.
      </p>
    </div>
  );
};

function getCorrelationColor(val: number): string {
  if (val >= 0.8) return 'bg-emerald-500/70';
  if (val >= 0.6) return 'bg-emerald-500/50';
  if (val >= 0.4) return 'bg-emerald-500/30';
  if (val >= 0.2) return 'bg-emerald-500/15';
  if (val >= -0.2) return 'bg-slate-700/50';
  if (val >= -0.4) return 'bg-red-500/15';
  if (val >= -0.6) return 'bg-red-500/30';
  if (val >= -0.8) return 'bg-red-500/50';
  return 'bg-red-500/70';
}

export default CorrelationMatrix;
