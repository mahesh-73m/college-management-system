const express = require('express');
const { getCourses } = require('../controllers/adminController');

const router = express.Router();

// Public: the signup page needs to list courses for the student course
// picker *before* the person has an account/token. This intentionally
// exposes course names/codes only (no student data) and read-only.
router.get('/', getCourses);

module.exports = router;