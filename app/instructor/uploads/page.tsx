"use client";

import React, { useEffect, useMemo, useState } from 'react';

interface Upload {
  id: string | number;
  title?: string | null;
  type?: string | null;
  link?: string | null;
  subject?: string | null;
}

interface Student {
  id: string | number;
  firstName?: string | null;
  lastName?: string | null;
  uploads?: Upload[];
}

export default function InstructorUploadsPage() {
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const res = await fetch('/api/instructor/students', { credentials: 'include' });
        if (!res.ok) {
          const err = await res.json().catch(() => ({}));
          if (res.status === 401) {
            throw new Error('Please log in as an instructor to view uploads');
          } else if (res.status === 403) {
            throw new Error('You do not have permission to view uploads');
          } else {
            throw new Error(err.error || `HTTP ${res.status}: Failed to fetch uploads`);
          }
        }
        const data = await res.json();
        setStudents(Array.isArray(data.students) ? data.students : []);
      } catch (e) {
        console.error('Fetch instructor uploads error:', e);
        setError(e instanceof Error ? e.message : 'An error occurred while fetching uploads');
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
  }, []);

  const rows = useMemo(() => {
    return students.flatMap((s) => {
      const name = `${s.firstName ?? ''} ${s.lastName ?? ''}`.trim() || '—';
      return (s.uploads ?? []).map((u) => ({
        key: `${s.id}-${u.id}`,
        name,
        title: u.title ?? '—',
        type: u.type ?? '—',
        subject: u.subject ?? '—',
        link: u.link ?? undefined,
      }));
    });
  }, [students]);

  if (loading) {
    return (
      <div className="p-4 bg-white min-h-screen text-gray-900">
        <h1 className="text-3xl font-bold mb-6 text-center text-gray-800">Uploads</h1>
        <div className="text-center">Loading...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 bg-white min-h-screen text-gray-900">
        <h1 className="text-3xl font-bold mb-6 text-center text-gray-800">Uploads</h1>
        <div className="text-center text-red-600">Error: {error}</div>
      </div>
    );
  }

  return (
    <div className="p-4 bg-white min-h-screen text-gray-900">
      <h1 className="text-3xl font-bold mb-6 text-center text-gray-800">Uploads</h1>

      <div className="overflow-x-auto bg-white rounded-lg shadow-md w-4/5 mx-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-100">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider rounded-tl-lg">
                Student Name
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                Title
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                Type
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                Subject
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                Link
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {rows.map((r) => (
              <tr key={r.key} className="hover:bg-gray-100 transition-colors duration-200">
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-800">{r.name}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{r.title}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{r.type}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{r.subject}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-blue-600">
                  {r.link ? (
                    <a href={r.link} target="_blank" rel="noopener noreferrer" className="underline">View</a>
                  ) : (
                    '—'
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
