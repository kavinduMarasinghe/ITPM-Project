const express = require("express");
const router = express.Router();

const {
  getCommunities,
  createCommunity,
  updateCommunity,
  deleteCommunity,
} = require("../controllers/communityControllerg");

router.get("/", getCommunities);
router.post("/", createCommunity);
router.put("/:id", updateCommunity);
router.delete("/:id", deleteCommunity);

module.exports = router;