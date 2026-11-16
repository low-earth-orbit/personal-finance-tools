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
 * Nominal geometric return and volatility (fractions) of a yearly rebalanced stock/bond mix with
 * `w` in stocks. The arithmetic means blend linearly, the variance uses the correlation, and the
 * blended arithmetic mean is converted back to a geometric return.
 */
function mixFraction(w: number): { ret: number; vol: number } {
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
  return { ret: arithmeticToGeometric(arithmetic, vol), vol };
}

const round2 = (x: number) => Math.round(x * 10000) / 100;

/** Nominal geometric return and volatility (%, 2 decimals) of a yearly rebalanced stock/bond mix. */
export function blendAllocation(equityPct: number): { returnPct: number; volatility: number } {
  const { ret, vol } = mixFraction(equityPct / 100);
  return { returnPct: round2(ret), volatility: round2(vol) };
}

/**
 * Annual volatility (%) of the stock/bond mix whose nominal compound return is `returnPct`. The
 * mix's return rises with its equity share, so the share is found by bisection over 0-100% stock
 * (no leverage). A return below the all-bond return gets all-bond volatility; one above the
 * all-stock return gets all-stock volatility.
 */
export function volatilityForReturn(returnPct: number): number {
  const target = returnPct / 100;
  if (target <= mixFraction(0).ret) return mixFraction(0).vol * 100;
  if (target >= mixFraction(1).ret) return mixFraction(1).vol * 100;
  let lo = 0;
  let hi = 1;
  for (let i = 0; i < 60; i++) {
    const mid = (lo + hi) / 2;
    if (mixFraction(mid).ret < target) lo = mid;
    else hi = mid;
  }
  return mixFraction((lo + hi) / 2).vol * 100;
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
