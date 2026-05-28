/**
 * COMPARISON CHART COMPONENT
 * 
 * Compares the performance of two crypto assets using normalized returns.
 * Normalization is essential for comparing assets with different price scales
 * (e.g., BTC at $60K vs ETH at $3K).
 * 
 * Method: Percentage change from the start of the period
 * Formula: ((current_price - start_price) / start_price) * 100
 * 
 * This visualization supports the thesis requirement for
 * comparative analysis between assets.
 */

import React, { useMemo } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  ReferenceLine,
} from 'recharts';
import { TimeSeriesPoint, SUPPORTED_COINS } from '@/types/crypto';
import { calculateCorrelation } from '@/utils/analysis';

interface ComparisonChartProps {
  dataA: TimeSeriesPoint[];
  dataB: TimeSeriesPoint[];
  coinAId: string;
  coinBId: string;
  loading: boolean;
}

const ComparisonChart: React.FC<ComparisonChartProps> = ({
  dataA,
  dataB,
  coinAId,
  coinBId,
  loading,
}) => {
  const coinA = SUPPORTED_COINS.find(c => c.id === coinAId);
  const coinB = SUPPORTED_COINS.find(c => c.id === coinBId);

  const { chartData, correlation } = useMemo(() => {
    if (!dataA.length || !dataB.length) return { chartData: [], correlation: 0 };

    const startA = dataA[0].value;
    const startB = dataB[0].value;
    const minLen = Math.min(dataA.length, dataB.length);

    // Normalize both series to percentage change from start
    const normalized = [];
    for (let i = 0; i < minLen; i++) {
      normalized.push({
        date: new Date(dataA[i].date).toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric',
        }),
        coinA: ((dataA[i].value - startA) / startA) * 100,
        coinB: ((dataB[i].value - startB) / startB) * 100,
      });
    }

    const corr = calculateCorrelation(
      dataA.slice(0, minLen).map(d => d.value),
      dataB.slice(0, minLen).map(d => d.value)
    );

    return { chartData: normalized, correlation: corr };
  }, [dataA, dataB]);

  if (loading) {
    return (
      <div className="bg-[#0F1B2E] rounded-xl border border-slate-700/30 p-4 h-[320px]">
        <div className="h-4 bg-slate-700 rounded w-48 mb-4 animate-pulse" />
        <div className="h-full bg-slate-800/50 rounded-lg animate-pulse" />
      </div>
    );
  }

  if (chartData.length === 0) {
    return (
      <div className="bg-[#0F1B2E] rounded-xl border border-slate-700/30 p-4 h-[320px] flex items-center justify-center">
        <p className="text-slate-500">No comparison data available</p>
      </div>
    );
  }

  return (
    <div className="bg-[#0F1B2E] rounded-xl border border-slate-700/30 p-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold text-white">
          {coinA?.symbol || coinAId} vs {coinB?.symbol || coinBId} — Normalized Performance
        </h3>
        <div className="flex items-center gap-2">
          <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
            correlation > 0.7 ? 'bg-emerald-400/10 text-emerald-400' :
            correlation > 0.3 ? 'bg-yellow-400/10 text-yellow-400' :
            'bg-red-400/10 text-red-400'
          }`}>
            Correlation: {correlation.toFixed(3)}
          </span>
        </div>
      </div>
      <ResponsiveContainer width="100%" height={250}>
        <LineChart data={chartData} margin={{ top: 5, right: 5, left: 5, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
          <XAxis
            dataKey="date"
            tick={{ fill: '#64748b', fontSize: 10 }}
            tickLine={false}
            axisLine={{ stroke: '#1e293b' }}
            interval="preserveStartEnd"
          />
          <YAxis
            tick={{ fill: '#64748b', fontSize: 10 }}
            tickLine={false}
            axisLine={false}
            tickFormatter={(val) => `${val > 0 ? '+' : ''}${val.toFixed(1)}%`}
            width={55}
          />
          <Tooltip content={<ComparisonTooltip coinA={coinA?.symbol || ''} coinB={coinB?.symbol || ''} />} />
          <ReferenceLine y={0} stroke="#475569" strokeDasharray="4 4" />
          <Line
            type="monotone"
            dataKey="coinA"
            stroke={coinA?.color || '#F7931A'}
            strokeWidth={2}
            dot={false}
            activeDot={{ r: 4, fill: coinA?.color || '#F7931A', stroke: '#0F1B2E', strokeWidth: 2 }}
            name={coinA?.symbol || coinAId}
          />
          <Line
            type="monotone"
            dataKey="coinB"
            stroke={coinB?.color || '#627EEA'}
            strokeWidth={2}
            dot={false}
            activeDot={{ r: 4, fill: coinB?.color || '#627EEA', stroke: '#0F1B2E', strokeWidth: 2 }}
            name={coinB?.symbol || coinBId}
          />
        </LineChart>
      </ResponsiveContainer>
      <div className="flex items-center justify-center gap-6 mt-2">
        <span className="flex items-center gap-1.5 text-xs text-slate-400">
          <span className="w-3 h-0.5 rounded" style={{ backgroundColor: coinA?.color || '#F7931A' }} />
          {coinA?.name || coinAId}
        </span>
        <span className="flex items-center gap-1.5 text-xs text-slate-400">
          <span className="w-3 h-0.5 rounded" style={{ backgroundColor: coinB?.color || '#627EEA' }} />
          {coinB?.name || coinBId}
        </span>
      </div>
    </div>
  );
};

function ComparisonTooltip({ active, payload, label, coinA, coinB }: any) {
  if (!active || !payload || payload.length === 0) return null;

  return (
    <div className="bg-[#0B1426] border border-slate-700 rounded-lg p-3 shadow-xl">
      <p className="text-xs text-slate-400 mb-2">{label}</p>
      {payload.map((entry: any, i: number) => (
        <div key={i} className="flex items-center gap-2 text-xs">
          <span className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color }} />
          <span className="text-slate-400">{i === 0 ? coinA : coinB}:</span>
          <span className={`font-medium ${entry.value >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
            {entry.value >= 0 ? '+' : ''}{entry.value.toFixed(2)}%
          </span>
        </div>
      ))}
    </div>
  );
}

export default ComparisonChart;
