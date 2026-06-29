from __future__ import annotations

import logging
import ipaddress
import socket
import re
import ssl
import base64
import binascii
import hashlib
import json
import struct
import shutil
import subprocess
import tempfile
from http.client import InvalidURL
from html import unescape
from pathlib import Path
from functools import lru_cache
from concurrent.futures import ThreadPoolExecutor, as_completed
from urllib.parse import quote, quote_plus, urljoin, urlparse
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


def _extract_meta_content(html_text: str, names: tuple[str, ...]) -> str:
    for name in names:
        patterns = (
            rf'(?is)<meta[^>]+name=["\']{re.escape(name)}["\'][^>]+content=["\']([^"\']+)["\']',
            rf'(?is)<meta[^>]+property=["\']{re.escape(name)}["\'][^>]+content=["\']([^"\']+)["\']',
            rf'(?is)<meta[^>]+content=["\']([^"\']+)["\'][^>]+name=["\']{re.escape(name)}["\']',
            rf'(?is)<meta[^>]+content=["\']([^"\']+)["\'][^>]+property=["\']{re.escape(name)}["\']',
        )
        for pattern in patterns:
            match = re.search(pattern, html_text)
            if match:
                return _clean_html_text(match.group(1))
    return ""


def _extract_canonical_url(html_text: str, final_url: str) -> str:
    match = re.search(r'(?is)<link[^>]+rel=["\']canonical["\'][^>]+href=["\']([^"\']+)["\']', html_text)
    if not match:
        match = re.search(r'(?is)<link[^>]+href=["\']([^"\']+)["\'][^>]+rel=["\']canonical["\']', html_text)
    return urljoin(final_url, match.group(1)) if match else final_url


def _extract_body_text(html_text: str) -> str:
    paragraphs = [
        _clean_html_text(chunk)
        for chunk in re.findall(r"(?is)<p[^>]*>(.*?)</p>", html_text)
    ]
    paragraphs = [paragraph for paragraph in paragraphs if len(paragraph) > 40]
    if paragraphs:
        return " ".join(paragraphs)
    return _clean_html_text(html_text)


def _extract_links(html_text: str, base_url: str) -> list[dict[str, str]]:
    links: list[dict[str, str]] = []
    for href, label in re.findall(r'(?is)<a[^>]+href=["\']([^"\']+)["\'][^>]*>(.*?)</a>', html_text):
        clean_label = _clean_html_text(label)
        absolute_url = urljoin(base_url, href)
        if clean_label and absolute_url.startswith(("http://", "https://")):
            links.append({"title": clean_label[:90], "url": absolute_url})
    return links[:25]


def _normalize_url(value: str) -> str:
    candidate = value.strip()
    if not re.match(r"^https?://", candidate, flags=re.I):
        candidate = f"https://{candidate}"
    return candidate


def _validate_public_url(url: str) -> None:
    """Block local/private destinations before server-side URL fetching."""
    parsed = urlparse(url)
    if parsed.scheme not in {"http", "https"} or not parsed.hostname:
        raise ValueError("Only public HTTP(S) URLs are supported.")
    hostname = parsed.hostname.lower()
    if hostname in {"localhost", "localhost.localdomain"} or hostname.endswith(".local"):
        raise ValueError("Local network URLs are not supported.")
    try:
        addresses = {item[4][0] for item in socket.getaddrinfo(hostname, parsed.port or 443, type=socket.SOCK_STREAM)}
    except socket.gaierror as error:
        raise ValueError("The URL hostname could not be resolved.") from error
    for address in addresses:
        ip = ipaddress.ip_address(address)
        if not ip.is_global:
            raise ValueError("Private, loopback, and reserved network URLs are not supported.")


def _domain_from_url(url: str) -> str:
    hostname = urlparse(url).hostname or ""
    return hostname.lower().removeprefix("www.")


def _fetch_url_preview(url: str) -> tuple[str, str, str, str, str, list[dict[str, str]], dict[str, str]]:
    normalized_url = _normalize_url(url)
    _validate_public_url(normalized_url)
    headers = {
        "User-Agent": "TruthQuestAI/1.0",
        "Accept": "text/html,application/xhtml+xml;q=0.9,*/*;q=0.8",
        "Accept-Language": "en-US,en;q=0.8",
    }
    request = Request(normalized_url, headers=headers)
    ssl_context = _build_ssl_context()
    try:
        with urlopen(request, timeout=8, context=ssl_context) as response:
            raw_bytes = response.read(250_000)
            charset = response.headers.get_content_charset() or "utf-8"
            content_type = response.headers.get_content_type()
            final_url = response.geturl()
    except HTTPError as error:
        if error.code in (None, 307, 308, 400, 405, 406):
            new_request = Request(normalized_url, headers=headers, method="GET")
            with urlopen(new_request, timeout=8, context=ssl_context) as response:
                raw_bytes = response.read(250_000)
                charset = response.headers.get_content_charset() or "utf-8"
                content_type = response.headers.get_content_type()
                final_url = response.geturl()
        else:
            raise
    html_text = raw_bytes.decode(charset, errors="replace")
    title = _extract_title(html_text)
    description = _extract_description(html_text)
    body_text = _extract_body_text(html_text)
    excerpt = description or body_text[:260]
    links = _extract_links(html_text, final_url)
    metadata = {
        "author": _extract_meta_content(html_text, ("author", "article:author", "og:site_name")),
        "published": _extract_meta_content(html_text, ("article:published_time", "datePublished", "date", "pubdate")),
        "canonical": _extract_canonical_url(html_text, final_url),
    }
    return title, excerpt, content_type, metadata["canonical"] or final_url, body_text[:20_000], links, metadata


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


TRUSTED_SOURCE_RULES: tuple[tuple[str, str, int, str], ...] = (
    (".gov", "Official government domain", 92, "primary"),
    (".edu", "Academic institution domain", 84, "academic"),
    ("who.int", "Public health authority", 94, "primary"),
    ("un.org", "Intergovernmental authority", 90, "primary"),
    ("reuters.com", "Major wire service", 86, "news"),
    ("apnews.com", "Major wire service", 86, "news"),
    ("bbc.com", "Major news publisher", 80, "news"),
    ("bbc.co.uk", "Major news publisher", 80, "news"),
    ("npr.org", "Public media publisher", 78, "news"),
    ("nature.com", "Academic publisher", 88, "academic"),
    ("science.org", "Academic publisher", 88, "academic"),
    ("pubmed.ncbi.nlm.nih.gov", "Biomedical research index", 92, "academic"),
    ("wikipedia.org", "Open encyclopedia background source", 68, "reference"),
    ("crossref.org", "Scholarly metadata index", 82, "academic"),
    ("arxiv.org", "Open research preprint index", 78, "academic"),
    ("gdeltproject.org", "Global news/event index", 72, "news"),
)


