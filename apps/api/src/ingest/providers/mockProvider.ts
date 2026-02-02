import type { DailyPricePayload, Provider, SymbolInput } from "./types";

const symbols: SymbolInput[] = [
  { symbol: "LUCK", name: "Lucky Cement", sector: "Cement" },
  { symbol: "MLCF", name: "Maple Leaf Cement", sector: "Cement" },
  { symbol: "SYS", name: "Systems Limited", sector: "Technology" }
];

const randomInRange = (min: number, max: number) =>
  Math.round((Math.random() * (max - min) + min) * 100) / 100;

const basePrices: Record<string, number> = {
  LUCK: 850,
  MLCF: 38,
  SYS: 420
};

export const mockProvider: Provider = {
  name: "mock",
  async fetchSymbols() {
    return symbols;
  },
  async fetchDailyPricesForDate(date) {
    const prices = symbols.map((item) => {
      const base = basePrices[item.symbol] ?? 100;
      const close = randomInRange(base * 0.95, base * 1.05);
      return {
        symbol: item.symbol,
        date,
        close,
        open: randomInRange(close * 0.98, close * 1.02),
        high: randomInRange(close * 1.0, close * 1.05),
        low: randomInRange(close * 0.95, close * 0.99),
        volume: randomInRange(100000, 900000),
        value: randomInRange(50_000_000, 250_000_000)
      };
    });
    return { prices, raw: JSON.stringify({ date, prices }, null, 2), rawExtension: "json" };
  }
};
