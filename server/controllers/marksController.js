const asyncHandler = require('express-async-handler');
const Marks = require('../models/Marks');
const Teacher = require('../models/Teacher');

// @desc    Upload or update marks for a student in a subject/exam (upsert)
// @route   POST /api/marks
// @body    { student, subject, examType, marksObtained, totalMarks }
// @access  Private (teacher)
const upsertMarks = asyncHandler(async (req, res) => {
  const { student, subject, examType, marksObtained, totalMarks } = req.body;

  if (!student || !subject || !examType || marksObtained == null || !totalMarks) {
    res.status(400);
    throw new Error('student, subject, examType, marksObtained and totalMarks are required');
  }
  if (marksObtained > totalMarks) {
    res.status(400);
    throw new Error('marksObtained cannot exceed totalMarks');
  }

  const teacher = await Teacher.findOne({ user: req.user._id });
  if (!teacher) {
    res.status(403);
    throw new Error('Only teachers can upload marks');
  }

  const record = await Marks.findOneAndUpdate(
    { student, subject, examType },
    { marksObtained, totalMarks, uploadedBy: teacher._id },
    { new: true, upsert: true, runValidators: true }
  );

  res.status(201).json({ success: true, data: record });
});

// @desc    Bulk upload marks for many students at once (e.g. whole class for one exam)
// @route   POST /api/marks/bulk
// @body    { subject, examType, totalMarks, records: [{ student, marksObtained }] }
// @access  Private (teacher)
const bulkUpsertMarks = asyncHandler(async (req, res) => {
  const { subject, examType, totalMarks, records } = req.body;
  if (!subject || !examType || !totalMarks || !Array.isArray(records) || records.length === 0) {
    res.status(400);
    throw new Error('subject, examType, totalMarks and a non-empty records array are required');
  }

  const teacher = await Teacher.findOne({ user: req.user._id });
  if (!teacher) {
    res.status(403);
    throw new Error('Only teachers can upload marks');
  }

  const ops = records.map((r) => ({
    updateOne: {
      filter: { student: r.student, subject, examType },
      update: { $set: { marksObtained: r.marksObtained, totalMarks, uploadedBy: teacher._id } },
      upsert: true,
    },
  }));

  await Marks.bulkWrite(ops);
  res.status(201).json({ success: true, message: `Marks saved for ${records.length} student(s)` });
});

// @desc    Get marks for a subject (all students, optionally filtered by exam type)
// @route   GET /api/marks?subject=&examType=&page=&limit=
// @access  Private (teacher, admin)
const getMarksBySubject = asyncHandler(async (req, res) => {
  const { subject, examType, page = 1, limit = 50 } = req.query;
  const filter = {};
  if (subject) filter.subject = subject;
  if (examType) filter.examType = examType;

  const total = await Marks.countDocuments(filter);
  const marks = await Marks.find(filter)
    .populate({ path: 'student', populate: { path: 'user', select: 'name' } })
    .populate('subject', 'name code')
    .skip((Number(page) - 1) * Number(limit))
    .limit(Number(limit));

  res.json({ success: true, count: marks.length, total, page: Number(page), pages: Math.ceil(total / limit), data: marks });
});

module.exports = { upsertMarks, bulkUpsertMarks, getMarksBySubject };