SUSPICIOUS_DOMAIN_TERMS = (
    "truth", "patriot", "viral", "dailybuzz", "healthhack", "miracle", "insider", "uncensored", "breaking",
)


def _source_reputation(domain: str) -> tuple[str, int, str]:
    for pattern, label, score, source_type in TRUSTED_SOURCE_RULES:
        if domain == pattern or domain.endswith(pattern):
            return label, score, source_type
    if any(term in domain for term in SUSPICIOUS_DOMAIN_TERMS):
        return "Unknown source with sensational domain pattern", 38, "unknown"
    return "Unknown or unreviewed source", 56, "unknown"


def _language_risk_score(text: str) -> int:
    lowered = text.lower()
    risk_terms = ("breaking", "shocking", "miracle", "secret", "doctors hate", "won't believe", "urgent", "must see")
    hedge_terms = ("according to", "reported", "study", "data", "official", "research", "published", "document")
    score = 78
    score -= sum(10 for term in risk_terms if term in lowered)
    score += min(14, sum(4 for term in hedge_terms if term in lowered))
    return max(10, min(95, score))


def _extract_claims(text: str) -> list[str]:
    sentences = [
        sentence.strip()
        for sentence in re.split(r"(?<=[.!?])\s+", text)
        if 45 <= len(sentence.strip()) <= 260
    ]
    claim_patterns = (
        r"\b\d+(?:\.\d+)?%?\b",
        r"\b(?:announced|reported|confirmed|claimed|said|found|shows|increased|decreased|launched|approved)\b",
        r"\b(?:study|report|data|survey|election|policy|law|court|government|research|official)\b",
        # "May" is intentionally excluded because lowercasing makes the month
        # indistinguishable from the common modal verb and creates false claims.
        r"\b(?:january|february|march|april|june|july|august|september|october|november|december)\b",
    )
    claims: list[str] = []
    for sentence in sentences:
        lowered = sentence.lower()
        if any(re.search(pattern, lowered) for pattern in claim_patterns):
            cleaned = re.sub(r"\s+", " ", sentence)
            if cleaned not in claims:
                claims.append(cleaned)
        if len(claims) >= 5:
            break
    return claims


def _claim_overlap_score(claim: str, evidence_text: str) -> int:
    words = {
        word
        for word in re.findall(r"[a-zA-Z][a-zA-Z0-9-]{3,}", claim.lower())
        if word not in {"that", "this", "with", "from", "have", "were", "been", "they", "their", "about"}
    }
    if not words:
        return 0
    evidence_lower = evidence_text.lower()
    hits = sum(1 for word in words if word in evidence_lower)
    return round((hits / len(words)) * 100)


@lru_cache(maxsize=128)
def _fetch_json(url: str, timeout: int = 6) -> dict:
    ssl_context = _build_ssl_context()
    request = Request(url, headers={"User-Agent": "TruthQuestAI/1.0", "Accept": "application/json"})
    with urlopen(request, timeout=timeout, context=ssl_context) as response:
        return json.loads(response.read(500_000).decode("utf-8", errors="replace"))


def _evidence_result(title: str, url: str, source_type: str, relevance: int, snippet: str = "") -> dict[str, object]:
    return {
        "title": _clean_html_text(title)[:90] or _domain_from_url(url) or "Evidence source",
        "url": url,
        "type": source_type,
        "relevance": max(1, min(95, relevance)),
        "_snippet": _clean_html_text(snippet),
    }


def _evidence_label(source_type: str, relevance: int) -> str:
    if relevance >= 78:
        return f"Possible corroborating source · {source_type}"
    if relevance >= 65:
        return f"Related source to review · {source_type}"
    return f"Background only · {source_type}"


def _search_wikipedia(claim: str) -> list[dict[str, object]]:
    payload = _fetch_json(f"https://en.wikipedia.org/w/rest.php/v1/search/page?q={quote_plus(claim[:180])}&limit=3")
    results: list[dict[str, object]] = []
    for item in payload.get("pages", []):
        title = str(item.get("title") or "")
        excerpt = _clean_html_text(str(item.get("excerpt") or ""))
        url = f"https://en.wikipedia.org/wiki/{quote(title.replace(' ', '_'))}"
        relevance = min(82, _claim_overlap_score(claim, f"{title} {excerpt}") + 15)
        results.append(_evidence_result(title, url, "Wikipedia background source", relevance, excerpt))
    return results


def _search_crossref(claim: str) -> list[dict[str, object]]:
    payload = _fetch_json(f"https://api.crossref.org/works?query.bibliographic={quote_plus(claim[:180])}&rows=3")
    results: list[dict[str, object]] = []
    for item in payload.get("message", {}).get("items", []):
        title_values = item.get("title") or []
        title = str(title_values[0] if title_values else item.get("DOI") or "Crossref record")
        url = str(item.get("URL") or f"https://doi.org/{item.get('DOI', '')}")
        journal_values = item.get("container-title") or []
        journal = str(journal_values[0] if journal_values else "Scholarly metadata")
        relevance = min(88, _claim_overlap_score(claim, f"{title} {journal}") + 18)
        results.append(_evidence_result(title, url, "Crossref scholarly metadata", relevance, journal))
    return results


def _search_pubmed(claim: str) -> list[dict[str, object]]:
    search = _fetch_json(
        "https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esearch.fcgi"
        f"?db=pubmed&retmode=json&retmax=3&term={quote_plus(claim[:180])}"
    )
    ids = search.get("esearchresult", {}).get("idlist", [])
    if not ids:
        return []
    summary = _fetch_json(
        "https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esummary.fcgi"
        f"?db=pubmed&retmode=json&id={quote_plus(','.join(ids))}"
    )
    results: list[dict[str, object]] = []
    for pmid in ids:
        item = summary.get("result", {}).get(str(pmid), {})
        title = str(item.get("title") or f"PubMed record {pmid}")
        journal = str(item.get("fulljournalname") or item.get("source") or "PubMed")
        url = f"https://pubmed.ncbi.nlm.nih.gov/{pmid}/"
        relevance = min(92, _claim_overlap_score(claim, f"{title} {journal}") + 22)
        results.append(_evidence_result(title, url, "PubMed biomedical literature", relevance, journal))
    return results


