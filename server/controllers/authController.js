const asyncHandler = require('express-async-handler');
const User = require('../models/User');
const Student = require('../models/Student');
const Teacher = require('../models/Teacher');
const generateToken = require('../utils/generateToken');

// @desc    Register a new user (admin creates teachers/students in practice,
//          but public signup is supported for demo/portfolio purposes)
// @route   POST /api/auth/signup
// @access  Public
const signup = asyncHandler(async (req, res) => {
  const { name, email, password, role, profile } = req.body;

  if (!name || !email || !password || !role) {
    res.status(400);
    throw new Error('Name, email, password and role are required');
  }

  const userExists = await User.findOne({ email });
  if (userExists) {
    res.status(400);
    throw new Error('A user with this email already exists');
  }

  const user = await User.create({ name, email, password, role });

  // Create the role-specific profile alongside the account.
  if (role === 'student') {
    await Student.create({
      user: user._id,
      rollNumber: profile?.rollNumber,
      department: profile?.department,
      course: profile?.course,
      semester: profile?.semester || 1,
      section: profile?.section || 'A',
      admissionYear: profile?.admissionYear || new Date().getFullYear(),
    });
  } else if (role === 'teacher') {
    await Teacher.create({
      user: user._id,
      employeeId: profile?.employeeId,
      department: profile?.department,
      designation: profile?.designation,
    });
  }

  res.status(201).json({
    success: true,
    token: generateToken(user._id, user.role),
    user: { id: user._id, name: user.name, email: user.email, role: user.role },
  });
});

// @desc    Authenticate user & return token
// @route   POST /api/auth/login
// @access  Public
const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email }).select('+password');
  if (!user || !(await user.matchPassword(password))) {
    res.status(401);
    throw new Error('Invalid email or password');
  }
  if (!user.isActive) {
    res.status(403);
    throw new Error('This account has been deactivated');
  }

  res.json({
    success: true,
    token: generateToken(user._id, user.role),
    user: { id: user._id, name: user.name, email: user.email, role: user.role },
  });
});

// @desc    Get the logged-in user's own account info
// @route   GET /api/auth/me
// @access  Private
const getMe = asyncHandler(async (req, res) => {
  res.json({ success: true, user: req.user });
});

module.exports = { signup, login, getMe };
