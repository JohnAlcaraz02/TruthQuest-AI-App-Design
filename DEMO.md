# 90-second judge demo

## Setup

1. Start the backend on port 8000 and the frontend with `npm run dev`.
2. Confirm the Analyzer shows **Live backend**.
3. Clear `truthquest-demo-progress` in browser storage for a fresh narrative.
4. Keep a text scenario ready as the network-independent fallback.

## Script

**0–15 seconds — Problem**

“Students encounter misinformation at the moment they are about to share it. Existing truth scores ask them to trust another black box. TruthQuest teaches the verification process.”

**15–45 seconds — Analyze**

Open Analyzer, select a prepared viral claim, and run it. Point to:

- extracted, checkable claims;
- related evidence links;
- separate source, language, and evidence signals;
- explicit analysis confidence and limitations.

Say: “Related evidence is a lead, not proof. When evidence is missing, TruthQuest says so.”

**45–65 seconds — Learn**

Open the Source Verification lesson or quiz. Complete the evidence-ranking interaction.

Say: “The analysis becomes a targeted learning intervention, not merely a warning badge.”

**65–80 seconds — Act**

Open Teacher View and show the simulated outcome plus remediation action.

Say: “Prototype score changes are labeled simulated. A classroom pilot will replace them with measured pre/post outcomes.”

**80–90 seconds — Close**

“TruthQuest shows the evidence, teaches the habit, and gives educators an action—without pretending an AI score is objective truth.”

## Failure-safe path

If evidence providers are slow or unavailable, continue with the browser fallback. It returns an explicit offline mode, low confidence, and insufficient-evidence result. Do not wait on stage or imply that offline pattern matching verified the claim.

## Likely judge questions

- **Is this a fact checker?** It is a verification and learning assistant. It exposes evidence and uncertainty rather than issuing a final truth verdict.
- **Is the media tool a deepfake model?** No. It checks file integrity and provenance signals. Visual/audio classification is future work requiring a validated model.
- **What is validated?** Thirty curated regression cases protect language and claim-extraction behavior. Real-world factual accuracy is not yet claimed.
- **What is the moat?** The closed loop from a real misinformation encounter to targeted student learning and teacher intervention.