def _search_arxiv(claim: str) -> list[dict[str, object]]:
    ssl_context = _build_ssl_context()
    request = Request(
        f"https://export.arxiv.org/api/query?search_query=all:{quote_plus(claim[:160])}&start=0&max_results=3",
        headers={"User-Agent": "TruthQuestAI/1.0", "Accept": "application/atom+xml"},
    )
    with urlopen(request, timeout=6, context=ssl_context) as response:
        xml_text = response.read(400_000).decode("utf-8", errors="replace")
    results: list[dict[str, object]] = []
    entries = re.findall(r"(?is)<entry>(.*?)</entry>", xml_text)
    for entry in entries:
        title = _clean_html_text(re.search(r"(?is)<title>(.*?)</title>", entry).group(1)) if re.search(r"(?is)<title>(.*?)</title>", entry) else "arXiv preprint"
        summary = _clean_html_text(re.search(r"(?is)<summary>(.*?)</summary>", entry).group(1)) if re.search(r"(?is)<summary>(.*?)</summary>", entry) else ""
        link_match = re.search(r'(?is)<link[^>]+href=["\']([^"\']+)["\'][^>]+rel=["\']alternate["\']', entry)
        url = link_match.group(1) if link_match else "https://arxiv.org"
        relevance = min(88, _claim_overlap_score(claim, f"{title} {summary}") + 18)
        results.append(_evidence_result(title, url, "arXiv research preprint", relevance, summary))
    return results


def _search_gdelt(claim: str) -> list[dict[str, object]]:
    payload = _fetch_json(
        "https://api.gdeltproject.org/api/v2/doc/doc"
        f"?query={quote_plus(claim[:180])}&mode=ArtList&format=json&maxrecords=3"
    )
    results: list[dict[str, object]] = []
    for item in payload.get("articles", []):
        title = str(item.get("title") or item.get("domain") or "GDELT article")
        url = str(item.get("url") or "")
        if not url:
            continue
        snippet = str(item.get("seendate") or item.get("sourcecountry") or "GDELT indexed news article")
        relevance = min(82, _claim_overlap_score(claim, f"{title} {snippet}") + 15)
        results.append(_evidence_result(title, url, "GDELT news/event index", relevance, snippet))
    return results


def _search_evidence_sources(claims: list[str], source_domain: str) -> tuple[list[dict[str, object]], str, str]:
    if not claims:
        return [], "", "No claims to search"

    providers = (
        ("Wikipedia", _search_wikipedia),
        ("Crossref", _search_crossref),
        ("PubMed", _search_pubmed),
        ("arXiv", _search_arxiv),
        ("GDELT", _search_gdelt),
    )
    found: list[dict[str, object]] = []
    evidence_text_parts: list[str] = []
    seen_urls: set[str] = set()
    provider_errors: list[str] = []

    tasks: dict[object, str] = {}
    with ThreadPoolExecutor(max_workers=5, thread_name_prefix="evidence") as executor:
        for claim in claims[:3]:
            for provider_name, provider in providers:
                tasks[executor.submit(provider, claim)] = provider_name
        for future in as_completed(tasks):
            if len(found) >= 8:
                continue
            provider_name = tasks[future]
            try:
                results = future.result()
            except (HTTPError, URLError, TimeoutError, ValueError, UnicodeError, OSError, json.JSONDecodeError) as error:
                provider_errors.append(provider_name)
                logger.info("%s evidence search failed: %s", provider_name, error)
                continue
            for result in results:
                url = str(result.get("url") or "")
                domain = _domain_from_url(url)
                if not url or domain == source_domain or url in seen_urls:
                    continue
                if int(result.get("relevance") or 0) < 60:
                    continue
                seen_urls.add(url)
                evidence_text_parts.append(f"{result.get('title', '')}. {result.pop('_snippet', '')}")
                result["type"] = _evidence_label(str(result.get("type") or "Evidence source"), int(result.get("relevance") or 0))
                found.append(result)
                if len(found) >= 8:
                    break

    if found:
        return found, " ".join(evidence_text_parts), "Free evidence search completed"
    if provider_errors:
        unique_errors = ", ".join(sorted(set(provider_errors))[:4])
        return [], "", f"No independent results found; some providers failed: {unique_errors}"
    return [], "", "No independent results found"


def _build_claim_reports(
    claims: list[str],
    source_context_text: str,
    independent_evidence_text: str,
    source_score: int,
    fetched: bool,
) -> list[dict[str, object]]:
    reports: list[dict[str, object]] = []
    for claim in claims:
        source_overlap = _claim_overlap_score(claim, source_context_text)
        independent_overlap = _claim_overlap_score(claim, independent_evidence_text)
        if independent_overlap >= 80:
            status = "Possible corroboration found"
            confidence = min(95, round(independent_overlap * 0.7 + source_score * 0.3))
            evidence = "Independent search results contain strong text overlap. Review the linked source to confirm whether it supports the exact claim."
        elif independent_overlap >= 55:
            status = "Related evidence found"
            confidence = min(82, round(independent_overlap * 0.7 + source_score * 0.3))
            evidence = "Independent search results contain partial text overlap. This is a lead for manual verification, not proof."
        elif fetched and source_overlap >= 75 and source_score >= 75:
            status = "Supported by source context only"
            confidence = min(78, round((source_overlap + source_score) / 2))
            evidence = "The claim appears in a fetched reputable source, but no independent corroboration was available."
        elif fetched and source_overlap >= 50:
            status = "Present, needs independent corroboration"
            confidence = min(68, round((source_overlap + source_score) / 2))
            evidence = "The claim appears in the fetched page, but this app did not verify it against independent sources."
        else:
            status = "Needs evidence"
            confidence = 35 if fetched else 25
            evidence = "No independent supporting evidence was found in the locally fetched context."
        reports.append({"claim": claim, "status": status, "confidence": confidence, "evidence": evidence})
    return reports


def _evidence_sources_from_links(links: list[dict[str, str]], final_url: str) -> list[dict[str, object]]:
    sources: list[dict[str, object]] = []
    seen: set[str] = set()
    final_domain = _domain_from_url(final_url)
    for link in links:
        url = link["url"]
        domain = _domain_from_url(url)
        if not domain or domain == final_domain or domain in seen:
            continue
        label, reputation, source_type = _source_reputation(domain)
        if reputation < 70 and source_type == "unknown":
            continue
        seen.add(domain)
        sources.append({
            "title": link["title"] or domain,
            "url": url,
            "type": label,
            "relevance": reputation,
        })
        if len(sources) >= 4:
            break
    return sources


