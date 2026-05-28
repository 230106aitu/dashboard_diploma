/**
 * ANALYSIS UTILITIES
 * 
 * This module implements the analytical features required for the thesis:
 * 1. Moving Average calculations (SMA)
 * 2. Trend detection algorithms
 * 3. Volatility analysis
 * 4. Automated insight generation
 * 5. Linear regression for trend lines
 * 6. Support/Resistance level detection
 * 
 * These functions demonstrate the data processing methodology
 * described in the thesis research framework.
 */

import { TimeSeriesPoint, AnalysisInsight, ChartDataPoint, DataStats } from '@/types/crypto';

/**
 * Calculate Simple Moving Average (SMA)
 * SMA is used to smooth price data and identify trends.
 * Formula: SMA = (P1 + P2 + ... + Pn) / n
 */
export function calculateSMA(data: number[], period: number): (number | null)[] {
  const result: (number | null)[] = [];
  for (let i = 0; i < data.length; i++) {
    if (i < period - 1) {
      result.push(null);
    } else {
      const slice = data.slice(i - period + 1, i + 1);
      const avg = slice.reduce((sum, val) => sum + val, 0) / period;
      result.push(avg);
    }
  }
  return result;
}

/**
 * Linear Regression for trend line prediction
 * Uses least squares method to fit a line to the data.
 * This is used for the "simple prediction" feature.
 */
export function linearRegression(data: number[]): { slope: number; intercept: number; r2: number; predictions: number[] } {
  const n = data.length;
  if (n === 0) return { slope: 0, intercept: 0, r2: 0, predictions: [] };

  const xMean = (n - 1) / 2;
  const yMean = data.reduce((a, b) => a + b, 0) / n;

  let ssXY = 0;
  let ssXX = 0;
  let ssTot = 0;
  let ssRes = 0;

  for (let i = 0; i < n; i++) {
    ssXY += (i - xMean) * (data[i] - yMean);
    ssXX += (i - xMean) * (i - xMean);
  }

  const slope = ssXX !== 0 ? ssXY / ssXX : 0;
  const intercept = yMean - slope * xMean;

  const predictions: number[] = [];
  for (let i = 0; i < n; i++) {
    const predicted = slope * i + intercept;
    predictions.push(predicted);
    ssRes += Math.pow(data[i] - predicted, 2);
    ssTot += Math.pow(data[i] - yMean, 2);
  }

  const r2 = ssTot !== 0 ? 1 - ssRes / ssTot : 0;

  return { slope, intercept, r2, predictions };
}

/**
 * Detect trend direction based on price data
 * Uses a combination of linear regression slope and moving average crossover
 */
export function detectTrend(prices: number[]): 'uptrend' | 'downtrend' | 'sideways' {
  if (prices.length < 5) return 'sideways';

  const { slope, r2 } = linearRegression(prices);
  const priceRange = Math.max(...prices) - Math.min(...prices);
  const avgPrice = prices.reduce((a, b) => a + b, 0) / prices.length;
  const normalizedSlope = (slope / avgPrice) * 100;

  // If R² is low, the trend is not strong (sideways)
  if (r2 < 0.3) return 'sideways';

  // Threshold for trend detection
  if (normalizedSlope > 0.05) return 'uptrend';
  if (normalizedSlope < -0.05) return 'downtrend';
  return 'sideways';
}

/**
 * Calculate volatility (annualized standard deviation of returns)
 */
export function calculateVolatility(prices: number[]): number {
  if (prices.length < 2) return 0;
  const returns: number[] = [];
  for (let i = 1; i < prices.length; i++) {
    returns.push((prices[i] - prices[i - 1]) / prices[i - 1]);
  }
  const mean = returns.reduce((a, b) => a + b, 0) / returns.length;
  const variance = returns.reduce((sum, r) => sum + Math.pow(r - mean, 2), 0) / returns.length;
  return Math.sqrt(variance * 365) * 100; // Annualized, as percentage
}

/**
 * Find support and resistance levels using local minima/maxima
 */
export function findSupportResistance(prices: number[], window: number = 5): { support: number[]; resistance: number[] } {
  const support: number[] = [];
  const resistance: number[] = [];

  for (let i = window; i < prices.length - window; i++) {
    const localWindow = prices.slice(i - window, i + window + 1);
    const current = prices[i];

    if (current === Math.min(...localWindow)) {
      support.push(current);
    }
    if (current === Math.max(...localWindow)) {
      resistance.push(current);
    }
  }

  return { support, resistance };
}

/**
 * Calculate momentum score (Rate of Change)
 */
export function calculateMomentum(prices: number[], period: number = 14): number {
  if (prices.length < period + 1) return 0;
  const current = prices[prices.length - 1];
  const previous = prices[prices.length - 1 - period];
  return ((current - previous) / previous) * 100;
}

/**
 * Calculate correlation between two price series
 * Pearson correlation coefficient
 */
