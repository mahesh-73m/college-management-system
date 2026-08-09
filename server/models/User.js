const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// Base user account used for authentication across all three roles.
// Role-specific data (roll number, department, subjects taught, etc.)
// lives in the Student / Teacher profile models, linked by `user`.
const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true, minlength: 6, select: false },
    role: { type: String, enum: ['admin', 'teacher', 'student'], required: true },
    avatar: { type: String, default: '' }, // uploaded profile image path
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

// Hash the password before saving, only if it was modified.
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

userSchema.methods.matchPassword = async function (enteredPassword) {
  return bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('User', userSchema);
