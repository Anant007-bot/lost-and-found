"""Attribute-based matching engine (v1).

Each attribute that BOTH reports have filled in contributes a weighted similarity.
Missing attributes are skipped and the score is re-normalised, so a found item with
"Brand: Unknown" is not penalised, it just has less evidence.
Category must match, otherwise the score is 0.
"""
import re
from datetime import datetime

WEIGHTS = {"color": 20, "brand": 15, "location": 20, "time": 15, "description": 15}
CATEGORY_WEIGHT = 15
MATCH_THRESHOLD = 55.0  # percent

COLOR_GROUPS = [{"grey", "gray", "silver"}, {"black", "dark"}, {"white", "cream"}]


def _norm(s):
    return (s or "").strip().lower()


def _tokens(s):
    return set(re.findall(r"[a-z0-9]+", _norm(s))) - {"a", "the", "and", "with", "of", "is", "in", "on"}


def _color_sim(a, b):
    ta, tb = _tokens(a), _tokens(b)   # handles "Black/Grey"
    if ta & tb:
        return 1.0
    for g in COLOR_GROUPS:
        if ta & g and tb & g:
            return 0.8
    return 0.0


def _time_sim(lost_time: datetime, found_time: datetime):
    hours = (found_time - lost_time).total_seconds() / 3600
    if hours < -2:          # found well before it was lost: unlikely
        return 0.0
    hours = abs(hours)
    if hours <= 3:
        return 1.0
    if hours >= 72:
        return 0.0
    return 1.0 - (hours - 3) / 69


def _jaccard(a, b):
    ta, tb = _tokens(a), _tokens(b)
    return len(ta & tb) / len(ta | tb) if ta | tb else 0.0


def score_pair(lost, found) -> float:
    """Return a 0-100 match score between a lost report and a found report."""
    if _norm(lost.category) != _norm(found.category):
        return 0.0

    earned, possible = CATEGORY_WEIGHT, CATEGORY_WEIGHT

    if _norm(lost.color) and _norm(found.color):
        earned += WEIGHTS["color"] * _color_sim(lost.color, found.color)
        possible += WEIGHTS["color"]
    if _norm(lost.brand) and _norm(found.brand) and "unknown" not in (_norm(lost.brand), _norm(found.brand)):
        earned += WEIGHTS["brand"] * (1.0 if _norm(lost.brand) == _norm(found.brand) else 0.0)
        possible += WEIGHTS["brand"]
    if _norm(lost.location) and _norm(found.location):
        earned += WEIGHTS["location"] * (1.0 if _norm(lost.location) == _norm(found.location) else 0.0)
        possible += WEIGHTS["location"]
    earned += WEIGHTS["time"] * _time_sim(lost.event_time, found.event_time)
    possible += WEIGHTS["time"]
    if _norm(lost.description) and _norm(found.description):
        earned += WEIGHTS["description"] * min(1.0, _jaccard(lost.description, found.description) * 3)
        possible += WEIGHTS["description"]

    return round(100 * earned / possible, 1)
