/**
 * SAVE REPORT DIALOG
 * 
 * A modal dialog that collects a title and optional notes from the user
 * before saving the current analysis state to the database.
 * Validates input and provides feedback on save success/failure.
 */

import React, { useState, useEffect } from 'react';
import {
  X,
  Save,
  FileText,
  Loader2,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';
import { SUPPORTED_COINS } from '@/types/crypto';

interface SaveReportDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (title: string, notes: string) => Promise<boolean>;
  saving: boolean;
  coinId: string;
  timeRange: number;
}

const SaveReportDialog: React.FC<SaveReportDialogProps> = ({
  isOpen,
  onClose,
  onSave,
  saving,
  coinId,
  timeRange,
}) => {
  const [title, setTitle] = useState('');
  const [notes, setNotes] = useState('');
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [errorMsg, setErrorMsg] = useState('');

  const coin = SUPPORTED_COINS.find(c => c.id === coinId);
  const defaultTitle = `${coin?.name || coinId} ${timeRange}D Analysis`;

  // Reset state when dialog opens
  useEffect(() => {
    if (isOpen) {
      setTitle('');
      setNotes('');
      setStatus('idle');
      setErrorMsg('');
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSave = async () => {
    const finalTitle = title.trim() || defaultTitle;
    setStatus('idle');
    setErrorMsg('');

    const success = await onSave(finalTitle, notes.trim());
    if (success) {
      setStatus('success');
      setTimeout(() => {
        onClose();
      }, 1200);
    } else {
      setStatus('error');
      setErrorMsg('Failed to save report. Please try again.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />

      {/* Dialog */}
      <div className="relative bg-[#0B1426] border border-slate-700/50 rounded-2xl w-full max-w-md shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-700/50">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center">
              <Save className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">Save Analysis Report</h2>
              <p className="text-[10px] text-slate-500">
                Persist current analysis to database
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 space-y-4">
          {/* Context info */}
          <div className="flex items-center gap-3 p-3 bg-slate-800/50 rounded-lg border border-slate-700/30">
            {coin && (
              <div className="flex items-center gap-2">
                <div
                  className="w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold text-white"
                  style={{ backgroundColor: coin.color }}
                >
                  {coin.symbol.charAt(0)}
                </div>
                <span className="text-sm font-semibold text-white">{coin.name}</span>
              </div>
            )}
            <span className="text-xs text-slate-500">|</span>
            <span className="text-xs text-slate-400">{timeRange}-day analysis</span>
          </div>

          {/* Title field */}
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1.5">
              Report Title
            </label>
            <div className="relative">
              <FileText className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder={defaultTitle}
                className="w-full bg-slate-800 border border-slate-700 text-white text-sm rounded-lg pl-10 pr-4 py-2.5 focus:ring-1 focus:ring-cyan-400 focus:border-cyan-400 outline-none placeholder:text-slate-600"
                maxLength={100}
                autoFocus
              />
            </div>
          </div>

          {/* Notes field */}
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1.5">
              Notes <span className="text-slate-600">(optional)</span>
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Add observations, conclusions, or context for this analysis..."
              className="w-full bg-slate-800 border border-slate-700 text-white text-sm rounded-lg px-4 py-2.5 focus:ring-1 focus:ring-cyan-400 focus:border-cyan-400 outline-none placeholder:text-slate-600 resize-none h-24"
              maxLength={500}
            />
            <div className="text-right mt-1">
              <span className="text-[10px] text-slate-600">{notes.length}/500</span>
            </div>
          </div>

          {/* Saved data info */}
          <div className="p-2.5 bg-cyan-400/5 border border-cyan-400/10 rounded-lg">
            <p className="text-[10px] text-cyan-400/70 leading-relaxed">
              <span className="font-semibold">What gets saved:</span> Selected coin, time range, all generated insights, indicator settings (MA7/MA30/MA200/Trend), comparison coin, and statistical snapshot.
            </p>
          </div>

          {/* Status messages */}
          {status === 'success' && (
            <div className="flex items-center gap-2 p-3 bg-emerald-400/10 border border-emerald-400/20 rounded-lg">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span className="text-xs text-emerald-400 font-medium">Report saved successfully!</span>
            </div>
          )}
          {status === 'error' && (
            <div className="flex items-center gap-2 p-3 bg-red-400/10 border border-red-400/20 rounded-lg">
              <AlertCircle className="w-4 h-4 text-red-400" />
              <span className="text-xs text-red-400 font-medium">{errorMsg}</span>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 p-5 border-t border-slate-700/50">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-medium text-slate-400 bg-slate-800 border border-slate-700 rounded-lg hover:bg-slate-700 hover:text-white transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={saving || status === 'success'}
            className="flex items-center gap-2 px-4 py-2 text-xs font-medium text-white bg-gradient-to-r from-amber-500 to-orange-600 rounded-lg hover:from-amber-600 hover:to-orange-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {saving ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                Saving...
              </>
            ) : status === 'success' ? (
              <>
                <CheckCircle2 className="w-3.5 h-3.5" />
                Saved!
              </>
            ) : (
              <>
                <Save className="w-3.5 h-3.5" />
                Save Report
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default SaveReportDialog;
