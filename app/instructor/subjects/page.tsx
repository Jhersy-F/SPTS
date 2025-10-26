'use client';

import React, { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';

interface Subject {
  subjectId: number;
  title: string;
  semester: string;
  year: number;
}

interface Section {
  id: number;
  name: string;
  _count: {
    students: number;
  };
}

export default function InstructorSubjectsPage() {
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [allSubjects, setAllSubjects] = useState<Array<{ subjectId: number; title: string }>>([]);
  const [sections, setSections] = useState<Record<number, Section[]>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [query, setQuery] = useState('');
  const [selectedSubjectId, setSelectedSubjectId] = useState<string>('');
  const [newSectionName, setNewSectionName] = useState('');
  const [isAddingSection, setIsAddingSection] = useState(false);
  const [isEditingSubject, setIsEditingSubject] = useState<number | null>(null);
  const [editSubjectData, setEditSubjectData] = useState<{
    title: string;
    semester: string;
    year: number;
  }>({ title: '', semester: '1st Semester', year: new Date().getFullYear() });
  const [activeSubjectId, setActiveSubjectId] = useState<number | null>(null);

  const fetchSections = useCallback(async (subjectId: number) => {
    try {
      const res = await fetch(`/api/instructor/subjects/${subjectId}/sections`);
      
      if (!res.ok) {
        const errorText = await res.text();
        console.error('Failed to fetch sections:', errorText);
        return;
      }
      
      try {
        const sectionsData = await res.json();
        setSections((prev: Record<number, Section[]>) => ({
          ...prev,
          [subjectId]: sectionsData
        }));
      } catch (jsonError) {
        console.error('Error parsing sections JSON:', jsonError);
      }
    } catch (error) {
      console.error('Error fetching sections:', error);
    }
  }, []);

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
      const formattedSubjects = Array.isArray(data) ? data.map(subj => ({
        subjectId: subj.subjectId || subj.subjectID,
        title: subj.title,
        semester: subj.semester || '1st Semester',
        year: subj.year || new Date().getFullYear()
      })) : [];
      
      setSubjects(formattedSubjects);
      
      // Set the first subject as active by default if none selected
      if (formattedSubjects.length > 0 && !activeSubjectId) {
        setActiveSubjectId(formattedSubjects[0].subjectId);
        fetchSections(formattedSubjects[0].subjectId);
      }
    } catch (error) {
      console.error('Error fetching subjects:', error);
      setError(error instanceof Error ? error.message : 'Failed to fetch subjects');
    } finally {
      setLoading(false);
    }
  }, [activeSubjectId, fetchSections]);

  const handleAddSubject = useCallback(async (subjectId: number) => {
    try {
      const response = await fetch('/api/instructor/subjects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          subjectId,
          semester: editSubjectData.semester,
          year: editSubjectData.year
        }),
        credentials: 'include',
      });

      const data = await response.json().catch(() => null);
      
      if (!response.ok) {
        console.error('Failed to add subject:', { status: response.status, data });
        throw new Error(
          (data && (data.message || data.error)) || 
          `Failed to add subject (${response.status})`
        );
      }
      
      setSelectedSubjectId('');
      await fetchMySubjects();
    } catch (error) {
      console.error('Error adding subject:', error);
      setError(error instanceof Error ? error.message : 'Failed to add subject');
    }
  }, [fetchMySubjects, editSubjectData]);


  const handleAddSection = async (subjectId: number) => {
    if (!newSectionName.trim()) return;
    
    try {
      const response = await fetch(`/api/instructor/subjects/${subjectId}/sections`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newSectionName }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to add section');
      }
      
      setNewSectionName('');
      setIsAddingSection(false);
      await fetchSections(subjectId);
    } catch (error) {
      console.error('Error adding section:', error);
      setError(error instanceof Error ? error.message : 'Failed to add section');
    }
  };

  const handleDeleteSection = async (sectionId: number, subjectId: number) => {
    if (!confirm('Are you sure you want to delete this section? This action cannot be undone.')) return;
    
    try {
      const response = await fetch(`/api/instructor/sections/${sectionId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete section');
      }
      
      await fetchSections(subjectId);
    } catch (error) {
      console.error('Error deleting section:', error);
      setError('Failed to delete section');
    }
  };

  const handleSubjectClick = (subjectId: number) => {
    setActiveSubjectId(activeSubjectId === subjectId ? null : subjectId);
    if (activeSubjectId !== subjectId) {
      fetchSections(subjectId);
    }
  };

  const handleEditSubject = (subject: Subject) => {
    setIsEditingSubject(subject.subjectId);
    setEditSubjectData({
      title: subject.title,
      semester: subject.semester,
      year: subject.year
    });
  };

  const handleUpdateSubject = async (subjectId: number) => {
    try {
      const response = await fetch(`/api/instructor/subjects/${subjectId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editSubjectData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update subject');
      }
      
      // Update the local state immediately for better UX
      setSubjects(prevSubjects => 
        prevSubjects.map(subject => 
          subject.subjectId === subjectId 
            ? { 
                ...subject, 
                semester: editSubjectData.semester, 
                year: editSubjectData.year 
              } 
            : subject
        )
      );
      
      setIsEditingSubject(null);
    } catch (error) {
      console.error('Error updating subject:', error);
      setError(error instanceof Error ? error.message : 'Failed to update subject');
    }
  };

  const handleDeleteSubject = async (subjectId: number) => {
    if (!confirm('Are you sure you want to delete this subject? This will also delete all sections and student enrollments for this subject.')) return;
    
    try {
      const response = await fetch(`/api/instructor/subjects/${subjectId}`, {
        method: 'DELETE',
      });

      if (!response.ok) throw new Error('Failed to delete subject');
      
      await fetchMySubjects();
      // Reset active subject if it was deleted
      if (activeSubjectId === subjectId) {
        setActiveSubjectId(null);
      }
      setIsEditingSubject(null);
    } catch (error) {
      console.error('Error deleting subject:', error);
      setError('Failed to delete subject');
    }
  };

  const handleCancelEdit = () => {
    setIsEditingSubject(null);
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
    return (
      subject.title.toLowerCase().includes(q) ||
      subject.semester.toLowerCase().includes(q) ||
      subject.year.toString().includes(q)
    );
  });

  const currentSections = activeSubjectId ? sections[activeSubjectId] || [] : [];

  return (
    <div className="p-4 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">My Subjects</h1>
          
          {/* Add Subject Form */}
          <div className="flex items-center space-x-4">
            <select
              value={selectedSubjectId}
              onChange={(e) => setSelectedSubjectId(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Select a subject to add</option>
              {allSubjects
                //.filter(subject => !subjects.some(s => s.subjectId === subject.subjectId))
                .map((subject) => (
                  <option key={`add-subject-${subject.subjectId}`} value={String(subject.subjectId)}>
                    {subject.title}
                  </option>
                ))}
            </select>
            <select
              value={editSubjectData.semester}
              onChange={(e) => setEditSubjectData({ ...editSubjectData, semester: e.target.value })}
              className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="1st Semester">1st Semester</option>
              <option value="2nd Semester">2nd Semester</option>
              <option value="Summer">Summer</option>
            </select>
            <input
              type="number"
              value={editSubjectData.year}
              onChange={(e) => setEditSubjectData({ ...editSubjectData, year: parseInt(e.target.value) })}
              className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 w-24"
              min={2000}
              max={9999}
            />
            <button
              onClick={() => selectedSubjectId && handleAddSubject(parseInt(selectedSubjectId))}
              disabled={!selectedSubjectId}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              Add Subject
            </button>
          </div>
        </div>

        {/* Error Message */}
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

        {/* Search Bar */}
        <div className="mb-6">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg className="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
              </svg>
            </div>
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search subjects by name, semester, or year..."
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            />
          </div>
        </div>

        {/* Subjects List */}
        <div className="bg-white shadow overflow-hidden sm:rounded-md">
          {filteredSubjects.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              {query ? 'No subjects match your search.' : 'No subjects found. Add a subject to get started.'}
            </div>
          ) : (
            <ul className="divide-y divide-gray-200">
              {filteredSubjects.map((subject) => (
                <li key={`subject-${subject.subjectId}`} className="hover:bg-gray-50">
                  <div 
                    className="px-4 py-4 sm:px-6 cursor-pointer"
                    onClick={() => handleSubjectClick(subject.subjectId)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        {isEditingSubject === subject.subjectId ? (
                          <div className="flex flex-col space-y-3 w-full">
                            <input
                              type="text"
                              value={editSubjectData.title}
                              readOnly
                              className="block w-full px-4 py-2.5 border border-gray-300 bg-gray-100 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-base rounded-sm cursor-not-allowed"
                              style={{ minWidth: '400px' }}
                            />
                            <div className="flex space-x-3 items-center">
                              <select
                                value={editSubjectData.semester}
                                onChange={(e) => setEditSubjectData({...editSubjectData, semester: e.target.value})}
                                className="block px-4 py-2.5 border border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-base rounded-sm"
                                style={{ minWidth: '180px' }}
                              >
                                <option value="1st Semester">1st Semester</option>
                                <option value="2nd Semester">2nd Semester</option>
                                <option value="Summer">Summer</option>
                              </select>
                              <input
                                type="number"
                                value={editSubjectData.year}
                                onChange={(e) => setEditSubjectData({...editSubjectData, year: parseInt(e.target.value)})}
                                className="block px-4 py-2.5 border border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-base rounded-sm"
                                style={{ width: '120px' }}
                              />
                            </div>
                          </div>
                        ) : (
                          <>
                            <div className="text-lg font-medium text-blue-600 truncate">
                              {subject.title}
                            </div>
                            <div className="ml-2 flex-shrink-0 flex">
                              <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                                {subject.semester} {subject.year}
                              </span>
                            </div>
                          </>
                        )}
                      </div>
                      <div className="ml-2 flex-shrink-0 flex">
                        {isEditingSubject === subject.subjectId ? (
                          <>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleUpdateSubject(subject.subjectId);
                              }}
                              className="text-green-600 hover:text-green-900 mr-2"
                              title="Save changes"
                            >
                              <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                              </svg>
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleCancelEdit();
                              }}
                              className="text-gray-600 hover:text-gray-900 mr-2"
                              title="Cancel"
                            >
                              <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                              </svg>
                            </button>
                          </>
                        ) : (
                          <>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleEditSubject(subject);
                              }}
                              className="text-blue-600 hover:text-blue-900 mr-2"
                              title="Edit subject"
                            >
                              <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                                <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                              </svg>
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDeleteSubject(subject.subjectId);
                              }}
                              className="text-red-600 hover:text-red-900 mr-2"
                              title="Delete subject"
                            >
                              <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                              </svg>
                            </button>
                          </>
                        )}
                        <svg
                          className={`h-5 w-5 text-gray-400 transform transition-transform ${activeSubjectId === subject.subjectId ? 'rotate-180' : ''}`}
                          xmlns="http://www.w3.org/2000/svg"
                          viewBox="0 0 20 20"
                          fill="currentColor"
                        >
                          <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                        </svg>
                      </div>
                    </div>
                  </div>

                  {/* Sections Panel */}
                  {activeSubjectId === subject.subjectId && (
                    <div className="border-t border-gray-200 bg-gray-50 px-4 py-4 sm:px-6">
                      <div className="flex justify-between items-center mb-4">
                        <h3 className="text-lg font-medium text-gray-900">Sections</h3>
                        <button
                          onClick={() => setIsAddingSection(!isAddingSection)}
                          className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                        >
                          {isAddingSection ? 'Cancel' : 'Add Section'}
                        </button>
                      </div>

                      {/* Add Section Form */}
                      {isAddingSection && (
                        <div className="mb-4 p-4 bg-white rounded-md shadow-sm border border-gray-200">
                          <div className="flex items-end space-x-2">
                            <div className="flex-1">
                              <label htmlFor="sectionName" className="block text-sm font-medium text-gray-700 mb-1">
                                Section Name
                              </label>
                              <input
                                type="text"
                                id="sectionName"
                                value={newSectionName}
                                onChange={(e) => setNewSectionName(e.target.value)}
                                className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
                                placeholder="e.g., Section A"
                              />
                            </div>
                            <button
                              onClick={() => handleAddSection(subject.subjectId)}
                              disabled={!newSectionName.trim()}
                              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-gray-400 disabled:cursor-not-allowed"
                            >
                              Save Section
                            </button>
                          </div>
                        </div>
                      )}

                      {/* Sections List */}
                      <div className="overflow-hidden bg-white shadow sm:rounded-md">
                        <ul className="divide-y divide-gray-200">
                          {currentSections.length > 0 ? (
                            currentSections.map((section) => (
                              <li key={`section-${section.id}`}>
                                <div className="flex items-center justify-between px-4 py-4 sm:px-6">
                                  <div className="flex items-center">
                                    <div className="text-sm font-medium text-gray-900">{section.name}</div>
                                    <div className="ml-2 flex-shrink-0 flex">
                                      <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-gray-100 text-gray-800">
                                        {section._count.students} {section._count.students === 1 ? 'student' : 'students'}
                                      </span>
                                    </div>
                                  </div>
                                  <div className="flex space-x-4">
                                    <Link
                                      href={`/instructor/sections/${section.id}/students`}
                                      className="text-blue-600 hover:text-blue-900"
                                    >
                                      View Students
                                    </Link>
                                    <button
                                      onClick={() => handleDeleteSection(section.id, subject.subjectId)}
                                      className="text-red-600 hover:text-red-900"
                                    >
                                      Delete
                                    </button>
                                  </div>
                                </div>
                              </li>
                            ))
                          ) : (
                            <li className="px-4 py-4 text-center text-gray-500">
                              No sections yet. Add a section to get started.
                            </li>
                          )}
                        </ul>
                      </div>
                    </div>
                  )}
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
