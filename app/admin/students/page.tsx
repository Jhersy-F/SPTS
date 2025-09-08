'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
// Layout provides AdminSidebar and TopBar

export default function AdminStudentsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [students, setStudents] = useState<Array<{ id: number; studentNumber: string; firstName: string; lastName: string; _count?: { uploads: number } }>>([]);
  const [loadingData, setLoadingData] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (status === 'loading') return;
    if (!session?.user || session.user.role !== 'admin') {
      router.replace('/login/admin');
    }
  }, [status, session, router]);

  useEffect(() => {
    if (status !== 'authenticated' || !session?.user || session.user.role !== 'admin') return;
    load();
  }, [status, session]);

  async function load() {
    try {
      setLoadingData(true);
      setError('');
      const res = await fetch('/api/students');
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || 'Failed to load students');
      setStudents(data.students || []);
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : 'Failed to load students';
      setError(message);
    } finally {
      setLoadingData(false);
    }
  }

  if (status === 'loading' || loadingData) {
    return <div className="p-6">Loading...</div>;
  }

  return (
    <div className="max-w-5xl mx-auto p-6 space-y-6">
      <h1 className="text-2xl font-bold"> Students</h1>
      {error && <div className="bg-red-100 text-red-700 px-3 py-2 rounded">{error}</div>}

      <div className="border rounded overflow-x-auto">
        {students.length === 0 ? (
          <div className="p-4 text-gray-600">No students found.</div>
        ) : (
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Student #</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">First Name</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Last Name</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Uploads</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {students.map((s) => (
                <tr key={s.id}>
                  <td className="px-4 py-2">{s.studentNumber}</td>
                  <td className="px-4 py-2">{s.firstName}</td>
                  <td className="px-4 py-2">{s.lastName}</td>
                  <td className="px-4 py-2">{s._count?.uploads ?? '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
