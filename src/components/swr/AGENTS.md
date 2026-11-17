# SWR Tool

Safe withdrawal rate table: stock/bond mix (rows) by horizon (columns), from user-set stock and bond return, volatility, correlation, inflation and success rate. Two return models: simulated (per-asset AR(1) from VR(10) inputs, the default) or historical sequences (JST block bootstrap rescaled to the inputs). Methodology: `docs/swr/methodology.md`.

## Files

- `Main.tsx` — state container, persists via `src/utils/swr/storage.ts` (`swr_input`, `swr_return_model`); runs `computeSwrTable` in `src/workers/swrWorker.ts` (150ms debounce, `requestId`, main-thread fallback when `Worker` is missing, e.g. jsdom)
- `SwrApp.tsx` — `"use client"` wrapper, lazy-loads Main (`ssr:false`)
- `InputForm.tsx` — capital market assumptions, success rate, return dynamics (return-model switch; stock and bond VR(10) inputs in simulated mode, history's figures in historical mode, where the correlation field is hidden too)
- `Result.tsx` — the table (sticky row labels, best rate per horizon in `--pf-accent`), clamp notice, footnote, `JumpToResult`
- `Notes.tsx` — method, VR caveat, historical sequences

## Engine (`src/utils/swr/`)

- `engine.ts` — `vrFromPhi`/`phiFromVr`, `innovationCorrelation`, `generateAssetPaths` (AR(1) paths, common random numbers), `generateHistoricalPaths` (block bootstrap from `src/utils/jst/`, affine-rescaled to the inputs), `swrFromPaths` (exact `(1−p)` quantile of `1/S_H`, no bisection), `computeSwrTable`
- `presets.ts` (defaults, `SWR_HORIZONS`, `HISTORY_DYNAMICS`), `validation.ts` (skips correlation/VR in historical mode), `storage.ts`, `types.ts`
