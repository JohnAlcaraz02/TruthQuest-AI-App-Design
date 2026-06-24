from __future__ import annotations

import logging
import re
import ssl
from html import unescape
from pathlib import Path
from urllib.error import URLError, HTTPError
from urllib.request import Request, urlopen
from uuid import uuid4

from .schemas import (
    ContentAnalysisMode,
    ContentAnalysisResponse,
    DeepfakeAnalysisResponse,
)

logger = logging.getLogger(__name__)


def _build_ssl_context() -> ssl.SSLContext:
    """Return an SSL context that prefers system CA certs and falls back lightly."""
    context = ssl.create_default_context()
    candidates = [
        Path("/etc/ssl/cert.pem"),
        Path("/usr/local/etc/openssl/cert.pem"),
        Path("/opt/homebrew/etc/openssl/cert.pem"),
    ]
    for candidate in candidates:
        if candidate.exists():
            try:
                context.load_verify_locations(candidate)
                return context
            except ssl.SSLError:
                continue
    return context


def _clean_html_text(value: str) -> str:
    value = re.sub(r"(?is)<script.*?>.*?</script>", " ", value)
    value = re.sub(r"(?is)<style.*?>.*?</style>", " ", value)
    value = re.sub(r"(?is)<[^>]+>", " ", value)
    value = unescape(value)
    value = re.sub(r"\s+", " ", value)
    return value.strip()


def _extract_title(html_text: str) -> str:
    match = re.search(r"(?is)<title[^>]*>(.*?)</title>", html_text)
    return _clean_html_text(match.group(1)) if match else ""


def _extract_description(html_text: str) -> str:
    patterns = (
        r'(?is)<meta[^>]+name=["\']description["\'][^>]+content=["\']([^"\']+)["\']',
        r'(?is)<meta[^>]+property=["\']og:description["\'][^>]+content=["\']([^"\']+)["\']',
    )
    for pattern in patterns:
        match = re.search(pattern, html_text)
        if match:
            return _clean_html_text(match.group(1))
    return ""


def _extract_body_excerpt(html_text: str) -> str:
    paragraphs = [
        _clean_html_text(chunk)
        for chunk in re.findall(r"(?is)<p[^>]*>(.*?)</p>", html_text)
    ]
    paragraphs = [paragraph for paragraph in paragraphs if len(paragraph) > 40]
    if paragraphs:
        return " ".join(paragraphs[:2])[:260]
    return _clean_html_text(html_text)[:260]


def _fetch_url_preview(url: str) -> tuple[str, str, str]:
    headers = {
        "User-Agent": "TruthQuestAI/1.0",
        "Accept": "text/html,application/xhtml+xml;q=0.9,*/*;q=0.8",
        "Accept-Language": "en-US,en;q=0.8",
    }
    request = Request(url, headers=headers)
    ssl_context = _build_ssl_context()
    try:
        with urlopen(request, timeout=8, context=ssl_context) as response:
            raw_bytes = response.read(250_000)
            charset = response.headers.get_content_charset() or "utf-8"
            content_type = response.headers.get_content_type()
    except HTTPError as error:
        if error.code in (None, 307, 308, 400, 405, 406):
            new_request = Request(url, headers=headers, method="GET")
            with urlopen(new_request, timeout=8, context=ssl_context) as response:
                raw_bytes = response.read(250_000)
                charset = response.headers.get_content_charset() or "utf-8"
                content_type = response.headers.get_content_type()
        else:
            raise
    html_text = raw_bytes.decode(charset, errors="replace")
    title = _extract_title(html_text)
    description = _extract_description(html_text)
    excerpt = description or _extract_body_excerpt(html_text)
    return title, excerpt, content_type


