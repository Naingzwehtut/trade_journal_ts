import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  Search, 
  Filter, 
  TrendingUp, 
  Percent, 
  DollarSign, 
  BookOpen, 
  Layers, 
  Clock,
  Eye,
  Trash2,
  Moon,
  Sun
} from 'lucide-react';
import { Trade, TradingStats } from './types';
import MetricCard from './components/MetricCard';
import AddTradeForm from './components/AddTradeForm';
import TradeDetailsModal from './components/TradeDetailsModal';
import TradingCharts from './components/TradingCharts';
import AiInsights from './components/AiInsights';
import { Language, translations } from './translations';

// Elegant Mock trades to prevent a blank journal on first loads
const INITIAL_MOCK_TRADES: Trade[] = [
  {
    id: 't-1',
    symbol: 'BTC/USD',
    date: '2026-06-01',
    direction: 'Long',
    entryPrice: 65200,
    exitPrice: 67100,
    quantity: 0.15,
    setup: 'SMC: Break of Structure (BOS)',
    notes: 'Price recorded a decisive 1H Break of Structure (BOS) to the upside. Entered on return to the discount zone. Followed entry criteria flawlessly, moved SL to breakeven quickly, and took partials near local swing highs.',
    stopLoss: 64500,
    takeProfit: 67300,
    fees: 12.50,
    mindset: ['Calm', 'Disciplined', 'Patient'],
    profitLoss: 272.50, // (67100-65200)*0.15 - 12.50
    status: 'Win',
  },
  {
    id: 't-2',
    symbol: 'EUR/USD',
    date: '2026-06-03',
    direction: 'Short',
    entryPrice: 1.0850,
    exitPrice: 1.0810,
    quantity: 50000,
    setup: 'ICT: Order Block (OB)',
    notes: 'Entered Short upon retesting a bearish 15m ICT Order Block (OB) left behind during the London Session displacement. Managed risk carefully and took profits manually upon hitting the sell-side liquidity.',
    stopLoss: 1.0880,
    takeProfit: 1.0790,
    fees: 4.00,
    mindset: ['Patient', 'Calm'],
    profitLoss: 196.00, // (1.0850 - 1.0810) * 50000 - 4
    status: 'Win',
  },
  {
    id: 't-3',
    symbol: 'AAPL',
    date: '2026-06-05',
    direction: 'Long',
    entryPrice: 182.50,
    exitPrice: 179.80,
    quantity: 100,
    setup: 'SNR: Classic Support / Resistance',
    notes: 'Entered prematurely before candle confirmation of daily Support level. Price broke key support level downwards and hit our strict Stop Loss. Lessons learned: Wait for final candle closes on key S&R levels!',
    stopLoss: 180.00,
    takeProfit: 188.00,
    fees: 3.50,
    mindset: ['FOMO', 'Hesitant / Fearful'],
    profitLoss: -273.50, // (179.80 - 182.50) * 100 - 3.50
    status: 'Loss',
  },
  {
    id: 't-4',
    symbol: 'NVDA',
    date: '2026-06-08',
    direction: 'Short',
    entryPrice: 435.00,
    exitPrice: 442.00,
    quantity: 40,
    setup: 'ICT: Fair Value Gap (FVG)',
    notes: 'Revenge trade after losing on AAPL. Attempted to short during an aggressive run-up, anticipating a FVG fill on the 1m timeline instead of waiting for a proper HTF shift in market structure. Violated risk guidelines.',
    stopLoss: 439.00,
    takeProfit: 422.00,
    fees: 6.00,
    mindset: ['Impulsive', 'Revenge Trade', 'Greedy'],
    profitLoss: -286.00, // (435 - 442) * 40 - 6.00
    status: 'Loss',
  }
];

