const express = require("express");
const router = express.Router();

const {
  getEventMessages,
  getCommunityMessages,
  sendMessage,
} = require("../controllers/chatControllerg");

router.get("/event/:eventId", getEventMessages);
router.get("/community/:communityId", getCommunityMessages);
router.post("/", sendMessage);

module.exports = router;