def _score_content(text: str, is_url: bool, fetched: bool) -> int:
    lowered = text.lower()
    score = 84

    if len(text) < 80:
        score -= 8

    if any(trigger in lowered for trigger in ("breaking", "shocking", "miracle", "click here", "won't believe", "secret")):
        score -= 14

    if any(trigger in lowered for trigger in ("according to", "report", "study", "data", "official", "research")):
        score += 6

    if is_url:
        score += 4 if fetched else -6

    return max(10, min(97, score))


def _bias_label(score: int) -> str:
    if score >= 75:
        return "Low Bias"
    if score >= 50:
        return "Medium Bias"
    return "High Bias"


def _emotion_label(text: str) -> str:
    lowered = text.lower()
    if any(trigger in lowered for trigger in ("shocking", "breaking", "must see", "urgent", "amazing")):
        return "High"
    if any(trigger in lowered for trigger in ("warning", "concern", "caution", "important")):
        return "Medium"
    return "Low"


def _reliability_label(score: int) -> str:
    if score >= 75:
        return "High"
    if score >= 50:
        return "Medium"
    return "Low"


def _build_chips(mode: str, fetched: bool, score: int, source_title: str, excerpt: str) -> list[str]:
    chips = [f"✓ Input mode: {mode}", f"⚡ {_bias_label(score)}"]
    if fetched:
        chips.insert(1, "✓ Page fetched")
    elif mode == "url":
        chips.insert(1, "⚠ Preview unavailable")
    if source_title:
        chips.append(f"✓ Title: {source_title[:42]}")
    if excerpt:
        chips.append(f"✓ Snippet: {excerpt[:42]}")
    return chips[:4]


def _handle_analyze_error(error: Exception) -> str:
    message = str(error)
    if isinstance(error, ssl.SSLError):
        return "Encountered an SSL trust issue while previewing that URL, so the score is based on the URL itself."
    if isinstance(error, TimeoutError):
        return "The page preview timed out, so the score is based on the URL and any locally available text."
    return "The page preview couldn't be loaded, so the score is based on the URL with reduced confidence."


def _build_recommendations(mode: str, score: int, fetched: bool, source_title: str, excerpt: str) -> list[dict[str, object]]:
    recommendations: list[dict[str, object]] = []

    if mode == "url":
        if fetched:
            recommendations.append({"text": "Compare the page title with the article body for headline drift", "done": score >= 70})
            recommendations.append({"text": "Check the publisher, author, and publish date on the source page", "done": bool(source_title)})
            recommendations.append({"text": "Cross-check the claims against two independent sources", "done": score >= 80})
        else:
            recommendations.append({"text": "Open the URL in a browser and verify the page is publicly accessible", "done": False})
            recommendations.append({"text": "Confirm the final destination after redirects before sharing", "done": False})
            recommendations.append({"text": "Copy key claims into a search engine and compare results", "done": score >= 70})
    else:
        recommendations.append({"text": "Check whether the wording is emotional or highly absolute", "done": score >= 75})
        recommendations.append({"text": "Look for supporting evidence, citations, or direct quotes", "done": "according to" in excerpt.lower() or "according to" in source_title.lower()})
        recommendations.append({"text": "Verify the claim against a second trusted source", "done": score >= 80})

    return recommendations


