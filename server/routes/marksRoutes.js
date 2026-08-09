const express = require('express');
const { upsertMarks, bulkUpsertMarks, getMarksBySubject } = require('../controllers/marksController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

router.use(protect);

router.post('/', authorize('teacher'), upsertMarks);
router.post('/bulk', authorize('teacher'), bulkUpsertMarks);
router.get('/', authorize('teacher', 'admin'), getMarksBySubject);

module.exports = router;
