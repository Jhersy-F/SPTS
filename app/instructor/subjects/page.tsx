'use client';

import React, { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';

interface Subject {
  subjectId: number;
  title: string;
}

export default function InstructorSubjectsPage() {
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [allSubjects, setAllSubjects] = useState<Subject[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [query, setQuery] = useState('');
  const [selectedSubjectId, setSelectedSubjectId] = useState<string>('');

  const fetchAllSubjects = useCallback(async () => {
    try {
      const res = await fetch('/api/subjects');
      if (res.ok) {
        const data = await res.json();
        // Handle the nested subjects array in the response
        const subjects = data?.subjects || [];
        // Map the API response to match our interface
        const formattedSubjects = Array.isArray(subjects) 
          ? subjects.map(subj => ({
              subjectId: subj.subjectID,
              title: subj.title
            }))
          : [];
        setAllSubjects(formattedSubjects);
      } else {
        console.error('Failed to fetch subjects:', await res.text());
        setAllSubjects([]);
      }
    } catch (error) {
      console.error('Error fetching all subjects:', error);
      setAllSubjects([]);
    }
  }, []);

  const fetchMySubjects = useCallback(async () => {
    try {
      const res = await fetch('/api/instructor/subjects', { 
        method: 'GET',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        if (res.status === 401) {
          throw new Error('Please log in as an instructor to view subjects');
        } else if (res.status === 403) {
          throw new Error('You do not have permission to view subjects');
        } else {
          throw new Error(err.error || `Failed to fetch subjects`);
        }
      }

      const data = await res.json();
      setSubjects(Array.isArray(data) ? data : []);
      console.log(data);
      // Set the first subject as selected by default if none selected
      if (Array.isArray(data) && data.length > 0 && !selectedSubjectId) {
        setSelectedSubjectId(String(data[0].subjectID));
      }
    } catch (e) {
      console.error('Fetch subjects error:', e);
      setError(e instanceof Error ? e.message : 'An error occurred while fetching subjects');
    } finally {
      setLoading(false);
    }
  },[selectedSubjectId]);

  const handleAddSubject = async () => {
    if (!selectedSubjectId) return;
    
    try {
      // Debug logs
      console.log('Selected Subject ID:', selectedSubjectId);
      console.log('All Subjects:', allSubjects);
      
      // Find the selected subject to get its title
      const selectedSubject = allSubjects.find(subj => {
        const match = subj?.subjectId?.toString() === selectedSubjectId?.toString();
        console.log(`Checking subject:`, subj, 'Match:', match);
        return match;
      });
      
      if (!selectedSubject) {
        console.error('Subject not found in:', allSubjects);
        throw new Error('Selected subject not found. Please try again.');
      }

      const response = await fetch('/api/instructor/subjects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          subjectId: selectedSubject.subjectId
        }),
        credentials: 'include',
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        
        throw new Error(errorData.message || response.statusText);
      }
      
      setSelectedSubjectId('');
      await fetchMySubjects();
    } catch (error) {
      console.error('Error adding subject:', error);
      setError(error instanceof Error ? error.message : 'Catch Failed to add subject');
    }
  };

  const handleDeleteSubject = async (subjectId: number) => {
    if (!confirm('Are you sure you want to delete this subject?')) return;
    
    try {
      const response = await fetch(`/api/instructor/subjects/${subjectId}`, {
        method: 'DELETE',
      });

      if (!response.ok) throw new Error('Failed to delete subject');
      
      await fetchMySubjects();
    } catch (error) {
      console.error('Error deleting subject:', error);
      setError('Failed to delete subject');
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      await Promise.all([fetchMySubjects(), fetchAllSubjects()]);
      setLoading(false);
    };
    
    fetchData();
  }, [fetchMySubjects, fetchAllSubjects]);

  if (loading) {
    return (
      <div className="p-4 bg-white min-h-screen text-gray-900">
        <h1 className="text-3xl font-bold mb-6 text-center text-gray-800">My Subjects</h1>
        <div className="text-center">Loading...</div>
      </div>
    );
  }



  const filteredSubjects = subjects.filter((subject) => {
    const q = query.trim().toLowerCase();
    if (!q) return true;
    return subject.title.toLowerCase().includes(q);
  });

  return (
    
    
  
    <div className="p-4 bg-white min-h-screen text-gray-900">
      <h1 className="text-3xl font-bold mb-6 text-center text-gray-800">My Subjects</h1>
      
      <div className="w-4/5 mx-auto mb-6">
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4">Add New Subject</h2>
          {error && (
          <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-500" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-red-700">{error}</p>
              </div>
            </div>
          </div>
        )}
          <div className="flex gap-2">
            <select
              value={selectedSubjectId}
              onChange={(e) => setSelectedSubjectId(e.target.value)}
              className="w-[500px] flex-initial px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Select a subject</option>
              {allSubjects
                .filter(subject => !subjects.some(s => s.subjectId === subject.subjectId))
                .map((subject) => (
                  <option 
                    key={`subject-${subject.subjectId}`} 
                    value={String(subject.subjectId)}
                  >
                    {subject.title}
                  </option>
                ))}
            </select>
            <button
              onClick={handleAddSubject}
              disabled={!selectedSubjectId}
              className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed flex-initial w-64 "
            >
              Add Subject
            </button>
          </div>
        </div>
      </div>

      <div className="w-4/5 mx-auto mb-4">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search subjects..."
          className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          aria-label="Search subjects"
        />
      </div>

      <div className="overflow-x-auto bg-white rounded-lg shadow-md w-4/5 mx-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-100">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider rounded-tl-lg">
                Subject Name
              </th>
              <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-600 uppercase tracking-wider rounded-tr-lg">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredSubjects.map((subject) => (
              <tr  key={`subject-${subject.subjectId}`}  className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">{subject.title}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-4">
                  <Link 
                    href={`/instructor/subjects/${subject.subjectId}/students`}
                    className="text-blue-600 hover:text-blue-900 hover:underline"
                  >
                    View Students
                  </Link>
                  <button
                    onClick={() => handleDeleteSubject(subject.subjectId)}
                    className="text-red-600 hover:text-red-900"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filteredSubjects.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            {query ? 'No subjects match your search.' : 'No subjects found.'}
          </div>
        )}
      </div>
    </div>
    
        
  );
}
