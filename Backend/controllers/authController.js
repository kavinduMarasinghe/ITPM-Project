const User = require('../models/userModel');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'eventaura_sliit_secret_2024';

// POST /api/auth/register
exports.register = async (req, res) => {
  try {
    const { name, email, username, password, role, businessName, contactNumber } = req.body;


    // Check if username or email already exists
    const existingUser = await User.findOne({ $or: [{ email }, { username }] });
    if (existingUser) {
      return res.status(400).json({ success: false, message: 'Email or username already in use.' });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create user
    const user = new User({
      name,
      email,
      username,
      password: hashedPassword,
      role: role || 'vendor',
      businessName,
      contactNumber
    });

    await user.save();

    // Generate token
    const token = jwt.sign(
      { id: user._id, username: user.username, name: user.name, role: user.role },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.status(201).json({
      success: true,
      message: 'Registration successful!',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        username: user.username,
        role: user.role,
        businessName: user.businessName,
        contactNumber: user.contactNumber
      }
    });
  } catch (err) {
    console.error('Register error:', err.stack || err);
    res.status(500).json({ success: false, message: 'Server error during registration.' });
  }
};

// POST /api/auth/login
exports.login = async (req, res) => {
  try {
    const { username, password } = req.body;

    // Find by username or email
    const user = await User.findOne({
      $or: [{ username: username.toLowerCase() }, { email: username.toLowerCase() }]
    });

    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid username or password.' });
    }

    // Compare password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid username or password.' });
    }

    // Generate token
    const token = jwt.sign(
      { id: user._id, username: user.username, name: user.name, role: user.role },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      success: true,
      message: 'Login successful!',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        username: user.username,
        role: user.role,
        businessName: user.businessName,
        contactNumber: user.contactNumber
      }
    });
  } catch (err) {
    console.error('Login error:', err.stack || err);
    res.status(500).json({ success: false, message: 'Server error during login.' });
  }
};
