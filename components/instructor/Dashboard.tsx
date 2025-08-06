import { useState, useEffect } from 'react';
import { useUser } from '../../lib/useUser';
import Link from 'next/link';

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
  const { user } = useUser();

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

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6">Instructor Dashboard</h1>
      
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold mb-4">Student Documents</h2>
        
        {students.length === 0 ? (
          <p>No students found.</p>
        ) : (
          <div className="space-y-4">
            {students.map((student) => (
              <div key={student.id} className="border rounded-lg p-4">
                <h3 className="font-semibold">{`${student.firstName} ${student.lastName}`}</h3>
                <p className="text-gray-600">Student Number: {student.studentNumber}</p>
                
                <div className="mt-3">
                  <h4 className="font-medium mb-2">Uploaded Documents:</h4>
                  {student.uploads.length === 0 ? (
                    <p>No documents uploaded.</p>
                  ) : (
                    <ul className="space-y-2">
                      {student.uploads.map((upload) => (
                        <li key={upload.id} className="flex items-center justify-between">
                          <div>
                            <span className="font-medium">{upload.title}</span>
                            <p className="text-sm text-gray-600">{upload.description}</p>
                          </div>
                          <Link 
                            href={upload.link}
                            className="text-blue-500 hover:text-blue-700"
                          >
                            View Document
                          </Link>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
