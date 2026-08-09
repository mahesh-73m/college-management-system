const express = require('express');
const {
  getMyProfile,
  getMyStudents,
  getTeachers,
  getTeacherById,
  updateTeacher,
  getMyRecentAttendanceLogs,
} = require('../controllers/teacherController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

router.use(protect);

router.get('/me', authorize('teacher'), getMyProfile);
router.get('/me/students', authorize('teacher'), getMyStudents);
router.get('/me/attendance-logs', authorize('teacher'), getMyRecentAttendanceLogs);

router.get('/', authorize('admin'), getTeachers);
router.get('/:id', authorize('admin'), getTeacherById);
router.put('/:id', authorize('admin', 'teacher'), updateTeacher);

module.exports = router;
