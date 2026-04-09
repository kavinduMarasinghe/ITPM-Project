const express = require("express");
const router = express.Router();

const {
  getCommunities,
  createCommunity,
  updateCommunity,
  deleteCommunity,
} = require("../controllers/communityControllerg");

const { protect } = require("../middleware/authMiddlewareg");

router.get("/", protect, getCommunities);
router.post("/", protect, createCommunity);
router.put("/:id", protect, updateCommunity);
router.delete("/:id", protect, deleteCommunity);

module.exports = router;