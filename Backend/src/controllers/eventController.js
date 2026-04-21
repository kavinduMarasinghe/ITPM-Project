const eventService = require("../services/eventService");

async function createEventRequest(context) {
  return {
    statusCode: 201,
    message: "Event request submitted for admin approval.",
    data: {
      event: await eventService.createEventRequest(context.body, context.authUser),
    },
  };
}

async function getOrganizerEvents(context) {
  return {
    statusCode: 200,
    data: {
      events: await eventService.getOrganizerEvents(context.authUser),
    },
  };
}

async function getAdminEvents() {
  return {
    statusCode: 200,
    data: {
      events: await eventService.getAdminEvents(),
    },
  };
}

async function getAdminEventStats() {
  return {
    statusCode: 200,
    data: {
      stats: await eventService.getEventStatsForAdmin(),
    },
  };
}

async function reviewEvent(context) {
  return {
    statusCode: 200,
    message: `Event request ${context.body.status}.`,
    data: {
      event: await eventService.reviewEvent(
        context.params.id,
        context.body,
        context.authUser
      ),
    },
  };
}

async function publishEvent(context) {
  return {
    statusCode: 200,
    message: "Event published successfully.",
    data: {
      event: await eventService.publishEvent(context.params.id, context.authUser),
    },
  };
}

async function cancelEvent(context) {
  return {
    statusCode: 200,
    message: "Event cancelled successfully.",
    data: {
      event: await eventService.cancelEvent(context.params.id, context.authUser),
    },
  };
}

async function deletePublishedEvent(context) {
  return {
    statusCode: 200,
    message: "Published event deleted successfully.",
    data: {
      event: await eventService.deletePublishedEvent(
        context.params.id,
        context.authUser
      ),
    },
  };
}

async function getPublishedEvents() {
  return {
    statusCode: 200,
    data: {
      events: await eventService.getPublishedEvents(),
    },
  };
}

async function trackEventClick(context) {
  return {
    statusCode: 200,
    message: "Event click recorded.",
    data: {
      interaction: await eventService.trackStudentEventClick(
        context.params.id,
        context.authUser
      ),
    },
  };
}

async function getRecommendedEvents(context) {
  const requestedLimit = Number(context.query.limit || 4);

  return {
    statusCode: 200,
    data: await eventService.getRecommendedEventsForStudent(
      context.authUser,
      requestedLimit
    ),
  };
}

module.exports = {
  cancelEvent,
  createEventRequest,
  deletePublishedEvent,
  getAdminEvents,
  getAdminEventStats,
  getOrganizerEvents,
  getPublishedEvents,
  getRecommendedEvents,
  publishEvent,
  reviewEvent,
  trackEventClick,
};
