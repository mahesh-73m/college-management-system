const express = require('express');
const {
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
} = require('../controllers/adminController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

router.use(protect);

router.post('/users', authorize('admin'), createUser);
router.delete('/users/:id', authorize('admin'), deleteUser);

router.post('/courses', authorize('admin'), createCourse);
router.get('/courses', getCourses); // any logged-in role can view courses
router.put('/courses/:id', authorize('admin'), updateCourse);
router.delete('/courses/:id', authorize('admin'), deleteCourse);

router.post('/subjects', authorize('admin'), createSubject);
router.get('/subjects', getSubjects); // any logged-in role can view subjects
router.put('/subjects/:id/assign', authorize('admin'), assignTeacherToSubject);

router.get('/analytics', authorize('admin'), getAnalytics);

module.exports = router;
