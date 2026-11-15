import { describe, expect, it } from "vitest";
import { ALLOCATIONS, blendAllocation } from "./allocations";

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
