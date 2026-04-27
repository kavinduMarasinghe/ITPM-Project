const Stall = require("../models/stallModel");
const StallBooking = require("../models/stallBookingModel");

// Helper function to lazily release expired reservations
const releaseExpiredStalls = async () => {
  const now = new Date();
  
  // Find stalls that are Reserved but reservedUntil has passed
  const expiredStalls = await Stall.find({
      status: "Reserved",
      reservedUntil: { $lt: now }
  });

  for (let stall of expiredStalls) {
      stall.status = "Available";
      stall.reservedUntil = null;
      await stall.save();

      // Also update matching bookings to "Rejected"
      await StallBooking.updateMany(
          { stallId: stall._id, status: "Pending" },
          { $set: { status: "Rejected", notes: "System auto-cancelled: Reservation Expired due to no confirmation within 15 minutes." } }
      );
  }
};

// Create new stall
const createStall = async (req, res) => {
  try {
    const stall = new Stall(req.body);
    const savedStall = await stall.save();
    res.status(201).json({
      success: true,
      message: "Stall created successfully",
      data: savedStall,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error creating stall",
      error: error.message,
    });
  }
};

// Get all stalls
const getAllStalls = async (req, res) => {
  try {
    // Run lazy expiry check before returning list of stalls
    await releaseExpiredStalls();

    const stalls = await Stall.find();
    res.status(200).json({
      success: true,
      count: stalls.length,
      data: stalls,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching stalls",
      error: error.message,
    });
  }
};

// Get single stall by ID
const getStallById = async (req, res) => {
  try {
    const stall = await Stall.findById(req.params.id);

    if (!stall) {
      return res.status(404).json({
        success: false,
        message: "Stall not found",
      });
    }

    res.status(200).json({
      success: true,
      data: stall,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching stall",
      error: error.message,
    });
  }
};

// Update stall
const updateStall = async (req, res) => {
  try {
    const updatedStall = await Stall.findByIdAndUpdate(
      req.params.id,
      req.body,
      { returnDocument: 'after', runValidators: true }
    );

    if (!updatedStall) {
      return res.status(404).json({
        success: false,
        message: "Stall not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Stall updated successfully",
      data: updatedStall,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error updating stall",
      error: error.message,
    });
  }
};

// Delete stall
const deleteStall = async (req, res) => {
  try {
    const deletedStall = await Stall.findByIdAndDelete(req.params.id);

    if (!deletedStall) {
      return res.status(404).json({
        success: false,
        message: "Stall not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Stall deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error deleting stall",
      error: error.message,
    });
  }
};

// Get stall statistics
const getStallStats = async (req, res) => {
  try {
    const stalls = await Stall.find();
    
    const stats = {
      totalStalls: stalls.length,
      available: stalls.filter(s => s.status === "Available").length,
      reserved: stalls.filter(s => s.status === "Reserved").length,
      booked: stalls.filter(s => s.status === "Booked").length,
      totalRevenue: stalls
        .filter(s => s.status === "Booked")
        .reduce((sum, s) => sum + (s.price || 0), 0)
    };

    res.status(200).json({
      success: true,
      data: stats,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching stall statistics",
      error: error.message,
    });
  }
};

module.exports = {
  createStall,
  getAllStalls,
  getStallById,
  updateStall,
  deleteStall,
  getStallStats,
};