def _build_source_signals(
    mode: str,
    requested_url: str,
    final_url: str,
    content_type: str,
    fetched: bool,
    source_title: str,
    source_excerpt: str,
) -> tuple[list[dict[str, str]], int, str]:
    if mode != "url":
        text_score = 64 if len(requested_url) >= 120 else 48
        return [
            {"label": "Input Type", "value": "Text/image input without source URL", "status": "neutral"},
            {"label": "Source Verification", "value": "No publisher domain available", "status": "warning"},
        ], text_score, "user-supplied content"

    final = final_url or _normalize_url(requested_url)
    domain = _domain_from_url(final)
    reputation_label, source_score, _source_type = _source_reputation(domain)
    signals = [
        {"label": "Final Domain", "value": domain or "Unavailable", "status": "positive" if fetched else "warning"},
        {"label": "Domain Context Rule", "value": reputation_label, "status": "positive" if source_score >= 75 else "warning" if source_score >= 50 else "negative"},
        {"label": "HTTPS", "value": "Secure URL" if final.startswith("https://") else "Not HTTPS", "status": "positive" if final.startswith("https://") else "negative"},
        {"label": "Page Fetch", "value": "Fetched successfully" if fetched else "Could not fetch page", "status": "positive" if fetched else "negative"},
        {"label": "Content Type", "value": content_type or "Unavailable", "status": "positive" if "html" in content_type else "warning"},
        {"label": "Publisher Metadata", "value": "Title/description found" if source_title or source_excerpt else "Missing title/description", "status": "positive" if source_title or source_excerpt else "warning"},
    ]
    if requested_url and final and _normalize_url(requested_url) != final:
        signals.append({"label": "Redirect", "value": f"Final URL: {final[:80]}", "status": "warning"})
    return signals, source_score, domain


def _score_breakdown(
    source_score: int,
    claim_reports: list[dict[str, object]],
    language_score: int,
    fetched: bool,
    has_metadata: bool,
    evidence_sources: list[dict[str, object]],
) -> tuple[list[dict[str, int]], int]:
    evidence_score = 35
    if claim_reports:
        evidence_score = round(sum(int(report["confidence"]) for report in claim_reports) / len(claim_reports))
    if evidence_sources:
        evidence_score = min(95, evidence_score + 8)

    claim_consistency = 45
    if claim_reports:
        supported = sum(1 for report in claim_reports if "Supported" in str(report["status"]))
        needs = sum(1 for report in claim_reports if "Needs" in str(report["status"]))
        claim_consistency = max(20, min(92, 55 + supported * 10 - needs * 8))

    transparency = 35 + (25 if fetched else 0) + (20 if has_metadata else 0) + (10 if evidence_sources else 0)
    transparency = min(95, transparency)

    breakdown = [
        {"label": "Source Context", "score": source_score, "weight": 25},
        {"label": "Evidence Relevance", "score": evidence_score, "weight": 35},
        {"label": "Claim Coverage", "score": claim_consistency, "weight": 20},
        {"label": "Language Quality", "score": language_score, "weight": 10},
        {"label": "Transparency", "score": transparency, "weight": 10},
    ]
    weighted = round(sum(item["score"] * item["weight"] for item in breakdown) / 100)
    return breakdown, max(5, min(97, weighted))


def _language_label(text: str) -> str:
    """Describe observable language without inferring political or factual bias."""
    lowered = text.lower()
    loaded = ("shocking", "breaking", "miracle", "secret", "urgent", "must see", "doctors hate", "won't believe")
    count = sum(1 for term in loaded if term in lowered)
    if count >= 2:
        return "Strong loaded-language signal"
    if count == 1:
        return "Some loaded-language signal"
    return "No strong loaded-language signal"


