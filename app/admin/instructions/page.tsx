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
            <h3 className="font-medium mb-2">Adding a New Student</h3>
            <ol className="list-decimal pl-5 space-y-2">
              <li>Navigate to &lt;strong&gt;Manage Students&lt;/strong&gt; in the sidebar</li>
              <li>Click the &lt;strong&gt;Add Student&lt;/strong&gt; button</li>
              <li>Fill in the student&apos;s information</li>
              <li>Click &lt;strong&gt;Save&lt;/strong&gt; to add the student</li>
            </ol>
          </div>

          <div>
            <h3 className="font-medium mb-2">Editing a Student</h3>
            <ol className="list-decimal pl-5 space-y-2">
              <li>Go to &lt;strong&gt;Manage Students&lt;/strong&gt;</li>
              <li>Find the student in the list</li>
              <li>Click the &lt;strong&gt;Edit&lt;/strong&gt; button</li>
              <li>Make your changes and click &lt;strong&gt;Save&lt;/strong&gt;</li>
            </ol>
          </div>

          <div>
            <h3 className="font-medium mb-2">Deleting a Student</h3>
            <ol className="list-decimal pl-5 space-y-2">
              <li>Go to &lt;strong&gt;Manage Students&lt;/strong&gt;</li>
              <li>Find the student in the list</li>
              <li>Click the &lt;strong&gt;Delete&lt;/strong&gt; button</li>
              <li>Confirm the deletion when prompted</li>
            </ol>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Managing Instructors</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h3 className="font-medium mb-2">Adding a New Instructor</h3>
            <ol className="list-decimal pl-5 space-y-2">
              <li>Navigate to &lt;strong&gt;Manage Instructors&lt;/strong&gt; in the sidebar</li>
              <li>Click the &lt;strong&gt;Add Instructor&lt;/strong&gt; button</li>
              <li>Fill in the instructor&apos;s information</li>
              <li>Click &lt;strong&gt;Save&lt;/strong&gt; to add the instructor</li>
            </ol>
          </div>

          <div>
            <h3 className="font-medium mb-2">Editing an Instructor</h3>
            <ol className="list-decimal pl-5 space-y-2">
              <li>Go to <strong>Manage Instructors</strong></li>
              <li>Find the instructor in the list</li>
              <li>Click the <strong>Edit</strong> button</li>
              <li>Make your changes and click <strong>Save</strong></li>
            </ol>
          </div>

          <div>
            <h3 className="font-medium mb-2">Deleting an Instructor</h3>
            <ol className="list-decimal pl-5 space-y-2">
              <li>Go to <strong>Manage Instructors</strong></li>
              <li>Find the instructor in the list</li>
              <li>Click the <strong>Delete</strong> button</li>
              <li>Confirm the deletion when prompted</li>
            </ol>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
