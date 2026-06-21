import React from 'react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  BarChart,
  Bar,
  Cell,
} from 'recharts';
import { Trade } from '../types';

interface TradingChartsProps {
  trades: Trade[];
  darkMode?: boolean;
  t: (key: any, vars?: any) => string;
}

export default function TradingCharts({ trades, darkMode, t }: TradingChartsProps) {
  if (trades.length === 0) {
    return (
      <div className={`border p-8 text-center rounded-none ${
        darkMode ? 'bg-slate-900 border-slate-800 text-slate-400' : 'bg-white border-slate-100 text-slate-400'
      }`} id="empty-charts-view">
        <p className="text-sm italic">{t('emptyJournalMessage')}</p>
      </div>
    );
  }

  // 1. Sort trades chronologically (ascending date) to compute cumulative P/L
  const sortedTrades = [...trades].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  let cumSum = 0;
  const cumulativeData = sortedTrades.map((t, index) => {
    cumSum += t.profitLoss;
    return {
      index: index + 1,
      date: t.date,
      displayDate: new Date(t.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
      Asset: t.symbol,
      'Net P/L': Number(cumSum.toFixed(2)),
      'Trade Result': Number(t.profitLoss.toFixed(2)),
    };
  });

  // 2. Setup (Strategy) Performance
  const setupStats: Record<string, { total: number; wins: number; lossPl: number; winPl: number }> = {};
  trades.forEach((t) => {
    const sName = t.setup || 'Unspecified';
    if (!setupStats[sName]) {
      setupStats[sName] = { total: 0, wins: 0, lossPl: 0, winPl: 0 };
    }
    setupStats[sName].total += 1;
    if (t.status === 'Win') setupStats[sName].wins += 1;
    if (t.profitLoss >= 0) {
      setupStats[sName].winPl += t.profitLoss;
    } else {
      setupStats[sName].lossPl += t.profitLoss;
    }
  });

  const setupChartData = Object.entries(setupStats).map(([name, stats]) => {
    const winRate = stats.total > 0 ? (stats.wins / stats.total) * 100 : 0;
    return {
      name,
      'Win Rate %': Number(winRate.toFixed(1)),
      'Net P/L ($)': Number((stats.winPl + stats.lossPl).toFixed(2)),
      Trades: stats.total,
    };
  });

  // 3. Psychology Performance
  const mindsetStats: Record<string, { total: number; wins: number; pl: number }> = {};
  trades.forEach((t) => {
    if (t.mindset && t.mindset.length > 0) {
      t.mindset.forEach((m) => {
        if (!mindsetStats[m]) {
          mindsetStats[m] = { total: 0, wins: 0, pl: 0 };
        }
        mindsetStats[m].total += 1;
        if (t.status === 'Win') mindsetStats[m].wins += 1;
        mindsetStats[m].pl += t.profitLoss;
      });
    }
  });

  const mindsetChartData = Object.entries(mindsetStats).map(([name, stats]) => {
    const winRate = stats.total > 0 ? (stats.wins / stats.total) * 100 : 0;
    return {
      name,
      'Win Rate %': Number(winRate.toFixed(1)),
      'Net P/L ($)': Number(stats.pl.toFixed(2)),
      Trades: stats.total,
    };
  });

  // Color mappings for Positive vs Negative mental tags
  const getMindsetColor = (name: string) => {
    const positiveMindsets = ['Disciplined', 'Patient', 'Calm'];
    return positiveMindsets.includes(name) ? '#10b981' : '#f43f5e';
  };

  return (
    <div className="space-y-8" id="trading-metrics-charts">
      {/* Cumulative Profit/Loss Line Chart */}
      <div className={`border p-6 rounded-none ${
        darkMode 
          ? 'bg-slate-900 border-slate-800 text-slate-100 shadow-none' 
          : 'bg-white border-slate-200 text-slate-800 shadow-[2px_2px_0px_rgba(0,0,0,0.05)]'
      }`}>
        <div className={`mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border-b pb-4 ${
          darkMode ? 'border-slate-850' : 'border-slate-100'
        }`}>
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">{t('equityPerformance')}</span>
            <h3 className={`text-md font-extrabold uppercase tracking-widest mt-1 ${darkMode ? 'text-slate-100' : 'text-slate-800'}`}>{t('portfolioGrowthCurve')}</h3>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-indigo-600"></div>
            <span className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">{t('cumulativePlIndicator')}</span>
          </div>
        </div>
        <div className="h-64 sm:h-80 w-full font-mono text-xs">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={cumulativeData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={darkMode ? '#334155' : '#e2e8f0'} />
              <XAxis 
                dataKey="displayDate" 
                tickLine={false} 
                stroke={darkMode ? '#64748b' : '#94a3b8'} 
                dy={10}
              />
              <YAxis 
                tickLine={false} 
                stroke={darkMode ? '#64748b' : '#94a3b8'} 
                dx={-10}
              />
              <Tooltip 
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const data = payload[0].payload;
                    return (
                      <div className={`border p-4 rounded-none shadow-[4px_4px_0px_rgba(0,0,0,0.08)] font-sans text-xs space-y-1.5 ${
                        darkMode ? 'bg-slate-950 border-slate-800 text-slate-200' : 'bg-white border-slate-300 text-slate-850'
                      }`}>
                        <p className={`font-bold uppercase tracking-wider text-[11px] ${darkMode ? 'text-indigo-400' : 'text-slate-800'}`}>{data.displayDate} ({data.Asset})</p>
                        <p className="text-slate-500">{t('tradeResultTooltipLabel')}: <span className={`font-semibold font-mono ${data['Trade Result'] >= 0 ? 'text-emerald-500' : 'text-rose-500'}`}>{data['Trade Result'] > 0 ? '+' : ''}{data['Trade Result']} USD</span></p>
                        <p className={`font-bold border-t pt-1.5 ${darkMode ? 'border-slate-800 text-slate-300' : 'border-slate-200 text-slate-800'}`}>{t('cumulativePlTooltipLabel')}: <span className={`font-mono ${data['Net P/L'] >= 0 ? 'text-emerald-500' : 'text-rose-500'}`}>{data['Net P/L'] > 0 ? '+' : ''}{data['Net P/L']} USD</span></p>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Line 
                type="monotone" 
                dataKey="Net P/L" 
                stroke="#4f46e5" 
                strokeWidth={3} 
                dot={{ r: 4, strokeWidth: 1, fill: '#4f46e5', stroke: darkMode ? '#0f172a' : '#ffffff' }} 
                activeDot={{ r: 6, strokeWidth: 0 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Grid of Strategy vs Psychology */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Setup Efficiency */}
        <div className={`border p-6 rounded-none ${
          darkMode 
            ? 'bg-slate-900 border-slate-800 text-slate-100 shadow-none' 
            : 'bg-white border-slate-200 text-slate-800 shadow-[2px_2px_0px_rgba(0,0,0,0.05)]'
        }`}>
          <div className={`mb-4 border-b pb-3 ${darkMode ? 'border-slate-850' : 'border-slate-100'}`}>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">{t('strategyOutcomes')}</span>
            <h3 className={`text-sm font-bold uppercase tracking-widest mt-0.5 ${darkMode ? 'text-slate-100' : 'text-slate-800'}`}>{t('setupWinRates')}</h3>
          </div>
          {setupChartData.length > 0 ? (
            <div className="h-64 w-full font-mono text-xs">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={setupChartData} layout="vertical" margin={{ top: 10, right: 10, left: 10, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke={darkMode ? '#334155' : '#e2e8f0'} />
                  <XAxis type="number" domain={[0, 100]} tickLine={false} stroke={darkMode ? '#64748b' : '#94a3b8'} />
                  <YAxis dataKey="name" type="category" width={80} tickLine={false} stroke={darkMode ? '#64748b' : '#94a3b8'} />
                  <Tooltip
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        const data = payload[0].payload;
                        return (
                          <div className={`border p-4 rounded-none shadow-[4px_4px_0px_rgba(0,0,0,0.08)] font-sans text-xs ${
                            darkMode ? 'bg-slate-950 border-slate-800 text-slate-200' : 'bg-white border-slate-300 text-slate-850'
                          }`}>
                            <p className="font-bold uppercase tracking-wider text-[11px] text-indigo-400">{data.name}</p>
                            <p className="text-slate-500 mt-1">Win Rate: <span className="font-bold font-mono">{data['Win Rate %']}%</span></p>
                            <p className="text-slate-500">Net Profit/Loss: <span className={`font-mono font-bold ${data['Net P/L ($)'] >= 0 ? 'text-emerald-550' : 'text-rose-550'}`}>{data['Net P/L ($)'] > 0 ? '+' : ''}{data['Net P/L ($)']} USD</span></p>
                            <p className="text-slate-400 text-[10px] mt-0.5">Total Trades: {data.Trades}</p>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Bar dataKey="Win Rate %" fill="#475569" radius={0}>
                    {setupChartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry['Win Rate %'] >= 50 ? '#10b981' : '#f43f5e'} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className={`h-64 flex items-center justify-center border border-dashed rounded-none ${
              darkMode ? 'bg-slate-950/45 border-slate-800' : 'bg-slate-50 border-slate-200'
            }`}>
              <span className="text-[10px] text-slate-400 uppercase tracking-wider font-bold">No setup distribution data available.</span>
            </div>
          )}
        </div>

        {/* Cognitive Mindset Influence */}
        <div className={`border p-6 rounded-none ${
          darkMode 
            ? 'bg-slate-900 border-slate-800 text-slate-100 shadow-none' 
            : 'bg-white border-slate-200 text-slate-800 shadow-[2px_2px_0px_rgba(0,0,0,0.05)]'
        }`}>
          <div className={`mb-4 border-b pb-3 ${darkMode ? 'border-slate-850' : 'border-slate-100'}`}>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">{t('cognitiveImpact')}</span>
            <h3 className={`text-sm font-bold uppercase tracking-widest mt-0.5 ${darkMode ? 'text-slate-100' : 'text-slate-800'}`}>{t('psychologicalReturns')}</h3>
          </div>
          {mindsetChartData.length > 0 ? (
            <div className="h-64 w-full font-mono text-xs">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={mindsetChartData} margin={{ top: 10, right: 10, left: -20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={darkMode ? '#334155' : '#e2e8f0'} />
                  <XAxis dataKey="name" tickLine={false} stroke={darkMode ? '#64748b' : '#94a3b8'} />
                  <YAxis tickLine={false} stroke={darkMode ? '#64748b' : '#94a3b8'} />
                  <Tooltip
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        const data = payload[0].payload;
                        return (
                          <div className={`border p-4 rounded-none shadow-[4px_4px_0px_rgba(0,0,0,0.08)] font-sans text-xs ${
                            darkMode ? 'bg-slate-950 border-slate-800 text-slate-200' : 'bg-white border-slate-300 text-slate-850'
                          }`}>
                            <p className="font-bold uppercase tracking-wider text-[11px] text-indigo-400">{data.name}</p>
                            <p className="text-slate-500 mt-1">Mental Setup Return: <span className={`font-mono font-bold ${data['Net P/L ($)'] >= 0 ? 'text-emerald-550' : 'text-rose-550'}`}>{data['Net P/L ($)'] > 0 ? '+' : ''}{data['Net P/L ($)']} USD</span></p>
                            <p className="text-slate-500">Associated Win Rate: <span className="font-bold font-mono">{data['Win Rate %']}%</span></p>
                            <p className="text-slate-400 text-[10px] mt-0.5">Sample size: {data.Trades} Trades</p>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Bar dataKey="Net P/L ($)" radius={0}>
                    {mindsetChartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={getMindsetColor(entry.name)} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className={`h-64 flex items-center justify-center border border-dashed rounded-none ${
              darkMode ? 'bg-slate-955 border-slate-800 text-slate-400' : 'bg-slate-50 border-slate-200 text-slate-400'
            }`}>
              <span className="text-[10px] uppercase tracking-wider font-bold">Record emotional states during logging to view feedback charts.</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