def _analysis_state(
    claim_reports: list[dict[str, object]],
    evidence_sources: list[dict[str, object]],
    fetched: bool,
) -> tuple[str, int, str, list[str]]:
    """Return an evidence state and confidence without claiming factual accuracy."""
    independent = [
        report for report in claim_reports
        if any(term in str(report.get("status", "")).lower() for term in ("corroboration", "related evidence"))
    ]
    limitations: list[str] = []
    if not fetched:
        limitations.append("No verified publisher page was available.")
    if not claim_reports:
        limitations.append("No checkable factual claim was extracted.")
    if not evidence_sources:
        limitations.append("No independent evidence source was retrieved.")
    limitations.append("Text overlap can identify related sources, but cannot prove that a claim is true.")

    if not claim_reports or not evidence_sources or not independent:
        confidence = 22 + (12 if fetched else 0) + min(12, len(claim_reports) * 4)
        return "insufficient_evidence", min(49, confidence), "Insufficient evidence", limitations

    strong = sum(1 for report in independent if int(report.get("confidence", 0)) >= 70)
    if strong == len(claim_reports):
        confidence = min(90, 58 + strong * 6 + (8 if fetched else 0))
        return "supported", confidence, "Possible corroboration found", limitations

    confidence = min(78, 48 + len(independent) * 5 + (8 if fetched else 0))
    return "mixed", confidence, "Mixed evidence", limitations


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
    chips = [f"✓ Input mode: {mode}", f"⚡ Verification readiness: {score}/100"]
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
                {"icon": "Search", "title": "Evidence-Guided Analyzer", "description": "Extract claims, inspect source context, and show evidence with explicit uncertainty."},
                {"icon": "Eye", "title": "Media Integrity Check", "description": "Inspect signatures, container structure, hashes, and embedded provenance markers."},
                {"icon": "BookOpen", "title": "Learning Hub", "description": "Interactive lessons and quizzes to develop critical thinking skills."},
                {"icon": "Shield", "title": "Source Verification", "description": "Check the reliability and reputation of news sources and publishers."},
                {"icon": "Award", "title": "Gamified Learning", "description": "Earn XP, badges, and climb leaderboards while building media literacy."},
                {"icon": "Users", "title": "Teacher Dashboard", "description": "Track student progress and assign media literacy challenges."},
            ],
            "stats": [
                {"value": "5", "label": "Open Evidence Sources"},
                {"value": "3", "label": "Learning-to-Action Stages"},
                {"value": "100%", "label": "Visible Score Components"},
                {"value": "30", "label": "Curated Regression Cases"},
            ],
            "testimonials": [
                {"name": "Analyze", "role": "Student workflow", "content": "Turn a viral post into claims, evidence links, confidence, limitations, and next steps.", "avatar": "01"},
                {"name": "Learn", "role": "Targeted intervention", "content": "Convert analysis weaknesses into a short lesson and source-ranking challenge.", "avatar": "02"},
                {"name": "Act", "role": "Teacher workflow", "content": "Give educators an intervention-ready summary with demo outcomes clearly labeled.", "avatar": "03"},
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
                {"name": "Media Provenance", "value": 65},
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
                {"title": "Media Provenance Quiz", "due": "5 days", "submitted": 15, "total": 35, "status": "active"},
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
            "biasLabel": "Not assessed",
            "emotionLabel": "Low",
            "reliabilityLabel": "Low",
            "factAccuracy": "Insufficient evidence",
            "summary": "No input provided for analysis.",
            "chips": ["⚠ Input missing", "⚠ Insufficient evidence", "⚠ Try again"],
            "metrics": [
                {"label": "Language Signal", "value": "Not assessed", "sub": "Input missing"},
                {"label": "Emotional Language", "value": "Not assessed", "sub": "No content provided"},
                {"label": "Source Context", "value": "Unavailable", "sub": "Input missing"},
                {"label": "Evidence Status", "value": "Insufficient evidence", "sub": "Cannot verify empty input"},
            ],
            "recommendations": [
                {"text": "Paste a URL, article text, or claim before analyzing.", "done": False},
                {"text": "Include a complete source or full text for a stronger reading.", "done": False},
            ],
            "sourceSignals": [],
            "claims": [],
            "evidenceSources": [],
            "scoreBreakdown": [],
            "analysisStatus": "insufficient_evidence",
            "analysisConfidence": 0,
            "limitations": ["No content was supplied."],
            "xpEarned": 0,
        }

    if mode == "image":
        return _build_image_content_analysis_response(analyzed_text)

    fetched = False
    source_title = ""
    source_excerpt = ""
    page_text = ""
    content_type = ""
    final_url = ""
    links: list[dict[str, str]] = []
    page_metadata: dict[str, str] = {}

    if mode == "url":
        try:
            source_title, source_excerpt, content_type, final_url, page_text, links, page_metadata = _fetch_url_preview(analyzed_text)
            fetched = True
        except (HTTPError, URLError, TimeoutError, ValueError, UnicodeError, OSError, InvalidURL):
            content_type = "text/plain"
            page_text = analyzed_text
    else:
        content_type = "text/plain"
        page_text = analyzed_text

    analysis_basis = " ".join(part for part in (source_title, source_excerpt, analyzed_text) if part).strip()
    scoring_text = f"{analysis_basis} {page_text}".strip() if analysis_basis else page_text.strip() or analyzed_text
    source_signals, source_score, source_label = _build_source_signals(
        mode,
        analyzed_text,
        final_url,
        content_type,
        fetched,
        source_title,
        source_excerpt,
    )
    claims = [] if mode == "url" and not fetched else _extract_claims(scoring_text)
    linked_evidence_sources = _evidence_sources_from_links(links, final_url)
    searched_evidence_sources, searched_evidence_text, search_status = _search_evidence_sources(claims, source_label)
    evidence_sources = linked_evidence_sources + [
        source for source in searched_evidence_sources
        if source["url"] not in {linked_source["url"] for linked_source in linked_evidence_sources}
    ]
    claim_reports = _build_claim_reports(claims, scoring_text, searched_evidence_text, source_score, fetched)
    if mode == "url":
        source_signals.append({
            "label": "Independent Evidence Search",
            "value": search_status,
            "status": "positive" if searched_evidence_sources else "warning",
        })
        if page_metadata.get("author"):
            source_signals.append({"label": "Author/Site", "value": page_metadata["author"], "status": "positive"})
        if page_metadata.get("published"):
            source_signals.append({"label": "Published Date", "value": page_metadata["published"], "status": "positive"})
    language_score = _language_risk_score(scoring_text)
    has_metadata = bool(source_title or source_excerpt)
    score_breakdown, score = _score_breakdown(
        source_score=source_score,
        claim_reports=claim_reports,
        language_score=language_score,
        fetched=fetched,
        has_metadata=has_metadata,
        evidence_sources=evidence_sources,
    )
    language_label = _language_label(scoring_text)
    emotion = _emotion_label(scoring_text)
    reliability = _reliability_label(source_score)
    analysis_status, analysis_confidence, evidence_label, limitations = _analysis_state(
        claim_reports, evidence_sources, fetched,
    )
    fact_accuracy = evidence_label
    extracted = source_excerpt or page_text[:500] or analyzed_text
    if fetched and claims:
        summary = (
            f"Analyzed {source_label} with {len(claims)} factual claim(s) extracted. "
            "Verification readiness combines source context, related evidence, language quality, and transparency; it is not a truth probability."
        )
    elif mode == "url":
        summary = (
            "The URL could not be fetched, so the report is based on URL/domain signals only. "
            "Treat this as a low-confidence result until the article can be opened."
        )
    else:
        summary = (
            f"Analyzed user-supplied {mode} input. No publisher URL was available, so source reputation and external evidence are limited."
        )
    chips = _build_chips(mode, fetched, score, source_title, extracted)
    chips.append(f"✓ Claims: {len(claims)}")
    if evidence_sources:
        chips.append(f"✓ Evidence links: {len(evidence_sources)}")
    chips = chips[:5]

    return {
        "analysisId": str(uuid4()),
        "sourceUrl": final_url or analyzed_text if mode == "url" else "",
        "sourceTitle": source_title,
        "sourceExcerpt": extracted,
        "score": score,
        "biasLabel": language_label,
        "emotionLabel": emotion,
        "reliabilityLabel": reliability,
        "factAccuracy": fact_accuracy,
        "summary": summary,
        "chips": chips,
        "metrics": [
            {"label": "Language Signal", "value": language_label, "sub": "Observable loaded-language markers; not a political-bias judgment"},
            {"label": "Emotional Language", "value": emotion, "sub": "Detected tone markers in the provided content"},
            {"label": "Source Context", "value": reliability, "sub": f"Rule-based domain/source score: {source_score}/100"},
            {"label": "Evidence Status", "value": evidence_label, "sub": f"Analysis confidence: {analysis_confidence}%"},
        ],
        "recommendations": _build_recommendations(mode, score, fetched, source_title, extracted),
        "sourceSignals": source_signals,
        "claims": claim_reports,
        "evidenceSources": evidence_sources,
        "scoreBreakdown": score_breakdown,
        "analysisStatus": analysis_status,
        "analysisConfidence": analysis_confidence,
        "limitations": limitations,
        "xpEarned": 25 if score >= 75 else 15,
    }


