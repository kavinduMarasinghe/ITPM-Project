const path = require("path");
const { spawn } = require("child_process");

const { AppError } = require("../utils/errors");

const PYTHON_EXECUTABLE = process.env.PYTHON_EXECUTABLE || "python";
const RECOMMENDER_SCRIPT_PATH = path.resolve(
  __dirname,
  "../recommendation/event_recommender.py"
);
const DEFAULT_RECOMMENDATION_LIMIT = 4;
const RECOMMENDATION_TIMEOUT_MS = 10000;

function sortEventsByPopularity(events, popularStats = []) {
  const popularityMap = new Map(
    popularStats.map((stat, index) => [
      stat.eventId,
      {
        totalClicks: Number(stat.totalClicks || 0),
        rank: index,
      },
    ])
  );

  return [...events].sort((leftEvent, rightEvent) => {
    const leftPopularity = popularityMap.get(leftEvent.id) || {
      totalClicks: 0,
      rank: Number.MAX_SAFE_INTEGER,
    };
    const rightPopularity = popularityMap.get(rightEvent.id) || {
      totalClicks: 0,
      rank: Number.MAX_SAFE_INTEGER,
    };

    if (leftPopularity.totalClicks !== rightPopularity.totalClicks) {
      return rightPopularity.totalClicks - leftPopularity.totalClicks;
    }

    if (leftEvent.expectedAttendees !== rightEvent.expectedAttendees) {
      return Number(rightEvent.expectedAttendees || 0) - Number(leftEvent.expectedAttendees || 0);
    }

    const leftPublishedAt = new Date(leftEvent.publishedAt || leftEvent.startDate || 0).getTime();
    const rightPublishedAt = new Date(rightEvent.publishedAt || rightEvent.startDate || 0).getTime();

    if (leftPublishedAt !== rightPublishedAt) {
      return rightPublishedAt - leftPublishedAt;
    }

    return leftPopularity.rank - rightPopularity.rank;
  });
}

function buildPythonPayload(events, clickedEvents, popularEventIds, limit) {
  return {
    events: events.map((event) => ({
      id: event.id,
      eventTitle: event.eventTitle,
      eventType: event.eventType,
      eventSummary: event.eventSummary,
      eventDescription: event.eventDescription,
      organizationName: event.organizationName,
      venue: event.venue,
      venueType: event.venueType,
    })),
    clickedEvents: clickedEvents.map((interaction) => ({
      eventId: interaction.eventId,
      clickCount: Number(interaction.clickCount || 1),
    })),
    popularEventIds,
    limit,
  };
}

function runPythonRecommendation(payload) {
  return new Promise((resolve, reject) => {
    const childProcess = spawn(PYTHON_EXECUTABLE, [RECOMMENDER_SCRIPT_PATH], {
      cwd: path.dirname(RECOMMENDER_SCRIPT_PATH),
      windowsHide: true,
    });

    let standardOutput = "";
    let standardError = "";
    let hasCompleted = false;

    const timeout = setTimeout(() => {
      if (hasCompleted) {
        return;
      }

      hasCompleted = true;
      childProcess.kill();
      reject(new AppError(500, "Recommendation engine timed out."));
    }, RECOMMENDATION_TIMEOUT_MS);

    childProcess.stdout.on("data", (chunk) => {
      standardOutput += chunk.toString();
    });

    childProcess.stderr.on("data", (chunk) => {
      standardError += chunk.toString();
    });

    childProcess.on("error", (error) => {
      if (hasCompleted) {
        return;
      }

      hasCompleted = true;
      clearTimeout(timeout);
      reject(
        new AppError(
          500,
          "Unable to start the Python recommendation engine.",
          error.message
        )
      );
    });

    childProcess.on("close", (exitCode) => {
      if (hasCompleted) {
        return;
      }

      hasCompleted = true;
      clearTimeout(timeout);

      if (exitCode !== 0) {
        reject(
          new AppError(
            500,
            "Python recommendation engine failed.",
            standardError.trim() || `Exited with code ${exitCode}.`
          )
        );
        return;
      }

      try {
        resolve(JSON.parse(standardOutput || "{}"));
      } catch (error) {
        reject(
          new AppError(
            500,
            "Recommendation engine returned invalid JSON.",
            error.message
          )
        );
      }
    });

    childProcess.stdin.write(JSON.stringify(payload));
    childProcess.stdin.end();
  });
}

function dedupeIds(values) {
  const seen = new Set();
  const orderedIds = [];

  values.forEach((value) => {
    const normalizedValue = String(value || "").trim();

    if (!normalizedValue || seen.has(normalizedValue)) {
      return;
    }

    seen.add(normalizedValue);
    orderedIds.push(normalizedValue);
  });

  return orderedIds;
}

function buildRecommendationReasonLabel(detail) {
  switch (detail?.slotGroup) {
    case "top-category-new":
      return "Top category";
    case "top-category-history":
      return "Top category history";
    case "other-category-new":
      return "Next category";
    case "other-category-history":
      return "Next category history";
    case "popular-history":
      return "Popular history";
    case "popular-new":
    default:
      return "Popular";
  }
}

class EventRecommendationService {
  async recommendEvents({ events, interactions, popularStats, limit = DEFAULT_RECOMMENDATION_LIMIT }) {
    const safeLimit = Math.max(1, Number(limit) || DEFAULT_RECOMMENDATION_LIMIT);
    const publishedEvents = Array.isArray(events) ? events : [];
    const eventMap = new Map(publishedEvents.map((event) => [event.id, event]));
    const clickedEvents = (Array.isArray(interactions) ? interactions : []).filter((interaction) =>
      eventMap.has(interaction.eventId)
    );
    const clickedEventIds = dedupeIds(clickedEvents.map((interaction) => interaction.eventId));
    const popularEventIds = sortEventsByPopularity(publishedEvents, popularStats).map(
      (event) => event.id
    );

    let recommendationResult;

    try {
      recommendationResult = await runPythonRecommendation(
        buildPythonPayload(publishedEvents, clickedEvents, popularEventIds, safeLimit)
      );
    } catch (error) {
      recommendationResult = {
        recommendedEventIds: popularEventIds,
        source: "popular",
        scores: {},
        details: {},
        primaryCategory: null,
        categoryPriorities: [],
      };
    }

    const recommendedEventIds = dedupeIds([
      ...(recommendationResult.recommendedEventIds || []),
      ...popularEventIds,
    ]);

    return {
      source:
        recommendationResult.source ||
        (clickedEventIds.length > 0 ? "personalized" : "popular"),
      clickedEventIds,
      primaryCategory: recommendationResult.primaryCategory || null,
      categoryPriorities: Array.isArray(recommendationResult.categoryPriorities)
        ? recommendationResult.categoryPriorities
        : [],
      events: recommendedEventIds
        .slice(0, safeLimit)
        .map((eventId) => {
          const event = eventMap.get(eventId);
          const detail = recommendationResult.details?.[eventId] || null;

          if (!event) {
            return null;
          }

          return {
            ...event,
            recommendationScore:
              typeof recommendationResult.scores?.[eventId] === "number"
                ? recommendationResult.scores[eventId]
                : null,
            recommendationGroup: detail?.slotGroup || "popular-new",
            recommendationCategory: detail?.category || event.eventType || "General",
            recommendationCategoryRank:
              typeof detail?.categoryRank === "number" ? detail.categoryRank : null,
            recommendationFromHistory: Boolean(detail?.fromHistory),
            recommendationReasonLabel: buildRecommendationReasonLabel(detail),
          };
        })
        .filter(Boolean),
    };
  }
}

module.exports = new EventRecommendationService();
