const express = require('express');
const { createAnnouncement, getAnnouncements, deleteAnnouncement } = require('../controllers/announcementController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

router.use(protect);

router.post('/', authorize('admin', 'teacher'), createAnnouncement);
router.get('/', getAnnouncements);
router.delete('/:id', authorize('admin', 'teacher'), deleteAnnouncement);

module.exports = router;