def _risk_name(value: int) -> str:
    if value >= 70:
        return "High"
    if value >= 45:
        return "Medium"
    return "Low"


def _risk_color(value: int) -> str:
    if value >= 70:
        return "#EF4444"
    if value >= 45:
        return "#F59E0B"
    return "#22C55E"


def _format_bytes(size: int) -> str:
    if size >= 1024 * 1024:
        return f"{size / 1024 / 1024:.1f} MB"
    if size >= 1024:
        return f"{size / 1024:.1f} KB"
    return f"{size} B"


def _detect_file_kind(data: bytes) -> tuple[str, str]:
    header = data[:32]
    if header.startswith(b"\x89PNG\r\n\x1a\n"):
        return "image", "PNG image"
    if header.startswith(b"\xff\xd8\xff"):
        return "image", "JPEG image"
    if header.startswith(b"RIFF") and header[8:12] == b"WEBP":
        return "image", "WebP image"
    if header.startswith(b"ID3") or header.startswith(b"\xff\xfb") or header.startswith(b"\xff\xf3") or header.startswith(b"\xff\xf2"):
        return "audio", "MP3 audio"
    if header.startswith(b"RIFF") and header[8:12] == b"WAVE":
        return "audio", "WAV audio"
    if b"ftyp" in header[:16]:
        brand = header[8:12].decode("latin1", errors="ignore").strip() or "MP4"
        return "video", f"{brand.upper()} media container"
    if header.startswith(b"OggS"):
        return "audio", "Ogg audio"
    return "unknown", "Unknown signature"


def _png_dimensions(data: bytes) -> tuple[int, int] | None:
    if len(data) >= 24 and data.startswith(b"\x89PNG\r\n\x1a\n"):
        return struct.unpack(">II", data[16:24])
    return None


def _jpeg_dimensions(data: bytes) -> tuple[int, int] | None:
    if not data.startswith(b"\xff\xd8"):
        return None
    index = 2
    while index + 9 < len(data):
        if data[index] != 0xFF:
            index += 1
            continue
        marker = data[index + 1]
        index += 2
        if marker in (0xD8, 0xD9):
            continue
        if index + 2 > len(data):
            return None
        segment_length = int.from_bytes(data[index:index + 2], "big")
        if segment_length < 2 or index + segment_length > len(data):
            return None
        if marker in (0xC0, 0xC1, 0xC2, 0xC3, 0xC5, 0xC6, 0xC7, 0xC9, 0xCA, 0xCB, 0xCD, 0xCE, 0xCF):
            height = int.from_bytes(data[index + 3:index + 5], "big")
            width = int.from_bytes(data[index + 5:index + 7], "big")
            return width, height
        index += segment_length
    return None


def _webp_dimensions(data: bytes) -> tuple[int, int] | None:
    if not (len(data) >= 30 and data.startswith(b"RIFF") and data[8:12] == b"WEBP"):
        return None
    chunk = data[12:16]
    if chunk == b"VP8X" and len(data) >= 30:
        width = int.from_bytes(data[24:27], "little") + 1
        height = int.from_bytes(data[27:30], "little") + 1
        return width, height
    if chunk == b"VP8 " and len(data) >= 30:
        width = int.from_bytes(data[26:28], "little") & 0x3FFF
        height = int.from_bytes(data[28:30], "little") & 0x3FFF
        return width, height
    if chunk == b"VP8L" and len(data) >= 25:
        packed = int.from_bytes(data[21:25], "little")
        width = (packed & 0x3FFF) + 1
        height = ((packed >> 14) & 0x3FFF) + 1
        return width, height
    return None


def _image_dimensions(data: bytes) -> tuple[int, int] | None:
    return _png_dimensions(data) or _jpeg_dimensions(data) or _webp_dimensions(data)


def _synthetic_markers(data: bytes) -> list[str]:
    sample = data[:2_000_000].decode("latin1", errors="ignore").lower()
    marker_map = {
        "Adobe Firefly": ("firefly", "adobe firefly"),
        "Midjourney": ("midjourney",),
        "Stable Diffusion": ("stable diffusion", "stablediffusion", "automatic1111", "comfyui"),
        "DALL-E": ("dall-e", "dalle", "openai"),
        "Generative AI metadata": ("ai generated", "synthetic media", "generated by ai", "c2pa"),
    }
    found: list[str] = []
    for label, needles in marker_map.items():
        if any(needle in sample for needle in needles):
            found.append(label)
    return found


def _decode_image_data_url(value: str) -> tuple[bytes, str]:
    header = ""
    payload = value.strip()
    if payload.startswith("data:"):
        header, _, payload = payload.partition(",")
    try:
        data = base64.b64decode(payload, validate=True)
    except (binascii.Error, ValueError) as error:
        raise ValueError("Image input is not valid base64 data.") from error
    mime = "image/unknown"
    if header:
        mime = header.removeprefix("data:").split(";", 1)[0] or mime
    return data, mime


def _byte_entropy(data: bytes, limit: int = 1_000_000) -> float:
    sample = data[:limit]
    if not sample:
        return 0.0
    counts = [0] * 256
    for byte in sample:
        counts[byte] += 1
    length = len(sample)
    # Avoid importing a heavy image stack; use log2 directly for byte distribution.
    import math
    entropy = 0.0
    for count in counts:
        if count:
            probability = count / length
            entropy -= probability * math.log2(probability)
    return round(entropy, 2)


def _run_local_ocr(data: bytes, detected_label: str) -> tuple[str, str]:
    tesseract_path = shutil.which("tesseract")
    if not tesseract_path:
        return "", "Tesseract OCR is not installed on this machine."
    suffix = ".png"
    if "JPEG" in detected_label:
        suffix = ".jpg"
    elif "WebP" in detected_label:
        suffix = ".webp"
    try:
        with tempfile.NamedTemporaryFile(suffix=suffix, delete=True) as image_file:
            image_file.write(data)
            image_file.flush()
            completed = subprocess.run(
                [tesseract_path, image_file.name, "stdout", "--psm", "6"],
                check=False,
                capture_output=True,
                text=True,
                timeout=12,
            )
    except (OSError, subprocess.SubprocessError, TimeoutError) as error:
        return "", f"OCR failed: {str(error)[:120]}"
    if completed.returncode != 0:
        detail = (completed.stderr or "OCR returned no text").strip()
        return "", f"OCR unavailable: {detail[:120]}"
    text = re.sub(r"\s+", " ", completed.stdout).strip()
    return text[:3000], "OCR completed" if text else "OCR completed but found no readable text."


