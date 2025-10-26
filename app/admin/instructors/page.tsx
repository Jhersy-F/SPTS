'use client';

import { useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, Plus, Edit, Trash2 } from 'lucide-react';
import { toast } from '@/components/ui/use-toast';

type Instructor = {
  id: number;
  username: string;
  firstName: string;
  middleName?: string;
  lastName: string;
  extensionName?: string;
};

type InstructorFormData = {
  username: string;
  firstName: string;
  middleName?: string;
  lastName: string;
  extensionName?: string;
};

export default function AdminInstructorsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  
  const [instructors, setInstructors] = useState<Instructor[]>([]);
  const [filteredInstructors, setFilteredInstructors] = useState<Instructor[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loadingData, setLoadingData] = useState(true);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingInstructor, setEditingInstructor] = useState<Instructor | null>(null);
  const [formData, setFormData] = useState<InstructorFormData>({ 
    username: '',
    firstName: '',
    middleName: '',
    lastName: '',
    extensionName: ''
  });

  // Handle form input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Reset form
  const resetForm = () => {
    setFormData({
      username: '',
      firstName: '',
      middleName: '',
      lastName: '',
      extensionName: ''
    });
    setEditingInstructor(null);
  };

  // Load and sort instructors
  const load = useCallback(async () => {
    try {
      setLoadingData(true);
      const res = await fetch('/api/instructors');
      const data = await res.json();
      
      if (!res.ok) {
        throw new Error(data?.error || 'Failed to load instructors');
      }
      
      // Sort instructors by lastName, firstName, middleName, extensionName
      const sortedInstructors = [...(data.instructors || [])].sort((a, b) => {
        const compareLast = a.lastName.localeCompare(b.lastName);
        if (compareLast !== 0) return compareLast;
        
        const compareFirst = a.firstName.localeCompare(b.firstName);
        if (compareFirst !== 0) return compareFirst;
        
        const compareMiddle = (a.middleName || '').localeCompare(b.middleName || '');
        if (compareMiddle !== 0) return compareMiddle;
        
        return (a.extensionName || '').localeCompare(b.extensionName || '');
      });
      
      setInstructors(sortedInstructors);
      setFilteredInstructors(sortedInstructors);
    } catch (error) {
      console.error('Error loading instructors:', error);
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to load instructors',
        variant: 'destructive',
      });
    } finally {
      setLoadingData(false);
    }
  }, []);

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const url = editingInstructor 
        ? `/api/instructors/${editingInstructor.id}`
        : '/api/instructors';
      
      const method = editingInstructor ? 'PUT' : 'POST';
      
      // If creating new instructor, add password = lastName
      // Send just the form data without passwords - they will be handled server-side
      const dataToSubmit = formData;

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(dataToSubmit),
      });

      if (!response.ok) {
        const errorData = await response.json();
        // Handle validation errors
        if (errorData.error?.fieldErrors) {
          const errors = Object.entries(errorData.error.fieldErrors)
            .map(([field, messages]) => `${field}: ${(messages as string[]).join(', ')}`)
            .join('\n');
          throw new Error(`Validation failed:\n${errors}`);
        }
        throw new Error(typeof errorData.error === 'string' ? errorData.error : 'Failed to save instructor');
      }

      toast({
        title: 'Success',
        description: editingInstructor 
          ? 'Instructor updated successfully' 
          : 'Instructor added successfully',
      });

      resetForm();
      setIsAddDialogOpen(false);
      load();
    } catch (error) {
      console.error('Error saving instructor:', error);
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to save instructor',
        variant: 'destructive',
      });
    }
  };

  // Handle edit instructor
  const handleEdit = (instructor: Instructor) => {
    setEditingInstructor(instructor);
    setFormData({
      username: instructor.username,
      firstName: instructor.firstName,
      middleName: instructor.middleName || '',
      lastName: instructor.lastName,
      extensionName: instructor.extensionName || ''
    });
    setIsAddDialogOpen(true);
  };

  // Handle delete instructor
  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this instructor? This action cannot be undone.')) {
      return;
    }

    try {
      const response = await fetch(`/api/instructors/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to delete instructor');
      }

      toast({
        title: 'Success',
        description: 'Instructor deleted successfully',
      });

      load();
    } catch (error) {
      console.error('Error deleting instructor:', error);
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to delete instructor',
        variant: 'destructive',
      });
    }
  };

  // Filter instructors when search term changes
  useEffect(() => {
    if (!searchTerm.trim()) {
      setFilteredInstructors(instructors);
      return;
    }
    
    const term = searchTerm.toLowerCase();
    const filtered = instructors.filter(instructor => 
      (instructor.username?.toLowerCase() || '').includes(term) ||
      (instructor.firstName?.toLowerCase() || '').includes(term) ||
      (instructor.lastName?.toLowerCase() || '').includes(term) ||
      (instructor.middleName?.toLowerCase() || '').includes(term) ||
      (instructor.extensionName?.toLowerCase() || '').includes(term)
    );
    setFilteredInstructors(filtered);
  }, [searchTerm, instructors]);

  // Load instructors when component mounts or status changes
  useEffect(() => {
    if (status === 'loading') return;
    if (!session?.user || session.user.role !== 'admin') {
      router.replace('/login/admin');
      return;
    }
    load();
  }, [status, session, router, load]);

  if (status === 'loading' || loadingData) {
    return <div className="p-6">Loading...</div>;
  }

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Manage Instructors</h1>
        <div className="flex gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              type="text"
              placeholder="Search instructors..."
              className="pl-10 w-64"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <Button onClick={() => {
            resetForm();
            setIsAddDialogOpen(true);
          }}>
            <Plus className="mr-2 h-4 w-4" /> Add Instructor
          </Button>
        </div>
      </div>

      {/* Add/Edit Instructor Dialog */}
      {isAddDialogOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg w-full max-w-md">
            <h2 className="text-xl font-semibold mb-4">
              {editingInstructor ? 'Edit Instructor' : 'Add New Instructor'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Username *</label>
                <Input
                  name="username"
                  value={formData.username}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">First Name *</label>
                <Input
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Middle Name</label>
                <Input
                  name="middleName"
                  value={formData.middleName}
                  onChange={handleInputChange}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Last Name *</label>
                <Input
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Extension Name (e.g. Jr, Sr, III)</label>
                <Input
                  name="extensionName"
                  value={formData.extensionName}
                  onChange={handleInputChange}
                />
              </div>
              <div className="flex justify-end gap-2 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setIsAddDialogOpen(false);
                    resetForm();
                  }}
                >
                  Cancel
                </Button>
                <Button type="submit">
                  {editingInstructor ? 'Update' : 'Add'} Instructor
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="border rounded overflow-x-auto">
        {filteredInstructors.length === 0 ? (
          <div className="p-4 text-gray-600">No instructors found.</div>
        ) : (
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Username
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Name
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {loadingData ? (
                <tr>
                  <td colSpan={3} className="px-6 py-4 text-center">
                    Loading...
                  </td>
                </tr>
              ) : filteredInstructors.length === 0 ? (
                <tr>
                  <td colSpan={3} className="px-6 py-4 text-center text-gray-500">
                    {searchTerm ? 'No matching instructors found' : 'No instructors found'}
                  </td>
                </tr>
              ) : (
                filteredInstructors.map((instructor) => (
                  <tr key={instructor.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {instructor.username}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {`${instructor.lastName}${instructor.extensionName ? ' ' + instructor.extensionName + ',' : ','} ${instructor.firstName} ${instructor.middleName || ''}`.trim()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEdit(instructor)}
                      >
                        <Edit className="h-4 w-4 mr-1" /> Edit
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-red-600 hover:text-red-900"
                        onClick={() => handleDelete(instructor.id)}
                      >
                        <Trash2 className="h-4 w-4 mr-1" /> Delete
                      </Button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
