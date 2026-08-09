const asyncHandler = require('express-async-handler');
const fs = require('fs');
const path = require('path');
const User = require('../models/User');

// @desc    Upload/replace the logged-in user's profile picture
// @route   POST /api/users/me/avatar
// @access  Private (any role)
const uploadAvatar = asyncHandler(async (req, res) => {
  if (!req.file) {
    res.status(400);
    throw new Error('No image file provided');
  }

  const user = await User.findById(req.user._id);

  // Clean up the old avatar file from disk, if one exists, before saving the new path.
  if (user.avatar) {
    const oldPath = path.join(__dirname, '..', user.avatar.replace(/^\/+/, ''));
    fs.unlink(oldPath, () => {}); // best-effort, ignore errors (e.g. file already gone)
  }

  user.avatar = `/uploads/avatars/${req.file.filename}`;
  await user.save();

  res.json({ success: true, data: { avatar: user.avatar } });
});

// @desc    Remove the logged-in user's profile picture
// @route   DELETE /api/users/me/avatar
// @access  Private (any role)
const deleteAvatar = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);
  if (user.avatar) {
    const oldPath = path.join(__dirname, '..', user.avatar.replace(/^\/+/, ''));
    fs.unlink(oldPath, () => {});
    user.avatar = '';
    await user.save();
  }
  res.json({ success: true, data: { avatar: '' } });
});

module.exports = { uploadAvatar, deleteAvatar };
