const mongoose = require('mongoose');

// A course/program, e.g. "B.Tech Computer Science".
const courseSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    code: { type: String, required: true, unique: true, trim: true, uppercase: true },
    department: { type: String, required: true, trim: true },
    durationYears: { type: Number, default: 4 },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Course', courseSchema);
