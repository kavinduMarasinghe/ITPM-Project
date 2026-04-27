const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  username: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  password: {
    type: String,
    required: true
  },
  role: {
    type: String,
    enum: ['admin', 'vendor', 'student', 'hod', 'organizer'],
    default: 'vendor'
  },
  studentId: { type: String, trim: true, sparse: true, index: true },
  phone: { type: String, trim: true },
  department: { type: String, trim: true },
  year: { type: String, trim: true },
  semester: { type: String, trim: true },
  address: { type: String, trim: true },
  businessName: {
    type: String,
    trim: true
  },
  contactNumber: {
    type: String,
    trim: true
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('User', userSchema);