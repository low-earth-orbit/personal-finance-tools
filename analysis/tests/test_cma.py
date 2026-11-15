"""The Python stock/bond blend must match the app's ``ALLOCATIONS`` (src/utils/allocations.ts)."""

import re
import unittest
from pathlib import Path

from analysis.shared import cma
from analysis.shared.cma import CMA_CURVE, blend_allocation

ALLOCATIONS_TS = Path(__file__).resolve().parents[2] / "src" / "utils" / "allocations.ts"


class CmaBlendTests(unittest.TestCase):
    def test_assumptions_match_the_app(self):
        """``CMA`` in allocations.ts is the source of truth; this copy must not drift from it."""
        block = re.search(r"export const CMA = \{(.*?)\} as const", ALLOCATIONS_TS.read_text(), re.S)
        self.assertIsNotNone(block, "CMA block not found in allocations.ts")
        app = {k: float(v) for k, v in re.findall(r"(\w+):\s*([\d.]+)", block.group(1))}
        self.assertEqual(app, {
            "stockReturn": cma.CMA_STOCK_RETURN, "stockVol": cma.CMA_STOCK_VOL,
            "bondReturn": cma.CMA_BOND_RETURN, "bondVol": cma.CMA_BOND_VOL,
            "correlation": cma.CMA_CORRELATION,
        })

    # nominal geometric return %, volatility % by equity weight, as published by the web app
    APP = {
        1.0: (6.40, 12.00), 0.9: (6.19, 10.98), 0.8: (5.98, 9.99), 0.7: (5.75, 9.03),
        0.6: (5.51, 8.14), 0.5: (5.25, 7.31), 0.4: (4.99, 6.59), 0.3: (4.71, 6.01),
        0.2: (4.42, 5.61), 0.1: (4.12, 5.43), 0.0: (3.80, 5.50),
    }

    def test_blend_matches_app_allocations(self):
        for w, (ret, vol) in self.APP.items():
            got = blend_allocation(w)
            self.assertAlmostEqual(got[0], ret, places=2, msg=f"return at w={w}")
            self.assertAlmostEqual(got[1], vol, places=2, msg=f"vol at w={w}")

    def test_curve_lists_every_tenth_from_all_equity(self):
        self.assertEqual([round(w, 1) for w, _, _ in CMA_CURVE], [x / 10 for x in range(10, -1, -1)])
        for w, ret, vol in CMA_CURVE:
            self.assertEqual((ret, vol), blend_allocation(w))


if __name__ == "__main__":
    unittest.main()
