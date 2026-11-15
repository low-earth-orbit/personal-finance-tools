import { describe, expect, it } from "vitest";
import {
  SWR_ALLOCATIONS,
  computeSwrTable,
  generateAssetPaths,
  innovationCorrelation,
  phiFromVr,
  swrFromPaths,
  vrFromPhi,
} from "./engine";
import { DEFAULTS, SWR_HORIZONS } from "./presets";
import type { SwrInput } from "./types";

const input: SwrInput = { ...DEFAULTS };
const row = (label: string) => SWR_ALLOCATIONS.findIndex((a) => a.label === label);
const rate = (result: ReturnType<typeof computeSwrTable>, label: string, years: number) =>
  result.rates[row(label)][SWR_HORIZONS.indexOf(years as (typeof SWR_HORIZONS)[number])] * 100;

describe("VR <-> AR(1)", () => {
  it("maps VR 1 to phi 0 and round-trips other ratios", () => {
    expect(vrFromPhi(0)).toBe(1);
    expect(phiFromVr(1)).toBe(0);
    for (const vr of [0.6, 0.91, 1.5, 2.66]) {
      expect(vrFromPhi(phiFromVr(vr))).toBeCloseTo(vr, 8);
    }
  });

  it("reproduces the historical calibration", () => {
    expect(phiFromVr(0.91)).toBeCloseTo(-0.052, 2);
    expect(phiFromVr(2.66)).toBeCloseTo(0.51, 2);
  });

  it("clamps unreachable ratios to the phi limits", () => {
    expect(phiFromVr(0.0001)).toBe(-0.95);
    expect(phiFromVr(1000)).toBe(0.95);
  });
});

describe("innovation correlation", () => {
  it("equals the target correlation when both assets are independent", () => {
    const { value, clamped } = innovationCorrelation(0.48, 0, 0);
    expect(value).toBeCloseTo(0.48, 12);
    expect(clamped).toBe(false);
  });

  it("matches the history-calibrated figure", () => {
    expect(innovationCorrelation(0.48, phiFromVr(0.91), phiFromVr(2.66)).value).toBeCloseTo(
      0.574,
      2,
    );
  });

  it("clamps at +/-0.99 and flags it", () => {
    const high = innovationCorrelation(0.9, -0.9, 0.95);
    expect(high.value).toBe(0.99);
    expect(high.clamped).toBe(true);
    expect(innovationCorrelation(-0.9, -0.9, 0.95).value).toBe(-0.99);
  });
});

describe("computeSwrTable", () => {
  const table = computeSwrTable(input);
  const iid = computeSwrTable({ ...input, stockVr: 1, bondVr: 1 });

  it("has 11 allocations x 7 horizons", () => {
    expect(table.rates).toHaveLength(11);
    expect(table.rates.every((r) => r.length === SWR_HORIZONS.length)).toBe(true);
    expect(table.allocations[0].label).toBe("100/0");
    expect(table.allocations[10].label).toBe("0/100");
  });

  it("reproduces the documented rates at the defaults", () => {
    expect(table.phiStock).toBeLessThan(0);
    expect(table.phiBond).toBeGreaterThan(0);
    expect(Math.abs(rate(table, "60/40", 20) - 5.31)).toBeLessThan(0.1);
    expect(Math.abs(rate(table, "60/40", 30) - 3.92)).toBeLessThan(0.1);
    expect(Math.abs(rate(table, "60/40", 50) - 2.86)).toBeLessThan(0.1);
    expect(Math.abs(rate(table, "100/0", 30) - 3.85)).toBeLessThan(0.1);
    expect(Math.abs(rate(table, "0/100", 30) - 3.24)).toBeLessThan(0.1);
  });

  it("uses the VR inputs: bond persistence lowers the bond-heavy rows", () => {
    expect(iid.phiStock).toBe(0);
    expect(iid.phiBond).toBe(0);
    expect(rate(table, "0/100", 30)).toBeLessThan(rate(iid, "0/100", 30));
  });

  it("falls as the horizon lengthens", () => {
    for (const r of table.rates) {
      for (let i = 1; i < r.length; i++) expect(r[i]).toBeLessThanOrEqual(r[i - 1]);
    }
  });

  it("falls as the success rate rises", () => {
    const strict = computeSwrTable({ ...input, successRate: 99 });
    const loose = computeSwrTable({ ...input, successRate: 80 });
    expect(rate(strict, "60/40", 30)).toBeLessThan(rate(table, "60/40", 30));
    expect(rate(table, "60/40", 30)).toBeLessThan(rate(loose, "60/40", 30));
  });

  it("is identical for identical inputs", () => {
    expect(computeSwrTable(input).rates).toEqual(table.rates);
  });

  it("flags a clamped correlation", () => {
    const result = computeSwrTable(
      { ...input, correlation: 0.9, stockVr: 0.5, bondVr: 3 },
      {
        paths: 200,
      },
    );
    expect(result.correlationClamped).toBe(true);
    expect(table.correlationClamped).toBe(false);
  });

  it("matches a brute-force bisection simulation for one cell", () => {
    const paths = 2000;
    const years = 30;
    const successRate = input.successRate / 100;
    const assets = generateAssetPaths(input, paths, years);
    const equity = 0.6;

    function successShare(w: number): number {
      let ok = 0;
      for (let p = 0; p < paths; p++) {
        let balance = 1;
        let alive = true;
        for (let t = 0; t < years && alive; t++) {
          const r =
            equity * assets.stock[p * years + t] + (1 - equity) * assets.bond[p * years + t];
          balance = balance * (1 + r) - w * (1 + r / 2);
          if (balance <= 0) alive = false;
        }
        if (alive) ok++;
      }
      return ok / paths;
    }

    let lo = 0;
    let hi = 0.5;
    for (let i = 0; i < 50; i++) {
      const mid = (lo + hi) / 2;
      if (successShare(mid) >= successRate) lo = mid;
      else hi = mid;
    }

    const direct = swrFromPaths(assets, successRate, [years], [{ label: "60/40", equity }])[0][0];
    expect(direct).toBeCloseTo(lo, 3);
  });
});
