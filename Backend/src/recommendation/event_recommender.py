import json
import math
import re
import sys
from collections import Counter, defaultdict

TOKEN_PATTERN = re.compile(r"[a-z0-9]+")
TEXT_FIELDS = (
    "eventTitle",
    "eventSummary",
    "eventDescription",
    "organizationName",
    "venue",
)
CATEGORICAL_FIELDS = (
    "eventType",
    "venueType",
    "organizationName",
)


def normalize_text(value):
    return str(value or "").strip().lower()


def normalize_category(value):
    normalized = normalize_text(value)
    return normalized or "general"


def tokenize(*parts):
    tokens = []
    for part in parts:
        tokens.extend(TOKEN_PATTERN.findall(normalize_text(part)))
    return tokens


def coerce_click_count(value):
    try:
        return max(float(value), 1.0)
    except (TypeError, ValueError):
        return 1.0


def build_idf(documents):
    document_frequency = Counter()
    for tokens in documents:
        document_frequency.update(set(tokens))

    total_documents = max(len(documents), 1)
    return {
        term: math.log((1 + total_documents) / (1 + frequency)) + 1.0
        for term, frequency in document_frequency.items()
    }


def normalize_vector(vector):
    norm = math.sqrt(sum(value * value for value in vector.values()))
    if norm == 0:
        return {}
    return {
        key: value / norm
        for key, value in vector.items()
        if value
    }


def build_tfidf_vector(event, idf_lookup):
    tokens = tokenize(*(event.get(field, "") for field in TEXT_FIELDS))
    if not tokens:
        return {}

    token_counts = Counter(tokens)
    token_total = sum(token_counts.values()) or 1
    vector = {}

    for token, count in token_counts.items():
        vector[f"text::{token}"] = (count / token_total) * idf_lookup.get(token, 1.0)

    return vector


def build_one_hot_vector(event):
    vector = {}
    for field in CATEGORICAL_FIELDS:
        value = normalize_text(event.get(field))
        if value:
            vector[f"cat::{field}::{value}"] = 1.0
    return vector


def merge_vectors(*vectors):
    merged = defaultdict(float)
    for vector in vectors:
        for key, value in vector.items():
            merged[key] += float(value)
    return normalize_vector(dict(merged))


def cosine_similarity(left_vector, right_vector):
    if not left_vector or not right_vector:
        return 0.0

    if len(left_vector) > len(right_vector):
        left_vector, right_vector = right_vector, left_vector

    return sum(value * right_vector.get(key, 0.0) for key, value in left_vector.items())


def build_event_vectors(events):
    documents = [
        tokenize(*(event.get(field, "") for field in TEXT_FIELDS))
        for event in events
    ]
    idf_lookup = build_idf(documents)

    vectors = {}
    for event in events:
        vectors[event["id"]] = merge_vectors(
            build_tfidf_vector(event, idf_lookup),
            build_one_hot_vector(event),
        )
    return vectors


def build_student_profile(event_vectors, clicked_events):
    weighted_vector = defaultdict(float)
    total_weight = 0.0

    for clicked_event in clicked_events:
        event_id = str(clicked_event.get("eventId") or "").strip()
        if not event_id or event_id not in event_vectors:
            continue

        weight = coerce_click_count(clicked_event.get("clickCount", 1))
        for key, value in event_vectors[event_id].items():
            weighted_vector[key] += value * weight
        total_weight += weight

    if total_weight == 0:
        return {}

    averaged_vector = {
        key: value / total_weight
        for key, value in weighted_vector.items()
    }

    return normalize_vector(averaged_vector)


def dedupe_preserve_order(values):
    seen = set()
    ordered = []

    for value in values:
        normalized = str(value or "").strip()
        if not normalized or normalized in seen:
            continue
        seen.add(normalized)
        ordered.append(normalized)

    return ordered


def build_click_context(events, clicked_events):
    event_lookup = {
        str(event.get("id") or "").strip(): event
        for event in events
        if str(event.get("id") or "").strip()
    }
    clicked_event_ids = []
    clicked_event_weights = {}
    category_weights = Counter()
    category_labels = {}

    for clicked_event in clicked_events:
        event_id = str(clicked_event.get("eventId") or "").strip()
        event = event_lookup.get(event_id)
        if not event or event_id in clicked_event_weights:
            continue

        click_count = coerce_click_count(clicked_event.get("clickCount", 1))
        category_key = normalize_category(event.get("eventType"))
        category_label = str(event.get("eventType") or "General").strip() or "General"

        clicked_event_ids.append(event_id)
        clicked_event_weights[event_id] = click_count
        category_weights[category_key] += click_count
        category_labels[category_key] = category_label

    category_priority = sorted(
        category_weights.items(),
        key=lambda item: (-item[1], item[0]),
    )

    return {
        "clicked_event_ids": clicked_event_ids,
        "clicked_event_weights": clicked_event_weights,
        "category_weights": category_weights,
        "category_labels": category_labels,
        "category_priority": category_priority,
    }


