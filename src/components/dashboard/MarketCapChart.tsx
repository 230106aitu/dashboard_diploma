/**
 * MARKET CAP CHART COMPONENT
 * 
 * Displays historical market capitalization data.
 * Market cap = Price × Circulating Supply
 * 
 * This metric is crucial for understanding the relative size
 * and growth of crypto assets, serving as a key on-chain metric
 * proxy when direct on-chain data is unavailable from free APIs.
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
} from 'recharts';
import { TimeSeriesPoint } from '@/types/crypto';
import { formatCurrency, formatNumber } from '@/utils/analysis';

interface MarketCapChartProps {
  data: TimeSeriesPoint[];
  coinName: string;
  loading: boolean;
}

const MarketCapChart: React.FC<MarketCapChartProps> = ({ data, coinName, loading }) => {
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
      <div className="bg-[#0F1B2E] rounded-xl border border-slate-700/30 p-4 h-[320px]">
        <div className="h-4 bg-slate-700 rounded w-40 mb-4 animate-pulse" />
        <div className="h-full bg-slate-800/50 rounded-lg animate-pulse" />
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className="bg-[#0F1B2E] rounded-xl border border-slate-700/30 p-4 h-[320px] flex items-center justify-center">
        <p className="text-slate-500">No market cap data available</p>
      </div>
    );
  }

  return (
    <div className="bg-[#0F1B2E] rounded-xl border border-slate-700/30 p-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold text-white">
          {coinName} Market Capitalization
        </h3>
        <span className="text-[10px] text-slate-500">
          Current: {formatCurrency(data[data.length - 1]?.value || 0)}
        </span>
      </div>
      <ResponsiveContainer width="100%" height={250}>
        <AreaChart data={formattedData} margin={{ top: 5, right: 5, left: 5, bottom: 5 }}>
          <defs>
            <linearGradient id="mcapGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#a855f7" stopOpacity={0.3} />
              <stop offset="95%" stopColor="#a855f7" stopOpacity={0} />
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
          <Tooltip content={<McapTooltip />} />
          <Area
            type="monotone"
            dataKey="value"
            stroke="#a855f7"
            strokeWidth={2}
            fill="url(#mcapGradient)"
            dot={false}
            activeDot={{ r: 4, fill: '#a855f7', stroke: '#0F1B2E', strokeWidth: 2 }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};

function McapTooltip({ active, payload, label }: any) {
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

export default MarketCapChart;
