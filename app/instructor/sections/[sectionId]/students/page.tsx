'use client';

import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useToast } from '@/components/ui/use-toast';
import { Student } from '@prisma/client';
import { Loader2, PlusCircle, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function SectionStudentsPage() {
  const { sectionId } = useParams();
  const [students, setStudents] = useState<Student[]>([]);
  const [section, setSection] = useState<{instructorSubjectId?: number} | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        
        // Fetch section details first to get instructorSubjectSubjectId
        const sectionRes = await fetch(`/api/instructor/sections/${sectionId}`);
        if (!sectionRes.ok) throw new Error('Failed to fetch section details');
        const sectionData = await sectionRes.json();
        
        setSection(sectionData);
        

        // Then fetch students
        const studentsRes = await fetch(`/api/instructor/sections/${sectionId}/students`);
        if (!studentsRes.ok) throw new Error('Failed to fetch students');
        const studentsData = await studentsRes.json();
        
        setStudents(studentsData);
      } catch (error) {
        console.error('Error fetching data:', error);
        toast({
          title: 'Error',
          description: 'Failed to load data. Please try again.',
          variant: 'destructive',
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
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
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center space-x-4">
          <Button variant="outline" asChild>
            <Link href="/instructor/subjects">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Subjects
            </Link>
          </Button>
          <h1 className="text-2xl font-bold">Students</h1>
        </div>
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
                          {student.firstName} {student.middleName} {student.lastName}
                        </div>
                       
                      </TableCell>
                      <TableCell className="w-1/3 font-mono">
                        {student.studentNumber}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="sm" asChild>
                          <Link href={`/instructor/students/${student.id}/uploads?subjectid=${section?.instructorSubjectId || ''}`}>
                            View Uploads
                          </Link>
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
