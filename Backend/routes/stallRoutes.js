const express = require("express");
const router = express.Router();

const {
  createStall,
  getAllStalls,
  getStallById,
  updateStall,
  deleteStall,
} = require("../Controllers/stallController");

// CRUD routes
router.post("/", createStall);
router.get("/", getAllStalls);
router.get("/:id", getStallById);
router.put("/:id", updateStall);
router.delete("/:id", deleteStall);

module.exports = router;