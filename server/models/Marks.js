const mongoose = require('mongoose');

// One document = one student's marks for one subject in one exam.
const marksSchema = new mongoose.Schema(
  {
    student: { type: mongoose.Schema.Types.ObjectId, ref: 'Student', required: true },
    subject: { type: mongoose.Schema.Types.ObjectId, ref: 'Subject', required: true },
    uploadedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'Teacher', required: true },
    examType: { type: String, enum: ['Midterm', 'Final', 'Quiz', 'Assignment'], required: true },
    marksObtained: { type: Number, required: true, min: 0 },
    totalMarks: { type: Number, required: true, min: 1 },
  },
  { timestamps: true }
);

marksSchema.index({ student: 1, subject: 1, examType: 1 }, { unique: true });

// Virtual percentage, included whenever the doc is serialized to JSON.
marksSchema.virtual('percentage').get(function () {
  return this.totalMarks ? Number(((this.marksObtained / this.totalMarks) * 100).toFixed(2)) : 0;
});
marksSchema.set('toJSON', { virtuals: true });
marksSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('Marks', marksSchema);
