/**
 * VOLUME CHART COMPONENT
 * 
 * Displays trading volume over time as a bar chart.
 * Volume analysis is a key component of market analysis,
 * as it confirms price trends and indicates market participation.
 * 
 * Color coding:
 * - Bars above average volume: brighter (high activity)
 * - Bars below average: dimmer (low activity)
 */

import React, { useMemo } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
  ReferenceLine,
} from 'recharts';
import { ChartDataPoint } from '@/types/crypto';
import { formatCurrency, formatNumber } from '@/utils/analysis';

interface VolumeChartProps {
  data: ChartDataPoint[];
  coinName: string;
  loading: boolean;
}

const VolumeChart: React.FC<VolumeChartProps> = ({ data, coinName, loading }) => {
  const { formattedData, avgVolume } = useMemo(() => {
    const volumes = data.filter(d => d.volume).map(d => d.volume!);
    const avg = volumes.length > 0 ? volumes.reduce((a, b) => a + b, 0) / volumes.length : 0;

    return {
      formattedData: data.map(d => ({
        ...d,
        dateLabel: new Date(d.date).toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric',
        }),
        isAboveAvg: (d.volume || 0) > avg,
      })),
      avgVolume: avg,
    };
  }, [data]);

  if (loading) {
    return (
      <div className="bg-[#0F1B2E] rounded-xl border border-slate-700/30 p-4 h-[320px]">
        <div className="h-4 bg-slate-700 rounded w-32 mb-4 animate-pulse" />
        <div className="h-full bg-slate-800/50 rounded-lg animate-pulse" />
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className="bg-[#0F1B2E] rounded-xl border border-slate-700/30 p-4 h-[320px] flex items-center justify-center">
        <p className="text-slate-500">No volume data available</p>
      </div>
    );
  }

  return (
    <div className="bg-[#0F1B2E] rounded-xl border border-slate-700/30 p-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold text-white">
          {coinName} Trading Volume
        </h3>
        <div className="flex items-center gap-3 text-[10px]">
          <span className="text-slate-500">
            Avg: {formatCurrency(avgVolume)}
          </span>
        </div>
      </div>
      <ResponsiveContainer width="100%" height={250}>
        <BarChart data={formattedData} margin={{ top: 5, right: 5, left: 5, bottom: 5 }}>
          <defs>
            <linearGradient id="volumeGradientHigh" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#8b5cf6" stopOpacity={0.9} />
              <stop offset="100%" stopColor="#6366f1" stopOpacity={0.4} />
            </linearGradient>
            <linearGradient id="volumeGradientLow" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#475569" stopOpacity={0.6} />
              <stop offset="100%" stopColor="#334155" stopOpacity={0.3} />
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
            tickFormatter={(val) => `$${formatNumber(val)}`}
            width={65}
          />
          <Tooltip content={<VolumeTooltip />} />
          <ReferenceLine
            y={avgVolume}
            stroke="#64748b"
            strokeDasharray="4 4"
            strokeWidth={1}
          />
          <Bar dataKey="volume" radius={[2, 2, 0, 0]} maxBarSize={20}>
            {formattedData.map((entry, index) => (
              <Cell
                key={`cell-${index}`}
                fill={entry.isAboveAvg ? 'url(#volumeGradientHigh)' : 'url(#volumeGradientLow)'}
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

function VolumeTooltip({ active, payload, label }: any) {
  if (!active || !payload || payload.length === 0) return null;

  return (
    <div className="bg-[#0B1426] border border-slate-700 rounded-lg p-3 shadow-xl">
      <p className="text-xs text-slate-400 mb-1">{label}</p>
      <p className="text-sm font-semibold text-white">
        {formatCurrency(payload[0]?.value || 0)}
      </p>
    </div>
  );
}

export default VolumeChart;
