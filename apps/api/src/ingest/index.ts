import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { prisma } from "../lib/prisma";
import { mockProvider } from "./providers/mockProvider";
import { psxPortalProvider } from "./providers/psxPortalProvider";
import type { Provider } from "./providers/types";

const providerMap: Record<string, Provider> = {
  mock: mockProvider,
  psx: psxPortalProvider
};

const getProvider = () => {
  const key = (process.env.DATA_PROVIDER || "mock").toLowerCase();
  return providerMap[key] ?? mockProvider;
};

const getDates = (days: number) => {
  const today = new Date();
  return Array.from({ length: days }).map((_, index) => {
    const date = new Date(today);
    date.setDate(today.getDate() - (days - 1 - index));
    date.setHours(0, 0, 0, 0);
    return date;
  });
};

const upsertSymbols = async (symbols: Awaited<ReturnType<Provider["fetchSymbols"]>>) => {
  let count = 0;
  for (const symbol of symbols) {
    await prisma.symbol.upsert({
      where: { symbol: symbol.symbol },
      create: symbol,
      update: {
        name: symbol.name,
        sector: symbol.sector
      }
    });
    count += 1;
  }
  return count;
};

const upsertPrices = async (prices: Awaited<ReturnType<Provider["fetchDailyPricesForDate"]>>["prices"]) => {
  let count = 0;
  for (const price of prices) {
    await prisma.dailyPrice.upsert({
      where: {
        symbol_date: {
          symbol: price.symbol,
          date: price.date
        }
      },
      create: price,
      update: {
        close: price.close,
        open: price.open,
        high: price.high,
        low: price.low,
        volume: price.volume,
        value: price.value
      }
    });
    count += 1;
  }
  return count;
};

const persistRaw = async (date: Date, raw?: string, ext = "txt") => {
  if (!raw) return;
  const dir = path.resolve("apps/api/raw");
  await mkdir(dir, { recursive: true });
  const file = path.join(dir, `${date.toISOString().slice(0, 10)}.${ext}`);
  await writeFile(file, raw, "utf-8");
};

const run = async () => {
  const provider = getProvider();
  const symbols = await provider.fetchSymbols();
  const symbolCount = await upsertSymbols(symbols);

  const daysToIngest = provider.name === "mock" ? 60 : 1;
  const dates = getDates(daysToIngest);

  let priceCount = 0;
  for (const date of dates) {
    const payload = await provider.fetchDailyPricesForDate(date);
    priceCount += await upsertPrices(payload.prices);
    await persistRaw(date, payload.raw, payload.rawExtension ?? "txt");
  }

  console.log(`Provider: ${provider.name}`);
  console.log(`Symbols upserted: ${symbolCount}`);
  console.log(`Daily prices upserted: ${priceCount}`);
  console.log(`Dates processed: ${dates.length}`);
};

run()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