export default function App() {
  const [trades, setTrades] = useState<Trade[]>([]);
  const [cachedAnalysis, setCachedAnalysis] = useState<string | null>(null);
  
  // View managers
  const [activeTab, setActiveTab] = useState<'dashboard' | 'logs'>('dashboard');
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [selectedTrade, setSelectedTrade] = useState<Trade | null>(null);

  // Preference management state
  const [darkMode, setDarkMode] = useState<boolean>(() => {
    return localStorage.getItem('equilog_dark_mode') === 'true';
  });
  const [lang, setLang] = useState<Language>(() => {
    return (localStorage.getItem('equilog_lang') as Language) || 'en';
  });

  // Filters state
  const [searchQuery, setSearchQuery] = useState('');
  const [filterDirection, setFilterDirection] = useState<'all' | 'Long' | 'Short'>('all');
  const [filterStatus, setFilterStatus] = useState<'all' | 'Win' | 'Loss' | 'Breakeven'>('all');
  const [filterSetup, setFilterSetup] = useState<string>('all');
  const [filterMindset, setFilterMindset] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'date_desc' | 'date_asc' | 'pl_desc' | 'pl_asc'>('date_desc');

  // Load state on startup
  useEffect(() => {
    const savedTrades = localStorage.getItem('trading_journal_trades');
    const savedAnalysis = localStorage.getItem('trading_journal_analysis');

    if (savedTrades) {
      try {
        setTrades(JSON.parse(savedTrades));
      } catch (err) {
        setTrades(INITIAL_MOCK_TRADES);
      }
    } else {
      // Seed initial data
      setTrades(INITIAL_MOCK_TRADES);
      localStorage.setItem('trading_journal_trades', JSON.stringify(INITIAL_MOCK_TRADES));
    }

    if (savedAnalysis) {
      setCachedAnalysis(savedAnalysis);
    }
  }, []);

  // Save changes to storage
  const saveTradesToStorage = (updatedTrades: Trade[]) => {
    setTrades(updatedTrades);
    localStorage.setItem('trading_journal_trades', JSON.stringify(updatedTrades));
  };

  const handleSaveAnalysis = (analysis: string) => {
    setCachedAnalysis(analysis);
    localStorage.setItem('trading_journal_analysis', analysis);
  };

  const toggleDarkMode = () => {
    const nextMode = !darkMode;
    setDarkMode(nextMode);
    localStorage.setItem('equilog_dark_mode', String(nextMode));
  };

  const toggleLanguage = () => {
    const nextLang = lang === 'en' ? 'my' : 'en';
    setLang(nextLang);
    localStorage.setItem('equilog_lang', nextLang);
  };

  // Translation helper with template replacement support
  const t = (key: string, replacements?: Record<string, string | number>): string => {
    const dict = translations[lang] || translations['en'];
    let text = (dict as any)[key] || (translations['en'] as any)[key] || key;
    if (replacements) {
      Object.entries(replacements).forEach(([k, v]) => {
        text = text.replace(`{${k}}`, String(v));
      });
    }
    return text;
  };

  // Add new trade
  const handleAddTrade = (newTrade: Omit<Trade, 'id' | 'profitLoss' | 'status'>) => {
    const diff = newTrade.exitPrice - newTrade.entryPrice;
    const grossPl = newTrade.direction === 'Long' 
      ? diff * newTrade.quantity 
      : -diff * newTrade.quantity;
    
    const fees = newTrade.fees || 0;
    const finalPl = Number((grossPl - fees).toFixed(2));

    let finalStatus: 'Win' | 'Loss' | 'Breakeven' = 'Breakeven';
    if (finalPl > 0.01) finalStatus = 'Win';
    else if (finalPl < -0.01) finalStatus = 'Loss';

    const tradeWithDetails: Trade = {
      ...newTrade,
      id: `trade-${Date.now()}`,
      profitLoss: finalPl,
      status: finalStatus,
    };

    const updated = [tradeWithDetails, ...trades];
    saveTradesToStorage(updated);
    setAddModalOpen(false);
  };

  // Delete trade
  const handleDeleteTrade = (id: string) => {
    const updated = trades.filter((t) => t.id !== id);
    saveTradesToStorage(updated);
  };

  // Clear entire cache/journal if they request it in UI, but keep it structured
  const handleClearJournal = () => {
    if (confirm(t('confirmClear'))) {
      setTrades(INITIAL_MOCK_TRADES);
      setCachedAnalysis(null);
      localStorage.setItem('trading_journal_trades', JSON.stringify(INITIAL_MOCK_TRADES));
      localStorage.removeItem('trading_journal_analysis');
    }
  };

  // Build list of setups and mindsets dynamically for filter controls
  const uniqueSetups = Array.from(new Set(trades.map((t) => t.setup).filter(Boolean)));
  const uniqueMindsets = Array.from(
    new Set(trades.flatMap((t) => t.mindset || []).filter(Boolean))
  );

  // Compute detailed analytics statistics
  const computeStats = (): TradingStats => {
    const totalTrades = trades.length;
    if (totalTrades === 0) {
      return { totalTrades: 0, winRate: 0, totalPl: 0, profitFactor: 0, avgWin: 0, avgLoss: 0, longsCount: 0, shortsCount: 0 };
    }

    const wins = trades.filter((t) => t.status === 'Win');
    const losses = trades.filter((t) => t.status === 'Loss');
    const winRate = Number(((wins.length / totalTrades) * 100).toFixed(1));
    const totalPl = Number(trades.reduce((sum, t) => sum + t.profitLoss, 0).toFixed(2));

    const grossProfits = wins.reduce((sum, t) => sum + t.profitLoss, 0);
    const grossLosses = Math.abs(losses.reduce((sum, t) => sum + t.profitLoss, 0));
    const profitFactor = grossLosses > 0 
      ? Number((grossProfits / grossLosses).toFixed(2)) 
      : Number(grossProfits.toFixed(2));

    const avgWin = wins.length > 0 ? Number((grossProfits / wins.length).toFixed(2)) : 0;
    const avgLoss = losses.length > 0 ? Number((grossLosses / losses.length).toFixed(2)) : 0;

    const longsCount = trades.filter((t) => t.direction === 'Long').length;
    const shortsCount = trades.filter((t) => t.direction === 'Short').length;

    return { totalTrades, winRate, totalPl, profitFactor, avgWin, avgLoss, longsCount, shortsCount };
  };

  const stats = computeStats();

  // Execute sorting and filtering algorithms rules
  const filteredAndSortedTrades = trades
    .filter((trade) => {
      // Text search: matches symbol, setup or notes
      const matchesSearch = 
        trade.symbol.toLowerCase().includes(searchQuery.toLowerCase()) ||
        trade.setup.toLowerCase().includes(searchQuery.toLowerCase()) ||
        trade.notes.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesDirection = filterDirection === 'all' || trade.direction === filterDirection;
      const matchesStatus = filterStatus === 'all' || trade.status === filterStatus;
      const matchesSetup = filterSetup === 'all' || trade.setup === filterSetup;
      const matchesMindset = filterMindset === 'all' || (trade.mindset && trade.mindset.includes(filterMindset));

      return matchesSearch && matchesDirection && matchesStatus && matchesSetup && matchesMindset;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'date_asc':
          return new Date(a.date).getTime() - new Date(b.date).getTime();
        case 'pl_desc':
          return b.profitLoss - a.profitLoss;
        case 'pl_asc':
          return a.profitLoss - b.profitLoss;
        case 'date_desc':
        default:
          return new Date(b.date).getTime() - new Date(a.date).getTime();
      }
    });

  return (
    <div className={`min-h-screen flex flex-col pb-16 transition-colors duration-300 ${
      darkMode ? 'bg-slate-950 text-slate-100' : 'bg-[#fcfcfd] text-slate-900'
    }`}>
      {/* Header Panel */}
      <header className={`border-b-2 sticky top-0 z-40 transition-colors ${
        darkMode ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-slate-800 text-slate-900'
      }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-none flex items-center justify-center border-2 relative shadow-[2px_2px_0px_rgba(0,0,0,0.15)] flex-shrink-0 ${
              darkMode ? 'bg-indigo-650 border-slate-700 text-white' : 'bg-indigo-600 border-slate-800 text-white'
            }`}>
              <div className={`absolute w-3.5 h-3.5 rotate-45 ${darkMode ? 'bg-slate-900' : 'bg-white'}`}></div>
              <span className={`relative font-extrabold text-[10px] tracking-widest z-10 ${darkMode ? 'text-indigo-400' : 'text-indigo-600'}`}>TL</span>
            </div>
            <div>
              <h1 className="text-sm font-extrabold tracking-wider leading-tight uppercase">{t('appName')}</h1>
              <p className="text-[10px] text-slate-400 font-extrabold tracking-widest uppercase">{t('appSubtitle')}</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Language Switcher Button EN/MY */}
            <button
              onClick={toggleLanguage}
              className={`p-2 px-3 border text-xs font-extrabold uppercase rounded-none transition-all cursor-pointer flex items-center gap-1 select-none ${
                darkMode 
                  ? 'border-slate-800 hover:bg-slate-800 text-indigo-400 hover:text-indigo-300 bg-slate-900/40' 
                  : 'border-slate-200 hover:bg-slate-50 text-indigo-600 hover:text-indigo-700'
              }`}
            >
              <span>🌐</span>
              <span className="font-mono">{lang === 'en' ? 'EN' : 'မြန်မာ'}</span>
            </button>

            {/* Dark Mode Icon Switch */}
            <button
              onClick={toggleDarkMode}
              className={`p-2.5 rounded-none border transition-all cursor-pointer select-none ${
                darkMode 
                  ? 'border-slate-800 text-amber-400 hover:bg-slate-800 hover:text-amber-300 bg-slate-900/40' 
                  : 'border-slate-200 text-slate-500 hover:bg-slate-50 hover:text-slate-900'
              }`}
              title={lang === 'my' ? 'နောက်ခံပုံစံပြောင်းရန်' : 'Toggle Dark Mode'}
            >
              {darkMode ? <Sun size={14} /> : <Moon size={14} />}
            </button>

            <button
              onClick={() => setAddModalOpen(true)}
              className={`px-4 py-2.5 font-bold text-xs rounded-none border transition-all flex items-center gap-1.5 cursor-pointer uppercase tracking-widest select-none ${
                darkMode 
                  ? 'bg-indigo-650 border-indigo-600 hover:bg-indigo-550 text-white' 
                  : 'bg-slate-900 border-slate-900 hover:bg-slate-800 text-white'
              }`}
              id="new-trade-entry-trigger"
            >
              <Plus size={13} />
              {t('recordTrade')}
            </button>

            <button
              onClick={handleClearJournal}
              title={t('resetData')}
              className={`p-2.5 border rounded-none transition-all cursor-pointer ${
                darkMode 
                  ? 'border-slate-800 text-slate-500 hover:text-rose-400 hover:bg-slate-800' 
                  : 'border-slate-200 text-slate-400 hover:text-red-500 hover:bg-slate-50'
              }`}
            >
              <Clock size={14} />
            </button>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full flex-1 space-y-6">
        
        {/* Navigation Tabs bar */}
        <div className={`flex justify-between items-center p-1 rounded-none border-2 w-fit ${
          darkMode ? 'bg-slate-900 border-slate-800' : 'bg-slate-100 border-slate-800'
        }`}>
          <button
            onClick={() => setActiveTab('dashboard')}
            className={`px-4 py-2 rounded-none text-[10px] uppercase tracking-widest font-extrabold transition-all flex items-center gap-1.5 cursor-pointer select-none ${
              activeTab === 'dashboard'
                ? 'bg-indigo-600 text-white shadow-sm'
                : darkMode 
                ? 'text-slate-400 hover:text-white'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <TrendingUp size={13} />
            {t('dashboard')}
          </button>
          <button
            onClick={() => setActiveTab('logs')}
            className={`px-4 py-2 rounded-none text-[10px] uppercase tracking-widest font-extrabold transition-all flex items-center gap-1.5 cursor-pointer select-none ${
              activeTab === 'logs'
                ? 'bg-indigo-600 text-white shadow-sm'
                : darkMode
                ? 'text-slate-400 hover:text-white'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <BookOpen size={13} />
            {t('logsLedger')} ({trades.length})
          </button>
        </div>

        {/* Dashboard Tab Content */}
        {activeTab === 'dashboard' && (
          <div className="space-y-6" id="dashboard-tab-content">
            
            {/* Quick Metrics Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <MetricCard
                title={t('cumulativeNetProfit')}
                value={`${stats.totalPl >= 0 ? '+' : ''}${stats.totalPl.toLocaleString()} USD`}
                subtext={t('feesDeducted')}
                icon={<DollarSign size={20} />}
                trend={{
                  type: stats.totalPl > 0 ? 'positive' : stats.totalPl < 0 ? 'negative' : 'neutral',
                  text: stats.totalPl >= 0 ? (lang === 'my' ? 'အမြတ်' : 'Profit') : (lang === 'my' ? 'အရှုံး' : 'Deficit'),
                }}
                darkMode={darkMode}
              />
              <MetricCard
                title={t('strategyWinRate')}
                value={`${stats.winRate}%`}
                subtext={t('winsCountText', { wins: trades.filter(t => t.status === 'Win').length, total: stats.totalTrades })}
                icon={<Percent size={20} />}
                trend={{
                  type: stats.winRate >= 50 ? 'positive' : 'negative',
                  text: stats.winRate >= 50 ? t('healthy') : t('subOptimal'),
                }}
                darkMode={darkMode}
              />
              <MetricCard
                title={t('profitFactor')}
                value={stats.profitFactor}
                subtext={t('profitFactorSub')}
                icon={<TrendingUp size={20} />}
                trend={{
                  type: stats.profitFactor >= 2.0 ? 'positive' : stats.profitFactor >= 1.0 ? 'neutral' : 'negative',
                  text: stats.profitFactor >= 1.5 ? (lang === 'my' ? 'အထူးကောင်းမွန်' : t('eliteRatio')) : (lang === 'my' ? 'မတည်ငြိမ်' : t('unstable')),
                }}
                darkMode={darkMode}
              />
              <MetricCard
                title={t('executionStats')}
                value={`${stats.longsCount}L / ${stats.shortsCount}S`}
                subtext={`${t('avgWin', { win: stats.avgWin })} | ${t('avgLoss', { loss: stats.avgLoss })}`}
                icon={<Layers size={20} />}
                darkMode={darkMode}
              />
            </div>

            {/* AI Insights & Performance Coach (Gemini) */}
            <AiInsights 
              trades={trades} 
              cachedAnalysis={cachedAnalysis} 
              onSaveAnalysis={handleSaveAnalysis} 
              lang={lang}
              t={t}
            />

            {/* Recharts Graphical Distribution */}
            <TradingCharts trades={trades} darkMode={darkMode} t={t} />
          </div>
        )}

        {/* Logs Tab Content */}
        {activeTab === 'logs' && (
          <div className={`border-2 rounded-none p-6 shadow-[4px_4px_0px_rgba(0,0,0,0.12)] space-y-6 ${
            darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-800'
          }`} id="logs-tab-content">
            
            {/* Advanced Filters Grid */}
            <div className={`p-4 border-2 rounded-none space-y-4 ${
              darkMode ? 'bg-slate-950 border-slate-800' : 'bg-slate-50 border-slate-800'
            }`}>
              <div className={`flex items-center gap-2 pb-3 border-b ${
                darkMode ? 'border-slate-850' : 'border-slate-205'
              }`}>
                <Filter size={14} className="text-slate-505" />
                <span className="text-[10px] font-extrabold uppercase tracking-widest">{t('advancedFilters')}</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
                {/* Text search */}
                <div className="relative">
                  <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                  <input
                    type="text"
                    placeholder={t('searchPlaceholder')}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className={`w-full pl-8 pr-3 py-2 border rounded-none focus:outline-none focus:border-indigo-505 text-xs font-semibold font-mono ${
                      darkMode 
                        ? 'bg-slate-900 border-slate-700 text-slate-100 placeholder-slate-500' 
                        : 'bg-white border-slate-300 text-slate-800 placeholder-slate-400'
                    }`}
                  />
                </div>

                {/* Direction filter */}
                <select
                  value={filterDirection}
                  onChange={(e) => setFilterDirection(e.target.value as any)}
                  className={`px-3 py-2 border rounded-none focus:outline-none focus:border-indigo-505 text-xs font-semibold ${
                    darkMode 
                      ? 'bg-slate-900 border-slate-700 text-slate-100Custom' 
                      : 'bg-white border-slate-300 text-slate-800'
                  }`}
                  style={darkMode ? { backgroundColor: '#0f172a', color: '#f8fafc' } : {}}
                >
                  <option value="all">{t('dirAll')}</option>
                  <option value="Long">{t('longPositions')}</option>
                  <option value="Short">{t('shortPositions')}</option>
                </select>

                {/* Status win/loss */}
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value as any)}
                  className={`px-3 py-2 border rounded-none focus:outline-none focus:border-indigo-505 text-xs font-semibold ${
                    darkMode 
                      ? 'bg-slate-900 border-slate-700 text-slate-100' 
                      : 'bg-white border-slate-300 text-slate-800'
                  }`}
                  style={darkMode ? { backgroundColor: '#0f172a', color: '#f8fafc' } : {}}
                >
                  <option value="all">{t('outcomeAll')}</option>
                  <option value="Win">{t('winsOnly')}</option>
                  <option value="Loss">{t('lossesOnly')}</option>
                  <option value="Breakeven">{t('breakevenOnly')}</option>
                </select>

                {/* Strategy dropdown */}
                <select
                  value={filterSetup}
                  onChange={(e) => setFilterSetup(e.target.value)}
                  className={`px-3 py-2 border rounded-none focus:outline-none focus:border-indigo-550 text-xs font-semibold ${
                    darkMode 
                      ? 'bg-slate-900 border-slate-700 text-slate-100' 
                      : 'bg-white border-slate-300 text-slate-800'
                  }`}
                  style={darkMode ? { backgroundColor: '#0f172a', color: '#f8fafc' } : {}}
                >
                  <option value="all">{t('strategyAll')}</option>
                  {uniqueSetups.map((setup) => (
                    <option key={setup} value={setup}>{setup}</option>
                  ))}
                </select>

                {/* Psychology tag */}
                <select
                  value={filterMindset}
                  onChange={(e) => setFilterMindset(e.target.value)}
                  className={`px-3 py-2 border rounded-none focus:outline-none focus:border-indigo-550 text-xs font-semibold ${
                    darkMode 
                      ? 'bg-slate-900 border-slate-700 text-slate-100' 
                      : 'bg-white border-slate-300 text-slate-800'
                  }`}
                  style={darkMode ? { backgroundColor: '#0f172a', color: '#f8fafc' } : {}}
                >
                  <option value="all">{t('psychologyAll')}</option>
                  {uniqueMindsets.map((tag) => (
                    <option key={tag} value={tag}>{tag}</option>
                  ))}
                </select>
              </div>

              {/* Sorting and result counter bar */}
              <div className={`flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2 text-xs border-t ${
                darkMode ? 'border-slate-850' : 'border-slate-200'
              }`}>
                <span className="text-slate-400 font-extrabold font-mono text-[10px] uppercase tracking-wider">
                  {t('matchedLogs', { count: filteredAndSortedTrades.length, total: trades.length })}
                </span>

                <div className="flex items-center gap-2">
                  <span className="text-slate-450 font-extrabold uppercase tracking-widest text-[9px]">{t('sortBy')}</span>
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value as any)}
                    className={`px-3 py-1 border rounded-none text-xs font-bold focus:outline-none focus:border-indigo-550 ${
                      darkMode 
                        ? 'bg-slate-900 border-slate-700 text-slate-200' 
                        : 'bg-white border-slate-300 text-slate-700'
                    }`}
                    style={darkMode ? { backgroundColor: '#0f172a', color: '#f8fafc' } : {}}
                  >
                    <option value="date_desc">{t('newestFirst')}</option>
                    <option value="date_asc">{t('oldestFirst')}</option>
                    <option value="pl_desc">{t('maxProfit')}</option>
                    <option value="pl_asc">{t('maxLoss')}</option>
                  </select>
                </div>
              </div>
            </div>

            {/* List Table Ledger */}
            {filteredAndSortedTrades.length > 0 ? (
              <div className={`overflow-x-auto border-2 rounded-none shadow-[2px_2px_0px_rgba(0,0,0,0.05)] ${
                darkMode ? 'border-slate-870 bg-slate-950' : 'border-slate-800 bg-white'
              }`}>
                <table className="w-full text-left border-collapse min-w-[700px]">
                  <thead>
                    <tr className={`border-b-2 text-[10px] font-extrabold uppercase tracking-widest ${
                      darkMode ? 'bg-slate-850 border-slate-800 text-slate-400' : 'bg-slate-100 border-slate-800 text-slate-500'
                    }`}>
                      <th className="py-4 px-4 font-extrabold">{t('tradeDate')}</th>
                      <th className="py-4 px-4 font-extrabold">{t('asset')}</th>
                      <th className="py-4 px-4 font-extrabold">{t('dir')}</th>
                      <th className="py-4 px-4 font-extrabold">{t('strategySetup')}</th>
                      <th className="py-4 px-4 text-right font-extrabold">{t('netPl')}</th>
                      <th className="py-4 px-2 font-extrabold">{t('psychologyChecklist')}</th>
                      <th className="py-4 px-4 text-center font-extrabold">{t('action')}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredAndSortedTrades.map((trade) => {
                      const isWin = trade.status === 'Win';
                      const isLoss = trade.status === 'Loss';
                      return (
                        <tr 
                          key={trade.id}
                          className={`border-b transition-all text-xs ${
                            darkMode 
                              ? 'border-slate-850 hover:bg-slate-850/50' 
                              : 'border-slate-200 hover:bg-slate-50/70'
                          }`}
                        >
                          <td className={`py-4 px-4 font-mono font-semibold ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                            {trade.date}
                          </td>
                          <td className={`py-4 px-4 font-extrabold tracking-wide uppercase font-mono ${
                            darkMode ? 'text-slate-100' : 'text-slate-900'
                          }`}>
                            {trade.symbol}
                          </td>
                          <td className="py-4 px-4 mt-0.5">
                            <span className={`px-2.5 py-0.5 rounded-none font-extrabold text-[9px] uppercase tracking-wider border ${
                              trade.direction === 'Long' 
                                ? 'bg-emerald-50 text-emerald-800 border-emerald-300 dark:bg-emerald-950/20 dark:text-emerald-400 dark:border-emerald-900' 
                                : 'bg-rose-50 text-rose-800 border-rose-300 dark:bg-rose-950/20 dark:text-rose-450 dark:border-rose-900'
                            }`}>
                              {trade.direction === 'Long' ? 'LONG' : 'SHORT'}
                            </span>
                          </td>
                          <td className={`py-4 px-4 font-bold ${darkMode ? 'text-slate-300' : 'text-slate-700'}`}>
                            {trade.setup}
                          </td>
                          <td className={`py-4 px-4 font-mono font-bold text-right text-sm ${
                            isWin ? 'text-emerald-550' : isLoss ? 'text-rose-550' : 'text-slate-400'
                          }`}>
                            {trade.profitLoss > 0 ? '+' : ''}{trade.profitLoss.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                          </td>
                          <td className="py-4 px-2">
                            <div className="flex flex-wrap gap-1">
                              {trade.mindset && trade.mindset.map((item) => (
                                <span 
                                  key={item} 
                                  className={`px-1.5 py-0.5 rounded-none text-[9px] font-bold uppercase tracking-wider border ${
                                    ['Disciplined', 'Patient', 'Calm'].includes(item)
                                      ? 'bg-emerald-50/50 border-emerald-300 text-emerald-850 dark:bg-emerald-950/20 dark:text-emerald-400 dark:border-emerald-800'
                                      : 'bg-rose-50/50 border-rose-300 text-rose-850 dark:bg-rose-950/20 dark:text-rose-400 dark:border-rose-805'
                                  }`}
                                >
                                  {item}
                                </span>
                              ))}
                            </div>
                          </td>
                          <td className="py-4 px-4 text-center">
                            <div className="flex items-center justify-center gap-2">
                              <button
                                onClick={() => setSelectedTrade(trade)}
                                className={`p-1 px-3 rounded-none font-extrabold tracking-widest text-[10px] transition-all flex items-center gap-1 cursor-pointer uppercase hover:translate-y-[-1px] active:translate-y-[1px] ${
                                  darkMode 
                                    ? 'bg-slate-800 border border-slate-705 text-slate-100 hover:bg-slate-700' 
                                    : 'bg-slate-900 border border-slate-900 text-white hover:bg-slate-805'
                                }`}
                              >
                                <Eye size={11} />
                                {t('viewBtn')}
                              </button>
                              <button
                                onClick={() => {
                                  const confirmMsg = lang === 'my' 
                                    ? 'ဤမှတ်တမ်းကို ဂျာနယ်မှ ဖျက်ပစ်ရန် သေချာပါသလား။' 
                                    : 'Are you sure you want to delete this trade?';
                                  if (confirm(confirmMsg)) {
                                    handleDeleteTrade(trade.id);
                                  }
                                }}
                                className={`p-1.5 rounded-none transition-all cursor-pointer border border-transparent ${
                                  darkMode 
                                    ? 'text-rose-455 hover:text-rose-350 hover:bg-rose-950/30 hover:border-slate-800' 
                                    : 'text-rose-600 hover:text-rose-800 hover:bg-rose-50 hover:border-slate-300'
                                }`}
                              >
                                <Trash2 size={13} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className={`py-16 text-center border-2 border-dashed rounded-none ${
                darkMode ? 'border-slate-800 bg-slate-950' : 'border-slate-300 bg-white'
              }`} id="empty-ledger-view">
                <BookOpen size={32} className="mx-auto text-slate-500" />
                <h4 className={`font-extrabold mt-4 text-xs uppercase tracking-widest ${
                  darkMode ? 'text-slate-300' : 'text-slate-900'
                }`}>{t('emptyMatched')}</h4>
                <p className="text-slate-500 font-mono text-[10px] mt-2 max-w-xs mx-auto">
                  {t('emptyMatchedSub')}
                </p>
              </div>
            )}
          </div>
        )}
      </main>

      {/* Add Trade Form Modal overlay */}
      {addModalOpen && (
        <AddTradeForm 
          onAddTrade={handleAddTrade} 
          onClose={() => setAddModalOpen(false)} 
          darkMode={darkMode}
          t={t}
        />
      )}

      {/* Detailed Slide-Over Modal Overlay */}
      {selectedTrade && (
        <TradeDetailsModal 
          trade={selectedTrade} 
          onClose={() => setSelectedTrade(null)} 
          onDelete={handleDeleteTrade}
          darkMode={darkMode}
          t={t}
          lang={lang}
        />
      )}
    </div>
  );
}
