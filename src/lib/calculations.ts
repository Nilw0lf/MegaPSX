import type {
  DividendFrequency,
  FeeProfile,
  SellScenario,
  TaxProfile
} from "@/types/models";

export const frequencyToDistributions = (
  frequency: DividendFrequency,
  custom?: number
) => {
  switch (frequency) {
    case "One-time":
      return 1;
    case "Quarterly":
      return 4;
    case "Semiannual":
      return 2;
    case "Annual":
      return 1;
    case "Custom":
      return custom && custom > 0 ? custom : 1;
    default:
      return 1;
  }
};

export const calcDividend = (input: {
  shares: number;
  buyPrice: number;
  currentPrice: number;
  dividendPerShare: number;
  frequency: DividendFrequency;
  customDistributionsPerYear?: number;
  withholdingRate: number;
}) => {
  const distributions = frequencyToDistributions(
    input.frequency,
    input.customDistributionsPerYear
  );
  const grossPerDistribution = input.shares * input.dividendPerShare;
  const netPerDistribution = grossPerDistribution * (1 - input.withholdingRate / 100);
  const annualGross = grossPerDistribution * distributions;
  const annualNet = netPerDistribution * distributions;
  const costBasis = input.shares * input.buyPrice;
  const currentValue = input.shares * input.currentPrice;
  return {
    distributions,
    grossPerDistribution,
    netPerDistribution,
    annualGross,
    annualNet,
    netYieldOnCost: costBasis > 0 ? (annualNet / costBasis) * 100 : 0,
    netYieldOnCurrent: currentValue > 0 ? (annualNet / currentValue) * 100 : 0
  };
};

export const daysBetween = (start: string, end: string) => {
  if (!start || !end) return 0;
  const startDate = new Date(start);
  const endDate = new Date(end);
  const diff = endDate.getTime() - startDate.getTime();
  return Math.max(Math.floor(diff / (1000 * 60 * 60 * 24)), 0);
};

export const findCgtRate = (taxProfile: TaxProfile, holdingDays: number) => {
  const match = taxProfile.cgtRules.find((rule) => {
    const aboveMin = holdingDays >= rule.minDays;
    const belowMax = rule.maxDays === null ? true : holdingDays <= rule.maxDays;
    return aboveMin && belowMax;
  });
  return match ? match.rate : 0;
};

export const calculateFees = (
  feeProfile: FeeProfile | undefined,
  tradeValue: number,
  applyOn: "buy" | "sell"
) => {
  if (!feeProfile) return 0;
  return feeProfile.fees.reduce((sum, fee) => {
    const applies = fee.applyOn === applyOn || fee.applyOn === "both";
    if (!applies) return sum;
    if (fee.type === "percent_of_trade_value") {
      return sum + tradeValue * (fee.value / 100);
    }
    return sum + fee.value;
  }, 0);
};

export const calcSell = (
  scenario: SellScenario,
  taxProfile?: TaxProfile,
  feeProfile?: FeeProfile,
  cgtRateOverride?: number
) => {
  const tradeValue = scenario.quantity * scenario.sellPrice;
  const costBasis = scenario.quantity * scenario.buyPrice;
  const grossPL = tradeValue - costBasis;
  const holdingDays = daysBetween(scenario.buyDate, scenario.sellDate);
  const derivedRate = taxProfile ? findCgtRate(taxProfile, holdingDays) : 0;
  const cgtRate = typeof cgtRateOverride === "number" ? cgtRateOverride : derivedRate;
  const taxableGain = Math.max(grossPL, 0);
  const cgt = taxableGain * (cgtRate / 100);
  const sellFees = calculateFees(feeProfile, tradeValue, "sell");
  const buyFees = calculateFees(feeProfile, costBasis, "buy");
  const totalFees = sellFees + buyFees;
  const netPL = grossPL - totalFees - cgt;
  const netReturn = costBasis > 0 ? (netPL / costBasis) * 100 : 0;
  const feeDrag = tradeValue > 0 ? (totalFees / tradeValue) * 100 : 0;
  return {
    tradeValue,
    costBasis,
    grossPL,
    holdingDays,
    cgtRate,
    cgt,
    totalFees,
    netPL,
    netReturn,
    feeDrag
  };
};

export const findBreakEvenPrice = (
  scenario: SellScenario,
  taxProfile?: TaxProfile,
  feeProfile?: FeeProfile,
  cgtRateOverride?: number
) => {
  let low = scenario.buyPrice * 0.5;
  let high = scenario.buyPrice * 3;
  let mid = scenario.sellPrice;
  for (let i = 0; i < 40; i += 1) {
    mid = (low + high) / 2;
    const testScenario = { ...scenario, sellPrice: mid };
    const { netPL } = calcSell(testScenario, taxProfile, feeProfile, cgtRateOverride);
    if (netPL > 0) {
      high = mid;
    } else {
      low = mid;
    }
  }
  return mid;
};