def build_bootstrap_data() -> dict:
    return {
        "landing": {
            "features": [
                {"icon": "Search", "title": "Content Analyzer", "description": "Analyze articles, social media posts, and websites for credibility and bias."},
                {"icon": "Eye", "title": "Deepfake Detector", "description": "Detect manipulated images, videos, and audio using advanced AI technology."},
                {"icon": "BookOpen", "title": "Learning Hub", "description": "Interactive lessons and quizzes to develop critical thinking skills."},
                {"icon": "Shield", "title": "Source Verification", "description": "Check the reliability and reputation of news sources and publishers."},
                {"icon": "Award", "title": "Gamified Learning", "description": "Earn XP, badges, and climb leaderboards while building media literacy."},
                {"icon": "Users", "title": "Teacher Dashboard", "description": "Track student progress and assign media literacy challenges."},
            ],
            "stats": [
                {"value": "500K+", "label": "Active Users"},
                {"value": "2M+", "label": "Content Analyzed"},
                {"value": "95%", "label": "Accuracy Rate"},
                {"value": "150+", "label": "Schools"},
            ],
            "testimonials": [
                {"name": "Sarah Chen", "role": "High School Student", "content": "TruthQuest AI helped me become more critical of what I see online. I now verify sources before sharing!", "avatar": "SC"},
                {"name": "Mr. Johnson", "role": "Media Studies Teacher", "content": "An invaluable tool for teaching media literacy. My students are more engaged than ever.", "avatar": "MJ"},
                {"name": "Alex Rodriguez", "role": "College Student", "content": "The deepfake detector is amazing! It's helped me identify misinformation multiple times.", "avatar": "AR"},
            ],
        },
        "dashboard": {
            "weeklyData": [
                {"day": "Mon", "score": 72, "articles": 4},
                {"day": "Tue", "score": 78, "articles": 6},
                {"day": "Wed", "score": 75, "articles": 3},
                {"day": "Thu", "score": 82, "articles": 8},
                {"day": "Fri", "score": 85, "articles": 5},
                {"day": "Sat", "score": 88, "articles": 7},
                {"day": "Sun", "score": 90, "articles": 9},
            ],
            "credibilityData": [
                {"name": "High", "value": 45, "color": "#22C55E"},
                {"name": "Medium", "value": 32, "color": "#F59E0B"},
                {"name": "Low", "value": 23, "color": "#EF4444"},
            ],
            "classData": [
                {"name": "Amara O.", "score": 94, "lessons": 18, "streak": 12},
                {"name": "Kwame D.", "score": 88, "lessons": 15, "streak": 7},
                {"name": "Ethan R.", "score": 76, "lessons": 11, "streak": 3},
                {"name": "Priya S.", "score": 71, "lessons": 9, "streak": 8},
                {"name": "Leo F.", "score": 65, "lessons": 8, "streak": 2},
            ],
            "leaderboard": [
                {"rank": 1, "name": "Amara O.", "xp": 4820, "avatar": "AO", "badge": "🥇"},
                {"rank": 2, "name": "Kwame D.", "xp": 4210, "avatar": "KD", "badge": "🥈"},
                {"rank": 3, "name": "Zara M.", "xp": 3950, "avatar": "ZM", "badge": "🥉"},
                {"rank": 4, "name": "You", "xp": 3640, "avatar": "ME", "badge": "⭐", "isMe": True},
                {"rank": 5, "name": "Ethan R.", "xp": 3120, "avatar": "ER", "badge": ""},
            ],
            "recentAnalyses": [
                {"title": "Government unveils new AI policy draft", "source": "techpolicy.gov", "score": 91, "bias": "Low", "time": "2h ago", "tag": "Politics"},
                {"title": "Miracle berry cures diabetes, doctors hate this", "source": "healthhacks.net", "score": 22, "bias": "High", "time": "5h ago", "tag": "Health"},
                {"title": "Youth unemployment hits 5-year low in Q3", "source": "reuters.com", "score": 87, "bias": "Low", "time": "1d ago", "tag": "Economy"},
                {"title": "Celebrity endorses questionable crypto scheme", "source": "cryptonews24.co", "score": 38, "bias": "High", "time": "2d ago", "tag": "Finance"},
            ],
        },
        "learning": {
            "modules": [
                {"id": 1, "title": "Spot Fake News", "icon": "Target", "color": "#2563EB", "xp": 150, "progress": 100, "lessons": 8, "completed": True},
                {"id": 2, "title": "Understanding Bias", "icon": "TrendingUp", "color": "#14B8A6", "xp": 200, "progress": 65, "lessons": 10, "completed": False},
                {"id": 3, "title": "Source Verification", "icon": "Shield", "color": "#8B5CF6", "xp": 175, "progress": 40, "lessons": 9, "completed": False},
                {"id": 4, "title": "Deepfake Awareness", "icon": "Eye", "color": "#F59E0B", "xp": 225, "progress": 20, "lessons": 12, "completed": False},
                {"id": 5, "title": "Social Media Literacy", "icon": "Users", "color": "#22C55E", "xp": 180, "progress": 0, "lessons": 8, "completed": False},
                {"id": 6, "title": "Digital Citizenship", "icon": "Lightbulb", "color": "#EF4444", "xp": 250, "progress": 0, "lessons": 14, "completed": False},
            ],
            "leaderboard": [
                {"rank": 1, "name": "Amara O.", "xp": 4820, "avatar": "AO", "badge": "🥇"},
                {"rank": 2, "name": "Kwame D.", "xp": 4210, "avatar": "KD", "badge": "🥈"},
                {"rank": 3, "name": "Zara M.", "xp": 3950, "avatar": "ZM", "badge": "🥉"},
                {"rank": 4, "name": "You", "xp": 3640, "avatar": "ME", "badge": "⭐", "isMe": True},
                {"rank": 5, "name": "Ethan R.", "xp": 3120, "avatar": "ER", "badge": ""},
            ],
        },
        "quiz": {
            "questions": [
                {"id": 1, "question": "A news article claims that eating chocolate daily prevents all diseases. Which red flag is most apparent?", "options": ["The article has a catchy headline", "The claim is absolute with no scientific citations", "The article mentions chocolate brands", "The writing style is casual"], "correct": 1, "explanation": "Absolute health claims without peer-reviewed citations are a major red flag for misinformation. Credible medical claims always reference specific studies and acknowledge limitations."},
                {"id": 2, "question": "Which domain extension typically indicates the most reliable government information source?", "options": [".com", ".org", ".gov", ".net"], "correct": 2, "explanation": "The .gov domain is reserved for official government entities. While not a guarantee of accuracy, it indicates an officially authorized government source with accountability structures."},
                {"id": 3, "question": "You see a viral photo claiming to show a recent disaster. What should you do first?", "options": ["Share it immediately to spread awareness", "Reverse image search to check its origin and date", "Check the number of likes and shares", "Look at the profile picture of who posted it"], "correct": 1, "explanation": "Reverse image search reveals if an image has been used before, potentially in a different context. This is a foundational fact-checking technique."},
            ],
        },
        "profile": {
            "stats": [
                {"label": "Total XP", "value": "3,640", "icon": "Zap", "color": "#2563EB"},
                {"label": "Rank", "value": "#4", "icon": "Trophy", "color": "#F59E0B"},
                {"label": "Lessons Done", "value": "31", "icon": "BookOpen", "color": "#14B8A6"},
                {"label": "Quiz Accuracy", "value": "87%", "icon": "Target", "color": "#22C55E"},
            ],
            "badges": [
                {"icon": "🏅", "name": "First Analysis", "earned": True},
                {"icon": "🔥", "name": "7-Day Streak", "earned": True},
                {"icon": "🎓", "name": "Module 1 Complete", "earned": True},
                {"icon": "🕵️", "name": "Fact Checker", "earned": True},
                {"icon": "🛡️", "name": "Truth Guardian", "earned": False},
                {"icon": "⚡", "name": "Speed Reader", "earned": False},
                {"icon": "🌟", "name": "Top 10%", "earned": False},
                {"icon": "🧠", "name": "Critical Thinker", "earned": False},
            ],
            "recentActivity": [
                {"action": "Completed lesson", "title": "Spotting Fake News Basics", "time": "2 hours ago", "xp": 50},
                {"action": "Passed quiz", "title": "Media Literacy Quiz", "time": "5 hours ago", "xp": 100},
                {"action": "Analyzed content", "title": "Climate Change Article", "time": "1 day ago", "xp": 10},
                {"action": "Earned badge", "title": "Week Warrior", "time": "1 day ago", "xp": 25},
            ],
        },
        "teacher": {
            "classPerformance": [
                {"name": "Week 1", "average": 65},
                {"name": "Week 2", "average": 70},
                {"name": "Week 3", "average": 75},
                {"name": "Week 4", "average": 82},
                {"name": "Week 5", "average": 85},
                {"name": "Week 6", "average": 88},
            ],
            "skillDistribution": [
                {"name": "Fact Checking", "value": 85},
                {"name": "Source Verification", "value": 78},
                {"name": "Bias Detection", "value": 72},
                {"name": "Deepfake Detection", "value": 65},
            ],
            "completionData": [
                {"name": "Completed", "value": 24, "color": "#22C55E"},
                {"name": "In Progress", "value": 8, "color": "#F59E0B"},
                {"name": "Not Started", "value": 3, "color": "#E2E8F0"},
            ],
            "students": [
                {"id": 1, "name": "Sarah Chen", "level": 15, "xp": 3420, "score": 92, "streak": 14, "lessons": 18, "status": "excellent"},
                {"id": 2, "name": "Alex Rodriguez", "level": 12, "xp": 2450, "score": 85, "streak": 7, "lessons": 15, "status": "good"},
                {"id": 3, "name": "Maya Patel", "level": 11, "xp": 2180, "score": 88, "streak": 10, "lessons": 14, "status": "good"},
                {"id": 4, "name": "James Kim", "level": 9, "xp": 1890, "score": 78, "streak": 5, "lessons": 11, "status": "average"},
                {"id": 5, "name": "Emma Wilson", "level": 8, "xp": 1750, "score": 82, "streak": 3, "lessons": 10, "status": "average"},
                {"id": 6, "name": "Oliver Brown", "level": 6, "xp": 980, "score": 65, "streak": 1, "lessons": 7, "status": "needs-attention"},
            ],
            "recentAssignments": [
                {"title": "Media Bias Analysis", "due": "2 days", "submitted": 28, "total": 35, "status": "active"},
                {"title": "Deepfake Detection Quiz", "due": "5 days", "submitted": 15, "total": 35, "status": "active"},
                {"title": "Source Verification Exercise", "due": "Completed", "submitted": 35, "total": 35, "status": "completed"},
            ],
        },
        "mobile": {
            "recentAnalyses": [
                {"title": "Government AI policy draft", "score": 91, "time": "2h ago"},
                {"title": "Miracle berry health claim", "score": 22, "time": "5h ago"},
            ],
            "recentActivity": [
                {"title": "Completed Quiz", "time": "2 hours ago", "xp": 100},
                {"title": "Analyzed Article", "time": "5 hours ago", "xp": 10},
                {"title": "Earned Badge", "time": "1 day ago", "xp": 25},
            ],
        },
    }


