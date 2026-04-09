const organizerService = require("../services/organizerService");

async function registerOrganizer(context) {
  return {
    statusCode: 201,
    message: "Organizer registration submitted. Please wait for Head Organizer approval.",
    data: await organizerService.registerOrganizer(context.body),
  };
}

async function getOrganizers() {
  return {
    statusCode: 200,
    data: {
      organizers: await organizerService.getOrganizerApplications(),
    },
  };
}

async function getOrganizerStats() {
  return {
    statusCode: 200,
    data: {
      stats: await organizerService.getOrganizerStats(),
    },
  };
}

async function getOrganizerById(context) {
  return {
    statusCode: 200,
    data: {
      organizer: await organizerService.getOrganizerById(context.params.id),
    },
  };
}

async function updateOrganizerStatus(context) {
  return {
    statusCode: 200,
    message: `Organizer application ${context.body.status}.`,
    data: {
      organizer: await organizerService.updateOrganizerStatus(
        context.params.id,
        context.body.status,
        context.body.notes,
        context.authUser
      ),
    },
  };
}

module.exports = {
  getOrganizerById,
  getOrganizers,
  getOrganizerStats,
  registerOrganizer,
  updateOrganizerStatus,
};
