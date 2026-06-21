export interface Trade {
  id: string;
  symbol: string;
  date: string;
  direction: 'Long' | 'Short';
  entryPrice: number;
  exitPrice: number;
  quantity: number;
  setup: string;
  notes: string;
  stopLoss?: number;
  takeProfit?: number;
  fees?: number;
  mindset: string[]; // e.g. ['Calm', 'Disciplined', 'FOMO', 'Impulsive']
  profitLoss: number; // calculated automatically as status * (exit - entry) * quantity - fees
  status: 'Win' | 'Loss' | 'Breakeven';
}

export interface TradingStats {
  totalTrades: number;
  winRate: number;
  totalPl: number;
  profitFactor: number;
  avgWin: number;
  avgLoss: number;
  longsCount: number;
  shortsCount: number;
}
