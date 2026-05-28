/**
 * PRICE CHART COMPONENT
 * 
 * The primary visualization tool for the thesis.
 * Displays historical price data with optional technical indicators:
 * - Simple Moving Averages (MA7, MA30, MA200)
 * - Linear trend line for prediction
 * - Interactive tooltips with detailed data
 * 
 * Uses Recharts library for professional-grade chart rendering.
 */

import React, { useMemo } from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Line,
  ComposedChart,
  Legend,
} from 'recharts';
import { ChartDataPoint } from '@/types/crypto';
import { formatCurrency } from '@/utils/analysis';

interface PriceChartProps {
  data: ChartDataPoint[];
  coinName: string;
  loading: boolean;
  showMA7: boolean;
  showMA30: boolean;
  showMA200: boolean;
  showTrendLine: boolean;
}

const PriceChart: React.FC<PriceChartProps> = ({
  data,
  coinName,
  loading,
  showMA7,
  showMA30,
  showMA200,
  showTrendLine,
}) => {
  const formattedData = useMemo(() => {
    return data.map(d => ({
      ...d,
      dateLabel: new Date(d.date).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
      }),
    }));
  }, [data]);

  if (loading) {
    return (
      <div className="bg-[#0F1B2E] rounded-xl border border-slate-700/30 p-4 h-[380px]">
        <div className="h-4 bg-slate-700 rounded w-32 mb-4 animate-pulse" />
        <div className="h-full bg-slate-800/50 rounded-lg animate-pulse" />
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className="bg-[#0F1B2E] rounded-xl border border-slate-700/30 p-4 h-[380px] flex items-center justify-center">
        <p className="text-slate-500">No price data available</p>
      </div>
    );
  }

  return (
    <div className="bg-[#0F1B2E] rounded-xl border border-slate-700/30 p-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold text-white">
          {coinName} Price Chart
        </h3>
        <div className="flex items-center gap-3 text-[10px]">
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-cyan-400" />
            <span className="text-slate-500">Price</span>
          </span>
          {showMA7 && (
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-yellow-400" />
              <span className="text-slate-500">MA7</span>
            </span>
          )}
          {showMA30 && (
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-purple-400" />
              <span className="text-slate-500">MA30</span>
            </span>
          )}
          {showMA200 && (
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-pink-400" />
              <span className="text-slate-500">MA200</span>
            </span>
          )}
          {showTrendLine && (
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-emerald-400" />
              <span className="text-slate-500">Trend</span>
            </span>
          )}
        </div>
      </div>
      <ResponsiveContainer width="100%" height={320}>
        <ComposedChart data={formattedData} margin={{ top: 5, right: 5, left: 5, bottom: 5 }}>
          <defs>
            <linearGradient id="priceGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#22d3ee" stopOpacity={0.3} />
              <stop offset="95%" stopColor="#22d3ee" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
          <XAxis
            dataKey="dateLabel"
            tick={{ fill: '#64748b', fontSize: 10 }}
            tickLine={false}
            axisLine={{ stroke: '#1e293b' }}
            interval="preserveStartEnd"
          />
          <YAxis
            tick={{ fill: '#64748b', fontSize: 10 }}
            tickLine={false}
            axisLine={false}
            tickFormatter={(val) => {
              if (val >= 1000) return `$${(val / 1000).toFixed(1)}K`;
              return `$${val.toFixed(0)}`;
            }}
            domain={['auto', 'auto']}
            width={60}
          />
          <Tooltip content={<CustomTooltip />} />
          <Area
            type="monotone"
            dataKey="price"
            stroke="#22d3ee"
            strokeWidth={2}
            fill="url(#priceGradient)"
            dot={false}
            activeDot={{ r: 4, fill: '#22d3ee', stroke: '#0F1B2E', strokeWidth: 2 }}
          />
          {showMA7 && (
            <Line
              type="monotone"
              dataKey="ma7"
              stroke="#facc15"
              strokeWidth={1.5}
              dot={false}
              strokeDasharray="4 2"
              connectNulls
            />
          )}
          {showMA30 && (
            <Line
              type="monotone"
              dataKey="ma30"
              stroke="#a855f7"
              strokeWidth={1.5}
              dot={false}
              strokeDasharray="4 2"
              connectNulls
            />
          )}
          {showMA200 && (
            <Line
              type="monotone"
              dataKey="ma200"
              stroke="#ec4899"
              strokeWidth={1.5}
              dot={false}
              strokeDasharray="4 2"
              connectNulls
            />
          )}
          {showTrendLine && (
            <Line
              type="monotone"
              dataKey="trendLine"
              stroke="#34d399"
              strokeWidth={1.5}
              dot={false}
              strokeDasharray="6 3"
              connectNulls
            />
          )}
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
};

function CustomTooltip({ active, payload, label }: any) {
  if (!active || !payload || payload.length === 0) return null;

  return (
    <div className="bg-[#0B1426] border border-slate-700 rounded-lg p-3 shadow-xl">
      <p className="text-xs text-slate-400 mb-2">{label}</p>
      {payload.map((entry: any, i: number) => (
        <div key={i} className="flex items-center gap-2 text-xs">
          <span
            className="w-2 h-2 rounded-full"
            style={{ backgroundColor: entry.color }}
          />
          <span className="text-slate-400 capitalize">
            {entry.dataKey === 'ma7' ? 'MA 7' : entry.dataKey === 'ma30' ? 'MA 30' : entry.dataKey === 'ma200' ? 'MA 200' : entry.dataKey === 'trendLine' ? 'Trend' : 'Price'}:
          </span>
          <span className="text-white font-medium">
            {formatCurrency(entry.value)}
          </span>
        </div>
      ))}
    </div>
  );
}

export default PriceChart;
