const getBaseUrl = () => {
  if (typeof import.meta !== "undefined" && (import.meta as any).env?.VITE_API_BASE) {
    return (import.meta as any).env.VITE_API_BASE as string;
  }
  if (typeof process !== "undefined" && process.env.NEXT_PUBLIC_API_BASE) {
    return process.env.NEXT_PUBLIC_API_BASE as string;
  }
  return "http://localhost:8787";
};

const API_BASE = getBaseUrl();

export const searchSymbols = async (q?: string) => {
  const url = new URL("/api/symbols", API_BASE);
  if (q) url.searchParams.set("q", q);
  const response = await fetch(url.toString());
  if (!response.ok) {
    throw new Error("Failed to fetch symbols");
  }
  return response.json();
};

export const getQuote = async (symbol: string) => {
  const response = await fetch(`${API_BASE}/api/quote/${symbol}`);
  if (!response.ok) {
    const body = await response.json().catch(() => ({}));
    throw new Error(body.message || "Quote not found");
  }
  return response.json();
};

export const getHistory = async (symbol: string, from?: string, to?: string) => {
  const url = new URL(`/api/history/${symbol}`, API_BASE);
  if (from) url.searchParams.set("from", from);
  if (to) url.searchParams.set("to", to);
  const response = await fetch(url.toString());
  if (!response.ok) {
    throw new Error("Failed to fetch history");
  }
  return response.json();
};
