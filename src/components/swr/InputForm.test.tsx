import { describe, expect, it, vi } from "vitest";
import { fireEvent, screen } from "@testing-library/react";
import { renderWithMantine } from "@/test-utils";
import { DEFAULTS } from "@/utils/swr/presets";
import InputForm from "./InputForm";

describe("swr InputForm", () => {
  it("shows the simulated model with its VR fields at their defaults", () => {
    renderWithMantine(
      <InputForm
        input={{ ...DEFAULTS }}
        returnModel="simulated"
        errors={{}}
        onChange={vi.fn()}
        onReturnModelChange={vi.fn()}
        onReset={vi.fn()}
      />,
    );
    expect(screen.getByLabelText("Stock VR(10)")).toHaveValue("0.9");
    expect(screen.getByLabelText("Bond VR(10)")).toHaveValue("1.5");
    // Inputs carry their field key as id.
    expect(document.getElementById("correlation")).toBeInTheDocument();
    expect(screen.getByRole("radio", { name: "Simulated" })).toBeChecked();
  });

  it("switches the return model", () => {
    const onReturnModelChange = vi.fn();
    renderWithMantine(
      <InputForm
        input={{ ...DEFAULTS }}
        returnModel="simulated"
        errors={{}}
        onChange={vi.fn()}
        onReturnModelChange={onReturnModelChange}
        onReset={vi.fn()}
      />,
    );
    fireEvent.click(screen.getByRole("radio", { name: "Historical sequences" }));
    expect(onReturnModelChange).toHaveBeenCalledWith("historical");
  });

  it("replaces the correlation and VR fields with history's figures in historical mode", () => {
    renderWithMantine(
      <InputForm
        input={{ ...DEFAULTS }}
        returnModel="historical"
        errors={{}}
        onChange={vi.fn()}
        onReturnModelChange={vi.fn()}
        onReset={vi.fn()}
      />,
    );
    expect(screen.queryByLabelText("Stock VR(10)")).not.toBeInTheDocument();
    expect(screen.queryByLabelText("Bond VR(10)")).not.toBeInTheDocument();
    expect(document.getElementById("correlation")).not.toBeInTheDocument();
    expect(screen.getByText(/correlation \(0\.29\)/)).toHaveTextContent(
      "VR(10): 0.91 stocks, 2.66 bonds",
    );
    expect(document.getElementById("stockReturn")).toBeInTheDocument();
  });
});