export function calculateCorrelation(seriesA: number[], seriesB: number[]): number {
  const n = Math.min(seriesA.length, seriesB.length);
  if (n < 2) return 0;

  const a = seriesA.slice(0, n);
  const b = seriesB.slice(0, n);

  const meanA = a.reduce((s, v) => s + v, 0) / n;
  const meanB = b.reduce((s, v) => s + v, 0) / n;

  let cov = 0, varA = 0, varB = 0;
  for (let i = 0; i < n; i++) {
    const dA = a[i] - meanA;
    const dB = b[i] - meanB;
    cov += dA * dB;
    varA += dA * dA;
    varB += dB * dB;
  }

  const denom = Math.sqrt(varA * varB);
  return denom !== 0 ? cov / denom : 0;
}

/**
 * Process raw time-series data into chart-ready format with indicators
 */
export function processChartData(
  prices: TimeSeriesPoint[],
  volumes: TimeSeriesPoint[],
  options: { showMA7: boolean; showMA30: boolean; showMA200: boolean; showTrendLine: boolean }
): ChartDataPoint[] {
  const priceValues = prices.map(p => p.value);
  const ma7 = options.showMA7 ? calculateSMA(priceValues, 7) : null;
  const ma30 = options.showMA30 ? calculateSMA(priceValues, 30) : null;
  const ma200 = options.showMA200 ? calculateSMA(priceValues, 200) : null;
  const trend = options.showTrendLine ? linearRegression(priceValues) : null;

  return prices.map((point, i) => {
    const volumePoint = volumes[i];
    const entry: ChartDataPoint = {
      date: point.date,
      timestamp: point.timestamp,
      price: point.value,
      volume: volumePoint?.value,
    };

    if (ma7 && ma7[i] !== null) entry.ma7 = ma7[i]!;
    if (ma30 && ma30[i] !== null) entry.ma30 = ma30[i]!;
    if (ma200 && ma200[i] !== null) entry.ma200 = ma200[i]!;
    if (trend) entry.trendLine = trend.predictions[i];

    return entry;
  });
}

/**
 * Generate automated analysis insights
 * This is the core analytical feature for the thesis,
 * demonstrating how visualization tools can provide actionable insights.
 */
export function generateInsights(
  coinName: string,
  prices: number[],
  volumes: number[],
  stats: DataStats,
  days: number
): AnalysisInsight[] {
  const insights: AnalysisInsight[] = [];
  const now = new Date().toISOString();

  // 1. Trend Analysis
  const trend = detectTrend(prices);
  const { slope, r2 } = linearRegression(prices);
  const trendStrength = r2 > 0.7 ? 'strong' : r2 > 0.4 ? 'moderate' : 'weak';
  
  insights.push({
    id: 'trend-1',
    type: 'trend',
    severity: trend === 'uptrend' ? 'bullish' : trend === 'downtrend' ? 'bearish' : 'neutral',
    title: `${trend === 'uptrend' ? 'Upward' : trend === 'downtrend' ? 'Downward' : 'Sideways'} Trend Detected`,
    description: `${coinName} shows a ${trendStrength} ${trend} over the last ${days} days with a price change of ${stats.price.change.toFixed(2)}%. The trend confidence (R²) is ${(r2 * 100).toFixed(1)}%.`,
    metric: 'Price Trend',
    value: stats.price.change,
    timestamp: now,
  });

  // 2. Volatility Analysis
  const volatility = calculateVolatility(prices);
  const volLevel = volatility > 80 ? 'high' : volatility > 40 ? 'moderate' : 'low';
  
  insights.push({
    id: 'vol-1',
    type: 'volatility',
    severity: volatility > 80 ? 'bearish' : volatility > 40 ? 'neutral' : 'bullish',
    title: `${volLevel.charAt(0).toUpperCase() + volLevel.slice(1)} Volatility Period`,
    description: `Annualized volatility stands at ${volatility.toFixed(1)}%, indicating ${volLevel} market uncertainty. Price ranged from $${formatNumber(stats.price.min)} to $${formatNumber(stats.price.max)} (${((stats.price.max - stats.price.min) / stats.price.min * 100).toFixed(1)}% range).`,
    metric: 'Volatility',
    value: volatility,
    timestamp: now,
  });

  // 3. Volume Analysis
  const recentVolumes = volumes.slice(-7);
  const olderVolumes = volumes.slice(-14, -7);
  const recentAvgVol = recentVolumes.reduce((a, b) => a + b, 0) / recentVolumes.length;
  const olderAvgVol = olderVolumes.length > 0 ? olderVolumes.reduce((a, b) => a + b, 0) / olderVolumes.length : recentAvgVol;
  const volChange = ((recentAvgVol - olderAvgVol) / olderAvgVol) * 100;

  insights.push({
    id: 'vol-2',
    type: 'volume',
    severity: volChange > 20 ? 'bullish' : volChange < -20 ? 'bearish' : 'neutral',
    title: `Trading Volume ${volChange > 0 ? 'Increasing' : 'Decreasing'}`,
    description: `Average trading volume over the last 7 data points ${volChange > 0 ? 'increased' : 'decreased'} by ${Math.abs(volChange).toFixed(1)}% compared to the prior period. ${volChange > 20 ? 'Rising volume confirms the current trend.' : volChange < -20 ? 'Declining volume may signal trend weakening.' : 'Volume remains stable.'}`,
    metric: 'Volume Change',
    value: volChange,
    timestamp: now,
  });

  // 4. Momentum Analysis
  const momentum = calculateMomentum(prices);
  insights.push({
    id: 'mom-1',
    type: 'trend',
    severity: momentum > 5 ? 'bullish' : momentum < -5 ? 'bearish' : 'neutral',
    title: `Momentum: ${momentum > 0 ? 'Positive' : 'Negative'}`,
    description: `The 14-period Rate of Change is ${momentum.toFixed(2)}%, suggesting ${momentum > 5 ? 'strong bullish momentum' : momentum < -5 ? 'strong bearish momentum' : 'neutral momentum'}. ${Math.abs(momentum) > 15 ? 'Extreme readings may indicate overbought/oversold conditions.' : ''}`,
    metric: 'Momentum',
    value: momentum,
    timestamp: now,
  });

  // 5. Support/Resistance
  const { support, resistance } = findSupportResistance(prices);
  if (support.length > 0 && resistance.length > 0) {
    const nearestSupport = Math.max(...support);
    const nearestResistance = Math.min(...resistance);
    const currentPrice = prices[prices.length - 1];
    
    insights.push({
      id: 'sr-1',
      type: 'support_resistance',
      severity: 'neutral',
      title: 'Key Price Levels Identified',
      description: `Nearest support level: $${formatNumber(nearestSupport)} (${((currentPrice - nearestSupport) / currentPrice * 100).toFixed(1)}% below current). Nearest resistance: $${formatNumber(nearestResistance)} (${((nearestResistance - currentPrice) / currentPrice * 100).toFixed(1)}% above current).`,
      metric: 'Support/Resistance',
      timestamp: now,
    });
  }

  // 6. Price Prediction (Linear Extrapolation)
  const { predictions } = linearRegression(prices);
  if (predictions.length > 0) {
    const lastPredicted = predictions[predictions.length - 1];
    const nextPredicted = lastPredicted + slope;
    const predictionChange = ((nextPredicted - prices[prices.length - 1]) / prices[prices.length - 1]) * 100;
    
    insights.push({
      id: 'pred-1',
      type: 'prediction',
      severity: predictionChange > 0 ? 'bullish' : 'bearish',
      title: 'Linear Trend Projection',
      description: `Based on linear regression of the ${days}-day data, the projected next-period price is $${formatNumber(nextPredicted)} (${predictionChange > 0 ? '+' : ''}${predictionChange.toFixed(2)}%). Note: This is a simple statistical projection, not financial advice.`,
      metric: 'Projection',
      value: nextPredicted,
      timestamp: now,
    });
  }

  return insights;
}

