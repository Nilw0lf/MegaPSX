export interface SymbolRecord {
  symbol: string;
  name?: string | null;
  sector?: string | null;
}

export interface DailyPriceRecord {
  id?: number;
  symbol: string;
  date: string;
  close: number;
  open?: number | null;
  high?: number | null;
  low?: number | null;
  volume?: number | null;
  value?: number | null;
}
