export type DividendFrequency =
  | "One-time"
  | "Quarterly"
  | "Semiannual"
  | "Annual"
  | "Custom";

export interface DividendScenario {
  id: string;
  label: string;
  tickerOrName: string;
  shares: number;
  buyPrice: number;
  currentPrice: number;
  dividendPerShare: number;
  dividendFrequency: DividendFrequency;
  customDistributionsPerYear?: number;
  taxProfileId: string;
  currency: string;
  pinned?: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface SellScenario {
  id: string;
  label: string;
  tickerOrName: string;
  quantity: number;
  buyPrice: number;
  sellPrice: number;
  buyDate: string;
  sellDate: string;
  taxProfileId: string;
  feeProfileId: string;
  currency: string;
  pinned?: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CgtRule {
  id: string;
  label: string;
  minDays: number;
  maxDays: number | null;
  rate: number;
}

export interface TaxProfile {
  id: string;
  name: string;
  dividendWithholdingRate: number;
  cgtRules: CgtRule[];
  createdAt: string;
  updatedAt: string;
}

export type FeeApplyOn = "buy" | "sell" | "both";
export type FeeType = "percent_of_trade_value" | "fixed";

export interface FeeItem {
  id: string;
  label: string;
  type: FeeType;
  value: number;
  applyOn: FeeApplyOn;
  notes?: string;
}

export interface FeeProfile {
  id: string;
  name: string;
  fees: FeeItem[];
  createdAt: string;
  updatedAt: string;
}
