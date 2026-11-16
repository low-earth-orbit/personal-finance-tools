import { describe, expect, it } from "vitest";
import { ALLOCATIONS, blendAllocation, volatilityForReturn } from "./allocations";

describe("blendAllocation", () => {
  it("returns the stock and bond assumptions at the endpoints", () => {
    expect(blendAllocation(100)).toEqual({ returnPct: 6.4, volatility: 12 });
    expect(blendAllocation(0)).toEqual({ returnPct: 3.8, volatility: 5.5 });
  });

  it("blends the mixes used by the presets", () => {
    expect(blendAllocation(80)).toEqual({ returnPct: 5.98, volatility: 9.99 });
    expect(blendAllocation(60)).toEqual({ returnPct: 5.51, volatility: 8.14 });
    expect(blendAllocation(40)).toEqual({ returnPct: 4.99, volatility: 6.59 });
  });

  it("falls steadily as the bond share rises", () => {
    const returns = Object.values(ALLOCATIONS).map((a) => a.returnPct);
    for (let i = 1; i < returns.length; i++) expect(returns[i]).toBeLessThan(returns[i - 1]);
  });
});

describe("volatilityForReturn", () => {
  it("returns the volatility of the mix that compounds at the entered return", () => {
    // 80/20 compounds at ~5.98% with ~9.99% vol, so a 5.98% input should map to that vol.
    expect(volatilityForReturn(5.98)).toBeCloseTo(9.99, 1);
    expect(volatilityForReturn(6.4)).toBeCloseTo(12, 6);
    expect(volatilityForReturn(3.8)).toBeCloseTo(5.5, 6);
  });

  it("rises with the expected return", () => {
    const vols = [4, 4.5, 5, 5.5, 6, 6.2].map(volatilityForReturn);
    for (let i = 1; i < vols.length; i++) expect(vols[i]).toBeGreaterThan(vols[i - 1]);
  });

  it("clamps to the all-bond and all-stock volatilities outside the CMA range", () => {
    expect(volatilityForReturn(0)).toBeCloseTo(5.5, 6);
    expect(volatilityForReturn(10)).toBeCloseTo(12, 6);
  });
});
