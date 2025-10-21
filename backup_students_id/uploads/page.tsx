'use client';

import { useParams, useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useToast } from '@/components/ui/use-toast';
import { Loader2, ArrowLeft, Download } from 'lucide-react';
import Link from 'next/link';

type Upload = {
  id: number;
  title: string;
  description: string;
  type: string;
  link: string;
  createdAt: string;
  subject: {
    title: string;
  };
};

export default function StudentUploadsPage() {
  const { id } = useParams();
  const searchParams = useSearchParams();
  const subjectId = searchParams.get('subjectId');
  
  const [uploads, setUploads] = useState<Upload[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [studentName, setStudentName] = useState('');
  const { toast } = useToast();

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        // Fetch student details
        const studentRes = await fetch(`/api/students/${id}`);
        if (!studentRes.ok) throw new Error('Failed to fetch student details');
        const studentData = await studentRes.json();
        setStudentName(`${studentData.firstName} ${studentData.lastName}`);

        // Fetch student's uploads for the subject
        const uploadsRes = await fetch(`/api/uploads?studentId=${id}&subjectId=${subjectId}`);
        if (!uploadsRes.ok) throw new Error('Failed to fetch uploads');
        const uploadsData = await uploadsRes.json();
        setUploads(uploadsData);
      } catch (error) {
        console.error('Error:', error);
        toast({
          title: 'Error',
          description: 'Failed to load student uploads. Please try again.',
          variant: 'destructive',
        });
      } finally {
        setIsLoading(false);
      }
    };

    if (id && subjectId) {
      fetchData();
    }
  }, [id, subjectId, toast]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-6xl mx-auto px-4">
      <div className="flex items-center space-x-4 mb-6">
        <Button variant="outline" size="sm" asChild>
          <Link href={`/instructor/sections/${subjectId}/students`}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Students
          </Link>
        </Button>
        <h1 className="text-2xl font-bold">{studentName}'s Uploads</h1>
      </div>

      <Card className="w-full">
        <CardHeader>
          <CardTitle>Uploaded Documents</CardTitle>
        </CardHeader>
        <CardContent>
          {uploads.length === 0 ? (
            <p className="text-muted-foreground">No uploads found for this student.</p>
          ) : (
            <div className="w-full overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Title</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Date Uploaded</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {uploads.map((upload) => (
                    <TableRow key={upload.id}>
                      <TableCell className="font-medium">{upload.title}</TableCell>
                      <TableCell>{upload.description}</TableCell>
                      <TableCell className="capitalize">{upload.type}</TableCell>
                      <TableCell>
                        {new Date(upload.createdAt).toLocaleDateString()}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="sm" asChild>
                          <a 
                            href={upload.link} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="flex items-center"
                          >
                            <Download className="mr-2 h-4 w-4" />
                            Download
                          </a>
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
