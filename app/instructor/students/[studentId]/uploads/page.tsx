'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useSearchParams, useRouter } from 'next/navigation';

interface Upload {
  id: number;
  title: string;
  description: string;
  link: string;
  uploadedAt: string;
  type: string;
  subjectID: number;
  subject: {
    id: number;
    subjectID: number;
    title: string;
  };
}

interface Student {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
}

export default function StudentUploadsPage() {
  const params = useParams();
  const studentId = params.studentId as string;
  const searchParams = useSearchParams();
  const subjectIdParam = searchParams.get('subjectid');
  const subjectId = subjectIdParam ? parseInt(subjectIdParam) : undefined;
  const router = useRouter();

  const [student, setStudent] = useState<Student | null>(null);
  const [uploads, setUploads] = useState<Upload[]>([]);
  const [allUploads, setAllUploads] = useState<Upload[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [subjectName, setSubjectName] = useState('');

  // State for search and type filter
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState('');

  useEffect(() => {
    let filtered = [...allUploads];

    // Debug logs

       

    // Apply type filter
    if (typeFilter) {
      filtered = filtered.filter(upload =>
        upload.type === typeFilter
      );
    }

    // Apply search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(upload =>
        (upload.title?.toLowerCase().includes(query) || false) ||
        (upload.description?.toLowerCase().includes(query) || false) ||
        (upload.subject?.title?.toLowerCase().includes(query) || false)
      );
    }

    setUploads(filtered);
  }, [allUploads, typeFilter, searchQuery, subjectId]);
  useEffect(()=>{
    console.log(uploads);
  })
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        // Fetch student details
        const studentRes = await fetch(`/api/students/${studentId}`);
        if (!studentRes.ok) throw new Error('Failed to fetch student details');
        const studentData = await studentRes.json();
        setStudent(studentData);

        // Fetch subject details if subjectId is provided
        if (subjectId) {
          const subjectRes = await fetch(`/api/subjects/${subjectId}`);
          if (subjectRes.ok) {
            const subjectData = await subjectRes.json();
            // Check if we got a single subject or a list
            const subject = subjectData.subject || subjectData.subjects?.[0] || subjectData;
            setSubjectName(subject?.title || 'Selected Subject');
          }
        }

        // Fetch uploads with subject filter on the server
        const uploadsUrl = subjectId 
          ? `/api/students/${studentId}/uploads?subjectId=${subjectId}`
          : `/api/students/${studentId}/uploads`;

        const uploadsRes = await fetch(uploadsUrl);
        if (!uploadsRes.ok) throw new Error('Failed to fetch uploads');
        const uploadsData = await uploadsRes.json();
        
        setAllUploads(uploadsData.uploads || []);
        setUploads(uploadsData.uploads || []);
         
      } catch (err) {
        console.error('Error fetching data:', err);
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };
    
    if (studentId) {
      fetchData();
    }
  }, [studentId, subjectId]);

  const handleDownload = (link: string) => {
    // Open the file in a new tab
    window.open(link, '_blank');
  };

  if (loading) {
    return (
      <div className="p-4 bg-white min-h-screen text-gray-900">
        <h1 className="text-3xl font-bold mb-6 text-center text-gray-800">Loading...</h1>
      </div>
    );
  }

  if (error || !student) {
    return (
      <div className="p-4 bg-white min-h-screen text-gray-900">
        <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-500" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-red-700">{error || 'Student not found'}</p>
            </div>
          </div>
        </div>
        <button
          onClick={() => router.back()}
          className="mt-4 px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300"
        >
          Go Back
        </button>
      </div>
    );
  }

  return (
    <div className="p-4 bg-white min-h-screen text-gray-900">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">
            {student.firstName} {student.lastName}&apos;s Documents
          </h1>
          <p className="text-gray-600">
            {subjectName ? `Subject: ${subjectName}` : 'All uploaded documents'}
          </p>
        </div>
        <button
          onClick={() => router.back()}
          className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300"
        >
          Back
        </button>
      </div>

      {/* Filter Section */}
      <div className="mb-6 p-4 bg-gray-50 rounded-lg">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Search Input */}
          <div>
            <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-1">
              Search
            </label>
            <input
              type="text"
              id="search"
              placeholder="Search documents..."
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          {/* Type Dropdown */}
          <div>
            <label htmlFor="type" className="block text-sm font-medium text-gray-700 mb-1">
              Document Type
            </label>
            <select
              id="type"
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
            >
              <option value="">All Types</option>
              <option value="activity">Activity</option>
              <option value="exam">Exam</option>
              <option value="quiz">Quiz</option>
            </select>
          </div>
        </div>
        
      </div>

      <div className="overflow-x-auto bg-white rounded-lg shadow-md w-4/5 mx-auto">
        {uploads ? (
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-100">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider rounded-tl-lg">
                  Title
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                  Subject
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                  Type
                </th>
                <th scope="col" className="px-6 py-3 text-center text-xs font-medium text-gray-600 uppercase tracking-wider rounded-tr-lg">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {uploads && uploads.map((upload) => (
                <tr key={`upload-${upload.id}`} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {upload.description}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {upload.subject?.title || 'N/A'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {upload.type}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-center text-sm font-medium">
                    <button
                      onClick={() => handleDownload(upload.link)}
                      className="text-blue-600 hover:text-blue-900 hover:underline mr-4"
                    >
                      Download
                    </button>
                    <a
                      href={upload.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-green-600 hover:text-green-900 hover:underline"
                    >
                      Open
                    </a>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div className="p-8 text-center">
            <p className="text-gray-500">
              {subjectName
                ? `No documents found for ${student.firstName} in ${subjectName}.`
                : `No documents found for ${student.firstName}.`}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
