const express = require('express');
const {
  getMyProfile,
  getMyAttendance,
  getMyMarks,
  getStudents,
  getStudentById,
  updateStudent,
  getStudentPerformance,
} = require('../controllers/studentController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

router.use(protect);

// Student's own data
router.get('/me', authorize('student'), getMyProfile);
router.get('/me/attendance', authorize('student'), getMyAttendance);
router.get('/me/marks', authorize('student'), getMyMarks);

// Admin / teacher management of student records
router.get('/', authorize('admin', 'teacher'), getStudents);
router.get('/:id', authorize('admin', 'teacher'), getStudentById);
router.put('/:id', authorize('admin', 'teacher'), updateStudent);
router.get('/:id/performance', authorize('admin', 'teacher'), getStudentPerformance);

module.exports = router;