/**
 * Format large numbers for display
 */
export function formatNumber(num: number): string {
  if (num >= 1e12) return (num / 1e12).toFixed(2) + 'T';
  if (num >= 1e9) return (num / 1e9).toFixed(2) + 'B';
  if (num >= 1e6) return (num / 1e6).toFixed(2) + 'M';
  if (num >= 1e3) return (num / 1e3).toFixed(2) + 'K';
  if (num >= 1) return num.toFixed(2);
  if (num >= 0.01) return num.toFixed(4);
  return num.toFixed(6);
}

/**
 * Format currency values
 */
export function formatCurrency(num: number): string {
  if (num >= 1e12) return '$' + (num / 1e12).toFixed(2) + 'T';
  if (num >= 1e9) return '$' + (num / 1e9).toFixed(2) + 'B';
  if (num >= 1e6) return '$' + (num / 1e6).toFixed(2) + 'M';
  return '$' + num.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

/**
 * Format percentage values
 */
export function formatPercent(num: number | null | undefined): string {
  if (num === null || num === undefined) return 'N/A';
  return (num >= 0 ? '+' : '') + num.toFixed(2) + '%';
}

/**
 * Export data to CSV format
 */
export function exportToCSV(data: ChartDataPoint[], coinName: string, days: number): void {
  const headers = ['Date', 'Price (USD)', 'Volume (USD)', 'MA7', 'MA30', 'MA200', 'Trend Line'];
  const rows = data.map(d => [
    new Date(d.date).toLocaleDateString(),
    d.price.toFixed(2),
    d.volume?.toFixed(0) || '',
    d.ma7?.toFixed(2) || '',
    d.ma30?.toFixed(2) || '',
    d.ma200?.toFixed(2) || '',
    d.trendLine?.toFixed(2) || '',
  ]);

  const csvContent = [
    `# ${coinName} Market Data Export`,
    `# Period: Last ${days} days`,
    `# Generated: ${new Date().toISOString()}`,
    `# Source: CoinGecko API`,
    `# Methodology: Real-time API-based data collection`,
    '',
    headers.join(','),
    ...rows.map(r => r.join(',')),
  ].join('\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = `${coinName.toLowerCase()}_${days}d_${new Date().toISOString().split('T')[0]}.csv`;
  link.click();
  URL.revokeObjectURL(link.href);
}