def _build_image_content_analysis_response(user_input: str) -> dict:
    try:
        data, browser_mime = _decode_image_data_url(user_input)
    except ValueError as error:
        return {
            "analysisId": str(uuid4()),
            "sourceUrl": "",
            "sourceTitle": "Uploaded image",
            "sourceExcerpt": "Invalid image upload",
            "score": 18,
            "biasLabel": "High Risk",
            "emotionLabel": "Unknown",
            "reliabilityLabel": "Low",
            "factAccuracy": "18%",
            "summary": str(error),
            "chips": ["⚠ Invalid image", "⚠ Cannot inspect file"],
            "metrics": [
                {"label": "File Integrity", "value": "Invalid", "sub": "Base64 decode failed"},
                {"label": "Visual Metadata", "value": "Unavailable", "sub": "No image bytes available"},
                {"label": "Provenance", "value": "Unknown", "sub": "Cannot verify upload"},
                {"label": "Share Risk", "value": "High", "sub": "Do not rely on this upload"},
            ],
            "recommendations": [{"text": "Upload a PNG, JPG, or WEBP image file and try again.", "done": False}],
            "sourceSignals": [],
            "claims": [],
            "evidenceSources": [],
            "scoreBreakdown": [],
            "analysisStatus": "insufficient_evidence",
            "analysisConfidence": 0,
            "limitations": ["The uploaded image could not be decoded."],
            "xpEarned": 0,
        }

    detected_type, detected_label = _detect_file_kind(data)
    dimensions = _image_dimensions(data) if detected_type == "image" else None
    markers = _synthetic_markers(data)
    ocr_text, ocr_status = _run_local_ocr(data, detected_label) if detected_type == "image" else ("", "OCR skipped because the file is not a supported image.")
    entropy = _byte_entropy(data)
    file_size = len(data)
    sha256 = hashlib.sha256(data).hexdigest()
    megapixels = round((dimensions[0] * dimensions[1]) / 1_000_000, 2) if dimensions else 0
    mime_match = browser_mime.startswith("image/") and detected_type == "image"
    has_dimensions = dimensions is not None
    too_small = file_size < 4 * 1024
    huge_image = megapixels >= 20

    integrity_score = 88 if mime_match else 36 if detected_type == "unknown" else 48
    structure_score = 86 if has_dimensions else 42
    provenance_score = 38 if markers else 62
    quality_score = 45 if too_small else 68 if huge_image else 78
    metadata_score = max(20, min(92, round((integrity_score + structure_score + provenance_score + quality_score) / 4)))
    score = metadata_score

    dimension_value = f"{dimensions[0]} x {dimensions[1]} ({megapixels} MP)" if dimensions else "Unavailable"
    marker_value = ", ".join(markers) if markers else "None found"
    summary_parts = [
        f"TruthQuest inspected the uploaded image bytes as a {detected_label}.",
        f"It measured {dimension_value}, {_format_bytes(file_size)}, byte entropy {entropy}/8, and SHA-256 fingerprint {sha256[:16]}...",
    ]
    if markers:
        summary_parts.append(f"Embedded generator/provenance markers were found: {marker_value}.")
    if not has_dimensions:
        summary_parts.append("Dimensions could not be parsed, so the image needs manual review.")
    if detected_type != "image":
        summary_parts.append("The upload does not look like a supported image file based on its binary signature.")
    if detected_type == "image" and not markers and has_dimensions:
        summary_parts.append("No embedded AI-generator markers were found, but this does not prove the image is authentic.")
    if ocr_text:
        summary_parts.append(f"OCR extracted readable text: {ocr_text[:220]}")
    else:
        summary_parts.append(ocr_status)

    source_signals = [
        {"label": "Browser MIME Type", "value": browser_mime or "Unavailable", "status": "positive" if browser_mime.startswith("image/") else "warning"},
        {"label": "Binary Signature", "value": detected_label, "status": "positive" if detected_type == "image" else "negative"},
        {"label": "Dimensions", "value": dimension_value, "status": "positive" if has_dimensions else "warning"},
        {"label": "File Size", "value": _format_bytes(file_size), "status": "warning" if too_small else "positive"},
        {"label": "OCR Text", "value": ocr_text[:180] if ocr_text else ocr_status, "status": "positive" if ocr_text else "warning"},
        {"label": "Embedded Generator Markers", "value": marker_value, "status": "warning" if markers else "neutral"},
        {"label": "SHA-256 Fingerprint", "value": f"{sha256[:32]}...", "status": "neutral"},
    ]

    claims = [
        {
            "claim": "Uploaded image file integrity and provenance",
            "status": "Generator markers found" if markers else "No embedded generator markers found",
            "confidence": 72 if markers else 58,
            "evidence": "This is based on binary signature, parsed dimensions, embedded metadata strings, file size, entropy, and hash. It is not a visual fact-check of what the image depicts.",
        }
    ]
    if not has_dimensions or detected_type != "image":
        claims.append({
            "claim": "Uploaded file is a valid supported image",
            "status": "Needs manual review",
            "confidence": 35,
            "evidence": "The server could not parse expected dimensions or image signature data.",
        })
    ocr_claim_reports: list[dict[str, object]] = []
    ocr_evidence_sources: list[dict[str, object]] = []
    if ocr_text:
        ocr_claims = _extract_claims(ocr_text)
        searched_sources, searched_text, search_status = _search_evidence_sources(ocr_claims, "")
        ocr_claim_reports = _build_claim_reports(ocr_claims, ocr_text, searched_text, 50, False)
        ocr_evidence_sources = searched_sources
        claims.extend({
            **report,
            "claim": f"OCR text claim: {report['claim']}",
            "evidence": f"{report['evidence']} OCR evidence search: {search_status}",
        } for report in ocr_claim_reports)
        if ocr_claim_reports:
            ocr_score = round(sum(int(report["confidence"]) for report in ocr_claim_reports) / len(ocr_claim_reports))
            score = round(score * 0.6 + ocr_score * 0.4)
        else:
            ocr_score = 45
    else:
        ocr_score = 35 if "not installed" in ocr_status else 45

    recommendations = [
        {"text": "Use reverse image search to check whether this image appeared earlier in a different context.", "done": False},
        {"text": "Ask for the original source, capture date, and uncropped version before sharing.", "done": False},
        {"text": "Run the same file through Media Integrity Check for additional provenance signals.", "done": False},
    ]
    if ocr_text:
        recommendations.insert(0, {"text": "Verify the extracted OCR text as a separate claim before sharing the image.", "done": False})
    elif "not installed" in ocr_status:
        recommendations.append({"text": "Install Tesseract locally to extract text from memes, screenshots, and image posts.", "done": False})

    return {
        "analysisId": str(uuid4()),
        "sourceUrl": "",
        "sourceTitle": "Uploaded image forensic report",
        "sourceExcerpt": f"{detected_label} · {dimension_value} · {_format_bytes(file_size)}",
        "score": score,
        "biasLabel": "Image Metadata",
        "emotionLabel": "N/A",
        "reliabilityLabel": _reliability_label(score),
        "factAccuracy": "File review only",
        "summary": " ".join(summary_parts),
        "chips": [
            "✓ Local image analysis",
            "✓ Image bytes inspected",
            "✓ OCR text found" if ocr_text else "⚠ OCR unavailable",
            f"✓ {detected_label}",
            "⚠ Generator markers" if markers else "✓ No generator markers",
        ],
        "metrics": [
            {"label": "File Integrity", "value": "Valid" if detected_type == "image" else "Invalid", "sub": f"Signature: {detected_label}"},
            {"label": "OCR Text", "value": "Found" if ocr_text else "Unavailable", "sub": ocr_text[:80] if ocr_text else ocr_status},
            {"label": "Visual Metadata", "value": dimension_value, "sub": f"Size: {_format_bytes(file_size)}"},
            {"label": "Provenance", "value": "Generator marker found" if markers else "No marker found", "sub": marker_value},
        ],
        "recommendations": recommendations,
        "sourceSignals": source_signals,
        "claims": claims,
        "evidenceSources": ocr_evidence_sources,
        "scoreBreakdown": [
            {"label": "File Signature", "score": integrity_score, "weight": 30},
            {"label": "Dimension Parsing", "score": structure_score, "weight": 25},
            {"label": "Provenance Metadata", "score": provenance_score, "weight": 20},
            {"label": "OCR Text Claims", "score": ocr_score, "weight": 15},
            {"label": "File Quality", "score": quality_score, "weight": 10},
        ],
        "analysisStatus": "insufficient_evidence",
        "analysisConfidence": 42 if detected_type == "image" else 18,
        "limitations": [
            "File and provenance checks do not determine whether the depicted event is real.",
            "Absence of generator metadata does not prove authenticity.",
        ],
        "xpEarned": 25 if score >= 70 else 15,
    }