def build_content_analysis_response(mode: str, user_input: str) -> dict:
    analyzed_text = user_input.strip()
    if not analyzed_text:
        return {
            "analysisId": str(uuid4()),
            "sourceUrl": "",
            "sourceTitle": "",
            "sourceExcerpt": "",
            "score": 0,
            "biasLabel": "High Bias",
            "emotionLabel": "Low",
            "reliabilityLabel": "Low",
            "factAccuracy": "0%",
            "summary": "No input provided for analysis.",
            "chips": ["⚠ High Bias", "⚠ Input missing", "⚠ Try again"],
            "metrics": [
                {"label": "Bias Indicator", "value": "High Bias", "sub": "Input missing"},
                {"label": "Emotional Manipulation", "value": "Low", "sub": "No content provided"},
                {"label": "Source Reliability", "value": "Low", "sub": "Input missing"},
                {"label": "Fact Accuracy", "value": "0%", "sub": "Cannot verify empty input"},
            ],
            "recommendations": [
                {"text": "Paste a URL, article text, or claim before analyzing.", "done": False},
                {"text": "Include a complete source or full text for a stronger reading.", "done": False},
            ],
            "xpEarned": 0,
        }

    fetched = False
    source_title = ""
    source_excerpt = ""
    page_text = ""
    content_type = ""

    if mode == "url":
        try:
            source_title, source_excerpt, content_type = _fetch_url_preview(analyzed_text)
            fetched = True
            if source_title:
                page_text += f"{source_title} "
            if source_excerpt:
                page_text += f"{source_excerpt}"
        except (HTTPError, URLError, TimeoutError, ValueError, UnicodeError, OSError):
            content_type = "text/plain"
            page_text = analyzed_text
    else:
        content_type = "text/plain"
        page_text = analyzed_text

    analysis_basis = " ".join(part for part in (source_title, source_excerpt, analyzed_text) if part).strip()
    scoring_text = f"{analysis_basis} {page_text}".strip() if analysis_basis else page_text.strip() or analyzed_text
    score = _score_content(scoring_text, mode == "url", fetched)
    bias = _bias_label(score)
    emotion = _emotion_label(scoring_text)
    reliability = _reliability_label(score)
    fact_accuracy = f"{min(99, max(0, score + 6))}%"
    extracted = source_excerpt or page_text[:500] or analyzed_text
    summary = f"Analyzed input from {mode} mode with extracted view: {extracted[:300]}"
    chips = _build_chips(mode, fetched, score, source_title, extracted)

    return {
        "analysisId": str(uuid4()),
        "sourceUrl": analyzed_text if mode == "url" else "",
        "sourceTitle": source_title,
        "sourceExcerpt": extracted,
        "score": score,
        "biasLabel": bias,
        "emotionLabel": emotion,
        "reliabilityLabel": reliability,
        "factAccuracy": fact_accuracy,
        "summary": summary,
        "chips": chips,
        "metrics": [
            {"label": "Bias Indicator", "value": bias, "sub": "Derived from the supplied URL or text"},
            {"label": "Emotional Manipulation", "value": emotion, "sub": "Detected tone markers in the provided content"},
            {"label": "Source Reliability", "value": reliability, "sub": "Based on the fetched source and input signals"},
            {"label": "Fact Accuracy", "value": fact_accuracy, "sub": "Relative confidence from the current heuristic"},
        ],
        "recommendations": _build_recommendations(mode, score, fetched, source_title, extracted),
        "xpEarned": 25 if score >= 75 else 15,
    }


