from __future__ import annotations

import json
from collections import defaultdict
from pathlib import Path

from backend.app.analysis import _extract_claims, _language_label


def main() -> int:
    cases_path = Path(__file__).with_name("cases.json")
    cases = json.loads(cases_path.read_text(encoding="utf-8"))
    language_hits = 0
    claim_hits = 0
    categories: dict[str, list[bool]] = defaultdict(list)

    for case in cases:
        language_ok = _language_label(case["text"]) == case["expected_language"]
        claim_ok = bool(_extract_claims(case["text"])) == case["expects_claim"]
        language_hits += language_ok
        claim_hits += claim_ok
        categories[case["category"]].append(language_ok and claim_ok)

    total = len(cases)
    print("TruthQuest offline heuristic evaluation")
    print(f"Cases: {total}")
    print(f"Language-label agreement: {language_hits}/{total} ({language_hits / total:.1%})")
    print(f"Claim-presence agreement: {claim_hits}/{total} ({claim_hits / total:.1%})")
    for category, results in sorted(categories.items()):
        print(f"  {category}: {sum(results)}/{len(results)} both checks passed")
    print("Scope: curated regression cases only; this is not real-world factual accuracy.")
    return 0 if language_hits == total and claim_hits == total else 1


if __name__ == "__main__":
    raise SystemExit(main())
