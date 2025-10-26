'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function InstructionsPage() {
  return (
    <div className="container mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Admin Instructions</h1>
      
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Managing Students</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h3 className="font-medium mb-2">Student and Instructor Passwords Format</h3>
            <ol className="list-decimal pl-5 space-y-2">
              <li>Students: studentNumber + lastName (e.g., if studentNumber is 2023001 and lastName is Smith, password would be 2023001Smith)</li>

              <li>Instructors: lastName@123 (e.g., if lastName is Smith, password would be Smith@123)</li>
            </ol>
          </div>

         
        </CardContent>
      </Card>

      
    </div>
  );
}
