const asyncHandler = require('express-async-handler');
const Student = require('../models/Student');
const Attendance = require('../models/Attendance');
const Marks = require('../models/Marks');

// Resolve the Student profile document that belongs to the current logged-in user.
const getOwnStudentProfile = async (userId) => {
  const student = await Student.findOne({ user: userId }).populate('user', 'name email avatar').populate('course', 'name code');
  if (!student) {
    const err = new Error('Student profile not found for this account');
    err.statusCode = 404;
    throw err;
  }
  return student;
};

// @desc    Get logged-in student's own profile
// @route   GET /api/students/me
// @access  Private (student)
const getMyProfile = asyncHandler(async (req, res) => {
  const student = await getOwnStudentProfile(req.user._id);
  res.json({ success: true, data: student });
});

// @desc    Get logged-in student's attendance (overall + subject-wise)
// @route   GET /api/students/me/attendance
// @access  Private (student)
const getMyAttendance = asyncHandler(async (req, res) => {
  const student = await getOwnStudentProfile(req.user._id);
  const records = await Attendance.find({ student: student._id }).populate('subject', 'name code').sort({ date: -1 });

  // Group by subject and compute percentage per subject + overall.
  const bySubject = {};
  records.forEach((r) => {
    const key = r.subject._id.toString();
    if (!bySubject[key]) {
      bySubject[key] = { subject: r.subject, present: 0, total: 0, history: [] };
    }
    bySubject[key].total += 1;
    if (r.status === 'present') bySubject[key].present += 1;
    bySubject[key].history.push({ date: r.date, status: r.status });
  });

  const subjectWise = Object.values(bySubject).map((s) => ({
    subject: s.subject,
    present: s.present,
    total: s.total,
    percentage: s.total ? Number(((s.present / s.total) * 100).toFixed(2)) : 0,
    history: s.history,
  }));

  const totalPresent = subjectWise.reduce((sum, s) => sum + s.present, 0);
  const totalClasses = subjectWise.reduce((sum, s) => sum + s.total, 0);
  const overallPercentage = totalClasses ? Number(((totalPresent / totalClasses) * 100).toFixed(2)) : 0;

  res.json({ success: true, data: { overallPercentage, totalClasses, totalPresent, subjectWise } });
});

// @desc    Get logged-in student's marks (subject-wise, all exam types)
// @route   GET /api/students/me/marks
// @access  Private (student)
const getMyMarks = asyncHandler(async (req, res) => {
  const student = await getOwnStudentProfile(req.user._id);
  const marks = await Marks.find({ student: student._id }).populate('subject', 'name code');
  res.json({ success: true, data: marks });
});

// @desc    List all students (with filters)
// @route   GET /api/students?department=&course=&section=&semester=&search=&page=&limit=
// @access  Private (admin, teacher)
const getStudents = asyncHandler(async (req, res) => {
  const { department, course, section, semester, search, page = 1, limit = 20 } = req.query;
  const filter = {};
  if (department) filter.department = department;
  if (course) filter.course = course;
  if (section) filter.section = section;
  if (semester) filter.semester = Number(semester);

  let query = Student.find(filter).populate('user', 'name email avatar').populate('course', 'name code');

  if (search) {
    // Search by roll number directly, or by populated user name via a two-step lookup.
    query = query.where('rollNumber').regex(new RegExp(search, 'i'));
  }

  const total = await Student.countDocuments(filter);
  const students = await query
    .skip((Number(page) - 1) * Number(limit))
    .limit(Number(limit))
    .sort({ createdAt: -1 });

  res.json({ success: true, count: students.length, total, page: Number(page), pages: Math.ceil(total / limit), data: students });
});

// @desc    Get a single student by id
// @route   GET /api/students/:id
// @access  Private (admin, teacher)
const getStudentById = asyncHandler(async (req, res) => {
  const student = await Student.findById(req.params.id).populate('user', 'name email avatar').populate('course', 'name code');
  if (!student) {
    res.status(404);
    throw new Error('Student not found');
  }
  res.json({ success: true, data: student });
});

// @desc    Update a student profile
// @route   PUT /api/students/:id
// @access  Private (admin, or the teacher managing that class)
const updateStudent = asyncHandler(async (req, res) => {
  const { department, course, semester, section, guardianName, guardianPhone } = req.body;
  const student = await Student.findById(req.params.id);
  if (!student) {
    res.status(404);
    throw new Error('Student not found');
  }
  Object.assign(student, {
    department: department ?? student.department,
    course: course ?? student.course,
    semester: semester ?? student.semester,
    section: section ?? student.section,
    guardianName: guardianName ?? student.guardianName,
    guardianPhone: guardianPhone ?? student.guardianPhone,
  });
  await student.save();
  res.json({ success: true, data: student });
});

// @desc    Get a student's performance analytics (attendance % + avg marks per subject)
// @route   GET /api/students/:id/performance
// @access  Private (admin, teacher)
const getStudentPerformance = asyncHandler(async (req, res) => {
  const studentId = req.params.id;

  const attendance = await Attendance.find({ student: studentId }).populate('subject', 'name code');
  const marks = await Marks.find({ student: studentId }).populate('subject', 'name code');

  const attendanceBySubject = {};
  attendance.forEach((r) => {
    const key = r.subject._id.toString();
    if (!attendanceBySubject[key]) attendanceBySubject[key] = { subject: r.subject, present: 0, total: 0 };
    attendanceBySubject[key].total += 1;
    if (r.status === 'present') attendanceBySubject[key].present += 1;
  });

  const attendanceSummary = Object.values(attendanceBySubject).map((s) => ({
    subject: s.subject,
    percentage: s.total ? Number(((s.present / s.total) * 100).toFixed(2)) : 0,
  }));

  res.json({ success: true, data: { attendanceSummary, marks } });
});

module.exports = {
  getMyProfile,
  getMyAttendance,
  getMyMarks,
  getStudents,
  getStudentById,
  updateStudent,
  getStudentPerformance,
};
