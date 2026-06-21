import React, { useState } from 'react';
import { Sparkles, BrainCircuit, RefreshCw, AlertCircle, CheckCircle } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { Trade } from '../types';

interface AiInsightsProps {
  trades: Trade[];
  cachedAnalysis: string | null;
  onSaveAnalysis: (analysis: string) => void;
  lang: string;
  t: (key: any, vars?: any) => string;
}

const LOADING_STEPS_EN = [
  'Aggregating transaction history...',
  'Evaluating winning strategy setups...',
  'Mapping positive mindsets against cumulative yields...',
  'Diagnosing revenge trading and overconfident triggers...',
  'Drafting professional risk remediation plan...',
];

const LOADING_STEPS_MY = [
  'ကုန်သွယ်မှု အတိတ်ရက်စွဲများကို စုစည်းနေသည်...',
  'အနိုင်ရသော စနစ်ဗျူဟာများကို တွက်ချက်နေသည်...',
  'စိတ်အခြေအနေနှင့် ရလဒ်များကို နှိုင်းယှဉ်နေသည်...',
  'စိတ်လှုပ်ရှားမှုနှင့် ကလဲ့စားချေကုန်သွယ်ခြင်းများကို ဆန်းစစ်နေသည်...',
  'အဆင့်မြင့် စီမံခန့်ခွဲမှု အကြံပြုချက်များကို ရေးဆွဲနေသည်...',
];

