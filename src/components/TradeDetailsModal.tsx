import React from 'react';
import { X, Calendar, Activity, FileText } from 'lucide-react';
import { Trade } from '../types';

interface TradeDetailsModalProps {
  trade: Trade;
  onClose: () => void;
  onDelete?: (id: string) => void;
  darkMode?: boolean;
  t: (key: any, vars?: any) => string;
  lang?: string;
}

export default function TradeDetailsModal({ trade, onClose, onDelete, darkMode, t, lang }: TradeDetailsModalProps) {
  const isWin = trade.status === 'Win';
  const isLoss = trade.status === 'Loss';
  
  // Risk to reward and placement analytics
  const entry = trade.entryPrice;
  const exit = trade.exitPrice;
  const sl = trade.stopLoss;
  const tp = trade.takeProfit;

  // Render a visual Risk/Reward range representation in CSS
  const renderTradeSpectrum = () => {
    if (!sl && !tp) {
      return (
        <div className={`text-center py-4 text-xs italic rounded-none border border-dashed ${
          darkMode 
            ? 'text-slate-550 bg-slate-950/40 border-slate-800' 
            : 'text-slate-400 bg-slate-50 border-slate-200'
        }`}>
          {t('spectrumNoLimits')}
        </div>
      );
    }

    const slVal = sl || (trade.direction === 'Long' ? entry * 0.95 : entry * 1.05);
    const tpVal = tp || (trade.direction === 'Long' ? entry * 1.10 : entry * 0.90);

    const minRange = Math.min(entry, exit, slVal, tpVal);
    const maxRange = Math.max(entry, exit, slVal, tpVal);
    const totalSpectrum = maxRange - minRange || 1;

    const getPercent = (val: number) => {
      const percentage = ((val - minRange) / totalSpectrum) * 100;
      return Math.min(Math.max(percentage, 2), 98); // Clamp between 2% and 98% for safety
    };

    const entryPct = getPercent(entry);
    const exitPct = getPercent(exit);
    const slPct = getPercent(slVal);
    const tpPct = getPercent(tpVal);

    return (
      <div className="space-y-4">
        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">{t('riskRewardTitle')}</span>
        
        <div className={`relative h-10 rounded-none border mt-2 overflow-hidden ${
          darkMode ? 'bg-slate-955 border-slate-800' : 'bg-slate-100 border-slate-200'
        }`}>
          {/* Stop Loss Indicator Line */}
          <div 
            className="absolute top-0 bottom-0 w-0.5 bg-rose-400/80" 
            style={{ left: `${slPct}%` }}
            title={`Stop Loss: ${slVal}`}
          />
          {/* Take Profit Line */}
          <div 
            className="absolute top-0 bottom-0 w-0.5 bg-emerald-400/80" 
            style={{ left: `${tpPct}%` }}
            title={`Take Profit: ${tpVal}`}
          />
          {/* Entry Point (Rotated Square / Diamond) */}
          <div 
            className={`absolute top-1/2 -translate-y-1/2 w-3.5 h-3.5 rotate-45 border flex items-center justify-center z-10 shadow-sm ${
              darkMode ? 'bg-indigo-400 border-slate-900 text-slate-900' : 'bg-slate-900 border-white text-white'
            }`} 
            style={{ left: `calc(${entryPct}% - 7px)` }}
            title={`Entry Price: ${entry}`}
          >
            <div className={`w-1 h-1 ${darkMode ? 'bg-slate-900' : 'bg-white'}`}></div>
          </div>
          {/* Exit Point (Rotated Square / Diamond) */}
          <div 
            className={`absolute top-1/2 -translate-y-1/2 w-4 h-4 rotate-45 border border-white flex items-center justify-center z-10 shadow-sm ${
              isWin ? 'bg-emerald-500 text-white' : isLoss ? 'bg-rose-500 text-white' : 'bg-slate-404 text-white'
            }`} 
            style={{ left: `calc(${exitPct}% - 8px)` }}
            title={`Exit Price: ${exit}`}
          >
            <div className="-rotate-45 scale-75 text-[8px] font-bold flex items-center justify-center">
              {trade.direction === 'Long' 
                ? (exit > entry ? 'W' : 'L')
                : (exit < entry ? 'W' : 'L')
              }
            </div>
          </div>

          {/* Color range filling (Long vs Short profit zones) */}
          <div 
            className="absolute top-0 bottom-0 opacity-15"
            style={trade.direction === 'Long' ? {
              left: `${slPct}%`,
              width: `${Math.max(entryPct - slPct, 0)}%`,
              backgroundColor: '#f43f5e'
            } : {
              left: `${entryPct}%`,
              width: `${Math.max(slPct - entryPct, 0)}%`,
              backgroundColor: '#f43f5e'
            }}
            title="Loss Risk Zone"
          />
          <div 
            className="absolute top-0 bottom-0 opacity-15"
            style={trade.direction === 'Long' ? {
              left: `${entryPct}%`,
              width: `${Math.max(tpPct - entryPct, 0)}%`,
              backgroundColor: '#10b981'
            } : {
              left: `${tpPct}%`,
              width: `${Math.max(entryPct - tpPct, 0)}%`,
              backgroundColor: '#10b981'
            }}
            title="Profit Reward Zone"
          />
        </div>

        <div className="grid grid-cols-4 text-center text-[9px] font-extrabold uppercase tracking-widest text-slate-400">
          <div>SL: <span className="font-mono text-rose-600 block text-[10px] font-bold mt-0.5">{slVal.toFixed(2)}</span></div>
          <div>Entry: <span className={`font-mono block text-[10px] font-bold mt-0.5 ${darkMode ? 'text-slate-300' : 'text-slate-800'}`}>{entry.toFixed(2)}</span></div>
          <div>Exit: <span className={`font-mono block text-[10px] font-bold mt-0.5 ${darkMode ? 'text-slate-300' : 'text-slate-800'}`}>{exit.toFixed(2)}</span></div>
          <div>TP: <span className="font-mono text-emerald-600 block text-[10px] font-bold mt-0.5">{tpVal.toFixed(2)}</span></div>
        </div>
      </div>
    );
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div 
        className={`rounded-none w-full max-w-lg shadow-[6px_6px_0px_rgba(0,0,0,0.15)] border-2 flex flex-col overflow-hidden max-h-[90vh] ${
          darkMode 
            ? 'bg-slate-900 border-slate-705 text-slate-100' 
            : 'bg-white border-slate-800 text-slate-800'
        }`}
        id={`trade-detail-${trade.id}`}
      >
        {/* Banner Status Header */}
        <div className={`p-6 text-white relative flex flex-col justify-between rounded-none ${
          isWin ? 'bg-emerald-600' : isLoss ? 'bg-rose-600' : 'bg-slate-700'
        }`}>
          {/* Close trigger */}
          <button 
            onClick={onClose} 
            className="absolute top-4 right-4 p-1.5 bg-white/20 hover:bg-white/30 rounded-none transition-all text-white border border-white/25 cursor-pointer"
            id="close-trade-detail-drawer"
          >
            <X size={16} />
          </button>

          <div>
            <span className="text-[9px] font-bold tracking-widest uppercase bg-white/20 px-2.5 py-0.5 rounded-none border border-white/25">
              {trade.direction === 'Long' ? 'LONG / BUY' : 'SHORT / SELL'}
            </span>
            <div className="flex items-center gap-2 mt-4">
              <h2 className="text-2xl font-bold tracking-wider uppercase">{trade.symbol}</h2>
              <span className="text-xs font-semibold opacity-90 font-mono">({trade.setup})</span>
            </div>
          </div>

          <div className="flex justify-between items-end mt-6">
            <span className="text-[10px] opacity-90 flex items-center gap-1 font-bold uppercase tracking-wide">
              <Calendar size={12} />
              {trade.date}
            </span>
            <div className="text-right">
              <span className="text-[9px] uppercase opacity-85 block font-bold tracking-widest leading-none">Net P/L</span>
              <span className="text-xl font-bold font-mono tracking-tight leading-none mt-1 block">
                {trade.profitLoss > 0 ? '+' : ''}{trade.profitLoss.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} USD
              </span>
            </div>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-6 overflow-y-auto flex-1">
          {/* Numbers Grid */}
          <div className="grid grid-cols-3 gap-3">
            <div className={`p-3 border rounded-none text-center ${
              darkMode ? 'bg-slate-950/40 border-slate-800' : 'bg-slate-50 border-slate-205'
            }`}>
              <span className="text-[9px] font-bold text-slate-400 block tracking-widest uppercase mb-1">{t('entryPriceLabel')}</span>
              <span className={`font-mono text-sm font-semibold ${darkMode ? 'text-slate-200' : 'text-slate-700'}`}>{trade.entryPrice.toLocaleString()}</span>
            </div>
            <div className={`p-3 border rounded-none text-center ${
              darkMode ? 'bg-slate-950/40 border-slate-800' : 'bg-slate-50 border-slate-205'
            }`}>
              <span className="text-[9px] font-bold text-slate-400 block tracking-widest uppercase mb-1">{t('exitPriceLabel')}</span>
              <span className={`font-mono text-sm font-semibold ${darkMode ? 'text-slate-200' : 'text-slate-700'}`}>{trade.exitPrice.toLocaleString()}</span>
            </div>
            <div className={`p-3 border rounded-none text-center ${
              darkMode ? 'bg-slate-950/40 border-slate-800' : 'bg-slate-50 border-slate-205'
            }`}>
              <span className="text-[9px] font-bold text-slate-400 block tracking-widest uppercase mb-1">{t('quantityLabel')}</span>
              <span className={`font-mono text-sm font-semibold ${darkMode ? 'text-slate-200' : 'text-slate-700'}`}>{trade.quantity.toLocaleString()}</span>
            </div>
          </div>

          {/* Spectrum */}
          {renderTradeSpectrum()}

          {/* Psychology & Mindsets */}
          <div>
            <div className="flex items-center gap-1.5 mb-2 border-b border-slate-105/10 pb-1.5">
              <Activity size={13} className="text-slate-400" />
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{t('psychologyTitle')}</span>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {trade.mindset && trade.mindset.length > 0 ? (
                trade.mindset.map((item) => {
                  const isPositive = ['Disciplined', 'Patient', 'Calm'].includes(item);
                  return (
                    <span 
                      key={item} 
                      className={`px-2.5 py-1 rounded-none text-[11px] font-semibold border flex items-center gap-1 ${
                        isPositive 
                          ? 'bg-emerald-50 border-emerald-200 text-emerald-800 dark:bg-emerald-950/20 dark:text-emerald-400 dark:border-emerald-900' 
                          : 'bg-rose-50 border-rose-200 text-rose-800 dark:bg-rose-950/20 dark:text-rose-400 dark:border-rose-900'
                      }`}
                    >
                      <div className="w-1.5 h-1.5 bg-current"></div>
                      {item}
                    </span>
                  );
                })
              ) : (
                <span className="text-xs text-slate-500 block italic font-mono">{t('noMindsetsTagged')}</span>
              )}
            </div>
          </div>

          {/* Notes */}
          <div>
            <div className="flex items-center gap-1.5 mb-2 border-b border-slate-105/10 pb-1.5">
              <FileText size={13} className="text-slate-400" />
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{t('notesLabel')}</span>
            </div>
            <div className={`p-4 rounded-none min-h-[80px] border ${
              darkMode ? 'bg-slate-955 border-slate-800' : 'bg-slate-50 border-slate-200'
            }`}>
              {trade.notes ? (
                <p className={`${darkMode ? 'text-slate-300' : 'text-slate-700'} text-xs sm:text-sm leading-relaxed whitespace-pre-wrap`}>{trade.notes}</p>
              ) : (
                <p className="text-slate-400 text-xs sm:text-sm italic font-mono">{t('noNotesRecorded')}</p>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        {onDelete && (
          <div className={`p-4 border-t flex justify-between items-center rounded-none ${
            darkMode ? 'bg-slate-950/40 border-slate-800' : 'bg-slate-50 border-slate-205'
          }`}>
            <button
              onClick={() => {
                const confirmMsg = lang === 'my' 
                  ? 'ဤမှတ်တမ်းကို ဂျာနယ်မှ ဖျက်ပစ်ရန် သေချာပါသလား။ ပြန်လည်ရယူနိုင်မည် မဟုတ်ပါ။'
                  : 'Are you sure you want to delete this trade from your journal? This cannot be undone.';
                if (confirm(confirmMsg)) {
                  onDelete(trade.id);
                  onClose();
                }
              }}
              className="px-4 py-2 hover:bg-rose-100 dark:hover:bg-rose-950/30 text-rose-600 hover:text-rose-700 rounded-none text-xs font-bold uppercase tracking-wider transition-all border border-transparent hover:border-rose-220 cursor-pointer"
            >
              {t('deleteTradeBtn')}
            </button>
            <button
              onClick={onClose}
              className={`px-5 py-2.5 rounded-none text-xs font-bold uppercase tracking-widest transition-all cursor-pointer ${
                darkMode 
                  ? 'bg-slate-800 hover:bg-slate-750 text-slate-100 border border-slate-700' 
                  : 'bg-slate-900 hover:bg-slate-805 text-white'
              }`}
            >
              {t('closeBtn')}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