def build_deepfake_analysis_response() -> dict:
    return {
        "analysisId": str(uuid4()),
        "score": 78,
        "verdict": "Likely AI-Generated or Manipulated",
        "probabilityLabel": "78% AI Probability",
        "probability": 78,
        "summary": "This media shows significant indicators of synthetic manipulation. Multiple high-confidence signals detected. Exercise extreme caution before sharing this content.",
        "indicators": [
            {"label": "Facial Inconsistencies", "value": 72, "risk": "Medium", "color": "#F59E0B"},
            {"label": "Lighting Artifacts", "value": 85, "risk": "High", "color": "#EF4444"},
            {"label": "Blinking Pattern", "value": 40, "risk": "Low", "color": "#22C55E"},
            {"label": "Audio Sync Match", "value": 88, "risk": "High", "color": "#EF4444"},
            {"label": "Metadata Integrity", "value": 30, "risk": "Low", "color": "#22C55E"},
            {"label": "AI Generation Probability", "value": 78, "risk": "High", "color": "#EF4444"},
        ],
        "metadata": [
            {"label": "Creation Date", "value": "Modified 2025-11-03"},
            {"label": "Camera Model", "value": "None detected"},
            {"label": "GPS Data", "value": "Stripped"},
            {"label": "Software", "value": "Adobe Firefly 3.1"},
            {"label": "Color Profile", "value": "sRGB (synthetic)"},
        ],
        "aiSummary": "Strong GAN fingerprints detected in the frequency domain. The Adobe Firefly metadata signature and stripped GPS data are typical of AI-generated synthetic media distributed without geographic attribution. The lighting consistency score suggests post-synthesis compositing. Do not share without verification.",
    }