def build_candidate_lists(events, similarity_scores, click_context, popular_event_ids):
    popularity_rank = {
        event_id: index
        for index, event_id in enumerate(popular_event_ids)
    }
    category_weights = click_context["category_weights"]
    category_labels = click_context["category_labels"]
    clicked_event_weights = click_context["clicked_event_weights"]
    max_category_weight = max(category_weights.values(), default=0.0)
    max_click_count = max(clicked_event_weights.values(), default=0.0)

    unseen_by_category = defaultdict(list)
    clicked_by_category = defaultdict(list)
    candidate_lookup = {}

    for event in events:
        event_id = event["id"]
        category_key = normalize_category(event.get("eventType"))
        category_label = str(event.get("eventType") or category_labels.get(category_key) or "General")
        similarity_score = float(similarity_scores.get(event_id, 0.0))
        category_weight = float(category_weights.get(category_key, 0.0))
        category_boost = category_weight / max_category_weight if max_category_weight else 0.0
        click_count = float(clicked_event_weights.get(event_id, 0.0))
        history_boost = click_count / max_click_count if max_click_count else 0.0
        weighted_score = similarity_score + (category_boost * 0.35) + (history_boost * 0.1)

        candidate = {
            "id": event_id,
            "category_key": category_key,
            "category_label": category_label,
            "similarity_score": similarity_score,
            "weighted_score": weighted_score,
            "click_count": click_count,
            "popularity_rank": popularity_rank.get(event_id, sys.maxsize),
        }
        candidate_lookup[event_id] = candidate

        target_bucket = clicked_by_category if click_count > 0 else unseen_by_category
        target_bucket[category_key].append(candidate)

    for category_key in set(unseen_by_category.keys()) | set(clicked_by_category.keys()):
        unseen_by_category[category_key].sort(
            key=lambda candidate: (
                -candidate["weighted_score"],
                -candidate["similarity_score"],
                candidate["popularity_rank"],
                candidate["id"],
            )
        )
        clicked_by_category[category_key].sort(
            key=lambda candidate: (
                -candidate["click_count"],
                -candidate["weighted_score"],
                candidate["popularity_rank"],
                candidate["id"],
            )
        )

    return {
        "candidate_lookup": candidate_lookup,
        "unseen_by_category": unseen_by_category,
        "clicked_by_category": clicked_by_category,
    }


def add_candidate(result_ids, result_details, selected_ids, candidate, slot_group, category_rank):
    event_id = candidate["id"]
    if event_id in selected_ids:
        return False

    selected_ids.add(event_id)
    result_ids.append(event_id)
    result_details[event_id] = {
        "slotGroup": slot_group,
        "categoryRank": category_rank,
        "category": candidate["category_label"],
        "fromHistory": candidate["click_count"] > 0,
    }
    return True


def take_from_category(result_ids, result_details, selected_ids, candidates, count, slot_group, category_rank):
    added = 0
    for candidate in candidates:
        if added >= count:
            break
        if add_candidate(result_ids, result_details, selected_ids, candidate, slot_group, category_rank):
            added += 1
    return added


def cycle_categories(result_ids, result_details, selected_ids, category_order, buckets, limit, slot_group):
    if not category_order:
        return

    while len(result_ids) < limit:
        added_in_cycle = False
        for category_rank, category_key in category_order:
            if len(result_ids) >= limit:
                break
            added = take_from_category(
                result_ids,
                result_details,
                selected_ids,
                buckets.get(category_key, []),
                1,
                slot_group,
                category_rank,
            )
            if added:
                added_in_cycle = True
        if not added_in_cycle:
            break


def append_popular_fallback(result_ids, result_details, selected_ids, popular_event_ids, candidate_lookup, limit):
    for event_id in popular_event_ids:
        if len(result_ids) >= limit:
            break
        candidate = candidate_lookup.get(event_id)
        if not candidate:
            continue

        slot_group = "popular-history" if candidate["click_count"] > 0 else "popular-new"
        add_candidate(result_ids, result_details, selected_ids, candidate, slot_group, sys.maxsize)


