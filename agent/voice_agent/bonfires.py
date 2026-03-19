"""Bonfires API client for querying Austin Griffith's bonfires graph.

The Bonfires platform provides a knowledge graph built from Austin's direct input
and curated public writing. The ``/delve`` endpoint is the primary search interface,
performing unified search across the knowledge graph via Graphiti.

Configuration is via environment variables:
    BONFIRES_API_KEY      – API key for authentication
    BONFIRES_BONFIRE_ID   – Austin's bonfire identifier
    BONFIRES_API_URL      – Base URL (default: https://tnt-v2-staging.api.bonfires.ai)
"""

from __future__ import annotations

import os

import httpx

from voice_agent.logger import get_logger

logger = get_logger()

BONFIRES_API_URL = os.environ.get(
    "BONFIRES_API_URL", "https://tnt-v2-staging.api.bonfires.ai"
)
BONFIRES_API_KEY = os.environ.get("BONFIRES_API_KEY", "")
BONFIRES_BONFIRE_ID = os.environ.get("BONFIRES_BONFIRE_ID", "")

# Timeout for API calls (seconds). Keep short to avoid blocking the voice conversation.
_REQUEST_TIMEOUT = 10.0

# Priming queries — fetched once at session start and injected into the system prompt
# so the agent has Austin's voice grounded from the very first message.
_PRIME_QUERIES = {
    "core": "Austin Griffith's core philosophy on building, open source, and Ethereum development",
    "excited": "Austin Griffith's enthusiastic approach to mentoring builders, rapid prototyping, and hackathons",
    "critical": "Austin Griffith's views on first-principles understanding, simplicity, and challenging builders to go deeper",
}


def is_configured() -> bool:
    """Return True if the required Bonfires env vars are set."""
    return bool(BONFIRES_API_KEY and BONFIRES_BONFIRE_ID)


def _auth_headers() -> dict[str, str]:
    """Build common auth/scoping headers."""
    return {
        "Authorization": f"Bearer {BONFIRES_API_KEY}",
        "x-bonfire-id": BONFIRES_BONFIRE_ID,
        "Content-Type": "application/json",
    }


# ---------------------------------------------------------------------------
# Session priming — fetch foundational context at conversation start
# ---------------------------------------------------------------------------


async def prime_context(mood: str = "excited") -> str:
    """Fetch Austin's core philosophy + mood-specific context from the graph.

    Called once at session start.  The result is injected into the system prompt
    so the agent is grounded in Austin's actual voice from the very first turn.

    Returns an empty string if the API is unreachable or not configured (the
    agent can still function via on-demand ``search_knowledge`` tool calls).
    """
    if not is_configured():
        logger.info("Bonfires not configured — skipping context priming")
        return ""

    queries = [_PRIME_QUERIES["core"], _PRIME_QUERIES.get(mood, "")]
    queries = [q for q in queries if q]

    parts: list[str] = []
    try:
        async with httpx.AsyncClient(timeout=_REQUEST_TIMEOUT) as client:
            for query in queries:
                response = await client.post(
                    f"{BONFIRES_API_URL}/delve",
                    json={
                        "bonfire_id": BONFIRES_BONFIRE_ID,
                        "query": query,
                    },
                    headers=_auth_headers(),
                )
                response.raise_for_status()
                data = response.json()
                formatted = _format_delve_results(data)
                if formatted and "No relevant results" not in formatted:
                    parts.append(formatted)
    except Exception as e:
        logger.warning("Context priming failed (agent will rely on tool calls): %s", e)
        return ""

    result = "\n\n".join(parts)
    if result:
        logger.info("Primed context from Bonfires (%d chars)", len(result))
    return result[:6000]  # Cap to keep system prompt reasonable


# ---------------------------------------------------------------------------
# /delve — unified knowledge graph search
# ---------------------------------------------------------------------------


