"use client";

import React, { useEffect, useMemo, useState } from 'react';
import { Dialog } from '@headlessui/react';
import { X } from 'lucide-react';
import Image from 'next/image';

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
  studentNumber?: string | null;
  uploads?: Upload[];
}

export default function InstructorUploadsPage() {
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [query, setQuery] = useState<string>("");
  const [subjectFilter, setSubjectFilter] = useState<string>("");
  const [typeFilter, setTypeFilter] = useState<string>("");
  const [selectedFile, setSelectedFile] = useState<{ url: string; type: string } | null>(null);
  const [isOpen, setIsOpen] = useState(false);

  const openModal = (url: string, type: string) => {
    setSelectedFile({ url, type });
    setIsOpen(true);
  };

  const closeModal = () => {
    setIsOpen(false);
    setSelectedFile(null);
  };

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
        studentNumber: s.studentNumber ?? '—',
        title: u.title ?? '—',
        type: u.type ?? '—',
        subject: u.subject ?? '—',
        link: u.link ?? undefined,
      }));
    });
  }, [students]);

  const subjects = useMemo(() => {
    const set = new Set<string>();
    rows.forEach((r) => r.subject && set.add(r.subject));
    return Array.from(set).sort();
  }, [rows]);

  const types = useMemo(() => {
    const set = new Set<string>();
    rows.forEach((r) => r.type && set.add(r.type));
    return Array.from(set).sort();
  }, [rows]);

  const filteredRows = useMemo(() => {
    const q = query.trim().toLowerCase();
    return rows.filter((r) => {
      const matchQuery = !q
        ? true
        : `${r.name} ${r.studentNumber ?? ''}`.toLowerCase().includes(q);
      const matchSubject = !subjectFilter || r.subject === subjectFilter;
      const matchType = !typeFilter || r.type === typeFilter;
      return matchQuery && matchSubject && matchType;
    });
  }, [rows, query, subjectFilter, typeFilter]);

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

      <div className="w-4/5 mx-auto mb-4 flex flex-col gap-3 sm:flex-row sm:items-center">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search by Student Number or Name..."
          className="flex-1 px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          aria-label="Search by Student Number or Name"
        />
        <select
          value={subjectFilter}
          onChange={(e) => setSubjectFilter(e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-md bg-white"
          aria-label="Filter by Subject"
        >
          <option value="">All Subjects</option>
          {subjects.map((s) => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>
        <select
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-md bg-white"
          aria-label="Filter by Type"
        >
          <option value="">All Types</option>
          {types.map((t) => (
            <option key={t} value={t}>{t}</option>
          ))}
        </select>
      </div>

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
            {filteredRows.map((r) => (
              <tr key={r.key} className="hover:bg-gray-100 transition-colors duration-200">
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-800">{r.name}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{r.title}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{r.type}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{r.subject}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">
                  {r.link ? (
                    <div className="flex space-x-2">
                      <button
                        onClick={() => openModal(r.link as string, r.type?.toLowerCase() || '')}
                        className="text-blue-600 hover:text-blue-800 underline"
                      >
                        View
                      </button>
                      <a 
                        href={r.link} 
                        target="_blank" 
                        rel="noopener noreferrer" 
                        className="text-blue-600 hover:text-blue-800 underline"
                        onClick={(e) => e.stopPropagation()}
                      >
                        Download
                      </a>
                    </div>
                  ) : (
                    '—'
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* View File Modal */}
      <Dialog
        open={isOpen}
        onClose={closeModal}
        className="fixed inset-0 z-50 overflow-y-auto"
      >
        <div className="flex items-center justify-center min-h-screen p-4">
          <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
          <div className="relative bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-hidden">
            <div className="flex justify-between items-center p-4 border-b">
              <Dialog.Title className="text-lg font-medium">
                {selectedFile?.type || 'File'} Preview
              </Dialog.Title>
              <button
                onClick={closeModal}
                className="text-gray-500 hover:text-gray-700"
                aria-label="Close"
              >
                <X className="h-6 w-6" />
              </button>
            </div>
            <div className="p-4 max-h-[calc(90vh-100px)] overflow-auto">
              {selectedFile?.type.includes('pdf') ? (
                <iframe
                  src={`${selectedFile.url}#view=fitH`}
                  className="w-full h-[70vh] border-0"
                  title="PDF Viewer"
                />
              ) : selectedFile?.type.includes('image') ? (
                <div className="flex justify-center">
                  <div className="relative w-full h-[70vh]">
                    <Image
                      src={selectedFile.url}
                      alt="Preview"
                      fill
                      style={{ objectFit: 'contain' }}
                      unoptimized={!selectedFile.url.startsWith('/')}
                    />
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-64">
                  <p className="mb-4">Preview not available for this file type.</p>
                  <a 
                    href={selectedFile?.url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                  >
                    Download File
                  </a>
                </div>
              )}
            </div>
          </div>
        </div>
      </Dialog>
    </div>
  );
}