def rank_events(events, clicked_events, popular_event_ids, limit):
    safe_limit = max(int(limit or 1), 1)
    event_vectors = build_event_vectors(events)
    popular_event_ids = dedupe_preserve_order(popular_event_ids)
    click_context = build_click_context(events, clicked_events)
    clicked_event_ids = click_context["clicked_event_ids"]

    if not clicked_event_ids:
        fallback_ids = [
            event_id
            for event_id in popular_event_ids
            if event_id in event_vectors
        ][:safe_limit]
        return {
            "recommended_ids": fallback_ids,
            "source": "popular",
            "scores": {},
            "details": {
                event_id: {
                    "slotGroup": "popular-new",
                    "categoryRank": sys.maxsize,
                    "category": str(
                        next(
                            (
                                event.get("eventType") or "General"
                                for event in events
                                if event["id"] == event_id
                            ),
                            "General",
                        )
                    ),
                    "fromHistory": False,
                }
                for event_id in fallback_ids
            },
            "primary_category": None,
            "category_priorities": [],
        }

    similarity_scores = {}
    profile_vector = build_student_profile(event_vectors, clicked_events)

    for event in events:
        event_id = event["id"]
        similarity_scores[event_id] = cosine_similarity(
            profile_vector,
            event_vectors.get(event_id, {}),
        )

    candidate_lists = build_candidate_lists(events, similarity_scores, click_context, popular_event_ids)
    unseen_by_category = candidate_lists["unseen_by_category"]
    clicked_by_category = candidate_lists["clicked_by_category"]
    candidate_lookup = candidate_lists["candidate_lookup"]
    category_priority = click_context["category_priority"]
    category_labels = click_context["category_labels"]

    selected_ids = set()
    result_ids = []
    result_details = {}

    primary_category = category_priority[0][0]
    primary_category_rank = 1
    primary_unseen_added = take_from_category(
        result_ids,
        result_details,
        selected_ids,
        unseen_by_category.get(primary_category, []),
        2,
        "top-category-new",
        primary_category_rank,
    )
    if primary_unseen_added < 2:
        take_from_category(
            result_ids,
            result_details,
            selected_ids,
            clicked_by_category.get(primary_category, []),
            2 - primary_unseen_added,
            "top-category-history",
            primary_category_rank,
        )

    secondary_order = [
        (index + 1, category_key)
        for index, (category_key, _weight) in enumerate(category_priority[1:], start=1)
    ]

    cycle_categories(
        result_ids,
        result_details,
        selected_ids,
        secondary_order,
        unseen_by_category,
        safe_limit,
        "other-category-new",
    )
    cycle_categories(
        result_ids,
        result_details,
        selected_ids,
        secondary_order,
        clicked_by_category,
        safe_limit,
        "other-category-history",
    )

    if len(result_ids) < safe_limit:
        take_from_category(
            result_ids,
            result_details,
            selected_ids,
            unseen_by_category.get(primary_category, []),
            safe_limit - len(result_ids),
            "top-category-new",
            primary_category_rank,
        )

    if len(result_ids) < safe_limit:
        take_from_category(
            result_ids,
            result_details,
            selected_ids,
            clicked_by_category.get(primary_category, []),
            safe_limit - len(result_ids),
            "top-category-history",
            primary_category_rank,
        )

    append_popular_fallback(
        result_ids,
        result_details,
        selected_ids,
        popular_event_ids,
        candidate_lookup,
        safe_limit,
    )

    return {
        "recommended_ids": result_ids[:safe_limit],
        "source": "personalized",
        "scores": {
            event_id: round(candidate_lookup[event_id]["weighted_score"], 6)
            for event_id in result_ids[:safe_limit]
            if event_id in candidate_lookup
        },
        "details": result_details,
        "primary_category": category_labels.get(primary_category, "General"),
        "category_priorities": [
            {
                "category": category_labels.get(category_key, "General"),
                "weight": round(weight, 4),
            }
            for category_key, weight in category_priority
        ],
    }


def main():
    raw_payload = sys.stdin.read().strip()
    if not raw_payload:
        raise ValueError("Missing JSON payload.")

    payload = json.loads(raw_payload)
    events = payload.get("events") or []
    clicked_events = payload.get("clickedEvents") or []
    popular_event_ids = payload.get("popularEventIds") or []
    limit = payload.get("limit", 4)

    event_lookup = {
        str(event.get("id") or "").strip(): event
        for event in events
        if str(event.get("id") or "").strip()
    }

    ranking = rank_events(
        list(event_lookup.values()),
        clicked_events,
        popular_event_ids,
        limit,
    )

    response = {
        "recommendedEventIds": [
            event_id
            for event_id in ranking["recommended_ids"]
            if event_id in event_lookup
        ],
        "source": ranking["source"],
        "scores": ranking["scores"],
        "details": ranking["details"],
        "primaryCategory": ranking["primary_category"],
        "categoryPriorities": ranking["category_priorities"],
    }
    sys.stdout.write(json.dumps(response))


if __name__ == "__main__":
    try:
        main()
    except Exception as error:
        sys.stderr.write(str(error))
        sys.exit(1)
