import { Anchor, SimpleGrid, Stack, Text, Title } from "@mantine/core";
import ToolNotes from "@/components/shared/ToolNotes";
import { CMA } from "@/utils/allocations";
import type { ReactNode } from "react";

function Point({ heading, children }: { heading: string; children: ReactNode }) {
  return (
    <Text size="sm" c="dimmed">
      <Text span fw={600} c="bright">
        {heading}
      </Text>{" "}
      {children}
    </Text>
  );
}

function Strong({ children }: { children: ReactNode }) {
  return (
    <Text span fw={600}>
      {children}
    </Text>
  );
}

/**
 * Static explainer rendered below the tool.
 *
 * Quotes and apostrophes are typed as typographic characters, not HTML entities: with an entity
 * in a text run, this toolchain drops the run's leading space after an inline element
 * ("<b>constant</b> equity" rendered as "constantequity").
 */
export default function Methodology() {
  return (
    <ToolNotes title="How this research model works">
      <Stack gap="lg">
        {/* Two columns on wide screens (how it works | what it finds) keep lines readable. */}
        <SimpleGrid cols={{ base: 1, md: 2 }} spacing={48} verticalSpacing="lg">
          <Stack gap="md">
            <Text size="sm" c="dimmed">
              Common allocation rules (“100 minus your age”, target-date funds) ignore your income
              target, risk tolerance and guaranteed income. This model derives an allocation from
              them instead.
            </Text>

            <Title order={3} fz="md">
              How it works
            </Title>
            <Text size="sm" c="dimmed">
              For each 5-year step, the optimizer picks the equity weight that maximizes the{" "}
              <Strong>expected utility of retirement spending</Strong> (CRRA): a dollar counts for
              more when you would otherwise fall short. <Strong>γ</Strong> sets how much you dislike
              uncertain spending, and <Strong>β</Strong> how much later years count. It maximizes
              welfare, not the success rate, and money left at the end has no value.
            </Text>
            <Text size="sm" c="dimmed">
              Returns come from our capital-market assumptions (stocks {CMA.stockReturn}% a year
              with {CMA.stockVol}% volatility, bonds {CMA.bondReturn}% with {CMA.bondVol}%, before
              inflation), and results are in today’s dollars. By default each year is drawn
              independently. Historical sequences instead replays runs of real years from 16
              countries, 1871–2020, rescaled to the same assumptions.
            </Text>

            <Title order={3} fz="md">
              Reading your result
            </Title>
            <Text size="sm" c="dimmed">
              <Strong>CE income</Strong> (certainty-equivalent income) is the steady yearly income
              that would feel as good as the uncertain plan. <Strong>Shortfall</Strong> is the share
              of simulated retirements with at least one year the portfolio cannot fund your target,
              counted from retirement (drawdown) and from today (full path).
            </Text>
            <Text size="sm" c="dimmed">
              The tool recommends the best single <Strong>constant</Strong> equity weight unless the
              optimized path beats it by more than 1% of CE income or 1 point of full-path
              shortfall. Smaller gaps are within the model’s noise, and one fixed mix is easier to
              hold.
            </Text>
          </Stack>

          <Stack gap="md">
            <Title order={3} fz="md">
              What the model finds
            </Title>
            <Point heading="The return model sets the equity level.">
              With independent returns, fixed spending builds a moderate “bond tent” near
              retirement. With historical sequences, the optimum is about 100% equity. Compare both.
            </Point>
            <Point heading="About 100% equity is a scenario, not the default.">
              It leans on pre-1990 history, markets that survived, and long nominal bonds as the
              only alternative, whose worst years came in the same wars and inflations that hit
              stocks.
            </Point>
            <Point heading="The level matters more than the shape.">
              Out of sample, the optimized path beats the best constant weight by about 1% of CE
              income or less.
            </Point>
            <Point heading="Funding sets the tent.">
              The more your savings exceed what your target needs, the more the optimizer protects
              the floor. If every allocation already meets your target, the plan is overfunded and
              the weight shown is the middle of a tie.
            </Point>
            <Point heading="Flexible spending holds about 100% equity.">
              Part of its higher CE income can be higher spending, so compare the year-1 portfolio
              draw shown with your result.
            </Point>
            <Point heading="Guaranteed income is your bond floor.">
              More CPP, OAS or pension income lets the portfolio take more risk. The tool needs at
              least $10,000 a year; with none, rare depleted years dominate the score.
            </Point>
          </Stack>
        </SimpleGrid>

        <Text size="sm" c="dimmed">
          Full methodology:{" "}
          <Anchor
            href="https://github.com/low-earth-orbit/personal-finance-tools/blob/main/docs/glide-path/methodology.md"
            target="_blank"
            rel="noopener noreferrer"
          >
            Lifecycle Allocation research note
          </Anchor>
          . Runs in your browser; nothing is sent anywhere. This is a research model for education,
          not financial advice or a recommendation for any portfolio.
        </Text>
      </Stack>
    </ToolNotes>
  );
}
