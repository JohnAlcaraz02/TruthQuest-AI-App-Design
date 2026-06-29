# TruthQuest architecture

## Canonical application

- `src/main.tsx` mounts `src/app/App.tsx`.
- `src/app/App.tsx` owns the hackathon demo navigation and the connected student-to-teacher workflow.
- `src/app/services/truthquestApi.ts` is the browser/API boundary.
- `backend/app/main.py` exposes the FastAPI contract.
- `backend/app/analysis.py` implements deterministic analysis and provenance checks.

The older files under `src/app/pages` and `src/app/components` are design-export reference screens and are not part of the production bundle. New product work must target the canonical application above. They remain temporarily because they include uncommitted design-reference work; archive or remove them only after visual parity is signed off.

## Analysis semantics

The primary score is **verification readiness**, not truth probability. The response also returns:

- evidence state: possible corroboration, mixed, or insufficient evidence;
- analysis confidence;
- independently visible score components;
- limitations that state what the analysis cannot prove.

The media-integrity endpoint checks file and provenance signals. It is not a visual/audio deepfake classifier.
