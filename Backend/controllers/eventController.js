const Event = require('../models/eventModel');

exports.getPublishedEvents = async (req, res) => {
  try {
    const events = await Event.find({ status: 'published' })
      .sort({ startDate: 1 })
      .lean();

    res.json({ success: true, data: events });
  } catch (err) {
    console.error('Get published events error:', err.stack || err);
    res.status(500).json({ success: false, message: 'Failed to fetch events.' });
  }
};
