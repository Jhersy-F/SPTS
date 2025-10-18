'use client';

import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useToast } from '@/components/ui/use-toast';
import { Student } from '@prisma/client';
import { Loader2, PlusCircle } from 'lucide-react';
import Link from 'next/link';

export default function SectionStudentsPage() {
  const { sectionId } = useParams();
  const [students, setStudents] = useState<Student[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const fetchStudents = async () => {
      try {
        const response = await fetch(`/api/instructor/sections/${sectionId}/students`);
        if (!response.ok) {
          throw new Error('Failed to fetch students');
        }
        const data = await response.json();
        setStudents(data);
      } catch (error) {
        console.error('Error fetching students:', error);
        toast({
          title: 'Error',
          description: 'Failed to load students. Please try again.',
          variant: 'destructive',
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchStudents();
  }, [sectionId, toast]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-6xl mx-auto px-4">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Students in Section</h1>
        <Button asChild>
          <Link href={`/instructor/sections/${sectionId}/students/add`}>
            <PlusCircle className="mr-2 h-4 w-4" />
            Add Student
          </Link>
        </Button>
      </div>

      <Card className="w-full">
        <CardHeader>
          <CardTitle>Student List</CardTitle>
        </CardHeader>
        <CardContent>
          {students.length === 0 ? (
            <p className="text-muted-foreground">No students found in this section.</p>
          ) : (
            <div className="w-full overflow-x-auto">
              <Table className="min-w-full">
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-1/3">Name</TableHead>
                    <TableHead className="w-1/3">Student Number</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {students.map((student) => (
                    <TableRow key={student.id}>
                      <TableCell className="w-1/3">
                        <div className="font-medium">
                          {student.firstName} {student.lastName}
                        </div>
                        {student.middleName && (
                          <div className="text-sm text-muted-foreground">
                            {student.middleName}
                          </div>
                        )}
                      </TableCell>
                      <TableCell className="w-1/3 font-mono">
                        {student.studentNumber}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="sm" asChild>
                          <Link href={`/instructor/students/${student.id}`}>View</Link>
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
