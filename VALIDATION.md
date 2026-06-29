# Validation plan

## Current evidence

The repository contains 30 curated regression cases across loaded language, neutral reporting, opinion, satire, health claims, and missing-context claims. Run them with `npm run evaluate`.

This set validates deterministic behavior during development. It does not estimate real-world factual accuracy.

## External evaluation before accuracy claims

1. Assemble at least 50 independently labeled examples balanced across true, false, misleading, satire, opinion, and unverifiable content.
2. Use two reviewers and adjudicate disagreements. Record source links and the evidence cutoff date.
3. Freeze the dataset before running the system.
4. Report claim-extraction precision/recall, evidence-retrieval precision at five, supported/unsupported macro F1, coverage, latency, and abstention rate.
5. Publish confusion matrices and at least five failure cases.

## Classroom pilot

Use a consented pre/post study with one teacher and 5–10 students:

- baseline source-ranking and verification quiz;
- one TruthQuest-guided misinformation exercise;
- equivalent post-assessment;
- teacher usability interview;
- retention check after one week, if permitted.

Do not replace simulated dashboard outcomes with impact claims until this study produces measured results.
