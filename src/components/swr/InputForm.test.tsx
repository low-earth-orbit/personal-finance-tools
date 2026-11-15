import { describe, expect, it, vi } from "vitest";
import { screen } from "@testing-library/react";
import { renderWithMantine } from "@/test-utils";
import { DEFAULTS } from "@/utils/swr/presets";
import InputForm from "./InputForm";

describe("swr InputForm", () => {
  it("shows the VR fields at their defaults, with no dynamics preset selector", () => {
    renderWithMantine(
      <InputForm input={{ ...DEFAULTS }} errors={{}} onChange={vi.fn()} onReset={vi.fn()} />,
    );
    expect(screen.getByLabelText("Stock VR(10)")).toHaveValue("0.9");
    expect(screen.getByLabelText("Bond VR(10)")).toHaveValue("1.5");
    expect(screen.queryByRole("radio")).not.toBeInTheDocument();
  });
});
