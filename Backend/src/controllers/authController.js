const authService = require("../services/authService");

async function login(context) {
  return {
    statusCode: 200,
    message: "Login successful.",
    data: await authService.login(context.body),
  };
}

async function me(context) {
  return {
    statusCode: 200,
    data: {
      user: authService.sanitizeUser(context.authUser),
    },
  };
}

async function logout(context) {
  await authService.logout(context.token);

  return {
    statusCode: 200,
    message: "Logged out successfully.",
  };
}

module.exports = {
  login,
  logout,
  me,
};
