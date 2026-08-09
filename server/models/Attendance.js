const mongoose = require('mongoose');

// One document = one student's attendance record for one subject on one date.
// Marked by a teacher. Percentage is computed on read, not stored, so it
// never goes stale.
const attendanceSchema = new mongoose.Schema(
  {
    student: { type: mongoose.Schema.Types.ObjectId, ref: 'Student', required: true },
    subject: { type: mongoose.Schema.Types.ObjectId, ref: 'Subject', required: true },
    markedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'Teacher', required: true },
    date: { type: Date, required: true },
    status: { type: String, enum: ['present', 'absent'], required: true },
  },
  { timestamps: true }
);

// Prevent marking the same student twice for the same subject on the same day.
attendanceSchema.index({ student: 1, subject: 1, date: 1 }, { unique: true });

module.exports = mongoose.model('Attendance', attendanceSchema);
