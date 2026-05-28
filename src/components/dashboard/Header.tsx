/**
 * DASHBOARD HEADER COMPONENT
 * 
 * Provides navigation, branding, and key action buttons.
 * Includes real-time status indicator, last-updated timestamp,
 * and quick access to saved reports.
 */

import React from 'react';
import {
  Activity,
  RefreshCw,
  Download,
  Database,
  Clock,
  Wifi,
  WifiOff,
  FolderOpen,
} from 'lucide-react';

interface HeaderProps {
  lastUpdated: Date | null;
  isLoading: boolean;
  autoRefresh: boolean;
  onRefresh: () => void;
  onToggleAutoRefresh: () => void;
  onExport: () => void;
  onToggleMethodology: () => void;
  onOpenReports: () => void;
  savedReportsCount: number;
}

const Header: React.FC<HeaderProps> = ({
  lastUpdated,
  isLoading,
  autoRefresh,
  onRefresh,
  onToggleAutoRefresh,
  onExport,
  onToggleMethodology,
  onOpenReports,
  savedReportsCount,
}) => {
  return (
    <header className="bg-[#0B1426] border-b border-slate-700/50 px-4 lg:px-6 py-3">
      <div className="flex items-center justify-between">
        {/* Branding */}
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-400 flex items-center justify-center">
            <Activity className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-white leading-tight tracking-tight">
              CryptoMetrics<span className="text-cyan-400">.</span>
            </h1>
            <p className="text-[10px] text-slate-500 font-medium uppercase tracking-widest">
              On-Chain Analytics Dashboard
            </p>
          </div>
        </div>

        {/* Center - Status */}
        <div className="hidden md:flex items-center gap-4">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-800/60 border border-slate-700/50">
            <div className={`w-2 h-2 rounded-full ${autoRefresh ? 'bg-emerald-400 animate-pulse' : 'bg-slate-500'}`} />
            <span className="text-xs text-slate-400">
              {autoRefresh ? 'Live' : 'Paused'}
            </span>
          </div>
          {lastUpdated && (
            <div className="flex items-center gap-1.5 text-xs text-slate-500">
              <Clock className="w-3 h-3" />
              <span>Updated {lastUpdated.toLocaleTimeString()}</span>
            </div>
          )}
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-800/60 border border-slate-700/50">
            <Database className="w-3 h-3 text-cyan-400" />
            <span className="text-xs text-slate-400">CoinGecko API</span>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2">
          <button
            onClick={onToggleMethodology}
            className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-cyan-400 bg-cyan-400/10 border border-cyan-400/20 rounded-lg hover:bg-cyan-400/20 transition-colors"
          >
            <Database className="w-3.5 h-3.5" />
            Methodology
          </button>
          {/* Saved Reports button */}
          <button
            onClick={onOpenReports}
            className="relative flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-violet-400 bg-violet-400/10 border border-violet-400/20 rounded-lg hover:bg-violet-400/20 transition-colors"
            title="View saved reports"
          >
            <FolderOpen className="w-3.5 h-3.5" />
            <span className="hidden lg:inline">Reports</span>
            {savedReportsCount > 0 && (
              <span className="absolute -top-1.5 -right-1.5 min-w-[18px] h-[18px] rounded-full bg-violet-500 text-white text-[9px] font-bold flex items-center justify-center px-1">
                {savedReportsCount > 99 ? '99+' : savedReportsCount}
              </span>
            )}
          </button>
          <button
            onClick={onToggleAutoRefresh}
            className={`p-2 rounded-lg transition-colors ${
              autoRefresh
                ? 'text-emerald-400 bg-emerald-400/10 hover:bg-emerald-400/20'
                : 'text-slate-400 bg-slate-800 hover:bg-slate-700'
            }`}
            title={autoRefresh ? 'Disable auto-refresh' : 'Enable auto-refresh'}
          >
            {autoRefresh ? <Wifi className="w-4 h-4" /> : <WifiOff className="w-4 h-4" />}
          </button>
          <button
            onClick={onRefresh}
            disabled={isLoading}
            className="p-2 rounded-lg text-slate-400 bg-slate-800 hover:bg-slate-700 hover:text-white transition-colors disabled:opacity-50"
            title="Refresh data"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
          </button>
          <button
            onClick={onExport}
            className="p-2 rounded-lg text-slate-400 bg-slate-800 hover:bg-slate-700 hover:text-white transition-colors"
            title="Export to CSV"
          >
            <Download className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;
