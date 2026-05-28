/**
 * Cryptocurrency Metrics Type Definitions
 * Supports 10 key on-chain metrics for dashboard visualization
 */

export interface CryptoMetric {
  timestamp: number;
  value: string | number;
  unit: string;
  source: string;
  integrityHash: string;
}

// Transaction & Network Metrics
export interface TransactionMetric extends CryptoMetric {
  transactions: number;
  transactionsChange24h: number;
  transactionsAvg: number;
}

export interface ActiveAddressesMetric extends CryptoMetric {
  activeAddresses: number;
  activeAddressesChange24h: number;
  newAddresses: number;
}

export interface HashRateMetric extends CryptoMetric {
  hashRate: string; // e.g., "200 EH/s"
  hashRateChange24h: number;
  difficulty: string;
  miningRigs: number;
}

export interface FeesMetric extends CryptoMetric {
  avgFee: string;
  medianFee: string;
  totalFees: string;
  totalFeesUSD: number;
  feeChange24h: number;
}

export interface BlockIntervalMetric extends CryptoMetric {
  avgBlockTime: number; // in seconds
  blockTimeChange24h: number;
  blocksPerDay: number;
  networkConfidence: number; // 0-100
}

export interface MempoolMetric extends CryptoMetric {
  mempoolSize: string; // in bytes
  pendingTransactions: number;
  averageWaitTime: number; // in seconds
  mempoolSizeChange24h: number;
}

// Market & Distribution Metrics
export interface WalletDistributionMetric extends CryptoMetric {
  whalesCount: number;
  largeHoldersCount: number;
  mediumHoldersCount: number;
  smallHoldersCount: number;
  giniCoefficient: number;
  herfindahlIndex: number;
}

export interface ExchangeFlowMetric extends CryptoMetric {
  exchangeInflow: string;
  exchangeOutflow: string;
  netFlow: string;
  largestExchangeInflow: {
    exchange: string;
    amount: string;
  };
  largestExchangeOutflow: {
    exchange: string;
    amount: string;
  };
}

export interface NVTRatioMetric extends CryptoMetric {
  nvtRatio: number;
  nvtRatioChange24h: number;
  valuation: string;
  transactionThroughput: string;
}

export interface RealizedCapitalizationMetric extends CryptoMetric {
  realizedCap: string;
  realizedCapUSD: number;
  realizedCapChange24h: number;
  marketCapToRealizedCap: number;
  unrealizedProfit: string;
}

// Aggregated metrics dashboard view
export interface DashboardMetrics {
  transactions: TransactionMetric | null;
  activeAddresses: ActiveAddressesMetric | null;
  hashRate: HashRateMetric | null;
  fees: FeesMetric | null;
  blockInterval: BlockIntervalMetric | null;
  mempool: MempoolMetric | null;
  walletDistribution: WalletDistributionMetric | null;
  exchangeFlow: ExchangeFlowMetric | null;
  nvtRatio: NVTRatioMetric | null;
  realizedCap: RealizedCapitalizationMetric | null;
  lastUpdate: number;
  isValid: boolean;
}

export interface MetricsError {
  metric: string;
  error: string;
  timestamp: number;
  source?: string;
}
