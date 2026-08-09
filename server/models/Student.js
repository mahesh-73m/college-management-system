const mongoose = require('mongoose');

// Student profile, linked 1:1 to a User account (role = 'student').
const studentSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
    rollNumber: { type: String, required: true, unique: true, trim: true },
    department: { type: String, required: true, trim: true },
    course: { type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true },
    semester: { type: Number, required: true, default: 1 },
    section: { type: String, default: 'A' },
    admissionYear: { type: Number, required: true },
    guardianName: { type: String, trim: true },
    guardianPhone: { type: String, trim: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Student', studentSchema);
