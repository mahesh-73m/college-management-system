const asyncHandler = require('express-async-handler');
const Announcement = require('../models/Announcement');
const User = require('../models/User');
const sendEmail = require('../utils/sendEmail');

// @desc    Create an announcement
// @route   POST /api/announcements
// @access  Private (admin, teacher)
const createAnnouncement = asyncHandler(async (req, res) => {
  const { title, message, audience } = req.body;
  const announcement = await Announcement.create({
    title,
    message,
    audience: audience || 'all',
    postedBy: req.user._id,
  });

  res.status(201).json({ success: true, data: announcement });

  // Notify the target audience by email in the background — this must
  // never block or fail the API response, so it runs after res.json()
  // and any error is only logged (sendEmail itself already swallows errors).
  const roleFilter =
    announcement.audience === 'students' ? ['student'] : announcement.audience === 'teachers' ? ['teacher'] : ['student', 'teacher'];
  const recipients = await User.find({ role: { $in: roleFilter }, isActive: true }).select('email');
  if (recipients.length) {
    const bcc = recipients.map((r) => r.email);
    sendEmail({
      to: bcc.join(','),
      subject: `New Announcement: ${title}`,
      text: message,
      html: `<h2>${title}</h2><p>${message}</p>`,
    });
  }
});

// @desc    List announcements relevant to the logged-in user's role
// @route   GET /api/announcements
// @access  Private
const getAnnouncements = asyncHandler(async (req, res) => {
  const role = req.user.role; // 'admin' | 'teacher' | 'student'
  const audienceFilter =
    role === 'student' ? ['all', 'students'] : role === 'teacher' ? ['all', 'teachers'] : ['all', 'students', 'teachers'];

  const announcements = await Announcement.find({ audience: { $in: audienceFilter } })
    .populate('postedBy', 'name role')
    .sort({ createdAt: -1 });

  res.json({ success: true, data: announcements });
});

// @desc    Delete an announcement
// @route   DELETE /api/announcements/:id
// @access  Private (admin, or the teacher who posted it)
const deleteAnnouncement = asyncHandler(async (req, res) => {
  const announcement = await Announcement.findById(req.params.id);
  if (!announcement) {
    res.status(404);
    throw new Error('Announcement not found');
  }
  if (req.user.role !== 'admin' && announcement.postedBy.toString() !== req.user._id.toString()) {
    res.status(403);
    throw new Error('Not authorized to delete this announcement');
  }
  await announcement.deleteOne();
  res.json({ success: true, message: 'Announcement deleted' });
});

module.exports = { createAnnouncement, getAnnouncements, deleteAnnouncement };