async def delve(query: str) -> str:
    """Search Austin's knowledge graph via the Bonfires ``/delve`` endpoint.

    Returns a formatted text summary of the results suitable for LLM consumption.
    On failure, returns a short error note so the LLM can continue without crashing.
    """
    if not is_configured():
        return "Knowledge graph search is not configured. Respond based on your persona instructions."

    try:
        async with httpx.AsyncClient(timeout=_REQUEST_TIMEOUT) as client:
            response = await client.post(
                f"{BONFIRES_API_URL}/delve",
                json={
                    "bonfire_id": BONFIRES_BONFIRE_ID,
                    "query": query,
                },
                headers=_auth_headers(),
            )
            response.raise_for_status()
            data = response.json()
            logger.debug(
                "Bonfires /delve raw response keys: %s",
                list(data.keys()) if isinstance(data, dict) else type(data),
            )
            return _format_delve_results(data)
    except httpx.TimeoutException:
        logger.warning("Bonfires /delve timed out for query: %s", query)
        return "Knowledge search timed out. Respond based on your persona instructions."
    except Exception as e:
        logger.error("Bonfires /delve failed for query '%s': %s", query, e)
        return "Knowledge search temporarily unavailable. Respond based on your persona instructions."


# ---------------------------------------------------------------------------
# /vector_store/search — semantic content search
# ---------------------------------------------------------------------------


async def vector_search(query: str, limit: int = 5) -> str:
    """Search Austin's content chunks via Bonfires vector store.

    This is a more targeted content search (vs. the graph-based /delve) that
    returns specific text passages ranked by semantic similarity.
    """
    if not is_configured():
        return "Content search is not configured. Respond based on your persona instructions."

    try:
        async with httpx.AsyncClient(timeout=_REQUEST_TIMEOUT) as client:
            response = await client.post(
                f"{BONFIRES_API_URL}/vector_store/search",
                json={
                    "bonfire_id": BONFIRES_BONFIRE_ID,
                    "query": query,
                    "limit": limit,
                },
                headers=_auth_headers(),
            )
            response.raise_for_status()
            data = response.json()
            logger.debug(
                "Bonfires vector_search raw response keys: %s",
                list(data.keys()) if isinstance(data, dict) else type(data),
            )
            return _format_vector_results(data)
    except httpx.TimeoutException:
        logger.warning("Bonfires vector_search timed out for query: %s", query)
        return "Content search timed out. Respond based on your persona instructions."
    except Exception as e:
        logger.error("Bonfires vector_search failed for query '%s': %s", query, e)
        return "Content search temporarily unavailable. Respond based on your persona instructions."


# ---------------------------------------------------------------------------
# Response formatters
# ---------------------------------------------------------------------------
#
# The /delve response is a Graphiti knowledge graph with three key sections:
#
#   edges[]    — Single-sentence relationship facts (highest signal-to-noise).
#   entities[] — Named concepts/people with summaries. Labels include
#                "Entity", "TaxonomyLabel", "Update", "User".
#   episodes[] — Long narrative content blocks with a descriptive `name`.
#                The `content` field can be a string or a dict with
#                {name, content, updates[]}.
#
# Formatting priority: edges (concise facts) → entity summaries (key
# concepts) → episode names (topical context).  Full episode content is
# deliberately omitted — it's thousands of chars of third-party analysis
# that would bloat the context and cause third-person speech patterns.
# ---------------------------------------------------------------------------

# Entity labels to skip — community member profiles and granular action logs.
_SKIP_ENTITY_LABELS = {"User", "Update"}

# Max items per section to keep output tight for voice-conversation latency.
_MAX_EDGES = 15
_MAX_ENTITIES = 10
_MAX_EPISODES = 8

# Entities with names longer than this are likely update-descriptions,
# not real concept names (e.g. "Shared Austin Griffith's vision for...").
_MAX_ENTITY_NAME_LEN = 80


