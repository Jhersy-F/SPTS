'use client';

import React, { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { 
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Pencil, Trash2, Users } from 'lucide-react';

// Types
interface Subject {
  id: number;  // InstructorSubject id
  subjectId: number; // Using number consistently
  title: string;
  semester: string;
  year: string;
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
    year: string;
  }>({ title: '', semester: '1st Semester', year: new Date().getFullYear().toString() });
  const [activeSubjectId, setActiveSubjectId] = useState<{id: number, subjectId: number} | null>(null);

  const fetchSections = useCallback(async (subject: Subject) => {
    if (!subject?.id) {
      console.warn('Skipping sections fetch - no instructor subject ID provided');
      return;
    }

    try {
      // Use subject.id (InstructorSubject.id) instead of subject.subjectId
      const res = await fetch(`/api/instructor/subjects/${subject.id}/sections`);
      const data = await res.json();
      
      if (!res.ok) {
        console.error('Failed to fetch sections:', data.error || 'Unknown error');
        return;
      }
      
      setSections((prev: Record<number, Section[]>) => ({
        ...prev,
        [subject.id]: data
      }));
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
        id: subj.id,
        subjectId: subj.subjectId || subj.subjectID,
        title: subj.title,
        semester: subj.semester || '1st Semester',
        year: subj.year || new Date().getFullYear().toString()
      })) : [];
      console.log(formattedSubjects);
      setSubjects(formattedSubjects);
      
      // Set the first subject as active by default if none selected
      if (formattedSubjects.length > 0 && !activeSubjectId) {
        setActiveSubjectId(formattedSubjects[0].subjectId);
        fetchSections(formattedSubjects[0].id);
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


  const handleAddSection = async (subject: Subject) => {
    if (!newSectionName.trim()) return;

    try {
      // Use subject.id (InstructorSubject.id) for the API call
      const response = await fetch(`/api/instructor/subjects/${subject.id}/sections`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: newSectionName.trim(),
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to add section');
      }

        const newSection = await response.json();
      
      // Update sections state
      setSections(prev => ({
        ...prev,
        [subject.id]: [...(prev[subject.id] || []), newSection]
      }));
      
      // Reset form
      setNewSectionName('');
      setIsAddingSection(false);
    } catch (error) {
      console.error('Error adding section:', error);
      setError(error instanceof Error ? error.message : 'Failed to add section');
    }
  };

  const handleDeleteSection = async (sectionId: number, subject: Subject) => {
    if (!confirm('Are you sure you want to delete this section? This action cannot be undone.')) return;
    
    try {
      // Use subject.id (InstructorSubject.id) for the API call
      const response = await fetch(`/api/instructor/subjects/${subject.id}/sections/${sectionId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to delete section');
      }
      
      await fetchSections(subject);
    } catch (error) {
      console.error('Error deleting section:', error);
      setError(error instanceof Error ? error.message : 'Failed to delete section');
    }
  };

  const handleSubjectClick = useCallback((subject: Subject) => {
    if (!subject?.id || !subject?.subjectId) {
      console.warn('Invalid subject clicked');
      return;
    }

    // If any subject is being edited, don't allow expanding sections
    if (isEditingSubject !== null) {
      return;
    }

    // If clicking the same subject, toggle its sections off
    if (activeSubjectId?.id === subject.id && activeSubjectId?.subjectId === subject.subjectId) {
      setActiveSubjectId(null);
      setIsAddingSection(false); // Reset section adding state when closing
    } else {
      // If clicking a different subject, show its sections and hide others
      setActiveSubjectId({ id: subject.id, subjectId: subject.subjectId });
      setIsAddingSection(false); // Reset section adding state
      
      // Only fetch if we don't already have the sections
      if (!sections[subject.id]) {
        fetchSections(subject);
      }
    }
  }, [activeSubjectId, sections, fetchSections, isEditingSubject]);

  const handleEditSubject = (subject: Subject) => {
    setIsEditingSubject(subject.id); // Use the instructor subject ID instead of subject ID
    setEditSubjectData({
      title: subject.title,
      semester: subject.semester,
      year: subject.year
    });
    // Close sections panel if it's open
    if (activeSubjectId?.id === subject.id) {
      setActiveSubjectId(null);
    }
  };

  const handleUpdateSubject = async (instructorSubjectId: number) => {
    try {
      const response = await fetch(`/api/instructor/subjects/${instructorSubjectId}`, {
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
          subject.id === instructorSubjectId // Match by instructor subject ID
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

  const handleDeleteSubject = async (instructorSubjectId: number, subjectId: number) => {
    if (!confirm('Are you sure you want to delete this subject? This will also delete all sections and student enrollments for this subject.')) return;
    
    try {
      const response = await fetch(`/api/instructor/subjects/${subjectId}`, {
        method: 'DELETE',
      });

      if (!response.ok) throw new Error('Failed to delete subject');
      
      await fetchMySubjects();
      // Reset active subject if it was deleted
      if (activeSubjectId?.id === instructorSubjectId) {
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



  const filteredSubjects = subjects.filter(subject => {
    const q = query.trim().toLowerCase();
    if (!q) return true;
    return (
      subject.title.toLowerCase().includes(q) ||
      subject.semester.toLowerCase().includes(q) ||
      subject.year.toString().includes(q)
    );
  });

  return (
    <div className="p-4 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex justify-between items-center">
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
              type="text"
              value={editSubjectData.year}
              onChange={(e) => setEditSubjectData({ ...editSubjectData, year: e.target.value })}
              className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 w-24"
              placeholder="Year"
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

        {/* Subjects Table */}
        <div className="bg-white shadow-md rounded-lg overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Subject</TableHead>
                <TableHead>Semester</TableHead>
                <TableHead>Year</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredSubjects.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center text-gray-500 py-4">
                    {query ? 'No subjects match your search.' : 'No subjects found. Add a subject to get started.'}
                  </TableCell>
                </TableRow>
              ) : (
                filteredSubjects.map((subject) => (
                  <TableRow key={`subject-${subject.id}`} className="hover:bg-gray-50">
                    <TableCell>
                      <span className="font-medium text-blue-600">{subject.title}</span>
                    </TableCell>
                    <TableCell>
                      {isEditingSubject === subject.id ? (
                        <select
                          value={editSubjectData.semester}
                          onChange={(e) => setEditSubjectData({...editSubjectData, semester: e.target.value})}
                          className="w-full px-2 py-1 border border-gray-300 rounded-sm bg-white"
                          autoFocus
                        >
                          <option value="1st Semester">1st Semester</option>
                          <option value="2nd Semester">2nd Semester</option>
                          <option value="Summer">Summer</option>
                        </select>
                      ) : (
                        <span>{subject.semester}</span>
                      )}
                    </TableCell>
                    <TableCell>
                      {isEditingSubject === subject.id ? (
                        <input
                          type="text"
                          value={editSubjectData.year}
                          onChange={(e) => setEditSubjectData({...editSubjectData, year: e.target.value})}
                          className="w-24 px-2 py-1 border border-gray-300 rounded-sm bg-white"
                          placeholder="Year"
                        />
                      ) : (
                        <span>{subject.year}</span>
                      )}
                    </TableCell>
                    <TableCell className="text-right space-x-2">
                      {isEditingSubject === subject.id ? (
                        <>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleUpdateSubject(subject.id);
                            }}
                            className="bg-green-50 text-green-600 hover:bg-green-100"
                          >
                            Save
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleCancelEdit();
                            }}
                            className="bg-red-50 text-red-600 hover:bg-red-100"
                          >
                            Cancel
                          </Button>
                        </>
                      ) : (
                        <>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleSubjectClick(subject)}
                            title="View sections"
                          >
                            <Users className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleEditSubject(subject);
                            }}
                            title="Edit subject"
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteSubject(subject.id, subject.subjectId);
                            }}
                            className="text-red-600 hover:text-red-900"
                            title="Delete subject"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </>
                      )}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        {/* Sections Panel */}
        {activeSubjectId !== null && (
          <div className="mt-8 border-t border-gray-200 bg-gray-50 px-4 py-4 sm:px-6">
            {/* Active Subject Header */}
            {subjects.find(s => s.id === activeSubjectId.id) && (
              <div className="mb-6">
                <h2 className="text-2xl font-bold text-gray-900">
                  {subjects.find(s => s.id === activeSubjectId.id)?.title}
                </h2>
                <p className="text-sm text-gray-600 mt-1">
                  {subjects.find(s => s.id === activeSubjectId.id)?.semester} • Year: {subjects.find(s => s.id === activeSubjectId.id)?.year}
                </p>
                <div className="h-0.5 bg-gray-200 mt-4"></div>
              </div>
            )}

            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium text-gray-900">Sections</h3>
              <Button
                onClick={() => setIsAddingSection(!isAddingSection)}
                variant={isAddingSection ? "outline" : "default"}
              >
                {isAddingSection ? 'Cancel' : 'Add Section'}
              </Button>
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
                  <Button
                    onClick={() => {
                      const subject = subjects.find(s => s.id === activeSubjectId?.id);
                      if (subject) {
                        handleAddSection(subject);
                      }
                    }}
                    disabled={!newSectionName.trim()}
                  >
                    Save Section
                  </Button>
                </div>
              </div>
            )}

            {/* Sections Table */}
            <div className="bg-white shadow-md rounded-lg overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Students</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {activeSubjectId && sections[activeSubjectId.id]?.length > 0 ? (
                    sections[activeSubjectId.id].map((section) => (
                      <TableRow key={`section-${section.id}`}>
                        <TableCell>
                          <span className="font-medium">{section.name}</span>
                        </TableCell>
                        <TableCell>
                          <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-gray-100 text-gray-800">
                            {section._count.students} {section._count.students === 1 ? 'student' : 'students'}
                          </span>
                        </TableCell>
                        <TableCell className="text-right space-x-2">
                          <Link href={`/instructor/sections/${section.id}/students`}>
                            <Button variant="ghost" size="sm">
                              <Users className="mr-1 h-4 w-4" />
                              View Students
                            </Button>
                          </Link>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              const subject = subjects.find(s => s.id === activeSubjectId.id);
                              if (subject) {
                                handleDeleteSection(section.id, subject);
                              }
                            }}
                            className="text-red-600 hover:text-red-900"
                          >
                            Delete
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={3} className="text-center text-gray-500 py-4">
                        No sections yet. Add a section to get started.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
