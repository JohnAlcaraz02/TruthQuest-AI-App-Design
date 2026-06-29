from __future__ import annotations

import struct
import unittest
from unittest.mock import patch

from backend.app.analysis import _validate_public_url, build_content_analysis_response, build_deepfake_analysis_response
from backend.app.schemas import ContentAnalysisResponse


class ContentAnalysisTests(unittest.TestCase):
    def test_private_url_is_blocked(self) -> None:
        with self.assertRaises(ValueError):
            _validate_public_url("http://127.0.0.1/internal")

    @patch("backend.app.analysis._search_evidence_sources", return_value=([], "", "Offline test"))
    def test_text_without_sources_is_explicitly_insufficient(self, _search) -> None:
        result = build_content_analysis_response(
            "text", "A 2024 report found that library visits increased by 12 percent.",
        )
        self.assertEqual(result["analysisStatus"], "insufficient_evidence")
        self.assertEqual(result["factAccuracy"], "Insufficient evidence")
        self.assertLess(result["analysisConfidence"], 50)
        ContentAnalysisResponse(**result)

    @patch("backend.app.analysis._search_evidence_sources", return_value=([], "", "Offline test"))
    def test_loaded_language_is_separate_from_evidence(self, _search) -> None:
        result = build_content_analysis_response(
            "text", "BREAKING: doctors hate this secret miracle cure that prevents every disease!",
        )
        self.assertEqual(result["biasLabel"], "Strong loaded-language signal")
        self.assertEqual(result["analysisStatus"], "insufficient_evidence")

    @patch("backend.app.analysis._search_evidence_sources")
    def test_related_evidence_is_described_as_possible_corroboration(self, search) -> None:
        claim = "A 2024 report found that library visits increased by 12 percent."
        search.return_value = (
            [{"title": "Library report", "url": "https://example.edu/report", "type": "Academic", "relevance": 85}],
            claim,
            "Test evidence",
        )
        result = build_content_analysis_response("text", claim)
        self.assertIn(result["analysisStatus"], {"supported", "mixed"})
        self.assertNotIn("accuracy", result["factAccuracy"].lower())


class MediaIntegrityTests(unittest.TestCase):
    def test_png_generator_marker_is_reported_without_deepfake_claim(self) -> None:
        png = b"\x89PNG\r\n\x1a\n" + b"\x00" * 8 + struct.pack(">II", 640, 480) + b"Adobe Firefly" + b"\x00" * 2048
        result = build_deepfake_analysis_response("image", "sample.png", "image/png", png)
        self.assertIn("Firefly", next(item["value"] for item in result["metadata"] if item["label"] == "Synthetic Markers"))
        self.assertNotIn("deepfake", result["summary"].lower())
        self.assertIn("Integrity", result["probabilityLabel"])


if __name__ == "__main__":
    unittest.main()