def _format_delve_results(data: dict | list) -> str:
    """Format /delve response into compact, LLM-optimised text.

    Returns a structured text block with three sections:
    1. **Facts** — concise edge relationships
    2. **Key Concepts** — entity summaries (filtered to high-signal)
    3. **Related Topics** — episode titles for topical breadth
    """
    if not isinstance(data, dict) or not data.get("success", True):
        return "No relevant results found."

    sections: list[str] = []

    # ----- 1. Edge facts (highest signal) -----
    edges = data.get("edges") or []
    facts = []
    for edge in edges[:_MAX_EDGES]:
        fact = edge.get("fact", "").strip()
        if fact:
            facts.append(f"- {fact}")
    if facts:
        sections.append("Facts:\n" + "\n".join(facts))

    # ----- 2. Entity summaries (key concepts) -----
    # Prioritise TaxonomyLabel entities (core concepts), then others.
    entities = data.get("entities") or []
    taxonomy_ents = []
    other_ents = []
    for ent in entities:
        labels = set(ent.get("labels") or [])
        if labels & _SKIP_ENTITY_LABELS:
            continue
        name = ent.get("name", "").strip()
        summary = ent.get("summary", "").strip()
        if not name or not summary or len(summary) < 20:
            continue
        # Skip entities whose "name" is really a long update description
        if len(name) > _MAX_ENTITY_NAME_LEN:
            continue
        if "TaxonomyLabel" in labels:
            taxonomy_ents.append(ent)
        else:
            other_ents.append(ent)

    # Sort non-taxonomy entities by name length — proper nouns ("Ethereum",
    # "BuidlGuidl") are shorter than descriptive phrases and more valuable.
    other_ents.sort(key=lambda e: len(e.get("name", "")))

    concepts = []
    for ent in (taxonomy_ents + other_ents)[:_MAX_ENTITIES]:
        name = ent["name"].strip()
        short = _first_sentences(ent["summary"].strip(), max_chars=200)
        concepts.append(f"- {name}: {short}")
    if concepts:
        sections.append("Key Concepts:\n" + "\n".join(concepts))

    # ----- 3. Episode titles (topical context) -----
    episodes = data.get("episodes") or []
    topics = []
    for ep in episodes[:_MAX_EPISODES]:
        name = ep.get("name", "").strip()
        # Skip auto-generated names like "episode:2025-09-28T..."
        if not name or name.startswith("episode:"):
            continue
        topics.append(f"- {name}")
    if topics:
        sections.append("Related Topics:\n" + "\n".join(topics))

    if not sections:
        return "No relevant results found."

    return "\n\n".join(sections)


def _format_vector_results(data: dict | list) -> str:
    """Format /vector_store/search response into LLM-readable text."""
    if not data:
        return "No relevant content found."

    parts: list[str] = []
    items = []
    if isinstance(data, dict):
        items = data.get("chunks") or data.get("results") or []
    elif isinstance(data, list):
        items = data

    for chunk in items[:8]:
        if isinstance(chunk, str):
            parts.append(f"- {chunk.strip()}")
        elif isinstance(chunk, dict):
            text = (
                chunk.get("text") or chunk.get("content") or chunk.get("summary") or ""
            )
            if isinstance(text, str) and text.strip():
                parts.append(f"- {_first_sentences(text.strip(), max_chars=300)}")

    return "\n".join(parts) if parts else "No relevant content found."


def _first_sentences(text: str, max_chars: int = 200) -> str:
    """Return the first sentence(s) of *text*, up to *max_chars*."""
    if len(text) <= max_chars:
        return text
    # Try to break at a sentence boundary
    for sep in (". ", ".\n", "; "):
        idx = text.find(sep, 60)  # at least 60 chars before breaking
        if 0 < idx < max_chars:
            return text[: idx + 1]
    # Fall back to a clean word break
    truncated = text[:max_chars]
    last_space = truncated.rfind(" ")
    if last_space > max_chars // 2:
        return truncated[:last_space] + "..."
    return truncated + "..."