export default function AiInsights({ trades, cachedAnalysis, onSaveAnalysis, lang, t }: AiInsightsProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loadingStepIdx, setLoadingStepIdx] = useState(0);

  const steps = lang === 'my' ? LOADING_STEPS_MY : LOADING_STEPS_EN;

  const startAnalysis = async () => {
    if (trades.length === 0) {
      setError(lang === 'my' ? 'ခွဲခြမ်းစိတ်ဖြာရန် ကျေးဇူးပြု၍ အနည်းဆုံး ကုန်သွယ်မှုတစ်ခု ထည့်သွင်းပေးပါ။' : 'Please add at least one trade to your journal before requesting AI insights.');
      return;
    }

    setLoading(true);
    setError(null);
    setLoadingStepIdx(0);

    // Rotate loading messages
    const stepInterval = setInterval(() => {
      setLoadingStepIdx((prev) => (prev + 1) % steps.length);
    }, 2000);

    try {
      const response = await fetch('/api/gemini/analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ trades, lang }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Server responded with an execution error.');
      }

      onSaveAnalysis(data.analysis);
    } catch (err: any) {
      console.error('AI Insight retrieval failed:', err);
      setError(err.message || (lang === 'my' ? 'ချိတ်ဆက်မှု မအောင်မြင်ပါ။ backend နှင့် dynamic variables မှန်ကန်စွာ သတ်မှတ်ထားကြောင်း စစ်ဆေးပါ။' : 'Network error requested. Ensure your backend and secret keys are operational.'));
    } finally {
      clearInterval(stepInterval);
      setLoading(false);
    }
  };

  return (
    <div className="bg-slate-900 text-slate-100 rounded-none p-6 sm:p-8 border-2 border-slate-800 relative overflow-hidden" id="ai-insights-panel">
      {/* Abstract background flare */}
      <div className="absolute -top-10 -right-10 w-45 h-45 bg-indigo-550/5 rounded-full blur-3xl pointer-events-none"></div>

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-850">
        <div className="flex items-start gap-4">
          <div className="p-3 bg-indigo-500/15 text-indigo-400 rounded-none border border-indigo-500/25">
            <Sparkles size={24} />
          </div>
          <div>
            <h3 className="text-sm font-extrabold tracking-wider text-white flex items-center gap-2 uppercase">
              {t('aiCoachTitle')}
              <span className="text-[9px] font-extrabold tracking-widest bg-indigo-505/20 text-indigo-300 border border-indigo-500/30 px-2 py-0.5 rounded-none uppercase animate-pulse">
                Gemini Active
              </span>
            </h3>
            <p className="text-xs text-slate-400 mt-1 max-w-xl">
              {t('aiCoachSubtitle')} &middot; {t('aiAdviceNote')}
            </p>
          </div>
        </div>

        {!loading && trades.length > 0 && (
          <button
            onClick={startAnalysis}
            className="px-5 py-3 bg-indigo-600 hover:bg-indigo-550 text-white font-extrabold text-xs rounded-none flex items-center gap-1.5 transition-all uppercase tracking-widest cursor-pointer active:translate-y-[1px] select-none"
          >
            <BrainCircuit size={14} />
            {cachedAnalysis ? t('aiGenerateBtn') : t('aiGenerateBtn')}
          </button>
        )}
      </div>

      {/* Loading Canvas */}
      {loading && (
        <div className="py-12 flex flex-col items-center justify-center text-center space-y-4">
          <RefreshCw size={36} className="text-indigo-400 animate-spin" />
          <div className="space-y-2">
            <h4 className="text-xs font-bold uppercase tracking-widest text-white">{t('aiGenerating')}</h4>
            <p className="text-xs text-indigo-300 font-mono animate-pulse">{steps[loadingStepIdx]}</p>
          </div>
        </div>
      )}

      {/* Error Output */}
      {error && (
        <div className="mt-6 p-4 bg-rose-500/10 rounded-none border border-rose-500/20 text-rose-300 flex items-start gap-3 text-xs leading-relaxed">
          <AlertCircle size={16} className="shrink-0 mt-0.5" />
          <div>
            <span className="font-bold block text-rose-200 mb-0.5 uppercase tracking-wider text-[10px]">Execution Failed</span>
            {error}
            <span className="block mt-2 text-slate-500 text-[10px]">
              Note: Make sure your GEMINI_API_KEY environment variable is declared in your Settings panel.
            </span>
          </div>
        </div>
      )}

      {/* Success Analysis Presentation */}
      {!loading && !error && (
        <div className="mt-6">
          {cachedAnalysis ? (
            <div className="prose prose-invert max-w-none prose-xs text-slate-300">
              {/* Customized styled Markdown wrapper */}
              <div className="text-xs sm:text-sm leading-relaxed space-y-4">
                <ReactMarkdown
                  components={{
                    h1: ({ children }) => <h1 className="text-white text-xs font-extrabold uppercase tracking-widest mt-6 mb-3 border-b border-slate-850 pb-2 text-indigo-400">{children}</h1>,
                    h2: ({ children }) => <h2 className="text-white text-xs font-bold uppercase tracking-widest mt-5 mb-2 text-indigo-300">{children}</h2>,
                    h3: ({ children }) => <h3 className="text-white text-xs font-semibold uppercase mt-4 mb-1.5 text-indigo-200">{children}</h3>,
                    p: ({ children }) => <p className="text-slate-300 leading-relaxed mb-3 font-normal">{children}</p>,
                    ul: ({ children }) => <ul className="list-disc pl-5 mb-3 space-y-1.5 text-slate-300">{children}</ul>,
                    ol: ({ children }) => <ol className="list-decimal pl-5 mb-3 space-y-1.5 text-slate-300">{children}</ol>,
                    li: ({ children }) => <li className="text-slate-300 text-xs sm:text-sm">{children}</li>,
                    strong: ({ children }) => <strong className="font-bold text-white bg-slate-800/80 px-1 py-0.5 rounded-none font-mono">{children}</strong>,
                  }}
                >
                  {cachedAnalysis}
                </ReactMarkdown>
              </div>
            </div>
          ) : (
            <div className="py-8 text-center flex flex-col items-center justify-center space-y-3">
              <BrainCircuit size={40} className="text-slate-700" />
              <div className="max-w-sm">
                <p className="text-xs text-slate-500 font-bold uppercase tracking-wide">No active analysis loaded.</p>
                <p className="text-[11px] text-slate-500 mt-1 leading-relaxed">
                  {trades.length === 0 
                    ? (lang === 'my' ? "အိုင်အေနည်းပြဆရာနှင့် စိတ်ပိုင်းဆိုင်ရာ စီမံခန့်ခွဲမှုဆန်းစစ်ချက်များကို ရယူနိုင်ရန် သင်၏ ပထမဦးဆုံး ကုန်သွယ်မှုကို မှတ်တမ်းတင်ပေးပါ။" : "Log at least one executed trade in your ledger to allow the AI Trading Coach to run deep cognitive audits.")
                    : (lang === 'my' ? "စိတ်ပိုင်းဆိုင်ရာလှုပ်ရှားမှုနှင့် အရှုံးအနိုင်အချိုးများကို ဖော်ထုတ်ဆန်းစစ်ရန် အပေါ်မှ ခလုပ်ကို နှိပ်ပါ။" : "Establish an active connection to identify strategy win-losses and psychological barriers.")}
                </p>
              </div>
              {trades.length > 0 && (
                <button
                  onClick={startAnalysis}
                  className="mt-3 px-4 py-2 bg-indigo-600/25 border border-indigo-500/30 text-indigo-300 hover:bg-indigo-600/40 rounded-none font-bold text-[10px] uppercase tracking-widest cursor-pointer"
                >
                  {t('aiGenerateBtn')}
                </button>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
