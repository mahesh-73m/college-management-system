import React, { useEffect, useState } from 'react';
import api from '../../services/api';
import Loader from '../../components/Loader.jsx';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { useAuth } from '../../context/AuthContext.jsx';

const StudentMarks = () => {
  const { user } = useAuth();
  const [marks, setMarks] = useState([]);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([api.get('/students/me/marks'), api.get('/students/me')]).then(([m, p]) => {
      setMarks(m.data.data);
      setProfile(p.data.data);
      setLoading(false);
    });
  }, []);

  const downloadReportCard = () => {
    const doc = new jsPDF();
    doc.setFontSize(16);
    doc.text('College Management System', 14, 18);
    doc.setFontSize(12);
    doc.text('Student Report Card', 14, 26);

    doc.setFontSize(10);
    doc.text(`Name: ${user?.name || ''}`, 14, 36);
    doc.text(`Roll Number: ${profile?.rollNumber || ''}`, 14, 42);
    doc.text(`Department: ${profile?.department || ''}`, 14, 48);
    doc.text(`Semester: ${profile?.semester || ''}`, 14, 54);

    autoTable(doc, {
      startY: 62,
      head: [['Subject', 'Exam Type', 'Marks Obtained', 'Total Marks', 'Percentage']],
      body: marks.map((m) => [m.subject?.name, m.examType, m.marksObtained, m.totalMarks, `${m.percentage}%`]),
    });

    doc.save(`${profile?.rollNumber || 'report-card'}.pdf`);
  };

  if (loading) return <Loader />;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h1 className="text-xl font-semibold text-gray-900 dark:text-gray-100">My Marks</h1>
        <button onClick={downloadReportCard} className="btn-primary text-sm">
          ⬇ Download Report Card (PDF)
        </button>
      </div>

      <div className="card overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-gray-500 dark:text-gray-400 border-b border-gray-100 dark:border-gray-700">
              <th className="py-2 pr-4">Subject</th>
              <th className="py-2 pr-4">Exam Type</th>
              <th className="py-2 pr-4">Marks</th>
              <th className="py-2 pr-4">Percentage</th>
            </tr>
          </thead>
          <tbody>
            {marks.length === 0 && (
              <tr>
                <td colSpan={4} className="py-4 text-center text-gray-500">
                  No marks uploaded yet.
                </td>
              </tr>
            )}
            {marks.map((m) => (
              <tr key={m._id} className="border-b border-gray-50 dark:border-gray-700/50">
                <td className="py-2 pr-4 text-gray-800 dark:text-gray-200">{m.subject?.name}</td>
                <td className="py-2 pr-4 text-gray-600 dark:text-gray-400">{m.examType}</td>
                <td className="py-2 pr-4 text-gray-600 dark:text-gray-400">
                  {m.marksObtained}/{m.totalMarks}
                </td>
                <td className="py-2 pr-4 font-medium text-gray-900 dark:text-gray-100">{m.percentage}%</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default StudentMarks;
