/**
 * MetricsCard Component
 * Displays individual cryptocurrency metrics with validation status
 */

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AlertCircle, CheckCircle, TrendingUp, TrendingDown } from 'lucide-react';
import { CryptoMetric } from '@/types/metrics';

interface MetricsCardProps {
  title: string;
  metric: CryptoMetric | null;
  unit: string;
  change24h?: number;
  isLoading?: boolean;
  error?: string | null;
  integrityValid?: boolean;
  icon?: React.ReactNode;
}

export const MetricsCard: React.FC<MetricsCardProps> = ({
  title,
  metric,
  unit,
  change24h,
  isLoading,
  error,
  integrityValid = true,
  icon,
}) => {
  const isPositiveChange = change24h !== undefined && change24h > 0;

  return (
    <Card className="h-full">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <div className="flex gap-2">
          {!integrityValid && (
            <AlertCircle className="w-4 h-4 text-red-500" title="Integrity check failed" />
          )}
          {integrityValid && metric && (
            <CheckCircle className="w-4 h-4 text-green-500" title="Data verified" />
          )}
          {icon}
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="h-8 bg-muted animate-pulse rounded" />
        ) : error ? (
          <div className="text-sm text-red-500">{error}</div>
        ) : metric ? (
          <>
            <div className="flex items-baseline gap-2">
              <div className="text-2xl font-bold">
                {metric.value}
              </div>
              <span className="text-xs text-muted-foreground">{unit}</span>
            </div>
            {change24h !== undefined && (
              <div className="flex items-center gap-1 mt-2">
                {isPositiveChange ? (
                  <TrendingUp className="w-4 h-4 text-green-500" />
                ) : (
                  <TrendingDown className="w-4 h-4 text-red-500" />
                )}
                <span className={isPositiveChange ? 'text-green-500' : 'text-red-500'}>
                  {isPositiveChange ? '+' : ''}{change24h.toFixed(2)}%
                </span>
                <span className="text-xs text-muted-foreground">24h</span>
              </div>
            )}
            <div className="mt-3 flex gap-2">
              <Badge variant="outline" className="text-xs">
                {new Date(metric.timestamp).toLocaleTimeString()}
              </Badge>
              {metric.source && (
                <Badge variant="secondary" className="text-xs">
                  {new URL(metric.source).hostname}
                </Badge>
              )}
            </div>
          </>
        ) : (
          <div className="text-sm text-muted-foreground">No data available</div>
        )}
      </CardContent>
    </Card>
  );
};

export default MetricsCard;
