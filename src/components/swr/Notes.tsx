import { Anchor, Text } from "@mantine/core";
import ToolNotes from "@/components/shared/ToolNotes";

const METHODOLOGY_URL =
  "https://github.com/low-earth-orbit/personal-finance-tools/blob/main/docs/swr/methodology.md";

/** Plain-language method, acknowledgement and caveats under the tool. */
const Notes = () => {
  return (
    <ToolNotes title="Assumptions" columns>
      <Text size="sm" pb="xs" c="dimmed">
        The safe withdrawal rate follows the logic of the 4% rule from the Trinity study: you
        withdraw a set percentage of the starting portfolio in year 1, then raise that dollar amount
        with inflation every year after, regardless of what the market does. Each cell is the
        highest first-year rate that still lasts the whole horizon in your chosen share of 10,000
        simulated markets. Because the amount is indexed to inflation, it is the same spending power
        in today&apos;s dollars every year. Stocks and bonds are simulated separately from the
        nominal compound returns, volatilities, correlation and inflation you set, and the portfolio
        is rebalanced every year. The same simulated markets feed every row, so rows change
        smoothly.
      </Text>
      <Text size="sm" pb="xs" c="dimmed">
        The variance ratio over 10 years, VR(10), measures memory: 1 means each year is drawn
        without memory, below 1 means a bad decade tends to be followed by recovery, above 1 means
        it tends to continue. Historical data across 16 countries over 150 years gives about 0.91
        for stocks and 2.66 for bonds. The default bond ratio of 1.5 is milder than that, which
        lifts the bond-heavy rows. The model uses a simple one-year memory. With the historical
        ratios, 60/40 closely matches a bootstrap of that history, while all-stock and all-bond rows
        come out about 0.1 to 0.2 points lower; see the{" "}
        <Anchor href={METHODOLOGY_URL} target="_blank" rel="noreferrer" c="dimmed">
          methodology notes
        </Anchor>
        .
      </Text>
    </ToolNotes>
  );
};

export default Notes;
