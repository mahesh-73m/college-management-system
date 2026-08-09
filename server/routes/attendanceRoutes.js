const express = require('express');
const { markAttendance, getAttendanceByDate, getAttendanceHistory } = require('../controllers/attendanceController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

router.use(protect);

router.post('/', authorize('teacher'), markAttendance);
router.get('/', authorize('teacher', 'admin'), getAttendanceByDate);
router.get('/history', authorize('teacher', 'admin'), getAttendanceHistory);

module.exports = router;
