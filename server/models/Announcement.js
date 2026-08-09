const mongoose = require('mongoose');

// Notice-board style announcement, postable by admin (all roles) or a
// teacher (scoped to a specific course, optional).
const announcementSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    message: { type: String, required: true, trim: true },
    postedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    audience: { type: String, enum: ['all', 'students', 'teachers'], default: 'all' },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Announcement', announcementSchema);
