const asyncHandler = require('express-async-handler');
const Teacher = require('../models/Teacher');
const Student = require('../models/Student');
const Subject = require('../models/Subject');
const Attendance = require('../models/Attendance');

const getOwnTeacherProfile = async (userId) => {
  const teacher = await Teacher.findOne({ user: userId })
    .populate('user', 'name email avatar')
    .populate({ path: 'subjects', populate: { path: 'course', select: 'name code' } });
  if (!teacher) {
    const err = new Error('Teacher profile not found for this account');
    err.statusCode = 404;
    throw err;
  }
  return teacher;
};

// @desc    Get logged-in teacher's own profile + assigned subjects
// @route   GET /api/teachers/me
// @access  Private (teacher)
const getMyProfile = asyncHandler(async (req, res) => {
  const teacher = await getOwnTeacherProfile(req.user._id);
  res.json({ success: true, data: teacher });
});

// @desc    Get students in classes taught by the logged-in teacher, filterable
// @route   GET /api/teachers/me/students?subject=&section=&search=
// @access  Private (teacher)
const getMyStudents = asyncHandler(async (req, res) => {
  const teacher = await getOwnTeacherProfile(req.user._id);
  const { subject, section, search } = req.query;

  // Determine which course(s)/semester(s) this teacher's subjects belong to.
  const subjectDocs = subject
    ? teacher.subjects.filter((s) => s._id.toString() === subject)
    : teacher.subjects;

  const courseIds = [...new Set(subjectDocs.map((s) => s.course._id.toString()))];

  const filter = { course: { $in: courseIds } };
  if (section) filter.section = section;

  let query = Student.find(filter).populate('user', 'name email avatar').populate('course', 'name code');
  if (search) query = query.where('rollNumber').regex(new RegExp(search, 'i'));

  const students = await query.sort({ rollNumber: 1 });
  res.json({ success: true, count: students.length, data: students });
});

// @desc    List all teachers
// @route   GET /api/teachers
// @access  Private (admin)
const getTeachers = asyncHandler(async (req, res) => {
  const { department, search, page = 1, limit = 20 } = req.query;
  const filter = {};
  if (department) filter.department = department;

  let query = Teacher.find(filter).populate('user', 'name email avatar').populate('subjects', 'name code');
  if (search) query = query.where('employeeId').regex(new RegExp(search, 'i'));

  const total = await Teacher.countDocuments(filter);
  const teachers = await query
    .skip((Number(page) - 1) * Number(limit))
    .limit(Number(limit));

  res.json({ success: true, count: teachers.length, total, page: Number(page), pages: Math.ceil(total / limit), data: teachers });
});

// @desc    Get a single teacher
// @route   GET /api/teachers/:id
// @access  Private (admin)
const getTeacherById = asyncHandler(async (req, res) => {
  const teacher = await Teacher.findById(req.params.id).populate('user', 'name email avatar').populate('subjects', 'name code');
  if (!teacher) {
    res.status(404);
    throw new Error('Teacher not found');
  }
  res.json({ success: true, data: teacher });
});

// @desc    Update a teacher (admin edits, or teacher edits own contact info)
// @route   PUT /api/teachers/:id
// @access  Private (admin, or self)
const updateTeacher = asyncHandler(async (req, res) => {
  const { department, designation, phone } = req.body;
  const teacher = await Teacher.findById(req.params.id);
  if (!teacher) {
    res.status(404);
    throw new Error('Teacher not found');
  }
  Object.assign(teacher, {
    department: department ?? teacher.department,
    designation: designation ?? teacher.designation,
    phone: phone ?? teacher.phone,
  });
  await teacher.save();
  res.json({ success: true, data: teacher });
});

// @desc    Recent attendance logs marked by the logged-in teacher
// @route   GET /api/teachers/me/attendance-logs
// @access  Private (teacher)
const getMyRecentAttendanceLogs = asyncHandler(async (req, res) => {
  const teacher = await getOwnTeacherProfile(req.user._id);
  const logs = await Attendance.find({ markedBy: teacher._id })
    .populate({ path: 'student', populate: { path: 'user', select: 'name' } })
    .populate('subject', 'name code')
    .sort({ createdAt: -1 })
    .limit(20);
  res.json({ success: true, data: logs });
});

module.exports = {
  getMyProfile,
  getMyStudents,
  getTeachers,
  getTeacherById,
  updateTeacher,
  getMyRecentAttendanceLogs,
};
