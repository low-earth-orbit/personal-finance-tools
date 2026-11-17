# personal-finance

A small collection of free, sensible personal finance calculators for Canadians.

[Latest deployed version](https://low-earth-orbit.github.io/personal-finance-tools/)

## Tools

| Tool | Route | Status |
| --- | --- | --- |
| **Rent vs Buy** — compare renting vs owning a home | `/rent-vs-buy` | Live |
| **When can I retire?** — quick retirement reality check | `/retirement` | Live |
| **Lifecycle Allocation** — change your stock share with age, or hold one mix? | `/glide-path` | New |
| **ACB Calculator** — adjusted cost base from a Wealthsimple activity export | `/acb` | Preview |
| **Where to invest: TFSA, RRSP or Non-Reg?** — split a lump sum across account types | `/allocator` | Preview |
| **Safe withdrawal rates** — first-year withdrawal rate (then indexed to inflation) by stock/bond mix and retirement length | `/swr` | New |
| **Expected stock returns** — long-run return for a global stock mix from yields, growth, CAPE, bond yields and history | `/expected-return` | Preview |

The site is a single statically-exported Next.js app: a hub landing page at `/` links to each tool, which lives at its own route.

The Safe withdrawal rates tool follows the 4% rule logic from the Trinity study: each cell is the first-year withdrawal as a % of the starting portfolio, raised with inflation every year after, at your chosen success rate (80–99%). You set stock and bond returns, volatilities and inflation. The years come from one of two return models: simulated, with your stock-bond correlation and each asset's 10-year variance ratio, VR(10), which sets mean reversion or persistence; or historical sequences, which replays runs of real years from 16 countries (1871–2020), rescaled to your returns and volatilities.

The Lifecycle Allocation tool is a research model. It searches for the stock allocation at each age, before and after retirement, that maximizes risk-adjusted retirement spending (CRRA utility), under either independent yearly returns or historical sequences. It compares that path with the best constant allocation and recommends the constant unless the path is clearly better (by more than 1% of certainty-equivalent income or 1 point of shortfall). Shortfall is reported both from the retirement date (drawdown only) and from today (full path).

## Disclaimer

An educational tool, **not financial advice**. Results are estimates from your assumptions, not predictions. Canada-specific and provided as-is — consult a professional before acting.

## Development

Built with Next.js (App Router), React 19 (with React Compiler), TypeScript, Mantine, Tailwind CSS and Recharts. Statically exported and deployed to GitHub Pages. Tested with Vitest + React Testing Library (unit/component) and Playwright (e2e/UI).

```bash
npm install
npm run dev        # dev server at http://localhost:3000
npm run build      # static export to ./out
npm run format     # Prettier
npm run lint       # ESLint
npm run typecheck  # tsc --noEmit
npm test           # Vitest unit + component tests
npm run test:e2e   # Playwright end-to-end tests
```

## Layout

```
src/
  app/
    page.tsx              # hub landing page (lists tools)
    rent-vs-buy/page.tsx  # rent-vs-buy tool route
    glide-path/page.tsx   # Lifecycle Allocation route
    allocator/page.tsx    # Where to invest: TFSA, RRSP or Non-Reg? route
    swr/page.tsx          # Safe withdrawal rates route
    expected-return/page.tsx # Expected stock returns route
  components/
    shared/               # reusable chrome + form primitives (Header, Footer, inputs)
    rent-vs-buy/          # rent-vs-buy-specific components
    glide-path/           # Lifecycle Allocation components
    allocator/            # Where to invest: TFSA, RRSP or Non-Reg? components
    swr/                  # Safe withdrawal rates components
    expected-return/      # Expected stock returns components
  utils/                  # math, formatting, Monte Carlo (shared) + tool-specific logic
  types.ts                # shared domain types
analysis/                 # Python research, validation, and recommender tools
docs/                     # calculator methodology notes, grouped by domain
```

Cross-folder imports use the `@/` path alias (`@/* → ./src/*`).

Research and methodology:

- [`analysis/README.md`](./analysis/README.md) — Python commands and folder ownership
- [`docs/README.md`](./docs/README.md) — methodology index
