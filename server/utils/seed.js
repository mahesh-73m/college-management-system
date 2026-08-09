// Seeds the database with a demo admin, teacher, student, a course, a subject,
// and a couple of attendance/marks records — enough to log in and see a
// populated dashboard immediately after cloning the repo.
//
// Run with: npm run seed  (inside /server, with MONGO_URI set in .env)
require('dotenv').config();
const mongoose = require('mongoose');
const connectDB = require('../config/db');

const User = require('../models/User');
const Student = require('../models/Student');
const Teacher = require('../models/Teacher');
const Course = require('../models/Course');
const Subject = require('../models/Subject');
const Attendance = require('../models/Attendance');
const Marks = require('../models/Marks');
const Announcement = require('../models/Announcement');

const seed = async () => {
  await connectDB();

  console.log('Clearing existing data...');
  await Promise.all([
    User.deleteMany(),
    Student.deleteMany(),
    Teacher.deleteMany(),
    Course.deleteMany(),
    Subject.deleteMany(),
    Attendance.deleteMany(),
    Marks.deleteMany(),
    Announcement.deleteMany(),
  ]);

  console.log('Creating course & subject...');
  const course = await Course.create({ name: 'B.Tech Computer Science', code: 'CSE', department: 'Computer Science', durationYears: 4 });

  console.log('Creating users...');
  const admin = await User.create({ name: 'System Admin', email: 'admin@cms.edu', password: 'Admin@123', role: 'admin' });

  const teacherUser = await User.create({ name: 'Dr. Anjali Rao', email: 'teacher@cms.edu', password: 'Teacher@123', role: 'teacher' });
  const teacher = await Teacher.create({ user: teacherUser._id, employeeId: 'EMP001', department: 'Computer Science', designation: 'Assistant Professor' });

  const subject = await Subject.create({ name: 'Data Structures', code: 'CS201', course: course._id, semester: 3, teacher: teacher._id });
  teacher.subjects.push(subject._id);
  await teacher.save();

  const studentUser = await User.create({ name: 'Rahul Sharma', email: 'student@cms.edu', password: 'Student@123', role: 'student' });
  const student = await Student.create({
    user: studentUser._id,
    rollNumber: 'CSE2023001',
    department: 'Computer Science',
    course: course._id,
    semester: 3,
    section: 'A',
    admissionYear: 2023,
    guardianName: 'Suresh Sharma',
    guardianPhone: '9876543210',
  });

  console.log('Creating sample attendance & marks...');
  await Attendance.create([
    { student: student._id, subject: subject._id, markedBy: teacher._id, date: new Date('2026-08-01'), status: 'present' },
    { student: student._id, subject: subject._id, markedBy: teacher._id, date: new Date('2026-08-02'), status: 'present' },
    { student: student._id, subject: subject._id, markedBy: teacher._id, date: new Date('2026-08-03'), status: 'absent' },
  ]);

  await Marks.create([
    { student: student._id, subject: subject._id, uploadedBy: teacher._id, examType: 'Midterm', marksObtained: 42, totalMarks: 50 },
  ]);

  await Announcement.create({
    title: 'Welcome to the new semester',
    message: 'Classes begin Monday. Please check your timetable on the portal.',
    postedBy: admin._id,
    audience: 'all',
  });

  console.log('\nSeed complete. Demo logins:');
  console.log('  Admin:   admin@cms.edu   / Admin@123');
  console.log('  Teacher: teacher@cms.edu / Teacher@123');
  console.log('  Student: student@cms.edu / Student@123');

  await mongoose.connection.close();
  process.exit(0);
};

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});
