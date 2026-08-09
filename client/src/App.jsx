import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext.jsx';
import ProtectedRoute from './components/ProtectedRoute.jsx';
import DashboardLayout from './components/DashboardLayout.jsx';
import Loader from './components/Loader.jsx';

import Login from './pages/Login.jsx';
import Signup from './pages/Signup.jsx';
import Announcements from './pages/Announcements.jsx';

import AdminDashboard from './pages/admin/AdminDashboard.jsx';
import ManageStudents from './pages/admin/ManageStudents.jsx';
import ManageTeachers from './pages/admin/ManageTeachers.jsx';
import ManageCourses from './pages/admin/ManageCourses.jsx';
import AdminProfile from './pages/admin/Profile.jsx';

import TeacherDashboard from './pages/teacher/TeacherDashboard.jsx';
import MarkAttendance from './pages/teacher/MarkAttendance.jsx';
import UploadMarks from './pages/teacher/UploadMarks.jsx';
import StudentPerformance from './pages/teacher/StudentPerformance.jsx';
import TeacherProfile from './pages/teacher/Profile.jsx';

import StudentDashboard from './pages/student/StudentDashboard.jsx';
import StudentAttendance from './pages/student/Attendance.jsx';
import StudentMarks from './pages/student/Marks.jsx';
import StudentProfile from './pages/student/Profile.jsx';

const adminLinks = [
  { to: '/admin', label: 'Dashboard', icon: '📊', end: true },
  { to: '/admin/students', label: 'Students', icon: '🎓' },
  { to: '/admin/teachers', label: 'Teachers', icon: '👩‍🏫' },
  { to: '/admin/courses', label: 'Courses & Subjects', icon: '📘' },
  { to: '/admin/announcements', label: 'Announcements', icon: '📢' },
  { to: '/admin/profile', label: 'Profile', icon: '👤' },
];

const teacherLinks = [
  { to: '/teacher', label: 'Dashboard', icon: '📊', end: true },
  { to: '/teacher/attendance', label: 'Mark Attendance', icon: '✅' },
  { to: '/teacher/marks', label: 'Upload Marks', icon: '📝' },
  { to: '/teacher/performance', label: 'Student Performance', icon: '📈' },
  { to: '/teacher/announcements', label: 'Announcements', icon: '📢' },
  { to: '/teacher/profile', label: 'Profile', icon: '👤' },
];

const studentLinks = [
  { to: '/student', label: 'Dashboard', icon: '📊', end: true },
  { to: '/student/attendance', label: 'Attendance', icon: '📅' },
  { to: '/student/marks', label: 'Marks & Report Card', icon: '📈' },
  { to: '/student/profile', label: 'Profile', icon: '👤' },
  { to: '/student/announcements', label: 'Announcements', icon: '📢' },
];

function App() {
  const { user, loading } = useAuth();

  if (loading) return <Loader />;

  return (
    <Routes>
      <Route path="/login" element={user ? <Navigate to={`/${user.role}`} /> : <Login />} />
      <Route path="/signup" element={user ? <Navigate to={`/${user.role}`} /> : <Signup />} />

      {/* Admin */}
      <Route
        path="/admin"
        element={
          <ProtectedRoute roles={['admin']}>
            <DashboardLayout links={adminLinks} />
          </ProtectedRoute>
        }
      >
        <Route index element={<AdminDashboard />} />
        <Route path="students" element={<ManageStudents />} />
        <Route path="teachers" element={<ManageTeachers />} />
        <Route path="courses" element={<ManageCourses />} />
        <Route path="announcements" element={<Announcements />} />
        <Route path="profile" element={<AdminProfile />} />
      </Route>

      {/* Teacher */}
      <Route
        path="/teacher"
        element={
          <ProtectedRoute roles={['teacher']}>
            <DashboardLayout links={teacherLinks} />
          </ProtectedRoute>
        }
      >
        <Route index element={<TeacherDashboard />} />
        <Route path="attendance" element={<MarkAttendance />} />
        <Route path="marks" element={<UploadMarks />} />
        <Route path="performance" element={<StudentPerformance />} />
        <Route path="announcements" element={<Announcements />} />
        <Route path="profile" element={<TeacherProfile />} />
      </Route>

      {/* Student */}
      <Route
        path="/student"
        element={
          <ProtectedRoute roles={['student']}>
            <DashboardLayout links={studentLinks} />
          </ProtectedRoute>
        }
      >
        <Route index element={<StudentDashboard />} />
        <Route path="attendance" element={<StudentAttendance />} />
        <Route path="marks" element={<StudentMarks />} />
        <Route path="profile" element={<StudentProfile />} />
        <Route path="announcements" element={<Announcements />} />
      </Route>

      <Route path="/" element={<Navigate to={user ? `/${user.role}` : '/login'} />} />
      <Route path="*" element={<Navigate to={user ? `/${user.role}` : '/login'} />} />
    </Routes>
  );
}

export default App;
