import { arithmeticToGeometric, geometricToArithmetic } from "@/utils/returns";

/**
 * Capital market assumptions behind the portfolio presets: nominal geometric (compound) return
 * and volatility per asset, and the stock-bond correlation.
 */
export const CMA = {
  stockReturn: 6.4,
  stockVol: 12,
  bondReturn: 3.8,
  bondVol: 5.5,
  correlation: 0.3,
} as const;

/**
 * Nominal geometric return and volatility (%, 2 decimals) of a yearly rebalanced stock/bond mix.
 * The arithmetic means blend linearly, the variance uses the correlation, and the blended
 * arithmetic mean is converted back to a geometric return.
 */
export function blendAllocation(equityPct: number): { returnPct: number; volatility: number } {
  const w = equityPct / 100;
  const stockVol = CMA.stockVol / 100;
  const bondVol = CMA.bondVol / 100;
  const arithmetic =
    w * geometricToArithmetic(CMA.stockReturn / 100, stockVol) +
    (1 - w) * geometricToArithmetic(CMA.bondReturn / 100, bondVol);
  const vol = Math.sqrt(
    (w * stockVol) ** 2 +
      ((1 - w) * bondVol) ** 2 +
      2 * CMA.correlation * w * (1 - w) * stockVol * bondVol,
  );
  const round2 = (x: number) => Math.round(x * 10000) / 100;
  return { returnPct: round2(arithmeticToGeometric(arithmetic, vol)), volatility: round2(vol) };
}

/**
 * Nominal geometric (compound) annual returns and volatility by stock/bond mix, blended from
 * `CMA`. Shared by tools so portfolio assumptions have one source of truth.
 */
export const ALLOCATIONS = {
  "100/0": blendAllocation(100),
  "90/10": blendAllocation(90),
  "80/20": blendAllocation(80),
  "70/30": blendAllocation(70),
  "60/40": blendAllocation(60),
  "50/50": blendAllocation(50),
  "40/60": blendAllocation(40),
  "30/70": blendAllocation(30),
  "20/80": blendAllocation(20),
  "10/90": blendAllocation(10),
  "0/100": blendAllocation(0),
} as const;

export type AllocationId = keyof typeof ALLOCATIONS;
