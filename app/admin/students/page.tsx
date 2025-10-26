'use client';

import { useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, Plus, Edit, Trash2 } from 'lucide-react';
import { toast } from '@/components/ui/use-toast';

type Student = {
  id: number;
  studentNumber: string;
  firstName: string;
  middleName?: string;
  lastName: string;
  extensionName?: string;
  _count?: { uploads: number };
};

export default function AdminStudentsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [students, setStudents] = useState<Student[]>([]);
  const [filteredStudents, setFilteredStudents] = useState<Student[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loadingData, setLoadingData] = useState(true);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  const [formData, setFormData] = useState<Omit<Student, 'id' | '_count'>>({ 
    studentNumber: '',
    firstName: '',
    middleName: '',
    lastName: '',
    extensionName: '',

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
      studentNumber: '',
      firstName: '',
      middleName: '',
      lastName: '',
      extensionName: '',
     
    });
    setEditingStudent(null);
  };

  // Load and sort students
  const load = useCallback(async () => {
    try {
      setLoadingData(true);
      const res = await fetch('/api/students');
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data?.error || 'Failed to load students');
      }
      
      // Sort students by lastName, firstName, middleName, extensionName
      const sortedStudents = [...(data.students || [])].sort((a, b) => {
        const compareLast = a.lastName.localeCompare(b.lastName);
        if (compareLast !== 0) return compareLast;
        
        const compareFirst = a.firstName.localeCompare(b.firstName);
        if (compareFirst !== 0) return compareFirst;
        
        const compareMiddle = (a.middleName || '').localeCompare(b.middleName || '');
        if (compareMiddle !== 0) return compareMiddle;
        
        return (a.extensionName || '').localeCompare(b.extensionName || '');
      });
      
      setStudents(sortedStudents);
    } catch (error) {
      console.error('Error loading students:', error);
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to load students',
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
      const url = editingStudent 
        ? `/api/students/${editingStudent.id}`
        : '/api/students';
      
      const method = editingStudent ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to save student');
      }

      toast({
        title: 'Success',
        description: editingStudent 
          ? 'Student updated successfully' 
          : 'Student added successfully',
      });

      resetForm();
      setIsAddDialogOpen(false);
      load();
    } catch (error) {
      console.error('Error saving student:', error);
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to save student',
        variant: 'destructive',
      });
    }
  };

  // Handle edit student
  const handleEdit = (student: Student) => {
    setEditingStudent(student);
    setFormData({
      studentNumber: student.studentNumber,
      firstName: student.firstName,
      middleName: student.middleName || '',
      lastName: student.lastName,
      extensionName: student.extensionName || ''
 
    });
    setIsAddDialogOpen(true);
  };

  // Handle delete student
  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this student? This action cannot be undone.')) {
      return;
    }

    try {
      const response = await fetch(`/api/students/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to delete student');
      }

      toast({
        title: 'Success',
        description: 'Student deleted successfully',
      });

      load();
    } catch (error) {
      console.error('Error deleting student:', error);
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to delete student',
        variant: 'destructive',
      });
    }
  };

  // Filter students based on search term
  useEffect(() => {
    if (!searchTerm.trim()) {
      setFilteredStudents(students);
      return;
    }
    
    const term = searchTerm.toLowerCase();
    const filtered = students.filter(student => 
      (student.studentNumber?.toLowerCase() || '').includes(term) ||
      (student.firstName?.toLowerCase() || '').includes(term) ||
      (student.lastName?.toLowerCase() || '').includes(term) ||
      (student.middleName?.toLowerCase() || '').includes(term) ||
      (student.extensionName?.toLowerCase() || '').includes(term) 
    );
    setFilteredStudents(filtered);
  }, [searchTerm, students]);

  useEffect(() => {
    if (status === 'loading') return;
    if (!session?.user || session.user.role !== 'admin') {
      router.replace('/login/admin');
    }
  }, [status, session, router]);

  useEffect(() => {
    if (status !== 'authenticated' || !session?.user || session.user.role !== 'admin') return;
    load();
  }, [status, session, load]);

  if (status === 'loading' || loadingData) {
    return <div className="p-6">Loading...</div>;
  }

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Manage Students</h1>
        <div className="flex gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              type="text"
              placeholder="Search students..."
              className="pl-10 w-64"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <Button onClick={() => {
            resetForm();
            setIsAddDialogOpen(true);
          }}>
            <Plus className="mr-2 h-4 w-4" /> Add Student
          </Button>
        </div>
      </div>

      {/* Add/Edit Student Dialog */}
      {isAddDialogOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg w-full max-w-md">
            <h2 className="text-xl font-semibold mb-4">
              {editingStudent ? 'Edit Student' : 'Add New Student'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Student Number *</label>
                <Input
                  name="studentNumber"
                  value={formData.studentNumber}
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
                  {editingStudent ? 'Update' : 'Add'} Student
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="border rounded overflow-x-auto">
        {filteredStudents.length === 0 ? (
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Student Number
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Name
                  </th>
              
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Uploads
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {loadingData ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-4 text-center">
                      Loading...
                    </td>
                  </tr>
                ) : filteredStudents.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-4 text-center text-gray-500">
                      {searchTerm ? 'No matching students found' : 'No students found'}
                    </td>
                  </tr>
                ) : (
                  filteredStudents.map((student) => (
                    <tr key={student.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {student.studentNumber}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {`${student.lastName}${student.extensionName ? ' ' + student.extensionName + ',' : ','} ${student.firstName} ${student.middleName || ''}`.trim()}
                      </td>
                 
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {student._count?.uploads || 0}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEdit(student)}
                        >
                          <Edit className="h-4 w-4 mr-1" /> Edit
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-red-600 hover:text-red-900"
                          onClick={() => handleDelete(student.id)}
                        >
                          <Trash2 className="h-4 w-4 mr-1" /> Delete
                        </Button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        ) : (
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Student Number
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Name
                </th>
              
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Uploads
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredStudents.map((student) => (
                <tr key={student.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {student.studentNumber}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {`${student.lastName}${student.extensionName ? ' ' + student.extensionName + ',' : ','} ${student.firstName} ${student.middleName || ''}`.trim()}
                  </td>
               
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {student._count?.uploads || 0}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleEdit(student)}
                    >
                      <Edit className="h-4 w-4 mr-1" /> Edit
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-red-600 hover:text-red-900"
                      onClick={() => handleDelete(student.id)}
                    >
                      <Trash2 className="h-4 w-4 mr-1" /> Delete
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
