export interface SymbolInput {
  symbol: string;
  name?: string;
  sector?: string;
}

export interface DailyPriceInput {
  symbol: string;
  date: Date;
  close: number;
  open?: number;
  high?: number;
  low?: number;
  volume?: number;
  value?: number;
}

export interface DailyPricePayload {
  prices: DailyPriceInput[];
  raw?: string;
  rawExtension?: "json" | "html" | "txt";
}

export interface Provider {
  name: string;
  fetchSymbols(): Promise<SymbolInput[]>;
  fetchDailyPricesForDate(date: Date): Promise<DailyPricePayload>;
}
