'use client';

import React, { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { useParams } from 'next/navigation';
import { Pencil, Trash2, Users } from 'lucide-react';

interface Section {
  id: number;
  name: string;
  _count: {
    students: number;
  };
}

export default function InstructorSectionsPage() {
  const params = useParams();
  const [sections, setSections] = useState<Section[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [newSectionName, setNewSectionName] = useState('');

  const fetchSections = useCallback(async () => {
    try {
      const res = await fetch(`/api/instructor/subjects/${params.subjectId}/sections`);
      const data = await res.json();
      
      if (!res.ok) {
        throw new Error(data.error || 'Failed to fetch sections');
      }
      
      setSections(data);
    } catch (error) {
      console.error('Error fetching sections:', error);
      setError(error instanceof Error ? error.message : 'Failed to fetch sections');
    } finally {
      setLoading(false);
    }
  }, [params.subjectId]);

  const handleAddSection = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSectionName.trim()) return;

    try {
      const response = await fetch(`/api/instructor/subjects/${params.subjectId}/sections`, {
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

      // Refresh sections
      fetchSections();
      
      // Reset form
      setNewSectionName('');
    } catch (error) {
      console.error('Error adding section:', error);
      setError(error instanceof Error ? error.message : 'Failed to add section');
    }
  };

  const handleDeleteSection = async (sectionId: number) => {
    if (!confirm('Are you sure you want to delete this section? This action cannot be undone.')) return;
    
    try {
      const response = await fetch(`/api/instructor/subjects/${params.subjectId}/sections/${sectionId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to delete section');
      }
      
      fetchSections();
    } catch (error) {
      console.error('Error deleting section:', error);
      setError(error instanceof Error ? error.message : 'Failed to delete section');
    }
  };

  useEffect(() => {
    fetchSections();
  }, [fetchSections]);

  if (loading) {
    return (
      <div className="text-center p-8">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
        <p className="mt-2 text-gray-600">Loading sections...</p>
      </div>
    );
  }

  return (
    <div className="p-4 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold text-gray-900">Sections</h1>
          
          <div className="flex items-center space-x-4">
            <Button variant="outline" asChild>
              <Link href="/instructor/subjects">
                Back to Subjects
              </Link>
            </Button>
          </div>
        </div>

        {/* Add Section Form */}
        <form onSubmit={handleAddSection} className="flex gap-2">
          <input
            type="text"
            value={newSectionName}
            onChange={(e) => setNewSectionName(e.target.value)}
            placeholder="Enter section name..."
            className="flex-1 px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <Button type="submit" disabled={!newSectionName.trim()}>
            Add Section
          </Button>
        </form>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border-l-4 border-red-500 p-4">
            <div className="flex">
              <div className="ml-3">
                <p className="text-sm text-red-700">{error}</p>
              </div>
            </div>
          </div>
        )}

        {/* Sections Table */}
        <div className="bg-white shadow-md rounded-lg overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableCell className="font-medium">Section Name</TableCell>
                <TableCell className="font-medium text-center">Students</TableCell>
                <TableCell className="font-medium text-right">Actions</TableCell>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sections.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={3} className="text-center text-gray-500 py-4">
                    No sections found. Add a section to get started.
                  </TableCell>
                </TableRow>
              ) : (
                sections.map((section) => (
                  <TableRow key={section.id}>
                    <TableCell>{section.name}</TableCell>
                    <TableCell className="text-center">
                      <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-gray-100 text-gray-800">
                        {section._count.students} {section._count.students === 1 ? 'student' : 'students'}
                      </span>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDeleteSection(section.id)}
                          title="Delete Section"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          asChild
                          title="View Students"
                        >
                          <Link href={`/instructor/sections/${section.id}/students`}>
                            <Users className="h-4 w-4" />
                          </Link>
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
}