import { describe, expect, it } from "vitest";
import { buildEquityAxis, buildGlidePathChartData } from "./GlidePathChart";

describe("buildEquityAxis", () => {
  it("keeps 100% as the minimum axis ceiling", () => {
    expect(buildEquityAxis(80)).toEqual({
      yMax: 100,
      ticks: [0, 20, 40, 60, 80, 100],
    });
  });

  it.each([
    [100, [0, 20, 40, 60, 80, 100]],
    [125, [0, 20, 40, 60, 80, 100, 120, 125]],
    [118, [0, 20, 40, 60, 80, 100, 118]],
  ])("ends exactly at a %s%% equity cap", (maxEquityPct, expectedTicks) => {
    expect(buildEquityAxis(maxEquityPct)).toEqual({
      yMax: maxEquityPct,
      ticks: expectedTicks,
    });
  });
});

describe("buildGlidePathChartData", () => {
  it("extends the final holding period to the planning-age boundary", () => {
    const data = buildGlidePathChartData(
      { startAge: 35, planningAge: 95 },
      {
        equityByYear: Array.from({ length: 60 }, () => 0.6),
        params: { accumYears: 30 },
      },
    );

    expect(data).toHaveLength(61);
    expect(data.at(-2)).toMatchObject({ age: 94, equity: 60 });
    expect(data.at(-1)).toEqual({ age: 95, equity: 60, phase: "retire" });
  });
});
