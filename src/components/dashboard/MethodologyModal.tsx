import React from 'react';
import { X, Database, Cpu, BarChart3, BookOpen, Globe, Layers, ArrowRight, CheckCircle2 } from 'lucide-react';

interface MethodologyModalProps { isOpen: boolean; onClose: () => void; }

const MethodologyModal: React.FC<MethodologyModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-[#0B1426] border border-slate-700/50 rounded-2xl w-full max-w-3xl max-h-[85vh] overflow-y-auto shadow-2xl">
        <div className="sticky top-0 bg-[#0B1426] border-b border-slate-700/50 p-5 flex items-center justify-between z-10">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center"><BookOpen className="w-5 h-5 text-white" /></div>
            <div><h2 className="text-lg font-bold text-white">Research Methodology</h2><p className="text-xs text-slate-500">Data Collection, Analysis & Persistence Framework</p></div>
          </div>
          <button onClick={onClose} className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"><X className="w-5 h-5" /></button>
        </div>
        <div className="p-5 space-y-6">
          <div className="p-4 bg-gradient-to-r from-cyan-500/10 to-blue-600/10 border border-cyan-500/20 rounded-xl">
            <h3 className="text-sm font-bold text-cyan-400 mb-1">Thesis Title</h3>
            <p className="text-white text-sm">Creating a Dashboard for Visualizing On-Chain Metrics for Crypto Assets Using Open APIs</p>
          </div>
          <Section icon={Layers} title="System Architecture" color="from-purple-500 to-indigo-500">
            <div className="flex flex-wrap items-center gap-2 mb-3">
              <AB label="React Frontend" sub="Visualization Layer" /><ArrowRight className="w-4 h-4 text-slate-600" />
              <AB label="Supabase Edge Functions" sub="API Gateway / Processing" /><ArrowRight className="w-4 h-4 text-slate-600" />
              <AB label="CoinGecko API" sub="Data Source" />
            </div>
            <div className="flex flex-wrap items-center gap-2 mb-3">
              <AB label="PostgreSQL Database" sub="Report Persistence" /><ArrowRight className="w-4 h-4 text-slate-600" />
              <AB label="Supabase Edge Functions" sub="CRUD Operations" /><ArrowRight className="w-4 h-4 text-slate-600" />
              <AB label="React Frontend" sub="Save / Load Reports" />
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">The system follows a three-tier architecture. Analysis reports are persisted to PostgreSQL (via Supabase) with JSONB columns for insights and chart configuration, demonstrating full-stack data persistence methodology.</p>
          </Section>
          <Section icon={Database} title="Data Sources & Persistence" color="from-emerald-500 to-teal-500">
            <div className="p-3 bg-slate-800/30 border border-slate-700/30 rounded-lg mb-3">
              <h4 className="text-xs font-semibold text-white mb-1">CoinGecko API (Primary)</h4>
              <p className="text-[11px] text-slate-400 mb-2">Free-tier REST API providing comprehensive crypto market data including prices, volumes, market caps, supply metrics, and historical time-series data.</p>
              <div className="text-[10px] font-mono text-cyan-400/70 bg-slate-900/50 px-2 py-1 rounded mb-1">/coins/markets — Multi-asset market overview with sparkline data</div>
              <div className="text-[10px] font-mono text-cyan-400/70 bg-slate-900/50 px-2 py-1 rounded">/coins/&#123;id&#125;/market_chart — Historical price, volume, and market cap time series</div>
            </div>
            <div className="p-3 bg-slate-800/30 border border-slate-700/30 rounded-lg">
              <h4 className="text-xs font-semibold text-white mb-1">PostgreSQL Database (Supabase)</h4>
              <p className="text-[11px] text-slate-400 mb-2">Stores saved analysis reports with JSONB columns for insights, chart configuration, and statistical snapshots. Demonstrates data persistence methodology.</p>
              <div className="text-[10px] font-mono text-violet-400/70 bg-slate-900/50 px-2 py-1 rounded">analysis_reports — id, coin_id, time_range, title, notes, insights (JSONB), chart_config (JSONB), stats_snapshot (JSONB), created_at</div>
            </div>
          </Section>
          <Section icon={Cpu} title="Data Processing Pipeline" color="from-amber-500 to-orange-500">
            <div className="space-y-2">
              {[
                ['1','Data Collection','API requests via Supabase Edge Functions with rate limiting and error recovery.'],
                ['2','Data Transformation','Raw responses transformed into typed TypeScript objects.'],
                ['3','Statistical Analysis','SMA-7/30/200, linear regression, std deviation, correlation coefficients.'],
                ['4','Insight Generation','Automated trend detection, volatility, momentum, support/resistance.'],
                ['5','Visualization','Recharts library with interactive tooltips and real-time updates.'],
                ['6','Data Persistence','Save/load analysis reports to PostgreSQL via Supabase Edge Functions.'],
              ].map(([s,t,d]) => (
                <div key={s} className="flex items-start gap-3 p-2">
                  <div className="w-6 h-6 rounded-full bg-cyan-400/10 border border-cyan-400/30 flex items-center justify-center shrink-0"><span className="text-[10px] font-bold text-cyan-400">{s}</span></div>
                  <div><h4 className="text-xs font-semibold text-white">{t}</h4><p className="text-[11px] text-slate-400">{d}</p></div>
                </div>
              ))}
            </div>
          </Section>
          <Section icon={BarChart3} title="Analytical Methods" color="from-cyan-500 to-blue-500">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {[
                ['Simple Moving Average','SMA = (P₁ + P₂ + ... + Pₙ) / n','Smooths price data. Periods: 7, 30, 200 days.'],
                ['Linear Regression','y = mx + b (Least Squares)','Fits trend line for prediction. R² measures fit.'],
                ['Volatility','σ = √(Var(returns) × 365)','Annualized std deviation of daily returns.'],
                ['Pearson Correlation','r = Cov(X,Y) / (σₓ × σᵧ)','Linear relationship between two asset series.'],
                ['Momentum (ROC)','ROC = ((P - P₋ₙ) / P₋ₙ) × 100','Rate of Change over n periods.'],
                ['Support/Resistance','Local Min/Max Detection','Key price levels via sliding window extrema.'],
              ].map(([t,f,d]) => (
                <div key={t} className="p-3 bg-slate-800/30 border border-slate-700/30 rounded-lg">
                  <h4 className="text-xs font-semibold text-white mb-1">{t}</h4>
                  <div className="text-[10px] font-mono text-cyan-400/70 bg-slate-900/50 px-2 py-1 rounded mb-1.5 inline-block">{f}</div>
                  <p className="text-[10px] text-slate-400">{d}</p>
                </div>
              ))}
            </div>
          </Section>
          <Section icon={Globe} title="Limitations & Considerations" color="from-rose-500 to-pink-500">
            <ul className="space-y-2">
              {['CoinGecko free tier has rate limits (10-30 calls/min), mitigated by client-side caching.','On-chain metrics require premium APIs; market cap and supply serve as proxy metrics.','Linear regression predictions are statistical extrapolations, not financial forecasts.','Data granularity varies: hourly for 7-30 days, daily for 90+ days.','All timestamps UTC. Price data aggregated across 500+ exchanges.'].map((item, i) => (
                <li key={i} className="flex items-start gap-2 text-xs text-slate-400"><CheckCircle2 className="w-3.5 h-3.5 text-slate-600 mt-0.5 shrink-0" />{item}</li>
              ))}
            </ul>
          </Section>
        </div>
      </div>
    </div>
  );
};

function Section({ icon: Icon, title, color, children }: { icon: React.ElementType; title: string; color: string; children: React.ReactNode }) {
  return (<div><div className="flex items-center gap-2 mb-3"><div className={`w-6 h-6 rounded-md bg-gradient-to-br ${color} flex items-center justify-center`}><Icon className="w-3.5 h-3.5 text-white" /></div><h3 className="text-sm font-semibold text-white">{title}</h3></div>{children}</div>);
}
function AB({ label, sub }: { label: string; sub: string }) {
  return (<div className="px-3 py-2 bg-slate-800/60 border border-slate-700/50 rounded-lg"><div className="text-xs font-semibold text-white">{label}</div><div className="text-[9px] text-slate-500">{sub}</div></div>);
}

export default MethodologyModal;