def build_deepfake_analysis_response(
    media_type: str,
    filename: str,
    content_type: str,
    data: bytes,
) -> dict:
    declared_type = media_type if media_type in {"image", "video", "audio"} else "unknown"
    detected_type, detected_label = _detect_file_kind(data)
    dimensions = _image_dimensions(data) if detected_type == "image" else None
    markers = _synthetic_markers(data)
    file_size = len(data)

    type_match = declared_type != "unknown" and detected_type == declared_type
    tiny_threshold = 1024 if declared_type == "image" else 10 * 1024
    too_small = file_size < tiny_threshold
    missing_dimensions = declared_type == "image" and detected_type == "image" and dimensions is None

    signature_score = 10 if type_match else 82 if detected_type == "unknown" else 70
    metadata_score = min(95, 15 + (45 if markers else 0) + (25 if too_small else 0))
    structure_score = min(95, 18 + (50 if not type_match else 0) + (20 if missing_dimensions else 0))
    generator_score = 88 if markers else 12
    content_score = min(95, 20 + (25 if too_small else 0) + (30 if not type_match else 0) + (25 if markers else 0))

    probability = round(
        signature_score * 0.25
        + metadata_score * 0.20
        + structure_score * 0.20
        + generator_score * 0.20
        + content_score * 0.15
    )
    probability = max(5, min(95, probability))

    if probability >= 70:
        verdict = "High File-Integrity Risk"
        summary = "The uploaded file contains strong integrity or generator-marker signals that need manual provenance review before sharing."
    elif probability >= 45:
        verdict = "Needs Manual Provenance Review"
        summary = "The uploaded file has weak or conflicting integrity signals. This does not establish manipulation; verify it with the original source."
    else:
        verdict = "No Strong Integrity Warnings Found"
        summary = "The file passed the available signature and metadata checks. This does not prove authenticity or rule out visual or audio manipulation."

    indicator_values = [
        ("File Signature Match", 100 - signature_score),
        ("Metadata Integrity", 100 - metadata_score),
        ("Container Structure", 100 - structure_score),
        ("Embedded Generator Markers", generator_score),
        ("Integrity Review Score", probability),
    ]
    indicators = [
        {
            "label": label,
            "value": value,
            "risk": _risk_name(100 - value if "Integrity" in label or "Match" in label or "Structure" in label else value),
            "color": _risk_color(100 - value if "Integrity" in label or "Match" in label or "Structure" in label else value),
        }
        for label, value in indicator_values
    ]

    dimension_value = f"{dimensions[0]} x {dimensions[1]}" if dimensions else "Unavailable"
    marker_value = ", ".join(markers) if markers else "None found"
    sha256 = hashlib.sha256(data).hexdigest()

    notes = []
    if not type_match:
        notes.append(f"declared {declared_type} but detected {detected_label}")
    if too_small:
        notes.append("file is too small for reliable visual/audio forensic analysis")
    if markers:
        notes.append(f"embedded generator markers found: {marker_value}")
    if not notes:
        notes.append("signature, container, and metadata checks did not expose strong synthetic markers")

    return {
        "analysisId": str(uuid4()),
        "score": probability,
        "verdict": verdict,
        "probabilityLabel": f"{probability}% Integrity Review Score",
        "probability": probability,
        "summary": summary,
        "indicators": indicators,
        "metadata": [
            {"label": "Filename", "value": filename},
            {"label": "Declared Type", "value": declared_type},
            {"label": "Browser MIME", "value": content_type or "Unavailable"},
            {"label": "Detected Type", "value": detected_label},
            {"label": "File Size", "value": _format_bytes(file_size)},
            {"label": "Dimensions", "value": dimension_value},
            {"label": "Synthetic Markers", "value": marker_value},
            {"label": "SHA-256", "value": sha256[:16] + "..."},
        ],
        "aiSummary": (
            "Heuristic file analysis inspected the upload signature, container metadata, dimensions, "
            f"size, hash, and embedded generator strings. Key findings: {'; '.join(notes)}. "
            "This check is deterministic and avoids fabricated forensic claims, but it is not a substitute "
            "for a dedicated ML deepfake model or provenance verification."
        ),
    }
