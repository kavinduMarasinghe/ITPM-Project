function getHealth() {
  return {
    statusCode: 200,
    message: "EventAura backend is running.",
    data: {
      status: "ok",
    },
  };
}

module.exports = {
  getHealth,
};
