'use client';

import { useParams, useRouter } from 'next/navigation';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/use-toast';
import { Loader2, ArrowLeft, Search } from 'lucide-react';
import Link from 'next/link';

type Student = {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  studentId: string;
};

export default function AddStudentToSectionPage() {
  const { sectionId } = useParams();
  const router = useRouter();
  const { toast } = useToast();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState<Student[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isAdding, setIsAdding] = useState<Record<string, boolean>>({});

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchTerm.trim()) return;

    setIsSearching(true);
    try {
      const response = await fetch(`/api/students/search?q=${encodeURIComponent(searchTerm)}`);
      if (!response.ok) {
        throw new Error('Failed to search students');
      }
      const data = await response.json();
      setSearchResults(data);
    } catch (error) {
      console.error('Error searching students:', error);
      toast({
        title: 'Error',
        description: 'Failed to search for students. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsSearching(false);
    }
  };

  const handleAddStudent = async (studentId: string) => {
    setIsAdding(prev => ({ ...prev, [studentId]: true }));
    try {
      const response = await fetch(`/api/instructor/sections/${sectionId}/students`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ studentId }),
      });

      if (!response.ok) {
        const error = await response.text();
        throw new Error(error || 'Failed to add student to section');
      }

      toast({
        title: 'Success',
        description: 'Student added to section successfully!',
      });
      
      // Redirect back to the students list
      router.push(`/instructor/sections/${sectionId}/students`);
      router.refresh();
    } catch (error) {
      console.error('Error adding student:', error);
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to add student',
        variant: 'destructive',
      });
    } finally {
      setIsAdding(prev => ({ ...prev, [studentId]: false }));
    }
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto px-4">
      <div className="flex items-center gap-4">
        <Button variant="outline" size="icon" asChild>
          <Link href={`/instructor/sections/${sectionId}/students`}>
            <ArrowLeft className="h-4 w-4" />
            <span className="sr-only">Back</span>
          </Link>
        </Button>
        <h1 className="text-3xl font-bold">Add Student to Section</h1>
      </div>

      <Card className="w-full">
        <CardHeader>
          <CardTitle>Search for Students</CardTitle>
          <CardDescription>
            Search for students by name, email, or student ID to add them to this section.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSearch} className="space-y-4">
            <div className="flex gap-2 w-full">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Search by name, email, or student ID"
                  className="pl-10 w-full"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <Button 
                type="submit" 
                disabled={isSearching || !searchTerm.trim()}
                className="shrink-0"
              >
                {isSearching ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Searching...
                  </>
                ) : (
                  'Search'
                )}
              </Button>
            </div>
          </form>

          {searchResults.length > 0 && (
            <div className="mt-6 space-y-2 w-full">
              <h3 className="font-medium">Search Results</h3>
              <div className="border rounded-md divide-y w-full">
                {searchResults.map((student) => (
                  <div 
                    key={student.id} 
                    className="p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2"
                  >
                    <div className="w-full sm:w-auto">
                      <p className="font-medium">{`${student.firstName} ${student.lastName}`}</p>
                      <p className="text-sm text-muted-foreground">
                        {student.email} • {student.studentId}
                      </p>
                    </div>
                    <Button
                      onClick={() => handleAddStudent(student.id)}
                      disabled={isAdding[student.id]}
                      className="w-full sm:w-auto justify-center sm:justify-start"
                    >
                      {isAdding[student.id] ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Adding...
                        </>
                      ) : (
                        'Add to Section'
                      )}
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {searchResults.length === 0 && searchTerm && !isSearching && (
            <div className="mt-6 text-center text-muted-foreground">
              No students found matching your search.
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
