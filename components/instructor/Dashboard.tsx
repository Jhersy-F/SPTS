"use client"
import { useState, useEffect } from 'react';

type Student = {
  id: number;
  firstName: string;
  lastName: string;
  studentNumber: string;
  uploads: Array<{
    id: number;
    title: string;
    description: string;
    link: string;
  }>;
};

export default function InstructorDashboard() {
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStudents();
  }, []);

  async function fetchStudents() {
    try {
      const response = await fetch('/api/instructor/students');
      const data = await response.json();
      setStudents(data.students);
    } catch (error) {
      console.error('Error fetching students:', error);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return <div>Loading...</div>;
  }

  const totalStudents = students.length;
  const totalUploads = students.reduce((sum, s) => sum + (s.uploads?.length ?? 0), 0);

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6">Instructor Dashboard</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-sm font-medium text-gray-500">Total Students</h2>
          <p className="mt-2 text-4xl font-bold text-gray-900">{totalStudents}</p>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-sm font-medium text-gray-500">Total Uploads</h2>
          <p className="mt-2 text-4xl font-bold text-gray-900">{totalUploads}</p>
        </div>
      </div>
    </div>
  );
}
