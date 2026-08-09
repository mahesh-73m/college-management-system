const express = require('express');
const { uploadAvatar, deleteAvatar } = require('../controllers/userController');
const { protect } = require('../middleware/auth');
const upload = require('../middleware/upload');

const router = express.Router();

router.use(protect);

router.post('/me/avatar', upload.single('avatar'), uploadAvatar);
router.delete('/me/avatar', deleteAvatar);

module.exports = router;
