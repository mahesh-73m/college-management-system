const asyncHandler = require('express-async-handler');
const User = require('../models/User');
const Student = require('../models/Student');
const Teacher = require('../models/Teacher');
const Course = require('../models/Course');
const Subject = require('../models/Subject');
const Attendance = require('../models/Attendance');
const generateToken = require('../utils/generateToken');

// @desc    Admin creates a student or teacher account directly
// @route   POST /api/admin/users
// @access  Private (admin)
const createUser = asyncHandler(async (req, res) => {
  const { name, email, password, role, profile } = req.body;
  if (!['teacher', 'student'].includes(role)) {
    res.status(400);
    throw new Error("Role must be 'teacher' or 'student'");
  }

  const exists = await User.findOne({ email });
  if (exists) {
    res.status(400);
    throw new Error('A user with this email already exists');
  }

  const user = await User.create({ name, email, password, role });

  if (role === 'student') {
    await Student.create({
      user: user._id,
      rollNumber: profile.rollNumber,
      department: profile.department,
      course: profile.course,
      semester: profile.semester || 1,
      section: profile.section || 'A',
      admissionYear: profile.admissionYear || new Date().getFullYear(),
    });
  } else {
    await Teacher.create({
      user: user._id,
      employeeId: profile.employeeId,
      department: profile.department,
      designation: profile.designation,
    });
  }

  res.status(201).json({ success: true, data: { id: user._id, name: user.name, email: user.email, role: user.role } });
});

// @desc    Delete/deactivate a user (soft delete keeps historical records intact)
// @route   DELETE /api/admin/users/:id
// @access  Private (admin)
const deleteUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) {
    res.status(404);
    throw new Error('User not found');
  }
  user.isActive = false;
  await user.save();
  res.json({ success: true, message: 'User deactivated' });
});

// @desc    Create a course
// @route   POST /api/admin/courses
// @access  Private (admin)
const createCourse = asyncHandler(async (req, res) => {
  const course = await Course.create(req.body);
  res.status(201).json({ success: true, data: course });
});

// @desc    List courses
// @route   GET /api/admin/courses
// @access  Private (admin, teacher, student)
const getCourses = asyncHandler(async (req, res) => {
  const courses = await Course.find().sort({ name: 1 });
  res.json({ success: true, data: courses });
});

// @desc    Update / delete a course
const updateCourse = asyncHandler(async (req, res) => {
  const course = await Course.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
  if (!course) {
    res.status(404);
    throw new Error('Course not found');
  }
  res.json({ success: true, data: course });
});

const deleteCourse = asyncHandler(async (req, res) => {
  const course = await Course.findByIdAndDelete(req.params.id);
  if (!course) {
    res.status(404);
    throw new Error('Course not found');
  }
  res.json({ success: true, message: 'Course deleted' });
});

// @desc    Create a subject
// @route   POST /api/admin/subjects
// @access  Private (admin)
const createSubject = asyncHandler(async (req, res) => {
  const subject = await Subject.create(req.body);
  res.status(201).json({ success: true, data: subject });
});

// @desc    List subjects
// @route   GET /api/admin/subjects?course=
// @access  Private (admin, teacher, student)
const getSubjects = asyncHandler(async (req, res) => {
  const filter = {};
  if (req.query.course) filter.course = req.query.course;
  const subjects = await Subject.find(filter).populate('course', 'name code').populate({ path: 'teacher', populate: { path: 'user', select: 'name' } });
  res.json({ success: true, data: subjects });
});

// @desc    Assign (or reassign) a teacher to a subject
// @route   PUT /api/admin/subjects/:id/assign
// @body    { teacher: teacherId }
// @access  Private (admin)
const assignTeacherToSubject = asyncHandler(async (req, res) => {
  const { teacher } = req.body;
  const subject = await Subject.findById(req.params.id);
  if (!subject) {
    res.status(404);
    throw new Error('Subject not found');
  }

  // Remove subject from any previous teacher's list.
  if (subject.teacher) {
    await Teacher.findByIdAndUpdate(subject.teacher, { $pull: { subjects: subject._id } });
  }

  subject.teacher = teacher;
  await subject.save();
  await Teacher.findByIdAndUpdate(teacher, { $addToSet: { subjects: subject._id } });

  res.json({ success: true, data: subject });
});

// @desc    System-wide analytics for the admin dashboard
// @route   GET /api/admin/analytics
// @access  Private (admin)
const getAnalytics = asyncHandler(async (req, res) => {
  const [totalStudents, totalTeachers, totalCourses, totalSubjects] = await Promise.all([
    Student.countDocuments(),
    Teacher.countDocuments(),
    Course.countDocuments(),
    Subject.countDocuments(),
  ]);

  const attendanceAgg = await Attendance.aggregate([
    { $group: { _id: '$status', count: { $sum: 1 } } },
  ]);
  const present = attendanceAgg.find((a) => a._id === 'present')?.count || 0;
  const absent = attendanceAgg.find((a) => a._id === 'absent')?.count || 0;
  const overallAttendancePercentage = present + absent ? Number(((present / (present + absent)) * 100).toFixed(2)) : 0;

  const recentActivity = await Attendance.find()
    .populate({ path: 'student', populate: { path: 'user', select: 'name' } })
    .populate('subject', 'name')
    .sort({ createdAt: -1 })
    .limit(10);

  res.json({
    success: true,
    data: {
      totalStudents,
      totalTeachers,
      totalCourses,
      totalSubjects,
      overallAttendancePercentage,
      recentActivity,
    },
  });
});

module.exports = {
  createUser,
  deleteUser,
  createCourse,
  getCourses,
  updateCourse,
  deleteCourse,
  createSubject,
  getSubjects,
  assignTeacherToSubject,
  getAnalytics,
};
