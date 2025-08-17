"use client";

import React, { useEffect, useState } from 'react';

interface Upload {
  id: string | number;
}

interface Student {
  id: string | number;
  firstName?: string | null;
  lastName?: string | null;
  username?: string | null;
  uploads?: Upload[];
}

export default function InstructorStudentsPage() {
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStudents = async () => {
      try {
        const res = await fetch('/api/instructor/students', { credentials: 'include' });

        if (!res.ok) {
          const err = await res.json().catch(() => ({}));
          if (res.status === 401) {
            throw new Error('Please log in as an instructor to view students');
          } else if (res.status === 403) {
            throw new Error('You do not have permission to view students');
          } else {
            throw new Error(err.error || `HTTP ${res.status}: Failed to fetch students`);
          }
        }

        const data = await res.json();
        setStudents(Array.isArray(data.students) ? data.students : []);
      } catch (e) {
        console.error('Fetch students error:', e);
        setError(e instanceof Error ? e.message : 'An error occurred while fetching students');
      } finally {
        setLoading(false);
      }
    };

    fetchStudents();
  }, []);

  if (loading) {
    return (
      <div className="p-4 bg-white min-h-screen text-gray-900">
        <h1 className="text-3xl font-bold mb-6 text-center text-gray-800">Students</h1>
        <div className="text-center">Loading...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 bg-white min-h-screen text-gray-900">
        <h1 className="text-3xl font-bold mb-6 text-center text-gray-800">Students</h1>
        <div className="text-center text-red-600">Error: {error}</div>
      </div>
    );
  }

  return (
    <div className="p-4 bg-white min-h-screen text-gray-900">
      <h1 className="text-3xl font-bold mb-6 text-center text-gray-800">Students</h1>

      <div className="overflow-x-auto bg-white rounded-lg shadow-md w-4/5 mx-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-100">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider rounded-tl-lg">
                Name
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                Username
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                Total Uploads
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {students.map((s) => {
              const name = `${s.firstName ?? ''} ${s.lastName ?? ''}`.trim() || '—';
              const username = s.username || '—';
              const uploadsCount = Array.isArray(s.uploads) ? s.uploads.length : 0;
              return (
                <tr key={String(s.id)} className="hover:bg-gray-100 transition-colors duration-200">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-800">
                    {name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                    {username}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                    {uploadsCount}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
