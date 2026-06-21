import React, { useState, useEffect } from 'react';
import { Plus, X, Tag } from 'lucide-react';
import { Trade } from '../types';

interface AddTradeFormProps {
  onAddTrade: (trade: Omit<Trade, 'id' | 'profitLoss' | 'status'>) => void;
  onClose: () => void;
  darkMode?: boolean;
  t: (key: any, vars?: any) => string;
}

const COMMON_SETUPS = [
  'SMC: Break of Structure (BOS)',
  'SMC: Change of Character (CHoCH)',
  'SMC: Liquidity Sweep / Grab',
  'ICT: Fair Value Gap (FVG)',
  'ICT: Order Block (OB)',
  'ICT: Silver Bullet / Judas Swing',
  'SNR: Classic Support / Resistance',
  'SNR: Breakout & Retest',
  'SNR: Horizontal Key Level Bounce',
];

const EMOTIONAL_TAGS = [
  { label: 'Disciplined', category: 'positive', color: 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-400 dark:border-emerald-800' },
  { label: 'Patient', category: 'positive', color: 'bg-teal-50 text-teal-700 hover:bg-teal-100 border-teal-200 dark:bg-teal-950/40 dark:text-teal-400 dark:border-teal-800' },
  { label: 'Calm', category: 'positive', color: 'bg-blue-50 text-blue-700 hover:bg-blue-100 border-blue-200 dark:bg-blue-950/40 dark:text-blue-400 dark:border-blue-800' },
  { label: 'Hesitant / Fearful', category: 'negative', color: 'bg-amber-50 text-amber-700 hover:bg-amber-100 border-amber-200 dark:bg-amber-950/40 dark:text-amber-400 dark:border-amber-850' },
  { label: 'FOMO', category: 'negative', color: 'bg-purple-50 text-purple-700 hover:bg-purple-100 border-purple-200 dark:bg-purple-950/40 dark:text-purple-400 dark:border-purple-850' },
  { label: 'Greedy', category: 'negative', color: 'bg-rose-50 text-rose-700 hover:bg-rose-100 border-rose-200 dark:bg-rose-950/40 dark:text-rose-400 dark:border-rose-850' },
  { label: 'Impulsive', category: 'negative', color: 'bg-orange-50 text-orange-700 hover:bg-orange-100 border-orange-200 dark:bg-orange-950/40 dark:text-orange-400 dark:border-orange-850' },
  { label: 'Revenge Trade', category: 'negative', color: 'bg-red-50 text-red-700 hover:bg-red-100 border-red-200 dark:bg-red-950/40 dark:text-red-400 dark:border-red-900' },
];

export default function AddTradeForm({ onAddTrade, onClose, darkMode, t }: AddTradeFormProps) {
  const [symbol, setSymbol] = useState('');
  const [direction, setDirection] = useState<'Long' | 'Short'>('Long');
  const [entryPrice, setEntryPrice] = useState('');
  const [exitPrice, setExitPrice] = useState('');
  const [quantity, setQuantity] = useState('');
  const [setup, setSetup] = useState('');
  const [customSetup, setCustomSetup] = useState('');
  const [stopLoss, setStopLoss] = useState('');
  const [takeProfit, setTakeProfit] = useState('');
  const [fees, setFees] = useState('0');
  const [date, setDate] = useState(() => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  });
  const [notes, setNotes] = useState('');
  const [selectedMindsets, setSelectedMindsets] = useState<string[]>([]);
  
  // Real-time estimated profit or loss
  const [estimatedPl, setEstimatedPl] = useState<number | null>(null);

  useEffect(() => {
    const entry = parseFloat(entryPrice);
    const exit = parseFloat(exitPrice);
    const qty = parseFloat(quantity);
    const feeValue = parseFloat(fees) || 0;

    if (!isNaN(entry) && !isNaN(exit) && !isNaN(qty)) {
      const pl = direction === 'Long' 
        ? (exit - entry) * qty - feeValue
        : (entry - exit) * qty - feeValue;
      setEstimatedPl(pl);
    } else {
      setEstimatedPl(null);
    }
  }, [entryPrice, exitPrice, quantity, direction, fees]);

  const handleMindsetToggle = (tag: string) => {
    if (selectedMindsets.includes(tag)) {
      setSelectedMindsets(selectedMindsets.filter(t => t !== tag));
    } else {
      setSelectedMindsets([...selectedMindsets, tag]);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!symbol || !entryPrice || !exitPrice || !quantity) return;

    const finalSetup = setup === 'custom' ? customSetup : setup;

    onAddTrade({
      symbol: symbol.toUpperCase(),
      date,
      direction,
      entryPrice: parseFloat(entryPrice),
      exitPrice: parseFloat(exitPrice),
      quantity: parseFloat(quantity),
      setup: finalSetup || 'Unspecified Setup',
      notes,
      stopLoss: stopLoss ? parseFloat(stopLoss) : undefined,
      takeProfit: takeProfit ? parseFloat(takeProfit) : undefined,
      fees: fees ? parseFloat(fees) : 0,
      mindset: selectedMindsets,
    });
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div 
        className={`rounded-none w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-[8px_8px_0px_rgba(0,0,0,0.15)] border-2 flex flex-col ${
          darkMode 
            ? 'bg-slate-900 text-slate-100 border-slate-700' 
            : 'bg-white text-slate-800 border-slate-800'
        }`}
        id="add-trade-modal"
      >
        {/* Header */}
        <div className={`p-6 border-b-2 flex justify-between items-center ${
          darkMode ? 'bg-slate-850/60 border-slate-700' : 'bg-slate-50 border-slate-800'
        }`}>
          <div>
            <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest">{t('addTradeSubtitle')}</span>
            <h3 className="text-sm font-bold uppercase tracking-wider mt-1">{t('addTradeTitle')}</h3>
          </div>
          <button 
            type="button" 
            onClick={onClose}
            className={`p-1.5 border rounded-none transition-all ${
              darkMode 
                ? 'border-slate-700 text-slate-400 hover:text-white hover:bg-slate-800' 
                : 'border-slate-200 text-slate-400 hover:text-slate-900 hover:border-slate-405 hover:bg-slate-100'
            }`}
            id="close-add-trade-modal"
          >
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6 flex-1">
          {/* General Trade Details */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">{t('assetSymbolLabel')}</label>
              <input
                type="text"
                required
                placeholder="e.g. BTC/USDT, AAPL, EUR/USD"
                value={symbol}
                onChange={(e) => setSymbol(e.target.value)}
                className={`w-full px-4 py-2.5 border rounded-none focus:outline-none focus:border-indigo-500 font-mono text-sm transition-all font-semibold ${
                  darkMode 
                    ? 'bg-slate-850 border-slate-700 text-slate-100' 
                    : 'bg-white border-slate-300 text-slate-800'
                }`}
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">{t('tradeDateLabel')}</label>
              <input
                type="date"
                required
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className={`w-full px-4 py-2.5 border rounded-none focus:outline-none focus:border-indigo-505 font-mono text-sm transition-all ${
                  darkMode 
                    ? 'bg-slate-850 border-slate-700 text-slate-100' 
                    : 'bg-white border-slate-300 text-slate-800'
                }`}
              />
            </div>
          </div>

          {/* Direction */}
          <div>
            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">{t('positionDirLabel')}</label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setDirection('Long')}
                className={`py-3 rounded-none border-2 text-xs uppercase tracking-widest font-bold transition-all flex justify-center items-center gap-2 cursor-pointer ${
                  direction === 'Long'
                    ? 'bg-emerald-50 border-emerald-600 text-emerald-800 dark:bg-emerald-950/30 dark:border-emerald-505 dark:text-emerald-400'
                    : darkMode
                    ? 'bg-slate-850 border-slate-700 text-slate-500 hover:border-slate-600'
                    : 'bg-white border-slate-250 text-slate-400 hover:border-slate-350 hover:bg-slate-50'
                }`}
              >
                <div className="w-2.5 h-2.5 bg-emerald-500"></div>
                LONG / BUY
              </button>
              <button
                type="button"
                onClick={() => setDirection('Short')}
                className={`py-3 rounded-none border-2 text-xs uppercase tracking-widest font-bold transition-all flex justify-center items-center gap-2 cursor-pointer ${
                  direction === 'Short'
                    ? 'bg-rose-50 border-rose-600 text-rose-800 dark:bg-rose-950/30 dark:border-rose-505 dark:text-rose-400'
                    : darkMode
                    ? 'bg-slate-850 border-slate-700 text-slate-500 hover:border-slate-600'
                    : 'bg-white border-slate-255 text-slate-400 hover:border-slate-350 hover:bg-slate-50'
                }`}
              >
                <div className="w-2.5 h-2.5 bg-rose-500"></div>
                SHORT / SELL
              </button>
            </div>
          </div>

          {/* Execution details */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">{t('entryPriceLabel')}</label>
              <input
                type="number"
                step="any"
                required
                min="0"
                placeholder="0.00"
                value={entryPrice}
                onChange={(e) => setEntryPrice(e.target.value)}
                className={`w-full px-4 py-2.5 border rounded-none focus:outline-none focus:border-indigo-505 font-mono text-sm ${
                  darkMode 
                    ? 'bg-slate-850 border-slate-700 text-slate-100' 
                    : 'bg-white border-slate-300 text-slate-800'
                }`}
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">{t('exitPriceLabel')}</label>
              <input
                type="number"
                step="any"
                required
                min="0"
                placeholder="0.00"
                value={exitPrice}
                onChange={(e) => setExitPrice(e.target.value)}
                className={`w-full px-4 py-2.5 border rounded-none focus:outline-none focus:border-indigo-505 font-mono text-sm ${
                  darkMode 
                    ? 'bg-slate-850 border-slate-700 text-slate-100' 
                    : 'bg-white border-slate-300 text-slate-800'
                }`}
              />
            </div>
            <div className="col-span-2 sm:col-span-1">
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">{t('quantityLabel')}</label>
              <input
                type="number"
                step="any"
                required
                min="0"
                placeholder="0"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                className={`w-full px-4 py-2.5 border rounded-none focus:outline-none focus:border-indigo-505 font-mono text-sm ${
                  darkMode 
                    ? 'bg-slate-850 border-slate-700 text-slate-100' 
                    : 'bg-white border-slate-300 text-slate-800'
                }`}
              />
            </div>
          </div>

          {/* Optional Limits */}
          <div className={`grid grid-cols-3 gap-4 p-4 rounded-none border ${
            darkMode ? 'bg-slate-950/40 border-slate-800' : 'bg-slate-50 border-slate-205'
          }`}>
            <div>
              <label className="block text-[9px] font-extrabold text-slate-400 uppercase tracking-widest mb-1">{t('stopLossLabel')}</label>
              <input
                type="number"
                step="any"
                placeholder="None"
                value={stopLoss}
                onChange={(e) => setStopLoss(e.target.value)}
                className={`w-full px-3 py-2 border rounded-none focus:outline-none focus:border-indigo-500 text-xs font-mono ${
                  darkMode 
                    ? 'bg-slate-900 border-slate-700 text-slate-100' 
                    : 'bg-white border-slate-300 text-slate-800'
                }`}
              />
            </div>
            <div>
              <label className="block text-[9px] font-extrabold text-slate-400 uppercase tracking-widest mb-1">{t('takeProfitLabel')}</label>
              <input
                type="number"
                step="any"
                placeholder="None"
                value={takeProfit}
                onChange={(e) => setTakeProfit(e.target.value)}
                className={`w-full px-3 py-2 border rounded-none focus:outline-none focus:border-indigo-500 text-xs font-mono ${
                  darkMode 
                    ? 'bg-slate-900 border-slate-700 text-slate-100' 
                    : 'bg-white border-slate-300 text-slate-800'
                }`}
              />
            </div>
            <div>
              <label className="block text-[9px] font-extrabold text-slate-400 uppercase tracking-widest mb-1">{t('feesLabel')}</label>
              <input
                type="number"
                step="any"
                placeholder="0.00"
                value={fees}
                onChange={(e) => setFees(e.target.value)}
                className={`w-full px-3 py-2 border rounded-none focus:outline-none focus:border-indigo-500 text-xs font-mono ${
                  darkMode 
                    ? 'bg-slate-900 border-slate-700 text-slate-100' 
                    : 'bg-white border-slate-300 text-slate-800'
                }`}
              />
            </div>
          </div>

          {/* Strategy / Setup */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">{t('strategySetupLabel')}</label>
              <select
                value={setup}
                onChange={(e) => setSetup(e.target.value)}
                className={`w-full px-4 py-2.5 border rounded-none focus:outline-none focus:border-indigo-505 text-sm font-medium ${
                  darkMode 
                    ? 'bg-slate-850 border-slate-700 text-slate-100' 
                    : 'bg-white border-slate-300 text-slate-800'
                }`}
              >
                <option value="">{t('selectPlaceholder')}</option>
                {COMMON_SETUPS.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
                <option value="custom">-- Custom Setup --</option>
              </select>
            </div>
            
            {setup === 'custom' && (
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">{t('selectCustomSetup')}</label>
                <input
                  type="text"
                  required
                  placeholder="Enter strategy name"
                  value={customSetup}
                  onChange={(e) => setCustomSetup(e.target.value)}
                  className={`w-full px-4 py-2.5 border rounded-none focus:outline-none focus:border-indigo-505 text-sm font-medium ${
                    darkMode 
                      ? 'bg-slate-850 border-slate-700 text-slate-100' 
                      : 'bg-white border-slate-300 text-slate-800'
                  }`}
                />
              </div>
            )}
          </div>

          {/* Mindset Multi-Select */}
          <div>
            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 flex items-center gap-1.5">
              <Tag size={13} className="text-slate-400" />
              {t('psychologyTitle')}
            </label>
            <div className="flex flex-wrap gap-2 mt-2">
              {EMOTIONAL_TAGS.map((tag) => {
                const isSelected = selectedMindsets.includes(tag.label);
                return (
                  <button
                    type="button"
                    key={tag.label}
                    onClick={() => handleMindsetToggle(tag.label)}
                    className={`px-3 py-1.5 rounded-none text-[11px] font-semibold border transition-all cursor-pointer ${
                      isSelected
                        ? tag.color + (darkMode ? ' border-indigo-400 ring-1 ring-indigo-400' : ' border-slate-800 ring-1 ring-slate-800')
                        : darkMode
                        ? 'bg-slate-850 border-slate-700 text-slate-300 hover:bg-slate-800'
                        : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50 hover:border-slate-300'
                    }`}
                  >
                    {tag.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">{t('notesLabel')}</label>
            <textarea
              placeholder={t('notesPlaceholder')}
              value={notes}
              rows={3}
              onChange={(e) => setNotes(e.target.value)}
              className={`w-full px-4 py-3 border rounded-none focus:outline-none focus:border-indigo-500 text-sm transition-all ${
                darkMode 
                  ? 'bg-slate-850 border-slate-700 text-slate-100 placeholder-slate-500' 
                  : 'bg-white border-slate-300 text-slate-800 placeholder-slate-404'
              }`}
            />
          </div>

          {/* Real-time calculated PL banner */}
          {estimatedPl !== null && (
            <div className={`p-4 rounded-none flex justify-between items-center border-2 ${
              estimatedPl > 0 
                ? 'bg-emerald-50/50 border-emerald-600 text-emerald-800 dark:bg-emerald-950/20 dark:border-emerald-500 dark:text-emerald-300' 
                : estimatedPl < 0 
                ? 'bg-rose-50/50 border-rose-600 text-rose-800 dark:bg-rose-950/20 dark:border-rose-500 dark:text-rose-300' 
                : 'bg-slate-50 border-slate-300 text-slate-850 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700'
            }`}>
              <div className="flex items-center gap-2">
                <div className={`w-2.5 h-2.5 ${estimatedPl > 0 ? 'bg-emerald-505' : estimatedPl < 0 ? 'bg-rose-505' : 'bg-slate-400'}`}></div>
                <span className="text-[10px] font-bold uppercase tracking-widest">{t('estimatedPlLabel')}</span>
              </div>
              <span className="text-sm font-mono font-bold">
                {estimatedPl > 0 ? '+' : ''}{estimatedPl.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} USD
              </span>
            </div>
          )}

          {/* Footer Action Buttons */}
          <div className={`pt-4 border-t flex items-center justify-end gap-3 ${
            darkMode ? 'border-slate-800 bg-slate-900' : 'border-slate-205 bg-white'
          }`}>
            <button
              type="button"
              onClick={onClose}
              className={`px-5 py-3 rounded-none border text-xs font-bold uppercase tracking-widest transition-all cursor-pointer ${
                darkMode 
                  ? 'border-slate-700 text-slate-400 hover:bg-slate-800 hover:text-white' 
                  : 'border-slate-250 text-slate-505 hover:bg-slate-50 hover:text-slate-800'
              }`}
            >
              {t('cancelBtn')}
            </button>
            <button
              type="submit"
              className={`px-6 py-3 rounded-none text-xs font-bold uppercase tracking-widest transition-all flex items-center gap-2 cursor-pointer hover:translate-y-[-1px] active:translate-y-[1px] ${
                darkMode 
                  ? 'bg-indigo-650 hover:bg-indigo-550 border border-indigo-600 text-white' 
                  : 'bg-slate-900 border border-slate-900 hover:bg-slate-800 text-white'
              }`}
            >
              <Plus size={14} />
              {t('saveToJournal')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
