const express = require("express");
const router = express.Router();

const {
  registerUser,
  loginUser,
  getMe,
  getUsers,
} = require("../controllers/authControllerg");

const { protect } = require("../middleware/authMiddlewareg");

router.post("/register", registerUser);
router.post("/login", loginUser);
router.get("/me", protect, getMe);
router.get("/users", protect, getUsers);

module.exports = router;