const User = require('../models/userModel');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'eventaura_sliit_secret_2024';

exports.register = async (req, res) => {
  try {
    const {
      fullName,
      studentId,
      email,
      phone,
      department,
      year,
      semester,
      address,
      password,
    } = req.body;

    if (!fullName || !studentId || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Full name, student ID, email, and password are required.',
      });
    }

    const normalizedEmail = email.trim().toLowerCase();
    const normalizedStudentId = studentId.trim().toUpperCase();
    const username = normalizedStudentId.toLowerCase();

    const existing = await User.findOne({
      $or: [{ email: normalizedEmail }, { username }, { studentId: normalizedStudentId }],
    });
    if (existing) {
      return res.status(400).json({
        success: false,
        message: 'A student with that email or student ID already exists.',
      });
    }

    const hashed = await bcrypt.hash(password, 10);

    const user = await User.create({
      name: fullName,
      email: normalizedEmail,
      username,
      password: hashed,
      role: 'student',
      studentId: normalizedStudentId,
      phone,
      department,
      year,
      semester,
      address,
    });

    const token = jwt.sign(
      { id: user._id, username: user.username, name: user.name, role: user.role },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.status(201).json({
      success: true,
      message: 'Student registered successfully.',
      data: {
        token,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          username: user.username,
          role: user.role,
          studentId: user.studentId,
          department: user.department,
          year: user.year,
          semester: user.semester,
        },
      },
    });
  } catch (err) {
    console.error('Student register error:', err.stack || err);
    res.status(500).json({ success: false, message: 'Server error during registration.' });
  }
};
