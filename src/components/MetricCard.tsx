import React from 'react';

interface MetricCardProps {
  title: string;
  value: string | number;
  subtext?: string;
  icon: React.ReactNode;
  trend?: {
    type: 'positive' | 'negative' | 'neutral';
    text: string;
  };
  darkMode?: boolean;
}

export default function MetricCard({ title, value, subtext, icon, trend, darkMode }: MetricCardProps) {
  const getTrendStyles = () => {
    if (!trend) return '';
    if (darkMode) {
      switch (trend.type) {
        case 'positive':
          return 'bg-emerald-950/40 text-emerald-450 border-emerald-900';
        case 'negative':
          return 'bg-rose-950/40 text-rose-450 border-rose-900';
        default:
          return 'bg-slate-800 text-slate-400 border-slate-700';
      }
    } else {
      switch (trend.type) {
        case 'positive':
          return 'bg-emerald-50 text-emerald-700 border-emerald-200';
        case 'negative':
          return 'bg-rose-50 text-rose-700 border-rose-200';
        default:
          return 'bg-slate-105 text-slate-700 border-slate-200';
      }
    }
  };

  const isPositiveValue = typeof value === 'string' && value.includes('+');
  const isNegativeValue = typeof value === 'string' && value.includes('-');

  return (
    <div 
      className={`border p-6 transition-all flex flex-col justify-between rounded-none ${
        darkMode 
          ? 'bg-slate-900 border-slate-800 hover:border-slate-750 shadow-none' 
          : 'bg-white border-slate-200 hover:border-slate-400 shadow-[2px_2px_0px_rgba(0,0,0,0.05)]'
      }`} 
      id={`metric-card-${title.toLowerCase().replace(/[^a-z0-9]/g, '-')}`}
    >
      <div className="flex justify-between items-start">
        <div>
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">{title}</span>
          <h2 className={`text-2xl font-mono font-bold mt-2 tracking-tight ${
            isPositiveValue ? 'text-emerald-550' : isNegativeValue ? 'text-rose-550' : (darkMode ? 'text-slate-100' : 'text-slate-900')
          }`}>{value}</h2>
        </div>
        <div className={`p-2.5 border rounded-none ${
          darkMode ? 'bg-slate-850 border-slate-705 text-indigo-400' : 'bg-slate-50 border-slate-200 text-slate-500'
        }`}>
          {icon}
        </div>
      </div>
      
      {/* Dynamic graphic indicator bar typical of Geometric Balance layout */}
      <div className={`mt-4 h-1.5 w-full ${darkMode ? 'bg-slate-800' : 'bg-slate-100'} relative`}>
        <div className={`h-full opacity-90 transition-all duration-500 ${
          isPositiveValue || (trend && trend.type === 'positive')
            ? 'bg-emerald-550 w-3/4' 
            : isNegativeValue || (trend && trend.type === 'negative')
            ? 'bg-rose-550 w-1/3' 
            : 'bg-indigo-650 w-1/2'
        }`}></div>
      </div>

      {(subtext || trend) && (
        <div className={`flex items-center justify-between mt-4 pt-3 border-t text-[11px] ${
          darkMode ? 'border-slate-800' : 'border-slate-100'
        }`}>
          <span className="text-slate-400 font-medium tracking-tight">{subtext}</span>
          {trend && (
            <span className={`px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider border rounded-none ${getTrendStyles()}`}>
              {trend.text}
            </span>
          )}
        </div>
      )}
    </div>
  );
}
