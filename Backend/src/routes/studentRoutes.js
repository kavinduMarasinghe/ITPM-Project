const studentController = require("../controllers/studentController");

module.exports = [
  {
    method: "POST",
    path: "/api/students/register",
    handler: studentController.registerStudent,
  },
];
