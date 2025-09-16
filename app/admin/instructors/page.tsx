'use client';

import { useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';
import { ChangePasswordDialog } from '@/components/admin/ChangePasswordDialog';
// Layout provides AdminSidebar and TopBar

export default function AdminInstructorsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  interface Instructor {
    id: number;
    username: string;
    firstName: string;
    lastName: string;
  }

  const [instructors, setInstructors] = useState<Instructor[]>([]);
  const [filteredInstructors, setFilteredInstructors] = useState<Instructor[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loadingData, setLoadingData] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (status === 'loading') return;
    if (!session?.user || session.user.role !== 'admin') {
      router.replace('/login/admin');
    }
  }, [status, session, router]);

  const filterInstructors = useCallback((instructorsList: Instructor[], term: string) => {
    if (!term.trim()) {
      setFilteredInstructors(instructorsList);
      return;
    }
    
    const lowerTerm = term.toLowerCase();
    const filtered = instructorsList.filter(instructor => 
      instructor.username.toLowerCase().includes(lowerTerm) || 
      instructor.firstName.toLowerCase().includes(lowerTerm) || 
      instructor.lastName.toLowerCase().includes(lowerTerm)
    );
    setFilteredInstructors(filtered);
  }, []);

  // Load instructors only once on component mount
  const loadInstructors = useCallback(async () => {
    try {
      setLoadingData(true);
      setError('');
      const res = await fetch('/api/instructors');
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || 'Failed to load instructors');
      const instructorsData = data.instructors || [];
      setInstructors(instructorsData);
      filterInstructors(instructorsData, searchTerm);
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : 'Failed to load instructors';
      setError(message);
    } finally {
      setLoadingData(false);
    }
  }, [filterInstructors]);

  // Handle search input changes
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };


  // Load instructors on mount
  useEffect(() => {
    if (status !== 'authenticated' || !session?.user || session.user.role !== 'admin') return;
    loadInstructors();
  }, [status, session, loadInstructors]);

  // Filter instructors when search term changes
  useEffect(() => {
    filterInstructors(instructors, searchTerm);
  }, [searchTerm, instructors, filterInstructors]);


  if (status === 'loading' || loadingData) {
    return <div className="p-6">Loading...</div>;
  }

  return (
    <div className="max-w-5xl mx-auto p-6 space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-2xl font-bold">Instructors</h1>
        <div className="relative w-full sm:w-96">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search instructors..."
            className="w-full pl-8"
            value={searchTerm}
            onChange={handleSearchChange}
          />
        </div>
      </div>
      {error && <div className="bg-red-100 text-red-700 px-3 py-2 rounded">{error}</div>}

      <div className="border rounded overflow-x-auto">
        {filteredInstructors.length === 0 ? (
          <div className="p-4 text-gray-600">No instructors found.</div>
        ) : (
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Username</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">First Name</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Last Name</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredInstructors.map((i) => (
                <tr key={i.id}>
                  <td className="px-4 py-2">{i.username}</td>
                  <td className="px-4 py-2">{i.firstName}</td>
                  <td className="px-4 py-2">{i.lastName}</td>
                  <td className="px-4 py-2">
                    <ChangePasswordDialog 
                      userId={i.id} 
                      userType="instructor" 
                      userName={`${i.firstName} ${i.lastName} (${i.username})`}
                    >
                      <Button variant="ghost" size="sm">
                        Change Password
                      </Button>
                    </ChangePasswordDialog>
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
