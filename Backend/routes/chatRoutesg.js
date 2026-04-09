const express = require("express");
const router = express.Router();

const { protect } = require("../middleware/authMiddlewareg");
const {
  getEventMessages,
  getCommunityMessages,
  sendMessage,
} = require("../controllers/chatControllerg");

router.get("/event/:eventId", protect, getEventMessages);
router.get("/community/:communityId", protect, getCommunityMessages);
router.post("/", protect, sendMessage);

module.exports = router;