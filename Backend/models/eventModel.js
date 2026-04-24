const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema(
  {},
  {
    collection: 'events',
    strict: false,
    versionKey: false,
  }
);

module.exports =
  mongoose.models.EventReadOnly || mongoose.model('EventReadOnly', eventSchema);
