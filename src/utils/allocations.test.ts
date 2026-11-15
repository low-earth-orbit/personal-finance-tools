import { describe, expect, it } from "vitest";
import { ALLOCATIONS, blendAllocation } from "./allocations";

describe("blendAllocation", () => {
  it("returns the stock and bond assumptions at the endpoints", () => {
    expect(blendAllocation(100)).toEqual({ returnPct: 6.4, volatility: 12 });
    expect(blendAllocation(0)).toEqual({ returnPct: 3.8, volatility: 4.5 });
  });

  it("blends the mixes used by the presets", () => {
    expect(blendAllocation(80)).toEqual({ returnPct: 5.97, volatility: 9.91 });
    expect(blendAllocation(60)).toEqual({ returnPct: 5.5, volatility: 7.93 });
    expect(blendAllocation(40)).toEqual({ returnPct: 4.98, volatility: 6.17 });
  });

  it("falls steadily as the bond share rises", () => {
    const returns = Object.values(ALLOCATIONS).map((a) => a.returnPct);
    for (let i = 1; i < returns.length; i++) expect(returns[i]).toBeLessThan(returns[i - 1]);
  });
});
