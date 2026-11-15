import { describe, expect, it } from "vitest";
import { DEFAULTS, RETURN_PRESETS } from "./presets";

describe("retirement presets", () => {
  it("defaults to the 80/20 to 60/40 glide path", () => {
    const preset = RETURN_PRESETS.find((p) => p.id === "glide-path-80-20-to-60-40");
    expect(DEFAULTS.accumReturn).toBe(preset?.accumReturn);
    expect(DEFAULTS.retireReturn).toBe(preset?.retireReturn);
  });
});
