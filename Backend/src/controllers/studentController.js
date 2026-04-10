const authService = require("../services/authService");
const studentService = require("../services/studentService");

async function registerStudent(context) {
  const user = await studentService.registerStudent(context.body);

  return {
    statusCode: 201,
    message: "Student account created successfully.",
    data: await authService.createAuthenticatedSession(user),
  };
}

module.exports = {
  registerStudent,
};
