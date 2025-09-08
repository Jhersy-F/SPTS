'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
// Layout provides AdminSidebar and TopBar

type Subject = { subjectID: number; title: string };

export default function AdminSubjectsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [loading, setLoading] = useState(true);
  const [title, setTitle] = useState('');
  const [editing, setEditing] = useState<Subject | null>(null);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    if (status === 'loading') return;
    if (!session?.user || session.user.role !== 'admin') {
      router.replace('/login/admin');
      return;
    }
    load();
  }, [status, session, router]);

  async function load() {
    try {
      setLoading(true);
      const res = await fetch('/api/subjects');
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || 'Failed to load');
      setSubjects(data.subjects || []);
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : 'Failed to load subjects';
      setError(message);
    } finally {
      setLoading(false);
    }
  }

  async function onCreate() {
    try {
      setError('');
      const res = await fetch('/api/subjects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || 'Create failed');
      setTitle('');
      setShowForm(false);
      await load();
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : 'Create failed';
      setError(message);
    }
  }

  async function onUpdate() {
    if (!editing) return;
    try {
      setError('');
      const res = await fetch('/api/subjects', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ subjectID: editing.subjectID, title }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || 'Update failed');
      setEditing(null);
      setTitle('');
      setShowForm(false);
      await load();
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : 'Update failed';
      setError(message);
    }
  }

  async function onDelete(id: number) {
    if (!confirm('Are you sure you want to delete this subject?')) return;
    try {
      setError('');
      const res = await fetch(`/api/subjects?subjectID=${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || 'Delete failed');
      await load();
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : 'Delete failed';
      setError(message);
    }
  }

  if (status === 'loading' || loading) {
    return <div className="p-6">Loading...</div>;
  }

  return (
    <div className="max-w-5xl mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Manage Subjects</h1>
        <button
          onClick={() => {
            setEditing(null);
            setTitle('');
            setShowForm(!showForm);
          }}
          className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded flex items-center gap-2"
        >
          <span>+</span> {editing ? 'Cancel' : 'Add Subject'}
        </button>
      </div>

      {error && <div className="bg-red-100 text-red-700 px-3 py-2 rounded">{error}</div>}

      {(showForm || editing) && (
        <div className="bg-white p-4 rounded-lg shadow">
          <h2 className="text-lg font-medium mb-4">{editing ? 'Edit Subject' : 'Add New Subject'}</h2>
          <div className="flex gap-2">
            <input
              className="flex-1 px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter subject title"
            />
            {editing ? (
              <button
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
                onClick={onUpdate}
              >
                Update
              </button>
            ) : (
              <button
                className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded"
                onClick={onCreate}
              >
                Add
              </button>
            )}
          </div>
        </div>
      )}

      <div className="bg-white rounded-lg shadow overflow-hidden">
        {subjects.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            No subjects found. Click &ldquo;Add Subject&rdquo; to create one.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Title
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {subjects.map((s) => (
                  <tr key={s.subjectID} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {s.title}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        onClick={() => {
                          setEditing(s);
                          setTitle(s.title);
                          setShowForm(true);
                          window.scrollTo({ top: 0, behavior: 'smooth' });
                        }}
                        className="text-blue-600 hover:text-blue-900 mr-4"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => onDelete(s.subjectID)}
                        className="text-red-600 hover:text-red-900"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
