const mongoose = require('mongoose');

// Teacher profile, linked 1:1 to a User account (role = 'teacher').
const teacherSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
    employeeId: { type: String, required: true, unique: true, trim: true },
    department: { type: String, required: true, trim: true },
    designation: { type: String, default: 'Assistant Professor' },
    subjects: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Subject' }],
    phone: { type: String, trim: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Teacher', teacherSchema);
