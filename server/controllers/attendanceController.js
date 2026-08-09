const asyncHandler = require('express-async-handler');
const Attendance = require('../models/Attendance');
const Teacher = require('../models/Teacher');

// @desc    Mark attendance for a list of students in a subject on a given date.
//          Upserts so re-marking the same day updates rather than duplicates.
// @route   POST /api/attendance
// @body    { subject, date, records: [{ student, status }] }
// @access  Private (teacher)
const markAttendance = asyncHandler(async (req, res) => {
  const { subject, date, records } = req.body;

  if (!subject || !date || !Array.isArray(records) || records.length === 0) {
    res.status(400);
    throw new Error('subject, date and a non-empty records array are required');
  }

  const teacher = await Teacher.findOne({ user: req.user._id });
  if (!teacher) {
    res.status(403);
    throw new Error('Only teachers can mark attendance');
  }

  const day = new Date(date);
  day.setHours(0, 0, 0, 0);

  const ops = records.map((r) => ({
    updateOne: {
      filter: { student: r.student, subject, date: day },
      update: { $set: { status: r.status, markedBy: teacher._id } },
      upsert: true,
    },
  }));

  await Attendance.bulkWrite(ops);

  res.status(201).json({ success: true, message: `Attendance saved for ${records.length} student(s)` });
});

// @desc    Get attendance records for a subject on a given date (to prefill the marking UI)
// @route   GET /api/attendance?subject=&date=
// @access  Private (teacher)
const getAttendanceByDate = asyncHandler(async (req, res) => {
  const { subject, date } = req.query;
  if (!subject || !date) {
    res.status(400);
    throw new Error('subject and date query params are required');
  }
  const day = new Date(date);
  day.setHours(0, 0, 0, 0);

  const records = await Attendance.find({ subject, date: day }).populate({
    path: 'student',
    populate: { path: 'user', select: 'name' },
  });

  res.json({ success: true, data: records });
});

// @desc    Get full attendance history for a subject (date-wise)
// @route   GET /api/attendance/history?subject=
// @access  Private (teacher, admin)
const getAttendanceHistory = asyncHandler(async (req, res) => {
  const { subject } = req.query;
  const filter = subject ? { subject } : {};
  const records = await Attendance.find(filter)
    .populate({ path: 'student', populate: { path: 'user', select: 'name' } })
    .populate('subject', 'name code')
    .sort({ date: -1 });
  res.json({ success: true, count: records.length, data: records });
});

module.exports = { markAttendance, getAttendanceByDate, getAttendanceHistory };
